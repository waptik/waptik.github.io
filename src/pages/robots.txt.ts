import type { APIRoute } from "astro";
import { SITE } from "../config";

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = site
    ? new URL("sitemap-index.xml", site).href
    : `${SITE.url}/sitemap-index.xml`;

  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${sitemapUrl}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
