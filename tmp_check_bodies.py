import json, urllib.request

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))

result = post_gas({"action": "email_sequences_read", "campaign_id": "EC-2026-001"})
seqs = result.get("sequences", [])

# Check body fields for first 6 rows (SEQ-1 + SEQ-2 samples)
check_ids = [
    "EC-2026-001-SEQ-1-E1-A",
    "EC-2026-001-SEQ-1-E2-A",
    "EC-2026-001-SEQ-2-E1-B",
    "EC-2026-001-SEQ-2-E3-B",
    "EC-2026-001-SEQ-3-E1-A",
    "EC-2026-001-SEQ-4-E1-B",
]

for s in seqs:
    if s.get("id") not in check_ids:
        continue
    print(f"\n{'='*60}")
    print(f"ID: {s.get('id')}")
    print(f"subject_line:  {s.get('subject_line','')}")
    print(f"preview_text:  {s.get('preview_text','')}")
    print(f"body_hook:     {s.get('body_hook','')[:120]}")
    print(f"body_problem:  {s.get('body_problem','')[:120]}")
    print(f"body_agitate:  {s.get('body_agitate','')[:120]}")
    print(f"body_solve:    {s.get('body_solve','')[:120]}")
    print(f"body_cta:      {s.get('body_cta','')[:120]}")
    print(f"body_value:    {s.get('body_value','')[:120]}")
    print(f"full_email_body: {str(s.get('full_email_body',''))[:120]}")
    print(f"klaviyo_id:    {s.get('klaviyo_id','')}")
    print(f"dl_id:         {s.get('dl_id','')}")
    print(f"icp_code:      {s.get('icp_code','')}")
    print(f"send_day:      {s.get('send_day','')}")
