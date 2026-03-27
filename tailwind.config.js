/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glass: {
          DEFAULT: 'rgba(18, 18, 26, 0.72)',
          border: 'rgba(255, 255, 255, 0.08)',
          highlight: 'rgba(255, 255, 255, 0.05)',
        },
        accent: {
          DEFAULT: '#6366f1',
          secondary: '#8b5cf6',
          tertiary: '#06b6d4',
        },
        surface: {
          1: '#0a0a0f',
          2: '#12121a',
          3: '#1a1a25',
        },
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.4)',
      },
      animation: {
        'omni-enter': 'omniEnter 200ms ease-out',
        'widget-slide': 'widgetSlideIn 300ms ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        omniEnter: {
          '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        widgetSlideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
