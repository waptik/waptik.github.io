import type { APIRoute } from "astro";
import { SITE, OG } from "../config";
import { renderOgImage } from "../utils/og-image";

export const GET: APIRoute = async () => {
  if (!OG.enabled) {
    return new Response("OG generation disabled", { status: 404 });
  }

  const png = await renderOgImage({
    title: SITE.tagline,
    stamp: SITE.url.replace(/^https?:\/\//, ""),
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
