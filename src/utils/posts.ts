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
  const isProd = import.meta.env.PROD || process.env.NODE_ENV === "production";
  const posts = await getCollection("blog", ({ data }) =>
    isProd ? data.draft === false : true,
  );

  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/**
 * Returns recent posts with optional limit and exclusion (e.g. for current post in sidebar).
 */
export async function getRecentPosts(options?: {
  limit?: number;
  excludeId?: string;
}): Promise<Post[]> {
  const posts = await getPublishedPosts();
  const filtered = options?.excludeId
    ? posts.filter((p) => p.id !== options.excludeId)
    : posts;

  return typeof options?.limit === "number"
    ? filtered.slice(0, options.limit)
    : filtered;
}

/**
 * Returns posts for the home page: latest 5 posts (3 if total posts <= 5).
 */
export async function getHomeRecentPosts(): Promise<{ posts: Post[]; total: number }> {
  const posts = await getPublishedPosts();
  const limit = posts.length <= 5 ? 3 : 5;
  return {
    posts: posts.slice(0, limit),
    total: posts.length,
  };
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

/**
 * Returns posts related to the current post based on shared tags.
 * Falls back to recent posts if not enough tag matches are found.
 */
export async function getRelatedPosts(
  currentPost: Post,
  limit: number = 3,
): Promise<Post[]> {
  const allPosts = await getPublishedPosts();
  const candidates = allPosts.filter((p) => p.id !== currentPost.id);

  const currentTags = new Set((currentPost.data.tags ?? []).map(tagSlug));

  // Score each candidate by number of shared tags
  const scored = candidates.map((post) => {
    const postTags = (post.data.tags ?? []).map(tagSlug);
    const commonTags = postTags.filter((t) => currentTags.has(t)).length;
    return { post, score: commonTags };
  });

  // Sort by score descending (most matching tags first), then by date descending
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf();
  });

  return scored.slice(0, limit).map((s) => s.post);
}
