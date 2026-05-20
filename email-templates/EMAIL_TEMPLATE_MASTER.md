# EMAIL TEMPLATE MASTER REFERENCE
## This is where all live email templates live
### EC-2026-001 · easyChef Pro Pre-Launch Founding Emails

**Rule:** Every email template deployed to Klaviyo must be documented in this file.
**Rule:** EMAIL_LP_RELATIONSHIP_001 is locked — emails are single scenes, not LP retells.
**Rule:** When design skins a template, increment the version and follow Section 7 update protocol.

---

## SECTION 1 — APPROVED BASE TEMPLATES

### Variant A — super_mom_money (money / grocery waste angle)

| Property | Value |
|---|---|
| **File** | `SEQ-1-E1-A_v3_APPROVED.html` |
| **Local path** | `email-templates/SEQ-1-E1-A_v3.html` |
| **Drive ID** | `1K-gPpXh6Km3gYwqjQCPRLqqazrp1vCAx` |
| **Drive URL** | https://drive.google.com/file/d/1K-gPpXh6Km3gYwqjQCPRLqqazrp1vCAx/view |
| **GitHub** | `email-templates/SEQ-1-E1-A_v3.html` |
| **Klaviyo template** | `UxsJ3U` (standalone — wire to Flow A XfqUtU Step 1 in Klaviyo UI) |
| **Flow** | `XfqUtU` (Flow A) |
| **Trigger list** | `TebDTM` (Prelaunch Emails) |
| **Variant list** | `UQTdyL` (EC Variant A Money) |
| **DL_ID** | `DL-EM-0036` |
| **Status** | APPROVED — v3 scene-based · UTM fixed · EMAIL_LP_RELATIONSHIP_001 |
| **Subject** | That $47 DoorDash charge. You already paid for that dinner. |
| **Preview** | The chicken is still in your fridge. |
| **Scene** | Sunday $180 groceries → Wednesday 6:22 PM DoorDash |

### Variant B — super_mom_time (time / mental load angle)

| Property | Value |
|---|---|
| **File** | `SEQ-2-E1-B_v2_APPROVED.html` |
| **Local path** | `email-templates/SEQ-2-E1-B_v2.html` |
| **Drive ID** | `1fscbRWZHkO_PY-SmLFtFSWWBp_zEmjUA` |
| **Drive URL** | https://drive.google.com/file/d/1fscbRWZHkO_PY-SmLFtFSWWBp_zEmjUA/view |
| **GitHub** | `email-templates/SEQ-2-E1-B_v2.html` |
| **Klaviyo template** | `YvrLDj` (standalone — wire to Flow B XCyc4m Step 1 in Klaviyo UI) |
| **Flow** | `XCyc4m` (Flow B) |
| **Trigger list** | `TebDTM` (Prelaunch Emails) |
| **Variant list** | `VpgZPZ` (EC Variant B Time) |
| **DL_ID** | `DL-EM-0043` |
| **Status** | APPROVED — v2 scene-based · UTM fixed · Klaviyo template YvrLDj created |
| **Subject** | You planned Sunday. It was gone by Tuesday. |
| **Preview** | The 6:30 wall isn't about time. The plan just had nowhere to live. |
| **Scene** | Sunday five meals mapped → Wednesday 6:28 PM full fridge, nothing started |

---

## SECTION 2 — DESIGN SYSTEM TOKENS

Extracted from `SEQ-1-E1-A_v3.html` (canonical base template).

### Colors

| Token | Hex | Use |
|---|---|---|
| Brand red | `#FF0000` | Top stripe · CTA button · loss block top border · section labels · scene block left border |
| Black | `#000000` | CTA background · loss block background · footer background · H1/H2 text |
| Beige | `#F6EFE8` | Outer wrapper background · content section background · signature background |
| White | `#ffffff` | Email body background · header background · scene block background |
| Border | `#E0D8CE` | Section dividers · scene block border · card borders |
| Body text | `#444444` | All paragraph copy |
| Muted | `#555555` | Secondary text · scene block subtext |
| Footer text | `#444444` | Footer paragraph text |
| Footer links | `#666666` | Unsubscribe · privacy links |

### Typography

| Use | Font stack | Weight | Size |
|---|---|---|---|
| Scene headline | `'Proza Libre', Georgia, serif` | 600 | 20px (mobile: 17px) |
| H1 main | `'Proza Libre', Georgia, serif` | 700 | 28px (mobile: 24px) |
| CTA headline | `'Proza Libre', Georgia, serif` | 700 | 26px (mobile: 22px) |
| Signature name | `'Proza Libre', Georgia, serif` | 700 | 17px |
| CTA button | `'Proza Libre', Georgia, serif` | 700 | 17px |
| Body copy | `'Inter', Arial, Helvetica, sans-serif` | 400 | 17px |
| Scene subtext | `'Inter', Arial, Helvetica, sans-serif` | 400 | 16px |
| Section labels | `'Inter', Arial, Helvetica, sans-serif` | 600 | 10–11px · 1.5–2px letter-spacing · uppercase |
| Founding badge | `'Inter', Arial, Helvetica, sans-serif` | 600 | 14px |
| Footer | `'Inter', Arial, Helvetica, sans-serif` | 400 | 12px |
| P.S. | `'Inter', Arial, Helvetica, sans-serif` | 400 | 13px · italic |

Google Fonts import: `https://fonts.googleapis.com/css2?family=Proza+Libre:wght@600;700&family=Inter:wght@400;500;600&display=swap`

### Layout

| Property | Value |
|---|---|
| Max width | 600px |
| Email body border-radius | 20px (mobile: 0) |
| Email body box-shadow | `0 12px 40px rgba(42,37,34,0.10)` (mobile: none) |
| Outer wrapper padding | `32px 16px` |
| Section padding (desktop) | `40px 40px` |
| Section padding (mobile) | `24px 24px` |
| Mobile breakpoint | `max-width: 620px` |

### Key Component Styles

**CTA Button:**
```css
background-color: #FF0000;
color: #ffffff;
border-radius: 100px;
padding: 16px 40px;
box-shadow: 0 8px 24px rgba(255,0,0,0.35);
font-family: 'Proza Libre', Georgia, serif;
font-size: 17px;
font-weight: 700;
```

**Loss Block:**
```css
background-color: #000000;
border-top: 4px solid #FF0000;
border-radius: 12px;
padding: 24px 28px;
```

**Scene Block:**
```css
background-color: #ffffff;
border: 1.5px solid #E0D8CE;
border-left: 4px solid #FF0000;
border-radius: 12px;
padding: 22px 24px;
box-shadow: 0 2px 8px rgba(255,0,0,0.05);
```

**CTA Section:**
```css
background-color: #000000;
border-top: 5px solid #FF0000;
padding: 36px 40px;
```

**Red Brand Stripe (top):**
```css
background-color: #FF0000;
height: 5px;
```

---

## SECTION 3 — EMAIL STRUCTURE (block by block)

Every email in this system uses these 8 blocks in order. **Never remove or reorder them.**

### Block 1 — Red Brand Stripe
- **HTML:** `<td style="background-color:#FF0000;height:5px;">`
- **Contains:** 5px red accent bar
- **Change per email:** Never
- **Never change:** Color, height, position (always first block)

### Block 2 — Header
- **HTML class:** `.section-pad`
- **Contains:** "FOUNDING FAMILY" red label + easyChef Pro logo
- **Change per email:** Never (logo src, logo link, label text all locked)
- **Never change:** Logo URL, "Founding Family" label, font size

### Block 3 — Scene Block
- **HTML class:** `.scene-p` (inside `.section-pad` beige wrapper)
- **Contains:** White card with red left border — scene headline + scene subtext
- **Change per email:** Scene headline and subtext (the "door" — ICP-specific, email-specific)
- **Never change:** Card styling, beige background, left border color

### Block 4 — Recognition H1
- **HTML class:** `.h1-main`
- **Contains:** 28px Proza Libre headline
- **Change per email:** H1 text changes to match the email's specific recognition moment
- **Never change:** Font, size, color — must feel like the master story line

### Block 5 — Body Copy + Loss Block
- **Contains:** 2 body paragraphs → black loss block → one-line solve
- **Change per email:** Body copy reflects the scene's specific gap/cost
- **Never change:** Loss block styling (black bg, red top border) · loss block quote text is ICP-locked:
  - A (money): "The problem was never you. The system was disconnected."
  - B (time): "The problem was never you. The system was disconnected."
  *(both use the same locked master story line)*

### Block 6 — CTA Block
- **HTML:** Black block with red top border (`border-top: 5px solid #FF0000`)
- **Contains:** CTA headline + founding price line + red button + free-to-join note
- **Change per email:** CTA headline text (outcome framed to this email's scene)
- **Never change:** Button color (#FF0000), button shape (100px radius), pricing line ($7.99/month), founding spots copy

### Block 7 — Signature
- **Contains:** "FROM THE KITCHEN" label + dashed red rule + Taylor sign-off + P.S.
- **Change per email:** P.S. line (ties back to this email's scene)
- **Never change:** "From the kitchen" label, sender name (Taylor), title (Founder, easyChef Pro)

### Block 8 — Footer
- **Contains:** Klaviyo unsubscribe token + privacy link
- **Change per email:** Never
- **Never change:** `{{unsubscribe_url}}` token must remain exactly as-is (Klaviyo injects it)

---

## SECTION 4 — HOW TO BUILD A NEW EMAIL IN THIS SEQUENCE

Follow these steps in order for every new email added to SEQ-1 or SEQ-2:

**1. Copy the correct base template**
- Variant A (money angle) → copy `SEQ-1-E1-A_v3.html`
- Variant B (time angle) → copy `SEQ-2-E1-B_v2.html`
- Rename: `SEQ-{N}-E{X}-{A|B}_v1.html`

**2. Update the subject line and preview text**
- Subject: One sentence. One scene signal. No em dashes.
- Preview: Sensory detail from the scene. Never repeats the subject line.
- Update both the `<title>` tag and the hidden preheader `<div>`.

**3. Rewrite the scene block only**
- Update the `.scene-p` headline and the subtext below it.
- This is the only content that must be unique per email.
- Every scene must be different from every other email in the sequence.
- Good examples: cilantro at the back of the fridge · same three meals every week · shopping cart that ignores what you own

**4. Rewrite H1, body, P.S. to match the scene**
- H1: The specific recognition for this scene (follows scene, leads to loss block)
- Body P1: What the scene reveals about the gap
- Body P2: What that gap costs (money or time angle)
- Loss block quote: LOCKED — never change
- One-line solve: LOCKED — "easyChef Pro [closes the gap in one sentence]"
- P.S.: Ties the P.S. urgency back to this email's specific scene

**5. Update the CTA headline**
- Outcome-framed for this email's specific angle
- Never generic — must feel like the conclusion of this scene specifically

**6. Update UTM params in the CTA button link**
- `utm_source=klaviyo` (always klaviyo, never email)
- `utm_medium=email`
- `utm_campaign=EC-2026-001`
- `utm_content={DL_ID}` — read the correct DL_ID from EmailSequences tab in Campaign Center Sheet
- `utm_term={ASSET_ID}` — format: `SEQ-{N}-E{X}-{A|B}`

**7. Update the metadata comment block at the bottom of the HTML**
```
{{ASSET_ID}}      EC-2026-001-SEQ-{N}-E{X}-{A|B}
{{KLAVIYO_ID}}    [get from EmailSequences tab or PENDING PUSH]
{{DL_ID}}         [read from EmailSequences tab]
{{STATUS}}        DRAFT or APPROVED
{{VERSION}}       v1
```

**8. Push to Klaviyo**
- If updating an existing template: call GAS action `klaviyo_update_template` with `template_id` + `html`
- If creating a new template: call GAS action `klaviyo_create_template` with `name` + `html`
- Record the returned template ID in the EmailSequences tab

**9. Update this file**
- Add a row to Section 5 with the new email's Drive ID, Klaviyo ID, and status
- Update Section 6 with any new Drive uploads

**10. Upload to Drive and push to GitHub**
- Upload to folder `1OUu2k1Iv-6nk1APO3sF3qm217YV3sGJf`
- File name format: `SEQ-{N}-E{X}-{A|B}_v{N}_APPROVED.html`
- Commit to `main` with message: `feat: SEQ-{N}-E{X}-{A|B} approved · EMAIL_LP_RELATIONSHIP_001`

---

## SECTION 5 — ALL TEMPLATE VERSIONS

| Sequence | Email | Variant | ICP | Version | Local File | Drive ID | Klaviyo ID | Flow | Status |
|---|---|---|---|---|---|---|---|---|---|
| SEQ-1 | E1 | A | super_mom_money | v3 | `SEQ-1-E1-A_v3.html` | `1K-gPpXh6Km3gYwqjQCPRLqqazrp1vCAx` | `UxsJ3U` | XfqUtU | APPROVED — wire to Flow A Step 1 in Klaviyo UI |
| SEQ-2 | E1 | B | super_mom_time | v2 | `SEQ-2-E1-B_v2.html` | `1fscbRWZHkO_PY-SmLFtFSWWBp_zEmjUA` | `YvrLDj` | XCyc4m | APPROVED — wire to Flow B Step 1 in Klaviyo UI |
| SEQ-1 | E1 | A | super_mom_money | v2 | `SEQ-1-E1-A_v2.html` | `198iFzmrmR4xQjSFWZdveTo4I-ys7n1nE` | T3y6Qj | XfqUtU | ARCHIVED — LP-mirror version, superseded by v3 |
| SEQ-2 | E1 | B | super_mom_time | v1 | `SEQ-2-E1-B_v1.html` | `1iEt5-D1epG2aen90781xrkTdSrCK4y6g` | — | XCyc4m | ARCHIVED — LP-mirror version, superseded by v2 |

---

## SECTION 6 — WHERE TEMPLATES LIVE

### Drive Folder
Folder ID: `1OUu2k1Iv-6nk1APO3sF3qm217YV3sGJf`
Drive URL: https://drive.google.com/drive/folders/1OUu2k1Iv-6nk1APO3sF3qm217YV3sGJf

| File | Drive ID | Notes |
|---|---|---|
| `SEQ-1-E1-A_v3_APPROVED.html` | `1K-gPpXh6Km3gYwqjQCPRLqqazrp1vCAx` | APPROVED base template — Variant A |
| `SEQ-2-E1-B_v2_APPROVED.html` | `1fscbRWZHkO_PY-SmLFtFSWWBp_zEmjUA` | APPROVED base template — Variant B |
| `SEQ-1-EMAIL-TEMPLATE-GUIDE.md` | `1lDBJLVmjVWuoWcZvOuQceJu6pO-VO6A9` | Legacy template guide (block reference) |
| `SEQ-1-E1-A_v2.html` | `198iFzmrmR4xQjSFWZdveTo4I-ys7n1nE` | ARCHIVED — LP-mirror version |
| `SEQ-2-E1-B_v1.html` | `1iEt5-D1epG2aen90781xrkTdSrCK4y6g` | ARCHIVED — LP-mirror version |

### GitHub
Repository: `BoaterGuy15/easyChef-Pro-Ops-Center`
All email templates: `email-templates/` directory

| File | Path |
|---|---|
| Base A (APPROVED) | `email-templates/SEQ-1-E1-A_v3.html` |
| Base B (APPROVED) | `email-templates/SEQ-2-E1-B_v2.html` |
| Template guide | `email-templates/SEQ-1-EMAIL-TEMPLATE-GUIDE.md` |
| This file | `email-templates/EMAIL_TEMPLATE_MASTER.md` |

### Klaviyo
Account: easyChef Pro · Verified sender: `hello@easychefpro.com` · From label: `Taylor from easyChef Pro`

| Template ID | Email | Status |
|---|---|---|
| `UxsJ3U` | SEQ-1-E1-A (Variant A · money) | CREATED ✓ — wire to Flow A (XfqUtU) Step 1 in Klaviyo UI |
| `YvrLDj` | SEQ-2-E1-B (Variant B · time) | CREATED ✓ — wire to Flow B (XCyc4m) Step 1 in Klaviyo UI |

### Firebase (static pages)
Email HTML files are **not hosted on Firebase** — they live in Klaviyo only.
Firebase hosts LPs (`waitlist-a.html`, `waitlist-b.html`) that emails link to.

---

## SECTION 7 — UPDATE PROTOCOL

### When design team skins the template

1. **Design updates the HTML** — skins it to match LP/website visual system (same color tokens, same Proza Libre + Inter fonts, same beige/black/red structure)
2. **Increment version number** — v3 → v4 for A · v2 → v3 for B
3. **Upload new version to Drive** (same folder `1OUu2k1Iv-6nk1APO3sF3qm217YV3sGJf`)
   - Name format: `SEQ-{N}-E{X}-{A|B}_v{N}_APPROVED.html`
4. **Push to Klaviyo template** via GAS action:
   ```json
   {"action":"klaviyo_update_template","template_id":"T3y6Qj","html":"[full HTML]"}
   ```
5. **Update local file** — save to `email-templates/` with new version number in filename
6. **Update this MD file** — update Section 5 table, update Section 6 file list
7. **Push to GitHub:**
   ```
   git add email-templates/
   git commit -m "feat: SEQ-1-E1-A v4 skinned · design team update"
   git push origin main
   ```
8. **Mark old version as archived** in Section 5 table

### When adding a new email to the sequence

1. Follow Section 4 step-by-step
2. Add row to Section 5
3. Update Section 6 with new Drive + Klaviyo IDs
4. Push to GitHub

### When a Klaviyo template ID changes

1. Update Section 5 Klaviyo ID column
2. Update the HTML metadata block at the bottom of the file
3. Call `patch_seq_meta` GAS action to update EmailSequences tab
4. Commit the HTML file change

---

## SECTION 8 — LOCKED RULES (do not override)

These rules are locked in BrandDoctrine and enforced in every `getMasterSystemPrompt()` call:

**EMAIL_LP_RELATIONSHIP_001 (hard · locked)**
- LP = macro narrative (full movie)
- Email = micro emotional proof (single scene)
- Emails must never repeat the LP
- Each email isolates ONE moment, ONE realization, ONE friction point
- The emotional spine is shared. The scene is always different.

**MASTER_STORY_001 (hard · locked)**
- "The app that evolves with your life."
- "The problem was never you. The system was disconnected."
- "Your life changes. Your kitchen should change with it."

**No em dashes anywhere in copy** — AI writing tell

**Stat numbers are locked approved claims** — never round, never paraphrase:
- `$1,336` average annual savings
- `69.5%` less food waste
- `800K+` products
- `10-21 days/year` time back

**Loss block quote is locked per variant** — "The problem was never you. The system was disconnected."

---

*Last updated: 2026-05-20 · @943 · EMAIL_LP_RELATIONSHIP_001 locked*
