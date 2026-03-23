/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#002FA7',
        surface: '#EDEAE4',
        ink: '#1a1814',
        warm: '#F5F3EF',
        sidebar: '#FDFCF9',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(26,24,20,0.10), 0 1px 2px rgba(26,24,20,0.06)',
        modal: '0 8px 40px rgba(26,24,20,0.18)',
      },
    },
  },
  plugins: [],
}
