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
 * Uploads a base64-encoded file to Drive.
 * Routing by sourceType:
 *   task     → RACI-WorkFlow / RACI Task Docs / <id> — <name> /
 *   shared   → Team Documents / <category> /
 *   agenda   → Agenda / <label> /
 *   profile  → Profiles / <label> /
 *   request  → Requests / <label> /
 *   other    → Other / <label> /
 * If customFolderDriveId is provided it overrides routing and writes directly there.
 * Returns { id, url, previewUrl, folderUrl }.
 */
function uploadFileToDrive(filename, mimeType, base64data, sourceType, sourceId, sourceName, category, customFolderDriveId) {
  var root = DriveApp.getFolderById(SHARED_DRIVE_FOLDER_ID);

  function _safe(s, fb) {
    return (String(s || '').replace(/[\/\\:*?"<>|]/g, '').trim().substring(0, 80)) || fb || 'Unknown';
  }

  var subfolder;

  if (customFolderDriveId) {
    try { subfolder = DriveApp.getFolderById(customFolderDriveId); } catch(e) {}
  }

  if (!subfolder) {
    var label = _safe(sourceName || sourceId, sourceId);

    if (sourceType === 'task') {
      // RACI-WorkFlow / RACI Task Docs / T-XXX — Task Name /
      var raciWf   = _getOrCreateFolder(root, 'RACI-WorkFlow');
      var taskDocs = _getOrCreateFolder(raciWf, 'RACI Task Docs');
      var taskLabel = sourceId ? _safe(sourceId + ' — ' + (sourceName || sourceId), sourceId) : label;
      subfolder = _getOrCreateFolder(taskDocs, taskLabel);
    } else if (sourceType === 'shared') {
      // Team Documents / <category> /
      var tdRoot  = _getOrCreateFolder(root, 'Team Documents');
      var catLabel = _safe(category || label, 'General');
      subfolder = _getOrCreateFolder(tdRoot, catLabel);
    } else if (sourceType === 'agenda') {
      // Agenda / <label> /
      subfolder = _getOrCreateFolder(_getOrCreateFolder(root, 'Agenda'), label);
    } else if (sourceType === 'profile') {
      // Profiles / <label> /
      subfolder = _getOrCreateFolder(_getOrCreateFolder(root, 'Profiles'), label);
    } else if (sourceType === 'request') {
      // Requests / <label> /
      subfolder = _getOrCreateFolder(_getOrCreateFolder(root, 'Requests'), label);
    } else {
      // Other / <label> /
      subfolder = _getOrCreateFolder(_getOrCreateFolder(root, 'Other'), label);
    }
  }

  var bytes = Utilities.base64Decode(base64data);
  var blob  = Utilities.newBlob(bytes, mimeType || 'application/octet-stream', filename);
  var file  = subfolder.createFile(blob);

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

/**
 * Moves every misrouted Drive file to its correct folder and updates folderUrl in the Sheet.
 * Routing rules mirror uploadFileToDrive:
 *   taskId set      → RACI-WorkFlow / RACI Task Docs / <taskId> /
 *   category set    → Team Documents / <category> /
 *   neither         → skipped (agenda-type, no change)
 * Returns { ok, moved, skipped, errors[] }.
 */
function migrateDocFolders() {
  try {
    var root     = DriveApp.getFolderById(SHARED_DRIVE_FOLDER_ID);
    var sheet    = _getDocsSheet();
    var data     = sheet.getDataRange().getValues();
    if (data.length < 2) return { ok: true, moved: 0, skipped: 0, errors: [] };

    // Read by actual header row so it works regardless of column order changes
    var headers   = data[0].map(function(h) { return String(h).trim(); });
    var iId       = headers.indexOf('id');
    var iFile     = headers.indexOf('driveFileId');
    var iFolder   = headers.indexOf('folderUrl');
    var iTask     = headers.indexOf('taskId');
    var iCat      = headers.indexOf('category');

    // Pre-build parent folders once
    var raciWf   = _getOrCreateFolder(root, 'RACI-WorkFlow');
    var taskDocs = _getOrCreateFolder(raciWf, 'RACI Task Docs');
    var tdRoot   = _getOrCreateFolder(root, 'Team Documents');

    var moved = 0; var skipped = 0; var errors = [];

    for (var i = 1; i < data.length; i++) {
      var row      = data[i];
      var fileId   = iFile   >= 0 ? String(row[iFile]   || '') : '';
      var taskId   = iTask   >= 0 ? String(row[iTask]   || '') : '';
      var category = iCat    >= 0 ? String(row[iCat]    || '') : '';
      var curFolder= iFolder >= 0 ? String(row[iFolder] || '') : '';

      if (!fileId) { skipped++; continue; }

      var targetFolder = null;
      if (taskId) {
        if (curFolder.indexOf('RACI Task Docs') !== -1) { skipped++; continue; }
        targetFolder = _getOrCreateFolder(taskDocs, taskId);
      } else if (category) {
        if (curFolder.indexOf('Team Documents') !== -1) { skipped++; continue; }
        targetFolder = _getOrCreateFolder(tdRoot, category);
      } else {
        skipped++; continue;
      }

      try {
        var file    = DriveApp.getFileById(fileId);
        var parents = file.getParents();
        targetFolder.addFile(file);
        var oldParents = [];
        while (parents.hasNext()) { oldParents.push(parents.next()); }
        oldParents.forEach(function(p) { if (p.getId() !== targetFolder.getId()) try { p.removeFile(file); } catch(re) {} });
        if (iFolder >= 0) sheet.getRange(i + 1, iFolder + 1).setValue(targetFolder.getUrl());
        moved++;
        Logger.log('[migrateDocFolders] Moved ' + fileId + ' → ' + targetFolder.getName());
      } catch(fe) {
        errors.push('row ' + (i + 1) + ': ' + fe.message);
        Logger.log('[migrateDocFolders] ERROR row ' + (i + 1) + ': ' + fe.message);
      }
    }

    return { ok: true, moved: moved, skipped: skipped, errors: errors };
  } catch(e) {
    Logger.log('[migrateDocFolders] FATAL: ' + e.message);
    return { ok: false, error: e.message };
  }
}

/**
 * Scans the Team Documents Drive folder recursively and imports any files that
 * are not already tracked in the Documents Sheet.
 * Category = name of the first-level subfolder under Team Documents (e.g. 'DNI EcoSystem').
 * Returns { ok, imported, skipped }.
 */
function syncTeamDocsFromDrive() {
  try {
    var root       = DriveApp.getFolderById(SHARED_DRIVE_FOLDER_ID);
    var tdIter     = root.getFoldersByName('Team Documents');
    if (!tdIter.hasNext()) return { ok: false, error: 'Team Documents folder not found' };
    var tdRoot     = tdIter.next();

    // Build set of driveFileIds already in Sheet
    var sheet      = _getDocsSheet();
    var data       = sheet.getDataRange().getValues();
    var headers    = data[0].map(function(h) { return String(h).trim(); });
    var iFile      = headers.indexOf('driveFileId');
    var existing   = {};
    for (var i = 1; i < data.length; i++) {
      var fid = iFile >= 0 ? String(data[i][iFile] || '') : '';
      if (fid) existing[fid] = true;
    }

    var imported = 0; var skipped = 0;
    var now = new Date().toISOString();

    // Walk Team Documents one level deep for category names, then recurse for files
    function _scanFolder(folder, category) {
      // Files directly in this folder
      var fileIter = folder.getFiles();
      while (fileIter.hasNext()) {
        var f = fileIter.next();
        var fid = f.getId();
        if (existing[fid]) { skipped++; continue; }
        var doc = {
          id:           'doc-sync-' + fid.substring(0, 8),
          taskId:       '',
          agendaId:     '',
          name:         f.getName(),
          url:          'https://drive.google.com/file/d/' + fid + '/view',
          previewUrl:   'https://drive.google.com/file/d/' + fid + '/preview',
          driveFileId:  fid,
          mimeType:     f.getMimeType() || '',
          reviewNeeded: 'false',
          addedBy:      'sync',
          addedAt:      now,
          folderUrl:    folder.getUrl(),
          category:     category
        };
        addDocument(doc);
        existing[fid] = true;
        imported++;
        Logger.log('[syncTeamDocs] imported: ' + f.getName() + ' → ' + category);
      }
      // Recurse into subfolders (keep same category — first level sets the tag)
      var subIter = folder.getFolders();
      while (subIter.hasNext()) {
        _scanFolder(subIter.next(), category);
      }
    }

    // Iterate first-level subfolders of Team Documents (each becomes a category)
    var catIter = tdRoot.getFolders();
    while (catIter.hasNext()) {
      var catFolder = catIter.next();
      var catName   = catFolder.getName();
      _scanFolder(catFolder, catName);
    }

    return { ok: true, imported: imported, skipped: skipped };
  } catch(e) {
    Logger.log('[syncTeamDocs] FATAL: ' + e.message);
    return { ok: false, error: e.message };
  }
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
    var brief   = getCampaignBriefs(campaignId);
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

// ── ContentCalendar Brief Docs ─────────────────────────────────────────────────
// generateContentCalBriefDocs(campaignId) — creates one Google Doc per row in
// ContentCalendar (not SocialPosts), writes URL back to brief_doc_url column.
// Skips rows that already have a brief_doc_url.

function generateContentCalBriefDocs(campaignId) {
  if (!campaignId) return { ok: false, error: 'campaignId required' };
  try {
    var ccSheet  = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last     = ccSheet.getLastRow();
    if (last < 2) return { ok: true, created: 0, skipped: 0 };

    var headers  = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var H = {};
    headers.forEach(function(h, i) { H[h] = i; });
    // Ensure brief_doc_url column exists in the sheet header row
    var headerRow = ccSheet.getRange(1, 1, 1, headers.length).getValues()[0];
    var briefCol  = headers.indexOf('brief_doc_url') + 1; // 1-indexed

    var data = ccSheet.getRange(2, 1, last - 1, headers.length).getValues();

    // Campaign Drive folder
    var campaignFolderIds = { 'EC-2026-001': '1O9WYhU7B9MS9aMTUurBRCA5xufE3o8rl' };
    var folderId = campaignFolderIds[campaignId] || '';
    var briefFolder;
    try {
      if (folderId) briefFolder = DriveApp.getFolderById(folderId);
    } catch(fe) { briefFolder = DriveApp.getRootFolder(); }
    if (!briefFolder) briefFolder = DriveApp.getRootFolder();

    var created = 0, skipped = 0;
    var BATCH = 30; // stay well under 6-min limit

    for (var i = 0; i < data.length && created < BATCH; i++) {
      var r = data[i];
      if (!r[0] || String(r[H.campaign_id]) !== campaignId) continue;
      var existing = String(r[H.brief_doc_url] || '');
      if (existing) { skipped++; continue; }

      var assetId  = String(r[H.asset_id]        || '');
      var platform = String(r[H.platform]         || '');
      var calId    = String(r[H.calendar_id]      || '');
      var dlId     = String(r[H.dl_id]            || '');
      var pubDate  = String(r[H.publish_date]     || '');
      var pubTime  = String(r[H.publish_time]     || '');
      var funnel   = String(r[H.funnel_stage]     || '');
      var emotion  = String(r[H.emotional_stage]  || '');
      var icp      = String(r[H.icp_target]       || '');
      var status   = String(r[H.status]           || '');
      var caption  = String(r[H.caption]          || '');
      var hashtags = String(r[H.hashtags]         || '');
      var figma    = String(r[H.figma_export_url] || '');
      var day      = String(r[H.day]              || '');
      var week     = String(r[H.week]             || '');

      var title = 'Brief ' + assetId + ' — ' + platform + ' — ' + funnel;
      var doc  = DocumentApp.create(title);
      var body = doc.getBody();

      var H1 = DocumentApp.ParagraphHeading.HEADING1;
      var H2 = DocumentApp.ParagraphHeading.HEADING2;

      body.appendParagraph('ASSET BRIEF — ' + assetId).setHeading(H1);
      body.appendParagraph('Campaign: ' + campaignId + '   ·   Platform: ' + platform);
      body.appendParagraph(' ');

      body.appendParagraph('Asset Details').setHeading(H2);
      body.appendParagraph('Asset ID:       ' + assetId);
      body.appendParagraph('Calendar ID:    ' + calId);
      body.appendParagraph('DL ID:          ' + dlId);
      body.appendParagraph('Platform:       ' + platform);
      body.appendParagraph('Publish Date:   ' + pubDate + (pubTime ? '  ' + pubTime : ''));
      body.appendParagraph('Campaign Day:   Day ' + day + '  ·  Week ' + week);
      body.appendParagraph('Status:         ' + status);
      body.appendParagraph(' ');

      body.appendParagraph('Content Direction').setHeading(H2);
      body.appendParagraph('Funnel Stage:   ' + (funnel   || '—'));
      body.appendParagraph('Emotional Arc:  ' + (emotion  || '—'));
      body.appendParagraph('ICP Target:     ' + (icp      || '—'));
      body.appendParagraph(' ');

      if (caption || hashtags) {
        body.appendParagraph('Content').setHeading(H2);
        if (caption)  body.appendParagraph('Caption:\n' + caption);
        if (hashtags) body.appendParagraph('Hashtags:\n' + hashtags);
        body.appendParagraph(' ');
      }

      if (figma) {
        body.appendParagraph('Links').setHeading(H2);
        body.appendParagraph('Figma: ' + figma);
      }

      doc.saveAndClose();
      var docUrl = 'https://docs.google.com/document/d/' + doc.getId() + '/edit';

      try {
        var docFile = DriveApp.getFileById(doc.getId());
        briefFolder.addFile(docFile);
        DriveApp.getRootFolder().removeFile(docFile);
      } catch(me) {}

      // Write URL back to brief_doc_url column
      ccSheet.getRange(i + 2, briefCol).setValue(docUrl);
      created++;
      Logger.log('[generateContentCalBriefDocs] ' + assetId + ' → ' + docUrl);
    }

    var remaining = 0;
    for (var j = i; j < data.length; j++) {
      var rj = data[j];
      if (String(rj[H.campaign_id]) === campaignId && !String(rj[H.brief_doc_url]||'')) remaining++;
    }

    Logger.log('[generateContentCalBriefDocs] created:' + created + ' skipped:' + skipped + ' remaining:' + remaining);
    return { ok: true, created: created, skipped: skipped, remaining: remaining };
  } catch(e) {
    Logger.log('[generateContentCalBriefDocs] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}
