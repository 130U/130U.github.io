# Theodore Ouyang

*Quis ego sum?* — Who am I?

I do not think the answer is a fixed biography. It is better understood through
the questions one pursues, the work one chooses to preserve, and the ways one’s
thinking changes over time.

I created this website to keep that record with continuity: present work, past
experience, and personal writing, each in its proper context. It is a living
archive rather than a conventional portfolio—selective, honest, and deliberately
unfinished.

[Visit the website →](https://www.theodoreoy.com/)

## Repository map

The repository follows framework conventions instead of hiding configuration
behind custom nesting:

| Directory | Purpose |
| --- | --- |
| [`app/`](app/) | Pages, shared layout, route components, and site styles |
| [`content/`](content/) | Source records preserved independently from presentation code |
| [`docs/`](docs/) | Architecture and publishing documentation |
| [`public/assets/`](public/assets/) | Brand, profile, post, and font assets grouped by use |
| [`scripts/`](scripts/) | Static-export tooling for GitHub Pages |
| [`tests/`](tests/) | Rendered-page, content-integrity, and design-system checks |
| [`worker/`](worker/) | Vinext runtime entry used by the build |

Root-level files are limited to the configuration and dependency manifests
expected by Next.js, Vinext, TypeScript, ESLint, PostCSS, Vite, and npm. See
[`docs/repository-structure.md`](docs/repository-structure.md) for the complete
structure and maintenance rules. The recommended high-frequency writing model
is documented in
[`docs/personal-posts-scaling.md`](docs/personal-posts-scaling.md).
