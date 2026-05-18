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
function logGasErrors(result) {
  const log = (result.log||'').split('\n').filter(l => l.match(/error|ERROR|FAIL|exception/i)).join('\n');
  if (log) console.log('  GAS log errors:', log.substring(0,400));
}
async function main() {
  // ── P6: Klaviyo flows A+B (@819 — revision 2024-10-15) ────────────────────
  console.log('=== P6: KLAVIYO FLOWS A+B ===');
  const r6 = await post({ action:'klaviyo_build_flows', campaign_id:'EC-2026-001', list_id:'TebDTM' });
  console.log('Response ok:', r6.ok);
  const r6res = r6.result || {};
  if (r6.ok) {
    console.log('Flows created:', r6res.flows_created);
    console.log('Emails updated in Sheet:', r6res.emails_updated);
    console.log('Trigger list:', r6res.trigger_list_id);
    (r6res.flow_ids||[]).forEach(f => {
      console.log('  Flow ' + f.variant + ':', f.flow_id || 'ERROR: ' + f.error, f.flow_id ? ('(' + f.email_count + ' emails)') : '');
    });
  } else {
    console.log('P6 result:', JSON.stringify(r6res).substring(0,300));
    logGasErrors(r6);
  }

  // ── P7: Convert.com setup ─────────────────────────────────────────────────
  console.log('\n=== P7: CONVERT.COM SETUP ===');
  const r7 = await post({ action:'run_convert_p7_setup', experiment_id:'100140422', goal_id:'100154109' });
  console.log('Response ok:', r7.ok);
  const r7res = r7.result || {};
  const r7inner = r7res.result || {};

  const act = r7inner.activate;
  const aud = r7inner.audience;
  const gc  = r7inner.goal_check;

  if (act) {
    console.log('Activate:', act.ok ? 'OK (experiment_id=' + act.experiment_id + ' status=active)' : 'FAILED: ' + act.error);
  } else {
    console.log('Activate: not run');
    logGasErrors(r7);
  }
  if (aud) {
    console.log('Audience filter:', aud.ok ? 'OK (utm_medium=email)' : 'FAILED: ' + aud.error);
  }
  if (gc) {
    console.log('Goal 100154109:', gc.ok ? (gc.goal_attached ? 'ATTACHED ✓' : 'NOT ATTACHED — check Convert.com dashboard') : 'ERROR: ' + gc.error);
    if (gc.ok) console.log('  Status:', gc.status, '| All goals:', JSON.stringify(gc.all_goal_ids));
  }
}
main();
