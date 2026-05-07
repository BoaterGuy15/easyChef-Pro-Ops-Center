// ── Files.gs — Document & File Management ────────────────────
// Shared Drive Folder: https://drive.google.com/drive/folders/1Df-rn-YRUBL9AvkwruikxUZHr7nfu7gf

const SHARED_DRIVE_FOLDER_ID = '1Df-rn-YRUBL9AvkwruikxUZHr7nfu7gf';
const DOCS_SHEET = 'Documents';
const DOCS_HEADERS = ['id','taskId','agendaId','name','url','previewUrl','driveFileId','mimeType','reviewNeeded','addedBy','addedAt','folderUrl'];

function getOrCreateFolder(parentFolder, folderName) {
  const existing = parentFolder.getFoldersByName(folderName);
  if(existing.hasNext()) return existing.next();
  return parentFolder.createFolder(folderName);
}

function uploadFileToDrive(filename, mimeType, base64data, sourceType, sourceId, sourceName) {
  const root = DriveApp.getFolderById(SHARED_DRIVE_FOLDER_ID);
  const typeFolder = getOrCreateFolder(root, sourceType === 'agenda' ? 'Agenda' : sourceType === 'profile' ? 'Profiles' : 'RACI Task Docs');
  
  // Build clean folder name
  const cleanName = (sourceName||'').replace(/[\/\\:*?"<>|]/g,'').trim();
  const subFolderName = sourceType === 'profile' ? (cleanName || sourceId) : (cleanName ? (sourceId + ' — ' + cleanName) : sourceId);
  
  const subFolder = getOrCreateFolder(typeFolder, subFolderName || sourceId || 'misc');
  const blob = Utilities.newBlob(Utilities.base64Decode(base64data), mimeType, filename);
  const file = subFolder.createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(se) { Logger.log('[Files] setSharing skipped: ' + se.message); }
  
  return {
    id: file.getId(),
    url: file.getUrl(),
    previewUrl: 'https://drive.google.com/file/d/'+file.getId()+'/preview',
    folderUrl: subFolder.getUrl()
  };
}

function getDocuments(taskId, agendaId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(DOCS_SHEET);
  if(!sh || sh.getLastRow() < 2) return [];
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const docs = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h,i) => obj[String(h).trim()] = row[i]==null?'':String(row[i]));
    return obj;
  }).filter(d => d.id);
  if(taskId) return docs.filter(d => d.taskId === taskId);
  if(agendaId) return docs.filter(d => d.agendaId === agendaId);
  return docs;
}

function addDocument(doc) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(DOCS_SHEET);
  if(!sh) {
    sh = ss.insertSheet(DOCS_SHEET);
    sh.getRange(1,1,1,DOCS_HEADERS.length).setValues([DOCS_HEADERS]);
    const h = sh.getRange(1,1,1,DOCS_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
    h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1,120); sh.setColumnWidth(4,250); sh.setColumnWidth(5,400);
  }
  sh.appendRow(DOCS_HEADERS.map(h => doc[h]||''));
}



function deleteDocument(docId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(DOCS_SHEET);
  if(!sh || sh.getLastRow() < 2) return;
  const data = sh.getDataRange().getValues();
  for(let i = data.length - 1; i >= 1; i--) {
    if(String(data[i][0]) === String(docId)) {
      sh.deleteRow(i + 1);
      // Try to delete from Drive too
      const driveFileId = data[i][DOCS_HEADERS.indexOf('driveFileId')];
      try { if(driveFileId) DriveApp.getFileById(driveFileId).setTrashed(true); } catch(e) {}
      return;
    }
  }
}

function testDriveAccess() {
  const folder = DriveApp.getFolderById(SHARED_DRIVE_FOLDER_ID);
  Logger.log('Folder name: ' + folder.getName());
}

function checkFolderStructure() {
  const root = DriveApp.getFolderById('1p-unAqDk2pwlz-zO2NLh8uHZkTzFM7_h');
  const folders = root.getFolders();
  while(folders.hasNext()) {
    const f = folders.next();
    Logger.log('Root subfolder: ' + f.getName() + ' — ' + f.getUrl());
    const sub = f.getFolders();
    while(sub.hasNext()) {
      const s = sub.next();
      Logger.log('  Subfolder: ' + s.getName());
      const files = s.getFiles();
      while(files.hasNext()) {
        Logger.log('    File: ' + files.next().getName());
      }
    }
    // Also check files directly in root subfolder
    const rootFiles = f.getFiles();
    while(rootFiles.hasNext()) {
      Logger.log('  Direct file: ' + rootFiles.next().getName());
    }
  }
}
function testSubfolderCreation() {
  const result = uploadFileToDrive(
    'test-sub.txt', 
    'text/plain', 
    Utilities.base64Encode('test content'),
    'task',
    'T-006',
    'Pricing Strategy'
  );
  Logger.log('URL: ' + result.url);
  Logger.log('FolderURL: ' + result.folderUrl);
  Logger.log('ID: ' + result.id);
}
function findTestFolders() {
  const folders = DriveApp.getFoldersByName('Tasks');
  while(folders.hasNext()) {
    const f = folders.next();
    Logger.log('Tasks folder: ' + f.getUrl() + ' parent: ' + f.getParents().next().getName());
  }
}

function testSubfolders() {
  const result = uploadFileToDrive(
    'test-subfolder.txt', 'text/plain', btoa('test'), 
    'task', 'T-001', 'ICP Research'
  );
  Logger.log('File URL: ' + result.url);
  Logger.log('Folder URL: ' + result.folderUrl);
}