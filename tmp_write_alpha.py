"""Write approved Alpha Flow (6 emails) to EmailSequences tab + update Klaviyo templates."""
import json, urllib.request, os, re, time

GAS_URL      = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email-templates")

EXISTING_TIDS = {
    "EC-2026-001-ALPHA-E1": "UM8eaZ",
    "EC-2026-001-ALPHA-E2": "Tx68VK",
    "EC-2026-001-ALPHA-E3": "XEjGdW",
    "EC-2026-001-ALPHA-E4": "Uxet8P",
    "EC-2026-001-ALPHA-E5": "QRKrLt",
    "EC-2026-001-ALPHA-E6": "VC23Fh",
}

APPROVED = {
# ── ALPHA-E1  Day 0 — access confirmed ───────────────────────────────────────
"EC-2026-001-ALPHA-E1": {
    "subject_line":  "{{ person.first_name | default: 'there' }}, you're alpha #{{ person.alpha_number | default: 'one of our 50' }}.",
    "preview_text":  "First year free. $7.99 forever after.",
    "scene_headline": "{{ person.first_name | default: 'there' }}.",
    "scene_subtext": "You're in. Not just the waitlist. Not just the launch. You're one of 50 families who will build easyChef Pro before anyone else sees it.",
    "h1":            "Alpha #{{ person.alpha_number | default: 'one of our 50' }}.<br>That number is yours.",
    "p1":            "<strong style=\"color:#000000;font-weight:600;\">Your first year is free.</strong> Every month, on us. No card needed. No trial. You get the full app because we need your real feedback — not your politeness.<br><br><strong style=\"color:#000000;font-weight:600;\">After year one: $7.99/month, forever.</strong> Founding price. Locked. We can't touch it.<br><br><strong style=\"color:#000000;font-weight:600;\">You get the app June 8.</strong> That's when your access link arrives.",
    "p2":            "Between now and June 22, we're asking for four things:<br><br>1. Build your pantry — get to 20+ items<br>2. Cook 3 meals from the app<br>3. Save 1 item from spoilage before it goes bad<br>4. Generate a grocery list",
    "solve":         "Four tasks. Two weeks. Your kitchen is about to become the most connected room in your house.",
    "cta_headline":  "You're alpha #{{ person.alpha_number | default: 'one of our 50' }}.<br>Your start date is June 8.",
    "cta_subtext":   "50 alpha families &nbsp;·&nbsp; First year free",
    "cta_btn":       "Get the app June 8 &#8594;",
    "cta_url":       "https://easychefpro.com?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-ALPHA-E1&utm_term=ALPHA-E1",
    "footer_sub":    "Alpha access. First year free. App link arrives June 8.",
    "ps":            "P.S. There are 50 spots. You have one. The families who come after you get a better product because you were first.",
    "icp":           "alpha_tester",
    "send_day":      "0",
},
# ── ALPHA-E2  Day 1 — task list ───────────────────────────────────────────────
"EC-2026-001-ALPHA-E2": {
    "subject_line":  "{{ person.first_name | default: 'there' }}, here are your 4 tasks.",
    "preview_text":  "Two weeks. Four things. That's it.",
    "scene_headline": "The next 14 days.",
    "scene_subtext": "Your access opens June 8. Here's what we're asking you to do before June 22.",
    "h1":            "Four tasks. Two weeks.<br>Here's where you stand right now.",
    "p1":            "<strong style=\"color:#000000;font-weight:600;\">Task 1:</strong> Build your pantry — {{ person.pantry_items | default: 0 }}/20 items<br><br><strong style=\"color:#000000;font-weight:600;\">Task 2:</strong> Cook from the app — {{ person.meals_cooked | default: 0 }}/3 meals<br><br><strong style=\"color:#000000;font-weight:600;\">Task 3:</strong> Save something from spoilage — {{ person.spoilage_saves | default: 0 }}/1 saves<br><br><strong style=\"color:#000000;font-weight:600;\">Task 4:</strong> Generate a grocery list",
    "p2":            "These four tasks aren't arbitrary. They're the exact sequence that tells us the system is working for your kitchen — not just installed, but running.",
    "solve":         "Complete all four. We'll send your feedback summary on June 22.",
    "cta_headline":  "Your start date is June 8.<br>Your deadline is June 22.",
    "cta_subtext":   "Alpha window: June 8 &nbsp;·&nbsp; Deadline: June 22",
    "cta_btn":       "See the app &#8594;",
    "cta_url":       "https://easychefpro.com?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-ALPHA-E2&utm_term=ALPHA-E2",
    "footer_sub":    "App access arrives June 8. Alpha window closes June 22.",
    "ps":            "P.S. You'll be able to see your live task progress inside the app. We track it automatically.",
    "icp":           "alpha_tester",
    "send_day":      "1",
},
# ── ALPHA-E3  Day 7 — Taylor voice check-in ──────────────────────────────────
"EC-2026-001-ALPHA-E3": {
    "subject_line":  "{{ person.first_name | default: 'there' }} - how's the kitchen?",
    "preview_text":  "One week in. What are you noticing?",
    "scene_headline": "One week.",
    "scene_subtext": "You've had the app for 7 days. Here's what we're seeing.",
    "h1":            "{{ person.meals_cooked | default: 0 }} meals cooked.<br>{{ person.pantry_items | default: 0 }} items in your pantry.<br>{{ person.spoilage_saves | default: 0 }} items saved from the bin.",
    "p1":            "{% if person.meals_cooked >= 3 %}Three meals already. You're ahead of where most families are at day 7. The pattern is already showing — what you bought is actually becoming dinner.{% elsif person.meals_cooked == 0 %}Haven't cooked your first meal yet? That's okay. You still have a week. Open the app tonight — add your pantry items first. That's task 1 and it takes 10 minutes.{% else %}One or two meals in — you're right on track. The first few are always the ones that tell you how your kitchen actually works.{% endif %}",
    "p2":            "What are you noticing? Not what's broken — just what feels different. What was hard before that's easier now?<br><br>Reply directly to this email. I read every one.",
    "solve":         "One week down. One week left. You're building something real here.",
    "cta_headline":  "Still here. Still reading every reply.",
    "cta_subtext":   "Alpha window closes June 22",
    "cta_btn":       "Reply to Taylor &#8594;",
    "cta_url":       "https://easychefpro.com?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-ALPHA-E3&utm_term=ALPHA-E3",
    "footer_sub":    "Alpha window closes June 22. Reply anytime.",
    "ps":            "P.S. Your four tasks end June 22. If you're behind, reply and we'll help you catch up.",
    "icp":           "alpha_tester",
    "send_day":      "7",
},
# ── ALPHA-E4  Day 10 — four days left ────────────────────────────────────────
"EC-2026-001-ALPHA-E4": {
    "subject_line":  "Quick question, {{ person.first_name | default: 'there' }}.",
    "preview_text":  "Four days left. Where are you?",
    "scene_headline": "Four days left.",
    "scene_subtext": "The alpha window closes June 22. Here's where you are.",
    "h1":            "{{ person.tasks_completed | default: 0 }}/4 tasks complete.<br>Four days left.",
    "p1":            "{% if person.tasks_completed >= 4 %}All four tasks done. You've done exactly what we needed. Your feedback window opens now — leave your notes before June 22.{% elsif person.tasks_completed >= 2 %}Halfway there. Four days is enough time to finish. Open the app tonight and keep going.{% else %}Still at the start? Four days is still four days. Even completing two tasks gives us useful data. Open the app and start with pantry — 10 minutes.{% endif %}",
    "p2":            "One question — what's the one thing about your kitchen week that still doesn't have a system? Reply here. I'm asking because that answer shapes what we build next.",
    "solve":         "Four days. Whatever you can finish — finish it.",
    "cta_headline":  "Leave your alpha feedback.<br>Window closes June 22.",
    "cta_subtext":   "Alpha deadline: June 22",
    "cta_btn":       "Leave feedback &#8594;",
    "cta_url":       "https://launch.easychefpro.com/alpha-feedback?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-ALPHA-E4&utm_term=ALPHA-E4",
    "footer_sub":    "Alpha deadline is June 22. Reply anytime.",
    "ps":            "P.S. Even partial feedback is useful. Don't wait until you're done.",
    "icp":           "alpha_tester",
    "send_day":      "10",
},
# ── ALPHA-E5  Day 14 — two weeks up, feedback ────────────────────────────────
"EC-2026-001-ALPHA-E5": {
    "subject_line":  "{{ person.first_name | default: 'there' }}, your two weeks are up.",
    "preview_text":  "Here's what you built.",
    "scene_headline": "Two weeks. Done.",
    "scene_subtext": "Here's what your kitchen looks like now.",
    "h1":            "Here's what you built with it.",
    "p1":            "{{ person.meals_cooked | default: 0 }} meals cooked from the app.<br>{{ person.spoilage_saves | default: 0 }} items saved from the bin.<br>{{ person.pantry_items | default: 0 }} items in your pantry right now.<br>{% if person.weekly_savings > 0 %}An estimated ${{ person.weekly_savings }} saved this month.{% endif %}",
    "p2":            "That's not a trial. That's two weeks of a kitchen that actually runs. The problem was never you — it was just a system that was always missing. Now you've seen what it looks like when it's there.",
    "solve":         "Leave your feedback before the window closes. Your notes go directly to the team.",
    "cta_headline":  "Two weeks of data.<br>Your feedback shapes what's next.",
    "cta_subtext":   "Feedback window open now",
    "cta_btn":       "Leave my feedback &#8594;",
    "cta_url":       "https://launch.easychefpro.com/alpha-feedback?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-ALPHA-E5&utm_term=ALPHA-E5",
    "footer_sub":    "Alpha period complete. $7.99/month locked forever from year 2.",
    "ps":            "P.S. You've earned your year free. After year one: $7.99/month, locked forever.",
    "icp":           "alpha_tester",
    "send_day":      "14",
},
# ── ALPHA-E6  Day 16 — Taylor, what your feedback built ──────────────────────
"EC-2026-001-ALPHA-E6": {
    "subject_line":  "{{ person.first_name | default: 'there' }}, here is what your feedback built.",
    "preview_text":  "Engineering has your list.",
    "scene_headline": "Your feedback.",
    "scene_subtext": "I read every response from all 50 families. Here's what we're building next.",
    "h1":            "Here is what your two weeks built.",
    "p1":            "I read every response. Every one.<br><br>First year free. &#x2705; Locked.<br>$7.99/month forever after. &#x2705; Locked.<br><br>The things you told us weren't working -- they're on the roadmap. Named after the week they were reported.",
    "p2":            "On July 1, easyChef Pro opens to everyone. They'll get the version you built.<br><br>When someone asks you about it, you can say: <em>\"I've been testing the app for two weeks. Here's what changed in my kitchen.\"</em>",
    "solve":         "Thank you for being one of 50, {{ person.first_name | default: 'there' }}.",
    "cta_headline":  "Share with a family who needs this.",
    "cta_subtext":   "July 1 launch &nbsp;·&nbsp; Public access opens",
    "cta_btn":       "Share easyChef Pro &#8594;",
    "cta_url":       "https://launch.easychefpro.com?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-ALPHA-E6&utm_term=ALPHA-E6",
    "footer_sub":    "Alpha period complete. Launch July 1. $7.99/month locked forever.",
    "ps":            "P.S. You'll always be alpha #{{ person.alpha_number | default: 'one of our 50' }}. That's permanent.",
    "icp":           "alpha_tester",
    "send_day":      "16",
},
}


def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode("utf-8"))


def build_alpha_html(c, asset_id):
    base_path = os.path.join(TEMPLATE_DIR, "SEQ-1-E1-A_v3.html")
    with open(base_path, encoding="utf-8") as f:
        html = f.read()

    short_id = asset_id.replace("EC-2026-001-", "")
    parts    = short_id.split("-", 1)
    seq_disp = parts[0] + " * " + parts[1] if len(parts) == 2 else short_id
    tid      = EXISTING_TIDS.get(asset_id, "")

    html = html.replace(
        "SEQ-1 * E1-A \xb7 That $47 DoorDash charge. You already paid for that dinner.",
        seq_disp + " \xb7 " + c["subject_line"]
    )
    html = html.replace(
        "<!-- ── PREHEADER ── Sunday. $180 at the grocery store. A real plan. -->",
        "<!-- ── PREHEADER ── " + c["scene_headline"] + " -->"
    )
    html = html.replace("The chicken is still in your fridge.", c["preview_text"])
    html = html.replace("Founding Family", "Alpha Family")
    html = html.replace(
        "     SCENE: Sunday. $180 at the grocery store. A real plan.\n     ICP: super_mom_money",
        "     SCENE: " + c["scene_headline"] + "\n     ICP: " + c["icp"]
    )
    html = html.replace(
        "         Sunday. $180 at the grocery store. A real plan.\n         Open in the middle of the moment.",
        "         " + c["scene_headline"] + "\n         Open in the middle of the moment."
    )
    html = html.replace(
        "\n            Sunday. $180 at the grocery store. A real plan.\n          ",
        "\n            " + c["scene_headline"] + "\n          "
    )
    html = html.replace(
        "\n            Wednesday 6:22 PM. Kids asking. You open DoorDash. The chicken thighs are still in the fridge.\n          ",
        "\n            " + c["scene_subtext"] + "\n          "
    )
    html = html.replace(
        "\n          You didn't waste $47 on DoorDash.<br>You wasted the $180 that had nowhere to go.\n        ",
        "\n          " + c["h1"] + "\n        "
    )
    html = html.replace(
        "\n          The groceries were right. The intention was right. There was just nothing to connect Sunday's plan to Wednesday's fridge. No bridge between what you bought and what actually became dinner.\n        ",
        "\n          " + c["p1"] + "\n        "
    )
    html = html.replace(
        "\n          That is what <strong style=\"color:#000000;font-weight:600;\">$111 a month</strong> looks like. Not bad decisions. Not overspending. Just a gap that has never had a system to close it.\n        ",
        "\n          " + c["p2"] + "\n        "
    )
    html = html.replace(
        "\n          easyChef Pro is that system. It closes the loop between what you buy and what actually becomes dinner — so Wednesday looks like the plan you made on Sunday.\n        ",
        "\n          " + c["solve"] + "\n        "
    )
    html = html.replace(
        "\n          Stop the Sunday → Wednesday leak.<br>Permanently.\n        ",
        "\n          " + c["cta_headline"] + "\n        "
    )
    html = html.replace(
        "5,000 founding spots &nbsp;\xb7&nbsp; $7.99/month locked forever",
        c.get("cta_subtext", "50 alpha families &nbsp;\xb7&nbsp; First year free")
    )
    html = html.replace("Claim my founding spot &#8594;", c.get("cta_btn", "Continue &#8594;"))
    html = html.replace(
        "https://launch.easychefpro.com/lp/waitlist-a?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-EM-0036&utm_term=SEQ-1-E1-A",
        c["cta_url"]
    )
    html = html.replace(
        "Free to join. No credit card. Early access July 1.",
        c.get("footer_sub", "Alpha access. First year free.")
    )
    html = html.replace(
        "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Every week you wait is another DoorDash Wednesday.",
        c.get("ps", "")
    )

    metadata = (
        "<!--\n"
        "================================================================\n"
        "  ASSET METADATA\n"
        "  {ASSET_ID}      " + asset_id + "\n"
        "  {KLAVIYO_ID}    " + tid + " (standalone -- wire to QYwGdj Alpha Flow)\n"
        "  {ICP}           " + c["icp"] + "\n"
        "  {SEQUENCE}      ALPHA * " + (short_id.split("-", 1)[1] if "-" in short_id else short_id) + "\n"
        "  {FLOW}          QYwGdj (Alpha Flow)\n"
        "  {SEND_DAY}      Day " + c["send_day"] + "\n"
        "  {SUBJECT}       " + c["subject_line"] + "\n"
        "  {PREVIEW}       " + c["preview_text"] + "\n"
        "  {RULE}          EMAIL_LP_RELATIONSHIP_001 -- dynamic Liquid properties\n"
        "  {STATUS}        APPROVED -- Taylor approved May 20 2026\n"
        "  {VERSION}       v1 -- initial write\n"
        "================================================================\n"
        "-->"
    )
    html = re.sub(
        r'<!--\n={64}\n  ASSET METADATA.*?={64}\n-->',
        metadata, html, flags=re.DOTALL
    )
    return html


def main():
    print("Reading EmailSequences...")
    seqs    = post_gas({"action": "email_sequences_read", "campaign_id": "EC-2026-001"}).get("sequences", [])
    seq_map = {s["id"]: s for s in seqs}

    print("\n" + "=" * 55)
    print("STEP 1: Write to EmailSequences tab")
    print("=" * 55)
    ok = 0; fail = 0
    for sid, c in APPROVED.items():
        seq = dict(seq_map.get(sid, {"id": sid}))
        seq.update({
            "subject_line":     c["subject_line"],
            "preview_text":     c["preview_text"],
            "body_hook":        c["scene_headline"] + " " + c["scene_subtext"],
            "body_problem":     c["p1"],
            "body_agitate":     c["p2"],
            "body_solve":       c["solve"],
            "body_cta":         c["cta_headline"].replace("<br>", " "),
            "status":           "APPROVED",
            "approved":         True,
            "approved_by":      "Taylor",
            "built_in_klaviyo": True,
            "seq_template_id":  EXISTING_TIDS.get(sid, ""),
        })
        wr    = post_gas({"action": "email_sequences_write", "sequence": seq})
        short = sid.replace("EC-2026-001-", "")
        print("  {:<25} {}".format(short, "ok" if wr.get("ok") else "FAIL: " + str(wr)))
        if wr.get("ok"): ok += 1
        else:            fail += 1
        time.sleep(0.4)
    print("  Writes: {} ok / {} fail".format(ok, fail))

    print("\n" + "=" * 55)
    print("STEP 2: Rebuild HTML + update Klaviyo")
    print("=" * 55)
    h_ok = 0; k_ok = 0; k_fail = 0
    final_tids = {}
    for sid, c in APPROVED.items():
        short = sid.replace("EC-2026-001-", "")
        html  = build_alpha_html(c, sid)
        fname = short + "_v1.html"
        with open(os.path.join(TEMPLATE_DIR, fname), "w", encoding="utf-8") as f:
            f.write(html)
        print("  Saved: " + fname)
        h_ok += 1

        tid  = EXISTING_TIDS.get(sid, "")
        resp = post_gas({"action": "klaviyo_update_template", "template_id": tid, "html": html})
        if resp.get("ok"):
            print("    Klaviyo " + tid + " updated OK")
            k_ok += 1
            final_tids[sid] = tid
        else:
            err = str(resp.get("error", resp.get("message", str(resp))))[:60]
            print("    Klaviyo " + tid + " FAIL: " + err + " -- trying create")
            cr = post_gas({"action": "klaviyo_create_template", "name": short + " v1", "html": html})
            if cr.get("ok"):
                new_tid = cr.get("template_id", "")
                print("    Created new template: " + new_tid)
                final_tids[sid] = new_tid
                k_ok += 1
                seq2 = dict(seq_map.get(sid, {"id": sid}))
                seq2["seq_template_id"] = new_tid
                post_gas({"action": "email_sequences_write", "sequence": seq2})
            else:
                print("    Create also FAILED: " + str(cr))
                k_fail += 1
                final_tids[sid] = tid + " (NOT UPDATED)"
        time.sleep(0.6)

    print("\n  HTML saved: {}/6  |  Klaviyo updated: {}/6  |  Klaviyo fail: {}".format(h_ok, k_ok, k_fail))

    print("\n" + "=" * 55)
    print("ALPHA FLOW TEMPLATE IDS")
    print("=" * 55)
    print("{:<28} {:<10} {}".format("Email", "Template", "Send Day"))
    print("-" * 55)
    for sid, tid in final_tids.items():
        short    = sid.replace("EC-2026-001-", "")
        send_day = APPROVED[sid]["send_day"]
        print("  {:<26} {:<10} Day {}".format(short, tid, send_day))
    print("\nAlpha Flow write complete.")


if __name__ == "__main__":
    main()
