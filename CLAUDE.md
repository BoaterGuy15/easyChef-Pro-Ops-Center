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
Deployment ID: `AKfycbxgwJT_MZigRzZ7sYuULrnxMB1ITfU_2TUCfpSfqJJDbgme1rTsWjf7RaiHQFQOJuOPbQ`

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

---

Current state: deploy @800 · sheet `1zX8sc-YoKXMNmEOJi8YEpGcmOFbh1sA7xSa2evb_VZE` · branch `main` · MCP server live (20 tools) · Governance layer complete (MasterPositioning + StageGates + RetentionMilestones + Step 0 UI)
