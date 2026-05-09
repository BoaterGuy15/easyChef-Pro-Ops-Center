// ─────────────────────────────────────────────────────────────────────────────
// Operations_CampaignGen.gs
// Requires Operations_CampaignSheets.gs in the same project.
// ─────────────────────────────────────────────────────────────────────────────

// ── Fallback ICP profiles — used when the sheet returns empty rows ─────────────

var _CG_FALLBACK_ICP = {
  'Super Mom':
    'Busy parent, household income $40-100K, 2+ kids, extremely time-constrained. ' +
    'Primary pain: no time to plan meals — the 6:30 PM panic staring at an empty fridge is their daily reality. ' +
    'Emotional driver: being a good parent without burning out. Convenience over everything.',
  'Budget Family':
    'Financially stressed household, income $30-70K, 2+ kids. ' +
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
    'Emotional driver: being first, social proof through referral, and locking in $7.99 before the price rises to $19.99.'
};

// ── Fallback claims — used when the sheet returns empty rows ───────────────────

var _CG_FALLBACK_CLAIMS = [
  '$1,336 average annual savings — never $1,500',
  '69.5% less food waste — never 70%',
  '30 minutes fridge to table',
  '$7.99/month founding-member price — 60% off $19.99, locked forever',
  '$19.99/month standard price',
  '9 patent-pending technologies — never "9 patents"',
  '800,000 products in the database',
  '10,000 recipe pages at launch',
  'Validated across 10,000 household profiles',
  'Built by first responders',
  'Trusted by registered dietitians — word "registered" is required'
];

// ── ICP profile text builder ───────────────────────────────────────────────────

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

function campaignGen(brief) {
  if (!brief) return { ok: false, error: 'brief is required' };

  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set in Script Properties' };

  // 1. Fetch ICP profile from ICPProfiles sheet — fallback to hardcoded if blank
  var icpProfile = null;
  try {
    var icpData = getIcpProfile(brief.icp);
    icpProfile  = _cgBuildIcpText(icpData);
  } catch (e) {}
  if (!icpProfile) {
    icpProfile = _CG_FALLBACK_ICP[brief.icp] || String(brief.icp || '');
  }

  // 2. Fetch approved claims from ApprovedClaims sheet — fallback if empty
  var approvedClaims = [];
  try {
    var sheetClaims = getApprovedClaims();
    approvedClaims  = sheetClaims.map(function(c) { return c.exact_wording; });
  } catch (e) {}
  if (!approvedClaims.length) {
    approvedClaims = _CG_FALLBACK_CLAIMS;
  }

  // 3. Build system prompt — load 7-step framework from FunnelStages sheet
  var frameworkContext =
    '=== 7-STEP CAMPAIGN FRAMEWORK ===\n' +
    '1. HOOK — stops the scroll. Specific, unexpected, emotionally resonant. Never generic.\n' +
    '2. PROBLEM — names the exact pain the ICP feels right now. The specific moment.\n' +
    '3. AGITATE — make the pain feel real. Honest and specific. Not dramatic.\n' +
    '4. SOLVE — introduce easyChef Pro as the obvious answer. One clear sentence.\n' +
    '5. VALUE — one specific outcome from the approved claims list. Exact figure only. Never invented.\n' +
    '6. PROOF — one validated stat from the approved claims list. Do not fabricate numbers.\n' +
    '7. CTA — outcome-framed, low friction. Tell them what they get, not what they do.\n\n';
  try {
    var cgStages = getFunnelStages();
    if (Array.isArray(cgStages) && cgStages.length) {
      frameworkContext = '=== 7-STEP CAMPAIGN FRAMEWORK ===\n';
      cgStages.forEach(function(s, i) {
        frameworkContext += (i + 1) + '. ' + s.stage_name.toUpperCase() +
          ' — ' + (s.email_theme || s.post_template || '') + '\n';
      });
      frameworkContext += '\n';
    }
  } catch(e) {}

  var channel = brief.channel || 'Email';
  var isEmail = channel === 'Email';

  var channelGuidance = isEmail
    ? 'You are writing for EMAIL. Subject lines must be under 50 characters. ' +
      'Lead with the money angle OR the emotion angle — never both in the same subject line.'
    : 'You are writing for ' + channel.toUpperCase() + ' (SOCIAL). ' +
      'The hook must stop the scroll in the first 5 words. ' +
      'No more than 2 sentences for the social hook. Short, punchy, pattern-interrupt.';

  var systemPrompt =
    'You are the easyChef Pro campaign copywriter. Write conversion copy that moves people from scroll to action.\n\n' +
    frameworkContext +
    '=== TARGET ICP ===\n' +
    (brief.icp || 'Unknown') + ': ' + icpProfile + '\n\n' +
    '=== APPROVED CLAIMS — USE EXACT WORDING ONLY ===\n' +
    approvedClaims.map(function(c, i) { return (i + 1) + '. ' + c; }).join('\n') + '\n' +
    'CRITICAL: Do not invent statistics. Only use figures from this list.\n\n' +
    '=== BRAND VOICE RULES ===\n' +
    '- Empathetic: speak like a friend who understands the struggle, not a marketer\n' +
    '- Direct: say the thing. No warm-up sentences. No "Are you tired of..."\n' +
    '- No jargon: never use leverage, ecosystem, solution, seamless, game-changer\n' +
    '- No markdown in output: no bold (**), no bullets (*), no asterisks, no backticks\n' +
    '- Conversational: write how people talk at their kitchen table at 6:30 PM\n' +
    '- Specific: name the exact pain. Name the exact saving.\n\n' +
    '=== CHANNEL INSTRUCTIONS ===\n' + channelGuidance + '\n\n' +
    '=== CAMPAIGN DETAILS ===\n' +
    'Campaign ID: '     + (brief.id     || '') + '\n' +
    'Campaign name: '   + (brief.name   || '') + '\n' +
    'Funnel: '          + (brief.funnel || '') + '\n' +
    'Conversion goal: ' + (brief.goal   || '') + '\n' +
    'Landing page: ' + _buildLpUrl(brief.slug || 'waitlist') + '\n\n' +
    '=== OUTPUT FORMAT ===\n' +
    'Return ONLY a valid JSON object. No explanation. No markdown wrapping.\n' +
    '{\n' +
    '  "headline": "Hook step — stops the scroll, specific to the ICP pain",\n' +
    '  "subheadline": "Problem step — names the exact pain in one plain sentence",\n' +
    '  "email_subject_a": "Money angle subject line — under 50 chars, no emojis",\n' +
    '  "email_subject_b": "Time or emotion angle subject line — under 50 chars, no emojis",\n' +
    '  "lp_hero": "Hook expanded for LP hero — 2 to 3 sentences, Hook into Problem into Solve",\n' +
    '  "proof_bar": ["exact wording from approved list", "exact wording", "exact wording"],\n' +
    '  "cta_primary": "CTA — outcome-framed, low friction, under 8 words",\n' +
    '  "social_hook": "Social first line — stops the scroll, under 15 words",\n' +
    '  "share_mechanic": "Viral prompt — 1 sentence, peer-to-peer framing, references the saving"\n' +
    '}';

  // 4. Call Anthropic API
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

    // 5. Parse JSON — strip any accidental markdown fences
    var copy = null;
    try {
      var jsonStr = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
      copy = JSON.parse(jsonStr);
    } catch (parseErr) {
      return { ok: true, copy: null, raw: reply };
    }

    // 6. Save to GeneratedCopy tab
    var dlId = '';
    try {
      addGeneratedCopy({
        campaign_id:     brief.id   || '',
        icp_code:        brief.icp  || '',
        channel:         channel,
        headline:        copy.headline        || '',
        subheadline:     copy.subheadline     || '',
        email_subject_a: copy.email_subject_a || '',
        email_subject_b: copy.email_subject_b || '',
        lp_hero:         copy.lp_hero         || '',
        proof_bar:       copy.proof_bar       || [],
        cta_primary:     copy.cta_primary     || '',
        social_hook:     copy.social_hook     || '',
        share_mechanic:  copy.share_mechanic  || ''
      });
    } catch (saveErr) {
      Logger.log('campaignGen: addGeneratedCopy failed — ' + saveErr.message);
    }

    // 7. Register DRAFT DL entry in DeepLinkRegistry
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

// ── Pipeline step: UTM + DL generation — writes DL_IDs to all Sheet tabs ─────

function fcGenerateUtmAndSave(campaignId) {
  try {
    var ctx = _fcLoad(campaignId);
    if (!ctx) return { ok: false, error: 'Brief not found: ' + campaignId };
    var brief = ctx.brief;
    var copy  = ctx.copy;

    var posts  = getSocialPosts(campaignId);
    var emails = getEmailSequences(campaignId);
    Logger.log('[fcUTMSave] Posts: ' + posts.length + ' | Emails: ' + emails.length);

    // 1. Generate ACTIVE DL entries in DeepLinkRegistry
    // Posts + emails are already in the sheet from Steps 1+2 — don't re-pass them here
    var saveResult = saveCampaignDraft({ brief: brief, copy: copy, posts: [], emails: [] });
    var utms = saveResult.utms || [];
    Logger.log('[fcUTMSave] DL entries generated: ' + utms.length);

    // 2. Build dlMap {postId → {dl_id, utm_url}} by matching UTMs to posts by platform order
    var _utmByPlatform = {};
    utms.forEach(function(u) {
      if (/^DL-LP/i.test(u.dl_id || '') || /^DL-EM/i.test(u.dl_id || '')) return;
      var ch = (u.channel || '').toLowerCase();
      if (!_utmByPlatform[ch]) _utmByPlatform[ch] = [];
      _utmByPlatform[ch].push(u);
    });
    var _postsByPlatform = {};
    posts.forEach(function(p) {
      var pl = (p.platform || '').toLowerCase();
      if (!_postsByPlatform[pl]) _postsByPlatform[pl] = [];
      _postsByPlatform[pl].push(p);
    });
    var dlMap = {};
    Object.keys(_postsByPlatform).forEach(function(platform) {
      var pArr = _postsByPlatform[platform];
      var uArr = _utmByPlatform[platform] || [];
      pArr.forEach(function(post, i) {
        var u = uArr[i] || uArr[uArr.length - 1] || null;
        if (!u || !post.id) return;
        dlMap[String(post.id)] = { dl_id: u.dl_id, utm_url: u.full_url };
      });
    });

    // 3. BATCH write dl_id + utm_url to SocialPosts — one read, memory update, one write
    var postsSheet   = _getCCSheet(_CC_TAB.SOCIAL);
    var postsData    = postsSheet.getDataRange().getValues();
    var postsHeaders = postsData[0].map(function(h) { return String(h).trim(); });
    var pIdCol  = postsHeaders.indexOf('id');
    var pDlCol  = postsHeaders.indexOf('dl_id');
    var pUrlCol = postsHeaders.indexOf('utm_url');
    var dlWriteCount = 0;
    if (pIdCol >= 0 && (pDlCol >= 0 || pUrlCol >= 0)) {
      for (var pi = 1; pi < postsData.length; pi++) {
        var pid = String(postsData[pi][pIdCol] || '');
        if (dlMap[pid]) {
          if (pDlCol  >= 0) postsData[pi][pDlCol]  = dlMap[pid].dl_id;
          if (pUrlCol >= 0) postsData[pi][pUrlCol] = dlMap[pid].utm_url;
          dlWriteCount++;
        }
      }
      postsSheet.getRange(1, 1, postsData.length, postsHeaders.length).setValues(postsData);
    }
    Logger.log('[fcUTMSave] SocialPosts dl_id+utm_url writes: ' + dlWriteCount);

    // 4. Build emailDlMap {emailId → {dl_id, utm_url}} for batch write
    var _seqToCode = {
      'SEQ-1': 'seq1_welcome', 'SEQ-2': 'seq2_nurture',
      'SEQ-3': 'seq3_urgency', 'SEQ-4': 'seq4_launch_day'
    };
    var emailDls = utms.filter(function(u) {
      return /^DL-EM/i.test(u.dl_id || '') ||
             (u.channel || '').toLowerCase() === 'email';
    });
    var emailDlMap = {};
    emails.forEach(function(email) {
      var code  = _seqToCode[email.sequence_code || ''] || '';
      var entry = null;
      for (var di = 0; di < emailDls.length; di++) {
        if ((emailDls[di].utm_campaign || '') === code) { entry = emailDls[di]; break; }
      }
      if (!entry || !email.id) return;
      var fullUrl = (entry.destination_url || '') +
        '?utm_source='   + encodeURIComponent(entry.utm_source   || '') +
        '&utm_medium='   + encodeURIComponent(entry.utm_medium   || '') +
        '&utm_campaign=' + encodeURIComponent(entry.utm_campaign || '') +
        '&utm_content='  + encodeURIComponent(entry.utm_content  || '');
      emailDlMap[String(email.id)] = { dl_id: entry.dl_id, utm_url: fullUrl };
    });

    // 5. BATCH write dl_id + utm_url to EmailSequences — one read, memory update, one write
    var emailSheet   = _getCCSheet(_CC_TAB.EMAIL);
    var emailData    = emailSheet.getDataRange().getValues();
    var emailHeaders = emailData[0].map(function(h) { return String(h).trim(); });
    var eIdCol  = emailHeaders.indexOf('id');
    var eDlCol  = emailHeaders.indexOf('dl_id');
    var eUrlCol = emailHeaders.indexOf('utm_url');
    var emailWriteCount = 0;
    if (eIdCol >= 0 && (eDlCol >= 0 || eUrlCol >= 0)) {
      for (var ei = 1; ei < emailData.length; ei++) {
        var eid = String(emailData[ei][eIdCol] || '');
        if (emailDlMap[eid]) {
          if (eDlCol  >= 0) emailData[ei][eDlCol]  = emailDlMap[eid].dl_id;
          if (eUrlCol >= 0) emailData[ei][eUrlCol] = emailDlMap[eid].utm_url;
          emailWriteCount++;
        }
      }
      emailSheet.getRange(1, 1, emailData.length, emailHeaders.length).setValues(emailData);
    }
    Logger.log('[fcUTMSave] EmailSequences dl_id+utm_url writes: ' + emailWriteCount);

    // 6. Confirm LP DL_ID is ACTIVE in DeepLinkRegistry
    var lpDlId = '';
    utms.forEach(function(u) { if (/^DL-LP/i.test(u.dl_id || '')) lpDlId = u.dl_id; });
    Logger.log('[fcUTMSave] Done — ' + utms.length + ' DL_IDs · LP: ' + lpDlId + ' · social writes: ' + dlWriteCount + ' · email writes: ' + emailWriteCount);

    return { ok: true, dl_count: utms.length, posts: posts.length, emails: emails.length, lp_dl_id: lpDlId };
  } catch(e) {
    Logger.log('[fcUTMSave] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Pipeline step: Drive export — reads DL_IDs from Sheet, never blank ────────

function fcExportCampaignToDrive(campaignId) {
  try {
    var ctx = _fcLoad(campaignId);
    if (!ctx) return { ok: false, error: 'Brief not found: ' + campaignId };
    var brief = ctx.brief;
    var copy  = ctx.copy;

    var posts  = getSocialPosts(campaignId);
    var emails = getEmailSequences(campaignId);
    var lp     = null;
    try { lp = getLPInventoryBySlug(brief.slug) || null; } catch(le) {}

    // Enrich email objects with DL_IDs from DeepLinkRegistry.
    // EmailSequences tab may not have dl_id column — DeepLinkRegistry is authoritative.
    var _seqToCode = {
      'SEQ-1': 'seq1_welcome', 'SEQ-2': 'seq2_nurture',
      'SEQ-3': 'seq3_urgency', 'SEQ-4': 'seq4_launch_day'
    };
    try {
      var allDls   = getDlRegistry(campaignId);
      var emailDls = allDls.filter(function(u) {
        return /^DL-EM/i.test(u.dl_id || '') ||
               (u.channel || '').toLowerCase() === 'email';
      });
      emails.forEach(function(email) {
        if (email.dl_id) return; // already written by fcGenerateUtmAndSave
        var code  = _seqToCode[email.sequence_code || ''] || '';
        var entry = null;
        for (var di = 0; di < emailDls.length; di++) {
          if ((emailDls[di].utm_campaign || '') === code) { entry = emailDls[di]; break; }
        }
        if (!entry) return;
        email.dl_id   = entry.dl_id;
        email.utm_url = (entry.destination_url || '') +
          '?utm_source='   + encodeURIComponent(entry.utm_source   || '') +
          '&utm_medium='   + encodeURIComponent(entry.utm_medium   || '') +
          '&utm_campaign=' + encodeURIComponent(entry.utm_campaign || '') +
          '&utm_content='  + encodeURIComponent(entry.utm_content  || '');
      });
      Logger.log('[fcDriveExport] Email DL enrichment: ' + emailDls.length + ' entries from registry');
    } catch(dlErr) {
      Logger.log('[fcDriveExport] Email DL enrichment failed: ' + dlErr.message);
    }

    Logger.log('[fcDriveExport] Starting — posts: ' + posts.length + ' | emails: ' + emails.length);
    var result = exportCampaignToDrive(brief, copy, posts, lp || {}, emails);
    Logger.log('[fcDriveExport] Done — ok: ' + result.ok + ' url: ' + (result.folder_url || ''));
    return result;
  } catch(e) {
    Logger.log('[fcDriveExport] ERROR: ' + e.message);
    return { ok: false, partial: true, error: e.message };
  }
}