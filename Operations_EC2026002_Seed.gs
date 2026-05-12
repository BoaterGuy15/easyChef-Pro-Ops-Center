// Operations_EC2026002_Seed.gs
// Full seed for EC-2026-002 — Invisible Leak · Budget Family + Super Mom
// ICP-A: budget_family (money/savings · stressed→hopeful) → /lp/budget-family
// ICP-B: super_mom    (busy mom · exhausted→thriving)    → /lp/super-mom
// 35 days: May 27–July 1 2026 · publish 12:00 Pacific
// Social: FB(7) IG(7) PI(7) ND(7) X(7) TK(5) YT(3) = 43 posts (ec002-sp-001..043)
// Email:  SEQ-1(6)+SEQ-2(8)+SEQ-3(6)+SEQ-4(2)+SEQ-5(2) = 24×A+B = 48 rows
// Run via doPost: { "action": "seed_ec2026002" }

var _LP2_A = 'https://easychefpro.com/lp/budget-family';
var _LP2_B = 'https://easychefpro.com/lp/super-mom';

// ── Helpers ───────────────────────────────────────────────────────────────────

function _ec002_platMap(t) {
  var m = {
    facebook:'Facebook', instagram:'Instagram', pinterest:'Pinterest',
    nextdoor:'Nextdoor', x:'X', tiktok:'TikTok', youtube:'YouTube'
  };
  return m[t] || 'Facebook';
}

function _ec002_lpUrl(lp) { return lp === 'a' ? _LP2_A : _LP2_B; }

function _ec002_cta(stage, lp) {
  var u = lp === 'a' ? 'easychefpro.com/lp/budget-family' : 'easychefpro.com/lp/super-mom';
  var m = {
    hook:    'Join the waitlist — early access July 1 · ' + u,
    problem: 'Join the waitlist — early access July 1 · ' + u,
    agitate: 'Join the waitlist — early access July 1 · ' + u,
    solve:   'Get early access · $7.99/month founding price · ' + u,
    value:   'Get early access free · ' + u,
    proof:   'Join the waitlist free — 5,000 founding spots · ' + u,
    urgency: 'Lock in $7.99/month — 60% off forever · ' + u,
    cta:     'Join the founding family · First 5,000 only · ' + u,
    launch:  'Get your access now · ' + u
  };
  return m[stage] || m['hook'];
}

function _ec002_htags(feature, type) {
  if (type === 'email' || type === 'pinterest' || type === 'nextdoor') return '';
  if (type === 'youtube') return '#mealplanningapp #foodwaste #kitchenapp #easychefpro #budgetmeals';
  if (type === 'x') return '#easychefpro #mealplanning #grocerybudget';
  var base = '#easychefpro';
  var ft = {
    problem:  '#grocerybudget #foodwaste #savemoney #budgetfamily #mealplanningfails #kitchenlife',
    TRACK:    '#pantryorganization #foodtracking #grocerybudget #reducefoodwaste #pantryapp',
    PLAN:     '#mealplanning #weeknightdinners #mealprep #familymeals #dinnerplanning',
    OPTIMIZE: '#nutritiongoals #healthyeating #familynutrition #eatbetter #balancedmeals',
    COOK:     '#easydinner #30minutemeals #weeknightcooking #familydinner #quickrecipes',
    SHOP:     '#grocerylist #smartshopping #grocerybudget #savemoney #familybudget',
    proof:    '#foodtech #kitchenapp #familyfood #innovation #mealplanningapp',
    urgency:  '#earlyaccess #foundingfamily #limitedspots #presale',
    launch:   '#july1 #foundingfamily #kitchenincommand',
    all:      '#mealplanningapp #kitchenapp #foodtech #familyfood'
  };
  var tags = ft[feature] || ft['proof'];
  if (type === 'tiktok')    tags = tags + ' #momsoftiktok #cooktok #budgettok #kitchenhack #fyp';
  if (type === 'instagram') tags = tags + ' #instafood #momstagram #budgetmom #foodblogger #savemoneytips';
  return base + ' ' + tags;
}

function _ec002_imgBrief(stage, feature, day) {
  var noPhone     = (stage === 'hook' || stage === 'problem' || stage === 'agitate');
  var firstReveal = (!noPhone && stage === 'solve' && day <= 9);
  var phoneNote   = noPhone
    ? 'NO PHONE in frame — problem must feel real before solution appears'
    : firstReveal
    ? 'PHONE APPEARS for first time — TRACK pantry screen · first reveal · warm UI lighting'
    : 'PHONE VISIBLE — outcomes not features';
  var sceneMap = {
    hook:    'Warm kitchen · 6:30 PM clock visible · groceries on counter · budget notepad visible · quiet frustration not defeat',
    problem: 'Phone on counter showing five app icons · groceries beside it — nothing connected · fragmentation is the story',
    agitate: '$111 visual · wilted spinach · ground beef · yogurt · $1,336 annual figure prominent · honest weight without shame',
    solve:   'TRACK pantry view · organized data · receipt scan animation · expiry alerts firing · first relief moment',
    value:   _ec001_featureScene(feature),
    proof:   '10,000 households · 69.5% less waste · $1,336 savings · confident data · built by first responders note',
    urgency: '5,000 spots counter · $7.99 vs $19.99 price contrast · real scarcity · clock visible',
    cta:     'Woman on couch after dinner · kitchen clean behind her · kids settled · peace · phone in hand · founding family energy',
    launch:  'July 1 · kitchen in command · woman confident · phone visible · TRACK→PLAN→OPTIMIZE→COOK→SHOP loop complete'
  };
  return (sceneMap[stage] || sceneMap['value']) + ' · ' + phoneNote;
}

function _ec002_briefJson(stage, feature, day, hA, hB, lp) {
  var noPhone     = (stage === 'hook' || stage === 'problem' || stage === 'agitate');
  var firstReveal = (!noPhone && stage === 'solve' && day <= 9);
  var phoneRule   = noPhone
    ? 'NO PHONE — problem must feel real before solution appears.'
    : firstReveal
    ? 'PHONE APPEARS for first time — TRACK feature · first reveal · warm UI lighting.'
    : 'PHONE VISIBLE — outcomes, not features.';
  return JSON.stringify({
    funnel_stage:      stage,
    feature:           feature,
    day:               day,
    phone_visibility:  !noPhone,
    visual_progression: phoneRule,
    who_its_for:       lp === 'a'
      ? 'Budget Family — ICP-A: budget_family · pain: $111/month invisible grocery leak · savings angle'
      : 'Super Mom — ICP-B: super_mom · pain: 6:30 PM decision fatigue · exhausted→thriving · time relief angle',
    icp_code:          lp === 'a' ? 'budget_family' : 'super_mom',
    icp_target:        lp === 'a' ? 'budget_family' : 'super_mom',
    lp_variant:        lp,
    emotional_state:   stage + (noPhone ? ' — problem awareness · recognition not defeat' : firstReveal ? ' — first reveal · relief entering' : ' — building toward founding family commitment'),
    funnel_position:   stage + ' · day ' + day + ' of 35 · May 27–Jul 1 2026',
    what_not_to_show:  ['App UI before day 8','Smiling before problem acknowledged','Bright commercial lighting','Shame language','Invented testimonials'],
    scene_direction:   _ec002_imgBrief(stage, feature, day),
    hook_a:            hA,
    hook_b:            hB,
    theme:             'invisible-leak',
    campaign_id:       'EC-2026-002'
  });
}

function _ec002_date(day) {
  var d = new Date(Date.UTC(2026, 4, 27) + (day - 1) * 86400000);
  return Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd');
}

function _ec002_slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

function _ec002_utmUrl(lpUrl, source, medium, dlId, slug) {
  return lpUrl + '?utm_source=' + source +
    '&utm_medium=' + medium +
    '&utm_campaign=ec-2026-002' +
    '&utm_content=' + encodeURIComponent(dlId + '|' + slug);
}

// ── Main seed function ────────────────────────────────────────────────────────

function seedEC2026002() {
  try {
    var results = [];
    var now = _ccNow();

    // ── 1. Campaign Brief ────────────────────────────────────────────────────
    setCampaignBrief({
      id:               'EC-2026-002',
      name:             'ICP-Governed Pre-Launch Arc 2026 — Invisible Leak: Budget Family + Super Mom',
      icp_code:         'budget_family',
      blueprint:        'A-Waitlist',
      launch_date:      '2026-07-01',
      start_date:       '2026-05-27',
      status:           'active',
      post_count:       43,
      post_frequency:   'weekly',
      email_sequences:  5,
      theme:            'invisible-leak',
      publish_day:      'selected',
      channels:         ['Facebook','Instagram','Pinterest','Nextdoor','X','TikTok','YouTube','Email'],
      ab_test:          true,
      ab_tool:          'convert.com',
      ab_split:         '50/50',
      lp_slug_a:        'lp/budget-family',
      lp_slug_b:        'lp/super-mom',
      ab_experiment_id: 'EC2026002-EXP-001',
      campaign_angle:   'savings',
      urgency_trigger:  'First 5,000 families lock in $7.99/month forever',
      notes:            'EC-2026-002 · ICP-A: budget_family (stressed→hopeful) · ICP-B: super_mom (exhausted→thriving) · 43 social posts · 24 emails × A+B = 48 rows · May 27–Jul 1 2026 · publish 12:00 Pacific'
    });
    results.push('✓ CampaignBrief EC-2026-002 set');

    // ── 2. LP Inventory ──────────────────────────────────────────────────────
    setLPInventoryEntry({
      id: 'lp-budget-family', slug: 'lp/budget-family', full_url: _LP2_A,
      campaign_type: 'Waitlist', blueprint_code: 'A-Waitlist', icp_codes: 'budget_family',
      campaign_angle: 'savings', lp_variant: 'A',
      headline: 'Stop the invisible grocery leak.',
      cta_primary: 'Join the waitlist — early access July 1',
      proof_bar: '$1,336/year average savings · 30 minutes fridge to table · 69.5% less food waste',
      status: 'PENDING_DEV', dev_built: false, convert_installed: false,
      clarity_installed: false, ga4_installed: false, campaigns_using: 'EC-2026-002',
      total_signups: 0,
      notes: 'ICP: budget_family · theme: invisible-leak · thank-you: /thank-you?src=budget_family · BLOCKER — build by May 27',
      urgency_type: 'founding-price',
      urgency_line: 'First 5,000 families lock in $7.99/month forever. The rest pay $19.99.',
      urgency_placement: 'below-hero', exclusivity_angle: 'founding-family',
      exclusivity_line: 'You are founding the kitchen of the future.',
      meta_title: 'Stop the Invisible Grocery Leak · easyChef Pro',
      meta_description: 'Stop wasting $111/month on groceries that expire. easyChef Pro closes the loop. Free to join.',
      og_title: 'Stop the Invisible Grocery Leak · easyChef Pro',
      og_description: '$1,336/year back. 30 minutes fridge to table. 69.5% less food waste.',
      canonical_url: 'https://easychefpro.com/lp/budget-family',
      focus_keyword: 'meal planning app save money groceries budget family'
    });
    setLPInventoryEntry({
      id: 'lp-super-mom', slug: 'lp/super-mom', full_url: _LP2_B,
      campaign_type: 'Waitlist', blueprint_code: 'A-Waitlist', icp_codes: 'super_mom',
      campaign_angle: 'time_relief', lp_variant: 'B',
      headline: 'Dinner decided before you open the fridge.',
      cta_primary: 'Get Early Access',
      proof_bar: '$1,336/year average savings · 30 minutes fridge to table · 69.5% less food waste',
      status: 'PENDING_DEV', dev_built: false, convert_installed: false,
      clarity_installed: false, ga4_installed: false, campaigns_using: 'EC-2026-002',
      total_signups: 0,
      notes: 'ICP: super_mom · theme: invisible-leak · thank-you: /thank-you?src=super_mom · BLOCKER — build by May 27',
      urgency_type: 'founding-price',
      urgency_line: 'First 5,000 founding families. The founding price closes when spots fill.',
      urgency_placement: 'below-hero', exclusivity_angle: 'founding-family',
      exclusivity_line: 'You found this before everyone else. That means something.',
      meta_title: 'Dinner Decided Before You Open the Fridge · easyChef Pro',
      meta_description: 'Dinner figured out. Groceries planned. Kitchen in command. Get early access.',
      og_title: 'Dinner Decided Before You Open the Fridge · easyChef Pro',
      og_description: 'Dinner decided. Groceries planned. Kitchen in command. Join the founding family.',
      canonical_url: 'https://easychefpro.com/lp/super-mom',
      focus_keyword: 'meal planning app busy mom dinner ideas family'
    });
    results.push('✓ LP Inventory: lp-budget-family + lp-super-mom');

    // ── 3. ICP Profiles ──────────────────────────────────────────────────────
    setIcpProfile({
      id: 'budget_family', name: 'Budget Family — Savings Angle', code: 'budget_family',
      status: 'Active',
      demographics: 'Female/Male · 28–45 · family · HHI $35–75K · suburban · primary grocery buyer · budget-conscious',
      psychographics: 'Financially aware. Responds to dollar figures first. Loss aversion is financial. Calculates ROI before feeling the feeling.',
      primary_pain: 'The invisible grocery leak — $111/month in groceries that expire before they become dinner',
      secondary_pain: '6:30 PM decision fatigue — real but secondary to the money pain',
      value_trigger: '$1,336 back without couponing. $7.99/month to save $111/month.',
      loss_aversion: 'Every dollar in the bin is a dollar the family does not have. Every day costs $3.66.',
      channel_affinity: 'Facebook · Pinterest · Nextdoor · Email — money/savings subject lines',
      message_hierarchy: '1.$1,336/year · 2.$111/month · 3.30 min from what you have · 4.one app closes the loop',
      conversion_triggers: '$1,336 figure · $7.99 to save $111 ROI · 10,000 households validated · 7-day free trial',
      utm_campaign_codes: 'budget_family · seq1_welcome · seq2_value · seq3_urgency',
      lp_variants: '/lp/budget-family · hero_variant: savings_angle',
      validated: true, validation_notes: 'EC-2026-002 ICP-A · LP-A · EXP-002 Variant A',
      created_at: now, updated_at: now
    });
    setIcpProfile({
      id: 'super_mom', name: 'Super Mom — Time Relief + Founding Family', code: 'super_mom',
      status: 'Active',
      demographics: 'Female · 28–44 · partnered · 2–3 kids · HHI $50–95K · suburban · household logistics manager',
      psychographics: 'Carries full mental load of food decisions. Wants dinner decided before she opens the fridge. Founding family identity resonates.',
      primary_pain: 'The 6:30 PM wall — exhausted · 5–10 hours/week on food decisions · none of it connected',
      secondary_pain: 'Food waste — real but not primary. She notices $1,336 but time relief makes her sign up.',
      value_trigger: 'Dinner decided before she opens the fridge. Mental load gone. Founding family — she found it first.',
      loss_aversion: 'Every night she wings it is an evening she did not choose for her family.',
      channel_affinity: 'Instagram · TikTok · YouTube · Email — time/relief + founding family subject lines',
      message_hierarchy: '1.dinner decided before you open the fridge · 2.founding family identity · 3.$1,336 savings · 4.$7.99 founding price',
      conversion_triggers: 'Relief framing · founding family identity · first 5,000 scarcity · 7-day free trial',
      utm_campaign_codes: 'super_mom · seq1_welcome · seq2_value · seq3_urgency',
      lp_variants: '/lp/super-mom · hero_variant: time_relief_founding',
      validated: true, validation_notes: 'EC-2026-002 ICP-B · LP-B · EXP-002 Variant B',
      created_at: now, updated_at: now
    });
    results.push('✓ ICP Profiles: budget_family + super_mom');

    // ── 4. Force-clear EC-2026-002 rows from all campaign sheets ────────────
    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var emSheet = _getCCSheet(_CC_TAB.EMAIL);
    var dlSheet = _getCCSheet(_CC_TAB.DL);
    var alSheet = _getCCSheet(_CC_TAB.ASSET_LIFECYCLE);
    var vpSheet = _getCCSheet(_CC_TAB.VIDEO_PRODUCTION);

    var _clearByCampaignId = function(sheet, campColIdx) {
      var last = sheet.getLastRow();
      if (last < 2) return;
      var cids = sheet.getRange(2, campColIdx, last - 1, 1).getValues();
      for (var ci = cids.length - 1; ci >= 0; ci--) {
        if (String(cids[ci][0]).toUpperCase() === 'EC-2026-002') sheet.deleteRow(ci + 2);
      }
    };
    _clearByCampaignId(spSheet, 2); // campaign_id = col 2
    _clearByCampaignId(emSheet, 2);
    _clearByCampaignId(alSheet, 2);
    _clearByCampaignId(vpSheet, 2);

    // DL: campaign_id = col 3
    (function() {
      var last = dlSheet.getLastRow();
      if (last < 2) return;
      var dlHdrLen = _CC_HDR.DeepLinkRegistry.length;
      var rows  = dlSheet.getRange(2, 1, last - 1, dlHdrLen).getValues();
      var kept  = rows.filter(function(r) { return String(r[2]).toUpperCase() !== 'EC-2026-002'; });
      dlSheet.getRange(2, 1, last - 1, dlHdrLen).clearContent();
      if (kept.length) dlSheet.getRange(2, 1, kept.length, dlHdrLen).setValues(kept);
    })();
    results.push('✓ Cleared stale EC-2026-002 rows');

    // ── 5. Social Posts (43 posts) ───────────────────────────────────────────
    // Main platform days: 1,7,8,14,21,28,35 × [facebook,instagram,pinterest,nextdoor,x]
    // TikTok days: 4,11,17,22,26
    // YouTube days: 7,21,35 (added after main platform rows on those days)
    // ICP routing: FB/PI/ND → LP-A (budget_family) | IG/TK/YT → LP-B (super_mom) | X → alternating

    var _A7 = [
      { day:1,  stage:'hook',    feature:'problem',
        hA:'You have an invisible leak. $111 a month gone before dinner.',
        hB:'6:30 PM. Fridge full. Five apps open. Still no dinner. Every night.' },
      { day:7,  stage:'agitate', feature:'problem',
        hA:'The spinach. The ground beef. The yogurt. $1,336 every year. No system.',
        hB:'5–10 hours a week deciding what to eat. That time belongs to your family.' },
      { day:8,  stage:'solve',   feature:'TRACK',
        hA:'TRACK closes the $111 leak. Scan your receipt. Expiry caught before the loss.',
        hB:'easyChef Pro knows what\'s in your fridge before the 6:30 PM panic.' },
      { day:14, stage:'proof',   feature:'proof',
        hA:'10,000 households. $1,336/year average savings. Validated. Not a promise.',
        hB:'10,000 households. The 6:30 PM panic — gone. Built by first responders.' },
      { day:21, stage:'proof',   feature:'all',
        hA:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. $1,336 back.',
        hB:'Five apps replaced. Dinner figured out before you open the fridge. One loop.' },
      { day:28, stage:'urgency', feature:'urgency',
        hA:'$7.99/month. 60% off forever. Founding price closes at 5,000 families.',
        hB:'The founding family window is closing. Dinner figured out. Kitchen in command.' },
      { day:35, stage:'launch',  feature:'launch',
        hA:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. Live. Now. The $111 leak — closed.',
        hB:'July 1. You were first. The 6:30 PM panic — permanently gone.' }
    ];

    var _TK5 = [
      { day:4,  stage:'problem', feature:'problem', hA:'TK-1 · The $111 leak · Every month. No system. One app closes it.' },
      { day:11, stage:'value',   feature:'TRACK',   hA:'TK-2 · TRACK · Scan your receipt. $111 stopped disappearing.' },
      { day:17, stage:'value',   feature:'PLAN',    hA:'TK-3 · PLAN · Five dinners from what you already paid for.' },
      { day:22, stage:'urgency', feature:'urgency', hA:'TK-4 · 5,000 founding spots. $7.99/month. The window is closing.' },
      { day:26, stage:'value',   feature:'COOK',    hA:'TK-5 · COOK · 30 minutes. From your fridge. Dinner figured out.' }
    ];

    var _YT3 = [
      { day:7,  stage:'agitate', feature:'problem', hA:'YT-1 · The Problem · 60 seconds · The invisible grocery leak' },
      { day:21, stage:'proof',   feature:'all',     hA:'YT-2 · The Solution · TRACK→PLAN→OPTIMIZE→COOK→SHOP closes the loop' },
      { day:35, stage:'launch',  feature:'launch',  hA:'YT-3 · Launch Day · July 1 · The leak is closed' }
    ];

    // Build ordered post list (43 entries, day-sorted)
    // Ordering: Day 1: FB/IG/PI/ND/X · Day 4: TK · Day 7: FB/IG/PI/ND/X/YT
    //           Day 8: FB/IG/PI/ND/X · Day 11: TK · Day 14: FB/IG/PI/ND/X
    //           Day 17: TK · Day 21: FB/IG/PI/ND/X/YT · Day 22: TK
    //           Day 26: TK · Day 28: FB/IG/PI/ND/X · Day 35: FB/IG/PI/ND/X/YT
    var _MAINS = ['facebook','instagram','pinterest','nextdoor','x'];
    var _postList = [];

    var _addMain = function(arc) {
      _MAINS.forEach(function(t) { _postList.push({ t:t, arc:arc, tkArc:null, ytArc:null }); });
    };
    var _addTk = function(tk) { _postList.push({ t:'tiktok',  arc:null, tkArc:tk, ytArc:null }); };
    var _addYt = function(yt) { _postList.push({ t:'youtube', arc:null, tkArc:null, ytArc:yt }); };

    _addMain(_A7[0]);                    // Day 1  posts 001-005
    _addTk(_TK5[0]);                     // Day 4  post  006
    _addMain(_A7[1]); _addYt(_YT3[0]);  // Day 7  posts 007-012
    _addMain(_A7[2]);                    // Day 8  posts 013-017
    _addTk(_TK5[1]);                     // Day 11 post  018
    _addMain(_A7[3]);                    // Day 14 posts 019-023
    _addTk(_TK5[2]);                     // Day 17 post  024
    _addMain(_A7[4]); _addYt(_YT3[1]);  // Day 21 posts 025-030
    _addTk(_TK5[3]);                     // Day 22 post  031
    _addTk(_TK5[4]);                     // Day 26 post  032
    _addMain(_A7[5]);                    // Day 28 posts 033-037
    _addMain(_A7[6]); _addYt(_YT3[2]);  // Day 35 posts 038-043

    // DL counters per platform
    var _dlCtr = { facebook:0, instagram:0, pinterest:0, nextdoor:0, x:0, tiktok:0, youtube:0 };
    var _dlPfx = { facebook:'FB', instagram:'IG', pinterest:'PI', nextdoor:'ND', x:'X', tiktok:'TK', youtube:'YT' };
    var _utmSrc = { facebook:'facebook', instagram:'instagram', pinterest:'pinterest',
                    nextdoor:'nextdoor', x:'x', tiktok:'tiktok', youtube:'youtube' };
    var _xIdx = 0;

    var spRows   = [];
    var dlSocRows = [];
    var alRows   = [];
    var vpRows   = [];

    _postList.forEach(function(p, idx) {
      var t      = p.t;
      var isTk   = (t === 'tiktok');
      var isYt   = (t === 'youtube');
      var src    = p.tkArc || p.ytArc || p.arc;
      var day    = src.day;
      var stage  = src.stage;
      var feat   = src.feature;
      var hAraw  = src.hA;
      var hBraw  = src.hB || '';

      _dlCtr[t]++;
      var dlN   = _dlCtr[t];
      var pfx   = _dlPfx[t];
      var dlId  = 'DL-' + pfx + '-EC002-' + ('0000' + dlN).slice(-4);

      var lp;
      if (t === 'x') { _xIdx++; lp = (_xIdx % 2 === 1) ? 'a' : 'b'; }
      else if (t === 'facebook' || t === 'pinterest' || t === 'nextdoor') { lp = 'a'; }
      else { lp = 'b'; } // instagram, tiktok, youtube

      var lpUrl   = _ec002_lpUrl(lp);
      var hook    = (isTk || isYt) ? hAraw : (lp === 'a' ? hAraw : hBraw);
      var medium  = isYt ? 'video' : 'social';
      var slug    = _ec002_slugify(hook);
      var utmUrl  = _ec002_utmUrl(lpUrl, _utmSrc[t], medium, dlId, slug);
      var spId    = 'ec002-sp-' + ('000' + (idx + 1)).slice(-3);
      var brief   = _ec002_briefJson(stage, feat, day, hAraw, hBraw, lp);
      var imgBrief = _ec002_imgBrief(stage, feat, day);
      var icp     = (lp === 'a') ? 'budget_family' : 'super_mom';

      spRows.push([
        spId, 'EC-2026-002', _ec002_platMap(t),
        hook, '',
        _ec002_cta(stage, lp),
        _ec002_htags(feat, t),
        imgBrief, '',
        _ec002_date(day), '12:00', 'draft',
        dlId, utmUrl, '', brief
      ]);

      dlSocRows.push([
        dlId, dlId + '|' + slug, 'EC-2026-002', _ec002_platMap(t),
        lpUrl, _utmSrc[t], medium, 'ec-2026-002',
        'active', now, '', 'system',
        hook.slice(0, 60), icp, lp, 'invisible-leak'
      ]);

      alRows.push([
        spId, 'EC-2026-002', _ec002_platMap(t),
        '', '', '', '', 'generated', '', '', _ec002_date(day), now, now
      ]);

      if (isTk || isYt) {
        vpRows.push([
          spId, 'EC-2026-002', _ec002_platMap(t),
          isTk ? 'short_form' : 'long_form',
          isTk ? '15-30s' : '60s',
          hook, 'draft', 'not_started', '', '', 'not_started',
          '', 'not_started', 'not_started', brief,
          _ec002_date(day), '', '', now, now
        ]);
      }
    });

    // Write SocialPosts
    var spStart = spSheet.getLastRow() + 1;
    spSheet.getRange(spStart, 1, spRows.length, 16).setValues(spRows);
    results.push('✓ SocialPosts: ' + spRows.length + ' posts');

    // Write AssetLifecycle
    var alHdrs = _CC_HDR.AssetLifecycle;
    if (alSheet.getLastRow() < 1) {
      alSheet.getRange(1, 1, 1, alHdrs.length).setValues([alHdrs]).setFontWeight('bold');
      alSheet.setFrozenRows(1);
    }
    var alStart = alSheet.getLastRow() + 1;
    alSheet.getRange(alStart, 1, alRows.length, alHdrs.length).setValues(alRows);
    var alStatusCol = alHdrs.indexOf('status') + 1;
    var alRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(_AL_STATUSES, true).setAllowInvalid(false).build();
    alSheet.getRange(alStart, alStatusCol, alRows.length, 1).setDataValidation(alRule);
    results.push('✓ AssetLifecycle: ' + alRows.length + ' entries');

    // Write VideoProduction
    var vpHdrs = _CC_HDR.VideoProduction;
    vpSheet.getRange(1, 1, 1, vpHdrs.length).setValues([vpHdrs]).setFontWeight('bold');
    vpSheet.setFrozenRows(1);
    if (vpRows.length) {
      var vpStart = vpSheet.getLastRow() + 1;
      vpSheet.getRange(vpStart, 1, vpRows.length, vpHdrs.length).setNumberFormat('@').setValues(vpRows);
      var _mkVpRule = function(list) {
        return SpreadsheetApp.newDataValidation().requireValueInList(list, true).setAllowInvalid(false).build();
      };
      vpSheet.getRange(vpStart, vpHdrs.indexOf('script_status')     + 1, vpRows.length, 1).setDataValidation(_mkVpRule(_VP_SCRIPT_STATUSES));
      vpSheet.getRange(vpStart, vpHdrs.indexOf('storyboard_status') + 1, vpRows.length, 1).setDataValidation(_mkVpRule(_VP_STORYBOARD_STATUSES));
      vpSheet.getRange(vpStart, vpHdrs.indexOf('ai_gen_status')     + 1, vpRows.length, 1).setDataValidation(_mkVpRule(_VP_AI_GEN_STATUSES));
      vpSheet.getRange(vpStart, vpHdrs.indexOf('edit_status')       + 1, vpRows.length, 1).setDataValidation(_mkVpRule(_VP_EDIT_STATUSES));
      vpSheet.getRange(vpStart, vpHdrs.indexOf('thumbnail_status')  + 1, vpRows.length, 1).setDataValidation(_mkVpRule(_VP_THUMB_STATUSES));
    }
    results.push('✓ VideoProduction: ' + vpRows.length + ' entries');

    // ── 6. Email Sequences (24 emails × A+B = 48 rows) ───────────────────────
    var _emUrlA = function(dlId, slug) { return _ec002_utmUrl(_LP2_A, 'email', 'email', dlId, slug); };
    var _emUrlB = function(dlId, slug) { return _ec002_utmUrl(_LP2_B, 'email', 'email', dlId, slug); };

    // 24 email definitions: seq, n, num(1-24), day, stage, feature, dlA, slA, dlB, slB, a{}, b{}
    var ED002 = [
      // ── SEQ-1: Welcome + Problem Arc (6 emails, days 1,3,5,7,9,11) ─────────
      { seq:1, n:1, num:1,  day:1,  stage:'hook',    feature:'problem',
        dlA:'DL-EM-EC002-0001-A', slA:'seq1-e1-a', dlB:'DL-EM-EC002-0001-B', slB:'seq1-e1-b',
        a:{ sub:'You have an invisible leak. $111 a month.',
            pre:'Not your fault. Just no system.',
            hk:'You have an invisible leak in your grocery budget. $111 a month. Every month. Not because of bad decisions — because the system was never designed to close the loop.',
            pr:'You buy groceries on Sunday. By Wednesday it\'s a guessing game. The spinach goes limp. The ground beef gets pushed to the back. The yogurt expires. You order delivery. Again.',
            ag:'Families save an average of $111 a month when the leak is closed. That\'s $1,336/year average savings. Not from couponing. Not from buying less. From having a system.',
            so:'easyChef Pro closes the loop. Five apps replaced. One leak closed.',
            va:'TRACK what\'s in your fridge before it expires. PLAN the week from what you already own. COOK 30-minute dinners from what\'s there. SHOP only what\'s missing. OPTIMIZE every meal automatically.',
            pf:'Validated across 10,000 household profiles. 69.5% less food waste. Built by first responders.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'6:30 PM. Fridge full. No dinner.',
            pre:'The 6:30 PM wall is a system problem. Not a you problem.',
            hk:'It\'s 6:30 PM. The fridge is full. Five apps are open. And you still don\'t know what to make for dinner.',
            pr:'You have Mealime. A pantry app. A nutrition tracker. A recipe app. A shopping list. None of them talk to each other. None of them know what\'s actually in your fridge right now.',
            ag:'You spend 5 to 10 hours a week deciding what to eat. Every night you wing it is an evening that wasn\'t yours.',
            so:'easyChef Pro closes the loop. One app. Five replaced. Dinner figured out before you open the fridge.',
            va:'The meal plan builds from what you already own. The recipe is waiting. The shopping list writes itself. The nutrition score fires automatically.',
            pf:'Validated across 10,000 household profiles. Built by first responders who needed this as much as you do.',
            ct:'Join the founding family — early access July 1' }},

      { seq:1, n:2, num:2,  day:3,  stage:'problem', feature:'problem',
        dlA:'DL-EM-EC002-0002-A', slA:'seq1-e2-a', dlB:'DL-EM-EC002-0002-B', slB:'seq1-e2-b',
        a:{ sub:'Five apps. The $111 leak still runs.',
            pre:'The fragmentation is the problem.',
            hk:'Five apps. None of them talk to each other. The leak runs in the gap between them.',
            pr:'NoWaste tracks your pantry. Mealime plans your meals. A nutrition app scores your food. A recipe app guides your cooking. A shopping list manages your cart. None of them connect.',
            ag:'$111 a month disappears in that gap. The spinach expires because the pantry never told the meal planner. The ground beef goes to waste because the recipe app didn\'t know you had it.',
            so:'easyChef Pro replaces all five. TRACK → PLAN → OPTIMIZE → COOK → SHOP. One loop. Closed.',
            va:'One app. Everything connected. The leak has nowhere left to run.',
            pf:'Validated across 10,000 household profiles. 69.5% less food waste. $1,336/year average savings.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'Six apps open. Zero dinners figured out.',
            pre:'The fragmentation is the problem. Not you.',
            hk:'Six apps open. Fridge full. Still no dinner. This is not a discipline problem. It is a system problem.',
            pr:'None of the apps talk to each other. Mealime doesn\'t know your pantry. Your pantry app doesn\'t build your shopping list. The loop never closes.',
            ag:'Every night the system fails you costs 20 minutes of decision fatigue and $30 in delivery you didn\'t plan for.',
            so:'easyChef Pro replaces all five. One app that knows your pantry, builds your plan, cooks your dinner, and shops your list.',
            va:'Dinner figured out before 6:30 PM arrives. The loop closes. The panic stops.',
            pf:'Validated across 10,000 household profiles. Built by first responders.',
            ct:'Join the founding family — early access July 1' }},

      { seq:1, n:3, num:3,  day:5,  stage:'agitate', feature:'problem',
        dlA:'DL-EM-EC002-0003-A', slA:'seq1-e3-a', dlB:'DL-EM-EC002-0003-B', slB:'seq1-e3-b',
        a:{ sub:'$1,336. From your fridge to your garbage bin.',
            pre:'Do the math. It is jarring.',
            hk:'$1,336. Every year. Groceries you bought that never became dinner.',
            pr:'It\'s not the big grocery trips. It\'s the spinach that wilted by Wednesday. The ground beef pushed to the back. The yogurt that expired before anyone touched it.',
            ag:'That\'s $111 every month. $3.66 every single day. Without a system, it never stops.',
            so:'easyChef Pro TRACK sees everything the moment you scan your receipt. Expiry alerts fire before the loss happens.',
            va:'Your pantry knows what\'s in it. The meal plan builds from what you own. The recipe uses what\'s there. The shopping list only buys what\'s missing.',
            pf:'69.5% less food waste. Validated across 10,000 household profiles.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'5–10 hours a week deciding what to eat.',
            pre:'That time belongs to your family.',
            hk:'5 to 10 hours a week. Deciding what to eat. None of it decided. All of it wasted.',
            pr:'Sunday: meal plan that doesn\'t survive Monday. Wednesday: fridge stare. Friday: delivery again. The hours add up. 520 hours a year just deciding.',
            ag:'Every night you wing it is an evening that wasn\'t yours. Every delivery order is $30 that should have stayed in your wallet.',
            so:'easyChef Pro decides dinner before you open the fridge. The plan builds from what you already own.',
            va:'Open the app. Your week is planned. Tonight\'s recipe is from your fridge. The shopping list for what\'s missing is ready.',
            pf:'Validated across 10,000 household profiles. Built by first responders.',
            ct:'Join the founding family — early access July 1' }},

      { seq:1, n:4, num:4,  day:7,  stage:'agitate', feature:'problem',
        dlA:'DL-EM-EC002-0004-A', slA:'seq1-e4-a', dlB:'DL-EM-EC002-0004-B', slB:'seq1-e4-b',
        a:{ sub:'The spinach. The ground beef. The yogurt.',
            pre:'$111 gone. Again.',
            hk:'The spinach went limp. The ground beef got pushed to the back. The yogurt expired. $111 gone. Every month.',
            pr:'You bought it. You planned to use it. The system never closed the loop. The leak ran anyway.',
            ag:'$1,336 a year from your family\'s budget. Not from bad decisions. From a system that was never designed to connect the pantry to the meal plan to the recipe to the cart.',
            so:'easyChef Pro TRACK catches the spinach before it goes limp. Every item logged. Expiry tracked. The loop closes.',
            va:'The pantry talks to the plan. The plan talks to the recipe. The recipe talks to the cart. Nothing expires in the dark.',
            pf:'Families save an average of $111 a month. $1,336/year average savings. Validated.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'The 6:30 PM wall is a system problem.',
            pre:'Not a you problem.',
            hk:'It is not that you\'re bad at cooking. It is that no system was ever designed to close the loop between your pantry, your meal plan, your recipe, and your cart.',
            pr:'Every night you hit the 6:30 PM wall is proof the system is broken. Not you.',
            ag:'5 to 10 hours a week of broken system. $30 delivery orders that should have been dinner from the fridge you already stocked.',
            so:'easyChef Pro closes the loop. Dinner decided before you open the fridge. The system does it.',
            va:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five steps. One app. Dinner figured out.',
            pf:'Validated across 10,000 household profiles. Built by first responders who needed this as much as you do.',
            ct:'Join the founding family — early access July 1' }},

      { seq:1, n:5, num:5,  day:9,  stage:'solve',   feature:'TRACK',
        dlA:'DL-EM-EC002-0005-A', slA:'seq1-e5-a', dlB:'DL-EM-EC002-0005-B', slB:'seq1-e5-b',
        a:{ sub:'TRACK closes the $111 leak.',
            pre:'This is how it starts.',
            hk:'$1,336 back. Not from couponing. From knowing what\'s in your fridge before it expires.',
            pr:'TRACK scans your receipt. Every item logged with expiry dates. The pantry you couldn\'t see is now visible — and it talks to every other feature in the app.',
            ag:'The moment something is about to expire, TRACK fires an alert. PLAN pulls it into tonight\'s dinner. Nothing goes to waste. The $111 stops disappearing.',
            so:'TRACK replaced NoWaste — and it does more. Every item it logs feeds every decision downstream.',
            va:'The pantry data builds the meal plan. The meal plan builds the recipe. The recipe builds the shopping list. One loop. Closed.',
            pf:'Families save an average of $111 a month. $1,336/year average savings. 69.5% less food waste.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'Dinner before 6:30 PM. Every night.',
            pre:'This is what TRACK actually does.',
            hk:'The first thing easyChef Pro does is close the leak — and decide dinner.',
            pr:'TRACK scans your receipt. Every item logged. Expiry tracked. The pantry you couldn\'t see is now visible. PLAN reads it automatically and builds your week.',
            ag:'When TRACK knows what you have, everything follows. The meal plan builds before Monday. The 6:30 PM decision is already made.',
            so:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. The full loop. From one app.',
            va:'Dinner figured out before you open the fridge. The 6:30 PM panic — gone.',
            pf:'Validated across 10,000 household profiles. Built by first responders.',
            ct:'Join the founding family — early access July 1' }},

      { seq:1, n:6, num:6,  day:11, stage:'value',   feature:'TRACK',
        dlA:'DL-EM-EC002-0006-A', slA:'seq1-e6-a', dlB:'DL-EM-EC002-0006-B', slB:'seq1-e6-b',
        a:{ sub:'$111 back from knowing what you have.',
            pre:'TRACK: three days in. Here\'s what changed.',
            hk:'Scan your receipt. easyChef Pro does the rest.',
            pr:'TRACK logs every item with expiry dates. The pantry you couldn\'t see is now visible and talking to every feature downstream.',
            ag:'The moment something is about to expire, TRACK fires an alert before the loss happens. You never buy what you already have. You never lose what you paid for.',
            so:'TRACK replaced NoWaste — and it does more. It opened the whole loop.',
            va:'PLAN sees your pantry and builds five dinners from what you already own. No manual entry. No guessing. Monday through Friday — done.',
            pf:'Families save an average of $111 a month. 69.5% less food waste. Validated.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'The pantry knows. Dinner follows.',
            pre:'TRACK: here\'s what the week looks like now.',
            hk:'TRACK knows what you have. PLAN builds your week. Dinner is figured out before 6:30 PM arrives.',
            pr:'You scanned your receipt on Sunday. Monday morning, your week is already planned. Five dinners from what you already own. No 6:30 PM spiral.',
            ag:'That\'s the difference. The pantry talks to the meal plan. The meal plan talks to the recipe. Nothing expires in the dark.',
            so:'TRACK → PLAN. Two features. The loop is already closing.',
            va:'The week is figured out. The 6:30 PM panic doesn\'t come. The kitchen is starting to work for you.',
            pf:'Validated across 10,000 household profiles. 69.5% less food waste.',
            ct:'Join the founding family — early access July 1' }},

      // ── SEQ-2: Value Arc (8 emails, days 12,14,16,18,20,21,23,25) ────────────
      { seq:2, n:1, num:7,  day:12, stage:'value',   feature:'TRACK',
        dlA:'DL-EM-EC002-0007-A', slA:'seq2-e1-a', dlB:'DL-EM-EC002-0007-B', slB:'seq2-e1-b',
        a:{ sub:'$111 back every month. From your pantry.',
            pre:'Week two. TRACK is running. Here\'s what\'s possible.',
            hk:'You scan the receipt. easyChef Pro does the rest.',
            pr:'TRACK logs every item with expiry dates. The pantry you couldn\'t see is now visible — and it\'s talking to every other feature in the app.',
            ag:'The moment something is about to expire, TRACK fires an alert. PLAN pulls it into tonight\'s dinner. Nothing goes to waste. The $111 stops disappearing.',
            so:'TRACK replaced NoWaste — and opened the whole loop.',
            va:'PLAN sees your pantry and builds five dinners from what you already own. No manual entry. No 6:30 PM guessing. Monday through Friday, done.',
            pf:'Families save an average of $111 a month. $1,336/year average savings.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'Five dinners. From what you already paid for.',
            pre:'The loop is running. Here\'s week two.',
            hk:'Monday. Tuesday. Wednesday. Thursday. Friday. Five dinners — from what you already own.',
            pr:'PLAN doesn\'t ask you to enter anything. It reads your pantry from TRACK. It sees what\'s expiring first. It builds the week automatically.',
            ag:'Sunday: scan your receipt. Monday morning: your week is already planned. No 6:30 PM decisions. No spiral. No delivery.',
            so:'PLAN replaced Mealime — but Mealime never knew what you had. PLAN does.',
            va:'Five dinners planned. Each recipe ready. Each from your fridge. 30 minutes fridge to table.',
            pf:'Validated across 10,000 household profiles. 69.5% less food waste.',
            ct:'Join the founding family — early access July 1' }},

      { seq:2, n:2, num:8,  day:14, stage:'proof',   feature:'proof',
        dlA:'DL-EM-EC002-0008-A', slA:'seq2-e2-a', dlB:'DL-EM-EC002-0008-B', slB:'seq2-e2-b',
        a:{ sub:'10,000 households. Validated. Not a promise.',
            pre:'Two weeks in. Here\'s the proof.',
            hk:'10,000 household profiles. 69.5% less food waste. $1,336/year average savings. Validated data.',
            pr:'That\'s from real households running the full loop: TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One system.',
            ag:'9 patent-pending technologies. Built by first responders. Not Silicon Valley.',
            so:'The data is in. The system works. The founding price — $7.99/month — closes July 1.',
            va:'$7.99 to save $111 a month. That\'s 60% off the standard price of $19.99. Forever. For the first 5,000 families.',
            pf:'Families save an average of $111 a month. 69.5% less food waste. Validated across 10,000 household profiles.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'10,000 households. The 6:30 PM panic — gone.',
            pre:'Two weeks in. The proof is in.',
            hk:'The data is real. 10,000 households. The 6:30 PM panic — gone.',
            pr:'Not because they got better at cooking. Because the system closes the loop. TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced.',
            ag:'9 patent-pending technologies. Built by first responders. $1,336/year average savings. 69.5% less food waste.',
            so:'The founding price is $7.99/month. 60% off forever. For the first 5,000 families only.',
            va:'Dinner figured out. Kitchen in command. The mental load — gone.',
            pf:'Validated across 10,000 household profiles. Built by first responders.',
            ct:'Join the founding family — early access July 1' }},

      { seq:2, n:3, num:9,  day:16, stage:'value',   feature:'PLAN',
        dlA:'DL-EM-EC002-0009-A', slA:'seq2-e3-a', dlB:'DL-EM-EC002-0009-B', slB:'seq2-e3-b',
        a:{ sub:'The meal plan builds itself. From what you paid for.',
            pre:'PLAN: here\'s what week three looks like.',
            hk:'The meal plan builds itself. From what you already paid for.',
            pr:'Monday: salmon from last week. Tuesday: tacos from the ground beef. Wednesday: stir fry from the vegetables about to expire. Thursday: pasta from the back of the pantry.',
            ag:'PLAN sees all of it. From the pantry TRACK built. Five dinners from what you already own. Zero guessing. Zero waste.',
            so:'PLAN replaced your meal planner — but it knows your pantry. No planner did that before.',
            va:'The week is planned before Monday arrives. The recipes are ready. The shopping list for what\'s missing builds itself.',
            pf:'Families save an average of $111 a month. 69.5% less food waste.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'The spinach you bought Sunday is cooked by Monday.',
            pre:'PLAN: this is what changes.',
            hk:'The spinach you bought on Sunday. Today is Wednesday. You know what used to happen to it.',
            pr:'Not anymore. TRACK saw it the day you scanned the receipt. PLAN pulled it into Monday\'s dinner. You cooked it while it was still good.',
            ag:'That\'s the difference. The pantry talks to the meal plan. The meal plan talks to the recipe. Nothing expires in the dark.',
            so:'PLAN knows what you have. Builds from what\'s expiring first. Five dinners. From your fridge. Automatic.',
            va:'The week is figured out before you open the fridge on Sunday night. The 6:30 PM panic doesn\'t come.',
            pf:'Validated across 10,000 household profiles. 69.5% less food waste.',
            ct:'Join the founding family — early access July 1' }},

      { seq:2, n:4, num:10, day:18, stage:'value',   feature:'OPTIMIZE',
        dlA:'DL-EM-EC002-0010-A', slA:'seq2-e4-a', dlB:'DL-EM-EC002-0010-B', slB:'seq2-e4-b',
        a:{ sub:'Every meal scored. No tracking. $111 back.',
            pre:'OPTIMIZE: this is what week three adds.',
            hk:'OPTIMIZE scores every meal COOK produces. 6 nutrition dimensions. FDA-grade data. Registered dietitians. No manual tracking.',
            pr:'Your meal plan builds from your pantry. Your recipe is ready in 30 minutes. Every meal you cook is now scored — automatically.',
            ag:'Every meal COOK produces gets scored before you plate it. If something\'s off nutritionally, PLAN adjusts next week\'s dinners. The loop optimizes itself.',
            so:'OPTIMIZE replaced MyFitnessPal — but MyFitnessPal never knew your pantry. OPTIMIZE does.',
            va:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One system. The $111 leak — closed.',
            pf:'Registered dietitians validated every recipe. 69.5% less food waste. Families save an average of $111 a month.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'Nutrition scored from your actual fridge. No logging.',
            pre:'OPTIMIZE: the loop tightens.',
            hk:'OPTIMIZE fires automatically. You didn\'t log anything. The meal COOK produced is already scored.',
            pr:'6 nutrition dimensions. FDA-grade data. Registered dietitians validated every recipe. Every meal from your fridge — scored before it reaches the table.',
            ag:'You used to track every calorie on a separate app. OPTIMIZE does all of it from what you actually cooked. From your actual pantry. Without a single manual entry.',
            so:'OPTIMIZE replaced your nutrition tracker — and it\'s connected to COOK, PLAN, and TRACK.',
            va:'The full loop closes. Five apps replaced. Dinner figured out. Kitchen in command.',
            pf:'Validated across 10,000 household profiles. Built by first responders.',
            ct:'Join the founding family — early access July 1' }},

      { seq:2, n:5, num:11, day:20, stage:'value',   feature:'COOK',
        dlA:'DL-EM-EC002-0011-A', slA:'seq2-e5-a', dlB:'DL-EM-EC002-0011-B', slB:'seq2-e5-b',
        a:{ sub:'30 minutes fridge to table. From what you already have.',
            pre:'COOK: this is what week three delivers.',
            hk:'COOK turns your fridge into tonight\'s recipe. 30 minutes. From what you already paid for.',
            pr:'COOK knows your pantry from TRACK. It knows your meal plan from PLAN. It pulls tonight\'s recipe automatically from what you already own.',
            ag:'10,000 recipes at launch. Every recipe from your pantry. 30 minutes fridge to table. No recipe app knew your pantry before. COOK does.',
            so:'COOK replaced your recipe app — and does what no recipe app could.',
            va:'Your dinner is decided. Your recipe is from your fridge. 30 minutes. Done. $111 stays in your budget.',
            pf:'Families save an average of $111 a month. 69.5% less food waste. Validated.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'Dinner decided. 30 minutes. From your fridge.',
            pre:'COOK: dinner before you open the fridge.',
            hk:'COOK replaced your recipe app — and COOK knows what you already have.',
            pr:'PLAN picked tonight\'s recipe. COOK shows you how to make it. From what TRACK said is in your fridge. 30 minutes. From ingredients you already paid for.',
            ag:'No more staring at a recipe and realizing you\'re missing three things. COOK already knew and SHOP already listed them.',
            so:'COOK → SHOP. The recipe flows into the cart. The loop stays closed.',
            va:'30 minutes. Real food. From your fridge. The 6:30 PM panic — replaced by dinner on the table.',
            pf:'Validated across 10,000 household profiles. Built by first responders.',
            ct:'Join the founding family — early access July 1' }},

      { seq:2, n:6, num:12, day:21, stage:'proof',   feature:'all',
        dlA:'DL-EM-EC002-0012-A', slA:'seq2-e6-a', dlB:'DL-EM-EC002-0012-B', slB:'seq2-e6-b',
        a:{ sub:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. $1,336/year. Proven.',
            pre:'Three weeks in. The full loop is visible.',
            hk:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One loop. The $111 leak — closed.',
            pr:'You\'ve seen all five. TRACK catches expiry before loss. PLAN builds the week from what you own. OPTIMIZE scores every meal. COOK turns your fridge into tonight\'s recipe. SHOP lists only what\'s missing.',
            ag:'$1,336/year average savings. 69.5% less food waste. 10,000 households. Validated.',
            so:'The founding price is $7.99/month. 60% off the standard $19.99. For the first 5,000 families only.',
            va:'$7.99 to save $111 a month. That math pays for itself in the first week.',
            pf:'9 patent-pending technologies. Validated across 10,000 household profiles. Built by first responders.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'Five apps replaced. The 6:30 PM panic — gone.',
            pre:'Three weeks in. The loop is closed.',
            hk:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. One loop. Five apps replaced. The 6:30 PM wall — gone.',
            pr:'You\'ve seen all five. TRACK knows your pantry. PLAN builds your week. OPTIMIZE scores every meal. COOK turns your fridge into dinner. SHOP lists only what\'s missing.',
            ag:'10,000 households. 69.5% less food waste. $1,336/year average savings. Built by first responders.',
            so:'The founding price is $7.99/month. 60% off forever. For the first 5,000 families only.',
            va:'Dinner figured out. Kitchen in command. The mental load — gone.',
            pf:'Validated across 10,000 household profiles. 9 patent-pending technologies.',
            ct:'Join the founding family — early access July 1' }},

      { seq:2, n:7, num:13, day:23, stage:'value',   feature:'SHOP',
        dlA:'DL-EM-EC002-0013-A', slA:'seq2-e7-a', dlB:'DL-EM-EC002-0013-B', slB:'seq2-e7-b',
        a:{ sub:'1-click shopping. 800k products. The list builds itself.',
            pre:'SHOP: the last piece of the loop.',
            hk:'SHOP replaced your shopping list app. And it does what no list app ever did.',
            pr:'The list builds from your pantry. Only what\'s missing from tonight\'s recipe. From this week\'s meal plan. 800,000 products. 1-click to your Walmart cart.',
            ag:'No more buying what you already have. No more forgetting what you actually need. The list knows. SHOP knows.',
            so:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. The full loop. Five apps replaced.',
            va:'One click. Your cart is built. Your budget is protected. Your $111 stays in your wallet.',
            pf:'800,000 products. Validated across 10,000 household profiles. $1,336/year average savings.',
            ct:'Join the waitlist — early access July 1' },
        b:{ sub:'Never buy what you already have again.',
            pre:'SHOP: the loop is complete.',
            hk:'SHOP replaced your shopping list. And SHOP knows what you already have.',
            pr:'The list builds from your pantry. Only what\'s missing. From the meal plan PLAN built. From the recipe COOK is making tonight. 800,000 products. 1-click.',
            ag:'No more standing in the aisle wondering if you have it at home. TRACK already told SHOP. The list only has what you actually need.',
            so:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. Complete. Five apps. One loop.',
            va:'Shopping done. Dinner decided. Kitchen in command. The 6:30 PM panic — permanent history.',
            pf:'Validated across 10,000 household profiles. Built by first responders.',
            ct:'Join the founding family — early access July 1' }},

      { seq:2, n:8, num:14, day:25, stage:'urgency', feature:'urgency',
        dlA:'DL-EM-EC002-0014-A', slA:'seq2-e8-a', dlB:'DL-EM-EC002-0014-B', slB:'seq2-e8-b',
        a:{ sub:'The founding price window is opening.',
            pre:'Six days left. Here\'s the math.',
            hk:'$7.99/month. $111 saved every month. The math pays for itself in the first week.',
            pr:'You\'ve seen the full loop. TRACK → PLAN → OPTIMIZE → COOK → SHOP. $1,336/year average savings. 69.5% less food waste. Validated across 10,000 households.',
            ag:'The founding price is $7.99/month. 60% off the standard $19.99. It closes at 5,000 spots. Real scarcity.',
            so:'6 days to July 1. 6 days to lock in $7.99/month forever.',
            va:'$7.99/month vs. $111/month in grocery waste. The ROI is not subtle.',
            pf:'Families save an average of $111 a month. Validated across 10,000 household profiles.',
            ct:'Lock in $7.99/month — 60% off forever' },
        b:{ sub:'6 days left to end the 6:30 PM wall. Forever.',
            pre:'The window is opening.',
            hk:'6 days. July 1 is real. The founding family window is opening.',
            pr:'You\'ve followed the arc for three weeks. You\'ve seen TRACK → PLAN → OPTIMIZE → COOK → SHOP close the loop. You know what the app does.',
            ag:'The founding price closes when 5,000 spots fill. After that: $19.99/month standard. The difference is $12 every month. Forever.',
            so:'Join the waitlist. Lock $7.99/month. Get early access July 1.',
            va:'Dinner decided. Groceries planned. Kitchen in command. The 6:30 PM panic — gone.',
            pf:'Built by first responders. Validated across 10,000 household profiles.',
            ct:'Join the founding family — lock in $7.99/month' }},

      // ── SEQ-3: Urgency Arc (6 emails, days 22,24,26,28,30,32) ────────────────
      { seq:3, n:1, num:15, day:22, stage:'urgency', feature:'urgency',
        dlA:'DL-EM-EC002-0015-A', slA:'seq3-e1-a', dlB:'DL-EM-EC002-0015-B', slB:'seq3-e1-b',
        a:{ sub:'5,000 founding spots. The window is closing.',
            pre:'Three weeks of proof. Here\'s the number.',
            hk:'5,000 founding families. $7.99/month. Forever. The window is closing.',
            pr:'You\'ve been following the invisible leak for three weeks. You know what TRACK does. You know what the 5-app loop closes. You know the $1,336.',
            ag:'$7.99/month is 60% off the standard price of $19.99. It locks the day the 5,000 spots fill. Real scarcity. Not manufactured.',
            so:'Early access: July 1. Founding price: $7.99/month. Your decision: now.',
            va:'$7.99 to save $111 a month. $1,336/year average savings. First 5,000 only.',
            pf:'Validated across 10,000 household profiles. 69.5% less food waste.',
            ct:'Lock in $7.99/month — 60% off forever' },
        b:{ sub:'3 weeks in. Here\'s what it\'s been costing you.',
            pre:'Every day without the system is $3.66.',
            hk:'Three weeks. You watched the invisible leak. Saw the 5-app fragmentation. Watched TRACK close it.',
            pr:'Every day without the system: $3.66 in groceries that become garbage. Every night without the meal plan: 20 minutes of 6:30 PM decision.',
            ag:'The founding price closes when 5,000 spots fill. After that: $19.99/month. The gap is $12 a month. Forever.',
            so:'Founding family: $7.99/month. 60% off. For the first 5,000 only.',
            va:'Early access July 1. Founding price locked. Kitchen in command.',
            pf:'Built by first responders. Validated across 10,000 household profiles.',
            ct:'Join the founding family — lock in $7.99/month' }},

      { seq:3, n:2, num:16, day:24, stage:'urgency', feature:'urgency',
        dlA:'DL-EM-EC002-0016-A', slA:'seq3-e2-a', dlB:'DL-EM-EC002-0016-B', slB:'seq3-e2-b',
        a:{ sub:'$7.99/month. 60% off. 7 days left.',
            pre:'The math is simple.',
            hk:'$7.99/month. $111 saved every month. The math pays for itself in the first week.',
            pr:'7 days left before July 1. 7 days before early access opens. 7 days before the founding price closes at 5,000 spots.',
            ag:'After 5,000 spots: $19.99/month. The difference is $12 every month. Forever. That\'s $144 a year — just from waiting.',
            so:'Join the waitlist today. Lock $7.99/month before it closes.',
            va:'30 minutes fridge to table. $1,336/year average savings. 69.5% less food waste. Founded at $7.99.',
            pf:'Families save an average of $111 a month. Validated across 10,000 household profiles.',
            ct:'Lock in $7.99/month — 60% off forever' },
        b:{ sub:'7 days left to end the 6:30 PM wall. Forever.',
            pre:'Then it\'s over. Here\'s why.',
            hk:'7 days from now, the 6:30 PM panic has a system.',
            pr:'Early access opens July 1. The founding price closes with the first 5,000 spots. You\'ve been following this for three weeks.',
            ag:'Every night you wait is an evening that wasn\'t yours. Every week without the system costs 5 to 10 hours.',
            so:'Join the waitlist. Lock $7.99/month. Get early access July 1.',
            va:'Dinner decided. Groceries planned. Kitchen in command. The mental load — gone.',
            pf:'Built by first responders. Validated across 10,000 household profiles.',
            ct:'Join the founding family — lock in $7.99/month' }},

      { seq:3, n:3, num:17, day:26, stage:'urgency', feature:'urgency',
        dlA:'DL-EM-EC002-0017-A', slA:'seq3-e3-a', dlB:'DL-EM-EC002-0017-B', slB:'seq3-e3-b',
        a:{ sub:'Five apps replaced. One price. 5 days.',
            pre:'Five days to July 1.',
            hk:'Five apps replaced. One founding price. First 5,000 families. 5 days left.',
            pr:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. The full loop. $1,336/year average savings. 69.5% less food waste. Validated across 10,000 households.',
            ag:'$7.99/month. 60% off the standard $19.99. Founding price closes at 5,000 spots. Real scarcity.',
            so:'5 days to lock in. Early access July 1. Founding price closes at 5,000.',
            va:'$7.99/month to close the $111 leak. The math is obvious.',
            pf:'Validated across 10,000 household profiles. 9 patent-pending technologies. Built by first responders.',
            ct:'Lock in $7.99/month — 60% off forever' },
        b:{ sub:'5 days until the founding family window closes.',
            pre:'Last week before July 1.',
            hk:'5 days. The founding family window is closing.',
            pr:'You found easyChef Pro before it launched. You followed the invisible leak. You saw the loop close. You know what TRACK → PLAN → OPTIMIZE → COOK → SHOP does.',
            ag:'Every night you wait is still 20 minutes of 6:30 PM panic. Every day without the system costs $3.66.',
            so:'Join the founding family. Early access July 1. $7.99/month. The 6:30 PM wall — gone.',
            va:'Dinner figured out. Kitchen in command. Founding price locked. Forever.',
            pf:'Built by first responders. Validated across 10,000 household profiles.',
            ct:'Join the founding family — 5 days left' }},

      { seq:3, n:4, num:18, day:28, stage:'urgency', feature:'urgency',
        dlA:'DL-EM-EC002-0018-A', slA:'seq3-e4-a', dlB:'DL-EM-EC002-0018-B', slB:'seq3-e4-b',
        a:{ sub:'Four days. Founding price. Real scarcity.',
            pre:'Four days to July 1.',
            hk:'4 days. July 1 is real. The founding price closes when 5,000 spots fill.',
            pr:'You\'ve seen the full loop: TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One leak closed. $1,336/year average savings.',
            ag:'The standard price after 5,000: $19.99/month. The founding price: $7.99/month. 60% off. Forever. For the first 5,000 families only.',
            so:'4 days to lock in. Early access July 1. Founding price closes at 5,000.',
            va:'$1,336/year average savings. 69.5% less food waste. 30 minutes fridge to table. $7.99/month.',
            pf:'Validated across 10,000 household profiles. 9 patent-pending technologies. Built by first responders.',
            ct:'Lock in $7.99/month — 60% off forever' },
        b:{ sub:'Four days left to own 6:30 PM again.',
            pre:'Last urgency reminder.',
            hk:'4 days. The founding price closes when 5,000 spots fill.',
            pr:'You found easyChef Pro before the world did. You followed the invisible leak. You saw the loop close. Now you know what the app does.',
            ag:'Every night you wait is still 20 minutes of 6:30 PM panic. The founding family window is almost closed.',
            so:'Join the founding family. Early access July 1. $7.99/month. The 6:30 PM wall — gone.',
            va:'Dinner figured out. Kitchen in command. Founding price locked. Forever.',
            pf:'Built by first responders. Validated across 10,000 household profiles.',
            ct:'Join the founding family — 4 days left' }},

      { seq:3, n:5, num:19, day:30, stage:'cta',     feature:'launch',
        dlA:'DL-EM-EC002-0019-A', slA:'seq3-e5-a', dlB:'DL-EM-EC002-0019-B', slB:'seq3-e5-b',
        a:{ sub:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. Two days.',
            pre:'Two days to July 1.',
            hk:'Two days. The founding price closes when 5,000 spots fill. This is your second-to-last chance.',
            pr:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. $1,336/year average savings. 69.5% less food waste. Validated across 10,000 households.',
            ag:'$7.99/month to save $111/month. 60% off the standard $19.99. Forever. For the first 5,000 families only.',
            so:'Join today. Lock $7.99/month. Early access July 1.',
            va:'$1,336/year average savings. Yours. Starting July 1.',
            pf:'Validated across 10,000 household profiles. Built by first responders.',
            ct:'Join the founding family — last call at $7.99/month' },
        b:{ sub:'Two days. You were here first.',
            pre:'Second to last call.',
            hk:'You were here before everyone else. Two days left. The founding family window is almost closed.',
            pr:'You found easyChef Pro before the launch. You followed the invisible leak for four weeks. You\'re one of the first.',
            ag:'The founding price closes when 5,000 spots fill. After that: $19.99/month. The gap is yours to close today.',
            so:'Join the founding family. Early access July 1. Dinner figured out before you open the fridge. Forever.',
            va:'Founding family. Founding price. Kitchen in command.',
            pf:'Built by first responders. Validated across 10,000 household profiles.',
            ct:'Join the founding family — two days left' }},

      { seq:3, n:6, num:20, day:32, stage:'cta',     feature:'launch',
        dlA:'DL-EM-EC002-0020-A', slA:'seq3-e6-a', dlB:'DL-EM-EC002-0020-B', slB:'seq3-e6-b',
        a:{ sub:'Tomorrow your kitchen changes. Or it doesn\'t.',
            pre:'Last chance before launch.',
            hk:'Tomorrow. July 1. Early access opens. The founding price closes.',
            pr:'You\'ve had 32 days with the invisible leak. You know what $111 a month costs. You know what the system does.',
            ag:'Tomorrow you either close the leak — or you don\'t. The founding price — $7.99/month — closes with the 5,000 spots. Real scarcity. Not manufactured.',
            so:'Join the waitlist today. Your access opens tomorrow.',
            va:'$1,336/year average savings. 69.5% less food waste. Founded at $7.99.',
            pf:'Families save an average of $111 a month. Validated across 10,000 household profiles.',
            ct:'Join the founding family — last chance at $7.99/month' },
        b:{ sub:'Last chance for the founding family price.',
            pre:'Tomorrow: 6:30 PM panic ends. Or it doesn\'t.',
            hk:'The founding family window is almost closed. Tomorrow you get early access. Or you don\'t.',
            pr:'You found easyChef Pro before anyone else. You followed the invisible leak. The founding family window is closing.',
            ag:'5,000 spots. The first families to join lock $7.99/month forever. After that: $19.99/month.',
            so:'Join the founding family today. Early access July 1.',
            va:'Dinner decided. Kitchen in command. You were first.',
            pf:'Built by first responders. Validated across 10,000 household profiles.',
            ct:'Join the founding family — your last chance' }},

      // ── SEQ-4: CTA (2 emails, days 33,34) ────────────────────────────────────
      { seq:4, n:1, num:21, day:33, stage:'cta',     feature:'launch',
        dlA:'DL-EM-EC002-0021-A', slA:'seq4-e1-a', dlB:'DL-EM-EC002-0021-B', slB:'seq4-e1-b',
        a:{ sub:'$1,336 saved or lost. You choose tomorrow.',
            pre:'Tomorrow is the day.',
            hk:'Tomorrow. July 1. Early access opens.',
            pr:'You\'ve had 33 days with the invisible leak. You know what $111 a month costs. You know what the system does. Tomorrow you either close the leak — or you don\'t.',
            ag:'The founding price — $7.99/month — closes with the 5,000 spots. After that: $19.99/month standard.',
            so:'Join the waitlist today. Your access opens tomorrow.',
            va:'$1,336/year average savings. 69.5% less food waste. 30 minutes fridge to table. Founded at $7.99.',
            pf:'Families save an average of $111 a month. Validated across 10,000 household profiles.',
            ct:'Join the founding family — last chance at $7.99/month' },
        b:{ sub:'Tomorrow: the founding family door closes.',
            pre:'Your last 48 hours.',
            hk:'Tomorrow you get early access. Or the founding price closes without you.',
            pr:'You found easyChef Pro before anyone else. You followed the arc. The founding family window is closing.',
            ag:'5,000 spots. The first families lock $7.99/month forever. The rest pay $19.99.',
            so:'Join the founding family today. Early access July 1. Kitchen in command.',
            va:'Dinner decided. Kitchen in command. You were first.',
            pf:'Built by first responders. Validated across 10,000 household profiles.',
            ct:'Join the founding family — 48 hours left' }},

      { seq:4, n:2, num:22, day:34, stage:'cta',     feature:'launch',
        dlA:'DL-EM-EC002-0022-A', slA:'seq4-e2-a', dlB:'DL-EM-EC002-0022-B', slB:'seq4-e2-b',
        a:{ sub:'Final call. $7.99/month. 5,000 spots.',
            pre:'Tomorrow. July 1.',
            hk:'Final call. $7.99/month. 5,000 spots. July 1.',
            pr:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. $1,336/year average savings. 69.5% less food waste. Validated across 10,000 households.',
            ag:'After 5,000 spots: $19.99/month. The founding price closes today.',
            so:'This is your last email before launch. Join now. Your access opens tomorrow.',
            va:'$7.99/month to save $111/month. The math closes today.',
            pf:'Validated across 10,000 household profiles. 9 patent-pending technologies.',
            ct:'Lock in $7.99/month — final call' },
        b:{ sub:'Final call. Dinner figured out. Tomorrow.',
            pre:'July 1 is here.',
            hk:'Final call. The founding family window closes today.',
            pr:'You followed the invisible leak for five weeks. You watched TRACK → PLAN → OPTIMIZE → COOK → SHOP close the loop. You know what the app does.',
            ag:'After 5,000 spots: $19.99/month. The founding price closes today.',
            so:'This is your last email before launch. Join the founding family now.',
            va:'Dinner decided. Groceries planned. Kitchen in command. Tomorrow.',
            pf:'Built by first responders. Validated across 10,000 household profiles.',
            ct:'Join the founding family — final call' }},

      // ── SEQ-5: Launch Day (2 emails, day 35) ─────────────────────────────────
      { seq:5, n:1, num:23, day:35, stage:'launch',  feature:'launch',
        dlA:'DL-EM-EC002-0023-A', slA:'seq5-e1-a', dlB:'DL-EM-EC002-0023-B', slB:'seq5-e1-b',
        a:{ sub:'The app is live. The $111 leak — closed.',
            pre:'July 1. Here\'s your access.',
            hk:'It\'s July 1. easyChef Pro is live. Your founding family access is ready.',
            pr:'The invisible leak — closed. The 5-app fragmentation — replaced. TRACK → PLAN → OPTIMIZE → COOK → SHOP — one loop, one app, live today.',
            ag:'You were here before the launch. You know what $111 a month means. Today you get it back.',
            so:'Download easyChef Pro. Scan your first receipt. The loop starts now.',
            va:'Your pantry is tracked. Your week is planned. Your dinner is ready in 30 minutes. Your nutrition is scored. Your shopping list builds itself. $1,336/year average savings — yours.',
            pf:'Validated across 10,000 household profiles. 69.5% less food waste. Built by first responders.',
            ct:'Try easyChef Pro free for 7 days — no credit card' },
        b:{ sub:'July 1. You were first. Kitchen in command.',
            pre:'Your founding family access is ready.',
            hk:'You\'re in the founding family. July 1. easyChef Pro is live.',
            pr:'You found this before anyone else. You followed the invisible leak. You watched the loop close. Today you get founding family access.',
            ag:'Dinner is already figured out for tonight. TRACK → PLAN → OPTIMIZE → COOK → SHOP — the loop is running.',
            so:'Download easyChef Pro. Scan your first receipt. Your week builds itself.',
            va:'Founding family. Founding price. Kitchen in command. The 6:30 PM panic — permanently gone.',
            pf:'Built by first responders. Validated across 10,000 household profiles.',
            ct:'Try easyChef Pro free for 7 days — no credit card' }},

      { seq:5, n:2, num:24, day:35, stage:'launch',  feature:'launch',
        dlA:'DL-EM-EC002-0024-A', slA:'seq5-e2-a', dlB:'DL-EM-EC002-0024-B', slB:'seq5-e2-b',
        a:{ sub:'easyChef Pro is live. Start here.',
            pre:'July 1. Your first steps.',
            hk:'You\'re a founding family member. Here\'s how to close the $111 leak starting today.',
            pr:'Step 1: Download easyChef Pro. Step 2: Scan your first grocery receipt. TRACK logs everything instantly. Step 3: Watch PLAN build your week from what you own.',
            ag:'The $111 leak stops the moment TRACK sees your first receipt. $1,336/year average savings starts today.',
            so:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. The full loop. Yours.',
            va:'Founding price locked. $7.99/month. Forever. The leak is closed.',
            pf:'Validated across 10,000 household profiles. 69.5% less food waste. Built by first responders.',
            ct:'Try easyChef Pro free for 7 days — no credit card' },
        b:{ sub:'Your founding family access. Start here.',
            pre:'July 1. First steps for founding members.',
            hk:'You\'re founding family. Here\'s how to claim your kitchen starting today.',
            pr:'Step 1: Download easyChef Pro. Step 2: Scan your first grocery receipt. TRACK closes the leak. Step 3: PLAN builds your week before 6:30 PM arrives.',
            ag:'The 6:30 PM panic stops the moment TRACK knows what\'s in your fridge. Tonight\'s dinner is already decided.',
            so:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. One loop. Yours.',
            va:'Founding family. Founding price. $7.99/month forever. Kitchen in command.',
            pf:'Built by first responders. Validated across 10,000 household profiles.',
            ct:'Try easyChef Pro free for 7 days — no credit card' }}
    ];

    var emRows   = [];
    var dlEmRows = [];

    ED002.forEach(function(e) {
      var seqCode = 'SEQ-' + e.seq;
      var templ   = 'EC2026002-' + seqCode + '-E' + e.n;
      var nStr    = ('00' + e.num).slice(-3);
      var urlA    = _emUrlA(e.dlA, e.slA);
      var urlB    = _emUrlB(e.dlB, e.slB);

      emRows.push([
        'ec002-em-' + nStr + '-a',
        'EC-2026-002', seqCode, e.n,
        e.a.sub, e.a.pre, e.a.hk, e.a.pr, e.a.ag, e.a.so, e.a.va, e.a.pf,
        e.a.ct + '\n' + urlA,
        e.day, 'klaviyo_' + seqCode.toLowerCase() + '_budget_family',
        'draft', false, '', false, '',
        e.stage, 'savings', 'invisible-leak', 'budget-family', templ + '-A',
        JSON.stringify({ dl_id:e.dlA, utm_url:urlA, lp:'budget-family', segment:'budget_family', day:e.day })
      ]);

      emRows.push([
        'ec002-em-' + nStr + '-b',
        'EC-2026-002', seqCode, e.n,
        e.b.sub, e.b.pre, e.b.hk, e.b.pr, e.b.ag, e.b.so, e.b.va, e.b.pf,
        e.b.ct + '\n' + urlB,
        e.day, 'klaviyo_' + seqCode.toLowerCase() + '_super_mom',
        'draft', false, '', false, '',
        e.stage, 'time_relief', 'invisible-leak', 'super-mom', templ + '-B',
        JSON.stringify({ dl_id:e.dlB, utm_url:urlB, lp:'super-mom', segment:'super_mom', day:e.day })
      ]);

      dlEmRows.push([
        e.dlA, e.dlA + '|' + templ + '-A', 'EC-2026-002', 'Email',
        _LP2_A, 'email', 'email', 'ec-2026-002', 'active', now, '', 'system',
        'Email ' + seqCode + ' E' + e.n + ' — budget_family', 'budget_family', 'a', 'invisible-leak'
      ]);
      dlEmRows.push([
        e.dlB, e.dlB + '|' + templ + '-B', 'EC-2026-002', 'Email',
        _LP2_B, 'email', 'email', 'ec-2026-002', 'active', now, '', 'system',
        'Email ' + seqCode + ' E' + e.n + ' — super_mom', 'super_mom', 'b', 'invisible-leak'
      ]);
    });

    var emStart = emSheet.getLastRow() + 1;
    emSheet.getRange(emStart, 1, emRows.length, 26).setValues(emRows);
    results.push('✓ EmailSequences: ' + emRows.length + ' rows (24 emails × A+B)');

    // ── 7. Write all DL registry entries (social + email) ────────────────────
    var allDl   = dlSocRows.concat(dlEmRows);
    var dlStart = dlSheet.getLastRow() + 1;
    dlSheet.getRange(dlStart, 1, allDl.length, _CC_HDR.DeepLinkRegistry.length).setValues(allDl);
    results.push('✓ DeepLinkRegistry: ' + allDl.length + ' entries (' + dlSocRows.length + ' social + ' + dlEmRows.length + ' email)');

    Logger.log('[seedEC2026002] ' + results.join(' | '));
    return {
      ok: true, results: results,
      posts: spRows.length, emails: emRows.length,
      dl: allDl.length, al: alRows.length, vp: vpRows.length
    };

  } catch(e) {
    Logger.log('[seedEC2026002] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}
