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
  // Test activate only, print full result
  console.log('Testing activate_convert_experiment...');
  const r = await post({ action:'activate_convert_experiment', experiment_id:'100140422' });
  console.log('Full response ok:', r.ok);
  console.log('Result:', JSON.stringify(r.result||{}).substring(0,400));
  const log = (r.log||'').split('\n').filter(l => l.trim()).join('\n');
  if (log) console.log('GAS log:\n', log.substring(0,500));
}
main();
