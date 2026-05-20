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
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.loads(r.read().decode())

# Approved claims — try both action names
for action in ["approved_claims_read", "get_approved_claims", "read_approved_claims"]:
    r = gas_post({"action": action})
    keys = list(r.keys())
    if not r.get("error"):
        print(f"\n=== APPROVED CLAIMS (via {action}) ===")
        claims = r.get("approvedClaims", r.get("claims", r.get("data", [])))
        if claims:
            for c in (claims if isinstance(claims, list) else [claims]):
                print(f"  [{c.get('id','')}] {c.get('exact_wording','')[:150]}")
                print(f"         approved_by={c.get('approved_by','')} · approved={c.get('approved','')} · notes={c.get('notes','')[:80]}")
        else:
            print(f"  raw keys: {keys}")
        break

# Brand doctrine — try both action names
for action in ["brand_doctrine_read", "get_brand_doctrine", "read_brand_doctrine"]:
    r = gas_post({"action": action})
    if not r.get("error"):
        print(f"\n=== BRAND DOCTRINE (via {action}) ===")
        rules = r.get("brandDoctrine", r.get("rules", r.get("data", [])))
        if rules:
            for rule in (rules if isinstance(rules, list) else [rules]):
                rid = rule.get("rule_id","")
                cond = rule.get("conditions","")
                if isinstance(cond,str):
                    try: cond = json.loads(cond)
                    except: pass
                print(f"\n  [{rid}] {rule.get('rule_type','')} / {rule.get('enforcement','')} active={rule.get('active')}")
                if isinstance(cond,dict):
                    print(f"    rule:      {cond.get('rule','')}")
                    print(f"    rationale: {str(cond.get('rationale',''))[:200]}")
                    pl = cond.get('placement',{})
                    if pl: print(f"    placement: {pl}")
        else:
            print(f"  raw keys: {list(r.keys())}")
        break

# Playbook doc ID — try cc_settings_read
print("\n=== CC SETTINGS (PLAYBOOK_DOC_ID search) ===")
r = gas_post({"action": "cc_settings_read"})
settings = r.get("settings", r.get("data", []))
if settings:
    for s in (settings if isinstance(settings, list) else [settings]):
        key = s.get("key","") or s.get("setting_key","")
        if "PLAYBOOK" in key.upper() or "playbook" in key.lower():
            print(f"  {key} = {s.get('value','')}")
else:
    # Try system_health_check which returns playbook ref
    r2 = gas_post({"action": "system_health_check", "campaign_id": "EC-2026-001"})
    print(f"  health keys: {list(r2.keys())[:15]}")
    for k in ["playbook_doc_id","PLAYBOOK_DOC_ID","roadmap_doc_id"]:
        if r2.get(k):
            print(f"  {k} = {r2.get(k)}")
