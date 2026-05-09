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

    // 4. Ensure DL-EM entries exist in DeepLinkRegistry (one per sequence), then build emailDlMap
    Logger.log('[UTM-EMAIL] emails to process: ' + emails.length);
    // Sequences read from brief setting — same source as _getActiveEmailSeqs, no hardcoding
    var _rawSeqs = _getActiveEmailSeqs(brief.email_sequence_mode || brief.email_sequences);
    var _seqDefs = _rawSeqs.map(function(s) { return { seq: s[0], code: s[1] }; });
    Logger.log('[UTM-EMAIL] active sequences from brief: ' + _seqDefs.map(function(s){return s.seq;}).join(', '));
    // LP URL from brief slug only — no hardcoded fallback
    var _lpBaseEmail = brief.slug ? _buildLpUrl(brief.slug) : '';
    if (!_lpBaseEmail) Logger.log('[UTM-EMAIL] WARNING: No LP slug on brief — email UTM destination will be blank');
    // UTM source + medium from Channels tab — no hardcoded fallback
    var _emUtmSrc = ''; var _emUtmMed = '';
    try {
      var _emChData = _getChannelData('Email');
      _emUtmSrc = _emChData.utm_source || '';
      _emUtmMed = _emChData.utm_medium || '';
      Logger.log('[UTM-EMAIL] Email channel from Channels tab: utm_source=' + _emUtmSrc + ' utm_medium=' + _emUtmMed);
    } catch(ece) { Logger.log('[UTM-EMAIL] WARNING: Could not read Email channel data: ' + ece.message); }

    // Read existing DL-EM entries keyed by SEQ-N
    var _existEmDls  = getDlRegistry(brief.id || '').filter(function(u) { return /^DL-EM/i.test(u.dl_id || ''); });
    var _emBySeq     = {};
    _existEmDls.forEach(function(dl, i) {
      var _sm = String(dl.notes || dl.utm_content || '').match(/SEQ-\d+/i);
      if (_sm) _emBySeq[_sm[0].toUpperCase()] = dl;
      else if (_seqDefs[i]) _emBySeq[_seqDefs[i].seq] = dl; // positional fallback
    });
    Logger.log('[UTM-EMAIL] DL-EM entries in registry: ' + _existEmDls.length);

    // Generate any missing DL-EM entries as a single batch write
    var _missingSeqs = _seqDefs.filter(function(sd) { return !_emBySeq[sd.seq]; });
    if (_missingSeqs.length) {
      Logger.log('[UTM-EMAIL] Generating ' + _missingSeqs.length + ' missing DL-EM entries: ' +
        _missingSeqs.map(function(sd){return sd.seq;}).join(', '));
      var _emSheet   = _getCCSheet(_CC_TAB.DL);
      var _emHeaders = _CC_HDR.DeepLinkRegistry;
      var _emMaxNum  = 0;
      if (_emSheet.getLastRow() >= 2) {
        _emSheet.getRange(2, 1, _emSheet.getLastRow() - 1, 1).getValues().forEach(function(r) {
          var m = String(r[0]).match(/^DL-EM-(\d+)/i);
          if (m) { var n = parseInt(m[1], 10); if (n > _emMaxNum) _emMaxNum = n; }
        });
      }
      var _emNow = _ccNow(); var _emNewRows = [];
      _missingSeqs.forEach(function(sd) {
        _emMaxNum++;
        var _dlId    = 'DL-EM-' + String(_emMaxNum).padStart(4, '0');
        var _utmC    = _dlId + '_' + sd.seq + '_cta';
        var _fullUrl = _lpBaseEmail +
          '?utm_source='   + encodeURIComponent(_emUtmSrc) +
          '&utm_medium='   + encodeURIComponent(_emUtmMed) +
          '&utm_campaign=' + encodeURIComponent(brief.id || '') +
          '&utm_content='  + encodeURIComponent(_utmC);
        _emNewRows.push([_dlId, _utmC, brief.id, 'Email', _lpBaseEmail,
          _emUtmSrc, _emUtmMed, sd.code, 'ACTIVE', _emNow, _emNow,
          'fcGenerateUtmAndSave', 'Email · ' + sd.seq]);
        _emBySeq[sd.seq] = { dl_id: _dlId, utm_source: _emUtmSrc, utm_medium: _emUtmMed,
          destination_url: _lpBaseEmail, utm_content: _utmC, full_url: _fullUrl };
      });
      var _emAppendAt = _emSheet.getLastRow() + 1;
      var _emRange    = _emSheet.getRange(_emAppendAt, 1, _emNewRows.length, _emHeaders.length);
      _emRange.setNumberFormat('@');
      _emRange.setValues(_emNewRows);
      Logger.log('[UTM-EMAIL] Registered: ' + _emNewRows.map(function(r){return r[0];}).join(', '));
    }
    Logger.log('[UTM-EMAIL] DL-EM map built — seqs: ' + Object.keys(_emBySeq).join(', '));

    // Build emailDlMap {emailId|seqId → {dl_id, utm_url}} for batch write
    var _emailsBySeq = {};
    emails.forEach(function(email) {
      var seq = email.sequence_code || '';
      if (!_emailsBySeq[seq]) _emailsBySeq[seq] = [];
      _emailsBySeq[seq].push(email);
    });
    var emailDlMap = {};
    _seqDefs.forEach(function(sd) {
      var _entry = _emBySeq[sd.seq];
      if (!_entry) return;
      var _dlId    = _entry.dl_id || '';
      var _dlBase  = _entry.destination_url || _lpBaseEmail;
      var _dlUtmC  = _entry.utm_content || (_dlId + '_' + sd.seq + '_cta');
      var _fullUrl = _entry.full_url || (_dlBase +
        '?utm_source='   + encodeURIComponent(_entry.utm_source || _emUtmSrc) +
        '&utm_medium='   + encodeURIComponent(_entry.utm_medium || _emUtmMed) +
        '&utm_campaign=' + encodeURIComponent(brief.id || '') +
        '&utm_content='  + encodeURIComponent(_dlUtmC));
      (_emailsBySeq[sd.seq] || []).forEach(function(email) {
        var mapKey = String(email.id || email.seq_id || '');
        if (!mapKey) return;
        emailDlMap[mapKey] = { dl_id: _dlId, utm_url: _fullUrl };
      });
    });
    Logger.log('[UTM-EMAIL] emailDlMap keys built: ' + Object.keys(emailDlMap).length);

    // 5. BATCH write dl_id + utm_url to EmailSequences — one read, memory update, one write
    var emailSheet    = _getCCSheet(_CC_TAB.EMAIL);
    var emailData     = emailSheet.getDataRange().getValues();
    var emailHeaders  = emailData[0].map(function(h) { return String(h).trim(); });
    var eIdCol        = emailHeaders.indexOf('id');
    var eSeqIdCol     = emailHeaders.indexOf('seq_id');
    var eDlCol        = emailHeaders.indexOf('dl_id');
    var eUrlCol       = emailHeaders.indexOf('utm_url');
    var emailWriteCount = 0;
    if (eDlCol >= 0 || eUrlCol >= 0) {
      for (var ei = 1; ei < emailData.length; ei++) {
        var eid  = eIdCol    >= 0 ? String(emailData[ei][eIdCol]    || '') : '';
        var esid = eSeqIdCol >= 0 ? String(emailData[ei][eSeqIdCol] || '') : '';
        var _em  = emailDlMap[eid] || emailDlMap[esid] || null;
        if (_em) {
          if (eDlCol  >= 0) emailData[ei][eDlCol]  = _em.dl_id;
          if (eUrlCol >= 0) emailData[ei][eUrlCol] = _em.utm_url;
          emailWriteCount++;
        }
      }
      emailSheet.getRange(1, 1, emailData.length, emailHeaders.length).setValues(emailData);
    }
    Logger.log('[fcUTMSave] EmailSequences dl_id+utm_url writes: ' + emailWriteCount);

    // 6. A/B Test — generate DL-LP-XXXX-A and DL-LP-XXXX-B when ab_test is on
    if (brief.ab_test && brief.lp_slug_a && brief.lp_slug_b) {
      var _abExisting = utms.filter(function(u) { return /^DL-LP.*-[AB]$/i.test(u.dl_id || ''); });
      if (!_abExisting.length) {
        Logger.log('[fcUTMSave] A/B: generating DL-LP-XXXX-A and DL-LP-XXXX-B for ' + brief.id);
        var _abSheet   = _getCCSheet(_CC_TAB.DL);
        var _abHeaders = _CC_HDR.DeepLinkRegistry;
        var _abLastRow = _abSheet.getLastRow();
        var _abMaxLP   = 0;
        if (_abLastRow >= 2) {
          _abSheet.getRange(2, 1, _abLastRow - 1, 1).getValues().forEach(function(r) {
            var m = String(r[0]).match(/^DL-LP-(\d+)/i);
            if (m) { var n = parseInt(m[1], 10); if (n > _abMaxLP) _abMaxLP = n; }
          });
        }
        var _abNow   = _ccNow();
        var _abRows  = [];
        var _abUTMs  = [];
        var _abLpCh  = null;
        try {
          var _abAllCh = getChannels();
          _abAllCh.forEach(function(ch) {
            if ((ch.name || '').toLowerCase() === 'direct' || (ch.slug_code || '').toLowerCase() === 'direct') _abLpCh = ch;
          });
          if (!_abLpCh) _abLpCh = { utm_source: 'direct', utm_medium: 'referral' };
        } catch(ce) { _abLpCh = { utm_source: 'direct', utm_medium: 'referral' }; }
        [
          { variant: 'A', slug: brief.lp_slug_a },
          { variant: 'B', slug: brief.lp_slug_b }
        ].forEach(function(vt) {
          _abMaxLP++;
          var _dlId    = 'DL-LP-' + String(_abMaxLP).padStart(4, '0') + '-' + vt.variant;
          var _baseUrl = _buildLpUrl(vt.slug);
          var _utmC    = _dlId + '_lp_variant_' + vt.variant.toLowerCase();
          var _fullUrl = _baseUrl +
            '?utm_source='   + encodeURIComponent(_abLpCh.utm_source || 'direct') +
            '&utm_medium='   + encodeURIComponent(_abLpCh.utm_medium || 'referral') +
            '&utm_campaign=' + encodeURIComponent(brief.id || '') +
            '&utm_content='  + encodeURIComponent(_utmC);
          _abRows.push([_dlId, _utmC, brief.id, 'LP-' + vt.variant, _baseUrl,
            _abLpCh.utm_source || 'direct', _abLpCh.utm_medium || 'referral',
            brief.id, 'ACTIVE', _abNow, _abNow, 'fcGenerateUtmAndSave',
            'LP Variant ' + vt.variant + ' — ab_experiment_id=' + (brief.ab_experiment_id || '10019672')]);
          _abUTMs.push({ dl_id: _dlId, utm_content: _utmC, channel: 'LP-' + vt.variant,
            destination_url: _baseUrl, utm_source: _abLpCh.utm_source,
            utm_medium: _abLpCh.utm_medium, full_url: _fullUrl, status: 'ACTIVE' });
        });
        if (_abRows.length) {
          var _abAppendAt = _abSheet.getLastRow() + 1;
          var _abRange    = _abSheet.getRange(_abAppendAt, 1, _abRows.length, _abHeaders.length);
          _abRange.setNumberFormat('@');
          _abRange.setValues(_abRows);
          _abUTMs.forEach(function(u) { utms.push(u); });
          Logger.log('[fcUTMSave] A/B LP DLs registered: ' + _abRows.map(function(r){return r[0];}).join(', '));
        }
      } else {
        Logger.log('[fcUTMSave] A/B LP DLs already exist: ' + _abExisting.map(function(u){return u.dl_id;}).join(', '));
      }
    }

    // 7. Confirm LP DL_ID is ACTIVE in DeepLinkRegistry
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
    try {
      var allDls   = getDlRegistry(campaignId);
      var emailDls = allDls.filter(function(u) {
        return /^DL-EM/i.test(u.dl_id || '') ||
               (u.channel || '').toLowerCase() === 'email';
      });
      Logger.log('[EXPORT-EMAIL] emailDls in registry: ' + emailDls.length);
      Logger.log('[EXPORT-EMAIL] first email fields: ' + JSON.stringify(Object.keys(emails[0] || {})));
      Logger.log('[EXPORT-EMAIL] first email dl_id: ' + (emails[0] || {}).dl_id);
      Logger.log('[EXPORT-EMAIL] first email utm_url: ' + (emails[0] || {}).utm_url);
      // Positional assignment: SEQ-1→emailDls[0], SEQ-2→emailDls[1], etc.
      var _expSeqOrder = ['SEQ-1', 'SEQ-2', 'SEQ-3', 'SEQ-4'];
      var _expEmailsBySeq = {};
      emails.forEach(function(email) {
        var seq = email.sequence_code || '';
        if (!_expEmailsBySeq[seq]) _expEmailsBySeq[seq] = [];
        _expEmailsBySeq[seq].push(email);
      });
      _expSeqOrder.forEach(function(seq, idx) {
        var entry = emailDls[idx] || null;
        if (!entry) return;
        (_expEmailsBySeq[seq] || []).forEach(function(email) {
          if (email.dl_id) return; // already written by fcGenerateUtmAndSave
          var _lpBase = entry.destination_url || _buildLpUrl(lp ? (lp.slug || '') : (brief.slug || '')) || '';
          email.dl_id   = entry.dl_id;
          email.utm_url = _lpBase +
            '?utm_source=' + encodeURIComponent(entry.utm_source || '') +
            '&utm_medium=' + encodeURIComponent(entry.utm_medium || '') +
            '&utm_campaign=' + encodeURIComponent(brief.id || '') +
            '&utm_content=' + encodeURIComponent((entry.dl_id || '') + '_' + (email.seq_id || seq) + '_cta');
        });
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

// ── Pipeline utility: clear all generated rows for a campaign ─────────────────
// Deletes from SocialPosts, EmailSequences, DeepLinkRegistry.
// Keeps CampaignBriefs and GeneratedCopy untouched.
// Uses batch pattern: one read per sheet, filter in memory, one write back.

function fcClearCampaignData(data) {
  var campaignId = String(data.campaign_id || '').trim();
  if (!campaignId) return { ok: false, error: 'campaign_id is required' };

  var cleared = { posts: 0, emails: 0, dl_ids: 0, videos: 0 };

  function _batchClearTab(tabName) {
    try {
      var sheet   = _getCCSheet(tabName);
      var allData = sheet.getDataRange().getValues();
      if (allData.length < 2) return 0;
      var headers = allData[0];
      var cidIdx  = headers.map(function(h) { return String(h).trim(); }).indexOf('campaign_id');
      if (cidIdx < 0) return 0;
      var kept    = [headers];
      var deleted = 0;
      for (var i = 1; i < allData.length; i++) {
        if (String(allData[i][cidIdx]).trim() === campaignId) {
          deleted++;
        } else {
          kept.push(allData[i]);
        }
      }
      if (deleted === 0) return 0;
      sheet.clearContents();
      if (kept.length > 0) {
        sheet.getRange(1, 1, kept.length, headers.length).setValues(kept);
      }
      Logger.log('[fcClear] ' + tabName + ': deleted ' + deleted + ' rows');
      return deleted;
    } catch(e) {
      Logger.log('[fcClear] ' + tabName + ': ' + e.message);
      return 0;
    }
  }

  // SocialPosts — count video scripts separately (TikTok / YouTube rows)
  try {
    var postsSheet   = _getCCSheet(_CC_TAB.SOCIAL);
    var postsData    = postsSheet.getDataRange().getValues();
    if (postsData.length >= 2) {
      var postsHdrs = postsData[0].map(function(h) { return String(h).trim(); });
      var cidIdx    = postsHdrs.indexOf('campaign_id');
      var platIdx   = postsHdrs.indexOf('platform');
      var keptPosts = [postsData[0]];
      for (var i = 1; i < postsData.length; i++) {
        if (String(postsData[i][cidIdx]).trim() === campaignId) {
          var plat = platIdx >= 0 ? String(postsData[i][platIdx]).toLowerCase() : '';
          if (plat === 'tiktok' || plat === 'youtube') {
            cleared.videos++;
          } else {
            cleared.posts++;
          }
        } else {
          keptPosts.push(postsData[i]);
        }
      }
      if (cleared.posts + cleared.videos > 0) {
        postsSheet.clearContents();
        if (keptPosts.length > 0) {
          postsSheet.getRange(1, 1, keptPosts.length, postsData[0].length).setValues(keptPosts);
        }
      }
      Logger.log('[fcClear] SocialPosts: deleted ' + cleared.posts + ' posts + ' + cleared.videos + ' video scripts');
    }
  } catch(e) {
    Logger.log('[fcClear] SocialPosts: ' + e.message);
  }

  cleared.emails = _batchClearTab(_CC_TAB.EMAIL);
  cleared.dl_ids = _batchClearTab(_CC_TAB.DL);

  Logger.log('[fcClear] Done — ' + campaignId + ' · posts:' + cleared.posts + ' emails:' + cleared.emails + ' dl_ids:' + cleared.dl_ids + ' videos:' + cleared.videos);
  return { ok: true, cleared: cleared };
}