// ─────────────────────────────────────────────────────────────────────────────
// Operations_Requests.gs
// ADD THESE FUNCTIONS TO YOUR EXISTING Operations.gs
// Do NOT replace the existing file — paste the functions below into it.
//
// SHEET SETUP: Run _setupRequestsSheet() once to create the InfoRequests sheet.
//
// ── doGet additions (paste inside your existing doGet(e) if/else block) ──────
//
//   if (action === 'ir_read') {
//     return json({ ok: true, requests: getInfoRequests(e.parameter.taskId || '', e.parameter.id || '') });
//   }
//
// ── doPost additions (paste inside your existing doPost(e) if/else block) ────
//
//   if (body.action === 'ir_write') {
//     addInfoRequest(body);
//     return json({ ok: true });
//   }
//   if (body.action === 'ir_update') {
//     updateInfoRequest(body.id, body);
//     return json({ ok: true });
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

var IR_SHEET = 'InfoRequests';
var IR_HEADERS = [
  'id', 'taskId', 'recipientKey', 'recipientName', 'message',
  'requestedBy', 'requestedAt', 'status',
  'responseNote', 'responseUrl', 'responseAt',
  'reviewedBy', 'reviewedAt', 'reviewNote'
];

function _setupRequestsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(IR_SHEET);
  if (!sheet) sheet = ss.insertSheet(IR_SHEET);
  var hdr = sheet.getRange(1, 1, 1, IR_HEADERS.length);
  hdr.setValues([IR_HEADERS]);
  hdr.setBackground('#0b0d10');
  hdr.setFontColor('#c9a84c');
  hdr.setFontFamily('Courier New');
  hdr.setFontWeight('bold');
  hdr.setFontSize(10);
  sheet.setFrozenRows(1);
  for (var i = 1; i <= IR_HEADERS.length; i++) sheet.setColumnWidth(i, 150);
  SpreadsheetApp.getUi().alert('InfoRequests sheet is ready.');
  return sheet;
}

function _getIRSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(IR_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(IR_SHEET);
    var hdr = sheet.getRange(1, 1, 1, IR_HEADERS.length);
    hdr.setValues([IR_HEADERS]);
    hdr.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Returns info requests. Filters by taskId and/or reqId if provided.
 */
function getInfoRequests(taskId, reqId) {
  var sheet = _getIRSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var rows = sheet.getRange(2, 1, lastRow - 1, IR_HEADERS.length).getValues();
  return rows
    .filter(function(r) {
      if (!r[0]) return false;
      if (reqId && String(r[0]) !== String(reqId)) return false;
      if (taskId && String(r[1]) !== String(taskId)) return false;
      return true;
    })
    .map(function(r) {
      return {
        id:           String(r[0]),
        taskId:       String(r[1]),
        recipientKey: String(r[2]),
        recipientName:String(r[3]),
        message:      String(r[4]),
        requestedBy:  String(r[5]),
        requestedAt:  String(r[6]),
        status:       String(r[7]),
        responseNote: String(r[8]),
        responseUrl:  String(r[9]),
        responseAt:   String(r[10]),
        reviewedBy:   String(r[11]),
        reviewedAt:   String(r[12]),
        reviewNote:   String(r[13])
      };
    });
}

/**
 * Appends a new info request row.
 */
function addInfoRequest(item) {
  if (!item) return;
  var sheet = _getIRSheet();
  var rng = sheet.getRange(sheet.getLastRow() + 1, 1, 1, IR_HEADERS.length);
  rng.setNumberFormat('@');
  rng.setValues([[
    item.id           || ('req-' + Date.now()),
    item.taskId       || '',
    item.recipientKey || '',
    item.recipientName|| '',
    item.message      || '',
    item.requestedBy  || '',
    item.requestedAt  || new Date().toISOString(),
    'pending', '', '', '', '', '', ''
  ]]);
}

/**
 * Updates status, response fields, or review fields on an existing request.
 */
function updateInfoRequest(id, fields) {
  if (!id || !fields) return;
  var sheet = _getIRSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      var ex = sheet.getRange(i + 2, 1, 1, IR_HEADERS.length).getValues()[0];
      var rng = sheet.getRange(i + 2, 1, 1, IR_HEADERS.length);
      rng.setNumberFormat('@');
      rng.setValues([[
        ex[0], ex[1], ex[2], ex[3], ex[4], ex[5], ex[6],
        fields.status       !== undefined ? fields.status       : ex[7],
        fields.responseNote !== undefined ? fields.responseNote : ex[8],
        fields.responseUrl  !== undefined ? fields.responseUrl  : ex[9],
        fields.responseAt   !== undefined ? fields.responseAt   : ex[10],
        fields.reviewedBy   !== undefined ? fields.reviewedBy   : ex[11],
        fields.reviewedAt   !== undefined ? fields.reviewedAt   : ex[12],
        fields.reviewNote   !== undefined ? fields.reviewNote   : ex[13]
      ]]);
      return;
    }
  }
}
