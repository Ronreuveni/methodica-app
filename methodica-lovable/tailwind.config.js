/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { orange: '#EC8223', blue: '#2C7CD1' },
        ink: { 900: '#1a1a1a', 700: '#4a4a4a', 500: '#7a7a7a', 300: '#c4c4c4', 100: '#f0f0f0' },
        cream: '#FAF6EF',
      },
      fontFamily: {
        sans: ['Heebo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
