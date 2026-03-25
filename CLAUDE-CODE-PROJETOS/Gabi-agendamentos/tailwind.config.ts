import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F3E8FF',
          100: '#E9D5FF',
          200: '#C4B5FD',
          300: '#A78BFA',
          400: '#8B5CF6',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
        },
        nature: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        surface: {
          page: '#F9FAFB',
          card: '#FFFFFF',
          border: '#F3F4F6',
        },
        text: {
          primary: '#1D1D1F',
          secondary: '#6B7280',
          tertiary: '#86868B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        emoji: ['Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '14px',
        'lg': '20px',
        'pill': '100px',
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0,0,0,0.03)',
        'light': '0 2px 8px rgba(0,0,0,0.04)',
        'medium': '0 4px 24px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}

export default config
