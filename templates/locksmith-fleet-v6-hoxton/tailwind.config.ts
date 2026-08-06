import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{astro,html,md,mdx,js,ts,jsx,tsx}',  // All source files
    './public/**/*.html'                              // Any static HTML
  ],
  theme: { extend: {} },
  plugins: []
} satisfies Config
