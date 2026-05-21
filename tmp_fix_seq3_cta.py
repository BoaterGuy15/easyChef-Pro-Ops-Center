import json, urllib.request, time, re

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

# All SEQ-3 Klaviyo template IDs — both @946 and @973 sets
SEQ3_IDS = [
    'UzuXXQ','Tacn3N','TsGpgR','RuZZ5A','XSrXN7','SShAR7','VERNyE','YnNKUP',
    'X376mu','VBNurs','VYVKZT','TqejbZ','WzVNtZ','TsQznS','ThA4G6','Xfz7hv',
]

# Local SEQ-3 v2 files
LOCAL_FILES = [
    'email-templates/SEQ-3-E1-A_v2.html',
    'email-templates/SEQ-3-E1-B_v2.html',
    'email-templates/SEQ-3-E2-A_v2.html',
    'email-templates/SEQ-3-E2-B_v2.html',
    'email-templates/SEQ-3-E3-A_v2.html',
    'email-templates/SEQ-3-E3-B_v2.html',
    'email-templates/SEQ-3-E4-A_v2.html',
    'email-templates/SEQ-3-E4-B_v2.html',
]

def gas_call(payload):
    req = urllib.request.Request(GAS_URL, data=json.dumps(payload).encode(), headers={'Content-Type': 'text/plain'}, method='POST')
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode())

def fix_cta(html):
    html = html.replace('Claim my founding spot →', 'Lock in $7.99 before July 1 →')
    html = html.replace('Claim my founding spot &#8594;', 'Lock in $7.99 before July 1 &#8594;')
    html = html.replace('Free to join. No credit card. Early access July 1.', 'Founding price. $7.99/month. Locks forever July 1.')
    return html

# ── 1. Fix local files ────────────────────────────────────────────────────────
print("=== FIXING LOCAL FILES ===")
for path in LOCAL_FILES:
    with open(path, 'r', encoding='utf-8') as f:
        original = f.read()
    fixed = fix_cta(original)
    if fixed != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(fixed)
        print(f"  FIXED {path}")
    else:
        print(f"  NO_CHANGE {path}")

# ── 2. Fix Klaviyo templates ──────────────────────────────────────────────────
print("\n=== FIXING KLAVIYO TEMPLATES ===")
ok_count = 0
skip_count = 0
fail_count = 0

for tid in SEQ3_IDS:
    try:
        result = gas_call({'action': 'klaviyo_get_template', 'template_id': tid})
        if not result.get('ok'):
            print(f"  GET_FAIL [{tid}] code={result.get('code')}")
            fail_count += 1
            time.sleep(0.3)
            continue
        html = result['data']['data']['attributes']['html']
        fixed = fix_cta(html)
        if fixed == html:
            print(f"  NO_CHANGE [{tid}]")
            skip_count += 1
            time.sleep(0.3)
            continue
        upd = gas_call({'action': 'klaviyo_update_template', 'template_id': tid, 'html': fixed})
        if upd.get('ok'):
            ok_count += 1
            print(f"  OK  [{tid}]")
        else:
            fail_count += 1
            print(f"  FAIL [{tid}] code={upd.get('code')}")
    except Exception as e:
        fail_count += 1
        print(f"  ERROR [{tid}] {e}")
    time.sleep(0.35)

print(f"\n=== DONE ===")
print(f"Updated: {ok_count}")
print(f"No change: {skip_count}")
print(f"Failed: {fail_count}")
