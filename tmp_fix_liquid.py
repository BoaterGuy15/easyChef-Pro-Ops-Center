"""
Fix default-filter syntax in Alpha email templates.

PROBLEM: Alpha emails have Liquid colon syntax (wrong for Klaviyo):
    {{ person.first_name | default: 'there' }}

Klaviyo uses Jinja2 two-argument syntax (correct):
    {{person.first_name|default('there', true)}}

Error: "The 'default' filter requires 2 arguments, but 1 was given"

This script:
  1. Scans Alpha HTML files only (SEQ templates have no default filter)
  2. Converts Liquid default: syntax -> Jinja2 default() two-arg syntax
  3. Saves locally
  4. Pushes each file to Klaviyo via GAS klaviyo_update_template action
"""
import json, urllib.request, os, re, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email-templates")

# Alpha templates only -- SEQ templates are confirmed clean (zero default filter usage)
ALPHA_TEMPLATES = [
    ("ALPHA-E1_v1.html", "UM8eaZ"),
    ("ALPHA-E2_v1.html", "Tx68VK"),
    ("ALPHA-E3_v1.html", "XEjGdW"),
    ("ALPHA-E4_v1.html", "Uxet8P"),
    ("ALPHA-E5_v1.html", "QRKrLt"),
    ("ALPHA-E6_v1.html", "VC23Fh"),
]

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

def fix_default_filters(html):
    """Convert Liquid default: syntax to Jinja2 default() two-arg syntax.

    Liquid (wrong -- causes 'requires 2 arguments' error):
        {{ person.first_name | default: 'there' }}

    Jinja2 (correct for Klaviyo):
        {{person.first_name|default('there', true)}}
    """
    # String defaults: {{ var | default: 'value' }} -> {{var|default('value', true)}}
    html = re.sub(
        r"\{\{\s*([\w\.]+)\s*\|\s*default:\s*'([^']*)'\s*\}\}",
        lambda m: "{{{{{}|default('{}', true)}}}}".format(m.group(1), m.group(2)),
        html
    )
    # Number defaults: {{ var | default: N }} -> {{var|default(N, true)}}
    html = re.sub(
        r'\{\{\s*([\w\.]+)\s*\|\s*default:\s*(\d+)\s*\}\}',
        lambda m: "{{{{{}|default({}, true)}}}}".format(m.group(1), m.group(2)),
        html
    )
    return html

def count_liquid_defaults(html):
    return len(re.findall(r'\|\s*default:', html))

def count_jinja2_defaults(html):
    return len(re.findall(r'\|default\(', html))

def main():
    print("=" * 65)
    print("DEFAULT FILTER FIX -- Liquid -> Jinja2 for Alpha templates")
    print("=" * 65)

    total_replacements = 0
    ok = 0
    fail = 0

    for fname, tid in ALPHA_TEMPLATES:
        fpath = os.path.join(TEMPLATE_DIR, fname)

        if not os.path.exists(fpath):
            print("\n  MISSING  {}".format(fname))
            fail += 1
            continue

        with open(fpath, encoding="utf-8") as f:
            original = f.read()

        liquid_count = count_liquid_defaults(original)
        jinja2_count = count_jinja2_defaults(original)

        print("\n  {}  ({})".format(fname, tid))
        print("    Before: {} Liquid | default: syntax, {} Jinja2 |default() syntax".format(liquid_count, jinja2_count))

        fixed = fix_default_filters(original)
        after_liquid = count_liquid_defaults(fixed)
        after_jinja2 = count_jinja2_defaults(fixed)
        replaced = liquid_count - after_liquid
        total_replacements += replaced

        print("    After:  {} Liquid | default: syntax, {} Jinja2 |default() syntax".format(after_liquid, after_jinja2))
        print("    Replacements: {}".format(replaced))

        if after_liquid > 0:
            print("    WARN: {} | default: still present -- regex did not catch all".format(after_liquid))

        # Save locally
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(fixed)
        print("    Local saved.")

        # Push to Klaviyo
        try:
            resp = post_gas({"action": "klaviyo_update_template", "template_id": tid, "html": fixed})
            if resp.get("ok"):
                print("    Klaviyo {}  OK".format(tid))
                ok += 1
            else:
                err = str(resp.get("error") or resp.get("message") or resp)[:100]
                print("    Klaviyo {}  FAIL -> {}".format(tid, err))
                fail += 1
        except Exception as e:
            print("    Klaviyo {}  ERROR -> {}".format(tid, e))
            fail += 1

        time.sleep(0.4)

    print()
    print("=" * 65)
    print("Total replacements : {}".format(total_replacements))
    print("Klaviyo pushes OK  : {}".format(ok))
    print("Klaviyo pushes FAIL: {}".format(fail))
    print("=" * 65)

if __name__ == "__main__":
    main()
