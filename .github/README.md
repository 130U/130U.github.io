# Theodore Ouyang's Personal Website

A public record of research, education, experience, and current work.

<p align="center">
  <a href="https://www.theodoreoy.com/">
    <img src="assets/readme-cover.jpg" alt="Theodore Ouyang's personal website — research, education, experience, and current work" width="1248">
  </a>
</p>

**[Visit the website](https://www.theodoreoy.com/)** · [Architecture](https://www.theodoreoy.com/architecture/) · [Design](../docs/design.md) · [Maintenance](../docs/maintenance.md)

The site brings my background and written work into one reading space. Research pages cover AI, mathematical finance, and legal questions, with source references, mathematical notation, chapter navigation, and legal footnotes.

## Explore

| Page | What you will find |
| --- | --- |
| [Education](https://www.theodoreoy.com/education/) | Education, selected coursework, and two mathematical finance manuscripts with links to their code and evidence. |
| [Past Experience](https://www.theodoreoy.com/past-experience/) | Work across five domains, including four AI research articles and four legal papers. |
| [Current Chapter](https://www.theodoreoy.com/now/) | The questions and work shaping my current direction. |
| [Architecture](https://www.theodoreoy.com/architecture/) | An interactive map of the website and its implementation. |

## Run locally

Use **Node.js 24** to match the deployment runtime. From a checkout of this repository:

```sh
cd website
npm ci --ignore-scripts
npm run dev
```

Open [localhost:3000](http://localhost:3000). For the assembled static site:

```sh
npm run check
npm run typecheck
npm run preview:static
```

The static preview serves [127.0.0.1:8123](http://127.0.0.1:8123). `npm run check` checks protected sources, lints, builds, tests the export, and verifies visible copy.

## Implementation

Built with **Next.js, React, TypeScript, and native CSS**, then exported to static files for GitHub Pages. The reading interface uses a shared editorial grid and self-hosted Inter, with keyboard navigation, reduced-motion support, and article links that remain usable without JavaScript.

Research imports record their source versions. Integrity checks protect approved prose, metadata, citations, and formula annotations through presentation changes. The application has nineteen content routes; the architecture viewer adds a twentieth navigable route.

See the [application guide](../website/README.md) for development commands, the [design guide](../docs/design.md) for the reading system, and [maintenance](../docs/maintenance.md) for content sources and publishing.
