import json, urllib.request, re, time

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

def gas(payload):
    req = urllib.request.Request(GAS_URL, data=json.dumps(payload).encode(), headers={'Content-Type': 'text/plain'}, method='POST')
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())

# ── Per-file targeted replacements ─────────────────────────────
# Each entry: (old_string, new_string)

PATCHES = {
    'email-templates/ALPHA-E1_v1.html': [
        # title
        ("{{ person.first_name | default: 'there' }}, you're one of our 50.", "You're one of our 50."),
        # preheader comment
        ("<!-- ── PREHEADER ── {{ person.first_name | default: 'there' }}. -->", "<!-- ── PREHEADER ── You're in. -->"),
        # HTML comment block
        ("SCENE: {{ person.first_name | default: 'there' }}.", "SCENE: You're in."),
        # body scene greeting
        ("            {{ person.first_name | default: 'there' }}.", "            You're in."),
        # metadata subject comment
        ("  {SUBJECT}       {{ person.first_name | default: 'there' }}, you're one of our 50.", "  {SUBJECT}       You're one of our 50."),
    ],
    'email-templates/ALPHA-E2_v1.html': [
        # title
        ("{{ person.first_name | default: 'there' }}, here are your 4 tasks.", "Here are your 4 tasks."),
        # task progress line - replace person vars with static 0s
        ("{{ person.pantry_items | default: 0 }}/20 items", "0/20 items"),
        ("{{ person.meals_cooked | default: 0 }}/3 meals", "0/3 meals"),
        ("{{ person.spoilage_saves | default: 0 }}/1 saves", "0/1 saves"),
        # metadata subject
        ("  {SUBJECT}       {{ person.first_name | default: 'there' }}, here are your 4 tasks.", "  {SUBJECT}       Here are your 4 tasks."),
    ],
    'email-templates/ALPHA-E3_v1.html': [
        # title
        ("{{ person.first_name | default: 'there' }} - how's the kitchen?", "How's the kitchen?"),
        # h1 dynamic stats
        ("          {{ person.meals_cooked | default: 0 }} meals cooked.<br>{{ person.pantry_items | default: 0 }} items in your pantry.<br>{{ person.spoilage_saves | default: 0 }} items saved from the bin.", "          Meals cooked. Pantry stocked. Less food wasted."),
        # {% if %} block - keep the else branch
        ("          {% if person.meals_cooked >= 3 %}Three meals already. You're ahead of where most families are at day 7. The pattern is already showing — what you bought is actually becoming dinner.{% elsif person.meals_cooked == 0 %}Haven't cooked your first meal yet? That's okay. You still have a week. Open the app tonight — add your pantry items first. That's task 1 and it takes 10 minutes.{% else %}One or two meals in — you're right on track. The first few are always the ones that tell you how your kitchen actually works.{% endif %}",
         "          One or two meals in — you're right on track. The first few are always the ones that tell you how your kitchen actually works."),
        # metadata subject
        ("  {SUBJECT}       {{ person.first_name | default: 'there' }} - how's the kitchen?", "  {SUBJECT}       How's the kitchen?"),
    ],
    'email-templates/ALPHA-E4_v1.html': [
        # title
        ("Quick question, {{ person.first_name | default: 'there' }}.", "Quick question."),
        # h1
        ("          {{ person.tasks_completed | default: 0 }}/4 tasks complete.<br>Four days left.", "          Almost there. Four days left."),
        # {% if %} block - keep else branch
        ("          {% if person.tasks_completed >= 4 %}All four tasks done. You've done exactly what we needed. Your feedback window opens now — leave your notes before June 22.{% elsif person.tasks_completed >= 2 %}Halfway there. Four days is enough time to finish. Open the app tonight and keep going.{% else %}Still at the start? Four days is still four days. Even completing two tasks gives us useful data. Open the app and start with pantry — 10 minutes.{% endif %}",
         "          Still working through the tasks? Four days is still four days. Even completing two tasks gives us useful data. Open the app and start with pantry — 10 minutes."),
        # metadata subject
        ("  {SUBJECT}       Quick question, {{ person.first_name | default: 'there' }}.", "  {SUBJECT}       Quick question."),
    ],
    'email-templates/ALPHA-E5_v1.html': [
        # title
        ("{{ person.first_name | default: 'there' }}, your two weeks are up.", "Your two weeks are up."),
        # body stats + if block on one line
        ("          {{ person.meals_cooked | default: 0 }} meals cooked from the app.<br>{{ person.spoilage_saves | default: 0 }} items saved from the bin.<br>{{ person.pantry_items | default: 0 }} items in your pantry right now.<br>{% if person.weekly_savings > 0 %}An estimated ${{ person.weekly_savings }} saved this month.{% endif %}",
         "          Meals cooked from the app. Items saved from the bin. Pantry stocked."),
        # metadata subject
        ("  {SUBJECT}       {{ person.first_name | default: 'there' }}, your two weeks are up.", "  {SUBJECT}       Your two weeks are up."),
    ],
    'email-templates/ALPHA-E6_v1.html': [
        # title
        ("{{ person.first_name | default: 'there' }}, here is what your feedback built.", "Here is what your feedback built."),
        # body greeting
        ("          Thank you for being one of 50, {{ person.first_name | default: 'there' }}.", "          Thank you for being one of our original 50."),
        # metadata subject
        ("  {SUBJECT}       {{ person.first_name | default: 'there' }}, here is what your feedback built.", "  {SUBJECT}       Here is what your feedback built."),
    ],
}

TEMPLATE_IDS = {
    'email-templates/ALPHA-E1_v1.html': 'UM8eaZ',
    'email-templates/ALPHA-E2_v1.html': 'Tx68VK',
    'email-templates/ALPHA-E3_v1.html': 'XEjGdW',
    'email-templates/ALPHA-E4_v1.html': 'Uxet8P',
    'email-templates/ALPHA-E5_v1.html': 'QRKrLt',
    'email-templates/ALPHA-E6_v1.html': 'VC23Fh',
}

print('=== STATICIZING ALL 6 ALPHA TEMPLATES — removing all {{ person.X }} ===\n')

for path, patches in PATCHES.items():
    template_id = TEMPLATE_IDS[path]
    label = path.split('/')[-1].replace('_v1.html', '')

    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    for old, new in patches:
        if old in html:
            html = html.replace(old, new)
        else:
            print(f'  WARNING: pattern not found in {label}: {old[:60]}')

    # Catch-all: remove any remaining {{ person.X }} that slipped through
    remaining = re.findall(r'\{\{[^}]*person\.[^}]+\}\}', html)
    if remaining:
        print(f'  REMAINING person vars in {label}: {remaining}')
        html = re.sub(r'\{\{[^}]*person\.[^}]+\}\}', '', html)

    # Catch-all: remove any remaining {% if/elsif/else/endif person... %} blocks
    remaining_if = re.findall(r'\{%[^%]*person[^%]*%\}', html)
    if remaining_if:
        print(f'  REMAINING person tags in {label}: {remaining_if}')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)

    # Verify no person vars left (except unsubscribe_url which is fine)
    check = re.findall(r'\{\{[^}]*person\.[^}]+\}\}', html)
    check_if = re.findall(r'\{%[^%]*person[^%]*%\}', html)
    clean = not check and not check_if
    print(f'{label}: saved locally — clean={clean}')

    r = gas({'action': 'klaviyo_update_template', 'template_id': template_id, 'html': html})
    if r.get('ok'):
        print(f'  -> Klaviyo {template_id}: PUSHED ok')
    else:
        print(f'  -> Klaviyo {template_id}: FAIL code={r.get("code")} {r.get("error","")[:80]}')

    time.sleep(0.5)

print('\n=== DONE — all person.X references removed ===')
