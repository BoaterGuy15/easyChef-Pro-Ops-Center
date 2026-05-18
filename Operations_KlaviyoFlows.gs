// ── Operations_KlaviyoFlows.gs ────────────────────────────────────────────────
// EC-2026-001 Klaviyo Flow Automation
// Builds Flow A (super_mom_money) + Flow B (super_mom_time) from Sheet data.
// Schedules SEQ-3 (urgency) + SEQ-4 (launch) as time-specific campaigns.
// Script Properties key: klaviyo_private_key

var _KLF_BASE      = 'https://a.klaviyo.com/api';
var _KLF_REVISION  = '2025-04-15';
var _KLF_LIST_ID   = 'TebDTM';
var _KLF_FROM_EMAIL = 'hello@easychefpro.com';
var _KLF_FROM_NAME  = 'easyChef Pro';
var _KLF_CAMPAIGN_ID = 'EC-2026-001';

// Sequences handled as automated flows vs scheduled campaigns
var _KLF_FLOW_SEQS = ['SEQ-1', 'SEQ-2'];
var _KLF_CAMP_SEQS = ['SEQ-3', 'SEQ-4'];

// Flow delay schedule (days between emails, index 0 = send immediately)
// Matches send_day offsets: 0,3,7 for SEQ-1 then 8,10,14,18,25 for SEQ-2
var _KLF_FLOW_DELAYS_A = [0, 3, 4, 1, 2, 4, 4, 7];
var _KLF_FLOW_DELAYS_B = [0, 3, 4, 1, 2, 4, 4, 7];

// ── Internal helpers ──────────────────────────────────────────────────────────

function _klfApiKey() {
  var props = PropertiesService.getScriptProperties();
  return props.getProperty('klaviyo_private_key') ||
         props.getProperty('KLAVIYO_API_KEY') || '';
}

function _klfHeaders() {
  var key = _klfApiKey();
  if (!key) throw new Error('klaviyo_private_key not set in Script Properties');
  return {
    'Authorization': 'Klaviyo-API-Key ' + key,
    'revision':      _KLF_REVISION,
    'Content-Type':  'application/json',
    'Accept':        'application/json'
  };
}

function _klfFetch(method, path, payload) {
  var options = {
    method:             method,
    headers:            _klfHeaders(),
    muteHttpExceptions: true
  };
  if (payload !== undefined && payload !== null) {
    options.payload = JSON.stringify(payload);
  }
  var resp = UrlFetchApp.fetch(_KLF_BASE + '/' + path, options);
  var code = resp.getResponseCode();
  var text = resp.getContentText();
  Logger.log('[KLF] ' + method + ' /' + path + ' → ' + code);
  var data = {};
  if (text) { try { data = JSON.parse(text); } catch(e) {} }
  return { code: code, data: data, text: text };
}

function _klfErr(result) {
  var errs = result.data && result.data.errors;
  if (errs && errs.length) return errs[0].detail || errs[0].title || ('HTTP ' + result.code);
  return 'HTTP ' + result.code + ': ' + result.text.slice(0, 200);
}

// Read campaign start date from CcSettings; default 2026-05-27
function _klfStartDate() {
  var raw = _cvtReadSetting('campaign_start_date');
  return raw ? new Date(raw) : new Date('2026-05-27T09:00:00Z');
}

// Compute ISO send datetime from send_day offset
function _klfSendAt(sendDay) {
  var d = new Date(_klfStartDate().getTime() + Number(sendDay) * 86400000);
  return d.toISOString().replace('.000Z', 'Z');
}

// Assemble HTML body from full_email_body or body_* parts
function _klfHtml(email) {
  var full = String(email.full_email_body || '').trim();
  if (full) return full;
  var parts = [
    email.body_hook, email.body_problem, email.body_agitate,
    email.body_solve, email.body_value, email.body_proof, email.body_cta
  ].filter(function(p) { return p && String(p).trim(); });
  if (!parts.length) return '<p>(email body pending)</p>';
  return '<div style="font-family:Georgia,serif;font-size:16px;line-height:1.7;color:#333;max-width:600px;margin:0 auto;padding:24px">' +
    parts.map(function(p) { return '<p>' + String(p).replace(/\n/g, '<br>') + '</p>'; }).join('') +
    '</div>';
}

// Write a single field value back to EmailSequences for the given email id
function _klfWriteBack(emailId, field, value) {
  var sheet = _getCCSheet(_CC_TAB.EMAIL);
  var hdrs  = _CC_HDR.EmailSequences;
  var col   = hdrs.indexOf(field) + 1;
  if (col < 1) { Logger.log('[KLF] Column not found: ' + field); return; }
  var last = sheet.getLastRow();
  if (last < 2) return;
  var ids = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(emailId)) {
      sheet.getRange(i + 2, col).setValue(value);
      return;
    }
  }
}

// Write a CcSettings row for storing generated IDs (segment, flow)
function _klfSaveSetting(key, value, label) {
  try {
    var sheet = _getCCSheet(_CC_TAB.SETTINGS);
    var last  = sheet.getLastRow();
    if (last >= 2) {
      var rows = sheet.getRange(2, 1, last - 1, 4).getValues();
      for (var i = 0; i < rows.length; i++) {
        if (String(rows[i][1]).toLowerCase() === key.toLowerCase()) {
          sheet.getRange(i + 2, 4).setValue(String(value));
          return;
        }
      }
    }
    sheet.appendRow(['KLAVIYO', key, label || key, String(value), true]);
  } catch(e) { Logger.log('[KLF] _klfSaveSetting error: ' + e.message); }
}

function _klfReadSetting(key) {
  return _cvtReadSetting(key); // reuse CcSettings reader from ConvertSync
}

// ── FUNCTION 1 — Create email template ───────────────────────────────────────
function _klfCreateTemplate(name, htmlBody) {
  var result = _klfFetch('POST', 'templates/', {
    data: {
      type: 'template',
      attributes: { name: name, editor_type: 'CODE', html: htmlBody }
    }
  });
  if (result.code === 201 || result.code === 200) {
    var id = result.data && result.data.data && result.data.data.id;
    Logger.log('[KLF] Template created: ' + id + ' — ' + name);
    return { ok: true, template_id: id };
  }
  return { ok: false, error: _klfErr(result) };
}

// ── FUNCTION 2 — Get or create A/B segments ──────────────────────────────────
function _klfGetOrCreateSegment(segmentKey, segmentName, icpCode) {
  // Check CcSettings first
  var stored = _klfReadSetting(segmentKey);
  if (stored) { Logger.log('[KLF] Segment cached: ' + segmentKey + '=' + stored); return { ok: true, segment_id: stored }; }

  // Create segment via API
  var result = _klfFetch('POST', 'segments/', {
    data: {
      type: 'segment',
      attributes: {
        name: segmentName,
        definition: {
          condition_groups: [{
            conditions: [{
              type:             'profile-property',
              profile_property: 'icp_code',
              operator:         'equals',
              value:             icpCode
            }]
          }]
        }
      }
    }
  });

  if (result.code === 201 || result.code === 200) {
    var id = result.data && result.data.data && result.data.data.id;
    _klfSaveSetting(segmentKey, id, segmentName);
    Logger.log('[KLF] Segment created: ' + id + ' — ' + segmentName);
    return { ok: true, segment_id: id };
  }

  // Fallback: use list TebDTM if segment creation fails
  Logger.log('[KLF] Segment create failed (' + _klfErr(result) + '), falling back to list ' + _KLF_LIST_ID);
  return { ok: true, segment_id: _KLF_LIST_ID, fallback: true };
}

// ── FUNCTION 3 — klaviyoCreateFlow ───────────────────────────────────────────
// Creates a flow triggered by Added to List.
// Klaviyo 2025-04-15: definition requires { triggers:[{type:"list",id:listId}], actions:[], entry_action_id }
// Full action graph not buildable via public API — flow shell is created, email steps wired manually.
// triggerFilter: profile property filter set via Klaviyo UI after creation.
function klaviyoCreateFlow(flowName, listId, triggerFilter) {
  try {
    listId = listId || _KLF_LIST_ID;

    // Minimal flow shell: trigger wired, no actions (user adds steps in UI)
    // entry_action_id must reference a real action id — we use a sentinel that Klaviyo may reject
    // If creation fails, caller treats it as ok=false but still proceeds to template creation
    var result = _klfFetch('POST', 'flows/', {
      data: {
        type: 'flow',
        attributes: {
          name:       flowName,
          definition: {
            triggers: [{ type: 'list', id: listId }],
            actions:  [],
            entry_action_id: null
          }
        }
      }
    });

    if (result.code === 201 || result.code === 200) {
      var flowId = result.data && result.data.data && result.data.data.id;
      Logger.log('[KLF] Flow created: ' + flowId + ' — ' + flowName);
      return { ok: true, flow_id: flowId, flow_name: flowName, trigger_set: true, list_id: listId };
    }

    // Flow creation failed — return structured error so caller can continue to templates
    var errMsg = _klfErr(result);
    Logger.log('[KLF] Flow create failed (HTTP ' + result.code + '): ' + errMsg + ' — templates will still be created');
    return { ok: false, error: errMsg, flow_id: null, manual_flow_required: true };
  } catch(e) {
    return { ok: false, error: e.message, flow_id: null, manual_flow_required: true };
  }
}

// ── FUNCTION 4 — klaviyoAddEmailStep ─────────────────────────────────────────
// Creates a template + attempts to add delay + email action to an existing flow.
// emailData fields: email_id, subject, preview_text, html_body, from_name,
//   from_email, utm_source, utm_medium, utm_campaign, utm_content
// If Klaviyo flow-actions API is unavailable (405/403), falls back gracefully:
// template is still created and template_id returned for manual flow wiring.
function klaviyoAddEmailStep(flowId, delayDays, emailData) {
  try {
    // Step 1: Create template
    var tplName = (emailData.email_id || 'tpl') + ' — ' + (emailData.subject || '').slice(0, 50);
    var tplHtml = emailData.html_body || '<p>(body pending)</p>';
    var tplResult = _klfCreateTemplate(tplName, tplHtml);
    if (!tplResult.ok) return { ok: false, phase: 'template', error: tplResult.error };
    var templateId = tplResult.template_id;

    // Step 2: Attempt delay action
    var delayResult = _klfFetch('POST', 'flow-actions/', {
      data: {
        type: 'flow-action',
        attributes: {
          action_type: 'DELAY',
          settings: { delay: Number(delayDays), delay_unit: 'DAYS' }
        },
        relationships: { flow: { data: { type: 'flow', id: flowId } } }
      }
    });
    var delayActionId = null;
    if (delayResult.code === 201 || delayResult.code === 200) {
      delayActionId = delayResult.data && delayResult.data.data && delayResult.data.data.id;
    } else {
      Logger.log('[KLF] flow-actions delay POST → HTTP ' + delayResult.code + ' — manual step required');
    }

    // Step 3: Attempt email action
    var emailResult = _klfFetch('POST', 'flow-actions/', {
      data: {
        type: 'flow-action',
        attributes: {
          action_type: 'EMAIL',
          status: 'draft',
          tracking_options: {
            utm_params: [
              { name: 'utm_source',   value: emailData.utm_source   || 'klaviyo' },
              { name: 'utm_medium',   value: emailData.utm_medium   || 'email' },
              { name: 'utm_campaign', value: emailData.utm_campaign || '' },
              { name: 'utm_content',  value: emailData.utm_content  || '' }
            ]
          }
        },
        relationships: { flow: { data: { type: 'flow', id: flowId } } }
      }
    });
    var emailActionId = null;
    if (emailResult.code === 201 || emailResult.code === 200) {
      emailActionId = emailResult.data && emailResult.data.data && emailResult.data.data.id;

      // Step 4: Attach template to email action via flow-message
      _klfFetch('POST', 'flow-messages/', {
        data: {
          type: 'flow-message',
          attributes: {
            channel: 'email',
            content: {
              subject:      emailData.subject      || '',
              preview_text: emailData.preview_text || '',
              from_email:   emailData.from_email   || _KLF_FROM_EMAIL,
              from_label:   emailData.from_name    || _KLF_FROM_NAME
            }
          },
          relationships: {
            'flow-action': { data: { type: 'flow-action', id: emailActionId } },
            template:      { data: { type: 'template',    id: templateId } }
          }
        }
      });
    } else {
      Logger.log('[KLF] flow-actions email POST → HTTP ' + emailResult.code + ' — manual step required');
    }

    var apiWired = !!(delayActionId && emailActionId);
    return {
      ok:             true,
      template_id:    templateId,
      delay_action_id: delayActionId,
      email_action_id: emailActionId,
      api_wired:      apiWired,
      manual_required: !apiWired
    };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── FUNCTION 5 — klaviyoSetFlowStatus ────────────────────────────────────────
function klaviyoSetFlowStatus(flowId, status) {
  try {
    status = (status === 'live') ? 'live' : 'draft';
    var result = _klfFetch('PATCH', 'flows/' + flowId + '/', {
      data: { type: 'flow', id: flowId, attributes: { status: status } }
    });
    if (result.code === 200) return { ok: true, flow_id: flowId, status: status };
    return { ok: false, error: _klfErr(result) };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── FUNCTION 6 — _klfBuildFlow (shared) ──────────────────────────────────────
function _klfBuildFlow(icpCode, flowLabel) {
  var flowName = 'EC-2026-001 · Flow ' + flowLabel + ' · ' +
    (icpCode === 'super_mom_money' ? 'Money Angle' : 'Time Angle');

  // Get all SEQ-1 + SEQ-2 emails for this ICP
  var allEmails = getEmailSequences(_KLF_CAMPAIGN_ID);
  var emails = allEmails.filter(function(e) {
    return String(e.icp_code) === icpCode &&
           _KLF_FLOW_SEQS.indexOf(String(e.sequence_code)) !== -1;
  }).sort(function(a, b) {
    var dayA = Number(a.send_day) || 0, dayB = Number(b.send_day) || 0;
    if (dayA !== dayB) return dayA - dayB;
    return Number(a.email_number || 0) - Number(b.email_number || 0);
  });

  if (!emails.length) return { ok: false, error: 'No emails found for ' + icpCode };

  // Gate: check for empty bodies
  var missingBodies = emails.filter(function(e) { return !String(e.full_email_body || '').trim(); });
  Logger.log('[KLF] ' + flowLabel + ': ' + emails.length + ' emails, ' + missingBodies.length + ' missing full_email_body');

  // Create flow shell — continues to template creation even on failure
  var flowResult = klaviyoCreateFlow(flowName, _KLF_LIST_ID, icpCode);
  var flowId = flowResult.flow_id || null;
  if (!flowResult.ok) {
    Logger.log('[KLF] Flow shell failed — continuing to create templates for manual flow wiring');
  }

  // Determine sequence campaign codes per index
  var seqCampaignCode = function(seqCode) {
    return seqCode === 'SEQ-1' ? 'seq1_welcome' : 'seq2_nurture';
  };

  var delays = (flowLabel === 'A') ? _KLF_FLOW_DELAYS_A : _KLF_FLOW_DELAYS_B;
  var steps = [];
  var templatesCreated = 0;
  var stepsWired = 0;

  emails.forEach(function(email, idx) {
    var delayDays = (idx < delays.length) ? delays[idx] : 1;
    var htmlBody  = _klfHtml(email);
    var emailData = {
      email_id:     email.id,
      subject:      String(email.subject_line  || ''),
      preview_text: String(email.preview_text  || ''),
      html_body:    htmlBody,
      from_name:    _KLF_FROM_NAME,
      from_email:   _KLF_FROM_EMAIL,
      utm_source:   'klaviyo',
      utm_medium:   'email',
      utm_campaign: seqCampaignCode(email.sequence_code),
      utm_content:  String(email.dl_id || '')
    };

    var stepResult = klaviyoAddEmailStep(flowId, delayDays, emailData);
    steps.push({
      email_id:    email.id,
      dl_id:       email.dl_id,
      subject:     email.subject_line,
      delay_days:  delayDays,
      template_id: stepResult.template_id,
      api_wired:   stepResult.api_wired,
      error:       stepResult.error || null
    });

    if (stepResult.template_id) {
      templatesCreated++;
      // Save template ID + flow ID back to sheet
      _klfWriteBack(email.id, 'seq_template_id', stepResult.template_id);
      _klfWriteBack(email.id, 'klaviyo_flow_id', flowId);
      _klfWriteBack(email.id, 'built_in_klaviyo', true);
    }
    if (stepResult.api_wired) stepsWired++;
  });

  // Save flow ID to CcSettings
  _klfSaveSetting('klaviyo_flow_id_' + flowLabel.toLowerCase(), flowId, flowName);

  Logger.log('[KLF] Flow ' + flowLabel + ' done — id=' + flowId +
    ' templates=' + templatesCreated + ' wired=' + stepsWired + '/' + emails.length);

  return {
    ok:                true,
    flow_id:           flowId,
    flow_shell_created: !!flowId,
    flow_name:         flowName,
    icp_code:          icpCode,
    list_id:           _KLF_LIST_ID,
    email_count:       emails.length,
    templates_created: templatesCreated,
    steps_api_wired:   stepsWired,
    api_wired:         stepsWired === emails.length && !!flowId,
    manual_required:   !flowId || stepsWired < emails.length,
    missing_bodies:    missingBodies.length,
    steps:             steps
  };
}

// ── FUNCTION 7 — klaviyoSubscribeWaitlistSignup ──────────────────────────────
// Called server-side on every waitlist form submit.
// Creates/updates Klaviyo profile with icp_code, then adds to list TebDTM.
// lp_variant 'a' → super_mom_money · 'b' → super_mom_time
function klaviyoSubscribeWaitlistSignup(email, lpVariant) {
  try {
    if (!email) return { ok: false, error: 'No email provided' };
    var icpCode = (String(lpVariant || '').toLowerCase() === 'b') ? 'super_mom_time' : 'super_mom_money';

    // Step 1: Create profile — handle 409 (already exists) by extracting ID
    var createResult = _klfFetch('POST', 'profiles/', {
      data: {
        type:       'profile',
        attributes: { email: email, properties: { icp_code: icpCode } }
      }
    });

    var profileId = null;
    if (createResult.code === 201) {
      profileId = createResult.data && createResult.data.data && createResult.data.data.id;
    } else if (createResult.code === 409) {
      var dupErr = createResult.data && createResult.data.errors && createResult.data.errors[0];
      profileId = dupErr && dupErr.meta && dupErr.meta.duplicate_profile_id;
      // Update icp_code on the existing profile
      if (profileId) {
        _klfFetch('PATCH', 'profiles/' + profileId + '/', {
          data: {
            type:       'profile',
            id:          profileId,
            attributes: { properties: { icp_code: icpCode } }
          }
        });
      }
    }

    if (!profileId) {
      Logger.log('[KLF] Subscribe: no profile ID for ' + email + ' (HTTP ' + createResult.code + ')');
      return { ok: false, error: 'Profile create/lookup failed (HTTP ' + createResult.code + ')' };
    }

    // Step 2: Add profile to list TebDTM — 204 = success, 400 = already a member (both ok)
    var listResult = _klfFetch('POST', 'lists/' + _KLF_LIST_ID + '/relationships/profiles/', {
      data: [{ type: 'profile', id: profileId }]
    });
    var addedToList = listResult.code === 204 || listResult.code === 200 || listResult.code === 400;

    Logger.log('[KLF] Subscribe: ' + email + ' icp=' + icpCode + ' profile=' + profileId + ' list_http=' + listResult.code);
    return {
      ok:           true,
      profile_id:   profileId,
      icp_code:     icpCode,
      list_id:      _KLF_LIST_ID,
      added_to_list: addedToList
    };
  } catch(e) {
    Logger.log('[KLF] klaviyoSubscribeWaitlistSignup error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── FUNCTION 8 — klaviyoBuildFlowA ───────────────────────────────────────────
function klaviyoBuildFlowA() {
  Logger.log('[KLF] Building Flow A (super_mom_money)');
  return _klfBuildFlow('super_mom_money', 'A');
}

// ── FUNCTION 8 — klaviyoBuildFlowB ───────────────────────────────────────────
function klaviyoBuildFlowB() {
  Logger.log('[KLF] Building Flow B (super_mom_time)');
  return _klfBuildFlow('super_mom_time', 'B');
}

// ── FUNCTION 9 — klaviyoScheduleCampaigns ────────────────────────────────────
// Creates 14 scheduled campaigns: SEQ-3 (4 pairs) + SEQ-4 (3 pairs)
// Each pair = one campaign for Variant A + one for Variant B.
// Dates computed from _klfStartDate() + email.send_day.
function klaviyoScheduleCampaigns() {
  try {
    var results = { ok: true, campaigns_created: 0, errors: [], campaigns: [] };

    // Get/create A+B segments
    var segA = _klfGetOrCreateSegment(
      'klaviyo_segment_id_a',
      'EC-2026-001 — Variant A (super_mom_money)',
      'super_mom_money'
    );
    var segB = _klfGetOrCreateSegment(
      'klaviyo_segment_id_b',
      'EC-2026-001 — Variant B (super_mom_time)',
      'super_mom_time'
    );

    // Read all campaign emails
    var allEmails = getEmailSequences(_KLF_CAMPAIGN_ID);
    var campEmails = allEmails.filter(function(e) {
      return _KLF_CAMP_SEQS.indexOf(String(e.sequence_code)) !== -1;
    });

    // Group into pairs by sequence_code + email_number
    var pairs = {};
    campEmails.forEach(function(e) {
      var key = String(e.sequence_code) + '-E' + String(e.email_number);
      if (!pairs[key]) pairs[key] = {};
      var icp = String(e.icp_code || '');
      if (icp === 'super_mom_money') pairs[key].a = e;
      else if (icp === 'super_mom_time') pairs[key].b = e;
    });

    var pairKeys = Object.keys(pairs).sort();

    pairKeys.forEach(function(pairKey) {
      var pair   = pairs[pairKey];
      var emailA = pair.a;
      var emailB = pair.b;
      if (!emailA && !emailB) return;

      var refEmail  = emailA || emailB;
      var sendDay   = Number(refEmail.send_day) || 0;
      var sendAt    = _klfSendAt(sendDay);
      var seqCode   = String(refEmail.sequence_code);
      var utmCamp   = (seqCode === 'SEQ-3') ? 'seq3_urgency' : 'seq4_launch_day';

      [{ email: emailA, variant: 'A', segId: segA.segment_id },
       { email: emailB, variant: 'B', segId: segB.segment_id }
      ].forEach(function(item) {
        var email = item.email;
        if (!email) return;

        var campName = 'EC-2026-001 · ' + seqCode + ' · ' + pairKey + ' · Variant ' + item.variant;

        // Create template
        var tplResult = _klfCreateTemplate(
          campName + ' — ' + String(email.subject_line || '').slice(0, 60),
          _klfHtml(email)
        );

        // Create campaign — 2025-04-15 schema:
        // - no top-level channel attribute
        // - send_strategy.datetime at top level (not in options_static)
        // - campaign-messages in attributes with definition: { channel: "email" }
        var campPayload = {
          data: {
            type: 'campaign',
            attributes: {
              name:     campName,
              audiences: { included: [item.segId], excluded: [] },
              send_options: { use_smart_sending: false },
              tracking_options: {
                is_tracking_opens:  true,
                is_tracking_clicks: true
              },
              send_strategy: {
                method:   'static',
                datetime: sendAt
              },
              'campaign-messages': {
                data: [{
                  type:       'campaign-message',
                  attributes: { definition: { channel: 'email' } }
                }]
              }
            }
          }
        };

        var campResult = _klfFetch('POST', 'campaigns/', campPayload);
        if (campResult.code !== 201 && campResult.code !== 200) {
          var errMsg = _klfErr(campResult);
          results.errors.push({ pair: pairKey, variant: item.variant, error: errMsg });
          results.campaigns.push({ pair: pairKey, variant: item.variant, ok: false, error: errMsg });
          Logger.log('[KLF] Campaign create failed: ' + pairKey + ' ' + item.variant + ' — ' + errMsg);
          return;
        }

        var campId = campResult.data && campResult.data.data && campResult.data.data.id;

        // Get campaign message ID from response relationships
        var msgId = null;
        try {
          var rels = campResult.data.data.relationships;
          var msgData = rels && rels['campaign-messages'] && rels['campaign-messages'].data;
          if (msgData && msgData.length) msgId = msgData[0].id;
        } catch(re) {}

        // If not in response, fetch it
        if (!msgId) {
          var msgFetch = _klfFetch('GET', 'campaigns/' + campId + '/campaign-messages/');
          if (msgFetch.code === 200 && msgFetch.data.data && msgFetch.data.data.length) {
            msgId = msgFetch.data.data[0].id;
          }
        }

        // Patch campaign message — 2025-04-15: content in definition.content, not attributes.content
        if (msgId) {
          var msgPatch = {
            data: {
              type: 'campaign-message',
              id:   msgId,
              attributes: {
                definition: {
                  channel: 'email',
                  content: {
                    subject:      String(email.subject_line  || ''),
                    preview_text: String(email.preview_text  || ''),
                    from_email:   _KLF_FROM_EMAIL,
                    from_label:   _KLF_FROM_NAME
                  }
                }
              }
            }
          };
          if (tplResult.ok) {
            msgPatch.data.relationships = {
              template: { data: { type: 'template', id: tplResult.template_id } }
            };
          }
          var patchResult = _klfFetch('PATCH', 'campaign-messages/' + msgId + '/', msgPatch);
          Logger.log('[KLF] Campaign message patch → HTTP ' + patchResult.code);
        }

        // Write back to sheet
        _klfWriteBack(email.id, 'seq_template_id', tplResult.ok ? tplResult.template_id : '');
        _klfWriteBack(email.id, 'built_in_klaviyo', true);
        if (campId) _klfWriteBack(email.id, 'klaviyo_id', campId);

        results.campaigns_created++;
        results.campaigns.push({
          pair:        pairKey,
          variant:     item.variant,
          ok:          true,
          campaign_id: campId,
          message_id:  msgId,
          template_id: tplResult.ok ? tplResult.template_id : null,
          send_at:     sendAt,
          dl_id:       String(email.dl_id || ''),
          subject:     String(email.subject_line || '')
        });

        Logger.log('[KLF] Campaign created: ' + campId + ' — ' + campName + ' (' + sendAt + ')');
      });
    });

    Logger.log('[KLF] klaviyoScheduleCampaigns done — ' + results.campaigns_created + ' created, ' + results.errors.length + ' errors');
    return results;
  } catch(e) {
    Logger.log('[KLF] klaviyoScheduleCampaigns error: ' + e.message);
    return { ok: false, error: e.message };
  }
}
