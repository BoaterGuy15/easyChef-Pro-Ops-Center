const https = require('https');
const url = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec';
function post(p) {
  return new Promise((resolve) => {
    const body = JSON.stringify(p);
    const opts = { method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)} };
    const req = https.request(url, opts, (res) => {
      if (res.statusCode===302||res.statusCode===301) {
        const r2 = https.request(res.headers.location,{method:'GET'},(res2)=>{
          let d=''; res2.on('data',c=>d+=c); res2.on('end',()=>{ try{resolve(JSON.parse(d))}catch(e){resolve({raw:d})} });
        }); r2.on('error',e=>resolve({error:e.message})); r2.end(); return;
      }
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ try{resolve(JSON.parse(d))}catch(e){resolve({raw:d})} });
    });
    req.on('error',e=>resolve({error:e.message})); req.write(body); req.end();
  });
}
async function main() {
  const CAMPAIGN_FOLDER_ID = '1O9WYhU7B9MS9aMTUurBRCA5xufE3o8rl';

  // Step 1: Add CAMPAIGN_FOLDER_ID to CcSettings if needed
  console.log('Adding CAMPAIGN_FOLDER_ID to CcSettings...');
  const r0 = await post({ action:'append_setting', section:'cc', key:'CAMPAIGN_FOLDER_ID', label:CAMPAIGN_FOLDER_ID, extra:'EC-2026-001 campaign Drive folder' });
  console.log('append_setting:', r0.ok ? 'OK' : JSON.stringify(r0));

  // Step 2: Export emails as Google Docs
  console.log('\nExporting emails as Google Docs...');
  const r1 = await post({ action:'export_emails_as_docs', campaign_id:'EC-2026-001', folder_id:CAMPAIGN_FOLDER_ID });
  if (r1.ok) {
    console.log('Emails export OK — ' + r1.result.email_count + ' emails across sequences');
    console.log('Folder:', r1.result.folder_url);
    Object.entries(r1.result.doc_urls||{}).forEach(([k,v]) => console.log(' ', k, ':', v));
  } else {
    console.log('Emails export ERROR:', JSON.stringify(r1));
  }

  // Step 3: Export social posts as Google Docs
  console.log('\nExporting social posts as Google Docs...');
  const r2 = await post({ action:'export_social_as_docs', campaign_id:'EC-2026-001', folder_id:CAMPAIGN_FOLDER_ID });
  if (r2.ok) {
    console.log('Social export OK — ' + r2.result.post_count + ' posts across platforms');
    console.log('Folder:', r2.result.folder_url);
    Object.entries(r2.result.doc_urls||{}).forEach(([k,v]) => console.log(' ', k, ':', v));
  } else {
    console.log('Social export ERROR:', JSON.stringify(r2));
  }
}
main();
