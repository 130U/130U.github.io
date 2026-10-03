import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve("@next/eslint-plugin-next"));
const { getRootDirs } = nextRequire("./utils/get-root-dirs.js");

test("Next.js lint root discovery uses the maintained directory-pattern provider", () => {
  const provider = nextRequire("fast-glob/package.json");
  assert.equal(provider.name, "@theodoreoy/directory-glob");
  assert.equal(provider.version, "1.0.0");
  assert.equal(provider.dependencies.tinyglobby, "0.2.17");
  assert.equal(provider.scripts, undefined, "The provider must not run installation scripts");
  assert.deepEqual(Object.keys(nextRequire("fast-glob")), ["globSync"]);
});

test("Next.js resolves configured root directories without expanding literal roots or including files", async (t) => {
  const originalCwd = process.cwd();
  const temporaryParent = resolve(tmpdir());
  const fixture = mkdtempSync(join(temporaryParent, "theodore-root-directories-"));
  for (const directory of ["apps/web/cache", "apps/api", "apps/site", "apps/.private"]) {
    mkdirSync(join(fixture, directory), { recursive: true });
  }
  for (const file of ["apps/README.md", "apps/web/index.js", "apps/web/cache/report.txt"]) {
    writeFileSync(join(fixture, file), "fixture\n");
  }
  process.chdir(fixture);
  const actual = (rootDir) => getRootDirs({ cwd: fixture, settings: { next: { rootDir } } })
    .map((directory) => resolve(fixture, directory)).sort();
  const expected = (...directories) => directories.map((directory) => resolve(fixture, directory)).sort();
  try {
    const fixtures = [
      ["default project directory", undefined, ["."]],
      ["literal directory", "apps/web", ["apps/web"]],
      ["directory wildcard", "apps/*", ["apps/api", "apps/site", "apps/web"]],
      ["brace alternatives", "apps/{web,api}", ["apps/web", "apps/api"]],
      ["multiple configured roots", ["apps/web", "apps/api"], ["apps/web", "apps/api"]],
      ["Windows separators", String.raw`apps\{web,api}`, ["apps/web", "apps/api"]],
      ["absolute directory", join(fixture, "apps/web"), ["apps/web"]],
      ["recursive literal directory", "apps/web/**", ["apps/web/cache"]],
      ["recursive wildcard directory", "apps/w*/**", ["apps/web", "apps/web/cache"]],
      ["ordinary file exclusion", "apps/*.md", []],
      ["nonexistent directory", "apps/missing", []],
    ];
    for (const [name, pattern, directories] of fixtures) {
      await t.test(name, () => assert.deepEqual(actual(pattern), expected(...directories)));
    }
  } finally {
    process.chdir(originalCwd);
    assert.equal(dirname(resolve(fixture)), temporaryParent);
    rmSync(fixture, { recursive: true, force: true });
  }
});
