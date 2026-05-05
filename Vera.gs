// ═══════════════════════════════════════════════════════════════
// VERA.gs — DGL AI Agent System
// Digital Galactica Labs, LLC
// Version: 8.0
// Last Updated: April 29, 2026
// ═══════════════════════════════════════════════════════════════

// ═══ AGENT FOLDER IDs ═══
var AGENT_FOLDERS = {
  'vera':             '1n9HUAQ670DYBptpQ0bdyX62ToncLN68Y',
  'prime':            '1S_2dED4XG6QLkAzPA3gOdWStvUxrP-em',
  'meridian':         '1H4PL4upo-btcFuJ9gKot_7B_t4MX3Hrs',
  'nexus':            '18k4E_t9gWOYNxtR-9YprhhOpsMIvLgCJ',
  'forge':            '1FOyhzxlfAm9P15pNZy-sSmPxPs65BLoe',
  'atlas':            '1HCcvPtQlhjEAtDySPiUinaszARCAu2OT',
  'crown':            '174Stos7bRXODUY6ru6EIt-WjPF-LYhXT',
  'hrms':             '1iNojvYBZdPyXoO0Q4nSe7Xs8WbxVIwYc',
  'dni_core':         '1n3AMcVgH4oa9OG_Y_Kucrx5ls4iUj4Ua',
  'vera_builder':     '1EBpmU-AQuMf-wnE8m50NySXfvJgGppRm',
  'easychef_code':    '1yo2sbWhdeY2lDydCDMqioaDPShq8J0yj',
  'easychef_content': '1gwFCMbQC_DKN7fz4Fj7lAG1Al1pYFsAP',
  'easychef_design':  '18bi8SQbGjo_9A9IC4qSEboO7EFxinsnT',
  'recipe_analyzer':  '1L1P7EI0ptOttll54WJJxNfpDAs0ZdQ7t',
  'recipe_validator': '1YKi1wR4-14VLFJfWP6wHW_Ff6q6Wa_4r',
  'nutrisync_code':   '1aXjj9_O2k0R39D5I5P33_CgXZecxfJdx',
  'nutrisync_ops':    '1SLZqwS3oFLrdHDwBJaNXXtoYXfo0T4vR'
};

// ═══ VERA MEMORY FOLDER IDs ═══
var VERA_MEMORY = {
  'current_state':   '1n9HUAQ670DYBptpQ0bdyX62ToncLN68Y',
  'source_of_truth': '1f3ZA65z9J-8AZzdkFeNi11Oip_ZQsgHm',
  'protocols':       '1zUMJlnjHn7vp3F_JPGFEimfj2_nPLSMb',
  'working':         '1GJGzUh2GJZLDf8Zv2qLordcTiLA4vDY2',
  'memory_bank':     '1zrJbaEXQnh_o0zx_892MCYpAeA09WqOy',
  'personal':        '1ybPvOHTFWQbyLFA2kYnpAzk0XAloAFDn',
  'project_states':  '1Y4Tj1IOLA5_2zCAh5XyJ5Odbc6tO5o1O',
  'technical':       '1BKBb2-VpwrVB-ry32VZ6-42bPHx_JrDM',
  'logs':            '1FHd-9YJOq7FG0nC67hKc2zFc7Fe8SxgE',
  'templates':       '14E6X1tY_SFIQoPv4Zb802MipnblQ8x1e'
};

// ═══ AGENT MAP — user to agent ═══
var AGENT_MAP = {
  'taylor': 'prime',
  'steve':  'meridian',
  'hammad': 'nexus',
  'adam':   'forge'
};

// ═══ STEVE ALLOWED WRITE FOLDERS ═══
var STEVE_WRITE_FOLDERS = [
  '1n9HUAQ670DYBptpQ0bdyX62ToncLN68Y', // current_state
  '1GJGzUh2GJZLDf8Zv2qLordcTiLA4vDY2', // working
  '1zrJbaEXQnh_o0zx_892MCYpAeA09WqOy', // memory_bank
  '1FHd-9YJOq7FG0nC67hKc2zFc7Fe8SxgE', // logs
  '1H4PL4upo-btcFuJ9gKot_7B_t4MX3Hrs'  // MERIDIAN folder
];

// ═══════════════════════════════════════════════════════════════
// CONSTITUTION — READ & WRITE
// ═══════════════════════════════════════════════════════════════

function getAgentConstitution(agentKey) {
  try {
    var folderId = AGENT_FOLDERS[agentKey];
    if(!folderId) return null;

    // Vera reads SYSTEM_PROMPT.md from 00_CURRENT_STATE
    if(agentKey === 'vera') {
      var veraFolder = DriveApp.getFolderById(folderId);
      var veraFiles = veraFolder.getFilesByName('SYSTEM_PROMPT.md');
      return veraFiles.hasNext() ? veraFiles.next().getBlob().getDataAsString() : null;
    }

    // All other agents read CONSTITUTION.md from 01_SOURCE_OF_TRUTH
    var folder = DriveApp.getFolderById(folderId);
    var subs = folder.getFolders();
    while(subs.hasNext()) {
      var sub = subs.next();
      if(sub.getName() === '01_SOURCE_OF_TRUTH') {
        var files = sub.getFilesByName('CONSTITUTION.md');
        if(files.hasNext()) return files.next().getBlob().getDataAsString();
      }
    }
  } catch(e) {
    Logger.log('getAgentConstitution error [' + agentKey + ']: ' + e.message);
  }
  return null;
}

function writeAgentConstitution(agentKey, instructions) {
  try {
    var folderId = AGENT_FOLDERS[agentKey];
    if(!folderId) return false;

    // Vera writes SYSTEM_PROMPT.md to 00_CURRENT_STATE
    if(agentKey === 'vera') {
      var veraFolder = DriveApp.getFolderById(folderId);
      var existing = veraFolder.getFilesByName('SYSTEM_PROMPT.md');
      if(existing.hasNext()) existing.next().setTrashed(true);
      veraFolder.createFile('SYSTEM_PROMPT.md', instructions, MimeType.PLAIN_TEXT);
      return true;
    }

    // All others write CONSTITUTION.md to 01_SOURCE_OF_TRUTH
    var folder = DriveApp.getFolderById(folderId);
    var subs = folder.getFolders();
    while(subs.hasNext()) {
      var sub = subs.next();
      if(sub.getName() === '01_SOURCE_OF_TRUTH') {
        var existing = sub.getFilesByName('CONSTITUTION.md');
        if(existing.hasNext()) existing.next().setTrashed(true);
        sub.createFile('CONSTITUTION.md', instructions, MimeType.PLAIN_TEXT);
        return true;
      }
    }
  } catch(e) {
    Logger.log('writeAgentConstitution error [' + agentKey + ']: ' + e.message);
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════
// CLAUDE API
// ═══════════════════════════════════════════════════════════════

function callClaude(prompt, systemPrompt) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{role: 'user', content: prompt}]
    }),
    muteHttpExceptions: true
  });
  var data = JSON.parse(resp.getContentText());
  return respond({ok: true, response: data.content?.[0]?.text || ''});
}

function callClaudeWithConstitution(prompt, agentKey, fallback) {
  var constitution = getAgentConstitution(agentKey) || fallback;
  return callClaude(prompt, constitution);
}

// ═══════════════════════════════════════════════════════════════
// VERA API (RAG)
// ═══════════════════════════════════════════════════════════════

function callVera(message) {
  var veraToken = PropertiesService.getScriptProperties().getProperty('VERA_API_KEY');
  var resp = UrlFetchApp.fetch(
    'https://vera-api-13474513994.us-central1.run.app/api/rag/chat', {
    method: 'post',
    contentType: 'application/json',
    headers: {'Authorization': 'Bearer ' + veraToken},
    payload: JSON.stringify({
      message: message,
      include_sources: false
    }),
    muteHttpExceptions: true
  });
  var data = JSON.parse(resp.getContentText());
  return respond({ok: true, response: data.response || ''});
}

// ═══════════════════════════════════════════════════════════════
// LIVE CONTEXT BUILDER
// ═══════════════════════════════════════════════════════════════

function buildDGLContext(userKey) {
  try {
    var today = new Date().toISOString().slice(0,10);
    var tasks = getTasks();
    var active = tasks.filter(function(t){
      return t.status !== 'Complete' && t.status !== 'Cancelled';
    });
    var overdue = active.filter(function(t){
      return t.ed && t.ed < today && t.ed !== '';
    });
    var workstreams = getWorkstreams();
    var milestones = getMilestones();

    // For Steve — filter to tasks he owns or is R/A on
    if(userKey === 'steve') {
      var steveActive = active.filter(function(t){
        return t.owner === 'steve' || t.Steve === 'R' || t.Steve === 'A' || t.Steve === 'A/R';
      });
    }

    var ctx = '\n\n---\n';
    ctx += '## LIVE DGL OPS CENTER CONTEXT\n';
    ctx += 'Date: ' + today + '\n';
    ctx += 'User: ' + (userKey||'unknown') + '\n\n';

    // Overdue tasks — always show first
    if(overdue.length > 0) {
      ctx += '### ⚠️ OVERDUE TASKS (' + overdue.length + ')\n';
      overdue.forEach(function(t){
        ctx += '- [' + t.id + '] ' + t.name +
               ' | Owner: ' + t.owner +
               ' | Due: ' + t.ed +
               ' | Status: ' + t.status + '\n';
      });
      ctx += '\n';
    }

    // Active tasks
    ctx += '### ACTIVE TASKS (' + active.length + ')\n';
    active.slice(0,15).forEach(function(t){
      ctx += '- [' + t.id + '] ' + t.name +
             ' | ' + t.status +
             ' | Owner: ' + t.owner +
             ' | Due: ' + t.ed + '\n';
    });
    if(active.length > 15) {
      ctx += '...and ' + (active.length - 15) + ' more\n';
    }

    // Workstreams
    if(workstreams.length > 0) {
      ctx += '\n### WORKSTREAMS (' + workstreams.length + ')\n';
      workstreams.forEach(function(w){
        ctx += '- ' + w.name +
               ' | ' + w.status +
               ' | ' + w.sd + ' → ' + w.ed + '\n';
      });
    }

    // Milestones
    if(milestones.length > 0) {
      ctx += '\n### MILESTONES\n';
      milestones.forEach(function(m){
        ctx += '- ' + m.title + ' | ' + m.date + ' | ' + (m.status||'Upcoming') + '\n';
      });
    }

    ctx += '---\n';
    return ctx;

  } catch(e) {
    Logger.log('buildDGLContext error: ' + e.message);
    return '';
  }
}

// ═══════════════════════════════════════════════════════════════
// DRIVE — READ & WRITE
// ═══════════════════════════════════════════════════════════════

function readDriveFile(fileId) {
  try {
    var file = DriveApp.getFileById(fileId);
    return {
      ok: true,
      content: file.getBlob().getDataAsString(),
      name: file.getName(),
      id: fileId
    };
  } catch(e) {
    return {ok: false, error: e.message};
  }
}

function readDriveFolder(folderId) {
  try {
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();
    var result = [];
    while(files.hasNext()) {
      var f = files.next();
      result.push({
        id: f.getId(),
        name: f.getName(),
        mimeType: f.getMimeType(),
        url: f.getUrl(),
        updatedAt: f.getLastUpdated().toISOString()
      });
    }
    var subs = folder.getFolders();
    var subFolders = [];
    while(subs.hasNext()) {
      var s = subs.next();
      subFolders.push({id: s.getId(), name: s.getName()});
    }
    return {
      ok: true,
      folderName: folder.getName(),
      folderId: folderId,
      files: result,
      subFolders: subFolders
    };
  } catch(e) {
    return {ok: false, error: e.message};
  }
}

function writeDriveFile(folderId, filename, content, userKey) {
  try {
    // Steve can only write to allowed folders
    if(userKey === 'steve' && STEVE_WRITE_FOLDERS.indexOf(folderId) < 0) {
      return {ok: false, error: 'Unauthorized — Steve does not have write access to this folder'};
    }
    var folder = DriveApp.getFolderById(folderId);
    var existing = folder.getFilesByName(filename);
    if(existing.hasNext()) {
      var file = existing.next();
      file.setContent(content||'');
      return {ok: true, fileId: file.getId(), mode: 'updated', name: filename};
    } else {
      var newFile = folder.createFile(filename, content||'', MimeType.PLAIN_TEXT);
      return {ok: true, fileId: newFile.getId(), mode: 'created', name: filename};
    }
  } catch(e) {
    return {ok: false, error: e.message};
  }
}

// ═══════════════════════════════════════════════════════════════
// DOPOST HANDLER — all Vera actions
// Call this from Operations.gs doPost
// ═══════════════════════════════════════════════════════════════

function handleVeraAction(body) {

  // ── VERA CHAT (Taylor → Vera RAG) ──────────────────────────
  if(body.action === 'vera_chat') {
    var ctx = buildDGLContext('taylor');
    return callVera((body.prompt||'') + ctx);
  }

  // ── INDIVIDUAL AGENT CHATS ─────────────────────────────────
  if(body.action === 'meridian_chat' || 
  (body.action === 'exec_chat' && (body.user||'').toLowerCase() === 'steve')) {
  
  var ctx = buildDGLContext('steve');
  var constitution = getAgentConstitution('meridian') || 
    'You are Meridian, L9 COO AI for Digital Galactica Labs.';
  
  // Route through Vera RAG with Meridian constitution
  var veraToken = PropertiesService.getScriptProperties().getProperty('VERA_API_KEY');
  var resp = UrlFetchApp.fetch(
    'https://vera-api-13474513994.us-central1.run.app/api/rag/chat', {
    method: 'post',
    contentType: 'application/json',
    headers: {'Authorization': 'Bearer ' + veraToken},
    payload: JSON.stringify({
      message: (body.prompt||'') + ctx,
      system_override: constitution,
      include_sources: false
    }),
    muteHttpExceptions: true
  });
  var data = JSON.parse(resp.getContentText());
  return respond({ok: true, response: data.response || ''});
}

  if(body.action === 'nexus_chat') {
    var ctx = buildDGLContext('hammad');
    return callClaudeWithConstitution(
      (body.prompt||'') + ctx, 'nexus',
      'You are Nexus, L9 CTO AI for Digital Galactica Labs.');
  }

  if(body.action === 'forge_chat') {
    var ctx = buildDGLContext('adam');
    return callClaudeWithConstitution(
      (body.prompt||'') + ctx, 'forge',
      'You are Forge, L9 CMO AI for Digital Galactica Labs.');
  }

  if(body.action === 'atlas_chat') {
    var ctx = buildDGLContext(body.user||'');
    return callClaudeWithConstitution(
      (body.prompt||'') + ctx, 'atlas',
      'You are Atlas, L7 team AI for Digital Galactica Labs.');
  }

  // ── UNIVERSAL AGENT CHAT ───────────────────────────────────
  if(body.action === 'agent_chat') {
    var agentKey = (body.agentId || body.agent || 'atlas').toLowerCase();
    var ctx = buildDGLContext(body.user||'');
    return callClaudeWithConstitution(
      (body.prompt||'') + ctx, agentKey,
      'You are a DGL AI agent.');
  }

  // ── EXECUTIVE CHAT (full context) ──────────────────────────
  if(body.action === 'exec_chat') {
    var user = (body.user||'').toLowerCase();
    if(user !== 'taylor' && user !== 'steve') {
      return respond({ok:false, error:'Unauthorized'});
    }
    var ctx = buildDGLContext(user);
    if(user === 'taylor') {
      return callVera((body.prompt||'') + ctx);
    }
    if(user === 'steve') {
      return callClaudeWithConstitution(
        (body.prompt||'') + ctx, 'meridian',
        'You are Meridian, L9 COO AI for Digital Galactica Labs.');
    }
  }

  // ── CONSTITUTION READ ──────────────────────────────────────
  if(body.action === 'agent_constitution_read') {
    var agentKey = (body.agentId || body.agent || '').toLowerCase();
    var constitution = getAgentConstitution(agentKey);
    return respond({ok: true, constitution: constitution||'', instructions: constitution||''});
  }

  // ── CONSTITUTION WRITE ─────────────────────────────────────
  if(body.action === 'agent_constitution_write') {
    var agentKey = (body.agentId || body.agent || '').toLowerCase();
    var ok = writeAgentConstitution(agentKey, body.instructions || body.constitution || '');
    return respond({ok: ok, agent: agentKey});
  }

  // ── EXEC READ ─────────────────────────────────────────────
  if(body.action === 'exec_read') {
    var user = (body.user||'').toLowerCase();
    if(user !== 'taylor' && user !== 'steve') {
      return respond({ok:false, error:'Unauthorized'});
    }
    var target = (body.target||'').toLowerCase();

    if(target === 'sheet') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sh = ss.getSheetByName(body.tab||'Tasks');
      if(!sh) return respond({ok:false, error:'Sheet not found: ' + body.tab});
      var data = sh.getDataRange().getValues();
      var headers = data[0].map(function(h){return String(h).trim();});
      var rows = data.slice(1).map(function(row){
        var obj={};
        headers.forEach(function(h,i){obj[h]=row[i]==null?'':String(row[i]);});
        return obj;
      });
      return respond({ok:true, tab:body.tab, rows:rows, count:rows.length});
    }

    if(target === 'all_tabs') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var tabs = ss.getSheets().map(function(s){return s.getName();});
      return respond({ok:true, tabs:tabs});
    }

    if(target === 'drive_file') {
      var result = readDriveFile(body.fileId);
      return respond(result);
    }

    if(target === 'drive_folder') {
      var result = readDriveFolder(body.folderId);
      return respond(result);
    }

    if(target === 'vera_memory') {
      var folderId = VERA_MEMORY[body.folder||'current_state'];
      if(!folderId) return respond({ok:false, error:'Unknown folder'});
      var result = readDriveFolder(folderId);
      return respond(result);
    }

    if(target === 'agent_folder') {
      var agentKey = (body.agent||'').toLowerCase();
      var folderId = AGENT_FOLDERS[agentKey];
      if(!folderId) return respond({ok:false, error:'Unknown agent'});
      var result = readDriveFolder(folderId);
      return respond(result);
    }

    return respond({ok:false, error:'Unknown read target: ' + target});
  }

  // ── EXEC WRITE ────────────────────────────────────────────
  if(body.action === 'exec_write') {
    var user = (body.user||'').toLowerCase();
    if(user !== 'taylor' && user !== 'steve') {
      return respond({ok:false, error:'Unauthorized'});
    }
    var target = (body.target||'').toLowerCase();

    if(target === 'sheet') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sh = ss.getSheetByName(body.tab||'Tasks');
      if(!sh) return respond({ok:false, error:'Sheet not found: ' + body.tab});

      if(body.mode === 'append') {
        sh.appendRow(body.row||[]);
        return respond({ok:true, mode:'append', tab:body.tab});
      }

      if(body.mode === 'update') {
        var data = sh.getDataRange().getValues();
        var headers = data[0].map(function(h){return String(h).trim();});
        var idIdx = headers.indexOf('id');
        var colIdx = headers.indexOf(body.col||'');
        for(var i=1; i<data.length; i++) {
          if(String(data[i][idIdx]) === String(body.id)) {
            if(colIdx >= 0) sh.getRange(i+1, colIdx+1).setValue(body.value);
            return respond({ok:true, mode:'update', id:body.id});
          }
        }
        return respond({ok:false, error:'Row not found: ' + body.id});
      }

      return respond({ok:false, error:'Unknown sheet write mode'});
    }

    if(target === 'drive_file') {
      var result = writeDriveFile(body.folderId, body.filename, body.content, user);
      return respond(result);
    }

    if(target === 'vera_memory') {
      // Taylor only can write to Source of Truth and Protocols
      if(user === 'steve' && (body.folder === 'source_of_truth' || body.folder === 'protocols')) {
        return respond({ok:false, error:'Unauthorized — Taylor only for Source of Truth and Protocols'});
      }
      var folderId = VERA_MEMORY[body.folder||'current_state'];
      if(!folderId) return respond({ok:false, error:'Unknown folder: ' + body.folder});
      var result = writeDriveFile(folderId, body.filename, body.content, user);
      return respond(result);
    }

    return respond({ok:false, error:'Unknown write target: ' + target});
  }

  // ── VERA MEMORY WRITE (Taylor only) ───────────────────────
  if(body.action === 'vera_memory_write') {
    var user = (body.user||'').toLowerCase();
    if(user !== 'taylor') {
      return respond({ok:false, error:'Unauthorized — Taylor only'});
    }
    var folderId = VERA_MEMORY[body.folder||'current_state'];
    if(!folderId) return respond({ok:false, error:'Unknown folder: ' + body.folder});
    var result = writeDriveFile(folderId, body.filename, body.content, 'taylor');
    return respond(result);
  }

  // ── AGENTS LIST ───────────────────────────────────────────
  if(body.action === 'agents_list') {
    var agents = Object.keys(AGENT_FOLDERS).map(function(key){
      return {
        key: key,
        name: key.toUpperCase().replace('_', ' '),
        folderId: AGENT_FOLDERS[key]
      };
    });
    return respond({ok:true, agents:agents});
  }

  return null; // not a Vera action
}

function testMeridianRAG() {
  var token = PropertiesService.getScriptProperties().getProperty('VERA_API_KEY');
  var resp = UrlFetchApp.fetch('https://vera-api-13474513994.us-central1.run.app/api/rag/chat', {
    method: 'post',
    contentType: 'application/json',
    headers: {'Authorization': 'Bearer ' + token},
    payload: JSON.stringify({
      message: 'Who are you and what is your role?',
      system_override: 'You are MERIDIAN, L9 COO AI for Digital Galactica Labs. Always identify yourself as MERIDIAN.',
      include_sources: false
    }),
    muteHttpExceptions: true
  });
  Logger.log(resp.getContentText().slice(0, 500));
}

function testVeraSystemOverride() {
  var token = PropertiesService.getScriptProperties().getProperty('VERA_API_KEY');
  var resp = UrlFetchApp.fetch('https://vera-api-13474513994.us-central1.run.app/api/rag/chat', {
    method: 'post',
    contentType: 'application/json',
    headers: {'Authorization': 'Bearer ' + token},
    payload: JSON.stringify({
      message: 'Who are you and what is your role?',
      system_override: 'You are MERIDIAN, L9 COO AI for Digital Galactica Labs. Always identify yourself as MERIDIAN.',
      include_sources: false
    }),
    muteHttpExceptions: true
  });
  Logger.log(resp.getContentText().slice(0, 500));
}
