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
```

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

## PROJECT OVERVIEW

**DGL easyChef Pro Ops Center** — internal operations dashboard for Digital Galactica Labs tracking the easyChef Pro product launch (target: July 1, 2026).

**Tech stack:** GAS backend (clasp), single `cockpit.html` frontend (vanilla JS, inline CSS, no frameworks).

**Key GAS files:**
- `Operation.gs` — action router (all POST body.action routes)
- `Operations_AssetBuilder.gs` — `getMasterSystemPrompt`, `_callCopyModel`, `_getSkillBlock`
- `Operations_SequenceBuilder.gs` — `buildSocialCalendar`, `buildEmailSequence`
- `Operations_EC2026001_Seed.gs` — EC-2026-001 seeder, `_computeBlockedReason`
- `Operations_CampaignSheets.gs` — `_CC_HDR`, `_CC_TAB`, all sheet read/write helpers
- `Operations_Milestones.gs` — `seedCampaignMilestones`, `getCampaignMilestones`, `addCampaignMilestone`

---

## EDIT RULES

- **Surgical edits only** — never rewrite sections not part of the requested change
- **Never restructure `DASHBOARD_DATA`** without explicit instruction
- **Always describe the planned change before making it**
- Commit message format: `feat: description` or `fix: description`
- GAS edits with JS content: write to .txt files, use Python for string splicing (PowerShell can't hold JS in here-strings)

---

Current state: deploy @724 · sheet `1zX8sc-YoKXMNmEOJi8YEpGcmOFbh1sA7xSa2evb_VZE` · branch `main` · BRANDING.md updated · Session 2 light mode complete
