import json, urllib.request, time

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

def gas(payload):
    req = urllib.request.Request(GAS_URL, data=json.dumps(payload).encode(), headers={'Content-Type': 'text/plain'}, method='POST')
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())

TEMPLATES = [
    ('email-templates/ALPHA-E1_v1.html', 'UM8eaZ', 'ALPHA-E1 — Community Member naming + cap language'),
    ('email-templates/QST-E1_v1.html',   'Xrx4uN', 'QST-E1  — up to 50 families + Community Member P.S.'),
]

print('=== PUSHING COMMUNITY MEMBER UPDATES TO KLAVIYO ===\n')
for path, template_id, label in TEMPLATES:
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    r = gas({'action': 'klaviyo_update_template', 'template_id': template_id, 'html': html})
    if r.get('ok'):
        print(f'{label} [{template_id}]: PUSHED ok')
    else:
        print(f'{label} [{template_id}]: FAIL code={r.get("code")} {str(r.get("error",""))[:80]}')
    time.sleep(0.5)

print('\n=== DONE ===')
