// ── Operations_YouTubeOAuth.gs ────────────────────────────────────────────────
// YouTube OAuth2 authorization code flow + community post API
// Credentials stored ONLY in Script Properties — never in Sheet or .gs files
//
// Script Properties:
//   youtube_client_id      — Google Cloud Console (easychef-prod----production)
//   youtube_client_secret  — Google Cloud Console
//   youtube_channel_id     — UChFpPCiD1Zn47sk3pe0CF0A
//   youtube_oauth_state    — ephemeral CSRF nonce, deleted after callback
//   youtube_access_token   — ephemeral, auto-refreshed by refreshYouTubeTokenIfNeeded()
//   youtube_token_expiry   — epoch ms
//   youtube_refresh_token  — permanent, written on first authorization

var _YT_AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
var _YT_TOKEN_URL = 'https://oauth2.googleapis.com/token';
var _YT_SCOPES    = 'https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload';
var _YT_REDIRECT  = 'https://launch.easychefpro.com/oauth/youtube/callback';

// ── 1. getYouTubeAuthUrl() ────────────────────────────────────────────────────
// Returns the Google authorization URL for Taylor to visit.
// Stores a CSRF state nonce in Script Properties.
function getYouTubeAuthUrl() {
  var sp       = PropertiesService.getScriptProperties();
  var clientId = sp.getProperty('youtube_client_id');
  if (!clientId) return { ok: false, error: 'youtube_client_id not set in Script Properties. Run youtube_setup first.' };

  var state = Utilities.getUuid();
  sp.setProperty('youtube_oauth_state', state);

  var params = [
    ['client_id',     clientId],
    ['redirect_uri',  _YT_REDIRECT],
    ['response_type', 'code'],
    ['scope',         _YT_SCOPES],
    ['access_type',   'offline'],
    ['prompt',        'consent'],  // always returns refresh_token
    ['state',         state]
  ];
  var qs = params.map(function(p) {
    return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]);
  }).join('&');

  Logger.log('[YouTubeOAuth] Auth URL generated. state=' + state.substring(0, 8) + '...');
  return {
    ok:       true,
    auth_url: _YT_AUTH_URL + '?' + qs,
    note:     'Open auth_url in a browser. Google will redirect to ' + _YT_REDIRECT
  };
}

// ── 2. handleYouTubeOAuthCallback(code) ──────────────────────────────────────
// Called by the Firebase callback page with the authorization code from Google.
// Exchanges code for access_token + refresh_token and stores in Script Properties.
function handleYouTubeOAuthCallback(code) {
  if (!code) return { ok: false, error: 'Missing authorization code' };

  var sp           = PropertiesService.getScriptProperties();
  var clientId     = sp.getProperty('youtube_client_id')     || '';
  var clientSecret = sp.getProperty('youtube_client_secret') || '';
  if (!clientId || !clientSecret) {
    return { ok: false, error: 'youtube_client_id or youtube_client_secret missing from Script Properties' };
  }

  var resp = UrlFetchApp.fetch(_YT_TOKEN_URL, {
    method:             'post',
    contentType:        'application/x-www-form-urlencoded',
    muteHttpExceptions: true,
    payload: {
      code:          code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  _YT_REDIRECT,
      grant_type:    'authorization_code'
    }
  });

  var data = {};
  try { data = JSON.parse(resp.getContentText()); } catch(e) {}

  if (!data.access_token) {
    Logger.log('[YouTubeOAuth] Token exchange failed: ' + resp.getContentText().substring(0, 300));
    return {
      ok:     false,
      error:  'Token exchange failed: ' + (data.error_description || data.error || 'unknown'),
      detail: resp.getContentText().substring(0, 200)
    };
  }

  sp.setProperty('youtube_access_token',  data.access_token);
  sp.setProperty('youtube_token_expiry',  String(Date.now() + (data.expires_in - 60) * 1000));
  if (data.refresh_token) {
    sp.setProperty('youtube_refresh_token', data.refresh_token);
  }
  sp.deleteProperty('youtube_oauth_state');

  var channelId = sp.getProperty('youtube_channel_id') || '';
  Logger.log('[YouTubeOAuth] Tokens stored. channel=' + channelId + ' has_refresh=' + !!data.refresh_token);
  return {
    ok:                true,
    has_refresh_token: !!data.refresh_token,
    expires_in:        data.expires_in,
    channel_id:        channelId
  };
}

// ── 3. refreshYouTubeTokenIfNeeded() ─────────────────────────────────────────
// Returns a valid access token. Auto-refreshes using refresh_token if expired.
// Returns null if not connected (no refresh_token stored).
function refreshYouTubeTokenIfNeeded() {
  var sp     = PropertiesService.getScriptProperties();
  var expiry = parseInt(sp.getProperty('youtube_token_expiry') || '0', 10);
  var cached = sp.getProperty('youtube_access_token');

  if (cached && Date.now() < expiry) return cached;

  var refreshToken = sp.getProperty('youtube_refresh_token') || '';
  var clientId     = sp.getProperty('youtube_client_id')     || '';
  var clientSecret = sp.getProperty('youtube_client_secret') || '';
  if (!refreshToken || !clientId || !clientSecret) return null;

  var resp = UrlFetchApp.fetch(_YT_TOKEN_URL, {
    method:             'post',
    contentType:        'application/x-www-form-urlencoded',
    muteHttpExceptions: true,
    payload: {
      refresh_token: refreshToken,
      client_id:     clientId,
      client_secret: clientSecret,
      grant_type:    'refresh_token'
    }
  });

  var data = {};
  try { data = JSON.parse(resp.getContentText()); } catch(e) {}

  if (!data.access_token) {
    Logger.log('[YouTubeOAuth] Refresh failed: ' + resp.getContentText().substring(0, 200));
    return null;
  }

  sp.setProperty('youtube_access_token', data.access_token);
  sp.setProperty('youtube_token_expiry', String(Date.now() + (data.expires_in - 60) * 1000));
  Logger.log('[YouTubeOAuth] Token refreshed.');
  return data.access_token;
}

// ── 4. postYouTubeCommunity(text, imageUrl) ───────────────────────────────────
// Posts a text or image community post to the configured YouTube channel.
// Community tab must be enabled on the channel (typically requires 500+ subscribers).
// imageUrl: optional HTTPS URL to a public image.
function postYouTubeCommunity(text, imageUrl) {
  var token = refreshYouTubeTokenIfNeeded();
  if (!token) return { ok: false, error: 'Not connected — complete YouTube OAuth flow first' };

  var sp        = PropertiesService.getScriptProperties();
  var channelId = sp.getProperty('youtube_channel_id') || '';
  if (!channelId) return { ok: false, error: 'youtube_channel_id not set in Script Properties' };

  var hasImage = imageUrl && String(imageUrl).indexOf('https://') === 0;
  var snippet  = {
    channelId: channelId,
    text:      String(text || ''),
    type:      hasImage ? 'imagePost' : 'textPost'
  };
  if (hasImage) snippet.images = [{ originalUrl: String(imageUrl) }];

  var resp = UrlFetchApp.fetch('https://www.googleapis.com/youtube/v3/posts?part=id,snippet', {
    method:             'post',
    contentType:        'application/json',
    muteHttpExceptions: true,
    headers:            { Authorization: 'Bearer ' + token },
    payload:            JSON.stringify({ snippet: snippet })
  });

  var code = resp.getResponseCode();
  var body = {};
  try { body = JSON.parse(resp.getContentText()); } catch(e) {}
  Logger.log('[YouTube] POST /posts → ' + code);

  if (code >= 200 && code < 300 && body.id) {
    return { ok: true, post_url: 'https://www.youtube.com/post/' + body.id, post_id: body.id };
  }

  var errMsg = (body.error && body.error.message) || resp.getContentText().substring(0, 300);
  if (code === 403) {
    errMsg = 'Channel not eligible for community posts (Community tab must be enabled — typically 500+ subs). API: ' + errMsg;
  }
  return { ok: false, error: errMsg, http_code: code };
}

// ── Connection status helper ──────────────────────────────────────────────────
function youtubeConnectionStatus() {
  var sp          = PropertiesService.getScriptProperties();
  var hasRefresh  = !!sp.getProperty('youtube_refresh_token');
  var hasClientId = !!sp.getProperty('youtube_client_id');
  var channelId   = sp.getProperty('youtube_channel_id') || '';
  var missing     = [];
  if (!hasClientId) { missing.push('youtube_client_id'); missing.push('youtube_client_secret'); }
  if (!hasRefresh)  { missing.push('youtube_refresh_token (run OAuth flow)'); }
  return {
    connected:     hasRefresh,
    has_client_id: hasClientId,
    channel_id:    channelId,
    missing_keys:  missing
  };
}

// ── Dispatcher wrapper for Operations_SocialSync.gs ──────────────────────────
// postToYouTube(postData) calls this so SocialSync doesn't need to import params
function youtubePostCommunity(postData) {
  var text     = String(postData.body_copy || '');
  var link     = '';
  if (postData.utm_url && String(postData.utm_url).indexOf('http') === 0) {
    link = String(postData.utm_url);
  }
  if (link) text += '\n\n' + link;
  var tags = String(postData.hashtags || '');
  if (tags) text += '\n\n' + tags;
  var imageUrl = String(postData.image_url || '');
  return postYouTubeCommunity(text, imageUrl.indexOf('https://') === 0 ? imageUrl : '');
}
