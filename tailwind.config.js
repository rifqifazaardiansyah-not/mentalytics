/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#d4edf6',
          200: '#c4f0ed',
          300: '#c9f4e4',
          400: '#bef4d5',
          500: '#b2f2c3',
          600: '#7fd9a8',
          700: '#4fb583',
        },
        ink: {
          900: '#1f2d28',
          600: '#4b5f58',
        },
        surface: '#ffffff',
        bg: '#f6fcf9',
        warning: '#f6c453',
        danger: '#e57373',
        info: '#7cc4e8',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
