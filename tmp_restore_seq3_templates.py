import json, urllib.request, time

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

TEMPLATES = [
    ('email-templates/SEQ-3-E1-A_v2.html', 'EC-2026-001 · SEQ-3-E1 · Variant A', '01KS5DN3WX6HH50DSRBB4NXB73'),
    ('email-templates/SEQ-3-E1-B_v2.html', 'EC-2026-001 · SEQ-3-E1 · Variant B', '01KS5DNE0MAYY0H2SPPHJN7FYV'),
    ('email-templates/SEQ-3-E2-A_v2.html', 'EC-2026-001 · SEQ-3-E2 · Variant A', '01KS5DNPN3B597M4DZTZ00XC3T'),
    ('email-templates/SEQ-3-E2-B_v2.html', 'EC-2026-001 · SEQ-3-E2 · Variant B', '01KS5DNZMZ7HXME6PJ80HS4GDG'),
    ('email-templates/SEQ-3-E3-A_v2.html', 'EC-2026-001 · SEQ-3-E3 · Variant A', '01KS5DP7NBNK843C5XGG0E6E7E'),
    ('email-templates/SEQ-3-E3-B_v2.html', 'EC-2026-001 · SEQ-3-E3 · Variant B', '01KS5DPGAYSKWKT4EGFCS95784'),
    ('email-templates/SEQ-3-E4-A_v2.html', 'EC-2026-001 · SEQ-3-E4 · Variant A', '01KS5DPRASB6Y5521BHS9R6ETP'),
    ('email-templates/SEQ-3-E4-B_v2.html', 'EC-2026-001 · SEQ-3-E4 · Variant B', '01KS5DQ0PZ0SNEZKD1Z41CDTKP'),
]

def gas_call(payload):
    req = urllib.request.Request(GAS_URL, data=json.dumps(payload).encode(), headers={'Content-Type': 'text/plain'}, method='POST')
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode())

print("=== CREATING + ASSIGNING SEQ-3 TEMPLATES ===\n")
for path, name, msg_id in TEMPLATES:
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Step 1: Create template
    cr = gas_call({'action': 'klaviyo_create_template', 'name': name, 'html': html})
    if not cr.get('ok'):
        print(f"  CREATE_FAIL {name}: {cr}")
        continue
    tid = cr.get('template_id') or cr.get('id')
    print(f"  CREATED [{tid}] {name}")
    time.sleep(0.5)

    # Step 2: Assign to campaign message
    ar = gas_call({'action': 'klaviyo_assign_campaign_template', 'msg_id': msg_id, 'template_id': tid})
    if ar.get('ok'):
        print(f"  ASSIGNED [{tid}] -> msg {msg_id[:20]}...")
    else:
        print(f"  ASSIGN_FAIL [{tid}] code={ar.get('code')} {ar.get('error','')}")
    time.sleep(0.5)

print("\n=== DONE ===")
