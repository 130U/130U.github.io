# Home Particle System

The Home page uses a progressive visual enhancement. Its HTML identity and
biographical copy render without JavaScript; Three.js adds an `aria-hidden`
background only after the client is ready.

## Module boundaries

- `ParticleBackground.tsx` owns feature detection and lazy engine loading.
- `particle-engine.ts` owns Three.js allocation, animation, pointer response,
  visibility pausing, resizing, and disposal.
- `shape-samplers.ts` converts text into point targets without network fonts.
- `particle-config.ts` is the single source for point counts, timing, camera,
  and the `SCATTER → THEODORE → SCATTER → OUYANG` loop.
- `ParticleBackground.module.css` owns the static fallback and canvas layers.

## Accessibility and failure behavior

- The decorative canvas is excluded from the accessibility tree.
- `prefers-reduced-motion` renders one calm static field with no loop.
- Coarse pointers do not install repulsion interactions.
- Missing WebGL, context loss, or initialization failure leaves the HTML/CSS
  fallback visible and the rest of the page usable.
- Reduced transparency and increased contrast keep foreground copy legible.

## Performance guardrails

Use one `Points` object, one buffer geometry, and typed arrays. Cap device pixel
ratio, lower point counts on narrower screens, pause while the document is
hidden, and dispose all GPU resources and listeners on unmount. Do not add a
second animation loop or allocate per-particle objects inside a frame.

When changing the system, run the production build and inspect the static
preview at 1440, 720, 390, and 320 CSS pixels. Also test reduced motion and a
WebGL-disabled fallback before publishing.
