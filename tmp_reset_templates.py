"""
TEMPLATE RESET — Push approved copy into the templates actually wired to flows/campaigns.

Strategy:
  - 14 campaigns (SEQ-3/4): discover template ID, push correct HTML + subject
  - Flow A (8 steps): try PATCH on each step template; expect 404 for flow-assigned
  - Flow B (8 steps): same
  - Alpha (6 steps): same
  - Report what worked and what needs Klaviyo UI

DO NOT create new templates. Update existing ones only.
"""
import json, urllib.request, os, re, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email-templates")

# ── 14 Campaigns (SEQ-3 + SEQ-4) ──────────────────────────────────────────────
CAMPAIGNS = [
    ("01KRYG1BMA0TDGCGFP9FXW4A9A", "SEQ-3-E1-A", "SEQ-3-E1-A_v2.html"),
    ("01KRYEYMTM24KAH1MD46F0B134", "SEQ-3-E1-B", "SEQ-3-E1-B_v2.html"),
    ("01KRYEYQV2FWE26165ZTM8919T", "SEQ-3-E2-A", "SEQ-3-E2-A_v2.html"),
    ("01KRYEYTSADV8XWKCGG6F1QPFA", "SEQ-3-E2-B", "SEQ-3-E2-B_v2.html"),
    ("01KRYEYXZ6TDV30WFES05FZBSS", "SEQ-3-E3-A", "SEQ-3-E3-A_v2.html"),
    ("01KRYEZ1EXY7VFFJCTFRTY7524", "SEQ-3-E3-B", "SEQ-3-E3-B_v2.html"),
    ("01KRYEZ4RXCFVWBN091FGSCYHY", "SEQ-3-E4-A", "SEQ-3-E4-A_v2.html"),
    ("01KRYEZ7B1PCTRQH47P2AHB7CZ", "SEQ-3-E4-B", "SEQ-3-E4-B_v2.html"),
    ("01KRYEZA34YDQ9KMQ46TY0YYP7", "SEQ-4-E1-A", "SEQ-4-E1-A_v2.html"),
    ("01KRYEZCFJZDYD01MBSNJX0TJQ", "SEQ-4-E1-B", "SEQ-4-E1-B_v2.html"),
    ("01KRYEZH56R1JQEH3XFAPCE5V0", "SEQ-4-E2-A", "SEQ-4-E2-A_v2.html"),
    ("01KRYEZKWF0MEJSTDC597BJMFE", "SEQ-4-E2-B", "SEQ-4-E2-B_v2.html"),
    ("01KRYEZQ1P9NTJCP5AAM3H6K0H", "SEQ-4-E3-A", "SEQ-4-E3-A_v2.html"),
    ("01KRYEZSV982T3G1NED6V9KS8M", "SEQ-4-E3-B", "SEQ-4-E3-B_v2.html"),
]

# ── Flow step template IDs (current wired templates) ──────────────────────────
# msg_id -> template_id -> local HTML file
FLOW_A = [
    ("T3y6Qj", "TABmTe", "SEQ-1-E1-A_v3.html"),
    ("UcWVJb", "VZnPeE", "SEQ-1-E2-A_v2.html"),
    ("XMNGK9", "TzVT7y", "SEQ-1-E3-A_v2.html"),
    ("RauWYs", "UKkHZq", "SEQ-2-E1-A_v2.html"),
    ("Ykcv2n", "SjTMSi", "SEQ-2-E2-A_v2.html"),
    ("U8jFnM", "XHbspK", "SEQ-2-E3-A_v2.html"),
    ("VhJwgD", "X6apM8", "SEQ-2-E4-A_v2.html"),
    ("SShA9x", "UEHtE2", "SEQ-2-E5-A_v2.html"),
]
FLOW_B = [
    ("WZx9rJ", "QZeshE", "SEQ-1-E1-B_v2.html"),
    ("UA6diC", "Wnw6P7", "SEQ-1-E2-B_v2.html"),
    ("RxCeyT", "Tk485n", "SEQ-1-E3-B_v2.html"),
    ("SH35sK", "UvsWXe", "SEQ-2-E1-B_v2.html"),
    ("WhSQtH", "Y6iHYc", "SEQ-2-E2-B_v2.html"),
    ("S622Q8", "TSrUkB", "SEQ-2-E3-B_v2.html"),
    ("XthFmz", "RsYYdv", "SEQ-2-E4-B_v2.html"),
    ("WQgCJW", "QPXVAS", "SEQ-2-E5-B_v2.html"),
]
FLOW_ALPHA = [
    ("SLWzHN", "Uznteh", "ALPHA-E1_v1.html"),
    ("S9Vx7b", "VJMi89", "ALPHA-E2_v1.html"),
    ("RwUuuy", "TjkmZ3", "ALPHA-E3_v1.html"),
    ("SGjjnq", "Whb6pn", "ALPHA-E4_v1.html"),
    ("VEa3LK", "XszVhe", "ALPHA-E5_v1.html"),
    ("V38Za8", "WPySEB", "ALPHA-E6_v1.html"),
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

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1: CAMPAIGNS (14)
# ─────────────────────────────────────────────────────────────────────────────
print("=" * 65)
print("PHASE 1 — UPDATE CAMPAIGN TEMPLATES + SUBJECTS (14)")
print("=" * 65)

cam_ok = []; cam_fail = []
for cid, label, fname in CAMPAIGNS:
    html = read_html(fname)
    subject = extract_subject(html)
    if not subject:
        print(f"\n  {label}: SUBJECT NOT FOUND in {fname} — skipping")
        cam_fail.append((label, "NO SUBJECT"))
        continue

    # Get campaign's wired template ID + message ID
    r = post_gas({"action": "klaviyo_get_campaign_template", "campaign_id": cid})
    if not r.get("ok"):
        print(f"\n  {label}: GET campaign template failed — {r.get('error','?')}")
        cam_fail.append((label, f"GET failed: {r.get('error','?')}"))
        time.sleep(0.4)
        continue

    tid    = r.get("template_id", "")
    msg_id = r.get("msg_id", "")
    old_subj = r.get("subject", "")
    print(f"\n  {label}  tmpl={tid}  msg={msg_id}")
    print(f"    current subject: {old_subj[:70]}")
    print(f"    new subject:     {subject[:70]}")

    if not tid:
        print(f"    WARN: no template_id on campaign message — skipping HTML update")
    else:
        # Update template HTML
        r2 = post_gas({"action": "klaviyo_update_template", "template_id": tid, "html": html})
        print(f"    HTML update ({tid}): {'OK' if r2.get('ok') else 'FAIL: '+str(r2.get('error','?'))[:60]}")

    # Update subject line
    if msg_id:
        r3 = post_gas({"action": "klaviyo_update_campaign_subject", "msg_id": msg_id, "subject": subject})
        print(f"    Subject update:  {'OK' if r3.get('ok') else 'FAIL code='+str(r3.get('code','?'))+' '+str(r3.get('error','?'))[:50]}")
        if r2.get("ok") and r3.get("ok"):
            cam_ok.append(label)
        else:
            cam_fail.append((label, "partial"))
    else:
        cam_fail.append((label, "no msg_id"))

    time.sleep(0.6)

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2: FLOW STEPS (try PATCH; expect 404 for flow-assigned)
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "=" * 65)
print("PHASE 2 — TRY FLOW STEP TEMPLATE UPDATES (expect 404 blocks)")
print("=" * 65)

flow_ok = []; flow_blocked = []
for flow_name, steps in [("Flow A", FLOW_A), ("Flow B", FLOW_B), ("Alpha", FLOW_ALPHA)]:
    print(f"\n  -- {flow_name} --")
    for msg_id, tid, fname in steps:
        html = read_html(fname)
        r = post_gas({"action": "klaviyo_update_template", "template_id": tid, "html": html})
        if r.get("ok"):
            print(f"  {tid} ({fname}): OK")
            flow_ok.append(f"{flow_name} {tid}")
        else:
            code = r.get("code") or "?"
            print(f"  {tid} ({fname}): BLOCKED code={code}")
            flow_blocked.append(f"{flow_name} step {tid}")
        time.sleep(0.5)

# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "=" * 65)
print("SUMMARY")
print("=" * 65)
print(f"\nCampaigns updated (HTML + subject): {len(cam_ok)}/14")
print(f"Campaigns failed:                  {len(cam_fail)}/14")
for label, reason in cam_fail:
    print(f"  - {label}: {reason}")

print(f"\nFlow steps updated via API:         {len(flow_ok)}")
print(f"Flow steps BLOCKED (need UI):       {len(flow_blocked)}")
if flow_blocked:
    print("\n  These steps need Klaviyo UI -> Edit email -> Change template:")
    for s in flow_blocked:
        print(f"    {s}")

print("\nPhase 3 (standalone cleanup) — list of 28 new standalone templates")
print("to delete is available in tmp_standalone_ids.txt after running")
print("python tmp_list_standalone.py")
