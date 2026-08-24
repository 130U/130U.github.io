---
name: Theodore Ouyang Portfolio
description: Quiet technical authority with a dithered personal signature.
colors:
  signal-blue: "#2200ff"
  warm-paper: "#f7f6f5"
  editorial-ink: "#0b0b0b"
  dither-ink: "#070707"
  selection-foreground: "#fff"
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
  scale:
    micro-glyph: "9px"
    compact-label: "11px"
    metadata: "12px"
    small-interface: "13px"
    compact-body: "14px"
    body: "15px"
    mobile-body: "16px"
    large-body: "17px"
    directory-arrow: "18px"
    mobile-section-heading: "20px"
    directory-heading: "22px"
    section-heading: "24px"
    display-heading: "36px"
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
    height: "27px fine pointer / 44px coarse pointer"
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

Desktop uses a 1440px-capped 15-column frame with a 3-column sticky rail and 12-column content field. The content field repeats the same column unit internally: a quiet index track comes first and primary content occupies the following ten tracks. Tablet compresses to 12 outer columns and nine content tracks while preserving the same index-to-content relationship. Below 768px, the rail becomes a 64px sticky header and a single-column `Menu` / `Close` panel; page gutters use the Mobile Gutter token. Home alone places a full-viewport dithered entrance before this shell.

Five structural guides establish the desktop reading frame: full-height lines at the outer start, rail boundary, and reading end; shorter fading guides at the reading start and measure boundary. Each visible guide carries a 2×8px sticky viewport-edge tick. These guides are aria-hidden and never affect reading order. Mobile removes the guide layer rather than compressing it into decoration.

Major sections are separated by large intervals and real hairlines. Home uses `01`, `02`, and `03` only as positional indices in the first content track; they are never headings or eyebrow labels. Lists, degrees, and experience records remain editorial rows rather than cards. At 540px and below, phone layouts stack metadata naturally and no identifier may force horizontal scrolling. Home Coordinates uses one column on phones, a 2×2 matrix below 1280px, and a content-weighted four-column row at 1280px and above. Coarse-pointer devices preserve the same density while expanding primary navigation and standalone links to a 44px touch target.

## Elevation & Depth

The system is entirely flat. Hierarchy comes from type, whitespace, line weight, sticky position, and the dither interaction. There are no drop shadows, translucent materials, glass effects, or simulated floating cards.

**The Flat Authority Rule.** If an element needs a shadow to appear important, its hierarchy is wrong.

## Shapes

Content containers, buttons, navigation, and rows have square corners. The navigation identity is a compact monochrome `LO + Theodore Ouyang` horizontal lockup. The geometric `LO` master is shared by the rail, browser favicon, and Apple touch icon so every small-scale brand surface stays consistent. Particle texture belongs only to the large entrance and never appears inside the compact mark.

## Components

### Dithered Entrance

The Home entrance simultaneously spells `THEODORE` and `OUYANG`. Its stage scales from the viewport's shorter side and is capped at 720px on desktop and 380px on mobile. The wordmark is a real focusable control: pointer hover repels points, pointer or touch press responds immediately, release creates a short ripple, and keyboard activation creates a centered ripple. The engine keeps at most four concurrent ripples, then stops requesting animation frames at rest. Reduced motion displays the complete static wordmark and retains opacity-based hover and press feedback. The approved `Scroll` cue uses the Compact Label token and Supporting Gray so its quiet hierarchy still meets normal-text contrast.

### Navigation

Desktop navigation uses the compact black `LO + Theodore Ouyang` horizontal lockup, followed by a plain vertical list with a 2px active rule and Signal Blue text. The mark remains monochrome on hover; feedback comes from opacity and a one-pixel translation. The lockup and active-state rule share a responsive 20-24px safety inset from the structural rail. The rail contains no repeated portrait or profile card. Mobile uses the same horizontal lockup with literal `Menu` and `Close` controls, a warm-paper panel, focus containment, inert background regions, Escape dismissal, focus restoration, and no icon-only hamburger.

### Editorial Rows

Education, domain-directory, coursework, and experience records use aligned columns, large vertical breathing room, and structural hairlines. Education degree rows omit visible year markers so each institution begins directly on the reading axis. Past Experience reserves the first internal track for sequence only: domains use `01`–`05`, entries restart with lowercase `a`–`d`, and every associated heading and content block begins on the second track. Experience bullet text shares the metadata value baseline; its 3px optical marker occupies a narrow 18px gutter immediately before the text rather than floating in the label column. Hover may change text color and move an arrow by 4px; it never lifts, glows, or gains a card surface.

### Page Titles

The principal page name always owns the H1 position and Display Heading token. Education uses `Education`; Past Experience uses `Past Experience`; Current Chapter uses `Current Chapter`. A descriptive phrase may follow as 15px serif supporting copy, but it never replaces the page name or appears as a small sans eyebrow above it. Home intentionally omits a `Home` H1 because the dithered entrance and `Theodore Ouyang` identity already establish the page.

### Coordinates

Coordinates labels and values share one left baseline. The visible labels carry the meaning without decorative glyphs. Column widths follow content length, the email stays on one line, and the matrix changes density before any identifier is forced to wrap.

## Do's and Don'ts

### Do:

- **Do** preserve protected biographical sources, factual claims, routes, metadata, alt text, ARIA labels, and content order unless Theodore explicitly approves a revision.
- **Do** use whitespace and real content boundaries before adding any new visual element.
- **Do** keep the entrance interaction interruptible, idle-aware, and fully static under reduced motion.
- **Do** keep section indices in their dedicated grid track and true headings in the reading track.
- **Do** verify 1440px, 1024px, 768px, 540px, 430px, 390px, and 320px layouts before release.

### Don't:

- **Don't** add a global WebGL background, handwritten interface typography, glass navigation, or ambient decorative motion.
- **Don't** add pill navigation, bento cards, scroll reveals, parallax, or GSAP storytelling.
- **Don't** copy Cognition's logo, client material, CSS, font files, or source code.
- **Don't** add new decorative interface copy, scroll prompts, or pseudo-technical glyphs beyond the approved visible-copy baseline.
