'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import PlayersList from '@/components/PlayersList'

interface Player {
  id: string
  first_name: string
  last_name: string
  display_name: string
  position: string
  nfl_team: string
  jersey_number?: number
  is_active: boolean
  injury_status: string
}

interface DashboardStats {
  totalPlayers: number
  activeInjuries: number
  topPerformers: Player[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [stats, setStats] = useState<DashboardStats>({ totalPlayers: 0, activeInjuries: 0, topPerformers: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState<'overview' | 'players'>('overview')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/players')
      if (response.ok) {
        const data = await response.json()
        const playersData = data.data || data || []
        setPlayers(playersData)
        
        // Calculate stats
        const totalPlayers = playersData.length
        const activeInjuries = playersData.filter((p: Player) => p.injury_status !== 'HEALTHY').length
        const topPerformers = playersData.slice(0, 3) // Top 3 for display
        
        setStats({ totalPlayers, activeInjuries, topPerformers })
      } else {
        console.error('Failed to fetch players data')
        setPlayers([])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setPlayers([])
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Fantasy Football Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {session?.user?.name || 'User'}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveView('overview')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === 'overview' 
                      ? 'bg-red-100 text-red-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveView('players')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === 'players' 
                      ? 'bg-red-100 text-red-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Players
                </button>
              </nav>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeView === 'overview' ? (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Players</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalPlayers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Injury Concerns</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeInjuries}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Database Status</p>
                    <p className="text-2xl font-semibold text-green-600">Connected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Featured Players</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.topPerformers.map((player) => (
                    <div key={player.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{player.display_name}</h4>
                          <p className="text-sm text-gray-600">{player.position} • {player.nfl_team}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block w-3 h-3 rounded-full ${
                            player.injury_status === 'HEALTHY' ? 'bg-green-400' : 'bg-yellow-400'
                          }`}></span>
                          <p className="text-xs text-gray-500 mt-1">#{player.jersey_number}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveView('players')}
                  className="bg-red-600 text-white px-4 py-3 rounded-md hover:bg-red-700 transition-colors text-center"
                >
                  🏈 View All Players
                </button>
                <button
                  onClick={() => window.open('/api/players', '_blank')}
                  className="bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors text-center"
                >
                  📊 API Data
                </button>
                <button
                  onClick={() => fetchDashboardData()}
                  className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors text-center"
                >
                  🔄 Refresh Data
                </button>
                <button
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors text-center"
                >
                  🗄️ Database
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    <span className="text-gray-600">Database connection established</span>
                    <span className="ml-auto text-gray-400">Just now</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    <span className="text-gray-600">Sample players loaded successfully</span>
                    <span className="ml-auto text-gray-400">Just now</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                    <span className="text-gray-600">Authentication system activated</span>
                    <span className="ml-auto text-gray-400">Just now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <PlayersList />
        )}
      </div>
    </div>
  )
} 