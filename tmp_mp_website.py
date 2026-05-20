import json, urllib.request, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def gas_post(payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(GAS_URL, data=data,
          headers={"Content-Type": "text/plain"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())

# ── Website-level Master Positioning — no ICP, universal brand thesis ─────────
# Master undertone confirmed: "She is not the problem. The system was never built for her."
# Applies to both super_mom_money + super_mom_time. This drives the website homepage,
# about page, hero section, and any brand-level copy that is not ICP-variant-specific.

ts = str(int(time.time() * 1000))
pid = f"MP-WEBSITE-001-{ts}"

positioning = {
    "positioning_id":  pid,
    "campaign_id":     "EC-2026-001",
    "icp_code":        "website",          # no specific ICP — universal brand layer
    "theme_slug":      "system-never-built-for-her",
    "status":          "DRAFT",

    # ── MASTER UNDERTONE ──────────────────────────────────────────────────
    "master_undertone": (
        "She is not the problem. The system was never built for her."
    ),

    # ── WHO SHE IS — universal, no ICP variant ───────────────────────────
    "who_she_is": (
        "She has cooked thousands of meals. Googled thousands of recipes. Tried the apps. "
        "Built the Paprika library. Set up the AnyList. And she still stands at the fridge "
        "at 6 PM wondering what to make tonight. "
        "She is not disorganized. She is not a bad cook. She is not the problem. "
        "No tool has ever connected what is in her fridge to what can be on her table tonight — "
        "in real time, for her specific kitchen, without five open tabs."
    ),

    # ── CORE TRUTH ────────────────────────────────────────────────────────
    "core_truth": (
        "The dinner decision is not a skill problem. It is a system problem. "
        "No tool has ever closed the loop between what she has and what she can make — "
        "until now."
    ),

    # ── MASTER STORY ──────────────────────────────────────────────────────
    "master_story": (
        "Your kitchen has always had what you needed. "
        "The problem was never the ingredients or the skill — it was the gap between "
        "what is in the fridge and what ends up on the table. "
        "Five apps. None of them talk to each other. None of them know your pantry. "
        "easyChef Pro closes that gap. "
        "Dinner decided. Week organized. Money staying in your account. "
        "Your kitchen. In command."
    ),

    # ── WHAT WE SAY — hero / above-the-fold ──────────────────────────────
    "what_we_say": (
        "Dinner decided before you open the fridge. "
        "easyChef Pro is the first app that knows what you have, what your family eats, "
        "and what you can make — right now, tonight, in 30 minutes."
    ),

    # ── FEELING SOLD — after-state ────────────────────────────────────────
    "feeling_sold": (
        "She walks into her kitchen and it already knows what is for dinner. "
        "Not because someone else planned it. Because the system finally works for her. "
        "She did not change. The tool did. "
        "Her kitchen is in command. So is she."
    ),

    # ── LOSS AVERSION — universal (not ICP-gated) ─────────────────────────
    "loss_aversion_line": (
        "Every night she wings it is an evening she did not choose for her family. "
        "Approved uses: hero section · email subject · TikTok overlay · LP subheadline"
    ),

    # ── PROOF POINT ───────────────────────────────────────────────────────
    "proof_point": (
        "Founding members save $1,336 per year on groceries and reclaim 10-21 full days "
        "they used to spend on food decisions. "
        "($1,336 = proof section only — never the hook. Time cost = the hook.)"
    ),

    # ── MESSAGE HIERARCHY — website layer ─────────────────────────────────
    "message_hierarchy": (
        "1. Dinner decided before she opens the fridge (the system problem is solved)\n"
        "2. Founding family identity (she chose this — she wins first)\n"
        "3. $1,336 savings (proof only — never hook)\n"
        "4. $7.99 founding price (CTA only — never lead)"
    ),

    # ── EMOTIONAL ARC — 7 stages ──────────────────────────────────────────
    "emotional_arc": json.dumps([
        "seen", "validated", "activated",
        "curious", "relieved", "proud", "in control"
    ]),

    # ── STAGE 5 ───────────────────────────────────────────────────────────
    "stage_5_retention_job": (
        "She has cooked 3+ meals, saved food waste once, and has 20+ pantry items tracked. "
        "She is not trying the app — she is living in it. "
        "Tipping Point is the moment the system proves itself. "
        "Paid Conversion follows within 7 days."
    ),

    # ── ANTI-PATTERNS — what the website must never do ────────────────────
    "anti_patterns": (
        "Never imply she is the problem. Never lead with money for time-angle audience. "
        "Never use 'meal planning' as the category frame — that implies effort. "
        "Never use 'AI' as a feature hook — it reads as cold. "
        "The frame is: the system was broken. We fixed the system."
    ),

    "generated_by": "claude-sonnet-4-20250514",
    "ml_approved":  False,
    "locked":       False,
}

print(f"Positioning ID: {pid}")
print("Saving website Master Positioning...")
r = gas_post({"action": "master_positioning_save", "positioning": positioning})
print(f"  Save: ok={r.get('ok')} — {r.get('positioning_id','')}")
if not r.get('ok'):
    print(f"  ERROR: {r}")
    exit(1)

print("\nDone. Review in MasterPositioning tab.")
print(f"  Positioning ID: {pid}")
print(f"  ICP:            website (universal)")
print(f"  Status:         DRAFT — review then lock")
print(f"\nMaster undertone: She is not the problem. The system was never built for her.")
