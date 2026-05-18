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
  const keys = ['DRIVE_FOLDER_ID','CAMPAIGN_FOLDER_ID','KLAVIYO_API_KEY','KLAVIYO_LIST_ID',
                 'CONVERTCOM_API_KEY','CONVERTCOM_PROJECT_ID','CONVERTCOM_EXPERIMENT_ID'];
  const r = await post({ action:'get_settings' });
  // Log top-level keys
  console.log('settings keys:', Object.keys(r.settings||{}));
  // Look for cc_settings or similar
  const s = r.settings || {};
  const ccRows = s.cc_settings || s.settings || s.cc || [];
  console.log('cc_settings rows count:', ccRows.length);
  if (ccRows.length) {
    for (const k of keys) {
      const row = ccRows.find(row => row.key === k);
      console.log(k + ':', row ? (row.label || '(blank)') : 'NOT FOUND');
    }
  }
  // health check
  const hc = await post({ action:'system_health_check', campaign_id:'EC-2026-001' });
  console.log('\ndeploy:', hc.deploy_version || hc.deploy || JSON.stringify(hc).substring(0,200));
  console.log('red_systems:', JSON.stringify(hc.red_systems||[]));
}
main();
