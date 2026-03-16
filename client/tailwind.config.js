/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: 'rgba(255, 255, 255, 0.1)',
          850: 'rgba(0, 0, 0, 0.4)',
          900: 'rgba(255, 255, 255, 0.02)',
          950: '#030014',
        },
        accent: {
          400: '#a855f7',
          500: '#8b5cf6',
          600: '#6d28d9',
          secondary: '#3b82f6',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'orb-float': 'orbFloat 20s infinite alternate cubic-bezier(0.5, 0, 0.5, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        orbFloat: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(50px, -50px) scale(1.1)' },
          '100%': { transform: 'translate(-50px, 30px) scale(0.9)' },
        }
      },
    },
  },
  plugins: [],
}
