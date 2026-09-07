import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { verifyProtectedSources } from "../scripts/check-protected-sources.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const REPOSITORY_ROOT = path.dirname(ROOT.replace(/[\\/]$/u, ""));
const WORKFLOW = path.join(REPOSITORY_ROOT, ".github", "workflows", "pages.yml");

async function protectedFixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "site-protected-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const manifest = JSON.parse(await readFile(path.join(ROOT, "content", "protected-sources.json"), "utf8"));
  for (const relative of [...Object.keys(manifest.sources), "content/protected-sources.json"]) {
    const target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(ROOT, relative), target);
  }
  return { root, manifest };
}

test("the repository index groups every tracked file in four top-level directories", () => {
  const files = execFileSync("git", ["ls-files", "--cached", "-z"], {
    cwd: REPOSITORY_ROOT,
    encoding: "utf8",
  }).split("\0").filter(Boolean);
  assert.ok(files.length > 0);
  for (const file of files) assert.ok(file.includes("/"), `${file} must belong to a directory`);
  assert.deepEqual([...new Set(files.map((file) => file.split("/")[0]))].sort(), [
    ".github", "architecture", "docs", "website",
  ]);
});

test("the Pages workflow deploys only main and pins every action", async () => {
  const workflow = await readFile(WORKFLOW, "utf8");
  const pushBlock = workflow.match(
    /^  push:\r?\n([\s\S]*?)(?=^[ ]{2}\S|^permissions:)/mu,
  )?.[1];

  assert.equal(pushBlock?.trim(), "branches: [main]");
  assert.match(workflow, /defaults:\r?\n\s+run:\r?\n\s+working-directory: website/u);
  assert.match(workflow, /cache-dependency-path: website\/package-lock\.json/u);
  assert.match(workflow, /path: website\/out/u);
  assert.match(
    workflow,
    /group: pages-\$\{\{ github\.event_name == 'push' && 'production' \|\| github\.ref \}\}/u,
  );
  assert.match(
    workflow,
    /Upload Pages artifact\r?\n\s+if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/u,
  );
  assert.match(
    workflow,
    /^  deploy:\r?\n\s+if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/mu,
  );

  const actions = [...workflow.matchAll(
    /^\s*uses: ([^@\s]+)@([\da-f]{40}) # (v\d+)$/gmu,
  )].map((match) => match.slice(1));

  assert.deepEqual(actions, [
    ["actions/checkout", "d23441a48e516b6c34aea4fa41551a30e30af803", "v6"],
    ["actions/setup-node", "820762786026740c76f36085b0efc47a31fe5020", "v7"],
    [
      "actions/upload-pages-artifact",
      "fc324d3547104276b827a68afc52ff2a11cc49c9",
      "v5",
    ],
    ["actions/configure-pages", "45bfe0192ca1faeb007ade9deae92b16b8254a0d", "v6"],
    ["actions/deploy-pages", "cd2ce8fcbc39b97be8ca5fce6e763baed58fa128", "v5"],
  ]);
});

test("the checked-out protected sources match the manifest", () => {
  assert.doesNotThrow(() => verifyProtectedSources());
});

test("the protected-source guard accepts matching content with either line ending", async (t) => {
  const { root } = await protectedFixture(t);
  assert.doesNotThrow(() => verifyProtectedSources(root));
  const source = path.join(root, "app", "education", "page.tsx");
  const text = await readFile(source, "utf8");
  await writeFile(source, text.replace(/\r\n?/gu, "\n").replaceAll("\n", "\r\n"));
  assert.doesNotThrow(() => verifyProtectedSources(root));
});

test("the protected-source guard rejects modified content", async (t) => {
  const { root } = await protectedFixture(t);
  await writeFile(path.join(root, "app", "education", "page.tsx"), "changed content\n");
  assert.throws(() => verifyProtectedSources(root), /app\/education\/page\.tsx: content differs/u);
});

test("the protected-source guard rejects a missing source", async (t) => {
  const { root } = await protectedFixture(t);
  await rm(path.join(root, "app", "education", "page.tsx"));
  assert.throws(() => verifyProtectedSources(root), /app\/education\/page\.tsx: protected source is missing/u);
});

test("the protected-source manifest cannot omit a required path", async (t) => {
  const { root, manifest } = await protectedFixture(t);
  delete manifest.sources["app/education/page.tsx"];
  await writeFile(path.join(root, "content", "protected-sources.json"), JSON.stringify(manifest));
  assert.throws(() => verifyProtectedSources(root), /must cover all seven protected sources/u);
});
