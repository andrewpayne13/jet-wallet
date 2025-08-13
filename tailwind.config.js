/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'],
      },
      boxShadow: {
        glow: '0 10px 25px -5px rgba(59,130,246,0.25), 0 8px 10px -6px rgba(59,130,246,0.3)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 450ms cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.8s linear infinite',
      },
      colors: {
        ink: {
          1: '#0b1020',
          2: '#0f1428',
        },
      },
    },
  },
  plugins: [],
}
