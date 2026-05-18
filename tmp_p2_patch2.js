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

// SEQ-4-E2-A: 245 → 175 words | peaceful | super_mom_money
const SEQ4_E2_A = `Five minutes. That is how long the first easyChef Pro session takes — and what it sets up for every dinner this week.

Every day between downloading the app and using it is a day the fridge runs without visibility. The chicken you bought last Sunday is three days closer to the trash. The $111 monthly drain runs on its own schedule regardless of what is on your phone.

Open easyChef Pro. Tap TRACK. Scan the items in your fridge. Five minutes the first time, thirty seconds after that. The app maps what you have and tells you exactly what to make tonight from it.

The fridge becomes visible. The groceries have a path to the table. The first dinner made from what you already own is the first dollar of the $111 monthly recovery.

Tested across 10,000 households. 69.5% less food waste. The recovery starts with the first scan.

Open the app and scan your fridge in the next five minutes — start recovering $111 a month tonight.`;

// SEQ-4-E3-B: 245 → 175 words | peaceful | super_mom_time
const SEQ4_E3_B = `Tonight the founding price locks at midnight. The families who scanned their fridges this week already have the app working. Tonight is the last night to join them at $7.99.

The 6:30 PM scramble is still optional tonight. After midnight, the same solution costs more. The evenings after tonight do not know the difference — the 6:30 moment arrives regardless. The only thing that changes at midnight is what it costs to end it.

easyChef Pro ends the 6:30 PM scramble permanently. Scan the fridge. Dinner decided. Fridge to table in thirty minutes.

Every evening after the first scan is a different evening. The question that was yours every night has a different owner. The founding families locked that change in at $7.99 a month — forever.

Tested across 10,000 households. Thirty minutes. 69.5% less food waste.

Join the founding families tonight — lock in $7.99 forever before midnight and end the 6:30 PM scramble for good.`;

// SEQ-1-E2-B: 293 → 200 words | frustrated | super_mom_time
const SEQ1_E2_B = `Somewhere between leaving work and walking through the front door, the what-is-for-dinner question attaches itself to you. By the time you reach the kitchen, you have been carrying it for an hour.

It is not just the cooking. It is the decision. Every night. You are the one who knows what is in the fridge, what needs to be used first, what the kids will actually eat. That information lives in your head — not anywhere else. And every evening it gets consulted whether you have energy for it or not.

The dinner decision is the last decision of a full day, arriving at the moment you have the least to give. You are standing in a kitchen with food but no dinner, fielding questions from people who are hungry. This is not a bad night. This is every night.

easyChef Pro carries the dinner decision for you. It knows what is in your fridge, what needs to go first, and what becomes dinner tonight. You walk in. It already has the answer.

Tested across 10,000 real households. Fridge to table. Thirty minutes. 69.5% less food waste.

Give the dinner decision to an app — lock in $7.99 forever and take your evenings back.`;

// SEQ-2-E1-B: 297 → 200 words | curious | super_mom_time
const SEQ2_E1_B = `Every evening you run a mental inventory of the fridge before you can decide what is for dinner. That scan takes longer than it should — because no one is keeping track for you.

You know approximately what is in there. You think the chicken is still good. You believe there were eggs this morning. But approximate is not enough at 6:30 PM after a full day. The time spent auditing the fridge before you can even begin deciding what to cook is invisible — but it adds up.

The mental inventory of your fridge is a job that runs quietly all day. You update it when you shop, when you cook, when something runs low. That background process is always on — it is why you end up standing at the open fridge taking stock instead of just grabbing what you need.

The TRACK feature in easyChef Pro carries that inventory for you. Scan groceries when they arrive. The app maps what you have, what is expiring first, and what to make tonight.

Tested across 10,000 real households. Thirty minutes. 69.5% less food waste.

Get the dinner decision out of your head — lock in $7.99 forever and let TRACK do the inventory.`;

function wc(text) { return text.split(/\s+/).filter(Boolean).length; }

async function main() {
  const patches = [
    { email_id: 'EC-2026-001-SEQ-4-E2-A', fields: { full_email_body: SEQ4_E2_A }, tgt: 175 },
    { email_id: 'EC-2026-001-SEQ-4-E3-B', fields: { full_email_body: SEQ4_E3_B }, tgt: 175 },
    { email_id: 'EC-2026-001-SEQ-1-E2-B', fields: { full_email_body: SEQ1_E2_B }, tgt: 200 },
    { email_id: 'EC-2026-001-SEQ-2-E1-B', fields: { full_email_body: SEQ2_E1_B }, tgt: 200 },
  ];

  for (const p of patches) {
    const words = wc(p.fields.full_email_body);
    const r = await post({ action: 'patch_email_fields', email_id: p.email_id, fields: p.fields });
    console.log(p.email_id, '→', r.ok ? ('OK [' + words + ' words, target ' + p.tgt + ']') : JSON.stringify(r));
  }
  console.log('\nAll 4 trim patches complete.');
}

main();
