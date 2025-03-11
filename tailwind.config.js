/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // shadcn/ui colors
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          // Keep existing shades for backwards compatibility
          50: '#E6EEFF',
          100: '#C2D4FF',
          200: '#99B3FF',
          300: '#6690FF',
          400: '#3366FF', // Main primary color
          500: '#1A4DFF',
          600: '#0033CC',
          700: '#002299',
          800: '#001166',
          900: '#000033',
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          // Keep existing shades for backwards compatibility
          50: '#E6FAF5',
          100: '#B3F1E3',
          200: '#80E9D2',
          300: '#4DE0C0',
          400: '#00C48C', // Main secondary color
          500: '#00A376',
          600: '#008260',
          700: '#006249',
          800: '#004133',
          900: '#00201A',
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          // Keep existing shades for backwards compatibility
          50: '#FFEAEA',
          100: '#FFCCCC',
          200: '#FFADAD',
          300: '#FF8D8D',
          400: '#FF6B6B', // Main accent color
          500: '#FF4747',
          600: '#E60000',
          700: '#B30000',
          800: '#800000',
          900: '#4D0000',
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // Keep existing neutral colors
        neutral: {
          50: '#F7F9FC',  // Background light
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
        // Dark Mode Colors
        dark: {
          background: '#1A1F36',
          surface: '#252D43',
          text: '#E4E9F2',
        },
        // Investment Type Colors
        investment: {
          stocks: '#3366FF',
          bonds: '#8295B3',
          cash: '#00C48C',
          realEstate: '#FFAA00',
          crypto: '#9966FF',
          commodities: '#FF6B6B',
        },
        // Performance Colors
        performance: {
          strongPositive: '#00A376',
          positive: '#00C48C',
          neutral: '#8295B3',
          negative: '#FF6B6B',
          strongNegative: '#E60000',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slideUp': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slideDown': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scaleIn': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'gradient-x': 'gradient-x 15s ease infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-in-out',
        'spinner': 'spin 1s linear infinite',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'decelerate': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'accelerate': 'cubic-bezier(0.4, 0.0, 1, 1)',
      },
      transitionDuration: {
        'xs': '100ms',
        'sm': '150ms',
        'md': '200ms',
        'lg': '300ms',
        'xl': '500ms',
      },
      spacing: {
        'xs': '0.25rem',  /* 4px */
        'sm': '0.5rem',   /* 8px */
        'md': '1rem',     /* 16px */
        'lg': '1.5rem',   /* 24px */
        'xl': '2rem',     /* 32px */
        '2xl': '3rem',    /* 48px */
        '3xl': '4rem',    /* 64px */
      },
      boxShadow: {
        'elevation-1': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'elevation-2': '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.07)',
        'elevation-3': '0 4px 8px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.07)',
        'elevation-4': '0 8px 16px rgba(0, 0, 0, 0.05), 0 4px 8px rgba(0, 0, 0, 0.07)',
        'elevation-5': '0 16px 32px rgba(0, 0, 0, 0.05), 0 8px 16px rgba(0, 0, 0, 0.07)',
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', '"Inter"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"SF Mono"', '"Roboto Mono"', '"SFMono-Regular"', 'Consolas', '"Liberation Mono"', 'Menlo', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require('@tailwindcss/forms')],
}