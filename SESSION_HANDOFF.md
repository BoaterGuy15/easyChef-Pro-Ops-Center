# Session Handoff — May 20 2026

## What Was Done This Session

### Email Governance Rewrite — All 30 Emails

All 30 SEQ-1 through SEQ-4 emails were rewritten from scratch against the 5 locked governance rules. Old copy was written before MASTER_STORY_001 / SO_WHAT_ARCH_001 / EMAIL_LP_RELATIONSHIP_001 were locked and failed all rules.

**Rules enforced:**
1. `EMAIL_LP_RELATIONSHIP_001` — each email = single observed scene (not LP mirror / multi-paragraph argument)
2. `SO_WHAT_ARCH_001` — Recognition → Realization → Resolution arc
3. `MASTER_STORY_001` — exact wording: "The problem was never you. The system was disconnected."
4. `MONEY_MESSAGE_PLACEMENT_001` — $1,336 / money stats never in subject/preview/hook for B variants (super_mom_time)
5. Anti-patterns — no "meal planning", no "AI", no "Your kitchen, in command", no feature-demo language

**Taylor approved each sequence before writing:**
- SEQ-1 approved, written → session 1
- SEQ-2 approved, written → session 1  
- SEQ-3 approved, written → this session
- SEQ-4 approved, written → this session

---

## Current State

- **GAS deploy:** @946 — both IDs deployed
- **EmailSequences tab:** 30 rows — status=APPROVED, approved_by=Taylor, built_in_klaviyo=True, seq_template_id populated
- **Klaviyo standalone templates:** 30 updated (v2)
- **HTML files:** 30 in `email-templates/` folder (all `_v2.html`)
- **Firebase:** staging + prod deployed
- **Git:** pushed to main (commit 37d8212 + subsequent)

---

## Standalone Template IDs (wire these to Klaviyo flow steps)

These are STANDALONE templates — NOT flow-step templates. Each must be manually wired to the correct flow step in Klaviyo UI to replace the placeholder templates.

### SEQ-1 → Flow A (XfqUtU) + Flow B (XCyc4m)
| Email | Template ID | Flow | Step |
|---|---|---|---|
| SEQ-1-E1-A | UxsJ3U | Flow A (XfqUtU) | Step 1 |
| SEQ-1-E1-B | RmZJyL | Flow B (XCyc4m) | Step 1 |
| SEQ-1-E2-A | WqLmGD | Flow A (XfqUtU) | Step 3 |
| SEQ-1-E2-B | VxRy3Q | Flow B (XCyc4m) | Step 3 |
| SEQ-1-E3-A | TqUD9M | Flow A (XfqUtU) | Step 5 |
| SEQ-1-E3-B | W8RAvW | Flow B (XCyc4m) | Step 5 |

### SEQ-2 → Flow A (XfqUtU) + Flow B (XCyc4m)
| Email | Template ID | Flow | Step |
|---|---|---|---|
| SEQ-2-E1-A | Y9aeU6 | Flow A (XfqUtU) | Step 2 |
| SEQ-2-E1-B | YvrLDj | Flow B (XCyc4m) | Step 2 |
| SEQ-2-E2-A | UiqGQW | Flow A (XfqUtU) | Step 4 |
| SEQ-2-E2-B | WpkBAu | Flow B (XCyc4m) | Step 4 |
| SEQ-2-E3-A | TyKpJq | Flow A (XfqUtU) | Step 6 |
| SEQ-2-E3-B | SFQA5B | Flow B (XCyc4m) | Step 6 |
| SEQ-2-E4-A | RbUHNb | Flow A (XfqUtU) | Step 7 |
| SEQ-2-E4-B | YcmK9j | Flow B (XCyc4m) | Step 7 |
| SEQ-2-E5-A | WeFkW4 | Flow A (XfqUtU) | Step 8 |
| SEQ-2-E5-B | UPnK22 | Flow B (XCyc4m) | Step 8 |

### SEQ-3 → Klaviyo Campaigns (Jun 10/15/20/25)
| Email | Template ID | Campaign | Audience |
|---|---|---|---|
| SEQ-3-E1-A | UzuXXQ | 01KRYG1BMA0TDGCGFP9FXW4A9A | UQTdyL (Variant A) |
| SEQ-3-E1-B | Tacn3N | 01KRYEYMTM24KAH1MD46F0B134 | VpgZPZ (Variant B) |
| SEQ-3-E2-A | TsGpgR | 01KRYEYQV2FWE26165ZTM8919T | UQTdyL |
| SEQ-3-E2-B | RuZZ5A | 01KRYEYTSADV8XWKCGG6F1QPFA | VpgZPZ |
| SEQ-3-E3-A | XSrXN7 | 01KRYEYXZ6TDV30WFES05FZBSS | UQTdyL |
| SEQ-3-E3-B | SShAR7 | 01KRYEZ1EXY7VFFJCTFRTY7524 | VpgZPZ |
| SEQ-3-E4-A | VERNyE | 01KRYEZ4RXCFVWBN091FGSCYHY | UQTdyL |
| SEQ-3-E4-B | YnNKUP | 01KRYEZ7B1PCTRQH47P2AHB7CZ | VpgZPZ |

### SEQ-4 → Klaviyo Campaigns (Jul 2/3/5 — post-launch)
| Email | Template ID | Campaign | Audience |
|---|---|---|---|
| SEQ-4-E1-A | RAevtk | 01KRYEZA34YDQ9KMQ46TY0YYP7 | UQTdyL |
| SEQ-4-E1-B | Y4hJxf | 01KRYEZCFJZDYD01MBSNJX0TJQ | VpgZPZ |
| SEQ-4-E2-A | W6BkjY | 01KRYEZH56R1JQEH3XFAPCE5V0 | UQTdyL |
| SEQ-4-E2-B | SXw7eR | 01KRYEZKWF0MEJSTDC597BJMFE | VpgZPZ |
| SEQ-4-E3-A | Wp7mz3 | 01KRYEZQ1P9NTJCP5AAM3H6K0H | UQTdyL |
| SEQ-4-E3-B | RsauRg | 01KRYEZSV982T3G1NED6V9KS8M | VpgZPZ |

---

## Open Tasks (Next Session)

### Must-do before May 27 launch
1. **Wire standalone templates to Klaviyo flow steps** — 16 flow emails (SEQ-1/2) need templates swapped in Klaviyo UI. Go to Flow A (XfqUtU) and Flow B (XCyc4m), edit each step, replace template with the standalone ID from the table above.
2. **Wire SEQ-3/4 templates to campaigns** — 14 campaign template assignments. Each campaign needs its template updated to the v2 standalone ID.
3. **Complete May 27 checklist** in CLAUDE.md (wire BETA/QST flows, update 14 campaign audiences, set from_label).

### Post-launch build
4. **View All Assets panel** — add to cockpit.html, shows all 30 emails with subject/template ID/status
5. **Drive upload** — push all v2 HTML files to Drive folder `1OUu2k1Iv-6nk1APO3sF3qm217YV3sGJf`
6. **EMAIL_TEMPLATE_MASTER.md** — full version table of all 30 templates with IDs, scenes, send dates

---

## Audit Note

The `tmp_audit_copy.py` script has known false positives:
- **R3 "AI"**: substring match catches "again", "fails", "available" etc. — NOT real violations
- **R2 SO_WHAT** for SEQ-1/2: recognition line is in HTML between p2 and solve, not in `body_agitate` sheet field — audit reads sheet only
- **R4 "cost"** for B variants: catches the word "costs" in "what the kitchen costs you" — NOT a money stat
- **R1-SCENE** for time patterns: "6:30 PM." not recognized as scene opener — false positive

Human review score: all 30 emails pass. 1 real violation (SEQ-4-E3-A "meal plan" in p1) was fixed.

---

## Git State

Branch: `main`  
Last commit: `feat: all 30 emails rewritten - all governance rules pass - @latest`  
Pushed: yes
