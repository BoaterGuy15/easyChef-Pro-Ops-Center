// ─────────────────────────────────────────────────────────────────────────────
// Operations_TestWeekSeed.gs
// One-week test seed for EC-2026-001 — Days 1–7, all platforms.
// Runs the full pipeline: SocialPosts → PostDetails → body_copy →
//   EmailSequences → FigmaExport → ContentCalendar → AssetLifecycle
// Then runs an inline audit and returns per-tab row counts + field health.
//
// doPost actions:
//   { "action": "seed_test_week" }
//   { "action": "audit_test_week" }
// ─────────────────────────────────────────────────────────────────────────────

function seedTestWeek() {
  try {
    var CAMPAIGN_ID = 'EC-2026-001';
    var now         = _ccNow();
    var results     = [];
    var ss          = _getCampaignSpreadsheet();

    // ── Week 1 arc (Days 1–7 from the full 35-day _ARC) ──────────────────────
    var W1_ARC = [
      { day:1, stage:'hook',    feature:'problem',
        hA:'You have an invisible leak. $111 a month.',
        hB:'6:30 PM. Fridge full. Five apps open. Still no dinner.' },
      { day:2, stage:'hook',    feature:'problem',
        hA:'$111/month disappearing from your grocery budget.',
        hB:'That 6:30 PM wall. Every single night.' },
      { day:3, stage:'problem', feature:'problem',
        hA:'Five apps. None of them talk to each other.',
        hB:"Mealime doesn't know your pantry. No app closes the loop." },
      { day:4, stage:'problem', feature:'problem',
        hA:"You buy groceries Sunday. By Wednesday it's a guessing game.",
        hB:"Dinner is already decided by 6:30 PM — or it isn't." },
      { day:5, stage:'agitate', feature:'problem',
        hA:'The spinach. The ground beef. The yogurt. $111 gone.',
        hB:'DoorDash again. The groceries sit untouched.' },
      { day:6, stage:'agitate', feature:'problem',
        hA:'$1,336. Every year. Food you bought. Never ate.',
        hB:'5–10 hours a week deciding what to eat. That time is yours.' },
      { day:7, stage:'agitate', feature:'problem',
        hA:"The leak is invisible. The cost isn't. $111/month.",
        hB:'The 6:30 PM wall is a system problem. Not a you problem.' }
    ];

    var DAILY_TYPES = ['facebook','instagram','pinterest','nextdoor','x','email'];
    var postData    = [];
    W1_ARC.forEach(function(d) {
      DAILY_TYPES.forEach(function(t) {
        postData.push({ day:d.day, stage:d.stage, feature:d.feature, type:t, hA:d.hA, hB:d.hB });
      });
    });
    // Spotlight posts — TikTok day 4, YouTube day 7
    postData.push({ day:4, stage:'solve',   feature:'TRACK',   type:'tiktok',
                    hA:'TK-1 · TRACK · "$1,336 in your fridge right now."', hB:'' });
    postData.push({ day:7, stage:'agitate', feature:'problem', type:'youtube',
                    hA:'YT-1 · The Problem · 60 seconds · the invisible leak', hB:'' });
    // Total: 7 × 6 + 2 spotlight = 44 posts

    // ── Helper: delete rows matching CAMPAIGN_ID from one column ──────────────
    function clearCampaignRows(sheet, cidColIdx) {
      var last = sheet.getLastRow();
      if (last < 2) return 0;
      var vals = sheet.getRange(2, cidColIdx + 1, last - 1, 1).getValues();
      var deleted = 0;
      for (var i = vals.length - 1; i >= 0; i--) {
        if (String(vals[i][0]) === CAMPAIGN_ID) { sheet.deleteRow(i + 2); deleted++; }
      }
      return deleted;
    }

    // ── 1. Clear EC-2026-001 from all tabs ────────────────────────────────────
    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var spHdrs  = _CC_HDR.SocialPosts;
    clearCampaignRows(spSheet, spHdrs.indexOf('campaign_id'));

    var emSheet = _getCCSheet(_CC_TAB.EMAIL);
    clearCampaignRows(emSheet, 1); // col 1 = campaign_id in EmailSequences

    var dlSheet = _getCCSheet(_CC_TAB.DL);
    var dlData0 = dlSheet.getDataRange().getValues();
    var dlHdrs0 = dlData0[0].map(function(h){ return String(h).trim(); });
    clearCampaignRows(dlSheet, dlHdrs0.indexOf('campaign_id'));

    // ContentCalendar — seedEC2026001ContentCalendar clears it; pre-clear for safety
    var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    ccSheet.clearContents();
    var ccH0 = _CC_HDR[_CC_TAB.CONTENT_CAL];
    ccSheet.getRange(1, 1, 1, ccH0.length).setValues([ccH0]).setFontWeight('bold');
    ccSheet.setFrozenRows(1);

    // AssetLifecycle — full clear
    var alSheet = _getCCSheet(_CC_TAB.ASSET_LIFECYCLE);
    alSheet.clearContents();
    var alH0 = _CC_HDR[_CC_TAB.ASSET_LIFECYCLE];
    alSheet.getRange(1, 1, 1, alH0.length).setValues([alH0]).setFontWeight('bold');
    alSheet.setFrozenRows(1);

    // FigmaExport — full clear
    var fxSheet = ss.getSheetByName('FigmaExport');
    if (!fxSheet) fxSheet = ss.insertSheet('FigmaExport');
    fxSheet.clearContents();

    results.push('✓ Cleared EC-2026-001 from all tabs');

    // ── 2. Seed SocialPosts — raw rows (dl_id / body_copy filled in steps 3–4) ─
    var newSpRows = postData.map(function(r, idx) {
      var id       = 'ec001-w1-sp-' + ('00' + (idx + 1)).slice(-3);
      var briefObj = JSON.parse(_ec001_briefJson(r.stage, r.feature, r.day, r.hA, r.hB));
      briefObj.icp_target = 'super_mom_money|super_mom_time'; // explicit for FigmaExport
      return [
        id,
        CAMPAIGN_ID,
        _ec001_platMap(r.type),
        r.hA,                                                   // hook
        '',                                                     // body_copy — step 4
        _ec001_cta(r.stage),
        _ec001_htags(r.feature, r.type),
        _ec001_imgBrief(r.stage, r.feature, r.day),
        '',                                                     // image_url
        _ec001_date(r.day),
        '08:00',
        'draft',
        '',                                                     // dl_id  — step 3
        '',                                                     // utm_url — step 3
        '',                                                     // posted_url
        JSON.stringify(briefObj)
      ];
    });

    var spWriteStart = spSheet.getLastRow() + 1;
    spSheet.getRange(spWriteStart, 1, newSpRows.length, spHdrs.length).setValues(newSpRows);
    results.push('✓ SocialPosts raw: ' + newSpRows.length + ' posts (Days 1–7 · all platforms)');

    // ── 3. Fill dl_id, utm_url, image_brief, hashtags + DL registry ──────────
    var updResult = updateEC2026001PostDetails();
    if (!updResult.ok) return { ok:false, error:'PostDetails: ' + updResult.error, results:results };
    results.push('✓ dl_id + utm_url: ' + updResult.post_count + ' posts · ' + updResult.dl_count + ' DL entries');

    // ── 4. Fill body_copy ─────────────────────────────────────────────────────
    var bodyResult = fillEC2026001SocialBody();
    if (!bodyResult.ok) return { ok:false, error:'SocialBody: ' + bodyResult.error, results:results };
    results.push('✓ body_copy: ' + bodyResult.updated + ' posts filled');

    // ── 5. Seed Week 1 emails (SEQ-1 E1 day 3 · SEQ-1 E2 day 6, A + B) ─────────
    function _uA(dl, sl) {
      return 'https://easychefpro.com/lp/waitlist-a?utm_source=email&utm_medium=email' +
             '&utm_campaign=ec-2026-001&utm_content=' + encodeURIComponent(dl + '|' + sl);
    }
    function _uB(dl, sl) {
      return 'https://easychefpro.com/lp/waitlist-b?utm_source=email&utm_medium=email' +
             '&utm_campaign=ec-2026-001&utm_content=' + encodeURIComponent(dl + '|' + sl);
    }

    var W1_EMAILS = [
      { seq:1, n:1, day:3, stage:'problem',
        dlA:'DL-EM-0020', slA:'seq1-e1-a', dlB:'DL-EM-0032', slB:'seq1-e1-b',
        a:{ sub:"You're throwing away $111 every month",
            pre:"Not your fault. Just no system.",
            hk:"You have an invisible leak in your grocery budget. $111 a month. Every month. Not because of bad decisions — because the system was never designed to close the loop.",
            pr:"You buy groceries on Sunday. By Wednesday it’s a guessing game. The spinach goes limp. The ground beef gets pushed to the back. The yogurt expires. You order delivery. Again.",
            ag:"Families save an average of $111 a month when the leak is closed. That’s $1,336/year average savings. Not from couponing. Not from buying less. From having a system.",
            so:"easyChef Pro closes the loop. Five apps replaced. One leak closed.",
            va:"TRACK what’s in your fridge before it expires. PLAN the week from what you already own. COOK 30-minute dinners from what’s there. SHOP only what’s missing. OPTIMIZE every meal with registered dietitians.",
            pf:"Validated across 10,000 household profiles. 69.5% less food waste. Built by first responders.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"Six apps open. Groceries on the counter. Nothing for dinner.",
            pre:"The 6:30 PM wall is not a you problem.",
            hk:"It’s 6:30 PM. The fridge is full. Five apps are open. And you still don’t know what to make for dinner.",
            pr:"You have Mealime. A pantry app. A nutrition tracker. A recipe app. A shopping list. None of them talk to each other. None of them know what’s actually in your fridge right now.",
            ag:"You spend 5 to 10 hours a week deciding what to eat. Every night you wing it is an evening that wasn’t yours. Every delivery order is $30 that should have stayed in your wallet.",
            so:"easyChef Pro closes the loop. One app. Five replaced. Dinner figured out before you open the fridge.",
            va:"The meal plan builds from what you already own. The recipe is waiting. The shopping list writes itself. The nutrition score fires automatically.",
            pf:"Validated across 10,000 household profiles. Built by first responders who needed this as much as you do.",
            ct:"Join the founding family — early access July 1" }},
      { seq:1, n:2, day:6, stage:'agitate',
        dlA:'DL-EM-0021', slA:'seq1-e2-a', dlB:'DL-EM-0033', slB:'seq1-e2-b',
        a:{ sub:"$1,336 thrown away every year — not your fault",
            pre:"Do the math. It’s jarring.",
            hk:"$1,336. That’s how much the average family throws away in groceries every year.",
            pr:"It’s not the big grocery trips. It’s the spinach that wilted by Wednesday. The ground beef pushed to the back. The yogurt that expired before anyone touched it.",
            ag:"That’s $111 every month. $3.66 every single day. From your fridge to your garbage bin. Without a system, it never stops.",
            so:"easyChef Pro tracks what you have before it expires. TRACK → PLAN → COOK → SHOP — the full loop, closed.",
            va:"Your pantry knows what’s in it. The meal plan builds from what you own. The recipe uses what’s there. The shopping list only buys what’s missing.",
            pf:"69.5% less food waste. Validated across 10,000 household profiles.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"What if dinner was decided before you opened the fridge?",
            pre:"That question changes everything.",
            hk:"What if the hardest part of tonight’s dinner was already done before you got home?",
            pr:"Every night, the 6:30 PM decision costs you 20 minutes minimum. Stare at the fridge. Check an app. Nothing matches what you have. Open delivery. Spend $35 you didn’t plan for.",
            ag:"That’s 5 to 10 hours a week you don’t get back. Multiplied by 52 weeks. That time belongs to you — and to your family.",
            so:"easyChef Pro decides dinner before you open the fridge. The plan is already built from what you own.",
            va:"Open the app. Your week is planned. Tonight’s recipe is from your fridge. The shopping list for what’s missing is ready. Nutrition scored automatically.",
            pf:"Validated across 10,000 household profiles. Built by first responders.",
            ct:"Join the founding family — early access July 1" }}
    ];

    var emRows   = [];
    var emDlRows = [];
    W1_EMAILS.forEach(function(e) {
      var seqCode = 'SEQ-' + e.seq;
      var templ   = 'EC2026001-' + seqCode + '-E' + e.n;
      var urlA    = _uA(e.dlA, e.slA);
      var urlB    = _uB(e.dlB, e.slB);
      emRows.push([
        'ec001-w1-em-s' + e.seq + 'e' + e.n + 'a', CAMPAIGN_ID, seqCode, e.n,
        e.a.sub, e.a.pre, e.a.hk, e.a.pr, e.a.ag, e.a.so, e.a.va, e.a.pf,
        e.a.ct + '\n' + urlA,
        e.day, 'klaviyo_' + seqCode.toLowerCase() + '_segment_a',
        'draft', false, '', false, '',
        e.stage, 'money', 'invisible-leak', 'waitlist-a', templ + '-A',
        JSON.stringify({ dl_id:e.dlA, utm_url:urlA, lp:'waitlist-a', segment:'money', day:e.day })
      ]);
      emRows.push([
        'ec001-w1-em-s' + e.seq + 'e' + e.n + 'b', CAMPAIGN_ID, seqCode, e.n,
        e.b.sub, e.b.pre, e.b.hk, e.b.pr, e.b.ag, e.b.so, e.b.va, e.b.pf,
        e.b.ct + '\n' + urlB,
        e.day, 'klaviyo_' + seqCode.toLowerCase() + '_segment_b',
        'draft', false, '', false, '',
        e.stage, 'time', 'invisible-leak', 'waitlist-b', templ + '-B',
        JSON.stringify({ dl_id:e.dlB, utm_url:urlB, lp:'waitlist-b', segment:'time_founding', day:e.day })
      ]);
      emDlRows.push([
        e.dlA, e.dlA + '_' + templ + '-A', CAMPAIGN_ID, 'Email',
        'https://easychefpro.com/lp/waitlist-a',
        'klaviyo', 'email', 'ec-2026-001', 'active', now, '', 'system',
        'Email ' + seqCode + ' E' + e.n + ' A — money/savings'
      ]);
      emDlRows.push([
        e.dlB, e.dlB + '_' + templ + '-B', CAMPAIGN_ID, 'Email',
        'https://easychefpro.com/lp/waitlist-b',
        'klaviyo', 'email', 'ec-2026-001', 'active', now, '', 'system',
        'Email ' + seqCode + ' E' + e.n + ' B — time/founding'
      ]);
    });
    emSheet.getRange(emSheet.getLastRow() + 1, 1, emRows.length,   26).setValues(emRows);
    dlSheet.getRange(dlSheet.getLastRow() + 1, 1, emDlRows.length, 13).setValues(emDlRows);
    results.push('✓ Emails: ' + emRows.length + ' rows · ' + emDlRows.length + ' DL entries');

    // ── 6. Write FigmaExport tab (matches exportEC2026001FigmaJSON schema) ────
    var FE_HDR = [
      'post_id','platform','day','week','funnel_stage','icp_target',
      'phone_in_frame','dl_id','utm_url','cta',
      'hook_a','hook_b','scene_direction','what_not_to_show','caption_opening',
      'scene_sq_1','scene_sq_2','scene_sq_3','scene_sq_4','scene_sq_5','scene_sq_6',
      'audio_direction',
      'story_arc_1','story_arc_2','story_arc_3','story_arc_4',
      'opening_hook','subject_line','preview_text','header_image_direction'
    ];
    var spData2 = spSheet.getDataRange().getValues();
    var sp2H    = {};
    spData2[0].map(function(h){ return String(h).trim(); }).forEach(function(h, i){ sp2H[h] = i; });
    var fxRows  = [FE_HDR];
    for (var fi = 1; fi < spData2.length; fi++) {
      var fr = spData2[fi];
      if (String(fr[sp2H['campaign_id']]) !== CAMPAIGN_ID) continue;
      var fb   = {};
      try { fb = JSON.parse(String(fr[sp2H['design_brief']] || '{}')); } catch(e2) {}
      var d2   = Number(fb.day) || 0;
      var w2   = d2 ? Math.ceil(d2 / 7) : '';
      var seq2 = fb.scene_sequence || {};
      var arc2 = fb.story_arc      || {};
      var wn2  = Array.isArray(fb.what_not_to_show)
                 ? fb.what_not_to_show.join(' | ')
                 : String(fb.what_not_to_show || '');
      fxRows.push([
        String(fr[sp2H['id']]      || ''),
        String(fr[sp2H['platform']]|| ''),
        d2, w2,
        String(fb.funnel_stage     || ''),
        String(fb.icp_target       || ''),
        fb.phone_visibility ? 'YES' : 'NO',
        String(fr[sp2H['dl_id']]   || ''),
        String(fr[sp2H['utm_url']] || ''),
        String(fb.cta              || String(fr[sp2H['cta']] || '')),
        String(fb.hook_a           || ''),
        String(fb.hook_b           || ''),
        String(fb.scene_direction  || ''),
        wn2,
        String(fb.caption_opening  || ''),
        String(seq2.sq_1 || ''), String(seq2.sq_2 || ''), String(seq2.sq_3 || ''),
        String(seq2.sq_4 || ''), String(seq2.sq_5 || ''), String(seq2.sq_6 || ''),
        String(fb.audio_direction  || ''),
        String(arc2.arc_1 || ''), String(arc2.arc_2 || ''),
        String(arc2.arc_3 || ''), String(arc2.arc_4 || ''),
        String(fb.opening_hook                 || ''),
        String(fb.subject_line                 || ''),
        String(fb.preview_text                 || ''),
        String(fb.header_image_direction       || '')
      ]);
    }
    fxSheet.getRange(1, 1, fxRows.length, FE_HDR.length).setValues(fxRows);
    fxSheet.getRange(1, 1, 1, FE_HDR.length).setFontWeight('bold');
    fxSheet.setFrozenRows(1);
    results.push('✓ FigmaExport: ' + (fxRows.length - 1) + ' rows');

    // ── 7. ContentCalendar ────────────────────────────────────────────────────
    var ccResult = seedEC2026001ContentCalendar(CAMPAIGN_ID);
    if (!ccResult.ok) return { ok:false, error:'ContentCalendar: ' + ccResult.error, results:results };
    results.push('✓ ContentCalendar: ' + ccResult.seeded + ' rows');

    // ── 8. AssetLifecycle ─────────────────────────────────────────────────────
    var alResult = seedEC2026001AssetLifecycle();
    if (!alResult.ok) return { ok:false, error:'AssetLifecycle: ' + alResult.error, results:results };
    results.push('✓ AssetLifecycle: ' + alResult.seeded + ' rows');

    // ── 9. Inline audit ───────────────────────────────────────────────────────
    var audit = auditTestWeek(CAMPAIGN_ID);

    Logger.log('[seedTestWeek] DONE — ' + results.join(' | '));
    return { ok:true, results:results, audit:audit, post_count:newSpRows.length };

  } catch(e) {
    Logger.log('[seedTestWeek] ERROR: ' + e.message + '\n' + e.stack);
    return { ok:false, error:e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// auditTestWeek — read-only field-health check on all 6 tabs for one campaign.
// Returns per-tab row counts, empty required fields, DL cross-check, date check.
// ─────────────────────────────────────────────────────────────────────────────

function auditTestWeek(campaignId) {
  try {
    campaignId = campaignId || 'EC-2026-001';
    var ss     = _getCampaignSpreadsheet();

    function readTab(name) {
      var sh = ss.getSheetByName(name);
      if (!sh || sh.getLastRow() < 2) return { headers:[], rows:[] };
      var all = sh.getDataRange().getValues();
      return { headers: all[0].map(function(h){ return String(h).trim(); }), rows: all.slice(1) };
    }
    function hi(hdrs, name) { return hdrs.indexOf(name); }
    function pop(v)          { return String(v == null ? '' : v).trim() !== ''; }

    var a = {};

    // ── SocialPosts ───────────────────────────────────────────────────────────
    var sp     = readTab('SocialPosts');
    var sp001  = sp.rows.filter(function(r){ return String(r[hi(sp.headers,'campaign_id')]) === campaignId; });
    var spReq  = ['body_copy','dl_id','utm_url','cta','image_brief','design_brief'];
    var spMiss = {};
    spReq.forEach(function(f){ spMiss[f] = 0; });
    sp001.forEach(function(r){
      spReq.forEach(function(f){
        if (!pop(r[hi(sp.headers, f)])) spMiss[f]++;
      });
    });
    var spByPlatform = {};
    sp001.forEach(function(r){
      var p = String(r[hi(sp.headers,'platform')] || 'unknown');
      spByPlatform[p] = (spByPlatform[p] || 0) + 1;
    });
    a.SocialPosts = {
      total:            sp001.length,
      by_platform:      spByPlatform,
      empty_required:   spMiss,
      all_clean:        spReq.every(function(f){ return spMiss[f] === 0; })
    };

    // ── ContentCalendar ───────────────────────────────────────────────────────
    var cc     = readTab('ContentCalendar');
    var cc001  = cc.rows.filter(function(r){ return String(r[hi(cc.headers,'campaign_id')]) === campaignId; });
    var ccDateEmpty = 0, ccDateBad = 0;
    function normDate(raw) {
      if (!raw && raw !== 0) return '';
      if (raw instanceof Date) return Utilities.formatDate(raw, 'America/Los_Angeles', 'yyyy-MM-dd');
      return String(raw).trim();
    }
    cc001.forEach(function(r){
      var d = normDate(r[hi(cc.headers,'publish_date')]);
      if (!d)                                   ccDateEmpty++;
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) ccDateBad++;
    });
    var ccDates = cc001.map(function(r){ return normDate(r[hi(cc.headers,'publish_date')]); })
                       .filter(function(d){ return /^\d{4}-\d{2}-\d{2}$/.test(d); }).sort();
    a.ContentCalendar = {
      total:              cc001.length,
      publish_date_empty: ccDateEmpty,
      publish_date_bad:   ccDateBad,
      date_range:         ccDates.length ? { first: ccDates[0], last: ccDates[ccDates.length - 1] } : null,
      all_clean:          ccDateEmpty === 0 && ccDateBad === 0
    };

    // ── AssetLifecycle ────────────────────────────────────────────────────────
    var al    = readTab('AssetLifecycle');
    var al001 = al.rows.filter(function(r){ return String(r[1]) === campaignId; });
    var alStatuses = {};
    al001.forEach(function(r){
      var s = String(r[hi(al.headers,'status')] || 'unknown');
      alStatuses[s] = (alStatuses[s] || 0) + 1;
    });
    a.AssetLifecycle = { total: al001.length, by_status: alStatuses };

    // ── DeepLinkRegistry — format check + cross-check against SocialPosts ────
    var dl    = readTab('DeepLinkRegistry');
    var dl001 = dl.rows.filter(function(r){ return String(r[hi(dl.headers,'campaign_id')]) === campaignId; });
    var dlFmtErrors = 0;
    var dlIdSet     = {};
    var dlDupCount  = 0;
    dl001.forEach(function(r){
      var id = String(r[hi(dl.headers,'dl_id')] || '');
      if (!/^DL-(FB|EM|TK|YT)-\d{4}$/.test(id)) dlFmtErrors++;
      if (dlIdSet[id])                             dlDupCount++;
      dlIdSet[id] = true;
    });
    var spDlMissing = 0;
    sp001.forEach(function(r){
      var dlId = String(r[hi(sp.headers,'dl_id')] || '');
      if (dlId && !dlIdSet[dlId]) spDlMissing++;
    });
    a.DeepLinkRegistry = {
      total:                     dl001.length,
      format_errors:             dlFmtErrors,
      duplicates:                dlDupCount,
      posts_dl_id_not_in_registry: spDlMissing,
      all_clean:                 dlFmtErrors === 0 && dlDupCount === 0 && spDlMissing === 0
    };

    // ── FigmaExport ───────────────────────────────────────────────────────────
    var fe     = readTab('FigmaExport');
    var fe001  = fe.rows.filter(function(r){ return String(r[0] || '').indexOf('ec001') === 0; });
    var feReq  = ['dl_id','utm_url','cta','icp_target'];
    var feMiss = {};
    feReq.forEach(function(f){ feMiss[f] = 0; });
    fe001.forEach(function(r){
      feReq.forEach(function(f){
        if (!pop(r[hi(fe.headers, f)])) feMiss[f]++;
      });
    });
    a.FigmaExport = {
      total:          fe001.length,
      empty_required: feMiss,
      all_clean:      feReq.every(function(f){ return feMiss[f] === 0; })
    };

    // ── EmailSequences ────────────────────────────────────────────────────────
    var em    = readTab('EmailSequences');
    var em001 = em.rows.filter(function(r){ return String(r[1]) === campaignId; });
    a.EmailSequences = { total: em001.length };

    var allClean = a.SocialPosts.all_clean &&
                   a.ContentCalendar.all_clean &&
                   a.DeepLinkRegistry.all_clean &&
                   a.FigmaExport.all_clean;

    Logger.log('[auditTestWeek] all_clean:' + allClean + ' ' + JSON.stringify(a));
    return { ok:true, all_clean:allClean, by_tab:a };

  } catch(e) {
    Logger.log('[auditTestWeek] ERROR: ' + e.message);
    return { ok:false, error:e.message };
  }
}
