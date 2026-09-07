import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const PROTECTED_PATHS = [
  "app/education/page.tsx",
  "app/now/page.tsx",
  "app/past-experience/page.tsx",
  "app/past-experience/[slug]/page.tsx",
  "app/past-experience/components/ExperienceDomainPage.tsx",
  "app/lib/content/experience.ts",
  "content/past-experience/archive-through-2026-06-30.md",
];

export function verifyProtectedSources(root = ROOT) {
  const manifest = JSON.parse(
    readFileSync(path.join(root, "content", "protected-sources.json"), "utf8"),
  );
  const paths = Object.keys(manifest.sources ?? {}).sort();
  if (
    manifest.version !== 1 ||
    manifest.normalization !== "LF" ||
    JSON.stringify(paths) !== JSON.stringify([...PROTECTED_PATHS].sort())
  ) {
    throw new Error("The protected-source manifest must cover all seven protected sources with LF normalization.");
  }

  const failures = [];
  for (const relative of PROTECTED_PATHS) {
    const expected = manifest.sources[relative];
    if (!/^[\da-f]{64}$/u.test(expected)) {
      failures.push(`${relative}: invalid SHA-256 in the protected-source manifest`);
      continue;
    }
    try {
      const source = readFileSync(path.join(root, relative), "utf8").replace(/\r\n?/gu, "\n");
      const actual = createHash("sha256").update(source, "utf8").digest("hex");
      if (actual !== expected) failures.push(`${relative}: content differs from its protected SHA-256`);
    } catch (error) {
      failures.push(`${relative}: ${error.code === "ENOENT" ? "protected source is missing" : "protected source cannot be read"}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Protected source verification failed:\n${failures.join("\n")}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyProtectedSources();
  console.log("All seven protected sources match their content hashes.");
}
