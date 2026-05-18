import json, subprocess, time

emails = [
  {
    'id': 'EC-2026-001-BETA-E1',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'BETA',
    'email_number': 1,
    'subject_line': "you're in the next wave",
    'preview_text': 'thank you for being here',
    'send_day': 0,
    'trigger_event': 'beta_invite_sent',
    'funnel_stage': 'hook',
    'role': 'welcome',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'beta_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'full_email_body': """Hey [first name],

I wanted to reach out personally.

A first group of testers already ran through easyChef Pro and told us what they thought. What they said changed things — real things, not small tweaks. And now you're in the next wave.

That matters more than I can explain in an email.

The whole easyChef Pro team has put everything into this app, and having real people test it — people who actually deal with the dinner problem every night — is the only way we get it right.

Thank you for being here.

Taylor"""
  },
  {
    'id': 'EC-2026-001-BETA-E2',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'BETA',
    'email_number': 2,
    'subject_line': 'three minutes before you start',
    'preview_text': 'helps us match the app to your kitchen',
    'send_day': 1,
    'trigger_event': 'beta_invite_sent',
    'funnel_stage': 'hook',
    'role': 'questionnaire',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'beta_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'full_email_body': """Hey [first name],

Before you jump in, one quick ask.

Can you fill out a short questionnaire? Three minutes, yes/no questions. No trick to it.

[Link]

It helps us make sure the app is set up for your specific kitchen — the stores you shop, how you cook, what your week actually looks like. The answers shape what we build next.

That's not a line. Your responses go directly to the team.

Taylor"""
  },
  {
    'id': 'EC-2026-001-BETA-E3',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'BETA',
    'email_number': 3,
    'subject_line': "you're in — start here",
    'preview_text': 'the one move that unlocks everything',
    'send_day': 3,
    'trigger_event': 'questionnaire_complete',
    'funnel_stage': 'solve',
    'role': 'app_access',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'beta_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'full_email_body': """Hey [first name],

You're confirmed. Here's your access.

[Access link]

If you're not sure where to start, do this first: point your camera at your fridge or pantry — or scan a barcode. You scan what you have — not everything at once, just what's in front of you — and the app starts building from there.

If something feels off or doesn't work right, reply here. I read every one of these.

You're helping build something real. The team and I are grateful.

Taylor"""
  },
  {
    'id': 'EC-2026-001-BETA-E4',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'BETA',
    'email_number': 4,
    'subject_line': 'your feedback shapes this',
    'preview_text': 'from me and the team',
    'send_day': 10,
    'trigger_event': 'beta_complete',
    'funnel_stage': 'proof',
    'role': 'thank_you',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'beta_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'full_email_body': """Hey [first name],

I just wanted to say thank you — again, and genuinely.

Your feedback isn't going into a folder somewhere. It's going directly to the people building easyChef Pro. Every answer, every note, every time you told us something didn't work — that's the app getting better.

The whole team feels it. We're building this for people exactly like you, and having you in it means everything.

When we launch, you'll know before anyone else.

Thank you,
Taylor"""
  }
]

for i, email in enumerate(emails):
    payload = json.dumps({'action': 'email_sequences_write', 'sequence': email})
    fname = f'tmp_beta_e{i+1}.json'
    with open(fname, 'w') as f:
        f.write(payload)
    result = subprocess.run(['node', 'run-gas.js', f'@{fname}'], capture_output=True, text=True)
    ok = '"ok": true' in result.stdout
    print(f'E{i+1} ({email["subject_line"]}): {"OK" if ok else "FAIL " + result.stdout[-200:]}')
    if i < len(emails) - 1:
        time.sleep(1)

print('\nDone.')
