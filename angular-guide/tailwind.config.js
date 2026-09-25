/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Instructs Tailwind to parse your Angular templates
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"), // Registers the DaisyUI component libraries
  ],
  daisyui: {
    themes: ["light"], // Forces the light theme only, or put "light" first if using multiple
  }
}
