"""
Sync SEQ-3 and SEQ-4 campaign template copies with correct v2 content.

ROOT CAUSE: When Klaviyo campaigns are created, it makes a COPY of the assigned
template. Our v2 governance rewrite updated the STANDALONE templates but not these
campaign copies. This script:
  1. Fetches correct HTML from each standalone template via GAS
  2. Saves to local HTML file (fixing the wrong local content)
  3. Pushes to campaign template copy
  4. Updates campaign message subject + preview to match v2 approved copy

Standalone ID  -> Campaign Copy ID  -> Correct subject/preview from v2 metadata

NOTE: SEQ-3-E2-B has a DUPLICATE campaign (Jun 15 + Jun 16).
Both campaign copies get the correct HTML. Recommend cancelling the Jun 15 duplicate in Klaviyo UI.
"""
import json, urllib.request, os, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "email-templates")

# (local_filename, standalone_id, campaign_template_id, campaign_message_id, subject, preview_text)
CAMPAIGNS = [
    ("SEQ-3-E1-A_v2.html",  "UzuXXQ", "TFh2g6", "01KS1AWXAS1HA99T2993H31FAT",
     "The $12 that keeps saving dinner",
     "Not a bad purchase. A signal."),
    ("SEQ-3-E1-B_v2.html",  "Tacn3N", "SfYqk4", "01KS1AX5A3AQZCS7HJ89EQB648",
     "It was 6:45 when the call finally ended.",
     "Dinner wasn't the first casualty."),
    ("SEQ-3-E2-A_v2.html",  "TsGpgR", "UwaPLn", "01KS1AXCJMDKK4QSBBMWAHE7RD",
     "You bought $94 worth of groceries. And forgot the chicken.",
     "The list was in your phone. That's the part that stings."),
    ("SEQ-3-E2-B_v2.html",  "RuZZ5A", "XR8PKa", "01KS1AXM8C7PPRCG7Z1E57C32S",
     "By the time you figured it out, everyone had moved on.",
     "Not angry. Just done asking."),
    # DUPLICATE Jun-15 campaign -- update HTML too, but cancel this one in UI
    ("SEQ-3-E2-B_v2.html",  "RuZZ5A", "Sa3DWZ", "01KS19K5AZKVD9SJJ9JVQ2YMNH",
     "By the time you figured it out, everyone had moved on.",
     "Not angry. Just done asking."),
    ("SEQ-3-E3-A_v2.html",  "XSrXN7", "Yeg7jB", "01KS1AXVNWZTSZH92B52J08KGZ",
     "Four cans of chickpeas. Nothing for tonight.",
     "A full pantry that never adds up to a meal."),
    ("SEQ-3-E3-B_v2.html",  "SShAR7", "RrFQS8", "01KS1AY35B23ZCW1ED8J0ECDKQ",
     "You were going to prep Sunday. You watched TV instead.",
     "Understandable. And also how Monday happens."),
    ("SEQ-3-E4-A_v2.html",  "VERNyE", "Rgrkbk", "01KS1AYAQWF08XZ57YV6QMA0S3",
     "You needed a few things. The receipt said $214.",
     "Not one big splurge. Seventeen small ones."),
    ("SEQ-3-E4-B_v2.html",  "YnNKUP", "VRrrpn", "01KS1AYJTM3E54QP9NH934X4JS",
     "Wednesday again. Already calculating Thursday.",
     "It's not worry. It's the background hum."),
    ("SEQ-4-E1-A_v2.html",  "RAevtk", "QRh4sn", "01KS1AYT25Q5JHFSSV5HWP7EKX",
     "The first week it actually held.",
     "Not different. Just connected."),
    ("SEQ-4-E1-B_v2.html",  "Y4hJxf", "SWcXbU", "01KS1AZ11TNCF4B90B1FSVTPX1",
     "Wednesday at 6. Different.",
     "Same time. Same kids. Something finally shifted."),
    ("SEQ-4-E2-A_v2.html",  "W6BkjY", "WhaXaG", "01KS1AZ825MRVA3QY6WJYGFAJV",
     "You knew what was in the pantry. That was the difference.",
     "Four cans of chickpeas, no more."),
    ("SEQ-4-E2-B_v2.html",  "SXw7eR", "YxmnB2", "01KS1AZEP0VXMVMBAVS1Y6P94F",
     "A whole week. You only decided dinner once.",
     "Sunday. That was it."),
    ("SEQ-4-E3-A_v2.html",  "Wp7mz3", "SYPdnM", "01KS1AZNAN8SES07H4JBFMZF9C",
     "The math. And the window closing.",
     "What changes first when the system connects."),
    ("SEQ-4-E3-B_v2.html",  "RsauRg", "WqqtGX", "01KS1AZWE62C4G35C81YCCRQ0X",
     "The hours. And the window closing.",
     "What the kitchen actually costs you, per week."),
]

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))

def get_template_html(template_id):
    resp = post_gas({"action": "klaviyo_get_template", "template_id": template_id})
    if not resp.get("ok"):
        raise Exception("GET failed: {}".format(resp))
    html = resp.get("data", {}).get("data", {}).get("attributes", {}).get("html")
    if not html:
        raise Exception("No html in response: {}".format(str(resp)[:200]))
    return html

def main():
    print("=" * 70)
    print("CAMPAIGN TEMPLATE SYNC -- standalone -> campaign copies")
    print("Fixing: wrong HTML body + wrong subject lines in 15 campaigns")
    print("=" * 70)

    html_ok = 0
    html_fail = 0
    subj_ok = 0
    subj_fail = 0
    seen_standalone = {}  # cache standalone HTML to avoid re-fetching duplicates

    for fname, standalone_id, campaign_tid, msg_id, subject, preview in CAMPAIGNS:
        print("\n  {} -> campaign copy {}".format(standalone_id, campaign_tid))
        fpath = os.path.join(TEMPLATE_DIR, fname)

        # --- Step 1: Get HTML from standalone template (cached) ---
        if standalone_id not in seen_standalone:
            try:
                html = get_template_html(standalone_id)
                seen_standalone[standalone_id] = html
                print("    Fetched HTML from standalone {} ({} chars)".format(standalone_id, len(html)))
            except Exception as e:
                print("    FAIL fetch {}: {}".format(standalone_id, e))
                html_fail += 1
                continue
        else:
            html = seen_standalone[standalone_id]
            print("    HTML cached from previous fetch ({} chars)".format(len(html)))

        # --- Step 2: Save to local file ---
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(html)
        print("    Local saved -> {}".format(fname))

        # --- Step 3: Push to campaign template copy ---
        try:
            resp = post_gas({"action": "klaviyo_update_template", "template_id": campaign_tid, "html": html})
            if resp.get("ok"):
                print("    Template {} updated OK".format(campaign_tid))
                html_ok += 1
            else:
                print("    Template {} FAIL: {}".format(campaign_tid, str(resp)[:100]))
                html_fail += 1
        except Exception as e:
            print("    Template {} ERROR: {}".format(campaign_tid, e))
            html_fail += 1

        time.sleep(0.3)

        # --- Step 4: Update campaign message subject + preview ---
        try:
            resp2 = post_gas({
                "action": "klaviyo_update_campaign_subject",
                "message_id": msg_id,
                "subject": subject,
                "preview_text": preview
            })
            if resp2.get("ok"):
                print("    Subject updated OK: {}".format(subject[:60]))
                subj_ok += 1
            else:
                print("    Subject FAIL ({}): {}".format(msg_id, str(resp2)[:100]))
                subj_fail += 1
        except Exception as e:
            print("    Subject ERROR: {}".format(e))
            subj_fail += 1

        time.sleep(0.3)

    print()
    print("=" * 70)
    print("Template HTML pushes OK  : {}".format(html_ok))
    print("Template HTML pushes FAIL: {}".format(html_fail))
    print("Subject updates OK       : {}".format(subj_ok))
    print("Subject updates FAIL     : {}".format(subj_fail))
    print()
    print("ACTION REQUIRED:")
    print("  - Cancel the DUPLICATE SEQ-3-E2-B campaign (Jun 15, ID 01KS19K5ASR4E5NPTHR493FCH4) in Klaviyo UI")
    print("  - Flow B steps 5-8 still need UI wiring (see below)")
    print()
    print("Flow B (XCyc4m) steps 5-8 to wire in Klaviyo UI:")
    print("  Step 5 -> WpkBAu  (SEQ-2-E2-B)")
    print("  Step 6 -> SFQA5B  (SEQ-2-E3-B)")
    print("  Step 7 -> YcmK9j  (SEQ-2-E4-B)")
    print("  Step 8 -> UPnK22  (SEQ-2-E5-B)")
    print("=" * 70)

if __name__ == "__main__":
    main()
