# Website

Theodore Ouyang's personal site, built with Next.js App Router, React, and native CSS.
The primary navigation contains About and Experience. Twenty-two canonical content
routes cover these two pages, two Selected Research manuscripts, and eighteen
Experience detail pages. Eight compatibility pages bring the content export to
thirty routes; the architecture viewer makes thirty-one exported routes, excluding
404. Node.js 24 matches the deployment runtime.

The design follows Cognition's editorial grid, warm paper color, and fine rules with
self-hosted Inter. About opens with the interactive name entrance, followed
by the profile. Page titles and section headings are 22px with 1.25 leading, entry
headings are 18px, and body text is 14px with 1.6 leading. Metadata, navigation,
labels, indices, and footers also use 14px. Experience directory labels and numbers
use 18px. This hierarchy stays the same at every viewport; mathematical expressions
use a relative 1.15em scale.
Coursework flows down up to two independent columns, with one column below 768px
and no shared row gaps.

```sh
cd website
npm ci --ignore-scripts
npm run dev
```

| Directory | Responsibility |
| --- | --- |
| `app/` | Pages, shared shell and research readers, content registry, and client interactions |
| `content/` | Approved Experience copy, research manuscripts, frozen source evidence, and integrity manifests |
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
interactive name entrance, navigation menu, shared article contents, and legal-note
previews. Article links and site navigation also work without JavaScript.

About's Selected Research entries use linked manuscript titles and concise research
summaries. GitHub and Full Manuscript links appear in the article headers.
The reading pages contain the abstract, core chapters, and references: chapters 1–10
for the Asian-options paper and 1–8 for Rough Heston. Appendices and supporting
material are linked on GitHub. The JSON files in `content/selected-research/` record
the exact source commit, blob, and manuscript URL for each imported paper. Frozen
Markdown sources and their provenance record live in `content/sources/selected-research/`.

`content/experience-showcase.json` holds the approved English copy for all eighteen
Experience entries. `app/lib/content/experience-domains.ts` defines the five categories;
`app/lib/content/experience-showcase.ts` maps entries to their detail pages. Each page
starts with Position, Location, Dates, and Key Contributions. The four AI and four
legal pages continue into their protected manuscripts.

The build includes the standalone [architecture viewer](../architecture/).
See [maintenance](../docs/maintenance.md) for routes, publishing, and extension
guidance, and [design](../docs/design.md) for the visual system.
