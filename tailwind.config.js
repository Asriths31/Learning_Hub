/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a1a2e",
          light: "#16213e",
          dark: "#0f0f1a",
        },
        accent: {
          DEFAULT: "#e91e63",
          light: "#f48fb1",
          dark: "#c2185b",
        },
        secondary: {
          DEFAULT: "#c3aed6",
          light: "#e8daf0",
          dark: "#9b7fbf",
        },
        surface: {
          DEFAULT: "#f5f0f8",
          card: "#ffffff",
          dark: "#1e1e30",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        btn: "10px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(26, 26, 46, 0.08)",
        "card-hover": "0 8px 24px rgba(26, 26, 46, 0.15)",
        btn: "0 2px 8px rgba(233, 30, 99, 0.3)",
      },
    },
  },
  plugins: [],
};
