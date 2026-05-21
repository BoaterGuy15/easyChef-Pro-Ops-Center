import json, urllib.request, time

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

with open('tmp_delete_list.json') as f:
    data = json.load(f)

to_delete = data['to_delete']
print(f"Deleting {len(to_delete)} templates...\n")

ok_count = 0
fail_count = 0
failed = []

for i, t in enumerate(to_delete):
    payload = json.dumps({'action': 'klaviyo_delete_template', 'template_id': t['id']})
    req = urllib.request.Request(
        GAS_URL,
        data=payload.encode('utf-8'),
        headers={'Content-Type': 'text/plain'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            if result.get('ok') or result.get('code') == 204:
                ok_count += 1
                print(f"  OK  [{t['id']}] {t['name'][:60]}")
            else:
                fail_count += 1
                failed.append(t)
                print(f"  FAIL [{t['id']}] code={result.get('code')} {t['name'][:50]}")
    except Exception as e:
        fail_count += 1
        failed.append(t)
        print(f"  ERROR [{t['id']}] {e}")

    # Rate limit: 250ms between calls
    if i % 20 == 19:
        print(f"  --- {i+1}/{len(to_delete)} done, pausing ---")
        time.sleep(1)
    else:
        time.sleep(0.25)

print(f"\n=== DONE ===")
print(f"Deleted: {ok_count}")
print(f"Failed:  {fail_count}")
if failed:
    print("Failed IDs:")
    for t in failed:
        print(f"  [{t['id']}] {t['name']}")
