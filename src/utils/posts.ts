import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

export interface TagCount {
  /** Original casing as written in frontmatter. */
  name: string;
  /** URL-safe slug used by /tags/[tag]. */
  slug: string;
  count: number;
}

/** URL-safe form of a tag. */
export function tagSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Published posts, newest first.
 * Drafts stay visible in dev mode and are excluded from production builds.
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );

  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function collectTags(posts: Post[]): TagCount[] {
  const bySlug = new Map<string, TagCount>();

  for (const post of posts) {
    const tags = post.data.tags ?? [];
    for (const name of tags) {
      const slug = tagSlug(name);
      if (!slug) continue;
      const existing = bySlug.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        bySlug.set(slug, { name, slug, count: 1 });
      }
    }
  }

  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
}

export function postsByTag(posts: Post[], slug: string): Post[] {
  return posts.filter((post) =>
    (post.data.tags ?? []).some((t) => tagSlug(t) === slug),
  );
}

/**
 * Neighbouring posts in publication order.
 * `previous` is the older post; `next` is the newer post.
 */
export function getAdjacentPosts(
  posts: Post[],
  id: string,
): { previous?: Post; next?: Post } {
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) return {};

  return {
    previous: posts[index + 1],
    next: posts[index - 1],
  };
}
