"""
Copy audit: check all 30 SEQ-1 to SEQ-4 emails against governance rules.
Rules:
  1. EMAIL_LP_RELATIONSHIP_001 — single scene (not LP mirror / multi-paragraph argument)
  2. SO_WHAT_ARCH_001 — Recognition -> Realization -> Resolution
  3. MASTER_STORY_001 — no retired taglines, correct story lines
  4. MONEY_MESSAGE_PLACEMENT_001 — $1336 never hook for super_mom_time (B)
  5. Anti-patterns — no "meal planning" as hook, no "AI" hook, no "Your kitchen, in command"
"""
import json, urllib.request

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode("utf-8"))

result = post_gas({"action": "email_sequences_read", "campaign_id": "EC-2026-001"})
seqs   = result.get("sequences", [])

seq_filter = ["SEQ-1", "SEQ-2", "SEQ-3", "SEQ-4"]
target = [
    s for s in seqs
    if any(s.get("id","").startswith(f"EC-2026-001-{sq}-") for sq in seq_filter)
]

# Governance rule checks
MONEY_STATS    = ["$1,336", "$1336", "111 every month", "$111/month", "$111 a month", "1,336 of groceries", "throws away"]
BANNED_PHRASES = ["Your kitchen, in command", "in command", "meal planning", "meal plan", "AI", "artificial intelligence"]
SCENE_OPENERS  = ["PM", "AM", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
                  "morning", "evening", "night", "tonight", "today", "yesterday"]

def is_scene_opener(text):
    """Check if text opens with a specific scene (time/place/moment)."""
    text_lower = text.lower()
    # A scene opener starts with a sensory/time/moment anchor
    for s in SCENE_OPENERS:
        if text.startswith(s) or text.lower().startswith(s.lower()):
            return True
    # Check for common scene patterns
    if any(text.startswith(p) for p in ["The ", "It ", "She ", "You ", "Her ", "Your "]):
        # "The chicken is still in your fridge" = scene
        # "The average family throws away" = stat (not scene)
        stat_words = ["average", "family", "every week", "every month", "every year", "percent", "%", "studies"]
        if any(w in text.lower() for w in stat_words):
            return False
        return True
    return False

def has_argument_structure(hook, problem, agitate):
    """Check if email reads like a multi-paragraph LP argument rather than a single scene."""
    # LP argument pattern: starts with stat/claim, then problem, then agitate = 3 distinct arguments
    combined = (hook + " " + problem + " " + agitate).lower()
    # If it has 3+ distinct "value proposition" sentences = LP mirror
    lp_patterns = ["the average", "every week", "every month", "every year", "$1,336", "here is how",
                   "the feature", "TRACK feature", "PLAN feature", "SHOP feature", "three features",
                   "scan your fridge", "point your phone"]
    hits = sum(1 for p in lp_patterns if p in combined)
    return hits >= 2

def check_money_hook_in_b(icp_code, subject, preview, hook):
    """Rule 4: $1336 / money stats should never be the HOOK for super_mom_time."""
    if "time" not in icp_code:
        return False  # Only applies to B variant
    combined = (subject + " " + preview + " " + hook).lower()
    for stat in ["$1,336", "$111", "1,336", "throws away", "grocery budget", "money", "cost"]:
        if stat.lower() in combined[:200]:  # Only check the opening
            return True
    return False

def check_banned(subject, preview, hook, problem):
    """Check for banned phrases anywhere in copy."""
    combined = (subject + " " + preview + " " + hook + " " + problem).lower()
    hits = []
    for phrase in BANNED_PHRASES:
        if phrase.lower() in combined:
            hits.append(phrase)
    return hits

def check_feature_names_in_hook(hook):
    """Emails should not mention specific feature names (TRACK, PLAN, SHOP) in the hook."""
    feature_names = ["TRACK feature", "PLAN feature", "SHOP feature", "the app", "easyChef Pro's"]
    for f in feature_names:
        if f.lower() in hook.lower():
            return f
    return None

# ─── Audit ───────────────────────────────────────────────────────

PASS = []
FAIL = []

print("=" * 70)
print("COPY AUDIT — EC-2026-001 SEQ-1 to SEQ-4")
print("=" * 70)
print()

for seq in target:
    sid      = seq.get("id","")
    short    = sid.replace("EC-2026-001-","")
    icp      = seq.get("icp_code","")
    subject  = seq.get("subject_line","").strip()
    preview  = seq.get("preview_text","").strip()
    hook     = seq.get("body_hook","").strip()
    problem  = seq.get("body_problem","").strip()
    agitate  = seq.get("body_agitate","").strip()
    solve    = seq.get("body_solve","").strip()
    full     = seq.get("full_email_body","").strip()

    fails = []

    # Rule 1: EMAIL_LP_RELATIONSHIP_001 — single scene opener?
    # The scene opener should be sensory and specific — not a stat or claim
    hook_first_sent = hook.split(". ")[0] if hook else ""
    if not is_scene_opener(hook_first_sent) and not is_scene_opener(subject):
        fails.append("R1-SCENE: Opens with stat/claim, not a specific scene moment")
    elif has_argument_structure(hook, problem, agitate):
        fails.append("R1-LP-MIRROR: Multi-paragraph argument structure mirrors LP (not single scene)")

    # Rule 2: SO_WHAT_ARCH — is there a clear recognition line?
    # Look for "The problem was never you" or equivalent realization
    combined = (hook + " " + problem + " " + agitate + " " + solve).lower()
    has_recognition = any(p in combined for p in [
        "problem was never you", "system was disconnected", "system problem",
        "not your fault", "not a discipline", "not because you", "never you"
    ])
    if not has_recognition:
        fails.append("R2-SO_WHAT: No clear recognition/realization line (The problem was never you)")

    # Rule 3: MASTER_STORY — no retired taglines
    banned_tags = check_banned(subject, preview, hook, problem)
    if banned_tags:
        fails.append(f"R3-BANNED: Contains banned phrase(s): {banned_tags}")

    # Rule 4: MONEY_MESSAGE_PLACEMENT_001
    if check_money_hook_in_b(icp, subject, preview, hook):
        fails.append("R4-MONEY-HOOK: B variant leads with money stat (violates MONEY_MESSAGE_PLACEMENT_001)")

    # Rule 5: Feature names in hook
    feat = check_feature_names_in_hook(hook)
    if feat:
        fails.append(f"R5-FEATURE: Hook mentions specific app feature '{feat}' (violates EMAIL_LP_RELATIONSHIP_001)")

    # Specifically check for feature-demo language anywhere in copy
    if any(p in combined for p in ["scan your fridge", "point your phone at", "track feature", "plan feature", "shop feature"]):
        fails.append("R5-FEATURE-DEMO: Email describes app features/UI actions (violates single-scene rule)")

    status = "PASS" if not fails else "FAIL"
    if fails:
        FAIL.append({"id": short, "icp": icp, "subject": subject, "fails": fails})
    else:
        PASS.append({"id": short, "icp": icp, "subject": subject})

    # Print concise result
    print(f"{'[PASS]' if not fails else '[FAIL]'} {short:<25} icp={icp}")
    print(f"        subject: {subject[:65]}")
    for f in fails:
        print(f"        >> {f}")
    print()

print("=" * 70)
print(f"SUMMARY: {len(PASS)} PASS / {len(FAIL)} FAIL out of {len(target)} emails")
print("=" * 70)
print()
if FAIL:
    print("EMAILS REQUIRING REWRITE:")
    for item in FAIL:
        print(f"  {item['id']:<25} ({item['icp']})")
        for f in item["fails"]:
            print(f"    - {f}")
        print()
print()
print("EMAILS THAT PASS:")
for item in PASS:
    print(f"  {item['id']:<25} ({item['icp']}) | {item['subject'][:50]}")
