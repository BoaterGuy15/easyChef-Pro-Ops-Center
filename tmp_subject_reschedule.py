"""
UNSCHEDULE → UPDATE SUBJECT → RESCHEDULE — 14 SEQ-3/4 campaigns.

Steps per campaign:
  1. klaviyo_cancel_send_job   — DELETE send-job → campaign reverts to Draft
  2. klaviyo_set_send_date     — PATCH campaign send_strategy.datetime (sets explicit date)
  3. klaviyo_update_campaign_subject — PATCH campaign-message subject (works while Draft)
  4. klaviyo_post_send_job     — POST send-job → campaign goes back to Scheduled

Send times: 9am EDT = 13:00 UTC
"""
import json, urllib.request, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

# campaign_id | msg_id | label | scheduled_at (UTC) | new subject
CAMPAIGNS = [
    ("01KRYG1BMA0TDGCGFP9FXW4A9A", "01KRYG1BMMYJ4Z5H7Y2PQZHR4P", "SEQ-3-E1-A",
     "2026-06-10T13:00:00Z", "The $12 that keeps saving dinner"),
    ("01KRYEYMTM24KAH1MD46F0B134", "01KRYEYMTXAKKY8MK7D22EYQVX", "SEQ-3-E1-B",
     "2026-06-10T13:00:00Z", "It was 6:45 when the call finally ended."),
    ("01KRYEYQV2FWE26165ZTM8919T", "01KRYEYQVAKPMNWE0KD5W19EPE", "SEQ-3-E2-A",
     "2026-06-15T13:00:00Z", "You bought $94 worth of groceries. And forgot the chicken."),
    ("01KRYEYTSADV8XWKCGG6F1QPFA", "01KRYEYTSKTFK97NX3KXKX5MXR", "SEQ-3-E2-B",
     "2026-06-15T13:00:00Z", "By the time you figured it out, everyone had moved on."),
    ("01KRYEYXZ6TDV30WFES05FZBSS", "01KRYEYXZE23HMNDN9YABJW8H2", "SEQ-3-E3-A",
     "2026-06-20T13:00:00Z", "Four cans of chickpeas. Nothing for tonight."),
    ("01KRYEZ1EXY7VFFJCTFRTY7524", "01KRYEZ1F4BC9K3JQM78T0EPHR", "SEQ-3-E3-B",
     "2026-06-20T13:00:00Z", "You were going to prep Sunday. You watched TV instead."),
    ("01KRYEZ4RXCFVWBN091FGSCYHY", "01KRYEZ4S3QNV9RKT2Q3701WP2", "SEQ-3-E4-A",
     "2026-06-25T13:00:00Z", "You needed a few things. The receipt said $214."),
    ("01KRYEZ7B1PCTRQH47P2AHB7CZ", "01KRYEZ7BBXTBR4KQQV5E4X7DV", "SEQ-3-E4-B",
     "2026-06-25T13:00:00Z", "Wednesday again. Already calculating Thursday."),
    ("01KRYEZA34YDQ9KMQ46TY0YYP7", "01KRYEZA3DMJ2BP56QSJY2GTSM", "SEQ-4-E1-A",
     "2026-07-02T13:00:00Z", "The first week it actually held."),
    ("01KRYEZCFJZDYD01MBSNJX0TJQ", "01KRYEZCFT6HFQJ0PK76741MMJ", "SEQ-4-E1-B",
     "2026-07-02T13:00:00Z", "Wednesday at 6. Different."),
    ("01KRYEZH56R1JQEH3XFAPCE5V0", "01KRYEZH5F81J482Y7SMD2KDB7", "SEQ-4-E2-A",
     "2026-07-03T13:00:00Z", "You knew what was in the pantry. That was the difference."),
    ("01KRYEZKWF0MEJSTDC597BJMFE", "01KRYEZKWMGV18CHB7ZPYYVTB1", "SEQ-4-E2-B",
     "2026-07-03T13:00:00Z", "A whole week. You only decided dinner once."),
    ("01KRYEZQ1P9NTJCP5AAM3H6K0H", "01KRYEZQ20DJZ26YNVVGS962RV", "SEQ-4-E3-A",
     "2026-07-05T13:00:00Z", "The math. And the window closing."),
    ("01KRYEZSV982T3G1NED6V9KS8M", "01KRYEZSVKTK4CXZ7PJE5B4SA4", "SEQ-4-E3-B",
     "2026-07-05T13:00:00Z", "The hours. And the window closing."),
]

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

print("=" * 70)
print("UNSCHEDULE -> UPDATE SUBJECT -> RESCHEDULE (14 campaigns)")
print("=" * 70)

ok_all = []; partial = []; failed = []

for camp_id, msg_id, label, sched_at, subject in CAMPAIGNS:
    print(f"\n  {label}")
    print(f"    subject:  {subject[:70]}")
    print(f"    send_at:  {sched_at}")

    s1 = s2 = s3 = s4 = False

    # Step 1: Cancel send-job
    r1 = post_gas({"action": "klaviyo_cancel_send_job", "campaign_id": camp_id})
    s1 = r1.get("ok", False)
    print(f"    [1] Cancel send-job:   {'OK ('+r1.get('method','')+' '+str(r1.get('code','?'))+')' if s1 else 'FAIL code='+str(r1.get('code','?'))+' '+str(r1.get('error','?'))[:40]}")
    time.sleep(1.0)  # wait for status to propagate

    # Step 2: Set send date explicitly
    r2 = post_gas({"action": "klaviyo_set_send_date", "campaign_id": camp_id, "scheduled_at": sched_at})
    s2 = r2.get("ok", False)
    print(f"    [2] Set send date:     {'OK' if s2 else 'FAIL code='+str(r2.get('code','?'))+' '+str(r2.get('error','?'))[:40]}")
    time.sleep(0.5)

    # Step 3: Update subject (campaign must be Draft)
    r3 = post_gas({"action": "klaviyo_update_campaign_subject", "msg_id": msg_id, "subject": subject})
    s3 = r3.get("ok", False)
    print(f"    [3] Update subject:    {'OK' if s3 else 'FAIL code='+str(r3.get('code','?'))+' '+str(r3.get('error','?'))[:40]}")
    time.sleep(0.5)

    # Step 4: Post send-job → reschedule
    r4 = post_gas({"action": "klaviyo_post_send_job", "campaign_id": camp_id})
    s4 = r4.get("ok", False)
    print(f"    [4] Reschedule:        {'OK code='+str(r4.get('code','?')) if s4 else 'FAIL code='+str(r4.get('code','?'))+' '+str(r4.get('error','?'))[:40]}")
    time.sleep(0.8)

    if s1 and s2 and s3 and s4:
        ok_all.append(label)
    elif any([s1, s2, s3, s4]):
        partial.append((label, f"1={s1} 2={s2} 3={s3} 4={s4}"))
    else:
        failed.append(label)

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
print(f"All 4 steps OK:  {len(ok_all)}/14  {ok_all}")
print(f"Partial:         {len(partial)}/14")
for lbl, info in partial:
    print(f"  {lbl}: {info}")
print(f"Failed (0/4):    {len(failed)}/14  {failed}")
