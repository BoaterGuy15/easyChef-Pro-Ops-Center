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
  const hc = await post({ action:'system_health_check', campaign_id:'EC-2026-001' });
  console.log('deploy:', hc.deploy_version);
  console.log('red_systems:', JSON.stringify(hc.red_systems||[]));
  console.log('blocked:', hc.blocked_count);
  const sl = await post({ action:'append_session_log', line:'@815 Sun 17 — BrandDoctrine patches: PRECISION_RULES_001 + 2 ROI figures (AC-012 $7.99/14x + $95.88/yr). DESIGN_BRIEF_RULES_001: removed stale $111/month ban, added AC-011 approved note. Deploy: patch_brand_doctrine action added. Generation pipeline now current with all approved claims.' });
  console.log('session_log:', sl.ok ? 'appended' : JSON.stringify(sl));
}
main();
