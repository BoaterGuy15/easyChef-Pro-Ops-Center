// ── Operations_SocialSync.gs ──────────────────────────────────────────────────
// Social media posting pipeline — Meta (FB+IG), TikTok, Pinterest, YouTube, X
// ALL credentials stored in Script Properties — never in Sheet or .gs files
//
// Script Properties keys required per platform:
//   facebook:  fb_page_id · fb_page_access_token
//   instagram: ig_user_id · fb_page_access_token  (shared FB token)
//   tiktok:    tiktok_access_token · tiktok_open_id
//   pinterest: pinterest_access_token · pinterest_board_id
//   youtube:   youtube_access_token · youtube_channel_id
//   x:         x_api_key · x_api_secret · x_access_token · x_access_secret

var _SOCIAL_API = {
  facebook:  'https://graph.facebook.com/v19.0',
  instagram: 'https://graph.facebook.com/v19.0',
  tiktok:    'https://open.tiktokapis.com/v2',
  pinterest: 'https://api.pinterest.com/v5',
  youtube:   'https://www.googleapis.com/youtube/v3',
  x:         'https://api.twitter.com/2'
};

var _SOCIAL_CRED_KEYS = {
  facebook:  ['fb_page_id', 'fb_page_access_token'],
  instagram: ['ig_user_id', 'fb_page_access_token'],
  tiktok:    ['tiktok_access_token', 'tiktok_open_id'],
  pinterest: ['pinterest_access_token', 'pinterest_board_id'],
  youtube:   ['youtube_access_token', 'youtube_channel_id'],
  x:         ['x_api_key', 'x_api_secret', 'x_access_token', 'x_access_secret']
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function _ssp(key) {
  return PropertiesService.getScriptProperties().getProperty(key) || '';
}

function _socialFetch(url, options) {
  try {
    options.muteHttpExceptions = true;
    var resp = UrlFetchApp.fetch(url, options);
    var code = resp.getResponseCode();
    var text = resp.getContentText();
    var json = {};
    try { json = JSON.parse(text); } catch(e) {}
    Logger.log('[SocialSync] ' + (options.method || 'GET').toUpperCase() + ' ' + url.substring(0, 80) + ' → ' + code);
    return { ok: code >= 200 && code < 300, code: code, body: json, raw: text.substring(0, 400) };
  } catch(e) {
    return { ok: false, code: 0, body: {}, raw: e.message };
  }
}

function _socialReadPost(postId) {
  try {
    var sh   = _getCCSheet(_CC_TAB.SOCIAL);
    var hdrs = _CC_HDR.SocialPosts;
    var last = sh.getLastRow();
    if (last < 2) return null;
    var rows = sh.getRange(2, 1, last - 1, hdrs.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(postId)) {
        var obj = {};
        hdrs.forEach(function(h, j) { obj[h] = rows[i][j]; });
        obj._rowIndex = i + 2;
        return obj;
      }
    }
  } catch(e) { Logger.log('[SocialSync] _socialReadPost: ' + e.message); }
  return null;
}

function _socialUpdatePost(postId, updates) {
  try {
    var sh   = _getCCSheet(_CC_TAB.SOCIAL);
    var hdrs = _CC_HDR.SocialPosts;
    var last = sh.getLastRow();
    if (last < 2) return false;
    var ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(postId)) {
        var rowNum = i + 2;
        Object.keys(updates).forEach(function(key) {
          var col = hdrs.indexOf(key);
          if (col !== -1) sh.getRange(rowNum, col + 1).setValue(updates[key]);
        });
        return true;
      }
    }
  } catch(e) { Logger.log('[SocialSync] _socialUpdatePost: ' + e.message); }
  return false;
}

function _socialGetPosts(campaignId, statuses) {
  try {
    var sh   = _getCCSheet(_CC_TAB.SOCIAL);
    var hdrs = _CC_HDR.SocialPosts;
    var last = sh.getLastRow();
    if (last < 2) return [];
    var rows = sh.getRange(2, 1, last - 1, hdrs.length).getValues();
    return rows.reduce(function(acc, r) {
      var obj = {};
      hdrs.forEach(function(h, j) { obj[h] = r[j]; });
      var matchCampaign = !campaignId || String(obj.campaign_id) === campaignId;
      var matchStatus   = !statuses || !statuses.length || statuses.indexOf(String(obj.status)) !== -1;
      if (matchCampaign && matchStatus) acc.push(obj);
      return acc;
    }, []);
  } catch(e) { return []; }
}

function _socialBuildLink(postData) {
  if (postData.utm_url && String(postData.utm_url).indexOf('http') === 0) return String(postData.utm_url);
  var base = _cvtReadSetting('lp_url_a') || 'https://launch.easychefpro.com';
  if (postData.dl_id) {
    return base + '?dl_id=' + encodeURIComponent(postData.dl_id)
      + '&utm_source=' + encodeURIComponent(String(postData.platform || 'social').toLowerCase())
      + '&utm_medium=social&utm_campaign=ec-2026-001';
  }
  return base;
}

function _socialBuildText(postData, maxLen) {
  var body = String(postData.body_copy || '');
  var tags = String(postData.hashtags  || '');
  var link = _socialBuildLink(postData);
  var text = body;
  if (link) text += '\n\n' + link;
  if (tags) text += '\n\n' + tags;
  if (maxLen && text.length > maxLen) text = text.substring(0, maxLen - 3) + '...';
  return text;
}

// ── PLATFORM: Facebook ────────────────────────────────────────────────────────
function postToFacebook(postData) {
  var pageId = _ssp('fb_page_id');
  var token  = _ssp('fb_page_access_token');
  if (!pageId || !token) return { ok: false, error: 'fb_page_id or fb_page_access_token missing from Script Properties' };

  var message = _socialBuildText(postData);
  var hasImage = postData.image_url && String(postData.image_url).indexOf('http') === 0;

  if (hasImage) {
    var r = _socialFetch(_SOCIAL_API.facebook + '/' + pageId + '/photos', {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({ url: String(postData.image_url), caption: message, access_token: token })
    });
    if (r.ok) return { ok: true, platform: 'facebook', post_id: r.body.id || '', post_url: 'https://www.facebook.com/' + pageId + '/posts/' + (r.body.post_id || r.body.id || '') };
    return { ok: false, error: 'HTTP ' + r.code + ': ' + r.raw };
  }

  var r2 = _socialFetch(_SOCIAL_API.facebook + '/' + pageId + '/feed', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ message: message, link: _socialBuildLink(postData), access_token: token })
  });
  if (r2.ok) return { ok: true, platform: 'facebook', post_id: r2.body.id || '', post_url: 'https://www.facebook.com/' + (r2.body.id || '').replace('_', '/posts/') };
  return { ok: false, error: 'HTTP ' + r2.code + ': ' + r2.raw };
}

// ── PLATFORM: Instagram ───────────────────────────────────────────────────────
// Two-step: create container → publish. image_url required for feed posts.
function postToInstagram(postData) {
  var igId  = _ssp('ig_user_id');
  var token = _ssp('fb_page_access_token');
  if (!igId || !token) return { ok: false, error: 'ig_user_id or fb_page_access_token missing from Script Properties' };
  if (!postData.image_url || String(postData.image_url).indexOf('http') !== 0) {
    return { ok: false, error: 'Instagram feed posts require image_url (public HTTPS URL)' };
  }

  var caption = _socialBuildText(postData);
  var r1 = _socialFetch(_SOCIAL_API.instagram + '/' + igId + '/media', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ image_url: String(postData.image_url), caption: caption, access_token: token })
  });
  if (!r1.ok || !r1.body.id) return { ok: false, error: 'Container failed HTTP ' + r1.code + ': ' + r1.raw };

  var r2 = _socialFetch(_SOCIAL_API.instagram + '/' + igId + '/media_publish', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ creation_id: r1.body.id, access_token: token })
  });
  if (r2.ok && r2.body.id) return { ok: true, platform: 'instagram', post_id: r2.body.id, post_url: 'https://www.instagram.com/p/' + r2.body.id + '/' };
  return { ok: false, error: 'Publish failed HTTP ' + r2.code + ': ' + r2.raw };
}

// ── PLATFORM: TikTok ──────────────────────────────────────────────────────────
// Uses Content Posting API v2 — requires TikTok Developer approval + Creator account.
// Supports photo posts via PULL_FROM_URL.
function postToTikTok(postData) {
  var token  = _ssp('tiktok_access_token');
  var openId = _ssp('tiktok_open_id');
  if (!token || !openId) return { ok: false, error: 'tiktok_access_token or tiktok_open_id missing from Script Properties' };

  var hasImage = postData.image_url && String(postData.image_url).indexOf('http') === 0;
  if (!hasImage) return { ok: false, error: 'TikTok posting requires image_url or video_url. Text-only not supported.' };

  var caption = _socialBuildText(postData, 2200);
  var payload = {
    post_info: {
      title:            caption.substring(0, 150),
      description:      caption,
      privacy_level:    'PUBLIC_TO_EVERYONE',
      disable_duet:     false,
      disable_stitch:   false,
      disable_comment:  false
    },
    source_info: {
      source:              'PULL_FROM_URL',
      photo_cover_index:   0,
      photo_images:        [String(postData.image_url)]
    },
    post_mode:   'DIRECT_POST',
    media_type:  'PHOTO'
  };
  var r = _socialFetch(_SOCIAL_API.tiktok + '/post/publish/content/init/', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: { Authorization: 'Bearer ' + token }
  });
  if (r.ok && r.body.data) return { ok: true, platform: 'tiktok', post_id: r.body.data.publish_id || '', post_url: '' };
  return { ok: false, error: 'HTTP ' + r.code + ': ' + r.raw };
}

// ── PLATFORM: Pinterest ───────────────────────────────────────────────────────
// Creates a Pin on the configured board. image_url strongly recommended.
function postToPinterest(postData) {
  var token   = _ssp('pinterest_access_token');
  var boardId = _ssp('pinterest_board_id');
  if (!token || !boardId) return { ok: false, error: 'pinterest_access_token or pinterest_board_id missing from Script Properties' };

  var imageUrl = postData.image_url && String(postData.image_url).indexOf('http') === 0
    ? String(postData.image_url)
    : 'https://launch.easychefpro.com/assets/og-image.jpg';

  var payload = {
    board_id:     boardId,
    title:        String(postData.hook || postData.body_copy || '').substring(0, 100),
    description:  String(postData.body_copy || ''),
    link:         _socialBuildLink(postData),
    media_source: { source_type: 'image_url', url: imageUrl }
  };
  var r = _socialFetch(_SOCIAL_API.pinterest + '/pins', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: { Authorization: 'Bearer ' + token }
  });
  if (r.ok && r.body.id) return { ok: true, platform: 'pinterest', post_id: r.body.id, post_url: 'https://www.pinterest.com/pin/' + r.body.id + '/' };
  return { ok: false, error: 'HTTP ' + r.code + ': ' + r.raw };
}

// ── PLATFORM: YouTube ─────────────────────────────────────────────────────────
// Posts a Community (text) post. Video upload requires resumable upload — set up separately.
// NOTE: Community posts require a channel with 500+ subscribers and eligibility.
function postToYouTube(postData) {
  var token     = _ssp('youtube_access_token');
  var channelId = _ssp('youtube_channel_id');
  if (!token || !channelId) return { ok: false, error: 'youtube_access_token or youtube_channel_id missing from Script Properties' };

  var text = _socialBuildText(postData);
  var r = _socialFetch('https://www.googleapis.com/youtube/v3/communityPosts?part=snippet', {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({ snippet: { type: 'textOriginal', textOriginal: { text: text } } }),
    headers: { Authorization: 'Bearer ' + token }
  });
  if (r.ok && r.body.id) return { ok: true, platform: 'youtube', post_id: r.body.id, post_url: 'https://www.youtube.com/post/' + r.body.id };
  return { ok: false, error: 'HTTP ' + r.code + ': ' + r.raw };
}

// ── PLATFORM: X / Twitter ─────────────────────────────────────────────────────
// Posts a tweet via Twitter API v2 with OAuth 1.0a (User Context).
function postToX(postData) {
  var apiKey    = _ssp('x_api_key');
  var apiSecret = _ssp('x_api_secret');
  var token     = _ssp('x_access_token');
  var tokenSec  = _ssp('x_access_secret');
  if (!apiKey || !apiSecret || !token || !tokenSec) {
    return { ok: false, error: 'x_api_key / x_api_secret / x_access_token / x_access_secret missing from Script Properties' };
  }
  var text = _socialBuildText(postData, 280);
  var url  = 'https://api.twitter.com/2/tweets';
  var body = JSON.stringify({ text: text });
  var auth = _xBuildOAuth1Header('POST', url, {}, apiKey, apiSecret, token, tokenSec);
  var r = _socialFetch(url, {
    method: 'post', contentType: 'application/json',
    payload: body, headers: { Authorization: auth }
  });
  if (r.ok && r.body.data && r.body.data.id) {
    return { ok: true, platform: 'x', post_id: r.body.data.id, post_url: 'https://x.com/i/web/status/' + r.body.data.id };
  }
  return { ok: false, error: 'HTTP ' + r.code + ': ' + r.raw };
}

// ── OAuth 1.0a helper for X ───────────────────────────────────────────────────
function _xBuildOAuth1Header(method, url, extraParams, ck, cs, tk, ts) {
  var nonce = Utilities.base64Encode(Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    String(Math.random()) + String(Date.now())
  )).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  var oauthP = {
    oauth_consumer_key:     ck,
    oauth_nonce:            nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp:        String(Math.floor(Date.now() / 1000)),
    oauth_token:            tk,
    oauth_version:          '1.0'
  };
  var all = {};
  Object.keys(extraParams).forEach(function(k) { all[k] = extraParams[k]; });
  Object.keys(oauthP).forEach(function(k) { all[k] = oauthP[k]; });
  var paramStr = Object.keys(all).sort().map(function(k) {
    return _xPct(k) + '=' + _xPct(String(all[k]));
  }).join('&');
  var baseStr = method.toUpperCase() + '&' + _xPct(url) + '&' + _xPct(paramStr);
  var sigKey  = _xPct(cs) + '&' + _xPct(ts);
  var sigBytes = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_1, baseStr, sigKey);
  oauthP.oauth_signature = Utilities.base64Encode(sigBytes);
  return 'OAuth ' + Object.keys(oauthP).sort().map(function(k) {
    return _xPct(k) + '="' + _xPct(String(oauthP[k])) + '"';
  }).join(', ');
}

function _xPct(s) {
  return encodeURIComponent(String(s))
    .replace(/!/g,'%21').replace(/'/g,'%27')
    .replace(/\(/g,'%28').replace(/\)/g,'%29').replace(/\*/g,'%2A');
}

// ── DISPATCHER ────────────────────────────────────────────────────────────────
// Routes postId to correct platform function and writes result back to SocialPosts tab
function socialPostNow(postId) {
  var post = _socialReadPost(postId);
  if (!post) return { ok: false, error: 'Post not found in SocialPosts tab: ' + postId };

  var platform = String(post.platform || '').toLowerCase().trim();
  var result;
  switch (platform) {
    case 'facebook':            result = postToFacebook(post);  break;
    case 'instagram':           result = postToInstagram(post); break;
    case 'tiktok':              result = postToTikTok(post);    break;
    case 'pinterest':           result = postToPinterest(post); break;
    case 'youtube':             result = postToYouTube(post);   break;
    case 'x': case 'twitter':  result = postToX(post);         break;
    default: return { ok: false, error: 'Unknown platform: ' + platform };
  }

  if (result.ok) {
    _socialUpdatePost(postId, { status: 'posted', posted_url: result.post_url || '' });
  } else {
    _socialUpdatePost(postId, { status: 'error', posted_url: (result.error || '').substring(0, 200) });
  }
  return result;
}

function socialSchedulePost(postId, scheduledDate) {
  var post = _socialReadPost(postId);
  if (!post) return { ok: false, error: 'Post not found: ' + postId };
  var updates = { status: 'scheduled' };
  if (scheduledDate) updates.scheduled_date = scheduledDate;
  _socialUpdatePost(postId, updates);
  return { ok: true, post_id: postId, status: 'scheduled', scheduled_date: scheduledDate || String(post.scheduled_date) };
}

// ── CONNECTION STATUS ─────────────────────────────────────────────────────────
function getSocialConnectionStatus() {
  var status = {};
  Object.keys(_SOCIAL_CRED_KEYS).forEach(function(platform) {
    var keys    = _SOCIAL_CRED_KEYS[platform];
    var missing = keys.filter(function(k) { return !_ssp(k); });
    status[platform] = { connected: missing.length === 0, missing_keys: missing, keys_needed: keys };
  });
  return status;
}

// ── MANUAL POSTING EXPORT ─────────────────────────────────────────────────────
// Creates a Google Doc with copy-paste-ready posts for FB + IG on a given date.
// date: 'YYYY-MM-DD' string (e.g. '2026-05-27')
function exportSocialPostsDoc(date, campaignId) {
  campaignId = campaignId || 'EC-2026-001';
  date       = date       || '2026-05-27';

  // Normalize target date to midnight for comparison
  var targetDate = new Date(date + 'T00:00:00');
  var targetStr  = Utilities.formatDate(targetDate, 'America/New_York', 'yyyy-MM-dd');

  var allPosts = _socialGetPosts(campaignId, []);
  var dayPosts = allPosts.filter(function(p) {
    var sd = p.scheduled_date;
    if (!sd) return false;
    var d = (sd instanceof Date) ? sd : new Date(sd);
    if (isNaN(d.getTime())) return false;
    var ds = Utilities.formatDate(d, 'America/New_York', 'yyyy-MM-dd');
    return ds === targetStr;
  });

  // Only FB + IG for this manual export (Meta review pending)
  var metaPosts = dayPosts.filter(function(p) {
    var pl = String(p.platform || '').toLowerCase();
    return pl === 'facebook' || pl === 'instagram';
  });

  if (!metaPosts.length) {
    return { ok: false, error: 'No Facebook/Instagram posts found for ' + date, count: dayPosts.length };
  }

  // Create the Google Doc
  var docTitle = 'easyChef Pro — Social Posts ' + date + ' (Campaign Day 1 — Manual Posting)';
  var doc  = DocumentApp.create(docTitle);
  var body = doc.getBody();

  // Title
  var titlePara = body.insertParagraph(0, docTitle);
  titlePara.setHeading(DocumentApp.ParagraphHeading.TITLE);

  body.appendParagraph('Campaign: EC-2026-001 · Date: ' + date + ' · Generated: ' + Utilities.formatDate(new Date(), 'America/New_York', 'MMM d, yyyy h:mm a z'))
      .setItalic(true);
  body.appendParagraph('NOTE: Meta API review in progress (10-day wait). Post these manually. Copy each block below exactly as written.')
      .setBold(true);
  body.appendHorizontalRule();

  // Group by platform
  var byPlatform = {};
  metaPosts.forEach(function(p) {
    var pl = String(p.platform || '').toLowerCase();
    if (!byPlatform[pl]) byPlatform[pl] = [];
    byPlatform[pl].push(p);
  });

  var platformOrder = ['facebook', 'instagram'];
  var platformLabel = { facebook: 'FACEBOOK', instagram: 'INSTAGRAM' };
  var platformNote  = {
    facebook:  'Post to: facebook.com → Your Page → Create Post',
    instagram: 'Post to: Instagram app → New Post → caption field'
  };

  var postIndex = 0;
  platformOrder.forEach(function(pl) {
    if (!byPlatform[pl] || !byPlatform[pl].length) return;
    byPlatform[pl].forEach(function(post) {
      postIndex++;
      // Platform header
      body.appendParagraph(platformLabel[pl] + ' — Post ' + postIndex)
          .setHeading(DocumentApp.ParagraphHeading.HEADING1);
      body.appendParagraph(platformNote[pl]).setItalic(true);

      // Image note
      if (post.image_url && String(post.image_url).indexOf('http') === 0) {
        body.appendParagraph('IMAGE: ' + post.image_url).setBold(true);
      } else if (post.image_brief) {
        body.appendParagraph('IMAGE BRIEF: ' + post.image_brief).setItalic(true);
      }

      // Hook line (if present)
      if (post.hook) {
        body.appendParagraph('Hook: ' + post.hook).setItalic(true);
      }

      // The actual copy block — bold border, ready to copy
      body.appendParagraph('── COPY BLOCK (copy everything below this line) ──').setBold(true);

      var fullText = String(post.body_copy || '');
      var link = _socialBuildLink(post);
      if (link) fullText += '\n\n' + link;
      var tags = String(post.hashtags || '');
      if (tags) fullText += '\n\n' + tags;

      body.appendParagraph(fullText);
      body.appendParagraph('── END COPY BLOCK ──').setBold(true);

      // Metadata footer (small, for reference)
      body.appendParagraph('Post ID: ' + (post.id || '—') + ' · Stage: ' + (post.stage_number || '—') + ' · Emotion: ' + (post.emotion || '—') + ' · Status: ' + (post.status || '—'))
          .setItalic(true).setFontSize(9);

      body.appendHorizontalRule();
    });
  });

  // Footer
  body.appendParagraph('After posting, update status to "posted" in the SocialPosts tab of the Campaign Center Sheet.')
      .setItalic(true);

  doc.saveAndClose();
  var docUrl = 'https://docs.google.com/document/d/' + doc.getId() + '/edit';
  Logger.log('[exportSocialPostsDoc] Created: ' + docUrl);

  return {
    ok:        true,
    doc_url:   docUrl,
    doc_id:    doc.getId(),
    doc_title: docTitle,
    post_count: postIndex,
    date:      date,
    platforms: Object.keys(byPlatform)
  };
}

// ── DASHBOARD DATA ────────────────────────────────────────────────────────────
function getSocialDashboard(campaignId) {
  campaignId = campaignId || 'EC-2026-001';
  var allPosts = _socialGetPosts(campaignId, []);
  var queue    = allPosts.filter(function(p) { return ['draft','approved','scheduled'].indexOf(String(p.status)) !== -1; });
  var posted   = allPosts.filter(function(p) { return String(p.status) === 'posted'; }).slice(0, 30);
  var errors   = allPosts.filter(function(p) { return String(p.status) === 'error'; }).slice(0, 10);
  var webhookUrl = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec';
  return {
    ok:          true,
    connections: getSocialConnectionStatus(),
    queue:       queue,
    posted:      posted,
    errors:      errors,
    campaign_id: campaignId,
    webhook_url: webhookUrl,
    make_payload_example: JSON.stringify({ action: 'social_post_now', post_id: '{{post_id}}' })
  };
}
