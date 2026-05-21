"""Probe available copy generation actions in GAS."""
import json, urllib.request

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode("utf-8"))

# Try actions that invoke getMasterSystemPrompt + copy model
for act in [
    "get_master_system_prompt",
    "getMasterSystemPrompt",
    "generate_email_copy",
    "generate_copy",
    "generate_asset",
    "build_single_email",
    "generate_email",
]:
    try:
        r = post_gas({"action": act, "campaign_id": "EC-2026-001",
                      "type": "email", "icp_code": "super_mom_money"})
        print(f"{act}: ok={r.get('ok')} keys={list(r.keys())[:8]}")
        if r.get("ok"):
            print(f"  FOUND! Response snippet: {json.dumps(r)[:300]}")
    except Exception as e:
        print(f"{act}: ERROR {e}")

# Also check what build_email_sequence needs
print()
r = post_gas({"action": "build_email_sequence",
              "campaign_id": "EC-2026-001",
              "sequence_id": "EC-2026-001-SEQ-1-E1-B"})
print(f"build_email_sequence: ok={r.get('ok')} err={r.get('error','')} keys={list(r.keys())}")
if r.get("ok"):
    print(f"  RESPONSE: {json.dumps(r)[:500]}")
