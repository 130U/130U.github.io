import { execFileSync, spawnSync } from "node:child_process";

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

const changes = execFileSync(
  "git",
  [
    "diff",
    "--name-status",
    "--find-renames",
    `${baseSha}...HEAD`,
    "--",
    ...protectedPathspecs,
  ],
  { encoding: "utf8" },
).trim();

if (changes) {
  throw new Error(
    "Protected Education, Past Experience, and Current Chapter sources are immutable; " +
      "modification, addition, deletion, and rename are forbidden:\n" +
      changes,
  );
}

console.log(
  "Protected Education, Past Experience, and Current Chapter sources are unchanged.",
);
