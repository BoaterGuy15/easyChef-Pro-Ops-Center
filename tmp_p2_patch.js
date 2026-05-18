const https = require('https');
const url = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec';

function post(payload) {
  return new Promise((resolve) => {
    const body = JSON.stringify(payload);
    const options = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } };
    const req = https.request(url, options, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        const getReq = https.request(res.headers.location, { method: 'GET' }, (res2) => {
          let d = ''; res2.on('data', c => d += c); res2.on('end', () => resolve(JSON.parse(d)));
        });
        getReq.on('error', e => resolve({ error: e.message })); getReq.end(); return;
      }
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', e => resolve({ error: e.message }));
    req.write(body); req.end();
  });
}

const SEQ1_E1_A_BODY = `Every week, $25 disappears from your grocery budget without a single extra purchase. No splurge. No emergency. It shows up as the spinach that went bad, the chicken that expired Thursday, the yogurt nobody touched. Quietly. Repeatedly. That's $111 a month — $1,336 a year — leaving before dinner gets decided.

It's not that you're spending more. You're wasting what you already bought, because nothing connects your fridge to your dinner plan. No app bridges that gap. So the gap keeps costing you.

easyChef Pro closes that connection. Scan your receipt. The app tracks every item, every expiry date, and builds dinner around what needs to be used first. The invisible drain stops.

Founding price: $7.99 a month, locked forever. First 5,000 families only — after that, $19.99.

Claim your founding spot — stop the $111 leak before the window closes.`;

const SEQ1_E1_B_BODY = `It's 6:30 PM. You've been running since 6:00 AM. The last decision you have left is dinner — and the fridge isn't helping.

This moment costs more than time. The groceries you bought Sunday are quietly expiring in the back of the fridge. Tonight becomes takeout again. Another $111 drains out of this month's budget because nothing connected what you bought to what you planned to cook.

easyChef Pro closes that gap. Scan your grocery receipt when you get home. The app tracks what you have, what expires first, and builds dinner around it. When 6:30 hits, dinner is already planned.

Your evenings back. $111 back in your budget.

Founding price: $7.99 a month, locked forever. First 5,000 families only — after that, $19.99.

Claim your founding spot — end the 6:30 panic tonight.`;

async function main() {
  const patches = [
    // 1 — SEQ-1-E1-A body rewrite (1168 → ~150 words)
    {
      email_id: 'EC-2026-001-SEQ-1-E1-A',
      fields: { full_email_body: SEQ1_E1_A_BODY }
    },
    // 2 — SEQ-1-E1-B body rewrite (331 → ~140 words)
    {
      email_id: 'EC-2026-001-SEQ-1-E1-B',
      fields: { full_email_body: SEQ1_E1_B_BODY }
    },
    // 3 — SEQ-2-E3-A subject dedup
    {
      email_id: 'EC-2026-001-SEQ-2-E3-A',
      fields: { subject_line: '5 dinners planned. 0 extra groceries.' }
    },
    // 4 — SEQ-2-E4-A preview wrong emotional register (problem → relieved)
    {
      email_id: 'EC-2026-001-SEQ-2-E4-A',
      fields: { preview_text: 'One loop connects what you have to what you eat — and keeps $1,336 in your budget.' }
    },
    // 5 — SEQ-2-E4-B preview wrong emotional register
    {
      email_id: 'EC-2026-001-SEQ-2-E4-B',
      fields: { preview_text: 'When the app holds the loop, every evening gets easier.' }
    },
    // 6 — SEQ-3-E1-A: urgency register fix (subject + preview)
    {
      email_id: 'EC-2026-001-SEQ-3-E1-A',
      fields: {
        subject_line: 'The founding price closes in 15 days',
        preview_text: '15 days to lock $7.99 forever. After that: $19.99.'
      }
    },
    // 7 — SEQ-3-E1-B: urgency register fix (subject + preview)
    {
      email_id: 'EC-2026-001-SEQ-3-E1-B',
      fields: {
        subject_line: '15 days to end the 6:30 PM panic — $7.99 forever',
        preview_text: '15 days to lock $7.99 forever. The 6:30 scramble ends here.'
      }
    },
    // 8 — SEQ-4-E1-B duplicate subject fix
    {
      email_id: 'EC-2026-001-SEQ-4-E1-B',
      fields: { subject_line: 'Tonight the app decides dinner. You don\'t.' }
    }
  ];

  for (const p of patches) {
    const r = await post({ action: 'patch_email_fields', email_id: p.email_id, fields: p.fields });
    const keys = Object.keys(p.fields).join(', ');
    console.log(p.email_id, '→', r.ok ? ('OK [' + keys + ']') : JSON.stringify(r));
  }
  console.log('\nDone. Flagged for ML word-count review (not auto-patched):');
  console.log('  SEQ-4-E2-A: 245 words (target 175)');
  console.log('  SEQ-4-E3-B: 245 words (target 175)');
  console.log('  SEQ-1-E2-B: 293 words (target 200)');
  console.log('  SEQ-2-E1-B: 297 words (target 200)');
}

main();
