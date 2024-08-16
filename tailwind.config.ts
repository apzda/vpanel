import type { Config } from 'tailwindcss'

export default <Config>{
  darkMode: 'class',
  content: ['./index.html', '!./src/**/__tests__/*', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}
