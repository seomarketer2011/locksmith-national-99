import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://{{domain}}",
  integrations: [tailwind(), sitemap()],
  output: "static",
  trailingSlash: "always",
  compressHTML: true,
  build: {
    inlineStylesheets: "always",
    assets: "_astro",
  },
});
