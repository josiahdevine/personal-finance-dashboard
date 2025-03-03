# Design System

## Colors

### Primary Colors
```typescript
export const colors = {
  primary: {
    gradient: ['#0EA5E9', '#2563EB'],
    solid: '#2563EB',
    light: '#60A5FA',
    dark: '#1E40AF',
  },
  secondary: {
    main: '#8B5CF6',
    light: '#A78BFA',
    dark: '#6D28D9',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },
}
```

### Background Colors
```typescript
export const backgrounds = {
  light: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
  },
  dark: {
    primary: '#0F172A',
    secondary: '#1E293B',
    tertiary: '#334155',
  },
}
```

## Typography

### Font Family
- Primary: `'Inter var', sans-serif`
- Monospace: `'JetBrains Mono', monospace`

### Font Sizes
```typescript
export const typography = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
}
```

## Spacing

### Scale
```typescript
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  2: '0.5rem',      // 8px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
}
```

## Animations

### Durations
```typescript
export const durations = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  slower: '500ms',
}
```

### Easings
```typescript
export const easings = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
}
```

## Shadows
```typescript
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
}
```

## Border Radius
```typescript
export const radius = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  full: '9999px',
}
```

## Component Patterns

### Buttons
```typescript
export const buttonStyles = {
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  },
  variants: {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
  },
}
```

### Cards
```typescript
export const cardStyles = {
  base: 'bg-white dark:bg-gray-800 rounded-lg shadow transition-shadow hover:shadow-md',
  padding: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
}
```

### Form Fields
```typescript
export const inputStyles = {
  base: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  },
}
```

## Usage Guidelines

### Responsive Design
- Use mobile-first approach
- Implement breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

### Dark Mode
- Implement using Tailwind's dark mode
- Use semantic color tokens
- Test both modes for contrast

### Animation Best Practices
- Use hardware-accelerated properties
- Implement reduced motion alternatives
- Keep animations under 300ms for UI feedback

### Accessibility
- Maintain WCAG 2.1 AA standards
- Use semantic HTML
- Implement proper ARIA attributes
- Support keyboard navigation 