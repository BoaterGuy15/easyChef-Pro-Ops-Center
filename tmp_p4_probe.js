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
  // Get one email to see structure
  const r = await post({ action:'get_email_sequence', campaign_id:'EC-2026-001', sequence_id:'SEQ-1' });
  const emails = r.emails || r.sequence || r.result || r;
  if (Array.isArray(emails) && emails.length) {
    console.log('Email fields:', Object.keys(emails[0]));
    console.log('Sample email_id:', emails[0].email_id);
    console.log('Sample subject:', (emails[0].subject||'').substring(0,60));
    console.log('Sample body length:', (emails[0].body||'').length);
  } else {
    console.log('get_email_sequence raw:', JSON.stringify(r).substring(0,300));
  }
  // Get one social post to see structure
  const r2 = await post({ action:'get_social_posts', campaign_id:'EC-2026-001', platform:'Facebook' });
  const posts = r2.posts || r2.result || r2;
  if (Array.isArray(posts) && posts.length) {
    console.log('\nSocial fields:', Object.keys(posts[0]));
    console.log('Sample post_id:', posts[0].post_id);
    console.log('Sample platform:', posts[0].platform);
    console.log('Sample body length:', (posts[0].body||posts[0].post_body||'').length);
  } else {
    console.log('\nget_social_posts raw:', JSON.stringify(r2).substring(0,300));
  }
}
main();
