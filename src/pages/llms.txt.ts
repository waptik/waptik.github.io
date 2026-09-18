import type { APIRoute } from "astro";
import { AUTHOR, SITE } from "../config";
import { formatDate } from "../utils/date";
import { collectTags, getPublishedPosts } from "../utils/posts";

/**
 * https://llmstxt.org — plain-text index of the site for LLMs and AI assistants.
 */
export const GET: APIRoute = async ({ site }) => {
  const posts = await getPublishedPosts();
  const tags = collectTags(posts);
  const base = site ? site.href.replace(/\/$/, "") : SITE.url;
  const absolute = (path: string) => `${base}${path}`;

  const lines = [
    `# ${SITE.title}`,
    "",
    `> ${SITE.description}`,
    "",
    `Written by ${AUTHOR.name} (${AUTHOR.url}).`,
    "",
    "## Posts",
    "",
    ...posts.map(
      (post) =>
        `- [${post.data.title}](${absolute(`/blog/${post.id}/`)}): ${
          post.data.description
        } Published ${formatDate(post.data.pubDate)}.`,
    ),
    "",
    "## Pages",
    "",
    `- [Home](${absolute("/")}): homepage.`,
    `- [Blog](${absolute("/blog/")}): every article, newest first.`,
    `- [Tags](${absolute("/tags/")}): ${tags.map((t) => t.name).join(", ")}.`,
    `- [About](${absolute("/about/")}): about the author.`,
    "",
    "## Feeds",
    "",
    `- [RSS](${absolute("/rss.xml")})`,
    `- [Sitemap](${absolute("/sitemap-index.xml")})`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
