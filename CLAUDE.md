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
- **Create new GAS functions that duplicate existing ones** — search first
- **Use PowerShell here-strings for JavaScript content** — write to .txt files, use Python for splicing
- **Update `update_cc_setting` for a key that doesn't exist** — use `append_setting` for new keys
- **Use `Content-Type: application/json` in browser fetch calls to GAS** — always use `Content-Type: text/plain` to avoid CORS preflight (GAS doesn't handle OPTIONS). Applies to `gasCall()` in cockpit.html and all OAuth callback pages. This is a permanent rule.
- **Propose Firebase rewrites to proxy to external URLs** — Firebase Hosting rewrites only support Cloud Functions/Run destinations, not arbitrary external URLs. The CORS fix is always `text/plain`, not a proxy.
- **Build new LPs on `launch.easychefpro.com` after July 1** — before July 1 use launch subdomain; after July 1 use `easychefpro.com`. Check the current date before choosing the LP domain.
- **Hardcode `launch.easychefpro.com` in DL_IDs or UTM URLs created after July 1** — use `easychefpro.com` for all new deep links from July 1 onward.

---

## COPY MODEL

Copy generation uses **Claude** (`claude-sonnet-4-20250514`), not GPT-4o.
- `GPT4O_ACTIVE = false` in CcSettings
- Social posts → `.agents/skills/copywriting` + `.agents/skills/ad-creative` prepended to system prompt
- Email → `.agents/skills/email-sequence` + `.agents/skills/copywriting` prepended
- LP → `.agents/skills/page-cro` + `.agents/skills/copywriting`
- Skills are baked into `_getSkillBlock()` in `Operations_AssetBuilder.gs` at deploy time

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

### Klaviyo Flows
| Flow | ID | Sequence | Trigger | Steps |
|---|---|---|---|---|
| Flow A — Prelaunch | XfqUtU | SEQ-1 | List TebDTM | 8 |
| Flow B — Prelaunch | XCyc4m | SEQ-2 | List TebDTM | 8 |
| Alpha | QYwGdj | ALPHA | List UPRemk | 6 |
| OB Standard | TNSTZr | OB | List Tgv7Jc (EC OB Launch Day) | 5 |
| Organic Welcome | VnfgA4 | ORG | List TpXCkr (EC Organic Welcome) | 3 |
| BETA Onboarding | Tr87zQ | BETA | List SfHgFY (EC Beta Users) | 4 (steps need UI wiring) |
| QST Confirm | SpiMfa | QST | List WBbASK (EC QST Submitted) | 1 (step needs UI wiring) |
| QST Invitation | TygRLv | — | List TebDTM (Day 14 from signup) | 1 step needs UI wiring: 14-day delay + VyNxs4 |

### Klaviyo Lists
| List | ID | Purpose |
|---|---|---|
| Prelaunch Emails | TebDTM | Main waitlist — triggers Flow A + B |
| EC Alpha Users | UPRemk | Alpha — triggers Alpha flow |
| EC Organic Welcome | TpXCkr | /coming-soon signups — triggers ORG flow |
| EC OB Launch Day | Tgv7Jc | Launch day — triggers OB Standard flow |
| EC Beta Users | SfHgFY | Beta testers — triggers BETA flow |
| EC QST Submitted | WBbASK | Questionnaire submitted — triggers QST flow (add on form submit) |
| EC Variant A (Money) | UQTdyL | SEQ-3/4 audience — LP-A (super_mom_money) signups |
| EC Variant B (Time) | VpgZPZ | SEQ-3/4 audience — LP-B (super_mom_time) signups |

### Klaviyo Segments
| Segment | ID | Purpose |
|---|---|---|
| Already a Founder (suppression) | XJYckK | Exclude from campaigns |
| Variant A (super_mom_money) | read from CcSettings `klaviyo_segment_id_a` | SEQ-3/4 campaign audiences |
| Variant B (super_mom_time) | read from CcSettings `klaviyo_segment_id_b` | SEQ-3/4 campaign audiences |

### 14 Scheduled Campaigns (SEQ-3 + SEQ-4)
| ID | Key | Send Date |
|---|---|---|
| 01KRYG1BMA0TDGCGFP9FXW4A9A | SEQ-3-E1-A | Jun 10 2026 9am EDT |
| 01KRYEYMTM24KAH1MD46F0B134 | SEQ-3-E1-B | Jun 10 2026 9am EDT |
| 01KRYEYQV2FWE26165ZTM8919T | SEQ-3-E2-A | Jun 15 2026 9am EDT |
| 01KRYEYTSADV8XWKCGG6F1QPFA | SEQ-3-E2-B | Jun 15 2026 9am EDT |
| 01KRYEYXZ6TDV30WFES05FZBSS | SEQ-3-E3-A | Jun 20 2026 9am EDT |
| 01KRYEZ1EXY7VFFJCTFRTY7524 | SEQ-3-E3-B | Jun 20 2026 9am EDT |
| 01KRYEZ4RXCFVWBN091FGSCYHY | SEQ-3-E4-A | Jun 25 2026 9am EDT |
| 01KRYEZ7B1PCTRQH47P2AHB7CZ | SEQ-3-E4-B | Jun 25 2026 9am EDT |
| 01KRYEZA34YDQ9KMQ46TY0YYP7 | SEQ-4-E1-A | Jul 2 2026 9am EDT |
| 01KRYEZCFJZDYD01MBSNJX0TJQ | SEQ-4-E1-B | Jul 2 2026 9am EDT |
| 01KRYEZH56R1JQEH3XFAPCE5V0 | SEQ-4-E2-A | Jul 3 2026 9am EDT |
| 01KRYEZKWF0MEJSTDC597BJMFE | SEQ-4-E2-B | Jul 3 2026 9am EDT |
| 01KRYEZQ1P9NTJCP5AAM3H6K0H | SEQ-4-E3-A | Jul 5 2026 9am EDT |
| 01KRYEZSV982T3G1NED6V9KS8M | SEQ-4-E3-B | Jul 5 2026 9am EDT |

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

Current state: deploy @934 · sheet `1zX8sc-YoKXMNmEOJi8YEpGcmOFbh1sA7xSa2evb_VZE` · branch `main` · MCP server live (20 tools) · Governance layer complete · Master Positioning LOCKED (MP-EC-2026-001-1779066831282) · 5 stage gates seeded · 264 DL_IDs CLEAN (incl DL-QST-001 alpha questionnaire) · Full email system: 8 flows · 5 LIVE (Flow A/B/Alpha/OB/ORG) · 3 DRAFT pending UI step wiring (BETA Tr87zQ, QST SpiMfa, QST Invite TygRLv) · 15 campaigns SCHEDULED ✅ CLEAN · 14 SEQ-3/4 ALL SCHEDULED ✅ (SEQ-3: Jun 11/16/21/26 · SEQ-4: Jul 2/3/5 · 9am EDT · UQTdyL(A)/VpgZPZ(B) audiences + excl XJYckK · templates assigned) + QST-E1 broadcast (May 28 9am EDT) · UTM tracking: must be set manually in Klaviyo UI (API fully blocked — utm_params + add_utm both 400 in 2025-04-15) · Variant lists seeded: test@digitalgalactica.dev + admin@digitalgalactica.dev in UQTdyL + VpgZPZ (3 members each) — prevents auto-cancel · klaviyoRescheduleSeq34Campaigns fixed @931: clean PATCH (no channel_options) + explicit send-job — production-ready · ContentCalendar + Klaviyo + CLAUDE.md all aligned · klaviyoRescheduleQstBroadcast fixed @903: delete-draft+recreate+subject(from EmailSequences)+send-job(data.id format per 2025-04-15) · LP scripts fixed: Convert→Clarity→GA4 order on all 3 pages (LP-A/B + thank-you) · Firebase: BOTH projects deployed (staging + prod) · Convert.com API PARKED (see section above) — experiment 100140422 Active confirmed in UI · PERMANENT CORS FIX: all gasCall() + OAuth callback pages use Content-Type: text/plain — bypasses CORS preflight, works on any domain · CF Worker fix @889: /oauth/ added to Firebase proxy routes (was blocking OAuth callbacks) · Cockpit permanent URL: https://launch.easychefpro.com/cockpit (ops.dgl.dev/cockpit parked — DNS fix post-launch) · Social posting pipeline LIVE @887: Operations_SocialSync.gs (FB/IG/TikTok/Pinterest/YT/X) + Socials cockpit tab + OAuth flows for YT + TikTok · YouTube OAuth: CONNECTED ✅ — refresh_token stored, channel UChFpPCiD1Zn47sk3pe0CF0A · TikTok OAuth: CONNECTED ✅ (sandbox) — open_id -0000eDgY90YrMFdHJ3ttf5AtclcABc1yRp- · TikTok production swap: when TikTok app review approves, run tiktok_setup with tiktok_prod_client_key (aw6d3tg79eo4k057) + tiktok_prod_client_secret stored in Script Properties · May 27 manual posting doc created: https://docs.google.com/document/d/1RL7XtneqBtNK-oUCb3W50U1hQTunRi-BmaK3AUpgFJI/edit · Meta review in progress (~10 days from May 19) · klaviyo_rewire_audiences PARKED: Klaviyo API (2025-04-15) blocks all cancel/send-job routes on Scheduled campaigns — audiences must be updated manually in Klaviyo UI (see Open UI tasks) · OPEN UI tasks: (1) Wire BETA flow steps in Klaviyo UI (Tr87zQ) templates Sb62kA/TXvTR5/TkuRes/WijzCM (2) Wire QST-E2 step (SpiMfa) template XLArLB (3) Wire QST Invite flow (TygRLv) 14-day delay + VyNxs4 (4) Update 14 campaign audiences to UQTdyL(A)/VpgZPZ(B)+excl XJYckK in Klaviyo UI — MUST be done before May 27 (5) Alpha-E4 (SGjjnq) + OB-E5 (UTEuxT) from_label → "Taylor from easyChef Pro" (6) Verify Convert.com audience filter utm_medium=email + goal 100154109 in dashboard manually · Pinterest OAuth: CONNECTED ✅ — board: easyChef Pro Recipes (1130403643910185807) · X OAuth: CONNECTED ✅ — refresh_token stored · FB/IG OAuth: BUILT @920 — fb_auth_start/facebook_auth_callback/facebook_connection_status/facebook_setup routes live · /oauth/facebook/callback.html deployed · fb_app_id (1338517714794542) + fb_app_secret stored in Script Properties ✅ · Redirect URIs to add in FB app: https://launch.easychefpro.com/oauth/facebook/callback + https://easychefpro.com/oauth/facebook/callback · waiting for Meta API review approval (~May 29) to go live · TikTok production swap: run tiktok_setup with prod keys after review approves · Convert.com API ✅ LIVE @934 — experiment 100140422 active · goal 100154109 attached · GA4+Clarity connected · syncConvertToSheet ready for daily trigger
