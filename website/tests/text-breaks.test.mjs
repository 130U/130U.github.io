import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const OUT = new URL("../out/", import.meta.url);

async function pages(directory = OUT) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !["_next", "assets", "architecture"].includes(entry.name)) found.push(...await pages(new URL(`${entry.name}/`, directory)));
    if (entry.isFile() && entry.name === "index.html") found.push({ url: directory, html: await readFile(new URL("index.html", directory), "utf8") });
  }
  return found;
}

const text = (html) => html.replace(/<[^>]+>/gu, "").replaceAll("&amp;", "&");

test("each run of list items hangs its markers in one column as wide as its widest number", async () => {
  let twoDigitRuns = 0;
  for (const { url, html } of await pages()) {
    const items = [...html.matchAll(/<p\b([^>]*\bdata-list-item=""[^>]*)><span\b[^>]*\bdata-marker="(number|bullet)"[^>]*>([^<]*)<\/span>/gu)];
    let run = [];
    const close = () => {
      if (!run.length) return;
      const widest = Math.max(1, ...run.map(({ marker }) => /\d+/u.exec(marker)?.[0].length ?? 1));
      if (widest > 1) twoDigitRuns += 1;
      for (const { attributes, marker } of run) {
        const declared = Number(/--marker-digits:\s*(\d+)/u.exec(attributes)?.[1] ?? 1);
        assert.equal(declared, widest, `${url.pathname}: marker "${marker.trim()}" must share its run's ${widest}-figure column.`);
      }
      run = [];
    };
    let previous;
    for (const item of items) {
      // Two items are one run when only the first item's own paragraph lies between their starts.
      const between = previous === undefined ? "" : html.slice(previous, item.index);
      if (previous !== undefined && !(between.split("</p>").length === 2 && /<\/p>\s*$/u.test(between))) close();
      run.push({ attributes: item[1], marker: item[3] });
      previous = item.index;
    }
    close();
  }
  assert.ok(twoDigitRuns >= 2, "Both numbered reference lists must be checked.");
});

test("a written-out address breaks only before its separators, never after its own hyphen", async () => {
  let addresses = 0;
  for (const { url, html } of await pages()) {
    for (const link of html.matchAll(/<a\b([^>]*\bclass="[^"]*_address\b[^"]*"[^>]*)>([\s\S]*?)<\/a>/gu)) {
      addresses += 1;
      const parts = link[2].split(/<wbr\/?>/u).map(text);
      for (const [index, part] of parts.entries()) {
        // A line may end on a hyphen only where the next line opens on a separator ("/-" before "/media").
        assert.ok(!part.endsWith("-") || index === parts.length - 1 || /^[/?#&=.,_~%]/u.test(parts[index + 1]), `${url.pathname}: ${parts.join("")} must not break after a hyphen.`);
        assert.ok(index === 0 || /^[/?#&=.,\-_~%]/u.test(part) || /(?::\/\/|^(?:doi|arxiv):|=)$/iu.test(parts[index - 1]) || parts[index - 1].length === 12, `${url.pathname}: "${part}" must begin at a separator.`);
      }
    }
  }
  assert.ok(addresses >= 100, `Expected the references and footnotes to hold at least 100 addresses; found ${addresses}.`);
});

test("numbered contents entries hang their number beside the title", async () => {
  let entries = 0;
  for (const { url, html } of await pages()) {
    const contents = /<nav\b[^>]*aria-label="Article contents"[^>]*>([\s\S]*?)<\/nav>/u.exec(html)?.[1];
    if (!contents) continue;
    for (const link of contents.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gu)) {
      const numbered = /^(?:(?:[IVXLC]+|[A-Z])\.|\d+(?:\.\d+)+\.?|\d+\.)\s/u.test(text(link[2]));
      assert.equal(/\bdata-numbered=""/u.test(link[1]), numbered, `${url.pathname}: "${text(link[2])}" must ${numbered ? "" : "not "}hang a number.`);
      if (!numbered) continue;
      entries += 1;
      assert.match(link[2], /^<span>[^<]+<\/span> <span>[\s\S]+<\/span>$/u, `${url.pathname}: the number and title of "${text(link[2])}" stand in two spans.`);
    }
  }
  assert.ok(entries >= 60, `Expected at least 60 numbered contents entries; found ${entries}.`);
});
