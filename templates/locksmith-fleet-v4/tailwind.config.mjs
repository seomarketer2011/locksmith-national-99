/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Trade-professional blue, distinct from v1 (blue-500), v2 (brass), v3 (amber)
        brandblue: "#0b4a86",
        "brandblue-dark": "#083962",
        "brandblue-tint": "#eef4fb",
        signal: "#e8632a",
        "signal-dark": "#c9501d",
      },
      fontFamily: {
        grotesk: ["Grotesk", "system-ui", "sans-serif"],
      },
      maxWidth: {
        page: "75rem",
      },
    },
  },
  plugins: [],
};
