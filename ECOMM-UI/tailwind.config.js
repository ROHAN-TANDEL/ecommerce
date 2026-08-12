/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#4F46E5',
        'brand-hover': '#4338CA',
      }
    },
  },
  plugins: [],
}
