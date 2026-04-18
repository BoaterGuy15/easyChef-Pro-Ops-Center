# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DGL easyChef Pro Ops Center** — an internal operations dashboard for Digital Galactica Labs tracking the easyChef Pro product launch (target: July 1, 2026). It consolidates RACI workflow, 10-week launch roadmap, team responsibilities, budget and burn rate, and spend logging in a single browser-based interface.

## Tech Stack

- Single HTML file: `DGL_OpsCenter.html` — vanilla JavaScript, inline CSS, no frameworks, no build step, no npm
- Supporting source data (read-only reference, not loaded by the app):
  - `EasyChefPro_RACI.xlsx` — RACI tracker
  - `easyChef-Pro-Launch-Roadmap.xlsx` — 10-week roadmap
  - `easyChefPro_GTM_ProjectTracker.xlsx` — Adam's GTM tracker

## Running the Dashboard

Open `DGL_OpsCenter.html` directly in a browser. No server, no install, no build step required.

## Architecture

All dashboard data lives in the `DASHBOARD_DATA` JavaScript object at the top of the `<script>` section in `DGL_OpsCenter.html`. This is the single source of truth for everything rendered on screen.

The UI is organized into five nav tabs — do not rename or remove them:
1. **Command** — high-level status and KPIs
2. **RACI & Workflow** — task ownership matrix
3. **Roadmap** — 10-week launch timeline
4. **Budget & Burn** — budget tracking and burn rate
5. **Team** — team member responsibilities

## Edit Rules

- **Surgical edits only** — never rewrite sections that are not part of the requested change
- **Never restructure `DASHBOARD_DATA`** without explicit instruction
- **Always describe the planned change before making it**
- Commit message format: `feat: description` or `fix: description`
