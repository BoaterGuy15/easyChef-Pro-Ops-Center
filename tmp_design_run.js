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
function logErr(r) {
  const log = (r.log||'').split('\n').filter(l=>l.match(/error|ERROR/i)).join('\n');
  if (log) console.log('  GAS errors:', log.substring(0,300));
}
async function main() {
  // Step 1: Patch 5-element image_brief on all social posts
  console.log('=== STEP 1: Patch image_brief on all social posts ===');
  const r1 = await post({ action:'patch_social_image_briefs', campaign_id:'EC-2026-001' });
  const r1res = r1.result || {};
  if (r1res.ok || r1.ok) {
    console.log('image_brief patched:', r1res.patched, 'posts | skipped:', r1res.skipped);
  } else {
    console.log('ERROR:', r1res.error || JSON.stringify(r1).substring(0,200));
    logErr(r1);
  }

  // Step 2: Write DesignTokens tab to Sheet
  console.log('\n=== STEP 2: Write DesignTokens tab ===');
  const r2 = await post({ action:'write_design_tokens_tab' });
  const r2res = r2.result || {};
  if (r2res.ok || r2.ok) {
    console.log('DesignTokens tab written:', r2res.rows_written, 'rows');
    if (r2res.sheet_id) console.log('Sheet ID:', r2res.sheet_id);
  } else {
    console.log('ERROR:', r2res.error || JSON.stringify(r2).substring(0,200));
    logErr(r2);
  }

  // Step 3: Write Figma storyboard doc
  console.log('\n=== STEP 3: Write Figma Storyboard doc (TikTok + YouTube) ===');
  const r3 = await post({ action:'write_figma_storyboard_doc', campaign_id:'EC-2026-001', folder_id:'1O9WYhU7B9MS9aMTUurBRCA5xufE3o8rl' });
  const r3res = r3.result || {};
  if (r3res.ok || r3.ok) {
    console.log('Storyboard doc created');
    console.log('TikTok frames:', r3res.tk_frames, '| YouTube frames:', r3res.yt_frames);
    console.log('Doc URL:', r3res.doc_url);
  } else {
    console.log('ERROR:', r3res.error || JSON.stringify(r3).substring(0,200));
    logErr(r3);
  }
}
main();
