"""
Write approved SEQ-1 copy to EmailSequences tab + rebuild HTML + update Klaviyo standalone templates.
"""
import json, urllib.request, os, re, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email-templates")

TEMPLATE_IDS = {
    "EC-2026-001-SEQ-1-E1-A": "UxsJ3U",
    "EC-2026-001-SEQ-1-E1-B": "RmZJyL",
    "EC-2026-001-SEQ-1-E2-A": "WqLmGD",
    "EC-2026-001-SEQ-1-E2-B": "VxRy3Q",
    "EC-2026-001-SEQ-1-E3-A": "TqUD9M",
    "EC-2026-001-SEQ-1-E3-B": "W8RAvW",
}

# ── Approved SEQ-1 copy (Taylor approved) ────────────────────────────────────
# Fields: subject_line, preview_text, scene_headline, scene_subtext,
#         h1_line1, h1_line2, p1, p2, solve, cta_headline, ps

APPROVED = {
"EC-2026-001-SEQ-1-E1-A": {
    "subject_line":    "That $47 DoorDash charge. You already paid for that dinner.",
    "preview_text":    "The chicken is still in your fridge.",
    "scene_headline":  "Sunday. $180 at the grocery store. A real plan.",
    "scene_subtext":   "Wednesday 6:22 PM. Kids asking. You open DoorDash. The chicken thighs are still in the fridge.",
    "h1":              "You didn't waste $47 on DoorDash.<br>You wasted the $180 that had nowhere to go.",
    "p1":              "The groceries were right. The intention was right. There was just nothing to connect Sunday's plan to Wednesday's fridge. No bridge between what you bought and what actually became dinner.",
    "p2":              "That is what $111 a month looks like. Not bad decisions. Not overspending. Just a gap that has never had a system to close it.",
    "solve":           "easyChef Pro is that system. It closes the loop between what you buy and what actually becomes dinner — so Wednesday looks like the plan you made on Sunday.",
    "cta_headline":    "Stop the Sunday → Wednesday leak.<br>Permanently.",
    "cta_lp":          "waitlist-a",
    "ps":              "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Every week you wait is another DoorDash Wednesday.",
    "icp":             "super_mom_money",
},
"EC-2026-001-SEQ-1-E1-B": {
    "subject_line":    "You had it figured out by Sunday.",
    "preview_text":    "By Tuesday, the plan had already dissolved.",
    "scene_headline":  "You had it figured out by Sunday.",
    "scene_subtext":   "By Tuesday night the chicken was still in the fridge, the week had moved on, and the plan had gone somewhere no one can find it.",
    "h1":              "You didn't lose track of the plan.<br>The plan had no system to survive Tuesday.",
    "p1":              "You do this every week. Sunday feels organized. Then something shifts — a late pickup, a meeting that ran long, a kid who decided they don't eat that anymore. The plan you made in your head had nowhere to anchor. So it dissolved.",
    "p2":              "This is not disorganization. It is a missing system. The plan existed. It just had no way to survive contact with a real week. And so you end up back at 6:30 carrying all of it in your head again.",
    "solve":           "easyChef Pro holds the plan so the week can't dissolve it. Sunday's intention becomes Wednesday's dinner — because the system carries it between the two.",
    "cta_headline":    "The week can't break<br>what the system holds.",
    "cta_lp":          "waitlist-b",
    "ps":              "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Wednesday 6:30 doesn’t have to be a permanent feature of your week.",
    "icp":             "super_mom_time",
},
"EC-2026-001-SEQ-1-E2-A": {
    "subject_line":    "The cilantro at the back of your fridge.",
    "preview_text":    "It's been there since Sunday. It never became anything.",
    "scene_headline":  "The cilantro at the back of your fridge.",
    "scene_subtext":   "It's been there since Sunday. It never made it to dinner. It won't.",
    "h1":              "You didn't waste $3 on cilantro.<br>You wasted the dinner it was supposed to anchor.",
    "p1":              "It wasn't just the cilantro. There was also the lime. The scallions you used two of. The Greek yogurt that was going to be something until Tuesday decided otherwise. Each one was a real intention that had nowhere to land.",
    "p2":              "This is how $111 a month disappears. Not one big waste. A hundred small ones. Each ingredient bought with a dinner in mind that never made it to the table. The gap between the intention and the dinner is where the money goes.",
    "solve":           "easyChef Pro closes that gap. What you buy on Sunday has a path to Wednesday's table — because the system connects them.",
    "cta_headline":    "The cilantro makes it<br>to dinner this time.",
    "cta_lp":          "waitlist-a",
    "ps":              "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Every week you wait is another cilantro.",
    "icp":             "super_mom_money",
},
"EC-2026-001-SEQ-1-E2-B": {
    "subject_line":    "5:52 PM. Fridge open. Running the inventory.",
    "preview_text":    "The decision hasn't started yet. You're still just auditing.",
    "scene_headline":  "5:52 PM. Fridge open. Running the inventory.",
    "scene_subtext":   "Chicken — still good, probably. Spinach — check the date. Pasta — always pasta. The decision hasn't started yet. You're still just auditing.",
    "h1":              "You're not deciding what's for dinner yet.<br>You're still figuring out if you can.",
    "p1":              "This scan happens every night. You open the fridge. You look at what's there. Mental calculation — expiration dates, what you bought this week, what everyone will actually eat. Only after all of that can the real question begin.",
    "p2":              "Running a nightly inventory of your own fridge is a job. An invisible one. It adds 10 minutes of decision weight to every evening, every week, without ever appearing on a to-do list.",
    "solve":           "easyChef Pro runs the inventory so you don't have to. You open the app. Dinner is already proposed from what you have. The scan is done.",
    "cta_headline":    "The fridge scan<br>already done.",
    "cta_lp":          "waitlist-b",
    "ps":              "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Wednesday 6:30 doesn’t have to be a permanent feature of your week.",
    "icp":             "super_mom_time",
},
"EC-2026-001-SEQ-1-E3-A": {
    "subject_line":    "Spaghetti. Tacos. The chicken thing.",
    "preview_text":    "You've made them so many times you don't need a recipe. They're not bad. They're just all there is.",
    "scene_headline":  "Spaghetti. Tacos. The chicken thing.",
    "scene_subtext":   "You've made them so many times you don't need a recipe. They're fine. They're just everything.",
    "h1":              "You're not stuck in the rotation because you lack ideas.<br>You're stuck because trying something new has a real cost when it fails.",
    "p1":              "New recipes mean ingredients you might not use. Ingredients that might expire before you try again. The last time you tried something new it didn't work and you ended up ordering. So the rotation stays. Safe. Reliable. Getting narrower every year.",
    "p2":              "This is what the $111 erodes over time. Not just the money — the variety. The meals you meant to make. The Sunday experiments that never happened because the risk wasn't worth it when the chicken was already there.",
    "solve":           "easyChef Pro expands the rotation without expanding the risk. New dinners built from what you already bought — so the experiment doesn't have to cost extra.",
    "cta_headline":    "Something new tonight.<br>Nothing wasted.",
    "cta_lp":          "waitlist-a",
    "ps":              "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. The rotation can get wider.",
    "icp":             "super_mom_money",
},
"EC-2026-001-SEQ-1-E3-B": {
    "subject_line":    "Saturday night. Already thinking about Wednesday.",
    "preview_text":    "Before the week starts, you're already behind on it.",
    "scene_headline":  "Saturday night. Already thinking about Wednesday.",
    "scene_subtext":   "The kids are in bed. You have five minutes. And somehow your brain went straight to next week's dinners.",
    "h1":              "You're not anxious because you're a worrier.<br>You're anxious because the system runs on you.",
    "p1":              "The meal decision lives in your head 24 hours a day, seven days a week. It doesn't clock out on Saturday. You think about it in the checkout line. In the car. At 11pm when you should be asleep. Not because you're obsessive — because someone has to hold it, and it's always been you.",
    "p2":              "This is what 260 hours a year looks like in practice. Not one long planning session. Five minutes here. Ten minutes there. The low-grade background hum of a system that has always run on your mental energy.",
    "solve":           "easyChef Pro takes it off your mental tab. The week has a plan before Saturday night. You stop thinking about Wednesday on Saturday.",
    "cta_headline":    "Saturday night back.<br>The week already handled.",
    "cta_lp":          "waitlist-b",
    "ps":              "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Wednesday 6:30 doesn’t have to be a permanent feature of your week.",
    "icp":             "super_mom_time",
},
}

LOSS_BLOCK = "The problem was never you. The system was disconnected."

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode("utf-8"))

def read_base(filename):
    path = os.path.join(TEMPLATE_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def build_html_from_copy(c, dl_id, asset_id, send_day):
    """Build HTML using base template and approved copy dict."""
    is_money  = c["icp"] == "super_mom_money"
    is_base_a = is_money
    short_id  = asset_id.replace("EC-2026-001-", "")

    # Parts of short_id: SEQ-1-E2-A -> SEQ-1 * E2-A
    parts = short_id.split("-", 2)
    seq_display = f"{parts[0]}-{parts[1]} * {parts[2]}" if len(parts) == 3 else short_id

    lp_path = f"/lp/{c['cta_lp']}"
    cta_url = (
        f"https://launch.easychefpro.com{lp_path}"
        f"?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001"
        f"&utm_content={dl_id}&utm_term={short_id}"
    )

    base_html = read_base("SEQ-1-E1-A_v3.html" if is_base_a else "SEQ-2-E1-B_v2.html")
    html = base_html

    if is_base_a:
        html = html.replace(
            "<title>SEQ-1 \xb7 E1-A \xb7 That $47 DoorDash charge. You already paid for that dinner.</title>",
            f"<title>{seq_display} \xb7 {c['subject_line']}</title>"
        )
        html = html.replace(
            "<!-- ── PREHEADER ── single scene: Sunday groceries → Wednesday DoorDash -->",
            f"<!-- ── PREHEADER ── {c['scene_headline']} -->"
        )
        html = html.replace(
            "The chicken is still in your fridge.",
            c["preview_text"]
        )
        html = html.replace(
            "     SCENE: Sunday groceries → Wednesday DoorDash\n     ICP: super_mom_money",
            f"     SCENE: {c['scene_headline']}\n     ICP: {c['icp']}"
        )
        html = html.replace(
            "         Sunday groceries → Wednesday DoorDash\n         Open in the middle of the moment.",
            f"         {c['scene_headline']}\n         Open in the middle of the moment."
        )
        html = html.replace(
            "\n            Sunday. $180 at the grocery store. A real plan.\n          ",
            f"\n            {c['scene_headline']}\n          "
        )
        html = html.replace(
            "\n            Wednesday 6:22 PM. Kids asking. You open DoorDash. The chicken thighs are still in the fridge.\n          ",
            f"\n            {c['scene_subtext']}\n          "
        )
        html = html.replace(
            "\n          You didn't waste $47 on DoorDash.<br>You wasted the $180 that had nowhere to go.\n        ",
            f"\n          {c['h1']}\n        "
        )
        html = html.replace(
            "\n          The groceries were right. The intention was right. There was just nothing to connect Sunday's plan to Wednesday's fridge. No bridge between what you bought and what actually became dinner.\n        ",
            f"\n          {c['p1']}\n        "
        )
        html = html.replace(
            "\n          That is what <strong style=\"color:#000000;font-weight:600;\">$111 a month</strong> looks like. Not bad decisions. Not overspending. Just a gap that has never had a system to close it.\n        ",
            f"\n          {c['p2']}\n        "
        )
        html = html.replace(
            "\n          easyChef Pro is that system. It closes the loop between what you buy and what actually becomes dinner — so Wednesday looks like the plan you made on Sunday.\n        ",
            f"\n          {c['solve']}\n        "
        )
        html = html.replace(
            "\n          Stop the Sunday → Wednesday leak.<br>Permanently.\n        ",
            f"\n          {c['cta_headline']}\n        "
        )
        html = html.replace(
            "https://launch.easychefpro.com/lp/waitlist-a?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-EM-0036_seq1_e1a&utm_term=SEQ-1-E1-A",
            cta_url
        )
        html = html.replace(
            "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Every week you wait is another DoorDash Wednesday.",
            c["ps"]
        )
    else:
        html = html.replace(
            "<title>SEQ-2 \xb7 E1-B \xb7 You planned Sunday. It was gone by Tuesday.</title>",
            f"<title>{seq_display} \xb7 {c['subject_line']}</title>"
        )
        html = html.replace(
            "<!-- ── PREHEADER ── single scene: Sunday plan → Wednesday wall -->",
            f"<!-- ── PREHEADER ── {c['scene_headline']} -->"
        )
        html = html.replace(
            "The 6:30 wall isn’t about time. The plan just had nowhere to live.",
            c["preview_text"]
        )
        html = html.replace(
            "     SCENE: Sunday plan → Wednesday 6:30 wall\n     ICP: super_mom_time",
            f"     SCENE: {c['scene_headline']}\n     ICP: {c['icp']}"
        )
        html = html.replace(
            "         Sunday plan → Wednesday 6:28 PM wall\n         Open in the middle of the moment.",
            f"         {c['scene_headline']}\n         Open in the middle of the moment."
        )
        html = html.replace(
            "\n            Sunday evening. Five meals mapped out. It felt good.\n          ",
            f"\n            {c['scene_headline']}\n          "
        )
        html = html.replace(
            "\n            Wednesday 6:28 PM. Full fridge. Nothing started. The plan you made three days ago is completely gone.\n          ",
            f"\n            {c['scene_subtext']}\n          "
        )
        html = html.replace(
            "\n          You didn't fail the plan.<br>The plan had nowhere to live.\n        ",
            f"\n          {c['h1']}\n        "
        )
        html = html.replace(
            "\n          It lived in your head. Between Sunday and Wednesday it ran into real life: a late meeting, a kid who changed their mind, a day that didn't go the way you expected. And the plan, which had no system to hold it, quietly disappeared.\n        ",
            f"\n          {c['p1']}\n        "
        )
        html = html.replace(
            "\n          So you ended up back at the fridge at 6:28 carrying all of it in your head. Again. Not because you didn't try. Because the system was disconnected.\n        ",
            f"\n          {c['p2']}\n        "
        )
        html = html.replace(
            "\n          easyChef Pro carries the plan so you don't have to. Sunday's intention becomes Wednesday's dinner — because the system holds it between the two.\n        ",
            f"\n          {c['solve']}\n        "
        )
        html = html.replace(
            "\n          Dinner decided.<br>Before the wall hits.\n        ",
            f"\n          {c['cta_headline']}\n        "
        )
        html = html.replace(
            "https://launch.easychefpro.com/lp/waitlist-b?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-EM-0043&utm_term=SEQ-2-E1-B",
            cta_url
        )
        html = html.replace(
            "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Wednesday 6:30 doesn’t have to be a permanent feature of your week.",
            c["ps"]
        )

    # Update metadata block
    variant_letter = "A" if is_money else "B"
    flow_id = "XfqUtU (Flow A)" if is_money else "XCyc4m (Flow B)"
    metadata = f"""<!--
================================================================
  ASSET METADATA
  {{{{ASSET_ID}}}}      {asset_id}
  {{{{KLAVIYO_ID}}}}    {TEMPLATE_IDS[asset_id]} (standalone -- wire to {flow_id} in Klaviyo UI)
  {{{{DL_ID}}}}         {dl_id}
  {{{{ICP}}}}           {c['icp']}
  {{{{VARIANT}}}}       {variant_letter}
  {{{{SEQUENCE}}}}      {seq_display}
  {{{{FLOW}}}}          {flow_id}
  {{{{SEND_DAY}}}}      Day {send_day}
  {{{{SUBJECT}}}}       {c['subject_line']}
  {{{{PREVIEW}}}}       {c['preview_text']}
  {{{{SCENE}}}}         {c['scene_headline']} (EMAIL_LP_RELATIONSHIP_001)
  {{{{RULE}}}}          EMAIL_LP_RELATIONSHIP_001 -- single scene, not LP retell
  {{{{STATUS}}}}        APPROVED -- scene-based -- all 5 governance rules pass
  {{{{VERSION}}}}       v2 -- Taylor approved May 20 2026 -- full governance rewrite
================================================================
-->"""
    html = re.sub(
        r'<!--\n={64}\n  ASSET METADATA.*?={64}\n-->',
        metadata,
        html,
        flags=re.DOTALL
    )

    return html


def main():
    print("Reading EmailSequences...")
    result = post_gas({"action": "email_sequences_read", "campaign_id": "EC-2026-001"})
    seqs   = result.get("sequences", [])
    seq_map = {s["id"]: s for s in seqs}

    print(f"\n{'='*60}")
    print("STEP 1: Write approved copy to EmailSequences tab")
    print("="*60)

    sheet_ok = 0
    sheet_fail = 0
    for sid, copy in APPROVED.items():
        seq = dict(seq_map.get(sid, {"id": sid}))
        seq["subject_line"]   = copy["subject_line"]
        seq["preview_text"]   = copy["preview_text"]
        seq["body_hook"]      = copy["scene_headline"] + " " + copy["scene_subtext"]
        seq["body_problem"]   = copy["p1"]
        seq["body_agitate"]   = copy["p2"]
        seq["body_solve"]     = copy["solve"]
        seq["body_cta"]       = copy["cta_headline"].replace("<br>", " ")
        seq["status"]         = "APPROVED"
        seq["approved"]       = True
        seq["approved_by"]    = "Taylor"
        seq["built_in_klaviyo"] = True
        seq["seq_template_id"]  = TEMPLATE_IDS[sid]
        try:
            wr = post_gas({"action": "email_sequences_write", "sequence": seq})
            ok = wr.get("ok", False)
            short = sid.replace("EC-2026-001-", "")
            status = "ok" if ok else f"FAIL: {wr}"
            print(f"  {short:<25} {status}")
            if ok: sheet_ok += 1
            else:   sheet_fail += 1
        except Exception as e:
            print(f"  {sid}: ERROR {e}")
            sheet_fail += 1
        time.sleep(0.4)

    print(f"\n  Sheet writes: {sheet_ok} ok / {sheet_fail} fail")

    print(f"\n{'='*60}")
    print("STEP 2: Rebuild HTML + update Klaviyo standalone templates")
    print("="*60)

    html_ok = 0
    klaviyo_ok = 0
    for sid, copy in APPROVED.items():
        seq = seq_map.get(sid, {})
        dl_id    = seq.get("dl_id", "")
        send_day = seq.get("send_day", "0")
        short    = sid.replace("EC-2026-001-", "")
        tid      = TEMPLATE_IDS[sid]

        # Build HTML
        html = build_html_from_copy(copy, dl_id, sid, send_day)

        # Determine filename: E1-A approved version keeps _v3, others get _v2
        if sid == "EC-2026-001-SEQ-1-E1-A":
            fname = "SEQ-1-E1-A_v3.html"
        else:
            fname = f"{short}_v2.html"

        filepath = os.path.join(TEMPLATE_DIR, fname)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  Saved: {fname}")
        html_ok += 1

        # Update Klaviyo standalone template
        print(f"  Updating Klaviyo {tid}...")
        try:
            resp = post_gas({"action": "klaviyo_update_template",
                             "template_id": tid, "html": html})
            if resp.get("ok"):
                print(f"    Klaviyo updated OK")
                klaviyo_ok += 1
            else:
                print(f"    Klaviyo FAIL: {resp.get('error','?')} code={resp.get('code','?')}")
        except Exception as e:
            print(f"    Klaviyo exception: {e}")
        time.sleep(0.5)

    print(f"\n  HTML saved: {html_ok}/6")
    print(f"  Klaviyo updated: {klaviyo_ok}/6")
    print("\nSEQ-1 write complete.")

if __name__ == "__main__":
    main()
