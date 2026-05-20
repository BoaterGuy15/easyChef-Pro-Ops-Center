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

# Check for existing LP spine for LP-B
print("=== LP SPINE CHECK (waitlist-b) ===")
for action in ["lp_spine_read", "get_lp_spine", "read_lp_spine"]:
    try:
        r = gas_post({"action": action, "lp_id": "waitlist-b", "campaign_id": "EC-2026-001"})
        if not r.get("error"):
            print(f"Found via {action}:")
            print(json.dumps(r, indent=2)[:2000])
            break
        else:
            print(f"  {action}: {r.get('error')}")
    except Exception as e:
        print(f"  {action}: exception {e}")

# Check LPInventory for LP-B
print("\n=== LP INVENTORY (LP-B) ===")
try:
    r2 = gas_post({"action": "lp_inventory_read", "campaign_id": "EC-2026-001"})
    items = r2.get("lpInventory", r2.get("items", []))
    for item in (items if isinstance(items, list) else []):
        if "waitlist-b" in str(item.get("slug","")) or "b" == str(item.get("variant","")):
            print(json.dumps(item, indent=2)[:1000])
except Exception as e:
    print(f"  lp_inventory_read error: {e}")

# Check brand doctrine via correct action
print("\n=== BRAND DOCTRINE ===")
try:
    r3 = gas_post({"action": "brand_doctrine_read"})
    rules = r3.get("brandDoctrine", r3.get("rules", []))
    if rules:
        for rule in (rules if isinstance(rules, list) else [rules]):
            rid = rule.get("rule_id","")
            cond = rule.get("conditions","")
            if isinstance(cond, str):
                try: cond = json.loads(cond)
                except: pass
            print(f"\n[{rid}] {rule.get('rule_type','')} / {rule.get('enforcement','')} active={rule.get('active')}")
            if isinstance(cond, dict):
                print(f"  rule:      {cond.get('rule','')}")
                print(f"  rationale: {str(cond.get('rationale',''))[:200]}")
                pl = cond.get('placement',{})
                if pl: print(f"  placement: {json.dumps(pl)}")
    else:
        print(f"  raw keys: {list(r3.keys())} / sample: {str(r3)[:200]}")
except Exception as e:
    print(f"  brand_doctrine_read error: {e}")

# Check system health for LP spine state
print("\n=== HEALTH CHECK (LP spine state) ===")
try:
    r4 = gas_post({"action": "system_health_check", "campaign_id": "EC-2026-001"})
    health = r4.get("health", {})
    print(f"  lp_spine_status: {health.get('lp_spine_status', health.get('lp_spine',''))}")
    print(f"  deploy_version:  {health.get('deploy_version', r4.get('deploy_number',''))}")
    lp_keys = [k for k in health.keys() if 'lp' in k.lower() or 'spine' in k.lower()]
    for k in lp_keys:
        print(f"  {k}: {health[k]}")
except Exception as e:
    print(f"  health error: {e}")
