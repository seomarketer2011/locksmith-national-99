import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{astro,html,md,mdx,js,ts,jsx,tsx}',  // All source files
    './public/**/*.html'                              // Any static HTML
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        body: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      colors: {
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
  plugins: []
} satisfies Config
