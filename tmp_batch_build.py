import json, urllib.request, os, sys, re

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))

# --- Fetch all EmailSequences for EC-2026-001 ---
print("Reading EmailSequences tab...")
result = post_gas({"action": "email_sequences_read", "campaign_id": "EC-2026-001"})
seqs = result.get("sequences", [])
print(f"Total rows returned: {len(seqs)}")

# Print all fields available
if seqs:
    print("Fields available:", list(seqs[0].keys()))

# Print each row summary
for s in seqs:
    seq_id = s.get("id","?")
    dl_id  = s.get("dl_id","")
    klav   = s.get("klaviyo_template_id","")
    subj   = s.get("subject_line","")[:50] if s.get("subject_line") else ""
    icp    = s.get("icp_code","")
    print(f"  {seq_id} | dl={dl_id} | klav={klav} | icp={icp} | subj={subj}")
