import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { normalizeSegmentPayloads } from "../scripts/assemble-static.mjs";

async function fixture(t, files) {
  const prefix = path.join(tmpdir(), "site-segments-");
  const root = await mkdtemp(prefix);
  t.after(async () => {
    assert.ok(path.resolve(root).startsWith(path.resolve(prefix)));
    assert.notEqual(path.resolve(root), path.resolve(tmpdir()));
    await rm(root, { recursive: true });
  });
  for (const [relative, text] of Object.entries(files)) {
    const file = path.join(root, relative);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, text);
  }
  return root;
}

test("segment payloads have stable filenames and preserve route assets", async (t) => {
  const root = await fixture(t, {
    "education/__next.education/__PAGE__.txt": "education payload",
    "experience/__next.experience/$d$slug/__PAGE__.txt": "domain payload",
    "experience/__next.experience/$d$slug.txt": "slug payload",
    "education/index.html": "education HTML",
    "architecture/index.html": "architecture HTML",
  });
  assert.equal(await normalizeSegmentPayloads(root), 3);
  assert.equal(await readFile(path.join(root, "education/__next.education.__PAGE__.txt"), "utf8"), "education payload");
  assert.equal(await readFile(path.join(root, "experience/__next.experience.$d$slug.__PAGE__.txt"), "utf8"), "domain payload");
  assert.equal(await readFile(path.join(root, "education/index.html"), "utf8"), "education HTML");
  assert.equal(await readFile(path.join(root, "architecture/index.html"), "utf8"), "architecture HTML");
  assert.deepEqual((await readdir(path.join(root, "experience"))).sort(), ["__next.experience.$d$slug.__PAGE__.txt", "__next.experience.$d$slug.txt"]);
  assert.equal(await normalizeSegmentPayloads(root), 0);
});

test("segment filename collisions fail before changing any files", async (t) => {
  const root = await fixture(t, {
    "education/__next.education/__PAGE__.txt": "nested",
    "education/__next.education.__PAGE__.txt": "existing",
  });
  await assert.rejects(normalizeSegmentPayloads(root), /already exists/u);
  assert.equal(await readFile(path.join(root, "education/__next.education/__PAGE__.txt"), "utf8"), "nested");
  assert.equal(await readFile(path.join(root, "education/__next.education.__PAGE__.txt"), "utf8"), "existing");
});

test("segment directories reject non-payload files", async (t) => {
  const root = await fixture(t, { "education/__next.education/index.html": "HTML" });
  await assert.rejects(normalizeSegmentPayloads(root), /only text payload/u);
  assert.equal(await readFile(path.join(root, "education/__next.education/index.html"), "utf8"), "HTML");
});
