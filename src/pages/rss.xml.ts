import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE } from "../config";
import { getPublishedPosts } from "../utils/posts";

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
