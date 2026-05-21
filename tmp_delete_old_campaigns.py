import json, urllib.request, time

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

# Old "easyChef Pro --" named campaigns to DELETE
# SEQ-3 (8) + SEQ-4 (6) = 14 total
OLD_CAMPAIGNS = [
    # SEQ-3 old set
    ('01KS5CQYJM77G51YP0B8MN8QP2', 'SEQ-3-E1-A old'),
    ('01KS5CRR6DCNCRKJH0TWCM1G76', 'SEQ-3-E1-B old'),
    ('01KS5CSP5V2JG4D7DSFJJHC6PS', 'SEQ-3-E2-A old'),
    ('01KS5CTK4QXH40W7TYYVYCJMEH', 'SEQ-3-E2-B old'),
    ('01KS5CVFR4WB7EY17R8FQJ8XWM', 'SEQ-3-E3-A old'),
    ('01KS5CWD93C0JZWBZMKCGRH85H', 'SEQ-3-E3-B old'),
    ('01KS5CXAN6DK48S3C55D8WMN69', 'SEQ-3-E4-A old'),
    ('01KS5CYC9HZPZ7Q798ZCMBZBA1', 'SEQ-3-E4-B old'),
    # SEQ-4 old set
    ('01KS5CZD7H4AFHPZKYJZJFPHFS', 'SEQ-4-E1-A old'),
    ('01KS5D1DPKJKFC888SQY4XPP7M', 'SEQ-4-E1-B old'),
    ('01KS5D29C5M3YHZ28NMY8A4ABQ', 'SEQ-4-E2-A old'),
    ('01KS5D3AHARPX22MYD8GNDWEMT', 'SEQ-4-E2-B old'),
    ('01KS5D48M50THGYCBEGY27VDH4', 'SEQ-4-E3-A old'),
    ('01KS5D54A4NPJKRPCNHMKC0AZZ', 'SEQ-4-E3-B old'),
]

def gas_call(payload):
    req = urllib.request.Request(
        GAS_URL,
        data=json.dumps(payload).encode(),
        headers={'Content-Type': 'text/plain'},
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode())

print("=== DELETING 14 OLD 'easyChef Pro --' CAMPAIGNS ===\n")
deleted = 0
failed = 0

for campaign_id, label in OLD_CAMPAIGNS:
    r = gas_call({'action': 'klaviyo_delete_campaign', 'campaign_id': campaign_id})
    ok = r.get('ok') or r.get('code') in (200, 204, 404)
    status = 'DELETED' if r.get('ok') or r.get('code') in (200, 204) else ('ALREADY_GONE' if r.get('code') == 404 else 'FAIL')
    print(f"  {status} [{campaign_id}] {label}  code={r.get('code','?')}")
    if status in ('DELETED', 'ALREADY_GONE'):
        deleted += 1
    else:
        failed += 1
        print(f"    -> {r}")
    time.sleep(0.4)

print(f"\n=== DONE: {deleted} removed, {failed} failed ===")
