# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DGL easyChef Pro Ops Center** — an internal operations dashboard for Digital Galactica Labs tracking the easyChef Pro product launch (target: July 1, 2026). It consolidates RACI workflow, 10-week launch roadmap, team responsibilities, budget and burn rate, and spend logging in a single browser-based interface.

## Tech Stack

- Single HTML file: `index.html` — vanilla JavaScript, inline CSS, no frameworks, no build step, no npm
- Supporting source data (read-only reference, not loaded by the app):
  - `EasyChefPro_RACI.xlsx` — RACI tracker
  - `easyChef-Pro-Launch-Roadmap.xlsx` — 10-week roadmap
  - `easyChefPro_GTM_ProjectTracker.xlsx` — Adam's GTM tracker

## Running the Dashboard

Open `index.html` directly in a browser, or access the live GitHub Pages URL. No server, no install, no build step required.

## Architecture

All dashboard data lives in the `DASHBOARD_DATA` JavaScript object at the top of the `<script>` section in `index.html`. This is the single source of truth for everything rendered on screen.

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
