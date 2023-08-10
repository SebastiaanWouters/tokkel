/** @type {import('tailwindcss').Config}*/
const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: { colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },
        font: {
          DEFAULT: 'var(--text-color)',
          muted: 'var(--muted-text-color)',
        },
        surface: {
          DEFAULT: 'var(--background-color)',
          hover: 'var(--hover-background-color)',
          25: 'var(--background-color-25)',
          50: 'var(--background-color-50)',
          75: 'var(--background-color-75)',
          90: 'var(--background-color-90)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
        },
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
