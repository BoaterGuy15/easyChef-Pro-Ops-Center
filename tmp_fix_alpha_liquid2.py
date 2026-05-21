import re, json, urllib.request, urllib.error

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

TEMPLATES = [
    ('email-templates/ALPHA-E1_v1.html', 'UM8eaZ', 'ALPHA-E1'),
    ('email-templates/ALPHA-E2_v1.html', 'Tx68VK', 'ALPHA-E2'),
    ('email-templates/ALPHA-E3_v1.html', 'XEjGdW', 'ALPHA-E3'),
    ('email-templates/ALPHA-E4_v1.html', 'Uxet8P', 'ALPHA-E4'),
    ('email-templates/ALPHA-E5_v1.html', 'QRKrLt', 'ALPHA-E5'),
    ('email-templates/ALPHA-E6_v1.html', 'VC23Fh', 'ALPHA-E6'),
]

def fix_klaviyo_default(html):
    # {{ person.X | default: 'VALUE' }} (1-arg Liquid) → {{ person.X | default: 'VALUE', true }}
    html = re.sub(
        r"\{\{\s*person\.(\w+)\s*\|\s*default:\s*'([^']+)'\s*\}\}",
        r"{{ person.\1 | default: '\2', true }}",
        html
    )
    # {{ person.X | default: N }} (numeric, 1-arg) → {{ person.X | default: N, true }}
    html = re.sub(
        r"\{\{\s*person\.(\w+)\s*\|\s*default:\s*(\d+)\s*\}\}",
        r"{{ person.\1 | default: \2, true }}",
        html
    )
    return html

print("=== FIXING ===")
for path, tid, label in TEMPLATES:
    with open(path, 'r', encoding='utf-8') as f:
        original = f.read()
    fixed = fix_klaviyo_default(original)
    count = len(re.findall(r"\|\s*default:\s*'[^']+'\s*,\s*true", fixed)) + \
            len(re.findall(r"\|\s*default:\s*\d+\s*,\s*true", fixed))
    with open(path, 'w', encoding='utf-8') as f:
        f.write(fixed)
    print(f"Fixed {label}: {count} two-arg defaults in file")

print("\n=== VERIFICATION ===")
for path, tid, label in TEMPLATES:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    # Check for any 1-arg defaults remaining
    one_arg = len(re.findall(r"\|\s*default:\s*'[^']+'\s*\}\}", content)) + \
              len(re.findall(r"\|\s*default:\s*\d+\s*\}\}", content))
    two_arg = len(re.findall(r"\|\s*default:\s*'[^']+'\s*,\s*true", content)) + \
              len(re.findall(r"\|\s*default:\s*\d+\s*,\s*true", content))
    print(f"{label}: {two_arg} two-arg (OK) | {one_arg} one-arg (BAD)")

print("\n=== PUSHING TO KLAVIYO ===")
for path, tid, label in TEMPLATES:
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    payload = json.dumps({'action': 'klaviyo_update_template', 'template_id': tid, 'html': html})
    req = urllib.request.Request(
        GAS_URL,
        data=payload.encode('utf-8'),
        headers={'Content-Type': 'text/plain'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            ok = result.get('ok', False)
            print(f"{'OK' if ok else 'FAIL'} {label} ({tid})")
    except Exception as e:
        print(f"ERROR {label} ({tid}): {e}")
