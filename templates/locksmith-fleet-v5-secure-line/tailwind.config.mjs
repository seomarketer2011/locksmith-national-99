/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        grotesk: ["Grotesk", "sans-serif"],
        display: ["Archivo", "system-ui", "sans-serif"],
        body: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      fontWeight: {
        regular: 400,
        medium: 500,
      },
      colors: {
        green: "var(--green)",
        black: "var(--black)",
        dark: "var(--dark)",
        gray: "var(--gray)",
        white: "var(--white)",
        // "The Secure Line" identity — steel-navy + brass, cool neutrals.
        // Re-skin the whole fleet by editing these tokens.
        navy: "#0C1D2E",
        steel: "#143047",
        brass: "#C7A253",
        "brass-bright": "#E4C578",
        paper: "#F5F6F8",
        line: "#E3E7EC",
        ink: "#16202B",
        muted: "#56626E",
        good: "#2E9E6B",
      },
    },
  },
  plugins: [],
};
