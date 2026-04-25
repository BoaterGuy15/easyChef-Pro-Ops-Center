// ─────────────────────────────────────────────────────────────────────────────
// Operations_Workstreams.gs
// ADD THESE FUNCTIONS TO YOUR EXISTING Operations.gs
// Do NOT replace the existing file — paste the functions below into it.
//
// SHEET SETUP: Run _setupWorkstreamSheets() once from the Apps Script editor
// (Run → Run function → _setupWorkstreamSheets) to create both sheets.
//
// ── doGet additions (paste inside your existing doGet(e) if/else block) ──────
//
//   if (action === 'workstreams_read') {
//     return json({ ok: true, workstreams: getWorkstreams() });
//   }
//   if (action === 'workstream_actions_read') {
//     return json({ ok: true, actions: getWorkstreamActions(e.parameter.workstreamId || '') });
//   }
//
// ── doPost additions (paste inside your existing doPost(e) if/else block) ────
//
//   if (body.action === 'workstream_write') {
//     setWorkstream(body.item);
//     return json({ ok: true });
//   }
//   if (body.action === 'workstream_delete') {
//     deleteWorkstream(body.id);
//     return json({ ok: true });
//   }
//   if (body.action === 'workstream_action_write') {
//     addWorkstreamAction(body.item);
//     return json({ ok: true });
//   }
//   if (body.action === 'workstream_action_update') {
//     updateWorkstreamAction(body.id, body.fields);
//     return json({ ok: true });
//   }
//   if (body.action === 'workstream_action_delete') {
//     deleteWorkstreamAction(body.id);
//     return json({ ok: true });
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

// ── Sheet names & headers ─────────────────────────────────────────────────────

var WS_SHEET  = 'Workstreams';
var WSA_SHEET = 'WorkstreamActions';

var WS_HEADERS = [
  'id', 'name', 'category', 'owner', 'sd', 'ed',
  'color', 'status', 'linkedTasks', 'linkedActions',
  'notes', 'order', 'createdBy', 'createdAt', 'updatedAt'
];

var WSA_HEADERS = [
  'id', 'workstreamId', 'type', 'title', 'body',
  'assignedTo', 'dueDate', 'status', 'completedAt', 'completedBy',
  'linkedTaskId', 'createdBy', 'createdAt'
];

// ── Sheet bootstrap ───────────────────────────────────────────────────────────

function _setupWorkstreamSheets() {
  _initWsSheet();
  _initWsaSheet();
  SpreadsheetApp.getUi().alert('Workstreams and WorkstreamActions sheets are ready.');
}

function _initWsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(WS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(WS_SHEET);
  }
  _applyDglHeaderStyle(sheet, WS_HEADERS);
  return sheet;
}

function _initWsaSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(WSA_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(WSA_SHEET);
  }
  _applyDglHeaderStyle(sheet, WSA_HEADERS);
  return sheet;
}

function _applyDglHeaderStyle(sheet, headers) {
  var hdrRange = sheet.getRange(1, 1, 1, headers.length);
  hdrRange.setValues([headers]);
  hdrRange.setBackground('#0b0d10');
  hdrRange.setFontColor('#c9a84c');
  hdrRange.setFontFamily('Courier New');
  hdrRange.setFontWeight('bold');
  hdrRange.setFontSize(10);
  sheet.setFrozenRows(1);
  // Auto-resize columns up to the header count
  for (var i = 1; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 140);
  }
}

function _getWsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(WS_SHEET);
  if (!sheet) sheet = _initWsSheet();
  return sheet;
}

function _getWsaSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(WSA_SHEET);
  if (!sheet) sheet = _initWsaSheet();
  return sheet;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _fmtDate(val) {
  if (!val) return '';
  if (val instanceof Date) return Utilities.formatDate(val, 'UTC', 'yyyy-MM-dd');
  return String(val);
}

function _now() {
  return new Date().toISOString();
}

// ── Workstreams CRUD ──────────────────────────────────────────────────────────

function getWorkstreams() {
  var sheet = _getWsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var rows = sheet.getRange(2, 1, lastRow - 1, WS_HEADERS.length).getValues();
  return rows
    .filter(function(r) { return r[0]; })
    .map(function(r) {
      return {
        id:             r[0],
        name:           r[1],
        category:       r[2],
        owner:          r[3],
        sd:             _fmtDate(r[4]),
        ed:             _fmtDate(r[5]),
        color:          r[6],
        status:         r[7],
        linkedTasks:    r[8],
        linkedActions:  r[9],
        notes:          r[10],
        order:          r[11],
        createdBy:      r[12],
        createdAt:      r[13],
        updatedAt:      r[14]
      };
    });
}

function setWorkstream(item) {
  if (!item || !item.id) return;
  var sheet = _getWsSheet();
  var lastRow = sheet.getLastRow();
  var now = _now();

  // Update existing row
  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === item.id) {
        var existing = sheet.getRange(i + 2, 1, 1, WS_HEADERS.length).getValues()[0];
        sheet.getRange(i + 2, 1, 1, WS_HEADERS.length).setValues([[
          item.id,
          item.name          !== undefined ? item.name          : existing[1],
          item.category      !== undefined ? item.category      : existing[2],
          item.owner         !== undefined ? item.owner         : existing[3],
          item.sd            !== undefined ? item.sd            : existing[4],
          item.ed            !== undefined ? item.ed            : existing[5],
          item.color         !== undefined ? item.color         : existing[6],
          item.status        !== undefined ? item.status        : (existing[7] || 'Not Started'),
          item.linkedTasks   !== undefined ? item.linkedTasks   : existing[8],
          item.linkedActions !== undefined ? item.linkedActions : existing[9],
          item.notes         !== undefined ? item.notes         : existing[10],
          item.order         !== undefined ? item.order         : existing[11],
          existing[12], // createdBy unchanged
          existing[13], // createdAt unchanged
          now
        ]]);
        return;
      }
    }
  }

  // Append new row
  sheet.appendRow([
    item.id,
    item.name          || '',
    item.category      || '',
    item.owner         || '',
    item.sd            || '',
    item.ed            || '',
    item.color         || '',
    item.status        || 'Not Started',
    item.linkedTasks   || '',
    item.linkedActions || '',
    item.notes         || '',
    item.order         || '',
    item.createdBy     || '',
    now,
    now
  ]);
}

function deleteWorkstream(id) {
  if (!id) return;
  var sheet = _getWsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) { sheet.deleteRow(i + 2); return; }
  }
}

// ── WorkstreamActions CRUD ────────────────────────────────────────────────────

function getWorkstreamActions(workstreamId) {
  var sheet = _getWsaSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var rows = sheet.getRange(2, 1, lastRow - 1, WSA_HEADERS.length).getValues();
  return rows
    .filter(function(r) {
      if (!r[0]) return false;
      if (workstreamId) return r[1] === workstreamId;
      return true;
    })
    .map(function(r) {
      return {
        id:            r[0],
        workstreamId:  r[1],
        type:          r[2],
        title:         r[3],
        body:          r[4],
        assignedTo:    r[5],
        dueDate:       _fmtDate(r[6]),
        status:        r[7],
        completedAt:   r[8],
        completedBy:   r[9],
        linkedTaskId:  r[10],
        createdBy:     r[11],
        createdAt:     r[12]
      };
    });
}

function addWorkstreamAction(item) {
  if (!item || !item.id) return;
  var sheet = _getWsaSheet();
  var now = _now();
  sheet.appendRow([
    item.id,
    item.workstreamId  || '',
    item.type          || '',
    item.title         || '',
    item.body          || '',
    item.assignedTo    || '',
    item.dueDate       || '',
    item.status        || 'Open',
    item.completedAt   || '',
    item.completedBy   || '',
    item.linkedTaskId  || '',
    item.createdBy     || '',
    now
  ]);
}

function updateWorkstreamAction(id, fields) {
  if (!id || !fields) return;
  var sheet = _getWsaSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) {
      var existing = sheet.getRange(i + 2, 1, 1, WSA_HEADERS.length).getValues()[0];
      sheet.getRange(i + 2, 1, 1, WSA_HEADERS.length).setValues([[
        existing[0],
        fields.workstreamId !== undefined ? fields.workstreamId : existing[1],
        fields.type         !== undefined ? fields.type         : existing[2],
        fields.title        !== undefined ? fields.title        : existing[3],
        fields.body         !== undefined ? fields.body         : existing[4],
        fields.assignedTo   !== undefined ? fields.assignedTo   : existing[5],
        fields.dueDate      !== undefined ? fields.dueDate      : existing[6],
        fields.status       !== undefined ? fields.status       : existing[7],
        fields.completedAt  !== undefined ? fields.completedAt  : existing[8],
        fields.completedBy  !== undefined ? fields.completedBy  : existing[9],
        fields.linkedTaskId !== undefined ? fields.linkedTaskId : existing[10],
        existing[11], // createdBy unchanged
        existing[12]  // createdAt unchanged
      ]]);
      return;
    }
  }
}

function deleteWorkstreamAction(id) {
  if (!id) return;
  var sheet = _getWsaSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) { sheet.deleteRow(i + 2); return; }
  }
}
