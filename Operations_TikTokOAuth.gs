// ── Operations_TikTokOAuth.gs ─────────────────────────────────────────────────
// TikTok OAuth2 authorization code flow with PKCE + video publishing
// Credentials stored ONLY in Script Properties — never in Sheet or .gs files
//
// Script Properties:
//   tiktok_client_key      — TikTok Developer app client_key
//   tiktok_client_secret   — TikTok Developer app client_secret
//   tiktok_oauth_state     — ephemeral CSRF nonce, deleted after callback
//   tiktok_code_verifier   — PKCE verifier, stored until callback
//   tiktok_access_token    — short-lived (24h), auto-refreshed
//   tiktok_token_expiry    — epoch ms
//   tiktok_refresh_token   — long-lived (365 days)
//   tiktok_refresh_expiry  — epoch ms
//   tiktok_open_id         — user's TikTok open ID (set on first auth)

var _TT_AUTH_URL   = 'https://www.tiktok.com/v2/auth/authorize/';
var _TT_TOKEN_URL  = 'https://open.tiktokapis.com/v2/oauth/token/';
var _TT_SCOPES     = 'video.upload,video.publish';
var _TT_REDIRECT   = 'https://launch.easychefpro.com/oauth/tiktok/callback';

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function _ttCodeVerifier() {
  // 64-char URL-safe base64 string built from two UUIDs
  var raw = Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,'');
  return Utilities.base64EncodeWebSafe(raw).replace(/=+$/,'').substring(0, 64);
}

function _ttCodeChallenge(verifier) {
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    verifier,
    Utilities.Charset.US_ASCII
  );
  return Utilities.base64EncodeWebSafe(digest).replace(/=+$/,'');
}

// ── 1. getTikTokAuthUrl() ─────────────────────────────────────────────────────
// Returns the TikTok authorization URL for Taylor to visit.
// Stores CSRF state + PKCE verifier in Script Properties.
function getTikTokAuthUrl() {
  var sp        = PropertiesService.getScriptProperties();
  var clientKey = sp.getProperty('tiktok_client_key');
  if (!clientKey) return { ok: false, error: 'tiktok_client_key not set in Script Properties. Run tiktok_setup first.' };

  var state    = Utilities.getUuid();
  var verifier = _ttCodeVerifier();
  var challenge = _ttCodeChallenge(verifier);

  sp.setProperty('tiktok_oauth_state',    state);
  sp.setProperty('tiktok_code_verifier',  verifier);

  var params = [
    ['client_key',             clientKey],
    ['redirect_uri',           _TT_REDIRECT],
    ['response_type',          'code'],
    ['scope',                  _TT_SCOPES],
    ['state',                  state],
    ['code_challenge',         challenge],
    ['code_challenge_method',  'S256']
  ];
  var qs = params.map(function(p) {
    return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]);
  }).join('&');

  Logger.log('[TikTokOAuth] Auth URL generated. state=' + state.substring(0,8) + '...');
  return {
    ok:       true,
    auth_url: _TT_AUTH_URL + '?' + qs,
    note:     'Open auth_url in browser. TikTok will redirect to ' + _TT_REDIRECT
  };
}

// ── 2. handleTikTokCallback(code) ─────────────────────────────────────────────
// Called by the Firebase callback page with the authorization code from TikTok.
// Exchanges code for access_token + refresh_token and stores in Script Properties.
function handleTikTokCallback(code) {
  if (!code) return { ok: false, error: 'Missing authorization code' };

  var sp           = PropertiesService.getScriptProperties();
  var clientKey    = sp.getProperty('tiktok_client_key')    || '';
  var clientSecret = sp.getProperty('tiktok_client_secret') || '';
  var verifier     = sp.getProperty('tiktok_code_verifier') || '';

  if (!clientKey || !clientSecret) {
    return { ok: false, error: 'tiktok_client_key or tiktok_client_secret missing from Script Properties' };
  }

  var resp = UrlFetchApp.fetch(_TT_TOKEN_URL, {
    method:             'post',
    contentType:        'application/x-www-form-urlencoded',
    muteHttpExceptions: true,
    payload: {
      client_key:    clientKey,
      client_secret: clientSecret,
      code:          code,
      grant_type:    'authorization_code',
      redirect_uri:  _TT_REDIRECT,
      code_verifier: verifier
    }
  });

  var data = {};
  try { data = JSON.parse(resp.getContentText()); } catch(e) {}

  // TikTok wraps response in {data: {...}, error: {...}}
  var d = data.data || data;
  if (!d.access_token) {
    Logger.log('[TikTokOAuth] Token exchange failed: ' + resp.getContentText().substring(0, 300));
    var errMsg = (data.error && data.error.message) || data.error_description || data.message || 'unknown';
    return { ok: false, error: 'Token exchange failed: ' + errMsg, raw: resp.getContentText().substring(0, 200) };
  }

  var now = Date.now();
  sp.setProperty('tiktok_access_token',   d.access_token);
  sp.setProperty('tiktok_token_expiry',   String(now + (d.expires_in - 60) * 1000));
  sp.setProperty('tiktok_open_id',        d.open_id || '');
  if (d.refresh_token) {
    sp.setProperty('tiktok_refresh_token',  d.refresh_token);
    sp.setProperty('tiktok_refresh_expiry', String(now + ((d.refresh_expires_in || 31536000) - 3600) * 1000));
  }
  sp.deleteProperty('tiktok_oauth_state');
  sp.deleteProperty('tiktok_code_verifier');

  Logger.log('[TikTokOAuth] Tokens stored. open_id=' + (d.open_id || '?') + ' has_refresh=' + !!d.refresh_token);
  return {
    ok:                true,
    open_id:           d.open_id || '',
    has_refresh_token: !!d.refresh_token,
    expires_in:        d.expires_in,
    scope:             d.scope || _TT_SCOPES
  };
}

// ── 3. refreshTikTokTokenIfNeeded() ──────────────────────────────────────────
// Returns a valid access token. Auto-refreshes if expired.
// Returns null if not connected (no refresh_token stored).
function refreshTikTokTokenIfNeeded() {
  var sp     = PropertiesService.getScriptProperties();
  var expiry = parseInt(sp.getProperty('tiktok_token_expiry') || '0', 10);
  var cached = sp.getProperty('tiktok_access_token');

  if (cached && Date.now() < expiry) return cached;

  var refreshToken = sp.getProperty('tiktok_refresh_token') || '';
  var clientKey    = sp.getProperty('tiktok_client_key')    || '';
  var clientSecret = sp.getProperty('tiktok_client_secret') || '';
  if (!refreshToken || !clientKey || !clientSecret) return null;

  var resp = UrlFetchApp.fetch(_TT_TOKEN_URL, {
    method:             'post',
    contentType:        'application/x-www-form-urlencoded',
    muteHttpExceptions: true,
    payload: {
      client_key:    clientKey,
      client_secret: clientSecret,
      grant_type:    'refresh_token',
      refresh_token: refreshToken
    }
  });

  var data = {};
  try { data = JSON.parse(resp.getContentText()); } catch(e) {}
  var d = data.data || data;

  if (!d.access_token) {
    Logger.log('[TikTokOAuth] Refresh failed: ' + resp.getContentText().substring(0, 200));
    return null;
  }

  sp.setProperty('tiktok_access_token', d.access_token);
  sp.setProperty('tiktok_token_expiry', String(Date.now() + (d.expires_in - 60) * 1000));
  if (d.refresh_token) {
    sp.setProperty('tiktok_refresh_token',  d.refresh_token);
    sp.setProperty('tiktok_refresh_expiry', String(Date.now() + ((d.refresh_expires_in || 31536000) - 3600) * 1000));
  }
  Logger.log('[TikTokOAuth] Token refreshed.');
  return d.access_token;
}

// ── 4. postToTikTok(videoUrl, caption) ───────────────────────────────────────
// Publishes a video to TikTok via Content Posting API v2 (PULL_FROM_URL).
// videoUrl: public HTTPS URL to the video file TikTok will pull.
// caption:  post caption (max 2200 chars). Hashtags included here.
// Note: TikTok pulls the video asynchronously — no upload binary needed from GAS.
function postToTikTok(videoUrl, caption) {
  var token = refreshTikTokTokenIfNeeded();
  if (!token) return { ok: false, error: 'Not connected — complete TikTok OAuth flow first' };

  if (!videoUrl || String(videoUrl).indexOf('https://') !== 0) {
    return { ok: false, error: 'videoUrl must be a public HTTPS URL' };
  }

  var payload = {
    post_info: {
      title:           String(caption || '').substring(0, 150),
      description:     String(caption || '').substring(0, 2200),
      privacy_level:   'PUBLIC_TO_EVERYONE',
      disable_duet:    false,
      disable_stitch:  false,
      disable_comment: false
    },
    source_info: {
      source:    'PULL_FROM_URL',
      video_url: String(videoUrl)
    }
  };

  var resp = UrlFetchApp.fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method:             'post',
    contentType:        'application/json; charset=UTF-8',
    muteHttpExceptions: true,
    headers:            { Authorization: 'Bearer ' + token },
    payload:            JSON.stringify(payload)
  });

  var code = resp.getResponseCode();
  var body = {};
  try { body = JSON.parse(resp.getContentText()); } catch(e) {}
  Logger.log('[TikTok] POST /post/publish/video/init/ → ' + code);

  var d = body.data || body;
  if ((code === 200 || code === 201) && d.publish_id) {
    return { ok: true, platform: 'tiktok', publish_id: d.publish_id, post_url: '' };
  }

  var errMsg = (body.error && body.error.message) || (d.error && d.error.message) || resp.getContentText().substring(0, 300);
  return { ok: false, error: 'HTTP ' + code + ': ' + errMsg, http_code: code };
}

// ── Connection status helper ──────────────────────────────────────────────────
function tiktokConnectionStatus() {
  var sp         = PropertiesService.getScriptProperties();
  var hasRefresh = !!sp.getProperty('tiktok_refresh_token');
  var hasKey     = !!sp.getProperty('tiktok_client_key');
  var openId     = sp.getProperty('tiktok_open_id') || '';
  var missing    = [];
  if (!hasKey)     { missing.push('tiktok_client_key'); missing.push('tiktok_client_secret'); }
  if (!hasRefresh) { missing.push('tiktok_refresh_token (run OAuth flow)'); }
  return {
    connected:    hasRefresh,
    has_client_key: hasKey,
    open_id:      openId,
    missing_keys: missing
  };
}

// ── Dispatcher wrapper (called by Operations_SocialSync postToTikTok) ─────────
function tiktokPostFromPostData(postData) {
  var videoUrl = String(postData.image_url || postData.video_url || '');
  var caption  = String(postData.body_copy || '');
  var link     = '';
  if (postData.utm_url && String(postData.utm_url).indexOf('http') === 0) link = String(postData.utm_url);
  if (link) caption += '\n\n' + link;
  var tags = String(postData.hashtags || '');
  if (tags) caption += '\n\n' + tags;
  return postToTikTok(videoUrl, caption);
}
