import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { SITE } from "./src/config";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  integrations: [mdx(), sitemap(), icon()],
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