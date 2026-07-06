/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f7f5f1",
        card: "#ffffff",
        ink: "#211d19",
        stone2: "#6b6259",
        line: "#e5e0d8",
        brass: "#a16207",
        "brass-deep": "#854d0e",
        "brass-pale": "#fdf6e7",
      },
      fontFamily: {
        display: ["Georgia", "Cambria", "'Times New Roman'", "serif"],
        body: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        page: "72rem",
        prose2: "44rem",
      },
    },
  },
  plugins: [],
};
