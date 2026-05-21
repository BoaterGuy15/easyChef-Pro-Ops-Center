"""
Fix default-filter syntax in all 36 email templates.

PROBLEM: Alpha emails were converted to Jinja2 syntax (wrong):
    {{ person.first_name|default('there', true) }}

Klaviyo uses Liquid colon syntax (correct):
    {{ person.first_name | default: 'there' }}

This script:
  1. Scans all 36 current-version HTML files
  2. Converts any Jinja2 default() calls back to Liquid default: syntax
  3. Saves locally
  4. Pushes each file to Klaviyo via GAS klaviyo_update_template action

Only Alpha emails have the broken syntax — SEQ templates will report 0 changes.
"""
import json, urllib.request, os, re, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email-templates")

# (local_filename, klaviyo_template_id)
ALL_TEMPLATES = [
    # SEQ-1
    ("SEQ-1-E1-A_v3.html",  "UxsJ3U"),
    ("SEQ-1-E1-B_v2.html",  "RmZJyL"),
    ("SEQ-1-E2-A_v2.html",  "WqLmGD"),
    ("SEQ-1-E2-B_v2.html",  "VxRy3Q"),
    ("SEQ-1-E3-A_v2.html",  "TqUD9M"),
    ("SEQ-1-E3-B_v2.html",  "W8RAvW"),
    # SEQ-2
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
    # SEQ-3
    ("SEQ-3-E1-A_v2.html",  "UzuXXQ"),
    ("SEQ-3-E1-B_v2.html",  "Tacn3N"),
    ("SEQ-3-E2-A_v2.html",  "TsGpgR"),
    ("SEQ-3-E2-B_v2.html",  "RuZZ5A"),
    ("SEQ-3-E3-A_v2.html",  "XSrXN7"),
    ("SEQ-3-E3-B_v2.html",  "SShAR7"),
    ("SEQ-3-E4-A_v2.html",  "VERNyE"),
    ("SEQ-3-E4-B_v2.html",  "YnNKUP"),
    # SEQ-4
    ("SEQ-4-E1-A_v2.html",  "RAevtk"),
    ("SEQ-4-E1-B_v2.html",  "Y4hJxf"),
    ("SEQ-4-E2-A_v2.html",  "W6BkjY"),
    ("SEQ-4-E2-B_v2.html",  "SXw7eR"),
    ("SEQ-4-E3-A_v2.html",  "Wp7mz3"),
    ("SEQ-4-E3-B_v2.html",  "RsauRg"),
    # Alpha
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

def fix_default_filters(html):
    """Convert Jinja2 default() calls to Klaviyo Liquid default: syntax."""
    # String defaults: {{ var|default('value', true) }} → {{ var | default: 'value' }}
    html = re.sub(
        r'\{\{\s*([\w\.]+)\|default\(\'([^\']*)\',\s*true\)\s*\}\}',
        r"{{ \1 | default: '\2' }}",
        html
    )
    # Number defaults: {{ var|default(0, true) }} → {{ var | default: 0 }}
    html = re.sub(
        r'\{\{\s*([\w\.]+)\|default\((\d+),\s*true\)\s*\}\}',
        r"{{ \1 | default: \2 }}",
        html
    )
    return html

def count_jinja2_defaults(html):
    return len(re.findall(r'\|default\(', html))

def main():
    print("=" * 65)
    print("DEFAULT FILTER FIX -- Jinja2 -> Liquid for all 36 templates")
    print("=" * 65)

    total_replacements = 0
    ok = 0
    fail = 0
    skipped = 0

    for fname, tid in ALL_TEMPLATES:
        fpath = os.path.join(TEMPLATE_DIR, fname)

        if not os.path.exists(fpath):
            print(f"\n  MISSING  {fname}")
            fail += 1
            continue

        with open(fpath, encoding="utf-8") as f:
            original = f.read()

        broken_count = count_jinja2_defaults(original)

        if broken_count == 0:
            print(f"  CLEAN    {fname}  ({tid})")
            skipped += 1
            # Still push to Klaviyo to keep in sync (skip if you want faster run)
            # Uncomment next 3 lines to push clean files too:
            # resp = post_gas({"action": "klaviyo_update_template", "template_id": tid, "html": original})
            # if not resp.get("ok"): print(f"    WARN push failed: {resp}")
            continue

        fixed = fix_default_filters(original)
        remaining = count_jinja2_defaults(fixed)
        replaced = broken_count - remaining
        total_replacements += replaced

        print(f"\n  FIX      {fname}  ({tid})  —  {replaced} replacements", end="")
        if remaining > 0:
            print(f"  WARN: {remaining} |default( still present", end="")
        print()

        # Save locally
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(fixed)
        print(f"           Local saved.")

        # Push to Klaviyo
        try:
            resp = post_gas({"action": "klaviyo_update_template", "template_id": tid, "html": fixed})
            if resp.get("ok"):
                print(f"           Klaviyo {tid}  OK")
                ok += 1
            else:
                err = str(resp.get("error") or resp.get("message") or resp)[:100]
                print(f"           Klaviyo {tid}  FAIL → {err}")
                fail += 1
        except Exception as e:
            print(f"           Klaviyo {tid}  ERROR → {e}")
            fail += 1

        time.sleep(0.4)

    print()
    print("=" * 65)
    print(f"Total replacements : {total_replacements}")
    print(f"Klaviyo pushes OK  : {ok}")
    print(f"Klaviyo pushes FAIL: {fail}")
    print(f"Already clean      : {skipped}")
    print("=" * 65)

if __name__ == "__main__":
    main()
