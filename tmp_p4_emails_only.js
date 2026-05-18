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
  const FOLDER_ID = '1O9WYhU7B9MS9aMTUurBRCA5xufE3o8rl';
  console.log('Exporting emails as Google Docs (@817 fixed)...');
  const r = await post({ action:'export_emails_as_docs', campaign_id:'EC-2026-001', folder_id:FOLDER_ID });
  if (r.ok) {
    console.log('OK — ' + r.result.email_count + ' emails');
    console.log('Folder:', r.result.folder_url);
    Object.entries(r.result.doc_urls||{}).forEach(([k,v]) => console.log(' ', k, ':', v));
  } else {
    const log = (r.log||'').split('\n').filter(l=>l.includes('error')||l.includes('ERROR')).join('\n');
    console.log('ERROR:', r.result && r.result.error ? r.result.error : JSON.stringify(r));
    if (log) console.log('GAS log:', log);
  }
}
main();
