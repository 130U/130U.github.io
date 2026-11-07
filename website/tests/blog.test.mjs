import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const OUT = path.join(ROOT, "out");
const POSTS = path.join(ROOT, "content", "blog");

const html = (route) => readFile(path.join(OUT, ...route.split("/").filter(Boolean), "index.html"), "utf8");
const text = (value) => value.replace(/<[^>]+>/gu, " ").replace(/&#x27;|&#39;/gu, "'").replace(/&amp;/gu, "&").replace(/&quot;/gu, '"').replace(/\s+/gu, " ").trim();
const attribute = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, "u"))?.[1];

async function posts() {
  const files = (await readdir(POSTS)).filter((file) => file.endsWith(".md")).sort();
  return Promise.all(files.map(async (file) => {
    const source = await readFile(path.join(POSTS, file), "utf8");
    const front = Object.fromEntries(source.match(/^---\r?\n([\s\S]*?)\r?\n---/u)[1].split(/\r?\n/u).map((line) => {
      const [, key, value] = line.match(/^([A-Za-z]+): (.+)$/u);
      return [key, value];
    }));
    return { slug: file.replace(/\.md$/u, ""), ...front };
  }));
}

test("the Blog index lists every post, newest first, in one framed ledger", async () => {
  const index = await html("/blog/");
  const main = index.match(/<main\b[^>]*>([\s\S]*?)<\/main>/u)[1];
  assert.equal(text(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)[1]), "Blog");
  const expected = (await posts()).sort((a, b) => b.date.localeCompare(a.date));
  const entries = [...main.matchAll(/<article\b[^>]*data-blog-entry="([^"]+)"[^>]*>([\s\S]*?)<\/article>/gu)];
  assert.deepEqual(entries.map((entry) => entry[1]), expected.map((post) => post.slug));
  for (const [[, slug, entry], post] of entries.map((entry, index) => [entry, expected[index]])) {
    assert.equal(text(entry.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/u)[1]), post.title);
    assert.equal(attribute(entry.match(/<time\b[^>]*>/u)[0], "dateTime") ?? attribute(entry.match(/<time\b[^>]*>/u)[0], "datetime"), post.date);
    assert.ok(text(entry).includes(post.summary), `${slug}: the summary is the post's front matter summary`);
    const readMore = entry.match(/<a\b[^>]*class="read-more"[^>]*>/u)[0];
    assert.equal(attribute(readMore, "href"), `/blog/${slug}/`);
    assert.equal(attribute(readMore, "aria-label"), `Read more about ${post.title}`);
  }
});

test("each post opens with its title, byline, hero and a link to the work, then its figures", async () => {
  for (const post of await posts()) {
    const page = await html(`/blog/${post.slug}/`);
    const article = page.match(/<article\b[^>]*aria-labelledby="post-title"[^>]*>([\s\S]*?)<\/article>/u)[1];
    assert.equal(text(article.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/u)[1]), post.title);
    assert.match(text(article), /^[\s\S]*?By Theodore Ouyang [A-Z][a-z]+ \d{1,2}, \d{4}/u);
    const images = [...article.matchAll(/<img\b[^>]*>/gu)].map((match) => match[0]);
    assert.equal(attribute(images[0], "src"), post.hero);
    assert.equal(attribute(images[0], "alt"), post.heroAlt);
    for (const image of images) {
      const src = attribute(image, "src");
      assert.ok(existsSync(path.join(ROOT, "public", src)), `${src} is a published asset`);
      for (const name of ["alt", "width", "height"]) assert.ok(attribute(image, name), `${src} declares ${name}`);
    }
    const work = article.match(/<a\b[^>]*data-blog-work[^>]*>([\s\S]*?)<\/a>/u);
    assert.equal(attribute(work[0], "href"), post.work);
    assert.equal(text(work[1]), `${post.title} ${post.workDescription} View Now`);
    assert.ok(article.indexOf(work[0]) > article.indexOf(images[0]), "The work follows the hero.");
    const figures = [...article.matchAll(/<figure\b[^>]*>([\s\S]*?)<\/figure>/gu)].filter((figure) => figure[1].includes("<img"));
    for (const figure of figures) assert.ok(text(figure[1].match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/u)?.[1] ?? ""), "Every figure has a caption.");
    assert.equal(attribute(page.match(/<meta\b[^>]*property="og:type"[^>]*>/u)[0], "content"), "article");
    assert.ok(attribute(page.match(/<meta\b[^>]*property="og:image"[^>]*>/u)[0], "content").endsWith(post.image));
  }
});
