import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ORIGIN = "https://www.theodoreoy.com";
const VOID_ELEMENTS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const NON_PROSE = new Set(["script", "style", "template", "svg", "math", "annotation", "code", "pre"]);

function decodeHtml(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot|nbsp);/giu, (match, entity) => {
    if (/^#x/iu.test(entity)) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"', nbsp: " " }[entity.toLowerCase()] ?? match;
  });
}

// A small static-tree reader, sufficient for the explicitly closed elements in
// this export. Ignore raw scripts/styles before tokenizing their contents.
function readTree(html) {
  const source = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/giu, "");
  const root = { tag: "root", attrs: new Map(), children: [], start: -1, end: source.length };
  const stack = [root];
  for (const match of source.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>]*>|[^<]+/gu)) {
    const token = match[0];
    if (token.startsWith("<!")) continue;
    const opening = /^<([A-Za-z][\w:-]*)\b([\s\S]*?)\/?>(?![\s\S])/u.exec(token);
    if (opening) {
      const attrs = new Map();
      for (const attribute of opening[2].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gu)) {
        attrs.set(attribute[1].toLowerCase(), decodeHtml(attribute[2] ?? attribute[3] ?? attribute[4] ?? ""));
      }
      const node = { tag: opening[1].toLowerCase(), attrs, children: [], parent: stack.at(-1), start: match.index, end: match.index + token.length };
      stack.at(-1).children.push(node);
      if (!VOID_ELEMENTS.has(node.tag) && !token.endsWith("/>")) stack.push(node);
    } else if (token.startsWith("</")) {
      const tag = /^<\/([\w:-]+)/u.exec(token)?.[1].toLowerCase();
      const index = stack.findLastIndex((node) => node.tag === tag);
      if (index > 0) {
        for (const node of stack.slice(index)) node.end = match.index + token.length;
        stack.length = index;
      }
    } else {
      stack.at(-1).children.push({ text: decodeHtml(token) });
    }
  }
  return root;
}

function elements(root, predicate) {
  const found = [];
  for (const child of root.children ?? []) {
    if (!child.tag) continue;
    if (predicate(child)) found.push(child);
    found.push(...elements(child, predicate));
  }
  return found;
}

function prose(node) {
  if (node.text !== undefined) return node.text;
  if (NON_PROSE.has(node.tag) || node.attrs.has("hidden") || node.attrs.get("aria-hidden") === "true") return "";
  return node.children.map(prose).join(VOID_ELEMENTS.has(node.tag) ? " " : "");
}

function readable(node) {
  return prose(node).replace(/\s+/gu, " ").trim();
}

let pagesPromise;
function exportedPages() {
  return pagesPromise ??= (async () => {
    const sitemap = await readFile(new URL("../out/sitemap.xml", import.meta.url), "utf8");
    const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => new URL(decodeHtml(match[1])).pathname);
    assert.equal(routes.length, 24, "About, Coursework, Experience, eleven full articles and ten experience detail pages remain canonical.");
    routes.push("/education/", "/architecture/", "/past-experience/", "/now/",
      ...["artificial-intelligence", "data-science", "legal-research-and-policy-analysis", "finance", "stem-academic-competitions-and-training"].map((slug) => `/past-experience/${slug}/`));
    assert.equal(new Set(routes).size, 33, "Audit all canonical pages and every retained compatibility route.");
    const entries = await Promise.all(routes.map(async (route) => {
      const html = await readFile(new URL(`../out/${route.replace(/^\//u, "")}index.html`, import.meta.url), "utf8");
      const tree = readTree(html);
      const nodes = elements(tree, () => true);
      return [route, { tree, nodes, ids: nodes.filter((node) => node.attrs.has("id")).map((node) => node.attrs.get("id")) }];
    }));
    return new Map(entries);
  })();
}

test("33 exported pages contain no encoding corruption, exposed math markup, duplicate IDs or broken local anchors", async () => {
  const pages = await exportedPages();
  for (const [route, page] of pages) {
    const text = readable(page.tree);
    const labels = page.nodes.flatMap((node) => ["aria-label", "alt", "title", "placeholder"].map((name) => node.attrs.get(name) ?? "")).join(" ");
    assert.doesNotMatch(text + labels, /\uFFFD|[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/u, `${route}: invalid decoded text.`);
    // Exact common UTF-8/Windows-1252 corruption sequences, not legitimate
    // accented Portuguese names, mathematical squares, arrows or other symbols.
    assert.doesNotMatch(text, /â€™|â€œ|â€“|â€”|â€¦|Ã©|Ã±|Ã¼|Ã¶|Ã£|Ã§/u, `${route}: recognizable encoding corruption.`);
    assert.doesNotMatch(text, /@@RESEARCH-MATH-\d+@@|\$`[^`]+`\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\\(?:frac|sqrt|begin|end|mathbb|operatorname|square)\b|\[[^\]\n]+\]\((?:https?:\/\/|#)[^)]+\)|\*\*[^*\n]+\*\*|```(?:math|tex|latex)?/u, `${route}: source markup leaked into visible prose.`);
    assert.equal(page.nodes.filter((node) => node.tag === "merror" || node.attrs.has("data-mjx-error")).length, 0, `${route}: MathJax error output.`);
    assert.equal(new Set(page.ids).size, page.ids.length, `${route}: duplicate HTML IDs.`);
    for (const link of page.nodes.filter((node) => node.tag === "a" && node.attrs.has("href"))) {
      const target = new URL(link.attrs.get("href"), `${ORIGIN}${route}`);
      if (target.origin !== ORIGIN || !target.hash || target.hash === "#" || target.hash.startsWith("#:~:text=")) continue;
      const targetRoute = target.pathname.replace(/index\.html$/u, "");
      const destination = pages.get(targetRoute);
      assert.ok(destination, `${route}: unknown local page for ${target.pathname}${target.hash}.`);
      assert.ok(destination.ids.includes(decodeURIComponent(target.hash.slice(1))), `${route}: missing anchor ${target.pathname}${target.hash}.`);
    }
  }
});

test("all eleven full articles retain introduction, contents and body order with complete chapter navigation", async () => {
  const pages = await exportedPages();
  const articles = [...pages].filter(([route]) => /^\/education\/[^/]+\/$/u.test(route) || /^\/past-experience\/(?:artificial-intelligence|legal-research-and-policy-analysis)\/[^/]+\/$/u.test(route));
  assert.equal(articles.length, 11);
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
  for (const [route, page] of articles) {
    const overview = page.nodes.filter((node) => node.attrs.has("data-article-overview"));
    const body = page.nodes.filter((node) => node.attrs.has("data-article-body"));
    const menus = page.nodes.filter((node) => node.tag === "nav" && node.attrs.get("aria-label") === "Article contents");
    assert.equal(overview.length, 1, `${route}: one overview region.`);
    assert.equal(body.length, 1, `${route}: one body region.`);
    assert.equal(menus.length, 1, `${route}: one Article contents menu.`);
    assert.ok(overview[0].end <= menus[0].start && menus[0].end <= body[0].start, `${route}: preserve overview, contents, body reading order.`);
    const links = elements(menus[0], (node) => node.tag === "a").map((node) => node.attrs.get("href"));
    const headings = [...elements(overview[0], (node) => /^h[23]$/u.test(node.tag)), ...elements(body[0], (node) => /^h[23]$/u.test(node.tag))];
    const isAiExperience = route.startsWith("/past-experience/artificial-intelligence/");
    const manuscriptTitles = headings.filter((node) => node.attrs.get("id") === "article-title");
    assert.equal(manuscriptTitles.length, 0, `${route}: do not repeat the technical manuscript title below the contribution lead.`);
    if (isAiExperience) {
      const sourceBlocks = elements(body[0], (node) => node.attrs.has("data-research-block"));
      assert.ok(sourceBlocks.length, `${route}: retain the numbered manuscript.`);
      assert.equal(sourceBlocks[0].tag, "h2", `${route}: enter the first numbered chapter directly after the architectural context and contents.`);
      assert.equal(Number(sourceBlocks[0].attrs.get("data-research-block")), 0, `${route}: retain the complete imported manuscript from its first chapter.`);
      assert.equal(sourceBlocks[0].attrs.get("data-source-number"), "1");
      assert.match(readable(headings[1]), /^Architectural Context:/u, `${route}: include the approved architectural bridge before the manuscript.`);
      assert.equal(headings[2], sourceBlocks[0], `${route}: no repeated title or Overview heading may precede the first source chapter.`);
      assert.equal(elements(body[0], (node) => node.tag === "p" && node.start < sourceBlocks[0].start).length, 0, `${route}: no repeated Project/Author or overview prose may precede the first source chapter.`);
    }
    if (route.startsWith("/past-experience/")) {
      assert.equal(links[0], "#key-contributions", `${route}: contribution points open the article directory.`);
      assert.equal(readable(headings[0]), "Key Contributions", `${route}: contribution points replace the generic introductory label.`);
      assert.ok(!links.includes("#overview"), `${route}: do not duplicate the contribution lead with an Overview entry.`);
    }
    for (const heading of headings) {
      const id = heading.attrs.get("id");
      assert.ok(id, `${route}: heading ${readable(heading)} needs an anchor.`);
      const destinations = new Set([`#${id}`]);
      // A labelled section may be the intended destination (for example,
      // #footnotes is labelled by its nested #footnotes-heading).
      for (let ancestor = heading.parent; ancestor; ancestor = ancestor.parent) {
        if (ancestor.tag === "section" && ancestor.attrs.has("id") && (ancestor.attrs.get("aria-labelledby") ?? "").split(/\s+/u).includes(id)) destinations.add(`#${ancestor.attrs.get("id")}`);
      }
      assert.equal(links.filter((href) => destinations.has(href)).length, 1, `${route}: heading ${readable(heading)} must occur once in contents.`);
    }
    const chapters = elements(body[0], (node) => node.tag === "h2" && (node.attrs.has("data-research-block") || node.attrs.has("data-paper-block"))).filter((node) => !/^(?:Appendix|Appendices|References|Footnotes|Acknowledgments|Acknowledgements)\b/iu.test(readable(node)));
    assert.ok(chapters.length > 0, `${route}: missing body chapters.`);
    chapters.forEach((chapter, index) => assert.match(readable(chapter), new RegExp(`^${roman[index]}(?:[.)])?\\s+`, "u"), `${route}: main chapters must use consecutive Roman numerals.`));
    for (const proofEnd of page.nodes.filter((node) => node.attrs.has("data-proof-end"))) {
      const label = elements(proofEnd, (node) => node.tag === "abbr");
      assert.equal(label.length, 1, `${route}: one readable proof-end abbreviation.`);
      assert.equal(readable(label[0]), "Q.E.D.");
      assert.equal(label[0].attrs.get("title"), "End of proof");
      for (const math of elements(proofEnd, (node) => node.tag === "math")) {
        let hidden = false;
        for (let ancestor = math.parent; ancestor && ancestor !== proofEnd; ancestor = ancestor.parent) hidden ||= ancestor.attrs.has("hidden");
        assert.ok(hidden, `${route}: original QED mathematics must not duplicate the visible label.`);
      }
    }
  }
  const asian = pages.get("/education/certified-valuation-arithmetic-asian-options/");
  assert.equal((readable(asian.tree).match(/Q\.E\.D\./gu) ?? []).length, 5, "The five proof endings must be readable labels, not interpreted as missing characters.");
  const annotations = asian.nodes.filter((node) => node.tag === "annotation" && node.attrs.get("encoding") === "application/x-tex");
  assert.equal(annotations.filter((node) => node.children.map((child) => child.text ?? "").join("") === "\\square").length, 5, "Preserve the original QED TeX in the exported mathematical source.");
});
