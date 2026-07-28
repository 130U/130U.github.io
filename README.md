# Theodore Ouyang — Personal Website

The source for Theodore Ouyang’s personal website, designed around a compact academic-profile structure with four sections:

- Home
- Education
- Past Experience
- Personal Posts

The public site is deployed through GitHub Pages at [130u.github.io](https://130u.github.io/).

## Local development

```bash
npm ci --ignore-scripts
npm run dev
```

## Validation

```bash
npm run build
npm test
npm run lint
```

## Deployment

Pushing to `main` runs the GitHub Pages workflow. The workflow builds the Vinext application, exports the four public routes as static HTML, and deploys the generated artifact.
