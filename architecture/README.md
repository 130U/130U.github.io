# Website architecture

[Open the interactive system map](https://www.theodoreoy.com/architecture/).

The viewer maps content inputs, static rendering, validation, GitHub Pages delivery,
and browser interactions. It supports label search, light and dark themes,
relationship tracing, and image export.

| File | Responsibility |
| --- | --- |
| `site.json` | Editable Archify definition of the current system |
| `index.html` | Standalone interactive viewer |
| `LICENSE` | MIT license for the viewer |

## System represented

`website/app/lib/content/` owns identity, routing, content loading, and research
Markdown/math rendering. Experience presents five categories and eighteen entries;
About includes three Selected Research papers and an Education link to the dedicated
Coursework page, which presents 49 courses in four subject groups. Detail pages use
parent navigation to return to their originating section or entry.
The AI portfolio's single maintained
source is `website/content/sources/ai-portfolio/ai-research-and-engineering.md`;
its importer generates the AI showcase fields and four article JSON files.
Selected Research uses pinned Markdown/TeX inputs with provenance; legal manuscripts
use structured paragraph runs and footnotes. The [maintenance guide](../docs/maintenance.md)
describes content ownership, import commands, and extension checks.

Next.js exports HTML, CSS, and JavaScript to `website/out/`. Build assembly includes
this viewer and applies production CSP before GitHub Actions deploys the artifact
to GitHub Pages. There is no request-time API, database, authentication, or analytics.
The main site's browser interactions are the Canvas2D entrance, top-level navigation menu,
article contents, and legal-note previews. Reading and ordinary links remain
available without JavaScript.

## Update the viewer

Update `site.json` against the current application and `.github/workflows/pages.yml`,
then run these commands from the repository root. `<archify>` is the installed
Archify skill directory.

```sh
node <archify>/bin/archify.mjs validate architecture architecture/site.json --quality showcase --json
node <archify>/bin/archify.mjs deliver architecture architecture/site.json architecture/index.html --quality showcase --json
node website/scripts/integrate-architecture.mjs
npm --prefix website run check
```

The integration applies shared HTML type roles, responsive reader layout,
major-section heading semantics, control labels, and export-font settings while
preserving SVG geometry. It handles both freshly generated and already integrated
viewers; running it again should leave the current viewer unchanged.

The viewer loads `../assets/fonts/inter.css`, preloads regular Inter, and inherits
the site's fixed optical axis of 14 and lining numerals. The tool UI remains entirely
in Inter while the main site's narrative prose uses Source Serif 4. General page and
module headings share the site's 32px desktop / 28px mobile scale at weight 500;
secondary headings remain 18px and body/control text 14px at every viewport.
Diagram labels retain their own SVG coordinate sizes. On the main site,
inline formulas use 1em and displayed formulas 1.15em.

SVG exports embed the local regular and italic Inter files and retain the same
fixed optical settings; PNG and WebM render from those prepared fonts. Check theme
switching, search, tracing, keyboard controls, responsive layout, and export after
regeneration. The complete build also verifies the viewer's production CSP and
local assets.

The standalone HTML works offline with system sans fallbacks when font assets are
unavailable. The viewer uses the MIT license; the self-hosted Inter files use the
SIL Open Font License included beside the font assets.
