// ─────────────────────────────────────────────────────────────────────────────
// Operations_MasterBrief.gs
// Generates MasterPositioning via Claude.
// ─────────────────────────────────────────────────────────────────────────────

var _MP_MODEL = 'claude-sonnet-4-20250514';

var _MP_SYSTEM_PROMPT = [
  '=== MASTER POSITIONING GENERATOR ===',
  '',
  'You generate structured campaign positioning objects for easyChef Pro.',
  'Return ONLY valid JSON — no prose, no markdown fences.',
  '',
  '── WHO SHE IS RULE ────────────────────────────────────────────────────────',
  'WHO SHE IS must describe a SPECIFIC MOMENT — not a demographic.',
  'NOT: A busy mother trying to stretch the grocery budget',
  'YES: It is 6:30 PM on a Tuesday. She has ground beef, tortillas, and cheese',
  '     in the fridge. She does not know she already has everything for Taco Tuesday.',
  '     She is opening DoorDash.',
  'Must include: exact time · what she has · what she is about to do wrong · the tension.',
  '',
  '── MASTER STORY (LOCKED) ──────────────────────────────────────────────────',
  'master_story must always be:',
  '"Your kitchen is broken. Not because of you. Because no tool ever closed the loop.',
  ' easyChef Pro closes the loop. Your kitchen. In command."',
  '',
  '── CATEGORY POSITIONING (LOCKED) ─────────────────────────────────────────',
  'supporting_truth must always be:',
  '"easyChef Pro is the only food app you need. TRACK → PLAN → OPTIMIZE → COOK.',
  ' Every competitor owns one step. easyChef Pro owns the entire loop."',
  '',
  '── APPROVED CLAIMS ONLY ───────────────────────────────────────────────────',
  'Only use these exact figures — never invent or round:',
  '· $1,336/year · 69.5% less food waste (never 70%) · 30 minutes fridge to table',
  '· 9 patent-pending technologies (never "9 patents") · 800,000 products',
  '· 10,000 recipe pages at launch · registered dietitians (word "registered" required)',
  '· Validated across 10,000 household profiles · Built by first responders',
  '· $7.99/month founding price · 60% off (never 50%)',
  '',
  '── PHASE RULE ────────────────────────────────────────────────────────────',
  'Before July 1 2026: cta_language must always be:',
  '"Join the waitlist free — early access July 1"',
  '',
  '── FEELING SOLD RULE ─────────────────────────────────────────────────────',
  'feeling_sold describes emotional state AFTER the product does its job.',
  'NOT: She saves money and time',
  'YES: She is already thinking about next Tuesday instead of dreading it.',
  '',
  '── EMOTIONAL ARC RULE ────────────────────────────────────────────────────',
  'emotional_arc: 7 emotions, one per post.',
  'Always: exhausted → frustrated → activated → curious → relieved → proud → peaceful',
  '',
  '── RETENTION RULE ────────────────────────────────────────────────────────',
  'stage_5_retention_job must reference:',
  'Three-Ingredient Start → First Strike (Day 7) → Tipping Point',
  '(meals_cooked>=3 AND spoilage_saves>=1 AND pantry_items>=20) → Paywall',
  '',
  '── NO HARDCODING ─────────────────────────────────────────────────────────',
  'Never hardcode ICP names, pricing outside approved claims, or persona labels.',
  'All copy must emerge from themeData and icpData supplied in the user message.',
  '',
  '── BRAND RULES ────────────────────────────────────────────────────────────',
  'No blue or navy anywhere. Brand colors: #0B0D10 (dark) · #C9A84C (gold) · #FF0000 (red).',
  'No Zapier — Make.com only.',
  '',
  '── OUTPUT FORMAT ─────────────────────────────────────────────────────────',
  'Return a single JSON object with exactly these keys:',
  'who_she_is, what_she_wants, core_problem, core_truth, master_story,',
  'supporting_truth, what_we_say, why_she_believes_it, proof_point, feeling_sold,',
  'primary_objection, objection_answer, emotional_arc,',
  'stage_1_awareness_job, stage_2_education_job, stage_3_consideration_job,',
  'stage_4_conversion_job, stage_5_retention_job,',
  'lp_angle, cta_language, approved_claims_ref'
].join('\n');


function generateMasterPositioning(params) {
  if (!params || !params.campaign_id) return { ok: false, error: 'campaign_id required' };

  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set' };

  var userMsg = [
    'Generate master positioning for this campaign.',
    '',
    'campaign_id: ' + params.campaign_id,
    'icp_code: '    + (params.icp_code   || ''),
    'theme_slug: '  + (params.theme_slug || ''),
    'theme_name: '  + (params.theme_name || ''),
    '',
    'ICP DATA:',
    JSON.stringify(params.icpData || {}, null, 2),
    '',
    'THEME DATA:',
    JSON.stringify(params.themeData || {}, null, 2)
  ].join('\n');

  var payload = {
    model:      _MP_MODEL,
    max_tokens: 1500,
    system:     _MP_SYSTEM_PROMPT,
    messages:   [{ role: 'user', content: userMsg }]
  };

  try {
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method:      'post',
      contentType: 'application/json',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01'
      },
      payload:            JSON.stringify(payload),
      muteHttpExceptions: true
    });

    var data = JSON.parse(resp.getContentText());
    if (!data.content || !data.content[0]) {
      return { ok: false, error: 'Empty response from Claude', raw: data };
    }

    var text = data.content[0].text || '';
    var json;
    try {
      var fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      json = JSON.parse(fenced ? fenced[1] : text);
    } catch(pe) {
      return { ok: false, error: 'JSON parse failed', raw: text };
    }

    var positioning = {
      campaign_id:       params.campaign_id,
      icp_code:          params.icp_code   || '',
      theme_slug:        params.theme_slug || '',
      theme_name:        params.theme_name || '',
      version:           '1',
      status:            'DRAFT',
      locked:            'FALSE',
      who_she_is:             json.who_she_is             || '',
      what_she_wants:         json.what_she_wants         || '',
      core_problem:           json.core_problem           || '',
      core_truth:             json.core_truth             || '',
      master_story:           json.master_story           || '',
      supporting_truth:       json.supporting_truth       || '',
      what_we_say:            json.what_we_say            || '',
      why_she_believes_it:    json.why_she_believes_it    || '',
      proof_point:            json.proof_point            || '',
      feeling_sold:           json.feeling_sold           || '',
      primary_objection:      json.primary_objection      || '',
      objection_answer:       json.objection_answer       || '',
      emotional_arc:          json.emotional_arc          || '',
      stage_1_awareness_job:      json.stage_1_awareness_job      || '',
      stage_2_education_job:      json.stage_2_education_job      || '',
      stage_3_consideration_job:  json.stage_3_consideration_job  || '',
      stage_4_conversion_job:     json.stage_4_conversion_job     || '',
      stage_5_retention_job:      json.stage_5_retention_job      || '',
      lp_angle:               json.lp_angle               || '',
      cta_language:           json.cta_language           || '',
      approved_claims_ref:    json.approved_claims_ref    || ''
    };

    var saved = saveMasterPositioning(positioning);
    return { ok: true, positioning: positioning, positioning_id: saved.positioning_id };

  } catch(e) {
    Logger.log('[generateMasterPositioning] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}
