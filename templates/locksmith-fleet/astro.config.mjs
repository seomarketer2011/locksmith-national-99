import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://{{domain}}',
  integrations: [tailwind(), sitemap()],
  output: 'static',
  build: {
    inlineStylesheets: 'always',
    assets: '_astro',
  },
  compressHTML: true,
});
