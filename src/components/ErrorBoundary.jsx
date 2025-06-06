import React from 'react'
import Card from './ui/Card'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
      retryCount: this.state.retryCount + 1
    })
  }

  handleReset = () => {
    // Clear the error state
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  handleHardReset = () => {
    // Clear all storage and reload
    try {
      // Clear all localStorage
      localStorage.clear()
      
      // Clear all sessionStorage
      sessionStorage.clear()
      
      // Clear all cookies (best effort)
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/") 
      })
      
      // Force reload from root
      window.location.href = '/'
    } catch (err) {
      console.error('Error during hard reset:', err)
      // Fallback to simple reload
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // Error fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950/20 flex items-center justify-center p-4">
          <Card variant="elevated" className="max-w-lg w-full p-8 bg-gradient-to-br from-slate-900/95 to-pink-950/10 border-red-900/40">
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <div className="text-6xl">⚠️</div>
              
              {/* Title */}
              <h1 className="text-2xl font-bold text-red-400">Oops! Something went wrong</h1>
              
              {/* Error message */}
              <div className="text-pink-300/70 space-y-2">
                <p>We encountered an unexpected error while loading the application.</p>
                {this.state.retryCount > 1 && (
                  <p className="text-red-400 text-sm">
                    Multiple errors detected. You may need to clear your browser data.
                  </p>
                )}
              </div>
              
              {/* Error details (development only) */}
              {window.location.hostname === 'localhost' && this.state.error && (
                <details className="text-left bg-slate-950/60 p-4 rounded-lg border border-pink-900/30">
                  <summary className="cursor-pointer text-pink-400 text-sm font-medium">
                    Error Details (Development Mode)
                  </summary>
                  <pre className="mt-2 text-xs text-pink-300/60 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-6 py-3 bg-gradient-to-br from-pink-500 to-pink-700 text-white font-medium rounded-lg shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40 hover:from-pink-400 hover:to-pink-600 transition-all duration-200"
                >
                  Try Again
                </button>
                
                <button
                  onClick={this.handleHardReset}
                  className="px-6 py-3 bg-gradient-to-br from-red-600 to-red-800 text-white font-medium rounded-lg shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-500 hover:to-red-700 transition-all duration-200"
                >
                  Clear All Data & Reload
                </button>
              </div>
              
              {/* Help text */}
              <p className="text-xs text-pink-300/50">
                If the problem persists, try clearing your browser cache or using a different browser.
              </p>
            </div>
          </Card>
        </div>
      )
    }

    // No error, render children normally
    return this.props.children
  }
}

export default ErrorBoundary