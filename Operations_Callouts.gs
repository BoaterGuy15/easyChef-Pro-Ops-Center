// ─────────────────────────────────────────────────────────────────────────────
// Operations_Callouts.gs
// ADD THESE FUNCTIONS TO YOUR EXISTING Operations.gs
// Do NOT replace the existing file — paste the functions below into it.
//
// SHEET SETUP: Run _setupCalloutsSheet() once from the Apps Script editor
// (Run → Run function → _setupCalloutsSheet) to create the Callouts sheet.
//
// ── doGet additions ───────────────────────────────────────────────────────────
//
//   if (action === 'callouts_read') {
//     return json({ ok: true, callouts: getCallouts(e.parameter.user || '') });
//   }
//
// ── doPost additions ──────────────────────────────────────────────────────────
//
//   if (body.action === 'callout_write') {
//     addCallout(body);
//     return json({ ok: true });
//   }
//   if (body.action === 'callout_dismiss') {
//     dismissCallout(body.id, body.dismissedBy, body.dismissedAt);
//     return json({ ok: true });
//   }
//   if (body.action === 'callout_delete') {
//     deleteCallout(body.id);
//     return json({ ok: true });
//   }
//   if (body.action === 'callout_update') {
//     updateCallout(body.id, body);
//     return json({ ok: true });
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

var CO_SHEET = 'Callouts';
var CO_HEADERS = [
  'id', 'type', 'title', 'message', 'taggedUser', 'taggedTask',
  'createdBy', 'createdAt', 'dueDate',
  'dismissed', 'dismissedBy', 'dismissedAt'
];

// ── Sheet bootstrap ───────────────────────────────────────────────────────────

function _setupCalloutsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CO_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CO_SHEET);
  }
  var hdr = sheet.getRange(1, 1, 1, CO_HEADERS.length);
  hdr.setValues([CO_HEADERS]);
  hdr.setBackground('#0b0d10');
  hdr.setFontColor('#c9a84c');
  hdr.setFontFamily('Courier New');
  hdr.setFontWeight('bold');
  hdr.setFontSize(10);
  sheet.setFrozenRows(1);
  for (var i = 1; i <= CO_HEADERS.length; i++) {
    sheet.setColumnWidth(i, 150);
  }
  SpreadsheetApp.getUi().alert('Callouts sheet is ready.');
  return sheet;
}

function _getCalloutsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CO_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CO_SHEET);
    var hdr = sheet.getRange(1, 1, 1, CO_HEADERS.length);
    hdr.setValues([CO_HEADERS]);
    hdr.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

/**
 * Returns all callout rows. Pass user to filter by taggedUser (or 'all').
 */
function getCallouts(user) {
  var sheet = _getCalloutsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var rows = sheet.getRange(2, 1, lastRow - 1, CO_HEADERS.length).getValues();
  return rows
    .filter(function(r) {
      if (!r[0]) return false;
      if (user) {
        var tagged = String(r[4]).toLowerCase();
        if (tagged && tagged !== 'all' && tagged !== user.toLowerCase()) return false;
      }
      return true;
    })
    .map(function(r) {
      return {
        id:          String(r[0]),
        type:        String(r[1]),
        title:       String(r[2]),
        message:     String(r[3]),
        taggedUser:  String(r[4]),
        taggedTask:  String(r[5]),
        createdBy:   String(r[6]),
        createdAt:   String(r[7]),
        dueDate:     String(r[8]),
        dismissed:   String(r[9]),
        dismissedBy: String(r[10]),
        dismissedAt: String(r[11])
      };
    });
}

function addCallout(item) {
  if (!item) return;
  var sheet = _getCalloutsSheet();
  var now = new Date().toISOString();
  var rng = sheet.getRange(sheet.getLastRow() + 1, 1, 1, CO_HEADERS.length);
  rng.setNumberFormat('@');
  rng.setValues([[
    item.id          || ('co-' + Date.now()),
    item.type        || 'note',
    item.title       || '',
    item.message     || '',
    item.taggedUser  || '',
    item.taggedTask  || '',
    item.createdBy   || '',
    item.createdAt   || now,
    item.dueDate     || '',
    'false',
    '',
    ''
  ]]);
}

function updateCallout(id, fields) {
  if (!id || !fields) return;
  var sheet = _getCalloutsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      var ex = sheet.getRange(i + 2, 1, 1, CO_HEADERS.length).getValues()[0];
      var rng = sheet.getRange(i + 2, 1, 1, CO_HEADERS.length);
      rng.setNumberFormat('@');
      rng.setValues([[
        ex[0],
        fields.type  !== undefined ? fields.type  : ex[1],
        fields.title !== undefined ? fields.title : ex[2],
        fields.message !== undefined ? fields.message : ex[3],
        ex[4], ex[5], ex[6], ex[7],
        fields.dueDate !== undefined ? fields.dueDate : ex[8],
        ex[9], ex[10], ex[11]
      ]]);
      return;
    }
  }
}

function dismissCallout(id, dismissedBy, dismissedAt) {
  if (!id) return;
  var sheet = _getCalloutsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.getRange(i + 2, 10).setValue('true');
      sheet.getRange(i + 2, 11).setValue(dismissedBy || '');
      sheet.getRange(i + 2, 12).setValue(dismissedAt || new Date().toISOString());
      return;
    }
  }
}

function deleteCallout(id) {
  if (!id) return;
  var sheet = _getCalloutsSheet();
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
