// ─────────────────────────────────────────────────────────────────────────────
// Operations_KlaviyoSync.gs
// Paste this file into your Apps Script project.
//
// ADD TO doPost in Operations.gs (inside the if/else chain):
//   if (body.action === 'klaviyo_push_sequence') return respond(klaviyoPushSequence(body));
//   if (body.action === 'klaviyo_get_lists')     return respond(klaviyoGetLists());
//
// REQUIRES Script Properties:
//   KLAVIYO_API_KEY
// ─────────────────────────────────────────────────────────────────────────────

var _KL_BASE     = 'https://a.klaviyo.com/api';
var _KL_REVISION = '2024-07-15';

/**
 * Returns the Klaviyo auth header object.
 */
function _klHeaders() {
  var key = PropertiesService.getScriptProperties().getProperty('KLAVIYO_API_KEY');
  if (!key) throw new Error('KLAVIYO_API_KEY not set in Script Properties');
  return {
    'Authorization': 'Klaviyo-API-Key ' + key,
    'revision':      _KL_REVISION,
    'Content-Type':  'application/json'
  };
}

// ── klaviyoGetLists ───────────────────────────────────────────────────────────

/**
 * Fetches all lists from the Klaviyo account.
 * Returns { ok: true, lists: [{ id, name, created, updated }] }
 */
function klaviyoGetLists() {
  try {
    var resp = UrlFetchApp.fetch(_KL_BASE + '/lists/', {
      method:             'GET',
      headers:            _klHeaders(),
      muteHttpExceptions: true
    });

    var code = resp.getResponseCode();
    var data = JSON.parse(resp.getContentText());

    if (code !== 200) {
      var errMsg = (data.errors && data.errors[0] && data.errors[0].detail) || ('HTTP ' + code);
      return { ok: false, error: 'Klaviyo lists fetch failed: ' + errMsg };
    }

    var lists = (data.data || []).map(function(l) {
      return {
        id:      l.id,
        name:    (l.attributes && l.attributes.name)    || '',
        created: (l.attributes && l.attributes.created) || '',
        updated: (l.attributes && l.attributes.updated) || ''
      };
    });

    return { ok: true, lists: lists };

  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── klaviyoPushSequence ───────────────────────────────────────────────────────

/**
 * Reads all EmailSequences rows for body.campaign_id from the Sheet,
 * groups them by sequence_code (SEQ-1, SEQ-2 …), and creates one
 * Klaviyo flow per sequence in draft status.
 *
 * Returns {
 *   ok: true,
 *   flows_created: N,
 *   flow_ids: [ { sequence_code, flow_id, flow_name } ],
 *   emails_ready: N
 * }
 */
function klaviyoPushSequence(body) {
  try {
    var campaignId = body.campaign_id || '';
    if (!campaignId) return { ok: false, error: 'campaign_id is required' };

    // Read email sequences for this campaign from the Sheet
    var sequences = getEmailSequences(campaignId);
    if (!sequences || !sequences.length) {
      return { ok: false, error: 'No email sequences found for campaign: ' + campaignId };
    }

    // Group by sequence_code
    var groups = {};
    sequences.forEach(function(seq) {
      var code = seq.sequence_code || 'SEQ-1';
      if (!groups[code]) groups[code] = [];
      groups[code].push(seq);
    });

    var headers     = _klHeaders();
    var flowIds     = [];
    var flowsCreated = 0;

    var sequenceCodes = Object.keys(groups).sort();

    sequenceCodes.forEach(function(code) {
      var flowName = 'easyChef Pro ' + code + ' — ' + campaignId;

      var payload = JSON.stringify({
        data: {
          type:       'flow',
          attributes: {
            name:   flowName,
            status: 'draft'
          }
        }
      });

      var resp = UrlFetchApp.fetch(_KL_BASE + '/flows/', {
        method:             'POST',
        headers:            headers,
        payload:            payload,
        muteHttpExceptions: true
      });

      var code2 = resp.getResponseCode();
      var data  = JSON.parse(resp.getContentText());

      if (code2 === 201 || code2 === 200) {
        var flowId = (data.data && data.data.id) || '';
        flowIds.push({ sequence_code: code, flow_id: flowId, flow_name: flowName });
        flowsCreated++;
      } else {
        var errDetail = (data.errors && data.errors[0] && data.errors[0].detail) || ('HTTP ' + code2);
        flowIds.push({ sequence_code: code, flow_id: null, error: errDetail });
      }
    });

    return {
      ok:            true,
      flows_created: flowsCreated,
      flow_ids:      flowIds,
      emails_ready:  sequences.length
    };

  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── Content team event tracking ───────────────────────────────────────────────
// Both functions POST a Klaviyo event so the team can build flows / activity
// feeds on "Content Note Added" and "Content Status Updated" metrics.
// All events land on a single internal-team Klaviyo profile.

var _KL_TEAM_PROFILE_EMAIL = 'content-team@easychefpro.com';

function _klTrackEvent(metricName, props) {
  try {
    var payload = JSON.stringify({
      data: {
        type: 'event',
        attributes: {
          time:       new Date().toISOString(),
          value:      1,
          properties: props,
          metric:  { data: { type: 'metric',  attributes: { name: metricName } } },
          profile: { data: { type: 'profile', attributes: { email: _KL_TEAM_PROFILE_EMAIL } } }
        }
      }
    });
    var resp = UrlFetchApp.fetch(_KL_BASE + '/events/', {
      method: 'POST', headers: _klHeaders(), payload: payload, muteHttpExceptions: true
    });
    var code = resp.getResponseCode();
    if (code === 202 || code === 200 || code === 201) return { ok: true };
    return { ok: false, error: 'Klaviyo HTTP ' + code + ': ' + resp.getContentText().slice(0,200) };
  } catch(e) {
    Logger.log('[_klTrackEvent] ' + e.message);
    return { ok: false, error: e.message };
  }
}

function klaviyoTrackNote(assetId, platform, noteText, author, briefDocUrl, sheetUrl) {
  return _klTrackEvent('Content Note Added', {
    asset_id:      assetId,
    platform:      platform,
    note:          noteText,
    author:        author || 'Team',
    brief_doc_url: briefDocUrl || '',
    sheet_url:     sheetUrl   || ''
  });
}

function klaviyoTrackStatusUpdate(assetId, platform, field, value, briefDocUrl, sheetUrl) {
  return _klTrackEvent('Content Status Updated', {
    asset_id:      assetId,
    platform:      platform,
    field:         field,
    value:         value,
    brief_doc_url: briefDocUrl || '',
    sheet_url:     sheetUrl   || ''
  });
}

// ── Diagnostic ────────────────────────────────────────────────────────────────
// Run → _testKlaviyo → View Execution log
function _testKlaviyo() {
  var props = PropertiesService.getScriptProperties();
  var key   = props.getProperty('KLAVIYO_API_KEY');
  Logger.log('KLAVIYO_API_KEY: ' + (key ? 'YES (' + key.length + ' chars)' : 'MISSING'));

  if (!key) {
    Logger.log('Skipping API test — key not set.');
    return;
  }

  // Test: fetch lists
  Logger.log('--- Testing klaviyoGetLists() ---');
  var result = klaviyoGetLists();
  Logger.log('ok: ' + result.ok);
  if (result.ok) {
    Logger.log('lists count: ' + result.lists.length);
    if (result.lists.length) {
      Logger.log('first list: ' + result.lists[0].name + ' (id: ' + result.lists[0].id + ')');
    }
  } else {
    Logger.log('error: ' + result.error);
  }

  Logger.log('Klaviyo diagnostic complete.');
}


// ── P6: Build Klaviyo Flows A+B ───────────────────────────────────────────────
/**
 * Creates two Klaviyo flows (ICP-A and ICP-B) in draft status.
 * Groups emails by icp_code: 'frustrated' → Flow A, 'peaceful' → Flow B.
 * Saves klaviyo_flow_id back to EmailSequences tab for each email.
 * Returns { ok, flows_created, flow_ids, emails_updated }
 */
function klaviyoBuildFlows(campaignId, listId) {
  try {
    campaignId = campaignId || 'EC-2026-001';
    var emails = getEmailSequences(campaignId);
    if (!emails.length) return { ok: false, error: 'no emails for ' + campaignId };

    // Resolve list ID — passed in, or first active CcSetting, or fall back to known ID
    var triggerListId = listId || '';
    if (!triggerListId) {
      try {
        var _kls = _getCcSetting('KLAVIYO_LIST_ID');
        triggerListId = (_kls && _kls.length) ? _kls[0].label : '';
      } catch(ke) {}
    }
    if (!triggerListId) triggerListId = 'TebDTM'; // Prelaunch Emails list

    // Group emails by variant (icp_code)
    var groupA = []; // frustrated
    var groupB = []; // peaceful
    emails.forEach(function(e) {
      var icp = String(e.icp_code || '').toLowerCase();
      if (icp === 'frustrated' || icp === 'a') {
        groupA.push(e);
      } else if (icp === 'peaceful' || icp === 'b') {
        groupB.push(e);
      } else {
        groupA.push(e); // default to A
      }
    });

    var flowDefs = [
      { label: 'A', name: 'easyChef Pro Flow A — Founding Price (frustrated) — ' + campaignId, emails: groupA },
      { label: 'B', name: 'easyChef Pro Flow B — Life Change (peaceful) — ' + campaignId,       emails: groupB }
    ];

    var headers = _klHeaders();
    var flowResults = [];
    var emailsUpdated = 0;

    flowDefs.forEach(function(fd) {
      if (!fd.emails.length) return;

      // Create flow in Klaviyo
      var payload = JSON.stringify({
        data: {
          type: 'flow',
          attributes: {
            name:   fd.name,
            status: 'draft'
          }
        }
      });

      var resp = UrlFetchApp.fetch(_KL_BASE + '/flows/', {
        method:             'POST',
        headers:            headers,
        payload:            payload,
        muteHttpExceptions: true
      });

      var code = resp.getResponseCode();
      var data = {};
      try { data = JSON.parse(resp.getContentText()); } catch(e) {}

      var flowId = (data.data && data.data.id) ? String(data.data.id) : null;

      if ((code === 201 || code === 200) && flowId) {
        flowResults.push({ variant: fd.label, flow_id: flowId, flow_name: fd.name, email_count: fd.emails.length });

        // Write flow ID back to EmailSequences tab
        var sheet    = _getCCSheet(_CC_TAB.EMAIL);
        var headers2 = _CC_HDR.EmailSequences;
        var klFlowCol = headers2.indexOf('klaviyo_flow_id') + 1; // 1-based
        var idCol     = 1; // email.id is column 1
        if (klFlowCol > 0) {
          var lastRow = sheet.getLastRow();
          if (lastRow >= 2) {
            var idVals = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
            var emailIdSet = {};
            fd.emails.forEach(function(e) { emailIdSet[e.id] = true; });
            for (var ri = 0; ri < idVals.length; ri++) {
              if (emailIdSet[String(idVals[ri][0])]) {
                sheet.getRange(ri + 2, klFlowCol).setValue(flowId);
                emailsUpdated++;
              }
            }
          }
        }

        Logger.log('[klaviyoBuildFlows] Flow ' + fd.label + ' created: ' + flowId + ' (' + fd.emails.length + ' emails)');
      } else {
        var errDetail = (data.errors && data.errors[0] && data.errors[0].detail) || ('HTTP ' + code);
        flowResults.push({ variant: fd.label, flow_id: null, error: errDetail });
        Logger.log('[klaviyoBuildFlows] Flow ' + fd.label + ' FAILED: ' + errDetail);
      }
    });

    var flowsCreated = flowResults.filter(function(f) { return f.flow_id; }).length;
    return { ok: true, flows_created: flowsCreated, flow_ids: flowResults, emails_updated: emailsUpdated, trigger_list_id: triggerListId };
  } catch(e) {
    Logger.log('[klaviyoBuildFlows] error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── P6: Register email DL-IDs as Klaviyo profile property suggestions ─────────
/**
 * Returns a formatted table of all campaign emails with their DL_IDs
 * so they can be used as utm_content in Klaviyo email CTA links.
 * Call this to get the mapping — used in manual Klaviyo template setup.
 */
function klaviyoGetEmailDlIdMapping(campaignId) {
  try {
    var emails = getEmailSequences(campaignId || 'EC-2026-001');
    var rows = emails.map(function(e) {
      return {
        email_id:      e.id,
        sequence_code: e.sequence_code,
        email_number:  e.email_number,
        icp_code:      e.icp_code,
        variant:       e.variant,
        subject_line:  e.subject_line,
        dl_id:         e.dl_id,
        utm_content:   e.dl_id || '',
        send_day:      e.send_day
      };
    }).filter(function(r) { return r.dl_id; });
    return { ok: true, mapping: rows, count: rows.length };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}
