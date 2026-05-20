# SEQ-1 / SEQ-2 Email Template Guide
## EC-2026-001 · Day 0 Cold Email · Variant A + B

Full build reference for the easyChef Pro founding email template. Read this before creating, editing, or handing off any email in the SEQ-1 or SEQ-2 sequence.

---

## Files in This Template Set

| File | Sequence | ICP | Status |
|---|---|---|---|
| `SEQ-1-E1-A_v2.html` | SEQ-1 · Email 1 · Variant A | super_mom_money | DRAFT |
| `SEQ-2-E1-B_v1.html` | SEQ-2 · Email 1 · Variant B | super_mom_time | DRAFT |

Drive folder: `1OUu2k1Iv-6nk1APO3sF3qm217YV3sGJf`

---

## Campaign Wiring

| Property | Variant A | Variant B |
|---|---|---|
| Sequence | SEQ-1 | SEQ-2 |
| Klaviyo Flow | XfqUtU (Flow A) | XCyc4m (Flow B) |
| Trigger list | TebDTM (Prelaunch Emails) | TebDTM (Prelaunch Emails) |
| LP destination | `waitlist-a.html` | `waitlist-b.html` |
| ICP | super_mom_money | super_mom_time |
| Klaviyo Template ID | T3y6Qj | Read from EmailSequences tab |
| DL_ID | DL-EM-0036 | Read from DL_IDs tab |
| Send day | Day 0 — immediate on signup | Day 0 — immediate on signup |
| From address | hello@easychefpro.com | hello@easychefpro.com |
| From label | Taylor from easyChef Pro | Taylor from easyChef Pro |

---

## Template Anatomy

The email is 9 blocks in sequence. Every block has a `<!-- REPLACE -->` comment inside the HTML marking what is variant-specific or ID-specific.

```
1. Red Brand Stripe       ← never remove · 5px top accent
2. Header                 ← logo + "FOUNDING FAMILY" label
3. Hook                   ← scene block + H1 + body + stat pills
4. Problem + Agitate      ← sec-label + h2 + body + loss block
5. Solve                  ← sec-label + h2 + body + flow bar
6. How It Works           ← 5 feature cards (TRACK/PLAN/OPTIMIZE/COOK/SHOP)
7. Proof                  ← 3-stat row
8. CTA                    ← black block · red top stripe · button
9. Signature              ← "From the kitchen" label + red dashed rule + Taylor
10. Footer                ← unsubscribe + privacy links
```

---

## Block-by-Block Reference

### 1. Red Brand Stripe
```html
<td style="background-color:#FF0000;height:5px;font-size:0;line-height:0;">&nbsp;</td>
```
- Never remove. Brand consistency rule.
- Always the first `<tr>` inside the email body table.

---

### 2. Header
- Red "FOUNDING FAMILY" uppercase label above the logo.
- Logo src: `https://launch.easychefpro.com/assets/logo.png`
- Logo link UTMs: `utm_source=email&utm_medium=email&utm_campaign=EC-2026-001`
- **REPLACE:** update logo src only if hosting domain changes.

---

### 3. Hook Block
Background: `#F6EFE8` (beige)

**Scene block** — the ICP-specific "door." This is the only part of the hook that changes between A and B.

| Variant A (money) | Variant B (time) |
|---|---|
| "Every week, $25 disappears from your grocery budget." | "It's 6:30 PM. You're standing at the fridge." |
| "Not from eating out. Not from overspending. From food you bought that was supposed to become dinner and never did." | "You bought groceries two days ago. You planned something for tonight. You still don't know what's for dinner." |

**H1** — locked master story line. Never change.
```
The problem was never you.
The system was disconnected.
```

**Stat pills** — ICP-specific numbers.

| Variant A | Variant B |
|---|---|
| $111/month | 5-10 hrs/week |
| $1,336/year | 10-21 days/year |
| $3.66 every single day | 5 apps, 0 connections |

---

### 4. Problem + Agitate Block
Background: `#ffffff` (white)

Structure: `sec-label` → `h2` → body copy (2 paragraphs) → loss block → body copy

**Loss block** — the locked emotional line. ICP-specific. Never rewrite.

| Variant A | Variant B |
|---|---|
| "Every dollar in the bin is a dollar your family does not have. Every day you wait costs $3.66." | "Every night she wings it is an evening she did not choose for her family." |

Loss block styling: `background-color:#000000; border-top:4px solid #FF0000; border-radius:12px`

---

### 5. Solve Block
Background: `#F6EFE8` (beige)

The flow bar is identical across all variants — it is the product, not the angle.

```html
TRACK ↱ PLAN ↱ OPTIMIZE ↱ COOK ↱ SHOP
```

Arrow character: `&#8618;` (↱) — not a plain `→`. This matches the user-approved rendered version.

Flow bar table: `background:#ffffff; border:1.5px solid #E0D8CE; border-radius:12px`

**h2 headline changes per variant:**
- A: "easyChef Pro closes that loop."
- B: "easyChef Pro is the system your kitchen was always missing."

---

### 6. Feature Cards Block
Background: `#ffffff` (white)

5 cards. Each card is its own `<table>` for email-safe rendering (no flexbox, no grid).

Card structure per row:
```
[RED STAGE BADGE] | [HEADLINE] [BODY COPY]
```

**What changes A vs B:**

| Stage | Variant A headline (money) | Variant B headline (time) |
|---|---|---|
| TRACK | The invisible leak stops. | Your fridge stops being a mystery. |
| PLAN | Dinner decided before you open the fridge. | The decision is made before 6:30 PM arrives. |
| OPTIMIZE | Every meal scored. Nothing guessed. | Every meal scored. Nothing to figure out. |
| COOK | Fridge to table in 30 minutes. | 30 minutes. What is in your fridge. On the table. |
| SHOP | The list builds itself. | The list writes itself. Every time. |

**Body copy per card also changes** — A leads with $111 savings proof, B leads with time/mental load relief.

Stage badge CSS: `background-color:#FF0000; color:#ffffff; border-radius:100px; padding:5px 13px`

---

### 7. Proof Block
Background: `#F6EFE8` (beige)

3-column stat row. Numbers are locked approved claims.

| Variant A order | Variant B order |
|---|---|
| $1,336 (lead) | 10-21 days (lead) |
| 69.5% waste reduction | $1,336 (secondary) |
| 800K+ products | 800K+ products |

**Rule:** The ICP's primary pain leads the proof row. Money angle leads with savings. Time angle leads with time back.

Approved claim numbers (never change without re-verifying against ApprovedClaims tab):
- `$1,336` average annual savings · validated across 10,000 household profiles
- `69.5%` less food waste
- `800K+` products verified by registered dietitians
- `10,000` real households tested
- `10-21` full days back per year

---

### 8. CTA Block
Background: `#000000` (black)
Top border: `border-top:5px solid #FF0000`

**CTA headline changes per variant:**
- A: "Stop the $111 monthly leak. Permanently."
- B: "Dinner decided. Every night."

**CTA button:**
```html
background-color:#FF0000;
border-radius:100px;
box-shadow:0 8px 24px rgba(255,0,0,0.35);
```

**CTA URL structure:**
```
https://launch.easychefpro.com/lp/waitlist-[a|b]
  ?utm_source=email
  &utm_medium=email
  &utm_campaign=EC-2026-001
  &utm_content={{DL_ID}}
  &utm_term={{ASSET_ID}}
```

**REPLACE:** `{{DL_ID}}` and `utm_term` must be updated for every email in the sequence. Read from DL_IDs tab and EmailSequences tab.

---

### 9. Signature Block
Background: `#F6EFE8` (beige)

```
FROM THE KITCHEN     ← red uppercase label
- - - - - - - -      ← red dashed rule (opacity 0.3)
Talk soon,
Taylor
Founder, easyChef Pro
```

**REPLACE:** Update name/role if sender changes. "From the kitchen" label is brand voice — keep.

---

### 10. Footer
Background: `#000000` (black)

Required tokens:
- `{{unsubscribe_url}}` — Klaviyo will inject this
- Privacy link: `https://launch.easychefpro.com/privacy`

---

## Styling System

### Email body container
```css
border-radius: 20px;
box-shadow: 0 12px 40px rgba(42,37,34,0.10);
overflow: hidden;
max-width: 600px;
```
Mobile (max-width 620px): `border-radius: 0; box-shadow: none`

### Colors
| Token | Hex | Use |
|---|---|---|
| Brand red | `#FF0000` | Stripe, badges, labels, accents, CTA button |
| Black | `#000000` | Headings, loss block, CTA bg, stat pills |
| Beige | `#F6EFE8` | Alternating section bg, outer wrapper |
| White | `#ffffff` | Main content bg, cards, scene block |
| Border | `#E0D8CE` | All dividers, card borders |
| Body text | `#444444` | All paragraph copy |
| Muted | `#555555` | Secondary text, feat-card body |

### Typography
| Use | Font stack | Weight | Size |
|---|---|---|---|
| Headings, badges | `'Proza Libre', Georgia, serif` | 700 | H1: 30px · H2: 24px |
| Body | `'Inter', Arial, Helvetica, sans-serif` | 400/500/600 | 16px body · 14px small |
| Stat pills | `'Proza Libre', Georgia, serif` | 600 | 15px |
| Proof numbers | `'Proza Libre', Georgia, serif` | 700 | 32px |
| Section labels | `'Inter'` | 600 | 11px · 1.5px letter-spacing · uppercase |

### Section padding
Standard: `padding: 36px 40px`
Mobile: `padding-left: 24px; padding-right: 24px`

---

## UTM + DL_ID Reference

Every email has its own DL_ID and appears in `utm_content`. The `utm_term` carries the asset ID for per-email tracking.

```
utm_source=email
utm_medium=email
utm_campaign=EC-2026-001
utm_content={{DL_ID}}         ← unique per email in sequence
utm_term={{ASSET_ID}}         ← e.g. SEQ-1-E1-A
```

DL_IDs live in the DL_IDs tab of the Campaign Center Sheet. Asset IDs follow the pattern:
`EC-2026-001-{SEQUENCE}-{EMAIL_NUMBER}-{VARIANT}`

---

## REPLACE Checklist (per new email)

Before handing to Klaviyo, verify every `<!-- REPLACE -->` comment is resolved:

- [ ] Scene block opening line (ICP door — changes per variant)
- [ ] Stat pills (A = money stats, B = time stats)
- [ ] Problem h2 (copy direction)
- [ ] Loss block quote (locked ICP-specific line)
- [ ] Solve h2 (copy direction)
- [ ] Feature card headlines + body (A vs B angle)
- [ ] Proof row lead stat (A = $1,336 first, B = time days first)
- [ ] CTA headline (A = money loss angle, B = time relief)
- [ ] CTA URL `{{DL_ID}}` placeholder — replace with actual DL_ID from sheet
- [ ] CTA URL `utm_term` — replace with actual ASSET_ID
- [ ] Footer `{{unsubscribe_url}}` — Klaviyo injects this automatically
- [ ] Metadata comment block — ASSET_ID, KLAVIYO_ID, DL_ID all confirmed

---

## Rules

- **No em dashes** anywhere in copy. They are the AI writing tell.
- **No `Content-Type: application/json`** in any GAS fetch calls — always `text/plain`.
- **Stat numbers are locked approved claims** — never round, never paraphrase. Verify against ApprovedClaims tab before changing.
- **Loss block quotes are locked** — they are ICP-specific emotional lines approved with the master story. Do not rewrite.
- **H1 "The problem was never you. The system was disconnected."** is the locked master story line. Never change it across any variant.
- **Flow bar stages are locked** — TRACK / PLAN / OPTIMIZE / COOK / SHOP in that order always.
- **From address**: `hello@easychefpro.com` — never change.
- **From label**: `Taylor from easyChef Pro` — set in Klaviyo UI only (API is read-only for flow-messages).

---

## How to Build the Next Email in Sequence

1. Copy the correct variant file (A or B).
2. Update subject line and preview text for the new email's angle.
3. Update the scene block opening line (the "door" — ICP-specific but distinct per email).
4. Update body copy to reflect the new email's position in the narrative arc.
5. Keep H1, loss block quote, flow bar, feature cards, and proof row unchanged (or only update the lead stat if sequence calls for it).
6. Replace `{{DL_ID}}` with the actual DL_ID from the DL_IDs tab.
7. Replace `utm_term` with the new asset ID.
8. Update the metadata comment block at the bottom.
9. Upload to Klaviyo. Verify template renders in Klaviyo preview before activating.

---

## Connected Assets

| Asset | Location |
|---|---|
| LP-A (waitlist-a) | `firebase-deploy/public/lp/waitlist-a.html` · Drive: `17fvv7Ox3fbXf3vmvnnfwRgWucI9bdc8I` |
| LP-B (waitlist-b) | `firebase-deploy/public/lp/waitlist-b.html` · Drive: `1hJXZmYH0yUcHiuk7PxrMEpJ1pn4TSoSW` |
| Thank-you page | `firebase-deploy/public/thank-you.html` · Drive: `187wWQQhF3yr0cJq1fyIr7IoXZsm7sPRM` |
| LP Template Guide | Drive: `1TzJaj6TlblHYNw_ooMckFlYPX2Yw_QXv` |
| SEQ-1-E1-A v2 | `email-templates/SEQ-1-E1-A_v2.html` · Drive: `198iFzmrmR4xQjSFWZdveTo4I-ys7n1nE` |
| SEQ-2-E1-B v1 | `email-templates/SEQ-2-E1-B_v1.html` · Drive: see upload ID below |
| Campaign Center Sheet | `1zX8sc-YoKXMNmEOJi8YEpGcmOFbh1sA7xSa2evb_VZE` |
| EmailSequences tab | Read via `email_sequences_read` GAS action |
| DL_IDs tab | Read via Campaign Center Sheet — DL_IDs tab |
