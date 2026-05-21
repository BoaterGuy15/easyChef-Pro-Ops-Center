import json, urllib.request

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))

# Read all sequences
seqs = post_gas({"action": "email_sequences_read", "campaign_id": "EC-2026-001"})
all_seqs = seqs.get("sequences", [])

# Find E1-A and E1-B
e1a = next((s for s in all_seqs if s.get("id") == "EC-2026-001-SEQ-1-E1-A"), None)
e1b = next((s for s in all_seqs if s.get("id") == "EC-2026-001-SEQ-2-E1-B"), None)

if e1a:
    e1a["klaviyo_template_id"] = "UxsJ3U"
    r = post_gas({"action": "email_sequences_write", "sequence": e1a})
    print("E1-A write:", r)

if e1b:
    e1b["klaviyo_template_id"] = "YvrLDj"
    e1b["dl_id"] = "DL-EM-0043"
    r = post_gas({"action": "email_sequences_write", "sequence": e1b})
    print("E1-B write:", r)
