import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { secureStaticHtml } from "../scripts/secure-static-html.mjs";

const OUT = fileURLToPath(new URL("../out/", import.meta.url));
const hash = (source) => `'sha256-${createHash("sha256").update(source).digest("base64")}'`;

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(filename));
    else if (entry.name.endsWith(".html")) files.push(filename);
  }
  return files;
}

test("every exported HTML page permits only its authored inline scripts", async () => {
  const files = await htmlFiles(OUT);
  assert.ok(files.length >= 12);
  for (const filename of files) {
    const html = await readFile(filename, "utf8");
    const policy = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/u)?.[1];
    assert.ok(policy, `${filename}: missing CSP`);
    const scripts = policy.split("; ").find((rule) => rule.startsWith("script-src "));
    assert.doesNotMatch(scripts, /'unsafe-inline'|'unsafe-eval'|https?:|\*/u);
    assert.ok(html.indexOf("Content-Security-Policy") < html.indexOf("<script"));
    for (const [, attributes, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/giu)) {
      if (!/\bsrc\s*=/iu.test(attributes)) assert.ok(scripts.includes(hash(body)), filename);
    }
    assert.ok(!scripts.includes(hash("alert('unauthorized')")));
    assert.ok(policy.includes("object-src 'none'"));
    assert.ok(policy.includes("form-action 'none'"));
  }
});

test("static policies are deterministic and normalize browser line endings", () => {
  const document = '<html><head></head><body><script>const label = "你好";\r\n</script></body></html>';
  const secured = secureStaticHtml(document);
  assert.ok(secured.includes(hash('const label = "你好";\n')));
  assert.equal(secureStaticHtml(secured), secured);
  assert.equal((secured.match(/http-equiv="Content-Security-Policy"/gu) ?? []).length, 1);
  assert.ok(secured.includes("script-src-attr 'none'"));
  assert.throws(() => secureStaticHtml("<body></body>"), /must have a head/u);
});

test("the architecture uses local fonts without inline event permissions", () => {
  const document = '<html><head><meta name="generator" content="archify 2"></head><body></body></html>';
  const secured = secureStaticHtml(document);
  assert.ok(secured.includes("script-src-attr 'none'"));
  assert.ok(secured.includes("font-src 'self'"));
  assert.doesNotMatch(secured, /fonts\.googleapis|fonts\.gstatic|'unsafe-hashes'/u);
});

test("the exported architecture uses the shared local type system", async () => {
  const html = await readFile(path.join(OUT, "architecture", "index.html"), "utf8");
  const globals = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic|JetBrains|Georgia|Times New Roman/u);
  assert.match(html, /<link[^>]+rel="stylesheet"[^>]+href="\.\.\/assets\/fonts\/inter\.css"/u);
  assert.match(html, /<link[^>]+rel="preload"[^>]+href="\.\.\/assets\/fonts\/InterVariable\.woff2"/u);
  const fontCss = await readFile(path.join(OUT, "assets", "fonts", "inter.css"), "utf8");
  assert.match(fontCss, /--font-text:\s*"Inter",\s*sans-serif/u);
  for (const filename of ["InterVariable.woff2", "InterVariable-Italic.woff2"]) {
    const font = await readFile(path.join(OUT, "assets", "fonts", filename));
    assert.equal(font.subarray(0, 4).toString(), "wOF2", `${filename}: invalid WOFF2 asset`);
    assert.ok(html.includes(filename), `${filename}: missing local export font`);
  }
  for (const role of ["title", "heading", "subheading", "reading", "interface", "label"]) {
    for (const token of [`--type-${role}`, `--${role}-leading`]) {
      const pattern = new RegExp(`${token}:\\s*([^;]+);`, "u");
      assert.equal(html.match(pattern)?.[1], globals.match(pattern)?.[1], token);
    }
  }
  const mobileRoot = globals.match(/@media \(width < 768px\) \{\s*:root \{([^}]+)\}/u)?.[1];
  const viewerMobileRoot = html.match(/@media \(width < 768px\) \{\s*:root \{([^}]+)\}/u)?.[1];
  assert.ok(mobileRoot && viewerMobileRoot, "Missing shared mobile typography.");
  for (const [, token, value] of mobileRoot.matchAll(/(--type-[a-z]+):\s*([^;]+);/gu)) {
    assert.equal(viewerMobileRoot.match(new RegExp(`${token}:\\s*([^;]+);`, "u"))?.[1], value, token);
  }
  assert.doesNotMatch(html, /\.card h3|<h3>/u);
  assert.equal((html.match(/<h2>/gu) ?? []).length, 3);
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gu)].map(([, css]) => css).join("\n");
  for (const [, selector, body] of styles.matchAll(/([^{}]+)\{([^{}]*)\}/gu)) {
    const size = body.match(/font-size:\s*([^;]+);/u)?.[1];
    if (!size || /\b(?:svg|text)\b|\.t-|\.c-/u.test(selector)) continue;
    assert.match(size, /^var\(--type-(?:title|heading|subheading|reading|interface|label)\)$/u, selector.trim());
  }
});
