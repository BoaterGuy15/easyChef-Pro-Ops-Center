import json, urllib.request, ssl

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

with open(r'C:\Users\Trader\easyChef-Pro-Ops-Center\tmp_index_astro.txt', 'r', encoding='utf-8') as f:
    content = f.read()

payload = json.dumps({
    'action': 'patch_website_files',
    'file': 'index.astro',
    'content': content
}).encode('utf-8')

ctx = ssl.create_default_context()
req = urllib.request.Request(GAS_URL, data=payload, headers={'Content-Type': 'text/plain'})
with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
    print(resp.read().decode('utf-8'))
