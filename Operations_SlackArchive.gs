// ─────────────────────────────────────────────────────────────────────────────
// Operations_SlackArchive.gs
// ADD these to your existing Operations.gs — do NOT replace the file.
//
// ── doGet addition (paste inside your existing doGet if/else block) ───────────
//
//   if (e.parameter.action === 'slack_archive_search') {
//     return respond({ ok: true, messages: searchSlackArchive(e.parameter.query || '') });
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

function searchSlackArchive(query) {
  try {
    var ss = SpreadsheetApp.openById('1oTqTtpBaCYIYbj2u1eGuCD1n21iGGtP9n-IV3VKe-yo');
    var results = [];
    var q = query.toLowerCase();
    ss.getSheets().forEach(function(sh) {
      var data = sh.getDataRange().getValues();
      data.slice(1).forEach(function(row) {
        if (String(row[2] || '').toLowerCase().indexOf(q) >= 0) {
          results.push({
            date:    String(row[0]),
            user:    String(row[1]),
            message: String(row[2]),
            channel: sh.getName()
          });
        }
      });
    });
    return results.slice(0, 25);
  } catch (e) {
    return [];
  }
}
