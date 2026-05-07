// ONE-TIME: Fix Drive folder structure.
// Run fixDriveFolderStructure() from the Apps Script editor, paste log, then cleanup commit.

function fixDriveFolderStructure() {
  var CORRECT_TEAM_DOCS = '1aEpsK07UjYtiitntt56ezq6wxK3Blt7Z'; // Ops.DGL.dev/Team Documents
  var OLD_TEAM_DOCS     = '1k8LS8p2NUSpda4QOdo-03M26vWdlUVus'; // wrongly inside Archive

  var dest = DriveApp.getFolderById(CORRECT_TEAM_DOCS);
  var src  = DriveApp.getFolderById(OLD_TEAM_DOCS);

  // 1. Move all subfolders from old location to correct Team Documents
  var subs = src.getFolders();
  while (subs.hasNext()) {
    var sub  = subs.next();
    var name = sub.getName();
    try {
      sub.moveTo(dest);
      Logger.log('[MOVED] "' + name + '" → Team Documents');
    } catch(e) { Logger.log('[ERROR] Move "' + name + '": ' + e.message); }
  }

  // 2. Move any loose files too
  var files = src.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    try {
      f.moveTo(dest);
      Logger.log('[MOVED FILE] ' + f.getName());
    } catch(e) { Logger.log('[ERROR] Move file: ' + e.message); }
  }

  // 3. Trash the now-empty old Team Documents folder
  try {
    src.setTrashed(true);
    Logger.log('[DELETED] Old Team Documents folder from Archive');
  } catch(e) { Logger.log('[ERROR] Trash old folder: ' + e.message); }

  // 4. Rename the stray nested "Team Documents" inside correct Team Documents → "Training Videos"
  try {
    DriveApp.getFolderById('1pn4XfPxA_vJEleq4MltI-dhZykanzDUc').setName('Training Videos');
    Logger.log('[RENAMED] Nested Team Documents → Training Videos');
  } catch(e) { Logger.log('[ERROR] Rename nested folder: ' + e.message); }

  // 5. Clean up duplicate RACI Task Docs folders (keep first, trash second)
  var dupes = [
    { name: 'T-048', keep: '1pc3p6SRniHI3XierMJFrPyuVT_2kPej4', del: '1Z1-aP_JJCojXyYpr1Pj8R6glH346vQ-g' },
    { name: 'T-005', keep: '1fu0m6RTCcP_jrzhX2M3mFRInF9VOnNps',  del: '1Cr4ubwySqUUtOhdLQAeyaxdW5Ast2GER'  },
    { name: 'T-004', keep: '1rqEW6cfFsgwPbkS-ZA-qp6jlBPqgS8Rz',  del: '1JTafF8wjbwvPd4ZnJshV8gAH11mN2Njp'  },
    { name: 'T-002', keep: '1eML0lMw1r6apy5eu6Deh5vtI7TsCJ3HF',   del: '1mOi6LJXWJNvRFGdC_quX03WXnSUSbYzK'  }
  ];
  dupes.forEach(function(d) {
    try {
      DriveApp.getFolderById(d.del).setTrashed(true);
      Logger.log('[DELETED] Duplicate ' + d.name + ' (' + d.del + ')');
    } catch(e) { Logger.log('[ERROR] Delete ' + d.name + ' duplicate: ' + e.message); }
  });

  Logger.log('');
  Logger.log('fixDriveFolderStructure complete.');
}
