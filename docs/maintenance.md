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
| `website/scripts/`, `tests/`, `tooling/` | Import, build, verification, and lint utilities |

`website/.gitignore` excludes installed dependencies, build output, caches, logs,
generated Next.js types, and TypeScript build metadata. Keep local screenshots,
audit logs, and original source documents outside the repository unless they are
explicitly maintained research inputs. Only visitor-facing assets belong in `public/`.

## Content ownership and routes

Paths below are relative to `website/`.

| Content | Maintained input | Loader or importer | Route |
| --- | --- | --- | --- |
| About | `app/components/AboutContent.tsx`, `app/lib/content/about.ts` | Shared About component | `/` |
| Coursework | `app/lib/content/about.ts` | `app/coursework/page.tsx` | `/coursework/` |
| Experience | `content/experience-showcase.json`; AI fields are generated from the manuscript below | `app/lib/content/experience-showcase.ts` | `/experience/`, `/experience/[slug]/` |
| AI research | `content/sources/ai-portfolio/ai-research-and-engineering.md` | `scripts/import-ai-portfolio.mjs`, `app/lib/content/ai-projects.ts` | `/past-experience/artificial-intelligence/[paper]/` |
| Selected Research | `content/sources/selected-research/` | Research import scripts, `app/lib/content/selected-research.ts` | `/education/[paper]/` |
| Legal research | `content/legal-papers/` structured manuscripts | `app/lib/content/legal-papers.ts` | `/past-experience/legal-research-and-policy-analysis/[paper]/` |
| Architecture | `../architecture/site.json` | Archify and `scripts/integrate-architecture.mjs` | `/architecture/` |

`app/lib/content/site.ts` owns site identity, core routes, and navigation types;
`app/lib/content/routes.ts` supplies canonical sitemap routes.
`experience-domains.ts` defines the five Experience categories. All eighteen
Experience entries have dedicated reading pages: four AI manuscripts, four legal
manuscripts, and ten ordinary detail pages.
About's Education section links to the dedicated Coursework page through View
Coursework. The page preserves all 49 courses in four subject groups.

Compatibility routes remain functional: `/education/` renders shared About content;
`/past-experience/` and `/now/` render Experience; the five
`/past-experience/[slug]/` category pages filter the same approved entries. Their
canonical URLs point to the corresponding primary page. Keep these shared renderers
and their return links intact when changing navigation.

### AI research

Edit `content/sources/ai-portfolio/ai-research-and-engineering.md` as the single
authority for all four AI projects. It contains the directory disclosure, project
metadata, summaries, scope disclosures, contributions and nested lists,
Architectural Context, and complete numbered manuscripts with citations, tables,
and TeX. Preserve the project's metadata labels, ordered section structure, and
chapter sequence so the importer can validate the complete input before writing.

```sh
node scripts/import-ai-portfolio.mjs
```

The importer updates the four AI entries in `content/experience-showcase.json` and
the four article JSON files in `content/artificial-intelligence/`. It records the
source path and LF-normalized SHA-256, preserves non-AI entries, and copies each
numbered manuscript directly. Edit the canonical manuscript rather than generated
AI fields. Citation links and mathematical definitions belong in that manuscript.

The list presents the disclosure and four briefs. Detail pages show the institution
and project title, Position, Location, Dates, scope disclosure, Key Contributions,
Architectural Context, and numbered body. Each article returns to its project
anchor on Experience. Tests compare the full generated fields and manuscript
blocks with the maintained source and verify mathematical rendering independently.

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

The dependence source tree includes supporting TeX inputs needed to resolve
cross-references. Its four PNG figures are source evidence; copies in
`public/assets/research/dependence/` are served assets. Tests check their byte
identity. The readers link appendices and supplementary proofs to the pinned full
manuscripts and return to the corresponding About research entry.

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
for Experience and Coursework, including row rules, decorative indices, and View
feedback for pointer, keyboard, and touch input. Browser interaction stays in focused client components;
the About entrance is isolated in `components/dithered-entrance/`.

`ResearchArticle` serves AI and Selected Research. The Markdown parser supports
typed prose, emphasis, links, headings, tables, and formulas rather than arbitrary
HTML. `ResearchMath` renders TeX to self-contained SVG and assistive MathML during
the build; no browser math engine is loaded. Original TeX remains in accessible
annotations. Invalid formulas fail the build. Wide equations and tables scroll
locally without shrinking the reading text.

Use the shared typography tokens: 32px general titles and module headings (28px
below 768px), 18px institution/project/paper names and top-level directory labels,
14px prose, metadata, and auxiliary navigation, and 10px section/directory indices.
Headings and interface text retain Inter; narrative prose and small indices use
Source Serif 4. General headings use weight 500, names use 600, and directory labels
use 500. Inline formulas use 1em; displayed formulas use 1.15em. Pure inline numbers
inherit the surrounding prose family. Only the general heading size changes on
mobile. See [design](design.md) for spacing and mathematical geometry.

When adding content, update its source, loader/slug registry, route mapping, sitemap
expectations, and output tests together. Experience routes are keyed by stable
entry IDs; add the corresponding mapping when adding an entry. The loader checks
for missing routes, duplicate slugs, and mismatched AI or legal manuscript routes.

`content/protected-sources.json` checks approved source bytes with LF normalization;
`content/visible-copy-manifest.json` independently checks rendered text, metadata,
alt text, and ARIA labels. Review intended content changes before updating either
contract. Presentation changes preserve approved prose and formula annotations.
Keep independent route, link, figure, and mathematical checks when updating a loader.

`tooling/directory-glob/` adapts pinned Tinyglobby for Next.js lint directory
discovery. Its override is scoped to the lint plugin; preserve its directory-path
behavior and consumer tests when changing dependencies.

## Assets and static assembly

`source-assets/brand/lo-mark.svg` is the editable mark;
`npm run generate:brand-icons` produces the public SVG and icon derivatives.
`source-assets/brand/og.png` is the social-preview master;
`npm run optimize:images` produces `public/assets/brand/og-1774.jpg`.
The repository cover lives in `.github/assets/readme-cover.jpg`.

The Inter and Source Serif 4 variable fonts and their SIL Open Font Licenses live
in `public/assets/fonts/`. The site and architecture viewer share `inter.css`;
Inter retains automatic optical sizing disabled, the optical axis fixed at 14,
and lining numerals. The main site also loads `source-serif.css` for prose and
small indices. Keep the architecture tool UI and original particle wordmark in
Inter. Retain both font licenses when updating or redistributing the assets.

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

Dependabot alerts, secret scanning, and push protection are enabled for the
repository. Review open dependency and secret alerts when maintaining a release;
the workflow's dependency audit also checks the installed lockfile on every build.

Each exported HTML page receives hashes for its exact inline scripts before any
script executes. Production CSP blocks arbitrary inline scripts, eval, inline event
handlers, embedded frames/objects, and form submission; fonts and network fetches
use the same origin. Inline styles support framework and viewer geometry.
GitHub Pages controls HTTP response headers: a meta policy cannot enforce
`frame-ancestors` or supply host-level security headers. Keep the lockfile, pinned
dependencies, and scoped overrides aligned. An advisory check is current only when
the npm endpoint returns a successful result.
