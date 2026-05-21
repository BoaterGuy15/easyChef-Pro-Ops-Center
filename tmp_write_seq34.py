"""Write approved SEQ-3 + SEQ-4 copy to EmailSequences tab + rebuild HTML + update Klaviyo."""
import json, urllib.request, os, re, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email-templates")

TEMPLATE_IDS = {
    "EC-2026-001-SEQ-3-E1-A": "UzuXXQ",
    "EC-2026-001-SEQ-3-E1-B": "Tacn3N",
    "EC-2026-001-SEQ-3-E2-A": "TsGpgR",
    "EC-2026-001-SEQ-3-E2-B": "RuZZ5A",
    "EC-2026-001-SEQ-3-E3-A": "XSrXN7",
    "EC-2026-001-SEQ-3-E3-B": "SShAR7",
    "EC-2026-001-SEQ-3-E4-A": "VERNyE",
    "EC-2026-001-SEQ-3-E4-B": "YnNKUP",
    "EC-2026-001-SEQ-4-E1-A": "RAevtk",
    "EC-2026-001-SEQ-4-E1-B": "Y4hJxf",
    "EC-2026-001-SEQ-4-E2-A": "W6BkjY",
    "EC-2026-001-SEQ-4-E2-B": "SXw7eR",
    "EC-2026-001-SEQ-4-E3-A": "Wp7mz3",
    "EC-2026-001-SEQ-4-E3-B": "RsauRg",
}

APPROVED = {
# ─── SEQ-3  (Jun 10-25 · countdown · CTA -> launch.easychefpro.com) ─────────
"EC-2026-001-SEQ-3-E1-A": {
    "subject_line":   "The $12 that keeps saving dinner",
    "preview_text":   "Not a bad purchase. A signal.",
    "scene_headline": "Tuesday. 5:47 PM. The plan from Sunday is already gone.",
    "scene_subtext":  "You stop at the store. You grab the rotisserie chicken. $12. Dinner is handled. Again.",
    "h1":             "You're not overspending on groceries.<br>You're spending twice because the first shop had nowhere to go.",
    "p1":             "It works every time. That's the part that gets expensive. Not the chicken — the fact that you're back at the store on Tuesday, then Thursday, then Saturday for the one thing you forgot. The $12 saves dinner. The pattern costs $300 extra a month.",
    "p2":             "The problem was never you. The system was disconnected. The grocery run and the meal and the week were never talking to each other. So every Tuesday looks like Monday never happened.",
    "solve":          "easyChef Pro closes that gap — the week you planned on Sunday stays intact by Wednesday.",
    "cta_headline":   "Stop resetting every Tuesday.",
    "cta_lp":         "waitlist-a",
    "cta_domain":     "launch.easychefpro.com",
    "ps":             "P.S. The $1,336 in avoidable grocery spending? It's not one big waste. It's twelve Tuesdays.",
    "icp":            "super_mom_money",
},
"EC-2026-001-SEQ-3-E1-B": {
    "subject_line":   "It was 6:45 when the call finally ended.",
    "preview_text":   "Dinner wasn't the first casualty.",
    "scene_headline": "6:45 PM. The call was supposed to end at 5:30.",
    "scene_subtext":  "You have three texts you haven't answered, one kid doing homework with the TV on, and a fridge you haven't opened today. You already know this isn't going to go well.",
    "h1":             "You didn't fail tonight.<br>Tonight never had a structure that could survive the afternoon.",
    "p1":             "It isn't just tonight. It's the version of tonight that happens every week — different trigger, same result. A schedule that looked manageable at 9 AM is unrecognizable by 6 PM. Dinner gets decided at the worst possible moment with the least possible energy.",
    "p2":             "The problem was never you. The system was disconnected. The plan you had in the morning had no way to survive contact with the afternoon. That's not a discipline problem. That's a structure problem.",
    "solve":          "easyChef Pro is the structure that holds — the plan that bends when the day breaks.",
    "cta_headline":   "No more 6:45 scrambles.",
    "cta_lp":         "waitlist-b",
    "cta_domain":     "launch.easychefpro.com",
    "ps":             "P.S. Five to ten hours a week. That's what a disconnected kitchen costs. Every week.",
    "icp":            "super_mom_time",
},
"EC-2026-001-SEQ-3-E2-A": {
    "subject_line":   "You bought $94 worth of groceries. And forgot the chicken.",
    "preview_text":   "The list was in your phone. That's the part that stings.",
    "scene_headline": "Friday afternoon. Full cart. $94 receipt. Halfway home.",
    "scene_subtext":  "You remember: you needed chicken for Sunday's dinner. It was right there in your phone. Three pounds of chicken thighs, between the olive oil and the garlic. You don't know how you missed it.",
    "h1":             "The list was right.<br>The list and the plan just weren't connected.",
    "p1":             "You've done this before. Not always chicken. Sometimes it's eggs, or the specific pasta the kids will eat, or the one sauce that makes the whole thing work. The cart was full. The list was right. Something still fell through.",
    "p2":             "The problem was never you. The system was disconnected. A grocery list and a meal plan that don't talk to each other create the same gap every week — full fridge, missing piece, back to the store.",
    "solve":          "easyChef Pro closes that loop — the list and the plan are one thing, not two apps and a screenshot.",
    "cta_headline":   "One trip. Actually complete.",
    "cta_lp":         "waitlist-a",
    "cta_domain":     "launch.easychefpro.com",
    "ps":             "P.S. The second trip isn't the problem. It's a symptom.",
    "icp":            "super_mom_money",
},
"EC-2026-001-SEQ-3-E2-B": {
    "subject_line":   "By the time you figured it out, everyone had moved on.",
    "preview_text":   "Not angry. Just done asking.",
    "scene_headline": "6:30 PM. You ask what everyone wants.",
    "scene_subtext":  "Nobody answers. 6:45 you ask again. \"I don't care.\" \"Whatever.\" By 7 PM you've ordered delivery, slightly irritated, not sure what you're actually annoyed about.",
    "h1":             "Nobody was difficult.<br>The decision just arrived three hours too late.",
    "p1":             "This doesn't happen because anyone is difficult. It happens because the dinner question arrives after the decision should have already been made — after the groceries, after the plan, after the window for choice had already closed. By 6:30 the only options are fast or late.",
    "p2":             "The problem was never you. The system was disconnected. The decision about dinner was supposed to happen Sunday. It keeps getting deferred to 6:30 PM. That's not a decision point — that's a triage call.",
    "solve":          "easyChef Pro moves the decision back to where it belongs — Sunday, when everyone still has energy.",
    "cta_headline":   "Dinner decided before the chaos starts.",
    "cta_lp":         "waitlist-b",
    "cta_domain":     "launch.easychefpro.com",
    "ps":             "P.S. The delivery wasn't expensive. The decision at 6:30 was.",
    "icp":            "super_mom_time",
},
"EC-2026-001-SEQ-3-E3-A": {
    "subject_line":   "Four cans of chickpeas. Nothing for tonight.",
    "preview_text":   "A full pantry that never adds up to a meal.",
    "scene_headline": "Wednesday. 6 PM. You open the pantry.",
    "scene_subtext":  "Four cans of chickpeas, two boxes of pasta, a jar of tahini from a recipe you made once, half a bag of lentils. The fridge has eggs, leftover rice, a pepper. You are somehow out of dinner options.",
    "h1":             "The pantry isn't empty.<br>It's full of things that don't connect tonight.",
    "p1":             "The chickpeas and the pasta don't add up to anything without the missing piece — the sauce, the protein, the thing you were sure you had. A full pantry that never quite has what you need is a storage unit, not a kitchen.",
    "p2":             "The problem was never you. The system was disconnected. You shop without knowing exactly what's already there. You have what's there without knowing how it connects to the week's plan. Nothing talks to anything else.",
    "solve":          "easyChef Pro turns what you have into a meal — not what you have to go buy.",
    "cta_headline":   "What you already have, finally working.",
    "cta_lp":         "waitlist-a",
    "cta_domain":     "launch.easychefpro.com",
    "ps":             "P.S. You're not a bad planner. You've never had a system that helped.",
    "icp":            "super_mom_money",
},
"EC-2026-001-SEQ-3-E3-B": {
    "subject_line":   "You were going to prep Sunday. You watched TV instead.",
    "preview_text":   "Understandable. And also how Monday happens.",
    "scene_headline": "Sunday afternoon. You had a plan.",
    "scene_subtext":  "Wash the produce, marinate the chicken, get the rice started. At 3 PM the couch won. By 5 PM you were two episodes into something you'd already seen. The produce is still in the bag.",
    "h1":             "You didn't skip prep.<br>You skipped a second job with no infrastructure to support it.",
    "p1":             "This is not laziness. It's the moment where the effort required — three apps, figure out the week, make a grocery list, find recipes that match what you have — is bigger than the energy available on a Sunday afternoon. The plan fails before it starts.",
    "p2":             "The problem was never you. The system was disconnected. Prep requires upfront cognitive work that no one talks about. You weren't skipping prep. You were skipping a second full job with no infrastructure to support it.",
    "solve":          "easyChef Pro does the planning layer — so prep is a decision, not a project.",
    "cta_headline":   "Sunday that actually restores.",
    "cta_lp":         "waitlist-b",
    "cta_domain":     "launch.easychefpro.com",
    "ps":             "P.S. The couch didn't win. The system lost.",
    "icp":            "super_mom_time",
},
"EC-2026-001-SEQ-3-E4-A": {
    "subject_line":   "You needed a few things. The receipt said $214.",
    "preview_text":   "Not one big splurge. Seventeen small ones.",
    "scene_headline": "Saturday morning. You went in for a few things.",
    "scene_subtext":  "Forty-five minutes later you're loading a full cart into the car, $214 receipt in your pocket, and you can't quite account for where it went.",
    "h1":             "Not one expensive decision.<br>Seventeen reasonable ones with no plan behind them.",
    "p1":             "The steak because it looked good. The sauce because you might use it. The third block of cheese because it was on sale. A full cart assembled from instinct beats intention every time.",
    "p2":             "The problem was never you. The system was disconnected. Shopping without a plan attached to a real week means the cart fills itself on impulse. Impulse at the grocery store costs $1,336 a year in waste.",
    "solve":          "easyChef Pro connects the plan to the cart — what you buy matches exactly what the week needs.",
    "cta_headline":   "Buy what you'll actually use.",
    "cta_lp":         "waitlist-a",
    "cta_domain":     "launch.easychefpro.com",
    "ps":             "P.S. The $214 wasn't the problem. The missing plan was.",
    "icp":            "super_mom_money",
},
"EC-2026-001-SEQ-3-E4-B": {
    "subject_line":   "Wednesday again. Already calculating Thursday.",
    "preview_text":   "It's not worry. It's the background hum.",
    "scene_headline": "Wednesday evening. Dinner's handled.",
    "scene_subtext":  "But somewhere between clearing the plates and getting the kids settled, you're already running Thursday. What's thawed. What needs to happen tomorrow. Whether there's enough of anything.",
    "h1":             "Dinner doesn't end at dinner.<br>The next one starts before this one is even cleared.",
    "p1":             "This is what a disconnected kitchen does to your brain. Dinner doesn't end at dinner. It bleeds into the night, into tomorrow morning, into the next shop. There's no moment where the food situation is just settled.",
    "p2":             "The problem was never you. The system was disconnected. A kitchen that needs constant active management takes up cognitive space that should be going somewhere else. That background hum? That's the gap.",
    "solve":          "easyChef Pro closes that gap — the week is planned, and you can actually put it down.",
    "cta_headline":   "Wednesday that ends at Wednesday.",
    "cta_lp":         "waitlist-b",
    "cta_domain":     "launch.easychefpro.com",
    "ps":             "P.S. The calculation in your head every night? That's 5-10 hours a week. Every week.",
    "icp":            "super_mom_time",
},
# ─── SEQ-4  (Jul 2-5 · post-launch · CTA -> easychefpro.com) ────────────────
"EC-2026-001-SEQ-4-E1-A": {
    "subject_line":   "The first week it actually held.",
    "preview_text":   "Not different. Just connected.",
    "scene_headline": "Saturday. You stand at the counter clearing the fridge.",
    "scene_subtext":  "The spinach. Two yogurts. Half a pepper. You toss it. Then you stop. It's less than usual. Noticeably less.",
    "h1":             "Same family. Same schedule. Same week.<br>The system finally connected.",
    "p1":             "For years the problem looked like a planning problem, a discipline problem, or a 'you should meal prep' problem. It was never any of those. The groceries and the plan and the week were always three separate things that never talked to each other.",
    "p2":             "The problem was never you. The system was disconnected. And now there's a system that connects it — built for the life that actually changes week to week, not the idealized version.",
    "solve":          "easyChef Pro is live. And the first week looks different.",
    "cta_headline":   "Claim founding member access.",
    "cta_lp":         "",
    "cta_domain":     "easychefpro.com",
    "ps":             "P.S. The $1,336 doesn't vanish overnight. But Saturday starts to feel different.",
    "icp":            "super_mom_money",
},
"EC-2026-001-SEQ-4-E1-B": {
    "subject_line":   "Wednesday at 6. Different.",
    "preview_text":   "Same time. Same kids. Something finally shifted.",
    "scene_headline": "Wednesday. 6:02 PM. You walk in knowing exactly what's for dinner.",
    "scene_subtext":  "It's already thawed. The ingredients are there. You don't stand at the fridge running inventory. You just start cooking. The kids ask what's for dinner. You tell them.",
    "h1":             "That sounds small.<br>It isn't.",
    "p1":             "For months the 6 PM fridge scan was the pressure point where the week revealed whether Sunday actually worked. Most weeks it didn't.",
    "p2":             "The problem was never you. The system was disconnected. When Sunday planning and Wednesday dinner are finally connected — when what you decided actually carries forward — 6 PM gets easy.",
    "solve":          "easyChef Pro is live. Wednesday can be that now.",
    "cta_headline":   "Claim founding member access today.",
    "cta_lp":         "",
    "cta_domain":     "easychefpro.com",
    "ps":             "P.S. The 6 PM scramble costs 5-10 hours a week. Every week. That ends here.",
    "icp":            "super_mom_time",
},
"EC-2026-001-SEQ-4-E2-A": {
    "subject_line":   "You knew what was in the pantry. That was the difference.",
    "preview_text":   "Four cans of chickpeas, no more.",
    "scene_headline": "Thursday evening. You open the pantry. You know what's there.",
    "scene_subtext":  "Not because you have a photographic memory — because you planned this. The chicken is thawed, the produce is what you need, and the pantry has exactly what the week requires.",
    "h1":             "No defensive buying. No duplicate anything.<br>No missing piece.",
    "p1":             "For a long time the pantry felt like a liability — full of things that didn't connect, missing the one thing you actually needed. The fix seemed like 'better organization.' It was never about organization. It was about connection — the pantry talking to the plan.",
    "p2":             "The problem was never you. The system was disconnected. A pantry without a plan attached to it is just storage. With the right system, it's a kitchen that knows what week it is.",
    "solve":          "easyChef Pro is live. The pantry finally knows what the week needs.",
    "cta_headline":   "Get founding member access.",
    "cta_lp":         "",
    "cta_domain":     "easychefpro.com",
    "ps":             "P.S. The $1,336 in grocery waste starts here — not in the trash, in the pantry with no plan.",
    "icp":            "super_mom_money",
},
"EC-2026-001-SEQ-4-E2-B": {
    "subject_line":   "A whole week. You only decided dinner once.",
    "preview_text":   "Sunday. That was it.",
    "scene_headline": "Sunday you made the call.",
    "scene_subtext":  "Dinner for the week: decided. The produce: specific. The thawing schedule: set. Monday through Thursday you executed. No 6:30 PM calculations. No fridge inventory in your head. One decision. The week followed.",
    "h1":             "You made one decision on Sunday.<br>The week actually followed.",
    "p1":             "This sounds like something that should have existed for years. It didn't — because everything was fragmented. The recipe app, the grocery list, the fridge contents, the schedule. Different places, none of them talking to the others.",
    "p2":             "The problem was never you. The system was disconnected. The week-that-works isn't about discipline. It's about the decision you make on Sunday staying intact until Friday.",
    "solve":          "easyChef Pro is live. One Sunday decision now holds the whole week.",
    "cta_headline":   "Founding member access — today.",
    "cta_lp":         "",
    "cta_domain":     "easychefpro.com",
    "ps":             "P.S. Five to ten hours a week, given back. That's the first thing that changes.",
    "icp":            "super_mom_time",
},
"EC-2026-001-SEQ-4-E3-A": {
    "subject_line":   "The math. And the window closing.",
    "preview_text":   "What changes first when the system connects.",
    "scene_headline": "Saturday. You're at the trash can.",
    "scene_subtext":  "The spinach. Two yogurts. Half a pepper. You've done this before. Every week, some version of this. Fifty-two weeks. $111 a month. $1,336 a year.",
    "h1":             "Not one big waste.<br>Twelve months of Sundays that didn't connect to Wednesdays.",
    "p1":             "A grocery run and a meal plan and a week that never synchronized. The average family doesn't throw away money carelessly — they throw it away systematically, because the system was always disconnected.",
    "p2":             "The problem was never you. The system was disconnected. And now there's a system built to close exactly that gap — the one between what you buy and what you actually use.",
    "solve":          "easyChef Pro is live. Founding member pricing closes today.",
    "cta_headline":   "Claim the founding member price.",
    "cta_lp":         "",
    "cta_domain":     "easychefpro.com",
    "ps":             "P.S. The $1,336 is a year. The founding member price is the first month. The math is obvious.",
    "icp":            "super_mom_money",
},
"EC-2026-001-SEQ-4-E3-B": {
    "subject_line":   "The hours. And the window closing.",
    "preview_text":   "What the kitchen actually costs you, per week.",
    "scene_headline": "9:47 PM. You were about to turn off the light.",
    "scene_subtext":  "Did you thaw anything for tomorrow? You didn't. This is the third night this week the kitchen found you before you could put it down.",
    "h1":             "You've tried to solve this.<br>Nothing held because the problem was never in any one tool.",
    "p1":             "Five to ten hours a week, every week. The planning, the re-planning, the mid-week store run, the 6 PM inventory call, the 9:47 PM chicken check. Each piece small. The total invisible. The kitchen required constant active management — and that job belonged to you by default.",
    "p2":             "The problem was never you. The system was disconnected. And now there's a system that connects it — one that evolves as your schedule changes, your family changes, your life changes.",
    "solve":          "easyChef Pro is live. Founding member pricing closes today.",
    "cta_headline":   "Claim the founding member price.",
    "cta_lp":         "",
    "cta_domain":     "easychefpro.com",
    "ps":             "P.S. Ten hours a week is 520 hours a year. That's 21 days. What would you do with 21 days back?",
    "icp":            "super_mom_time",
},
}

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode("utf-8"))

def read_base(filename):
    with open(os.path.join(TEMPLATE_DIR, filename), "r", encoding="utf-8") as f:
        return f.read()

def build_html(c, dl_id, asset_id, send_day):
    is_money = c["icp"] == "super_mom_money"
    short_id = asset_id.replace("EC-2026-001-", "")
    parts    = short_id.split("-", 2)
    seq_disp = f"{parts[0]}-{parts[1]} * {parts[2]}" if len(parts) == 3 else short_id
    tid      = TEMPLATE_IDS[asset_id]
    domain   = c.get("cta_domain", "launch.easychefpro.com")
    lp_path  = f"/lp/{c['cta_lp']}" if c["cta_lp"] else ""
    cta_url  = (f"https://{domain}{lp_path}"
                f"?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001"
                f"&utm_content={dl_id}&utm_term={short_id}")
    base     = read_base("SEQ-1-E1-A_v3.html" if is_money else "SEQ-2-E1-B_v2.html")
    html     = base

    # Determine context label for metadata
    seq_num = parts[1] if len(parts) >= 2 else "?"
    if seq_num in ("SEQ-3", "SEQ-4"):
        flow_ref = f"Campaign -> {'UQTdyL (Variant A)' if is_money else 'VpgZPZ (Variant B)'}"
    else:
        flow_ref = "XfqUtU (Flow A)" if is_money else "XCyc4m (Flow B)"

    if is_money:
        html = html.replace(
            "<title>SEQ-1 \xb7 E1-A \xb7 That $47 DoorDash charge. You already paid for that dinner.</title>",
            f"<title>{seq_disp} \xb7 {c['subject_line']}</title>"
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
            f"<title>{seq_disp} \xb7 {c['subject_line']}</title>"
        )
        html = html.replace(
            "<!-- ── PREHEADER ── single scene: Sunday plan → Wednesday wall -->",
            f"<!-- ── PREHEADER ── {c['scene_headline']} -->"
        )
        html = html.replace(
            "The 6:30 wall isn't about time. The plan just had nowhere to live.",
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
            "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Wednesday 6:30 doesn't have to be a permanent feature of your week.",
            c["ps"]
        )

    variant  = "A" if is_money else "B"
    metadata = f"""<!--
================================================================
  ASSET METADATA
  {{{{ASSET_ID}}}}      {asset_id}
  {{{{KLAVIYO_ID}}}}    {tid} (standalone -- wire in Klaviyo UI)
  {{{{DL_ID}}}}         {dl_id}
  {{{{ICP}}}}           {c['icp']}
  {{{{VARIANT}}}}       {variant}
  {{{{SEQUENCE}}}}      {seq_disp}
  {{{{FLOW}}}}          {flow_ref}
  {{{{SEND_DAY}}}}      Day {send_day}
  {{{{SUBJECT}}}}       {c['subject_line']}
  {{{{PREVIEW}}}}       {c['preview_text']}
  {{{{SCENE}}}}         {c['scene_headline']} (EMAIL_LP_RELATIONSHIP_001)
  {{{{RULE}}}}          EMAIL_LP_RELATIONSHIP_001 -- single scene, not LP retell
  {{{{STATUS}}}}        APPROVED -- all 5 governance rules pass -- Taylor approved May 20 2026
  {{{{VERSION}}}}       v2 -- full governance rewrite
================================================================
-->"""
    html = re.sub(
        r'<!--\n={64}\n  ASSET METADATA.*?={64}\n-->',
        metadata, html, flags=re.DOTALL
    )
    return html


def main():
    print("Reading EmailSequences...")
    seqs    = post_gas({"action": "email_sequences_read", "campaign_id": "EC-2026-001"}).get("sequences", [])
    seq_map = {s["id"]: s for s in seqs}

    print(f"\n{'='*57}\nSTEP 1: Write to EmailSequences tab\n{'='*57}")
    ok = 0; fail = 0
    for sid, c in APPROVED.items():
        seq = dict(seq_map.get(sid, {"id": sid}))
        seq.update({
            "subject_line":    c["subject_line"],
            "preview_text":    c["preview_text"],
            "body_hook":       c["scene_headline"] + " " + c["scene_subtext"],
            "body_problem":    c["p1"],
            "body_agitate":    c["p2"],
            "body_solve":      c["solve"],
            "body_cta":        c["cta_headline"].replace("<br>", " "),
            "status":          "APPROVED",
            "approved":        True,
            "approved_by":     "Taylor",
            "built_in_klaviyo": True,
            "seq_template_id": TEMPLATE_IDS[sid],
        })
        wr    = post_gas({"action": "email_sequences_write", "sequence": seq})
        short = sid.replace("EC-2026-001-", "")
        print(f"  {short:<25} {'ok' if wr.get('ok') else 'FAIL: '+str(wr)}")
        if wr.get("ok"): ok += 1
        else:            fail += 1
        time.sleep(0.4)
    print(f"  Writes: {ok} ok / {fail} fail")

    print(f"\n{'='*57}\nSTEP 2: Rebuild HTML + update Klaviyo\n{'='*57}")
    h_ok = 0; k_ok = 0; k_fail = 0
    for sid, c in APPROVED.items():
        seq      = seq_map.get(sid, {})
        dl_id    = seq.get("dl_id", "")
        send_day = seq.get("send_day", "0")
        short    = sid.replace("EC-2026-001-", "")
        tid      = TEMPLATE_IDS[sid]

        html  = build_html(c, dl_id, sid, send_day)
        fname = f"{short}_v2.html"
        with open(os.path.join(TEMPLATE_DIR, fname), "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  Saved: {fname}")
        h_ok += 1

        resp = post_gas({"action": "klaviyo_update_template", "template_id": tid, "html": html})
        if resp.get("ok"):
            print(f"    Klaviyo {tid} updated OK")
            k_ok += 1
        else:
            print(f"    Klaviyo {tid} FAIL: {resp.get('error','?')} code={resp.get('code','?')}")
            k_fail += 1
        time.sleep(0.5)

    print(f"\n  HTML saved: {h_ok}/14  |  Klaviyo updated: {k_ok}/14  |  Klaviyo fail: {k_fail}")
    print("SEQ-3 + SEQ-4 write complete.")

if __name__ == "__main__":
    main()
