"""Re-push all 6 Alpha standalone templates to Klaviyo and verify default filter syntax."""
import json, urllib.request, os, re, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email-templates")

ALPHA = [
    ("ALPHA-E1_v1.html", "UM8eaZ"),
    ("ALPHA-E2_v1.html", "Tx68VK"),
    ("ALPHA-E3_v1.html", "XEjGdW"),
    ("ALPHA-E4_v1.html", "Uxet8P"),
    ("ALPHA-E5_v1.html", "QRKrLt"),
    ("ALPHA-E6_v1.html", "VC23Fh"),
]

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

for fname, tid in ALPHA:
    fpath = os.path.join(TEMPLATE_DIR, fname)
    with open(fpath, encoding="utf-8") as f:
        html = f.read()

    old_syntax  = re.findall(r'\{\{[^}]+\|\s*default:[^}]+\}\}', html)
    new_syntax  = re.findall(r'\{\{[^}]+\|default\([^)]+\)\s*\}\}', html)
    print(f"\n{fname}  ({tid})")
    print(f"  old Liquid:  {len(old_syntax)}")
    print(f"  new Jinja2:  {len(new_syntax)}")
    for s in new_syntax[:3]:
        print(f"    {s[:90]}")

    resp = post_gas({"action": "klaviyo_update_template", "template_id": tid, "html": html})
    print(f"  Klaviyo:  {'OK' if resp.get('ok') else resp}")
    time.sleep(0.5)

print("\nDone.")
