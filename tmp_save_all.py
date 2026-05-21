"""
Save template IDs back to EmailSequences tab.
Also write CampaignBriefs row for EC-2026-001.
"""
import json, urllib.request, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

TEMPLATE_IDS = {
    "EC-2026-001-SEQ-1-E1-A": "UxsJ3U",
    "EC-2026-001-SEQ-1-E1-B": "RmZJyL",
    "EC-2026-001-SEQ-1-E2-A": "WqLmGD",
    "EC-2026-001-SEQ-1-E2-B": "VxRy3Q",
    "EC-2026-001-SEQ-1-E3-A": "TqUD9M",
    "EC-2026-001-SEQ-1-E3-B": "W8RAvW",
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

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode("utf-8"))


# ── STEP 1: Write template IDs back to EmailSequences tab ───────

print("=== STEP 1: Writing template IDs to EmailSequences ===")
result = post_gas({"action": "email_sequences_read", "campaign_id": "EC-2026-001"})
seqs   = result.get("sequences", [])

ok_count  = 0
err_count = 0

for seq in seqs:
    sid = seq.get("id", "")
    if sid not in TEMPLATE_IDS:
        continue
    tid = TEMPLATE_IDS[sid]
    updated = dict(seq)
    updated["seq_template_id"]    = tid   # standalone Klaviyo template ID
    updated["built_in_klaviyo"]   = True
    updated["status"]             = "BUILT_V1"
    try:
        wr = post_gas({"action": "email_sequences_write", "sequence": updated})
        ok = wr.get("ok", False)
        short = sid.replace("EC-2026-001-", "")
        print(f"  {short:<25} tid={tid}  write_ok={ok}")
        if ok:
            ok_count += 1
        else:
            err_count += 1
            print(f"    ERROR: {wr}")
    except Exception as e:
        err_count += 1
        print(f"  ERROR {sid}: {e}")
    time.sleep(0.4)

print(f"\n  Done: {ok_count} ok, {err_count} errors")


# ── STEP 2: Probe CampaignBriefs schema ─────────────────────────

print("\n=== STEP 2: Probing CampaignBriefs tab ===")
try:
    cb = post_gas({"action": "campaign_briefs_read", "campaign_id": "EC-2026-001"})
    print("campaign_briefs_read response:", json.dumps(cb)[:500])
except Exception as e:
    print(f"  campaign_briefs_read failed: {e}")

# Try generic read_tab
try:
    tb = post_gas({"action": "read_tab", "tab": "CampaignBriefs", "campaign_id": "EC-2026-001"})
    print("read_tab CampaignBriefs:", json.dumps(tb)[:500])
except Exception as e:
    print(f"  read_tab failed: {e}")

# Try system_health_check to see what briefs look like
hc = post_gas({"action": "system_health_check", "campaign_id": "EC-2026-001"})
print("health check ok:", hc.get("ok"), "deploy:", hc.get("deploy_number"))
print("brief_count:", hc.get("brief_count"), "lp_spine:", hc.get("lp_spine"))
