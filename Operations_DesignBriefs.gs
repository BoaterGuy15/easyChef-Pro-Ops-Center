// ─────────────────────────────────────────────────────────────────────────────
// Operations_DesignBriefs.gs
// Design brief generation — reads all token values from DesignTokens tab.
// DesignTokens tab is the source of truth. No hardcoded platform specs,
// dimensions, or brand values as module-level variables.
//
// Tab structure: section | token | value | extra1 | extra2 | extra3 | extra4
// Sections: platform · mood · subject · background · text_rule · color · typography
// ─────────────────────────────────────────────────────────────────────────────

var _DT_TAB_NAME = 'DesignTokens';

// ── getDesignTokens ──────────────────────────────────────────────────────────
/**
 * Reads the DesignTokens tab and returns a lookup object for a given section.
 *
 * section='platform'  → { PlatformName: { canvas, safe, ratio, format, max_mb } }
 * section='mood'      → { emotional_state: 'visual mood description' }
 * section='subject'   → { loop_stage: 'subject description' }
 * section='background'→ { loop_stage: 'background description' }
 * section='text_rule' → { platform: 'overlay rule' }
 * section='color'     → { token: 'hex value' }
 * section='typography'→ { token: 'value' }
 * section omitted     → raw array of row objects
 */
function getDesignTokens(section) {
  var ss  = _getCampaignSpreadsheet();
  var sh  = ss.getSheetByName(_DT_TAB_NAME);
  if (!sh) return {};

  var lastRow = sh.getLastRow();
  if (lastRow < 2) return {};

  var data = sh.getRange(2, 1, lastRow - 1, 7).getValues();
  // columns: 0=section 1=token 2=value 3=extra1 4=extra2 5=extra3 6=extra4

  if (!section) {
    return data.map(function(r) {
      return { section: r[0], token: r[1], value: r[2],
               extra1: r[3], extra2: r[4], extra3: r[5], extra4: r[6] };
    });
  }

  var result = {};
  data.forEach(function(r) {
    if (String(r[0]).toLowerCase() !== section.toLowerCase()) return;
    var tok = String(r[1]);
    if (!tok) return;
    if (section === 'platform') {
      result[tok] = { canvas: String(r[2]), safe: String(r[3]),
                      ratio:  String(r[4]), format: String(r[5]), max_mb: r[6] };
    } else {
      result[tok] = String(r[2]);
    }
  });
  return result;
}

// ── patchSocialImageBriefs ───────────────────────────────────────────────────
/**
 * Generates a 5-element image_brief for every social post and writes it back
 * to the SocialPosts tab image_brief column.
 * All token values are read from the DesignTokens tab — no in-file constants.
 * Returns { ok, patched, skipped }
 */
function patchSocialImageBriefs(campaignId) {
  try {
    campaignId = campaignId || 'EC-2026-001';

    var platforms   = getDesignTokens('platform');
    var moods       = getDesignTokens('mood');
    var subjects    = getDesignTokens('subject');
    var backgrounds = getDesignTokens('background');
    var textRules   = getDesignTokens('text_rule');

    if (!Object.keys(platforms).length) {
      return { ok: false, error: 'DesignTokens tab missing or empty — run write_design_tokens_tab first' };
    }

    var sheet   = _getCCSheet(_CC_TAB.SOCIAL);
    var headers = _CC_HDR.SocialPosts;
    var ibCol   = headers.indexOf('image_brief') + 1;
    if (ibCol < 1) return { ok: false, error: 'image_brief column not found' };

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return { ok: false, error: 'no rows in SocialPosts' };

    var rows    = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    var patched = 0;
    var skipped = 0;

    var defaultPlatform = Object.keys(platforms)[0] || 'Facebook';
    var defaultMood     = Object.keys(moods)[0]     || 'exhausted';
    var defaultStage    = Object.keys(subjects)[0]  || 'hook';

    rows.forEach(function(r, idx) {
      if (!r[0]) return;
      var cid = String(r[headers.indexOf('campaign_id')] || '');
      if (campaignId && cid && cid !== campaignId) { skipped++; return; }

      var platform  = String(r[headers.indexOf('platform')]        || defaultPlatform);
      var loopStage = String(r[headers.indexOf('loop_stage')]      || defaultStage).toLowerCase();
      var emState   = String(r[headers.indexOf('emotional_state')] || defaultMood).toLowerCase();

      var spec     = platforms[platform]    || platforms[defaultPlatform] || { canvas: '1080×1080', safe: '80px', ratio: '1:1' };
      var mood     = moods[emState]         || moods[defaultMood]         || '';
      var subject  = subjects[loopStage]    || subjects[defaultStage]     || '';
      var bg       = backgrounds[loopStage] || backgrounds[defaultStage]  || '';
      var textRule = textRules[platform]    || textRules[defaultPlatform] || '';

      var brief =
        '1. MOOD: '       + mood                                                    + '\n' +
        '2. CANVAS: '     + spec.canvas + ' (' + spec.ratio + ') safe zone ' + spec.safe + '\n' +
        '3. SUBJECT: '    + subject                                                 + '\n' +
        '4. BACKGROUND: ' + bg                                                      + '\n' +
        '5. TEXT: '       + textRule;

      sheet.getRange(idx + 2, ibCol).setValue(brief);
      patched++;
    });

    Logger.log('[patchSocialImageBriefs] patched=' + patched + ' skipped=' + skipped);
    return { ok: true, patched: patched, skipped: skipped };
  } catch(e) {
    Logger.log('[patchSocialImageBriefs] error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── writeDesignTokensTab ─────────────────────────────────────────────────────
/**
 * Writes (or overwrites) the DesignTokens tab with initial seed values.
 * Tab columns: section | token | value | extra1 | extra2 | extra3 | extra4
 *
 * This is the one-time setup function. After seeding, edit the Sheet rows
 * directly to update any token value — do not re-run this unless resetting.
 * All runtime code reads via getDesignTokens(), never from in-file constants.
 */
function writeDesignTokensTab() {
  try {
    var ss = _getCampaignSpreadsheet();
    var sh = ss.getSheetByName(_DT_TAB_NAME);
    if (sh) {
      sh.clearContents();
      sh.clearFormats();
    } else {
      sh = ss.insertSheet(_DT_TAB_NAME);
    }

    var rows = [];

    rows.push(['section', 'token', 'value', 'extra1', 'extra2', 'extra3', 'extra4']);

    // Platform specs — value=canvas extra1=safe extra2=ratio extra3=format extra4=max_mb
    rows.push(['platform', 'Facebook',  '1080×1080', '80px',  '1:1',    'JPG/PNG', 4]);
    rows.push(['platform', 'Instagram', '1080×1080', '80px',  '1:1',    'JPG/PNG', 4]);
    rows.push(['platform', 'TikTok',    '1080×1920', '100px', '9:16',   'MP4/JPG', 4]);
    rows.push(['platform', 'YouTube',   '1280×720',  '80px',  '16:9',   'JPG/PNG', 2]);
    rows.push(['platform', 'Pinterest', '1000×1500', '60px',  '2:3',    'JPG/PNG', 20]);
    rows.push(['platform', 'Nextdoor',  '1200×628',  '80px',  '1.91:1', 'JPG/PNG', 4]);
    rows.push(['platform', 'X',         '1200×675',  '80px',  '16:9',   'JPG/PNG', 5]);

    // Emotional state → visual mood
    rows.push(['mood', 'exhausted',  'raw documentary, natural window light, unsaturated palette',        '', '', '', '']);
    rows.push(['mood', 'frustrated', 'real-life chaos, harsh overhead, high contrast, gritty',            '', '', '', '']);
    rows.push(['mood', 'activated',  'tension + motion blur, warm accent light, mid-contrast',            '', '', '', '']);
    rows.push(['mood', 'curious',    'clean discovery, soft diffused, warm white balance',                '', '', '', '']);
    rows.push(['mood', 'relieved',   'calm confidence, golden-hour soft, low noise',                      '', '', '', '']);
    rows.push(['mood', 'trusting',   'social proof warmth, community composition, warm tones',            '', '', '', '']);
    rows.push(['mood', 'happy',      'celebration pop, bright natural, Brand Red accent',                 '', '', '', '']);
    rows.push(['mood', 'peaceful',   'quiet minimalism, soft morning light, pastel warmth',               '', '', '', '']);

    // Loop stage → primary subject
    rows.push(['subject', 'hook',    'real mom staring at open fridge, tired expression',           '', '', '', '']);
    rows.push(['subject', 'problem', 'pile of groceries on counter, overwhelmed posture',           '', '', '', '']);
    rows.push(['subject', 'agitate', 'family at dinner table with takeout bags, stressed',          '', '', '', '']);
    rows.push(['subject', 'solve',   'easyChef Pro interface on phone, ingredients visible',        '', '', '', '']);
    rows.push(['subject', 'value',   'organized pantry or meal prep flat-lay, clean kitchen',       '', '', '', '']);
    rows.push(['subject', 'proof',   'before/after side-by-side or happy family at table',          '', '', '', '']);
    rows.push(['subject', 'cta',     'woman holding phone with app open, confident smile',          '', '', '', '']);

    // Loop stage → background scene
    rows.push(['background', 'hook',    'cluttered kitchen counter, natural light',                 '', '', '', '']);
    rows.push(['background', 'problem', 'full grocery bags on floor, boxes stacked',                '', '', '', '']);
    rows.push(['background', 'agitate', 'restaurant delivery bags, clock visible',                  '', '', '', '']);
    rows.push(['background', 'solve',   'clean kitchen background, organized shelves',              '', '', '', '']);
    rows.push(['background', 'value',   'tidy pantry or meal-prepped containers in fridge',         '', '', '', '']);
    rows.push(['background', 'proof',   'warm home kitchen, family photos visible',                 '', '', '', '']);
    rows.push(['background', 'cta',     'bright minimal kitchen, single plant or accent',           '', '', '', '']);

    // Platform text overlay rules
    rows.push(['text_rule', 'Facebook',  'readable headline overlay, Brand Red badge, 60% text-free',   '', '', '', '']);
    rows.push(['text_rule', 'Instagram', 'minimal text, clean font, text in safe zone only',             '', '', '', '']);
    rows.push(['text_rule', 'TikTok',    'large bold hook text top-third, sticker-style CTA bottom',     '', '', '', '']);
    rows.push(['text_rule', 'YouTube',   'thumbnail headline <=5 words, face + text combo preferred',    '', '', '', '']);
    rows.push(['text_rule', 'Pinterest', 'title text top, brand URL bottom, serif accent',               '', '', '', '']);
    rows.push(['text_rule', 'Nextdoor',  'neighborhood trust badge, local detail text visible',          '', '', '', '']);
    rows.push(['text_rule', 'X',         'data point callout or stat overlay, minimal clutter',          '', '', '', '']);

    // Brand colors — extra1=usage extra2=wcag_aa_safe
    rows.push(['color', 'color.brand.red',   '#FF0000', 'CTAs, badges, borders, active state', 'Yes on white',      '', '']);
    rows.push(['color', 'color.brand.white', '#FFFFFF', 'Background, primary surface',          'Yes on dark/red',   '', '']);
    rows.push(['color', 'color.brand.beige', '#F6EFE8', 'Secondary surface, section bg',        'Yes on dark text',  '', '']);
    rows.push(['color', 'color.brand.dark',  '#000000', 'Primary text, headlines',              'Yes on white/beige','', '']);
    rows.push(['color', 'color.brand.grey',  '#666666', 'Secondary text, metadata',             'Yes on white bg',   '', '']);
    rows.push(['color', 'color.brand.body',  '#333333', 'Body text, paragraphs',                'Yes on white bg',   '', '']);

    // Typography — extra1=usage
    rows.push(['typography', 'font.family.heading', 'Arial Bold', 'Headlines H1-H2',        '', '', '']);
    rows.push(['typography', 'font.family.body',    'Arial',      'Body, captions, labels', '', '', '']);
    rows.push(['typography', 'font.size.h1',        '24px',       'Page/doc headline',      '', '', '']);
    rows.push(['typography', 'font.size.h2',        '18px',       'Section heading',        '', '', '']);
    rows.push(['typography', 'font.size.body',      '14px',       'Standard body text',     '', '', '']);
    rows.push(['typography', 'font.size.caption',   '11px',       'Labels, metadata, legal','', '', '']);
    rows.push(['typography', 'font.weight.bold',    '700',        'Headlines, emphasis',    '', '', '']);
    rows.push(['typography', 'font.weight.normal',  '400',        'Body, captions',         '', '', '']);

    // Force extra2 column (col 5 = ratio) to plain text so Sheets doesn't parse "9:16" as a time
    sh.getRange(1, 5, rows.length, 1).setNumberFormat('@STRING@');

    sh.getRange(1, 1, rows.length, 7).setValues(rows);

    // Header row
    sh.getRange(1, 1, 1, 7)
      .setBackground('#212121').setFontColor('#ffffff')
      .setFontWeight('bold').setFontFamily('Arial').setFontSize(10);

    // Section color banding on column A
    var sectionBg = {
      platform:   '#1b5e20',
      mood:       '#4a148c',
      subject:    '#1a237e',
      background: '#e65100',
      text_rule:  '#880e4f',
      color:      '#212121',
      typography: '#37474f'
    };
    for (var ri = 2; ri <= rows.length; ri++) {
      var sec = String(sh.getRange(ri, 1).getValue()).toLowerCase();
      var bg  = sectionBg[sec] || '#444444';
      sh.getRange(ri, 1).setBackground(bg).setFontColor('#ffffff').setFontWeight('bold').setFontFamily('Arial').setFontSize(9);
      sh.getRange(ri, 2, 1, 6).setFontFamily('Arial').setFontSize(9);
    }

    try { sh.autoResizeColumns(1, 7); } catch(ae) {}

    Logger.log('[writeDesignTokensTab] wrote ' + rows.length + ' rows');
    return { ok: true, rows_written: rows.length, sheet_id: ss.getId() };
  } catch(e) {
    Logger.log('[writeDesignTokensTab] error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── writeFigmaStoryboardDoc ──────────────────────────────────────────────────
/**
 * Creates a Figma storyboard reference Google Doc for TikTok + YouTube.
 * Reads platform specs from DesignTokens tab via getDesignTokens().
 */
function writeFigmaStoryboardDoc(campaignId, folderIdOverride) {
  try {
    campaignId = campaignId || 'EC-2026-001';
    var rootId = folderIdOverride || '';
    if (!rootId) {
      try { var _fs = _getCcSetting('CAMPAIGN_FOLDER_ID'); rootId = (_fs && _fs.length) ? _fs[0].label : ''; } catch(ce) {}
    }
    var rootFolder   = rootId ? DriveApp.getFolderById(rootId) : DriveApp.getFolderById(_CAMPAIGNS_ROOT_ID);
    var designFolder = getOrCreateFolder(rootFolder, '05_DesignBriefs');

    var platforms = getDesignTokens('platform');
    var tkSpec    = platforms['TikTok']  || { canvas: '1080×1920', ratio: '9:16',  safe: '100px' };
    var ytSpec    = platforms['YouTube'] || { canvas: '1280×720',  ratio: '16:9',  safe: '80px'  };

    var posts   = getSocialPosts(campaignId);
    var tkPosts = posts.filter(function(p) { return p.platform === 'TikTok'; }).slice(0, 8);
    var ytPosts = posts.filter(function(p) { return p.platform === 'YouTube'; }).slice(0, 8);

    var doc  = _newDoc('Figma Storyboard — TikTok + YouTube — ' + campaignId, designFolder);
    var body = doc.getBody();

    _docBrandHeader(body, 'easyChef Pro: Figma Storyboard Reference', '');
    _dh1(body, 'Figma Storyboard — TikTok + YouTube');
    _dpairSafe(body, 'Campaign', campaignId);
    _dpairSafe(body, 'TikTok',   tkSpec.canvas + ' · ' + tkSpec.ratio + ' · safe ' + tkSpec.safe + ' · hook text top-third');
    _dpairSafe(body, 'YouTube',  ytSpec.canvas + ' · ' + ytSpec.ratio + ' · safe ' + ytSpec.safe + ' · face+text thumbnail');
    body.appendParagraph('');

    _dh2(body, 'TikTok Frames (sp-211 to sp-218)');
    tkPosts.forEach(function(p, i) {
      _docDivider(body);
      _dh2(body, 'TK Frame ' + (i + 1) + ' — ' + (p.id || 'sp-' + (211 + i)));
      _dpairSafe(body, 'Stage',      p.loop_stage || '—');
      _dpairSafe(body, 'Emotional',  (p.emotional_state || '—') + ' to ' + (p.emotional_destination || '—'));
      _dpairSafe(body, 'Hook',       p.hook || '—');
      _dpairSafe(body, 'Body',       p.body_copy || '—');
      _dpairSafe(body, 'CTA',        p.cta || '—');
      _dpairSafe(body, 'ImageBrief', p.image_brief || '(run patch_social_image_briefs first)');
      _dpairSafe(body, 'DL ID',      p.dl_id || '—');
      body.appendParagraph('');
    });

    _dh2(body, 'YouTube Frames (sp-219 to sp-226)');
    ytPosts.forEach(function(p, i) {
      _docDivider(body);
      _dh2(body, 'YT Frame ' + (i + 1) + ' — ' + (p.id || 'sp-' + (219 + i)));
      _dpairSafe(body, 'Stage',      p.loop_stage || '—');
      _dpairSafe(body, 'Emotional',  (p.emotional_state || '—') + ' to ' + (p.emotional_destination || '—'));
      _dpairSafe(body, 'Hook',       p.hook || '—');
      _dpairSafe(body, 'Body',       p.body_copy || '—');
      _dpairSafe(body, 'CTA',        p.cta || '—');
      _dpairSafe(body, 'ImageBrief', p.image_brief || '(run patch_social_image_briefs first)');
      _dpairSafe(body, 'DL ID',      p.dl_id || '—');
      body.appendParagraph('');
    });

    _docBrandFooter(body);
    doc.saveAndClose();
    var docUrl = DriveApp.getFileById(doc.getId()).getUrl();
    Logger.log('[writeFigmaStoryboardDoc] ' + doc.getId());
    return { ok: true, doc_url: docUrl, tk_frames: tkPosts.length, yt_frames: ytPosts.length };
  } catch(e) {
    Logger.log('[writeFigmaStoryboardDoc] error: ' + e.message);
    return { ok: false, error: e.message };
  }
}
