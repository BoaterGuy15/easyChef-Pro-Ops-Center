// ─────────────────────────────────────────────────────────────────────────────
// Operations_UtmGenerator.gs
// Paste this file into your Apps Script project.
//
// ADD TO doPost in Operations.gs (inside the if/else chain):
//   if (body.action === 'generate_utm_urls') return json(generateUtmUrls(body));
//
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Idempotent UTM URL generator.
 *
 * First call for a campaign_id  → generates DL_IDs, writes to DeepLinkRegistry
 * Subsequent calls without force → returns { ok:true, conflict:true, urls:[existing] }
 * Call with force:true           → cancels old entries, generates fresh DL_IDs
 *
 * body = {
 *   brief:        { id, name, channel, slug, goal },
 *   assets:       [{ asset_name, descriptor, asset_type }],
 *   utm_campaign: 'sanitised_campaign_code',
 *   force:        false
 * }
 *
 * Returns { ok:true, conflict:bool, urls:[{ asset_name, dl_id, utm_content, full_url, status }] }
 */
function generateUtmUrls(body) {
  try {
    var brief       = body.brief        || {};
    var assets      = body.assets       || [];
    var utmCampaign = body.utm_campaign || '';
    var force       = !!body.force;

    if (!brief.id) return { ok: false, error: 'brief.id is required' };

    // ── Check for existing entries ────────────────────────────────────────────
    var existing = getDlRegistry(brief.id);
    if (existing && existing.length > 0 && !force) {
      return {
        ok:       true,
        conflict: true,
        urls: existing.map(function(e) {
          var fullUrl = (e.destination_url || '') +
            '?utm_source='   + (e.utm_source   || '') +
            '&utm_medium='   + (e.utm_medium   || '') +
            '&utm_campaign=' + (e.utm_campaign  || '') +
            '&utm_content='  + (e.utm_content  || '');
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

    // ── Cancel old entries when regenerating ──────────────────────────────────
    if (force && existing && existing.length > 0) {
      cancelDlEntriesByCampaign(brief.id);
    }

    // ── Resolve channel data ──────────────────────────────────────────────────
    var chData   = _getChannelData(brief.channel || 'Email');
    var baseUrl  = 'https://easychefpro.com/' + (brief.slug || '').replace(/^\//, '');
    var urls     = [];

    // ── Generate one DL_ID per asset ─────────────────────────────────────────
    assets.forEach(function(asset) {
      var prefix     = asset.asset_type === 'lp' ? 'LP' : chData.dl_prefix;
      var dlId       = _nextDlId(prefix);
      var utmContent = dlId + '_' + (asset.descriptor || '');
      var fullUrl    = baseUrl +
        '?utm_source='   + chData.utm_source +
        '&utm_medium='   + chData.utm_medium +
        '&utm_campaign=' + utmCampaign +
        '&utm_content='  + utmContent;

      setDlRegistryEntry({
        dl_id:           dlId,
        utm_content:     utmContent,
        campaign_id:     brief.id,
        channel:         brief.channel || '',
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
        status:      'DRAFT'
      });
    });

    return { ok: true, conflict: false, urls: urls };

  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Soft-cancels all DeepLinkRegistry entries for a campaign by setting
 * their status to 'CANCELLED'. Does not delete rows.
 */
function cancelDlEntriesByCampaign(campaignId) {
  if (!campaignId) return;
  var entries = getDlRegistry(campaignId);
  entries.forEach(function(e) {
    setDlRegistryEntry({ dl_id: e.dl_id, status: 'CANCELLED' });
  });
}

/**
 * Resolves utm_source, utm_medium, dl_prefix for a channel name.
 * Reads live from the Channels tab first; falls back to the static maps.
 */
function _getChannelData(channelName) {
  // Try live Channels tab
  try {
    var channels = getChannels();
    for (var i = 0; i < channels.length; i++) {
      if (channels[i].name === channelName) {
        return {
          utm_source: channels[i].utm_source || channelName.toLowerCase(),
          utm_medium: channels[i].utm_medium || 'other',
          dl_prefix:  channels[i].dl_prefix  || 'SOC'
        };
      }
    }
  } catch (e) {
    // Sheet not available — fall through to static maps
  }
  // Static fallback
  return {
    utm_source: _CC_UTM_SOURCE_MAP[channelName] || channelName.toLowerCase(),
    utm_medium: _CC_UTM_MEDIUM_MAP[channelName] || 'other',
    dl_prefix:  _CC_DL_PREFIX_MAP[channelName]  || 'SOC'
  };
}
