/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        admin: {
          brand: {
            50: '#EEF2FF',
            100: '#E0E7FF',
            200: '#C7D2FE',
            500: '#6366F1',
            600: '#4F46E5',
            700: '#4338CA',
            800: '#3730A3',
            900: '#312E81',
          },
          slate: {
            25: '#FCFCFD',
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          },
          emerald: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
          },
          amber: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
          },
          rose: {
            50: '#FFF1F2',
            100: '#FFE4E6',
            500: '#F43F5E',
            600: '#E11D48',
            700: '#BE123C',
          },
          sky: {
            50: '#F0F9FF',
            100: '#E0F2FE',
            500: '#0EA5E9',
            600: '#0284C7',
            700: '#0369A1',
          },
        },
      },
      boxShadow: {
        'admin-xs': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'admin-sm': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'admin-card': '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)',
        'admin-dropdown': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
      },
      borderRadius: {
        'admin': '0.75rem',
      },
    },
  },
  plugins: [],
}

