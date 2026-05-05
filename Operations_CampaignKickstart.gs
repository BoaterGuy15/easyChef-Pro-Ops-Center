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

  var icpContext = '';
  try {
    var profiles = getIcpProfiles();
    if (Array.isArray(profiles) && profiles.length) {
      icpContext = 'ICP profiles:\n';
      profiles.forEach(function(p) {
        icpContext += '- ' + p.code + ': ' + (p.demographics || '') + ' — ' + (p.primary_pain || '') + '\n';
      });
      icpContext += '\n';
    }
  } catch (e) {
    icpContext = 'ICP: super_mom — busy mom, 6:30 PM fridge panic\n\n';
  }

  var claimsContext = '';
  try {
    var claims = getApprovedClaims();
    if (Array.isArray(claims) && claims.length) {
      claimsContext = 'Approved claims — use exact wording only — never invent statistics:\n';
      claims.forEach(function(c) {
        claimsContext += '- ' + c.claim_type + ': ' + c.exact_wording + '\n';
      });
      claimsContext += '\n';
    }
  } catch (e) {
    claimsContext = 'Use only: $1,336/year savings, 69.5% less food waste, 30 minutes fridge to table\n\n';
  }

  // Load CampaignTypes for dynamic detection and destination blocks
  var stagesLabel = 'Hook → Problem → Agitate → Solve → Value → Proof → CTA';
  try {
    var ksStages = getFunnelStages();
    if (Array.isArray(ksStages) && ksStages.length) {
      stagesLabel = ksStages.map(function(s) {
        return s.stage_name.charAt(0).toUpperCase() + s.stage_name.slice(1);
      }).join(' → ');
    }
  } catch(e) {}

  var detectionBlock = '';
  var ctaDestBlock   = '';
  try {
    var ksCtaTypes = getCampaignTypes(false);
    if (Array.isArray(ksCtaTypes) && ksCtaTypes.length) {
      detectionBlock = 'CAMPAIGN TYPE AUTO-DETECTION — infer cta_type from the user prompt:\n';
      ksCtaTypes.forEach(function(t) {
        var kws = (t.detection_keywords || '').split(',').map(function(k) {
          return '"' + k.trim() + '"';
        }).join(', ');
        detectionBlock += '- mentions ' + kws + ' → cta_type: ' + t.cta_type + '\n';
      });
      detectionBlock += '- default → cta_type: waitlist\n\n';

      ctaDestBlock = 'CTA DESTINATIONS BY TYPE:\n';
      ksCtaTypes.forEach(function(t) {
        ctaDestBlock += '- ' + t.cta_type + ':  CTA = "' + t.cta_text + '" | Destination: ' + t.destination_label + '\n';
      });
      ctaDestBlock += '\n';
    }
  } catch(e) {}

  if (!detectionBlock) {
    detectionBlock =
      'CAMPAIGN TYPE AUTO-DETECTION — infer cta_type from the user prompt:\n' +
      '- mentions "waitlist" or pre-July context → cta_type: waitlist\n' +
      '- mentions "download" or "app store" or "install" → cta_type: download\n' +
      '- mentions "founding" or "price" or "lock in" → cta_type: founding\n' +
      '- mentions "referral" or "share" or "friend" → cta_type: referral\n' +
      '- mentions "affiliate" or "partner" or "influencer" → cta_type: affiliate\n' +
      '- mentions "recipe" or "content" or "SEO" → cta_type: recipe\n' +
      '- mentions "upgrade" or "paywall" or "in-app" → cta_type: upgrade\n' +
      '- default → cta_type: waitlist\n\n';
    ctaDestBlock =
      'CTA DESTINATIONS BY TYPE:\n' +
      '- waitlist:  CTA = "Join the waitlist free" | Destination: /lp/waitlist-a or /lp/waitlist-b\n' +
      '- download:  CTA = "Download free on App Store" | Destination: App Store / Google Play\n' +
      '- founding:  CTA = "Lock in $7.99/month" | Destination: /lp/waitlist-a\n' +
      '- referral:  CTA = "Share and get early access" | Destination: Branch.io referral link\n' +
      '- affiliate: CTA = "Get early access" | Destination: /lp/[affiliate-slug]\n' +
      '- recipe:    CTA = "See the full recipe free" | Destination: /recipes/[slug]\n' +
      '- upgrade:   CTA = "Upgrade to founding price" | Destination: In-app paywall\n\n';
  }

  var systemPrompt =
    'You are the easyChef Pro campaign architect. A user has described a target customer and goal. ' +
    'Your job is to identify which ICP profile this matches from the list below, select the correct ' +
    'funnel blueprint, and generate a complete campaign brief in JSON format.\n\n' +

    icpContext +

    claimsContext +

    'Brand voice: Warm, direct, empathetic. Never shame-based. No jargon. ' +
    'No markdown in output. Write like a friend texting not a corporation.\n\n' +

    '7-step framework every campaign follows:\n' +
    stagesLabel + '\n' +
    'The sequence never changes. Only the CTA destination changes by campaign type.\n\n' +

    detectionBlock +

    ctaDestBlock +

    'Architecture rules:\n' +
    'Every piece of content drives to a landing page. Landing pages belong to an ICP, not a campaign — ' +
    'multiple campaigns drive to the same LP. The slug in the output represents that shared LP.\n' +
    'PRODUCT NAME: Always write "easyChef Pro". Never "the app", "this app", or "a meal planning app".\n' +
    'CTA RULE: Use the CTA destination for the detected cta_type above. Never link to the main website.\n\n' +

    'CHANNELS DETECTION — scan the user prompt for platform mentions:\n' +
    '- If prompt explicitly mentions specific platforms → array of those platform names in lowercase\n' +
    '- If prompt says "all channels" or "everything" → ["facebook","instagram","tiktok","pinterest","nextdoor","email"]\n' +
    '- If single platform mentioned → single-item array e.g. ["facebook"]\n' +
    '- Default if nothing mentioned → ["facebook","instagram","email"]\n' +
    '- Valid values: "facebook","instagram","tiktok","pinterest","nextdoor","email","push notifications","youtube","x","reddit"\n\n' +

    'THEME DETECTION — scan the user prompt:\n' +
    '- If prompt contains THEME: field → use that exact value\n' +
    '- If prompt mentions a recurring event (Taco Tuesday, Meal Prep Sunday, Back to School, etc.) → extract the exact phrase\n' +
    '- Default → empty string ""\n\n' +

    'PUBLISH DAY DETECTION — scan the user prompt:\n' +
    '- If prompt contains PUBLISH DAY: field → use that value\n' +
    '- If prompt mentions posting on a specific weekday ("every Tuesday", "on Sundays", etc.) → extract the day name\n' +
    '- Default → empty string ""\n\n' +

    'CAMPAIGN ANGLE DETECTION — identify the dominant angle from the user prompt:\n' +
    '- savings → user mentions money, budget, cost, grocery bill, $1,336\n' +
    '- speed → user mentions time, quick, fast, 30 minutes, busy\n' +
    '- waste → user mentions food waste, throwing away, 69.5%\n' +
    '- proof → user mentions first responders, nurses, teachers, authority\n' +
    '- urgency → user mentions founding price, launch date, deadline, $7.99, limited\n' +
    '- theme → user mentions a content series, recipe, event, theme\n' +
    '- Default → savings\n\n' +

    'URGENCY TRIGGER DETECTION — extract the specific urgency or scarcity signal:\n' +
    '- If prompt mentions founding price → "Founding price $7.99/month ends at 5,000 families"\n' +
    '- If prompt mentions a date → include the date\n' +
    '- If no urgency found → "Founding price $7.99/month ends at 5,000 families"\n\n' +

    'Return a JSON object with these exact fields:\n' +
    '{\n' +
    '  "icp_match": "Human-readable ICP name (e.g. Super Mom)",\n' +
    '  "icp_code": "snake_case ICP key (e.g. super_mom)",\n' +
    '  "blueprint": "Funnel type — one of: A-Waitlist, B-App Download, C-Referral, D-Re-engagement, E-Content, F-Affiliate, G-Paywall Recovery",\n' +
    '  "campaign_name": "Short descriptive campaign name",\n' +
    '  "channel_recommendation": "Primary channel — one of: Email, Facebook, Instagram, TikTok, Pinterest, Nextdoor, YouTube, X, Reddit, Organic, Affiliate, Direct",\n' +
    '  "channels": ["detected channel 1", "detected channel 2"],\n' +
    '  "slug": "Landing page slug path e.g. lp/waitlist-a",\n' +
    '  "headline": "Hook step — stops the scroll, specific to the ICP pain",\n' +
    '  "subheadline": "Problem step — names the exact pain in one plain sentence",\n' +
    '  "email_subject_a": "Money angle subject line — under 50 chars, no emojis",\n' +
    '  "email_subject_b": "Time or emotion angle subject line — under 50 chars, no emojis",\n' +
    '  "lp_hero": "Hook expanded for landing page hero — 2 to 3 sentences flowing Hook into Problem into Solve",\n' +
    '  "problem_block": "Agitate step — 2 sentences making the pain feel real and present",\n' +
    '  "agitate_block": "One honest specific sentence deepening the pain",\n' +
    '  "solve_block": "One clear sentence introducing easyChef Pro as the answer",\n' +
    '  "proof_bar": ["exact wording claim 1 from approved list", "exact wording claim 2", "exact wording claim 3"],\n' +
    '  "cta_type": "Auto-detected type — one of: waitlist, download, founding, referral, affiliate, recipe, upgrade",\n' +
    '  "cta_primary": "Outcome-framed CTA matching the cta_type destination, low friction, under 8 words",\n' +
    '  "social_hook": "Scroll-stopper first line, under 15 words",\n' +
    '  "share_mechanic": "Viral thank-you page prompt — 1 sentence, peer-to-peer framing, references the saving",\n' +
    '  "utm_campaign_code": "Lowercase hyphenated campaign code e.g. ec-2026-007",\n' +
    '  "founding_offer": "One sentence framing the $7.99 founding price urgency",\n' +
    '  "theme": "Detected theme or recurring series name — empty string if none",\n' +
    '  "publish_day": "Detected day of week (Monday/Tuesday/etc) — empty string if none",\n' +
    '  "campaign_angle": "One of: savings, speed, waste, proof, urgency, theme",\n' +
    '  "post_count": 7,\n' +
    '  "email_sequences": 2,\n' +
    '  "email_variants": 2,\n' +
    '  "urgency_trigger": "Specific scarcity or urgency sentence from the prompt or default founding price trigger"\n' +
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