import json, urllib.request, urllib.parse

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def gas_get(params):
    url = GAS_URL + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.loads(r.read().decode())

r = gas_get({"action": "lp_inventory_read", "campaign_id": "EC-2026-001"})
items = r.get("inventory", r.get("lpInventory", []))
for item in (items if isinstance(items, list) else []):
    v = str(item.get("lp_variant","") or item.get("variant",""))
    slug = str(item.get("slug",""))
    if v.upper() == "B" or "waitlist-b" in slug:
        print(json.dumps(item, indent=2))
