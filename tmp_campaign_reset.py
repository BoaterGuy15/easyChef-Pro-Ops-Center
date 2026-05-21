"""
CAMPAIGN TEMPLATE RESET — 14 SEQ-3/4 campaigns.

Strategy (Klaviyo campaign-assigned templates are read-only / 404 on PATCH):
  1. Update the STANDALONE template with v2 HTML
  2. Re-assign that standalone template to the campaign message
  3. Update subject line on the campaign message

Run AFTER GAS @957 is deployed (klaviyo_assign_campaign_template + fixed
klaviyo_update_campaign_subject).
"""
import json, urllib.request, os, re, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email-templates")

# label | standalone_template_id | msg_id | html_file
CAMPAIGNS = [
    ("SEQ-3-E1-A", "UzuXXQ", "01KRYG1BMMYJ4Z5H7Y2PQZHR4P", "SEQ-3-E1-A_v2.html"),
    ("SEQ-3-E1-B", "Tacn3N", "01KRYEYMTXAKKY8MK7D22EYQVX", "SEQ-3-E1-B_v2.html"),
    ("SEQ-3-E2-A", "TsGpgR", "01KRYEYQVAKPMNWE0KD5W19EPE", "SEQ-3-E2-A_v2.html"),
    ("SEQ-3-E2-B", "RuZZ5A", "01KRYEYTSKTFK97NX3KXKX5MXR", "SEQ-3-E2-B_v2.html"),
    ("SEQ-3-E3-A", "XSrXN7", "01KRYEYXZE23HMNDN9YABJW8H2", "SEQ-3-E3-A_v2.html"),
    ("SEQ-3-E3-B", "SShAR7", "01KRYEZ1F4BC9K3JQM78T0EPHR", "SEQ-3-E3-B_v2.html"),
    ("SEQ-3-E4-A", "VERNyE", "01KRYEZ4S3QNV9RKT2Q3701WP2", "SEQ-3-E4-A_v2.html"),
    ("SEQ-3-E4-B", "YnNKUP", "01KRYEZ7BBXTBR4KQQV5E4X7DV", "SEQ-3-E4-B_v2.html"),
    ("SEQ-4-E1-A", "RAevtk", "01KRYEZA3DMJ2BP56QSJY2GTSM", "SEQ-4-E1-A_v2.html"),
    ("SEQ-4-E1-B", "Y4hJxf", "01KRYEZCFT6HFQJ0PK76741MMJ", "SEQ-4-E1-B_v2.html"),
    ("SEQ-4-E2-A", "W6BkjY", "01KRYEZH5F81J482Y7SMD2KDB7", "SEQ-4-E2-A_v2.html"),
    ("SEQ-4-E2-B", "SXw7eR", "01KRYEZKWMGV18CHB7ZPYYVTB1", "SEQ-4-E2-B_v2.html"),
    ("SEQ-4-E3-A", "Wp7mz3", "01KRYEZQ20DJZ26YNVVGS962RV", "SEQ-4-E3-A_v2.html"),
    ("SEQ-4-E3-B", "RsauRg", "01KRYEZSVKTK4CXZ7PJE5B4SA4", "SEQ-4-E3-B_v2.html"),
]

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

def read_html(fname):
    return open(os.path.join(TEMPLATE_DIR, fname), encoding="utf-8").read()

def extract_subject(html):
    m = re.search(r'\{\{SUBJECT\}\}\s+(.+)', html)
    return m.group(1).strip() if m else ""

print("=" * 65)
print("CAMPAIGN TEMPLATE RESET — 14 campaigns (SEQ-3/4)")
print("Strategy: update standalone -> assign to campaign -> update subject")
print("=" * 65)

ok_all = []; ok_partial = []; fail = []

for label, standalone_tid, msg_id, fname in CAMPAIGNS:
    html    = read_html(fname)
    subject = extract_subject(html)
    print(f"\n  {label}  standalone={standalone_tid}  msg={msg_id}")
    print(f"    subject: {subject[:70]}")

    if not subject:
        print(f"    WARN: no {{SUBJECT}} found in {fname}")

    # Step 1: update standalone template with v2 HTML
    r1 = post_gas({"action": "klaviyo_update_template", "template_id": standalone_tid, "html": html})
    s1 = "OK" if r1.get("ok") else f"FAIL {r1.get('error','?')[:50]}"
    print(f"    [1] Update standalone {standalone_tid}: {s1}")
    time.sleep(0.5)

    # Step 2: assign standalone template to campaign message
    r2 = post_gas({"action": "klaviyo_assign_campaign_template",
                   "msg_id": msg_id, "template_id": standalone_tid})
    s2 = "OK" if r2.get("ok") else f"FAIL code={r2.get('code','?')} {str(r2.get('error','?'))[:50]}"
    print(f"    [2] Assign template to campaign:     {s2}")
    time.sleep(0.5)

    # Step 3: update subject line
    r3_ok = False
    if subject:
        r3 = post_gas({"action": "klaviyo_update_campaign_subject",
                       "msg_id": msg_id, "subject": subject})
        r3_ok = r3.get("ok", False)
        s3 = "OK" if r3_ok else f"FAIL code={r3.get('code','?')} {str(r3.get('error','?'))[:50]}"
        print(f"    [3] Update subject:                  {s3}")
    else:
        s3 = "SKIP (no subject)"
        print(f"    [3] Update subject:                  {s3}")

    time.sleep(0.6)

    if r1.get("ok") and r2.get("ok") and r3_ok:
        ok_all.append(label)
    elif r1.get("ok") or r2.get("ok"):
        ok_partial.append(label)
    else:
        fail.append(label)

print("\n" + "=" * 65)
print("SUMMARY")
print("=" * 65)
print(f"All 3 steps OK:  {len(ok_all)}/14  {ok_all}")
print(f"Partial (1-2/3): {len(ok_partial)}/14  {ok_partial}")
print(f"Failed (0/3):    {len(fail)}/14  {fail}")
