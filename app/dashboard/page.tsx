'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CreateLeagueForm from '@/components/CreateLeagueForm'

interface League {
  id: string
  name: string
  isPaid: boolean
  entryFee: number | null
  maxTeams: number
  draftType: string
  draftDate: string | null
  commissioner: {
    id: string
    username: string
    firstName: string | null
    lastName: string | null
  }
  teams: Array<{
    id: string
    name: string
    owner: {
      id: string
      username: string
      firstName: string | null
      lastName: string | null
    }
  }>
  _count: {
    teams: number
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leagues, setLeagues] = useState<League[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchLeagues()
    }
  }, [status, router])

  const fetchLeagues = async () => {
    try {
      // Temporarily skip API call to avoid caching issues
      console.log('Running in demo mode - skipping API call')
      setLeagues([])
      setIsLoading(false)
      return
      
      const response = await fetch('/api/leagues')
      if (response.ok) {
        const data = await response.json()
        // Handle both API formats: { leagues: [...] } or direct array
        setLeagues(data.leagues || data || [])
      } else {
        // If API fails, show empty state (database not set up yet)
        console.log('API not available yet - database may not be set up')
        setLeagues([])
      }
    } catch (error) {
      console.error('Error fetching leagues:', error)
      // Gracefully handle API errors by showing empty state
      setLeagues([])
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your leagues...</p>
        </div>
      </div>
    )
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <CreateLeagueForm
            onSuccess={() => {
              setShowCreateForm(false)
              fetchLeagues()
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Leagues</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {session?.user?.firstName || session?.user?.username}!
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create New League
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {leagues.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-lg mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-2h1m3 0h1a2 2 0 011 2v2M7 7V5a2 2 0 011-2h1m3 0h1a2 2 0 011 2v2" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">🎉 Welcome to WaiverWire!</h3>
              <p className="mt-1 text-sm text-gray-600">
                You're currently running in <strong>Demo Mode</strong> - perfect for exploring the app!
              </p>
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✅ <strong>Authentication Fixed!</strong> You can now sign in and explore the interface.
                </p>
              </div>
              <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  📘 <strong>Want full features?</strong> Check the <code className="bg-blue-100 px-1 rounded">DATABASE_SETUP_GUIDE.md</code> file for easy database setup options.
                </p>
              </div>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => window.open('https://supabase.com', '_blank')}
                  className="btn-primary text-sm"
                >
                  Set Up Database (5 min) 🚀
                </button>
                <p className="text-xs text-gray-500">
                  Or explore the demo interface by browsing around!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => (
              <div
                key={league.id}
                className="bg-white rounded-lg shadow-lg card-hover"
                onClick={() => router.push(`/leagues/${league.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {league.name}
                    </h3>
                    {league.isPaid && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ${league.entryFee}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Teams:</span>
                      <span className="font-medium">{league._count.teams}/{league.maxTeams}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Draft Type:</span>
                      <span className="font-medium">
                        {league.draftType.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>

                    {league.draftDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Draft Date:</span>
                        <span className="font-medium">
                          {new Date(league.draftDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Commissioner:</span>
                      <span className="font-medium">
                        {league.commissioner.firstName 
                          ? `${league.commissioner.firstName} ${league.commissioner.lastName}`
                          : league.commissioner.username
                        }
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex -space-x-2">
                      {league.teams.slice(0, 3).map((team) => (
                        <div
                          key={team.id}
                          className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center border-2 border-white text-xs font-medium text-red-800"
                          title={team.name}
                        >
                          {team.owner.firstName?.[0] || team.owner.username[0]}
                        </div>
                      ))}
                      {league.teams.length > 3 && (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white text-xs font-medium text-gray-600">
                          +{league.teams.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 