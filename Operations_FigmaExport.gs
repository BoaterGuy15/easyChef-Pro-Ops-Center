// ─────────────────────────────────────────────────────────────────────────────
// Operations_FigmaExport.gs
// Builds a plugin-ready JSON export for the internal Figma population workflow.
//
// doPost action: get_figma_export_json
//   body: { "action": "get_figma_export_json", "campaign_id": "EC-2026-001" }
//
// Three-table join:
//   FigmaExport tab     keyed by post_id  (= asset_id in other tabs)
//   ContentCalendar tab keyed by asset_id
//   AssetLifecycle tab  keyed by asset_id
// ─────────────────────────────────────────────────────────────────────────────

var _FE_TAB_NAME = 'FigmaExport';

// ── _getFigmaTextFields ───────────────────────────────────────────────────────
// Reads FIGMA / FIGMA_TEXT_FIELDS_001 from CcSettings.
// Auto-seeds the row on first call if missing.
function _getFigmaTextFields() {
  var defaults = [
    'hook_a','hook_b','caption_opening','cta','scene_direction','dl_id','utm_url',
    'subject_line','preview_text','opening_hook','audio_direction','what_not_to_show',
    'scene_sq_1','scene_sq_2','scene_sq_3','scene_sq_4','scene_sq_5','scene_sq_6',
    'story_arc_1','story_arc_2','story_arc_3','story_arc_4',
    'header_image_direction'
  ];
  try {
    var sheet = _getCampaignSpreadsheet().getSheetByName('CcSettings');
    if (!sheet) return defaults;
    var last = sheet.getLastRow();
    if (last >= 2) {
      var rows = sheet.getRange(2, 1, last - 1, 5).getValues();
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        if (String(r[0]).toUpperCase() === 'FIGMA' && String(r[1]) === 'FIGMA_TEXT_FIELDS_001') {
          var active = r[4] === true || String(r[4]).toLowerCase() === 'true';
          if (!active) return defaults;
          try { return JSON.parse(String(r[3])); } catch(ep) { return defaults; }
        }
      }
    }
    // Row not found — auto-seed it so the user can edit it from the sheet
    sheet.appendRow(['FIGMA', 'FIGMA_TEXT_FIELDS_001', 'Figma text layer field names', JSON.stringify(defaults), true]);
    try { CacheService.getScriptCache().remove('cc_settings_v1'); } catch(ec) {}
    Logger.log('[_getFigmaTextFields] seeded FIGMA_TEXT_FIELDS_001 to CcSettings');
    return defaults;
  } catch(e) {
    Logger.log('[_getFigmaTextFields] ' + e.message);
    return defaults;
  }
}

// ── upsertFigmaTextFields ─────────────────────────────────────────────────────
// Writes or updates FIGMA_TEXT_FIELDS_001 in CcSettings with the full field list.
function upsertFigmaTextFields() {
  try {
    var fields = _getFigmaTextFields(); // always returns the canonical list
    var sheet = _getCampaignSpreadsheet().getSheetByName('CcSettings');
    if (!sheet) return { ok: false, error: 'CcSettings not found' };
    var last = sheet.getLastRow();
    if (last >= 2) {
      var rows = sheet.getRange(2, 1, last - 1, 5).getValues();
      for (var i = 0; i < rows.length; i++) {
        if (String(rows[i][0]).toUpperCase() === 'FIGMA' && String(rows[i][1]) === 'FIGMA_TEXT_FIELDS_001') {
          sheet.getRange(i + 2, 4).setValue(JSON.stringify(fields)); // update extra column
          try { CacheService.getScriptCache().remove('cc_settings_v1'); } catch(ec) {}
          return { ok: true, status: 'updated', field_count: fields.length, fields: fields };
        }
      }
    }
    // Not found — insert
    sheet.appendRow(['FIGMA', 'FIGMA_TEXT_FIELDS_001', 'Figma text layer field names', JSON.stringify(fields), true]);
    try { CacheService.getScriptCache().remove('cc_settings_v1'); } catch(ec) {}
    return { ok: true, status: 'inserted', field_count: fields.length, fields: fields };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

function _readSheetAsMap(sheet, keyCol) {
  var last = sheet.getLastRow();
  if (last < 2) return { headers: [], map: {} };
  var hdrs   = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function(h){ return String(h).trim(); });
  var keyIdx = hdrs.indexOf(keyCol);
  if (keyIdx < 0) return { headers: hdrs, map: {} };
  var data   = sheet.getRange(2, 1, last - 1, hdrs.length).getValues();
  var map    = {};
  data.forEach(function(row) {
    var k = String(row[keyIdx] || '');
    if (k) map[k] = row;
  });
  return { headers: hdrs, map: map };
}

// ── getFigmaExportJson ────────────────────────────────────────────────────────

function getFigmaExportJson(campaignId) {
  try {
    campaignId = campaignId || 'EC-2026-001';
    var ss = _getCampaignSpreadsheet();

    // ── 1. FigmaExport tab — keyed by post_id (= asset_id) ───────────────────
    var feSheet = ss.getSheetByName(_FE_TAB_NAME);
    if (!feSheet) return { ok: false, error: 'FigmaExport tab not found' };
    var fe  = _readSheetAsMap(feSheet, 'post_id');
    var feH = {};
    fe.headers.forEach(function(h, i) { feH[h] = i; });

    // ── 2. ContentCalendar tab — keyed by asset_id ────────────────────────────
    var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var cc      = _readSheetAsMap(ccSheet, 'asset_id');
    var ccH     = {};
    cc.headers.forEach(function(h, i) { ccH[h] = i; });

    // ── 3. AssetLifecycle tab — keyed by asset_id ─────────────────────────────
    var alcMap = {};
    var alcH   = {};
    try {
      var alcSheet = _getCCSheet(_CC_TAB.ASSET_LIFECYCLE);
      var alc      = _readSheetAsMap(alcSheet, 'asset_id');
      alc.headers.forEach(function(h, i) { alcH[h] = i; });
      alcMap = alc.map;
    } catch(e) { Logger.log('[getFigmaExportJson] AssetLifecycle: ' + e.message); }

    // ── 4. Build assets — FigmaExport drives the loop ────────────────────────
    var assets = [];

    Object.keys(fe.map).forEach(function(postId) {
      var feRow  = fe.map[postId];
      var ccRow  = cc.map[postId]   || [];   // post_id = asset_id
      var alcRow = alcMap[postId]   || [];

      // Campaign filter: prefer ContentCalendar, fall back to FigmaExport column if present
      var rowCampaign = String(ccRow[ccH.campaign_id] || feRow[feH.campaign_id] || '');
      if (rowCampaign && rowCampaign !== campaignId) return;

      // publish_date
      var pubDate = ccRow[ccH.publish_date];
      var dateStr = '';
      if (pubDate) {
        try {
          var d = pubDate instanceof Date ? pubDate : new Date(String(pubDate));
          if (!isNaN(d.getTime())) dateStr = Utilities.formatDate(d, 'America/Los_Angeles', 'yyyy-MM-dd');
        } catch(e2) {}
      }

      // asset_lifecycle_status
      var alcStatus = String(alcRow[alcH.status] || ccRow[ccH.creative_status] || 'generated');

      // figma_layer_map from AssetLifecycle
      var figmaLayerMap = null;
      if (alcRow.length) {
        figmaLayerMap = {
          figma_file_id: String(alcRow[alcH.figma_file_id] || ''),
          figma_page:    String(alcRow[alcH.figma_page]    || ''),
          figma_frame:   String(alcRow[alcH.figma_frame]   || '')
        };
      }

      function fe_(col) { return feH[col] !== undefined ? String(feRow[feH[col]] || '') : ''; }
      function cc_(col) { return ccH[col] !== undefined ? String(ccRow[ccH[col]] || '') : ''; }

      assets.push({
        asset_id:              postId,
        campaign_id:           campaignId,
        platform:              fe_('platform')       || cc_('platform'),
        day:                   Number(feRow[feH.day] || ccRow[ccH.day] || 0),
        week:                  Number(feRow[feH.week]|| ccRow[ccH.week]|| 0),
        publish_date:          dateStr,
        funnel_stage:          fe_('funnel_stage')   || cc_('funnel_stage'),
        icp_target:            fe_('icp_target')     || cc_('icp_target'),
        phone_in_frame:        fe_('phone_in_frame'),
        dl_id:                 fe_('dl_id')          || cc_('dl_id'),
        utm_url:               fe_('utm_url')        || cc_('utm_url'),
        cta:                   fe_('cta'),
        hook_a:                fe_('hook_a'),
        hook_b:                fe_('hook_b'),
        opening_hook:          fe_('opening_hook'),
        scene_direction:       fe_('scene_direction'),
        what_not_to_show:      fe_('what_not_to_show'),
        caption_opening:       fe_('caption_opening'),
        scene_sequence: {
          sq_1: fe_('scene_sq_1'),
          sq_2: fe_('scene_sq_2'),
          sq_3: fe_('scene_sq_3'),
          sq_4: fe_('scene_sq_4'),
          sq_5: fe_('scene_sq_5'),
          sq_6: fe_('scene_sq_6')
        },
        audio_direction:       fe_('audio_direction'),
        story_arc: {
          arc_1: fe_('story_arc_1'),
          arc_2: fe_('story_arc_2'),
          arc_3: fe_('story_arc_3'),
          arc_4: fe_('story_arc_4')
        },
        subject_line:          fe_('subject_line'),
        preview_text:          fe_('preview_text'),
        header_image_direction: fe_('header_image_direction'),
        platform_specs:        '',
        figma_layer_map:       figmaLayerMap,
        asset_lifecycle_status: alcStatus,
        calendar_status:       cc_('status'),
        figma_export_url:      cc_('figma_export_url'),
        brief_doc_url:         cc_('brief_doc_url')
      });
    });

    assets.sort(function(a, b) {
      return (a.day - b.day) || a.platform.localeCompare(b.platform);
    });

    var metaCols = {'post_id':1,'campaign_id':1,'day':1,'week':1,'platform':1};
    var exportedFields = fe.headers.filter(function(h){ return h && !metaCols[h]; });

    Logger.log('[getFigmaExportJson] ' + assets.length + ' assets for ' + campaignId);
    return {
      ok:                  true,
      campaign_id:         campaignId,
      fields:              exportedFields,
      text_fields:         _getFigmaTextFields(),
      export_generated_at: new Date().toISOString(),
      total_assets:        assets.length,
      assets:              assets
    };

  } catch(e) {
    Logger.log('[getFigmaExportJson] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── updateAssetStatus ─────────────────────────────────────────────────────────
// Called by the Figma plugin after each frame is created.
// Upserts a row in AssetLifecycle and updates ContentCalendar.creative_status.
//
// body: { asset_id, status, figma_file_id, figma_page, figma_frame_id }

function updateAssetStatus(body) {
  try {
    var assetId    = String(body.asset_id       || '');
    var status     = String(body.status         || 'in_figma');
    var fileId     = String(body.figma_file_id  || '');
    var pageName   = String(body.figma_page     || '');
    var frameId    = String(body.figma_frame_id || '');
    if (!assetId) return { ok: false, error: 'asset_id required' };

    var now = new Date().toISOString();

    // ── 1. Upsert AssetLifecycle ──────────────────────────────────────────────
    var alcSheet = _getCCSheet(_CC_TAB.ASSET_LIFECYCLE);
    var alcHdrs  = _CC_HDR[_CC_TAB.ASSET_LIFECYCLE];
    var alcH     = {};
    alcHdrs.forEach(function(h, i) { alcH[h] = i; });

    var alcLast = alcSheet.getLastRow();
    var rowNum  = -1;

    if (alcLast >= 2) {
      var idCol   = alcSheet.getRange(2, alcH.asset_id + 1, alcLast - 1, 1).getValues();
      for (var i = 0; i < idCol.length; i++) {
        if (String(idCol[i][0]) === assetId) { rowNum = i + 2; break; }
      }
    }

    if (rowNum > 0) {
      // Update existing row
      var setCol = function(col, val) { alcSheet.getRange(rowNum, alcH[col] + 1).setValue(val); };
      setCol('figma_file_id', fileId);
      setCol('figma_page',    pageName);
      setCol('figma_frame',   frameId);
      setCol('status',        status);
      setCol('updated_at',    now);
    } else {
      // Append new row
      var newRow = new Array(alcHdrs.length).fill('');
      newRow[alcH.asset_id]     = assetId;
      newRow[alcH.figma_file_id]= fileId;
      newRow[alcH.figma_page]   = pageName;
      newRow[alcH.figma_frame]  = frameId;
      newRow[alcH.status]       = status;
      newRow[alcH.created_at]   = now;
      newRow[alcH.updated_at]   = now;
      alcSheet.appendRow(newRow);
    }

    // ── 2. Update ContentCalendar.creative_status + figma_export_url ─────────
    var ccSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var ccHdrs  = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var ccH     = {};
    ccHdrs.forEach(function(h, i) { ccH[h] = i; });

    var ccLast  = ccSheet.getLastRow();
    var ccRowNum = -1;

    if (ccLast >= 2) {
      var ccIds = ccSheet.getRange(2, ccH.asset_id + 1, ccLast - 1, 1).getValues();
      for (var j = 0; j < ccIds.length; j++) {
        if (String(ccIds[j][0]) === assetId) { ccRowNum = j + 2; break; }
      }
    }

    if (ccRowNum > 0) {
      var figmaUrl = fileId ? 'https://www.figma.com/file/' + fileId + '?node-id=' + encodeURIComponent(frameId) : '';
      ccSheet.getRange(ccRowNum, ccH.creative_status + 1).setValue(status);
      if (figmaUrl) ccSheet.getRange(ccRowNum, ccH.figma_export_url + 1).setValue(figmaUrl);
      ccSheet.getRange(ccRowNum, ccH.updated_at + 1).setValue(now);
    }

    Logger.log('[updateAssetStatus] ' + assetId + ' → ' + status + ' frame:' + frameId);
    return { ok: true, asset_id: assetId, status: status };

  } catch(e) {
    Logger.log('[updateAssetStatus] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}
