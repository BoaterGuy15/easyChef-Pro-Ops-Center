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
  'CTA RULE: Every CTA drives to the landing page. Never link to the main website or App Store (pre-launch).\n\n';

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
      return 'ICP: ' + profile.name + '\n' +
        'Demographics: ' + (profile.demographics || '') + '\n' +
        'Primary pain: ' + (profile.primary_pain || '') + '\n' +
        'Value trigger: ' + (profile.value_trigger || '') + '\n' +
        'Message hierarchy: ' + (profile.message_hierarchy || '') + '\n';
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

/**
 * Builds a story context object from a brief, picking up all theme-injected fields
 * the frontend adds via _ccExtendBriefWithTheme().
 */
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
    blueprint:        brief.blueprint        || ''
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

/**
 * Returns a complete base system prompt with STORY CONTEXT injected.
 * type: 'social_post' | 'landing_page' | 'email' | 'image_prompt'
 * context: same object as _buildStoryContextBlock
 */
function getMasterSystemPrompt(type, context) {
  var ctx        = context || {};
  Logger.log('[MASTER PROMPT CTX] type=' + type + ' theme=' + (ctx.theme||'') + ' icp=' + (ctx.icp_code||'') +
    ' hook_angle=' + (ctx.hook_angle||'') + ' problem_angle=' + (ctx.problem_angle||'') +
    ' feature_hook=' + (ctx.feature_hook||'') + ' emotional_entry=' + (ctx.emotional_entry||''));
  var storyBlock = _buildStoryContextBlock(ctx);
  var claimsCtx  = '';
  try { claimsCtx = _getClaimsContext(); }
  catch(e) { claimsCtx = 'Use only approved claims. Do not invent statistics.\n\n'; }
  claimsCtx += 'FOUNDING OFFER RULE: founding_offer field must use exact wording: "Lock in $7.99/month founding price — 60% off forever". Never write "50% off" in any form.\n\n';
  claimsCtx += 'PROOF BAR RULE: proof_bar is always an array of exactly 3 items.\n' +
    '  Item 1 — creative social proof statement generated per campaign. Style: "Busy families are already..." or similar descriptive trust language. NEVER a stat. NEVER a percentage. NEVER a dollar amount. NEVER an invented user count. Descriptive trust language only.\n' +
    '  Item 2 — exact wording always: "69.5% less food waste"\n' +
    '  Item 3 — exact wording always: "30 minutes fridge to table"\n\n';
  var icpCtx = '';
  try { icpCtx = _getIcpContext(ctx.icp_code || ctx.icp || ''); }
  catch(e) { icpCtx = 'ICP: ' + (ctx.icp_code || '') + '\n'; }

  // Dynamic visual anchor block — built from ThemeLibrary fields, works for any theme
  var visualBlock = '';
  if (ctx.image_mood_hook || ctx.image_mood_cta || ctx.theme_food) {
    visualBlock = '=== VISUAL ANCHORS FOR THIS CAMPAIGN ===\n';
    if (ctx.image_mood_hook) visualBlock += 'HOOK IMAGE MOOD: '           + ctx.image_mood_hook + '\n';
    if (ctx.image_mood_cta)  visualBlock += 'CTA IMAGE MOOD: '            + ctx.image_mood_cta  + '\n';
    if (ctx.theme_food)      visualBlock += 'FOOD IN THIS CAMPAIGN: '     + ctx.theme_food      + '\n';
    visualBlock += 'Every post must match these visual scenes. Write copy that pairs with these images.\n\n';
  }

  if (type === 'social_post') {
    return 'You are the easyChef Pro social media writer.\n\n' +
      _AB_ARCH + _AB_VOICE + claimsCtx + storyBlock + visualBlock +
      '=== TARGET ICP ===\n' + icpCtx + '\n';
  }
  if (type === 'landing_page') {
    return 'You are the easyChef Pro landing page writer. You write high-converting landing page copy.\n\n' +
      _AB_ARCH + _AB_VOICE +
      'CRITICAL: Never invent testimonials, names, or social proof stories. Never use statistics that are not in the approved claims list. Approved claims only — exact wording: $1,336/year · 69.5% · 30 minutes · 9 patent-pending technologies · 800,000 products · 10,000 recipe pages · registered dietitians · validated across 10,000 household profiles · built by first responders\n\n' +
      claimsCtx + storyBlock + visualBlock +
      '=== TARGET ICP ===\n' + icpCtx + '\n';
  }
  if (type === 'email') {
    return 'You are the easyChef Pro email sequence writer. You write conversion email copy.\n\n' +
      _AB_ARCH + _AB_VOICE + claimsCtx + storyBlock + visualBlock +
      '=== TARGET ICP ===\n' + icpCtx + '\n';
  }
  // image_prompt: story block only — caller merges with brand/visual rules
  if (type === 'image_prompt') {
    return storyBlock + visualBlock;
  }
  return _AB_ARCH + _AB_VOICE + claimsCtx + storyBlock + visualBlock +
    '=== TARGET ICP ===\n' + icpCtx + '\n';
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
function _getChannelPostCount(channelName, briefCount) {
  var ch = (channelName || '').toLowerCase();
  var defaults = { pinterest: 5, nextdoor: 3 };
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

  var lpUrl = 'https://easychefpro.com/' + (brief.slug || 'lp/waitlist');

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
  var lpUrl    = 'https://easychefpro.com/' + (brief.slug || 'lp/waitlist');

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
  var socialChannels = channels.filter(function(ch) {
    var lc = (ch || '').toLowerCase();
    return lc && lc !== 'email' && lc !== 'push notifications';
  });
  if (!socialChannels.length) return { ok: true, posts: [], stagger_schedule: [] };

  var allPosts = [];
  var errors   = [];
  var sheetChannels;
  try { sheetChannels = getChannels(); } catch(e) { sheetChannels = []; }

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

  var lpUrl   = 'https://easychefpro.com/' + (brief.slug || 'lp/waitlist');
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
    getMasterSystemPrompt('landing_page', _lpStoryCtx) +
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
    'hero_headline: Mirrors the campaign hook. Specific to the ICP pain. Under 12 words.\n' +
    'hero_subheadline: Names the exact moment in plain language. One sentence. Under 20 words.\n' +
    'hero_cta: Use this exact text: "' + ctaConf.cta + '"\n\n' +
    'SECTION 2 — PROBLEM\n' +
    'problem_section: Her exact moment. Name the 6:30 PM wall precisely. No solution. No product mention. 2-3 sentences.\n\n' +
    'SECTION 3 — AGITATE\n' +
    'agitate_section: The cost. Use $1,336/year exact wording. Also $111/month. Also $25/week. One undeniable number per sentence. 2-3 sentences maximum.\n\n' +
    'SECTION 4 — SOLVE\n' +
    'solve_section: One sentence only. Write: "easyChef Pro looks at what is in your fridge and tells you exactly what to make tonight." Do not add feature lists.\n\n' +
    'SECTION 5 — VALUE\n' +
    'value_section: Three outcomes she wants. Not features — feelings and results. Write as 3 flowing sentences, not bullet points.\n\n' +
    'SECTION 6 — PROOF\n' +
    'proof_bar: Array of exactly 3 approved claims. Use only exact wording from the approved list. NEVER invent testimonials, names, or make-up stats. Do not write "Join 10,000 families" — that is not an approved claim. Use: "Validated across 10,000 household profiles" and "Built by first responders" and one stat from the claims list.\n\n' +
    'SECTION 7 — CTA\n' +
    'closing_headline: Urgency-framed founding price headline. One sentence.\n' +
    'cta_primary: Write exactly: "' + ctaConf.cta + '"\n' +
    'cta_scarcity: Write exactly: "First 5,000 families lock in $7.99/month forever"\n' +
    'cta_loss_aversion: Write exactly: "After that: $19.99/month"\n\n' +
    '=== OUTPUT FORMAT ===\n' +
    'Return ONLY valid JSON. No markdown. No explanation.\n' +
    '{\n' +
    '  "hero_headline": "",\n' +
    '  "hero_subheadline": "",\n' +
    '  "hero_cta": "' + ctaConf.cta + '",\n' +
    '  "problem_section": "",\n' +
    '  "agitate_section": "",\n' +
    '  "solve_section": "easyChef Pro looks at what is in your fridge and tells you exactly what to make tonight.",\n' +
    '  "value_section": "",\n' +
    '  "proof_bar": ["Validated across 10,000 household profiles", "Built by first responders", ""],\n' +
    '  "closing_headline": "",\n' +
    '  "cta_primary": "' + ctaConf.cta + '",\n' +
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
      return { ok: true, lp: result };
    } catch (e) {
      return { ok: true, lp: null, raw: reply };
    }
  } catch (e) {
    return { ok: false, error: e.message };
  }
}