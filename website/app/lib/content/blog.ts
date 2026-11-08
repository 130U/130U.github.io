import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseResearchMarkdown, type ResearchInline } from "./research-markdown";

// Each post is one Markdown file in content/blog/: front matter, then the body.
// The body holds paragraphs, "##" headings, one epigraph ("> quote" and
// "> — source") and figures written as ![caption](/assets/blog/<post>/<image> "alt").
const BLOG_DIRECTORY = join(process.cwd(), "content", "blog");

export type BlogBlock =
  | { type: "paragraph"; inlines: ResearchInline[] }
  | { type: "heading"; id: string; text: string }
  | { type: "epigraph"; quote: ResearchInline[]; source: ResearchInline[] }
  | { type: "figure"; src: string; alt: string; caption: ResearchInline[] };

export type BlogPost = {
  slug: string;
  path: string;
  title: string;
  date: string;
  summary: string;
  hero: { src: string; alt: string };
  image: { src: string; alt: string };
  work: { href: string; description: string };
  blocks: BlogBlock[];
};

const FIELDS = ["title", "date", "summary", "hero", "heroAlt", "image", "imageAlt", "work", "workDescription"] as const;
const ASSET = /^\/assets\/blog\/[a-z0-9-]+\/[a-z0-9-]+\.(?:jpg|png|webp)$/u;
const FIGURE = /^!\[(.+)\]\((\/assets\/blog\/[a-z0-9-]+\/[a-z0-9-]+\.(?:jpg|png|webp)) "([^"]+)"\)$/u;

function inlines(source: string) {
  const blocks = parseResearchMarkdown(source, { joinSoftLines: true });
  if (blocks.length !== 1 || blocks[0].type !== "paragraph") throw new Error(`Blog copy must be one paragraph: ${source}`);
  return blocks[0].inlines;
}

function headingId(text: string) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
}

function parseFrontMatter(source: string, slug: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/u);
  if (!match) throw new Error(`${slug}: a post opens with front matter.`);
  const fields = new Map(match[1].split(/\r?\n/u).map((line) => {
    const field = line.match(/^([A-Za-z]+): (.+)$/u);
    if (!field) throw new Error(`${slug}: unreadable front matter line "${line}".`);
    return [field[1], field[2].trim()] as const;
  }));
  for (const field of FIELDS) if (!fields.get(field)) throw new Error(`${slug}: front matter needs "${field}".`);
  if (fields.size !== FIELDS.length) throw new Error(`${slug}: front matter holds only ${FIELDS.join(", ")}.`);
  const value = (field: (typeof FIELDS)[number]) => fields.get(field)!;
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value("date"))) throw new Error(`${slug}: the date is written YYYY-MM-DD.`);
  for (const field of ["hero", "image"] as const) if (!ASSET.test(value(field))) throw new Error(`${slug}: ${field} is a local blog image.`);
  if (!/^\/[a-z0-9-]+\/$/u.test(value("work"))) throw new Error(`${slug}: the work lives at its own address on this site.`);
  return { fields: value, body: source.slice(match[0].length) };
}

function parseBody(body: string, slug: string): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  for (const chunk of body.split(/\r?\n\s*\r?\n/u).map((part) => part.trim()).filter(Boolean)) {
    const lines = chunk.split(/\r?\n/u);
    if (lines.every((line) => line.startsWith("> "))) {
      const quote = lines.map((line) => line.slice(2));
      const source = quote.at(-1)!;
      if (quote.length < 2 || !source.startsWith("— ")) throw new Error(`${slug}: an epigraph ends with "> — source".`);
      blocks.push({ type: "epigraph", quote: inlines(quote.slice(0, -1).join(" ")), source: inlines(source.slice(2)) });
      continue;
    }
    if (chunk.startsWith("## ")) {
      if (lines.length !== 1) throw new Error(`${slug}: a heading stands alone.`);
      const text = chunk.slice(3).trim();
      blocks.push({ type: "heading", id: headingId(text), text });
      continue;
    }
    if (chunk.startsWith("!")) {
      const figure = chunk.match(FIGURE);
      if (!figure) throw new Error(`${slug}: a figure is written ![caption](/assets/blog/<post>/<image> "alt").`);
      blocks.push({ type: "figure", caption: inlines(figure[1]), src: figure[2], alt: figure[3] });
      continue;
    }
    if (/^(?:#|>|[-*+] |\d+[.)] )/u.test(chunk)) throw new Error(`${slug}: unsupported block "${lines[0]}".`);
    blocks.push({ type: "paragraph", inlines: inlines(chunk) });
  }
  const ids = blocks.flatMap((block) => (block.type === "heading" ? [block.id] : []));
  if (new Set(ids).size !== ids.length) throw new Error(`${slug}: headings must be distinct.`);
  return blocks;
}

function loadPost(file: string): BlogPost {
  const slug = file.replace(/\.md$/u, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)) throw new Error(`${file}: a post's file name is its slug.`);
  const { fields, body } = parseFrontMatter(readFileSync(join(BLOG_DIRECTORY, file), "utf8"), slug);
  return {
    slug,
    path: `/blog/${slug}/`,
    title: fields("title"),
    date: fields("date"),
    summary: fields("summary"),
    hero: { src: fields("hero"), alt: fields("heroAlt") },
    image: { src: fields("image"), alt: fields("imageAlt") },
    work: { href: fields("work"), description: fields("workDescription") },
    blocks: parseBody(body, slug),
  };
}

/** Every post, newest first. */
export const blogPosts: readonly BlogPost[] = readdirSync(BLOG_DIRECTORY)
  .filter((file) => file.endsWith(".md"))
  .map(loadPost)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

/** "2026-06-01" as "June 1, 2026". */
export function formatBlogDate(date: string) {
  return dateFormat.format(new Date(`${date}T00:00:00Z`));
}

export const BLOG_DESCRIPTION = "Writing on the works I make and how each one is built.";
