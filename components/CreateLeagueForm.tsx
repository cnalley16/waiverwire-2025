'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CreateLeagueFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CreateLeagueForm({ onSuccess, onCancel }: CreateLeagueFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    teamName: '',
    password: '',
    maxTeams: 12,
    isPaid: false,
    entryFee: '',
    prizeAmount: '',
    draftType: 'LIVE_ONLINE',
    draftDate: '',
    seasonStartWeek: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create league')
      }

      const result = await response.json()
      
      // Redirect to the new league page
      router.push(`/leagues/${result.league.id}`)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating league:', error)
      alert('Failed to create league. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New League</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* League Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">League Information</h3>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              League Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter league name"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              League Password (optional)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Optional password for joining"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="maxTeams" className="block text-sm font-medium text-gray-700 mb-1">
                Max Teams
              </label>
              <select
                id="maxTeams"
                name="maxTeams"
                value={formData.maxTeams}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value={8}>8 Teams</option>
                <option value={10}>10 Teams</option>
                <option value={12}>12 Teams</option>
                <option value={14}>14 Teams</option>
                <option value={16}>16 Teams</option>
              </select>
            </div>

            <div>
              <label htmlFor="seasonStartWeek" className="block text-sm font-medium text-gray-700 mb-1">
                Season Start Week
              </label>
              <select
                id="seasonStartWeek"
                name="seasonStartWeek"
                value={formData.seasonStartWeek}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value={1}>Week 1</option>
                <option value={2}>Week 2</option>
                <option value={3}>Week 3</option>
                <option value={4}>Week 4</option>
              </select>
            </div>
          </div>
        </div>

        {/* Draft Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Draft Settings</h3>
          
          <div>
            <label htmlFor="draftType" className="block text-sm font-medium text-gray-700 mb-1">
              Draft Type
            </label>
            <select
              id="draftType"
              name="draftType"
              value={formData.draftType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="LIVE_ONLINE">Live Online Draft</option>
              <option value="LIVE_OFFLINE">Live Offline Draft</option>
              <option value="AUTOMATED">Auto Draft</option>
            </select>
          </div>

          <div>
            <label htmlFor="draftDate" className="block text-sm font-medium text-gray-700 mb-1">
              Draft Date & Time
            </label>
            <input
              type="datetime-local"
              id="draftDate"
              name="draftDate"
              value={formData.draftDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {/* Payment Settings */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPaid"
              name="isPaid"
              checked={formData.isPaid}
              onChange={handleInputChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="isPaid" className="ml-2 block text-sm font-medium text-gray-700">
              This is a paid league
            </label>
          </div>

          {formData.isPaid && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <label htmlFor="entryFee" className="block text-sm font-medium text-gray-700 mb-1">
                  Entry Fee ($)
                </label>
                <input
                  type="number"
                  id="entryFee"
                  name="entryFee"
                  min="0"
                  step="0.01"
                  value={formData.entryFee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="50.00"
                />
              </div>

              <div>
                <label htmlFor="prizeAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Prize Pool ($)
                </label>
                <input
                  type="number"
                  id="prizeAmount"
                  name="prizeAmount"
                  min="0"
                  step="0.01"
                  value={formData.prizeAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="400.00"
                />
              </div>
            </div>
          )}
        </div>

        {/* Team Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Your Team</h3>
          
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              required
              value={formData.teamName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter your team name"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isLoading ? 'Creating League...' : 'Create League'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out hover:bg-gray-50 hover:scale-105 hover:shadow-md"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
} 