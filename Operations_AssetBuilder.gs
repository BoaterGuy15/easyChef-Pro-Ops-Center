// ─────────────────────────────────────────────────────────────────────────────
// Operations_AssetBuilder.gs
// Paste this file into your Apps Script project.
//
// ADD TO doGet in Operations.gs:
//   if (action === 'lp_search') return json(getLandingPagesByIcp(e.parameter.icp));
//
// ADD TO doPost in Operations.gs:
//   if (body.action === 'build_email_sequence') return json(buildEmailSequence(body.brief, body.copy));
//   if (body.action === 'build_social_posts')   return json(buildSocialPosts(body.brief, body.copy));
//   if (body.action === 'build_landing_page')   return json(buildLandingPage(body.brief, body.copy));
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared architecture context injected into every asset prompt ──────────────

var _AB_ARCH =
  '=== ARCHITECTURE ===\n' +
  'Landing pages belong to an ICP, not a campaign. Multiple campaigns drive to the same LP.\n' +
  'Every email, every social post, every ad drives to the campaign landing page URL.\n' +
  'Each asset carries its own DL_ID in the UTM so attribution is tracked per asset, not per page.\n' +
  'PRODUCT NAME: Always write "easyChef Pro". Never "the app", "this app", or "a meal planning app".\n' +
  'CTA RULE: Every CTA drives to the landing page. Never link to the main website or App Store (pre-launch).\n' +
  'PRODUCT FEATURES — 5 features in one complete loop: TRACK (Pantry & Waste Screen) → PLAN (Meal Planning Screen) → OPTIMIZE (Savings Dashboard) → COOK (Recipe & Cook Mode) → SHOP (Shopping List Screen). Never write "4 features". Never omit SHOP from any complete product description.\n\n';

var _AB_VOICE =
  'Brand voice: Warm, direct, empathetic. Never shame-based. No jargon.\n' +
  'No markdown in output values — no **, no *, no #, no backticks.\n' +
  'Write like a friend texting, not a corporation.\n\n';

function _getClaimsContext() {
  try {
    var claims = getApprovedClaims();
    if (Array.isArray(claims) && claims.length) {
      var ctx = 'Approved claims (use exact wording only — never invent statistics):\n';
      claims.forEach(function(c) { ctx += '- ' + c.exact_wording + '\n'; });
      return ctx + '\n';
    }
  } catch (e) {}
  return 'Use only approved claims from the ApprovedClaims tab. Do not invent statistics.\n\n';
}

function _getIcpContext(icpCode) {
  try {
    var profile = getIcpProfile(icpCode);
    if (profile) {
      var ctx = 'ICP: ' + profile.name + '\n';
      if (profile.demographics)        ctx += 'Demographics: '        + profile.demographics        + '\n';
      if (profile.psychographics)      ctx += 'Psychographics: '      + profile.psychographics      + '\n';
      if (profile.entry_moment)        ctx += 'Entry moment: '        + profile.entry_moment        + '\n';
      if (profile.primary_pain)        ctx += 'Primary pain: '        + profile.primary_pain        + '\n';
      if (profile.secondary_pain)      ctx += 'Secondary pain: '      + profile.secondary_pain      + '\n';
      if (profile.value_trigger)       ctx += 'Value trigger: '       + profile.value_trigger       + '\n';
      if (profile.loss_aversion)       ctx += 'Loss aversion: '       + profile.loss_aversion       + '\n';
      if (profile.emotional_entry)     ctx += 'Emotional entry: '     + profile.emotional_entry     + '\n';
      if (profile.emotional_payoff)    ctx += 'Emotional payoff: '    + profile.emotional_payoff    + '\n';
      if (profile.message_hierarchy)   ctx += 'Message hierarchy: '   + profile.message_hierarchy   + '\n';
      if (profile.conversion_triggers) ctx += 'Conversion triggers: ' + profile.conversion_triggers + '\n';
      if (profile.device)              ctx += 'Primary device: '      + profile.device              + '\n';
      if (profile.channels)            ctx += 'Preferred channels: '  + profile.channels            + '\n';
      return ctx;
    }
  } catch (e) {}
  return 'ICP: ' + (icpCode || 'Unknown') + '\n';
}

// ── _getStagesArcText ─────────────────────────────────────────────────────────
// Builds the campaign arc + individual post arc sections from FunnelStages tab.
// Falls back to hardcoded text if the sheet is unavailable.

function _getStagesArcText() {
  var stages = [];
  try { stages = getFunnelStages(); } catch(e) {}

  if (!stages.length) {
    return (
      '=== CAMPAIGN FLOW RULE — CRITICAL ===\n' +
      'Every campaign follows the 7-step sequence across the full post set AND within each individual post.\n\n' +
      'THE CAMPAIGN ARC — assign funnel stages to posts in this order:\n' +
      '  Post 1 → hook       (stop the scroll, make her feel seen)\n' +
      '  Post 2 → problem    (name the problem precisely)\n' +
      '  Post 3 → agitate    (make the pain vivid and costly)\n' +
      '  Post 4 → solve      (introduce easyChef Pro as the answer)\n' +
      '  Post 5 → value      (outcomes she wants, not features)\n' +
      '  Post 6 → proof      (one honest proof point)\n' +
      '  Post 7+ → cta       (one action, low friction)\n' +
      'If post count is fewer than 7, compress — combine agitate+problem or value+proof.\n' +
      'If post count is more than 7, expand the middle (more value or proof posts).\n\n' +
      'THE INDIVIDUAL POST ARC — every post body follows this compressed sequence:\n' +
      '  1. Hook line     (1 sentence — stop the scroll)\n' +
      '  2. Problem       (1–2 sentences — name her pain)\n' +
      '  3. Agitate       (1–2 sentences — cost it out, make it vivid)\n' +
      '  4. Solve         (1 sentence — introduce the answer)\n' +
      '  5. Value         (1–2 sentences — outcome not feature)\n' +
      '  6. Proof         (1 sentence — one honest stat or claim)\n' +
      '  7. CTA           (1 sentence — one action, outcome framed)\n\n' +
      'Example for a savings-angle post:\n' +
      '  Hook: "Your family threw away $1,336 last year."\n' +
      '  Problem: "Not on bad decisions. On groceries that expired before you could use them."\n' +
      '  Agitate: "The spinach. The leftovers nobody touched. The chicken you found too late."\n' +
      '  Solve: "easyChef Pro plans meals around what you actually have."\n' +
      '  Value: "30 minutes from fridge to table every night."\n' +
      '  Proof: "Validated across 10,000 household profiles."\n' +
      '  CTA: "Join the founding waitlist free — no credit card."\n\n'
    );
  }

  var arcLines = stages.map(function(s, i) {
    var label = i === stages.length - 1 ? 'Post ' + (i + 1) + '+' : 'Post ' + (i + 1) + ' ';
    return '  ' + label + ' → ' + s.stage_name + '       (' + s.social_theme + ')';
  }).join('\n');

  var postArcLines = stages.map(function(s, i) {
    return '  ' + (i + 1) + '. ' + s.stage_name.charAt(0).toUpperCase() + s.stage_name.slice(1) +
      '         (' + s.post_template.split('.')[0] + ')';
  }).join('\n');

  return (
    '=== CAMPAIGN FLOW RULE — CRITICAL ===\n' +
    'Every campaign follows the 7-step sequence across the full post set AND within each individual post.\n\n' +
    'THE CAMPAIGN ARC — assign funnel stages to posts in this order:\n' +
    arcLines + '\n' +
    'If post count is fewer than 7, compress — combine agitate+problem or value+proof.\n' +
    'If post count is more than 7, expand the middle (more value or proof posts).\n\n' +
    'THE INDIVIDUAL POST ARC — every post body follows this compressed sequence:\n' +
    postArcLines + '\n\n' +
    'Example for a savings-angle post:\n' +
    '  Hook: "Your family threw away $1,336 last year."\n' +
    '  Problem: "Not on bad decisions. On groceries that expired before you could use them."\n' +
    '  Agitate: "The spinach. The leftovers nobody touched. The chicken you found too late."\n' +
    '  Solve: "easyChef Pro plans meals around what you actually have."\n' +
    '  Value: "30 minutes from fridge to table every night."\n' +
    '  Proof: "Validated across 10,000 household profiles."\n' +
    '  CTA: "Join the founding waitlist free — no credit card."\n\n'
  );
}

// ── Stage emotional directions (shared by story context + image pipeline) ────
var _STAGE_EMOTIONS = {
  hook:    'Exhausted and defeated. This is the worst moment of her day. No hope yet. No solution visible.',
  problem: 'Frustration building. She knows this feeling too well. Nothing has ever fixed it.',
  agitate: 'Shock and recognition. She is seeing the true cost for the first time. Cannot look away.',
  solve:   'Curiosity and surprise. Her expression is shifting. Something is different. The penny is dropping.',
  value:   'Calm confidence. She is handling it. This is what in control feels like.',
  proof:   'Pride and warmth. Her family is happy. She did this. Real smile — not posed.',
  cta:     'Pure peace and satisfaction. The weight is gone. This is the feeling she is buying.'
};

// ── Master narrative spine — injected into every system prompt ─────────────────
var _MASTER_STORY =
  '=== MASTER STORY — READ THIS FIRST. EVERY WORD YOU WRITE CONNECTS BACK TO THIS. ===\n' +
  '"Your kitchen is broken. Not because of you. Because no tool ever closed the loop.\n' +
  'easyChef Pro closes the loop. Your kitchen. In command."\n' +
  'The ICP\'s kitchen is broken — not her fault — and easyChef Pro is the only tool that closes the full loop.\n' +
  'This is the narrative spine. Every headline, every hook, every CTA must connect back to it.\n\n';

// ── Category positioning — how to frame easyChef Pro vs competitors ───────────
var _CATEGORY_POSITIONING =
  '=== CATEGORY POSITIONING — HOW TO FRAME easyChef Pro ===\n' +
  '"easyChef Pro is the only food app you need. Not a feature — a category claim.\n' +
  'Every other app solves one part: the recipe, the grocery list, the budget tracker.\n' +
  'easyChef Pro closes the full loop: TRACK what you have → PLAN the week → SHOP efficiently → COOK confidently → ZERO waste.\n' +
  'Never position against a specific competitor. Position against the broken status quo.\n' +
  'The enemy is not another app. The enemy is the 6:30 PM panic. The expired spinach. The $1,336 thrown away."\n\n';

// ── Claim quality rules — every claim must pass this standard ─────────────────
var _CLAIM_QUALITY_COPY =
  '=== CLAIM QUALITY RULES — EVERY CLAIM MUST PASS THIS STANDARD ===\n' +
  'Formula: Recognition → emotional tension → human outcome. NOT: feature → benefit.\n' +
  'Test: Could a real exhausted human say this out loud? If not, rewrite it.\n' +
  'Emotion approach: Implied emotion, not direct emotion. Create the experience — do not label it.\n' +
  'Strong claims are:\n' +
  '  ✓ emotionally visual — the reader can picture it\n' +
  '  ✓ human language — sounds spoken, not marketed\n' +
  '  ✓ recognizable life moment — she has been here before\n' +
  '  ✓ implies transformation without stating it\n' +
  '  ✓ shows the experience instead of labeling the emotion\n' +
  'Reject if the claim:\n' +
  '  ✗ sounds corporate, app-store-ish, or SaaS-y\n' +
  '  ✗ uses feature → benefit structure\n' +
  '  ✗ labels the emotion instead of creating it\n' +
  '  ✗ could have been written by any food app\n' +
  'Examples:\n' +
  '  Weak:   No more daily food decisions\n' +
  '  Strong: You already made a hundred decisions today. Dinner should not be another one.\n' +
  '  Weak:   Less stress\n' +
  '  Strong: No more staring into the fridge hoping dinner appears.\n' +
  '  Weak:   easyChef Pro handles the logistics — you handle the cooking\n' +
  '  Strong: Spend less time coordinating dinner. More time actually making it.\n\n';

// ── Brand position — governing frame above all ICP arcs ──────────────────────
var _BRAND_POSITION_COPY =
  '=== BRAND POSITION — GOVERNING FRAME. EVERY PIECE OF COPY ANSWERS TO THIS. ===\n' +
  'Tagline:     "The app that evolves with your life."\n' +
  'Brand Truth: "Your life changes. Your kitchen should change with it."\n' +
  'Position:    Adaptive household infrastructure — not recipe software.\n' +
  'Contrast:    Most food apps assume one static person forever. easyChef Pro does not.\n' +
  'Life stages this product serves:\n' +
  '  newlywed → young_family → super_mom / single_parent → busy_professional / fitness_phase → empty_nester → grandparent\n' +
  'Copy rules:\n' +
  '  ✓ Lead with life stage, not feature — the feature serves the stage, not the reverse\n' +
  '  ✓ ICP-specific emotion leads every piece — the tagline resolves it\n' +
  '  ✓ The brand truth is the emotional bridge — use it when copy needs the why behind the tagline\n' +
  '  ✗ Never position as recipe software — easyChef Pro is infrastructure that follows your life\n\n';

// ── 5-app replacement arc — locked rules for every post ──────────────────────
var _5_APP_REPLACEMENT =
  '=== 5-APP REPLACEMENT (LOCKED) ===\n' +
  'easyChef Pro replaces five apps. Never "integrates with" — always "replaces".\n\n' +
  'App replaced          → easyChef Pro feature:\n' +
  'NoWaste               → TRACK    (Pantry Intelligence — scans receipts · tracks expiry)\n' +
  'Mealime               → PLAN     (Meal Planning Engine — builds week from what you already have)\n' +
  'MyFitnessPal          → OPTIMIZE (Nutrition Scoring — 6 dimensions · FDA-grade · registered dietitians)\n' +
  'Recipe/Pinterest      → COOK     (Recipe Engine — 30 minutes fridge to table · 10,000 recipes)\n' +
  'Shopping list apps    → SHOP     (1-click shopping — list builds from pantry · only what is missing)\n\n' +
  'SHOP RULE: Always "1-click shopping". Never: "Instacart" · "Walmart cart" · "Walmart" · any store or third-party app name.\n' +
  '  Always: "1-click shopping" · "the list builds itself" · "one click to your cart"\n\n' +
  'OPTIMIZE RULE: Without OPTIMIZE the 5-app story is incomplete. Always include it when describing the full loop.\n' +
  '  OPTIMIZE scores every meal COOK produces — 6 nutrition dimensions · FDA-grade data · registered dietitians.\n\n' +
  'NAME APPS IN PROBLEM SECTION ONLY — never in SOLVE, VALUE, or CTA.\n\n' +
  'PHONE RULE IN COPY:\n' +
  '  Posts/emails 1-3: NO mention of the app being open or visible\n' +
  '  Post/email 4:     First reveal — phone appears with easyChef Pro open\n' +
  '  Posts/emails 5+:  Phone visible · app in use · outcomes not features\n\n';

// ── Precision rules — exact figures, locked phrasing ─────────────────────────
var _PRECISION_RULES =
  '=== PRECISION RULES (LOCKED) ===\n' +
  'Use exact figures only — no rounding, no approximating, no softening:\n\n' +
  'ANNUAL SAVINGS:  "$1,336/year average savings" — NEVER "$1,500" · NEVER "over $1,000"\n' +
  'MONTHLY SAVINGS: "Families save an average of $111 a month" — exact phrasing required\n' +
  'FOOD WASTE:      "69.5% less food waste" — NEVER "70%" · NEVER "nearly 70%"\n' +
  'DISCOUNT:        "60% off" — NEVER "50% off"\n' +
  'DIETITIANS:      "registered dietitians" — "registered" always required · NEVER just "dietitians"\n' +
  'CTA RULE:        NEVER "sign up" — use: "Join the waitlist" · "Get early access" · "Join the founding family" · "Lock in your spot"\n\n';

// ── 7-step copy framework — what works, what kills each step ──────────────────
var _7_STEP_FRAMEWORK =
  '=== 7-STEP COPY FRAMEWORK — EVERY PIECE OF COPY FOLLOWS THIS EXACTLY ===\n' +
  'Step 1 — HOOK: Stop the scroll in the first 5 words. Name the specific moment — not the category.\n' +
  '  KILLS: "Are you tired of..." / "Imagine a world..." / any generic opener.\n' +
  '  WORKS: Name the exact time, object, feeling. "6:30 PM. Empty fridge. Three kids asking."\n\n' +
  'Step 2 — PROBLEM: Name the exact pain in one sentence. Specific moment — not a general problem.\n' +
  '  KILLS: Abstract language. "Meal planning is hard" is dead copy.\n' +
  '  WORKS: "You buy groceries Sunday. By Wednesday it\'s a guessing game and someone gets cereal."\n\n' +
  'Step 3 — AGITATE: Make the cost real. One undeniable number per sentence. Honest — never dramatic.\n' +
  '  KILLS: Shame language. "You are failing your family" is never acceptable. Ever.\n' +
  '  WORKS: "The average family throws away $1,336 of groceries every year. Not bad decisions. Just no system."\n\n' +
  'Step 4 — SOLVE: One sentence only. Introduce easyChef Pro as the obvious answer. No feature lists.\n' +
  '  KILLS: "easyChef Pro has 5 powerful features including..." — no. One sentence.\n' +
  '  WORKS: "easyChef Pro looks at what is in your fridge and tells you exactly what to make tonight."\n\n' +
  'Step 5 — VALUE: Outcomes she wants. Not features — feelings and results. Specific, not aspirational.\n' +
  '  KILLS: "You will feel amazing about cooking again." Vague. Empty.\n' +
  '  WORKS: "$1,336 back. 30 minutes fridge to table. And the 6:30 panic is just gone."\n\n' +
  'Step 6 — PROOF: One validated stat from the approved claims list. One only. Never invented.\n' +
  '  KILLS: Made-up stats / invented testimonials / "thousands of families love it".\n' +
  '  WORKS: "Validated across 10,000 household profiles." Exact wording from the approved list.\n\n' +
  'Step 7 — CTA: One action. Outcome-framed. Low friction. Tell them what they GET, not what they DO.\n' +
  '  KILLS: "Click here" / "Sign up now" — action-framed, not outcome-framed.\n' +
  '  WORKS: "Claim your founding spot — $7.99/month locked forever. First 5,000 families only."\n\n';

// ── Brand voice rules — non-negotiable ────────────────────────────────────────
var _BRAND_VOICE_RULES =
  '=== BRAND VOICE — NON-NEGOTIABLE RULES ===\n' +
  'FORBIDDEN WORDS — never write any of these:\n' +
  '  × optimize / optimized / optimizing — as a generic verb (e.g. "optimize your meals");\n' +
  '    EXCEPTION: "OPTIMIZE screen" and "the OPTIMIZE feature" (the five-stage loop label) are allowed\n' +
  '  × seamless / frictionless\n' +
  '  × leverage / leveraging\n' +
  '  × ecosystem\n' +
  '  × AI-powered / AI-driven / powered by AI\n' +
  '  × pain points — name the exact pain instead\n' +
  '  × "the app" — always use "easyChef Pro"\n' +
  '  × game-changer / revolutionary / innovative\n' +
  '  × solution — say what it does, never call it "a solution"\n' +
  '  × shame language — never imply the user is failing, lazy, or doing something wrong\n\n' +
  'REQUIRED:\n' +
  '  ✓ Write like a friend texting at the kitchen table — warm, direct, specific\n' +
  '  ✓ Name the exact moment / exact food / exact feeling — never generic\n' +
  '  ✓ One idea per sentence. Short sentences. Active voice.\n' +
  '  ✓ Empathy before authority — she must feel understood before she will trust\n' +
  '  ✓ No markdown in output: no **, no *, no #, no backticks\n\n';

// ── Per-stage emotional arc — injected into social post + email prompts ────────
var _EMOTIONAL_ARC_COPY =
  '=== EMOTIONAL ARC — MATCH THE EXACT STAGE EMOTION IN YOUR COPY ===\n' +
  'Post 1 — HOOK:    She is EXHAUSTED + DEFEATED. This is the worst moment of her day.\n' +
  '  No hope yet. No product mention. Just name the feeling and the moment.\n' +
  'Post 2 — PROBLEM: She is FRUSTRATED. She knows this pain too well.\n' +
  '  Nothing has ever fixed it. She has tried and given up. Write that exhaustion.\n' +
  'Post 3 — AGITATE: She is SHOCKED + in RECOGNITION. She is seeing the true cost for the first time.\n' +
  '  Name the $1,336 number. Make it undeniable. She cannot look away.\n' +
  'Post 4 — SOLVE:   She is CURIOUS + SURPRISED. Something is different here.\n' +
  '  The penny is dropping. Keep this post short — let the insight land, do not over-explain.\n' +
  'Post 5 — VALUE:   She is CALM + CONFIDENT. This is what in control feels like.\n' +
  '  She can already see her Monday being different. Specific outcomes, not feelings.\n' +
  'Post 6 — PROOF:   She is TRUSTING + PROUD. Her family is happy. She did this.\n' +
  '  Use one real proof point from the approved list. No invented testimonials.\n' +
  'Post 7 — CTA:     She is PEACEFUL + SATISFIED. The weight is gone.\n' +
  '  The CTA matches the relief, not the pressure. One action. Low friction.\n\n';

/**
 * Builds a story context object from a brief, picking up all theme-injected fields
 * the frontend adds via _ccExtendBriefWithTheme().
 */
// ── _resolveIcpCode ───────────────────────────────────────────────────────────
// Resolves a single ICP code from a potentially compound value (e.g. 'icp_a|icp_b').
// Uses context.lp_variant ('a'/'b') when available; falls back to post_number parity.
// Odd post → part[0] (ICP-A, money angle); even post → part[1] (ICP-B, time angle).
function _resolveIcpCode(icpCode, ctx) {
  if (!icpCode) return '';
  if (icpCode.indexOf('|') === -1) return icpCode;
  var parts   = icpCode.split('|');
  var variant = String((ctx && ctx.lp_variant) || '').toLowerCase();
  if (variant === 'a') return parts[0];
  if (variant === 'b') return parts[1] || parts[0];
  var num = parseInt((ctx && (ctx.post_number || ctx.day)) || 1);
  return (num % 2 === 1) ? parts[0] : (parts[1] || parts[0]);
}

function _buildBriefStoryCtx(brief) {
  var t = brief.themeData || {};
  return {
    icp_code:         brief.icp              || '',
    icp_entry:        t.emotional_entry      || brief.icp_entry        || '',
    theme:            brief.theme            || '',
    theme_food:       t.food_type            || brief.theme_food       || '',
    app_feature:      t.app_feature          || brief.app_feature      || '',
    app_screen_label: t.app_screen_label     || brief.app_screen_label || '',
    feature_hook:     t.feature_hook         || brief.feature_hook     || '',
    feature_proof:    t.feature_proof        || brief.feature_proof    || '',
    emotional_entry:  t.emotional_entry      || brief.emotional_entry  || '',
    emotional_payoff: t.emotional_payoff     || brief.emotional_payoff || '',
    campaign_angle:   brief.campaign_angle   || 'savings',
    hook_angle:       t.hook_angle           || brief.hook_angle       || '',
    problem_angle:    t.problem_angle        || brief.problem_angle    || '',
    agitate_angle:    t.agitate_angle        || brief.agitate_angle    || '',
    urgency_trigger:  t.urgency_trigger      || brief.urgency_trigger  || '',
    image_mood_hook:  t.image_mood_hook      || '',
    image_mood_cta:   t.image_mood_cta       || '',
    blueprint:        brief.blueprint        || '',
    lp_variant:       brief.lp_variant       || '',
    lp_slug:          brief.lp_slug          || brief.slug             || '',
    campaign_id:      brief.id               || brief.campaign_id      || ''
  };
}

/**
 * Returns the STORY CONTEXT block string.
 * When context.stage is set, appends a THIS POST section with emotional direction.
 */
function _buildStoryContextBlock(context) {
  var ctx   = context || {};
  var stage = (ctx.stage || '').toLowerCase();
  var emo   = stage ? (_STAGE_EMOTIONS[stage] || '') : '';

  var block =
    '=== STORY CONTEXT FOR THIS CAMPAIGN ===\n' +
    'WHO: '          + (ctx.icp_entry      || ctx.icp_code || '') + '\n' +
    'THEIR MOMENT: ' + (ctx.emotional_entry || '') + '\n' +
    'THE HOOK: '     + (ctx.hook_angle     || '') + '\n' +
    'THE PAIN: '     + (ctx.problem_angle  || '') + '\n' +
    'THE COST: '     + (ctx.agitate_angle  || '') + '\n';

  if (ctx.feature_hook)
    block += 'THE SOLUTION: ' + ctx.feature_hook +
             (ctx.app_feature ? ' — ' + ctx.app_feature + ' feature' : '') + '\n';
  if (ctx.app_screen_label && ctx.app_screen_label !== 'none')
    block += 'THE SCREEN: '  + ctx.app_screen_label + '\n';
  if (ctx.feature_proof)
    block += 'THE PROOF: '   + ctx.feature_proof   + '\n';
  if (ctx.emotional_payoff)
    block += 'THE PAYOFF: '  + ctx.emotional_payoff + '\n';

  var _isWaitlist = (ctx.blueprint || '').indexOf('Waitlist') > -1;
  var _urgencyDefault = _isWaitlist
    ? 'Free during beta — app launches July 1'
    : 'Founding price $7.99/month ends at 5,000 families';
  block += 'THE URGENCY: ' + (ctx.urgency_trigger || _urgencyDefault) + '\n';

  if (stage) {
    block +=
      '\nTHIS POST:\n' +
      'Stage: '     + stage + '\n' +
      (ctx.platform    ? 'Platform: '    + ctx.platform    + '\n' : '') +
      (ctx.post_number ? 'Post number: ' + ctx.post_number + ' of 7\n' : '') +
      (emo             ? 'Emotional direction: ' + emo     + '\n' : '') +
      'Write the ' + stage + ' post for this exact story. Make it specific to ' +
      (ctx.theme || ctx.icp_code || 'this campaign') +
      ' — not generic meal planning copy.\n';
  }

  return block + '\n';
}

// ── Sheet-reading helpers for getMasterSystemPrompt ───────────────────────────

function _getIcpRow(icp_code) {
  if (!icp_code) return {};
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ICPProfiles');
    if (!sheet) return {};
    var vals    = sheet.getDataRange().getValues();
    var headers = vals[0].map(function(h) { return String(h).toLowerCase().trim().replace(/\s+/g, '_'); });
    for (var i = 1; i < vals.length; i++) {
      var row = {};
      headers.forEach(function(h, j) { row[h] = vals[i][j]; });
      var code = String(row.icp_code || row.id || '').toLowerCase().trim();
      if (code && code === String(icp_code).toLowerCase().trim()) return row;
    }
  } catch(e) { Logger.log('_getIcpRow error: ' + e.message); }
  return {};
}

function _getThemeRow(theme_id) {
  if (!theme_id) return {};
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ThemeLibrary');
    if (!sheet) return {};
    var vals    = sheet.getDataRange().getValues();
    var headers = vals[0].map(function(h) { return String(h).toLowerCase().trim().replace(/\s+/g, '_'); });
    for (var i = 1; i < vals.length; i++) {
      var row = {};
      headers.forEach(function(h, j) { row[h] = vals[i][j]; });
      var id = String(row.theme_id || row.id || '').toLowerCase().trim();
      if (id && id === String(theme_id).toLowerCase().trim()) return row;
    }
  } catch(e) { Logger.log('_getThemeRow error: ' + e.message); }
  return {};
}

function _getCcSetting(key_prefix) {
  var results = [];
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('CcSettings');
    if (!sheet) return results;
    var vals    = sheet.getDataRange().getValues();
    var headers = vals[0].map(function(h) { return String(h).toLowerCase().trim().replace(/\s+/g, '_'); });
    var prefix  = String(key_prefix).toLowerCase();
    for (var i = 1; i < vals.length; i++) {
      var row = {};
      headers.forEach(function(h, j) { row[h] = vals[i][j]; });
      var key    = String(row.key    || '').toLowerCase();
      var active = String(row.active || '').toLowerCase();
      if (key.indexOf(prefix) === 0 && (active === 'true' || active === '1' || active === 'yes')) {
        results.push({ key: String(row.key || ''), label: String(row.label || row.value || '') });
      }
    }
  } catch(e) { Logger.log('_getCcSetting error: ' + e.message); }
  return results;
}

function _getApprovedClaimsRows() {
  var results = [];
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ApprovedClaims');
    if (!sheet) return results;
    var vals    = sheet.getDataRange().getValues();
    var headers = vals[0].map(function(h) { return String(h).toLowerCase().trim().replace(/\s+/g, '_'); });
    for (var i = 1; i < vals.length; i++) {
      var row = {};
      headers.forEach(function(h, j) { row[h] = vals[i][j]; });
      var approved = String(row.approved || row.active || '').toLowerCase();
      if (approved === 'true' || approved === '1' || approved === 'yes') {
        results.push({ claim: String(row.claim || row.name || ''), exact_wording: String(row.exact_wording || row.claim || '') });
      }
    }
  } catch(e) { Logger.log('_getApprovedClaimsRows error: ' + e.message); }
  return results;
}

function _buildMasterPrompt(type, context, icp, theme, brandPlug, urgency, excl, angle, claims, governance) {
  var ctx = context || {};
  var gov = governance || {};

  // Role
  var role;
  if (type.indexOf('social_post') === 0) {
    role = 'You are the easyChef Pro social media copywriter. Your only job is to move people from scroll to click.';
  } else if (type === 'lp_full' || type === 'landing_page') {
    role = 'You are the easyChef Pro landing page copywriter. Write high-converting copy that closes the waitlist.';
  } else if (type === 'email_full' || type === 'email') {
    role = 'You are the easyChef Pro email sequence copywriter. Write personal, conversion-focused emails that feel like a friend sent them.';
  } else if (type === 'seo') {
    role = 'You are the easyChef Pro SEO strategist. Write metadata that ranks on Google and converts on social.';
  } else {
    role = 'You are the easyChef Pro campaign copywriter.';
  }

  // Section D: Emotional Arc (social + email only)
  var sD = '';
  if (type.indexOf('social_post') === 0 || type === 'email_full' || type === 'email') {
    sD = gov.emotionalArc || _EMOTIONAL_ARC_COPY;
  }

  // Section E: Claims + Brand Plug + Proof Bar
  var claimsCtx = '=== APPROVED CLAIMS — USE EXACT WORDING ONLY ===\n';
  if (Array.isArray(claims) && claims.length) {
    claimsCtx += 'Approved claims (use exact wording only — never invent statistics):\n';
    claims.forEach(function(c) { claimsCtx += '- ' + (c.exact_wording || c.claim || '') + '\n'; });
    claimsCtx += '\n';
  } else {
    claimsCtx += 'Use only approved claims. Do not invent statistics.\n\n';
  }
  claimsCtx += 'FOUNDING OFFER RULE: Use exact wording: "Lock in $7.99/month founding price — 60% off forever". Never write "50% off" in any form.\n\n';

  var brandPlugCtx = '';
  if (Array.isArray(brandPlug) && brandPlug.length) {
    var _bpTagline = (brandPlug.filter(function(r) { return String(r.key).toLowerCase().indexOf('tagline') > -1; })[0] || {}).label || 'Your kitchen. In command.';
    var _bpOrigin  = (brandPlug.filter(function(r) { return String(r.key).toLowerCase().indexOf('origin')  > -1; })[0] || {}).label || 'Built by first responders.';
    var _bpClaims  = brandPlug.filter(function(r) { return String(r.key).toLowerCase().indexOf('proof_') > -1; }).map(function(r) { return '    · ' + r.label; }).join('\n');
    brandPlugCtx =
      'BRAND PLUG — appears above every CTA button, exact order, exact wording. This is never optional.\n' +
      '  Line 1 — Tagline: "' + _bpTagline + '"\n' +
      '  Line 2 — Origin:  "' + _bpOrigin  + '"\n' +
      '  Line 3 — Proof:   One approved claim (choose whichever fits the campaign angle):\n' +
      (_bpClaims || '    · Validated across 10,000 household profiles') + '\n\n';
  } else {
    brandPlugCtx = 'BRAND PLUG: Place tagline, origin, and one proof claim above every CTA button. Exact wording only.\n\n';
  }

  var proofBarCtx =
    'PROOF BAR: Always exactly 3 items.\n' +
    '  Item 1 — creative trust statement (e.g. "Busy families are already...") — NO stats, NO %, NO $ amounts, NO invented user counts\n' +
    '  Item 2 — exact wording always: "69.5% less food waste"\n' +
    '  Item 3 — exact wording always: "30 minutes fridge to table"\n\n';

  var sE = claimsCtx + brandPlugCtx + proofBarCtx;

  // Section F: ICP + Theme + Settings + Story
  var icpCtx = '=== TARGET ICP ===\n';
  var icpHasData = icp && Object.keys(icp).length > 0;
  if (icpHasData) {
    icpCtx += (icp.icp_code || icp.id || ctx.icp_code || '') + '\n';
    if (icp.demographics)        icpCtx += 'Demographics: '        + icp.demographics        + '\n';
    if (icp.psychographics)      icpCtx += 'Psychographics: '      + icp.psychographics      + '\n';
    if (icp.entry_moment)        icpCtx += 'Entry moment: '        + icp.entry_moment        + '\n';
    if (icp.primary_pain)        icpCtx += 'Primary pain: '        + icp.primary_pain        + '\n';
    if (icp.secondary_pain)      icpCtx += 'Secondary pain: '      + icp.secondary_pain      + '\n';
    if (icp.value_trigger)       icpCtx += 'Value trigger: '       + icp.value_trigger       + '\n';
    if (icp.loss_aversion)       icpCtx += 'Loss aversion: '       + icp.loss_aversion       + '\n';
    if (icp.emotional_entry)     icpCtx += 'Emotional entry: '     + icp.emotional_entry     + '\n';
    if (icp.emotional_payoff)    icpCtx += 'Emotional payoff: '    + icp.emotional_payoff    + '\n';
    if (icp.message_hierarchy)   icpCtx += 'Message hierarchy: '   + icp.message_hierarchy   + '\n';
    if (icp.conversion_triggers) icpCtx += 'Conversion triggers: ' + icp.conversion_triggers + '\n';
    if (icp.device)              icpCtx += 'Primary device: '      + icp.device              + '\n';
    if (icp.channels)            icpCtx += 'Preferred channels: '  + icp.channels            + '\n';
  } else {
    try { icpCtx += _getIcpContext(ctx.icp_code || ctx.icp || ''); }
    catch(e) { icpCtx += 'ICP: ' + (ctx.icp_code || ctx.icp || 'Unknown') + '\n'; }
  }
  icpCtx += '\n';

  var themeCtx = '';
  var themeHasData = theme && Object.keys(theme).length > 0;
  if (themeHasData) {
    themeCtx = '=== CAMPAIGN THEME ===\n';
    if (theme.theme_name || theme.name)  themeCtx += 'Theme: '           + (theme.theme_name || theme.name) + '\n';
    if (theme.food_type)                 themeCtx += 'Theme food: '       + theme.food_type + ' — name this food in Post 4 (SOLVE) and beyond\n';
    if (theme.hook_angle)                themeCtx += 'Hook angle: '       + theme.hook_angle + '\n';
    if (theme.emotional_entry)           themeCtx += 'Emotional entry: '  + theme.emotional_entry + '\n';
    if (theme.emotional_payoff)          themeCtx += 'Emotional payoff: ' + theme.emotional_payoff + '\n';
    themeCtx += '\n';
  } else if (ctx.theme_food || ctx.image_mood_hook || ctx.image_mood_cta) {
    themeCtx = '=== VISUAL ANCHORS FOR THIS CAMPAIGN ===\n';
    if (ctx.image_mood_hook) themeCtx += 'HOOK IMAGE MOOD: ' + ctx.image_mood_hook + '\n';
    if (ctx.image_mood_cta)  themeCtx += 'CTA IMAGE MOOD: '  + ctx.image_mood_cta  + '\n';
    if (ctx.theme_food)      themeCtx += 'THEME FOOD: '       + ctx.theme_food + ' — use this food by name in Post 4 (SOLVE) and beyond\n';
    themeCtx += '\n';
  }

  var settingsCtx = '';
  if (Array.isArray(urgency) && urgency.length) {
    settingsCtx += '=== URGENCY OPTIONS ===\n';
    urgency.forEach(function(u) { settingsCtx += '- ' + u.label + '\n'; });
    settingsCtx += '\n';
  }
  if (Array.isArray(excl) && excl.length) {
    settingsCtx += '=== EXCLUSIVITY ANGLES ===\n';
    excl.forEach(function(ex) { settingsCtx += '- ' + ex.label + '\n'; });
    settingsCtx += '\n';
  }
  if (Array.isArray(angle) && angle.length) {
    settingsCtx += '=== CAMPAIGN ANGLES ===\n';
    angle.forEach(function(a) { settingsCtx += '- ' + a.label + '\n'; });
    settingsCtx += '\n';
  }

  var sF = icpCtx + themeCtx + settingsCtx + _buildStoryContextBlock(ctx);

  // Section G: Type-specific instructions
  var sG = '';
  switch (type) {
    case 'social_post_hook':
      sG = '=== THIS POST: HOOK (Post 1) ===\nStop the scroll in the first 5 words. Name the specific 6:30 PM moment — not the category.\nEmotional direction: ' + _STAGE_EMOTIONS.hook + '\nNo product mention. Name the feeling and the moment only.\n\n'; break;
    case 'social_post_problem':
      sG = '=== THIS POST: PROBLEM (Post 2) ===\nName the exact pain in one sentence. Specific moment — not a general problem.\nEmotional direction: ' + _STAGE_EMOTIONS.problem + '\nShe knows this feeling too well. Nothing has ever fixed it. Write that exhaustion.\n\n'; break;
    case 'social_post_agitate':
      sG = '=== THIS POST: AGITATE (Post 3) ===\nMake the cost real. Use the $1,336/year figure. One undeniable number per sentence.\nEmotional direction: ' + _STAGE_EMOTIONS.agitate + '\nKILLS: Shame language. Never imply the user is failing. Ever.\nWORKS: "The average family throws away $1,336 of groceries every year. Not bad decisions. Just no system."\n\n'; break;
    case 'social_post_solve':
      sG = '=== THIS POST: SOLVE (Post 4) ===\nOne sentence only. Introduce easyChef Pro as the obvious answer. No feature lists.\nEmotional direction: ' + _STAGE_EMOTIONS.solve + '\nName the theme food by name in this post if a theme food is set.\nWORKS: "easyChef Pro looks at what is in your fridge and tells you exactly what to make tonight."\n\n'; break;
    case 'social_post_value':
      sG = '=== THIS POST: VALUE (Post 5) ===\nOutcomes she wants. Not features — feelings and results. Specific, not aspirational.\nEmotional direction: ' + _STAGE_EMOTIONS.value + '\nName the theme food if set. Use approved savings figures exact.\nWORKS: "$1,336 back. 30 minutes fridge to table. And the 6:30 panic is just gone."\n\n'; break;
    case 'social_post_proof':
      sG = '=== THIS POST: PROOF (Post 6) ===\nOne validated stat from the approved claims list. One only. Never invented.\nEmotional direction: ' + _STAGE_EMOTIONS.proof + '\nWORKS: "Validated across 10,000 household profiles." Exact wording from the approved list.\n\n'; break;
    case 'social_post_cta':
      sG = '=== THIS POST: CTA (Post 7) ===\nOne action. Outcome-framed. Low friction. Tell them what they GET, not what they DO.\nEmotional direction: ' + _STAGE_EMOTIONS.cta + '\nWORKS: "Claim your founding spot — $7.99/month locked forever. First 5,000 families only."\n\n'; break;
    case 'lp_full':
    case 'landing_page':
      sG = '=== FABRICATION PROHIBITION — LANDING PAGE ===\nNEVER invent testimonials, names, user stories, or social proof numbers.\nNEVER use statistics not in the approved claims list.\nApproved figures only: $1,336/year · 69.5% · 30 min · 9 patent-pending technologies · 800,000 products · 10,000 recipe pages · registered dietitians · 10,000 household profiles · built by first responders\n\n'; break;
    case 'email_full':
    case 'email':
      sG = '=== EMAIL BODY — 7-STEP STRUCTURE ===\nstep1_hook: First line — stops the read, names the moment (1 sentence)\nstep2_problem: Names her exact pain (1-2 sentences)\nstep3_agitate: Makes the cost real — use approved figures (1-2 sentences)\nstep4_solve: Introduces easyChef Pro as the answer (1 sentence)\nstep5_value: Specific outcomes — peace, control, savings (1-2 sentences)\nstep6_proof: One validated stat, exact wording from approved list (1 sentence)\nstep7_cta_text: Outcome-framed CTA line (1 sentence)\nstep7_cta_button: Button label under 6 words\nstep7_ps: P.S. line — urgency or exclusivity angle (1 sentence)\nSEQ-1-E1 RULE: body_cta and step7_cta_button must be empty strings for the welcome email.\n\n'; break;
    case 'seo':
      sG = '=== SEO RULES ===\nmeta_title: 50–60 chars exactly. Format: "[Specific Benefit] | easyChef Pro".\nmeta_description: 145–155 chars exactly. Must include one approved stat. Ends with a soft CTA.\nog_title: Under 60 chars.\nog_description: Under 200 chars.\nfocus_keyword: 2–4 word phrase.\nsecondary_keywords: Array of exactly 4 specific phrases.\n\n'; break;
    default: sG = '';
  }

  var _claimQuality    = gov.claimQuality   || _CLAIM_QUALITY_COPY;
  var _brandPosition   = gov.brandPosition  || _BRAND_POSITION_COPY;
  var _voiceRules      = gov.voiceRules     || _BRAND_VOICE_RULES;
  var _phaseGuard      = gov.phaseGuard     || '';
  var _compliance      = gov.compliance     || '';
  var _masterStory     = gov.masterStory    || _MASTER_STORY;
  var _categoryPos     = gov.categoryPos    || _CATEGORY_POSITIONING;
  var _fiveApp         = gov.fiveApp        || _5_APP_REPLACEMENT;
  var _sevenStep       = gov.sevenStep      || _7_STEP_FRAMEWORK;
  var _precisionRules  = gov.precisionRules || _PRECISION_RULES;
  var _arch            = gov.arch           || _AB_ARCH;
  var _lpDoctrine      = gov.lpDoctrine     || '';
  var _lpSpine         = gov.lpSpine        || '';
  var _lpClaimScoping  = gov.lpClaimScoping || '';
  var _lifeStage       = gov.lifeStage      || '';
  return role + '\n\n' + _masterStory + _categoryPos + _brandPosition + _fiveApp + _sevenStep + _claimQuality + _voiceRules + _precisionRules + sD + _arch + sE + sF + sG + _phaseGuard + _compliance + _lifeStage + _lpDoctrine + _lpSpine + _lpClaimScoping;
}

// ── Governance compiler functions ─────────────────────────────────────────────

function _compileVoiceRulesBlock() {
  try {
    var rule = getBrandDoctrine('VOICE_FORBIDDEN_001');
    if (!rule || !rule.conditions) return _BRAND_VOICE_RULES;
    var c = rule.conditions;
    var out = '=== BRAND VOICE — NON-NEGOTIABLE RULES ===\n';
    if (Array.isArray(c.forbidden_words) && c.forbidden_words.length) {
      out += 'FORBIDDEN WORDS — never write any of these:\n';
      c.forbidden_words.forEach(function(w) { out += '  × ' + w + '\n'; });
      out += '\n';
    }
    if (Array.isArray(c.forbidden_figures) && c.forbidden_figures.length) {
      out += 'FORBIDDEN FIGURES/PHRASES — never use:\n';
      c.forbidden_figures.forEach(function(f) { out += '  × ' + f + '\n'; });
      out += '\n';
    }
    if (Array.isArray(c.banned_names) && c.banned_names.length) {
      out += 'BANNED NAMES — never use:\n';
      c.banned_names.forEach(function(n) { out += '  × ' + n + '\n'; });
      out += '\n';
    }
    var req = getBrandDoctrine('VOICE_REQUIRED_001');
    if (req && req.conditions) {
      var r = req.conditions;
      out += 'REQUIRED:\n';
      if (r.product_name)              out += '  ✓ Always write "' + r.product_name + '" — never "the app"\n';
      if (r.approved_savings)          out += '  ✓ Approved savings figure: ' + r.approved_savings + '\n';
      if (r.approved_waste)            out += '  ✓ Approved waste figure: ' + r.approved_waste + '\n';
      if (r.approved_time)             out += '  ✓ Approved speed figure: ' + r.approved_time + '\n';
      if (r.approved_founding_discount) out += '  ✓ Founding discount: ' + r.approved_founding_discount + ' — never 50% off\n';
      if (r.monthly_savings_note)      out += '  ✓ ' + r.monthly_savings_note + '\n';
      if (Array.isArray(r.required_phrases)) {
        r.required_phrases.forEach(function(p) { out += '  ✓ Use exact phrase: "' + p + '"\n'; });
      }
      out += '\n';
    }
    return out;
  } catch(e) {
    Logger.log('[_compileVoiceRulesBlock] fallback: ' + e.message);
    return _BRAND_VOICE_RULES;
  }
}

function _compileEmotionalArcBlock(icpCode) {
  try {
    var stratId = (icpCode && icpCode !== '')
      ? 'EMOTIONAL_ARC_' + icpCode.toUpperCase()
      : 'EMOTIONAL_ARC_001';
    var strat = getCampaignStrategy(stratId);
    if (!strat || !strat.value || !Array.isArray(strat.value.stages)) {
      strat = getCampaignStrategy('EMOTIONAL_ARC_001');
    }
    if (!strat || !strat.value || !Array.isArray(strat.value.stages)) return _EMOTIONAL_ARC_COPY;
    var v   = strat.value;
    var out = '=== EMOTIONAL ARC — MATCH THE EXACT STAGE EMOTION IN YOUR COPY ===\n';
    if (v.icp_name)        out += 'ICP: ' + v.icp_name + '\n';
    if (v.primary_trigger) out += 'Entry trigger: ' + v.primary_trigger + '\n';
    var labels = { hook:'Post 1 — HOOK', problem:'Post 2 — PROBLEM', agitate:'Post 3 — AGITATE',
                   solve:'Post 4 — SOLVE', value:'Post 5 — VALUE', proof:'Post 6 — PROOF', cta:'Post 7 — CTA' };
    v.stages.forEach(function(s) {
      var label = labels[s.stage] || s.stage.toUpperCase();
      out += label + ': ' + s.emotion.toUpperCase().replace(/_/g, ' ') + ' — ' + (s.trigger_note || '') + '\n';
    });
    return out + '\n';
  } catch(e) {
    Logger.log('[_compileEmotionalArcBlock] fallback: ' + e.message);
    return _EMOTIONAL_ARC_COPY;
  }
}

function _compileClaimQualityBlock() {
  try {
    var rule = getBrandDoctrine('CLAIM_QUALITY_001');
    if (!rule || !rule.conditions) return _CLAIM_QUALITY_COPY;
    var c   = rule.conditions;
    var out = '=== CLAIM QUALITY RULES — EVERY CLAIM MUST PASS THIS STANDARD ===\n';
    if (c.formula)          out += 'Formula: ' + c.formula + '\n';
    if (c.the_test)         out += 'Test: ' + c.the_test + '\n';
    if (c.emotion_approach) out += 'Emotion approach: ' + c.emotion_approach + '\n';
    if (Array.isArray(c.strong_claim_rules) && c.strong_claim_rules.length) {
      out += 'Strong claims are:\n';
      c.strong_claim_rules.forEach(function(r) { out += '  ✓ ' + r + '\n'; });
    }
    if (Array.isArray(c.reject_if) && c.reject_if.length) {
      out += 'Reject if the claim:\n';
      c.reject_if.forEach(function(r) { out += '  ✗ ' + r + '\n'; });
    }
    if (Array.isArray(c.examples) && c.examples.length) {
      out += 'Examples:\n';
      c.examples.forEach(function(e) {
        out += '  Weak:   ' + e.weak + '\n';
        out += '  Strong: ' + e.strong + '\n';
      });
    }
    return out + '\n';
  } catch(e) {
    Logger.log('[_compileClaimQualityBlock] fallback: ' + e.message);
    return _CLAIM_QUALITY_COPY;
  }
}

function _compileBrandPositionBlock() {
  try {
    var strat = getCampaignStrategy('BRAND_POSITION_001');
    if (!strat || !strat.value) return _BRAND_POSITION_COPY;
    var v = strat.value;
    var out = '=== BRAND POSITION — GOVERNING FRAME. EVERY PIECE OF COPY ANSWERS TO THIS. ===\n';
    if (v.tagline)      out += 'Tagline:     "' + v.tagline + '"\n';
    if (v.brand_truth)  out += 'Brand Truth: "' + v.brand_truth + '"\n';
    if (v.position)     out += 'Position:    ' + v.position + '\n';
    if (v.contrast)     out += 'Contrast:    ' + v.contrast + '\n';
    if (Array.isArray(v.life_stage_sequence) && v.life_stage_sequence.length) {
      out += 'Life stages this product serves:\n  ' + v.life_stage_sequence.join(' → ') + '\n';
    }
    if (Array.isArray(v.copy_rules) && v.copy_rules.length) {
      out += 'Copy rules:\n';
      v.copy_rules.forEach(function(r) { out += '  ' + r + '\n'; });
    }
    return out + '\n';
  } catch(e) {
    Logger.log('[_compileBrandPositionBlock] fallback: ' + e.message);
    return _BRAND_POSITION_COPY;
  }
}

function _compileStageEmotionsMap(icpCode) {
  try {
    var stratId = (icpCode && icpCode !== '')
      ? 'EMOTIONAL_ARC_' + icpCode.toUpperCase()
      : 'EMOTIONAL_ARC_001';
    var strat = getCampaignStrategy(stratId);
    if (!strat || !strat.value || !Array.isArray(strat.value.stages)) {
      strat = getCampaignStrategy('EMOTIONAL_ARC_001');
    }
    if (!strat || !strat.value || !Array.isArray(strat.value.stages)) return _STAGE_EMOTIONS;
    var map = {};
    strat.value.stages.forEach(function(s) { map[s.stage] = s.emotion; });
    return map;
  } catch(e) {
    Logger.log('[_compileStageEmotionsMap] fallback: ' + e.message);
    return _STAGE_EMOTIONS;
  }
}

function _compilePhoneRuleBlock() {
  try {
    var rule = getBrandDoctrine('PHONE_VISIBILITY_001');
    if (!rule || !rule.conditions) return null;
    var c = rule.conditions;
    var out = '=== PHONE REVEAL RULE (NON-NEGOTIABLE) ===\n';
    if (c.posts_1_3 && c.posts_1_3.phone_visible === false) {
      out += 'Posts 1-3 (Hook · Problem · Agitate): NO PHONE — the problem must feel real before the solution appears.\n';
    }
    if (c.post_4 && c.post_4.phone_visible === true) {
      out += 'Post 4 (Solve): PHONE APPEARS — first reveal. Phone shows app solving the exact problem from Post 3.\n';
    }
    if (c.posts_5_7 && c.posts_5_7.phone_visible === true) {
      out += 'Posts 5-7 (Value · Proof · CTA): PHONE VISIBLE — phone present but not the hero. Show outcomes.\n';
    }
    return out + '\n';
  } catch(e) {
    Logger.log('[_compilePhoneRuleBlock] fallback: ' + e.message);
    return null;
  }
}

function _compileComplianceBlock(themeData) {
  try {
    const noTestim  = getBrandDoctrine('NO_INVENTED_TESTIMONIALS_001');
    const shame     = getBrandDoctrine('SHAME_LANGUAGE_001');
    const themeFood = getBrandDoctrine('THEME_FOOD_RULE_001');
    const gender    = getBrandDoctrine('IMAGE_GENDER_RULE_001');

    const lines = [];

    const activeClaims = getApprovedClaims(); // reads ApprovedClaims tab; already filtered to approved: true
    if (activeClaims.length > 0) {
      lines.push('COMPLIANCE — APPROVED CLAIMS (hard rule):');
      lines.push('Use ONLY these exact figures. Never round. Never invent.');
      activeClaims.forEach(function(c) {
        lines.push('  • ' + c.claim_type + ': "' + c.exact_wording + '"');
      });
      // forbidden list stays in BrandDoctrine — changing it is a deliberate governance action
      const claimsRule = getBrandDoctrine('APPROVED_CLAIMS_001');
      if (claimsRule && claimsRule.conditions && claimsRule.conditions.forbidden) {
        lines.push('NEVER write: ' + claimsRule.conditions.forbidden.join(' · '));
      }
      lines.push('');
    }

    if (noTestim && noTestim.active) {
      const c = noTestim.conditions;
      lines.push('COMPLIANCE — NO INVENTED TESTIMONIALS (hard rule):');
      lines.push('Never write fictional names, locations, or attributed quotes.');
      if (c.forbidden_patterns && Array.isArray(c.forbidden_patterns)) {
        lines.push('Forbidden patterns: ' + c.forbidden_patterns.join(' · '));
      }
      lines.push('Allowed: aggregate claims only — e.g. "2,400+ families on the waitlist".');
      lines.push('');
    }

    if (shame && shame.active) {
      const c = shame.conditions;
      lines.push('COMPLIANCE — NO SHAME LANGUAGE (hard rule):');
      lines.push('The system is broken. It is never her fault. Never blame the person.');
      if (c.forbidden_words && Array.isArray(c.forbidden_words)) {
        lines.push('Never write: ' + c.forbidden_words.join(', '));
      }
      if (c.reframe) {
        lines.push('Always reframe as: ' + c.reframe);
      }
      lines.push('');
    }

    if (themeFood && themeFood.active && themeData) {
      const c = themeFood.conditions;
      const food = themeData.food_type || 'theme food';
      lines.push('COMPLIANCE — THEME FOOD RULE (hard rule):');
      lines.push('Campaign theme food: ' + food);
      lines.push('From Post ' + (c.appears_from_post || 4) + ' onward — this food MUST appear visibly in every image brief.');
      lines.push('Posts 1-3 are exempt.');
      lines.push('');
    }

    if (gender && gender.active) {
      const c = gender.conditions;
      lines.push('COMPLIANCE — IMAGE GENDER RULE (hard rule):');
      lines.push('If copy describes a woman, image subject must be a woman. Always.');
      if (c.subject_word_position) {
        lines.push('Gender must appear in first ' + c.subject_word_position + ' words of every image brief SUBJECT line.');
      }
      lines.push('');
    }

    return lines.length > 0
      ? '=== COMPLIANCE RULES (NON-NEGOTIABLE) ===\n' + lines.join('\n')
      : '';

  } catch(e) {
    Logger.log('[_compileComplianceBlock] Error: ' + e.message);
    return '';
  }
}

function _compilePhaseGuardBlock() {
  try {
    var rule = getBrandDoctrine('PHASE_GUARD_001');
    if (!rule || !rule.conditions) return null;
    var c = rule.conditions;
    var out = '=== PHASE GUARD — LAUNCH PHASE: ' + (c.current_phase || '') + ' ===\n';
    if (c.launch_date) out += 'Launch date: ' + c.launch_date + '\n';
    if (Array.isArray(c.allowed_ctas) && c.allowed_ctas.length) {
      out += 'Allowed CTAs: ' + c.allowed_ctas.join(' · ') + '\n';
    }
    if (Array.isArray(c.restricted_elements) && c.restricted_elements.length) {
      out += 'Restricted (do not include): ' + c.restricted_elements.join(' · ') + '\n';
    }
    return out + '\n';
  } catch(e) {
    Logger.log('[_compilePhaseGuardBlock] fallback: ' + e.message);
    return null;
  }
}

// ── LP Doctrine compile functions ────────────────────────────────────────────

// Reads LP_DOCTRINE_001 from CampaignStrategy. Returns a formatted prompt block
// with the 8-section arc, 7 persuasion laws, and emotional state map.
function _compileLPDoctrineBlock() {
  try {
    var strat = getCampaignStrategy('LP_DOCTRINE_001');
    if (!strat || !strat.value) return null;
    var v = strat.value;
    var out = '=== LP GENERATION DOCTRINE — THE LANDING PAGE IS THE SOURCE OF TRUTH ===\n';
    if (Array.isArray(v.sections)) {
      out += 'LP Sections (in order): ' + v.sections.join(' → ') + '\n';
    }
    if (Array.isArray(v.laws)) {
      out += '\nPersuasion Laws (non-negotiable):\n';
      v.laws.forEach(function(law, i) {
        out += (i + 1) + '. ' + String(law).replace(/_/g, ' ') + '\n';
      });
    }
    if (v.emotional_map) {
      out += '\nEmotional State Map:\n';
      var sects = v.sections || Object.keys(v.emotional_map);
      sects.forEach(function(sec) {
        var em = v.emotional_map[sec];
        if (em) out += '  ' + sec.toUpperCase() + ': ' + em.entry + ' → ' + em.exit + '\n';
      });
    }
    if (v.section_word_targets) {
      out += '\nTarget word counts per section: ';
      out += Object.keys(v.section_word_targets).map(function(k) {
        return k + '=' + v.section_word_targets[k];
      }).join(' · ') + '\n';
    }
    return out + '\n';
  } catch(e) {
    Logger.log('[_compileLPDoctrineBlock] error: ' + e.message);
    return null;
  }
}

// Reads lp_campaign_spine_json from CampaignBriefs for the given campaign.
// Supports variant-keyed format {"a":{...},"b":{...}} or direct {"hook":{...},...}.
// Returns a formatted prompt block, or the sentinel 'LP_SPINE_MISSING' when absent.
function _compileLPSpineBlock(campaignId, lpVariant) {
  try {
    if (!campaignId) return '';
    var brief = getCampaignBriefs(campaignId);
    if (!brief) return 'LP_SPINE_MISSING';
    var spineRaw = brief.lp_campaign_spine_json || '';
    if (!spineRaw) return 'LP_SPINE_MISSING';
    var spineData = {};
    try { spineData = JSON.parse(spineRaw); } catch(e) { return 'LP_SPINE_MISSING'; }
    // Resolve variant: {"a":{...},"b":{...}} or direct section map
    var spine = spineData;
    if (spineData.a || spineData.b) {
      var v = String(lpVariant || 'a').toLowerCase();
      spine = spineData[v] || spineData.a || {};
    }
    var sections = ['hook','problem','agitate','solve','value','proof','cta','urgency'];
    var hasAll = sections.every(function(s) { return spine[s] && spine[s].headline; });
    if (!hasAll) return 'LP_SPINE_MISSING';
    var out = '=== LP SPINE — THIS CAMPAIGN\'S ACTUAL LANDING PAGE CONTENT ===\n';
    out += 'Campaign: ' + campaignId + '\n\n';
    sections.forEach(function(sec) {
      var s = spine[sec];
      if (!s) return;
      out += '[' + sec.toUpperCase() + ']\n';
      if (s.headline)     out += 'Headline: ' + s.headline + '\n';
      if (s.subheadline)  out += 'Subheadline: ' + s.subheadline + '\n';
      if (s.body_copy)    out += 'Body: ' + s.body_copy + '\n';
      if (s.emotional_beat) out += 'Emotional beat: ' + s.emotional_beat + '\n';
      if (s.cta_button)   out += 'CTA: ' + s.cta_button + '\n';
      if (s.urgency_line) out += 'Urgency: ' + s.urgency_line + '\n';
      out += '\n';
    });
    return out;
  } catch(e) {
    Logger.log('[_compileLPSpineBlock] error: ' + e.message);
    return 'LP_SPINE_MISSING';
  }
}

// Reads CLAIM_SCOPING_001 to get permitted claim types for an LP section, then
// filters ApprovedClaims to return only claims scoped to that section.
// Returns a formatted block of approved wording, or empty string if no claims found.
function _compileClaimScopingBlock(lpSection, icpCode) {
  try {
    if (!lpSection) return '';
    var scoping = getCampaignStrategy('CLAIM_SCOPING_001');
    var permittedTypes = (scoping && scoping.value && scoping.value.section_claim_map)
      ? (scoping.value.section_claim_map[lpSection] || [])
      : [];
    if (!permittedTypes.length) return '';

    var allClaims = getApprovedClaims ? getApprovedClaims() : [];
    if (!allClaims || !allClaims.length) return '';

    var scoped = allClaims.filter(function(c) {
      if (!c.approved) return false;
      if (permittedTypes.indexOf(c.claim_type) === -1) return false;
      return true;
    });
    if (!scoped.length) return '';

    var out = '=== APPROVED CLAIMS — LP SECTION: ' + lpSection.toUpperCase() + ' ===\n';
    out += 'Permitted claim types for this section: ' + permittedTypes.join(', ') + '\n';
    out += 'Use exact wording only. Do not paraphrase.\n\n';
    scoped.forEach(function(c) {
      out += '• [' + c.claim_type + '] ' + c.exact_wording + '\n';
    });
    return out + '\n';
  } catch(e) {
    Logger.log('[_compileClaimScopingBlock] error: ' + e.message);
    return '';
  }
}

// ── generateLPSpine ───────────────────────────────────────────────────────────
// Generates all 8 LP sections for a campaign via Claude API and stores the result
// in CampaignBriefs.lp_campaign_spine_json.
// Options: { lp_variant: 'a'|'b'|'both' }  — 'both' runs A then B and merges.
// Returns: { ok, campaign_id, lp_variant, spine, chars_stored }

function generateLPSpine(campaignId, options) {
  if (!campaignId) return { ok: false, error: 'campaign_id required' };
  options = options || {};
  var lpVariant = String(options.lp_variant || 'a').toLowerCase();

  try {
    var props  = PropertiesService.getScriptProperties();
    var apiKey = props.getProperty('ANTHROPIC_API_KEY');
    if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set' };

    // 1. Load campaign brief
    var brief = getCampaignBriefs(campaignId);
    if (!brief) return { ok: false, error: 'Campaign brief not found: ' + campaignId };

    // 2. Resolve ICP code — options.icp_code overrides; otherwise resolve from brief
    var icpCode = options.icp_code
      ? String(options.icp_code)
      : _resolveIcpCode(brief.icp_code || '', { lp_variant: lpVariant });
    // LP inventory fallback when brief icp_code is generic (no pipe separator)
    if (!icpCode || icpCode === brief.icp_code) {
      var _lpSlug = lpVariant === 'b' ? (brief.lp_slug_b || '') : (brief.lp_slug_a || '');
      if (_lpSlug) {
        try {
          var _lpRow = getLPInventoryBySlug(_lpSlug);
          if (_lpRow && _lpRow.icp_code && _lpRow.icp_code !== brief.icp_code) {
            icpCode = _lpRow.icp_code;
          }
        } catch(e) {}
      }
    }

    // 3. Load ICP + theme
    var icp   = _getIcpRow(icpCode)        || {};
    var theme = _getThemeRow(brief.theme || '') || {};

    // 4. Build system prompt from LP Doctrine
    var doctrineBlock = _compileLPDoctrineBlock() || '';
    var systemPrompt =
      'You are the easyChef Pro landing page architect. ' +
      'Your job is to generate a complete LP spine — all 8 sections — ' +
      'that will serve as the source of truth for every social post, email, and video in this campaign.\n\n' +
      doctrineBlock;

    // 5. Gather scoped claims per section
    var scoping = getCampaignStrategy('CLAIM_SCOPING_001');
    var sectionClaimMap = (scoping && scoping.value && scoping.value.section_claim_map) || {};
    var allClaims = _getApprovedClaimsRows() || [];
    var sectionClaims = {};
    ['hook','problem','agitate','solve','value','proof','cta','urgency'].forEach(function(sec) {
      var permitted = sectionClaimMap[sec] || [];
      sectionClaims[sec] = allClaims
        .filter(function(c) { return c.approved && permitted.indexOf(c.claim_type) > -1; })
        .map(function(c) { return c.exact_wording || c.claim || ''; })
        .filter(Boolean).slice(0, 3);
    });

    // 6. Build user message
    var userMsg =
      '=== CAMPAIGN: ' + campaignId + ' ===\n' +
      'LP variant: ' + lpVariant + '\n' +
      'ICP: ' + icpCode + '\n';
    if (icp.primary_pain)    userMsg += 'Primary pain: ' + icp.primary_pain + '\n';
    if (icp.value_trigger)   userMsg += 'Value trigger: ' + icp.value_trigger + '\n';
    if (icp.loss_aversion)   userMsg += 'Loss aversion: ' + icp.loss_aversion + '\n';
    if (icp.message_hierarchy) userMsg += 'Message hierarchy: ' + icp.message_hierarchy + '\n';
    if (brief.campaign_angle) userMsg += 'Campaign angle: ' + brief.campaign_angle + '\n';
    if (brief.urgency_trigger) userMsg += 'Urgency trigger: ' + brief.urgency_trigger + '\n';
    if (theme.theme_name)    userMsg += 'Theme: ' + theme.theme_name + '\n';
    if (theme.hook_angle)    userMsg += 'Hook angle: ' + theme.hook_angle + '\n';
    userMsg += '\n=== APPROVED CLAIMS BY SECTION (use exact wording only) ===\n';
    Object.keys(sectionClaims).forEach(function(sec) {
      if (sectionClaims[sec].length) {
        userMsg += sec.toUpperCase() + ': ' + sectionClaims[sec].join(' | ') + '\n';
      }
    });
    userMsg +=
      '\n=== OUTPUT REQUIREMENTS ===\n' +
      'Return ONLY valid JSON. No markdown. No explanation.\n' +
      'Schema (all 8 sections required):\n' +
      '{\n' +
      '  "hook":    { "headline": "H1 — 8 words max", "subheadline": "one line expands the hook", "body_copy": "30 words — names the moment, no solution", "emotional_beat": "frustrated_or_resigned → curious_and_seen", "approved_claims": ["exact wording"] },\n' +
      '  "problem": { "headline": "H2 — names the pain exactly", "subheadline": "one line", "body_copy": "60 words — specific, not general", "emotional_beat": "curious_and_seen → validated_and_named", "approved_claims": [] },\n' +
      '  "agitate": { "headline": "H2 — makes the cost real", "body_copy": "80 words — dollar figures, no shame", "emotional_beat": "validated_and_named → urgent_and_motivated", "approved_claims": [] },\n' +
      '  "solve":   { "headline": "H2 — one sentence intro of easyChef Pro", "subheadline": "one line", "body_copy": "60 words", "emotional_beat": "urgent_and_motivated → hopeful_and_curious", "approved_claims": [] },\n' +
      '  "value":   { "headline": "H2 — outcome not feature", "subheadline": "one line", "body_copy": "120 words — specific outcomes", "emotional_beat": "hopeful_and_curious → excited_and_ready", "approved_claims": [] },\n' +
      '  "proof":   { "headline": "H2 — social proof", "body_copy": "100 words — validated claims only, no invented testimonials", "emotional_beat": "excited_and_ready → convinced_and_trusting", "approved_claims": [] },\n' +
      '  "cta":     { "headline": "H2 — outcome-framed", "subheadline": "one line", "body_copy": "40 words", "cta_button": "under 6 words", "emotional_beat": "convinced_and_trusting → committed_and_decisive", "approved_claims": [] },\n' +
      '  "urgency": { "headline": "H3 — why act now", "urgency_line": "one line — scarcity or time", "cta_button": "under 6 words", "emotional_beat": "committed_and_decisive → acting_now", "approved_claims": [] }\n' +
      '}\n' +
      'Generate the LP spine now for ' + icpCode + ' (variant ' + lpVariant + ').';

    // 7. Call Claude API
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMsg }]
      }),
      muteHttpExceptions: true
    });

    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply) {
      var errMsg = data.error ? (typeof data.error === 'object' ? data.error.message : String(data.error)) : 'empty response';
      return { ok: false, error: errMsg };
    }

    // 8. Parse the spine JSON
    var spineJson = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
    var spine = {};
    try { spine = JSON.parse(spineJson); } catch(e) {
      return { ok: false, error: 'JSON parse failed: ' + e.message, raw: reply.substring(0, 500) };
    }

    // Validate all 8 sections present
    var sections = ['hook','problem','agitate','solve','value','proof','cta','urgency'];
    var missing = sections.filter(function(s) { return !spine[s] || !spine[s].headline; });
    if (missing.length) {
      return { ok: false, error: 'Missing sections: ' + missing.join(', '), raw: reply.substring(0, 500) };
    }

    // 9. Read existing spine JSON and merge (so variant A and B are stored together)
    var existingBrief = getCampaignBriefs(campaignId);
    var existingSpineRaw = (existingBrief && existingBrief.lp_campaign_spine_json) || '';
    var existingSpine = {};
    if (existingSpineRaw) {
      try { existingSpine = JSON.parse(existingSpineRaw); } catch(e) {}
    }
    existingSpine[lpVariant] = spine;
    var newSpineJson = JSON.stringify(existingSpine);

    // 10. Write to CampaignBriefs
    setCampaignBrief({ id: campaignId, lp_campaign_spine_json: newSpineJson });

    Logger.log('[generateLPSpine] campaign=' + campaignId + ' variant=' + lpVariant +
               ' sections=' + sections.length + ' chars=' + newSpineJson.length);
    return {
      ok: true,
      campaign_id: campaignId,
      lp_variant: lpVariant,
      icp_code: icpCode,
      sections_generated: sections.length,
      chars_stored: newSpineJson.length,
      spine: spine
    };

  } catch(e) {
    Logger.log('[generateLPSpine] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── generateLoopCopy ─────────────────────────────────────────────────────────
// Generates 3 copy variants (A=pain_direct, B=social_proof, C=curiosity_tease)
// for a social post, each rooted in the post's LP spine section.
// Writes variants to SocialPosts.design_brief.loop_variants and updates
// lp_section_source / loop_stage / emotional_state / emotional_destination fields.
// Options: { lp_variant: 'a'|'b', platform: 'Facebook'|..., overwrite: true }

function generateLoopCopy(campaignId, postId, options) {
  if (!campaignId) return { ok: false, error: 'campaign_id required' };
  if (!postId)     return { ok: false, error: 'post_id required' };
  options = options || {};

  try {
    var props  = PropertiesService.getScriptProperties();
    var apiKey = props.getProperty('ANTHROPIC_API_KEY');
    if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set' };

    // 1. Load social post row
    var post = null;
    var allPosts = getSocialPosts(campaignId);
    for (var i = 0; i < allPosts.length; i++) {
      if (allPosts[i].id === postId) { post = allPosts[i]; break; }
    }
    if (!post) return { ok: false, error: 'Post not found: ' + postId };

    // 2. Determine LP variant and section source
    var lpVariant = options.lp_variant || post.lp_variant || 'a';
    var platform  = options.platform   || post.platform   || 'Facebook';
    var db = {};
    try { db = JSON.parse(post.design_brief || '{}'); } catch(e) {}

    // Day → LP section mapping
    var day = parseInt(db.day || db.post_number || 1);
    var lpSection = 'hook';
    if      (day <= 5)  lpSection = 'hook';
    else if (day <= 10) lpSection = 'problem';
    else if (day <= 15) lpSection = 'agitate';
    else if (day <= 20) lpSection = 'solve';
    else if (day <= 25) lpSection = 'value';
    else if (day <= 30) lpSection = 'proof';
    else                lpSection = 'cta';

    // Section → loop_stage mapping
    var loopStageMap = { hook:'awareness', problem:'awareness', agitate:'consideration',
                         solve:'consideration', value:'consideration', proof:'decision',
                         cta:'decision', urgency:'decision' };
    var loopStage = loopStageMap[lpSection] || 'awareness';

    // 3. Load LP spine for this variant
    var brief = getCampaignBriefs(campaignId);
    if (!brief) return { ok: false, error: 'Campaign brief not found' };
    var spineRaw = brief.lp_campaign_spine_json || '';
    var spineData = {};
    try { spineData = JSON.parse(spineRaw); } catch(e) {}
    var spine = spineData[lpVariant] || spineData.a || spineData || {};
    var spineSection = spine[lpSection] || {};

    // 4. Load ICP + loop schema
    var icpCode = options.icp_code
      ? String(options.icp_code)
      : _resolveIcpCode(brief.icp_code || '', { lp_variant: lpVariant });
    var icp = _getIcpRow(icpCode) || {};

    var loopSchema = getCampaignStrategy('LOOP_COPY_SCHEMA_001');
    var variants = (loopSchema && loopSchema.value && loopSchema.value.variants_per_post) || [
      { variant: 'a', angle: 'pain_direct'     },
      { variant: 'b', angle: 'social_proof'    },
      { variant: 'c', angle: 'curiosity_tease' }
    ];

    // 5. Build prompt
    var systemPrompt =
      'You are the easyChef Pro social copywriter generating loop copy variants. ' +
      'Each variant must be rooted in the specific LP section listed. ' +
      'Return only the JSON object requested. No markdown. No explanation.';

    var userMsg =
      '=== POST: ' + postId + ' | Platform: ' + platform + ' | LP Section: ' + lpSection.toUpperCase() + ' ===\n' +
      'Campaign: ' + campaignId + ' | LP Variant: ' + lpVariant + ' | ICP: ' + icpCode + '\n' +
      'Loop stage: ' + loopStage + '\n\n' +
      '=== LP SPINE — ' + lpSection.toUpperCase() + ' SECTION ===\n';
    if (spineSection.headline)    userMsg += 'LP Headline: ' + spineSection.headline + '\n';
    if (spineSection.body_copy)   userMsg += 'LP Body: ' + spineSection.body_copy + '\n';
    if (spineSection.emotional_beat) userMsg += 'Emotional arc: ' + spineSection.emotional_beat + '\n';
    if (icp.primary_pain)    userMsg += '\nICP Primary pain: '   + icp.primary_pain + '\n';
    if (icp.value_trigger)   userMsg += 'ICP Value trigger: '    + icp.value_trigger + '\n';
    if (icp.loss_aversion)   userMsg += 'ICP Loss aversion: '    + icp.loss_aversion + '\n';
    userMsg +=
      '\n=== GENERATE 3 VARIANTS ===\n' +
      'variant_a — pain_direct: opens on ICP pain point, drives to LP section\n' +
      'variant_b — social_proof: opens with proof or outcome, connects to LP section\n' +
      'variant_c — curiosity_tease: opens with curiosity hook, resolves at LP section\n\n' +
      'Platform: ' + platform + '. Keep hooks under 10 words. Body copy 50-80 words. CTA under 8 words.\n\n' +
      'Return JSON:\n' +
      '{\n' +
      '  "lp_section_source": "' + lpSection + '",\n' +
      '  "loop_stage": "' + loopStage + '",\n' +
      '  "variants": [\n' +
      '    { "variant": "a", "angle": "pain_direct",     "hook": "...", "body_copy": "...", "cta": "...", "emotional_state": "' + (spineSection.emotional_beat||'').split('→')[0].trim() + '", "emotional_destination": "' + (spineSection.emotional_beat||'').split('→')[1].trim() + '", "lp_headline_connection": "..." },\n' +
      '    { "variant": "b", "angle": "social_proof",    "hook": "...", "body_copy": "...", "cta": "...", "emotional_state": "...", "emotional_destination": "...", "lp_headline_connection": "..." },\n' +
      '    { "variant": "c", "angle": "curiosity_tease", "hook": "...", "body_copy": "...", "cta": "...", "emotional_state": "...", "emotional_destination": "...", "lp_headline_connection": "..." }\n' +
      '  ]\n' +
      '}';

    // 6. Call Claude API
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      payload: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMsg }]
      }),
      muteHttpExceptions: true
    });

    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply) {
      var _e = data.error ? (typeof data.error === 'object' ? data.error.message : String(data.error)) : 'empty response';
      return { ok: false, error: _e };
    }

    // 7. Parse result
    var jsonStr = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
    var result = {};
    try { result = JSON.parse(jsonStr); } catch(e) {
      return { ok: false, error: 'JSON parse failed: ' + e.message, raw: reply.substring(0, 500) };
    }

    // 8. Update the SocialPost row
    db.loop_variants       = result.variants || [];
    db.lp_section_source   = result.lp_section_source   || lpSection;
    db.loop_stage          = result.loop_stage           || loopStage;
    var primaryVariant     = (result.variants || [])[0] || {};
    setSocialPost({
      id: postId,
      lp_section_source:      result.lp_section_source  || lpSection,
      loop_stage:             result.loop_stage          || loopStage,
      emotional_state:        primaryVariant.emotional_state        || '',
      emotional_destination:  primaryVariant.emotional_destination  || '',
      lp_headline_connection: primaryVariant.lp_headline_connection || '',
      design_brief:           JSON.stringify(db)
    });

    Logger.log('[generateLoopCopy] post=' + postId + ' section=' + lpSection +
               ' variants=' + (result.variants||[]).length);
    return {
      ok: true,
      post_id:          postId,
      campaign_id:      campaignId,
      lp_section_source: result.lp_section_source || lpSection,
      loop_stage:        result.loop_stage         || loopStage,
      variants_count:    (result.variants||[]).length,
      variants:          result.variants || []
    };

  } catch(e) {
    Logger.log('[generateLoopCopy] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── NEW governance compilers — previously hardcoded constants ─────────────────
// Each reads from BrandDoctrine or CampaignStrategy; falls back to the hardcoded
// constant so nothing breaks before sheet rows are added.

function _compileMasterStoryBlock() {
  try {
    var strat = getCampaignStrategy('MASTER_STORY_001');
    if (!strat || !strat.value) return _MASTER_STORY;
    var v = strat.value;
    var out = '=== MASTER STORY — READ THIS FIRST. EVERY WORD YOU WRITE CONNECTS BACK TO THIS. ===\n';
    if (v.story)           out += '"' + v.story + '"\n';
    if (v.narrative_spine) out += v.narrative_spine + '\n';
    if (v.instruction)     out += v.instruction + '\n';
    return out + '\n';
  } catch(e) {
    Logger.log('[_compileMasterStoryBlock] fallback: ' + e.message);
    return _MASTER_STORY;
  }
}

function _compileCategoryPositionBlock() {
  try {
    var strat = getCampaignStrategy('CATEGORY_POSITION_001');
    if (!strat || !strat.value) return _CATEGORY_POSITIONING;
    var v = strat.value;
    var out = '=== CATEGORY POSITIONING — HOW TO FRAME easyChef Pro ===\n';
    if (v.headline)   out += '"' + v.headline + '\n';
    if (v.contrast)   out += v.contrast + '\n';
    if (v.enemy)      out += v.enemy + '\n';
    if (v.never_rule) out += 'Never: ' + v.never_rule + '\n';
    return out + '\n';
  } catch(e) {
    Logger.log('[_compileCategoryPositionBlock] fallback: ' + e.message);
    return _CATEGORY_POSITIONING;
  }
}

function _compileFiveAppBlock() {
  try {
    var rule = getBrandDoctrine('FIVE_APP_REPLACEMENT_001');
    if (!rule || !rule.conditions) return _5_APP_REPLACEMENT;
    var c = rule.conditions;
    var out = '=== 5-APP REPLACEMENT (LOCKED) ===\n';
    out += 'easyChef Pro replaces five apps. Never "integrates with" — always "replaces".\n\n';
    if (Array.isArray(c.apps) && c.apps.length) {
      out += 'App replaced          → easyChef Pro feature:\n';
      c.apps.forEach(function(a) { out += a.app_name + '               → ' + a.feature_label + '\n'; });
      out += '\n';
    }
    if (c.shop_rule)     out += 'SHOP RULE: ' + c.shop_rule + '\n\n';
    if (c.optimize_rule) out += 'OPTIMIZE RULE: ' + c.optimize_rule + '\n\n';
    if (c.naming_rule)   out += c.naming_rule + '\n\n';
    if (c.phone_rule)    out += 'PHONE RULE IN COPY:\n' + c.phone_rule + '\n\n';
    return out;
  } catch(e) {
    Logger.log('[_compileFiveAppBlock] fallback: ' + e.message);
    return _5_APP_REPLACEMENT;
  }
}

function _compileSevenStepBlock() {
  try {
    var strat = getCampaignStrategy('SEVEN_STEP_FRAMEWORK_001');
    if (!strat || !strat.value || !Array.isArray(strat.value.steps)) return _7_STEP_FRAMEWORK;
    var v = strat.value;
    var out = '=== 7-STEP COPY FRAMEWORK — EVERY PIECE OF COPY FOLLOWS THIS EXACTLY ===\n';
    v.steps.forEach(function(s, i) {
      out += 'Step ' + (i + 1) + ' — ' + s.name.toUpperCase() + ': ' + s.description + '\n';
      if (s.kills) out += '  KILLS: ' + s.kills + '\n';
      if (s.works) out += '  WORKS: ' + s.works + '\n\n';
    });
    return out;
  } catch(e) {
    Logger.log('[_compileSevenStepBlock] fallback: ' + e.message);
    return _7_STEP_FRAMEWORK;
  }
}

function _compilePrecisionRulesBlock() {
  try {
    var rule = getBrandDoctrine('PRECISION_RULES_001');
    if (!rule || !rule.conditions) return _PRECISION_RULES;
    var c = rule.conditions;
    var out = '=== PRECISION RULES (LOCKED) ===\n';
    out += 'Use exact figures only — no rounding, no approximating, no softening:\n\n';
    if (Array.isArray(c.figures) && c.figures.length) {
      c.figures.forEach(function(f) {
        out += f.label + ': "' + f.exact + '"' + (f.never ? ' — NEVER ' + f.never : '') + '\n';
      });
      out += '\n';
    }
    if (c.cta_rule) out += 'CTA RULE: ' + c.cta_rule + '\n\n';
    return out;
  } catch(e) {
    Logger.log('[_compilePrecisionRulesBlock] fallback: ' + e.message);
    return _PRECISION_RULES;
  }
}

function _compileArchBlock() {
  try {
    var rule = getBrandDoctrine('ARCHITECTURE_001');
    if (!rule || !rule.conditions) return _AB_ARCH;
    var c = rule.conditions;
    var out = '=== ARCHITECTURE ===\n';
    if (Array.isArray(c.rules) && c.rules.length) {
      c.rules.forEach(function(r) { out += r + '\n'; });
    }
    return out + '\n';
  } catch(e) {
    Logger.log('[_compileArchBlock] fallback: ' + e.message);
    return _AB_ARCH;
  }
}

function _compileDesignBriefRulesBlock() {
  try {
    var rule = getBrandDoctrine('DESIGN_BRIEF_RULES_001');
    if (!rule || !rule.conditions) return null;
    var c = rule.conditions;
    var out = '=== BRAND RULES — NON-NEGOTIABLE ===\n';
    if (Array.isArray(c.rules) && c.rules.length) {
      c.rules.forEach(function(r, i) {
        out += (i + 1) + '. ' + r.label + ': ' + r.detail + '\n\n';
      });
    }
    return out;
  } catch(e) {
    Logger.log('[_compileDesignBriefRulesBlock] fallback: ' + e.message);
    return null;
  }
}

// ── Content validator ─────────────────────────────────────────────────────────

function validateGeneratedContent(asset, brief) {
  if (!asset) return { valid: true, violations: [] };
  var violations = [];
  var assetText = JSON.stringify(asset).toLowerCase();

  // VOICE_FORBIDDEN_001
  try {
    var voiceRule = getBrandDoctrine('VOICE_FORBIDDEN_001');
    if (voiceRule && voiceRule.conditions) {
      var c = voiceRule.conditions;
      (c.forbidden_words || []).forEach(function(w) {
        if (assetText.indexOf(w.toLowerCase()) > -1) {
          violations.push({ rule_id: 'VOICE_FORBIDDEN_001', found: w, location: 'generated_text' });
        }
      });
      (c.forbidden_figures || []).forEach(function(f) {
        if (assetText.indexOf(f.toLowerCase()) > -1) {
          violations.push({ rule_id: 'VOICE_FORBIDDEN_001', found: f, location: 'generated_text' });
        }
      });
      (c.banned_names || []).forEach(function(n) {
        if (assetText.indexOf(n.toLowerCase()) > -1) {
          violations.push({ rule_id: 'VOICE_FORBIDDEN_001', found: n, location: 'generated_text' });
        }
      });
    }
  } catch(e) { Logger.log('[validateGeneratedContent] VOICE_FORBIDDEN_001 check error: ' + e.message); }

  // Phone visibility for social posts
  if (brief && (brief.channel === 'Instagram' || brief.channel === 'Pinterest' ||
      brief.channel === 'TikTok' || brief.channel === 'Facebook')) {
    var postNum = brief.post_number || brief.postNum || 0;
    try {
      var phoneRule = getBrandDoctrine('PHONE_VISIBILITY_001');
      if (phoneRule && phoneRule.conditions) {
        var pc = phoneRule.conditions;
        if (postNum >= 1 && postNum <= 3 && pc.posts_1_3 && pc.posts_1_3.phone_visible === false) {
          var imageBrief = String(asset.image_brief || asset.design_brief || '').toLowerCase();
          if (imageBrief.indexOf('phone') > -1 || imageBrief.indexOf('app screen') > -1) {
            violations.push({ rule_id: 'PHONE_VISIBILITY_001', found: 'phone reference in posts 1-3', location: 'image_brief' });
          }
        }
      }
    } catch(e) { Logger.log('[validateGeneratedContent] PHONE_VISIBILITY_001 check error: ' + e.message); }
  }

  var valid = violations.length === 0;
  if (!valid) {
    Logger.log('[validateGeneratedContent] ' + violations.length + ' violation(s): ' + JSON.stringify(violations));
  }
  return { valid: valid, violations: violations };
}

/**
 * Returns a complete system prompt. Reads ICP, Theme, CcSettings, and
 * ApprovedClaims from the sheet, then delegates to _buildMasterPrompt.
 * type: 'social_post_hook' | 'social_post_problem' | 'social_post_agitate' |
 *       'social_post_solve' | 'social_post_value' | 'social_post_proof' |
 *       'social_post_cta' | 'lp_full' | 'email_full' | 'seo' |
 *       'social_post' | 'landing_page' | 'email' | 'image_prompt' (backward-compat)
 */
function getMasterSystemPrompt(type, context) {
  context = context || {};
  Logger.log('[MASTER PROMPT] type=' + type + ' icp=' + (context.icp_code || context.icp || '') +
    ' theme_id=' + (context.theme_id || context.theme || '') + ' stage=' + (context.stage || ''));

  // image_prompt: story + visual anchors only — no sheet reads needed
  if (type === 'image_prompt') {
    var _vb = '';
    if (context.image_mood_hook || context.image_mood_cta || context.theme_food) {
      _vb = '=== VISUAL ANCHORS ===\n' +
        (context.image_mood_hook ? 'HOOK: ' + context.image_mood_hook + '\n' : '') +
        (context.image_mood_cta  ? 'CTA: '  + context.image_mood_cta  + '\n' : '') +
        (context.theme_food      ? 'FOOD: ' + context.theme_food       + '\n' : '') + '\n';
    }
    return _buildStoryContextBlock(context) + _vb;
  }

  // Resolve per-post ICP — handles compound codes like 'super_mom_money|super_mom_time'
  var _rawIcpCode = context.icp_code || context.icp || '';
  var _icpCode    = _resolveIcpCode(_rawIcpCode, context);
  var icp         = _getIcpRow(_icpCode);
  var theme       = _getThemeRow(context.theme_id || context.theme || '');

  // LP Doctrine spine gate — hard blocks asset generation if spine not generated yet.
  // Only fires when campaign_id is explicitly in context (backwards-compatible).
  var _lpDoctrineBlock   = _compileLPDoctrineBlock();
  var _lpSpineBlock      = '';
  var _lpClaimScopingBlock = '';
  if (context.campaign_id) {
    var _spineResult = _compileLPSpineBlock(context.campaign_id, context.lp_variant);
    if (_spineResult === 'LP_SPINE_MISSING') {
      Logger.log('[getMasterSystemPrompt] LP_SPINE_MISSING for campaign ' + context.campaign_id +
                 ' type=' + type + ' — run generate_lp_spine first');
      return 'LP_SPINE_MISSING:' + context.campaign_id;
    }
    _lpSpineBlock = _spineResult;
    var _lpSectionForScoping = context.lp_section || context.stage || '';
    if (_lpSectionForScoping) {
      _lpClaimScopingBlock = _compileClaimScopingBlock(_lpSectionForScoping, _icpCode);
    }
  }

  // LifeStages — resolve for this ICP and inject lifecycle section context
  var _lifeStageBlock = _compileLifeStageBlock(_icpCode, context.life_stage_id || '');

  // Compile governance blocks from tabs (fall back to hardcoded constants if tabs unavailable)
  var governance = {
    claimQuality:    _compileClaimQualityBlock(),
    brandPosition:   _compileBrandPositionBlock(),
    voiceRules:      _compileVoiceRulesBlock(),
    emotionalArc:    _compileEmotionalArcBlock(_icpCode),
    stageEmotions:   _compileStageEmotionsMap(_icpCode),
    phoneRule:       _compilePhoneRuleBlock(),
    phaseGuard:      _compilePhaseGuardBlock(),
    compliance:      _compileComplianceBlock(context.themeData || null),
    masterStory:     _compileMasterStoryBlock(),
    categoryPos:     _compileCategoryPositionBlock(),
    fiveApp:         _compileFiveAppBlock(),
    sevenStep:       _compileSevenStepBlock(),
    precisionRules:  _compilePrecisionRulesBlock(),
    arch:            _compileArchBlock(),
    designBriefRules:_compileDesignBriefRulesBlock(),
    lpDoctrine:      _lpDoctrineBlock    || '',
    lpSpine:         _lpSpineBlock       || '',
    lpClaimScoping:  _lpClaimScopingBlock || '',
    lifeStage:       _lifeStageBlock      || ''
  };

  // Design brief types — art direction only, no copy machinery needed
  if (type === 'post_brief' || type === 'email_brief' || type === 'lp_brief') {
    return _buildDesignBriefPrompt(type, context, icp, theme, governance.phoneRule, governance);
  }

  var brandPlug = _getCcSetting('BRAND_PLUG');
  var urgency   = _getCcSetting('URGENCY_TYPES');
  var excl      = _getCcSetting('EXCLUSIVITY_ANGLES');
  var angle     = _getCcSetting('CAMPAIGN_ANGLES');
  var claims    = _getApprovedClaimsRows();

  return _buildMasterPrompt(type, context, icp, theme, brandPlug, urgency, excl, angle, claims, governance);
}

// ── getPromptPreviewForPost ───────────────────────────────────────────────────
// Diagnostic: returns the exact system prompt that would be sent to Claude API
// for a given SocialPosts row, without calling the API.
// post_id: e.g. 'ec001-sp-001'
// prompt_type: optional override — defaults to 'social_post'
function getPromptPreviewForPost(postId, promptType) {
  try {
    // 1. Find the SocialPosts row
    var ss      = _getCampaignSpreadsheet();
    var spSheet = ss.getSheetByName(_CC_TAB.SOCIAL);
    if (!spSheet) return { ok: false, error: 'SocialPosts tab not found' };
    var spHdrs = _CC_HDR.SocialPosts;
    var spH = {};
    spHdrs.forEach(function(h, i) { spH[h] = i; });
    var spLast = spSheet.getLastRow();
    var postRow = null;
    if (spLast >= 2) {
      var spRows = spSheet.getRange(2, 1, spLast - 1, spHdrs.length).getValues();
      for (var i = 0; i < spRows.length; i++) {
        if (String(spRows[i][spH['id']] || '') === postId) { postRow = spRows[i]; break; }
      }
    }
    if (!postRow) return { ok: false, error: 'Post not found: ' + postId };

    var campaignId = String(postRow[spH['campaign_id']] || 'EC-2026-001');
    var platform   = String(postRow[spH['platform']] || 'Instagram');
    var dlId       = String(postRow[spH['dl_id']] || '');
    var designBriefRaw = String(postRow[spH['design_brief']] || '{}');
    var designBrief = {};
    try { designBrief = JSON.parse(designBriefRaw); } catch(ep) {}

    // 2. Get campaign brief from sheet
    var brief = getCampaignBriefs(campaignId) || {};

    // 3. Look up DL registry for per-post icp_code + lp_variant (most precise source)
    var dlIcpCode  = '';
    var dlVariant  = '';
    if (dlId) {
      try {
        var dlSheet = ss.getSheetByName(_CC_TAB.DL);
        if (dlSheet) {
          var dlHdrs = _CC_HDR.DeepLinkRegistry;
          var dlH = {};
          dlHdrs.forEach(function(h, i) { dlH[h] = i; });
          var dlLast = dlSheet.getLastRow();
          if (dlLast >= 2) {
            var dlRows = dlSheet.getRange(2, 1, dlLast - 1, dlHdrs.length).getValues();
            for (var di = 0; di < dlRows.length; di++) {
              if (String(dlRows[di][dlH['dl_id']] || '') === dlId) {
                dlIcpCode = String(dlRows[di][dlH['icp_code']]  || '');
                dlVariant = String(dlRows[di][dlH['lp_variant']] || '');
                break;
              }
            }
          }
        }
      } catch(dlErr) { Logger.log('[getPromptPreviewForPost] DL lookup: ' + dlErr.message); }
    }

    // 4. Resolve per-post ICP — design_brief.icp_a/icp_b keyed by lp_variant is most specific;
    //    DL registry icp_code may be generic (campaign-level); design_brief has per-variant codes.
    var resolvedIcp;
    if (dlVariant === 'a' && designBrief.icp_a) {
      resolvedIcp = designBrief.icp_a;
    } else if (dlVariant === 'b' && designBrief.icp_b) {
      resolvedIcp = designBrief.icp_b;
    } else if (dlIcpCode && dlIcpCode.indexOf('_money') > -1 || dlIcpCode && dlIcpCode.indexOf('_time') > -1 || dlIcpCode && dlIcpCode.indexOf('budget') > -1) {
      // DL registry has a specific (non-generic) code — trust it
      resolvedIcp = dlIcpCode;
    } else {
      // Fall back: day-parity pick from design_brief, then campaign brief
      var _dayNum = parseInt(designBrief.day || 1);
      resolvedIcp = (_dayNum % 2 === 1 ? designBrief.icp_a : designBrief.icp_b)
                    || designBrief.icp_a
                    || brief.icp_code
                    || 'super_mom_money';
    }
    var resolvedVariant = dlVariant || (designBrief.day && designBrief.day % 2 === 1 ? 'a' : 'b');
    var resolvedSlug    = (resolvedVariant === 'a')
      ? (brief.lp_slug_a || 'waitlist-a')
      : (brief.lp_slug_b || 'waitlist-b');

    // 5. Get theme row
    var themeId  = brief.theme || designBrief.theme || 'invisible-leak';
    var themeRow = _getThemeRow(themeId);

    // 6. Build context with per-post ICP and LP variant
    var briefForCtx = {
      icp:             resolvedIcp,
      theme:           themeId,
      themeData:       themeRow,
      campaign_angle:  brief.campaign_angle   || designBrief.campaign_angle || 'savings',
      urgency_trigger: brief.urgency_trigger  || 'First 5,000 families lock in $7.99/month forever',
      blueprint:       brief.blueprint        || 'Waitlist',
      slug:            resolvedSlug,
      lp_variant:      resolvedVariant,
      lp_slug:         resolvedSlug
    };
    var ctx = _buildBriefStoryCtx(briefForCtx);
    ctx.platform    = platform;
    ctx.stage       = designBrief.funnel_stage || '';
    ctx.post_number = designBrief.day          || 1;
    ctx.icp_code    = resolvedIcp;
    ctx.lp_variant  = resolvedVariant;

    var type = promptType || 'social_post';

    var promptStr = getMasterSystemPrompt(type, ctx);

    // 5. Also show what the user message would be (not AI-generated — just the template)
    var lpUrl = 'https://easychefpro.com/' + (briefForCtx.slug || 'waitlist');
    var userMsg = 'Generate 7 social posts for ' + platform + ' for campaign ' + campaignId +
      '. Return only a JSON object with a "posts" array. Each post: ' +
      '{ post_num, funnel_stage, hook, body, cta, url }. LP URL: ' + lpUrl;

    Logger.log('[getPromptPreviewForPost] post_id=' + postId + ' type=' + type +
      ' icp=' + ctx.icp_code + ' lp_variant=' + ctx.lp_variant + ' theme=' + themeId + ' stage=' + ctx.stage);

    return {
      ok:            true,
      post_id:       postId,
      campaign_id:   campaignId,
      platform:      platform,
      prompt_type:   type,
      icp_code:      ctx.icp_code,
      icp_source:    dlIcpCode ? 'dl_registry' : 'design_brief',
      lp_variant:    ctx.lp_variant,
      lp_slug:       resolvedSlug,
      theme:         themeId,
      funnel_stage:  ctx.stage,
      design_brief:  designBrief,
      system_prompt: promptStr,
      user_message:  userMsg,
      prompt_chars:  promptStr.length
    };
  } catch(e) {
    Logger.log('[getPromptPreviewForPost] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Design brief system prompts — art direction for Figma designer ────────────
function _buildDesignBriefPrompt(type, ctx, icp, theme, govPhoneRule, govBrandRules) {
  var _icpName   = (icp  && (icp.name  || icp.id))  || (ctx.icp_code || ctx.icp || '');
  var _themeName = (theme && (theme.theme_name || theme.name)) || (ctx.theme || '');
  var _themeFood = (theme && theme.food_type)        || (ctx.theme_food || '');
  var _campaign  = ctx.campaign_name || '';

  // Brand rules — compiled from BrandDoctrine DESIGN_BRIEF_RULES_001 if available, else hardcoded fallback
  var _BRAND_RULES = (govBrandRules && govBrandRules.designBriefRules) || (
    '=== BRAND RULES — NON-NEGOTIABLE ===\n' +
    '1. CTA BUTTON COLOR: ALWAYS #FF0000 red. Never orange. Never coral. Never any other color.\n' +
    '   Brand palette: #FF0000 (red) · #F6EFE8 (beige) · #000000 (black) · #FFFFFF (white)\n\n' +
    '2. PROOF BAR STATS: Use ONLY these three approved claims, word-for-word:\n' +
    '   $1,336/year savings · 69.5% less food waste · 30 min fridge to table\n' +
    '   Never invent stats. Never invent numbers. Never use any percentage not in this list.\n\n' +
    '3. TESTIMONIALS: No invented testimonials. No invented names. No "real mom photos with quotes."\n' +
    '   No invented user counts (e.g. "847 moms"). Testimonials section: leave blank until real\n' +
    '   beta feedback is available.\n\n' +
    '4. SCENE DIRECTION: No shame language directed at the user. The system is broken — never her fault.\n' +
    '   Write scenes that show broken systems, wasted food, and time lost — not personal failure.\n\n' +
    '5. BANNED CLAIMS — never write these figures or phrases:\n' +
    '   $111/month · $112/month · any invented monthly savings figure → use "$1,336/year" only\n' +
    '   "2.3 times per week" or any invented frequency statistic → banned\n' +
    '   Any invented scarcity numbers (e.g. "4,847 families", "153 spots left") → banned\n' +
    '   Urgency allowed ONLY as: "First 5,000 families only" or "Founding price ends July 1"\n\n' +
    '6. BANNED ORIGIN PHRASES:\n' +
    '   "Built by parents" → must be "Built by first responders"\n' +
    '   "Born in Silicon Valley" · "Born in [any city]" · any location reference → banned\n\n' +
    '7. BANNED NAMES AND IDENTIFIERS:\n' +
    '   Sarah → absolutely never use this name\n' +
    '   Any invented first name in copy → banned\n' +
    '   Any invented location in copy → banned\n\n' +
    '8. BANNED FORMATS:\n' +
    '   Before/after testimonial format → banned\n' +
    '   Invented testimonial quotes with names → banned\n\n'
  );

  if (type === 'post_brief') {
    return 'You are the art director for easyChef Pro. You are not generating graphics. You are generating emotional states through visual systems.\n\n' +
      'Generate a unique, stage-specific DESIGN BRIEF and HASHTAGS for each social post for the Figma designer.\n\n' +
      '=== CAMPAIGN ===\n' +
      (_campaign  ? 'Campaign: '    + _campaign  + '\n' : '') +
      (_themeName ? 'Theme: '       + _themeName + '\n' : '') +
      (_themeFood ? 'Theme food: '  + _themeFood + '\n' : '') +
      (_icpName   ? 'ICP: '         + _icpName   + '\n' : '') + '\n' +
      _BRAND_RULES +
      (govPhoneRule || (
        '=== PHONE REVEAL RULE (NON-NEGOTIABLE) ===\n' +
        'Posts 1-3 (Hook · Problem · Agitate): NO PHONE — the problem must feel real before the solution appears.\n' +
        'Post 4 (Solve): PHONE APPEARS — first reveal. Phone shows app solving the exact problem from Post 3.\n' +
        'Posts 5-7 (Value · Proof · CTA): PHONE VISIBLE — phone present but not the hero. Show outcomes.\n\n'
      )) +
      '=== DESIGN BRIEF JSON SCHEMA — output this exact structure for each post ===\n' +
      'Each brief must answer all six questions for the designer:\n' +
      '  1. WHO this is for — ICP name, emotional trigger, core pain\n' +
      '  2. WHAT emotional state they are in — specific, visceral, 3-5 words\n' +
      '  3. WHERE they are in the funnel — stage name + post number context + what came before\n' +
      '  4. WHAT visual state the story is in — phone rule + what the visual progression is at this moment\n' +
      '  5. WHAT must NOT appear yet — anything that breaks the emotional arc or reveals too early\n' +
      '  6. WHAT action the user should feel next — not the CTA button, the internal emotional pull\n\n' +
      'Output each post as a JSON object with these fields:\n' +
      '{\n' +
      '  "id": "[post DL ID]",\n' +
      '  "asset_type": "social_post" | "short_form_video" | "youtube_short",\n' +
      '  "platform": "[platform]",\n' +
      '  "funnel_stage": "[stage]",\n' +
      '  "who_its_for": "[ICP name · key pain in one sentence · emotional trigger]",\n' +
      '  "emotional_state": "[exact emotional state — 3-5 words]",\n' +
      '  "funnel_position": "[stage name · post N of 7 · what came before · what comes next]",\n' +
      '  "visual_progression": "[phone rule at this post · visual story state · what has been shown so far]",\n' +
      '  "objective": "[recognition | pattern_interruption | belief_transfer | urgency | conversion]",\n' +
      '  "scene_direction": "[3-4 specific sentences — what to shoot or illustrate, referencing theme food and ICP moment]",\n' +
      '  "visual_tone": "[e.g. warm dim cinematic realism · soft shadows · real home not styled]",\n' +
      '  "camera_style": "[e.g. slight handheld realism · stabilized lifestyle · static hero]",\n' +
      '  "layout_direction": "[e.g. image dominant minimal text · text-first · split hero]",\n' +
      '  "phone_visibility": false | true,\n' +
      '  "phone_rule_note": "[NO PHONE / PHONE APPEARS — first reveal / PHONE VISIBLE — outcome]",\n' +
      '  "cta": "[CTA text for this post]",\n' +
      '  "what_not_to_show": ["[item]", "[item]", "[item]"],\n' +
      '  "what_they_feel_next": "[the internal emotional pull after seeing this post — not the button click, the feeling]",\n' +
      '  "brand_rules": ["CTA button #FF0000 red", "No shame language — system is broken not her fault", "No invented names or testimonials"],\n' +
      '  "platform_specs": { "ratio": "[ratio]", "size": "[WxH]" },\n' +
      '  "motion_direction": "[for video only — else omit]",\n' +
      '  "audio_direction": "[for video only — else omit]",\n' +
      '  "hashtags": "[platform-appropriate hashtags or empty string]"\n' +
      '}\n\n' +
      '=== HASHTAG RULES (platform-locked, no exceptions) ===\n' +
      'Instagram: 5-8 hashtags · broad + niche mix · always include #easychefpro · stage-specific\n' +
      'Pinterest: 3-5 hashtags · keyword-focused · SEO-weighted · always include #easychefpro\n' +
      'TikTok: 3-5 hashtags · trending + niche · always include #easychefpro\n' +
      'Facebook: NO hashtags — return empty string\n' +
      'Nextdoor: NO hashtags — return empty string\n' +
      'X: 1-2 hashtags MAX · only if directly relevant\n' +
      'YouTube: NO hashtags — return empty string\n\n' +
      'Every post must have a DIFFERENT brief and DIFFERENT hashtags — never duplicate across posts.\n' +
      'Return ONLY valid JSON array of post objects. No explanation. No markdown fences.';
  }

  if (type === 'email_brief') {
    return 'You are the art director for easyChef Pro email campaigns. Generate a unique design brief per email for the email designer. Each email in the sequence has a different emotional stage — the visual must match.\n\n' +
      '=== CAMPAIGN ===\n' +
      (_campaign  ? 'Campaign: ' + _campaign  + '\n' : '') +
      (_themeName ? 'Theme: '    + _themeName + '\n' : '') +
      (_icpName   ? 'ICP: '      + _icpName   + '\n' : '') + '\n' +
      _BRAND_RULES +
      '=== EMAIL DESIGN BRIEF FORMAT PER EMAIL ===\n' +
      'HEADER IMAGE DIRECTION: [what appears above the fold — mood, scene, no specific product]\n' +
      'EMAIL LAYOUT: [single column · hero image top · or text-first · depends on stage]\n' +
      'VISUAL TONE: [matches emotional arc — e.g. "warm amber, quiet before storm" for Hook]\n' +
      'CTA BUTTON: [always #FF0000 red · full-width on mobile · copy direction · placement]\n\n' +
      'Each email MUST have a different visual concept — the funnel stage changes, the design must too.\n' +
      'Return ONLY valid JSON. No explanation. No markdown fences.';
  }

  if (type === 'lp_brief') {
    var _gov        = govBrandRules || {};
    var _brandPos   = _gov.brandPosition || _BRAND_POSITION_COPY;
    var _arcBlock   = _gov.emotionalArc  || _EMOTIONAL_ARC_COPY;
    return 'You are the art director for easyChef Pro landing pages. Generate a design brief for the Figma designer.\n\n' +
      '=== CAMPAIGN ===\n' +
      (_campaign  ? 'Campaign: ' + _campaign  + '\n' : '') +
      (_themeName ? 'Theme: '    + _themeName + '\n' : '') +
      (_themeFood ? 'Food: '     + _themeFood + '\n' : '') +
      (_icpName   ? 'ICP: '      + _icpName   + '\n\n' : '\n') +
      _brandPos +
      _arcBlock +
      _BRAND_RULES +
      (govPhoneRule ? govPhoneRule.replace('=== PHONE REVEAL RULE', '9. PHONE RULE') :
        '9. LP PHONE RULE (non-negotiable):\n' +
        '   Hero section: phone NOT visible — no app in the hero image.\n' +
        '   Solve section: phone APPEARS for the first time — shows app solving the problem.\n' +
        '   Value · Proof · CTA sections: phone VISIBLE — present but not the hero element.\n\n') +
      '=== LP SECTION STRUCTURE — FIXED ORDER, LOCKED ===\n' +
      'All 7 sections appear on every ICP LP. Only ICP-specific content changes.\n\n' +
      'Section 1 — HOOK: Mirror the ICP life-stage moment. Zero product mention. One or two lines. The reader must feel seen.\n' +
      'Section 2 — PROBLEM: Name what is broken in their kitchen at this life stage. Specific, not generic.\n' +
      'Section 3 — AGITATE: Make the cost visible — emotional and practical. Use approved stats where appropriate.\n' +
      'Section 4 — SOLVE: easyChef Pro closes the loop. Show the 5-stage loop adapted to this ICP:\n' +
      '  TRACK — what they have right now at this life stage\n' +
      '  PLAN — meals that fit this chapter, not a generic week\n' +
      '  OPTIMIZE — for the goals and constraints of this life stage\n' +
      '  COOK — with the confidence this life stage needs\n' +
      '  SHOP — one real list, nothing wasted\n' +
      '  Phone FIRST APPEARS in this section.\n' +
      'Section 5 — VALUE: Life after. Stage-specific vision of resolution. Emotional close.\n' +
      'Section 6 — PROOF: Locked proof bar — $1,336/year saved · 69.5% less food waste · 30 min fridge to table. One ICP-appropriate quote.\n' +
      'Section 7 — CTA: Button text locked: [Start Free — It Adapts to You]. Below: "The app that evolves with your life." Urgency: "First 5,000 families only. $7.99/month locked forever."\n\n' +
      '=== LP DESIGN BRIEF FORMAT ===\n' +
      'hero_visual: [above-the-fold scene direction — ICP life-stage moment — NO phone, NO app UI]\n' +
      'section_visuals: [one line per section — Hook · Problem · Agitate · Solve (phone first appears) · Value · Proof · CTA]\n' +
      'loop_diagram: [TRACK → PLAN → OPTIMIZE → COOK → SHOP — icon row in Solve section, ICP-adapted labels below each stage]\n' +
      'social_proof_bar: [layout and style — approved stats only, no invented claims]\n' +
      'cta_button_style: [#FF0000 red · full width on mobile · placement · tagline position]\n\n' +
      'Return ONLY a JSON object with keys: hero_visual, section_visuals, loop_diagram, social_proof_bar, cta_button_style. No explanation. No markdown.';
  }

  return '';
}

function _getPlatformNote(channelName) {
  try {
    var channels = getChannels();
    for (var i = 0; i < channels.length; i++) {
      if (channels[i].name === channelName) {
        return channels[i].platform_note || '';
      }
    }
  } catch (e) {}
  return channelName + ' — platform-appropriate content.';
}

// Locked channel rules — spec-defined, not overridable by Channels sheet
function _getChannelRules(channelName) {
  var ch = (channelName || '').toLowerCase();
  if (ch === 'facebook') {
    return 'PLATFORM RULES — FACEBOOK:\n' +
      'Conversational warm tone. Max 400 chars. Link works in post body. No hashtags.\n' +
      'Hook → compressed 7-step arc → link. Image: 1200x630px horizontal.';
  }
  if (ch === 'instagram') {
    return 'PLATFORM RULES — INSTAGRAM:\n' +
      'Visual-first. Max 125 chars before More. NO link in caption — bio link only.\n' +
      '5–8 hashtags at end. Hook line must work as standalone image text overlay.\n' +
      'Image: 1080x1080px square.';
  }
  if (ch === 'tiktok') {
    return 'PLATFORM RULES — TIKTOK:\n' +
      'VIDEO SCRIPT FORMAT. Structure the body field exactly as:\n' +
      'HOOK (0-3 sec on screen text): [text]\n' +
      'SCRIPT (3-45 sec spoken): [text]\n' +
      'ON SCREEN TEXT (key moments): [text]\n' +
      'CTA (45-60 sec): [text]\n' +
      'Max 60 seconds spoken. POV or talking-head format. Ultra short sentences.\n' +
      'Thumbnail image: 1080x1920px vertical.';
  }
  if (ch === 'pinterest') {
    return 'PLATFORM RULES — PINTEREST:\n' +
      'Keyword-rich description. 500 chars max. Savings angle dominant.\n' +
      '$1,336 figure prominent. SEO-optimised — Pinterest is a search engine.\n' +
      'Image: 1000x1500px vertical 2:3 ratio.';
  }
  if (ch === 'nextdoor') {
    return 'PLATFORM RULES — NEXTDOOR:\n' +
      'Neighbour-to-neighbour tone. NO marketing language. Personal story angle.\n' +
      'Feels like a recommendation not an ad. Max 300 chars. No hashtags. No link preview.';
  }
  return '';
}

// Per-channel post count defaults
// Pinterest stays at 5 (visual platform, fewer longer-form pins).
// All other social channels — including Nextdoor — run the full 7-post arc.
function _getChannelPostCount(channelName, briefCount) {
  var ch = (channelName || '').toLowerCase();
  var defaults = { pinterest: 5 };
  return defaults[ch] || (briefCount || 7);
}

// ── getLandingPagesByIcp ──────────────────────────────────────────────────────

/**
 * Returns LandingPages rows filtered by ICP.
 * Returns { ok: true, pages: [{id, campaign_id, slug, hero_headline, status, icp_code}] }
 *
 * The LandingPages sheet has no icp_code column, so we resolve ICP by joining
 * each page's campaign_id to CampaignBriefs. Handles both display format
 * ("Super Mom") and snake_case ("super_mom") in the filter and in the sheet.
 *
 * Named distinctly from getLandingPages() in Operations_CampaignSheets.gs to
 * avoid the duplicate-function naming conflict that caused the wrong version
 * to be called and receive icp as a campaign_id filter (returning nothing).
 */
function getLandingPagesByIcp(icpFilter) {
  try {
    // Get all pages (no filter — getLandingPages() from CampaignSheets.gs)
    var allPages = getLandingPages('');
    if (!Array.isArray(allPages)) allPages = [];

    if (!icpFilter) return { ok: true, pages: allPages };

    // Build campaign_id → icp_code map from CampaignBriefs
    var icpMap = {};
    try {
      var briefs = getCampaignBriefs();
      if (Array.isArray(briefs)) {
        briefs.forEach(function(b) {
          if (b.id) icpMap[String(b.id)] = String(b.icp_code || '').toLowerCase();
        });
      }
    } catch (e) { /* briefs sheet not yet set up */ }

    // Normalise filter to both formats for comparison
    var filterLower = String(icpFilter).toLowerCase().trim();
    var filterSnake = filterLower.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    var filterSlug  = filterLower.replace(/\s+/g, '-');

    var pages = allPages
      .filter(function(p) {
        // 1. Check icp_code stored directly on the page object (if present)
        var pageIcp = String(p.icp_code || p.icp || '').toLowerCase();
        if (pageIcp) {
          if (pageIcp === filterLower || pageIcp === filterSnake) return true;
          if (pageIcp.indexOf(filterSnake) > -1) return true;
        }
        // 2. Join to CampaignBriefs via campaign_id
        var briefIcp = icpMap[String(p.campaign_id || '')] || '';
        if (briefIcp) {
          if (briefIcp === filterSnake || briefIcp === filterLower) return true;
          if (briefIcp.indexOf(filterSnake) > -1) return true;
        }
        // 3. Slug fallback — e.g. lp/super-mom-email contains "super-mom"
        if (String(p.slug || '').toLowerCase().indexOf(filterSlug) > -1) return true;
        return false;
      })
      .map(function(p) {
        // Enrich with resolved icp_code so dashboard can display it
        var resolved = icpMap[String(p.campaign_id || '')] || p.icp_code || p.icp || '';
        return {
          id:              p.id,
          campaign_id:     p.campaign_id,
          slug:            p.slug,
          hero_headline:   p.hero_headline   || '',
          hero_subheadline:p.hero_subheadline|| '',
          status:          p.status          || 'draft',
          icp_code:        resolved,
          name:            p.hero_headline   || p.slug || p.id,
          ab_test_variant: p.ab_test_variant || '',
          blueprint_code:  p.blueprint_code  || '',
          theme:           p.theme           || ''
        };
      });

    return { ok: true, pages: pages };
  } catch (e) {
    return { ok: false, error: e.message, pages: [] };
  }
}

// ── buildEmailSequence ────────────────────────────────────────────────────────

/**
 * Generates 2 proof-of-concept emails (SEQ-1-E1 Day 0 + SEQ-2-E1 Day 7) via Claude.
 * Capped at 2 to stay within Apps Script execution limits — full 8-email build TBD.
 * brief: { id, name, icp, channel, goal, slug }
 * copy:  { headline, subheadline, email_subject_a, email_subject_b, lp_hero, proof_bar, cta_primary }
 * Returns { ok: true, sequence: [ { seq_id, send_day, subject, preheader, body, cta_text, cta_url } ] }
 */
function buildEmailSequence(brief, copy) {
  if (!brief) return { ok: false, error: 'brief is required' };

  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set' };

  var lpUrl = _buildLpUrl(brief.slug || 'waitlist');

  var _esStoryCtx = _buildBriefStoryCtx(brief);

  var systemPrompt =
    getMasterSystemPrompt('email', _esStoryCtx) +
    '=== CAMPAIGN CONTEXT ===\n' +
    'Campaign: '    + (brief.name || '') + '\n' +
    'Landing page: ' + lpUrl + '\n' +
    'Headline: '    + (copy && copy.headline    || '') + '\n' +
    'LP Hero: '     + (copy && copy.lp_hero     || '') + '\n' +
    'Primary CTA: ' + (copy && copy.cta_primary || '') + '\n\n' +
    '=== EMAIL SEQUENCE STRUCTURE ===\n' +
    'Build 2 emails only (proof of concept — format approval before full build):\n' +
    '  SEQ-1-E1 (Day 0): Welcome + hook. Subject uses money angle. Body delivers the promise. 3-4 short paragraphs.\n' +
    '  SEQ-2-E1 (Day 7): Feature spotlight — meal planning saves $1,336/year. Show the maths. 3-4 short paragraphs.\n\n' +
    '=== OUTPUT FORMAT ===\n' +
    'Return ONLY valid JSON. No markdown. No explanation.\n' +
    '{\n' +
    '  "sequence": [\n' +
    '    {\n' +
    '      "seq_id": "SEQ-1-E1",\n' +
    '      "send_day": 0,\n' +
    '      "subject": "under 50 chars, no emojis",\n' +
    '      "preheader": "under 90 chars, extends the subject",\n' +
    '      "body": "Plain text email body, 3-4 short paragraphs, no markdown",\n' +
    '      "cta_text": "under 6 words",\n' +
    '      "cta_url": "' + lpUrl + '"\n' +
    '    }\n' +
    '  ]\n' +
    '}';

  try {
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Generate the 2-email proof of concept for the ' + (brief.icp || 'selected') + ' ICP. Return only the JSON object with exactly 2 entries in the sequence array.' }]
      }),
      muteHttpExceptions: true
    });

    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply && data.error) return { ok: false, error: typeof data.error === 'object' ? data.error.message : String(data.error) };

    try {
      var jsonStr = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
      var result = JSON.parse(jsonStr);
      return { ok: true, sequence: result.sequence || [] };
    } catch (e) {
      return { ok: true, sequence: [], raw: reply };
    }
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── buildSocialPosts ──────────────────────────────────────────────────────────

/**
 * Generates 5 social posts for the given channel via Claude.
 * Returns { ok: true, posts: [ { post_num, hook, body, cta, url } ] }
 */
function buildSocialPosts(brief, copy) {
  if (!brief) return { ok: false, error: 'brief is required' };

  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set' };

  var channel  = brief.channel  || 'Facebook';
  var ctaType  = brief.cta_type || 'waitlist';
  // Phase guard: before July 1 2026 launch, never use download CTA
  var _launchDate = new Date('2026-07-01');
  if (new Date() < _launchDate && ctaType === 'download') ctaType = 'waitlist';
  var lpUrl    = _buildLpUrl(brief.slug || 'waitlist');

  var ctaConf = { cta: 'Join the waitlist free — early access July 1', loss: 'Founding price ends at 5,000 families' };
  try {
    var ctaTypes = getCampaignTypes(false);
    for (var ci = 0; ci < ctaTypes.length; ci++) {
      if (ctaTypes[ci].cta_type === ctaType) {
        ctaConf = { cta: ctaTypes[ci].cta_text, loss: ctaTypes[ci].loss_aversion };
        break;
      }
    }
  } catch(ctaErr) {}

  var platformNote = _getPlatformNote(channel);
  var channelRules = _getChannelRules(channel);
  var _spStoryCtx  = _buildBriefStoryCtx(brief);
  _spStoryCtx.platform = channel;

  var systemPrompt =
    getMasterSystemPrompt('social_post', _spStoryCtx) +
    '=== PLATFORM ===\n' +
    (channelRules || platformNote) + '\n\n' +
    '=== CAMPAIGN CONTEXT ===\n' +
    'Landing page: ' + lpUrl + '\n' +
    'Headline: '    + (copy && copy.headline    || '') + '\n' +
    'Social hook: ' + (copy && copy.social_hook || '') + '\n' +
    'Primary CTA: ' + (copy && copy.cta_primary || '') + '\n' +
    'Campaign angle: ' + (brief.campaign_angle || 'savings') + ' — lead every post and email with this angle\n' +
    'Urgency trigger: ' + (brief.urgency_trigger || 'Founding price $7.99/month ends at 5,000 families') + '\n\n' +
    _getStagesArcText() +
    'Total post length: 250–400 chars for Facebook.\n' +
    'The funnel_stage field in the output JSON must reflect the post\'s actual arc stage.\n\n' +
    '=== UNIVERSAL CAMPAIGN ENGINE ===\n' +
    'Campaign type: ' + ctaType.toUpperCase() + '\n' +
    'CTA for every post: ' + ctaConf.cta + '\n' +
    'Loss aversion angle: ' + ctaConf.loss + '\n' +
    'The 7-step sequence never changes. Only the CTA destination changes by campaign type.\n\n' +
    '=== PLATFORM REQUIREMENTS ===\n' +
    'Optimal length: ' + (brief.platform_optimal_chars || '') + ' characters\n' +
    'Hashtags: ' + (brief.use_hashtags
      ? 'Include ' + (brief.hashtag_count_min || 0) + '-' + (brief.hashtag_count_max || 0) + ' hashtags'
      : 'No hashtags on this platform — leave hashtags field as empty string') + '\n' +
    'Content format: ' + (brief.content_format || 'post') + '\n' +
    'Link placement: ' + (brief.link_placement || '') + '\n\n' +
    '=== IMAGE BRIEF REQUIREMENTS ===\n' +
    'CRITICAL: The image_brief must tell the SAME STORY as the post body. If the post is about\n' +
    'throwing away $1,336 of groceries the image shows food waste. If the post is about a child\n' +
    'asking for seconds the image shows that dinner table moment. If the post is about 6:30 PM\n' +
    'panic the image shows that exact fridge moment. Never use a generic happy family image when\n' +
    'the post describes a specific problem or specific moment.\n\n' +
    'Write exactly 4 sentences for image_brief:\n' +
    'Sentence 1 — WHO: Match the character from this post exactly. If post mentions Sarah, show Sarah.\n' +
    '  If post mentions a mom with 3 kids, show that. Include gender, age range (30s/40s),\n' +
    '  what they are wearing, specific emotion that matches the post (exhausted / relieved / proud / surprised).\n' +
    'Sentence 2 — WHAT: The exact action from the post story (opening fridge / looking at phone /\n' +
    '  serving dinner / reacting to kids asking for seconds). Not a generic action — the specific one.\n' +
    'Sentence 3 — WHERE + WHEN: Suburban kitchen, time of day from post (6 PM warm evening light /\n' +
    '  Sunday morning bright / weeknight dim), specific background details that match post context.\n' +
    'Sentence 4 — BRAND SPECS + PHONE RULE: For hook/problem/agitate posts (posts 1–3): no phone in the\n' +
    '  character\'s hands — the story is about her pain before any solution exists. For solve/value/proof/cta\n' +
    '  posts (posts 4–7): character holds smartphone showing red easyChef Pro app interface matching the post\n' +
    '  theme. Always warm tones only, no blue or navy, no studio lighting, no posed expressions.\n\n' +
    '=== OUTPUT FORMAT ===\n' +
    'Return ONLY valid JSON. No markdown. No explanation.\n' +
    '{\n' +
    '  "posts": [\n' +
    '    {\n' +
    '      "post_num": 1,\n' +
    '      "funnel_stage": "hook",\n' +
    '      "hook": "First line that stops the scroll — under 15 words",\n' +
    '      "body": "Full post body following the 7-step arc in compressed form — plain text only, no markdown",\n' +
    '      "cta": "' + ctaConf.cta + '",\n' +
    '      "url": "' + lpUrl + '",\n' +
    '      "hashtags": "Relevant hashtags for this platform and ICP — empty string for Facebook and Nextdoor",\n' +
    '      "image_brief": "4-sentence brief: [Sentence 1: who — gender/age/clothing/emotion matching this post]. [Sentence 2: exact action from this post story]. [Sentence 3: setting/time-of-day/background from this post]. [Sentence 4: holds red easyChef Pro phone showing [screen type], warm tones, no blue, no studio lighting, Facebook 1200x630px horizontal.]"\n' +
    '    }\n' +
    '  ]\n' +
    '}';

  try {
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Generate ' + (brief.post_count || 7) + ' ' + channel + ' posts for the ' + (brief.icp || 'selected') + ' ICP. Return only the JSON object.' }]
      }),
      muteHttpExceptions: true
    });

    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply && data.error) return { ok: false, error: typeof data.error === 'object' ? data.error.message : String(data.error) };

    try {
      var jsonStr = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
      var result = JSON.parse(jsonStr);
      var _foodType = (brief.themeData && brief.themeData.food_type) || brief.theme_food || brief.food_type || '';
      var _posts = result.posts || [];
      if (_foodType) _posts.forEach(function(p) { if (!p.food_type) p.food_type = _foodType; });
      return { ok: true, posts: _posts };
    } catch (e) {
      return { ok: true, posts: [], raw: reply };
    }
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── buildMultiChannelPosts ────────────────────────────────────────────────────

/**
 * Generates social posts for every selected social channel in brief.channels.
 * Email and Push Notifications are skipped (handled separately).
 * Returns { ok: true, posts: [...all posts tagged with .channel], stagger_schedule: [...] }
 */
function buildMultiChannelPosts(brief, copy) {
  if (!brief) return { ok: false, error: 'brief is required' };
  var channels = Array.isArray(brief.channels) && brief.channels.length ? brief.channels : [brief.channel || 'Facebook'];
  // TikTok and YouTube get static single-asset entries — not the 7-post AI arc
  var socialChannels = channels.filter(function(ch) {
    var lc = (ch || '').toLowerCase();
    return lc && lc !== 'email' && lc !== 'push notifications' && lc !== 'tiktok' && lc !== 'youtube';
  });

  var allPosts = [];
  var errors   = [];
  var sheetChannels;
  try { sheetChannels = getChannels(); } catch(e) { sheetChannels = []; }

  // Static TikTok spotlight (Day 4) and YouTube explainer (Day 7)
  var _hasTikTok = channels.some(function(c){return(c||'').toLowerCase()==='tiktok';});
  var _hasYT     = channels.some(function(c){return(c||'').toLowerCase()==='youtube';});
  if (_hasTikTok) {
    var _tkFt = _getTikTokFeature(brief);
    allPosts.push({ channel:'TikTok', post_num:1, scheduled_day:3, theme:'solve', funnel_stage:'solve',
      hook:_tkFt.toUpperCase()+' spotlight — hook in 3 seconds',
      body:'Feature demo: '+_tkFt+' · one approved claim · CTA link in bio',
      cta:'Link in bio', hashtags:'', image_brief:'60-sec '+_tkFt+' spotlight screen recording',
      campaign_id:brief.id||'' });
  }
  if (_hasYT) {
    allPosts.push({ channel:'YouTube', post_num:1, scheduled_day:6, theme:'cta', funnel_stage:'cta',
      hook:'easyChef Pro — 60-second explainer',
      body:'Full 7-step arc compressed to 60 seconds — publishes Day 7 same day as all CTA posts',
      cta:'Join the waitlist — link in description', hashtags:'', image_brief:'60-sec explainer thumbnail — app on phone',
      campaign_id:brief.id||'' });
  }

  if (!socialChannels.length && !allPosts.length) return { ok: true, posts: [], stagger_schedule: [] };

  for (var ci = 0; ci < socialChannels.length; ci++) {
    var ch = socialChannels[ci];
    var chBrief = JSON.parse(JSON.stringify(brief));
    chBrief.channel = ch;
    // Per-channel post count: Pinterest=5, Nextdoor=3, others=brief default
    chBrief.post_count = _getChannelPostCount(ch, brief.post_count || 7);
    var chData = null;
    for (var di = 0; di < sheetChannels.length; di++) {
      if (sheetChannels[di].name.toLowerCase() === ch.toLowerCase() && sheetChannels[di].status === 'active') {
        chData = sheetChannels[di]; break;
      }
    }
    if (chData) {
      chBrief.platform_optimal_chars = chData.optimal_chars      || '';
      chBrief.use_hashtags            = chData.use_hashtags       || false;
      chBrief.hashtag_count_min       = chData.hashtag_count_min  || 0;
      chBrief.hashtag_count_max       = chData.hashtag_count_max  || 0;
      chBrief.content_format          = chData.content_format     || 'post';
      chBrief.link_placement          = chData.link_placement     || '';
    }
    var result = buildSocialPosts(chBrief, copy);
    if (result.ok) {
      (result.posts || []).forEach(function(p) { p.channel = ch; });
      allPosts = allPosts.concat(result.posts || []);
    } else {
      errors.push(ch + ': ' + (result.error || 'failed'));
    }
  }

  // Include push copy if Push Notifications is in channels
  var hasPush = channels.some(function(c){ return (c||'').toLowerCase() === 'push notifications'; });
  var pushResult = null;
  if (hasPush) {
    pushResult = buildPushNotifications(brief, copy);
  }

  var schedule = _buildStaggerSchedule(channels, brief.post_count || 7, brief.publish_day || '', brief.theme || '');
  var out = { ok: true, posts: allPosts, stagger_schedule: schedule };
  if (pushResult && pushResult.ok) out.push_notifications = pushResult.notifications;
  if (errors.length) out.errors = errors;
  return out;
}

// Spec-defined stagger: Facebook → Email → Instagram pattern across 7 funnel stages (21 days)
// Push slot added on Day 20 (same as Stage 7 CTA)
function _buildStaggerSchedule(allChannels, postCount, publishDay, theme) {
  var stages = ['hook','problem','agitate','solve','value','proof','cta'];
  var social  = allChannels.filter(function(c){ var l=(c||'').toLowerCase(); return l!=='email'&&l!=='push notifications'; });
  var hasEmail= allChannels.some(function(c){ return (c||'').toLowerCase()==='email'; });
  var hasPush = allChannels.some(function(c){ return (c||'').toLowerCase()==='push notifications'; });

  var schedule = [];
  var day = 0;
  var stageCount = Math.min(postCount, stages.length);

  for (var si = 0; si < stageCount; si++) {
    var stage = stages[si];
    // Social channels first
    for (var ci = 0; ci < social.length; ci++) {
      schedule.push({ day: day, channel: social[ci], funnel_stage: stage, post_num: si + 1, content_type: 'social_post' });
      day++;
    }
    // Email slot after each stage's social posts
    if (hasEmail) {
      schedule.push({ day: day, channel: 'Email', funnel_stage: stage, post_num: si + 1, content_type: 'email' });
      day++;
    }
  }

  // Push on final stage (CTA/urgency)
  if (hasPush) {
    schedule.push({ day: day, channel: 'Push Notifications', funnel_stage: 'cta', post_num: stageCount, content_type: 'push_notification' });
  }

  if (publishDay && publishDay !== '') {
    schedule.forEach(function(s) {
      s.weekday_anchor = publishDay;
      if (theme) s.theme = theme;
    });
  }
  return schedule;
}

// ── buildPushNotifications ────────────────────────────────────────────────────

/**
 * Generates 3 push notifications aligned to funnel stages (hook, value, cta).
 * Returns { ok: true, notifications: [{stage, copy, char_count}] }
 */
function buildPushNotifications(brief, copy) {
  if (!brief) return { ok: false, error: 'brief is required' };

  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set' };

  var ctaConf = { cta: 'Join the waitlist free', loss: 'Founding price ends at 5,000 families' };
  try {
    var ctaTypes = getCampaignTypes(false);
    for (var ci = 0; ci < ctaTypes.length; ci++) {
      if (ctaTypes[ci].cta_type === (brief.cta_type || 'waitlist')) {
        ctaConf = { cta: ctaTypes[ci].cta_text, loss: ctaTypes[ci].loss_aversion };
        break;
      }
    }
  } catch(e) {}

  var systemPrompt =
    'You are the easyChef Pro push notification writer.\n\n' +
    _AB_ARCH +
    _AB_VOICE +
    'PLATFORM RULES — PUSH NOTIFICATIONS:\n' +
    'Under 50 chars total per notification. Start with action verb.\n' +
    'Outcome-framed not feature-framed. Creates urgency without pressure.\n\n' +
    '=== CAMPAIGN CONTEXT ===\n' +
    'Headline: ' + (copy && copy.headline || '') + '\n' +
    'Social hook: ' + (copy && copy.social_hook || '') + '\n' +
    'CTA: ' + ctaConf.cta + '\n\n' +
    '=== OUTPUT FORMAT ===\n' +
    'Return ONLY valid JSON. No markdown.\n' +
    '{\n' +
    '  "notifications": [\n' +
    '    { "stage": "hook", "copy": "Dinner panic at 6:30? We fixed it →", "char_count": 38 },\n' +
    '    { "stage": "value", "copy": "30-min dinner from your fridge. Go →", "char_count": 37 },\n' +
    '    { "stage": "cta", "copy": "$7.99/mo founding price. Today only →", "char_count": 38 }\n' +
    '  ]\n' +
    '}';

  try {
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      payload: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Generate 3 push notifications for the ' + (brief.icp || 'selected') + ' ICP. Return only the JSON.' }]
      }),
      muteHttpExceptions: true
    });
    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply && data.error) return { ok: false, error: typeof data.error === 'object' ? data.error.message : String(data.error) };
    var jsonStr = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
    var result  = JSON.parse(jsonStr);
    return { ok: true, notifications: result.notifications || [] };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── buildLandingPage ──────────────────────────────────────────────────────────

/**
 * Generates full landing page copy for the given ICP and brief via Claude.
 * Returns { ok: true, lp: { hero_headline, hero_subheadline, problem_section,
 *   solve_section, proof_items, social_proof, closing_headline, cta_primary, cta_url } }
 */
function buildLandingPage(brief, copy) {
  if (!brief) return { ok: false, error: 'brief is required' };

  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set' };

  var lpUrl   = _buildLpUrl(brief.slug || 'waitlist');
  var ctaType = brief.cta_type || 'waitlist';
  // Phase guard: pre-launch
  var _lpLaunchDate = new Date('2026-07-01');
  if (new Date() < _lpLaunchDate && ctaType === 'download') ctaType = 'waitlist';

  // CTA text from CampaignTypes sheet
  var ctaConf = ctaType === 'download'
    ? { cta: 'Download free on App Store', scarcity: '', loss: '' }
    : { cta: 'Join the waitlist free — early access July 1 — no credit card required',
        scarcity:  'First 5,000 families lock in $7.99/month forever',
        loss:      'After that: $19.99/month' };
  try {
    var _lpCtaTypes = getCampaignTypes(false);
    for (var _lpCi = 0; _lpCi < _lpCtaTypes.length; _lpCi++) {
      if (_lpCtaTypes[_lpCi].cta_type === ctaType) {
        ctaConf.cta  = _lpCtaTypes[_lpCi].cta_text      || ctaConf.cta;
        ctaConf.loss = _lpCtaTypes[_lpCi].loss_aversion  || ctaConf.loss;
        break;
      }
    }
  } catch(e) {}

  var _lpStoryCtx = _buildBriefStoryCtx(brief);

  var systemPrompt =
    getMasterSystemPrompt('lp_full', _lpStoryCtx) +
    '=== CAMPAIGN CONTEXT ===\n' +
    'Landing page URL: ' + lpUrl + '\n' +
    'Funnel: '          + (brief.funnel         || 'A-Waitlist') + '\n' +
    'Campaign name: '   + (brief.name           || '') + '\n' +
    'Campaign angle: '  + (brief.campaign_angle || 'savings') + '\n' +
    'Urgency trigger: ' + (brief.urgency_trigger || 'Founding price $7.99/month ends at 5,000 families') + '\n' +
    (copy && copy.headline ? 'Campaign headline: ' + copy.headline + '\n' : '') +
    (copy && copy.lp_hero  ? 'LP hero copy: '     + copy.lp_hero  + '\n' : '') + '\n' +
    '=== 7-SECTION LP STRUCTURE — FOLLOW EXACTLY ===\n\n' +
    'SECTION 1 — HOOK (hero)\n' +
    'hero_headline: Mirrors the campaign hook. Specific to the ICP pain. Under 12 words. No punctuation at end.\n' +
    'hero_subheadline: Names the exact moment in plain language. One sentence. Under 20 words.\n' +
    'hero_cta: Use this exact text: "' + ctaConf.cta + '"\n' +
    'social_proof_bar: 1 sentence of descriptive trust language. Style: "Families in [city types] are already joining..." NEVER a stat or dollar amount.\n\n' +
    'SECTION 2 — PROBLEM\n' +
    'problem_headline: Section headline. One sentence. Names the moment, not the category. Under 14 words.\n' +
    'problem_section: Her exact moment. The 6:30 PM wall precisely. No solution. No product mention. 2-3 sentences.\n' +
    'problem_visual: One sentence visual direction for the designer — what this section looks like.\n\n' +
    'SECTION 3 — AGITATE\n' +
    'agitate_headline: One sentence. Names the cost. Under 12 words.\n' +
    'agitate_section: The cost. Use $1,336/year exact wording. Also $111/month. Also $25/week. One undeniable number per sentence. 2-3 sentences.\n\n' +
    'SECTION 4 — SOLVE\n' +
    'solve_section: One sentence only. "easyChef Pro looks at what is in your fridge and tells you exactly what to make tonight."\n' +
    'solve_track: One-liner for TRACK feature (Pantry & Waste Screen). Under 10 words. Outcome-framed.\n' +
    'solve_plan: One-liner for PLAN feature (Meal Planning Screen). Under 10 words. Outcome-framed.\n' +
    'solve_optimize: One-liner for OPTIMIZE feature (Savings Dashboard). Under 10 words. Outcome-framed.\n' +
    'solve_cook: One-liner for COOK feature (Recipe & Cook Mode). Under 10 words. Outcome-framed.\n' +
    'solve_shop: One-liner for SHOP feature (Shopping List Screen). Under 10 words. Outcome-framed.\n\n' +
    'SECTION 5 — VALUE\n' +
    'value_section_tag: Write exactly: "WHAT CHANGES MONDAY"\n' +
    'value_section: Three specific outcomes she wants. Peace and control forward — not feature forward. 3 flowing sentences.\n\n' +
    'SECTION 6 — PROOF\n' +
    'proof_bar: Array of exactly 3 items from the approved claims list. Exact wording only. NEVER invented stats.\n' +
    '  proof_bar[0]: "Validated across 10,000 household profiles"\n' +
    '  proof_bar[1]: "Built by first responders"\n' +
    '  proof_bar[2]: One more approved stat ($1,336 or 69.5% or 30 min)\n' +
    'proof_origin_line: One sentence on who built this and why. Uses approved "built by first responders" angle.\n' +
    'proof_validation_line: One sentence using the "validated across 10,000 household profiles" claim exactly.\n' +
    'proof_founding_line: One sentence on the founding price and why it ends. Under 15 words.\n\n' +
    'SECTION 7 — CTA (appears 3 times on the page)\n' +
    'closing_headline: Urgency-framed founding price headline. One sentence. Under 12 words.\n' +
    'cta_primary: Write exactly: "' + ctaConf.cta + '"\n' +
    'cta_supporting: A second CTA variant. Outcome-framed. Under 8 words. Different angle from primary.\n' +
    'cta_exclusivity: The exclusivity line. Write exactly: "First 5,000 families only — founding price locked forever"\n' +
    'cta_scarcity: Write exactly: "First 5,000 families lock in $7.99/month forever"\n' +
    'cta_loss_aversion: Write exactly: "After that: $19.99/month"\n\n' +
    '=== OUTPUT FORMAT ===\n' +
    'Return ONLY valid JSON. No markdown. No explanation.\n' +
    '{\n' +
    '  "hero_headline": "",\n' +
    '  "hero_subheadline": "",\n' +
    '  "hero_cta": "' + ctaConf.cta + '",\n' +
    '  "social_proof_bar": "",\n' +
    '  "problem_headline": "",\n' +
    '  "problem_section": "",\n' +
    '  "problem_visual": "",\n' +
    '  "agitate_headline": "",\n' +
    '  "agitate_section": "",\n' +
    '  "solve_section": "easyChef Pro looks at what is in your fridge and tells you exactly what to make tonight.",\n' +
    '  "solve_track": "",\n' +
    '  "solve_plan": "",\n' +
    '  "solve_optimize": "",\n' +
    '  "solve_cook": "",\n' +
    '  "solve_shop": "",\n' +
    '  "value_section_tag": "WHAT CHANGES MONDAY",\n' +
    '  "value_section": "",\n' +
    '  "proof_bar": ["Validated across 10,000 household profiles", "Built by first responders", ""],\n' +
    '  "proof_origin_line": "",\n' +
    '  "proof_validation_line": "",\n' +
    '  "proof_founding_line": "",\n' +
    '  "closing_headline": "",\n' +
    '  "cta_primary": "' + ctaConf.cta + '",\n' +
    '  "cta_supporting": "",\n' +
    '  "cta_exclusivity": "First 5,000 families only — founding price locked forever",\n' +
    '  "cta_scarcity": "First 5,000 families lock in $7.99/month forever",\n' +
    '  "cta_loss_aversion": "After that: $19.99/month",\n' +
    '  "cta_url": "' + lpUrl + '"\n' +
    '}';

  try {
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Generate landing page copy for the ' + (brief.icp || 'selected') + ' ICP' + (brief.theme ? ' with theme: ' + brief.theme : '') + '. Follow the 7-section structure exactly. Return only the JSON object.' }]
      }),
      muteHttpExceptions: true
    });

    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply && data.error) return { ok: false, error: typeof data.error === 'object' ? data.error.message : String(data.error) };

    try {
      var jsonStr = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
      var result = JSON.parse(jsonStr);
      // Back-compat: keep proof_items pointing to same array as proof_bar
      result.proof_items = Array.isArray(result.proof_bar) ? result.proof_bar : (result.proof_items || []);

      // Auto-generate SEO metadata after successful LP parse
      var seoResult = null;
      try {
        var _seoResp = generateLpSeo(brief, result);
        if (_seoResp && _seoResp.ok) seoResult = _seoResp.seo;
      } catch (_seoErr) {
        Logger.log('buildLandingPage: generateLpSeo failed — ' + _seoErr.message);
      }

      return { ok: true, lp: result, seo: seoResult };
    } catch (e) {
      return { ok: true, lp: null, raw: reply };
    }
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── generateLpSeo ─────────────────────────────────────────────────────────────

/**
 * Generates SEO metadata for a landing page.
 * Called automatically after buildLandingPage() — also callable standalone.
 * Returns { ok: true, seo: { meta_title, meta_description, og_title, og_description,
 *   focus_keyword, secondary_keywords } }
 */
function generateLpSeo(brief, lpData) {
  if (!brief) return { ok: false, error: 'brief is required' };

  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set' };

  var hero = (lpData && lpData.hero_headline)    || '';
  var sub  = (lpData && lpData.hero_subheadline) || '';
  var icpCtx = '';
  try { icpCtx = _getIcpContext(brief.icp || ''); } catch(e) {}

  var systemPrompt =
    'You are the easyChef Pro SEO strategist. Write metadata that ranks on Google and converts on social.\n\n' +
    '=== PAGE CONTEXT ===\n' +
    'ICP: '              + (brief.icp || '')                    + '\n' +
    (icpCtx ? icpCtx                                            + '\n' : '') +
    'Theme: '            + (brief.theme || '')                  + '\n' +
    'Campaign angle: '   + (brief.campaign_angle || 'savings')  + '\n' +
    'Hero headline: '    + hero                                  + '\n' +
    'Hero subheadline: ' + sub                                   + '\n\n' +
    '=== SEO RULES ===\n' +
    'meta_title: 50–60 chars exactly. Format: "[Specific Benefit] | easyChef Pro". Must include the primary keyword. Count characters carefully.\n' +
    'meta_description: 145–155 chars exactly. Must include one approved stat ($1,336 or 69.5% or 30 min). Ends with a soft CTA. Count characters carefully.\n' +
    'og_title: Under 60 chars. Same as meta_title or a punchy variation — this is what appears when shared on Facebook/Instagram.\n' +
    'og_description: Under 200 chars. Compelling share text — specific benefit + one approved stat.\n' +
    'focus_keyword: 2–4 word phrase. Specific, not generic. Not "meal planning app" but "family meal planning app that saves money".\n' +
    'secondary_keywords: Array of exactly 4 specific phrases. Include savings, time-saving, family, and waste-reduction angles.\n\n' +
    '=== OUTPUT FORMAT ===\n' +
    'Return ONLY valid JSON. No markdown. No explanation.\n' +
    '{\n' +
    '  "meta_title": "",\n' +
    '  "meta_description": "",\n' +
    '  "og_title": "",\n' +
    '  "og_description": "",\n' +
    '  "focus_keyword": "",\n' +
    '  "secondary_keywords": ["", "", "", ""]\n' +
    '}';

  try {
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type':      'application/json'
      },
      payload: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: 'Generate SEO metadata for the ' + (brief.icp || 'selected') + ' ICP landing page. Return only the JSON object.' }]
      }),
      muteHttpExceptions: true
    });

    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply && data.error) return { ok: false, error: typeof data.error === 'object' ? data.error.message : String(data.error) };

    try {
      var jsonStr = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
      var seo     = JSON.parse(jsonStr);
      return { ok: true, seo: seo };
    } catch(e) {
      return { ok: true, seo: null, raw: reply };
    }
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── LifeStages compiler — injects lifecycle section context into generation ───
// Maps ICP code to life_stage_id, reads the stage from LifeStages tab,
// and returns a formatted prompt block. Default: busy_parent.
function _compileLifeStageBlock(icpCode, lifeStageId) {
  try {
    var stageId = String(lifeStageId || '').toLowerCase().trim();
    if (!stageId && icpCode) {
      var icp = String(icpCode).toLowerCase();
      if      (icp.indexOf('newlywed') !== -1)                                        stageId = 'newlywed';
      else if (icp.indexOf('empty_nest') !== -1)                                      stageId = 'empty_nester';
      else if (icp.indexOf('meal_prep') !== -1 || icp.indexOf('health') !== -1 ||
               icp.indexOf('optimizer') !== -1 || icp.indexOf('fitness') !== -1)      stageId = 'meal_prep_phase';
      else                                                                             stageId = 'busy_parent';
    }
    if (!stageId) stageId = 'busy_parent';

    var stage = getLifeStages(stageId);
    if (!stage) stage = getLifeStages('busy_parent');
    if (!stage) return '';

    return '=== LIFECYCLE SECTION — LIFE STAGE CONTEXT ===\n' +
      'Current chapter: ' + stage.current_chapter + '\n' +
      'Next chapter: '    + stage.next_chapter + '\n' +
      'Recognition line (what they read and think "that is exactly where I am"):\n' +
      '  "' + stage.stage_recognition_line + '"\n' +
      'Next stage bridge: ' + stage.next_stage_bridge + '\n' +
      'Adaptation copy for the LP lifecycle section:\n' +
      '  "' + stage.adaptation_copy + '"\n\n';
  } catch(e) {
    Logger.log('[_compileLifeStageBlock] error: ' + e.message);
    return '';
  }
}

// ── Manual Mode — section emotional guide for wizard (Task 3) ─────────────────
// Reads LP_DOCTRINE_001.emotional_map for the given section.
// Returns emotional_job (entry → exit) and what_kills_it from the section laws.
function getSectionEmotionalGuide(lpSection) {
  try {
    var strat = getCampaignStrategy('LP_DOCTRINE_001');
    if (!strat || !strat.value) return { ok: false, error: 'LP_DOCTRINE_001 not seeded' };
    var v    = strat.value;
    var key  = String(lpSection || '').toLowerCase().trim();
    var em   = v.emotional_map && v.emotional_map[key];
    if (!em) {
      return { ok: false, error: 'No emotional_map entry for section "' + key + '"', available_sections: v.sections || [] };
    }
    var wordTarget = (v.section_word_targets && v.section_word_targets[key]) || null;

    // Derive what_kills_it from the LP spine laws (governance rules that name each section)
    var kills = {
      hook:     'Product mention · feature name · generic pain',
      problem:  'Shame language · blaming the person · abstract pain',
      agitate:  'Multiple vague costs · drama · exaggeration',
      solve:    'Feature list · product demo · jargon',
      value:    'Feature specs · statistics · claims',
      lifecycle:'Generic lifecycle claim · no life stage specificity',
      proof:    'Invented stats · rounded numbers · paraphrased claims',
      cta:      'Pressure · "sign up" · feature-based CTA'
    };

    return {
      ok:              true,
      section:         key,
      emotional_entry: em.entry || '',
      emotional_exit:  em.exit  || '',
      emotional_job:   'Recognition — ' + em.entry + ' → ' + em.exit,
      what_kills_it:   kills[key] || '',
      word_target:     wordTarget
    };
  } catch(e) {
    Logger.log('[getSectionEmotionalGuide] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Manual Mode — phone rule enforcer for image briefs (Task 4) ──────────────
// Checks if an image brief text violates the social/video arc phone rule.
// LP assets are always exempt. Returns {ok, warning, requires_ml_approval}.
function checkPhoneRule(postNumber, imageBriefText, assetType) {
  try {
    var type = String(assetType || '').toLowerCase();
    if (type === 'lp' || type === 'landing_page') {
      return { ok: true, warning: null, requires_ml_approval: false, lp_exempt: true };
    }
    var pn   = parseInt(postNumber) || 0;
    var text = String(imageBriefText || '').toLowerCase();
    var phoneTerms = ['phone', 'app screen', 'app screenshot', 'mobile screen', 'handset'];
    var violates   = pn >= 1 && pn <= 3 && phoneTerms.some(function(t) { return text.indexOf(t) !== -1; });
    if (violates) {
      return {
        ok:                   true,
        warning:              'Phone rule — social/video arc only. Phone appears at post 4. Posts 1-3 are problem world only.',
        requires_ml_approval: true,
        post_number:          pn,
        rule_ref:             'PHONE_RULE_LP_001'
      };
    }
    return { ok: true, warning: null, requires_ml_approval: false };
  } catch(e) {
    Logger.log('[checkPhoneRule] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Manual Mode — visual direction context for image brief form (Task 5) ──────
// Auto-populates three read-only context fields above the free-text brief input:
//   1. ICP emotional context (primary_pain from ICPProfiles)
//   2. Theme image world (image_mood_hook posts 1-3, image_mood_cta posts 6+)
//   3. LP section emotional job (from LP_DOCTRINE_001.emotional_map)
function getVisualDirectionContext(campaignId, lpSection, postNumber) {
  try {
    var brief = campaignId ? getCampaignBriefs(campaignId) : null;

    // 1 — ICP emotional context
    var icpContext = '';
    if (brief && brief.icp_code) {
      var icp = getIcpProfile(brief.icp_code);
      if (icp) icpContext = icp.primary_pain || icp.psychographics || '';
    }

    // 2 — Theme image world
    var themeImageWorld = '';
    if (brief && brief.theme) {
      var themes = getThemeLibrary();
      var th = themes.filter(function(t) {
        return t.theme_slug === brief.theme || t.theme_name === brief.theme || t.id === brief.theme;
      })[0];
      if (th) {
        var pn = parseInt(postNumber) || 1;
        themeImageWorld = pn <= 3 ? (th.image_mood_hook || th.image_mood_cta || '')
                                  : (th.image_mood_cta  || th.image_mood_hook || '');
      }
    }

    // 3 — LP section emotional job
    var sectionGuide = lpSection ? getSectionEmotionalGuide(lpSection) : null;
    var sectionJob   = sectionGuide && sectionGuide.ok
      ? 'Emotional job: ' + sectionGuide.emotional_job + '. What kills it: ' + sectionGuide.what_kills_it
      : '';

    return {
      ok:                    true,
      icp_emotional_context: icpContext,
      theme_image_world:     themeImageWorld,
      section_emotional_job: sectionJob
    };
  } catch(e) {
    Logger.log('[getVisualDirectionContext] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}