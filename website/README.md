# Website

Theodore Ouyang's personal site, built with Next.js App Router, React, and native CSS.
The static export includes four main pages, five experience domains, four legal
papers, four AI research project pages, and a selected research overview linked from
Education. Node.js 24 matches the deployment runtime.

```sh
cd website
npm ci --ignore-scripts
npm run dev
```

| Directory | Responsibility |
| --- | --- |
| `app/` | Pages, shared shell and research readers, content registry, and client interactions |
| `content/` | Experience records, AI and selected research, legal papers, and integrity manifests |
| `public/` | Assets served directly by GitHub Pages |
| `source-assets/` | Editable brand masters |
| `scripts/` | Content checks, asset generation, build assembly, and local preview |
| `tests/` | Static output, interaction, and repository policy checks |
| `tooling/` | Private build and lint utilities |

`npm run check` verifies protected sources, lints, builds, tests the export, and
checks visible text and metadata. `npm run preview:static` serves `out/` on
`http://127.0.0.1:8123`.

`npm run typecheck` validates TypeScript and `npm audit --audit-level=low` checks
dependency advisories. Browser interaction is limited to the navigation menu,
Home wordmark, and legal-paper contents and note previews. The original article
links and site navigation also work without JavaScript.

The build includes the standalone [architecture viewer](../architecture/).
See [maintenance](../docs/maintenance.md) for routes, publishing, and extension
guidance, and [design](../docs/design.md) for the visual system.
