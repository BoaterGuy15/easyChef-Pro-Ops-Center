var SETTINGS_SHEET = 'Settings';
var SETTINGS_HEADERS = ['type', 'key', 'value', 'meta', 'updatedAt'];

function getSettingsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SETTINGS_SHEET);
  if(!sh) {
    sh = ss.insertSheet(SETTINGS_SHEET);
    sh.getRange(1,1,1,SETTINGS_HEADERS.length).setValues([SETTINGS_HEADERS]);
    var h = sh.getRange(1,1,1,SETTINGS_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
    h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
  }
  return sh;
}

function getSettings() {
  var sh = getSettingsSheet();
  if(sh.getLastRow() < 2) return [];
  var data = sh.getDataRange().getValues();
  var headers = data[0].map(function(h){ return String(h).trim(); });
  return data.slice(1).map(function(row){
    var obj = {};
    headers.forEach(function(h,i){ obj[h] = row[i]==null?'':String(row[i]); });
    return obj;
  }).filter(function(r){ return r.type; });
}

function setSetting(type, key, value, meta) {
  var sh = getSettingsSheet();
  var lastRow = sh.getLastRow();
  if(lastRow > 1) {
    var data = sh.getRange(2,1,lastRow-1,2).getValues();
    for(var i=0; i<data.length; i++) {
      if(String(data[i][0])===type && String(data[i][1])===key) {
        sh.getRange(i+2,3,1,3).setValues([[value, meta||'', new Date().toISOString()]]);
        return;
      }
    }
  }
  sh.appendRow([type, key, value, meta||'', new Date().toISOString()]);
}

function testSettings() {
  setSetting('test', 'key1', 'val1', '');
  Logger.log('setSetting OK');
  Logger.log(JSON.stringify(getSettings()));
}