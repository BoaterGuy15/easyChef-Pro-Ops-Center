// ── Operations_XOAuth.gs ──────────────────────────────────────────────────────
// X (Twitter) OAuth 2.0 authorization code flow with PKCE + tweet publishing
// Credentials stored ONLY in Script Properties — never in Sheet or .gs files
//
// Script Properties:
//   x_client_id       — X Developer app Client ID
//   x_client_secret   — X Developer app Client Secret
//   x_oauth_state     — ephemeral CSRF nonce, deleted after callback
//   x_code_verifier   — PKCE verifier, stored until callback
//   x_access_token    — short-lived (2h), auto-refreshed
//   x_token_expiry    — epoch ms
//   x_refresh_token   — long-lived (offline.access scope)
//   x_user_id         — authenticated user's X ID

var _X_AUTH_URL  = 'https://twitter.com/i/oauth2/authorize';
var _X_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
var _X_SCOPES    = 'tweet.read tweet.write users.read offline.access';
var _X_REDIRECT  = 'https://launch.easychefpro.com/oauth/x/callback';

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function _xCodeVerifier() {
  var raw = Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,'');
  return Utilities.base64EncodeWebSafe(raw).replace(/=+$/,'').substring(0, 64);
}

function _xCodeChallenge(verifier) {
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    verifier,
    Utilities.Charset.US_ASCII
  );
  return Utilities.base64EncodeWebSafe(digest).replace(/=+$/,'');
}

function _xBasicAuth() {
  var sp     = PropertiesService.getScriptProperties();
  var id     = sp.getProperty('x_client_id')     || '';
  var secret = sp.getProperty('x_client_secret') || '';
  return 'Basic ' + Utilities.base64Encode(id + ':' + secret);
}

// ── 1. getXAuthUrl() ──────────────────────────────────────────────────────────
function getXAuthUrl() {
  var sp       = PropertiesService.getScriptProperties();
  var clientId = sp.getProperty('x_client_id');
  if (!clientId) return { ok: false, error: 'x_client_id not set. Run x_setup first.' };

  var state     = Utilities.getUuid();
  var verifier  = _xCodeVerifier();
  var challenge = _xCodeChallenge(verifier);

  sp.setProperty('x_oauth_state',    state);
  sp.setProperty('x_code_verifier',  verifier);

  var params = [
    ['response_type',        'code'],
    ['client_id',            clientId],
    ['redirect_uri',         _X_REDIRECT],
    ['scope',                _X_SCOPES],
    ['state',                state],
    ['code_challenge',       challenge],
    ['code_challenge_method','S256']
  ];
  var qs = params.map(function(p) {
    return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]);
  }).join('&');

  Logger.log('[XOAuth] Auth URL generated. state=' + state.substring(0,8) + '...');
  return {
    ok:       true,
    auth_url: _X_AUTH_URL + '?' + qs,
    note:     'Open auth_url in browser. X will redirect to ' + _X_REDIRECT
  };
}

// ── 2. handleXCallback(code) ─────────────────────────────────────────────────
function handleXCallback(code) {
  if (!code) return { ok: false, error: 'Missing authorization code' };

  var sp       = PropertiesService.getScriptProperties();
  var verifier = sp.getProperty('x_code_verifier') || '';

  var resp = UrlFetchApp.fetch(_X_TOKEN_URL, {
    method:             'post',
    muteHttpExceptions: true,
    headers:            { Authorization: _xBasicAuth() },
    contentType:        'application/x-www-form-urlencoded',
    payload: {
      grant_type:    'authorization_code',
      code:          code,
      redirect_uri:  _X_REDIRECT,
      code_verifier: verifier
    }
  });

  var data = {};
  try { data = JSON.parse(resp.getContentText()); } catch(e) {}

  if (!data.access_token) {
    Logger.log('[XOAuth] Token exchange failed: ' + resp.getContentText().substring(0, 300));
    var errMsg = data.error_description || data.error || 'unknown';
    return { ok: false, error: 'Token exchange failed: ' + errMsg, raw: resp.getContentText().substring(0, 200) };
  }

  var now = Date.now();
  sp.setProperty('x_access_token', data.access_token);
  sp.setProperty('x_token_expiry', String(now + ((data.expires_in || 7200) - 60) * 1000));
  if (data.refresh_token) {
    sp.setProperty('x_refresh_token', data.refresh_token);
  }
  sp.deleteProperty('x_oauth_state');
  sp.deleteProperty('x_code_verifier');

  // Fetch and store user ID
  var userId = '';
  try {
    var meResp = UrlFetchApp.fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: 'Bearer ' + data.access_token },
      muteHttpExceptions: true
    });
    var meData = JSON.parse(meResp.getContentText());
    userId = (meData.data && meData.data.id) || '';
    if (userId) sp.setProperty('x_user_id', userId);
  } catch(e) {}

  Logger.log('[XOAuth] Tokens stored. user_id=' + userId + ' has_refresh=' + !!data.refresh_token);
  return {
    ok:                true,
    user_id:           userId,
    has_refresh_token: !!data.refresh_token,
    expires_in:        data.expires_in
  };
}

// ── 3. refreshXTokenIfNeeded() ────────────────────────────────────────────────
function refreshXTokenIfNeeded() {
  var sp     = PropertiesService.getScriptProperties();
  var expiry = parseInt(sp.getProperty('x_token_expiry') || '0', 10);
  var cached = sp.getProperty('x_access_token');

  if (cached && Date.now() < expiry) return cached;

  var refreshToken = sp.getProperty('x_refresh_token') || '';
  if (!refreshToken) return null;

  var resp = UrlFetchApp.fetch(_X_TOKEN_URL, {
    method:             'post',
    muteHttpExceptions: true,
    headers:            { Authorization: _xBasicAuth() },
    contentType:        'application/x-www-form-urlencoded',
    payload: {
      grant_type:    'refresh_token',
      refresh_token: refreshToken
    }
  });

  var data = {};
  try { data = JSON.parse(resp.getContentText()); } catch(e) {}

  if (!data.access_token) {
    Logger.log('[XOAuth] Refresh failed: ' + resp.getContentText().substring(0, 200));
    return null;
  }

  sp.setProperty('x_access_token', data.access_token);
  sp.setProperty('x_token_expiry', String(Date.now() + ((data.expires_in || 7200) - 60) * 1000));
  if (data.refresh_token) sp.setProperty('x_refresh_token', data.refresh_token);
  Logger.log('[XOAuth] Token refreshed.');
  return data.access_token;
}

// ── 4. postToX(text) ─────────────────────────────────────────────────────────
// Posts a tweet. text can include the link — X auto-cards URLs.
function postToX(text) {
  var token = refreshXTokenIfNeeded();
  if (!token) return { ok: false, error: 'Not connected — complete X OAuth flow first' };

  var tweet = String(text || '').substring(0, 280);

  var resp = UrlFetchApp.fetch('https://api.twitter.com/2/tweets', {
    method:             'post',
    contentType:        'application/json',
    muteHttpExceptions: true,
    headers:            { Authorization: 'Bearer ' + token },
    payload:            JSON.stringify({ text: tweet })
  });

  var code = resp.getResponseCode();
  var body = {};
  try { body = JSON.parse(resp.getContentText()); } catch(e) {}
  Logger.log('[X] POST /2/tweets → ' + code);

  if ((code === 200 || code === 201) && body.data && body.data.id) {
    var sp     = PropertiesService.getScriptProperties();
    var userId = sp.getProperty('x_user_id') || '';
    var url    = userId ? 'https://twitter.com/i/web/status/' + body.data.id : '';
    return { ok: true, platform: 'x', tweet_id: body.data.id, post_url: url };
  }

  var errMsg = (body.detail) || (body.errors && body.errors[0] && body.errors[0].message) || resp.getContentText().substring(0, 300);
  return { ok: false, error: 'HTTP ' + code + ': ' + errMsg, http_code: code };
}

// ── Connection status helper ──────────────────────────────────────────────────
function xConnectionStatus() {
  var sp         = PropertiesService.getScriptProperties();
  var hasRefresh = !!sp.getProperty('x_refresh_token');
  var hasId      = !!sp.getProperty('x_client_id');
  var userId     = sp.getProperty('x_user_id') || '';
  var missing    = [];
  if (!hasId)      { missing.push('x_client_id'); missing.push('x_client_secret'); }
  if (!hasRefresh) { missing.push('x_refresh_token (run OAuth flow)'); }
  return {
    connected:    hasRefresh,
    has_client_id: hasId,
    user_id:      userId,
    missing_keys: missing
  };
}

// ── Dispatcher wrapper (called by Operations_SocialSync postToX) ──────────────
function xPostFromPostData(postData) {
  var text = String(postData.body_copy || postData.caption || '').substring(0, 240);
  var link = '';
  if (postData.utm_url && String(postData.utm_url).indexOf('http') === 0) link = String(postData.utm_url);
  if (link) text = (text + '\n\n' + link).substring(0, 280);
  var tags = String(postData.hashtags || '');
  if (tags && (text + ' ' + tags).length <= 280) text = text + ' ' + tags;
  return postToX(text);
}
