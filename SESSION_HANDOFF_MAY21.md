# Session Handoff — May 21, 2026

## What was completed this session

### 14 SEQ-3/4 Campaigns — FULLY REBUILT

All 14 campaigns are back in Klaviyo, confirmed Scheduled via MCP.

| Campaign | New ID | Send Date | Subject |
|---|---|---|---|
| SEQ-3-E1-A | 01KS5CQYJM77G51YP0B8MN8QP2 | Jun 10 9am EDT | The $12 that keeps saving dinner |
| SEQ-3-E1-B | 01KS5CRR6DCNCRKJH0TWCM1G76 | Jun 10 9am EDT | It was 6:45 when the call finally ended. |
| SEQ-3-E2-A | 01KS5CSP5V2JG4D7DSFJJHC6PS | Jun 15 9am EDT | You bought $94 worth of groceries. And forgot the chicken. |
| SEQ-3-E2-B | 01KS5CTK4QXH40W7TYYVYCJMEH | Jun 15 9am EDT | By the time you figured it out, everyone had moved on. |
| SEQ-3-E3-A | 01KS5CVFR4WB7EY17R8FQJ8XWM | Jun 20 9am EDT | Four cans of chickpeas. Nothing for tonight. |
| SEQ-3-E3-B | 01KS5CWD93C0JZWBZMKCGRH85H | Jun 20 9am EDT | You were going to prep Sunday. You watched TV instead. |
| SEQ-3-E4-A | 01KS5CXAN6DK48S3C55D8WMN69 | Jun 25 9am EDT | You needed a few things. The receipt said $214. |
| SEQ-3-E4-B | 01KS5CYC9HZPZ7Q798ZCMBZBA1 | Jun 25 9am EDT | Wednesday again. Already calculating Thursday. |
| SEQ-4-E1-A | 01KS5CZD7H4AFHPZKYJZJFPHFS | Jul 2 9am EDT | The first week it actually held. |
| SEQ-4-E1-B | 01KS5D1DPKJKFC888SQY4XPP7M | Jul 2 9am EDT | Wednesday at 6. Different. |
| SEQ-4-E2-A | 01KS5D29C5M3YHZ28NMY8A4ABQ | Jul 3 9am EDT | You knew what was in the pantry. That was the difference. |
| SEQ-4-E2-B | 01KS5D3AHARPX22MYD8GNDWEMT | Jul 3 9am EDT | A whole week. You only decided dinner once. |
| SEQ-4-E3-A | 01KS5D48M50THGYCBEGY27VDH4 | Jul 5 9am EDT | The math. And the window closing. |
| SEQ-4-E3-B | 01KS5D54A4NPJKRPCNHMKC0AZZ | Jul 5 9am EDT | The hours. And the window closing. |

Each campaign has:
- v2 HTML template assigned (standalone template IDs unchanged)
- Correct subject + preview text + from: hello@easychefpro.com / "easyChef Pro"
- Audience A: UQTdyL included, XJYckK excluded
- Audience B: VpgZPZ included, XJYckK excluded

### New GAS Actions (@970)

- `klaviyo_delete_campaign` — DELETE a single campaign by ID
- `klaviyo_create_campaign` — POST new campaign with name/list/excl/schedule (returns campaign_id + msg_id)
- `klaviyo_get_campaign_messages` — GET campaign messages (returns first msg_id)
- `klaviyo_update_campaign_subject` — now also accepts preview_text, from_email, from_label

### Infrastructure

- GAS @970 deployed to both deployment IDs
- Firebase staging + production deployed
- Git committed and pushed (f7f3b55)
- CLAUDE.md SYSTEM IDS table updated with new campaign IDs
- Roadmap session log appended

---

## Open before May 27

These are all UI-only tasks (API blocked):

### 1. Wire flow step templates in Klaviyo UI (highest priority)

**Flow A (XfqUtU) — 8 steps:**
| Step | Current template | Assign to |
|---|---|---|
| Step 1 | WCpRRh | UxsJ3U |
| Step 2 | VZnPeE | WqLmGD |
| Step 3 | TzVT7y | TqUD9M |
| Step 4 | UKkHZq | Y9aeU6 |
| Step 5 | SjTMSi | UiqGQW |
| Step 6 | XHbspK | TyKpJq |
| Step 7 | X6apM8 | RbUHNb |
| Step 8 | UEHtE2 | WeFkW4 |

**Flow B (XCyc4m) — 8 steps:**
| Step | Current template | Assign to |
|---|---|---|
| Step 1 | QZeshE | RmZJyL |
| Step 2 | Wnw6P7 | VxRy3Q |
| Step 3 | Tk485n | W8RAvW |
| Step 4 | UvsWXe | YvrLDj |
| Step 5 | Y6iHYc | WpkBAu |
| Step 6 | TSrUkB | SFQA5B |
| Step 7 | RsYYdv | YcmK9j |
| Step 8 | QPXVAS | UPnK22 |

**Alpha Flow (QYwGdj) — 6 steps:**
Steps 1-6 → UM8eaZ / Tx68VK / XEjGdW / Uxet8P / QRKrLt / VC23Fh

### 2. Wire BETA + QST flows
- BETA (Tr87zQ): templates Sb62kA / TXvTR5 / TkuRes / WijzCM, delays 0/1/2/7 days
- QST-E2 (SpiMfa): template XLArLB, delay 0
- QST Invite (TygRLv): Step 1 = 14-day delay, Step 2 = EMAIL template VyNxs4

### 3. Update 14 campaign audiences in Klaviyo UI
New campaigns were created with list IDs but Klaviyo UI may show them as "All subscribers". Confirm each campaign's audience shows:
- A variants: UQTdyL (EC Variant A) included, XJYckK (Already a Founder) excluded
- B variants: VpgZPZ (EC Variant B) included, XJYckK excluded

### 4. Set from_label
- Alpha-E4 (SGjjnq) → "Taylor from easyChef Pro"
- OB-E5 (UTEuxT) → "Taylor from easyChef Pro"
Both require Klaviyo UI — PATCH flow-messages is 405.

### 5. Run klaviyo_set_live
```
{"action":"klaviyo_set_live"}
```
Sets all 7 flows to live status. Run this last, after all UI wiring is done.

---

## Known Klaviyo API constraints (for reference)

- `PATCH campaign-send-jobs` with `status: 'cancelled'` returns 400 but DOES process — campaigns will enter Cancelled state. Use `DELETE campaign-send-jobs/{id}/` instead.
- Cancelled campaigns cannot be updated or rescheduled — must DELETE + recreate.
- Flow-assigned templates are read-only (404 on PATCH) — update via Klaviyo UI only.
- Campaign-message subject path: `attributes.definition.{channel: 'email', content: {subject: ...}}`
- `add_utm` is not a valid field in `tracking_options` (2025-04-15 API).
- `campaign-messages` must be included inside `attributes` (not as top-level `relationships`) when creating a campaign.
