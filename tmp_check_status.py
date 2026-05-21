"""Quick check: try cancel on each campaign to probe actual state."""
import json, urllib.request, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

CAMPAIGNS = [
    ("01KRYG1BMA0TDGCGFP9FXW4A9A","SEQ-3-E1-A"),
    ("01KRYEYMTM24KAH1MD46F0B134","SEQ-3-E1-B"),
    ("01KRYEYQV2FWE26165ZTM8919T","SEQ-3-E2-A"),
    ("01KRYEYTSADV8XWKCGG6F1QPFA","SEQ-3-E2-B"),
    ("01KRYEYXZ6TDV30WFES05FZBSS","SEQ-3-E3-A"),
    ("01KRYEZ1EXY7VFFJCTFRTY7524","SEQ-3-E3-B"),
    ("01KRYEZ4RXCFVWBN091FGSCYHY","SEQ-3-E4-A"),
    ("01KRYEZ7B1PCTRQH47P2AHB7CZ","SEQ-3-E4-B"),
    ("01KRYEZA34YDQ9KMQ46TY0YYP7","SEQ-4-E1-A"),
    ("01KRYEZCFJZDYD01MBSNJX0TJQ","SEQ-4-E1-B"),
    ("01KRYEZH56R1JQEH3XFAPCE5V0","SEQ-4-E2-A"),
    ("01KRYEZKWF0MEJSTDC597BJMFE","SEQ-4-E2-B"),
    ("01KRYEZQ1P9NTJCP5AAM3H6K0H","SEQ-4-E3-A"),
    ("01KRYEZSV982T3G1NED6V9KS8M","SEQ-4-E3-B"),
]

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

print("Probing campaign states (cancel attempt = safe status probe):\n")
cancelled = []; scheduled = []; other = []

for cid, lbl in CAMPAIGNS:
    r = post_gas({"action": "klaviyo_cancel_send_job", "campaign_id": cid})
    err = str(r.get("error",""))
    if "already in a canceled" in err:
        state = "CANCELLED"
        cancelled.append(lbl)
    elif r.get("ok"):
        state = "WAS_SCHEDULED (now cancelled by probe - BAD)"
        other.append(lbl)
    elif r.get("code") == 400:
        state = "SCHEDULED (cancel blocked)"
        scheduled.append(lbl)
    else:
        state = f"UNKNOWN code={r.get('code')} {err[:40]}"
        other.append(lbl)
    print(f"  {lbl}: {state}")
    time.sleep(0.6)

print(f"\nSummary:")
print(f"  Cancelled:  {len(cancelled)} {cancelled}")
print(f"  Scheduled:  {len(scheduled)} {scheduled}")
print(f"  Other:      {len(other)} {other}")
