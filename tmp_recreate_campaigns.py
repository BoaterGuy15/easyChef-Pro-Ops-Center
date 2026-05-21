"""
RECREATE 14 SEQ-3/4 CAMPAIGNS — all are in Cancelled state.

Steps per campaign:
  1. DELETE old cancelled campaign
  2. POST new campaign (Draft) with send_strategy.datetime
  3. GET new campaign's message ID
  4. PATCH message: definition.channel=email + content.{subject,preview_text,from_email,from_label}
  5. POST campaign-message-assign-template → assign standalone template
  6. POST campaign-send-jobs → Scheduled

Audience A = UQTdyL (included), excl XJYckK
Audience B = VpgZPZ (included), excl XJYckK
From: hello@easychefpro.com / "easyChef Pro"
"""
import json, urllib.request, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

LIST_A  = "UQTdyL"
LIST_B  = "VpgZPZ"
EXCL    = "XJYckK"
FROM_EMAIL = "hello@easychefpro.com"
FROM_LABEL = "easyChef Pro"

# old_id | variant | standalone_tmpl | label | scheduled_at | subject | preview_text
CAMPAIGNS = [
    ("01KRYG1BMA0TDGCGFP9FXW4A9A","A","UzuXXQ","SEQ-3-E1-A","2026-06-10T13:00:00Z",
     "The $12 that keeps saving dinner",
     "Most weeks, the math doesn't add up. This week it will."),
    ("01KRYEYMTM24KAH1MD46F0B134","B","Tacn3N","SEQ-3-E1-B","2026-06-10T13:00:00Z",
     "It was 6:45 when the call finally ended.",
     "And dinner was still an open question."),
    ("01KRYEYQV2FWE26165ZTM8919T","A","TsGpgR","SEQ-3-E2-A","2026-06-15T13:00:00Z",
     "You bought $94 worth of groceries. And forgot the chicken.",
     "The pantry was full. The plan wasn't."),
    ("01KRYEYTSADV8XWKCGG6F1QPFA","B","RuZZ5A","SEQ-3-E2-B","2026-06-15T13:00:00Z",
     "By the time you figured it out, everyone had moved on.",
     "Wednesday dinners shouldn't feel like a crisis."),
    ("01KRYEYXZ6TDV30WFES05FZBSS","A","XSrXN7","SEQ-3-E3-A","2026-06-20T13:00:00Z",
     "Four cans of chickpeas. Nothing for tonight.",
     "A full pantry that still left you stranded."),
    ("01KRYEZ1EXY7VFFJCTFRTY7524","B","SShAR7","SEQ-3-E3-B","2026-06-20T13:00:00Z",
     "You were going to prep Sunday. You watched TV instead.",
     "The plan was perfect. The follow-through wasn't."),
    ("01KRYEZ4RXCFVWBN091FGSCYHY","A","VERNyE","SEQ-3-E4-A","2026-06-25T13:00:00Z",
     "You needed a few things. The receipt said $214.",
     "The gap between what you planned and what you spent."),
    ("01KRYEZ7B1PCTRQH47P2AHB7CZ","B","YnNKUP","SEQ-3-E4-B","2026-06-25T13:00:00Z",
     "Wednesday again. Already calculating Thursday.",
     "The week resets. The stress doesn't have to."),
    ("01KRYEZA34YDQ9KMQ46TY0YYP7","A","RAevtk","SEQ-4-E1-A","2026-07-02T13:00:00Z",
     "The first week it actually held.",
     "You planned. The week followed."),
    ("01KRYEZCFJZDYD01MBSNJX0TJQ","B","Y4hJxf","SEQ-4-E1-B","2026-07-02T13:00:00Z",
     "Wednesday at 6. Different.",
     "Not scrambling. Just dinner."),
    ("01KRYEZH56R1JQEH3XFAPCE5V0","A","W6BkjY","SEQ-4-E2-A","2026-07-03T13:00:00Z",
     "You knew what was in the pantry. That was the difference.",
     "Information you used to have to guess at."),
    ("01KRYEZKWF0MEJSTDC597BJMFE","B","SXw7eR","SEQ-4-E2-B","2026-07-03T13:00:00Z",
     "A whole week. You only decided dinner once.",
     "One decision. Seven dinners."),
    ("01KRYEZQ1P9NTJCP5AAM3H6K0H","A","Wp7mz3","SEQ-4-E3-A","2026-07-05T13:00:00Z",
     "The math. And the window closing.",
     "Founding member pricing ends soon."),
    ("01KRYEZSV982T3G1NED6V9KS8M","B","RsauRg","SEQ-4-E3-B","2026-07-05T13:00:00Z",
     "The hours. And the window closing.",
     "Founding member pricing ends soon."),
]

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

print("=" * 70)
print("RECREATE 14 SEQ-3/4 CAMPAIGNS (DELETE->CREATE->MSG->TMPL->SCHEDULE)")
print("=" * 70)

results = []

for old_id, variant, tmpl_id, label, sched_at, subject, preview in CAMPAIGNS:
    list_id = LIST_A if variant == "A" else LIST_B
    print(f"\n  {label}  variant={variant}  tmpl={tmpl_id}")
    print(f"    subject:    {subject}")
    print(f"    scheduled:  {sched_at}")

    s1=s2=s3=s4=s5=s6 = False
    new_id = None; msg_id = None

    # Step 1: DELETE old cancelled campaign
    r1 = post_gas({"action": "klaviyo_delete_campaign", "campaign_id": old_id})
    s1 = r1.get("ok", False)
    print(f"    [1] Delete old:      {'OK code='+str(r1.get('code','?'))  if s1 else 'FAIL code='+str(r1.get('code','?'))+' '+str(r1.get('error','?'))[:50]}")
    time.sleep(0.8)

    if not s1:
        results.append((label, False, "delete failed", None))
        continue

    # Step 2: CREATE new campaign (Draft)
    r2 = post_gas({"action": "klaviyo_create_campaign",
                   "name": f"easyChef Pro — {label}",
                   "list_id": list_id,
                   "excl_id": EXCL,
                   "scheduled_at": sched_at})
    s2 = r2.get("ok", False)
    new_id = r2.get("campaign_id")
    print(f"    [2] Create new:      {'OK new_id='+str(new_id) if s2 else 'FAIL code='+str(r2.get('code','?'))+' '+str(r2.get('error','?'))[:50]}")
    time.sleep(1.0)

    if not s2 or not new_id:
        results.append((label, False, "create failed", None))
        continue

    # Step 3: GET campaign message ID (use create response first, fallback to GET)
    msg_id = r2.get("msg_id")  # may be set from create response
    if msg_id:
        s3 = True
        print(f"    [3] Get msg_id:      OK from create response msg_id={msg_id}")
    else:
        r3 = post_gas({"action": "klaviyo_get_campaign_messages", "campaign_id": new_id})
        s3 = r3.get("ok", False)
        msg_id = r3.get("msg_id")
        print(f"    [3] Get msg_id:      {'OK msg_id='+str(msg_id) if s3 and msg_id else 'FAIL code='+str(r3.get('code','?'))+' '+str(r3.get('error','?'))[:50]}")
        time.sleep(0.5)

    if not msg_id:
        results.append((label, False, "no msg_id", new_id))
        continue

    # Step 4: PATCH message subject + preview + from
    r4 = post_gas({"action": "klaviyo_update_campaign_subject",
                   "msg_id": msg_id,
                   "subject": subject,
                   "preview_text": preview,
                   "from_email": FROM_EMAIL,
                   "from_label": FROM_LABEL})
    s4 = r4.get("ok", False)
    print(f"    [4] Patch subject:   {'OK' if s4 else 'FAIL code='+str(r4.get('code','?'))+' '+str(r4.get('error','?'))[:60]}")
    time.sleep(0.5)

    # Step 5: Assign standalone template
    r5 = post_gas({"action": "klaviyo_assign_campaign_template",
                   "msg_id": msg_id,
                   "template_id": tmpl_id})
    s5 = r5.get("ok", False)
    print(f"    [5] Assign template: {'OK' if s5 else 'FAIL code='+str(r5.get('code','?'))+' '+str(r5.get('error','?'))[:60]}")
    time.sleep(0.5)

    # Step 6: POST send-job → Scheduled
    r6 = post_gas({"action": "klaviyo_post_send_job", "campaign_id": new_id})
    s6 = r6.get("ok", False)
    print(f"    [6] Schedule:        {'OK code='+str(r6.get('code','?')) if s6 else 'FAIL code='+str(r6.get('code','?'))+' '+str(r6.get('error','?'))[:60]}")
    time.sleep(0.8)

    ok = s1 and s2 and s3 and s4 and s5 and s6
    results.append((label, ok, f"1={s1} 2={s2} 3={s3} 4={s4} 5={s5} 6={s6}", new_id))

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
ok_list = [(l, nid) for l, ok, _, nid in results if ok]
fail_list = [(l, info, nid) for l, ok, info, nid in results if not ok]
print(f"All 6 steps OK:  {len(ok_list)}/14")
for l, nid in ok_list:
    print(f"  {l}: new_id={nid}")
print(f"\nFailed:          {len(fail_list)}/14")
for l, info, nid in fail_list:
    print(f"  {l}: {info}  new_id={nid}")

print("\nNEW CAMPAIGN IDS (update CLAUDE.md SYSTEM IDS table):")
for l, ok, _, nid in results:
    print(f"  {l}: {nid or 'N/A'}")
