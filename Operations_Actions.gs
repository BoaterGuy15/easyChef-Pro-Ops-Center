// ─────────────────────────────────────────────────────────────────────────────
// Operations_Actions.gs
// ADD THESE FUNCTIONS TO YOUR EXISTING Operations.gs
// Do NOT replace the existing file — paste the functions below into it.
//
// SHEET SETUP: Run _setupActionsSheet() once from the Apps Script editor
// (Run → Run function → _setupActionsSheet) to create the sheet.
//
// ── doGet additions (paste inside your existing doGet(e) if/else block) ──────
//
//   if (action === 'actions_read') {
//     return json({ ok: true, actions: getActions(e.parameter.taskId || '', e.parameter.workstreamId || '') });
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

var ACTIONS_SHEET = 'Actions';

var ACTIONS_HEADERS = [
  'id', 'taskId', 'agendaId', 'workstreamId',
  'type', 'title', 'body', 'status',
  'createdBy', 'createdAt', 'updatedAt', 'assignedTo'
];

var ACTIONS_VALID_TYPES = [
  'comment', 'flag', 'statuschange', 'note',
  'decision', 'blocker', 'risk', 'completion'
];

// ── Sheet bootstrap ───────────────────────────────────────────────────────────

function _setupActionsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ACTIONS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(ACTIONS_SHEET);
  }
  // DGL dark styling
  var hdrRange = sheet.getRange(1, 1, 1, ACTIONS_HEADERS.length);
  hdrRange.setValues([ACTIONS_HEADERS]);
  hdrRange.setBackground('#0b0d10');
  hdrRange.setFontColor('#c9a84c');
  hdrRange.setFontFamily('Courier New');
  hdrRange.setFontWeight('bold');
  hdrRange.setFontSize(10);
  sheet.setFrozenRows(1);
  for (var i = 1; i <= ACTIONS_HEADERS.length; i++) {
    sheet.setColumnWidth(i, 140);
  }
  SpreadsheetApp.getUi().alert('Actions sheet is ready.');
  return sheet;
}

function _getActionsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ACTIONS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(ACTIONS_SHEET);
    var hdrRange = sheet.getRange(1, 1, 1, ACTIONS_HEADERS.length);
    hdrRange.setValues([ACTIONS_HEADERS]);
    hdrRange.setBackground('#0b0d10');
    hdrRange.setFontColor('#c9a84c');
    hdrRange.setFontFamily('Courier New');
    hdrRange.setFontWeight('bold');
    hdrRange.setFontSize(10);
    sheet.setFrozenRows(1);
    for (var i = 1; i <= ACTIONS_HEADERS.length; i++) {
      sheet.setColumnWidth(i, 140);
    }
  }
  return sheet;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _actionsNow() {
  return new Date().toISOString();
}

function _actionsGenId() {
  return 'act-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function _actionsRowToObj(r) {
  return {
    id:           r[0],
    taskId:       r[1],
    agendaId:     r[2],
    workstreamId: r[3],
    type:         r[4],
    title:        r[5],
    body:         r[6],
    status:       r[7],
    createdBy:    r[8],
    createdAt:    r[9],
    updatedAt:    r[10],
    assignedTo:   r[11] || ''
  };
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

/**
 * Returns all actions. Pass taskId and/or workstreamId to filter.
 * Either filter alone returns rows matching that field.
 * Both filters together: row must match both.
 */
function getActions(taskId, workstreamId) {
  var sheet = _getActionsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var rows = sheet.getRange(2, 1, lastRow - 1, ACTIONS_HEADERS.length).getValues();
  return rows
    .filter(function(r) {
      if (!r[0]) return false;
      if (taskId       && r[1] !== taskId)       return false;
      if (workstreamId && r[3] !== workstreamId) return false;
      return true;
    })
    .map(_actionsRowToObj);
}

/**
 * Appends a new action row. Auto-generates id if not provided.
 * type must be one of ACTIONS_VALID_TYPES; defaults to 'note' if unrecognised.
 */
function addAction(item) {
  if (!item) return;
  var sheet = _getActionsSheet();
  var now   = _actionsNow();
  var id    = item.id || _actionsGenId();
  var type  = ACTIONS_VALID_TYPES.indexOf(item.type) >= 0 ? item.type : 'note';

  var rng = sheet.getRange(sheet.getLastRow() + 1, 1, 1, ACTIONS_HEADERS.length);
  rng.setNumberFormat('@');
  rng.setValues([[
    id,
    item.taskId       || '',
    item.agendaId     || '',
    item.workstreamId || '',
    type,
    item.title        || '',
    item.body         || '',
    item.status       || 'open',
    item.createdBy    || '',
    item.createdAt    || now,
    now,
    item.assignedTo   || ''
  ]]);
}

/**
 * Updates specific fields on an existing action row.
 * id and createdAt/createdBy are never overwritten.
 */
function updateAction(id, fields) {
  if (!id || !fields) return;
  var sheet   = _getActionsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      var ex  = sheet.getRange(i + 2, 1, 1, ACTIONS_HEADERS.length).getValues()[0];
      var now = _actionsNow();
      var type = fields.type !== undefined
        ? (ACTIONS_VALID_TYPES.indexOf(fields.type) >= 0 ? fields.type : ex[4])
        : ex[4];
      var rng = sheet.getRange(i + 2, 1, 1, ACTIONS_HEADERS.length);
      rng.setNumberFormat('@');
      rng.setValues([[
        ex[0],                                                        // id — immutable
        fields.taskId       !== undefined ? fields.taskId       : ex[1],
        fields.agendaId     !== undefined ? fields.agendaId     : ex[2],
        fields.workstreamId !== undefined ? fields.workstreamId : ex[3],
        type,
        fields.title        !== undefined ? fields.title        : ex[5],
        fields.body         !== undefined ? fields.body         : ex[6],
        fields.status       !== undefined ? fields.status       : ex[7],
        ex[8],                                                        // createdBy — immutable
        ex[9],                                                        // createdAt — immutable
        now,
        fields.assignedTo   !== undefined ? fields.assignedTo   : (ex[11] || '')
      ]]);
      return;
    }
  }
}

/**
 * Deletes an action row by id.
 */
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
