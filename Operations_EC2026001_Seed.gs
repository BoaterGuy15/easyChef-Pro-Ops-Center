// Operations_EC2026001_Seed.gs
// Seed function for EC-2026-001 "Pre-Launch Arc 2026 — The Invisible Leak"
// Run via doPost: { "action": "seed_ec_2026_001" }
// ─────────────────────────────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────────

function _ec001_platMap(t) {
  if (t === 'email')     return 'Email';
  if (t === 'tiktok')    return 'TikTok';
  if (t === 'youtube')   return 'YouTube';
  if (t === 'instagram') return 'Instagram';
  if (t === 'x')         return 'X';
  if (t === 'pinterest') return 'Pinterest';
  if (t === 'nextdoor')  return 'Nextdoor';
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
  if (type === 'email' || type === 'pinterest' || type === 'nextdoor') return '';
  if (type === 'youtube') return '#mealplanningapp #foodwaste #kitchenapp #easychefpro';
  if (type === 'x') return '#easychefpro #mealplanning #foodwaste';
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
  if (type === 'tiktok')    tags = tags + ' #momsoftiktok #cooktok #mealpreptok #kitchenhack #fyp';
  if (type === 'instagram') tags = tags + ' #instafood #momstagram #mealprepping #foodblogger #kitchenlife';
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
  // Day 1 = May 27, Day 35 = June 30 → Day 36 = July 1
  // Use Date.UTC so no server timezone can shift the result
  var d = new Date(Date.UTC(2026, 4, 27) + (day - 1) * 86400000);
  return Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd');
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
      post_count:       218,
      post_frequency:   'daily',
      email_sequences:  4,
      theme:            'invisible-leak',
      publish_day:      'daily',
      channels:         ['Facebook','Instagram','X','Pinterest','Nextdoor','TikTok','YouTube','Email'],
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
      meta_description:   'Stop wasting $111/month on groceries that expire. easyChef Pro closes the loop — TRACK → PLAN → OPTIMIZE → COOK → SHOP. Free to join.',
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

    // ── 218 posts: 6 platforms × 35 days + 5 TikTok spotlights + 3 YouTube spotlights ──
    var _ARC = [
      {day:1,  stage:'hook',    feature:'problem',  hA:'You have an invisible leak. $111 a month.',                  hB:'6:30 PM. Fridge full. Five apps open. Still no dinner.'},
      {day:2,  stage:'hook',    feature:'problem',  hA:'$111/month disappearing from your grocery budget.',           hB:'That 6:30 PM wall. Every single night.'},
      {day:3,  stage:'problem', feature:'problem',  hA:'Five apps. None of them talk to each other.',                 hB:"Mealime doesn't know your pantry. No app closes the loop."},
      {day:4,  stage:'problem', feature:'problem',  hA:"You buy groceries Sunday. By Wednesday it's a guessing game.", hB:'Dinner is already decided by 6:30 PM — or it isn\'t.'},
      {day:5,  stage:'agitate', feature:'problem',  hA:'The spinach. The ground beef. The yogurt. $111 gone.',        hB:'DoorDash again. The groceries sit untouched.'},
      {day:6,  stage:'agitate', feature:'problem',  hA:'$1,336. Every year. Food you bought. Never ate.',             hB:'5–10 hours a week deciding what to eat. That time is yours.'},
      {day:7,  stage:'agitate', feature:'problem',  hA:"The leak is invisible. The cost isn't. $111/month.",          hB:'The 6:30 PM wall is a system problem. Not a you problem.'},
      {day:8,  stage:'solve',   feature:'TRACK',    hA:'TRACK. Your pantry, finally tracked. The leak starts here.',  hB:"easyChef Pro knows what's in your fridge before it expires."},
      {day:9,  stage:'value',   feature:'TRACK',    hA:'Scan your receipt. Every item tracked. Expiry fires first.',  hB:'The app caught the spinach before you did.'},
      {day:10, stage:'value',   feature:'TRACK',    hA:'No more buying what you already have.',                       hB:'The pantry knows. You never duplicate again.'},
      {day:11, stage:'value',   feature:'TRACK',    hA:'TRACK replaced NoWaste — and it does more.',                  hB:'The leak starts in your pantry. TRACK closes it.'},
      {day:12, stage:'value',   feature:'TRACK',    hA:'69.5% less food waste. $111/month back. Validated.',          hB:'The leak is measurable. The fix is proven.'},
      {day:13, stage:'value',   feature:'TRACK',    hA:'TRACK connects to everything. PLAN sees your pantry.',        hB:'One app. The pantry feeds the plan feeds the recipe.'},
      {day:14, stage:'proof',   feature:'proof',    hA:'9 patent-pending technologies. Validated across 10,000 households.', hB:'Built by first responders. Not Silicon Valley.'},
      {day:15, stage:'value',   feature:'PLAN',     hA:'Your pantry auto-builds the meal plan. No manual entry.',     hB:'PLAN replaced your meal planner. It knows what you already have.'},
      {day:16, stage:'value',   feature:'PLAN',     hA:'Monday: salmon. Tuesday: tacos. From what you paid for.',     hB:'Five dinners planned from what you already own.'},
      {day:17, stage:'value',   feature:'PLAN',     hA:'PLAN and OPTIMIZE together. Two apps replaced.',              hB:'Dinner planned. Nutrition scored. Zero manual entry.'},
      {day:18, stage:'value',   feature:'OPTIMIZE', hA:'Every meal scored across 6 nutrition dimensions. FDA-grade. No manual tracking.', hB:'OPTIMIZE replaced your nutrition app. Scores from your actual fridge.'},
      {day:19, stage:'value',   feature:'OPTIMIZE', hA:'Registered dietitians validated every recipe. 6 dimensions. Every meal.', hB:'No app scored your nutrition from your pantry before.'},
      {day:20, stage:'proof',   feature:'proof',    hA:'800,000 products. 9 patent-pending technologies.',            hB:'Built by first responders who needed this as much as you do.'},
      {day:21, stage:'proof',   feature:'all',      hA:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. The full loop.',      hB:'Five apps replaced. The 6:30 PM panic — gone.'},
      {day:22, stage:'urgency', feature:'urgency',  hA:'5,000 founding spots. The window is closing.',                hB:"You've been deciding for 3 weeks. Here's what that costs."},
      {day:23, stage:'value',   feature:'COOK',     hA:"COOK turns your fridge into tonight's recipe. 30 minutes.",   hB:"easyChef Pro replaced your recipe app. Already knows what you have."},
      {day:24, stage:'urgency', feature:'urgency',  hA:'$7.99/month. 60% off. Founding price closes at 5,000.',       hB:'Two leaks closing — your grocery budget AND this price.'},
      {day:25, stage:'value',   feature:'SHOP',     hA:'1-click shopping. The list builds itself.',                   hB:'Never buy what you already have again.'},
      {day:26, stage:'value',   feature:'SHOP',     hA:'800,000 products. 1-click shopping. Done.',                   hB:"Shopping used to take 45 minutes. Now it's one click."},
      {day:27, stage:'urgency', feature:'urgency',  hA:'Five apps replaced. One leak closed. 4 days left.',           hB:'Every night you wing it is $3.66. Price goes up in 4 days.'},
      {day:28, stage:'urgency', feature:'urgency',  hA:'$7.99 or $19.99. You decide before July 1.',                  hB:'The founding family window is closing.'},
      {day:29, stage:'cta',     feature:'launch',   hA:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. One loop. July 1.',    hB:'The founding family window is almost closed.'},
      {day:30, stage:'cta',     feature:'launch',   hA:'You are founding the kitchen of the future.',                 hB:'You found this before everyone else.'},
      {day:31, stage:'cta',     feature:'launch',   hA:'Five apps replaced. One founding price. First 5,000 only.',   hB:'Dinner figured out before you open the fridge. Forever.'},
      {day:32, stage:'cta',     feature:'launch',   hA:'Founding price closes at 5,000 families. Real scarcity.',     hB:'The founding family window is closing.'},
      {day:33, stage:'proof',   feature:'proof',    hA:'10,000 households. 69.5% less waste. The leak is gone.',      hB:'Real outcomes. Real kitchens.'},
      {day:34, stage:'cta',     feature:'launch',   hA:'Tomorrow your kitchen changes.',                              hB:'July 1. The loop closes. Your kitchen is in command.'},
      {day:35, stage:'launch',  feature:'launch',   hA:'TRACK → PLAN → OPTIMIZE → COOK → SHOP. Live. Now.',          hB:'Your kitchen. In command. July 1.'}
    ];

    var _DAILY_TYPES = ['facebook','instagram','pinterest','nextdoor','x','email'];
    var postData = [];

    // 6 platforms × 35 days = 210 rows
    _ARC.forEach(function(d) {
      _DAILY_TYPES.forEach(function(t) {
        postData.push({day:d.day, stage:d.stage, feature:d.feature, type:t, hA:d.hA, hB:d.hB});
      });
    });

    // TikTok spotlights — days 4, 11, 17, 22, 26
    postData.push({day:4,  stage:'solve',  feature:'TRACK',    type:'tiktok', hA:'TK-1 · TRACK · "$1,336 in your fridge right now."',              hB:''});
    postData.push({day:11, stage:'value',  feature:'PLAN',     type:'tiktok', hA:'TK-2 · PLAN · "One Sunday. Five dinners. From what you have."',   hB:''});
    postData.push({day:17, stage:'value',  feature:'OPTIMIZE', type:'tiktok', hA:'TK-3 · OPTIMIZE · "Six nutrition scores. Every meal. No logging."', hB:''});
    postData.push({day:22, stage:'value',  feature:'COOK',     type:'tiktok', hA:"TK-4 · COOK · \"30 minutes. From what's in your fridge.\"",       hB:''});
    postData.push({day:26, stage:'value',  feature:'SHOP',     type:'tiktok', hA:'TK-5 · SHOP · "The list builds itself. 1-click to your cart."',   hB:''});

    // YouTube spotlights — days 7, 21, 35
    postData.push({day:7,  stage:'agitate', feature:'problem', type:'youtube', hA:'YT-1 · The Problem · 60 seconds · the invisible leak',            hB:''});
    postData.push({day:21, stage:'proof',   feature:'all',     type:'youtube', hA:'YT-2 · The Solution · TRACK→PLAN→OPTIMIZE→COOK→SHOP',            hB:''});
    postData.push({day:35, stage:'launch',  feature:'launch',  type:'youtube', hA:'YT-3 · Launch Day · The leak is closed.',                          hB:''});

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

// ── Update EC-2026-001 post details ───────────────────────────────────────────
// Adds locked image briefs, hashtags, DL IDs, and UTM URLs to all 51 posts.
// Run via doPost: { "action": "update_ec2026001_post_details" }

function updateEC2026001PostDetails() {
  try {
    var results = [];
    var now = _ccNow();

    // ── Locked image brief data per funnel stage ──────────────────────────────
    var _IB = {
      hook: {
        phone_rule: 'NO PHONE',
        subject:    'Woman 32 — ponytail — leggings — mid-decision energy — not defeated — capable but the system has no answer tonight',
        action:     'Standing at kitchen counter — groceries visible — phone beside them showing multiple apps — in motion not frozen',
        food:       'Spinach — ground beef — yogurt — random produce — none of it connected to a meal plan',
        depth:      'Foreground: counter with groceries — midground: woman — background: warm kitchen 6:30 PM light',
        camera:     'Medium shot — straight on — warm natural kitchen light — never staged or dark'
      },
      problem: {
        phone_rule: 'NO PHONE',
        subject:    'Phone on counter showing 5 app icons open — Mealime — a nutrition tracker — a recipe app — a pantry app — a list app',
        action:     'Groceries beside the phone — nothing connected — the fragmentation is the story',
        food:       'Groceries visible but not organised into a meal',
        depth:      'Overhead flat-lay or medium shot — phone + groceries — warm beige surface',
        camera:     'Overhead flat-lay or medium close — warm light — clean natural tone'
      },
      agitate: {
        phone_rule: 'NO PHONE',
        subject:    'Wilted spinach — ground beef past date — yogurt container — receipt visible',
        action:     'Items arranged naturally on counter — the waste is the subject — no person needed',
        food:       'Wilted spinach — ground beef — yogurt — $47 receipt visible — evidence of the leak',
        depth:      'Close table-level or overhead flat-lay — waste items fill the frame',
        camera:     'Overhead flat-lay or close table-level — honest warm light — not dramatic'
      },
      solve: {
        phone_rule: 'PHONE APPEARS — FIRST TIME',
        subject:    'Woman — phone in hand for first time — easyChef Pro pantry screen visible — expression shifting from mid-decision to quiet curiosity',
        action:     'Looking at phone screen not at camera — warm kitchen light returning',
        food:       'Groceries in background — same kitchen',
        depth:      'Medium shot — phone readable — expression visible — kitchen background',
        camera:     'Medium shot — phone and face both in frame — warm light'
      },
      value: {
        phone_rule: 'PHONE VISIBLE',
        subject:    'Woman cooking — calm unhurried energy — phone on counter showing meal plan',
        action:     'Cooking happening — kids settling in background — not rushed',
        food:       'Real home food being prepared — not gourmet — warm and achievable',
        depth:      'Wider shot — cooking + kids soft focus + phone visible',
        camera:     'Medium wide — warm golden light — authentic lifestyle'
      },
      proof: {
        phone_rule: 'PHONE VISIBLE',
        subject:    'Family at dinner table — real smiles — real home — woman watching with quiet pride',
        action:     'Real dinner happening — phone in hand — candlelit or warm overhead',
        food:       'Real home-cooked food on table — not staged or gourmet',
        depth:      'Wide table shot — family visible — warm intimate light',
        camera:     'Wide slightly above — golden warm light — real home energy'
      },
      cta: {
        phone_rule: 'PHONE IN HAND',
        subject:    'Woman on couch after dinner — peace on her face — kids settled in background',
        action:     'Relaxed on couch — phone in hand showing app — kitchen clean behind her',
        food:       'Kitchen visible and tidy in background',
        depth:      'Medium shot — woman on couch — clean kitchen background — deep amber evening light',
        camera:     'Medium shot — warm low amber light — softest image in the arc'
      }
    };

    // urgency → proof, launch → cta
    var _briefKey = function(stage) {
      if (stage === 'urgency') return 'proof';
      if (stage === 'launch')  return 'cta';
      return _IB[stage] ? stage : 'value';
    };

    var _fmtBrief = function(b) {
      return 'PHONE RULE: ' + b.phone_rule +
             '\nSUBJECT: '  + b.subject   +
             '\nACTION: '   + b.action    +
             '\nFOOD: '     + b.food      +
             '\nDEPTH: '    + b.depth     +
             '\nCAMERA: '   + b.camera;
    };

    var _slugify = function(s) {
      return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    };

    // ── Locked hashtags per platform ──────────────────────────────────────────
    var HASHTAGS = {
      'Facebook': '',
      'Email':    '',
      'TikTok':   '#easyChefPro #mealprep #busymom #foodwaste #dinnerideas',
      'YouTube':  ''
    };

    var UTM_P = {
      'Facebook': { source: 'facebook', medium: 'social'  },
      'Email':    { source: 'email',    medium: 'email'   },
      'TikTok':   { source: 'tiktok',   medium: 'social'  },
      'YouTube':  { source: 'youtube',  medium: 'video'   }
    };

    var PREFIX = {
      'Facebook': 'FB',
      'Email':    'EM',
      'TikTok':   'TK',
      'YouTube':  'YT'
    };

    // ── Load SocialPosts ──────────────────────────────────────────────────────
    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var spData  = spSheet.getDataRange().getValues();
    var spHdrs  = spData[0].map(function(h) { return String(h).trim(); });
    var COL     = {};
    spHdrs.forEach(function(h, i) { COL[h] = i; });

    // ── Load DeepLinkRegistry — find max numbers per prefix ───────────────────
    var dlSheet = _getCCSheet(_CC_TAB.DL);
    var dlData  = dlSheet.getDataRange().getValues();
    var dlHdrs  = dlData[0].map(function(h) { return String(h).trim(); });
    var dlIdCol = dlHdrs.indexOf('dl_id');
    var maxN    = { FB: 0, EM: 0, TK: 0, YT: 0 };

    for (var di = 1; di < dlData.length; di++) {
      var existId = String(dlData[di][dlIdCol] || '');
      var m = existId.match(/^DL-(FB|EM|TK|YT)-(\d+)$/);
      if (m) {
        var n = parseInt(m[2], 10);
        if (n > maxN[m[1]]) maxN[m[1]] = n;
      }
    }

    var ctr = { FB: maxN.FB, EM: maxN.EM, TK: maxN.TK, YT: maxN.YT };
    var _nextDl = function(prefix) {
      ctr[prefix]++;
      return 'DL-' + prefix + '-' + ('000' + ctr[prefix]).slice(-4);
    };

    // ── Process EC-2026-001 rows ──────────────────────────────────────────────
    var newDlRows    = [];
    var updatedPosts = [];

    for (var ri = 1; ri < spData.length; ri++) {
      var row = spData[ri];
      if (String(row[COL['campaign_id']]) !== 'EC-2026-001') continue;

      var platform  = String(row[COL['platform']] || 'Facebook');
      var prefix    = PREFIX[platform]  || 'FB';
      var utmP      = UTM_P[platform]   || UTM_P['Facebook'];
      var briefRaw  = String(row[COL['design_brief']] || '{}');
      var briefObj  = {};
      try { briefObj = JSON.parse(briefRaw); } catch(e2) {}

      var stage     = briefObj.funnel_stage || 'value';
      var hookText  = String(row[COL['hook']] || '');
      var bKey      = _briefKey(stage);
      var brief     = _IB[bKey];
      var imgText   = _fmtBrief(brief);
      var hashtags  = HASHTAGS.hasOwnProperty(platform) ? HASHTAGS[platform] : '';
      var dlId      = _nextDl(prefix);
      var utmSlug   = _slugify(hookText);
      var utmContent = dlId + '|' + utmSlug;
      var utmUrl    = 'https://easychefpro.com/lp/waitlist-a' +
                      '?utm_source='   + utmP.source +
                      '&utm_medium='   + utmP.medium +
                      '&utm_campaign=ec-2026-001' +
                      '&utm_content='  + encodeURIComponent(utmContent);

      // Enrich design_brief JSON
      briefObj.image_brief_structured = {
        phone_rule: brief.phone_rule,
        subject:    brief.subject,
        action:     brief.action,
        food:       brief.food,
        depth:      brief.depth,
        camera:     brief.camera
      };
      briefObj.dl_id   = dlId;
      briefObj.utm_url = utmUrl;

      var updRow = row.slice();
      updRow[COL['hashtags']]    = hashtags;
      updRow[COL['image_brief']] = imgText;
      updRow[COL['dl_id']]       = dlId;
      updRow[COL['utm_url']]     = utmUrl;
      updRow[COL['design_brief']] = JSON.stringify(briefObj);

      updatedPosts.push({ sheetRow: ri + 1, data: updRow });

      // DL registry row (13 cols)
      newDlRows.push([
        dlId,
        utmContent,
        'EC-2026-001',
        platform,
        'https://easychefpro.com/lp/waitlist-a',
        utmP.source,
        utmP.medium,
        'ec-2026-001',
        'active',
        now,
        '',
        'system',
        hookText.slice(0, 60)
      ]);
    }

    // ── Batch-write DL registry entries ───────────────────────────────────────
    if (newDlRows.length > 0) {
      var dlStart = dlSheet.getLastRow() + 1;
      dlSheet.getRange(dlStart, 1, newDlRows.length, 13).setValues(newDlRows);
      results.push('✓ DL registry: ' + newDlRows.length + ' entries');
    }

    // ── Write updated SocialPost rows ─────────────────────────────────────────
    updatedPosts.forEach(function(u) {
      spSheet.getRange(u.sheetRow, 1, 1, u.data.length).setValues([u.data]);
    });
    results.push('✓ SocialPosts updated: ' + updatedPosts.length + ' posts');

    Logger.log('[updateEC2026001PostDetails] ' + results.join(' | '));
    return { ok: true, results: results, post_count: updatedPosts.length, dl_count: newDlRows.length };

  } catch(e) {
    Logger.log('[updateEC2026001PostDetails] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── Email sequences: SEQ-1 through SEQ-5, A (money) + B (time/founding) ──────
// Run via doPost: { "action": "seed_ec2026001_emails" }
// A variant → /lp/waitlist-a | B variant → /lp/waitlist-b
// DL-EM-0020..0031 = A CTAs | DL-EM-0032..0043 = B CTAs

function seedEC2026001Emails() {
  try {
    var results = [];
    var now = _ccNow();

    var _uA = function(dl, sl) {
      return 'https://easychefpro.com/lp/waitlist-a?utm_source=email&utm_medium=email&utm_campaign=ec-2026-001&utm_content=' + encodeURIComponent(dl + '|' + sl);
    };
    var _uB = function(dl, sl) {
      return 'https://easychefpro.com/lp/waitlist-b?utm_source=email&utm_medium=email&utm_campaign=ec-2026-001&utm_content=' + encodeURIComponent(dl + '|' + sl);
    };

    // 12 emails. Each has: seq, n, day, stage, dlA (0020-0031), dlB (0032-0043), a{}, b{}
    var ED = [
      // ── SEQ-1: Welcome / Problem Arc ─────────────────────────────────────────
      { seq:1, n:1, day:3,  stage:'problem', feature:'problem',
        dlA:'DL-EM-0020', slA:'seq1-e1-a', dlB:'DL-EM-0032', slB:'seq1-e1-b',
        a:{ sub:"You're throwing away $111 every month",
            pre:"Not your fault. Just no system.",
            hk:"You have an invisible leak in your grocery budget. $111 a month. Every month. Not because of bad decisions — because the system was never designed to close the loop.",
            pr:"You buy groceries on Sunday. By Wednesday it's a guessing game. The spinach goes limp. The ground beef gets pushed to the back. The yogurt expires. You order delivery. Again.",
            ag:"Families save an average of $111 a month when the leak is closed. That's $1,336/year average savings. Not from couponing. Not from buying less. From having a system.",
            so:"easyChef Pro closes the loop. Five apps replaced. One leak closed.",
            va:"TRACK what's in your fridge before it expires. PLAN the week from what you already own. COOK 30-minute dinners from what's there. SHOP only what's missing. OPTIMIZE every meal with registered dietitians.",
            pf:"Validated across 10,000 household profiles. 69.5% less food waste. Built by first responders.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"Six apps open. Groceries on the counter. Nothing for dinner.",
            pre:"The 6:30 PM wall is not a you problem.",
            hk:"It's 6:30 PM. The fridge is full. Five apps are open. And you still don't know what to make for dinner.",
            pr:"You have Mealime. A pantry app. A nutrition tracker. A recipe app. A shopping list. None of them talk to each other. None of them know what's actually in your fridge right now.",
            ag:"You spend 5 to 10 hours a week deciding what to eat. Every night you wing it is an evening that wasn't yours. Every delivery order is $30 that should have stayed in your wallet.",
            so:"easyChef Pro closes the loop. One app. Five replaced. Dinner figured out before you open the fridge.",
            va:"The meal plan builds from what you already own. The recipe is waiting. The shopping list writes itself. The nutrition score fires automatically.",
            pf:"Validated across 10,000 household profiles. Built by first responders who needed this as much as you do.",
            ct:"Join the founding family — early access July 1" }},

      { seq:1, n:2, day:6,  stage:'agitate', feature:'problem',
        dlA:'DL-EM-0021', slA:'seq1-e2-a', dlB:'DL-EM-0033', slB:'seq1-e2-b',
        a:{ sub:"$1,336 thrown away every year — not your fault",
            pre:"Do the math. It's jarring.",
            hk:"$1,336. That's how much the average family throws away in groceries every year.",
            pr:"It's not the big grocery trips. It's the spinach that wilted by Wednesday. The ground beef pushed to the back. The yogurt that expired before anyone touched it.",
            ag:"That's $111 every month. $3.66 every single day. From your fridge to your garbage bin. Without a system, it never stops.",
            so:"easyChef Pro tracks what you have before it expires. TRACK → PLAN → COOK → SHOP — the full loop, closed.",
            va:"Your pantry knows what's in it. The meal plan builds from what you own. The recipe uses what's there. The shopping list only buys what's missing.",
            pf:"69.5% less food waste. Validated across 10,000 household profiles.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"What if dinner was decided before you opened the fridge?",
            pre:"That question changes everything.",
            hk:"What if the hardest part of tonight's dinner was already done before you got home?",
            pr:"Every night, the 6:30 PM decision costs you 20 minutes minimum. Stare at the fridge. Check an app. Nothing matches what you have. Open delivery. Spend $35 you didn't plan for.",
            ag:"That's 5 to 10 hours a week you don't get back. Multiplied by 52 weeks. That time belongs to you — and to your family.",
            so:"easyChef Pro decides dinner before you open the fridge. The plan is already built from what you own.",
            va:"Open the app. Your week is planned. Tonight's recipe is from your fridge. The shopping list for what's missing is ready. Nutrition scored automatically.",
            pf:"Validated across 10,000 household profiles. Built by first responders.",
            ct:"Join the founding family — early access July 1" }},

      { seq:1, n:3, day:8,  stage:'solve', feature:'TRACK',
        dlA:'DL-EM-0022', slA:'seq1-e3-a', dlB:'DL-EM-0034', slB:'seq1-e3-b',
        a:{ sub:"$1,336 back in your pocket this year",
            pre:"The leak starts with your pantry.",
            hk:"$1,336 back. Not from couponing. From knowing what's in your fridge before it expires.",
            pr:"The leak starts in your pantry. You buy things you already have. You forget what's expiring. You miss the window when the spinach was still good.",
            ag:"easyChef Pro TRACK sees everything the moment you scan your receipt. Expiry alerts fire before the loss happens. You never buy what you already have again.",
            so:"TRACK replaced NoWaste — and it does more. Every item it logs feeds every decision downstream.",
            va:"The pantry data builds the meal plan. The meal plan builds the recipe. The recipe builds the shopping list. One loop. Closed.",
            pf:"Families save an average of $111 a month. $1,336/year average savings. 69.5% less food waste.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"The grocery leak — closed",
            pre:"This is what TRACK actually does.",
            hk:"The first thing easyChef Pro does is close the leak.",
            pr:"TRACK scans your receipt. Every item logged. Expiry tracked. Duplicate purchases caught before they happen. The pantry you couldn't see — now you see it.",
            ag:"When TRACK knows what you have, everything follows automatically. The meal plan builds from what you own. You never open the fridge wondering what to make.",
            so:"TRACK → PLAN → OPTIMIZE → COOK → SHOP. The full loop. From one app. Five apps — replaced.",
            va:"Dinner figured out before 6:30 PM. The mental load — lifted. Kitchen in command.",
            pf:"Validated across 10,000 household profiles. Built by first responders.",
            ct:"Join the founding family — early access July 1" }},

      // ── SEQ-2: Value Arc ──────────────────────────────────────────────────────
      { seq:2, n:1, day:12, stage:'value', feature:'TRACK',
        dlA:'DL-EM-0023', slA:'seq2-e1-a', dlB:'DL-EM-0035', slB:'seq2-e1-b',
        a:{ sub:"$111 back every month with 30-minute dinners",
            pre:"This is how the math works.",
            hk:"You scan the receipt. easyChef Pro does the rest.",
            pr:"TRACK logs every item with expiry dates. The pantry you couldn't see is now visible — and it's talking to every other feature in the app.",
            ag:"The moment something is about to expire, TRACK fires an alert. PLAN pulls it into tonight's dinner. Nothing goes to waste. The $111 stops disappearing.",
            so:"TRACK replaced NoWaste — and it opened the whole loop.",
            va:"PLAN sees your pantry and builds five dinners from what you already own. No manual entry. No 'what do I have?' — Monday through Friday, done.",
            pf:"Families save an average of $111 a month. $1,336/year average savings.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"30 minutes from fridge panic to family dinner",
            pre:"The app built the plan from what you already have.",
            hk:"Monday. Tuesday. Wednesday. Thursday. Friday. Five dinners — from what you already own.",
            pr:"PLAN doesn't ask you to enter anything. It reads your pantry from TRACK. It sees what's expiring first. It builds the week automatically.",
            ag:"Sunday: scan your receipt. Monday morning: your week is already planned. No 6:30 PM decisions. No 'what's for dinner' spiral. No delivery.",
            so:"PLAN replaced Mealime — but Mealime never knew what you had. PLAN does.",
            va:"Five dinners planned. Each recipe ready. Each from your fridge. 30 minutes fridge to table.",
            pf:"Validated across 10,000 household profiles. 69.5% less food waste.",
            ct:"Join the founding family — early access July 1" }},

      { seq:2, n:2, day:15, stage:'value', feature:'PLAN',
        dlA:'DL-EM-0024', slA:'seq2-e2-a', dlB:'DL-EM-0036', slB:'seq2-e2-b',
        a:{ sub:"$1,336 of groceries thrown away every year",
            pre:"Week three. Here's what PLAN actually builds.",
            hk:"The meal plan builds itself. From what you already paid for.",
            pr:"Monday: salmon from last week. Tuesday: tacos from the ground beef. Wednesday: stir fry from the vegetables about to expire. Thursday: pasta from the back of the pantry.",
            ag:"PLAN sees all of it. From the pantry TRACK built. Five dinners from what you already own. Zero guessing. Zero waste.",
            so:"PLAN replaced your meal planner — but it knows your pantry. No planner did that before.",
            va:"The week is planned before Monday arrives. The recipes are ready. The shopping list for what's missing builds itself.",
            pf:"Families save an average of $111 a month. 69.5% less food waste.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"That spinach you bought Sunday is brown today",
            pre:"Not with easyChef Pro.",
            hk:"The spinach you bought on Sunday. Today is Wednesday. You know what happened to it.",
            pr:"Not anymore. TRACK saw it the day you scanned the receipt. PLAN pulled it into Monday's dinner. You cooked it while it was still good.",
            ag:"That's the difference. The pantry talks to the meal plan. The meal plan talks to the recipe. Nothing expires in the dark.",
            so:"PLAN knows what you have. Builds from what's expiring first. Five dinners. From your fridge. Automatic.",
            va:"The week is figured out before you open the fridge on Sunday night. The 6:30 PM panic doesn't come.",
            pf:"Validated across 10,000 household profiles. 69.5% less food waste.",
            ct:"Join the founding family — early access July 1" }},

      { seq:2, n:3, day:18, stage:'value', feature:'OPTIMIZE',
        dlA:'DL-EM-0025', slA:'seq2-e3-a', dlB:'DL-EM-0037', slB:'seq2-e3-b',
        a:{ sub:"That $111 you threw away last month",
            pre:"OPTIMIZE closes the nutrition loop.",
            hk:"OPTIMIZE scores every meal COOK produces. 6 nutrition dimensions. FDA-grade data. Registered dietitians.",
            pr:"Your meal plan is built from your pantry. Your recipe is ready in 30 minutes. Every meal you cook is now scored — automatically. No food logging. No manual tracking.",
            ag:"Every meal COOK produces gets scored before you plate it. If something's off nutritionally, PLAN adjusts next week's dinners. The loop optimizes itself.",
            so:"OPTIMIZE replaced MyFitnessPal — but MyFitnessPal never knew your pantry. OPTIMIZE does.",
            va:"TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One system. The leak — closed.",
            pf:"Registered dietitians validated every recipe. 69.5% less food waste. Families save an average of $111 a month.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"Every expired yogurt is $3 down the drain",
            pre:"The nutrition loop closes this week.",
            hk:"OPTIMIZE fires automatically. You didn't log anything. The meal COOK produced is already scored.",
            pr:"6 nutrition dimensions. FDA-grade data. Registered dietitians validated every recipe. Every meal from your fridge — scored before it reaches the table.",
            ag:"You used to track every calorie on a separate app. OPTIMIZE does all of it from what you actually cooked. From your actual pantry. Without a single manual entry.",
            so:"OPTIMIZE replaced your nutrition tracker — and it's connected to COOK, PLAN, and TRACK.",
            va:"The full loop closes. Five apps replaced. Dinner figured out. Kitchen in command.",
            pf:"Validated across 10,000 household profiles. Built by first responders.",
            ct:"Join the founding family — early access July 1" }},

      { seq:2, n:4, day:21, stage:'proof', feature:'proof',
        dlA:'DL-EM-0026', slA:'seq2-e4-a', dlB:'DL-EM-0038', slB:'seq2-e4-b',
        a:{ sub:"$1,336 savings ends July 1st",
            pre:"10,000 households. The data is in.",
            hk:"10,000 household profiles. 69.5% less food waste. $1,336/year average savings. Not a promise. Validated data.",
            pr:"That's from real households running the full loop: TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One system.",
            ag:"9 patent-pending technologies. Built by first responders. Not Silicon Valley. People who needed this as much as you do.",
            so:"The data is in. The system works. The founding price — $7.99/month — closes July 1.",
            va:"$7.99 to save $111 a month. That's 60% off the standard price of $19.99. Forever. For the first 5,000 families.",
            pf:"Families save an average of $111 a month. 69.5% less food waste. Validated across 10,000 household profiles.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"4 days left to escape 6:30 PM panic",
            pre:"The proof is in. Time to decide.",
            hk:"The data is real. 10,000 households. The 6:30 PM panic — gone.",
            pr:"Not because they got better at cooking. Because the system closes the loop. TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced.",
            ag:"9 patent-pending technologies. Built by first responders. $1,336/year average savings. 69.5% less food waste.",
            so:"The founding price is $7.99/month. 60% off forever. For the first 5,000 families only.",
            va:"Dinner figured out. Kitchen in command. The mental load — gone.",
            pf:"Validated across 10,000 household profiles. Built by first responders.",
            ct:"Join the founding family — early access July 1" }},

      // ── SEQ-3: Urgency Arc ────────────────────────────────────────────────────
      { seq:3, n:1, day:22, stage:'urgency', feature:'urgency',
        dlA:'DL-EM-0027', slA:'seq3-e1-a', dlB:'DL-EM-0039', slB:'seq3-e1-b',
        a:{ sub:"5,000 founding spots. The window is closing.",
            pre:"Three weeks of buildup. Here's the number.",
            hk:"5,000 founding families. $7.99/month. Forever. The window is closing.",
            pr:"You've been following the invisible leak for three weeks. You know what TRACK does. You know what the 5-app loop closes.",
            ag:"$7.99/month is 60% off the standard price of $19.99. It locks the day the 5,000 spots fill. Real scarcity. Not manufactured.",
            so:"Early access: July 1. Founding price: $7.99/month. Your decision: now.",
            va:"$7.99 to save $111 a month. $1,336/year average savings. First 5,000 only.",
            pf:"Validated across 10,000 household profiles. 69.5% less food waste.",
            ct:"Lock in $7.99/month — 60% off forever" },
        b:{ sub:"You've been deciding for 3 weeks. Here's what that costs.",
            pre:"Every day without the system is $3.66.",
            hk:"Three weeks. You watched the invisible leak. Saw the 5-app fragmentation. Watched TRACK close it.",
            pr:"Every day without the system: $3.66 in groceries that become garbage. Every night without the meal plan: 20 minutes of decision that should have been yours.",
            ag:"The founding price closes when 5,000 spots fill. After that: $19.99/month. The gap is $12 a month. Forever. Just from waiting.",
            so:"Founding family: $7.99/month. 60% off. For the first 5,000 only.",
            va:"Early access July 1. Founding price locked. Kitchen in command.",
            pf:"Built by first responders. Validated across 10,000 household profiles.",
            ct:"Join the founding family — lock in $7.99/month" }},

      { seq:3, n:2, day:24, stage:'urgency', feature:'urgency',
        dlA:'DL-EM-0028', slA:'seq3-e2-a', dlB:'DL-EM-0040', slB:'seq3-e2-b',
        a:{ sub:"$7.99 founding price ends in 10 days",
            pre:"The math is simple.",
            hk:"$7.99/month. $111 saved every month. The math pays for itself in the first week.",
            pr:"10 days left before July 1. 10 days before early access opens. 10 days before the founding price closes at 5,000 spots.",
            ag:"After 5,000 spots: $19.99/month. The difference is $12 every month. Forever. That's $144 a year — just from waiting.",
            so:"Join the waitlist today. Lock $7.99/month before it closes.",
            va:"30 minutes fridge to table. $1,336/year average savings. 69.5% less food waste. Founded at $7.99.",
            pf:"Families save an average of $111 a month. Validated across 10,000 household profiles.",
            ct:"Lock in $7.99/month — 60% off forever" },
        b:{ sub:"Your kitchen panic has 10 days left",
            pre:"Then it's over. Here's why.",
            hk:"10 days from now, the 6:30 PM panic has a system.",
            pr:"Early access opens July 1. The founding price closes with the first 5,000 spots. You've been following this for three weeks. You know what the app does.",
            ag:"Every night you wait is an evening that wasn't yours. Every week without the system costs 5 to 10 hours of decisions. That's the real price of waiting.",
            so:"Join the waitlist. Lock $7.99/month. Get early access July 1.",
            va:"Dinner decided. Groceries planned. Kitchen in command. The mental load — gone.",
            pf:"Built by first responders. Validated across 10,000 household profiles.",
            ct:"Join the founding family — lock in $7.99/month" }},

      { seq:3, n:3, day:27, stage:'urgency', feature:'urgency',
        dlA:'DL-EM-0029', slA:'seq3-e3-a', dlB:'DL-EM-0041', slB:'seq3-e3-b',
        a:{ sub:"Five apps replaced. One leak closed. 4 days left.",
            pre:"Last urgency email.",
            hk:"4 days. July 1 is real. The founding price closes when 5,000 spots fill.",
            pr:"You've seen the full loop: TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One leak closed. $1,336/year average savings.",
            ag:"The standard price after 5,000: $19.99/month. The founding price: $7.99/month. 60% off. Forever. For the first 5,000 families only.",
            so:"4 days to lock in. Early access July 1. Founding price closes at 5,000.",
            va:"$1,336/year average savings. 69.5% less food waste. 30 minutes fridge to table. $7.99/month.",
            pf:"Validated across 10,000 household profiles. 9 patent-pending technologies. Built by first responders.",
            ct:"Lock in $7.99/month — 60% off forever" },
        b:{ sub:"4 days left to escape 6:30 PM panic",
            pre:"Last call.",
            hk:"4 days. The founding price closes when 5,000 spots fill. This is your last urgency email.",
            pr:"You found easyChef Pro before it launched. You followed the invisible leak. You saw the loop close. Now you know what the app does.",
            ag:"Every night you wait is still 20 minutes of 6:30 PM panic. Every day without the system costs $3.66 in groceries that become garbage.",
            so:"Join the founding family. Early access July 1. $7.99/month. The 6:30 PM wall — gone.",
            va:"Dinner figured out. Kitchen in command. Founding price locked. Forever.",
            pf:"Built by first responders. Validated across 10,000 household profiles.",
            ct:"Join the founding family — 4 days left" }},

      // ── SEQ-4: CTA ────────────────────────────────────────────────────────────
      { seq:4, n:1, day:29, stage:'cta', feature:'launch',
        dlA:'DL-EM-0030', slA:'seq4-e1-a', dlB:'DL-EM-0042', slB:'seq4-e1-b',
        a:{ sub:"$1,336 saved or lost — you choose tomorrow",
            pre:"Tomorrow is the day.",
            hk:"Tomorrow. July 1. Early access opens.",
            pr:"You've had 29 days with the invisible leak. You know what $111 a month costs. You know what the system does. Tomorrow you either close the leak — or you don't.",
            ag:"The founding price — $7.99/month — closes with the 5,000 spots. After that: $19.99/month standard. Real scarcity. Not manufactured.",
            so:"Join the waitlist today. Your access opens tomorrow.",
            va:"$1,336/year average savings. 69.5% less food waste. 30 minutes fridge to table. Founded at $7.99.",
            pf:"Families save an average of $111 a month. Validated across 10,000 household profiles.",
            ct:"Join the founding family — last chance at $7.99/month" },
        b:{ sub:"Tomorrow: 6:30 PM panic returns forever",
            pre:"Or it doesn't. Your choice.",
            hk:"Tomorrow you get early access. Or you don't.",
            pr:"The founding family window is almost closed. 5,000 spots. The first families to join lock $7.99/month forever.",
            ag:"You found easyChef Pro before the world did. You followed the invisible leak. Tomorrow you either join the founding family — or you watch them close the door.",
            so:"Join the founding family today. Early access July 1.",
            va:"Dinner decided. Kitchen in command. You were first.",
            pf:"Built by first responders. Validated across 10,000 household profiles.",
            ct:"Join the founding family — your last chance" }},

      // ── SEQ-5: Launch Day ─────────────────────────────────────────────────────
      { seq:5, n:1, day:35, stage:'launch', feature:'launch',
        dlA:'DL-EM-0031', slA:'seq5-e1-a', dlB:'DL-EM-0043', slB:'seq5-e1-b',
        a:{ sub:"The app is live. Your kitchen is in command.",
            pre:"July 1. Here's your access.",
            hk:"It's July 1. easyChef Pro is live. Your founding family access is ready.",
            pr:"The invisible leak — closed. The 5-app fragmentation — replaced. TRACK → PLAN → OPTIMIZE → COOK → SHOP — one loop, one app, live today.",
            ag:"You were here before the launch. You know what $111 a month means. Today you get it back.",
            so:"Download easyChef Pro. Scan your first receipt. The loop starts now.",
            va:"Your pantry is tracked. Your week is planned. Your dinner is ready in 30 minutes. Your nutrition is scored. Your shopping list builds itself. $1,336/year average savings — yours.",
            pf:"Validated across 10,000 household profiles. 69.5% less food waste. Built by first responders.",
            ct:"Try easyChef Pro free for 7 days — no credit card" },
        b:{ sub:"July 1. You were first. Here is your access.",
            pre:"Your kitchen is in command.",
            hk:"You're in the founding family. July 1. easyChef Pro is live.",
            pr:"You found this before anyone else. You followed the invisible leak. You watched the loop close. Today you get founding family access.",
            ag:"Dinner is already figured out for tonight. TRACK → PLAN → OPTIMIZE → COOK → SHOP — the loop is running.",
            so:"Download easyChef Pro. Scan your first receipt. Your week builds itself.",
            va:"Founding family. Founding price. Kitchen in command. The 6:30 PM panic — permanently gone.",
            pf:"Built by first responders. Validated across 10,000 household profiles.",
            ct:"Try easyChef Pro free for 7 days — no credit card" }}
    ];

    // ── Clear existing EC-2026-001 emails ─────────────────────────────────────
    var emSheet = _getCCSheet(_CC_TAB.EMAIL);
    var emLast  = emSheet.getLastRow();
    if (emLast >= 2) {
      var emCids = emSheet.getRange(2, 1, emLast - 1, 2).getValues();
      for (var ci = emCids.length - 1; ci >= 0; ci--) {
        if (String(emCids[ci][1]) === 'EC-2026-001') emSheet.deleteRow(ci + 2);
      }
    }

    // ── Build 24 email rows (A then B for each email) ─────────────────────────
    var emRows = [];
    var allDlRows = [];

    ED.forEach(function(e) {
      var seqCode = 'SEQ-' + e.seq;
      var templ   = 'EC2026001-' + seqCode + '-E' + e.n;
      var urlA    = _uA(e.dlA, e.slA);
      var urlB    = _uB(e.dlB, e.slB);

      // A variant row (26 cols)
      emRows.push([
        'ec001-email-s' + e.seq + '-e' + e.n + '-a',
        'EC-2026-001', seqCode, e.n,
        e.a.sub, e.a.pre, e.a.hk, e.a.pr, e.a.ag, e.a.so, e.a.va, e.a.pf,
        e.a.ct + '\n' + urlA,
        e.day, 'klaviyo_' + seqCode.toLowerCase() + '_segment_a',
        'draft', false, '', false, '',
        e.stage, 'money', 'invisible-leak', 'waitlist-a', templ + '-A',
        JSON.stringify({ dl_id: e.dlA, utm_url: urlA, lp: 'waitlist-a', segment: 'money', day: e.day })
      ]);

      // B variant row (26 cols)
      emRows.push([
        'ec001-email-s' + e.seq + '-e' + e.n + '-b',
        'EC-2026-001', seqCode, e.n,
        e.b.sub, e.b.pre, e.b.hk, e.b.pr, e.b.ag, e.b.so, e.b.va, e.b.pf,
        e.b.ct + '\n' + urlB,
        e.day, 'klaviyo_' + seqCode.toLowerCase() + '_segment_b',
        'draft', false, '', false, '',
        e.stage, 'time', 'invisible-leak', 'waitlist-b', templ + '-B',
        JSON.stringify({ dl_id: e.dlB, utm_url: urlB, lp: 'waitlist-b', segment: 'time_founding', day: e.day })
      ]);

      // DL registry: A → waitlist-a
      allDlRows.push([
        e.dlA, e.dlA + '_' + templ + '-A', 'EC-2026-001', 'Email',
        'https://easychefpro.com/lp/waitlist-a',
        'klaviyo', 'email', 'ec-2026-001', 'active', now, '', 'system',
        'Email ' + seqCode + ' E' + e.n + ' Variant A — money/savings'
      ]);
      // DL registry: B → waitlist-b
      allDlRows.push([
        e.dlB, e.dlB + '_' + templ + '-B', 'EC-2026-001', 'Email',
        'https://easychefpro.com/lp/waitlist-b',
        'klaviyo', 'email', 'ec-2026-001', 'active', now, '', 'system',
        'Email ' + seqCode + ' E' + e.n + ' Variant B — time/founding'
      ]);
    });

    // ── Write email rows ──────────────────────────────────────────────────────
    var emStart = emSheet.getLastRow() + 1;
    emSheet.getRange(emStart, 1, emRows.length, 26).setValues(emRows);
    results.push('✓ EmailSequences: ' + emRows.length + ' records (SEQ-1..SEQ-5 · A+B)');

    // ── Write DL registry entries ─────────────────────────────────────────────
    var dlSheet  = _getCCSheet(_CC_TAB.DL);
    var dlStart  = dlSheet.getLastRow() + 1;
    dlSheet.getRange(dlStart, 1, allDlRows.length, 13).setValues(allDlRows);
    results.push('✓ DL registry: ' + allDlRows.length + ' email DL entries (A+B)');

    Logger.log('[seedEC2026001Emails] ' + results.join(' | '));
    return { ok: true, results: results, email_count: emRows.length, dl_count: allDlRows.length };

  } catch(e) {
    Logger.log('[seedEC2026001Emails] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── Fill body_copy for all 51 EC-2026-001 social posts ───────────────────────
// Run via doPost: { "action": "fill_ec2026001_social_body" }

function fillEC2026001SocialBody() {
  try {
    var results = [];

    // Day → email sequence ref (calendar notes for Email platform rows)
    var DAY_SEQ = { 0:'SEQ-1 E1', 3:'SEQ-1 E2', 6:'SEQ-1 E3', 8:'SEQ-2 E1', 12:'SEQ-2 E2',
                    15:'SEQ-2 E3', 18:'SEQ-2 E4', 21:'SEQ-2 E5',
                    22:'SEQ-3 E1', 24:'SEQ-3 E2', 27:'SEQ-3 E3',
                    29:'SEQ-3 E4', 35:'SEQ-4 E1' };

    var _fb = function(stage, feature, hook, utmUrl) {
      var base = {
        hook:    'You have an invisible leak. $111 a month.\n\nThe spinach. The ground beef. The yogurt. Five apps open. None of them talking to each other.\n\neasyChef Pro closes the loop — TRACK → PLAN → OPTIMIZE → COOK → SHOP.\n\nJoin the waitlist — early access July 1.',
        problem: 'Five apps. None of them talk to each other.\n\nMealime doesn\'t know your pantry. NoWaste doesn\'t build your meal plan. None of the five apps close the loop.\n\nThe leak runs in the gap between them.\n\neasyChef Pro replaces all five. Join the waitlist — early access July 1.',
        agitate: '$1,336. Every year. Groceries you bought — that never became dinner.\n\nFamilies save an average of $111 a month when the leak is closed. Not from couponing. From having a system.\n\neasyChef Pro closes the loop — TRACK → PLAN → OPTIMIZE → COOK → SHOP.\n\nJoin the waitlist — early access July 1.',
        solve:   'TRACK. Your pantry, finally tracked.\n\neasyChef Pro scans your receipt. Every item logged. Expiry alerts fire before the loss happens. The pantry talks to the meal plan. The loop closes.\n\nJoin the waitlist — early access July 1.',
        value:   (function() {
          var m = {
            TRACK:    'easyChef Pro TRACK replaced NoWaste — and does more.\n\nScan your receipt. Every item tracked. Expiry alerts fire first. Your pantry feeds the meal plan, which feeds the recipe, which feeds the shopping list.\n\nJoin the waitlist — early access July 1.',
            PLAN:     'easyChef Pro PLAN replaced Mealime — and knows your pantry.\n\nFive dinners built from what you already own. Automatically. No manual entry. No 6:30 PM guessing.\n\nJoin the waitlist — early access July 1.',
            OPTIMIZE: 'easyChef Pro OPTIMIZE replaced MyFitnessPal — and works from your actual fridge.\n\n6 nutrition dimensions. FDA-grade data. Registered dietitians. Every meal scored automatically — no logging.\n\nJoin the waitlist — early access July 1.',
            COOK:     'easyChef Pro COOK replaced your recipe app — and knows what you already have.\n\n30 minutes fridge to table. 10,000 recipes at launch. Every recipe from your pantry.\n\nJoin the waitlist — early access July 1.',
            SHOP:     'easyChef Pro SHOP replaced your shopping list app — 1-click.\n\nThe list builds from your pantry. Only what\'s missing. 800,000 products. Done.\n\nJoin the waitlist — early access July 1.',
            proof:    '10,000 household profiles. 69.5% less food waste. Families save an average of $111 a month.\n\nNot a promise. Validated data. 9 patent-pending technologies. Built by first responders.\n\nJoin the waitlist — early access July 1.',
            all:      'TRACK → PLAN → OPTIMIZE → COOK → SHOP. One loop.\n\nFive apps replaced. The 6:30 PM panic — gone. $1,336/year average savings. 69.5% less food waste.\n\nJoin the waitlist — early access July 1.'
          };
          return m[feature] || m['all'];
        })(),
        proof:   '10,000 household profiles. 69.5% less food waste. Families save an average of $111 a month.\n\nNot a promise. Validated data across 10,000 households. 9 patent-pending technologies. Built by first responders.\n\nJoin the waitlist — early access July 1.',
        urgency: '$7.99/month. 60% off forever. First 5,000 families only.\n\nTRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One founding price. Real scarcity — not manufactured.\n\nLock in your founding spot before July 1.',
        cta:     'You are founding the kitchen of the future.\n\nTRACK → PLAN → OPTIMIZE → COOK → SHOP. One loop. July 1.\n\nFirst 5,000 families lock in $7.99/month forever. The rest pay $19.99.\n\nJoin the founding family.',
        launch:  'TRACK → PLAN → OPTIMIZE → COOK → SHOP. Live. Now.\n\nThe invisible leak — closed. Five apps — replaced. The 6:30 PM panic — gone.\n\neasyChef Pro is live. Get your access now.'
      };
      var body = (base[stage] || base['value']);
      return body + (utmUrl ? '\n\n' + utmUrl : '');
    };

    var _tk = function(stage, feature, hook) {
      var m = {
        hook:    hook + ' [Warm kitchen · 6:30 PM · groceries on counter · five apps visible] easyChef Pro closes the loop. Join the waitlist — link in bio.',
        problem: hook + ' [Five app icons · none talking to each other] One app closes all five. TRACK → PLAN → OPTIMIZE → COOK → SHOP.',
        agitate: hook + ' [Wilted spinach · ground beef · receipt visible] $1,336/year average savings. Not your fault. Just no system.',
        solve:   hook + ' [Phone appears · TRACK screen visible] Scan your receipt. easyChef Pro does the rest.',
        value:   hook + ' [Phone visible · ' + feature + ' screen] One app. Five replaced. Join the waitlist — link in bio.',
        proof:   hook + ' [Data overlay · 10,000 households] 69.5% less food waste. Built by first responders.',
        urgency: hook + ' 5,000 founding spots. $7.99/month. 60% off forever. Link in bio.',
        cta:     hook + ' You are founding the kitchen of the future. First 5,000 families only. Link in bio.',
        launch:  hook + ' The leak is closed. July 1. easyChef Pro is live. Link in bio.'
      };
      return m[stage] || m['value'];
    };

    var _yt = function(stage, feature, hook) {
      var desc = hook + '\n\neasyChef Pro replaces five apps — TRACK (NoWaste), PLAN (Mealime), OPTIMIZE (MyFitnessPal), COOK (Recipe apps), SHOP (Shopping lists) — and closes the loop.\n\n' +
        'Validated across 10,000 household profiles. 69.5% less food waste. Families save an average of $111 a month. Built by first responders.\n\n' +
        'Join the waitlist — early access July 1: easychefpro.com/lp/waitlist-a\n\n' +
        '#mealplanningapp #foodwaste #kitchenapp #easychefpro';
      return desc;
    };

    var _em = function(day, hook) {
      var seq = DAY_SEQ[day];
      if (seq) return seq + ' fires — Variant A → /lp/waitlist-a | Variant B → /lp/waitlist-b\n\nHook: ' + hook;
      return 'No send — nurture period · Day ' + day + '\n\nNext email: ' + hook;
    };

    var _ig = function(stage, feature, hook, utmUrl) {
      var m = {
        hook:    hook + '\n\n$111/month. Disappearing into groceries that never became dinner.\n\neasyChef Pro closes the loop — TRACK → PLAN → OPTIMIZE → COOK → SHOP.\n\nLink in bio — join free.',
        problem: hook + '\n\nFive apps. None of them talk to each other. None of them know what\'s in your fridge right now.\n\neasyChef Pro replaces all five. One loop. Link in bio.',
        agitate: hook + '\n\n$1,336 a year. Not your fault. Just no system.\n\n69.5% less food waste when the loop closes.\n\nLink in bio.',
        solve:   hook + '\n\nTRACK closes the leak. Scan your receipt. Every item logged. Expiry fires before the loss happens.\n\nLink in bio.',
        value:   (function(){
          var vMap = {
            TRACK:    hook + '\n\nTRACK replaced NoWaste — and does more. Your pantry feeds the meal plan feeds the recipe. Link in bio.',
            PLAN:     hook + '\n\nPLAN builds five dinners from what you already own. No manual entry. No 6:30 PM guessing. Link in bio.',
            OPTIMIZE: hook + '\n\n6 nutrition dimensions. FDA-grade data. Registered dietitians. Every meal scored automatically. Link in bio.',
            COOK:     hook + '\n\n30 minutes fridge to table. From what you already have. COOK knows your pantry. Link in bio.',
            SHOP:     hook + '\n\nThe list builds itself. 800k products. 1-click to your cart. Only what\'s missing. Link in bio.',
            proof:    hook + '\n\n10,000 households. 69.5% less waste. $111/month saved. Link in bio.',
            all:      hook + '\n\nOne loop. Five apps replaced. $1,336/year average savings. Link in bio.'
          };
          return vMap[feature] || vMap['all'];
        })(),
        proof:   hook + '\n\n10,000 household profiles. 69.5% less food waste. $1,336/year average savings.\n\nBuilt by first responders.\n\nLink in bio.',
        urgency: hook + '\n\n5,000 founding spots. $7.99/month — 60% off forever. The window is closing.\n\nLink in bio.',
        cta:     hook + '\n\nFirst 5,000 families lock $7.99/month forever. TRACK → PLAN → OPTIMIZE → COOK → SHOP.\n\nLink in bio.',
        launch:  hook + '\n\neasyChef Pro is live. The invisible leak — closed. Your kitchen. In command.\n\nLink in bio.'
      };
      var body = m[stage] || m['value'];
      return body + (utmUrl ? '\n\n' + utmUrl : '');
    };

    var _xp = function(stage, feature, hook) {
      var url = '\n\neasychefpro.com/lp/waitlist-a';
      var m = {
        hook:    hook + '\n\n$111/month. Every month. easyChef Pro closes the loop.' + url,
        problem: hook + '\n\nFive apps. None talk to each other. easyChef Pro replaces all five.' + url,
        agitate: hook + '\n\n$1,336/year average savings. Not from couponing. From a system.' + url,
        solve:   hook + '\n\nTRACK → PLAN → OPTIMIZE → COOK → SHOP. One loop.' + url,
        value:   hook + '\n\n' + (feature !== 'all' && feature !== 'proof' ? feature + ' — part of the loop. ' : '') + 'Five apps replaced.' + url,
        proof:   hook + '\n\n10,000 households. 69.5% less food waste. The data is real.' + url,
        urgency: hook + '\n\n$7.99/month. 60% off. First 5,000 families only.' + url,
        cta:     hook + '\n\nFirst 5,000 lock $7.99/month forever. Real scarcity.' + url,
        launch:  hook + '\n\neasyChef Pro is live.' + url
      };
      return m[stage] || m['value'];
    };

    var _pt = function(stage, feature, hook) {
      var base = {
        hook:    hook + '\n\nThe average family throws away $1,336 in groceries every year. Not bad decisions — just no system. easyChef Pro closes the loop with TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One tool that knows what\'s in your fridge, plans the week, and builds the shopping list automatically.\n\nJoin the waitlist — early access July 1 · easychefpro.com',
        problem: hook + '\n\nFive apps open. None of them talk to each other. Your pantry app doesn\'t know your meal planner. Your meal planner doesn\'t know your nutrition tracker. easyChef Pro closes every gap — one app replaces five.\n\nEarly access July 1 · easychefpro.com',
        agitate: hook + '\n\nFamilies save an average of $111 a month when the grocery leak is closed. That\'s $1,336/year average savings — not from couponing, but from having a system that tracks what you have, plans what to make, and shops only for what\'s missing.\n\nJoin the waitlist · easychefpro.com',
        solve:   hook + '\n\nTRACK scans your receipt and tracks every item with expiry dates. Your pantry finally knows what\'s in it — and talks to the meal plan, the recipe, and the shopping list. The invisible leak closes.\n\nEarly access July 1 · easychefpro.com',
        value:   hook + '\n\neasyChef Pro replaces NoWaste, Mealime, MyFitnessPal, your recipe app, and your shopping list — with one loop: TRACK → PLAN → OPTIMIZE → COOK → SHOP. Validated across 10,000 household profiles. 69.5% less food waste. Families save an average of $111 a month.\n\nJoin the waitlist · easychefpro.com',
        proof:   hook + '\n\nValidated across 10,000 household profiles. 69.5% less food waste. Families save an average of $111 a month. Built by first responders. 9 patent-pending technologies.\n\nJoin the waitlist — early access July 1 · easychefpro.com',
        urgency: hook + '\n\nFirst 5,000 founding families lock in $7.99/month forever — 60% off the $19.99 standard price. Early access opens July 1. Real scarcity. Join the waitlist now.\n\neasychefpro.com',
        cta:     hook + '\n\nJoin the easyChef Pro founding family — first 5,000 families lock $7.99/month forever. TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. Early access July 1.\n\neasychefpro.com',
        launch:  hook + '\n\neasyChef Pro is live. The meal planning app that closes the invisible grocery leak — TRACK → PLAN → OPTIMIZE → COOK → SHOP. Download now and scan your first receipt free.\n\neasychefpro.com'
      };
      return base[stage] || base['value'];
    };

    var _nd = function(stage, feature, hook) {
      var url = '\n\nLearn more: easychefpro.com/lp/waitlist-a';
      var m = {
        hook:    hook + '\n\nFamilies in our area are saving an average of $111 a month on groceries with easyChef Pro — without couponing or buying less. It tracks what\'s in your fridge, plans the week from what you already own, and closes the $1,336/year grocery leak.' + url,
        problem: hook + '\n\nA lot of families here deal with this — groceries that don\'t turn into dinner. Five apps that don\'t talk to each other. easyChef Pro closes the loop. One app replaces five. Early access July 1.' + url,
        agitate: hook + '\n\nThe average family throws away $1,336 in groceries every year. Not bad decisions — just no system. easyChef Pro tracks what you have before it expires and plans meals from what you already own.' + url,
        solve:   hook + '\n\nTRACK scans your receipt, logs every item with expiry dates, and connects to your meal plan automatically. The pantry leak closes. 69.5% less food waste for families using the full loop.' + url,
        value:   hook + '\n\neasyChef Pro replaces five apps your family might already use — NoWaste, Mealime, MyFitnessPal, your recipe app, and your shopping list — with one connected system. Families save $111/month on average.' + url,
        proof:   hook + '\n\nValidated across 10,000 household profiles. 69.5% less food waste. $1,336/year average savings. Built by first responders. 9 patent-pending technologies. Early access July 1.' + url,
        urgency: hook + '\n\nFirst 5,000 founding families lock in $7.99/month forever — 60% off the standard $19.99 price. Spots are filling. Join the waitlist now.' + url,
        cta:     hook + '\n\nIf you\'ve been curious about easyChef Pro — now is the time. First 5,000 families get $7.99/month locked forever. That\'s $111 saved every month for $8.' + url,
        launch:  hook + '\n\neasyChef Pro is live today. If you\'re in the founding family, your access is ready. If not, you can still join — link below.' + url
      };
      return m[stage] || m['value'];
    };

    // ── Load SocialPosts ──────────────────────────────────────────────────────
    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var spData  = spSheet.getDataRange().getValues();
    var spHdrs  = spData[0].map(function(h) { return String(h).trim(); });
    var COL     = {};
    spHdrs.forEach(function(h, i) { COL[h] = i; });

    var updated = 0;
    for (var ri = 1; ri < spData.length; ri++) {
      var row = spData[ri];
      if (String(row[COL['campaign_id']]) !== 'EC-2026-001') continue;
      if (String(row[COL['body_copy']]   ).trim()) continue; // skip if already filled

      var platform = String(row[COL['platform']] || 'Facebook');
      var hook     = String(row[COL['hook']]     || '');
      var utmUrl   = String(row[COL['utm_url']]  || '');
      var bfRaw    = String(row[COL['design_brief']] || '{}');
      var bfObj    = {};
      try { bfObj = JSON.parse(bfRaw); } catch(ex) {}
      var stage    = bfObj.funnel_stage || 'value';
      var feature  = bfObj.feature      || 'all';
      var day      = bfObj.day          || 1;

      var body = '';
      if      (platform === 'Email')     body = _em(day, hook);
      else if (platform === 'TikTok')    body = _tk(stage, feature, hook);
      else if (platform === 'YouTube')   body = _yt(stage, feature, hook);
      else if (platform === 'Instagram') body = _ig(stage, feature, hook, utmUrl);
      else if (platform === 'X')         body = _xp(stage, feature, hook);
      else if (platform === 'Pinterest') body = _pt(stage, feature, hook);
      else if (platform === 'Nextdoor')  body = _nd(stage, feature, hook);
      else                               body = _fb(stage, feature, hook, utmUrl);

      spSheet.getRange(ri + 1, COL['body_copy'] + 1).setValue(body);
      updated++;
    }

    results.push('✓ body_copy filled: ' + updated + ' posts');
    Logger.log('[fillEC2026001SocialBody] ' + results.join(' | '));
    return { ok: true, results: results, updated: updated };

  } catch(e) {
    Logger.log('[fillEC2026001SocialBody] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── easyChef Pro Doc Branding Helpers ────────────────────────────────────────
// Brand: #FF0000 (CTA/section red) · #000000 (body) · #F6EFE8 (beige accent)

function _ecDocCover(body, docType, subtitle, meta) {
  var tbl = body.appendTable([['easyChef Pro', docType], [subtitle, '']]);
  var c00 = tbl.getCell(0, 0);
  c00.setBackgroundColor('#FF0000');
  c00.setPaddingTop(10).setPaddingBottom(10).setPaddingLeft(12).setPaddingRight(12);
  c00.editAsText().setForegroundColor('#FFFFFF').setBold(true).setFontSize(20).setFontFamily('Arial');
  var c01 = tbl.getCell(0, 1);
  c01.setBackgroundColor('#000000');
  c01.setPaddingTop(10).setPaddingBottom(10).setPaddingLeft(12).setPaddingRight(12);
  c01.editAsText().setForegroundColor('#FFFFFF').setItalic(true).setFontSize(11).setFontFamily('Arial');
  var c10 = tbl.getCell(1, 0);
  c10.setBackgroundColor('#F6EFE8');
  c10.setPaddingTop(8).setPaddingBottom(8).setPaddingLeft(12).setPaddingRight(12);
  c10.editAsText().setForegroundColor('#000000').setBold(true).setFontSize(12).setFontFamily('Arial');
  tbl.getCell(1, 1).setBackgroundColor('#F6EFE8');
  if (meta) {
    var mp = body.appendParagraph(meta);
    mp.editAsText().setForegroundColor('#888888').setFontSize(9).setFontFamily('Arial').setItalic(true);
    mp.setSpacingBefore(4);
  }
  body.appendHorizontalRule();
}

function _ecDocSection(body, title) {
  var p = body.appendParagraph(title.toUpperCase());
  p.editAsText().setForegroundColor('#FF0000').setBold(true).setFontSize(12).setFontFamily('Arial');
  p.setSpacingBefore(14).setSpacingAfter(4);
  return p;
}

function _ecDocSubsection(body, title) {
  var p = body.appendParagraph(title);
  p.editAsText().setForegroundColor('#000000').setBold(true).setFontSize(10).setFontFamily('Arial');
  p.setSpacingBefore(8).setSpacingAfter(2);
  return p;
}

// ── Generate LP Figma design spec Google Doc ──────────────────────────────────
// Run via doPost: { "action": "generate_lp_figma_doc" }
// Creates doc in EC-2026-001 campaign folder.

function generateLPFigmaDoc() {
  try {
    var CAMPAIGN_FOLDER_ID = '1O9WYhU7B9MS9aMTUurBRCA5xufE3o8rl';
    var doc  = DocumentApp.create('easyChef Pro — LP Design Spec — EC-2026-001');
    var body = doc.getBody();

    // Move to campaign folder
    try {
      var f = DriveApp.getFileById(doc.getId());
      DriveApp.getFolderById(CAMPAIGN_FOLDER_ID).addFile(f);
      DriveApp.getRootFolder().removeFile(f);
    } catch(me) { Logger.log('[generateLPFigmaDoc] folder move: ' + me.message); }

    var H1 = DocumentApp.ParagraphHeading.HEADING1;
    var H2 = DocumentApp.ParagraphHeading.HEADING2;
    var H3 = DocumentApp.ParagraphHeading.HEADING3;

    _ecDocCover(body, 'LP Design Spec', 'EC-2026-001 · Pre-Launch Arc 2026',
      'May 27 – Jul 1, 2026 · A/B Test Convert 100140422 · Variant A: /lp/waitlist-a · Variant B: /lp/waitlist-b');

    // ── Design Tokens ─────────────────────────────────────────────────────────
    _ecDocSection(body, 'DESIGN TOKENS');
    _ecDocSubsection(body, 'FONTS');
    body.appendParagraph('Headline: Proza Libre Bold\nBody / CTA / Tags: Inter Regular');
    _ecDocSubsection(body, 'COLORS');
    body.appendParagraph(
      'CTA buttons:       #FF0000 (always — no exceptions)\n' +
      'Headlines:         #000000\n' +
      'Body text:         #333333\n' +
      'Background A:      #FFFFFF (primary sections)\n' +
      'Background B:      #F6EFE8 (beige sections — proof bar, alternating)\n' +
      'Section tags:      #FF0000\n' +
      'Dark section bg:   #000000 (urgency/founding section)\n' +
      'FORBIDDEN:         no blue · no navy · no gradient · no orange · no coral'
    );
    _ecDocSubsection(body, 'RULES');
    body.appendParagraph(
      'CTA buttons:  #FF0000 · white Inter text · pill shape · outcome-framed copy · NEVER "sign up"\n' +
      'Section tags: Inter Regular · #FF0000 · UPPERCASE · letter-spacing 2px\n' +
      'Images:       warm kitchen light · real not staged · woman 28-44 · no shame language\n' +
      'Phone rule:   NO PHONE in hero/problem · APPEARS in solve (day 8) · VISIBLE from value onwards'
    );
    body.appendHorizontalRule();

    // ── LP A ──────────────────────────────────────────────────────────────────
    _ecDocSection(body, 'LP A — /lp/waitlist-a');
    body.appendParagraph('Variant A — Money · ICP: super_mom_money · Angle: savings · Convert: Variant A · 50% traffic');

    _ecDocSubsection(body, 'STEP 1 · HOOK');
    body.appendParagraph(
      'Headline:    "Stop the mealtime madness."   [Proza Libre Bold · 52px · #000000]\n' +
      'Subheadline: "$180 in groceries. $47 in DoorDash. And tomorrow you\'ll do it again."   [Inter Regular · 22px · #333333]'
    );

    _ecDocSubsection(body, 'HERO (#FFFFFF background)');
    body.appendParagraph(
      'Eyebrow:    [none]\n' +
      'Headline:   "Stop the Invisible Grocery Leak."   [Proza Libre Bold · 52px · #000000]\n' +
      'Subhead:    "$111 a month. Going straight from your fridge to your garbage."   [Inter Regular · 22px · #333333]\n' +
      'CTA:        "Join the waitlist — early access July 1"   [#FF0000 button · white Inter · pill]\n' +
      'CTA note:   "Free to join. $7.99/month founding price for the first 5,000 families."\n' +
      'Hero image: Warm kitchen 6:30 PM · woman 32-44 · groceries visible · 5 app icons on phone · NO PHONE APP UI · recognition not defeat · not staged'
    );

    _ecDocSubsection(body, 'PROOF BAR (#F6EFE8 · full width)');
    body.appendParagraph(
      '4 stats — Inter Regular · #000000 · centered · equal columns:\n' +
      '"$1,336/year average savings"  |  "30 minutes fridge to table"  |  "69.5% less food waste"  |  "10,000 household profiles"'
    );

    _ecDocSubsection(body, 'PROBLEM SECTION (#FFFFFF)');
    body.appendParagraph(
      'Tag:      "THE PROBLEM"   [Inter · #FF0000 · UPPERCASE]\n' +
      'Headline: "Five apps. None of them talk to each other."   [Proza Libre Bold · 40px]\n' +
      'Body:     "Mealime doesn\'t know your pantry. Your pantry app doesn\'t build your meal plan. Your recipe app doesn\'t know what\'s expiring. The leak runs in the gap between them."\n' +
      'Visual:   5 app logos (Mealime · NoWaste · MyFitnessPal · Recipe · Shopping list) · X marks · arrow → easyChef Pro logo'
    );

    _ecDocSubsection(body, 'SOLUTION SECTION (#F6EFE8)');
    body.appendParagraph(
      'Tag:      "THE FIX"   [Inter · #FF0000 · UPPERCASE]\n' +
      'Headline: "One app closes the full loop."   [Proza Libre Bold · 40px]\n' +
      '5 tiles:  TRACK — Pantry Intelligence (replaces NoWaste)\n' +
      '          PLAN — Meal Planning Engine (replaces Mealime)\n' +
      '          OPTIMIZE — Nutrition Scoring · registered dietitians (replaces MyFitnessPal)\n' +
      '          COOK — Recipe Engine · 30 minutes fridge to table (replaces Recipe apps)\n' +
      '          SHOP — 1-click shopping · 800,000 products (replaces shopping list apps)\n' +
      'Visual:   Phone with TRACK screen · warm light · woman looking at phone (FIRST REVEAL energy)'
    );

    _ecDocSubsection(body, 'PROOF SECTION (#FFFFFF)');
    body.appendParagraph(
      'Tag:      "THE PROOF"   [Inter · #FF0000 · UPPERCASE]\n' +
      'Headline: "The math is real."   [Proza Libre Bold · 40px]\n' +
      'Stats:    $1,336/year average savings\n' +
      '          Families save an average of $111 a month\n' +
      '          69.5% less food waste\n' +
      '          30 minutes fridge to table\n' +
      '          Validated across 10,000 household profiles\n' +
      '          9 patent-pending technologies\n' +
      'Origin:   "Built by first responders"   [Inter Regular · italic · #333333]'
    );

    _ecDocSubsection(body, 'URGENCY SECTION (#000000 · white text)');
    body.appendParagraph(
      'Headline: "First 5,000 families lock in $7.99/month forever."   [Proza Libre Bold · 44px · #FFFFFF]\n' +
      'Subhead:  "The rest pay $19.99. This closes when spots fill."   [Inter Regular · #FFFFFF · 70% opacity]\n' +
      'CTA:      "Join the waitlist now"   [#FF0000 button · white Inter]\n' +
      'Counter:  Founding spots remaining (live if available)'
    );

    _ecDocSubsection(body, 'FOOTER CTA (#F6EFE8)');
    body.appendParagraph(
      'CTA:    "Join the founding family — early access July 1"   [#FF0000 button · full width mobile]\n' +
      'Trial:  "Try easyChef Pro free for 7 days — no credit card"   [Inter · #333333 · 14px]\n' +
      'Legal:  minimal · 11px · Inter · #999999'
    );
    body.appendHorizontalRule();

    // ── LP B ──────────────────────────────────────────────────────────────────
    _ecDocSection(body, 'LP B — /lp/waitlist-b');
    body.appendParagraph('Variant B — Time + Founding Family · ICP: super_mom_time · Angle: time_relief + founding_family · Convert: Variant B · 50% traffic');

    _ecDocSubsection(body, 'STEP 1 · HOOK');
    body.appendParagraph(
      'Headline:    "Daily Dinner Figured Out."   [Proza Libre Bold · 52px · #000000]\n' +
      'Subheadline: "What if dinner was decided before you opened the fridge?"   [Inter Regular · 22px · #333333]'
    );

    _ecDocSubsection(body, 'HERO (#FFFFFF background)');
    body.appendParagraph(
      'Eyebrow:    "FOUNDING FAMILY INVITATION"   [Inter · #FF0000 · UPPERCASE · 12px · letter-spacing 3px]\n' +
      'Headline:   "Daily Dinner Figured Out."   [Proza Libre Bold · 52px · #000000]\n' +
      'Subhead:    "Dinner decided before you open the fridge. The mental load — gone."   [Inter Regular · 22px · #333333]\n' +
      'CTA:        "Get Early Access"   [#FF0000 button · white Inter · pill]\n' +
      'CTA note:   "You\'re joining the founding family. $7.99/month — 60% off forever. First 5,000 only."\n' +
      'Hero image: Woman in kitchen · calm unhurried energy · phone visible (PLAN screen) · warm golden light · kids soft in background · not staged'
    );

    _ecDocSubsection(body, 'PROOF BAR (#F6EFE8 · full width)');
    body.appendParagraph('Same 4-stat bar as LP A.');

    _ecDocSubsection(body, 'PROBLEM SECTION (#FFFFFF)');
    body.appendParagraph(
      'Tag:      "THE PROBLEM"   [Inter · #FF0000 · UPPERCASE]\n' +
      'Headline: "The 6:30 PM wall hits every night."   [Proza Libre Bold · 40px]\n' +
      'Body:     "5 to 10 hours a week deciding what to eat. Five apps open. None of them talking to each other. None of them knowing what\'s in your fridge. The mental load — unbroken."\n' +
      'Visual:   Clock showing 6:30 · capable woman mid-decision · no shame · quiet frustration only'
    );

    _ecDocSubsection(body, 'SOLUTION SECTION (#F6EFE8)');
    body.appendParagraph(
      'Tag:      "THE FIX"   [Inter · #FF0000 · UPPERCASE]\n' +
      'Headline: "Dinner figured out before you open the fridge."   [Proza Libre Bold · 40px]\n' +
      '5 tiles:  [same as LP A]\n' +
      'Visual:   Woman on couch · relaxed · kids settled in background · kitchen clean · phone in hand showing app · deep amber evening light'
    );

    _ecDocSubsection(body, 'PROOF SECTION (#FFFFFF)');
    body.appendParagraph('Same proof section as LP A. Same stats. Same origin note.');

    _ecDocSubsection(body, 'FOUNDING FAMILY SECTION (#000000 · white text)');
    body.appendParagraph(
      'Headline: "You found this before everyone else."   [Proza Libre Bold · 44px · #FFFFFF]\n' +
      'Body:     "The founding family forms now. First 5,000 families. $7.99/month locked forever. The founding price closes when spots fill."\n' +
      'CTA:      "Join the founding family"   [#FF0000 button · white Inter]'
    );

    _ecDocSubsection(body, 'FOOTER CTA (#F6EFE8)');
    body.appendParagraph(
      'CTA:    "Get early access — July 1"   [#FF0000 button · full width mobile]\n' +
      'Trial:  "Try easyChef Pro free for 7 days — no credit card"\n' +
      'Legal:  minimal · 11px · Inter · #999999'
    );

    _ecDocSubsection(body, 'SECTION 04 · DESIGN BRIEF — LP B (Time + Founding Family)');
    body.appendParagraph(
      'ANGLE: Time + Founding Family — dinner decided before she opens the fridge · founding identity resonates\n' +
      'ICP:   super_mom_time · Female 28–44 · household logistics manager · food delivery user · mental-load carrier\n\n' +
      'HERO VISUAL DIRECTION:\n' +
      '  Scene:    Woman in kitchen · calm · unhurried energy · late-afternoon amber light\n' +
      '  Subject:  28–44 · confident not harried · she has found the solution · phone in hand (PLAN screen)\n' +
      '  Kids:     Soft in background · settled · the chaos resolved · not demanding attention\n' +
      '  Mood:     Relief not joy. Mental load lifted. The 6:30 PM wall — gone.\n' +
      '  Lighting: Warm amber · kitchen window · natural light favored · no harsh overhead\n' +
      '  FORBID:   No shame · no defeat · no food delivery bags · no grocery receipts in hero frame\n\n' +
      'PROBLEM SECTION VISUAL:\n' +
      '  Clock at 6:30 PM · capable woman mid-decision · quiet frustration · no shame\n' +
      '  System is broken not her fault — art direction must reflect that\n\n' +
      'FOUNDING SECTION VISUAL:\n' +
      '  Woman on couch post-dinner · kitchen clean behind her · kids settled · peace\n' +
      '  Phone in hand showing app · founding family energy — she found it first\n' +
      '  Dark section (#000000) · white copy · #FF0000 CTA · no additional imagery needed\n\n' +
      'TYPOGRAPHY RULES (LP B specific):\n' +
      '  Hook headline:        Proza Libre Bold · 52px · commanding but calm\n' +
      '  Founding family badge: Inter Regular · #FF0000 · UPPERCASE · letter-spacing 3px\n' +
      '  Body:                 Inter Regular · 18px · #333333 · line-height 1.6\n\n' +
      'WHAT NOT TO SHOW:\n' +
      '  Receipts · grocery math · dollar amounts in hero (time angle — not money angle)\n' +
      '  Overly joyful or celebratory energy (relief · not party)\n' +
      '  Staged perfect-produce kitchen scenes'
    );
    body.appendHorizontalRule();

    // ── Component Inventory ───────────────────────────────────────────────────
    _ecDocSection(body, 'COMPONENT INVENTORY (shared)');
    body.appendParagraph(
      'NavBar:          Logo left · "Join waitlist" CTA right · #FF0000 pill · sticky on scroll\n' +
      'ProofBar:        4-stat horizontal · #F6EFE8 · full width · Inter Regular\n' +
      'FeatureTile:     Icon + FEATURE_NAME label + 1-line description · 5 tiles in grid\n' +
      'StatBlock:       Large number [Proza Bold · 56px] + label [Inter · 16px] · centered\n' +
      'CTAButton:       #FF0000 · white Inter Regular · pill · outcome copy · NEVER "sign up"\n' +
      'SectionTag:      Inter Regular · #FF0000 · UPPERCASE · letter-spacing 2px · 12px\n' +
      'TestimonialBlock: BLOCKED — no invented testimonials · validated stats only\n\n' +
      'MOBILE SPECS:\n' +
      '  All sections stack vertically\n' +
      '  Hero image: full bleed · above fold\n' +
      '  Feature tiles: 1-column stack\n' +
      '  ProofBar: 2×2 grid\n' +
      '  CTA button: full width · 56px height · sticky bottom bar on mobile\n\n' +
      'ACCESSIBILITY:\n' +
      '  All CTAs: aria-label with outcome text\n' +
      '  Images: descriptive alt text (no marketing copy)\n' +
      '  Color contrast: #333333 on #FFFFFF passes WCAG AA\n\n' +
      'CONVERT.COM:\n' +
      '  Experience ID: 100140422\n' +
      '  Variant A: /lp/waitlist-a (control · money/savings hero)\n' +
      '  Variant B: /lp/waitlist-b (challenger · time/founding hero)\n' +
      '  Split: 50/50\n' +
      '  Goal: waitlist signup form submit\n' +
      '  Clarity: wjxhprug80 · GA4: G-Q4DYEEXFKV'
    );

    // ── Section 08: Tracking & Deep Links ────────────────────────────────────
    _ecDocSection(body, 'SECTION 08 · TRACKING & DEEP LINKS');
    body.appendParagraph('Active DL_IDs for EC-2026-001 — read live from DeepLinkRegistry at doc generation time');

    var DL_PREFIX_MAP = {
      'EM': 'Email', 'FB': 'Facebook', 'IG': 'Instagram',
      'PT': 'Pinterest', 'ND': 'Nextdoor', 'X': 'X',
      'TK': 'TikTok', 'YT': 'YouTube', 'LP': 'LP'
    };
    var dlSheet8  = _getCCSheet(_CC_TAB.DL);
    var dlLast8   = dlSheet8.getLastRow();
    var dlByPlat8 = {};

    if (dlLast8 >= 2) {
      var dlData8 = dlSheet8.getRange(2, 1, dlLast8 - 1, 9).getValues();
      for (var di8 = 0; di8 < dlData8.length; di8++) {
        var dr = dlData8[di8];
        var dlId8  = String(dr[0]).trim();
        var camId8 = String(dr[2]).trim();
        var stat8  = String(dr[8]).trim().toLowerCase();
        if (camId8 !== 'EC-2026-001' || stat8 !== 'active' || !dlId8) continue;
        var seg8  = dlId8.replace(/^DL-/, '').split('-')[0];
        var plat8 = DL_PREFIX_MAP[seg8] || seg8;
        if (!dlByPlat8[plat8]) dlByPlat8[plat8] = [];
        dlByPlat8[plat8].push(dlId8);
      }
    }

    var PLAT_ORD8  = ['Facebook','Instagram','Pinterest','Nextdoor','X','TikTok','YouTube','Email','LP'];
    var dlSumLines = [];
    for (var pi8 = 0; pi8 < PLAT_ORD8.length; pi8++) {
      var plat8n = PLAT_ORD8[pi8];
      var ids8   = dlByPlat8[plat8n] || [];
      if (!ids8.length) { dlSumLines.push(plat8n + ': — (0 active IDs)'); continue; }
      ids8.sort();
      var cnt8 = ids8.length;
      if (plat8n === 'Email') {
        var base8 = ids8.filter(function(id) { return !/\-B$/.test(id); });
        var bvar8 = ids8.filter(function(id) { return /\-B$/.test(id); });
        if (base8.length && bvar8.length) {
          dlSumLines.push('Email: ' + base8[0] + ' – ' + base8[base8.length-1] + ' + B variants (' + cnt8 + ' IDs)');
          continue;
        }
      }
      if (plat8n === 'LP') { dlSumLines.push('LP: ' + ids8.join(' · ') + ' (' + cnt8 + ' IDs)'); continue; }
      if (cnt8 === 1) { dlSumLines.push(plat8n + ': ' + ids8[0] + ' (1 ID)'); continue; }
      dlSumLines.push(plat8n + ': ' + ids8[0] + ' – ' + ids8[cnt8-1] + ' (' + cnt8 + ' IDs)');
    }

    _ecDocSubsection(body, 'ACTIVE DL_IDs BY PLATFORM');
    body.appendParagraph(dlSumLines.join('\n') || 'No active DL IDs found in DeepLinkRegistry for EC-2026-001');

    _ecDocSubsection(body, 'ANALYTICS');
    body.appendParagraph(
      'GA4:     G-Q4DYEEXFKV · Stream: 6500506359\n' +
      'Clarity: wjxhprug80\n' +
      'Convert: Experience 100140422 · 50/50 split\n' +
      '         Variant A → /lp/waitlist-a (money/savings)\n' +
      '         Variant B → /lp/waitlist-b (time/founding family)\n' +
      '         Goal: waitlist signup form submit\n' +
      'Klaviyo: letscook@easychef.io'
    );

    doc.saveAndClose();
    var docUrl = 'https://docs.google.com/document/d/' + doc.getId() + '/edit';
    Logger.log('[generateLPFigmaDoc] created: ' + docUrl);
    return { ok: true, doc_url: docUrl, doc_id: doc.getId() };

  } catch(e) {
    Logger.log('[generateLPFigmaDoc] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── EC-2026-001 Campaign Creative Brief Doc ───────────────────────────────────
// Generates a human-readable branded Google Doc with full creative briefs for
// every post, grouped by platform. Reads live from SocialPosts sheet.
// Run via doPost: { "action": "generate_ec2026001_brief_doc" }

function generateEC2026001BriefDoc() {
  try {
    var CAMPAIGN_FOLDER_ID = '1O9WYhU7B9MS9aMTUurBRCA5xufE3o8rl';
    var doc  = DocumentApp.create('easyChef Pro — Campaign Creative Brief — EC-2026-001');
    var body = doc.getBody();

    try {
      var f = DriveApp.getFileById(doc.getId());
      DriveApp.getFolderById(CAMPAIGN_FOLDER_ID).addFile(f);
      DriveApp.getRootFolder().removeFile(f);
    } catch(me) { Logger.log('[generateEC2026001BriefDoc] folder: ' + me.message); }

    var H1 = DocumentApp.ParagraphHeading.HEADING1;
    var H2 = DocumentApp.ParagraphHeading.HEADING2;
    var H3 = DocumentApp.ParagraphHeading.HEADING3;

    // ── Cover ────────────────────────────────────────────────────────────────
    _ecDocCover(
      body,
      'Campaign Creative Brief',
      'EC-2026-001 · Pre-Launch Arc 2026 — The Invisible Leak',
      'Campaign: May 27 – Jun 30, 2026 · Launch: July 1, 2026 · 35 days · 218 posts\n' +
      'Generated: ' + Utilities.formatDate(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd HH:mm z')
    );

    // ── Campaign Overview ─────────────────────────────────────────────────────
    _ecDocSection(body, 'CAMPAIGN OVERVIEW');
    body.appendParagraph(
      'What this campaign does:\n' +
      'Builds a waitlist of 5,000 founding families in 35 days before the July 1 launch of easyChef Pro.\n\n' +
      'The hook:\n' +
      '"You have an invisible leak — $111/month in groceries that expire before they become dinner."\n\n' +
      'The solution:\n' +
      'easyChef Pro is the only app that closes the full kitchen loop:\n' +
      '  TRACK pantry → PLAN meals → OPTIMIZE nutrition → COOK from what you have → SHOP what you need\n\n' +
      'The offer:\n' +
      '  Founding price: $7.99/month (60% off forever) — first 5,000 families only\n' +
      '  Free to join the waitlist\n' +
      '  7-day free trial at launch\n\n' +
      'A/B Test — Convert.com Experience 100140422 · 50/50 split:\n' +
      '  LP A → easychefpro.com/lp/waitlist-a — Money/savings angle · ICP: super_mom_money\n' +
      '  LP B → easychefpro.com/lp/waitlist-b — Time/founding family angle · ICP: super_mom_time'
    );
    body.appendHorizontalRule();

    // ── Brand System ──────────────────────────────────────────────────────────
    _ecDocSection(body, 'BRAND SYSTEM');
    body.appendParagraph(
      'COLORS\n' +
      '  CTA buttons:     #FF0000 — always, no exceptions\n' +
      '  Headlines:       #000000\n' +
      '  Body text:       #333333\n' +
      '  Background:      #FFFFFF (primary) · #F6EFE8 beige (accent)\n' +
      '  Dark sections:   #000000 with white text\n' +
      '  FORBIDDEN:       blue · navy · gradient · orange · coral\n\n' +
      'FONTS\n' +
      '  Headlines: Proza Libre Bold\n' +
      '  Body / CTA / Tags: Inter Regular\n\n' +
      'VOICE\n' +
      '  Empathetic — the system is broken, not her\n' +
      '  Specific — $111/month · $1,336/year · 30 minutes · 69.5% less waste\n' +
      '  Founding family energy — she found this first\n' +
      '  NEVER: "sign up" · invented testimonials · real names without consent\n\n' +
      'PHONE RULE\n' +
      '  Days 1–7 (hook/problem): NO PHONE in frame\n' +
      '  Days 8–14 (solve): FIRST REVEAL — warm light on device\n' +
      '  Days 15+ (value/proof/cta): PHONE VISIBLE — outcomes not features'
    );
    body.appendHorizontalRule();

    // ── 35-Day Arc ────────────────────────────────────────────────────────────
    _ecDocSection(body, '35-DAY CAMPAIGN ARC');
    body.appendParagraph(
      'Week 1 — Days 1–7  — HOOK + PROBLEM\n' +
      '  Establish the invisible leak. Real kitchens. Real frustration. No phone yet.\n\n' +
      'Week 2 — Days 8–14 — AGITATE + SOLVE\n' +
      '  Deepen the pain. Introduce easyChef Pro for the first time. First reveal.\n\n' +
      'Week 3 — Days 15–21 — VALUE\n' +
      '  Walk through each feature. TRACK → PLAN → OPTIMIZE → COOK → SHOP.\n\n' +
      'Week 4 — Days 22–28 — PROOF + URGENCY\n' +
      '  Stats. Validation. $1,336/year. Founding family scarcity.\n\n' +
      'Week 5 — Days 29–35 — CTA + LAUNCH\n' +
      '  Close hard. Countdown. July 1 launch day energy.'
    );
    body.appendHorizontalRule();

    // ── Read SocialPosts ──────────────────────────────────────────────────────
    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var spLast  = spSheet.getLastRow();
    var posts   = {};

    if (spLast >= 2) {
      var spRows = spSheet.getRange(2, 1, spLast - 1, 16).getValues();
      for (var si = 0; si < spRows.length; si++) {
        var sr = spRows[si];
        if (String(sr[1]) !== 'EC-2026-001') continue;
        var plat  = String(sr[2]);
        var brief = {};
        try { brief = JSON.parse(String(sr[15])); } catch(pe) {}
        if (!posts[plat]) posts[plat] = [];
        var pspecs = brief.platform_specs || {};
        posts[plat].push({
          id:               String(sr[0]),
          hook_a:           brief.hook_a            || String(sr[3]),
          hook_b:           brief.hook_b            || '',
          scene:            brief.scene_direction   || String(sr[7]),
          stage:            brief.funnel_stage      || '',
          day:              Number(brief.day)        || 0,
          date:             String(sr[9]),
          dl_id:            String(sr[12]),
          hashtags:         String(sr[6]),
          cta:              String(sr[5]),
          phone:            brief.phone_visibility  ? 'VISIBLE' : 'NO PHONE',
          emotional_state:  brief.emotional_state   || '',
          objective:        brief.objective         || '',
          visual_tone:      brief.visual_tone       || '',
          camera_style:     brief.camera_style      || '',
          platform_specs:   pspecs,
          what_not_to_show: brief.what_not_to_show  || [],
          scene_sequence:   brief.scene_sequence    || [],
          story_arc:        brief.story_arc         || [],
          audio_direction:  brief.audio_direction   || '',
          motion_direction: brief.motion_direction  || '',
          duration_target:  pspecs.duration_target  || '',
          copy_density:     brief.copy_density      || ''
        });
      }
      var platKeys = Object.keys(posts);
      for (var pk = 0; pk < platKeys.length; pk++) {
        posts[platKeys[pk]].sort(function(a, b) { return a.day - b.day; });
      }
    }

    // ── Per-Platform Briefs ───────────────────────────────────────────────────
    var PLAT_ORDER = ['Facebook','Instagram','Pinterest','Nextdoor','X','TikTok','YouTube','Email'];
    for (var pli = 0; pli < PLAT_ORDER.length; pli++) {
      var plat    = PLAT_ORDER[pli];
      var pPosts  = posts[plat] || [];
      if (!pPosts.length) continue;

      _ecDocSection(body, plat.toUpperCase() + ' — ' + pPosts.length + ' POSTS');

      var lastWeek = 0;
      for (var pi = 0; pi < pPosts.length; pi++) {
        var p    = pPosts[pi];
        var week = Math.ceil((p.day || 1) / 7);
        if (week !== lastWeek) {
          _ecDocSubsection(body, 'WEEK ' + week + ' · DAYS ' + ((week-1)*7+1) + '–' + (week*7));
          lastWeek = week;
        }
        var hook_b_line = p.hook_b ? 'Hook B (Time/Founding Family): ' + p.hook_b : '';
        var tags_line   = p.hashtags && p.hashtags !== 'undefined' && p.hashtags !== ''
          ? 'Hashtags: ' + p.hashtags : '';
        var wnt_line    = p.what_not_to_show && p.what_not_to_show.length
          ? 'DO NOT SHOW: ' + p.what_not_to_show.join(' · ') : '';
        var spec_line   = p.platform_specs && p.platform_specs.size
          ? 'Specs: ' + p.platform_specs.size + ' · ' + (p.platform_specs.ratio || '') +
            (p.duration_target ? ' · ' + p.duration_target : '') +
            ' · format: ' + (p.platform_specs.format || 'PNG') : '';
        var video_parts = [];
        if (p.scene_sequence && p.scene_sequence.length)
          video_parts.push('Sequence: ' + p.scene_sequence.map(function(s, i){ return (i+1) + '. ' + s; }).join(' · '));
        if (p.story_arc && p.story_arc.length)
          video_parts.push('Arc: ' + p.story_arc.join(' → '));
        if (p.audio_direction)   video_parts.push('Audio: ' + p.audio_direction);
        if (p.motion_direction)  video_parts.push('Motion: ' + p.motion_direction);
        var lines = [
          'Day ' + p.day + '  ·  ' + p.date + '  ·  DL_ID: ' + (p.dl_id || '—') +
            '  ·  Stage: ' + p.stage + '  ·  Emotional: ' + (p.emotional_state || '—') +
            '  ·  Phone: ' + p.phone,
          'Objective: ' + (p.objective || '—') + '  ·  Visual Tone: ' + (p.visual_tone || '—') +
            '  ·  Camera: ' + (p.camera_style || '—'),
          'Hook A (Money/Savings): ' + (p.hook_a || '—'),
          hook_b_line,
          'Scene: ' + (String(p.scene || '').split('·').slice(0, 5).join(' · ').trim()),
          wnt_line,
          video_parts.length ? video_parts.join('\n') : '',
          tags_line,
          spec_line,
          'CTA: ' + (p.cta || '—')
        ].filter(Boolean).join('\n');
        body.appendParagraph(lines);
      }
      body.appendHorizontalRule();
    }

    // ── Email Sequences Summary ───────────────────────────────────────────────
    _ecDocSection(body, 'EMAIL SEQUENCES');
    body.appendParagraph(
      'SEQ-1 (Welcome + Days 0-6) — DL-EM-0001 / DL-EM-0001-B\n' +
      '  E1 Day 0: Waitlist confirmation — trigger: waitlist_signup_completed\n' +
      '  E2 Day 3: The leak named — nurture\n' +
      '  E3 Day 6: The gap between apps — nurture\n\n' +
      'SEQ-2 (Feature walkthrough — Days 8-21) — DL-EM-0002 / DL-EM-0002-B\n' +
      '  E1 Day 8: TRACK — Pantry Intelligence\n' +
      '  E2 Day 12: PLAN — Meal Planning Engine\n' +
      '  E3 Day 15: OPTIMIZE — Nutrition Scoring\n' +
      '  E4 Day 18: COOK — 30 minutes fridge to table\n' +
      '  E5 Day 21: SHOP — 1-click to cart\n\n' +
      'SEQ-3 (Proof + Urgency — Days 22-29) — DL-EM-0003 / DL-EM-0003-B\n' +
      '  E1 Day 22: The math — $1,336/year\n' +
      '  E2 Day 24: 10,000 households validated\n' +
      '  E3 Day 27: First 5,000 only\n' +
      '  E4 Day 29: Founding price closes\n\n' +
      'SEQ-4 (Launch Day — Day 35) — DL-EM-0004 / DL-EM-0004-B\n' +
      '  E1 Day 35: The leak is closed. July 1. Now.'
    );

    doc.saveAndClose();
    var briefUrl = 'https://docs.google.com/document/d/' + doc.getId() + '/edit';
    Logger.log('[generateEC2026001BriefDoc] created: ' + briefUrl);
    var totalPosts = 0;
    var pKeys = Object.keys(posts);
    for (var tk = 0; tk < pKeys.length; tk++) totalPosts += posts[pKeys[tk]].length;
    return { ok: true, doc_url: briefUrl, doc_id: doc.getId(), post_count: totalPosts };

  } catch(e) {
    Logger.log('[generateEC2026001BriefDoc] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── Upgrade EC-2026-001 Design Briefs to Universal Creative Brief Schema ─────
// Enriches design_brief JSON for all 218 posts with full UCBS fields.
// Run via doPost: { "action": "upgrade_ec2026001_design_briefs" }

function upgradeEC2026001DesignBriefs() {
  try {
    var EMOTIONAL = {
      hook:'exhausted', problem:'frustrated', agitate:'overwhelmed',
      solve:'hopeful', value:'curious', proof:'convinced',
      urgency:'motivated', cta:'ready', launch:'excited'
    };
    var OBJECTIVE = {
      hook:'pattern_interruption', problem:'emotional_recognition',
      agitate:'pain_amplification', solve:'belief_transfer',
      value:'feature_understanding', proof:'trust_building',
      urgency:'scarcity_activation', cta:'conversion', launch:'social_proof'
    };
    var VISUAL_TONE = {
      hook:'warm dim cinematic realism', problem:'warm amber with soft shadows',
      agitate:'desaturated heavy grain', solve:'warm soft reveal',
      value:'clean modern bright', proof:'confident editorial',
      urgency:'high contrast bold', cta:'warm bold red accent', launch:'celebration warm'
    };
    var ASSET_TYPE = {
      Facebook:'social_post', Instagram:'social_post', Pinterest:'social_post',
      Nextdoor:'social_post', X:'social_post',
      TikTok:'short_form_video', YouTube:'youtube_short', Email:'email'
    };
    var CAMERA = {
      Facebook:'slight handheld realism', Instagram:'slight handheld realism',
      Pinterest:'editorial lifestyle still', Nextdoor:'documentary neighborhood style',
      X:'editorial still', TikTok:'handheld authentic',
      YouTube:'slightly stabilized lifestyle realism', Email:'editorial warm'
    };
    var LAYOUT = {
      Facebook:'image dominant · minimal text overlay',
      Instagram:'image dominant · minimal text overlay',
      Pinterest:'vertical image dominant · keyword text below',
      Nextdoor:'community-feel · neighborhood context',
      X:'bold headline over image · high contrast',
      TikTok:'full-bleed vertical · bold captions bottom third',
      YouTube:'full-bleed vertical · narrative progression',
      Email:'single column · hero-first'
    };
    var PLAT_SPECS = {
      Facebook:  { ratio:'4:5',  size:'1080x1350', format:'PNG' },
      Instagram: { ratio:'4:5',  size:'1080x1350', format:'PNG' },
      Pinterest: { ratio:'2:3',  size:'1000x1500', format:'PNG' },
      Nextdoor:  { ratio:'1:1',  size:'1080x1080', format:'PNG' },
      X:         { ratio:'16:9', size:'1200x675',  format:'PNG' },
      TikTok:    { ratio:'9:16', size:'1080x1920', format:'MP4', duration_target:'15-22s' },
      YouTube:   { ratio:'9:16', size:'1080x1920', format:'MP4', duration_target:'30-45s' },
      Email:     { width:'600px', layout:'single_column', format:'HTML' }
    };
    var WNTSHOW_STAGE = {
      hook:    ['smiling forced joy','app UI','product reveal','bright polished lighting'],
      problem: ['phone app screens','solution reveal','smiling cheerful lighting'],
      agitate: ['solutions','positivity','app screens','relief'],
      solve:   ['overproduced acting','corporate energy','dollar amounts in hero (time LP)'],
      value:   ['invented testimonials','competitor logos'],
      proof:   ['invented testimonials','real names without consent','manufactured urgency'],
      urgency: ['false scarcity claims','desperation energy'],
      cta:     ['multiple competing CTAs','clutter'],
      launch:  ['unfulfilled promises']
    };
    var WNTSHOW_PLAT = {
      TikTok:   ['polished commercial lighting','overproduced acting','feature explanations'],
      YouTube:  ['corporate SaaS energy','fake influencer acting','feature bullet lists'],
      Email:    ['dashboard screenshots','feature grids','corporate design','SaaS newsletter energy'],
      Pinterest:['text-heavy images','low resolution photography']
    };
    var BRAND_RULES = [
      'CTA color: #FF0000 — always, no exceptions',
      'Headlines: #000000 · Body text: #333333',
      'Background primary: #FFFFFF · Accent: #F6EFE8 beige',
      'Fonts: Proza Libre Bold (headlines) · Inter Regular (body/CTA/tags)',
      'NEVER "sign up" — use outcome-framed CTAs',
      'NEVER invented testimonials or real names without consent',
      'FORBIDDEN colors: blue · navy · gradient · orange · coral'
    ];
    var TK_AUDIO = {
      hook:    'quiet kitchen ambience · emotional music rise',
      problem: 'quiet kitchen tension · distant family sounds',
      agitate: 'building tension · no resolution',
      solve:   'shift to warm hopeful underscore at reveal',
      value:   'bright functional upbeat',
      proof:   'confident rhythm · validation energy',
      urgency: 'urgent beat · countdown energy',
      cta:     'momentum build · close hard',
      launch:  'celebration energy · launch day beat'
    };
    var YT_ARCS = {
      hook:    ['Dinner stress established','Recognition moment','Curiosity raised','Hold'],
      problem: ['Pain framing','Real kitchen scene','Emotional peak','Question left open'],
      agitate: ['Pain amplified','Multiple failures','Breaking point','Question left open'],
      solve:   ['Dinner stress','Recognition','Discovery of easyChef Pro','Relief'],
      value:   ['Feature introduced','Demonstration','Outcome revealed','CTA bridge'],
      proof:   ['Stat reveal','Validation moment','Belief shift','CTA'],
      urgency: ['Scarcity framed','Founding family energy','Decision moment','Hard CTA'],
      cta:     ['Final tension','Solution reminder','Founding offer','Convert'],
      launch:  ['Launch day energy','Access confirmed','Celebration','Share CTA']
    };

    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var lastRow = spSheet.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'SocialPosts empty' };

    var rows = spSheet.getRange(2, 1, lastRow - 1, 16).getValues();
    var updated = 0;

    var newCol16 = rows.map(function(row) {
      if (String(row[1]) !== 'EC-2026-001') return [row[15]];

      var platform = String(row[2]);
      var cta      = String(row[5]);
      var existing = {};
      try { existing = JSON.parse(String(row[15])); } catch(e) {}
      var stage = existing.funnel_stage || '';

      var wntBase = WNTSHOW_STAGE[stage]    || [];
      var wntPlat = WNTSHOW_PLAT[platform]  || [];
      var wntMerged = wntBase.concat(wntPlat.filter(function(v) {
        return wntBase.indexOf(v) < 0;
      }));

      var brief = {
        asset_type:       ASSET_TYPE[platform]   || 'social_post',
        platform:         platform,
        campaign_id:      'EC-2026-001',
        theme:            'Pre-Launch Arc — The Invisible Leak',
        day:              existing.day            || 0,
        funnel_stage:     stage,
        emotional_state:  EMOTIONAL[stage]        || '',
        objective:        OBJECTIVE[stage]         || '',
        hook_a:           existing.hook_a          || '',
        hook_b:           existing.hook_b          || '',
        scene_direction:  existing.scene_direction || '',
        visual_tone:      VISUAL_TONE[stage]       || '',
        camera_style:     CAMERA[platform]         || '',
        layout_direction: LAYOUT[platform]         || '',
        phone_visibility: existing.phone_visibility != null ? existing.phone_visibility : false,
        cta:              cta,
        what_not_to_show: wntMerged,
        brand_rules:      BRAND_RULES,
        platform_specs:   PLAT_SPECS[platform]    || {},
        motion_direction: '',
        audio_direction:  '',
        export_requirements: PLAT_SPECS[platform] || {}
      };

      if (platform === 'TikTok') {
        brief.opening_hook       = existing.hook_a || '';
        var rawScene = String(existing.scene_direction || '');
        brief.scene_sequence     = rawScene
          ? rawScene.split('·').map(function(s){ return s.trim(); }).filter(Boolean)
          : [];
        brief.editing_style      = 'fast cuts first 3 seconds · emotional pacing after';
        brief.text_overlay_style = 'minimal bold captions · bottom third';
        brief.audio_direction    = TK_AUDIO[stage]  || 'warm emotional underscore';
        brief.motion_direction   = 'authentic handheld · no stabilization in hook/problem';
      }

      if (platform === 'YouTube') {
        brief.opening_pattern  = '3-second emotional tension';
        brief.story_arc        = YT_ARCS[stage] || ['Hook','Build','Reveal','CTA'];
        brief.motion_direction = (stage === 'hook' || stage === 'problem')
          ? 'slow push into scene · handheld realism'
          : 'smooth transitions · lifestyle warmth';
        brief.audio_direction  = 'emotional music underscore · voiceover optional';
      }

      if (platform === 'Email') {
        brief.header_image_direction = existing.scene_direction || '';
        brief.copy_density = (stage === 'hook' || stage === 'problem') ? 'low'
          : (stage === 'value') ? 'medium-high' : 'medium';
        brief.cta_style = { color: '#FF0000', placement: 'above_ps', copy: cta };
      }

      updated++;
      return [JSON.stringify(brief)];
    });

    spSheet.getRange(2, 16, newCol16.length, 1).setValues(newCol16);
    Logger.log('[upgradeEC2026001DesignBriefs] updated: ' + updated);
    return { ok: true, updated: updated };

  } catch(e) {
    Logger.log('[upgradeEC2026001DesignBriefs] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── Governance QA Pass — EC-2026-001 SocialPosts Design Briefs ───────────────
// Checks all 218 design_brief JSON records against 10 rules.
// Read-only — no writes, no regeneration.
// Run via doPost: { "action": "qa_ec2026001_design_briefs" }

function qaEC2026001DesignBriefs() {
  try {
    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var lastRow = spSheet.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'SocialPosts empty' };

    var allRows = spSheet.getRange(2, 1, lastRow - 1, 16).getValues();

    var REQUIRED = [
      'asset_type','platform','campaign_id','funnel_stage',
      'emotional_state','objective','hook_a','hook_b',
      'scene_direction','visual_tone','camera_style','layout_direction',
      'phone_visibility','cta','what_not_to_show','caption_opening',
      'platform_specs','brand_rules'
    ];

    var BANNED = [
      '$111','$112','$1500','70%','revolutionary','game-changing',
      'seamless','leverage','ecosystem','pain points',
      'the app','effortlessly','Built by parents'
    ];

    // Phone-adjacent terms banned from scene_direction on days 1-3
    var PHONE_TERMS_RE = /\b(phone|iphone|android|smartphone|screen|device|ui|app)\b/i;

    var report = {
      total_checked:    0,
      total_valid:      0,
      total_violations: 0,
      violations_by_rule: {
        R01_invalid_json:   { count:0, rows:[] },
        R02_missing_fields: { count:0, rows:[] },
        R03_phone_rule:     { count:0, rows:[] },
        R04_banned_phrases: { count:0, rows:[] },
        R05_cta:            { count:0, rows:[] },
        R06_dl_id:          { count:0, rows:[] },
        R07_platform_specs: { count:0, rows:[] },
        R08_tiktok_fields:  { count:0, rows:[] },
        R09_youtube_fields: { count:0, rows:[] },
        R10_email_fields:   { count:0, rows:[] }
      },
      rows_needing_fix: []
    };

    function flag(ruleId, sheetRow, postId, platform, detail) {
      var r = report.violations_by_rule[ruleId];
      r.count++;
      r.rows.push({ sheet_row: sheetRow, post_id: postId, platform: platform, detail: detail });
      report.total_violations++;
      if (report.rows_needing_fix.indexOf(sheetRow) < 0)
        report.rows_needing_fix.push(sheetRow);
    }

    // Gather creative copy fields only (not schema/brand_rules/specs)
    function creativeText(b) {
      var parts = [
        b.hook_a, b.hook_b, b.scene_direction, b.caption_opening,
        b.subject_line, b.preview_text, b.header_image_direction,
        b.opening_hook, b.audio_direction, b.motion_direction
      ];
      if (Array.isArray(b.scene_sequence)) b.scene_sequence.forEach(function(s){ parts.push(s); });
      if (Array.isArray(b.story_arc))      b.story_arc.forEach(function(s){ parts.push(s); });
      return parts.filter(Boolean).join(' ');
    }

    for (var i = 0; i < allRows.length; i++) {
      var row = allRows[i];
      if (String(row[1]) !== 'EC-2026-001') continue;

      var sheetRow = i + 2;
      var postId   = String(row[0]);
      var platform = String(row[2]);
      var dlId     = String(row[12]);
      var rowViol  = 0;
      report.total_checked++;

      // ── R01: Valid JSON ────────────────────────────────────────────────────
      var b = null;
      try {
        b = JSON.parse(String(row[15]));
        if (typeof b !== 'object' || b === null) throw new Error('not object');
      } catch(je) {
        flag('R01_invalid_json', sheetRow, postId, platform, je.message);
        rowViol++;
        report.total_violations += rowViol; // already counted in flag
        // can't check further without valid JSON
        continue;
      }

      // ── R02: Missing required fields ───────────────────────────────────────
      var missing = [];
      for (var rf = 0; rf < REQUIRED.length; rf++) {
        var fld = REQUIRED[rf];
        var v   = b[fld];
        if (v === undefined || v === null || v === '') {
          missing.push(fld);
        } else if (Array.isArray(v) && v.length === 0) {
          missing.push(fld + '[]');
        } else if (fld === 'platform_specs' && typeof v === 'object' && Object.keys(v).length === 0) {
          missing.push('platform_specs{}');
        }
      }
      if (missing.length) {
        flag('R02_missing_fields', sheetRow, postId, platform, missing.join(', '));
        rowViol++;
      }

      // ── R03: Phone rule ────────────────────────────────────────────────────
      var day = Number(b.day) || 0;
      if (day >= 1 && day <= 3) {
        if (b.phone_visibility === true) {
          flag('R03_phone_rule', sheetRow, postId, platform,
            'Day ' + day + ': phone_visibility=true (must be false days 1-3)');
          rowViol++;
        }
        var sceneCheck = String(b.scene_direction || '');
        if (PHONE_TERMS_RE.test(sceneCheck)) {
          var found3 = [];
          ['phone','iphone','android','smartphone','screen','device','ui','app'].forEach(function(t){
            if (new RegExp('\\b' + t + '\\b','i').test(sceneCheck)) found3.push(t);
          });
          if (found3.length) {
            flag('R03_phone_rule', sheetRow, postId, platform,
              'Day ' + day + ': scene_direction has banned terms [' + found3.join(', ') + ']');
            rowViol++;
          }
        }
        // Also check hook_a and hook_b
        var hookText3 = (String(b.hook_a||'') + ' ' + String(b.hook_b||'')).toLowerCase();
        if (/\b(phone|screen|device|app)\b/.test(hookText3)) {
          flag('R03_phone_rule', sheetRow, postId, platform,
            'Day ' + day + ': hook copy contains phone/screen/device/app');
          rowViol++;
        }
      }
      if (day === 4) {
        if (b.phone_visibility !== true) {
          flag('R03_phone_rule', sheetRow, postId, platform,
            'Day 4 (first reveal): phone_visibility should be true');
          rowViol++;
        }
      }

      // ── R04: Banned phrases ────────────────────────────────────────────────
      var cText = creativeText(b).toLowerCase();
      var bannedHits = [];
      for (var bx = 0; bx < BANNED.length; bx++) {
        if (cText.indexOf(BANNED[bx].toLowerCase()) >= 0) bannedHits.push(BANNED[bx]);
      }
      // "optimize" as a verb is banned; "optimize screen" (the app feature label) is allowed
      if (/\boptimize\b(?! screen)/i.test(cText)) bannedHits.push('optimize (verb)');
      if (bannedHits.length) {
        flag('R04_banned_phrases', sheetRow, postId, platform, bannedHits.join(' · '));
        rowViol++;
      }

      // ── R05: CTA consistency ───────────────────────────────────────────────
      var cta = String(b.cta || '');
      if (!cta) {
        flag('R05_cta', sheetRow, postId, platform, 'cta field empty');
        rowViol++;
      } else {
        if (cta.toLowerCase().indexOf('easychefpro.com') < 0) {
          flag('R05_cta', sheetRow, postId, platform,
            'CTA missing easychefpro.com domain: "' + cta.slice(0,80) + '"');
          rowViol++;
        }
        if (/\bsign up\b/i.test(cta)) {
          flag('R05_cta', sheetRow, postId, platform, 'CTA contains banned phrase "sign up"');
          rowViol++;
        }
      }

      // ── R06: DL_ID presence ───────────────────────────────────────────────
      if (!dlId || dlId === '—' || dlId === 'undefined' || dlId.trim() === '') {
        flag('R06_dl_id', sheetRow, postId, platform, 'DL_ID missing or blank');
        rowViol++;
      }

      // ── R07: Platform specs ───────────────────────────────────────────────
      var specs = b.platform_specs || {};
      var specsOk = (platform === 'Email')
        ? !!specs.width
        : !!(specs.size && specs.ratio);
      if (!specsOk) {
        flag('R07_platform_specs', sheetRow, postId, platform,
          'platform_specs missing size+ratio (or width for Email). Has: ' + JSON.stringify(specs).slice(0,60));
        rowViol++;
      }

      // ── R08: TikTok required fields ───────────────────────────────────────
      if (platform === 'TikTok') {
        if (!Array.isArray(b.scene_sequence) || b.scene_sequence.length < 3) {
          flag('R08_tiktok_fields', sheetRow, postId, platform,
            'scene_sequence missing or < 3 beats (has ' + (Array.isArray(b.scene_sequence) ? b.scene_sequence.length : 0) + ')');
          rowViol++;
        }
        if (!b.audio_direction || String(b.audio_direction).trim() === '') {
          flag('R08_tiktok_fields', sheetRow, postId, platform, 'audio_direction missing');
          rowViol++;
        }
      }

      // ── R09: YouTube required fields ──────────────────────────────────────
      if (platform === 'YouTube') {
        if (!Array.isArray(b.story_arc) || b.story_arc.length < 3) {
          flag('R09_youtube_fields', sheetRow, postId, platform,
            'story_arc missing or < 3 beats (has ' + (Array.isArray(b.story_arc) ? b.story_arc.length : 0) + ')');
          rowViol++;
        }
        if (!b.opening_hook || String(b.opening_hook).trim() === '') {
          flag('R09_youtube_fields', sheetRow, postId, platform, 'opening_hook missing');
          rowViol++;
        }
      }

      // ── R10: Email required fields ────────────────────────────────────────
      if (platform === 'Email') {
        var emMissing = [];
        if (!b.subject_line)           emMissing.push('subject_line');
        if (!b.preview_text)           emMissing.push('preview_text');
        if (!b.header_image_direction) emMissing.push('header_image_direction');
        if (emMissing.length) {
          flag('R10_email_fields', sheetRow, postId, platform, emMissing.join(', '));
          rowViol++;
        }
      }

      if (rowViol === 0) report.total_valid++;
    }

    report.rows_needing_fix.sort(function(a, b) { return a - b; });
    Logger.log('[qaEC2026001DesignBriefs] checked:' + report.total_checked +
               ' valid:' + report.total_valid + ' violations:' + report.total_violations);
    return { ok: true, report: report };

  } catch(e) {
    Logger.log('[qaEC2026001DesignBriefs] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── QA Fix A — Data issues (no GPT) ──────────────────────────────────────────
// 1. Day 4 posts: phone_visibility → true (first reveal rule)
// 2. "Built by parents" → "Built by first responders" (factual error)
// Run via doPost: { "action": "fix_ec2026001_data_issues" }

function fixEC2026001DataIssues() {
  try {
    var results  = [];
    var spSheet  = _getCCSheet(_CC_TAB.SOCIAL);
    var lastRow  = spSheet.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'SocialPosts empty' };

    var rows = spSheet.getRange(2, 1, lastRow - 1, 16).getValues();
    var day4Fixed = 0, parentsFixed = 0;

    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][1]) !== 'EC-2026-001') continue;
      var raw = String(rows[i][15]);
      var b   = {};
      try { b = JSON.parse(raw); } catch(e) { continue; }
      var changed = false;

      // Fix 1: Day 4 first reveal — phone_visibility must be true
      if (Number(b.day) === 4 && b.phone_visibility !== true) {
        b.phone_visibility = true;
        // Also set scene_direction to indicate first reveal if it doesn't already
        day4Fixed++;
        changed = true;
      }

      // Fix 2: Factual error — "Built by parents" → "Built by first responders"
      var serialized = changed ? JSON.stringify(b) : raw;
      if (serialized.indexOf('Built by parents') >= 0 ||
          serialized.indexOf('built by parents') >= 0) {
        serialized = serialized.replace(/Built by parents/gi, 'Built by first responders');
        parentsFixed++;
        changed = true;
      }

      if (changed) {
        spSheet.getRange(i + 2, 16).setValue(changed && serialized !== raw ? serialized : JSON.stringify(b));
      }
    }

    results.push('Day 4 phone_visibility→true: ' + day4Fixed + ' posts fixed');
    results.push('"Built by parents" corrected: ' + parentsFixed + ' posts fixed');
    Logger.log('[fixEC2026001DataIssues] ' + results.join(' | '));
    return { ok: true, results: results, day4_fixed: day4Fixed, parents_fixed: parentsFixed };

  } catch(e) {
    Logger.log('[fixEC2026001DataIssues] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── QA Fix B — Banned phrases (GPT re-pass on flagged posts only) ─────────────
// Detects posts with R03 or R04 violations inline, sends ONLY those to GPT-4o
// with a strict system message that forbids the entire banned list.
// Run via doPost: { "action": "fix_ec2026001_banned_phrases",
//   "start_offset": 0, "batch_size": 40 }

function _gptSysMsgStrict() {
  return _gptSysMsg() +
    '\n\nHARD RULES — NEVER APPEAR IN ANY OUTPUT:\n' +
    '  BANNED NUMBERS: $111 · $112 · $1500 · 70%\n' +
    '    (If a stat is needed, use "$1,336 per year" or "69.5% less food waste" only)\n' +
    '  BANNED WORDS: effortlessly · seamlessly · seamless · game-changing · revolutionary\n' +
    '    · leverage · ecosystem · optimize (as a verb — the feature label OPTIMIZE is ok as a noun)\n' +
    '  BANNED PHRASES: "the app" (say easyChef Pro by name) · "pain points" · "Built by parents"\n' +
    '  PHONE RULE DAYS 1-3: hook_a and hook_b must not mention phone, app, screen, or device\n' +
    '    (you may mention "five apps that don\'t talk to each other" only in scene_direction, not in hooks)\n' +
    '  STAT PLACEMENT: dollar amounts and percentages belong in proof stage (days 22-28) only.\n' +
    '    Hook and problem stage hooks must lead with emotional recognition, not numbers.';
}

function _gptFixPrompt(platform, feature, existing) {
  return _gptPostPrompt(platform, feature, existing) +
    '\n\nFIX PASS: A previous version of this brief contained banned phrases. ' +
    'Rewrite all creative copy fields from scratch. ' +
    'Respect every hard rule in your system instructions — especially: no $111, ' +
    'no effortlessly, no seamless, no "the app", no money stat in hook/problem stages.';
}

function fixEC2026001BannedPhrases(startOffset, batchSize) {
  try {
    startOffset = Number(startOffset) || 0;
    batchSize   = Number(batchSize)   || 40;

    var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
    if (!apiKey) return { ok: false, error: 'OPENAI_API_KEY not in Script Properties' };

    var BANNED_CHECK = [
      '$111','$112','$1500','70%','revolutionary','game-changing',
      'seamless','leverage','ecosystem','pain points',
      'the app','effortlessly','built by parents'
    ];

    function hasViolation(b) {
      var parts = [b.hook_a, b.hook_b, b.scene_direction, b.caption_opening,
                   b.subject_line, b.preview_text, b.header_image_direction,
                   b.opening_hook, b.audio_direction];
      if (Array.isArray(b.scene_sequence)) b.scene_sequence.forEach(function(s){ parts.push(s); });
      if (Array.isArray(b.story_arc))      b.story_arc.forEach(function(s){ parts.push(s); });
      var txt = parts.filter(Boolean).join(' ').toLowerCase();
      for (var i = 0; i < BANNED_CHECK.length; i++) {
        if (txt.indexOf(BANNED_CHECK[i]) >= 0) return true;
      }
      // "optimize" as a verb is banned; "optimize screen" (the app feature label) is allowed
      if (/\boptimize\b(?! screen)/i.test(txt)) return true;
      // R03: days 1-3 hook copy must not mention phone/app/screen/device
      var day = Number(b.day) || 0;
      if (day >= 1 && day <= 3) {
        var hookTxt = (String(b.hook_a || '') + ' ' + String(b.hook_b || '')).toLowerCase();
        if (/\b(phone|screen|device|app)\b/.test(hookTxt)) return true;
      }
      return false;
    }

    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var lastRow = spSheet.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'SocialPosts empty' };

    var allRows = spSheet.getRange(2, 1, lastRow - 1, 16).getValues();
    var flagged = [];
    for (var i = 0; i < allRows.length; i++) {
      if (String(allRows[i][1]) !== 'EC-2026-001') continue;
      var b = {};
      try { b = JSON.parse(String(allRows[i][15])); } catch(e) { continue; }
      if (hasViolation(b)) flagged.push({ ri: i, row: allRows[i], brief: b });
    }

    var total  = flagged.length;
    var endIdx = Math.min(startOffset + batchSize, total);
    var batch  = flagged.slice(startOffset, endIdx);

    if (!batch.length) {
      return { ok: true, processed: 0, total: total, done: true,
               message: 'All ' + total + ' violations cleared' };
    }

    var sysMsg = _gptSysMsgStrict();

    var requests = batch.map(function(item) {
      var row = item.row;
      return {
        url:    'https://api.openai.com/v1/chat/completions',
        method: 'post',
        headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
        payload: JSON.stringify({
          model:           'gpt-4o',
          temperature:     0.65,
          max_tokens:      700,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: sysMsg },
            { role: 'user',   content: _gptFixPrompt(String(row[2]), String(row[3]), item.brief) }
          ]
        }),
        muteHttpExceptions: true
      };
    });

    var responses = UrlFetchApp.fetchAll(requests);
    var processed = 0, errors = 0;
    var now = new Date().toISOString();

    for (var j = 0; j < responses.length; j++) {
      var resp = responses[j];
      var item = batch[j];
      if (resp.getResponseCode() !== 200) {
        Logger.log('[fixBanned] row ' + item.ri + ' HTTP ' + resp.getResponseCode() + ': ' +
                   resp.getContentText().slice(0, 120));
        errors++;
        continue;
      }
      var gpt = {};
      try {
        var body = JSON.parse(resp.getContentText());
        gpt = JSON.parse(body.choices[0].message.content);
      } catch(pe) { errors++; continue; }

      var merge = {};
      for (var k in item.brief) { merge[k] = item.brief[k]; }
      var copyFields = ['hook_a','hook_b','scene_direction','what_not_to_show',
                        'caption_opening','subject_line','preview_text',
                        'header_image_direction','scene_sequence','story_arc',
                        'opening_hook','audio_direction'];
      for (var f = 0; f < copyFields.length; f++) {
        if (gpt[copyFields[f]] !== undefined) merge[copyFields[f]] = gpt[copyFields[f]];
      }
      merge.gpt_model  = 'gpt-4o';
      merge.gpt_fix_at = now;

      spSheet.getRange(item.ri + 2, 16).setValue(JSON.stringify(merge));
      processed++;
    }

    var done = (endIdx >= total);
    Logger.log('[fixEC2026001BannedPhrases] processed:' + processed + ' errors:' + errors +
               ' flagged_total:' + total + ' next:' + endIdx + ' done:' + done);
    return {
      ok:          true,
      processed:   processed,
      errors:      errors,
      total:       total,
      next_offset: endIdx,
      done:        done,
      message:     done ? 'All ' + total + ' flagged posts fixed' : 'Next: start_offset=' + endIdx
    };

  } catch(e) {
    Logger.log('[fixEC2026001BannedPhrases] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── GPT-4o Creative Brief Generator ──────────────────────────────────────────
// Sends each post to GPT-4o via UrlFetchApp.fetchAll (parallel).
// Writes cinematic hook_a, hook_b, scene_direction, what_not_to_show,
// caption_opening + platform extras (TikTok: scene_sequence/audio;
// YouTube: story_arc/opening_hook; Email: subject/preview/header_image)
// into design_brief JSON. Processes batchSize posts per run.
// Run via doPost: { "action": "generate_ec2026001_gpt_briefs",
//   "start_offset": 0, "batch_size": 40 }

function _gptSysMsg() {
  return 'You are an elite creative director writing cinematic social campaigns for consumer apps. ' +
    'You write with the precision of Wieden+Kennedy — emotionally true, specific, never generic. ' +
    'You know that the best creative makes someone feel seen before it sells anything.\n\n' +
    'CAMPAIGN: easyChef Pro — EC-2026-001 "Pre-Launch Arc — The Invisible Leak"\n' +
    'PRODUCT: easyChef Pro closes the full kitchen loop: ' +
    'TRACK pantry → PLAN meals → OPTIMIZE nutrition → COOK → SHOP. ' +
    'Core truth: The average family loses $111/month ($1,336/year) to grocery waste and food delivery.\n\n' +
    'TWO ICPs:\n' +
    '  super_mom_money: Female 28-44 · household CFO · feels guilty about grocery waste · motivated by savings\n' +
    '  super_mom_time:  Female 28-44 · mental load carrier · 5-10 hrs/week on dinner decisions · motivated by time relief and founding family identity\n\n' +
    'BRAND RULES:\n' +
    '  · Empathetic tone — the system is broken, not her\n' +
    '  · Always specific: $111/month · $1,336/year · 30 minutes · 69.5% less waste\n' +
    '  · Warm kitchen realism — no staged perfection, no shame language\n' +
    '  · Phone reveal: NO PHONE in hook/problem stages · FIRST REVEAL in solve · VISIBLE from value onwards\n' +
    '  · NEVER "sign up" · NEVER invented testimonials · NEVER real names\n' +
    '  · Forbidden colors/look: blue · navy · gradient · orange · staged perfection\n\n' +
    'Return ONLY valid JSON — no markdown code fences, no explanation.';
}

function _gptPostPrompt(platform, feature, existing) {
  var stage    = existing.funnel_stage    || 'hook';
  var day      = existing.day             || 1;
  var phoneStr = existing.phone_visibility ? 'VISIBLE in frame' : 'NO PHONE in frame';
  var draftA   = existing.hook_a ? 'Draft hook A (improve or rewrite): ' + existing.hook_a + '\n' : '';
  var draftB   = existing.hook_b ? 'Draft hook B (improve or rewrite): ' + existing.hook_b + '\n' : '';

  var extraFields = '';
  if (platform === 'TikTok') {
    extraFields = ',\n  "scene_sequence": ["4-6 beat descriptions — each beat is one visual action"],\n' +
      '  "audio_direction": "specific audio and music direction for this TikTok"';
  } else if (platform === 'YouTube') {
    extraFields = ',\n  "story_arc": ["exactly 4 beat descriptions for the narrative arc"],\n' +
      '  "opening_hook": "what the viewer sees and hears in the first 3 seconds"';
  } else if (platform === 'Email') {
    extraFields = ',\n  "subject_line": "max 8 words — emotionally precise, not clickbait",\n' +
      '  "preview_text": "max 12 words — creates a curiosity gap",\n' +
      '  "header_image_direction": "hero image scene direction for email — who, where, light, mood"';
  }

  return 'Create a cinematic creative brief for this social post.\n\n' +
    'Platform: ' + platform + '\n' +
    'Day: ' + day + ' of 35 (campaign May 27 – Jun 30, 2026)\n' +
    'Funnel Stage: ' + stage + '\n' +
    'Feature / Theme: ' + feature + '\n' +
    'Phone: ' + phoneStr + '\n' +
    draftA + draftB +
    '\nReturn this JSON:\n{\n' +
    '  "hook_a": "Hook for super_mom_money — savings/efficiency angle. ' +
      'Emotionally specific. Max 15 words.",\n' +
    '  "hook_b": "Hook for super_mom_time — time relief + founding family angle. Max 15 words.",\n' +
    '  "scene_direction": "2-3 sentences of cinematic art direction: ' +
      'who is in frame, exact time of day, specific room, light quality, ' +
      'visible objects that tell the story, emotional state shown through environment. ' +
      'No app UI if phone is not in frame.",\n' +
    '  "what_not_to_show": ["4-6 specific visual or tonal things to avoid in this exact post"],\n' +
    '  "caption_opening": "Scroll-stopping first line of caption. Emotionally true. Max 12 words."' +
    extraFields + '\n}';
}

function generateEC2026001GPTBriefs(startOffset, batchSize) {
  try {
    startOffset = Number(startOffset) || 0;
    batchSize   = Number(batchSize)   || 40;

    var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
    if (!apiKey) return { ok: false, error: 'OPENAI_API_KEY not in Script Properties' };

    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var lastRow = spSheet.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'SocialPosts empty' };

    var allRows = spSheet.getRange(2, 1, lastRow - 1, 16).getValues();
    var ec001   = [];
    for (var i = 0; i < allRows.length; i++) {
      if (String(allRows[i][1]) === 'EC-2026-001') ec001.push({ ri: i, row: allRows[i] });
    }

    var total    = ec001.length;
    var endIdx   = Math.min(startOffset + batchSize, total);
    var batch    = ec001.slice(startOffset, endIdx);

    if (!batch.length) {
      return { ok: true, processed: 0, total: total, done: true,
               message: 'All posts already processed' };
    }

    var sysMsg = _gptSysMsg();

    // Build parallel fetch requests
    var requests = batch.map(function(item) {
      var row      = item.row;
      var platform = String(row[2]);
      var feature  = String(row[3]);
      var existing = {};
      try { existing = JSON.parse(String(row[15])); } catch(e) {}
      return {
        url:    'https://api.openai.com/v1/chat/completions',
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type':  'application/json'
        },
        payload: JSON.stringify({
          model:           'gpt-4o',
          temperature:     0.72,
          max_tokens:      700,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: sysMsg },
            { role: 'user',   content: _gptPostPrompt(platform, feature, existing) }
          ]
        }),
        muteHttpExceptions: true
      };
    });

    var responses = UrlFetchApp.fetchAll(requests);
    var processed = 0;
    var errors    = 0;
    var now       = new Date().toISOString();

    for (var j = 0; j < responses.length; j++) {
      var resp = responses[j];
      var item = batch[j];
      var row  = item.row;
      var existing = {};
      try { existing = JSON.parse(String(row[15])); } catch(e) {}

      if (resp.getResponseCode() !== 200) {
        Logger.log('[GPTBriefs] row ' + item.ri + ' HTTP ' + resp.getResponseCode() +
                   ': ' + resp.getContentText().slice(0, 200));
        errors++;
        continue;
      }

      var gpt = {};
      try {
        var body = JSON.parse(resp.getContentText());
        gpt = JSON.parse(body.choices[0].message.content);
      } catch(pe) {
        Logger.log('[GPTBriefs] row ' + item.ri + ' parse: ' + pe.message);
        errors++;
        continue;
      }

      // Merge GPT creative copy into existing UCBS brief (schema fields preserved)
      var merge = {};
      for (var k in existing) { merge[k] = existing[k]; }
      var copyFields = ['hook_a','hook_b','scene_direction','what_not_to_show',
                        'caption_opening','subject_line','preview_text',
                        'header_image_direction','scene_sequence','story_arc',
                        'opening_hook','audio_direction'];
      for (var f = 0; f < copyFields.length; f++) {
        if (gpt[copyFields[f]] !== undefined) merge[copyFields[f]] = gpt[copyFields[f]];
      }
      merge.gpt_model = 'gpt-4o';
      merge.gpt_at    = now;

      spSheet.getRange(item.ri + 2, 16).setValue(JSON.stringify(merge));
      processed++;
    }

    var done = (endIdx >= total);
    Logger.log('[generateEC2026001GPTBriefs] batch done — processed:' + processed +
               ' errors:' + errors + ' next:' + endIdx + ' done:' + done);
    return {
      ok:          true,
      processed:   processed,
      errors:      errors,
      total:       total,
      next_offset: endIdx,
      done:        done,
      message:     done
        ? 'All ' + total + ' posts done'
        : 'Continue with start_offset: ' + endIdx
    };

  } catch(e) {
    Logger.log('[generateEC2026001GPTBriefs] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── FIX EC-2026-001 Email Sequences ──────────────────────────────────────────
// FIX 1: Delete DL-EM-0020..0043 from DeepLinkRegistry
// FIX 2+3: Clear and re-seed 26 rows with correct seq/email numbering, days, DL IDs
// Final: SEQ-1(E1 day0, E2 day3, E3 day6) · SEQ-2(E1-E5 days 8-21) · SEQ-3(E1-E4 days 22-29) · SEQ-4(E1 day35)
// DL mapping: SEQ-1→DL-EM-0001, SEQ-2→DL-EM-0002, SEQ-3→DL-EM-0003, SEQ-4→DL-EM-0004
// Run via doPost: { "action": "fix_ec2026001_emails" }

function fixEC2026001Emails() {
  try {
    var results = [];
    var _uA = function(dl, sl) {
      return 'https://easychefpro.com/lp/waitlist-a?utm_source=email&utm_medium=email&utm_campaign=ec-2026-001&utm_content=' + encodeURIComponent(dl + '|' + sl);
    };
    var _uB = function(dl, sl) {
      return 'https://easychefpro.com/lp/waitlist-b?utm_source=email&utm_medium=email&utm_campaign=ec-2026-001&utm_content=' + encodeURIComponent(dl + '|' + sl);
    };

    // ── FIX 1: Delete DL-EM-0020..0043 ───────────────────────────────────────
    var dlSheet     = _getCCSheet(_CC_TAB.DL);
    var dlData      = dlSheet.getDataRange().getValues();
    var dlHdrs      = dlData[0].map(function(h) { return String(h).trim(); });
    var dlIdCol     = dlHdrs.indexOf('dl_id');
    var deleteCount = 0;
    for (var di = dlData.length - 1; di >= 1; di--) {
      var dlId = String(dlData[di][dlIdCol] || '');
      var m = dlId.match(/^DL-EM-(\d+)$/);
      if (m) {
        var n = parseInt(m[1], 10);
        if (n >= 20 && n <= 43) { dlSheet.deleteRow(di + 1); deleteCount++; }
      }
    }
    results.push('✓ DL-EM-0020–0043 deleted: ' + deleteCount + ' rows');

    // ── FIX 2+3: 13-email corrected array ────────────────────────────────────
    var ED = [
      // ── SEQ-1: Welcome / Problem Arc (E1 day0 NEW, E2 day3, E3 day6) ────────
      { seq:1, n:1, day:0, stage:'hook', feature:'problem',
        trigger:'waitlist_signup_completed',
        dlA:'DL-EM-0001', slA:'seq1-e1-a', dlB:'DL-EM-0001-B', slB:'seq1-e1-b',
        a:{ sub:"You're on the waitlist. The invisible leak is about to close.",
            pre:"You found it. Most people never do.",
            hk:"You just joined 10,000 households who found the invisible leak. $111 a month. Disappearing into groceries that never became dinner.",
            pr:"The spinach that wilted. The ground beef pushed to the back. The yogurt that expired. Five apps open — none of them talking to each other. The leak runs in the gap.",
            ag:"Families save an average of $111 a month when the leak is closed. That's $1,336/year average savings. Not from couponing. Not from buying less. From having a system.",
            so:"easyChef Pro closes the loop. TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One system.",
            va:"You're on the waitlist. Early access opens July 1. The founding price — $7.99/month — is locked for the first 5,000 families.",
            pf:"Validated across 10,000 household profiles. 69.5% less food waste. Built by first responders.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"You're in. Welcome to the founding family.",
            pre:"You were here before anyone else.",
            hk:"Welcome. You just joined the easyChef Pro founding family — early access July 1.",
            pr:"Every night you wing dinner costs 20 minutes. Every app that doesn't talk to the next one costs another 20. You've been doing this for years without a system.",
            ag:"easyChef Pro replaces five apps with one loop. TRACK → PLAN → OPTIMIZE → COOK → SHOP. Dinner decided before you open the fridge. The mental load — lifted.",
            so:"You're founding family. That means you get access first — and you lock $7.99/month forever. 60% off the $19.99 standard price.",
            va:"Over the next 35 days, we'll show you exactly how the system closes every gap. Starting with the one that costs $111 a month.",
            pf:"Validated across 10,000 household profiles. Built by first responders who needed this as much as you do.",
            ct:"Join the founding family — early access July 1" }},

      { seq:1, n:2, day:3, stage:'problem', feature:'problem',
        trigger:'',
        dlA:'DL-EM-0001', slA:'seq1-e2-a', dlB:'DL-EM-0001-B', slB:'seq1-e2-b',
        a:{ sub:"You're throwing away $111 every month",
            pre:"Not your fault. Just no system.",
            hk:"You have an invisible leak in your grocery budget. $111 a month. Every month. Not because of bad decisions — because the system was never designed to close the loop.",
            pr:"You buy groceries on Sunday. By Wednesday it's a guessing game. The spinach goes limp. The ground beef gets pushed to the back. The yogurt expires. You order delivery. Again.",
            ag:"Families save an average of $111 a month when the leak is closed. That's $1,336/year average savings. Not from couponing. Not from buying less. From having a system.",
            so:"easyChef Pro closes the loop. Five apps replaced. One leak closed.",
            va:"TRACK what's in your fridge before it expires. PLAN the week from what you already own. COOK 30-minute dinners from what's there. SHOP only what's missing. OPTIMIZE every meal with registered dietitians.",
            pf:"Validated across 10,000 household profiles. 69.5% less food waste. Built by first responders.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"Six apps open. Groceries on the counter. Nothing for dinner.",
            pre:"The 6:30 PM wall is not a you problem.",
            hk:"It's 6:30 PM. The fridge is full. Five apps are open. And you still don't know what to make for dinner.",
            pr:"You have Mealime. A pantry app. A nutrition tracker. A recipe app. A shopping list. None of them talk to each other. None of them know what's actually in your fridge right now.",
            ag:"You spend 5 to 10 hours a week deciding what to eat. Every night you wing it is an evening that wasn't yours. Every delivery order is $30 that should have stayed in your wallet.",
            so:"easyChef Pro closes the loop. One app. Five replaced. Dinner figured out before you open the fridge.",
            va:"The meal plan builds from what you already own. The recipe is waiting. The shopping list writes itself. The nutrition score fires automatically.",
            pf:"Validated across 10,000 household profiles. Built by first responders who needed this as much as you do.",
            ct:"Join the founding family — early access July 1" }},

      { seq:1, n:3, day:6, stage:'agitate', feature:'problem',
        trigger:'',
        dlA:'DL-EM-0001', slA:'seq1-e3-a', dlB:'DL-EM-0001-B', slB:'seq1-e3-b',
        a:{ sub:"$1,336 thrown away every year — not your fault",
            pre:"Do the math. It's jarring.",
            hk:"$1,336. That's how much the average family throws away in groceries every year.",
            pr:"It's not the big grocery trips. It's the spinach that wilted by Wednesday. The ground beef pushed to the back. The yogurt that expired before anyone touched it.",
            ag:"That's $111 every month. $3.66 every single day. From your fridge to your garbage bin. Without a system, it never stops.",
            so:"easyChef Pro tracks what you have before it expires. TRACK → PLAN → COOK → SHOP — the full loop, closed.",
            va:"Your pantry knows what's in it. The meal plan builds from what you own. The recipe uses what's there. The shopping list only buys what's missing.",
            pf:"69.5% less food waste. Validated across 10,000 household profiles.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"What if dinner was decided before you opened the fridge?",
            pre:"That question changes everything.",
            hk:"What if the hardest part of tonight's dinner was already done before you got home?",
            pr:"Every night, the 6:30 PM decision costs you 20 minutes minimum. Stare at the fridge. Check an app. Nothing matches what you have. Open delivery. Spend $35 you didn't plan for.",
            ag:"That's 5 to 10 hours a week you don't get back. Multiplied by 52 weeks. That time belongs to you — and to your family.",
            so:"easyChef Pro decides dinner before you open the fridge. The plan is already built from what you own.",
            va:"Open the app. Your week is planned. Tonight's recipe is from your fridge. The shopping list for what's missing is ready. Nutrition scored automatically.",
            pf:"Validated across 10,000 household profiles. Built by first responders.",
            ct:"Join the founding family — early access July 1" }},

      // ── SEQ-2: Solve + Value Arc (E1 day8, E2 day12, E3 day15, E4 day18, E5 day21) ──
      { seq:2, n:1, day:8, stage:'solve', feature:'TRACK',
        trigger:'',
        dlA:'DL-EM-0002', slA:'seq2-e1-a', dlB:'DL-EM-0002-B', slB:'seq2-e1-b',
        a:{ sub:"$1,336 back in your pocket this year",
            pre:"The leak starts with your pantry.",
            hk:"$1,336 back. Not from couponing. From knowing what's in your fridge before it expires.",
            pr:"The leak starts in your pantry. You buy things you already have. You forget what's expiring. You miss the window when the spinach was still good.",
            ag:"easyChef Pro TRACK sees everything the moment you scan your receipt. Expiry alerts fire before the loss happens. You never buy what you already have again.",
            so:"TRACK replaced NoWaste — and it does more. Every item it logs feeds every decision downstream.",
            va:"The pantry data builds the meal plan. The meal plan builds the recipe. The recipe builds the shopping list. One loop. Closed.",
            pf:"Families save an average of $111 a month. $1,336/year average savings. 69.5% less food waste.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"The grocery leak — closed",
            pre:"This is what TRACK actually does.",
            hk:"The first thing easyChef Pro does is close the leak.",
            pr:"TRACK scans your receipt. Every item logged. Expiry tracked. Duplicate purchases caught before they happen. The pantry you couldn't see — now you see it.",
            ag:"When TRACK knows what you have, everything follows automatically. The meal plan builds from what you own. You never open the fridge wondering what to make.",
            so:"TRACK → PLAN → OPTIMIZE → COOK → SHOP. The full loop. From one app. Five apps — replaced.",
            va:"Dinner figured out before 6:30 PM. The mental load — lifted. Kitchen in command.",
            pf:"Validated across 10,000 household profiles. Built by first responders.",
            ct:"Join the founding family — early access July 1" }},

      { seq:2, n:2, day:12, stage:'value', feature:'TRACK',
        trigger:'',
        dlA:'DL-EM-0002', slA:'seq2-e2-a', dlB:'DL-EM-0002-B', slB:'seq2-e2-b',
        a:{ sub:"$111 back every month with 30-minute dinners",
            pre:"This is how the math works.",
            hk:"You scan the receipt. easyChef Pro does the rest.",
            pr:"TRACK logs every item with expiry dates. The pantry you couldn't see is now visible — and it's talking to every other feature in the app.",
            ag:"The moment something is about to expire, TRACK fires an alert. PLAN pulls it into tonight's dinner. Nothing goes to waste. The $111 stops disappearing.",
            so:"TRACK replaced NoWaste — and it opened the whole loop.",
            va:"PLAN sees your pantry and builds five dinners from what you already own. No manual entry. No 'what do I have?' — Monday through Friday, done.",
            pf:"Families save an average of $111 a month. $1,336/year average savings.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"30 minutes from fridge panic to family dinner",
            pre:"The app built the plan from what you already have.",
            hk:"Monday. Tuesday. Wednesday. Thursday. Friday. Five dinners — from what you already own.",
            pr:"PLAN doesn't ask you to enter anything. It reads your pantry from TRACK. It sees what's expiring first. It builds the week automatically.",
            ag:"Sunday: scan your receipt. Monday morning: your week is already planned. No 6:30 PM decisions. No 'what's for dinner' spiral. No delivery.",
            so:"PLAN replaced Mealime — but Mealime never knew what you had. PLAN does.",
            va:"Five dinners planned. Each recipe ready. Each from your fridge. 30 minutes fridge to table.",
            pf:"Validated across 10,000 household profiles. 69.5% less food waste.",
            ct:"Join the founding family — early access July 1" }},

      { seq:2, n:3, day:15, stage:'value', feature:'PLAN',
        trigger:'',
        dlA:'DL-EM-0002', slA:'seq2-e3-a', dlB:'DL-EM-0002-B', slB:'seq2-e3-b',
        a:{ sub:"$1,336 of groceries thrown away every year",
            pre:"Week three. Here's what PLAN actually builds.",
            hk:"The meal plan builds itself. From what you already paid for.",
            pr:"Monday: salmon from last week. Tuesday: tacos from the ground beef. Wednesday: stir fry from the vegetables about to expire. Thursday: pasta from the back of the pantry.",
            ag:"PLAN sees all of it. From the pantry TRACK built. Five dinners from what you already own. Zero guessing. Zero waste.",
            so:"PLAN replaced your meal planner — but it knows your pantry. No planner did that before.",
            va:"The week is planned before Monday arrives. The recipes are ready. The shopping list for what's missing builds itself.",
            pf:"Families save an average of $111 a month. 69.5% less food waste.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"That spinach you bought Sunday is brown today",
            pre:"Not with easyChef Pro.",
            hk:"The spinach you bought on Sunday. Today is Wednesday. You know what happened to it.",
            pr:"Not anymore. TRACK saw it the day you scanned the receipt. PLAN pulled it into Monday's dinner. You cooked it while it was still good.",
            ag:"That's the difference. The pantry talks to the meal plan. The meal plan talks to the recipe. Nothing expires in the dark.",
            so:"PLAN knows what you have. Builds from what's expiring first. Five dinners. From your fridge. Automatic.",
            va:"The week is figured out before you open the fridge on Sunday night. The 6:30 PM panic doesn't come.",
            pf:"Validated across 10,000 household profiles. 69.5% less food waste.",
            ct:"Join the founding family — early access July 1" }},

      { seq:2, n:4, day:18, stage:'value', feature:'OPTIMIZE',
        trigger:'',
        dlA:'DL-EM-0002', slA:'seq2-e4-a', dlB:'DL-EM-0002-B', slB:'seq2-e4-b',
        a:{ sub:"That $111 you threw away last month",
            pre:"OPTIMIZE closes the nutrition loop.",
            hk:"OPTIMIZE scores every meal COOK produces. 6 nutrition dimensions. FDA-grade data. Registered dietitians.",
            pr:"Your meal plan is built from your pantry. Your recipe is ready in 30 minutes. Every meal you cook is now scored — automatically. No food logging. No manual tracking.",
            ag:"Every meal COOK produces gets scored before you plate it. If something's off nutritionally, PLAN adjusts next week's dinners. The loop optimizes itself.",
            so:"OPTIMIZE replaced MyFitnessPal — but MyFitnessPal never knew your pantry. OPTIMIZE does.",
            va:"TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One system. The leak — closed.",
            pf:"Registered dietitians validated every recipe. 69.5% less food waste. Families save an average of $111 a month.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"Every expired yogurt is $3 down the drain",
            pre:"The nutrition loop closes this week.",
            hk:"OPTIMIZE fires automatically. You didn't log anything. The meal COOK produced is already scored.",
            pr:"6 nutrition dimensions. FDA-grade data. Registered dietitians validated every recipe. Every meal from your fridge — scored before it reaches the table.",
            ag:"You used to track every calorie on a separate app. OPTIMIZE does all of it from what you actually cooked. From your actual pantry. Without a single manual entry.",
            so:"OPTIMIZE replaced your nutrition tracker — and it's connected to COOK, PLAN, and TRACK.",
            va:"The full loop closes. Five apps replaced. Dinner figured out. Kitchen in command.",
            pf:"Validated across 10,000 household profiles. Built by first responders.",
            ct:"Join the founding family — early access July 1" }},

      { seq:2, n:5, day:21, stage:'proof', feature:'proof',
        trigger:'',
        dlA:'DL-EM-0002', slA:'seq2-e5-a', dlB:'DL-EM-0002-B', slB:'seq2-e5-b',
        a:{ sub:"$1,336 savings ends July 1st",
            pre:"10,000 households. The data is in.",
            hk:"10,000 household profiles. 69.5% less food waste. $1,336/year average savings. Not a promise. Validated data.",
            pr:"That's from real households running the full loop: TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One system.",
            ag:"9 patent-pending technologies. Built by first responders. Not Silicon Valley. People who needed this as much as you do.",
            so:"The data is in. The system works. The founding price — $7.99/month — closes July 1.",
            va:"$7.99 to save $111 a month. That's 60% off the standard price of $19.99. Forever. For the first 5,000 families.",
            pf:"Families save an average of $111 a month. 69.5% less food waste. Validated across 10,000 household profiles.",
            ct:"Join the waitlist — early access July 1" },
        b:{ sub:"The proof is in. Here's the number.",
            pre:"Time to decide.",
            hk:"The data is real. 10,000 households. The 6:30 PM panic — gone.",
            pr:"Not because they got better at cooking. Because the system closes the loop. TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced.",
            ag:"9 patent-pending technologies. Built by first responders. $1,336/year average savings. 69.5% less food waste.",
            so:"The founding price is $7.99/month. 60% off forever. For the first 5,000 families only.",
            va:"Dinner figured out. Kitchen in command. The mental load — gone.",
            pf:"Validated across 10,000 household profiles. Built by first responders.",
            ct:"Join the founding family — early access July 1" }},

      // ── SEQ-3: Urgency + CTA Arc (E1 day22, E2 day24, E3 day27, E4 day29) ────
      { seq:3, n:1, day:22, stage:'urgency', feature:'urgency',
        trigger:'',
        dlA:'DL-EM-0003', slA:'seq3-e1-a', dlB:'DL-EM-0003-B', slB:'seq3-e1-b',
        a:{ sub:"5,000 founding spots. The window is closing.",
            pre:"Three weeks of buildup. Here's the number.",
            hk:"5,000 founding families. $7.99/month. Forever. The window is closing.",
            pr:"You've been following the invisible leak for three weeks. You know what TRACK does. You know what the 5-app loop closes.",
            ag:"$7.99/month is 60% off the standard price of $19.99. It locks the day the 5,000 spots fill. Real scarcity. Not manufactured.",
            so:"Early access: July 1. Founding price: $7.99/month. Your decision: now.",
            va:"$7.99 to save $111 a month. $1,336/year average savings. First 5,000 only.",
            pf:"Validated across 10,000 household profiles. 69.5% less food waste.",
            ct:"Lock in $7.99/month — 60% off forever" },
        b:{ sub:"You've been deciding for 3 weeks. Here's what that costs.",
            pre:"Every day without the system is $3.66.",
            hk:"Three weeks. You watched the invisible leak. Saw the 5-app fragmentation. Watched TRACK close it.",
            pr:"Every day without the system: $3.66 in groceries that become garbage. Every night without the meal plan: 20 minutes of decision that should have been yours.",
            ag:"The founding price closes when 5,000 spots fill. After that: $19.99/month. The gap is $12 a month. Forever. Just from waiting.",
            so:"Founding family: $7.99/month. 60% off. For the first 5,000 only.",
            va:"Early access July 1. Founding price locked. Kitchen in command.",
            pf:"Built by first responders. Validated across 10,000 household profiles.",
            ct:"Join the founding family — lock in $7.99/month" }},

      { seq:3, n:2, day:24, stage:'urgency', feature:'urgency',
        trigger:'',
        dlA:'DL-EM-0003', slA:'seq3-e2-a', dlB:'DL-EM-0003-B', slB:'seq3-e2-b',
        a:{ sub:"$7.99 founding price ends in 10 days",
            pre:"The math is simple.",
            hk:"$7.99/month. $111 saved every month. The math pays for itself in the first week.",
            pr:"10 days left before July 1. 10 days before early access opens. 10 days before the founding price closes at 5,000 spots.",
            ag:"After 5,000 spots: $19.99/month. The difference is $12 every month. Forever. That's $144 a year — just from waiting.",
            so:"Join the waitlist today. Lock $7.99/month before it closes.",
            va:"30 minutes fridge to table. $1,336/year average savings. 69.5% less food waste. Founded at $7.99.",
            pf:"Families save an average of $111 a month. Validated across 10,000 household profiles.",
            ct:"Lock in $7.99/month — 60% off forever" },
        b:{ sub:"Your kitchen panic has 10 days left",
            pre:"Then it's over. Here's why.",
            hk:"10 days from now, the 6:30 PM panic has a system.",
            pr:"Early access opens July 1. The founding price closes with the first 5,000 spots. You've been following this for three weeks. You know what the app does.",
            ag:"Every night you wait is an evening that wasn't yours. Every week without the system costs 5 to 10 hours of decisions. That's the real price of waiting.",
            so:"Join the waitlist. Lock $7.99/month. Get early access July 1.",
            va:"Dinner decided. Groceries planned. Kitchen in command. The mental load — gone.",
            pf:"Built by first responders. Validated across 10,000 household profiles.",
            ct:"Join the founding family — lock in $7.99/month" }},

      { seq:3, n:3, day:27, stage:'urgency', feature:'urgency',
        trigger:'',
        dlA:'DL-EM-0003', slA:'seq3-e3-a', dlB:'DL-EM-0003-B', slB:'seq3-e3-b',
        a:{ sub:"Five apps replaced. One leak closed. 4 days left.",
            pre:"Last urgency email.",
            hk:"4 days. July 1 is real. The founding price closes when 5,000 spots fill.",
            pr:"You've seen the full loop: TRACK → PLAN → OPTIMIZE → COOK → SHOP. Five apps replaced. One leak closed. $1,336/year average savings.",
            ag:"The standard price after 5,000: $19.99/month. The founding price: $7.99/month. 60% off. Forever. For the first 5,000 families only.",
            so:"4 days to lock in. Early access July 1. Founding price closes at 5,000.",
            va:"$1,336/year average savings. 69.5% less food waste. 30 minutes fridge to table. $7.99/month.",
            pf:"Validated across 10,000 household profiles. 9 patent-pending technologies. Built by first responders.",
            ct:"Lock in $7.99/month — 60% off forever" },
        b:{ sub:"4 days left to escape 6:30 PM panic",
            pre:"Last call.",
            hk:"4 days. The founding price closes when 5,000 spots fill. This is your last urgency email.",
            pr:"You found easyChef Pro before it launched. You followed the invisible leak. You saw the loop close. Now you know what the app does.",
            ag:"Every night you wait is still 20 minutes of 6:30 PM panic. Every day without the system costs $3.66 in groceries that become garbage.",
            so:"Join the founding family. Early access July 1. $7.99/month. The 6:30 PM wall — gone.",
            va:"Dinner figured out. Kitchen in command. Founding price locked. Forever.",
            pf:"Built by first responders. Validated across 10,000 household profiles.",
            ct:"Join the founding family — 4 days left" }},

      { seq:3, n:4, day:29, stage:'cta', feature:'launch',
        trigger:'',
        dlA:'DL-EM-0003', slA:'seq3-e4-a', dlB:'DL-EM-0003-B', slB:'seq3-e4-b',
        a:{ sub:"$1,336 saved or lost — you choose tomorrow",
            pre:"Tomorrow is the day.",
            hk:"Tomorrow. July 1. Early access opens.",
            pr:"You've had 29 days with the invisible leak. You know what $111 a month costs. You know what the system does. Tomorrow you either close the leak — or you don't.",
            ag:"The founding price — $7.99/month — closes with the 5,000 spots. After that: $19.99/month standard. Real scarcity. Not manufactured.",
            so:"Join the waitlist today. Your access opens tomorrow.",
            va:"$1,336/year average savings. 69.5% less food waste. 30 minutes fridge to table. Founded at $7.99.",
            pf:"Families save an average of $111 a month. Validated across 10,000 household profiles.",
            ct:"Join the founding family — last chance at $7.99/month" },
        b:{ sub:"Tomorrow: 6:30 PM panic returns forever",
            pre:"Or it doesn't. Your choice.",
            hk:"Tomorrow you get early access. Or you don't.",
            pr:"The founding family window is almost closed. 5,000 spots. The first families to join lock $7.99/month forever.",
            ag:"You found easyChef Pro before the world did. You followed the invisible leak. Tomorrow you either join the founding family — or you watch them close the door.",
            so:"Join the founding family today. Early access July 1.",
            va:"Dinner decided. Kitchen in command. You were first.",
            pf:"Built by first responders. Validated across 10,000 household profiles.",
            ct:"Join the founding family — your last chance" }},

      // ── SEQ-4: Launch Day (E1 day35) ─────────────────────────────────────────
      { seq:4, n:1, day:35, stage:'launch', feature:'launch',
        trigger:'',
        dlA:'DL-EM-0004', slA:'seq4-e1-a', dlB:'DL-EM-0004-B', slB:'seq4-e1-b',
        a:{ sub:"The app is live. Your kitchen is in command.",
            pre:"July 1. Here's your access.",
            hk:"It's July 1. easyChef Pro is live. Your founding family access is ready.",
            pr:"The invisible leak — closed. The 5-app fragmentation — replaced. TRACK → PLAN → OPTIMIZE → COOK → SHOP — one loop, one app, live today.",
            ag:"You were here before the launch. You know what $111 a month means. Today you get it back.",
            so:"Download easyChef Pro. Scan your first receipt. The loop starts now.",
            va:"Your pantry is tracked. Your week is planned. Your dinner is ready in 30 minutes. Your nutrition is scored. Your shopping list builds itself. $1,336/year average savings — yours.",
            pf:"Validated across 10,000 household profiles. 69.5% less food waste. Built by first responders.",
            ct:"Try easyChef Pro free for 7 days — no credit card" },
        b:{ sub:"July 1. You were first. Here is your access.",
            pre:"Your kitchen is in command.",
            hk:"You're in the founding family. July 1. easyChef Pro is live.",
            pr:"You found this before anyone else. You followed the invisible leak. You watched the loop close. Today you get founding family access.",
            ag:"Dinner is already figured out for tonight. TRACK → PLAN → OPTIMIZE → COOK → SHOP — the loop is running.",
            so:"Download easyChef Pro. Scan your first receipt. Your week builds itself.",
            va:"Founding family. Founding price. Kitchen in command. The 6:30 PM panic — permanently gone.",
            pf:"Built by first responders. Validated across 10,000 household profiles.",
            ct:"Try easyChef Pro free for 7 days — no credit card" }}
    ];

    // ── Clear existing EC-2026-001 emails ─────────────────────────────────────
    var emSheet = _getCCSheet(_CC_TAB.EMAIL);
    var emLast  = emSheet.getLastRow();
    if (emLast >= 2) {
      var emData = emSheet.getRange(2, 1, emLast - 1, 2).getValues();
      for (var ci = emData.length - 1; ci >= 0; ci--) {
        if (String(emData[ci][1]) === 'EC-2026-001') emSheet.deleteRow(ci + 2);
      }
    }
    results.push('✓ EmailSequences cleared: existing EC-2026-001 rows removed');

    // ── Build and write 26 rows ───────────────────────────────────────────────
    var emRows = [];
    ED.forEach(function(e) {
      var seqCode = 'SEQ-' + e.seq;
      var templ   = 'EC2026001-' + seqCode + '-E' + e.n;
      var urlA    = _uA(e.dlA, e.slA);
      var urlB    = _uB(e.dlB, e.slB);
      var trigA   = e.trigger || ('klaviyo_' + seqCode.toLowerCase() + '_segment_a');
      var trigB   = e.trigger || ('klaviyo_' + seqCode.toLowerCase() + '_segment_b');

      emRows.push([
        'ec001-email-s' + e.seq + '-e' + e.n + '-a',
        'EC-2026-001', seqCode, e.n,
        e.a.sub, e.a.pre, e.a.hk, e.a.pr, e.a.ag, e.a.so, e.a.va, e.a.pf,
        e.a.ct + '\n' + urlA,
        e.day, trigA,
        'draft', false, '', false, '',
        e.stage, 'money', 'invisible-leak', 'waitlist-a', templ + '-A',
        JSON.stringify({ dl_id: e.dlA, utm_url: urlA, lp: 'waitlist-a', segment: 'money', day: e.day })
      ]);

      emRows.push([
        'ec001-email-s' + e.seq + '-e' + e.n + '-b',
        'EC-2026-001', seqCode, e.n,
        e.b.sub, e.b.pre, e.b.hk, e.b.pr, e.b.ag, e.b.so, e.b.va, e.b.pf,
        e.b.ct + '\n' + urlB,
        e.day, trigB,
        'draft', false, '', false, '',
        e.stage, 'time', 'invisible-leak', 'waitlist-b', templ + '-B',
        JSON.stringify({ dl_id: e.dlB, utm_url: urlB, lp: 'waitlist-b', segment: 'time_founding', day: e.day })
      ]);
    });

    var emStart = emSheet.getLastRow() + 1;
    emSheet.getRange(emStart, 1, emRows.length, 26).setValues(emRows);
    results.push('✓ EmailSequences seeded: ' + emRows.length + ' rows (13 emails × A+B)');
    results.push('  SEQ-1: 3 emails · E1 day0 (welcome) · E2 day3 · E3 day6 · DL-EM-0001');
    results.push('  SEQ-2: 5 emails · E1 day8 · E2 day12 · E3 day15 · E4 day18 · E5 day21 · DL-EM-0002');
    results.push('  SEQ-3: 4 emails · E1 day22 · E2 day24 · E3 day27 · E4 day29 · DL-EM-0003');
    results.push('  SEQ-4: 1 email  · E1 day35 · DL-EM-0004');

    Logger.log('[fixEC2026001Emails] ' + results.join(' | '));
    return { ok: true, results: results, email_count: emRows.length, dl_deleted: deleteCount };

  } catch(e) {
    Logger.log('[fixEC2026001Emails] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── Fix EC-2026-001 dates ─────────────────────────────────────────────────────
// Corrects all 218 SocialPosts · ContentCalendar milestones · CampaignBriefs launch_date
// Day 1 = May 27 2026 · Day N = May 27 + (N-1) days
// Run via doPost: { "action": "fix_ec2026001_dates" }

function fixEC2026001Dates() {
  try {
    var results  = [];

    // ── 1. SocialPosts — batch rewrite scheduled_date from design_brief.day ──
    var spSheet   = _getCCSheet(_CC_TAB.SOCIAL);
    var spLastRow = spSheet.getLastRow();
    var spFixed   = 0;
    var spFirst5  = [];
    var spAllFixed = [];

    if (spLastRow >= 2) {
      var spRows    = spSheet.getRange(2, 1, spLastRow - 1, 16).getValues();
      var spNewDates = spRows.map(function(row) {
        if (String(row[1]) !== 'EC-2026-001') return [row[9]];
        var dayNum = 0;
        try { dayNum = JSON.parse(String(row[15])).day || 0; } catch(pe) {}
        if (!dayNum) return [row[9]];
        var d       = new Date(Date.UTC(2026, 4, 27) + (dayNum - 1) * 86400000);
        var dateStr = Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd');
        spFixed++;
        if (spFirst5.length < 5) spFirst5.push('day' + dayNum + '→' + dateStr);
        spAllFixed.push('day' + dayNum + '→' + dateStr);
        return [dateStr];
      });
      spSheet.getRange(2, 10, spNewDates.length, 1).setValues(spNewDates);
    }
    results.push('SocialPosts: ' + spFixed + ' rows fixed');
    results.push('First 5: ' + spFirst5.join(' | '));
    results.push('Last 3: ' + spAllFixed.slice(-3).join(' | '));

    // ── 2. ContentCalendar — batch rewrite from day_number col ───────────────
    var ccSheet   = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var ccLastRow = ccSheet.getLastRow();
    var ccFixed   = 0;

    if (ccLastRow >= 2) {
      var ccRows     = ccSheet.getRange(2, 1, ccLastRow - 1, 4).getValues();
      var ccNewDates = ccRows.map(function(row) {
        if (String(row[1]) !== 'EC-2026-001') return [row[3]];
        var dayN = Number(row[2]);
        if (!dayN) return [row[3]];
        var d = new Date(Date.UTC(2026, 4, 27) + (dayN - 1) * 86400000);
        ccFixed++;
        return [Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd')];
      });
      ccSheet.getRange(2, 4, ccNewDates.length, 1).setValues(ccNewDates);
    }
    results.push('ContentCalendar: ' + ccFixed + ' rows fixed');

    // ── 3. CampaignBriefs — set launch_date to 2026-05-27 ────────────────────
    var cbSheet   = _getCCSheet(_CC_TAB.BRIEFS);
    var cbLastRow = cbSheet.getLastRow();
    if (cbLastRow >= 2) {
      var cbIds = cbSheet.getRange(2, 1, cbLastRow - 1, 1).getValues();
      for (var i = 0; i < cbIds.length; i++) {
        if (String(cbIds[i][0]) === 'EC-2026-001') {
          cbSheet.getRange(i + 2, 8).setValue('2026-05-27');
          results.push('CampaignBriefs: launch_date → 2026-05-27');
          break;
        }
      }
    }

    Logger.log('[fixEC2026001Dates] ' + results.join(' | '));
    return { ok: true, results: results, social_fixed: spFixed, cc_fixed: ccFixed };

  } catch(e) {
    Logger.log('[fixEC2026001Dates] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── Assign DL_IDs to EC-2026-001 SocialPosts ─────────────────────────────────
// Reads all 218 EC-2026-001 posts, generates sequential DL_IDs per platform,
// writes dl_id (col 13) and utm_url (col 14) back to SocialPosts,
// and appends matching rows to DeepLinkRegistry.
// Safe to re-run — skips any post that already has a dl_id.
// Run via doPost: { "action": "assign_ec2026001_dl_ids" }

function assignEC2026001DLIDs() {
  try {
    var now = new Date().toISOString();

    var PREFIX = {
      'Facebook':'FB','Instagram':'IG','Pinterest':'PT',
      'Nextdoor':'ND','X':'X','TikTok':'TK','YouTube':'YT','Email':'EM'
    };
    var UTM_P = {
      'Facebook':  { source:'facebook',  medium:'social' },
      'Instagram': { source:'instagram', medium:'social' },
      'Pinterest': { source:'pinterest', medium:'social' },
      'Nextdoor':  { source:'nextdoor',  medium:'social' },
      'X':         { source:'twitter',   medium:'social' },
      'TikTok':    { source:'tiktok',    medium:'social' },
      'YouTube':   { source:'youtube',   medium:'video'  },
      'Email':     { source:'email',     medium:'email'  }
    };
    var _slugify = function(s) {
      return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
    };

    // ── Load DeepLinkRegistry — find max DL number per prefix ────────────────
    var dlSheet = _getCCSheet(_CC_TAB.DL);
    var dlData  = dlSheet.getDataRange().getValues();
    var dlHdrs  = dlData[0].map(function(h){ return String(h).trim(); });
    var dlIdCol = dlHdrs.indexOf('dl_id');
    var maxN    = { FB:0, IG:0, PT:0, ND:0, X:0, TK:0, YT:0, EM:0 };

    for (var di = 1; di < dlData.length; di++) {
      var existId = String(dlData[di][dlIdCol] || '');
      var m = existId.match(/^DL-(FB|IG|PT|ND|X|TK|YT|EM)-(\d+)$/);
      if (m) {
        var n = parseInt(m[2], 10);
        if (maxN.hasOwnProperty(m[1]) && n > maxN[m[1]]) maxN[m[1]] = n;
      }
    }

    var ctr = {};
    for (var k in maxN) { ctr[k] = maxN[k]; }
    var _nextDl = function(prefix) {
      if (!ctr.hasOwnProperty(prefix)) ctr[prefix] = 0;
      ctr[prefix]++;
      return 'DL-' + prefix + '-' + ('000' + ctr[prefix]).slice(-4);
    };

    // ── Load SocialPosts ──────────────────────────────────────────────────────
    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var lastRow = spSheet.getLastRow();
    if (lastRow < 2) return { ok:false, error:'SocialPosts empty' };

    var allRows = spSheet.getRange(2, 1, lastRow - 1, 16).getValues();
    var dlIds   = [];
    var utmUrls = [];
    var newDlRows = [];
    var assigned = 0, skipped = 0;

    for (var ri = 0; ri < allRows.length; ri++) {
      var row     = allRows[ri];
      var existDl = String(row[12] || '').trim();
      var existUt = String(row[13] || '').trim();

      if (String(row[1]) !== 'EC-2026-001' || existDl) {
        dlIds.push([existDl]);
        utmUrls.push([existUt]);
        skipped++;
        continue;
      }

      var platform = String(row[2]  || 'Facebook');
      var hook     = String(row[3]  || '');
      var prefix   = PREFIX[platform] || 'FB';
      var utmP     = UTM_P[platform]  || UTM_P['Facebook'];

      var dlId     = _nextDl(prefix);
      var slug     = _slugify(hook);
      var utmContent = dlId + '|' + slug;
      var utmUrl   = 'https://easychefpro.com/lp/waitlist-a' +
                     '?utm_source='   + utmP.source +
                     '&utm_medium='   + utmP.medium +
                     '&utm_campaign=ec-2026-001' +
                     '&utm_content='  + encodeURIComponent(utmContent);

      dlIds.push([dlId]);
      utmUrls.push([utmUrl]);

      newDlRows.push([
        dlId, utmContent, 'EC-2026-001', platform,
        'https://easychefpro.com/lp/waitlist-a',
        utmP.source, utmP.medium, 'ec-2026-001',
        'active', now, now, 'assignEC2026001DLIDs',
        String(row[0])
      ]);
      assigned++;
    }

    // ── Batch-write SocialPosts dl_id (col 13) and utm_url (col 14) ──────────
    if (allRows.length) {
      spSheet.getRange(2, 13, allRows.length, 1).setValues(dlIds);
      spSheet.getRange(2, 14, allRows.length, 1).setValues(utmUrls);
    }

    // ── Batch-write DeepLinkRegistry entries ──────────────────────────────────
    if (newDlRows.length) {
      var dlWriteStart = dlSheet.getLastRow() + 1;
      dlSheet.getRange(dlWriteStart, 1, newDlRows.length, 13).setValues(newDlRows);
    }

    var msg = 'Assigned ' + assigned + ' DL_IDs | ' + newDlRows.length + ' DL registry entries added | ' + skipped + ' rows skipped';
    Logger.log('[assignEC2026001DLIDs] ' + msg);
    return { ok:true, assigned:assigned, dl_entries_added:newDlRows.length, skipped:skipped, message:msg };

  } catch(e) {
    Logger.log('[assignEC2026001DLIDs] ERROR: ' + e.message + '\n' + e.stack);
    return { ok:false, error:e.message };
  }
}

// ── Complete EC-2026-001 seed orchestrator ────────────────────────────────────
// Runs: emails + social body copy + Figma doc in one call.
// Run via doPost: { "action": "seed_ec2026001_complete" }

function seedEC2026001Complete() {
  var log = [];
  try {
    var em   = fixEC2026001Emails();
    log.push('emails: ' + (em.ok ? em.email_count + ' records' : 'ERROR — ' + em.error));

    var sc   = fillEC2026001SocialBody();
    log.push('social_body: ' + (sc.ok ? sc.updated + ' posts' : 'ERROR — ' + sc.error));

    var fd   = generateLPFigmaDoc();
    log.push('figma_doc: ' + (fd.ok ? fd.doc_url : 'ERROR — ' + fd.error));

    Logger.log('[seedEC2026001Complete] ' + log.join(' | '));
    return { ok: true, log: log, figma_doc_url: fd.doc_url || '' };

  } catch(e) {
    Logger.log('[seedEC2026001Complete] ERROR: ' + e.message);
    return { ok: false, error: e.message, log: log };
  }
}
