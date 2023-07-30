/** @type {import('tailwindcss').Config}*/
const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {colors: {
        'primary': {  DEFAULT: '#7E2A9F',  50: '#F8E4F6',  100: '#F2CCF0',  200: '#E29CE5',  300: '#CB6CD8',  400: '#AE3BCB',  500: '#7E2A9F',  600: '#602383',  700: '#451B66',  800: '#2D144A',  900: '#190C2E'},
      },
      fontSize: {
        'xs': '0.87rem',
        'sm': '1.02rem', // You can adjust the size as per your requirements
        'md': '1.05rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
      },
   
    },
  },

  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};

module.exports = config;
