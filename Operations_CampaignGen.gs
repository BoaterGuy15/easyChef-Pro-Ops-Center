// ─────────────────────────────────────────────────────────────────────────────
// Operations_CampaignGen.gs
// Paste this file into your Apps Script project.
// Requires Operations_CampaignSheets.gs in the same project.
//
// ADD TO doPost in Operations.gs (inside the if/else chain):
//   if (body.action === 'campaign_gen') return json(campaignGen(body.brief));
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Fallback data — used when the sheet returns empty rows ────────────────────

var _CG_FALLBACK_ICP = {
  'Super Mom':
    'Busy parent, household income $60–120K, 2+ kids, extremely time-constrained. ' +
    'Primary pain: no time to plan meals — the 6:30 PM panic staring at an empty fridge is their daily reality. ' +
    'Emotional driver: being a good parent without burning out. Convenience over everything.',
  'Budget Family':
    'Financially stressed household, income $40–80K, 2+ kids. ' +
    'Primary pain: grocery bills eating the budget and food waste from poor planning. Shops at Walmart. ' +
    'Emotional driver: financial control and dignity. Feels the shame of throwing away food they paid for.',
  'Health Optimizer':
    'Health-conscious family focused on nutrition and eating clean. ' +
    'Primary pain: healthy meal planning is complex, time-consuming, and expensive. ' +
    'Emotional driver: confidence that their family is eating well without spending more.',
  'Professional':
    'Dual-income household where time is the scarcest resource. ' +
    'Primary pain: grocery runs and meal planning drain what little mental bandwidth remains after work. ' +
    'Emotional driver: outsourcing the mental load so evenings belong to the family, not the fridge.',
  'Alpha Recruit':
    'Early adopter, tech-savvy, wants founding-member status and exclusivity. ' +
    'Primary pain: generic apps do not match their lifestyle or deliver real savings. ' +
    'Emotional driver: being first, social proof through referral, and locking in $7.99 before the price rises to $10.'
};

var _CG_FALLBACK_CLAIMS = [
  '$1,336 average annual savings',
  '69.5% less food waste',
  '30 minutes fridge to table',
  '$7.99/month founding-member price locked forever',
  '30–60% reduction in monthly grocery spend',
  '9 patent-pending technologies',
  '800,000 products',
  '10,000 recipe pages at launch'
];

// ── ICP profile text builder ───────────────────────────────────────────────────

/**
 * Assembles a rich ICP profile string from ICPProfiles sheet data.
 * Returns null if the row exists but all profile fields are blank
 * (so the caller can fall back to hardcoded text).
 */
function _cgBuildIcpText(d) {
  if (!d || !d.id) return null;
  var parts = [];
  if (d.demographics)        parts.push(d.demographics);
  if (d.psychographics)      parts.push(d.psychographics);
  if (d.primary_pain)        parts.push('Primary pain: '        + d.primary_pain);
  if (d.secondary_pain)      parts.push('Secondary pain: '      + d.secondary_pain);
  if (d.value_trigger)       parts.push('Value trigger: '       + d.value_trigger);
  if (d.loss_aversion)       parts.push('Loss aversion: '       + d.loss_aversion);
  if (d.message_hierarchy)   parts.push('Message hierarchy: '   + d.message_hierarchy);
  if (d.conversion_triggers) parts.push('Conversion triggers: ' + d.conversion_triggers);
  return parts.length ? parts.join('. ') : null;
}

// ── Main generation function ───────────────────────────────────────────────────

/**
 * Generates structured campaign copy for a given campaign brief.
 * Reads ICP profile and approved claims live from the Campaign Center sheet.
 * On success: saves copy to GeneratedCopy tab and registers a DRAFT DL entry.
 * Returns { ok: true, copy: {...}, dl_id: "DL-EM-0008" }
 */
function campaignGen(brief) {
  if (!brief) return { ok: false, error: 'brief is required' };

  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set in Script Properties' };

  // ── 1. Fetch ICP profile from ICPProfiles sheet ───────────────────────────
  var icpProfile = null;
  try {
    var icpData = getIcpProfile(brief.icp);
    icpProfile  = _cgBuildIcpText(icpData);
  } catch (e) {
    // Sheet not yet set up — fall through to hardcoded fallback
  }
  if (!icpProfile) {
    icpProfile = _CG_FALLBACK_ICP[brief.icp] || String(brief.icp || '');
  }

  // ── 2. Fetch approved claims from ApprovedClaims sheet ────────────────────
  var approvedClaims = [];
  try {
    var sheetClaims = getApprovedClaims(); // approved=true only
    approvedClaims  = sheetClaims.map(function(c) { return c.exact_wording; });
  } catch (e) {
    // Sheet not yet set up — fall through to hardcoded fallback
  }
  if (!approvedClaims.length) {
    approvedClaims = _CG_FALLBACK_CLAIMS;
  }

  // ── 3. Build system prompt ────────────────────────────────────────────────
  var channel   = brief.channel || 'Email';
  var isEmail   = channel === 'Email';

  var channelGuidance = isEmail
    ? 'You are writing for EMAIL. Subject lines must be under 50 characters. ' +
      'Email hooks must create immediate open-rate pull. ' +
      'Lead with the money angle OR the emotion angle — never both in the same subject line.'
    : 'You are writing for ' + channel.toUpperCase() + ' (SOCIAL). ' +
      'The hook must stop the scroll in the first 5 words. ' +
      'No more than 2 sentences for the social hook. Short, punchy, pattern-interrupt.';

  var systemPrompt =
    'You are the easyChef Pro campaign copywriter. You write conversion copy that moves people from scroll to action.\n\n' +

    '=== 7-STEP CAMPAIGN FRAMEWORK ===\n' +
    'Every asset you write follows this exact sequence:\n' +
    '1. HOOK — stops the scroll. Specific, unexpected, or emotionally resonant. Never generic.\n' +
    '2. PROBLEM — names the exact pain the ICP feels right now. Not a category. The specific moment.\n' +
    '3. AGITATE — make the pain feel real and present. Not dramatic. Just honest and specific.\n' +
    '4. SOLVE — introduce easyChef Pro as the obvious answer. One clear sentence.\n' +
    '5. VALUE — one specific outcome from the approved claims list. Exact figure only. Never invented.\n' +
    '6. PROOF — one validated stat from the approved claims list. Do not fabricate numbers.\n' +
    '7. CTA — outcome-framed, low friction. Tell them what they get, not what they do.\n\n' +

    '=== TARGET ICP ===\n' +
    (brief.icp || 'Unknown') + ': ' + icpProfile + '\n\n' +

    '=== APPROVED CLAIMS — USE EXACT WORDING ONLY ===\n' +
    approvedClaims.map(function(c, i) { return (i + 1) + '. ' + c; }).join('\n') + '\n' +
    'CRITICAL: Do not invent statistics. Only use figures from this list. If a claim is not on this list, do not use it.\n\n' +

    '=== BRAND VOICE RULES ===\n' +
    '- Empathetic: speak like a friend who understands the struggle, not a marketer selling a product\n' +
    '- Direct: say the thing. No warm-up sentences. No "Are you tired of..."\n' +
    '- No jargon: never use leverage, ecosystem, solution, seamless, game-changer, revolutionary\n' +
    '- No markdown in output values: no bold (**), no bullets (*), no asterisks, no backticks\n' +
    '- Conversational: write how people talk at their kitchen table at 6:30 PM\n' +
    '- Specific: vague copy does not convert. Name the exact pain. Name the exact saving.\n\n' +

    '=== CHANNEL INSTRUCTIONS ===\n' +
    channelGuidance + '\n\n' +

    '=== CAMPAIGN DETAILS ===\n' +
    'Campaign ID: '     + (brief.id     || '') + '\n' +
    'Campaign name: '   + (brief.name   || '') + '\n' +
    'Funnel: '          + (brief.funnel || '') + '\n' +
    'Conversion goal: ' + (brief.goal   || '') + '\n' +
    'Landing page: https://easychefpro.com/' + (brief.slug || '') + '\n\n' +

    '=== ARCHITECTURE ===\n' +
    'Every piece of content drives to a landing page. The landing page URL is https://easychefpro.com/' + (brief.slug || '[slug]') + '. ' +
    'Every email, every social post, every ad drives to this URL. ' +
    'The URL is tracked via unique DL_IDs so each asset is attributable separately.\n' +
    'PRODUCT NAME: Always write "easyChef Pro". Never write "the app", "this app", or "a meal planning app".\n' +
    'CTA RULE: Every CTA drives to the landing page. Never link to the main website. Never link to the App Store (pre-launch).\n\n' +

    '=== OUTPUT FORMAT ===\n' +
    'Return ONLY a valid JSON object. No explanation before it. No text after it. No markdown wrapping.\n' +
    'Use exactly these keys:\n' +
    '{\n' +
    '  "headline": "Hook step — stops the scroll, specific to the ICP pain",\n' +
    '  "subheadline": "Problem step — names the exact pain in one plain sentence",\n' +
    '  "email_subject_a": "Money angle subject line — under 50 chars, no emojis",\n' +
    '  "email_subject_b": "Time or emotion angle subject line — under 50 chars, no emojis",\n' +
    '  "lp_hero": "Hook expanded for landing page hero section — 2 to 3 sentences, flows Hook into Problem into Solve",\n' +
    '  "proof_bar": ["exact wording from approved list", "exact wording from approved list", "exact wording from approved list"],\n' +
    '  "cta_primary": "CTA — outcome-framed, low friction, under 8 words",\n' +
    '  "social_hook": "Social first line — stops the scroll, under 15 words",\n' +
    '  "share_mechanic": "Viral prompt for thank-you page — 1 sentence, peer-to-peer framing, references the saving"\n' +
    '}';

  // ── 4. Call Anthropic API ─────────────────────────────────────────────────
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
        max_tokens: 1024,
        system:     systemPrompt,
        messages: [{
          role:    'user',
          content: 'Generate the campaign copy JSON for the ' + (brief.icp || 'selected') +
                   ' ICP on the ' + channel + ' channel. Return only the JSON object, nothing else.'
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

    // ── 5. Parse JSON ─────────────────────────────────────────────────────────
    var copy = null;
    try {
      var jsonStr = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
      copy = JSON.parse(jsonStr);
    } catch (parseErr) {
      return { ok: true, copy: null, raw: reply };
    }

    // ── 6. Save to GeneratedCopy tab ──────────────────────────────────────────
    var dlId = '';
    try {
      addGeneratedCopy({
        campaign_id:      brief.id   || '',
        icp_code:         brief.icp  || '',
        channel:          channel,
        headline:         copy.headline       || '',
        subheadline:      copy.subheadline    || '',
        email_subject_a:  copy.email_subject_a|| '',
        email_subject_b:  copy.email_subject_b|| '',
        lp_hero:          copy.lp_hero        || '',
        proof_bar:        copy.proof_bar      || [],
        cta_primary:      copy.cta_primary    || '',
        social_hook:      copy.social_hook    || '',
        share_mechanic:   copy.share_mechanic || ''
      });
    } catch (saveErr) {
      // Non-fatal — return copy even if sheet save fails
      Logger.log('campaignGen: addGeneratedCopy failed — ' + saveErr.message);
    }

    // ── 7. Register DRAFT DL entry ────────────────────────────────────────────
    try {
      dlId = registerDraftDl(brief);
    } catch (dlErr) {
      Logger.log('campaignGen: registerDraftDl failed — ' + dlErr.message);
    }

    return { ok: true, copy: copy, dl_id: dlId };

  } catch (e) {
    return { ok: false, error: e.message };
  }
}
