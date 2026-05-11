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
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, tags, meta_description, published_at")
    .order("published_at", { ascending: false });

  if (error) {
    console.error(`[fetchPosts] Supabase error: ${error.code} - ${error.message}`);
    throw new Error(`Supabase: ${error.message}`);
  }
  console.log(`[fetchPosts] returned ${(data ?? []).length} row(s)`);
  return (data ?? []) as ApiPostSummary[];
}

export async function fetchPost(slug: string): Promise<ApiPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, tags, meta_description, published_at, content")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      console.log(`[fetchPost] no row found for slug="${slug}"`);
      return null;
    }
    console.error(`[fetchPost] Supabase error for slug="${slug}": ${error.code} - ${error.message}`);
    throw new Error(`Supabase: ${error.message}`);
  }
  console.log(`[fetchPost] found row for slug="${slug}"`);
  return data as ApiPost;
}
