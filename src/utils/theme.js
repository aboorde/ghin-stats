// Golf-themed dark mode color palette
export const theme = {
  colors: {
    // Primary colors - Deep golf greens
    primary: {
      50: '#e6f4ea',
      100: '#c3e6cc',
      200: '#9bd7ab',
      300: '#70c886',
      400: '#4aba68',
      500: '#1ea446', // Main green
      600: '#168c39',
      700: '#0f7430',
      800: '#0a5c26',
      900: '#064920',
    },
    // Accent colors - Championship gold
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24', // Main gold
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    // Dark mode backgrounds
    dark: {
      50: '#1a1f2e',   // Lightest dark
      100: '#151922',  // Card background
      200: '#111318',  // Main background
      300: '#0d0f14',  // Darkest
      400: '#232937',  // Hover states
      500: '#2d3548',  // Borders
    },
    // Semantic colors
    success: '#10b981', // Birdie/Eagle
    warning: '#f59e0b', // Par
    danger: '#ef4444',  // Bogey+
    info: '#3b82f6',    // Stats
    
    // Text colors
    text: {
      primary: '#f9fafb',
      secondary: '#e5e7eb',
      muted: '#9ca3af',
      inverse: '#111827',
    },
    
    // Special golf colors
    fairway: '#2d5016',
    rough: '#3a4f1f',
    bunker: '#d4a574',
    water: '#1e3a5f',
  },
  
  // Consistent spacing
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  
  // Border radius
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  
  // Shadows for depth
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  }
}

// Utility function to get score color based on performance
export const getScoreColor = (score, par, holes = 18) => {
  const overPar = score - (par * holes / 18)
  if (overPar <= 0) return 'text-green-400' // Under par
  if (overPar <= 5) return 'text-yellow-400' // Slightly over
  if (overPar <= 10) return 'text-orange-400' // Moderately over
  return 'text-red-400' // Significantly over
}

// Chart theme configuration
export const chartTheme = {
  backgroundColor: 'transparent',
  textColor: '#e5e7eb',
  gridColor: '#374151',
  tooltipStyle: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '0.5rem',
    padding: '0.5rem',
  },
  colors: ['#10b981', '#fbbf24', '#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b'],
}