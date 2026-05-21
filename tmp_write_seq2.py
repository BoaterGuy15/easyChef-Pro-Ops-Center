"""Write approved SEQ-2 copy to EmailSequences tab + rebuild HTML + update Klaviyo."""
import json, urllib.request, os, re, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email-templates")

TEMPLATE_IDS = {
    "EC-2026-001-SEQ-2-E1-A": "Y9aeU6",
    "EC-2026-001-SEQ-2-E1-B": "YvrLDj",
    "EC-2026-001-SEQ-2-E2-A": "UiqGQW",
    "EC-2026-001-SEQ-2-E2-B": "WpkBAu",
    "EC-2026-001-SEQ-2-E3-A": "TyKpJq",
    "EC-2026-001-SEQ-2-E3-B": "SFQA5B",
    "EC-2026-001-SEQ-2-E4-A": "RbUHNb",
    "EC-2026-001-SEQ-2-E4-B": "YcmK9j",
    "EC-2026-001-SEQ-2-E5-A": "WeFkW4",
    "EC-2026-001-SEQ-2-E5-B": "UPnK22",
}

APPROVED = {
"EC-2026-001-SEQ-2-E1-A": {
    "subject_line":   "Thursday. You're at the store again.",
    "preview_text":   "You were just here Sunday.",
    "scene_headline": "Thursday. You're at the store again.",
    "scene_subtext":  "You were just here Sunday. The ingredients you bought ran out. Or got lost. Or just never became anything.",
    "h1":             "You're not overspending on groceries.<br>You're spending twice because the first shop had nowhere to go.",
    "p1":             "Sunday was a complete shop. A real one. You planned it. You bought it. By Thursday the week had consumed it without turning it into dinner, and now you're here again for the things you thought you already had.",
    "p2":             "This is the second transaction the $111 hides. Not just what you bought. What you bought again because the first time didn't connect to the table. Two shops. Half the dinners.",
    "solve":          "easyChef Pro makes the Sunday shop last the week. What you bought connects to what becomes dinner — so Thursday stays home.",
    "cta_headline":   "One shop.<br>The whole week covered.",
    "cta_lp":         "waitlist-a",
    "ps":             "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Every week you wait is another Thursday.",
    "icp":            "super_mom_money",
},
"EC-2026-001-SEQ-2-E1-B": {
    "subject_line":   "You planned Sunday. It was gone by Tuesday.",
    "preview_text":   "The 6:30 wall isn't about time. The plan just had nowhere to live.",
    "scene_headline": "Sunday evening. Five meals mapped out. It felt good.",
    "scene_subtext":  "Wednesday 6:28 PM. Full fridge. Nothing started. The plan you made three days ago is completely gone.",
    "h1":             "You didn't fail the plan.<br>The plan had nowhere to live.",
    "p1":             "It lived in your head. Between Sunday and Wednesday it ran into real life: a late meeting, a kid who changed their mind, a day that didn't go the way you expected. And the plan, which had no system to hold it, quietly disappeared.",
    "p2":             "So you ended up back at the fridge at 6:28 carrying all of it in your head. Again. Not because you didn't try. Because the system was disconnected.",
    "solve":          "easyChef Pro carries the plan so you don't have to. Sunday's intention becomes Wednesday's dinner — because the system holds it between the two.",
    "cta_headline":   "Dinner decided.<br>Before the wall hits.",
    "cta_lp":         "waitlist-b",
    "ps":             "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Wednesday 6:30 doesn't have to be a permanent feature of your week.",
    "icp":            "super_mom_time",
},
"EC-2026-001-SEQ-2-E2-A": {
    "subject_line":   "The yogurt you don't remember buying.",
    "preview_text":   "It's been in the back of the fridge for two weeks.",
    "scene_headline": "The yogurt you don't remember buying.",
    "scene_subtext":  "It's been in the back of the fridge for two weeks. At some point it was a dinner plan. Now it's just taking up space.",
    "h1":             "You didn't forget to use it.<br>You never had a path from the shelf to the table.",
    "p1":             "There's always something like this. The item with good intentions and no destination. The thing that got bought because you had a plan, and then the plan evaporated and the item stayed. Yogurt. Tahini. Half a can of coconut milk. Each one a small evidence of a system that doesn't connect.",
    "p2":             "You can't track this in a budget. It doesn't show up as waste — it shows up as the next shop being slightly too big. And slightly too big, every week, is how $111 a month disappears without a single decision you'd call reckless.",
    "solve":          "easyChef Pro connects the shelf to the table. Every item you bought has a place in the week — so nothing stays in the back of the fridge long enough to become a mystery.",
    "cta_headline":   "Every item bought<br>has a dinner to go to.",
    "cta_lp":         "waitlist-a",
    "ps":             "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. The yogurt problem ends when the system starts.",
    "icp":            "super_mom_money",
},
"EC-2026-001-SEQ-2-E2-B": {
    "subject_line":   "AnyList. Paprika. The note on your phone.",
    "preview_text":   "Three places where the dinner plan lives. None of them talking to each other.",
    "scene_headline": "AnyList. Paprika. The note on your phone.",
    "scene_subtext":  "Three places where the dinner plan lives. None of them talking to each other.",
    "h1":             "You're not disorganized.<br>You have three systems and none of them is the system.",
    "p1":             "You've tried to solve this. You downloaded the apps. You made the lists. At some point this week the plan lived in AnyList, but the grocery list is in the notes app, and Tuesday happened somewhere between the two. The fragmentation isn't the problem. It's the symptom.",
    "p2":             "Every extra app is another thing to check. Another place for the plan to live partially. Another reason Wednesday arrives before the pieces do.",
    "solve":          "easyChef Pro is one system. Not three that almost talk. The plan, the grocery list, and the dinner are connected — so Wednesday has what Sunday made.",
    "cta_headline":   "One system.<br>Not three that almost connect.",
    "cta_lp":         "waitlist-b",
    "ps":             "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. The fragmentation can end tonight.",
    "icp":            "super_mom_time",
},
"EC-2026-001-SEQ-2-E3-A": {
    "subject_line":   "You bought parmesan. There's parmesan at home.",
    "preview_text":   "You weren't sure. You bought it anyway.",
    "scene_headline": "You bought parmesan. There's parmesan at home.",
    "scene_subtext":  "You weren't sure. You bought it anyway. Now there are two.",
    "h1":             "You're not buying double on purpose.<br>You're buying double because you can't see what you already have.",
    "p1":             "This happens with more things than parmesan. The olive oil you're not sure about. The pasta box you thought was getting low. The tin of tomatoes you bought three of just in case. Each one a small hedge against a fridge you can't fully track from the store.",
    "p2":             "Buying defensively is rational when you don't have visibility. It's also expensive. Not any single purchase — the cumulative effect of a kitchen that runs on uncertainty instead of information.",
    "solve":          "easyChef Pro gives you the inventory before you're standing in the aisle. What you have is visible — so you buy what you need, not what you might need.",
    "cta_headline":   "Buy what you need.<br>Not what you might need.",
    "cta_lp":         "waitlist-a",
    "ps":             "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. The guessing ends when the system starts.",
    "icp":            "super_mom_money",
},
"EC-2026-001-SEQ-2-E3-B": {
    "subject_line":   "Sunday 10am. The coffee is cold. Still planning.",
    "preview_text":   "Forty-five minutes in. You have three dinners. The week starts tomorrow.",
    "scene_headline": "Sunday 10am. The coffee is cold. Still planning.",
    "scene_subtext":  "Forty-five minutes with a phone and a half-made list. Three dinners confirmed. Four still open. The week starts tomorrow.",
    "h1":             "You're not slow at planning.<br>Planning takes this long when there's no system to start from.",
    "p1":             "Every Sunday this happens. You look at what's in the fridge. You check what everyone will eat. You cross-reference last week's waste. You google something new, decide it's too risky, go back to the rotation. An hour later you have a partial plan and an empty coffee cup.",
    "p2":             "This is not a planning problem. It is a starting-from-zero problem. Every Sunday you rebuild the context that should already exist: what's in the fridge, what you have left, what the week needs. The system should carry that. Instead, you do.",
    "solve":          "easyChef Pro carries the context so Sunday doesn't start from scratch. The week is proposed before your coffee gets cold.",
    "cta_headline":   "Sunday planning done<br>before the coffee cools.",
    "cta_lp":         "waitlist-b",
    "ps":             "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Sunday mornings are better than this.",
    "icp":            "super_mom_time",
},
"EC-2026-001-SEQ-2-E4-A": {
    "subject_line":   "End of the month. Food: $847.",
    "preview_text":   "You know you didn't eat $847 of food. You bought it.",
    "scene_headline": "End of the month. Food: $847.",
    "scene_subtext":  "You scroll back through it. Groceries. DoorDash. Another grocery run. Another DoorDash. You know you didn't eat $847 of food last month. But you bought it.",
    "h1":             "The problem isn't what you spent at the register.<br>It's what didn't make it from the bag to the table.",
    "p1":             "The math never lands right at the end of the month. You bought enough. You probably spent too much. The DoorDash orders were each small. The grocery waste was each small. But added together across four weeks, the gap between what you paid for and what you actually ate is where the month's food budget went.",
    "p2":             "This is what $111 a month means at the end of thirty days. Not a big mistake. Not a binge. The quiet accumulation of a system that never connected the grocery bag to the dinner plate.",
    "solve":          "easyChef Pro closes that gap month by month. What you buy becomes what you eat — so the end-of-month number reflects a kitchen that actually worked.",
    "cta_headline":   "The end-of-month number<br>finally makes sense.",
    "cta_lp":         "waitlist-a",
    "ps":             "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. The $847 months can end.",
    "icp":            "super_mom_money",
},
"EC-2026-001-SEQ-2-E4-B": {
    "subject_line":   "9:47 PM. Did you thaw the chicken?",
    "preview_text":   "You didn't. Of course you didn't.",
    "scene_headline": "9:47 PM. About to turn the light off.",
    "scene_subtext":  "Then: did you thaw the chicken for tomorrow? You didn't. Of course you didn't.",
    "h1":             "The dinner decision doesn't end at dinner.<br>It starts again the night before.",
    "p1":             "This is the part no one talks about. The meal thinking doesn't happen on Sunday and then coast. It runs every night. Did you pull anything from the freezer? Do you have enough for tomorrow? Is there something that needs to be used first? The questions don't stop when the kids go to bed.",
    "p2":             "This is the cognitive overhead that belongs to the system, not to you. The nightly check. The morning scan. The lunchtime recalculation. Hours of background thinking that should have been automatic.",
    "solve":          "easyChef Pro runs the overnight check for you. The plan knows what needs to come out of the freezer. You find out at 5pm, not at 9:47.",
    "cta_headline":   "No more 9:47 PM<br>chicken checks.",
    "cta_lp":         "waitlist-b",
    "ps":             "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. The nights can be quieter.",
    "icp":            "super_mom_time",
},
"EC-2026-001-SEQ-2-E5-A": {
    "subject_line":   "Four weeks. Four more DoorDash Wednesdays.",
    "preview_text":   "The founding price is still $7.99. This is the last time I'll mention it.",
    "scene_headline": "Four weeks since you joined the waitlist.",
    "scene_subtext":  "Somewhere in those four weeks there were four more DoorDash Wednesdays. Four more trips to the store for things the Sunday shop should have covered.",
    "h1":             "You already know the problem is real.<br>You've known it for longer than four weeks.",
    "p1":             "You joined the waitlist because something in that first email was true. The $180 Sunday shop that becomes a $47 Wednesday order. The plan that didn't survive Tuesday. The cilantro that never became anything. You've lived all of it. That's why you're here.",
    "p2":             "The founding price is $7.99 a month, locked forever, for the first 5,000 people. After that it goes to $19.99. That window is real. This is the last time I'll bring it up — the decision is yours.",
    "solve":          "easyChef Pro is ready. The founding price is still $7.99. You know this problem. You know what it costs. The system is here when you are.",
    "cta_headline":   "Lock $7.99<br>before the window closes.",
    "cta_lp":         "waitlist-a",
    "ps":             "P.S. After 5,000 founding spots the price goes to $19.99 permanently. You've waited four weeks. The spot is still there.",
    "icp":            "super_mom_money",
},
"EC-2026-001-SEQ-2-E5-B": {
    "subject_line":   "Four weeks. Wednesday is still Wednesday.",
    "preview_text":   "The founding price is still $7.99. This is the last time I'll mention it.",
    "scene_headline": "Four weeks since you joined the waitlist.",
    "scene_subtext":  "Four more 6:30 PM moments. Four more evenings where the fridge had food and nothing had a plan. Four more Saturdays thinking about Wednesday.",
    "h1":             "You already know the problem is real.<br>You've carried it longer than four weeks.",
    "p1":             "You joined because something landed. The plan that dissolved by Tuesday. The Saturday night already thinking about the week. The fridge scan before you could even start deciding. You recognized all of it. That's why you're still here.",
    "p2":             "The founding price is $7.99 a month, locked forever, for the first 5,000 people. After that it goes to $19.99. That window is real. This is the last time I'll bring it up — the decision is yours.",
    "solve":          "easyChef Pro is ready. The founding price is still $7.99. You know this problem. You know what it costs your evenings. The system is here when you are.",
    "cta_headline":   "Lock $7.99<br>before the window closes.",
    "cta_lp":         "waitlist-b",
    "ps":             "P.S. After 5,000 founding spots the price goes to $19.99 permanently. You've waited four weeks. The spot is still there.",
    "icp":            "super_mom_time",
},
}

LOSS_BLOCK = "The problem was never you. The system was disconnected."

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode("utf-8"))

def read_base(filename):
    with open(os.path.join(TEMPLATE_DIR, filename), "r", encoding="utf-8") as f:
        return f.read()

def build_html(c, dl_id, asset_id, send_day):
    is_money = c["icp"] == "super_mom_money"
    short_id = asset_id.replace("EC-2026-001-", "")
    parts    = short_id.split("-", 2)
    seq_disp = f"{parts[0]}-{parts[1]} * {parts[2]}" if len(parts)==3 else short_id
    tid      = TEMPLATE_IDS[asset_id]
    lp_path  = f"/lp/{c['cta_lp']}"
    cta_url  = (f"https://launch.easychefpro.com{lp_path}"
                f"?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001"
                f"&utm_content={dl_id}&utm_term={short_id}")
    base     = read_base("SEQ-1-E1-A_v3.html" if is_money else "SEQ-2-E1-B_v2.html")
    html     = base
    flow_id  = "XfqUtU (Flow A)" if is_money else "XCyc4m (Flow B)"

    if is_money:
        html = html.replace("<title>SEQ-1 \xb7 E1-A \xb7 That $47 DoorDash charge. You already paid for that dinner.</title>", f"<title>{seq_disp} \xb7 {c['subject_line']}</title>")
        html = html.replace("<!-- ── PREHEADER ── single scene: Sunday groceries → Wednesday DoorDash -->", f"<!-- ── PREHEADER ── {c['scene_headline']} -->")
        html = html.replace("The chicken is still in your fridge.", c["preview_text"])
        html = html.replace("     SCENE: Sunday groceries → Wednesday DoorDash\n     ICP: super_mom_money", f"     SCENE: {c['scene_headline']}\n     ICP: {c['icp']}")
        html = html.replace("         Sunday groceries → Wednesday DoorDash\n         Open in the middle of the moment.", f"         {c['scene_headline']}\n         Open in the middle of the moment.")
        html = html.replace("\n            Sunday. $180 at the grocery store. A real plan.\n          ", f"\n            {c['scene_headline']}\n          ")
        html = html.replace("\n            Wednesday 6:22 PM. Kids asking. You open DoorDash. The chicken thighs are still in the fridge.\n          ", f"\n            {c['scene_subtext']}\n          ")
        html = html.replace("\n          You didn't waste $47 on DoorDash.<br>You wasted the $180 that had nowhere to go.\n        ", f"\n          {c['h1']}\n        ")
        html = html.replace("\n          The groceries were right. The intention was right. There was just nothing to connect Sunday's plan to Wednesday's fridge. No bridge between what you bought and what actually became dinner.\n        ", f"\n          {c['p1']}\n        ")
        html = html.replace("\n          That is what <strong style=\"color:#000000;font-weight:600;\">$111 a month</strong> looks like. Not bad decisions. Not overspending. Just a gap that has never had a system to close it.\n        ", f"\n          {c['p2']}\n        ")
        html = html.replace("\n          easyChef Pro is that system. It closes the loop between what you buy and what actually becomes dinner — so Wednesday looks like the plan you made on Sunday.\n        ", f"\n          {c['solve']}\n        ")
        html = html.replace("\n          Stop the Sunday → Wednesday leak.<br>Permanently.\n        ", f"\n          {c['cta_headline']}\n        ")
        html = html.replace("https://launch.easychefpro.com/lp/waitlist-a?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-EM-0036_seq1_e1a&utm_term=SEQ-1-E1-A", cta_url)
        html = html.replace("P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Every week you wait is another DoorDash Wednesday.", c["ps"])
    else:
        html = html.replace("<title>SEQ-2 \xb7 E1-B \xb7 You planned Sunday. It was gone by Tuesday.</title>", f"<title>{seq_disp} \xb7 {c['subject_line']}</title>")
        html = html.replace("<!-- ── PREHEADER ── single scene: Sunday plan → Wednesday wall -->", f"<!-- ── PREHEADER ── {c['scene_headline']} -->")
        html = html.replace("The 6:30 wall isn't about time. The plan just had nowhere to live.", c["preview_text"])
        html = html.replace("     SCENE: Sunday plan → Wednesday 6:30 wall\n     ICP: super_mom_time", f"     SCENE: {c['scene_headline']}\n     ICP: {c['icp']}")
        html = html.replace("         Sunday plan → Wednesday 6:28 PM wall\n         Open in the middle of the moment.", f"         {c['scene_headline']}\n         Open in the middle of the moment.")
        html = html.replace("\n            Sunday evening. Five meals mapped out. It felt good.\n          ", f"\n            {c['scene_headline']}\n          ")
        html = html.replace("\n            Wednesday 6:28 PM. Full fridge. Nothing started. The plan you made three days ago is completely gone.\n          ", f"\n            {c['scene_subtext']}\n          ")
        html = html.replace("\n          You didn't fail the plan.<br>The plan had nowhere to live.\n        ", f"\n          {c['h1']}\n        ")
        html = html.replace("\n          It lived in your head. Between Sunday and Wednesday it ran into real life: a late meeting, a kid who changed their mind, a day that didn't go the way you expected. And the plan, which had no system to hold it, quietly disappeared.\n        ", f"\n          {c['p1']}\n        ")
        html = html.replace("\n          So you ended up back at the fridge at 6:28 carrying all of it in your head. Again. Not because you didn't try. Because the system was disconnected.\n        ", f"\n          {c['p2']}\n        ")
        html = html.replace("\n          easyChef Pro carries the plan so you don't have to. Sunday's intention becomes Wednesday's dinner — because the system holds it between the two.\n        ", f"\n          {c['solve']}\n        ")
        html = html.replace("\n          Dinner decided.<br>Before the wall hits.\n        ", f"\n          {c['cta_headline']}\n        ")
        html = html.replace("https://launch.easychefpro.com/lp/waitlist-b?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-EM-0043&utm_term=SEQ-2-E1-B", cta_url)
        html = html.replace("P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Wednesday 6:30 doesn't have to be a permanent feature of your week.", c["ps"])

    variant = "A" if is_money else "B"
    metadata = f"""<!--
================================================================
  ASSET METADATA
  {{{{ASSET_ID}}}}      {asset_id}
  {{{{KLAVIYO_ID}}}}    {tid} (standalone -- wire to {flow_id} in Klaviyo UI)
  {{{{DL_ID}}}}         {dl_id}
  {{{{ICP}}}}           {c['icp']}
  {{{{VARIANT}}}}       {variant}
  {{{{SEQUENCE}}}}      {seq_disp}
  {{{{FLOW}}}}          {flow_id}
  {{{{SEND_DAY}}}}      Day {send_day}
  {{{{SUBJECT}}}}       {c['subject_line']}
  {{{{PREVIEW}}}}       {c['preview_text']}
  {{{{STATUS}}}}        APPROVED -- all 5 governance rules pass -- Taylor approved May 20 2026
  {{{{VERSION}}}}       v2 -- full governance rewrite
================================================================
-->"""
    html = re.sub(r'<!--\n={64}\n  ASSET METADATA.*?={64}\n-->', metadata, html, flags=re.DOTALL)
    return html

def main():
    print("Reading EmailSequences...")
    seqs    = post_gas({"action":"email_sequences_read","campaign_id":"EC-2026-001"}).get("sequences",[])
    seq_map = {s["id"]: s for s in seqs}

    print(f"\n{'='*55}\nSTEP 1: Write to EmailSequences tab\n{'='*55}")
    ok=0; fail=0
    for sid, c in APPROVED.items():
        seq = dict(seq_map.get(sid, {"id": sid}))
        seq.update({
            "subject_line": c["subject_line"], "preview_text": c["preview_text"],
            "body_hook": c["scene_headline"]+" "+c["scene_subtext"],
            "body_problem": c["p1"], "body_agitate": c["p2"],
            "body_solve": c["solve"], "body_cta": c["cta_headline"].replace("<br>"," "),
            "status": "APPROVED", "approved": True, "approved_by": "Taylor",
            "built_in_klaviyo": True, "seq_template_id": TEMPLATE_IDS[sid],
        })
        wr = post_gas({"action":"email_sequences_write","sequence":seq})
        short = sid.replace("EC-2026-001-","")
        print(f"  {short:<25} {'ok' if wr.get('ok') else 'FAIL: '+str(wr)}")
        if wr.get("ok"): ok+=1
        else: fail+=1
        time.sleep(0.4)
    print(f"  Writes: {ok} ok / {fail} fail")

    print(f"\n{'='*55}\nSTEP 2: Rebuild HTML + update Klaviyo\n{'='*55}")
    h_ok=0; k_ok=0
    for sid, c in APPROVED.items():
        seq      = seq_map.get(sid, {})
        dl_id    = seq.get("dl_id","")
        send_day = seq.get("send_day","0")
        short    = sid.replace("EC-2026-001-","")
        tid      = TEMPLATE_IDS[sid]

        html  = build_html(c, dl_id, sid, send_day)
        fname = f"{short}_v2.html"
        with open(os.path.join(TEMPLATE_DIR, fname),"w",encoding="utf-8") as f: f.write(html)
        print(f"  Saved: {fname}")
        h_ok += 1

        resp = post_gas({"action":"klaviyo_update_template","template_id":tid,"html":html})
        if resp.get("ok"):
            print(f"    Klaviyo {tid} updated OK")
            k_ok += 1
        else:
            print(f"    Klaviyo {tid} FAIL: {resp.get('error','?')} code={resp.get('code','?')}")
        time.sleep(0.5)

    print(f"\n  HTML saved: {h_ok}/10  |  Klaviyo updated: {k_ok}/10")
    print("SEQ-2 write complete.")

if __name__=="__main__":
    main()
