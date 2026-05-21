import json, urllib.request, time

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

def gas(payload):
    req = urllib.request.Request(GAS_URL, data=json.dumps(payload).encode(), headers={'Content-Type': 'text/plain'}, method='POST')
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())

# 14 duplicate campaigns from timed-out first run — no templates assigned
DUPES = [
    '01KS64X3XRWSHG00194MRXKHW1',
    '01KS64XATV1ZTMVJ2F7JWZYGG8',
    '01KS64XJ1RC3MTNB4EJ4C95644',
    '01KS64XS0B08G01D39VM9NGB0A',
    '01KS64Y031HM0F98BDDF3H308K',
    '01KS64Y70F8YCN5S1YV510D0HM',
    '01KS64YDMSBZYMSRSCN6ZRT22S',
    '01KS64YN2C2P84PQZ818JBMC1Q',
    '01KS64YWEDA1VEGFF3A7BEGVN1',
    '01KS64Z3K77HQY7W8ZZZ4W4CHT',
    '01KS64ZAG2HJRGKSJSB260BWAF',
    '01KS64ZHN5JZAGAGCVJ65ZGE38',
    '01KS64ZR8R59EVV32HJW22SGWD',
    '01KS64ZZ5VRZJ2WPH533CF13G2',
]

print(f'=== DELETING {len(DUPES)} DUPLICATE CAMPAIGNS ===\n')

for cid in DUPES:
    # Step 1: cancel send job (moves from Scheduled → Draft so it can be deleted)
    r1 = gas({'action': 'klaviyo_cancel_send_job', 'campaign_id': cid})
    cancel_ok = r1.get('ok') or r1.get('code') in [200, 204]
    cancel_status = 'ok' if cancel_ok else ('FAIL code=' + str(r1.get('code')) + ' ' + str(r1.get('error',''))[:60])
    print('  cancel ' + cid + ': ' + cancel_status)
    time.sleep(0.4)

    # Step 2: delete the campaign
    r2 = gas({'action': 'klaviyo_delete_campaign', 'campaign_id': cid})
    delete_ok = r2.get('ok') or r2.get('code') in [200, 204]
    delete_status = 'ok' if delete_ok else ('FAIL code=' + str(r2.get('code')) + ' ' + str(r2.get('error',''))[:60])
    print('  delete ' + cid + ': ' + delete_status + '\n')
    time.sleep(0.4)

print('=== DONE ===')
