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
          borderHover: 'rgba(255, 255, 255, 0.14)',
          highlight: 'rgba(255, 255, 255, 0.08)',
          active: 'rgba(255, 255, 255, 0.15)',
        },
        surface: {
          1: '#0a0a0f',
          2: '#12121a',
          3: '#18181f',
        },
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'glass-surface': '0 2px 8px rgba(0, 0, 0, 0.16)',
        'glass-card': '0 4px 16px rgba(0, 0, 0, 0.20)',
        'glass-modal': '0 12px 28px rgba(0, 0, 0, 0.36)',
      },
      animation: {
        'omni-enter': 'omniEnter 200ms ease-out',
        'widget-slide': 'widgetSlideIn 300ms ease-out',
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
      },
    },
  },
  plugins: [],
}
