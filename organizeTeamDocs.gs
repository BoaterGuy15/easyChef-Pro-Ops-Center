// ONE-TIME: Remove stray Tasks folder and duplicate easyChef Pro Campaigns
// inside RACI-WorkFlow. Run cleanupDrive2() then delete this file.

function cleanupDrive2() {
  var results = [];

  // Delete stray Tasks folder (created by old bug — now fixed to RACI Task Docs)
  try {
    DriveApp.getFolderById('1zPgZ0IvJPtwgfNBPVWXti9eTOuorSunp').setTrashed(true);
    results.push('[DELETED] Stray Tasks folder (1zPgZ0IvJPtwgfNBPVWXti9eTOuorSunp)');
  } catch(e) { results.push('[ERROR] Delete Tasks: ' + e.message); }

  // Delete duplicate easyChef Pro Campaigns inside RACI-WorkFlow
  try {
    DriveApp.getFolderById('18lIKGcHFr6KtxlIPw4AV8N6lYk6fx7mi').setTrashed(true);
    results.push('[DELETED] Duplicate easyChef Pro Campaigns in RACI-WorkFlow (18lIKGcHFr6KtxlIPw4AV8N6lYk6fx7mi)');
  } catch(e) { results.push('[ERROR] Delete duplicate Campaigns: ' + e.message); }

  results.forEach(function(r) { Logger.log(r); });
  Logger.log('cleanupDrive2 complete — ' + results.length + ' operations.');
}
