// ─────────────────────────────────────────────────────────────────────────────
// ADD THESE FUNCTIONS TO YOUR EXISTING Operations.gs
// Do NOT replace the existing file — paste these into it.
// Remove any earlier LP_HEADERS / getLaunchPlan / setLaunchPlanItem definitions
// that don't match this 14-column schema.
// ─────────────────────────────────────────────────────────────────────────────

// LP_SHEET and LP_HEADERS defined in Operation.gs — canonical value is 'LaunchPlan'.

function getLPSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LP_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(LP_SHEET);
    var hdr = sheet.getRange(1, 1, 1, LP_HEADERS.length);
    hdr.setValues([LP_HEADERS]);
    hdr.setFontWeight('bold');
  }
  return sheet;
}

function getLaunchPlan() {
  var sheet = getLPSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var rows = sheet.getRange(2, 1, lastRow - 1, LP_HEADERS.length).getValues();

  function _fmtD(v) {
    if (!v || v === '') return '';
    if (v instanceof Date) return Utilities.formatDate(v, 'America/Los_Angeles', 'yyyy-MM-dd');
    return String(v);
  }

  function _parseList(v) {
    if (!v || v === '') return [];
    if (typeof v === 'string') {
      var s = v.trim();
      if (s.charAt(0) === '[') { try { return JSON.parse(s); } catch(e) {} }
      return s.split(',').map(function(x){ return x.trim(); }).filter(Boolean);
    }
    return [];
  }

  return rows
    .filter(function(r) { return r[0]; })
    .map(function(r) {
      return {
        id:            String(r[0]),
        workstream:    r[1],
        name:          r[2],
        sd:            _fmtD(r[3]),
        ed:            _fmtD(r[4]),
        color:         r[5],
        status:        r[6],
        notes:         r[7],
        order:         r[8],
        taskIds:       _parseList(r[9]),
        linkedActions: _parseList(r[10]),
        createdBy:     r[11],
        createdAt:     r[12],
        updatedAt:     r[13]
      };
    });
}

function setLaunchPlanItem(item) {
  if (!item || !item.id) return;

  var sheet   = getLPSheet();
  var lastRow = sheet.getLastRow();
  var now     = new Date().toISOString();

  function _serList(v) {
    if (!v) return '';
    if (Array.isArray(v)) return v.length ? JSON.stringify(v) : '';
    return String(v);
  }

  var rowData = [
    String(item.id),
    item.workstream    || '',
    item.name          || '',
    item.sd            || '',
    item.ed            || '',
    item.color         || '',
    item.status        || 'Not Started',
    item.notes         || '',
    item.order         != null ? item.order : '',
    _serList(item.taskIds),
    _serList(item.linkedActions),
    item.createdBy     || '',
    item.createdAt     || now,
    now
  ];

  // ── Update existing row ────────────────────────────────────────────────────
  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(item.id)) {
        var existing = sheet.getRange(i + 2, 1, 1, LP_HEADERS.length).getValues()[0];
        rowData[11] = existing[11] || item.createdBy || '';  // preserve createdBy
        rowData[12] = existing[12] || item.createdAt || now; // preserve createdAt
        var rng = sheet.getRange(i + 2, 1, 1, LP_HEADERS.length);
        rng.setNumberFormat('@');
        rng.setValues([rowData]);
        return;
      }
    }
  }

  // ── Append new row ─────────────────────────────────────────────────────────
  var newRow = sheet.getLastRow() + 1;
  var rng    = sheet.getRange(newRow, 1, 1, LP_HEADERS.length);
  rng.setNumberFormat('@');
  rng.setValues([rowData]);
}

function deleteLaunchPlanItem(id) {
  if (!id) return;
  var sheet   = getLPSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) { sheet.deleteRow(i + 2); return; }
  }
}

// ── ADD TO doGet switch/if block ──────────────────────────────────────────────
//
//   if (action === 'launchplan_read') {
//     return json({ ok: true, items: getLaunchPlan() });
//   }

// ── ADD TO doPost switch/if block ─────────────────────────────────────────────
//
//   if (body.action === 'launchplan_write') {
//     setLaunchPlanItem(body.item);
//     return json({ ok: true });
//   }
//   if (body.action === 'launchplan_delete') {
//     deleteLaunchPlanItem(body.id);
//     return json({ ok: true });
//   }
