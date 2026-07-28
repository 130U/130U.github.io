import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the finished homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Home \| Theodore Ouyang<\/title>/i);
  assert.match(html, /Building decision-grade systems for the frontier AI era/);
  assert.match(html, /Sequoia Scholar, Cohort 8/);
  assert.match(html, /10@alumni\.duke\.edu/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("renders every public section", async () => {
  const expectations = [
    ["/education", /Master of Engineering in Risk Engineering/],
    ["/past-experience", /Selected roles and projects before July 1, 2026/],
    ["/personal-posts", /The first post is being prepared/],
  ];

  for (const [path, expected] of expectations) {
    const response = await render(path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), expected);
  }
});
