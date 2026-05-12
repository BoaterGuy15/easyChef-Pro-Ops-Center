
const SHEET_NAME = 'Tasks';
const BUDGET_SHEET_NAME = 'Budget';
const PMF_SHEET_NAME = 'PMF';
const PROFILES_SHEET_NAME = 'Profiles';
const AGENDA_SHEET_NAME = 'Agenda';
const COMMENTS_SHEET = 'Comments';
const BETA_SHEET = 'BetaMetrics';
const ANALYTICS_SHEET = 'AppAnalytics';
const SLACK_CHANNEL_SHEET = 'LockLogs';
const CHANNEL_MAPS_SHEET = 'ChannelMaps';
const COMPLETIONS_SHEET = 'Completions';
const ACTION_PLANS_SHEET = 'ActionPlans';
const HR_SPREADSHEET_ID = '1uoPCsl9BS8DRXDS3XVwBNf1THeyMtQmiiSL4MwWZ9pY';
const HR_PROFILES_SHEET = 'HRProfiles';
const HR_NOTES_SHEET = 'HRNotes';
const HR_PROFILES_HEADERS = [
  'userKey','name','role','status','startDate','contractType',
  'payRate','payFrequency','expenseIds','notes','inactivationReason',
  'reactivatable','createdAt','phone','slack','timezone','github',
  'channels','email','color','accessLevel','passwordHash','photo'
];
const HR_NOTES_HEADERS = ['id','userKey','authorKey','authorName','timestamp','noteType','text','private'];

const ACTION_PLAN_HEADERS = [
  'id','sourceId','sourceType','title','text','createdBy',
  'createdAt','linkedTaskId','linkedAgendaId','status','completedAt'
];

const FIELDS = [
  'id','name','cat','pri','status','owner','deps','notes',
  'Taylor','Steve','Adam','Mary','JR','Hammad','Searah','Sadee',
  'flag','flagColor','sd','ed','lastStatusChange','actionPlan','flagNotes','decision'
];
const BUDGET_HEADERS = [
  'timestamp','scenario','starting_capital','ad_budget',
  'monthly_burn','monthly_revenue','runway_months','launch_reserve',
  'phase1_pct','phase2_pct','phase3_pct','phase4_pct','phase5_pct',
  'searah_cost','sadee_cost','min_reserve','notes'
];
const PMF_HEADERS = [
  'timestamp','notes','overall_status',
  'kpi1_target','kpi1_current','kpi1_name',
  'kpi2_target','kpi2_current','kpi2_name',
  'kpi3_target','kpi3_current','kpi3_name'
];
const AGENDA_HEADERS = [
  'id','title','detail','decision','checked','owner','deadline','category',
  'taskId','flag','actionPlan','taskPlan','taskPlans'
];

const COMPLETIONS_HEADERS = [
  'id','taskId','taskName','category','completedBy','involvedTeam',
  'description','deliverableType','fileAttached','completedDate',
  'timeSpent','blockers','qualityScore','nextSteps','notified',
  'unlockedTasks','sessionHash','loggedBy','timestamp','driveFileId'
];

const GAPS_SHEET = 'Gaps';
const NOTIFICATIONS_SHEET = 'Notifications';
const STATUS_LOG_SHEET = 'StatusLog';

const GAPS_HEADERS = ['id','taskId','agendaId','type','description','detectedBy','detectedAt','status','resolvedAt','resolvedBy'];
const NOTIFICATIONS_HEADERS = ['id','taskId','toUser','channel','message','sentBy','sentAt','type'];
const STATUS_LOG_HEADERS = ['id','taskId','fromStatus','toStatus','changedBy','changedAt','note'];

// ── Documents ─────────────────────────────────────────────────

function testDocs() {
  try {
    addDocument({
      id: 'test-123',
      taskId: 'T-001',
      name: 'test.txt',
      url: 'https://example.com',
      addedBy: 'taylor',
      addedAt: new Date().toISOString()
    });
    Logger.log('addDocument: OK');
    deleteDocument('test-123');
    Logger.log('deleteDocument: OK');
  } catch(e) {
    Logger.log('ERROR: ' + e.message);
  }
}
function addGap(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(GAPS_SHEET);
  if(!sh) { sh = ss.insertSheet(GAPS_SHEET); sh.getRange(1,1,1,GAPS_HEADERS.length).setValues([GAPS_HEADERS]); const h=sh.getRange(1,1,1,GAPS_HEADERS.length); h.setBackground('#1a1a2e');h.setFontColor('#c9a84c');h.setFontWeight('bold');h.setFontFamily('Courier New');sh.setFrozenRows(1); }
  sh.appendRow(GAPS_HEADERS.map(h=>data[h]||''));
}

function getGaps(status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(GAPS_SHEET);
  if(!sh||sh.getLastRow()<2) return [];
  const data = sh.getDataRange().getValues();
  const headers = data[0].map(h=>String(h).trim());
  const all = data.slice(1).map(row=>{const obj={};headers.forEach((h,i)=>obj[h]=row[i]==null?'':String(row[i]));return obj;}).filter(r=>r.id);
  return status ? all.filter(r=>r.status===status) : all;
}

function addNotification(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(NOTIFICATIONS_SHEET);
  if(!sh) { sh = ss.insertSheet(NOTIFICATIONS_SHEET); sh.getRange(1,1,1,NOTIFICATIONS_HEADERS.length).setValues([NOTIFICATIONS_HEADERS]); const h=sh.getRange(1,1,1,NOTIFICATIONS_HEADERS.length); h.setBackground('#1a1a2e');h.setFontColor('#c9a84c');h.setFontWeight('bold');h.setFontFamily('Courier New');sh.setFrozenRows(1); }
  sh.appendRow(NOTIFICATIONS_HEADERS.map(h=>data[h]||''));
}

function addStatusLog(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(STATUS_LOG_SHEET);
  if(!sh) { sh = ss.insertSheet(STATUS_LOG_SHEET); sh.getRange(1,1,1,STATUS_LOG_HEADERS.length).setValues([STATUS_LOG_HEADERS]); const h=sh.getRange(1,1,1,STATUS_LOG_HEADERS.length); h.setBackground('#1a1a2e');h.setFontColor('#c9a84c');h.setFontWeight('bold');h.setFontFamily('Courier New');sh.setFrozenRows(1); }
  sh.appendRow(STATUS_LOG_HEADERS.map(h=>data[h]||''));
}

function getStatusLog(taskId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(STATUS_LOG_SHEET);
  if(!sh||sh.getLastRow()<2) return [];
  const data = sh.getDataRange().getValues();
  const headers = data[0].map(h=>String(h).trim());
  const all = data.slice(1).map(row=>{const obj={};headers.forEach((h,i)=>obj[h]=row[i]==null?'':String(row[i]));return obj;}).filter(r=>r.id);
  return taskId ? all.filter(r=>r.taskId===taskId) : all;
}

function getNotifications() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(NOTIFICATIONS_SHEET);
  if(!sh || sh.getLastRow() < 2) return [];
  const data = sh.getDataRange().getValues();
  const headers = data[0].map(h=>String(h).trim());
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = row[i]==null?'':String(row[i]));
    return obj;
  }).filter(r => r.id);
}


// uploadFileToDrive is defined in Files.gs — do not duplicate here

function checkFolderId() {
  Logger.log('SHARED_DRIVE_FOLDER_ID: ' + SHARED_DRIVE_FOLDER_ID);
  try {
    const f = DriveApp.getFolderById(SHARED_DRIVE_FOLDER_ID);
    Logger.log('Folder name: ' + f.getName());
  } catch(e) {
    Logger.log('Error: ' + e.message);
  }
}

function testExactUpload() {
  try {
    const result = uploadFileToDrive(
      'test.txt',
      'text/plain', 
      Utilities.base64Encode('hello'),
      'task',
      'T-022',
      'Social Media Campaign Design'
    );
    Logger.log('Success: ' + JSON.stringify(result));
  } catch(e) {
    Logger.log('Error: ' + e.message);
    Logger.log('Stack: ' + e.stack);
  }
}

function testGetOrCreate() {
  try {
    const root = DriveApp.getFolderById('1p-unAqDk2pwlz-zO2NLh8uHZkTzFM7_h');
    const result = getOrCreateFolder(root, 'Tasks');
    Logger.log('OK: ' + result.getName());
  } catch(e) {
    Logger.log('Error at: ' + e.stack);
  }
}

function testUpload() {
  try {
    const root = DriveApp.getFolderById('1p-unAqDk2pwlz-zO2NLh8uHZkTzFM7_h');
    const typeFolder = getOrCreateFolder(root, 'Tasks');
    Logger.log('typeFolder: ' + typeFolder.getName());
    const subFolder = getOrCreateFolder(typeFolder, 'T-022 — Test');
    Logger.log('subFolder: ' + subFolder.getName());
    Logger.log('✅ All good');
  } catch(e) {
    Logger.log('❌ Error: ' + e.message);
  }
}

function testProfileUpload() {
  try {
    const root = DriveApp.getFolderById('1p-unAqDk2pwlz-zO2NLh8uHZkTzFM7_h');
    Logger.log('Root folder: ' + root.getName());
    
    // Try creating a Profiles subfolder
    let profilesFolder;
    const existing = root.getFoldersByName('Profiles');
    if(existing.hasNext()) {
      profilesFolder = existing.next();
    } else {
      profilesFolder = root.createFolder('Profiles');
    }
    Logger.log('Profiles folder: ' + profilesFolder.getName());
    
    // Try writing a test file
    const blob = Utilities.newBlob('test', 'text/plain', 'test.txt');
    const file = profilesFolder.createFile(blob);
    Logger.log('Test file created: ' + file.getUrl());
    file.setTrashed(true);
    Logger.log('✅ All good');
  } catch(e) {
    Logger.log('❌ Error: ' + e.message);
  }
}

function _getFolderDefs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Folders');
  if(!sheet) return [];
  return sheet.getDataRange().getValues()
    .map(row => (row[0]||'').toString().trim())
    .filter(Boolean);
}

function _saveFolderDefs(folders) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Folders');
  if(!sheet) sheet = ss.insertSheet('Folders');
  sheet.clearContents();
  if(folders && folders.length) {
    sheet.getRange(1,1,folders.length,1).setValues(folders.map(f=>[f]));
  }
}

// Recursively scan a folder into a shared results map {cat:[files]}.
// Sub-folders get their own category key: parentCat/subFolderName.
function _scanFolderDeep(folder, cat, maxDepth, map, folderIds) {
  if(!map[cat]) map[cat] = [];
  if(folderIds) folderIds[cat] = folder.getId();
  var folderUrl = folder.getUrl();
  try {
    var fileIt = folder.getFiles();
    while(fileIt.hasNext()) {
      var f = fileIt.next();
      map[cat].push({id:'drive-'+f.getId(), name:f.getName(), url:f.getUrl(),
        previewUrl:'https://drive.google.com/file/d/'+f.getId()+'/preview',
        driveFileId:f.getId(), mimeType:f.getMimeType(), folderUrl:folderUrl,
        addedAt:f.getDateCreated().toISOString(), addedBy:'',
        category:cat, taskId:'', agendaId:'', shared:'true'});
    }
    if(maxDepth > 0) {
      var subIt = folder.getFolders();
      while(subIt.hasNext()) {
        var sub = subIt.next();
        _scanFolderDeep(sub, cat+'/'+sub.getName(), maxDepth - 1, map, folderIds);
      }
    }
  } catch(e) { Logger.log('_scanFolderDeep error '+cat+': '+e.message); }
}

function _getCustomFolders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CustomFolders');
  if(!sheet || sheet.getLastRow() < 2) return [];
  const data = sheet.getDataRange().getValues();
  return data.slice(1).filter(row => row[0]).map(row => ({
    name: String(row[0]||''), section: String(row[1]||''), driveId: String(row[2]||''), url: String(row[3]||'')
  }));
}

function _saveCustomFolder(folder) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('CustomFolders');
  if(!sheet) {
    sheet = ss.insertSheet('CustomFolders');
    sheet.appendRow(['name','section','driveId','url']);
  }
  const existing = sheet.getLastRow() > 1 ? sheet.getDataRange().getValues() : [];
  for(var i=1; i<existing.length; i++) {
    if(String(existing[i][2]) === String(folder.driveId||'')) return;
  }
  sheet.appendRow([folder.name||'', folder.section||'', folder.driveId||'', folder.url||'']);
}

function _removeCustomFolderById(driveId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CustomFolders');
  if(!sheet || sheet.getLastRow() < 2) return;
  const data = sheet.getDataRange().getValues();
  for(var i = data.length - 1; i >= 1; i--) {
    if(String(data[i][2]) === String(driveId)) sheet.deleteRow(i + 1);
  }
}

function _patchCustomFolderName(driveId, newName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CustomFolders');
  if(!sheet || sheet.getLastRow() < 2) return;
  const data = sheet.getDataRange().getValues();
  for(var i = 1; i < data.length; i++) {
    if(String(data[i][2]) === String(driveId)) sheet.getRange(i + 1, 1).setValue(newName);
  }
}

// Runs ensureCampaignBriefColumns() once per script instance.
// Script Properties cache the "done" state so subsequent loads skip the sheet read.
function _ensureColumnsOnce() {
  try {
    var props = PropertiesService.getScriptProperties();
    if (props.getProperty('brief_cols_ensured') === 'true') return;
    var result = ensureCampaignBriefColumns();
    if (result && result.ok && result.added === 0) props.setProperty('brief_cols_ensured', 'true');
  } catch(e) { Logger.log('[ensureColumnsOnce] ' + e.message); }
}

function doGet(e) {
  try {
    _ensureColumnsOnce();
    if(e.parameter.action === 'version') return respond({ok:true, v:'2026-05-08-folder'});
    if(e.parameter.action === 'drive_file_read') {
      try { var _rf=DriveApp.getFileById(e.parameter.fileId||''); return respond({ok:true,name:_rf.getName(),text:_rf.getBlob().getDataAsString()}); }
      catch(err){ return respond({ok:false,error:err.message}); }
    }
    if(e.parameter.code) return doGetSlackOAuth(e);
    if(e.parameter.action === 'anthropic') return callAnthropic({ prompt: e.parameter.prompt||'', system: e.parameter.system||'' });
    if(e.parameter.action === 'budget_read') return respond({ ok: true, history: getBudgetHistory() });
    if(e.parameter.action === 'pmf_write') {
      const p = e.parameter;
      appendPMFRow({ date:p.date||'', notes:p.notes||'', overall_status:p.overall||'', kpi1_target:p.k1t||'', kpi1_current:p.k1c||'', kpi1_name:p.k1n||'First Strike Rate', kpi2_target:p.k2t||'', kpi2_current:p.k2c||'', kpi2_name:p.k2n||'14-Day Retention', kpi3_target:p.k3t||'', kpi3_current:p.k3c||'', kpi3_name:p.k3n||'Sean Ellis PMF Score' });
      return respond({ ok: true });
    }
    if(e.parameter.action === 'cockpit') {
      return HtmlService.createHtmlOutputFromFile('cockpit')
        .setTitle('Campaign Cockpit — EC-2026-001')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    if(e.parameter.action === 'links_read') return respond({ok:true, links: getLinks(e.parameter.fromType||'', e.parameter.fromId||'', e.parameter.toType||'')});
    if(e.parameter.action === 'launchplan_read') return respond({ok:true, items: getLaunchPlan()});
    if(e.parameter.action === 'pmf_read') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PMF_SHEET_NAME);
      if(!sheet || sheet.getLastRow() < 2) return respond({ ok: true, items: [] });
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const items = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((h,i) => obj[h] = row[i]===null?'':String(row[i]));
        return obj;
      }).filter(r => r.timestamp !== '' && r.timestamp !== '__kill_criteria__');
      return respond({ ok: true, items });
    }
    if(e.parameter.action === 'slack_channels') return respond(getSlackChannels());
    if(e.parameter.action === 'slack_messages') return respond(getSlackMessages(e.parameter.channel, parseInt(e.parameter.limit)||25, e.parameter.oldest||null));
    if(e.parameter.action === 'slack_thread') return respond(getSlackThread(e.parameter.channel, e.parameter.thread));
    if(e.parameter.action === 'slack_check_token') {
      const tok = PropertiesService.getScriptProperties().getProperty('SLACK_USER_TOKEN_' + (e.parameter.user||''));
      if(!tok) return respond({ ok: true, connected: false });
      const res = UrlFetchApp.fetch('https://slack.com/api/auth.test', { headers: {'Authorization': 'Bearer ' + tok}, muteHttpExceptions: true });
      const data = JSON.parse(res.getContentText());
      return respond({ ok: true, connected: data.ok === true });
    }
    if(e.parameter.action === 'lp_search') return respond(getLandingPagesByIcp(e.parameter.icp||''));
    if(e.parameter.action === 'theme_library_read') {
      var _tlIcp   = e.parameter.icp_code || '';
      var _tlTheme = e.parameter.theme    || '';
      var _tlRows  = getThemeLibrary(_tlIcp);
      if(_tlTheme) {
        var _tlQ = _tlTheme.toLowerCase();
        _tlRows = _tlRows.filter(function(t){
          var _tn = t.theme_name.toLowerCase();
          var _ts = t.theme_slug.toLowerCase();
          return _tn.indexOf(_tlQ) > -1 || _tlQ.indexOf(_tn) > -1 ||
                 _ts.indexOf(_tlQ) > -1 || _tlQ.indexOf(_ts) > -1;
        });
      }
      return respond({ok:true, themes:_tlRows});
    }
    if(e.parameter.action === 'generate_image_prompt') return respond(generateImagePrompt({ image_brief: decodeURIComponent(e.parameter.image_brief||''), post_hook: decodeURIComponent(e.parameter.post_hook||''), post_body: decodeURIComponent(e.parameter.post_body||''), app_screen: decodeURIComponent(e.parameter.app_screen||'meal planning interface'), platform: e.parameter.platform||'Facebook', icp: e.parameter.icp||'super_mom', dimensions: e.parameter.dimensions||'1200x630px', use_case: e.parameter.use_case||'social', skip_optimize: e.parameter.skip_optimize||'', skip_claude: e.parameter.skip_claude||'', theme: decodeURIComponent(e.parameter.theme||''), stage: e.parameter.stage||'', post_number: e.parameter.post_number||'', theme_food: decodeURIComponent(e.parameter.theme_food||''), emotional_entry: decodeURIComponent(e.parameter.emotional_entry||''), emotional_payoff: decodeURIComponent(e.parameter.emotional_payoff||''), feature_hook: decodeURIComponent(e.parameter.feature_hook||''), feature_proof: decodeURIComponent(e.parameter.feature_proof||''), hook_angle: decodeURIComponent(e.parameter.hook_angle||''), problem_angle: decodeURIComponent(e.parameter.problem_angle||''), agitate_angle: decodeURIComponent(e.parameter.agitate_angle||''), urgency_trigger: decodeURIComponent(e.parameter.urgency_trigger||'') }));
    if(e.parameter.action === 'ir_read') return respond({ok:true, requests: getInfoRequests(e.parameter.taskId||'', e.parameter.id||'')});
    if(e.parameter.action === 'slack_send') return respond(sendSlackMessage(e.parameter.channel, e.parameter.text, e.parameter.user||''));
    if(e.parameter.action === 'agenda_read') return respond({ ok: true, items: getAgenda() });
    if(e.parameter.action === 'agenda_write') {
      const p = e.parameter;
      setAgendaItem({ id:p.id, title:p.title||'', detail:p.detail||'', decision:p.decision||'', checked:p.checked||'false', owner:p.owner||'', deadline:p.deadline||'', category:p.category||'', taskId:p.taskId||'', flag:p.flag||'' });
      return respond({ ok: true });
    }
    if(e.parameter.action === 'agenda_delete') { deleteAgendaItem(e.parameter.id); return respond({ ok: true }); }
    if(e.parameter.action === 'agenda_write_all') {
      try { writeAllAgenda(JSON.parse(e.parameter.items||'[]')); return respond({ ok: true }); }
      catch(err) { return respond({ ok: false, error: err.message }); }
    }
    if(e.parameter.action === 'folders_read') return respond({ok:true, folders: _getFolderDefs()});
    if(e.parameter.action === 'icp_profiles_read') return respond({ok:true, icpProfiles: getIcpProfiles()});
    if(e.parameter.action === 'approved_claims_read') return respond({ok:true, claims: getApprovedClaims()});
    if(e.parameter.action === 'get_settings') return respond({ok:true, settings:getCcSettings()});
    if(e.parameter.action === 'folder_list') {
      var _fid=e.parameter.folderId||'';
      if(!_fid) return respond({ok:false,error:'folderId required'});
      var _fl=DriveApp.getFolderById(_fid);
      var _items=[];
      var _subs=_fl.getFolders(); while(_subs.hasNext()){var _s=_subs.next();_items.push({type:'folder',id:_s.getId(),name:_s.getName()});}
      var _files=_fl.getFiles(); while(_files.hasNext()){var _f=_files.next();_items.push({type:'file',id:_f.getId(),name:_f.getName(),mimeType:_f.getMimeType()});}
      _items.sort(function(a,b){return a.name<b.name?-1:1;});
      return respond({ok:true,folderName:_fl.getName(),items:_items});
    }
    if(e.parameter.action === 'custom_folders_read') return respond({ok:true, folders: _getCustomFolders()});
    if(e.parameter.action === 'drive_all_folders_list') {
      try {
        var _driveResults = {};
        var _folderIds = {};
        // Scan each Team Docs category subfolder 3 levels deep (sub-folders become sub-categories)
        Object.keys(TEAM_DOCS_CATEGORY_IDS).forEach(function(cat){
          try { _scanFolderDeep(DriveApp.getFolderById(TEAM_DOCS_CATEGORY_IDS[cat]), cat, 3, _driveResults, _folderIds); } catch(fe){}
        });
        // Scan each Videos category subfolder 3 levels deep
        Object.keys(VIDEOS_CATEGORY_IDS).forEach(function(cat){
          try { _scanFolderDeep(DriveApp.getFolderById(VIDEOS_CATEGORY_IDS[cat]), cat, 3, _driveResults, _folderIds); } catch(fe){}
        });
        // Scan root folders at depth 0 only — catches files uploaded before category structure
        try { _scanFolderDeep(DriveApp.getFolderById(TEAM_DOCS_FOLDER_ID), 'Other', 0, _driveResults, _folderIds); } catch(fe){}
        try { _scanFolderDeep(DriveApp.getFolderById(VIDEOS_FOLDER_ID), 'Videos/Other', 0, _driveResults, _folderIds); } catch(fe){}
        // Scan custom folders 3 levels deep
        _getCustomFolders().forEach(function(cf){
          if(cf.driveId) try { _scanFolderDeep(DriveApp.getFolderById(cf.driveId), cf.name, 3, _driveResults, _folderIds); } catch(fe){}
        });
        // Backfill any missing intermediate path segments so sidebar can show nested folders
        Object.keys(_driveResults).slice().forEach(function(key){
          var parts = key.split('/');
          for(var i = 2; i < parts.length; i++){
            var prefix = parts.slice(0, i).join('/');
            if(!_driveResults[prefix]) _driveResults[prefix] = [];
          }
        });
        return respond({ok:true, results:_driveResults, folderIds:_folderIds});
      } catch(err){ return respond({ok:false, error:err.message}); }
    }
    if(e.parameter.action === 'slack_archive_search') return respond({ok:true, messages: searchSlackArchive(e.parameter.query||'')});
    if(e.parameter.action === 'callouts_read') return respond({ok:true, callouts: getCallouts(e.parameter.user||'')});
    if(e.parameter.action === 'docs_read') return respond({ok:true, docs: getDocuments(e.parameter.taskId||'', e.parameter.agendaId||'')});
    if(e.parameter.action === 'actions_read') return respond({ok:true, actions: getActions(e.parameter.taskId||'', e.parameter.workstreamId||'')});
    if(e.parameter.action === 'gaps_read') return respond({ok:true, gaps: getGaps(e.parameter.status||'')});
    if(e.parameter.action === 'status_log_read') return respond({ok:true, log: getStatusLog(e.parameter.taskId||'')});
    if(e.parameter.action === 'notifications_read') return respond({ ok:true, notifications: getNotifications() });
    if(e.parameter.action === 'profile_read') return respond({ ok: true, profiles: getProfiles() });
    if(e.parameter.action === 'profile_write') {
      try { setProfile(e.parameter.user, JSON.parse(e.parameter.data||'{}')); return respond({ ok: true }); }
      catch(err) { return respond({ ok: false, error: err.message }); }
    }
    if(e.parameter.action === 'messages_read') return respond({ok:true, messages: getMessages(e.parameter.taskId||'')});
    if(e.parameter.action === 'comments_read') return respond({ ok: true, comments: getComments(e.parameter.taskId||'') });
    if(e.parameter.action === 'comments_write') {
      const p = e.parameter;
      addComment(p.taskId||'', p.user||'', p.name||'', p.ts||'', p.text||'', p.type||'task');
      return respond({ ok: true });
    }
    if(e.parameter.action === 'beta_metrics_read') return respond({ ok: true, rows: getBetaMetrics() });
    if(e.parameter.action === 'beta_metrics_write') {
      try { setBetaMetrics(JSON.parse(e.parameter.data||'[]')); } catch(_) {}
      return respond({ ok: true });
    }
    if(e.parameter.action === 'analytics_read') return respond({ ok: true, ...getAppAnalytics() });
    if(e.parameter.action === 'analytics_write') {
      setAppAnalytics(e.parameter.dau||'', e.parameter.receipts||'', e.parameter.session||'');
      return respond({ ok: true });
    }
    if(e.parameter.action === 'roadmap_read') return respond({ ok:true, items: getMilestones() });
    if(e.parameter.action === 'channel_maps_read') return respond({ ok:true, maps: getChannelMaps() });
    if(e.parameter.action === 'channel_map_read') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SLACK_CHANNEL_SHEET);
      if(!sheet || sheet.getLastRow() < 2) return respond({ ok:true, map:{} });
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const map = {};
      data.slice(1).forEach(row => {
        const obj = {};
        headers.forEach((h,i) => obj[String(h).trim()] = row[i]==null?'':String(row[i]));
        const key = obj.taskId;
        if(key) map[key] = { taskId:key, channelId:obj.channelId||'', channelName:obj.channelName||'', changedBy:obj.changedBy||'' };
      });
      return respond({ ok:true, map });
    }
    if(e.parameter.action === 'anthropic_chat') {
      const prompt = e.parameter.prompt || '';
      const system = e.parameter.system || '';
      const model = e.parameter.model || 'claude-sonnet-4-20250514';
      const maxTokens = parseInt(e.parameter.maxTokens || '2048');
      const result = callAnthropicModel(prompt, system, model, maxTokens);
      return respond({ ok: true, result: result });
    }
    if(e.parameter.action === 'google_doc_read') {
      const docId = e.parameter.docId || '';
      if(!docId) return respond({ ok: false, error: 'No docId provided' });
      try {
        const doc = DocumentApp.openById(docId);
        const text = doc.getBody().getText();
        return respond({ ok: true, text: text.slice(0, 60000), title: doc.getName() });
      } catch(err) {
        return respond({ ok: false, error: 'Could not open doc: ' + err.message });
      }
    }
    if(e.parameter.action === 'action_plans_read') return respond({ ok:true, plans: getActionPlans(e.parameter.sourceId||'') });
    if(e.parameter.action === 'workstreams_read') return respond({ok:true, workstreams: getWorkstreams()});
    if(e.parameter.action === 'workstream_actions_read') return respond({ok:true, actions: getWorkstreamActions(e.parameter.workstreamId||'')});
    if(e.parameter.action === 'settings_read') return respond({ok:true, settings: getSettings()});
    if(e.parameter.action === 'hr_profiles_read') return respond({ ok:true, profiles: getHRProfiles() });
    if(e.parameter.action === 'hr_notes_read') return respond({ ok:true, notes: getHRNotes(e.parameter.userKey||'') });
    if(e.parameter.action === 'completions_read') {
      const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Completions');
      if(!sh || sh.getLastRow() < 2) return respond({ ok:true, completions:[] });
      const data = sh.getDataRange().getValues();
      const headers = data[0].map(h=>String(h).trim());
      return respond({ ok:true, completions: data.slice(1).map(row => {
        const obj = {}; headers.forEach((h,i) => obj[h] = row[i]==null?'':String(row[i])); return obj;
      }).filter(r=>r.id) });
    }
    if(e.parameter.action === 'kill_criteria_read') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PMF_SHEET_NAME);
      if(!sheet) return respond({ok:true, criteria:null});
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const row = data.slice(1).find(r => String(r[0]) === '__kill_criteria__');
      if(!row) return respond({ok:true, criteria:null});
      const obj = {};
      headers.forEach((h,i) => obj[String(h).trim()] = row[i]==null?'':String(row[i]));
      try { return respond({ok:true, criteria:JSON.parse(obj.notes||'null')}); }
      catch(e) { return respond({ok:true, criteria:null}); }
    }
    if(e.parameter.action === 'campaign_types_read')   return respond({ok:true, types:      getCampaignTypes()});
    if(e.parameter.action === 'campaign_brief_read')   return respond({ok:true, briefs:     getCampaignBriefs(e.parameter.id||'')});
    if(e.parameter.action === 'funnel_stages_read')    return respond({ok:true, stages:     getFunnelStages()});
    if(e.parameter.action === 'blueprint_configs_read') {
      var _bps = getBlueprintConfigs();
      Logger.log('blueprint_configs_read: ' + _bps.length + ' rows returned');
      return respond({ok:true, blueprints: _bps});
    }
    if(e.parameter.action === 'push_notifications_read') return respond({ok:true, notifications: getPushNotifications(e.parameter.campaign_id||'')});
    if(e.parameter.action === 'content_calendar_read')   return respond({ok:true, entries:       getContentCalendar(e.parameter.campaign_id||'')});
    if(e.parameter.action === 'campaign_metrics_read')   return respond({ok:true, metrics:        getCampaignMetrics(e.parameter.campaign_id||'')});
    if(e.parameter.action === 'scheduled_posts_read')    return respond({ok:true, posts:          getScheduledPosts(e.parameter.campaign_id||'')});
    if(e.parameter.action === 'lp_inventory_read') {
      var _status = e.parameter.status || null;
      var _inv    = getLPInventory(_status);
      Logger.log('lp_inventory_read: ' + _inv.length + ' rows returned (status=' + _status + ')');
      return respond({ok:true, inventory: _inv});
    }
    if(e.parameter.action === 'lp_inventory_slug_read') {
      var _lpiSlug = e.parameter.slug || '';
      var _lpiRow  = getLPInventoryBySlug(_lpiSlug);
      return respond({ok:true, lp: _lpiRow});
    }
    return respond({ ok: true, tasks: getTasks() });
  } catch(err) {
    return respond({ ok: false, error: err.message });
  }
}


function buildDGLContext() {
  try {
    var tasks = getTasks();
    var active = tasks.filter(function(t) { 
      return t.status !== 'Complete' && t.status !== 'Cancelled'; 
    });
    var overdue = active.filter(function(t) { 
      return t.ed && t.ed < new Date().toISOString().slice(0,10); 
    });
    
    return '\n\n---\n## LIVE DGL OPS CENTER CONTEXT\n' +
      'Date: ' + new Date().toISOString().slice(0,10) + '\n' +
      'Active Tasks: ' + active.length + '\n' +
      'Overdue Tasks: ' + overdue.length + '\n' +
      'Top 5 Active:\n' + active.slice(0,5).map(function(t) {
        return '- [' + t.id + '] ' + t.name + ' | ' + t.status + ' | Owner: ' + t.owner + ' | Due: ' + t.ed;
      }).join('\n') + '\n---\n';
  } catch(e) { return ''; }
}


// ═══ DOPOST ═══
function doPost(e) {
  try {
    if(!e.postData||!e.postData.contents) throw new Error('No POST body.');
    let body = {};
    const raw = e.postData.contents;
    try { body = JSON.parse(raw); } catch(_) {
      raw.split('&').forEach(pair => {
        const eq = pair.indexOf('=');
        if(eq > -1) { const k = decodeURIComponent(pair.substring(0,eq)); const v = decodeURIComponent(pair.substring(eq+1).replace(/\+/g,' ')); body[k] = v; }
      });
    }

    // ── VERA ACTIONS ──
    var veraResult = handleVeraAction(body);
    if(veraResult) return veraResult;

    // ── Ping — confirms GAS is alive and CORS headers are present ─────────
    if(body.action === 'ping') return respond({ ok:true, pong:true, version:'@351', ts:new Date().toISOString() });

    if(body.action === 'agenda_write') { setAgendaItem({ id:body.id||'', title:body.title||'', detail:body.detail||'', decision:body.decision||'', checked:body.checked||'false', owner:body.owner||'', deadline:body.deadline||'', category:body.category||'Manual', taskId:body.taskId||'', flag:body.flag||'', actionPlan:body.actionPlan||'', taskPlan:body.taskPlan||'', taskPlans:typeof body.taskPlans==='string'?JSON.parse(body.taskPlans||'[]'):body.taskPlans||[] }); return respond({ ok: true }); }
    if(body.action === 'anthropic') return callAnthropic(body);
    if(body.action === 'channel_maps_write') { setChannelMapEntry(body.mapType, body.key, body.channelId, body.channelName, body.changedBy||''); return respond({ ok:true }); }
    if(body.action === 'slack_get_upload_url') { var slackToken = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN'); var slackResp = UrlFetchApp.fetch('https://slack.com/api/files.getUploadURLExternal?filename='+encodeURIComponent(body.filename)+'&length='+body.length, {headers:{'Authorization':'Bearer '+slackToken},muteHttpExceptions:true}); return ContentService.createTextOutput(slackResp.getContentText()).setMimeType(ContentService.MimeType.JSON); }
    if(body.action === 'slack_complete_upload') { var slackToken = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN'); var slackResp = UrlFetchApp.fetch('https://slack.com/api/files.completeUploadExternal', {method:'post',contentType:'application/json; charset=utf-8',headers:{'Authorization':'Bearer '+slackToken},payload:JSON.stringify({files:[{id:body.fileId,title:body.title||body.filename}],channel_id:body.channel}),muteHttpExceptions:true}); return ContentService.createTextOutput(slackResp.getContentText()).setMimeType(ContentService.MimeType.JSON); }
    if(body.action === 'ir_write') { addInfoRequest(body); return respond({ok:true}); }
    if(body.action === 'ir_update') { updateInfoRequest(body.id, body); return respond({ok:true}); }
    if(body.action === 'folders_write') { _saveFolderDefs(body.folders); return respond({ok:true}); }
    if(body.action === 'folder_create') {
      try {
        var cfName=(body.name||'').trim();
        var cfParentId=(body.parentId||'').trim()||TEAM_DOCS_FOLDER_ID;
        if(!cfName) return respond({ok:false, error:'Folder name required'});
        var cfParent=DriveApp.getFolderById(cfParentId);
        var cfIt=cfParent.getFoldersByName(cfName);
        var cfFolder=cfIt.hasNext()?cfIt.next():cfParent.createFolder(cfName);
        try{cfFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(se){}
        var cfDef={name:cfName,section:body.section||'',driveId:cfFolder.getId(),url:cfFolder.getUrl()};
        _saveCustomFolder(cfDef);
        return respond({ok:true, folder:cfDef});
      } catch(e) { return respond({ok:false, error:e.message}); }
    }
    if(body.action === 'folder_rename') {
      try {
        Drive.Files.update({name: body.newName}, body.folderId, null, {supportsAllDrives:true});
        _patchCustomFolderName(body.folderId, body.newName);
        return respond({ok:true});
      } catch(e) { return respond({ok:false, error:e.message}); }
    }
    if(body.action === 'folder_delete') {
      try {
        try { DriveApp.getFolderById(body.folderId).setTrashed(true); }
        catch(e1) { Drive.Files.update({trashed:true}, body.folderId, null, {supportsAllDrives:true}); }
        _removeCustomFolderById(body.folderId);
        return respond({ok:true});
      } catch(e) { return respond({ok:false, error:e.message}); }
    }
    if(body.action === 'subfolder_create') {
      try {
        var sfName=(body.name||'').trim();
        var sfParent=DriveApp.getFolderById(body.parentId);
        var sfIt=sfParent.getFoldersByName(sfName);
        var sfFolder=sfIt.hasNext()?sfIt.next():sfParent.createFolder(sfName);
        try{sfFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);}catch(se){}
        return respond({ok:true, folderId:sfFolder.getId()});
      } catch(e) { return respond({ok:false, error:e.message}); }
    }
    if(body.action === 'budget_write') { setBudget(body.budget); return respond({ ok: true }); }
    if(body.action === 'pmf_write') { setPMFHistory(body); return respond({ ok: true }); }
    if(body.action === 'slack_send') return respond(sendSlackMessage(body.channelId, body.text, body.dglUser));
    if(body.action === 'channel_map_write') { setChannelMap(body.taskId, body.channelId, body.channelName, body.changedBy, body.oldChannel||'', body.sessionHash||''); return respond({ ok: true }); }

    // ═══ VERA AI ═══
    if(body.action === 'vera_chat') {
      var veraToken = PropertiesService.getScriptProperties().getProperty('VERA_API_KEY');
      var veraResp = UrlFetchApp.fetch('https://vera-api-13474513994.us-central1.run.app/api/rag/chat', {
        method: 'post', contentType: 'application/json',
        headers: {'Authorization': 'Bearer ' + veraToken},
        payload: JSON.stringify({message: body.prompt || '', include_sources: false}),
        muteHttpExceptions: true
      });
      var veraData = JSON.parse(veraResp.getContentText());
      return respond({ok: true, response: veraData.response || ''});
    }

    // ═══ PERSONAL AI AGENTS ═══
    if(body.action === 'meridian_chat') return callClaudeWithConstitution(body.prompt||'', 'meridian', 'You are Meridian, L9 COO AI for DGL easyChef Pro.');
    if(body.action === 'nexus_chat') return callClaudeWithConstitution(body.prompt||'', 'nexus', 'You are Nexus, L9 CTO AI for DGL easyChef Pro.');
    if(body.action === 'forge_chat') return callClaudeWithConstitution(body.prompt||'', 'forge', 'You are Forge, L9 CMO AI for DGL easyChef Pro.');
    if(body.action === 'atlas_chat') return callClaudeWithConstitution(body.prompt||'', 'atlas', 'You are Atlas, L7 team AI for DGL easyChef Pro.');

    // ═══ UNIVERSAL AGENT CHAT ═══
    if(body.action === 'agent_chat') {
      var agentKey = (body.agentId || body.agent || 'atlas').toLowerCase();
      return callClaudeWithConstitution(body.prompt||'', agentKey, 'You are a DGL AI agent for easyChef Pro.');
    }

    // ═══ AGENT CONSTITUTION READ/WRITE ═══
    if(body.action === 'agent_constitution_read') {
      var agentKey = (body.agentId || body.agent || '').toLowerCase();
      var constitution = getAgentConstitution(agentKey);
      return respond({ok: true, constitution: constitution || '', instructions: constitution || ''});
    }

    if(body.action === 'message_write') { addMessage(body); return respond({ok:true}); }
    if(body.action === 'message_delete') { deleteMessage(body.id); return respond({ok:true}); }
    if(body.action === 'completion_delete') { deleteCompletion(body.id); return respond({ok:true}); }
    if(body.action === 'drive_create_upload_session') return respond(driveCreateUploadSession(body));
    if(body.action === 'drive_upload_chunk') return respond(driveUploadChunk(body));
    if(body.action === 'callout_write') { addCallout(body); return respond({ok:true}); }
    if(body.action === 'callout_dismiss') { dismissCallout(body.id, body.dismissedBy, body.dismissedAt); return respond({ok:true}); }
    if(body.action === 'callout_delete') { deleteCallout(body.id); return respond({ok:true}); }
    if(body.action === 'action_write') { addAction(body); return respond({ok:true}); }
    if(body.action === 'action_update') { updateAction(body.id, body); return respond({ok:true}); }
    if(body.action === 'action_delete') { deleteAction(body.id); return respond({ok:true}); }
    if(body.action === 'link_write') { addLink(body); return respond({ok:true}); }
    if(body.action === 'link_delete') { deleteLink(body.id); return respond({ok:true}); }
    if(body.action === 'launchplan_write') { setLaunchPlanItem(body.item||body); return respond({ok:true}); }
    if(body.action === 'launchplan_delete') { deleteLaunchPlanItem(body.id); return respond({ok:true}); }
    if(body.action === 'settings_write') { setSetting(body.type, body.key, body.value, body.meta||''); return respond({ok:true}); }
    if(body.action === 'action_plans_write') { setActionPlan(body); return respond({ ok:true }); }
    if(body.action === 'completion_write') { addCompletion(body); return respond({ ok:true }); }
    if(body.action === 'action_plans_complete') { completeActionPlan(body.id); return respond({ ok:true }); }
    if(body.action === 'hr_profiles_write') { setHRProfile(body); return respond({ ok:true }); }
    if(body.action === 'hr_notes_write') { addHRNote(body); return respond({ ok:true }); }
    if(body.action === 'profile_write') { try { setProfile(body.user, JSON.parse(body.data||'{}')); return respond({ ok:true }); } catch(err) { return respond({ ok:false, error:err.message }); } }
    if(body.action === 'gap_write') { addGap(body); return respond({ok:true}); }
    if(body.action === 'workstream_write') { setWorkstream(body.item||body); return respond({ok:true}); }
    if(body.action === 'workstream_delete') { deleteWorkstream(body.id); return respond({ok:true}); }
    if(body.action === 'workstream_action_write') { addWorkstreamAction(body.item||body); return respond({ok:true}); }
    if(body.action === 'workstream_action_delete') { deleteWorkstreamAction(body.id); return respond({ok:true}); }
    if(body.action === 'notification_write') { addNotification(body); return respond({ok:true}); }
    if(body.action === 'status_log_write') { addStatusLog(body); return respond({ok:true}); }
    if(body.action === 'roadmap_write') { setMilestonesItem(body); return respond({ ok:true }); }
    if(body.action === 'roadmap_delete') { deleteMilestones(body.id); return respond({ ok:true }); }
    if(body.action === 'comments_write') { addComment(body.taskId||'', body.user||'', body.name||'', body.ts||'', body.text||'', body.type||'task'); return respond({ ok:true }); }
    if(body.action === 'kill_criteria_write') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PMF_SHEET_NAME);
      if(!sheet) return respond({ok:false, error:'PMF sheet not found'});
      const kcData = sheet.getDataRange().getValues();
      const idx = kcData.slice(1).findIndex(r => String(r[0]) === '__kill_criteria__');
      const row = ['__kill_criteria__', JSON.stringify(body.criteria), '', '', '', '', '', '', '', '', '', ''];
      if(idx >= 0) { sheet.getRange(idx+2, 1, 1, row.length).setValues([row]); }
      else { sheet.appendRow(row); }
      return respond({ok:true});
    }
    if(body.action === 'file_upload') {
      try {
        const fname = body.docName||body.filename||'untitled';
        const fileInfo = uploadFileToDrive(fname, body.mimeType||'application/octet-stream', body.base64data, body.sourceType||'task', body.taskId||body.agendaId||'', body.sourceName||'', body.category||'', body.customFolderDriveId||'');
        addDocument({ id:'doc-'+Date.now(), taskId:body.taskId||'', agendaId:body.agendaId||'', name:fname, url:fileInfo.url, previewUrl:fileInfo.previewUrl, driveFileId:fileInfo.id, mimeType:body.mimeType||'', reviewNeeded:body.reviewNeeded||'false', addedBy:body.addedBy||'', addedAt:new Date().toISOString(), folderUrl:fileInfo.folderUrl||'', category:body.category||'' });
        return respond({ ok:true, ...fileInfo, name:fname });
      } catch(err) { return respond({ ok:false, error:err.message }); }
    }
    if(body.action === 'docs_write') { addDocument(body); return respond({ ok:true }); }
    if(body.action === 'docs_delete') { deleteDocument(body.id); return respond({ ok:true }); }
    if(body.action === 'migrate_doc_folders') { return respond(migrateDocFolders()); }
    if(body.action === 'sync_team_docs_from_drive') { return respond(syncTeamDocsFromDrive()); }
    if(body.action === 'ops_context_read') return respond(opsContextRead(body.docIds));
    if(body.action === 'ops_chat') return respond(opsChat(body.prompt, body.history, body.context));
    if(body.action === 'anthropic_chat') return respond({ok:true, result:callAnthropicModel(body.prompt||'', body.system||'', body.model||'claude-haiku-4-5-20251001', parseInt(body.maxTokens||'900'))});

    // ── Channels ──────────────────────────────────────────────────────────────────
    if(body.action === 'channels_read')          return respond({ ok:true, channels: getChannels() });
    if(body.action === 'channel_write')          { setChannel(body.channel); return respond({ ok:true }); }

    // ── Slug and Campaign ID ──────────────────────────────────────────────────────
    if(body.action === 'check_slug_available')   return respond(checkSlugAvailable(body.slug));
    if(body.action === 'get_next_campaign_id')   return respond({ ok:true, id: getNextCampaignId() });

    // ── Campaign generation ───────────────────────────────────────────────────────
    if(body.action === 'campaign_gen')           return respond(campaignGen(body.brief));
    if(body.action === 'campaign_kickstart') return respond(campaignKickstart(body.prompt));

    // ── ICP Profiles ──────────────────────────────────────────────────────────────
    if(body.action === 'icp_profiles_read')      return respond({ ok:true, icpProfiles: getIcpProfiles() });

    // ── Approved Claims ───────────────────────────────────────────────────────────
    if(body.action === 'approved_claims_read')   return respond({ ok:true, claims: getApprovedClaims() });

    // ── Campaign Center Settings ──────────────────────────────────────────────────
    if(body.action === 'get_settings')   return respond({ ok:true, settings: getCcSettings() });
    if(body.action === 'save_settings')  return respond({ ok:true, saved: saveSettings(body.section, Array.isArray(body.rows)?body.rows:JSON.parse(body.rows||'[]')) });
    if(body.action === 'append_setting') return respond({ ok:true, appended: appendSettingRow(body.section, body.key, body.label||'', body.extra||'') });
    if(body.action === 'delete_setting') return respond({ ok:true, deleted: deleteSettingRow(body.section, body.key) });

    // ── Campaign Briefs ───────────────────────────────────────────────────────────
    if(body.action === 'campaign_brief_read')    return respond({ ok:true, briefs: getCampaignBriefs(body.id||'') });
    if(body.action === 'campaign_brief_write')   { setCampaignBrief(body.brief); return respond({ ok:true }); }
    if(body.action === 'campaign_save_draft') return respond(saveCampaignDraft(body));
    if(body.action === 'export_to_drive')    return respond(exportCampaignToDrive(body.brief||{}, body.copy||{}, body.posts||[], body.lp||null, body.emails||[]));
    if(body.action === 'run_drive_export') {
      var _rdeCid = (body.campaign_id || '').trim();
      if (!_rdeCid) return respond({ ok:false, error:'campaign_id required' });
      var _rdeBrief = getCampaignBriefs(_rdeCid);
      if (!_rdeBrief || !_rdeBrief.id) {
        var _allBriefIds = (getCampaignBriefs('') || []).map(function(b){ return b.id; });
        return respond({ ok:false, error:'No brief found for: ' + _rdeCid, available_ids: _allBriefIds });
      }
      var _rdeCopy   = (getGeneratedCopy(_rdeCid) || [])[0] || {};
      var _rdePosts  = getSocialPosts(_rdeCid)    || [];
      var _rdeEmails = getEmailSequences(_rdeCid) || [];
      Logger.log('[run_drive_export] campaign=' + _rdeCid + ' posts=' + _rdePosts.length + ' emails=' + _rdeEmails.length);
      return respond(exportCampaignToDrive(_rdeBrief, _rdeCopy, _rdePosts, null, _rdeEmails, { skipAi: true }));
    }
    if(body.action === 'backup_campaign_data') {
      var _bcCid = (body.campaign_id || '').trim();
      if (!_bcCid) return respond({ ok:false, error:'campaign_id required' });
      return respond(backupCampaignData(_bcCid));
    }
    if(body.action === 'ensure_brief_columns') {
      PropertiesService.getScriptProperties().deleteProperty('brief_cols_ensured'); // force re-check
      return respond(ensureCampaignBriefColumns());
    }
    if(body.action === 'test_email_cal_row')      { testEmailCalendarRow();   return respond({ ok:true, log: Logger.getLog() }); }
    if(body.action === 'test_social_hashtag_row') { testSocialHashtagRow();   return respond({ ok:true, log: Logger.getLog() }); }
    if(body.action === 'test_new_columns')        { testNewColumns();         return respond({ ok:true, log: Logger.getLog() }); }
    if(body.action === 'sync_convert_data') {
      var _cvtResult = syncConvertToSheet(body.campaignId || '');
      return respond({ ok:true, result: _cvtResult, log: Logger.getLog() });
    }
    if(body.action === 'update_convert_id') {
      updateConvertExperimentId();
      return respond({ ok:true, message: 'Convert ID updated to 100140422' });
    }
    if(body.action === 'build_convert_payload') {
      var _cvpResult = buildConvertExperimentPayload(body.campaign_id || 'EC-2026-001');
      return respond({ ok:_cvpResult.ok, result:_cvpResult, log: Logger.getLog() });
    }
    if(body.action === 'seed_governance_tabs') {
      var _govResult = seedGovernanceTabs();
      return respond({ ok:true, result: _govResult, log: Logger.getLog() });
    }
    if(body.action === 'seed_approved_claims') {
      var _claimsResult = seedApprovedClaims();
      return respond({ ok:true, result: _claimsResult, log: Logger.getLog() });
    }
    if(body.action === 'generate_brief_docs') {
      var _bdResult = generateBriefDocs(body.campaign_id || '');
      return respond({ ok:true, result: _bdResult, log: Logger.getLog() });
    }
    if(body.action === 'generate_content_cal_brief_docs') {
      var _ccbResult = generateContentCalBriefDocs(body.campaign_id || '');
      return respond({ ok:true, result: _ccbResult, log: Logger.getLog() });
    }
    if(body.action === 'generate_claude_design_brief') {
      var _cdbResult = generateClaudeDesignBrief(body.asset_id || '');
      return respond({ ok: _cdbResult.ok, result: _cdbResult, log: Logger.getLog() });
    }
    if(body.action === 'update_content_cal_field') {
      var _ucfResult = updateContentCalField(body.asset_id||'', body.field||'', body.value||'');
      return respond({ ok:_ucfResult.ok, result:_ucfResult, log: Logger.getLog() });
    }
    if(body.action === 'append_content_cal_note') {
      var _noteResult = appendContentCalNote(body.asset_id||'', body.text||'', body.author||'');
      return respond({ ok:_noteResult.ok, result:_noteResult, log: Logger.getLog() });
    }
    if(body.action === 'klaviyo_track_note') {
      var _klnResult = klaviyoTrackNote(body.asset_id||'', body.platform||'', body.note||'', body.author||'', body.brief_doc_url||'', body.sheet_url||'');
      return respond({ ok:_klnResult.ok, result:_klnResult, log: Logger.getLog() });
    }
    if(body.action === 'klaviyo_track_status') {
      var _klsResult = klaviyoTrackStatusUpdate(body.asset_id||'', body.platform||'', body.field||'', body.value||'', body.brief_doc_url||'', body.sheet_url||'');
      return respond({ ok:_klsResult.ok, result:_klsResult, log: Logger.getLog() });
    }
    if(body.action === 'figma_post_comment') {
      var _figResult = figmaPostComment(body.figma_url||'', body.comment||'');
      return respond({ ok:_figResult.ok, result:_figResult, log: Logger.getLog() });
    }
    if(body.action === 'figma_record_expiry') {
      var _freResult = figmaRecordTokenExpiry(body.days_valid||90);
      return respond({ ok:_freResult.ok, result:_freResult, log: Logger.getLog() });
    }
    if(body.action === 'check_figma_token') {
      return respond(figmaTokenStatus());
    }
    if(body.action === 'get_figma_export_json') {
      return respond(getFigmaExportJson(body.campaign_id || 'EC-2026-001'));
    }
    if(body.action === 'update_asset_status') {
      return respond(updateAssetStatus(body));
    }
    if(body.action === 'debug_figma_export_tab') {
      try {
        var _ss = _getCampaignSpreadsheet();
        var _sheets = _ss.getSheets().map(function(s){ return s.getName(); });
        var _fe = _ss.getSheetByName('FigmaExport');
        var _feInfo = _fe ? { rows: _fe.getLastRow(), cols: _fe.getLastColumn(), headers: _fe.getLastRow()>0?_fe.getRange(1,1,1,Math.min(_fe.getLastColumn(),30)).getValues()[0]:[] } : null;
        return respond({ ok:true, all_sheets:_sheets, figma_export_tab: _feInfo });
      } catch(e) { return respond({ ok:false, error:e.message }); }
    }
    if(body.action === 'figma_test') {
      var _ftResult = (function(){
        try {
          var props = PropertiesService.getScriptProperties().getProperties();
          var keys = Object.keys(props);
          var token = props['FIGMA_ACCESS_TOKEN'] || null;
          if(!token) return { ok:false, error:'FIGMA_ACCESS_TOKEN not set', all_keys:keys };
          var preview = token.slice(0,6)+'…('+token.length+' chars)';
          var resp = UrlFetchApp.fetch('https://api.figma.com/v1/me', {
            method:'GET', headers:{'X-Figma-Token':token.trim()}, muteHttpExceptions:true
          });
          var code = resp.getResponseCode();
          var data = JSON.parse(resp.getContentText());
          if(code===200) return { ok:true, handle:data.handle, email:data.email, token_preview:preview };
          return { ok:false, error:'HTTP '+code, body:resp.getContentText().slice(0,300), token_preview:preview };
        } catch(e){ return { ok:false, error:e.message }; }
      })();
      return respond({ ok:_ftResult.ok, result:_ftResult, log: Logger.getLog() });
    }
    if(body.action === 'add_lp_variant_purpose_settings') {
      addLpVariantPurposeSettings();
      return respond({ ok:true, log: Logger.getLog() });
    }
    if(body.action === 'seed_ec_2026_001') {
      var _seedResult = seedEC2026001();
      return respond({ ok:_seedResult.ok, result:_seedResult, log: Logger.getLog() });
    }
    if(body.action === 'backfill_lp_section_sources') {
      // Fills blank lp_section_source on SocialPosts (from design_brief or ID pattern)
      // and EmailSequences (from funnel_stage column).
      var _ss = _getCampaignSpreadsheet();
      var _stageMap = {hook:'hook',problem:'problem',agitate:'agitate',solve:'solve',value:'value',proof:'proof',cta:'cta',launch:'urgency',urgency:'urgency'};
      var _postNumMap = {'001':'hook','002':'problem','003':'agitate','004':'solve','005':'value','006':'proof','007':'cta'};
      var _fixed = 0;

      // ── SocialPosts ──────────────────────────────────────────────────────────
      var _spS   = _ss.getSheetByName(_CC_TAB.SOCIAL);
      var _spH   = _CC_HDR.SocialPosts;
      var _spLast = _spS.getLastRow();
      if (_spLast >= 2) {
        var _spVals    = _spS.getRange(2, 1, _spLast - 1, _spH.length).getValues();
        var _lpSrcIdx  = _spH.indexOf('lp_section_source');
        var _loopIdx   = _spH.indexOf('loop_stage');
        var _briefIdx  = _spH.indexOf('design_brief');
        var _stateIdx  = _spH.indexOf('emotional_state');
        var _destIdx   = _spH.indexOf('emotional_destination');
        for (var _ri = 0; _ri < _spVals.length; _ri++) {
          if (_spVals[_ri][_lpSrcIdx]) continue;
          var _bj = {};
          try { _bj = JSON.parse(_spVals[_ri][_briefIdx] || '{}'); } catch(e) {}
          var _fs = String(_bj.funnel_stage || '').toLowerCase();
          // Fallback: infer from ID pattern (EC-2026-001-{platform}-POST-NNN or tiktok/youtube)
          if (!_fs) {
            var _idStr = String(_spVals[_ri][0] || '').toLowerCase();
            var _pnMatch = _idStr.match(/-post-(\d+)$/);
            if (_idStr.indexOf('tiktok') > -1) { _fs = 'solve'; }
            else if (_idStr.indexOf('youtube') > -1) { _fs = 'proof'; }
            else if (_pnMatch) { _fs = _postNumMap[_pnMatch[1]] || 'hook'; }
          }
          if (!_fs) continue;
          var _lpSrc = _stageMap[_fs] || _fs;
          _spS.getRange(_ri + 2, _lpSrcIdx + 1).setValue(_lpSrc);
          if (_loopIdx > -1) _spS.getRange(_ri + 2, _loopIdx + 1).setValue(_fs);
          if (_stateIdx > -1 && !_spVals[_ri][_stateIdx]) _spS.getRange(_ri + 2, _stateIdx + 1).setValue(_fs + ' — recognition');
          _fixed++;
        }
      }

      // ── EmailSequences ───────────────────────────────────────────────────────
      var _emS   = _ss.getSheetByName(_CC_TAB.EMAIL);
      var _emH   = _CC_HDR.EmailSequences;
      var _emLast = _emS ? _emS.getLastRow() : 0;
      if (_emLast >= 2) {
        var _emVals   = _emS.getRange(2, 1, _emLast - 1, _emH.length).getValues();
        var _emLpIdx  = _emH.indexOf('lp_section_source');
        var _emFsIdx  = _emH.indexOf('funnel_stage');
        var _emLoopIdx = _emH.indexOf('loop_stage');
        var _emSeqIdx  = _emH.indexOf('sequence_code');
        var _seqLpMap  = {'SEQ-1':'hook','SEQ-2':'problem','SEQ-3':'agitate','SEQ-4':'cta','SEQ-5':'urgency'};
        for (var _ei = 0; _ei < _emVals.length; _ei++) {
          if (_emVals[_ei][_emLpIdx]) continue;
          var _efs = String(_emVals[_ei][_emFsIdx] || '').toLowerCase().trim();
          if (!_efs) {
            var _seqCode = String(_emVals[_ei][_emSeqIdx] || '').toUpperCase();
            var _seqKey = _seqCode.match(/SEQ-\d/i) ? _seqCode.match(/SEQ-\d/i)[0].toUpperCase() : '';
            _efs = _seqLpMap[_seqKey] || 'hook';
          }
          var _eLpSrc = _stageMap[_efs] || _efs;
          _emS.getRange(_ei + 2, _emLpIdx + 1).setValue(_eLpSrc);
          if (_emLoopIdx > -1) _emS.getRange(_ei + 2, _emLoopIdx + 1).setValue(_efs);
          _fixed++;
        }
      }
      return respond({ ok: true, fixed: _fixed, log: Logger.getLog() });
    }
    if(body.action === 'update_ec2026001_post_details') {
      var _updResult = updateEC2026001PostDetails();
      return respond({ ok:_updResult.ok, result:_updResult, log: Logger.getLog() });
    }
    if(body.action === 'seed_ec2026001_emails') {
      var _emResult = seedEC2026001Emails();
      return respond({ ok:_emResult.ok, result:_emResult, log: Logger.getLog() });
    }
    if(body.action === 'fill_ec2026001_social_body') {
      var _sbResult = fillEC2026001SocialBody();
      return respond({ ok:_sbResult.ok, result:_sbResult, log: Logger.getLog() });
    }
    if(body.action === 'generate_lp_figma_doc') {
      var _fdResult = generateLPFigmaDoc();
      return respond({ ok:_fdResult.ok, result:_fdResult, log: Logger.getLog() });
    }
    if(body.action === 'seed_ec2026001_complete') {
      var _complResult = seedEC2026001Complete();
      return respond({ ok:_complResult.ok, result:_complResult, log: Logger.getLog() });
    }
    if(body.action === 'fix_ec2026001_emails') {
      var _fixResult = fixEC2026001Emails();
      return respond({ ok:_fixResult.ok, result:_fixResult, log: Logger.getLog() });
    }
    if(body.action === 'fix_ec2026001_dates') {
      var _datesResult = fixEC2026001Dates();
      return respond({ ok:_datesResult.ok, result:_datesResult, log: Logger.getLog() });
    }
    if(body.action === 'generate_ec2026001_brief_doc') {
      var _briefResult = generateEC2026001BriefDoc();
      return respond({ ok:_briefResult.ok, result:_briefResult, log: Logger.getLog() });
    }
    if(body.action === 'upgrade_ec2026001_design_briefs') {
      var _upgradeResult = upgradeEC2026001DesignBriefs();
      return respond({ ok:_upgradeResult.ok, result:_upgradeResult, log: Logger.getLog() });
    }
    if(body.action === 'generate_ec2026001_gpt_briefs') {
      var _gptResult = generateEC2026001GPTBriefs(body.start_offset, body.batch_size);
      return respond({ ok:_gptResult.ok, result:_gptResult, log: Logger.getLog() });
    }
    if(body.action === 'qa_ec2026001_design_briefs') {
      var _qaResult = qaEC2026001DesignBriefs();
      return respond({ ok:_qaResult.ok, result:_qaResult, log: Logger.getLog() });
    }
    if(body.action === 'fix_ec2026001_data_issues') {
      var _dataFixResult = fixEC2026001DataIssues();
      return respond({ ok:_dataFixResult.ok, result:_dataFixResult, log: Logger.getLog() });
    }
    if(body.action === 'fix_ec2026001_banned_phrases') {
      var _banResult = fixEC2026001BannedPhrases(body.start_offset, body.batch_size);
      return respond({ ok:_banResult.ok, result:_banResult, log: Logger.getLog() });
    }
    if(body.action === 'assign_ec2026001_dl_ids') {
      var _dlResult = assignEC2026001DLIDs();
      return respond({ ok:_dlResult.ok, result:_dlResult, log: Logger.getLog() });
    }
    if(body.action === 'export_ec2026001_figma_json') {
      var _fxResult = exportEC2026001FigmaJSON();
      return respond({ ok:_fxResult.ok, result:_fxResult, log: Logger.getLog() });
    }
    if(body.action === 'seed_ec2026001_asset_lifecycle') {
      var _alResult = seedEC2026001AssetLifecycle();
      return respond({ ok:_alResult.ok, result:_alResult, log: Logger.getLog() });
    }
    if(body.action === 'update_asset_status') {
      var _upResult = updateAssetStatus(body.asset_id, body.fields || {});
      return respond({ ok:_upResult.ok, result:_upResult, log: Logger.getLog() });
    }
    if(body.action === 'asset_lifecycle_report') {
      var _rpResult = getAssetLifecycleReport();
      return respond({ ok:_rpResult.ok, result:_rpResult, log: Logger.getLog() });
    }
    if(body.action === 'seed_ec2026001_content_calendar') {
      var _ccSeed = seedEC2026001ContentCalendar(body.campaignId || body.campaign_id || 'EC-2026-001');
      return respond({ ok:_ccSeed.ok, result:_ccSeed, log: Logger.getLog() });
    }
    if(body.action === 'seed_content_calendar') {
      var _ccSeed2 = seedEC2026001ContentCalendar(body.campaignId || body.campaign_id || 'EC-2026-001');
      return respond({ ok:_ccSeed2.ok, result:_ccSeed2, log: Logger.getLog() });
    }
    if(body.action === 'repair_campaign_center') {
      var _rpCid = body.campaignId || body.campaign_id || 'EC-2026-001';
      var _rpLog = [];
      // 1. Seed ContentCalendar
      var _rpCC = seedEC2026001ContentCalendar(_rpCid);
      _rpLog.push('ContentCalendar: ' + (_rpCC.ok ? 'seeded ' + _rpCC.seeded + ' rows' : 'ERROR — ' + _rpCC.error));
      // 2. Re-seed invisible-leak theme
      try {
        var _rpSS = _getCampaignSpreadsheet();
        var _rpTL = _rpSS.getSheetByName('ThemeLibrary');
        var _rpTLLast = _rpTL ? _rpTL.getLastRow() : 0;
        setThemeLibraryRow({
          id:'invisible-leak', icp_code:'super_mom', theme_name:'The Invisible Leak', theme_slug:'invisible-leak',
          category:'pre-launch', emotional_entry:'recognition — she knows the leak exists, she just has not named it',
          emotional_payoff:'relief — the leak is closed in dollars and evenings',
          hook_angle:'You have an invisible leak. It costs $111 a month. Five apps were never going to fix it.',
          problem_angle:'Five apps. None of them talk to each other. The leak runs in the gap between them.',
          agitate_angle:'The spinach. The ground beef. The yogurt. $111 gone. Every month. No system.',
          food_type:'whatever is already in your fridge — expiring produce · ground beef · yogurt · the groceries that never became dinner',
          publish_day:'daily', post_count:35, blueprint_code:'A-Waitlist', campaign_angle:'savings',
          urgency_trigger:'First 5,000 families lock in $7.99/month forever',
          image_mood_hook:'Warm kitchen 6:30 PM · groceries on counter · five apps open on phone · clock visible · recognition not defeat',
          image_mood_cta:'Woman on couch after dinner · kitchen clean behind her · kids settled · peace · phone in hand',
          active:true, notes:'EC-2026-001 · May 27–Jul 1 2026 · replaces taco-tuesday',
          app_feature:'TRACK → PLAN → OPTIMIZE → COOK → SHOP',
          app_screen_label:'Wk2: Pantry · Wk3: Meal plan + Nutrition score · Wk4: Recipe + 1-click shopping',
          feature_hook:'Five apps never closed the loop. One does. TRACK → PLAN → OPTIMIZE → COOK → SHOP.',
          feature_proof:'$1,336/year average savings · 69.5% less food waste · 30 minutes fridge to table · validated across 10,000 household profiles',
          persona_rotation:'super_mom_money · super_mom_time'
        });
        _rpLog.push('ThemeLibrary: invisible-leak upserted (was ' + (_rpTLLast - 1) + ' rows)');
      } catch(_rpTE) { _rpLog.push('ThemeLibrary: ERROR — ' + _rpTE.message); }
      // 3. Regenerate FigmaExport from SocialPosts
      var _rpFX = exportEC2026001FigmaJSON();
      _rpLog.push('FigmaExport: ' + (_rpFX.ok ? 'regenerated ' + (_rpFX.total||0) + ' posts' : 'ERROR — ' + (_rpFX.error||'unknown')));
      return respond({ ok:_rpCC.ok, log_steps:_rpLog, content_calendar:_rpCC, figma_export:_rpFX, gas_log:Logger.getLog() });
    }
    if(body.action === 'seed_all_campaigns_content_calendar') {
      var _sacResult = seedAllCampaignsContentCalendar();
      return respond({ ok:_sacResult.ok, total_seeded:_sacResult.total_seeded, by_campaign:_sacResult.by_campaign, error:_sacResult.error||null, log:Logger.getLog() });
    }
    if(body.action === 'repair_ec2026002_social_posts') {
      // If EC-2026-002 rows are missing, seed them first
      var _ec2Check = getSocialPosts('EC-2026-002') || [];
      if (!_ec2Check.length) {
        Logger.log('[repair_ec2026002] No rows found — running seedEC2026002 first');
        var _seedResult = seedEC2026002();
        if (!_seedResult.ok) return respond({ ok:false, error:'Seed failed: ' + (_seedResult.error||'unknown'), log:Logger.getLog() });
      }
      var _r2 = repairEC2026002SocialPosts();
      if (!_r2.ok) return respond({ ok:false, error:_r2.error, log:Logger.getLog() });
      // Auto-resync ContentCalendar so cockpit shows corrected IDs and dates
      var _r2sync = seedAllCampaignsContentCalendar();
      return respond({ ok:true, seeded:!_ec2Check.length, fixed:_r2.fixed, dl_seeded:_r2.dl_seeded, cal_seeded:_r2sync.total_seeded, cal_ok:_r2sync.ok, log:Logger.getLog() });
    }
    if(body.action === 'rebuild_social_posts_from_figma') {
      var _rbCid = body.campaignId || body.campaign_id || 'EC-2026-001';
      var _rbResult = rebuildSocialPostsFromFigmaExport(_rbCid);
      if(_rbResult.ok) {
        // Auto-seed ContentCalendar after rebuild
        var _rbSeed = seedEC2026001ContentCalendar(_rbCid);
        return respond({ ok:true, rebuilt:_rbResult.rebuilt, seeded:_rbSeed.seeded, seed_ok:_rbSeed.ok, seed_error:_rbSeed.error||null, log:Logger.getLog() });
      }
      return respond({ ok:false, error:_rbResult.error, log:Logger.getLog() });
    }
    if(body.action === 'debug_social_posts') {
      var _dbCampaignId = body.campaignId || body.campaign_id || 'EC-2026-001';
      var _dbSs = _getCampaignSpreadsheet();
      // List all tabs in the Campaign Center SS
      var _dbAllTabs = _dbSs.getSheets().map(function(s){ return s.getName() + '(' + Math.max(0,s.getLastRow()-1) + ' rows)'; });
      var _dbResult = { spreadsheet_name: _dbSs.getName(), all_tabs: _dbAllTabs, looking_for: _dbCampaignId };
      var _dbSp = _dbSs.getSheetByName('SocialPosts');
      if(!_dbSp) {
        _dbResult.social_posts = 'TAB MISSING';
      } else {
        var _dbLast = _dbSp.getLastRow();
        _dbResult.social_posts = { total_rows: _dbLast - 1, matches: 0, sample_ids: [], distinct_campaign_ids: {} };
        if(_dbLast >= 2) {
          var _dbRows = _dbSp.getRange(2, 1, _dbLast - 1, 2).getValues();
          _dbRows.forEach(function(r) {
            var cid = String(r[1]).trim();
            _dbResult.social_posts.distinct_campaign_ids[cid] = (_dbResult.social_posts.distinct_campaign_ids[cid]||0)+1;
            if(cid === _dbCampaignId) {
              _dbResult.social_posts.matches++;
              if(_dbResult.social_posts.sample_ids.length < 5) _dbResult.social_posts.sample_ids.push(String(r[0]));
            }
          });
        }
      }
      var _dbCc = _dbSs.getSheetByName('ContentCalendar');
      _dbResult.content_calendar_rows = _dbCc ? Math.max(0, _dbCc.getLastRow()-1) : 'TAB MISSING';
      // Check FigmaExport tab
      var _dbFe = _dbSs.getSheetByName('FigmaExport');
      _dbResult.figma_export_rows = _dbFe ? Math.max(0, _dbFe.getLastRow()-1) : 'TAB MISSING';
      return respond({ok:true, result:_dbResult});
    }
    if(body.action === 'seed_ec2026001_lp_pages') {
      var _lpPg = seedEC2026001LPPages();
      return respond({ ok:_lpPg.ok, result:_lpPg, log: Logger.getLog() });
    }
    if(body.action === 'seed_ec2026001_landing_pages') {
      var _lpLand = seedEC2026001LandingPages();
      return respond({ ok:_lpLand.ok, result:_lpLand, log: Logger.getLog() });
    }
    if(body.action === 'repair_sheet_headers') {
      var _rsh = repairSheetHeaders(body.tabs || null);
      return respond({ ok:_rsh.ok, result:_rsh, log: Logger.getLog() });
    }
    if(body.action === 'clean_lp_inventory') {
      var _cli = cleanLPInventory();
      return respond({ ok:_cli.ok, result:_cli, log: Logger.getLog() });
    }
    if(body.action === 'restore_lp_waitlist_ab') {
      var _rlw = restoreLpWaitlistAB();
      return respond({ ok:_rlw.ok, result:_rlw, log: Logger.getLog() });
    }
    if(body.action === 'seed_ec2026002_full') {
      var _s2f = seedEC2026002Full();
      return respond({ ok:_s2f.ok, result:_s2f, log: Logger.getLog() });
    }
    if(body.action === 'repair_icp_dates') {
      var _rid = repairIcpDates();
      return respond({ ok:_rid.ok, result:_rid, log: Logger.getLog() });
    }
    if(body.action === 'seed_ec2026001_icp_utm_lp') {
      var _iul = seedEC2026001IcpUtmLp();
      return respond({ ok:_iul.ok, result:_iul, log: Logger.getLog() });
    }
    if(body.action === 'repair_asset_lifecycle_dropdowns' || body.action === 'repair_all_status_dropdowns') {
      var _ald = repairAllStatusDropdowns();
      return respond({ ok:_ald.ok, result:_ald, log: Logger.getLog() });
    }
    if(body.action === 'seed_video_production') {
      var _svp = seedEC2026001VideoProduction();
      return respond({ ok:_svp.ok, result:_svp, log: Logger.getLog() });
    }
    if(body.action === 'reset_video_production') {
      var _rvp = resetVideoProduction();
      return respond({ ok:_rvp.ok, result:_rvp, log: Logger.getLog() });
    }
    if(body.action === 'seed_video_idea_bank') {
      var _vib = seedVideoIdeaBank();
      return respond({ ok:_vib.ok, result:_vib, log: Logger.getLog() });
    }
    if(body.action === 'seed_ec2026001_campaign_strategies') {
      var _cs = seedEC2026001CampaignStrategies();
      return respond({ ok:_cs.ok, result:_cs, log: Logger.getLog() });
    }
    if(body.action === 'seed_video_idea_bank_batch2') {
      var _vib2 = seedVideoIdeaBankBatch2();
      return respond({ ok:_vib2.ok, result:_vib2, log: Logger.getLog() });
    }
    if(body.action === 'update_vib_tk_006') {
      var _v6 = updateVibTk006();
      return respond({ ok:_v6.ok, result:_v6, log: Logger.getLog() });
    }
    if(body.action === 'patch_vib_tk_006_scene6') {
      var _p6 = patchVibTk006Scene6();
      return respond({ ok:_p6.ok, result:_p6, log: Logger.getLog() });
    }
    if(body.action === 'seed_brand_position_001') {
      var _bp = seedBrandPosition001();
      return respond({ ok:_bp.ok, result:_bp, log: Logger.getLog() });
    }
    if(body.action === 'seed_icp_landing_pages') {
      var _ilp = seedIcpLandingPages();
      return respond({ ok:_ilp.ok, result:_ilp, log: Logger.getLog() });
    }
    if(body.action === 'seed_lp_framework_001') {
      var _lpf = seedLpFramework001();
      return respond({ ok:_lpf.ok, result:_lpf, log: Logger.getLog() });
    }
    if(body.action === 'patch_approved_claims_v2') {
      var _pac = patchApprovedClaimsV2();
      return respond({ ok:_pac.ok, result:_pac, log: Logger.getLog() });
    }
    if(body.action === 'approve_all_pending_claims') {
      var _apc = approveAllPendingClaims();
      return respond({ ok:_apc.ok, result:_apc, log: Logger.getLog() });
    }
    if(body.action === 'patch_dl_registry_schema') {
      var _pdr = patchDLRegistrySchema();
      return respond({ ok:_pdr.ok, result:_pdr, log: Logger.getLog() });
    }
    if(body.action === 'export_campaign_snapshot') {
      var _cid = body.campaign_id || 'EC-2026-001';
      var _snap = exportCampaignSnapshotToDrive(_cid);
      return respond({ ok:_snap.ok, result:_snap, log: Logger.getLog() });
    }
    if(body.action === 'seed_ec2026002') {
      var _ec2 = seedEC2026002();
      return respond({ ok:_ec2.ok, result:_ec2, log: Logger.getLog() });
    }
    if(body.action === 'patch_cc_settings_002') {
      var _pcs = patchCcSettings002();
      return respond({ ok:_pcs.ok, result:_pcs, log: Logger.getLog() });
    }
    if(body.action === 'debug_dl_registry') {
      var _dlSheet = _getCCSheet(_CC_TAB.DL);
      var _dlData  = _dlSheet.getDataRange().getValues().slice(1).filter(function(r){return r[0];});
      var _dlDist  = { status:{}, channel:{}, has_url:0, no_url:0 };
      _dlData.forEach(function(r){
        var s=String(r[8]); _dlDist.status[s]=(_dlDist.status[s]||0)+1;
        var c=String(r[3]); _dlDist.channel[c]=(_dlDist.channel[c]||0)+1;
        if(String(r[4]).trim()) _dlDist.has_url++; else _dlDist.no_url++;
      });
      return respond({ ok:true, total:_dlData.length, distribution:_dlDist,
        sample: _dlData.slice(0,5).map(function(r){return {id:r[0],channel:r[3],url:r[4],status:r[8],notes:r[12]};}) });
    }
    if(body.action === 'rewrite_all_claims') {
      var _rwc = rewriteAllClaims();
      return respond({ ok:_rwc.ok, result:_rwc, log: Logger.getLog() });
    }
    if(body.action === 'seed_claim_quality_001') {
      var _cq = seedClaimQuality001();
      return respond({ ok:_cq.ok, result:_cq, log: Logger.getLog() });
    }
    if(body.action === 'debug_claims_statuses') {
      var _sheet = _getCCSheet(_CC_TAB.CLAIMS);
      var _d = _sheet.getDataRange().getValues().slice(1).filter(function(r){return r[0];});
      var _dist = {};
      _d.forEach(function(r){ var s=String(r[3]); _dist[s]=(_dist[s]||0)+1; });
      return respond({ ok:true, total:_d.length, distribution:_dist, sample: _d.slice(0,3).map(function(r){return {id:r[0],status:r[3]};}) });
    }
    if(body.action === 'purge_orphan_rows') {
      var _por = purgeOrphanRows();
      return respond({ ok:_por.ok, result:_por, log: Logger.getLog() });
    }
    if(body.action === 'debug_campaign_ids') {
      var _dci = {};
      [[_CC_TAB.SOCIAL,_CC_HDR.SocialPosts],[_CC_TAB.EMAIL,_CC_HDR.EmailSequences],[_CC_TAB.DL,_CC_HDR.DeepLinkRegistry]].forEach(function(pair){
        var s=_getCCSheet(pair[0]); var last=s.getLastRow(); if(last<2)return;
        var cidIdx=pair[1].indexOf('campaign_id');
        var counts={};
        s.getRange(2,1,last-1,Math.min(pair[1].length,cidIdx+1)).getValues().forEach(function(r){
          var cid=String(r[cidIdx]||'(blank)').trim(); counts[cid]=(counts[cid]||0)+1;
        });
        _dci[pair[0]]=counts;
      });
      return respond({ ok:true, campaign_id_counts: _dci });
    }
    if(body.action === 'sheet_row_audit') {
      var _ss = _getCampaignSpreadsheet();
      var _tabs = Object.keys(_CC_TAB).map(function(k){ return _CC_TAB[k]; });
      var _audit = _tabs.map(function(name){
        var s = _ss.getSheetByName(name);
        if (!s) return { tab: name, exists: false, rows: 0, cols: 0 };
        return { tab: name, exists: true, rows: Math.max(0, s.getLastRow() - 1), cols: s.getLastColumn() };
      });
      return respond({ ok:true, audit: _audit });
    }
    if(body.action === 'get_campaign_funnel') {
      var _funnelCid = body.campaign_id || 'EC-2026-001';
      var _funnel = getCampaignFunnel(_funnelCid);
      return respond({ ok:_funnel.ok, result:_funnel, log: Logger.getLog() });
    }
    if(body.action === 'get_approval_queue') {
      var _aq = getApprovalQueue();
      return respond({ ok:_aq.ok, result:_aq, log: Logger.getLog() });
    }
    if(body.action === 'approve_for_scheduling') {
      var _ap = approveForScheduling(body.calendar_id);
      return respond({ ok:_ap.ok, result:_ap, log: Logger.getLog() });
    }
    if(body.action === 'content_calendar_report') {
      var _ccr = getContentCalendarReport();
      return respond({ ok:_ccr.ok, result:_ccr, log: Logger.getLog() });
    }
    if(body.action === 'get_blocked_assets') {
      var _bl = getBlockedAssets(body.campaign_id);
      return respond({ ok:_bl.ok, result:_bl, log: Logger.getLog() });
    }
    if(body.action === 'get_campaign_dashboard') {
      var _dash = getCampaignDashboard(body.campaign_id);
      return respond({ ok:_dash.ok, result:_dash, log: Logger.getLog() });
    }
    if(body.action === 'get_campaign_calendar') {
      var _calr = getCampaignCalendar(body.campaign_id);
      return respond({ ok:_calr.ok, result:_calr, log: Logger.getLog() });
    }
    if(body.action === 'get_cockpit_filter_defs') {
      var _fd = getCockpitFilterDefs();
      return respond({ ok:_fd.ok, result:_fd, log: Logger.getLog() });
    }
    if(body.action === 'upsert_figma_text_fields') {
      var _utf = upsertFigmaTextFields();
      return respond({ ok:_utf.ok, result:_utf, log: Logger.getLog() });
    }

    // ── Generated Copy ────────────────────────────────────────────────────────────
    if(body.action === 'generated_copy_read')    return respond({ ok:true, copy: getGeneratedCopy(body.campaign_id||'') });
    if(body.action === 'generated_copy_write')   { addGeneratedCopy(body.copy); return respond({ ok:true }); }

    // ── Deep Link Registry ────────────────────────────────────────────────────────
    if(body.action === 'dl_registry_read')       return respond({ ok:true, registry: getDlRegistry(body.campaign_id||'') });
    if(body.action === 'dl_registry_write')      { setDlRegistryEntry(body.entry); return respond({ ok:true }); }
    if(body.action === 'deeplinks_status')       { setDlRegistryEntry({dl_id:body.dlId, status:body.status, activated_at:(body.status||'').toUpperCase()==='ACTIVE'?new Date().toISOString():''}); return respond({ ok:true }); }

    // ── Email Sequences ───────────────────────────────────────────────────────────
    if(body.action === 'email_sequences_read')   return respond({ ok:true, sequences: getEmailSequences(body.campaign_id||'') });
    if(body.action === 'email_sequences_write')  { setEmailSequence(body.sequence); return respond({ ok:true }); }

    // ── UTM Generator ────────────────────────────────────────────────────────────
    if(body.action === 'generate_utm_urls') return respond(generateUtmUrls(body));

    // ── Image editing ─────────────────────────────────────────────────────────────
    if(body.action === 'replace_phone_screen') return respond(replacePhoneScreen(body));

    // ── Asset Builder ─────────────────────────────────────────────────────────────
    if(body.action === 'build_email_sequence') return respond(buildEmailSequence(body.brief, body.copy));
    if(body.action === 'build_social_posts')        return respond(buildSocialPosts(body.brief, body.copy));
    if(body.action === 'get_prompt_preview')        return respond(getPromptPreviewForPost(body.post_id||'ec001-sp-001', body.prompt_type||'social_post'));
    if(body.action === 'build_multi_channel_posts')  return respond(buildMultiChannelPosts(body.brief, body.copy));
    if(body.action === 'build_push_notifications')   return respond(buildPushNotifications(body.brief, body.copy));
    if(body.action === 'build_landing_page')        return respond(buildLandingPage(body.brief, body.copy));

    // ── Sequence Builder ──────────────────────────────────────────────────────────
    if(body.action === 'build_full_sequence')      return respond(buildFullSequence(body.brief, body.copy, body.posts||[], body.emails||[]));
    if(body.action === 'run_full_campaign')        return respond(runFullCampaignAutomatic(body.campaign_id||''));
    if(body.action === 'generate_social_posts')      return respond(fcGenerateSocialPosts(body.campaign_id||'', body.channel||''));
    if(body.action === 'generate_emails')            return respond(fcGenerateEmails(body.campaign_id||''));
    if(body.action === 'generate_utm_and_save')      return respond(fcGenerateUtmAndSave(body.campaign_id||''));
    if(body.action === 'export_campaign_to_drive')   return respond(fcExportCampaignToDrive(body.campaign_id||''));
    if(body.action === 'clear_campaign_data')        return respond(fcClearCampaignData(body));
    if(body.action === 'generate_utm_and_export') {
      try {
        return respond(fcGenerateUtmAndExport(body.campaign_id||''));
      } catch(driveErr) {
        return respond({ ok:false, error:driveErr.message, partial:true,
          note:'Drive export failed — check folder permissions or execution timeout' });
      }
    }

    // ── Cleanup utilities ─────────────────────────────────────────────────────────
    if(body.action === 'cleanup_asset_lifecycle')    return respond(cleanupAssetLifecycle());
    if(body.action === 'cleanup_deep_link_registry') return respond(cleanupDeepLinkRegistry());

    // ── LP Doctrine governance ────────────────────────────────────────────────────
    if(body.action === 'seed_lp_doctrine')             return respond(seedLpDoctrine());
    if(body.action === 'ensure_lp_doctrine_columns')   return respond(ensureAllLPDoctrineColumns());
    if(body.action === 'generate_lp_spine')            return respond(generateLPSpine(body.campaign_id, { lp_variant: body.lp_variant || 'a', icp_code: body.icp_code || '' }));
    if(body.action === 'generate_loop_copy')           return respond(generateLoopCopy(body.campaign_id, body.post_id, { lp_variant: body.lp_variant || 'a', icp_code: body.icp_code || '', platform: body.platform || '' }));
    if(body.action === 'backfill_lp_doctrine_columns')  return respond(backfillLPDoctrineColumns());
    if(body.action === 'validate_asset_lp_alignment')   return respond(validateAssetLPAlignment(body.campaign_id, { post_id: body.post_id||'', full_report: body.full_report||false }));
    if(body.action === 'seed_playbook_wiring')           return respond(seedPlaybookWiring());
    if(body.action === 'repair_claim_scoping_001')       return respond(repairClaimScoping001());
    if(body.action === 'update_roadmap_doc') {
      var _rdId  = body.doc_id || '1FrsElDIJPdDDywDYzIC8EoYiV_1RXD66sb9T6ynbK8I';
      var _rdDep = String(body.deploy || '@593');
      try {
        var _rdDoc  = DocumentApp.openById(_rdId);
        var _rdBody = _rdDoc.getBody();
        // Replace all old deploy references
        ['@590','@591','@592','@577','@589','@588','@587','@586','@585'].forEach(function(old) {
          _rdBody.replaceText('Current deploy: ' + old, 'Current deploy: ' + _rdDep);
          _rdBody.replaceText(old + ' —', _rdDep + ' —');
          _rdBody.replaceText(old + '$', _rdDep);
        });
        // Ensure the Current deploy line is correct
        _rdBody.replaceText('Current deploy: .*', 'Current deploy: ' + _rdDep);
        _rdDoc.saveAndClose();
        return respond({ ok: true, deploy: _rdDep, doc_id: _rdId });
      } catch(e) {
        return respond({ ok: false, error: e.message });
      }
    }

    // ── Manual Mode Enforcement ───────────────────────────────────────────────────
    if(body.action === 'seed_life_stages')               return respond(seedLifeStages());
    if(body.action === 'seed_onboarding_doctrine')       return respond(seedOnboardingDoctrine());
    if(body.action === 'seed_theme_library_19')          return respond(seedThemeLibrary19());
    if(body.action === 'seed_manual_mode_enforcement')   return respond(seedManualModeEnforcement());
    if(body.action === 'get_filtered_claims')            return respond(getFilteredClaims(body.lp_section||'', body.campaign_angle||''));
    if(body.action === 'validate_claim_for_section')     return respond(validateClaimForSection(body.claim_type||'', body.lp_section||'', body.campaign_angle||''));
    if(body.action === 'get_section_emotional_guide')    return respond(getSectionEmotionalGuide(body.lp_section||''));
    if(body.action === 'check_phone_rule')               return respond(checkPhoneRule(body.post_number||0, body.image_brief_text||'', body.asset_type||''));
    if(body.action === 'get_visual_direction_context')   return respond(getVisualDirectionContext(body.campaign_id||'', body.lp_section||'', body.post_number||1));
    if(body.action === 'validate_campaign_step1_gates')  return respond(validateCampaignStep1Gates(body.campaign_id||''));
    if(body.action === 'seed_gpt4o_settings')            return respond(seedGpt4oSettings());
    if(body.action === 'seed_brand_visual_tokens')       return respond(seedBrandVisualTokens());
    if(body.action === 'get_gpt4o_log') {
      var _gl = _getCCSheet(_CC_TAB.SETTINGS); var _gll = _gl.getLastRow();
      if (_gll >= 2) {
        var _glv = _gl.getRange(2,1,_gll-1,3).getValues();
        for(var _gi=0;_gi<_glv.length;_gi++) {
          if(String(_glv[_gi][0]).toUpperCase()==='DEBUG' && String(_glv[_gi][1])==='LOG_LAST_GPT4O_CALL') {
            return respond({ok:true, log: _glv[_gi][2]});
          }
        }
      }
      return respond({ok:false, error:'LOG_LAST_GPT4O_CALL row not found'});
    }
    if(body.action === 'get_gpt4o_active') {
      var _ga = _getCCSheet(_CC_TAB.SETTINGS); var _gal = _ga.getLastRow();
      var _gaState = {gpt4o_active:'(not set)', gpt4o_model:'(not set)'};
      if (_gal >= 2) {
        var _gav = _ga.getRange(2,1,_gal-1,3).getValues();
        _gav.forEach(function(r) {
          if(String(r[0]).toUpperCase()==='AI_MODELS') {
            if(String(r[1])==='GPT4O_ACTIVE')     _gaState.gpt4o_active = String(r[2]);
            if(String(r[1])==='GPT4O_COPY_MODEL') _gaState.gpt4o_model  = String(r[2]);
          }
        });
      }
      return respond({ok:true, state: _gaState});
    }
    if(body.action === 'build_gpt4o_prompt_docs')        return respond(buildGPT4oSystemPromptDocs());
    if(body.action === 'build_social_media_schemas')     return respond(buildSocialMediaSchemaDocs());
    if(body.action === 'audit_prompt_schema_drift')      return respond(auditPromptSchemaDrift());
    // Read all ApprovedClaims rows (including non-approved) — returns full array with IDs
    if(body.action === 'get_all_claims') {
      return respond({ ok: true, claims: getApprovedClaims(false) });
    }
    // Deactivate one or more claims by ID: body.ids = ["claim-id-1","claim-id-2"]
    if(body.action === 'deactivate_claims') {
      var _dcIds = body.ids || [];
      _dcIds.forEach(function(cid) { setApprovedClaim({ id: cid, approved: false }); });
      return respond({ ok: true, deactivated: _dcIds });
    }
    // Set approved_date=today on all ACTIVE claims missing a real date.
    // Empty date cells in Sheets return new Date(0) → "1970-01-01" after _ccFmtDate.
    if(body.action === 'backfill_claim_dates') {
      var _bfClaims = getApprovedClaims(false);
      var _bfToday  = new Date().toISOString().split('T')[0];
      var _bfFixed  = [];
      _bfClaims.forEach(function(c) {
        var _d = String(c.approved_date || '').trim();
        var _missing = !_d || _d === '' || _d === '1970-01-01' || _d === '1969-12-31';
        if (c.approved && _missing) {
          setApprovedClaim({ id: c.id, approved_date: _bfToday, approved_by: c.approved_by || 'Marketing Lead' });
          _bfFixed.push(c.id);
        }
      });
      return respond({ ok: true, backfilled: _bfFixed, total: _bfClaims.length });
    }
    // Upsert a BrandDoctrine row: body.id, body.type (opt), body.active (opt), body.conditions_json (obj)
    if(body.action === 'upsert_doctrine_row') {
      var _udSheet = _getCampaignSpreadsheet().getSheetByName(_CC_TAB.BRAND_DOCTRINE);
      var _udHdrs  = _CC_HDR.BrandDoctrine;
      if (!_udSheet) return respond({ok:false, error:'BrandDoctrine tab not found'});
      // Read existing row for defaults
      var _udEx = {}; var _udLr = _udSheet.getLastRow();
      if (_udLr >= 2) {
        var _udVals = _udSheet.getRange(2,1,_udLr-1,5).getValues();
        for (var _ui=0;_ui<_udVals.length;_ui++) {
          if (String(_udVals[_ui][0])===String(body.id)) { _udEx={id:_udVals[_ui][0],type:_udVals[_ui][1],active:_udVals[_ui][3],json:_udVals[_ui][4]}; break; }
        }
      }
      var _udJson = body.conditions_json !== undefined ? JSON.stringify(body.conditions_json) : String(_udEx.json||'{}');
      _ccUpsert(_udSheet, _udHdrs, body.id, [
        body.id,
        body.type    !== undefined ? body.type   : (_udEx.type   || ''),
        '',
        body.active  !== undefined ? body.active : (_udEx.active !== undefined ? _udEx.active : true),
        _udJson
      ]);
      return respond({ok:true, id:body.id});
    }
    if(body.action === 'get_doctrine_rows') {
      var _drSheet = _getCampaignSpreadsheet().getSheetByName(_CC_TAB.BRAND_DOCTRINE);
      var _drRows  = {};
      var _drIds   = body.ids || [];
      if (_drSheet && _drSheet.getLastRow() >= 2) {
        var _drVals = _drSheet.getRange(2, 1, _drSheet.getLastRow() - 1, 5).getValues();
        _drVals.forEach(function(r) {
          if (_drIds.indexOf(String(r[0])) !== -1) {
            var _drJ = {}; try { _drJ = JSON.parse(String(r[4] || '{}')); } catch(e) {}
            _drRows[String(r[0])] = { id: String(r[0]), type: String(r[1]), active: String(r[3]), json: _drJ };
          }
        });
      }
      return respond({ ok: true, rows: _drRows });
    }

    // ── Social Posts ──────────────────────────────────────────────────────────────
    if(body.action === 'social_posts_read')      return respond({ ok:true, posts: getSocialPosts(body.campaign_id||'') });
    if(body.action === 'social_posts_write')     { setSocialPost(body.post); return respond({ ok:true }); }

    // ── Landing Pages ─────────────────────────────────────────────────────────────
    if(body.action === 'landing_pages_read')     return respond({ ok:true, pages: getLandingPages(body.campaign_id||'') });
    if(body.action === 'landing_pages_write')    { setLandingPage(body.page); return respond({ ok:true }); }
    if(body.action === 'landing_page_save') {
      var _lp=body.lp||{};
      var _lpId=_lp.id||('lp-'+Date.now().toString(36));
      var _lpProof=Array.isArray(_lp.proof_bar)?_lp.proof_bar.join(' | '):(_lp.proof_bar||'');
      setLandingPage({
        id:               _lpId,
        campaign_id:      _lp.campaign_id    ||'',
        icp_code:         _lp.icp||_lp.icp_code||'',
        slug:             _lp.slug           ||'',
        full_url:         'https://easychefpro.com/'+(_lp.slug||''),
        hero_headline:    _lp.hero_headline  ||'',
        hero_subheadline: _lp.hero_subheadline||'',
        section_problem:  _lp.problem_section||_lp.section_problem||'',
        section_agitate:  _lp.agitate_section||_lp.section_agitate||'',
        section_solve:    _lp.solve_section  ||_lp.section_solve  ||'',
        section_value:    _lp.value_section  ||_lp.section_value  ||'',
        section_proof:    _lpProof,
        section_cta:      _lp.cta_primary    ||_lp.section_cta    ||'',
        status:           _lp.status         ||'draft',
        campaign_type:    _lp.campaign_type  ||'waitlist',
        blueprint_code:   _lp.blueprint_code ||'',
        icp_codes:        _lp.icp||_lp.icp_code||'',
        theme:            _lp.theme          ||'',
        ab_test_variant:  _lp.ab_test_variant||(_lp.slug&&_lp.slug.indexOf('-b')>-1?'B':'A')
      });
      return respond({ok:true,id:_lpId,campaign_id:_lp.campaign_id||'',slug:_lp.slug||''});
    }

    if(body.action === 'create_lp_inventory') return respond(createLpInventoryEntry(body));

    // ── Push Notifications sheet ──────────────────────────────────────────────────
    if(body.action === 'push_notifications_read')  return respond({ ok:true, notifications: getPushNotifications(body.campaign_id||'') });
    if(body.action === 'push_notification_write')  { setPushNotification(body.notification); return respond({ ok:true }); }

    // ── Content Calendar sheet ────────────────────────────────────────────────────
    if(body.action === 'content_calendar_read')    return respond({ ok:true, entries: getContentCalendar(body.campaign_id||'') });
    if(body.action === 'content_calendar_write')   { setContentCalendarEntry(body.entry); return respond({ ok:true }); }
    if(body.action === 'save_calendar')            return respond(saveCalendarEntries(body));

    // ── Campaign Metrics sheet ────────────────────────────────────────────────────
    if(body.action === 'campaign_metrics_read')    return respond({ ok:true, metrics: getCampaignMetrics(body.campaign_id||'') });
    if(body.action === 'campaign_metric_write')    { setCampaignMetric(body.metric); return respond({ ok:true }); }

    // ── Scheduled Posts sheet ─────────────────────────────────────────────────────
    if(body.action === 'scheduled_posts_read')     return respond({ ok:true, posts: getScheduledPosts(body.campaign_id||'') });
    if(body.action === 'scheduled_post_write')     { setScheduledPost(body.post); return respond({ ok:true }); }

    // ── LP Inventory sheet ────────────────────────────────────────────────────────
    if(body.action === 'lp_inventory_read')        return respond({ ok:true, inventory: getLPInventory(body.status||'') });
    if(body.action === 'lp_inventory_write')       { setLPInventoryEntry(body.entry); return respond({ ok:true }); }

    // ── Image Pipeline + Klaviyo ──────────────────────────────────────────────────
    if(body.action === 'klaviyo_push_sequence')  return respond(klaviyoPushSequence(body));
    if(body.action === 'klaviyo_get_lists')      return respond(klaviyoGetLists());

    

    if(body.action === 'theme_library_write') {
      var _tlId = setThemeLibraryRow(body.theme || body);
      return respond({ok:true, id: _tlId});
    }
    if(body.action === 'tasks_append') {
      var _newTasks = Array.isArray(body.tasks) ? body.tasks : [];
      if(!_newTasks.length) return respond({ok:false,error:'No tasks provided'});
      var _existing = getTasks();
      var _existingIds = _existing.map(function(t){return t.id;});
      _newTasks.forEach(function(t){ if(t.id && _existingIds.indexOf(t.id)===-1){ _existing.push(t); } });
      setTasks(_existing);
      return respond({ok:true, written:_existing.length});
    }

    // ── Setup utilities ───────────────────────────────────────────────────────
    if(body.action === 'read_ai_reference') {
      var _rai = readAiReference();
      return respond({ ok:_rai.ok, result:_rai, log: Logger.getLog() });
    }
    if(body.action === 'create_ai_reference_tab') {
      var _cart = createAIReferenceTab();
      return respond({ ok:_cart.ok, result:_cart, log: Logger.getLog() });
    }
    if(body.action === 'archive_old_reference_docs') {
      var _aord = archiveOldReferenceDocs();
      return respond({ ok:_aord.ok, result:_aord, log: Logger.getLog() });
    }
    if(body.action === 'seed_governance_rows') {
      var _sgr = seedGovernanceRows();
      return respond({ ok:_sgr.ok, result:_sgr, log: Logger.getLog() });
    }
    if(body.action === 'update_master_reference') {
      var _umr = updateMasterReference({
        old_deploy:  body.old_deploy  || null,
        new_deploy:  body.new_deploy  || null,
        mark_done:   body.mark_done   || null,
        session_log: body.session_log || null
      });
      return respond({ ok:_umr.ok, result:_umr, log: Logger.getLog() });
    }
    if(body.action === 'audit_sheet_data') {
      var _asd = auditSheetData();
      return respond({ ok:_asd.ok, result:_asd, log: Logger.getLog() });
    }
    if(body.action === 'seed_test_week') {
      var _stw = seedTestWeek();
      return respond({ ok:_stw.ok, result:_stw, log: Logger.getLog() });
    }
    if(body.action === 'audit_test_week') {
      var _atw = auditTestWeek(body.campaign_id || 'EC-2026-001');
      return respond({ ok:_atw.ok, result:_atw, log: Logger.getLog() });
    }
    if(body.action === 'fix_campaign_briefs_cols') {
      var _fcbc = fixCampaignBriefsCols();
      return respond({ ok:_fcbc.ok, result:_fcbc, log: Logger.getLog() });
    }
    if(body.action === 'backfill_social_body_copy') {
      var _bsbc = backfillSocialBodyCopy();
      return respond({ ok:_bsbc.ok, result:_bsbc, log: Logger.getLog() });
    }
    if(body.action === 'backfill_figma_export_fields') {
      var _bfef = backfillFigmaExportFields();
      return respond({ ok:_bfef.ok, result:_bfef, log: Logger.getLog() });
    }
    if(body.action === 'diag_figma_cta') {
      var _dfc = diagFigmaCta();
      return respond({ ok:_dfc.ok, result:_dfc, log: Logger.getLog() });
    }
    if(body.action === 'backfill_deep_link_fields') {
      var _bdlf = backfillDeepLinkFields();
      return respond({ ok:_bdlf.ok, result:_bdlf, log: Logger.getLog() });
    }
    if(body.action === 'diag_content_cal_brief_url') {
      var _dcbu = diagContentCalBriefUrl();
      return respond({ ok:_dcbu.ok, result:_dcbu, log: Logger.getLog() });
    }
    if(body.action === 'backfill_content_cal_brief_url') {
      var _bcbu = backfillContentCalBriefUrl();
      return respond({ ok:_bcbu.ok, result:_bcbu, log: Logger.getLog() });
    }
    if(body.action === 'backfill_content_cal_caption') {
      var _bccc = backfillContentCalCaption();
      return respond({ ok:_bccc.ok, result:_bccc, log: Logger.getLog() });
    }
    if(body.action === 'clear_campaign_data_tabs') {
      var _ccdt = clearCampaignDataTabs();
      return respond({ ok:_ccdt.ok, result:_ccdt, log: Logger.getLog() });
    }

    const tasks = Array.isArray(body) ? body : body.tasks;
    if(!Array.isArray(tasks)) throw new Error('Expected task array.');
    setTasks(tasks);
    return respond({ ok: true, written: tasks.length });
  } catch(err) {
    return respond({ ok: false, error: err.message });
  }
}


function _setupRequestsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('InfoRequests');
  if(sh) { Logger.log('Already exists'); return; }
  sh = ss.insertSheet('InfoRequests');
  var headers = ['id','taskId','fromUser','fromName','toUser','toName','question','status','response','createdAt','respondedAt','slackTs','channel'];
  sh.getRange(1,1,1,headers.length).setValues([headers]);
  var h = sh.getRange(1,1,1,headers.length);
  h.setBackground('#1a1a2e');
  h.setFontColor('#c9a84c');
  h.setFontWeight('bold');
  h.setFontFamily('Courier New');
  sh.setFrozenRows(1);
  sh.setColumnWidth(7, 400);
  sh.setColumnWidth(9, 400);
  Logger.log('✅ InfoRequests sheet created');
}
var MESSAGES_SHEET = 'Messages';
var MESSAGES_HEADERS = ['id','taskId','fromUser','fromName','text','createdAt','editedAt','type'];

function getMessages(taskId) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MESSAGES_SHEET);
  if(!sh || sh.getLastRow() < 2) return [];
  var data = sh.getDataRange().getValues();
  var headers = data[0].map(function(h){return String(h).trim();});
  var all = data.slice(1).map(function(row){
    var obj={}; headers.forEach(function(h,i){obj[h]=row[i]==null?'':String(row[i]);}); return obj;
  }).filter(function(r){return r.id;});
  return taskId ? all.filter(function(r){return r.taskId===taskId;}) : all;
}

function addMessage(item) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(MESSAGES_SHEET);
  if(!sh) {
    sh = ss.insertSheet(MESSAGES_SHEET);
    sh.getRange(1,1,1,MESSAGES_HEADERS.length).setValues([MESSAGES_HEADERS]);
    var h = sh.getRange(1,1,1,MESSAGES_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c'); h.setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  if(!item.id) item.id = 'msg-'+new Date().getTime();
  if(!item.createdAt) item.createdAt = new Date().toISOString();
  sh.appendRow(MESSAGES_HEADERS.map(function(h){return item[h]||'';}));
}

function deleteMessage(id) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(MESSAGES_SHEET);
  if(!sh || sh.getLastRow() < 2) return;
  var ids = sh.getRange(2,1,sh.getLastRow()-1,1).getValues().map(function(r){return String(r[0]);});
  var idx = ids.indexOf(String(id));
  if(idx >= 0) sh.deleteRow(idx+2);
}



function getChannelMaps() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CHANNEL_MAPS_SHEET);
  if(!sh || sh.getLastRow() < 2) return {category:{}, dm:{}};
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const result = {category:{}, dm:{}};
  data.slice(1).forEach(row => {
    const obj = {};
    headers.forEach((h,i) => obj[String(h).trim()] = row[i]==null?'':String(row[i]));
    if(obj.mapType === 'category') result.category[obj.key] = {channelId:obj.channelId, channelName:obj.channelName};
    if(obj.mapType === 'dm') result.dm[obj.key] = {channelId:obj.channelId, channelName:obj.channelName};
  });
  return result;
}

function setChannelMapEntry(mapType, key, channelId, channelName, changedBy) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CHANNEL_MAPS_SHEET);
  if(!sh) {
    sh = ss.insertSheet(CHANNEL_MAPS_SHEET);
    sh.getRange(1,1,1,6).setValues([['mapType','key','channelId','channelName','changedBy','updatedAt']]);
    const h = sh.getRange(1,1,1,6);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c'); h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
  }
  // Find existing row and update, or append
  const lastRow = sh.getLastRow();
  if(lastRow > 1) {
    const data = sh.getRange(2,1,lastRow-1,2).getValues();
    for(let i = 0; i < data.length; i++) {
      if(String(data[i][0]) === mapType && String(data[i][1]) === key) {
        sh.getRange(i+2,3,1,4).setValues([[channelId, channelName, changedBy, new Date().toISOString()]]);
        return;
      }
    }
  }
  sh.appendRow([mapType, key, channelId, channelName, changedBy, new Date().toISOString()]);
}

// ── Action Plans ──────────────────────────────────────────────
function getActionPlans(sourceId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(ACTION_PLANS_SHEET);
  if(!sh || sh.getLastRow() < 2) return [];
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const plans = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h,i) => obj[String(h).trim()] = row[i]==null?'':String(row[i]));
    return obj;
  }).filter(p => p.id);
  return sourceId ? plans.filter(p => p.sourceId === sourceId) : plans;
}

function setActionPlan(plan) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(ACTION_PLANS_SHEET);
  if(!sh) {
    sh = ss.insertSheet(ACTION_PLANS_SHEET);
    sh.getRange(1,1,1,ACTION_PLAN_HEADERS.length).setValues([ACTION_PLAN_HEADERS]);
    const h = sh.getRange(1,1,1,ACTION_PLAN_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c'); h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
  }
  sh.appendRow(ACTION_PLAN_HEADERS.map(h => plan[h]||''));
}

function completeActionPlan(planId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(ACTION_PLANS_SHEET);
  if(!sh || sh.getLastRow() < 2) return;
  const data = sh.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim()); // TRIM headers
  const idIdx = headers.indexOf('id');
  const statusIdx = headers.indexOf('status');
  const completedAtIdx = headers.indexOf('completedAt');
  Logger.log('idIdx:'+idIdx+' statusIdx:'+statusIdx+' completedAtIdx:'+completedAtIdx);
  for(let i = 1; i < data.length; i++) {
    if(String(data[i][idIdx]).trim() === String(planId).trim()) {
      if(statusIdx >= 0) sh.getRange(i+1, statusIdx+1).setValue('complete');
      if(completedAtIdx >= 0) sh.getRange(i+1, completedAtIdx+1).setValue(new Date().toISOString());
      return;
    }
  }
}

function cleanActionPlansHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('ActionPlans');
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const cleaned = headers.map(h => String(h).trim());
  sh.getRange(1,1,1,sh.getLastColumn()).setValues([cleaned]);
  Logger.log('Cleaned headers: ' + cleaned.join(' | '));
}

function checkActionPlansHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('ActionPlans');
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  Logger.log('Headers: ' + headers.join(' | '));
  Logger.log('status index: ' + headers.indexOf('status'));
  Logger.log('completedAt index: ' + headers.indexOf('completedAt'));
  Logger.log('Last col: ' + sh.getLastColumn());
}
function testCompleteActionPlan() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('ActionPlans');
  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf('id');
  Logger.log('idIdx: ' + idIdx);
  // Find the plan
  for(let i = 1; i < data.length; i++) {
    const rowId = String(data[i][idIdx]).trim();
    Logger.log('Row ' + i + ' id: "' + rowId + '"');
    if(rowId === 'ap-1776703116354') {
      Logger.log('FOUND at row ' + (i+1));
      sh.getRange(i+1, 10).setValue('complete');
      sh.getRange(i+1, 11).setValue(new Date().toISOString());
      Logger.log('Updated!');
      return;
    }
  }
  Logger.log('NOT FOUND');
}


// ── Slack ─────────────────────────────────────────────────────

function getAllSlackUserIds() {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  var res = UrlFetchApp.fetch('https://slack.com/api/users.list', {
    headers: {'Authorization': 'Bearer ' + token},
    muteHttpExceptions: true
  });
  var data = JSON.parse(res.getContentText());
  if(!data.ok) { Logger.log('Error: ' + data.error); return; }
  data.members.forEach(function(m) {
    if(!m.is_bot && !m.deleted) {
      Logger.log(m.id + ' | ' + m.real_name + ' | ' + m.profile.display_name);
    }
  });
}

function searchSlackArchive(query) {
  try {
    var ss = SpreadsheetApp.openById('1oTqTtpBaCYIYbj2u1eGuCD1n21iGGtP9n-IV3VKe-yo');
    var results = [];
    var q = query.toLowerCase();
    ss.getSheets().forEach(function(sh) {
      var data = sh.getDataRange().getValues();
      data.slice(1).forEach(function(row) {
        if(String(row[2]||'').toLowerCase().indexOf(q) >= 0) {
          results.push({date:String(row[0]),user:String(row[1]),message:String(row[2]),channel:sh.getName()});
        }
      });
    });
    return results.slice(0,25);
  } catch(e) { return []; }
}

function doGetSlackOAuth(e) {
  const code = e.parameter.code;
  const state = e.parameter.state;
  if(!code) return HtmlService.createHtmlOutput('No code received.');
  const clientId = PropertiesService.getScriptProperties().getProperty('SLACK_CLIENT_ID');
  const clientSecret = PropertiesService.getScriptProperties().getProperty('SLACK_CLIENT_SECRET');
  const response = UrlFetchApp.fetch('https://slack.com/api/oauth.v2.access', { method:'post', payload:{ client_id:clientId, client_secret:clientSecret, code:code, redirect_uri:'https://script.google.com/macros/s/AKfycbzXDFBtoFiBvXN6Hf95N2glYvKZReVlojCevHKnCScJytxE4s7VZaTuLmIoDxU3UpQUYw/exec' } });
  const data = JSON.parse(response.getContentText());
  if(!data.ok) return HtmlService.createHtmlOutput('Auth failed: ' + data.error);
  const userToken = data.authed_user && data.authed_user.access_token;
  if(userToken && state) PropertiesService.getScriptProperties().setProperty('SLACK_USER_TOKEN_' + state, userToken);
  return HtmlService.createHtmlOutput('<html><body style="font-family:monospace;background:#0b0d10;color:#c9a84c;padding:40px;text-align:center"><h2>✓ Connected</h2><p>Your Slack account is now linked to the DGL Ops Center.</p><p>You can close this tab.</p></body></html>');
}

function getChannelIds() {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  var res = UrlFetchApp.fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=200', {
    headers: {'Authorization': 'Bearer ' + token}
  });
  var data = JSON.parse(res.getContentText());
  var targets = ['marketing-strategy','brand-design','content-website','digital-marketing','social-media','email-marketing','product-marketing','data-analytics','partnerships','launch-ops','support-systems','build-website'];
  (data.channels||[]).forEach(function(c) {
    if(targets.includes(c.name)) Logger.log(c.name + ': ' + c.id);
  });
}

function _slackFetch(endpoint, params) {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  var url = 'https://slack.com/api/' + endpoint;
  if(params) { var qs = Object.keys(params).map(function(k){ return encodeURIComponent(k)+'='+encodeURIComponent(params[k]); }).join('&'); url += '?'+qs; }
  var res = UrlFetchApp.fetch(url, { method:'get', headers:{'Authorization':'Bearer '+token}, muteHttpExceptions:true });
  return JSON.parse(res.getContentText());
}
function _slackPost(endpoint, payload) {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  var res = UrlFetchApp.fetch('https://slack.com/api/'+endpoint, { method:'post', headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json; charset=utf-8'}, payload:JSON.stringify(payload), muteHttpExceptions:true });
  return JSON.parse(res.getContentText());
}
function getSlackChannels() {
  var allChannels = [];
  var cursor = '';
  do {
    var params = {types:'public_channel,private_channel',exclude_archived:true,limit:200};
    if(cursor) params.cursor = cursor;
    var data = _slackFetch('conversations.list', params);
    if(!data.ok) return {ok:false,error:data.error};
    allChannels = allChannels.concat(data.channels||[]);
    cursor = (data.response_metadata&&data.response_metadata.next_cursor)||'';
  } while(cursor);
  return {ok:true,channels:allChannels.map(function(c){ return {id:c.id,name:c.name,topic:(c.topic||{}).value||'',member_count:c.num_members}; })};
}

function inviteAllToChannels() {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  var userIds = ['U060MREPTSM','U0A1NTY6X9U','U0A9S1PTL92','U0AETGGKV0D','U07TG752WFR','U0AUHT7DMCH','U0ATUH79M4J'];
  var channels = [
    'C0ATR781N9H','C0ATR7DDD51','C0ATU6R5W3X','C0ATVGL1PHC',
    'C0ATVGXUYS2','C0ATXJNEESE','C0AURRWFZGQ','C0AURSGMJNL',
    'C0AURSN2YGG','C0AURU2AFLP','C0AV3AHCNMV'
  ];
  channels.forEach(function(chId) {
    var res = UrlFetchApp.fetch('https://slack.com/api/conversations.invite', {
      method: 'post',
      headers: {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'},
      payload: JSON.stringify({channel: chId, users: userIds.join(',')})
    });
    var data = JSON.parse(res.getContentText());
    Logger.log(chId + ': ' + (data.ok ? '✅ OK' : '❌ ' + data.error));
  });
}

function inviteToBranding() {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  var userIds = ['U060MREPTSM','U0A1NTY6X9U','U0A9S1PTL92','U0AETGGKV0D','U07TG752WFR','U0AUHT7DMCH','U0ATUH79M4J'];
  var res = UrlFetchApp.fetch('https://slack.com/api/conversations.invite', {
    method: 'post',
    headers: {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'},
    payload: JSON.stringify({channel: 'C089F03E1CH', users: userIds.join(',')})
  });
  Logger.log(JSON.parse(res.getContentText()).ok ? '✅ OK' : '❌ ' + JSON.parse(res.getContentText()).error);
}

function findBrandChannel() {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  var res = UrlFetchApp.fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=200', {
    headers: {'Authorization': 'Bearer ' + token}
  });
  var data = JSON.parse(res.getContentText());
  (data.channels||[]).forEach(function(c) {
    if(c.name.includes('brand')) Logger.log(c.name + ': ' + c.id);
  });
}

function resolveSlackUser(userId) {
  if(!userId) return 'bot';
  const cache = CacheService.getScriptCache();
  const cached = cache.get('slack_user_'+userId);
  if(cached) return cached;
  var data = _slackFetch('users.info', { user:userId });
  if(!data.ok) { cache.put('slack_user_'+userId, userId, 21600); return userId; }
  var profile = data.user && data.user.profile;
  var name = (profile && (profile.display_name || profile.real_name)) || userId;
  cache.put('slack_user_'+userId, name, 21600);
  return name;
}
function createSlackArchiveSheet() {
  var ss = SpreadsheetApp.create('DGL Slack Archive 2023-2026');
  Logger.log('Created: ' + ss.getUrl());
  Logger.log('ID: ' + ss.getId());
}


function getSlackMessages(channelId, limit, oldest) {
  if(!channelId) return { ok:false, error:'channelId required' };
  var params = { channel:channelId, limit:limit||25 };
  if(oldest) params.oldest = oldest;
  var data = _slackFetch('conversations.history', params);
  if(!data.ok) return { ok:false, error:data.error||'conversations.history failed' };
  return { ok:true, messages:(data.messages||[]).map(function(m){ var msg = { ts:m.ts, user:resolveSlackUser(m.user||m.bot_id||''), text:m.text||'' }; if(m.thread_ts && m.thread_ts===m.ts) { msg.thread_ts=m.thread_ts; msg.reply_count=m.reply_count||0; } return msg; })};
}
function getSlackThread(channelId, threadTs) {
  if(!channelId||!threadTs) return { ok:false, error:'channelId and threadTs required' };
  var data = _slackFetch('conversations.replies', { channel:channelId, ts:threadTs });
  if(!data.ok) return { ok:false, error:data.error||'conversations.replies failed' };
  return { ok:true, messages:(data.messages||[]).map(function(m){ return { ts:m.ts, user:resolveSlackUser(m.user||m.bot_id||''), text:m.text||'' }; })};
}
function sendSlackMessage(channelId, text, dglUser) {
  if(!channelId||!text) return { ok:false, error:'channelId and text required' };
  var userToken = dglUser ? PropertiesService.getScriptProperties().getProperty('SLACK_USER_TOKEN_'+dglUser) : null;
  var token = userToken || PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  var res = UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', { method:'post', headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json; charset=utf-8'}, payload:JSON.stringify({ channel:channelId, text:text }), muteHttpExceptions:true });
  var data = JSON.parse(res.getContentText());
  if(!data.ok) return { ok:false, error:data.error||'chat.postMessage failed' };
  return { ok:true, ts:data.ts, channel:data.channel };
}

function testSlackBot() {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_BOT_TOKEN');
  Logger.log('Token exists: ' + !!token);
  Logger.log('Token prefix: ' + (token ? token.slice(0,10) : 'none'));
  
  var res = UrlFetchApp.fetch('https://slack.com/api/auth.test', {
    headers: {'Authorization': 'Bearer ' + token},
    muteHttpExceptions: true
  });
  Logger.log('Auth test: ' + res.getContentText());
}

function testChannels() {
  var data = _slackFetch('conversations.list', { types:'public_channel,private_channel', exclude_archived:true, limit:200 });
  Logger.log('Total: ' + (data.channels||[]).length);
  Logger.log('Error: ' + data.error);
}
function debugPrivateChannels() {
  var data = _slackFetch('conversations.list', { types:'private_channel', exclude_archived:true, limit:200 });
  Logger.log('ok: ' + data.ok);
  Logger.log('channels: ' + (data.channels||[]).length);
  (data.channels||[]).forEach(c => Logger.log(c.name));
}

// ── Lock Logs ─────────────────────────────────────────────────
function setChannelMap(itemId, newValue, label, changedBy, oldValue, sessionHash) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SLACK_CHANNEL_SHEET);
  if(!sheet) {
    sheet = ss.insertSheet(SLACK_CHANNEL_SHEET);
    sheet.getRange(1,1,1,7).setValues([['taskId','channelId','channelName','changedBy','changedAt','oldChannel','sessionHash']]);
    const h = sheet.getRange(1,1,1,7);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
    h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([itemId, newValue, label, changedBy, new Date().toISOString(), oldValue||'', sessionHash||'']);
}

// ── Profiles ──────────────────────────────────────────────────
function getProfiles() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PROFILES_SHEET_NAME);
  if(!sheet || sheet.getLastRow() < 2) return {};
  const data = sheet.getDataRange().getValues();
  const out = {};
  data.slice(1).forEach(row => { if(row[0]) try{ out[String(row[0])] = JSON.parse(String(row[1]||'{}')); }catch(e){} });
  return out;
}
function setProfile(userKey, profileData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PROFILES_SHEET_NAME);
  if(!sheet) {
    sheet = ss.insertSheet(PROFILES_SHEET_NAME);
    sheet.getRange(1,1,1,2).setValues([['userKey','profileJSON']]);
    const h = sheet.getRange(1,1,1,2);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c'); h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sheet.setFrozenRows(1); sheet.setColumnWidth(1,120); sheet.setColumnWidth(2,800);
  }
  const lastRow = sheet.getLastRow();
  if(lastRow > 1) {
    const keys = sheet.getRange(2,1,lastRow-1,1).getValues().map(r=>String(r[0]));
    const idx = keys.indexOf(String(userKey));
    if(idx >= 0) { sheet.getRange(idx+2, 2).setValue(JSON.stringify(profileData)); return; }
  }
  sheet.appendRow([userKey, JSON.stringify(profileData)]);
}

// ── Comments ──────────────────────────────────────────────────
function getComments(taskId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(COMMENTS_SHEET);
  if(!sheet || sheet.getLastRow() < 2) return [];
  const rows = sheet.getDataRange().getValues();
  const header = rows[0];
  const all = rows.slice(1).map(row => { const obj = {}; header.forEach((col,i) => { obj[String(col)] = row[i]==null?'':String(row[i]); }); return obj; });
  return taskId ? all.filter(c => c.taskId === taskId) : all;
}
function addComment(taskId, user, name, ts, text, type) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(COMMENTS_SHEET);
  if(!sheet) {
    sheet = ss.insertSheet(COMMENTS_SHEET);
    sheet.appendRow(['id','taskId','user','name','timestamp','text','type']);
    const h = sheet.getRange(1,1,1,7);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c'); h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow(['C'+new Date().getTime(), taskId, user, name, ts, text, type||'task']);
}

// ── Beta Metrics ──────────────────────────────────────────────
function getBetaMetrics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(BETA_SHEET);
  if(!sheet || sheet.getLastRow() < 2) return [];
  const rows = sheet.getDataRange().getValues();
  const header = rows[0];
  return rows.slice(1).map(row => { const obj = {}; header.forEach((col,i) => { obj[String(col)] = row[i]==null?'':String(row[i]); }); return obj; });
}
function setBetaMetrics(rows) {
  if(!Array.isArray(rows)) return;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(BETA_SHEET);
  if(!sheet) sheet = ss.insertSheet(BETA_SHEET);
  sheet.clearContents();
  const COLS = ['week','active','receipts','tickets','firstStrike','retention','notes'];
  const data = [COLS, ...rows.map(r => COLS.map(c => r[c]!==undefined?r[c]:''))];
  sheet.getRange(1,1,data.length,COLS.length).setValues(data);
}

// ── App Analytics ─────────────────────────────────────────────
function getAppAnalytics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ANALYTICS_SHEET);
  if(!sheet || sheet.getLastRow() < 2) return {};
  const rows = sheet.getDataRange().getValues();
  const result = {};
  rows.slice(1).forEach(row => { const key=String(row[0]).trim(); if(key) result[key]=String(row[1]||''); });
  return result;
}
function setAppAnalytics(dau, receipts, session) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(ANALYTICS_SHEET);
  if(!sheet) { sheet = ss.insertSheet(ANALYTICS_SHEET); sheet.appendRow(['metric','value','updated']); }
  const now = new Date().toISOString();
  const data = sheet.getDataRange().getValues();
  const keyIdx = {};
  data.slice(1).forEach((row,i) => { keyIdx[String(row[0]).trim()] = i+2; });
  [['dau',dau],['receipts',receipts],['session',session]].forEach(([key,val]) => {
    if(keyIdx[key]) sheet.getRange(keyIdx[key],2,1,2).setValues([[val,now]]);
    else sheet.appendRow([key,val,now]);
  });
}

// ── Agenda ────────────────────────────────────────────────────
function setupAgendaSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(AGENDA_SHEET_NAME);
  if(!sheet) {
    sheet = ss.insertSheet(AGENDA_SHEET_NAME);
    sheet.getRange(1,1,1,AGENDA_HEADERS.length).setValues([AGENDA_HEADERS]);
    const h = sheet.getRange(1,1,1,AGENDA_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c'); h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1,80); sheet.setColumnWidth(2,300); sheet.setColumnWidth(3,400); sheet.setColumnWidth(4,300);
    return sheet;
  }
  const lastCol = sheet.getLastColumn();
  const headers = lastCol > 0 ? sheet.getRange(1,1,1,lastCol).getValues()[0] : [];
  AGENDA_HEADERS.forEach((h,i) => { if(!headers.includes(h)) sheet.getRange(1, i+1).setValue(h); });
  return sheet;
}
function getAgenda() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(AGENDA_SHEET_NAME);
  if(!sheet || sheet.getLastRow() < 2) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(row => { const obj = {}; headers.forEach((h,i) => obj[h] = row[i]===null?'':String(row[i])); return obj; }).filter(r => r.id !== '');
}
function setAgendaItem(item) {
  if(!item || !item.id) return;
  const sheet = setupAgendaSheet();
  const lastRow = sheet.getLastRow();
  const row = [
    item.id||'', item.title||'', item.detail||'', item.decision||'',
    item.checked||'false', item.owner||'', item.deadline||'',
    item.category||'', item.taskId||'', item.flag||'',
    item.actionPlan||'', item.taskPlan||'', JSON.stringify(item.taskPlans||[])
  ];
  if(lastRow > 1) {
    const ids = sheet.getRange(2,1,lastRow-1,1).getValues().map(r=>String(r[0]));
    const idx = ids.indexOf(String(item.id));
    if(idx >= 0) { sheet.getRange(idx+2,1,1,AGENDA_HEADERS.length).setValues([row]); return; }
  }
  sheet.appendRow(row);
}
function deleteAgendaItem(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(AGENDA_SHEET_NAME);
  if(!sheet || sheet.getLastRow() < 2) return;
  const ids = sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues().map(r=>String(r[0]));
  const idx = ids.indexOf(String(id));
  if(idx >= 0) sheet.deleteRow(idx+2);
}
function writeAllAgenda(items) {
  if(!items||!items.length) return;
  const sheet = setupAgendaSheet();
  const lastRow = sheet.getLastRow();
  if(lastRow > 1) sheet.getRange(2,1,lastRow-1,AGENDA_HEADERS.length).clearContent();
  const rows = items.map(item => [
    item.id||'', item.title||'', item.detail||'', item.decision||'',
    item.checked||'false', item.owner||'', item.deadline||'',
    item.category||'', item.taskId||'', item.flag||'',
    item.actionPlan||'', item.taskPlan||'', JSON.stringify(item.taskPlans||[])
  ]);
  sheet.getRange(2,1,rows.length,AGENDA_HEADERS.length).setValues(rows);
}
function testGetActions() {
  Logger.log(typeof getActions);
}

// ── PMF ───────────────────────────────────────────────────────
function appendPMFRow(r) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PMF_SHEET_NAME);
  if(!sheet) sheet = setupPMFSheet();
  sheet.appendRow([r.date||'',r.notes||'',r.overall_status||'',r.kpi1_target||'',r.kpi1_current||'',r.kpi1_name||'',r.kpi2_target||'',r.kpi2_current||'',r.kpi2_name||'',r.kpi3_target||'',r.kpi3_current||'',r.kpi3_name||'']);
}
function setPMFHistory(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PMF_SHEET_NAME);
  if(!sheet) sheet = setupPMFSheet();
  const history = data.pmfHistory || [];
  if(!history.length) return;
  history.forEach(r => appendPMFRow(r));
}
function setupPMFSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PMF_SHEET_NAME);
  if(!sheet) sheet = ss.insertSheet(PMF_SHEET_NAME);
  const first = sheet.getRange(1,1,1,1).getValue();
  if(first !== 'timestamp') {
    sheet.clearContents();
    sheet.getRange(1,1,1,PMF_HEADERS.length).setValues([PMF_HEADERS]);
    const h = sheet.getRange(1,1,1,PMF_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c'); h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── Budget ────────────────────────────────────────────────────
function setBudget(data) {
  const sheet = setupBudgetSheet();
  const b = data || {};
  const phases = b.adPhases || [];
  const monthlyBurn = b.monthlyBurn || ((b.payoneer&&b.payoneer.active==='$10K'?10000:15000) + (b.team&&b.team['Searah Teitgen']||0) + 19964);
  const runway = monthlyBurn > 0 ? (((b.startingCapital||93000) - (b.adBudget||0)) / monthlyBurn).toFixed(1) : '∞';
  sheet.appendRow([new Date().toISOString(),b.payoneer&&b.payoneer.active||'$15K',b.startingCapital||93000,b.adBudget||0,monthlyBurn,b.monthlyRevenue||0,runway,b.launchReserve||0,phases[0]?phases[0].pct:0,phases[1]?phases[1].pct:0,phases[2]?phases[2].pct:0,phases[3]?phases[3].pct:0,phases[4]?phases[4].pct:0,b.team&&b.team['Searah Teitgen']||1000,b.team&&b.team['Sadee Tison']||0,b.minReserve||20000,b.snapshotNote||'auto-save']);
}
function getBudgetHistory() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(BUDGET_SHEET_NAME);
  if(!sheet||sheet.getLastRow()<2) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).reverse().map(row => { const obj = {}; headers.forEach((h,i) => obj[h] = row[i]); return obj; });
}
function setupBudgetSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(BUDGET_SHEET_NAME);
  if(!sheet) sheet = ss.insertSheet(BUDGET_SHEET_NAME);
  const first = sheet.getRange(1,1,1,1).getValue();
  if(first !== 'timestamp') {
    sheet.clearContents();
    sheet.getRange(1,1,1,BUDGET_HEADERS.length).setValues([BUDGET_HEADERS]);
    const h = sheet.getRange(1,1,1,BUDGET_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c'); h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sheet.setFrozenRows(1); sheet.setColumnWidth(1,220); sheet.setColumnWidth(17,200);
  }
  return sheet;
}

// ── Tasks ─────────────────────────────────────────────────────
function getTasks() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if(lastRow < 2) return [];
  const data = sheet.getRange(2,1,lastRow-1,FIELDS.length).getValues();
  return data.map(function(row){
    const obj = {};
    FIELDS.forEach(function(f,i){
      let v = row[i]==null ? '' : row[i];
      if((f==='sd'||f==='ed'||f==='lastStatusChange') && v instanceof Date) {
        v = Utilities.formatDate(v, 'America/Los_Angeles', 'yyyy-MM-dd');
      }
      obj[f] = String(v);
    });
    return obj;
  }).filter(function(obj){ return obj.id !== ''; });
}

function setTasks(tasks) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if(lastRow > 1) sheet.getRange(2,1,lastRow-1,FIELDS.length).clearContent();
  if(!tasks||!tasks.length) return;
  const rows = tasks.map(function(t){
    return FIELDS.map(function(f){
      return t[f]!==undefined&&t[f]!==null?String(t[f]):'';
    });
  });
  const range = sheet.getRange(2,1,rows.length,FIELDS.length);
  range.setNumberFormat('@');
  SpreadsheetApp.flush();
  range.setValues(rows);
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if(!sheet){ sheet = ss.insertSheet(SHEET_NAME); writeHeader(sheet); }
  return sheet;
}
function writeHeader(sheet) {
  sheet.getRange(1,1,1,FIELDS.length).setValues([FIELDS]);
  const h = sheet.getRange(1,1,1,FIELDS.length);
  h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c'); h.setFontWeight('bold'); h.setFontFamily('Courier New');
  sheet.setFrozenRows(1);
}
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if(!sheet){ sheet = ss.insertSheet(SHEET_NAME); writeHeader(sheet); Logger.log('Created.'); }
  else { const first = sheet.getRange(1,1,1,1).getValue(); if(first==='') { writeHeader(sheet); Logger.log('Header written.'); } else Logger.log('Already initialized: '+first); }
}

// ── Anthropic ─────────────────────────────────────────────────
function callAnthropic(body) {
  const prompt = (body&&body.prompt) ? body.prompt : 'Provide a brief DGL launch readiness assessment.';
  const system = (body&&body.system) ? body.system : 'You are the executive advisor to Digital Galactica Labs (DGL). Provide an honest, direct launch readiness assessment speaking to the founding team.';
  const apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if(!apiKey) return respond({ ok:false, error:'API key not set.' });
  const payload = { model:'claude-sonnet-4-20250514', max_tokens:2000, system:system, messages:[{ role:'user', content:prompt }] };
  const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', { method:'post', contentType:'application/json', headers:{'x-api-key':apiKey,'anthropic-version':'2023-06-01'}, payload:JSON.stringify(payload), muteHttpExceptions:true });
  const result = JSON.parse(response.getContentText());
  const text = result.content&&result.content[0] ? result.content[0].text : null;
  return respond({ ok:true, text, error:result.error||null });
}

function callAnthropicModel(prompt, system, model, maxTokens) {
  const apiKey = PropertiesService.getScriptProperties()
    .getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return 'Error: ANTHROPIC_API_KEY not set in Script Properties.';

  const payload = {
        model: model || 'claude-sonnet-4-20250514',
    max_tokens: maxTokens || 2048,
    system: system || 'You are a helpful assistant.',
    messages: [{ role: 'user', content: prompt }]
  };

  const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const json = JSON.parse(resp.getContentText());
  if (json.error) return 'Error: ' + json.error.message;
  return json.content && json.content[0] ? json.content[0].text : '';
}

// ── Milestone Drive backup ──────────────────────────────────────
var _MS_BACKUP_NAME = 'dgl_milestones_backup.json';

function _saveMilestonesBackup(items) {
  try {
    var folder = DriveApp.getFolderById(SHARED_DRIVE_FOLDER_ID);
    var existing = folder.getFilesByName(_MS_BACKUP_NAME);
    var json = JSON.stringify(items);
    if(existing.hasNext()) {
      existing.next().setContent(json);
    } else {
      folder.createFile(_MS_BACKUP_NAME, json, MimeType.PLAIN_TEXT);
    }
  } catch(e) { Logger.log('[Milestones] backup write error: ' + e.message); }
}

function _loadMilestonesBackup() {
  try {
    var folder = DriveApp.getFolderById(SHARED_DRIVE_FOLDER_ID);
    var files = folder.getFilesByName(_MS_BACKUP_NAME);
    if(!files.hasNext()) return [];
    var raw = files.next().getBlob().getDataAsString();
    var arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter(function(r){ return r.id; }) : [];
  } catch(e) { Logger.log('[Milestones] backup read error: ' + e.message); return []; }
}

function _writeMilestonesToSheet(sh, items) {
  const MS_HDRS = ['id','title','date','type','status','description','color','taskIds','achievedDate'];
  if(sh.getLastRow() > 1) sh.getRange(2,1,sh.getLastRow()-1,MS_HDRS.length).clearContent();
  if(!items.length) return;
  sh.getRange(2,1,items.length,MS_HDRS.length).setValues(items.map(function(m){
    return MS_HDRS.map(function(h){ return m[h]||''; });
  }));
}

function getMilestones() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const MS_HDRS = ['id','title','date','type','status','description','color','taskIds','achievedDate'];
  let sh = ss.getSheetByName('Milestones');

  // ── Restore from Drive backup if sheet is missing or corrupted ──
  const backup = _loadMilestonesBackup();
  if(!sh) {
    if(!backup.length) return [];
    sh = ss.insertSheet('Milestones');
    const hRow = sh.getRange(1,1,1,MS_HDRS.length);
    hRow.setValues([MS_HDRS]);
    hRow.setBackground('#1a1a2e'); hRow.setFontColor('#c9a84c');
    hRow.setFontWeight('bold'); hRow.setFontFamily('Courier New');
    sh.setFrozenRows(1);
    _writeMilestonesToSheet(sh, backup);
    SpreadsheetApp.flush();
  }

  // Auto-fix header row if column 1 is not 'id'
  if(String(sh.getRange(1,1).getValue()).trim() !== 'id') {
    sh.getRange(1,1,1,MS_HDRS.length).setValues([MS_HDRS]);
    SpreadsheetApp.flush();
  }

  const data = sh.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim());
  let sheetItems = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = row[i]==null?'':String(row[i]));
    return obj;
  }).filter(r => r.id && r.id !== '');

  // Sheet was wiped — restore from backup and return backup data
  if(!sheetItems.length && backup.length) {
    Logger.log('[Milestones] Sheet empty/wiped — restoring ' + backup.length + ' items from Drive backup');
    _writeMilestonesToSheet(sh, backup);
    SpreadsheetApp.flush();
    return backup;
  }

  // Merge: backup may have items the sheet lost
  if(backup.length > sheetItems.length) {
    const sheetIds = new Set(sheetItems.map(function(m){ return m.id; }));
    const missing = backup.filter(function(m){ return !sheetIds.has(m.id); });
    if(missing.length) {
      Logger.log('[Milestones] Restoring ' + missing.length + ' missing items from backup');
      missing.forEach(function(m){ sheetItems.push(m); });
      _writeMilestonesToSheet(sh, sheetItems);
      SpreadsheetApp.flush();
    }
  }

  return sheetItems;
}

function checkFields() {
  Logger.log('FIELDS: ' + FIELDS.join(' | '));
  Logger.log('Count: ' + FIELDS.length);
  Logger.log('Last field: ' + FIELDS[FIELDS.length-1]);
}

function testSetTasks() {
  const sheet = getSheet();
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  Logger.log('Sheet columns: ' + sheet.getLastColumn());
  Logger.log('FIELDS length: ' + FIELDS.length);
  Logger.log('Headers: ' + headers.join(' | '));
  
  const tasks = getTasks();
  Logger.log('Tasks count: ' + tasks.length);
  if(tasks.length > 0) Logger.log('First task id: ' + tasks[0].id);
}

function setMilestonesItem(item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const MS_HDRS = ['id','title','date','type','status','description','color','taskIds','achievedDate'];
  let sh = ss.getSheetByName('Milestones');
  if(!sh) {
    sh = ss.insertSheet('Milestones');
    const hRow = sh.getRange(1,1,1,MS_HDRS.length);
    hRow.setValues([MS_HDRS]);
    hRow.setBackground('#1a1a2e'); hRow.setFontColor('#c9a84c');
    hRow.setFontWeight('bold'); hRow.setFontFamily('Courier New');
    sh.setFrozenRows(1);
  } else {
    // Auto-fix header row if column 1 is blank or wrong
    const firstCell = String(sh.getRange(1,1).getValue()).trim();
    if(firstCell !== 'id') {
      sh.getRange(1,1,1,MS_HDRS.length).setValues([MS_HDRS]);
      SpreadsheetApp.flush();
    }
  }

  // Clean date to YYYY-MM-DD
  let cleanDate = item.date||'';
  if(cleanDate && cleanDate.includes('GMT')) {
    cleanDate = new Date(cleanDate).toISOString().slice(0,10);
  }
  item.date = cleanDate;

  const lastRow = sh.getLastRow();
  if(lastRow > 1) {
    const ids = sh.getRange(2,1,lastRow-1,1).getValues().map(r=>String(r[0]).trim());
    const idx = ids.indexOf(String(item.id));
    if(idx >= 0) {
      sh.getRange(idx+2,1,1,MS_HDRS.length).setValues([MS_HDRS.map(h=>item[h]||'')]);
      _saveMilestonesBackup(getMilestones());
      return;
    }
  }
  sh.appendRow(MS_HDRS.map(h=>item[h]||''));
  _saveMilestonesBackup(getMilestones());
}

function deleteMilestones(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Milestones');
  if(!sh || sh.getLastRow() < 2) return;
  const ids = sh.getRange(2,1,sh.getLastRow()-1,1).getValues().map(r=>String(r[0]).trim());
  const idx = ids.indexOf(String(id));
  if(idx >= 0) { sh.deleteRow(idx+2); _saveMilestonesBackup(getMilestones()); }
}

function addCompletion(item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(COMPLETIONS_SHEET);
  if(!sh) {
    sh = ss.insertSheet(COMPLETIONS_SHEET);
    sh.getRange(1,1,1,COMPLETIONS_HEADERS.length).setValues([COMPLETIONS_HEADERS]);
    const h = sh.getRange(1,1,1,COMPLETIONS_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
    h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
    sh.setColumnWidth(6,300); sh.setColumnWidth(7,400);
  }
  sh.appendRow(COMPLETIONS_HEADERS.map(h => item[h]||''));
}
function getCompletions(taskId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(COMPLETIONS_SHEET);
  if(!sh || sh.getLastRow() < 2) return [];
  const data = sh.getDataRange().getValues();
  const headers = data[0].map(h=>String(h).trim());
  const all = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = row[i]==null?'':String(row[i]));
    return obj;
  }).filter(r=>r.id);
  return taskId ? all.filter(r=>r.taskId===taskId) : all;
}
function checkRawCell() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tasks');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const edIdx = headers.indexOf('ed');
  for(let i=1; i<data.length; i++) {
    if(String(data[i][0])==='T-027') {
      const cell = sheet.getRange(i+1, edIdx+1);
      Logger.log('Raw value: ' + data[i][edIdx]);
      Logger.log('Cell format: ' + cell.getNumberFormat());
      Logger.log('Display value: ' + cell.getDisplayValue());
      break;
    }
  }
}


function checkGetTasks() {
  const result = getTasks();
  const t027 = result.find(t => t.id === 'T-027');
  Logger.log('T-027 ed: ' + t027.ed);
  Logger.log('Type: ' + typeof t027.ed);
}
function testWriteT027() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tasks');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const edIdx = headers.indexOf('ed');
  Logger.log('ed column index: ' + edIdx + ' (col ' + (edIdx+1) + ')');
  
  for(let i=1; i<data.length; i++) {
    if(String(data[i][0])==='T-027') {
      Logger.log('Found T-027 at row ' + (i+1));
      Logger.log('Current ed: ' + data[i][edIdx]);
      // Write new date as plain string
      sheet.getRange(i+1, edIdx+1).setValue('2026-05-04');
      Logger.log('Wrote 2026-05-04');
      // Read back
      const newVal = sheet.getRange(i+1, edIdx+1).getValue();
      Logger.log('Read back: ' + newVal);
      break;
    }
  }
}

function _setupWorkstreamSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Workstreams sheet
  var ws = ss.getSheetByName('Workstreams');
  if(!ws) {
    ws = ss.insertSheet('Workstreams');
    var wsHeaders = ['id','name','category','owner','sd','ed','color','status','linkedTasks','linkedActions','notes','order','createdBy','createdAt','updatedAt'];
    ws.getRange(1,1,1,wsHeaders.length).setValues([wsHeaders]);
    var h1 = ws.getRange(1,1,1,wsHeaders.length);
    h1.setBackground('#1a1a2e'); h1.setFontColor('#c9a84c'); h1.setFontWeight('bold'); h1.setFontFamily('Courier New');
    ws.setFrozenRows(1);
    Logger.log('✅ Workstreams sheet created');
  } else { Logger.log('Workstreams sheet already exists'); }
  
  // WorkstreamActions sheet
  var wa = ss.getSheetByName('WorkstreamActions');
  if(!wa) {
    wa = ss.insertSheet('WorkstreamActions');
    var waHeaders = ['id','workstreamId','type','title','body','assignedTo','dueDate','status','completedAt','completedBy','linkedTaskId','createdBy','createdAt'];
    wa.getRange(1,1,1,waHeaders.length).setValues([waHeaders]);
    var h2 = wa.getRange(1,1,1,waHeaders.length);
    h2.setBackground('#1a1a2e'); h2.setFontColor('#c9a84c'); h2.setFontWeight('bold'); h2.setFontFamily('Courier New');
    wa.setFrozenRows(1);
    Logger.log('✅ WorkstreamActions sheet created');
  } else { Logger.log('WorkstreamActions sheet already exists'); }
  
  Logger.log('Done!');
}

// ── Workstreams ───────────────────────────────────────────────
var WS_HEADERS = ['id','name','category','owner','sd','ed','color','status','linkedTasks','linkedActions','notes','order','createdBy','createdAt','updatedAt'];
var WA_HEADERS = ['id','workstreamId','type','title','body','assignedTo','dueDate','status','completedAt','completedBy','linkedTaskId','createdBy','createdAt'];

function getWorkstreams() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Workstreams');
  if(!sh || sh.getLastRow() < 2) return [];
  var data = sh.getDataRange().getValues();
  var headers = data[0].map(function(h){ return String(h).trim(); });
  return data.slice(1).map(function(row){
    var obj = {}; headers.forEach(function(h,i){ obj[h] = row[i]==null?'':String(row[i]); }); return obj;
  }).filter(function(r){ return r.id; });
}

function setWorkstream(item) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Workstreams');
  if(!sh) return;
  var lastRow = sh.getLastRow();
  if(lastRow > 1) {
    var ids = sh.getRange(2,1,lastRow-1,1).getValues().map(function(r){ return String(r[0]); });
    var idx = ids.indexOf(String(item.id));
    if(idx >= 0) { sh.getRange(idx+2,1,1,WS_HEADERS.length).setValues([WS_HEADERS.map(function(h){ return item[h]||''; })]); return; }
  }
  sh.appendRow(WS_HEADERS.map(function(h){ return item[h]||''; }));
}

function deleteWorkstream(id) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Workstreams');
  if(!sh || sh.getLastRow() < 2) return;
  var ids = sh.getRange(2,1,sh.getLastRow()-1,1).getValues().map(function(r){ return String(r[0]); });
  var idx = ids.indexOf(String(id));
  if(idx >= 0) sh.deleteRow(idx+2);
}

function getWorkstreamActions(workstreamId) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('WorkstreamActions');
  if(!sh || sh.getLastRow() < 2) return [];
  var data = sh.getDataRange().getValues();
  var headers = data[0].map(function(h){ return String(h).trim(); });
  var all = data.slice(1).map(function(row){
    var obj = {}; headers.forEach(function(h,i){ obj[h] = row[i]==null?'':String(row[i]); }); return obj;
  }).filter(function(r){ return r.id; });
  return workstreamId ? all.filter(function(r){ return r.workstreamId === workstreamId; }) : all;
}

function addWorkstreamAction(item) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('WorkstreamActions');
  if(!sh) return;
  sh.appendRow(WA_HEADERS.map(function(h){ return item[h]||''; }));
}

function deleteWorkstreamAction(id) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('WorkstreamActions');
  if(!sh || sh.getLastRow() < 2) return;
  var data = sh.getDataRange().getValues();
  for(var i=1; i<data.length; i++) {
    if(String(data[i][0]) === String(id)) { sh.deleteRow(i+1); return; }
  }
}
function deleteCompletion(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Completions');
  if(!sh || sh.getLastRow() < 2) return;
  const ids = sh.getRange(2,1,sh.getLastRow()-1,1).getValues().map(r=>String(r[0]));
  const idx = ids.indexOf(String(id));
  if(idx >= 0) sh.deleteRow(idx+2);
}

// ── Links ─────────────────────────────────────────────────────
var LINKS_SHEET = 'Links';
var LINKS_HEADERS = ['id','fromType','fromId','toType','toId','createdBy','createdAt','notes'];

function _setupLinksSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(LINKS_SHEET);
  if(!sh) {
    sh = ss.insertSheet(LINKS_SHEET);
    sh.getRange(1,1,1,LINKS_HEADERS.length).setValues([LINKS_HEADERS]);
    var h = sh.getRange(1,1,1,LINKS_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
    h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
    Logger.log('✅ Links sheet created');
  } else { Logger.log('Links sheet already exists'); }
}

function getLinks(fromType, fromId, toType) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LINKS_SHEET);
  if(!sh || sh.getLastRow() < 2) return [];
  var data = sh.getDataRange().getValues();
  var headers = data[0].map(function(h){ return String(h).trim(); });
  var all = data.slice(1).map(function(row){
    var obj = {}; headers.forEach(function(h,i){ obj[h] = row[i]==null?'':String(row[i]); }); return obj;
  }).filter(function(r){ return r.id; });
  if(fromType) all = all.filter(function(r){ return r.fromType===fromType; });
  if(fromId) all = all.filter(function(r){ return r.fromId===fromId; });
  if(toType) all = all.filter(function(r){ return r.toType===toType; });
  return all;
}

function addLink(item) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LINKS_SHEET);
  if(!sh) { _setupLinksSheet(); sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LINKS_SHEET); }
  if(!item.id) item.id = 'lnk-' + new Date().getTime();
  if(!item.createdAt) item.createdAt = new Date().toISOString();
  sh.appendRow(LINKS_HEADERS.map(function(h){ return item[h]||''; }));
}

function deleteLink(id) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LINKS_SHEET);
  if(!sh || sh.getLastRow() < 2) return;
  var ids = sh.getRange(2,1,sh.getLastRow()-1,1).getValues().map(function(r){ return String(r[0]); });
  var idx = ids.indexOf(String(id));
  if(idx >= 0) sh.deleteRow(idx+2);
}

function getLinksByEntity(type, id) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LINKS_SHEET);
  if(!sh || sh.getLastRow() < 2) return [];
  var data = sh.getDataRange().getValues();
  var headers = data[0].map(function(h){ return String(h).trim(); });
  var all = data.slice(1).map(function(row){
    var obj = {}; headers.forEach(function(h,i){ obj[h] = row[i]==null?'':String(row[i]); }); return obj;
  }).filter(function(r){ return r.id; });
  return all.filter(function(r){ return (r.fromType===type&&r.fromId===id)||(r.toType===type&&r.toId===id); });
}



// ── Launch Plan ───────────────────────────────────────────────
var LP_SHEET = 'LaunchPlan';
var LP_HEADERS = ['id','workstream','name','sd','ed','color','status','notes','order','taskIds','linkedActions','createdBy','createdAt','updatedAt'];

function getLaunchPlan() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(LP_SHEET);
  if(!sh || sh.getLastRow() < 2) return [];
  var data = sh.getDataRange().getValues();
  var headers = data[0].map(function(h){ return String(h).trim(); });
  return data.slice(1).map(function(row){
    var obj = {};
    headers.forEach(function(h,i){ obj[h] = row[i]==null?'':String(row[i]); });
    return obj;
  }).filter(function(r){ return r.id; });
}



function setLaunchPlanItem(item) {
  if(!item || typeof item !== 'object') return;
  item = item.item || item;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(LP_SHEET);
  if(!sh) {
    sh = ss.insertSheet(LP_SHEET);
    sh.getRange(1,1,1,LP_HEADERS.length).setValues([LP_HEADERS]);
    var h = sh.getRange(1,1,1,LP_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
    h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
  }
  if(item.sd && String(item.sd).indexOf('GMT') >= 0) item.sd = new Date(item.sd).toISOString().slice(0,10);
  if(item.ed && String(item.ed).indexOf('GMT') >= 0) item.ed = new Date(item.ed).toISOString().slice(0,10);
  var lastRow = sh.getLastRow();
  if(lastRow > 1) {
    var ids = sh.getRange(2,1,lastRow-1,1).getValues().map(function(r){ return String(r[0]); });
    var idx = ids.indexOf(String(item.id));
    if(idx >= 0) {
      sh.getRange(idx+2,1,1,LP_HEADERS.length).setValues([LP_HEADERS.map(function(h){ return item[h]||''; })]);
      return;
    }
  }
  sh.appendRow(LP_HEADERS.map(function(h){ return item[h]||''; }));
}

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Tasks');
  if(!sheet) { Logger.log('Tasks sheet not found'); return; }
  
  const FIELDS = [
    'id','name','cat','pri','status','owner','deps','notes',
    'Taylor','Steve','Adam','Mary','JR','Hammad','Searah','Sadee',
    'flag','flagColor','sd','ed','lastStatusChange','decision'
  ];
  
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1,1,1,lastCol).getValues()[0];
  
  // Add any missing columns
  FIELDS.forEach((f,i) => {
    if(!headers.includes(f)) {
      sheet.getRange(1, headers.length+1).setValue(f);
      headers.push(f);
      Logger.log('Added column: ' + f);
    }
  });
  
  Logger.log('✅ Tasks sheet has all columns: ' + FIELDS.join(', '));
}

// ── Actions ───────────────────────────────────────────────────
// ACTIONS_SHEET and ACTIONS_HEADERS defined in Operations_Actions.gs.


function _getActionsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ACTIONS_SHEET);
  if(!sh) {
    sh = ss.insertSheet(ACTIONS_SHEET);
    sh.getRange(1,1,1,ACTIONS_HEADERS.length).setValues([ACTIONS_HEADERS]);
    var h = sh.getRange(1,1,1,ACTIONS_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
    h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
  }
  return sh;
}

function getActions(taskId, workstreamId) {
  var sh = _getActionsSheet();
  if(sh.getLastRow() < 2) return [];
  var data = sh.getDataRange().getValues();
  var headers = data[0].map(function(h){ return String(h).trim(); });
  var all = data.slice(1).map(function(row){
    var obj = {}; headers.forEach(function(h,i){ obj[h] = row[i]==null?'':String(row[i]); }); return obj;
  }).filter(function(r){ return r.id; });
  if(taskId) all = all.filter(function(r){ return r.taskId === taskId; });
  if(workstreamId) all = all.filter(function(r){ return r.workstreamId === workstreamId; });
  return all;
}

function addAction(item) {
  if(!item || typeof item !== 'object') return;
  item = item.item || item; // unwrap if nested
  var sh = _getActionsSheet();
  if(!item.id) item.id = 'act-' + new Date().getTime();
  if(!item.createdAt) item.createdAt = new Date().toISOString();
  if(!item.updatedAt) item.updatedAt = item.createdAt;
  var validTypes = ['comment','flag','statuschange','note','decision','blocker','risk','completion'];
  if(!item.type || validTypes.indexOf(item.type) < 0) item.type = 'note';
  sh.appendRow(ACTIONS_HEADERS.map(function(h){ return item[h]||''; }));
}

function updateAction(id, fields) {
  var sh = _getActionsSheet();
  if(sh.getLastRow() < 2) return;
  var data = sh.getDataRange().getValues();
  var headers = data[0].map(function(h){ return String(h).trim(); });
  var idIdx = headers.indexOf('id');
  for(var i=1; i<data.length; i++) {
    if(String(data[i][idIdx]) === String(id)) {
      headers.forEach(function(h, j){
        if(h==='id'||h==='createdAt'||h==='createdBy') return;
        if(fields[h] !== undefined) sh.getRange(i+1, j+1).setValue(fields[h]);
      });
      var updIdx = headers.indexOf('updatedAt');
      if(updIdx >= 0) sh.getRange(i+1, updIdx+1).setValue(new Date().toISOString());
      return;
    }
  }
}

function deleteAction(id) {
  var sh = _getActionsSheet();
  if(sh.getLastRow() < 2) return;
  var ids = sh.getRange(2,1,sh.getLastRow()-1,1).getValues().map(function(r){ return String(r[0]); });
  var idx = ids.indexOf(String(id));
  if(idx >= 0) sh.deleteRow(idx+2);
}

function deleteLaunchPlanItem(id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(LP_SHEET);
  if(!sh || sh.getLastRow() < 2) return;
  var ids = sh.getRange(2,1,sh.getLastRow()-1,1).getValues().map(function(r){ return String(r[0]); });
  var idx = ids.indexOf(String(id));
  if(idx >= 0) sh.deleteRow(idx+2);
}

function clearLaunchPlan() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LaunchPlan');
  var lastRow = sh.getLastRow();
  if(lastRow > 1) sh.getRange(2,1,lastRow-1,sh.getLastColumn()).clearContent();
  Logger.log('Cleared ' + (lastRow-1) + ' rows');
}
function addActionsColumns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Actions');
  if(!sh) { Logger.log('Actions sheet not found'); return; }
  
  var headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(h=>String(h).trim());
  Logger.log('Current headers: ' + headers.join(' | '));
  
  var toAdd = ['assignedTo','dueDate','priority'];
  toAdd.forEach(function(col) {
    if(!headers.includes(col)) {
      var newCol = sh.getLastColumn() + 1;
      sh.getRange(1, newCol).setValue(col);
      var h = sh.getRange(1, newCol);
      h.setBackground('#1a1a2e');
      h.setFontColor('#c9a84c');
      h.setFontWeight('bold');
      h.setFontFamily('Courier New');
      Logger.log('✅ Added column: ' + col);
    } else {
      Logger.log('Already exists: ' + col);
    }
  });
}

function debugLaunchPlan() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LaunchPlan');
  Logger.log('Last row: ' + sh.getLastRow());
  Logger.log('Last col: ' + sh.getLastColumn());
  var data = sh.getDataRange().getValues();
  Logger.log('Headers: ' + data[0].join(' | '));
  Logger.log('Row 2: ' + data[1].join(' | '));
  Logger.log('Row 3: ' + data[2].join(' | '));
  // Count rows with id
  var count = data.slice(1).filter(function(r){ return String(r[0]).trim(); }).length;
  Logger.log('Rows with id: ' + count);
}

  function auditLPBlankIds() {
    var sheet = getLPSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) { Logger.log('No data rows'); return; }
    var rows = sheet.getRange(2, 1, lastRow - 1, LP_HEADERS.length).getValues();
    var blankCount = 0;
    rows.forEach(function(r, i) {
      if (!r[0]) {
        Logger.log('Row ' + (i + 2) + ' — no id. name=' + r[2] + ' sd=' + r[3] + ' ed=' + r[4]);
        blankCount++;
      }
    });
    Logger.log('Total blank-id rows: ' + blankCount + ' / ' + rows.length);
  }

function fixLaunchPlanHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('LaunchPlan');
  if(!sh) { Logger.log('LaunchPlan sheet NOT FOUND'); return; }
  
  var firstCell = sh.getRange(1,1).getValue();
  Logger.log('First cell: ' + firstCell);
  
  if(firstCell !== 'id') {
    sh.insertRowBefore(1);
    var headers = ['id','workstream','name','sd','ed','color','status','notes','order','taskIds','linkedActions','createdBy','createdAt','updatedAt'];
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    var h = sh.getRange(1,1,1,headers.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
    h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
    Logger.log('✅ Headers added');
  } else {
    Logger.log('Headers already exist');
  }
}

function checkLPHeaders() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LaunchPlan');
  var headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  Logger.log('Headers: ' + headers.join(' | '));
  Logger.log('Last row: ' + sh.getLastRow());
  Logger.log('Col count: ' + sh.getLastColumn());
  // Show first 3 data rows
  var data = sh.getRange(2,1,3,sh.getLastColumn()).getValues();
  data.forEach(function(r,i){ Logger.log('Row '+(i+2)+': '+r.join(' | ')); });
}

function createActionsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Actions');
  if(!sh) sh = ss.insertSheet('Actions');
  var headers = ['id','taskId','agendaId','workstreamId','type','title','body','status','createdBy','createdAt','updatedAt'];
  sh.getRange(1,1,1,headers.length).setValues([headers]);
  var h = sh.getRange(1,1,1,headers.length);
  h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
  h.setFontWeight('bold'); h.setFontFamily('Courier New');
  sh.setFrozenRows(1);
  Logger.log('✅ Actions sheet created with headers');
}

function setupActionsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Actions');
  if(!sh) {
    sh = ss.insertSheet('Actions');
    var headers = ['id','taskId','agendaId','workstreamId','type','title','body','status','createdBy','createdAt','updatedAt'];
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    var h = sh.getRange(1,1,1,headers.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
    h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1,120);
    sh.setColumnWidth(5,100);
    sh.setColumnWidth(6,200);
    sh.setColumnWidth(7,400);
    Logger.log('✅ Actions sheet created');
  } else {
    Logger.log('Actions sheet already exists');
  }
}
function seedLaunchPlanFromData() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LaunchPlan');
  if(sh.getLastRow() > 1) sh.getRange(2,1,sh.getLastRow()-1,14).clearContent();
  
  // 14 cols: id, workstream, name, sd, ed, color, status, notes, order, taskIds, linkedActions, createdBy, createdAt, updatedAt
  var items = [
    ["lp-1","Positioning & Brand","Lock positioning","2026-04-20","2026-04-26","#c9a84c","Not Started","Mary kickoff","1","","","","",""],
    ["lp-2","Positioning & Brand","Brand doc + voice guide","2026-04-27","2026-05-03","#c9a84c","Not Started","","1","","","","",""],
    ["lp-3","Positioning & Brand","Final approval","2026-05-04","2026-05-10","#c9a84c","Not Started","","1","","","","",""],
    ["lp-4","Positioning & Brand","Brand applied across all assets","2026-05-11","2026-07-05","#c9a84c","Not Started","Review weekly","1","","","","",""],
    ["lp-5","Website","Kickoff + structure","2026-04-20","2026-04-26","#60a5fa","Not Started","","2","","","","",""],
    ["lp-6","Website","Design + wireframes","2026-04-27","2026-05-03","#60a5fa","Not Started","","2","","","","",""],
    ["lp-7","Website","Build (dev sprint)","2026-05-04","2026-05-10","#60a5fa","Not Started","","2","","","","",""],
    ["lp-8","Website","Build cont'd + waitlist signup live","2026-05-11","2026-05-17","#60a5fa","Not Started","","2","","","","",""],
    ["lp-9","Website","QA + content polish","2026-05-18","2026-05-24","#60a5fa","Not Started","","2","","","","",""],
    ["lp-10","Website","Beta-family stories integrated","2026-05-25","2026-05-31","#60a5fa","Not Started","","2","","","","",""],
    ["lp-11","Website","Conversion testing","2026-06-01","2026-06-07","#60a5fa","Not Started","","2","","","","",""],
    ["lp-12","Website","A/B test hooks on landing","2026-06-08","2026-06-14","#60a5fa","Not Started","","2","","","","",""],
    ["lp-13","Website","Hard-launch landing page locked","2026-06-15","2026-06-21","#60a5fa","Not Started","","2","","","","",""],
    ["lp-14","Website","Final QA + load test","2026-06-22","2026-06-28","#60a5fa","Not Started","","2","","","","",""],
    ["lp-16","Customer Discovery","5 interviews — Champions","2026-04-20","2026-04-26","#a78bfa","Not Started","","3","","","","",""],
    ["lp-17","Customer Discovery","5 interviews — Econ Buyers","2026-04-27","2026-05-03","#a78bfa","Not Started","","3","","","","",""],
    ["lp-18","Customer Discovery","5 interviews — Health Optim.","2026-05-04","2026-05-10","#a78bfa","Not Started","","3","","","","",""],
    ["lp-19","Customer Discovery","Synthesis + JTBD update","2026-05-11","2026-05-17","#a78bfa","Not Started","","3","","","","",""],
    ["lp-21","App Onboarding (EUREKA)","Map First Strike + bowling alley","2026-04-20","2026-04-26","#34d399","Not Started","","4","","","","",""],
    ["lp-22","App Onboarding (EUREKA)","Build 3-Ingredient Start flow","2026-04-27","2026-05-03","#34d399","Not Started","","4","","","","",""],
    ["lp-23","App Onboarding (EUREKA)","Receipt-scan OCR + Walmart sync","2026-05-04","2026-05-10","#34d399","Not Started","","4","","","","",""],
    ["lp-24","App Onboarding (EUREKA)","Spoilage alerts + savings dash","2026-05-11","2026-05-17","#34d399","Not Started","","4","","","","",""],
    ["lp-25","App Onboarding (EUREKA)","Conversational bumpers","2026-05-18","2026-05-24","#34d399","Not Started","","4","","","","",""],
    ["lp-26","App Onboarding (EUREKA)","Internal alpha (team)","2026-05-25","2026-05-31","#34d399","Not Started","","4","","","","",""],
    ["lp-27","App Onboarding (EUREKA)","Beta cohort onboarded","2026-06-01","2026-06-07","#34d399","Not Started","","4","","","","",""],
    ["lp-28","App Onboarding (EUREKA)","Iterate from beta data","2026-06-08","2026-06-14","#34d399","Not Started","","4","","","","",""],
    ["lp-29","App Onboarding (EUREKA)","Polish — paywall logic","2026-06-15","2026-06-21","#34d399","Not Started","","4","","","","",""],
    ["lp-30","App Onboarding (EUREKA)","Final QA — less than 3 min Aha","2026-06-22","2026-06-28","#34d399","Not Started","","4","","","","",""],
    ["lp-32","Email Marketing","Prep kickoff + ESP setup","2026-04-27","2026-05-03","#f472b6","Not Started","","5","","","","",""],
    ["lp-33","Email Marketing","Waitlist nurture (5 emails)","2026-05-04","2026-05-10","#f472b6","Not Started","","5","","","","",""],
    ["lp-34","Email Marketing","Beta-recruit sequence","2026-05-11","2026-05-17","#f472b6","Not Started","","5","","","","",""],
    ["lp-35","Email Marketing","Welcome flow (post-install)","2026-05-18","2026-05-24","#f472b6","Not Started","","5","","","","",""],
    ["lp-36","Email Marketing","Re-engagement flow","2026-05-25","2026-05-31","#f472b6","Not Started","","5","","","","",""],
    ["lp-37","Email Marketing","Founding-member offer email","2026-06-01","2026-06-07","#f472b6","Not Started","","5","","","","",""],
    ["lp-38","Email Marketing","Test sends (10% sample)","2026-06-08","2026-06-14","#f472b6","Not Started","","5","","","","",""],
    ["lp-39","Email Marketing","Launch-week countdown sequence","2026-06-15","2026-06-21","#f472b6","Not Started","","5","","","","",""],
    ["lp-40","Email Marketing","Scheduled and queued","2026-06-22","2026-06-28","#f472b6","Not Started","","5","","","","",""],
    ["lp-42","Beta (50 Real Families)","Define recruit criteria","2026-04-20","2026-04-26","#ef4444","Not Started","","6","","","","",""],
    ["lp-43","Beta (50 Real Families)","Open application via waitlist","2026-04-27","2026-05-03","#ef4444","Not Started","","6","","","","",""],
    ["lp-44","Beta (50 Real Families)","Select 50 families","2026-05-04","2026-05-10","#ef4444","Not Started","","6","","","","",""],
    ["lp-45","Beta (50 Real Families)","Concierge onboarding","2026-05-11","2026-05-17","#ef4444","Not Started","","6","","","","",""],
    ["lp-46","Beta (50 Real Families)","Week 1 receipts + check-ins","2026-05-18","2026-05-24","#ef4444","Not Started","","6","","","","",""],
    ["lp-47","Beta (50 Real Families)","Week 2 — 1st spoilage saves","2026-05-25","2026-05-31","#ef4444","Not Started","","6","","","","",""],
    ["lp-48","Beta (50 Real Families)","Week 3 — savings counters","2026-06-01","2026-06-07","#ef4444","Not Started","","6","","","","",""],
    ["lp-49","Beta (50 Real Families)","Week 4 — case studies drafted","2026-06-08","2026-06-14","#ef4444","Not Started","","6","","","","",""],
    ["lp-50","Beta (50 Real Families)","Testimonials + receipts published","2026-06-15","2026-06-21","#ef4444","Not Started","","6","","","","",""],
    ["lp-51","Beta (50 Real Families)","App store reviews seeded","2026-06-22","2026-06-28","#ef4444","Not Started","","6","","","","",""],
    ["lp-53","Social Media","Prep: 10 hooks + studio","2026-05-11","2026-05-17","#f59e0b","Not Started","","7","","","","",""],
    ["lp-54","Social Media","Batch shoot (90 micro-content)","2026-05-18","2026-05-24","#f59e0b","Not Started","","7","","","","",""],
    ["lp-55","Social Media","Hook tests ($1.5K)","2026-05-25","2026-05-31","#f59e0b","Not Started","","7","","","","",""],
    ["lp-56","Social Media","Identify winning hooks","2026-06-01","2026-06-07","#f59e0b","Not Started","","7","","","","",""],
    ["lp-57","Social Media","Engagement group active daily","2026-06-08","2026-06-14","#f59e0b","Not Started","","7","","","","",""],
    ["lp-58","Social Media","ORGANIC GO-LIVE","2026-06-15","2026-06-21","#f59e0b","Not Started","","7","","","","",""],
    ["lp-59","Social Media","Power likes + Pinterest blitz","2026-06-22","2026-06-28","#f59e0b","Not Started","","7","","","","",""],
    ["lp-61","Influencers & Alliances","Map 50 mom-creators + 5 RDs","2026-04-27","2026-05-03","#2dd4bf","Not Started","","8","","","","",""],
    ["lp-62","Influencers & Alliances","Outreach + relationship building","2026-05-04","2026-05-10","#2dd4bf","Not Started","","8","","","","",""],
    ["lp-63","Influencers & Alliances","Sign 15 mid-tier creators","2026-05-11","2026-05-17","#2dd4bf","Not Started","","8","","","","",""],
    ["lp-64","Influencers & Alliances","Brief + ship product to creators","2026-05-18","2026-05-24","#2dd4bf","Not Started","","8","","","","",""],
    ["lp-65","Influencers & Alliances","30-day documented experiments","2026-05-25","2026-05-31","#2dd4bf","Not Started","","8","","","","",""],
    ["lp-66","Influencers & Alliances","First receipt-reveal posts","2026-06-01","2026-06-07","#2dd4bf","Not Started","","8","","","","",""],
    ["lp-67","Influencers & Alliances","RD endorsement videos drop","2026-06-08","2026-06-14","#2dd4bf","Not Started","","8","","","","",""],
    ["lp-68","Influencers & Alliances","Coordinated launch-week posting","2026-06-15","2026-06-21","#2dd4bf","Not Started","","8","","","","",""],
    ["lp-69","Influencers & Alliances","Amplify top performers (paid)","2026-06-22","2026-06-28","#2dd4bf","Not Started","","8","","","","",""],
    ["lp-71","Launch Ops & Infra","Cloud API engineer onboarding","2026-04-20","2026-04-26","#94a3b8","Not Started","","9","","","","",""],
    ["lp-72","Launch Ops & Infra","Test-net to cloud migration","2026-05-04","2026-05-10","#94a3b8","Not Started","","9","","","","",""],
    ["lp-73","Launch Ops & Infra","Load-test 100K concurrent","2026-05-18","2026-05-24","#94a3b8","Not Started","","9","","","","",""],
    ["lp-74","Launch Ops & Infra","App store submission","2026-06-01","2026-06-07","#94a3b8","Not Started","","9","","","","",""],
    ["lp-75","Launch Ops & Infra","App approved + monitoring stack","2026-06-15","2026-06-21","#94a3b8","Not Started","","9","","","","",""],
    ["lp-76","Launch Ops & Infra","War-room schedule + comms tree","2026-06-22","2026-06-28","#94a3b8","Not Started","","9","","","","",""]
  ];

  var range = sh.getRange(2, 1, items.length, 14);
  range.setNumberFormat('@');
  range.setValues(items);
  Logger.log('✅ Seeded ' + items.length + ' rows directly from Apps Script');
}
function testCallouts() {
  Logger.log('getCallouts: ' + typeof getCallouts);
  Logger.log('addCallout: ' + typeof addCallout);
}

// ── Callouts ──────────────────────────────────────────────────
var CALLOUTS_SHEET = 'Callouts';
var CALLOUTS_HEADERS = ['id','type','title','message','taggedUser','taggedTask','createdBy','createdAt','dueDate','dismissed','dismissedBy','dismissedAt'];

function _getCalloutsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(CALLOUTS_SHEET);
  if(!sh) {
    sh = ss.insertSheet(CALLOUTS_SHEET);
    sh.getRange(1,1,1,CALLOUTS_HEADERS.length).setValues([CALLOUTS_HEADERS]);
    var h = sh.getRange(1,1,1,CALLOUTS_HEADERS.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
    h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
  }
  return sh;
}

function getCallouts(userKey) {
  var sh = _getCalloutsSheet();
  if(sh.getLastRow() < 2) return [];
  var data = sh.getDataRange().getValues();
  var headers = data[0].map(function(h){ return String(h).trim(); });
  var all = data.slice(1).map(function(row){
    var obj = {}; headers.forEach(function(h,i){ obj[h] = row[i]==null?'':String(row[i]); }); return obj;
  }).filter(function(r){ return r.id; });
  if(userKey) all = all.filter(function(r){ return r.dismissed !== 'true' && (r.taggedUser === userKey || r.taggedUser === '' || r.createdBy === userKey); });
  return all;
}

function addCallout(item) {
  var sh = _getCalloutsSheet();
  if(!item.id) item.id = 'cal-' + new Date().getTime();
  if(!item.createdAt) item.createdAt = new Date().toISOString();
  if(!item.dismissed) item.dismissed = 'false';
  sh.appendRow(CALLOUTS_HEADERS.map(function(h){ return item[h]||''; }));
}

function dismissCallout(id, dismissedBy, dismissedAt) {
  var sh = _getCalloutsSheet();
  if(sh.getLastRow() < 2) return;
  var data = sh.getDataRange().getValues();
  var headers = data[0].map(function(h){ return String(h).trim(); });
  var idIdx = headers.indexOf('id');
  var dismissedIdx = headers.indexOf('dismissed');
  var dismissedByIdx = headers.indexOf('dismissedBy');
  var dismissedAtIdx = headers.indexOf('dismissedAt');
  for(var i=1; i<data.length; i++) {
    if(String(data[i][idIdx]) === String(id)) {
      if(dismissedIdx >= 0) sh.getRange(i+1, dismissedIdx+1).setValue('true');
      if(dismissedByIdx >= 0) sh.getRange(i+1, dismissedByIdx+1).setValue(dismissedBy||'');
      if(dismissedAtIdx >= 0) sh.getRange(i+1, dismissedAtIdx+1).setValue(dismissedAt||new Date().toISOString());
      return;
    }
  }
}

function deleteCallout(id) {
  var sh = _getCalloutsSheet();
  if(sh.getLastRow() < 2) return;
  var ids = sh.getRange(2,1,sh.getLastRow()-1,1).getValues().map(function(r){ return String(r[0]); });
  var idx = ids.indexOf(String(id));
  if(idx >= 0) sh.deleteRow(idx+2);
}
function setupCalloutsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Callouts');
  if(!sh) sh = ss.insertSheet('Callouts');
  var headers = ['id','type','title','message','taggedUser','taggedTask','createdBy','createdAt','dueDate','dismissed','dismissedBy','dismissedAt'];
  sh.getRange(1,1,1,headers.length).setValues([headers]);
  var h = sh.getRange(1,1,1,headers.length);
  h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
  h.setFontWeight('bold'); h.setFontFamily('Courier New');
  sh.setFrozenRows(1);
  sh.setColumnWidth(4,300);
  Logger.log('✅ Callouts sheet ready');
}

function diagLP() {
    Logger.log('LP_HEADERS length: ' + LP_HEADERS.length);
    Logger.log('LP_HEADERS: ' + JSON.stringify(LP_HEADERS));
  }





// ── Debug helpers ─────────────────────────────────────────────


function testSaveT027() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tasks');
  const lastRow = sheet.getLastRow();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  Logger.log('Headers: ' + headers.join(' | '));
  Logger.log('FIELDS length: ' + headers.length);
  
  // Find T-027
  for(let i=1; i<data.length; i++) {
    if(String(data[i][0]) === 'T-027') {
      Logger.log('T-027 row ' + (i+1) + ' ed col: ' + headers.indexOf('ed') + ' val: ' + data[i][headers.indexOf('ed')]);
      break;
    }
  }
}

function testNotesWithColon() {
  const tasks = getTasks();
  const t = tasks.find(t => t.id === 'T-001');
  t.notes = 'Define ideal customer profile: demographics, psychographics, pain points';
  Logger.log('Before setTasks notes: ' + t.notes);
  setTasks(tasks);
  
  const after = getTasks();
  const t2 = after.find(t => t.id === 'T-001');
  Logger.log('After setTasks notes: ' + t2.notes);
}

function checkNotesAfterSave() {
  const tasks = getTasks();
  const t = tasks.find(t => t.id === 'T-001');
  Logger.log('T-001 notes: ' + t.notes);
  
  // Also check raw cell
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const notesIdx = headers.indexOf('notes');
  for(let i=1; i<data.length; i++) {
    if(String(data[i][0]) === 'T-001') {
      Logger.log('Raw cell: ' + JSON.stringify(String(data[i][notesIdx])));
      break;
    }
  }
}

function fixMilestonesHeader() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Milestones');
  sh.getRange(1,1).setValue('id');
  Logger.log('Fixed: ' + sh.getRange(1,1,1,8).getValues()[0].join(' | '));
}

function testMilestones2() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('Milestones');
  Logger.log('Sheet found: ' + !!sh);
  Logger.log('Last row: ' + sh?.getLastRow());
  const data = sh?.getDataRange().getValues();
  Logger.log('Row 1: ' + data[0].join(' | '));
  Logger.log('Row 2: ' + data[1].join(' | '));
  Logger.log('getMilestones result: ' + JSON.stringify(getMilestones()));
}

function checkTriggers() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    Logger.log(t.getHandlerFunction() + ' — ' + t.getEventType());
  });
}

function checkWhichSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Sheet ID: ' + ss.getId());
  Logger.log('Sheet URL: ' + ss.getUrl());
  Logger.log('Sheet Name: ' + ss.getName());
}

function checkMilestonesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets().map(s => s.getName());
  Logger.log('All sheets: ' + sheets.join(' | '));
  
  const sh = ss.getSheetByName('Milestones');
  if(sh) {
    Logger.log('Milestones rows: ' + sh.getLastRow());
    Logger.log('Headers: ' + sh.getRange(1,1,1,8).getValues()[0].join(' | '));
  } else {
    Logger.log('Milestones sheet NOT FOUND');
  }
}

function testMilestones() {
  Logger.log('Milestones rows: ' + getMilestones().length);
  Logger.log('Raw sheet rows: ' + SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Milestones').getLastRow());
  Logger.log('First item: ' + JSON.stringify(getMilestones()[0]));
}

function fixWorkstreamsHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Workstreams');
  var headers = ['id','name','category','owner','sd','ed','color','status','linkedTasks','linkedActions','notes','order','createdBy','createdAt','updatedAt'];
  
  // Check current first row
  var firstRow = sh.getRange(1,1,1,1).getValue();
  Logger.log('First cell: ' + firstRow);
  
  if(firstRow !== 'id') {
    // Insert a row at top and add headers
    sh.insertRowBefore(1);
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    var h = sh.getRange(1,1,1,headers.length);
    h.setBackground('#1a1a2e'); h.setFontColor('#c9a84c');
    h.setFontWeight('bold'); h.setFontFamily('Courier New');
    sh.setFrozenRows(1);
    Logger.log('✅ Headers added');
  } else {
    Logger.log('Headers already exist');
  }
}


function debugT001Notes() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const notesIdx = headers.indexOf('notes');
  Logger.log('notes column index: ' + notesIdx);
  
  for(let i=1; i<data.length; i++) {
    if(String(data[i][0]) === 'T-001') {
      Logger.log('Raw notes cell: ' + JSON.stringify(data[i][notesIdx]));
      Logger.log('Full row length: ' + data[i].length);
      // Show all columns
      headers.forEach((h,j) => {
        if(data[i][j]) Logger.log(j+' '+h+': '+String(data[i][j]).slice(0,50));
      });
      break;
    }
  }
}
function testDocs2() {
  Logger.log('getDocuments: ' + typeof getDocuments);
  Logger.log('addDocument: ' + typeof addDocument);
}
function getDeployedUrl() {
  Logger.log('https://script.google.com/macros/s/AKfycbzXDFBtoFiBvXN6Hf95N2glYvKZReVlojCevHKnCScJytxE4s7VZaTuLmIoDxU3UpQUYw/exec');
}
function getScriptUrl() {
  Logger.log(ScriptApp.getService().getUrl());
}
function testSlackOAuth() {
  var clientId = '6011668670116.10944470791062';
  var redirectUri = 'https://script.google.com/macros/s/AKfycbzXDFBtoFiBvXN6Hf95N2glYvKZReVlojCevHKnCScJytxE4s7VZaTuLmIoDxU3UpQUYw/exec';
  var url = 'https://slack.com/oauth/v2/authorize?client_id=' + clientId + '&scope=&user_scope=im:write,im:read,channels:read&redirect_uri=' + encodeURIComponent(redirectUri) + '&state=steve';
  Logger.log('OAuth URL: ' + url);
}
function checkSlackSecrets() {
  const props = PropertiesService.getScriptProperties().getProperties();
  Logger.log('CLIENT_ID: ' + (props.SLACK_CLIENT_ID ? 'SET' : 'MISSING'));
  Logger.log('CLIENT_SECRET: ' + (props.SLACK_CLIENT_SECRET ? 'SET' : 'MISSING'));
  Logger.log('BOT_TOKEN: ' + (props.SLACK_BOT_TOKEN ? 'SET' : 'MISSING'));
}
function _testLpSearchDirect() {
  Logger.log('getLandingPagesByIcp type: ' + typeof getLandingPagesByIcp);
  var result = getLandingPagesByIcp('Super Mom');
  Logger.log('ok: ' + result.ok);
  Logger.log('pages count: ' + (result.pages ? result.pages.length : 'undefined'));
  
  var allLPs = getLandingPages('');
  Logger.log('All LPs count: ' + allLPs.length);
  if (allLPs.length > 0) {
    Logger.log('LP[0] icp_code: "' + allLPs[0].icp_code + '"');
    Logger.log('LP[0] campaign_id: "' + allLPs[0].campaign_id + '"');
    Logger.log('LP[0] slug: "' + allLPs[0].slug + '"');
  }
}
function _testAllApiKeys() {
  var props = PropertiesService.getScriptProperties();
  
  // Anthropic
  var ak = props.getProperty('ANTHROPIC_API_KEY');
  Logger.log('ANTHROPIC: ' + (ak ? 'YES (' + ak.length + ' chars)' : 'MISSING'));
  
  // OpenAI
  var ok = props.getProperty('OPENAI_API_KEY');
  Logger.log('OPENAI: ' + (ok ? 'YES (' + ok.length + ' chars)' : 'MISSING'));
  
  // Google Gemini
  var gk = props.getProperty('GOOGLE_AI_API_KEY');
  Logger.log('GOOGLE_AI: ' + (gk ? 'YES (' + gk.length + ' chars)' : 'MISSING'));
  
  // Klaviyo
  var kk = props.getProperty('KLAVIYO_API_KEY');
  Logger.log('KLAVIYO: ' + (kk ? 'YES (' + kk.length + ' chars)' : 'MISSING'));
  
  // Test Gemini ping
  if (gk) {
    var resp = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + gk,
      { muteHttpExceptions: true }
    );
    Logger.log('GEMINI ping: ' + resp.getResponseCode());
  }
  
  // Test OpenAI ping  
  if (ok) {
    var resp2 = UrlFetchApp.fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': 'Bearer ' + ok },
      muteHttpExceptions: true
    });
    Logger.log('OPENAI ping: ' + resp2.getResponseCode());
  }
  
  Logger.log('All key checks complete.');
}


function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}