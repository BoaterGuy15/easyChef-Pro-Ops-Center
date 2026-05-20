import json, urllib.request, ssl, sys

sys.stdout.reconfigure(encoding='utf-8')

GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec'

def gas(body):
    data = json.dumps(body).encode('utf-8')
    ctx  = ssl.create_default_context()
    req  = urllib.request.Request(GAS_URL, data=data, headers={'Content-Type': 'text/plain'})
    with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
        return json.loads(r.read().decode('utf-8'))

# ── MASTER_STORY_001 ──────────────────────────────────────────────────────────
r = gas({'action': 'append_brand_doctrine', 'rule': {
    'rule_id':   'MASTER_STORY_001',
    'rule_type': 'positioning',
    'enforcement': 'hard',
    'active': True,
    'conditions': {
        'category_position': 'The app that evolves with your life.',
        'story_lines': [
            'The app that evolves with your life.',
            'The problem was never you. The system was disconnected.',
            'Your life changes. Your kitchen should change with it.'
        ],
        'critical_positioning': 'Most food apps assume the same person forever. easyChef Pro is the system your kitchen was always missing.',
        'instruction': 'Every headline, every hook, every CTA must connect back to this narrative spine.',
        'locked': True
    }
}})
print('MASTER_STORY_001:', json.dumps(r))

# ── CATEGORY_POSITION_001 ─────────────────────────────────────────────────────
r = gas({'action': 'append_brand_doctrine', 'rule': {
    'rule_id':   'CATEGORY_POSITION_001',
    'rule_type': 'positioning',
    'enforcement': 'hard',
    'active': True,
    'conditions': {
        'category_claim': 'The app that evolves with your life.',
        'contrast': 'Most food apps assume the same person forever. easyChef Pro does not.',
        'positioning': 'easyChef Pro is the system your kitchen was always missing.',
        'enemy': 'Not another app. The 6:30 PM panic. The expired spinach. The $1,336 thrown away.',
        'never_rule': 'Never position against a specific competitor. Position against the broken status quo.',
        'locked': True
    }
}})
print('CATEGORY_POSITION_001:', json.dumps(r))

# ── SO_WHAT_ARCH_001 ──────────────────────────────────────────────────────────
r = gas({'action': 'append_brand_doctrine', 'rule': {
    'rule_id':   'SO_WHAT_ARCH_001',
    'rule_type': 'emotional_architecture',
    'enforcement': 'hard',
    'active': True,
    'conditions': {
        'moment_1': "Oh. THAT'S why this keeps happening.",
        'moment_2': 'easyChef Pro is the first thing actually built to solve that.',
        'emotional_flow': 'Recognition → Realization → Emotional consequence → So what → easyChef Pro closes the gap → Life feels lighter',
        'rules': [
            'The observation is ICP-specific. The door changes per theme.',
            'The realization is always the same: disconnected systems.',
            'The resolution is always the same: easyChef Pro closes those gaps.',
            'easyChef Pro = emotional resolution layer. Not the app. Not the feature set. Not the meal planner.',
            'The theme changes the door. The story is always the same.'
        ],
        'locked': True
    }
}})
print('SO_WHAT_ARCH_001:', json.dumps(r))
