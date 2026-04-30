// ─────────────────────────────────────────────────────────────────────────────
// Operations_Agents.gs — Dynamic agent registry + chat + constitution I/O
// ─────────────────────────────────────────────────────────────────────────────
// ADD TO doGet switch/if block:
//
//   if (action === 'agents_list') return json(agentsList());
//
// ADD TO doPost switch/if block:
//
//   if (body.action === 'agent_chat')               return json(agentChat(body.agentId, body.prompt, body.conversationHistory));
//   if (body.action === 'agent_constitution_read')  return json(agentConstitutionRead(body.agentId));
//   if (body.action === 'agent_constitution_write') return json(agentConstitutionWrite(body.agentId, body.instructions));
// ─────────────────────────────────────────────────────────────────────────────

var VERA_AGENTS_FOLDER_ID = '1ZZsSnNG2Ba6dFJ09e6EWyr7lNcDUF2O-';

// ── Registry ─────────────────────────────────────────────────────────────────

function _getAgentRegistryFile() {
  var folder = DriveApp.getFolderById(VERA_AGENTS_FOLDER_ID);
  var files = folder.getFilesByName('AGENT_REGISTRY.json');
  return files.hasNext() ? files.next() : null;
}

function agentsList() {
  var file = _getAgentRegistryFile();
  if (!file) return { ok: true, agents: [] };
  try {
    var data = JSON.parse(file.getBlob().getDataAsString());
    var agents = Array.isArray(data) ? data : (data.agents || []);
    return { ok: true, agents: agents };
  } catch (e) {
    return { ok: false, error: e.message, agents: [] };
  }
}

function _getAgentEntry(agentName) {
  if (!agentName) return null;
  var reg = agentsList();
  return (reg.agents || []).filter(function (a) {
    return a.id === agentName || a.name === agentName || a.displayName === agentName;
  })[0] || null;
}

function _getAgentFolder(agentName) {
  var entry = _getAgentEntry(agentName);
  if (!entry || !entry.folderId) return null;
  try { return DriveApp.getFolderById(entry.folderId); } catch (e) { return null; }
}

// ── Constitution read / write ─────────────────────────────────────────────────

function _isVeraAgent(agentId) {
  var n = (agentId || '').toLowerCase();
  return n === 'vera' || n === 'prime' || n === 'c-001';
}

// agentId matches the dropdown name (e.g. "Vera", "Meridian", "EasyChef Code")
function agentConstitutionRead(agentId) {
  if (!agentId) return { ok: false, error: 'agentId is required' };

  var isVera = _isVeraAgent(agentId);
  var subFolderName = isVera ? '00_CURRENT_STATE' : '01_SOURCE_OF_TRUTH';
  var fileName      = isVera ? 'SYSTEM_PROMPT.md'  : 'CONSTITUTION.md';

  var agentFolder = _getAgentFolder(agentId);
  if (!agentFolder) return { ok: true, agentId: agentId, constitution: '' };

  try {
    var subs = agentFolder.getFoldersByName(subFolderName);
    if (!subs.hasNext()) return { ok: true, agentId: agentId, constitution: '' };
    var sub = subs.next();
    var files = sub.getFilesByName(fileName);
    if (!files.hasNext()) return { ok: true, agentId: agentId, constitution: '' };
    return { ok: true, agentId: agentId, constitution: files.next().getBlob().getDataAsString() };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function agentConstitutionWrite(agentId, instructions) {
  if (!agentId) return { ok: false, error: 'agentId is required' };

  var isVera = _isVeraAgent(agentId);
  var subFolderName = isVera ? '00_CURRENT_STATE' : '01_SOURCE_OF_TRUTH';
  var fileName      = isVera ? 'SYSTEM_PROMPT.md'  : 'CONSTITUTION.md';

  var agentFolder = _getAgentFolder(agentId);
  if (!agentFolder) return { ok: false, error: 'Agent folder not found in registry for: ' + agentId };

  try {
    var subs = agentFolder.getFoldersByName(subFolderName);
    var sub  = subs.hasNext() ? subs.next() : agentFolder.createFolder(subFolderName);
    var files = sub.getFilesByName(fileName);
    if (files.hasNext()) {
      files.next().setContent(instructions || '');
    } else {
      sub.createFile(fileName, instructions || '', MimeType.PLAIN_TEXT);
    }
    return { ok: true, agentId: agentId, constitution: instructions || '' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── Universal agent chat ─────────────────────────────────────────────────────

function agentChat(agentId, prompt, conversationHistory) {
  if (!agentId || !prompt) return { ok: false, error: 'agentId and prompt are required' };

  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set in Script Properties' };

  // Vera / PRIME / C-001 routes to Vera RAG endpoint
  var isVera = agentId === 'PRIME' || agentId === 'C-001' || agentId === 'Vera';
  if (isVera) {
    var veraUrl = props.getProperty('VERA_RAG_URL');
    if (!veraUrl) return { ok: false, error: 'VERA_RAG_URL not set in Script Properties' };
    try {
      var veraResp = UrlFetchApp.fetch(veraUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({ prompt: prompt }),
        muteHttpExceptions: true
      });
      var veraData = JSON.parse(veraResp.getContentText());
      return { ok: true, reply: veraData.reply || veraData.response || veraData.text || '' };
    } catch (e) {
      return { ok: false, error: 'Vera RAG error: ' + e.message };
    }
  }

  // All other agents: read constitution → call Claude
  var constitResp = agentConstitutionRead(agentId);
  var systemPrompt = constitResp.instructions
    || ('You are ' + agentId + ', a DGL AI agent. Help the team with their work on the easyChef Pro launch.');

  var messages = [];
  if (Array.isArray(conversationHistory)) {
    conversationHistory.slice(-8).forEach(function (m) {
      if (m.role && m.content) messages.push({ role: m.role, content: m.content });
    });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages
      }),
      muteHttpExceptions: true
    });
    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply && data.error) return { ok: false, error: typeof data.error === 'object' ? data.error.message : data.error };
    return { ok: true, reply: reply };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
