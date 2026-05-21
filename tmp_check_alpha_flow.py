"""Check all 6 Alpha flow-assigned template copies for Liquid default syntax."""
import json, urllib.request, re, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

# Alpha flow step -> flow-assigned template ID (from backfill_flow_message_ids)
ALPHA_FLOW = [
    ("ALPHA-E1", "Uznteh"),
    ("ALPHA-E2", "VJMi89"),
    ("ALPHA-E3", "TjkmZ3"),
    ("ALPHA-E4", "Whb6pn"),
    ("ALPHA-E5", "XszVhe"),
    ("ALPHA-E6", "WPySEB"),
]

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

for email, tid in ALPHA_FLOW:
    r = post_gas({"action": "klaviyo_get_template", "template_id": tid})
    html = (r.get("data") or {}).get("data", {}).get("attributes", {}).get("html", "") or ""
    liquid = re.findall(r'\{\{[^}]+\|\s*default:[^}]+\}\}', html)
    jinja2 = re.findall(r'\{\{[^}]+default\([^}]+\)\s*\}\}', html)
    bracket = "[first name]" in html or "[First Name]" in html
    print(f"{email}  {tid}  liquid:{len(liquid)}  jinja2:{len(jinja2)}  bracket:{bracket}")
    if liquid:
        for h in liquid[:2]:
            print(f"  OLD: {h[:100]}")
    time.sleep(0.3)
