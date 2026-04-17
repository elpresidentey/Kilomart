/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'page-enter': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'cart-pop': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.12)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'page-enter': 'page-enter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'fade-in': 'fade-in 0.35s ease-out both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'cart-pop': 'cart-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 1.2s ease-in-out infinite',
      },
      colors: {
        primary: {
          50: '#ecfdf7',
          100: '#d1faeb',
          200: '#a7f4d7',
          300: '#6fe7be',
          400: '#34d39e',
          500: '#08a170',
          600: '#078b62',
          700: '#0a704f',
          800: '#0c5941',
          900: '#0c4a37',
          950: '#05291f',
        },
        earth: {
          50: '#faf8f5',
          100: '#f2ede4',
          200: '#e6dac8',
          300: '#d4c0a1',
          400: '#c2a277',
          500: '#a88452',
          600: '#8b6b3e',
          700: '#705232',
          800: '#5c442d',
          900: '#4d3929',
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Segoe UI"', 'system-ui', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.02em',
      },
    },
  },
  plugins: [],
}
