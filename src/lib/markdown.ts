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
 * Backend returns pre-rendered HTML without heading IDs, so we add them here.
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

const BASE_URL = import.meta.env.PUBLIC_BACKEND_URL;

export async function fetchPosts(): Promise<ApiPostSummary[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function fetchPost(slug: string): Promise<ApiPost | null> {
  const res = await fetch(`${BASE_URL}/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}
