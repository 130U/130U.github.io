# Personal Brand System

The site should feel calm, intelligent, exploratory, and unmistakably
personal. Its character comes from one controlled contrast: an academic
editorial surface suspended over a living Duke Blue sky. Future work should
strengthen that relationship rather than add unrelated decoration.

## Brand anchors

- **Duke Navy `#012169`** is the spatial field and primary identity anchor.
- **Duke Royal `#00539B`** supplies light, motion, focus, and active states.
- Cool paper surfaces make the academic record readable without visually
  separating it from the sky.
- Warm and lavender stars are rare accents, not secondary brand colors.

## Type roles

The two-family limit is permanent unless a full redesign is explicitly
approved.

- **Newsreader Roman** carries headings, biography, academic content, and long
  reading. It establishes rigor and editorial calm.
- **Newsreader Italic** is the signature voice. Reserve it for the Theodore
  Ouyang wordmark; repeating it would weaken the signature.
- **Shantell Sans** carries navigation, dates, locations, kickers, indices, and
  other short interface signals. It contributes human presence without turning
  formal content into handwriting.
- Particle words use the platform geometric stack. Their job is clarity and
  spatial form, not editorial expression.

The root tokens `--font-editorial`, `--font-signature`, and
`--font-interface` are the canonical role boundary. Extend a role through its
token instead of copying a font-family declaration into a new component.

## Motion signature

The particle field is the sole expressive motion system. It may breathe,
twinkle, gather, scatter, and reveal shallow depth, but it must remain
interruptible and subordinate to reading. Navigation and paper surfaces use
short material feedback only; they do not compete with the sky.

The normal Home startup sequence is always:

1. quiet non-semantic sky;
2. one complete particle word;
3. the existing narrative loop.

Never expose a rough duplicate word, delay navigation for a morph, or restart
the shared sky during inner-page navigation.

## Extension test

Before adding a visual element, confirm all four statements:

1. It clarifies identity, hierarchy, or wayfinding.
2. It belongs to the Duke Blue sky or editorial paper language.
3. It works with reduced motion, increased contrast, and narrow screens.
4. It can be implemented through an existing token or a clearly named new
   role, without duplicating content or creating a second visual system.

If any statement is false, leave the element out.
