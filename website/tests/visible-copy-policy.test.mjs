import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { snapshotHtml } from "../scripts/verify-visible-copy.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "site-visible-copy-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "scripts"));
  await mkdir(path.join(root, "content"));
  const script = path.join(root, "scripts", "verify-visible-copy.mjs");
  await copyFile(path.join(ROOT, "scripts", "verify-visible-copy.mjs"), script);
  const manifestPath = path.join(root, "content", "visible-copy-manifest.json");
  const manifest = JSON.parse(await readFile(path.join(ROOT, "content", "visible-copy-manifest.json"), "utf8"));
  return { script, manifestPath, manifest };
}

function rejectsIncompleteContract(script) {
  assert.throws(() => execFileSync(process.execPath, [script], { encoding: "utf8", stdio: "pipe" }), (error) => {
    assert.match(error.stderr, /must cover exactly the registered website routes/u);
    return true;
  });
}

test("visible-copy contracts reject omitted and unregistered routes before reading HTML", async (t) => {
  const { script, manifestPath, manifest } = await fixture(t);
  const original = structuredClone(manifest);
  delete manifest.routes["/education/"];
  await writeFile(manifestPath, JSON.stringify(manifest));
  rejectsIncompleteContract(script);
  original.routes["/unregistered/"] = original.routes["/education/"];
  await writeFile(manifestPath, JSON.stringify(original));
  rejectsIncompleteContract(script);
});

test("visible-copy contracts reject unsupported versions before reading HTML", async (t) => {
  const { script, manifestPath, manifest } = await fixture(t);
  manifest.version = 2;
  await writeFile(manifestPath, JSON.stringify(manifest));
  rejectsIncompleteContract(script);
});

test("large research HTML preserves visible copy, formula positions and metadata without regex stack growth", () => {
  const hiddenPayload = "hidden payload ".repeat(240_000);
  const svg = `<svg aria-hidden="true"><svg><path d="${"M0 0 ".repeat(500_000)}"/></svg></svg>`;
  const formula = (mode, tex) => `<math data-research-math="${mode}"><semantics><mi>x</mi><annotation encoding="application/x-tex">${tex}</annotation></semantics></math>`;
  const html = `<!doctype html><html><head><title>Large &amp; faithful</title><meta name="description" content="Complete research text"><link rel="canonical" href="https://www.theodoreoy.com/large/"></head><BODY>
    <p>Before &amp; between</p>${svg}${formula("inline", "x&lt;y")}
    <script>${hiddenPayload}</script><style>${hiddenPayload}</style><template>${hiddenPayload}</template>
    <div aria-hidden="true">${hiddenPayload}</div><span data-visible-copy-role="visual-identity">${hiddenPayload}</span><!--${hiddenPayload}-->
    <p>After</p>${svg}${formula("display", "z^2")}<img alt="Original figure" aria-label="Figure one"><button>Menu</button><button>Close</button>
  </BODY></html>`;
  assert.ok(html.length > 20_000_000, "The fixture must exceed the production manuscript's 16 MB HTML size.");
  const snapshot = snapshotHtml(html, true);
  const text = "Before & between MATH_0 After MATH_1";
  const sha256 = (value) => createHash("sha256").update(value).digest("hex");
  assert.equal(snapshot.preview, text);
  assert.equal(snapshot.textSha256, sha256(text));
  assert.equal(snapshot.characterCount, [...text].length);
  assert.equal(snapshot.wordCount, text.split(" ").length);
  assert.equal(snapshot.formulaCount, 2);
  assert.equal(snapshot.mathSourceSha256, sha256(JSON.stringify([{ mode: "inline", tex: "x<y" }, { mode: "display", tex: "z^2" }])));
  assert.deepEqual(snapshot.altTexts, ["Original figure"]);
  assert.deepEqual(snapshot.ariaLabels, ["Figure one"]);
  assert.equal(snapshot.metadata.title, "Large & faithful");
  assert.equal(snapshot.metadata.description, "Complete research text");
  assert.equal(snapshot.metadata.canonical, "https://www.theodoreoy.com/large/");
});
