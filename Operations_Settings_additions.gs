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
