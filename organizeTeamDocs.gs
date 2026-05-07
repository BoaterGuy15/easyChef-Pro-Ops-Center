// ONE-TIME DIAGNOSTIC: List full subfolder tree under key Drive folders.
// Run listDriveTree() and paste the log.

function listDriveTree() {
  var roots = [
    { label: 'Ops.DGL.dev (root)',          id: '1Df-rn-YRUBL9AvkwruikxUZHr7nfu7gf' },
    { label: 'Team Documents',               id: '1aEpsK07UjYtiitntt56ezq6wxK3Blt7Z' },
    { label: 'RACI-WorkFlow',                id: '1p-unAqDk2pwlz-zO2NLh8uHZkTzFM7_h' },
    { label: 'easyChef Pro Campaigns',       id: '1OUu2k1Iv-6nk1APO3sF3qm217YV3sGJf' }
  ];

  roots.forEach(function(r) {
    Logger.log('');
    Logger.log('══ ' + r.label + ' (' + r.id + ') ══');
    var folder = DriveApp.getFolderById(r.id);
    Logger.log('  Name: ' + folder.getName());
    var subs = folder.getFolders();
    if (!subs.hasNext()) { Logger.log('  (no subfolders)'); }
    while (subs.hasNext()) {
      var sub = subs.next();
      Logger.log('  [FOLDER] ' + sub.getName() + ' — ' + sub.getId());
      var subsubs = sub.getFolders();
      while (subsubs.hasNext()) {
        var ss = subsubs.next();
        Logger.log('    [FOLDER] ' + ss.getName() + ' — ' + ss.getId());
      }
    }
    var files = folder.getFiles();
    var fc = 0;
    while (files.hasNext()) { files.next(); fc++; }
    if (fc > 0) Logger.log('  (' + fc + ' files at root level)');
  });

  Logger.log('');
  Logger.log('listDriveTree complete.');
}
