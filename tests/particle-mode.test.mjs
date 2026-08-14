import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const ROOT = path.resolve(import.meta.dirname, "..");

async function loadParticleMode() {
  const source = await readFile(
    path.join(
      ROOT,
      "app",
      "components",
      "particle-background",
      "particle-mode.ts",
    ),
    "utf8",
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
  return import(moduleUrl);
}

test("only the Home route selects the narrative particle mode", async () => {
  const { particleModeForPathname } = await loadParticleMode();
  assert.equal(particleModeForPathname("/"), "hero");
  for (const pathname of [
    "/education/",
    "/past-experience/",
    "/past-experience/artificial-intelligence/",
    "/now/",
    "/missing/",
  ]) {
    assert.equal(particleModeForPathname(pathname), "ambient");
  }
});
