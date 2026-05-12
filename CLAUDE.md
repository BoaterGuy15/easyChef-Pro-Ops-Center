# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session Start Protocol

Before writing or changing any code:

1. Read the AIReference tab in the Campaign Center Sheet
   Sheet ID: `1zX8sc-YoKXMNmEOJi8YEpGcmOFbh1sA7xSa2evb_VZE`

2. Open the Master Reference doc linked in AIReference
   Current: https://docs.google.com/document/d/1kIq1_bkWD4TJlSidPspqF2wc_EXFO0YHqb2BNiOiFZI/edit

3. Confirm before touching code:
   - Current deploy version
   - Sheet ID
   - GitHub branch (always `main`)
   - Governance state (all 7 blocks wired to sheet as of 2026-05-11)
   - LP spine state — CampaignBriefs.lp_campaign_spine_json must be populated before any asset generation

4. Treat the Campaign Center Sheet as source of truth for all governance rules — not memory, not old docs.

5. If AIReference points to a newer Master Reference doc, load that one instead. The tab is always current.

6. **LP first. Always.** The landing page spine is the source of truth for every social post, email, and video in a campaign. No asset generation before `generate_lp_spine` succeeds. No asset can advance past draft without `validate_asset_lp_alignment` passing. getMasterSystemPrompt returns `LP_SPINE_MISSING:<campaign_id>` if the spine is absent — that is a hard gate, not a warning.

7. **Playbook first. Always.** Before generating any content (social, email, video, LP copy), read the Campaign Creation Playbook. Doc ID: `1i34M_7FDJ6qy7SMjfWfFMPs3rTKL_AogoCM3egX1a_I`. Retrieve via `_getCcSetting('PLAYBOOK_DOC_ID')` — the label column holds the doc ID. The playbook is the source of truth for master story, So What architecture, claim scoping, and phone rules. Do not generate without it.

8. Do not write code until orientation is confirmed.

Current state: deploy @572 · sheet `1zX8sc-YoKXMNmEOJi8YEpGcmOFbh1sA7xSa2evb_VZE` · branch `main`

## Project Overview

**DGL easyChef Pro Ops Center** — an internal operations dashboard for Digital Galactica Labs tracking the easyChef Pro product launch (target: July 1, 2026). It consolidates RACI workflow, 10-week launch roadmap, team responsibilities, budget and burn rate, and spend logging in a single browser-based interface.

## Tech Stack

- Single HTML file: `ops-dashboard.html` — vanilla JavaScript, inline CSS, no frameworks, no build step, no npm
- Public marketing site root: `index.html` — the coming soon / waitlist page served at easychefpro.com
- Supporting source data (read-only reference, not loaded by the app):
  - `EasyChefPro_RACI.xlsx` — RACI tracker
  - `easyChef-Pro-Launch-Roadmap.xlsx` — 10-week roadmap
  - `easyChefPro_GTM_ProjectTracker.xlsx` — Adam's GTM tracker

## Running the Dashboard

Open `ops-dashboard.html` directly in a browser, or access the live ops.dgl.dev URL (staging branch → GitHub Pages). No server, no install, no build step required.

## Architecture

All dashboard data lives in the `DASHBOARD_DATA` JavaScript object at the top of the `<script>` section in `ops-dashboard.html`. This is the single source of truth for everything rendered on screen.

The UI is organized into eight nav tabs — do not rename or remove them:
1. **Agenda** — Monday meeting agenda (items + checkboxes), executive AI assessment, and meeting notes
2. **Command** — high-level status and KPIs
3. **RACI & Workflow** — task ownership matrix
4. **Roadmap** — 10-week launch timeline
5. **Budget & Burn** — budget tracking and burn rate
6. **Team** — team member responsibilities
7. **App Data** — PMF Kill Criteria tracking, beta metrics, and Google Sheets sync
8. **Comms** — Slack integration (channel selector, message feed, thread viewer, AI analysis, send message)

## Edit Rules

- **Surgical edits only** — never rewrite sections that are not part of the requested change
- **Never restructure `DASHBOARD_DATA`** without explicit instruction
- **Always describe the planned change before making it**
- Commit message format: `feat: description` or `fix: description`
