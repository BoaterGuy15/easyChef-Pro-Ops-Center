// clasp auto-deploy test — May 5, 2026
// ─────────────────────────────────────────────────────────────────────────────
// Operations_CampaignSheets.gs
// Manages the "easyChef Pro — Campaign Center" Google Sheet.
//
// SETUP: Run _setupCampaignSheets() once from the Apps Script editor.
// ─────────────────────────────────────────────────────────────────────────────

var _CC_SS_NAME   = 'easyChef Pro — Campaign Center';
var _CC_SS_ID_KEY = 'CAMPAIGN_SHEETS_ID';

var _CC_TAB = {
  ICP:            'ICPProfiles',
  CLAIMS:         'ApprovedClaims',
  BRIEFS:         'CampaignBriefs',
  COPY:           'GeneratedCopy',
  DL:             'DeepLinkRegistry',
  EMAIL:          'EmailSequences',
  SOCIAL:         'SocialPosts',
  PAGES:          'LandingPages',
  CHANNELS:       'Channels',
  CAMPAIGN_TYPES: 'CampaignTypes',
  FUNNEL_STAGES:  'FunnelStages',
  BLUEPRINTS:     'BlueprintConfig'
};

var _CC_HDR = {
  ICPProfiles: [
    'id','name','code','status','demographics','psychographics',
    'primary_pain','secondary_pain','value_trigger','loss_aversion',
    'channel_affinity','message_hierarchy','conversion_triggers',
    'utm_campaign_codes','lp_variants','validated','validation_notes',
    'created_at','updated_at'
  ],
  ApprovedClaims: [
    'id','claim_type','exact_wording','approved','approved_by',
    'approved_date','notes'
  ],
  CampaignBriefs: [
    'id','name','icp_code','blueprint','channel','goal','slug',
    'launch_date','status','ml_approved','ml_approved_date',
    'created_by','created_at','updated_at','notes',
    'post_count','post_frequency','email_sequences','email_variants'
  ],
  GeneratedCopy: [
    'id','campaign_id','icp_code','channel','headline','subheadline',
    'email_subject_a','email_subject_b','lp_hero','proof_bar',
    'cta_primary','social_hook','share_mechanic',
    'generated_at','approved','approved_by','approved_date'
  ],
  DeepLinkRegistry: [
    'dl_id','utm_content','campaign_id','channel','destination_url',
    'utm_source','utm_medium','utm_campaign','status',
    'created_at','activated_at','created_by','notes'
  ],
  EmailSequences: [
    'id','campaign_id','sequence_code','email_number','subject_line',
    'preview_text','body_hook','body_problem','body_agitate','body_solve',
    'body_value','body_proof','body_cta','send_day','trigger_event',
    'status','approved','approved_by','built_in_klaviyo','klaviyo_id',
    'funnel_stage','subject_angle','body_theme','role','seq_template_id'
  ],
  CampaignTypes: [
    'id','cta_type','label','cta_text','destination_url','destination_label',
    'loss_aversion','phase','active','detection_keywords',
    'email_subject_angle','social_hook_angle','created_at','notes'
  ],
  FunnelStages: [
    'id','stage_name','stage_order','social_day','email_day','seq_offset_days',
    'post_template','email_theme','social_theme','pair_id_prefix',
    'loss_aversion_note','created_at','notes'
  ],
  SocialPosts: [
    'id','campaign_id','platform','hook','body_copy','cta','hashtags',
    'image_brief','scheduled_date','status','dl_id','utm_url','posted_url'
  ],
  LandingPages: [
    'id','campaign_id','icp_code','slug','full_url','title_tag','meta_description',
    'og_title','og_description','hero_headline','hero_subheadline',
    'section_problem','section_agitate','section_solve','section_value',
    'section_proof','section_cta','tracking_convert','tracking_clarity',
    'tracking_ga4','status','dev_built','qa_passed','pushed_to_production'
  ],
  Channels: [
    'name','slug_code','utm_medium','utm_source','dl_prefix','status','notes',
    'optimal_chars','max_chars','use_hashtags','hashtag_count_min','hashtag_count_max',
    'hashtag_suggestions','image_dimensions','image_ratio','link_placement',
    'platform_note','content_format'
  ],
  BlueprintConfig: [
    'id','blueprint_code','blueprint_name','sequences_included',
    'email_count','social_post_count','cta_type_default',
    'phase','active','description'
  ]
};

// ── Spreadsheet access ────────────────────────────────────────────────────────

function _getCampaignSpreadsheet() {
  var props = PropertiesService.getScriptProperties();
  var ssId  = props.getProperty(_CC_SS_ID_KEY);
  if (ssId) {
    try { return SpreadsheetApp.openById(ssId); } catch (e) {}
  }
  var ss = SpreadsheetApp.create(_CC_SS_NAME);
  props.setProperty(_CC_SS_ID_KEY, ss.getId());
  return ss;
}

function _getCCSheet(tabName) {
  var ss    = _getCampaignSpreadsheet();
  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    _ccHdrStyle(sheet, _CC_HDR[tabName] || []);
  }
  return sheet;
}

function _ccHdrStyle(sheet, headers) {
  if (!headers || !headers.length) return;
  var r = sheet.getRange(1, 1, 1, headers.length);
  r.setValues([headers]);
  r.setBackground('#0b0d10');
  r.setFontColor('#c9a84c');
  r.setFontFamily('Courier New');
  r.setFontWeight('bold');
  r.setFontSize(10);
  sheet.setFrozenRows(1);
  for (var i = 1; i <= headers.length; i++) sheet.setColumnWidth(i, 150);
}

function _ccNow() { return new Date().toISOString(); }

function _ccFmtDate(v) {
  if (!v) return '';
  if (v instanceof Date) return Utilities.formatDate(v, 'UTC', 'yyyy-MM-dd');
  return String(v);
}

function _ccUpsert(sheet, headers, id, rowValues) {
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        var rng = sheet.getRange(i + 2, 1, 1, headers.length);
        rng.setNumberFormat('@');
        rng.setValues([rowValues]);
        return;
      }
    }
  }
  var rng = sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length);
  rng.setNumberFormat('@');
  rng.setValues([rowValues]);
}

// ── ONE-TIME SETUP ────────────────────────────────────────────────────────────

function _setupCampaignSheets() {
  var ss  = _getCampaignSpreadsheet();
  var now = _ccNow();

  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) ss.deleteSheet(defaultSheet);

  Object.keys(_CC_TAB).forEach(function(key) {
    var name  = _CC_TAB[key];
    var sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    _ccHdrStyle(sheet, _CC_HDR[name]);
  });

  // Seed ICPProfiles
  var icpSheet = ss.getSheetByName(_CC_TAB.ICP);
  [
    ['super_mom','Super Mom','super_mom','Active','','','','','','','','','','','',false,'',now,now],
    ['budget_family','Budget Family','budget_family','Pending Validation','','','','','','','','','','','',false,'',now,now],
    ['health_optimizer','Health Optimizer','health_optimizer','Pending Validation','','','','','','','','','','','',false,'',now,now],
    ['professional','Working Professional','professional','Pending Validation','','','','','','','','','','','',false,'',now,now],
    ['alpha_recruit','Alpha Recruit','alpha_recruit','Active','','','','','','','','','','','',false,'',now,now]
  ].forEach(function(row) { icpSheet.appendRow(row); });

  // Seed ApprovedClaims
  var claimSheet = ss.getSheetByName(_CC_TAB.CLAIMS);
  [
    ['annual_savings',   'savings',      '$1,336/year — never $1,500',                        true, 'Taylor','',now,''],
    ['food_waste',       'waste',        '69.5% — never 70%',                                 true, 'Taylor','',now,''],
    ['fridge_to_table',  'speed',        '30 minutes fridge to table',                        true, 'Taylor','',now,''],
    ['technologies',     'product',      '9 patent-pending technologies — never "9 patents"', true, 'Taylor','',now,''],
    ['database',         'product',      '800,000 products',                                  true, 'Taylor','',now,''],
    ['recipes',          'product',      '10,000 recipe pages at launch',                     true, 'Taylor','',now,''],
    ['dietitians',       'credibility',  'registered dietitians — word "registered" required',true, 'Taylor','',now,''],
    ['profiles',         'validation',   'validated across 10,000 household profiles',        true, 'Taylor','',now,''],
    ['founding_discount','pricing',      '60% off — never 50% off',                          true, 'Taylor','',now,''],
    ['founding_price',   'pricing',      '$7.99/month founding price',                        true, 'Taylor','',now,''],
    ['standard_price',   'pricing',      '$19.99/month',                                      true, 'Taylor','',now,''],
    ['annual_price',     'pricing',      '$191.88/year ($15.99/month)',                       true, 'Taylor','',now,''],
    ['origin',           'brand',        'Built by first responders',                         true, 'Taylor','',now,''],
    ['roi_framing',      'roi',          '$10/$111 (11:1 ROI)',                               false,'',      '',now,'PENDING APPROVAL'],
    ['reddit_tone',      'channel_rule', 'Reddit: community-first tone — never direct promotion', true, 'Taylor','',now,'']
  ].forEach(function(row) { claimSheet.appendRow(row); });

  // Seed DeepLinkRegistry
  var dlSheet = ss.getSheetByName(_CC_TAB.DL);
  [
    ['DL-EM-0001','DL-EM-0001_seq1_email1_cta','ec-2026-001','Email','','klaviyo','email','ec-2026-001','active',now,'',now,'SEQ-1 Email 1'],
    ['DL-EM-0002','DL-EM-0002_seq1_email2_cta','ec-2026-001','Email','','klaviyo','email','ec-2026-001','active',now,'',now,'SEQ-1 Email 2'],
    ['DL-EM-0003','DL-EM-0003_seq1_email3_cta','ec-2026-001','Email','','klaviyo','email','ec-2026-001','active',now,'',now,'SEQ-1 Email 3'],
    ['DL-EM-0004','DL-EM-0004_seq2_email1_cta','ec-2026-001','Email','','klaviyo','email','ec-2026-001','active',now,'',now,'SEQ-2 Email 1'],
    ['DL-EM-0005','DL-EM-0005_seq2_email2_cta','ec-2026-001','Email','','klaviyo','email','ec-2026-001','active',now,'',now,'SEQ-2 Email 2'],
    ['DL-EM-0006','DL-EM-0006_seq2_email3a_cta','ec-2026-001','Email','','klaviyo','email','ec-2026-001','active',now,'',now,'SEQ-2 Email 3 Variant A'],
    ['DL-EM-0007','DL-EM-0007_seq2_email3b_cta','ec-2026-001','Email','','klaviyo','email','ec-2026-001','active',now,'',now,'SEQ-2 Email 3 Variant B'],
    ['DL-SOC-0001','DL-SOC-0001_fb_super_mom','ec-2026-001','Facebook','','facebook','social','ec-2026-001','active',now,'',now,'Facebook organic'],
    ['DL-SOC-0002','DL-SOC-0002_ig_health','ec-2026-001','Instagram','','instagram','social','ec-2026-001','active',now,'',now,'Instagram organic'],
    ['DL-SOC-0003','DL-SOC-0003_nextdoor','ec-2026-001','Nextdoor','','nextdoor','social','ec-2026-001','active',now,'',now,'Nextdoor post'],
    ['DL-SOC-0004','DL-SOC-0004_tiktok_bio','ec-2026-001','TikTok','','tiktok','social','ec-2026-001','active',now,'',now,'TikTok bio link'],
    ['DL-DIR-0001','DL-DIR-0001_alpha_recruit','ec-2026-001','Direct','','convertkit','referral','ec-2026-001','active',now,'',now,'Alpha recruit direct']
  ].forEach(function(row) { dlSheet.appendRow(row); });

  // Seed Channels
  var chSheet = ss.getSheetByName(_CC_TAB.CHANNELS);
  [
    ['Email',     'email',    'email',     'klaviyo',   'EM', 'active','','200',  '',     'false','0', '0', '',                                                                                                    '600x200px',   '3:1',    'Link in email body',                               'Plain text body — no hashtags',                                                    'email'],
    ['Facebook',  'fb',       'social',    'facebook',  'SOC','active','','400',  '63206','false','0', '0', '',                                                                                                    '1200x630px',  '1.91:1', 'Paste URL directly in post',                       'Link works in post — no hashtags needed',                                          'post'],
    ['Instagram', 'ig',       'social',    'instagram', 'SOC','active','','125',  '2200', 'true', '5', '15','#mealplanning #foodwaste #busymom #easyChefPro #mealprep #familydinners #grocerysavings',          '1080x1080px', '1:1',    'Add URL to bio before posting — update bio DL_ID', 'No clickable link in post — use link in bio · hashtags at end of caption',         'post'],
    ['TikTok',    'tiktok',   'social',    'tiktok',    'SOC','active','','150',  '2200', 'true', '3', '5', '#easyChefPro #mealprep #busymom #foodwaste #dinnerideas',                                          '1080x1920px', '9:16',   'Add URL to bio before posting',                    'Video script — hook must land in first 3 seconds · link in bio only',              'video_script'],
    ['Pinterest', 'pin',      'social',    'pinterest', 'SOC','active','','500',  '500',  'true', '5', '8', '#mealplanning #familydinners #grocerysavings #foodwaste #easyrecipes #busymom #mealprep',          '1000x1500px', '2:3',    'URL goes in destination link field',               'Keyword-rich description — link goes directly to LP · vertical image performs best','pin'],
    ['Nextdoor',  'nextdoor', 'social',    'nextdoor',  'SOC','active','','300',  '',     'false','0', '0', '',                                                                                                    'Optional — community photo','', 'Paste URL in post',                              'Neighbour tone — no hashtags, no corporate language · authentic personal voice only','post'],
    ['Organic',   'organic',  'content',   'blog',      'ORG','active','','',     '',     'false','0', '0', '',                                                                                                    '1200x630px',  '1.91:1', 'Link in article body and CTA button',              'Blog post — SEO optimised · internal links to LP',                                 'article'],
    ['Affiliate', 'aff',      'affiliate', 'affiliate', 'AFF','active','','',     '',     'false','0', '0', '',                                                                                                    '',            '',       'URL in affiliate brief',                           'Partner content — follows affiliate brand guidelines',                              'brief'],
    ['Direct',    'direct',   'referral',  'convertkit','DIR','active','','',     '',     'false','0', '0', '',                                                                                                    '',            '',       'URL in email body',                                'Personal outreach — founder voice · one to one',                                   'email'],
    ['YouTube',   'yt',       'video',     'youtube',   'SOC','active','','',     '',     'false','0', '0', '',                                                                                                    '1920x1080px', '16:9',   'Link in description — pin comment with link',       'Video content — hook in first 30 seconds · description SEO optimised',             'video_script'],
    ['X',         'x',        'social',    'x',         'SOC','active','','280',  '280',  'false','0', '0', '',                                                                                                    '1200x675px',  '16:9',   'Paste URL directly in post',                       'Max 280 chars — no hashtags needed for organic · link reduces reach so add in reply','post'],
    ['Reddit',    'reddit',   'community', 'reddit',    'SOC','active','','',     '',     'false','0', '0', '',                                                                                                    '',            '',       'Link in post or comment',                          'Community tone — no promotional language · value first · r/easyChefPro and u/easyChef_Pro','post']
  ].forEach(function(row) { chSheet.appendRow(row); });

  // Seed CampaignTypes
  var ctSheet = ss.getSheetByName(_CC_TAB.CAMPAIGN_TYPES);
  if (!ctSheet) ctSheet = ss.insertSheet(_CC_TAB.CAMPAIGN_TYPES);
  _ccHdrStyle(ctSheet, _CC_HDR.CampaignTypes);
  [
    ['ct-001','waitlist','Waitlist Signup (pre-launch)','Join the waitlist free — early access July 1','https://easychefpro.com/lp/waitlist-a','/lp/waitlist-a','Founding price ends at 5,000 families','pre-launch','true','waitlist,sign up,pre-launch,before july','Save $1,336/year','6:30 PM fridge panic',now,'Primary'],
    ['ct-002','download','App Download (post-launch)','Download free on App Store','app store','App Store/Google Play','Founding price ends soon','post-launch','false','download,app store,install,july 1','App is live — download now','Your dinner problem is solved',now,''],
    ['ct-003','founding','Founding Price Lock','Lock in $7.99/month before price goes to $19.99','https://easychefpro.com/lp/waitlist-a','/lp/waitlist-a','60% off — first 5,000 families only','pre-launch urgency','true','founding,price,lock in,60% off,7.99','Price urgency — 60% off ends soon','Founding price ends when we hit 10,000 families',now,''],
    ['ct-004','referral','Referral / Share','Share with one mom who needs this','https://easychefpro.com/thank-you','/thank-you','She saves $1,336 this year — or she doesn\'t','post-signup viral','true','referral,share,friend,refer','Share and help a friend','Know a mom who throws money away every week?',now,''],
    ['ct-005','affiliate','Affiliate Partner','Get early access — no credit card','https://easychefpro.com/lp/[affiliate-slug]','/lp/[affiliate-slug]','Founding price for referred families only','all','true','affiliate,partner,influencer,commission','Exclusive access for [partner] readers','My readers save $1,336 a year with this',now,''],
    ['ct-006','recipe','Recipe / Content SEO','See the full recipe free in easyChef Pro','https://easychefpro.com/recipes/[slug]','/recipes/[slug]','Free during beta — paid after launch','all','true','recipe,content,seo,blog','New recipe — ready in 30 minutes','30-minute dinner from what is in your fridge',now,''],
    ['ct-007','upgrade','In-App Upgrade','Upgrade now — founding price locks forever','in-app paywall','Paywall (Tipping Point)','Price goes to $19.99 on July 1','post-install PLG','false','upgrade,paywall,in-app,tipping point','You have hit the tipping point','You have cooked 3 meals — here is what comes next',now,'']
  ].forEach(function(row) { ctSheet.appendRow(row); });

  // Seed FunnelStages
  var fsSheet = ss.getSheetByName(_CC_TAB.FUNNEL_STAGES);
  if (!fsSheet) fsSheet = ss.insertSheet(_CC_TAB.FUNNEL_STAGES);
  _ccHdrStyle(fsSheet, _CC_HDR.FunnelStages);
  [
    ['fs-001','hook',    1, 0,  1,  0,  'Stop the scroll — make her feel seen in under 2 seconds. Mirror her exact moment.',                                                                                'Hook — subject line stops the scroll',           'Mirror her moment — emotional recognition', 'pair-1-hook',    'Every day she waits costs $3.66',              now,''],
    ['fs-002','problem', 2, 2,  3,  0,  'Name the pain so precisely she thinks you wrote it about her specifically.',                                                                                      'Problem — name her pain precisely',              'Name the 6:30 PM moment exactly',           'pair-2-problem', 'The problem costs $1,336 a year',              now,''],
    ['fs-003','agitate', 3, 5,  6,  0,  'Make the problem vivid, concrete, personal. Cost it out. $1,336/year — that is $111/month — that is $25/week going in the bin.',                                 'Agitate — cost the problem out',                 'Cost it out — specific dollar amount',      'pair-3-agitate', 'She cannot unsee this number',                 now,''],
    ['fs-004','solve',   4, 9,  10, 0,  'Introduce easyChef Pro as the inevitable obvious answer. One sentence. No feature list.',                                                                         'Solve — introduce easyChef Pro as the answer',   'Introduce easyChef Pro — one sentence',     'pair-4-solve',   'The answer exists — she just needs to find it',now,''],
    ['fs-005','value',   5, 13, 14, 0,  'Translate features into outcomes she actually wants. Feelings and results, not specs. 30 minutes. What you already have.',                                        'Value — outcomes not features',                  'Show the outcomes — 30 minutes, real food', 'pair-5-value',   'Every night without it costs her time and money',now,''],
    ['fs-006','proof',   6, 24, 25, 0,  'One specific honest proof point. Validated across 10,000 household profiles. Built by first responders. Then the offer.',                                         'Proof — one honest stat, then the offer',         'One proof point — then founding price',     'pair-6-proof',   'Social proof closes the last objection',       now,''],
    ['fs-007','cta',     7, 0,  1,  28, 'One action. Low friction. Outcome-framed. Not sign up — tell her what she is getting.',                                                                           'CTA — one action, loss aversion, urgency',       'Founding price — last chance angle',        'pair-7-cta',     'Founding price ends at 5,000 families',        now,'']
  ].forEach(function(row) { fsSheet.appendRow(row); });

  // Seed BlueprintConfig
  var bpSheet = ss.getSheetByName(_CC_TAB.BLUEPRINTS);
  if (!bpSheet) bpSheet = ss.insertSheet(_CC_TAB.BLUEPRINTS);
  _ccHdrStyle(bpSheet, _CC_HDR.BlueprintConfig);
  [
    ['bp-001','A-Waitlist',        'Waitlist Growth',       'SEQ-1,SEQ-2,SEQ-3,SEQ-4', 13, 7, 'waitlist', 'pre-launch',   'true',  'Pre-launch waitlist acquisition — drives to LP, captures email, nurtures to app download on July 1'],
    ['bp-002','B-App Download',    'App Download',          'SEQ-4',                    1,  7, 'download', 'post-launch',  'false', 'Post-launch app download — drives directly to App Store'],
    ['bp-003','C-Referral',        'Referral Acquisition',  'SEQ-1',                    3,  5, 'referral', 'post-signup',  'true',  'Referral loop — share mechanic, Branch.io deep links'],
    ['bp-004','D-Re-engagement',   'Re-engagement',         'SEQ-2',                    3,  5, 'download', 'post-install', 'false', 'Lapsed user re-engagement — push + email'],
    ['bp-005','E-Content',         'Content-Led',           'SEQ-1,SEQ-2',              5,  7, 'recipe',   'all',          'true',  'Blog and recipe page traffic — content CTA drives to LP'],
    ['bp-006','F-Affiliate',       'Affiliate Partner',     'SEQ-1,SEQ-2',              5,  7, 'affiliate','all',          'true',  'Affiliate partner traffic — Rewardful tracked, custom LP per partner'],
    ['bp-007','G-Paywall Recovery','Paywall Recovery',      'SEQ-2',                    3,  5, 'upgrade',  'post-install', 'false', 'In-app paywall recovery — tipping point triggered']
  ].forEach(function(row) { bpSheet.appendRow(row); });

  Logger.log('Campaign Center ready: ' + ss.getUrl());
  try { SpreadsheetApp.getUi().alert('Campaign Center created.\n\n' + ss.getUrl()); } catch(e) {}
  return ss.getUrl();
}

// ── ICPProfiles ───────────────────────────────────────────────────────────────

function _icpRowToObj(r) {
  return {
    id: r[0], name: r[1], code: r[2], status: r[3],
    demographics: r[4], psychographics: r[5],
    primary_pain: r[6], secondary_pain: r[7],
    value_trigger: r[8], loss_aversion: r[9],
    channel_affinity: r[10], message_hierarchy: r[11],
    conversion_triggers: r[12], utm_campaign_codes: r[13],
    lp_variants: r[14], validated: r[15], validation_notes: r[16],
    created_at: _ccFmtDate(r[17]), updated_at: _ccFmtDate(r[18])
  };
}

function getIcpProfiles() {
  var sheet = _getCCSheet(_CC_TAB.ICP);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, _CC_HDR.ICPProfiles.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_icpRowToObj);
}

function getIcpProfile(codeOrName) {
  if (!codeOrName) return null;
  var q = String(codeOrName).toLowerCase().trim();
  var profiles = getIcpProfiles();
  for (var i = 0; i < profiles.length; i++) {
    var p = profiles[i];
    if (String(p.code).toLowerCase() === q ||
        String(p.name).toLowerCase() === q ||
        String(p.id).toLowerCase()   === q) return p;
  }
  return null;
}

function setIcpProfile(item) {
  if (!item || !item.id) return;
  var sheet   = _getCCSheet(_CC_TAB.ICP);
  var headers = _CC_HDR.ICPProfiles;
  var now     = _ccNow();
  var ex      = null;
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(item.id)) { ex = rows[i]; break; }
    }
  }
  var row = [
    item.id,
    item.name                !== undefined ? item.name                : (ex ? ex[1]  : ''),
    item.code                !== undefined ? item.code                : (ex ? ex[2]  : ''),
    item.status              !== undefined ? item.status              : (ex ? ex[3]  : 'Pending Validation'),
    item.demographics        !== undefined ? item.demographics        : (ex ? ex[4]  : ''),
    item.psychographics      !== undefined ? item.psychographics      : (ex ? ex[5]  : ''),
    item.primary_pain        !== undefined ? item.primary_pain        : (ex ? ex[6]  : ''),
    item.secondary_pain      !== undefined ? item.secondary_pain      : (ex ? ex[7]  : ''),
    item.value_trigger       !== undefined ? item.value_trigger       : (ex ? ex[8]  : ''),
    item.loss_aversion       !== undefined ? item.loss_aversion       : (ex ? ex[9]  : ''),
    item.channel_affinity    !== undefined ? item.channel_affinity    : (ex ? ex[10] : ''),
    item.message_hierarchy   !== undefined ? item.message_hierarchy   : (ex ? ex[11] : ''),
    item.conversion_triggers !== undefined ? item.conversion_triggers : (ex ? ex[12] : ''),
    item.utm_campaign_codes  !== undefined ? item.utm_campaign_codes  : (ex ? ex[13] : ''),
    item.lp_variants         !== undefined ? item.lp_variants         : (ex ? ex[14] : ''),
    item.validated           !== undefined ? item.validated           : (ex ? ex[15] : false),
    item.validation_notes    !== undefined ? item.validation_notes    : (ex ? ex[16] : ''),
    ex ? ex[17] : now,
    now
  ];
  _ccUpsert(sheet, headers, item.id, row);
}

// ── ApprovedClaims ────────────────────────────────────────────────────────────

function _claimRowToObj(r) {
  return {
    id: r[0], claim_type: r[1], exact_wording: r[2],
    approved: r[3] === true || String(r[3]).toLowerCase() === 'true',
    approved_by: r[4], approved_date: _ccFmtDate(r[5]), notes: r[6]
  };
}

function getApprovedClaims(approvedOnly) {
  var sheet = _getCCSheet(_CC_TAB.CLAIMS);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.ApprovedClaims.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_claimRowToObj);
  if (approvedOnly === false) return rows;
  return rows.filter(function(c) { return c.approved; });
}

function setApprovedClaim(item) {
  if (!item || !item.id) return;
  var sheet   = _getCCSheet(_CC_TAB.CLAIMS);
  var headers = _CC_HDR.ApprovedClaims;
  var now     = _ccNow();
  var ex      = null;
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(item.id)) { ex = rows[i]; break; }
    }
  }
  var row = [
    item.id,
    item.claim_type    !== undefined ? item.claim_type    : (ex ? ex[1] : ''),
    item.exact_wording !== undefined ? item.exact_wording : (ex ? ex[2] : ''),
    item.approved      !== undefined ? item.approved      : (ex ? ex[3] : false),
    item.approved_by   !== undefined ? item.approved_by   : (ex ? ex[4] : ''),
    item.approved_date !== undefined ? item.approved_date : (ex ? ex[5] : now),
    item.notes         !== undefined ? item.notes         : (ex ? ex[6] : '')
  ];
  _ccUpsert(sheet, headers, item.id, row);
}

// ── CampaignBriefs ────────────────────────────────────────────────────────────

function _briefRowToObj(r) {
  return {
    id: r[0], name: r[1], icp_code: r[2], blueprint: r[3],
    channel: r[4], goal: r[5], slug: r[6],
    launch_date: _ccFmtDate(r[7]), status: r[8],
    ml_approved: r[9] === true || String(r[9]).toLowerCase() === 'true',
    ml_approved_date: _ccFmtDate(r[10]),
    created_by: r[11], created_at: _ccFmtDate(r[12]),
    updated_at: _ccFmtDate(r[13]), notes: r[14],
    post_count:      parseInt(r[15]) || 5,
    post_frequency:  String(r[16] || 'every_2_days'),
    email_sequences: String(r[17] || 'seq1_seq2'),
    email_variants:  String(r[18] || 'both')
  };
}

function getCampaignBriefs(id) {
  var sheet = _getCCSheet(_CC_TAB.BRIEFS);
  var last  = sheet.getLastRow();
  if (last < 2) return id ? null : [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.CampaignBriefs.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_briefRowToObj);
  if (!id) return rows;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id) === String(id)) return rows[i];
  }
  return null;
}

function setCampaignBrief(item) {
  if (!item || !item.id) return;
  var sheet   = _getCCSheet(_CC_TAB.BRIEFS);
  var headers = _CC_HDR.CampaignBriefs;
  var now     = _ccNow();
  var ex      = null;
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(item.id)) { ex = rows[i]; break; }
    }
  }
  var row = [
    item.id,
    item.name             !== undefined ? item.name             : (ex ? ex[1]  : ''),
    item.icp_code         !== undefined ? item.icp_code         : (ex ? ex[2]  : ''),
    item.blueprint        !== undefined ? item.blueprint        : (ex ? ex[3]  : ''),
    item.channel          !== undefined ? item.channel          : (ex ? ex[4]  : ''),
    item.goal             !== undefined ? item.goal             : (ex ? ex[5]  : ''),
    item.slug             !== undefined ? item.slug             : (ex ? ex[6]  : ''),
    item.launch_date      !== undefined ? item.launch_date      : (ex ? ex[7]  : ''),
    item.status           !== undefined ? item.status           : (ex ? ex[8]  : 'draft'),
    item.ml_approved      !== undefined ? item.ml_approved      : (ex ? ex[9]  : false),
    item.ml_approved_date !== undefined ? item.ml_approved_date : (ex ? ex[10] : ''),
    ex ? ex[11] : (item.created_by || ''),
    ex ? ex[12] : now,
    now,
    item.notes            !== undefined ? item.notes            : (ex ? ex[14] : ''),
    item.post_count       !== undefined ? String(item.post_count)      : (ex ? ex[15] : '5'),
    item.post_frequency   !== undefined ? item.post_frequency          : (ex ? ex[16] : 'every_2_days'),
    item.email_sequences  !== undefined ? item.email_sequences         : (ex ? ex[17] : 'seq1_seq2'),
    item.email_variants   !== undefined ? item.email_variants          : (ex ? ex[18] : 'both')
  ];
  _ccUpsert(sheet, headers, item.id, row);
}

// ── GeneratedCopy ─────────────────────────────────────────────────────────────

function _copyRowToObj(r) {
  return {
    id: r[0], campaign_id: r[1], icp_code: r[2], channel: r[3],
    headline: r[4], subheadline: r[5],
    email_subject_a: r[6], email_subject_b: r[7], lp_hero: r[8],
    proof_bar: r[9], cta_primary: r[10], social_hook: r[11],
    share_mechanic: r[12], generated_at: _ccFmtDate(r[13]),
    approved: r[14] === true || String(r[14]).toLowerCase() === 'true',
    approved_by: r[15], approved_date: _ccFmtDate(r[16])
  };
}

function getGeneratedCopy(campaignId) {
  var sheet = _getCCSheet(_CC_TAB.COPY);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.GeneratedCopy.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_copyRowToObj);
  if (!campaignId) return rows;
  return rows.filter(function(r) { return r.campaign_id === campaignId; });
}

function addGeneratedCopy(item) {
  if (!item || !item.campaign_id) return;
  var sheet  = _getCCSheet(_CC_TAB.COPY);
  var now    = _ccNow();
  var proof  = Array.isArray(item.proof_bar) ? item.proof_bar.join(' | ') : (item.proof_bar || '');
  var rng    = sheet.getRange(sheet.getLastRow() + 1, 1, 1, _CC_HDR.GeneratedCopy.length);
  rng.setNumberFormat('@');
  rng.setValues([[
    item.id              || ('copy-' + Date.now().toString(36)),
    item.campaign_id     || '',
    item.icp_code        || '',
    item.channel         || '',
    item.headline        || '',
    item.subheadline     || '',
    item.email_subject_a || '',
    item.email_subject_b || '',
    item.lp_hero         || '',
    proof,
    item.cta_primary     || '',
    item.social_hook     || '',
    item.share_mechanic  || '',
    item.generated_at    || now,
    item.approved        || false,
    item.approved_by     || '',
    item.approved_date   || ''
  ]]);
}

// ── DeepLinkRegistry ──────────────────────────────────────────────────────────

function _dlRowToObj(r) {
  return {
    dl_id: r[0], utm_content: r[1], campaign_id: r[2], channel: r[3],
    destination_url: r[4], utm_source: r[5], utm_medium: r[6],
    utm_campaign: r[7], status: r[8],
    created_at: _ccFmtDate(r[9]), activated_at: _ccFmtDate(r[10]),
    created_by: r[11], notes: r[12]
  };
}

function getDlRegistry(campaignId) {
  var sheet = _getCCSheet(_CC_TAB.DL);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.DeepLinkRegistry.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_dlRowToObj);
  if (!campaignId) return rows;
  return rows.filter(function(r) { return r.campaign_id === campaignId; });
}

function setDlRegistryEntry(item) {
  if (!item || !item.dl_id) return;
  var sheet   = _getCCSheet(_CC_TAB.DL);
  var headers = _CC_HDR.DeepLinkRegistry;
  var now     = _ccNow();
  var ex      = null;
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(item.dl_id)) { ex = rows[i]; break; }
    }
  }
  var row = [
    item.dl_id,
    item.utm_content     !== undefined ? item.utm_content     : (ex ? ex[1]  : item.dl_id),
    item.campaign_id     !== undefined ? item.campaign_id     : (ex ? ex[2]  : ''),
    item.channel         !== undefined ? item.channel         : (ex ? ex[3]  : ''),
    item.destination_url !== undefined ? item.destination_url : (ex ? ex[4]  : ''),
    item.utm_source      !== undefined ? item.utm_source      : (ex ? ex[5]  : ''),
    item.utm_medium      !== undefined ? item.utm_medium      : (ex ? ex[6]  : ''),
    item.utm_campaign    !== undefined ? item.utm_campaign    : (ex ? ex[7]  : ''),
    item.status          !== undefined ? item.status          : (ex ? ex[8]  : 'draft'),
    ex ? ex[9] : (item.created_at || now),
    item.activated_at    !== undefined ? item.activated_at    : (ex ? ex[10] : ''),
    ex ? ex[11] : (item.created_by || ''),
    item.notes           !== undefined ? item.notes           : (ex ? ex[12] : '')
  ];
  _ccUpsert(sheet, headers, item.dl_id, row);
}

function _nextDlId(prefix) {
  var sheet   = _getCCSheet(_CC_TAB.DL);
  var lastRow = sheet.getLastRow();
  var maxNum  = 0;
  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var pat = new RegExp('^DL-' + prefix + '-(\\d+)$');
    ids.forEach(function(r) {
      var m = String(r[0]).match(pat);
      if (m) { var n = parseInt(m[1], 10); if (n > maxNum) maxNum = n; }
    });
  }
  return 'DL-' + prefix + '-' + String(maxNum + 1).padStart(4, '0');
}

function registerDraftDl(brief) {
  if (!brief) return '';
  var channel = brief.channel || 'Email';
  var chData  = _getChannelData(channel);
  var dlId    = _nextDlId(chData.dl_prefix);
  var slug    = (brief.slug || '').replace(/^\//, '');
  setDlRegistryEntry({
    dl_id:           dlId,
    utm_content:     dlId,
    campaign_id:     brief.id     || '',
    channel:         channel,
    destination_url: slug ? 'https://easychefpro.com/' + slug : '',
    utm_source:      chData.utm_source,
    utm_medium:      chData.utm_medium,
    utm_campaign:    brief.id     || '',
    status:          'draft',
    created_at:      _ccNow(),
    created_by:      'campaignGen'
  });
  return dlId;
}

// ── EmailSequences ────────────────────────────────────────────────────────────

function _seqRowToObj(r) {
  return {
    id: r[0], campaign_id: r[1], sequence_code: r[2], email_number: r[3],
    subject_line: r[4], preview_text: r[5], body_hook: r[6],
    body_problem: r[7], body_agitate: r[8], body_solve: r[9],
    body_value: r[10], body_proof: r[11], body_cta: r[12],
    send_day: r[13], trigger_event: r[14], status: r[15],
    approved: r[16] === true || String(r[16]).toLowerCase() === 'true',
    approved_by: r[17],
    built_in_klaviyo: r[18] === true || String(r[18]).toLowerCase() === 'true',
    klaviyo_id:      r[19] || '',
    funnel_stage:    r[20] || '',
    subject_angle:   r[21] || '',
    body_theme:      r[22] || '',
    role:            r[23] || '',
    seq_template_id: r[24] || ''
  };
}

function getEmailSequences(campaignId) {
  var sheet = _getCCSheet(_CC_TAB.EMAIL);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.EmailSequences.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_seqRowToObj);
  if (!campaignId) return rows;
  return rows.filter(function(r) { return r.campaign_id === campaignId; });
}

function setEmailSequence(item) {
  if (!item || !item.id) return;
  var sheet   = _getCCSheet(_CC_TAB.EMAIL);
  var headers = _CC_HDR.EmailSequences;
  var ex      = null;
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(item.id)) { ex = rows[i]; break; }
    }
  }
  var row = [
    item.id,
    item.campaign_id       !== undefined ? item.campaign_id       : (ex ? ex[1]  : ''),
    item.sequence_code     !== undefined ? item.sequence_code     : (ex ? ex[2]  : ''),
    item.email_number      !== undefined ? item.email_number      : (ex ? ex[3]  : ''),
    item.subject_line      !== undefined ? item.subject_line      : (ex ? ex[4]  : ''),
    item.preview_text      !== undefined ? item.preview_text      : (ex ? ex[5]  : ''),
    item.body_hook         !== undefined ? item.body_hook         : (ex ? ex[6]  : ''),
    item.body_problem      !== undefined ? item.body_problem      : (ex ? ex[7]  : ''),
    item.body_agitate      !== undefined ? item.body_agitate      : (ex ? ex[8]  : ''),
    item.body_solve        !== undefined ? item.body_solve        : (ex ? ex[9]  : ''),
    item.body_value        !== undefined ? item.body_value        : (ex ? ex[10] : ''),
    item.body_proof        !== undefined ? item.body_proof        : (ex ? ex[11] : ''),
    item.body_cta          !== undefined ? item.body_cta          : (ex ? ex[12] : ''),
    item.send_day          !== undefined ? item.send_day          : (ex ? ex[13] : ''),
    item.trigger_event     !== undefined ? item.trigger_event     : (ex ? ex[14] : ''),
    item.status            !== undefined ? item.status            : (ex ? ex[15] : 'draft'),
    item.approved          !== undefined ? item.approved          : (ex ? ex[16] : false),
    item.approved_by       !== undefined ? item.approved_by       : (ex ? ex[17] : ''),
    item.built_in_klaviyo  !== undefined ? item.built_in_klaviyo  : (ex ? ex[18] : false),
    item.klaviyo_id        !== undefined ? item.klaviyo_id        : (ex ? ex[19] : ''),
    item.funnel_stage      !== undefined ? item.funnel_stage      : (ex ? ex[20] : ''),
    item.subject_angle     !== undefined ? item.subject_angle     : (ex ? ex[21] : ''),
    item.body_theme        !== undefined ? item.body_theme        : (ex ? ex[22] : ''),
    item.role              !== undefined ? item.role              : (ex ? ex[23] : ''),
    item.seq_template_id   !== undefined ? item.seq_template_id   : (ex ? ex[24] : '')
  ];
  _ccUpsert(sheet, headers, item.id, row);
}

// ── SocialPosts ───────────────────────────────────────────────────────────────

function _socialRowToObj(r) {
  return {
    id: r[0], campaign_id: r[1], platform: r[2], hook: r[3],
    body_copy: r[4], cta: r[5], hashtags: r[6], image_brief: r[7],
    scheduled_date: _ccFmtDate(r[8]), status: r[9],
    dl_id: r[10], utm_url: r[11], posted_url: r[12]
  };
}

function getSocialPosts(campaignId) {
  var sheet = _getCCSheet(_CC_TAB.SOCIAL);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.SocialPosts.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_socialRowToObj);
  if (!campaignId) return rows;
  return rows.filter(function(r) { return r.campaign_id === campaignId; });
}

function setSocialPost(item) {
  if (!item || !item.id) return;
  var sheet   = _getCCSheet(_CC_TAB.SOCIAL);
  var headers = _CC_HDR.SocialPosts;
  var ex      = null;
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(item.id)) { ex = rows[i]; break; }
    }
  }
  var row = [
    item.id,
    item.campaign_id    !== undefined ? item.campaign_id    : (ex ? ex[1]  : ''),
    item.platform       !== undefined ? item.platform       : (ex ? ex[2]  : ''),
    item.hook           !== undefined ? item.hook           : (ex ? ex[3]  : ''),
    item.body_copy      !== undefined ? item.body_copy      : (ex ? ex[4]  : ''),
    item.cta            !== undefined ? item.cta            : (ex ? ex[5]  : ''),
    item.hashtags       !== undefined ? item.hashtags       : (ex ? ex[6]  : ''),
    item.image_brief    !== undefined ? item.image_brief    : (ex ? ex[7]  : ''),
    item.scheduled_date !== undefined ? item.scheduled_date : (ex ? ex[8]  : ''),
    item.status         !== undefined ? item.status         : (ex ? ex[9]  : 'draft'),
    item.dl_id          !== undefined ? item.dl_id          : (ex ? ex[10] : ''),
    item.utm_url        !== undefined ? item.utm_url        : (ex ? ex[11] : ''),
    item.posted_url     !== undefined ? item.posted_url     : (ex ? ex[12] : '')
  ];
  _ccUpsert(sheet, headers, item.id, row);
}

// ── LandingPages ──────────────────────────────────────────────────────────────

function _pageRowToObj(r) {
  return {
    id: r[0], campaign_id: r[1], icp_code: r[2], slug: r[3], full_url: r[4],
    title_tag: r[5], meta_description: r[6], og_title: r[7],
    og_description: r[8], hero_headline: r[9], hero_subheadline: r[10],
    section_problem: r[11], section_agitate: r[12], section_solve: r[13],
    section_value: r[14], section_proof: r[15], section_cta: r[16],
    tracking_convert: r[17], tracking_clarity: r[18], tracking_ga4: r[19],
    status: r[20],
    dev_built:            r[21] === true || String(r[21]).toLowerCase() === 'true',
    qa_passed:            r[22] === true || String(r[22]).toLowerCase() === 'true',
    pushed_to_production: r[23] === true || String(r[23]).toLowerCase() === 'true'
  };
}

function getLandingPages(campaignId) {
  var sheet = _getCCSheet(_CC_TAB.PAGES);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.LandingPages.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_pageRowToObj);
  if (!campaignId) return rows;
  return rows.filter(function(r) { return r.campaign_id === campaignId; });
}

function setLandingPage(item) {
  if (!item || !item.id) return;
  var sheet   = _getCCSheet(_CC_TAB.PAGES);
  var headers = _CC_HDR.LandingPages;
  var ex      = null;
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(item.id)) { ex = rows[i]; break; }
    }
  }
  var row = [
    item.id,
    item.campaign_id          !== undefined ? item.campaign_id          : (ex ? ex[1]  : ''),
    item.icp_code             !== undefined ? item.icp_code             : (ex ? ex[2]  : ''),
    item.slug                 !== undefined ? item.slug                 : (ex ? ex[3]  : ''),
    item.full_url             !== undefined ? item.full_url             : (ex ? ex[4]  : ''),
    item.title_tag            !== undefined ? item.title_tag            : (ex ? ex[5]  : ''),
    item.meta_description     !== undefined ? item.meta_description     : (ex ? ex[6]  : ''),
    item.og_title             !== undefined ? item.og_title             : (ex ? ex[7]  : ''),
    item.og_description       !== undefined ? item.og_description       : (ex ? ex[8]  : ''),
    item.hero_headline        !== undefined ? item.hero_headline        : (ex ? ex[9]  : ''),
    item.hero_subheadline     !== undefined ? item.hero_subheadline     : (ex ? ex[10] : ''),
    item.section_problem      !== undefined ? item.section_problem      : (ex ? ex[11] : ''),
    item.section_agitate      !== undefined ? item.section_agitate      : (ex ? ex[12] : ''),
    item.section_solve        !== undefined ? item.section_solve        : (ex ? ex[13] : ''),
    item.section_value        !== undefined ? item.section_value        : (ex ? ex[14] : ''),
    item.section_proof        !== undefined ? item.section_proof        : (ex ? ex[15] : ''),
    item.section_cta          !== undefined ? item.section_cta          : (ex ? ex[16] : ''),
    item.tracking_convert     !== undefined ? item.tracking_convert     : (ex ? ex[17] : ''),
    item.tracking_clarity     !== undefined ? item.tracking_clarity     : (ex ? ex[18] : ''),
    item.tracking_ga4         !== undefined ? item.tracking_ga4         : (ex ? ex[19] : ''),
    item.status               !== undefined ? item.status               : (ex ? ex[20] : 'draft'),
    item.dev_built            !== undefined ? item.dev_built            : (ex ? ex[21] : false),
    item.qa_passed            !== undefined ? item.qa_passed            : (ex ? ex[22] : false),
    item.pushed_to_production !== undefined ? item.pushed_to_production : (ex ? ex[23] : false)
  ];
  _ccUpsert(sheet, headers, item.id, row);
}

// ── Channels ──────────────────────────────────────────────────────────────────

function _channelRowToObj(r) {
  return {
    name:                r[0],
    slug_code:           r[1],
    utm_medium:          r[2],
    utm_source:          r[3],
    dl_prefix:           r[4],
    status:              r[5],
    notes:               r[6],
    optimal_chars:       parseInt(r[7])  || 0,
    max_chars:           parseInt(r[8])  || 0,
    use_hashtags:        r[9] === true || String(r[9]).toLowerCase() === 'true',
    hashtag_count_min:   parseInt(r[10]) || 0,
    hashtag_count_max:   parseInt(r[11]) || 0,
    hashtag_suggestions: String(r[12] || ''),
    image_dimensions:    String(r[13] || ''),
    image_ratio:         String(r[14] || ''),
    link_placement:      String(r[15] || ''),
    platform_note:       String(r[16] || ''),
    content_format:      String(r[17] || '')
  };
}

function getChannels() {
  var sheet   = _getCCSheet(_CC_TAB.CHANNELS);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, _CC_HDR.Channels.length).getValues()
    .filter(function(r) { return r[0] && String(r[5]).toLowerCase() === 'active'; })
    .map(_channelRowToObj);
}

function setChannel(item) {
  if (!item || !item.name) return;
  var sheet   = _getCCSheet(_CC_TAB.CHANNELS);
  var headers = _CC_HDR.Channels;
  var lastRow = sheet.getLastRow();
  var ex      = null;
  if (lastRow >= 2) {
    var rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]).toLowerCase() === String(item.name).toLowerCase()) {
        ex = { rowIndex: i + 2 };
        break;
      }
    }
  }
  var row = [
    item.name                || '',
    item.slug_code           || '',
    item.utm_medium          || '',
    item.utm_source          || '',
    item.dl_prefix           || '',
    item.status              || 'active',
    item.notes               || '',
    item.optimal_chars       !== undefined ? String(item.optimal_chars)     : '',
    item.max_chars           !== undefined ? String(item.max_chars)         : '',
    item.use_hashtags        !== undefined ? String(item.use_hashtags)      : 'false',
    item.hashtag_count_min   !== undefined ? String(item.hashtag_count_min) : '0',
    item.hashtag_count_max   !== undefined ? String(item.hashtag_count_max) : '0',
    item.hashtag_suggestions || '',
    item.image_dimensions    || '',
    item.image_ratio         || '',
    item.link_placement      || '',
    item.platform_note       || '',
    item.content_format      || ''
  ];
  var rng = ex
    ? sheet.getRange(ex.rowIndex, 1, 1, headers.length)
    : sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length);
  rng.setNumberFormat('@');
  rng.setValues([row]);
}

// ── Campaign ID Generator ─────────────────────────────────────────────────────

function getNextCampaignId() {
  var year    = new Date().getFullYear();
  var sheet   = _getCCSheet(_CC_TAB.BRIEFS);
  var lastRow = sheet.getLastRow();
  var maxNum  = 0;
  if (lastRow >= 2) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    var pat = /^EC-(\d{4})-(\d{3})$/;
    ids.forEach(function(r) {
      var m = String(r[0]).match(pat);
      if (m && parseInt(m[1], 10) === year) {
        var n = parseInt(m[2], 10);
        if (n > maxNum) maxNum = n;
      }
    });
  }
  return 'EC-' + year + '-' + String(maxNum + 1).padStart(3, '0');
}

// ── Slug availability check ───────────────────────────────────────────────────

function checkSlugAvailable(slug) {
  if (!slug) return { ok: false, error: 'slug is required' };
  var sheet   = _getCCSheet(_CC_TAB.PAGES);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: true };
  var rows = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][3]).trim() === String(slug).trim()) {
      return { ok: false, conflict_campaign_id: String(rows[i][1]) };
    }
  }
  return { ok: true };
}

// ── Channels tab migration ────────────────────────────────────────────────────
// Run once: Apps Script editor → select _migrateChannelsTab → Run

function _migrateChannelsTab() {
  var sheet      = _getCCSheet(_CC_TAB.CHANNELS);
  var newHeaders = _CC_HDR.Channels;

  if (sheet.getLastColumn() >= newHeaders.length) {
    Logger.log('Already up to date — ' + sheet.getLastColumn() + ' columns.');
    try { SpreadsheetApp.getUi().alert('Already up to date — no migration needed.'); } catch(e) {}
    return;
  }

  _ccHdrStyle(sheet, newHeaders);

  var fullSeed = [
    ['Email',     'email',    'email',     'klaviyo',   'EM', 'active','','200',  '',     'false','0', '0', '',                                                                                                    '600x200px',   '3:1',    'Link in email body',                               'Plain text body — no hashtags',                                                    'email'],
    ['Facebook',  'fb',       'social',    'facebook',  'SOC','active','','400',  '63206','false','0', '0', '',                                                                                                    '1200x630px',  '1.91:1', 'Paste URL directly in post',                       'Link works in post — no hashtags needed',                                          'post'],
    ['Instagram', 'ig',       'social',    'instagram', 'SOC','active','','125',  '2200', 'true', '5', '15','#mealplanning #foodwaste #busymom #easyChefPro #mealprep #familydinners #grocerysavings',          '1080x1080px', '1:1',    'Add URL to bio before posting — update bio DL_ID', 'No clickable link in post — use link in bio · hashtags at end of caption',         'post'],
    ['TikTok',    'tiktok',   'social',    'tiktok',    'SOC','active','','150',  '2200', 'true', '3', '5', '#easyChefPro #mealprep #busymom #foodwaste #dinnerideas',                                          '1080x1920px', '9:16',   'Add URL to bio before posting',                    'Video script — hook must land in first 3 seconds · link in bio only',              'video_script'],
    ['Pinterest', 'pin',      'social',    'pinterest', 'SOC','active','','500',  '500',  'true', '5', '8', '#mealplanning #familydinners #grocerysavings #foodwaste #easyrecipes #busymom #mealprep',          '1000x1500px', '2:3',    'URL goes in destination link field',               'Keyword-rich description — link goes directly to LP · vertical image performs best','pin'],
    ['Nextdoor',  'nextdoor', 'social',    'nextdoor',  'SOC','active','','300',  '',     'false','0', '0', '',                                                                                                    'Optional — community photo','', 'Paste URL in post',                              'Neighbour tone — no hashtags, no corporate language · authentic personal voice only','post'],
    ['Organic',   'organic',  'content',   'blog',      'ORG','active','','',     '',     'false','0', '0', '',                                                                                                    '1200x630px',  '1.91:1', 'Link in article body and CTA button',              'Blog post — SEO optimised · internal links to LP',                                 'article'],
    ['Affiliate', 'aff',      'affiliate', 'affiliate', 'AFF','active','','',     '',     'false','0', '0', '',                                                                                                    '',            '',       'URL in affiliate brief',                           'Partner content — follows affiliate brand guidelines',                              'brief'],
    ['Direct',    'direct',   'referral',  'convertkit','DIR','active','','',     '',     'false','0', '0', '',                                                                                                    '',            '',       'URL in email body',                                'Personal outreach — founder voice · one to one',                                   'email'],
    ['YouTube',   'yt',       'video',     'youtube',   'SOC','active','','',     '',     'false','0', '0', '',                                                                                                    '1920x1080px', '16:9',   'Link in description — pin comment with link',       'Video content — hook in first 30 seconds · description SEO optimised',             'video_script'],
    ['X',         'x',        'social',    'x',         'SOC','active','','280',  '280',  'false','0', '0', '',                                                                                                    '1200x675px',  '16:9',   'Paste URL directly in post',                       'Max 280 chars — no hashtags needed for organic · link reduces reach so add in reply','post'],
    ['Reddit',    'reddit',   'community', 'reddit',    'SOC','active','','',     '',     'false','0', '0', '',                                                                                                    '',            '',       'Link in post or comment',                          'Community tone — no promotional language · value first · r/easyChefPro and u/easyChef_Pro','post']
  ];

  var lastRow       = sheet.getLastRow();
  var existingNames = lastRow >= 2 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues() : [];

  fullSeed.forEach(function(seedRow) {
    var foundRowIndex = -1;
    for (var i = 0; i < existingNames.length; i++) {
      if (String(existingNames[i][0]).toLowerCase() === seedRow[0].toLowerCase()) {
        foundRowIndex = i + 2;
        break;
      }
    }
    var rng = foundRowIndex > -1
      ? sheet.getRange(foundRowIndex, 1, 1, newHeaders.length)
      : sheet.getRange(sheet.getLastRow() + 1, 1, 1, newHeaders.length);
    rng.setNumberFormat('@');
    rng.setValues([seedRow]);
  });

  Logger.log('Channels tab migrated: ' + fullSeed.length + ' rows, ' + newHeaders.length + ' columns.');
  try { SpreadsheetApp.getUi().alert('Channels tab migrated — ' + fullSeed.length + ' rows updated.'); } catch(e) {}
}

// ── CampaignTypes ─────────────────────────────────────────────────────────────

function _ctRowToObj(r) {
  return {
    id:                   r[0]  || '',
    cta_type:             r[1]  || '',
    label:                r[2]  || '',
    cta_text:             r[3]  || '',
    destination_url:      r[4]  || '',
    destination_label:    r[5]  || '',
    loss_aversion:        r[6]  || '',
    phase:                r[7]  || '',
    active:               r[8] === true || String(r[8]).toLowerCase() === 'true',
    detection_keywords:   r[9]  || '',
    email_subject_angle:  r[10] || '',
    social_hook_angle:    r[11] || '',
    created_at:           _ccFmtDate(r[12]),
    notes:                r[13] || ''
  };
}

function getCampaignTypes(activeOnly) {
  var sheet = _getCCSheet(_CC_TAB.CAMPAIGN_TYPES);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.CampaignTypes.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_ctRowToObj);
  if (activeOnly === false) return rows;
  return rows.filter(function(t) { return t.active; });
}

function getCampaignType(ctaType) {
  if (!ctaType) return null;
  var q = String(ctaType).toLowerCase().trim();
  var types = getCampaignTypes(false);
  for (var i = 0; i < types.length; i++) {
    if (String(types[i].cta_type).toLowerCase() === q) return types[i];
  }
  return null;
}

// ── FunnelStages ──────────────────────────────────────────────────────────────

function _fsRowToObj(r) {
  return {
    id:               r[0]  || '',
    stage_name:       r[1]  || '',
    stage_order:      parseInt(r[2])  || 0,
    social_day:       parseInt(r[3])  || 0,
    email_day:        parseInt(r[4])  || 0,
    seq_offset_days:  parseInt(r[5])  || 0,
    post_template:    r[6]  || '',
    email_theme:      r[7]  || '',
    social_theme:     r[8]  || '',
    pair_id_prefix:   r[9]  || '',
    loss_aversion_note: r[10] || '',
    created_at:       _ccFmtDate(r[11]),
    notes:            r[12] || ''
  };
}

function getFunnelStages() {
  var sheet = _getCCSheet(_CC_TAB.FUNNEL_STAGES);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, _CC_HDR.FunnelStages.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_fsRowToObj)
    .sort(function(a, b) { return a.stage_order - b.stage_order; });
}

function getFunnelStage(stageName) {
  if (!stageName) return null;
  var q = String(stageName).toLowerCase().trim();
  var stages = getFunnelStages();
  for (var i = 0; i < stages.length; i++) {
    if (stages[i].stage_name.toLowerCase() === q) return stages[i];
  }
  return null;
}

// ── getEmailWireframe ─────────────────────────────────────────────────────────
// Returns EmailSequences rows where campaign_id === 'TEMPLATE'.
// These are wireframe definitions, not generated output.

function getEmailWireframe() {
  var sheet = _getCCSheet(_CC_TAB.EMAIL);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, _CC_HDR.EmailSequences.length).getValues()
    .filter(function(r) { return r[0] && String(r[1]) === 'TEMPLATE'; })
    .map(_seqRowToObj);
}

function _addMissingChannels() {
  var now = _ccNow();
  var missing = [
    ['YouTube','yt','video','youtube','SOC','active','','','','false','0','0','','1920x1080px','16:9','Link in description — pin comment with link','Video content — hook in first 30 seconds · description SEO optimised','video_script'],
    ['X','x','social','x','SOC','active','','280','280','false','0','0','','1200x675px','16:9','Paste URL directly in post','Max 280 chars — no hashtags needed for organic · link reduces reach so add in reply','post'],
    ['Reddit','reddit','community','reddit','SOC','active','','','','false','0','0','','','','Link in post or comment','Community tone — no promotional language · value first · r/easyChefPro and u/easyChef_Pro','post'],
    ['Vimeo','vimeo','video','vimeo','SOC','active','','','','false','0','0','','1920x1080px','16:9','Link in description','Video content — same rules as YouTube','video_script']
  ];
  missing.forEach(function(row) {
    setChannel({
      name: row[0], slug_code: row[1], utm_medium: row[2],
      utm_source: row[3], dl_prefix: row[4], status: row[5],
      notes: row[6], optimal_chars: row[7], max_chars: row[8],
      use_hashtags: row[9], hashtag_count_min: row[10],
      hashtag_count_max: row[11], hashtag_suggestions: row[12],
      image_dimensions: row[13], image_ratio: row[14],
      link_placement: row[15], platform_note: row[16],
      content_format: row[17]
    });
  });
  Logger.log('Done — added ' + missing.length + ' channels');
}

// ── BlueprintConfig ───────────────────────────────────────────────────────────

function _bpRowToObj(r) {
  return {
    id:               String(r[0]),
    blueprint_code:   String(r[1]),
    blueprint_name:   String(r[2]),
    sequences_included: String(r[3]),
    email_count:      Number(r[4]),
    social_post_count:Number(r[5]),
    cta_type_default: String(r[6]),
    phase:            String(r[7]),
    active:           r[8] === true || String(r[8]).toLowerCase() === 'true',
    description:      String(r[9])
  };
}

function getBlueprintConfigs() {
  var sheet = _getCCSheet(_CC_TAB.BLUEPRINTS);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, _CC_HDR.BlueprintConfig.length)
    .getValues()
    .filter(function(r) { return r[0]; })
    .map(_bpRowToObj);
}

// ── Diagnostic — run from Apps Script editor to verify all sheet tabs ─────────

function _testSheetWiring() {
  Logger.log('CampaignTypes: '    + getCampaignTypes().length    + ' rows');
  Logger.log('FunnelStages: '     + getFunnelStages().length     + ' rows');
  Logger.log('BlueprintConfigs: ' + getBlueprintConfigs().length + ' rows');
  Logger.log('ICPProfiles: '      + getIcpProfiles().length      + ' rows');
  Logger.log('ApprovedClaims: '   + getApprovedClaims().length   + ' rows');
  Logger.log('Channels: '         + getChannels().length         + ' rows');
}

// clasp auto-deploy verified — May 2026