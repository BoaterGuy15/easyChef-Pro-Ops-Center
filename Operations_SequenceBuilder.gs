// ─────────────────────────────────────────────────────────────────────────────
// Operations_SequenceBuilder.gs
//
// ADD TO doPost in Operations.gs (before the task array fallback):
//   if(body.action === 'build_full_sequence') return respond(buildFullSequence(body.brief, body.copy));
// ─────────────────────────────────────────────────────────────────────────────

// ── Sequence mode → which sequence groups to include ─────────────────────────

var _SB_SEQ_MAP = {
  'seq1_only':      ['SEQ-1'],
  'seq1_seq2':      ['SEQ-1','SEQ-2'],
  'seq1_seq2_seq3': ['SEQ-1','SEQ-2','SEQ-3'],
  'full':           ['SEQ-1','SEQ-2','SEQ-3','SEQ-4'],
  'seq5_only':      ['SEQ-5']
};

// ── Per-execution caches — loaded from FunnelStages sheet on first call ───────

var _sbWireframeCache   = null;
var _sbSeqOffsetsCache  = null;

// ── _sbGetWireframe ───────────────────────────────────────────────────────────
// Builds the 13-email master wireframe from FunnelStages sheet data.
// Stage roles for SEQ-1/2/3/4 use sheet email_theme values where available;
// SEQ-2 sub-themes (savings/speed/waste) are intentionally specific and kept
// as constants because they refer to distinct approved claims, not stage structure.
// Falls back to the full hardcoded array if the sheet is unavailable.

function _sbGetWireframe() {
  if (_sbWireframeCache) return _sbWireframeCache;

  var stg = {};
  try {
    var fsRows = getFunnelStages();
    fsRows.forEach(function(s) { stg[s.stage_name] = s; });
  } catch(e) {}

  function role(stageName, fallback) {
    return (stg[stageName] && stg[stageName].email_theme) ? stg[stageName].email_theme : fallback;
  }

  var ctaOffset = (stg['cta'] && parseInt(stg['cta'].seq_offset_days)) || 28;

  _sbWireframeCache = [
    // SEQ-1 — Welcome (trigger: waitlist_signup)
    { seq:'SEQ-1', num:1, global:1,  day:0,
      role: role('hook',    'You\'re In — confirm signup, deliver the promise, make them glad they joined — NO CTA, no links, pure welcome energy'),
      trigger:'waitlist_signup', theme:'welcome',     stage:'hook'     },
    { seq:'SEQ-1', num:2, global:2,  day:3,
      role: role('problem', 'Problem + story — name the exact 6:30 PM fridge-stare pain, tell a one-sentence founder story, agitate the cost — CTA to LP with registered DL_ID required'),
      trigger:'waitlist_signup', theme:'problem',     stage:'problem'  },
    { seq:'SEQ-1', num:3, global:3,  day:7,
      role: role('solve',   'Value + CTA to LP — one approved stat, one sentence of social proof, clear CTA linking to the landing page — founding price framing'),
      trigger:'waitlist_signup', theme:'proof_intro', stage:'solve'    },
    // SEQ-2 — Nurture (trigger: seq1_complete)
    { seq:'SEQ-2', num:1, global:4,  day:7,
      role:'Savings spotlight — $1,336/year — show the annual maths clearly',
      trigger:'seq1_complete',   theme:'savings',     stage:'value'    },
    { seq:'SEQ-2', num:2, global:5,  day:10,
      role:'Speed spotlight — 30 minutes fridge to table — paint the scene',
      trigger:'seq1_complete',   theme:'speed',       stage:'value'    },
    { seq:'SEQ-2', num:3, global:6,  day:14,
      role:'Waste spotlight — 69.5% less food waste — make the number feel real',
      trigger:'seq1_complete',   theme:'waste',       stage:'value'    },
    { seq:'SEQ-2', num:4, global:7,  day:18,
      role: role('agitate', 'Objection handler — Is $7.99/month worth it? Answer directly and honestly'),
      trigger:'seq1_complete',   theme:'objection',   stage:'agitate'  },
    { seq:'SEQ-2', num:5, global:8,  day:25,
      role: role('proof',   'Final nurture proof — founding price window closing, strongest proof statement'),
      trigger:'seq1_complete',   theme:'proof_final', stage:'proof'    },
    // SEQ-3 — Urgency (trigger: june_17_urgency — June 17, 14 days before July 1 launch)
    { seq:'SEQ-3', num:1, global:9,  day:0,
      role: role('cta',     'Countdown begins — 14 days to launch, founding price window framing'),
      trigger:'june_17_urgency', theme:'urgency',       stage:'cta'   },
    { seq:'SEQ-3', num:2, global:10, day:4,
      role:'Founding price closes in 10 days — financial specificity, loss framing',
      trigger:'june_17_urgency', theme:'price',         stage:'cta'   },
    { seq:'SEQ-3', num:3, global:11, day:10,
      role:'Last 4 days — what changes on July 1, concrete and specific',
      trigger:'june_17_urgency', theme:'urgency_final', stage:'cta'   },
    { seq:'SEQ-3', num:4, global:12, day:13,
      role:'Last chance — tomorrow is July 1, no fake scarcity, just honest final call',
      trigger:'june_17_urgency', theme:'last_chance',   stage:'cta'   },
    // SEQ-4 — Launch Day (trigger: july_1_launch — July 1)
    { seq:'SEQ-4', num:1, global:13, day:0,
      role: role('hook',    'App is live — download now — celebrate with them, lead with the win'),
      trigger:'july_1_launch',   theme:'launch',        stage:'hook'  },
    // SEQ-5 — Re-engagement Campaign (trigger: campaign-specific)
    { seq:'SEQ-5', num:1, global:14, day:2,
      role:'Re-engagement hook — remind them why they signed up, surface a specific win or new insight',
      trigger:'campaign_trigger', theme:'reengagement',       stage:'hook' },
    { seq:'SEQ-5', num:2, global:15, day:9,
      role:'Re-engagement close — clear next step, specific offer or action, low pressure',
      trigger:'campaign_trigger', theme:'reengagement_close', stage:'cta'  }
  ];

  return _sbWireframeCache;
}

// ── _sbGetSeqOffsets ──────────────────────────────────────────────────────────
// Returns calendar day offsets per sequence group.
// SEQ-3 offset = cta stage seq_offset_days (default 28).
// SEQ-4 offset = cta offset + 14 (≈ July 1 from June 17).

function _sbGetSeqOffsets() {
  if (_sbSeqOffsetsCache) return _sbSeqOffsetsCache;
  var ctaOffset = 28;
  try {
    var fsRows = getFunnelStages();
    for (var i = 0; i < fsRows.length; i++) {
      if (fsRows[i].stage_name === 'cta') {
        ctaOffset = parseInt(fsRows[i].seq_offset_days) || 28;
        break;
      }
    }
  } catch(e) {}
  _sbSeqOffsetsCache = { 'SEQ-1': 0, 'SEQ-2': 0, 'SEQ-3': ctaOffset, 'SEQ-4': ctaOffset + 14, 'SEQ-5': 0 };
  return _sbSeqOffsetsCache;
}


// ── buildFullSequence ─────────────────────────────────────────────────────────

/**
 * Master entry point. Builds the email + social calendar in sequence.
 * If existingPosts are provided (from the Kickstart/Asset Builder tab) they are
 * scheduled onto the theme timeline instead of regenerating via AI.
 * If existingEmails are provided they are used as-is.
 * After building, UTMs from DeepLinkRegistry are stamped onto every post.
 * Returns { ok:true, emails:[...], posts:[...], calendar:[...] }
 */
function buildFullSequence(brief, copy, existingPosts, existingEmails) {
  try {
    if (!brief) return { ok: false, error: 'brief is required' };

    // ── Emails ──────────────────────────────────────────────────────────────
    var emailResult;
    if (Array.isArray(existingEmails) && existingEmails.length > 0) {
      // Normalize AssetBuilder format { seq_id, send_day, subject, preheader, body, cta_text }
      // to SequenceBuilder format { sequence_code, email_number, subject_line_a, preview_text_a, … }
      existingEmails = existingEmails.map(function(e) {
        if (e.subject_line_a !== undefined) return e;
        var seqCode  = e.seq_id ? String(e.seq_id).replace(/-E\d+$/i, '') : 'EMAIL';
        var emailNum = parseInt((String(e.seq_id || '').match(/-E(\d+)$/i) || [])[1]) || 1;
        return {
          seq_id:         e.seq_id        || '',
          sequence_code:  seqCode,
          email_number:   emailNum,
          subject_line_a: e.subject       || '',
          subject_line_b: e.subject_b     || '',
          preview_text_a: e.preheader     || '',
          body_hook:      e.body          || '',
          body_cta:       e.cta_text      || '',
          send_day:       e.send_day      || 0,
          trigger_event:  e.trigger_event || '',
          theme:          e.theme         || '',
          funnel_stage:   e.funnel_stage  || '',
          status:         e.status        || 'draft',
          campaign_id:    e.campaign_id   || ''
        };
      });
      Logger.log('[buildFullSequence] using ' + existingEmails.length + ' existing emails');
      emailResult = { ok: true, emails: existingEmails };
    } else {
      emailResult = buildEmailCalendar(brief, copy);
      if (!emailResult.ok) return { ok: false, error: 'Email calendar failed: ' + emailResult.error };
    }

    // ── Posts ───────────────────────────────────────────────────────────────
    var socialResult;
    if (Array.isArray(existingPosts) && existingPosts.length > 0) {
      // Always strip TikTok/YouTube from existingPosts and replace with static single-asset entries.
      // This prevents stale 7-post AI generations from overriding the 1-asset spec.
      var _arcPosts = existingPosts.filter(function(p) {
        var ch = ((p.channel || p.platform || '')).toLowerCase();
        return ch !== 'tiktok' && ch !== 'youtube';
      });
      var _briefChs = Array.isArray(brief.channels) ? brief.channels : [brief.channel || ''];
      var _hasTK = _briefChs.some(function(c){return(c||'').toLowerCase()==='tiktok';});
      var _hasYT = _briefChs.some(function(c){return(c||'').toLowerCase()==='youtube';});
      if (_hasTK) {
        var _tkFts  = _getTikTokFeatureList(brief);
        var _tkDays = [3, 10, 17, 24, 31];
        _tkFts.forEach(function(ft, fi) {
          var _tday   = _tkDays[fi] !== undefined ? _tkDays[fi] : (3 + fi * 7);
          var _tscript = _buildTikTokScriptTemplate(ft.code, ft.label, brief);
          _arcPosts.push({ id:(brief.id||'')+'-tiktok-POST-'+String(fi+1).padStart(3,'0'),
            campaign_id:brief.id||'', platform:'TikTok',
            post_num:fi+1, scheduled_day:_tday, theme:'solve', funnel_stage:'solve',
            feature:ft.code, feature_label:ft.label,
            hook:ft.code+' — '+ft.label,
            body_copy:_tscript, script:_tscript,
            cta:'Link in bio', hashtags:'' });
        });
      }
      if (_hasYT) {
        var _ytScript = _buildYouTubeScriptTemplate(brief);
        _arcPosts.push({ id:(brief.id||'')+'-youtube-POST-001', campaign_id:brief.id||'', platform:'YouTube',
          post_num:1, scheduled_day:6, theme:'cta', funnel_stage:'cta',
          hook:'easyChef Pro — 60-second explainer',
          body_copy:_ytScript, script:_ytScript,
          cta:'Join the waitlist — link in description', hashtags:'' });
      }
      Logger.log('[buildFullSequence] existingPosts: ' + existingPosts.length + ' → ' + _arcPosts.length + ' after TK/YT static replacement');
      socialResult = _sbScheduleExistingPosts(brief, _arcPosts);
    } else {
      socialResult = buildSocialCalendar(brief, copy);
      if (!socialResult.ok) return { ok: false, error: 'Social calendar failed: ' + socialResult.error };
    }

    // ── Stamp UTMs from DeepLinkRegistry onto every post ────────────────────
    var posts = _sbAttachUtms(socialResult.posts || [], brief.id || '');

    // ── Arc 2: Urgency social posts (Days 22–28) for A-Waitlist 35-day campaigns ─
    var isWaitlist35 = (brief.blueprint === 'A-Waitlist' || brief.blueprint_code === 'A-Waitlist') &&
                       (parseInt(brief.campaign_duration_days) || 0) >= 35;
    if (isWaitlist35) {
      var arc2Posts = _sbBuildArc2Posts(brief, posts);
      posts = posts.concat(arc2Posts);
    }

    var calendar = _sbMergeCalendar(emailResult.emails || [], posts);

    return {
      ok:       true,
      emails:   emailResult.emails || [],
      posts:    posts,
      calendar: calendar
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Takes pre-built kickstart posts and assigns calendar day offsets from the
 * theme schedule (same schedule buildSocialCalendar would use).
 * Writes posts to SocialPosts sheet with correct scheduled dates.
 * Returns { ok, posts, frequency } matching buildSocialCalendar's shape.
 */
function _sbScheduleExistingPosts(brief, existingPosts) {
  try {
    var frequency   = brief.post_frequency || 'daily';
    var seqMode     = _sbNormalizeSeqMode(brief.email_sequence_mode || brief.email_sequences);
    var activeSeqs  = _SB_SEQ_MAP[seqMode] || _SB_SEQ_MAP['seq1_seq2'];
    var campaignId  = brief.id || '';
    var activeWF    = _sbGetWireframe().filter(function(e) { return activeSeqs.indexOf(e.seq) !== -1; });
    // Build theme-only schedule sized to brief.post_count, not total post count across all channels.
    // Day assignment uses per-channel index directly so all platforms sync to the same day.
    var maxPerCh      = parseInt(brief.post_count) || 7;
    var themeSchedule = _sbBuildSocialSchedule(activeWF, maxPerCh, _sbGetSeqOffsets());
    var arcThemes     = ['hook','problem','agitate','solve','value','proof','cta'];

    // Group by channel, preserving per-channel order
    var channels = [];
    var byChannel = {};
    existingPosts.forEach(function(p) {
      var ch = p.channel || p.platform || brief.channel || '';
      if (!byChannel[ch]) { byChannel[ch] = []; channels.push(ch); }
      byChannel[ch].push(p);
    });
    channels = channels.filter(function(c, i, a) { return a.indexOf(c) === i; });

    var allPosts = [];

    channels.forEach(function(channel) {
      var chPosts = byChannel[channel];
      var chSlug  = channel.toLowerCase().replace(/[^a-z0-9]/g, '');

      chPosts.forEach(function(p, i) {
        // Respect pre-set scheduled_day (TikTok=3, YouTube=6); arc posts get sequential days 0-6
        var absDay    = (p.scheduled_day !== undefined) ? p.scheduled_day : i;
        var postTheme = p.theme || (themeSchedule[i] && themeSchedule[i].theme) || arcThemes[i] || '';
        var postId    = campaignId + '-' + chSlug + '-POST-' + String(i + 1).padStart(3, '0');

        var scheduledDate = '';
        if (brief.launchDate && absDay !== undefined) {
          try {
            var ld = new Date(brief.launchDate + 'T12:00:00');
            ld.setDate(ld.getDate() + absDay);
            scheduledDate = Utilities.formatDate(ld, Session.getScriptTimeZone(), 'yyyy-MM-dd');
          } catch(de) {}
        }

        var mapped = {
          id:             postId,
          campaign_id:    campaignId,
          platform:       channel,
          post_num:       i + 1,
          scheduled_day:  absDay,
          scheduled_date: scheduledDate,
          theme:          postTheme,
          funnel_stage:   p.funnel_stage || postTheme || '',
          hook:           p.hook         || '',
          body_copy:      p.body         || p.body_copy || '',
          script:         p.script       || '',
          feature:        p.feature      || '',
          feature_label:  p.feature_label|| '',
          cta:            p.cta          || '',
          hashtags:       p.hashtags     || ''
        };

        setSocialPost({
          id:             postId,
          campaign_id:    campaignId,
          platform:       channel,
          hook:           mapped.hook,
          body_copy:      mapped.body_copy,
          cta:            mapped.cta,
          hashtags:       mapped.hashtags,
          scheduled_date: scheduledDate,
          status:         'draft'
        });

        allPosts.push(mapped);
      });
    });

    return { ok: true, posts: allPosts, frequency: frequency };
  } catch(e) {
    Logger.log('[_sbScheduleExistingPosts] error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * Looks up DeepLinkRegistry for campaignId and stamps each post with its
 * matching dl_id + utm_url, matching by channel (utm_source) then position.
 * Non-destructive — posts without a match are returned unchanged.
 */
function _sbAttachUtms(posts, campaignId) {
  if (!campaignId || !posts.length) return posts;
  try {
    var dlEntries = getDlRegistry(campaignId).filter(function(e) {
      return (e.status || '').toUpperCase() === 'ACTIVE' && /post\d+/.test(e.utm_content || '');
    });
    if (!dlEntries.length) { Logger.log('[_sbAttachUtms] no ACTIVE post entries for ' + campaignId); return posts; }

    // Group DL entries by utm_source
    var dlBySource = {};
    dlEntries.forEach(function(e) {
      var src = (e.utm_source || '').toLowerCase();
      if (!dlBySource[src]) dlBySource[src] = [];
      dlBySource[src].push(e);
    });

    // Group posts by resolved utm_source for their channel
    var postsBySource = {};
    posts.forEach(function(p) {
      var chData = _getChannelData(p.platform || p.channel || '');
      var src    = (chData.utm_source || '').toLowerCase();
      if (!postsBySource[src]) postsBySource[src] = [];
      postsBySource[src].push(p);
    });

    // Match each post to its DL entry by position within channel
    Object.keys(postsBySource).forEach(function(src) {
      var chPosts = postsBySource[src];
      var chDls   = dlBySource[src] || [];
      chPosts.forEach(function(p, idx) {
        if (chDls[idx]) {
          p.dl_id   = chDls[idx].dl_id;
          p.utm_url = (chDls[idx].destination_url || '') +
            '?utm_source='   + encodeURIComponent(chDls[idx].utm_source   || '') +
            '&utm_medium='   + encodeURIComponent(chDls[idx].utm_medium   || '') +
            '&utm_campaign=' + encodeURIComponent(chDls[idx].utm_campaign || '') +
            '&utm_content='  + encodeURIComponent(chDls[idx].utm_content  || '');
          Logger.log('[_sbAttachUtms] post ' + (idx+1) + ' (' + (p.platform||p.channel) + ') → ' + p.dl_id);
        }
      });
    });
  } catch(e) {
    Logger.log('[_sbAttachUtms] error: ' + e.message);
  }
  return posts;
}


// ── buildEmailCalendar ────────────────────────────────────────────────────────

/**
 * Generates the full email sequence based on brief.email_sequences and
 * brief.email_variants. Writes one EmailSequences row per variant per email.
 */
function buildEmailCalendar(brief, copy) {
  try {
    var props  = PropertiesService.getScriptProperties();
    var apiKey = props.getProperty('ANTHROPIC_API_KEY');
    if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set in Script Properties' };

    var seqMode = _sbNormalizeSeqMode(brief.email_sequence_mode || brief.email_sequences);
    var varMode = _sbNormalizeVariantMode(brief.email_variants);

    var activeSeqs = _SB_SEQ_MAP[seqMode] || _SB_SEQ_MAP['seq1_seq2'];
    var wireframe  = _sbGetWireframe().filter(function(e) {
      return activeSeqs.indexOf(e.seq) !== -1;
    });

    var lpUrl      = _buildLpUrl(brief.slug || 'waitlist');
    var campaignId = brief.id || '';
    var emails     = [];

    var variantInstr = '';
    if (varMode === 'variant_a') {
      variantInstr =
        'VARIANTS: Generate Variant A subject line only (money angle — $1,336/year savings, loss aversion, financial framing).\n' +
        'Leave subject_b as empty string.';
    } else if (varMode === 'variant_b') {
      variantInstr =
        'VARIANTS: Generate Variant B subject line only (simplicity angle — 6:30 PM fridge panic, emotional relief, time framing).\n' +
        'Leave subject_a as empty string.';
    } else {
      variantInstr =
        'VARIANTS: Generate both A and B subject lines.\n' +
        'subject_a = Money angle: $1,336/year savings, loss aversion framing, financial specificity.\n' +
        'subject_b = Simplicity angle: 6:30 PM fridge panic, emotional relief, time-saving framing.\n' +
        'One preview_text serves both variants — write it to bridge both angles.';
    }

    var proofBarStr = (copy && Array.isArray(copy.proof_bar))
      ? copy.proof_bar.join(' · ')
      : (copy && copy.proof_bar || '');

    for (var wi = 0; wi < wireframe.length; wi++) {
      var wf        = wireframe[wi];
      var isWelcome = (wf.seq === 'SEQ-1' && wf.num === 1);

      var emailCtx       = _buildBriefStoryCtx(brief);
      emailCtx.theme_id  = brief.theme_id || brief.theme || '';
      emailCtx.icp_code  = brief.icp || '';
      emailCtx.seq_stage = wf.stage;

      var systemPrompt =
        getMasterSystemPrompt('email_full', emailCtx) +
        '=== EMAIL SEQUENCE RULES ===\n' +
        'From name: Taylor at easyChef Pro\n' +
        'TESTIMONIALS ARE BANNED: Never write "One mom told us...", "A customer said...", or any fabricated testimonial. No invented names, no invented quotes.\n' +
        'NUMBERS POLICY: ONLY use figures from the approved claims list. No other dollar amounts, percentages, or counts.\n' +
        'BODY LENGTH: Each step section should be 2-4 sentences. Total email should be 250+ words across all steps combined.\n' +
        'BODY PS: Every email must end with a P.S. line — one sentence that adds urgency or reinforces the founding offer.\n\n' +
        '=== CAMPAIGN ===\n' +
        'Name: '                  + (brief.name || '')                 + '\n' +
        'Landing page: '          + lpUrl                               + '\n' +
        'Kickstart headline: '    + (copy && copy.headline    || '')    + '\n' +
        'Kickstart subheadline: ' + (copy && copy.subheadline || '')    + '\n' +
        'Kickstart CTA: '         + (copy && copy.cta_primary || '')    + '\n' +
        'Proof bar: '             + proofBarStr                         + '\n\n' +
        '=== ' + variantInstr + ' ===\n\n' +
        '=== THIS EMAIL ===\n' +
        'ID: ' + wf.seq + '-E' + wf.num + ' (Global #' + wf.global + ')\n' +
        'Stage: ' + wf.stage.toUpperCase() + '\n' +
        'Theme: ' + wf.theme + '\n' +
        'Role: ' + wf.role + '\n' +
        'Send day: Day ' + wf.day + ' after "' + wf.trigger + '"\n' +
        (isWelcome
          ? 'SPECIAL RULE — NO CTA: This is the welcome confirmation email. step7_cta_text and step7_cta_button MUST be empty strings. No call-to-action, no link. The nurture sequence has not started yet.\n\n'
          : '\n') +
        '=== OUTPUT FORMAT ===\n' +
        'Return ONLY a valid JSON object. No markdown. No explanation.\n' +
        '{\n' +
        '  "subject_a": "Money angle — under 50 chars, no emoji",\n' +
        '  "subject_b": "Simplicity/emotion angle — under 50 chars, no emoji",\n' +
        '  "preview_text": "Under 90 chars — bridges both subject angles, creates curiosity",\n' +
        '  "from_name": "Taylor at easyChef Pro",\n' +
        '  "step1_hook": "2-3 sentences — hooks the reader, specific to ICP pain and this email\'s stage",\n' +
        '  "step2_problem": "2-3 sentences naming the exact pain — specific moment, not generic",\n' +
        '  "step3_agitate": "2-3 sentences deepening the pain — name the cost, make it real",\n' +
        '  "step4_solve": "2 sentences — easyChef Pro as the obvious answer",\n' +
        '  "step5_value": "2-3 sentences — specific outcomes, approved claims only, peace-forward",\n' +
        '  "step6_proof": "1-2 sentences — one approved stat exact wording, no invented testimonials",\n' +
        '  "step7_cta_text": "CTA line — outcome-framed, under 10 words",\n' +
        '  "step7_cta_button": "Button label — under 6 words",\n' +
        '  "step7_ps": "P.S. — one sentence urgency or founding offer reinforcement"\n' +
        '}';

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
          messages:   [{ role: 'user', content: 'Generate email ' + wf.seq + '-E' + wf.num + ' (' + wf.stage.toUpperCase() + ' stage) for the ' + (brief.icp || 'target') + ' ICP. Return only the JSON object.' }]
        }),
        muteHttpExceptions: true
      });

      var data  = JSON.parse(resp.getContentText());
      var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
      if (!reply && data.error) {
        Logger.log('buildEmailCalendar: API error on ' + wf.seq + '-E' + wf.num + ' — ' +
          (typeof data.error === 'object' ? data.error.message : String(data.error)));
        continue;
      }

      var e = null;
      try {
        var jsonStr = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
        e = JSON.parse(jsonStr);
      } catch (parseErr) {
        Logger.log('buildEmailCalendar: parse error on ' + wf.seq + '-E' + wf.num + ' — ' + parseErr.message);
        continue;
      }

      // SEQ-1-E1 no-CTA enforcement
      if (isWelcome) { e.step7_cta_text = ''; e.step7_cta_button = ''; }

      // Metadata
      e.seq_id        = wf.seq + '-E' + wf.num;
      e.sequence_code = wf.seq;
      e.email_number  = wf.num;
      e.global_number = wf.global;
      e.send_day      = wf.day;
      e.trigger_event = wf.trigger;
      e.theme         = wf.theme;
      e.funnel_stage  = wf.stage;
      e.campaign_id   = campaignId;
      e.status        = 'draft';

      // Legacy field aliases for backward compat
      e.subject_line_a = e.subject_a      || '';
      e.subject_line_b = e.subject_b      || '';
      e.preview_text_a = e.preview_text   || '';
      e.preview_text_b = '';
      e.body_hook      = e.step1_hook     || '';
      e.body_problem   = e.step2_problem  || '';
      e.body_agitate   = e.step3_agitate  || '';
      e.body_solve     = e.step4_solve    || '';
      e.body_value     = e.step5_value    || '';
      e.body_proof     = e.step6_proof    || '';
      e.body_cta       = e.step7_cta_text || '';
      e.body_ps        = e.step7_ps       || '';

      emails.push(e);

      var writeA = varMode === 'both' || varMode === 'variant_a';
      var writeB = varMode === 'both' || varMode === 'variant_b';

      if (writeA) {
        setEmailSequence({
          id:            campaignId + '-' + e.seq_id + '-A',
          campaign_id:   campaignId,
          sequence_code: e.sequence_code,
          email_number:  e.email_number,
          subject_line:  e.subject_line_a,
          preview_text:  e.preview_text_a,
          body_hook:     e.body_hook,
          body_problem:  e.body_problem,
          body_agitate:  e.body_agitate,
          body_solve:    e.body_solve,
          body_value:    e.body_value,
          body_proof:    e.body_proof,
          body_cta:      e.body_cta,
          body_ps:       e.body_ps,
          from_name:     e.from_name || 'Taylor at easyChef Pro',
          send_day:      e.send_day,
          trigger_event: e.trigger_event,
          funnel_stage:  e.funnel_stage,
          body_theme:    e.theme,
          role:          wf.role || '',
          status:        'draft'
        });
      }

      if (writeB) {
        setEmailSequence({
          id:            campaignId + '-' + e.seq_id + '-B',
          campaign_id:   campaignId,
          sequence_code: e.sequence_code,
          email_number:  e.email_number,
          subject_line:  e.subject_line_b,
          preview_text:  e.preview_text_a,
          body_hook:     e.body_hook,
          body_problem:  e.body_problem,
          body_agitate:  e.body_agitate,
          body_solve:    e.body_solve,
          body_value:    e.body_value,
          body_proof:    e.body_proof,
          body_cta:      e.body_cta,
          body_ps:       e.body_ps,
          from_name:     e.from_name || 'Taylor at easyChef Pro',
          send_day:      e.send_day,
          trigger_event: e.trigger_event,
          funnel_stage:  e.funnel_stage,
          body_theme:    e.theme,
          role:          wf.role || '',
          status:        'draft'
        });
      }
    }

    return { ok: true, emails: emails, seq_mode: seqMode, variant_mode: varMode };

  } catch (e) {
    return { ok: false, error: e.message };
  }
}


// ── buildSocialCalendar ───────────────────────────────────────────────────────

/**
 * Generates a synchronized social post calendar that runs parallel to the
 * email sequence. Each post is thematically aligned with the nearest email
 * and scheduled 1 day before it to prime the inbox open.
 */
function buildSocialCalendar(brief, copy) {
  try {
    var props  = PropertiesService.getScriptProperties();
    var apiKey = props.getProperty('ANTHROPIC_API_KEY');
    if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set in Script Properties' };

    var postCount  = parseInt(brief.post_count) || 5;
    var frequency  = brief.post_frequency       || '3x_week';
    var seqMode    = _sbNormalizeSeqMode(brief.email_sequence_mode || brief.email_sequences);
    var activeSeqs = _SB_SEQ_MAP[seqMode]       || _SB_SEQ_MAP['seq1_seq2'];
    var lpUrl      = _buildLpUrl(brief.slug || 'waitlist');
    var campaignId = brief.id || '';

    // All selected channels — fall back to brief.channel if channels array absent
    var channels = (Array.isArray(brief.channels) && brief.channels.length)
      ? brief.channels
      : [brief.channel || 'Facebook'];

    var seqOffsets    = _sbGetSeqOffsets();
    var activeWF      = _sbGetWireframe().filter(function(e) { return activeSeqs.indexOf(e.seq) !== -1; });
    var themeSchedule = _sbBuildSocialSchedule(activeWF, postCount, seqOffsets);

    var icpCtx    = _getIcpContext(brief.icp || '');
    var claimsCtx = _getClaimsContext();

    var scheduleDesc = themeSchedule.map(function(t, i) {
      return 'Post ' + (i + 1) +
        ' | Campaign day ' + t.day +
        ' | Theme: ' + t.theme +
        ' | Aligns with email: ' + t.role;
    }).join('\n');

    var allPosts  = [];

    // Separate special-asset channels (TikTok spotlight, YouTube explainer)
    // from regular social channels that get the 7-post AI arc.
    var arcChannels   = [];
    var videoChannels = [];
    channels.forEach(function(ch) {
      var cl = ch.toLowerCase();
      if (cl === 'tiktok' || cl === 'youtube') videoChannels.push(ch);
      else if (cl !== 'email')                 arcChannels.push(ch);
    });

    // Video script entries — TikTok (4 spotlights) and YouTube (1 explainer)
    var _tkFeatures = _getTikTokFeatureList(brief);
    var _tkDays     = [3, 10, 17, 24, 31]; // five spotlights across the 35-day arc
    videoChannels.forEach(function(channel) {
      var chLow = channel.toLowerCase();
      if (chLow === 'tiktok') {
        _tkFeatures.forEach(function(ft, fi) {
          var day    = _tkDays[fi] || (3 + fi * 7);
          var postId = campaignId + '-tiktok-POST-' + String(fi + 1).padStart(3, '0');
          var script = _buildTikTokScriptTemplate(ft.code, ft.label, brief);
          var _sched = _sbOffsetDate(brief, day);
          var p = { id:postId, campaign_id:campaignId, platform:'TikTok',
                    post_num:fi + 1, scheduled_day:day, scheduled_date:_sched,
                    theme:'solve', funnel_stage:'solve',
                    feature: ft.code, feature_label: ft.label,
                    hook: ft.code + ' — ' + ft.label,
                    body_copy: script, script: script,
                    cta:'Link in bio', hashtags:'' };
          setSocialPost({ id:postId, campaign_id:campaignId, platform:'TikTok',
            hook:p.hook, body_copy:script, cta:p.cta,
            hashtags:'', scheduled_date:_sched, status:'draft' });
          allPosts.push(p);
        });
        Logger.log('[buildSocialCalendar] TikTok: 4 feature spotlights seeded (Days 3/10/17/24)');
      } else if (chLow === 'youtube') {
        var ytScript = _buildYouTubeScriptTemplate(brief);
        var ytSched  = _sbOffsetDate(brief, 6);
        var ytId     = campaignId + '-youtube-POST-001';
        var ytPost   = { id:ytId, campaign_id:campaignId, platform:'YouTube',
                         post_num:1, scheduled_day:6, scheduled_date:ytSched,
                         theme:'cta', funnel_stage:'cta',
                         hook:'easyChef Pro — 60-second explainer',
                         body_copy:ytScript, script:ytScript,
                         cta:'Join the waitlist — link in description', hashtags:'' };
        setSocialPost({ id:ytId, campaign_id:campaignId, platform:'YouTube',
          hook:ytPost.hook, body_copy:ytScript, cta:ytPost.cta,
          hashtags:'', scheduled_date:ytSched, status:'draft' });
        allPosts.push(ytPost);
        Logger.log('[buildSocialCalendar] YouTube: explainer script seeded (Day 6)');
      }
    });

    // One Claude call per post per channel — deeply contextualized per funnel stage
    var _arcThemes   = ['hook', 'problem', 'agitate', 'solve', 'value', 'proof', 'cta'];
    var _charLimits  = { facebook: 400, instagram: 2200, x: 280, pinterest: 500, nextdoor: 300 };
    var _foodType    = (brief.themeData && brief.themeData.food_type) || brief.theme_food || brief.food_type || '';

    for (var ci = 0; ci < arcChannels.length; ci++) {
      var channel  = arcChannels[ci];
      var chSlug   = channel.toLowerCase().replace(/[^a-z0-9]/g, '');
      var charLimit = _charLimits[channel.toLowerCase()] || 400;
      var channelRules = _getChannelRules(channel);
      var platformNote = _getPlatformNote(channel);

      for (var pi = 0; pi < postCount; pi++) {
        var sched  = themeSchedule[pi] || {};
        var stage  = sched.theme || _arcThemes[Math.min(pi, _arcThemes.length - 1)] || 'hook';
        var postId = campaignId + '-' + chSlug + '-POST-' + String(pi + 1).padStart(3, '0');

        // Build stage-specific story context
        var postCtx         = _buildBriefStoryCtx(brief);
        postCtx.platform    = channel;
        postCtx.stage       = stage;
        postCtx.post_number = pi + 1;
        postCtx.theme_id    = brief.theme_id || brief.theme || '';
        postCtx.icp_code    = brief.icp || '';

        // Theme food rule: Post 4 (SOLVE) onward must name the food by name
        var foodRule = '';
        if (pi >= 3 && _foodType) {
          foodRule =
            'FOOD RULE — CRITICAL: This is Post ' + (pi + 1) + ' (' + stage.toUpperCase() + '). ' +
            'The theme food for this campaign is "' + _foodType + '". ' +
            'You MUST mention "' + _foodType + '" by name in the hook or body. ' +
            'This grounds the copy in something specific — never write generic "dinner" or "meal".\n\n';
        }

        var systemPrompt =
          getMasterSystemPrompt('social_post_' + stage, postCtx) +
          '=== PLATFORM ===\n' +
          (channelRules || platformNote) + '\n\n' +
          '=== CAMPAIGN CONTEXT ===\n' +
          'Landing page: '   + lpUrl                            + '\n' +
          'Campaign angle: ' + (brief.campaign_angle || 'savings') + '\n' +
          'Social hook: '    + (copy && copy.social_hook || '') + '\n\n' +
          '=== THIS POST ===\n' +
          'Post ' + (pi + 1) + ' of ' + postCount + ' — Stage: ' + stage.toUpperCase() + '\n' +
          'Email alignment: ' + (sched.role || stage) + '\n' +
          'Scheduled day: '   + (sched.day !== undefined ? sched.day : pi) + '\n' +
          'Character limit: ' + charLimit + ' chars for body\n' +
          (brief.use_hashtags
            ? 'Hashtags: Include ' + (brief.hashtag_count_min || 0) + '–' + (brief.hashtag_count_max || 0) + ' hashtags at end\n'
            : 'Hashtags: None on this platform — leave hashtags field as empty string\n') +
          foodRule +
          '=== OUTPUT FORMAT ===\n' +
          'Return ONLY a valid JSON object for this single post. No markdown. No explanation.\n' +
          '{\n' +
          '  "post_num": ' + (pi + 1) + ',\n' +
          '  "scheduled_day": ' + (sched.day !== undefined ? sched.day : pi) + ',\n' +
          '  "theme": "' + stage + '",\n' +
          '  "hook": "First line — stops the scroll — under 15 words",\n' +
          '  "body_copy": "Full post body — plain text, no markdown — under ' + charLimit + ' chars",\n' +
          '  "cta": "CTA line — under 10 words",\n' +
          '  "hashtags": "hashtags or empty string"\n' +
          '}';

        try {
          var postResp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
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
              messages:   [{ role: 'user', content: 'Write Post ' + (pi + 1) + ' (' + stage.toUpperCase() + ') for ' + channel + ' — ' + (brief.icp || 'selected') + ' ICP. Return only the JSON object.' }]
            }),
            muteHttpExceptions: true
          });

          var postData  = JSON.parse(postResp.getContentText());
          var postReply = (Array.isArray(postData.content) && postData.content[0] && postData.content[0].text) || '';
          if (!postReply && postData.error) {
            Logger.log('[buildSocialCalendar] ' + channel + ' post ' + (pi + 1) + ' error: ' + JSON.stringify(postData.error));
            continue;
          }

          var postJsonStr = postReply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
          var p           = JSON.parse(postJsonStr);

          p.id          = postId;
          p.campaign_id = campaignId;
          p.platform    = channel;
          if (p.scheduled_day === undefined) p.scheduled_day = sched.day !== undefined ? sched.day : pi;
          if (!p.theme)                      p.theme         = stage;
          if (_foodType && !p.food_type)     p.food_type     = _foodType;

          var _sched = '';
          if (brief.launchDate && p.scheduled_day !== undefined) {
            try {
              var _ld = new Date(brief.launchDate + 'T12:00:00');
              _ld.setDate(_ld.getDate() + p.scheduled_day);
              _sched = Utilities.formatDate(_ld, Session.getScriptTimeZone(), 'yyyy-MM-dd');
            } catch(de) { _sched = ''; }
          }

          setSocialPost({
            id:             postId,
            campaign_id:    campaignId,
            platform:       channel,
            hook:           p.hook      || '',
            body_copy:      p.body_copy || '',
            cta:            p.cta       || '',
            hashtags:       p.hashtags  || '',
            scheduled_date: _sched,
            status:         'draft'
          });
          allPosts.push(p);
          Logger.log('[buildSocialCalendar] ' + channel + ' post ' + (pi + 1) + ' (' + stage + ') saved');

        } catch(postErr) {
          Logger.log('[buildSocialCalendar] ' + channel + ' post ' + (pi + 1) + ' fetch error: ' + postErr.message);
        }
      }
    }

    return { ok: true, posts: allPosts, frequency: frequency };

  } catch (e) {
    return { ok: false, error: e.message };
  }
}


// ── _sbBuildArc2Posts ─────────────────────────────────────────────────────────
/**
 * Builds the second 7-post urgency/scarcity arc (Days 22–28, 0-indexed 21–27)
 * for Blueprint A-Waitlist 35-day campaigns. Mirrors the 7-step framework with
 * a founding-price-closing / last-chance angle. One per arc channel per day.
 */
function _sbBuildArc2Posts(brief, arc1Posts) {
  var ARC2_SCHEDULE = [
    { offset: 21, theme: 'hook',    role: 'founding spots are running out' },
    { offset: 22, theme: 'problem', role: 'she has not joined yet' },
    { offset: 23, theme: 'agitate', role: 'July 1 is the deadline — founding price closes' },
    { offset: 24, theme: 'solve',   role: '$7.99/month locks forever — claim before July 1' },
    { offset: 25, theme: 'value',   role: 'what founding families get that no one else will' },
    { offset: 26, theme: 'proof',   role: 'families already in — founding spots filling' },
    { offset: 27, theme: 'cta',     role: 'last chance — founding price ends at 5,000 families' }
  ];

  // Derive unique arc channels from Arc 1 (exclude TikTok, YouTube, Email)
  var seen = {}, channels = [];
  (arc1Posts || []).forEach(function(p) {
    var ch = p.platform || p.channel || '';
    var cl = ch.toLowerCase();
    if (cl && cl !== 'tiktok' && cl !== 'youtube' && cl !== 'email' && !seen[cl]) {
      seen[cl] = true;
      channels.push(ch);
    }
  });

  var campaignId = brief.id || '';
  var arc2Posts  = [];

  function _arc2Date(offset) {
    if (!brief.launchDate) return '';
    try {
      var ld = new Date(brief.launchDate + 'T12:00:00');
      ld.setDate(ld.getDate() + offset);
      return Utilities.formatDate(ld, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } catch(e) { return ''; }
  }

  channels.forEach(function(channel) {
    var chSlug = channel.toLowerCase().replace(/[^a-z0-9]/g, '');
    ARC2_SCHEDULE.forEach(function(t, i) {
      var postId = campaignId + '-' + chSlug + '-ARC2-' + String(i + 1).padStart(3, '0');
      var sched  = _arc2Date(t.offset);
      var post = {
        id: postId, campaign_id: campaignId, platform: channel,
        post_num: i + 1, scheduled_day: t.offset, scheduled_date: sched,
        theme: t.theme, funnel_stage: t.theme,
        hook:       '[Arc 2 · ' + t.theme.toUpperCase() + '] ' + t.role,
        body_copy:  'Urgency arc · ' + t.role + ' · Founding price $7.99/month',
        cta:        'Claim your founding spot',
        hashtags:   ''
      };
      setSocialPost({ id:postId, campaign_id:campaignId, platform:channel,
        hook:post.hook, body_copy:post.body_copy, cta:post.cta,
        hashtags:'',
        scheduled_date:sched, status:'draft' });
      arc2Posts.push(post);
    });
  });

  // TikTok Arc 2 urgency spotlight — Day 24 (urgency angle)
  var briefChs = Array.isArray(brief.channels) ? brief.channels : [];
  if (briefChs.some(function(c){return(c||'').toLowerCase()==='tiktok';})) {
    var tkId     = campaignId + '-tiktok-ARC2-001';
    var tkDate   = _arc2Date(24);
    var tkScript = _buildTikTokScriptTemplate('TRACK', 'Founding Price Closing', brief)
      .replace('HOOK (0–3 sec): "You\'re throwing away $1,336 a year. Let\'s stop that."',
               'HOOK (0–3 sec): "Founding price $7.99/month closes July 1. This is your last chance."')
      .replace('DEMO (3–8 sec): Screen recording: receipt scan → waste score updates → $1,336/year savings counter',
               'DEMO (3–8 sec): Screen recording: founding price countdown → 5,000 family cap → spots filling');
    var tkPost = {
      id:tkId, campaign_id:campaignId, platform:'TikTok',
      post_num:2, scheduled_day:24, scheduled_date:tkDate,
      theme:'urgency', funnel_stage:'cta',
      feature:'TRACK', feature_label:'Founding Price Closing',
      hook:'Founding price closes July 1 — last chance',
      body_copy:tkScript, script:tkScript,
      cta:'Link in bio — claim your founding spot',
      hashtags:''
    };
    setSocialPost({ id:tkId, campaign_id:campaignId, platform:'TikTok',
      hook:tkPost.hook, body_copy:tkScript, cta:tkPost.cta,
      hashtags:'', scheduled_date:tkDate, status:'draft' });
    arc2Posts.push(tkPost);
  }

  Logger.log('[_sbBuildArc2Posts] ' + arc2Posts.length + ' Arc 2 urgency posts built (Days 22–28)');
  return arc2Posts;
}


// ── _sbMergeCalendar ──────────────────────────────────────────────────────────

/**
 * Merges email and social arrays into a day-indexed calendar view.
 * SEQ-3 fires at offset 21 (Jun 17); SEQ-4 at offset 35 (Jul 1).
 * Returns sorted array of { day, trigger, emails:[], posts:[] }
 */
function _sbMergeCalendar(emails, posts) {
  var days       = {};
  var seqOffsets = _sbGetSeqOffsets();

  function addDay(day, trigger) {
    if (!days[day]) days[day] = { day: day, trigger: trigger || '', emails: [], posts: [] };
  }

  emails.forEach(function(e) {
    var absDay = (e.send_day || 0) + (seqOffsets[e.sequence_code] || 0);
    addDay(absDay, e.trigger_event);
    days[absDay].emails.push(e);
  });

  posts.forEach(function(p) {
    var absDay = p.scheduled_day || 0;
    addDay(absDay, '');
    days[absDay].posts.push(p);
  });

  return Object.keys(days)
    .map(Number)
    .sort(function(a, b) { return a - b; })
    .map(function(d) { return days[d]; });
}


// ── Helpers ───────────────────────────────────────────────────────────────────

function _sbFindWireframe(seqId) {
  var m = String(seqId || '').match(/^(SEQ-\d+)-E(\d+)$/);
  if (!m) return null;
  var seq = m[1], num = parseInt(m[2], 10);
  var wf = _sbGetWireframe();
  for (var i = 0; i < wf.length; i++) {
    if (wf[i].seq === seq && wf[i].num === num) return wf[i];
  }
  return null;
}

function _sbNormalizeSeqMode(raw) {
  if (!raw) return 'seq1_seq2';
  if (_SB_SEQ_MAP[raw]) return raw;
  var n = parseInt(raw, 10);
  if (isNaN(n)) return 'seq1_seq2';
  if (n <= 1) return 'seq1_only';
  if (n <= 2) return 'seq1_seq2';
  if (n <= 3) return 'seq1_seq2_seq3';
  return 'full';
}

function _sbNormalizeVariantMode(raw) {
  if (!raw) return 'both';
  if (raw === 'variant_a' || raw === 'variant_b' || raw === 'both') return raw;
  var n = parseInt(raw, 10);
  if (isNaN(n)) return 'both';
  return n >= 2 ? 'both' : 'variant_a';
}

function _sbBuildSocialSchedule(wireframe, postCount, seqOffsets) {
  seqOffsets = seqOffsets || _sbGetSeqOffsets();
  var wfLen  = wireframe.length;
  var result = [];
  for (var i = 0; i < postCount; i++) {
    var idx    = Math.floor((i * wfLen) / postCount);
    var item   = wireframe[Math.min(idx, wfLen - 1)];
    var offset = seqOffsets[item.seq] || 0;
    var day    = Math.max(0, (item.day || 0) + offset - 1);
    result.push({ day: day, theme: item.theme, role: item.role, seq: item.seq });
  }
  return result;
}


// ── Video script helpers (TikTok / YouTube) ───────────────────────────────────

function _sbOffsetDate(brief, day) {
  var base = brief.launchDate || brief.pre_launch_date || '';
  if (!base) return '';
  try {
    var d = new Date(base + 'T12:00:00');
    d.setDate(d.getDate() + day);
    return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  } catch(e) { return ''; }
}

/**
 * Returns 5 TikTok feature objects for the 5 spotlight cards (Days 3/10/17/24/31).
 * Order is fixed: TRACK → PLAN → OPTIMIZE → COOK → SHOP
 */
function _getTikTokFeatureList(brief) {
  return [
    { code:'TRACK',    label:'Waste & Savings Tracker' },
    { code:'PLAN',     label:'Weekly Meal Planning'    },
    { code:'OPTIMIZE', label:'Nutrition Scoring'        },
    { code:'COOK',     label:'30-Minute Dinner Mode'   },
    { code:'SHOP',     label:'In-App Grocery Shop'     }
  ];
}

function _buildTikTokScriptTemplate(code, label, brief) {
  var hooks = {
    PLAN:     'What if dinner was already planned?',
    COOK:     'Dinner in 30 minutes — with what\'s in your fridge.',
    TRACK:    'You\'re throwing away $1,336 a year. Let\'s stop that.',
    OPTIMIZE: 'Every meal scored across 6 dimensions. Watch.',
    SHOP:     'Groceries ordered without leaving the app. Watch.'
  };
  var demos = {
    PLAN:     'Screen recording: tap Meal Plan → week auto-fills with 5 dinners → one tap to confirm',
    COOK:     'Screen recording: scan fridge → recipe generated → 30-minute timer starts',
    TRACK:    'Screen recording: receipt scan → waste score updates → $1,336/year savings counter',
    OPTIMIZE: 'Screen recording: nutrition score view — meal plan with scores visible across 6 dimensions',
    SHOP:     'Screen recording: tap Shop → grocery list auto-fills cart → checkout in under 60 seconds'
  };
  var ctas = {
    OPTIMIZE: 'Founding families get this free · link in bio [text overlay: easychefpro.com]'
  };
  return [
    'FEATURE: ' + code + ' — ' + label,
    'HOOK (0–3 sec): "' + (hooks[code] || 'Your kitchen just got smarter.') + '"',
    'DEMO (3–8 sec): ' + (demos[code] || 'Screen recording: easyChef Pro — fast, clean, zero friction'),
    'CTA (8–10 sec): ' + (ctas[code] || '"Link in bio — join free." [text overlay: easychefpro.com]')
  ].join('\n');
}

function _buildYouTubeScriptTemplate(brief) {
  return [
    'HOOK (0–5 sec):',
    '  "Every night at 6:30, millions of families open the fridge and see nothing. Tonight, that changes."',
    '',
    'AGITATE (5–15 sec):',
    '  "You spend $200 a week on groceries. 69.5% ends up in the trash. That\'s $1,336 a year — gone."',
    '',
    'PROBLEM (15–25 sec):',
    '  "The problem isn\'t you. It\'s that no tool connects your fridge to your week. Until now."',
    '',
    'SOLVE (25–35 sec):',
    '  "easyChef Pro sees what\'s in your fridge, knows your week, and builds the meal plan — in 30 seconds."',
    '',
    'VALUE (35–45 sec):',
    '  "Dinner in 30 minutes. One grocery list. Zero waste. Founding price: $7.99/month — locks forever."',
    '',
    'PROOF (45–55 sec):',
    '  "Built by first responders who know what time-starved really means. Your kitchen. In command."',
    '',
    'CTA (55–60 sec):',
    '  "Join the waitlist — link in the description. 5,000 founding spots. Claim yours now." [text overlay: easychefpro.com]'
  ].join('\n');
}


// ── Diagnostic ────────────────────────────────────────────────────────────────
// Apps Script editor → select _testSequenceBuilder → Run → View Execution log

function _testSequenceBuilder() {
  var brief = {
    id:              'EC-TEST-001',
    name:            'SequenceBuilder smoke test',
    icp:             'super_mom',
    channel:         'Email',
    goal:            'waitlist_signup_completed',
    slug:            'lp/super-mom-email-001',
    email_sequences: 'seq1_only',
    email_variants:  'variant_a'
  };
  var copy = {
    headline:    'Stop wasting $1,336 a year on food you never eat',
    subheadline: 'easyChef Pro turns what\'s in your fridge into dinner — in 30 minutes.',
    cta_primary: 'Join the waitlist',
    proof_bar:   ['Save $1,336/year','69.5% less food waste','30 minutes fridge to table']
  };

  Logger.log('=== SEQ MODE: '     + _sbNormalizeSeqMode(brief.email_sequence_mode || brief.email_sequences));
  Logger.log('=== VARIANT MODE: ' + _sbNormalizeVariantMode(brief.email_variants));
  Logger.log('=== WIREFRAME (SEQ-1 only — 3 emails):');
  _sbGetWireframe().filter(function(e) { return e.seq === 'SEQ-1'; }).forEach(function(e) {
    Logger.log('  ' + e.seq + '-E' + e.num + ' | Day ' + e.day + ' | ' + e.theme);
  });

  // Test Sheet access
  try {
    var profiles = getIcpProfiles();
    Logger.log('ICP profiles loaded: ' + profiles.length);
    var claims = getApprovedClaims();
    Logger.log('Approved claims loaded: ' + claims.length);
    var channels = getChannels();
    Logger.log('Channels loaded: ' + channels.length);
  } catch(e) {
    Logger.log('Sheet access error: ' + e.message);
  }

  Logger.log('=== Calling buildEmailCalendar (seq1_only / variant_a — no Sheet writes)...');
  var result = buildEmailCalendar(brief, copy);
  Logger.log('ok: ' + result.ok);
  if (result.ok) {
    Logger.log('emails returned: ' + result.emails.length);
    Logger.log('first seq_id: '   + (result.emails[0] && result.emails[0].seq_id));
    Logger.log('first subject A: '+ (result.emails[0] && result.emails[0].subject_line_a));
  } else {
    Logger.log('error: ' + result.error);
  }
}