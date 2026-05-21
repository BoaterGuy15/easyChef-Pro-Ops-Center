import json, urllib.request, urllib.error, time

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

# ── SAFELIST — every template that is active or may be active ─────────────────
KEEP = {
    # SEQ-1 standalones (pending flow UI wire)
    'UxsJ3U','RmZJyL','WqLmGD','VxRy3Q','TqUD9M','W8RAvW',
    # SEQ-2 standalones (pending flow UI wire)
    'Y9aeU6','YvrLDj','UiqGQW','WpkBAu','TyKpJq','SFQA5B',
    'RbUHNb','YcmK9j','WeFkW4','UPnK22',
    # SEQ-3 — @946 rewrite templates (may still be campaign-assigned)
    'UzuXXQ','Tacn3N','TsGpgR','RuZZ5A','XSrXN7','SShAR7','VERNyE','YnNKUP',
    # SEQ-3 — current campaign templates (from recreated @973 campaigns)
    'X376mu','VBNurs','VYVKZT','TqejbZ','WzVNtZ','TsQznS','ThA4G6','Xfz7hv',
    # SEQ-4 standalones (campaign-assigned Jul 2/3/5)
    'RAevtk','Y4hJxf','W6BkjY','SXw7eR','Wp7mz3','RsauRg',
    # Alpha flow
    'UM8eaZ','Tx68VK','XEjGdW','Uxet8P','QRKrLt','VC23Fh',
    # BETA flow
    'Sb62kA','TXvTR5','TkuRes','WijzCM',
    # OB Standard flow
    'Vehw4u','TYfqPe','Y7uY7r','WRsSSb','TbXRvP','RVVLgz',
    # Organic Welcome flow
    'WsiB9d','SLPzLR','Y5tXWU',
    # QST emails
    'VyNxs4','XLArLB',
}

def gas_call(payload):
    req = urllib.request.Request(
        GAS_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'text/plain'},
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode('utf-8'))

# ── 1. Fetch all templates ─────────────────────────────────────────────────────
print("Fetching all templates...")
result = gas_call({'action': 'klaviyo_list_templates'})
if not result.get('ok'):
    print(f"ERROR: {result}")
    exit(1)

all_templates = result['templates']
print(f"Total templates: {len(all_templates)}")

# ── 2. Split into keep vs delete ──────────────────────────────────────────────
to_delete = [t for t in all_templates if t['id'] not in KEEP]
to_keep   = [t for t in all_templates if t['id'] in KEEP]

print(f"\nKEEP: {len(to_keep)}")
print(f"DELETE: {len(to_delete)}")

# ── 3. Dry run — show what would be deleted ───────────────────────────────────
print("\n=== DRY RUN — Templates to delete ===")
for t in sorted(to_delete, key=lambda x: x.get('name','')):
    print(f"  [{t['id']}] {t['name'][:80]}")

print(f"\n=== Keep (active templates) ===")
for t in sorted(to_keep, key=lambda x: x.get('name','')):
    print(f"  [{t['id']}] {t['name'][:80]}")

# ── 4. Write delete list to file for review before running ────────────────────
with open('tmp_delete_list.json', 'w') as f:
    json.dump({'to_delete': to_delete, 'to_keep': to_keep}, f, indent=2)

print(f"\nDry run complete. {len(to_delete)} templates queued for deletion.")
print("Review tmp_delete_list.json, then run tmp_template_delete_execute.py to delete.")
