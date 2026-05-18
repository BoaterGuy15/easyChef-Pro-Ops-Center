// Operations_OBCampaign.gs
// OB (Trial Onboarding) Campaign Generator
//
// Produces per active ICP profile:
//   • 7 emails (Days 1–7, trial nurture → conversion)
//   • 1 landing page (trial conversion page)
// Plus one shared thank-you page.
//
// Usage: generateOBCampaign(campaignId, sheetId)
//   campaignId: e.g. 'EC-2026-OB'
//   sheetId:    optional — routes to specific account sheet

// ── Email slot wireframe ──────────────────────────────────────────────────────

var _OB_EMAIL_SLOTS = [
  { day:1, role:'trial_welcome',     funnel:'hook',    emotional:'relief',
    brief:'Welcome — confirm trial has started, deliver one immediate win, make them feel they made the right choice. Reference their specific ICP pain. NO conversion CTA. Pure welcome energy.' },
  { day:2, role:'quick_win',         funnel:'value',   emotional:'confidence',
    brief:'Quick win — show one specific action they can take RIGHT NOW in the app that directly solves their primary pain. Make the app feel effortless and worth the effort.' },
  { day:3, role:'feature_spotlight', funnel:'value',   emotional:'excitement',
    brief:'Feature spotlight — go deep on the one feature that most directly addresses this ICP pain. Make the benefit vivid and specific. Include a one-step how-to.' },
  { day:4, role:'social_proof',      funnel:'proof',   emotional:'validation',
    brief:'Social proof — real-feeling results from users in this ICP group. Lead with numbers. Make them feel that people exactly like them have already succeeded.' },
  { day:5, role:'habit_forming',     funnel:'value',   emotional:'belonging',
    brief:'Habit forming — show how the product fits into their existing daily routine naturally. Day 5 of the trial: the habit is forming. Make it feel inevitable.' },
  { day:6, role:'trial_expiring',    funnel:'urgency', emotional:'urgency',
    brief:'Trial expires tomorrow — clear, honest urgency. Show exactly what they\'ll lose. Price anchoring against their current cost (food waste, delivery). No tricks.' },
  { day:7, role:'convert_now',       funnel:'cta',     emotional:'decision',
    brief:'Final day — conversion CTA. What they get, what it costs, why today. Founding price framing if applicable. Remove every point of friction.' }
];

// ── Helpers ───────────────────────────────────────────────────────────────────

// icpCodes: optional comma-separated string of profile codes to restrict to
// If null/empty, uses all active validated profiles with LP variants defined
function _obGetActiveProfiles(icpCodes) {
  var ss      = _getCampaignSpreadsheet();
  var sheet   = ss.getSheetByName(_CC_TAB.ICP);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var headers = _CC_HDR[_CC_TAB.ICP];
  var H = {}; headers.forEach(function(h, i) { H[h] = i; });
  var rows    = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  var allowed = icpCodes ? icpCodes.split(',').map(function(s) { return s.trim().toLowerCase(); }) : null;
  return rows
    .filter(function(r) {
      if (String(r[H.status] || '').toLowerCase() !== 'active') return false;
      if (!(r[H.validated] === true || String(r[H.validated]).toLowerCase() === 'true')) return false;
      if (String(r[H.lp_variants] || '').trim() === '') return false;
      if (allowed && allowed.indexOf(String(r[H.code] || r[H.id] || '').toLowerCase()) === -1) return false;
      return true;
    })
    .map(function(r) {
      var obj = {}; headers.forEach(function(h, i) { obj[h] = String(r[i] || ''); }); return obj;
    });
}

// Remove all OB entries from ContentCalendar, EmailSequences, LandingPages for a given campaignId
function purgeOBCampaign(campaignId, sheetId) {
  _REQUEST_SHEET_ID = sheetId || null;
  if (!campaignId) return { ok: false, error: 'campaignId required' };
  var purged = { content_calendar: 0, email_sequences: 0, landing_pages: 0 };
  var tabs = [
    { key: 'content_calendar', tab: _CC_TAB.CONTENT_CAL, field: 'campaign_id' },
    { key: 'email_sequences',  tab: _CC_TAB.EMAIL,       field: 'campaign_id' },
    { key: 'landing_pages',    tab: _CC_TAB.PAGES,       field: 'campaign_id' }
  ];
  tabs.forEach(function(t) {
    var sheet = _getCCSheet(t.tab);
    if (!sheet || sheet.getLastRow() < 2) return;
    var headers = _CC_HDR[t.tab] || [];
    var cidIdx  = headers.indexOf(t.field);
    if (cidIdx === -1) return;
    var data    = sheet.getDataRange().getValues();
    for (var i = data.length - 1; i >= 1; i--) {
      if (String(data[i][cidIdx] || '') === campaignId) {
        sheet.deleteRow(i + 1);
        purged[t.key]++;
      }
    }
  });
  return { ok: true, purged: purged };
}

function _obIcpLabel(icpCode) {
  return String(icpCode).toUpperCase().replace(/_/g, '-');
}

function _obBuildEmailSystemPrompt(icpProfile) {
  var brand = _compileBrandPositionBlock ? _compileBrandPositionBlock() : '';
  var voice = _compileVoiceRulesBlock   ? _compileVoiceRulesBlock()    : '';
  return (
    'You are a conversion copywriter for easyChef Pro — a meal planning and pantry management app.\n\n' +
    brand + '\n\n' +
    voice + '\n\n' +
    '=== ICP PROFILE ===\n' +
    'Name: '                  + icpProfile.name              + '\n' +
    'Demographics: '          + icpProfile.demographics      + '\n' +
    'Primary pain: '          + icpProfile.primary_pain      + '\n' +
    'Value trigger: '         + icpProfile.value_trigger     + '\n' +
    'Loss aversion: '         + icpProfile.loss_aversion     + '\n' +
    'Message hierarchy: '     + icpProfile.message_hierarchy + '\n' +
    'Conversion triggers: '   + icpProfile.conversion_triggers + '\n\n' +
    '=== CAMPAIGN CONTEXT ===\n' +
    'This is a 7-day trial onboarding email sequence.\n' +
    'The subscriber just started a free trial. Goal: activate them and convert before Day 7.\n' +
    'Write in first-person from the founder. Conversational. Specific to this ICP. No vague marketing language.\n' +
    'CROSS-PLATFORM UNIQUENESS: each day must have a distinct angle — never repeat a hook or sentence from another day.\n'
  );
}

function _obBuildLPSystemPrompt(icpProfile) {
  var brand = _compileBrandPositionBlock ? _compileBrandPositionBlock() : '';
  var voice = _compileVoiceRulesBlock   ? _compileVoiceRulesBlock()    : '';
  return (
    'You are a landing page CRO specialist for easyChef Pro.\n\n' +
    brand + '\n\n' +
    voice + '\n\n' +
    '=== ICP PROFILE ===\n' +
    'Name: '                + icpProfile.name              + '\n' +
    'Primary pain: '        + icpProfile.primary_pain      + '\n' +
    'Value trigger: '       + icpProfile.value_trigger     + '\n' +
    'Loss aversion: '       + icpProfile.loss_aversion     + '\n' +
    'Message hierarchy: '   + icpProfile.message_hierarchy + '\n' +
    'Conversion triggers: ' + icpProfile.conversion_triggers + '\n\n' +
    '=== PAGE CONTEXT ===\n' +
    'Trial conversion landing page. Visitor has used the app for 7 days and is deciding whether to pay.\n' +
    'Goal: convert trial user to paid subscriber. Address their specific ICP pain throughout every section.\n'
  );
}

function _obBuildTYSystemPrompt() {
  var brand = _compileBrandPositionBlock ? _compileBrandPositionBlock() : '';
  return (
    'You are a post-conversion copywriter for easyChef Pro.\n\n' +
    brand + '\n\n' +
    '=== PAGE CONTEXT ===\n' +
    'Thank you page — shown immediately after a trial user subscribes.\n' +
    'Goal: reinforce their decision, reduce buyer\'s remorse, and get them to open the app right now.\n' +
    'Warm, celebratory, action-oriented. One next step only.\n'
  );
}

// ── Skeleton seeder ───────────────────────────────────────────────────────────

function seedOBCalendar(campaignId, sheetId, force, icpCodes) {
  _REQUEST_SHEET_ID = sheetId || null;
  try {
    if (!campaignId) return { ok: false, error: 'campaignId required' };
    var profiles = _obGetActiveProfiles(icpCodes);
    if (!profiles.length) return { ok: false, error: 'No active validated ICP profiles with LP variants found in ICPProfiles tab' };

    // Guard: check if already seeded
    if (!force) {
      var calSheetCheck = _getCCSheet(_CC_TAB.CONTENT_CAL);
      var checkData     = calSheetCheck.getLastRow() > 1 ? calSheetCheck.getDataRange().getValues() : [];
      var headers0      = _CC_HDR[_CC_TAB.CONTENT_CAL];
      var cidIdx        = headers0.indexOf('campaign_id');
      var alreadySeeded = checkData.slice(1).some(function(r) { return String(r[cidIdx] || '') === campaignId; });
      if (alreadySeeded) return { ok: false, error: 'OB campaign ' + campaignId + ' already seeded. Pass force:true to re-seed.' };
    }

    var calSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var emSheet  = _getCCSheet(_CC_TAB.EMAIL);
    var lpSheet  = _getCCSheet(_CC_TAB.PAGES);
    var calH     = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var emH      = _CC_HDR[_CC_TAB.EMAIL];
    var lpH      = _CC_HDR[_CC_TAB.PAGES];
    var calIdx = {}; calH.forEach(function(h, i) { calIdx[h] = i; });
    var emIdx  = {}; emH.forEach(function(h, i) { emIdx[h] = i; });
    var lpIdx  = {}; lpH.forEach(function(h, i) { lpIdx[h] = i; });
    var now    = new Date().toISOString();
    var seeded = { emails: 0, landing_pages: 0, thank_you: 0 };

    profiles.forEach(function(icp) {
      var label   = _obIcpLabel(icp.code);
      var seqCode = 'OB-' + label;

      _OB_EMAIL_SLOTS.forEach(function(slot) {
        var assetId  = campaignId + '-EMAIL-' + label + '-D0' + slot.day;
        var calRow   = new Array(calH.length).fill('');
        calRow[calIdx.calendar_id]     = 'CAL-' + assetId;
        calRow[calIdx.asset_id]        = assetId;
        calRow[calIdx.campaign_id]     = campaignId;
        calRow[calIdx.platform]        = 'Email';
        calRow[calIdx.status]          = 'Draft';
        calRow[calIdx.funnel_stage]    = slot.funnel;
        calRow[calIdx.emotional_stage] = slot.emotional;
        calRow[calIdx.sequence_code]   = seqCode;
        calRow[calIdx.day]             = slot.day;
        calRow[calIdx.week]            = 1;
        calRow[calIdx.icp_target]      = icp.code;
        calRow[calIdx.created_at]      = now;
        calRow[calIdx.updated_at]      = now;
        calSheet.appendRow(calRow);

        var emRow = new Array(emH.length).fill('');
        emRow[emIdx.id]              = assetId;
        emRow[emIdx.campaign_id]     = campaignId;
        emRow[emIdx.sequence_code]   = seqCode;
        emRow[emIdx.email_number]    = slot.day;
        emRow[emIdx.send_day]        = slot.day;
        emRow[emIdx.funnel_stage]    = slot.funnel;
        emRow[emIdx.emotional_stage] = slot.emotional;
        emRow[emIdx.role]            = slot.role;
        emRow[emIdx.status]          = 'Draft';
        emSheet.appendRow(emRow);
        seeded.emails++;
      });

      var lpId  = campaignId + '-LP-' + label;
      var lpRow = new Array(lpH.length).fill('');
      lpRow[lpIdx.id]          = lpId;
      lpRow[lpIdx.campaign_id] = campaignId;
      lpRow[lpIdx.icp_code]    = icp.code;
      lpRow[lpIdx.slug]        = 'ob-' + icp.code.replace(/_/g, '-');
      lpRow[lpIdx.status]      = 'Draft';
      lpSheet.appendRow(lpRow);

      var lpCalRow = new Array(calH.length).fill('');
      lpCalRow[calIdx.calendar_id]   = 'CAL-' + lpId;
      lpCalRow[calIdx.asset_id]      = lpId;
      lpCalRow[calIdx.campaign_id]   = campaignId;
      lpCalRow[calIdx.platform]      = 'LandingPage';
      lpCalRow[calIdx.status]        = 'Draft';
      lpCalRow[calIdx.icp_target]    = icp.code;
      lpCalRow[calIdx.sequence_code] = seqCode;
      lpCalRow[calIdx.created_at]    = now;
      lpCalRow[calIdx.updated_at]    = now;
      calSheet.appendRow(lpCalRow);
      seeded.landing_pages++;
    });

    // Shared TY page
    var tyId   = campaignId + '-TY';
    var tyRow  = new Array(lpH.length).fill('');
    tyRow[lpIdx.id]          = tyId;
    tyRow[lpIdx.campaign_id] = campaignId;
    tyRow[lpIdx.icp_code]    = 'shared';
    tyRow[lpIdx.slug]        = 'ob-thank-you';
    tyRow[lpIdx.status]      = 'Draft';
    lpSheet.appendRow(tyRow);

    var tyCalRow = new Array(calH.length).fill('');
    tyCalRow[calIdx.calendar_id]   = 'CAL-' + tyId;
    tyCalRow[calIdx.asset_id]      = tyId;
    tyCalRow[calIdx.campaign_id]   = campaignId;
    tyCalRow[calIdx.platform]      = 'ThankYou';
    tyCalRow[calIdx.status]        = 'Draft';
    tyCalRow[calIdx.sequence_code] = 'OB-TY';
    tyCalRow[calIdx.created_at]    = now;
    tyCalRow[calIdx.updated_at]    = now;
    calSheet.appendRow(tyCalRow);
    seeded.thank_you = 1;

    return { ok: true, campaign_id: campaignId, seeded: seeded, profiles: profiles.map(function(p){ return p.code; }),
             total: seeded.emails + seeded.landing_pages + seeded.thank_you };
  } catch(e) {
    return { ok: false, error: String(e) };
  }
}

// ── Write helpers ─────────────────────────────────────────────────────────────

function _obUpdateEmail(assetId, parsed) {
  var sheet   = _getCCSheet(_CC_TAB.EMAIL);
  var headers = _CC_HDR[_CC_TAB.EMAIL];
  var H = {}; headers.forEach(function(h, i) { H[h] = i; });
  var data    = sheet.getLastRow() > 1 ? sheet.getDataRange().getValues() : [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][H.id] || '') === assetId) {
      if (parsed.subject_line)   sheet.getRange(i + 1, H.subject_line   + 1).setValue(parsed.subject_line);
      if (parsed.preview_text)   sheet.getRange(i + 1, H.preview_text   + 1).setValue(parsed.preview_text);
      if (parsed.full_email_body) sheet.getRange(i + 1, H.full_email_body + 1).setValue(parsed.full_email_body);
      sheet.getRange(i + 1, H.status + 1).setValue('Generated');
      return true;
    }
  }
  return false;
}

function _obUpdateLP(assetId, parsed) {
  var sheet   = _getCCSheet(_CC_TAB.PAGES);
  var headers = _CC_HDR[_CC_TAB.PAGES];
  var H = {}; headers.forEach(function(h, i) { H[h] = i; });
  var data    = sheet.getLastRow() > 1 ? sheet.getDataRange().getValues() : [];
  var FIELDS  = ['hero_headline','hero_subheadline','section_problem','section_agitate',
                 'section_solve','section_value','section_proof','section_cta','meta_description'];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][H.id] || '') === assetId) {
      FIELDS.forEach(function(f) {
        if (parsed[f] !== undefined && H[f] !== undefined) {
          sheet.getRange(i + 1, H[f] + 1).setValue(parsed[f]);
        }
      });
      sheet.getRange(i + 1, H.status + 1).setValue('Generated');
      return true;
    }
  }
  return false;
}

function _obParseJSON(raw) {
  try {
    var cleaned = raw.replace(/```json[\s\S]*?```/g, function(m) {
      return m.replace(/```json/, '').replace(/```/, '');
    }).replace(/```/g, '').trim();
    var start = cleaned.indexOf('{');
    var end   = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object found');
    return JSON.parse(cleaned.substring(start, end + 1));
  } catch(e) {
    return null;
  }
}

// ── Content generator ─────────────────────────────────────────────────────────

function generateOBCampaign(campaignId, sheetId, icpCodes) {
  _REQUEST_SHEET_ID = sheetId || null;
  try {
    if (!campaignId) return { ok: false, error: 'campaignId required' };
    var profiles = _obGetActiveProfiles(icpCodes);
    if (!profiles.length) return { ok: false, error: 'No active validated ICP profiles found' };

    var results = { campaign_id: campaignId, generated: { emails: 0, landing_pages: 0, thank_you: 0 }, errors: [] };

    profiles.forEach(function(icp) {
      var label       = _obIcpLabel(icp.code);
      var emailSysP   = _obBuildEmailSystemPrompt(icp);

      _OB_EMAIL_SLOTS.forEach(function(slot) {
        var assetId   = campaignId + '-EMAIL-' + label + '-D0' + slot.day;
        var userPrompt = [
          'Write OB trial onboarding email — Day ' + slot.day + '.',
          'ICP: ' + icp.name,
          'Role: ' + slot.role,
          'Brief: ' + slot.brief,
          '',
          'Return ONLY valid JSON with these keys:',
          '  subject_line     — 6–9 words, ICP-specific hook, no generic opener',
          '  preview_text     — 1 sentence, 50–80 chars',
          '  full_email_body  — full email HTML (~250 words), personal founder voice, ICP-specific throughout'
        ].join('\n');

        var gen = _callCopyModel(emailSysP, userPrompt, 1800);
        if (gen.ok) {
          var parsed = _obParseJSON(gen.content);
          if (parsed) {
            _obUpdateEmail(assetId, parsed);
            results.generated.emails++;
          } else {
            results.errors.push({ asset_id: assetId, error: 'JSON parse failed', raw: gen.content.substring(0, 200) });
          }
        } else {
          results.errors.push({ asset_id: assetId, error: gen.error });
        }
      });

      // Generate LP
      var lpId       = campaignId + '-LP-' + label;
      var lpSysP     = _obBuildLPSystemPrompt(icp);
      var lpUserP    = [
        'Write trial conversion landing page copy for ICP: ' + icp.name + '.',
        'This page is shown to trial users deciding whether to subscribe.',
        '',
        'Return ONLY valid JSON with these keys:',
        '  hero_headline      — bold, ICP-pain-led, under 10 words',
        '  hero_subheadline   — 1–2 sentences expanding the hero',
        '  section_problem    — 2–3 sentences naming the pain',
        '  section_agitate    — 2–3 sentences making the cost real',
        '  section_solve      — 2–3 sentences introducing the solution',
        '  section_value      — 3–4 bullet points of specific value',
        '  section_proof      — 2–3 sentences of social proof / stats',
        '  section_cta        — CTA text + supporting sentence (founding price)',
        '  meta_description   — 155 chars, ICP-specific'
      ].join('\n');

      var lpGen = _callCopyModel(lpSysP, lpUserP, 2000);
      if (lpGen.ok) {
        var lpParsed = _obParseJSON(lpGen.content);
        if (lpParsed) {
          _obUpdateLP(lpId, lpParsed);
          results.generated.landing_pages++;
        } else {
          results.errors.push({ asset_id: lpId, error: 'JSON parse failed', raw: lpGen.content.substring(0, 200) });
        }
      } else {
        results.errors.push({ asset_id: lpId, error: lpGen.error });
      }
    });

    // Generate shared TY page
    var tyId    = campaignId + '-TY';
    var tySysP  = _obBuildTYSystemPrompt();
    var tyUserP = [
      'Write a post-conversion thank you page for easyChef Pro.',
      'The visitor just subscribed after completing their trial.',
      '',
      'Return ONLY valid JSON with these keys:',
      '  hero_headline      — celebratory, under 8 words',
      '  hero_subheadline   — 1 sentence reinforcing their decision',
      '  section_value      — 3 bullet points: what they just unlocked',
      '  section_cta        — one next action (open the app), 1 sentence',
      '  meta_description   — 155 chars'
    ].join('\n');

    var tyGen = _callCopyModel(tySysP, tyUserP, 1000);
    if (tyGen.ok) {
      var tyParsed = _obParseJSON(tyGen.content);
      if (tyParsed) {
        _obUpdateLP(tyId, tyParsed);
        results.generated.thank_you = 1;
      } else {
        results.errors.push({ asset_id: tyId, error: 'JSON parse failed', raw: tyGen.content.substring(0, 200) });
      }
    } else {
      results.errors.push({ asset_id: tyId, error: tyGen.error });
    }

    results.ok = results.errors.length === 0;
    return results;
  } catch(e) {
    return { ok: false, error: String(e) };
  }
}

// ── Full run: seed + generate ─────────────────────────────────────────────────

function runOBCampaignFull(campaignId, sheetId, icpCodes) {
  _REQUEST_SHEET_ID = sheetId || null;
  var seedResult = seedOBCalendar(campaignId, sheetId, false, icpCodes);
  if (!seedResult.ok) return seedResult;
  var genResult  = generateOBCampaign(campaignId, sheetId, icpCodes);
  return {
    ok:      genResult.ok,
    seeded:  seedResult.seeded,
    generated: genResult.generated,
    errors:  genResult.errors,
    campaign_id: campaignId
  };
}
