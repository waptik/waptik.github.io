import type { APIRoute, GetStaticPaths } from "astro";
import { OG, SITE } from "../../config";
import { renderOgImage } from "../../utils/og-image";
import { getPublishedPosts, type Post } from "../../utils/posts";

export const getStaticPaths = (async () => {
  if (!OG.enabled) return [];

  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}) satisfies GetStaticPaths;

interface Props {
  post: Post;
}

export const GET: APIRoute<Props> = async ({ props }) => {
  const { post } = props;

  const png = await renderOgImage({
    title: post.data.title,
    description: post.data.description,
    category: post.data.tags?.[0],
    stamp: SITE.url.replace(/^https?:\/\//, ""),
    tags: post.data.tags,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
