import { defineConfig, logHandlers, memoryCache } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://waptik.xyz",
  integrations: [mdx(), sitemap()],
  // logger: logHandlers.json(),
  cache: {
    provider: memoryCache(),
  },
});
