import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const baseSha = process.env.BASE_SHA;
if (!baseSha) {
  throw new Error("BASE_SHA is required to verify protected sources.");
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
  ":(literal)app/now/page.tsx",
  ":(literal)app/past-experience/page.tsx",
  ":(literal)app/past-experience/[slug]/page.tsx",
  ":(literal)app/past-experience/components/ExperienceDomainPage.tsx",
  ":(literal)app/lib/content/experience.ts",
  ":(literal)content/past-experience/archive-through-2026-06-30.md",
];

const authorizedProtectedSourceHashes = new Map([
  [
    "app/education/page.tsx",
    "23846a79f9bd6e4f5978932db2a50c4402b2e0136fd61efd63af864b2b8bddac",
  ],
]);

function normalizedSha256(file) {
  return createHash("sha256")
    .update(readFileSync(file, "utf8").replace(/\r\n?/gu, "\n"), "utf8")
    .digest("hex");
}

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
    "Protected Education, Past Experience, and Current Chapter sources are unchanged.";
} else if (isAuthorizedRootReset) {
  if (mergeBaseCheck.status === 1) {
    revisions = [baseSha, "HEAD"];
    comparisonMessage =
      "Authorized root reset detected; direct tree comparison confirms protected Education, Past Experience, and Current Chapter sources are unchanged.";
  } else {
    const emptyTreeSha = execFileSync(
      "git",
      ["hash-object", "-t", "tree", "--stdin"],
      { encoding: "utf8", input: "" },
    ).trim();
    revisions = [emptyTreeSha, "HEAD"];
    comparisonMessage =
      "Authorized root reset detected without the previous object; protected Education, Past Experience, and Current Chapter sources are introduced as additions.";
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

const authorizedChanges = [];
const forbidden = changes
  .split(/\r?\n/u)
  .filter(Boolean)
  .filter((line) => {
    if (line.startsWith("A\t")) return false;

    const [status, file] = line.split("\t");
    const approvedHash = authorizedProtectedSourceHashes.get(file);
    if (
      status === "M" &&
      approvedHash &&
      normalizedSha256(file) === approvedHash
    ) {
      authorizedChanges.push(file);
      return false;
    }

    return true;
  });

if (forbidden.length > 0) {
  throw new Error(
    "Protected Education, Past Experience, and Current Chapter sources are immutable; modification, deletion, and rename are forbidden:\n" +
      forbidden.join("\n"),
  );
}

if (authorizedChanges.length > 0) {
  console.log(
    "All other protected sources are unchanged; the explicitly authorized Education update matches its approved hash.",
  );
} else {
  console.log(comparisonMessage);
}
