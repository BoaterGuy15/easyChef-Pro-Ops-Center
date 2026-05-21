import json, urllib.request, sys

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def post_gas(payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(GAS_URL, data=data, headers={"Content-Type": "text/plain"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))

# --- SEQ-1-E1-A: create standalone template ---
with open(r"email-templates\SEQ-1-E1-A_v3.html", "r", encoding="utf-8") as f:
    html_a = f.read()

print("Creating template A...")
result_a = post_gas({
    "action": "klaviyo_create_template",
    "name": "EC-2026-001 · SEQ-1-E1-A · v3 APPROVED",
    "html": html_a
})
print("A:", json.dumps(result_a, indent=2))

# --- SEQ-2-E1-B: create standalone template ---
with open(r"email-templates\SEQ-2-E1-B_v2.html", "r", encoding="utf-8") as f:
    html_b = f.read()

print("\nCreating template B...")
result_b = post_gas({
    "action": "klaviyo_create_template",
    "name": "EC-2026-001 · SEQ-2-E1-B · v2 APPROVED",
    "html": html_b
})
print("B:", json.dumps(result_b, indent=2))
