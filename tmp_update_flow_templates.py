"""
Update FLOW STEP templates for Flow A (XfqUtU) and Flow B (XCyc4m).

Phase 1 (default): diagnostic — prints which template IDs are on each flow step
                   and reads their current subject lines so you can verify order.
Phase 2: run with --update flag to actually push v2 HTML to each flow-step template.
"""
import json, urllib.request, os, sys, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email-templates")

# Flow A (XfqUtU) — step order (0-indexed) → asset ID
# Interleaved SEQ-1 (odd steps) + SEQ-2 (even steps)
FLOW_A_MAP = [
    "EC-2026-001-SEQ-1-E1-A",  # Step 1
    "EC-2026-001-SEQ-2-E1-A",  # Step 2
    "EC-2026-001-SEQ-1-E2-A",  # Step 3
    "EC-2026-001-SEQ-2-E2-A",  # Step 4
    "EC-2026-001-SEQ-1-E3-A",  # Step 5
    "EC-2026-001-SEQ-2-E3-A",  # Step 6
    "EC-2026-001-SEQ-2-E4-A",  # Step 7
    "EC-2026-001-SEQ-2-E5-A",  # Step 8
]

# Flow B (XCyc4m) — same interleaved structure, B variants
FLOW_B_MAP = [
    "EC-2026-001-SEQ-1-E1-B",  # Step 1
    "EC-2026-001-SEQ-2-E1-B",  # Step 2
    "EC-2026-001-SEQ-1-E2-B",  # Step 3
    "EC-2026-001-SEQ-2-E2-B",  # Step 4
    "EC-2026-001-SEQ-1-E3-B",  # Step 5
    "EC-2026-001-SEQ-2-E3-B",  # Step 6
    "EC-2026-001-SEQ-2-E4-B",  # Step 7
    "EC-2026-001-SEQ-2-E5-B",  # Step 8
]

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

def html_path(asset_id):
    short = asset_id.replace("EC-2026-001-", "")
    return os.path.join(TEMPLATE_DIR, short + "_v2.html")

def main():
    do_update = "--update" in sys.argv

    print("=" * 60)
    print("FLOW STEP TEMPLATE UPDATE")
    print("Mode:", "UPDATE (pushing v2 HTML)" if do_update else "DIAGNOSTIC (dry run)")
    print("=" * 60)

    # ── Step 1: Get flow step template IDs via backfill ──────────────
    print("\nCalling backfill_flow_message_ids...")
    result = post_gas({"action": "backfill_flow_message_ids", "campaign_id": "EC-2026-001"})
    if not result.get("ok"):
        print("FAILED:", result)
        return

    raw = result.get("raw_actions", [])
    api_errors = result.get("api_errors", [])
    if api_errors:
        print("API errors:", api_errors)

    flow_a_steps = [r for r in raw if r.get("seq") == "SEQ-1"]
    flow_b_steps = [r for r in raw if r.get("seq") == "SEQ-2"]

    print(f"Flow A steps from Klaviyo: {len(flow_a_steps)}")
    print(f"Flow B steps from Klaviyo: {len(flow_b_steps)}")

    if len(flow_a_steps) != 8:
        print(f"WARNING: Expected 8 steps for Flow A, got {len(flow_a_steps)}")
    if len(flow_b_steps) != 8:
        print(f"WARNING: Expected 8 steps for Flow B, got {len(flow_b_steps)}")

    # ── Step 2: Build update plan ─────────────────────────────────────
    plan = []
    for i, asset_id in enumerate(FLOW_A_MAP):
        if i < len(flow_a_steps):
            step = flow_a_steps[i]
            plan.append({
                "flow": "A (XfqUtU)",
                "step": i + 1,
                "asset_id": asset_id,
                "flow_msg_id": step.get("msg_id", ""),
                "template_id": step.get("template_id", ""),
                "msg_name": step.get("name", ""),
            })
    for i, asset_id in enumerate(FLOW_B_MAP):
        if i < len(flow_b_steps):
            step = flow_b_steps[i]
            plan.append({
                "flow": "B (XCyc4m)",
                "step": i + 1,
                "asset_id": asset_id,
                "flow_msg_id": step.get("msg_id", ""),
                "template_id": step.get("template_id", ""),
                "msg_name": step.get("name", ""),
            })

    # ── Step 3: Diagnostic — read current subjects ────────────────────
    print("\n" + "-" * 60)
    print(f"{'Flow':<14} {'Step':<5} {'Asset':<24} {'Tmpl ID':<8} {'Current subject (first 45 chars)'}")
    print("-" * 60)
    for row in plan:
        tid = row["template_id"]
        current_subj = "?"
        if tid:
            try:
                tr = post_gas({"action": "klaviyo_get_template", "template_id": tid})
                current_subj = (tr.get("subject") or tr.get("name") or "?")[:45]
                time.sleep(0.3)
            except Exception as e:
                current_subj = f"ERR: {e}"
        short = row["asset_id"].replace("EC-2026-001-", "")
        print(f"  {row['flow']:<12} {row['step']:<5} {short:<24} {tid:<8} {current_subj}")

    if not do_update:
        print("\nDiagnostic complete. Run with --update to push v2 HTML to flow-step templates.")
        print("Verify the step order above looks correct before running --update.")
        return

    # ── Step 4: Push v2 HTML to each flow-step template ──────────────
    print("\n" + "=" * 60)
    print("UPDATING FLOW-STEP TEMPLATES")
    print("=" * 60)


    ok = 0; fail = 0; missing = 0
    results_table = []
    for row in plan:
        short = row["asset_id"].replace("EC-2026-001-", "")
        tid   = row["template_id"]
        fpath = html_path(row["asset_id"])

        if not tid:
            print(f"  {short}: NO template_id — skipping")
            fail += 1
            results_table.append((row["flow"], row["step"], short, tid, "NO TEMPLATE ID"))
            continue

        if not os.path.exists(fpath):
            print(f"  {short}: HTML FILE MISSING at {fpath}")
            missing += 1
            results_table.append((row["flow"], row["step"], short, tid, "MISSING HTML"))
            continue

        with open(fpath, encoding="utf-8") as f:
            html = f.read()

        resp = post_gas({"action": "klaviyo_update_template", "template_id": tid, "html": html})
        if resp.get("ok"):
            # Read back subject to confirm
            tr = post_gas({"action": "klaviyo_get_template", "template_id": tid})
            new_subj = (tr.get("subject") or tr.get("name") or "?")[:40]
            print(f"  {short:<24} {tid}  OK  subject={new_subj}")
            results_table.append((row["flow"], row["step"], short, tid, "OK"))
            ok += 1
        else:
            err = resp.get("error") or resp.get("message") or str(resp)
            print(f"  {short:<24} {tid}  FAIL: {err[:60]}")
            results_table.append((row["flow"], row["step"], short, tid, f"FAIL: {err[:40]}"))
            fail += 1

        time.sleep(0.6)

    # ── Summary table ─────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print(f"{'Flow':<14} {'Step':<5} {'Asset':<24} {'Tmpl ID':<8} Status")
    print("-" * 60)
    for r in results_table:
        flow, step, asset, tid, status = r
        print(f"  {flow:<12} {step:<5} {asset:<24} {tid:<8} {status}")
    print("-" * 60)
    print(f"Updated: {ok}/16  |  Failed: {fail}  |  Missing HTML: {missing}")

if __name__ == "__main__":
    main()
