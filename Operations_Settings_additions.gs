// ─────────────────────────────────────────────────────────────────────────────
// ADD THESE FUNCTIONS TO YOUR EXISTING Operations.gs
// Do NOT replace the existing file — paste these into it.
// ─────────────────────────────────────────────────────────────────────────────

// SETTINGS_SHEET and SETTINGS_HEADERS defined in Settings.gs.

function getSettingsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SETTINGS_SHEET);
    sheet.getRange(1, 1, 1, SETTINGS_HEADERS.length).setValues([SETTINGS_HEADERS]);
    sheet.getRange(1, 1, 1, SETTINGS_HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function getSettings() {
  var sheet = getSettingsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var rows = sheet.getRange(2, 1, lastRow - 1, SETTINGS_HEADERS.length).getValues();
  return rows
    .filter(function(r) { return r[0] && r[1] && r[2] !== '__delete__' && r[3] !== '__delete__'; })
    .map(function(r) {
      return { type: r[0], key: r[1], value: r[2], meta: r[3], updatedAt: r[4] };
    });
}

function setSetting(type, key, value, meta) {
  if (!type || !key) return;
  var sheet = getSettingsSheet();
  var lastRow = sheet.getLastRow();
  var now = new Date().toISOString();

  // Handle delete
  if (meta === '__delete__') {
    if (lastRow >= 2) {
      var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      for (var i = 0; i < data.length; i++) {
        if (data[i][0] === type && data[i][1] === key) {
          sheet.deleteRow(i + 2);
          return;
        }
      }
    }
    return;
  }

  // Upsert: find existing row
  if (lastRow >= 2) {
    var existing = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var j = 0; j < existing.length; j++) {
      if (existing[j][0] === type && existing[j][1] === key) {
        sheet.getRange(j + 2, 1, 1, SETTINGS_HEADERS.length)
          .setValues([[type, key, value, meta || '', now]]);
        return;
      }
    }
  }

  // Append new row
  sheet.appendRow([type, key, value, meta || '', now]);
}

// ── ADD TO doGet switch/if block ──────────────────────────────────────────────
// In your existing doGet(e) function, add this case:
//
//   if (action === 'settings_read') {
//     return json({ ok: true, settings: getSettings() });
//   }
//
//   if (action === 'agent_constitution_read') {
//     return json(agentConstitutionRead(e.parameter.agent));
//   }

// ── ADD TO doPost switch/if block ─────────────────────────────────────────────
// In your existing doPost(e) function, add this case:
//
//   if (body.action === 'settings_write') {
//     setSetting(body.type, body.key, body.value, body.meta || '');
//     return json({ ok: true });
//   }
//
//   if (body.action === 'agent_constitution_write') {
//     return json(agentConstitutionWrite(body.agent, body.instructions));
//   }

// ─────────────────────────────────────────────────────────────────────────────
// Agent Constitution helpers — store constitutions in the Settings sheet
// type = 'agent_constitution', key = agent name, value = instructions text
// ─────────────────────────────────────────────────────────────────────────────

function agentConstitutionRead(agent) {
  if (!agent) return { ok: false, error: 'agent is required' };
  var rows = getSettings();
  var row = rows.filter(function(r) { return r.type === 'agent_constitution' && r.key === agent; })[0];
  return { ok: true, agent: agent, instructions: row ? row.value : '' };
}

function agentConstitutionWrite(agent, instructions) {
  if (!agent) return { ok: false, error: 'agent is required' };
  setSetting('agent_constitution', agent, instructions || '', '');
  return { ok: true, agent: agent };
}

// ─────────────────────────────────────────────────────────────────────────────
// AIReference tab — session anchor for Claude Code
// Run createAIReferenceTab() once from the Apps Script editor.
// After creation, update master_reference_url with the v4.0 doc URL.
// ─────────────────────────────────────────────────────────────────────────────

function createAIReferenceTab() {
  var ss      = SpreadsheetApp.getActiveSpreadsheet();
  var today   = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var sheetId = ss.getId();

  var sh = ss.getSheetByName('AIReference');
  if (sh) {
    sh.clear();
  } else {
    sh = ss.insertSheet('AIReference');
  }

  // Headers
  var headers = ['key', 'value', 'updated_at', 'notes'];
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  var hRange = sh.getRange(1, 1, 1, headers.length);
  hRange.setBackground('#1a1a2e');
  hRange.setFontColor('#c9a84c');
  hRange.setFontWeight('bold');
  hRange.setFontFamily('Courier New');
  sh.setFrozenRows(1);

  // Rows
  var rows = [
    ['current_deploy',        '@524',                                                           today, 'Apps Script deployment version — update after each clasp deploy'],
    ['github_repo',           'https://github.com/BoaterGuy15/easyChef-Pro-Ops-Center',         today, 'Source of truth for all GAS and dashboard code'],
    ['sheet_id',              sheetId,                                                           today, 'This spreadsheet ID — used to open directly from any session'],
    ['sheet_url',             ss.getUrl(),                                                       today, 'Direct URL to Campaign Center Sheet'],
    ['master_reference_url',  'https://docs.google.com/document/d/1kIq1_bkWD4TJlSidPspqF2wc_EXFO0YHqb2BNiOiFZI/edit', today, 'v4.0 master reference doc — single source of truth for brand + governance rules'],
    ['deploy_date',           today,                                                             today, 'Date of last GAS deployment'],
    ['governance_status',     'All 7 governance blocks wired to sheet. Hardcoded fallbacks active until BrandDoctrine/CampaignStrategy rows are added.', today, 'See BrandDoctrine and CampaignStrategy tabs for required rows'],
    ['last_governance_gap',   'CLOSED 2026-05-11 — _MASTER_STORY, _CATEGORY_POSITIONING, _5_APP_REPLACEMENT, _7_STEP_FRAMEWORK, _PRECISION_RULES, _AB_ARCH, _BRAND_RULES all wired to sheet compilers', today, 'All rules now editable from sheet with zero code deployment']
  ];

  sh.getRange(2, 1, rows.length, headers.length).setValues(rows);

  // Column widths
  sh.setColumnWidth(1, 220);
  sh.setColumnWidth(2, 520);
  sh.setColumnWidth(3, 110);
  sh.setColumnWidth(4, 420);

  // Alternate row shading
  for (var i = 0; i < rows.length; i++) {
    var bg = (i % 2 === 0) ? '#f8f5f0' : '#ffffff';
    sh.getRange(i + 2, 1, 1, headers.length).setBackground(bg);
  }

  Logger.log('AIReference tab created. Sheet ID: ' + sheetId);
  Logger.log('Remember to update master_reference_url with the v4.0 doc URL.');
  return { ok: true, sheet_id: sheetId, rows_written: rows.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// archiveOldReferenceDocs()
// Run once from Apps Script editor to move all v3.x AI Campaign Assistant
// Reference docs to a "Reference Doc Archive" folder in My Drive.
// Safe: only touches files whose title matches the old naming pattern.
// The v4.0 Master Reference doc uses a different title and is never touched.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// readAiReference()
// First call in SESSION START PROTOCOL.
// Reads the AIReference tab and returns all rows as a flat key→value map
// plus a structured orientation block ready to confirm before touching code.
// Triggered via: node run-gas.js '{"action":"read_ai_reference"}'
// ─────────────────────────────────────────────────────────────────────────────

function readAiReference() {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('AIReference');
    if (!sheet) return { ok: false, error: 'AIReference tab not found — run create_ai_reference_tab first' };

    var data    = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h).trim(); });
    var ref     = {};

    for (var i = 1; i < data.length; i++) {
      var row = {};
      headers.forEach(function(h, j) { row[h] = String(data[i][j] || ''); });
      if (row.key) ref[row.key] = { value: row.value, updated_at: row.updated_at, notes: row.notes };
    }

    var orientation = {
      deploy:          (ref.current_deploy   || {}).value || 'unknown',
      sheet_id:        (ref.sheet_id          || {}).value || 'unknown',
      sheet_url:       (ref.sheet_url         || {}).value || '',
      master_ref_url:  (ref.master_reference_url || {}).value || '',
      github_repo:     (ref.github_repo       || {}).value || '',
      deploy_date:     (ref.deploy_date       || {}).value || '',
      governance:      (ref.governance_status || {}).value || '',
      last_gap_closed: (ref.last_governance_gap || {}).value || ''
    };

    Logger.log('[readAiReference] orientation loaded — deploy=' + orientation.deploy);
    return { ok: true, ref: ref, orientation: orientation };

  } catch(e) {
    Logger.log('[readAiReference] error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// updateMasterReference()
// Updates the Master Reference v4.0 Google Doc via the Docs API.
// Triggered via: node run-gas.js '{"action":"update_master_reference",...}'
//
// Supported params (all optional, combine freely):
//   old_deploy    {string}   e.g. "@529" — text to find and replace
//   new_deploy    {string}   e.g. "@530"
//   mark_done     {string[]} exact text of items to prefix with "✅ DONE — "
//   session_log   {object}   { date, deploy_range, changes: string[] }
//                            appended as a formatted block at the end of the doc
// ─────────────────────────────────────────────────────────────────────────────

function updateMasterReference(params) {
  var DOC_ID = '1kIq1_bkWD4TJlSidPspqF2wc_EXFO0YHqb2BNiOiFZI';
  var p      = params || {};
  var ops    = [];

  try {
    var doc  = DocumentApp.openById(DOC_ID);
    var body = doc.getBody();

    // 1. Replace deploy version everywhere it appears
    if (p.old_deploy && p.new_deploy && p.old_deploy !== p.new_deploy) {
      body.replaceText(p.old_deploy.replace(/[@]/g, '\\$&'), p.new_deploy);
      ops.push('deploy: ' + p.old_deploy + ' → ' + p.new_deploy);
    }

    // 2. Mark items done — prepend ✅ DONE to matched text
    if (Array.isArray(p.mark_done)) {
      p.mark_done.forEach(function(item) {
        if (!item) return;
        // Escape regex special chars in the item text
        var escaped = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Only mark if not already marked
        var alreadyDone = body.getText().indexOf('✅ DONE — ' + item) > -1;
        if (!alreadyDone) {
          body.replaceText(escaped, '✅ DONE — ' + item);
          ops.push('marked done: ' + item);
        } else {
          ops.push('already done (skipped): ' + item);
        }
      });
    }

    // 3. Append session log as formatted paragraph block
    if (p.session_log) {
      var sl   = p.session_log;
      var date = sl.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
      body.appendParagraph('').setSpacingBefore(12);
      var divider = body.appendParagraph('────────────────────────────────────────');
      divider.setHeading(DocumentApp.ParagraphHeading.NORMAL);
      var header = body.appendParagraph('SESSION LOG — ' + date + ' · Deploy range: ' + (sl.deploy_range || ''));
      header.setBold(true);
      if (Array.isArray(sl.changes) && sl.changes.length) {
        sl.changes.forEach(function(c) { body.appendParagraph('  • ' + c); });
      }
      body.appendParagraph('────────────────────────────────────────');
      ops.push('session log appended (' + ((sl.changes || []).length) + ' changes)');
    }

    // 4. Sync current_deploy in AIReference tab to keep read_ai_reference current
    if (p.new_deploy) {
      try {
        var aiSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('AIReference');
        if (aiSheet) {
          var aiData = aiSheet.getDataRange().getValues();
          for (var r = 1; r < aiData.length; r++) {
            if (String(aiData[r][0]).trim() === 'current_deploy') {
              aiSheet.getRange(r + 1, 2).setValue(p.new_deploy);
              aiSheet.getRange(r + 1, 3).setValue(Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'));
              ops.push('AIReference current_deploy → ' + p.new_deploy);
              break;
            }
          }
        }
      } catch(aiErr) {
        Logger.log('[updateMasterReference] AIReference sync error: ' + aiErr.message);
      }
    }

    if (ops.length === 0) {
      return { ok: false, error: 'No update params provided (pass old_deploy/new_deploy, mark_done, or session_log)' };
    }

    Logger.log('[updateMasterReference] ' + ops.length + ' operation(s): ' + ops.join(' | '));
    return {
      ok:          true,
      ops:         ops,
      doc_id:      DOC_ID,
      doc_url:     'https://docs.google.com/document/d/' + DOC_ID + '/edit'
    };

  } catch(e) {
    Logger.log('[updateMasterReference] error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// seedGovernanceRows()
// Adds the 7 governance rows that close the last hardcoded-constant gap.
// Safe upsert — skips any row whose ID already exists in the tab.
// Triggered via: node run-gas.js '{"action":"seed_governance_rows"}'
// ─────────────────────────────────────────────────────────────────────────────

function seedGovernanceRows() {
  var ss     = _getCampaignSpreadsheet();
  var bdSheet = ss.getSheetByName(_CC_TAB.BRAND_DOCTRINE);
  var csSheet = ss.getSheetByName(_CC_TAB.CAMP_STRATEGY);
  var written = [], skipped = [];

  function _upsertBD(row) {
    var id   = row[0];
    var last = bdSheet.getLastRow();
    if (last >= 2) {
      var ids = bdSheet.getRange(2, 1, last - 1, 1).getValues().map(function(r){ return String(r[0]); });
      if (ids.indexOf(id) > -1) { skipped.push(id); return; }
    }
    bdSheet.appendRow(row);
    written.push(id);
  }

  function _upsertCS(row) {
    var id   = row[0];
    var last = csSheet.getLastRow();
    if (last >= 2) {
      var ids = csSheet.getRange(2, 1, last - 1, 1).getValues().map(function(r){ return String(r[0]); });
      if (ids.indexOf(id) > -1) { skipped.push(id); return; }
    }
    csSheet.appendRow(row);
    written.push(id);
  }

  // ── CampaignStrategy rows ─────────────────────────────────────────────────

  _upsertCS(['MASTER_STORY_001', 'narrative', 'TRUE', JSON.stringify({
    story: "Your kitchen is broken. Not because of you. Because no tool ever closed the loop.\neasyChef Pro closes the loop. Your kitchen. In command.",
    narrative_spine: "The ICP's kitchen is broken — not her fault — and easyChef Pro is the only tool that closes the full loop.",
    instruction: "This is the narrative spine. Every headline, every hook, every CTA must connect back to it."
  })]);

  _upsertCS(['CATEGORY_POSITION_001', 'positioning', 'TRUE', JSON.stringify({
    headline: "easyChef Pro is the only food app you need. Not a feature — a category claim.\nEvery other app solves one part: the recipe, the grocery list, the budget tracker.\neasyChef Pro closes the full loop: TRACK what you have → PLAN the week → SHOP efficiently → COOK confidently → ZERO waste.",
    never_rule: "Never position against a specific competitor. Position against the broken status quo.",
    enemy: "The enemy is not another app. The enemy is the 6:30 PM panic. The expired spinach. The $1,336 thrown away."
  })]);

  _upsertCS(['SEVEN_STEP_FRAMEWORK_001', 'framework', 'TRUE', JSON.stringify({
    steps: [
      { name: 'hook',    description: 'Stop the scroll in the first 5 words. Name the specific moment — not the category.',        kills: '"Are you tired of..." / "Imagine a world..." / any generic opener.',                                                              works: 'Name the exact time, object, feeling. "6:30 PM. Empty fridge. Three kids asking."' },
      { name: 'problem', description: 'Name the exact pain in one sentence. Specific moment — not a general problem.',              kills: 'Abstract language. "Meal planning is hard" is dead copy.',                                                                       works: 'You buy groceries Sunday. By Wednesday it\'s a guessing game and someone gets cereal.' },
      { name: 'agitate', description: 'Make the cost real. One undeniable number per sentence. Honest — never dramatic.',           kills: 'Shame language. "You are failing your family" is never acceptable. Ever.',                                                        works: 'The average family throws away $1,336 of groceries every year. Not bad decisions. Just no system.' },
      { name: 'solve',   description: 'One sentence only. Introduce easyChef Pro as the obvious answer. No feature lists.',         kills: '"easyChef Pro has 5 powerful features including..." — no. One sentence.',                                                         works: 'easyChef Pro looks at what is in your fridge and tells you exactly what to make tonight.' },
      { name: 'value',   description: 'Outcomes she wants. Not features — feelings and results. Specific, not aspirational.',       kills: '"You will feel amazing about cooking again." Vague. Empty.',                                                                     works: '$1,336 back. 30 minutes fridge to table. And the 6:30 panic is just gone.' },
      { name: 'proof',   description: 'One validated stat from the approved claims list. One only. Never invented.',                kills: 'Made-up stats / invented testimonials / "thousands of families love it".',                                                       works: 'Validated across 10,000 household profiles. Exact wording from the approved list.' },
      { name: 'cta',     description: 'One action. Outcome-framed. Low friction. Tell them what they GET, not what they DO.',       kills: '"Click here" / "Sign up now" — action-framed, not outcome-framed.',                                                             works: 'Claim your founding spot — $7.99/month locked forever. First 5,000 families only.' }
    ]
  })]);

  // ── BrandDoctrine rows ────────────────────────────────────────────────────

  _upsertBD(['FIVE_APP_REPLACEMENT_001', 'product_rule', 'hard', 'TRUE', JSON.stringify({
    apps: [
      { app_name: 'NoWaste',            feature_label: 'TRACK    (Pantry Intelligence — scans receipts · tracks expiry)' },
      { app_name: 'Mealime',            feature_label: 'PLAN     (Meal Planning Engine — builds week from what you already have)' },
      { app_name: 'MyFitnessPal',       feature_label: 'OPTIMIZE (Nutrition Scoring — 6 dimensions · FDA-grade · registered dietitians)' },
      { app_name: 'Recipe/Pinterest',   feature_label: 'COOK     (Recipe Engine — 30 minutes fridge to table · 10,000 recipes)' },
      { app_name: 'Shopping list apps', feature_label: 'SHOP     (1-click shopping — list builds from pantry · only what is missing)' }
    ],
    shop_rule:     'Always "1-click shopping". Never: "Instacart" · "Walmart cart" · any store or third-party app name. Always: "1-click shopping" · "the list builds itself" · "one click to your cart"',
    optimize_rule: 'Without OPTIMIZE the 5-app story is incomplete. Always include it when describing the full loop. OPTIMIZE scores every meal COOK produces — 6 nutrition dimensions · FDA-grade data · registered dietitians.',
    naming_rule:   'NAME APPS IN PROBLEM SECTION ONLY — never in SOLVE, VALUE, or CTA.',
    phone_rule:    '  Posts/emails 1-3: NO mention of the app being open or visible\n  Post/email 4: First reveal — phone appears with easyChef Pro open\n  Posts/emails 5+: Phone visible · app in use · outcomes not features'
  })]);

  _upsertBD(['PRECISION_RULES_001', 'compliance', 'hard', 'TRUE', JSON.stringify({
    figures: [
      { label: 'ANNUAL SAVINGS',  exact: '$1,336/year average savings',             never: '"$1,500" · NEVER "over $1,000"' },
      { label: 'MONTHLY SAVINGS', exact: 'Families save an average of $111 a month' },
      { label: 'FOOD WASTE',      exact: '69.5% less food waste',                   never: '"70%" · NEVER "nearly 70%"' },
      { label: 'DISCOUNT',        exact: '60% off',                                 never: '"50% off"' },
      { label: 'DIETITIANS',      exact: 'registered dietitians',                   never: 'just "dietitians"' }
    ],
    cta_rule: 'NEVER "sign up" — use: "Join the waitlist" · "Get early access" · "Join the founding family" · "Lock in your spot"'
  })]);

  _upsertBD(['ARCHITECTURE_001', 'structure', 'hard', 'TRUE', JSON.stringify({
    rules: [
      'Landing pages belong to an ICP, not a campaign. Multiple campaigns drive to the same LP.',
      'Every email, every social post, every ad drives to the campaign landing page URL.',
      'Each asset carries its own DL_ID in the UTM so attribution is tracked per asset, not per page.',
      'PRODUCT NAME: Always write "easyChef Pro". Never "the app", "this app", or "a meal planning app".',
      'CTA RULE: Every CTA drives to the landing page. Never link to the main website or App Store (pre-launch).',
      'PRODUCT FEATURES — 5 features in one complete loop: TRACK (Pantry & Waste Screen) → PLAN (Meal Planning Screen) → OPTIMIZE (Savings Dashboard) → COOK (Recipe & Cook Mode) → SHOP (Shopping List Screen). Never write "4 features". Never omit SHOP from any complete product description.'
    ]
  })]);

  _upsertBD(['DESIGN_BRIEF_RULES_001', 'design_compliance', 'hard', 'TRUE', JSON.stringify({
    rules: [
      { label: 'CTA BUTTON COLOR',      detail: 'ALWAYS #FF0000 red. Never orange. Never coral. Brand palette: #FF0000 (red) · #F6EFE8 (beige) · #000000 (black) · #FFFFFF (white)' },
      { label: 'PROOF BAR STATS',       detail: 'Use ONLY these three approved claims word-for-word: $1,336/year savings · 69.5% less food waste · 30 min fridge to table. Never invent stats or numbers.' },
      { label: 'TESTIMONIALS',          detail: 'No invented testimonials. No invented names. No real mom photos with quotes. No invented user counts. Leave blank until real beta feedback is available.' },
      { label: 'SCENE DIRECTION',       detail: 'No shame language directed at the user. The system is broken — never her fault. Show broken systems, wasted food, time lost — not personal failure.' },
      { label: 'BANNED CLAIMS',         detail: '$111/month · $112/month · any invented monthly savings → use $1,336/year only. Any invented frequency statistic → banned. Invented scarcity numbers → banned. Urgency: First 5,000 families only OR Founding price ends July 1.' },
      { label: 'BANNED ORIGIN PHRASES', detail: '"Built by parents" → must be "Built by first responders". "Born in Silicon Valley" · "Born in [any city]" · any location reference → banned.' },
      { label: 'BANNED NAMES',          detail: 'Sarah → absolutely never use this name. Any invented first name → banned. Any invented location → banned.' },
      { label: 'BANNED FORMATS',        detail: 'Before/after testimonial format → banned. Invented testimonial quotes with names → banned.' }
    ]
  })]);

  Logger.log('[seedGovernanceRows] written=' + written.length + ' skipped=' + skipped.length);
  return { ok: true, written: written, skipped: skipped };
}

function archiveOldReferenceDocs() {
  var OLD_PATTERN   = 'AI Campaign Assistant Reference';
  var ARCHIVE_NAME  = 'Reference Doc Archive';
  var moved         = [];
  var skipped       = [];

  // Find or create the Archive folder in My Drive root
  var archiveFolder;
  var folderIter = DriveApp.getFoldersByName(ARCHIVE_NAME);
  if (folderIter.hasNext()) {
    archiveFolder = folderIter.next();
    Logger.log('Using existing archive folder: ' + archiveFolder.getId());
  } else {
    archiveFolder = DriveApp.createFolder(ARCHIVE_NAME);
    Logger.log('Created archive folder: ' + archiveFolder.getId());
  }

  // Search for all old reference docs by title pattern
  var query  = 'title contains \'' + OLD_PATTERN + '\' and mimeType = \'application/vnd.google-apps.document\'';
  var files  = DriveApp.searchFiles(query);

  while (files.hasNext()) {
    var file  = files.next();
    var title = file.getName();
    var id    = file.getId();

    // Skip if the file is already in the archive folder
    var parents = file.getParents();
    var alreadyArchived = false;
    while (parents.hasNext()) {
      if (parents.next().getId() === archiveFolder.getId()) {
        alreadyArchived = true;
        break;
      }
    }
    if (alreadyArchived) {
      skipped.push(title + ' (already archived)');
      continue;
    }

    file.moveTo(archiveFolder);
    moved.push(title);
    Logger.log('Archived: ' + title + ' (' + id + ')');
  }

  Logger.log('Done. Moved: ' + moved.length + ', Skipped: ' + skipped.length);
  Logger.log('Archive folder: https://drive.google.com/drive/folders/' + archiveFolder.getId());

  return {
    ok:             true,
    archive_folder: archiveFolder.getId(),
    archive_url:    'https://drive.google.com/drive/folders/' + archiveFolder.getId(),
    moved:          moved,
    skipped:        skipped
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// fixCampaignBriefsCols  —  remove duplicate campaign_angle/urgency_trigger
//                           and stray drive_url columns (structural cleanup)
// ─────────────────────────────────────────────────────────────────────────────

function fixCampaignBriefsCols() {
  try {
    var ss    = _getCampaignSpreadsheet();
    var sheet = ss.getSheetByName('CampaignBriefs');
    if (!sheet) return { ok: false, error: 'CampaignBriefs tab not found' };

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
                       .map(function(h){ return String(h).trim(); });

    // Find columns to delete: second+ occurrence of campaign_angle / urgency_trigger, and drive_url
    var seen = {};
    var toDelete = [];  // 1-based column indices, collect then delete right-to-left
    headers.forEach(function(h, i) {
      var col1 = i + 1;  // convert to 1-based
      if (h === 'campaign_angle' || h === 'urgency_trigger') {
        if (seen[h]) {
          toDelete.push({ col: col1, name: h });
        } else {
          seen[h] = true;
        }
      }
      if (h === 'drive_url') {
        toDelete.push({ col: col1, name: h });
      }
    });

    if (toDelete.length === 0) return { ok: true, message: 'No duplicate/stray columns found', headers: headers };

    // Delete right-to-left so earlier indices stay stable
    toDelete.sort(function(a, b){ return b.col - a.col; });
    var deleted = [];
    toDelete.forEach(function(c) {
      sheet.deleteColumns(c.col, 1);
      deleted.push('col ' + c.col + ' (' + c.name + ')');
    });

    // Verify final headers
    var finalHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
                            .map(function(h){ return String(h).trim(); });

    return {
      ok:            true,
      deleted:       deleted,
      final_headers: finalHeaders,
      final_col_count: finalHeaders.length
    };

  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// backfillSocialBodyCopy  —  copy hook → body_copy for rows where body_copy is blank
// ─────────────────────────────────────────────────────────────────────────────

function backfillSocialBodyCopy() {
  try {
    var ss    = _getCampaignSpreadsheet();
    var sheet = ss.getSheetByName('SocialPosts');
    if (!sheet || sheet.getLastRow() < 2) return { ok: false, error: 'SocialPosts tab empty or missing' };

    var data    = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h){ return String(h).trim(); });
    var hookIdx = headers.indexOf('hook');
    var bodyIdx = headers.indexOf('body_copy');

    if (hookIdx < 0) return { ok: false, error: 'hook column not found' };
    if (bodyIdx < 0) return { ok: false, error: 'body_copy column not found' };

    var written = 0, skipped = 0, hookBlank = 0;
    var rows = data.slice(1);  // exclude header

    rows.forEach(function(row, i) {
      var body = String(row[bodyIdx] || '').trim();
      var hook = String(row[hookIdx] || '').trim();
      if (body !== '') { skipped++; return; }   // already has content
      if (hook === '') { hookBlank++; return; }  // nothing to copy
      // Write hook value into body_copy column (row i+2 is 1-based, +1 for header)
      sheet.getRange(i + 2, bodyIdx + 1).setValue(hook);
      written++;
    });

    return {
      ok:         true,
      total:      rows.length,
      written:    written,
      skipped:    skipped,
      hook_blank: hookBlank
    };

  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// backfillFigmaExportFields  —  icp_target + cta for 218 blank rows
//   icp_target: post_id → SocialPosts.id → campaign_id → CampaignBriefs.icp_code
//   cta:        dl_id   → DeepLinkRegistry.destination_url → LPInventory.cta_primary
// ─────────────────────────────────────────────────────────────────────────────

function backfillFigmaExportFields() {
  try {
    var ss = _getCampaignSpreadsheet();

    function sheetMap(tabName, keyCol) {
      var sh = ss.getSheetByName(tabName);
      if (!sh || sh.getLastRow() < 2) return { hdrs: [], map: {} };
      var all  = sh.getDataRange().getValues();
      var hdrs = all[0].map(function(h){ return String(h).trim(); });
      var ki   = hdrs.indexOf(keyCol);
      if (ki < 0) return { hdrs: hdrs, map: {} };
      var map = {};
      all.slice(1).forEach(function(r){ var k = String(r[ki] || '').trim(); if (k) map[k] = r; });
      return { hdrs: hdrs, map: map };
    }

    // Load lookup tables
    var spData  = sheetMap('SocialPosts', 'id');           // post_id → row
    var cbData  = sheetMap('CampaignBriefs', 'id');        // campaign_id → row
    var dlData  = sheetMap('DeepLinkRegistry', 'dl_id');   // dl_id → row
    var lpData  = sheetMap('LPInventory', 'slug');          // slug → row

    var spHdrs = spData.hdrs, cbHdrs = cbData.hdrs, dlHdrs = dlData.hdrs, lpHdrs = lpData.hdrs;

    function idx(hdrs, name){ return hdrs.indexOf(name); }

    // FigmaExport sheet
    var feSheet = ss.getSheetByName('FigmaExport');
    if (!feSheet || feSheet.getLastRow() < 2) return { ok: false, error: 'FigmaExport tab empty' };
    var feData  = feSheet.getDataRange().getValues();
    var feHdrs  = feData[0].map(function(h){ return String(h).trim(); });

    var fePostIdx = idx(feHdrs, 'post_id');
    var feDlIdx   = idx(feHdrs, 'dl_id');
    var feIcpIdx  = idx(feHdrs, 'icp_target');
    var feCtaIdx  = idx(feHdrs, 'cta');
    var feUtmIdx  = idx(feHdrs, 'utm_url');

    if (feIcpIdx < 0 || feCtaIdx < 0) return { ok: false, error: 'icp_target or cta column missing in FigmaExport' };

    var icpWritten = 0, ctaWritten = 0, icpMiss = 0, ctaMiss = 0;
    var rows = feData.slice(1);

    rows.forEach(function(row, i) {
      var sheetRow = i + 2;  // 1-based, +1 for header
      var postId = String(row[fePostIdx] || '').trim();
      var dlId   = String(feDlIdx >= 0 ? (row[feDlIdx] || '') : '').trim();
      var utmUrl = String(feUtmIdx >= 0 ? (row[feUtmIdx] || '') : '').trim();

      // ── icp_target ─────────────────────────────────────────────────────────
      var currentIcp = String(row[feIcpIdx] || '').trim();
      if (!currentIcp && postId) {
        var spRow    = spData.map[postId];
        var campId   = spRow ? String(spRow[idx(spHdrs, 'campaign_id')] || '').trim() : '';
        var cbRow    = campId ? cbData.map[campId] : null;
        var icpCode  = cbRow ? String(cbRow[idx(cbHdrs, 'icp_code')] || '').trim() : '';
        if (icpCode) {
          feSheet.getRange(sheetRow, feIcpIdx + 1).setValue(icpCode);
          icpWritten++;
        } else {
          icpMiss++;
        }
      }

      // ── cta ────────────────────────────────────────────────────────────────
      var currentCta = String(row[feCtaIdx] || '').trim();
      if (!currentCta) {
        var ctaText = '';
        // Try: dl_id → DeepLinkRegistry.destination_url → slug → LPInventory.cta_primary
        if (dlId) {
          var dlRow = dlData.map[dlId];
          var destUrl = dlRow ? String(dlRow[idx(dlHdrs, 'destination_url')] || '').trim() : '';
          if (destUrl) {
            // Extract path after domain, strip leading slash → matches LPInventory slug (e.g. "lp/waitlist-a")
            var pathSlug = (destUrl.split('?')[0].replace(/^https?:\/\/[^\/]+/, '') || '').replace(/^\//, '');
            var lpRow = pathSlug ? lpData.map[pathSlug] : null;
            if (lpRow) ctaText = String(lpRow[idx(lpHdrs, 'cta_primary')] || '').trim();
          }
        }
        // Fallback: try utm_url path slug
        if (!ctaText && utmUrl) {
          var pathSlug2 = (utmUrl.split('?')[0].replace(/^https?:\/\/[^\/]+/, '') || '').replace(/^\//, '');
          var lpRow2 = pathSlug2 ? lpData.map[pathSlug2] : null;
          if (lpRow2) ctaText = String(lpRow2[idx(lpHdrs, 'cta_primary')] || '').trim();
        }
        if (ctaText) {
          feSheet.getRange(sheetRow, feCtaIdx + 1).setValue(ctaText);
          ctaWritten++;
        } else {
          ctaMiss++;
        }
      }
    });

    return {
      ok:           true,
      total:        rows.length,
      icp_written:  icpWritten,
      icp_miss:     icpMiss,
      cta_written:  ctaWritten,
      cta_miss:     ctaMiss
    };

  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// diagFigmaCta  —  read-only: sample dl_id + utm_url from FigmaExport + LPInventory slugs
// ─────────────────────────────────────────────────────────────────────────────

function diagFigmaCta() {
  try {
    var ss = _getCampaignSpreadsheet();

    function sample(tabName, colNames, limit) {
      var sh = ss.getSheetByName(tabName);
      if (!sh || sh.getLastRow() < 2) return { headers: [], rows: [] };
      var all  = sh.getDataRange().getValues();
      var hdrs = all[0].map(function(h){ return String(h).trim(); });
      var rows = all.slice(1, limit + 1);
      var out  = rows.map(function(r){
        var obj = {};
        colNames.forEach(function(c){
          var i = hdrs.indexOf(c);
          obj[c] = i >= 0 ? String(r[i] || '').trim() : 'col_missing';
        });
        return obj;
      });
      return { headers: hdrs, rows: out };
    }

    var feSample = sample('FigmaExport', ['post_id','dl_id','utm_url'], 5);
    var dlSample = sample('DeepLinkRegistry', ['dl_id','destination_url','icp_code'], 5);
    var lpSlugs  = (function(){
      var sh = ss.getSheetByName('LPInventory');
      if (!sh || sh.getLastRow() < 2) return [];
      var all  = sh.getDataRange().getValues();
      var hdrs = all[0].map(function(h){ return String(h).trim(); });
      var si   = hdrs.indexOf('slug');
      var ci   = hdrs.indexOf('cta_primary');
      return all.slice(1, 10).map(function(r){
        return { slug: si >= 0 ? String(r[si]||'') : '', cta_primary: ci >= 0 ? String(r[ci]||'') : '' };
      });
    })();

    return { ok: true, figma_sample: feSample.rows, dl_sample: dlSample.rows, lp_slugs: lpSlugs };

  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// backfillDeepLinkFields  —  icp_code + emotional_arc_id for DeepLinkRegistry
//   icp_code:        campaign_id → CampaignBriefs.icp_code
//                    fallback: utm_campaign (uppercase) → CampaignBriefs.id → icp_code
//   emotional_arc_id: icp_code → CampaignStrategy value_json.emotional_arc_id
// ─────────────────────────────────────────────────────────────────────────────

function backfillDeepLinkFields() {
  try {
    var ss = _getCampaignSpreadsheet();

    function sheetAsMap(tabName, keyCol) {
      var sh = ss.getSheetByName(tabName);
      if (!sh || sh.getLastRow() < 2) return { hdrs: [], map: {} };
      var all  = sh.getDataRange().getValues();
      var hdrs = all[0].map(function(h){ return String(h).trim(); });
      var ki   = hdrs.indexOf(keyCol);
      if (ki < 0) return { hdrs: hdrs, map: {} };
      var map = {};
      all.slice(1).forEach(function(r){ var k = String(r[ki] || '').trim(); if (k) map[k] = r; });
      return { hdrs: hdrs, map: map };
    }

    var cbData  = sheetAsMap('CampaignBriefs', 'id');       // campaign_id → row
    var csData  = sheetAsMap('CampaignStrategy', 'strategy_id'); // strategy_id → row

    var cbHdrs = cbData.hdrs, csHdrs = csData.hdrs;
    function hi(hdrs, name){ return hdrs.indexOf(name); }

    // Build icp_code → emotional_arc_id map from CampaignStrategy
    var icpToArcId = {};
    Object.keys(csData.map).forEach(function(sid) {
      var csRow = csData.map[sid];
      try {
        var valJson = String(csRow[hi(csHdrs, 'value_json')] || '');
        var val = JSON.parse(valJson);
        if (val && val.icp_code && val.emotional_arc_id) {
          icpToArcId[val.icp_code] = val.emotional_arc_id;
        }
      } catch(e2) {}
    });

    // FigmaExport utm_url also seeds icp→arc lookup via campaign
    // Primary source: any strategy_type === 'EMOTIONAL_ARC' or similar
    // Also try: CampaignBriefs icp_code + strategy_type prefix
    // Fallback: construct arc ID as icp_code + '-ARC-001' if no match found

    // DeepLinkRegistry sheet
    var dlSheet = ss.getSheetByName('DeepLinkRegistry');
    if (!dlSheet || dlSheet.getLastRow() < 2) return { ok: false, error: 'DeepLinkRegistry tab empty' };
    var dlData2  = dlSheet.getDataRange().getValues();
    var dlHdrs   = dlData2[0].map(function(h){ return String(h).trim(); });

    var dlCampIdx  = hi(dlHdrs, 'campaign_id');
    var dlUtmIdx   = hi(dlHdrs, 'utm_campaign');
    var dlIcpIdx   = hi(dlHdrs, 'icp_code');
    var dlArcIdx   = hi(dlHdrs, 'emotional_arc_id');

    if (dlIcpIdx < 0 || dlArcIdx < 0) return { ok: false, error: 'icp_code or emotional_arc_id column missing in DeepLinkRegistry' };

    var icpWritten = 0, arcWritten = 0, icpMiss = 0, arcMiss = 0;
    var rows = dlData2.slice(1);

    rows.forEach(function(row, i) {
      var sheetRow = i + 2;
      var currentIcp = String(row[dlIcpIdx] || '').trim();
      var currentArc = String(row[dlArcIdx] || '').trim();

      // ── icp_code ───────────────────────────────────────────────────────────
      var icpCode = currentIcp;
      if (!icpCode) {
        // Try campaign_id column first
        var campId  = dlCampIdx >= 0 ? String(row[dlCampIdx] || '').trim() : '';
        var cbRow   = campId ? cbData.map[campId] : null;
        // Try uppercase of utm_campaign as fallback
        if (!cbRow && dlUtmIdx >= 0) {
          var utmCamp = String(row[dlUtmIdx] || '').trim().toUpperCase().replace(/-/g, '-');
          cbRow = cbData.map[utmCamp] || cbData.map[utmCamp.toLowerCase().replace(/-/g,'-')] || null;
          // also try the raw utm_campaign value
          if (!cbRow) {
            var raw = String(row[dlUtmIdx] || '').trim();
            cbRow = cbData.map[raw] || null;
          }
        }
        icpCode = cbRow ? String(cbRow[hi(cbHdrs, 'icp_code')] || '').trim() : '';
        if (icpCode) {
          dlSheet.getRange(sheetRow, dlIcpIdx + 1).setValue(icpCode);
          icpWritten++;
        } else {
          icpMiss++;
        }
      }

      // ── emotional_arc_id ───────────────────────────────────────────────────
      if (!currentArc && icpCode) {
        var arcId = icpToArcId[icpCode] || '';
        if (!arcId) {
          // Fallback: search CampaignStrategy for strategy_type containing 'EMOTIONAL_ARC' and matching icp_code
          Object.keys(csData.map).forEach(function(sid) {
            if (arcId) return;
            var csRow = csData.map[sid];
            var sType = String(csRow[hi(csHdrs, 'strategy_type')] || '');
            if (sType.indexOf('EMOTIONAL') >= 0 || sType.indexOf('ARC') >= 0) {
              try {
                var v = JSON.parse(String(csRow[hi(csHdrs, 'value_json')] || '{}'));
                if (v && (v.icp_code === icpCode || !v.icp_code)) {
                  arcId = sid;
                }
              } catch(e3) {}
            }
          });
        }
        if (arcId) {
          dlSheet.getRange(sheetRow, dlArcIdx + 1).setValue(arcId);
          arcWritten++;
        } else {
          arcMiss++;
        }
      }
    });

    return {
      ok:          true,
      total:       rows.length,
      icp_written: icpWritten,
      icp_miss:    icpMiss,
      arc_written: arcWritten,
      arc_miss:    arcMiss,
      icp_to_arc_map: icpToArcId
    };

  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// diagContentCalBriefUrl  —  read-only: check available URL sources per asset_id
// ─────────────────────────────────────────────────────────────────────────────

function diagContentCalBriefUrl() {
  try {
    var ss = _getCampaignSpreadsheet();

    function sheetSample(tabName, colNames, limit) {
      var sh = ss.getSheetByName(tabName);
      if (!sh || sh.getLastRow() < 2) return { headers: [], rows: [], total: 0 };
      var all  = sh.getDataRange().getValues();
      var hdrs = all[0].map(function(h){ return String(h).trim(); });
      var total = all.length - 1;
      var rows = all.slice(1, limit + 1).map(function(r){
        var obj = {};
        colNames.forEach(function(c){
          var i = hdrs.indexOf(c);
          obj[c] = i >= 0 ? String(r[i] || '').trim() : 'col_missing';
        });
        return obj;
      });
      return { headers: hdrs, rows: rows, total: total };
    }

    var cc  = sheetSample('ContentCalendar', ['calendar_id','asset_id','brief_doc_url'], 5);
    var alc = sheetSample('AssetLifecycle',  ['asset_id','export_url','figma_file_id','figma_page','figma_frame'], 5);

    // Count how many AssetLifecycle rows have export_url populated
    var alcSheet = ss.getSheetByName('AssetLifecycle');
    var alcCount = { total: 0, export_url_pop: 0 };
    if (alcSheet && alcSheet.getLastRow() >= 2) {
      var alcAll  = alcSheet.getDataRange().getValues();
      var alcHdrs = alcAll[0].map(function(h){ return String(h).trim(); });
      var euIdx   = alcHdrs.indexOf('export_url');
      alcAll.slice(1).forEach(function(r){
        alcCount.total++;
        if (euIdx >= 0 && String(r[euIdx] || '').trim()) alcCount.export_url_pop++;
      });
    }

    return { ok: true, content_calendar: cc, asset_lifecycle: alc, alc_counts: alcCount };

  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// clearCampaignDataTabs  —  delete all data rows (keep headers) from campaign tabs
//   Reference tabs preserved: ICPProfiles, ApprovedClaims, Channels, CampaignTypes,
//   LPInventory, ThemeLibrary, FunnelStages, BlueprintConfig, BrandDoctrine,
//   CampaignStrategy, CcSettings, AIReference
// ─────────────────────────────────────────────────────────────────────────────

function clearCampaignDataTabs() {
  var TABS_TO_CLEAR = [
    'CampaignBriefs',
    'SocialPosts',
    'EmailSequences',
    'GeneratedCopy',
    'LandingPages',
    'DeepLinkRegistry',
    'ContentCalendar',
    'AssetLifecycle',
    'VideoProduction',
    'VideoIdeaBank',
    'ScheduledPosts',
    'PushNotifications',
    'FigmaExport',
    'CampaignMetrics'
  ];

  try {
    var ss = _getCampaignSpreadsheet();
    var results = [];

    TABS_TO_CLEAR.forEach(function(tabName) {
      var sh = ss.getSheetByName(tabName);
      if (!sh) { results.push({ tab: tabName, status: 'not_found' }); return; }
      var lastRow = sh.getLastRow();
      if (lastRow <= 1) { results.push({ tab: tabName, status: 'already_empty', rows_deleted: 0 }); return; }
      var rowCount = lastRow - 1;  // rows below header
      sh.deleteRows(2, rowCount);
      results.push({ tab: tabName, status: 'cleared', rows_deleted: rowCount });
    });

    return { ok: true, results: results };

  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// backfillContentCalCaption  —  caption + hashtags per asset_id from SocialPosts
//   caption:  asset_id → SocialPosts.id → body_copy
//   hashtags: asset_id → SocialPosts.id → hashtags  (only if ContentCalendar.hashtags is blank)
// ─────────────────────────────────────────────────────────────────────────────

function backfillContentCalCaption() {
  try {
    var ss = _getCampaignSpreadsheet();

    // Build asset_id → {body_copy, hashtags} map from SocialPosts
    var spSheet = ss.getSheetByName('SocialPosts');
    if (!spSheet || spSheet.getLastRow() < 2) return { ok: false, error: 'SocialPosts tab empty' };
    var spAll  = spSheet.getDataRange().getValues();
    var spHdrs = spAll[0].map(function(h){ return String(h).trim(); });
    var spIdIdx   = spHdrs.indexOf('id');
    var spBodyIdx = spHdrs.indexOf('body_copy');
    var spTagIdx  = spHdrs.indexOf('hashtags');
    var spMap = {};
    spAll.slice(1).forEach(function(r){
      var k = spIdIdx >= 0 ? String(r[spIdIdx] || '').trim() : '';
      if (!k) return;
      spMap[k] = {
        body_copy: spBodyIdx >= 0 ? String(r[spBodyIdx] || '').trim() : '',
        hashtags:  spTagIdx  >= 0 ? String(r[spTagIdx]  || '').trim() : ''
      };
    });

    // ContentCalendar
    var ccSheet = ss.getSheetByName('ContentCalendar');
    if (!ccSheet || ccSheet.getLastRow() < 2) return { ok: false, error: 'ContentCalendar tab empty' };
    var ccAll   = ccSheet.getDataRange().getValues();
    var ccHdrs  = ccAll[0].map(function(h){ return String(h).trim(); });
    var assetIdx   = ccHdrs.indexOf('asset_id');
    var captionIdx = ccHdrs.indexOf('caption');
    var hashIdx    = ccHdrs.indexOf('hashtags');

    if (captionIdx < 0) return { ok: false, error: 'caption column missing in ContentCalendar' };
    if (assetIdx < 0)   return { ok: false, error: 'asset_id column missing in ContentCalendar' };

    var capWritten = 0, hashWritten = 0, skipped = 0, miss = 0;
    ccAll.slice(1).forEach(function(row, i) {
      var sheetRow = i + 2;
      var assetId  = String(row[assetIdx] || '').trim();
      var sp       = assetId ? (spMap[assetId] || null) : null;
      if (!sp || !sp.body_copy) { miss++; return; }

      var curCaption = String(row[captionIdx] || '').trim();
      if (!curCaption) {
        ccSheet.getRange(sheetRow, captionIdx + 1).setValue(sp.body_copy);
        capWritten++;
      } else {
        skipped++;
      }

      if (hashIdx >= 0 && sp.hashtags) {
        var curHash = String(row[hashIdx] || '').trim();
        if (!curHash) {
          ccSheet.getRange(sheetRow, hashIdx + 1).setValue(sp.hashtags);
          hashWritten++;
        }
      }
    });

    return {
      ok:            true,
      total:         ccAll.length - 1,
      caption_written: capWritten,
      hashtags_written: hashWritten,
      skipped:       skipped,
      miss:          miss
    };

  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// backfillContentCalBriefUrl  —  link brief_doc_url per asset_id from AssetLifecycle.export_url
// ─────────────────────────────────────────────────────────────────────────────

function backfillContentCalBriefUrl() {
  try {
    var ss = _getCampaignSpreadsheet();

    // Build asset_id → export_url map from AssetLifecycle
    var alcSheet = ss.getSheetByName('AssetLifecycle');
    var alcMap   = {};
    if (alcSheet && alcSheet.getLastRow() >= 2) {
      var alcAll  = alcSheet.getDataRange().getValues();
      var alcHdrs = alcAll[0].map(function(h){ return String(h).trim(); });
      var aiIdx   = alcHdrs.indexOf('asset_id');
      var euIdx   = alcHdrs.indexOf('export_url');
      if (aiIdx >= 0 && euIdx >= 0) {
        alcAll.slice(1).forEach(function(r){
          var aid = String(r[aiIdx] || '').trim();
          var url = String(r[euIdx] || '').trim();
          if (aid && url) alcMap[aid] = url;
        });
      }
    }

    // ContentCalendar
    var ccSheet = ss.getSheetByName('ContentCalendar');
    if (!ccSheet || ccSheet.getLastRow() < 2) return { ok: false, error: 'ContentCalendar tab empty' };
    var ccAll   = ccSheet.getDataRange().getValues();
    var ccHdrs  = ccAll[0].map(function(h){ return String(h).trim(); });
    var assetIdx = ccHdrs.indexOf('asset_id');
    var briefIdx = ccHdrs.indexOf('brief_doc_url');

    if (assetIdx < 0 || briefIdx < 0) return { ok: false, error: 'asset_id or brief_doc_url column missing in ContentCalendar' };

    var written = 0, skipped = 0, miss = 0;
    ccAll.slice(1).forEach(function(row, i) {
      var sheetRow = i + 2;
      var current  = String(row[briefIdx] || '').trim();
      if (current) { skipped++; return; }
      var assetId  = String(row[assetIdx] || '').trim();
      var url      = assetId ? (alcMap[assetId] || '') : '';
      if (url) {
        ccSheet.getRange(sheetRow, briefIdx + 1).setValue(url);
        written++;
      } else {
        miss++;
      }
    });

    return {
      ok:      true,
      total:   ccAll.length - 1,
      written: written,
      skipped: skipped,
      miss:    miss,
      alc_map_size: Object.keys(alcMap).length
    };

  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// auditSheetData  —  read-only census of 5 tabs, no writes
// ─────────────────────────────────────────────────────────────────────────────

function auditSheetData() {
  try {
    var ss = _getCampaignSpreadsheet();

    function readTab(tabName) {
      var sh = ss.getSheetByName(tabName);
      if (!sh || sh.getLastRow() < 2) return { headers: [], rows: [] };
      var all = sh.getDataRange().getValues();
      var headers = all[0].map(function(h){ return String(h).trim(); });
      var rows = all.slice(1);
      return { headers: headers, rows: rows };
    }

    function col(headers, name) {
      return headers.indexOf(name);
    }

    function populated(val) {
      return val !== null && val !== undefined && String(val).trim() !== '';
    }

    var result = {};

    // ── 1. SocialPosts ────────────────────────────────────────────────────────
    var sp = readTab('SocialPosts');
    var spBodyIdx = col(sp.headers, 'body_copy');
    var spPopulated = [], spNull = 0;
    sp.rows.forEach(function(r) {
      var v = spBodyIdx >= 0 ? r[spBodyIdx] : '';
      if (populated(v)) { spPopulated.push(String(v)); }
      else              { spNull++; }
    });
    result.SocialPosts = {
      total:             sp.rows.length,
      body_copy_populated: spPopulated.length,
      body_copy_null:    spNull,
      first_3_values:    spPopulated.slice(0, 3).map(function(v){ return v.substring(0, 120); })
    };

    // ── 2. CampaignBriefs ─────────────────────────────────────────────────────
    var cb = readTab('CampaignBriefs');
    var caIdx   = col(cb.headers, 'campaign_angle');
    var utIdx   = col(cb.headers, 'urgency_trigger');
    var ca1Idx  = col(cb.headers, 'campaign_angle.1');
    var ut1Idx  = col(cb.headers, 'urgency_trigger.1');
    var cbSample = [];
    cb.rows.slice(0, 5).forEach(function(r) {
      cbSample.push({
        campaign_angle:   caIdx  >= 0 ? String(r[caIdx]  || '') : 'col_missing',
        urgency_trigger:  utIdx  >= 0 ? String(r[utIdx]  || '') : 'col_missing',
        'campaign_angle.1': ca1Idx >= 0 ? String(r[ca1Idx] || '') : 'col_missing',
        'urgency_trigger.1': ut1Idx >= 0 ? String(r[ut1Idx] || '') : 'col_missing'
      });
    });
    result.CampaignBriefs = {
      total:               cb.rows.length,
      headers_actual:      cb.headers,
      campaign_angle_col:     caIdx,
      urgency_trigger_col:    utIdx,
      'campaign_angle.1_col': ca1Idx,
      'urgency_trigger.1_col': ut1Idx,
      first_5_rows_sample: cbSample
    };

    // ── 3. FigmaExport ────────────────────────────────────────────────────────
    var fe = readTab('FigmaExport');
    var feIcpIdx = col(fe.headers, 'icp_target');
    var feCtaIdx = col(fe.headers, 'cta');
    var feIcpPop = 0, feIcpNull = 0, feCtaPop = 0, feCtaNull = 0;
    fe.rows.forEach(function(r) {
      var icp = feIcpIdx >= 0 ? r[feIcpIdx] : '';
      var cta = feCtaIdx >= 0 ? r[feCtaIdx] : '';
      if (populated(icp)) feIcpPop++; else feIcpNull++;
      if (populated(cta)) feCtaPop++; else feCtaNull++;
    });
    result.FigmaExport = {
      total:           fe.rows.length,
      headers_actual:  fe.headers,
      icp_target_populated: feIcpPop,
      icp_target_null: feIcpNull,
      cta_populated:   feCtaPop,
      cta_null:        feCtaNull
    };

    // ── 4. DeepLinkRegistry ───────────────────────────────────────────────────
    var dl = readTab('DeepLinkRegistry');
    var dlIcpIdx = col(dl.headers, 'icp_code');
    var dlArcIdx = col(dl.headers, 'emotional_arc_id');
    var dlIcpPop = 0, dlArcPop = 0;
    dl.rows.forEach(function(r) {
      if (dlIcpIdx >= 0 && populated(r[dlIcpIdx])) dlIcpPop++;
      if (dlArcIdx >= 0 && populated(r[dlArcIdx])) dlArcPop++;
    });
    result.DeepLinkRegistry = {
      total:                    dl.rows.length,
      icp_code_populated:       dlIcpPop,
      icp_code_null:            dl.rows.length - dlIcpPop,
      emotional_arc_id_populated: dlArcPop,
      emotional_arc_id_null:    dl.rows.length - dlArcPop
    };

    // ── 5. ContentCalendar ────────────────────────────────────────────────────
    var cc = readTab('ContentCalendar');
    var ccBriefIdx = col(cc.headers, 'brief_doc_url');
    var ccBriefPop = 0;
    cc.rows.forEach(function(r) {
      if (ccBriefIdx >= 0 && populated(r[ccBriefIdx])) ccBriefPop++;
    });
    result.ContentCalendar = {
      total:               cc.rows.length,
      brief_doc_url_populated: ccBriefPop,
      brief_doc_url_null:  cc.rows.length - ccBriefPop
    };

    return { ok: true, audit: result };

  } catch(e) {
    return { ok: false, error: e.message };
  }
}
