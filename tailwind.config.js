const konstaConfig = require('konsta/config');

/** @type {import('tailwindcss').Config} */

module.exports = konstaConfig({
  content: [
    "./index.html",
    "./src/**/*.{ts,js,svelte}",
  ],
  konsta: {
    colors: {
      // "primary" is the main app color, if not specified will be default to '#007aff'
      primary: '#838'
    }
  },
  plugins: [require('@tailwindcss/typography')],
});