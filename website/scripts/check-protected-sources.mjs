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
  "content/past-experience/experience.md",
  "app/lib/content/legal-papers.ts",
  "app/past-experience/[slug]/[paper]/page.tsx",
  "app/past-experience/components/LegalPaperPage.tsx",
  "content/legal-papers/autonomous-authority-in-space.json",
  "content/legal-papers/small-states-and-strategic-space-dependence.json",
  "content/legal-papers/solar-geoengineering-comparison-and-continuity.json",
  "content/legal-papers/mangrove-restoration-and-compensatory-mitigation.json",
  "app/lib/content/ai-projects.ts",
  "app/lib/content/routes.ts",
  "app/past-experience/components/AiResearchProjectPage.tsx",
  "app/past-experience/components/AiResearchMath.tsx",
  "content/artificial-intelligence/statistical-inference-and-resource-allocation-in-expert-data-production.json",
  "content/artificial-intelligence/task-validity-in-financial-synthetic-data.json",
  "content/artificial-intelligence/verification-and-supervision-in-scientific-reasoning-tasks.json",
  "content/artificial-intelligence/evidence-uncertainty-and-decision-guarantees-in-investment-research.json",
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
    throw new Error("The protected-source manifest must cover every required source with LF normalization.");
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
  console.log(`All ${PROTECTED_PATHS.length} protected sources match their content hashes.`);
}
