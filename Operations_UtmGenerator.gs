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
    var baseUrl       = 'https://easychefpro.com/' + (brief.slug || '').replace(/^\//, '');
    var urls          = [];

    // ── Generate one DL_ID per asset ────────────────────────────────────────
    assets.forEach(function(asset) {
      // Use per-asset channel for multi-channel campaigns
      var assetCh    = asset.channel || brief.channel || '';
      var chData     = assetCh ? _getChannelData(assetCh) : defaultChData;
      var prefix     = asset.asset_type === 'lp' ? 'LP' : (chData.dl_prefix || defaultChData.dl_prefix);
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

/**
 * Resolves utm_source, utm_medium, dl_prefix for a channel name.
 * Reads live from the Channels tab via getChannels().
 * Falls back to generic defaults if channel not found.
 */
function _getChannelData(channelName) {
  var channels = getChannels();
  for (var i = 0; i < channels.length; i++) {
    if (channels[i].name === channelName) {
      return {
        utm_source: channels[i].utm_source || channelName.toLowerCase(),
        utm_medium: channels[i].utm_medium || 'social',
        dl_prefix:  channels[i].dl_prefix  || 'SOC'
      };
    }
  }
  return {
    utm_source: channelName.toLowerCase(),
    utm_medium: 'social',
    dl_prefix:  'SOC'
  };
}