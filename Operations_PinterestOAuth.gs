// ── Operations_PinterestOAuth.gs ──────────────────────────────────────────────
// Pinterest OAuth2 authorization code flow with PKCE + pin publishing
// Credentials stored ONLY in Script Properties — never in Sheet or .gs files
//
// Script Properties:
//   pinterest_app_id        — Pinterest Developer app ID
//   pinterest_app_secret    — Pinterest Developer app secret
//   pinterest_oauth_state   — ephemeral CSRF nonce, deleted after callback
//   pinterest_code_verifier — PKCE verifier, stored until callback
//   pinterest_access_token  — 30-day access token
//   pinterest_token_expiry  — epoch ms
//   pinterest_refresh_token — long-lived (365 days)
//   pinterest_refresh_expiry— epoch ms
//   pinterest_board_id      — target board for pin posts

var _PN_AUTH_URL  = 'https://www.pinterest.com/oauth/';
var _PN_TOKEN_URL = 'https://api.pinterest.com/v5/oauth/token';
var _PN_SCOPES    = 'boards:read,pins:write';
var _PN_REDIRECT  = 'https://launch.easychefpro.com/oauth/pinterest/callback';

// ── PKCE helpers (same pattern as TikTok) ────────────────────────────────────

function _pnCodeVerifier() {
  var raw = Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,'');
  return Utilities.base64EncodeWebSafe(raw).replace(/=+$/,'').substring(0, 64);
}

function _pnCodeChallenge(verifier) {
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    verifier,
    Utilities.Charset.US_ASCII
  );
  return Utilities.base64EncodeWebSafe(digest).replace(/=+$/,'');
}

function _pnBasicAuth() {
  var sp     = PropertiesService.getScriptProperties();
  var id     = sp.getProperty('pinterest_app_id')     || '';
  var secret = sp.getProperty('pinterest_app_secret') || '';
  return 'Basic ' + Utilities.base64Encode(id + ':' + secret);
}

// ── 1. getPinterestAuthUrl() ──────────────────────────────────────────────────
function getPinterestAuthUrl() {
  var sp    = PropertiesService.getScriptProperties();
  var appId = sp.getProperty('pinterest_app_id');
  if (!appId) return { ok: false, error: 'pinterest_app_id not set. Run pinterest_setup first.' };

  var state     = Utilities.getUuid();
  var verifier  = _pnCodeVerifier();
  var challenge = _pnCodeChallenge(verifier);

  sp.setProperty('pinterest_oauth_state',    state);
  sp.setProperty('pinterest_code_verifier',  verifier);

  var params = [
    ['client_id',            appId],
    ['redirect_uri',         _PN_REDIRECT],
    ['response_type',        'code'],
    ['scope',                _PN_SCOPES],
    ['state',                state],
    ['code_challenge',       challenge],
    ['code_challenge_method','S256']
  ];
  var qs = params.map(function(p) {
    return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]);
  }).join('&');

  Logger.log('[PinterestOAuth] Auth URL generated. state=' + state.substring(0,8) + '...');
  return {
    ok:       true,
    auth_url: _PN_AUTH_URL + '?' + qs,
    note:     'Open auth_url in browser. Pinterest will redirect to ' + _PN_REDIRECT
  };
}

// ── 2. handlePinterestCallback(code) ─────────────────────────────────────────
function handlePinterestCallback(code) {
  if (!code) return { ok: false, error: 'Missing authorization code' };

  var sp       = PropertiesService.getScriptProperties();
  var verifier = sp.getProperty('pinterest_code_verifier') || '';

  var resp = UrlFetchApp.fetch(_PN_TOKEN_URL, {
    method:             'post',
    muteHttpExceptions: true,
    headers:            { Authorization: _pnBasicAuth() },
    contentType:        'application/x-www-form-urlencoded',
    payload: {
      grant_type:    'authorization_code',
      code:          code,
      redirect_uri:  _PN_REDIRECT,
      code_verifier: verifier
    }
  });

  var data = {};
  try { data = JSON.parse(resp.getContentText()); } catch(e) {}

  if (!data.access_token) {
    Logger.log('[PinterestOAuth] Token exchange failed: ' + resp.getContentText().substring(0, 300));
    var errMsg = data.error_description || data.message || data.error || 'unknown';
    return { ok: false, error: 'Token exchange failed: ' + errMsg, raw: resp.getContentText().substring(0, 200) };
  }

  var now = Date.now();
  sp.setProperty('pinterest_access_token',  data.access_token);
  sp.setProperty('pinterest_token_expiry',  String(now + ((data.expires_in || 2592000) - 120) * 1000));
  if (data.refresh_token) {
    sp.setProperty('pinterest_refresh_token',  data.refresh_token);
    sp.setProperty('pinterest_refresh_expiry', String(now + ((data.refresh_token_expires_in || 31536000) - 3600) * 1000));
  }
  sp.deleteProperty('pinterest_oauth_state');
  sp.deleteProperty('pinterest_code_verifier');

  Logger.log('[PinterestOAuth] Tokens stored. has_refresh=' + !!data.refresh_token);
  return {
    ok:                true,
    has_refresh_token: !!data.refresh_token,
    expires_in:        data.expires_in,
    scope:             data.scope || _PN_SCOPES
  };
}

// ── 3. refreshPinterestTokenIfNeeded() ───────────────────────────────────────
function refreshPinterestTokenIfNeeded() {
  var sp     = PropertiesService.getScriptProperties();
  var expiry = parseInt(sp.getProperty('pinterest_token_expiry') || '0', 10);
  var cached = sp.getProperty('pinterest_access_token');

  if (cached && Date.now() < expiry) return cached;

  var refreshToken = sp.getProperty('pinterest_refresh_token') || '';
  if (!refreshToken) return null;

  var resp = UrlFetchApp.fetch(_PN_TOKEN_URL, {
    method:             'post',
    muteHttpExceptions: true,
    headers:            { Authorization: _pnBasicAuth() },
    contentType:        'application/x-www-form-urlencoded',
    payload: {
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
      scope:         _PN_SCOPES
    }
  });

  var data = {};
  try { data = JSON.parse(resp.getContentText()); } catch(e) {}

  if (!data.access_token) {
    Logger.log('[PinterestOAuth] Refresh failed: ' + resp.getContentText().substring(0, 200));
    return null;
  }

  sp.setProperty('pinterest_access_token', data.access_token);
  sp.setProperty('pinterest_token_expiry', String(Date.now() + ((data.expires_in || 2592000) - 120) * 1000));
  if (data.refresh_token) {
    sp.setProperty('pinterest_refresh_token',  data.refresh_token);
    sp.setProperty('pinterest_refresh_expiry', String(Date.now() + ((data.refresh_token_expires_in || 31536000) - 3600) * 1000));
  }
  Logger.log('[PinterestOAuth] Token refreshed.');
  return data.access_token;
}

// ── 4. postToPinterest(imageUrl, title, description, link) ───────────────────
// Creates a Pin on the configured board.
// imageUrl: public HTTPS URL to the image.
// title:    pin title (max 100 chars).
// description: pin description / caption (max 500 chars).
// link:     destination URL (LP or UTM link).
function postToPinterest(imageUrl, title, description, link) {
  var token = refreshPinterestTokenIfNeeded();
  if (!token) return { ok: false, error: 'Not connected — complete Pinterest OAuth flow first' };

  var sp      = PropertiesService.getScriptProperties();
  var boardId = sp.getProperty('pinterest_board_id') || '';
  if (!boardId) return { ok: false, error: 'pinterest_board_id not set. Run pinterest_setup with board_id.' };

  var payload = {
    board_id:     boardId,
    title:        String(title        || '').substring(0, 100),
    description:  String(description  || '').substring(0, 500),
    link:         String(link         || ''),
    media_source: {
      source_type: 'image_url',
      url:         String(imageUrl)
    }
  };

  var resp = UrlFetchApp.fetch('https://api.pinterest.com/v5/pins', {
    method:             'post',
    contentType:        'application/json',
    muteHttpExceptions: true,
    headers:            { Authorization: 'Bearer ' + token },
    payload:            JSON.stringify(payload)
  });

  var code = resp.getResponseCode();
  var body = {};
  try { body = JSON.parse(resp.getContentText()); } catch(e) {}
  Logger.log('[Pinterest] POST /v5/pins → ' + code);

  if ((code === 200 || code === 201) && body.id) {
    return { ok: true, platform: 'pinterest', pin_id: body.id, post_url: 'https://www.pinterest.com/pin/' + body.id + '/' };
  }

  var errMsg = (body.message) || (body.error && body.error.message) || resp.getContentText().substring(0, 300);
  return { ok: false, error: 'HTTP ' + code + ': ' + errMsg, http_code: code };
}

// ── Connection status helper ──────────────────────────────────────────────────
function pinterestConnectionStatus() {
  var sp         = PropertiesService.getScriptProperties();
  var hasRefresh = !!sp.getProperty('pinterest_refresh_token');
  var hasAppId   = !!sp.getProperty('pinterest_app_id');
  var boardId    = sp.getProperty('pinterest_board_id') || '';
  var missing    = [];
  if (!hasAppId)   { missing.push('pinterest_app_id'); missing.push('pinterest_app_secret'); }
  if (!hasRefresh) { missing.push('pinterest_refresh_token (run OAuth flow)'); }
  if (!boardId)    { missing.push('pinterest_board_id'); }
  return {
    connected:   hasRefresh && !!boardId,
    has_app_id:  hasAppId,
    board_id:    boardId,
    missing_keys: missing
  };
}

// ── Dispatcher wrapper (called by Operations_SocialSync postToPinterest) ──────
function pinterestPostFromPostData(postData) {
  var imageUrl    = String(postData.image_url  || '');
  var title       = String(postData.hook_text  || postData.caption || '').substring(0, 100);
  var description = String(postData.body_copy  || postData.caption || '').substring(0, 500);
  var tags        = String(postData.hashtags   || '');
  if (tags) description = (description + ' ' + tags).substring(0, 500);
  var link = '';
  if (postData.utm_url && String(postData.utm_url).indexOf('http') === 0) link = String(postData.utm_url);
  return postToPinterest(imageUrl, title, description, link);
}
