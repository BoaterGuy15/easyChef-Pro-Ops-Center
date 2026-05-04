// ─────────────────────────────────────────────────────────────────────────────
// Operations_CampaignKickstart.gs
// Paste this file into your Apps Script project.
//
// ADD TO doPost in Operations.gs (inside the if/else chain):
//   if (body.action === 'campaign_kickstart') return json(campaignKickstart(body.prompt));
//
// ─────────────────────────────────────────────────────────────────────────────

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

  var systemPrompt =
    'You are the easyChef Pro campaign architect. A user has described a target customer and goal. ' +
    'Your job is to identify which ICP profile this matches from the list below, select the correct ' +
    'funnel blueprint, and generate a complete campaign brief in JSON format.\n\n' +

    'ICP profiles:\n' +
    '- super_mom: Female 28-45, HHI $40-100K, suburban, overwhelmed at 6:30 PM, primary grocery buyer\n' +
    '- budget_family: 30-50, HHI $30-70K, grocery budget always over, food waste feels like burning cash\n' +
    '- health_optimizer: 28-45, HHI $60-120K, tracks macros, wants nutrition scoring\n' +
    '- professional: 28-45, HHI $80-150K, time-poor, uses food delivery, sees this as a productivity tool\n' +
    '- alpha_recruit: Direct outreach, founding family, personal inbox only\n\n' +

    'Approved claims — use only these exact figures:\n' +
    '$1,336/year savings. 69.5% food waste reduction. 30 minutes fridge to table. ' +
    '9 patent-pending technologies. 800,000 products. 10,000 recipe pages. ' +
    'Registered dietitians. 10,000 household profiles validated. ' +
    '60% off founding price. $7.99/month founding price.\n\n' +

    'Brand voice: Warm, direct, empathetic. Never shame-based. No jargon. ' +
    'No markdown in output. Write like a friend texting not a corporation.\n\n' +

    '7-step framework every campaign follows:\n' +
    'Hook → Problem → Agitate → Solve → Value → Proof → CTA\n\n' +

    'Return a JSON object with these exact fields:\n' +
    '{\n' +
    '  "icp_match": "Human-readable ICP name (e.g. Super Mom)",\n' +
    '  "icp_code": "snake_case ICP key (e.g. super_mom)",\n' +
    '  "blueprint": "Funnel type — one of: A-Waitlist, B-App Download, C-Referral, D-Re-engagement, E-Content, F-Affiliate, G-Paywall Recovery",\n' +
    '  "campaign_name": "Short descriptive campaign name",\n' +
    '  "channel_recommendation": "Primary channel — one of: Email, Facebook, Instagram, TikTok, Pinterest, Nextdoor, Organic, Affiliate, Direct",\n' +
    '  "slug": "Landing page slug path e.g. lp/waitlist-a",\n' +
    '  "headline": "Hook step — stops the scroll, specific to the ICP pain",\n' +
    '  "subheadline": "Problem step — names the exact pain in one plain sentence",\n' +
    '  "email_subject_a": "Money angle subject line — under 50 chars, no emojis",\n' +
    '  "email_subject_b": "Time or emotion angle subject line — under 50 chars, no emojis",\n' +
    '  "lp_hero": "Hook expanded for landing page hero — 2 to 3 sentences flowing Hook into Problem into Solve",\n' +
    '  "problem_block": "Agitate step — 2 sentences making the pain feel real and present",\n' +
    '  "agitate_block": "One honest specific sentence deepening the pain",\n' +
    '  "solve_block": "One clear sentence introducing easyChef Pro as the answer",\n' +
    '  "proof_bar": "Three approved claims separated by · character",\n' +
    '  "cta_primary": "Outcome-framed CTA, low friction, under 8 words",\n' +
    '  "social_hook": "Scroll-stopper first line, under 15 words",\n' +
    '  "share_mechanic": "Viral thank-you page prompt — 1 sentence, peer-to-peer framing, references the saving",\n' +
    '  "utm_campaign_code": "Lowercase hyphenated campaign code e.g. ec-2026-007",\n' +
    '  "founding_offer": "One sentence framing the $7.99 founding price urgency"\n' +
    '}\n\n' +
    'Return only valid JSON. No markdown. No explanation before or after.';

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
        max_tokens: 1500,
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

// ── Diagnostic: run this directly in Apps Script editor to isolate the issue ──
// Run → Run function → _testKickstart
// Then View → Execution log to see the full Anthropic response
function _testKickstart() {
  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  Logger.log('API key present: ' + (apiKey ? 'YES (' + apiKey.length + ' chars)' : 'NO'));

  var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type':      'application/json'
    },
    payload: JSON.stringify({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 100,
      system:     'Reply with only the word PONG.',
      messages: [{ role: 'user', content: 'PING' }]
    }),
    muteHttpExceptions: true
  });

  Logger.log('HTTP status: ' + resp.getResponseCode());
  Logger.log('Raw response: ' + resp.getContentText());
}
