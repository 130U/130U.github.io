---
name: Theodore Ouyang Portfolio
description: Quiet technical authority with a dithered personal signature.
colors:
  signal-blue: "#2200ff"
  warm-paper: "#f7f6f5"
  editorial-ink: "#0b0b0b"
  dither-ink: "#070707"
  supporting-gray: "#70706c"
  structural-rule: "rgba(0, 0, 0, 0.06)"
  strong-rule: "rgba(0, 0, 0, 0.24)"
typography:
  headline:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  navigation:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.3
  metadata:
    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  structural: "0px"
spacing:
  mobile-gutter: "20px"
  tablet-gutter: "32px"
  desktop-gutter: "64px"
  mobile-section-top: "88px"
  desktop-section-top: "176px"
components:
  navigation-link:
    textColor: "{colors.editorial-ink}"
    typography: "{typography.navigation}"
    rounded: "{rounded.structural}"
    height: "27px"
  navigation-link-active:
    textColor: "{colors.signal-blue}"
    typography: "{typography.navigation}"
    rounded: "{rounded.structural}"
  mobile-menu-control:
    backgroundColor: "{colors.warm-paper}"
    textColor: "{colors.editorial-ink}"
    typography: "{typography.navigation}"
    rounded: "{rounded.structural}"
    height: "44px"
---

# Design System: Theodore Ouyang Portfolio

## Overview

**Creative North Star: "Quiet Technical Authority"**

The site pairs a single expressive opening gesture with a disciplined editorial body. The Home-only dithered name establishes authorship; everything after it earns trust through warm paper, exact grid alignment, serif reading texture, and very limited color. The system should feel mature enough for an AI researcher or operator while remaining unmistakably personal.

**Key Characteristics:**

- One high-expression entrance, followed by quiet reading surfaces.
- Cognition-like structural discipline implemented with Theodore's own content and mark.
- Warm white, near-black, hairline rules, and rare signal blue.
- No decorative modules that compete with the writing.

## Colors

Signal Blue is reserved for active navigation, focus, and meaningful link feedback. Warm Paper and Editorial Ink carry nearly every screen; Supporting Gray is for metadata only. Structural rules organize the 15-column frame without becoming an ornamental grid.

**The Rare Blue Rule.** Signal Blue identifies state; it never becomes a large background fill.

## Typography

**Display and interface font:** Helvetica Neue with Helvetica and Arial fallbacks.  
**Body font:** Georgia with Times New Roman and the platform serif fallback.

Sans type supplies precision to navigation, titles, and metadata. Serif type slows the reading rhythm and prevents the minimal shell from feeling clinical. Desktop H1 uses the Headline token; mobile H1 resolves to 24px / 1.2. Body copy stays within 64–72 characters where the source layout permits.

**The Two-Voice Rule.** Sans establishes structure; serif carries narrative. Do not introduce a third personality font.

## Layout

Desktop uses a 15-column frame with a 3-column sticky rail and 12-column content field. Tablet compresses to 12 columns with the same 3-column rail. Below 768px, the rail becomes a 64px sticky header and a single-column `Menu` / `Close` panel; page gutters use the Mobile Gutter token. Home alone places a full-viewport dithered entrance before this shell.

Major sections are separated by large intervals and real hairlines. Lists, degrees, and experience records remain editorial rows rather than cards. At 390px and below, metadata stacks naturally and no identifier may force horizontal scrolling.

## Elevation & Depth

The system is entirely flat. Hierarchy comes from type, whitespace, line weight, sticky position, and the dither interaction. There are no drop shadows, translucent materials, glass effects, or simulated floating cards.

**The Flat Authority Rule.** If an element needs a shadow to appear important, its hierarchy is wrong.

## Shapes

Content containers, buttons, navigation, and rows have square corners. The `LO` mark is an unboxed typographic monogram and does not create a reusable badge or rounded-card language.

## Components

### Dithered Entrance

The Home entrance simultaneously spells `THEODORE` and `OUYANG`. Its stage scales from the viewport's shorter side and is capped at 720px on desktop and 380px on mobile. Canvas2D points respond to pointer repulsion and a short release ripple, then stop requesting animation frames at rest. Reduced motion displays the complete static wordmark immediately.

### Navigation

Desktop navigation pairs the unboxed `LO` monogram with Theodore's name, followed by a plain vertical list with a 2px active rule and Signal Blue text. The rail contains no repeated portrait or profile card. Mobile uses literal `Menu` and `Close` controls, a warm-paper panel, focus containment, Escape dismissal, focus restoration, and no icon-only hamburger.

### Editorial Rows

Education, domain-directory, coursework, and experience records use aligned columns, large vertical breathing room, and structural hairlines. Hover may change text color and move an arrow by 4px; it never lifts, glows, or gains a card surface.

## Do's and Don'ts

### Do:

- **Do** preserve protected biographical sources, factual claims, routes, metadata, alt text, ARIA labels, and content order unless Theodore explicitly approves a revision.
- **Do** use whitespace and real content boundaries before adding any new visual element.
- **Do** keep the entrance interaction interruptible, idle-aware, and fully static under reduced motion.
- **Do** verify 1440px, 1024px, 390px, and 320px layouts before release.

### Don't:

- **Don't** add a global WebGL background, handwritten interface typography, glass navigation, or ambient decorative motion.
- **Don't** add pill navigation, bento cards, scroll reveals, parallax, or GSAP storytelling.
- **Don't** copy Cognition's logo, client material, CSS, font files, or source code.
- **Don't** add new decorative interface copy, scroll prompts, or pseudo-technical glyphs beyond the approved visible-copy baseline.
