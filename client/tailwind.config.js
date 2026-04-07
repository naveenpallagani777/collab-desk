/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef9f6',
          100: '#d5f1e8',
          500: '#00b894',
          600: '#009e7f',
          700: '#008068',
        },
      },
    },
  },
  plugins: [],
}
