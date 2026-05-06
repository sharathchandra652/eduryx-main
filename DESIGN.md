# Design System — EDURYX

## Product Context
- **What this is:** EDURYX is a hands-on AI education platform. Students build real AI products — not study slides.
- **Who it's for:** Gen Z learners, early-career professionals, developers entering AI. India-first, globally relevant.
- **Space/industry:** AI education / EdTech / developer training
- **Project type:** Web app, marketing site, and learning platform

## Memorable Thing
> "This is serious software for people who want to build — not study."

Every design decision should reinforce that EDURYX is technical, ambitious, and action-oriented. The amber arrow in the logo is the north star: forward motion, precision, speed.

---

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian with a futuristic edge — clean, data-confident, Gen Z ready
- **Decoration level:** Intentional — the amber arrow accent carries all the decoration; nothing else competes
- **Mood:** A high-stakes builder environment. Fast, precise, no-nonsense. The feeling of shipping something real.
- **Reference:** The finalised logo — `Logo/EDURYX - LEARN AI - BUILD THE FUTURE V2.png`

---

## Typography

| Role | Font | Weight | Size | Notes |
|---|---|---|---|---|
| Display / Hero | Plus Jakarta Sans | 800 | 60px | −0.025em tracking |
| H1 | Plus Jakarta Sans | 800 | 40px | −0.02em |
| H2 | Plus Jakarta Sans | 700 | 32px | −0.02em |
| H3 | Plus Jakarta Sans | 600 | 24px | −0.02em |
| H4 | Plus Jakarta Sans | 600 | 20px | −0.02em |
| Body Large | Inter | 400 | 20px | 1.65 line-height |
| Body | Inter | 400 | 18px | 1.65 line-height |
| Body Small | Inter | 400 | 16px | 1.65 line-height |
| Caption | Inter | 400 | 14px | |
| Micro | Inter | 400 | 12px | |
| Eyebrow | Inter | 600 | 12px | UPPERCASE · +0.08em |
| Tagline | Inter | 500 | 14px | UPPERCASE · +0.14em |

**Loading:** Google Fonts CDN:
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

**Never use:** Inter as display font, Poppins (Kodryx brand), Roboto, system-ui for display, any rounded novelty font.

---

## Color

**Approach:** Restrained — two brand colors + neutrals. Amber is rare and earns meaning through scarcity.

| Token | Hex | Usage |
|---|---|---|
| `--ex-navy` | `#0B1929` | Headings, body text, dark sections, primary buttons |
| `--ex-amber` | `#F5A623` | Arrow accent, metrics, emphasis dividers, accent buttons |
| `--ex-white` | `#FFFFFF` | Page background |
| `--ex-grey` | `#6B7280` | Secondary text, captions, eyebrows |
| `--ex-grey-50` | `#F7F8FA` | Alt section backgrounds |
| `--ex-grey-100` | `#EEF0F3` | Dividers, hairlines |
| `--ex-grey-200` | `#D8DCE2` | Borders, strong hairlines |
| `--ex-dark-surface` | `#0F2235` | Cards on navy backgrounds |

**Rules:**
1. No gradients. No drop shadows on static cards.
2. Amber is never used for body text or large fills.
3. White text on navy, navy text on white — no mixing.
4. Key numbers and metrics get amber. Nothing else does in body content.

---

## Spacing

**Base unit:** 4px grid

| Token | px | Usage |
|---|---|---|
| `--space-1` | 4px | Icon gap, hairline offset |
| `--space-2` | 8px | Tag padding, button icon gap |
| `--space-3` | 12px | List item gap |
| `--space-4` | 16px | Card padding (sm), button padding |
| `--space-6` | 24px | Card padding (default) |
| `--space-8` | 32px | Between card groups |
| `--space-10` | 40px | Section header bottom margin |
| `--space-12` | 48px | Section spacing (mobile) |
| `--space-16` | 64px | Section spacing (desktop) |
| `--space-20` | 80px | Hero section padding |

**Density:** Comfortable. Not cramped, not airy. Cards: 24px internal padding. Grid gap: 16px.

---

## Layout

- **Approach:** Grid-disciplined with editorial moments — strict columns for app/course content, creative for hero sections
- **Grid:** 12-column, 40px gutters desktop / 16px mobile
- **Max content width:** 1200px
- **Border radius hierarchy:**
  - `--radius-sm: 4px` — chips, small badges
  - `--radius-md: 8px` — buttons, inputs
  - `--radius-lg: 12px` — cards (default)
  - `--radius-xl: 16px` — hero panels, modals
  - `--radius-pill: 999px` — tags, toggles

---

## Motion

- **Approach:** Minimal-functional — transitions that aid comprehension only
- **Easing:** `cubic-bezier(0.2, 0, 0, 1)` standard · `cubic-bezier(0.34, 1.56, 0.64, 1)` spring (button hover lift only)
- **Duration:** 120ms fast (hover color) · 200ms base (most transitions) · 350ms slow (modals, panels)

---

## Components

### Buttons
- **Primary:** Navy fill, white text, 8px radius. Hover: slightly lighter + 1px lift.
- **Secondary:** White fill, navy border, navy text. Hover: border darkens.
- **Accent:** Amber fill, navy text. Hover: amber darkens + lift. Use for download CTAs.
- **Ghost:** Transparent, navy text. Hover: amber text. Arrow links use this.
- **Amber outline:** Transparent, amber border and text. For CTAs on dark sections.

### Cards
- Default: 1px `#EEF0F3` border, 12px radius, white bg. Hover: border turns amber.
- Featured: `border-top: 3px solid #F5A623`. Used for promoted content.
- Dark: Navy bg, amber border tint at 15% opacity.
- **No drop shadows on cards.** Border-based depth only.

### Dividers
- Hairline: `1px solid #EEF0F3` — default
- Strong: `1px solid #D8DCE2` — footer, modals
- Amber accent: `2px solid #F5A623`, 48px wide — under section headings

---

## Iconography

- **Library:** Lucide (outline only, never filled)
- **Size:** 20px inline / 24px standalone
- **Stroke:** 2px, round linecap + linejoin
- **Color:** Navy default · Amber for emphasis only · White on navy backgrounds
- **Icon wells:** `rgba(245,166,35,0.10)` background for amber-icon feature cards

---

## Voice & Content Rules

- **Confident, outcome-driven.** Lead with the concrete result. "Build Real AI Products in 8 Weeks" — not "Embark on a journey."
- **Second person.** "You will ship. You will build."
- **Amber numbers.** Key metrics get amber: `₹8L`, `78%`, `8 Weeks`.
- **Eyebrow casing.** UPPERCASE · tracked wide. Never for body text.
- **Bullet discipline.** 3–5 per section max. Lead with a verb.
- **Tagline:** "LEARN AI. BUILD THE FUTURE." — always in uppercase, tracked wide, centered.

---

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2025-05-05 | Plus Jakarta Sans (display) over Poppins | Poppins = Kodryx brand. EDURYX needs its own typeface. Plus Jakarta Sans is rounder, more contemporary, Gen Z-ready — shares the geometric energy without overlap. |
| 2025-05-05 | Amber `#F5A623` over Kodryx Gold `#C9A24D` | The logo arrow reads as a brighter, more energetic amber. More vibrant than muted Kodryx Gold — appropriate for an education/action brand. |
| 2025-05-05 | Navy `#0B1929` (deeper than Kodryx `#0E2A3A`) | Extracted from the dark logo variant. Deeper, more space-like — reinforces the "future" in the tagline. |
| 2025-05-05 | Border-based depth (no shadows on cards) | Inherited from Kodryx design philosophy. Clean, flat, technical. Shadows add noise without semantic meaning in this brand. |
| 2025-05-05 | 12px border-radius (cards) vs Kodryx 8px | EDURYX is Gen Z-facing — marginally more rounded than Kodryx's institutional look, without going playful. |
