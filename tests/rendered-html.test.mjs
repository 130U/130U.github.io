import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
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
  assert.match(html, /<h1 lang="la">Quis ego sum\?<\/h1>/);
  assert.match(html, /<span>Strategy at a World Model Unicorn<\/span>/);
  assert.match(html, /<span>Duke B\.S\. &amp; M\.Eng\.<\/span>/);
  assert.match(html, /<span>Sequoia Scholar, Cohort 8<\/span>/);
  assert.match(html, /Beijing \| Boston/);
  assert.doesNotMatch(html, /Boston, MA/);
  assert.match(html, /10@alumni\.duke\.edu/);
  assert.doesNotMatch(html, /Beijing, China|Beijing · New York/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("publishes the lo monogram as browser and device icons", async () => {
  const html = await (await render()).text();
  assert.match(html, /href="https:\/\/www\.theodoreoy\.com\/favicon\.ico"/);
  assert.match(html, /href="https:\/\/www\.theodoreoy\.com\/favicon-32\.png"/);
  assert.match(html, /href="https:\/\/www\.theodoreoy\.com\/favicon-16\.png"/);
  assert.match(html, /href="https:\/\/www\.theodoreoy\.com\/apple-touch-icon\.png"/);

  for (const name of [
    "lo-monogram.png",
    "icon-512.png",
    "apple-touch-icon.png",
    "favicon-32.png",
    "favicon-16.png",
    "favicon.ico",
  ]) {
    const asset = await stat(new URL(`../public/${name}`, import.meta.url));
    assert.ok(asset.size > 0, `${name} must not be empty`);
  }
});

test("renders every public route", async () => {
  const expectations = [
    ["/education", /Master of Engineering in Risk Engineering/],
    ["/past-experience", /Theodore before July 1st, 2026/],
    ["/personal-posts", /From Vision and Instructions to Robot Actions/],
    [
      "/personal-posts/from-vision-and-instructions-to-robot-actions",
      /What the comparison is really showing/,
    ],
    ...domainPages.map(({ path, name }) => [path, new RegExp(escapeText(name))]),
  ];

  for (const [path, expected] of expectations) {
    const response = await render(path);
    assert.equal(response.status, 200, `Expected ${path} to render`);
    assert.match(await response.text(), expected);
  }
});

test("uses an editorial serif-led system with restrained sans utilities", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /--display:\s*"Instrument Sans Variable"/);
  assert.match(css, /--body-serif:\s*"Newsreader Variable"/);
  assert.match(css, /--serif:\s*var\(--body-serif\)/);
  assert.match(css, /scrollbar-gutter:\s*stable/);
  assert.match(css, /body\s*{[^}]*font-family:\s*var\(--body-serif\)/s);
  assert.match(css, /\.profile-sidebar h2\s*{[^}]*font-family:\s*var\(--body-serif\)/s);
  assert.match(css, /\.page-intro h1\s*{[^}]*font-family:\s*var\(--body-serif\)[^}]*font-weight:\s*560/s);
  assert.match(css, /\.primary-nav a\s*{[^}]*font-family:\s*var\(--mono\)/s);

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

test("personal posts publishes the first research note and removes the placeholder", async () => {
  const html = await (await render("/personal-posts")).text();
  assert.match(
    html,
    /href="\/personal-posts\/from-vision-and-instructions-to-robot-actions\/"/,
  );
  assert.match(html, /RESEARCH NOTE/);
  assert.match(html, /July 29, 2026/);
  assert.doesNotMatch(html, /COMING SOON|The first post is being prepared/);
  assert.doesNotMatch(html, /For now, the best way to follow|Visit GitHub|contact-note/);
});

test("first research note preserves the reviewed taxonomy and source diagram", async () => {
  const path = "/personal-posts/from-vision-and-instructions-to-robot-actions";
  const html = await (await render(path)).text();

  assert.match(
    html,
    /<h1>From Vision and Instructions to Robot Actions: Two Emerging Paths<\/h1>/,
  );
  assert.match(html, /single-pass world encoder/);
  assert.match(html, /one forward pass through the video model/);
  assert.match(html, /future-video tokens from influencing action tokens/);
  assert.match(html, /World-Action Model.*emerging label/s);
  assert.match(html, /Primary sources/);
  assert.match(html, /src="\/wam-vla-two-paths-en\.png"/);

  const diagram = await stat(
    new URL("../public/wam-vla-two-paths-en.png", import.meta.url),
  );
  assert.ok(diagram.size > 300_000, "The full-resolution source diagram must be retained");
});
