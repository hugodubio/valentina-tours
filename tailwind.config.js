/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#002FA7',
        surface: '#F8F9FF',
        ink: '#1a1814',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(26,24,20,0.06), 0 1px 2px rgba(26,24,20,0.04)',
        modal: '0 8px 32px rgba(26,24,20,0.12)',
      },
    },
  },
  plugins: [],
}
