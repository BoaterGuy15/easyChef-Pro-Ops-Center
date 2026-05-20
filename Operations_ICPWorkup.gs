// ─────────────────────────────────────────────────────────────────────────────
// Operations_ICPWorkup.gs
// Reads ICP Workup Google Docs from Drive folder, extracts structured profile
// data using Claude, and writes to the ICPProfiles tab.
//
// Action: read_icp_workup_folder
// Run before any LP generation to confirm ICP app features are loaded.
// ─────────────────────────────────────────────────────────────────────────────

var ICP_WORKUP_FOLDER_ID = '1OFyrFVwAjDawfZfWHYErsuwDCct-TT93';

/**
 * Lists all Google Docs in the ICP Workup folder, reads each one,
 * extracts structured ICP data using Claude, and writes to ICPProfiles tab.
 * Returns a summary of what was processed and any new fields flagged.
 */
function readICPWorkupFolder(body) {
  body = body || {};
  var folderId = body.folder_id || ICP_WORKUP_FOLDER_ID;
  var token    = ScriptApp.getOAuthToken();
  var processed = [];
  var newFields = [];
  var knownFields = _CC_HDR.ICPProfiles;

  var folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch(e) {
    return { ok: false, error: 'Cannot open folder: ' + e.message };
  }

  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    if (file.getMimeType() !== 'application/vnd.google-apps.document') continue;

    var fileName = file.getName();
    var fileId   = file.getId();

    try {
      // Export doc as plain text
      var exportResp = UrlFetchApp.fetch(
        'https://www.googleapis.com/drive/v3/files/' + fileId + '/export?mimeType=text/plain',
        { headers: { 'Authorization': 'Bearer ' + token }, muteHttpExceptions: true }
      );
      if (exportResp.getResponseCode() !== 200) {
        processed.push({ file: fileName, ok: false, reason: 'Export failed: HTTP ' + exportResp.getResponseCode() });
        continue;
      }
      var docText = exportResp.getContentText('UTF-8');

      // Extract ICP fields via Claude
      var extracted = _extractICPFromDoc(docText, fileName);
      if (!extracted || !extracted.id) {
        processed.push({ file: fileName, ok: false, reason: 'Claude extraction returned no id' });
        continue;
      }

      // Flag any extracted fields not in the current tab headers
      Object.keys(extracted).forEach(function(k) {
        if (knownFields.indexOf(k) === -1 && newFields.indexOf(k) === -1) {
          newFields.push(k);
        }
      });

      // Write to ICPProfiles tab
      setIcpProfile(extracted);
      processed.push({ file: fileName, ok: true, id: extracted.id, name: extracted.name });

    } catch(e) {
      processed.push({ file: fileName, ok: false, reason: e.message });
    }
  }

  return {
    ok:        true,
    processed: processed,
    total:     processed.length,
    succeeded: processed.filter(function(r) { return r.ok; }).length,
    newFields: newFields,
    note:      newFields.length > 0
      ? 'New fields found but not yet in tab headers: ' + newFields.join(', ')
      : 'All extracted fields have tab columns'
  };
}

/**
 * Calls Claude to extract structured ICP data from raw document text.
 * Returns a plain object with ICP fields, or null on failure.
 */
function _extractICPFromDoc(docText, fileName) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return null;

  var prompt = 'You are extracting ICP (Ideal Customer Profile) data from a workup document.\n\n' +
    'Document name: ' + fileName + '\n\n' +
    'Document content (first 8000 chars):\n' +
    docText.substring(0, 8000) + '\n\n' +
    'Extract the following fields and return ONLY a valid JSON object. Use snake_case keys. ' +
    'If a field is not present in the doc, use an empty string.\n\n' +
    'Required fields:\n' +
    '- id: unique identifier (lowercase, underscores, derived from name, e.g. "super_mom")\n' +
    '- name: display name of this ICP\n' +
    '- code: short code (same as id)\n' +
    '- status: "Active" or "Draft"\n' +
    '- demographics: demographic description\n' +
    '- psychographics: psychographic profile\n' +
    '- primary_pain: primary pain point\n' +
    '- secondary_pain: secondary pain point\n' +
    '- value_trigger: what triggers their purchase or signup decision\n' +
    '- loss_aversion: what they fear losing\n' +
    '- channel_affinity: preferred marketing channels\n' +
    '- message_hierarchy: message priority order\n' +
    '- conversion_triggers: what closes the deal\n' +
    '- app_features: which easyChef Pro features they will use most\n' +
    '- entry_moment: the specific moment they first need the app\n' +
    '- health_goals: their health and nutrition goals\n' +
    '- dietary_preferences: dietary restrictions or preferences\n' +
    '- shopping_behavior: how they shop for groceries\n\n' +
    'Return ONLY the JSON object. No explanation, no markdown.';

  try {
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method:  'post',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json'
      },
      payload: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages:   [{ role: 'user', content: prompt }]
      }),
      muteHttpExceptions: true
    });

    if (resp.getResponseCode() !== 200) return null;

    var result  = JSON.parse(resp.getContentText());
    var content = result.content && result.content[0] ? result.content[0].text : '';
    var jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);

  } catch(e) {
    Logger.log('_extractICPFromDoc error: ' + e.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GAS-side website file patcher
// Reads website source files from Google Drive, applies copy changes,
// writes back — no local base64 decode needed.
// ─────────────────────────────────────────────────────────────────────────────

var WEBSITE_PAGES_FOLDER = '191CxYbULIalJe5YXp7q_tJtc2CYn_Wgz';

var WEBSITE_FILE_IDS = {
  'app.astro':          '1KClTy14JI0nNNBbaaON4VLqJ82m2aQcf',
  'index.astro':        '1ROo1Tp-vqthW9oXBm_ivlsuFlUucifl1',
  'coming-soon.astro':  '1P_S0r9IzHKwjPwElSHT8H66lRalWGBtu',
  'about-us.astro':     '16TQh2u2z6ARE86qN5zrsqukpCXRGJWao'
};

/**
 * Patches one or all website source files in Google Drive.
 * body.file: optional — patch only this file ('app.astro', 'index.astro', etc.)
 * body.content: optional — if provided, overwrite the file with this content directly
 * Returns { ok, results }
 */
function patchWebsiteFiles(body) {
  body = body || {};
  var token   = ScriptApp.getOAuthToken();
  var results = {};

  var targets = body.file ? [body.file] : Object.keys(WEBSITE_FILE_IDS);

  targets.forEach(function(fileName) {
    var fileId = WEBSITE_FILE_IDS[fileName];
    if (!fileId) { results[fileName] = { ok: false, error: 'Unknown file' }; return; }

    try {
      // If content is provided directly, just upload it
      if (body.content && body.file === fileName) {
        results[fileName] = _driveOverwrite(token, fileId, body.content);
        return;
      }

      // Otherwise download, patch, and re-upload
      var dlResp = UrlFetchApp.fetch(
        'https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media',
        { headers: { 'Authorization': 'Bearer ' + token }, muteHttpExceptions: true }
      );
      if (dlResp.getResponseCode() !== 200) {
        results[fileName] = { ok: false, error: 'Download failed: HTTP ' + dlResp.getResponseCode() };
        return;
      }

      var text = dlResp.getContentText('UTF-8');
      var before = text;
      text = _applyPatches(fileName, text);
      var changed = text !== before;

      var patchResult = changed ? _driveOverwrite(token, fileId, text) : { ok: true, skipped: true, reason: 'No matching strings found — already patched or different content' };
      patchResult.changed = changed;
      results[fileName] = patchResult;

    } catch(e) {
      results[fileName] = { ok: false, error: e.message };
    }
  });

  var allOk = Object.keys(results).every(function(k) { return results[k].ok; });
  return { ok: allOk, results: results };
}

function _driveOverwrite(token, fileId, textContent) {
  var resp = UrlFetchApp.fetch(
    'https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media',
    {
      method:  'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'text/plain; charset=utf-8' },
      payload: Utilities.newBlob(textContent, 'text/plain').getBytes(),
      muteHttpExceptions: true
    }
  );
  var code = resp.getResponseCode();
  return code === 200
    ? { ok: true, code: code }
    : { ok: false, code: code, error: resp.getContentText().substring(0, 300) };
}

function _applyPatches(fileName, text) {
  if (fileName === 'app.astro') {
    // Change 1: hero body
    text = text.replace(
      'Nine capabilities in one system, each solving a part of your food life —\n        scoring, personalizing, planning, shopping, tracking — all connected.\n        No other app does this.',
      'Nine capabilities. One system. Scoring, personalizing, planning, shopping, tracking, all connected.\n        No other app does this.'
    );
    // Change 2: aria-label
    text = text.replace('aria-label="Join the first 1,000"', 'aria-label="Join the first 5,000"');
    // Change 3: h2
    text = text.replace('>Join the first 1,000</h2>', '>Join the first 5,000</h2>');
    // Change 4: body paragraph
    text = text.replace(
      'The first 1,000 members get lifetime Pro access at 60% off, priority mobile\n        app access when we launch on iOS and Android, and a direct line to the\n        founding team.',
      'Lifetime Pro at 60% off. Priority access when we launch on iOS and Android.\n        A direct line to the team building it.'
    );
  }
  // coming-soon.astro and about-us.astro patches added here when content is confirmed
  return text;
}
