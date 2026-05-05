// ─────────────────────────────────────────────────────────────────────────────
// ADD THESE FUNCTIONS TO YOUR EXISTING Operations.gs
// Do NOT replace the existing file — paste these into it.
// ─────────────────────────────────────────────────────────────────────────────

// SETTINGS_SHEET and SETTINGS_HEADERS defined in Settings.gs.

function getSettingsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS_SHEET);
    sheet.getRange(1, 1, 1, SETTINGS_HEADERS.length).setValues([SETTINGS_HEADERS]);
    sheet.getRange(1, 1, 1, SETTINGS_HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function getSettings() {
  var sheet = getSettingsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var rows = sheet.getRange(2, 1, lastRow - 1, SETTINGS_HEADERS.length).getValues();
  return rows
    .filter(function(r) { return r[0] && r[1] && r[2] !== '__delete__' && r[3] !== '__delete__'; })
    .map(function(r) {
      return { type: r[0], key: r[1], value: r[2], meta: r[3], updatedAt: r[4] };
    });
}

function setSetting(type, key, value, meta) {
  if (!type || !key) return;
  var sheet = getSettingsSheet();
  var lastRow = sheet.getLastRow();
  var now = new Date().toISOString();

  // Handle delete
  if (meta === '__delete__') {
    if (lastRow >= 2) {
      var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      for (var i = 0; i < data.length; i++) {
        if (data[i][0] === type && data[i][1] === key) {
          sheet.deleteRow(i + 2);
          return;
        }
      }
    }
    return;
  }

  // Upsert: find existing row
  if (lastRow >= 2) {
    var existing = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var j = 0; j < existing.length; j++) {
      if (existing[j][0] === type && existing[j][1] === key) {
        sheet.getRange(j + 2, 1, 1, SETTINGS_HEADERS.length)
          .setValues([[type, key, value, meta || '', now]]);
        return;
      }
    }
  }

  // Append new row
  sheet.appendRow([type, key, value, meta || '', now]);
}

// ── ADD TO doGet switch/if block ──────────────────────────────────────────────
// In your existing doGet(e) function, add this case:
//
//   if (action === 'settings_read') {
//     return json({ ok: true, settings: getSettings() });
//   }
//
//   if (action === 'agent_constitution_read') {
//     return json(agentConstitutionRead(e.parameter.agent));
//   }

// ── ADD TO doPost switch/if block ─────────────────────────────────────────────
// In your existing doPost(e) function, add this case:
//
//   if (body.action === 'settings_write') {
//     setSetting(body.type, body.key, body.value, body.meta || '');
//     return json({ ok: true });
//   }
//
//   if (body.action === 'agent_constitution_write') {
//     return json(agentConstitutionWrite(body.agent, body.instructions));
//   }

// ─────────────────────────────────────────────────────────────────────────────
// Agent Constitution helpers — store constitutions in the Settings sheet
// type = 'agent_constitution', key = agent name, value = instructions text
// ─────────────────────────────────────────────────────────────────────────────

function agentConstitutionRead(agent) {
  if (!agent) return { ok: false, error: 'agent is required' };
  var rows = getSettings();
  var row = rows.filter(function(r) { return r.type === 'agent_constitution' && r.key === agent; })[0];
  return { ok: true, agent: agent, instructions: row ? row.value : '' };
}

function agentConstitutionWrite(agent, instructions) {
  if (!agent) return { ok: false, error: 'agent is required' };
  setSetting('agent_constitution', agent, instructions || '', '');
  return { ok: true, agent: agent };
}
