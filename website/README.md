# Website

Theodore Ouyang's personal site, built with Next.js App Router, React, and native CSS.
The primary navigation contains About and Experience. Twenty-four canonical content
routes cover these two pages, Coursework, three Selected Research manuscripts, and eighteen
Experience detail pages. Eight compatibility pages bring the content export to
thirty-two routes; the architecture viewer makes thirty-three exported routes, excluding
404. Node.js 24 matches the deployment runtime.

The design follows Cognition's editorial grid, warm paper color, and fine rules with
self-hosted Inter headings and Source Serif 4 prose. About opens with the original
interactive Inter name entrance, followed by the profile. General page titles and
section headings are 32px on desktop and 28px below 768px, with weight 500 and 1.2
leading. Institution, project, and paper names remain 18px/600, including detail-page
H1s. Body text remains 14px with 1.6 leading. Metadata, navigation, field labels, and
footers also remain 14px. Top-level directory labels use 18px/500; small serif section
and directory indices use 10px/400. These smaller roles stay the same at every viewport.
Inter retains a shared fixed optical size of 14 and lining numerals. Inline mathematical
expressions use 1em; displayed expressions use 1.15em. Pure inline numeric values inherit
the surrounding prose family while preserving their original TeX in accessible MathML.
Experience opens with an Areas of Focus directory linking to its five domains.
View Coursework below Education opens a dedicated page containing all 49 courses
in four subject groups. Each group uses one column at every width.

```sh
cd website
npm ci --ignore-scripts
npm run dev
```

| Directory | Responsibility |
| --- | --- |
| `app/` | Pages, shared shell and research readers, content registry, and client interactions |
| `content/` | Experience copy, research manuscripts, authoritative source material, and integrity manifests |
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
interactive name entrance, top-level navigation menu, shared article contents, and legal-note
previews. Article links and site navigation also work without JavaScript.
Detail pages retain the wordmark and a visible parent link in the navigation rail;
on phones, that link stays in the header without a Menu toggle.

About's three Selected Research entries link to on-site manuscripts and include
concise research summaries. Critical Dependence Stress for Portfolio Diversification
appears first, followed by the Asian-options and Rough Heston papers. Article headers
contain the title, GitHub link, and Full Manuscript link. Back to Selected Research
appears in the navigation rail. Reading content
starts at Abstract; pre-abstract front matter remains in the protected source.
The pages include the core chapters and references: chapters 1–5 for dependence
stress, 1–10 for Asian options, and 1–8 for Rough Heston. Appendices and supporting
material are linked on GitHub. The JSON files in `content/selected-research/` record
the exact source commit, blob, and manuscript URL for each imported paper. Frozen
manuscript evidence lives in `content/sources/selected-research/`. The dependence-stress
paper has its own TeX sources and provenance in the `dependence/` subdirectory and
uses `scripts/import-dependence-research.mjs` for deterministic import.

`content/experience-showcase.json` holds the approved English copy for all eighteen
Experience entries. `app/lib/content/experience-domains.ts` defines the five categories;
`app/lib/content/experience-showcase.ts` maps entries to their detail pages. Each page
starts with Position, Location, Dates, and Key Contributions. The four AI and four
legal pages continue into their protected manuscripts.

The four AI entries share one authoritative manuscript:
`content/sources/ai-portfolio/ai-research-and-engineering.md`. Edit that file and run
`node scripts/import-ai-portfolio.mjs` from `website/` to generate their briefs,
disclosures, contributions, architectural contexts, nested method lists, and
mathematical bodies. The importer validates the document structure before writing
the generated JSON. Tests independently compare all text, citation links, tables,
and TeX with this source and check the exported mathematical rendering.

The build includes the standalone [architecture viewer](../architecture/).
See [maintenance](../docs/maintenance.md) for routes, publishing, and extension
guidance, and [design](../docs/design.md) for the visual system.
