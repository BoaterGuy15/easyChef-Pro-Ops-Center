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
            (tm.emotional_payoff ? 'Payoff emotion: ' + tm.emotional_payoff + '\n' : '');
          break;
        }
      }
    }
  } catch(e) {}

  // FIX 2 — compact system prompt, under 800 tokens
  var systemPrompt =
    'You are the easyChef Pro campaign architect. Match the user prompt to an ICP and output a campaign brief as JSON.\n\n' +

    icpLines + '\n\n' +

    ctaDetect + '\n\n' +

    '7-step framework: ' + stagesLabel + '\n\n' +

    'Rules: Product is always "easyChef Pro". ' +
    'Approved stats (use exact wording): $1,336/year savings | 69.5% less food waste | 30 minutes fridge to table. ' +
    'Slug format: lp/waitlist-a for waitlist, lp/alpha for founding, /recipes/[slug] for recipe.\n\n' +

    'Detect from prompt: channels (array, lowercase) | theme (recurring series name or "") | ' +
    'publish_day (day name or "") | campaign_angle (savings/speed/waste/proof/urgency/theme) | ' +
    'urgency_trigger (scarcity sentence, default "Founding price $7.99/month ends at 5,000 families").\n\n' +

    (themeContext ? themeContext + '\n' : '') +

    'Return ONLY valid JSON, no markdown, no explanation:\n' +
    '{"icp_match":"","icp_code":"","blueprint":"","campaign_name":"","channel_recommendation":"","channels":[],' +
    '"slug":"","headline":"","subheadline":"","email_subject_a":"","email_subject_b":"",' +
    '"lp_hero":"","problem_block":"","agitate_block":"","solve_block":"",' +
    '"proof_bar":["","",""],"cta_type":"","cta_primary":"","social_hook":"","share_mechanic":"",' +
    '"utm_campaign_code":"","founding_offer":"","theme":"","publish_day":"","campaign_angle":"",' +
    '"post_count":7,"email_sequences":2,"email_variants":2,"urgency_trigger":""}';

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
        max_tokens: 600, // FIX 1 — reduced from 1500
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

    try {
      var jsonStr = reply.trim();
      jsonStr = jsonStr.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
      var campaign = JSON.parse(jsonStr);
      return { ok: true, campaign: campaign };
    } catch (parseErr) {
      return { ok: true, campaign: null, raw: reply };
    }

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
