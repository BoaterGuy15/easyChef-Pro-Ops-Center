// ─────────────────────────────────────────────────────────────────────────────
// Operations_CampaignSave.gs
// Paste this file into your Apps Script project.
//
// ADD TO doPost in Operations.gs (before the task array fallback):
//   if(body.action === 'campaign_save_draft') return respond(saveCampaignDraft(body));
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Writes a campaign draft to four Campaign Center Sheet tabs in one call:
 *   1. CampaignBriefs  — the brief
 *   2. GeneratedCopy   — kickstart copy (if present)
 *   3. LandingPages    — built LP (if present)
 *   4. SocialPosts     — each built post (if any)
 *
 * Returns { ok: true, saved: { brief, copy, lp, posts } }
 */
function saveCampaignDraft(body) {
  Logger.log('[CampaignSave] function entered — brief.id: ' + ((body.brief||{}).id||'none') + ' approved: ' + ((body.brief||{}).approved) + ' ml_approved: ' + ((body.brief||{}).ml_approved));
  try {
    var brief = body.brief  || {};
    var copy  = body.copy   || {};
    var lp    = body.lp     || null;
    var posts = body.posts  || [];
    var ts    = body.timestamp || new Date().toISOString();

    var saved = { brief: false, copy: false, lp: false, posts: 0 };

    // 1 — Save brief
    if (brief.id || brief.name) {
      var briefId = brief.id || getNextCampaignId();
      setCampaignBrief({
        id:              briefId,
        name:            brief.name       || '',
        icp_code:        brief.icp        || '',
        blueprint:       brief.funnel     || '',
        channel:         brief.channel    || '',
        goal:            brief.goal       || '',
        slug:            brief.slug       || '',
        launch_date:     brief.launchDate || '',
        ml_approved:     brief.approved   ? true : false,
        status:          'draft',
        post_count:      parseInt(brief.post_count)      || 7,
        post_frequency:  brief.post_frequency            || 'every_2_days',
        email_sequences: parseInt(brief.email_sequences) || 4,
        email_variants:  parseInt(brief.email_variants)  || 2,
        channels:        Array.isArray(brief.channels) ? brief.channels : []
      });
      saved.brief = true;
    }

    // 2 — Save generated copy
    if (copy.headline || copy.lp_hero) {
      var proofBar = Array.isArray(copy.proof_bar)
        ? copy.proof_bar.join(' | ')
        : (copy.proof_bar || '');
      addGeneratedCopy({
        id:              'copy-' + Date.now().toString(36),
        campaign_id:     brief.id      || '',
        icp_code:        brief.icp     || '',
        channel:         brief.channel || '',
        headline:        copy.headline       || '',
        subheadline:     copy.subheadline    || '',
        email_subject_a: copy.email_subject_a || '',
        email_subject_b: copy.email_subject_b || '',
        lp_hero:         copy.lp_hero        || '',
        proof_bar:       proofBar,
        cta_primary:     copy.cta_primary    || '',
        social_hook:     copy.social_hook    || '',
        share_mechanic:  copy.share_mechanic || '',
        generated_at:    ts
      });
      saved.copy = true;
    }

    // 3 — Save landing page
    if (lp && (lp.hero_headline || lp.solve_section)) {
      var lpProof = Array.isArray(lp.proof_items)
        ? lp.proof_items.join(' · ')
        : (lp.proof_items || '');
      setLandingPage({
        id:               'lp-' + Date.now().toString(36),
        campaign_id:      brief.id   || '',
        icp_code:         brief.icp  || '',
        slug:             brief.slug || '',
        full_url:         lp.cta_url || ('https://easychefpro.com/' + (brief.slug || '')),
        hero_headline:    lp.hero_headline    || '',
        hero_subheadline: lp.hero_subheadline || '',
        section_problem:  lp.problem_section  || '',
        section_agitate:  lp.agitate_section  || '',
        section_solve:    lp.solve_section    || '',
        section_value:    lp.social_proof     || '',
        section_proof:    lpProof,
        section_cta:      lp.cta_primary      || lp.hero_cta || '',
        status:           'draft'
      });
      saved.lp = true;
    }
    // 4 — Save social posts
    if (Array.isArray(posts) && posts.length > 0) {
      var now36 = Date.now().toString(36);
      posts.forEach(function(post, i) {
        setSocialPost({
          id:          'post-' + now36 + '-' + i,
          campaign_id: brief.id                         || '',
          platform:    post.channel || brief.channel    || '',
          hook:        post.hook                        || '',
          body_copy:   post.body                        || '',
          hashtags:    post.hashtags                    || '',
          image_brief: post.image_brief                 || '',
          cta:         post.cta                         || '',
          utm_url:     post.url                         || '',
          status:      'draft'
        });
      });
      saved.posts = posts.length;
    }

    // 5 — Auto-generate and activate UTMs when ML approved (one set per channel)
    Logger.log('[CampaignSave] pre-UTM check — ml_approved: ' + brief.ml_approved + ' approved: ' + brief.approved + ' id: ' + brief.id);
    var utms = [];
    var _utmTotalGenerated = 0;
    if ((brief.approved || brief.ml_approved) && brief.id) {
      // Reuse any existing ACTIVE DL_IDs — never regenerate when already active
      var _existingDls = getDlRegistry(brief.id);
      var _activeDls   = _existingDls.filter(function(r){ return (r.status||'').toUpperCase()==='ACTIVE'; });
      if (_activeDls.length > 0) {
        utms = _activeDls.map(function(u) {
          var fullUrl = (u.destination_url||'') +
            '?utm_source='   + encodeURIComponent(u.utm_source||'') +
            '&utm_medium='   + encodeURIComponent(u.utm_medium||'') +
            '&utm_campaign=' + encodeURIComponent(u.utm_campaign||'') +
            '&utm_content='  + encodeURIComponent(u.utm_content||'');
          return { dl_id:u.dl_id, utm_content:u.utm_content, asset_name:u.notes||u.utm_content, full_url:fullUrl, status:'ACTIVE' };
        });
        Logger.log('[CampaignSave] reusing ' + utms.length + ' existing ACTIVE DL_IDs');
        // Supplement any missing per-sequence email DLs — checks per utm_campaign code, not just "channel has any DL"
        var _suppBase = 'https://easychefpro.com/' + (brief.slug||'').replace(/^\//,'');
        var _suppChs  = (Array.isArray(brief.channels)&&brief.channels.length)?brief.channels:[brief.channel||'Facebook'];
        var _suppSeqs = _getActiveEmailSeqs(brief.email_sequence_mode || brief.email_sequences);
        _suppChs.forEach(function(ch) {
          var _chD = _getChannelData(ch);
          if ((_chD.utm_medium||'').toLowerCase() !== 'email') return;
          var _existingCodes = _activeDls
            .filter(function(r){ return (r.channel||'').toLowerCase() === ch.toLowerCase(); })
            .map(function(r){ return r.utm_campaign || ''; });
          _suppSeqs.forEach(function(seq) {
            if (_existingCodes.indexOf(seq[1]) !== -1) return;
            var _dlId = _nextDlId(_chD.dl_prefix || 'EM');
            var _utmC = _dlId + '_' + seq[1];
            var _fu   = _suppBase + '?utm_source=' + encodeURIComponent(_chD.utm_source) + '&utm_medium=' + encodeURIComponent(_chD.utm_medium) + '&utm_campaign=' + encodeURIComponent(seq[1]) + '&utm_content=' + encodeURIComponent(_utmC);
            setDlRegistryEntry({dl_id:_dlId, utm_content:_utmC, campaign_id:brief.id, channel:ch, destination_url:_suppBase, utm_source:_chD.utm_source, utm_medium:_chD.utm_medium, utm_campaign:seq[1], status:'ACTIVE', notes:seq[0]});
            utms.push({dl_id:_dlId, utm_content:_utmC, asset_name:seq[0], full_url:_fu, status:'ACTIVE'});
            Logger.log('[CampaignSave] supplemented missing seq DL: ' + _dlId + ' · ' + seq[0]);
          });
        });
      } else {
        // No ACTIVE entries — generate one DL_ID per asset per channel
        var _baseUrl = 'https://easychefpro.com/' + (brief.slug||'').replace(/^\//,'');
        var _stages7 = ['post1_hook','post2_problem','post3_agitate','post4_solve','post5_value','post6_proof','post7_cta'];
        var _channels = (Array.isArray(brief.channels) && brief.channels.length)
          ? brief.channels : [brief.channel || 'Facebook'];
        var _lpGenerated = false;

        _channels.forEach(function(channelName) {
          var _chData    = _getChannelData(channelName);
          var _chAssets  = [];
          var _chMedium  = (_chData.utm_medium||'').toLowerCase();
          var _chNameLow = channelName.toLowerCase();
          var _isEmailCh = _chMedium === 'email';

          // LP once across all channels (tied to first channel processed)
          if (!_lpGenerated && lp && (lp.hero_headline || lp.solve_section)) {
            _chAssets.push({asset_name:'Landing Page', descriptor:'lp', asset_type:'lp'});
            _lpGenerated = true;
          }

          if (_chNameLow === 'tiktok') {
            // TikTok: 1 feature spotlight video per campaign
            var _tkFeat = _getTikTokFeature(brief);
            _chAssets.push({
              asset_name: 'TikTok · Feature Spotlight — ' + _tkFeat.toUpperCase(),
              descriptor:  _tkFeat + '_spotlight',
              asset_type: 'video'
            });
          } else if (_chNameLow === 'youtube') {
            // YouTube: 1 explainer video — releases Day 7
            _chAssets.push({
              asset_name: 'YouTube · Explainer — Day 7',
              descriptor:  'explainer_day7',
              asset_type: 'video'
            });
          } else if (_chMedium === 'social' || _chMedium === 'community') {
            // Social/community: 7-post arc (Reddit gets community=true flag via utm_medium)
            _stages7.forEach(function(stage, i) {
              _chAssets.push({
                asset_name: channelName + ' · Post ' + (i+1) + ' — ' + stage,
                descriptor:  stage,
                asset_type: 'post'
              });
            });
          } else if (!_chAssets.length) {
            // Email: 1 DL per active sequence. Other (video handled above, affiliate/organic/direct): skip.
            if (!_isEmailCh) return;
            var _emailSeqs = _getActiveEmailSeqs(brief.email_sequence_mode || brief.email_sequences);
            _emailSeqs.forEach(function(seq) {
              _chAssets.push({asset_name:seq[0]+' — '+seq[1], descriptor:seq[1], asset_type:'email', utm_campaign_override:seq[1]});
            });
            if (!_chAssets.length) {
              _chAssets.push({asset_name:'Email Campaign', descriptor:'email_campaign', asset_type:'email'});
            }
          }

          // Write directly to registry — bypasses generateUtmUrls conflict logic
          // which would cancel sibling-channel entries when force:true
          _chAssets.forEach(function(asset) {
            var prefix          = asset.asset_type === 'lp' ? 'LP' : (_chData.dl_prefix || 'SOC');
            var dlId            = _nextDlId(prefix);
            var utmContent      = dlId + '_' + (asset.descriptor || '');
            // Controlled vocab: per-channel utm_campaign lookup; email seqs use their own code
            var _assetUtmCode   = asset.utm_campaign_override || _buildUtmCampaignCode(brief, channelName);
            var fullUrl         = _baseUrl +
              '?utm_source='   + encodeURIComponent(_chData.utm_source) +
              '&utm_medium='   + encodeURIComponent(_chData.utm_medium) +
              '&utm_campaign=' + encodeURIComponent(_assetUtmCode) +
              '&utm_content='  + encodeURIComponent(utmContent);

            setDlRegistryEntry({
              dl_id:           dlId,
              utm_content:     utmContent,
              campaign_id:     brief.id,
              channel:         channelName,
              destination_url: _baseUrl,
              utm_source:      _chData.utm_source,
              utm_medium:      _chData.utm_medium,
              utm_campaign:    _assetUtmCode,
              status:          'ACTIVE',
              notes:           asset.asset_name || ''
            });

            utms.push({ dl_id:dlId, utm_content:utmContent, asset_name:asset.asset_name, full_url:fullUrl, status:'ACTIVE' });
          });

          Logger.log('[CampaignSave] ' + channelName + ': generated ' + _chAssets.length + ' DL_IDs');
          _utmTotalGenerated += _chAssets.length;
        });

        Logger.log('[CampaignSave] total new ACTIVE DL_IDs: ' + _utmTotalGenerated);
      }
    }

    return { ok: true, saved: saved, utms: utms, debug: {
      brief_id:          brief.id,
      approved:          brief.approved,
      ml_approved:       brief.ml_approved,
      utm_total:         utms.length,
      utm_new_generated: _utmTotalGenerated
    }};

  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── One-click full campaign pipeline ─────────────────────────────────────────

/**
 * Loads brief from sheet, builds full sequence (emails + social + video scripts),
 * generates UTMs, exports to Drive — all server-side in one call.
 * Called via action='run_full_campaign'.
 * Returns { ok, campaign_id, emails, posts, video_scripts, utms, calendar, drive_url, total_assets }
 */
function runFullCampaignAutomatic(campaignId) {
  try {
    if (!campaignId) return { ok: false, error: 'campaign_id is required' };

    // 1. Load brief from sheet
    var rawBrief = getCampaignBriefs(campaignId);
    if (!rawBrief) return { ok: false, error: 'Brief not found: ' + campaignId };
    Logger.log('[runFullCampaign] Brief loaded: ' + rawBrief.name);

    // Normalize brief shape for the pipeline (sheet uses icp_code; pipeline uses icp, launchDate, etc.)
    var brief = {
      id:                    rawBrief.id,
      name:                  rawBrief.name,
      icp:                   rawBrief.icp_code,
      channel:               rawBrief.channel,
      channels:              Array.isArray(rawBrief.channels) ? rawBrief.channels : [],
      funnel:                rawBrief.blueprint,
      blueprint:             rawBrief.blueprint,
      blueprint_code:        rawBrief.blueprint,
      goal:                  rawBrief.goal,
      slug:                  rawBrief.slug,
      launchDate:            rawBrief.launch_date,
      launch_date:           rawBrief.launch_date,
      theme:                 rawBrief.theme,
      status:                rawBrief.status,
      approved:              true,
      ml_approved:           true,
      post_count:            rawBrief.post_count      || 7,
      post_frequency:        rawBrief.post_frequency  || 'every_2_days',
      email_sequences:       rawBrief.email_sequences || 'full',
      email_sequence_mode:   rawBrief.email_sequences || 'full',
      email_variants:        rawBrief.email_variants  || 'both',
      campaign_duration_days: 35
    };

    // 2. Load most recent generated copy for this campaign
    var copyRows = getGeneratedCopy(campaignId);
    var copy = (copyRows && copyRows.length > 0) ? copyRows[copyRows.length - 1] : {};
    Logger.log('[runFullCampaign] Copy: ' + (copy.headline || '(none yet)'));

    // 3. Build full sequence — emails + all social channels + video scripts (TikTok/YouTube templates)
    Logger.log('[runFullCampaign] buildFullSequence starting...');
    var seqResult = buildFullSequence(brief, copy);
    if (!seqResult.ok) return { ok: false, step: 'sequence', error: seqResult.error };
    var emailCount = (seqResult.emails || []).length;
    var postCount  = (seqResult.posts  || []).length;
    var videoCount = (seqResult.posts  || []).filter(function(p) {
      var pl = (p.platform || '').toLowerCase();
      return pl === 'youtube' || pl === 'tiktok';
    }).length;
    Logger.log('[runFullCampaign] Sequence: ' + emailCount + ' emails, ' + postCount + ' posts (' + videoCount + ' video scripts)');

    // 4. Load LP for this campaign (needed for Drive export + UTM save)
    var lp = null;
    try { lp = getLPInventoryBySlug(rawBrief.slug) || null; } catch(le) {}

    // 5. Save draft + generate UTMs (approved=true triggers UTM generation)
    Logger.log('[runFullCampaign] saveCampaignDraft + UTMs...');
    var saveResult = saveCampaignDraft({ brief: brief, copy: copy, lp: lp, posts: seqResult.posts || [], emails: seqResult.emails || [] });
    var utmCount = (saveResult && saveResult.utms && saveResult.utms.length) || 0;
    Logger.log('[runFullCampaign] UTMs: ' + utmCount);

    // 6. Export to Drive
    Logger.log('[runFullCampaign] exportCampaignToDrive...');
    var driveResult = { ok: false, error: 'skipped' };
    try {
      driveResult = exportCampaignToDrive(brief, copy, seqResult.posts || [], lp || {}, seqResult.emails || []);
    } catch(de) {
      Logger.log('[runFullCampaign] Drive export failed (non-fatal): ' + de.message);
      driveResult = { ok: false, error: de.message };
    }

    Logger.log('[runFullCampaign] Done — ' + (emailCount + postCount) + ' total assets');
    return {
      ok:            true,
      campaign_id:   campaignId,
      emails:        emailCount,
      posts:         postCount,
      video_scripts: videoCount,
      utms:          utmCount,
      calendar:      (seqResult.calendar || []).length,
      drive_url:     (driveResult.ok && driveResult.folder_url) ? driveResult.folder_url : '',
      drive_ok:      !!(driveResult.ok),
      total_assets:  emailCount + postCount
    };
  } catch(e) {
    Logger.log('[runFullCampaign] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}


/**
 * Returns [[seqLabel, utm_campaign_code], ...] for the active sequence mode.
 * Used to generate one DL per email sequence instead of one per campaign.
 */
function _getActiveEmailSeqs(raw) {
  var map = {
    'seq1_only':      [['SEQ-1','seq1_welcome']],
    'seq1_seq2':      [['SEQ-1','seq1_welcome'],['SEQ-2','seq2_nurture']],
    'seq1_seq2_seq3': [['SEQ-1','seq1_welcome'],['SEQ-2','seq2_nurture'],['SEQ-3','seq3_urgency']],
    'full':           [['SEQ-1','seq1_welcome'],['SEQ-2','seq2_nurture'],['SEQ-3','seq3_urgency'],['SEQ-4','seq4_launch_day']],
    'seq5_only':      [['SEQ-5','seq5_reengagement']]
  };
  if (map[raw]) return map[raw];
  var n = parseInt(raw, 10);
  if (isNaN(n)) return map['full'];  // default: all 4 sequences = 4 DL_IDs
  if (n <= 1) return map['seq1_only'];
  if (n <= 2) return map['seq1_seq2'];
  if (n <= 3) return map['seq1_seq2_seq3'];
  return map['full'];
}

/**
 * Controlled vocabulary utm_campaign lookup.
 * ICP + channel → approved code. Never auto-generated from campaign name.
 */
function _buildUtmCampaignCode(brief, channelName) {
  var ch    = (channelName || '').toLowerCase();
  var icp   = (brief.icp  || '').toLowerCase();
  var angle = (brief.campaign_angle || '').toLowerCase();
  var theme = ((brief.name || '') + ' ' + (brief.theme || '')).toLowerCase();

  // Email sequences use per-sequence codes (set via utm_campaign_override in calling loop)
  if (ch === 'email') return 'seq1_welcome';

  var _pfxMap = {
    facebook:'fb', instagram:'ig', tiktok:'tk', pinterest:'pin',
    nextdoor:'nd', youtube:'yt', x:'x', reddit:'rd', vimeo:'vm'
  };
  var prefix = _pfxMap[ch] || ch.substring(0, 3);

  // Angle/theme overrides
  if (ch === 'tiktok'    && angle === 'waste')                                    return 'tk_waste';
  if (ch === 'pinterest' && angle === 'savings')                                  return 'pin_savings';
  if (ch === 'pinterest' && (angle === 'speed' || theme.indexOf('meal') >= 0))    return 'pin_meal_plan';
  if (ch === 'instagram' && (angle === 'health' || icp === 'health_optimizer'))   return 'ig_health';
  if (ch === 'facebook'  && icp === 'budget_family')                              return 'fb_budget_family';
  if (ch === 'facebook'  && icp === 'professional')                               return 'fb_professional';

  // ICP-based default: [channel_prefix]_[icp_code]
  var _icpMap = {
    super_mom:'super_mom', budget_family:'budget_family', professional:'professional',
    health_optimizer:'health', alpha_recruit:'alpha'
  };
  return prefix + '_' + (_icpMap[icp] || icp || 'pre_launch');
}

/**
 * Maps campaign theme/name to a TikTok feature for spotlight video DL_ID.
 * Feature categories: cook · plan · track · optimize
 */
function _getTikTokFeature(brief) {
  var t = ((brief.name || '') + ' ' + (brief.theme || '')).toLowerCase();
  if (/taco|game.?night|30.?min|doordash/.test(t))               return 'cook';
  if (/meal.?prep|grocery.?challenge|back.?to.?school|sunday.?reset/.test(t)) return 'plan';
  if (/waste|leftover|fridge.?clear|1336|receipt/.test(t))       return 'track';
  if (/macro|clean.?plate|6.?dimension/.test(t))                 return 'optimize';
  return 'cook'; // default to COOK feature
}