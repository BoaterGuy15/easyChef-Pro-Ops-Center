// ─────────────────────────────────────────────────────────────────────────────
// Operations_DriveExport.gs
//
// Creates a Google Drive folder workspace for an approved campaign.
// Five files per campaign:
//   00 — Campaign Brief     (HTML file, browser-renderable)
//   01 — Social Posts       (HTML file, browser-renderable)
//   02 — Email Sequences    (HTML file, browser-renderable)
//   03 — LP Reference       (HTML file, browser-renderable)
//   04 — Campaign Calendar  (Google Sheet — same columns as CSV export)
//
// Called via action='export_to_drive' in doPost.
// ─────────────────────────────────────────────────────────────────────────────

var _CAMPAIGNS_ROOT_NAME = 'easyChef Pro Campaigns';
var _CAMPAIGNS_ROOT_ID   = '1OUu2k1Iv-6nk1APO3sF3qm217YV3sGJf';

// Shared helpers ──────────────────────────────────────────────────────────────

// Always returns https://easychefpro.com/lp/{slug} regardless of whether slug
// already has the lp/ prefix or not. Call this everywhere a full LP URL is needed.
function _buildLpUrl(slug) {
  var clean = String(slug || 'waitlist-a').replace(/^lp\//, '');
  return 'https://easychefpro.com/lp/' + clean;
}

// Formats any date value (JS Date, Excel serial, ISO string) as "MMM d, yyyy".
// Returns '' for null/undefined/unparseable values.
function _fmtDateDisplay(val) {
  if (val === null || val === undefined || val === '') return '';
  var d;
  if (val instanceof Date) {
    d = val;
  } else if (typeof val === 'number') {
    d = new Date((val - 25569) * 86400 * 1000); // Excel serial → JS Date
  } else {
    d = new Date(String(val));
  }
  if (isNaN(d.getTime())) return String(val);
  try { return Utilities.formatDate(d, Session.getScriptTimeZone(), 'MMM d, yyyy'); } catch(e) { return String(val); }
}

var _BRAND_RED   = '#FF0000';
var _BRAND_WHITE = '#FFFFFF';
var _BRAND_BEIGE = '#F6EFE8';
var _BRAND_DARK  = '#000000';
var _BRAND_GREY  = '#666666';
var _BRAND_BODY  = '#333333';

/**
 * Main export entry point. Builds folder + 5 files, registers in Docs tab,
 * saves drive_url back to CampaignBriefs sheet.
 * Returns { ok, folder_url, doc_urls }
 */
function exportCampaignToDrive(brief, copy, posts, lp, emails) {
  try {
    copy   = copy   || {};
    posts  = Array.isArray(posts)  ? posts  : [];
    emails = Array.isArray(emails) ? emails : [];
    lp     = lp || {};

    // ── 1. Build folder path ────────────────────────────────────────────────
    var now      = new Date();
    var year     = String(now.getFullYear());
    var months   = ['January','February','March','April','May','June','July',
                    'August','September','October','November','December'];
    var monthStr = months[now.getMonth()] + ' ' + year;

    Logger.log('[DriveExport] Step 1: folder path');
    var campsRoot   = DriveApp.getFolderById(_CAMPAIGNS_ROOT_ID);
    var yearFolder  = getOrCreateFolder(campsRoot, year);
    var monthFolder = getOrCreateFolder(yearFolder, monthStr);

    var safeName   = _deSafe(brief.name || brief.id || 'Campaign', 60);
    var folderName = (brief.id || 'EC') + ' — ' + safeName;
    var folder     = getOrCreateFolder(monthFolder, folderName);
    try { folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) {}
    Logger.log('[DriveExport] folder ready: ' + folder.getId());

    var folderId  = folder.getId();
    var folderUrl = folder.getUrl();
    var docUrls   = { folder: folderUrl };

    var _genDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM d, yyyy');

    // ── 1b. Generate design briefs via Claude (one batch call per asset type) ──
    Logger.log('[DriveExport] Step 1b: generating design briefs');
    var _apiKey = '';
    try { _apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || ''; } catch(ke) {}
    var _briefs = { postBriefs: {}, emailBriefs: {}, lpBrief: {} };
    if (_apiKey && (posts.length > 0 || emails.length > 0)) {
      try { _briefs = _generateDesignBriefs(brief, posts, emails, lp, _apiKey); }
      catch(be) { Logger.log('[DriveExport] design briefs error (non-fatal): ' + be.message); }
    }
    Logger.log('[DriveExport] design briefs: ' + Object.keys(_briefs.postBriefs).length + ' posts · ' +
      Object.keys(_briefs.emailBriefs).length + ' emails · LP: ' + (!!_briefs.lpBrief.hero_visual));

    // ── 2. 00 — Campaign Brief (HTML file) ─────────────────────────────────────
    Logger.log('[DriveExport] Section 2: Campaign Brief HTML');
    try {
      var _regDls = [];
      try {
        _regDls = getDlRegistry(brief.id || '').filter(function(r) {
          return (r.status || '').toUpperCase() === 'ACTIVE';
        });
      } catch(re) {}
      var briefHtml = _buildBriefHtml(brief, copy, _regDls, _genDate);
      var briefFile = DriveApp.createFile('00 — Campaign Brief.html', briefHtml, MimeType.HTML);
      briefFile.moveTo(folder);
      try { briefFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) {}
      docUrls.brief = briefFile.getUrl();
      Logger.log('[DriveExport] brief html: ' + briefFile.getId());
    } catch(e) { Logger.log('[DriveExport] brief html error: ' + e.message); }

    // ── 3. 01 — Social Posts (HTML file) ────────────────────────────────────
    Logger.log('[DriveExport] Section 3: Social Posts HTML (' + posts.length + ')');
    try {
      if (posts.length > 0) {
        var postsHtml = _buildSocialPostsHtml(brief, posts, _genDate, _briefs.postBriefs);
        var postsFile = DriveApp.createFile('01 — Social Posts.html', postsHtml, MimeType.HTML);
        postsFile.moveTo(folder);
        try { postsFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) {}
        docUrls.posts = postsFile.getUrl();
        Logger.log('[DriveExport] posts html: ' + postsFile.getId());
      }
    } catch(e) { Logger.log('[DriveExport] posts html error: ' + e.message); }

    // ── 4. 02 — Email Sequences (HTML file) ─────────────────────────────────
    Logger.log('[DriveExport] Section 4: Email Sequences HTML (' + emails.length + ')');
    try {
      if (emails.length > 0) {
        var emailsHtml = _buildEmailSeqsHtml(brief, emails, _genDate, _briefs.emailBriefs);
        var emailsFile = DriveApp.createFile('02 — Email Sequences.html', emailsHtml, MimeType.HTML);
        emailsFile.moveTo(folder);
        try { emailsFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) {}
        docUrls.emails = emailsFile.getUrl();
        Logger.log('[DriveExport] emails html: ' + emailsFile.getId());
      }
    } catch(e) { Logger.log('[DriveExport] emails html error: ' + e.message); }

    // ── 5. 03 — LP Reference (HTML file) ────────────────────────────────────
    Logger.log('[DriveExport] Section 5: LP Reference HTML');
    try {
      if (brief.ab_test && brief.lp_slug_a && brief.lp_slug_b) {
        // A/B test — generate 03a (Variant A) and 03b (Variant B)
        var _lpA = getLPInventoryBySlug(brief.lp_slug_a) || { slug: brief.lp_slug_a };
        var _lpB = getLPInventoryBySlug(brief.lp_slug_b) || { slug: brief.lp_slug_b };
        // Read A/B DL entries from registry
        var _abDls = getDlRegistry(brief.id || '');
        var _dlA   = null; var _dlB = null;
        _abDls.forEach(function(u) {
          if (/DL-LP.*-A$/i.test(u.dl_id || '')) _dlA = u;
          if (/DL-LP.*-B$/i.test(u.dl_id || '')) _dlB = u;
        });
        var _abBriefA = { ab_variant: 'A', ab_experiment_id: brief.ab_experiment_id || '10019672',
          ab_split: brief.ab_split || '50/50', ab_tool: brief.ab_tool || 'Convert.com',
          dl_id: _dlA ? _dlA.dl_id : '', utm_url: _dlA ? _dlA.full_url || _buildLpUrl(brief.lp_slug_a) : _buildLpUrl(brief.lp_slug_a) };
        var _abBriefB = { ab_variant: 'B', ab_experiment_id: brief.ab_experiment_id || '10019672',
          ab_split: brief.ab_split || '50/50', ab_tool: brief.ab_tool || 'Convert.com',
          dl_id: _dlB ? _dlB.dl_id : '', utm_url: _dlB ? _dlB.full_url || _buildLpUrl(brief.lp_slug_b) : _buildLpUrl(brief.lp_slug_b) };
        var lpRefHtmlA = _buildLpReferenceHtml(brief, copy, _lpA, posts, emails, _genDate, _abBriefA);
        var lpRefHtmlB = _buildLpReferenceHtml(brief, copy, _lpB, posts, emails, _genDate, _abBriefB);
        var lpRefFileA = DriveApp.createFile('03a — LP Reference Variant A.html', lpRefHtmlA, MimeType.HTML);
        var lpRefFileB = DriveApp.createFile('03b — LP Reference Variant B.html', lpRefHtmlB, MimeType.HTML);
        lpRefFileA.moveTo(folder); lpRefFileB.moveTo(folder);
        try { lpRefFileA.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) {}
        try { lpRefFileB.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) {}
        docUrls.lp = lpRefFileA.getUrl();
        docUrls.lp_b = lpRefFileB.getUrl();
        Logger.log('[DriveExport] A/B LP reference html: A=' + lpRefFileA.getId() + ' B=' + lpRefFileB.getId());
      } else {
        var lpRefHtml = _buildLpReferenceHtml(brief, copy, lp, posts, emails, _genDate, _briefs.lpBrief);
        var lpRefFile = DriveApp.createFile('03 — LP Reference.html', lpRefHtml, MimeType.HTML);
        lpRefFile.moveTo(folder);
        try { lpRefFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) {}
        docUrls.lp = lpRefFile.getUrl();
        Logger.log('[DriveExport] lp reference html: ' + lpRefFile.getId());
      }
    } catch(e) { Logger.log('[DriveExport] lp reference html error: ' + e.message); }

    // ── 6. 04 — Campaign Calendar (branded spreadsheet) ────────────────────
    try {
      Logger.log('[DriveExport] Section 6: Campaign Calendar spreadsheet');
      var calSS   = SpreadsheetApp.create('04 — Campaign Calendar — ' + safeName);
      var calFile = DriveApp.getFileById(calSS.getId());
      calFile.moveTo(folder);
      try { calFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) {}
      var calSh = calSS.getActiveSheet();
      calSh.setName('Calendar');
      calSh.setTabColor(_BRAND_RED);

      Logger.log('[CalendarXlsx] start — posts: ' + posts.length + ' emails: ' + emails.length);

      // 18 columns: Day · Date · Week · FunnelStage · Type · Platform · Subject · Preview · CTA · UTM · DL · Variant · Test · DesignBrief · Hashtags · Status · Owner · SendTime
      var _CAL_HDR = ['Day','Date','Week','Funnel Stage','Type','Platform','Subject / Hook','Preview / Body','CTA Text','UTM URL','DL ID','Variant','Test','Design Brief — Figma','Hashtags','Status','Owner','Send Time'];
      var numCols  = _CAL_HDR.length; // 18

      // ── Write title / meta / headers FIRST so they always appear ─────────
      // Row 1: Campaign title (merged, red)
      var titleRange = calSh.getRange(1, 1, 1, numCols);
      titleRange.merge();
      calSh.getRange(1, 1).setValue('easyChef Pro  ·  ' + (brief.name || safeName) + '  ·  ' + (brief.id || '') + '  ·  Launch ' + (brief.launchDate || ''));
      titleRange.setBackground(_BRAND_RED);
      titleRange.setFontColor(_BRAND_WHITE);
      titleRange.setFontFamily('Arial');
      titleRange.setFontSize(12);
      titleRange.setFontWeight('bold');
      titleRange.setVerticalAlignment('middle');
      calSh.setRowHeight(1, 36);

      // Row 2: Meta (placeholder — item count patched after data is built)
      var metaRange = calSh.getRange(2, 1, 1, numCols);
      metaRange.merge();
      var _metaCell = calSh.getRange(2, 1);
      _metaCell.setValue('ICP: ' + (brief.icp || '') + '   ·   Theme: ' + (brief.theme || '') + '   ·   ' + (brief.channels ? brief.channels.join(', ') : '') + '   ·   Generated ' + _genDate);
      metaRange.setBackground(_BRAND_BEIGE);
      metaRange.setFontColor(_BRAND_GREY);
      metaRange.setFontFamily('Arial');
      metaRange.setFontSize(9);
      metaRange.setFontStyle('italic');
      metaRange.setVerticalAlignment('middle');
      calSh.setRowHeight(2, 22);

      // Row 3: Column headers (red)
      var hdrRange = calSh.getRange(3, 1, 1, numCols);
      hdrRange.setValues([_CAL_HDR]);
      hdrRange.setBackground(_BRAND_RED);
      hdrRange.setFontColor(_BRAND_WHITE);
      hdrRange.setFontWeight('bold');
      hdrRange.setFontFamily('Arial');
      hdrRange.setFontSize(10);
      hdrRange.setVerticalAlignment('middle');
      calSh.setRowHeight(3, 28);
      calSh.setFrozenRows(3);

      // ── Build data rows ───────────────────────────────────────────────────
      var _EMAIL_DAYS = {
        'SEQ-1': [0, 3, 7],
        'SEQ-2': [7, 10, 14, 18, 25],
        'SEQ-3': [22, 25, 28, 31],
        'SEQ-4': [35]
      };
      var _calLaunch = brief.launchDate ? new Date(brief.launchDate + 'T12:00:00') : null;
      var _wkLbl = function(day) {
        if (day >= 35) return 'Launch Day';
        if (day >= 22) return 'Weeks 4-6 Launch Countdown';
        if (day >= 7)  return 'Weeks 2-3 Email Nurture';
        return 'Week 1 Social Arc';
      };
      var _dtStr = function(day) {
        if (!_calLaunch) return '';
        var d = new Date(_calLaunch);
        d.setDate(d.getDate() + day);
        return Utilities.formatDate(d, Session.getScriptTimeZone(), 'MMM d, yyyy');
      };
      var _oneLiner = function(text) {
        if (!text) return '';
        var t = String(text);
        var dot  = t.indexOf('.');
        var excl = t.indexOf('!');
        var qm   = t.indexOf('?');
        var ends = [dot, excl, qm].filter(function(i) { return i > 0; });
        if (!ends.length) return t.substring(0, 120);
        return t.substring(0, Math.min.apply(null, ends) + 1);
      };
      // FIX 1: platform-optimised send times for Super Mom ICP
      var _SEND_TIMES = {
        'facebook':  '9:30 AM local',
        'instagram': '11:30 AM local',
        'pinterest': '8:00 PM local',
        'nextdoor':  '8:30 AM local',
        'x':         '9:00 AM local',
        'tiktok':    '7:00 PM local (drop day)',
        'youtube':   '12:00 PM local (drop day)'
      };
      var _NO_TAG      = { 'facebook':1, 'nextdoor':1, 'youtube':1 };
      var _postBriefs  = (_briefs && _briefs.postBriefs)  ? _briefs.postBriefs  : {};
      var _emailBriefs = (_briefs && _briefs.emailBriefs) ? _briefs.emailBriefs : {};

      // ── Dynamic reads — all values from Campaign Center Sheet ─────────────────

      // LP URL — read from lp object (loaded from LPInventory tab by fcExportCampaignToDrive)
      var _lpUrl = '';
      var _lpUrlB = '';
      if (lp && lp.slug) {
        _lpUrl = _buildLpUrl(lp.slug);
        Logger.log('[CalendarXlsx] LP URL from LPInventory.slug=' + lp.slug + ': ' + _lpUrl);
      } else if (brief && brief.slug) {
        _lpUrl = _buildLpUrl(brief.slug);
        Logger.log('[CalendarXlsx] LP URL from CampaignBriefs.slug=' + brief.slug + ': ' + _lpUrl);
      } else {
        Logger.log('[CalendarXlsx] WARNING: No LP slug on lp or brief — UTM destination URL will be blank');
      }
      if (brief.ab_test && brief.lp_slug_b) {
        _lpUrlB = _buildLpUrl(brief.lp_slug_b);
        Logger.log('[CalendarXlsx] A/B Variant B LP URL from brief.lp_slug_b=' + brief.lp_slug_b + ': ' + _lpUrlB);
      }

      // Read all channels once — used for Email UTM and social hashtags (FIX 2)
      var _channelMap = {}; // key: channel name lowercase → channel obj (has hashtag_suggestions)
      var _emailUtmSource = '', _emailUtmMedium = '';
      try {
        var _allChannels = getChannels();
        _allChannels.forEach(function(ch) { _channelMap[(ch.name || '').toLowerCase()] = ch; });
        var _emailCh = _channelMap['email'] || null;
        if (_emailCh) {
          _emailUtmSource = _emailCh.utm_source || '';
          _emailUtmMedium = _emailCh.utm_medium || '';
          Logger.log('[CalendarXlsx] Email UTM from Channels tab: utm_source=' + _emailUtmSource + ' utm_medium=' + _emailUtmMedium);
        } else {
          Logger.log('[CalendarXlsx] WARNING: Email channel not found in Channels tab — utm_source/medium will be blank');
        }
        Logger.log('[CalendarXlsx] Channels loaded: ' + _allChannels.length + ' — hashtags available for: ' + Object.keys(_channelMap).join(', '));
      } catch(ce) { Logger.log('[CalendarXlsx] WARNING: Channels tab read error: ' + ce.message); }

      // Email DL map {seqCode → dlEntry} — read from DeepLinkRegistry tab, keyed by SEQ-N in notes
      var _emailDlMap = {};
      try {
        var _regDls = getDlRegistry(brief.id || '');
        var _emDls  = _regDls.filter(function(u) { return /^DL-EM/i.test(u.dl_id || ''); });
        if (_emDls.length === 0) {
          Logger.log('[CalendarXlsx] WARNING: No DL-EM entries in DeepLinkRegistry for ' + brief.id + ' — run fcGenerateUtmAndSave first; DL ID and UTM will be blank');
        } else {
          _emDls.forEach(function(dl) {
            var _seqMatch = String(dl.notes || dl.utm_content || '').match(/SEQ-\d+/i);
            if (_seqMatch) _emailDlMap[_seqMatch[0].toUpperCase()] = dl;
          });
          // Positional fallback if notes-based matching yielded nothing
          if (!Object.keys(_emailDlMap).length) {
            ['SEQ-1','SEQ-2','SEQ-3','SEQ-4'].forEach(function(seq, i) { if (_emDls[i]) _emailDlMap[seq] = _emDls[i]; });
          }
          Logger.log('[CalendarXlsx] Email DL map from DeepLinkRegistry: ' + JSON.stringify(Object.keys(_emailDlMap)));
        }
      } catch(de) { Logger.log('[CalendarXlsx] WARNING: DeepLinkRegistry read error: ' + de.message); }

      var calDataRows = [];

      // Funnel stage fallback by post number (1-indexed)
      var _FUNNEL_STAGES = ['hook','problem','agitate','solve','value','proof','cta'];
      // Social posts use a separate week-label: days 1-7 are always Week 1 Social Arc
      var _wkLblSocial = function(day) {
        if (day >= 35) return 'Launch Day';
        if (day >= 22) return 'Weeks 4-6 Launch Countdown';
        if (day >= 8)  return 'Weeks 2-3 Email Nurture';
        return 'Week 1 Social Arc';
      };

      // Email rows — pair A and B variants (sheet has one row per variant, id ends in -A or -B)
      // Group by base ID (strip -A/-B suffix), then emit one Row A + one Row B per pair
      try {
        // Sort: SEQ-N ascending → email_number ascending → A before B
        emails.sort(function(a, b) {
          var _key = function(e) {
            var seqNum   = parseInt((e.sequence_code || '').replace('SEQ-', '')) || 99;
            var emailNum = parseInt(e.email_number) || 99;
            var variant  = (e.id && String(e.id).endsWith('-B')) ? 1 : 0;
            return seqNum * 10000 + emailNum * 10 + variant;
          };
          return _key(a) - _key(b);
        });
        var _emailGroups = {};
        var _emailOrder  = [];
        emails.forEach(function(e) {
          var baseId = String(e.id || '').replace(/[-_][AB]$/i, '') ||
                       (e.sequence_code + '-E' + (e.email_number || 1));
          if (!_emailGroups[baseId]) { _emailGroups[baseId] = { a: null, b: null }; _emailOrder.push(baseId); }
          if (/[-_]B$/i.test(String(e.id || ''))) _emailGroups[baseId].b = e;
          else                                     _emailGroups[baseId].a = e;
        });
        _emailOrder.forEach(function(baseId) {
          var pair    = _emailGroups[baseId];
          var eRef    = pair.a || pair.b;
          if (!eRef) return;
          var seqCode  = eRef.sequence_code || 'EMAIL';
          var emailNum = parseInt(eRef.email_number) || 1;
          var _seqDays = _EMAIL_DAYS[seqCode];
          var day = (_seqDays && _seqDays[emailNum - 1] !== undefined)
            ? _seqDays[emailNum - 1] : (parseInt(eRef.send_day) || 0);
          var subA = String((pair.a && pair.a.subject_line) || (pair.a && pair.a.subject) || '');
          var subB = String((pair.b && pair.b.subject_line) || (pair.b && pair.b.subject) || '');
          var preA = String(eRef.preview_text || eRef.preheader || eRef.preview || '');
          if (preA.length > 100) preA = preA.substring(0, 100);
          var _isFirst = (emailNum === 1 && seqCode === 'SEQ-1');
          var cta  = String(eRef.body_cta || eRef.cta_text || eRef.cta || (_isFirst ? 'Claim your founding spot' : ''));
          // dl_id: email object (written by fcGenerateUtmAndSave) → DL registry map → blank + warning
          var _dlEntry = _emailDlMap[seqCode] || null;
          var dlId = String(eRef.dl_id || eRef.dlId || (_dlEntry ? _dlEntry.dl_id : '') || '');
          if (!dlId) Logger.log('[CalendarXlsx] WARNING: No DL ID for ' + seqCode + ' — run fcGenerateUtmAndSave first');
          // UTM URL: email object → build from sheet values → blank if LP URL or UTM source missing
          var utmUrl = String(eRef.utm_url || eRef.utmUrl || '');
          if (!utmUrl && dlId && _lpUrl && _emailUtmSource) {
            utmUrl = _lpUrl +
              '?utm_source=' + encodeURIComponent(_emailUtmSource) +
              '&utm_medium=' + encodeURIComponent(_emailUtmMedium) +
              '&utm_campaign=' + encodeURIComponent(brief.id || '') +
              '&utm_content=' + encodeURIComponent(dlId + '_' + seqCode + '_cta');
          }
          var stage = String(eRef.funnel_stage || '');
          // Build design brief from EmailSequences fields — no Claude API needed
          var _mkBrief = function(e, variant) {
            var hdr = 'EMAIL BRIEF · ' + seqCode + ' E' + emailNum + ' ' + variant;
            var lines = [hdr];
            if (e.subject_angle) lines.push('Subject angle: ' + e.subject_angle);
            if (e.body_theme)    lines.push('Body theme: '    + e.body_theme);
            if (e.funnel_stage)  lines.push('Funnel stage: '  + e.funnel_stage);
            if (e.trigger_event) lines.push('Trigger: '       + e.trigger_event);
            if (e.body_hook)     lines.push('Hook: '          + String(e.body_hook).substring(0, 80));
            if (e.body_cta)      lines.push('CTA: '           + e.body_cta);
            return lines.join('\n');
          };
          var _briefA = (pair.a || eRef).design_brief || _mkBrief(pair.a || eRef, 'A');
          var _briefB = (pair.b || eRef).design_brief || _mkBrief(pair.b || eRef, 'B');
          var shared = [day, _dtStr(day), _wkLbl(day), stage, seqCode + '-E' + emailNum, 'Email',
            '', preA, cta, utmUrl, dlId, '', 'Subject line · Klaviyo split',
            '', '', String(eRef.status || 'draft'), 'Klaviyo', '6:30 AM local'];
          var rowA = shared.slice(); rowA[6] = subA;         rowA[11] = 'A'; rowA[13] = _briefA; calDataRows.push(rowA);
          var rowB = shared.slice(); rowB[6] = subB||'None'; rowB[11] = 'B'; rowB[13] = _briefB; calDataRows.push(rowB);
        });
        Logger.log('[CalendarXlsx] email rows: ' + (_emailOrder.length * 2) + ' (' + _emailOrder.length + ' pairs)');
      } catch(ee) { Logger.log('[CalendarXlsx] email rows error: ' + ee.message); }

      // Social post rows
      try {
        var _DEFAULT_TAGS = {
          'instagram': '#mealplanning #foodwaste #busymom #easyChefPro #mealprep #familydinners #grocerysavings',
          'tiktok':    '#easyChefPro #mealprep #busymom #foodwaste #dinnerideas',
          'pinterest': '#mealplanning #familydinners #grocerysavings #foodwaste #easyrecipes #busymom #mealprep'
        };
        var _TAG_PLATFORMS = { 'instagram':1, 'tiktok':1, 'pinterest':1 };
        var _chIdx = {};
        posts.forEach(function(p) {
          var chKey = String(p.platform || p.channel || 'other').toLowerCase();
          _chIdx[chKey] = (_chIdx[chKey] || 0) + 1;
          var pday = (p.scheduled_day !== undefined && p.scheduled_day !== null &&
                      p.scheduled_day !== '' && parseInt(p.scheduled_day) !== 0)
            ? parseInt(p.scheduled_day)
            : _chIdx[chKey];
          // Funnel stage: field → fallback from post_num or channel position
          var _postNum   = parseInt(p.post_num || _chIdx[chKey]) || 1;
          var _stageIdx  = Math.min(_postNum - 1, _FUNNEL_STAGES.length - 1);
          var _stage     = String(p.funnel_stage || p.stage || p.theme || _FUNNEL_STAGES[_stageIdx] || '');
          // Hashtag chain: sheet → Channels tab → locked defaults (IG/TK/PT only); blank for no-tag channels
          var _briefHashtags = _postBriefs[p.id] ? String(_postBriefs[p.id].hashtags || '') : '';
          var _sheetHashtags = String(p.hashtags || p.hashtag || '');
          var _chHashtags    = _channelMap[chKey] ? String(_channelMap[chKey].hashtag_suggestions || '') : '';
          var _hashtags      = '';
          if (!_NO_TAG[chKey]) {
            if (_TAG_PLATFORMS[chKey]) {
              _hashtags = _briefHashtags || _sheetHashtags || _chHashtags || _DEFAULT_TAGS[chKey] || '';
            } else {
              _hashtags = _briefHashtags || _sheetHashtags;
            }
          }
          var _briefFull     = String(p.design_brief || (_postBriefs[p.id] && _postBriefs[p.id].design_brief) || '');
          var _designBrief   = _briefFull ? _oneLiner(_briefFull) : 'Brief pending generation';
          var _owner         = (chKey === 'tiktok' || chKey === 'youtube') ? 'Taylor' : 'Searah';
          var _sendTime      = _SEND_TIMES[chKey] || '9:00 AM local';
          // A/B: when ab_test active, build Variant B UTM URL for the Variant column
          var _abVariantCell = '';
          if (brief.ab_test && _lpUrlB) {
            var _abDlB = null;
            try {
              getDlRegistry(brief.id || '').forEach(function(u) {
                if (/DL-LP.*-B$/i.test(u.dl_id || '')) _abDlB = u;
              });
            } catch(ade) {}
            var _abUtmB = _lpUrlB;
            if (_abDlB) {
              _abUtmB = _lpUrlB +
                '?utm_source='   + encodeURIComponent(_abDlB.utm_source || '') +
                '&utm_medium='   + encodeURIComponent(_abDlB.utm_medium || '') +
                '&utm_campaign=' + encodeURIComponent(brief.id || '') +
                '&utm_content='  + encodeURIComponent((_abDlB.dl_id || '') + '_social_cta');
            }
            _abVariantCell = 'Variant B: ' + _abUtmB;
          }
          calDataRows.push([
            pday, _dtStr(pday), _wkLblSocial(pday), _stage,
            'Social', String(p.platform || p.channel || ''),
            String(p.hook || ''), String(p.body_copy || p.body || ''), String(p.cta || ''),
            String(p.utm_url || ''), String(p.dl_id || ''),
            _abVariantCell, '',            // Variant (A/B UTM), Test — blank for non-AB
            _designBrief, _hashtags,
            String(p.status || 'draft'),
            _owner, _sendTime
          ]);
        });
        Logger.log('[CalendarXlsx] post rows: ' + posts.length);
      } catch(pe) { Logger.log('[CalendarXlsx] post rows error: ' + pe.message); }

      calDataRows.sort(function(a, b) { return (parseInt(a[0])||0) - (parseInt(b[0])||0); });
      Logger.log('[CalendarXlsx] total rows built: ' + calDataRows.length);

      // ── Write data rows ───────────────────────────────────────────────────
      var numDataRows = calDataRows.length;
      if (numDataRows > 0) {
        calSh.getRange(4, 1, numDataRows, numCols).setValues(calDataRows);
        calSh.getRange(4, 2, numDataRows, 1).setNumberFormat('@');
        for (var ri = 0; ri < numDataRows; ri++) {
          var rowRange = calSh.getRange(ri + 4, 1, 1, numCols);
          rowRange.setBackground(ri % 2 === 0 ? _BRAND_WHITE : _BRAND_BEIGE);
          rowRange.setFontFamily('Arial');
          rowRange.setFontSize(9);
          rowRange.setFontColor(_BRAND_BODY);
          rowRange.setVerticalAlignment('top');
        }
        calSh.getRange(4, 1, numDataRows, 1).setFontWeight('bold');
        // Wrap: Subject/Hook(7) · Preview/Body(8) · UTM URL(10) · Design Brief(14 — shifted by 2 new cols)
        [7, 8, 10, 14].forEach(function(col) {
          calSh.getRange(4, col, numDataRows, 1).setWrap(true);
        });
        // Patch item count into meta row now that we know it
        _metaCell.setValue('ICP: ' + (brief.icp || '') + '   ·   Theme: ' + (brief.theme || '') + '   ·   ' + (brief.channels ? brief.channels.join(', ') : '') + '   ·   Generated ' + _genDate + '   ·   ' + numDataRows + ' items');
      }

      // ── Column widths ──
      calSh.autoResizeColumns(1, numCols);
      // 18 cols: Day · Date · Week · Stage · Type · Platform · Subject · Preview · CTA · UTM · DL · Variant · Test · DesignBrief · Hashtags · Status · Owner · SendTime
      var _minWidths = [40, 120, 150, 90, 120, 90, 240, 260, 140, 260, 90, 60, 160, 200, 130, 70, 90, 120];
      _minWidths.forEach(function(minW, ci) {
        if (calSh.getColumnWidth(ci + 1) < minW) calSh.setColumnWidth(ci + 1, minW);
      });

      docUrls.calendar = 'https://docs.google.com/spreadsheets/d/' + calSS.getId() + '/view';
      Logger.log('[DriveExport] calendar: ' + numDataRows + ' rows (' + emails.length + ' emails / ' + posts.length + ' posts)');
    } catch(e) { Logger.log('[DriveExport] calendar error: ' + e.message + (e.stack ? '\n' + e.stack : '')); }

    // ── 7. Register in Docs tab ─────────────────────────────────────────────
    try {
      addDocument({
        id:          'camp-drive-' + (brief.id || Date.now().toString(36)),
        taskId:      'campaigns',
        agendaId:    '',
        name:        (brief.name || brief.id || 'Campaign') + ' — Drive Workspace',
        url:         folderUrl,
        previewUrl:  '',
        driveFileId: folderId,
        mimeType:    'application/vnd.google-apps.folder',
        reviewNeeded:'false',
        addedBy:     'campaign-wizard',
        addedAt:     new Date().toISOString(),
        folderUrl:   folderUrl
      });
    } catch(e) { Logger.log('[DriveExport] addDocument: ' + e.message); }

    // ── 8. Persist drive_url to CampaignBriefs sheet ────────────────────────
    try {
      if (brief.id) _saveCampaignDriveUrl(brief.id, folderUrl);
    } catch(e) { Logger.log('[DriveExport] saveDriveUrl: ' + e.message); }

    Logger.log('[DriveExport] done: ' + folderUrl);
    return { ok: true, folder_url: folderUrl, doc_urls: docUrls };

  } catch(e) {
    Logger.log('[DriveExport] fatal: ' + e.message);
    return { ok: false, error: e.message };
  }
}


// ── Generate design briefs via Claude API (one batch call per asset type) ─────
function _generateDesignBriefs(brief, posts, emails, lp, apiKey) {
  var result = { postBriefs: {}, emailBriefs: {}, lpBrief: {} };

  var _claudeFetch = function(systemPrompt, userMessage) {
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      }),
      muteHttpExceptions: true
    });
    if (resp.getResponseCode() !== 200) throw new Error('Claude API ' + resp.getResponseCode() + ': ' + resp.getContentText().substring(0, 200));
    return JSON.parse(resp.getContentText()).content[0].text;
  };

  var ctx = { icp_code: brief.icp || '', theme_id: brief.theme || '', campaign_id: brief.id || '', campaign_name: brief.name || '' };

  // ── Social post briefs + hashtags ──────────────────────────────────────────
  try {
    var postSys = getMasterSystemPrompt('post_brief', ctx);
    var postMsg = 'CAMPAIGN: ' + JSON.stringify({
      id: brief.id, name: brief.name, theme: brief.theme, icp: brief.icp,
      channels: brief.channels, campaign_angle: brief.campaign_angle
    }) + '\n\nPOSTS:\n' + JSON.stringify(posts.map(function(p, idx) {
      return {
        id: p.id || '',
        post_num: p.post_num || (idx + 1),
        platform: p.platform || p.channel || '',
        funnel_stage: p.funnel_stage || p.theme || '',
        hook: p.hook || '',
        body: (p.body_copy || p.body || '').substring(0, 200),
        scheduled_day: p.scheduled_day || 0
      };
    }));
    var postRaw = _claudeFetch(postSys, postMsg);
    var postMatch = postRaw.match(/\{[\s\S]*\}/);
    if (postMatch) {
      var postJson = JSON.parse(postMatch[0]);
      (postJson.posts || []).forEach(function(pb) {
        if (pb.id) result.postBriefs[pb.id] = { design_brief: pb.design_brief || '', hashtags: pb.hashtags || '' };
      });
    }
    Logger.log('[DesignBriefs] posts: ' + Object.keys(result.postBriefs).length + ' briefs');
  } catch(e) { Logger.log('[DesignBriefs] posts error: ' + e.message); }

  // ── Email design briefs ────────────────────────────────────────────────────
  if (emails.length > 0) {
    try {
      var emailSys = getMasterSystemPrompt('email_brief', ctx);
      Logger.log('[BRIEF-EMAIL] first email id: ' + ((emails[0] || {}).id || '') + ' seq_id: ' + ((emails[0] || {}).seq_id || ''));
      var emailMsg = 'CAMPAIGN: ' + JSON.stringify({
        id: brief.id, name: brief.name, theme: brief.theme, icp: brief.icp
      }) + '\n\nEMAILS:\n' + JSON.stringify(emails.map(function(e) {
        return {
          id: e.seq_id || e.id || '',   // prefer seq_id as stable lookup key
          seq_id: e.seq_id || '',
          email_number: e.email_number || 1,
          funnel_stage: e.funnel_stage || '',
          subject: e.subject_line_a || e.subject || '',
          send_day: e.send_day || 0
        };
      }));
      var emailRaw = _claudeFetch(emailSys, emailMsg);
      var emailMatch = emailRaw.match(/\{[\s\S]*\}/);
      if (emailMatch) {
        var emailJson = JSON.parse(emailMatch[0]);
        (emailJson.emails || []).forEach(function(eb) {
          var _bKey = eb.id || eb.seq_id || '';
          if (_bKey) result.emailBriefs[_bKey] = { design_brief: eb.design_brief || '' };
        });
      }
      Logger.log('[BRIEF-EMAIL] brief keys: ' + JSON.stringify(Object.keys(result.emailBriefs)));
      Logger.log('[DesignBriefs] emails: ' + Object.keys(result.emailBriefs).length + ' briefs');
    } catch(e) { Logger.log('[DesignBriefs] emails error: ' + e.message); }
  }

  // ── LP brief ───────────────────────────────────────────────────────────────
  try {
    var lpSys = getMasterSystemPrompt('lp_brief', ctx);
    var lpMsg = 'CAMPAIGN: ' + JSON.stringify({
      id: brief.id, name: brief.name, theme: brief.theme, icp: brief.icp,
      slug: lp.slug || brief.slug || '',
      hero_headline: lp.hero_headline || '',
      cta_primary: lp.cta_primary || '',
      campaign_angle: brief.campaign_angle || ''
    });
    var lpRaw = _claudeFetch(lpSys, lpMsg);
    var lpMatch = lpRaw.match(/\{[\s\S]*\}/);
    if (lpMatch) result.lpBrief = JSON.parse(lpMatch[0]);
    Logger.log('[DesignBriefs] lp: ' + (!!result.lpBrief.hero_visual));
  } catch(e) { Logger.log('[DesignBriefs] lp error: ' + e.message); }

  // ── Batch write design_briefs back to Sheet ──────────────────────────────
  if (Object.keys(result.postBriefs).length > 0) {
    try {
      var _spSheet = _getCCSheet(_CC_TAB.SOCIAL);
      var _spLast  = _spSheet.getLastRow();
      if (_spLast >= 2) {
        var _spData  = _spSheet.getRange(2, 1, _spLast - 1, 16).getValues();
        var _spDirty = false;
        _spData.forEach(function(row) {
          var _pid = String(row[0] || '');
          if (_pid && result.postBriefs[_pid] && result.postBriefs[_pid].design_brief) {
            row[15] = result.postBriefs[_pid].design_brief;
            _spDirty = true;
          }
        });
        if (_spDirty) _spSheet.getRange(2, 1, _spData.length, 16).setValues(_spData);
        Logger.log('[DesignBriefs] SocialPosts write-back done');
      }
    } catch(we) { Logger.log('[DesignBriefs] SocialPosts write-back error: ' + we.message); }
  }

  if (Object.keys(result.emailBriefs).length > 0) {
    try {
      var _esSheet = _getCCSheet(_CC_TAB.EMAIL);
      var _esLast  = _esSheet.getLastRow();
      if (_esLast >= 2) {
        var _esData  = _esSheet.getRange(2, 1, _esLast - 1, 26).getValues();
        var _esDirty = false;
        _esData.forEach(function(row) {
          var _eid = String(row[0] || '');
          if (_eid && result.emailBriefs[_eid] && result.emailBriefs[_eid].design_brief) {
            row[25] = result.emailBriefs[_eid].design_brief;
            _esDirty = true;
          }
        });
        if (_esDirty) _esSheet.getRange(2, 1, _esData.length, 26).setValues(_esData);
        Logger.log('[DesignBriefs] EmailSequences write-back done');
      }
    } catch(we) { Logger.log('[DesignBriefs] EmailSequences write-back error: ' + we.message); }
  }

  return result;
}


// ── Write drive_url back to the CampaignBriefs sheet row ─────────────────────
function _saveCampaignDriveUrl(briefId, driveUrl) {
  if (!briefId || !driveUrl) return;
  var sh   = _getCCSheet(_CC_TAB.BRIEFS);
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return;
  var headers = data[0].map(function(h) { return String(h).trim(); });
  var col = headers.indexOf('drive_url');
  if (col < 0) {
    col = headers.length;
    sh.getRange(1, col + 1).setValue('drive_url');
  }
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(briefId)) {
      sh.getRange(i + 1, col + 1).setValue(driveUrl);
      return;
    }
  }
}


// ── Document helpers ──────────────────────────────────────────────────────────

function _newDoc(name, folder) {
  var doc = DocumentApp.create(name);
  DriveApp.getFileById(doc.getId()).moveTo(folder);
  try { DriveApp.getFileById(doc.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) {}
  return doc;
}

// Logo lookup — searches Drive by filename
function _getLogoBlob() {
  try {
    var files = DriveApp.getFilesByName('EasyChefProHorizontal.jpg');
    if (files.hasNext()) return files.next().getBlob();
  } catch(e) { Logger.log('[DriveExport] logo lookup: ' + e.message); }
  return null;
}

// Brand header: logo · campaign name · generated date · red divider
function _docBrandHeader(body, campaignName, launchDate) {
  try {
    var logo = _getLogoBlob();
    if (logo) {
      var img = body.appendImage(logo);
      try { img.setWidth(200).setHeight(50); } catch(ie) {}
      body.appendParagraph('');
    }
  } catch(e) { Logger.log('[DriveExport] logo insert: ' + e.message); }

  var a;
  var namePara = body.appendParagraph(campaignName || 'easyChef Pro');
  a = {};
  a[DocumentApp.Attribute.FONT_FAMILY]      = 'Arial';
  a[DocumentApp.Attribute.FONT_SIZE]        = 13;
  a[DocumentApp.Attribute.BOLD]             = true;
  a[DocumentApp.Attribute.FOREGROUND_COLOR] = _BRAND_DARK;
  namePara.setAttributes(a);

  var genDate  = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM d, yyyy');
  var datePara = body.appendParagraph('Generated ' + genDate);
  a = {};
  a[DocumentApp.Attribute.FONT_FAMILY]      = 'Arial';
  a[DocumentApp.Attribute.FONT_SIZE]        = 9;
  a[DocumentApp.Attribute.FOREGROUND_COLOR] = _BRAND_GREY;
  datePara.setAttributes(a);

  _docDivider(body);
  body.appendParagraph('');
}

// Brand footer: red divider · DGL tagline
function _docBrandFooter(body) {
  body.appendParagraph('');
  _docDivider(body);
  var genDate  = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM d, yyyy');
  var footPara = body.appendParagraph('Digital Galactica Labs LLC  ·  Confidential  ·  Generated ' + genDate);
  var a = {};
  a[DocumentApp.Attribute.FONT_FAMILY]      = 'Arial';
  a[DocumentApp.Attribute.FONT_SIZE]        = 9;
  a[DocumentApp.Attribute.FOREGROUND_COLOR] = _BRAND_GREY;
  a[DocumentApp.Attribute.ITALIC]           = true;
  footPara.setAttributes(a);
}

// Red divider line
function _docDivider(body) {
  var p = body.appendParagraph('────────────────────────────────────────────────────────────────────');
  var a = {};
  a[DocumentApp.Attribute.FONT_FAMILY]      = 'Arial';
  a[DocumentApp.Attribute.FONT_SIZE]        = 8;
  a[DocumentApp.Attribute.FOREGROUND_COLOR] = _BRAND_RED;
  p.setAttributes(a);
}

// H1: red bold Arial heading
function _dh1(body, text) {
  var p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  var a = {};
  a[DocumentApp.Attribute.FONT_FAMILY]      = 'Arial';
  a[DocumentApp.Attribute.FOREGROUND_COLOR] = _BRAND_RED;
  a[DocumentApp.Attribute.BOLD]             = true;
  p.setAttributes(a);
}

// H2: red bold Arial subheading
function _dh2(body, text) {
  var p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  var a = {};
  a[DocumentApp.Attribute.FONT_FAMILY]      = 'Arial';
  a[DocumentApp.Attribute.FOREGROUND_COLOR] = _BRAND_RED;
  a[DocumentApp.Attribute.BOLD]             = true;
  p.setAttributes(a);
}

// Key-value pair: bold label + plain value, Arial
function _dpair(body, label, value) {
  var p = body.appendParagraph('');
  var al = {};
  al[DocumentApp.Attribute.FONT_FAMILY]      = 'Arial';
  al[DocumentApp.Attribute.FONT_SIZE]        = 10;
  al[DocumentApp.Attribute.BOLD]             = true;
  al[DocumentApp.Attribute.FOREGROUND_COLOR] = _BRAND_DARK;
  p.appendText(label + ':  ').setAttributes(al);
  var av = {};
  av[DocumentApp.Attribute.FONT_FAMILY]      = 'Arial';
  av[DocumentApp.Attribute.FONT_SIZE]        = 10;
  av[DocumentApp.Attribute.BOLD]             = false;
  av[DocumentApp.Attribute.FOREGROUND_COLOR] = _BRAND_BODY;
  p.appendText(String(value || '')).setAttributes(av);
}

// Plain body paragraph, Arial
function _docBodyPara(body, text) {
  var p = body.appendParagraph(text || '');
  var a = {};
  a[DocumentApp.Attribute.FONT_FAMILY]      = 'Arial';
  a[DocumentApp.Attribute.FONT_SIZE]        = 10;
  a[DocumentApp.Attribute.FOREGROUND_COLOR] = _BRAND_BODY;
  p.setAttributes(a);
}

function _deSafe(str, maxLen) {
  return String(str || '').replace(/[\/\\:*?"<>|]/g, '').trim().substring(0, maxLen || 80);
}

// ── HTML LP Reference builder ─────────────────────────────────────────────────
function _buildLpReferenceHtml(brief, copy, lp, posts, emails, genDate, lpBrief) {
  lp      = lp      || {};
  copy    = copy    || {};
  lpBrief = lpBrief || {};
  var _h = function(v) {
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  // Use shared helper — strips any leading lp/ before prepending, so never lp/lp/
  var slug     = String(lp.slug || brief.slug || 'waitlist-a').replace(/^lp\//, '');
  var canonUrl = _buildLpUrl(slug);
  var lpUrl    = canonUrl.replace('https://', '');
  var icp      = lp.icp  || brief.icp  || '';

  // Fix 4 (DL_IDs): collect from posts/emails AND query DeepLinkRegistry for ACTIVE entries
  var dlIdMap = {};
  (Array.isArray(posts)  ? posts  : []).forEach(function(p) { if (p.dl_id) dlIdMap[p.dl_id] = 1; });
  (Array.isArray(emails) ? emails : []).forEach(function(e) { if (e.dl_id) dlIdMap[e.dl_id] = 1; });
  try {
    var regRows = getDlRegistry(brief.id || '');
    regRows.filter(function(r){ return (r.status||'').toUpperCase() === 'ACTIVE'; })
           .forEach(function(r){ if (r.dl_id) dlIdMap[r.dl_id] = 1; });
  } catch(re) {}
  var dlIds = Object.keys(dlIdMap).sort().join(' · ') || '—';

  // Proof bar — use lp.proof_items or approved-claims default
  var proofBar = Array.isArray(lp.proof_items)
    ? lp.proof_items.join(' · ')
    : (lp.proof_items || '$1,336/year savings · 69.5% less food waste · 30 min fridge to table');

  var ctaCopy = (lp.cta_primary || copy.cta_primary || '') +
                (lp.cta_url ? '  →  ' + lp.cta_url : ('  →  ' + canonUrl));

  // 7-step arc rows — expanded with new LP section fields
  var _agitate = lp.agitate_section
    || (brief.campaign_angle
        ? brief.campaign_angle + ' · $1,336/year · food waste · takeout'
        : '$1,336/year · food waste · takeout');

  // Section 4 SOLVE: feature callouts (if available)
  var _solveCallouts = '';
  if (lp.solve_track || lp.solve_plan || lp.solve_optimize || lp.solve_cook || lp.solve_shop) {
    _solveCallouts = ' | TRACK: ' + _h(lp.solve_track || '—') +
      ' | PLAN: '     + _h(lp.solve_plan     || '—') +
      ' | OPTIMIZE: ' + _h(lp.solve_optimize || '—') +
      ' | COOK: '     + _h(lp.solve_cook     || '—') +
      ' | SHOP: '     + _h(lp.solve_shop     || '—');
  }
  var _solveContent = _h(lp.solve_section || 'easyChef Pro closes the loop. TRACK → PLAN → OPTIMIZE → COOK → SHOP') + _solveCallouts;

  // Section 5 VALUE: "WHAT CHANGES MONDAY" tag + value copy
  var _valueTag  = lp.value_section_tag ? '[' + _h(lp.value_section_tag) + '] ' : '';
  var _valueCopy = _valueTag + _h(lp.value_section || lp.social_proof || lp.cta_primary || copy.cta_primary || brief.cta_primary || '');

  // Section 6 PROOF: extended proof lines
  var _proofContent = proofBar +
    (lp.proof_origin_line     ? ' | Origin: '     + _h(lp.proof_origin_line)     : '') +
    (lp.proof_validation_line ? ' | Validation: ' + _h(lp.proof_validation_line) : '') +
    (lp.proof_founding_line   ? ' | Founding: '   + _h(lp.proof_founding_line)   : '');

  // Section 7 CTA: 3 appearances
  var _ctaContent = _h(lp.cta_primary || copy.cta_primary || '') +
    (lp.cta_supporting  ? ' | Supporting: '  + _h(lp.cta_supporting)  : '') +
    (lp.cta_exclusivity ? ' | Exclusivity: ' + _h(lp.cta_exclusivity) : '') +
    ('  →  ' + canonUrl);

  var steps = [
    ['1', 'HOOK',    'Hero headline + subheadline', _h(lp.hero_headline || copy.headline || '') + (lp.hero_subheadline ? ' / ' + _h(lp.hero_subheadline) : '')],
    ['2', 'PROBLEM', 'Problem block',               _h(lp.problem_section || brief.subheadline || '6:30 PM wall · fridge full · no plan')],
    ['3', 'AGITATE', 'Agitate block',               _h(_agitate)],
    ['4', 'SOLVE',   'Solve + feature callouts',    _solveContent],
    ['5', 'VALUE',   'What Changes Monday',         _valueCopy],
    ['6', 'PROOF',   'Proof bar (3 stats)',          _proofContent],
    ['7', 'CTA',     'Primary CTA (3× on page)',    _ctaContent]
  ];
  // FIX 1: section_visuals may be a keyed object from Claude — flatten to plain text
  var sectionVisualsText = '';
  if (lpBrief.section_visuals && typeof lpBrief.section_visuals === 'object') {
    sectionVisualsText = Object.keys(lpBrief.section_visuals).map(function(k) {
      return k.toUpperCase() + ': ' + String(lpBrief.section_visuals[k]);
    }).join('\n');
  } else {
    sectionVisualsText = String(lpBrief.section_visuals || '');
  }

  var stepsRows = '';
  steps.forEach(function(s) {
    stepsRows += '  <tr>'
      + '<td class="td-step td-center">' + s[0] + '</td>'
      + '<td class="td-step td-center">' + s[1] + '</td>'
      + '<td class="td-dim">'           + s[2]  + '</td>'
      + '<td>'                          + s[3]  + '</td>'
      + '</tr>\n';
  });

  // Fix 4 (SEO): auto-generate from headline + approved claims when lp fields are blank
  var metaTitle = lp.meta_title || '';
  var metaDesc  = lp.meta_description || '';
  if (!metaTitle) {
    var _autoT = (copy.headline || brief.theme || 'Meal Planning & Grocery App') + ' — easyChef Pro';
    metaTitle = _autoT.length > 60 ? _autoT.substring(0, 57) + '…' : _autoT;
  }
  if (!metaDesc) {
    var _autoD = (brief.subheadline || 'Stop wasting food and money.')
      + ' Track waste · Plan meals · Optimize nutrition · Cook faster · Shop smarter. Join the waitlist.';
    metaDesc = _autoD.length > 155 ? _autoD.substring(0, 152) + '…' : _autoD;
  }
  var ogTitle   = lp.og_title         || metaTitle;
  var ogDesc    = lp.og_description   || metaDesc;
  var mtLen     = ' <span class="char-count">(' + metaTitle.length + ' chars)</span>';
  var mdLen     = ' <span class="char-count">(' + metaDesc.length  + ' chars)</span>';

  var blueprint = _h(brief.funnel || 'Blueprint A-Waitlist');
  var variant   = _h(lp.variant   || 'A &mdash; Money Funnel');

  var css = '<style>\n'
  + '  * { margin:0; padding:0; box-sizing:border-box; }\n'
  + '  :root { --red:#FF0000; --black:#000000; --beige:#F6EFE8; --white:#FFFFFF; --gray:#666666; --body:#333333; --border:#DDDDDD; --warn-bg:#FFF8E1; --warn-border:#F5A623; }\n'
  + '  body { font-family:\'Inter\',Arial,sans-serif; font-size:13px; color:var(--black); background:var(--white); padding:40px; max-width:920px; margin:0 auto; }\n'
  + '  .header { padding-bottom:16px; border-bottom:3px solid var(--red); margin-bottom:24px; }\n'
  + '  .logo { height:45px; width:auto; display:block; margin-bottom:16px; }\n'
  + '  .doc-title { font-family:\'Proza Libre\',serif; font-size:28px; font-weight:700; color:var(--black); margin-bottom:4px; }\n'
  + '  .doc-subtitle { font-family:\'Proza Libre\',serif; font-size:18px; font-weight:700; color:var(--red); margin-bottom:8px; }\n'
  + '  .doc-meta { font-size:12px; color:var(--gray); }\n'
  + '  .warning-banner { display:flex; align-items:flex-start; gap:12px; background:var(--warn-bg); border:2px solid var(--warn-border); border-radius:4px; padding:14px 18px; margin-bottom:28px; font-size:13px; line-height:1.5; color:#7D4A00; }\n'
  + '  .warn-icon { font-size:20px; flex-shrink:0; line-height:1.2; }\n'
  + '  .sec-header { background:var(--black); color:var(--white); font-family:\'Inter\',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; padding:9px 14px; border-radius:3px 3px 0 0; margin-top:28px; }\n'
  + '  table { width:100%; border-collapse:collapse; margin-bottom:0; border-radius:0 0 3px 3px; overflow:hidden; }\n'
  + '  thead tr { background:var(--red); }\n'
  + '  thead th { font-size:11px; font-weight:600; color:var(--white); text-align:left; padding:8px 12px; border:1px solid var(--red); }\n'
  + '  tbody tr:nth-child(odd)  { background:var(--white); }\n'
  + '  tbody tr:nth-child(even) { background:var(--beige); }\n'
  + '  tbody td { font-size:12px; padding:8px 12px; border:1px solid var(--border); vertical-align:top; color:var(--body); }\n'
  + '  .td-label  { font-weight:600; background:var(--beige)!important; white-space:nowrap; color:var(--black); width:26%; }\n'
  + '  .td-step   { font-weight:700; color:var(--red); background:var(--beige)!important; }\n'
  + '  .td-center { text-align:center; width:7%; }\n'
  + '  .td-dim    { color:var(--gray); font-size:11px; width:22%; }\n'
  + '  .char-count { color:var(--gray); font-size:11px; }\n'
  + '  .badge-blocker { display:inline-block; background:#CC0000; color:var(--white); padding:2px 8px; border-radius:3px; font-size:10px; font-weight:700; letter-spacing:0.05em; }\n'
  + '  .td-brief { background:#EEF4FB !important; white-space:pre-wrap; line-height:1.7; }\n'
  + '  .td-brief-label { background:#EEF4FB !important; color:#2C6DAA; font-weight:700; white-space:nowrap; }\n'
  + '  .footer { margin-top:40px; padding-top:12px; border-top:2px solid var(--red); font-size:11px; color:var(--gray); }\n'
  + '  @media print { body { padding:20px; } .sec-header { page-break-before:auto; } }\n'
  + '</style>\n';

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
  + '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n'
  + '<title>easyChef Pro — LP Reference</title>\n'
  + '<link href="https://fonts.googleapis.com/css2?family=Proza+Libre:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">\n'
  + css + '</head>\n<body>\n\n'

  // ── HEADER ──
  + '<div class="header">\n'
  + '  <img class="logo" src="https://ops.dgl.dev/assets/EasyChefProHorizontal.jpg" alt="easyChef Pro">\n'
  + '  <div class="doc-title">LP Reference</div>\n'
  + '  <div class="doc-subtitle">' + _h(slug) + ' &nbsp;&middot;&nbsp; Variant ' + variant + '</div>\n'
  + '  <div class="doc-meta">' + _h(brief.id) + ' &nbsp;&middot;&nbsp; ' + _h(lpUrl) + ' &nbsp;&middot;&nbsp; ' + blueprint + '</div>\n'
  + '</div>\n\n'

  // ── WARNING BANNER ──
  + '<div class="warning-banner">'
  + '<span class="warn-icon">&#9888;</span>'
  + '<span>Thank-you page <strong>/thank-you</strong> is NOT BUILT &mdash; this is the #1 hard blocker for Convert.com Primary Goal and A/B test tracking.</span>'
  + '</div>\n\n'

  // ── 01 PAGE DETAILS ──
  + '<div class="sec-header">01 &mdash; PAGE DETAILS</div>\n'
  + '<table><tbody>\n'
  + '  <tr><td class="td-label">URL</td><td>' + _h(lpUrl) + '</td></tr>\n'
  + '  <tr><td class="td-label">Variant</td><td>Variant ' + variant + '</td></tr>\n'
  + '  <tr><td class="td-label">ICP</td><td>' + _h(icp) + '</td></tr>\n'
  + '  <tr><td class="td-label">Conversion Goal</td><td>waitlist_signup_completed</td></tr>\n'
  + '  <tr><td class="td-label">Thank-you URL</td><td>/thank-you &nbsp;<span class="badge-blocker">NOT BUILT &mdash; HARD BLOCKER</span></td></tr>\n'
  + '  <tr><td class="td-label">Script Install Order</td><td>Convert.com <strong>FIRST</strong> &nbsp;&middot;&nbsp; Clarity <strong>SECOND</strong> &nbsp;&middot;&nbsp; GA4 <strong>THIRD</strong></td></tr>\n'
  + '</tbody></table>\n\n'

  // ── 02 7-STEP COPY STRUCTURE ──
  + '<div class="sec-header">02 &mdash; 7-STEP COPY STRUCTURE</div>\n'
  + '<table>\n'
  + '  <thead><tr><th style="width:6%">Step</th><th style="width:12%">Name</th><th style="width:22%">Job</th><th>Copy</th></tr></thead>\n'
  + '  <tbody>\n' + stepsRows + '  </tbody>\n</table>\n\n'

  // ── 04 DESIGN BRIEF ──
  + (lpBrief.hero_visual
      ? '<div class="sec-header">04 &mdash; DESIGN BRIEF</div>\n'
        + '<table><tbody>\n'
        + '  <tr><td class="td-label td-brief-label">Hero Visual</td><td class="td-brief">'      + _h(lpBrief.hero_visual      || '') + '</td></tr>\n'
        + '  <tr><td class="td-label td-brief-label">Section Visuals</td><td class="td-brief">'  + _h(sectionVisualsText) + '</td></tr>\n'
        + '  <tr><td class="td-label td-brief-label">Loop Diagram</td><td class="td-brief">'     + _h(lpBrief.loop_diagram     || '') + '</td></tr>\n'
        + '  <tr><td class="td-label td-brief-label">Social Proof Bar</td><td class="td-brief">' + _h(lpBrief.social_proof_bar || '') + '</td></tr>\n'
        + '  <tr><td class="td-label td-brief-label">CTA Button Style</td><td class="td-brief">' + _h(lpBrief.cta_button_style || '') + '</td></tr>\n'
        + '</tbody></table>\n\n'
      : '')

  // ── 05 URGENCY — Fix 4: pull from brief.urgency_trigger ──
  + '<div class="sec-header">05 &mdash; URGENCY</div>\n'
  + '<table><tbody>\n'
  + '  <tr><td class="td-label">Urgency Type</td><td>' + _h(lp.urgency_type || 'Founding member scarcity') + '</td></tr>\n'
  + '  <tr><td class="td-label">Urgency Line</td><td style="font-weight:600">' + _h(lp.urgency_line || brief.urgency_trigger || '—') + '</td></tr>\n'
  + '  <tr><td class="td-label">Placement</td><td>' + _h(lp.urgency_placement || 'below-hero') + '</td></tr>\n'
  + '</tbody></table>\n\n'

  // ── 06 EXCLUSIVITY — Fix 4: pull from brief.founding_offer ──
  + '<div class="sec-header">06 &mdash; EXCLUSIVITY</div>\n'
  + '<table><tbody>\n'
  + '  <tr><td class="td-label">Exclusivity Angle</td><td>' + _h(lp.exclusivity_angle || 'Founding family offer') + '</td></tr>\n'
  + '  <tr><td class="td-label">Exclusivity Line</td><td style="font-weight:600">' + _h(lp.exclusivity_line || brief.founding_offer || '—') + '</td></tr>\n'
  + '</tbody></table>\n\n'

  // ── 07 SEO PACKAGE ──
  + '<div class="sec-header">07 &mdash; SEO PACKAGE</div>\n'
  + '<table><tbody>\n'
  + '  <tr><td class="td-label">Meta Title <span class="char-count">(60 max)</span></td><td>'   + _h(metaTitle) + mtLen + '</td></tr>\n'
  + '  <tr><td class="td-label">Meta Description <span class="char-count">(155 max)</span></td><td>' + _h(metaDesc)  + mdLen + '</td></tr>\n'
  + '  <tr><td class="td-label">OG Title</td><td>'       + _h(ogTitle)   + '</td></tr>\n'
  + '  <tr><td class="td-label">OG Description</td><td>' + _h(ogDesc)    + '</td></tr>\n'
  + '  <tr><td class="td-label">Canonical URL</td><td>'  + _h(lp.canonical_url || canonUrl) + '</td></tr>\n'
  + '  <tr><td class="td-label">Focus Keyword</td><td>'  + _h(lp.focus_keyword || '—') + '</td></tr>\n'
  + '  <tr><td class="td-label">Secondary Keywords</td><td>' + _h(Array.isArray(lp.secondary_keywords) ? lp.secondary_keywords.join(' · ') : (lp.secondary_keywords || '—')) + '</td></tr>\n'
  + '</tbody></table>\n\n'

  // ── 08 TRACKING ──
  + '<div class="sec-header">08 &mdash; TRACKING</div>\n'
  + '<table><tbody>\n'
  + '  <tr><td class="td-label">GA4 Measurement ID</td><td>G-Q4DYEEXFKV</td></tr>\n'
  + '  <tr><td class="td-label">Convert.com Account</td><td>10019256</td></tr>\n'
  + '  <tr><td class="td-label">Microsoft Clarity ID</td><td>wjxhprug80</td></tr>\n'
  + '  <tr><td class="td-label">Conversion Event</td><td>waitlist_signup_completed</td></tr>\n'
  + '  <tr><td class="td-label">Active DL_IDs</td><td>' + _h(dlIds) + '</td></tr>\n'
  + '</tbody></table>\n\n'

  // ── 07 BRAND PLUG ──
  + (function(){
      var _bpRows    = [];
      try { _bpRows = (getCcSettings().brand_plug || []); } catch(e) {}
      var _bpTagline = (_bpRows.find(function(r){ return r.key === 'tagline'; }) || {}).label || 'Your kitchen. In command.';
      var _bpOrigin  = (_bpRows.find(function(r){ return r.key === 'origin';  }) || {}).label || 'Built by first responders.';
      var _proofClaim = _h(lp.proof_claim || brief.proof_claim || '$1,336/year saved');
      return '<div class="sec-header">09 &mdash; BRAND PLUG (above CTA &mdash; always, never optional)</div>\n'
        + '<table><tbody>\n'
        + '  <tr><td class="td-label">Line 1 &mdash; Tagline</td><td style="font-weight:600">' + _h(_bpTagline) + '</td></tr>\n'
        + '  <tr><td class="td-label">Line 2 &mdash; Origin</td><td style="font-weight:600">' + _h(_bpOrigin) + '</td></tr>\n'
        + '  <tr><td class="td-label">Line 3 &mdash; Proof Claim</td><td style="font-weight:600">' + _proofClaim + '</td></tr>\n'
        + '  <tr><td class="td-label">Placement Rule</td><td>These three lines appear above the CTA button on every LP, below the hero headline on the coming soon page, and in the proof bar on Variant A and B.</td></tr>\n'
        + '</tbody></table>\n\n';
    })()

  // ── FOOTER ──
  + '<div class="footer">easyChef Pro &nbsp;&middot;&nbsp; Digital Galactica Labs LLC &nbsp;&middot;&nbsp; Confidential &nbsp;&middot;&nbsp; Generated '
  + _h(genDate) + ' &nbsp;&middot;&nbsp; ops.dgl.dev &nbsp;&middot;&nbsp; &copy; 2026 Digital Galactica Labs LLC</div>\n\n'
  + '</body>\n</html>';
}


// ── HTML Social Posts builder ─────────────────────────────────────────────────
function _buildSocialPostsHtml(brief, posts, genDate, postBriefs) {
  postBriefs = postBriefs || {};
  posts = Array.isArray(posts) ? posts : [];
  var _h = function(v) {
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  // Group by channel, preserving insertion order
  var channelMap = {}, channelOrder = [];
  posts.forEach(function(p) {
    var ch = p.platform || p.channel || 'Other';
    if (!channelMap[ch]) { channelMap[ch] = []; channelOrder.push(ch); }
    channelMap[ch].push(p);
  });

  var cardsHtml = '';
  channelOrder.forEach(function(ch) {
    var chPosts = channelMap[ch];
    cardsHtml += '<div class="channel-section">\n';
    cardsHtml += '  <div class="channel-header">' + _h(ch.toUpperCase())
              + ' <span class="ch-count">' + chPosts.length + ' post' + (chPosts.length !== 1 ? 's' : '') + '</span></div>\n';
    chPosts.forEach(function(post, pi) {
      var postNum  = post.post_num || (pi + 1);
      var rawDay   = post.scheduled_day;
      var dayLabel = (rawDay !== undefined && rawDay !== null && rawDay !== '') ? rawDay : 'TBD';
      var fmtDate  = _fmtDateDisplay(post.scheduled_date);
      cardsHtml += '  <div class="post-card">\n';
      cardsHtml += '    <div class="post-card-header">Post ' + _h(postNum)
               + ' &nbsp;&middot;&nbsp; Day ' + _h(dayLabel)
               + (fmtDate ? ' &nbsp;&middot;&nbsp; ' + _h(fmtDate) : '')
               + '</div>\n';
      cardsHtml += '    <table><tbody>\n';
      var _stage    = post.funnel_stage || post.theme || '';
      var _stageEmo = {
        hook:'Exhausted · Defeated', problem:'Frustrated · Stuck',
        agitate:'Shocked · Recognition', solve:'Curious · Surprised',
        value:'Calm · Confident', proof:'Trusting · Proud', cta:'Peaceful · Satisfied'
      };
      var _emoTxt = _stage ? (_stageEmo[_stage.toLowerCase()] || '') : '';
      if (_stage) {
        cardsHtml += '      <tr><td class="td-label">Stage</td><td class="td-value">'
          + '<span class="badge-stage">' + _h(_stage.toUpperCase()) + '</span>'
          + (_emoTxt ? ' <span class="emo-label">' + _h(_emoTxt) + '</span>' : '')
          + '</td></tr>\n';
      }
      if (post.hook) cardsHtml += '      <tr><td class="td-label">Hook</td><td class="td-value td-copy">' + _h(post.hook) + '</td></tr>\n';
      var _bodyText = post.body_copy || post.body || '';
      if (_bodyText) {
        cardsHtml += '      <tr><td class="td-label">Body</td><td class="td-value td-copy">'
          + _h(_bodyText) + '<br><span class="char-count">(' + _bodyText.length + ' chars)</span></td></tr>\n';
      }
      var _pb = postBriefs[post.id] || {};
      var _hashtags = _pb.hashtags || post.hashtags || '';
      if (_hashtags) cardsHtml += '      <tr><td class="td-label">Hashtags</td><td class="td-value">'           + _h(_hashtags)     + '</td></tr>\n';
      if (_pb.design_brief) cardsHtml += '      <tr><td class="td-label td-brief-label">DESIGN BRIEF → FIGMA</td><td class="td-brief td-value">' + _h(_pb.design_brief) + '</td></tr>\n';
      if (post.cta)      cardsHtml += '      <tr><td class="td-label">CTA</td><td class="td-value">'             + _h(post.cta)      + '</td></tr>\n';
      if (post.utm_url)  cardsHtml += '      <tr><td class="td-label">UTM Link</td><td class="td-value td-url">' + _h(post.utm_url)  + '</td></tr>\n';
      if (post.dl_id)    cardsHtml += '      <tr><td class="td-label">DL ID</td><td class="td-value">'           + _h(post.dl_id)    + '</td></tr>\n';
      var st = post.status || 'draft';
      cardsHtml += '      <tr><td class="td-label">Status</td><td class="td-value"><span class="badge badge-' + _h(st) + '">' + _h(st.toUpperCase()) + '</span></td></tr>\n';
      cardsHtml += '    </tbody></table>\n  </div>\n';
    });
    cardsHtml += '</div>\n';
  });

  var css = '<style>\n'
  + '  * { margin:0; padding:0; box-sizing:border-box; }\n'
  + '  :root { --red:#FF0000; --black:#000000; --beige:#F6EFE8; --white:#FFFFFF; --gray:#666666; --body:#333333; --border:#DDDDDD; }\n'
  + '  body { font-family:\'Inter\',Arial,sans-serif; font-size:13px; color:var(--black); background:var(--white); padding:40px; max-width:900px; margin:0 auto; }\n'
  + '  .header { padding-bottom:16px; border-bottom:3px solid var(--red); margin-bottom:24px; }\n'
  + '  .logo { height:45px; width:auto; display:block; margin-bottom:16px; }\n'
  + '  .doc-title { font-family:\'Proza Libre\',serif; font-size:28px; font-weight:700; color:var(--black); margin-bottom:4px; }\n'
  + '  .doc-subtitle { font-family:\'Proza Libre\',serif; font-size:18px; font-weight:700; color:var(--red); margin-bottom:8px; }\n'
  + '  .doc-meta { font-size:12px; color:var(--gray); }\n'
  + '  .summary-bar { display:flex; gap:24px; background:var(--beige); border:1px solid var(--border); border-radius:4px; padding:12px 16px; margin-bottom:28px; }\n'
  + '  .summary-item { font-size:12px; color:var(--gray); }\n'
  + '  .summary-item strong { font-family:\'Proza Libre\',serif; font-size:20px; font-weight:700; color:var(--red); display:block; }\n'
  + '  .channel-section { margin-bottom:28px; }\n'
  + '  .channel-header { background:var(--black); color:var(--white); font-family:\'Inter\',sans-serif; font-size:12px; font-weight:600; letter-spacing:0.08em; padding:10px 16px; border-radius:3px 3px 0 0; }\n'
  + '  .ch-count { font-weight:400; opacity:0.65; }\n'
  + '  .post-card { border:1px solid var(--border); border-top:none; }\n'
  + '  .post-card:last-child { border-radius:0 0 3px 3px; }\n'
  + '  .post-card-header { background:var(--red); color:var(--white); font-family:\'Inter\',sans-serif; font-size:11px; font-weight:600; padding:7px 12px; }\n'
  + '  table { width:100%; border-collapse:collapse; }\n'
  + '  tbody tr:nth-child(odd)  { background:var(--white); }\n'
  + '  tbody tr:nth-child(even) { background:var(--beige); }\n'
  + '  tbody td { font-size:12px; padding:8px 12px; border:1px solid var(--border); vertical-align:top; }\n'
  + '  .td-label { font-weight:600; background:var(--beige)!important; width:18%; white-space:nowrap; color:var(--black); }\n'
  + '  .td-value { color:var(--body); }\n'
  + '  .td-copy  { font-style:italic; }\n'
  + '  .td-url   { font-family:monospace; font-size:11px; word-break:break-all; }\n'
  + '  .badge { display:inline-block; padding:2px 8px; border-radius:3px; font-size:10px; font-weight:600; letter-spacing:0.05em; }\n'
  + '  .badge-draft    { background:var(--beige); color:var(--gray); border:1px solid var(--border); }\n'
  + '  .badge-approved { background:#00A844; color:var(--white); }\n'
  + '  .badge-live     { background:var(--red); color:var(--white); }\n'
  + '  .badge-stage { display:inline-block; background:var(--red); color:var(--white); padding:2px 8px; border-radius:3px; font-size:10px; font-weight:700; letter-spacing:0.05em; }\n'
  + '  .emo-label { font-size:11px; color:var(--gray); font-style:italic; }\n'
  + '  .char-count { font-size:11px; color:var(--gray); font-style:normal; }\n'
  + '  .td-brief { background:#EEF4FB !important; white-space:pre-wrap; line-height:1.7; }\n'
  + '  .td-brief-label { background:#EEF4FB !important; color:#2C6DAA; font-weight:700; white-space:nowrap; }\n'
  + '  .footer { margin-top:40px; padding-top:12px; border-top:2px solid var(--red); font-size:11px; color:var(--gray); }\n'
  + '  @media print { .channel-section { page-break-inside:avoid; } }\n'
  + '</style>\n';

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
  + '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n'
  + '<title>easyChef Pro — Social Posts</title>\n'
  + '<link href="https://fonts.googleapis.com/css2?family=Proza+Libre:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">\n'
  + css + '</head>\n<body>\n\n'
  + '<div class="header">\n'
  + '  <img class="logo" src="https://ops.dgl.dev/assets/EasyChefProHorizontal.jpg" alt="easyChef Pro">\n'
  + '  <div class="doc-title">Social Posts</div>\n'
  + '  <div class="doc-subtitle">' + _h(brief.name) + '</div>\n'
  + '  <div class="doc-meta">' + _h(brief.id) + ' &nbsp;&middot;&nbsp; ' + _h(brief.icp) + ' &nbsp;&middot;&nbsp; Launch ' + _h(brief.launchDate) + '</div>\n'
  + '</div>\n\n'
  + '<div class="summary-bar">\n'
  + '  <div class="summary-item"><strong>' + posts.length + '</strong>Total Posts</div>\n'
  + '  <div class="summary-item"><strong>' + channelOrder.length + '</strong>Channels</div>\n'
  + '  <div class="summary-item"><strong>' + _h(brief.post_count || '—') + '</strong>Per Platform</div>\n'
  + '  <div class="summary-item"><strong>' + _h(brief.post_frequency || '—') + '</strong>Frequency</div>\n'
  + '</div>\n\n'
  + cardsHtml
  + '<div class="footer">easyChef Pro &nbsp;&middot;&nbsp; Digital Galactica Labs LLC &nbsp;&middot;&nbsp; Confidential &nbsp;&middot;&nbsp; Generated '
  + _h(genDate) + ' &nbsp;&middot;&nbsp; ops.dgl.dev &nbsp;&middot;&nbsp; &copy; 2026 Digital Galactica Labs LLC</div>\n\n'
  + '</body>\n</html>';
}


// ── HTML Email Sequences builder ──────────────────────────────────────────────
function _buildEmailSeqsHtml(brief, emails, genDate, emailBriefs) {
  emails      = Array.isArray(emails) ? emails : [];
  emailBriefs = emailBriefs || {};
  var _h = function(v) {
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  // Due-date defaults by sequence for PENDING placeholder
  var _DUE = { 'SEQ-1':'May 20', 'SEQ-2':'May 24', 'SEQ-3':'Jun 2', 'SEQ-4':'Jun 30', 'OB':'May 20' };

  // Group by sequence, sorted
  var seqMap = {}, seqOrder = [];
  emails.forEach(function(e) {
    var seq = (e.seq_id || '').replace(/-E\d+$/i, '') || e.sequence_code || 'OTHER';
    if (!seqMap[seq]) { seqMap[seq] = []; seqOrder.push(seq); }
    seqMap[seq].push(e);
  });
  seqOrder.sort();

  var seqsHtml = '';
  seqOrder.forEach(function(seq) {
    var seqEmails = seqMap[seq];
    seqsHtml += '<div class="seq-section">\n';
    // Deduplicate: one card per unique seq_id — merge A+B variant data into first occurrence
    var _seen = {}, _deduped = [];
    seqEmails.forEach(function(em) {
      var _key = em.seq_id || (seq + '-E' + (em.email_number || 1));
      if (!_seen.hasOwnProperty(_key)) {
        _seen[_key] = _deduped.length;
        _deduped.push(em);
      } else {
        var _ex = _deduped[_seen[_key]];
        if (!_ex.subject_line_b && em.subject_line_b) _ex.subject_line_b = em.subject_line_b;
        if (!_ex.subject_line_a && em.subject_line_a) _ex.subject_line_a = em.subject_line_a;
        if (!_ex.dl_id          && em.dl_id)          _ex.dl_id          = em.dl_id;
        if (!_ex.utm_url        && em.utm_url)         _ex.utm_url        = em.utm_url;
        if (!_ex.preview_text   && em.preview_text)    _ex.preview_text   = em.preview_text;
        if (!_ex.preview_text_a && em.preview_text_a)  _ex.preview_text_a = em.preview_text_a;
      }
    });
    seqsHtml += '  <div class="seq-header">' + _h(seq)
             + ' <span class="seq-count">' + _deduped.length + ' email' + (_deduped.length !== 1 ? 's' : '') + '</span></div>\n';
    _deduped.forEach(function(email) {
      var emailNum = email.email_number || (email.seq_id ? (parseInt((String(email.seq_id).match(/-E(\d+)$/i)||[])[1])||1) : 1);
      var dayLabel = email.send_day !== undefined ? email.send_day : '—';
      var subA     = email.subject_line_a || email.subject   || '';
      var subB     = email.subject_line_b || email.subject_b || '';
      var preA     = email.preview_text_a || email.preheader || '';
      var preB     = email.preview_text_b || '';
      var cta      = email.body_cta       || email.cta_text  || '';
      var ctaUrl   = email.cta_url        || '';
      // PENDING placeholder when copy is missing
      var seqBase  = seq.replace(/-E\d+.*$/, '');
      var dueDate  = (email.due_date && String(email.due_date).trim()) || _DUE[seqBase] || 'TBD';
      var pendTxt  = 'PENDING — copy due ' + dueDate;
      seqsHtml += '  <div class="email-card">\n';
      seqsHtml += '    <div class="email-card-header">' + _h(seq + '-E' + emailNum)
               + ' &nbsp;&middot;&nbsp; Day ' + _h(dayLabel) + ' &nbsp;&middot;&nbsp; ' + _h(email.funnel_stage || '') + '</div>\n';
      seqsHtml += '    <table><tbody>\n';
      // Subject A — always render row; show PENDING placeholder when blank
      seqsHtml += '      <tr><td class="td-label">Subject A</td><td class="td-value td-copy"><span class="badge badge-a">A</span> '
               + (subA ? _h(subA) : '<span class="td-pending">' + _h(pendTxt) + '</span>') + '</td></tr>\n';
      // Subject B — always render row; show PENDING placeholder when blank
      seqsHtml += '      <tr><td class="td-label">Subject B</td><td class="td-value td-copy"><span class="badge badge-b">B</span> '
               + (subB ? _h(subB) : '<span class="td-pending">' + _h(pendTxt) + '</span>') + '</td></tr>\n';
      // Preview — always render; uses single preview_text field with fallback to legacy
      var _previewText = email.preview_text || preA || preB || '';
      seqsHtml += '      <tr><td class="td-label">Preview</td><td class="td-value td-copy">'
        + (_previewText ? _h(_previewText) : '<span class="td-pending">' + _h(pendTxt) + '</span>')
        + '</td></tr>\n';
      // Step-by-step body rows
      var _hasSteps = email.step1_hook || email.body_hook || email.body_problem;
      if (email.step1_hook    || email.body_hook)    seqsHtml += '      <tr><td class="td-label td-dim">1 Hook</td><td class="td-value td-copy">'    + _h(email.step1_hook    || email.body_hook)    + '</td></tr>\n';
      if (email.step2_problem || email.body_problem) seqsHtml += '      <tr><td class="td-label td-dim">2 Problem</td><td class="td-value td-copy">' + _h(email.step2_problem || email.body_problem) + '</td></tr>\n';
      if (email.step3_agitate || email.body_agitate) seqsHtml += '      <tr><td class="td-label td-dim">3 Agitate</td><td class="td-value td-copy">' + _h(email.step3_agitate || email.body_agitate) + '</td></tr>\n';
      if (email.step4_solve   || email.body_solve)   seqsHtml += '      <tr><td class="td-label td-dim">4 Solve</td><td class="td-value td-copy">'   + _h(email.step4_solve   || email.body_solve)   + '</td></tr>\n';
      if (email.step5_value   || email.body_value)   seqsHtml += '      <tr><td class="td-label td-dim">5 Value</td><td class="td-value td-copy">'   + _h(email.step5_value   || email.body_value)   + '</td></tr>\n';
      if (email.step6_proof   || email.body_proof)   seqsHtml += '      <tr><td class="td-label td-dim">6 Proof</td><td class="td-value td-copy">'   + _h(email.step6_proof   || email.body_proof)   + '</td></tr>\n';
      if (!_hasSteps && email.body) seqsHtml += '      <tr><td class="td-label">Body</td><td class="td-value td-copy">' + _h(email.body) + '</td></tr>\n';
      // CTA with optional button label
      var _ctaText = email.step7_cta_text || cta || '';
      var _ctaBtn  = email.step7_cta_button || '';
      if (_ctaText) seqsHtml += '      <tr><td class="td-label td-dim">7 CTA</td><td class="td-value">'
        + _h(_ctaText)
        + (_ctaBtn ? ' &nbsp;<span class="badge badge-b">' + _h(_ctaBtn) + '</span>' : '')
        + (ctaUrl  ? ' <span class="td-url">&rarr; ' + _h(ctaUrl) + '</span>' : '')
        + '</td></tr>\n';
      // P.S.
      if (email.body_ps) seqsHtml += '      <tr><td class="td-label td-dim">P.S.</td><td class="td-value td-copy">' + _h(email.body_ps) + '</td></tr>\n';
      // DL ID and UTM Link — always render; show — when blank so they're never silently missing
      seqsHtml += '      <tr><td class="td-label">DL ID</td><td class="td-value">'
        + (email.dl_id ? _h(email.dl_id) : '<span class="td-pending">—</span>') + '</td></tr>\n';
      seqsHtml += '      <tr><td class="td-label">UTM Link</td><td class="td-value td-url">'
        + (email.utm_url ? _h(email.utm_url) : '<span class="td-pending">—</span>') + '</td></tr>\n';
      var st = email.status || 'draft';
      seqsHtml += '      <tr><td class="td-label">Status</td><td class="td-value"><span class="badge badge-' + _h(st) + '">' + _h(st.toUpperCase()) + '</span></td></tr>\n';
      var _eb = emailBriefs[email.seq_id || email.id] || {};
      if (_eb.design_brief) seqsHtml += '      <tr><td class="td-label td-brief-label">DESIGN BRIEF → FIGMA</td><td class="td-brief td-value">' + _h(_eb.design_brief) + '</td></tr>\n';
      seqsHtml += '    </tbody></table>\n  </div>\n';
    });
    seqsHtml += '</div>\n';
  });

  var css = '<style>\n'
  + '  * { margin:0; padding:0; box-sizing:border-box; }\n'
  + '  :root { --red:#FF0000; --black:#000000; --beige:#F6EFE8; --white:#FFFFFF; --gray:#666666; --body:#333333; --border:#DDDDDD; }\n'
  + '  body { font-family:\'Inter\',Arial,sans-serif; font-size:13px; color:var(--black); background:var(--white); padding:40px; max-width:900px; margin:0 auto; }\n'
  + '  .header { padding-bottom:16px; border-bottom:3px solid var(--red); margin-bottom:24px; }\n'
  + '  .logo { height:45px; width:auto; display:block; margin-bottom:16px; }\n'
  + '  .doc-title { font-family:\'Proza Libre\',serif; font-size:28px; font-weight:700; color:var(--black); margin-bottom:4px; }\n'
  + '  .doc-subtitle { font-family:\'Proza Libre\',serif; font-size:18px; font-weight:700; color:var(--red); margin-bottom:8px; }\n'
  + '  .doc-meta { font-size:12px; color:var(--gray); }\n'
  + '  .summary-bar { display:flex; gap:24px; background:var(--beige); border:1px solid var(--border); border-radius:4px; padding:12px 16px; margin-bottom:28px; }\n'
  + '  .summary-item { font-size:12px; color:var(--gray); }\n'
  + '  .summary-item strong { font-family:\'Proza Libre\',serif; font-size:20px; font-weight:700; color:var(--red); display:block; }\n'
  + '  .seq-section { margin-bottom:28px; }\n'
  + '  .seq-header { background:var(--black); color:var(--white); font-family:\'Inter\',sans-serif; font-size:12px; font-weight:600; letter-spacing:0.08em; padding:10px 16px; border-radius:3px 3px 0 0; }\n'
  + '  .seq-count { font-weight:400; opacity:0.65; }\n'
  + '  .email-card { border:1px solid var(--border); border-top:none; }\n'
  + '  .email-card:last-child { border-radius:0 0 3px 3px; }\n'
  + '  .email-card-header { background:var(--red); color:var(--white); font-family:\'Inter\',sans-serif; font-size:11px; font-weight:600; padding:7px 12px; }\n'
  + '  table { width:100%; border-collapse:collapse; }\n'
  + '  tbody tr:nth-child(odd)  { background:var(--white); }\n'
  + '  tbody tr:nth-child(even) { background:var(--beige); }\n'
  + '  tbody td { font-size:12px; padding:8px 12px; border:1px solid var(--border); vertical-align:top; }\n'
  + '  .td-label { font-weight:600; background:var(--beige)!important; width:18%; white-space:nowrap; color:var(--black); }\n'
  + '  .td-value { color:var(--body); }\n'
  + '  .td-copy  { font-style:italic; }\n'
  + '  .td-url   { font-family:monospace; font-size:11px; word-break:break-all; color:var(--gray); }\n'
  + '  .td-pending { color:#999; font-style:italic; }\n'
  + '  .td-dim { font-weight:400; color:var(--gray); font-size:11px; }\n'
  + '  .td-brief { background:#EEF4FB !important; white-space:pre-wrap; line-height:1.7; }\n'
  + '  .td-brief-label { background:#EEF4FB !important; color:#2C6DAA; font-weight:700; white-space:nowrap; }\n'
  + '  .badge { display:inline-block; padding:2px 7px; border-radius:3px; font-size:10px; font-weight:700; letter-spacing:0.05em; }\n'
  + '  .badge-a    { background:var(--red);   color:var(--white); }\n'
  + '  .badge-b    { background:var(--black); color:var(--white); }\n'
  + '  .badge-draft    { background:var(--beige); color:var(--gray); border:1px solid var(--border); }\n'
  + '  .badge-approved { background:#00A844; color:var(--white); }\n'
  + '  .badge-live     { background:var(--red); color:var(--white); }\n'
  + '  .footer { margin-top:40px; padding-top:12px; border-top:2px solid var(--red); font-size:11px; color:var(--gray); }\n'
  + '  @media print { .seq-section { page-break-inside:avoid; } }\n'
  + '</style>\n';

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
  + '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n'
  + '<title>easyChef Pro — Email Sequences</title>\n'
  + '<link href="https://fonts.googleapis.com/css2?family=Proza+Libre:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">\n'
  + css + '</head>\n<body>\n\n'
  + '<div class="header">\n'
  + '  <img class="logo" src="https://ops.dgl.dev/assets/EasyChefProHorizontal.jpg" alt="easyChef Pro">\n'
  + '  <div class="doc-title">Email Sequences</div>\n'
  + '  <div class="doc-subtitle">' + _h(brief.name) + '</div>\n'
  + '  <div class="doc-meta">' + _h(brief.id) + ' &nbsp;&middot;&nbsp; ' + _h(brief.icp) + ' &nbsp;&middot;&nbsp; Launch ' + _h(brief.launchDate) + '</div>\n'
  + '</div>\n\n'
  + '<div class="summary-bar">\n'
  + '  <div class="summary-item"><strong>' + emails.length + '</strong>Total Emails</div>\n'
  + '  <div class="summary-item"><strong>' + seqOrder.length + '</strong>Sequences</div>\n'
  + '  <div class="summary-item"><strong>' + _h(brief.email_sequences || seqOrder.length) + '</strong>SEQ Count</div>\n'
  + '  <div class="summary-item"><strong>A+B</strong>Variants / Email</div>\n'
  + '</div>\n\n'
  + seqsHtml
  + '<div class="footer">easyChef Pro &nbsp;&middot;&nbsp; Digital Galactica Labs LLC &nbsp;&middot;&nbsp; Confidential &nbsp;&middot;&nbsp; Generated '
  + _h(genDate) + ' &nbsp;&middot;&nbsp; ops.dgl.dev &nbsp;&middot;&nbsp; &copy; 2026 Digital Galactica Labs LLC</div>\n\n'
  + '</body>\n</html>';
}


// ── HTML Campaign Brief builder ───────────────────────────────────────────────
function _buildBriefHtml(brief, copy, dlEntries, genDate) {
  copy = copy || {};
  var _h = function(v) {
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };
  // FIX 5: ICP profile for summary rows (primary_pain, value_trigger, channel_affinity)
  var _icpProfile = null;
  try { _icpProfile = getIcpProfile(brief.icp_code || brief.icp || ''); } catch(ie) {}
  // FIX 2: All approved=TRUE claims from ApprovedClaims tab (replaces hardcoded 6)
  var _approvedClaims = [];
  try { _approvedClaims = getApprovedClaims(); } catch(ce) {}
  // ROOT CAUSE 1: campaign_angle / urgency_trigger / founding_offer may be stored
  // as JSON inside the notes column instead of top-level brief columns.
  // Read top-level first; fall back to notes JSON; fall back to ''.
  var _notesJson = {};
  try { if (brief.notes) _notesJson = JSON.parse(brief.notes); } catch(ne) {}
  var _campaignAngle    = brief.campaign_angle   || _notesJson.campaign_angle   || '';
  var _urgencyTrigger   = brief.urgency_trigger  || _notesJson.urgency_trigger  || '';
  var _foundingOffer    = brief.founding_offer   || _notesJson.founding_offer   || '';
  var _campaignDuration = brief.campaign_duration_days || String(_notesJson.campaign_duration || '') || '';
  var dlCount = Array.isArray(dlEntries) ? dlEntries.length : (parseInt(dlEntries) || 0);
  var _pfxMap = {};
  if (Array.isArray(dlEntries)) {
    dlEntries.forEach(function(u) {
      var parts = (u.dl_id || '').split('-');
      var pfx = parts.length >= 2 ? parts[1] : '';
      if (pfx) _pfxMap[pfx] = (_pfxMap[pfx] || 0) + 1;
    });
  }
  var _pfxSummary = Object.keys(_pfxMap).sort().map(function(p) {
    return p + '×' + _pfxMap[p];
  }).join(' · ') || '—';
  var _utmCampaignMap = {};
  if (Array.isArray(dlEntries)) {
    dlEntries.forEach(function(u) { if (u.utm_campaign) _utmCampaignMap[u.utm_campaign] = 1; });
  }
  var _utmCampaignStr = Object.keys(_utmCampaignMap).join(' · ') || '—';
  var chs  = Array.isArray(brief.channels) ? brief.channels.join(' · ') : (brief.channel || '');
  var seqN = String(brief.email_sequences || 4);

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
  + '<meta charset="UTF-8">\n'
  + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
  + '<title>easyChef Pro — Campaign Brief</title>\n'
  + '<link href="https://fonts.googleapis.com/css2?family=Proza+Libre:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">\n'
  + '<style>\n'
  + '  * { margin: 0; padding: 0; box-sizing: border-box; }\n'
  + '  :root { --red: #FF0000; --black: #000000; --beige: #F6EFE8; --white: #FFFFFF; --gray: #666666; --lgray: #F2F2F2; --border: #DDDDDD; }\n'
  + '  body { font-family: \'Inter\', Arial, sans-serif; font-size: 13px; color: var(--black); background: var(--white); padding: 40px; max-width: 900px; margin: 0 auto; }\n'
  + '  .header { padding-bottom: 16px; border-bottom: 3px solid var(--red); margin-bottom: 24px; }\n'
  + '  .logo { height: 45px; width: auto; display: block; margin-bottom: 16px; }\n'
  + '  .campaign-title { font-family: \'Proza Libre\', serif; font-size: 28px; font-weight: 700; color: var(--black); margin-bottom: 4px; }\n'
  + '  .campaign-subtitle { font-family: \'Proza Libre\', serif; font-size: 18px; font-weight: 700; color: var(--red); margin-bottom: 8px; }\n'
  + '  .campaign-meta { font-family: \'Inter\', sans-serif; font-size: 12px; color: var(--gray); }\n'
  + '  .campaign-meta .approved { color: var(--red); font-weight: 600; }\n'
  + '  .section-label { font-family: \'Inter\', sans-serif; font-size: 11px; font-weight: 600; color: var(--red); letter-spacing: 0.08em; text-transform: uppercase; margin: 28px 0 10px; }\n'
  + '  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }\n'
  + '  thead tr { background: var(--red); }\n'
  + '  thead th { font-family: \'Inter\', sans-serif; font-size: 11px; font-weight: 600; color: var(--white); text-align: left; padding: 8px 12px; border: 1px solid var(--red); }\n'
  + '  tbody tr:nth-child(odd) { background: var(--white); }\n'
  + '  tbody tr:nth-child(even) { background: var(--beige); }\n'
  + '  tbody td { font-family: \'Inter\', sans-serif; font-size: 12px; color: var(--black); padding: 8px 12px; border: 1px solid var(--border); vertical-align: top; }\n'
  + '  .td-label { font-weight: 600; background: var(--beige) !important; width: 28%; white-space: nowrap; }\n'
  + '  .td-value { width: 72%; }\n'
  + '  .td-copy { font-style: italic; }\n'
  + '  .footer { margin-top: 40px; padding-top: 12px; border-top: 2px solid var(--red); font-family: \'Inter\', sans-serif; font-size: 11px; color: var(--gray); }\n'
  + '  @media print { body { padding: 20px; } .section-label { page-break-before: auto; } }\n'
  + '</style>\n</head>\n<body>\n\n'
  // HEADER
  + '<div class="header">\n'
  + '  <img class="logo" src="https://ops.dgl.dev/assets/EasyChefProHorizontal.jpg" alt="easyChef Pro">\n'
  + '  <div class="campaign-title">Campaign Brief</div>\n'
  + '  <div class="campaign-subtitle">' + _h(brief.name) + '</div>\n'
  + '  <div class="campaign-meta">\n'
  + '    ' + _h(brief.id) + ' &nbsp;&middot;&nbsp; ' + _h(brief.icp) + ' &nbsp;&middot;&nbsp; Launch ' + _h(brief.launchDate) + ' &nbsp;&middot;&nbsp;\n'
  + '    <span class="approved">ML APPROVED</span>\n'
  + '  </div>\n'
  + '</div>\n\n'
  // 01 CAMPAIGN SETTINGS
  + '<div class="section-label">01 &mdash; Campaign Settings</div>\n'
  + '<table><tbody>\n'
  + '  <tr><td class="td-label">Campaign ID</td><td class="td-value">' + _h(brief.id) + '</td></tr>\n'
  + '  <tr><td class="td-label">Campaign Name</td><td class="td-value">' + _h(brief.name) + '</td></tr>\n'
  + '  <tr><td class="td-label">ICP</td><td class="td-value">' + _h(brief.icp_code || brief.icp) + '</td></tr>\n'
  + (function() {
      if (!_icpProfile) return '';
      var _pain  = String(_icpProfile.primary_pain || '');
      var _dotIdx = _pain.indexOf('.');
      var _painSentence = _dotIdx > 0 ? _pain.substring(0, _dotIdx + 1) : _pain;
      var _chAff = String(_icpProfile.channel_affinity || '');
      var _chFirst = _chAff ? _chAff.split(/[,|;]/)[0].trim() : '';
      return ''
        + '  <tr><td class="td-label">ICP Entry Moment</td><td class="td-value">' + _h(_painSentence) + '</td></tr>\n'
        + '  <tr><td class="td-label">ICP Value Trigger</td><td class="td-value">' + _h(_icpProfile.value_trigger || '') + '</td></tr>\n'
        + '  <tr><td class="td-label">ICP Primary Channel</td><td class="td-value">' + _h(_chFirst) + '</td></tr>\n';
    })()
  + '  <tr><td class="td-label">Theme</td><td class="td-value">' + _h(brief.theme) + '</td></tr>\n'
  + '  <tr><td class="td-label">Funnel Blueprint</td><td class="td-value">' + _h(brief.funnel) + '</td></tr>\n'
  + '  <tr><td class="td-label">Channels</td><td class="td-value">' + _h(chs) + '</td></tr>\n'
  + '  <tr><td class="td-label">Goal</td><td class="td-value">' + _h(brief.goal) + '</td></tr>\n'
  + '  <tr><td class="td-label">Landing Page</td><td class="td-value">' + _h(brief.slug) + '</td></tr>\n'
  + '  <tr><td class="td-label">Launch Date</td><td class="td-value">' + _h(brief.launchDate) + '</td></tr>\n'
  + '  <tr><td class="td-label">Campaign Angle</td><td class="td-value">' + (_campaignAngle ? _h(_campaignAngle) : '<span style="color:#FF0000;font-weight:600">NOT SET</span>') + '</td></tr>\n'
  + '  <tr><td class="td-label">Post Count</td><td class="td-value">' + _h(brief.post_count) + ' per platform &middot; ' + _h(brief.post_frequency) + '</td></tr>\n'
  + '  <tr><td class="td-label">Email Sequences</td><td class="td-value">SEQ-1 through SEQ-' + seqN + ' &middot; ' + seqN + ' DL_IDs</td></tr>\n'
  + '  <tr><td class="td-label">Email Variants</td><td class="td-value">A + B per email (A/B subject line test)</td></tr>\n'
  + '  <tr><td class="td-label">Urgency Trigger</td><td class="td-value">' + (_urgencyTrigger ? _h(_urgencyTrigger) : '<span style="color:#FF0000;font-weight:600">NOT SET</span>') + '</td></tr>\n'
  + (_foundingOffer ? '  <tr><td class="td-label">Founding Offer</td><td class="td-value">' + _h(_foundingOffer) + '</td></tr>\n' : '')
  + (_campaignDuration ? '  <tr><td class="td-label">Campaign Duration</td><td class="td-value">' + _h(_campaignDuration) + ' days</td></tr>\n' : '')
  + (function() {
      var _approved = brief.ml_approved === true || brief.ml_approved === 'true' || brief.ml_approved === 1 || brief.ml_approved === '1';
      return '  <tr><td class="td-label">Status</td><td class="td-value">'
        + (_approved ? '<span style="color:#00A844;font-weight:600">ACTIVE</span>' : 'DRAFT')
        + '</td></tr>\n';
    })()
  + '</tbody></table>\n\n'
  // 02 GENERATED COPY
  + '<div class="section-label">02 &mdash; Generated Copy</div>\n'
  + '<table><tbody>\n'
  + '  <tr><td class="td-label">Headline</td><td class="td-value td-copy">' + _h(copy.headline) + '</td></tr>\n'
  + '  <tr><td class="td-label">Subheadline</td><td class="td-value td-copy">' + _h(copy.subheadline) + '</td></tr>\n'
  + '  <tr><td class="td-label">LP Hero</td><td class="td-value td-copy">' + _h(copy.lp_hero) + '</td></tr>\n'
  + '  <tr><td class="td-label">Primary CTA</td><td class="td-value td-copy">' + _h(copy.cta_primary) + '</td></tr>\n'
  + '  <tr><td class="td-label">Email Subject A</td><td class="td-value td-copy">' + _h(copy.email_subject_a) + '</td></tr>\n'
  + '  <tr><td class="td-label">Email Subject B</td><td class="td-value td-copy">' + _h(copy.email_subject_b) + '</td></tr>\n'
  + '  <tr><td class="td-label">Social Hook</td><td class="td-value td-copy">' + _h(copy.social_hook) + '</td></tr>\n'
  + '  <tr><td class="td-label">Share Mechanic</td><td class="td-value td-copy">' + _h(copy.share_mechanic) + '</td></tr>\n'
  + '</tbody></table>\n\n'
  // 03 APPROVED CLAIMS — dynamic from ApprovedClaims tab (FIX 2)
  + '<div class="section-label">03 &mdash; Approved Claims in Use</div>\n'
  + '<table>\n'
  + '  <thead><tr><th>Claim Type</th><th>Approved Wording</th><th>Notes</th></tr></thead>\n'
  + '  <tbody>\n'
  + (_approvedClaims.length
      ? _approvedClaims.map(function(c) {
          return '    <tr><td>' + _h(c.claim_type) + '</td><td>' + _h(c.exact_wording) + '</td><td>' + _h(c.notes || '') + '</td></tr>\n';
        }).join('')
      : '    <tr><td colspan="3" style="color:#666;font-style:italic">No approved claims found — check ApprovedClaims tab</td></tr>\n'
    )
  + '  </tbody>\n'
  + '</table>\n\n'
  // 04 UTM CONFIGURATION
  + '<div class="section-label">04 &mdash; UTM Configuration</div>\n'
  + '<table><tbody>\n'
  + '  <tr><td class="td-label">utm_campaign</td><td class="td-value">' + _h(brief.id) + '</td></tr>\n'
  + '  <tr><td class="td-label">utm_medium (social)</td><td class="td-value">social</td></tr>\n'
  + '  <tr><td class="td-label">utm_medium (email)</td><td class="td-value">email</td></tr>\n'
  + '  <tr><td class="td-label">utm_medium (video)</td><td class="td-value">video</td></tr>\n'
  + '  <tr><td class="td-label">utm_content format</td><td class="td-value">DL-[PREFIX]-[NNNN]_[stage_descriptor]</td></tr>\n'
  + '  <tr><td class="td-label">DL_ID count</td><td class="td-value">' + _h(dlCount) + ' ACTIVE &middot; ' + _h(_pfxSummary) + '</td></tr>\n'
  + '</tbody></table>\n\n'
  // 05 A/B TEST CONFIGURATION (FIX 4)
  + '<div class="section-label">05 &mdash; A/B Test Configuration</div>\n'
  + '<table><tbody>\n'
  + (function() {
      var _ab = brief.ab_test === true || brief.ab_test === 'true' || brief.ab_test === 1;
      if (!_ab) return '  <tr><td class="td-label">Status</td><td class="td-value" style="color:#666;font-style:italic">Not configured</td></tr>\n';
      return ''
        + '  <tr><td class="td-label">A/B Test</td><td class="td-value"><span style="color:#00A844;font-weight:600">ACTIVE</span></td></tr>\n'
        + '  <tr><td class="td-label">Tool</td><td class="td-value">' + _h(brief.ab_tool || 'Convert.com') + '</td></tr>\n'
        + '  <tr><td class="td-label">Experiment ID</td><td class="td-value">' + _h(brief.ab_experiment_id || '') + '</td></tr>\n'
        + '  <tr><td class="td-label">Split</td><td class="td-value">' + _h(brief.ab_split || '50/50') + '</td></tr>\n'
        + '  <tr><td class="td-label">LP Variant A</td><td class="td-value">' + _h(brief.lp_slug_a || '') + '</td></tr>\n'
        + '  <tr><td class="td-label">LP Variant B</td><td class="td-value">' + _h(brief.lp_slug_b || '') + '</td></tr>\n';
    })()
  + '</tbody></table>\n\n'
  // FOOTER
  + '<div class="footer">\n'
  + '  easyChef Pro &nbsp;&middot;&nbsp; Digital Galactica Labs LLC &nbsp;&middot;&nbsp; Confidential &nbsp;&middot;&nbsp;\n'
  + '  Generated ' + _h(genDate) + ' &nbsp;&middot;&nbsp; ops.dgl.dev &nbsp;&middot;&nbsp; &copy; 2026 Digital Galactica Labs LLC\n'
  + '</div>\n\n'
  + '</body>\n</html>';
}

// ── Test: log what each email XLSX row would contain — no Drive writes, no API calls ──
// To use: open Apps Script editor → select testEmailCalendarRow → Run → view Execution log
function testEmailCalendarRow() {
  var campaignId = 'EC-2026-001'; // ← CHANGE to your campaign ID

  Logger.log('=== testEmailCalendarRow: ' + campaignId + ' ===');

  var emails = getEmailSequences(campaignId);
  Logger.log('Emails in sheet: ' + emails.length);
  if (!emails.length) { Logger.log('No emails found — check EmailSequences tab, campaign_id column'); return; }

  // Show every field name on the first email object so we know what the schema returns
  Logger.log('Fields on email object: ' + JSON.stringify(Object.keys(emails[0])));
  Logger.log('subject_line   read from EmailSequences: ' + emails[0].subject_line);
  Logger.log('preview_text   read from EmailSequences: ' + (emails[0].preview_text || '(blank)').substring(0,80));
  Logger.log('body_cta       read from EmailSequences: ' + (emails[0].body_cta || '(blank)'));
  Logger.log('funnel_stage   read from EmailSequences: ' + (emails[0].funnel_stage || '(blank)'));
  Logger.log('dl_id          read from EmailSequences: ' + (emails[0].dl_id !== undefined ? emails[0].dl_id || '(blank)' : '(field not in schema)'));
  Logger.log('---');

  // LP URL — from brief slug (CampaignBriefs tab)
  var _brief = null;
  try { _brief = getCampaignBriefs(campaignId); } catch(e) {}
  var _briefSlug = (_brief && _brief.slug) || '';
  var _lpUrl = _briefSlug ? _buildLpUrl(_briefSlug) : '';
  if (_lpUrl) Logger.log('LP URL         read from CampaignBriefs.slug=' + _briefSlug + ': ' + _lpUrl);
  else        Logger.log('LP URL         WARNING: No slug on CampaignBriefs — LP URL will be blank');

  // Email UTM source + medium — from Channels tab
  var _emailUtmSource = '', _emailUtmMedium = '';
  try {
    var _allCh = getChannels();
    var _eCh   = null;
    _allCh.forEach(function(ch) {
      if ((ch.name||'').toLowerCase() === 'email' || (ch.slug_code||'').toLowerCase() === 'email') _eCh = ch;
    });
    if (_eCh) {
      _emailUtmSource = _eCh.utm_source || '';
      _emailUtmMedium = _eCh.utm_medium || '';
      Logger.log('utm_source     read from Channels tab (email row): ' + _emailUtmSource);
      Logger.log('utm_medium     read from Channels tab (email row): ' + _emailUtmMedium);
    } else {
      Logger.log('utm_source     WARNING: Email row not found in Channels tab');
    }
  } catch(e) { Logger.log('Channels tab   ERROR: ' + e.message); }

  // DL map — from DeepLinkRegistry tab
  var _emailDlMap = {};
  try {
    var allDls  = getDlRegistry(campaignId);
    var emailDls = allDls.filter(function(u) { return /^DL-EM/i.test(u.dl_id || ''); });
    Logger.log('DL-EM entries  read from DeepLinkRegistry: ' + emailDls.length + (emailDls.length===0 ? ' — run fcGenerateUtmAndSave first' : ''));
    emailDls.forEach(function(dl, i) {
      Logger.log('  [' + i + '] dl_id=' + dl.dl_id + '  notes=' + (dl.notes||'') + '  utm_content=' + (dl.utm_content||''));
      var _m = String(dl.notes || dl.utm_content || '').match(/SEQ-\d+/i);
      if (_m) _emailDlMap[_m[0].toUpperCase()] = dl;
    });
    if (emailDls.length > 0 && !Object.keys(_emailDlMap).length) {
      ['SEQ-1','SEQ-2','SEQ-3','SEQ-4'].forEach(function(seq, i) { if (emailDls[i]) _emailDlMap[seq] = emailDls[i]; });
      Logger.log('DL map         positional fallback (notes had no SEQ-N match): ' + JSON.stringify(Object.keys(_emailDlMap)));
    }
  } catch(e) { Logger.log('DeepLinkRegistry ERROR: ' + e.message); }

  var _EDAYS = { 'SEQ-1':[0,3,7],'SEQ-2':[7,10,14,18,25],'SEQ-3':[22,25,28,31],'SEQ-4':[35] };

  // Pair A and B variants — same logic as the XLSX builder
  var _emailGroups = {}, _emailOrder = [];
  emails.forEach(function(e) {
    var baseId = String(e.id || '').replace(/[-_][AB]$/i, '') || (e.sequence_code + '-E' + (e.email_number||1));
    if (!_emailGroups[baseId]) { _emailGroups[baseId] = {a:null,b:null}; _emailOrder.push(baseId); }
    if (/[-_]B$/i.test(String(e.id||''))) _emailGroups[baseId].b = e;
    else                                   _emailGroups[baseId].a = e;
  });
  Logger.log('Unique email pairs: ' + _emailOrder.length + ' (expected: ' + (emails.length/2) + ')');

  // Show first pair from each sequence
  var _seenSeqs = {}, _shown = 0;
  Logger.log('=== XLSX column preview — first pair per sequence ===');
  _emailOrder.forEach(function(baseId) {
    var pair = _emailGroups[baseId];
    var eRef = pair.a || pair.b;
    if (!eRef) return;
    var seqCode  = eRef.sequence_code || 'EMAIL';
    if (_seenSeqs[seqCode]) return; // one pair per sequence for the preview
    _seenSeqs[seqCode] = true;
    _shown++;
    var emailNum = parseInt(eRef.email_number) || 1;
    var days     = _EDAYS[seqCode];
    var day      = (days && days[emailNum-1] !== undefined) ? days[emailNum-1] : (parseInt(eRef.send_day)||0);
    var subA     = String((pair.a && pair.a.subject_line) || '(BLANK)');
    var subB     = String((pair.b && pair.b.subject_line) || 'None');
    var preA     = String(eRef.preview_text || eRef.preheader || '(BLANK)').substring(0,80);
    var _isFirst = (emailNum===1 && seqCode==='SEQ-1');
    var cta      = String(eRef.body_cta || eRef.cta || (_isFirst?'Claim your founding spot':'(BLANK)'));
    var _dlEntry = _emailDlMap[seqCode] || null;
    var dlId     = String(eRef.dl_id || (_dlEntry ? _dlEntry.dl_id : '') || '');
    var dlSrc    = eRef.dl_id ? 'EmailSequences tab' : (_dlEntry ? 'DeepLinkRegistry tab' : 'BLANK — run fcGenerateUtmAndSave');
    var utmUrl   = String(eRef.utm_url || '');
    if (!utmUrl && dlId && _lpUrl && _emailUtmSource) {
      utmUrl = _lpUrl +
        '?utm_source=' + encodeURIComponent(_emailUtmSource) +
        '&utm_medium=' + encodeURIComponent(_emailUtmMedium) +
        '&utm_campaign=' + encodeURIComponent(campaignId) +
        '&utm_content=' + encodeURIComponent(dlId + '_' + seqCode + '_cta');
    }
    Logger.log('[' + seqCode + '-E' + emailNum + ' Day ' + day + ']');
    Logger.log('  Subject/Hook A  read from EmailSequences: ' + subA);
    Logger.log('  Subject/Hook B  read from EmailSequences: ' + subB);
    Logger.log('  Preview/Body    read from EmailSequences: ' + preA);
    Logger.log('  CTA Text        read from EmailSequences: ' + cta);
    Logger.log('  DL ID           read from ' + dlSrc + ': ' + (dlId || '(blank)'));
    Logger.log('  UTM URL         built from LP slug + Channels tab: ' + (utmUrl || '(blank — DL ID or LP slug missing)'));
    // Design Brief column — what the XLSX row will show
    var _sheetBrief = String(eRef.design_brief || '');
    var _computedBrief = (function() {
      var hdr = 'EMAIL BRIEF · ' + seqCode + ' E' + emailNum + ' A';
      var lines = [hdr];
      if (eRef.subject_angle) lines.push('Subject angle: ' + eRef.subject_angle);
      if (eRef.body_theme)    lines.push('Body theme: '    + eRef.body_theme);
      if (eRef.funnel_stage)  lines.push('Funnel stage: '  + eRef.funnel_stage);
      if (eRef.trigger_event) lines.push('Trigger: '       + eRef.trigger_event);
      if (eRef.body_hook)     lines.push('Hook: '          + String(eRef.body_hook).substring(0, 80));
      if (eRef.body_cta)      lines.push('CTA: '           + eRef.body_cta);
      return lines.join(' | ');
    })();
    var _finalBrief = _sheetBrief || _computedBrief;
    Logger.log('  Design Brief    source: ' + (_sheetBrief ? 'EmailSequences.design_brief (sheet-stored)' : '_mkBrief() built from fields'));
    Logger.log('  Design Brief    value:  ' + (_finalBrief || '(BLANK — no fields populated)').substring(0, 200));
  });
  Logger.log('=== Done — ' + _shown + ' sequences shown ===');
}

// ── Helper: look up hashtag_suggestions for a platform from the Channels tab ──
function _channelHashtags(platform) {
  try {
    var channels = getChannels();
    var key = (platform || '').toLowerCase();
    for (var i = 0; i < channels.length; i++) {
      if ((channels[i].name || '').toLowerCase() === key) {
        return channels[i].hashtag_suggestions || '';
      }
    }
  } catch(e) { Logger.log('[_channelHashtags] ' + e.message); }
  return '';
}

// ── Test: log hashtag resolution for IG/TK/PT posts — no API calls ──
// To use: open Apps Script editor → select testSocialHashtagRow → Run → view Execution log
function testSocialHashtagRow() {
  const campaignId = 'EC-2026-001';
  const posts = getSocialPosts(campaignId);
  const igPosts = posts.filter(p => p.platform === 'Instagram').slice(0,3);
  const tkPosts = posts.filter(p => p.platform === 'TikTok').slice(0,2);
  const ptPosts = posts.filter(p => p.platform === 'Pinterest').slice(0,2);
  Logger.log('=== testSocialHashtagRow: ' + campaignId + ' ===');
  Logger.log('IG posts: ' + igPosts.length + '  TK posts: ' + tkPosts.length + '  PT posts: ' + ptPosts.length);
  [...igPosts, ...tkPosts, ...ptPosts].forEach(p => {
    const hashtags = p.hashtags || _channelHashtags(p.platform) || '';
    Logger.log(p.platform + ' | ' + (p.funnel_stage||'(no stage)') + ' | hashtags: ' + (hashtags || 'BLANK'));
  });
  Logger.log('=== Done ===');
}
