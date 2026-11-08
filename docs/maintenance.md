# Maintenance

The site is a static portfolio published at [theodoreoy.com](https://www.theodoreoy.com/).
Next.js builds HTML, CSS, and JavaScript; GitHub Pages serves the assembled export.
There is no request-time API, database, authentication, form submission, or analytics.
Use Node.js 24 to match deployment. Run application commands from `website/`, or use
`npm --prefix website run <command>` from the repository root.

## Repository

| Directory | Responsibility |
| --- | --- |
| `.github/` | Repository presentation and the Pages workflow |
| `architecture/` | Editable system-map definition and standalone viewer |
| `docs/` | Design and maintenance guidance |
| `website/app/` | Routes, shared readers, content loaders, and browser interactions |
| `website/content/` | Maintained content, research source inputs, provenance, and integrity contracts |
| `website/public/` | Assets included in the static export |
| `website/source-assets/` | Editable brand masters |
| `website/scripts/`, `website/tests/` | Import, build, and verification utilities |

`website/.gitignore` excludes installed dependencies, build output, logs, generated
Next.js types, and TypeScript build metadata. Keep local screenshots,
audit logs, and original source documents outside the repository unless they are
explicitly maintained research inputs. Only visitor-facing assets belong in `public/`.

Documentation has one responsibility per entry point: [the website README](../website/README.md)
provides setup and a directory map; [design](design.md) defines the visual system;
this guide owns content and release procedures; [the architecture README](../architecture/README.md)
owns viewer generation. Keep these guides about the maintained system. Source-version
history belongs in manuscript provenance, and implementation history belongs in Git.

## Content ownership and routes

Paths below are relative to `website/`.

| Content | Maintained input | Loader or importer | Route |
| --- | --- | --- | --- |
| About | `app/components/AboutContent.tsx`, `app/lib/content/about.ts` | Shared About component | `/` |
| Coursework | `app/lib/content/about.ts` | `app/coursework/page.tsx` | `/coursework/` |
| Experience | `content/experience-showcase.json`; AI fields are generated from the manuscript below | `app/lib/content/experience-showcase.ts` | `/experience/`, `/experience/[slug]/` |
| AI research | `content/sources/ai-portfolio/ai-research-and-engineering.md` | `scripts/import-ai-portfolio.mjs`, `app/lib/content/ai-projects.ts` | `/experience/[slug]/` |
| Selected Research | `content/sources/selected-research/` (frozen import), `content/selected-research/site-edition/` (published text) | Research import scripts, `app/lib/content/selected-research.ts` | `/[paper]/` |
| Legal research | `content/legal-papers/` structured manuscripts | `app/lib/content/legal-papers.ts` | `/experience/[slug]/` |
| Blog | `content/blog/<slug>.md`, images in `public/assets/blog/<slug>/` | `app/lib/content/blog.ts` | `/blog/`, `/blog/[slug]/` |
| Architecture | `../architecture/site.json` | Archify and `scripts/integrate-architecture.mjs` | `/architecture/` |

`app/lib/content/site.ts` owns site identity, core routes, and navigation types;
`app/lib/content/routes.ts` supplies canonical sitemap routes.
`experience-domains.ts` defines the five Experience categories. All eighteen
Experience entries have dedicated reading pages: four AI manuscripts, four legal
manuscripts, and ten ordinary detail pages.
About's Education section links to the dedicated Coursework page through Read More.
The page presents all 49 courses in four subject groups.

Every URL belongs to About (`/`, `/coursework/`, `/[paper]/`), Experience
(`/experience/`, `/experience/[slug]/`) or Blog (`/blog/`, `/blog/[slug]/`).
`app/experience/[slug]/page.tsx` renders an entry as an AI article, a legal article,
or a detail page from its category. The export holds the content
routes (About, Coursework, three Selected Research articles, Experience and its eighteen
entries, Blog, and one page per post), the architecture viewer, and the 404 page. A work that a
post presents is published on this domain at its own address named after the work, as
The Étude Sky is at `/etude-sky/`.

### Blog

Each post is one Markdown file, `content/blog/<slug>.md`; its file name is its slug and
its URL is `/blog/<slug>/`. The front matter holds exactly `title`, `date`
(YYYY-MM-DD), `summary` (the index summary and page description), `hero` and `heroAlt`,
`image` and `imageAlt` (the 1200 × 630 social card), `work` (the work's address on this
domain) and `workDescription`. The body holds paragraphs with `*emphasis*` and links,
`## headings`, an epigraph written as `> quote` followed by `> — source`, and figures
written as `![caption](/assets/blog/<slug>/<image>.jpg "alt")`. `app/lib/content/blog.ts`
rejects anything else at build time. Images live in `public/assets/blog/<slug>/` and
are sized for a 2× display of the 612px column.

A work presented by a post, such as The Étude Sky (`130U/etude-sky`), is a separate
repository published by GitHub Pages under this domain at `/<repository>/`; this
repository links to it and never builds it. Routes, the sitemap, and the tests follow
the files in `content/blog/`, and every image in `public/assets/blog/` must be cited by
its post. After adding a post, refresh the visible-copy manifest with
`node scripts/verify-visible-copy.mjs --emit > content/visible-copy-manifest.json`.

### AI research

Edit `content/sources/ai-portfolio/ai-research-and-engineering.md` as the single
authority for all four AI projects. It contains the directory disclosure, project
metadata, summaries, contributions and nested lists, Architectural Context, and complete
numbered manuscripts with citations, tables, and TeX. Preserve the project's metadata
labels, ordered section structure, and chapter sequence so the importer can validate
the complete input before writing.

```sh
node scripts/import-ai-portfolio.mjs
```

The importer updates the four AI entries in `content/experience-showcase.json` and
the four article JSON files in `content/artificial-intelligence/`. It records the
source path and LF-normalized SHA-256, preserves non-AI entries, and copies each
numbered manuscript directly. Edit the canonical manuscript rather than generated
AI fields. Citation links and mathematical definitions belong in that manuscript.

The list presents the single portfolio-wide disclosure and four briefs. Keep NDA
and disclosure permissions in that opening note rather than repeating them in
the briefs or manuscripts. Detail pages show the institution and project title,
Position, Location, Dates, Key Contributions, Architectural Context, and numbered body.
Each article returns to its project anchor on Experience. Tests compare the full
generated fields and manuscript blocks with the maintained source and verify
mathematical rendering independently.

### Selected Research

The three papers use pinned research inputs and deterministic importers:

| Paper | Input and importer | On-site scope |
| --- | --- | --- |
| Critical Dependence Stress for Portfolio Diversification | `content/sources/selected-research/dependence/`; `scripts/import-dependence-research.mjs` | Abstract, chapters 1–5, references, and supporting-material links |
| Certified Valuation of Arithmetic Asian Options | `content/sources/selected-research/asian-source.md`; `scripts/import-selected-research.mjs` | Abstract, chapters 1–10, references, and supporting-material links |
| Certified Joint Pricing Errors in Rough Heston | `content/sources/selected-research/rough-source.md`; `scripts/import-selected-research.mjs` | Abstract, chapters 1–8, references, and supporting-material links |

```sh
node scripts/import-selected-research.mjs
node scripts/import-dependence-research.mjs
node scripts/import-dependence-research.mjs --check
```

The source records identify the upstream repository, commit, blob, and file hashes.
Refresh these only for the version actually imported. Retain complete core chapters,
tables, references, theorem assumptions, error definitions, and reproducibility
limits. Distinguish the Asian paper's projected-Euler certificate from its
continuous-model comparison, and retain the Rough Heston paper's stated
configurations and finite-candidate scope.

Each page publishes its file in `content/selected-research/site-edition/`, which begins
with a one-line `description` and revises expository prose only. The frozen JSON stays
pinned to upstream. `tests/site-edition.test.mjs` requires the edition to keep the frozen
mathematics, formal statements, tables, references, and chapter structure. Edit the
edition for wording; rerun the importers only when the upstream manuscript changes, then
reconcile the edition with the new import.

The dependence source tree includes supporting TeX inputs needed to resolve
cross-references. The article draws its four figures natively from their formulas (see
the article figures under Shared rendering and extension). The readers link appendices
and supplementary proofs to the pinned full manuscripts and return to the corresponding
About research entry.

### Legal research

`content/legal-papers/` preserves source titles, authors, dates, Abstracts, chapter
hierarchies, paragraph runs, citations, acknowledgments, and numbered footnotes.
The approved source PDFs are external inputs, not served downloads:

| Structured manuscript | Source PDF |
| --- | --- |
| `solar-geoengineering-comparison-and-continuity.json` | `ESSAY1.pdf` |
| `small-states-and-strategic-space-dependence.json` | `ESSAY2.pdf` |
| `autonomous-authority-in-space.json` | `ESSAY3.pdf` |
| `mangrove-restoration-and-compensatory-mitigation.json` | `ESSAY4.pdf` |

`PaperParagraph.text` must equal the concatenated run text. Preserve emphasis,
capitalization, superscripts, unique chapter anchors, and sequential notes.
`LegalPaperPage` presents metadata and contributions before the complete Abstract,
manuscript, and endnotes. `LegalPaperReader` adds native-dialog note previews with
focus restoration; chapter and endnote links also work without JavaScript.

## Shared rendering and extension

`SiteShell` owns the reading frame. `SiteNavigation` renders the primary navigation
and mobile menu on top-level pages, or one parent link on detail pages. Detail links
return to the originating Education, Selected Research, or Experience anchor.
`ArticleReadingLayout`/`ArticleContents` own the article structure and responsive
navigation. `ExperienceSection` and `ExperienceDetails` keep all categories and
detail pages consistent. `SectionDirectory` owns the shared numbered anchor directory
for Experience and Coursework, including its frame, dashed row dividers, decorative
indices, and View feedback for pointer, keyboard, and touch input. Framed lists use the
global `ledger`, `ledger-item`, `ledger-title`, `ledger-body`, and `ledger-prose`
classes, every Read More link uses `read-more` with the shared `ReadingArrow`, and every
return link uses `ReturnArrow`; reuse them for any new list or page. `LogicDiagram`
renders the article diagrams from `app/lib/content/architecture-diagrams.ts`. Browser
interaction lives in focused client components, and the About hero is isolated in
`app/components/clarinet-hero/`.

Article figures live in `app/components/figures/`: `kit.tsx` holds the frame, scales,
plot, schematic and bar primitives, `selected-research.tsx`, `ai-research.tsx` and
`legal-research.tsx` hold the figures, `dependence-manuscript.tsx` draws the
dependence manuscript's four figures from the formulas in
`130U/mathematical-finance-project` (`code/generate_mechanism_figures.py` and
`new-computations/plot_profiles_and_flows.py` at the pinned commit), and
`FigureController` adds view switches, readouts, linked emphasis, the
proof-obligation graph, table column highlighting and the entrances of figures and
table rows. The research renderer frames every table and sets a directly preceding
"**Table N.**" caption paragraph inside the frame as its title.
`app/lib/content/article-figures.ts` places each figure after one existing block,
named by the opening of its source text or a table's first header cell, and lists the
manuscript text each figure restates. The build fails when an anchor matches no block
or several, or when any listed text is missing from the article, so edit a figure's
data and its evidence together. The same module maps each dependence image path to
its native drawing, with evidence checked the same way, and names the row or column a
table emphasizes. Manuscript checks in the tests read articles without these figures
and without the labels of the native drawings, keeping their manuscript captions.

`ResearchArticle` serves AI and Selected Research. The Markdown parser supports
typed prose, emphasis, links, headings, tables, and formulas rather than arbitrary
HTML. `ResearchMath` renders TeX to self-contained SVG and assistive MathML during
the build; no browser math engine is loaded. The original TeX is carried in accessible
annotations. Invalid formulas fail the build. Wide equations and tables scroll
locally without shrinking the reading text.

Use the semantic typography tokens in `app/globals.css` and the shared font files.
The [design guide](design.md#typography) defines each role's size, weight, family,
and responsive behavior. Apply a role by meaning: an institution or paper name is
an item title (the subheading token) even when it is the page's H1. Shared components own the corresponding
layout and interaction rules.

When adding content, update its source, loader/slug registry, route mapping, sitemap
expectations, and output tests together. Experience routes are keyed by stable
entry IDs; add the corresponding mapping when adding an entry. The loader checks
for missing routes, duplicate slugs, and mismatched AI or legal manuscript routes.

`content/protected-sources.json` checks approved source bytes with LF normalization;
`content/visible-copy-manifest.json` independently checks rendered text, metadata,
alt text, and ARIA labels. Review intended content changes before updating either
contract. Presentation changes preserve approved prose and formula annotations.
Keep independent route, link, figure, and mathematical checks when updating a loader.

## Assets and static assembly

`source-assets/brand/lo-mark.svg` is the editable mark;
`npm run generate:brand-icons` produces the public SVG and icon derivatives.
`source-assets/brand/og.png` is the social-preview master;
`npm run optimize:images` produces `public/assets/brand/og-1774.jpg`.
The repository README displays the same card from `public/assets/brand/og-1774.jpg`.

The Inter and Source Serif 4 variable fonts and their SIL Open Font Licenses live
in `public/assets/fonts/`. The site and architecture viewer share `inter.css`,
which disables automatic optical sizing, fixes the optical axis at 14, and sets lining
numerals. The main site also loads `source-serif.css` for prose and
small indices. The architecture tool UI, hero name, and institution names use
Inter. Keep both font licenses with the assets when updating or redistributing them.

`npm run build` runs Next.js, then `scripts/assemble-static.mjs`. Assembly includes
the architecture viewer and its license, normalizes segment payload filenames, and
applies production CSP. Payload moves validate containment and destination
collisions; export entries may not be symbolic links. Preserve these output checks
when upgrading Next.js. See [architecture](../architecture/README.md) for viewer
generation and export-font integration.

## Validation, security, and publishing

```sh
cd website
npm ci --ignore-scripts
npm run check
npm run typecheck
npm audit --audit-level=low
npm run preview:static
```

`check` verifies protected sources, lints, builds, tests the artifact, and compares
visible copy. The static preview binds to `127.0.0.1:8123` by default and serves
`out/`; use it to inspect production behavior. `npm run dev` uses the separate
development security policy required by Next.js tooling.

Review desktop and phone layouts, including 320px, keyboard navigation, menu
dismissal, reduced motion, JavaScript-free content, local links, equations, tables,
note previews, and architecture exports. Run `git diff --check` and inspect staged
files for credentials, temporary files, and unintended generated output.

The workflow validates pull requests with read-only repository access. A push to
`main` runs validation and the dependency audit, uploads `website/out/`, and deploys
with Pages write and OIDC permissions confined to the deployment job. Every action
is SHA-pinned. After publishing, verify the workflow for the exact commit and read
back the live routes separately.

Review the repository's Dependabot alerts, secret scanning, and push-protection
settings when maintaining a release. The workflow's dependency audit checks the
installed lockfile on every build.

Each exported HTML page receives hashes for its exact inline scripts before any
script executes. Production CSP blocks arbitrary inline scripts, eval, inline event
handlers, embedded frames/objects, and form submission; fonts and network fetches
use the same origin. Inline styles support framework and viewer geometry.
GitHub Pages controls HTTP response headers: a meta policy cannot enforce
`frame-ancestors` or supply host-level security headers. Keep the lockfile, pinned
dependencies, and scoped overrides aligned. An advisory check is current only when
the npm endpoint returns a successful result.
