// ─────────────────────────────────────────────────────────────────────────────
// Operations_DriveExport.gs
//
// Creates a Google Drive folder workspace for an approved campaign.
// Five files per campaign:
//   00 — Campaign Brief     (HTML file, browser-renderable)
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

    // ── 2. 00 — Campaign Brief (HTML file) ─────────────────────────────────────
    Logger.log('[DriveExport] Section 2: Campaign Brief HTML');
    try {
      var _genDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM d, yyyy');
      var _dlCount = (function() {
        var seen = {};
        posts.forEach(function(p)  { if (p.dl_id)  seen[p.dl_id]  = 1; });
        emails.forEach(function(e) { if (e.dl_id)  seen[e.dl_id]  = 1; });
        return Object.keys(seen).length;
      })();
      var briefHtml = _buildBriefHtml(brief, copy, _dlCount, _genDate);
      var briefFile = DriveApp.createFile('00 — Campaign Brief.html', briefHtml, MimeType.HTML);
      briefFile.moveTo(folder);
      try { briefFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) {}
      docUrls.brief = briefFile.getUrl();
      Logger.log('[DriveExport] brief html: ' + briefFile.getId());
    } catch(e) { Logger.log('[DriveExport] brief html error: ' + e.message); }

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

// ── HTML Campaign Brief builder ───────────────────────────────────────────────
function _buildBriefHtml(brief, copy, dlCount, genDate) {
  copy = copy || {};
  var _h = function(v) {
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };
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
  + '  <tr><td class="td-label">ICP</td><td class="td-value">' + _h(brief.icp) + '</td></tr>\n'
  + '  <tr><td class="td-label">Theme</td><td class="td-value">' + _h(brief.theme) + '</td></tr>\n'
  + '  <tr><td class="td-label">Funnel Blueprint</td><td class="td-value">' + _h(brief.funnel) + '</td></tr>\n'
  + '  <tr><td class="td-label">Channels</td><td class="td-value">' + _h(chs) + '</td></tr>\n'
  + '  <tr><td class="td-label">Goal</td><td class="td-value">' + _h(brief.goal) + '</td></tr>\n'
  + '  <tr><td class="td-label">Landing Page</td><td class="td-value">' + _h(brief.slug) + '</td></tr>\n'
  + '  <tr><td class="td-label">Launch Date</td><td class="td-value">' + _h(brief.launchDate) + '</td></tr>\n'
  + '  <tr><td class="td-label">Campaign Angle</td><td class="td-value">' + _h(brief.campaign_angle) + '</td></tr>\n'
  + '  <tr><td class="td-label">Post Count</td><td class="td-value">' + _h(brief.post_count) + ' per platform &middot; ' + _h(brief.post_frequency) + '</td></tr>\n'
  + '  <tr><td class="td-label">Email Sequences</td><td class="td-value">SEQ-1 through SEQ-' + seqN + ' &middot; ' + seqN + ' DL_IDs</td></tr>\n'
  + '  <tr><td class="td-label">Email Variants</td><td class="td-value">A + B per email (A/B subject line test)</td></tr>\n'
  + '  <tr><td class="td-label">Urgency Trigger</td><td class="td-value">' + _h(brief.urgency_trigger) + '</td></tr>\n'
  + '  <tr><td class="td-label">Status</td><td class="td-value">' + _h((brief.status || 'draft').toUpperCase()) + '</td></tr>\n'
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
  // 03 APPROVED CLAIMS
  + '<div class="section-label">03 &mdash; Approved Claims in Use</div>\n'
  + '<table>\n'
  + '  <thead><tr><th>Claim</th><th>Approved Wording</th><th>Use In</th></tr></thead>\n'
  + '  <tbody>\n'
  + '    <tr><td>Annual savings</td><td>$1,336/year</td><td>All channels</td></tr>\n'
  + '    <tr><td>Fridge to table</td><td>30 minutes</td><td>All channels</td></tr>\n'
  + '    <tr><td>Recipe pages</td><td>10,000 recipe pages at launch</td><td>Proof stage</td></tr>\n'
  + '    <tr><td>Product database</td><td>800,000 products</td><td>Proof stage</td></tr>\n'
  + '    <tr><td>Founding price</td><td>$7.99/month &middot; 60% off forever</td><td>CTA stage</td></tr>\n'
  + '    <tr><td>Food waste</td><td>69.5% less food waste</td><td>Agitate / Value</td></tr>\n'
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
  + '  <tr><td class="td-label">DL_ID count</td><td class="td-value">' + _h(dlCount) + ' ACTIVE (7×FB &middot; 7×IG &middot; 1×TK &middot; 7×PT &middot; 7×ND &middot; 1×YT &middot; 7×X &middot; 1×EM)</td></tr>\n'
  + '</tbody></table>\n\n'
  // FOOTER
  + '<div class="footer">\n'
  + '  easyChef Pro &nbsp;&middot;&nbsp; Digital Galactica Labs LLC &nbsp;&middot;&nbsp; Confidential &nbsp;&middot;&nbsp;\n'
  + '  Generated ' + _h(genDate) + ' &nbsp;&middot;&nbsp; ops.dgl.dev &nbsp;&middot;&nbsp; &copy; 2026 Digital Galactica Labs LLC\n'
  + '</div>\n\n'
  + '</body>\n</html>';
}
