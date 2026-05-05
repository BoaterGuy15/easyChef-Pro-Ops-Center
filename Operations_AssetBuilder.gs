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
          id:           p.id,
          campaign_id:  p.campaign_id,
          slug:         p.slug,
          hero_headline:p.hero_headline,
          status:       p.status || 'draft',
          icp_code:     resolved,
          name:         p.hero_headline || p.slug || p.id
        };
      });

    return { ok: true, pages: pages };
  } catch (e) {
    return { ok: false, error: e.message, pages: [] };
  }
}

// ── buildEmailSequence ────────────────────────────────────────────────────────

/**
 * Generates an 8-email sequence (SEQ-1: 3 emails + SEQ-2: 5 emails) via Claude.
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

  var claimsCtx = _getClaimsContext();
  var icpCtx    = _getIcpContext(brief.icp);

  var systemPrompt =
    'You are the easyChef Pro email sequence writer. You write conversion email copy.\n\n' +
    _AB_ARCH +
    claimsCtx +
    _AB_VOICE +
    '=== TARGET ICP ===\n' +
    icpCtx + '\n' +
    '=== CAMPAIGN CONTEXT ===\n' +
    'Campaign: '    + (brief.name || '') + '\n' +
    'Landing page: ' + lpUrl + '\n' +
    'Headline: '    + (copy && copy.headline    || '') + '\n' +
    'LP Hero: '     + (copy && copy.lp_hero     || '') + '\n' +
    'Primary CTA: ' + (copy && copy.cta_primary || '') + '\n\n' +
    '=== EMAIL SEQUENCE STRUCTURE ===\n' +
    'SEQ-1 — Welcome (3 emails, days 0 / 2 / 5):\n' +
    '  Email 1 (Day 0): Welcome + hook. Subject uses money angle. Body delivers the promise.\n' +
    '  Email 2 (Day 2): Problem deepener. Agitate the pain, introduce the solution.\n' +
    '  Email 3 (Day 5): Social proof + founding price urgency. One strong testimonial-style story.\n\n' +
    'SEQ-2 — Nurture (5 emails, days 7 / 10 / 14 / 18 / 25):\n' +
    '  Email 4 (Day 7):  Feature spotlight — meal planning saves $1,336/year. Show the maths.\n' +
    '  Email 5 (Day 10): Feature spotlight — 30 minutes fridge to table. Paint the scene.\n' +
    '  Email 6 (Day 14): Feature spotlight — 69.5% less food waste. Make it feel real.\n' +
    '  Email 7 (Day 18): Objection handler — "Is this worth $7.99?" Answer directly.\n' +
    '  Email 8 (Day 25): Final urgency. Founding price closes soon. Last chance framing.\n\n' +
    '=== OUTPUT FORMAT ===\n' +
    'Return ONLY valid JSON. No markdown. No explanation.\n' +
    '{\n' +
    '  "sequence": [\n' +
    '    {\n' +
    '      "seq_id": "SEQ-1-E1",\n' +
    '      "send_day": 0,\n' +
    '      "subject": "under 50 chars, no emojis",\n' +
    '      "preheader": "under 90 chars, extends the subject",\n' +
    '      "body": "Plain text email body, 3-5 short paragraphs, no markdown",\n' +
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
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Generate the 8-email sequence for the ' + (brief.icp || 'selected') + ' ICP. Return only the JSON object.' }]
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
  var lpUrl    = 'https://easychefpro.com/' + (brief.slug || 'lp/waitlist');

  var _ctaConfigs = {
    waitlist: { cta: 'Join the waitlist free — early access July 1', loss: 'Founding price ends at 5,000 families' },
    download: { cta: 'Download free on App Store',                   loss: 'Founding price ends soon' },
    founding: { cta: 'Lock in $7.99/month before price goes to $19.99', loss: '60% off — first 5,000 families only' },
    referral: { cta: 'Share with one mom who needs this',            loss: "She saves $1,336 this year — or she doesn't" },
    affiliate:{ cta: 'Get early access — no credit card',            loss: 'Founding price for referred families only' },
    recipe:   { cta: 'See the full recipe free in easyChef Pro',     loss: 'Free during beta — paid after launch' },
    upgrade:  { cta: 'Upgrade now — founding price locks forever',   loss: 'Price goes to $19.99 on July 1' }
  };
  var ctaConf = _ctaConfigs[ctaType] || _ctaConfigs.waitlist;

  var claimsCtx    = _getClaimsContext();
  var icpCtx       = _getIcpContext(brief.icp);
  var platformNote = _getPlatformNote(channel);

  var systemPrompt =
    'You are the easyChef Pro social media writer.\n\n' +
    _AB_ARCH +
    claimsCtx +
    _AB_VOICE +
    '=== PLATFORM ===\n' +
    platformNote + '\n\n' +
    '=== TARGET ICP ===\n' +
    icpCtx + '\n' +
    '=== CAMPAIGN CONTEXT ===\n' +
    'Landing page: ' + lpUrl + '\n' +
    'Headline: '    + (copy && copy.headline    || '') + '\n' +
    'Social hook: ' + (copy && copy.social_hook || '') + '\n' +
    'Primary CTA: ' + (copy && copy.cta_primary || '') + '\n\n' +
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
    '  CTA: "Join the founding waitlist free — no credit card."\n\n' +
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
    'Sentence 4 — BRAND SPECS: Character holds smartphone showing red easyChef Pro app interface\n' +
    '  matching post theme (meal plan screen / savings screen / recipe screen). Warm tones only,\n' +
    '  no blue or navy, no studio lighting, no posed expressions, Facebook 1200x630px horizontal.\n\n' +
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
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: 'Generate 5 ' + channel + ' posts for the ' + (brief.icp || 'selected') + ' ICP. Return only the JSON object.' }]
      }),
      muteHttpExceptions: true
    });

    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply && data.error) return { ok: false, error: typeof data.error === 'object' ? data.error.message : String(data.error) };

    try {
      var jsonStr = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
      var result = JSON.parse(jsonStr);
      return { ok: true, posts: result.posts || [] };
    } catch (e) {
      return { ok: true, posts: [], raw: reply };
    }
  } catch (e) {
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

  var lpUrl = 'https://easychefpro.com/' + (brief.slug || 'lp/waitlist');

  var claimsCtx = _getClaimsContext();
  var icpCtx    = _getIcpContext(brief.icp);

  var systemPrompt =
    'You are the easyChef Pro landing page writer. You write high-converting landing page copy.\n\n' +
    _AB_ARCH +
    claimsCtx +
    _AB_VOICE +
    '=== TARGET ICP ===\n' +
    icpCtx + '\n' +
    '=== CAMPAIGN CONTEXT ===\n' +
    'Landing page URL: ' + lpUrl + '\n' +
    'Funnel: '       + (brief.funnel || '') + '\n' +
    'Campaign name: '+ (brief.name   || '') + '\n' +
    (copy ? 'Existing headline: ' + (copy.headline || '') + '\n' : '') +
    (copy ? 'LP hero copy: '      + (copy.lp_hero  || '') + '\n' : '') + '\n' +
    '=== LP STRUCTURE ===\n' +
    'Hero: Headline + subheadline + primary CTA above the fold.\n' +
    'Problem block: 2-3 sentences making the pain feel real and present.\n' +
    'Solve block: One clear sentence introducing easyChef Pro as the answer.\n' +
    'Proof bar: 3 exact stats from the approved claims list.\n' +
    'Social proof: One believable family outcome story (2-3 sentences).\n' +
    'Closing CTA: Urgency-framed founding price offer.\n\n' +
    '=== OUTPUT FORMAT ===\n' +
    'Return ONLY valid JSON. No markdown. No explanation.\n' +
    '{\n' +
    '  "hero_headline": "Stops the scroll — specific to the ICP pain",\n' +
    '  "hero_subheadline": "Names the exact pain in one plain sentence",\n' +
    '  "hero_cta": "Outcome-framed, under 6 words",\n' +
    '  "problem_section": "2-3 sentences making the pain feel real",\n' +
    '  "solve_section": "One sentence introducing easyChef Pro",\n' +
    '  "proof_items": ["exact claim from approved list", "exact claim", "exact claim"],\n' +
    '  "social_proof": "2-3 sentence believable family outcome story",\n' +
    '  "closing_headline": "Urgency headline for final CTA section",\n' +
    '  "cta_primary": "Founding price offer — one sentence",\n' +
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
        messages: [{ role: 'user', content: 'Generate landing page copy for the ' + (brief.icp || 'selected') + ' ICP. Return only the JSON object.' }]
      }),
      muteHttpExceptions: true
    });

    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply && data.error) return { ok: false, error: typeof data.error === 'object' ? data.error.message : String(data.error) };

    try {
      var jsonStr = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
      var result = JSON.parse(jsonStr);
      return { ok: true, lp: result };
    } catch (e) {
      return { ok: true, lp: null, raw: reply };
    }
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
