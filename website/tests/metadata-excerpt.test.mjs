import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createMetadataExcerpt } from "../app/lib/content/metadata-excerpt.ts";

test("metadata excerpts retain all complete opening sentences that fit", () => {
  const opening = "The rule applies. It governs U.S. operations.";
  const text = `${opening} ${"The next sentence explains the conditions in detail. ".repeat(8)}`;
  assert.equal(createMetadataExcerpt(text, opening.length), opening);
});

test("a long opening sentence falls back to complete words and an ellipsis", () => {
  const text = "This opening sentence is deliberately longer than the description limit. A short sentence follows.";
  const excerpt = createMetadataExcerpt(text, 36);
  assert.equal(excerpt, "This opening sentence is...");
  assert.ok(excerpt.length <= 36);
});

test("an unpunctuated long paragraph also falls back without splitting a word", () => {
  const text = "This opening paragraph is deliberately longer than the metadata description limit";
  assert.equal(createMetadataExcerpt(text, 36), "This opening paragraph is...");
});

test("short descriptions and a sentence exactly at the limit remain intact", () => {
  assert.equal(createMetadataExcerpt("  Research\n overview  "), "Research overview");
  assert.equal(createMetadataExcerpt(""), "");
  const sentence = `${"Research evidence ".repeat(14)}applies.`;
  assert.equal(sentence.length, 260);
  assert.equal(createMetadataExcerpt(`${sentence} Another sentence follows.`), sentence);
});

test("sentence endings include closing English quotation marks", () => {
  const opening = 'The author writes, "The rule applies."';
  assert.equal(createMetadataExcerpt(`${opening} A longer explanation follows.`, opening.length), opening);
});

test("all four legal abstracts produce complete descriptions within 260 characters", async () => {
  const slugs = [
    "autonomous-authority-in-space",
    "small-states-and-strategic-space-dependence",
    "solar-geoengineering-comparison-and-continuity",
    "mangrove-restoration-and-compensatory-mitigation",
  ];
  for (const slug of slugs) {
    const paper = JSON.parse(await readFile(new URL(`../content/legal-papers/${slug}.json`, import.meta.url), "utf8"));
    const abstract = paper.abstract.map(({ text }) => text).join(" ").replace(/\s+/gu, " ").trim();
    const excerpt = createMetadataExcerpt(abstract);
    assert.ok(excerpt.length > 0 && excerpt.length <= 260, slug);
    assert.ok(abstract.startsWith(excerpt), `${slug}: preserve the authored opening`);
    assert.match(excerpt, /[.!?]["')\]]*$/u, `${slug}: finish a sentence`);
    assert.ok(!excerpt.endsWith("..."), `${slug}: at least one complete sentence fits`);
  }
});
