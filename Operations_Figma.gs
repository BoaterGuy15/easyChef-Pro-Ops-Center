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
