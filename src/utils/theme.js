// Scratch Pad - Unique golf-themed dark mode branding
export const theme = {
  colors: {
    // Primary colors - Augusta-inspired azalea pink with golf green undertones
    primary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899', // Main brand color - Azalea pink
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    // Secondary colors - Masters green jacket inspired
    secondary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Classic golf green
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    // Accent colors - Trophy gold with warm undertones
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Champion gold
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    // Dark mode backgrounds - Midnight course inspired
    dark: {
      50: '#1e293b',   // Lightest dark - elevated surfaces
      100: '#0f172a',  // Card background
      200: '#020617',  // Main background - deep midnight
      300: '#000511',  // Darkest - pure night
      400: '#334155',  // Hover states
      500: '#475569',  // Borders
      600: '#64748b',  // Muted elements
    },
    // Semantic colors for golf scoring
    eagle: '#a78bfa',    // Purple - exceptional
    birdie: '#34d399',   // Green - great
    par: '#fbbf24',      // Gold - solid
    bogey: '#fb923c',    // Orange - okay
    double: '#f87171',   // Red - needs work
    triple: '#e11d48',   // Deep red - rough day
    
    // Text colors with better contrast
    text: {
      primary: '#f8fafc',   // Pure white for main text
      secondary: '#e2e8f0', // Slightly muted
      muted: '#94a3b8',     // Subtle text
      inverse: '#020617',   // For light backgrounds
      brand: '#ec4899',     // Brand color for emphasis
    },
    
    // Course element colors
    fairway: '#047857',   // Lush fairway green
    rough: '#065f46',     // Deeper rough green
    bunker: '#fde047',    // Sandy yellow
    water: '#0891b2',     // Water hazard blue
    green: '#10b981',     // Putting green
    tee: '#ec4899',       // Tee box (brand color)
    
    // UI state colors
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },
  
  // Consistent spacing
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    xxl: '4rem',
  },
  
  // Border radius for modern feel
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    xxl: '1.5rem',
    full: '9999px',
  },
  
  // Enhanced shadows for depth
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.7), 0 1px 2px 0 rgba(0, 0, 0, 0.6)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.7), 0 2px 4px -1px rgba(0, 0, 0, 0.6)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.6)',
    glow: '0 0 20px rgba(236, 72, 153, 0.5)', // Brand glow effect
  },
  
  // Smooth transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '300ms ease-in-out',
    slow: '500ms ease-in-out',
    spring: '500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Gradients for modern UI
  gradients: {
    brand: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    dark: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
    radial: 'radial-gradient(circle at top right, #1e293b 0%, #020617 100%)',
  }
}

// Utility function to get score color based on performance
export const getScoreColor = (score, par, holes = 18) => {
  const overPar = score - (par * holes / 18)
  if (overPar < -2) return 'text-purple-400'  // Eagle or better
  if (overPar < 0) return 'text-green-400'   // Under par
  if (overPar === 0) return 'text-yellow-400' // Par
  if (overPar <= 3) return 'text-orange-400'  // Slightly over
  if (overPar <= 6) return 'text-red-400'     // Moderately over
  return 'text-rose-600' // Significantly over
}

// Enhanced chart theme configuration
export const chartTheme = {
  backgroundColor: 'transparent',
  textColor: '#e2e8f0',
  gridColor: '#334155',
  tooltipStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid #ec4899',
    borderRadius: '0.75rem',
    padding: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.7)',
  },
  colors: [
    '#ec4899', // Brand pink
    '#10b981', // Golf green
    '#fbbf24', // Trophy gold
    '#60a5fa', // Sky blue
    '#a78bfa', // Purple
    '#f87171', // Coral red
  ],
}

// Score type colors for consistency
export const scoreTypeColors = {
  eagle: '#a78bfa',
  birdie: '#34d399',
  par: '#fbbf24',
  bogey: '#fb923c',
  doubleBogey: '#f87171',
  triplePlus: '#e11d48',
}

// Component-specific theme variants
export const componentThemes = {
  card: {
    background: theme.colors.dark[100],
    border: theme.colors.dark[500],
    hover: theme.colors.dark[400],
  },
  button: {
    primary: {
      background: theme.colors.primary[500],
      hover: theme.colors.primary[600],
      active: theme.colors.primary[700],
    },
    secondary: {
      background: theme.colors.secondary[600],
      hover: theme.colors.secondary[700],
      active: theme.colors.secondary[800],
    },
  },
  input: {
    background: theme.colors.dark[50],
    border: theme.colors.dark[500],
    focus: theme.colors.primary[500],
  },
}