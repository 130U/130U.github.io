import { execFileSync, spawnSync } from "node:child_process";

const baseSha = process.env.BASE_SHA;
if (!baseSha) {
  throw new Error("BASE_SHA is required to verify append-only published copy fixtures.");
}

const forcedPush = process.env.FORCED_PUSH === "true";
const authorizedRootResetSha = process.env.AUTHORIZED_ROOT_RESET_SHA;
const headSha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
const headCommitLine = execFileSync(
  "git",
  ["rev-list", "--parents", "-n", "1", "HEAD"],
  { encoding: "utf8" },
).trim();
const isRootCommit = headCommitLine.split(/\s+/u).length === 1;

const protectedPathspecs = [
  ":(literal)app/education/page.tsx",
  ":(literal)app/past-experience/page.tsx",
  ":(literal)app/past-experience/[slug]/page.tsx",
  ":(literal)app/past-experience/components/ExperienceDomainPage.tsx",
  ":(literal)app/lib/content/experience.ts",
  ":(literal)content/past-experience/archive-through-2026-06-30.md",
  ":(glob)tests/fixtures/published-copy/*.json",
];

const mergeBaseCheck = spawnSync(
  "git",
  ["merge-base", "--is-ancestor", baseSha, "HEAD"],
  { encoding: "utf8" },
);

const isAuthorizedRootReset =
  forcedPush &&
  isRootCommit &&
  Boolean(authorizedRootResetSha) &&
  headSha === authorizedRootResetSha;

let revisions;
let comparisonMessage;

if (mergeBaseCheck.status === 0) {
  revisions = [`${baseSha}...HEAD`];
  comparisonMessage =
    "Protected Education and Past Experience sources are unchanged; published-copy snapshots contain additions only.";
} else if (isAuthorizedRootReset) {
  if (mergeBaseCheck.status === 1) {
    revisions = [baseSha, "HEAD"];
    comparisonMessage =
      "Authorized root reset detected; direct tree comparison confirms protected sources are unchanged and published-copy snapshots contain additions only.";
  } else {
    const emptyTreeSha = execFileSync(
      "git",
      ["hash-object", "-t", "tree", "--stdin"],
      { encoding: "utf8", input: "" },
    ).trim();
    revisions = [emptyTreeSha, "HEAD"];
    comparisonMessage =
      "Authorized root reset detected without the previous object; protected sources and preservation snapshots are introduced as additions.";
  }
} else {
  throw new Error(
    "BASE_SHA is not an ancestor of HEAD, and this push is not the explicitly authorized root reset.\n" +
      (mergeBaseCheck.stderr || "No merge base exists."),
  );
}

const changes = execFileSync(
  "git",
  [
    "diff",
    "--name-status",
    "--find-renames",
    ...revisions,
    "--",
    ...protectedPathspecs,
  ],
  { encoding: "utf8" },
).trim();

const forbidden = changes
  .split(/\r?\n/u)
  .filter(Boolean)
  .filter((line) => !line.startsWith("A\t"));

if (forbidden.length > 0) {
  throw new Error(
    "Protected Education and Past Experience sources are immutable, and published-copy snapshots are append-only; modification, deletion, and rename are forbidden:\n" +
      forbidden.join("\n"),
  );
}

console.log(comparisonMessage);
