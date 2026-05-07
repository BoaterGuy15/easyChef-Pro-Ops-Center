// ─────────────────────────────────────────────────────────────────────────────
// Operations_DriveExport.gs
//
// Creates a Google Drive folder workspace for an approved campaign, populated
// with five documents, and registers the folder in the Docs tab.
//
// Called automatically from Operations_CampaignSave.gs when ml_approved = true.
// Also reachable via action='export_to_drive' in doPost.
// ─────────────────────────────────────────────────────────────────────────────

var _CAMPAIGNS_ROOT_NAME = 'easyChef Pro Campaigns';

/**
 * Main export function. Creates:
 *   easyChef Pro Campaigns / YYYY / Month YYYY / EC-[id] — [name] /
 *     00 — Campaign Brief          (Google Doc)
 *     01 — Social Posts            (Google Doc)
 *     02 — Email Sequences         (Google Doc)
 *     03 — LP Brief                (Google Doc)
 *     04 — Campaign Calendar       (Google Sheet)
 *
 * Registers the folder in the Docs tab (Documents sheet).
 * Saves drive_url back to the CampaignBriefs sheet row.
 *
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

    Logger.log('[DriveExport] Step 1a: getFolderById ' + SHARED_DRIVE_FOLDER_ID);
    var root        = DriveApp.getFolderById(SHARED_DRIVE_FOLDER_ID);
    Logger.log('[DriveExport] Step 1b: getOrCreateFolder campsRoot');
    var campsRoot   = getOrCreateFolder(root, _CAMPAIGNS_ROOT_NAME);
    Logger.log('[DriveExport] Step 1c: yearFolder');
    var yearFolder  = getOrCreateFolder(campsRoot, year);
    Logger.log('[DriveExport] Step 1d: monthFolder');
    var monthFolder = getOrCreateFolder(yearFolder, monthStr);

    var safeName  = _deSafe(brief.name || brief.id || 'Campaign', 60);
    var folderName = (brief.id || 'EC') + ' — ' + safeName;
    Logger.log('[DriveExport] Step 1e: campaign folder — ' + folderName);
    var folder     = getOrCreateFolder(monthFolder, folderName);
    Logger.log('[DriveExport] Step 1f: setSharing on campaign folder');
    try { folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) { Logger.log('[DriveExport] setSharing skipped: ' + se.message); }
    Logger.log('[DriveExport] Step 1g: folder ready — ' + folder.getId());

    var folderId  = folder.getId();
    var folderUrl = folder.getUrl();
    var docUrls   = { folder: folderUrl };

    // ── 2. 00 — Campaign Brief ──────────────────────────────────────────────
    Logger.log('[DriveExport] Section 2: Campaign Brief');
    try {
      var briefDoc  = _newDoc('00 — Campaign Brief', folder);
      var briefBody = briefDoc.getBody();
      briefBody.clear();
      _dh1(briefBody, 'Campaign Brief — ' + (brief.name || brief.id || ''));
      _dpair(briefBody, 'Campaign ID',      brief.id            || '');
      _dpair(briefBody, 'Campaign Name',    brief.name          || '');
      _dpair(briefBody, 'ICP',              brief.icp           || '');
      _dpair(briefBody, 'Theme',            brief.theme         || '');
      _dpair(briefBody, 'Funnel Blueprint', brief.funnel        || '');
      _dpair(briefBody, 'Channels',         Array.isArray(brief.channels) ? brief.channels.join(', ') : (brief.channel || ''));
      _dpair(briefBody, 'Goal',             brief.goal          || '');
      _dpair(briefBody, 'Slug',             brief.slug          || '');
      _dpair(briefBody, 'Launch Date',      brief.launchDate    || '');
      _dpair(briefBody, 'Campaign Angle',   brief.campaign_angle|| '');
      _dpair(briefBody, 'Urgency Trigger',  brief.urgency_trigger || '');
      _dpair(briefBody, 'Post Count',       String(brief.post_count || 7));
      _dpair(briefBody, 'Post Frequency',   brief.post_frequency  || '');
      _dpair(briefBody, 'Email Sequences',  String(brief.email_sequences || 2));
      _dpair(briefBody, 'Email Variants',   String(brief.email_variants  || 2));
      _dpair(briefBody, 'ML Approved',      (brief.ml_approved || brief.approved) ? 'YES' : 'NO');
      _dpair(briefBody, 'Status',           brief.status || 'draft');
      if (copy.headline || copy.lp_hero) {
        briefBody.appendParagraph('');
        _dh2(briefBody, 'Generated Copy');
        if (copy.headline)       _dpair(briefBody, 'Headline',      copy.headline);
        if (copy.subheadline)    _dpair(briefBody, 'Subheadline',   copy.subheadline);
        if (copy.lp_hero)        _dpair(briefBody, 'LP Hero',       copy.lp_hero);
        if (copy.cta_primary)    _dpair(briefBody, 'Primary CTA',   copy.cta_primary);
        if (copy.email_subject_a)_dpair(briefBody, 'Email Subject A', copy.email_subject_a);
        if (copy.email_subject_b)_dpair(briefBody, 'Email Subject B', copy.email_subject_b);
        if (copy.social_hook)    _dpair(briefBody, 'Social Hook',   copy.social_hook);
        if (copy.share_mechanic) _dpair(briefBody, 'Share Mechanic',copy.share_mechanic);
      }
      briefDoc.saveAndClose();
      docUrls.brief = 'https://docs.google.com/document/d/' + briefDoc.getId() + '/view';
    } catch(e) { Logger.log('[DriveExport] brief doc error: ' + e.message); }

    // ── 3. 01 — Social Posts ────────────────────────────────────────────────
    Logger.log('[DriveExport] Section 3: Social Posts (' + posts.length + ' posts)');
    try {
      if (posts.length > 0) {
        var postsDoc  = _newDoc('01 — Social Posts', folder);
        var postsBody = postsDoc.getBody();
        postsBody.clear();
        _dh1(postsBody, 'Social Posts — ' + (brief.name || ''));
        posts.forEach(function(post, i) {
          postsBody.appendParagraph('');
          _dh2(postsBody, 'Post ' + (post.post_num || (i + 1)) + ' — ' + (post.hook || '').substring(0, 60));
          _dpair(postsBody, 'Channel',       post.channel       || brief.channel || '');
          _dpair(postsBody, 'Funnel Stage',  post.funnel_stage  || '');
          _dpair(postsBody, 'Hook',          post.hook          || '');
          postsBody.appendParagraph('');
          postsBody.appendParagraph(post.body || '');
          if (post.hashtags)    _dpair(postsBody, 'Hashtags',    post.hashtags);
          if (post.cta)         _dpair(postsBody, 'CTA',         post.cta);
          if (post.url)         _dpair(postsBody, 'UTM Link',    post.url);
          if (post.image_brief) _dpair(postsBody, 'Image Brief', post.image_brief);
          _dpair(postsBody, 'Status', post.status || 'draft');
          postsBody.appendParagraph('────────────────────────────────');
        });
        postsDoc.saveAndClose();
        docUrls.posts = 'https://docs.google.com/document/d/' + postsDoc.getId() + '/view';
      }
    } catch(e) { Logger.log('[DriveExport] posts doc error: ' + e.message); }

    // ── 4. 02 — Email Sequences ─────────────────────────────────────────────
    Logger.log('[DriveExport] Section 4: Email Sequences (' + emails.length + ' emails)');
    try {
      if (emails.length > 0) {
        var emailDoc  = _newDoc('02 — Email Sequences', folder);
        var emailBody = emailDoc.getBody();
        emailBody.clear();
        _dh1(emailBody, 'Email Sequences — ' + (brief.name || ''));
        var seqMap = {};
        emails.forEach(function(e) {
          var seq = (e.seq_id || '').replace(/-E\d+$/i, '') || 'OTHER';
          if (!seqMap[seq]) seqMap[seq] = [];
          seqMap[seq].push(e);
        });
        Object.keys(seqMap).sort().forEach(function(seq) {
          emailBody.appendParagraph('');
          _dh2(emailBody, seq);
          seqMap[seq].forEach(function(email) {
            emailBody.appendParagraph('');
            var label = (email.seq_id || '') + '  ·  Day ' + (email.send_day || '?');
            emailBody.appendParagraph(label).setAttributes(
              (function(){ var a={}; a[DocumentApp.Attribute.BOLD]=true; return a; })()
            );
            _dpair(emailBody, 'Subject A',    email.subject   || '');
            if (email.subject_b)  _dpair(emailBody, 'Subject B',    email.subject_b);
            if (email.preheader)  _dpair(emailBody, 'Preview Text', email.preheader);
            emailBody.appendParagraph('');
            emailBody.appendParagraph(email.body || '');
            if (email.cta_text) {
              _dpair(emailBody, 'CTA', email.cta_text + (email.cta_url ? ' → ' + email.cta_url : ''));
            }
            emailBody.appendParagraph('───────────────────────────────');
          });
        });
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
        _dh1(lpBody, 'Landing Page Brief — ' + (brief.name || ''));
        _dpair(lpBody, 'URL',            'https://easychefpro.com/' + (lp.slug || brief.slug || ''));
        _dpair(lpBody, 'Slug',           lp.slug            || brief.slug || '');
        _dpair(lpBody, 'ICP',            lp.icp             || brief.icp  || '');
        _dpair(lpBody, 'Theme',          lp.theme           || brief.theme|| '');
        lpBody.appendParagraph('');
        _dh2(lpBody, 'Hero');
        _dpair(lpBody, 'Headline',       lp.hero_headline    || '');
        _dpair(lpBody, 'Subheadline',    lp.hero_subheadline || '');
        _dpair(lpBody, 'CTA',            lp.cta_primary || lp.hero_cta || '');
        lpBody.appendParagraph('');
        _dh2(lpBody, 'Sections');
        if (lp.problem_section)  _dpair(lpBody, 'Problem',     lp.problem_section);
        if (lp.agitate_section)  _dpair(lpBody, 'Agitate',     lp.agitate_section);
        if (lp.solve_section)    _dpair(lpBody, 'Solve',       lp.solve_section);
        if (lp.social_proof)     _dpair(lpBody, 'Social Proof',lp.social_proof);
        if (lp.proof_items) {
          var proofStr = Array.isArray(lp.proof_items) ? lp.proof_items.join(' · ') : lp.proof_items;
          _dpair(lpBody, 'Proof Bar',    proofStr);
        }
        lpBody.appendParagraph('');
        lpBody.appendParagraph('Handoff Note: Verify slug is live in Webflow before activating UTMs.');
        lpDoc.saveAndClose();
        docUrls.lp = 'https://docs.google.com/document/d/' + lpDoc.getId() + '/view';
      }
    } catch(e) { Logger.log('[DriveExport] lp doc error: ' + e.message); }

    // ── 6. 04 — Campaign Calendar ───────────────────────────────────────────
    try {
      Logger.log('[DriveExport] Creating spreadsheet: 04 — Campaign Calendar — ' + safeName);
      var calSS   = SpreadsheetApp.create('04 — Campaign Calendar — ' + safeName);
      Logger.log('[DriveExport] Spreadsheet created: ' + calSS.getId());
      var calFile = DriveApp.getFileById(calSS.getId());
      calFile.moveTo(folder);
      try { calFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) { Logger.log('[DriveExport] cal setSharing skipped: ' + se.message); }
      var calSh   = calSS.getActiveSheet();
      calSh.setName('Calendar');
      var calHdr  = ['Day','Date','Channel','Asset','Hook','UTM Link','Status','Notes','Assignee'];
      calSh.getRange(1, 1, 1, calHdr.length).setValues([calHdr]);
      var hRange  = calSh.getRange(1, 1, 1, calHdr.length);
      hRange.setBackground('#1a1a2e');
      hRange.setFontColor('#c9a84c');
      hRange.setFontWeight('bold');
      hRange.setFontFamily('Courier New');
      calSh.setFrozenRows(1);
      calHdr.forEach(function(_, ci) { calSh.setColumnWidth(ci + 1, ci === 4 ? 260 : ci === 5 ? 300 : 120); });
      var launch  = brief.launchDate ? new Date(brief.launchDate) : new Date();
      var calRows = [];
      for (var day = 0; day <= 20; day++) {
        var rowDate = new Date(launch);
        rowDate.setDate(rowDate.getDate() + day);
        var dateStr = (rowDate.getMonth() + 1) + '/' + rowDate.getDate() + '/' + rowDate.getFullYear();
        var dayPost = posts.filter(function(p) { return parseInt(p.post_num || 0) === day + 1; })[0] || null;
        calRows.push([
          'D' + day,
          dateStr,
          dayPost ? (dayPost.channel || brief.channel || '') : '',
          dayPost ? ('Social Post ' + (day + 1)) : '',
          dayPost ? (dayPost.hook || '').substring(0, 80) : '',
          dayPost ? (dayPost.url || '') : '',
          'draft', '', ''
        ]);
      }
      calSh.getRange(2, 1, calRows.length, calHdr.length).setValues(calRows);
      docUrls.calendar = 'https://docs.google.com/spreadsheets/d/' + calSS.getId() + '/view';
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
    } catch(e) { Logger.log('[DriveExport] addDocument error: ' + e.message); }

    // ── 8. Persist drive_url to CampaignBriefs sheet ────────────────────────
    try {
      if (brief.id) _saveCampaignDriveUrl(brief.id, folderUrl);
    } catch(e) { Logger.log('[DriveExport] saveDriveUrl error: ' + e.message); }

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
  Logger.log('[DriveExport] Creating doc: ' + name);
  var doc = DocumentApp.create(name);
  Logger.log('[DriveExport] Doc created: ' + doc.getId());
  Logger.log('[DriveExport] Moving doc to folder: ' + folder.getId());
  DriveApp.getFileById(doc.getId()).moveTo(folder);
  try { DriveApp.getFileById(doc.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.COMMENT); } catch(se) { Logger.log('[DriveExport] doc setSharing skipped: ' + se.message); }
  Logger.log('[DriveExport] Doc ready: ' + name);
  return doc;
}

function _dh1(body, text) {
  body.appendParagraph(text).setHeading(DocumentApp.ParagraphHeading.HEADING1);
}

function _dh2(body, text) {
  body.appendParagraph(text).setHeading(DocumentApp.ParagraphHeading.HEADING2);
}

function _dpair(body, label, value) {
  body.appendParagraph(label + ': ' + (value || ''));
}

function _deSafe(str, maxLen) {
  return String(str || '').replace(/[\/\\:*?"<>|]/g, '').trim().substring(0, maxLen || 80);
}
