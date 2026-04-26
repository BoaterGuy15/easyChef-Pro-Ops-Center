// ─────────────────────────���──────────────────────────────���────────────────────
// Operations_Completions.gs
// ADD these functions to your existing Operations.gs
// Do NOT replace the existing file — paste the function below into it.
//
// ── doPost addition (paste inside your existing doPost(e) if/else block) ─────
//
//   if (body.action === 'completion_delete') {
//     deleteCompletion(body.id);
//     return json({ ok: true });
//   }
//
// ─────────────────────────────────────────────────────��───────────────────────

/**
 * Deletes a completion record row from the Completions sheet by id.
 */
function deleteCompletion(id) {
  if (!id) return;
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Completions');
  if (!sheet) return;
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
