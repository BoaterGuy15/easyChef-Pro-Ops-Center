// ─────────────────────────────────────────────────────────────────────────────
// Operations_Figma.gs
// Figma REST API integration — post comments to specific asset frames.
//
// SETUP: Add FIGMA_ACCESS_TOKEN to Script Properties.
//   Apps Script editor → Project Settings → Script Properties → Add property
//   Key: FIGMA_ACCESS_TOKEN  Value: figd_xxxxxxxxxxxx
//
// To get your token: figma.com → Account Settings → Personal access tokens → Create
// ─────────────────────────────────────────────────────────────────────────────

var _FIGMA_BASE = 'https://api.figma.com/v1';

function _figmaHeaders() {
  var token = PropertiesService.getScriptProperties().getProperty('FIGMA_ACCESS_TOKEN');
  if (!token) throw new Error('FIGMA_ACCESS_TOKEN not set in Script Properties');
  return { 'X-Figma-Token': token, 'Content-Type': 'application/json' };
}

// ── URL parser ────────────────────────────────────────────────────────────────
// Handles both formats:
//   https://www.figma.com/file/{fileId}/...?node-id={nodeId}
//   https://www.figma.com/design/{fileId}/...?node-id={nodeId}

function _parseFigmaUrl(url) {
  if (!url) return null;
  var fileMatch = url.match(/figma\.com\/(?:file|design)\/([A-Za-z0-9_-]+)/);
  if (!fileMatch) return null;
  var fileId = fileMatch[1];
  var nodeMatch = url.match(/[?&]node-id=([^&]+)/);
  var nodeId = nodeMatch ? decodeURIComponent(nodeMatch[1]).replace(/-/g, ':') : null;
  return { fileId: fileId, nodeId: nodeId };
}

// ── figmaPostComment ──────────────────────────────────────────────────────────
// Posts a comment to a Figma file (optionally pinned to a specific frame node).
// figmaUrl — value from ContentCalendar.figma_export_url
// comment  — the text to post

function figmaPostComment(figmaUrl, comment) {
  if (!figmaUrl) return { ok: false, error: 'figma_url required' };
  if (!comment || !String(comment).trim()) return { ok: false, error: 'comment text required' };
  try {
    var parsed = _parseFigmaUrl(figmaUrl);
    if (!parsed) return { ok: false, error: 'Cannot parse Figma URL: ' + figmaUrl };

    var endpoint = _FIGMA_BASE + '/files/' + parsed.fileId + '/comments';
    var body = { message: String(comment).trim() };
    if (parsed.nodeId) {
      body.client_meta = { node_id: parsed.nodeId, node_offset: { x: 0, y: 0 } };
    }

    var resp = UrlFetchApp.fetch(endpoint, {
      method:             'POST',
      headers:            _figmaHeaders(),
      payload:            JSON.stringify(body),
      muteHttpExceptions: true
    });

    var code = resp.getResponseCode();
    var data = {};
    try { data = JSON.parse(resp.getContentText()); } catch(pe) {}

    if (code === 200 || code === 201) {
      Logger.log('[figmaPostComment] posted to ' + parsed.fileId + (parsed.nodeId ? ' node ' + parsed.nodeId : ''));
      return { ok: true, comment_id: data.id || '', file_id: parsed.fileId };
    }
    var errMsg = (data.err || data.message || ('HTTP ' + code));
    Logger.log('[figmaPostComment] error: ' + errMsg);
    return { ok: false, error: 'Figma API: ' + errMsg };
  } catch(e) {
    Logger.log('[figmaPostComment] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Token expiry management ───────────────────────────────────────────────────
// figmaRecordTokenExpiry — safe to call via doPost (no ScriptApp).
// Stamps FIGMA_TOKEN_EXPIRES in Script Properties.
// The cockpit checks this on every load and shows an in-app banner when ≤14 days remain.
//
// Optional email trigger (run once from Apps Script editor, not via doPost):
//   _setupFigmaExpiryTrigger() — creates a weekly trigger that calls figmaCheckTokenExpiry.

function figmaRecordTokenExpiry(daysValid) {
  daysValid = daysValid || 90;
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + daysValid);
  PropertiesService.getScriptProperties().setProperty('FIGMA_TOKEN_EXPIRES', expiry.toISOString());
  Logger.log('[figmaRecordTokenExpiry] Token expires: ' + expiry.toDateString());
  return { ok: true, expires: expiry.toISOString(), days_valid: daysValid };
}

// figmaTokenStatus — returns days remaining and expired flag. Called by doPost check_figma_token.
function figmaTokenStatus() {
  var expiryStr = PropertiesService.getScriptProperties().getProperty('FIGMA_TOKEN_EXPIRES');
  if (!expiryStr) return { ok: true, set: false, days_left: null, expired: false };
  var expiry   = new Date(expiryStr);
  var daysLeft = Math.floor((expiry - new Date()) / (1000 * 60 * 60 * 24));
  return { ok: true, set: true, days_left: daysLeft, expired: daysLeft <= 0, expires: expiry.toISOString() };
}

// ── Optional: email alert trigger (run once from Apps Script editor) ──────────
// Requires script.scriptapp + mail.send scopes — do NOT call via doPost.
// Add those scopes temporarily in appsscript.json, run this, then remove them.
function _setupFigmaExpiryTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'figmaCheckTokenExpiry') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('figmaCheckTokenExpiry').timeBased().everyWeeks(1).create();
  Logger.log('[_setupFigmaExpiryTrigger] Weekly trigger created.');
}

function figmaCheckTokenExpiry() {
  var expiryStr = PropertiesService.getScriptProperties().getProperty('FIGMA_TOKEN_EXPIRES');
  if (!expiryStr) return;
  var expiry   = new Date(expiryStr);
  var daysLeft = Math.floor((expiry - new Date()) / (1000 * 60 * 60 * 24));
  Logger.log('[figmaCheckTokenExpiry] Days until expiry: ' + daysLeft);
  if (daysLeft > 14) return;

  var subject = daysLeft <= 0
    ? 'Figma API token EXPIRED — easyChef Ops'
    : 'Figma API token expires in ' + daysLeft + ' day' + (daysLeft !== 1 ? 's' : '') + ' — easyChef Ops';
  var body =
    'Your Figma personal access token ' + (daysLeft <= 0 ? 'has expired' : 'expires in ' + daysLeft + ' days') + '.\n\n' +
    'Steps:\n' +
    '1. Figma → Account Settings → Personal access tokens → Create new token\n' +
    '2. Apps Script → Project Settings → Script Properties → update FIGMA_ACCESS_TOKEN\n' +
    '3. Run figmaRecordTokenExpiry() from the editor to reset the 90-day clock\n\n' +
    'Token expiry date: ' + expiry.toDateString();

  try {
    MailApp.sendEmail({ to: 'Taylor@gatehouseassets.com', subject: subject, body: body });
    Logger.log('[figmaCheckTokenExpiry] Alert sent — ' + daysLeft + ' days left.');
  } catch(e) {
    Logger.log('[figmaCheckTokenExpiry] Email error: ' + e.message);
  }
}

// ── Diagnostic ────────────────────────────────────────────────────────────────
// Run _testFigma() from Apps Script editor to verify token and connection.
function _testFigma() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('FIGMA_ACCESS_TOKEN');
  Logger.log('FIGMA_ACCESS_TOKEN: ' + (token ? 'YES (' + token.length + ' chars)' : 'MISSING'));
  if (!token) { Logger.log('Set FIGMA_ACCESS_TOKEN in Script Properties to proceed.'); return; }

  // Test: fetch current user
  var resp = UrlFetchApp.fetch(_FIGMA_BASE + '/me', {
    method: 'GET', headers: _figmaHeaders(), muteHttpExceptions: true
  });
  var code = resp.getResponseCode();
  if (code === 200) {
    var me = JSON.parse(resp.getContentText());
    Logger.log('Connected as: ' + me.handle + ' (' + me.email + ')');
  } else {
    Logger.log('Auth failed: HTTP ' + code + ' — ' + resp.getContentText().slice(0,200));
  }
}
