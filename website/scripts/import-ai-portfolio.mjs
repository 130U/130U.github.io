import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceFile = "content/sources/ai-portfolio/ai-research-and-engineering.md";
const source = readFileSync(path.join(root, sourceFile), "utf8").replace(/\r\n?/gu, "\n");
const projects = [
  ["statistical-inference-and-resource-allocation-in-expert-data-production", 7],
  ["task-validity-in-financial-synthetic-data", 6],
  ["verification-and-supervision-in-scientific-reasoning-tasks", 7],
  ["evidence-uncertainty-and-decision-guarantees-in-investment-research", 6],
];
const sourceDocument = {
  fileName: path.basename(sourceFile),
  path: sourceFile,
  sha256: createHash("sha256").update(source).digest("hex"),
};
const showcasePath = path.join(root, "content/experience-showcase.json");
const showcase = JSON.parse(readFileSync(showcasePath, "utf8"));
const otherEntries = JSON.stringify(showcase.entries.slice(projects.length));
const generated = new Map([["content/experience-showcase.json", showcase]]);

function one(text, expression, label) {
  const matches = [...text.matchAll(expression)];
  assert.equal(matches.length, 1, `Expected exactly one ${label}`);
  return matches[0];
}

function contributions(text) {
  const items = [];
  const details = {};
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    if (line.startsWith("* ")) {
      assert.ok(line.slice(2).trim(), "Contributions cannot be empty");
      items.push(line.slice(2));
      continue;
    }
    const child = line.match(/^ {2}(\*|\d+\.) (.+)$/u);
    assert.ok(child && items.length, `Invalid contribution list line: ${line}`);
    const parent = items.length - 1;
    const ordered = child[1] !== "*";
    details[parent] ??= { ordered, items: [] };
    assert.equal(details[parent].ordered, ordered, "Contribution details cannot mix list types");
    if (ordered) assert.equal(Number.parseInt(child[1], 10), details[parent].items.length + 1, "Contribution details must be sequential");
    details[parent].items.push(child[2]);
  }
  assert.ok(items.length >= 5, "A project must include its complete key contributions");
  return { items, details };
}

const boundaries = [...source.matchAll(/^# Project (\d{2}): ([a-z0-9-]+)$/gmu)];
assert.equal(boundaries.length, projects.length, "Expected four complete AI projects");
const introduction = source.slice(0, boundaries[0].index);
const intro = one(introduction, /^# AI Research and Engineering\n\n\*\*Author\*\*\n([^\n]+)\n\n\*\*Updated\*\*\n(\d{4}-\d{2}-\d{2})\n\n## (Confidentiality & Disclosure Note)\n\n([^\n]+)\n\n$/gu, "portfolio introduction");
showcase.aiSourceDocument = sourceDocument;
const category = showcase.categories.find(({ id }) => id === "01");
assert.ok(category, "Missing AI showcase category");
category.disclosure = { title: intro[3], text: intro[4] };

for (const [index, [slug, chapterCount]] of projects.entries()) {
  const boundary = boundaries[index];
  assert.equal(Number(boundary[1]), index + 1, "Projects must retain their directory order");
  assert.equal(boundary[2], slug, "Unexpected AI project route");
  const page = source.slice(boundary.index + boundary[0].length, boundaries[index + 1]?.index).trim();
  const parts = page.split("\n## Manuscript\n");
  assert.equal(parts.length, 2, `Expected one manuscript for ${slug}`);
  const body = parts[1].trim();
  const chapters = [...body.matchAll(/^## (\d+) [^\n]+$/gmu)];
  assert.deepEqual(chapters.map((chapter) => Number(chapter[1])), Array.from({ length: chapterCount }, (_, i) => i + 1), `Incomplete chapter sequence for ${slug}`);
  assert.ok(body.startsWith("## 1 "), "The manuscript must start at its first chapter");

  const sectionHeadings = [...parts[0].matchAll(/^## ([^\n]+)$/gmu)];
  assert.equal(sectionHeadings.length, 4, `Incomplete project sections for ${slug}`);
  assert.deepEqual(sectionHeadings.slice(0, 3).map((heading) => heading[1]), ["Summary", "Confidentiality & Scope Disclosure", "Key Contributions"]);
  assert.match(sectionHeadings[3][1], /^Architectural Context: .+/u);
  const sections = sectionHeadings.map((heading, i) => parts[0].slice(heading.index + heading[0].length, sectionHeadings[i + 1]?.index).trim());
  assert.ok(sections.every(Boolean), `Empty project section for ${slug}`);

  const metadataText = parts[0].slice(0, sectionHeadings[0].index);
  const metadataPattern = /^\*\*([^*\n]+)\*\*\n([^\n]+)$/gmu;
  const metadataFields = [...metadataText.matchAll(metadataPattern)];
  assert.deepEqual(metadataFields.map((field) => field[1]), ["Article Title", "Organization", "Title", "URL", "Position", "Location", "Dates", "Read More Label"], `Incomplete metadata for ${slug}`);
  assert.equal(metadataText.replace(metadataPattern, "").trim(), "", `Unexpected metadata content for ${slug}`);
  const metadata = Object.fromEntries(metadataFields.map((field) => [field[1], field[2]]));
  assert.equal(metadata.URL, `https://www.theodoreoy.com/past-experience/artificial-intelligence/${slug}/`, "The source URL must match the fixed project route");
  const entry = showcase.entries[index];
  assert.equal(entry.id, index + 1);
  assert.equal(entry.categoryId, "01");
  entry.organization = metadata.Organization;
  entry.summary = sections[0];
  entry.detailTitle = metadata.Title;
  entry.readMoreLabel = metadata["Read More Label"];
  entry.metadata = { position: metadata.Position, location: metadata.Location, dates: metadata.Dates };
  entry.disclosure = { title: sectionHeadings[1][1], text: sections[1] };
  entry.contributionsLabel = sectionHeadings[2][1];
  const parsedContributions = contributions(sections[2]);
  entry.keyContributions = parsedContributions.items;
  if (Object.keys(parsedContributions.details).length) entry.keyContributionDetails = parsedContributions.details;
  else delete entry.keyContributionDetails;
  entry.architecturalContext = { title: sectionHeadings[3][1], text: sections[3] };
  entry.notes = [];

  const articleFile = `content/artificial-intelligence/${slug}.json`;
  const article = JSON.parse(readFileSync(path.join(root, articleFile), "utf8"));
  assert.equal(article.slug, slug);
  article.title = metadata["Article Title"];
  article.markdown = body;
  article.sourceUrl = `https://github.com/130U/130U.github.io/blob/main/website/${sourceFile}`;
  article.sourceEditedAt = intro[2];
  article.sourceDocument = sourceDocument;
  generated.set(articleFile, article);
}

assert.equal(JSON.stringify(showcase.entries.slice(projects.length)), otherEntries, "Only AI entries may change");
// Validate the complete source before writing any generated content.
for (const [file, document] of generated) writeFileSync(path.join(root, file), `${JSON.stringify(document, null, 2)}\n`);
console.log("Imported the four AI projects from the canonical manuscript.");
