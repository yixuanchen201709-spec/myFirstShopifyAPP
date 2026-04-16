/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        blush: '#FDF2F8',
        'blush-light': '#FCE7F3',
        'blush-dark': '#F9A8D4',
        rose: '#EC4899',
        'rose-dark': '#DB2777',
        lavender: '#8B5CF6',
        gold: '#C9A84C',
        'gold-light': '#E8D5A3',
        'gold-dark': '#A67C00',
        cream: '#FDF8F3',
        charcoal: '#3A3A3A',
        warmgray: '#595A5B',
        lightgray: '#F7F7F5',
      },
    },
  },
  plugins: [],
};
