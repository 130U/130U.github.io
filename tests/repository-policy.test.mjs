import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const WORKFLOW = path.join(ROOT, ".github", "workflows", "pages.yml");

test("the Pages workflow deploys only main and pins every action", async () => {
  const workflow = await readFile(WORKFLOW, "utf8");
  const pushBlock = workflow.match(
    /^  push:\r?\n([\s\S]*?)(?=^[ ]{2}\S|^permissions:)/mu,
  )?.[1];

  assert.equal(pushBlock?.trim(), "branches: [main]");
  assert.match(
    workflow,
    /group: pages-\$\{\{ github\.event_name == 'push' && 'production' \|\| github\.ref \}\}/u,
  );
  assert.match(
    workflow,
    /Upload Pages artifact\r?\n\s+if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/u,
  );
  assert.match(
    workflow,
    /^  deploy:\r?\n\s+if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/mu,
  );

  const actions = [...workflow.matchAll(
    /^\s*uses: ([^@\s]+)@([\da-f]{40}) # (v\d+)$/gmu,
  )].map((match) => match.slice(1));

  assert.deepEqual(actions, [
    ["actions/checkout", "d23441a48e516b6c34aea4fa41551a30e30af803", "v6"],
    ["actions/setup-node", "820762786026740c76f36085b0efc47a31fe5020", "v7"],
    [
      "actions/upload-pages-artifact",
      "fc324d3547104276b827a68afc52ff2a11cc49c9",
      "v5",
    ],
    ["actions/configure-pages", "45bfe0192ca1faeb007ade9deae92b16b8254a0d", "v6"],
    ["actions/deploy-pages", "cd2ce8fcbc39b97be8ca5fce6e763baed58fa128", "v5"],
  ]);
});

test("the protected-source guard accepts an unchanged checked-out commit", () => {
  const head = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();

  assert.doesNotThrow(() => {
    execFileSync(
      process.execPath,
      [path.join(ROOT, "scripts", "check-protected-sources.mjs")],
      {
        cwd: ROOT,
        env: { ...process.env, BASE_SHA: head },
        encoding: "utf8",
      },
    );
  });
});
