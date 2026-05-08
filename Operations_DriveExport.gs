// ─────────────────────────────────────────────────────────────────────────────
// Operations_DriveExport.gs
//
// Creates a Google Drive folder workspace for an approved campaign.
// Five files per campaign:
//   00 — Campaign Brief     (Google Doc, branded)
//   01 — Social Posts       (Google Doc, branded)
//   02 — Email Sequences    (Google Doc, branded)
//   03 — LP Brief           (Google Doc, branded)
//   04 — Campaign Calendar  (Google Sheet — same columns as CSV export)
//
// Called via action='export_to_drive' in doPost.
// ─────────────────────────────────────────────────────────────────────────────

var _CAMPAIGNS_ROOT_NAME = 'easyChef Pro Campaigns';
var _CAMPAIGNS_ROOT_ID   = '1OUu2k1Iv-6nk1APO3sF3qm217YV3sGJf';

var _BRAND_RED   = '#C00000';
var _BRAND_WHITE = '#FFFFFF';
var _BRAND_BEIGE = '#F6EFE8';
var _BRAND_DARK  = '#1A1A1A';
var _BRAND_GREY  = '#888888';
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

    // ── 2. 00 — Campaign Brief ──────────────────────────────────────────────
    Logger.log('[DriveExport] Section 2: Campaign Brief');
    try {
      var briefDoc  = _newDoc('00 — Campaign Brief', folder);
      var briefBody = briefDoc.getBody();
      briefBody.clear();
      _docBrandHeader(briefBody, brief.name || brief.id || '', brief.launchDate);
      _dh1(briefBody, 'Campaign Brief');
      _dpair(briefBody, 'Campaign ID',      brief.id             || '');
      _dpair(briefBody, 'Campaign Name',    brief.name           || '');
      _dpair(briefBody, 'ICP',              brief.icp            || '');
      _dpair(briefBody, 'Theme',            brief.theme          || '');
      _dpair(briefBody, 'Funnel Blueprint', brief.funnel         || '');
      _dpair(briefBody, 'Channels',         Array.isArray(brief.channels) ? brief.channels.join(', ') : (brief.channel || ''));
      _dpair(briefBody, 'Goal',             brief.goal           || '');
      _dpair(briefBody, 'Slug',             brief.slug           || '');
      _dpair(briefBody, 'Launch Date',      brief.launchDate     || '');
      _dpair(briefBody, 'Campaign Angle',   brief.campaign_angle || '');
      _dpair(briefBody, 'Urgency Trigger',  brief.urgency_trigger|| '');
      _dpair(briefBody, 'Post Count',       String(brief.post_count || 7));
      _dpair(briefBody, 'Post Frequency',   brief.post_frequency || '');
      _dpair(briefBody, 'Email Sequences',  String(brief.email_sequences || 4));
      _dpair(briefBody, 'Email Variants',   String(brief.email_variants  || 2));
      _dpair(briefBody, 'ML Approved',      (brief.ml_approved || brief.approved) ? 'YES' : 'NO');
      _dpair(briefBody, 'Status',           brief.status || 'draft');
      if (copy.headline || copy.lp_hero) {
        briefBody.appendParagraph('');
        _dh2(briefBody, 'Generated Copy');
        if (copy.headline)        _dpair(briefBody, 'Headline',        copy.headline);
        if (copy.subheadline)     _dpair(briefBody, 'Subheadline',     copy.subheadline);
        if (copy.lp_hero)         _dpair(briefBody, 'LP Hero',         copy.lp_hero);
        if (copy.cta_primary)     _dpair(briefBody, 'Primary CTA',     copy.cta_primary);
        if (copy.email_subject_a) _dpair(briefBody, 'Email Subject A', copy.email_subject_a);
        if (copy.email_subject_b) _dpair(briefBody, 'Email Subject B', copy.email_subject_b);
        if (copy.social_hook)     _dpair(briefBody, 'Social Hook',     copy.social_hook);
        if (copy.share_mechanic)  _dpair(briefBody, 'Share Mechanic',  copy.share_mechanic);
        if (copy.founding_offer)  _dpair(briefBody, 'Founding Offer',  copy.founding_offer);
        if (Array.isArray(copy.proof_bar) && copy.proof_bar.length) {
          _dpair(briefBody, 'Proof Bar', copy.proof_bar.join('  ·  '));
        }
      }
      _docBrandFooter(briefBody);
      briefDoc.saveAndClose();
      docUrls.brief = 'https://docs.google.com/document/d/' + briefDoc.getId() + '/view';
    } catch(e) { Logger.log('[DriveExport] brief doc error: ' + e.message); }

    // ── 3. 01 — Social Posts ────────────────────────────────────────────────
    Logger.log('[DriveExport] Section 3: Social Posts (' + posts.length + ')');
    try {
      if (posts.length > 0) {
        var postsDoc  = _newDoc('01 — Social Posts', folder);
        var postsBody = postsDoc.getBody();
        postsBody.clear();
        _docBrandHeader(postsBody, brief.name || '', brief.launchDate);
        _dh1(postsBody, 'Social Posts');
        posts.forEach(function(post, i) {
          postsBody.appendParagraph('');
          _dh2(postsBody, 'Post ' + (post.post_num || (i + 1)) + ' — ' + (post.platform || post.channel || '') + ' · ' + (post.theme || ''));
          _dpair(postsBody, 'Channel',      post.channel      || post.platform || '');
          _dpair(postsBody, 'Day',          String(post.scheduled_day !== undefined ? post.scheduled_day : (i + 1)));
          _dpair(postsBody, 'Stage',        post.funnel_stage || post.theme || '');
          if (post.dl_id)  _dpair(postsBody, 'DL ID',       post.dl_id);
          if (post.utm_url)_dpair(postsBody, 'UTM Link',    post.utm_url);
          _dpair(postsBody, 'Hook',         post.hook        || '');
          _docBodyPara(postsBody, post.body_copy || post.body || '');
          if (post.hashtags)    _dpair(postsBody, 'Hashtags',    post.hashtags);
          if (post.cta)         _dpair(postsBody, 'CTA',         post.cta);
          if (post.image_brief) _dpair(postsBody, 'Image Brief', post.image_brief);
          _docDivider(postsBody);
        });
        _docBrandFooter(postsBody);
        postsDoc.saveAndClose();
        docUrls.posts = 'https://docs.google.com/document/d/' + postsDoc.getId() + '/view';
      }
    } catch(e) { Logger.log('[DriveExport] posts doc error: ' + e.message); }

    // ── 4. 02 — Email Sequences ─────────────────────────────────────────────
    Logger.log('[DriveExport] Section 4: Email Sequences (' + emails.length + ')');
    try {
      if (emails.length > 0) {
        var emailDoc  = _newDoc('02 — Email Sequences', folder);
        var emailBody = emailDoc.getBody();
        emailBody.clear();
        _docBrandHeader(emailBody, brief.name || '', brief.launchDate);
        _dh1(emailBody, 'Email Sequences');
        var seqMap = {};
        emails.forEach(function(e) {
          var seq = (e.seq_id || '').replace(/-E\d+$/i, '') || e.sequence_code || 'OTHER';
          if (!seqMap[seq]) seqMap[seq] = [];
          seqMap[seq].push(e);
        });
        Object.keys(seqMap).sort().forEach(function(seq) {
          emailBody.appendParagraph('');
          _dh2(emailBody, seq);
          seqMap[seq].forEach(function(email) {
            emailBody.appendParagraph('');
            var label = (email.seq_id || seq + '-E' + (email.email_number || '?')) + '  ·  Day ' + (email.send_day !== undefined ? email.send_day : '?');
            var lp = emailBody.appendParagraph(label);
            var _la = {};
            _la[DocumentApp.Attribute.FONT_FAMILY]      = 'Arial';
            _la[DocumentApp.Attribute.FONT_SIZE]        = 10;
            _la[DocumentApp.Attribute.BOLD]             = true;
            _la[DocumentApp.Attribute.FOREGROUND_COLOR] = _BRAND_DARK;
            lp.setAttributes(_la);
            var subA = email.subject_line_a || email.subject   || '';
            var subB = email.subject_line_b || email.subject_b || '';
            var preA = email.preview_text_a || email.preheader || '';
            var preB = email.preview_text_b || '';
            _dpair(emailBody, 'Subject A',    subA);
            if (subB)  _dpair(emailBody, 'Subject B',    subB);
            if (preA)  _dpair(emailBody, 'Preview A',    preA);
            if (preB)  _dpair(emailBody, 'Preview B',    preB);
            emailBody.appendParagraph('');
            _docBodyPara(emailBody, email.body || '');
            if (email.body_cta || email.cta_text) {
              _dpair(emailBody, 'CTA', (email.body_cta || email.cta_text) + (email.cta_url ? ' → ' + email.cta_url : ''));
            }
            _docDivider(emailBody);
          });
        });
        _docBrandFooter(emailBody);
        emailDoc.saveAndClose();
        docUrls.emails = 'https://docs.google.com/document/d/' + emailDoc.getId() + '/view';
      }
    } catch(e) { Logger.log('[DriveExport] email doc error: ' + e.message); }

    // ── 5. 03 — LP Brief ────────────────────────────────────────────────────
    Logger.log('[DriveExport] Section 5: LP Brief');
    try {
      if (lp && (lp.hero_headline || lp.slug || lp.solve_section)) {
        var lpDoc  = _newDoc('03 — LP Brief', folder);
        var lpBody = lpDoc.getBody();
        lpBody.clear();
        _docBrandHeader(lpBody, brief.name || '', brief.launchDate);
        _dh1(lpBody, 'Landing Page Brief');
        _dpair(lpBody, 'URL',   'https://easychefpro.com/' + (lp.slug || brief.slug || ''));
        _dpair(lpBody, 'Slug',  lp.slug            || brief.slug || '');
        _dpair(lpBody, 'ICP',   lp.icp             || brief.icp  || '');
        _dpair(lpBody, 'Theme', lp.theme           || brief.theme|| '');
        lpBody.appendParagraph('');
        _dh2(lpBody, 'Hero');
        _dpair(lpBody, 'Headline',    lp.hero_headline    || '');
        _dpair(lpBody, 'Subheadline', lp.hero_subheadline || '');
        _dpair(lpBody, 'CTA',         lp.cta_primary || lp.hero_cta || '');
        lpBody.appendParagraph('');
        _dh2(lpBody, 'Sections');
        if (lp.problem_section)  _dpair(lpBody, 'Problem',     lp.problem_section);
        if (lp.agitate_section)  _dpair(lpBody, 'Agitate',     lp.agitate_section);
        if (lp.solve_section)    _dpair(lpBody, 'Solve',       lp.solve_section);
        if (lp.social_proof)     _dpair(lpBody, 'Social Proof',lp.social_proof);
        if (lp.proof_items) {
          _dpair(lpBody, 'Proof Bar', Array.isArray(lp.proof_items) ? lp.proof_items.join('  ·  ') : lp.proof_items);
        }
        lpBody.appendParagraph('');
        _docBodyPara(lpBody, 'Handoff Note: Verify slug is live in Webflow before activating UTMs.');
        _docBrandFooter(lpBody);
        lpDoc.saveAndClose();
        docUrls.lp = 'https://docs.google.com/document/d/' + lpDoc.getId() + '/view';
      }
    } catch(e) { Logger.log('[DriveExport] lp doc error: ' + e.message); }

    // ── 6. 04 — Campaign Calendar (matches CSV export format) ───────────────
    try {
      Logger.log('[DriveExport] Section 6: Campaign Calendar spreadsheet');
      var calSS   = SpreadsheetApp.create('04 — Campaign Calendar — ' + safeName);
      var calFile = DriveApp.getFileById(calSS.getId());
      calFile.moveTo(folder);
      try { calFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) {}
      var calSh = calSS.getActiveSheet();
      calSh.setName('Calendar');

      var _CAL_HDR  = ['Day','Scheduled Date/Time','Week','Funnel Stage','Type','Platform','Subject / Hook','Preview / Body','CTA URL','Image Brief','Hashtags','Status'];
      var _SEQ_OFF  = { 'SEQ-1':0, 'SEQ-2':0, 'SEQ-3':28, 'SEQ-4':42, 'SEQ-5':0 };
      var _launch   = brief.launchDate ? new Date(brief.launchDate + 'T12:00:00') : null;

      var _wkLbl = function(day) {
        if (day >= 48) return 'Launch Day';
        if (day >= 25) return 'Weeks 4–6 Launch Countdown';
        if (day >= 7)  return 'Weeks 2–3 Email Nurture';
        return 'Week 1 Social Arc';
      };
      var _dtStr = function(day) {
        if (!_launch) return '';
        var d = new Date(_launch);
        d.setDate(d.getDate() + day);
        return (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear() + ' 08:00';
      };

      var dataRows = [];

      // Email rows — A variant, then B variant if subject differs
      emails.forEach(function(e) {
        var seqCode  = e.sequence_code || (e.seq_id ? String(e.seq_id).replace(/-E\d+$/i,'') : 'EMAIL');
        var emailNum = e.email_number  || (e.seq_id ? (parseInt((String(e.seq_id).match(/-E(\d+)$/i)||[])[1])||1) : 1);
        var day      = (parseInt(e.send_day)||0) + (_SEQ_OFF[seqCode]||0);
        var subA     = e.subject_line_a || e.subject   || '';
        var subB     = e.subject_line_b || '';
        var preA     = e.preview_text_a || e.preheader || '';
        var preB     = e.preview_text_b || '';
        var cta      = e.body_cta       || e.cta_text  || '';
        dataRows.push([day, _dtStr(day), _wkLbl(day), e.funnel_stage||'', seqCode+'-E'+emailNum+' (A)', 'Email', subA, preA, cta, '', '', e.status||'draft']);
        if (subB) dataRows.push([day, _dtStr(day), _wkLbl(day), e.funnel_stage||'', seqCode+'-E'+emailNum+' (B)', 'Email', subB, preB, cta, '', '', e.status||'draft']);
      });

      // Social post rows
      posts.forEach(function(p) {
        var pday = parseInt(p.scheduled_day) || 0;
        dataRows.push([pday, _dtStr(pday), _wkLbl(pday), p.theme||'', 'Social', p.platform||p.channel||'', p.hook||'', p.body_copy||p.body||'', p.utm_url||'', p.image_brief||'', p.hashtags||'', p.status||'draft']);
      });

      // Sort by day
      dataRows.sort(function(a, b) { return (parseInt(a[0])||0) - (parseInt(b[0])||0); });

      var allRows = [_CAL_HDR].concat(dataRows);
      var numRows = allRows.length;
      var numCols = _CAL_HDR.length;

      if (numRows > 0) {
        calSh.getRange(1, 1, numRows, numCols).setValues(allRows);
      }

      // Header row: red background, white bold Arial
      var hdrRange = calSh.getRange(1, 1, 1, numCols);
      hdrRange.setBackground(_BRAND_RED);
      hdrRange.setFontColor(_BRAND_WHITE);
      hdrRange.setFontWeight('bold');
      hdrRange.setFontFamily('Arial');
      hdrRange.setFontSize(10);
      hdrRange.setVerticalAlignment('middle');
      calSh.setFrozenRows(1);

      // Alternating data rows: white (#FFFFFF) and beige (#F6EFE8)
      if (dataRows.length > 0) {
        for (var ri = 0; ri < dataRows.length; ri++) {
          var rowRange = calSh.getRange(ri + 2, 1, 1, numCols);
          rowRange.setBackground(ri % 2 === 0 ? _BRAND_WHITE : _BRAND_BEIGE);
          rowRange.setFontFamily('Arial');
          rowRange.setFontSize(9);
          rowRange.setFontColor(_BRAND_BODY);
        }
      }

      // Auto-resize all columns
      calSh.autoResizeColumns(1, numCols);
      // Apply min widths for readability after auto-resize
      var _minWidths = [40, 140, 160, 90, 120, 90, 240, 260, 240, 180, 110, 65];
      _minWidths.forEach(function(minW, ci) {
        if (calSh.getColumnWidth(ci + 1) < minW) calSh.setColumnWidth(ci + 1, minW);
      });

      docUrls.calendar = 'https://docs.google.com/spreadsheets/d/' + calSS.getId() + '/view';
      Logger.log('[DriveExport] calendar: ' + numRows + ' rows (' + emails.length + ' emails / ' + posts.length + ' posts)');
    } catch(e) { Logger.log('[DriveExport] calendar error: ' + e.message); }

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
