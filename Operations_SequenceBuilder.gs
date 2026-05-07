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
  'full':           ['SEQ-1','SEQ-2','SEQ-3','SEQ-4']
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
      role: role('hook',    'Hook — You are in — deliver the promise, make them glad they joined'),
      trigger:'waitlist_signup', theme:'welcome',     stage:'hook'     },
    { seq:'SEQ-1', num:2, global:2,  day:2,
      role: role('problem', 'Problem deepener — name the exact 6:30 PM pain, agitate before solving'),
      trigger:'waitlist_signup', theme:'problem',     stage:'problem'  },
    { seq:'SEQ-1', num:3, global:3,  day:5,
      role: role('solve',   'Social proof + founding price — one story, one stat, founding urgency'),
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
      trigger:'july_1_launch',   theme:'launch',        stage:'hook'  }
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
  _sbSeqOffsetsCache = { 'SEQ-1': 0, 'SEQ-2': 0, 'SEQ-3': ctaOffset, 'SEQ-4': ctaOffset + 14 };
  return _sbSeqOffsetsCache;
}


// ── buildFullSequence ─────────────────────────────────────────────────────────

/**
 * Master entry point. Builds the email calendar and social calendar in sequence,
 * writes all rows to Sheets, and returns the merged day-by-day view.
 * Returns { ok:true, emails:[...], posts:[...], calendar:[...] }
 */
function buildFullSequence(brief, copy) {
  try {
    if (!brief) return { ok: false, error: 'brief is required' };

    var emailResult  = buildEmailCalendar(brief, copy);
    if (!emailResult.ok) return { ok: false, error: 'Email calendar failed: ' + emailResult.error };

    var socialResult = buildSocialCalendar(brief, copy);
    if (!socialResult.ok) return { ok: false, error: 'Social calendar failed: ' + socialResult.error };

    var calendar = _sbMergeCalendar(emailResult.emails || [], socialResult.posts || []);

    return {
      ok:       true,
      emails:   emailResult.emails  || [],
      posts:    socialResult.posts  || [],
      calendar: calendar
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
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

    var seqMode = _sbNormalizeSeqMode(brief.email_sequences);
    var varMode = _sbNormalizeVariantMode(brief.email_variants);

    var activeSeqs = _SB_SEQ_MAP[seqMode] || _SB_SEQ_MAP['seq1_seq2'];
    var wireframe  = _sbGetWireframe().filter(function(e) {
      return activeSeqs.indexOf(e.seq) !== -1;
    });

    var icpCtx    = _getIcpContext(brief.icp || '');
    var claimsCtx = _getClaimsContext();
    var lpUrl     = 'https://easychefpro.com/' + (brief.slug || 'lp/waitlist');

    var wireframeDesc = wireframe.map(function(e) {
      return e.seq + '-E' + e.num +
        ' | Global #' + e.global +
        ' | Day ' + e.day + ' after "' + e.trigger + '"' +
        ' | Stage: ' + e.stage +
        ' | Theme: ' + e.theme +
        ' | Role: ' + e.role;
    }).join('\n');

    var variantInstr = '';
    if (varMode === 'variant_a') {
      variantInstr =
        'VARIANTS: Generate Variant A only (money angle — $1,336/year savings, loss aversion, financial framing).\n' +
        'Leave subject_line_b and preview_text_b as empty strings.';
    } else if (varMode === 'variant_b') {
      variantInstr =
        'VARIANTS: Generate Variant B only (simplicity angle — 6:30 PM fridge panic, emotional relief, time framing).\n' +
        'Leave subject_line_a and preview_text_a as empty strings.';
    } else {
      variantInstr =
        'VARIANTS: Generate both A and B for every email.\n' +
        'Variant A = Money angle: $1,336/year savings, loss aversion framing, financial specificity.\n' +
        'Variant B = Simplicity angle: 6:30 PM fridge panic, emotional relief, time-saving framing.\n' +
        'Same body structure for both — only subject_line and preview_text differ.';
    }

    var systemPrompt =
      'You are the easyChef Pro email sequence architect. Generate a complete email sequence as a JSON array.\n\n' +
      _AB_ARCH +
      _AB_VOICE +
      '=== APPROVED CLAIMS ===\n' + claimsCtx +
      '=== TARGET ICP ===\n' + icpCtx + '\n' +
      '=== CAMPAIGN ===\n' +
      'Name: '                  + (brief.name || '')                      + '\n' +
      'Landing page: '          + lpUrl                                    + '\n' +
      'Kickstart headline: '    + (copy && copy.headline    || '')         + '\n' +
      'Kickstart subheadline: ' + (copy && copy.subheadline || '')         + '\n' +
      'Kickstart CTA: '         + (copy && copy.cta_primary || '')         + '\n' +
      'Proof bar: '             + (copy && Array.isArray(copy.proof_bar)
        ? copy.proof_bar.join(' · ')
        : (copy && copy.proof_bar || ''))                                   + '\n\n' +
      '=== ' + variantInstr + ' ===\n\n' +
      '=== 7-STEP FRAMEWORK ===\n' +
      'Hook → Problem → Agitate → Solve → Value → Proof → CTA\n' +
      'Every email focuses on its assigned stage. Do not try to hit all 7 in every email.\n\n' +
      '=== EMAIL WIREFRAME — ' + wireframe.length + ' EMAILS ===\n' +
      wireframeDesc + '\n\n' +
      '=== OUTPUT FORMAT ===\n' +
      'Return ONLY a valid JSON array. No markdown. No explanation before or after.\n' +
      '[\n' +
      '  {\n' +
      '    "seq_id": "SEQ-1-E1",\n' +
      '    "sequence_code": "SEQ-1",\n' +
      '    "email_number": 1,\n' +
      '    "global_number": 1,\n' +
      '    "subject_line_a": "Under 50 chars — money angle — no emoji",\n' +
      '    "subject_line_b": "Under 50 chars — simplicity angle — no emoji",\n' +
      '    "preview_text_a": "Under 90 chars — extends subject A",\n' +
      '    "preview_text_b": "Under 90 chars — extends subject B",\n' +
      '    "body_hook": "First 1-2 sentences — stops the read, specific to ICP pain",\n' +
      '    "body_problem": "1-2 sentences naming the exact pain",\n' +
      '    "body_agitate": "1-2 sentences deepening the pain",\n' +
      '    "body_solve": "1 sentence — easyChef Pro as the answer",\n' +
      '    "body_value": "1-2 sentences — specific value, approved claims only",\n' +
      '    "body_proof": "1 sentence — approved stat or social proof",\n' +
      '    "body_cta": "CTA line with full URL — outcome-framed, under 10 words",\n' +
      '    "send_day": 0,\n' +
      '    "trigger_event": "waitlist_signup",\n' +
      '    "theme": "welcome",\n' +
      '    "funnel_stage": "hook",\n' +
      '    "status": "draft"\n' +
      '  }\n' +
      ']';

    var maxTokens = Math.min(8000, Math.max(2000, wireframe.length * 700));

    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type':      'application/json'
      },
      payload: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: 'Generate the ' + wireframe.length + '-email sequence for the ' + (brief.icp || 'target') + ' ICP. Return only the JSON array.' }]
      }),
      muteHttpExceptions: true
    });

    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply && data.error) {
      return { ok: false, error: typeof data.error === 'object' ? data.error.message : String(data.error) };
    }

    var jsonStr    = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
    var emails     = JSON.parse(jsonStr);
    var campaignId = brief.id || '';

    emails.forEach(function(e) {
      var wf = _sbFindWireframe(e.seq_id);
      if (wf) {
        if (e.send_day      === undefined) e.send_day      = wf.day;
        if (!e.trigger_event)              e.trigger_event = wf.trigger;
        if (!e.theme)                      e.theme         = wf.theme;
        if (!e.funnel_stage)               e.funnel_stage  = wf.stage;
        if (!e.global_number)              e.global_number = wf.global;
        if (!e.sequence_code)              e.sequence_code = wf.seq;
        if (!e.email_number)               e.email_number  = wf.num;
      }
      e.campaign_id = campaignId;
      e.status      = e.status || 'draft';

      var writeA = varMode === 'both' || varMode === 'variant_a';
      var writeB = varMode === 'both' || varMode === 'variant_b';

      if (writeA) {
        setEmailSequence({
          id:            campaignId + '-' + e.seq_id + '-A',
          campaign_id:   campaignId,
          sequence_code: e.sequence_code,
          email_number:  e.email_number,
          subject_line:  e.subject_line_a || '',
          preview_text:  e.preview_text_a || '',
          body_hook:     e.body_hook      || '',
          body_problem:  e.body_problem   || '',
          body_agitate:  e.body_agitate   || '',
          body_solve:    e.body_solve     || '',
          body_value:    e.body_value     || '',
          body_proof:    e.body_proof     || '',
          body_cta:      e.body_cta       || '',
          send_day:      e.send_day,
          trigger_event: e.trigger_event  || '',
          funnel_stage:  e.funnel_stage   || '',
          body_theme:    e.theme          || '',
          role:          wf ? (wf.role    || '') : '',
          status:        'draft'
        });
      }

      if (writeB) {
        setEmailSequence({
          id:            campaignId + '-' + e.seq_id + '-B',
          campaign_id:   campaignId,
          sequence_code: e.sequence_code,
          email_number:  e.email_number,
          subject_line:  e.subject_line_b || '',
          preview_text:  e.preview_text_b || '',
          body_hook:     e.body_hook      || '',
          body_problem:  e.body_problem   || '',
          body_agitate:  e.body_agitate   || '',
          body_solve:    e.body_solve     || '',
          body_value:    e.body_value     || '',
          body_proof:    e.body_proof     || '',
          body_cta:      e.body_cta       || '',
          send_day:      e.send_day,
          trigger_event: e.trigger_event  || '',
          funnel_stage:  e.funnel_stage   || '',
          body_theme:    e.theme          || '',
          role:          wf ? (wf.role    || '') : '',
          status:        'draft'
        });
      }
    });

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

    var postCount     = parseInt(brief.post_count)  || 5;
    var frequency     = brief.post_frequency        || '3x_week';
    var seqMode       = _sbNormalizeSeqMode(brief.email_sequences);
    var activeSeqs    = _SB_SEQ_MAP[seqMode]        || _SB_SEQ_MAP['seq1_seq2'];
    var channel       = brief.channel               || 'Facebook';
    var lpUrl         = 'https://easychefpro.com/'  + (brief.slug || 'lp/waitlist');
    var seqOffsets    = _sbGetSeqOffsets();
    var activeWF      = _sbGetWireframe().filter(function(e) { return activeSeqs.indexOf(e.seq) !== -1; });
    var themeSchedule = _sbBuildSocialSchedule(activeWF, postCount, seqOffsets);

    var icpCtx       = _getIcpContext(brief.icp || '');
    var claimsCtx    = _getClaimsContext();
    var platformNote = _getPlatformNote(channel);

    var scheduleDesc = themeSchedule.map(function(t, i) {
      return 'Post ' + (i + 1) +
        ' | Campaign day ' + t.day +
        ' | Theme: ' + t.theme +
        ' | Aligns with email: ' + t.role;
    }).join('\n');

    var systemPrompt =
      'You are the easyChef Pro social media writer building a synchronized content calendar.\n' +
      'These posts run in parallel with the email sequence — each post primes the audience for the email that follows.\n\n' +
      _AB_ARCH +
      _AB_VOICE +
      '=== APPROVED CLAIMS ===\n' + claimsCtx +
      '=== PLATFORM ===\n' + platformNote + '\n\n' +
      '=== TARGET ICP ===\n' + icpCtx + '\n' +
      '=== CAMPAIGN ===\n' +
      'Name: '        + (brief.name || '')                 + '\n' +
      'Landing page: '+ lpUrl                               + '\n' +
      'Headline: '    + (copy && copy.headline    || '')    + '\n' +
      'Social hook: ' + (copy && copy.social_hook || '')    + '\n' +
      'CTA: '         + (copy && copy.cta_primary || '')    + '\n\n' +
      '=== POSTING FREQUENCY ===\n' +
      'Frequency: ' + frequency + '\n' +
      'Total posts: ' + postCount + '\n\n' +
      '=== CONTENT SCHEDULE — ' + postCount + ' POSTS ===\n' +
      'Each post is 1 day ahead of the aligned email to prime the inbox open.\n' +
      scheduleDesc + '\n\n' +
      '=== PLATFORM REQUIREMENTS ===\n' +
      'Optimal character count: ' + (brief.platform_optimal_chars || '150-300') + '\n' +
      'Hashtags: ' + (brief.use_hashtags
        ? 'Include ' + (brief.hashtag_count_min || 0) + '-' + (brief.hashtag_count_max || 0) + ' hashtags'
        : 'No hashtags on this platform — leave hashtags as empty string') + '\n' +
      'Content format: ' + (brief.content_format || 'post') + '\n' +
      'Link placement: ' + (brief.link_placement || 'in post body') + '\n\n' +
      '=== OUTPUT FORMAT ===\n' +
      'Return ONLY a valid JSON array. No markdown. No explanation.\n' +
      '[\n' +
      '  {\n' +
      '    "post_num": 1,\n' +
      '    "scheduled_day": 0,\n' +
      '    "theme": "welcome",\n' +
      '    "hook": "Scroll-stopper first line — under 15 words",\n' +
      '    "body_copy": "Full post body — plain text, no markdown, no asterisks",\n' +
      '    "cta": "CTA line — under 10 words",\n' +
      '    "hashtags": "hashtags or empty string",\n' +
      '    "image_brief": "One sentence describing the ideal image or video for this post"\n' +
      '  }\n' +
      ']';

    var maxTokens = Math.min(8000, Math.max(2000, postCount * 600));

    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type':      'application/json'
      },
      payload: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: 'Generate the ' + postCount + '-post social calendar for ' + channel + '. Return only the JSON array.' }]
      }),
      muteHttpExceptions: true
    });

    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply && data.error) {
      return { ok: false, error: typeof data.error === 'object' ? data.error.message : String(data.error) };
    }

    var jsonStr    = reply.trim().replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
    var posts      = JSON.parse(jsonStr);
    var campaignId = brief.id || '';

    posts.forEach(function(p, i) {
      var sched  = themeSchedule[i] || {};
      var postId = campaignId + '-POST-' + String(i + 1).padStart(3, '0');

      p.id          = postId;
      p.campaign_id = campaignId;
      p.platform    = channel;
      if (p.scheduled_day === undefined) p.scheduled_day = sched.day   || 0;
      if (!p.theme)                      p.theme         = sched.theme || '';

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
        hook:           p.hook        || '',
        body_copy:      p.body_copy   || '',
        cta:            p.cta         || '',
        hashtags:       p.hashtags    || '',
        image_brief:    p.image_brief || '',
        scheduled_date: _sched,
        status:         'draft'
      });
    });

    return { ok: true, posts: posts, frequency: frequency };

  } catch (e) {
    return { ok: false, error: e.message };
  }
}


// ── _sbMergeCalendar ──────────────────────────────────────────────────────────

/**
 * Merges email and social arrays into a day-indexed calendar view.
 * SEQ-3 send_days offset +28 days; SEQ-4 +42 days (≈ June 17 and July 1).
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

  Logger.log('=== SEQ MODE: '     + _sbNormalizeSeqMode(brief.email_sequences));
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