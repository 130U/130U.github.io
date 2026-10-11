# Theodore Ouyang's Personal Website

**A custom research portfolio spanning AI, mathematical finance, law, and engineering.**

<p align="center">
  <a href="https://www.theodoreoy.com/">
    <img src="assets/readme-cover.jpg" alt="Theodore Ouyang's research portfolio — AI, mathematical finance, law, and engineering" width="1248">
  </a>
</p>

**[Visit the website](https://www.theodoreoy.com/)** · [Interactive architecture](https://www.theodoreoy.com/architecture/) · [Design system](../docs/design.md)

I built this site to make substantial research readable on the web: mathematical proofs, AI analyses, legal arguments, and professional experience share a coherent interface while retaining their source structure and citations.

The result is a **20-route static publication system** with **ten long-form research readers**, a shared article layout, server-rendered mathematics, responsive chapter navigation, and source-to-output integrity checks.

## Research and engineering

| Area | What the site delivers |
| --- | --- |
| **Mathematical finance** | Two research manuscripts on certified Asian-option valuation and joint pricing errors in Rough Heston, with readable equations, theorem structure, references, and links to scientific code. |
| **AI research** | Four technical articles on expert-data production, financial synthetic-data validity, scientific reasoning, and evidence-based investment research. |
| **Legal research** | Four complete article readers with chapter navigation, numbered endnotes, bidirectional citation links, and native-dialog note previews. |
| **Professional experience** | Five domain pages connecting project narratives, methods, contributions, and further reading. |

[Education and mathematical research](https://www.theodoreoy.com/education/) · [Experience and articles](https://www.theodoreoy.com/past-experience/) · [Current work](https://www.theodoreoy.com/now/)

## What I built

- **A shared publication architecture.** Structured content registries feed reusable research and legal readers, a validated route registry, and a static export assembled for GitHub Pages.
- **Mathematics at publication quality.** TeX becomes self-contained SVG with assistive MathML during the build. Original formula annotations remain available for source-to-output comparison.
- **A responsive reading system.** Sticky desktop contents, mobile chapter menus, active-section tracking, keyboard-accessible tables and equations, and source links work within a consistent editorial grid.
- **Content integrity as part of delivery.** Independent source and visible-copy manifests protect approved prose, formulas, metadata, citations, and accessibility labels.
- **A complete visual interface.** Self-hosted Inter, native CSS, an interactive Canvas2D name entrance, keyboard navigation, and reduced-motion behavior connect the portfolio's content and presentation.

Built with **Next.js App Router, React, TypeScript, MathJax, and native CSS**.

## Recorded validation

The [8 October 2026 reader audit](../docs/audits/unified-reader-2026-10-08.md) records:

| Check | Result |
| --- | --- |
| Automated validation | **91 passing checks** across source integrity, article content, rendering, navigation, and static security |
| Responsive browser review | **70 browser states**, covering all 20 exported pages and additional widths for the ten articles |
| Research mathematics | **888 formula inputs** preserving original TeX, order, and display mode |
| Article usability | All ten mobile contents menus navigated successfully; no document-level horizontal overflow or MathJax errors in the audited states |

The implementation and audit are available alongside the published site: [reader components](../website/app/components/article/) · [math renderer](../website/app/lib/content/research-math.ts) · [content contracts](../website/content/) · [tests](../website/tests/).

## Run locally

Use **Node.js 24** to match deployment:

```sh
git clone https://github.com/130U/130U.github.io.git
cd 130U.github.io/website
npm ci --ignore-scripts
npm run dev
```

Open [localhost:3000](http://localhost:3000). To validate and inspect the static export:

```sh
npm run check
npm run typecheck
npm run preview:static
```

The static preview serves [127.0.0.1:8123](http://127.0.0.1:8123).

[Application guide](../website/README.md) · [Maintenance and publishing](../docs/maintenance.md) · [Architecture source](../architecture/README.md)
