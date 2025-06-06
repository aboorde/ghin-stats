import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { deleteRound } from '../services/roundEntryService'
import Layout from './Layout'
import { Button, Modal } from './atoms'
import { RoundTableRow, EmptyState } from './molecules'
import Loading from './ui/Loading'
import PageHeader from './ui/PageHeader'

const ManageRounds = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [rounds, setRounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [selectedRound, setSelectedRound] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [sortBy, setSortBy] = useState('date') // 'date', 'score', 'course'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  
  // Check if mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  useEffect(() => {
    if (user) {
      fetchRounds()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps
  
  const fetchRounds = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
      
      if (error) throw error
      setRounds(data || [])
    } catch (err) {
      console.error('Error fetching rounds:', err)
      setError('Failed to load rounds')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteClick = (round) => {
    setSelectedRound(round)
    setShowDeleteModal(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!selectedRound) return
    
    try {
      setDeleting(true)
      const result = await deleteRound(selectedRound.id)
      
      if (result.success) {
        // Remove the round from local state
        setRounds(rounds.filter(r => r.id !== selectedRound.id))
        setShowDeleteModal(false)
        setSelectedRound(null)
      } else {
        setError(result.error || 'Failed to delete round')
      }
    } catch (err) {
      console.error('Error deleting round:', err)
      setError('Failed to delete round')
    } finally {
      setDeleting(false)
    }
  }
  
  // Sort rounds
  const sortedRounds = [...rounds].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(b.played_at) - new Date(a.played_at)
        break
      case 'score':
        comparison = a.adjusted_gross_score - b.adjusted_gross_score
        break
      case 'course':
        comparison = a.course_name.localeCompare(b.course_name)
        break
      default:
        comparison = 0
    }
    
    return sortOrder === 'asc' ? comparison * -1 : comparison
  })
  
  // Group rounds by month/year for better organization
  const groupedRounds = sortedRounds.reduce((groups, round) => {
    const date = new Date(round.played_at)
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    
    if (!groups[monthYear]) {
      groups[monthYear] = []
    }
    groups[monthYear].push(round)
    
    return groups
  }, {})
  
  if (loading) return <Loading />
  
  return (
    <Layout>
      <div className="min-h-screen">
        <PageHeader 
          title="Manage Rounds"
          subtitle="View and delete your golf rounds"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400">
              {error}
            </div>
          )}
          
          {/* Actions Bar */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/add-round')}
                variant="primary"
                size="medium"
              >
                + Add New Round
              </Button>
              
              <div className="text-sm text-gray-400">
                {rounds.length} {rounds.length === 1 ? 'round' : 'rounds'} total
              </div>
            </div>
            
            {!isMobile && rounds.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="date">Date</option>
                  <option value="score">Score</option>
                  <option value="course">Course</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 text-gray-400 hover:text-white"
                  aria-label="Toggle sort order"
                >
                  {sortOrder === 'asc' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/* Rounds Display */}
          {rounds.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
              title="No rounds yet"
              description="Start tracking your golf rounds to see them here"
              action={
                <Button
                  onClick={() => navigate('/add-round')}
                  variant="primary"
                >
                  Add Your First Round
                </Button>
              }
            />
          ) : isMobile ? (
            /* Mobile Card View */
            <div>
              {Object.entries(groupedRounds).map(([monthYear, monthRounds]) => (
                <div key={monthYear} className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-400 mb-3">{monthYear}</h3>
                  {monthRounds.map(round => (
                    <RoundTableRow
                      key={round.id}
                      round={round}
                      onDelete={handleDeleteClick}
                      isMobile={true}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            /* Desktop Table View */
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      vs Par
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Differential
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Holes
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {sortedRounds.map(round => (
                    <RoundTableRow
                      key={round.id}
                      round={round}
                      onDelete={handleDeleteClick}
                      isMobile={false}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Round"
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Round'}
              </Button>
            </div>
          }
        >
          <p className="text-gray-300">
            Are you sure you want to delete this round?
          </p>
          {selectedRound && (
            <div className="mt-4 p-3 bg-gray-900 rounded-lg">
              <p className="text-sm text-white font-medium">{selectedRound.course_name}</p>
              <p className="text-xs text-gray-400">
                {new Date(selectedRound.played_at).toLocaleDateString()} • 
                Score: {selectedRound.adjusted_gross_score}
              </p>
            </div>
          )}
          <p className="mt-4 text-sm text-yellow-400">
            This action cannot be undone. All hole details and statistics for this round will be permanently deleted.
          </p>
        </Modal>
      </div>
    </Layout>
  )
}

export default ManageRounds