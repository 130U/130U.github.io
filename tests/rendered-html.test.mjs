import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const domainPages = [
  {
    name: "Artificial Intelligence",
    path: "/past-experience/artificial-intelligence",
  },
  { name: "Data Science", path: "/past-experience/data-science" },
  {
    name: "Environmental, Social, and Governance",
    path: "/past-experience/environmental-social-and-governance",
  },
  { name: "Finance", path: "/past-experience/finance" },
  {
    name: "STEM Academic Competitions and Training",
    path: "/past-experience/stem-academic-competitions-and-training",
  },
];

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

function escapeText(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

test("renders the finished homepage and profile details", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>Strategy at a World Model Unicorn \| Duke B\.S\. &amp; M\.Eng\. \| Sequoia Scholar, Cohort 8<\/title>/i,
  );
  assert.match(html, /<h1>Personal Summary<\/h1>/);
  assert.match(html, /Strategy at a World Model Unicorn \| Duke B\.S\. &amp; M\.Eng\. \|\s*Sequoia Scholar, Cohort 8/);
  assert.match(html, /Beijing \| Boston, MA/);
  assert.match(html, /10@alumni\.duke\.edu/);
  assert.doesNotMatch(html, /Beijing, China|Beijing · New York/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("renders every public route", async () => {
  const expectations = [
    ["/education", /Master of Engineering in Risk Engineering/],
    ["/past-experience", /Theodore before July 1st, 2026/],
    ["/personal-posts", /The first post is being prepared/],
    ...domainPages.map(({ path, name }) => [path, new RegExp(escapeText(name))]),
  ];

  for (const [path, expected] of expectations) {
    const response = await render(path);
    assert.equal(response.status, 200, `Expected ${path} to render`);
    assert.match(await response.text(), expected);
  }
});

test("uses one typography system and concise page headings", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /--serif:\s*var\(--font\)/);
  assert.match(css, /--sans:\s*var\(--font\)/);
  assert.match(css, /--mono:\s*var\(--font\)/);
  assert.doesNotMatch(css, /Georgia|Palatino|SFMono|Consolas/);

  const education = await (await render("/education")).text();
  assert.match(education, /<h1>Education<\/h1>/);
  assert.doesNotMatch(education, /Mathematics, risk, and applied decision making|A deliberately broad toolkit/);
});

test("past experience landing page links to five separate domain pages", async () => {
  const html = await (await render("/past-experience")).text();

  for (const { name, path } of domainPages) {
    assert.match(html, new RegExp(`href="${path}/"`));
    assert.match(html, new RegExp(escapeText(name)));
  }

  assert.equal((html.match(/class="domain-directory-link"/g) ?? []).length, 5);
  assert.doesNotMatch(html, /domain-disclosure|path-invariant vertical time|LightGBM pairwise ranker/);
});

test("each domain page contains only its own exact archive content", async () => {
  const source = await readFile(
    new URL("../content/past-2026-06-30.md", import.meta.url),
    "utf8",
  );
  const domainSection = source.split("## Domain Experience")[1];
  assert.ok(domainSection, "Domain Experience must exist in the source archive");

  const sourceDomains = domainSection
    .split(/^### /gm)
    .slice(1)
    .map((block) => {
      const [name, ...lines] = block.split(/\r?\n/);
      return {
        name: name.trim(),
        bullets: lines
          .filter((line) => line.startsWith("- "))
          .map((line) => line.slice(2)),
      };
    });

  assert.deepEqual(
    sourceDomains.map(({ name }) => name),
    domainPages.map(({ name }) => name),
  );

  let exactBulletMatches = 0;

  for (const [index, domain] of sourceDomains.entries()) {
    const page = domainPages[index];
    const html = await (await render(page.path)).text();

    assert.match(html, new RegExp(`<h1>${escapeText(domain.name)}<\\/h1>`));
    assert.match(html, /href="\/past-experience\/"/);
    assert.match(html, /Nov 2025 - Jul 2026|Past Experience/);
    assert.doesNotMatch(html, /\bPresent\b/);

    for (const otherPage of domainPages.filter((item) => item.path !== page.path)) {
      assert.doesNotMatch(html, new RegExp(`href="${otherPage.path}/"`));
    }

    for (const bullet of domain.bullets) {
      assert.ok(
        html.includes(escapeText(bullet)),
        `Rendered archive changed or omitted bullet: ${bullet}`,
      );
      exactBulletMatches += 1;
    }
  }

  assert.equal(exactBulletMatches, 92);
});

test("personal posts omits the GitHub promotion card", async () => {
  const html = await (await render("/personal-posts")).text();
  assert.doesNotMatch(html, /For now, the best way to follow|Visit GitHub|contact-note/);
});
