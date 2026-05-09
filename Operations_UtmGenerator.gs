// ─────────────────────────────────────────────────────────────────────────────
// Operations_UtmGenerator.gs
//
// ADD TO doPost in Operations.gs (before the task array fallback):
//   if(body.action === 'generate_utm_urls') return respond(generateUtmUrls(body));
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Idempotent UTM URL generator.
 * First call  → generates DL_IDs, writes to DeepLinkRegistry as DRAFT
 * Without force → returns { ok:true, conflict:true, urls:[existing] }
 * With force:true → cancels old entries, generates fresh DL_IDs
 */
function generateUtmUrls(body) {
  try {
    var brief       = body.brief        || {};
    var assets      = body.assets       || [];
    var utmCampaign = body.utm_campaign || '';
    var force       = !!body.force;

    if (!brief.id) return { ok: false, error: 'brief.id is required' };

    // ── Check for existing entries ──────────────────────────────────────────
    var existing = getDlRegistry(brief.id);
    if (existing && existing.length > 0 && !force) {
      return {
        ok:       true,
        conflict: true,
        urls: existing.map(function(e) {
          var fullUrl = (e.destination_url || '') +
            '?utm_source='   + encodeURIComponent(e.utm_source   || '') +
            '&utm_medium='   + encodeURIComponent(e.utm_medium   || '') +
            '&utm_campaign=' + encodeURIComponent(e.utm_campaign  || '') +
            '&utm_content='  + encodeURIComponent(e.utm_content  || '');
          return {
            asset_name:  e.notes        || e.utm_content || e.dl_id,
            dl_id:       e.dl_id,
            utm_content: e.utm_content,
            full_url:    fullUrl,
            status:      (e.status || 'DRAFT').toUpperCase()
          };
        })
      };
    }

    // ── Cancel old entries when regenerating ────────────────────────────────
    if (force && existing && existing.length > 0) {
      cancelDlEntriesByCampaign(brief.id);
    }

    // ── Resolve default channel data from Channels tab ──────────────────────
    var defaultChData = _getChannelData(brief.channel || 'Facebook');
    var baseUrl       = _buildLpUrl(brief.slug || 'waitlist');
    var urls          = [];

    // ── Generate one DL_ID per asset ────────────────────────────────────────
    assets.forEach(function(asset) {
      // Email assets always get EM prefix — check type first, before channel fallback,
      // so a missing channel field never causes them to inherit the social channel.
      var isEmailAsset = asset.asset_type === 'email' ||
                         (asset.channel || '').toLowerCase() === 'email';
      var assetCh, chData;
      if (isEmailAsset) {
        assetCh = 'Email';
        chData  = { utm_source: 'email', utm_medium: 'email', dl_prefix: 'EM' };
      } else {
        assetCh = asset.channel || brief.channel || '';
        chData  = assetCh ? _getChannelData(assetCh) : defaultChData;
      }
      var prefix = asset.asset_type === 'lp' ? 'LP' : (chData.dl_prefix || defaultChData.dl_prefix);
      var dlId       = _nextDlId(prefix);
      var utmContent = dlId + '_' + (asset.descriptor || '');
      var fullUrl    = baseUrl +
        '?utm_source='   + encodeURIComponent(chData.utm_source) +
        '&utm_medium='   + encodeURIComponent(chData.utm_medium) +
        '&utm_campaign=' + encodeURIComponent(utmCampaign) +
        '&utm_content='  + encodeURIComponent(utmContent);

      setDlRegistryEntry({
        dl_id:           dlId,
        utm_content:     utmContent,
        campaign_id:     brief.id,
        channel:         assetCh,
        destination_url: baseUrl,
        utm_source:      chData.utm_source,
        utm_medium:      chData.utm_medium,
        utm_campaign:    utmCampaign,
        status:          'DRAFT',
        notes:           asset.asset_name || ''
      });

      urls.push({
        asset_name:  asset.asset_name || utmContent,
        dl_id:       dlId,
        utm_content: utmContent,
        full_url:    fullUrl,
        status:      'DRAFT',
        channel:     assetCh
      });
    });

    return { ok: true, conflict: false, urls: urls };

  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Soft-cancels all DeepLinkRegistry entries for a campaign.
 * Sets status to CANCELLED — does not delete rows.
 */
function cancelDlEntriesByCampaign(campaignId) {
  if (!campaignId) return;
  var entries = getDlRegistry(campaignId);
  entries.forEach(function(e) {
    setDlRegistryEntry({ dl_id: e.dl_id, status: 'CANCELLED' });
  });
}

// Canonical per-platform DL prefix map — takes precedence over the Channels sheet,
// which historically stored 'SOC' for all social channels.
var _DL_PREFIX_MAP = {
  'facebook':  'FB',
  'instagram': 'IG',
  'tiktok':    'TK',
  'nextdoor':  'ND',
  'pinterest': 'PT',
  'youtube':   'YT',
  'x':         'X',
  'reddit':    'RD',
  'vimeo':     'VM',
  'email':     'EM'
};

/**
 * Resolves utm_source, utm_medium, dl_prefix for a channel name.
 * Reads live from the Channels tab via getChannels() for utm_source/medium,
 * but always uses _DL_PREFIX_MAP for dl_prefix to avoid stale 'SOC' values.
 */
function _getChannelData(channelName) {
  var nameLower = (channelName || '').toLowerCase();
  var mappedPrefix = _DL_PREFIX_MAP[nameLower] || 'SOC';
  var channels = getChannels();
  for (var i = 0; i < channels.length; i++) {
    if (channels[i].name === channelName) {
      return {
        utm_source: channels[i].utm_source || nameLower,
        utm_medium: channels[i].utm_medium || (nameLower === 'email' ? 'email' : 'social'),
        dl_prefix:  mappedPrefix
      };
    }
  }
  return {
    utm_source: nameLower,
    utm_medium: nameLower === 'email' ? 'email' : 'social',
    dl_prefix:  mappedPrefix
  };
}

/**
 * One-time cleanup: retires DL-FB-0002 (email asset that got FB prefix because
 * the channel field was missing on the asset object — fixed May 7 2026).
 * Run once from the Apps Script editor: retireFbEmailDl()
 */
function retireFbEmailDl() {
  setDlRegistryEntry({
    dl_id:  'DL-FB-0002',
    status: 'RETIRED',
    notes:  'Wrong prefix — email asset got FB prefix, retired May 7 2026'
  });
  Logger.log('[retireFbEmailDl] DL-FB-0002 set to RETIRED');
  return { ok: true, retired: 1 };
}

/**
 * One-time cleanup: retires DL-SOC-0294 through DL-SOC-0304 (wrong-prefix entries
 * generated before the channel mapping fix on May 7 2026).
 * Run once from the Apps Script editor: retireWrongPrefixDls()
 */
function retireWrongPrefixDls() {
  var toRetire = [
    'DL-SOC-0294','DL-SOC-0295','DL-SOC-0296','DL-SOC-0297','DL-SOC-0298',
    'DL-SOC-0299','DL-SOC-0300','DL-SOC-0301','DL-SOC-0302','DL-SOC-0303','DL-SOC-0304'
  ];
  toRetire.forEach(function(dlId) {
    setDlRegistryEntry({
      dl_id:  dlId,
      status: 'RETIRED',
      notes:  'Wrong prefix — retired after channel mapping fix May 7 2026'
    });
  });
  Logger.log('[retireWrongPrefixDls] retired ' + toRetire.length + ' entries: ' + toRetire.join(', '));
  return { ok: true, retired: toRetire.length };
}