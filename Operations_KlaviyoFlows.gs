// ── Operations_KlaviyoFlows.gs ────────────────────────────────────────────────
// EC-2026-001 Klaviyo Flow Automation
// Builds Flow A (super_mom_money) + Flow B (super_mom_time) from Sheet data.
// Schedules SEQ-3 (urgency) + SEQ-4 (launch) as time-specific campaigns.
// Script Properties key: klaviyo_private_key

var _KLF_BASE      = 'https://a.klaviyo.com/api';
var _KLF_REVISION  = '2025-04-15';
var _KLF_LIST_ID          = 'TebDTM';
var _KLF_ALPHA_LIST_ID    = 'UPRemk';  // EC Alpha Users — triggers Alpha flow
var _KLF_ORGANIC_LIST_ID  = 'TpXCkr';  // EC Organic Welcome — triggers ORG flow
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

// Read campaign start date from CcSettings; default May 27 2026.
// Uses _cvtReadSetting (returns scalar string) not _getCcSetting (returns array).
function _klfStartDate() {
  var raw = _cvtReadSetting('campaign_start_date');
  if (raw) {
    var d = new Date(raw);
    if (!isNaN(d.getTime())) return d;
    Logger.log('[KLF] _klfStartDate: unparseable "' + raw + '", using default');
  }
  return new Date(Date.UTC(2026, 4, 27)); // May 27 2026 midnight UTC
}

// Compute ISO send datetime from send_day offset.
// Reads campaign_send_hour (default 9) and campaign_timezone_offset (default -4 = EDT)
// from CcSettings. Uses _cvtReadSetting which returns a scalar string value.
// Example: hour=9, tzOff=-4 → utcHour=13 → 9am EDT = 1pm UTC.
function _klfSendAt(sendDay) {
  var tzOff = Number(_cvtReadSetting('campaign_timezone_offset') || '') || -4;
  var hour  = Number(_cvtReadSetting('campaign_send_hour') || '') || 9;
  var start = _klfStartDate();
  var utcMidnight = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  var utcSendHour = (hour - tzOff + 24) % 24;
  var d = new Date(utcMidnight + Number(sendDay) * 86400000 + utcSendHour * 3600000);
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

function _klfPatchTemplate(templateId, findUrl, replaceUrl) {
  var getResult = _klfFetch('GET', 'templates/' + templateId + '/', null);
  if (getResult.code !== 200) return { ok: false, error: 'GET template failed: ' + _klfErr(getResult) };
  var attrs = getResult.data && getResult.data.data && getResult.data.data.attributes;
  if (!attrs) return { ok: false, error: 'No attributes in template response' };
  var html = attrs.html || '';
  if (html.indexOf(findUrl) === -1) return { ok: false, error: 'URL not found in template HTML', searched_for: findUrl };
  var newHtml = html.split(findUrl).join(replaceUrl);
  var patchResult = _klfFetch('PATCH', 'templates/' + templateId + '/', {
    data: { type: 'template', id: templateId, attributes: { html: newHtml } }
  });
  if (patchResult.code === 200 || patchResult.code === 204) {
    Logger.log('[KLF] Template ' + templateId + ' URL patched: ' + findUrl + ' → ' + replaceUrl);
    return { ok: true, template_id: templateId, replacements: (html.split(findUrl).length - 1) };
  }
  return { ok: false, error: _klfErr(patchResult), code: patchResult.code };
}

// ── klaviyoUpdateTemplateHtml — replace full HTML on an existing template ─────
function klaviyoUpdateTemplateHtml(templateId, htmlBody) {
  if (!templateId) return { ok: false, error: 'template_id required' };
  if (!htmlBody)   return { ok: false, error: 'html required' };
  var result = _klfFetch('PATCH', 'templates/' + templateId + '/', {
    data: { type: 'template', id: templateId, attributes: { html: htmlBody } }
  });
  if (result.code === 200 || result.code === 204) {
    Logger.log('[KLF] Template ' + templateId + ' HTML replaced');
    return { ok: true, template_id: templateId };
  }
  return { ok: false, error: _klfErr(result), code: result.code };
}

// ── klaviyoCreateNamedTemplate — create new template, return ID ───────────────
function klaviyoCreateNamedTemplate(name, htmlBody) {
  if (!name)     return { ok: false, error: 'name required' };
  if (!htmlBody) return { ok: false, error: 'html required' };
  return _klfCreateTemplate(name, htmlBody);
}

// ── FUNCTION 2 — Get or create A/B segments ──────────────────────────────────
function _klfGetOrCreateSegment(segmentKey, segmentName, icpCode) {
  // Check CcSettings first
  var stored = _klfReadSetting(segmentKey);
  if (stored) { Logger.log('[KLF] Segment cached: ' + segmentKey + '=' + stored); return { ok: true, segment_id: stored }; }

  // Create segment via API — two format attempts for custom property compatibility
  var payloads = [
    // Format A: 2025-04-15 custom property format
    { data: { type: 'segment', attributes: { name: segmentName, definition: { condition_groups: [{
      conditions: [{ type: 'PROFILE', property: 'icp_code', operator: 'EQUALS', value: icpCode }]
    }] } } } },
    // Format B: older profile-property format
    { data: { type: 'segment', attributes: { name: segmentName, definition: { condition_groups: [{
      conditions: [{ type: 'profile-property', profile_property: 'icp_code', operator: 'equals', value: icpCode }]
    }] } } } }
  ];

  var result = null;
  for (var pi = 0; pi < payloads.length; pi++) {
    result = _klfFetch('POST', 'segments/', payloads[pi]);
    if (result.code === 201 || result.code === 200) break;
    Logger.log('[KLF] Segment format ' + pi + ' failed (' + result.code + '): ' + _klfErr(result));
  }

  if (result && (result.code === 201 || result.code === 200)) {
    var id = result.data && result.data.data && result.data.data.id;
    _klfSaveSetting(segmentKey, id, segmentName);
    Logger.log('[KLF] Segment created: ' + id + ' — ' + segmentName);
    return { ok: true, segment_id: id };
  }

  // Final fallback: create a variant-specific list and use it as the audience
  Logger.log('[KLF] All segment formats failed — creating variant list for ' + segmentKey);
  var listName = segmentKey === 'klaviyo_segment_id_a' ? 'EC Variant A (Money)' : 'EC Variant B (Time)';
  var lr = klaviyoCreateList(listName);
  if (lr.ok) {
    _klfSaveSetting(segmentKey, lr.list_id, listName + ' (list fallback)');
    Logger.log('[KLF] Variant list created: ' + lr.list_id + ' — ' + listName);
    return { ok: true, segment_id: lr.list_id, list_fallback: true, list_id: lr.list_id };
  }
  // Absolute last resort
  Logger.log('[KLF] List create also failed — using TebDTM fallback');
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

// ── FUNCTION 5 — klaviyoBuildSequenceTemplates ───────────────────────────────
// Reads all emails in a sequence, creates Klaviyo templates for those missing
// seq_template_id, writes IDs back to the sheet.
// seqCode: 'QST' | 'OB' | 'ORG' | 'ALPHA' | 'BETA' (or any sequence_code value)
function klaviyoBuildSequenceTemplates(seqCode) {
  if (!seqCode) return { ok: false, error: 'seqCode required' };
  var all = getEmailSequences(_KLF_CAMPAIGN_ID) || [];
  var emails = all.filter(function(e) {
    return e.sequence_code === seqCode && !String(e.seq_template_id || '').trim();
  });
  Logger.log('[KLF] buildSeqTemplates ' + seqCode + ': ' + emails.length + ' without templates');
  if (!emails.length) return { ok: true, sequence_code: seqCode, created: 0, message: 'All templates already exist' };

  var results = [];
  emails.forEach(function(email) {
    var full = String(email.full_email_body || '').trim();
    // Wrap plain-text body in HTML paragraphs if no HTML tags present
    var htmlBody;
    if (/<[a-z][\s\S]*>/i.test(full)) {
      htmlBody = full;
    } else {
      var paras = full.split(/\n\n+/).map(function(p) {
        return '<p style="margin:0 0 16px 0">' + p.replace(/\n/g, '<br>') + '</p>';
      }).join('');
      htmlBody = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
        '<body style="font-family:Georgia,serif;font-size:16px;line-height:1.7;color:#222;' +
        'max-width:600px;margin:0 auto;padding:32px 24px">' +
        paras + '</body></html>';
    }
    var tplName = email.id + ' — ' + String(email.subject_line || '').slice(0, 50);
    var tplResult = _klfCreateTemplate(tplName, htmlBody);
    var r = {
      id: email.id,
      subject: email.subject_line,
      ok: tplResult.ok,
      template_id: tplResult.ok ? tplResult.template_id : null,
      error: tplResult.error || null
    };
    results.push(r);
    if (tplResult.ok && tplResult.template_id) {
      _klfWriteBack(email.id, 'seq_template_id', tplResult.template_id);
      _klfWriteBack(email.id, 'built_in_klaviyo', true);
    }
    Logger.log('[KLF] ' + email.id + ' → ' + (tplResult.ok ? tplResult.template_id : 'FAIL: ' + tplResult.error));
  });
  var created = results.filter(function(r) { return r.ok; }).length;
  return { ok: true, sequence_code: seqCode, checked: emails.length, created: created, results: results };
}

// ── FUNCTION 6 — klaviyoSetFlowStatus ────────────────────────────────────────
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

// ── klaviyoGetFlowStatuses ────────────────────────────────────────────────────
function klaviyoGetFlowStatuses() {
  var flowIds = ['XfqUtU', 'XCyc4m', 'QYwGdj', 'TNSTZr', 'VnfgA4', 'Tr87zQ', 'SpiMfa'];
  var results = [];
  flowIds.forEach(function(id) {
    var r = _klfFetch('GET', 'flows/' + id + '/?fields[flow]=name,status,trigger_type');
    if (r.code === 200 && r.data && r.data.data) {
      var attrs = r.data.data.attributes || {};
      results.push({ id: id, name: attrs.name || '', status: attrs.status || '', trigger_type: attrs.trigger_type || '' });
    } else {
      results.push({ id: id, error: r.code + ': ' + _klfErr(r) });
    }
  });
  return { ok: true, flows: results };
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
// Creates/updates Klaviyo profile with icp_code, then adds to the appropriate list:
//   lp_variant 'a'       → super_mom_money  → TebDTM  (triggers Flow A)
//   lp_variant 'b'       → super_mom_time   → TebDTM  (triggers Flow B)
//   lp_variant 'organic' → organic          → TpXCkr  (triggers ORG Welcome flow)
function klaviyoSubscribeWaitlistSignup(email, lpVariant) {
  try {
    if (!email) return { ok: false, error: 'No email provided' };
    var variant  = String(lpVariant || '').toLowerCase();
    var isOrganic = variant === 'organic';
    var icpCode  = isOrganic ? 'organic' : (variant === 'b' ? 'super_mom_time' : 'super_mom_money');
    var targetListId = isOrganic ? _KLF_ORGANIC_LIST_ID : _KLF_LIST_ID;

    // Step 1: Create profile — handle 409 (already exists) by extracting ID
    var createResult = _klfFetch('POST', 'profiles/', {
      data: {
        type:       'profile',
        attributes: { email: email, properties: { icp_code: icpCode, founder_status: 'waitlist' } }
      }
    });

    var profileId = null;
    if (createResult.code === 201) {
      profileId = createResult.data && createResult.data.data && createResult.data.data.id;
    } else if (createResult.code === 409) {
      var dupErr = createResult.data && createResult.data.errors && createResult.data.errors[0];
      profileId = dupErr && dupErr.meta && dupErr.meta.duplicate_profile_id;
      if (profileId) {
        _klfFetch('PATCH', 'profiles/' + profileId + '/', {
          data: {
            type:       'profile',
            id:          profileId,
            attributes: { properties: { icp_code: icpCode, founder_status: 'waitlist' } }
          }
        });
      }
    }

    if (!profileId) {
      Logger.log('[KLF] Subscribe: no profile ID for ' + email + ' (HTTP ' + createResult.code + ')');
      return { ok: false, error: 'Profile create/lookup failed (HTTP ' + createResult.code + ')' };
    }

    // Step 2: Add profile to primary list (TebDTM or TpXCkr)
    var listResult = _klfFetch('POST', 'lists/' + targetListId + '/relationships/profiles/', {
      data: [{ type: 'profile', id: profileId }]
    });
    var addedToList = listResult.code === 204 || listResult.code === 200 || listResult.code === 400;

    // Step 3: Also add to variant-specific list (UQTdyL for A, VpgZPZ for B)
    // These lists drive SEQ-3/4 campaign audiences
    var variantListId = null;
    if (!isOrganic) {
      variantListId = icpCode === 'super_mom_money'
        ? (_cvtReadSetting('klaviyo_segment_id_a') || '')
        : (_cvtReadSetting('klaviyo_segment_id_b') || '');
      if (variantListId && variantListId !== _KLF_LIST_ID) {
        _klfFetch('POST', 'lists/' + variantListId + '/relationships/profiles/', {
          data: [{ type: 'profile', id: profileId }]
        });
      }
    }

    Logger.log('[KLF] Subscribe: ' + email + ' icp=' + icpCode + ' profile=' + profileId + ' list=' + targetListId + ' variant_list=' + (variantListId || 'n/a') + ' http=' + listResult.code);
    return {
      ok:           true,
      profile_id:   profileId,
      icp_code:     icpCode,
      list_id:      targetListId,
      variant_list_id: variantListId,
      added_to_list: addedToList
    };
  } catch(e) {
    Logger.log('[KLF] klaviyoSubscribeWaitlistSignup error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── klaviyoAddPlaceholderToVariantLists ───────────────────────────────────────
// ── klaviyoConnectionStatus ───────────────────────────────────────────────────
// Checks if klaviyo_private_key is set and valid by calling GET /accounts/.
// Returns { ok, connected, account_name, account_id, api_key_set, error }
function klaviyoConnectionStatus() {
  try {
    var key = _klfApiKey();
    if (!key) {
      return { ok: true, connected: false, api_key_set: false, account_name: null, account_id: null, error: 'klaviyo_private_key not set in Script Properties' };
    }
    var r = _klfFetch('GET', 'accounts/', null);
    if (r.code === 200) {
      var accounts = (r.data && r.data.data) || [];
      var acc = accounts[0] || {};
      var attrs = acc.attributes || {};
      return {
        ok:           true,
        connected:    true,
        api_key_set:  true,
        account_name: attrs.contact_information && attrs.contact_information.organization_name
                      ? attrs.contact_information.organization_name
                      : (attrs.public_api_key || acc.id || 'Klaviyo'),
        account_id:   acc.id || null
      };
    }
    return { ok: true, connected: false, api_key_set: true, account_name: null, account_id: null, error: 'API key invalid — HTTP ' + r.code };
  } catch(e) {
    return { ok: false, connected: false, api_key_set: false, error: e.message };
  }
}

// ── klaviyoSetApiKey ──────────────────────────────────────────────────────────
// Stores a Klaviyo private API key in Script Properties and verifies it.
// Returns { ok, connected, account_name }
function klaviyoSetApiKey(key) {
  if (!key) return { ok: false, error: 'key required' };
  PropertiesService.getScriptProperties().setProperty('klaviyo_private_key', String(key).trim());
  Logger.log('[KLF] klaviyo_private_key updated');
  return klaviyoConnectionStatus();
}

// Adds a placeholder profile to UQTdyL (Variant A) and VpgZPZ (Variant B) so
// campaigns targeting these lists don't auto-cancel due to zero recipients.
function klaviyoAddPlaceholderToVariantLists() {
  try {
    var listAId = _cvtReadSetting('klaviyo_segment_id_a');
    var listBId = _cvtReadSetting('klaviyo_segment_id_b');
    if (!listAId) return { ok: false, error: 'klaviyo_segment_id_a missing from CcSettings' };
    if (!listBId) return { ok: false, error: 'klaviyo_segment_id_b missing from CcSettings' };

    var emails = ['test@digitalgalactica.dev', 'admin@digitalgalactica.dev'];
    var lists  = [{ id: listAId, name: 'UQTdyL Variant A' }, { id: listBId, name: 'VpgZPZ Variant B' }];
    var results = { ok: true, profiles: [], list_adds: [] };

    // Create or find each profile, then add to both lists
    emails.forEach(function(email) {
      var cr = _klfFetch('POST', 'profiles/', {
        data: { type: 'profile', attributes: { email: email, properties: { placeholder: true } } }
      });
      var pid = null;
      if (cr.code === 201) {
        pid = cr.data && cr.data.data && cr.data.data.id;
      } else if (cr.code === 409) {
        var dupErr = cr.data && cr.data.errors && cr.data.errors[0];
        pid = dupErr && dupErr.meta && dupErr.meta.duplicate_profile_id;
      }
      Logger.log('[KLF] Profile ' + email + ' → HTTP ' + cr.code + ' pid=' + pid);
      results.profiles.push({ email: email, http: cr.code, profile_id: pid });
      if (!pid) return;

      lists.forEach(function(list) {
        var r = _klfFetch('POST', 'lists/' + list.id + '/relationships/profiles/', {
          data: [{ type: 'profile', id: pid }]
        });
        var ok = r.code === 204 || r.code === 200 || r.code === 400;
        Logger.log('[KLF] Add ' + email + ' to ' + list.name + ' → HTTP ' + r.code);
        results.list_adds.push({ email: email, list: list.name, list_id: list.id, http: r.code, ok: ok });
      });
    });

    // Verify counts after adding
    Utilities.sleep(1000);
    lists.forEach(function(list) {
      var cr = _klfFetch('GET', 'lists/' + list.id + '/profiles/?page[size]=10&fields[profile]=email');
      var count = (cr.data && cr.data.data && cr.data.data.length) || 0;
      var total = (cr.data && cr.data.meta && cr.data.meta.total) || count;
      Logger.log('[KLF] List ' + list.name + ' member count: ' + total);
      results['count_' + list.id] = total;
    });

    results.ok = results.list_adds.length > 0;
    return results;
  } catch(e) {
    Logger.log('[KLF] klaviyoAddPlaceholderToVariantLists error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── klaviyoSeedRealProfile ────────────────────────────────────────────────────
// Creates/finds a real profile and adds it to UQTdyL, VpgZPZ, and TebDTM.
// Accepts: { email, first_name, icp_code }
function klaviyoSeedRealProfile(params) {
  try {
    params = params || {};
    var email     = String(params.email      || '');
    var firstName = String(params.first_name || '');
    var icpCode   = String(params.icp_code   || '');
    if (!email) return { ok: false, error: 'email required' };

    var listAId = _cvtReadSetting('klaviyo_segment_id_a');
    var listBId = _cvtReadSetting('klaviyo_segment_id_b');
    if (!listAId) return { ok: false, error: 'klaviyo_segment_id_a missing from CcSettings' };
    if (!listBId) return { ok: false, error: 'klaviyo_segment_id_b missing from CcSettings' };

    var attrs = { email: email };
    if (firstName) attrs.first_name = firstName;
    if (icpCode)   attrs.properties = { icp_code: icpCode };

    // Create or find profile
    var cr = _klfFetch('POST', 'profiles/', { data: { type: 'profile', attributes: attrs } });
    var pid = null;
    if (cr.code === 201) {
      pid = cr.data && cr.data.data && cr.data.data.id;
    } else if (cr.code === 409) {
      var dupErr = cr.data && cr.data.errors && cr.data.errors[0];
      pid = dupErr && dupErr.meta && dupErr.meta.duplicate_profile_id;
    }
    if (!pid) return { ok: false, error: 'Could not create/find profile for ' + email + ' (HTTP ' + cr.code + ')' };
    Logger.log('[KLF] SeedRealProfile ' + email + ' pid=' + pid);

    // Add to UQTdyL, VpgZPZ, TebDTM
    var targetLists = [
      { id: listAId, name: 'UQTdyL Variant A' },
      { id: listBId, name: 'VpgZPZ Variant B' },
      { id: 'TebDTM', name: 'TebDTM Prelaunch' }
    ];
    var adds = [];
    targetLists.forEach(function(list) {
      var r = _klfFetch('POST', 'lists/' + list.id + '/relationships/profiles/', {
        data: [{ type: 'profile', id: pid }]
      });
      var ok = r.code === 204 || r.code === 200 || r.code === 400;
      Logger.log('[KLF] Add ' + email + ' to ' + list.name + ' → HTTP ' + r.code);
      adds.push({ list: list.name, list_id: list.id, http: r.code, ok: ok });
    });

    // Verify list counts
    Utilities.sleep(1000);
    var counts = {};
    [{ id: listAId, name: 'UQTdyL' }, { id: listBId, name: 'VpgZPZ' }].forEach(function(list) {
      var cr2 = _klfFetch('GET', 'lists/' + list.id + '/profiles/?page[size]=10&fields[profile]=email');
      var total = (cr2.data && cr2.data.meta && cr2.data.meta.total) ||
                  (cr2.data && cr2.data.data && cr2.data.data.length) || 0;
      counts[list.name] = total;
    });

    return { ok: true, email: email, profile_id: pid, list_adds: adds, list_counts: counts };
  } catch(e) {
    Logger.log('[KLF] klaviyoSeedRealProfile error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── klaviyoCheckSignup — e2e diagnostic ──────────────────────────────────────
// Returns profile properties + list membership for a given email.
// Used for end-to-end system tests.
function klaviyoCheckSignup(email) {
  try {
    if (!email) return { ok: false, error: 'email required' };

    // Step 1: Find profile by email
    var pr = _klfFetch('GET', 'profiles/?filter=equals(email,' + encodeURIComponent(JSON.stringify(email)) + ')&fields[profile]=email,first_name,properties&page[size]=1');
    if (pr.code !== 200) return { ok: false, error: 'profiles GET ' + pr.code + ': ' + _klfErr(pr) };
    var profiles = pr.data && pr.data.data;
    if (!profiles || !profiles.length) return { ok: false, error: 'profile not found for ' + email };

    var profile    = profiles[0];
    var profileId  = profile.id;
    var props      = (profile.attributes && profile.attributes.properties) || {};
    var firstName  = (profile.attributes && profile.attributes.first_name) || '';

    // Step 2: Get list membership via relationships endpoint
    Utilities.sleep(300);
    var lr = _klfFetch('GET', 'profiles/' + profileId + '/relationships/lists/?page[size]=50');
    var listIds = [];
    if (lr.code === 200 && lr.data && lr.data.data) {
      listIds = lr.data.data.map(function(l) { return l.id; });
    }
    var onTebDTM = listIds.indexOf('TebDTM') !== -1;
    var onTpXCkr = listIds.indexOf('TpXCkr') !== -1;
    var onUPRemk = listIds.indexOf('UPRemk') !== -1;
    var onUQTdyL = listIds.indexOf('UQTdyL') !== -1;
    var onVpgZPZ = listIds.indexOf('VpgZPZ') !== -1;
    var onWBbASK = listIds.indexOf('WBbASK') !== -1;
    var lists    = listIds.map(function(id) { return { id: id }; });

    // Step 3: Check recent events (include=metric to get event name from relationship)
    Utilities.sleep(200);
    var er = _klfFetch('GET', 'events/?filter=equals(profile_id,%22' + profileId + '%22)&sort=-datetime&page[size]=10&include=metric');
    var events = [];
    var eventsCode = er.code;
    if (er.code === 200 && er.data && er.data.data) {
      // Build metric name lookup from included
      var metricNames = {};
      if (er.data.included) {
        er.data.included.forEach(function(inc) {
          if (inc.type === 'metric' && inc.id) {
            metricNames[inc.id] = (inc.attributes && inc.attributes.name) || inc.id;
          }
        });
      }
      events = er.data.data.map(function(e) {
        var metricId = e.relationships && e.relationships.metric && e.relationships.metric.data && e.relationships.metric.data.id;
        return {
          name:     metricNames[metricId] || metricId || 'unknown',
          datetime: (e.attributes && e.attributes.datetime) || ''
        };
      });
    }

    return {
      ok:         true,
      email:      email,
      profile_id: profileId,
      first_name: firstName,
      icp_code:        props.icp_code        || null,
      founder_status:  props.founder_status  || null,
      lp_variant:      props.lp_variant      || null,
      alpha_selected:  props.alpha_selected  || null,
      lists:      lists,
      list_checks: {
        TebDTM_prelaunch: onTebDTM,
        TpXCkr_organic:   onTpXCkr,
        UPRemk_alpha:     onUPRemk,
        UQTdyL_varA:      onUQTdyL,
        VpgZPZ_varB:      onVpgZPZ,
        WBbASK_qst:       onWBbASK
      },
      recent_events:  events,
      events_status:  eventsCode
    };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── FUNCTION 7b — klaviyoSubscribeQuestionnaire ──────────────────────────────
// Called on alpha questionnaire submit.
// Creates/updates Klaviyo profile with lp_variant='questionnaire' + alpha_selected='true',
// then adds to list WBbASK (EC QST Submitted) which triggers the QST Confirm flow.
function klaviyoSubscribeQuestionnaire(email, firstName) {
  try {
    if (!email) return { ok: false, error: 'No email provided' };

    var createResult = _klfFetch('POST', 'profiles/', {
      data: {
        type:       'profile',
        attributes: {
          email:      email,
          first_name: firstName || '',
          properties: { lp_variant: 'questionnaire', alpha_selected: 'true' }
        }
      }
    });

    var profileId = null;
    if (createResult.code === 201) {
      profileId = createResult.data && createResult.data.data && createResult.data.data.id;
    } else if (createResult.code === 409) {
      var dupErr = createResult.data && createResult.data.errors && createResult.data.errors[0];
      profileId = dupErr && dupErr.meta && dupErr.meta.duplicate_profile_id;
      if (profileId) {
        _klfFetch('PATCH', 'profiles/' + profileId + '/', {
          data: {
            type:       'profile',
            id:          profileId,
            attributes: {
              first_name: firstName || '',
              properties: { lp_variant: 'questionnaire', alpha_selected: 'true' }
            }
          }
        });
      }
    }

    if (!profileId) {
      Logger.log('[KLF] QST Subscribe: no profile ID for ' + email + ' (HTTP ' + createResult.code + ')');
      return { ok: false, error: 'Profile create/lookup failed (HTTP ' + createResult.code + ')' };
    }

    var qstListId = _cvtReadSetting('klaviyo_qst_list_id') || 'WBbASK';
    var listResult = _klfFetch('POST', 'lists/' + qstListId + '/relationships/profiles/', {
      data: [{ type: 'profile', id: profileId }]
    });
    var added = listResult.code === 204 || listResult.code === 200 || listResult.code === 400;

    Logger.log('[KLF] QST Subscribe: ' + email + ' profile=' + profileId + ' list=' + qstListId + ' http=' + listResult.code);
    return { ok: true, profile_id: profileId, list_id: qstListId, added_to_list: added };
  } catch(e) {
    Logger.log('[KLF] klaviyoSubscribeQuestionnaire error: ' + e.message);
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

// ── FUNCTION 10 — klaviyoSetFounderStatus ────────────────────────────────────
// Rule 5: Update founder_status on a Klaviyo profile.
// Valid values: 'waitlist' | 'alpha_selected' | 'installed' | 'founding_member'
// When status = 'alpha_selected', also adds profile to EC Alpha Users list (UPRemk)
// to trigger the Alpha flow automatically.
function klaviyoSetFounderStatus(profileId, status) {
  try {
    if (!profileId || !status) return { ok: false, error: 'profileId and status required' };
    var result = _klfFetch('PATCH', 'profiles/' + profileId + '/', {
      data: {
        type:       'profile',
        id:          profileId,
        attributes: { properties: { founder_status: status } }
      }
    });
    var ok = result.code === 200;

    // Alpha selection: also add to EC Alpha Users list to trigger Alpha flow
    var addedToAlphaList = false;
    if (ok && status === 'alpha_selected') {
      var listResult = _klfFetch('POST', 'lists/' + _KLF_ALPHA_LIST_ID + '/relationships/profiles/', {
        data: [{ type: 'profile', id: profileId }]
      });
      addedToAlphaList = listResult.code === 204 || listResult.code === 200 || listResult.code === 400;
      Logger.log('[KLF] SetFounderStatus: alpha_selected — added to EC Alpha Users list (HTTP ' + listResult.code + ')');
    }

    return { ok: ok, code: result.code, added_to_alpha_list: addedToAlphaList };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── FUNCTION 11 — klaviyoCreateFounderSuppressionSegment ─────────────────────
// Rule 4: Creates "Already a Founder" segment — all profiles in list TebDTM.
// Segment ID saved to CcSettings as klaviyo_suppression_segment_id.
function klaviyoCreateFounderSuppressionSegment() {
  try {
    var existingId = _klfReadSetting('klaviyo_suppression_segment_id');
    if (existingId) return { ok: true, segment_id: existingId, existed: true };
    var result = _klfFetch('POST', 'segments/', {
      data: {
        type: 'segment',
        attributes: {
          name: 'Already a Founder',
          definition: {
            condition_groups: [{
              conditions: [{
                type:             'profile-property',
                profile_property: 'founder_status',
                operator:         'equals',
                value:             'waitlist'
              }]
            }]
          }
        }
      }
    });
    if (result.code === 201 || result.code === 200) {
      var segId = result.data && result.data.data && result.data.data.id;
      if (segId) {
        _klfSaveSetting('klaviyo_suppression_segment_id', segId, 'Already a Founder');
        return { ok: true, segment_id: segId, created: true };
      }
    }
    return { ok: false, error: _klfErr(result), code: result.code };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── FUNCTION 12 — klaviyoDeleteScheduledCampaigns ────────────────────────────
// Cancels and deletes all EC-2026-001 scheduled campaigns so they can be
// recreated via klaviyoScheduleCampaigns() after timezone/date fixes.
function klaviyoDeleteScheduledCampaigns() {
  try {
    var results = { ok: true, found: 0, deleted: 0, errors: [], campaign_ids: [] };
    var listResult = _klfFetch('GET', "campaigns/?filter=equals(messages.channel,'email')&page[size]=50&fields[campaign]=name,status");
    if (listResult.code !== 200) return { ok: false, error: _klfErr(listResult) };
    var allCamps = (listResult.data && listResult.data.data) || [];
    var ours = allCamps.filter(function(c) {
      return String((c.attributes && c.attributes.name) || '').indexOf('EC-2026-001') === 0;
    });
    results.found = ours.length;
    ours.forEach(function(c) {
      var campId = c.id;
      results.campaign_ids.push(campId);
      // Cancel first (Klaviyo requires cancel before delete for scheduled campaigns)
      _klfFetch('POST', 'campaigns/' + campId + '/campaign-cancel/');
      var delResult = _klfFetch('DELETE', 'campaigns/' + campId + '/');
      if (delResult.code === 204 || delResult.code === 200) {
        results.deleted++;
        Logger.log('[KLF] Deleted campaign: ' + campId + ' — ' + (c.attributes && c.attributes.name));
      } else {
        results.errors.push({ id: campId, error: _klfErr(delResult) });
        Logger.log('[KLF] Delete failed: ' + campId + ' → ' + _klfErr(delResult));
      }
    });
    Logger.log('[KLF] klaviyoDeleteScheduledCampaigns: ' + results.deleted + '/' + results.found + ' deleted');
    return results;
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── getKlaviyoCampaignsBoard ─────────────────────────────────────────────────
// Returns live flow status (from Klaviyo API) + campaign list for the Campaigns tab.
// All IDs read from CcSettings — zero hardcoded.
function getKlaviyoCampaignsBoard(campaignId) {
  try {
    var obListId  = _cvtReadSetting('klaviyo_ob_list_id');
    var orgListId = _cvtReadSetting('klaviyo_organic_list_id');

    var flowDefs = [
      { key:'flow_a',     label:'Flow A — SEQ-1',        id: _cvtReadSetting('klaviyo_flow_id_a'),     seq:'SEQ-1',  trigger_id:'TebDTM',  trigger_name:'Prelaunch Emails',     steps:8,  go_live:'2026-05-27' },
      { key:'flow_b',     label:'Flow B — SEQ-2',        id: _cvtReadSetting('klaviyo_flow_id_b'),     seq:'SEQ-2',  trigger_id:'TebDTM',  trigger_name:'Prelaunch Emails',     steps:8,  go_live:'2026-05-27' },
      { key:'flow_alpha',      label:'Alpha Flow',                  id: _cvtReadSetting('klaviyo_flow_id_alpha'),      seq:'ALPHA', trigger_id:'UPRemk',  trigger_name:'EC Alpha Users',        steps:6, go_live:'Jun 8 — tag alpha_selected' },
      { key:'flow_ob',         label:'OB Standard Onboarding',      id: _cvtReadSetting('klaviyo_flow_id_ob'),         seq:'OB',    trigger_id:obListId,  trigger_name:'EC OB Launch Day',      steps:5, go_live:'2026-07-01' },
      { key:'flow_org',        label:'Organic Welcome',              id: _cvtReadSetting('klaviyo_flow_id_org'),        seq:'ORG',   trigger_id:orgListId, trigger_name:'EC Organic Welcome',    steps:3, go_live:'On /coming-soon signup' },
      { key:'flow_beta',       label:'BETA Onboarding',              id: _cvtReadSetting('klaviyo_flow_id_beta'),       seq:'BETA',  trigger_id:'SfHgFY',  trigger_name:'EC Beta Users',         steps:4, go_live:'Jun 29 — manual add' },
      { key:'flow_qst',        label:'QST Confirm',                  id: _cvtReadSetting('klaviyo_flow_id_qst'),        seq:'QST',   trigger_id:'WBbASK',  trigger_name:'EC QST Submitted',      steps:1, go_live:'2026-05-28' },
      { key:'flow_qst_invite', label:'QST Invitation — Day 14',      id: _cvtReadSetting('klaviyo_flow_id_qst_invite'), seq:'—',     trigger_id:'TebDTM',  trigger_name:'Prelaunch Emails',      steps:1, go_live:'2026-05-28' }
    ];

    // Live flow status from Klaviyo
    var flows = flowDefs.map(function(f) {
      var base = { key:f.key, label:f.label, id:f.id, seq:f.seq, trigger_id:f.trigger_id, trigger_name:f.trigger_name, steps:f.steps, go_live:f.go_live };
      if (!f.id) { base.status = 'unknown'; base.error = 'no ID in CcSettings'; return base; }
      var r = _klfFetch('GET', 'flows/' + f.id + '/?fields[flow]=name,status,created,updated');
      if (r.code === 200 && r.data && r.data.data) {
        var a = r.data.data.attributes || {};
        base.status  = a.status  || 'draft';
        base.name    = a.name    || f.label;
        base.created = a.created || '';
        base.updated = a.updated || '';
      } else {
        base.status = 'unknown';
        base.error  = _klfErr(r);
      }
      return base;
    });

    // Campaign list from Klaviyo — filter by EC-2026-001 name prefix
    var campPrefix = (campaignId && campaignId !== 'all') ? campaignId : 'EC-2026-001';
    var cr = _klfFetch('GET', "campaigns/?filter=equals(messages.channel,'email')&page[size]=50&fields[campaign]=name,status,scheduled_at,created_at,audiences");
    var kampList = [];
    if (cr.code === 200 && cr.data && cr.data.data) {
      kampList = cr.data.data
        .filter(function(c) { return String((c.attributes && c.attributes.name) || '').indexOf(campPrefix) === 0; })
        .map(function(c) {
          var a  = c.attributes || {};
          var inc = ((a.audiences && a.audiences.included) || []).map(function(s) { return s.id || ''; }).join(',');
          return { id:c.id, name:a.name||'', status:a.status||'', scheduled_at:a.scheduled_at||'', created_at:a.created_at||'', segment_ids:inc };
        });
      kampList.sort(function(a,b) { return (a.scheduled_at||'') < (b.scheduled_at||'') ? -1 : 1; });
    }

    // Cross-reference with EmailSequences for template_id + dl_id + subject
    var emailSeqs = getEmailSequences((!campaignId || campaignId === 'all') ? null : campaignId);
    var byKlaviyoId = {};
    emailSeqs.forEach(function(e) { if (e.klaviyo_id) byKlaviyoId[String(e.klaviyo_id)] = e; });
    kampList = kampList.map(function(c) {
      var m = byKlaviyoId[c.id];
      if (m) {
        c.template_id   = m.seq_template_id || '';
        c.dl_id         = m.dl_id           || '';
        c.subject       = m.subject_line    || '';
        c.sequence_code = m.sequence_code   || '';
        c.variant       = m.variant || ((m.id || '').slice(-1) === 'A' || (m.id || '').slice(-1) === 'B' ? (m.id||'').slice(-1) : '');
      }
      return c;
    });

    return { ok:true, flows:flows, campaigns:kampList };
  } catch(e) {
    Logger.log('[getKlaviyoCampaignsBoard] error: ' + e.message);
    return { ok:false, error:e.message, flows:[], campaigns:[] };
  }
}

// ── klaviyoCreateList ─────────────────────────────────────────────────────────
function klaviyoCreateList(listName) {
  var result = _klfFetch('POST', 'lists/', {
    data: { type: 'list', attributes: { name: listName } }
  });
  if (result.code === 201 || result.code === 200) {
    var id = result.data && result.data.data && result.data.data.id;
    return { ok: true, list_id: id, name: listName };
  }
  return { ok: false, error: _klfErr(result), code: result.code };
}

// ── klaviyoGetSegments ────────────────────────────────────────────────────────
function klaviyoGetSegments() {
  var result = _klfFetch('GET', 'segments/?page[size]=10&fields[segment]=name,created,updated');
  if (result.code !== 200 || !result.data || !result.data.data) {
    return { ok: false, error: _klfErr(result), code: result.code };
  }
  var segs = result.data.data.map(function(s) {
    return { id: s.id, name: (s.attributes && s.attributes.name) || '', created: (s.attributes && s.attributes.created) || '' };
  });
  return { ok: true, segments: segs };
}

// ── klaviyoWireCampaignSegments ───────────────────────────────────────────────
// Updates all 14 SEQ-3/4 campaigns with correct audience segment + suppression exclusion.
function klaviyoWireCampaignSegments() {
  var segAId = _cvtReadSetting('klaviyo_segment_id_a');
  var segBId = _cvtReadSetting('klaviyo_segment_id_b');
  var suppId = _cvtReadSetting('klaviyo_suppression_segment_id') || 'XJYckK';
  if (!segAId || !segBId) return { ok: false, error: 'Segments missing — run klaviyo_create_segments first' };

  var campMap = [
    { id: '01KRYG1BMA0TDGCGFP9FXW4A9A', variant: 'A' },
    { id: '01KRYEYMTM24KAH1MD46F0B134', variant: 'B' },
    { id: '01KRYEYQV2FWE26165ZTM8919T', variant: 'A' },
    { id: '01KRYEYTSADV8XWKCGG6F1QPFA', variant: 'B' },
    { id: '01KRYEYXZ6TDV30WFES05FZBSS', variant: 'A' },
    { id: '01KRYEZ1EXY7VFFJCTFRTY7524', variant: 'B' },
    { id: '01KRYEZ4RXCFVWBN091FGSCYHY', variant: 'A' },
    { id: '01KRYEZ7B1PCTRQH47P2AHB7CZ', variant: 'B' },
    { id: '01KRYEZA34YDQ9KMQ46TY0YYP7', variant: 'A' },
    { id: '01KRYEZCFJZDYD01MBSNJX0TJQ', variant: 'B' },
    { id: '01KRYEZH56R1JQEH3XFAPCE5V0', variant: 'A' },
    { id: '01KRYEZKWF0MEJSTDC597BJMFE', variant: 'B' },
    { id: '01KRYEZQ1P9NTJCP5AAM3H6K0H', variant: 'A' },
    { id: '01KRYEZSV982T3G1NED6V9KS8M', variant: 'B' }
  ];

  var updated = [], errors = [];
  campMap.forEach(function(c) {
    Utilities.sleep(300);
    var segId = c.variant === 'A' ? segAId : segBId;
    var r = _klfFetch('PATCH', 'campaigns/' + c.id + '/', {
      data: { type: 'campaign', id: c.id, attributes: {
        audiences: { included: [segId], excluded: [suppId] }
      }}
    });
    if (r.code === 200 || r.code === 204) {
      updated.push({ id: c.id, variant: c.variant, seg_id: segId });
    } else {
      errors.push({ id: c.id, variant: c.variant, code: r.code, error: _klfErr(r) });
    }
  });
  return { ok: errors.length === 0, updated: updated.length, errors: errors, seg_a: segAId, seg_b: segBId, suppression: suppId };
}

// ── klaviyoRewireAudiences ────────────────────────────────────────────────────
// Dynamically fetches all Scheduled EC-2026-001 SEQ-3/4 campaigns, then for each:
//   1. Cancels the send-job (reverts campaign to Draft)
//   2. Patches audience → Variant A: UQTdyL + excl XJYckK, Variant B: VpgZPZ + excl XJYckK
//   3. Re-posts the send-job (restores Scheduled status using stored send_strategy.datetime)
// No hardcoded IDs — fetches live from Klaviyo so it works after any recreate run.
function klaviyoRewireAudiences() {
  try {
    var listAId = _cvtReadSetting('klaviyo_segment_id_a');
    var listBId = _cvtReadSetting('klaviyo_segment_id_b');
    var suppId  = _cvtReadSetting('klaviyo_suppression_segment_id');
    if (!listAId || !listBId) return { ok: false, error: 'klaviyo_segment_id_a/b missing from CcSettings — add them first' };
    if (!suppId) return { ok: false, error: 'klaviyo_suppression_segment_id missing from CcSettings' };

    // Fetch live campaign list — find all Scheduled SEQ-3/4 campaigns
    var cr = _klfFetch('GET', "campaigns/?filter=equals(messages.channel,'email')&page[size]=50&fields[campaign]=name,status");
    if (cr.code !== 200 || !cr.data || !cr.data.data) {
      return { ok: false, error: 'fetch campaigns failed: ' + cr.code };
    }

    var seq34 = cr.data.data.filter(function(c) {
      var name   = String((c.attributes && c.attributes.name) || '');
      var status = String((c.attributes && c.attributes.status) || '');
      return name.indexOf('EC-2026-001') === 0 &&
             (name.indexOf('SEQ-3') !== -1 || name.indexOf('SEQ-4') !== -1) &&
             status === 'Scheduled';
    });

    if (!seq34.length) return { ok: false, error: 'no Scheduled SEQ-3/4 campaigns found — check Klaviyo board' };

    var results = [];
    seq34.forEach(function(c) {
      var campId = c.id;
      var name   = String((c.attributes && c.attributes.name) || '');
      var isB    = name.indexOf('Variant B') !== -1;
      var listId = isB ? listBId : listAId;
      var step   = { id: campId, name: name, variant: isB ? 'B' : 'A', list: listId };

      // 1: Revert to Draft by deleting the send-job.
      // Hypothesis: send-job ID = campaign ID (we POST with data.id = campId when scheduling).
      // Fallback: try PATCH send-job/{campId} with status cancelled.
      Utilities.sleep(300);
      var sdr = _klfFetch('DELETE', 'campaign-send-jobs/' + campId + '/');
      step.cancel_code = sdr.code;
      step.sj_deleted = (sdr.code === 200 || sdr.code === 204 || sdr.code === 202);
      if (!step.sj_deleted) {
        // Fallback: PATCH campaign-send-jobs/{campId}/ to cancel
        var patchCancel = _klfFetch('PATCH', 'campaign-send-jobs/' + campId + '/', {
          data: { type: 'campaign-send-job', id: campId, attributes: { status: 'cancelled' } }
        });
        step.cancel_code2 = patchCancel.code;
        step.sj_deleted = (patchCancel.code === 200 || patchCancel.code === 204 || patchCancel.code === 202);
        if (!step.sj_deleted) step.cancel_error = _klfErr(sdr) + ' | patch: ' + _klfErr(patchCancel);
      }
      Logger.log('[KLF] rewireAudiences cancel ' + campId + ' delete=' + sdr.code);
      Utilities.sleep(500);

      // 2: Patch audience → correct list + XJYckK exclusion
      Utilities.sleep(300);
      var pr = _klfFetch('PATCH', 'campaigns/' + campId + '/', {
        data: { type: 'campaign', id: campId, attributes: {
          audiences: { included: [listId], excluded: [suppId] }
        }}
      });
      step.audience_updated = (pr.code === 200 || pr.code === 204);
      if (!step.audience_updated) step.audience_error = _klfErr(pr);

      // 3: Re-post send-job — data.id = campaign ID (Klaviyo 2025-04-15 format)
      Utilities.sleep(300);
      var nr = _klfFetch('POST', 'campaign-send-jobs/', {
        data: { type: 'campaign-send-job', id: campId }
      });
      step.rescheduled = (nr.code === 200 || nr.code === 201 || nr.code === 202);
      if (!step.rescheduled) step.reschedule_error = _klfErr(nr);

      results.push(step);
      Logger.log('[KLF] rewireAudiences ' + name + ' → list=' + listId + ' updated=' + step.audience_updated + ' rescheduled=' + step.rescheduled);
    });

    var successCount = results.filter(function(r) { return r.audience_updated && r.rescheduled; }).length;
    return { ok: successCount === seq34.length, total: seq34.length, success: successCount, results: results, list_a: listAId, list_b: listBId, suppression: suppId };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── klaviyoSendTestEmail ──────────────────────────────────────────────────────
// Sends a Klaviyo test email for a SEQ-3/4 campaign to the specified address.
// Dynamically looks up the campaign by name — no hardcoded IDs.
// campaignKey: e.g. 'SEQ-3-E1-A' (default), toEmail: defaults to Taylor
function klaviyoSendTestEmail(campaignKey, toEmail) {
  try {
    campaignKey = campaignKey || 'SEQ-3-E1-A';
    toEmail     = toEmail     || 'Taylor@gatehouseassets.com';

    var variant  = campaignKey.slice(-1);
    var baseKey  = campaignKey.replace(/-[AB]$/, '');
    var campName = 'EC-2026-001 · ' + baseKey + ' · Variant ' + variant;

    // Find campaign by exact name
    var cr = _klfFetch('GET', "campaigns/?filter=equals(messages.channel,'email')&page[size]=50&fields[campaign]=name,status");
    if (cr.code !== 200 || !cr.data || !cr.data.data) {
      return { ok: false, error: 'fetch campaigns failed: ' + cr.code };
    }

    var match = cr.data.data.filter(function(c) {
      return String((c.attributes && c.attributes.name) || '') === campName;
    });
    if (!match.length) return { ok: false, error: 'campaign not found: ' + campName };

    var campId = match[0].id;

    // Get message ID
    Utilities.sleep(200);
    var mf = _klfFetch('GET', 'campaigns/' + campId + '/campaign-messages/');
    if (mf.code !== 200 || !mf.data || !mf.data.data || !mf.data.data.length) {
      return { ok: false, error: 'no messages on campaign ' + campId };
    }
    var msgId = mf.data.data[0].id;

    // Klaviyo does not expose a campaign test-send endpoint in their REST API (2025-04-15).
    // Use the Klaviyo UI: Campaigns → click campaign → "Send Test" button in message editor.
    return {
      ok: false,
      campaign: campName,
      camp_id: campId,
      msg_id: msgId,
      to: toEmail,
      error: 'Klaviyo API has no test-send endpoint for campaigns. Use Klaviyo UI: Campaigns → click campaign → Send Test button.'
    };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── _klfFetchRev — revision-overridable fetch ─────────────────────────────────
function _klfFetchRev(method, path, payload, revision) {
  var key = _klfApiKey();
  if (!key) return { code: 0, data: {}, text: 'no api key' };
  var options = {
    method:  method,
    headers: {
      'Authorization': 'Klaviyo-API-Key ' + key,
      'revision':      revision || _KLF_REVISION,
      'Content-Type':  'application/json',
      'Accept':        'application/json'
    },
    muteHttpExceptions: true
  };
  if (payload !== undefined && payload !== null) options.payload = JSON.stringify(payload);
  var resp = UrlFetchApp.fetch(_KLF_BASE + '/' + path, options);
  var code = resp.getResponseCode();
  var text = resp.getContentText();
  Logger.log('[KLF rev=' + revision + '] ' + method + ' /' + path + ' → ' + code);
  var data = {};
  if (text) { try { data = JSON.parse(text); } catch(e) {} }
  return { code: code, data: data, text: text };
}

// ── _klfWireStepFromTemplate — wire a single flow step using an existing template ─
// Skips template creation. Tries flow-actions POST (DELAY + EMAIL) then flow-message POST.
// Returns detailed codes so callers can diagnose failures.
function _klfWireStepFromTemplate(flowId, delayDays, templateId, emailData) {
  try {
    var delayActionId = null;
    var delayCode     = 'skipped';
    var delayErr      = null;

    if (delayDays > 0) {
      var dr = _klfFetch('POST', 'flow-actions/', {
        data: {
          type: 'flow-action',
          attributes: {
            action_type: 'DELAY',
            settings: { delay: Number(delayDays), delay_unit: 'DAYS' }
          },
          relationships: { flow: { data: { type: 'flow', id: flowId } } }
        }
      });
      delayCode = dr.code;
      if (dr.code === 201 || dr.code === 200) {
        delayActionId = dr.data && dr.data.data && dr.data.data.id;
      } else {
        delayErr = _klfErr(dr);
        Logger.log('[KLF] WireStep delay → ' + dr.code + ' ' + delayErr);
      }
    }

    var er = _klfFetch('POST', 'flow-actions/', {
      data: {
        type: 'flow-action',
        attributes: { action_type: 'EMAIL', status: 'draft' },
        relationships: { flow: { data: { type: 'flow', id: flowId } } }
      }
    });
    var emailCode     = er.code;
    var emailActionId = null;
    var emailErr      = null;

    if (er.code === 201 || er.code === 200) {
      emailActionId = er.data && er.data.data && er.data.data.id;
      var fmr = _klfFetch('POST', 'flow-messages/', {
        data: {
          type: 'flow-message',
          attributes: {
            channel: 'email',
            content: {
              subject:      emailData.subject      || '',
              preview_text: emailData.preview_text || '',
              from_email:   _KLF_FROM_EMAIL,
              from_label:   _KLF_FROM_NAME
            }
          },
          relationships: {
            'flow-action': { data: { type: 'flow-action', id: emailActionId } },
            template:      { data: { type: 'template',    id: templateId    } }
          }
        }
      });
      Logger.log('[KLF] WireStep flow-message → ' + fmr.code);
    } else {
      emailErr = _klfErr(er);
      Logger.log('[KLF] WireStep email action → ' + er.code + ' ' + emailErr);
    }

    return {
      ok:              !!emailActionId,
      api_wired:       !!emailActionId,
      delay_action_id: delayActionId,
      delay_code:      delayCode,
      delay_err:       delayErr,
      email_action_id: emailActionId,
      email_code:      emailCode,
      email_err:       emailErr
    };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── klaviyoWireBetaFlowSteps — TASK 1 ────────────────────────────────────────
// Wires 4 steps into existing BETA flow (Tr87zQ) using already-created templates.
// Templates from klaviyoBuildBetaFlow: Sb62kA, TXvTR5, TkuRes, WijzCM.
function klaviyoWireBetaFlowSteps() {
  try {
    var flowId    = _cvtReadSetting('klaviyo_flow_id_beta') || 'Tr87zQ';
    var allEmails = getEmailSequences(_KLF_CAMPAIGN_ID);
    var betaEmails = allEmails.filter(function(e) { return String(e.sequence_code) === 'BETA'; })
      .sort(function(a, b) { return Number(a.email_number||0) - Number(b.email_number||0); });
    if (!betaEmails.length) return { ok: false, error: 'No BETA emails in EmailSequences' };

    var delayMap = { 1: 0, 2: 1, 3: 2, 4: 7 };
    var steps    = [];
    betaEmails.forEach(function(email) {
      var num        = Number(email.email_number) || 1;
      var delay      = (delayMap[num] !== undefined) ? delayMap[num] : 1;
      var templateId = String(email.seq_template_id || '');
      if (!templateId) {
        steps.push({ email_id: email.id, error: 'no seq_template_id — run klaviyoBuildBetaFlow first' });
        return;
      }
      Utilities.sleep(500);
      var r = _klfWireStepFromTemplate(flowId, delay, templateId, {
        subject:      String(email.subject_line || ''),
        preview_text: String(email.preview_text || ''),
        utm_campaign: 'beta_onboarding',
        utm_content:  String(email.dl_id || '')
      });
      steps.push({
        email_id:   email.id,
        email_num:  num,
        delay:      delay,
        template_id: templateId,
        ok:         r.ok,
        api_wired:  r.api_wired,
        delay_code: r.delay_code,
        email_code: r.email_code,
        error:      r.error || r.email_err || null
      });
    });

    var wired = steps.filter(function(s) { return s.api_wired; }).length;
    return { ok: wired > 0, flow_id: flowId, wired: wired, total: steps.length, steps: steps };
  } catch(e) { return { ok: false, error: e.message }; }
}

// ── klaviyoWireQstFlowSteps — TASK 2 ─────────────────────────────────────────
// Wires QST-E2 (delay=0) into existing QST flow (SpiMfa) using template XLArLB.
function klaviyoWireQstFlowSteps() {
  try {
    var flowId    = _cvtReadSetting('klaviyo_flow_id_qst') || 'SpiMfa';
    var allEmails = getEmailSequences(_KLF_CAMPAIGN_ID);
    var qstE2     = null;
    for (var i = 0; i < allEmails.length; i++) {
      if (allEmails[i].id === 'EC-2026-001-QST-E2') { qstE2 = allEmails[i]; break; }
    }
    if (!qstE2) return { ok: false, error: 'QST-E2 not found in EmailSequences' };
    var templateId = String(qstE2.seq_template_id || '');
    if (!templateId) return { ok: false, error: 'QST-E2 has no seq_template_id — run klaviyoBuildQstFlow first' };

    var r = _klfWireStepFromTemplate(flowId, 0, templateId, {
      subject:      String(qstE2.subject_line || ''),
      preview_text: String(qstE2.preview_text || ''),
      utm_campaign: 'qst_confirm',
      utm_content:  String(qstE2.dl_id || 'DL-EM-0067')
    });
    return {
      ok:          r.ok,
      flow_id:     flowId,
      template_id: templateId,
      api_wired:   r.api_wired,
      delay_code:  r.delay_code,
      email_code:  r.email_code,
      error:       r.error || r.email_err || null
    };
  } catch(e) { return { ok: false, error: e.message }; }
}

// ── klaviyoFixCampaignExclusions — TASK 3 ─────────────────────────────────────
// For each of the 14 scheduled campaigns:
//   1. Cancel (removes scheduled lock so audiences can be patched)
//   2. PATCH audiences: included=[UQTdyL or VpgZPZ], excluded=[XJYckK]
//   3. Reschedule via POST campaign-send-jobs with data.id=campaignId (uses stored send_strategy)
function klaviyoFixCampaignExclusions() {
  var segAId = _cvtReadSetting('klaviyo_segment_id_a') || 'UQTdyL';
  var segBId = _cvtReadSetting('klaviyo_segment_id_b') || 'VpgZPZ';
  var suppId = _cvtReadSetting('klaviyo_suppression_segment_id') || 'XJYckK';

  var campMap = [
    { id: '01KRYG1BMA0TDGCGFP9FXW4A9A', variant: 'A', key: 'SEQ-3-E1-A' },
    { id: '01KRYEYMTM24KAH1MD46F0B134', variant: 'B', key: 'SEQ-3-E1-B' },
    { id: '01KRYEYQV2FWE26165ZTM8919T', variant: 'A', key: 'SEQ-3-E2-A' },
    { id: '01KRYEYTSADV8XWKCGG6F1QPFA', variant: 'B', key: 'SEQ-3-E2-B' },
    { id: '01KRYEYXZ6TDV30WFES05FZBSS', variant: 'A', key: 'SEQ-3-E3-A' },
    { id: '01KRYEZ1EXY7VFFJCTFRTY7524', variant: 'B', key: 'SEQ-3-E3-B' },
    { id: '01KRYEZ4RXCFVWBN091FGSCYHY', variant: 'A', key: 'SEQ-3-E4-A' },
    { id: '01KRYEZ7B1PCTRQH47P2AHB7CZ', variant: 'B', key: 'SEQ-3-E4-B' },
    { id: '01KRYEZA34YDQ9KMQ46TY0YYP7', variant: 'A', key: 'SEQ-4-E1-A' },
    { id: '01KRYEZCFJZDYD01MBSNJX0TJQ', variant: 'B', key: 'SEQ-4-E1-B' },
    { id: '01KRYEZH56R1JQEH3XFAPCE5V0', variant: 'A', key: 'SEQ-4-E2-A' },
    { id: '01KRYEZKWF0MEJSTDC597BJMFE', variant: 'B', key: 'SEQ-4-E2-B' },
    { id: '01KRYEZQ1P9NTJCP5AAM3H6K0H', variant: 'A', key: 'SEQ-4-E3-A' },
    { id: '01KRYEZSV982T3G1NED6V9KS8M', variant: 'B', key: 'SEQ-4-E3-B' }
  ];

  var results = [];
  campMap.forEach(function(c) {
    var segId = c.variant === 'A' ? segAId : segBId;
    var step  = { id: c.id, key: c.key, variant: c.variant, seg_id: segId };
    Utilities.sleep(400);

    // Step 1: Cancel to remove scheduled lock
    var cr = _klfFetch('POST', 'campaigns/' + c.id + '/campaign-cancel/');
    step.cancel_code  = cr.code;
    step.cancelled    = (cr.code >= 200 && cr.code < 300);

    // Step 2: Patch audiences (included=variant list, excluded=suppression segment)
    Utilities.sleep(300);
    var pr = _klfFetch('PATCH', 'campaigns/' + c.id + '/', {
      data: {
        type: 'campaign',
        id:   c.id,
        attributes: {
          audiences: { included: [segId], excluded: [suppId] }
        }
      }
    });
    step.patch_code       = pr.code;
    step.audience_updated = (pr.code === 200 || pr.code === 204);
    if (!step.audience_updated) step.audience_error = _klfErr(pr);

    // Step 3: Reschedule — data.id = campaign_id (not relationships per Klaviyo 2025-04-15)
    Utilities.sleep(300);
    var nr = _klfFetch('POST', 'campaign-send-jobs/', {
      data: { type: 'campaign-send-job', id: c.id }
    });
    step.reschedule_code = nr.code;
    step.rescheduled     = (nr.code === 201 || nr.code === 200 || nr.code === 202);
    if (!step.rescheduled) step.reschedule_error = _klfErr(nr);

    results.push(step);
    Logger.log('[fixExclusions] ' + c.key + ' cancel=' + step.cancel_code + ' patch=' + step.patch_code + ' reschedule=' + step.reschedule_code);
  });

  var success = results.filter(function(r) { return r.audience_updated && r.rescheduled; }).length;
  return { ok: success === campMap.length, total: campMap.length, success: success, results: results };
}

// ── klaviyoRecreateCampaigns — TASK 3 (delete + recreate with correct audiences) ─
// Audiences PATCH is locked to "draft" only, and the cancel endpoint is 404 in
// Klaviyo 2025-04-15. Only path: DELETE old campaign + POST new with correct audiences.
// Reads klaviyo_id + seq_template_id from EmailSequences. Writes new campaign ID back.
function klaviyoRecreateCampaigns() {
  var segAId = _cvtReadSetting('klaviyo_segment_id_a') || 'UQTdyL';
  var segBId = _cvtReadSetting('klaviyo_segment_id_b') || 'VpgZPZ';
  var suppId = _cvtReadSetting('klaviyo_suppression_segment_id') || 'XJYckK';

  var allEmails  = getEmailSequences(_KLF_CAMPAIGN_ID);
  var campEmails = allEmails.filter(function(e) {
    return _KLF_CAMP_SEQS.indexOf(String(e.sequence_code)) !== -1;
  });
  if (!campEmails.length) return { ok: false, error: 'No SEQ-3/4 emails found in EmailSequences' };

  var results = [];
  campEmails.forEach(function(email) {
    var oldCampId  = String(email.klaviyo_id  || '');
    var templateId = String(email.seq_template_id || '');
    var variant    = (String(email.icp_code || '') === 'super_mom_money') ? 'A' : 'B';
    var segId      = variant === 'A' ? segAId : segBId;
    var row        = { email_id: email.id, variant: variant, old_camp_id: oldCampId };

    if (!oldCampId)  { row.error = 'no klaviyo_id in sheet';    results.push(row); return; }
    if (!templateId) { row.error = 'no seq_template_id in sheet'; results.push(row); return; }
    Utilities.sleep(400);

    // Step 1: GET existing campaign for name + send_strategy.datetime
    var gr = _klfFetch('GET', 'campaigns/' + oldCampId + '/?fields[campaign]=name,send_strategy');
    if (gr.code !== 200) { row.error = 'GET ' + gr.code + ': ' + _klfErr(gr); results.push(row); return; }
    var campAttrs = (gr.data && gr.data.data && gr.data.data.attributes) || {};
    var campName  = campAttrs.name || ('EC-2026-001 · ' + email.sequence_code + ' · Variant ' + variant);
    var sendDt    = campAttrs.send_strategy && campAttrs.send_strategy.datetime;
    row.camp_name = campName;
    row.send_dt   = sendDt;

    // Step 2a: Find and delete the send-job so campaign reverts to draft
    // The campaign-send-jobs filter query returns 0; use campaign relationship endpoint instead.
    Utilities.sleep(200);
    var sjPath = 'campaigns/' + oldCampId + '/campaign-send-jobs/';
    var sjr = _klfFetch('GET', sjPath);
    row.sj_code = sjr.code;
    if (sjr.code === 200 && sjr.data && sjr.data.data && sjr.data.data.length) {
      var sjId = sjr.data.data[0].id;
      row.sj_id = sjId;
      Utilities.sleep(200);
      var sdr = _klfFetch('DELETE', 'campaign-send-jobs/' + sjId + '/');
      row.sj_delete_code = sdr.code;
      Utilities.sleep(300); // allow status to propagate
    } else {
      // Fallback: try POST /api/campaign-cancel-jobs/ with data.id pattern
      Utilities.sleep(200);
      var cjr = _klfFetch('POST', 'campaign-cancel-jobs/', {
        data: { type: 'campaign-cancel-job', id: oldCampId }
      });
      row.cancel_job_code = cjr.code;
      Utilities.sleep(300);
    }

    // Step 2b: DELETE old campaign (should succeed now that it's in draft)
    Utilities.sleep(200);
    var dr = _klfFetch('DELETE', 'campaigns/' + oldCampId + '/');
    row.delete_code = dr.code;
    if (dr.code !== 204 && dr.code !== 200) {
      row.error = 'DELETE ' + dr.code + ': ' + _klfErr(dr); results.push(row); return;
    }

    // Step 3: CREATE replacement with correct audiences + same name/send_strategy
    Utilities.sleep(300);
    var newCamp = _klfFetch('POST', 'campaigns/', {
      data: {
        type: 'campaign',
        attributes: {
          name:      campName,
          audiences: { included: [segId], excluded: [suppId] },
          send_options:     { use_smart_sending: false },
          tracking_options: { is_tracking_opens: true, is_tracking_clicks: true },
          send_strategy:    { method: 'static', datetime: sendDt },
          'campaign-messages': {
            data: [{ type: 'campaign-message', attributes: { definition: { channel: 'email' } } }]
          }
        }
      }
    });
    row.create_code = newCamp.code;
    if (newCamp.code !== 201 && newCamp.code !== 200) {
      row.error = 'CREATE ' + newCamp.code + ': ' + _klfErr(newCamp); results.push(row); return;
    }
    var newCampId = newCamp.data && newCamp.data.data && newCamp.data.data.id;
    row.new_camp_id = newCampId;

    // Step 4: Get new campaign-message ID (from response or separate GET)
    var newMsgId = null;
    try {
      var rd = newCamp.data.data.relationships;
      var md = rd && rd['campaign-messages'] && rd['campaign-messages'].data;
      if (md && md.length) newMsgId = md[0].id;
    } catch(re) {}
    if (!newMsgId && newCampId) {
      Utilities.sleep(200);
      var mf = _klfFetch('GET', 'campaigns/' + newCampId + '/campaign-messages/');
      if (mf.code === 200 && mf.data.data && mf.data.data.length) newMsgId = mf.data.data[0].id;
    }
    row.new_msg_id = newMsgId;

    if (newMsgId) {
      // Step 5: Patch message content (subject, preview, from)
      Utilities.sleep(200);
      _klfFetch('PATCH', 'campaign-messages/' + newMsgId + '/', {
        data: {
          type: 'campaign-message', id: newMsgId,
          attributes: {
            definition: {
              channel: 'email',
              content: {
                subject:      String(email.subject_line || ''),
                preview_text: String(email.preview_text || ''),
                from_email:   _KLF_FROM_EMAIL,
                from_label:   _KLF_FROM_NAME
              }
            }
          }
        }
      });

      // Step 6: Assign template
      Utilities.sleep(200);
      var ar = _klfFetch('POST', 'campaign-message-assign-template/', {
        data: {
          type: 'campaign-message', id: newMsgId,
          relationships: { template: { data: { type: 'template', id: templateId } } }
        }
      });
      row.assign_code = ar.code;
    }

    // Step 7: Write new campaign ID back to EmailSequences sheet
    if (newCampId) _klfWriteBack(email.id, 'klaviyo_id', newCampId);

    row.ok = !!newCampId;
    results.push(row);
    Logger.log('[recreateCampaigns] ' + email.id + ' old=' + oldCampId + ' new=' + newCampId + ' ok=' + row.ok);
  });

  var success = results.filter(function(r) { return r.ok; }).length;
  return { ok: success === campEmails.length, total: campEmails.length, success: success, results: results };
}

// ── klaviyoTryFromLabel — TASK 4 ──────────────────────────────────────────────
// Attempts PATCH on a flow-message across multiple API revisions.
// PATCH /api/flow-messages/{id}/ is read-only (405) in all tested revisions —
// documented in feedback_klaviyo_api_quirks.md. This exhaustively confirms.
function klaviyoTryFromLabel(flowMsgId, fromLabel) {
  var revisions = ['2024-10-15', '2024-07-15', '2024-05-15', '2024-02-15', '2023-10-15', '2025-04-15'];
  var results   = [];
  revisions.forEach(function(rev) {
    Utilities.sleep(200);
    var r = _klfFetchRev('PATCH', 'flow-messages/' + flowMsgId + '/', {
      data: {
        type: 'flow-message',
        id:   flowMsgId,
        attributes: { content: { from_label: fromLabel } }
      }
    }, rev);
    results.push({ revision: rev, code: r.code, ok: (r.code >= 200 && r.code < 300), error: r.code >= 300 ? _klfErr(r) : null });
    Logger.log('[tryFromLabel] ' + flowMsgId + ' rev=' + rev + ' → ' + r.code);
  });
  var success = results.filter(function(r) { return r.ok; });
  return {
    flow_msg_id:   flowMsgId,
    from_label:    fromLabel,
    tried:         results,
    success_count: success.length,
    ok:            success.length > 0,
    verdict:       success.length > 0 ? 'PATCHED via rev ' + success[0].revision : 'UI-only — 405 on all revisions'
  };
}

// ── klaviyoBuildBetaFlow ──────────────────────────────────────────────────────
// Creates EC Beta Users list + flow + 4 email steps (day 0,1,3,10).
function klaviyoBuildBetaFlow() {
  try {
    // List
    var betaListId = _cvtReadSetting('klaviyo_beta_list_id');
    if (!betaListId) {
      var lr = klaviyoCreateList('EC Beta Users');
      if (!lr.ok) return { ok: false, error: 'List create failed: ' + lr.error };
      betaListId = lr.list_id;
      _klfSaveSetting('klaviyo_beta_list_id', betaListId, 'EC Beta Users');
    }

    // Flow shell
    var flowId = _cvtReadSetting('klaviyo_flow_id_beta') || null;
    if (!flowId) {
      var fr = klaviyoCreateFlow('EC-2026-001 · BETA · Beta Tester Onboarding', betaListId, null);
      flowId = fr.flow_id || null;
      if (flowId) _klfSaveSetting('klaviyo_flow_id_beta', flowId, 'EC-2026-001 BETA Flow');
    }

    // Emails ordered by email_number, delays = gap from previous step
    var allEmails = getEmailSequences(_KLF_CAMPAIGN_ID);
    var betaEmails = allEmails.filter(function(e) { return e.sequence_code === 'BETA'; })
      .sort(function(a, b) { return Number(a.email_number||0) - Number(b.email_number||0); });
    if (!betaEmails.length) return { ok: false, error: 'No BETA emails in EmailSequences' };

    // send_day: 0,1,3,10 → inter-step delays: 0,1,2,7
    var delayMap = { 1: 0, 2: 1, 3: 2, 4: 7 };
    var steps = [];
    betaEmails.forEach(function(email) {
      var delay = delayMap[Number(email.email_number)||1];
      if (delay === undefined) delay = 1;
      Utilities.sleep(400);
      var result = flowId
        ? klaviyoAddEmailStep(flowId, delay, {
            email_id: email.id, subject: String(email.subject_line||''),
            preview_text: String(email.preview_text||''), html_body: _klfHtml(email),
            from_name: _KLF_FROM_NAME, from_email: _KLF_FROM_EMAIL,
            utm_source: 'klaviyo', utm_medium: 'email',
            utm_campaign: 'beta_onboarding', utm_content: String(email.dl_id||'')
          })
        : { ok: false, error: 'No flow ID', template_id: null };
      if (result.template_id) _klfWriteBack(email.id, 'seq_template_id', result.template_id);
      steps.push({ email_id: email.id, delay: delay, ok: result.ok, template_id: result.template_id, api_wired: result.api_wired });
    });

    return { ok: true, flow_id: flowId, list_id: betaListId, steps: steps,
      note: flowId ? 'Flow + steps created — set live in Klaviyo UI after review' : 'Templates created — create flow manually in Klaviyo UI' };
  } catch(e) { return { ok: false, error: e.message }; }
}

// ── klaviyoBuildQstFlow ───────────────────────────────────────────────────────
// Creates EC QST Submitted list + 1-step flow for QST-E2 (immediate confirm).
// Trigger: user added to "EC QST Submitted" list after questionnaire submit.
function klaviyoBuildQstFlow() {
  try {
    // List
    var qstListId = _cvtReadSetting('klaviyo_qst_list_id');
    if (!qstListId) {
      var lr = klaviyoCreateList('EC QST Submitted');
      if (!lr.ok) return { ok: false, error: 'List create failed: ' + lr.error };
      qstListId = lr.list_id;
      _klfSaveSetting('klaviyo_qst_list_id', qstListId, 'EC QST Submitted');
    }

    // Flow shell
    var flowId = _cvtReadSetting('klaviyo_flow_id_qst') || null;
    if (!flowId) {
      var fr = klaviyoCreateFlow('EC-2026-001 · QST · Questionnaire Confirm', qstListId, null);
      flowId = fr.flow_id || null;
      if (flowId) _klfSaveSetting('klaviyo_flow_id_qst', flowId, 'EC-2026-001 QST Flow');
    }

    // QST-E2 step (day 0, immediate)
    var allEmails = getEmailSequences(_KLF_CAMPAIGN_ID);
    var qstE2 = null;
    for (var i = 0; i < allEmails.length; i++) {
      if (allEmails[i].id === 'EC-2026-001-QST-E2') { qstE2 = allEmails[i]; break; }
    }
    if (!qstE2) return { ok: false, error: 'QST-E2 not found in EmailSequences' };

    var result = flowId
      ? klaviyoAddEmailStep(flowId, 0, {
          email_id: qstE2.id, subject: String(qstE2.subject_line||''),
          preview_text: String(qstE2.preview_text||''), html_body: _klfHtml(qstE2),
          from_name: _KLF_FROM_NAME, from_email: _KLF_FROM_EMAIL,
          utm_source: 'klaviyo', utm_medium: 'email',
          utm_campaign: 'qst_confirm', utm_content: String(qstE2.dl_id||'DL-EM-0067')
        })
      : { ok: false, error: 'No flow ID', template_id: null };
    if (result.template_id) _klfWriteBack(qstE2.id, 'seq_template_id', result.template_id);

    return { ok: result.ok || !!result.template_id, flow_id: flowId, list_id: qstListId,
      qst_e2: { ok: result.ok, template_id: result.template_id, api_wired: result.api_wired },
      note: 'Wire questionnaire submit handler to add profile to list ' + qstListId };
  } catch(e) { return { ok: false, error: e.message }; }
}

// ── backfillFlowMessageIds ───────────────────────────────────────────────────
// Reads all 5 Klaviyo flows, extracts flow-message IDs, writes back to klaviyo_id
// in EmailSequences. Matches by template ID (seq_template_id ↔ template on message).
function backfillFlowMessageIds(campaignId) {
  var cid = campaignId || 'EC-2026-001';
  var flows = [
    { id: _cvtReadSetting('klaviyo_flow_id_a'),     seq: 'SEQ-1' },
    { id: _cvtReadSetting('klaviyo_flow_id_b'),     seq: 'SEQ-2' },
    { id: _cvtReadSetting('klaviyo_flow_id_alpha'), seq: 'ALPHA' },
    { id: _cvtReadSetting('klaviyo_flow_id_ob'),    seq: 'OB'    },
    { id: _cvtReadSetting('klaviyo_flow_id_org'),   seq: 'ORG'   },
    { id: _cvtReadSetting('klaviyo_flow_id_beta'),  seq: 'BETA'  },
    { id: _cvtReadSetting('klaviyo_flow_id_qst'),   seq: 'QST'   }
  ];

  // Build lookup: template_id → flow_message_id from Klaviyo
  // Uses relationship endpoint flows/{id}/flow-actions/ for reliable traversal
  var tmplToMsg = {};
  var rawActions = [];
  var apiErrors = [];
  flows.forEach(function(f) {
    if (!f.id) { apiErrors.push({ seq: f.seq, error: 'no flow ID' }); return; }
    // Use relationship endpoint — more reliable than filter query
    var ar = _klfFetch('GET', 'flows/' + f.id + '/flow-actions/?page[size]=50');
    if (ar.code !== 200 || !ar.data || !ar.data.data) {
      apiErrors.push({ seq: f.seq, flow_id: f.id, code: ar.code, error: _klfErr(ar) });
      return;
    }
    ar.data.data.forEach(function(action) {
      if ((action.attributes && action.attributes.action_type) !== 'SEND_EMAIL') return;
      var actionId = action.id;
      Utilities.sleep(300); // avoid Klaviyo rate limit
      // Get flow-messages — no &include=template (not supported here); relationships.template still present
      var mr = _klfFetch('GET', 'flow-actions/' + actionId + '/flow-messages/?page[size]=10');
      if (mr.code !== 200 || !mr.data || !mr.data.data) {
        apiErrors.push({ action_id: actionId, code: mr.code, error: _klfErr(mr) });
        return;
      }
      mr.data.data.forEach(function(msg) {
        var msgId = msg.id;
        var name  = (msg.attributes && msg.attributes.name) || '';
        // Template ID from relationships linkage (always present, no include needed)
        var tplRel = msg.relationships && msg.relationships.template && msg.relationships.template.data;
        var tplId  = tplRel ? tplRel.id : '';
        rawActions.push({ seq: f.seq, action_id: actionId, msg_id: msgId, name: name, template_id: tplId });
        if (tplId) tmplToMsg[tplId] = { msg_id: msgId, name: name, seq: f.seq };
      });
    });
  });

  // Build position lookup: { 'SEQ-1': ['T3y6Qj','UcWVJb',...], 'ALPHA': [...] }
  // Klaviyo copies templates on flow assignment so template IDs diverge — match by position instead
  var posLookup = {};
  rawActions.forEach(function(ra) {
    if (!posLookup[ra.seq]) posLookup[ra.seq] = [];
    posLookup[ra.seq].push(ra); // already in order (Email #1, #2, ...)
  });

  // Read EmailSequences and update klaviyo_id by position
  // ID format: EC-2026-001-{SEQ_CODE}-E{NUM} or EC-2026-001-{SEQ_CODE}-E{NUM}-{VARIANT}
  // Seq code mapping: SEQ-1→SEQ-1, SEQ-2→SEQ-2, ALPHA→ALPHA, OB→OB, ORG→ORG
  var seqs = getEmailSequences(cid);
  var updated = [], notFound = [], skipped = [];
  seqs.forEach(function(s) {
    if (s.klaviyo_id) return; // already set
    var id = s.id || '';
    // Parse seq code and email number from ID
    // Patterns: ...-SEQ-1-E2-A, ...-ALPHA-E4, ...-OB-E1-B
    var m = id.match(/-(SEQ-\d+|ALPHA|OB|ORG|BETA|QST)-E(\d+)/i);
    if (!m) { skipped.push({ id: id, reason: 'no pattern match' }); return; }
    var seqCode = m[1].toUpperCase();
    var pos     = parseInt(m[2], 10); // 1-based
    var actions = posLookup[seqCode];
    if (!actions || !actions[pos - 1]) {
      notFound.push({ id: id, seq: seqCode, pos: pos, reason: 'no flow-message at this position' });
      return;
    }
    var ra = actions[pos - 1];
    var updated_seq = {};
    Object.keys(s).forEach(function(k){ updated_seq[k] = s[k]; });
    updated_seq.klaviyo_id = ra.msg_id;
    setEmailSequence(updated_seq);
    updated.push({ id: s.id, msg_id: ra.msg_id, name: ra.name, seq: seqCode, pos: pos });
  });

  Logger.log('[backfillFlowMessageIds] updated=' + updated.length + ' notFound=' + notFound.length + ' skipped=' + skipped.length + ' api_errors=' + apiErrors.length);
  return { ok: true, updated: updated, not_found: notFound, skipped: skipped, raw_actions: rawActions, api_errors: apiErrors };
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
              audiences: { included: [item.segId], excluded: item.segId === _KLF_LIST_ID ? [] : [_KLF_LIST_ID] },
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

        // Patch campaign message content (subject/preview/from) — no template in this request
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
          var patchResult = _klfFetch('PATCH', 'campaign-messages/' + msgId + '/', msgPatch);
          Logger.log('[KLF] Campaign message patch → HTTP ' + patchResult.code);

          // Assign template via dedicated endpoint (relationships PATCH is blocked in 2025-04-15)
          if (tplResult.ok) {
            var assignResult = _klfFetch('POST', 'campaign-message-assign-template/', {
              data: {
                type: 'campaign-message',
                id:   msgId,
                relationships: {
                  template: { data: { type: 'template', id: tplResult.template_id } }
                }
              }
            });
            Logger.log('[KLF] Assign template → HTTP ' + assignResult.code);
          }
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

// ── klaviyoScheduleQstBroadcast ───────────────────────────────────────────────
// One-time broadcast of QST-E1 (template VyNxs4) to all TebDTM members.
// Excludes XJYckK (Already a Founder suppression segment).
// Scheduled: May 20 2026 9am EDT (13:00 UTC).
// Covers existing waitlist members who are already past Day 14 from signup.
function klaviyoScheduleQstBroadcast() {
  try {
    var campName  = 'EC-2026-001 · QST-E1 · TebDTM Broadcast · May 20';
    var sendAt    = '2026-05-20T13:00:00+00:00'; // 9am EDT
    var templateId = 'VyNxs4';

    var campResult = _klfFetch('POST', 'campaigns/', {
      data: {
        type: 'campaign',
        attributes: {
          name: campName,
          audiences: {
            included: [_KLF_LIST_ID],  // TebDTM
            excluded: ['XJYckK']       // Already a Founder suppression
          },
          send_options:     { use_smart_sending: false },
          tracking_options: { is_tracking_opens: true, is_tracking_clicks: true },
          send_strategy:    { method: 'static', datetime: sendAt },
          'campaign-messages': {
            data: [{ type: 'campaign-message', attributes: { definition: { channel: 'email' } } }]
          }
        }
      }
    });

    if (campResult.code !== 201 && campResult.code !== 200) {
      return { ok: false, step: 'create_campaign', error: _klfErr(campResult), http: campResult.code };
    }

    var campId = campResult.data && campResult.data.data && campResult.data.data.id;

    // Extract message ID from response
    var msgId = null;
    try {
      var rels = campResult.data.data.relationships;
      var msgData = rels && rels['campaign-messages'] && rels['campaign-messages'].data;
      if (msgData && msgData.length) msgId = msgData[0].id;
    } catch(e) {}

    // Fallback: fetch message from campaigns endpoint
    if (!msgId) {
      var msgFetch = _klfFetch('GET', 'campaigns/' + campId + '/campaign-messages/');
      if (msgFetch.code === 200 && msgFetch.data && msgFetch.data.data && msgFetch.data.data.length) {
        msgId = msgFetch.data.data[0].id;
      }
    }

    if (!msgId) return { ok: false, step: 'get_msg_id', error: 'message ID not found', camp_id: campId };

    // Assign template VyNxs4 via dedicated endpoint
    var tplResult = _klfFetch('POST', 'campaign-message-assign-template/', {
      data: {
        type: 'campaign-message',
        id:   msgId,
        relationships: { template: { data: { type: 'template', id: templateId } } }
      }
    });

    var tplOk = (tplResult.code === 200 || tplResult.code === 204 || tplResult.code === 201);

    return {
      ok:               true,
      camp_id:          campId,
      msg_id:           msgId,
      template_id:      templateId,
      template_assigned: tplOk,
      template_code:    tplResult.code,
      send_at:          sendAt,
      audience_list:    _KLF_LIST_ID,
      exclusion_seg:    'XJYckK'
    };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── klaviyoBuildQstInviteFlow ─────────────────────────────────────────────────
// Creates a new flow shell triggered by TebDTM list add.
// Action steps (14-day delay + QST-E1 email VyNxs4) must be added in Klaviyo UI
// — POST /api/flow-actions/ returns 405 in all API revisions.
// Run klaviyo_set_live after wiring steps in UI to make it live.
function klaviyoBuildQstInviteFlow() {
  try {
    var flowName = 'EC-2026-001 · QST Invitation · Day 14';
    var flowResult = klaviyoCreateFlow(flowName, _KLF_LIST_ID);

    if (!flowResult.ok) {
      return {
        ok: false,
        error: flowResult.error,
        manual_flow_required: true,
        note: 'Create flow manually in Klaviyo UI with trigger: Added to List TebDTM'
      };
    }

    return {
      ok:        true,
      flow_id:   flowResult.flow_id,
      flow_name: flowName,
      trigger:   'Added to List — TebDTM (' + _KLF_LIST_ID + ')',
      status:    'draft',
      next_steps: [
        'In Klaviyo UI: open flow ' + flowResult.flow_id,
        'Add step: DELAY 14 days',
        'Add step: EMAIL — template VyNxs4 (QST-E1)',
        'Save and exit',
        'Run {"action":"klaviyo_set_live"} to go live'
      ]
    };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── klaviyoRescheduleQstBroadcast ─────────────────────────────────────────────
// Reschedules the QST-E1 TebDTM broadcast to a new send date.
// Tries PATCH first (works on draft); falls back to cancel+delete+recreate if locked.
function klaviyoRescheduleQstBroadcast(campaignId, newSendAt) {
  try {
    if (!campaignId) return { ok: false, error: 'campaignId required' };
    if (!newSendAt)  return { ok: false, error: 'newSendAt required (ISO 8601 with offset)' };

    // Step 1: PATCH send_strategy + audiences + options
    var nameSlice  = newSendAt.slice(5, 10).replace('-', '/');
    var patchResult = _klfFetch('PATCH', 'campaigns/' + campaignId + '/', {
      data: {
        type: 'campaign',
        id:   campaignId,
        attributes: {
          name:             'EC-2026-001 · QST-E1 · TebDTM Broadcast · ' + nameSlice,
          send_strategy:    { method: 'static', datetime: newSendAt },
          audiences:        { included: [_KLF_LIST_ID], excluded: ['XJYckK'] },
          send_options:     { use_smart_sending: false },
          tracking_options: { is_tracking_opens: true, is_tracking_clicks: true }
        }
      }
    });

    if (patchResult.code === 200) {
      // Campaign was Draft (PATCH succeeded). DELETE it and recreate with send_strategy
      // so Klaviyo auto-schedules it — the same pattern proven by the 14 SEQ-3/4 campaigns.
      // (POST /campaign-send-jobs/ relationships.campaign is not allowed in API rev 2025-04-15)
      var del2 = _klfFetch('DELETE', 'campaigns/' + campaignId + '/');
      Logger.log('[KLF] QST-E1 DELETE draft → HTTP ' + del2.code);
      if (del2.code !== 204 && del2.code !== 200) {
        return { ok: false, action: 'delete_draft_failed', http: del2.code, error: _klfErr(del2) };
      }
      Utilities.sleep(500);
      var campResult = _klfFetch('POST', 'campaigns/', {
        data: {
          type: 'campaign',
          attributes: {
            name:             'EC-2026-001 · QST-E1 · TebDTM Broadcast · ' + nameSlice,
            audiences:        { included: [_KLF_LIST_ID], excluded: ['XJYckK'] },
            send_options:     { use_smart_sending: false },
            tracking_options: { is_tracking_opens: true, is_tracking_clicks: true },
            send_strategy:    { method: 'static', datetime: newSendAt },
            'campaign-messages': {
              data: [{ type: 'campaign-message', attributes: { definition: { channel: 'email' } } }]
            }
          }
        }
      });
      if (campResult.code !== 201 && campResult.code !== 200) {
        return { ok: false, action: 'recreate_failed', error: _klfErr(campResult) };
      }
      var newCampId = campResult.data && campResult.data.data && campResult.data.data.id;
      var newMsgId2 = null;
      try {
        var rels3 = campResult.data.data.relationships;
        var md3   = rels3 && rels3['campaign-messages'] && rels3['campaign-messages'].data;
        if (md3 && md3.length) newMsgId2 = md3[0].id;
      } catch(ex2) {}
      if (!newMsgId2) {
        var mf2 = _klfFetch('GET', 'campaigns/' + newCampId + '/campaign-messages/');
        if (mf2.code === 200 && mf2.data && mf2.data.data && mf2.data.data.length) newMsgId2 = mf2.data.data[0].id;
      }
      // Look up QST-E1 subject/preview from EmailSequences
      var qstSubject = 'I want to invite you to something';
      var qstPreview = '';
      try {
        var allSeqs = getEmailSequences(_KLF_CAMPAIGN_ID);
        for (var si = 0; si < allSeqs.length; si++) {
          var se = allSeqs[si];
          if (String(se.sequence_code) === 'QST' && Number(se.email_number) === 1) {
            qstSubject = String(se.subject_line || qstSubject);
            qstPreview = String(se.preview_text  || '');
            break;
          }
        }
      } catch(qe) {}

      var tplOk2 = false;
      if (newMsgId2) {
        _klfFetch('PATCH', 'campaign-messages/' + newMsgId2 + '/', {
          data: {
            type: 'campaign-message',
            id:   newMsgId2,
            attributes: {
              definition: {
                channel: 'email',
                content: {
                  subject:      qstSubject,
                  preview_text: qstPreview,
                  from_email:   _KLF_FROM_EMAIL,
                  from_label:   _KLF_FROM_NAME
                }
              }
            }
          }
        });
        var tplRes2 = _klfFetch('POST', 'campaign-message-assign-template/', {
          data: {
            type: 'campaign-message',
            id:   newMsgId2,
            relationships: { template: { data: { type: 'template', id: 'VyNxs4' } } }
          }
        });
        tplOk2 = (tplRes2.code === 200 || tplRes2.code === 204 || tplRes2.code === 201);
        Logger.log('[KLF] QST-E1 assign template VyNxs4 → HTTP ' + tplRes2.code);
      }
      // Schedule the new campaign — data.id = campaign_id per Klaviyo 2025-04-15
      Utilities.sleep(300);
      var sjRes2 = _klfFetch('POST', 'campaign-send-jobs/', {
        data: { type: 'campaign-send-job', id: newCampId }
      });
      Logger.log('[KLF] QST-E1 send-job POST → HTTP ' + sjRes2.code);
      return {
        ok:                true,
        action:            'recreated',
        old_camp_id:       campaignId,
        new_camp_id:       newCampId,
        new_send_at:       newSendAt,
        template_ok:       tplOk2,
        send_job_code:     sjRes2.code,
        send_job_error:    (sjRes2.code !== 200 && sjRes2.code !== 201 && sjRes2.code !== 202) ? _klfErr(sjRes2) : null
      };
    }

    Logger.log('[KLF] Campaign PATCH → HTTP ' + patchResult.code + ' — trying cancel+delete+recreate');

    // Step 2: Cancel job
    var cancelResult = _klfFetch('POST', 'campaign-cancel-jobs/', {
      data: {
        type: 'campaign-cancel-job',
        attributes: {},
        relationships: { campaign: { data: { type: 'campaign', id: campaignId } } }
      }
    });
    Logger.log('[KLF] Cancel job → HTTP ' + cancelResult.code);
    Utilities.sleep(1000);

    // Step 3: Delete
    var deleteResult = _klfFetch('DELETE', 'campaigns/' + campaignId + '/');
    Logger.log('[KLF] Delete → HTTP ' + deleteResult.code);

    if (deleteResult.code !== 204 && deleteResult.code !== 200) {
      return {
        ok:          false,
        action:      'manual_required',
        patch_code:  patchResult.code,
        cancel_code: cancelResult.code,
        delete_code: deleteResult.code,
        old_camp_id: campaignId,
        note:        'Cancel old broadcast manually in Klaviyo UI, then run klaviyo_schedule_qst_broadcast'
      };
    }

    // Step 4: Recreate at new date
    var campResult = _klfFetch('POST', 'campaigns/', {
      data: {
        type: 'campaign',
        attributes: {
          name: 'EC-2026-001 · QST-E1 · TebDTM Broadcast · ' + nameSlice,
          audiences:        { included: [_KLF_LIST_ID], excluded: ['XJYckK'] },
          send_options:     { use_smart_sending: false },
          tracking_options: { is_tracking_opens: true, is_tracking_clicks: true },
          send_strategy:    { method: 'static', datetime: newSendAt },
          'campaign-messages': { data: [{ type: 'campaign-message', attributes: { definition: { channel: 'email' } } }] }
        }
      }
    });

    if (campResult.code !== 201 && campResult.code !== 200) {
      return { ok: false, action: 'recreate_failed', error: _klfErr(campResult) };
    }

    var newCampId = campResult.data && campResult.data.data && campResult.data.data.id;
    var newMsgId  = null;
    try {
      var rels2 = campResult.data.data.relationships;
      var md2   = rels2 && rels2['campaign-messages'] && rels2['campaign-messages'].data;
      if (md2 && md2.length) newMsgId = md2[0].id;
    } catch(ex) {}
    if (!newMsgId) {
      var mf = _klfFetch('GET', 'campaigns/' + newCampId + '/campaign-messages/');
      if (mf.code === 200 && mf.data && mf.data.data && mf.data.data.length) newMsgId = mf.data.data[0].id;
    }

    var tplOk = false;
    if (newMsgId) {
      var tplRes = _klfFetch('POST', 'campaign-message-assign-template/', {
        data: { type: 'campaign-message', id: newMsgId,
          relationships: { template: { data: { type: 'template', id: 'VyNxs4' } } } }
      });
      tplOk = (tplRes.code === 200 || tplRes.code === 204 || tplRes.code === 201);
    }

    return {
      ok:                true,
      action:            'recreated',
      old_camp_id:       campaignId,
      new_camp_id:       newCampId,
      template_assigned: tplOk,
      new_send_at:       newSendAt
    };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── klaviyoRescheduleSeq34Campaigns ──────────────────────────────────────────
// Recreates all 14 SEQ-3/SEQ-4 campaigns with correct send dates (9am EDT).
// Root cause: original creation set send_strategy.datetime to creation timestamp
// (~May 18 9:32pm UTC) instead of the correct June/July send dates.
// Fix: DELETE old campaign → POST new campaign with correct date → assign template.
// Audiences: Variant A = klaviyo_segment_id_a (UQTdyL), B = klaviyo_segment_id_b (VpgZPZ).
// Both exclude XJYckK (Already a Founder suppression segment).
// Recreates all 14 SEQ-3/4 campaigns from scratch using send_day from EmailSequences.
// Send dates computed via _klfSendAt(send_day) — reads campaign_start_date + timezone from CcSettings.
// Assumes old campaigns already cancelled/deleted in Klaviyo UI.
// Does NOT call POST campaign-send-jobs — send_strategy.datetime in campaign POST is sufficient.
function klaviyoRescheduleSeq34Campaigns() {
  try {
    var listAId = _cvtReadSetting('klaviyo_segment_id_a');
    var listBId = _cvtReadSetting('klaviyo_segment_id_b');
    var suppId  = _cvtReadSetting('klaviyo_suppression_segment_id');
    if (!listAId) return { ok: false, error: 'klaviyo_segment_id_a missing from CcSettings' };
    if (!listBId) return { ok: false, error: 'klaviyo_segment_id_b missing from CcSettings' };
    if (!suppId)  return { ok: false, error: 'klaviyo_suppression_segment_id missing from CcSettings' };

    var allEmails = getEmailSequences(_KLF_CAMPAIGN_ID);
    var campEmails = allEmails.filter(function(e) {
      return _KLF_CAMP_SEQS.indexOf(String(e.sequence_code)) !== -1;
    });

    // Group into A/B pairs by sequence_code + email_number
    var pairs = {};
    campEmails.forEach(function(e) {
      var key = String(e.sequence_code) + '-E' + String(e.email_number);
      if (!pairs[key]) pairs[key] = {};
      var icp = String(e.icp_code || '');
      if (icp === 'super_mom_money') pairs[key].a = e;
      else if (icp === 'super_mom_time') pairs[key].b = e;
    });

    var results = { ok: true, done: 0, errors: [], rows: [] };

    Object.keys(pairs).sort().forEach(function(pairKey) {
      var pair = pairs[pairKey];

      [{ email: pair.a, variant: 'A', segId: listAId }, { email: pair.b, variant: 'B', segId: listBId }].forEach(function(item) {
        var email = item.email;
        if (!email) return;

        var sendAt     = _klfSendAt(Number(email.send_day) || 0);
        var templateId = String(email.seq_template_id || '');
        var campName   = 'EC-2026-001 · ' + pairKey + ' · Variant ' + item.variant;
        var seqCode    = String(email.sequence_code);

        Utilities.sleep(300);

        // POST campaign — send_strategy.datetime schedules it automatically (no send-job needed)
        var campResult = _klfFetch('POST', 'campaigns/', {
          data: {
            type: 'campaign',
            attributes: {
              name:             campName,
              audiences:        { included: [item.segId], excluded: [suppId] },
              send_options:     { use_smart_sending: false },
              tracking_options: { is_tracking_opens: true, is_tracking_clicks: true },
              send_strategy:    { method: 'static', datetime: sendAt },
              'campaign-messages': {
                data: [{ type: 'campaign-message', attributes: { definition: { channel: 'email' } } }]
              }
            }
          }
        });

        if (campResult.code !== 201 && campResult.code !== 200) {
          results.errors.push(pairKey + '-' + item.variant);
          results.rows.push({ key: pairKey + '-' + item.variant, ok: false, step: 'create', http: campResult.code, error: _klfErr(campResult) });
          return;
        }

        var newCampId = campResult.data && campResult.data.data && campResult.data.data.id;

        // Get message ID
        var msgId = null;
        try {
          var rels = campResult.data.data.relationships;
          var md   = rels && rels['campaign-messages'] && rels['campaign-messages'].data;
          if (md && md.length) msgId = md[0].id;
        } catch(ex) {}
        if (!msgId) {
          var mf = _klfFetch('GET', 'campaigns/' + newCampId + '/campaign-messages/');
          if (mf.code === 200 && mf.data && mf.data.data && mf.data.data.length) msgId = mf.data.data[0].id;
        }

        // Patch subject/from/preview — no channel_options (utm_params blocked in API 2025-04-15)
        var patchOk = false;
        if (msgId) {
          var pr = _klfFetch('PATCH', 'campaign-messages/' + msgId + '/', {
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
          });
          patchOk = (pr.code === 200 || pr.code === 204);
          Logger.log('[KLF] PATCH message ' + msgId + ' → ' + pr.code);
        }

        // Assign existing template
        var tplOk = false;
        if (msgId && templateId) {
          var tplRes = _klfFetch('POST', 'campaign-message-assign-template/', {
            data: { type: 'campaign-message', id: msgId,
              relationships: { template: { data: { type: 'template', id: templateId } } } }
          });
          tplOk = (tplRes.code === 200 || tplRes.code === 201 || tplRes.code === 204);
          Logger.log('[KLF] assign template ' + templateId + ' → ' + tplRes.code);
        }

        // Explicit send-job — ensures campaign moves to Scheduled even if auto-schedule didn't fire
        var sjHttp = null;
        if (newCampId && patchOk) {
          Utilities.sleep(300);
          var sj = _klfFetch('POST', 'campaign-send-jobs/', {
            data: { type: 'campaign-send-job', id: newCampId }
          });
          sjHttp = sj.code;
          Logger.log('[KLF] send-job ' + newCampId + ' → ' + sj.code);
        }

        // Write new campaign ID back to sheet
        if (newCampId) _klfWriteBack(email.id, 'klaviyo_id', newCampId);

        results.done++;
        results.rows.push({
          key:         pairKey + '-' + item.variant,
          ok:          true,
          new_id:      newCampId,
          send_at:     sendAt,
          send_day:    Number(email.send_day) || 0,
          patch_ok:    patchOk,
          sj_http:     sjHttp,
          template_id: templateId,
          template_ok: tplOk
        });
        Logger.log('[KLF] Created ' + pairKey + '-' + item.variant + ': ' + newCampId + ' → ' + sendAt);
      });
    });

    Logger.log('[KLF] klaviyoRescheduleSeq34Campaigns done — ' + results.done + ' created, ' + results.errors.length + ' errors');
    return results;
  } catch(e) {
    Logger.log('[KLF] klaviyoRescheduleSeq34Campaigns error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── _klfIsoFromCalDate ────────────────────────────────────────────────────────
// Convert YYYY-MM-DD to UTC ISO datetime using campaign send hour + timezone.
// Mirrors _klfSendAt but takes an absolute date instead of a day offset.
function _klfIsoFromCalDate(dateStr) {
  var tzOff = Number(_cvtReadSetting('campaign_timezone_offset') || '') || -4;
  var hour  = Number(_cvtReadSetting('campaign_send_hour') || '') || 9;
  var parts = dateStr.split('-');
  var utcMidnight = Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  var utcSendHour = (hour - tzOff + 24) % 24;
  var d = new Date(utcMidnight + utcSendHour * 3600000);
  return d.toISOString().replace('.000Z', 'Z');
}

// ── _moveEmailCampaignDate ────────────────────────────────────────────────────
// Called by moveAsset when asset_type === 'email' (SEQ-3/4 broadcast campaigns only).
// Deletes the old Klaviyo campaign (identified by klaviyo_id in EmailSequences),
// recreates it with the new date, and writes the new Klaviyo ID back to the sheet.
// Returns: { seq_updated, rescheduled, requires_manual, new_id, error }
function _moveEmailCampaignDate(assetId, newDate) {
  var result = { seq_updated: false, rescheduled: false, requires_manual: false, new_id: null, error: null };
  try {
    var emSheet = _getCCSheet(_CC_TAB.EMAIL);
    var emHdrs  = _CC_HDR.EmailSequences;
    var H = {};
    emHdrs.forEach(function(h, i) { H[h] = i; });

    var last = emSheet.getLastRow();
    if (last < 2) { result.requires_manual = true; result.error = 'EmailSequences tab empty'; return result; }

    var rows = emSheet.getRange(2, 1, last - 1, emHdrs.length).getValues();
    var emailRow = null, rowIndex = -1;
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][H.id]) === assetId) { emailRow = rows[i]; rowIndex = i + 2; break; }
    }

    if (!emailRow) {
      result.requires_manual = true;
      result.error = 'Email sequence ' + assetId + ' not found — reschedule Klaviyo manually';
      return result;
    }

    var klvId     = String(emailRow[H.klaviyo_id]     || '');
    var seqCode   = String(emailRow[H.sequence_code]  || '');
    var icp       = String(emailRow[H.icp_code]       || '');
    var tplId     = String(emailRow[H.seq_template_id]|| '');
    var emailNum  = Number(emailRow[H.email_number]   || 0);
    var subject   = String(emailRow[H.subject_line]   || '');
    var preview   = String(emailRow[H.preview_text]   || '');
    var variant   = icp === 'super_mom_money' ? 'A' : 'B';

    var listAId = _cvtReadSetting('klaviyo_segment_id_a');
    var listBId = _cvtReadSetting('klaviyo_segment_id_b');
    var suppId  = _cvtReadSetting('klaviyo_suppression_segment_id');
    var segId   = icp === 'super_mom_money' ? listAId : listBId;

    if (!segId)  { result.requires_manual = true; result.error = 'Audience segment ID missing from CcSettings'; return result; }

    var sendAt = _klfIsoFromCalDate(newDate);

    // Delete old campaign
    if (klvId) {
      var delR = _klfFetch('DELETE', 'campaigns/' + klvId + '/');
      Logger.log('[moveEmail] DELETE old ' + klvId + ' → ' + delR.code);
    }

    Utilities.sleep(400);

    // Recreate campaign with new date
    var campName = 'EC-2026-001 · ' + seqCode + '-E' + emailNum + ' · Variant ' + variant;
    var campR = _klfFetch('POST', 'campaigns/', {
      data: { type: 'campaign', attributes: {
        name: campName,
        audiences:        { included: [segId], excluded: suppId ? [suppId] : [] },
        send_options:     { use_smart_sending: false },
        tracking_options: { is_tracking_opens: true, is_tracking_clicks: true },
        send_strategy:    { method: 'static', datetime: sendAt },
        'campaign-messages': { data: [{ type: 'campaign-message', attributes: { definition: { channel: 'email' } } }] }
      }}
    });

    if (campR.code !== 201 && campR.code !== 200) {
      result.requires_manual = true;
      result.error = 'Failed to create Klaviyo campaign: HTTP ' + campR.code;
      return result;
    }

    var newCampId = campR.data && campR.data.data && campR.data.data.id;

    // Get message ID
    var msgId = null;
    try {
      var md = campR.data.data.relationships['campaign-messages'].data;
      if (md && md.length) msgId = md[0].id;
    } catch(ex) {}
    if (!msgId) {
      var mf = _klfFetch('GET', 'campaigns/' + newCampId + '/campaign-messages/');
      if (mf.code === 200 && mf.data && mf.data.data && mf.data.data.length) msgId = mf.data.data[0].id;
    }

    // Patch subject / from
    var patchOk = false;
    if (msgId) {
      var pr = _klfFetch('PATCH', 'campaign-messages/' + msgId + '/', {
        data: { type: 'campaign-message', id: msgId,
          attributes: { definition: { channel: 'email', content: {
            subject: subject, preview_text: preview,
            from_email: _KLF_FROM_EMAIL, from_label: _KLF_FROM_NAME
          }}}}
      });
      patchOk = (pr.code === 200 || pr.code === 204);

      // Assign template
      if (tplId) {
        _klfFetch('POST', 'campaign-message-assign-template/', {
          data: { type: 'campaign-message', id: msgId,
            relationships: { template: { data: { type: 'template', id: tplId } } } }
        });
      }
    }

    // Explicit send-job
    if (newCampId && patchOk) {
      Utilities.sleep(300);
      _klfFetch('POST', 'campaign-send-jobs/', { data: { type: 'campaign-send-job', id: newCampId } });
    }

    // Write new Klaviyo ID back to EmailSequences
    if (newCampId && rowIndex > 0) {
      var klvCol = emHdrs.indexOf('klaviyo_id') + 1;
      if (klvCol > 0) emSheet.getRange(rowIndex, klvCol).setValue(newCampId);
      result.seq_updated = true;
    }

    result.rescheduled = true;
    result.new_id = newCampId;
    Logger.log('[moveEmail] ' + assetId + ' → new campaign ' + newCampId + ' @ ' + sendAt);
    return result;
  } catch(e) {
    result.error = e.message;
    result.requires_manual = true;
    Logger.log('[moveEmail] ERROR: ' + e.message);
    return result;
  }
}

// ── klaviyoActivateAndCleanCampaigns ─────────────────────────────────────────
// 1. POSTs campaign-send-jobs for every Draft EC-2026-001 campaign → Scheduled
// 2. Deletes every Cancelled EC-2026-001 campaign
// 3. Attempts to PATCH UTM tracking on each Draft campaign before scheduling
// 4. Returns final status table
function klaviyoActivateAndCleanCampaigns() {
  try {
    var cr = _klfFetch('GET', "campaigns/?filter=equals(messages.channel,'email')&page[size]=100&fields[campaign]=name,status,send_strategy");
    if (cr.code !== 200) return { ok: false, error: 'fetch failed: ' + cr.code };

    var campaigns = cr.data && cr.data.data || [];
    var results = { ok: true, scheduled: [], deleted: [], utm_errors: [], errors: [] };

    campaigns.forEach(function(c) {
      var name   = String((c.attributes && c.attributes.name) || '');
      var status = String((c.attributes && c.attributes.status) || '');
      var isEC   = name.indexOf('EC-2026-001') === 0;
      if (!isEC) return;

      Utilities.sleep(250);

      // Delete cancelled
      if (status.toLowerCase().indexOf('cancelled') === 0) {
        var d = _klfFetch('DELETE', 'campaigns/' + c.id + '/');
        results.deleted.push({ name: name, id: c.id, http: d.code, ok: d.code === 204 || d.code === 200 || d.code === 404 });
        Logger.log('[KLF] DELETE cancelled: ' + name + ' → ' + d.code);
        return;
      }

      // Schedule drafts
      if (status === 'Draft') {
        // Try PATCH UTM on campaign level (add_utm approach)
        var utmPatch = _klfFetch('PATCH', 'campaigns/' + c.id + '/', {
          data: {
            type: 'campaign',
            id:   c.id,
            attributes: {
              tracking_options: {
                is_tracking_opens:  true,
                is_tracking_clicks: true,
                add_utm:  true,
                utm_params: [
                  { name: 'utm_source',   value: 'klaviyo' },
                  { name: 'utm_medium',   value: 'email' },
                  { name: 'utm_campaign', value: '{{ message.name }}' }
                ]
              }
            }
          }
        });
        if (utmPatch.code !== 200 && utmPatch.code !== 204) {
          results.utm_errors.push({ name: name, http: utmPatch.code, error: _klfErr(utmPatch) });
          Logger.log('[KLF] UTM PATCH ' + name + ' → ' + utmPatch.code + ' ' + _klfErr(utmPatch));
        } else {
          Logger.log('[KLF] UTM PATCH ' + name + ' → ' + utmPatch.code + ' ✅');
        }

        Utilities.sleep(250);

        // POST send-job — campaign already has send_strategy.datetime set; Klaviyo schedules at that time
        var sj = _klfFetch('POST', 'campaign-send-jobs/', {
          data: { type: 'campaign-send-job', id: c.id }
        });
        var sjOk = sj.code === 200 || sj.code === 201 || sj.code === 202;
        var sendAt = c.attributes && c.attributes.send_strategy && c.attributes.send_strategy.datetime;
        results.scheduled.push({ name: name, id: c.id, send_at: sendAt || 'unknown', sj_http: sj.code, ok: sjOk });
        Logger.log('[KLF] SEND-JOB ' + name + ' → ' + sj.code);
      }
    });

    return results;
  } catch(e) {
    Logger.log('[KLF] klaviyoActivateAndCleanCampaigns error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── klaviyoFixSeq4Messages ────────────────────────────────────────────────────
// SEQ-4 campaigns are Draft because their message PATCH failed (channel_options bug).
// This reads klaviyo_id from EmailSequences, PATCHes subject/from on each message,
// then POSTs send-jobs to move them to Scheduled.
function klaviyoFixSeq4Messages() {
  try {
    var allEmails = getEmailSequences(_KLF_CAMPAIGN_ID);
    var seq4 = allEmails.filter(function(e) { return String(e.sequence_code) === 'SEQ-4'; });

    var results = { ok: true, done: 0, errors: [], rows: [] };

    seq4.forEach(function(e) {
      var campId = String(e.klaviyo_id || '');
      if (!campId) { results.errors.push(String(e.id) + ': no klaviyo_id'); return; }

      Utilities.sleep(300);

      // Get message ID
      var msgFetch = _klfFetch('GET', 'campaigns/' + campId + '/campaign-messages/');
      if (msgFetch.code !== 200 || !msgFetch.data || !msgFetch.data.data || !msgFetch.data.data.length) {
        results.errors.push(String(e.id) + ': could not get message id (HTTP ' + msgFetch.code + ')');
        return;
      }
      var msgId = msgFetch.data.data[0].id;

      // PATCH subject/from/preview — no channel_options
      var patchResult = _klfFetch('PATCH', 'campaign-messages/' + msgId + '/', {
        data: {
          type: 'campaign-message',
          id:   msgId,
          attributes: {
            definition: {
              channel: 'email',
              content: {
                subject:      String(e.subject_line  || ''),
                preview_text: String(e.preview_text  || ''),
                from_email:   _KLF_FROM_EMAIL,
                from_label:   _KLF_FROM_NAME
              }
            }
          }
        }
      });
      Logger.log('[KLF] PATCH msg ' + String(e.id) + ' → ' + patchResult.code);

      Utilities.sleep(300);

      // POST send-job — now that message is complete, Klaviyo will schedule at send_strategy.datetime
      var sj = _klfFetch('POST', 'campaign-send-jobs/', {
        data: { type: 'campaign-send-job', id: campId }
      });
      var sjOk = sj.code === 200 || sj.code === 201 || sj.code === 202;
      Logger.log('[KLF] SEND-JOB ' + String(e.id) + ' → ' + sj.code);

      results.done++;
      results.rows.push({
        id:          String(e.id),
        camp_id:     campId,
        msg_id:      msgId,
        patch_http:  patchResult.code,
        sj_http:     sj.code,
        ok:          sjOk
      });
    });

    return results;
  } catch(err) {
    Logger.log('[KLF] klaviyoFixSeq4Messages error: ' + err.message);
    return { ok: false, error: err.message };
  }
}

// ── klaviyoFixSeq3Dates ───────────────────────────────────────────────────────
// Deletes all current SEQ-3 campaigns (any status) and recreates with correct
// send dates: E1=Jun10 E2=Jun15 E3=Jun20 E4=Jun25 at 9am EDT (13:00 UTC).
// Audience: UQTdyL (A) / VpgZPZ (B) + exclude XJYckK.
function klaviyoFixSeq3Dates() {
  try {
    var listAId = _cvtReadSetting('klaviyo_segment_id_a');
    var listBId = _cvtReadSetting('klaviyo_segment_id_b');
    var suppId  = _cvtReadSetting('klaviyo_suppression_segment_id');
    if (!listAId || !listBId || !suppId) return { ok: false, error: 'Missing list settings' };

    // Correct send dates for SEQ-3 (9am EDT = 13:00 UTC)
    var SEQ3_DATES = { '1': '2026-06-10T13:00:00Z', '2': '2026-06-15T13:00:00Z', '3': '2026-06-20T13:00:00Z', '4': '2026-06-25T13:00:00Z' };

    // Step 1: Delete all current SEQ-3 campaigns
    var cr = _klfFetch('GET', "campaigns/?filter=equals(messages.channel,'email')&page[size]=50&fields[campaign]=name,status");
    if (cr.code !== 200) return { ok: false, error: 'fetch campaigns failed: ' + cr.code };
    var deleted = 0;
    (cr.data.data || []).forEach(function(c) {
      var name = String((c.attributes && c.attributes.name) || '');
      if (name.indexOf('EC-2026-001') === 0 && name.indexOf('SEQ-3') !== -1) {
        Utilities.sleep(250);
        var d = _klfFetch('DELETE', 'campaigns/' + c.id + '/');
        if (d.code === 204 || d.code === 200 || d.code === 404) deleted++;
        Logger.log('[KLF] DELETE SEQ-3 ' + name + ' → ' + d.code);
      }
    });
    Logger.log('[KLF] klaviyoFixSeq3Dates — deleted ' + deleted + ' SEQ-3 campaigns');

    // Step 2: Load SEQ-3 emails from EmailSequences
    var allEmails = getEmailSequences(_KLF_CAMPAIGN_ID);
    var seq3 = allEmails.filter(function(e) { return String(e.sequence_code) === 'SEQ-3'; });

    var pairs = {};
    seq3.forEach(function(e) {
      var num = String(e.email_number);
      if (!pairs[num]) pairs[num] = {};
      var icp = String(e.icp_code || '');
      if (icp === 'super_mom_money') pairs[num].a = e;
      else if (icp === 'super_mom_time') pairs[num].b = e;
    });

    var results = { ok: true, deleted: deleted, done: 0, errors: [], rows: [] };

    Object.keys(pairs).sort().forEach(function(num) {
      var pair = pairs[num];
      var sendAt = SEQ3_DATES[num];
      if (!sendAt) { results.errors.push('SEQ-3-E' + num + ': no date'); return; }

      [{ email: pair.a, variant: 'A', segId: listAId }, { email: pair.b, variant: 'B', segId: listBId }].forEach(function(item) {
        var email = item.email;
        if (!email) return;
        var templateId = String(email.seq_template_id || '');
        var campName   = 'EC-2026-001 · SEQ-3-E' + num + ' · Variant ' + item.variant;

        Utilities.sleep(300);
        var campResult = _klfFetch('POST', 'campaigns/', {
          data: {
            type: 'campaign',
            attributes: {
              name:             campName,
              audiences:        { included: [item.segId], excluded: [suppId] },
              send_options:     { use_smart_sending: false },
              tracking_options: { is_tracking_opens: true, is_tracking_clicks: true },
              send_strategy:    { method: 'static', datetime: sendAt },
              'campaign-messages': {
                data: [{ type: 'campaign-message', attributes: { definition: { channel: 'email' } } }]
              }
            }
          }
        });

        if (campResult.code !== 201 && campResult.code !== 200) {
          results.errors.push(campName);
          results.rows.push({ key: campName, ok: false, http: campResult.code, error: _klfErr(campResult) });
          return;
        }

        var newCampId = campResult.data && campResult.data.data && campResult.data.data.id;
        var msgId = null;
        try { var rels = campResult.data.data.relationships; var md = rels && rels['campaign-messages'] && rels['campaign-messages'].data; if (md && md.length) msgId = md[0].id; } catch(ex) {}
        if (!msgId) { var mf = _klfFetch('GET', 'campaigns/' + newCampId + '/campaign-messages/'); if (mf.code === 200 && mf.data && mf.data.data && mf.data.data.length) msgId = mf.data.data[0].id; }

        if (msgId) {
          _klfFetch('PATCH', 'campaign-messages/' + msgId + '/', {
            data: { type: 'campaign-message', id: msgId, attributes: { definition: { channel: 'email', content: {
              subject: String(email.subject_line || ''), preview_text: String(email.preview_text || ''),
              from_email: _KLF_FROM_EMAIL, from_label: _KLF_FROM_NAME
            } } } }
          });
        }

        var tplOk = false;
        if (msgId && templateId) {
          var tplRes = _klfFetch('POST', 'campaign-message-assign-template/', {
            data: { type: 'campaign-message', id: msgId, relationships: { template: { data: { type: 'template', id: templateId } } } }
          });
          tplOk = (tplRes.code === 200 || tplRes.code === 201 || tplRes.code === 204);
        }

        if (newCampId) _klfWriteBack(email.id, 'klaviyo_id', newCampId);
        results.done++;
        results.rows.push({ key: campName, ok: true, new_id: newCampId, send_at: sendAt, template_id: templateId, template_ok: tplOk });
        Logger.log('[KLF] klaviyoFixSeq3Dates: ' + campName + ' → ' + newCampId + ' ' + sendAt);
      });
    });

    return results;
  } catch(e) {
    Logger.log('[KLF] klaviyoFixSeq3Dates error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── klaviyoCleanupDraftCancelledCampaigns ────────────────────────────────────
// Deletes all Draft and Cancelled EC-2026-001 SEQ-3/4 campaigns.
// Leaves Scheduled campaigns and the QST-E1 broadcast untouched.
function klaviyoCleanupDraftCancelledCampaigns() {
  try {
    var cr = _klfFetch('GET', "campaigns/?filter=equals(messages.channel,'email')&page[size]=50&fields[campaign]=name,status");
    if (cr.code !== 200 || !cr.data || !cr.data.data) return { ok: false, error: 'fetch failed: ' + cr.code };

    var toDelete = cr.data.data.filter(function(c) {
      var name   = String((c.attributes && c.attributes.name) || '');
      var status = String((c.attributes && c.attributes.status) || '');
      var isSeq34 = name.indexOf('EC-2026-001') === 0 && (name.indexOf('SEQ-3') !== -1 || name.indexOf('SEQ-4') !== -1);
      var isDraftOrCancelled = (status === 'Draft' || status === 'Cancelled' || status.indexOf('Cancelled') === 0);
      return isSeq34 && isDraftOrCancelled;
    });

    var deleted = 0, errors = [];
    toDelete.forEach(function(c) {
      Utilities.sleep(250);
      var r = _klfFetch('DELETE', 'campaigns/' + c.id + '/');
      if (r.code === 204 || r.code === 200 || r.code === 404) {
        deleted++;
      } else {
        errors.push({ id: c.id, name: (c.attributes && c.attributes.name) || '', code: r.code, error: _klfErr(r) });
      }
    });

    return { ok: true, found: toDelete.length, deleted: deleted, errors: errors };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}