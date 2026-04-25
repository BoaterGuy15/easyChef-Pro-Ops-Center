// ─────────────────────────────────────────────────────────────────────────────
// ADD THESE FUNCTIONS TO YOUR EXISTING Operations.gs
// Do NOT replace the existing file — paste these into it.
// ─────────────────────────────────────────────────────────────────────────────

var LP_SHEET = 'RoadMap';
var LP_HEADERS = ['id', 'workstream', 'name', 'sd', 'ed', 'status', 'color', 'notes', 'updatedAt'];

function getLPSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LP_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(LP_SHEET);
    sheet.getRange(1, 1, 1, LP_HEADERS.length).setValues([LP_HEADERS]);
    sheet.getRange(1, 1, 1, LP_HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function getLaunchPlan() {
  var sheet = getLPSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var rows = sheet.getRange(2, 1, lastRow - 1, LP_HEADERS.length).getValues();
  return rows
    .filter(function(r) { return r[0]; })
    .map(function(r) {
      return {
        id: r[0], workstream: r[1], name: r[2],
        sd: r[3] ? (r[3] instanceof Date ? Utilities.formatDate(r[3], 'UTC', 'yyyy-MM-dd') : r[3]) : '',
        ed: r[4] ? (r[4] instanceof Date ? Utilities.formatDate(r[4], 'UTC', 'yyyy-MM-dd') : r[4]) : '',
        status: r[5], color: r[6], notes: r[7], updatedAt: r[8]
      };
    });
}

function setLaunchPlanItem(item) {
  if (!item || !item.id) return;
  var sheet = getLPSheet();
  var lastRow = sheet.getLastRow();
  var now = new Date().toISOString();

  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === item.id) {
        sheet.getRange(i + 2, 1, 1, LP_HEADERS.length).setValues([[
          item.id, item.workstream || '', item.name || '',
          item.sd || '', item.ed || '', item.status || 'Not Started',
          item.color || '', item.notes || '', now
        ]]);
        return;
      }
    }
  }

  sheet.appendRow([
    item.id, item.workstream || '', item.name || '',
    item.sd || '', item.ed || '', item.status || 'Not Started',
    item.color || '', item.notes || '', now
  ]);
}

function deleteLaunchPlanItem(id) {
  if (!id) return;
  var sheet = getLPSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) { sheet.deleteRow(i + 2); return; }
  }
}

// ── ADD TO doGet switch/if block ──────────────────────────────────────────────
// In your existing doGet(e) function, add this case:
//
//   if (action === 'launchplan_read') {
//     return json({ ok: true, items: getLaunchPlan() });
//   }

// ── ADD TO doPost switch/if block ─────────────────────────────────────────────
// In your existing doPost(e) function, add these cases:
//
//   if (body.action === 'launchplan_write') {
//     setLaunchPlanItem(body.item);
//     return json({ ok: true });
//   }
//   if (body.action === 'launchplan_delete') {
//     deleteLaunchPlanItem(body.id);
//     return json({ ok: true });
//   }
