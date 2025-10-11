/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        cyan: {
          400: '#00d1ff',
          500: '#00b8e6',
          600: '#0099cc',
        },
        emerald: {
          400: '#10b981',
          500: '#059669',
        },
        rose: {
          400: '#f43f5e',
          500: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-cyan': '0 0 24px rgba(0, 209, 255, 0.35)',
        'glow-emerald': '0 0 12px rgba(16, 185, 129, 0.9)',
        'glow-rose': '0 0 12px rgba(244, 63, 94, 0.9)',
      },
    },
  },
  plugins: [],
}
