// ─────────────────────────────────────────────────────────────────────────────
// Operations_AssetBuilder.gs
// Paste this file into your Apps Script project.
//
// ADD TO doGet in Operations.gs:
//   if (action === 'lp_search') return json(getLandingPages(e.parameter.icp));
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

var _AB_CLAIMS =
  'Approved claims (use exact wording only — never invent statistics):\n' +
  '- $1,336 average annual savings\n' +
  '- 69.5% less food waste\n' +
  '- 30 minutes fridge to table\n' +
  '- $7.99/month founding-member price\n' +
  '- 30–60% reduction in monthly grocery spend\n' +
  '- 9 patent-pending technologies\n' +
  '- 800,000 products\n' +
  '- 10,000 recipe pages at launch\n\n';

var _AB_VOICE =
  'Brand voice: Warm, direct, empathetic. Never shame-based. No jargon.\n' +
  'No markdown in output values — no **, no *, no #, no backticks.\n' +
  'Write like a friend texting, not a corporation.\n\n';

// ── getLandingPages ───────────────────────────────────────────────────────────

/**
 * Reads the LandingPages sheet and returns pages filtered by optional ICP.
 * Returns { ok: true, pages: [{slug, icp, blueprint, status, ...}] }
 */
function getLandingPages(icpFilter) {
  try {
    var props = PropertiesService.getScriptProperties();
    var sheetId = props.getProperty('CAMPAIGN_SHEET_ID');
    if (!sheetId) return { ok: true, pages: [] };

    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheetByName('LandingPages');
    if (!sheet) return { ok: true, pages: [] };

    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return { ok: true, pages: [] };

    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase().replace(/\s+/g, '_'); });
    var pages = data.slice(1)
      .filter(function(row) { return row[0]; })
      .map(function(row) {
        var page = {};
        headers.forEach(function(h, i) { page[h] = row[i]; });
        return page;
      })
      .filter(function(p) {
        if (!icpFilter) return true;
        return String(p.icp || '').toLowerCase() === String(icpFilter).toLowerCase();
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

  var systemPrompt =
    'You are the easyChef Pro email sequence writer. You write conversion email copy.\n\n' +
    _AB_ARCH +
    _AB_CLAIMS +
    _AB_VOICE +
    '=== TARGET ICP ===\n' +
    (brief.icp || 'Unknown') + '\n\n' +
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

  var channel = brief.channel || 'Facebook';
  var lpUrl   = 'https://easychefpro.com/' + (brief.slug || 'lp/waitlist');

  var platformNotes = {
    'Facebook':  'Facebook — conversational, 1-3 short paragraphs, drives to link in post or first comment. Max 400 chars body.',
    'Instagram': 'Instagram — hook in first line (stops the scroll), body 3-5 sentences, CTA to link in bio. Max 2200 chars but first 125 are most important.',
    'TikTok':    'TikTok — script for 30-second video. Hook (first 3 seconds), problem, solve, CTA to link in bio.',
    'Pinterest': 'Pinterest — Pin title (under 100 chars) + description (under 500 chars). Keyword-rich, aspirational, action-oriented.',
    'Nextdoor':  'Nextdoor — hyperlocal, neighbour-to-neighbour tone. Short, honest, community-focused. No corporate language.'
  };

  var platformNote = platformNotes[channel] || ('Social post for ' + channel + '. Concise, platform-appropriate.');

  var systemPrompt =
    'You are the easyChef Pro social media writer.\n\n' +
    _AB_ARCH +
    _AB_CLAIMS +
    _AB_VOICE +
    '=== PLATFORM ===\n' +
    platformNote + '\n\n' +
    '=== TARGET ICP ===\n' +
    (brief.icp || 'Unknown') + '\n\n' +
    '=== CAMPAIGN CONTEXT ===\n' +
    'Landing page: ' + lpUrl + '\n' +
    'Headline: '    + (copy && copy.headline    || '') + '\n' +
    'Social hook: ' + (copy && copy.social_hook || '') + '\n' +
    'Primary CTA: ' + (copy && copy.cta_primary || '') + '\n\n' +
    '=== POST STRUCTURE (5 posts total) ===\n' +
    'Post 1: Pure hook — stops the scroll, leads with the $1,336 saving stat.\n' +
    'Post 2: Problem/agitate — paint the 6:30 PM fridge panic. No solution yet.\n' +
    'Post 3: Solve + proof — introduce easyChef Pro, one specific claim.\n' +
    'Post 4: Social proof — one family story (fictional but believable), outcome-led.\n' +
    'Post 5: Urgency — founding price closes soon. Direct, honest, no fake scarcity.\n\n' +
    '=== OUTPUT FORMAT ===\n' +
    'Return ONLY valid JSON. No markdown. No explanation.\n' +
    '{\n' +
    '  "posts": [\n' +
    '    {\n' +
    '      "post_num": 1,\n' +
    '      "hook": "First line that stops the scroll — under 15 words",\n' +
    '      "body": "Full post body — plain text only, no markdown",\n' +
    '      "cta": "Call to action line — under 10 words",\n' +
    '      "url": "' + lpUrl + '"\n' +
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

  var systemPrompt =
    'You are the easyChef Pro landing page writer. You write high-converting landing page copy.\n\n' +
    _AB_ARCH +
    _AB_CLAIMS +
    _AB_VOICE +
    '=== TARGET ICP ===\n' +
    (brief.icp || 'Unknown') + '\n\n' +
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
