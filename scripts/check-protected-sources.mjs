import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const baseSha = process.env.BASE_SHA;
if (!baseSha) {
  throw new Error("BASE_SHA is required to verify protected sources.");
}

const protectedPathspecs = [
  ":(literal)app/education/page.tsx",
  ":(literal)app/now/page.tsx",
  ":(literal)app/past-experience/page.tsx",
  ":(literal)app/past-experience/[slug]/page.tsx",
  ":(literal)app/past-experience/components/ExperienceDomainPage.tsx",
  ":(literal)app/lib/content/experience.ts",
  ":(literal)content/past-experience/archive-through-2026-06-30.md",
];

const approvedProtectedChanges = new Map([
  [
    "M\tapp/now/page.tsx",
    "c410e1c9109889f018983698bd3cf276e4d34aa2db1e96d56f96cefb34adb7e6",
  ],
]);

function normalizedSourceHash(relativePath) {
  const normalized = readFileSync(relativePath, "utf8").replace(/\r\n?/gu, "\n");
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

const baseCommitCheck = spawnSync(
  "git",
  ["cat-file", "-e", `${baseSha}^{commit}`],
  { encoding: "utf8" },
);
if (baseCommitCheck.status !== 0) {
  throw new Error(
    `BASE_SHA must resolve to a commit in the checked-out history: ${baseSha}\n` +
      (baseCommitCheck.stderr || "The commit is unavailable."),
  );
}

const mergeBaseCheck = spawnSync(
  "git",
  ["merge-base", "--is-ancestor", baseSha, "HEAD"],
  { encoding: "utf8" },
);
if (mergeBaseCheck.status !== 0) {
  throw new Error(
    "BASE_SHA must be an ancestor of HEAD. History rewrites fail closed; " +
      "protected-source verification cannot be bypassed.\n" +
      (mergeBaseCheck.stderr || "No valid ancestry path exists."),
  );
}

const diffArguments = ["--name-status", "--find-renames"];
const protectedPaths = ["--", ...protectedPathspecs];
const committedChanges = execFileSync(
  "git",
  ["diff", ...diffArguments, `${baseSha}...HEAD`, ...protectedPaths],
  { encoding: "utf8" },
).trim();
const workingChanges = execFileSync(
  "git",
  ["diff", ...diffArguments, "HEAD", ...protectedPaths],
  { encoding: "utf8" },
).trim();
const changes = [...new Set([committedChanges, workingChanges].flatMap((value) =>
  value.split(/\r?\n/u).filter(Boolean),
))];

const unapprovedChanges = changes
  .filter((change) => {
    const expectedHash = approvedProtectedChanges.get(change);
    if (!expectedHash) return true;
    return normalizedSourceHash("app/now/page.tsx") !== expectedHash;
  });

if (unapprovedChanges.length > 0) {
  throw new Error(
    "Protected Education, Past Experience, and Current Chapter sources may change only " +
      "through an exact approved content revision; unapproved modification, addition, " +
      "deletion, and rename are forbidden:\n" +
      unapprovedChanges.join("\n"),
  );
}

console.log(
  "Protected sources are unchanged or match the approved Current Chapter revision.",
);
