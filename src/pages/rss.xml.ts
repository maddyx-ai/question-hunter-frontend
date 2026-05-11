import rss from "@astrojs/rss";
import { fetchPosts } from "../lib/markdown";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  try {
    const posts = await fetchPosts();

    return rss({
      title: "Question Hunter",
      description: "Automated technical fixes and deep dives",
      site: context.site!,
      items: posts
        .sort(
          (a, b) =>
            new Date(b.published_at).valueOf() -
            new Date(a.published_at).valueOf()
        )
        .map((post) => ({
          title: post.title,
          pubDate: new Date(post.published_at),
          description:
            post.meta_description ||
            "A technical deep dive from Question Hunter.",
          link: `/post/${post.slug}/`,
          categories: post.tags,
        })),
      customData: `<language>en-us</language>`,
    });
  } catch (err) {
    console.error("[rss] fetchPosts failed:", err instanceof Error ? err.message : err);
    return new Response("Failed to generate RSS feed", { status: 500 });
  }
}
