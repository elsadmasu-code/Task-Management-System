/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        dark: {
          50: '#f8fafc',
          100: '#1e293b',
          200: '#1a2235',
          300: '#151c2e',
          400: '#111827',
          500: '#0d1117',
          600: '#0a0d14',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'bounce-in': 'bounceIn 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { from: { transform: 'translateX(20px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        bounceIn: { '0%': { transform: 'scale(0.8)', opacity: '0' }, '80%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 5px rgba(99,102,241,0.4)' }, '50%': { boxShadow: '0 0 20px rgba(99,102,241,0.8)' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        card: '0 4px 24px rgba(0,0,0,0.12)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.2)',
        glow: '0 0 20px rgba(99,102,241,0.4)',
      },
    },
  },
  plugins: [],
};
