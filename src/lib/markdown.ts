import { supabase } from "./supabase";

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface ParsedContent {
  html: string;
  headings: Heading[];
}

let slugCounts: Record<string, number> = {};

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  const count = slugCounts[base] ?? 0;
  slugCounts[base] = count + 1;
  return count === 0 ? base : `${base}-${count}`;
}

/**
 * Injects id attributes into h2/h3 headings and extracts them for TOC.
 */
export function processHtmlContent(raw: string): ParsedContent {
  slugCounts = {};
  const headings: Heading[] = [];

  const html = raw.replace(
    /<h([2-3])>([\s\S]*?)<\/h[23]>/g,
    (_, depth, content) => {
      const text = content.replace(/<[^>]+>/g, "").trim();
      const slug = slugify(text);
      headings.push({ depth: parseInt(depth), slug, text });
      return `<h${depth} id="${slug}">${content}</h${depth}>`;
    }
  );

  return { html, headings };
}

export function extractDescription(content: string, maxLen = 160): string {
  const stripped = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (stripped.length <= maxLen) return stripped;
  const truncated = stripped.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  return truncated.slice(0, lastSpace > 0 ? lastSpace : maxLen) + "...";
}

export interface ApiPostSummary {
  id: string;
  title: string;
  slug: string;
  tags?: string[];
  meta_description?: string;
  published_at: string;
}

export interface ApiPost extends ApiPostSummary {
  content: string;
}

export async function fetchPosts(): Promise<ApiPostSummary[]> {
  let supabasePosts: ApiPostSummary[] = [];
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, tags, meta_description, published_at")
      .order("published_at", { ascending: false });

    if (error) {
      console.error(`[fetchPosts] Supabase error: ${error.code} - ${error.message}`);
    } else {
      supabasePosts = (data ?? []) as ApiPostSummary[];
    }
  } catch (err: any) {
    console.error(`[fetchPosts] Supabase fetch failed:`, err.message);
  }

  let localPosts: ApiPostSummary[] = [];
  try {
    // Dynamically import to avoid breaking when not in Astro context
    const { getCollection } = await import("astro:content");
    const blogEntries = await getCollection("blog");
    localPosts = blogEntries.map(entry => ({
      id: entry.id,
      title: entry.data.title,
      slug: entry.data.slug || entry.id,
      tags: entry.data.tags || [],
      meta_description: entry.data.meta_description || "",
      published_at: entry.data.pubDate.toISOString(),
    }));
  } catch (err: any) {
    console.warn(`[fetchPosts] Could not load local posts:`, err.message);
  }

  const combined = [...supabasePosts, ...localPosts].sort(
    (a, b) => new Date(b.published_at).valueOf() - new Date(a.published_at).valueOf()
  );

  console.log(`[fetchPosts] returned ${combined.length} row(s) (${supabasePosts.length} remote, ${localPosts.length} local)`);
  return combined;
}

export async function fetchPost(slug: string): Promise<ApiPost | null> {
  try {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, tags, meta_description, published_at, content")
      .eq("slug", slug)
      .single();

    if (!error && data) {
      console.log(`[fetchPost] found remote row for slug="${slug}"`);
      return data as ApiPost;
    }
  } catch (err: any) {
    console.error(`[fetchPost] Supabase error for slug="${slug}":`, err.message);
  }

  try {
    const { getCollection, render } = await import("astro:content");
    const blogEntries = await getCollection("blog");
    const entry = blogEntries.find(e => (e.data.slug || e.id) === slug);
    if (entry) {
      console.log(`[fetchPost] found local row for slug="${slug}"`);
      return {
        id: entry.id,
        title: entry.data.title,
        slug: entry.data.slug || entry.id,
        tags: entry.data.tags || [],
        meta_description: entry.data.meta_description || "",
        published_at: entry.data.pubDate.toISOString(),
        content: entry.body || "", // Note: Rendered content might need to be parsed in .astro
      };
    }
  } catch (err: any) {
    console.warn(`[fetchPost] Could not load local post for slug="${slug}":`, err.message);
  }

  console.log(`[fetchPost] no row found for slug="${slug}"`);
  return null;
}
