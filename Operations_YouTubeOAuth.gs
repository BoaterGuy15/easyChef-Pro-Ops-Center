// ── Operations_YouTubeOAuth.gs ────────────────────────────────────────────────
// YouTube OAuth2 authorization code flow + community post API
// Credentials stored ONLY in Script Properties — never in Sheet or .gs files
//
// Script Properties used:
//   youtube_client_id      — from Google Cloud Console (easychef-prod----production)
//   youtube_client_secret  — from Google Cloud Console
//   youtube_channel_id     — UChFpPCiD1Zn47sk3pe0CF0A (already set)
//   youtube_oauth_state    — ephemeral nonce, deleted after callback
//   youtube_access_token   — ephemeral, auto-refreshed
//   youtube_token_expiry   — epoch ms, managed by youtubeGetAccessToken()
//   youtube_refresh_token  — permanent, set on first authorization

var _YT_AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
var _YT_TOKEN_URL = 'https://oauth2.googleapis.com/token';
var _YT_SCOPE     = 'https://www.googleapis.com/auth/youtube';

// Redirect URI — must exactly match what's registered in Google Cloud Console
// Primary: launch subdomain (pre-launch); fallback: main domain (post-launch)
var _YT_REDIRECT  = 'https://launch.easychefpro.com/oauth/youtube/callback';

// ── Auth URL generation ───────────────────────────────────────────────────────
function youtubeAuthStart() {
  var sp       = PropertiesService.getScriptProperties();
  var clientId = sp.getProperty('youtube_client_id');
  if (!clientId) return { ok: false, error: 'youtube_client_id not set in Script Properties' };

  var state = Utilities.getUuid();
  sp.setProperty('youtube_oauth_state', state);

  var params = [
    ['client_id',     clientId],
    ['redirect_uri',  _YT_REDIRECT],
    ['response_type', 'code'],
    ['scope',         _YT_SCOPE],
    ['access_type',   'offline'],
    ['prompt',        'consent'],  // force consent so we always get a refresh_token
    ['state',         state]
  ];
  var qs = params.map(function(p) {
    return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]);
  }).join('&');

  return {
    ok:       true,
    auth_url: _YT_AUTH_URL + '?' + qs,
    state:    state,
    note:     'Open auth_url in browser. Google will redirect to ' + _YT_REDIRECT
  };
}

// ── Token exchange (called from callback page via youtube_auth_callback action) ──
function youtubeAuthCallback(code, state) {
  if (!code)  return { ok: false, error: 'Missing authorization code' };
  if (!state) return { ok: false, error: 'Missing state parameter' };

  var sp         = PropertiesService.getScriptProperties();
  var savedState = sp.getProperty('youtube_oauth_state');
  if (!savedState || savedState !== state) {
    return { ok: false, error: 'Invalid OAuth state — session may have expired. Start the flow again.' };
  }

  var clientId     = sp.getProperty('youtube_client_id')     || '';
  var clientSecret = sp.getProperty('youtube_client_secret') || '';
  if (!clientId || !clientSecret) {
    return { ok: false, error: 'youtube_client_id or youtube_client_secret missing from Script Properties' };
  }

  var resp = UrlFetchApp.fetch(_YT_TOKEN_URL, {
    method:            'post',
    contentType:       'application/x-www-form-urlencoded',
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
    Logger.log('[YouTubeOAuth] Token exchange failed: ' + resp.getContentText());
    return { ok: false, error: 'Token exchange failed', detail: data.error_description || data.error || resp.getContentText().substring(0, 200) };
  }

  sp.setProperty('youtube_access_token',  data.access_token);
  sp.setProperty('youtube_token_expiry',  String(Date.now() + (data.expires_in - 60) * 1000));
  if (data.refresh_token) {
    sp.setProperty('youtube_refresh_token', data.refresh_token);
  }
  sp.deleteProperty('youtube_oauth_state');

  var channelId = sp.getProperty('youtube_channel_id') || '';
  Logger.log('[YouTubeOAuth] Connected. channel_id=' + channelId + ' has_refresh=' + !!data.refresh_token);
  return {
    ok:               true,
    has_refresh_token: !!data.refresh_token,
    expires_in:       data.expires_in,
    channel_id:       channelId
  };
}

// ── Access token (auto-refresh) ───────────────────────────────────────────────
function youtubeGetAccessToken() {
  var sp     = PropertiesService.getScriptProperties();
  var expiry = parseInt(sp.getProperty('youtube_token_expiry') || '0', 10);
  var cached = sp.getProperty('youtube_access_token');

  if (cached && Date.now() < expiry) return cached;

  var refreshToken = sp.getProperty('youtube_refresh_token');
  var clientId     = sp.getProperty('youtube_client_id')     || '';
  var clientSecret = sp.getProperty('youtube_client_secret') || '';
  if (!refreshToken || !clientId || !clientSecret) return null;

  var resp = UrlFetchApp.fetch(_YT_TOKEN_URL, {
    method:            'post',
    contentType:       'application/x-www-form-urlencoded',
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
  return data.access_token;
}

// ── Connection status ─────────────────────────────────────────────────────────
function youtubeConnectionStatus() {
  var sp           = PropertiesService.getScriptProperties();
  var hasRefresh   = !!sp.getProperty('youtube_refresh_token');
  var hasClientId  = !!sp.getProperty('youtube_client_id');
  var channelId    = sp.getProperty('youtube_channel_id') || '';
  return {
    connected:  hasRefresh,
    has_client_id: hasClientId,
    channel_id: channelId,
    missing_keys: [
      (!hasClientId     ? 'youtube_client_id'     : null),
      (!hasClientId     ? 'youtube_client_secret' : null),
      (!hasRefresh      ? 'youtube_refresh_token (run OAuth flow)' : null)
    ].filter(Boolean)
  };
}

// ── Community post ────────────────────────────────────────────────────────────
// YouTube community posts require the channel's Community tab to be enabled
// (typically requires 500+ subscribers). Returns {ok, post_url, error}.
function youtubePostCommunity(postData) {
  var token = youtubeGetAccessToken();
  if (!token) return { ok: false, error: 'Not connected — run YouTube OAuth flow first' };

  var sp        = PropertiesService.getScriptProperties();
  var channelId = sp.getProperty('youtube_channel_id') || String(postData.channel_id || '');
  if (!channelId) return { ok: false, error: 'youtube_channel_id not set in Script Properties' };

  var text = String(postData.body_copy || '');
  var link = '';
  if (postData.utm_url && String(postData.utm_url).indexOf('http') === 0) {
    link = String(postData.utm_url);
  }
  if (link) text += '\n\n' + link;
  var tags = String(postData.hashtags || '');
  if (tags) text += '\n\n' + tags;

  var imageUrl = String(postData.image_url || '');
  var hasImage = imageUrl.indexOf('http') === 0;

  var snippet = {
    channelId: channelId,
    text:      text,
    type:      hasImage ? 'imagePost' : 'textPost'
  };
  if (hasImage) {
    snippet.images = [{ originalUrl: imageUrl }];
  }

  var resp = UrlFetchApp.fetch('https://www.googleapis.com/youtube/v3/posts?part=id,snippet', {
    method:            'post',
    contentType:       'application/json',
    muteHttpExceptions: true,
    headers:           { Authorization: 'Bearer ' + token },
    payload:           JSON.stringify({ snippet: snippet })
  });

  var code = resp.getResponseCode();
  var body = {};
  try { body = JSON.parse(resp.getContentText()); } catch(e) {}
  Logger.log('[YouTube] POST /posts → ' + code);

  if (code >= 200 && code < 300 && body.id) {
    var postUrl = 'https://www.youtube.com/post/' + body.id;
    return { ok: true, post_url: postUrl, post_id: body.id };
  }

  // Surface the most helpful error message
  var errMsg = (body.error && body.error.message) || resp.getContentText().substring(0, 300);
  if (code === 403) {
    errMsg = 'Channel not eligible for community posts (need Community tab enabled — typically 500+ subscribers). Error: ' + errMsg;
  }
  return { ok: false, error: errMsg, code: code };
}
