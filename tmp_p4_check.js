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
  // Check CcSettings for Drive folder, Klaviyo key, Convert.com key
  const keys = ['DRIVE_FOLDER_ID','CAMPAIGN_FOLDER_ID','KLAVIYO_API_KEY','KLAVIYO_LIST_ID',
                 'CONVERTCOM_API_KEY','CONVERTCOM_PROJECT_ID','CONVERTCOM_EXPERIMENT_ID'];
  for (const k of keys) {
    const r = await post({ action:'read_cc_setting', key: k });
    console.log(k + ':', r.value || r.result || JSON.stringify(r));
  }
  // Also check health to confirm deploy
  const hc = await post({ action:'system_health_check', campaign_id:'EC-2026-001' });
  console.log('\nred_systems:', JSON.stringify(hc.red_systems||[]));
}
main();
