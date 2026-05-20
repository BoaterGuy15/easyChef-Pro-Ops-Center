import json, urllib.request, urllib.parse, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def gas_post(payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())

# ── 1. Read current super_mom_time profile (preserve existing fields) ─────────
print("Reading ICP profiles...")
r = gas_post({"action": "icp_profiles_read"})
profiles = r.get("icpProfiles", [])
existing = next((p for p in profiles if p.get("code") == "super_mom_time"), {})
print(f"  Found: {existing.get('id', 'NOT FOUND')} — {existing.get('name', '')}")

# ── 2. Build upsert — only touch the fields Mary updated, preserve the rest ───
icp_update = {
    "id":   existing.get("id") or "super_mom_time",
    "name": existing.get("name") or "Super Mom — Time",
    "code": "super_mom_time",
    "status": existing.get("status") or "Active",

    # Preserve existing fields
    "demographics":   existing.get("demographics", ""),
    "psychographics": existing.get("psychographics", ""),
    "value_trigger":  existing.get("value_trigger", ""),
    "utm_campaign_codes": existing.get("utm_campaign_codes", ""),
    "lp_variants":    existing.get("lp_variants", ""),
    "validated":      existing.get("validated", False),
    "validation_notes": existing.get("validation_notes", ""),

    # ── Mary's layer updates ──────────────────────────────────────────────
    "loss_aversion": (
        "Every night she wings it is an evening she did not choose for her family."
        "\nApproved uses: email subject · TikTok overlay · LP subheadline"
    ),
    "message_hierarchy": (
        "1. Dinner decided before she opens the fridge\n"
        "2. Founding family identity\n"
        "3. $1,336 savings (proof only — never hook)\n"
        "4. $7.99 founding price (CTA only)"
    ),
    "channel_affinity": (
        "TikTok discovers → Facebook validates → Instagram aspires → community grows"
        + (("\n" + existing.get("channel_affinity","")) if existing.get("channel_affinity","").strip() else "")
    ),
    "primary_pain": (
        "5-10 hours/week on food decisions. 260-520 hours/year. 10-21 full days annually."
        " Standing at fridge 6:30 PM blank stare."
        + (("\n" + existing.get("primary_pain","")) if existing.get("primary_pain","").strip() else "")
    ),
    "secondary_pain": (
        "Paprika + AnyList don't talk to each other — five apps problem. App fragmentation is the real enemy."
        + (("\n" + existing.get("secondary_pain","")) if existing.get("secondary_pain","").strip() else "")
    ),
    "conversion_triggers": (
        "Primary TikTok scene: Scene 1: Standing at fridge. 6:30 PM. Blank stare."
        " Scene 2: Dinner already planned. Recipe open."
        " Overlay: loss aversion line."
        " End card: 7-day free trial."
        + (("\n" + existing.get("conversion_triggers","")) if existing.get("conversion_triggers","").strip() else "")
    ),
}

print("Writing ICP profile for super_mom_time...")
r2 = gas_post({"action": "set_icp_profile", "profile": icp_update})
print(f"  ICP result: {r2.get('ok')} — {r2.get('id','')}")

time.sleep(1)

# ── 3. Add AC-013 to ApprovedClaims ──────────────────────────────────────────
print("Adding AC-013 (time hook stat)...")
r3 = gas_post({
    "action": "append_approved_claim",
    "claim": {
        "id":            "AC-013",
        "claim_type":    "time",
        "exact_wording": (
            "5-10 hours per week on food decisions — "
            "260-520 hours per year — "
            "10-21 full days annually"
        ),
        "approved":      "ACTIVE",
        "approved_by":   "Mary",
        "approved_date": "2026-05-19",
        "notes":         "Hook stat for super_mom_time ICP. Use as primary time-cost hook — never lead with money for this ICP."
    }
})
print(f"  AC-013 result: {r3.get('ok')} — {json.dumps(r3.get('result',''))}")

time.sleep(1)

# ── 4. Add BrandDoctrine rule — money message placement ───────────────────────
print("Adding BrandDoctrine MONEY_MESSAGE_PLACEMENT_001...")
r4 = gas_post({
    "action": "append_brand_doctrine",
    "rule": {
        "rule_id":    "MONEY_MESSAGE_PLACEMENT_001",
        "rule_type":  "icp_specific",
        "enforcement":"hard",
        "active":     True,
        "conditions": {
            "icp_code": "super_mom_time",
            "rule":     "$1,336 is proof — never the hook for super_mom_time ICP",
            "placement": {
                "hook":         "forbidden",
                "subject_line": "forbidden",
                "tiktok_overlay":"forbidden",
                "lp_subheadline":"forbidden",
                "proof_section": "approved",
                "email_proof":   "approved",
                "cta_section":   "approved"
            },
            "rationale": (
                "super_mom_time ICP responds to time/identity hooks, not money. "
                "$1,336 appears only in proof/value sections as validation — "
                "never as the lead or hook. Dinner decision and time cost are the hooks."
            )
        }
    }
})
print(f"  BrandDoctrine result: {r4.get('ok')} — action={r4.get('action','')}")

print("\nDone.")
print(f"  ICP updated:        {r2.get('ok')}")
print(f"  AC-013 appended:    {r3.get('ok')}")
print(f"  BrandDoctrine rule: {r4.get('ok')} ({r4.get('action','')})")
