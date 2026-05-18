const https = require('https');
const url = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec';
function post(p) {
  return new Promise((resolve) => {
    const body = JSON.stringify(p);
    const opts = { method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)} };
    const req = https.request(url, opts, (res) => {
      if (res.statusCode===302||res.statusCode===301) {
        const r2 = https.request(res.headers.location,{method:'GET'},(res2)=>{
          let d=''; res2.on('data',c=>d+=c); res2.on('end',()=>{ try{resolve(JSON.parse(d))}catch(e){resolve({raw:d.substring(0,400)})} });
        }); r2.on('error',e=>resolve({error:e.message})); r2.end(); return;
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ try{resolve(JSON.parse(d))}catch(e){resolve({raw:d.substring(0,400)})} });
    });
    req.on('error',e=>resolve({error:e.message})); req.write(body); req.end();
  });
}
async function main() {
  // Test existing klaviyo_push_sequence with new revision
  console.log('Testing klaviyo_push_sequence...');
  const r = await post({ action:'klaviyo_push_sequence', campaign_id:'EC-2026-001' });
  console.log('ok:', r.ok);
  const res = r.result || r;
  if (res.flows_created !== undefined) {
    console.log('flows_created:', res.flows_created);
    (res.flow_ids||[]).forEach(f => console.log(' ', f.sequence_code, ':', f.flow_id || 'ERROR: ' + f.error));
  } else {
    console.log('result:', JSON.stringify(res).substring(0,300));
  }
  const log = (r.log||'').split('\n').filter(l=>l.match(/error|ERROR|FAIL|revision|method/i)).join('\n');
  if (log) console.log('GAS log:', log.substring(0,400));
}
main();
