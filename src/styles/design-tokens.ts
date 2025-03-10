/**
 * Design Tokens
 * Based on Finance Intelligence Suite - Comprehensive UI Enhancement Strategy
 */

// 1.1.2 Spatial System
export const spacing = {
  xs: '0.25rem',  /* 4px */
  sm: '0.5rem',   /* 8px */
  md: '1rem',     /* 16px */
  lg: '1.5rem',   /* 24px */
  xl: '2rem',     /* 32px */
  '2xl': '3rem',  /* 48px */
  '3xl': '4rem',  /* 64px */
};

export const breakpoints = {
  xs: '20rem',   /* 320px - Small mobile */
  sm: '30rem',   /* 480px - Mobile */
  md: '48rem',   /* 768px - Tablet */
  lg: '64rem',   /* 1024px - Desktop */
  xl: '80rem',   /* 1280px - Large desktop */
  '2xl': '96rem', /* 1536px - Extra large desktop */
};

// 1.1.3 Elevation System
export const elevation = {
  1: '0 1px 2px rgba(0, 0, 0, 0.05)',
  2: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.07)',
  3: '0 4px 8px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.07)',
  4: '0 8px 16px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.07)',
  5: '0 16px 32px rgba(0, 0, 0, 0.05), 0 8px 16px rgba(0, 0, 0, 0.07)',
};

// 1.2 Color System
export const colors = {
  // 1.2.1 Primary Palette
  blue: {
    50: '#E6EEFF',
    100: '#C2D4FF',
    200: '#99B3FF',
    300: '#6690FF',
    400: '#3366FF', /* Primary */
    500: '#1A4DFF',
    600: '#0033CC',
    700: '#002299',
    800: '#001166',
    900: '#000033',
  },
  
  green: {
    50: '#E6FAF5',
    100: '#B3F1E3',
    200: '#80E9D2',
    300: '#4DE0C0',
    400: '#00C48C', /* Secondary */
    500: '#00A376',
    600: '#008260',
    700: '#006249',
    800: '#004133',
    900: '#00201A',
  },
  
  red: {
    50: '#FFEAEA',
    100: '#FFCCCC',
    200: '#FFADAD',
    300: '#FF8D8D',
    400: '#FF6B6B', /* Accent */
    500: '#FF4747',
    600: '#E60000',
    700: '#B30000',
    800: '#800000',
    900: '#4D0000',
  },
  
  neutral: {
    50: '#F7F9FC', /* Background Light */
    100: '#EAF0F7',
    200: '#DCE3ED',
    300: '#C8D3E5',
    400: '#A3B4CC',
    500: '#8295B3',
    600: '#61759A',
    700: '#465A7D',
    800: '#304060',
    900: '#1A2643',
  },
  
  // 1.2.3 Dark Mode Palette
  dark: {
    background: '#1A1F36',
    surface: '#252D43',
    text: '#E4E9F2',
  },
  
  // 1.2.5 Financial Data Color System
  investment: {
    stocks: '#3366FF',
    bonds: '#8295B3',
    cash: '#00C48C',
    realEstate: '#FFAA00',
    crypto: '#9966FF',
    commodities: '#FF6B6B',
  },
  
  performance: {
    strongPositive: '#00A376',
    positive: '#00C48C',
    neutral: '#8295B3',
    negative: '#FF6B6B',
    strongNegative: '#E60000',
  },
};

// 1.3 Typography System
export const typography = {
  // 1.3.1 Font Families
  fontFamily: {
    sans: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    mono: '"SF Mono", "Roboto Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace',
  },
  
  // 1.3.2 Type Scale
  fontSize: {
    xs: '0.75rem',    /* 12px */
    sm: '0.875rem',   /* 14px */
    base: '1rem',     /* 16px */
    lg: '1.125rem',   /* 18px */
    xl: '1.25rem',    /* 20px */
    '2xl': '1.5rem',  /* 24px */
    '3xl': '1.875rem', /* 30px */
    '4xl': '2.25rem', /* 36px */
    '5xl': '3rem',    /* 48px */
    '6xl': '3.75rem', /* 60px */
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
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Animation timing
export const animation = {
  timing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },
  duration: {
    xs: '100ms',
    sm: '150ms',
    md: '200ms',
    lg: '300ms',
    xl: '500ms',
  }
}; 