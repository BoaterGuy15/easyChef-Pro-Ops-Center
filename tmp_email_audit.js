const https = require('https');
const url = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec';

const payload = JSON.stringify({ action: 'email_sequences_read', campaign_id: 'EC-2026-001' });
const options = { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } };
const req = https.request(url, options, (res) => {
  if (res.statusCode === 302 || res.statusCode === 301) {
    const getReq = https.request(res.headers.location, { method: 'GET' }, (res2) => {
      let d = ''; res2.on('data', c => d += c); res2.on('end', () => {
        const parsed = JSON.parse(d);
        const seqs = (parsed.sequences || []).filter(s => {
          const sc = s.sequence_code || '';
          return sc === 'SEQ-1' || sc === 'SEQ-2' || sc === 'SEQ-3' || sc === 'SEQ-4';
        });
        seqs.sort((a, b) => (a.id < b.id ? -1 : 1));
        seqs.forEach(s => {
          const bodyText = s.full_email_body || [s.body_hook, s.body_problem, s.body_agitate, s.body_solve, s.body_value, s.body_proof, s.body_cta].filter(Boolean).join('\n\n');
          const wc = bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0;
          const tgtStr = String(s.target_word_count || '0');
          const tgt = parseInt(tgtStr.split('-')[0]);
          const tgtMax = parseInt(tgtStr.split('-')[1] || tgt);
          const over = tgtMax && wc > tgtMax * 1.4;
          const empty = [s.body_hook, s.body_problem, s.body_agitate, s.body_solve, s.body_value, s.body_proof, s.body_cta].filter(v => !v || v.trim() === '');
          console.log(JSON.stringify({
            id: s.id,
            seq: s.sequence_code,
            subj: s.subject_line,
            prev: s.preview_text,
            emotional: s.emotional_stage,
            icp: s.icp_code,
            wc,
            tgt: s.target_word_count,
            over,
            empty_sections: empty.length > 0 ? ['check'] : [],
            hook: (s.body_hook || '').slice(0, 80),
            cta: (s.body_cta || '').slice(0, 80)
          }));
        });
      });
    });
    getReq.on('error', e => console.error(e)); getReq.end(); return;
  }
  let d = ''; res.on('data', c => d += c); res.on('end', () => console.log(d));
});
req.on('error', e => console.error(e));
req.write(payload); req.end();
