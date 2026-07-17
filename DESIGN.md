---
version: "alpha"
name: "Mini World"
description: "Miniature world / diorama-style landing page. Ideal for games indie, educação infantil, projetos criativos, portfólios lúdicos. AI-ready template."
colors:
  primary: "#7CB342"
  secondary: "#42A5F5"
  tertiary: "#FFCC80"
  neutral: "#E57373"
  surface: "#FAFAFA"
  accent: "#9E9E9E"
typography:
  h1:
    fontFamily: System UI stack
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: System UI stack
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: System UI stack
    fontSize: 0.75rem
    fontWeight: 500
spacing:
  sm: 1.5rem
  md: 3.0rem
  lg: 6.0rem
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    padding: 12px
---

## Overview

Miniature world / diorama-style landing page. Ideal for games indie, educação infantil, projetos criativos, portfólios lúdicos. AI-ready template. The miniature aesthetic in digital design traces back to tilt-shift photography's explosion in the mid-2000s — that deliberate shallow depth-of-field trick that made real cities look like toy models. Designers immediately recognized the psychological hook: tiny worlds demand closer inspection. They pull users in because the brain can't resist decoding something that looks simultaneously real and impossible.

Isometric illustration picked up where tilt-shift left off. The fixed camera angle borrowed from architectural drafting gave digital artists a framework to build entire universes at desk scale. Games like Monument Valley and Alto's Adventure proved that miniaturized worlds weren't just decorative — they were narrative devices. The constraint of smallness forced clarity.

What makes this aesthetic endure is its inherent warmth. Dioramas feel handmade even when they're purely digital. There's a craft sensibility — the suggestion that someone carefully placed every tiny element with tweezers and intention. In an era of flat, scalable, system-generated interfaces, miniature worlds feel authored. They carry fingerprints.

- Density: 5/10 — Balanced
- Variance: 4/10 — Moderate
- Motion: 8/10 — Cinematic

- **Style:** Miniature, Isometric, Blocky, Diorama
- **Keywords:** miniature, diorama, isometric, blocky characters, geometric shapes, tilt-shift, depth, toy-like, small world
- **Era:** 2020s Modern / Indie Game Aesthetic
- **Light/Dark:** ✓ Full / ◐ Partial

## Colors

- **Grass Green** (#7CB342) — Primary surface or dominant color
- **Sky Blue** (#42A5F5) — Accent highlight, links and focus states
- **Warm Sand** (#FFCC80) — Supporting palette color
- **Brick Red** (#E57373) — Error states, destructive actions
- **Soft White** (#FAFAFA) — Secondary surface
- **Stone Grey** (#9E9E9E) — Secondary text, borders, muted elements
- **Water Blue** (#29B6F6) — Secondary accent
- **Wood Brown** (#8D6E63) — Extended palette, decorative use


## Typography

- **Display / Hero:** System UI stack (-apple-system, sans-serif) — Weight 700, tight tracking, used for headline impact
- **Body:** System UI stack (-apple-system, sans-serif) — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** System UI stack (-apple-system, sans-serif) — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Split-screen (text left, visual right).
- **Feature sections:** Zig-zag alternating text+image rows. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Tilt-shift blur effect on edges, isometric grid layout, CSS 3D transforms for depth, box-shadow layers for elevation, subtle parallax on scroll, 200-300ms hover transitions

- **Physics:** Spring — stiffness 120, damping 20. Confident, weighted transitions.
- **Entry animations:** Fade + translate-Y (16px → 0) over 540ms ease-out. Staggered cascades for lists: 120ms between items.
- **Hover states:** Scale(1.03) + shadow lift over 200ms.
- **Page transitions:** Fade + slide (300ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 24px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Generously rounded (1.5rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Generously rounded (1.5rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Isometric/diorama perspective visible
- Do Blocky geometric shapes used
- Do Tilt-shift blur on edges
- Do Layered depth with shadows
- Do Warm saturated color palette
- Do Responsive grid layout


## Use Case

Indie games, Children's education, Creative projects, Playful portfolios
