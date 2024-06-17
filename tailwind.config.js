/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.tsx"],
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          'poppins': ['Poppins', 'sans-serif']
        },
        backgroundImage: ['hover', 'focus']
      },
    },
    plugins: [
    ],
  }