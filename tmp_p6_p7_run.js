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
  // ── P6: Klaviyo flows A+B ──────────────────────────────────────────────────
  console.log('=== P6: KLAVIYO FLOWS A+B ===');
  const r6 = await post({ action:'klaviyo_build_flows', campaign_id:'EC-2026-001', list_id:'TebDTM' });
  if (r6.ok) {
    const res = r6.result;
    console.log('Flows created:', res.flows_created);
    console.log('Emails updated in Sheet:', res.emails_updated);
    console.log('Trigger list:', res.trigger_list_id);
    (res.flow_ids||[]).forEach(f => {
      if (f.flow_id) {
        console.log('  Flow ' + f.variant + ':', f.flow_id, '(' + f.email_count + ' emails)');
      } else {
        console.log('  Flow ' + f.variant + ' ERROR:', f.error);
      }
    });
  } else {
    console.log('P6 ERROR:', r6.result && r6.result.error ? r6.result.error : JSON.stringify(r6));
    // Log GAS errors
    const logLines = (r6.log||'').split('\n').filter(l=>l.includes('error')||l.includes('ERROR')||l.includes('FAILED'));
    if (logLines.length) console.log('GAS log:', logLines.join('\n'));
  }

  // ── P6b: Get DL-ID mapping for Klaviyo templates ───────────────────────────
  console.log('\n=== P6b: DL-ID MAPPING FOR KLAVIYO TEMPLATES ===');
  const r6b = await post({ action:'klaviyo_get_dl_id_mapping', campaign_id:'EC-2026-001' });
  if (r6b.ok) {
    console.log('Emails with DL IDs:', r6b.result.count);
    (r6b.result.mapping||[]).slice(0,5).forEach(m => {
      console.log('  ' + m.email_id + ' | ' + m.sequence_code + ' E' + m.email_number + ' [' + m.icp_code + '] | dl_id:', m.dl_id);
    });
    if (r6b.result.count > 5) console.log('  ... (' + (r6b.result.count - 5) + ' more)');
  } else {
    console.log('P6b ERROR:', JSON.stringify(r6b).substring(0,200));
  }

  // ── P7: Convert.com setup ─────────────────────────────────────────────────
  console.log('\n=== P7: CONVERT.COM SETUP ===');
  const r7 = await post({ action:'run_convert_p7_setup', experiment_id:'100140422', goal_id:'100154109' });
  if (r7.ok) {
    const res = r7.result;
    console.log('Activate:', res.result.activate && res.result.activate.ok ? 'OK (status=active)' : ('FAILED: ' + (res.result.activate && res.result.activate.error)));
    console.log('Audience filter:', res.result.audience && res.result.audience.ok ? 'OK (utm_medium=email)' : ('FAILED: ' + (res.result.audience && res.result.audience.error)));
    const gc = res.result.goal_check;
    if (gc && gc.ok) {
      console.log('Goal 100154109:', gc.goal_attached ? 'ATTACHED ✓' : 'NOT ATTACHED — needs manual setup in Convert.com dashboard');
      console.log('Experiment status:', gc.status);
      if (gc.all_goal_ids && gc.all_goal_ids.length) console.log('All goals:', gc.all_goal_ids.join(', '));
    } else {
      console.log('Goal check ERROR:', gc && gc.error ? gc.error : JSON.stringify(gc));
    }
  } else {
    const res = r7.result || {};
    console.log('Activate:', res.result && res.result.activate ? JSON.stringify(res.result.activate).substring(0,150) : 'n/a');
    console.log('Audience:', res.result && res.result.audience ? JSON.stringify(res.result.audience).substring(0,150) : 'n/a');
    console.log('Goal:', res.result && res.result.goal_check ? JSON.stringify(res.result.goal_check).substring(0,150) : 'n/a');
  }

  // ── Health check ─────────────────────────────────────────────────────────
  console.log('\n=== HEALTH CHECK ===');
  const hc = await post({ action:'system_health_check', campaign_id:'EC-2026-001' });
  const hd = hc.health || hc;
  console.log('deploy:', hd.deploy || hd.deploy_version || '?');
  console.log('red_systems:', JSON.stringify(hd.red_systems||[]));
}
main();
