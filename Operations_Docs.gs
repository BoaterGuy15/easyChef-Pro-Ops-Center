// ─────────────────────────────────────────────────────────────────────────────
// Operations_Docs.gs
// ADD THESE FUNCTIONS TO YOUR EXISTING Operations.gs
// Do NOT replace the existing file — paste the functions below into it.
//
// SHEET SETUP: Run _setupDocsSheet() once from the Apps Script editor
// (Run → Run function → _setupDocsSheet) to create the Documents sheet.
//
// ── doGet additions (paste inside your existing doGet(e) if/else block) ──────
//
//   if (action === 'docs_read') {
//     var tId = e.parameter.taskId || '';
//     var agId = e.parameter.agendaId || '';
//     return json({ ok: true, docs: getDocs(tId, agId) });
//   }
//
// ── doPost additions (paste inside your existing doPost(e) if/else block) ────
//
//   if (body.action === 'file_upload') {
//     var f = uploadFileToDrive(
//       body.filename, body.mimeType, body.base64data,
//       body.sourceType || (body.taskId ? 'task' : 'agenda'),
//       body.sourceId   || body.taskId || body.agendaId || '',
//       body.sourceName || ''
//     );
//     var doc = {
//       id:           'doc-' + Date.now(),
//       taskId:       body.taskId   || '',
//       agendaId:     body.agendaId || '',
//       name:         body.filename,
//       url:          f.url,
//       previewUrl:   f.previewUrl,
//       type:         body.mimeType || 'application/octet-stream',
//       driveFileId:  f.id,
//       folderUrl:    f.folderUrl,
//       reviewNeeded: 'false',
//       addedBy:      body.addedBy || '',
//       addedAt:      new Date().toISOString()
//     };
//     _appendDocRow(doc);
//     return json({ ok: true, doc: doc });
//   }
//   if (body.action === 'docs_write') {
//     var lDoc = {
//       id:           body.id || ('doc-' + Date.now()),
//       taskId:       body.taskId   || '',
//       agendaId:     body.agendaId || '',
//       name:         body.name     || '',
//       url:          body.url      || '',
//       previewUrl:   body.previewUrl || '',
//       type:         'link',
//       driveFileId:  body.driveFileId || '',
//       folderUrl:    '',
//       reviewNeeded: 'false',
//       addedBy:      body.addedBy  || '',
//       addedAt:      body.addedAt  || new Date().toISOString()
//     };
//     _appendDocRow(lDoc);
//     return json({ ok: true, doc: lDoc });
//   }
//   if (body.action === 'docs_delete') {
//     _deleteDocRow(body.id);
//     return json({ ok: true });
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

// DOCS_SHEET, DOCS_HEADERS, and SHARED_DRIVE_FOLDER_ID are declared as const in Files.gs.

// ── Sheet bootstrap ───────────────────────────────────────────────────────────

function _setupDocsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(DOCS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(DOCS_SHEET);
  }
  var hdr = sheet.getRange(1, 1, 1, DOCS_HEADERS.length);
  hdr.setValues([DOCS_HEADERS]);
  hdr.setBackground('#0b0d10');
  hdr.setFontColor('#c9a84c');
  hdr.setFontFamily('Courier New');
  hdr.setFontWeight('bold');
  hdr.setFontSize(10);
  sheet.setFrozenRows(1);
  for (var i = 1; i <= DOCS_HEADERS.length; i++) {
    sheet.setColumnWidth(i, 160);
  }
  Logger.log('Documents sheet is ready.');
  return sheet;
}

function _getDocsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(DOCS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(DOCS_SHEET);
    var hdr = sheet.getRange(1, 1, 1, DOCS_HEADERS.length);
    hdr.setValues([DOCS_HEADERS]);
    hdr.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── Drive helpers ─────────────────────────────────────────────────────────────

function _getOrCreateFolder(parent, name) {
  var iter = parent.getFoldersByName(name);
  return iter.hasNext() ? iter.next() : parent.createFolder(name);
}

/**
 * Uploads a base64-encoded file to Drive under:
 *   SHARED_DRIVE_FOLDER_ID / Tasks|Agenda / <sourceName|sourceId> /
 * Sets "Anyone with link can view" sharing.
 * Returns { id, url, previewUrl, folderUrl }.
 */
function uploadFileToDrive(filename, mimeType, base64data, sourceType, sourceId, sourceName) {
  var root = DriveApp.getFolderById(SHARED_DRIVE_FOLDER_ID);

  // Top-level bucket: Tasks or Agenda
  var bucket = _getOrCreateFolder(root, sourceType === 'task' ? 'Tasks' : 'Agenda');

  // Per-task/agenda subfolder — use name if provided, fall back to id
  var label = (sourceName || sourceId || 'Unknown')
    .replace(/[\/\\:*?"<>|]/g, '')
    .trim()
    .substring(0, 80) || sourceId;
  var subfolder = _getOrCreateFolder(bucket, label);

  // Decode and create file
  var bytes = Utilities.base64Decode(base64data);
  var blob  = Utilities.newBlob(bytes, mimeType || 'application/octet-stream', filename);
  var file  = subfolder.createFile(blob);

  // Share with anyone who has the link (view only) — skipped silently on Shared Drives
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(se) { Logger.log('[Docs] setSharing skipped: ' + se.message); }

  var fileId = file.getId();
  return {
    id:         fileId,
    url:        'https://drive.google.com/file/d/' + fileId + '/view',
    previewUrl: 'https://drive.google.com/file/d/' + fileId + '/preview',
    folderUrl:  subfolder.getUrl()
  };
}

// ── Docs CRUD ─────────────────────────────────────────────────────────────────

/**
 * Returns all doc rows. Optionally filter by taskId and/or agendaId.
 */
function getDocs(taskId, agendaId) {
  var sheet   = _getDocsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var rows = sheet.getRange(2, 1, lastRow - 1, DOCS_HEADERS.length).getValues();
  return rows
    .filter(function(r) {
      if (!r[0]) return false;
      if (taskId   && r[1] !== taskId)   return false;
      if (agendaId && r[2] !== agendaId) return false;
      return true;
    })
    .map(function(r) {
      return {
        id:           String(r[0]),
        taskId:       String(r[1]),
        agendaId:     String(r[2]),
        name:         String(r[3]),
        url:          String(r[4]),
        type:         String(r[5]),
        previewUrl:   String(r[6]),
        driveFileId:  String(r[7]),
        folderUrl:    String(r[8]),
        reviewNeeded: r[9] === true || r[9] === 'true',
        addedBy:      String(r[10]),
        addedAt:      String(r[11]),
        category:     String(r[12] || '')
      };
    });
}

function _appendDocRow(doc) {
  var sheet  = _getDocsSheet();
  var rng    = sheet.getRange(sheet.getLastRow() + 1, 1, 1, DOCS_HEADERS.length);
  rng.setNumberFormat('@');
  rng.setValues([[
    doc.id           || '',
    doc.taskId       || '',
    doc.agendaId     || '',
    doc.name         || '',
    doc.url          || '',
    doc.type         || '',
    doc.previewUrl   || '',
    doc.driveFileId  || '',
    doc.folderUrl    || '',
    doc.reviewNeeded || 'false',
    doc.addedBy      || '',
    doc.addedAt      || new Date().toISOString(),
    doc.category     || ''
  ]]);
}

function _deleteDocRow(id) {
  if (!id) return;
  var sheet   = _getDocsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      return;
    }
  }
}

// ── Design Brief Docs ─────────────────────────────────────────────────────────
// generateBriefDocs(campaignId) — creates one Google Doc per social post.
// Names each doc "Brief [DL_ID] — [Platform] — [Stage]".
// Stores doc URL back into SocialPosts tab design_brief column.
// Returns array of { dl_id, doc_url, title }.

function generateBriefDocs(campaignId) {
  if (!campaignId) return { ok: false, error: 'campaignId required' };
  try {
    var posts   = getSocialPosts(campaignId);
    var brief   = getCampaignBrief(campaignId);
    var theme   = brief && brief.theme ? _getThemeRow(brief.theme) : {};
    var icpRows = getIcpProfiles ? getIcpProfiles() : [];
    var icp     = icpRows.find(function(r) { return r.code === (brief && brief.icp_code); }) || {};

    // Resolve campaign Drive folder
    var folderUrl  = brief && brief.drive_url ? brief.drive_url : '';
    var briefFolder;
    try {
      if (folderUrl) {
        var folderId = folderUrl.match(/[-\w]{25,}/);
        var parent   = folderId ? DriveApp.getFolderById(folderId[0]) : DriveApp.getRootFolder();
        // Create or find a "Design Briefs" subfolder
        var bfIter = parent.getFoldersByName('Design Briefs');
        briefFolder = bfIter.hasNext() ? bfIter.next() : parent.createFolder('Design Briefs');
      } else {
        briefFolder = DriveApp.getRootFolder();
      }
    } catch(fe) {
      briefFolder = DriveApp.getRootFolder();
      Logger.log('[generateBriefDocs] folder error: ' + fe.message);
    }

    var results = [];
    var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
    var spLast  = spSheet.getLastRow();
    var spData  = spLast > 1 ? spSheet.getRange(2, 1, spLast - 1, 16).getValues() : [];

    posts.forEach(function(post) {
      if (!post.dl_id && !post.id) return;
      var dlId    = String(post.dl_id || post.id || '');
      var platform = String(post.platform || '');
      var stage   = String(post.funnel_stage || post.stage || '');
      var title   = 'Brief ' + dlId + ' — ' + platform + ' — ' + stage;

      // Parse stored design_brief JSON if available
      var briefData = {};
      try { briefData = JSON.parse(post.design_brief || '{}'); } catch(e) {}

      // Build the doc body
      var doc  = DocumentApp.create(title);
      var body = doc.getBody();

      // Move to campaign folder
      try {
        var docFile = DriveApp.getFileById(doc.getId());
        briefFolder.addFile(docFile);
        DriveApp.getRootFolder().removeFile(docFile);
      } catch(me) { Logger.log('[generateBriefDocs] move error: ' + me.message); }

      // ── Header ────────────────────────────────────────────────────────────
      body.appendParagraph('DESIGN BRIEF — ' + dlId)
          .setHeading(DocumentApp.ParagraphHeading.HEADING1);
      body.appendParagraph(
        [String(brief && brief.name || campaignId),
         platform, String(theme && theme.theme_name || brief && brief.theme || '')]
        .filter(Boolean).join(' · ')
      ).setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendHorizontalRule();

      // ── Six questions ────────────────────────────────────────────────────
      var questions = [
        ['WHO THIS IS FOR',
          (briefData.who_its_for ||
           [icp.name || (brief && brief.icp_code) || '',
            icp.primary_pain ? 'Primary pain: ' + icp.primary_pain : ''].filter(Boolean).join(' · '))],
        ['EMOTIONAL STATE',
          briefData.emotional_state || stage + ' — see funnel map'],
        ['WHERE IN THE FUNNEL',
          briefData.funnel_position || stage],
        ['VISUAL STATE OF THE STORY',
          briefData.visual_progression ||
          (post.phone_rule ? post.phone_rule :
           (stage === 'hook' || stage === 'problem' || stage === 'agitate'
             ? 'Posts 1-3 — NO PHONE. Problem must feel real before solution appears.'
             : stage === 'solve'
             ? 'Post 4 — PHONE APPEARS for the first time. First reveal.'
             : 'Posts 5-7 — PHONE VISIBLE. Outcomes, not features.'))],
        ['WHAT MUST NOT APPEAR YET',
          Array.isArray(briefData.what_not_to_show)
            ? briefData.what_not_to_show.map(function(x){ return '• ' + x; }).join('\n')
            : '• App UI before Post 4\n• Smiling before problem is acknowledged\n• Bright commercial lighting'],
        ['WHAT ACTION THEY FEEL NEXT',
          briefData.what_they_feel_next || 'Pause the scroll. Feel seen.']
      ];
      questions.forEach(function(q) {
        body.appendParagraph(q[0]).setHeading(DocumentApp.ParagraphHeading.HEADING2);
        body.appendParagraph(q[1]);
      });

      body.appendHorizontalRule();

      // ── Production details ───────────────────────────────────────────────
      var details = [
        ['SCENE DIRECTION',    briefData.scene_direction    || post.image_brief || ''],
        ['VISUAL TONE',        briefData.visual_tone        || ''],
        ['CAMERA STYLE',       briefData.camera_style       || ''],
        ['LAYOUT',             briefData.layout_direction   || ''],
        ['PHONE VISIBILITY',   briefData.phone_rule_note    || (post.phone_visibility === false ? 'NO PHONE' : 'PHONE VISIBLE')],
        ['CTA',                briefData.cta                || post.cta || ''],
        ['PLATFORM SPECS',
          briefData.platform_specs
            ? (briefData.platform_specs.ratio || '') + ' · ' + (briefData.platform_specs.size || '')
            : platform]
      ];
      if (briefData.motion_direction) details.push(['MOTION DIRECTION', briefData.motion_direction]);
      if (briefData.audio_direction)  details.push(['AUDIO DIRECTION',  briefData.audio_direction]);

      details.forEach(function(d) {
        if (!d[1]) return;
        body.appendParagraph(d[0]).setHeading(DocumentApp.ParagraphHeading.HEADING3);
        body.appendParagraph(d[1]);
      });

      body.appendHorizontalRule();

      // ── Brand rules ──────────────────────────────────────────────────────
      body.appendParagraph('BRAND RULES').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph(
        '• CTA button: #FF0000 red — never orange, never coral\n' +
        '• No shame language — the system is broken, never her fault\n' +
        '• No invented names, locations, or testimonials\n' +
        '• No forbidden words: revolutionary, game-changing, seamless, leverage\n' +
        '• Urgency only as: "First 5,000 families" or "Founding price ends July 1"'
      );

      doc.saveAndClose();
      var docUrl = 'https://docs.google.com/document/d/' + doc.getId() + '/edit';

      // Write URL back to SocialPosts tab design_brief column (col 16)
      for (var i = 0; i < spData.length; i++) {
        if (String(spData[i][0]) === String(post.id || '')) {
          spSheet.getRange(i + 2, 16, 1, 1).setValue(docUrl);
          break;
        }
      }

      results.push({ dl_id: dlId, title: title, doc_url: docUrl });
      Logger.log('[generateBriefDocs] created: ' + title);
    });

    return { ok: true, created: results.length, briefs: results };
  } catch(e) {
    Logger.log('[generateBriefDocs] error: ' + e.message);
    return { ok: false, error: e.message };
  }
}
