import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

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
