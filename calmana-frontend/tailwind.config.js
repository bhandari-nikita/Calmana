// calmana-frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F4FBF7",   // very soft green-tint
        surface: "#FFFFFF",
        primary: "#2F7D6A",      // calm, mature green
        secondary: "#9ED5C5",    // soft mint
        text: "#1F2937",
        muted: "#6B7280",
        border: "#E5E7EB",
      },
    },
  },
  // plugins: [],
  plugins: [
  require('@tailwindcss/line-clamp'),
],

};

export default config;
