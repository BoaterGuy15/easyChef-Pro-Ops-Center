// ─────────────────────────────────────────────────────────────────────────────
// Operations_KlaviyoSync.gs
//
// ADD TO doPost in Operations.gs (before the task array fallback):
//   if(body.action === 'klaviyo_push_sequence') return respond(klaviyoPushSequence(body));
//   if(body.action === 'klaviyo_get_lists')     return respond(klaviyoGetLists());
//
// REQUIRES Script Properties:
//   KLAVIYO_API_KEY
// ─────────────────────────────────────────────────────────────────────────────

var _KL_BASE     = 'https://a.klaviyo.com/api';
var _KL_REVISION = '2024-02-15';

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
 * groups by sequence_code (SEQ-1, SEQ-2 etc), and creates one
 * Klaviyo flow per sequence in draft status.
 *
 * Returns {
 *   ok: true,
 *   flows_created: N,
 *   flow_ids: [{ sequence_code, flow_id, flow_name }],
 *   emails_ready: N
 * }
 */
function klaviyoPushSequence(body) {
  try {
    var campaignId = body.campaign_id || '';
    if (!campaignId) return { ok: false, error: 'campaign_id is required' };

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

    var headers      = _klHeaders();
    var flowIds      = [];
    var flowsCreated = 0;

    Object.keys(groups).sort().forEach(function(seqCode) {
      var flowName = 'easyChef Pro ' + seqCode + ' — ' + campaignId;

      var resp = UrlFetchApp.fetch(_KL_BASE + '/flows/', {
        method:             'POST',
        headers:            headers,
        payload:            JSON.stringify({
          data: {
            type:       'flow',
            attributes: { name: flowName, status: 'draft' }
          }
        }),
        muteHttpExceptions: true
      });

      var httpCode = resp.getResponseCode();
      var data     = JSON.parse(resp.getContentText());

      if (httpCode === 201 || httpCode === 200) {
        var flowId = (data.data && data.data.id) || '';
        flowIds.push({ sequence_code: seqCode, flow_id: flowId, flow_name: flowName });
        flowsCreated++;
      } else {
        var errDetail = (data.errors && data.errors[0] && data.errors[0].detail) || ('HTTP ' + httpCode);
        flowIds.push({ sequence_code: seqCode, flow_id: null, error: errDetail });
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

// ── Diagnostic ────────────────────────────────────────────────────────────────
// Apps Script editor → select _testKlaviyo → Run → View Execution log

function _testKlaviyo() {
  var props = PropertiesService.getScriptProperties();
  var key   = props.getProperty('KLAVIYO_API_KEY');
  Logger.log('KLAVIYO_API_KEY: ' + (key ? 'YES (' + key.length + ' chars)' : 'MISSING'));
  if (!key) { Logger.log('Skipping — key not set.'); return; }

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