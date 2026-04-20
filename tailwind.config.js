/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1A73E8",
        secondary: "#00897B",
        danger: "#C62828",
        warning: "#F57F17",
        success: "#2E7D32",
        light: {
          bg: "#FFFFFF",
          surface: "#F5F5F5"
        },
        dark: {
          bg: "#121212",
          surface: "#1E1E1E"
        },
        text: {
          primary: "#212121",
          muted: "#757575"
        }
      }
    },
  },
  plugins: [],
}
