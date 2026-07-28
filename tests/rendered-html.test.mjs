import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.match(
    html,
    /<title>Strategy at a World Model Unicorn \| Duke B\.S\. &amp; M\.Eng\. \| Sequoia Scholar, Cohort 8<\/title>/i,
  );
  assert.match(html, /<h1>Personal Summary<\/h1>/);
  assert.match(html, /holds a Bachelor of Science and a Master of Engineering/);
  assert.match(html, /Sequoia Scholar, Cohort 8/);
  assert.match(html, /10@alumni\.duke\.edu/);
  assert.doesNotMatch(html, /Constructive internal dissent/);
  assert.doesNotMatch(html, /Looking for earlier roles|historical experience through/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("renders every public section", async () => {
  const expectations = [
    ["/education", /Master of Engineering in Risk Engineering/],
    ["/past-experience", /Theodore before July 1st, 2026/],
    ["/personal-posts", /The first post is being prepared/],
  ];

  for (const [path, expected] of expectations) {
    const response = await render(path);
    assert.equal(response.status, 200);
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

test("preserves the complete five-domain experience archive", async () => {
  const response = await render("/past-experience");
  const html = await response.text();

  const domainNames = [
    "Artificial Intelligence",
    "Data Science",
    "Environmental, Social, and Governance",
    "Finance",
    "STEM Academic Competitions and Training",
  ];

  for (const domain of domainNames) {
    assert.match(html, new RegExp(domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.equal((html.match(/<details class="domain-disclosure">/g) ?? []).length, 5);
  assert.equal((html.match(/<details class="domain-disclosure" open/g) ?? []).length, 0);

  assert.match(html, /path-invariant vertical time/);
  assert.match(html, /LightGBM pairwise ranker/);
  assert.match(html, /West Lake restoration/);
  assert.match(html, /more than 600 Greater China dental deals/);
  assert.match(html, /Designed more than 100 original high-difficulty physics problems/);
  assert.match(html, /Nov 2025 - Jul 2026/);
  assert.doesNotMatch(html, /\bPresent\b/);
  assert.doesNotMatch(html, /ARCHIVE BOUNDARY|current through June 30, 2026/i);

  const source = await readFile(
    new URL("../content/past-2026-06-30.md", import.meta.url),
    "utf8",
  );
  const domainSection = source.split("## Domain Experience")[1];
  assert.ok(domainSection, "Domain Experience must exist in the source archive");
  assert.equal((domainSection.match(/^### /gm) ?? []).length, 5);
  const bullets = domainSection
    .split(/\r?\n/)
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));
  assert.equal(bullets.length, 92);

  const escapeText = (value) =>
    value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  for (const bullet of bullets) {
    assert.ok(
      html.includes(escapeText(bullet)),
      `Rendered archive changed or omitted bullet: ${bullet}`,
    );
  }
});
