# Website

Theodore Ouyang's personal site, built with Next.js App Router, React, and native CSS.
The static export includes four main pages, five experience domains, four legal
papers, four AI research project pages, and two Selected Research papers linked from
Education: nineteen content routes, plus the architecture viewer for twenty navigable
routes, excluding 404. Node.js 24 matches the deployment runtime.

The design follows Cognition's editorial grid, warm paper color, and fine rules while
retaining self-hosted Inter. Home opens directly with the profile. Body text is 17px,
H3 headings are 18px, and mathematical expressions use a relative 1.15em scale.

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
dependency advisories. Browser interaction in the main site is limited to the
navigation menu and legal-paper contents and note previews. The original article
links and site navigation also work without JavaScript.

Selected Research uses compact linked titles and separate GitHub links on Education.
The reading pages contain the abstract, core chapters, and references: chapters 1–10
for the Asian-options paper and 1–8 for Rough Heston. Appendices and supporting
material are linked on GitHub. The JSON files in `content/selected-research/` record
the exact source commit, blob, and manuscript URL for each imported paper.

The build includes the standalone [architecture viewer](../architecture/).
See [maintenance](../docs/maintenance.md) for routes, publishing, and extension
guidance, and [design](../docs/design.md) for the visual system.
