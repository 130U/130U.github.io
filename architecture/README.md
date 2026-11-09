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
this viewer and applies the production content security policy before GitHub Actions
deploys the artifact to GitHub Pages. There is no request-time API, database,
authentication, or analytics. The browser interactions are the Canvas 2D clarinet hero,
the top-level navigation menu, article contents, article figures, research-table zoom,
and legal-note previews; reading and ordinary links work without JavaScript.

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

The integration applies the site's type roles, a responsive reader layout, major-section
heading semantics, control labels, and export-font settings while preserving SVG
geometry. It accepts both freshly generated and integrated viewers, and running it again
leaves an integrated viewer unchanged.

The viewer loads `../assets/fonts/inter.css`, preloads regular Inter, and shares the
site's fixed optical axis of 14 and lining numerals; its interface is set entirely in
Inter. The integration maps each text style onto the site's shared tokens: the page
title takes the title role and card headings the heading role, both at weight 500;
panel titles take the item-title role, card lists and explanatory text the reading
role, controls the interface role, and everything else the label role. Diagram labels
keep their SVG coordinate sizes.

SVG exports embed the local regular and italic Inter files with the same optical
settings; PNG and WebM exports render from those prepared fonts. After regeneration,
check theme switching, search, tracing, keyboard controls, responsive layout, and
export. The complete build also verifies the viewer's production security policy and
local assets.

The standalone HTML works offline with system sans-serif fallbacks when the font files
are unavailable. The viewer uses the MIT license; the self-hosted Inter files use the
SIL Open Font License included beside the font assets.
