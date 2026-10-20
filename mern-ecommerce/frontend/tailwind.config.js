/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        // Gold accent — used across storefront (buttons, highlights, eyebrows)
        gold: {
          400: '#FCD34D',
          500: '#FBBF24',
          600: '#F5A623',
        },
        // Kept as an alias so existing "primary-*" classes across the app
        // resolve to the same gold palette used in the reference design.
        primary: {
          400: '#FCD34D',
          500: '#FBBF24',
          600: '#F5A623',
        },
        // Dark surface tones — used for dark sections
        dark: {
          900: '#111111',
          950: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};
