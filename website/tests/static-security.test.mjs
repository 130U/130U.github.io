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
