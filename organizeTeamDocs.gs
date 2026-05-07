// ONE-TIME: List subfolders in both root candidates so we can pick the right one.
// Run listRoots() then paste the log.

function listRoots() {
  var roots = {
    'Code root (SHARED_DRIVE_FOLDER_ID)': '1Df-rn-YRUBL9AvkwruikxUZHr7nfu7gf',
    'Actual root (1p-unAq...)':           '1p-unAqDk2pwlz-zO2NLh8uHZkTzFM7_h'
  };

  Object.keys(roots).forEach(function(label) {
    Logger.log('── ' + label + ' ──');
    var folder = DriveApp.getFolderById(roots[label]);
    Logger.log('Name: ' + folder.getName() + '  ID: ' + folder.getId());
    var iter = folder.getFolders();
    if (!iter.hasNext()) { Logger.log('  (no subfolders)'); }
    while (iter.hasNext()) {
      var f = iter.next();
      Logger.log('  [FOLDER] ' + f.getName() + ' — ' + f.getId());
    }
    var fIter = folder.getFiles();
    while (fIter.hasNext()) {
      var fi = fIter.next();
      Logger.log('  [FILE]   ' + fi.getName());
    }
  });
}
