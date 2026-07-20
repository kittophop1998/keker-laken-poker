---

version: "alpha"
name: "Cockroach Table"
description: "A playful miniature tabletop design system for a cockroach-themed bluffing board game. Combines diorama environments, mischievous insects, tactile cards, and dramatic accusation moments."

colors:
primary: "#5F7A3A"
secondary: "#D9A441"
tertiary: "#D9824B"
danger: "#B84A3A"
success: "#6B8E5A"
background: "#F3E9D7"
surface: "#FFF9EE"
surface-dark: "#302E28"
text-primary: "#302E28"
text-secondary: "#756E62"
border: "#CFC0A8"
accent: "#7B5A3E"

typography:
display:
fontFamily: "Fredoka, Nunito, System UI, sans-serif"
fontSize: "clamp(2.75rem, 6vw, 5rem)"
fontWeight: 700
h1:
fontFamily: "Fredoka, Nunito, System UI, sans-serif"
fontSize: "2.5rem"
fontWeight: 700
h2:
fontFamily: "Fredoka, Nunito, System UI, sans-serif"
fontSize: "1.75rem"
fontWeight: 650
body-md:
fontFamily: "Nunito, System UI, sans-serif"
fontSize: "1rem"
fontWeight: 400
label-caps:
fontFamily: "Nunito, System UI, sans-serif"
fontSize: "0.75rem"
fontWeight: 700
letterSpacing: "0.08em"
game-number:
fontFamily: "JetBrains Mono, monospace"
fontSize: "1rem"
fontWeight: 600

spacing:
xs: "0.5rem"
sm: "1rem"
md: "1.5rem"
lg: "3rem"
xl: "6rem"

radius:
sm: "12px"
md: "18px"
lg: "24px"
card: "20px"
pill: "999px"

shadows:
card: "0 6px 0 rgba(80, 58, 38, 0.18), 0 12px 26px rgba(48, 46, 40, 0.12)"
raised: "0 10px 0 rgba(80, 58, 38, 0.16), 0 18px 36px rgba(48, 46, 40, 0.18)"
inset: "inset 0 2px 4px rgba(48, 46, 40, 0.12)"

components:
button-primary:
backgroundColor: "{colors.primary}"
textColor: "#FFF9EE"
borderRadius: "{radius.pill}"
padding: "14px 22px"
fontWeight: 700
button-accuse:
backgroundColor: "{colors.danger}"
textColor: "#FFF9EE"
borderRadius: "{radius.pill}"
padding: "14px 24px"
fontWeight: 700
card-game:
backgroundColor: "{colors.surface}"
borderColor: "{colors.border}"
borderRadius: "{radius.card}"
boxShadow: "{shadows.card}"
player-chip:
backgroundColor: "{colors.secondary}"
textColor: "{colors.text-primary}"
borderRadius: "{radius.pill}"
-----------------------------

## Overview

Cockroach Table is a miniature tabletop-style visual system designed for a social bluffing board game centered around suspicious insects, secret cards, accusations, and badly delivered lies.

The interface should feel like players are sitting around a physical wooden table. Cards have visible thickness, tokens resemble painted wooden pieces, and insects appear as small handcrafted miniatures rather than realistic pests.

The visual personality is mischievous, warm, tactile, and slightly chaotic. It should communicate that deception is part of the fun without making the game feel aggressive or unpleasant.

The cockroach mascot should look cheeky and clever rather than dirty or frightening. Use simplified geometric anatomy, expressive eyes, short antennae, and exaggerated poses. Avoid realistic insect photography entirely because civilization has suffered enough.

* **Density:** 6/10 — Compact but readable
* **Variance:** 7/10 — Intentionally playful and asymmetrical
* **Motion:** 7/10 — Tactile and reactive
* **Mood:** Mischievous, suspicious, competitive, humorous
* **Style:** Miniature tabletop, diorama, handcrafted board game
* **Keywords:** cockroach, bluffing, cards, tabletop, accusation, miniature, wooden tokens, insects, detective, mischievous
* **Era:** Modern indie board game aesthetic
* **Light/Dark:** Full light theme / optional dark tabletop theme

## Design Direction

The page should resemble a board game arranged on a wooden table:

* Cards overlap slightly as if placed by players.
* Tokens and insect pieces cast short directional shadows.
* Sections are presented as game zones rather than standard dashboard panels.
* Important actions resemble physical buttons or wooden chips.
* Active players receive a subtle spotlight.
* Accusation actions use dramatic red-orange styling.
* Hidden cards use patterned backs with insect silhouettes.
* Revealed cards use large illustrations and minimal text.

Avoid making every object perfectly aligned. Small controlled rotations between `-2deg` and `2deg` create a believable tabletop composition.

## Colors

### Core Palette

* **Moss Green** (`#5F7A3A`) — Main brand color, primary actions, game board zones
* **Mustard Gold** (`#D9A441`) — Player highlights, coins, score markers
* **Burnt Orange** (`#D9824B`) — Secondary actions and warning moments
* **Accusation Red** (`#B84A3A`) — Challenge, accuse, incorrect claim, destructive actions
* **Leaf Green** (`#6B8E5A`) — Correct guesses and completed turns
* **Paper Cream** (`#FFF9EE`) — Cards and elevated surfaces
* **Table Beige** (`#F3E9D7`) — Main page background
* **Charcoal Brown** (`#302E28`) — Primary text
* **Muted Taupe** (`#756E62`) — Secondary text and disabled states
* **Wood Brown** (`#7B5A3E`) — Table edges, borders, decorative elements
* **Card Border** (`#CFC0A8`) — Dividers and subtle strokes

### Player Colors

Player colors must remain distinguishable without becoming neon:

* Player 1: `#5F7A3A`
* Player 2: `#C66B43`
* Player 3: `#4D7D91`
* Player 4: `#A35D78`
* Player 5: `#B58A32`
* Player 6: `#74649A`

Do not communicate player identity using color alone. Always pair colors with an avatar, player number, or icon.

## Typography

### Display and Headings

Use a rounded, playful display typeface such as **Fredoka** for:

* Game title
* Round announcements
* Turn changes
* Winner and loser screens
* Major accusation messages

Typography may be slightly condensed or rotated for decorative headings, but body content must stay horizontal and readable.

### Body and UI

Use **Nunito** or a comparable rounded sans-serif for:

* Rules
* Player names
* Action labels
* Tooltips
* Chat and game history

### Numbers and Metadata

Use **JetBrains Mono** for:

* Room codes
* Scores
* Round numbers
* Timers
* Card quantities

### Scale

* Display: `clamp(2.75rem, 6vw, 5rem)`
* H1: `2.5rem`
* H2: `1.75rem`
* H3: `1.25rem`
* Body: `1rem / 1.6`
* Small: `0.875rem`
* Label: `0.75rem`, uppercase, `0.08em` letter-spacing

## Layout

### Global Structure

* Maximum content width: `1440px`
* Main game width: `1200px`
* Horizontal page padding: `clamp(1rem, 4vw, 2.5rem)`
* Use CSS Grid for the main game layout
* Use Flexbox for player hands and action controls
* Never allow card rows to create horizontal page overflow

### Desktop Game Layout

Use an asymmetric three-zone layout:

1. **Players Zone**

   * Left side
   * Vertical list of player tokens
   * Shows status, card count, and active-turn indicator

2. **Game Table**

   * Center and widest area
   * Contains played card, claim, current target, and turn animations
   * Uses a subtle wood or fabric texture

3. **Action Zone**

   * Right side
   * Contains selectable creatures, confirm button, and accusation controls
   * Can collapse when not needed

Suggested grid:

```css
grid-template-columns:
  minmax(180px, 0.8fr)
  minmax(420px, 2.4fr)
  minmax(220px, 1fr);
```

### Mobile Layout

Below `768px`:

1. Compact round and turn header
2. Current played card area
3. Claim and accusation controls
4. Horizontal player status strip
5. Player hand
6. Game log inside a collapsible drawer

Cards must remain large enough to tap comfortably. Do not shrink the entire desktop table into a tiny archaeological exhibit.

### Landing Page

Use a split hero:

* Left: title, brief game description, primary CTA
* Right: miniature game table with four insect players
* Background: softly blurred kitchen or wooden-table diorama
* Secondary sections: zig-zag layout for gameplay explanation
* Avoid equal three-column feature cards

## Game Table

The game table is the primary visual focus.

### Surface

* Rounded rectangle with `32px` radius
* Warm wood, cork, or dark-green felt
* Thin inner border
* Soft inset shadow
* Decorative crumbs, leaves, bottle caps, and paper scraps used sparingly

### Center Play Area

Display:

* Facedown or revealed card
* Claimed creature name
* Sender and receiver
* Timer or waiting state
* Accuse and accept controls

The center play area should use a spotlight effect during major decisions. The spotlight must be achieved with gradients and opacity, not heavy glow effects.

### Player Positions

On large screens, players may appear around the edge of the table using a simplified radial layout. For accessibility and responsive behavior, maintain a corresponding linear player list in the interface structure.

## Creature Cards

The deck may contain creatures such as:

* Cockroach
* Rat
* Bat
* Spider
* Fly
* Scorpion
* Stink Bug
* Toad

Each card should include:

* Large creature illustration
* Creature name
* Unique silhouette
* Small category symbol
* Patterned background
* Clear front and back distinction

### Illustration Style

* Chunky geometric forms
* Paper-cut or clay miniature appearance
* Expressive face
* Slightly imperfect handcrafted edges
* No realistic veins, hair, fluids, or close-up insect anatomy
* No horror treatment

### Card States

* **In Hand:** Slight fan arrangement
* **Hover:** Lift `8px` and rotate toward `0deg`
* **Selected:** Lift `14px`, stronger shadow, visible outline
* **Played Facedown:** Dark patterned card back
* **Revealed:** Quick flip animation
* **Disabled:** Reduced saturation and opacity, but still readable

## Player Components

### Player Token

Each player token includes:

* Avatar or insect character
* Player name
* Number of cards remaining
* Online status
* Turn status
* Optional host crown icon

Active player:

* Slight scale increase
* Directional spotlight
* Animated turn marker
* Stronger player-color outline

Eliminated player:

* Remains visible
* Reduced emphasis
* Shows elimination badge
* Must not disappear from the game state

### Player Hand

* Cards fan gently on desktop
* Cards scroll horizontally inside their own container on mobile
* Selected card moves upward
* Card count remains visible when the hand is collapsed
* Opponent cards show card backs only

## Actions

### Primary Actions

* **Play Card**
* **Confirm Claim**
* **Accept**
* **Accuse**
* **Pass Turn**

### Accuse Button

The accuse action is the dramatic center of the game.

Design:

* Accusation red background
* Large target or eye icon
* Slightly heavier shadow
* Brief shake or impact animation after pressing
* Confirmation step only when accidental activation would be costly

Avoid generic confirmation modals. Present accusation confirmation as a small card placed over the table.

### Creature Selector

Use illustrated chips or mini cards rather than a standard dropdown.

Each option should include:

* Creature silhouette
* Creature name
* Selected state
* Keyboard focus state

On mobile, display the selector as a bottom sheet with a two-column grid.

## Components

### Primary Button

* Pill shape
* Moss green fill
* Cream text
* Weight 700
* Hover: translateY(-2px)
* Active: translateY(2px)
* Shadow compresses on press

### Secondary Button

* Paper cream surface
* Brown border
* Charcoal text
* Hover: warm beige fill

### Accusation Button

* Red fill
* Cream text
* Optional target icon
* Strong tactile shadow
* Never rely on red alone to explain the action

### Cards

* `20px` radius
* Cream paper surface
* `2px` border
* Short hard shadow plus soft ambient shadow
* Optional paper texture
* No glassmorphism

### Dialogs

Dialogs should resemble rule cards or game instruction sheets:

* Cream background
* Thick border
* Small tape, pin, or card-corner decoration
* Clear close control
* No blurred transparent glass panels

### Inputs

Inputs are mainly used outside the active game:

* Create room
* Enter room code
* Player nickname
* Game settings

Style:

* Label above field
* Cream input surface
* Dark border
* Thick focus ring
* Large touch target
* Validation message below
* No floating labels

### Game Log

The game log should read like a sequence of small event cards:

* Player avatar
* Action summary
* Creature icon
* Timestamp or turn number
* Correct and incorrect result markers

Do not display the game log as dense developer-console text unless the goal is to punish ordinary humans.

## Motion

### Motion Personality

Movement should feel like physical board-game pieces being placed, flipped, pushed, or tapped.

### Card Deal

* Translate from deck position
* Slight rotation
* `320–480ms`
* Stagger each card by `60ms`

### Card Flip

* RotateY from `0deg` to `180deg`
* Duration: `420ms`
* Reveal result after midpoint
* Perspective applied to parent container

### Accusation Result

Correct accusation:

* Card flips
* Success marker stamps onto table
* Small token bounce

Incorrect accusation:

* Card flips
* Short table shake
* Penalty card slides toward the accuser

### Turn Change

* Active player marker slides to next player
* Table spotlight transitions over `300ms`
* Avoid flashing or excessive screen shake

### Performance

Animate only:

* `transform`
* `opacity`
* CSS filter in limited decorative areas

Avoid animating layout properties such as width, height, top, and left.

Respect `prefers-reduced-motion`.

## Depth and Materials

Use layered depth to recreate a physical board game:

* Hard contact shadow directly beneath cards
* Softer ambient shadow around raised pieces
* Tiny edge highlight on cards
* Visible thickness on wooden buttons
* Subtle paper grain
* Slight surface texture on the game table

Do not apply shadows to every text label and icon. This is a board game, not a ransom note assembled in CSS.

## Diorama Environment

Decorative scenes may include:

* Kitchen counter
* Pantry shelf
* Wooden dining table
* Cardboard hideout
* Miniature alley behind a restaurant
* Underground insect clubhouse

The environment should frame the board, not compete with it.

Use tilt-shift blur only near page edges or background scenery. Interactive cards and controls must remain sharp.

## Iconography

Use a consistent outlined icon family such as Lucide.

Recommended icons:

* Eye: inspect or reveal
* Target: accuse
* Cards: hand or deck
* Users: players
* Crown: host
* Door: leave room
* RotateCcw: restart
* ScrollText: rules
* Volume2: sound
* Settings: game settings

Creature artwork should use custom illustrations or silhouettes rather than generic UI icons.

## Sound Design

Optional sound effects:

* Card placed on table
* Card flip
* Wooden token tap
* Short suspicion cue
* Correct accusation stamp
* Incorrect accusation thud

Sound must be muted by default on first load or clearly controlled by a visible sound setting.

Do not use realistic insect sounds. Nobody requested an immersive cockroach documentary.

## Empty and Loading States

### Waiting for Players

Show:

* Mini table with empty seats
* Room code
* Copy button
* Animated insect host arranging cards
* Clear player count

### Waiting for Turn

Show:

* Current player highlight
* Brief instruction
* Small idle animation on the player's insect piece

### Disconnected Player

Show:

* Muted player card
* Reconnecting status
* Timeout indicator when applicable

### Skeletons

Use component-shaped placeholders:

* Card rectangles
* Player chips
* Table zone blocks

Avoid circular loading spinners in the middle of the game table.

## Accessibility

* Minimum contrast ratio of `4.5:1` for regular text
* Minimum interactive target size: `44px`
* Visible keyboard focus for every action
* Creature cards identified by text and silhouette, not color alone
* Announce turn changes and reveal results through an ARIA live region
* Provide a reduced-motion mode
* Include sound controls
* Do not encode correct and incorrect outcomes only through green and red

## Responsive Rules

### Large Screens: `1200px+`

* Three-zone game layout
* Full player list
* Larger diorama environment
* Card fan effects enabled

### Tablet: `768px–1199px`

* Two-column layout
* Player list becomes horizontal strip
* Action panel moves below game table

### Mobile: `<768px`

* Single-column layout
* Fixed bottom action area where appropriate
* Cards use horizontal internal scrolling
* Game history moves into a drawer
* Decorative diorama details reduced
* No hover-dependent functionality

## Do's

* Use a tactile tabletop composition
* Make the cockroach mascot playful and expressive
* Create obvious visual differences between hidden and revealed cards
* Use asymmetric card placement in decorative areas
* Keep important game controls aligned and predictable
* Use miniature props to reinforce the game world
* Maintain readable creature names
* Make accusation moments visually dramatic
* Keep mobile controls reachable with one hand
* Use icons alongside text labels

## Don'ts

* Do not use realistic cockroach photography
* Do not make the visual style disgusting or horror-focused
* Do not use pure black
* Do not use neon green as the main brand color
* Do not place body text on heavily textured backgrounds
* Do not hide essential actions inside hover states
* Do not use glassmorphism
* Do not use equal-width three-column marketing sections
* Do not apply random rotations to functional form controls
* Do not overuse shake animations
* Do not use emoji inside the interface
* Do not use generic AI marketing phrases
* Do not use `h-screen`; use `min-h-[100dvh]`
* Do not allow decorative pieces to block buttons or cards

## Suggested Screens

1. **Landing Page**

   * Diorama hero
   * Create room and join room actions
   * Brief gameplay explanation
   * Creature card preview

2. **Create Room**

   * Number of players
   * Creature deck options
   * Turn timer
   * Public or private room

3. **Lobby**

   * Room code
   * Player seats
   * Host controls
   * Ready states

4. **Game Table**

   * Current card
   * Claim selector
   * Player hand
   * Accuse and accept actions
   * Player statuses

5. **Card Reveal**

   * Large flip animation
   * Correct or incorrect accusation
   * Penalty result

6. **Round Summary**

   * Cards received
   * Current standings
   * Next-round action

7. **Game Over**

   * Losing player or winning survivor
   * Final table state
   * Rematch and leave-room actions

8. **Rules**

   * Illustrated rule cards
   * Example turn
   * Creature reference

## Hero Concept

The hero scene shows a miniature wooden table viewed from a three-quarter isometric angle.

Four stylized insect characters sit around the table:

* A nervous cockroach hiding a card
* A suspicious spider leaning forward
* A smug fly holding several cards
* A confused beetle examining the wrong creature

A facedown card sits in the middle with a warm spotlight above it.

Hero copy:

**โกหกให้เนียน จับพิรุธให้ทัน**

ส่งการ์ดให้เพื่อน บอกว่าจะเป็นตัวอะไรก็ได้
แต่ถ้าอีกฝ่ายจับได้ว่าคุณโกหก การ์ดใบนั้นอาจกลับมาหาคุณเอง

Primary action: **สร้างห้องเกม**

Secondary action: **เข้าร่วมห้อง**

Supporting label: **3–6 ผู้เล่น · เกมละประมาณ 15 นาที**

## Use Case

* Online social deduction games
* Bluffing card games
* Casual multiplayer web games
* Indie board game landing pages
* Classroom communication games
* Party games for friends
