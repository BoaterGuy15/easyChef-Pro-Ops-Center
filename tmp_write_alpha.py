import json, subprocess, time

DEPLOY_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

emails = [
  {
    'id': 'EC-2026-001-ALPHA-E1',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'ALPHA',
    'email_number': 1,
    'subject_line': 'you made it in',
    'preview_text': 'seriously, thank you',
    'send_day': 0,
    'trigger_event': 'alpha_invite_sent',
    'funnel_stage': 'hook',
    'role': 'welcome',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'alpha_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'full_email_body': """Hey [first name],

I wanted to reach out personally.

You signed up to test easyChef Pro before anyone else, and I don't take that lightly. The whole team and I have put a lot of ourselves into this app — way more hours than I'd admit to most people — and none of that matters if real people don't actually find it useful.

You're one of the first. That means something.

Over the next couple of weeks I'll check in a few times. Nothing pushy — I just want to make sure you have what you need and hear what you think.

Thank you for being here.

Taylor"""
  },
  {
    'id': 'EC-2026-001-ALPHA-E2',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'ALPHA',
    'email_number': 2,
    'subject_line': 'two minutes before you dive in',
    'preview_text': 'one thing I need to know',
    'send_day': 1,
    'trigger_event': 'alpha_invite_sent',
    'funnel_stage': 'hook',
    'role': 'questionnaire',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'alpha_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'full_email_body': """Hey [first name],

Before you get into the app, I have one quick ask.

Can you fill out a short questionnaire? Two minutes, maybe less.

[Link]

I want to know what dinner actually looks like in your house right now — not to pitch you something, but so I know the app is solving the right problem for you before you spend any time in it.

If it doesn't fit your life, I'd rather know now. And if it does, this helps us understand exactly why.

That's the whole ask.

Taylor"""
  },
  {
    'id': 'EC-2026-001-ALPHA-E3',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'ALPHA',
    'email_number': 3,
    'subject_line': "you're in the first group",
    'preview_text': 'what to expect',
    'send_day': 3,
    'trigger_event': 'questionnaire_complete',
    'funnel_stage': 'solve',
    'role': 'selection',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'alpha_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'full_email_body': """Hey [first name],

Thanks for filling that out.

You're confirmed for the first wave. I genuinely appreciate those two minutes — it helped more than you'd think.

Fair warning: the app isn't finished yet. That's the point of this. You're going to find things that feel off, and when that happens I want you to tell me. Not through a support ticket — just reply to this email.

Your access link is below. No deadline, no pressure.

[Access link]

Taylor"""
  },
  {
    'id': 'EC-2026-001-ALPHA-E4',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'ALPHA',
    'email_number': 4,
    'subject_line': 'start here',
    'preview_text': "the one thing I'd do first",
    'send_day': 4,
    'trigger_event': 'access_granted',
    'funnel_stage': 'solve',
    'role': 'app_access',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'alpha_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'full_email_body': """Hey [first name],

If you haven't opened the app yet, here's where I'd start:

Point your camera at your fridge.

That's the whole product in one move. The app reads what you have, tells you what you can make tonight, and starts building a plan from there. Everything else grows from that first scan.

If something feels confusing or doesn't work right, reply here. I read all of these.

Our team is watching these early sessions closely. What you do this week is directly shaping what we build next. You're in a very small group.

Taylor"""
  },
  {
    'id': 'EC-2026-001-ALPHA-E5',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'ALPHA',
    'email_number': 5,
    'subject_line': "how's it actually going",
    'preview_text': 'no wrong answer here',
    'send_day': 7,
    'trigger_event': 'alpha_invite_sent',
    'funnel_stage': 'proof',
    'role': 'feedback',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'alpha_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'full_email_body': """Hey [first name],

You've had the app for a few days. I want to check in.

How's it going — honestly?

I'm not looking for a five-star review. The most useful thing you can tell me is what didn't work, what confused you, or what you just didn't bother trying.

Two quick questions:
1. Did you use the app at least once this week?
2. What was the first thing that felt off?

Just reply here. Thirty seconds.

This feedback is the most valuable thing we have right now.

Taylor"""
  },
  {
    'id': 'EC-2026-001-ALPHA-E6',
    'campaign_id': 'EC-2026-001',
    'sequence_code': 'ALPHA',
    'email_number': 6,
    'subject_line': 'from me and the whole team',
    'preview_text': 'one last thing',
    'send_day': 14,
    'trigger_event': 'alpha_complete',
    'funnel_stage': 'proof',
    'role': 'thank_you',
    'status': 'written',
    'icp_code': 'all',
    'segment': 'alpha_testers',
    'target_word_count': '100-150',
    'body_theme': 'ConvertKit',
    'full_email_body': """Hey [first name],

Alpha is wrapping up and I wanted to send one last note.

Thank you — genuinely.

You gave us your time. You tested something unfinished and told us what you thought. Not everyone does that, and the fact that you did makes the app better. Not in a marketing way. Literally better, because of what you told us.

The whole easyChef Pro team is grateful. We put a lot into this, and knowing real people are in it makes it worth every hour.

When we launch, you'll be first to know.

Taylor"""
  }
]

for i, email in enumerate(emails):
    payload = json.dumps({'action': 'email_sequences_write', 'sequence': email})
    fname = f'tmp_alpha_e{i+1}.json'
    with open(fname, 'w') as f:
        f.write(payload)
    result = subprocess.run(['node', 'run-gas.js', f'@{fname}'], capture_output=True, text=True)
    last = result.stdout.strip().split('\n')[-3:]
    print(f'E{i+1} ({email["subject_line"]}): ' + ' '.join(last))
    if i < len(emails) - 1:
        time.sleep(1)

print('\nDone.')
