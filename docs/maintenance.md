# Maintenance

The site is a static personal record published at [theodoreoy.com](https://www.theodoreoy.com/).

## Repository

| Directory | Responsibility |
| --- | --- |
| `.github/` | Repository presentation and the Pages workflow |
| `architecture/` | Interactive system map and its editable specification |
| `docs/` | Design principles and maintenance guidance |
| `website/` | Application, content, assets, tools, and tests |

Run application commands from `website/`, or use `npm --prefix website run <command>`
from the repository root. Generated files remain inside the ignored `website/out/`
and `website/.next/` directories. Keep local screenshots and audit logs outside the repository.

## Routes and content

Paths in this table are relative to `website/`.

| Page | Route | Source |
| --- | --- | --- |
| About | `/` | `app/page.tsx`, `app/home.module.css`, shared About content |
| Education compatibility alias | `/education/` | `app/education/page.tsx`, shared About content |
| Asian-options research | `/education/certified-valuation-arithmetic-asian-options/` | `app/lib/content/selected-research.ts`, `content/selected-research/certified-valuation-arithmetic-asian-options.json` |
| Rough Heston research | `/education/certified-rough-heston-valuation/` | `app/lib/content/selected-research.ts`, `content/selected-research/certified-rough-heston-valuation.json` |
| Experience | `/experience/` | `app/components/experience/`, `content/experience-showcase.json` |
| Experience detail pages | `/experience/[slug]/` | Approved entries from `content/experience-showcase.json` |
| Experience compatibility aliases | `/past-experience/`, `/now/` | Shared Experience page |
| Legacy experience categories | `/past-experience/[slug]/` | Filtered approved Experience sections |
| AI research projects | `/past-experience/artificial-intelligence/[paper]/` | `app/lib/content/ai-projects.ts`, `content/artificial-intelligence/` |
| Legal articles | `/past-experience/legal-research-and-policy-analysis/[paper]/` | `app/past-experience/[slug]/[paper]/page.tsx`, `app/lib/content/legal-papers.ts`, `content/legal-papers/` |
| Architecture | `/architecture/` | `../architecture/index.html` |

`content/experience-showcase.json` is the approved English presentation source,
extracted verbatim from `experience-merged-bilingual.docx`. Its source-document
SHA-256 records the reviewed version. It contains five categories and eighteen
entries; Chinese audit text, editorial instructions, and long manuscripts are not
included. Do not substitute the older resume Markdown for this approved copy.
The historical `content/past-experience/experience.md` and its parser remain intact
for provenance and category definitions.

The primary navigation contains About and Experience. Experience presents all five
numbered sections in one page, with a single-column anchor directory at every
screen width and eighteen summaries. All eighteen Read More actions are links to
real pages. The eight AI and legal entries retain their existing manuscript URLs;
the other ten entries use `/experience/[slug]/`. Outer headings lead with the
institution or organization; legal headings use `Duke Law School: {research area}
Research`. Detail-page titles use `{institution}: {project title}`; internal title
colons render as em dashes, preserving only the institution separator. Position,
Location, and Dates form three stacked rows at every viewport, followed by the
approved Key Contributions with contextual notes appended as the final list items.
All items share the same typography and color. Do not repeat the outer summary.

AI pages continue directly from Key Contributions into the original numbered
article body. Only rendering omits the duplicate technical title, Project and
Author lines, Overview heading, and the old pre-chapter introduction; the full
source JSON remains protected and unchanged. Legal articles retain their complete
Abstract, text, author note, and footnotes after the contribution block. Contents
starts with Key Contributions and preserves the original chapter anchors.

`app/lib/content/routes.ts` supplies twenty-two canonical sitemap routes: About,
Experience, two Selected Research articles, eight Experience manuscripts, and ten
other Experience detail pages.
The static export also retains `/education/`, `/past-experience/`, `/now/`, and the
five old category URLs as compatibility pages. The category pages render the same
approved entries and point canonically to the corresponding Experience section.
There are thirty exported content routes and the separate `/architecture/`
reference: thirty-one routes in total, excluding 404.

Biographical, AI research, Selected Research, and legal source files are checked against `content/protected-sources.json`.
`content/visible-copy-manifest.json` independently records text, metadata, alt text,
and ARIA labels for all thirty content pages. Copy changes require the owner's explicit
request and an intentional update to these contracts. Presentation-only changes to
a protected component update its source hash while preserving the approved prose,
metadata, and formula source contracts. Tests also verify page counts and navigation
independently of the registry.

## Application

Next.js exports static HTML, CSS, and JavaScript. GitHub Pages serves these files;
there is no request-time backend, database, authentication, form submission, or analytics.

- `app/components/SiteShell.tsx` owns the shared reading frame.
- `app/components/SiteNavigation.tsx` owns the mobile menu and focus handling.
- `app/page.tsx` retains the interactive Canvas2D name entrance before About; `app/components/dithered-entrance/` owns its pointer, keyboard, fallback, and reduced-motion behavior. Its scroll cue still targets `#home-profile`.
- `app/components/research/` owns the shared research article and mathematical presentation.
- `app/components/InlineText.tsx` renders prose emphasis and citation links.
- `app/globals.css` and `app/home.module.css` implement the [design system](design.md).
- `app/lib/content/site.ts` owns site identity and metadata helpers.
- `app/lib/content/research-markdown.ts` parses research prose, headings, tables, and formulas.
- `app/lib/content/research-math.ts` renders mathematical SVG and assistive MathML on the server.

`app/components/AboutContent.tsx` supplies the shared About and Education-alias
content. It presents Duke University once above both degree records and omits the
fellowship from About. `app/lib/content/about.ts` retains all 49 course names in four
categories. Categories stack vertically; each list flows down up to two independent
CSS columns with a 16rem target width, a 24px column gap, and 2px between items.
Course names stay together across column breaks, and lists use one column below
768px. `app/home.module.css` scopes the compact
record spacing and consistent role styles to About. Its reading frame uses the
existing Inter family with `font-optical-sizing: none` and `"opsz" 14`; heading and
prose tracking is zero. Keep these role sizes synchronized with Experience and research pages.

Add a website page by updating its source, the route registry, sitemap expectations,
and output tests together. Keep browser interaction in focused client components.
Add a server only when a defined product requirement needs one.

`tooling/directory-glob/` supplies Next.js lint root-directory discovery through
the pinned Tinyglobby implementation. Its adapter preserves literal, wildcard,
recursive, and platform-specific directory paths. Integration tests exercise the
Next.js consumer directly. The dependency override is scoped to the Next.js lint
plugin; application dependencies and lint rules retain their normal configuration.

### Experience source updates

The approved bilingual Word document is the current authority for showcase copy.
Read its English blocks only; preserve category and entry order, metadata, each
contribution, and the two contextual notes. Update the JSON and its document hash
only when a replacement version is approved. AI and legal manuscript sources are
independently protected and are not regenerated from the showcase document.


### AI research projects

Domain `01`, AI Research and Engineering, links four project reading pages through
Read More actions following the outer summaries. Their existing URLs remain stable.
Each JSON source stores its original Notion title, URL, edit timestamp,
and complete Markdown body. Preserve that source, including its original opening
Project and Author paragraph. In the rendered page, show the institution and
project title, vertical metadata, and approved Key Contributions, then begin at
the first original numbered chapter. Omit the duplicate technical title and old
Project / Author / Overview introduction only in this presentation. Keep the
numbered body, emphasis, citations, table headers and cells, and formulas in their
original order. Do not add an abstract, references section, publication details,
or a download. Each reading page returns to its project anchor on Experience.

| Project page | Notion source |
| --- | --- |
| Statistical inference and resource allocation in expert data production | [Source](https://app.notion.com/p/3ed867f96db58171ad07d36248e8d05c?pvs=204) |
| Task validity in financial synthetic data | [Source](https://app.notion.com/p/3ed867f96db5810798b2f3668e2dd0a5?pvs=204) |
| Verification and supervision in scientific reasoning tasks | [Source](https://app.notion.com/p/3ed867f96db5814c91c0fd96d9348c2f?pvs=204) |
| Evidence uncertainty and decision guarantees in investment research | [Source](https://app.notion.com/p/3ed867f96db581cfaae7d40b93aaa080?pvs=204) |

`ResearchArticle` renders both AI projects and Selected Research with a focused CSS
Module that gives prose and table cells the shared 16px reading size, and H3 headings
the shared 18px subheading size.
`ResearchMath` uses `app/lib/content/research-math.ts` to render TeX on the server with the pinned MathJax
4.1.3 engine and its TeX font package. Visible equations contain complete SVG glyph
paths, use the shared `--type-math` relative scale of 1.15em and ink color, and load no browser math
engine or font resources. `ResearchMath.module.css` owns formula spacing and
scrolling. Display rows omit sentence punctuation and use explicit multiline spacing;
mathematical terms and equation labels remain intact. Assistive MathML preserves
semantic formulas and the exact original TeX annotation. Invalid formulas fail the
build. Tables and wide equations expose focusable scrolling regions.

AI project tests compare the retained numbered body with its original source blocks,
verify the presentation-only omission of the old preface, and check all 277 original formula annotations,
five tables, 27 citation links, and 26 second-level headings with the approved
documents. Update the project registry, independent route expectations, protected
source hashes, and visible-copy contracts together when synchronizing approved text.
The four project snapshots protect prose and formula positions independently from
the ordered TeX-and-display-mode hash and formula count. SVG geometry and assistive
MathML have independent regression checks for accents, fractions, aligned equations,
Greek glyphs, superscripts, and equation numbers. Formula presentation changes preserve
narrative text and source annotations. Approved navigation order or scrolling changes
update only the corresponding contract fields after independent verification.

### Selected Research

About presents two compact research entries before Education and Selected Coursework.
Each original title links to its on-site manuscript in black ink, turning blue on
hover or keyboard focus. A short paragraph states the mathematical method and the
achieved result within the paper's specified example. Keep numerical bounds and
improvements tied to their model, horizon, payoff, and comparison. Source links remain
on the manuscript pages; About has no separate
Paper, Repository, or Results action row. `app/lib/content/selected-research.ts`
loads both structured sources from `content/selected-research/`:

| Source | On-site manuscript scope |
| --- | --- |
| `certified-valuation-arithmetic-asian-options.json` | Abstract, chapters 1–10, references, and an appendix/supporting-material link |
| `certified-rough-heston-valuation.json` | Abstract, chapters 1–8, references, and an appendix/supporting-material link |

The pages use the shared `ResearchArticle` and `ResearchMath` components, with a
contents list, source links, and return links to the corresponding About research
entry at `/#<slug>`. Their navigation marks About as current. They publish the core
chapters rather than a rewritten overview. Appendices remain in the GitHub manuscript.
Each JSON source stores `repositoryUrl`, `sourceUrl`, `sourceCommit`, and `sourceBlob`.
The manuscript link is pinned to that source commit. When refreshing a paper, compare
against the pinned file, preserve the complete core chapters and references, and
update the provenance only for the version actually imported.

Preserve the Asian paper's distinction between the projected Euler pricing certificate
and its continuous-model comparison, including the assumptions for weak expansion and
posterior quantile results. Preserve the Rough Heston paper's stated configurations,
certificate scope, error definitions, and reproducibility limits. Approved content
changes update the source hash, visible-copy contract, independent output expectations,
and route registry together. Verify rendered formulas, internal manuscript links, and
appendix destinations before publishing.

### Legal papers

Domain `03`, Legal Research and Policy Analysis, links four selected papers:
`autonomous-authority-in-space`, `small-states-and-strategic-space-dependence`,
`solar-geoengineering-comparison-and-continuity`, and
`mangrove-restoration-and-compensatory-mitigation`. Preserve each paper's source
title, subtitle, author, date, abstract, numbered chapter hierarchy, paragraphs,
citations, and acknowledgment in its structured source. The manuscripts credit
Letao Ouyang and carry a December 2024 date.

| Manuscript | Source PDF |
| --- | --- |
| Who May Choose the Lesser Risk: Solar Geoengineering and the Legal Duties of Comparison and Continuity | `ESSAY1.pdf` |
| Small States and the Governance of Strategic Space Dependence | `ESSAY2.pdf` |
| Autonomous Authority in Space: Risk Tradeoffs and the Law of Delegation | `ESSAY3.pdf` |
| Mangrove Restoration and the Limits of Compensatory Mitigation: Lessons from Florida for the Greater Bay Area | `ESSAY4.pdf` |

`PaperParagraph.text` equals the concatenated run text; runs preserve source italics,
bold, capitalization, superscripts, and numbered references. Citation text uses the
same body size and spacing, including source small-capital runs. Numbered notes remain
sequential and every chapter has a unique anchor. Keep original PDFs and extraction
records outside public assets and the static export.

`LegalPaperPage` renders the institution-and-project heading, vertical metadata,
Key Contributions, complete original Abstract, article, and endnotes. `LegalPaperContents`
provides responsive chapter navigation and section tracking. `LegalPaperReader`
adds native-dialog note previews, with source-link focus restoration and a route to
the complete endnote. Original anchors, contents links, and return links remain
available without JavaScript. Reading controls use the shared font and type tokens.

To add an approved paper, update its structured source, the legal-paper slug registry,
the matching project route in `experience.ts`, and the independent content/output
contracts together. Use the supplied manuscript as the wording and citation authority.

Article validation checks all thirty exported content routes, eighteen Experience
reading links including four legal articles, chapter
anchors, complete numbered references, bidirectional footnote links, and the absence
of public PDF files. Validate the published text against the approved source before
refreshing visible-copy hashes. Read back the four live article pages after publishing.

### Static export

The `build` command runs Next.js and then `scripts/assemble-static.mjs`. Assembly
places the standalone architecture viewer and license under `/architecture/`,
normalizes Next.js segment payload names, and applies the production HTML security
policy. Payload normalization validates containment and destination collisions
before moving files; export entries may not be symbolic links. Preserve these
output-contract tests when updating Next.js.

## Brand assets

`website/source-assets/brand/lo-mark.svg` is the editable LO master.
`npm run generate:brand-icons` creates its public SVG, favicon, and Apple touch derivatives.
`website/source-assets/brand/og.png` is the social-preview master;
`npm run optimize:images` creates `public/assets/brand/og-1774.jpg`.
`.github/assets/readme-cover.jpg` is the repository cover.

Editable masters and served derivatives have separate roles. Only assets needed by
visitors belong in `website/public/`.

## Typography assets

`website/public/assets/fonts/` contains the unmodified Inter 4.1 variable WOFF2
files, their SIL Open Font License, and the shared font stylesheet. The source is
the [official Inter 4.1 release](https://github.com/rsms/inter/releases/tag/v4.1).
The site layout and architecture viewer load this same stylesheet and regular-face
preload. Keep text in the inherited font; reserve separate lettering for brand artwork.

The visual reference is Cognition's grid, warm paper color, restrained rules, and
spacing. Inter remains the site's own self-hosted typeface. Research and other body
text share 16px, subsection headings share 18px, and math uses a relative 1.15em scale.
Section headings use 24px, or 22px below 768px. Experience directory labels use the
16px reading role and directory numbers use the 14px interface role. Main navigation
stays at 14px; section margin indices on About and Experience stay at 12px.
Keep these roles synchronized through `app/globals.css`; do not give a particular
article a larger prose size or change type size to fit a long title.

## Validation and publishing

```sh
cd website
npm ci --ignore-scripts
npm run check
npm run typecheck
npm audit --audit-level=low
npm run preview:static
```

Use Node.js 24 to match the deployment workflow. The local static preview binds to
`127.0.0.1` by default and serves the assembled export; use it for production-policy
verification. `npm run dev` uses the development security policy required by Next.js
development tooling.

Review the export at desktop and phone widths, including 320px. Check keyboard
navigation, menu dismissal and resizing, reduced motion, the JavaScript-free fallback,
local links, and the architecture viewer. Run `git diff --check` and inspect staged
files for credentials, temporary files, and generated build output.

The SHA-pinned GitHub Actions workflow validates pull requests. A push to `main`
validates, audits dependencies, and uploads `website/out/` to GitHub Pages. Build jobs
have read-only repository access; only deployment receives Pages write and OIDC access.
After publishing, verify the workflow for the exact commit and the live domain separately.

The build computes SHA-256 permissions for the exact inline scripts in each exported
HTML page, including the architecture viewer. The policy appears before scripts and
blocks arbitrary inline scripts, evaluation, frames, objects, and form submission.
Fonts load from the site's own origin. Inline event handlers are blocked on every
page. Inline styles support the framework and standalone viewer.
GitHub Pages controls HTTP response headers. The HTML policy cannot set response
headers or the `frame-ancestors` directive. Keep dependency versions and the lockfile
aligned, and preserve the major-scoped dependency overrides. The dependency audit
checks the advisory data available at run time.

See [architecture](../architecture/README.md) for viewer editing and validation.
