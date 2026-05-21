"""
Remove <link> Google Fonts tags and replace Google font families with system stacks.
Fix all 36 approved HTML templates (local files + Klaviyo via API).

Replacements:
  <link href="https://fonts.googleapis.com/..." rel="stylesheet">  → removed
  'Proza Libre',Georgia,serif                                       → Georgia,'Times New Roman',serif
  'Inter',Arial,Helvetica,sans-serif                                → Arial,Helvetica,sans-serif
"""
import json, urllib.request, os, re, time

GAS_URL      = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email-templates")

# Active file → Klaviyo template ID mapping (latest version of each email)
TEMPLATES = [
    ("SEQ-1-E1-A_v3.html",  "UxsJ3U"),
    ("SEQ-1-E1-B_v2.html",  "RmZJyL"),
    ("SEQ-1-E2-A_v2.html",  "WqLmGD"),
    ("SEQ-1-E2-B_v2.html",  "VxRy3Q"),
    ("SEQ-1-E3-A_v2.html",  "TqUD9M"),
    ("SEQ-1-E3-B_v2.html",  "W8RAvW"),
    ("SEQ-2-E1-A_v2.html",  "Y9aeU6"),
    ("SEQ-2-E1-B_v2.html",  "YvrLDj"),
    ("SEQ-2-E2-A_v2.html",  "UiqGQW"),
    ("SEQ-2-E2-B_v2.html",  "WpkBAu"),
    ("SEQ-2-E3-A_v2.html",  "TyKpJq"),
    ("SEQ-2-E3-B_v2.html",  "SFQA5B"),
    ("SEQ-2-E4-A_v2.html",  "RbUHNb"),
    ("SEQ-2-E4-B_v2.html",  "YcmK9j"),
    ("SEQ-2-E5-A_v2.html",  "WeFkW4"),
    ("SEQ-2-E5-B_v2.html",  "UPnK22"),
    ("SEQ-3-E1-A_v2.html",  "UzuXXQ"),
    ("SEQ-3-E1-B_v2.html",  "Tacn3N"),
    ("SEQ-3-E2-A_v2.html",  "TsGpgR"),
    ("SEQ-3-E2-B_v2.html",  "RuZZ5A"),
    ("SEQ-3-E3-A_v2.html",  "XSrXN7"),
    ("SEQ-3-E3-B_v2.html",  "SShAR7"),
    ("SEQ-3-E4-A_v2.html",  "VERNyE"),
    ("SEQ-3-E4-B_v2.html",  "YnNKUP"),
    ("SEQ-4-E1-A_v2.html",  "RAevtk"),
    ("SEQ-4-E1-B_v2.html",  "Y4hJxf"),
    ("SEQ-4-E2-A_v2.html",  "W6BkjY"),
    ("SEQ-4-E2-B_v2.html",  "SXw7eR"),
    ("SEQ-4-E3-A_v2.html",  "Wp7mz3"),
    ("SEQ-4-E3-B_v2.html",  "RsauRg"),
    ("ALPHA-E1_v1.html",    "UM8eaZ"),
    ("ALPHA-E2_v1.html",    "Tx68VK"),
    ("ALPHA-E3_v1.html",    "XEjGdW"),
    ("ALPHA-E4_v1.html",    "Uxet8P"),
    ("ALPHA-E5_v1.html",    "QRKrLt"),
    ("ALPHA-E6_v1.html",    "VC23Fh"),
]

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

def fix_html(html):
    # Remove <link> Google Fonts tag (entire line)
    html = re.sub(r'\n?<link[^>]+fonts\.googleapis\.com[^>]*>\n?', '\n', html)
    # Replace Proza Libre (serif) with Georgia system stack
    html = html.replace("'Proza Libre',Georgia,serif",         "Georgia,'Times New Roman',serif")
    html = html.replace("'Proza Libre', Georgia, serif",       "Georgia,'Times New Roman',serif")
    html = html.replace('"Proza Libre",Georgia,serif',         "Georgia,'Times New Roman',serif")
    # Replace Inter (sans-serif) with Arial system stack
    html = html.replace("'Inter',Arial,Helvetica,sans-serif",  "Arial,Helvetica,sans-serif")
    html = html.replace("'Inter', Arial, Helvetica, sans-serif", "Arial,Helvetica,sans-serif")
    html = html.replace('"Inter",Arial,Helvetica,sans-serif',  "Arial,Helvetica,sans-serif")
    return html

def main():
    print("=" * 60)
    print("FONT FIX — Remove Google Fonts link + system font stack")
    print(f"Templates to process: {len(TEMPLATES)}")
    print("=" * 60)

    ok = 0; fail = 0; skipped = 0
    results = []

    for fname, tid in TEMPLATES:
        fpath = os.path.join(TEMPLATE_DIR, fname)

        if not os.path.exists(fpath):
            print(f"  MISSING: {fname}")
            results.append((fname, tid, "MISSING FILE"))
            skipped += 1
            continue

        with open(fpath, encoding="utf-8") as f:
            original = f.read()

        # Check if already fixed
        has_link = "fonts.googleapis.com" in original
        has_proza = "'Proza Libre'" in original
        has_inter_quote = "'Inter'" in original

        if not has_link and not has_proza and not has_inter_quote:
            print(f"  SKIP (already clean): {fname}")
            results.append((fname, tid, "ALREADY CLEAN"))
            skipped += 1
            continue

        fixed = fix_html(original)

        # Verify fix worked
        still_has_link  = "fonts.googleapis.com" in fixed
        still_has_proza = "'Proza Libre'" in fixed
        still_has_inter = "'Inter'" in fixed
        if still_has_link or still_has_proza or still_has_inter:
            print(f"  WARN: {fname} — fix incomplete (link:{still_has_link} proza:{still_has_proza} inter:{still_has_inter})")

        # Save locally
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(fixed)

        # Push to Klaviyo
        resp = post_gas({"action": "klaviyo_update_template", "template_id": tid, "html": fixed})
        if resp.get("ok"):
            print(f"  OK  {tid}  {fname}")
            results.append((fname, tid, "OK"))
            ok += 1
        else:
            err = str(resp.get("error") or resp.get("message") or resp)[:60]
            print(f"  FAIL {tid}  {fname}  — {err}")
            results.append((fname, tid, f"FAIL: {err[:40]}"))
            fail += 1

        time.sleep(0.5)

    # Summary
    print()
    print("=" * 60)
    print(f"{'File':<28} {'Template ID':<10} Status")
    print("-" * 60)
    for fname, tid, status in results:
        print(f"  {fname:<26} {tid:<10} {status}")
    print("-" * 60)
    print(f"Updated: {ok}/36  |  Failed: {fail}  |  Skipped/Missing: {skipped}")

if __name__ == "__main__":
    main()
