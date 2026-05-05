function getHRProfiles() {
  const ss = SpreadsheetApp.openById(HR_SPREADSHEET_ID);
  const sh = ss.getSheetByName(HR_PROFILES_SHEET);
  if(!sh || sh.getLastRow() < 2) return [];
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h,i) => obj[String(h).trim()] = row[i]==null?'':String(row[i]));
    return obj;
  }).filter(p => p.userKey);
}

function setHRProfile(profile) {
  const ss = SpreadsheetApp.openById(HR_SPREADSHEET_ID);
  let sh = ss.getSheetByName(HR_PROFILES_SHEET);
  if(!sh) {
    sh = ss.insertSheet(HR_PROFILES_SHEET);
    sh.getRange(1,1,1,HR_PROFILES_HEADERS.length).setValues([HR_PROFILES_HEADERS]);
    const h = sh.getRange(1,1,1,HR_PROFILES_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c'); h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
  }
  const lastRow = sh.getLastRow();
  if(lastRow > 1) {
    const keys = sh.getRange(2,1,lastRow-1,1).getValues().map(r=>String(r[0]));
    const idx = keys.indexOf(String(profile.userKey));
    if(idx >= 0) {
      // MERGE — only update fields that are provided, keep existing values
      const existingRow = sh.getRange(idx+2,1,1,HR_PROFILES_HEADERS.length).getValues()[0];
      const existingObj = {};
      HR_PROFILES_HEADERS.forEach((h,i) => existingObj[h] = existingRow[i]||'');
      const merged = {...existingObj, ...Object.fromEntries(Object.entries(profile).filter(([k,v])=>v!==undefined&&v!==''))};
      sh.getRange(idx+2,1,1,HR_PROFILES_HEADERS.length).setValues([HR_PROFILES_HEADERS.map(h=>merged[h]||'')]);
      return;
    }
  }
  sh.appendRow(HR_PROFILES_HEADERS.map(h => profile[h]||''));
}

function addHRNote(note) {
  const ss = SpreadsheetApp.openById(HR_SPREADSHEET_ID);
  let sh = ss.getSheetByName(HR_NOTES_SHEET);
  if(!sh) {
    sh = ss.insertSheet(HR_NOTES_SHEET);
    sh.getRange(1,1,1,HR_NOTES_HEADERS.length).setValues([HR_NOTES_HEADERS]);
    const h = sh.getRange(1,1,1,HR_NOTES_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c'); h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
  }
  sh.appendRow(HR_NOTES_HEADERS.map(h => note[h]||''));
}