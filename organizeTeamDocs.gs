// organizeTeamDocs.gs
// ONE-TIME SCRIPT: Reorganize the Team Documents folder in Google Drive.
// Run organizeTeamDocs() once from the Apps Script editor, then delete this file.

function organizeTeamDocs() {
  var FOLDER_ID = '1k8LS8p2NUSpda4QOdo-03M26vWdlUVus'; // Team Documents

  // Subfolders to create inside Team Documents
  var SUBFOLDERS = [
    'Meeting Transcripts',
    'Product Docs',
    'Brand Assets',
    'Screenshots',
    'Slack Archive',
    'Other'
  ];

  // Map existing filenames → { newName, subfolder }
  var FILE_MAP = {
    'content 2.txt': {
      newName:   'MEETING — 2026-05-04 — Team Transcript 1',
      subfolder: 'Meeting Transcripts'
    },
    'content 3.txt': {
      newName:   'MEETING — 2026-05-04 — Team Transcript 2',
      subfolder: 'Meeting Transcripts'
    },
    'Screenshot 2026-05-04 112438.png': {
      newName:   'SCREENSHOT — 2026-05-04 — 112438',
      subfolder: 'Screenshots'
    },
    'GitHub Desktop.lnk': {
      newName:   'OTHER — GitHub Desktop Shortcut',
      subfolder: 'Other'
    },
    'pantry_consumption_tracking (Repaired).docx': {
      newName:   'PRODUCT — Pantry Consumption Tracking',
      subfolder: 'Product Docs'
    },
    'easyChef Pro Project Slack export.zip': {
      newName:   'SLACK — easyChef Pro Project Export 2026-05',
      subfolder: 'Slack Archive'
    },
    'easyChef_FB_Cover_Clean_AppleStyle.png': {
      newName:   'BRAND — FB Cover Clean Apple Style',
      subfolder: 'Brand Assets'
    }
  };

  var root = DriveApp.getFolderById(FOLDER_ID);
  Logger.log('Organizing folder: ' + root.getName());

  // Create (or retrieve) each subfolder
  var folderMap = {};
  SUBFOLDERS.forEach(function(name) {
    var iter = root.getFoldersByName(name);
    folderMap[name] = iter.hasNext() ? iter.next() : root.createFolder(name);
    Logger.log('Subfolder ready: ' + name + ' → ' + folderMap[name].getUrl());
  });

  // Walk files at root level, rename and move each one
  var files = root.getFiles();
  var moved = 0, skipped = 0;
  while (files.hasNext()) {
    var file  = files.next();
    var oldName = file.getName();
    var mapping = FILE_MAP[oldName];
    if (!mapping) {
      Logger.log('[SKIP] No mapping for: "' + oldName + '"');
      skipped++;
      continue;
    }
    file.setName(mapping.newName);
    var dest = folderMap[mapping.subfolder];
    dest.addFile(file);
    root.removeFile(file);
    Logger.log('[MOVED] "' + oldName + '" → "' + mapping.newName + '" (' + mapping.subfolder + ')');
    moved++;
  }

  Logger.log('Complete — moved: ' + moved + ', skipped: ' + skipped);
}

function organizeTeamDocs2() {
  var PARENT_ID = '1k8LS8p2NUSpda4QOdo-03M26vWdlUVus';
  var parent = DriveApp.getFolderById(PARENT_ID);

  var moves = [
    { name: 'easyChef Pro Project Slack export', folder: '1hrbndh6a3XrxTvVsXkqzeKz3dq91BQDe', newName: 'SLACK — easyChef Pro Export Oct 2023 - Apr 2026' },
    { name: 'Screenshot 2026-05-03',             folder: '1nNBP7NmFl9W1FqGOLgsc7-NUssUjemlN', newName: 'SCREENSHOT — GA4 UTM Checklist 2026-05-03' },
    { name: 'easyChef_FB_Cover',                 folder: '16S9rAuZ4fKpnFxm_e90C0s3JWXwbV0nj', newName: 'BRAND — easyChef Pro FB Cover Apple Style' },
    { name: 'EasyChef-Symbol-Red',               folder: '16S9rAuZ4fKpnFxm_e90C0s3JWXwbV0nj', newName: 'BRAND — easyChef Pro Symbol Red' }
  ];

  moves.forEach(function(m) {
    var iter = parent.getFiles();
    var matched = false;
    while (iter.hasNext()) {
      var f = iter.next();
      if (f.getName().indexOf(m.name) > -1) {
        f.setName(m.newName);
        f.moveTo(DriveApp.getFolderById(m.folder));
        Logger.log('[MOVED] ' + m.newName);
        matched = true;
      }
    }
    if (!matched) Logger.log('[SKIP] No file found containing: ' + m.name);
  });

  Logger.log('organizeTeamDocs2 complete.');
}
