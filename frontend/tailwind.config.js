/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0a0b0f',
          800: '#0f1117',
          700: '#161b27',
          600: '#1c2333',
          500: '#252d3d',
          400: '#2e3a50',
        },
        accent: {
          DEFAULT: '#00d4aa',
          dark: '#00a882',
          light: '#33ddb9',
          glow: 'rgba(0, 212, 170, 0.15)',
        },
        profit: '#00d4aa',
        loss: '#ff4d6d',
        warning: '#ffb347',
        info: '#4dabf7',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 170, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.4)' },
        }
      },
      boxShadow: {
        'accent': '0 0 30px rgba(0, 212, 170, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
