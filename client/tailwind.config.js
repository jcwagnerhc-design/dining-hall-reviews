/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        blair: {
          navy: '#1e3a5f',
          'navy-light': '#2a4f7a',
          gold: '#c9a94e',
          'gold-light': '#d4b96a',
        },
      },
    },
  },
  plugins: [],
};
