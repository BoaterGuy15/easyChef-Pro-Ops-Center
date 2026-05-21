"""
Batch Email Builder — EC-2026-001
Builds all SEQ-1 through SEQ-4 emails using v3/v2 base layouts.
Creates standalone Klaviyo templates via GAS endpoint.
Saves HTML files to email-templates/.
"""
import json, urllib.request, os, re, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "email-templates")

# Already have standalone templates for these
ALREADY_BUILT = {
    "EC-2026-001-SEQ-1-E1-A": {"klaviyo_template_id": "UxsJ3U", "file": "SEQ-1-E1-A_v3.html"},
    "EC-2026-001-SEQ-2-E1-B": {"klaviyo_template_id": "YvrLDj", "file": "SEQ-2-E1-B_v2.html"},
}

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode("utf-8"))

def read_base(filename):
    path = os.path.join(TEMPLATE_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

# ── Copy helpers ────────────────────────────────────────────────

def first_sentence(text):
    """Extract first sentence from text."""
    text = text.strip()
    for sep in [". ", "! ", "? "]:
        idx = text.find(sep)
        if 0 < idx < 180:
            return text[:idx + 1]
    return text[:150]

def split_sentences(text):
    """Split text into sentences."""
    sentences = []
    remainder = text.strip()
    for _ in range(10):
        if not remainder:
            break
        found = False
        for sep in [". ", "! ", "? "]:
            idx = remainder.find(sep)
            if 0 < idx < 250:
                sentences.append(remainder[:idx + 1])
                remainder = remainder[idx + 2:].strip()
                found = True
                break
        if not found:
            sentences.append(remainder)
            break
    return sentences

def build_h1(body_agitate, icp_code):
    """Build 2-line H1 realization from body_agitate."""
    if not body_agitate:
        if "money" in icp_code:
            return "You didn't waste $47 on DoorDash.<br>You wasted the $180 that had nowhere to go."
        else:
            return "You didn't fail the plan.<br>The plan had nowhere to live."
    sents = split_sentences(body_agitate)
    if len(sents) >= 2:
        s1 = sents[0].rstrip(".")
        s2 = sents[1].rstrip(".")
        if len(s1) < 120 and len(s2) < 120:
            return f"{s1}.<br>{s2}."
    # Single long sentence - split at midpoint on word boundary
    words = body_agitate.split()
    mid = len(words) // 2
    line1 = " ".join(words[:mid])
    line2 = " ".join(words[mid:200])
    return f"{line1}<br>{line2}"

def build_cta_headline(body_cta, icp_code, is_seq4):
    """Build 2-line CTA headline."""
    if is_seq4:
        if "money" in icp_code:
            return "The gap is closed.<br>Your $111 stays in your pocket."
        else:
            return "Tonight it's different.<br>The plan actually survived the week."
    if not body_cta:
        if "money" in icp_code:
            return "Stop the Sunday &#8594; Wednesday leak.<br>Permanently."
        else:
            return "Dinner decided.<br>Before the wall hits."
    text = body_cta.strip()
    # Split at em-dash or regular dash
    for sep in [" — ", " – ", " - ", "– "]:
        if sep in text[:100]:
            parts = text.split(sep, 1)
            return f"{parts[0].strip()}<br>{parts[1].strip()[:100]}"
    # Split at midpoint
    words = text.split()
    mid = max(3, len(words) // 2)
    return " ".join(words[:mid]) + "<br>" + " ".join(words[mid:mid+15])

def clean_for_html(text):
    """Clean text for safe HTML insertion (no tags, just entities)."""
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # Fix common apostrophe/dash issues from sheet data
    text = text.replace("−", "—").replace("'", "'").replace('"', '"').replace('"', '"')
    return text.strip()

def para_html(text, extra_style=""):
    """Wrap text in a body paragraph style."""
    base = 'font-family:\'Inter\',Arial,Helvetica,sans-serif;font-size:17px;line-height:1.8;color:#444444;margin:0 0 18px;'
    style = base + extra_style
    return f'<p style="{style}">{text}</p>'

# ── HTML builder ────────────────────────────────────────────────

def build_html(base_html, seq):
    """Build final HTML by replacing landmarks in base template."""
    sid       = seq["id"]                          # EC-2026-001-SEQ-1-E2-A
    short_id  = sid.replace("EC-2026-001-", "")   # SEQ-1-E2-A
    icp_code  = seq.get("icp_code", "")
    is_money  = "money" in icp_code
    is_seq4   = "SEQ-4" in sid
    is_seq3   = "SEQ-3" in sid
    is_urgency = is_seq3 or is_seq4

    subject    = seq.get("subject_line", "").strip()
    preview    = seq.get("preview_text", "").strip()
    body_hook  = seq.get("body_hook", "").strip()
    body_prob  = seq.get("body_problem", "").strip()
    body_agit  = seq.get("body_agitate", "").strip()
    body_solve = seq.get("body_solve", "").strip()
    body_cta   = seq.get("body_cta", "").strip()
    dl_id      = seq.get("dl_id", "")
    send_day   = seq.get("send_day", "0")

    # Determine LP and CTA URL
    if is_seq4:
        lp_base = "https://easychefpro.com"
        lp_path = ""
    elif is_money:
        lp_base = "https://launch.easychefpro.com"
        lp_path = "/lp/waitlist-a"
    else:
        lp_base = "https://launch.easychefpro.com"
        lp_path = "/lp/waitlist-b"

    cta_url = f"{lp_base}{lp_path}?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content={dl_id}&utm_term={short_id}"

    # --- Build copy blocks ---
    scene_headline = first_sentence(subject) if subject else first_sentence(body_hook)
    scene_subtext  = preview if preview else first_sentence(body_prob)
    h1_text        = build_h1(body_agit, icp_code)
    p1_text        = clean_for_html(body_prob)
    p2_text        = clean_for_html(body_agit)
    solve_text     = clean_for_html(body_solve)
    cta_hl         = build_cta_headline(body_cta, icp_code, is_seq4)

    if is_seq4:
        ps_text = "P.S. The app is live. The founding price is locked. Tonight’s dinner is already decided."
    elif is_money:
        ps_text = "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Every week you wait is another DoorDash Wednesday."
    else:
        ps_text = "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Wednesday 6:30 doesn’t have to be a permanent feature of your week."

    if is_urgency:
        urgency_subtext = "5,000 founding spots &nbsp;·&nbsp; $7.99/month locked forever"
    else:
        urgency_subtext = "5,000 founding spots &nbsp;·&nbsp; $7.99/month locked forever"

    # Display-friendly sequence name e.g. "SEQ-1 · E2-A"
    # short_id = SEQ-1-E2-A → parts: SEQ-1, E2-A
    parts = short_id.split("-", 2)   # ['SEQ', '1', 'E2-A']
    if len(parts) == 3:
        seq_display = f"{parts[0]}-{parts[1]} · {parts[2]}"  # SEQ-1 · E2-A
    else:
        seq_display = short_id

    # Metadata comment block
    flow_id = "XfqUtU (Flow A)" if is_money else "XCyc4m (Flow B)"
    metadata = f"""<!--
================================================================
  ASSET METADATA
  {{{{ASSET_ID}}}}      EC-2026-001-{short_id}
  {{{{KLAVIYO_ID}}}}    (standalone — wire to {flow_id} in Klaviyo UI)
  {{{{DL_ID}}}}         {dl_id}
  {{{{ICP}}}}           {icp_code}
  {{{{VARIANT}}}}       {"A" if is_money else "B"}
  {{{{SEQUENCE}}}}      {seq_display}
  {{{{FLOW}}}}          {flow_id}
  {{{{SEND_DAY}}}}      Day {send_day}
  {{{{SUBJECT}}}}       {subject}
  {{{{PREVIEW}}}}       {preview}
  {{{{SCENE}}}}         {scene_headline} (EMAIL_LP_RELATIONSHIP_001)
  {{{{RULE}}}}          EMAIL_LP_RELATIONSHIP_001 — single scene, not LP retell
  {{{{STATUS}}}}        BUILT v1 — copy from EmailSequences tab — pending scene rewrite
  {{{{VERSION}}}}       v1 — layout from v3 base · copy from sheet
================================================================
-->"""

    # ── Apply replacements to base HTML ──

    html = base_html

    # Determine which base this is (A or B) by checking for unique A-only string
    is_base_a = "SEQ-1 · E1-A ·" in html

    if is_base_a:
        # --- Replace in BASE A ---
        # 1. Title
        html = html.replace(
            "<title>SEQ-1 · E1-A · That $47 DoorDash charge. You already paid for that dinner.</title>",
            f"<title>{seq_display} · {subject}</title>"
        )
        # 2. Preheader comment
        html = html.replace(
            "<!-- ── PREHEADER ── single scene: Sunday groceries → Wednesday DoorDash -->",
            f"<!-- ── PREHEADER ── {scene_headline} -->"
        )
        # 3. Preheader text (hidden div content)
        html = html.replace(
            "The chicken is still in your fridge.",
            clean_for_html(preview)
        )
        # 4. Scene comment block
        html = html.replace(
            "     SCENE: Sunday groceries → Wednesday DoorDash\n     ICP: super_mom_money",
            f"     SCENE: {scene_headline}\n     ICP: {icp_code}"
        )
        # 5. Inner scene comment
        html = html.replace(
            "         Sunday groceries → Wednesday DoorDash\n         Open in the middle of the moment.",
            f"         {scene_headline}\n         Open in the middle of the moment."
        )
        # 6. Scene headline
        html = html.replace(
            "\n            Sunday. $180 at the grocery store. A real plan.\n          ",
            f"\n            {clean_for_html(scene_headline)}\n          "
        )
        # 7. Scene subtext
        html = html.replace(
            "\n            Wednesday 6:22 PM. Kids asking. You open DoorDash. The chicken thighs are still in the fridge.\n          ",
            f"\n            {clean_for_html(scene_subtext)}\n          "
        )
        # 8. H1
        html = html.replace(
            "\n          You didn't waste $47 on DoorDash.<br>You wasted the $180 that had nowhere to go.\n        ",
            f"\n          {h1_text}\n        "
        )
        # 9. P1
        html = html.replace(
            "\n          The groceries were right. The intention was right. There was just nothing to connect Sunday's plan to Wednesday's fridge. No bridge between what you bought and what actually became dinner.\n        ",
            f"\n          {p1_text}\n        "
        )
        # 10. P2 (has <strong> in original — replace entire paragraph content)
        html = html.replace(
            "\n          That is what <strong style=\"color:#000000;font-weight:600;\">$111 a month</strong> looks like. Not bad decisions. Not overspending. Just a gap that has never had a system to close it.\n        ",
            f"\n          {p2_text}\n        "
        )
        # 11. Solve line
        html = html.replace(
            "\n          easyChef Pro is that system. It closes the loop between what you buy and what actually becomes dinner — so Wednesday looks like the plan you made on Sunday.\n        ",
            f"\n          {solve_text}\n        "
        )
        # 12. CTA headline
        html = html.replace(
            "\n          Stop the Sunday → Wednesday leak.<br>Permanently.\n        ",
            f"\n          {cta_hl}\n        "
        )
        # 13. CTA href (full URL)
        html = html.replace(
            "https://launch.easychefpro.com/lp/waitlist-a?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-EM-0036_seq1_e1a&utm_term=SEQ-1-E1-A",
            cta_url
        )
        # 14. P.S.
        html = html.replace(
            "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Every week you wait is another DoorDash Wednesday.",
            ps_text
        )
        # 15. Metadata block
        html = re.sub(
            r'<!--\n={64}\n  ASSET METADATA.*?={64}\n-->',
            metadata,
            html,
            flags=re.DOTALL
        )

    else:
        # --- Replace in BASE B ---
        # 1. Title
        html = html.replace(
            "<title>SEQ-2 · E1-B · You planned Sunday. It was gone by Tuesday.</title>",
            f"<title>{seq_display} · {subject}</title>"
        )
        # 2. Preheader comment
        html = html.replace(
            "<!-- ── PREHEADER ── single scene: Sunday plan → Wednesday wall -->",
            f"<!-- ── PREHEADER ── {scene_headline} -->"
        )
        # 3. Preheader text
        html = html.replace(
            "The 6:30 wall isn't about time. The plan just had nowhere to live.",
            clean_for_html(preview)
        )
        # 4. Scene comment block
        html = html.replace(
            "     SCENE: Sunday plan → Wednesday 6:30 wall\n     ICP: super_mom_time",
            f"     SCENE: {scene_headline}\n     ICP: {icp_code}"
        )
        # 5. Inner scene comment
        html = html.replace(
            "         Sunday plan → Wednesday 6:28 PM wall\n         Open in the middle of the moment.",
            f"         {scene_headline}\n         Open in the middle of the moment."
        )
        # 6. Scene headline
        html = html.replace(
            "\n            Sunday evening. Five meals mapped out. It felt good.\n          ",
            f"\n            {clean_for_html(scene_headline)}\n          "
        )
        # 7. Scene subtext
        html = html.replace(
            "\n            Wednesday 6:28 PM. Full fridge. Nothing started. The plan you made three days ago is completely gone.\n          ",
            f"\n            {clean_for_html(scene_subtext)}\n          "
        )
        # 8. H1
        html = html.replace(
            "\n          You didn't fail the plan.<br>The plan had nowhere to live.\n        ",
            f"\n          {h1_text}\n        "
        )
        # 9. P1
        html = html.replace(
            "\n          It lived in your head. Between Sunday and Wednesday it ran into real life: a late meeting, a kid who changed their mind, a day that didn't go the way you expected. And the plan, which had no system to hold it, quietly disappeared.\n        ",
            f"\n          {p1_text}\n        "
        )
        # 10. P2
        html = html.replace(
            "\n          So you ended up back at the fridge at 6:28 carrying all of it in your head. Again. Not because you didn't try. Because the system was disconnected.\n        ",
            f"\n          {p2_text}\n        "
        )
        # 11. Solve line
        html = html.replace(
            "\n          easyChef Pro carries the plan so you don't have to. Sunday's intention becomes Wednesday's dinner — because the system holds it between the two.\n        ",
            f"\n          {solve_text}\n        "
        )
        # 12. CTA headline
        html = html.replace(
            "\n          Dinner decided.<br>Before the wall hits.\n        ",
            f"\n          {cta_hl}\n        "
        )
        # 13. CTA href
        html = html.replace(
            "https://launch.easychefpro.com/lp/waitlist-b?utm_source=klaviyo&utm_medium=email&utm_campaign=EC-2026-001&utm_content=DL-EM-0043&utm_term=SEQ-2-E1-B",
            cta_url
        )
        # 14. P.S.
        html = html.replace(
            "P.S. The founding price is $7.99 forever. After the first 5,000 spots it goes to $19.99. Wednesday 6:30 doesn't have to be a permanent feature of your week.",
            ps_text
        )
        # 15. Metadata block
        html = re.sub(
            r'<!--\n={64}\n  ASSET METADATA.*?={64}\n-->',
            metadata,
            html,
            flags=re.DOTALL
        )

    return html


# ── Main batch loop ─────────────────────────────────────────────

def main():
    # Load base templates
    base_a = read_base("SEQ-1-E1-A_v3.html")
    base_b = read_base("SEQ-2-E1-B_v2.html")

    print("Reading EmailSequences...")
    result = post_gas({"action": "email_sequences_read", "campaign_id": "EC-2026-001"})
    seqs = result.get("sequences", [])

    # Filter: SEQ-1 through SEQ-4 only
    seq_filter = ["SEQ-1", "SEQ-2", "SEQ-3", "SEQ-4"]
    target = [
        s for s in seqs
        if any(s.get("id","").startswith(f"EC-2026-001-{sq}-") for sq in seq_filter)
    ]
    print(f"Target emails: {len(target)}")

    results = []
    skipped = []
    built   = []
    failed  = []
    template_ids = {}

    # Carry already-built IDs
    for sid, info in ALREADY_BUILT.items():
        template_ids[sid] = info["klaviyo_template_id"]
        skipped.append(sid)

    for seq in target:
        sid = seq["id"]
        short_id = sid.replace("EC-2026-001-", "")
        icp_code = seq.get("icp_code", "")
        is_money = "money" in icp_code

        if sid in ALREADY_BUILT:
            print(f"  SKIP {short_id} (already built)")
            continue

        print(f"\n  Building {short_id}...")

        # Choose base template
        base_html = base_a if is_money else base_b

        # Build HTML
        html = build_html(base_html, seq)

        # Save locally
        filename = f"{short_id}_v1.html"
        filepath = os.path.join(TEMPLATE_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"    Saved: {filename}")

        # Create Klaviyo standalone template
        template_name = f"EC-2026-001-{short_id}"
        print(f"    Creating Klaviyo template: {template_name}...")
        try:
            resp = post_gas({
                "action": "klaviyo_create_template",
                "name":   template_name,
                "html":   html
            })
            if resp.get("ok"):
                tid = resp.get("template_id", "")
                template_ids[sid] = tid
                print(f"    Klaviyo template created: {tid}")
                built.append({"id": sid, "short": short_id, "template_id": tid, "file": filename})
            else:
                err = resp.get("error", str(resp))
                print(f"    Klaviyo ERROR: {err}")
                failed.append({"id": sid, "error": err})
        except Exception as e:
            print(f"    Exception: {e}")
            failed.append({"id": sid, "error": str(e)})

        # Brief pause to avoid rate limits
        time.sleep(0.5)

    # ── Save template IDs back to sheet ──
    print("\n\nSaving template IDs back to EmailSequences...")
    save_errors = []
    for seq in target:
        sid = seq["id"]
        if sid not in template_ids:
            continue
        tid = template_ids[sid]
        # Update the sequence object with standalone_template_id
        updated = dict(seq)
        updated["standalone_template_id"] = tid
        try:
            wr = post_gas({"action": "email_sequences_write", "sequence": updated})
            print(f"  {sid.replace('EC-2026-001-',''):25} template_id={tid} → write: {wr.get('ok','?')}")
        except Exception as e:
            save_errors.append(f"{sid}: {e}")
        time.sleep(0.3)

    # ── Final report ──
    print("\n" + "="*60)
    print("BATCH BUILD COMPLETE")
    print("="*60)
    print(f"Total target:    {len(target)}")
    print(f"Already built:   {len(skipped)}")
    print(f"Newly built:     {len(built)}")
    print(f"Klaviyo failed:  {len(failed)}")
    print()
    print("TEMPLATE IDS ASSIGNED:")
    for sid, tid in sorted(template_ids.items()):
        print(f"  {sid.replace('EC-2026-001-',''):25} → {tid}")
    if failed:
        print("\nFAILED:")
        for f in failed:
            print(f"  {f['id']}: {f['error']}")
    if save_errors:
        print("\nSAVE ERRORS:")
        for e in save_errors:
            print(f"  {e}")

    # Save template_ids to JSON for reference
    out_path = os.path.join(os.path.dirname(__file__), "tmp_template_ids.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(template_ids, f, indent=2)
    print(f"\nTemplate IDs saved to: tmp_template_ids.json")

if __name__ == "__main__":
    main()
