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
    var campaignFolderIds = { 'EC-2026-001': '1rB1OoKXiA1UjEKBTKhSsbQdw3jLs7CYU' };
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

// ── Claude Design / Storyboard Briefs ─────────────────────────────────────────
// generateClaudeDesignBrief(assetId)
// Creates a Google Doc design brief (or storyboard for TikTok/YouTube) from
// ContentCalendar + SocialPosts data. Writes URL back to claude_design_url column.
// Returns { ok, url, asset_id } — or { ok, url, skipped:true } if URL already exists.

function generateClaudeDesignBrief(assetId) {
  if (!assetId) return { ok: false, error: 'assetId required' };
  try {
    var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last    = ccSheet.getLastRow();
    if (last < 2) return { ok: false, error: 'ContentCalendar empty' };

    var headers = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var H = {};
    headers.forEach(function(h, idx) { H[h] = idx; });
    var colCount = Math.min(headers.length, ccSheet.getLastColumn());
    var data = ccSheet.getRange(2, 1, last - 1, colCount).getValues();

    var ccRow = null, ccRowIndex = -1;
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][H.asset_id] || '') === assetId) { ccRow = data[i]; ccRowIndex = i; break; }
    }
    if (!ccRow) return { ok: false, error: 'Asset not found: ' + assetId };

    var existing = String((H.claude_design_url !== undefined ? ccRow[H.claude_design_url] : '') || '');
    if (existing) return { ok: true, url: existing, asset_id: assetId, skipped: true };

    var platform   = String(ccRow[H.platform]        || '');
    var dlId       = String(ccRow[H.dl_id]           || '');
    var funnel     = String(ccRow[H.funnel_stage]    || '');
    var emotion    = String(ccRow[H.emotional_stage] || '');
    var icp        = String(ccRow[H.icp_target]      || '');
    var pubDate    = String(ccRow[H.publish_date]    || '');
    var pubTime    = String(ccRow[H.publish_time]    || '');
    var day        = String(ccRow[H.day]             || '');
    var week       = String(ccRow[H.week]            || '');
    var campaignId = String(ccRow[H.campaign_id]     || '');

    // Look up SocialPosts row (join on id = assetId OR dl_id = dlId)
    var spHook = '', spBody = '', spCta = '', spImageBrief = '', spDesignBrief = '';
    var spHashtags = '', spLoopStage = '', spEmotionIn = '', spEmotionOut = '', spLpSection = '';
    try {
      var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
      var spLast  = spSheet.getLastRow();
      if (spLast >= 2) {
        var spHdrs = _CC_HDR[_CC_TAB.SOCIAL];
        var SH = {};
        spHdrs.forEach(function(h, idx) { SH[h] = idx; });
        var spData = spSheet.getRange(2, 1, spLast - 1, spHdrs.length).getValues();
        for (var j = 0; j < spData.length; j++) {
          var sr = spData[j];
          var spId  = String(sr[SH.id]    || '');
          var spDl  = String(sr[SH.dl_id] || '');
          if (spId === assetId || (dlId && spDl === dlId)) {
            spHook        = String(sr[SH.hook]                 || '');
            spBody        = String(sr[SH.body_copy]            || '');
            spCta         = String(sr[SH.cta]                  || '');
            spImageBrief  = String(sr[SH.image_brief]          || '');
            spDesignBrief = String(sr[SH.design_brief]         || '');
            spHashtags    = String(sr[SH.hashtags]             || '');
            spLoopStage   = String(sr[SH.loop_stage]           || '');
            spEmotionIn   = String(sr[SH.emotional_state]      || '');
            spEmotionOut  = String(sr[SH.emotional_destination] || '');
            spLpSection   = String(sr[SH.lp_section_source]    || '');
            break;
          }
        }
      }
    } catch(se) { Logger.log('[generateClaudeDesignBrief] spSheet error: ' + se.message); }

    // Approved claims for funnel stage
    var claimsText = '';
    try {
      var scoping   = getCampaignStrategy('CLAIM_SCOPING_001');
      var secMap    = (scoping && scoping.value && scoping.value.section_claim_map) || {};
      var allClaims = getApprovedClaims() || [];
      var permitted = secMap[funnel] || [];
      if (!permitted.length && funnel === 'agitate') {
        var ag = {};
        ['agitate_money','agitate_time','agitate_nutrition'].forEach(function(sub) {
          (secMap[sub] || []).forEach(function(t) { ag[t] = true; });
        });
        permitted = Object.keys(ag);
      }
      if (permitted.length) {
        var claims = allClaims.filter(function(c) { return permitted.indexOf(c.claim_type) > -1; })
          .map(function(c) { return c.exact_wording; }).filter(Boolean).slice(0, 4);
        if (claims.length) claimsText = claims.join('\n');
      }
    } catch(ce) { Logger.log('[generateClaudeDesignBrief] claims error: ' + ce.message); }

    var isVideo  = (['tiktok','youtube'].indexOf(platform.toLowerCase()) > -1);
    var docTitle = (isVideo ? 'Storyboard' : 'Design Brief') + ' — ' + assetId + ' — ' + platform;
    var doc      = DocumentApp.create(docTitle);
    var body     = doc.getBody();
    var H1       = DocumentApp.ParagraphHeading.HEADING1;
    var H2       = DocumentApp.ParagraphHeading.HEADING2;

    body.appendParagraph((isVideo ? 'STORYBOARD BRIEF' : 'CLAUDE DESIGN BRIEF') + ' — ' + assetId).setHeading(H1);
    body.appendParagraph('Campaign: ' + campaignId + '   ·   Platform: ' + platform + '   ·   Day ' + day + '  ·  Week ' + week);
    body.appendParagraph(' ');

    body.appendParagraph('Asset Context').setHeading(H2);
    body.appendParagraph('Asset ID:        ' + assetId);
    body.appendParagraph('DL ID:           ' + dlId);
    body.appendParagraph('Funnel Stage:    ' + (funnel      || '—'));
    body.appendParagraph('Emotional Arc:   ' + (spEmotionIn || emotion || '—') + ' → ' + (spEmotionOut || '—'));
    body.appendParagraph('ICP Target:      ' + (icp         || '—'));
    body.appendParagraph('LP Section:      ' + (spLpSection || '—'));
    body.appendParagraph('Loop Stage:      ' + (spLoopStage || '—'));
    body.appendParagraph('Publish:         ' + pubDate + (pubTime ? '  ' + pubTime : ''));
    body.appendParagraph(' ');

    if (spHook || spBody || spCta) {
      body.appendParagraph('Copy').setHeading(H2);
      if (spHook)     body.appendParagraph('Hook:\n'       + spHook);
      if (spBody)     body.appendParagraph('Body Copy:\n'  + spBody);
      if (spCta)      body.appendParagraph('CTA:\n'        + spCta);
      if (spHashtags) body.appendParagraph('Hashtags:\n'   + spHashtags);
      body.appendParagraph(' ');
    }

    if (isVideo) {
      body.appendParagraph('Storyboard').setHeading(H2);
      body.appendParagraph('Hook Engineering (0–3 sec): pattern interrupt · immediate relevance · no preamble');
      body.appendParagraph(' ');
      body.appendParagraph('Scene 1 — Hook (0–3s):\n  Visual: \n  VO: ' + (spHook || '[derive from hook above]'));
      body.appendParagraph('Scene 2 — Problem (3–8s):\n  Visual: \n  VO: ');
      body.appendParagraph('Scene 3 — Solve (8–18s):\n  Visual: \n  VO: ');
      body.appendParagraph('Scene 4 — CTA (18–25s):\n  Visual: \n  VO: ' + (spCta || '[CTA]'));
      body.appendParagraph(' ');
      body.appendParagraph('Shot List').setHeading(H2);
      body.appendParagraph('Shot 1: \nShot 2: \nShot 3: \nShot 4: ');
    } else {
      body.appendParagraph('Visual Direction').setHeading(H2);
      if (spImageBrief)  body.appendParagraph('Image Brief:\n'  + spImageBrief);
      if (spDesignBrief) body.appendParagraph('Design Brief:\n' + spDesignBrief);
      body.appendParagraph(' ');
      body.appendParagraph('Brand Specs').setHeading(H2);
      body.appendParagraph('Primary:   #1A1A2E  (deep navy)');
      body.appendParagraph('Accent:    #E8C547  (warm gold)');
      body.appendParagraph('CTA Red:   #FF4444');
      body.appendParagraph('Font:      Inter — H1 32px bold · Body 16px regular');
    }

    if (claimsText) {
      body.appendParagraph(' ');
      body.appendParagraph('Approved Claims — exact wording only, never invent numbers').setHeading(H2);
      body.appendParagraph(claimsText);
    }

    body.appendParagraph(' ');
    body.appendParagraph('Workflow').setHeading(H2);
    body.appendParagraph(isVideo
      ? 'Storyboard → Shot System → Editor / Veo / CapCut → Publish'
      : 'Claude Design → Figma → Astro Deploy → Publish');

    doc.saveAndClose();
    var docUrl = 'https://docs.google.com/document/d/' + doc.getId() + '/edit';

    // Move to campaign Drive folder
    try {
      var campaignFolderIds = { 'EC-2026-001': '1rB1OoKXiA1UjEKBTKhSsbQdw3jLs7CYU' };
      var fId = campaignFolderIds[campaignId] || '';
      if (fId) {
        var dFile = DriveApp.getFileById(doc.getId());
        DriveApp.getFolderById(fId).addFile(dFile);
        DriveApp.getRootFolder().removeFile(dFile);
      }
    } catch(me) {}

    // Write URL back to claude_design_url column
    var designCol = headers.indexOf('claude_design_url') + 1;
    if (designCol > 0) ccSheet.getRange(ccRowIndex + 2, designCol).setValue(docUrl);

    Logger.log('[generateClaudeDesignBrief] ' + assetId + ' → ' + docUrl);
    return { ok: true, url: docUrl, asset_id: assetId };
  } catch(e) {
    Logger.log('[generateClaudeDesignBrief] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Copy-to-Clipboard Design Brief ────────────────────────────────────────────
// getPostDesignBrief(assetId) — assembles a structured design brief as plain text
// for clipboard. Called by the cockpit "Copy Design Brief" button.

function getPostDesignBrief(assetId) {
  if (!assetId) return { ok: false, error: 'assetId required' };
  try {
    // ── ContentCalendar row ──────────────────────────────────────────────────
    var ccSheet  = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var ccLast   = ccSheet.getLastRow();
    var ccHdrs   = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var CH = {};
    ccHdrs.forEach(function(h, i) { CH[h] = i; });
    var ccData = ccSheet.getRange(2, 1, ccLast - 1, Math.min(ccHdrs.length, ccSheet.getLastColumn())).getValues();
    var ccRow = null;
    for (var i = 0; i < ccData.length; i++) {
      if (String(ccData[i][CH.asset_id] || '') === assetId) { ccRow = ccData[i]; break; }
    }
    if (!ccRow) return { ok: false, error: 'Asset not found: ' + assetId };

    var platform   = String(ccRow[CH.platform]        || '');
    var dlId       = String(ccRow[CH.dl_id]           || '');
    var funnel     = String(ccRow[CH.funnel_stage]    || '');
    var emotion    = String(ccRow[CH.emotional_stage] || '');
    var icp        = String(ccRow[CH.icp_target]      || '');
    var day        = String(ccRow[CH.day]             || '');
    var week       = String(ccRow[CH.week]            || '');
    var campaignId = String(ccRow[CH.campaign_id]     || '');
    var pubDate    = String(ccRow[CH.publish_date]    || '');
    var postNum    = 0;
    var nm = assetId.match(/(\d+)$/); if (nm) postNum = parseInt(nm[1]) || 0;

    // ── SocialPosts row ──────────────────────────────────────────────────────
    var spHook = '', spBody = '', spCta = '', spHashtags = '', spImageBrief = '', spDesignBrief = '';
    var spEmotionIn = '', spEmotionOut = '', spLpSection = '';
    try {
      var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
      var spLast  = spSheet.getLastRow();
      var spHdrs  = _CC_HDR[_CC_TAB.SOCIAL];
      var SH = {};
      spHdrs.forEach(function(h, i) { SH[h] = i; });
      var spData = spSheet.getRange(2, 1, spLast - 1, spHdrs.length).getValues();
      for (var j = 0; j < spData.length; j++) {
        var sr = spData[j];
        if (String(sr[SH.id] || '') === assetId || (dlId && String(sr[SH.dl_id] || '') === dlId)) {
          spHook        = String(sr[SH.hook]                 || '');
          spBody        = String(sr[SH.body_copy]            || '');
          spCta         = String(sr[SH.cta]                  || '');
          spHashtags    = String(sr[SH.hashtags]             || '');
          spImageBrief  = String(sr[SH.image_brief]          || '');
          spDesignBrief = String(sr[SH.design_brief]         || '');
          spEmotionIn   = String(sr[SH.emotional_state]      || '');
          spEmotionOut  = String(sr[SH.emotional_destination]|| '');
          spLpSection   = String(sr[SH.lp_section_source]    || '');
          break;
        }
      }
    } catch(se) {}

    // ── ThemeLibrary for ICP ─────────────────────────────────────────────────
    var themeName = '', themeCategory = '', imageMood = '', emotionalEntry = '', emotionalPayoff = '';
    try {
      var themes = getThemeLibrary(icp);
      if (themes && themes.length) {
        var th = themes[0];
        themeName      = String(th.theme_name      || '');
        themeCategory  = String(th.category        || '');
        imageMood      = String(th.image_mood_hook || '');
        emotionalEntry = String(th.emotional_entry || '');
        emotionalPayoff= String(th.emotional_payoff|| '');
      }
    } catch(te) {}

    // ── LP section emotional job from brief spine ────────────────────────────
    var lpSectionJob = '';
    try {
      if (spLpSection && campaignId) {
        var cbSheet = _getCCSheet(_CC_TAB.BRIEFS);
        var cbLast  = cbSheet.getLastRow();
        var cbHdrs  = _CC_HDR.CampaignBriefs;
        var BH = {};
        cbHdrs.forEach(function(h, i) { BH[h] = i; });
        var cbData = cbSheet.getRange(2, 1, cbLast - 1, cbHdrs.length).getValues();
        for (var k = 0; k < cbData.length; k++) {
          if (String(cbData[k][0] || '') === campaignId) {
            var spineJson = String(cbData[k][BH.lp_campaign_spine_json] || '');
            if (spineJson) {
              var spine = JSON.parse(spineJson);
              var sec   = spine[spLpSection] || spine[spLpSection + '_block'] || {};
              lpSectionJob = String(sec.emotional_job || sec.headline || sec.hook || '');
            }
            break;
          }
        }
      }
    } catch(le) {}

    // ── Approved claims for funnel stage ─────────────────────────────────────
    var claimsLines = '';
    try {
      var scoping   = getCampaignStrategy('CLAIM_SCOPING_001');
      var secMap    = (scoping && scoping.value && scoping.value.section_claim_map) || {};
      var allClaims = getApprovedClaims() || [];
      var permitted = secMap[funnel] || [];
      if (!permitted.length && funnel === 'agitate') {
        var ag = {};
        ['agitate_money','agitate_time','agitate_nutrition'].forEach(function(sub) {
          (secMap[sub] || []).forEach(function(t) { ag[t] = true; });
        });
        permitted = Object.keys(ag);
      }
      if (permitted.length) {
        var claims = allClaims.filter(function(c) { return permitted.indexOf(c.claim_type) > -1; })
          .map(function(c) { return '  • ' + (c.exact_wording || ''); }).filter(Boolean).slice(0, 4);
        claimsLines = claims.join('\n');
      }
    } catch(ce) {}

    // ── Phone rule ───────────────────────────────────────────────────────────
    var phoneRuleText = '';
    try {
      var pr = checkPhoneRule(postNum, spImageBrief, 'social');
      if (pr.warning) {
        phoneRuleText = '⚠ ' + pr.warning;
      } else if (postNum >= 1 && postNum <= 3) {
        phoneRuleText = 'Posts 1–3: NO PHONE — problem world only. Phone first appears at post 4.';
      } else if (postNum === 4) {
        phoneRuleText = 'Post 4 (Solve): PHONE APPEARS — first reveal. App solving the exact problem from post 3.';
      } else if (postNum > 4) {
        phoneRuleText = 'Posts 5+: PHONE VISIBLE — show outcomes, not the interface.';
      }
    } catch(pe) {}

    // ── Assemble brief text ──────────────────────────────────────────────────
    var SEP = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    var L = [];
    L.push('DESIGN BRIEF — ' + assetId);
    L.push(platform.toUpperCase() + '  ·  Day ' + day + '  ·  Week ' + week + '  ·  ' + pubDate);
    L.push(SEP);

    L.push('ASSET');
    L.push('Campaign:      ' + campaignId);
    L.push('Platform:      ' + platform);
    L.push('Funnel Stage:  ' + (funnel  || '—'));
    L.push('Post #:        ' + (postNum || '—'));
    if (dlId) L.push('DL ID:         ' + dlId);
    L.push('');

    L.push('ICP & EMOTIONAL ARC');
    L.push('ICP:           ' + (icp || '—'));
    L.push('Entry state:   ' + (spEmotionIn || emotionalEntry || emotion || '—'));
    L.push('Exit state:    ' + (spEmotionOut || emotionalPayoff || '—'));
    L.push('');

    if (themeName || themeCategory || imageMood) {
      L.push('THEME / IMAGE WORLD');
      if (themeName)     L.push('Theme:         ' + themeName);
      if (themeCategory) L.push('Category:      ' + themeCategory);
      if (imageMood)     L.push('Image mood:    ' + imageMood);
      L.push('');
    }

    if (spLpSection || lpSectionJob) {
      L.push('LP SECTION');
      L.push('Source:        ' + (spLpSection  || '—'));
      if (lpSectionJob)  L.push('Emotional job: ' + lpSectionJob);
      L.push('');
    }

    L.push('COPY');
    if (spHook)     L.push('Hook:\n' + spHook);
    if (spBody)     L.push('\nBody:\n' + spBody);
    if (spCta)      L.push('\nCTA:\n'  + spCta);
    if (spHashtags) L.push('\nHashtags: ' + spHashtags);
    L.push('');

    if (phoneRuleText) {
      L.push('PHONE RULE');
      L.push(phoneRuleText);
      L.push('');
    }

    if (claimsLines) {
      L.push('APPROVED CLAIMS — exact wording only, never invent numbers');
      L.push(claimsLines);
      L.push('');
    }

    if (spImageBrief) {
      L.push('IMAGE BRIEF');
      L.push(spImageBrief);
      L.push('');
    }

    if (spDesignBrief) {
      L.push('DESIGN NOTES');
      L.push(spDesignBrief);
      L.push('');
    }

    var brief = L.join('\n');
    Logger.log('[getPostDesignBrief] built brief for ' + assetId + ' (' + brief.length + ' chars)');
    return { ok: true, brief: brief, asset_id: assetId };
  } catch(e) {
    Logger.log('[getPostDesignBrief] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Save Design Artifact to Drive ─────────────────────────────────────────────
// saveDesignToDrive(assetId, htmlContent)
// Saves an HTML design artifact to the campaign Drive folder, writes the file
// URL back to ContentCalendar.claude_design_url, returns { ok, url, asset_id }.

function saveDesignToDrive(assetId, htmlContent) {
  if (!assetId)    return { ok: false, error: 'assetId required' };
  if (!htmlContent) return { ok: false, error: 'htmlContent required' };
  try {
    // Look up campaign_id from ContentCalendar
    var ccSheet  = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var ccLast   = ccSheet.getLastRow();
    var ccHdrs   = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var CH = {};
    ccHdrs.forEach(function(h, i) { CH[h] = i; });
    var ccData = ccSheet.getRange(2, 1, ccLast - 1, Math.min(ccHdrs.length, ccSheet.getLastColumn())).getValues();
    var ccRow = null, ccRowIndex = -1;
    for (var i = 0; i < ccData.length; i++) {
      if (String(ccData[i][CH.asset_id] || '') === assetId) { ccRow = ccData[i]; ccRowIndex = i; break; }
    }
    if (!ccRow) return { ok: false, error: 'Asset not found: ' + assetId };

    var campaignId = String(ccRow[CH.campaign_id] || '');
    var platform   = String(ccRow[CH.platform]    || '');
    var funnel     = String(ccRow[CH.funnel_stage] || '');

    // Campaign Drive folder
    var campaignFolderIds = { 'EC-2026-001': '1rB1OoKXiA1UjEKBTKhSsbQdw3jLs7CYU' };
    var folderId  = campaignFolderIds[campaignId] || '';
    var folder;
    try {
      folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
    } catch(fe) { folder = DriveApp.getRootFolder(); }

    // Create or update the design file
    var fileName = 'Design — ' + assetId + ' — ' + platform + ' — ' + funnel + '.html';
    var existingUrl = String((CH.claude_design_url !== undefined ? ccRow[CH.claude_design_url] : '') || '');

    var file;
    // If a file already exists, try to update it in place
    if (existingUrl) {
      try {
        var existingId = existingUrl.match(/[-\w]{25,}/);
        if (existingId) {
          var existingFile = DriveApp.getFileById(existingId[0]);
          existingFile.setContent(htmlContent);
          file = existingFile;
        }
      } catch(ue) { file = null; }
    }
    if (!file) {
      file = folder.createFile(fileName, htmlContent, MimeType.HTML);
    }

    // Make publicly readable so "View Design" works without auth prompt
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileUrl = 'https://drive.google.com/file/d/' + file.getId() + '/view';

    // Write URL back to ContentCalendar
    var safeColCount = Math.min(ccHdrs.length, ccSheet.getLastColumn());
    var designCol    = CH.claude_design_url + 1;
    var updatedCol   = CH.updated_at        + 1;
    if (designCol  > 0 && designCol  <= safeColCount) ccSheet.getRange(ccRowIndex + 2, designCol).setValue(fileUrl);
    if (updatedCol > 0 && updatedCol <= safeColCount) ccSheet.getRange(ccRowIndex + 2, updatedCol).setValue(new Date());

    Logger.log('[saveDesignToDrive] ' + assetId + ' → ' + fileUrl);
    return { ok: true, url: fileUrl, asset_id: assetId, file_name: fileName };
  } catch(e) {
    Logger.log('[saveDesignToDrive] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── GitHub API: push design HTML to repo → GitHub Pages URL ──────────────────
// _saveDesignToGithub(fileName, html)
// Commits the HTML file to /designs/ in the repo via GitHub API.
// Returns { ok, url } where url is the GitHub Pages served URL.
// Requires GITHUB_TOKEN in Script Properties (fine-grained or classic, repo write scope).

function _saveDesignToGithub(fileName, html) {
  var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) return { ok: false, error: 'GITHUB_TOKEN not set in Script Properties' };

  var owner = 'BoaterGuy15';
  var repo  = 'easyChef-Pro-Ops-Center';
  var path  = 'designs/' + fileName;
  var api   = 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + encodeURIComponent(path);

  var b64 = Utilities.base64Encode(Utilities.newBlob(html, 'text/html').getBytes());

  // Fetch existing SHA so we can update in-place
  var sha = null;
  try {
    var getResp = UrlFetchApp.fetch(api, {
      headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json' },
      muteHttpExceptions: true
    });
    if (getResp.getResponseCode() === 200) sha = JSON.parse(getResp.getContentText()).sha;
  } catch(ge) {}

  var payload = { message: 'design: ' + fileName, content: b64, branch: 'main' };
  if (sha) payload.sha = sha;

  var putResp = UrlFetchApp.fetch(api, {
    method: 'put',
    headers: { 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = putResp.getResponseCode();
  if (code !== 200 && code !== 201) {
    Logger.log('[_saveDesignToGithub] error ' + code + ': ' + putResp.getContentText().slice(0, 300));
    return { ok: false, error: 'GitHub API ' + code + ' — check GITHUB_TOKEN permissions' };
  }

  var ghPagesUrl = 'https://boaterguy15.github.io/easyChef-Pro-Ops-Center/designs/' + encodeURIComponent(fileName);
  Logger.log('[_saveDesignToGithub] pushed → ' + ghPagesUrl);
  return { ok: true, url: ghPagesUrl, path: path };
}

// ── One-button AI Design Generation ──────────────────────────────────────────
// generateDesignForAsset(assetId)
// Reads the full brief for a specific asset, calls Claude to generate an HTML
// design mockup, saves it to Drive, writes the URL back to ContentCalendar, and
// returns { ok, url, asset_id }.

function generateDesignForAsset(assetId) {
  if (!assetId) return { ok: false, error: 'assetId required' };
  try {
    // ── 1. ContentCalendar row ────────────────────────────────────────────────
    var ccSheet  = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var ccLast   = ccSheet.getLastRow();
    var ccHdrs   = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var CH = {};
    ccHdrs.forEach(function(h, i) { CH[h] = i; });
    var safeCC = Math.min(ccHdrs.length, ccSheet.getLastColumn());
    var ccData = ccSheet.getRange(2, 1, ccLast - 1, safeCC).getValues();
    var ccRow = null, ccRowIndex = -1;
    for (var i = 0; i < ccData.length; i++) {
      if (String(ccData[i][CH.asset_id] || '') === assetId) { ccRow = ccData[i]; ccRowIndex = i; break; }
    }
    if (!ccRow) return { ok: false, error: 'Asset not found: ' + assetId };

    var platform    = String(ccRow[CH.platform]      || '');
    var funnel      = String(ccRow[CH.funnel_stage]  || '');
    var icp         = String(ccRow[CH.icp_target]    || '');
    var emotion     = String(ccRow[CH.emotional_stage]|| '');
    var campaignId  = String(ccRow[CH.campaign_id]   || '');
    var ccCaption   = String(ccRow[CH.caption]        || '');
    var ccDay       = String(ccRow[CH.day]            || '');
    var existingUrl = String((CH.claude_design_url !== undefined ? ccRow[CH.claude_design_url] : '') || '');

    // Phone rule: derive from funnel stage (no post_num column in ContentCalendar)
    var phoneRule = '';
    if (funnel === 'hook' || funnel === 'problem' || funnel === 'awareness') {
      phoneRule = 'NO PHONE — ' + funnel + ' stage. Show problem world only. App not revealed yet.';
    } else if (funnel === 'agitate') {
      phoneRule = 'NO PHONE — agitate stage. Intensify the pain. App still hidden.';
    } else if (funnel === 'solve') {
      phoneRule = 'PHONE APPEARS — solve stage. First reveal. App solving the exact problem from agitate.';
    } else if (funnel === 'value' || funnel === 'proof' || funnel === 'cta') {
      phoneRule = 'PHONE VISIBLE — ' + funnel + ' stage. Show outcomes, not the interface.';
    } else {
      phoneRule = 'Funnel stage "' + funnel + '": apply brand phone reveal rules. When in doubt, no phone.';
    }

    // ── 2. SocialPosts copy (uses 'id' col, not asset_id) ────────────────────
    var spHook='', spBody='', spCta='', spHashtags='', spImageBrief='', spDesignBrief='';
    var spEmotionIn='', spEmotionOut='', spLpSection='';
    var foundInSocial = false;
    try {
      var spSheet = _getCCSheet(_CC_TAB.SOCIAL_POSTS);
      var spLast  = spSheet.getLastRow();
      var spHdrs  = _CC_HDR[_CC_TAB.SOCIAL_POSTS];
      var SH = {}; spHdrs.forEach(function(h, i) { SH[h] = i; });
      if (spLast >= 2) {
        var spData = spSheet.getRange(2, 1, spLast - 1, spHdrs.length).getValues();
        for (var j = 0; j < spData.length; j++) {
          if (String(spData[j][SH.id] || '') === assetId) {
            spHook        = String(spData[j][SH.hook]                 || '');
            spBody        = String(spData[j][SH.body_copy]            || '');
            spCta         = String(spData[j][SH.cta]                  || '');
            spHashtags    = String(spData[j][SH.hashtags]             || '');
            spImageBrief  = String(spData[j][SH.image_brief]          || '');
            spDesignBrief = String(spData[j][SH.design_brief]         || '');
            spEmotionIn   = String(spData[j][SH.emotional_state]      || '');
            spEmotionOut  = String(spData[j][SH.emotional_destination] || '');
            spLpSection   = String(spData[j][SH.lp_section_source]    || '');
            foundInSocial = true;
            break;
          }
        }
      }
    } catch(se) {}

    // ── 2b. EmailSequences fallback (emails use same id→asset_id pattern) ────
    if (!foundInSocial) {
      try {
        var emSheet = _getCCSheet(_CC_TAB.EMAIL);
        var emLast  = emSheet.getLastRow();
        var emHdrs  = _CC_HDR.EmailSequences;
        var EH = {}; emHdrs.forEach(function(h, i) { EH[h] = i; });
        if (emLast >= 2) {
          var emData = emSheet.getRange(2, 1, emLast - 1, emHdrs.length).getValues();
          for (var ej = 0; ej < emData.length; ej++) {
            if (String(emData[ej][EH.id] || '') === assetId) {
              spHook        = String(emData[ej][EH.subject_line]    || '');
              spBody        = String(emData[ej][EH.body_hook]       || '') +
                              (emData[ej][EH.body_problem] ? '\n\n' + emData[ej][EH.body_problem] : '') +
                              (emData[ej][EH.body_agitate] ? '\n\n' + emData[ej][EH.body_agitate] : '');
              spCta         = String(emData[ej][EH.body_cta]        || '');
              spEmotionIn   = String(emData[ej][EH.emotional_stage] || '');
              spDesignBrief = String(emData[ej][EH.design_brief]    || '');
              spLpSection   = String(emData[ej][EH.lp_section_source]|| '');
              break;
            }
          }
        }
      } catch(ee) {}
    }

    // Caption from ContentCalendar as last-resort copy fallback
    if (!spHook && ccCaption) spHook = ccCaption;

    // ── 3. Brand tokens ───────────────────────────────────────────────────────
    var BT = { primary_red:'#FF0000', beige:'#F6EFE8', black:'#000000', white:'#FFFFFF',
               headline_font:'Proza Libre', body_font:'Inter',
               cta_button_color:'#FF0000', cta_button_text:'#FFFFFF' };
    try {
      var bd = getBrandDoctrine('BRAND_VISUAL_TOKENS_001');
      if (bd && bd.conditions) { Object.keys(bd.conditions).forEach(function(k) { BT[k] = bd.conditions[k]; }); }
    } catch(be) {}

    // ── 4. Canvas dimensions from Channels tab ────────────────────────────────
    var canvasW = 1080, canvasH = 1080;
    try {
      var channels = getChannels();
      for (var ci = 0; ci < channels.length; ci++) {
        var chSlug = String(channels[ci].slug_code || '').toLowerCase();
        var chName = String(channels[ci].name      || '').toLowerCase();
        var plat   = platform.toLowerCase();
        if (chSlug === plat || chName.indexOf(plat) > -1) {
          var dimMatch = String(channels[ci].image_dimensions || '').match(/(\d+)\s*[x×]\s*(\d+)/i);
          if (dimMatch) { canvasW = parseInt(dimMatch[1]); canvasH = parseInt(dimMatch[2]); }
          break;
        }
      }
    } catch(che) {}

    // ── 5. Theme ──────────────────────────────────────────────────────────────
    var themeName='', themeCategory='', imageMood='', emotionalEntry='', emotionalPayoff='';
    try {
      var themes = getThemeLibrary(icp);
      if (themes && themes.length) {
        var th = themes[0];
        themeName       = String(th.theme_name      || '');
        themeCategory   = String(th.category        || '');
        imageMood       = String(th.image_mood_hook  || '');
        emotionalEntry  = String(th.emotional_entry  || '');
        emotionalPayoff = String(th.emotional_payoff || '');
      }
    } catch(te) {}

    // ── 6. Approved claims for funnel stage ───────────────────────────────────
    var claimsText = '';
    try {
      var scoping   = getCampaignStrategy('CLAIM_SCOPING_001');
      var secMap    = (scoping && scoping.value && scoping.value.section_claim_map) || {};
      var allClaims = getApprovedClaims() || [];
      var permitted = secMap[funnel] || [];
      if (!permitted.length && funnel === 'agitate') {
        var ag = {};
        ['agitate_money','agitate_time','agitate_nutrition'].forEach(function(sub) {
          (secMap[sub] || []).forEach(function(t) { ag[t] = true; });
        });
        permitted = Object.keys(ag);
      }
      if (permitted.length) {
        claimsText = allClaims.filter(function(c) { return permitted.indexOf(c.claim_type) > -1; })
          .map(function(c) { return c.exact_wording || ''; }).filter(Boolean).slice(0, 3).join(' · ');
      }
    } catch(ce) {}

    // ── 8. Build Claude prompts ───────────────────────────────────────────────
    var systemPrompt = [
      'You are a world-class UI/visual designer building social media post mockups as self-contained HTML pages.',
      'App: easyChef Pro — smart meal planning that transforms chaotic weeknight cooking into calm, confident kitchen mastery.',
      '',
      'CRITICAL OUTPUT RULE: Return ONLY raw HTML. No markdown. No code fences. No explanation.',
      'Your response must start with < (the opening < of <!DOCTYPE html>) and end with > (the closing > of </html>).',
      '',
      'Technical requirements:',
      '- Self-contained HTML file, all CSS in a <style> block in <head>',
      '- Load Google Fonts via CDN for: Proza Libre (headlines), Inter (body text)',
      '- body { margin:0; padding:0; width:' + canvasW + 'px; height:' + canvasH + 'px; overflow:hidden; }',
      '- The design must fill the entire ' + canvasW + '×' + canvasH + 'px canvas — no white borders or dead space',
      '',
      'Brand tokens — use these exact values:',
      '  Primary red:    ' + BT.primary_red,
      '  Beige:          ' + BT.beige,
      '  Black:          ' + BT.black,
      '  White:          ' + BT.white,
      '  Headline font:  ' + BT.headline_font,
      '  Body font:      ' + BT.body_font,
      '  CTA button:     ' + BT.cta_button_color + ' background, ' + BT.cta_button_text + ' text',
      '',
      'Design philosophy: Premium, clean, emotionally resonant. Not generic. Every pixel should earn its place.',
      '',
      'Phone rule — enforce strictly:',
      phoneRule
    ].join('\n');

    var upLines = [
      'Generate a social media post design mockup.',
      '',
      '═══ ASSET ════════════════════════════════════════',
      'Asset ID:     ' + assetId,
      'Platform:     ' + platform.toUpperCase(),
      'Campaign:     ' + campaignId,
      'Funnel stage: ' + (funnel  || '—'),
      (ccDay ? 'Day:          ' + ccDay : ''),
      'Canvas:       ' + canvasW + ' × ' + canvasH + 'px',
      '',
      '═══ COPY ═════════════════════════════════════════',
      'HOOK (headline):',
      spHook || '(no hook — design a compelling placeholder for easyChef Pro)',
      '',
      'BODY:',
      spBody || '(no body copy — create a placeholder)',
      '',
      'CTA: ' + (spCta || 'See how it works'),
      (spHashtags ? '\nHashtags: ' + spHashtags : ''),
      '',
      '═══ ICP & EMOTIONAL ARC ══════════════════════════',
      'ICP:         ' + (icp || '—'),
      'Entry state: ' + (spEmotionIn  || emotionalEntry  || emotion || '—'),
      'Exit state:  ' + (spEmotionOut || emotionalPayoff || '—'),
      (themeName     ? 'Theme:       ' + themeName     : ''),
      (themeCategory ? 'Category:    ' + themeCategory : ''),
      (imageMood     ? 'Image mood:  ' + imageMood     : '')
    ];
    if (claimsText)    { upLines.push('', '═══ APPROVED CLAIMS (exact wording only) ═════════', claimsText); }
    if (spImageBrief)  { upLines.push('', '═══ IMAGE BRIEF ══════════════════════════════════', spImageBrief); }
    if (spDesignBrief) { upLines.push('', '═══ DESIGN NOTES ═════════════════════════════════', spDesignBrief); }
    upLines.push(
      '',
      '═══ PHONE RULE ═══════════════════════════════════',
      phoneRule,
      '',
      '═══ OUTPUT INSTRUCTION ═══════════════════════════',
      'Design a ' + platform.toUpperCase() + ' post at exactly ' + canvasW + '×' + canvasH + 'px.',
      'Use the exact copy above. Apply brand colors and fonts precisely.',
      'Return ONLY raw HTML — no markdown, no fences, no explanation.'
    );
    var userPrompt = upLines.filter(function(l) { return l !== null && l !== undefined; }).join('\n');

    // ── 9. Call Claude ────────────────────────────────────────────────────────
    Logger.log('[generateDesignForAsset] calling Claude for ' + assetId);
    var rawHtml = callAnthropicModel(userPrompt, systemPrompt, 'claude-sonnet-4-20250514', 8192);
    if (!rawHtml || rawHtml.indexOf('Error:') === 0) {
      return { ok: false, error: rawHtml || 'Claude returned empty response' };
    }

    // Strip markdown fences if present despite instructions
    var html = rawHtml.trim();
    var fenceMatch = html.match(/^```(?:html)?\r?\n([\s\S]*?)\r?\n```$/i);
    if (fenceMatch) html = fenceMatch[1].trim();
    // Wrap bare fragment (no doctype/html tag)
    if (!html.match(/<!DOCTYPE|<html/i)) {
      html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>' + assetId + '</title></head><body>' + html + '</body></html>';
    }

    // ── 10. Save HTML to Drive ────────────────────────────────────────────────
    var campaignFolderIds = {
      'EC-2026-001': '1rB1OoKXiA1UjEKBTKhSsbQdw3jLs7CYU',
      'EC-2026-002': '1rB1OoKXiA1UjEKBTKhSsbQdw3jLs7CYU'
    };
    var folderId = campaignFolderIds[campaignId] || '';
    var folder;
    try { folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder(); }
    catch(fe) { folder = DriveApp.getRootFolder(); }

    var fileName = 'Design — ' + assetId + ' — ' + platform + ' — ' + funnel + '.html';
    var file = null;
    if (existingUrl) {
      try {
        var exMatch = existingUrl.match(/[-\w]{25,}/);
        if (exMatch) { var exFile = DriveApp.getFileById(exMatch[0]); exFile.setContent(html); file = exFile; }
      } catch(ue) { file = null; }
    }
    if (!file) { file = folder.createFile(fileName, html, MimeType.HTML); }
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Primary: push to GitHub → GitHub Pages serves it as rendered HTML
    var fileUrl = '';
    var ghResult = _saveDesignToGithub(fileName, html);
    if (ghResult.ok) {
      fileUrl = ghResult.url;
    } else {
      // Fallback: GAS doGet serves the Drive file as rendered HTML
      var _gasBase = '';
      try { _gasBase = ScriptApp.getService().getUrl(); } catch(_su) {}
      fileUrl = _gasBase
        ? _gasBase + '?action=view_design&file_id=' + file.getId()
        : 'https://drive.google.com/file/d/' + file.getId() + '/view';
      Logger.log('[generateDesignForAsset] GitHub save failed (' + ghResult.error + '), using GAS serve URL');
    }

    // ── 11. Write URL back to ContentCalendar ─────────────────────────────────
    var safeCC2   = Math.min(ccHdrs.length, ccSheet.getLastColumn());
    var designCol = CH.claude_design_url + 1;
    var updCol    = CH.updated_at        + 1;
    if (designCol > 0 && designCol <= safeCC2) ccSheet.getRange(ccRowIndex + 2, designCol).setValue(fileUrl);
    if (updCol    > 0 && updCol    <= safeCC2) ccSheet.getRange(ccRowIndex + 2, updCol).setValue(new Date());

    Logger.log('[generateDesignForAsset] done → ' + fileUrl);
    return { ok: true, url: fileUrl, asset_id: assetId, file_name: fileName };

  } catch(e) {
    Logger.log('[generateDesignForAsset] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Get raw HTML for a design (for Copy-to-Claude workflow) ──────────────────
// getDesignHtml(assetId) — reads claude_design_url from ContentCalendar,
// extracts file_id, returns the raw HTML string so the cockpit can copy it.

function getDesignHtml(assetId) {
  if (!assetId) return { ok: false, error: 'assetId required' };
  try {
    var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var ccLast  = ccSheet.getLastRow();
    var ccHdrs  = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var CH = {}; ccHdrs.forEach(function(h, i) { CH[h] = i; });
    var safeCC  = Math.min(ccHdrs.length, ccSheet.getLastColumn());
    var ccData  = ccSheet.getRange(2, 1, ccLast - 1, safeCC).getValues();
    for (var i = 0; i < ccData.length; i++) {
      if (String(ccData[i][CH.asset_id] || '') === assetId) {
        var storedUrl = String(ccData[i][CH.claude_design_url] || '');
        if (!storedUrl) return { ok: false, error: 'No design URL for this asset' };
        // Support both GAS serve URL (?file_id=...) and raw Drive URL (/file/d/ID/view)
        var fileIdMatch = storedUrl.match(/file_id=([^&]+)/) || storedUrl.match(/\/file\/d\/([-\w]+)/);
        if (!fileIdMatch) return { ok: false, error: 'Cannot parse file ID from URL: ' + storedUrl };
        var html = DriveApp.getFileById(fileIdMatch[1]).getBlob().getDataAsString();
        return { ok: true, html: html, asset_id: assetId };
      }
    }
    return { ok: false, error: 'Asset not found: ' + assetId };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}
