// organizeTeamDocs.gs
// ONE-TIME SCRIPT: Rename Agenda folder to Archive by searching by name.
// Run renameAgendaToArchive() from the Apps Script editor, then delete this file.

function renameAgendaToArchive() {
  var ROOT_ID = '1p-unAqDk2pwlz-zO2NLh8uHZkTzFM7_h';
  var root = DriveApp.getFolderById(ROOT_ID);

  // List all subfolders so we can see what's there
  var iter = root.getFolders();
  while (iter.hasNext()) {
    var f = iter.next();
    Logger.log('[FOUND] "' + f.getName() + '" — ' + f.getId());
    if (f.getName() === 'Agenda') {
      f.setName('Archive');
      Logger.log('[RENAMED] Agenda → Archive (' + f.getId() + ')');
    }
  }
  Logger.log('Done.');
}
