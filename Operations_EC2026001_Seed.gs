// Operations_EC2026001_Seed.gs
// Seed function for EC-2026-001 "Pre-Launch Arc 2026 — The Invisible Leak"
// Run via doPost: { "action": "seed_ec_2026_001" }
// ─────────────────────────────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

function _ec001_platMap(t) {
  if (t === 'email')   return 'Email';
  if (t === 'tiktok')  return 'TikTok';
  if (t === 'youtube') return 'YouTube';
  return 'Facebook';
}

function _ec001_cta(stage) {
  var m = {
    'hook':    'Join the waitlist — early access July 1 · easychefpro.com/lp/waitlist-a',
    'problem': 'Join the waitlist — early access July 1 · easychefpro.com/lp/waitlist-a',
    'agitate': 'Join the waitlist — early access July 1 · easychefpro.com/lp/waitlist-a',
    'solve':   'Get early access · $7.99/month founding price · easychefpro.com/lp/waitlist-a',
    'value':   'Get early access free · easychefpro.com/lp/waitlist-a',
    'proof':   'Join the waitlist free — 5,000 founding spots · easychefpro.com/lp/waitlist-a',
    'urgency': 'Lock in $7.99/month — 60% off forever · easychefpro.com/lp/waitlist-a',
    'cta':     'Join the founding family · First 5,000 only · easychefpro.com/lp/waitlist-a',
    'launch':  'Get your access now · easychefpro.com/lp/waitlist-a'
  };
  return m[stage] || 'Join the waitlist — early access July 1 · easychefpro.com/lp/waitlist-a';
}

function _ec001_htags(feature, type) {
  if (type === 'email') return '';
  var base = '#easychefpro';
  var ft = {
    'problem':  '#grocerybudget #foodwaste #mealplanningfails #savemoney #kitchenlife #momlife',
    'TRACK':    '#pantryorganization #foodtracking #grocerybudget #reducefoodwaste #pantryapp #mealprep',
    'PLAN':     '#mealplanning #weeknightdinners #mealprep #familymeals #dinnerplanning',
    'OPTIMIZE': '#nutritiongoals #healthyeating #familynutrition #eatbetter #balancedmeals',
    'COOK':     '#easydinner #30minutemeals #weeknightcooking #familydinner #quickrecipes',
    'SHOP':     '#grocerylist #smartshopping #grocerybudget #savemoney #familybudget',
    'proof':    '#foodtech #kitchenapp #firstresponders #familyfood #innovation',
    'urgency':  '#earlyaccess #foundingfamily #limitedspots #presale',
    'launch':   '#kitchenincommand #foundingfamily #julyfirst #yourkitcheniscommand',
    'all':      '#mealplanningapp #kitchenapp #foodtech #familyfood'
  };
  var tags = ft[feature] || ft['proof'];
  if (type === 'tiktok') tags = tags + ' #momsoftiktok #cooktok #mealpreptok #kitchenhack #fyp';
  if (type === 'youtube') return '#mealplanningapp #foodwaste #kitchenapp #easychefpro';
  return base + ' ' + tags;
}

function _ec001_featureScene(f) {
  var m = {
    'TRACK':    'PHONE VISIBLE · TRACK screen · pantry inventory · expiry dates · receipt scan animation · clean organized UI',
    'PLAN':     'PHONE VISIBLE · PLAN screen · five dinners from what you own · meal calendar built automatically',
    'OPTIMIZE': 'PHONE VISIBLE · OPTIMIZE screen · six nutrition dimensions · FDA-grade data · no manual tracking required',
    'COOK':     'PHONE VISIBLE · COOK screen · 30-minute recipe from fridge items · step-by-step cooking view',
    'SHOP':     'PHONE VISIBLE · SHOP screen · list builds itself · 1-click to Walmart cart · 800k products',
    'all':      'PHONE VISIBLE · TRACK→PLAN→OPTIMIZE→COOK→SHOP loop visible · one app closes everything'
  };
  return m[f] || m['all'];
}

function _ec001_imgBrief(stage, feature, day) {
  var noPhone = (stage === 'hook' || stage === 'problem' || stage === 'agitate');
  var firstReveal = (!noPhone && stage === 'solve' && day <= 9);
  var phoneNote = noPhone
    ? 'NO PHONE in frame — problem must feel real before solution appears'
    : firstReveal
    ? 'PHONE APPEARS for first time — first reveal · TRACK pantry screen · warm lighting on device'
    : 'PHONE VISIBLE — outcomes not features';
  var sceneMap = {
    'hook':    'Warm kitchen · 6:30 PM clock visible · groceries on counter · five apps open on phone · recognition not defeat · quiet frustration',
    'problem': 'Kitchen counter · apps that do not talk to each other · quiet frustration · real not staged · receipts visible',
    'agitate': '$111 visual · expiring produce · ground beef · yogurt · spinach · $1,336 annual figure prominent · emotional weight without shame',
    'solve':   'TRACK pantry view · organized data · receipt scan animation · expiry alerts firing · first time it all clicks',
    'value':   _ec001_featureScene(feature),
    'proof':   '10,000 households · 69.5% less waste · $1,336 average savings · confident data not testimonials · built by first responders note',
    'urgency': '5,000 spots counter · $7.99 vs $19.99 price contrast · real scarcity not manufactured · clock or countdown visible',
    'cta':     'Woman on couch after dinner · kitchen clean behind her · kids settled · peace · phone in hand · founding family energy',
    'launch':  'July 1 feeling · kitchen in command · celebration without noise · woman confident · phone visible · TRACK→PLAN→OPTIMIZE→COOK→SHOP loop complete'
  };
  var scene = sceneMap[stage] || sceneMap['value'];
  return scene + ' · ' + phoneNote;
}

function _ec001_briefJson(stage, feature, day, hA, hB) {
  var noPhone = (stage === 'hook' || stage === 'problem' || stage === 'agitate');
  var firstReveal = (!noPhone && stage === 'solve' && day <= 9);
  var phoneRule = noPhone
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
    who_its_for:       'Super Mom — Money (ICP A: super_mom_money) + Time (ICP B: super_mom_time) · Primary pain: invisible grocery leak · $111/month · 5–10 hrs/week on food decisions',
    emotional_state:   stage + ' — ' + (noPhone ? 'problem awareness · recognition not defeat' : firstReveal ? 'first reveal · relief entering' : 'building toward founding family commitment'),
    funnel_position:   stage + ' · day ' + day + ' of 35 · campaign May 27–Jul 1 2026',
    what_not_to_show:  ['App UI before day 8', 'Smiling before problem acknowledged', 'Bright commercial lighting', 'Shame language — system is broken not her fault', 'Invented testimonials or names'],
    what_they_feel_next: noPhone ? 'Pause the scroll. Feel seen. That is my kitchen.' : firstReveal ? 'That is the fix. I want that.' : 'I am not waiting. This is for me.',
    scene_direction:   _ec001_imgBrief(stage, feature, day),
    hook_a:            hA,
    hook_b:            hB,
    icp_a:             'super_mom_money',
    icp_b:             'super_mom_time',
    theme:             'invisible-leak',
    campaign_id:       'EC-2026-001'
  });
}

function _ec001_date(day) {
  return new Date(new Date('2026-05-27T00:00:00').getTime() + (day - 1) * 86400000)
    .toISOString().split('T')[0];
}

// ── Main seed function ────────────────────────────────────────────────────────

function seedEC2026001() {
  try {
    var results = [];

    // ── 1. Campaign Brief ────────────────────────────────────────────────────
    setCampaignBrief({
      id:               'EC-2026-001',
      name:             'Pre-Launch Arc 2026 — The Invisible Leak',
      icp_code:         'super_mom',
      blueprint:        'A-Waitlist',
      launch_date:      '2026-07-01',
      status:           'active',
      post_count:       35,
      post_frequency:   'daily',
      email_sequences:  4,
      theme:            'invisible-leak',
      publish_day:      'daily',
      channels:         ['Facebook','Instagram','TikTok','YouTube','Email'],
      ab_test:          true,
      ab_tool:          'convert.com',
      ab_split:         '50/50',
      lp_slug_a:        'lp/waitlist-a',
      lp_slug_b:        'lp/waitlist-b',
      ab_experiment_id: '100140422',
      campaign_angle:   'savings',
      urgency_trigger:  'First 5,000 families lock in $7.99/month forever',
      notes:            'EC-2026-001 · May 27–Jul 1 2026 · invisible-leak arc · replaces taco-tuesday'
    });
    results.push('✓ CampaignBrief EC-2026-001 updated');

    // ── 2. Theme Library ─────────────────────────────────────────────────────
    setThemeLibraryRow({
      id:               'invisible-leak',
      icp_code:         'super_mom',
      theme_name:       'The Invisible Leak',
      theme_slug:       'invisible-leak',
      category:         'pre-launch',
      emotional_entry:  'recognition — she knows the leak exists, she just has not named it',
      emotional_payoff: 'relief — the leak is closed in dollars and evenings',
      hook_angle:       'You have an invisible leak. It costs $111 a month. Five apps were never going to fix it.',
      problem_angle:    'Five apps. None of them talk to each other. The leak runs in the gap between them.',
      agitate_angle:    'The spinach. The ground beef. The yogurt. $111 gone. Every month. No system.',
      food_type:        'whatever is already in your fridge — expiring produce · ground beef · yogurt · the groceries that never became dinner',
      publish_day:      'daily',
      post_count:       35,
      blueprint_code:   'A-Waitlist',
      campaign_angle:   'savings',
      urgency_trigger:  'First 5,000 families lock in $7.99/month forever',
      image_mood_hook:  'Warm kitchen 6:30 PM · groceries on counter · five apps open on phone · clock visible · recognition not defeat',
      image_mood_cta:   'Woman on couch after dinner · kitchen clean behind her · kids settled · peace · phone in hand',
      active:           true,
      notes:            'EC-2026-001 · May 27–Jul 1 2026 · replaces taco-tuesday',
      app_feature:      'TRACK → PLAN → OPTIMIZE → COOK → SHOP',
      app_screen_label: 'Wk2: Pantry · Wk3: Meal plan + Nutrition score · Wk4: Recipe + 1-click shopping',
      feature_hook:     'Five apps never closed the loop. One does. TRACK → PLAN → OPTIMIZE → COOK → SHOP.',
      feature_proof:    '$1,336/year average savings · 69.5% less food waste · 30 minutes fridge to table · validated across 10,000 household profiles',
      persona_rotation: 'super_mom_money · super_mom_time'
    });
    results.push('✓ Theme seeded: invisible-leak');

    // ── 3. ICP Profiles ──────────────────────────────────────────────────────
    var now = _ccNow();

    setIcpProfile({
      id:                  'super_mom_money',
      name:                'Super Mom — Money Angle',
      code:                'super_mom_money',
      status:              'Active',
      demographics:        'Female · 28–44 · married · 2–3 kids · HHI $40–85K · suburban · primary grocery buyer · budget-tracker',
      psychographics:      'Financially aware. Responds to dollar figures before emotional scenes. Loss aversion is financial first. Will calculate ROI before she feels the feeling.',
      primary_pain:        'The invisible leak — $111/month in groceries that expire before they become dinner',
      secondary_pain:      '6:30 PM decision fatigue — real but secondary. She would fix the money first.',
      value_trigger:       '$1,336 back without couponing. $7.99/month to save $111/month. She sees it in one line.',
      loss_aversion:       'Every dollar in the bin is a dollar her family does not have. Every day she waits costs $3.66.',
      channel_affinity:    'Facebook — budget mom groups · Email — money subject lines · Pinterest — budget meals',
      message_hierarchy:   '1.$1,336/year · 2.$111/month · 3.30 min from what you have · 4.one app closes the loop · 5.built by first responders',
      conversion_triggers: '$1,336 figure · $7.99 to save $111 ROI · 10,000 households validated · 7-day free trial',
      utm_campaign_codes:  'fb_super_mom_money · seq1_welcome · seq2_nurture · seq3_urgency · seq4_launch_day',
      lp_variants:         '/lp/waitlist-a · hero_variant: problem_state · angle: savings',
      validated:           true,
      validation_notes:    'Sub-segment of super_mom · LP A · EXP-001 Variant A',
      created_at:          now,
      updated_at:          now
    });

    setIcpProfile({
      id:                  'super_mom_time',
      name:                'Super Mom — Time + Founding Family',
      code:                'super_mom_time',
      status:              'Active',
      demographics:        'Female · 28–44 · partnered · 2–3 kids · HHI $55–100K · suburban · household logistics manager · food delivery user',
      psychographics:      'Carries full mental load of food decisions. Wants dinner decided before she opens the fridge. Founding family identity resonates — she likes being first.',
      primary_pain:        'The 6:30 PM wall — 5–10 hours a week deciding what to eat, none of it connected',
      secondary_pain:      'Food waste — real but not her primary entry. She notices $1,336 but it is not what makes her sign up.',
      value_trigger:       'Dinner decided before she opens the fridge. The mental load — gone. Founding family — she found it first.',
      loss_aversion:       'Every night she wings it is an evening she did not choose for her family.',
      channel_affinity:    'Facebook — lifestyle + mom groups · Instagram — aspirational food/home · Email — time/relief and founding family subject lines',
      message_hierarchy:   '1.dinner decided before you open the fridge · 2.founding family identity · 3.$1,336 savings · 4.$7.99 founding price · 5.built by first responders',
      conversion_triggers: 'Relief framing · founding family identity · first 5,000 scarcity · 7-day free trial',
      utm_campaign_codes:  'fb_super_mom · seq1_welcome · seq2_nurture · seq3_urgency · seq4_launch_day',
      lp_variants:         '/lp/waitlist-b · hero_variant: founding_narrative · angle: time_relief',
      validated:           true,
      validation_notes:    'Sub-segment of super_mom · LP B · EXP-001 Variant B',
      created_at:          now,
      updated_at:          now
    });
    results.push('✓ ICP profiles seeded: super_mom_money + super_mom_time');

    // ── 4. LP Inventory ──────────────────────────────────────────────────────
    setLPInventoryEntry({
      id:                 'lp-waitlist-a',
      slug:               'lp/waitlist-a',
      full_url:           'https://easychefpro.com/lp/waitlist-a',
      campaign_type:      'Waitlist',
      blueprint_code:     'A-Waitlist',
      icp_codes:          'super_mom_money',
      campaign_angle:     'savings',
      lp_variant:         'A',
      headline:           'Stop the mealtime madness.',
      cta_primary:        'Join the waitlist — early access July 1',
      proof_bar:          '$1,336/year average savings · 30 minutes fridge to table · 69.5% less food waste',
      status:             'PENDING_DEV',
      dev_built:          false,
      convert_installed:  false,
      clarity_installed:  false,
      ga4_installed:      false,
      campaigns_using:    'EC-2026-001',
      total_signups:      0,
      notes:              'ICP: super_mom_money · theme: invisible-leak · ab: 100140422 · thank-you: /thank-you?src=waitlist-a',
      urgency_type:       'founding-price',
      urgency_line:       'First 5,000 families lock in $7.99/month forever. The rest pay $19.99.',
      urgency_placement:  'below-hero',
      exclusivity_angle:  'founding-family',
      exclusivity_line:   'You are not just joining an app. You are founding the kitchen of the future.',
      meta_title:         'Stop the Invisible Grocery Leak · easyChef Pro',
      meta_description:   'Stop wasting $111/month on groceries that expire. easyChef Pro closes the loop — TRACK → PLAN → COOK → SHOP. Free to join.',
      og_title:           'Stop the Invisible Grocery Leak · easyChef Pro',
      og_description:     '$1,336/year back. 30 minutes fridge to table. 69.5% less food waste. Join free.',
      canonical_url:      'https://easychefpro.com/lp/waitlist-a',
      focus_keyword:      'meal planning app save money groceries'
    });

    setLPInventoryEntry({
      id:                 'lp-waitlist-b',
      slug:               'lp/waitlist-b',
      full_url:           'https://easychefpro.com/lp/waitlist-b',
      campaign_type:      'Waitlist',
      blueprint_code:     'A-Waitlist',
      icp_codes:          'super_mom_time',
      campaign_angle:     'time_relief',
      lp_variant:         'B',
      headline:           'Daily Dinner Figured Out.',
      cta_primary:        'Get Early Access',
      proof_bar:          '$1,336/year average savings · 30 minutes fridge to table · 69.5% less food waste',
      status:             'PENDING_DEV',
      dev_built:          false,
      convert_installed:  false,
      clarity_installed:  false,
      ga4_installed:      false,
      campaigns_using:    'EC-2026-001',
      total_signups:      0,
      notes:              'ICP: super_mom_time · theme: invisible-leak · ab: 100140422 · thank-you: /thank-you?src=waitlist-b · BLOCKER — build by May 27',
      urgency_type:       'founding-price',
      urgency_line:       'First 5,000 founding families. The founding price closes when spots fill.',
      urgency_placement:  'below-hero',
      exclusivity_angle:  'founding-family',
      exclusivity_line:   'You found this before everyone else. That means something.',
      meta_title:         'Daily Dinner Figured Out · easyChef Pro',
      meta_description:   'Dinner decided before you open the fridge. easyChef Pro — the meal management system for working families. Get early access.',
      og_title:           'Daily Dinner Figured Out · easyChef Pro',
      og_description:     'Dinner decided. Groceries planned. Kitchen in command. Join the founding family.',
      canonical_url:      'https://easychefpro.com/lp/waitlist-b',
      focus_keyword:      'meal planning app family dinner ideas'
    });
    results.push('✓ LP Inventory seeded: lp-waitlist-a + lp-waitlist-b');

    // ── 5. Social Posts — clear EC-2026-001, then batch-append 51 posts ──────
    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var spLast  = spSheet.getLastRow();
    if (spLast >= 2) {
      var spCids = spSheet.getRange(2, 1, spLast - 1, 2).getValues();
      for (var di = spCids.length - 1; di >= 0; di--) {
        if (String(spCids[di][1]) === 'EC-2026-001') spSheet.deleteRow(di + 2);
      }
    }

    var postData = [
      // ── WEEK 1 · Introduce the leak ──────────────────────────────────────────
      {day:1,  stage:'hook',    type:'social',  feature:'problem',  hA:'You have an invisible leak. $111 a month.',                 hB:'6:30 PM. Fridge full. Five apps open. Still no dinner.'},
      {day:2,  stage:'hook',    type:'social',  feature:'problem',  hA:'$111/month disappearing from your grocery budget.',          hB:'That 6:30 PM wall. Every single night.'},
      {day:3,  stage:'problem', type:'email',   feature:'problem',  hA:'Throwing away $111 every month (not your fault)',            hB:'Six apps open. Groceries on the counter. Nothing for dinner.'},
      {day:3,  stage:'problem', type:'social',  feature:'problem',  hA:'Five apps. None of them talk to each other.',                hB:"Mealime doesn't know your pantry. No app closes the loop."},
      {day:4,  stage:'hook',    type:'tiktok',  feature:'TRACK',    hA:'TK-1 · TRACK · "$1,336 in your fridge right now."',         hB:''},
      {day:5,  stage:'agitate', type:'social',  feature:'problem',  hA:'The spinach. The ground beef. The yogurt. $111 gone.',       hB:'DoorDash again. The groceries sit untouched.'},
      {day:6,  stage:'agitate', type:'email',   feature:'problem',  hA:'$1,336 thrown away every year',                             hB:'What if dinner was decided before you opened the fridge?'},
      {day:6,  stage:'agitate', type:'social',  feature:'problem',  hA:'$1,336. Every year. Food you bought. Never ate.',            hB:'5–10 hours a week deciding what to eat. That time is yours.'},
      {day:7,  stage:'agitate', type:'youtube', feature:'problem',  hA:'YT-1 · The Problem · 60 seconds',                           hB:''},
      // ── WEEK 2 · TRACK replaces NoWaste ──────────────────────────────────────
      {day:8,  stage:'solve',   type:'email',   feature:'TRACK',    hA:'$1,336 back in your pocket this year',                      hB:"The grocery leak that's draining your budget"},
      {day:8,  stage:'solve',   type:'social',  feature:'TRACK',    hA:'TRACK. Your pantry, finally tracked. The leak starts here.', hB:"easyChef Pro knows what's in your fridge before it expires."},
      {day:9,  stage:'value',   type:'social',  feature:'TRACK',    hA:'Scan your receipt. Every item tracked. Expiry fires first.', hB:'The app caught the spinach before you did.'},
      {day:10, stage:'value',   type:'social',  feature:'TRACK',    hA:'No more buying what you already have.',                      hB:'The pantry knows. You never duplicate again.'},
      {day:11, stage:'value',   type:'tiktok',  feature:'PLAN',     hA:'TK-2 · PLAN · "One Sunday. Five dinners. From what you have."', hB:''},
      {day:12, stage:'value',   type:'email',   feature:'TRACK',    hA:'$111 back every month with 30-minute dinners',               hB:'30 minutes from fridge panic to family dinner'},
      {day:12, stage:'proof',   type:'social',  feature:'TRACK',    hA:'69.5% less food waste. $111/month back. Validated.',         hB:'The leak is measurable. The fix is proven.'},
      {day:13, stage:'value',   type:'social',  feature:'TRACK',    hA:'TRACK replaced your pantry app. And connects to everything.', hB:'One app. The pantry feeds the plan feeds the recipe.'},
      {day:14, stage:'proof',   type:'social',  feature:'TRACK',    hA:'9 patent-pending technologies. Validated across 10,000 households.', hB:'Built by first responders. Not Silicon Valley.'},
      // ── WEEK 3 · PLAN + OPTIMIZE ─────────────────────────────────────────────
      {day:15, stage:'value',   type:'email',   feature:'PLAN',     hA:'$1,336 of groceries thrown away every year',                 hB:'That spinach you bought Sunday is brown today'},
      {day:15, stage:'value',   type:'social',  feature:'PLAN',     hA:'Your pantry auto-builds the meal plan. No manual entry.',    hB:'PLAN replaced your meal planner. It knows what you already have.'},
      {day:16, stage:'value',   type:'social',  feature:'PLAN',     hA:'Monday: salmon. Tuesday: tacos. From what you paid for.',    hB:'Five dinners planned from what you already own.'},
      {day:17, stage:'value',   type:'tiktok',  feature:'OPTIMIZE', hA:'TK-3 · OPTIMIZE · "Six nutrition scores. Every meal. No logging."', hB:''},
      {day:17, stage:'value',   type:'social',  feature:'OPTIMIZE', hA:'Every meal scored across 6 nutrition dimensions. FDA-grade. No manual tracking.', hB:'OPTIMIZE replaced your nutrition app. Scores from your actual fridge.'},
      {day:18, stage:'value',   type:'email',   feature:'PLAN',     hA:'That $111 you threw away last month',                        hB:'Every expired yogurt is $3 down the drain'},
      {day:18, stage:'value',   type:'social',  feature:'OPTIMIZE', hA:'Registered dietitians validated every recipe. 6 dimensions. Every meal.', hB:'No app scored your nutrition from your pantry before.'},
      {day:19, stage:'value',   type:'social',  feature:'PLAN',     hA:'PLAN and OPTIMIZE talking to each other.',                   hB:'Two apps replaced. Three to go. One loop building.'},
      {day:20, stage:'proof',   type:'social',  feature:'proof',    hA:'800,000 products. 9 patent-pending technologies.',           hB:'Built by first responders who needed this as much as you do.'},
      {day:21, stage:'proof',   type:'email',   feature:'proof',    hA:'$1,336 savings ends July 1st',                               hB:'4 days left to escape 6:30 PM panic'},
      {day:21, stage:'solve',   type:'youtube', feature:'all',      hA:'YT-2 · The Solution · TRACK→PLAN→OPTIMIZE→COOK→SHOP',       hB:''},
      // ── WEEK 4 · COOK + SHOP + URGENCY ───────────────────────────────────────
      {day:22, stage:'value',   type:'email',   feature:'COOK',     hA:'5,000 founding spots. The window is closing.',               hB:'You have been deciding for 3 weeks. Here is what that costs.'},
      {day:22, stage:'value',   type:'tiktok',  feature:'COOK',     hA:"TK-4 · COOK · \"30 minutes. From what's in your fridge.\"",  hB:''},
      {day:22, stage:'value',   type:'social',  feature:'COOK',     hA:"COOK turns your fridge into tonight's recipe. 30 minutes.",  hB:'easyChef Pro replaced your recipe app. Already knows what you have.'},
      {day:23, stage:'value',   type:'social',  feature:'COOK',     hA:'10,000 recipe pages at launch. All from what you own.',      hB:'30 minutes. From the fridge you already have.'},
      {day:24, stage:'urgency', type:'email',   feature:'urgency',  hA:'$7.99 founding price ends in 10 days',                       hB:'Your kitchen panic has 10 days left'},
      {day:24, stage:'urgency', type:'social',  feature:'urgency',  hA:'$7.99/month. 60% off. Founding price closes at 5,000.',      hB:'Two leaks closing — your grocery budget AND this price.'},
      {day:25, stage:'value',   type:'social',  feature:'SHOP',     hA:'1-click shopping. The list builds itself.',                  hB:'Never buy what you already have again.'},
      {day:26, stage:'value',   type:'tiktok',  feature:'SHOP',     hA:"TK-5 · SHOP · \"The list builds itself. 1-click to your cart.\"", hB:''},
      {day:26, stage:'value',   type:'social',  feature:'SHOP',     hA:'800,000 products. 1-click shopping. Done.',                  hB:"Shopping used to take 45 minutes. Now it's one click."},
      {day:27, stage:'urgency', type:'email',   feature:'urgency',  hA:'$1,336 savings ends July 1st',                               hB:'4 days left to escape 6:30 PM panic'},
      {day:27, stage:'urgency', type:'social',  feature:'urgency',  hA:'Five apps replaced. One leak closed. 4 days left.',          hB:'Every night you wing it is $3.66. Price goes up in 4 days.'},
      {day:28, stage:'urgency', type:'social',  feature:'urgency',  hA:'$7.99 or $19.99. You decide before July 1.',                 hB:'The founding family window is closing.'},
      // ── WEEK 5 · Launch ──────────────────────────────────────────────────────
      {day:29, stage:'cta',     type:'email',   feature:'launch',   hA:'$1,336 saved or lost — you choose tomorrow',                 hB:'Tomorrow: 6:30 PM panic returns forever'},
      {day:29, stage:'cta',     type:'social',  feature:'launch',   hA:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. One loop. July 1.',   hB:'The founding family window is almost closed.'},
      {day:30, stage:'cta',     type:'social',  feature:'launch',   hA:'You are founding the kitchen of the future.',                hB:'You found this before everyone else.'},
      {day:31, stage:'cta',     type:'social',  feature:'launch',   hA:'Five apps replaced. One founding price. First 5,000 only.',  hB:'Dinner figured out before you open the fridge. Forever.'},
      {day:32, stage:'cta',     type:'social',  feature:'launch',   hA:'Founding price closes at 5,000 families.',                   hB:'Real scarcity. Not manufactured.'},
      {day:33, stage:'proof',   type:'social',  feature:'proof',    hA:'10,000 households. 69.5% less waste. The leak is gone.',      hB:'Real outcomes. Real kitchens.'},
      {day:34, stage:'cta',     type:'social',  feature:'launch',   hA:'Tomorrow your kitchen changes.',                             hB:'July 1. The loop closes. Your kitchen is in command.'},
      {day:35, stage:'launch',  type:'email',   feature:'launch',   hA:'The app is live. Your kitchen is in command.',               hB:'July 1. You were first. Here is your access.'},
      {day:35, stage:'launch',  type:'youtube', feature:'launch',   hA:'YT-3 · Launch Day · The leak is closed.',                    hB:''},
      {day:35, stage:'launch',  type:'social',  feature:'launch',   hA:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. Live. Now.',          hB:'Your kitchen. In command. July 1.'}
    ];

    var spHdrLen = _CC_HDR.SocialPosts.length; // 16
    var newRows = postData.map(function(r, idx) {
      var id    = 'ec001-sp-' + ('000' + (idx + 1)).slice(-3);
      var brief = _ec001_briefJson(r.stage, r.feature, r.day, r.hA, r.hB);
      return [
        id,
        'EC-2026-001',
        _ec001_platMap(r.type),
        r.hA,
        '',                           // body_copy — filled by Campaign Kickstart
        _ec001_cta(r.stage),
        _ec001_htags(r.feature, r.type),
        _ec001_imgBrief(r.stage, r.feature, r.day),
        '',                           // image_url
        _ec001_date(r.day),
        '08:00',
        'draft',
        '',                           // dl_id — assigned from DeepLinkRegistry
        '',                           // utm_url — built after dl_id activated
        '',                           // posted_url
        brief                         // design_brief JSON — generateBriefDocs reads this
      ];
    });

    var spWriteStart = spSheet.getLastRow() + 1;
    spSheet.getRange(spWriteStart, 1, newRows.length, spHdrLen).setValues(newRows);
    results.push('✓ Social posts seeded: ' + newRows.length + ' posts (days 1–35 · May 27–Jun 30)');

    Logger.log('[seedEC2026001] ' + results.join(' | '));
    return { ok: true, results: results, post_count: newRows.length };

  } catch(e) {
    Logger.log('[seedEC2026001] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}
