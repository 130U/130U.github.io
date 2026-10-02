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
papers, and four AI research project pages. `website/app/lib/content/` defines
identity, routes, and content loaders; `website/content/` contains the resume,
AI project sources, structured manuscripts, and integrity contracts. Next.js
generates seventeen static website pages. The build includes
this viewer at `/architecture/`, and GitHub Actions publishes `website/out/` to
GitHub Pages on the custom domain.

The navigation menu, Home Canvas2D wordmark, and legal-paper contents and note
previews run in the browser. The website uses no request-time API, database,
authentication, or analytics. The [maintenance guide](../docs/maintenance.md)
documents content ownership, output contracts, security, and publishing.

Update `site.json` from the current source and `.github/workflows/pages.yml`, then
validate and generate it with the installed Archify skill:

```sh
node <archify>/bin/archify.mjs validate architecture architecture/site.json --quality showcase --json
node <archify>/bin/archify.mjs deliver architecture architecture/site.json architecture/index.html --quality showcase --json
node website/scripts/integrate-architecture.mjs
```

Run these commands from the repository root. `<archify>` is the local Archify skill
directory. The integration script applies the website's six HTML type roles and
major-section heading semantics while preserving SVG geometry. The viewer loads
`../assets/fonts/inter.css`, preloads regular Inter, and inherits `--font-text`.
Visual exports embed the local regular and italic Inter files in SVG; PNG and WebM
render from the same prepared fonts. The integration is safe to run repeatedly.
Run `npm --prefix website run check` to verify the complete export, including the
viewer and its production content security policy.

The viewer uses the MIT license. Published pages use the website's self-hosted Inter
fonts under the SIL Open Font License, included with the font assets. A standalone
offline HTML file uses system sans fallbacks when those font assets are unavailable.
