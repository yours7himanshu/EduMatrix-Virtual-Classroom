/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'gradient': 'gradient 3s ease infinite',
        'pulse-border': 'pulse-border 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'pulse-border': {
          '0%': { 'box-shadow': '0 0 0 0 rgba(139, 92, 246, 0.7)' },
          '70%': { 'box-shadow': '0 0 0 6px rgba(139, 92, 246, 0)' },
          '100%': { 'box-shadow': '0 0 0 0 rgba(139, 92, 246, 0)' }
        }
      }
    },
  },
  plugins: [],
}