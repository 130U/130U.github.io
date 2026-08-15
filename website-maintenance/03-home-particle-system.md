# Shared Particle System

The site uses one persistent progressive visual enhancement. Its HTML identity,
navigation, and biographical copy render without JavaScript. A CSS fallback
gives the first browser paint the same visual language as the `aria-hidden`
Three.js canvas that replaces it after the client is ready.

## Page composition

- The first viewport is a dedicated particle stage. It contains no biography
  card or profile sidebar; only the shared navigation and a quiet scroll cue
  sit above the visual.
- `app/home.module.css` owns every Home-specific layout rule. The shared
  Education, Past Experience, and Current Chapter layout remains unchanged.
- The visible identity, biography, and contact coordinates live in the solid
  editorial section below the particle stage. This section is the Home page's
  semantic content and the skip-link target.
- The particle stage and editorial section meet through a non-semantic
  cross-boundary dissolve. It begins inside the closing portion of the star
  field, progressively suppresses the stars, crosses the section boundary on an
  opaque intermediate blue, and resolves to a cool, lightly tinted Duke Blue
  paper surface inside the existing blank profile space. The editorial content
  begins only after that dissolve has completed and a responsive breathing
  interval has passed. Shared CSS variables bind the content inset to the
  360-560px transition geometry, so future gradient tuning cannot silently
  crowd the portrait or heading. The transition never exposes the underlying
  page color as a divider.
- `SiteShell` keeps the profile sidebar on by default. Home explicitly opts out
  with `showProfile={false}` and supplies its own frame class, so new routes do
  not inherit the immersive layout accidentally.

## Module boundaries

- `layout.tsx` mounts exactly one persistent `ParticleBackground` above every
  route so client navigation never destroys the star field.
- `ParticleBackground.tsx` maps the current pathname to `hero` or `ambient`,
  owns feature detection, and lazy-loads the engine.
- `particle-mode.ts` keeps route-to-mode selection deterministic: only `/` is
  narrative; every other route is ambient.
- `particle-engine.ts` owns Three.js allocation, animation, local-plane pointer
  response, interruptible mode retargeting, document and viewport visibility
  pausing, resizing, and disposal.
- `spatial-motion.ts` owns the allocation-free shallow-view motion math: drag
  mapping, rubber-banded angle limits, exact critically damped return, and the
  continuous word-to-scatter interaction gain.
- `shape-samplers.ts` converts text into point targets with the same platform UI
  font stack as the CSS fallback, so first paint does not wait for or swap a web
  font.
- `particle-config.ts` is the single source for the initial target, point counts,
  timing, camera, spatial depth, palette, drag limits, and the
  `THEODORE → SCATTER → OUYANG → SCATTER` loop.
- `ParticleBackground.module.css` owns the static fallback, canvas, and reading
  veil. The layer is bounded to the opening viewport in hero mode and fixed
  behind editorial surfaces in ambient mode.

## Accessibility and failure behavior

- The decorative canvas is excluded from the accessibility tree.
- The engine builds and renders the `THEODORE` target before the canvas becomes
  visible, so the first canvas frame is already stable rather than starting as
  a loose scatter.
- `prefers-reduced-motion` renders a calm static `THEODORE` on Home and a static
  scatter field on every inner route.
- Coarse pointers do not install repulsion interactions.
- Fine pointers may drag the opening canvas through a tightly bounded shallow
  pose. The stable navigation and scroll cue remain in the screen plane.
- Missing WebGL, context loss, or initialization failure leaves the HTML/CSS
  fallback visible and the rest of the page usable.
- Reduced transparency and increased contrast keep foreground copy legible.

## Shallow spatial model

The word targets are a deterministic shallow volume rather than a random 3D
cloud. Most particles remain near the neutral plane and progressively fewer
reach the front and rear depth limits. Perspective compensation adjusts each
particle's local X/Y target so every depth layer resolves to the original crisp
glyph when the view is neutral; depth becomes visible only during pointer
parallax or a deliberate drag.

The interaction channels remain independent:

1. the timeline produces the canonical morph base in local 3D coordinates;
2. spring-damped hover repulsion offsets particles in that local word plane;
3. a single group pose reveals the volume without rewriting either source;
4. the depth palette supplies the final near/middle/far color hierarchy.

Drag begins only after a small movement threshold, tracks the current
presentation pose, and meets a progressive rubber-band before the hard angle
limit. Release inherits a bounded fraction of live angular velocity, then uses
an exact critically damped return that cannot overshoot neutral. Re-grabbing
during return starts from the visible pose.

Word coherence controls interaction strength continuously. Stable words receive
the complete shallow pose, while scatter holds retain only a quiet fraction of
it. Hover repulsion likewise softens during drag and scatter so the local
"opening" and global spatial reveal do not compete.

## Cross-route continuity

The engine owns one deterministic star identity table. Size, color, depth,
ambient opacity, twinkle phase, and drift phase stay attached to the same star
across all routes. A reserved ambient cohort never joins the word targets, so a
quiet sky remains visible while `THEODORE` and `OUYANG` are legible.

Route changes never queue animations. The latest route selects the latest
target, and a critically damped mode spring continues from live positions and
velocities. Leaving Home preserves the current timeline buffers until ambient
settles; a quick return therefore reverses to the exact interrupted state. Once
ambient settles, a later Home visit gathers canonically into `THEODORE`.

Inner-to-inner navigation does not retarget the field. It keeps the same scatter
positions, breathing phases, and camera state while only the foreground page
changes. Direct inner-route loads initialize in ambient and never flash a word.

## Color ownership

The shared editorial palette lives in `app/globals.css`. Duke Navy `#012169`
and Duke Royal `#00539B` are the exact brand anchors; pale surfaces and
blue-black reading colors preserve hierarchy without turning every element into
the same saturated blue.

The particle field has two color paths that must change together:
`ParticleBackground.module.css` owns the first-paint fallback and the mottled
studio-sky field, while `particle-config.ts` supplies the ice, white, warm, and
lavender WebGL palette. The background is built from the official Duke Navy
`#012169` and Duke Royal `#00539B` anchors rather than a photographic asset, so
it remains resolution-independent and introduces no additional network request.
Bright stars carry enough contrast against the dark field to survive a large viewport;
a small accent cohort supplies color, while only a rare bright cohort receives
the larger core. Depth-biased point sizing and bounded per-star variation keep
the letterforms from reading like a uniform pixel matrix. A custom shader reads
stable per-star size and alpha attributes, producing a circular core and
restrained halo without additive bloom.

Word clarity is stateful rather than a global contrast filter. As a word
settles, the shader continuously compresses color toward ice white, narrows the
point-size range, and reinforces opacity. The reserved ambient anchors remain
visible, moving, and twinkling behind the word, so the semantic foreground
never replaces the sky. Those constraints reverse from the live value as the
word scatters, restoring the wider star palette and depth range without a
visual cut. Shader blend factors and engine-side anchor opacity are clamped to
valid ranges, so future palette or clarity tuning cannot create invalid alpha,
size, or color interpolation.

## Performance guardrails

Use one renderer, one `Points` object, one buffer geometry, and typed arrays. Cap
device pixel ratio, lower point counts on narrower screens, raise the allocation
once at the wide-desktop breakpoint to protect apparent glyph density, pause while
the document is hidden or the opening stage is outside the viewport, and dispose
the viewport observer, all GPU resources, and all listeners on unmount. Do not add
a second animation loop or allocate per-particle objects inside a frame.

Canvas sizing and pointer projection use the canvas bounding box rather than
the browser window. Pointer rays are transformed back into the spatial group's
local plane before repulsion is evaluated, so the opening stays under the
cursor while the word tilts. A size change rebuilds the canonical word target
and resets the loop to its stable first phase, preventing stretched glyphs
after rotation or responsive viewport changes.

When changing the system, run the production build and inspect the static
preview at 1440, 720, 390, and 320 CSS pixels. Confirm the first visible frame,
scroll the stage fully offscreen to verify pausing, and test reduced motion and
a WebGL-disabled fallback before publishing.
