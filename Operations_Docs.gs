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

// ── Constants ─────────────────────────────────────────────────────────────────

var DOCS_SHEET = 'Documents';
var DOCS_HEADERS = [
  'id', 'taskId', 'agendaId', 'name', 'url', 'type',
  'previewUrl', 'driveFileId', 'folderUrl', 'reviewNeeded', 'addedBy', 'addedAt'
];

// Root Drive folder ID — extracted from:
// https://drive.google.com/drive/folders/1p-unAqDk2pwlz-zO2NLh8uHZkTzFM7_h
var SHARED_DRIVE_FOLDER_ID = '1p-unAqDk2pwlz-zO2NLh8uHZkTzFM7_h';

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
  SpreadsheetApp.getUi().alert('Documents sheet is ready.');
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

  // Share with anyone who has the link (view only)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

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
        addedAt:      String(r[11])
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
    doc.addedAt      || new Date().toISOString()
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
