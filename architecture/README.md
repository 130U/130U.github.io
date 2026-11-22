# Website architecture

[Open the interactive system map](https://www.theodoreoy.com/architecture/).

The viewer maps content inputs, static rendering, validation, GitHub Pages delivery,
and browser interactions in the website's palette. It supports label search,
relationship tracing, and image export.

| File | Responsibility |
| --- | --- |
| `site.json` | Editable Archify definition of the current system |
| `index.html` | Standalone interactive viewer |
| `LICENSE` | MIT license for the viewer |

## System represented

`website/app/lib/content/` owns identity, routing, content loading, and research
Markdown and math rendering. The site has three sections: About, with the three Selected
Research papers and the Coursework page of 49 courses; Experience, with eighteen entries
in five categories; and Blog. Detail pages use parent navigation to return to their
originating section or entry. The AI portfolio's single maintained source is
`website/content/sources/ai-portfolio/ai-research-and-engineering.md`; its importer
generates the AI showcase fields and four article JSON files. Selected Research uses
pinned Markdown and TeX inputs with provenance; legal manuscripts use structured
paragraph runs and footnotes; each blog post is one Markdown file. The
[maintenance guide](../docs/maintenance.md) describes content ownership, import
commands, and extension checks.

Next.js exports HTML, CSS, and JavaScript to `website/out/`. Build assembly includes
this viewer and applies the production content security policy and frame guard before
GitHub Actions deploys the artifact to GitHub Pages. There is no request-time API, database,
authentication, or analytics. The browser interactions are the Canvas 2D clarinet hero,
the top-level navigation menu, article contents, article figures, table and figure zoom,
and legal-note previews; reading and ordinary links work without JavaScript.

## Update the viewer

Update `site.json` against the current application and `.github/workflows/pages.yml`,
then run these commands from the repository root. `<archify>` is the Archify
directory.

```sh
node <archify>/bin/archify.mjs validate architecture architecture/site.json --quality showcase --json
node <archify>/bin/archify.mjs deliver architecture architecture/site.json architecture/index.html --quality showcase --json
node website/scripts/integrate-architecture.mjs
npm --prefix website run check
```

The integration applies the site's type roles, a responsive reader layout, major-section
heading semantics, control labels, and export-font settings while preserving SVG
geometry. It sets the site's palette with no bullet before the title or the card
headings, and adds the site's Return Home link, with its return arrow, above the title.
Its head carries the site's share metadata: a description, the canonical address, and
the site's social card. The page takes the site's frame, gutters and footer; Present
and Export stand on the title's row, and every surface is flat. The drawing has square corners, flat panels on
a 1px hairline, regions drawn by the site's dashed hairline without a fill, and no
product logos. It accepts both freshly generated and integrated viewers, and running it
again leaves an integrated viewer unchanged.

The drawing is shown at its reading size at every width: node titles at the label role
(13px, which sets 13/11 pixels to an SVG unit) and every other label at 11px or more,
so details, relationship and region labels are raised to 9.5 units and their knockouts
grow with them. A drawing wider than its stage scrolls sideways, and its right edge
fades while more remains; on a phone the stage scrolls both ways. The viewer opens with
the region holding the first node at the stage's top-left, and the view controls' 100%
is that reading size; zoom enlarges it, and the semantic
radar shows the whole system. Below a 480px stage the view controls take two aligned
rows, the tools above zoom. The three notes share one frame with dashed dividers and
hanging bullets.

The viewer loads `../assets/fonts/inter.css`, preloads regular Inter, and shares the
site's fixed optical axis of 14 and lining numerals; its interface is set entirely in
Inter. The integration maps each text style onto the site's shared tokens: the page
title takes the title role and card headings the heading role, both at weight 400;
panel titles take the item-title role, card lists and explanatory text the reading
role, controls the interface role, and everything else the label role. Diagram labels
keep their SVG coordinates.

SVG exports embed the local regular and italic Inter files with the same optical
settings; PNG and WebM exports render from those prepared fonts. After regeneration,
check search, tracing, keyboard controls, responsive layout, and
export. The complete build also verifies the viewer's production security policy and
local assets.

The standalone HTML works offline with system sans-serif fallbacks when the font files
are unavailable. The viewer uses the MIT license; the self-hosted Inter files use the
SIL Open Font License included beside the font assets.
