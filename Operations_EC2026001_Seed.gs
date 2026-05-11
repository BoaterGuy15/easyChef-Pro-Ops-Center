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

// ── Figma Export — flat JSON + sheet tab for designer handoff ────────────────
// Writes all 218 EC-2026-001 posts to:
//   (A) FigmaExport tab in Campaign Center (Google Sheets sync plugins)
//   (B) JSON file in campaign Drive folder (Content Reel / Data Populator plugins)
// Overwrites any previous export. Run via doPost: { "action": "export_ec2026001_figma_json" }

function exportEC2026001FigmaJSON() {
  try {
    var CAMPAIGN_FOLDER_ID = '1O9WYhU7B9MS9aMTUurBRCA5xufE3o8rl';

    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var lastRow = spSheet.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'SocialPosts empty' };

    var allRows = spSheet.getRange(2, 1, lastRow - 1, 16).getValues();

    var HEADERS = [
      'post_id','platform','day','week','funnel_stage','icp_target',
      'phone_in_frame','dl_id','utm_url','cta',
      'hook_a','hook_b','scene_direction','what_not_to_show','caption_opening',
      'scene_sq_1','scene_sq_2','scene_sq_3','scene_sq_4','scene_sq_5','scene_sq_6',
      'audio_direction',
      'story_arc_1','story_arc_2','story_arc_3','story_arc_4',
      'opening_hook',
      'subject_line','preview_text','header_image_direction'
    ];

    var posts      = [];
    var sheetRows  = [HEADERS];

    for (var i = 0; i < allRows.length; i++) {
      var row = allRows[i];
      if (String(row[1]) !== 'EC-2026-001') continue;

      var b = {};
      try { b = JSON.parse(String(row[15])); } catch(e) {}

      var day  = Number(b.day) || 0;
      var week = day ? Math.ceil(day / 7) : '';
      var seq  = Array.isArray(b.scene_sequence) ? b.scene_sequence : [];
      var arc  = Array.isArray(b.story_arc)      ? b.story_arc      : [];
      var wn   = Array.isArray(b.what_not_to_show)
                 ? b.what_not_to_show.join(' | ')
                 : String(b.what_not_to_show || '');

      var obj = {
        post_id:                String(row[0]  || b.post_id || ''),
        platform:               String(row[2]  || b.platform || ''),
        day:                    day,
        week:                   week,
        funnel_stage:           String(b.funnel_stage  || ''),
        icp_target:             String(b.icp_target    || ''),
        phone_in_frame:         b.phone_visibility ? 'YES' : 'NO',
        dl_id:                  String(row[12] || b.dl_id   || ''),
        utm_url:                String(row[13] || b.utm_url || ''),
        cta:                    String(b.cta             || ''),
        hook_a:                 String(b.hook_a          || ''),
        hook_b:                 String(b.hook_b          || ''),
        scene_direction:        String(b.scene_direction || ''),
        what_not_to_show:       wn,
        caption_opening:        String(b.caption_opening || ''),
        scene_sq_1:             String(seq[0] || ''),
        scene_sq_2:             String(seq[1] || ''),
        scene_sq_3:             String(seq[2] || ''),
        scene_sq_4:             String(seq[3] || ''),
        scene_sq_5:             String(seq[4] || ''),
        scene_sq_6:             String(seq[5] || ''),
        audio_direction:        String(b.audio_direction        || ''),
        story_arc_1:            String(arc[0] || ''),
        story_arc_2:            String(arc[1] || ''),
        story_arc_3:            String(arc[2] || ''),
        story_arc_4:            String(arc[3] || ''),
        opening_hook:           String(b.opening_hook           || ''),
        subject_line:           String(b.subject_line           || ''),
        preview_text:           String(b.preview_text           || ''),
        header_image_direction: String(b.header_image_direction || '')
      };

      posts.push(obj);
      sheetRows.push(HEADERS.map(function(h) { return obj[h] !== undefined ? obj[h] : ''; }));
    }

    // ── A: FigmaExport sheet tab ──────────────────────────────────────────────
    var ss      = spSheet.getParent();
    var tabName = 'FigmaExport';
    var fxSheet = ss.getSheetByName(tabName);
    if (!fxSheet) fxSheet = ss.insertSheet(tabName);
    fxSheet.clearContents();
    fxSheet.getRange(1, 1, sheetRows.length, HEADERS.length).setValues(sheetRows);
    fxSheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    fxSheet.setFrozenRows(1);
    var sheetUrl = 'https://docs.google.com/spreadsheets/d/' + ss.getId() +
                   '/edit#gid=' + fxSheet.getSheetId();

    // ── B: JSON file to Drive ─────────────────────────────────────────────────
    var payload  = JSON.stringify({
      campaign:    'EC-2026-001',
      exported_at: new Date().toISOString(),
      total:       posts.length,
      posts:       posts
    }, null, 2);
    var datestamp = Utilities.formatDate(new Date(), 'America/Los_Angeles', 'yyyyMMdd');
    var fileName  = 'easyChef-Pro_EC2026001_FigmaExport_' + datestamp + '.json';
    var folder    = DriveApp.getFolderById(CAMPAIGN_FOLDER_ID);
    var existing  = folder.getFilesByName(fileName);
    while (existing.hasNext()) existing.next().setTrashed(true);
    var jsonFile  = folder.createFile(fileName, payload, MimeType.PLAIN_TEXT);
    jsonFile.setName(fileName); // keep .json in display name
    var jsonUrl   = jsonFile.getUrl();

    Logger.log('[exportEC2026001FigmaJSON] posts:' + posts.length + ' json:' + jsonUrl + ' sheet:' + sheetUrl);
    return {
      ok:        true,
      total:     posts.length,
      json_url:  jsonUrl,
      json_id:   jsonFile.getId(),
      sheet_url: sheetUrl,
      sheet_tab: tabName,
      file_name: fileName
    };

  } catch(e) {
    Logger.log('[exportEC2026001FigmaJSON] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── Asset Lifecycle — production ops tracking tab ─────────────────────────────
// Tracks each asset from generated → in_figma → designer_review → approved
//   → scheduled → published → archived.
// seed_ec2026001_asset_lifecycle : initial seed (idempotent)
// update_asset_status            : patch any field on one asset
// asset_lifecycle_report         : count breakdown by status + platform

var _AL_STATUSES = ['generated','in_figma','in_production','designer_review','approved','scheduled','published','archived'];

function seedEC2026001AssetLifecycle() {
  try {
    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var spLast  = spSheet.getLastRow();
    if (spLast < 2) return { ok: false, error: 'SocialPosts empty' };
    var spRows  = spSheet.getRange(2, 1, spLast - 1, 16).getValues();

    var alSheet  = _getCCSheet(_CC_TAB.ASSET_LIFECYCLE);
    var headers  = _CC_HDR[_CC_TAB.ASSET_LIFECYCLE]; // 13 columns

    // Write header row if blank
    if (alSheet.getLastRow() < 1) {
      alSheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
      alSheet.setFrozenRows(1);
    }

    // Index existing asset_ids
    var existing = {};
    var alLast = alSheet.getLastRow();
    if (alLast >= 2) {
      alSheet.getRange(2, 1, alLast - 1, 1).getValues()
        .forEach(function(r) { if (r[0]) existing[String(r[0])] = true; });
    }

    var STATUS_COL = headers.indexOf('status') + 1; // 1-based = 8
    var now        = new Date().toISOString();
    var newRows    = [];

    for (var i = 0; i < spRows.length; i++) {
      var row = spRows[i];
      if (String(row[1]) !== 'EC-2026-001') continue;
      var assetId = String(row[0]);
      if (existing[assetId]) continue;

      newRows.push([
        assetId,        // asset_id
        'EC-2026-001',  // campaign_id
        String(row[2]), // platform
        '',             // figma_file_id
        '',             // figma_page
        '',             // figma_frame
        '',             // designer
        'generated',    // status
        '',             // approved_by
        '',             // export_url
        '',             // publish_date
        now,            // created_at
        now             // updated_at
      ]);
    }

    if (newRows.length) {
      var writeStart = alSheet.getLastRow() + 1;
      alSheet.getRange(writeStart, 1, newRows.length, headers.length).setValues(newRows);
      // Status dropdown validation
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(_AL_STATUSES, true).setAllowInvalid(false).build();
      alSheet.getRange(writeStart, STATUS_COL, newRows.length, 1).setDataValidation(rule);
    }

    var skipped = Object.keys(existing).length;
    Logger.log('[seedEC2026001AssetLifecycle] seeded:' + newRows.length + ' skipped:' + skipped);
    return { ok: true, seeded: newRows.length, skipped: skipped };

  } catch(e) {
    Logger.log('[seedEC2026001AssetLifecycle] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

function updateAssetStatus(assetId, fields) {
  try {
    if (!assetId) return { ok: false, error: 'asset_id required' };
    var alSheet = _getCCSheet(_CC_TAB.ASSET_LIFECYCLE);
    var last    = alSheet.getLastRow();
    if (last < 2) return { ok: false, error: 'AssetLifecycle empty — seed first' };

    var headers = _CC_HDR[_CC_TAB.ASSET_LIFECYCLE];
    var data    = alSheet.getRange(2, 1, last - 1, headers.length).getValues();

    var rowIdx = -1;
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0]) === String(assetId)) { rowIdx = i; break; }
    }
    if (rowIdx < 0) return { ok: false, error: 'asset_id not found: ' + assetId };

    var sheetRow = rowIdx + 2; // 1-based, offset for header
    var now      = new Date().toISOString();
    var ALLOWED  = ['figma_file_id','figma_page','figma_frame','designer',
                    'status','approved_by','export_url','publish_date'];

    ALLOWED.forEach(function(col) {
      if (fields[col] === undefined) return;
      var colIdx = headers.indexOf(col) + 1; // 1-based
      if (colIdx < 1) return;
      alSheet.getRange(sheetRow, colIdx).setValue(fields[col]);
    });
    // Always stamp updated_at
    alSheet.getRange(sheetRow, headers.indexOf('updated_at') + 1).setValue(now);

    Logger.log('[updateAssetStatus] ' + assetId + ' → ' + JSON.stringify(fields));
    return { ok: true, asset_id: assetId, updated: fields };

  } catch(e) {
    Logger.log('[updateAssetStatus] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

function getAssetLifecycleReport() {
  try {
    var alSheet = _getCCSheet(_CC_TAB.ASSET_LIFECYCLE);
    var last    = alSheet.getLastRow();
    if (last < 2) return { ok: true, total: 0, by_status: {}, by_platform: {} };

    var headers   = _CC_HDR[_CC_TAB.ASSET_LIFECYCLE];
    var platCol   = headers.indexOf('platform');
    var statusCol = headers.indexOf('status');
    var data      = alSheet.getRange(2, 1, last - 1, headers.length).getValues();

    var byStatus   = {};
    var byPlatform = {};
    _AL_STATUSES.forEach(function(s) { byStatus[s] = 0; });

    for (var i = 0; i < data.length; i++) {
      var platform = String(data[i][platCol]  || '');
      var status   = String(data[i][statusCol] || 'generated');
      byStatus[status] = (byStatus[status] || 0) + 1;
      if (!byPlatform[platform]) {
        byPlatform[platform] = {};
        _AL_STATUSES.forEach(function(s) { byPlatform[platform][s] = 0; });
      }
      byPlatform[platform][status] = (byPlatform[platform][status] || 0) + 1;
    }

    Logger.log('[getAssetLifecycleReport] total:' + data.length);
    return { ok: true, total: data.length, by_status: byStatus, by_platform: byPlatform };

  } catch(e) {
    Logger.log('[getAssetLifecycleReport] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── ContentCalendar — Phase 1 & 2 ────────────────────────────────────────────
// Phase 1: seed_ec2026001_content_calendar — populate 218 posts with publish
//   dates, platform posting times, and initial status=generated.
// Phase 2: get_approval_queue / approve_for_scheduling — approval gate before
//   a post can advance to scheduled.
//
// Campaign window: May 27 – Jun 30, 2026 (35 days). Day 1 = May 27.
// Posting times are Pacific defaults; override via account-level settings later.

var _CAL_STATUSES    = ['generated','in_figma','in_production','designer_review','approved','scheduled','published','reported'];
var _CAL_APPROVAL    = ['pending','approved','rejected'];
var _CAL_POST_TIMES  = {
  'Facebook':  '09:00', 'Instagram': '11:00', 'Pinterest': '20:00',
  'Nextdoor':  '07:00', 'X':         '12:00', 'TikTok':    '19:00',
  'YouTube':   '14:00', 'Email':     '09:00'
};
var _CAL_TZ = 'America/Los_Angeles';
var _EMOTIONAL_ARC = {
  'hook':    'exhausted',  'problem': 'frustrated', 'agitate': 'activated',
  'solve':   'curious',   'value':   'relieved',   'proof':   'trusting',
  'cta':     'hopeful'
};

// Returns a human-readable string describing what is blocking this asset from publishing.
// Empty string means no block (published or fully ready).
function _computeBlockedReason(r, H) {
  var status   = String(r[H.status]          || 'generated');
  var approval = String(r[H.approval_status] || 'pending');
  var creative = String(r[H.creative_status] || 'generated');
  var figmaId  = String(r[H.figma_file_id]   || '');
  var finalUrl = String(r[H.final_asset_url]  || '');
  var dlId     = String(r[H.dl_id]            || '');

  if (status === 'published' || status === 'reported') return '';
  if (approval === 'approved' && finalUrl) return '';

  var reasons = [];
  if (!dlId) reasons.push('missing dl_id');

  if (creative === 'generated') {
    reasons.push('waiting for Figma — not yet assigned');
  } else if (creative === 'in_figma') {
    reasons.push(!figmaId ? 'figma_file_id not recorded' : 'in production');
  } else if (creative === 'designer_review') {
    reasons.push('awaiting designer sign-off');
  } else if (creative === 'approved' && approval === 'pending') {
    reasons.push('creative approved — awaiting Taylor approval');
  } else if (approval === 'approved' && !finalUrl) {
    reasons.push('approved — export and upload final_asset_url');
  }

  return reasons.join(' · ');
}

function seedEC2026001ContentCalendar() {
  try {
    var CAMPAIGN_START = new Date(2026, 4, 27); // May 27, 2026 (month 0-indexed)

    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var spLast  = spSheet.getLastRow();
    if (spLast < 2) return { ok: false, error: 'SocialPosts empty' };
    var spRows  = spSheet.getRange(2, 1, spLast - 1, 16).getValues();

    var ccSheet  = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var headers  = _CC_HDR[_CC_TAB.CONTENT_CAL]; // 30 columns
    var STATUS_COL   = headers.indexOf('status')          + 1;
    var APPROVAL_COL = headers.indexOf('approval_status') + 1;
    var CREATIVE_COL = headers.indexOf('creative_status') + 1;
    // Build header→index map for _computeBlockedReason
    var H = {};
    headers.forEach(function(h, i) { H[h] = i; });

    // Clear all existing data rows (schema change: old milestone rows have corrupt column layout).
    // Idempotency is re-introduced in Phase 2 once designers start filling in fields.
    ccSheet.clearContents();
    ccSheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    ccSheet.setFrozenRows(1);
    ccSheet.setFrozenColumns(2);

    var existingByAsset = {}; // empty — fresh write every time for now

    var now     = new Date().toISOString();
    var newRows = [];

    for (var i = 0; i < spRows.length; i++) {
      var row = spRows[i];
      if (String(row[1]) !== 'EC-2026-001') continue;

      var assetId = String(row[0]);
      if (existingByAsset[assetId]) continue; // idempotent

      var b = {};
      try { b = JSON.parse(String(row[15])); } catch(e) {}

      var day = Number(b.day) || 0;
      var pubDate = '';
      if (day > 0) {
        var d = new Date(CAMPAIGN_START.getTime());
        d.setDate(d.getDate() + (day - 1));
        pubDate = Utilities.formatDate(d, _CAL_TZ, 'yyyy-MM-dd');
      }

      var platform    = String(row[2]);
      var calId       = 'cc-' + assetId;
      var funnelStage = String(b.funnel_stage || '');
      var emotion     = _EMOTIONAL_ARC[funnelStage] || '';
      var week        = day ? Math.ceil(day / 7) : '';
      var dlId        = String(row[12] || b.dl_id   || '');
      var utmUrl      = String(row[13] || b.utm_url || '');

      // Compute initial blocked_by against a synthetic row matching header order
      var syntheticRow = [];
      syntheticRow[H.status]          = 'generated';
      syntheticRow[H.approval_status] = 'pending';
      syntheticRow[H.creative_status] = 'generated';
      syntheticRow[H.figma_file_id]   = '';
      syntheticRow[H.final_asset_url] = '';
      syntheticRow[H.dl_id]           = dlId;
      syntheticRow[H.publish_date]    = pubDate;
      var blockedBy = _computeBlockedReason(syntheticRow, H);

      newRows.push([
        calId,                                // calendar_id
        assetId,                              // asset_id
        'EC-2026-001',                        // campaign_id
        platform,                             // platform
        '',                                   // account
        pubDate,                              // publish_date
        _CAL_POST_TIMES[platform] || '10:00', // publish_time
        _CAL_TZ,                              // timezone
        'generated',                          // status
        'pending',                            // approval_status
        'generated',                          // creative_status
        String(b.caption_opening || ''),      // caption
        '',                                   // hashtags
        dlId,                                 // dl_id
        utmUrl,                               // utm_url
        '',                                   // figma_export_url
        '',                                   // final_asset_url
        '',                                   // publisher
        '',                                   // scheduled_url
        '',                                   // published_url
        '',                                   // notes
        day,                                  // day
        week,                                 // week
        funnelStage,                          // funnel_stage
        emotion,                              // emotional_stage
        String(b.icp_target || ''),           // icp_target
        '',                                   // experiment_id
        blockedBy,                            // blocked_by
        now,                                  // created_at
        now,                                  // updated_at
        String(b.brief_doc_url || '')         // brief_doc_url
      ]);
    }

    if (newRows.length) {
      var writeStart = ccSheet.getLastRow() + 1;
      ccSheet.getRange(writeStart, 1, newRows.length, headers.length).setValues(newRows);
      // Dropdown validation
      var statusRule   = SpreadsheetApp.newDataValidation()
        .requireValueInList(_CAL_STATUSES, true).setAllowInvalid(false).build();
      var approvalRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(_CAL_APPROVAL, true).setAllowInvalid(false).build();
      ccSheet.getRange(writeStart, STATUS_COL,   newRows.length, 1).setDataValidation(statusRule);
      ccSheet.getRange(writeStart, APPROVAL_COL, newRows.length, 1).setDataValidation(approvalRule);
      ccSheet.getRange(writeStart, CREATIVE_COL, newRows.length, 1).setDataValidation(statusRule);
    }

    var skipped = Object.keys(existingByAsset).length;
    Logger.log('[seedEC2026001ContentCalendar] seeded:' + newRows.length + ' skipped:' + skipped);
    return {
      ok: true, seeded: newRows.length, skipped: skipped,
      campaign_start: '2026-05-27', campaign_end: '2026-06-30'
    };

  } catch(e) {
    Logger.log('[seedEC2026001ContentCalendar] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── Cockpit: blocked assets + campaign dashboard ──────────────────────────────

function getBlockedAssets(campaignId) {
  try {
    campaignId = campaignId || 'EC-2026-001';
    var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last    = ccSheet.getLastRow();
    if (last < 2) return { ok: true, blocked: [], total_blocked: 0 };

    var headers = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var H = {};
    headers.forEach(function(h, i) { H[h] = i; });
    var data = ccSheet.getRange(2, 1, last - 1, headers.length).getValues();

    var blocked = [];
    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      if (!r[0] || String(r[H.campaign_id]) !== campaignId) continue;
      var reason = _computeBlockedReason(r, H);
      if (reason && reason !== 'in production') {
        blocked.push({
          calendar_id:    String(r[H.calendar_id]),
          asset_id:       String(r[H.asset_id]),
          platform:       String(r[H.platform]),
          day:            Number(r[H.day] || 0),
          publish_date:   String(r[H.publish_date] || ''),
          status:         String(r[H.status]),
          creative_status:String(r[H.creative_status]),
          approval_status:String(r[H.approval_status]),
          blocked_by:     reason
        });
      }
    }
    // Refresh blocked_by column in sheet
    for (var j = 0; j < data.length; j++) {
      if (!data[j][0] || String(data[j][H.campaign_id]) !== campaignId) continue;
      var updated = _computeBlockedReason(data[j], H);
      ccSheet.getRange(j + 2, H.blocked_by + 1).setValue(updated);
    }

    blocked.sort(function(a, b) { return (a.day || 99) - (b.day || 99); });
    Logger.log('[getBlockedAssets] blocked:' + blocked.length);
    return { ok: true, total_blocked: blocked.length, blocked: blocked };
  } catch(e) {
    Logger.log('[getBlockedAssets] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

function getCampaignDashboard(campaignId) {
  try {
    campaignId = campaignId || 'EC-2026-001';
    var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last    = ccSheet.getLastRow();
    if (last < 2) return { ok: true, campaign: campaignId, total_assets: 0 };

    var headers = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var H = {};
    headers.forEach(function(h, i) { H[h] = i; });
    var data  = ccSheet.getRange(2, 1, last - 1, headers.length).getValues();
    var today = new Date();

    var pipeline   = {};
    var byPlatform = {};
    var byFunnel   = {};
    var byEmotion  = {};
    var byWeek     = {};
    _CAL_STATUSES.forEach(function(s) { pipeline[s] = 0; });

    var approvalQueue    = [];
    var readyToSchedule  = [];
    var lateAssets       = [];
    var blockedCount     = 0;
    var total            = 0;

    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      if (!r[0] || String(r[H.campaign_id]) !== campaignId) continue;
      total++;

      var status   = String(r[H.status]          || 'generated');
      var approval = String(r[H.approval_status] || 'pending');
      var creative = String(r[H.creative_status] || 'generated');
      var platform = String(r[H.platform]        || '');
      var funnel   = String(r[H.funnel_stage]    || '');
      var emotion  = String(r[H.emotional_stage] || '');
      var week     = Number(r[H.week]            || 0);
      var day      = Number(r[H.day]             || 0);
      var finalUrl = String(r[H.final_asset_url] || '');
      var calId    = String(r[H.calendar_id]     || '');
      var assetId  = String(r[H.asset_id]        || '');
      var pubDate  = r[H.publish_date];

      pipeline[status] = (pipeline[status] || 0) + 1;

      if (!byPlatform[platform]) {
        byPlatform[platform] = {};
        _CAL_STATUSES.forEach(function(s) { byPlatform[platform][s] = 0; });
      }
      byPlatform[platform][status]++;

      if (funnel)  byFunnel[funnel]   = (byFunnel[funnel]  || 0) + 1;
      if (emotion) byEmotion[emotion] = (byEmotion[emotion] || 0) + 1;

      if (week) {
        var wk = 'week_' + week;
        if (!byWeek[wk]) byWeek[wk] = { total: 0, published: 0, approved: 0, blocked: 0 };
        byWeek[wk].total++;
        if (status === 'published')          byWeek[wk].published++;
        if (approval === 'approved')         byWeek[wk].approved++;
        var br = _computeBlockedReason(r, H);
        if (br && br !== 'in production') { byWeek[wk].blocked++; blockedCount++; }
      }

      if (creative === 'approved' && approval === 'pending') {
        approvalQueue.push({ calendar_id: calId, asset_id: assetId, platform: platform,
                             publish_date: String(pubDate || ''), day: day });
      }
      if (approval === 'approved' && finalUrl && status !== 'scheduled' && status !== 'published') {
        readyToSchedule.push({ calendar_id: calId, asset_id: assetId, platform: platform,
                               publish_date: String(pubDate || '') });
      }
      if (pubDate && status !== 'published' && status !== 'reported') {
        try {
          var pd = pubDate instanceof Date ? pubDate : new Date(String(pubDate));
          if (!isNaN(pd.getTime()) && pd < today) {
            lateAssets.push({ calendar_id: calId, asset_id: assetId, platform: platform,
                              publish_date: String(pubDate), status: status, day: day });
          }
        } catch(e) {}
      }
    }

    approvalQueue.sort(function(a, b) { return (a.day||99)-(b.day||99); });
    lateAssets.sort(function(a, b) { return (a.day||99)-(b.day||99); });

    Logger.log('[getCampaignDashboard] total:' + total + ' blocked:' + blockedCount +
               ' late:' + lateAssets.length + ' approval_queue:' + approvalQueue.length);
    return {
      ok: true,
      campaign: campaignId,
      total_assets: total,
      pipeline: pipeline,
      by_platform: byPlatform,
      by_funnel_stage: byFunnel,
      by_emotional_stage: byEmotion,
      by_week: byWeek,
      approval_queue_count: approvalQueue.length,
      approval_queue: approvalQueue,
      ready_to_schedule_count: readyToSchedule.length,
      ready_to_schedule: readyToSchedule,
      blocked_count: blockedCount,
      late_count: lateAssets.length,
      late_assets: lateAssets
    };
  } catch(e) {
    Logger.log('[getCampaignDashboard] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Calendar feed ─────────────────────────────────────────────────────────────

function getCampaignCalendar(campaignId) {
  try {
    campaignId = campaignId || 'EC-2026-001';
    var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last    = ccSheet.getLastRow();
    if (last < 2) return { ok: true, campaign: campaignId, days: {} };

    var sheetId  = ccSheet.getParent().getId();
    var sheetGid = ccSheet.getSheetId();

    // Build dl_id → design_brief URL map from SocialPosts
    var spMap = {};
    try {
      var spSheet2 = _getCCSheet(_CC_TAB.SOCIAL);
      var spLast2  = spSheet2.getLastRow();
      if (spLast2 >= 2) {
        var spHdrs2 = _CC_HDR[_CC_TAB.SOCIAL];
        var spH2 = {};
        spHdrs2.forEach(function(h, i) { spH2[h] = i; });
        var spData2 = spSheet2.getRange(2, 1, spLast2 - 1, spHdrs2.length).getValues();
        spData2.forEach(function(row) {
          var dlId2     = String(row[spH2.dl_id]       || '');
          var briefUrl2 = String(row[spH2.design_brief] || '');
          if (dlId2 && briefUrl2) spMap[dlId2] = briefUrl2;
        });
      }
    } catch(se) { Logger.log('[getCampaignCalendar] spMap error: ' + se.message); }

    var headers = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var H = {};
    headers.forEach(function(h, i) { H[h] = i; });
    var data = ccSheet.getRange(2, 1, last - 1, headers.length).getValues();
    var days = {};

    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      var sheetRow = i + 2;
      if (!r[0] || String(r[H.campaign_id]) !== campaignId) continue;

      var pubDate = r[H.publish_date];
      var dateKey = '';
      if (pubDate) {
        try {
          var d = pubDate instanceof Date ? pubDate : new Date(String(pubDate));
          if (!isNaN(d.getTime())) dateKey = Utilities.formatDate(d, 'America/Los_Angeles', 'yyyy-MM-dd');
        } catch(e2) {}
      }
      if (!dateKey) continue;

      var platform = String(r[H.platform]        || '');
      var status   = String(r[H.status]          || 'generated');
      var creative = String(r[H.creative_status] || 'generated');
      var approval = String(r[H.approval_status] || 'pending');
      var emotion  = String(r[H.emotional_stage] || '');
      var funnel   = String(r[H.funnel_stage]    || '');
      var assetId  = String(r[H.asset_id]          || '');
      var calId    = String(r[H.calendar_id]       || '');
      var dlId     = String(r[H.dl_id]             || '');
      var figmaUrl    = String(r[H.figma_export_url] || '');
      var notes       = String(r[H.notes]           || '');
      var pubTime     = String(r[H.publish_time]    || '');
      var day         = Number(r[H.day]             || 0);
      var week        = Number(r[H.week]            || 0);
      var briefDocUrl = String(r[H.brief_doc_url]   || '') || (dlId ? (spMap[dlId] || '') : '');
      var blockedReason = _computeBlockedReason(r, H);
      var isBlocked = !!(blockedReason && blockedReason !== 'in production');

      if (!days[dateKey]) {
        days[dateKey] = { date: dateKey, day: day, week: week, posts: [], total: 0, published: 0, approved: 0, blocked: 0 };
      }
      days[dateKey].posts.push({
        asset_id: assetId, calendar_id: calId, dl_id: dlId, platform: platform,
        status: status, creative_status: creative, approval_status: approval,
        emotional_stage: emotion, funnel_stage: funnel, publish_time: pubTime,
        blocked: isBlocked, blocked_reason: blockedReason,
        figma_url: figmaUrl, brief_doc_url: briefDocUrl,
        notes: notes, sheet_row: sheetRow
      });
      days[dateKey].total++;
      if (status === 'published')  days[dateKey].published++;
      if (approval === 'approved') days[dateKey].approved++;
      if (isBlocked)               days[dateKey].blocked++;
    }

    Object.keys(days).forEach(function(dk) {
      days[dk].posts.sort(function(a, b) { return a.platform.localeCompare(b.platform); });
    });

    var driveFolders = { 'EC-2026-001': 'https://drive.google.com/drive/folders/1O9WYhU7B9MS9aMTUurBRCA5xufE3o8rl' };
    Logger.log('[getCampaignCalendar] ' + Object.keys(days).length + ' days');
    return { ok: true, campaign: campaignId, days: days, sheet_id: sheetId, sheet_gid: sheetGid, drive_folder_url: driveFolders[campaignId] || null };
  } catch(e) {
    Logger.log('[getCampaignCalendar] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Phase 2: Approval gate ────────────────────────────────────────────────────

function getApprovalQueue() {
  try {
    var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last    = ccSheet.getLastRow();
    if (last < 2) return { ok: true, queue: [], total: 0 };

    var headers      = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var calIdCol     = headers.indexOf('calendar_id');
    var assetCol     = headers.indexOf('asset_id');
    var platCol      = headers.indexOf('platform');
    var pubDateCol   = headers.indexOf('publish_date');
    var statusCol    = headers.indexOf('status');
    var approvalCol  = headers.indexOf('approval_status');
    var creativeCol  = headers.indexOf('creative_status');
    var captionCol   = headers.indexOf('caption');
    var dlCol        = headers.indexOf('dl_id');

    var data  = ccSheet.getRange(2, 1, last - 1, headers.length).getValues();
    var queue = [];

    for (var i = 0; i < data.length; i++) {
      var r = data[i];
      if (!r[calIdCol]) continue;
      // Ready for Taylor approval: creative is approved, awaiting campaign approval
      if (String(r[creativeCol]) === 'approved' && String(r[approvalCol]) === 'pending') {
        queue.push({
          calendar_id:     String(r[calIdCol]),
          asset_id:        String(r[assetCol]),
          platform:        String(r[platCol]),
          publish_date:    String(r[pubDateCol]),
          status:          String(r[statusCol]),
          approval_status: 'pending',
          creative_status: 'approved',
          caption:         String(r[captionCol] || ''),
          dl_id:           String(r[dlCol] || '')
        });
      }
    }

    Logger.log('[getApprovalQueue] queue:' + queue.length);
    return { ok: true, queue: queue, total: queue.length };

  } catch(e) {
    Logger.log('[getApprovalQueue] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

function approveForScheduling(calendarId) {
  try {
    if (!calendarId) return { ok: false, error: 'calendar_id required' };
    var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last    = ccSheet.getLastRow();
    if (last < 2) return { ok: false, error: 'ContentCalendar empty' };

    var headers     = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var data        = ccSheet.getRange(2, 1, last - 1, headers.length).getValues();
    var approvalCol = headers.indexOf('approval_status') + 1;
    var statusCol   = headers.indexOf('status')          + 1;
    var updatedCol  = headers.indexOf('updated_at')      + 1;
    var now         = new Date().toISOString();

    for (var i = 0; i < data.length; i++) {
      if (String(data[i][0]) === String(calendarId)) {
        var sheetRow = i + 2;
        if (String(data[i][headers.indexOf('approval_status')]) === 'approved') {
          return { ok: false, error: calendarId + ' already approved' };
        }
        ccSheet.getRange(sheetRow, approvalCol).setValue('approved');
        ccSheet.getRange(sheetRow, statusCol).setValue('approved');
        ccSheet.getRange(sheetRow, updatedCol).setValue(now);
        Logger.log('[approveForScheduling] ' + calendarId + ' → approved');
        return { ok: true, calendar_id: calendarId, approval_status: 'approved', status: 'approved' };
      }
    }
    return { ok: false, error: 'calendar_id not found: ' + calendarId };

  } catch(e) {
    Logger.log('[approveForScheduling] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

function getContentCalendarReport() {
  try {
    var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last    = ccSheet.getLastRow();
    if (last < 2) return { ok: true, total: 0, by_status: {}, by_approval: {}, by_platform: {} };

    var headers     = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var platCol     = headers.indexOf('platform');
    var statusCol   = headers.indexOf('status');
    var approvalCol = headers.indexOf('approval_status');
    var data        = ccSheet.getRange(2, 1, last - 1, headers.length).getValues();

    var byStatus   = {};
    var byApproval = {};
    var byPlatform = {};
    _CAL_STATUSES.forEach(function(s) { byStatus[s] = 0; });
    _CAL_APPROVAL.forEach(function(s) { byApproval[s] = 0; });

    for (var i = 0; i < data.length; i++) {
      if (!data[i][0]) continue; // skip blank rows
      var platform = String(data[i][platCol]     || '');
      var status   = String(data[i][statusCol]   || 'generated');
      var approval = String(data[i][approvalCol] || 'pending');
      byStatus[status]   = (byStatus[status]   || 0) + 1;
      byApproval[approval] = (byApproval[approval] || 0) + 1;
      if (!byPlatform[platform]) {
        byPlatform[platform] = {};
        _CAL_STATUSES.forEach(function(s) { byPlatform[platform][s] = 0; });
      }
      byPlatform[platform][status] = (byPlatform[platform][status] || 0) + 1;
    }

    Logger.log('[getContentCalendarReport] total:' + data.length);
    return { ok: true, total: data.length, by_status: byStatus, by_approval: byApproval, by_platform: byPlatform };

  } catch(e) {
    Logger.log('[getContentCalendarReport] ERROR: ' + e.message);
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
      // "optimize" as verb is banned; all-caps "OPTIMIZE" (feature label noun) is allowed
      if (/\b[Oo]ptimiz(e[sd]?|ing|ation)\b/.test(creativeText(b))) bannedHits.push('optimize (verb)');
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
      // "optimize" as verb is banned; all-caps "OPTIMIZE" (feature label noun) is allowed
      var rawTxt = parts.filter(Boolean).join(' ');
      if (/\b[Oo]ptimiz(e[sd]?|ing|ation)\b/.test(rawTxt)) return true;
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

// ── Seed LP Inventory — coming-soon, thank-you pages, patch lp-001/002 ────────
// Adds lp-007 (coming-soon · LIVE), lp-008 (thank-you variant A · PENDING_DEV),
// lp-009 (thank-you variant B · PENDING_DEV).
// Patches lp-001 and lp-002 with page_type + thank_you_url if not already set.
// Safe to re-run — setLPInventoryEntry is an upsert.
// Run via doPost: { "action": "seed_ec2026001_lp_pages" }

// ── Seed LandingPages tab — link existing rows to EC-2026-001, add new pages ──
// Patches lp-001..lp-006 with campaign_id (preserves all existing copy).
// Adds lp-007 (coming-soon), lp-008 (thank-you A), lp-009 (thank-you B).
// Safe to re-run — setLandingPage is an upsert.
// Run via doPost: { "action": "seed_ec2026001_landing_pages" }

function seedEC2026001LandingPages() {
  try {
    var results = [];

    // ── Patch existing LPs with campaign_id ───────────────────────────────────
    var existing = [
      { id: 'lp-001', icp: 'super_mom_money', variant: 'A' },
      { id: 'lp-002', icp: 'super_mom_time',  variant: 'B' },
      { id: 'lp-003', icp: 'super_mom_money', variant: 'A' },
      { id: 'lp-004', icp: 'super_mom_money', variant: 'A' },
      { id: 'lp-005', icp: 'super_mom_time',  variant: 'B' },
      { id: 'lp-006', icp: 'super_mom_time',  variant: 'B' }
    ];
    existing.forEach(function(e) {
      setLandingPage({
        id:                   e.id,
        campaign_id:          'EC-2026-001',
        icp_code:             e.icp,
        campaign_type:        'Waitlist',
        blueprint_code:       'A-Waitlist',
        icp_codes:            e.icp,
        theme:                'invisible-leak',
        ab_test_variant:      e.variant,
        convert_experiment_id:'100140422'
      });
    });
    results.push('✓ ' + existing.length + ' existing LandingPages linked to EC-2026-001');

    // ── lp-007 · Coming Soon ─────────────────────────────────────────────────
    setLandingPage({
      id:                   'lp-007',
      campaign_id:          'EC-2026-001',
      icp_code:             'super_mom_money',
      slug:                 'coming-soon',
      full_url:             'https://easychefpro.com/coming-soon',
      title_tag:            'Something Big is Coming · easyChef Pro',
      meta_description:     'easyChef Pro — TRACK → PLAN → OPTIMIZE → COOK → SHOP. Early access July 1.',
      og_title:             'Something Big is Coming to Your Kitchen · easyChef Pro',
      og_description:       'Stop the invisible grocery leak. Join the waitlist — early access July 1.',
      hero_headline:        'Something big is coming to your kitchen.',
      hero_subheadline:     'First 5,000 families lock in $7.99/month forever. The rest pay $19.99.',
      section_problem:      'You spend $111/month on groceries that expire before they become dinner.',
      section_agitate:      'Five apps. None of them talk to each other. The leak runs in the gap.',
      section_solve:        'easyChef Pro closes the loop. TRACK → PLAN → OPTIMIZE → COOK → SHOP.',
      section_value:        '$1,336/year average savings · 30 minutes fridge to table · 69.5% less food waste',
      section_proof:        'Validated across 10,000 households · 9 patent-pending technologies · Built by first responders',
      section_cta:          'Join the waitlist — early access July 1',
      status:               'live',
      dev_built:            true,
      qa_passed:            false,
      pushed_to_production: true,
      campaign_type:        'PreLaunch',
      blueprint_code:       'A-Waitlist',
      icp_codes:            'super_mom_money · super_mom_time',
      theme:                'invisible-leak',
      ab_test_variant:      'none',
      convert_experiment_id:'100140422',
      total_signups:        0
    });
    results.push('✓ lp-007 added: /coming-soon');

    // ── lp-008 · Thank You — Variant A ───────────────────────────────────────
    setLandingPage({
      id:                   'lp-008',
      campaign_id:          'EC-2026-001',
      icp_code:             'super_mom_money',
      slug:                 'thank-you',
      full_url:             'https://easychefpro.com/thank-you',
      title_tag:            'You\'re In · easyChef Pro',
      meta_description:     'Welcome to the founding family. Your $7.99/month founding price is locked forever.',
      og_title:             'I Just Joined the easyChef Pro Founding Family',
      og_description:       'Early access July 1. $7.99/month locked forever. First 5,000 only.',
      hero_headline:        'You\'re in. Welcome to the founding family.',
      hero_subheadline:     'Your $7.99/month founding price is locked. You got here first.',
      section_problem:      '',
      section_agitate:      '',
      section_solve:        'You closed the loop. TRACK → PLAN → OPTIMIZE → COOK → SHOP. July 1.',
      section_value:        '$1,336/year average savings locked in. $7.99/month. Forever.',
      section_proof:        'You are founding member #[N]. That number is yours forever.',
      section_cta:          'Share with a friend who needs this',
      status:               'PENDING_DEV',
      dev_built:            false,
      qa_passed:            false,
      pushed_to_production: false,
      campaign_type:        'Confirmation',
      blueprint_code:       'A-Waitlist',
      icp_codes:            'super_mom_money',
      theme:                'invisible-leak',
      ab_test_variant:      'A',
      convert_experiment_id:'100140422',
      total_signups:        0
    });
    results.push('✓ lp-008 added: /thank-you Variant A');

    // ── lp-009 · Thank You — Variant B ───────────────────────────────────────
    setLandingPage({
      id:                   'lp-009',
      campaign_id:          'EC-2026-001',
      icp_code:             'super_mom_time',
      slug:                 'thank-you',
      full_url:             'https://easychefpro.com/thank-you',
      title_tag:            'You\'re In · easyChef Pro',
      meta_description:     'Welcome to the founding family. Dinner figured out. Early access July 1.',
      og_title:             'I Just Joined the easyChef Pro Founding Family',
      og_description:       'Dinner decided before I open the fridge. Early access July 1. First 5,000 only.',
      hero_headline:        'Dinner is figured out. Welcome to the founding family.',
      hero_subheadline:     'You found this before it was everywhere. That is what founding members do.',
      section_problem:      '',
      section_agitate:      '',
      section_solve:        'The 6:30 PM wall is gone. Dinner decided before you open the fridge.',
      section_value:        'Founding price locked. Early access July 1. Kitchen in command.',
      section_proof:        'You are founding member #[N]. That number is yours forever.',
      section_cta:          'Share with a mom who deserves this',
      status:               'PENDING_DEV',
      dev_built:            false,
      qa_passed:            false,
      pushed_to_production: false,
      campaign_type:        'Confirmation',
      blueprint_code:       'A-Waitlist',
      icp_codes:            'super_mom_time',
      theme:                'invisible-leak',
      ab_test_variant:      'B',
      convert_experiment_id:'100140422',
      total_signups:        0
    });
    results.push('✓ lp-009 added: /thank-you Variant B');

    Logger.log('[seedEC2026001LandingPages] ' + results.join(' | '));
    return { ok: true, results: results };

  } catch(e) {
    Logger.log('[seedEC2026001LandingPages] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

function seedEC2026001LPPages() {
  try {
    var results = [];
    var now = _ccNow();

    // ── Patch all known waitlist LPs with page_type + thank_you_url ─────────
    var _lpPatches = [
      { id: 'lp-001',        ty: 'https://easychefpro.com/thank-you?src=waitlist-a' },
      { id: 'lp-waitlist-a', ty: 'https://easychefpro.com/thank-you?src=waitlist-a' },
      { id: 'lp-002',        ty: 'https://easychefpro.com/thank-you?src=waitlist-b' },
      { id: 'lp-waitlist-b', ty: 'https://easychefpro.com/thank-you?src=waitlist-b' },
      { id: 'lp-003',        ty: 'https://easychefpro.com/thank-you?src=alpha'      },
      { id: 'lp-004',        ty: 'https://easychefpro.com/thank-you?src=social-fb'  },
      { id: 'lp-005',        ty: 'https://easychefpro.com/thank-you?src=social-ig'  },
      { id: 'lp-006',        ty: 'https://easychefpro.com/thank-you?src=630pm'      },
      { id: 'lp-moxpzy58',   ty: 'https://easychefpro.com/thank-you?src=founder'    },
      { id: 'lp-moxr1gz7',   ty: 'https://easychefpro.com/thank-you?src=prelaunch'  },
      { id: 'lp-mozb7flm',   ty: 'https://easychefpro.com/thank-you?src=budget'     }
    ];
    _lpPatches.forEach(function(p) {
      setLPInventoryEntry({ id: p.id, page_type: 'waitlist_lp', thank_you_url: p.ty });
    });
    results.push('✓ ' + _lpPatches.length + ' waitlist LPs patched: page_type + thank_you_url');

    // ── lp-007 · Coming Soon ─────────────────────────────────────────────────
    setLPInventoryEntry({
      id:                 'lp-007',
      slug:               'coming-soon',
      full_url:           'https://easychefpro.com/coming-soon',
      campaign_type:      'PreLaunch',
      blueprint_code:     'A-Waitlist',
      icp_codes:          'super_mom_money · super_mom_time',
      campaign_angle:     'savings',
      lp_variant:         '',
      headline:           'Something big is coming to your kitchen.',
      cta_primary:        'Join the waitlist — early access July 1',
      proof_bar:          '$1,336/year average savings · 30 minutes fridge to table · 69.5% less food waste',
      status:             'LIVE',
      dev_built:          true,
      convert_installed:  false,
      clarity_installed:  false,
      ga4_installed:      false,
      campaigns_using:    'EC-2026-001',
      total_signups:      0,
      notes:              'Root easychefpro.com 302 → /coming-soon via Cloudflare · pre-launch intent capture',
      urgency_type:       'founding-price',
      urgency_line:       'First 5,000 families lock in $7.99/month forever.',
      urgency_placement:  'below-hero',
      exclusivity_angle:  'founding-family',
      exclusivity_line:   'You found this before everyone else.',
      meta_title:         'Something Big is Coming · easyChef Pro',
      meta_description:   'easyChef Pro — the meal management system that closes the loop. TRACK → PLAN → OPTIMIZE → COOK → SHOP. Early access July 1.',
      og_title:           'Something Big is Coming to Your Kitchen · easyChef Pro',
      og_description:     'Stop the invisible grocery leak. Join the waitlist — early access July 1.',
      canonical_url:      'https://easychefpro.com/coming-soon',
      focus_keyword:      'meal planning app early access',
      page_type:          'coming_soon',
      thank_you_url:      'https://easychefpro.com/thank-you?src=coming-soon'
    });
    results.push('✓ lp-007 seeded: /coming-soon · LIVE');

    // ── lp-008 · Thank You — Variant A (src=waitlist-a) ─────────────────────
    setLPInventoryEntry({
      id:                 'lp-008',
      slug:               'thank-you',
      full_url:           'https://easychefpro.com/thank-you',
      campaign_type:      'Confirmation',
      blueprint_code:     'A-Waitlist',
      icp_codes:          'super_mom_money',
      campaign_angle:     'savings',
      lp_variant:         'A',
      headline:           'You\'re in. Welcome to the founding family.',
      cta_primary:        'Share with a friend who needs this',
      proof_bar:          '$1,336/year average savings · $7.99/month founding price locked · Early access July 1',
      status:             'PENDING_DEV',
      dev_built:          false,
      convert_installed:  false,
      clarity_installed:  false,
      ga4_installed:      false,
      campaigns_using:    'EC-2026-001',
      total_signups:      0,
      notes:              'Variant A · src=waitlist-a · ICP: super_mom_money · angle: savings · share mechanic + referral CTA',
      urgency_type:       'founding-price',
      urgency_line:       'Your founding price is locked. Tell someone who should have it too.',
      urgency_placement:  'below-hero',
      exclusivity_angle:  'founding-family',
      exclusivity_line:   'You are founding member #[N]. That number is yours forever.',
      meta_title:         'You\'re In · easyChef Pro',
      meta_description:   'Welcome to the founding family. Your $7.99/month founding price is locked forever.',
      og_title:           'I Just Joined the easyChef Pro Founding Family',
      og_description:     'Early access July 1. $7.99/month locked forever. First 5,000 only.',
      canonical_url:      'https://easychefpro.com/thank-you',
      focus_keyword:      'easychef pro founding family waitlist',
      page_type:          'thank_you',
      thank_you_url:      ''
    });
    results.push('✓ lp-008 seeded: /thank-you?src=waitlist-a · Variant A');

    // ── lp-009 · Thank You — Variant B (src=waitlist-b) ─────────────────────
    setLPInventoryEntry({
      id:                 'lp-009',
      slug:               'thank-you',
      full_url:           'https://easychefpro.com/thank-you',
      campaign_type:      'Confirmation',
      blueprint_code:     'A-Waitlist',
      icp_codes:          'super_mom_time',
      campaign_angle:     'time_relief',
      lp_variant:         'B',
      headline:           'Dinner is figured out. Welcome to the founding family.',
      cta_primary:        'Share with a mom who deserves this',
      proof_bar:          'Dinner decided before you open the fridge · Founding price locked · Early access July 1',
      status:             'PENDING_DEV',
      dev_built:          false,
      convert_installed:  false,
      clarity_installed:  false,
      ga4_installed:      false,
      campaigns_using:    'EC-2026-001',
      total_signups:      0,
      notes:              'Variant B · src=waitlist-b · ICP: super_mom_time · angle: time_relief · founding family identity + share mechanic',
      urgency_type:       'founding-price',
      urgency_line:       'Your founding price is locked. Share it with someone who needs it.',
      urgency_placement:  'below-hero',
      exclusivity_angle:  'founding-family',
      exclusivity_line:   'You found this before it was everywhere. That is what founding members do.',
      meta_title:         'You\'re In · easyChef Pro',
      meta_description:   'Welcome to the founding family. Dinner figured out. Early access July 1.',
      og_title:           'I Just Joined the easyChef Pro Founding Family',
      og_description:     'Dinner decided before I open the fridge. Early access July 1. First 5,000 only.',
      canonical_url:      'https://easychefpro.com/thank-you',
      focus_keyword:      'easychef pro founding family waitlist',
      page_type:          'thank_you',
      thank_you_url:      ''
    });
    results.push('✓ lp-009 seeded: /thank-you?src=waitlist-b · Variant B');

    Logger.log('[seedEC2026001LPPages] ' + results.join(' | '));
    return { ok: true, results: results };

  } catch(e) {
    Logger.log('[seedEC2026001LPPages] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// ── ICP UTM + LP Variant patch for EC-2026-001 active ICPs ───────────────────
function seedEC2026001IcpUtmLp() {
  var patches = [
    {
      id: 'single_parent',
      utm_campaign_codes: 'fb_super_mom · ig_health · seq1_welcome · seq2_nurture · seq3_urgency · seq4_launch_day',
      lp_variants: '/lp/waitlist-a · /lp/waitlist-b (folds into Super Mom funnel · same copy arc)'
    },
    {
      id: 'large_family',
      utm_campaign_codes: 'fb_super_mom · ig_health · seq1_welcome · seq2_nurture · seq3_urgency · seq4_launch_day',
      lp_variants: '/lp/waitlist-a · /lp/waitlist-b (folds into Super Mom funnel initially · savings angle scales with family size)'
    },
    {
      id: 'busy_dad',
      utm_campaign_codes: 'fb_super_mom · ig_health · seq1_welcome · seq2_nurture · seq3_urgency · seq4_launch_day',
      lp_variants: '/lp/waitlist-a · /lp/waitlist-b (secondary persona within family ICP · dinner hero angle)'
    },
    {
      id: 'walmart_shopper',
      utm_campaign_codes: 'fb_super_mom · ig_health · seq1_welcome · seq2_nurture · seq3_urgency · seq4_launch_day',
      lp_variants: '/lp/waitlist-a (Money Hook — 800K Walmart products) · /lp/alpha (?src=alpha · Alpha Wave 1 primary)'
    },
    {
      id: 'alpha_recruit',
      utm_campaign_codes: 'dl_dir_alpha · seq3_urgency · seq4_launch_day',
      lp_variants: '/lp/alpha (?src=alpha · personal invite from founder · DL-DIR format)'
    },
    {
      id: 'pre_launch_visitor',
      utm_campaign_codes: 'organic · referral · coming_soon',
      lp_variants: '/coming-soon (lp-007 · page_type: coming_soon · 302 from root domain)'
    },
    {
      id: 'founder_family',
      utm_campaign_codes: 'seq3_urgency · seq4_launch_day',
      lp_variants: '/lp/waitlist-a · /lp/waitlist-b (email conversion · founding member price confirmation · thank-you pages)'
    }
  ];

  var results = [];
  patches.forEach(function(p) {
    try {
      setIcpProfile(p);
      results.push('✓ ' + p.id);
    } catch(e) {
      results.push('✗ ' + p.id + ': ' + e.message);
    }
  });
  Logger.log('[seedEC2026001IcpUtmLp] ' + results.join(' | '));
  return { ok: true, patched: results };
}

// ── Restore lp-waitlist-a and lp-waitlist-b after header-repair wipe ─────────
function restoreLpWaitlistAB() {
  var results = [];
  try {
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
      focus_keyword:      'meal planning app save money groceries',
      page_type:          'waitlist_lp',
      thank_you_url:      'https://easychefpro.com/thank-you?src=waitlist-a'
    });
    results.push('✓ lp-waitlist-a restored');
  } catch(e) { results.push('✗ lp-waitlist-a: ' + e.message); }
  try {
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
      focus_keyword:      'meal planning app family dinner ideas',
      page_type:          'waitlist_lp',
      thank_you_url:      'https://easychefpro.com/thank-you?src=waitlist-b'
    });
    results.push('✓ lp-waitlist-b restored');
  } catch(e) { results.push('✗ lp-waitlist-b: ' + e.message); }
  Logger.log('[restoreLpWaitlistAB] ' + results.join(' | '));
  return { ok: true, results: results };
}

// ── Repair all status dropdowns across AssetLifecycle + ContentCalendar ───────
function repairAllStatusDropdowns() {
  var mkRule = function(list) {
    return SpreadsheetApp.newDataValidation()
      .requireValueInList(list, true).setAllowInvalid(false).build();
  };
  var results = [];

  // ── AssetLifecycle: status (col 8) ──────────────────────────────────────────
  (function() {
    var sheet = _getCCSheet(_CC_TAB.ASSET_LIFECYCLE);
    var last  = sheet.getLastRow();
    if (last < 2) { results.push('AssetLifecycle: empty'); return; }
    var col = _CC_HDR.AssetLifecycle.indexOf('status') + 1;
    sheet.getRange(2, col, last - 1, 1).setDataValidation(mkRule(_AL_STATUSES));
    results.push('AssetLifecycle: ' + (last - 1) + ' rows · ' + _AL_STATUSES.join(', '));
  })();

  // ── ContentCalendar: status (col 9), approval_status (col 10), creative_status (col 11) ──
  (function() {
    var sheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last  = sheet.getLastRow();
    if (last < 2) { results.push('ContentCalendar: empty'); return; }
    var hdr       = _CC_HDR.ContentCalendar;
    var statusCol  = hdr.indexOf('status')          + 1;
    var approvalCol= hdr.indexOf('approval_status') + 1;
    var creativeCol= hdr.indexOf('creative_status') + 1;
    var rows = last - 1;
    sheet.getRange(2, statusCol,   rows, 1).setDataValidation(mkRule(_CAL_STATUSES));
    sheet.getRange(2, approvalCol, rows, 1).setDataValidation(mkRule(_CAL_APPROVAL));
    sheet.getRange(2, creativeCol, rows, 1).setDataValidation(mkRule(_CAL_STATUSES));
    results.push('ContentCalendar: ' + rows + ' rows · status+approval+creative · ' + _CAL_STATUSES.join(', '));
  })();

  Logger.log('[repairAllStatusDropdowns] ' + results.join(' | '));
  return { ok: true, results: results };
}

// Keep old name wired for backwards compat
function repairAssetLifecycleDropdowns() {
  return repairAllStatusDropdowns();
}

// ── VideoProduction seed — TikTok + YouTube from SocialPosts ─────────────────
var _VP_SCRIPT_STATUSES      = ['draft','approved'];
var _VP_STORYBOARD_STATUSES  = ['not_started','in_figma','approved'];
var _VP_AI_GEN_STATUSES      = ['not_started','generating','generated','failed'];
var _VP_EDIT_STATUSES        = ['not_started','in_review','approved'];
var _VP_THUMB_STATUSES       = ['not_started','in_figma','approved'];
var _VP_AI_TOOLS             = ['Runway','Pika','Sora','Kling','Luma','Other'];

function seedEC2026001VideoProduction() {
  try {
    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var spLast  = spSheet.getLastRow();
    if (spLast < 2) return { ok: false, error: 'SocialPosts empty' };
    var spRows  = spSheet.getRange(2, 1, spLast - 1, 16).getValues();

    var vpSheet = _getCCSheet(_CC_TAB.VIDEO_PRODUCTION);
    var headers = _CC_HDR.VideoProduction; // 20 columns

    // Always rewrite header to keep schema current
    vpSheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    vpSheet.setFrozenRows(1);

    var existing = {};
    var vpLast = vpSheet.getLastRow();
    if (vpLast >= 2) {
      vpSheet.getRange(2, 1, vpLast - 1, 1).getValues()
        .forEach(function(r) { if (r[0]) existing[String(r[0])] = true; });
    }

    var now     = new Date().toISOString().split('T')[0];
    var newRows = [];

    for (var i = 0; i < spRows.length; i++) {
      var row      = spRows[i];
      var platform = String(row[2]);
      if (String(row[1]) !== 'EC-2026-001') continue;
      if (platform !== 'TikTok' && platform !== 'YouTube') continue;
      var assetId = String(row[0]);
      if (existing[assetId]) continue;

      newRows.push([
        assetId,                                              // asset_id
        'EC-2026-001',                                        // campaign_id
        platform,                                             // platform
        platform === 'TikTok' ? 'short_form' : 'long_form',  // video_type
        platform === 'TikTok' ? '15-30s'     : '60s',        // duration_target
        String(row[3]  || ''),                                // hook
        'draft',                                              // script_status
        'not_started',                                        // storyboard_status
        '',                                                   // storyboard_url
        '',                                                   // ai_tool
        'not_started',                                        // ai_gen_status
        '',                                                   // video_url
        'not_started',                                        // edit_status
        'not_started',                                        // thumbnail_status
        String(row[15] || ''),                                // brief (design_brief)
        String(row[9]  || ''),                                // publish_date
        '',                                                   // published_url
        '',                                                   // notes
        now,                                                  // created_at
        now                                                   // updated_at
      ]);
    }

    if (newRows.length) {
      var writeStart = vpSheet.getLastRow() + 1;
      var rng = vpSheet.getRange(writeStart, 1, newRows.length, headers.length);
      rng.setNumberFormat('@').setValues(newRows);

      var mkRule = function(list) {
        return SpreadsheetApp.newDataValidation().requireValueInList(list, true).setAllowInvalid(false).build();
      };
      vpSheet.getRange(writeStart, headers.indexOf('script_status')     + 1, newRows.length, 1).setDataValidation(mkRule(_VP_SCRIPT_STATUSES));
      vpSheet.getRange(writeStart, headers.indexOf('storyboard_status') + 1, newRows.length, 1).setDataValidation(mkRule(_VP_STORYBOARD_STATUSES));
      vpSheet.getRange(writeStart, headers.indexOf('ai_tool')           + 1, newRows.length, 1).setDataValidation(mkRule(_VP_AI_TOOLS));
      vpSheet.getRange(writeStart, headers.indexOf('ai_gen_status')     + 1, newRows.length, 1).setDataValidation(mkRule(_VP_AI_GEN_STATUSES));
      vpSheet.getRange(writeStart, headers.indexOf('edit_status')       + 1, newRows.length, 1).setDataValidation(mkRule(_VP_EDIT_STATUSES));
      vpSheet.getRange(writeStart, headers.indexOf('thumbnail_status')  + 1, newRows.length, 1).setDataValidation(mkRule(_VP_THUMB_STATUSES));
    }

    Logger.log('[seedEC2026001VideoProduction] seeded:' + newRows.length + ' skipped:' + Object.keys(existing).length);
    return { ok: true, seeded: newRows.length, skipped: Object.keys(existing).length };

  } catch(e) {
    Logger.log('[seedEC2026001VideoProduction] ERROR: ' + e.message + '\n' + e.stack);
    return { ok: false, error: e.message };
  }
}

// Clears VideoProduction data rows and re-seeds from SocialPosts
function resetVideoProduction() {
  try {
    var vpSheet = _getCCSheet(_CC_TAB.VIDEO_PRODUCTION);
    var last    = vpSheet.getLastRow();
    if (last >= 2) vpSheet.getRange(2, 1, last - 1, _CC_HDR.VideoProduction.length).clearContent();
    return seedEC2026001VideoProduction();
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── VideoIdeaBank seed ────────────────────────────────────────────────────────
var _VIB_STATUSES = ['idea','approved','in_storyboard','in_production','published','archived'];

function seedVideoIdeaBank() {
  try {
    var sheet   = _getCCSheet(_CC_TAB.VIDEO_IDEA_BANK);
    var headers = _CC_HDR.VideoIdeaBank; // 32 cols
    var now     = new Date().toISOString().split('T')[0];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);

    var existing = {};
    var last = sheet.getLastRow();
    if (last >= 2) {
      sheet.getRange(2, 1, last - 1, 1).getValues()
        .forEach(function(r) { if (r[0]) existing[String(r[0])] = true; });
    }

    // col order: idea_id, campaign_id, title, feature, icp_target, pain_mapped,
    //            emotional_state, comedy_style, visual_metaphor, comedy_premise,
    //            sq_1-6, comedy_peak, hold_beat_note,
    //            arc_1-4, opening_hook, cta_line, audio_direction,
    //            platform, duration_target, status, video_asset_id, notes, created_at, updated_at

    var ideas = [

      // ── TikTok ──────────────────────────────────────────────────────────────

      ['VIB-TK-001','EC-2026-001','Peanut Butter Mountain',
       'Pantry Tracking','super_mom',
       'Buying duplicates because she has no pantry visibility — the $1,336 leak made visual and funny',
       'Self-inflicted chaos — she did everything right and it still went wrong',
       'Relatable absurdity — the situation escalates with zero effort',
       'Five peanut butter jars lined up in the pantry — the sixth in her hand',
       'She confidently buys what she is sure she is out of. The pantry has been keeping score.',
       'She walks in from the grocery store, bag in hand, big confident smile',
       'Opens pantry cabinet, reaches to place new peanut butter on the shelf',
       'SLOW PAN across five existing peanut butter jars — different sizes, different brands, different ages',
       'Her face. She is holding the sixth jar. One beat too long.',
       'easyChef Pro pantry screen — all five jars listed, quantities, expiry dates',
       '"Your pantry knew. You did not." — CTA card',
       'The slow pan across five jars while she holds the sixth and her expression processes',
       'Hold the pan one full second longer than feels comfortable — that is the laugh',
       'Confidence — she is doing the responsible thing, grocery shopping like an adult',
       'Discovery — the pantry has been tracking what she has not',
       'Recognition — every viewer has a version of this jar in their life',
       'Relief — the app would have caught this before she left the house',
       'When you KNOW you are out of peanut butter',
       'Your pantry has been lying to you. easyChef Pro. Free to try.',
       'Upbeat grocery store music builds — comedic tuba sting on the jar reveal — light resolution out',
       'TikTok','15-30s','approved','','',now,now],

      ['VIB-TK-002','EC-2026-001','Spoiled Food with Guests',
       'Expiry Alerts','super_mom',
       '6:30 PM wall made visual — guests arriving, the star ingredient is green and fuzzy',
       'Confidence collapses into crisis in real time — stakes are maximum because people are watching',
       'Slow-burn horror — every beat builds the anticipation before the terrible reveal',
       'Spoiled food held at arm length in front of a full open fridge while guests are 20 minutes away',
       'She was confident she had everything. She did not check. The fridge kept the secret.',
       'Doorbell rings. Text overlay: Guests arrive in 20 minutes. She smiles, heads to the fridge.',
       'Opens fridge — everything looks fine — she reaches for the main ingredient with full confidence',
       'Pulls it out. It is bad. Very bad. She holds it at arm length.',
       'She looks at the camera. Frozen. One full beat.',
       'easyChef Pro — expiry alert that should have fired three days ago — alternative dinner from what is fresh',
       'Dinner on the table. Different dish. Guests happy. She glances at camera knowing.',
       'The moment she holds the spoiled food and looks directly at camera — completely still',
       'She does not move for one full beat — the viewer is laughing at her and with her at the same time',
       'Confidence — she has this dinner handled, guests are going to love it',
       'Exposure — the fridge has been keeping a secret from her',
       'Crisis — 20 minutes, no plan, the primary ingredient is gone',
       'Recovery — the app builds a new dinner from what is actually safe',
       'When you are SURE you have everything for dinner',
       'easyChef Pro sends expiry alerts before this happens. Free to try.',
       'Building anticipation music — horror sting on the spoiled reveal — warm resolution as dinner lands',
       'TikTok','15-30s','approved','','',now,now],

      ['VIB-TK-003','EC-2026-001','Diet Robot',
       'AI Meal Planner — Nutrition Scoring','health_optimizer · fitness_mom',
       'She is disciplined and doing everything right but the same meal every night has made food feel like a punishment',
       'The comedy of perfect compliance — she is winning and losing simultaneously',
       'Deadpan repetition — the humor comes from watching someone become a machine through discipline',
       'The same plate on the same table three nights in a row — her expression draining across each day',
       'She earned this monotony through discipline. The app had forty-seven other options the entire time.',
       'Text: Monday. Same plate. She looks at it with genuine hope.',
       'Text: Tuesday. Same plate. Noticeably less hope.',
       'Text: Wednesday. Same plate. Dead eyes. Fork moves mechanically. She is not home anymore.',
       'She opens easyChef Pro AI meal planner. Scrolls. Forty-seven healthy recipes matching her macros.',
       'New dinner. Different. She looks at it before eating. Her face remembers what food is for.',
       'Text: Day 47 looked different. easyChef Pro AI meal planner. CTA card.',
       'Wednesday — dead eyes, robotic fork, she has left the building',
       'Hold the Wednesday scene one full beat past comfortable — the viewer needs to recognize themselves in it',
       'Hope — she has a plan, she is being disciplined, this is good',
       'Monotony — the plan is working but something important is being lost',
       'The machine — she has stopped tasting, she is only executing the protocol',
       'Discovery — there were forty-seven other compliant options the entire time',
       'POV: Day 47 of your diet',
       'Eat healthy. Not the same thing every night. easyChef Pro AI meal planner. Free.',
       'Groundhog Day loop music that repeats and repeats — brightens to something new when the app appears',
       'TikTok','15-30s','approved','','',now,now],

      ['VIB-TK-004','EC-2026-001','Shopping Without a List',
       'Grocery List + Meal Planning','budget_family · super_mom',
       'She goes in without a plan, fills the cart with total confidence, gets home, cannot make a single meal',
       'The comedy of confidence without a system — every decision felt right, none of them connect',
       'Inventory comedy — objects that do not know each other arranged like a crime scene',
       'Random cart of groceries spread across the kitchen counter — nothing makes a meal together',
       'She bought everything she wanted. She cannot feed anyone tonight.',
       'She walks into the grocery store. No list. Text: I will remember.',
       'Cart filling — she is decisive — random items land with full conviction',
       'At home, everything spread on the counter. She surveys the chaos.',
       'She holds up a jar of artichoke hearts. She has no memory of deciding to buy this.',
       'easyChef Pro — meal plan generates a grocery list before she goes — every item maps to something',
       'Cart at the store — every item has a purpose — she knows exactly what tonight is',
       'The artichoke hearts moment — she is holding them with no memory or explanation',
       'The artichoke hearts — hold it — she bought them with such certainty and now has no idea why',
       'Confidence — she has shopped for years, she does not need a list',
       'The chaos of good intentions without a system behind them',
       'Confrontation — the counter full of items that have never met each other',
       'The system — the app does the thinking before she leaves the house',
       'Shopping without a list be like',
       'easyChef Pro builds your grocery list from your meal plan. Nothing random. Free.',
       'Upbeat confident music going in — descending confusion notes at the counter — resolved and purposeful',
       'TikTok','15-30s','idea','','',now,now],

      ['VIB-TK-005','EC-2026-001','Full Fridge Empty Mind',
       '30-Minute Meals from What You Have','super_mom · professional',
       'Full fridge, opens it twice, closes it twice, orders DoorDash for $34',
       'Decision paralysis in a place of abundance — the comedy of having everything and still choosing nothing',
       'The closed fridge — she walks away from a full refrigerator to spend $34 on delivery',
       'Full fridge door closes — DoorDash notification — $34.99 total on screen',
       'The fridge was full. She ordered anyway. The app would have found three dinners in there.',
       'She opens the fridge. It is completely full.',
       'She stares into it. Nothing announces itself. She closes the door and walks away.',
       'She comes back. Opens it again. Same full fridge. Still nothing speaks to her.',
       'She orders DoorDash. Total on screen: $34.99. She holds the phone.',
       'easyChef Pro scans the fridge — three complete dinners appear — all under 30 minutes',
       'She is eating. From her fridge. The $34 moment plays in her memory.',
       'The DoorDash total: $34.99 — she looks at it for one beat with full awareness',
       'The number sits one beat longer — $34 when the full fridge was right there waiting',
       'Abundance — the fridge is completely full, this should be effortless',
       'Paralysis — too many unnamed options is the same as no options without a plan',
       'The exit — $34 later the immediate problem is solved but nothing changed',
       'The reveal — dinner was in there the whole time, it only needed the plan',
       'When your fridge is full and you are still opening DoorDash',
       'The fridge was full the whole time. easyChef Pro. Free to try.',
       'Hopeful open — slow tension builds through the staring — DoorDash notification sting — warm resolution',
       'TikTok','15-30s','idea','','',now,now],

      // ── YouTube ─────────────────────────────────────────────────────────────

      ['VIB-YT-001','EC-2026-001','The $1,336 Reveal',
       'Food Waste Tracking + Savings','budget_family · super_mom_money',
       'A year in review of everything wasted — the math lands at $1,336 and it is completely silent',
       'Quiet financial awakening — not comedy, the number is the entire performance',
       'Sobering documentary — the receipt pile grows, the number builds, silence does the work',
       'A year of grocery receipts on a kitchen counter — the pile is large and the math is quiet',
       'The average family does not know this number. Seeing it changes something.',
       'A year of grocery receipts arranged on the counter — the pile is real and large',
       'Slow walk through the fridge — items close to expiry, some already gone, waste made visible',
       'Calculator on screen — she adds up what got thrown away this month alone: $111',
       'Text on screen: That is $1,336 a year. For most families. Possibly more for yours.',
       'easyChef Pro — expiry alerts, pantry tracking, meal planning — the system that closes the loop',
       'One year later — receipts smaller, waste down 69.5 percent, the savings are banked not spent',
       'The calculator moment — $111 per month — she looks at it and says nothing — the silence lands',
       'Let the $1,336 number sit on screen in complete silence for two full seconds — do not fill it',
       'Normalcy — this is just how grocery shopping goes, everyone loses a little food',
       'Recognition — the number is real and larger than she expected',
       'The math — $111 a month is a utility bill, a car payment, two weeks of lunches',
       'The system — one app that pays for itself before the first month ends',
       'How much food does your family actually throw away every year?',
       'The average family loses $1,336 a year to food waste. easyChef Pro closes the loop. Free to start.',
       'Quiet documentary underscore — no comedy — let the $1,336 number do everything',
       'YouTube','60s','idea','','',now,now],

      ['VIB-YT-002','EC-2026-001','The 6:30 PM Wall — Full Story',
       '30-Minute Meals from What You Have','super_mom',
       'The complete arc — the wall she hits every night, the decision fatigue, the discovery, the exhale',
       'Emotional documentary — one evening in her life treated with the weight it actually carries',
       'The cinematic exhale — she sits at a table where dinner happened and the relief is physical',
       'She is sitting at the dinner table — kids eating — she sits down — the exhale — she is not running',
       'Every night she hits this wall. Tonight she did not. That is the whole story.',
       'She gets home from school pickup. Kids circle the kitchen. Clock reads 6:30.',
       'She stares into the fridge. Nothing organizes itself for her.',
       'She is calculating — does she have what she needs? She is not sure. The math is too much.',
       'She makes the call she did not want — cereal night — again — she carries the guilt quietly',
       'easyChef Pro — opens the app — it sees her fridge — a dinner plan appears — 28 minutes',
       'Dinner on the table. Kids eating. She sits down. She exhales. She is here.',
       'Her face when she sits and exhales — the full physical relief of not running anymore',
       'Hold the exhale — let it breathe — that is what the whole product is trying to give her',
       'The daily chaos — 6:30 hits the same way every night and she never has a plan ready for it',
       'Decision fatigue — too many variables, too little time, too much on the line',
       'The removal — the app takes the deciding away, she only executes',
       'Presence — dinner happened and she is at the table for it, not in her head',
       'Every night at 6:30 PM she hits the same wall',
       'easyChef Pro. Dinner decided before you open the fridge. Free to try.',
       'Ambient kitchen sounds only — no score until the resolution — then something warm and very quiet',
       'YouTube','60s','idea','','',now,now],

      ['VIB-YT-003','EC-2026-001','Recipe Scaling — Feeding the Team',
       'Recipe Scaling — Large Household','large_family',
       'She has fed six people for twenty years and every recipe still assumes she is cooking for four',
       'The comedy of a competent person asked to do unnecessary math while hungry kids circle',
       'The fraction problem — she is multiplying two-thirds of a cup times six and the kitchen is not patient',
       'A recipe on her phone that says Serves 4 — she has six people — the math begins visibly',
       'The recipe was not built for her life. It never is. The app rescales everything before she starts.',
       'She opens a recipe on her phone. Serves: 4. She has six people at this table.',
       'She starts doing the scaling math in her head — fractions of fractions — it gets complicated',
       'A kid asks what is for dinner. She looks at him like he just asked her to solve a proof.',
       'easyChef Pro — she enters six servings — every ingredient rescales — grocery list adjusts to match',
       'She sets the table for six. Everything is exactly right. The math did itself.',
       'Six plates. Right amounts. No math needed. easyChef Pro. CTA card.',
       'Her face when the kid asks what is for dinner while she is mid-fraction — pure relatable overwhelm',
       'Just hold her face — every parent in that situation recognizes that exact expression immediately',
       'The math — a simple recipe becomes a calculation problem when the household is not four people',
       'Overwhelm — the recipe is supposed to simplify dinner, not add arithmetic',
       'The system — let the app do the multiplication so she can just cook',
       'Dinner — six plates, correct amounts, no ingredient short, no guessing on leftovers',
       'Cooking for a family of six when every recipe still serves four',
       'easyChef Pro scales any recipe to your household size. Automatically. Free.',
       'Warm busy kitchen ambience throughout — slight comedic timing on the math moment — family dinner sounds at close',
       'YouTube','60s','idea','','',now,now]

    ];

    var newRows = [];
    ideas.forEach(function(idea) {
      if (!existing[idea[0]]) newRows.push(idea);
    });

    if (newRows.length) {
      var writeStart = sheet.getLastRow() + 1;
      var rng = sheet.getRange(writeStart, 1, newRows.length, headers.length);
      rng.setNumberFormat('@').setValues(newRows);
      var statusCol = headers.indexOf('status') + 1;
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(_VIB_STATUSES, true).setAllowInvalid(false).build();
      sheet.getRange(writeStart, statusCol, newRows.length, 1).setDataValidation(rule);
    }

    Logger.log('[seedVideoIdeaBank] seeded:' + newRows.length + ' skipped:' + Object.keys(existing).length);
    return { ok: true, seeded: newRows.length, skipped: Object.keys(existing).length, total: ideas.length };

  } catch(e) {
    Logger.log('[seedVideoIdeaBank] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── VIB-TK-006 refinement — Still Cooking for Six (habit memory reframe) ─────
function updateVibTk006() {
  try {
    var sheet = _getCCSheet(_CC_TAB.VIDEO_IDEA_BANK);
    var data  = sheet.getDataRange().getValues();
    var rowIdx = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === 'VIB-TK-006') { rowIdx = i + 1; break; }
    }
    if (rowIdx < 0) return { ok: false, error: 'VIB-TK-006 not found' };

    var now = new Date().toISOString().split('T')[0];
    // cols 1-based: title=3, feature=4, icp_target=5, pain_mapped=6,
    //   emotional_state=7, comedy_style=8, visual_metaphor=9, comedy_premise=10,
    //   sq_1..sq_6=11-16, comedy_peak=17, hold_beat_note=18,
    //   arc_1..arc_4=19-22, opening_hook=23, cta_line=24, audio_direction=25,
    //   updated_at=32
    var updates = [
      [3,  'Still Cooking for Six'],
      [4,  'Recipe Scaling — Meal Planning for One or Two'],
      [5,  'empty_nester'],
      [6,  'Her hands still cook for six because that is what they learned to do. The recipes never got the message.'],
      [7,  'Habit memory — deeply human — the emotional trigger is not recipe scaling, it is what her hands remember'],
      [8,  'Silent recognition — no jokes, no punchlines — just the truth of the moment landing in real time'],
      [9,  'Four plates set by force of habit — the family that is not coming — food that expires untouched'],
      [10, 'Muscle memory for a life that has moved on — her hands do not know the house is quiet now'],
      [11, 'Large family-sized dinner cooking. Big pot. Too much pasta. Too many plates. Warm nostalgic lighting.'],
      [12, 'She instinctively sets four plates, extra forks, the full table — then stops. Long pause.'],
      [13, 'She sits alone at the giant table. Silence. Massive amount of leftovers surrounding one place setting.'],
      [14, 'The fridge days later — the food has expired. She throws it away quietly.'],
      [15, 'easyChef Pro — recipes scaled for 1 or 2, smart leftovers, meal planning from what you already have.'],
      [16, 'A smaller, beautiful meal. Peaceful. Intentional. She is not sad anymore.'],
      [17, 'She sets the fourth plate automatically — then stops — the muscle memory caught mid-act in silence'],
      [18, 'Hold the pause after she stops — no music, no cut — let the room be empty for one full beat'],
      [19, 'Habit memory — her hands cook for six because that was her life and they do not know it changed'],
      [20, 'The recognition — she set a table for people who are not coming and the silence confirmed everything'],
      [21, 'The cost — food expires untouched because the portions never adapted to a new chapter'],
      [22, 'Evolution — the kitchen can catch up with her life — scaled, intentional, not defined by what was'],
      [23, 'Still Cooking for Six.'],
      [24, 'Your kitchen can evolve with your life. easyChef Pro.'],
      [25, 'No score in scenes 1-4 — silence does the work — warm resolved music enters only at the meal in scene 6'],
      [32, now]
    ];

    updates.forEach(function(u) {
      sheet.getRange(rowIdx, u[0]).setNumberFormat('@').setValue(u[1]);
    });

    Logger.log('[updateVibTk006] updated row ' + rowIdx);
    return { ok: true, updated: 'VIB-TK-006', row: rowIdx };
  } catch(e) {
    Logger.log('[updateVibTk006] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── VIB-TK-006 Scene 6 patch — alone → at peace ──────────────────────────────
function patchVibTk006Scene6() {
  try {
    var sheet = _getCCSheet(_CC_TAB.VIDEO_IDEA_BANK);
    var data  = sheet.getDataRange().getValues();
    var rowIdx = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === 'VIB-TK-006') { rowIdx = i + 1; break; }
    }
    if (rowIdx < 0) return { ok: false, error: 'VIB-TK-006 not found' };

    var now = new Date().toISOString().split('T')[0];
    var updates = [
      [16, 'One candle. One good plate. Fresh food. Calm light. The table is small on purpose — not because she has to, but because this is hers now.'],
      [22, 'At peace — not alone, not defined by the empty chairs — this is her table now and it was set with intention'],
      [32, now]
    ];
    updates.forEach(function(u) {
      sheet.getRange(rowIdx, u[0]).setNumberFormat('@').setValue(u[1]);
    });

    Logger.log('[patchVibTk006Scene6] patched row ' + rowIdx);
    return { ok: true, patched: 'VIB-TK-006', fields: ['sq_6','arc_4','updated_at'] };
  } catch(e) {
    Logger.log('[patchVibTk006Scene6] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── VideoIdeaBank Batch 2 — Empty Nester + Date Night Disaster ────────────────
function seedVideoIdeaBankBatch2() {
  try {
    var sheet   = _getCCSheet(_CC_TAB.VIDEO_IDEA_BANK);
    var headers = _CC_HDR.VideoIdeaBank; // 32 cols
    var last    = sheet.getLastRow();
    var existing = {};
    if (last >= 2) {
      sheet.getRange(2, 1, last - 1, 1).getValues()
        .forEach(function(r) { if (r[0]) existing[String(r[0])] = true; });
    }

    var now = new Date().toISOString().split('T')[0];

    var ideas = [

      // ── VIB-TK-006 — Empty Nester, Table for One ────────────────────────────
      ['VIB-TK-006','EC-2026-001','Cooking for Six, Eating Alone',
       'Recipe Scaling — Meal Planning','empty_nester',
       'She cooked for a family of six for decades. The recipes never updated. She still makes four pounds of pasta.',
       'Nostalgic comedy — the portion sizes belong to a family that moved out',
       'Physical comedy — the pot is enormous, the table is set for one',
       'A single place setting at the end of a long dining table — surrounded by enough food for six',
       'Muscle memory for feeding six when there is only one mouth left to feed',
       'She pulls a 12-quart pot from the cabinet. Force of habit. She does not question it.',
       'She fills the pot. She starts cooking. The kitchen smells the way it always did.',
       'Dish after dish comes out. A salad. A main. Two sides. Bread.',
       'She carries everything to the dining table. One chair is pulled out. The rest are tucked.',
       'She sits down at the head of the table — surrounded by enough food for six — and looks at it.',
       'easyChef Pro — meals for one that actually feel like enough — portion scaled, nothing wasted.',
       'The long shot — one person, one plate, seventeen servings of pasta, and a very quiet house',
       'Let her look at the spread — the beat between habit and reality — do not rush past it',
       'Memory — she has been cooking for six for twenty years and her hands still know how',
       'The reveal — the table is full, the house is empty, and nothing about this changed',
       'The recognition — this is muscle memory dressed as a routine she never updated',
       'The shift — one serving, her nutrition goals, her schedule — this time just for her',
       'She is cooking for one. The pot disagrees.',
       'Portions for one. Meals worth making. easyChef Pro. Free to try.',
       'Warm domestic ambience — faint echo of activity that no longer fills the house — gentle wistful resolution',
       'TikTok','15-30s','idea','','',now,now],

      // ── VIB-TK-007 — Date Night Disaster ────────────────────────────────────
      ['VIB-TK-007','EC-2026-001','Date Night Disaster',
       'AI Recipe Recommendations — Smart Meal Planning','professional · young_couple',
       'He wanted to impress her. He had no plan. She is looking at what is on the plate and trying to stay positive.',
       'Romantic ambition meeting cold reality — the comedy lives in the gap between intent and execution',
       'Dry situational comedy — the food is the problem but the commitment is completely sincere',
       'Candles lit, table set perfectly, a plate that does not match the occasion at all',
       'Every element of the date night was prepared except the one that matters — the food',
       'He sets the scene: candles, good plates, a playlist. He checks himself in the mirror. He is ready.',
       'In the kitchen — he opens the fridge — the confidence slightly softens — he improvises.',
       'Something is served. The camera shows the plate. It is unclear what it is. The candles are still lit.',
       'She sits across from him. She looks at the plate. She takes a bite. Her face stays neutral. She is trying.',
       'He watches her. He knows. He looks at his own plate. He also knows.',
       'easyChef Pro — recipes that match the occasion and what is already in the fridge — date night, nailed.',
       'Her face — she is a completely supportive person and the food asked too much of her',
       'Hold on his face watching her — he can read the room — this is the beat — let it breathe',
       'Ambition — the intention was perfect, the effort was real, the vision was clear',
       'The gap — execution met a pantry with no plan and produced something unrecognizable',
       'Mutual awareness — they both know and neither is saying it and that is the whole joke',
       'The fix — right recipe for what you have and who you are cooking for',
       'He planned the perfect date night. The fridge had other ideas.',
       'Right recipe. Right night. easyChef Pro. Free to try.',
       'Romantic strings for the setup — a single descending note when the plate arrives — warm forgiving resolution',
       'TikTok','15-30s','idea','','',now,now]

    ];

    var newRows = [];
    ideas.forEach(function(row) {
      if (!existing[row[0]]) newRows.push(row);
    });

    if (newRows.length) {
      var writeStart = sheet.getLastRow() + 1;
      sheet.getRange(writeStart, 1, newRows.length, headers.length).setNumberFormat('@').setValues(newRows);
      var statusCol = headers.indexOf('status') + 1;
      if (statusCol > 0) {
        var rule = SpreadsheetApp.newDataValidation()
          .requireValueInList(_VIB_STATUSES, true).setAllowInvalid(false).build();
        sheet.getRange(writeStart, statusCol, newRows.length, 1).setDataValidation(rule);
      }
    }

    Logger.log('[seedVideoIdeaBankBatch2] seeded:' + newRows.length + ' skipped:' + (ideas.length - newRows.length));
    return { ok: true, seeded: newRows.length, skipped: ideas.length - newRows.length, total: ideas.length };

  } catch(e) {
    Logger.log('[seedVideoIdeaBankBatch2] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── ICP Landing Pages — one emotional-arc-governed LP per ICP ────────────────
function seedIcpLandingPages() {
  try {
    var sheet   = _getCCSheet(_CC_TAB.LP_INVENTORY);
    var headers = _CC_HDR.LPInventory; // 35 cols
    var last    = sheet.getLastRow();
    var existing = {};
    if (last >= 2) {
      sheet.getRange(2, 1, last - 1, 1).getValues()
        .forEach(function(r) { if (r[0]) existing[String(r[0])] = true; });
    }

    var now   = new Date().toISOString().split('T')[0];
    var proof = '$1,336/year saved|69.5% less food waste|30 min fridge to table';
    var cta   = 'The app that evolves with your life.';
    var urg   = 'First 5,000 families only. $7.99/month locked forever.';
    var excl  = 'Founding member pricing — locked for life.';
    var ty    = 'https://easychefpro.com/thank-you';

    var lps = [
      { code:'super_mom',         headline:'It is 6:30 PM and you are out of ideas again.',
        angle:'Exhaustion and decision fatigue at the dinner wall every single night',
        title:'Dinner Solved for Busy Moms | easyChef Pro',
        kw:'meal planning for busy moms' },
      { code:'budget_family',     headline:'You budget everything. The grocery bill still wins.',
        angle:'The receipt total that keeps coming in over — money stress built into dinner every week',
        title:'Stop Wasting $1,336 a Year on Food | easyChef Pro',
        kw:'save money on groceries family' },
      { code:'meal_prep_athlete', headline:'Three hours on Sunday. Still not enough.',
        angle:'Prep day that costs the whole weekend and still falls short by Wednesday',
        title:'Smarter Meal Prep for Athletes | easyChef Pro',
        kw:'meal prep app for athletes' },
      { code:'empty_nester',      headline:'Your hands still cook for six.',
        angle:'Habit memory — the kitchen is still running a household that moved out',
        title:'Cooking for One or Two | easyChef Pro',
        kw:'meal planning for empty nesters' },
      { code:'large_family',      headline:'Six people. Three meals a day. No system that holds.',
        angle:'Scale without a system — the daily math of feeding a large family without control',
        title:'Meal Planning for Large Families | easyChef Pro',
        kw:'meal planning large family' },
      { code:'professional',      headline:'Faster than delivery. Better than guessing.',
        angle:'No time to plan, no margin for waste — dinner has to be faster than the alternative',
        title:'Quick Healthy Meals for Busy Professionals | easyChef Pro',
        kw:'quick healthy meal planning app' },
      { code:'newlywed',          headline:'Your first kitchen. Neither of you had a plan.',
        angle:'First household together — the excitement is real, the system is missing',
        title:'Meal Planning for Newlyweds | easyChef Pro',
        kw:'meal planning for newlyweds couples' },
      { code:'single_parent',     headline:'No margin. No backup. Dinner still has to happen.',
        angle:'Running on empty with no one to take over — dinner is one more thing that cannot fail',
        title:'Dinner Solutions for Single Parents | easyChef Pro',
        kw:'meal planning single parent' },
      { code:'health_conscious',  headline:'You know what to eat. The system to actually do it is missing.',
        angle:'Intention without infrastructure — they know the goal, the daily execution keeps breaking',
        title:'Healthy Eating Made Easy | easyChef Pro',
        kw:'healthy meal planning app' },
      { code:'college_student',   headline:'Your budget is real. Your cooking skills are not yet.',
        angle:'Limited money, zero cooking foundation, and ramen is not a strategy',
        title:'Affordable Meal Planning for College Students | easyChef Pro',
        kw:'meal planning app college students' },
      { code:'retiree',           headline:'More time now. The kitchen should finally work for you.',
        angle:'Life slowed down but the kitchen did not adapt — more time does not mean easier meals',
        title:'Simple Meal Planning for Retirees | easyChef Pro',
        kw:'meal planning for retirees seniors' },
      { code:'foodie_home_cook',  headline:'You can imagine it. Pulling it off on a Tuesday is the problem.',
        angle:'The gap between the food she loves to cook and the weeknight version she can actually execute',
        title:'Smart Meal Planning for Home Cooks | easyChef Pro',
        kw:'meal planning home cook recipes' },
      { code:'diabetic_manager',  headline:'Every meal is a calculation. It should not have to be.',
        angle:'The exhaustion of managing glucose, carbs, and timing alone at every single meal',
        title:'Diabetic-Friendly Meal Planning | easyChef Pro',
        kw:'meal planning app diabetes management' },
      { code:'allergy_parent',    headline:'One wrong ingredient changes the whole night.',
        angle:'Every meal is a safety check — the anxiety of the thing she cannot let slip',
        title:'Allergy-Safe Meal Planning for Families | easyChef Pro',
        kw:'allergy friendly meal planning app' },
      { code:'fitness_beginner',  headline:'The nutrition math is killing your momentum.',
        angle:'Starting over — the workout is working but the food side is too complicated to sustain',
        title:'Nutrition and Meal Planning for Fitness Beginners | easyChef Pro',
        kw:'meal planning fitness beginners nutrition' },
      { code:'busy_parent',       headline:'Two jobs. Three kids. No dinner plan. 5:45 PM.',
        angle:'Both working, everyone hungry, no one had time to plan — the 5:45 PM collision every night',
        title:'Quick Dinner Planning for Working Parents | easyChef Pro',
        kw:'dinner planning busy working parents' },
      { code:'senior_living',     headline:'The portions were never designed for just the two of you.',
        angle:'Cooking for two after a lifetime of cooking for many — the scale is wrong and the appetite changed',
        title:'Meal Planning for Seniors | easyChef Pro',
        kw:'meal planning seniors two people' },
      { code:'eco_conscious',     headline:'You care about waste. The kitchen keeps proving otherwise.',
        angle:'Living the values at the store then watching it spoil at home — intention without a system',
        title:'Zero Waste Meal Planning | easyChef Pro',
        kw:'zero waste meal planning reduce food waste' },
      { code:'small_household',   headline:'Nothing portions right. Everything spoils.',
        angle:'One or two people in a system built for four — waste is built into every recipe',
        title:'Meal Planning for One or Two People | easyChef Pro',
        kw:'meal planning small household one two people' },
      { code:'veggie_curious',    headline:'You want to eat more plants. You need a reason to keep going.',
        angle:'Wanting to shift but not knowing how to make it satisfying enough to stick',
        title:'Plant-Based Meal Planning Made Easy | easyChef Pro',
        kw:'plant based meal planning app' },
      { code:'cultural_cook',     headline:'You cook from memory. The weeknights need a system.',
        angle:'Deep cooking knowledge with no infrastructure to translate it to weeknight reality',
        title:'Culturally Inclusive Meal Planning | easyChef Pro',
        kw:'cultural recipe meal planning app' },
      { code:'weight_loss_focus', headline:'You know the diet. Meal execution is where it falls apart.',
        angle:'The plan is clear but the daily meals keep breaking it — execution not willpower',
        title:'Meal Planning for Weight Loss | easyChef Pro',
        kw:'meal planning app weight loss' }
    ];

    var newRows = [];
    lps.forEach(function(lp) {
      var id   = 'lp-icp-' + lp.code;
      if (existing[id]) return;
      var slug = 'lp/' + lp.code.replace(/_/g, '-');
      var url  = 'https://easychefpro.com/' + slug;
      var desc = 'Your life changes. Your kitchen should change with it. easyChef Pro — the app that evolves with your life. Free to try.';
      newRows.push([
        id, slug, url,
        'Waitlist', 'bp-001', lp.code,
        lp.angle,
        'icp_' + lp.code,
        lp.headline,
        cta, proof,
        'draft', false, false, false, false,
        'EC-2026-001', 0, '',
        now, now,
        'Emotional progression LP — governed by EMOTIONAL_ARC_' + lp.code.toUpperCase(),
        'founding_member', urg, 'hero',
        'founding_member', excl,
        lp.title, desc, lp.title, desc,
        url, lp.kw,
        'waitlist_lp', ty
      ]);
    });

    if (newRows.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length)
        .setNumberFormat('@').setValues(newRows);
    }

    Logger.log('[seedIcpLandingPages] added:' + newRows.length + ' skipped:' + (lps.length - newRows.length));
    return { ok: true, added: newRows.length, skipped: lps.length - newRows.length, total: lps.length };
  } catch(e) {
    Logger.log('[seedIcpLandingPages] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── LP Framework seed — 7-section structure + 5-stage loop ───────────────────
function seedLpFramework001() {
  try {
    var sheet = _getCCSheet(_CC_TAB.CAMP_STRATEGY);
    var last  = sheet.getLastRow();
    var existing = {};
    if (last >= 2) {
      sheet.getRange(2, 1, last - 1, 1).getValues()
        .forEach(function(r) { if (r[0]) existing[String(r[0])] = true; });
    }
    if (existing['LP_FRAMEWORK_001']) {
      Logger.log('[seedLpFramework001] already exists — skipped');
      return { ok: true, added: 0, skipped: 1 };
    }

    var value = {
      framework_name: 'ICP Emotional Progression LP',
      description: 'Fixed 7-section structure. Brand position and 5-stage loop stay locked. Only ICP-specific content changes.',
      locked_elements: [
        'brand position and tagline',
        'approved claims and stats',
        '5-stage product loop (TRACK → PLAN → OPTIMIZE → COOK → SHOP)',
        'phone reveal rule',
        'proof bar content',
        'CTA button style and color',
        'UTM and deep link structure',
        'section order'
      ],
      variable_by_icp: [
        'entry moment and headline',
        'emotional arc and primary trigger',
        'visual scene and setting',
        'loss aversion framing',
        'value promise language',
        'CTA framing',
        'story examples and social proof quotes'
      ],
      sections: [
        {
          id: 'hook',
          label: 'Section 1 — Hook',
          purpose: 'Mirror the ICP life-stage moment exactly. Zero product mention. Pure recognition.',
          instruction: 'Open with the exact emotional trigger from EMOTIONAL_ARC_{ICP_CODE} stage:hook. One or two lines maximum. The reader must feel seen before they read anything else.'
        },
        {
          id: 'problem',
          label: 'Section 2 — Problem',
          purpose: 'Name what is broken in their kitchen at this life stage.',
          instruction: 'Describe the specific dysfunction that belongs to this life stage. Not a generic complaint — the exact friction this ICP lives with daily.'
        },
        {
          id: 'agitate',
          label: 'Section 3 — Agitate',
          purpose: 'Make the cost visible — emotionally and practically.',
          instruction: 'Use loss aversion. What does this problem actually cost — money, time, identity, energy? Reference the $1,336/year stat or the emotional toll as appropriate for this ICP.'
        },
        {
          id: 'solve',
          label: 'Section 4 — Solve',
          purpose: 'easyChef Pro closes the loop — expressed through the 5-stage loop adapted to this ICP.',
          instruction: 'Show all five stages adapted to this life situation: TRACK what you have → PLAN for [ICP stage] → OPTIMIZE for [ICP goals] → COOK with [ICP context] → SHOP with one real list. Each stage is one line. The loop is the product. This section is non-negotiable in structure.',
          loop: ['TRACK', 'PLAN', 'OPTIMIZE', 'COOK', 'SHOP']
        },
        {
          id: 'value',
          label: 'Section 5 — Value',
          purpose: 'What life looks like after. Stage-specific vision of resolution.',
          instruction: 'Paint the after state for this ICP. Not feature benefits — the emotional experience of a kitchen that finally works for this chapter of their life. Connects to EMOTIONAL_ARC stage:value.'
        },
        {
          id: 'proof',
          label: 'Section 6 — Proof',
          purpose: 'Shared product truth — same across all ICP LPs.',
          instruction: 'Use approved stats: $1,336/year saved, 69.5% less food waste, 30 min fridge to table. Pull one quote from social proof that fits this ICP. Proof bar is locked — do not invent new stats.'
        },
        {
          id: 'cta',
          label: 'Section 7 — CTA',
          purpose: 'Stage-specific action framed by the brand tagline.',
          instruction: 'CTA button: [Start Free — It Adapts to You]. Below it: "The app that evolves with your life." Urgency line: "First 5,000 families only. $7.99/month locked forever." CTA framing can use ICP-specific language above the button but the button text and tagline are locked.'
        }
      ]
    };

    var row = ['LP_FRAMEWORK_001', 'lp_structure', true, JSON.stringify(value)];
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setNumberFormat('@').setValues([row]);
    Logger.log('[seedLpFramework001] added LP_FRAMEWORK_001');
    return { ok: true, added: 1, skipped: 0 };
  } catch(e) {
    Logger.log('[seedLpFramework001] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Brand position seed — master governing frame above all ICP arcs ───────────
function seedBrandPosition001() {
  try {
    var sheet = _getCCSheet(_CC_TAB.CAMP_STRATEGY);
    var last  = sheet.getLastRow();
    var existing = {};
    if (last >= 2) {
      sheet.getRange(2, 1, last - 1, 1).getValues()
        .forEach(function(r) { if (r[0]) existing[String(r[0])] = true; });
    }

    if (existing['BRAND_POSITION_001']) {
      Logger.log('[seedBrandPosition001] already exists — skipped');
      return { ok: true, added: 0, skipped: 1 };
    }

    var value = {
      tagline:     'The app that evolves with your life.',
      brand_truth: 'Your life changes. Your kitchen should change with it.',
      position:    'adaptive household infrastructure — not recipe software',
      contrast:    'Most food apps assume one static person forever. easyChef Pro does not.',
      life_stage_sequence: [
        'newlywed','young_family','super_mom','single_parent',
        'busy_professional','fitness_phase','empty_nester','grandparent'
      ],
      copy_rules: [
        '✓ Lead with life stage, not feature — the feature serves the stage, not the reverse',
        '✓ ICP-specific emotion leads every piece — the tagline resolves it',
        '✓ Brand truth is the emotional bridge — use it when copy needs the why behind the tagline',
        '✗ Never position as recipe software — easyChef Pro is infrastructure that follows your life'
      ]
    };

    var row = ['BRAND_POSITION_001', 'brand_positioning', true, JSON.stringify(value)];
    sheet.getRange(sheet.getLastRow() + 1, 1, 1, row.length).setNumberFormat('@').setValues([row]);

    Logger.log('[seedBrandPosition001] added BRAND_POSITION_001');
    return { ok: true, added: 1, skipped: 0 };
  } catch(e) {
    Logger.log('[seedBrandPosition001] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── ICP Emotional Arc strategy seed — one governed arc per ICP ────────────────
function seedEC2026001CampaignStrategies() {
  try {
    var sheet = _getCCSheet(_CC_TAB.CAMP_STRATEGY);
    var last  = sheet.getLastRow();
    var existing = {};
    if (last >= 2) {
      sheet.getRange(2, 1, last - 1, 1).getValues()
        .forEach(function(r) { if (r[0]) existing[String(r[0])] = true; });
    }

    var arc = function(icp_code, icp_name, primary_trigger, stages) {
      return ['EMOTIONAL_ARC_' + icp_code.toUpperCase(), 'emotional_progression', true,
        JSON.stringify({ icp_code: icp_code, icp_name: icp_name, primary_trigger: primary_trigger, stages: stages })];
    };
    var s = function(stage, emotion, trigger_note) {
      return { stage: stage, emotion: emotion, trigger_note: trigger_note };
    };

    var strategies = [

      arc('super_mom', 'Super Mom', '6:30 PM wall — exhaustion and decision fatigue every single night', [
        s('hook',    'exhausted',  '6:30 PM staring into a full fridge with hungry kids circling'),
        s('problem', 'frustrated', 'Reactive grocery runs, food goes to waste, no plan ever works'),
        s('agitate', 'activated',  'This happens EVERY night — the guilt of serving cereal sits on her'),
        s('solve',   'curious',    'What if dinner was decided before she opened the fridge?'),
        s('value',   'relieved',   '30 minutes, real food, from what she already has'),
        s('proof',   'trusting',   '10,000 families, $1,336/year savings validated'),
        s('cta',     'happy',      'Founding family — she found this at exactly the right time')
      ]),

      arc('super_mom_money', 'Super Mom — Money Angle', 'The invisible $111/month leak — financial loss aversion drives action', [
        s('hook',    'stressed',    'Grocery receipt in hand — she knows she spent too much again'),
        s('problem', 'frustrated',  '$111/month in groceries that expire before they become dinner'),
        s('agitate', 'alarmed',     '$1,336/year — she calculated it — that is a real number for her family'),
        s('solve',   'curious',     '$7.99/month to stop a $111/month leak — the math is immediate'),
        s('value',   'calculating', 'The ROI lands in one line — she sees it before she feels it'),
        s('proof',   'confident',   '10,000 households validated — this is not a promise, it is a result'),
        s('cta',     'determined',  'She is making the financially responsible call — this is who she is')
      ]),

      arc('super_mom_time', 'Super Mom — Time + Founding Family', 'Mental load never stops — dinner is the one decision she cannot escape', [
        s('hook',    'overwhelmed', 'The mental load of household food decisions runs every hour of every day'),
        s('problem', 'exhausted',   '5-10 hours a week deciding what to eat — none of it connected'),
        s('agitate', 'resentful',   'Her evenings belong to decision fatigue, not her family'),
        s('solve',   'intrigued',   'Dinner decided before she opens the fridge — what does that even feel like?'),
        s('value',   'relieved',    'The mental load lifts — she is present instead of planning'),
        s('proof',   'belonging',   'Founding families found this first — she is one of them'),
        s('cta',     'proud',       'She found this early — founding family identity is hers')
      ]),

      arc('budget_family', 'Budget Family', 'Every grocery trip is a math problem — every wasted item is a bill not paid', [
        s('hook',    'stressed',   '$400/month grocery budget and it still feels impossible'),
        s('problem', 'ashamed',    'Buys on sale without a plan — fridge full, dinner still costs $30 in delivery'),
        s('agitate', 'anxious',    'Every expired item is a bill her family needed — the guilt is financial'),
        s('solve',   'skeptical',  'She has heard promises before — but the math here is undeniable'),
        s('value',   'calculating','$111/month back — that is two utility bills — that is real for this budget'),
        s('proof',   'relieved',   '800,000 Walmart products — finally an app that knows her actual store'),
        s('cta',     'hopeful',    'Free to start — no risk — she has nothing to lose and $111 to gain')
      ]),

      arc('health_optimizer', 'Health Optimizer', 'No tool connects pantry to meal plan to nutrition score — she has tried everything', [
        s('hook',    'frustrated', 'Reads every label, tracks everything manually — the data exists but nothing connects it'),
        s('problem', 'overwhelmed','Five apps open at once — nutrition, pantry, recipes, grocery — none talk to each other'),
        s('agitate', 'defeated',   'Hours of manual tracking every week for a system that still fails her'),
        s('solve',   'intrigued',  '6-dimension nutrition scoring from what is already in her fridge?'),
        s('value',   'excited',    'FDA-grade data, registered dietitians — this is the tool she has been building herself'),
        s('proof',   'confident',  '10,000 recipe pages validated — the data depth is real'),
        s('cta',     'committed',  'She found the tool that finally closes the loop she has been trying to close for years')
      ]),

      arc('professional', 'Working Professional', '$400/month on delivery — he knows it is irrational and cannot stop it', [
        s('hook',    'guilty',      '$400/month on delivery — he knows the fridge is full — he orders anyway'),
        s('problem', 'paralyzed',   '8 PM, exhausted, fridge full, no plan — the calculation always ends in DoorDash'),
        s('agitate', 'wasteful',    'Groceries expire while he orders delivery on top of them — he sees it happening'),
        s('solve',   'curious',     '30 minutes fridge to table — no recipe hunting, the app does the thinking'),
        s('value',   'capable',     'He can actually cook — he just needed someone to remove the deciding'),
        s('proof',   'confident',   'Real outcomes — $400/month recovered — the habit is actually breakable'),
        s('cta',     'liberated',   'The DoorDash habit ends tonight — free to try, no risk')
      ]),

      arc('alpha_recruit', 'Alpha Recruit', 'She was chosen — personal invite from founder — DL-DIR format only', [
        s('hook',    'anticipating','She is on the waitlist — she signed up — she is ready — the app is not live yet'),
        s('problem', 'impatient',   'The 6:30 PM wall keeps hitting while she waits for something she already joined'),
        s('agitate', 'urgent',      'Founding price ends at 5,000 families — she needs to confirm her place'),
        s('solve',   'chosen',      'Personal invite from the founder — she was specifically selected'),
        s('value',   'insider',     'She shapes the app before it reaches the public — her feedback matters'),
        s('proof',   'committed',   '$7.99 locked forever — the founding price is guaranteed for life'),
        s('cta',     'proud',       'Founding family identity is locked — she was first and she will always know it')
      ]),

      arc('single_parent', 'Single Parent', 'One person doing the job of two — zero margin for error or waste', [
        s('hook',    'alone',      'No partner to share the food load — every decision is hers alone'),
        s('problem', 'overwhelmed','One person, three kids, dinner at 6 PM after work and school pickup'),
        s('agitate', 'exhausted',  'The mental and physical load of being sole provider of all meals with no backup'),
        s('solve',   'supported',  'Finally something that carries part of the load she has been carrying alone'),
        s('value',   'capable',    'Plan the whole week in minutes — every grocery item gets used'),
        s('proof',   'trusting',   '$1,336 back in a budget that needs every single dollar'),
        s('cta',     'relieved',   'She should not have to do this alone — now she does not have to')
      ]),

      arc('empty_nester', 'Empty Nester', 'Cooking habits built for a full house — suddenly cooking for one or two', [
        s('hook',    'confused',   'The kids left — the muscle memory stayed — she still buys for six'),
        s('problem', 'wasteful',   'Half of every purchase goes to waste — recipes written for 4-6 every time'),
        s('agitate', 'frustrated', 'She knows how to cook — she just does not know how to cook for this version of her life'),
        s('solve',   'curious',    'Scales every recipe automatically — meal plans for 1-2 — grocery list matches exactly'),
        s('value',   'liberated',  'Food is for her now — nutrition for herself — recipes she actually wants to eat'),
        s('proof',   'confident',  'Recipe scaling works perfectly — the math does itself'),
        s('cta',     'renewed',    'The kitchen adapts to her life as it is now — not as it was')
      ]),

      arc('newlywed', 'Newlywed Couple', 'Cooking is a shared project — but two preferences and no system creates friction', [
        s('hook',    'excited',      'Building a home together — cooking should be part of that — it keeps not being'),
        s('problem', 'friction',     'Two different food preferences, no shared system, groceries bought independently'),
        s('agitate', 'silly_guilt',  'They know it is fixable — $400/month on delivery before they even start a family'),
        s('solve',   'curious',      'One shared pantry, one shared meal plan, both preferences accounted for?'),
        s('value',   'together',     'Dinner without the nightly negotiation — cooking becomes the shared project it was meant to be'),
        s('proof',   'smart',        'Stopping the delivery habit now — before it grows with the family'),
        s('cta',     'invested',     'Building good habits from the start — this is who they want to be together')
      ]),

      arc('busy_dad', 'Busy Dad', 'He knows she carries the food load — he wants to step up but has no system', [
        s('hook',    'wanting_to_help','He knows his partner carries the entire food operation — he wants to change that'),
        s('problem', 'helpless',       'Opens the fridge, no plan, sees ingredients with no connection — defaults to pizza'),
        s('agitate', 'guilty',         'Every pizza order is another night she does the whole load herself'),
        s('solve',   'capable',        'The app tells him exactly what to do — open fridge, get recipe, execute'),
        s('value',   'hero',           'Dinner is done before she gets home — she walks in and it is handled'),
        s('proof',   'simple',         'Step by step, 30 minutes, real food — he actually did it'),
        s('cta',     'proud',          'He stepped up — she noticed — that is worth more than the app')
      ]),

      arc('large_family', 'Large Family', 'Feeding 6 every night on a real budget — waste hits double, every unplanned dinner is $60', [
        s('hook',    'stretched',  'Feeding six people every night is a full-time job on top of her full-time job'),
        s('problem', 'overwhelmed','Bulk buying does not match meal plans — the waste is enormous at scale'),
        s('agitate', 'alarmed',    'At 6 people $1,336 in waste becomes $2,000+ — every unplanned dinner is $60 in delivery'),
        s('solve',   'curious',    'Meal plan scaled for exactly 6 — grocery list sized correctly every single week?'),
        s('value',   'efficient',  'Every item in the cart maps to a meal — nothing bought without a purpose'),
        s('proof',   'relieved',   'The math finally works at scale — six plates, right amounts, no guessing'),
        s('cta',     'confident',  'She has a system that was actually built for a family her size')
      ]),

      arc('walmart_shopper', 'Walmart Shopper Alpha', 'No app has ever understood what is actually in a Walmart shopper\'s fridge', [
        s('hook',    'skeptical',         'She has deleted every recipe app that suggested ingredients she cannot find at Walmart'),
        s('problem', 'rejected',          'Suggestions for Whole Foods brands, specialty stores — her actual store does not exist to these apps'),
        s('agitate', 'loyal_frustrated',  'She is not changing her store — the app needs to be built for her life, not someone else\'s'),
        s('solve',   'surprised',         '800,000 Walmart products in the database — her exact brands, her exact store'),
        s('value',   'belonging',         'The app finally knows her fridge because it knows her store'),
        s('proof',   'confident',         'Shopping list goes directly to Walmart cart — seamless from plan to purchase'),
        s('cta',     'committed',         'This is the first app ever built for the way she actually shops')
      ]),

      arc('fitness_mom', 'Fitness Mom', 'Food is health — tracking macros for a family requires hours she cannot sustain', [
        s('hook',    'driven',     'Food is health — she reads every label, tracks every macro — it matters to her'),
        s('problem', 'frustrated', 'Healthy cooking for a family requires hours of planning she cannot keep up every week'),
        s('agitate', 'defeated',   'Kids do not eat the healthy food — expensive ingredients expire — the plan keeps breaking'),
        s('solve',   'intrigued',  '6-dimension nutrition scoring on every meal, from what is already in her fridge?'),
        s('value',   'empowered',  'Healthy dinner in 30 minutes, macros calculated automatically, ingredients she has'),
        s('proof',   'trusting',   'Registered dietitians validated every recipe — FDA-grade data — she can trust the numbers'),
        s('cta',     'committed',  'This is the tool that makes her health goals work for the whole family, not just her')
      ]),

      arc('millennial_couple', 'Millennial Couple', 'Great income, great kitchen, terrible food habits — and they know it', [
        s('hook',    'self_aware',  '$500/month on delivery — they know it is irrational — they do it anyway'),
        s('problem', 'irrational', 'Groceries sit unused — they order DoorDash on top of a full fridge — the pattern is locked'),
        s('agitate', 'wasteful',   '$6,000/year on habits they want to break — they have talked about it and nothing changes'),
        s('solve',   'intrigued',  'Turns groceries already bought into restaurant-quality dinner in 30 minutes?'),
        s('value',   'capable',    'They can cook — the kitchen is there — they just needed someone to remove the friction'),
        s('proof',   'confident',  'Real savings, real meals — the delivery habit is actually breakable'),
        s('cta',     'liberated',  'The $6,000/year habit ends here — free to try, no commitment required')
      ]),

      arc('meal_prep_enthusiast', 'Meal Prep Enthusiast', 'Sunday prep ritual undermined by waste and poor ingredient planning every week', [
        s('hook',    'proud',       'Sunday prep is a ritual — 3 hours, disciplined, she has a system'),
        s('problem', 'disappointed','30% goes to waste by Wednesday — the ritual keeps failing at mid-week'),
        s('agitate', 'frustrated',  '3 hours of Sunday work undone by Thursday — the discipline is there, the system is broken'),
        s('solve',   'curious',     'Meal plan built from the pantry — nothing expires mid-week because everything has a place?'),
        s('value',   'efficient',   'Zero waste week — the Sunday prep holds all the way to Sunday again'),
        s('proof',   'confident',   '69.5% waste reduction — the Sunday ritual finally works the way it was always supposed to'),
        s('cta',     'committed',   'She will never waste a prep week again — the system is finally complete')
      ]),

      arc('food_waste_fighter', 'Food Waste Fighter', 'Waste is moral for her — financial AND environmental — and every solution has failed', [
        s('hook',    'principled', 'Every expired item is both a financial failure and an environmental one — she carries both'),
        s('problem', 'guilty',     'Despite best intentions she throws away $1,336/year — she knows the number exactly'),
        s('agitate', 'failing',    'She has tried everything — composting, meal planning, discipline — the waste keeps happening'),
        s('solve',   'hopeful',    'Expiry alerts before food goes bad — 69.5% waste reduction — the loop finally closes'),
        s('value',   'aligned',    'She lives her values now — the pantry is tracked, nothing expires without a plan'),
        s('proof',   'trusting',   'Real data, validated reduction — this is not a promise, it is a measured result'),
        s('cta',     'committed',  'This is how she actually fixes what she has been trying to fix for years')
      ]),

      arc('date_night_planner', 'Date Night Planner', 'Wants to cook for the person they love — keeps panicking and ordering delivery instead', [
        s('hook',    'romantic',     'Cooking at home for someone you love is more intimate than any restaurant'),
        s('problem', 'failing',      'Great intentions, opens the fridge at 7 PM, no plan, panics — DoorDash again'),
        s('agitate', 'disappointed', 'Every failed date night at home is a restaurant bill anyway plus the feeling of failing'),
        s('solve',   'intrigued',    'Date Night theme — what is in the fridge becomes a real restaurant-quality meal in 45 minutes?'),
        s('value',   'capable',      'They cook together — 45 minutes, better than a reservation, more meaningful than delivery'),
        s('proof',   'confident',    'Step-by-step, real ingredients, real meal — the intention finally becomes the outcome'),
        s('cta',     'invested',     'They cook together — that is the whole point — and now they actually will')
      ]),

      arc('grandparent_cook', 'Grandparent Cook', 'Cooking for grandchildren is love language — mixed ages, preferences, and expiry gaps between visits', [
        s('hook',    'loving',      'Cooking for grandchildren is how she shows love — it matters more than anything in that kitchen'),
        s('problem', 'guessing',    'Different ages, different preferences — constant guesswork and waste between visits'),
        s('agitate', 'heartbroken', 'Every visit with a failed dinner is a memory she cannot get back'),
        s('solve',   'curious',     'Recipes built for mixed ages, pantry tracking so nothing expires between visits, simple step-by-step?'),
        s('value',   'confident',   'She cooks with certainty — the right amounts, the right ingredients, the grandchildren actually eat it'),
        s('proof',   'trusting',    'Simple, real food — the system does not require technology skills, it just works'),
        s('cta',     'grateful',    'Every visit she cooks with confidence — they feel the love because the food is right')
      ]),

      arc('beta_tester', 'Beta Tester', 'Fresh recruit — has not seen the alpha build — founding price still available through July 1', [
        s('hook',    'fresh',      'She just joined — she has not seen the build yet — she is coming in with fresh eyes'),
        s('problem', 'same',       'The 6:30 PM wall is still hitting — unresolved because she only just arrived'),
        s('agitate', 'urgent',     'Founding price ends July 1 — she found this at the right time but the window is closing'),
        s('solve',   'tested',     'Real families shaped this before she got here — it was built and fixed for her'),
        s('value',   'ready',      'She gets a finished product — tested, iterated, improved — not a rough first version'),
        s('proof',   'founding',   'Founding price still available — $7.99 forever — she is still inside the window'),
        s('cta',     'excited',    'July 1 — she launches with it — fresh experience, founding price, perfect timing')
      ]),

      arc('pre_launch_visitor', 'Pre-Launch Visitor', 'Found it before it was everywhere — discovery energy — one friction moment and she is gone', [
        s('hook',    'curious',    'She found this before it was public — that does not happen by accident'),
        s('problem', 'uncertain',  'Not on the waitlist yet — she is interested but has not committed — one friction moment ends it'),
        s('agitate', 'urgent',     'Founding price ends at 5,000 families — she found it early, she should act on that advantage'),
        s('solve',   'exclusive',  'Free to join, early access July 1 — this feels like she got somewhere before the crowd'),
        s('value',   'early',      'She was early — that means something — founding members are a different category'),
        s('proof',   'scarce',     'First 5,000 families only — the window is real and she is inside it right now'),
        s('cta',     'belonging',  'She joins — founding member before the crowd arrives — that identity is hers')
      ]),

      arc('founder_family', 'Founding Family', 'Already in — price locked — waiting for July 1 with pride and slight anticipation', [
        s('hook',    'proud',               'She is in — she was there first — founding family is not a label, it is an identity'),
        s('problem', 'waiting',             'July 1 is coming — the anticipation is real — she wants to know it is actually happening'),
        s('agitate', 'reassurance_needed',  'Did she make the right call joining early? The wait has created a small window of doubt'),
        s('solve',   'confirmed',           '$7.99 locked forever — the price is real — her decision was right'),
        s('value',   'insider',             'She was part of the family that built this — her early join shaped what others get'),
        s('proof',   'committed',           'July 1 app download — first access confirmed — she goes before everyone else'),
        s('cta',     'excited',             'She launches with the product — founding family — she was always going to be here')
      ])

    ];

    var added = 0;
    strategies.forEach(function(row) {
      if (!existing[row[0]]) {
        sheet.appendRow(row);
        added++;
      }
    });

    Logger.log('[seedEC2026001CampaignStrategies] added:' + added + ' skipped:' + (strategies.length - added));
    return { ok: true, added: added, skipped: strategies.length - added, total: strategies.length };

  } catch(e) {
    Logger.log('[seedEC2026001CampaignStrategies] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── EC-2026-002 Transition ────────────────────────────────────────────────────
// Campaigns coexist in the live sheets by campaign_id.
// exportCampaignSnapshotToDrive() creates a permanent read-only copy in Drive —
// the team can always open it; it is never overwritten.

var _SNAPSHOT_FOLDER_ID = '1O9WYhU7B9MS9aMTUurBRCA5xufE3o8rl'; // EC Campaign Drive folder

function exportCampaignSnapshotToDrive(campaignId) {
  if (!campaignId) return { ok: false, error: 'campaign_id required' };

  var srcSS   = _getCampaignSpreadsheet();
  var folder  = DriveApp.getFolderById(_SNAPSHOT_FOLDER_ID);
  var today   = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var snapName = campaignId.toUpperCase() + ' — Campaign Snapshot ' + today;

  // Create new spreadsheet and move to campaign folder
  var newSS   = SpreadsheetApp.create(snapName);
  var newFile = DriveApp.getFileById(newSS.getId());
  folder.addFile(newFile);
  DriveApp.getRootFolder().removeFile(newFile);

  // Tabs to snapshot — campaign_id filtered where column exists
  var tabs = [
    _CC_TAB.BRIEFS, _CC_TAB.SOCIAL, _CC_TAB.EMAIL, _CC_TAB.DL,
    _CC_TAB.CONTENT_CAL, _CC_TAB.PAGES, _CC_TAB.LP_INVENTORY,
    _CC_TAB.METRICS, _CC_TAB.SCHEDULED
  ];

  var sheetIdx = 0;
  var copied   = 0;
  tabs.forEach(function(tabName) {
    var srcSheet = srcSS.getSheetByName(tabName);
    if (!srcSheet || srcSheet.getLastRow() < 1) return;

    var allData = srcSheet.getDataRange().getValues();
    var headers = allData[0];
    var cidIdx  = headers.indexOf('campaign_id');
    var rows;

    if (cidIdx >= 0) {
      rows = [headers].concat(allData.slice(1).filter(function(r) {
        return String(r[cidIdx]).toUpperCase() === campaignId.toUpperCase();
      }));
    } else {
      rows = allData;
    }

    if (rows.length < 2) return; // no data rows for this campaign — skip tab

    var destSheet;
    if (sheetIdx === 0) {
      destSheet = newSS.getSheets()[0];
      destSheet.setName(tabName);
    } else {
      destSheet = newSS.insertSheet(tabName);
    }
    destSheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
    sheetIdx++;
    copied++;
  });

  var url = newSS.getUrl();
  Logger.log('[exportCampaignSnapshotToDrive] ' + campaignId + ' → ' + url + ' (' + copied + ' tabs)');
  return { ok: true, campaign_id: campaignId, snapshot_name: snapName, url: url, tabs_copied: copied };
}

function seedEC2026002() {
  var now   = _ccNow();
  var sheet = _getCCSheet(_CC_TAB.BRIEFS);
  var hdrs  = _CC_HDR.CampaignBriefs;
  var row   = new Array(hdrs.length).fill('');
  var map   = {
    'id':          'EC-2026-002',
    'name':        'ICP-Governed Pre-Launch Arc 2026 — The Kitchen That Evolves',
    'icp_code':    'ALL-22',
    'blueprint':   'BLUEPRINT-A',
    'channel':     'Multi',
    'goal':        '5000 waitlist signups · July 1 2026 · $7.99/mo founding price',
    'slug':        'lp/waitlist-a',
    'launch_date': '2026-07-01',
    'status':      'active',
    'created_by':  'Taylor',
    'created_at':  now,
    'updated_at':  now,
    'notes':       'ICP governance: 22 emotional arcs · Brand position: The app that evolves with your life · Claim quality v1 · 94 approved claims · 2 LP variants: waitlist-a (founding price angle) + waitlist-b (life-change angle) · LP Framework 7-section + TRACK→PLAN→OPTIMIZE→COOK→SHOP loop · UTM content ICP-aware from creation'
  };
  hdrs.forEach(function(h, i) { if (map[h] !== undefined) row[i] = map[h]; });
  _ccUpsert(sheet, hdrs, 'EC-2026-002', row);
  Logger.log('[seedEC2026002] EC-2026-002 campaign brief created');
  return { ok: true, campaign_id: 'EC-2026-002' };
}
