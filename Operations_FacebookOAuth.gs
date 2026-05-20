// ── Operations_FacebookOAuth.gs ───────────────────────────────────────────────
// Meta (Facebook + Instagram) OAuth2 authorization code flow
// Gets page access token (permanent) + Instagram business user ID
//
// Script Properties:
//   fb_app_id               — Meta app ID
//   fb_app_secret           — Meta app secret
//   fb_oauth_state          — ephemeral CSRF nonce, deleted after callback
//   fb_user_access_token    — short-lived user token (debug only)
//   fb_long_lived_token     — 60-day user token
//   fb_long_lived_expiry    — epoch ms
//   fb_page_id              — Facebook Page ID (stored after callback)
//   fb_page_access_token    — Page access token (never expires — used by SocialSync)
//   ig_user_id              — Instagram business account ID (used by SocialSync)
//   fb_page_name            — Page name for display

var _FB_VERSION      = 'v25.0';
var _FB_AUTH_URL     = 'https://www.facebook.com/' + _FB_VERSION + '/dialog/oauth';
var _FB_GRAPH_URL    = 'https://graph.facebook.com/' + _FB_VERSION;
var _FB_REDIRECT     = 'https://launch.easychefpro.com/oauth/facebook/callback';
var _FB_SCOPES       = 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish';

// ── 1. getFacebookAuthUrl() ───────────────────────────────────────────────────
function getFacebookAuthUrl() {
  var sp    = PropertiesService.getScriptProperties();
  var appId = sp.getProperty('fb_app_id');
  if (!appId) return { ok: false, error: 'fb_app_id not set. Run facebook_setup first.' };

  var state = Utilities.getUuid();
  sp.setProperty('fb_oauth_state', state);

  var params = [
    ['client_id',     appId],
    ['redirect_uri',  _FB_REDIRECT],
    ['response_type', 'code'],
    ['scope',         _FB_SCOPES],
    ['state',         state]
  ];
  var qs = params.map(function(p) {
    return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]);
  }).join('&');

  Logger.log('[FacebookOAuth] Auth URL generated. state=' + state.substring(0, 8) + '...');
  return {
    ok:       true,
    auth_url: _FB_AUTH_URL + '?' + qs,
    note:     'Open auth_url in browser. Meta will redirect to ' + _FB_REDIRECT
  };
}

// ── 2. handleFacebookCallback(code) ──────────────────────────────────────────
// Full token exchange flow:
//   code → short-lived user token → long-lived (60d) user token → page token → IG user ID
function handleFacebookCallback(code) {
  if (!code) return { ok: false, error: 'Missing authorization code' };

  var sp     = PropertiesService.getScriptProperties();
  var appId  = sp.getProperty('fb_app_id')     || '';
  var secret = sp.getProperty('fb_app_secret') || '';
  if (!appId || !secret) return { ok: false, error: 'fb_app_id or fb_app_secret missing from Script Properties' };

  // Step 1: Exchange code → short-lived user access token
  var tokenResp = UrlFetchApp.fetch(_FB_GRAPH_URL + '/oauth/access_token', {
    method:             'get',
    muteHttpExceptions: true,
    contentType:        'application/x-www-form-urlencoded',
    payload: {
      client_id:     appId,
      client_secret: secret,
      redirect_uri:  _FB_REDIRECT,
      code:          code
    }
  });
  var tokenData = {};
  try { tokenData = JSON.parse(tokenResp.getContentText()); } catch(e) {}
  if (!tokenData.access_token) {
    Logger.log('[FacebookOAuth] Short-lived token exchange failed: ' + tokenResp.getContentText().substring(0, 300));
    return { ok: false, error: 'Token exchange failed: ' + (tokenData.error && tokenData.error.message || tokenResp.getContentText().substring(0, 200)) };
  }
  var shortToken = tokenData.access_token;
  sp.setProperty('fb_user_access_token', shortToken);
  Logger.log('[FacebookOAuth] Short-lived token obtained.');

  // Step 2: Exchange short-lived token → long-lived token (60 days)
  var llResp = UrlFetchApp.fetch(_FB_GRAPH_URL + '/oauth/access_token?grant_type=fb_exchange_token&client_id=' + encodeURIComponent(appId) + '&client_secret=' + encodeURIComponent(secret) + '&fb_exchange_token=' + encodeURIComponent(shortToken), {
    method:             'get',
    muteHttpExceptions: true
  });
  var llData = {};
  try { llData = JSON.parse(llResp.getContentText()); } catch(e) {}
  var longToken = llData.access_token || shortToken;
  var llExpiry  = Date.now() + ((llData.expires_in || 5184000) - 3600) * 1000;
  sp.setProperty('fb_long_lived_token',  longToken);
  sp.setProperty('fb_long_lived_expiry', String(llExpiry));
  Logger.log('[FacebookOAuth] Long-lived token obtained. expires_in=' + (llData.expires_in || 'n/a'));

  // Step 3: Get Pages managed by this user — grab first page with publish access
  var pagesResp = UrlFetchApp.fetch(_FB_GRAPH_URL + '/me/accounts?access_token=' + encodeURIComponent(longToken), {
    muteHttpExceptions: true
  });
  var pagesData = {};
  try { pagesData = JSON.parse(pagesResp.getContentText()); } catch(e) {}
  if (!pagesData.data || !pagesData.data.length) {
    Logger.log('[FacebookOAuth] No pages found: ' + pagesResp.getContentText().substring(0, 300));
    return { ok: false, error: 'No Facebook Pages found for this account. Connect the account that manages the easyChef Pro page.' };
  }

  // Use first page (or find one with MANAGE/ADVERTISE task)
  var page = pagesData.data[0];
  for (var i = 0; i < pagesData.data.length; i++) {
    var tasks = pagesData.data[i].tasks || [];
    if (tasks.indexOf('MANAGE') !== -1 || tasks.indexOf('ADVERTISE') !== -1) {
      page = pagesData.data[i];
      break;
    }
  }
  var pageId          = page.id;
  var pageToken       = page.access_token;
  var pageName        = page.name || '';

  sp.setProperty('fb_page_id',           pageId);
  sp.setProperty('fb_page_access_token', pageToken);
  sp.setProperty('fb_page_name',         pageName);
  Logger.log('[FacebookOAuth] Page stored: ' + pageName + ' (' + pageId + ')');

  // Step 4: Get Instagram business account linked to this page
  var igResp = UrlFetchApp.fetch(_FB_GRAPH_URL + '/' + pageId + '?fields=instagram_business_account&access_token=' + encodeURIComponent(pageToken), {
    muteHttpExceptions: true
  });
  var igData = {};
  try { igData = JSON.parse(igResp.getContentText()); } catch(e) {}
  var igUserId = (igData.instagram_business_account && igData.instagram_business_account.id) || '';
  if (igUserId) {
    sp.setProperty('ig_user_id', igUserId);
    Logger.log('[FacebookOAuth] Instagram user ID stored: ' + igUserId);
  } else {
    Logger.log('[FacebookOAuth] No Instagram business account found for page ' + pageId);
  }

  // Clean up ephemeral state
  sp.deleteProperty('fb_oauth_state');
  sp.deleteProperty('fb_user_access_token');

  return {
    ok:         true,
    page_id:    pageId,
    page_name:  pageName,
    ig_user_id: igUserId || null,
    note:       igUserId
      ? 'Facebook + Instagram connected. fb_page_access_token and ig_user_id stored.'
      : 'Facebook connected. No Instagram business account linked to this page — connect IG to the page in Meta Business Suite first.'
  };
}

// ── 3. facebookConnectionStatus() ────────────────────────────────────────────
function facebookConnectionStatus() {
  var sp       = PropertiesService.getScriptProperties();
  var hasToken = !!sp.getProperty('fb_page_access_token');
  var pageId   = sp.getProperty('fb_page_id')    || '';
  var pageName = sp.getProperty('fb_page_name')  || '';
  var igId     = sp.getProperty('ig_user_id')    || '';
  var hasAppId = !!sp.getProperty('fb_app_id');
  var missing  = [];
  if (!hasAppId) { missing.push('fb_app_id'); missing.push('fb_app_secret'); }
  if (!hasToken) { missing.push('fb_page_access_token (run OAuth flow)'); }
  if (!igId)     { missing.push('ig_user_id (link Instagram to page in Meta Business Suite)'); }
  return {
    connected:      hasToken,
    page_id:        pageId,
    page_name:      pageName,
    ig_user_id:     igId,
    fb_connected:   hasToken,
    ig_connected:   !!igId,
    has_app_id:     hasAppId,
    missing_keys:   missing
  };
}
