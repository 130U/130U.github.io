# Website

Theodore Ouyang's personal site uses Next.js App Router, React, TypeScript, and
native CSS. GitHub Pages serves a static export. About introduces the profile,
education, and selected research; Experience organizes eighteen projects and roles
across five fields; Blog presents works, each post linking to the work itself.
Dedicated readers present coursework and research articles with mathematical
notation, chapter navigation, and legal footnotes.

The visual system pairs Inter headings with Source Serif 4 prose, a warm paper
background, and a restrained editorial grid: faint frames hold each list, dashed
hairlines divide them, and each AI and legal article opens with a logic architecture
diagram. Interactive figures inside the eleven full articles chart their tables and
illustrate their arguments, the dependence article draws its manuscript figures in the
same style, and research tables sit in titled frames that highlight rows and columns on
hover.
About opens with the name beside a recognizable clarinet hero, stacked
above it on phones and portrait tablets. The dense Canvas 2D particle field aggregates on entry,
responds locally to the pointer, disperses with scrolling, and returns to its
shape, with six silver ring keys, joint bands and pads, two long rods, and
a dark elliptical bell cavity. All these features use separated points with
transparent gaps, including the darker ring-key centers and bell cavity.
The name and institutions use Inter; the credential roles use Source Serif 4.
Blue corner marks, a single solid blue oval, and four solid, continuously breathing
musical notes accompany the field. The open blue arc has larger, more closely
spaced points and retains its occlusion behind the instrument.
Selected Research, Education, and Experience share the framed ledger and Read More
link; Experience and Coursework share a framed section index.

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

The main site's browser interactions are the clarinet particle field, top-level navigation
menu, article contents, legal-note previews, and article figures. Page content, ordinary
navigation, chapter links, endnotes, and each figure's default view also work without
JavaScript. The clarinet has a
same-shape SVG dot-pattern fallback and a complete static field for reduced motion.
The fallback retains transparent gaps during loading and without JavaScript.
Clean paths supply temporary sampling masks for the point field, which are released
after construction. The body, silver fittings, and bell use opaque point samples;
four musical notes and one blue oval use reusable filled `Path2D` shapes.

Settled points share a transparent native-resolution cache. A spatial index
activates nearby particles for pointer input and repaints only affected regions.
Physics advances at 60 Hz, with rendering interpolated between simulation steps.
Moving points use subpixel coverage without blur filters; settled points return
to exact device-pixel positions. `alignCanvas` derives dimensions from the stage
and aligns the canvas box and origin with its backing store, including at
fractional pixel ratios. The body retains its subtle opacity breathing.
Notes continue their independent movement for as long as the hero is visible;
hidden tabs and offscreen heroes pause the active animation clock without a jump
on return. Reduced motion keeps the entire composition static.
Its implementation lives in `app/components/clarinet-hero/`. The build includes
the standalone architecture viewer.

## Maintained references

- [Design](../docs/design.md): typography, layout, identity, and interaction rules.
- [Maintenance](../docs/maintenance.md): content ownership, import commands, routes,
  assets, validation, security, and publishing.
- [Architecture](../architecture/README.md): system-map definition, viewer generation,
  and export integration.
