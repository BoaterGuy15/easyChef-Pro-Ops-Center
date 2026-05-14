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
// generateContentCalBriefDocs(campaignId, opts)
// Creates one Google Doc per ContentCalendar row — a production-ready creative
// execution brief with IDENTITY / COPY SYSTEM / DESIGN SYSTEM / VISUAL DIRECTION /
// CLAUDE DESIGN / FIGMA HANDOFF / DEPLOY sections.
// Joins to SocialPosts or EmailSequences by asset_id to pull actual copy content.
// opts.force=true regenerates rows that already have a brief_doc_url.

function generateContentCalBriefDocs(campaignId, opts) {
  if (!campaignId) return { ok: false, error: 'campaignId required' };
  opts = opts || {};
  var force = !!(opts.force);
  try {
    var tz = Session.getScriptTimeZone();
    var ccSheet  = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last     = ccSheet.getLastRow();
    if (last < 2) return { ok: true, created: 0, skipped: 0 };

    var headers  = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var H = {};
    headers.forEach(function(h, i) { H[h] = i; });
    var briefCol = headers.indexOf('brief_doc_url') + 1;

    var data = ccSheet.getRange(2, 1, last - 1, headers.length).getValues();

    // ── Pre-load SocialPosts → lookup map keyed by id ───────────────────────
    var spMap = {};
    try {
      var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
      var spLast  = spSheet.getLastRow();
      if (spLast >= 2) {
        var spHdrs = _CC_HDR.SocialPosts;
        var SH = {};
        spHdrs.forEach(function(h, i) { SH[h] = i; });
        var spData = spSheet.getRange(2, 1, spLast - 1, spHdrs.length).getValues();
        spData.forEach(function(sr) {
          var id = String(sr[SH.id] || '').trim();
          if (!id) return;
          spMap[id] = {
            hook:                  String(sr[SH.hook]                   || ''),
            body_copy:             String(sr[SH.body_copy]              || ''),
            cta:                   String(sr[SH.cta]                    || ''),
            hashtags:              String(sr[SH.hashtags]               || ''),
            image_brief:           String(sr[SH.image_brief]            || ''),
            design_brief:          String(sr[SH.design_brief]           || ''),
            dl_id:                 String(sr[SH.dl_id]                  || ''),
            utm_url:               String(sr[SH.utm_url]                || ''),
            lp_section_source:     String(sr[SH.lp_section_source]      || ''),
            loop_stage:            String(sr[SH.loop_stage]             || ''),
            emotional_state:       String(sr[SH.emotional_state]        || ''),
            emotional_destination: String(sr[SH.emotional_destination]  || '')
          };
        });
      }
    } catch(se) { Logger.log('[generateContentCalBriefDocs] spMap error: ' + se.message); }

    // ── Pre-load EmailSequences → lookup map keyed by id ────────────────────
    var emMap = {};
    try {
      var emSheet = _getCCSheet(_CC_TAB.EMAIL);
      var emLast  = emSheet.getLastRow();
      if (emLast >= 2) {
        var emHdrs = _CC_HDR.EmailSequences;
        var EH = {};
        emHdrs.forEach(function(h, i) { EH[h] = i; });
        var emData = emSheet.getRange(2, 1, emLast - 1, emHdrs.length).getValues();
        emData.forEach(function(er) {
          var id = String(er[EH.id] || '').trim();
          if (!id) return;
          emMap[id] = {
            subject_line:    String(er[EH.subject_line]    || ''),
            preview_text:    String(er[EH.preview_text]    || ''),
            body_hook:       String(er[EH.body_hook]       || ''),
            body_problem:    String(er[EH.body_problem]    || ''),
            body_agitate:    String(er[EH.body_agitate]    || ''),
            body_solve:      String(er[EH.body_solve]      || ''),
            body_value:      String(er[EH.body_value]      || ''),
            body_proof:      String(er[EH.body_proof]      || ''),
            body_cta:        String(er[EH.body_cta]        || ''),
            send_day:        String(er[EH.send_day]        || ''),
            trigger_event:   String(er[EH.trigger_event]   || ''),
            funnel_stage:    String(er[EH.funnel_stage]    || ''),
            sequence_code:   String(er[EH.sequence_code]   || ''),
            dl_id:           String(er[EH.dl_id]           || ''),
            full_email_body: String(er[EH.full_email_body] || '')
          };
        });
      }
    } catch(ee) { Logger.log('[generateContentCalBriefDocs] emMap error: ' + ee.message); }

    // ── Campaign Drive folder ─────────────────────────────────────────────────
    var campaignFolderIds = { 'EC-2026-001': '1rB1OoKXiA1UjEKBTKhSsbQdw3jLs7CYU' };
    var folderId = campaignFolderIds[campaignId] || '';
    var briefFolder;
    try {
      if (folderId) briefFolder = DriveApp.getFolderById(folderId);
    } catch(fe) {}
    if (!briefFolder) briefFolder = DriveApp.getRootFolder();

    var created = 0, skipped = 0;
    var BATCH = 30;

    for (var i = 0; i < data.length && created < BATCH; i++) {
      var r = data[i];
      if (!r[0] || String(r[H.campaign_id]) !== campaignId) continue;
      var existing = String(r[H.brief_doc_url] || '');
      if (existing && !force) { skipped++; continue; }

      var assetId   = String(r[H.asset_id]     || '');
      var platform  = String(r[H.platform]     || '');
      var calId     = String(r[H.calendar_id]  || '');
      var dlId      = String(r[H.dl_id]        || '');
      var funnel    = String(r[H.funnel_stage] || '');
      var emotion   = String(r[H.emotional_stage] || '');
      var icpRaw    = String(r[H.icp_target]   || '');
      var status    = String(r[H.status]       || '');
      var day       = String(r[H.day]          || '');
      var week      = String(r[H.week]         || '');
      var seqCode   = String((H.sequence_code !== undefined ? r[H.sequence_code] : '') || '');
      var blockedBy = String(r[H.blocked_by]   || '');

      // Date fix — strip 1899 ghost from time-only serial values
      var pubDateVal = r[H.publish_date];
      var pubDate = '';
      if (pubDateVal instanceof Date && !isNaN(pubDateVal.getTime())) {
        pubDate = Utilities.formatDate(pubDateVal, tz, 'yyyy-MM-dd');
      } else {
        pubDate = String(pubDateVal || '');
      }
      var pubTimeVal = r[H.publish_time];
      var pubTime = '';
      if (pubTimeVal instanceof Date && !isNaN(pubTimeVal.getTime())) {
        pubTime = Utilities.formatDate(pubTimeVal, tz, 'HH:mm');
      } else {
        pubTime = String(pubTimeVal || '');
      }

      // ICP fix — single ICP based on post index (odd=A=money, even=B=time)
      var icp = icpRaw;
      if (icp.indexOf('|') >= 0) {
        var icpParts = icp.split('|');
        var postMatch = assetId.match(/(\d+)$/);
        var postIdx = postMatch ? parseInt(postMatch[1], 10) : 0;
        icp = (postIdx % 2 === 1) ? (icpParts[0] || icp) : (icpParts[1] || icp);
      }

      var isEmail = (platform.toLowerCase() === 'email');
      var isVideo = (['tiktok','youtube'].indexOf(platform.toLowerCase()) > -1);
      var sp = spMap[assetId] || null;
      var em = emMap[assetId] || null;

      var _gbGasBase = 'https://script.google.com/macros/s/AKfycbxgwJT_MZigRzZ7sYuULrnxMB1ITfU_2TUCfpSfqJJDbgme1rTsWjf7RaiHQFQOJuOPbQ/exec';
      var briefUrl = _gbGasBase + '?action=view_brief&asset_id=' + encodeURIComponent(assetId);
      ccSheet.getRange(i + 2, briefCol).setValue(briefUrl);
      created++;
      Logger.log('[generateContentCalBriefDocs] ' + assetId + ' → ' + briefUrl);
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
      body.appendParagraph('Primary:   #FF0000  (easyChef red)');
      body.appendParagraph('Background: #F6EFE8  (warm beige)');
      body.appendParagraph('Text:       #000000  (black)');
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

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var _gasBase = '';
    try { _gasBase = ScriptApp.getService().getUrl(); } catch(_su) {}
    var fileUrl = _gasBase
      ? _gasBase + '?action=view_design&file_id=' + file.getId()
      : 'https://drive.google.com/file/d/' + file.getId() + '/view';

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
    // GAS doGet renders the Drive HTML — Drive viewer shows source, GAS renders it
    var _gasBase2 = '';
    try { _gasBase2 = ScriptApp.getService().getUrl(); } catch(_su2) {}
    var fileUrl = _gasBase2
      ? _gasBase2 + '?action=view_design&file_id=' + file.getId()
      : 'https://drive.google.com/file/d/' + file.getId() + '/view';

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

// ── Push current Drive design to GitHub (on-demand) ──────────────────────────
// saveDesignToGithub(assetId) — reads HTML from Drive, pushes to /designs/ repo,
// returns { ok, url } with the GitHub Pages URL.

function saveDesignToGithub(assetId) {
  if (!assetId) return { ok: false, error: 'assetId required' };
  try {
    var r = getDesignHtml(assetId);
    if (!r.ok) return r;
    var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var ccHdrs  = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var CH = {}; ccHdrs.forEach(function(h, i) { CH[h] = i; });
    var ccData  = ccSheet.getRange(2, 1, ccSheet.getLastRow() - 1, Math.min(ccHdrs.length, ccSheet.getLastColumn())).getValues();
    var ccRow = null, ccRowIndex = -1;
    for (var i = 0; i < ccData.length; i++) {
      if (String(ccData[i][CH.asset_id] || '') === assetId) { ccRow = ccData[i]; ccRowIndex = i; break; }
    }
    if (!ccRow) return { ok: false, error: 'Asset not found' };
    var platform = String(ccRow[CH.platform]    || '');
    var funnel   = String(ccRow[CH.funnel_stage] || '');
    var fileName = 'Design — ' + assetId + ' — ' + platform + ' — ' + funnel + '.html';
    var ghResult = _saveDesignToGithub(fileName, r.html);
    if (!ghResult.ok) return ghResult;
    return { ok: true, url: ghResult.url, asset_id: assetId };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── Full 1500-word email body generation ──────────────────────────────────────
// generateEmailBody(emailId) — reads EmailSequences row + LP spine, calls Claude
// for a ~1500-word brand-voice email, writes back to full_email_body column,
// returns { ok, email_id, full_email_body, word_count }.

function generateEmailBody(emailId) {
  if (!emailId) return { ok: false, error: 'emailId required' };
  try {
    var emSheet = _getCCSheet(_CC_TAB.EMAIL);
    var emLast  = emSheet.getLastRow();
    if (emLast < 2) return { ok: false, error: 'No email rows in sheet' };
    var emHdrs = _CC_HDR.EmailSequences;
    var EH = {}; emHdrs.forEach(function(h, i) { EH[h] = i; });
    var safeEm = Math.min(emHdrs.length, emSheet.getLastColumn());
    var emData = emSheet.getRange(2, 1, emLast - 1, safeEm).getValues();

    var emRow = null, emRowIndex = -1;
    for (var i = 0; i < emData.length; i++) {
      if (String(emData[i][EH.id] || '') === emailId) {
        emRow = emData[i]; emRowIndex = i; break;
      }
    }
    if (!emRow) return { ok: false, error: 'Email not found: ' + emailId };

    var campaignId   = String(emRow[EH.campaign_id]      || '');
    var subjectLine  = String(emRow[EH.subject_line]     || '');
    var previewText  = String(emRow[EH.preview_text]     || '');
    var bodyHook     = String(emRow[EH.body_hook]        || '');
    var bodyProblem  = String(emRow[EH.body_problem]     || '');
    var bodyAgitate  = String(emRow[EH.body_agitate]     || '');
    var bodySolve    = String(emRow[EH.body_solve]       || '');
    var bodyValue    = String(emRow[EH.body_value]       || '');
    var bodyProof    = String(emRow[EH.body_proof]       || '');
    var bodyCta      = String(emRow[EH.body_cta]         || '');
    var funnel       = String(emRow[EH.funnel_stage]     || '');
    var emotionStage = String(emRow[EH.emotional_stage]  || '');
    var subjectAngle = String(emRow[EH.subject_angle]    || '');
    var bodyTheme    = String(emRow[EH.body_theme]       || '');
    var role         = String(emRow[EH.role]             || '');
    var designBrief  = String(emRow[EH.design_brief]     || '');
    var lpSection    = String(emRow[EH.lp_section_source]|| '');
    var claimSet     = String(emRow[EH.claim_set]        || '');
    var emailNumber  = String(emRow[EH.email_number]     || '');

    // ── LP spine ──────────────────────────────────────────────────────────────
    var lpSpineJson = '';
    try {
      var bfSheet = _getCCSheet(_CC_TAB.BRIEFS);
      var bfHdrs  = _CC_HDR.CampaignBriefs;
      var BH = {}; bfHdrs.forEach(function(h, i) { BH[h] = i; });
      var bfLast  = bfSheet.getLastRow();
      if (bfLast >= 2) {
        var bfData = bfSheet.getRange(2, 1, bfLast - 1, Math.min(bfHdrs.length, bfSheet.getLastColumn())).getValues();
        for (var bi = 0; bi < bfData.length; bi++) {
          if (String(bfData[bi][BH.id] || '') === campaignId) {
            lpSpineJson = String(bfData[bi][BH.lp_campaign_spine_json] || '');
            break;
          }
        }
      }
    } catch(lpErr) { Logger.log('[generateEmailBody] LP spine error: ' + lpErr.message); }

    // ── Approved claims ───────────────────────────────────────────────────────
    var claimsText = '$1,336/year savings · 69.5% less food waste · 30 minutes fridge to table · 9 patent-pending technologies · 800,000 products · 10,000 recipe pages at launch · registered dietitians · 60% off founding discount · $7.99/month founding price';
    try {
      var approvedClaims = getApprovedClaims();
      if (approvedClaims && approvedClaims.length) {
        claimsText = approvedClaims.map(function(c) { return c.exact_wording || c.claim || ''; }).filter(Boolean).join(' · ');
      }
    } catch(clErr) { Logger.log('[generateEmailBody] claims error: ' + clErr.message); }

    // ── System prompt ─────────────────────────────────────────────────────────
    var systemPrompt = [
      'You are the easyChef Pro email copywriter. Write in brand voice: direct, warm, credible, specific. Never use: optimize, seamless, leverage, ecosystem, AI-powered (as primary claim), pain points, "the app", shame language, or invented statistics.',
      '',
      'APPROVED CLAIMS (use these exactly — no rounding, no paraphrasing):',
      claimsText,
      '',
      'BRAND RULES:',
      '- Lead with the reader\'s real life — their fridge, their Wednesday, their food stress',
      '- Short sentences. Short paragraphs. White space. Scannable.',
      '- Write like a smart friend who happens to know a lot about food and nutrition.',
      '- Never shame. Never guilt. Never manufactured urgency.',
      '- $7.99/month and 60% off are the founding offer — always frame as limited access, not pressure.',
      '',
      'OUTPUT: ~1,500 words of plain prose email body. No HTML. No section labels. Natural flow: Hook → Problem → Agitate → Solve → Value → Proof → CTA.',
    ].join('\n');

    // ── User prompt ───────────────────────────────────────────────────────────
    var upLines = [
      'Write a full ~1,500-word email body for easyChef Pro.',
      '',
      'EMAIL ID: ' + emailId,
      'CAMPAIGN: ' + campaignId,
      'EMAIL #: ' + emailNumber,
      'SUBJECT LINE: ' + subjectLine,
      'PREVIEW TEXT: ' + previewText,
      'FUNNEL STAGE: ' + funnel,
      'EMOTIONAL STAGE: ' + emotionStage,
      'ROLE: ' + role,
      'SUBJECT ANGLE: ' + subjectAngle,
      'BODY THEME: ' + bodyTheme,
      'LP SECTION SOURCE: ' + lpSection,
      'CLAIM SET: ' + claimSet,
      '',
      'STRUCTURAL BRIEF:',
    ];
    if (bodyHook)    upLines.push('HOOK:     ' + bodyHook);
    if (bodyProblem) upLines.push('PROBLEM:  ' + bodyProblem);
    if (bodyAgitate) upLines.push('AGITATE:  ' + bodyAgitate);
    if (bodySolve)   upLines.push('SOLVE:    ' + bodySolve);
    if (bodyValue)   upLines.push('VALUE:    ' + bodyValue);
    if (bodyProof)   upLines.push('PROOF:    ' + bodyProof);
    if (bodyCta)     upLines.push('CTA:      ' + bodyCta);
    if (designBrief) { upLines.push(''); upLines.push('DESIGN BRIEF: ' + designBrief); }
    if (lpSpineJson) { upLines.push(''); upLines.push('LP SPINE (source of truth):'); upLines.push(lpSpineJson.slice(0, 3000)); }
    upLines.push('');
    upLines.push('Write the full ~1,500-word email body now. No section headers. Plain prose. Start directly with the hook. End with a clear CTA for the founding offer ($7.99/month, 60% off).');

    var userPrompt = upLines.join('\n');

    Logger.log('[generateEmailBody] calling Claude for ' + emailId);
    var fullBody = callAnthropicModel(userPrompt, systemPrompt, 'claude-sonnet-4-20250514', 4096);
    if (!fullBody || fullBody.indexOf('Error:') === 0) {
      return { ok: false, error: fullBody || 'Claude returned empty response' };
    }

    // ── Write back to EmailSequences ──────────────────────────────────────────
    var bodyColIdx = EH.full_email_body;
    if (bodyColIdx !== undefined && bodyColIdx >= 0 && bodyColIdx < safeEm) {
      emSheet.getRange(emRowIndex + 2, bodyColIdx + 1).setValue(fullBody);
    } else {
      var allSheetHdrs = emSheet.getRange(1, 1, 1, emSheet.getLastColumn()).getValues()[0];
      var fIdx = allSheetHdrs.indexOf('full_email_body');
      if (fIdx >= 0) emSheet.getRange(emRowIndex + 2, fIdx + 1).setValue(fullBody);
    }

    var wordCount = fullBody.split(/\s+/).filter(Boolean).length;
    Logger.log('[generateEmailBody] done — ' + wordCount + ' words for ' + emailId);
    return { ok: true, email_id: emailId, full_email_body: fullBody, word_count: wordCount };

  } catch(e) {
    Logger.log('[generateEmailBody] ERROR: ' + e.message);
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

// ── HTML Brief Renderer ───────────────────────────────────────────────────────
// renderBriefHtml(assetId) — builds a full HTML brief for the view_brief doGet.
// Reads ContentCalendar + SocialPosts or EmailSequences. Returns HTML string.

function _bDecode(s) {
  // Fix UTF-8 mojibake. Explicit Unicode escape sequences — most specific first
  // so single-char catch-alls cannot corrupt 3-char em-dash sequences.
  var t = String(s || '');
  // 3-byte mojibake: U+00E2 + U+20AC + third-byte (Windows-1252 table)
  t = t.replace(/â€”/g, '—'); // â€" EM DASH
  t = t.replace(/â€“/g, '–'); // â€" EN DASH
  t = t.replace(/â€™/g, '’'); // â€™ right single quote
  t = t.replace(/â€˜/g, '‘'); // â€˜ left single quote
  t = t.replace(/â€œ/g, '“'); // â€œ left double quote
  t = t.replace(/â€¢/g, '•'); // â€¢ bullet
  t = t.replace(/â€/g,       '”'); // â€  right double quote (2-byte fallback)
  t = t.replace(/â†’/g, '→'); // â†' right arrow
  t = t.replace(/Â·/g,       '·'); // Â·  middle dot
  // HTML entity cleanup
  t = t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  return t;
}

function _bH(text) { return _bDecode(text).replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function renderBriefHtml(assetId) {
  var tz = Session.getScriptTimeZone();

  // ── Brand tokens from BrandDoctrine (BRAND_VISUAL_TOKENS_001) ─────────────
  var BT = { primary_red:'#FF0000', beige:'#F6EFE8', black:'#000000', white:'#FFFFFF',
             cta_button_color:'#FF0000', cta_button_text:'#FFFFFF',
             headline_font:'Proza Libre', body_font:'Inter',
             shadow:'none', border_radius_pill:'999px' };
  try {
    var _btDoc = getBrandDoctrine('BRAND_VISUAL_TOKENS_001');
    if (_btDoc && _btDoc.conditions) {
      Object.keys(_btDoc.conditions).forEach(function(k) { BT[k] = _btDoc.conditions[k]; });
    }
  } catch(_bte) {}

  // ── Load ContentCalendar row ───────────────────────────────────────────────
  var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
  var ccLast  = ccSheet.getLastRow();
  var ccHdrs  = _CC_HDR[_CC_TAB.CONTENT_CAL];
  var CH = {}; ccHdrs.forEach(function(h,i){ CH[h]=i; });
  var data = ccSheet.getLastRow() < 2 ? [] :
    ccSheet.getRange(2, 1, ccLast - 1, Math.min(ccHdrs.length, ccSheet.getLastColumn())).getValues();
  var ccRow = null;
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][CH.asset_id] || '') === assetId) { ccRow = data[i]; break; }
  }
  if (!ccRow) throw new Error('Asset not found in ContentCalendar: ' + assetId);

  var campaignId  = String(ccRow[CH.campaign_id]     || '');
  var platform    = String(ccRow[CH.platform]        || '');
  var calId       = String(ccRow[CH.calendar_id]     || '');
  var dlId        = String(ccRow[CH.dl_id]           || '');
  var funnel      = String(ccRow[CH.funnel_stage]    || '');
  var emotion     = String(ccRow[CH.emotional_stage] || '');
  var icpRaw      = String(ccRow[CH.icp_target]      || '');
  var status      = String(ccRow[CH.status]          || '');
  var day         = String(ccRow[CH.day]             || '');
  var week        = String(ccRow[CH.week]            || '');
  var seqCode     = String((CH.sequence_code !== undefined ? ccRow[CH.sequence_code] : '') || '');
  var blockedBy   = String(ccRow[CH.blocked_by]      || '');

  var pubDateVal  = ccRow[CH.publish_date];
  var pubDate = (pubDateVal instanceof Date && !isNaN(pubDateVal.getTime()))
    ? Utilities.formatDate(pubDateVal, tz, 'yyyy-MM-dd') : String(pubDateVal || '');
  var pubTimeVal  = ccRow[CH.publish_time];
  var pubTime = (pubTimeVal instanceof Date && !isNaN(pubTimeVal.getTime()))
    ? Utilities.formatDate(pubTimeVal, tz, 'HH:mm') : String(pubTimeVal || '');

  // ICP: single value based on post index
  var icp = icpRaw;
  if (icp.indexOf('|') >= 0) {
    var ip = icp.split('|'); var pm = assetId.match(/(\d+)$/);
    icp = ((pm && parseInt(pm[1],10) % 2 === 1) ? ip[0] : ip[1]) || icp;
  }

  var isEmail = (platform.toLowerCase() === 'email');
  var isVideo = (['tiktok','youtube'].indexOf(platform.toLowerCase()) > -1);

  // ── Load SocialPost or EmailSequence ────────────────────────────────────────
  var sp = null, em = null;
  if (isEmail) {
    try {
      var emSheet = _getCCSheet(_CC_TAB.EMAIL);
      var emLast  = emSheet.getLastRow();
      var emHdrs  = _CC_HDR.EmailSequences;
      var EH = {}; emHdrs.forEach(function(h,i){EH[h]=i;});
      var emData  = emSheet.getRange(2, 1, emLast - 1, emHdrs.length).getValues();
      for (var j = 0; j < emData.length; j++) {
        if (String(emData[j][EH.id]||'') === assetId || String(emData[j][EH.dl_id]||'') === dlId) {
          var er = emData[j];
          em = {
            subject_line:  _bDecode(er[EH.subject_line]  || ''),
            preview_text:  _bDecode(er[EH.preview_text]  || ''),
            body_hook:     _bDecode(er[EH.body_hook]     || ''),
            body_problem:  _bDecode(er[EH.body_problem]  || ''),
            body_agitate:  _bDecode(er[EH.body_agitate]  || ''),
            body_solve:    _bDecode(er[EH.body_solve]    || ''),
            body_value:    _bDecode(er[EH.body_value]    || ''),
            body_proof:    _bDecode(er[EH.body_proof]    || ''),
            body_cta:      _bDecode(er[EH.body_cta]      || ''),
            send_day:      String(er[EH.send_day]        || ''),
            trigger_event: _bDecode(er[EH.trigger_event] || ''),
            sequence_code: String(er[EH.sequence_code]   || ''),
            dl_id:         String(er[EH.dl_id]           || ''),
            funnel_stage:  String(er[EH.funnel_stage]    || '')
          };
          break;
        }
      }
    } catch(ee) {}
  } else {
    try {
      var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
      var spLast  = spSheet.getLastRow();
      var spHdrs  = _CC_HDR.SocialPosts;
      var SH = {}; spHdrs.forEach(function(h,i){SH[h]=i;});
      var spData  = spSheet.getRange(2, 1, spLast - 1, spHdrs.length).getValues();
      for (var k = 0; k < spData.length; k++) {
        if (String(spData[k][SH.id]||'') === assetId || String(spData[k][SH.dl_id]||'') === dlId) {
          var sr = spData[k];
          sp = {
            hook:                  _bDecode(sr[SH.hook]                   || ''),
            body_copy:             _bDecode(sr[SH.body_copy]              || ''),
            cta:                   _bDecode(sr[SH.cta]                    || ''),
            hashtags:              _bDecode(sr[SH.hashtags]               || ''),
            image_brief:           _bDecode(sr[SH.image_brief]            || ''),
            dl_id:                 String(sr[SH.dl_id]                    || ''),
            utm_url:               String(sr[SH.utm_url]                  || ''),
            lp_section_source:     String(sr[SH.lp_section_source]        || ''),
            loop_stage:            String(sr[SH.loop_stage]               || ''),
            emotional_state:       _bDecode(sr[SH.emotional_state]        || ''),
            emotional_destination: _bDecode(sr[SH.emotional_destination]  || '')
          };
          break;
        }
      }
    } catch(se) {}
  }

  // ── Derived values ──────────────────────────────────────────────────────────
  // Fallback: pull dl_id from SocialPost or Email when CC row has none
  if (!dlId && sp && sp.dl_id) dlId = sp.dl_id;
  if (!dlId && em && em.dl_id) dlId = em.dl_id;
  // Fallback: funnel stage from SocialPost when CC row has none
  if (!funnel && sp) funnel = sp.lp_section_source || sp.loop_stage || '';
  if (!funnel && em) funnel = em.funnel_stage || '';
  // Fallback: email publish date — derive from campaign start + send_day
  if (!pubDate && em && em.send_day) {
    try {
      var _csDate = new Date(2026, 4, 27); // EC-2026-001 campaign start
      try {
        var _cbData = getCampaignBriefs(campaignId);
        if (_cbData && _cbData.launch_date) _csDate = new Date(_cbData.launch_date);
      } catch(_cbe) {}
      var _sdDate = new Date(_csDate.getTime());
      _sdDate.setDate(_sdDate.getDate() + (parseInt(em.send_day, 10) - 1));
      pubDate = Utilities.formatDate(_sdDate, tz, 'yyyy-MM-dd');
    } catch(_de) {}
  }
  var lpSection   = (sp && sp.lp_section_source) || funnel || '';
  var emotionIn   = (sp && sp.emotional_state)   || emotion || '';
  var emotionOut  = (sp && sp.emotional_destination) || '';
  var utmDisplay  = dlId + (lpSection ? '_' + lpSection : '') + (day ? '_d' + day : '');
  var arcThemes   = ['hook','problem','agitate','solve','value','proof','cta'];
  var postNum     = 0; var pn = assetId.match(/(\d+)$/); if (pn) postNum = parseInt(pn[1],10);
  var phoneOk     = (postNum > 3) || isEmail;
  var phonePill   = phoneOk
    ? '<span style="background:#00B050;color:#fff;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;">PHONE VISIBLE</span>'
    : '<span style="background:#FF0000;color:#fff;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;">NO PHONE</span>';

  var plat       = platform.toLowerCase();
  var layoutType = 'Social Static Card — 1:1';
  var frameSize  = '1080 x 1080px';
  if (plat==='facebook')  { layoutType='Facebook Feed — 4:5';      frameSize='1080 x 1350px'; }
  if (plat==='instagram') { layoutType='Instagram Feed — 1:1';     frameSize='1080 x 1080px'; }
  if (plat==='pinterest') { layoutType='Pinterest Card — 2:3';     frameSize='1000 x 1500px'; }
  if (plat==='x')         { layoutType='X Card — 16:9';            frameSize='1200 x 675px'; }
  if (plat==='nextdoor')  { layoutType='Nextdoor Card — 1:1';      frameSize='1080 x 1080px'; }
  if (plat==='tiktok')    { layoutType='TikTok/Reels — 9:16';      frameSize='1080 x 1920px'; }
  if (plat==='youtube')   { layoutType='YouTube — 16:9';           frameSize='1920 x 1080px'; }

  var GAS_URL = 'https://script.google.com/macros/s/AKfycbxgwJT_MZigRzZ7sYuULrnxMB1ITfU_2TUCfpSfqJJDbgme1rTsWjf7RaiHQFQOJuOPbQ/exec';

  // ── Copy button helper ─────────────────────────────────────────────────────
  function copyBtn(id) {
    return '<button onclick="copyField(\'' + id + '\')" style="float:right;background:#FF0000;color:#fff;border:none;padding:3px 10px;border-radius:4px;font-size:11px;cursor:pointer;font-family:Inter,sans-serif;">Copy</button>';
  }
  function field(label, value, id) {
    if (!value) return '<div class="field"><span class="label">' + label + '</span><span class="empty">—</span></div>';
    return '<div class="field">' + copyBtn(id || label) + '<span class="label">' + label + '</span><span id="' + (id||label) + '" class="value">' + _bH(value) + '</span></div>';
  }
  function block(label, value, id) {
    if (!value) return '<div class="block"><span class="label">' + label + '</span><div class="empty-block">(not yet generated)</div></div>';
    return '<div class="block">' + copyBtn(id || label) + '<span class="label">' + label + '</span><pre id="' + (id||label) + '" class="body-text">' + _bH(value) + '</pre></div>';
  }
  function section(title, content) {
    return '<section><h2>' + title + '</h2><div class="section-body">' + content + '</div></section>';
  }
  function metric(label, value) {
    return '<div class="metric"><div class="metric-label">' + label + '</div><div class="metric-value">' + _bH(value) + '</div></div>';
  }

  // ── IDENTITY section ───────────────────────────────────────────────────────
  var sIdentity =
    field('Asset ID', assetId, 'asset_id') +
    field('Campaign', campaignId, 'cmp') +
    field('Calendar ID', calId, 'cal_id') +
    field('DL ID', dlId, 'dl_id') +
    field('Platform', platform, 'plat') +
    field('Publish Date', pubDate + (pubTime ? '  ' + pubTime : ''), 'pub') +
    field('Campaign Day', 'Day ' + day + '  ·  Week ' + week, 'day') +
    field('Status', status, 'status') +
    (seqCode ? field('Sequence', seqCode, 'seq') : '') +
    '<div class="field"><span class="label">Phone Rule</span>' + phonePill + '</div>';

  // ── COPY SYSTEM section ────────────────────────────────────────────────────
  var sCopy =
    field('Funnel Stage', funnel, 'fstage') +
    field('Emotional Arc', (emotionIn || '—') + ' -> ' + (emotionOut || '—'), 'emo') +
    field('ICP Target', icp, 'icp') +
    field('LP Section', lpSection, 'lpsec') +
    field('Loop Stage', (sp && sp.loop_stage) || funnel, 'loop');

  if (isEmail && em) {
    sCopy +=
      block('Subject Line', em.subject_line, 'subj') +
      block('Preview Text', em.preview_text, 'prev') +
      (em.send_day ? field('Send Day', 'Day ' + em.send_day, 'sd') : '') +
      (em.trigger_event ? field('Trigger', em.trigger_event, 'trig') : '') +
      field('Sequence Type', em.sequence_code, 'sqt');
  } else if (sp) {
    sCopy +=
      block('Hook', sp.hook, 'hook') +
      block('Body Copy', sp.body_copy, 'body') +
      block('CTA', sp.cta, 'cta') +
      (sp.hashtags ? block('Hashtags', sp.hashtags, 'tags') : '');
  }

  sCopy += field('UTM String', utmDisplay, 'utm');

  // ── EMAIL BODY section ─────────────────────────────────────────────────────
  var sEmailBody = '';
  if (isEmail && em) {
    var bodyParts = [em.body_hook, em.body_problem, em.body_agitate, em.body_solve, em.body_value, em.body_proof, em.body_cta];
    var fullBody  = bodyParts.filter(Boolean).join('\n\n');
    sEmailBody = section('EMAIL BODY', block('Full Email Body', fullBody, 'fullbody'));
  }

  // ── VIDEO STORYBOARD section (YouTube / TikTok) ───────────────────────────
  var sVideo = '';
  if (isVideo && sp && sp.body_copy) {
    var _vbRaw = sp.body_copy;
    var _vbParts = _vbRaw.split(/(?=(?:\*\*)?Scene\s+\d+)/i);
    var _vbScenes = [];
    _vbParts.forEach(function(part) {
      var _hM = part.match(/^(?:\*\*)?Scene\s+(\d+[^\n]*)/i);
      if (!_hM) return;
      var _vM = part.match(/Visual:\s*([^\n]+)/i);
      var _voM = part.match(/VO:\s*([\s\S]+?)(?=\n\n|\n(?:\*\*)?Scene|$)/i);
      _vbScenes.push({
        label: _hM[0].replace(/\*\*/g,'').trim(),
        visual: _vM  ? _vM[1].trim()  : '',
        vo:     _voM ? _voM[1].replace(/\n/g,' ').trim() : ''
      });
    });
    if (_vbScenes.length) {
      var _vbHtml = _vbScenes.map(function(sc) {
        return '<div style="border-left:3px solid ' + BT.primary_red + ';padding:6px 0 6px 14px;margin-bottom:12px">' +
          '<div style="font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.6px;color:' + BT.primary_red + ';margin-bottom:6px">' + _bH(sc.label) + '</div>' +
          '<div style="margin-bottom:6px"><span style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.5px">Visual</span><br>' +
          (sc.visual ? '<span style="font-size:13px">' + _bH(sc.visual) + '</span>' : '<span style="color:#bbb;font-style:italic">— not generated</span>') + '</div>' +
          '<div><span style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.5px">VO / Caption</span><br>' +
          (sc.vo ? '<span style="font-size:13px">' + _bH(sc.vo) + '</span>' : '<span style="color:#bbb;font-style:italic">— not generated</span>') + '</div>' +
          '</div>';
      }).join('');
      sVideo = section('VIDEO STORYBOARD', _vbHtml);
    }
  }

  // ── DESIGN SYSTEM section ─────────────────────────────────────────────────
  var sDesign = '';
  if (!isEmail) {
    sDesign = section('DESIGN SYSTEM',
      field('Asset Type', isVideo ? 'Video' : 'Static Image', 'at') +
      field('Layout Type', layoutType, 'lt') +
      field('Frame Size', frameSize, 'fs') +
      field('Mobile Priority', 'High', 'mp') +
      '<h3>Design Tokens</h3>' +
      '<div class="token-grid">' +
        '<div class="token"><div class="swatch" style="background:#FF0000"></div><span>#FF0000 — primary red · CTA</span></div>' +
        '<div class="token"><div class="swatch" style="background:#F6EFE8;border:1px solid #ddd"></div><span>#F6EFE8 — beige · background</span></div>' +
        '<div class="token"><div class="swatch" style="background:#000000"></div><span>#000000 — black · body text</span></div>' +
        '<div class="token"><div class="swatch" style="background:#FFFFFF;border:1px solid #ddd"></div><span>#FFFFFF — white · card bg</span></div>' +
      '</div>' +
      field('Typography', 'Proza Libre — headings  ·  Inter — body  ·  CTA 18px semibold', 'typ') +
      field('Button Radius', 'pill (999px)', 'br') +
      field('Shadow', 'none — flat design', 'sh')
    );
  }

  // ── VISUAL DIRECTION section ───────────────────────────────────────────────
  var sVisual = '';
  if (!isEmail) {
    var vContent = '';
    if (sp && sp.image_brief) vContent += block('Image Brief', sp.image_brief, 'imgbrief');
    vContent +=
      field('Photography Style', 'Warm realistic photography — no staged influencer aesthetics', 'ps') +
      field('Subject', 'Woman 30-44  ·  busy mom  ·  real kitchen or grocery setting', 'sub') +
      field('Mood', emotionIn || 'recognition, not defeat', 'mood') +
      field('Composition', 'Subject right  ·  text/CTA left  ·  breathing room  ·  natural light', 'comp') +
      field('Avoid', 'Staged poses  ·  fake smiles  ·  stock photography  ·  gradients  ·  glassmorphism', 'avoid');
    sVisual = section('VISUAL DIRECTION', vContent);
  }

  // ── IMAGE GENERATION PROMPT section ───────────────────────────────────────
  var sImgGen = '';
  if (!isEmail && !isVideo) {
    var imgPrompt = 'Warm realistic kitchen photography, ' + (emotionIn || 'exhausted') + ' woman 32-44, ' +
      'natural light, busy family kitchen, ' + lpSection + ' stage visual, ' +
      'easyChef Pro brand — no phone visible' + (phoneOk ? '' : ', NO phone in frame') + ', ' +
      'no staged poses, no stock photo aesthetic, no gradients, no glassmorphism, ' +
      'documentary style, Canon 5D natural colors';
    sImgGen = section('IMAGE GENERATION PROMPT',
      block('Midjourney / Flux / Ideogram', imgPrompt, 'imgprompt') +
      '<div class="field"><span class="label">Style</span><span class="value">--style raw --ar ' + (plat==='pinterest'?'2:3':plat==='facebook'?'4:5':'1:1') + ' --q 2</span></div>'
    );
  }

// ── CLAUDE DESIGN PROMPT + INSTRUCTIONS section ───────────────────────────
  // Logo URL from CcSettings (append_setting LOGO_URL to populate)
  var _cdLogoUrl = '';
  try {
    var _cdLogoArr = _getCcSetting('LOGO_URL');
    if (_cdLogoArr && _cdLogoArr.length > 0 && _cdLogoArr[0].label) _cdLogoUrl = String(_cdLogoArr[0].label);
  } catch(_le) {}

  // Assemble prompt — dynamically from sheet data, nothing hardcoded
  var _cdPrompt = '';
  if (isEmail && em) {
    // Email design prompt
    var _emParts    = [em.body_hook, em.body_problem, em.body_agitate, em.body_solve, em.body_value, em.body_proof, em.body_cta].filter(Boolean);
    var _emAllText  = _emParts.join(' ');
    var _emSents    = _emAllText.match(/[^.!?]+[.!?]+\s*/g) || [_emAllText.slice(0, 160)];
    var _emFirst3   = _emSents.slice(0, 3).join('').trim();
    _cdPrompt =
      'Design an HTML email for easyChef Pro — ' + (em.sequence_code || seqCode || 'SEQ-1') + ' · ' + (funnel || 'hook') + '\n\n' +
      'SUBJECT: ' + (em.subject_line || '') + '\n' +
      'PREVIEW: ' + (em.preview_text || '') + '\n\n' +
      'LAYOUT: red accent bar top · logo · hero line · body · red CTA pill · footer\n' +
      'WIDTH: 600px desktop · 375px mobile\n' +
      'BRAND: #FF0000 · #F6EFE8 · #000000 · Proza Libre headings · Inter body\n' +
      (_cdLogoUrl ? 'LOGO: ' + _cdLogoUrl + ' — centered top of email, max-width 200px\n' : '') +
      '\nCOPY:\n' + _emFirst3 + '\n' +
      'CTA: "' + (em.body_cta || '') + '"';
  } else if (sp) {
    // Social post design prompt
    var _spSents  = (sp.body_copy || '').match(/[^.!?]+[.!?]+\s*/g) || [(sp.body_copy || '').slice(0, 120)];
    var _spFirst2 = _spSents.slice(0, 2).join('').trim();
    _cdPrompt =
      'Design a ' + platform + ' ' + layoutType + ' for easyChef Pro.\n\n' +
      'CANVAS: ' + frameSize + ' · 8pt spacing · 24px margins\n' +
      'PHONE RULE: ' + (phoneOk ? 'PHONE VISIBLE' : 'NO PHONE in frame') + '\n' +
      (_cdLogoUrl ? 'LOGO: ' + _cdLogoUrl + ' — top-left, 120px wide\n' : '') +
      '\nCOPY:\nHook: "' + (sp.hook || '') + '"\n' +
      'Body: "' + _spFirst2 + '"\n' +
      'CTA: "' + (sp.cta || '') + '"\n' +
      (sp.hashtags ? 'Hashtags: ' + sp.hashtags + '\n' : '') +
      '\nBRAND: #FF0000 red · #F6EFE8 beige · #000000 black · Proza Libre headlines · Inter body\n' +
      'CTA style: pill button · red · white text · bottom of card · no shadow\n' +
      '\nIMAGE: ' + (sp.image_brief || 'warm realistic kitchen photography') + ' · warm realistic photography · no staged aesthetics · no gradients\n' +
      'MOOD: ' + (emotionIn || '') + '\n' +
      'AVOID: blue tones · studio lighting · fake smiles · glassmorphism\n' +
      '\nLAYOUT: hook text dominant top · photo zone 65% · CTA bottom';
  }

  var sClaudeDesign = '';
  if (_cdPrompt) {
    var _cdGenUrl = GAS_URL + '?action=generate_design_for_asset&asset_id=' + encodeURIComponent(assetId);
    var _cdInner =
      '<div style="margin-bottom:16px">' +
      '<pre id="cdprompt" style="white-space:pre-wrap;word-break:break-word;background:#f9f5f1;padding:14px;border-radius:6px;font-family:Inter,sans-serif;font-size:12px;color:#000;line-height:1.6;margin-bottom:10px;border:1px solid #ede5db">' + _bH(_cdPrompt) + '</pre>' +
      '<button onclick="copyField(\'cdprompt\')" style="display:block;width:100%;background:#FF0000;color:#FFFFFF;border:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif;letter-spacing:0.3px;margin-bottom:6px">Copy for Claude Design</button>' +
      '</div>';
    if (!isEmail) {
      _cdInner +=
        '<div class="field"><span class="label">Render Constraints</span>' +
        '<ul class="constraint-list">' +
        '<li>Clean conversion-first social card</li>' +
        '<li>Mobile-first  ·  ' + layoutType + '</li>' +
        '<li>No gradients  ·  no glassmorphism  ·  no shadows</li>' +
        '<li>Hook text dominant at top  ·  CTA bottom pill</li>' +
        '<li>DL: ' + _bH(dlId || '—') + '</li>' +
        '</ul></div>' +
        '<a href="' + _cdGenUrl + '" target="_blank" class="action-btn">Generate Design for this Asset</a>';
    }
    sClaudeDesign = section('CLAUDE DESIGN INSTRUCTIONS', _cdInner);
  }

    // ── FIGMA HANDOFF section ─────────────────────────────────────────────────
  var sFigma = '';
  if (!isEmail) {
    sFigma = section('FIGMA HANDOFF',
      field('Template', 'easyChef Pro Social Card v1', 'ftpl') +
      field('Frame Size', frameSize, 'ffs') +
      field('Spacing', '8pt system  ·  24px margins', 'fsp') +
      field('Mobile', '390px priority', 'fmob') +
      field('Export', 'PNG 2x  ·  JPEG 90% for delivery', 'fexp')
    );
  }

  // ── PERFORMANCE METADATA section ──────────────────────────────────────────
  var kpiMap = {
    hook: 'Thumb-Stop Rate', problem: 'Engagement Rate', agitate: 'Save Rate',
    solve: 'Link CTR', value: 'Link CTR', proof: 'Share Rate', cta: 'Conversion Rate'
  };
  var platformKpi = {
    youtube:  { primary: 'View Duration',    secondary: 'Click-Through Rate' },
    tiktok:   { primary: 'Thumb-Stop Rate',  secondary: 'Completion Rate' },
    email:    { primary: 'Open Rate',        secondary: 'Click Rate' }
  };
  var _pk = platformKpi[plat] || null;
  var primaryKpi   = _pk ? _pk.primary   : (kpiMap[lpSection] || 'Link CTR');
  var secondaryKpi = _pk ? _pk.secondary : (isEmail ? 'Open Rate  ·  Click Rate' : 'Waitlist Conversion');
  var sPerfMeta = section('PERFORMANCE METADATA',
    '<div class="metric-grid">' +
      metric('Primary KPI', primaryKpi) +
      metric('Secondary KPI', secondaryKpi) +
      metric('Hook Style', emotionIn || 'recognition') +
      metric('Funnel Stage', funnel || lpSection) +
      metric('Expected Read Depth', isEmail ? 'Full' : (lpSection === 'hook' ? 'Shallow' : 'Medium')) +
      metric('Platform', platform) +
    '</div>'
  );

  // ── DEPLOY section ─────────────────────────────────────────────────────────
  var sDeploy = section('DEPLOY',
    field('Campaign', campaignId, 'dcmp') +
    field('Platform', platform, 'dplat') +
    field('Publish Date', pubDate + (pubTime ? '  ' + pubTime : ''), 'dpub') +
    field('Day / Week', 'Day ' + day + '  ·  Week ' + week, 'dday') +
    field('DL ID', dlId, 'ddl') +
    field('UTM String', utmDisplay, 'dutm') +
    field('Status', status, 'dst') +
    (blockedBy ? field('Blocked By', blockedBy, 'dblk') : '')
  );

  // ── Assemble HTML ──────────────────────────────────────────────────────────
  var html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Brief — ' + _bH(assetId) + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Proza+Libre:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">' +
    '<style>' +
    '*{box-sizing:border-box;margin:0;padding:0}' +
    'body{font-family:' + BT.body_font + ',sans-serif;font-size:14px;color:' + BT.black + ';background:' + BT.beige + ';line-height:1.5}' +
    'header{background:' + BT.primary_red + ';color:' + BT.white + ';padding:20px 32px;display:flex;align-items:center;justify-content:space-between}' +
    'header h1{font-family:"' + BT.headline_font + '",sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.3px}' +
    'header .sub{font-size:13px;opacity:0.85;margin-top:2px}' +
    '.container{max-width:860px;margin:0 auto;padding:24px 16px 60px}' +
    'section{background:' + BT.white + ';border-radius:8px;margin-bottom:16px;overflow:hidden}' +
    'section h2{font-family:"' + BT.headline_font + '",sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;background:' + BT.primary_red + ';color:' + BT.white + ';padding:8px 20px}' +
    'section h3{font-family:"' + BT.headline_font + '",sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:' + BT.primary_red + ';padding:12px 20px 4px;border-top:1px solid #f0e8e0}' +
    '.section-body{padding:16px 20px}' +
    '.field{padding:7px 0;border-bottom:1px solid #f4ece4;display:block;overflow:hidden}' +
    '.field:last-child{border-bottom:none}' +
    '.label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:#888;display:block;margin-bottom:2px}' +
    '.value{color:' + BT.black + ';display:block;white-space:pre-wrap;word-break:break-word}' +
    '.empty{color:#bbb;font-style:italic}' +
    '.block{padding:10px 0;border-bottom:1px solid #f4ece4}' +
    '.block:last-child{border-bottom:none}' +
    '.empty-block{color:#bbb;font-style:italic;font-size:13px;background:#f9f5f1;padding:10px;border-radius:4px;margin-top:4px}' +
    'pre.body-text{font-family:' + BT.body_font + ',sans-serif;font-size:13px;white-space:pre-wrap;word-break:break-word;background:#f9f5f1;padding:12px;border-radius:4px;margin-top:6px;color:' + BT.black + '}' +
    'button{cursor:pointer}' +
    '.token-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;padding:8px 0 12px}' +
    '.token{display:flex;align-items:center;gap:10px;font-size:12px;color:#555}' +
    '.swatch{width:28px;height:28px;border-radius:4px;flex-shrink:0}' +
    '.metric-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px}' +
    '.metric{background:#f9f5f1;border-radius:6px;padding:12px 14px}' +
    '.metric-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;color:#888;margin-bottom:4px}' +
    '.metric-value{font-size:14px;font-weight:600;color:' + BT.black + '}' +
    '.constraint-list{margin:8px 0 8px 18px;color:' + BT.black + '}' +
    '.constraint-list li{margin-bottom:3px;font-size:13px}' +
    '.action-btn{display:inline-block;margin-top:14px;background:' + BT.cta_button_color + ';color:' + BT.cta_button_text + ';padding:9px 20px;border-radius:' + BT.border_radius_pill + ';text-decoration:none;font-size:13px;font-weight:600;font-family:' + BT.body_font + ',sans-serif}' +
    '.action-btn:hover{opacity:0.88}' +
    'ul{list-style:none}' +
    '</style></head><body>' +
    '<header><div><h1>ASSET BRIEF — ' + _bH(assetId) + '</h1>' +
    '<div class="sub">' + _bH(campaignId) + '  ·  ' + _bH(platform) + '  ·  Day ' + _bH(day) + '  ·  Week ' + _bH(week) + '</div></div>' +
    '<div>' + phonePill + '</div></header>' +
    '<div class="container">' +
    section('IDENTITY', sIdentity) +
    section('COPY SYSTEM', sCopy) +
    sEmailBody +
    sVideo +
    sDesign +
    sVisual +
    sImgGen +
    sClaudeDesign +
    sFigma +
    sPerfMeta +
    sDeploy +
    '</div>' +
    '<script>' +
    'function copyField(id){var el=document.getElementById(id);if(!el)return;var t=el.innerText||el.textContent||"";navigator.clipboard.writeText(t).catch(function(){var ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);});}' +
    '</script></body></html>';

  return html;
}
