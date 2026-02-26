import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './app/**/*.{vue,js,ts}',
    './server/**/*.{js,ts}',
    './components/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF5FF',
        sakura: '#F3E8FF',
        sand: '#E9D5FF',
        stone: '#9CA3AF',
        charcoal: '#374151',
        ink: '#1F2937',
        matcha: '#10B981',
        indigo: '#8B5CF6',
        'indigo-light': '#A78BFA',
        'indigo-dark': '#7C3AED',
        sky: '#60A5FA',
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'Inter', 'sans-serif'],
        zen: ['Noto Sans SC', 'sans-serif'],
      },
      letterSpacing: {
        zen: '0.08em',
        wide: '0.1em',
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        'zen': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'zen-md': '0 4px 16px rgba(0, 0, 0, 0.06)',
        'zen-lg': '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
