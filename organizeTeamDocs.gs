// organizeTeamDocs.gs
// ONE-TIME SCRIPT: Drive cleanup.
// Run cleanupDrive() once from the Apps Script editor, then delete this file.

function cleanupDrive() {
  var results = [];

  // 1. Rename Agenda folder to Archive
  try {
    var agendaFolder = DriveApp.getFolderById('1szyMEyxtoxJUCZiHXpw2Z1sCYcVKeg_v');
    var oldName = agendaFolder.getName();
    agendaFolder.setName('Archive');
    results.push('[RENAMED] "' + oldName + '" → "Archive"');
  } catch(e) { results.push('[ERROR] Rename Agenda: ' + e.message); }

  // 2. Delete stray Team Documents folder
  try {
    DriveApp.getFolderById('1ithusFhhhhsUSNgQJJief-lBBkj6dWY8').setTrashed(true);
    results.push('[DELETED] Stray Team Documents (1ithusFhhhhsUSNgQJJief-lBBkj6dWY8)');
  } catch(e) { results.push('[ERROR] Delete stray Team Documents: ' + e.message); }

  // 3. Delete duplicate T-060 folders (keep 1-JGGPKI0oZV745lnrEHeGCmIp_neVo7b)
  var t060Dupes = ['1ediNu-1AnH-0ukHNAyETuEH13WZjVFxm', '12nRqSDhfEHmOxXW2rEJ4TRc2l2hvExO3'];
  t060Dupes.forEach(function(id) {
    try {
      DriveApp.getFolderById(id).setTrashed(true);
      results.push('[DELETED] T-060 duplicate (' + id + ')');
    } catch(e) { results.push('[ERROR] Delete T-060 (' + id + '): ' + e.message); }
  });

  // 4. Delete duplicate T-064 folder (keep 1P1GJvGmQtmgH05iAkrfqdJo5ZPdY5kDt)
  try {
    DriveApp.getFolderById('1m9rwFWSuASHtFNgrSH_nc6ZEr6c_Da7k').setTrashed(true);
    results.push('[DELETED] T-064 duplicate (1m9rwFWSuASHtFNgrSH_nc6ZEr6c_Da7k)');
  } catch(e) { results.push('[ERROR] Delete T-064 duplicate: ' + e.message); }

  results.forEach(function(r) { Logger.log(r); });
  Logger.log('cleanupDrive complete — ' + results.length + ' operations.');
}
