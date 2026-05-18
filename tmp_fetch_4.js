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

const ids = [
  'EC-2026-001-SEQ-4-E2-A',
  'EC-2026-001-SEQ-4-E3-B',
  'EC-2026-001-SEQ-1-E2-B',
  'EC-2026-001-SEQ-2-E1-B'
];

async function main() {
  const r = await post({ action: 'email_sequences_read', campaign_id: 'EC-2026-001' });
  const seqs = r.sequences || [];
  for (const id of ids) {
    const s = seqs.find(x => x.id === id);
    if (!s) { console.log(id, '→ NOT FOUND'); continue; }
    const body = s.full_email_body || [s.body_hook, s.body_problem, s.body_agitate, s.body_solve, s.body_value, s.body_proof, s.body_cta].filter(Boolean).join('\n\n');
    const wc = body.split(/\s+/).filter(Boolean).length;
    console.log('=== ' + id + ' (' + wc + ' words) ===');
    console.log(body);
    console.log('');
  }
}
main();
