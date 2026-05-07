// ONE-TIME: Create Videos folder structure under Ops.DGL.dev.
// Run createVideoFolders(), paste the log, then Claude Code updates Files.gs with the IDs.

function createVideoFolders() {
  var ROOT_ID          = '1Df-rn-YRUBL9AvkwruikxUZHr7nfu7gf'; // Ops.DGL.dev
  var TRAINING_OLD_ID  = '1pn4XfPxA_vJEleq4MltI-dhZykanzDUc'; // Training Videos (currently in Team Documents)

  var root = DriveApp.getFolderById(ROOT_ID);

  // Create top-level Videos folder
  var videosFolder = _cvGetOrCreate(root, 'Videos');
  Logger.log('[CREATED] Videos — ' + videosFolder.getId());

  // Create subfolders
  var subs = ['Training', 'Product', 'Brand', 'Meetings', 'Other'];
  var ids  = {};
  subs.forEach(function(name) {
    var f = _cvGetOrCreate(videosFolder, name);
    ids[name] = f.getId();
    Logger.log('[CREATED] Videos/' + name + ' — ' + f.getId());
  });

  // Move existing Training Videos folder into Videos/Training
  try {
    var oldTraining = DriveApp.getFolderById(TRAINING_OLD_ID);
    // Move its contents into Videos/Training
    var trainingDest = DriveApp.getFolderById(ids['Training']);
    var subIter = oldTraining.getFolders();
    while (subIter.hasNext()) {
      var sub = subIter.next();
      sub.moveTo(trainingDest);
      Logger.log('[MOVED] ' + sub.getName() + ' → Videos/Training');
    }
    var fileIter = oldTraining.getFiles();
    while (fileIter.hasNext()) {
      var f2 = fileIter.next();
      f2.moveTo(trainingDest);
      Logger.log('[MOVED FILE] ' + f2.getName() + ' → Videos/Training');
    }
    // Trash the now-empty old Training Videos folder
    oldTraining.setTrashed(true);
    Logger.log('[DELETED] Old Training Videos folder from Team Documents');
  } catch(e) {
    Logger.log('[ERROR] Move training content: ' + e.message);
  }

  Logger.log('');
  Logger.log('── COPY THESE IDs INTO Files.gs ──');
  Logger.log('VIDEOS_FOLDER_ID: ' + videosFolder.getId());
  subs.forEach(function(name) { Logger.log('Videos/' + name + ': ' + ids[name]); });
  Logger.log('createVideoFolders complete.');
}

function _cvGetOrCreate(parent, name) {
  var iter = parent.getFoldersByName(name);
  return iter.hasNext() ? iter.next() : parent.createFolder(name);
}
