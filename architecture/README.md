# Website architecture

[Open the interactive system map](https://www.theodoreoy.com/architecture/).

The viewer maps the website's content, build, deployment, and browser interactions.
It supports label search, light and dark themes, relationship
tracing, and image export. A downloaded `index.html` also works offline.

| File | Responsibility |
| --- | --- |
| `site.json` | Editable Archify definition of the current system |
| `index.html` | Standalone interactive viewer |
| `README.md` | Viewer usage and maintenance |
| `LICENSE` | MIT license for the Archify viewer |

The primary navigation contains About and Experience. Twenty-three canonical content
routes cover these pages, three Selected Research manuscripts, and eighteen Experience
detail pages. Eight compatibility pages bring the content export to thirty-one routes.
This viewer at `/architecture/` makes thirty-two exported routes, excluding 404.
`website/app/lib/content/` defines identity, routes, content loaders, and research
Markdown and math rendering. `website/content/` contains approved Experience copy,
structured manuscripts, frozen source evidence, and integrity contracts. GitHub
Actions publishes the assembled `website/out/` export to GitHub Pages on the custom domain.

About opens with its interactive Canvas2D name entrance before the profile. The navigation
menu, shared article contents, and legal-note previews run in the browser. The website uses no request-time API, database,
authentication, or analytics. The [maintenance guide](../docs/maintenance.md)
documents content ownership, output contracts, security, and publishing.

About presents three Selected Research entries with links to on-site manuscripts
and research summaries. Critical Dependence Stress for Portfolio Diversification
appears first, followed by the Asian-options and Rough Heston papers. Article headers
contain the return link, title, GitHub link, and Full Manuscript link. Reading content
begins at Abstract; pre-abstract front matter stays in the protected source. The
articles include core chapters (dependence stress 1–5; Asian options 1–10; Rough
Heston 1–8) and references; appendices are linked on GitHub. Each source JSON records
its exact upstream commit, blob, and manuscript URL. Frozen manuscript evidence lives
in `website/content/sources/selected-research/`. The `dependence/` subdirectory contains
the dependence-stress paper's frozen TeX files and independent provenance record;
`website/scripts/import-dependence-research.mjs` imports that manuscript deterministically.

The main website takes its grid, warm paper color, and fine rules from Cognition as
a design reference and uses self-hosted Inter. Page titles and section headings use
22px, entry headings use 18px, and body text uses 14px. Experience directory labels
and numbers use 18px; formulas use 1.15em. The architecture viewer has independent
diagram controls and geometry and shares the site's HTML type roles.

Update `site.json` from the current source and `.github/workflows/pages.yml`, then
validate and generate it with the installed Archify skill:

```sh
node <archify>/bin/archify.mjs validate architecture architecture/site.json --quality showcase --json
node <archify>/bin/archify.mjs deliver architecture architecture/site.json architecture/index.html --quality showcase --json
node website/scripts/integrate-architecture.mjs
```

Run these commands from the repository root. `<archify>` is the local Archify skill
directory. The integration script applies the website's six HTML type roles,
major-section heading semantics, and normalized control labels while preserving
SVG geometry. The viewer loads
`../assets/fonts/inter.css`, preloads regular Inter, and inherits `--font-text`.
Visual exports embed the local regular and italic Inter files in SVG; PNG and WebM
render from the same prepared fonts. The integration is safe to run repeatedly.
Run `npm --prefix website run check` to verify the complete export, including the
viewer and its production content security policy.

The viewer uses the MIT license. Published pages use the website's self-hosted Inter
fonts under the SIL Open Font License, included with the font assets. A standalone
offline HTML file uses system sans fallbacks when those font assets are unavailable.
