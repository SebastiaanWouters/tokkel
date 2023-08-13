const konstaConfig = require('konsta/config');

module.exports = konstaConfig({
  content: ['./src/**/*.{js,jsx,ts,tsx,svelte}', './src/index.html'],
  darkMode: 'class',
  konsta: {
    colors: {
        primary: '#ff6b22'
    }
  },
   theme: {
    extend: {
      colors: {
        primary: {
          light: '#ff864b',
          DEFAULT: '#ff6b22',
          dark: '#f85200',
        },
      },
    },
  },
});
