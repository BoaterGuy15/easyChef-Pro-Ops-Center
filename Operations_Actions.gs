// ─────────────────────────────────────────────────────────────────────────────
// Operations_Actions.gs
// ADD THESE FUNCTIONS TO YOUR EXISTING Operations.gs
// Do NOT replace the existing file — paste the functions below into it.
//
// SHEET SETUP: Run _setupActionsSheet() once from the Apps Script editor
// (Run → Run function → _setupActionsSheet) to create the sheet.
//
// Hierarchy: Agenda → Task → Action
// An Action is a small, assignable to-do that comes out of a Task.
// e.g. "Ask Taylor for approval", "Send budget to Steve"
//
// ── doGet additions (paste inside your existing doGet(e) if/else block) ──────
//
//   if (action === 'actions_read') {
//     return json({ ok: true, actions: getActions(e.parameter.taskId||'', e.parameter.agendaId||'') });
//   }
//
// ── doPost additions (paste inside your existing doPost(e) if/else block) ────
//
//   if (body.action === 'action_write') {
//     addAction(body);
//     return json({ ok: true });
//   }
//   if (body.action === 'action_update') {
//     updateAction(body.id, body);
//     return json({ ok: true });
//   }
//   if (body.action === 'action_delete') {
//     deleteAction(body.id);
//     return json({ ok: true });
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

var ACTIONS_SHEET   = 'Actions';
var ACTIONS_HEADERS = [
  'id', 'taskId', 'agendaId',
  'title', 'assignedTo', 'dueDate',
  'status', 'priority', 'createdBy', 'createdAt'
];

// ── Sheet bootstrap ───────────────────────────────────────────────────────────

function _setupActionsSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ACTIONS_SHEET);
  if (!sheet) sheet = ss.insertSheet(ACTIONS_SHEET);
  var hdr = sheet.getRange(1, 1, 1, ACTIONS_HEADERS.length);
  hdr.setValues([ACTIONS_HEADERS]);
  hdr.setBackground('#0b0d10');
  hdr.setFontColor('#c9a84c');
  hdr.setFontFamily('Courier New');
  hdr.setFontWeight('bold');
  hdr.setFontSize(10);
  sheet.setFrozenRows(1);
  for (var i = 1; i <= ACTIONS_HEADERS.length; i++) sheet.setColumnWidth(i, 160);
  SpreadsheetApp.getUi().alert('Actions sheet is ready.');
  return sheet;
}

function _getActionsSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ACTIONS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(ACTIONS_SHEET);
    var hdr = sheet.getRange(1, 1, 1, ACTIONS_HEADERS.length);
    hdr.setValues([ACTIONS_HEADERS]);
    hdr.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

function getActions(taskId, agendaId) {
  var sheet   = _getActionsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var rows = sheet.getRange(2, 1, lastRow - 1, ACTIONS_HEADERS.length).getValues();
  return rows
    .filter(function(r) {
      if (!r[0]) return false;
      if (taskId   && r[1] !== taskId)   return false;
      if (agendaId && r[2] !== agendaId) return false;
      return true;
    })
    .map(function(r) {
      return {
        id:         String(r[0]),
        taskId:     String(r[1]),
        agendaId:   String(r[2]),
        title:      String(r[3]),
        assignedTo: String(r[4]),
        dueDate:    String(r[5]),
        status:     String(r[6]),
        priority:   String(r[7]),
        createdBy:  String(r[8]),
        createdAt:  String(r[9])
      };
    });
}

function addAction(item) {
  if (!item) return;
  var sheet = _getActionsSheet();
  var now   = new Date().toISOString();
  var rng   = sheet.getRange(sheet.getLastRow() + 1, 1, 1, ACTIONS_HEADERS.length);
  rng.setNumberFormat('@');
  rng.setValues([[
    item.id         || ('act-' + Date.now()),
    item.taskId     || '',
    item.agendaId   || '',
    item.title      || '',
    item.assignedTo || '',
    item.dueDate    || '',
    item.status     || 'open',
    item.priority   || 'medium',
    item.createdBy  || '',
    item.createdAt  || now
  ]]);
}

function updateAction(id, fields) {
  if (!id || !fields) return;
  var sheet   = _getActionsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      var ex  = sheet.getRange(i + 2, 1, 1, ACTIONS_HEADERS.length).getValues()[0];
      var rng = sheet.getRange(i + 2, 1, 1, ACTIONS_HEADERS.length);
      rng.setNumberFormat('@');
      rng.setValues([[
        ex[0], ex[1], ex[2],
        fields.title      !== undefined ? fields.title      : ex[3],
        fields.assignedTo !== undefined ? fields.assignedTo : ex[4],
        fields.dueDate    !== undefined ? fields.dueDate    : ex[5],
        fields.status     !== undefined ? fields.status     : ex[6],
        fields.priority   !== undefined ? fields.priority   : ex[7],
        ex[8], ex[9]
      ]]);
      return;
    }
  }
}

function deleteAction(id) {
  if (!id) return;
  var sheet   = _getActionsSheet();
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
