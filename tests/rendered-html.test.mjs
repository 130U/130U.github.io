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
  assert.match(html, /href="\/now\/"/);
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
    ["/now", /A New Chapter/],
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
  assert.match(education, /<h2>Duke University<\/h2>/);
  assert.match(
    education,
    /<h3 class="education-degree">Master of Engineering in Risk Engineering<\/h3>/,
  );
  assert.match(education, /class="entry-location">Durham, USA<\/p>/);
  assert.doesNotMatch(education, /Mathematics, risk, and applied decision making|A deliberately broad toolkit/);

  const coursework = education.split('<section class="coursework"')[1];
  assert.ok(coursework, "Selected Coursework must render");
  assert.equal((coursework.match(/class="course-list"/g) ?? []).length, 4);
  assert.equal((coursework.match(/<li>/g) ?? []).length, 31);
  assert.match(
    coursework,
    /Advanced Linear Algebra.*Complex Analysis.*Financial Mathematics.*Mathematical Approaches to Financial Derivatives.*Mathematical Modeling.*Measure Theory.*Numerical Analysis.*Ordinary Differential Equations.*Partial Differential Equations.*Real Analysis.*Stochastic Differential Equations.*Stochastic Processes.*Topology/s,
  );
  assert.match(
    coursework,
    /Advanced Topics in Engineering Computing.*Algorithms.*Deep Learning.*Machine Learning.*Statistical Methodology.*Technology-Driven Quantitative Finance/s,
  );
  assert.match(
    coursework,
    /Corporate Finance.*Econometrics.*Financial Accounting.*Independent Study in Economics.*Macroeconomics.*Mathematical Analysis of Macroeconomics.*Microeconomics.*Venture Capital/s,
  );
  assert.match(
    coursework,
    /Ethics and Leadership.*Global China and Global Challenges.*Ocean and Coastal Law.*Space Law/s,
  );
  assert.doesNotMatch(coursework, /<p>[^<]*(?:analysis|learning|finance)[^<]*<\/p>/i);

  assert.match(
    css,
    /\.education-institution h2\s*{[^}]*font-size:\s*1\.55rem[^}]*font-weight:\s*620/s,
  );
  assert.match(
    css,
    /\.education-degree\s*{[^}]*margin:\s*0 0 14px[^}]*font-size:\s*1\.38rem/s,
  );
  assert.match(
    css,
    /\.post-listing \.section-kicker\s*{[^}]*margin-bottom:\s*16px/s,
  );
});

test("uses restrained Apple-style materials and accessible motion", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /--ease-out:\s*cubic-bezier\(0\.23,\s*1,\s*0\.32,\s*1\)/);
  assert.match(css, /--radius-large:\s*28px/);
  assert.match(css, /\.topbar-inner\s*{[^}]*backdrop-filter:\s*blur\(24px\) saturate\(145%\)/s);
  assert.match(css, /\.profile-sidebar\s*{[^}]*border-radius:\s*var\(--radius-large\)/s);
  assert.match(css, /@media \(hover:\s*hover\) and \(pointer:\s*fine\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /@media \(prefers-reduced-transparency:\s*reduce\)/);
  assert.match(css, /@media \(prefers-contrast:\s*more\)/);
  assert.doesNotMatch(css, /transition:\s*all\b/);
  assert.doesNotMatch(
    css,
    /transition:[^;]*(?:padding|margin|width|height|top|right|bottom|left)[^;]*;/,
  );
  assert.doesNotMatch(css, /@keyframes\b/);
  assert.doesNotMatch(css, /\.post-listing\s*{[^}]*transition:/s);
  assert.match(
    css,
    /\.post-listing h2 a\s*{[^}]*transition:[^;]*text-decoration-color/s,
  );
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

  const dateLines = domainSection.match(/^\*\*Dates:\*\*.*$/gm) ?? [];
  assert.equal(dateLines.length, 16);
  assert.ok(
    dateLines.every(
      (line) =>
        !/\b(?:Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{4}\b/.test(
          line,
        ),
    ),
    "Past Experience month names must be written in full",
  );
  assert.ok(dateLines.every((line) => line.includes(" – ")));

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
    assert.match(html, /November 2025 – July 2026|Past Experience/);
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

test("publishes the July 2026 transition as a separate present-facing page", async () => {
  const html = await (await render("/now")).text();

  assert.match(html, /<time dateTime="2026-07">July 2026<\/time>/);
  assert.match(html, /<h1 id="now-heading">A New Chapter<\/h1>/);
  assert.match(html, /Nashua, New Hampshire/);
  assert.match(html, /Wudaokou, Beijing/);
  assert.match(html, /World Models and World-Action Models/);
  assert.doesNotMatch(html, /milestone|deliverable|roadmap|Present/);
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

test("keeps the static site free of unused backend scaffolding", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );
  const workflow = await readFile(
    new URL("../.github/workflows/pages.yml", import.meta.url),
    "utf8",
  );

  assert.equal(packageJson.scripts.build, "vinext build");
  assert.equal(packageJson.scripts.check, "npm run lint && npm test");
  assert.equal(packageJson.dependencies["drizzle-orm"], undefined);
  assert.equal(packageJson.devDependencies["drizzle-kit"], undefined);
  assert.match(workflow, /name: Validate and build\s+run: npm run check/);

  for (const path of [
    "../.openai/hosting.json",
    "../app/chatgpt-auth.ts",
    "../db/index.ts",
    "../drizzle.config.ts",
    "../examples/d1/app/api/notes/route.ts",
  ]) {
    await assert.rejects(stat(new URL(path, import.meta.url)), { code: "ENOENT" });
  }
});
