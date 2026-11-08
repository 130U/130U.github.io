# Website

Theodore Ouyang's personal site, built with the Next.js App Router, React, TypeScript,
and native CSS, and served by GitHub Pages as a static export. About introduces the
profile, education, and selected research; Experience organizes eighteen projects and
roles across five fields; Blog presents works, each post linking to the work itself.
Dedicated readers present coursework and research articles with mathematical notation,
interactive figures, chapter navigation, and legal footnotes.

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
`http://127.0.0.1:8123`. Pull requests run validation; pushes to `main` also deploy the
assembled export through the Pages workflow.

## Application structure

| Directory | Responsibility |
| --- | --- |
| `app/` | Pages, shared navigation and readers, content loaders, and client interactions |
| `content/` | Maintained copy, research manuscripts, source provenance, and integrity manifests |
| `public/` | Assets served directly with the static site |
| `source-assets/` | Editable brand masters |
| `scripts/` | Content import and validation, asset generation, build assembly, and local preview |
| `tests/` | Content, rendering, interaction, static output, and repository policy checks |

Content is maintained in its source document or data file and passed through shared
loaders. AI and Selected Research articles have deterministic importers whose generated
JSON records the source version; read the content ownership table in the maintenance
guide before editing generated article data.

The browser interactions are the clarinet particle field in
`app/components/clarinet-hero/`, the top-level navigation menu, article contents,
legal-note previews, and article figures. Page content, navigation, chapter links,
endnotes, and each figure's default view work without JavaScript; the clarinet shows a
same-shape SVG of separated dots before its script runs and a complete static field
under reduced motion. The build also publishes the standalone architecture viewer.

## Maintained references

- [Design](../docs/design.md): principles, color, typography, layout, components, and
  copy rules.
- [Maintenance](../docs/maintenance.md): content ownership, import commands, routes,
  assets, validation, security, and publishing.
- [Architecture](../architecture/README.md): system-map definition, viewer generation,
  and export integration.
