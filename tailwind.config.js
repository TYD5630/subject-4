/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Satoshi', 'system-ui', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0c0c0c',
          secondary: '#141414',
          tertiary: '#1e1e1e',
          card: '#181818',
          hover: '#222222',
        },
        text: {
          primary: '#f5f5f0',
          secondary: '#a3a3a3',
          muted: '#6b6b6b',
        },
        accent: {
          DEFAULT: '#eab308',
          hover: '#facc15',
          subtle: 'rgba(234, 179, 8, 0.08)',
          glow: 'rgba(234, 179, 8, 0.15)',
        },
        success: {
          DEFAULT: '#22c55e',
          subtle: 'rgba(34, 197, 94, 0.1)',
        },
        danger: {
          DEFAULT: '#ef4444',
          subtle: 'rgba(239, 68, 68, 0.1)',
        },
        info: {
          DEFAULT: '#3b82f6',
          subtle: 'rgba(59, 130, 246, 0.1)',
        },
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(234, 179, 8, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-right': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'slide-right': 'slide-right 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
