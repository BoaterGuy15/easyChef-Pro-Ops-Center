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
          campaign_id: brief.id      || '',
          icp_code:    brief.icp     || '',
          channel:     brief.channel || '',
          post_num:    post.post_num || (i + 1),
          hook:        post.hook        || '',
          body:        post.body        || '',
          hashtags:    post.hashtags    || '',
          image_brief: post.image_brief || '',
          cta:         post.cta         || '',
          url:         post.url         || '',
          status:      'draft',
          created_at:  ts
        });
      });
      saved.posts = posts.length;
    }

    return { ok: true, saved: saved };

  } catch (e) {
    return { ok: false, error: e.message };
  }
}