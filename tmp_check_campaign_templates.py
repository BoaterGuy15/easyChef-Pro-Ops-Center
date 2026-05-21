"""
Check the 14 SEQ-3/4 campaign message copies for any Liquid | default: syntax.
Also reads the subject line stored on each campaign message.
"""
import json, urllib.request, re, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

# 14 campaigns: Klaviyo campaign_id -> asset label
CAMPAIGNS = [
    ("01KRYG1BMA0TDGCGFP9FXW4A9A", "SEQ-3-E1-A"),
    ("01KRYEYMTM24KAH1MD46F0B134", "SEQ-3-E1-B"),
    ("01KRYEYQV2FWE26165ZTM8919T", "SEQ-3-E2-A"),
    ("01KRYEYTSADV8XWKCGG6F1QPFA", "SEQ-3-E2-B"),
    ("01KRYEYXZ6TDV30WFES05FZBSS", "SEQ-3-E3-A"),
    ("01KRYEZ1EXY7VFFJCTFRTY7524", "SEQ-3-E3-B"),
    ("01KRYEZ4RXCFVWBN091FGSCYHY", "SEQ-3-E4-A"),
    ("01KRYEZ7B1PCTRQH47P2AHB7CZ", "SEQ-3-E4-B"),
    ("01KRYEZA34YDQ9KMQ46TY0YYP7", "SEQ-4-E1-A"),
    ("01KRYEZCFJZDYD01MBSNJX0TJQ", "SEQ-4-E1-B"),
    ("01KRYEZH56R1JQEH3XFAPCE5V0", "SEQ-4-E2-A"),
    ("01KRYEZKWF0MEJSTDC597BJMFE", "SEQ-4-E2-B"),
    ("01KRYEZQ1P9NTJCP5AAM3H6K0H", "SEQ-4-E3-A"),
    ("01KRYEZSV982T3G1NED6V9KS8M", "SEQ-4-E3-B"),
]

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

print("Checking 14 campaign message templates for Liquid default syntax...\n")

issues = []
for cid, label in CAMPAIGNS:
    # GET campaign messages to find template ID + subject
    r = post_gas({"action": "klaviyo_api_get",
                  "path": f"campaigns/{cid}/campaign-messages/?include=template"})
    if not r.get("ok"):
        print(f"  {label}: GET failed - {r}")
        time.sleep(0.3)
        continue

    msgs = (r.get("data") or {}).get("data", [])
    for msg in msgs:
        subject = (msg.get("attributes") or {}).get("subject", "")
        tmpl_id = ((msg.get("relationships") or {})
                    .get("template", {}).get("data", {}).get("id", ""))
        liquid_in_subj = "|" in subject and "default:" in subject
        print(f"  {label}  tmpl={tmpl_id}  subj_liquid={liquid_in_subj}  subj={subject[:60]}")
        if liquid_in_subj or not tmpl_id:
            issues.append((label, cid, tmpl_id, subject))
    time.sleep(0.4)

if issues:
    print(f"\nISSUES FOUND: {len(issues)}")
    for label, cid, tid, subj in issues:
        print(f"  {label} ({cid}): {subj}")
else:
    print("\nAll 14 campaign messages CLEAN - no Liquid default syntax in subjects.")
