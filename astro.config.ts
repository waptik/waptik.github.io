import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
