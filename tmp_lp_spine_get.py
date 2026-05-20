import json, urllib.request, urllib.parse

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def gas_get(params):
    url = GAS_URL + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.loads(r.read().decode())

# LP spine via GET
print("=== LP SPINE (GET) ===")
for action in ["lp_spine_read", "get_lp_spine"]:
    r = gas_get({"action": action, "campaign_id": "EC-2026-001", "lp_id": "waitlist-b"})
    print(f"action={action}: keys={list(r.keys())[:8]}")
    if not r.get("error") and list(r.keys()) != ['ok']:
        print(json.dumps(r, indent=2)[:3000])
        break
    print(f"  error: {r.get('error','')}")

# LP inventory via GET
print("\n=== LP INVENTORY (GET) ===")
r2 = gas_get({"action": "lp_inventory_read", "campaign_id": "EC-2026-001"})
print(f"keys: {list(r2.keys())[:8]}")
items = r2.get("lpInventory", r2.get("items", r2.get("data", [])))
if items:
    for item in (items if isinstance(items, list) else [items]):
        slug = str(item.get("slug","") or item.get("lp_id",""))
        variant = str(item.get("variant",""))
        if "b" in variant or "waitlist-b" in slug or "time" in str(item).lower():
            print(json.dumps(item, indent=2)[:1500])
else:
    print(str(r2)[:500])

# Brand doctrine via GET
print("\n=== BRAND DOCTRINE (GET) ===")
for action in ["brand_doctrine_read", "get_brand_doctrine"]:
    r3 = gas_get({"action": action})
    print(f"action={action}: keys={list(r3.keys())[:8]}")
    rules = r3.get("brandDoctrine", r3.get("rules", []))
    if rules:
        for rule in (rules if isinstance(rules, list) else [rules]):
            rid = rule.get("rule_id","")
            cond = rule.get("conditions","")
            if isinstance(cond, str):
                try: cond = json.loads(cond)
                except: pass
            print(f"\n  [{rid}] {rule.get('rule_type','')} / {rule.get('enforcement','')} active={rule.get('active')}")
            if isinstance(cond, dict):
                print(f"    rule:      {cond.get('rule','')}")
                print(f"    rationale: {str(cond.get('rationale',''))[:200]}")
                pl = cond.get('placement',{})
                if pl: print(f"    placement: {json.dumps(pl)}")
        break
    print(f"  raw: {str(r3)[:200]}")
