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

The website contains four main pages, five experience domains, four legal
papers, four AI research project pages, and two Selected Research papers linked
from Education. `website/app/lib/content/` defines identity, routes, content loaders,
and research Markdown and math rendering; `website/content/` contains the resume,
research sources, structured manuscripts, and integrity contracts. Next.js
generates nineteen content pages. The build includes
this viewer at `/architecture/` for twenty navigable routes, excluding 404, and GitHub Actions publishes `website/out/` to
GitHub Pages on the custom domain.

Home retains its interactive Canvas2D name entrance before the profile. The navigation
menu and legal-paper contents and note previews run in the browser. The website uses no request-time API, database,
authentication, or analytics. The [maintenance guide](../docs/maintenance.md)
documents content ownership, output contracts, security, and publishing.

Education lists the two papers as compact linked titles with GitHub links. The
on-site articles include their abstracts, core chapters (Asian options 1–10; Rough
Heston 1–8), and references; appendices are linked on GitHub. Each source JSON records
its exact upstream commit, blob, and manuscript URL.

The main website takes its grid, warm paper color, and fine rules from Cognition as
a design reference, while retaining self-hosted Inter. Body text shares a 17px scale,
H3 headings use 18px, and formulas use 1.15em. The architecture viewer retains its
independent diagram controls and geometry while sharing the site's HTML type roles.

Update `site.json` from the current source and `.github/workflows/pages.yml`, then
validate and generate it with the installed Archify skill:

```sh
node <archify>/bin/archify.mjs validate architecture architecture/site.json --quality showcase --json
node <archify>/bin/archify.mjs deliver architecture architecture/site.json architecture/index.html --quality showcase --json
node website/scripts/integrate-architecture.mjs
```

Run these commands from the repository root. `<archify>` is the local Archify skill
directory. The integration script applies the website's six HTML type roles,
major-section heading semantics, and sentence-case control labels while preserving
SVG geometry. The viewer loads
`../assets/fonts/inter.css`, preloads regular Inter, and inherits `--font-text`.
Visual exports embed the local regular and italic Inter files in SVG; PNG and WebM
render from the same prepared fonts. The integration is safe to run repeatedly.
Run `npm --prefix website run check` to verify the complete export, including the
viewer and its production content security policy.

The viewer uses the MIT license. Published pages use the website's self-hosted Inter
fonts under the SIL Open Font License, included with the font assets. A standalone
offline HTML file uses system sans fallbacks when those font assets are unavailable.
