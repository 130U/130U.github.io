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
| Selected Research | `content/sources/selected-research/` (pinned manuscripts), `content/selected-research/` (generated articles) | Research import scripts, `app/lib/content/selected-research.ts` | `/[paper]/` |
| Legal research | `content/legal-papers/` structured manuscripts, generated from the LAW repositories | `app/lib/content/legal-papers.ts` | `/experience/[slug]/` |
| Blog | `content/blog/<slug>.md`, images in `public/assets/blog/<slug>/` | `app/lib/content/blog.ts` | `/blog/`, `/blog/[slug]/` |
| Architecture | `../architecture/site.json` | Archify and `scripts/integrate-architecture.mjs` | `/architecture/` |

`app/lib/content/site.ts` owns site identity, core routes, and navigation types;
`app/lib/content/routes.ts` supplies canonical sitemap routes.
`experience-domains.ts` defines the five Experience categories. All eighteen
Experience entries have dedicated reading pages: four AI manuscripts, four legal
manuscripts, and ten ordinary detail pages.
About's Education section links to the dedicated Coursework page through Read More.
The page presents all 49 courses in four subject groups. About's biography and its
Fellowship paragraph live in `app/components/AboutContent.tsx`, and the Person record
in `app/layout.tsx` lists the manuscript name and the public profiles.

Every URL belongs to About (`/`, `/coursework/`, `/[paper]/`), Experience
(`/experience/`, `/experience/[slug]/`) or Blog (`/blog/`, `/blog/[slug]/`).
`app/experience/[slug]/page.tsx` renders an entry as an AI article, a legal article,
or a detail page from its category. The export holds the content
routes (About, Coursework, three Selected Research articles, Experience and its eighteen
entries, Blog, and one page per post), the architecture viewer, and the 404 page. A work that a
post presents is published on this domain at its repository's address, as
The Étude Sky is at `/BLOG-Etude-Sky/`.

### Blog

Each post is one Markdown file, `content/blog/<slug>.md`; its file name is its slug and
its URL is `/blog/<slug>/`. The front matter holds exactly `title`, `date`
(YYYY-MM-DD), `summary` (the index summary and page description), `hero` and `heroAlt`,
`image` and `imageAlt` (the 1200 × 630 social card), `work` (the work's address on this
domain) and `workDescription`. The body holds paragraphs with `*emphasis*` and links,
`## headings`, an epigraph written as `> quote` followed by `> — source`, and figures
written as `![caption](/assets/blog/<slug>/<image>.jpg "alt")`. `app/lib/content/blog.ts`
rejects anything else at build time. Images live in `public/assets/blog/<slug>/` and
are sized for a 2× display of the 576px column.

A work presented by a post, such as The Étude Sky (`130U/BLOG-Etude-Sky`), is a separate
repository published by GitHub Pages under this domain at `/<repository>/`; this
repository links to it and never builds it. Routes, the sitemap, and the tests follow
the files in `content/blog/`, and every image in `public/assets/blog/` must be cited by
its post. After adding a post, refresh the visible-copy manifest with
`node scripts/verify-visible-copy.mjs --emit > content/visible-copy-manifest.json`.

### AI research

Edit `content/sources/ai-portfolio/ai-research-and-engineering.md` as the single
authority for all four AI projects. It contains the directory disclosure, project
metadata, summaries, Problem and Approach, contributions and nested lists, and complete
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
Position, Location, Dates, Problem and Approach, Key Contributions, and numbered body.
Each article returns to its project anchor on Experience. Tests compare the full
generated fields and manuscript blocks with the maintained source and verify
mathematical rendering independently.

### Selected Research

The three papers use pinned research inputs and deterministic importers:

| Paper | Input and importer | On-site scope |
| --- | --- | --- |
| Critical Dependence Stress for Diversification Gains under Fixed Marginals | `content/sources/selected-research/dependence/`; `scripts/import-dependence-research.mjs` | Abstract, chapters 1–5 with their four figures, references, and supporting-material links |
| Certified Valuation of Arithmetic Asian Options | `content/sources/selected-research/asian-source.md` and the study results in `asian-studies/`; `scripts/import-selected-research.mjs` | Abstract, chapters 1–9 with their four figures, references, and supporting-material links |
| Certified Joint Pricing Errors in Rough Heston | `content/sources/selected-research/rough-source.md` and the saved banks in `rough-studies/`; `scripts/import-selected-research.mjs` | Abstract, chapters 1–8 with their four figures, references, and supporting-material links |

```sh
node scripts/import-selected-research.mjs
node scripts/import-dependence-research.mjs
node scripts/import-dependence-research.mjs --check
```

The source records identify the upstream repository, commit, blob, and file hashes.
Refresh these only for the version actually imported. Retain complete core chapters,
tables, references, theorem assumptions, error definitions, and reproducibility
limits. Distinguish the Asian paper's proved intervals from its simulation
estimates, and retain the Rough Heston paper's stated configurations and
finite-candidate scope.

Each page publishes its generated article in `content/selected-research/`: the imported
main text and references, the page description, and the upstream commit and blob. The
paper repositories are the authority for the text. Change wording there, pin the new
commit, and rerun the importer; each importer holds its page's description. The Rough
Heston page's Full Manuscript action is set in `app/lib/content/selected-research.ts`
and opens the article of the paper's release.

The dependence source tree includes supporting TeX inputs needed to resolve
cross-references. The article draws its four figures natively from their formulas (see
the article figures under Shared rendering and extension). The Asian manuscript sets
each figure as an image line followed by its caption paragraph; the importer joins the
two into one captioned figure, checks the two study results in `asian-studies/` against
their upstream blobs, and writes the values the four drawings plot to
`content/selected-research/certified-valuation-of-arithmetic-asian-options.figures.json`.
The Rough Heston manuscript sets each figure as one captioned image line; the importer
gives it a local path, checks the three saved banks in `rough-studies/` against their
upstream blobs, and writes the node-charge shares, the joint error set and the exact
thresholds to `content/selected-research/certified-joint-pricing-errors-in-rough-heston.figures.json`.
The readers link appendices and supplementary proofs to the pinned full manuscripts and
return to the corresponding About research entry.

### Legal research

`content/legal-papers/` preserves source titles, authors, dates, Abstracts, chapter
hierarchies, paragraph runs, tables with their captions, citations, acknowledgments, and
numbered footnotes. Each file is generated by `site_legal_sync.py` from the manuscript in
its LAW repository, which is the authority for the text; the converter sets the
footnotes' small-caps fields in true small caps:

| Structured manuscript | Source repository and manuscript |
| --- | --- |
| `autonomous-authority-in-space.json` | `130U/LAW-Autonomous-Authority-in-Space`, `manuscript/autonomous-authority-in-space.md` |
| `small-states-and-the-governance-of-strategic-space-dependence.json` | `130U/LAW-Small-States-and-the-Governance-of-Strategic-Space-Dependence`, `manuscript/small-states-and-the-governance-of-strategic-space-dependence.md` |
| `who-may-choose-the-lesser-risk.json` | `130U/LAW-Who-May-Choose-the-Lesser-Risk`, `manuscript/who-may-choose-the-lesser-risk.md` |
| `mangrove-restoration-and-the-limits-of-compensatory-mitigation.json` | `130U/LAW-Mangrove-Restoration-and-the-Limits-of-Compensatory-Mitigation`, `manuscript/mangrove-restoration-and-the-limits-of-compensatory-mitigation.md` |

Change wording in the repository and regenerate the file; then refresh
`content/protected-sources.json` and the visible-copy manifest.

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
`legal-research.tsx` hold the figures, `dependence-manuscript.tsx` draws the dependence
manuscript's four figures from the formulas in `130U/RESEARCH-Critical-Dependence-Stress-for-Diversification-Gains-under-Fixed-Marginals`
(`computation/code/generate_mechanism_figures.py` and `computation/calculations/plot_profiles_and_flows.py` at
the pinned commit), `asian-manuscript.tsx` draws the Asian manuscript's four figures
from its imported study results and from Proposition 4.1 as
`app/lib/content/asian-kink-bound.ts` evaluates it, `rough-manuscript.tsx` draws the
Rough Heston manuscript's four figures from its imported banks and from the forward
variance curve and netting ratio in `app/lib/content/rough-heston-curves.ts`, and
`FigureController` adds view switches, readouts, linked emphasis, the proof-obligation
graph (each through `enhanceFigure`, which the zoom stage applies to its enlarged copy
as well), table column highlighting and the entrances of figures and table rows. The
research renderer frames every table and sets a directly preceding "**Table N.**"
caption paragraph inside the frame as its title; `ZoomStage` keeps row labels in view,
fades the scrolling edge, and opens the zoomed view of any table or figure on one stage
per page, so a new table or figure needs no registration. `buildReferenceTargets` in
`app/lib/content/article-headings.ts` anchors the numbered equations, statements, tables
and figures of the Asian and Rough Heston manuscripts and links their references; a
re-import that numbers a label twice fails the build.
`app/lib/content/article-figures.ts` places each figure after one existing block, named
by the opening of its source text or a table's first header cell, and lists the
manuscript text each figure restates. The build fails when an anchor matches no block or
several, or when any listed text is missing from the article, so edit a figure's data
and its evidence together. The same module maps each manuscript image path to its native
drawing, with evidence checked the same way, and names the row or column a table
emphasizes. Manuscript checks in the tests read articles without these figures and
without the labels of the native drawings, keeping their manuscript captions.
`tests/figure-reading-load.test.mjs` holds every built figure to the reading budget of
the design (caption, title, legend and value-note limits), and the browser layout check
fails a caption set at the reading size or a legend entry that wraps from 390px, so a
new or edited figure is checked against the same budget.

`ResearchArticle` serves AI and Selected Research. The Markdown parser supports
typed prose, emphasis, links, headings, tables, and formulas rather than arbitrary
HTML. `ResearchMath` renders TeX to self-contained SVG and assistive MathML during
the build; no browser math engine is loaded. The original TeX is carried in accessible
annotations. Invalid formulas fail the build. Wide equations and tables scroll
locally without shrinking the reading text. The renderer derives the row pitch of
displayed mathematics from `--manuscript-leading` and `--type-math`, which it holds as
`RESEARCH_MANUSCRIPT_LEADING` and `RESEARCH_DISPLAY_MATH_SCALE`; change a token and its
constant together (`tests/research-math.test.mjs` compares them). The manuscript's
vertical spaces are written in `--manuscript-line`; `app/lib/content/argument-units.ts`
marks the paragraphs that open a statement, a proof or a run-in head and the paragraph
that closes a proof, and `tests/manuscript-rhythm.test.mjs` pins the counts per
manuscript, so a manuscript update that adds a statement updates the count with it. A
display that is one `array` and nothing else but its `\tag` is drawn as a table of
mathematics (`renderResearchDisplayTable`): its columns may be `l`, `c`, `r` and `|`, its
rules `\hline`, and its row breaks `\\` or `\\[dim]`; any other column type or rule
(`p{}`, `@{}`, `\cline`) fails the build, so a new form is designed before it is
published. `tests/display-tables.test.mjs` pins the three such displays in the
manuscripts.

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
npx playwright install chromium
npm run test:browser
npm run preview:static
```

`check` verifies protected sources, lints, builds, tests the artifact, and compares
visible copy. The static preview binds to `127.0.0.1:8123` by default and serves
`out/`; use it to inspect production behavior. `npm run dev` uses the separate
development security policy required by Next.js tooling. `test:browser` uses isolated
Chromium contexts and the actual static export to check every figure and view at
six viewport widths, plus enlarged-text and keyboard-scroll regressions, and holds every
manuscript table heading to two lines clear of its table's zoom control, every displayed
equation to one starting axis, and every equation number to the column's right edge. It reports
geometry and failure screenshots in `website/test-results/figure-layout/`. CI installs
Chromium and requires these checks to pass before publishing.

Review desktop and phone layouts, including 320px, keyboard navigation, menu
dismissal, reduced motion, JavaScript-free content, local links, equations, tables and
their zoom, note previews, and architecture exports. Run `git diff --check` and inspect staged
files for credentials, temporary files, and unintended generated output.

The workflow validates pull requests with read-only repository access. A push to
`main` runs validation and the dependency audit, uploads `website/out/`, and deploys
with Pages write and OIDC permissions confined to the deployment job. Every action
is SHA-pinned. A newer pull-request run cancels the older one; production runs queue,
so a deployment in progress always completes. After publishing, verify the workflow
for the exact commit and read back the live routes separately.

Review the repository's Dependabot alerts, secret scanning, and push-protection
settings when maintaining a release. The workflow's dependency audit checks the
installed lockfile on every build.

Each exported HTML page receives hashes for its exact inline scripts before any
script executes. Production CSP blocks arbitrary inline scripts, eval, inline event
handlers, embedded frames/objects, media, and form submission; fonts, images, and
network fetches use the same origin, and only the architecture viewer adds the data and
blob images its exports draw. Inline styles support framework and viewer geometry.
Formulas are rendered at build time; a formula that sets a link, style, or class
attribute stops the build.
GitHub Pages controls HTTP response headers: a meta policy cannot enforce
`frame-ancestors` or supply host-level security headers. Keep the lockfile and pinned
dependencies aligned. An advisory check is current only when the npm endpoint returns
a successful result.
