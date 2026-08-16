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

The one-family limit is permanent unless a full redesign is explicitly
approved. Shantell Sans is expressive enough to carry the full system without
introducing another visual voice.

- **Body** uses neutral Bounce, Informality, and Spacing axes. Weight, size,
  and leading provide hierarchy while academic and long-form copy stays calm.
- **Display** adds a small amount of Informality and a nearly imperceptible
  positive Bounce. Use it only for page and domain titles.
- **Heading** uses less Informality than Display and no Bounce, keeping card
  titles personable but orderly.
- **Interface** uses very low Informality and no Bounce. It carries navigation,
  dates, locations, kickers, indices, and short control labels.
- **Brand** is upright, moderately informal, and visually anchored by weight.
  Reserve it for the Theodore Ouyang wordmark and profile name. Do not replace
  it with synthetic italics.
- Particle words use the platform geometric stack. Their job is clarity and
  spatial form, not editorial expression.

The root family and variation tokens are the canonical role boundary. Extend a
role through its token instead of copying a font family or axis tuple into a
new component.

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
