const https = require('https');
const url = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec';
function post(p) {
  return new Promise((resolve) => {
    const body = JSON.stringify(p);
    const opts = { method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)} };
    const req = https.request(url, opts, (res) => {
      if (res.statusCode===302||res.statusCode===301) {
        const r2 = https.request(res.headers.location,{method:'GET'},(res2)=>{
          let d=''; res2.on('data',c=>d+=c); res2.on('end',()=>{ try{resolve(JSON.parse(d))}catch(e){resolve({raw:d.substring(0,300)})} });
        }); r2.on('error',e=>resolve({error:e.message})); r2.end(); return;
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ try{resolve(JSON.parse(d))}catch(e){resolve({raw:d.substring(0,300)})} });
    });
    req.on('error',e=>resolve({error:e.message})); req.write(body); req.end();
  });
}
async function main() {
  // Health check to get deploy version
  const hc = await post({ action:'system_health_check', campaign_id:'EC-2026-001' });
  const hcData = hc.health || hc;
  console.log('deploy:', hcData.deploy || hcData.deploy_version || '?');
  console.log('red_systems:', JSON.stringify(hcData.red_systems||[]));

  // Try Klaviyo: get lists (will tell us if API key is set)
  console.log('\nTesting Klaviyo API key...');
  const kl = await post({ action:'klaviyo_get_lists' });
  if (kl.ok) {
    console.log('Klaviyo OK — ' + (kl.lists||[]).length + ' lists');
    (kl.lists||[]).slice(0,3).forEach(l => console.log('  List:', l.id, l.name));
  } else {
    console.log('Klaviyo ERROR:', kl.error || JSON.stringify(kl));
  }

  // Get email sequences to see current variant structure
  console.log('\nEmail sequence summary...');
  const hc2 = await post({ action:'system_health_check', campaign_id:'EC-2026-001' });
  console.log('email_sequences:', (hc2.health||hc2).email_sequences);

  // Check if ExperimentRegistry exists by trying sync_convert_data
  console.log('\nConvert.com status check...');
  const cv = await post({ action:'sync_convert_data', campaignId:'EC-2026-001' });
  console.log('sync_convert_data:', cv.ok ? ('synced:' + cv.result.synced + ' errors:' + cv.result.errors.length) : JSON.stringify(cv).substring(0,200));
}
main();
