# Website

Theodore Ouyang's personal site uses Next.js App Router, React, TypeScript, and
native CSS. GitHub Pages serves a static export. About introduces the profile,
education, and selected research; Experience organizes eighteen projects and roles
across five fields. Dedicated readers present coursework and research
articles with mathematical notation, chapter navigation, and legal footnotes.

The visual system pairs Inter headings with Source Serif 4 prose, a warm paper
background, and a restrained editorial grid. The original interactive name entrance
opens About. Experience and Coursework share a numbered section directory.

## Local development

Use Node.js 24 to match deployment. Run these commands from the repository root:

```sh
cd website
npm ci --ignore-scripts
npm run dev
```

For the production export:

```sh
npm run check
npm run typecheck
npm audit --audit-level=low
npm run preview:static
```

`check` verifies protected sources, lints, builds, tests the exported artifact, and
checks visible text and metadata. The static preview serves `out/` at
`http://127.0.0.1:8123`. Pull requests run validation; pushes to `main` also deploy
the assembled export through the Pages workflow.

## Application structure

| Directory | Responsibility |
| --- | --- |
| `app/` | Pages, shared navigation and readers, content loaders, and client interactions |
| `content/` | Maintained copy, research manuscripts, source provenance, and integrity manifests |
| `public/` | Assets served directly with the static site |
| `source-assets/` | Editable brand masters |
| `scripts/` | Content import and validation, asset generation, build assembly, and local preview |
| `tests/` | Content, rendering, interaction, static output, and repository policy checks |
| `tooling/` | Private build and lint utilities |

Content is maintained in its source document or data file and passed through shared
loaders. AI and Selected Research articles have deterministic importers; their
generated JSON records the corresponding source version. Read the content ownership
table in the maintenance guide before editing generated article data.

The main site's browser interactions are the name entrance, top-level navigation
menu, article contents, and legal-note previews. Page content, ordinary navigation,
chapter links, and endnotes also work without JavaScript. The build includes the
standalone architecture viewer.

## Maintained references

- [Design](../docs/design.md): typography, layout, identity, and interaction rules.
- [Maintenance](../docs/maintenance.md): content ownership, import commands, routes,
  assets, validation, security, and publishing.
- [Architecture](../architecture/README.md): system-map definition, viewer generation,
  and export integration.
