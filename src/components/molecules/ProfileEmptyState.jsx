import React from 'react'
import Card from '../ui/Card'
import Button from '../atoms/Button'

/**
 * ProfileEmptyState - Displays when a user has no golf rounds recorded
 * 
 * @param {Function} onEditProfile - Callback when Edit Profile is clicked
 * @param {string} className - Additional CSS classes
 */
const ProfileEmptyState = ({ 
  onEditProfile,
  className = ''
}) => {
  return (
    <Card variant="elevated" className={`text-center py-16 px-8 bg-gradient-to-br from-slate-900/95 to-pink-950/10 border-pink-900/40 ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Golf icon */}
        <div className="text-6xl mb-6 opacity-50">🏌️</div>
        
        {/* Main message */}
        <h3 className="text-2xl font-bold text-white mb-3">
          No Rounds Recorded Yet
        </h3>
        
        {/* Submessage */}
        <p className="text-lg text-pink-300/70 mb-8">
          Start tracking your golf journey by importing your rounds or manually entering scores.
        </p>
        
        {/* CTA Button */}
        <Button 
          variant="primary" 
          size="large"
          onClick={onEditProfile}
          icon="⚙️"
        >
          Edit Profile & Import Data
        </Button>
        
        {/* Additional help text */}
        <p className="text-sm text-pink-300/50 mt-6">
          You can import your golf data from external services or add rounds manually
        </p>
      </div>
    </Card>
  )
}

export default ProfileEmptyState