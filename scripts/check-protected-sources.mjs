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
    "app/education/page.tsx",
    {
      status: "M",
      hash: "fdd4bd0b88203d6753b5d8ba0653f62f4704367d8862dc863db1c0a5dabb8887",
    },
  ],
  [
    "app/now/page.tsx",
    {
      status: "M",
      hash: "293642ebb1b0e7fa21c69f34dcc5f0fd2fe396ca847d69b01818c4ea7dfa3888",
    },
  ],
  [
    "app/past-experience/page.tsx",
    {
      status: "M",
      hash: "3731858797e3a1e66135e6de87ad49e626971c8e18e86440c5d55de5dc523a11",
    },
  ],
  [
    "app/past-experience/components/ExperienceDomainPage.tsx",
    {
      status: "M",
      hash: "064ce14220d4080b7f4bb0ed619f4676f0185166f8f756ed3d6f53f8cc94317b",
    },
  ],
  [
    "content/past-experience/archive-through-2026-06-30.md",
    {
      status: "M",
      hash: "ed0bc21996ef84788dbf76d36311bd6552d775b023b2d80cddc4192aed90957f",
    },
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
    const [status, ...paths] = change.split("\t");
    const relativePath = paths.at(-1);
    if (!relativePath) return true;

    const approved = approvedProtectedChanges.get(relativePath);
    if (!approved || status !== approved.status) return true;
    return normalizedSourceHash(relativePath) !== approved.hash;
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
  "Protected sources are unchanged or match approved exact revisions.",
);
