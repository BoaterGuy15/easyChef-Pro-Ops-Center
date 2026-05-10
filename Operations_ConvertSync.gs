// ── Operations_ConvertSync.gs ─────────────────────────────────────────────────
// Convert.com API integration — HMAC-SHA256 signed requests, experiment data sync

var _CONVERT_ACCOUNT_ID = '10019256';
var _CONVERT_BASE_URL   = 'https://api.convert.com/api/v1/';
var _EXP_REG_TAB        = 'ExperimentRegistry';
var _EXP_MET_TAB        = 'ExperimentMetrics';
var _EXP_MET_HDR = [
  'metric_id','experiment_id','variant_id','report_date',
  'convert_visitors','convert_conversions','convert_conversion_rate','convert_confidence',
  'sessions','scroll_depth_25','scroll_depth_50','scroll_depth_75',
  'time_on_page_avg','cta_click_rate','email_capture_rate','waitlist_join',
  'bounce_rate','clarity_heatmap_url'
];

// ── Internal helpers ──────────────────────────────────────────────────────────

function _cvtBytesToHex(bytes) {
  return bytes.map(function(b) {
    return ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2);
  }).join('');
}

// Read a single CcSettings row value by key (r[1]) → returns r[3] (extra column)
function _cvtReadSetting(key) {
  try {
    var sheet = _getCCSheet(_CC_TAB.SETTINGS);
    var last  = sheet.getLastRow();
    if (last < 2) return '';
    var rows = sheet.getRange(2, 1, last - 1, 4).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][1] || '').toLowerCase() === key.toLowerCase()) {
        return String(rows[i][3] || '');
      }
    }
  } catch(e) { Logger.log('[ConvertSync] _cvtReadSetting error: ' + e.message); }
  return '';
}

// Get or create a named sheet; seed headers on row 1 if newly created
function _cvtGetOrCreateSheet(name, headers) {
  var ss = _getCampaignSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers && headers.length) {
      var hdr = sh.getRange(1, 1, 1, headers.length);
      hdr.setValues([headers]);
      hdr.setBackground('#c62828').setFontColor('#ffffff')
         .setFontWeight('bold').setFontFamily('Arial').setFontSize(10);
      sh.setFrozenRows(1);
    }
    Logger.log('[ConvertSync] Created sheet: ' + name);
  }
  return sh;
}

// ── FUNCTION 1 — signConvertRequest ──────────────────────────────────────────
/**
 * Builds HMAC-SHA256 signed headers for a Convert.com API request.
 * Reads api_key and secret_key from CcSettings tab (key column).
 */
function signConvertRequest(method, path, body) {
  var apiKey    = _cvtReadSetting('convert_api_key');
  var secretKey = _cvtReadSetting('convert_secret_key');
  if (!apiKey || !secretKey) {
    throw new Error('convert_api_key / convert_secret_key not found in CcSettings tab (key column)');
  }
  var timestamp = String(Date.now());
  var canonical = method.toUpperCase() + '\n' + path + '\n' + timestamp + '\n' + (body || '');
  var sigBytes  = Utilities.computeHmacSha256Signature(canonical, secretKey);
  var signature = _cvtBytesToHex(sigBytes);
  return {
    'X-Convert-Api-Key':   apiKey,
    'X-Convert-Timestamp': timestamp,
    'X-Convert-Signature': signature,
    'Content-Type':        'application/json'
  };
}

// ── FUNCTION 2 — getConvertExperimentData ────────────────────────────────────
/**
 * Fetches experiment report from Convert.com API and normalises the response.
 * Returns { experiment_id, variants[], winner, status }
 */
function getConvertExperimentData(experimentId) {
  if (!experimentId) throw new Error('experimentId required');
  var path    = 'accounts/' + _CONVERT_ACCOUNT_ID + '/experiments/' + experimentId + '/report';
  var headers = signConvertRequest('GET', '/' + path, '');
  var resp    = UrlFetchApp.fetch(_CONVERT_BASE_URL + path, {
    method:            'get',
    headers:           headers,
    muteHttpExceptions: true
  });
  var code = resp.getResponseCode();
  var text = resp.getContentText();
  if (code !== 200) {
    throw new Error('Convert API ' + code + ': ' + text.substring(0, 300));
  }
  var raw = {};
  try { raw = JSON.parse(text); } catch(pe) { throw new Error('Convert API response not valid JSON: ' + text.substring(0, 200)); }

  // Normalise variant list — Convert v1 may use different field names
  var rawVariants = raw.variants || raw.data || [];
  var variants = rawVariants.map(function(v) {
    return {
      id:              String(v.id || v.variant_id || ''),
      name:            String(v.name || v.variant_name || ''),
      visitors:        Number(v.visitors || v.unique_visitors || v.sessions || 0),
      conversions:     Number(v.conversions || v.goals_reached || v.goal_completions || 0),
      conversion_rate: Number(v.conversion_rate || v.cr || 0),
      confidence:      Number(v.statistical_significance || v.confidence || 0)
    };
  });

  // Determine winner and overall status
  var winner   = null;
  var maxConf  = 0;
  variants.forEach(function(v) {
    if (v.confidence > maxConf) { maxConf = v.confidence; winner = v.id; }
  });
  var hasEnoughData = variants.some(function(v) { return v.visitors >= 50; });
  var status;
  if (!hasEnoughData) {
    status = 'running';
    winner = null;
  } else if (maxConf >= 95) {
    status = 'complete';
  } else if (maxConf >= 80) {
    status = 'running';
    winner = null;
  } else {
    status = 'inconclusive';
    winner = null;
  }
  // Honour explicit status from API if present
  if (raw.status) status = String(raw.status).toLowerCase();

  Logger.log('[ConvertSync] getConvertExperimentData(' + experimentId + '): ' +
    variants.length + ' variants · maxConf=' + maxConf + ' · status=' + status);

  return {
    experiment_id: String(experimentId),
    variants:      variants,
    winner:        winner,
    status:        status
  };
}

// ── FUNCTION 3 — syncConvertToSheet ──────────────────────────────────────────
/**
 * Reads ExperimentRegistry for active experiments (optionally filtered by campaignId),
 * fetches data from Convert.com, and writes results to ExperimentMetrics tab.
 * Marks experiments COMPLETE when confidence >= 94 AND visitors >= 200.
 */
function syncConvertToSheet(campaignId) {
  var summary = { synced: 0, skipped: 0, errors: [], flagged: [] };

  // ── ExperimentRegistry ───────────────────────────────────────────────────
  var regSh = _cvtGetOrCreateSheet(_EXP_REG_TAB, [
    'experiment_id','campaign_id','variant_a_id','variant_b_id',
    'convert_experiment_id','status','created_at','notes'
  ]);
  var regLast = regSh.getLastRow();
  if (regLast < 2) {
    Logger.log('[ConvertSync] ExperimentRegistry is empty — nothing to sync');
    return summary;
  }
  var regData = regSh.getRange(2, 1, regLast - 1, 8).getValues();

  // Filter: has a convert_experiment_id, not already COMPLETE, matches campaignId if given
  var toSync = [];
  regData.forEach(function(r, idx) {
    var rowCampaign = String(r[1] || '');
    var cvtExpId    = String(r[4] || '').trim();
    var rowStatus   = String(r[5] || '').toUpperCase();
    if (!cvtExpId) { summary.skipped++; return; }
    if (rowStatus === 'COMPLETE') { summary.skipped++; return; }
    if (campaignId && rowCampaign !== campaignId) { summary.skipped++; return; }
    toSync.push({ row: r, sheetRowIndex: idx + 2 }); // sheetRowIndex = 1-based
  });

  if (!toSync.length) {
    Logger.log('[ConvertSync] No active experiments to sync (campaign=' + (campaignId || 'all') + ')');
    return summary;
  }
  Logger.log('[ConvertSync] Syncing ' + toSync.length + ' experiment(s)');

  // ── ExperimentMetrics ────────────────────────────────────────────────────
  var metSh  = _cvtGetOrCreateSheet(_EXP_MET_TAB, _EXP_MET_HDR);
  var today  = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  toSync.forEach(function(item) {
    var r        = item.row;
    var regExpId = String(r[0] || '');
    var cvtExpId = String(r[4] || '').trim();
    try {
      var data = getConvertExperimentData(cvtExpId);
      summary.synced++;

      // Write one row per variant to ExperimentMetrics (upsert by metric_id)
      data.variants.forEach(function(v) {
        var metricId = regExpId + '-' + v.id + '-' + today;
        var newRow   = [
          metricId,         // metric_id
          cvtExpId,         // experiment_id
          v.id,             // variant_id
          today,            // report_date
          v.visitors,       // convert_visitors
          v.conversions,    // convert_conversions
          v.conversion_rate,// convert_conversion_rate
          v.confidence,     // convert_confidence
          '', '', '', '', '', '', '', '', '', ''  // manual metrics — blank
        ];
        // Find existing row to update
        var metLast = metSh.getLastRow();
        var found   = false;
        if (metLast >= 2) {
          var existingIds = metSh.getRange(2, 1, metLast - 1, 1).getValues();
          for (var mi = 0; mi < existingIds.length; mi++) {
            if (String(existingIds[mi][0]) === metricId) {
              metSh.getRange(mi + 2, 1, 1, newRow.length).setValues([newRow]);
              found = true;
              break;
            }
          }
        }
        if (!found) metSh.appendRow(newRow);
      });

      // Flag complete: any variant >= 94% confidence AND >= 200 visitors
      var readyToComplete = data.variants.some(function(v) {
        return v.confidence >= 94 && v.visitors >= 200;
      });
      if (readyToComplete) {
        regSh.getRange(item.sheetRowIndex, 6).setValue('COMPLETE');
        summary.flagged.push(cvtExpId);
        Logger.log('[ConvertSync] COMPLETE flagged — ' + cvtExpId +
          ' (winner=' + (data.winner || 'none') + ')');
      }
    } catch(e) {
      summary.errors.push({ experiment: cvtExpId, error: e.message });
      Logger.log('[ConvertSync] ERROR ' + cvtExpId + ': ' + e.message);
    }
  });

  Logger.log('[ConvertSync] Done — synced:' + summary.synced +
    ' skipped:' + summary.skipped +
    ' errors:' + summary.errors.length +
    ' flagged:' + summary.flagged.length);
  return summary;
}

// ── FUNCTION 4a — updateConvertExperimentId ──────────────────────────────────
/**
 * One-time migration: updates experience ID 10019672 → 100140422 in the live Sheet.
 * Touches CcSettings (key='convert_experiment_id', col 4) and
 * CampaignBriefs (id='EC-2026-001', ab_experiment_id column).
 * Run once from Apps Script editor: updateConvertExperimentId()
 */
function updateConvertExperimentId() {
  var OLD_ID = '10019672';
  var NEW_ID = '100140422';
  var updated = [];

  // CcSettings tab — scan r[1] (key) for 'convert_experiment_id', update r[3] (extra)
  try {
    var settingsSh = _getCCSheet(_CC_TAB.SETTINGS);
    var sLast = settingsSh.getLastRow();
    if (sLast >= 2) {
      var sRows = settingsSh.getRange(2, 1, sLast - 1, 4).getValues();
      for (var i = 0; i < sRows.length; i++) {
        if (String(sRows[i][1] || '').toLowerCase() === 'convert_experiment_id') {
          if (String(sRows[i][3]) === OLD_ID) {
            settingsSh.getRange(i + 2, 4).setValue(NEW_ID);
            updated.push('CcSettings row ' + (i + 2) + ': ' + OLD_ID + ' → ' + NEW_ID);
          }
        }
      }
    }
  } catch(e) { Logger.log('[updateConvertExperimentId] CcSettings error: ' + e.message); }

  // CampaignBriefs tab — scan r[0] (id) for 'EC-2026-001', update ab_experiment_id column
  try {
    var briefsSh  = _getCCSheet(_CC_TAB.BRIEFS);
    var bHdrs     = _CC_HDR.CampaignBriefs;
    var abExpCol  = bHdrs.indexOf('ab_experiment_id') + 1; // 1-based
    var bLast     = briefsSh.getLastRow();
    if (abExpCol > 0 && bLast >= 2) {
      var bRows = briefsSh.getRange(2, 1, bLast - 1, abExpCol).getValues();
      for (var j = 0; j < bRows.length; j++) {
        if (String(bRows[j][0]) === 'EC-2026-001') {
          if (String(bRows[j][abExpCol - 1]) === OLD_ID || bRows[j][abExpCol - 1] === '') {
            briefsSh.getRange(j + 2, abExpCol).setValue(NEW_ID);
            updated.push('CampaignBriefs row ' + (j + 2) + ' (EC-2026-001) ab_experiment_id: → ' + NEW_ID);
          }
        }
      }
    }
  } catch(e) { Logger.log('[updateConvertExperimentId] CampaignBriefs error: ' + e.message); }

  Logger.log('[updateConvertExperimentId] Done — ' + (updated.length ? updated.join(' | ') : 'nothing to update'));
  return { ok: true, updated: updated };
}

// ── FUNCTION 4 — scheduledConvertSync ────────────────────────────────────────
/**
 * Daily time-trigger entry point — syncs all active experiments across all campaigns.
 * Add trigger: Edit → Triggers → scheduledConvertSync → Day timer.
 */
function scheduledConvertSync() {
  Logger.log('[ConvertSync] Scheduled sync starting — ' + new Date().toISOString());
  try {
    var result = syncConvertToSheet('');
    Logger.log('[ConvertSync] Scheduled sync complete — ' + JSON.stringify(result));
    return result;
  } catch(e) {
    Logger.log('[ConvertSync] Scheduled sync ERROR: ' + e.message);
    throw e;
  }
}
