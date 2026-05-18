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

// Fix 1 — PRECISION_RULES_001: add AC-012 ROI figures
const PRECISION_RULES_NEW = {
  figures: [
    { label: 'ANNUAL SAVINGS',  exact: '$1,336/year average savings',              never: '"$1,500" · NEVER "over $1,000"' },
    { label: 'MONTHLY SAVINGS', exact: 'Families save an average of $111 a month' },
    { label: 'FOOD WASTE',      exact: '69.5% less food waste',                    never: '"70%" · NEVER "nearly 70%"' },
    { label: 'DISCOUNT',        exact: '60% off',                                  never: '"50% off"' },
    { label: 'DIETITIANS',      exact: 'registered dietitians',                    never: 'just "dietitians"' },
    { label: 'ROI RETURN',      exact: '$7.99/month — 14x annual return',          never: 'any invented ROI figure · NEVER "15x" · NEVER "10x"' },
    { label: 'ANNUAL COST',     exact: '$95.88/year annual cost at founding price', never: 'any approximation' }
  ],
  cta_rule: 'NEVER "sign up" — use: "Join the waitlist" · "Get early access" · "Join the founding family" · "Lock in your spot"'
};

// Fix 2 — DESIGN_BRIEF_RULES_001: remove $111/month from banned list, add approved note
const DESIGN_BRIEF_RULES_NEW = {
  rules: [
    { label: 'CTA BUTTON COLOR',      detail: 'ALWAYS #FF0000 red. Never orange. Never coral. Brand palette: #FF0000 (red) · #F6EFE8 (beige) · #000000 (black) · #FFFFFF (white)' },
    { label: 'PROOF BAR STATS',       detail: 'Use ONLY these three approved claims word-for-word: $1,336/year savings · 69.5% less food waste · 30 min fridge to table. Never invent stats or numbers.' },
    { label: 'TESTIMONIALS',          detail: 'No invented testimonials. No invented names. No real mom photos with quotes. No invented user counts. Leave blank until real beta feedback is available.' },
    { label: 'SCENE DIRECTION',       detail: 'No shame language directed at the user. The system is broken — never her fault. Show broken systems, wasted food, time lost — not personal failure.' },
    { label: 'BANNED CLAIMS',         detail: '$112/month · any invented monthly savings → use $1,336/year only. $111/month — APPROVED (AC-011, May 17 2026) · use in hook and agitate stages only. Any invented frequency statistic → banned. Invented scarcity numbers → banned. Urgency: First 5,000 families only OR Founding price ends July 1.' },
    { label: 'BANNED ORIGIN PHRASES', detail: '"Built by parents" → must be "Built by first responders". "Born in Silicon Valley" · "Born in [any city]" · any location reference → banned.' },
    { label: 'BANNED NAMES',          detail: 'Sarah → absolutely never use this name. Any invented first name → banned. Any invented location → banned.' },
    { label: 'BANNED FORMATS',        detail: 'Before/after testimonial format → banned. Invented testimonial quotes with names → banned.' }
  ]
};

async function main() {
  console.log('Patching PRECISION_RULES_001...');
  const r1 = await post({ action: 'patch_brand_doctrine', rule_id: 'PRECISION_RULES_001', conditions: PRECISION_RULES_NEW });
  console.log('PRECISION_RULES_001 →', r1.ok ? 'OK (7 figures — added ROI_RETURN + ANNUAL_COST)' : JSON.stringify(r1));

  console.log('Patching DESIGN_BRIEF_RULES_001...');
  const r2 = await post({ action: 'patch_brand_doctrine', rule_id: 'DESIGN_BRIEF_RULES_001', conditions: DESIGN_BRIEF_RULES_NEW });
  console.log('DESIGN_BRIEF_RULES_001 →', r2.ok ? 'OK ($111/month ban removed, approved note added)' : JSON.stringify(r2));

  if (r1.ok && r2.ok) {
    console.log('\nBoth BrandDoctrine patches confirmed. Generation pipeline is now current with AC-011 + AC-012.');
  }
}
main();
