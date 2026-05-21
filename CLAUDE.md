# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ORIENTATION PROTOCOL — run every session start, in this order

Do not touch any code until all four steps are confirmed complete.

**Step 1 — System health check**
```
{"action":"system_health_check","campaign_id":"EC-2026-001"}
```
Report: deploy number, RED systems, blocked count, LP spine state, brief docs count, GPT4O_ACTIVE.

**Step 2 — Read the permanent Roadmap doc**
Read ROADMAP_DOC_ID from health check response. Open that doc. Read the SESSION LOG section (last 10 lines). This tells you what was last worked on and what broke.

Permanent Roadmap doc ID: `1PK1VOmMghvYw6CbhHvDmv0MSE58fBeIPN28Knhi0J6M`
Never create a new Roadmap doc. Always update this one.

**Step 3 — Confirm state**
Report back:
- Current deploy version
- RED systems (if any)
- What was last worked on (from SESSION LOG)
- LP spine status
- Any open blockers

**Step 4 — Get explicit go-ahead before touching code**

---

## AFTER EVERY DEPLOY

1. Run `{"action":"system_health_check"}` — confirm no new RED systems introduced
2. Append a session log line:
   ```
   {"action":"append_session_log","line":"@NNN Mon DD — what changed. Campaign state. What's next."}
   ```
3. Update the `Current state:` line at the bottom of this file
4. Report any RED systems before closing the task

---

## MAY 27 CHECKLIST — Go-Live Day

Run in order:

1. **Wire BETA flow steps in Klaviyo UI** (Tr87zQ) — templates Sb62kA/TXvTR5/TkuRes/WijzCM, delays 0/1/2/7 days
2. **Wire QST-E2 step in Klaviyo UI** (SpiMfa) — template XLArLB, delay 0
3. **Wire QST Invitation flow step in Klaviyo UI** (TygRLv) — Step 1: DELAY 14 days · Step 2: EMAIL template VyNxs4
4. **Update 14 campaign audiences in Klaviyo UI** — A→UQTdyL+excl XJYckK, B→VpgZPZ+excl XJYckK
5. **Set from_label via Klaviyo UI** — Alpha-E4 (SGjjnq) + OB-E5 (UTEuxT) → "Taylor from easyChef Pro"
6. **Run `klaviyo_set_live`** — sets all 7 flows to live (reads klaviyo_flow_id_a/b/alpha/ob/org/beta/qst from CcSettings):
   ```
   {"action":"klaviyo_set_live"}
   ```
   Reads 8 flow IDs from CcSettings: klaviyo_flow_id_a/b/alpha/ob/org/beta/qst/qst_invite (TygRLv)
7. **Run `klaviyo_get_flow_statuses`** — verify all flows show `status: live`
8. **Run e2e test** — submit a fresh test signup and confirm Flow A E1 triggers within 5 min
9. **QST-E1 broadcast** — confirm campaign is scheduled for **May 28** 9am EDT (not May 20 — rescheduled @875). Template VyNxs4 · audience TebDTM · excl XJYckK

---

## DOMAIN ARCHITECTURE — LOCKED

| Domain | Purpose | Permanent? |
|---|---|---|
| `ops.dgl.dev` | Cockpit only — internal ops tool, never public | Yes — permanent |
| `launch.easychefpro.com` | All pre-launch pages — stays live permanently as-is | Yes — permanent |
| `easychefpro.com` | All NEW pages from July 1 onward — post-launch LPs, feature pages, pricing, blog, recipe pages | Yes — permanent |

**LP BUILD RULE:**
- **Before July 1** → build on `launch.easychefpro.com`
- **After July 1** → build on `easychefpro.com`

No migration. No redirects. Clean split at July 1. `launch.easychefpro.com` stays live permanently as the pre-launch historical record.

**LPInventory `domain` column:** all existing LPs = `launch.easychefpro.com` · all future LPs from July 1 = `easychefpro.com`

---

## HOSTING ARCHITECTURE — TWO PLATFORMS

| Platform | Hosts | Notes |
|---|---|---|
| **Firebase** | All static pages + OAuth callbacks | `launch.easychefpro.com`, `easychefpro.com`, `ops.dgl.dev` — deploy via `firebase deploy` from `firebase-deploy/` |
| **Digital Ocean** | App backend + API + iOS/Android backend | Dev team owned — dynamic server-side logic, not ops center concern |
| **Google Apps Script** | All automation, data reads/writes, campaign logic | Deployed via `clasp push` + `clasp deploy` — two deployment IDs always |

**Rule:** Firebase = marketing + ops pages. Digital Ocean = app runtime. GAS = campaign automation. They coexist and serve different things — no conflict.

---

## JULY 1 CHECKLIST — Launch Day

Run in order after confirmed launch:

1. **Add all TebDTM waitlist members to EC OB Launch Day list (Tgv7Jc)** — this triggers the OB Standard flow
   - Option A: Export TebDTM → import to Tgv7Jc in Klaviyo UI
   - Option B: Build a GAS action `klaviyo_migrate_list` to copy TebDTM→Tgv7Jc programmatically
2. **Verify OB flow (TNSTZr)** — confirm OB-E1 sends to migrated members
3. **Check stage gates** — confirm Stage 1 metrics are tracking
4. **Start building new LPs on `easychefpro.com`** — from this point all new pages go to the main domain, not `launch`

---

## NEVER DO THESE THINGS

- **Create a new Roadmap doc** — update the permanent one (`1-lfrnWtbKzRBbozXxffR4-DJ-6uD3uqkfWQqSDiSYFI`)
- **Hardcode any value that exists in the sheet** — read it from CcSettings
- **Fix one thing without checking what it might break** — run system_health_check after every deploy
- **Deploy without running system_health_check after** — always verify
- **Use `getActiveSpreadsheet()`** — always use `_getCampaignSpreadsheet()`
- **Run `clear_campaign_data_tabs`** without `confirm_clear:true` in the payload
- **Generate copy without LP spine existing first** — getMasterSystemPrompt returns `LP_SPINE_MISSING:<id>` as a hard gate
- **Build any LP without first running `read_icp_workup_folder`** — run `{"action":"read_icp_workup_folder"}` before any LP generation to confirm ICP app features are loaded from the workup docs in folder `1OFyrFVwAjDawfZfWHYErsuwDCct-TT93`
- **Create new GAS functions that duplicate existing ones** — search first
- **Use PowerShell here-strings for JavaScript content** — write to .txt files, use Python for splicing
- **Update `update_cc_setting` for a key that doesn't exist** — use `append_setting` for new keys
- **Use `Content-Type: application/json` in browser fetch calls to GAS** — always use `Content-Type: text/plain` to avoid CORS preflight (GAS doesn't handle OPTIONS). Applies to `gasCall()` in cockpit.html and all OAuth callback pages. This is a permanent rule.
- **Propose Firebase rewrites to proxy to external URLs** — Firebase Hosting rewrites only support Cloud Functions/Run destinations, not arbitrary external URLs. The CORS fix is always `text/plain`, not a proxy.
- **Build new LPs on `launch.easychefpro.com` after July 1** — before July 1 use launch subdomain; after July 1 use `easychefpro.com`. Check the current date before choosing the LP domain.
- **Hardcode `launch.easychefpro.com` in DL_IDs or UTM URLs created after July 1** — use `easychefpro.com` for all new deep links from July 1 onward.
- **Use wrong default filter syntax in Klaviyo templates** — Klaviyo uses a hybrid: Liquid colon syntax BUT requires 2 arguments (like Jinja2). CORRECT: `{{ person.first_name | default: 'there', true }}` · WRONG (Jinja2): `{{person.first_name|default('there', true)}}` · WRONG (standard Liquid, 1-arg): `{{ person.first_name | default: 'there' }}`. Always include `, true` as the second argument. Numeric: `{{ person.meals_cooked | default: 0, true }}`. Applies to ALL personalization in Alpha, OB, and any flow templates. Missing the `, true` causes "requires 2 arguments, but 1 was given" error.

---

## MASTER STORY — LOCKED (MASTER_STORY_001)

Approved May 20 2026 by Taylor. Stored in BrandDoctrine as MASTER_STORY_001 + SO_WHAT_ARCH_001 (enforcement: hard, locked: true).
Injected into every `getMasterSystemPrompt()` call via `_compileMasterStoryBlock()` + `_compileSoWhatArchBlock()`.

**Category position:** "The app that evolves with your life."

**Master story lines (exact wording — never paraphrase):**
- "The app that evolves with your life."
- "The problem was never you. The system was disconnected."
- "Your life changes. Your kitchen should change with it."

**Critical positioning:** "Most food apps assume the same person forever. easyChef Pro is the system your kitchen was always missing."

**SO WHAT Architecture — locked emotional sequence:**
Every campaign builds toward two moments:
1. "Oh. THAT'S why this keeps happening."
2. "easyChef Pro is the first thing actually built to solve that."

Emotional flow: Recognition → Realization → Emotional consequence → So what → easyChef Pro closes the gap → Life feels lighter

Rules:
- The observation is ICP-specific. The door changes per theme.
- The realization is always the same: disconnected systems.
- The resolution is always the same: easyChef Pro closes those gaps.
- easyChef Pro = emotional resolution layer. Not the app. Not the feature set. Not the meal planner.
- **The theme changes the door. The story is always the same.**

---

## APPROVED WEBSITE HERO COPY — LOCKED (HERO_COPY_001)

Approved May 19 2026 by Taylor. Stored in BrandDoctrine as HERO_COPY_001 (enforcement: hard, locked: true).

```
Line 1: "Your life changes. Your kitchen should change with it."   ← TAGLINE_003
Line 2: "The problem was never you. The system was disconnected."  ← TAGLINE_002
Line 3: "easyChef Pro is the system your kitchen was always missing."
```

- Universal — no ICP restriction. easychefpro.com homepage only.
- 3-second draw. No "command" language. Full app scope (not dinner-specific).
- Dev team (Sabri/Moeez) to implement on website homepage.
- `_compileBrandDoctrineBlock()` in `Operations_AssetBuilder.gs` injects this (and all active doctrine rules) into every `getMasterSystemPrompt()` call.

---

## EMAIL vs LP RELATIONSHIP — LOCKED (EMAIL_LP_RELATIONSHIP_001)

Approved May 20 2026 by Taylor. Stored in BrandDoctrine as EMAIL_LP_RELATIONSHIP_001 (enforcement: hard, locked: true).
Injected into every `getMasterSystemPrompt()` call for `type === 'email'` or `type === 'email_full'`.

```
LP = macro narrative (full movie)
Email = micro emotional proof (single scene)

RULE: Emails must never repeat the LP.
Each email isolates ONE moment, ONE realization, ONE friction point.

The emotional spine is shared.
The scene is always different.

LP says the complete argument.
Emails say "here's another moment where you already felt this."
```

**System prompt injection (email type):**
> "This email is a SINGLE SCENE inside the master story. Do not retell the LP. Isolate one observed moment from the ICP's life that produces the SO WHAT realization. The reader should feel: 'This brand understands my life.' Not: 'I already read this.'"

**Good scene examples for SEQ-1:**
- E1: Groceries Sunday → DoorDash Wednesday
- E2: The cilantro at the back of the fridge
- E3: Same three meals every week

Each is a different door into the same realization: "Nothing connected. easyChef Pro closes the gap."

**Email structure (short — 4-5 paragraphs):**
1. Open in the middle of the moment. Specific. Sensory. Name the time, the object, the feeling.
2. The recognition — this is not a one-time thing. The system was always disconnected.
3. One sentence only — easyChef Pro closes that gap. No features. No list.
4. CTA paragraph — outcome-framed, low friction.

**Wired into:** `sG` block in `getMasterSystemPrompt()` for `case 'email_full'` + `case 'email'` in `Operations_AssetBuilder.gs`

---

## COPY MODEL

Copy generation uses **Claude** (`claude-sonnet-4-20250514`), not GPT-4o.
- `GPT4O_ACTIVE = false` in CcSettings
- Social posts → `.agents/skills/copywriting` + `.agents/skills/ad-creative` prepended to system prompt
- Email → `.agents/skills/email-sequence` + `.agents/skills/copywriting` prepended
- LP → `.agents/skills/page-cro` + `.agents/skills/copywriting`
- Skills are baked into `_getSkillBlock()` in `Operations_AssetBuilder.gs` at deploy time
- **All active BrandDoctrine rules injected into every prompt** via `_compileBrandDoctrineBlock()` — wired after `_voiceRules` in `_buildMasterPrompt()`. Gap closed @940: MONEY_MESSAGE_PLACEMENT_001 + MASTER_UNDERTONE_001 + HERO_COPY_001 now reach Claude during every generation.

---

## CAMPAIGN CENTER SHEET

Sheet ID: `1zX8sc-YoKXMNmEOJi8YEpGcmOFbh1sA7xSa2evb_VZE`
Branch: always `main`
Deployment ID: `AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg`

The Campaign Center Sheet is the source of truth for all governance rules — not memory, not old docs.

**LP first. Always.** The landing page spine is the source of truth for every social post, email, and video in a campaign. No asset generation before `generate_lp_spine` succeeds. getMasterSystemPrompt returns `LP_SPINE_MISSING:<campaign_id>` if the spine is absent — that is a hard gate, not a warning.

**Playbook first. Always.** Before generating any content, read the Campaign Creation Playbook. Doc ID via `_getCcSetting('PLAYBOOK_DOC_ID')`. The playbook is the source of truth for master story, So What architecture, claim scoping, and phone rules.

---

## DEPLOYMENT

```
clasp push
clasp version "description"
clasp deploy --deploymentId AKfycbxgwJT_MZigRzZ7sYuULrnxMB1ITfU_2TUCfpSfqJJDbgme1rTsWjf7RaiHQFQOJuOPbQ --versionNumber NNN --description "description"
clasp deploy --deploymentId AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg --versionNumber NNN --description "description"
```

**ALWAYS deploy to BOTH deployment IDs** — both serve live traffic.
- `AKfycbxgwJT_...` — ops deployment (CLAUDE.md primary)
- `AKfycbz1MwFg8...` — live endpoint (what `ops-dashboard.html` CONFIG.sheetsUrl calls, what MCP server calls)

Or: `.\deploy.ps1 -Deploy`

After deploy: run system_health_check, append session log, update Current state below.

---

## MARKETING SKILLS

Skills in `.agents/skills/`. Full library at `.agents/marketingskills/` (git submodule: `coreyhaines31/marketingskills`).

Active skills:
- `page-cro` — landing page conversion optimization
- `copywriting` — marketing copy
- `email-sequence` — drip campaigns and lifecycle email flows
- `ab-test-setup` — A/B test design
- `analytics-tracking` — analytics setup and audit
- `ad-creative` — ad headlines, descriptions, primary text

All skills read `.agents/product-marketing-context.md` first. Populate that file before invoking any skill.

---

## UI/UX DESIGN SKILL

Submodule: `.agents/ui-ux-pro-max-skill/` (git submodule: `nextlevelbuilder/ui-ux-pro-max-skill` v2.5.0)

**What it provides:**
- 67 UI styles (Glassmorphism, Soft UI Evolution, Minimalism, Brutalism, Claymorphism, and more)
- 161 color palettes aligned to product types
- 57 font pairings with Google Fonts imports
- 99 UX guidelines (Do/Don't, severity, platform, code examples)
- 25 chart types for dashboards
- 161 industry-specific design reasoning rules
- Python search engine: `python3 .agents/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "<query>" --design-system`

**Wired into:** `generateDesignForAsset()` in `Operations_Docs.gs` via `_getSkillBlock('design')` in `Operations_AssetBuilder.gs`.

**Skill block active for:** `contentType === 'design'` — prepended to system prompt before brand tokens and brief content.

**For easyChef Pro:** style = Soft UI Evolution · anti-patterns = neon/AI gradients/dark mode/clutter · canvas safe zone ≥80px · WCAG AA contrast enforced.

**Full branding reference:** [`BRANDING.md`](BRANDING.md) — CSS token layer, typography, status colors, generated asset rules, cockpit redesign session log. Read this before any UI or design work.

---

## CONFIRMED LAUNCH TIMELINE

| Date | Event | System action |
|---|---|---|
| **May 20** | Hand email campaigns to JR for review | Emails live in Klaviyo — grant JR account access in Klaviyo UI (Settings → Users) |
| **May 27** | Pre-launch goes live · waitlist opens · social launches · SEQ-1/2 flows start | Run `{"action":"klaviyo_set_live"}` · complete May 27 checklist below |
| **May 28** | Questionnaire goes live · broadcast to all TebDTM | QST-E1 broadcast (VyNxs4) auto-fires at 9am EDT — campaign ID in CcSettings |
| **Jun 3** | Questionnaire closes · Taylor reviews responses | Manual — open AlphaApplications tab, review rows, tag `alpha_selected=true` on chosen profiles |
| **Jun 8** | Alpha users get app access · Alpha flow triggers | Tag chosen profiles → add to UPRemk (EC Alpha Users) → Alpha flow fires automatically |
| **Jun 22** | Alpha feedback emails fire | Automatic — Alpha-E5 is Day 14 from app access (Jun 8 + 14 = Jun 22) |
| **Jun 29** | Beta invites go out | Manually add Beta users to SfHgFY (EC Beta Users) → BETA flow triggers |
| **Jul 1** | Public launch · founding member pricing activates · alpha → advanced features | Add all TebDTM to Tgv7Jc (EC OB Launch Day) → OB flow fires; see July 1 checklist |

---

## PROJECT OVERVIEW

**DGL easyChef Pro Ops Center** — internal operations dashboard for Digital Galactica Labs tracking the easyChef Pro product launch (target: July 1, 2026).

**Tech stack:** GAS backend (clasp), single `cockpit.html` frontend (vanilla JS, inline CSS, no frameworks), Node.js MCP server (`cockpit-mcp-server.js`) for conversational Claude access.

**Key GAS files:**
- `Operation.gs` — action router (all POST body.action routes)
- `Operations_AssetBuilder.gs` — `getMasterSystemPrompt`, `_callCopyModel`, `_getSkillBlock`, `_buildBriefStoryCtx`
- `Operations_SequenceBuilder.gs` — `buildSocialCalendar`, `buildEmailSequence`
- `Operations_EC2026001_Seed.gs` — EC-2026-001 seeder, `_computeBlockedReason`
- `Operations_CampaignSheets.gs` — `_CC_HDR`, `_CC_TAB`, all sheet read/write helpers
- `Operations_Milestones.gs` — `seedCampaignMilestones`, `getCampaignMilestones`, `addCampaignMilestone`
- `Operations_MasterBrief.gs` — `generateMasterPositioning()` — calls `claude-sonnet-4-20250514`, max_tokens 1500

---

## GOVERNANCE LAYER — @800 (built May 16 2026)

Three new tabs in Campaign Center Sheet. Run setup functions once after adding new campaigns.

### MasterPositioning tab (34 columns)
- `_setupMasterPositioning()` — creates tab with gold-on-dark headers, font size 9
- `getMasterPositioning(positioning_id)` — fetch by ID
- `getMasterPositioningByCampaign(campaign_id)` — fetch all for campaign
- `saveMasterPositioning(positioning)` — upsert by positioning_id
- `lockMasterPositioning(positioning_id)` — sets status=APPROVED, locked=TRUE
- `generateMasterPositioning(params)` in `Operations_MasterBrief.gs` — calls Claude, returns full object
- **Positioning ID format:** `MP-{campaign_id}-{timestamp}`
- **Hard gates in system prompt:** WHO SHE IS must be a specific moment · MASTER STORY locked · FEELING SOLD = after-state · 7-emotion arc · stage_5 must reference retention milestones

### StageGates tab (30 columns)
- `_setupStageGates()` — creates tab
- `seedStageGates(campaign_id, positioning_id)` — seeds 5 rows, idempotent
- **Gate ID format:** `SG-{campaign_id}-{stage_number}`
- **Stage thresholds:** Stage 1: open_rate≥45% + reach≥25K · Stage 2: ctr≥15% + lp_visitors≥3K · Stage 3: returning≥20% · Stage 4: waitlist_completed · Stage 5: first_strike≥45% + tipping_point≥60% + paid_conversion≥40%
- **POST handler:** `seed_stage_gates` · `advance_stage_gate`

### RetentionMilestones tab (19 columns)
- `_setupRetentionMilestones()` — creates tab + seeds 4 rows
- RM-001 Three-Ingredient Start (Day 0, target 80%) · RM-002 First Strike (Day 7, target 45%) · RM-003 Tipping Point (Day 30, target 60%, AND logic) · RM-004 Paid Conversion (within 7d of TP, target 40%)
- Tipping Point conditions: `meals_cooked>=3 AND spoilage_saves>=1 AND pantry_items>=20` — all three required

### AssetLineage fields
- **SocialPosts** gained 13 new columns: `positioning_id, positioning_version, stage_number, persona, emotion, generated_by, optimised_by, rendered_by, brief_version, figma_owner, deploy_url, approved_by, approved_at`
- **EmailSequences** gained 12 new columns: `positioning_id, positioning_version, stage_number, variant, world, generated_by, approved_by_ml, approved_at, klaviyo_flow_id, sent_at, open_rate_actual, ctr_actual`
- Run `repairSheetHeaders(['SocialPosts','EmailSequences'])` if columns are missing on existing tabs

### Step 0 in Campaign Wizard
- Step 0 "Position" now appears before Step 1 "Theme" in the wizard bar
- `_mpCurrentPositioning` — global holding the active positioning object
- `_mpGenerate()` → `master_positioning_generate` → populates all form fields
- `_mpLock()` → checks ML Approved checkbox → calls `master_positioning_lock` → calls `seed_stage_gates`
- `_ccExtendBriefWithTheme()` updated: MasterPositioning fields override ThemeLibrary when `_mpCurrentPositioning` is set
- `_buildBriefStoryCtx()` updated: `mp.who_she_is`, `mp.feeling_sold`, `mp.proof_point`, `mp.master_story`, `mp.what_we_say`, `mp.core_truth` take precedence

### New POST actions (Operation.gs)
`setup_master_positioning` · `setup_stage_gates` · `setup_retention_milestones` · `repair_governance_headers` · `master_positioning_save` · `master_positioning_lock` · `master_positioning_generate` · `seed_stage_gates` · `advance_stage_gate` · `update_milestone_status`

### New GET actions (Operation.gs)
`master_positioning_read` (params: positioning_id OR campaign_id)

---

## MCP SERVER — `cockpit-mcp-server.js`

Node.js MCP server that wraps all cockpit endpoints so Claude can operate the campaign center conversationally — no UI clicking required.

**File:** `cockpit-mcp-server.js` (root of repo)
**Config:** `cockpit-mcp-server-config.json`
**Run:** `npm run cockpit-mcp` or `node cockpit-mcp-server.js`
**Protocol:** stdio (MCP standard)
**SDK:** `@modelcontextprotocol/sdk` v1.29+

**COCKPIT_URL** (env var or hardcoded default):
`https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec`

**20 registered tools:**

| Group | Tools |
|---|---|
| System | `cockpit_ping`, `get_icp_profiles`, `get_approved_claims` |
| Master Positioning | `get_master_positioning`, `generate_master_positioning`, `save_master_positioning`, `lock_master_positioning` |
| Theme Library | `get_themes` |
| Campaign | `run_kickstart`, `get_campaign` |
| Assets | `build_social_posts`, `build_email_sequence`, `generate_image` |
| Stage Gates | `get_stage_gates`, `advance_stage_gate`, `seed_stage_gates` |
| UTM + Tracking | `generate_utms`, `activate_dl_id`, `get_campaign_metrics` |
| Retention | `get_retention_milestones`, `update_milestone_status` |
| Calendar | `build_campaign_calendar`, `export_calendar_csv` |

**To connect to Claude Code** — add to `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "easychef-cockpit": {
      "command": "node",
      "args": ["/Users/taylor/easyChef-Pro-Ops-Center/cockpit-mcp-server.js"]
    }
  }
}
```

**`node_modules/` is excluded from clasp push** via `.claspignore` — never remove that entry.

---

## EDIT RULES

- **Surgical edits only** — never rewrite sections not part of the requested change
- **Never restructure `DASHBOARD_DATA`** without explicit instruction
- **Always describe the planned change before making it**
- Commit message format: `feat: description` or `fix: description`
- GAS edits with JS content: write to .txt files, use Python for string splicing (PowerShell can't hold JS in here-strings)
- **Klaviyo verified sender: `hello@easychefpro.com`** — all campaigns/flows use this FROM address
- **Template assignment for campaigns**: use `POST /api/campaign-message-assign-template/` with `data.type=campaign-message`, `data.id=MSG_ID`, `data.relationships.template` — NOT PATCH relationships (blocked in 2025-04-15)
- **Flow-message from_label**: `PATCH /api/flow-messages/{id}/` is read-only (405) in all revisions — update via Klaviyo UI only

---

## SYSTEM IDs MASTER REFERENCE

### FLOW ROUTING — CONFIRMED (May 21 2026)

LP-A signup → GAS adds to TebDTM + UQTdyL (icp_code=super_mom_money)
LP-B signup → GAS adds to TebDTM + VpgZPZ (icp_code=super_mom_time)

TebDTM = master waitlist (both flows trigger from here)
Flow A (XfqUtU) has flow filter: member of UQTdyL → routes money-angle signups
Flow B (XCyc4m) has flow filter: member of VpgZPZ → routes time-angle signups

List membership IS the routing logic. GAS sets it at signup via icp_code.

### EMAIL SEQUENCE ARCHITECTURE — CONFIRMED (May 21 2026)

Cold traffic → LP-A or LP-B → signup → founder
SEQ-1 (Flow steps 1-3) → fires Day 0 — welcome, reinforce decision
SEQ-2 (Flow steps 4-8) → Days 8-28 — deeper nurture
SEQ-3 (campaigns Jun 10/15/20/25) → urgency before launch
SEQ-4 (campaigns Jul 2/3/5) → app is live, drive downloads

**TWO EMAIL FIXES REQUIRED (confirmed May 21):**
1. SEQ-1-E1 (A+B) — standalone templates UxsJ3U + RmZJyL — CTA is wrong
   - Current CTA: "Claim my founding spot" — WRONG (they already signed up)
   - Required: welcome-only email. "You're in. Your spot is locked. Here's what happens next."
   - No CTA button. Or a soft "check your inbox" / "bookmark this" style link only.
2. SEQ-4 (A+B, 6 campaigns) — standalone templates RAevtk/Y4hJxf/W6BkjY/SXw7eR/Wp7mz3/RsauRg
   - Current CTA: LP waitlist link — WRONG (app is live by this point)
   - Required: app download CTA (App Store / Google Play links)
   - App store URLs to be confirmed — get from dev team before July 1

Everything else: SEQ-1 E2+E3, SEQ-2, SEQ-3 — LP CTAs correct per wireframe.

### Klaviyo Flows
| Flow | ID | Sequence | Trigger | Filter | Steps |
|---|---|---|---|---|---|
| Flow A — Prelaunch | XfqUtU | SEQ-1+2 | List TebDTM | Member of UQTdyL | 8 |
| Flow B — Prelaunch | XCyc4m | SEQ-1+2 | List TebDTM | Member of VpgZPZ | 8 |
| Alpha | QYwGdj | ALPHA | List UPRemk | — | 6 |
| OB Standard | TNSTZr | OB | List Tgv7Jc (EC OB Launch Day) | — | 5 |
| Organic Welcome | VnfgA4 | ORG | List TpXCkr (EC Organic Welcome) | — | 3 |
| BETA Onboarding | Tr87zQ | BETA | List SfHgFY (EC Beta Users) | — | 4 (steps need UI wiring) |
| QST Confirm | SpiMfa | QST | List WBbASK (EC QST Submitted) | — | 1 (step needs UI wiring) |
| QST Invitation | TygRLv | — | List TebDTM (Day 14 from signup) | — | 1 step needs UI wiring: 14-day delay + VyNxs4 |

### Klaviyo Lists
| List | ID | Purpose |
|---|---|---|
| Prelaunch Emails | TebDTM | Master waitlist — triggers Flow A + B (filter routes to correct flow) |
| EC Variant A (Money) | UQTdyL | LP-A signups — Flow A filter target + SEQ-3/4 campaign audience |
| EC Variant B (Time) | VpgZPZ | LP-B signups — Flow B filter target + SEQ-3/4 campaign audience |
| EC Alpha Users | UPRemk | Alpha — triggers Alpha flow |
| EC Organic Welcome | TpXCkr | /coming-soon signups — triggers ORG flow |
| EC OB Launch Day | Tgv7Jc | Launch day — triggers OB Standard flow |
| EC Beta Users | SfHgFY | Beta testers — triggers BETA flow |
| EC QST Submitted | WBbASK | Questionnaire submitted — triggers QST flow (add on form submit) |

### Klaviyo Segments
| Segment | ID | Purpose |
|---|---|---|
| Already a Founder (suppression) | XJYckK | Exclude from campaigns |
| Variant A (super_mom_money) | read from CcSettings `klaviyo_segment_id_a` | SEQ-3/4 campaign audiences |
| Variant B (super_mom_time) | read from CcSettings `klaviyo_segment_id_b` | SEQ-3/4 campaign audiences |

### 14 Scheduled Campaigns (SEQ-3 + SEQ-4)
| ID | Key | Send Date |
|---|---|---|
| 01KS5CQYJM77G51YP0B8MN8QP2 | SEQ-3-E1-A | Jun 10 2026 9am EDT |
| 01KS5CRR6DCNCRKJH0TWCM1G76 | SEQ-3-E1-B | Jun 10 2026 9am EDT |
| 01KS5CSP5V2JG4D7DSFJJHC6PS | SEQ-3-E2-A | Jun 15 2026 9am EDT |
| 01KS5CTK4QXH40W7TYYVYCJMEH | SEQ-3-E2-B | Jun 15 2026 9am EDT |
| 01KS5CVFR4WB7EY17R8FQJ8XWM | SEQ-3-E3-A | Jun 20 2026 9am EDT |
| 01KS5CWD93C0JZWBZMKCGRH85H | SEQ-3-E3-B | Jun 20 2026 9am EDT |
| 01KS5CXAN6DK48S3C55D8WMN69 | SEQ-3-E4-A | Jun 25 2026 9am EDT |
| 01KS5CYC9HZPZ7Q798ZCMBZBA1 | SEQ-3-E4-B | Jun 25 2026 9am EDT |
| 01KS5CZD7H4AFHPZKYJZJFPHFS | SEQ-4-E1-A | Jul 2 2026 9am EDT |
| 01KS5D1DPKJKFC888SQY4XPP7M | SEQ-4-E1-B | Jul 2 2026 9am EDT |
| 01KS5D29C5M3YHZ28NMY8A4ABQ | SEQ-4-E2-A | Jul 3 2026 9am EDT |
| 01KS5D3AHARPX22MYD8GNDWEMT | SEQ-4-E2-B | Jul 3 2026 9am EDT |
| 01KS5D48M50THGYCBEGY27VDH4 | SEQ-4-E3-A | Jul 5 2026 9am EDT |
| 01KS5D54A4NPJKRPCNHMKC0AZZ | SEQ-4-E3-B | Jul 5 2026 9am EDT |

### GAS Endpoints
| Name | Deployment ID |
|---|---|
| Ops (primary) | `AKfycbxgwJT_MZigRzZ7sYuULrnxMB1ITfU_2TUCfpSfqJJDbgme1rTsWjf7RaiHQFQOJuOPbQ` |
| Live / MCP (primary traffic) | `AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg` |

### URLs
| Property | URL | Notes |
|---|---|---|
| **Cockpit** | **https://launch.easychefpro.com/cockpit** | Internal only — permanent · ops.dgl.dev/cockpit parked (DNS fix post-launch) |
| LP-A (waitlist — money angle) | https://launch.easychefpro.com/lp/waitlist-a.html | Pre-launch · stays here permanently |
| LP-B (waitlist — time angle) | https://launch.easychefpro.com/lp/waitlist-b.html | Pre-launch · stays here permanently |
| Coming Soon | https://launch.easychefpro.com/coming-soon | Pre-launch · stays here permanently |
| Alpha Feedback | https://launch.easychefpro.com/alpha-feedback | Pre-launch · stays here permanently |
| Alpha Questionnaire | https://launch.easychefpro.com/alpha-questionnaire · DL-QST-001 | Pre-launch · stays here permanently |
| Thank You | https://launch.easychefpro.com/thank-you | Pre-launch · stays here permanently |
| ops.dgl.dev | https://ops.dgl.dev (→ launch.easychefpro.com via Firebase) | Permanent ops domain |
| **All future LPs (post Jul 1)** | **https://easychefpro.com/lp/[slug]** | Build here from July 1 onward |

### Analytics & Testing
| Tool | ID |
|---|---|
| GA4 | G-Q4DYEEXFKV |
| Microsoft Clarity | wjxhprug80 |
| Convert.com Experiment | 100140422 |

### Flow Email IDs (Open Items)
| Email | flow-message ID | Open Item |
|---|---|---|
| Alpha-E4 | SGjjnq | from_label → "Taylor from easyChef Pro" (Klaviyo UI) |
| OB-E5 | UTEuxT | from_label → "Taylor from easyChef Pro" (Klaviyo UI) |

---

## CONVERT.COM API — LIVE ✅

API working @934. GET experience 200 confirmed.
- **Base URL:** `https://api.convert.com/api/v2/`
- **Account ID:** `10019256` · **Project ID:** `10019672` · **Experience ID:** `100140422`
- **Auth headers:** `Convert-Application-ID` + `Expires` (integer timestamp) + `Authorization: Convert-HMAC-SHA256 Signature=...`
- **Signing:** `ApplicationID\nExpiresTimestamp\nFullURL\nBody` — HMAC-SHA256, key = secret as UTF-8 string
- **Script Properties:** `convert_application_id` = d0f222d0-... · `convert_secret_key` = cb0ac7e0...
- **GAS actions:** `convert_setup` · `convert_get_experience` · `convert_activate_experience` · `convert_create_goal`
- **Experience state:** status=active · primary_goal=100154109 (attached) · GA4 G-Q4DYEEXFKV ✅ · Clarity ✅ · 2 variations (1001218068/1001218069) · Bayesian 95% threshold
- **syncConvertToSheet** — daily trigger reads ExperimentRegistry, writes to ExperimentMetrics tab

---

## ALPHA PROGRAM — CONFIRMED OFFER

**Audience:** Existing founders from TebDTM waitlist (warm traffic only — NOT cold)
**Gate:** QST-E1 broadcast (May 28) → click → /lp/alpha → fill questionnaire → Taylor selects 50
**Selection window:** Jun 3–7 · App access begins Jun 8

**Alpha offer (locked — Taylor confirmed May 21 2026):**
- Complete questionnaire + Taylor selects = ALPHA status
- Year 1 completely FREE
- Then $7.99/month FOREVER (never changes)
- Compare: standard founding members pay $7.99/month from day 1 — alpha is better

**LP:** `launch.easychefpro.com/lp/alpha` — 3 sections, warm tone, no cold traffic copy
- Section 1: "We want you in the first 50." — invite framing
- Section 2: What alpha means (bullets) + red callout box showing offer vs standard founding price
- Section 3: CTA "Apply in 3 minutes →" → alpha-questionnaire with UTM
- GA4 event: `alpha_application_started` on CTA click
- noindex/nofollow (not public-facing)

**Alpha flow emails (QYwGdj — fires when added to UPRemk):**
- ALPHA-E1 (UM8eaZ): Day 0 — welcome + confirm free year offer
- ALPHA-E3 (XEjGdW): confirm $7.99/month locked forever

**Flow path:** cold → LP-A/B → founder (TebDTM) → QST-E1 (May 28) → /lp/alpha → questionnaire → selected → UPRemk → Alpha flow
**Not selected:** stays on SEQ-3 urgency → SEQ-4 launch → OB Standard Jul 1

---

## POST-LAUNCH TOOLS

### MASTER TEMPLATE SWAP — BUILT @971

```
Action: swap_email_template_design
```

Replaces the design wrapper in all 36 Klaviyo standalone templates in one command. Copy blocks (subject, preview, body, CTA) never change — only the HTML design shell swaps.

**Placeholder markers (design team must include these exactly):**
```
<!-- SUBJECT -->
<!-- PREVIEW -->
<!-- BODY_COPY -->
<!-- CTA_LINK -->
```

**When design delivers final HTML:**
```json
{"action":"swap_email_template_design","drive_file_id":"[new template Drive ID]"}
```
All 36 templates update in ~2 minutes.

**Tell design team:** Upload the new HTML template to Google Drive and share the file ID. The system reads the file, extracts the shell, and injects the existing copy blocks into the placeholder markers on every template.

---

Current state: @978 · ALPHA PROGRAM COMPLETE: /lp/alpha built (warm founder LP · Year 1 FREE · $7.99/month forever · CTA→alpha-questionnaire) · ALPHA OFFER LOCKED in CLAUDE.md · SEQ-3 TEMPLATES RESTORED: 8 campaign templates were deleted in cleanup (not in safelist) — 8 new templates created from local v2 HTML + assigned to campaign messages (R587yF/TxbhSE/YfqTCX/UZFq3V/WijKu4/Y9mTbq/XyX6KE/Tj5gXy) · SEQ-3 CTA FIX: "Claim my founding spot" → "Lock in $7.99 before July 1" + "Free to join" → "Founding price. $7.99/month. Locks forever July 1." — all 8 @946 Klaviyo templates + 8 local files · SEQ-1-E1 (UxsJ3U + RmZJyL): button removed, replaced with "Your spot is locked. / easyChef Pro launches July 1. We'll be in touch." — pushed to Klaviyo · TEMPLATE CLEANUP: 170 orphaned templates deleted (first run code=200 = success, second run 404 confirms) · GAS @978 deployed both IDs (fix: delete template 200||204 success check) · XJYckK SEGMENT UI FIX NEEDED: currently founder_status=waitlist (4 members) — needs change to TebDTM membership · ALPHA-E1 + ALPHA-E3 email offer update PENDING · Alpha offer flow: cold→LP-A/B→founder→QST-E1(May 28)→/lp/alpha→questionnaire→Taylor selects→UPRemk→Alpha flow · OPEN UI TASKS BEFORE MAY 27: (1) XJYckK segment → TebDTM membership (2) Wire 22 flow step templates (3) Wire BETA/QST-E2/QST Invite (4) from_label x2 (5) klaviyo_set_live · ALPHA LIQUID FIX FINAL: all 6 Alpha templates (UM8eaZ/Tx68VK/XEjGdW/Uxet8P/QRKrLt/VC23Fh) — Klaviyo default filter is hybrid: Liquid colon syntax + 2 args required: {{ person.X | default: 'value', true }} — 32 occurrences fixed locally + pushed to Klaviyo — CLAUDE.md NEVER DO rule corrected — no deploy needed · deploy @973 · GAS @973 deployed both IDs · SEQ-3 SUBJECT LINES UPDATED: 8 campaigns deleted+recreated with correct subjects (Klaviyo cancel→Cancelled state, not Draft — delete+recreate is the only API path). New campaign IDs: E1-A 01KS5DN3WPCT8KERXEST245PDJ · E1-B 01KS5DNE0BMEX0S61AMYJSKQDC · E2-A 01KS5DNPMT92T7Z2GQB93YN7EW · E2-B 01KS5DNZMK2J3DGG74EWGA76FR · E3-A 01KS5DP7N3PE6D0C157DYG7AKM · E3-B 01KS5DPGAPWZ5W6E7B6VPB54BK · E4-A 01KS5DPRAHKEEA5WZHAQCDHTD7 · E4-B 01KS5DQ0PNQ8TV1SZG62BFV364. All SCHEDULED, audiences UQTdyL/VpgZPZ+excl XJYckK preserved. klaviyo_update_scheduled_subjects GAS action added (Operations_KlaviyoFlows.gs). · deploy @970 · GAS @970 deployed both IDs · 14 SEQ-3/4 CAMPAIGNS RECREATED: all old cancelled campaigns deleted + 14 new campaigns created (Scheduled) with correct subjects/send dates/templates — new IDs in SYSTEM IDS table above · new GAS actions added: klaviyo_delete_campaign + klaviyo_create_campaign + klaviyo_get_campaign_messages (klaviyo_update_campaign_subject now supports preview_text+from_email+from_label) · OPEN UI TASKS BEFORE MAY 27: (1) Wire 22 flow step templates in Klaviyo UI (Flow A/B/Alpha — see wiring table in session log) (2) Wire BETA (Tr87zQ) + QST-E2 (SpiMfa) + QST Invite (TygRLv) (3) Update 14 campaign audiences to UQTdyL(A)/VpgZPZ(B)+excl XJYckK in Klaviyo UI (4) Set from_label Alpha-E4 + OB-E5 (5) Run klaviyo_set_live · deploy @952 · GAS @952 deployed both IDs · FONT FIX COMPLETE: all 36 email templates (SEQ-1–4 + Alpha) — Google Fonts <link> removed + system font stacks (Georgia/'Times New Roman'/serif · Arial/Helvetica/sans-serif) — local HTML + 36 Klaviyo standalone templates updated · KLAVIYO MCP CONFIGURED: settings.json mcpServers.klaviyo = https://mcp.klaviyo.com/mcp — restart Claude Code to activate · FLOW STEP API CONFIRMED BLOCKED: all PATCH/POST/PUT on flow-message relationships + direct template PATCH return 405/404 — API investigation complete @949/@950/@951, all 3 GAS actions added to Operation.gs · OPEN UI TASKS BEFORE MAY 27: (1) Wire 22 flow step templates in Klaviyo UI — Flow A (XfqUtU) 8 steps: Step1→UxsJ3U · Step2→WqLmGD · Step3→TqUD9M · Step4→Y9aeU6 · Step5→UiqGQW · Step6→TyKpJq · Step7→RbUHNb · Step8→WeFkW4 · Flow B (XCyc4m) 8 steps: Step1→RmZJyL · Step2→VxRy3Q · Step3→W8RAvW · Step4→YvrLDj · Step5→WpkBAu · Step6→SFQA5B · Step7→YcmK9j · Step8→UPnK22 · Alpha (QYwGdj) 6 steps: Step1→UM8eaZ · Step2→Tx68VK · Step3→XEjGdW · Step4→Uxet8P · Step5→QRKrLt · Step6→VC23Fh (2) Wire BETA (Tr87zQ) · QST-E2 (SpiMfa) · QST Invite (TygRLv) (3) Update 14 campaign audiences in Klaviyo UI (4) Set from_label Alpha-E4 + OB-E5 (5) Run klaviyo_set_live · deploy @948 · ALPHA FLOW COMPLETE: 6 Alpha emails written to EmailSequences tab (status=APPROVED approved_by=Taylor) + Klaviyo standalone templates updated (E1 UM8eaZ · E2 Tx68VK · E3 XEjGdW · E4 Uxet8P · E5 QRKrLt · E6 VC23Fh) + 6 HTML files in email-templates/ (ALPHA-E1-6_v1.html) + Liquid personalization (meals_cooked/pantry_items/spoilage_saves/tasks_completed/weekly_savings/alpha_number) · klaviyo_list_templates action added (paginated cursor-based) · FLOW STEP TEMPLATE INVESTIGATION CONCLUDED: Klaviyo locks flow-assigned templates from PATCH (404) — flow step templates CANNOT be updated via API — must use Klaviyo UI → each flow step → Edit email → Change template · CORRECTED STEP ORDER: Flow A+B = SEQ-1 emails steps 1-3 then SEQ-2 emails steps 4-8 (NOT interleaved) · UI WIRING TABLE CONFIRMED — Flow A (XfqUtU): Step1 WCpRRh→UxsJ3U · Step2 VZnPeE→WqLmGD · Step3 TzVT7y→TqUD9M · Step4 UKkHZq→Y9aeU6 · Step5 SjTMSi→UiqGQW · Step6 XHbspK→TyKpJq · Step7 X6apM8→RbUHNb · Step8 UEHtE2→WeFkW4 · Flow B (XCyc4m): Step1 QZeshE→RmZJyL · Step2 Wnw6P7→VxRy3Q · Step3 Tk485n→W8RAvW · Step4 UvsWXe→YvrLDj · Step5 Y6iHYc→WpkBAu · Step6 TSrUkB→SFQA5B · Step7 RsYYdv→YcmK9j · Step8 QPXVAS→UPnK22 · Alpha Flow (QYwGdj) 6 steps→UM8eaZ/Tx68VK/XEjGdW/Uxet8P/QRKrLt/VC23Fh · Git commit d0bd00b pushed · OPEN UI TASKS BEFORE MAY 27: Wire 16 Flow A+B step templates in Klaviyo UI (table above) · Wire Alpha Flow 6 steps · Wire BETA (Tr87zQ)/QST-E2 (SpiMfa)/QST Invite (TygRLv) · Update 14 campaign audiences · Set from_label · deploy @946 · EMAIL GOVERNANCE REWRITE COMPLETE: all 30 SEQ-1 to SEQ-4 emails rewritten from scratch against 5 locked rules · EMAIL_LP_RELATIONSHIP_001 (single scene, not LP retell) + MASTER_STORY_001 (exact "The problem was never you. The system was disconnected.") + SO_WHAT_ARCH_001 (Recognition→Realization→Resolution) + MONEY_MESSAGE_PLACEMENT_001 (B variants money-free in subject/preview/hook) + anti-patterns (no AI/meal planning/in command) · 30 EmailSequences rows status=APPROVED approved_by=Taylor · 30 Klaviyo standalone templates updated v2 · SEQ-1 (6 emails · Flow A+B) + SEQ-2 (10 emails · Flow A+B) + SEQ-3 (8 emails · campaigns Jun 10/15/20/25 · CTA→launch.easychefpro.com) + SEQ-4 (6 emails · campaigns Jul 2/3/5 · CTA→easychefpro.com) · Template IDs: SEQ-1 UxsJ3U/RmZJyL/WqLmGD/VxRy3Q/TqUD9M/W8RAvW · SEQ-2 Y9aeU6/YvrLDj/UiqGQW/WpkBAu/TyKpJq/SFQA5B/RbUHNb/YcmK9j/WeFkW4/UPnK22 · SEQ-3 UzuXXQ/Tacn3N/TsGpgR/RuZZ5A/XSrXN7/SShAR7/VERNyE/YnNKUP · SEQ-4 RAevtk/Y4hJxf/W6BkjY/SXw7eR/Wp7mz3/RsauRg · GAS @946 deployed both IDs · Firebase staging+prod deployed · OPEN: wire standalone templates to Klaviyo flow steps in UI (SEQ-1 E1-A UxsJ3U→Flow A XfqUtU step 1 · SEQ-1 E1-B RmZJyL→Flow B XCyc4m step 1 · etc for all 16 flow emails) · cockpit View All Assets panel still pending · deploy @943 · EMAIL_LP_RELATIONSHIP_001 LOCKED: email sG rule in getMasterSystemPrompt() updated (single scene, not LP retell) · BrandDoctrine row EMAIL_LP_RELATIONSHIP_001 written (hard/locked) · SEQ-1-E1-A v3 + SEQ-2-E1-B v2 rebuilt as scene emails (E1-A: Sunday groceries→DoorDash Wednesday · E1-B: Sunday plan→Wednesday 6:30 wall) · CLAUDE.md EMAIL vs LP RELATIONSHIP section added · deploy @942 · MASTER STORY LOCKED: _MASTER_STORY + _CATEGORY_POSITIONING replaced, _SO_WHAT_ARCH constant + _compileSoWhatArchBlock() added + wired into getMasterSystemPrompt() · 3 BrandDoctrine rows written: MASTER_STORY_001 (category position + 3 story lines + critical positioning) · CATEGORY_POSITION_001 (category claim + contrast + positioning + enemy) · SO_WHAT_ARCH_001 (2 campaign moments + emotional flow + 5 rules) · CLAUDE.md MASTER STORY section added · _compileBrandDoctrineBlock() HANDLED list updated (MASTER_STORY_001 + CATEGORY_POSITION_001 + SO_WHAT_ARCH_001 skip double-compilation) · deploy @941 site files — index.astro/coming-soon.astro/about-us.astro updated in Drive · deploy @940 · _compileBrandDoctrineBlock() LIVE: ALL active BrandDoctrine rules injected into every getMasterSystemPrompt() call — gap closed (MONEY_MESSAGE_PLACEMENT_001 + MASTER_UNDERTONE_001 + HERO_COPY_001 now reach Claude during generation) · HERO_COPY_001 LOCKED in BrandDoctrine: L1 "Your life changes. Your kitchen should change with it." (TAGLINE_003) / L2 "The problem was never you. The system was disconnected." (TAGLINE_002) / L3 "easyChef Pro is the system your kitchen was always missing." — universal, no ICP restriction, homepage only · LP-B full rewrite done (firebase deploy PENDING) · website MasterPositioning MP-WEBSITE-001 saved (DRAFT) · dev team notification PENDING (need Sabri/Moeez emails) · deploy @939 · ICPProfiles super_mom_time UPDATED @939: loss_aversion (locked line), message_hierarchy (4-point: dinner/identity/$1336 proof/$7.99 CTA), channel_affinity (TikTok→FB→IG→community), primary_pain (5-10hrs/wk = 10-21 days/year), secondary_pain (Paprika+AnyList fragmentation), conversion_triggers (TikTok fridge scene) · AC-013 APPENDED: time hook stat 5-10hrs/week = 260-520hrs/yr = 10-21 days · BrandDoctrine MONEY_MESSAGE_PLACEMENT_001 APPENDED: $1,336 proof only — never hook for super_mom_time · Bidirectional calendar sync LIVE: moveAsset routes by asset type (_detectAssetType) → social updates SocialPosts.scheduled_date · email (SEQ-3/4) deletes old Klaviyo campaign + recreates with new date via _moveEmailCampaignDate · email_flow returns requires_manual (flow delays are UI-only) · LP sets lp_notified · Move confirm dialog shows downstream scope · Toast shows Klaviyo reschedule result · LP/Questionnaire/Event chip colors added (green/amber) · sheet `1zX8sc-YoKXMNmEOJi8YEpGcmOFbh1sA7xSa2evb_VZE` · branch `main` · MCP server live (20 tools) · Governance layer complete · Master Positioning LOCKED (MP-EC-2026-001-1779066831282) · 5 stage gates seeded · 264 DL_IDs CLEAN (incl DL-QST-001 alpha questionnaire) · Full email system: 8 flows · 5 LIVE (Flow A/B/Alpha/OB/ORG) · 3 DRAFT pending UI step wiring (BETA Tr87zQ, QST SpiMfa, QST Invite TygRLv) · 15 campaigns SCHEDULED ✅ CLEAN · 14 SEQ-3/4 ALL SCHEDULED ✅ (SEQ-3: Jun 11/16/21/26 · SEQ-4: Jul 2/3/5 · 9am EDT · UQTdyL(A)/VpgZPZ(B) audiences + excl XJYckK · templates assigned) + QST-E1 broadcast (May 28 9am EDT) · UTM tracking: must be set manually in Klaviyo UI (API fully blocked — utm_params + add_utm both 400 in 2025-04-15) · Variant lists seeded: test@digitalgalactica.dev + admin@digitalgalactica.dev in UQTdyL + VpgZPZ (3 members each) — prevents auto-cancel · klaviyoRescheduleSeq34Campaigns fixed @931: clean PATCH (no channel_options) + explicit send-job — production-ready · ContentCalendar + Klaviyo + CLAUDE.md all aligned · klaviyoRescheduleQstBroadcast fixed @903: delete-draft+recreate+subject(from EmailSequences)+send-job(data.id format per 2025-04-15) · LP scripts fixed: Convert→Clarity→GA4 order on all 3 pages (LP-A/B + thank-you) · Firebase: BOTH projects deployed (staging + prod) · Convert.com API PARKED (see section above) — experiment 100140422 Active confirmed in UI · PERMANENT CORS FIX: all gasCall() + OAuth callback pages use Content-Type: text/plain — bypasses CORS preflight, works on any domain · CF Worker fix @889: /oauth/ added to Firebase proxy routes (was blocking OAuth callbacks) · Cockpit permanent URL: https://launch.easychefpro.com/cockpit (ops.dgl.dev/cockpit parked — DNS fix post-launch) · Social posting pipeline LIVE @887: Operations_SocialSync.gs (FB/IG/TikTok/Pinterest/YT/X) + Socials cockpit tab + OAuth flows for YT + TikTok · YouTube OAuth: CONNECTED ✅ — refresh_token stored, channel UChFpPCiD1Zn47sk3pe0CF0A · TikTok OAuth: CONNECTED ✅ (sandbox) — open_id -0000eDgY90YrMFdHJ3ttf5AtclcABc1yRp- · TikTok production swap: when TikTok app review approves, run tiktok_setup with tiktok_prod_client_key (aw6d3tg79eo4k057) + tiktok_prod_client_secret stored in Script Properties · May 27 manual posting doc created: https://docs.google.com/document/d/1RL7XtneqBtNK-oUCb3W50U1hQTunRi-BmaK3AUpgFJI/edit · Meta review in progress (~10 days from May 19) · klaviyo_rewire_audiences PARKED: Klaviyo API (2025-04-15) blocks all cancel/send-job routes on Scheduled campaigns — audiences must be updated manually in Klaviyo UI (see Open UI tasks) · OPEN UI tasks: (1) Wire BETA flow steps in Klaviyo UI (Tr87zQ) templates Sb62kA/TXvTR5/TkuRes/WijzCM (2) Wire QST-E2 step (SpiMfa) template XLArLB (3) Wire QST Invite flow (TygRLv) 14-day delay + VyNxs4 (4) Update 14 campaign audiences to UQTdyL(A)/VpgZPZ(B)+excl XJYckK in Klaviyo UI — MUST be done before May 27 (5) Alpha-E4 (SGjjnq) + OB-E5 (UTEuxT) from_label → "Taylor from easyChef Pro" (6) Verify Convert.com audience filter utm_medium=email + goal 100154109 in dashboard manually · Pinterest OAuth: CONNECTED ✅ — board: easyChef Pro Recipes (1130403643910185807) · X OAuth: CONNECTED ✅ — refresh_token stored · FB/IG OAuth: BUILT @920 — fb_auth_start/facebook_auth_callback/facebook_connection_status/facebook_setup routes live · /oauth/facebook/callback.html deployed · fb_app_id (1338517714794542) + fb_app_secret stored in Script Properties ✅ · Redirect URIs to add in FB app: https://launch.easychefpro.com/oauth/facebook/callback + https://easychefpro.com/oauth/facebook/callback · waiting for Meta API review approval (~May 29) to go live · TikTok production swap: run tiktok_setup with prod keys after review approves · Convert.com API ✅ LIVE @934 — experiment 100140422 active · goal 100154109 attached · GA4+Clarity connected · syncConvertToSheet ready for daily trigger
