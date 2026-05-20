import json, urllib.request, urllib.parse

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def gas_post(payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(GAS_URL, data=data,
          headers={"Content-Type": "text/plain"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())

def gas_get(params):
    url = GAS_URL + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())

# 1. Playbook doc ID from CcSettings
print("=== PLAYBOOK DOC ID ===")
r = gas_post({"action": "get_cc_setting", "key": "PLAYBOOK_DOC_ID"})
print(json.dumps(r, indent=2))

# 2. ICP profiles
print("\n=== ICP PROFILES ===")
r2 = gas_post({"action": "icp_profiles_read"})
profiles = r2.get("icpProfiles", [])
for p in profiles:
    if p.get("code") == "super_mom_time":
        print(json.dumps(p, indent=2))

# 3. Approved claims
print("\n=== APPROVED CLAIMS ===")
r3 = gas_post({"action": "get_approved_claims"})
claims = r3.get("approvedClaims", r3.get("claims", []))
for c in claims:
    print(f"  [{c.get('id')}] {c.get('exact_wording','')[:120]} — {c.get('approved','')}")

# 4. Brand doctrine
print("\n=== BRAND DOCTRINE ===")
r4 = gas_post({"action": "get_brand_doctrine"})
rules = r4.get("brandDoctrine", r4.get("rules", []))
for rule in rules:
    print(f"  [{rule.get('rule_id')}] {rule.get('rule_type','')} / {rule.get('enforcement','')} — active={rule.get('active')}")
    cond = rule.get("conditions", {})
    if isinstance(cond, str):
        try: cond = json.loads(cond)
        except: pass
    if isinstance(cond, dict):
        print(f"    rule: {cond.get('rule','')}")
        print(f"    rationale: {cond.get('rationale','')[:200]}")

# 5. Master positioning — website + super_mom_time
print("\n=== MASTER POSITIONING (website) ===")
r5 = gas_get({"action": "master_positioning_read", "campaign_id": "EC-2026-001"})
positionings = r5.get("positionings", r5.get("positioning", []))
if not isinstance(positionings, list): positionings = [positionings]
for mp in positionings:
    if mp.get("icp_code") in ("website", "super_mom_time"):
        print(f"\n--- {mp.get('positioning_id')} | icp={mp.get('icp_code')} | status={mp.get('status')} ---")
        for key in ["master_undertone","who_she_is","core_truth","master_story",
                    "what_we_say","feeling_sold","loss_aversion_line","message_hierarchy",
                    "proof_point","emotional_arc","stage_5_retention_job","anti_patterns",
                    "channel_strategy","secondary_pain"]:
            val = mp.get(key,"")
            if val:
                print(f"  {key}: {str(val)[:300]}")
