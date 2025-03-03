/**
 * Application Theme Configuration
 * 
 * This file contains design tokens, colors, spacing, typography, and common component styles
 * to ensure a consistent visual language across the application.
 */

// Color palette based on a modern financial application
export const colors = {
  // Primary brand colors
  primary: {
    50: '#ebf5ff',
    100: '#e1efff', 
    200: '#c3dfff',
    300: '#a4cfff',
    400: '#6babff',
    500: '#3b82f6', // Main primary color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary brand colors - teal for positive financial indicators
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main secondary color
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  
  // Success colors - for positive transactions, growth, etc.
  success: {
    100: '#dcfce7',
    300: '#86efac',
    500: '#22c55e', // Main success color
    700: '#15803d',
    900: '#14532d',
  },
  
  // Warning colors - for alerts, notifications
  warning: {
    100: '#fef9c3',
    300: '#fde047',
    500: '#eab308', // Main warning color
    700: '#a16207',
    900: '#713f12',
  },
  
  // Danger/error colors - for negative transactions, errors
  danger: {
    100: '#fee2e2',
    300: '#fca5a5',
    500: '#ef4444', // Main danger color
    700: '#b91c1c',
    900: '#7f1d1d',
  },
  
  // Neutral colors for text, backgrounds, borders
  neutral: {
    50: '#f9fafb',  // Page background
    100: '#f3f4f6', // Card background
    200: '#e5e7eb', // Input background, borders
    300: '#d1d5db', // Disabled elements
    400: '#9ca3af', // Placeholder text
    500: '#6b7280', // Secondary text
    600: '#4b5563', // Primary text
    700: '#374151', // Headings
    800: '#1f2937', // Bold headings
    900: '#111827', // Emphasis text
  },
  
  // Specific UI colors
  chart: {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    pink: '#ec4899',
    teal: '#14b8a6',
    red: '#ef4444',
    yellow: '#f59e0b',
  }
};

// Spacing scale (in pixels) for consistent layout spacings
export const spacing = {
  0: '0',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px', // Base spacing unit
  5: '20px',
  6: '24px',
  7: '28px', 
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
};

// Typography configuration
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Shadows for elevation
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

// Border radius values
export const borderRadius = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',    // Fully rounded (circles)
};

// Common component styles
export const components = {
  // Button variants
  button: {
    base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500',
    link: 'text-primary-600 hover:text-primary-700 underline focus:ring-primary-500',
    sizes: {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
      xl: 'px-6 py-3 text-base',
    },
  },
  
  // Card styles
  card: {
    base: 'bg-white rounded-lg shadow overflow-hidden',
    flat: 'bg-white rounded-lg border border-gray-200',
    hover: 'transition-shadow duration-200 hover:shadow-md',
  },
  
  // Form element styles
  input: {
    base: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
    error: 'block w-full rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm',
    disabled: 'block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm text-gray-500 sm:text-sm',
  },
  
  // Table styles
  table: {
    base: 'min-w-full divide-y divide-gray-300',
    header: 'bg-gray-50',
    headerCell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    body: 'divide-y divide-gray-200 bg-white',
    row: 'hover:bg-gray-50',
    cell: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
    footer: 'bg-white',
  },
};

// Media query breakpoints
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Animation durations and easings
export const animation = {
  durations: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easings: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

// Default export combining all theme elements
const theme = {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  components,
  breakpoints,
  animation,
};

export default theme; 