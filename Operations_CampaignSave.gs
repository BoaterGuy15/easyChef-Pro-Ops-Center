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
        email_sequences: parseInt(brief.email_sequences) || 2,
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
      } else {
        // No ACTIVE entries — generate one DL_ID per asset per channel
        var _utmCode = (brief.name||brief.id||'').toLowerCase()
          .replace(/['\-]/g,'').replace(/[^a-z0-9]+/g,'_')
          .replace(/^_+|_+$/g,'').substring(0,50);
        var _baseUrl = 'https://easychefpro.com/' + (brief.slug||'').replace(/^\//,'');
        var _descs   = ['post1_hook','post2_problem','post3_solve','post4_proof','post5_urgency'];
        var _channels = (Array.isArray(brief.channels) && brief.channels.length)
          ? brief.channels : [brief.channel || 'Facebook'];
        var _lpGenerated = false;

        _channels.forEach(function(channelName) {
          var _chData   = _getChannelData(channelName);
          var _chAssets = [];

          // LP once across all channels (tied to first channel processed)
          if (!_lpGenerated && lp && (lp.hero_headline || lp.solve_section)) {
            _chAssets.push({asset_name:'Landing Page', descriptor:'lp', asset_type:'lp'});
            _lpGenerated = true;
          }

          // Posts belonging to this channel
          var _chPosts = posts.filter(function(p){
            return (p.channel||brief.channel||'').toLowerCase() === channelName.toLowerCase();
          });
          _chPosts.forEach(function(p, i) {
            _chAssets.push({
              asset_name: 'Post '+(i+1)+' — '+(p.hook||'').substring(0,40),
              descriptor:  _descs[i] || ('post'+(i+1)),
              asset_type: 'post'
            });
          });

          if (!_chAssets.length) return;

          // Write directly to registry — bypasses generateUtmUrls conflict logic
          // which would cancel sibling-channel entries when force:true
          _chAssets.forEach(function(asset) {
            var prefix     = asset.asset_type === 'lp' ? 'LP' : (_chData.dl_prefix || 'SOC');
            var dlId       = _nextDlId(prefix);
            var utmContent = dlId + '_' + (asset.descriptor || '');
            var fullUrl    = _baseUrl +
              '?utm_source='   + encodeURIComponent(_chData.utm_source) +
              '&utm_medium='   + encodeURIComponent(_chData.utm_medium) +
              '&utm_campaign=' + encodeURIComponent(_utmCode) +
              '&utm_content='  + encodeURIComponent(utmContent);

            setDlRegistryEntry({
              dl_id:           dlId,
              utm_content:     utmContent,
              campaign_id:     brief.id,
              channel:         channelName,
              destination_url: _baseUrl,
              utm_source:      _chData.utm_source,
              utm_medium:      _chData.utm_medium,
              utm_campaign:    _utmCode,
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