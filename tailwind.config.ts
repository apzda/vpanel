import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', '!./src/**/__tests__/*', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config
