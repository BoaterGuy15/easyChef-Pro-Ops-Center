# easyChef Pro — Operations Brief

## Product
easyChef Pro is a family meal planning and grocery budgeting mobile app. It targets families spending $200–$400/month on groceries and uses AI to reduce that spend by 30–60% through Walmart-integrated meal planning.

**Launch target:** July 1, 2026  
**Founding price:** $7.99/month  
**Standard price:** $10/month  
**ROI framing:** $10/month → $111/month in savings (11:1 return)

---

## Team & Roles

| Person | Role | Dashboard key |
|--------|------|---------------|
| Taylor | Founder / decision-maker | YOU items require Taylor's approval |
| Steve | Operations lead | ops |
| Adam | Marketing lead, GTM strategy | adam |
| Mary | Content, email copy | mary |
| JR | Product, development | jr |
| Hammad | Technical development | hammad |
| Searah | Design | searah |
| Sadee | Support / operations | sadee |

---

## Key Dates

- **May 2026** — Beta recruitment, Zendesk setup, email sequences written
- **May 8, 2026** — Zendesk operational (hard deadline before beta)
- **June 17–30, 2026** — SEQ-3 Urgency email sequence active
- **June 30, 2026** — Launch Day email (SEQ-4) must be approved
- **July 1, 2026** — Full public launch

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| GitHub → Vercel (main) | easychefpro.com marketing site |
| GitHub → GitHub Pages (staging) | ops.dgl.dev internal dashboard |
| Klaviyo | Email platform, waitlist sequences SEQ-1 through SEQ-5 |
| Convert.com (10019256-10019672) | A/B test: Waitlist LP Variant A vs B |
| Microsoft Clarity (wjxhprug80) | Heatmaps and session recording |
| GA4 (G-Q4DYEEXFKV) | Analytics, waitlist conversion tracking |
| Zendesk | Customer support (easychefpro.zendesk.com) |
| Stripe | Subscriptions and founding member payments |
| Make.com | Automation webhooks |
| Google Apps Script | Backend proxy for Sheets, Slack, Anthropic API |

---

## Current Blockers (as of May 2026)

1. **/thank-you page not built** — blocks Convert.com A/B test entirely
2. **Convert.com + Clarity not installed** on /lp/waitlist-a, /lp/waitlist-b, /thank-you
3. **Email sequences SEQ-1 through SEQ-5 not written** — blocks list activation
4. **Zendesk not live** — blocks beta program start

---

## Active Campaigns / Workstreams

- **EC-2026-001**: Waitlist A/B test — utm_medium=email audience, Convert.com controls variant assignment, Klaviyo reads utm_content to tag cohorts
- **EC-2026-005**: Pinterest funnel for ICP 02 Budget Family — PENDING ICP validation with beta data
- **SEQ-1**: Welcome sequence (3 emails, Days 0–7)
- **SEQ-2**: Nurture sequence (5 emails including A/B variant on Email 3)
- **SEQ-3**: Urgency sequence (4 emails, June 17–30)
- **SEQ-4**: Launch Day (July 1)
- **SEQ-5**: Re-engagement

---

## ICPs (Ideal Customer Profiles)

- **ICP 01 — Busy Parent**: Households earning $60–120K, 2+ kids, time-constrained, values convenience
- **ICP 02 — Budget Family**: Households earning $40–80K, 2+ kids, financially stressed, shops at Walmart

---

## Beta Program

- Target: 50 families onboarded before July 1
- Outreach: Founder personal inbox (Taylor direct)
- Check-in cadence: Weekly SMS or WhatsApp per family
- Goal: Real testimonials and health goals % data to replace placeholders

---

## Decisions Pending Taylor's Approval

1. $10/$111 ROI framing (11:1) — needed for paywall and Budget Family LP
2. AI chatbot platform: Zendesk Fin / Intercom / ChatGPT via Make.com
3. VA hire threshold (weekly email volume trigger)
4. "Clinical" / independent research claim — requires legal review
5. SEQ-2 Email 3 variant A (Adam / Money Hook) and B (Mary / Time Hook)
