# easyChef Pro — Branding & Design System

> Source of truth for all visual design decisions in the Campaign Cockpit and generated assets.
> Linked from CLAUDE.md. Update this file whenever a design decision changes.

---

## Brand Colors

| Token | Hex | Usage |
|---|---|---|
| Primary Red | `#FF0000` | CTA buttons, accent borders, active states, links |
| Beige | `#F6EFE8` | Light-mode backgrounds, card fills on light canvases |
| Black | `#000000` | Primary text, high-contrast headings |
| White | `#FFFFFF` | Text on red, icon fills, overlay text |

**Tints (opacity-only — never mix with off-brand hues):**
- `rgba(255,0,0,0.10)` — subtle active background
- `rgba(255,0,0,0.18)` — medium emphasis (focus rings, glow)
- `rgba(255,0,0,0.25)` — strong active fill
- `rgba(0,0,0,0.N)` — surface overlays

**Never use:** pinks, greens (except status indicators), blues (except scheduled status dot), tans, purples (except emotion tags), yellows (except queue status), gradients, neon, AI glow effects.

---

## Typography

| Role | Family | Weight | Where |
|---|---|---|---|
| Display / KPI values | Proza Libre | 600, 700 | `h1`, `.kpi-val`, `.cal-month-title` |
| Body / UI labels | Inter | 400, 500, 600 | `body`, all other text |
| Code / HTML areas | DM Mono | — | `.pm-html-area textarea` |

**Google Fonts import (in `<head>`):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Proza+Libre:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## Cockpit CSS Token Layer

Defined in `cockpit.html` `<style>` block. Deployed as of @723.

```css
:root {
  /* Backgrounds */
  --bg:        #0c0c0e;
  --surface:   #161618;   /* cards, panels */
  --surface-2: #1a1a1e;   /* elevated surfaces, popups */
  --surface-3: #1e1e22;   /* hover states, cells */
  --input:     #0e0e10;   /* text inputs */

  /* Borders */
  --border:    #2a2a2e;   /* primary border */
  --border-sub:#1e1e22;   /* subtle separator */

  /* Text hierarchy */
  --text-hi:   #f0f0f0;   /* primary text */
  --text-md:   #aaa;      /* secondary text */
  --text-lo:   #666;      /* muted / labels */
  --text-dim:  #444;      /* disabled / placeholders */

  /* Brand accent */
  --accent:    #FF0000;
  --accent-10: rgba(255,0,0,0.10);
  --accent-18: rgba(255,0,0,0.18);
  --accent-25: rgba(255,0,0,0.25);

  /* Status colors (DO NOT swap these for brand red) */
  --green:     #32d74b;   /* published */
  --yellow:    #ffd60a;   /* queue / designer review */
  --red-soft:  #ff453a;   /* blocked */
  --purple:    #bf5af2;   /* emotion tags */

  /* Fonts */
  --font-head: 'Proza Libre', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
}
```

---

## Status Colors (Semantic — Do Not Swap for Brand Red)

| Status | Color | Hex |
|---|---|---|
| Generated | Charcoal | `#3a3a3a` |
| In Figma | Blue | `#3a7aff` |
| Designer Review | Yellow | `#ffd60a` |
| Approved | Green | `#30c05a` |
| Scheduled | Blue | `#0a84ff` |
| Published | Green | `#32d74b` |
| Reported | Purple | `#bf5af2` |

**Note:** `scheduled` intentionally stays `#0a84ff` (blue) to distinguish it from `blocked` (`#ff453a` red).

---

## Design Principles (easyChef Pro Style)

- **Style:** Soft UI Evolution (dark canvas, subtle depth, clean geometry)
- **Anti-patterns:** emoji icons, neon/AI gradients, dark-mode violations, visual clutter
- **Canvas safe zone:** ≥80px on all edges for generated design assets
- **Contrast:** WCAG AA enforced on all text/background combinations
- **Depth:** Surfaces use layered `background` values, not `box-shadow` as primary depth tool

---

## Generated Asset Rules (from `_getSkillBlock('design')`)

These rules live in `Operations_AssetBuilder.gs` → `_getSkillBlock('design')` and are prepended to the AI system prompt for all `generate_design_for_asset` calls:

- **EMOJI BAN** — No emoji characters as visual elements. Use geometric shapes, lines, icons from brand-approved set.
- **BRAND COLOR LOCK** — Only `#FF0000`, `#F6EFE8`, `#000000`, `#FFFFFF` and opacity variants in any generated element.
- **Doctrine override rule** — Skill provides layout/hierarchy framework. `BRAND_VISUAL_TOKENS_001` provides final colors/fonts/spacing. Doctrine always wins.

---

## Cockpit Redesign — Session Log

### Session 1 — Deploy @723 (May 2026)
- Added Google Fonts import (Proza Libre + Inter)
- Added `:root` CSS token layer (22 custom properties)
- Replaced all `#0a84ff` blue accent (23 CSS + 5 JS) with `var(--accent)` = `#FF0000`
- Converted all blue-tinted `rgba(10,132,255,...)` backgrounds to red equivalents
- `body` font → Inter via `var(--font-body)`
- `h1`, `.kpi-val`, `.cal-month-title` → Proza Libre via `var(--font-head)`
- Preserved: milestone swatch `#0a84ff` option, `scheduled` status dot `#0a84ff`

### Session 2 — Deploy @724 (May 2026)
- Page background: `#F6EFE8` beige; removed all dark `#0c0c0e` backgrounds
- Cards and panels: `#FFFFFF` white; borders: `rgba(0,0,0,0.08)` soft
- KPI cards: white + `border-top: 3px solid #FF0000` stripe + `box-shadow: 0 2px 8px rgba(0,0,0,0.06)`
- Pipeline bars: beige `#F6EFE8` track, `#FF0000` brand red fill; PIPELINE_COLORS all → `#FF0000`
- Calendar: white cells for in-campaign days, `#EDE8E0` beige for non-campaign, `#E8E3DB` for outside, `#FFF5F5` for today
- Filter pills: white background + red `#FF0000` border inactive; red background + white text active
- Day popup + PM card: white body, beige `#F6EFE8` drag header
- Platform chips updated to light-mode semi-transparent backgrounds
- Status colors adjusted for WCAG contrast on light: green `#16a34a`, yellow `#b45309`, purple `#7c3aed`
- STATUS_DOT_COLOR updated for light backgrounds

---

## Linked References

- **CLAUDE.md** — project ops instructions (links here)
- **`cockpit.html`** — live frontend; all CSS in `<style>` block
- **`Operations_AssetBuilder.gs`** → `_getSkillBlock('design')` — AI design generation rules
- **Permanent Roadmap Doc** — `1PK1VOmMghvYw6CbhHvDmv0MSE58fBeIPN28Knhi0J6M` (Google Doc, session log lives here)
- **UI/UX Pro Max skill** — `.agents/ui-ux-pro-max-skill/` (git submodule v2.5.0)
