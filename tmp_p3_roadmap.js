const https = require('https');
const url = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec';
function post(p) {
  return new Promise((resolve) => {
    const body = JSON.stringify(p);
    const opts = { method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)} };
    const req = https.request(url, opts, (res) => {
      if (res.statusCode===302||res.statusCode===301) {
        const r2 = https.request(res.headers.location,{method:'GET'},(res2)=>{
          let d=''; res2.on('data',c=>d+=c); res2.on('end',()=>resolve(JSON.parse(d)));
        }); r2.on('error',e=>resolve({error:e.message})); r2.end(); return;
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve(JSON.parse(d)));
    });
    req.on('error',e=>resolve({error:e.message})); req.write(body); req.end();
  });
}
async function main() {
  // Append Session 13 block to the active Roadmap doc
  const r = await post({
    action: 'update_master_reference',
    session_log: {
      date: '2026-05-17',
      deploy_range: '@800 → @815',
      changes: [
        'P1 — 42 platform-native social posts rewritten (6 arc stages × 7 platforms). bulk_patch_social_posts.',
        'P2 — 30 email audit: 12 patches total. All emails at or below arc word count target.',
        'AC-012 approved by Founder: $95.88/yr annual cost · $7.99/month = 14x return.',
        'PRECISION_RULES_001 updated — added ROI_RETURN + ANNUAL_COST figures for AC-012.',
        'DESIGN_BRIEF_RULES_001 updated — removed stale $111/month ban. AC-011 now APPROVED.',
        'New GAS action: patch_brand_doctrine → patchBrandDoctrine(). Deployed @815.',
        'Cockpit: Assets tab (day-by-day stage view + full post cards) live.',
        'Cockpit: Emails tab (review cards with WC/ML status) live.',
        'OPEN: P4 Drive export · P6 Klaviyo build · P7 Convert.com · Design briefs.',
        'Session 13 Handoff doc: 1P6qScOBq4FvaofIg25z2-v6wprEK8VbSjAglAy5TNnE'
      ]
    }
  });
  console.log('update_master_reference:', r.ok ? 'OK' : JSON.stringify(r));
}
main();
