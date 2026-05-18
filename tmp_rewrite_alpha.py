import json, subprocess, time

emails = [
  {
    'id': 'EC-2026-001-ALPHA-E1',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'ALPHA',
    'email_number': 1,
    'subject_line': 'Something I want you to be part of',
    'preview_text': "I've been building something for two years. I want you to see it first.",
    'send_day': 0,
    'trigger_event': 'alpha_invite_sent',
    'funnel_stage': 'hook',
    'role': 'welcome',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'alpha_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'dl_id': '',
    'full_email_body': """Hey [first name],

I've been working on something for two years.

I've been pretty quiet about it — partly because I wasn't sure it would work, partly because I didn't want to be one of those people who talks about their startup at every dinner.

But it's real now. And before I show it to anyone else, I want to show it to you.

It's called easyChef Pro.

The short version: Steve and I built it between shifts as firefighters and paramedics. We kept running the same problem at home — a fridge full of groceries and no idea what to make at 6:30 PM. We knew there was a system problem. We built the system.

I'd love you to be one of the first people to try it.

No commitment. No credit card. Just honest feedback from someone I trust.

I'm putting together a small group of alpha testers before we launch publicly on July 1. I'd love you to be in it.

More details coming in the next email. But first — are you in?

Just reply yes.

Taylor"""
  },
  {
    'id': 'EC-2026-001-ALPHA-E2',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'ALPHA',
    'email_number': 2,
    'subject_line': '10 minutes — I want to understand your kitchen',
    'preview_text': 'Before I give you access, I want to make sure it\'s actually going to help you.',
    'send_day': 2,
    'trigger_event': 'alpha_invite_sent',
    'funnel_stage': 'hook',
    'role': 'questionnaire',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'alpha_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'dl_id': 'DL-DIR-0002',
    'full_email_body': """Hey [first name],

Thank you for saying yes.

Before I add you to the alpha group, I have 10 questions for you.

Not a survey. Not a form. A real conversation about how food works in your house — so I can make sure easyChef Pro is actually going to be useful for you, not just another app on your phone.

[Answer 10 questions →] (questionnaire link — easychefpro.com/alpha-questionnaire)

Takes about 10 minutes. Your answers genuinely shape what we build next.

One of the things Steve and I got really clear on while building this: the people who give us the most honest feedback in the first weeks are the ones who end up most invested in the product. I want you to be one of those people.

The questionnaire closes May 24. After that, I'm sending out the first batch of invites.

Taylor

P.S. If something in the questions doesn't apply to you, just skip it. There are no wrong answers here."""
  },
  {
    'id': 'EC-2026-001-ALPHA-E3',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'ALPHA',
    'email_number': 3,
    'subject_line': "You're in the alpha group",
    'preview_text': 'App access is coming. Here\'s what to expect.',
    'send_day': '',
    'trigger_event': 'questionnaire_reviewed_manual',
    'funnel_stage': 'solve',
    'role': 'selection',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'alpha_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit — MANUAL SEND',
    'dl_id': 'DL-DIR-0003',
    'full_email_body': """Hey [first name],

You made the cut.

I read through your questionnaire personally. Your feedback is exactly the kind of honest, specific input we need right now.

Here's what happens next:

App access: June 12 (two weeks before public launch)
What you're testing: the full loop — TRACK, PLAN, OPTIMIZE, COOK, SHOP
What I need from you: use it for at least one week and tell me honestly what broke, what worked, and what confused you

No scripts. No review templates. Just your real experience.

I'll send your download link on June 12.

One more thing: you're getting the founding price — $7.99/month locked forever — as a thank you for being here first. That's yours regardless of what you say in feedback.

Talk soon.

Taylor"""
  },
  {
    'id': 'EC-2026-001-ALPHA-E4',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'ALPHA',
    'email_number': 4,
    'subject_line': "Your access is live — here's the link",
    'preview_text': "The app is in your hands. Here's where to start.",
    'send_day': '',
    'trigger_event': 'alpha_access_granted_manual',
    'funnel_stage': 'solve',
    'role': 'app_access',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'alpha_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit — MANUAL SEND',
    'dl_id': 'DL-DIR-0001',
    'full_email_body': """Hey [first name],

Today's the day.

Your alpha access link: [DL-DIR-0001 — easychefpro.com/lp/alpha]

Download it. Set up your pantry. Cook one recipe.

That's all I'm asking for week one.

Not a full audit. Not a detailed report. Just: download, set up, cook one recipe.

Then tell me what happened.

I'll be in touch at the end of the week to ask you 3 questions.

Taylor

P.S. If anything breaks — and things might break, this is alpha — just reply to this email. Don't post about it anywhere yet. I want to fix it before the world sees it."""
  },
  {
    'id': 'EC-2026-001-ALPHA-E5',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'ALPHA',
    'email_number': 5,
    'subject_line': 'One week in — 3 questions',
    'preview_text': "You've had the app for a week. I have 3 questions.",
    'send_day': 14,
    'trigger_event': 'alpha_access_granted',
    'funnel_stage': 'proof',
    'role': 'feedback',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'alpha_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'dl_id': 'DL-DIR-0005',
    'full_email_body': """Hey [first name],

One week.

I just have 3 questions. Reply however you want — long, short, voice note transcribed, whatever.

1. What worked? What part of the loop actually did something useful for you this week?

2. What broke? What didn't work, confused you, or made you want to close the app?

3. Would you recommend it? Not as a favour — honestly. If a close friend asked you "should I try this?", what would you say?

That's it. No form. Just reply here.

Your feedback directly shapes what we fix before July 1.

Taylor

P.S. If you haven't had a chance to use it much yet — no pressure. Tell me why and we'll figure out if there's something in the setup we can make easier."""
  },
  {
    'id': 'EC-2026-001-ALPHA-E6',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'ALPHA',
    'email_number': 6,
    'subject_line': 'Thank you — and what happens next',
    'preview_text': 'You helped build this. Here\'s what it means.',
    'send_day': 21,
    'trigger_event': 'alpha_complete',
    'funnel_stage': 'proof',
    'role': 'thank_you',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'alpha_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'dl_id': 'DL-DIR-0006',
    'full_email_body': """Hey [first name],

Thank you.

Not in a marketing-email way. In a real way.

The things you told us — what worked, what broke, what confused you — those became fixes. Real changes that will make the experience better for the families who come after you.

You helped build this.

Here's what happens next:

July 1 — easyChef Pro goes public. You already have access.
Your founding price — $7.99/month — is locked forever. That doesn't change.
If you want to keep using it, just stay. You're already in.

One ask: when July 1 lands, tell someone.
Not a review. Not a post. Just one person in your life who has this problem.
Send them this: easychefpro.com/coming-soon

That's the most valuable thing you can do for us.

Thank you for being first.

Taylor and Steve
Built by firefighters and paramedics."""
  }
]

for i, email in enumerate(emails):
    payload = json.dumps({'action': 'email_sequences_write', 'sequence': email})
    fname = f'tmp_alpha_r{i+1}.json'
    with open(fname, 'w') as f:
        f.write(payload)
    result = subprocess.run(['node', 'run-gas.js', f'@{fname}'], capture_output=True, text=True)
    ok = '"ok": true' in result.stdout
    print(f'ALPHA-E{i+1}: {"OK" if ok else "FAIL"}  {email["subject_line"]}')
    if i < len(emails) - 1:
        time.sleep(1)

print('\nDone.')
