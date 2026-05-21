import json, urllib.request, urllib.error

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

TEMPLATES = [
    ('email-templates/ALPHA-E1_v1.html', 'UM8eaZ', 'ALPHA-E1'),
    ('email-templates/ALPHA-E2_v1.html', 'Tx68VK', 'ALPHA-E2'),
    ('email-templates/ALPHA-E3_v1.html', 'XEjGdW', 'ALPHA-E3'),
    ('email-templates/ALPHA-E4_v1.html', 'Uxet8P', 'ALPHA-E4'),
    ('email-templates/ALPHA-E5_v1.html', 'QRKrLt', 'ALPHA-E5'),
    ('email-templates/ALPHA-E6_v1.html', 'VC23Fh', 'ALPHA-E6'),
]

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
            body = resp.read().decode('utf-8')
            result = json.loads(body)
            ok = result.get('ok', False)
            print(f"{'OK' if ok else 'FAIL'} {label} ({tid}): {json.dumps(result)[:200]}")
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} {label} ({tid}): {e.read().decode('utf-8')[:200]}")
    except Exception as e:
        print(f"ERROR {label} ({tid}): {e}")
