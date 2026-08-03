# Home Particle System

The Home page uses a progressive visual enhancement. Its HTML identity and
biographical copy render without JavaScript. A CSS point-pattern fallback gives
the first browser paint the same visual language as the `aria-hidden` Three.js
canvas that replaces it after the client is ready.

## Page composition

- The first viewport is a dedicated particle stage. It contains no biography
  card or profile sidebar; only the shared navigation and a quiet scroll cue
  sit above the visual.
- `app/home.module.css` owns every Home-specific layout rule. The shared
  Education, Past Experience, and Current Chapter layout remains unchanged.
- The visible identity, biography, and contact coordinates live in the solid
  editorial section below the particle stage. This section is the Home page's
  semantic content and the skip-link target.
- `SiteShell` keeps the profile sidebar on by default. Home explicitly opts out
  with `showProfile={false}` and supplies its own frame class, so new routes do
  not inherit the immersive layout accidentally.

## Module boundaries

- `ParticleBackground.tsx` owns feature detection and lazy engine loading.
- `particle-engine.ts` owns Three.js allocation, animation, pointer response,
  document and viewport visibility pausing, resizing, and disposal.
- `shape-samplers.ts` converts text into point targets with the same platform UI
  font stack as the CSS fallback, so first paint does not wait for or swap a web
  font.
- `particle-config.ts` is the single source for the initial target, point counts,
  timing, camera, and the `THEODORE → SCATTER → OUYANG → SCATTER` loop.
- `ParticleBackground.module.css` owns the static fallback and canvas layers.
  Its absolute layer is bounded to the opening viewport instead of following
  the reader behind the biography and footer.

## Accessibility and failure behavior

- The decorative canvas is excluded from the accessibility tree.
- The engine builds and renders the `THEODORE` target before the canvas becomes
  visible, so the first canvas frame is already stable rather than starting as
  a loose scatter.
- `prefers-reduced-motion` renders the same calm static `THEODORE` field with no
  loop.
- Coarse pointers do not install repulsion interactions.
- Missing WebGL, context loss, or initialization failure leaves the HTML/CSS
  fallback visible and the rest of the page usable.
- Reduced transparency and increased contrast keep foreground copy legible.

## Performance guardrails

Use one `Points` object, one buffer geometry, and typed arrays. Cap device pixel
ratio, lower point counts on narrower screens, pause while the document is
hidden or the opening stage is outside the viewport, and dispose the viewport
observer, all GPU resources, and all listeners on unmount. Do not add a second
animation loop or allocate per-particle objects inside a frame.

Canvas sizing and pointer projection use the canvas bounding box rather than
the browser window. A size change rebuilds the canonical word target and resets
the loop to its stable first phase, preventing stretched glyphs after rotation
or responsive viewport changes.

When changing the system, run the production build and inspect the static
preview at 1440, 720, 390, and 320 CSS pixels. Confirm the first visible frame,
scroll the stage fully offscreen to verify pausing, and test reduced motion and
a WebGL-disabled fallback before publishing.
