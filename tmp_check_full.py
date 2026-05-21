import json, urllib.request

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))

result = post_gas({"action": "email_sequences_read", "campaign_id": "EC-2026-001"})
seqs = result.get("sequences", [])

# Just check SEQ-1 through SEQ-4
seq_filter = ["SEQ-1", "SEQ-2", "SEQ-3", "SEQ-4"]
seq_emails = [s for s in seqs if any(s.get("id","").startswith(f"EC-2026-001-{sq}-") for sq in seq_filter)]

print(f"SEQ-1 to SEQ-4 rows: {len(seq_emails)}")
print()

for s in seq_emails:
    sid = s.get("id","")
    has_hook   = bool(s.get("body_hook","").strip())
    has_prob   = bool(s.get("body_problem","").strip())
    has_agit   = bool(s.get("body_agitate","").strip())
    has_solve  = bool(s.get("body_solve","").strip())
    has_full   = bool(s.get("full_email_body","").strip())
    has_subj   = bool(s.get("subject_line","").strip())
    has_prev   = bool(s.get("preview_text","").strip())
    klav_id    = s.get("klaviyo_id","")
    print(f"{sid:40} | hook={int(has_hook)} prob={int(has_prob)} agit={int(has_agit)} solve={int(has_solve)} full={int(has_full)} subj={int(has_subj)} prev={int(has_prev)} | klav={klav_id[:12]}")
