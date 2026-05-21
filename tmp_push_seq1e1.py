import json, urllib.request

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

TEMPLATES = [
    ('email-templates/SEQ-1-E1-A_v2.html', 'UxsJ3U', 'SEQ-1-E1-A'),
    ('email-templates/SEQ-1-E1-B_v2.html', 'RmZJyL', 'SEQ-1-E1-B'),
]

def gas_call(payload):
    req = urllib.request.Request(GAS_URL, data=json.dumps(payload).encode(), headers={'Content-Type': 'text/plain'}, method='POST')
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode())

print("=== PUSHING SEQ-1-E1 TO KLAVIYO ===")
for path, tid, label in TEMPLATES:
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    result = gas_call({'action': 'klaviyo_update_template', 'template_id': tid, 'html': html})
    print(f"  {'OK' if result.get('ok') else 'FAIL'} [{tid}] {label}  code={result.get('code','?')}")

print("Done.")
