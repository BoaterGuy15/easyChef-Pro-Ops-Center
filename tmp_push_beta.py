import json, urllib.request, time

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

def gas(payload):
    req = urllib.request.Request(GAS_URL, data=json.dumps(payload).encode(), headers={'Content-Type': 'text/plain'}, method='POST')
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())

TEMPLATES = [
    ('email-templates/BETA-E1_v1.html', 'Sb62kA', 'BETA-E1'),
    ('email-templates/BETA-E2_v1.html', 'TXvTR5', 'BETA-E2'),
    ('email-templates/BETA-E3_v1.html', 'TkuRes', 'BETA-E3'),
    ('email-templates/BETA-E4_v1.html', 'WijzCM', 'BETA-E4'),
]

print('=== PUSHING BETA E1-E4 TO KLAVIYO ===\n')
for path, template_id, label in TEMPLATES:
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    r = gas({'action': 'klaviyo_update_template', 'template_id': template_id, 'html': html})
    if r.get('ok'):
        print(f'{label} [{template_id}]: PUSHED ok')
    else:
        print(f'{label} [{template_id}]: FAIL code={r.get("code")} {r.get("error","")[:80]}')
    time.sleep(0.5)

print('\n=== DONE ===')
