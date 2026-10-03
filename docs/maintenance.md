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
| Home | `/` | `app/page.tsx`, `app/home.module.css` |
| Education | `/education/` | `app/education/page.tsx` |
| Past Experience | `/past-experience/` | `app/past-experience/page.tsx` |
| Experience details | `/past-experience/[slug]/` | `app/lib/content/experience.ts`, `content/past-experience/` |
| AI research projects | `/past-experience/artificial-intelligence/[paper]/` | `app/lib/content/ai-projects.ts`, `content/artificial-intelligence/` |
| Legal articles | `/past-experience/legal-research-and-policy-analysis/[paper]/` | `app/past-experience/[slug]/[paper]/page.tsx`, `app/lib/content/legal-papers.ts`, `content/legal-papers/` |
| Current Chapter | `/now/` | `app/now/page.tsx` |
| Architecture | `/architecture/` | `../architecture/index.html` |

`content/past-experience/experience.md` contains the current experience record.
Use domain, organization, project, and optional subsection headings, followed by
experience bullets. Employment and training entries require Position and Dates;
Location and Website appear when supplied by the source. The Selected Research
Papers entry requires Research areas, Author credit, and Manuscript dates.
Domain introductions precede the first organization. Project introductions follow
the project heading and precede its bullets. Inline `**bold**`, `*italic*`, and
`[citation](https://example.com)` links are supported in prose; raw HTML is rendered
as text. All five domain pages display project introductions in true italics.
The experience registry validates five domains and their Markdown entries during
build. `app/lib/content/routes.ts` supplies the website sitemap. The architecture
viewer is a separate repository reference, linked from the GitHub introduction.

Biographical, AI research, and legal source files are checked against `content/protected-sources.json`.
`content/visible-copy-manifest.json` independently records text, metadata, alt text,
and ARIA labels for all seventeen website pages. Copy changes require the owner's explicit
request and an intentional update to these contracts. Presentation-only changes to
a protected component update its source hash while preserving the approved prose,
metadata, and formula source contracts. Tests also verify page counts and navigation
independently of the registry.

## Application

Next.js exports static HTML, CSS, and JavaScript. GitHub Pages serves these files;
there is no request-time backend, database, authentication, form submission, or analytics.

- `app/components/SiteShell.tsx` owns the shared reading frame.
- `app/components/SiteNavigation.tsx` owns the mobile menu and focus handling.
- `app/components/dithered-entrance/` owns the Home Canvas2D wordmark and static fallback.
- `app/globals.css` and `app/home.module.css` implement the [design system](design.md).
- `app/lib/content/site.ts` owns site identity and metadata helpers.

Add a website page by updating its source, the route registry, sitemap expectations,
and output tests together. Keep browser interaction in focused client components.
Add a server only when a defined product requirement needs one.

### Resume sources

The five sections are maintained in the owner's Notion Master Resume. Synchronize
the approved source wording, emphasis, links, metadata, and order into the experience
Markdown. Convert source headings and line breaks to the site's structure. English
copy uses straight quotation marks and apostrophes; retain legal symbols, accents in
proper names, and meaningful mathematical notation. Keep extraction files,
screenshots, and source-comparison evidence outside the repository.

| Section | Notion source |
| --- | --- |
| AI Research and Engineering | [Source](https://app.notion.com/p/98c4dbb19cbb46fa9fa6fed2da1d6ac1?pvs=204) |
| Data Science | [Source](https://app.notion.com/p/dcf2ef0d06b24895a4b72db158922523?pvs=204) |
| Legal Research and Policy Analysis | [Source](https://app.notion.com/p/7df21bc60ff2400c80859b5a6afe4922?pvs=204) |
| Finance and Consulting | [Source](https://app.notion.com/p/d62ffb825a8d469c9759b5c76f5eb87f?pvs=204) |
| STEM Academic Competitions and Training | [Source](https://app.notion.com/p/246e29cd61d6410381ecb068bbd1eaea?pvs=204) |

### AI research projects

Domain `01`, AI Research and Engineering, links four project reading pages through
Read more actions placed between the project introduction and its contributions.
Each JSON source stores its original Notion title, URL, edit timestamp,
and complete Markdown body. Preserve the opening Project and Author paragraph,
section headings, prose, emphasis, citations, table headers and cells, and formulas.
Use the source structure without adding an abstract, references section, publication
details, or a download. Each reading page returns to its project anchor in the overview.

| Project page | Notion source |
| --- | --- |
| Statistical inference and resource allocation in expert data production | [Source](https://app.notion.com/p/3ed867f96db58171ad07d36248e8d05c?pvs=204) |
| Task validity in financial synthetic data | [Source](https://app.notion.com/p/3ed867f96db5810798b2f3668e2dd0a5?pvs=204) |
| Verification and supervision in scientific reasoning tasks | [Source](https://app.notion.com/p/3ed867f96db5814c91c0fd96d9348c2f?pvs=204) |
| Evidence uncertainty and decision guarantees in investment research | [Source](https://app.notion.com/p/3ed867f96db581cfaae7d40b93aaa080?pvs=204) |

`AiResearchProjectPage` uses the existing article reading styles. `AiResearchMath`
uses `app/lib/content/ai-math.ts` to render TeX on the server with the pinned MathJax
4.1.3 engine and its TeX font package. Visible equations contain complete SVG glyph
paths, use the shared `--type-math` size and ink color, and load no browser math
engine or font resources. `AiResearchMath.module.css` owns formula spacing and
scrolling. Display rows omit sentence punctuation and use explicit multiline spacing;
mathematical terms and equation labels remain intact. Assistive MathML preserves
semantic formulas and the exact original TeX annotation. Invalid formulas fail the
build. Tables and wide equations expose focusable scrolling regions.

Tests compare every rendered source block, all 277 original formula annotations,
five tables, 27 citation links, and 26 second-level headings with the approved
documents. Update the project registry, independent route expectations, protected
source hashes, and visible-copy contracts together when synchronizing approved text.
The four project snapshots protect prose and formula positions independently from
the ordered TeX-and-display-mode hash and formula count. SVG geometry and assistive
MathML have independent regression checks for accents, fractions, aligned equations,
Greek glyphs, superscripts, and equation numbers. Formula presentation changes preserve
narrative text and source annotations. Approved navigation order or scrolling changes
update only the corresponding contract fields after independent verification.

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

`LegalPaperPage` renders the article and complete endnotes. `LegalPaperContents`
provides responsive chapter navigation and section tracking. `LegalPaperReader`
adds native-dialog note previews, with source-link focus restoration and a route to
the complete endnote. Original anchors, contents links, and return links remain
available without JavaScript. Reading controls use the shared font and type tokens.

To add an approved paper, update its structured source, the legal-paper slug registry,
the matching project route in `experience.ts`, and the independent content/output
contracts together. Use the supplied manuscript as the wording and citation authority.

Article validation checks all seventeen website routes, four legal reading links, chapter
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
page. Inline styles support the canvas and viewer.
GitHub Pages controls HTTP response headers. The HTML policy cannot set response
headers or the `frame-ancestors` directive. Keep dependency versions and the lockfile
aligned, and preserve the major-scoped dependency overrides. The dependency audit
checks the advisory data available at run time.

See [architecture](../architecture/README.md) for viewer editing and validation.
