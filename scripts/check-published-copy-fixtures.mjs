import { execFileSync } from "node:child_process";

const baseSha = process.env.BASE_SHA;
if (!baseSha) {
  throw new Error("BASE_SHA is required to verify append-only published copy fixtures.");
}

const protectedPathspecs = [
  "tests/fixtures/content-baseline.json",
  "tests/fixtures/accessible-label-baseline.json",
  "tests/fixtures/accessible-labelledby-baseline.json",
  ":(glob)tests/fixtures/published-copy/*.json",
];

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

const forbidden = changes
  .split(/\r?\n/u)
  .filter(Boolean)
  .filter((line) => !line.startsWith("A\t"));

if (forbidden.length > 0) {
  throw new Error(
    "Preservation fixtures are immutable after introduction and published-copy snapshots are append-only; modification, deletion, and rename are forbidden:\n" +
      forbidden.join("\n"),
  );
}

console.log("Preservation fixture changes contain additions only.");
