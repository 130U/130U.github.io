# Motion audit — baseline `f909635d`

## Highest-priority findings

| Priority | Current seam | Decision |
| --- | --- | --- |
| High | `app/layout.tsx` mounts a persistent Three.js field on every route; `particle-engine.ts` maintains a requestAnimationFrame timeline, ambient drift, twinkle, parallax, drag, and route retargeting. The effect is frequent and competes with reading. | Replace it with one Home-only Canvas2D entrance. Run frames only during the 800ms ready fade, active pointer response, displaced-point recovery, or a 675ms ripple. |
| High | `particle-config.ts` cycles `THEODORE → SCATTER → OUYANG → SCATTER`; the visitor cannot read the complete identity at once. | Render `THEODORE` and `OUYANG` simultaneously in one stable two-line particle mask. No typewriter, random entrance, or recurring morph. |
| Medium | The current top bar and inner surfaces use blur, gradients, rounded containers, and deep-blue ambient layers. Their motion and material language read as playful even where the content is editorial. | Rebuild the shell as static off-white structural grid lines. Keep motion only for the rare entrance, 200ms mobile menu state change, press feedback, and small directional-arrow feedback. |
| Medium | Motion values are split across component CSS and Three configuration. | Consolidate web UI motion into `--ease-out`, `--ease-in-out`, `--ease-drawer`, and a small duration scale; Canvas physics remain explicit constants beside the engine. |

## Recommended opportunities already selected by the brief

1. **Fade in** the complete dither wordmark over 800ms after its mask is ready.
2. **Pointer repulsion** within a 100px radius, with a maximum 40px cubic-falloff displacement and spring-like return.
3. **Ripple** on pointer release at 225px/s, 37px width, 20px strength, lasting 675ms.
4. **Menu reveal** using opacity plus a small transform over 180–220ms with strong ease-out; it must stay interruptible and become instant under reduced motion.
5. **Directional feedback** on experience links with a restrained arrow translation; retain the current interaction category but reduce distance.

## Rejected candidates

- Scroll reveals and staggered section entrances: they delay reading and repeat on content-first pages.
- Parallax, magnetic controls, custom cursors, and global ambient particles: they make navigation feel performative rather than mature.
- GSAP ScrollTrigger, pinned storytelling, AIDA restructuring, and bento cards: they conflict with the user-locked Cognition editorial shell and protected page order.
- Toasts, Expo/Reanimated, haptics, and Swift: this is a static web portfolio with no matching product state or platform requirement.

## Production verification — Balanced selection

- Desktop stage: 520px with 19,156 sampled points at the measured 1440px viewport.
- Mobile stage: 340px with 8,839 sampled points at the measured 390px viewport; 320px remains uncropped with no horizontal overflow.
- Pointer repulsion, release ripple, recovery, and fade use the approved explicit constants in `dither-motion.ts`.
- The loop requests another frame only while fading, interacting, rippling, or recovering; reduced motion renders the complete mask without interaction.
- Mobile menu uses a 200ms opacity/transform transition, focus containment, Escape dismissal, focus restoration, route-close behavior, and a fixed open-state header.
- Browser console review across Home, Education, and Past Experience found no runtime errors or warnings.
