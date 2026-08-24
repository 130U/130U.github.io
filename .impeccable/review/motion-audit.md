# Motion audit

## Verdict

The production motion system is intentionally narrow and coherent. The Home
dither is the sole expressive moment; the mobile menu and links provide brief
state feedback. No new animation library or additional motion surface is
recommended.

## Current contracts

| Surface | Purpose | Implementation |
| --- | --- | --- |
| Dither ready state | Establish identity once the mask is ready | 800ms opacity reveal |
| Pointer repulsion | Confirm that the identity mark is tactile | 100px radius, 40px maximum displacement, cubic falloff |
| Release ripple | Acknowledge a deliberate pointer release | 225px/s, 37px width, 20px strength, 675ms lifetime |
| Mobile menu | Explain the panel state change | 200ms opacity and 8px transform with drawer ease |
| Links and active marker | Provide immediate state feedback | 120-180ms transform, color, and rule transitions |

## Performance and accessibility

- The Canvas2D loop requests another frame only while fading, rippling, or
  converging toward a live target. It stops at rest even if the pointer remains
  inside the canvas.
- `ResizeObserver` owns normal canvas rebuilding; the window resize listener is
  only a compatibility fallback, avoiding duplicate work.
- Reduced motion renders the complete wordmark without displacement or ripple.
- Hover motion is restricted to fine pointers, and all effects animate only
  transform, opacity, color, or a canvas drawing surface.
- The mobile menu remains interruptible, traps focus while open, closes on
  Escape, and restores focus when dismissal requires it.

## Rejected additions

Scroll reveals, parallax, marquees, magnetic buttons, route transitions, GSAP
ScrollTrigger, and ambient loops would compete with reading and weaken the
site's Quiet Technical Authority. The correct next motion improvement is no new
motion.
