// ─────────────────────────────────────────────────────────────────────────────
// Operations_CampaignKickstart.gs
// ─────────────────────────────────────────────────────────────────────────────

// FIX 3 — Open the spreadsheet once and read all tabs needed for kickstart.
// Replaces four separate _getCampaignSpreadsheet() calls with one.
function _getKsSheetData() {
  var ss = _getCampaignSpreadsheet();
  var result = { types: [], stages: [], icps: [] };

  try {
    var typesSheet = ss.getSheetByName(_CC_TAB.CAMPAIGN_TYPES);
    if (typesSheet && typesSheet.getLastRow() >= 2) {
      result.types = typesSheet
        .getRange(2, 1, typesSheet.getLastRow() - 1, _CC_HDR.CampaignTypes.length)
        .getValues()
        .filter(function(r) { return r[0]; })
        .map(_ctRowToObj)
        .filter(function(t) { return t.active; });
    }
  } catch(e) {}

  try {
    var stagesSheet = ss.getSheetByName(_CC_TAB.FUNNEL_STAGES);
    if (stagesSheet && stagesSheet.getLastRow() >= 2) {
      result.stages = stagesSheet
        .getRange(2, 1, stagesSheet.getLastRow() - 1, _CC_HDR.FunnelStages.length)
        .getValues()
        .filter(function(r) { return r[0]; })
        .map(_fsRowToObj);
    }
  } catch(e) {}

  try {
    var icpSheet = ss.getSheetByName(_CC_TAB.ICP);
    if (icpSheet && icpSheet.getLastRow() >= 2) {
      result.icps = icpSheet
        .getRange(2, 1, icpSheet.getLastRow() - 1, _CC_HDR.ICPProfiles.length)
        .getValues()
        .filter(function(r) { return r[0]; })
        .map(_icpRowToObj);
    }
  } catch(e) {}

  return result;
}

/**
 * Takes a plain-language customer description and goal, identifies the matching
 * ICP, selects the right funnel blueprint, and returns a complete campaign brief
 * as structured JSON ready to auto-fill the Campaign Center Brief Builder.
 * Returns { ok: true, campaign: { icp_match, headline, utm_campaign_code, ... } }
 */
function campaignKickstart(prompt) {
  if (!prompt) return { ok: false, error: 'prompt is required' };

  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set in Script Properties' };

  // FIX 3 — single spreadsheet open for all tab reads
  var sheetData = _getKsSheetData();

  // ── ICP context (compact) ────────────────────────────────────────────────
  var icpLines = 'ICPs: ';
  if (sheetData.icps.length) {
    icpLines += sheetData.icps.map(function(p) {
      return p.code + ' (' + (p.name || p.code) + ')';
    }).join(', ');
  } else {
    icpLines += 'super_mom (Super Mom), alpha_recruit (Alpha Recruit), budget_family (Budget Family), professional (Working Professional), health_optimizer (Health Optimizer)';
  }

  // ── Campaign type detection (compact — keywords only) ────────────────────
  var ctaDetect = 'Campaign type: ';
  if (sheetData.types.length) {
    ctaDetect += sheetData.types.map(function(t) {
      var kw = (t.detection_keywords || '').split(',').map(function(k) { return k.trim(); }).filter(Boolean).slice(0, 3).join('/');
      return '"' + kw + '" → ' + t.cta_type;
    }).join(' | ');
    ctaDetect += ' | default → waitlist';
  } else {
    ctaDetect += '"waitlist/sign up" → waitlist | "download/app store" → download | "founding/lock in" → founding | "referral/share" → referral | "affiliate/partner" → affiliate | "recipe/content" → recipe | "upgrade/paywall" → upgrade | default → waitlist';
  }

  // ── Funnel stages label (1 line) ─────────────────────────────────────────
  var stagesLabel = 'Hook → Problem → Agitate → Solve → Value → Proof → CTA';
  if (sheetData.stages.length) {
    stagesLabel = sheetData.stages.map(function(s) {
      return s.stage_name.charAt(0).toUpperCase() + s.stage_name.slice(1);
    }).join(' → ');
  }

  // ── Theme feature context — look up ThemeLibrary if THEME detected in prompt ─
  var themeContext = '';
  try {
    var themeMatch = String(prompt).match(/THEME:\s*([^\n]+)/i);
    if (themeMatch && themeMatch[1]) {
      var themeQuery = themeMatch[1].trim().toLowerCase();
      var allThemes = getThemeLibrary('');
      for (var ti = 0; ti < allThemes.length; ti++) {
        var tm = allThemes[ti];
        if ((tm.theme_name || '').toLowerCase().indexOf(themeQuery) > -1 || themeQuery.indexOf((tm.theme_name || '').toLowerCase()) > -1) {
          themeContext =
            '\nTHEME LOOKUP — ' + tm.theme_name + ':\n' +
            (tm.app_feature      ? 'App feature: ' + tm.app_feature + '\n' : '') +
            (tm.app_screen_label ? 'App screen: '  + tm.app_screen_label + '\n' : '') +
            (tm.feature_hook     ? 'Post 4 (solve) angle: ' + tm.feature_hook + '\n' : '') +
            (tm.feature_proof    ? 'Post 6 (proof) stat: '  + tm.feature_proof + '\n' : '') +
            (tm.emotional_entry  ? 'Entry emotion: ' + tm.emotional_entry + '\n' : '') +
            (tm.emotional_payoff ? 'Payoff emotion: ' + tm.emotional_payoff + '\n' : '') +
            (tm.agitate_angle    ? 'Agitate angle (use this specific cost in agitate_block): ' + tm.agitate_angle + '\n' : '') +
            (tm.urgency_trigger  ? 'Urgency trigger for this theme: ' + tm.urgency_trigger + '\n' : '');
          break;
        }
      }
    }
  } catch(e) {}

  // ── Pre-launch phase guard ──────────────────────────────────────────────────
  var launchDate  = new Date('2026-07-01');
  var now         = new Date();
  var isPreLaunch = now < launchDate;
  var phaseRule   = isPreLaunch
    ? 'PHASE: PRE-LAUNCH (today is ' + Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd') + ', app launches July 1 2026). ' +
      'Blueprint MUST default to A-Waitlist for ALL campaigns. ' +
      'cta_type MUST default to "waitlist". ' +
      'Only use B-App Download if the user explicitly writes "app download", "after launch", or "July 1 onwards".'
    : 'PHASE: POST-LAUNCH (app is live). Match blueprint and cta_type to campaign goal.';

  // FIX 2 — compact system prompt, under 800 tokens
  var systemPrompt =
    'You are the easyChef Pro campaign architect. Match the user prompt to an ICP and output a campaign brief as JSON.\n\n' +
    'SCOPE RULE — CRITICAL: Return the 29-field brief object ONLY.\n' +
    'DO NOT generate social post content. DO NOT generate hashtags.\n' +
    'DO NOT generate campaign_structure, social_campaign_arc, or post arrays.\n' +
    'Posts are built in a separate step. Your only job is the 29-field JSON brief.\n\n' +

    phaseRule + '\n\n' +

    icpLines + '\n\n' +

    ctaDetect + '\n\n' +

    '7-step framework: ' + stagesLabel + '\n\n' +

    'Rules: Product is always "easyChef Pro". ' +
    'Approved stats (use exact wording): $1,336/year savings | 69.5% less food waste | 30 minutes fridge to table. ' +
    'Slug format: lp/waitlist-a for waitlist, lp/alpha for founding, /recipes/[slug] for recipe.\n' +
    'FOUNDING OFFER: founding_offer field must be exactly: "Lock in $7.99/month founding price — 60% off forever". Never "50% off" in any form.\n' +
    'AGITATE BLOCK: agitate_block must name the specific cost from the theme (e.g. "$25 in DoorDash when tacos were already in the fridge"). Never use vague language like "feel guilty about the cost". Use the exact dollar figure.\n' +
    'SUBHEADLINE RULE: subheadline must NOT claim existing member counts. Do not write "Join X families" or "Join 5,000 families" — 5,000 is the founding member cap, not a current count. Use benefit copy instead.\n\n'

    'PROOF BAR RULE — CRITICAL:\n' +
    'Return exactly these strings in the proof_bar array. No additions, no prefixes, no paraphrasing:\n' +
    '"$1,336/year"\n' +
    '"69.5% less food waste"\n' +
    '"30 minutes fridge to table"\n' +
    'Never add words before them. Examples of what is WRONG:\n' +
    '"Families save $1,336/year" — WRONG\n' +
    '"Average 30 minutes fridge to table" — WRONG\n' +
    '"69.5%" — WRONG (too short)\n' +
    'You may also use: "Validated across 10,000 household profiles" | "Built by first responders"\n\n' +

    'Detect from prompt: channels (array, lowercase) | theme (recurring series name or "") | ' +
    'publish_day (day name or "") | campaign_angle (savings/speed/waste/proof/urgency/theme) | ' +
    'urgency_trigger (scarcity sentence — for A-Waitlist use theme urgency_trigger or "Free during beta — app launches July 1"; for founding use "Founding price $7.99/month ends at 5,000 families").\n\n' +

    (themeContext ? themeContext + '\n' : '') +

    'KEY NAMES — LOCKED. These are the only valid key names. Do not rename any of them:\n' +
    'icp_match, icp_code, blueprint, campaign_name, channel_recommendation, channels,\n' +
    'slug, headline, subheadline, email_subject_a, email_subject_b, lp_hero,\n' +
    'problem_block, agitate_block, solve_block, proof_bar, cta_type, cta_primary,\n' +
    'social_hook, share_mechanic, utm_campaign_code, founding_offer, theme,\n' +
    'publish_day, campaign_angle, post_count, email_sequences, email_variants, urgency_trigger\n\n' +
    'WRONG NAMES — these will break the parser. Never use them:\n' +
    '"icp" → must be "icp_code"\n' +
    '"primary_headline" or "campaign_headline" → must be "headline"\n' +
    '"problem_statement" or "problem" → must be "problem_block"\n' +
    '"solution_statement" or "solution" → must be "solve_block"\n' +
    '"social_proof" → must be "proof_bar" and must be an array, not a string\n' +
    '"hook" alone → must be "social_hook"\n\n' +
    'STRUCTURE: Single flat JSON object. All 29 keys at root level. No wrappers. No nesting.\n' +
    'Output starts with { and ends with }. Only "channels" and "proof_bar" are arrays.\n\n' +
    'Return ONLY this JSON with all 29 fields filled in:\n' +
    '{\n' +
    '  "icp_match": "Super Mom",\n' +
    '  "icp_code": "super_mom",\n' +
    '  "blueprint": "A-Waitlist",\n' +
    '  "campaign_name": "Taco Tuesday — Week 1",\n' +
    '  "channel_recommendation": "Facebook",\n' +
    '  "channels": ["facebook","instagram"],\n' +
    '  "slug": "lp/waitlist-a",\n' +
    '  "headline": "Your taco ingredients are already in the fridge",\n' +
    '  "subheadline": "easyChef Pro tells you exactly what to make — tonight",\n' +
    '  "email_subject_a": "Your fridge already has Taco Tuesday in it",\n' +
    '  "email_subject_b": "The $25 DoorDash you did not need to order",\n' +
    '  "lp_hero": "Stop ordering takeout from ingredients already in your fridge",\n' +
    '  "problem_block": "It is 6:30 PM and nobody knows what is for dinner",\n' +
    '  "agitate_block": "You spent $25 on DoorDash when tacos were already in the fridge",\n' +
    '  "solve_block": "easyChef Pro looks at what is in your fridge and tells you exactly what to make",\n' +
    '  "proof_bar": ["$1,336/year", "69.5% less food waste", "30 minutes fridge to table"],\n' +
    '  "cta_type": "waitlist",\n' +
    '  "cta_primary": "Join the waitlist free — early access July 1",\n' +
    '  "social_hook": "Your taco ingredients have been sitting there all week",\n' +
    '  "share_mechanic": "",\n' +
    '  "utm_campaign_code": "sm_taco_tuesday_wk1",\n' +
    '  "founding_offer": "Lock in $7.99/month founding price — 60% off forever",\n' +
    '  "theme": "Taco Tuesday",\n' +
    '  "publish_day": "Tuesday",\n' +
    '  "campaign_angle": "savings",\n' +
    '  "post_count": 7,\n' +
    '  "email_sequences": 2,\n' +
    '  "email_variants": 2,\n' +
    '  "urgency_trigger": "Free during beta — app launches July 1"\n' +
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
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1800,
        system:     systemPrompt,
        messages: [{
          role:    'user',
          content: String(prompt)
        }]
      }),
      muteHttpExceptions: true
    });

    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';

    if (!reply && data.error) {
      var errMsg = (typeof data.error === 'object') ? data.error.message : String(data.error);
      return { ok: false, error: errMsg };
    }

    var campaign    = null;
    var rawFallback = null;

    try {
      var jsonStr = reply.trim();
      jsonStr = jsonStr.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
      var fb = jsonStr.indexOf('{');
      if (fb > 0) jsonStr = jsonStr.slice(fb);
      var lb = jsonStr.lastIndexOf('}');
      if (lb > -1) jsonStr = jsonStr.slice(0, lb + 1);
      campaign = JSON.parse(jsonStr);
    } catch (parseErr) {
      Logger.log('[PARSE ERROR] ' + parseErr.message);
      rawFallback = reply;
    }

    // Phase guard runs OUTSIDE try/catch — applies regardless of parse outcome
    Logger.log('[PHASE GUARD] isPreLaunch=' + isPreLaunch + ' | campaign=' + (campaign ? 'parsed' : 'null/raw'));

    if (campaign) {
      if (isPreLaunch) {
        campaign.blueprint        = 'A-Waitlist';
        campaign.cta_type         = 'waitlist';
        campaign.cta_primary      = 'Join the waitlist free — early access July 1';
        campaign.conversion_goal  = 'waitlist_signup_completed';
        campaign.email_sequences  = 2;
        Logger.log('[PHASE GUARD] overridden to A-Waitlist');
      }
      return { ok: true, campaign: campaign };
    }

    // Raw fallback path — patch blueprint + cta_type via regex before frontend parses
    if (isPreLaunch && rawFallback) {
      rawFallback = rawFallback.replace(/"blueprint"\s*:\s*"[^"]*"/g,  '"blueprint":"A-Waitlist"');
      rawFallback = rawFallback.replace(/"cta_type"\s*:\s*"[^"]*"/g,   '"cta_type":"waitlist"');
      Logger.log('[PHASE GUARD] raw fallback patched');
    }
    return { ok: true, campaign: null, raw: rawFallback || reply };

  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── Diagnostic ────────────────────────────────────────────────────────────────
function _testKickstart() {
  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  Logger.log('API key present: ' + (apiKey ? 'YES (' + apiKey.length + ' chars)' : 'NO'));

  var t0 = Date.now();
  var sd = _getKsSheetData();
  Logger.log('Sheet read ms: ' + (Date.now() - t0) + ' | types=' + sd.types.length + ' stages=' + sd.stages.length + ' icps=' + sd.icps.length);

  var t1 = Date.now();
  var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    payload: JSON.stringify({
      model: 'claude-sonnet-4-20250514', max_tokens: 100,
      system: 'Reply with only the word PONG.',
      messages: [{ role: 'user', content: 'PING' }]
    }),
    muteHttpExceptions: true
  });
  Logger.log('API ping ms: ' + (Date.now() - t1));
  Logger.log('HTTP status: ' + resp.getResponseCode());
}
