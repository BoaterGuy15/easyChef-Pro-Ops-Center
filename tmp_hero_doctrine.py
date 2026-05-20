import json, urllib.request, time

GAS_URL = "https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec"

def gas_post(payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(GAS_URL, data=data,
          headers={"Content-Type": "text/plain"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())

print("Saving HERO_COPY_001 to BrandDoctrine...")
r = gas_post({
    "action": "append_brand_doctrine",
    "rule": {
        "rule_id":    "HERO_COPY_001",
        "rule_type":  "hero_copy",
        "enforcement":"hard",
        "active":     True,
        "conditions": {
            "rule": "Website homepage hero copy — LOCKED. Use exact wording. Do not paraphrase.",
            "usage": "homepage_hero",
            "scope": "easychefpro.com homepage only — universal, no ICP restriction",
            "hero_lines": [
                "Your life changes. Your kitchen should change with it.",
                "The problem was never you. The system was disconnected.",
                "easyChef Pro is the system your kitchen was always missing."
            ],
            "tagline_sources": {
                "line_1": "TAGLINE_003",
                "line_2": "TAGLINE_002",
                "line_3": "product statement"
            },
            "locked": True,
            "approved_by":   "Taylor",
            "approved_date": "2026-05-19",
            "rationale": (
                "Approved main website homepage hero copy. "
                "Line 1 (TAGLINE_003): universal hook — life changes, kitchen should too. "
                "Line 2 (TAGLINE_002): validation — problem is the disconnected system, not the user. "
                "Line 3: product statement — full app scope, not dinner-specific. "
                "No ICP restriction. No 'command' language. 3-second universal draw."
            )
        }
    }
})
print(f"  HERO_COPY_001: ok={r.get('ok')} action={r.get('action','')}")
print(f"  {r}")
