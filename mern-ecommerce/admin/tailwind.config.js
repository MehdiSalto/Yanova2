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
          50: 'rgb(var(--admin-dark-50) / <alpha-value>)',
          100: 'rgb(var(--admin-dark-100) / <alpha-value>)',
          200: 'rgb(var(--admin-dark-200) / <alpha-value>)',
          300: 'rgb(var(--admin-dark-300) / <alpha-value>)',
          400: 'rgb(var(--admin-dark-400) / <alpha-value>)',
          500: 'rgb(var(--admin-dark-500) / <alpha-value>)',
          600: 'rgb(var(--admin-dark-600) / <alpha-value>)',
          700: 'rgb(var(--admin-dark-700) / <alpha-value>)',
          800: 'rgb(var(--admin-dark-800) / <alpha-value>)',
          900: 'rgb(var(--admin-dark-900) / <alpha-value>)',
          950: 'rgb(var(--admin-dark-950) / <alpha-value>)',
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
