/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf7ed',
          100: '#f5ebd0',
          200: '#ead4a1',
          300: '#dfbd72',
          400: '#d4a64a',
          500: '#c4922b',
          600: '#a8761f',
          700: '#85591a',
          800: '#6c481a',
          900: '#5b3b19',
        },
        dark: {
          50: '#f7f7f8',
          100: '#e1e1e6',
          200: '#c2c2cc',
          300: '#9d9dab',
          400: '#777789',
          500: '#5d5d6e',
          600: '#494957',
          700: '#3c3c47',
          800: '#2a2a32',
          900: '#1c1c22',
          950: '#121216',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
