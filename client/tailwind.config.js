export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Teal
          600: '#0d9488',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        navy: {
          900: '#0B1220', // Deep Navy Primary
          800: '#111827', // Secondary
          700: '#172033', // Surface
          600: '#1e293b',
          500: '#334155',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(20, 184, 166, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(20, 184, 166, 0.6)' },
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'neon': '0 0 10px rgba(20, 184, 166, 0.5)',
      }
    },
  },
  plugins: [],
}
