import json, urllib.request, re, time

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

def gas(payload):
    req = urllib.request.Request(GAS_URL, data=json.dumps(payload).encode(), headers={'Content-Type': 'text/plain'}, method='POST')
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())

TEMPLATES = [
    ('email-templates/ALPHA-E1_v1.html', 'UM8eaZ', 'ALPHA-E1'),
    ('email-templates/ALPHA-E2_v1.html', 'Tx68VK', 'ALPHA-E2'),
    ('email-templates/ALPHA-E3_v1.html', 'XEjGdW', 'ALPHA-E3'),
    ('email-templates/ALPHA-E4_v1.html', 'Uxet8P', 'ALPHA-E4'),
    ('email-templates/ALPHA-E5_v1.html', 'QRKrLt', 'ALPHA-E5'),
    ('email-templates/ALPHA-E6_v1.html', 'VC23Fh', 'ALPHA-E6'),
]

# Add ", true" back to all default filters in body HTML
# | default: 'VALUE'   ->  | default: 'VALUE', true
# | default: 0         ->  | default: 0, true
def add_true(html):
    # string defaults (not already having , true)
    html = re.sub(r"(\|\s*default:\s*'[^']*')(?!\s*,\s*true)", r'\1, true', html)
    # numeric defaults (not already having , true)
    html = re.sub(r'(\|\s*default:\s*[\d\.]+)(?!\s*,\s*true)', r'\1, true', html)
    return html

print('=== RESTORING ", true" TO ALL ALPHA DEFAULT FILTERS ===\n')

for path, template_id, label in TEMPLATES:
    with open(path, 'r', encoding='utf-8') as f:
        original = f.read()

    fixed = add_true(original)

    added = len(re.findall(r'\|\s*default:[^}]+,\s*true', fixed))
    changed = fixed != original

    with open(path, 'w', encoding='utf-8') as f:
        f.write(fixed)

    print(f'{label}: {added} default filters now have ", true" (changed={changed})')

    r = gas({'action': 'klaviyo_update_template', 'template_id': template_id, 'html': fixed})
    if r.get('ok'):
        print(f'  -> Klaviyo {template_id}: PUSHED ok')
    else:
        print(f'  -> Klaviyo {template_id}: FAIL code={r.get("code")} {r.get("error","")[:80]}')

    time.sleep(0.5)

print('\n=== DONE ===')
