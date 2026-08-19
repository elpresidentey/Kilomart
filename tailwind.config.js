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
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 8px -1px rgba(15, 23, 42, 0.06)',
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)',
        float: '0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 16px 40px -12px rgba(15, 23, 42, 0.16)',
        overlay: '0 24px 64px -12px rgba(15, 23, 42, 0.22)',
        'glow-primary': '0 10px 30px -10px rgba(7, 139, 98, 0.45), 0 2px 8px -2px rgba(7, 139, 98, 0.25)',
        'glow-leaf': '0 10px 30px -12px rgba(99, 173, 60, 0.45)',
        'glow-amber': '0 10px 30px -12px rgba(217, 119, 6, 0.4)',
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-16px) rotate(1.5deg)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.25)', opacity: '0' },
          '100%': { transform: 'scale(1.25)', opacity: '0' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'grow-line': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'page-enter': 'page-enter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'fade-in': 'fade-in 0.35s ease-out both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'cart-pop': 'cart-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 1.2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'gradient-x': 'gradient-x 6s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
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
        leaf: {
          50: '#f4f9ef',
          100: '#e5f2da',
          200: '#cce5b9',
          300: '#a8d28e',
          400: '#82bc63',
          500: '#63a743',
          600: '#4c8632',
          700: '#3c672a',
          800: '#335326',
          900: '#2b4622',
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
        sans: ['Inter', '"Segoe UI"', 'system-ui', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Fraunces', 'Georgia', '"Times New Roman"', 'serif'],
      },
      letterSpacing: {
        tighter: '-0.02em',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
      },
    },
  },
  plugins: [],
}
