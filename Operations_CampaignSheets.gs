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
  BLUEPRINTS:     'BlueprintConfig',
  PUSH_NOTIFS:    'PushNotifications',
  CONTENT_CAL:    'ContentCalendar',
  METRICS:        'CampaignMetrics',
  SCHEDULED:      'ScheduledPosts',
  LP_INVENTORY:   'LPInventory',
  THEME_LIBRARY:  'ThemeLibrary',
  SETTINGS:       'CcSettings',
  BRAND_DOCTRINE:       'BrandDoctrine',
  CAMP_STRATEGY:        'CampaignStrategy',
  ASSET_LIFECYCLE:      'AssetLifecycle',
  VIDEO_PRODUCTION:     'VideoProduction',
  VIDEO_IDEA_BANK:      'VideoIdeaBank',
  LIFE_STAGES:          'LifeStages',
  MILESTONES:           'Milestones',
  ALPHA_Q:              'AlphaQuestionnaire',
  ALPHA_FB:             'AlphaFeedback',
  WAITLIST:             'WaitlistSignups',
  MASTER_POSITIONING:   'MasterPositioning',
  STAGE_GATES:          'StageGates',
  RETENTION_MILESTONES: 'RetentionMilestones'
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
    'post_count','post_frequency','email_sequences','email_variants',
    'theme','publish_day','channels',
    'ab_test','ab_tool','ab_split','lp_slug_a','lp_slug_b','ab_experiment_id',
    'campaign_angle','urgency_trigger',
    'lp_campaign_spine_json'
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
    'created_at','activated_at','created_by','notes',
    'icp_code','lp_variant','emotional_arc_id'
  ],
  EmailSequences: [
    'id','campaign_id','sequence_code','email_number','subject_line',
    'preview_text','body_hook','body_problem','body_agitate','body_solve',
    'body_value','body_proof','body_cta','send_day','trigger_event',
    'status','approved','approved_by','built_in_klaviyo','klaviyo_id',
    'funnel_stage','subject_angle','body_theme','role','seq_template_id',
    'design_brief',
    'lp_section_source','emotional_stage','claim_set','loop_stage','dl_id',
    'claude_design_url','full_email_body',
    'icp_code','segment','target_word_count',
    'positioning_id','positioning_version','stage_number','variant','world',
    'generated_by','approved_by_ml','approved_at','klaviyo_flow_id','sent_at',
    'open_rate_actual','ctr_actual'
  ],
  CampaignTypes: [
    'id','cta_type','label','cta_text','destination_url','destination_label',
    'loss_aversion','phase','active','detection_keywords',
    'email_subject_angle','social_hook_angle','created_at','notes'
  ],
  FunnelStages: [
    'id','stage_name','stage_order','social_day','email_day','seq_offset_days',
    'post_template','email_theme','social_theme','pair_id_prefix',
    'loss_aversion_note','created_at','notes','start_date'
  ],
  SocialPosts: [
    'id','campaign_id','platform','hook','body_copy','cta','hashtags',
    'image_brief','image_url','scheduled_date','scheduled_time','status','dl_id','utm_url','posted_url',
    'design_brief',
    'lp_section_source','lp_headline_connection','emotional_state','emotional_destination','loop_stage',
    'claude_design_url',
    'positioning_id','positioning_version','stage_number','persona','emotion',
    'generated_by','optimised_by','rendered_by','brief_version','figma_owner',
    'deploy_url','approved_by','approved_at'
  ],
  LandingPages: [
    'id','campaign_id','icp_code','slug','full_url','title_tag','meta_description',
    'og_title','og_description','hero_headline','hero_subheadline',
    'section_problem','section_agitate','section_solve','section_value',
    'section_proof','section_cta','tracking_convert','tracking_clarity',
    'tracking_ga4','status','dev_built','qa_passed','pushed_to_production',
    'campaign_type','blueprint_code','icp_codes','theme','publish_day',
    'ab_test_variant','convert_experiment_id','shared_by_campaigns',
    'last_traffic_date','total_signups','claude_design_url'
  ],
  LPInventory: [
    'id','slug','full_url','campaign_type','blueprint_code','icp_codes',
    'campaign_angle','lp_variant','headline','cta_primary','proof_bar',
    'status','dev_built','convert_installed','clarity_installed','ga4_installed',
    'campaigns_using','total_signups','conversion_rate',
    'created_at','last_updated','notes',
    'urgency_type','urgency_line','urgency_placement',
    'exclusivity_angle','exclusivity_line',
    'meta_title','meta_description','og_title','og_description','canonical_url','focus_keyword',
    'page_type','thank_you_url',
    'hero_subheadline',
    'section_problem','section_agitate','section_solve','section_value','section_proof','section_cta',
    'section_hook','section_lifecycle',
    'tracking_convert_id','tracking_clarity_id','tracking_ga4_id',
    'qa_passed','pushed_to_production',
    'convert_experiment_id','shared_by_campaigns','last_traffic_date'
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
    'phase','active','description',
    'pre_launch_date','launch_date','alpha_start','beta_start'
  ],
  PushNotifications: [
    'id','campaign_id','push_number','title','body','deep_link_url',
    'funnel_stage','scheduled_date','platform','status',
    'sent_at','open_rate','created_at'
  ],
  ContentCalendar: [
    'calendar_id','asset_id','campaign_id','platform','account',
    'publish_date','publish_time','timezone',
    'status','approval_status','creative_status',
    'caption','hashtags',
    'dl_id','utm_url','figma_export_url','final_asset_url',
    'publisher','scheduled_url','published_url','notes',
    'day','week','funnel_stage','emotional_stage','icp_target','experiment_id','blocked_by',
    'created_at','updated_at','brief_doc_url','claude_design_url','sequence_code'
  ],
  CampaignMetrics: [
    'id','campaign_id','week_number','report_date','channel',
    'reach','engagement_rate','link_clicks','signups',
    'cost_per_signup','top_performing_post','notes','created_at'
  ],
  ScheduledPosts: [
    'id','campaign_id','social_post_id','channel','scheduled_date',
    'scheduled_time','status','posted_url','posted_at',
    'scheduling_tool','created_at'
  ],
  ThemeLibrary: [
    'id','icp_code','theme_name','theme_slug',
    'category','emotional_entry','emotional_payoff',
    'hook_angle','problem_angle','agitate_angle',
    'food_type','publish_day','post_count',
    'blueprint_code','campaign_angle',
    'urgency_trigger','image_mood_hook',
    'image_mood_cta','active','notes',
    'app_feature','app_screen_label','feature_hook','feature_proof',
    'persona_rotation'
  ],
  CcSettings:       ['section','key','label','extra','active'],
  BrandDoctrine:    ['rule_id','rule_type','enforcement','active','conditions_json'],
  CampaignStrategy: ['strategy_id','strategy_type','active','value_json'],
  AssetLifecycle: [
    'asset_id','campaign_id','platform',
    'figma_file_id','figma_page','figma_frame','designer',
    'status','approved_by','export_url','publish_date',
    'created_at','updated_at'
  ],
  VideoProduction: [
    'asset_id','campaign_id','platform','video_type','duration_target',
    'hook','script_status',
    'storyboard_status','storyboard_url',
    'ai_tool','ai_gen_status','video_url',
    'edit_status','thumbnail_status',
    'brief','publish_date','published_url','notes',
    'created_at','updated_at',
    'lp_section_source','recognition_moment','product_reveal_timing','visual_metaphor'
  ],
  VideoIdeaBank: [
    'idea_id','campaign_id','title','feature','icp_target','pain_mapped',
    'emotional_state','comedy_style','visual_metaphor',
    'comedy_premise',
    'sq_1','sq_2','sq_3','sq_4','sq_5','sq_6',
    'comedy_peak','hold_beat_note',
    'arc_1','arc_2','arc_3','arc_4',
    'opening_hook','cta_line','audio_direction',
    'platform','duration_target',
    'status','video_asset_id','notes',
    'created_at','updated_at'
  ],
  LifeStages: [
    'life_stage_id','current_chapter','next_chapter',
    'stage_recognition_line','next_stage_bridge','adaptation_copy','active'
  ],
  Milestones: [
    'id','campaign_id','title','date','type','color','created_at','created_by'
  ],
  AlphaQuestionnaire: [
    'id','submitted_at','first_name','email',
    'stores','walmart_shopper',
    'b1_cooks_home','b2_dinner_struggle','b3_takeout','b4_waste_groceries',
    'b5_meal_plan','b6_fridge_confusion','b7_cooks_for_kids','b8_dietary_restrictions',
    'dietary_details',
    'c1_budget_priority','c2_smartphone_lists','c3_meal_planning_app','c4_pantry_app',
    'c5_busy_parent','c6_food_waste_money','c7_try_new_app',
    'd_comments',
    'priority_candidate','status'
  ],
  AlphaFeedback: [
    'id','submitted_at','first_name','email',
    'q1_tasks_completed',
    'q1_task_onboarding','q1_task_add_pantry','q1_task_create_recipe','q1_task_shopping_cart',
    'q2_confusing',
    'q3_useful',
    'q4_recommend','q4_recommend_why',
    'q5_fix_before_launch',
    'status'
  ],
  WaitlistSignups: [
    'id','submitted_at','email','lp_variant','lp_slug','campaign_id',
    'utm_source','utm_medium','utm_campaign','referrer','status'
  ],
  MasterPositioning: [
    'positioning_id','campaign_id','icp_code',
    'theme_slug','theme_name','version','status',
    'approved_by','approved_at','locked',
    'who_she_is','what_she_wants','core_problem',
    'core_truth','master_story','supporting_truth',
    'what_we_say','why_she_believes_it',
    'proof_point','feeling_sold',
    'primary_objection','objection_answer',
    'emotional_arc',
    'stage_1_awareness_job',
    'stage_2_education_job',
    'stage_3_consideration_job',
    'stage_4_conversion_job',
    'stage_5_retention_job',
    'lp_angle','cta_language',
    'approved_claims_ref',
    'created_at','updated_at','notes'
  ],
  StageGates: [
    'gate_id','campaign_id','positioning_id',
    'stage_number','stage_name','emotional_job',
    'weeks','date_start','date_end',
    'metric_1_name','metric_1_target','metric_1_actual',
    'metric_2_name','metric_2_target','metric_2_actual',
    'metric_3_name','metric_3_target','metric_3_actual',
    'gate_status','reviewed_by','reviewed_at','decision',
    'unlock_event','unlock_actions',
    'social_posts','email_assets','persona_rotation',
    'notes','created_at','updated_at'
  ],
  RetentionMilestones: [
    'milestone_id','campaign_id','positioning_id',
    'milestone_number','milestone_name',
    'firebase_trigger_event','description',
    'target_rate','amber_rate','red_rate',
    'target_day','email_trigger','push_trigger',
    'success_action','failure_action',
    'conditions','actual_rate','status','notes'
  ]
};

// ── Spreadsheet access ────────────────────────────────────────────────────────

// Set by getCampaignCalendar / getCampaignDashboard / getCampaignMilestones
// to route all sheet reads to a specific account's sheet for that call.
var _REQUEST_SHEET_ID = null;

function _getCampaignSpreadsheet() {
  if (_REQUEST_SHEET_ID) {
    try { return SpreadsheetApp.openById(_REQUEST_SHEET_ID); } catch (e) {}
  }
  var props = PropertiesService.getScriptProperties();
  var ssId  = props.getProperty(_CC_SS_ID_KEY);
  if (ssId) {
    try { return SpreadsheetApp.openById(ssId); } catch (e) {}
  }
  var ss = SpreadsheetApp.create(_CC_SS_NAME);
  props.setProperty(_CC_SS_ID_KEY, ss.getId());
  return ss;
}

// ── Account Registry (ScriptProperties key: ACCOUNTS_REGISTRY) ───────────────
// Registry is a JSON array: [{id, name, sheet_id, status, created_at}, ...]

var _ACCOUNTS_REG_KEY = 'ACCOUNTS_REGISTRY';

function getAccounts() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(_ACCOUNTS_REG_KEY);
    var accounts = raw ? JSON.parse(raw) : [];
    return { ok: true, accounts: accounts };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function registerAccount(id, name, sheetId, status) {
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty(_ACCOUNTS_REG_KEY);
    var accounts = raw ? JSON.parse(raw) : [];
    var idx = accounts.findIndex(function(a) { return a.id === id; });
    var entry = { id: id, name: name, sheet_id: sheetId, status: status || 'active', created_at: new Date().toISOString() };
    if (idx >= 0) { accounts[idx] = entry; } else { accounts.push(entry); }
    props.setProperty(_ACCOUNTS_REG_KEY, JSON.stringify(accounts));
    return { ok: true, account: entry };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function deregisterAccount(id) {
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty(_ACCOUNTS_REG_KEY);
    var accounts = raw ? JSON.parse(raw) : [];
    accounts = accounts.filter(function(a) { return a.id !== id; });
    props.setProperty(_ACCOUNTS_REG_KEY, JSON.stringify(accounts));
    return { ok: true, removed: id };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ── Template Registry (ScriptProperties key: TEMPLATES_REGISTRY) ─────────────
// Registry is a JSON array: [{id, name, type, file_id, description, status, created_at}]
// type: 'account' | 'campaign'
// Adding a template = registerTemplate() call — no code changes ever.

var _TEMPLATES_REG_KEY = 'TEMPLATES_REGISTRY';

function getTemplates(type) {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(_TEMPLATES_REG_KEY);
    var templates = raw ? JSON.parse(raw) : [];
    if (type) templates = templates.filter(function(t) { return t.type === type; });
    return { ok: true, templates: templates };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function registerTemplate(id, name, type, fileId, description, status) {
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty(_TEMPLATES_REG_KEY);
    var templates = raw ? JSON.parse(raw) : [];
    var idx = templates.findIndex(function(t) { return t.id === id; });
    var entry = { id: id, name: name, type: type || 'account', file_id: fileId, description: description || '', status: status || 'active', created_at: new Date().toISOString() };
    if (idx >= 0) { templates[idx] = entry; } else { templates.push(entry); }
    props.setProperty(_TEMPLATES_REG_KEY, JSON.stringify(templates));
    return { ok: true, template: entry };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function deregisterTemplate(id) {
  try {
    var props = PropertiesService.getScriptProperties();
    var raw = props.getProperty(_TEMPLATES_REG_KEY);
    var templates = raw ? JSON.parse(raw) : [];
    templates = templates.filter(function(t) { return t.id !== id; });
    props.setProperty(_TEMPLATES_REG_KEY, JSON.stringify(templates));
    return { ok: true, removed: id };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ── Account Template ──────────────────────────────────────────────────────────
// Tabs whose data rows are cleared when creating a template (structure kept).
var _TEMPLATE_DATA_TABS = [
  'ContentCalendar','SocialPosts','EmailSequences','DeepLinkRegistry',
  'CampaignBriefs','GeneratedCopy','LandingPages','CampaignMetrics',
  'ScheduledPosts','LPInventory','Milestones','VideoProduction','VideoIdeaBank'
];

function createAccountTemplate() {
  try {
    var ss     = _getCampaignSpreadsheet();
    var ssFile = DriveApp.getFileById(ss.getId());
    var copy   = ssFile.makeCopy('easyChef Pro — Account Template');
    var tplSs  = SpreadsheetApp.openById(copy.getId());

    _TEMPLATE_DATA_TABS.forEach(function(tabName) {
      var sheet = tplSs.getSheetByName(tabName);
      if (sheet && sheet.getLastRow() > 1) {
        var numRows = sheet.getLastRow() - 1;
        var numCols = sheet.getLastColumn() || 1;
        sheet.getRange(2, 1, numRows, numCols).clearContent();
      }
    });

    var fileId = copy.getId();
    var result = registerTemplate('acct-default', 'Default Account', 'account', fileId, 'Blank account structure — all tabs, headers only, no data', 'active');
    return { ok: result.ok, template: result.template, error: result.error };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function cloneAccount(newName, newId, templateId) {
  try {
    // If no templateId provided, use first active account template from registry
    if (!templateId) {
      var tplResult = getTemplates('account');
      var active = (tplResult.templates || []).filter(function(t) { return t.status === 'active'; });
      if (!active.length) return { ok: false, error: 'No account templates in registry — run create_account_template first' };
      templateId = active[0].file_id;
    }
    var tplFile    = DriveApp.getFileById(templateId);
    var newFile    = tplFile.makeCopy(newName + ' — Campaign Center');
    var newSheetId = newFile.getId();
    var accountId  = newId || ('AC-' + newName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8) + '-' + new Date().getFullYear());
    var result = registerAccount(accountId, newName, newSheetId, 'active');
    return { ok: result.ok, account: result.account, error: result.error };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ── Account Setup Check ───────────────────────────────────────────────────────
// Checks whether the five required data sets are populated in an account sheet.
// "Complete" = the tab exists and has at least one data row.
// Nothing is hardcoded — tab names come from _CC_TAB, no field names referenced.

function checkAccountSetup(sheetId) {
  _REQUEST_SHEET_ID = sheetId || null;
  try {
    var ss   = _getCampaignSpreadsheet();
    var ssId = ss.getId();
    var REQUIRED = [
      { key: 'branding',     tab: _CC_TAB.BRAND_DOCTRINE, label: 'Branding' },
      { key: 'icp_profiles', tab: _CC_TAB.ICP,            label: 'ICP Profiles' },
      { key: 'claims',       tab: _CC_TAB.CLAIMS,         label: 'Claims' },
      { key: 'milestones',   tab: _CC_TAB.MILESTONES,     label: 'Milestones' },
      { key: 'life_stages',  tab: _CC_TAB.LIFE_STAGES,    label: 'Life Stages' }
    ];
    var checks = [];
    var allComplete = true;
    REQUIRED.forEach(function(req) {
      var sheet = ss.getSheetByName(req.tab);
      var gid = sheet ? sheet.getSheetId() : null;
      var complete = !!(sheet && sheet.getLastRow() > 1);
      checks.push({ key: req.key, label: req.label, tab: req.tab, complete: complete, gid: gid });
      if (!complete) allComplete = false;
    });
    return { ok: true, all_complete: allComplete, sheet_id: ssId, checks: checks };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
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

// ── Purge orphan rows — removes rows with blank campaign_id ──────────────────
// Targets SocialPosts, EmailSequences, DeepLinkRegistry.
// Keeps any row that has a non-blank campaign_id value.
// Safe to run — only deletes rows the seed never claims.
function purgeOrphanRows() {
  return purgeForeignCampaignData('EC-2026-001');
}

// ── Remove all rows not belonging to keepCampaignId from every tab ────────────
// Skips config/reference tabs (no campaign_id column). Safe to re-run.
function purgeForeignCampaignData(keepCampaignId) {
  if (!keepCampaignId) return { ok: false, error: 'keepCampaignId required' };

  // Tabs that store campaign-specific rows keyed by campaign_id
  var targets = [
    { name: _CC_TAB.SOCIAL,      hdr: _CC_HDR.SocialPosts        },
    { name: _CC_TAB.EMAIL,       hdr: _CC_HDR.EmailSequences      },
    { name: _CC_TAB.DL,          hdr: _CC_HDR.DeepLinkRegistry    },
    { name: _CC_TAB.CONTENT_CAL, hdr: _CC_HDR.ContentCalendar     },
    { name: _CC_TAB.ASSET_LIFECYCLE, hdr: _CC_HDR.AssetLifecycle  },
    { name: _CC_TAB.BRIEFS,      hdr: _CC_HDR.CampaignBriefs      },
    { name: _CC_TAB.COPY,        hdr: _CC_HDR.GeneratedCopy       },
    { name: _CC_TAB.PUSH_NOTIFS, hdr: _CC_HDR.PushNotifications   },
    { name: _CC_TAB.METRICS,     hdr: _CC_HDR.CampaignMetrics     },
    { name: _CC_TAB.SCHEDULED,   hdr: _CC_HDR.ScheduledPosts      },
    { name: _CC_TAB.PAGES,       hdr: _CC_HDR.LandingPages        }
  ];

  var summary = [];

  targets.forEach(function(t) {
    try {
      var sheet   = _getCCSheet(t.name);
      var lastRow = sheet.getLastRow();
      if (lastRow < 2) { summary.push(t.name + ': empty — skipped'); return; }

      var cidIdx = t.hdr.indexOf('campaign_id');
      if (cidIdx < 0) { summary.push(t.name + ': no campaign_id col — skipped'); return; }

      var colCount = sheet.getLastColumn();
      var readCols = Math.max(t.hdr.length, colCount);
      var data     = sheet.getRange(2, 1, lastRow - 1, readCols).getValues();
      var hdrRow   = sheet.getRange(1, 1, 1, readCols).getValues()[0];

      var kept    = [hdrRow];
      var removed = 0;

      data.forEach(function(row) {
        var cid = String(row[cidIdx] || '').trim();
        // Keep if matches target campaign OR if campaign_id is blank (config row)
        if (cid === keepCampaignId || cid === '') {
          kept.push(row);
        } else {
          removed++;
        }
      });

      if (removed === 0) {
        summary.push(t.name + ': nothing to remove');
        return;
      }

      sheet.clearContents();
      sheet.getRange(1, 1, kept.length, readCols).setValues(kept);
      summary.push(t.name + ': removed ' + removed + ' · kept ' + (kept.length - 1));
    } catch(e) {
      summary.push(t.name + ': ERROR — ' + e.message);
    }
  });

  Logger.log('[purgeForeignCampaignData] keep=' + keepCampaignId + ' · ' + summary.join(' | '));
  return { ok: true, kept_campaign: keepCampaignId, summary: summary };
}

// ── Repair header rows for existing tabs — safe to run at any time ────────────
// Rewrites row 1 of each tab to match the current _CC_HDR definition.
// Does NOT touch data rows. Adds blank columns if new fields were added.
// Pass tabs:["LPInventory","ContentCalendar"] to target specific tabs,
// or omit to repair all tabs in _CC_HDR.
function repairSheetHeaders(tabs) {
  var ss      = _getCampaignSpreadsheet();
  var targets = tabs && tabs.length ? tabs : Object.keys(_CC_HDR);
  var results = [];
  var errors  = [];

  targets.forEach(function(tabName) {
    var headers = _CC_HDR[tabName];
    if (!headers || !headers.length) { errors.push(tabName + ': no header defined'); return; }

    var sheet = ss.getSheetByName(tabName);
    if (!sheet) { errors.push(tabName + ': tab not found in sheet'); return; }

    var existingHdrCount = sheet.getLastColumn();
    var newHdrCount      = headers.length;

    // Write the full header row (overwrites existing header)
    _ccHdrStyle(sheet, headers);

    // If we added columns, fill the new header cells for existing data rows
    // (data is already there from upserts — just the label row needed fixing)
    results.push(tabName + ': ' + newHdrCount + ' columns' +
      (newHdrCount > existingHdrCount ? ' (+' + (newHdrCount - existingHdrCount) + ' new)' : ' (no change)'));
  });

  Logger.log('[repairSheetHeaders] ' + results.concat(errors).join(' | '));
  return { ok: true, repaired: results, errors: errors };
}

function _ccNow() { return new Date().toISOString(); }

function _ccFmtDate(v) {
  if (!v) return '';
  if (v instanceof Date) return Utilities.formatDate(v, 'UTC', 'yyyy-MM-dd');
  var s = String(v);
  if (s.indexOf('T') !== -1) return s.split('T')[0]; // strip time from ISO timestamps
  return s;
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

  _seedICPProfiles(ss.getSheetByName(_CC_TAB.ICP));
  _seedApprovedClaims(ss.getSheetByName(_CC_TAB.CLAIMS));
  _seedDeepLinkRegistry(ss.getSheetByName(_CC_TAB.DL));
  _seedChannels(ss.getSheetByName(_CC_TAB.CHANNELS));
  _seedCampaignTypes(ss.getSheetByName(_CC_TAB.CAMPAIGN_TYPES));
  _seedFunnelStages(ss.getSheetByName(_CC_TAB.FUNNEL_STAGES));
  _seedBlueprintConfig(ss.getSheetByName(_CC_TAB.BLUEPRINTS));

  // Ensure newer tabs exist (idempotent — safe to run multiple times)
  [_CC_TAB.PUSH_NOTIFS, _CC_TAB.CONTENT_CAL, _CC_TAB.METRICS, _CC_TAB.SCHEDULED, _CC_TAB.LP_INVENTORY].forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    _ccHdrStyle(sheet, _CC_HDR[name]);
  });
  _seedLPInventory(ss.getSheetByName(_CC_TAB.LP_INVENTORY));
  _seedLandingPages(ss.getSheetByName(_CC_TAB.PAGES));
  _seedCcSettings(ss.getSheetByName(_CC_TAB.SETTINGS));

  // Governance tabs
  [_CC_TAB.BRAND_DOCTRINE, _CC_TAB.CAMP_STRATEGY].forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    _ccHdrStyle(sheet, _CC_HDR[name]);
  });
  _seedBrandDoctrine(ss.getSheetByName(_CC_TAB.BRAND_DOCTRINE));
  _seedCampaignStrategy(ss.getSheetByName(_CC_TAB.CAMP_STRATEGY));

  Logger.log('Campaign Center ready: ' + ss.getUrl());
  try { SpreadsheetApp.getUi().alert('Campaign Center created.\n\n' + ss.getUrl()); } catch(e) {}
  return ss.getUrl();
}

// ── Idempotent seed functions ─────────────────────────────────────────────────

function _seedICPProfiles(sheet) {
  if (!sheet) return;
  var existing = sheet.getDataRange().getValues().slice(1).map(function(r) { return r[0]; });
  var now = _ccNow();
  [
    ['super_mom',       'Super Mom',           'super_mom',       'Active',                '','','','','','','','','','','',false,'',now,now],
    ['budget_family',   'Budget Family',        'budget_family',   'Pending Validation',    '','','','','','','','','','','',false,'',now,now],
    ['health_optimizer','Health Optimizer',     'health_optimizer','Pending Validation',    '','','','','','','','','','','',false,'',now,now],
    ['professional',    'Working Professional', 'professional',    'Pending Validation',    '','','','','','','','','','','',false,'',now,now],
    ['alpha_recruit',   'Alpha Recruit',        'alpha_recruit',   'Active',                '','','','','','','','','','','',false,'',now,now]
  ].forEach(function(row) {
    if (existing.indexOf(row[0]) === -1) sheet.appendRow(row);
  });
}

function _seedApprovedClaims(sheet) {
  if (!sheet) return;
  _ccHdrStyle(sheet, _CC_HDR.ApprovedClaims);
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
  var rows = [
    // ACTIVE
    ['annual_savings',         'savings',      '$1,336/year average savings — never say $1,500',                                                                              'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['monthly_savings',        'savings',      'Families save an average of $111 a month — that is $1,336 a year',                                                            'ACTIVE',       'Taylor','2026-05-09','Derived from annual_savings'],
    ['roi_standard',           'roi',          'easyChef Pro costs $20 a month. Families save an average of $111. The app pays for itself — five times over.',                'ACTIVE',       'Taylor','2026-05-09','Standard price ROI'],
    ['roi_founding',           'roi',          'At founding price easyChef Pro is $8 a month. Families save an average of $111. That is over $100 back every month.',         'ACTIVE',       'Taylor','2026-05-09','Founding price ROI — retire at 5,000 families'],
    ['food_waste',             'waste',        '69.5% less food waste — never say 70%',                                                                                       'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['fridge_to_table',        'speed',        '30 minutes fridge to table',                                                                                                  'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['database',               'product',      '800,000 products in our database',                                                                                            'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['dietitians',             'credibility',  'Registered dietitians — the word registered is always required',                                                              'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['profiles',               'validation',   'Validated across 10,000 household profiles',                                                                                  'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['recipes',                'product',      '10,000 recipe pages at launch',                                                                                               'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['kitchen_in_command',     'positioning',  'Your kitchen in command',                                                                                                     'ACTIVE',       'Taylor','2026-05-03','Brand tagline — locked'],
    ['origin',                 'brand',        'Built by first responders',                                                                                                   'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['origin_full',            'brand',        'Built by firefighters and paramedics',                                                                                        'ACTIVE',       'Taylor','2026-05-03','Full version of origin claim'],
    ['technologies',           'product',      '9 patent-pending technologies — never say 9 patents',                                                                         'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['founding_price',         'pricing',      '$7.99 per month founding price',                                                                                              'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['founding_discount',      'pricing',      '60% off — never say 50% off',                                                                                                'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['standard_price',         'pricing',      '$19.99 per month',                                                                                                           'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['annual_price',           'pricing',      '$191.88 per year — $15.99 per month',                                                                                        'ACTIVE',       'Taylor','2026-05-03','Core approved claim'],
    ['reddit_tone',            'channel_rule', 'Reddit: community-first tone — never direct promotion',                                                                      'ACTIVE',       'Taylor','2026-05-05','Channel rule'],
    // PENDING
    ['waste_equals_money',     'savings',      'The average family throws away $111 in groceries every single month — easyChef Pro closes that leak',                         'PENDING',      'Taylor','','Ties savings to waste'],
    ['grocery_bill',           'savings',      'Your grocery bill goes down because your shopping list only includes what you actually need',                                  'PENDING',      'Taylor','',''],
    ['no_overbuy',             'savings',      'Never buy what you already have — easyChef Pro checks your kitchen before it builds your list',                               'PENDING',      'Taylor','',''],
    ['spoilage_prevention',    'waste',        'easyChef Pro plans meals around what is about to expire — food gets used before it goes bad',                                 'PENDING',      'Taylor','',''],
    ['nothing_forgotten',      'waste',        'Nothing gets forgotten at the back of the fridge anymore',                                                                    'PENDING',      'Taylor','',''],
    ['use_what_you_have',      'waste',        'Every meal plan starts with what you already own — not what you need to buy',                                                 'PENDING',      'Taylor','',''],
    ['fridge_awareness',       'waste',        'easyChef Pro knows what is in your fridge before you open it',                                                               'PENDING',      'Taylor','',''],
    ['dinner_decided',         'speed',        'Dinner is already decided before you open the fridge',                                                                        'PENDING',      'Taylor','',''],
    ['no_decision_wall',       'speed',        'No more standing at the fridge at 6:30 PM wondering what to make',                                                           'PENDING',      'Taylor','','Super mom anchor moment'],
    ['faster_than_takeout',    'speed',        'Getting dinner on the table is faster than ordering it',                                                                      'PENDING',      'Taylor','',''],
    ['sunday_reset',           'speed',        'Plan the whole week in one sitting — Sunday sorted every other night handled',                                                'PENDING',      'Taylor','',''],
    ['grocery_scanning_free',  'product',      'Scanning your groceries into your pantry is always free — no subscription needed to get started',                            'PENDING',      'Taylor','','Addresses MFP #1 complaint'],
    ['photo_recognition',      'product',      'Take a photo of any food or meal — easyChef Pro finds it in our verified database and gives you a recipe built on facts not guesswork', 'PENDING', 'Taylor','','Confirmed capability'],
    ['receipt_scan',           'product',      'Scan your grocery receipt and your pantry updates itself automatically',                                                      'PENDING',      'Taylor','',''],
    ['auto_pantry_update',     'product',      'Your pantry updates every time you cook a meal or groceries arrive',                                                          'PENDING',      'Taylor','',''],
    ['expiry_tracking',        'product',      'easyChef Pro tracks expiry dates so food gets used before it goes bad',                                                       'PENDING',      'Taylor','',''],
    ['knows_your_kitchen',     'product',      'easyChef Pro always knows what is in your kitchen — you never have to check',                                                 'PENDING',      'Taylor','',''],
    ['no_food_logging',        'product',      'Your pantry updates itself — no daily food logging required',                                                                 'PENDING',      'Taylor','','Addresses MFP #3 complaint'],
    ['three_ingredients',      'product',      'Tell easyChef Pro three things in your fridge and it shows you tonight\'s dinner',                                            'PENDING',      'Taylor','','Onboarding hook'],
    ['setup_time',             'product',      'Your kitchen is set up and running in under 10 minutes',                                                                      'PENDING',      'Taylor','',''],
    ['weekly_meal_plan',       'product',      'A full week of dinners planned around what you already have in your kitchen',                                                 'PENDING',      'Taylor','',''],
    ['pantry_first_planning',  'product',      'Your meal plan is built from your fridge and pantry first — shopping comes after',                                            'PENDING',      'Taylor','',''],
    ['schedule_aware',         'product',      'easyChef Pro knows your busy nights — shorter prep times when you need them',                                                 'PENDING',      'Taylor','','Experience page anchor'],
    ['adaptive_planning',      'product',      'Your meal plan adapts to your week — not the other way around',                                                               'PENDING',      'Taylor','',''],
    ['no_repeat_meals',        'product',      'easyChef Pro remembers what your family has eaten recently — no repetitive dinners',                                          'PENDING',      'Taylor','',''],
    ['comfort_food',           'product',      'Still makes room for the comfort food nights — easyChef Pro plans around real life not a perfect diet',                       'PENDING',      'Taylor','',''],
    ['quick_meals',            'product',      'Knows when you need a quick dinner — shorter prep times automatically on your busy nights',                                   'PENDING',      'Taylor','',''],
    ['six_nutrition_dimensions','nutrition',   'Every meal scored across 6 nutrition dimensions — not just calories',                                                         'PENDING',      'Taylor','',''],
    ['fda_grade',              'credibility',  'FDA-grade nutrition data — the same standard doctors and dietitians use',                                                     'PENDING',      'Taylor','',''],
    ['verified_nutrition',     'credibility',  'Every food in our database is verified by registered dietitians — not submitted by strangers',                                'PENDING',      'Taylor','','Addresses MFP #2 complaint'],
    ['nutrition_you_can_trust','credibility',  'Nutrition numbers you can trust — verified not guessed',                                                                      'PENDING',      'Taylor','',''],
    ['deterministic_data',     'credibility',  'The same food gives the same verified answer every time — no guessing just facts',                                            'PENDING',      'Taylor','',''],
    ['health_conditions',      'product',      'Handles diabetes allergies and heart health restrictions in one place — tell us once never repeat it',                        'PENDING',      'Taylor','',''],
    ['family_memory',          'product',      'Tell easyChef Pro about your family once — allergies health needs food preferences — it never forgets',                       'PENDING',      'Taylor','',''],
    ['allergy_safe',           'product',      'Allergy restrictions stored permanently — every meal suggestion is safe for your family',                                     'PENDING',      'Taylor','',''],
    ['sodium_tracking',        'nutrition',    'Tracks sodium for heart health — meal plans that respect your doctor\'s guidance',                                            'PENDING',      'Taylor','',''],
    ['macro_tracking',         'nutrition',    'Tracks protein carbs and fat across every meal your family eats',                                                             'PENDING',      'Taylor','',''],
    ['calorie_accuracy',       'nutrition',    'Calorie counts your family can actually trust — verified against 800,000 products',                                           'PENDING',      'Taylor','',''],
    ['no_generic_advice',      'nutrition',    'Nutrition recommendations built around your family\'s real health needs — not generic guidance',                               'PENDING',      'Taylor','',''],
    ['nutrition_steers',       'nutrition',    'easyChef Pro quietly steers your family toward healthier choices — without changing how you cook',                            'PENDING',      'Taylor','',''],
    ['picky_eater',            'product',      'Handles the picky eater in your family — tell easyChef Pro what they will not eat and it never suggests it',                 'PENDING',      'Taylor','',''],
    ['fridge_to_recipe',       'product',      'Turn what is already in your fridge into tonight\'s dinner in 30 minutes',                                                   'PENDING',      'Taylor','',''],
    ['recipe_from_what_you_have','product',    'Every recipe is built from ingredients you already own — not a list of things to go buy',                                    'PENDING',      'Taylor','',''],
    ['step_by_step',           'product',      'Step by step cooking instructions — everything you need from first chop to last plate',                                       'PENDING',      'Taylor','',''],
    ['cook_mode',              'product',      'Hands-free cook mode — follow step by step instructions while your hands are busy cooking',                                   'PENDING',      'Taylor','',''],
    ['verified_recipes',       'credibility',  'Every recipe in easyChef Pro is built on verified nutrition data — the numbers are always right',                             'PENDING',      'Taylor','',''],
    ['recipe_to_cart',         'product',      'One click adds every ingredient from any recipe straight to your shopping list',                                              'PENDING',      'Taylor','',''],
    ['shopping_list_auto',     'product',      'Your shopping list builds itself from your meal plan — using what you already have first then listing only what is missing',  'PENDING',      'Taylor','',''],
    ['pantry_first_shopping',  'product',      'easyChef Pro checks your pantry and fridge first — your shopping list only shows what you actually need to buy',             'PENDING',      'Taylor','',''],
    ['one_click_checkout',     'product',      'One-click checkout at Walmart — more grocery stores coming',                                                                  'PENDING',      'Taylor','','Walmart only currently'],
    ['grocery_stores_growing', 'product',      'Shop from your list with one tap — Walmart today more stores added regularly',                                                'PENDING',      'Taylor','',''],
    ['shared_grocery_list',    'product',      'Share your grocery list with anyone — it updates in real time so everyone sees the same list',                                'PENDING',      'Taylor','','Confirmed capability'],
    ['family_shopping',        'product',      'One grocery list shared across your whole family — anyone can add to it everyone sees it instantly',                          'PENDING',      'Taylor','',''],
    ['no_duplicate_buying',    'product',      'No more buying a second jar of something you already have — your list knows your kitchen',                                    'PENDING',      'Taylor','',''],
    ['list_quantity',          'product',      'Your shopping list shows exact quantities — no guessing how much to buy',                                                     'PENDING',      'Taylor','',''],
    ['less_trips',             'product',      'Fewer trips to the grocery store — your list covers the whole week in one shop',                                              'PENDING',      'Taylor','',''],
    ['one_app',                'positioning',  'One app replaces five — NoWaste Mealime MyFitnessPal Pinterest and Instacart',                                               'PENDING',      'Taylor','','Five app claim — core position'],
    ['full_loop',              'positioning',  'TRACK PLAN OPTIMIZE COOK SHOP — one closed loop every week',                                                                 'PENDING',      'Taylor','','Always 5 stages never 4'],
    ['only_app',               'positioning',  'easyChef Pro is the only food app you need',                                                                                 'PENDING',      'Taylor','','Category claim'],
    ['no_tracking',            'positioning',  'easyChef Pro does not track your food. It manages it.',                                                                      'PENDING',      'Taylor','','vs MFP positioning'],
    ['outcomes_not_dashboards','positioning',  'easyChef Pro does not show you charts — it shows you tonight\'s dinner',                                                     'PENDING',      'Taylor','','Addresses MFP #10'],
    ['loop_closes',            'positioning',  'The loop closes. Every week.',                                                                                               'PENDING',      'Taylor','',''],
    ['not_a_meal_planner',     'positioning',  'easyChef Pro is not a meal planner — it is the only app that runs the whole kitchen',                                        'PENDING',      'Taylor','',''],
    ['not_a_calorie_tracker',  'positioning',  'easyChef Pro is not a calorie tracker — it tells you what to cook not what you ate',                                         'PENDING',      'Taylor','','vs MyFitnessPal'],
    ['closes_the_loop',        'positioning',  'Every other food app handles one step — easyChef Pro handles all five',                                                      'PENDING',      'Taylor','',''],
    ['no_ads',                 'brand',        'easyChef Pro never shows ads — not now not ever',                                                                            'PENDING',      'Taylor','','Brand principle'],
    ['no_credit_card',         'trial',        '7-day free trial — no credit card needed to get started',                                                                    'PENDING',      'Taylor','','Updated: reflects 7-day trial not free tier'],
    ['command_structure',      'brand',        'Built by people who spent 30 years running systems under pressure — now running yours',                                       'PENDING',      'Taylor','','Firefighter origin story'],
    ['modern_design',          'brand',        'Built from the ground up in 2026 — not a 2016 app with a new coat of paint',                                                 'PENDING',      'Taylor','','vs MFP UX complaint'],
    ['built_right',            'credibility',  'Three years in development — nine inventions filed with the USPTO before a single family used it',                           'PENDING',      'Taylor','',''],
    ['no_hallucination',       'credibility',  'Every nutrition number comes from a verified source — easyChef Pro never makes up data',                                     'PENDING',      'Taylor','','Trust claim vs AI apps'],
    ['works_on_phone',         'product',      'Works on iPhone and Android',                                                                                                'PENDING',      'Taylor','',''],
    ['whole_family',           'product',      'One app for the whole family — everyone\'s preferences restrictions and needs in one place',                                  'PENDING',      'Taylor','',''],
    ['encouraging_voice',      'brand',        'Designed to encourage not shame — no guilt for what you ate yesterday',                                                      'PENDING',      'Taylor','','Addresses MFP guilt complaint'],
    ['founding_scarcity',      'pricing',      'Founding price locks in forever for the first 5,000 families — after that the price goes to $19.99',                         'PENDING',      'Taylor','','Scarcity is real — hard close at 5,000'],
    ['seven_day_trial',        'trial',        'Try easyChef Pro free for 7 days — full access from your first night — no credit card',                                      'PENDING',      'Taylor','','Replaces free_is_full — no free tier exists'],
    ['peaceful_evenings',      'outcome',      'Dinner handled before you walk in the door — evenings back for your family',                                                  'PENDING',      'Taylor','',''],
    ['less_stress',            'outcome',      'The mental load of running a kitchen — gone',                                                                                 'PENDING',      'Taylor','',''],
    ['back_to_cooking',        'outcome',      'easyChef Pro handles the logistics — you handle the cooking',                                                                 'PENDING',      'Taylor','','Kitchen Director framing'],
    ['proud_table',            'outcome',      'Sit down to dinner feeling proud of what is on the table',                                                                    'PENDING',      'Taylor','',''],
    ['decision_free',          'outcome',      'No more daily food decisions — easyChef Pro makes them for you',                                                              'PENDING',      'Taylor','',''],
    ['trial_full_access',      'trial',        'Your 7-day trial runs the complete loop — TRACK PLAN OPTIMIZE COOK SHOP — every feature on from night one',                  'PENDING',      'Taylor','','No stripped version — trial IS the real product'],
    ['trial_no_limits',        'trial',        'No limited version. No stripped features. The trial is the real product.',                                                   'PENDING',      'Taylor','',''],
    ['trial_converts',         'trial',        'By Day 7 you have already planned meals saved food and used the shopping list — the decision to keep it is easy',             'PENDING',      'Taylor','','Trial designed to reach Tipping Point by Day 7'],
    ['trial_vs_competitors',   'positioning',  'Every other app makes you pay before you believe. easyChef Pro gives you 7 days to find out for yourself.',                  'PENDING',      'Taylor','',''],
    ['founding_trial',         'pricing',      'Start your 7-day free trial today — lock in founding price at $7.99 a month before the 5,000 spots are gone',               'PENDING',      'Taylor','','Combines trial + founding urgency'],
    // LEGAL REVIEW
    ['guilt_free',             'positioning',  'Nutrition without guilt — built to coach not judge',                                                                          'LEGAL_REVIEW', '','','Emotional health claim — legal review required'],
    ['health_goals',           'outcomes',     '87.5% of households reach the health goals easyChef Pro suggests',                                                            'LEGAL_REVIEW', '','','Pending Taylor + legal'],
    ['glp1_support',           'product',      'Supports GLP-1 medication nutrition needs — meal plans that work with your treatment',                                        'LEGAL_REVIEW', '','','Medical territory'],
    ['postpartum',             'product',      'Postpartum nutrition mode — meal plans designed for what your body needs after birth',                                        'LEGAL_REVIEW', '','','Medical territory'],
    ['coaching_not_judging',   'brand',        'easyChef Pro coaches your family toward better eating — it never judges what you had for dinner',                             'LEGAL_REVIEW', '','','Emotional health claim'],
    // BUILD NEEDED
    ['voice_logging',          'product',      'Add ingredients to your pantry hands-free while you cook',                                                                    'BUILD_NEEDED', '','','Product build not yet confirmed'],
    ['apple_health',           'product',      'Syncs with Apple Health — your food and fitness in one place nothing lost',                                                   'BUILD_NEEDED', '','','Integration TBD']
  ];
  if (rows.length > 0) sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  Logger.log('[_seedApprovedClaims] Seeded ' + rows.length + ' claims');
}

function _seedDeepLinkRegistry(sheet) {
  if (!sheet) return;
  var existing = sheet.getDataRange().getValues().slice(1).map(function(r) { return r[0]; });
  var now = _ccNow();
  [
    ['DL-EM-0001','DL-EM-0001_seq1_email1_cta', 'ec-2026-001','Email',    '','klaviyo',   'email',    'ec-2026-001','active',now,'',now,'SEQ-1 Email 1'],
    ['DL-EM-0002','DL-EM-0002_seq1_email2_cta', 'ec-2026-001','Email',    '','klaviyo',   'email',    'ec-2026-001','active',now,'',now,'SEQ-1 Email 2'],
    ['DL-EM-0003','DL-EM-0003_seq1_email3_cta', 'ec-2026-001','Email',    '','klaviyo',   'email',    'ec-2026-001','active',now,'',now,'SEQ-1 Email 3'],
    ['DL-EM-0004','DL-EM-0004_seq2_email1_cta', 'ec-2026-001','Email',    '','klaviyo',   'email',    'ec-2026-001','active',now,'',now,'SEQ-2 Email 1'],
    ['DL-EM-0005','DL-EM-0005_seq2_email2_cta', 'ec-2026-001','Email',    '','klaviyo',   'email',    'ec-2026-001','active',now,'',now,'SEQ-2 Email 2'],
    ['DL-EM-0006','DL-EM-0006_seq2_email3a_cta','ec-2026-001','Email',    '','klaviyo',   'email',    'ec-2026-001','active',now,'',now,'SEQ-2 Email 3 Variant A'],
    ['DL-EM-0007','DL-EM-0007_seq2_email3b_cta','ec-2026-001','Email',    '','klaviyo',   'email',    'ec-2026-001','active',now,'',now,'SEQ-2 Email 3 Variant B'],
    ['DL-SOC-0001','DL-SOC-0001_fb_super_mom',  'ec-2026-001','Facebook', '','facebook',  'social',   'ec-2026-001','active',now,'',now,'Facebook organic'],
    ['DL-SOC-0002','DL-SOC-0002_ig_health',     'ec-2026-001','Instagram','','instagram', 'social',   'ec-2026-001','active',now,'',now,'Instagram organic'],
    ['DL-SOC-0003','DL-SOC-0003_nextdoor',      'ec-2026-001','Nextdoor', '','nextdoor',  'social',   'ec-2026-001','active',now,'',now,'Nextdoor post'],
    ['DL-SOC-0004','DL-SOC-0004_tiktok_bio',    'ec-2026-001','TikTok',   '','tiktok',    'social',   'ec-2026-001','active',now,'',now,'TikTok bio link'],
    ['DL-DIR-0001','DL-DIR-0001_alpha_recruit',  'ec-2026-001','Direct',   '','convertkit','referral', 'ec-2026-001','active',now,'',now,'Alpha recruit direct'],
    // Variant B email links — point to lp/waitlist-b for clean GA4 attribution per variant
    ['DL-EM-0001-B','DL-EM-0001-B_SEQ-1_cta','EC-2026-001','Email','https://easychefpro.com/lp/waitlist-b','klaviyo','email','EC-2026-001','active',now,'',now,'Email · SEQ-1 · Variant B'],
    ['DL-EM-0002-B','DL-EM-0002-B_SEQ-2_cta','EC-2026-001','Email','https://easychefpro.com/lp/waitlist-b','klaviyo','email','EC-2026-001','active',now,'',now,'Email · SEQ-2 · Variant B'],
    ['DL-EM-0003-B','DL-EM-0003-B_SEQ-3_cta','EC-2026-001','Email','https://easychefpro.com/lp/waitlist-b','klaviyo','email','EC-2026-001','active',now,'',now,'Email · SEQ-3 · Variant B'],
    ['DL-EM-0004-B','DL-EM-0004-B_SEQ-4_cta','EC-2026-001','Email','https://easychefpro.com/lp/waitlist-b','klaviyo','email','EC-2026-001','active',now,'',now,'Email · SEQ-4 · Variant B']
  ].forEach(function(row) {
    if (existing.indexOf(row[0]) === -1) sheet.appendRow(row);
  });
}

function _seedChannels(sheet) {
  if (!sheet) return;
  var existing = sheet.getDataRange().getValues().slice(1).map(function(r) { return String(r[0]).toLowerCase(); });
  [
    ['Email',    'email',    'email',     'klaviyo',   'EM', 'active','','200',  '',     'false','0','0','',                                                                                              '600x200px',  '3:1',   'Link in email body',                               'Plain text body — no hashtags',                                                    'email'],
    ['Facebook', 'fb',       'social',    'facebook',  'FB', 'active','','400',  '63206','false','0','0','',                                                                                              '1200x630px', '1.91:1','Paste URL directly in post',                       'Link works in post — no hashtags needed',                                          'post'],
    ['Instagram','ig',       'social',    'instagram', 'IG', 'active','','125',  '2200', 'true', '5','15','#mealplanning #foodwaste #busymom #easyChefPro #mealprep #familydinners #grocerysavings',   '1080x1080px','1:1',   'Add URL to bio before posting — update bio DL_ID', 'No clickable link in post — use link in bio · hashtags at end of caption',         'post'],
    ['TikTok',   'tiktok',   'social',    'tiktok',    'TK', 'active','','150',  '2200', 'true', '3','5', '#easyChefPro #mealprep #busymom #foodwaste #dinnerideas',                                  '1080x1920px','9:16',  'Add URL to bio before posting',                    'Video script — hook must land in first 3 seconds · link in bio only',              'video_script'],
    ['Pinterest','pin',      'social',    'pinterest', 'PT', 'active','','500',  '500',  'true', '5','8', '#mealplanning #familydinners #grocerysavings #foodwaste #easyrecipes #busymom #mealprep',  '1000x1500px','2:3',   'URL goes in destination link field',               'Keyword-rich description — link goes directly to LP · vertical image performs best','pin'],
    ['Nextdoor', 'nextdoor', 'social',    'nextdoor',  'ND', 'active','','300',  '',     'false','0','0','',                                                                                              'Optional — community photo','','Paste URL in post',                              'Neighbour tone — no hashtags, no corporate language · authentic personal voice only','post'],
    ['Organic',  'organic',  'content',   'blog',      'ORG','active','','',     '',     'false','0','0','',                                                                                              '1200x630px', '1.91:1','Link in article body and CTA button',              'Blog post — SEO optimised · internal links to LP',                                 'article'],
    ['Affiliate','aff',      'affiliate', 'affiliate', 'AFF','active','','',     '',     'false','0','0','',                                                                                              '',           '',      'URL in affiliate brief',                           'Partner content — follows affiliate brand guidelines',                              'brief'],
    ['Direct',   'direct',   'referral',  'convertkit','DIR','active','','',     '',     'false','0','0','',                                                                                              '',           '',      'URL in email body',                                'Personal outreach — founder voice · one to one',                                   'email'],
    ['YouTube',  'yt',       'video',     'youtube',   'YT', 'active','','',     '',     'false','0','0','',                                                                                              '1920x1080px','16:9',  'Link in description — pin comment with link',       'Video content — hook in first 30 seconds · description SEO optimised',             'video_script'],
    ['X',        'x',        'social',    'x',         'X',  'active','','280',  '280',  'false','0','0','',                                                                                              '1200x675px', '16:9',  'Paste URL directly in post',                       'Max 280 chars — no hashtags needed for organic · link reduces reach so add in reply','post'],
    ['Reddit',   'reddit',   'community', 'reddit',    'RD', 'active','','',     '',     'false','0','0','',                                                                                              '',           '',      'Link in post or comment',                          'Community tone — no promotional language · value first · r/easyChefPro and u/easyChef_Pro','post']
  ].forEach(function(row) {
    if (existing.indexOf(row[0].toLowerCase()) === -1) sheet.appendRow(row);
  });
}

/**
 * One-time fix: updates dl_prefix column in the live Channels Sheet to correct values.
 * Run once from the Apps Script editor: fixChannelDlPrefixes()
 */
function fixChannelDlPrefixes() {
  var fixes = {
    'facebook':'FB','instagram':'IG','tiktok':'TK','pinterest':'PT',
    'nextdoor':'ND','youtube':'YT','x':'X','reddit':'RD','vimeo':'VM',
    'email':'EM','organic':'ORG','affiliate':'AFF','direct':'DIR'
  };
  var sheet   = _getCCSheet(_CC_TAB.CHANNELS);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) { Logger.log('[fixChannelDlPrefixes] no data rows'); return { ok: false }; }
  var pfxCol = _CC_HDR.Channels.indexOf('dl_prefix') + 1; // 1-based column
  var range  = sheet.getRange(2, 1, lastRow - 1, _CC_HDR.Channels.length);
  var rows   = range.getValues();
  var updated = 0;
  rows.forEach(function(row, i) {
    var name = String(row[0]).toLowerCase();
    if (fixes[name] !== undefined && row[pfxCol - 1] !== fixes[name]) {
      rows[i][pfxCol - 1] = fixes[name];
      updated++;
    }
  });
  range.setValues(rows);
  Logger.log('[fixChannelDlPrefixes] updated ' + updated + ' channel dl_prefix values');
  return { ok: true, updated: updated };
}

function _seedCampaignTypes(sheet) {
  if (!sheet) return;
  var existing = sheet.getDataRange().getValues().slice(1).map(function(r) { return r[0]; });
  var now = _ccNow();
  [
    ['ct-001','waitlist', 'Waitlist Signup (pre-launch)',  'Join the waitlist free — early access July 1',       'https://easychefpro.com/lp/waitlist-a', '/lp/waitlist-a',           'Founding price ends at 5,000 families',           'pre-launch',          'true', 'waitlist,sign up,pre-launch,before july',     'Save $1,336/year',                        '6:30 PM fridge panic',               now,'Primary'],
    ['ct-002','download', 'App Download (post-launch)',    'Download free on App Store',                          'app store',                              'App Store/Google Play',    'Founding price ends soon',                        'post-launch',         'false','download,app store,install,july 1',         'App is live — download now',              'Your dinner problem is solved',       now,''],
    ['ct-003','founding', 'Founding Price Lock',           'Lock in $7.99/month before price goes to $19.99',    'https://easychefpro.com/lp/waitlist-a', '/lp/waitlist-a',           '60% off — first 5,000 families only',             'pre-launch urgency',  'true', 'founding,price,lock in,60% off,7.99',        'Price urgency — 60% off ends soon',       'Founding price ends at 5,000 families',now,''],
    ['ct-004','referral', 'Referral / Share',              'Share with one mom who needs this',                   'https://easychefpro.com/thank-you',      '/thank-you',               "She saves $1,336 this year — or she doesn't",     'post-signup viral',   'true', 'referral,share,friend,refer',                'Share and help a friend',                 'Know a mom who throws money away every week?',now,''],
    ['ct-005','affiliate','Affiliate Partner',             'Get early access — no credit card',                   'https://easychefpro.com/lp/[aff-slug]',  '/lp/[affiliate-slug]',     'Founding price for referred families only',        'all',                 'true', 'affiliate,partner,influencer,commission',    'Exclusive access for [partner] readers',   'My readers save $1,336 a year with this',now,''],
    ['ct-006','recipe',   'Recipe / Content SEO',          'See the full recipe free in easyChef Pro',            'https://easychefpro.com/recipes/[slug]', '/recipes/[slug]',          'Free during beta — paid after launch',             'all',                 'true', 'recipe,content,seo,blog',                    'New recipe — ready in 30 minutes',        '30-minute dinner from what is in your fridge',now,''],
    ['ct-007','upgrade',  'In-App Upgrade',                'Upgrade now — founding price locks forever',          'in-app paywall',                         'Paywall (Tipping Point)',   'Price goes to $19.99 on July 1',                  'post-install PLG',    'false','upgrade,paywall,in-app,tipping point',      'You have hit the tipping point',          'You have cooked 3 meals — here is what comes next',now,'']
  ].forEach(function(row) {
    if (existing.indexOf(row[0]) === -1) sheet.appendRow(row);
  });
}

function _seedFunnelStages(sheet) {
  if (!sheet) return;
  var existing = sheet.getDataRange().getValues().slice(1).map(function(r) { return r[0]; });
  var now = _ccNow();
  [
    ['fs-001','hook',    1, 0,  1,  0,  'Stop the scroll — make her feel seen in under 2 seconds. Mirror her exact moment.',                                                                          'Hook — subject line stops the scroll',         'Mirror her moment — emotional recognition', 'pair-1-hook',    'Every day she waits costs $3.66',               now,'','2026-05-27'],
    ['fs-002','problem', 2, 2,  3,  0,  'Name the pain so precisely she thinks you wrote it about her specifically.',                                                                                  'Problem — name her pain precisely',            'Name the 6:30 PM moment exactly',           'pair-2-problem', 'The problem costs $1,336 a year',               now,'','2026-05-29'],
    ['fs-003','agitate', 3, 5,  6,  0,  'Make the problem vivid, concrete, personal. Cost it out. $1,336/year — that is $111/month — that is $25/week going in the bin.',                             'Agitate — cost the problem out',               'Cost it out — specific dollar amount',      'pair-3-agitate', 'She cannot unsee this number',                  now,'','2026-06-01'],
    ['fs-004','solve',   4, 9,  10, 0,  'Introduce easyChef Pro as the inevitable obvious answer. One sentence. No feature list.',                                                                     'Solve — introduce easyChef Pro as the answer', 'Introduce easyChef Pro — one sentence',     'pair-4-solve',   'The answer exists — she just needs to find it', now,'','2026-06-05'],
    ['fs-005','value',   5, 13, 14, 0,  'Translate features into outcomes she actually wants. Feelings and results, not specs. 30 minutes. What you already have.',                                    'Value — outcomes not features',                'Show the outcomes — 30 minutes, real food', 'pair-5-value',   'Every night without it costs her time and money',now,'','2026-06-09'],
    ['fs-006','proof',   6, 24, 25, 0,  'One specific honest proof point. Validated across 10,000 household profiles. Built by first responders. Then the offer.',                                     'Proof — one honest stat, then the offer',       'One proof point — then founding price',     'pair-6-proof',   'Social proof closes the last objection',        now,'','2026-06-20'],
    ['fs-007','cta',     7, 0,  1,  28, 'One action. Low friction. Outcome-framed. Not sign up — tell her what she is getting.',                                                                       'CTA — one action, loss aversion, urgency',     'Founding price — last chance angle',        'pair-7-cta',     'Founding price ends at 5,000 families',         now,'','2026-06-24']
  ].forEach(function(row) {
    if (existing.indexOf(row[0]) === -1) sheet.appendRow(row);
  });
}

function _seedBlueprintConfig(sheet) {
  if (!sheet) return;
  var existing = sheet.getDataRange().getValues().slice(1).map(function(r) { return r[0]; });
  [
    ['bp-001','A-Waitlist',        'Waitlist Growth',        'SEQ-1,SEQ-2,SEQ-3,SEQ-4', 13, 7, 'waitlist', 'pre-launch',   'true', 'Pre-launch waitlist acquisition — drives to LP, captures email, nurtures to app download on July 1', '2026-05-27','2026-07-01','2026-06-08','2026-06-29'],
    ['bp-002','B-App Download',    'App Download',           'SEQ-4',                    1,  7, 'download', 'post-launch',  'false','Post-launch app download — drives directly to App Store'],
    ['bp-003','C-Referral',        'Referral Acquisition',   'SEQ-1',                    3,  5, 'referral', 'post-signup',  'true', 'Referral loop — share mechanic, Branch.io deep links'],
    ['bp-004','D-Re-engagement',   'Re-engagement',          'SEQ-2',                    3,  5, 'download', 'post-install', 'false','Lapsed user re-engagement — push + email'],
    ['bp-005','E-Content',         'Content-Led',            'SEQ-1,SEQ-2',              5,  7, 'recipe',   'all',          'true', 'Blog and recipe page traffic — content CTA drives to LP'],
    ['bp-006','F-Affiliate',       'Affiliate Partner',      'SEQ-1,SEQ-2',              5,  7, 'affiliate','all',          'true', 'Affiliate partner traffic — Rewardful tracked, custom LP per partner'],
    ['bp-007','G-Paywall Recovery','Paywall Recovery',       'SEQ-2',                    3,  5, 'upgrade',  'post-install', 'false','In-app paywall recovery — tipping point triggered']
  ].forEach(function(row) {
    if (existing.indexOf(row[0]) === -1) sheet.appendRow(row);
  });
}

function _updateBlueprintAWaitlist35() {
  var sheet = _getCCSheet(_CC_TAB.BLUEPRINTS);
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === 'bp-001') {
      // Update: email_count(4)=13, social_post_count(5)=14 (7+7 across two arcs),
      // description(9) to reflect 35-day arc
      sheet.getRange(i + 1, 5).setValue(13);
      sheet.getRange(i + 1, 6).setValue(14);
      sheet.getRange(i + 1, 10).setValue(
        '35-day pre-launch arc · May 27–Jul 1 · ' +
        'campaign_duration_days:35 · social_arc_days:7 · email_window_days:35 · ' +
        'Arc 1 social Days 1–7 · SEQ-1 Day 1 · SEQ-2 Day 8 · ' +
        'Arc 2 urgency social Days 22–28 · SEQ-3 Jun 17 · SEQ-4 Jul 1'
      );
      Logger.log('[_updateBlueprintAWaitlist35] bp-001 updated');
      return { ok: true };
    }
  }
  Logger.log('[_updateBlueprintAWaitlist35] bp-001 not found — run seed first');
  return { ok: false, error: 'bp-001 not found' };
}

function _seedLPInventory(sheet) {
  if (!sheet) return;
  var existing = sheet.getDataRange().getValues().slice(1).map(function(r) { return r[0]; });
  var now = _ccNow();
  var proof = '$1,336/year|69.5% less food waste|30 min fridge to table';
  var cta   = 'Join the waitlist free — early access July 1';
  // id, slug, full_url, campaign_type, blueprint_code, icp_codes,
  // campaign_angle, lp_variant, headline, cta_primary, proof_bar,
  // status, dev_built, convert_installed, clarity_installed, ga4_installed,
  // campaigns_using, total_signups, conversion_rate, created_at, last_updated, notes
  [
    ['lpi-001','lp/waitlist-a',   'https://easychefpro.com/lp/waitlist-a',   'waitlist','A-Waitlist','super_mom',    'savings','A','You spend $300+ on groceries but still stare into a full fridge at 6:30 PM',cta,proof,'live', true, false,false,false,'',0,'',now,now,'A/B test control variant'],
    ['lpi-002','lp/waitlist-b',   'https://easychefpro.com/lp/waitlist-b',   'waitlist','A-Waitlist','super_mom',    'emotion','B','It\'s 6:30 PM and you\'re already exhausted',cta,proof,'draft',false,false,false,false,'',0,'',now,now,'A/B test challenger variant'],
    ['lpi-003','lp/alpha',        'https://easychefpro.com/lp/alpha',        'waitlist','A-Waitlist','alpha_recruit','founder','A','I\'d like to personally set up easyChef Pro for your family','Reply YES to join our founding family program',proof,'live', true, false,false,false,'',0,'',now,now,'Alpha Recruit ICP — founding price angle'],
    ['lpi-004','lp/social-fb',    'https://easychefpro.com/lp/social-fb',    'waitlist','A-Waitlist','super_mom',    'savings','A','You spend $300+ on groceries but still stare into a full fridge at 6:30 PM',cta,proof,'live', true, false,false,false,'',0,'',now,now,'Facebook organic traffic destination'],
    ['lpi-005','lp/social-ig',    'https://easychefpro.com/lp/social-ig',    'waitlist','A-Waitlist','super_mom',    'savings','A','Stop throwing away $111 every month on food you never use',cta,proof,'live', true, false,false,false,'',0,'',now,now,'Instagram bio link destination'],
    ['lpi-006','lp/630pm-rescue', 'https://easychefpro.com/lp/630pm-rescue', 'waitlist','A-Waitlist','super_mom',    'emotion','B','It\'s 6:30 PM and your fridge is full but dinner isn\'t happening',cta,proof,'draft',false,false,false,false,'',0,'',now,now,'6:30 PM fridge panic angle — pending build']
  ].forEach(function(row) {
    if (existing.indexOf(row[0]) === -1) sheet.appendRow(row);
  });
}

function _seedLandingPages(sheet) {
  if (!sheet) return;
  var existing = sheet.getDataRange().getValues().slice(1).map(function(r) { return r[0]; });
  var proof = '$1,336/year|69.5% less food waste|30 min fridge to table';
  var cta   = 'Join the waitlist free — early access July 1';
  // id, campaign_id, icp_code, slug, full_url, title_tag, meta_description,
  // og_title, og_description, hero_headline, hero_subheadline,
  // section_problem, section_agitate, section_solve, section_value,
  // section_proof, section_cta,
  // tracking_convert, tracking_clarity, tracking_ga4,
  // status, dev_built, qa_passed, pushed_to_production,
  // campaign_type, blueprint_code, icp_codes, theme, publish_day,
  // ab_test_variant, convert_experiment_id, shared_by_campaigns,
  // last_traffic_date, total_signups
  [
    ['lp-001','','super_mom','lp/waitlist-a','https://easychefpro.com/lp/waitlist-a','easyChef Pro — Join the Waitlist','','','','You spend $300+ on groceries but still stare into a full fridge at 6:30 PM','easyChef Pro tells you what to cook from what you already have','','','','','',cta,false,false,false,'live', true,false,false,'waitlist','A-Waitlist','super_mom','','','A','','','',0],
    ['lp-002','','super_mom','lp/waitlist-b','https://easychefpro.com/lp/waitlist-b','easyChef Pro — Join the Waitlist','','','','It\'s 6:30 PM and you\'re already exhausted','Stop staring at a full fridge with nothing to cook','','','','','',cta,false,false,false,'draft',false,false,false,'waitlist','A-Waitlist','super_mom','','','B','','','',0],
    ['lp-003','','alpha_recruit','lp/alpha','https://easychefpro.com/lp/alpha','easyChef Pro — Founding Family Program','','','','I\'d like to personally set up easyChef Pro for your family','Founding families get lifetime founding price — locked before July 1','','','','','','Reply YES to join our founding family program',false,false,false,'live', true,false,false,'waitlist','A-Waitlist','alpha_recruit','','','A','','','',0],
    ['lp-004','','super_mom','lp/social-fb','https://easychefpro.com/lp/social-fb','easyChef Pro — Join the Waitlist','','','','You spend $300+ on groceries but still stare into a full fridge at 6:30 PM','easyChef Pro tells you what to cook from what you already have','','','','','',cta,false,false,false,'live', true,false,false,'waitlist','A-Waitlist','super_mom','','','A','','','',0],
    ['lp-005','','super_mom','lp/social-ig','https://easychefpro.com/lp/social-ig','easyChef Pro — Stop Wasting Groceries','','','','Stop throwing away $111 every month on food you never use','easyChef Pro turns your fridge into tonight\'s dinner in 30 minutes','','','','','',cta,false,false,false,'live', true,false,false,'waitlist','A-Waitlist','super_mom','','','A','','','',0],
    ['lp-006','','super_mom','lp/630pm-rescue','https://easychefpro.com/lp/630pm-rescue','easyChef Pro — The 6:30 PM Rescue','','','','It\'s 6:30 PM and your fridge is full but dinner isn\'t happening','easyChef Pro sees what\'s in your fridge and builds tonight\'s plan','','','','','',cta,false,false,false,'draft',false,false,false,'waitlist','A-Waitlist','super_mom','','','B','','','',0]
  ].forEach(function(row) {
    if (existing.indexOf(row[0]) === -1) sheet.appendRow(row);
  });
}

// Run this once from the Apps Script editor to populate the LandingPages sheet.
function seedLpData() {
  _seedLandingPages(_getCCSheet(_CC_TAB.PAGES));
  Logger.log('seedLpData: LandingPages sheet seeded');
}


function _tlRowToObj(r) {
  return {
    id: r[0], icp_code: r[1], theme_name: r[2], theme_slug: r[3],
    category: r[4], emotional_entry: r[5], emotional_payoff: r[6],
    hook_angle: r[7], problem_angle: r[8], agitate_angle: r[9],
    food_type: r[10], publish_day: String(r[11] || ''),
    post_count: parseInt(r[12]) || 7,
    blueprint_code: r[13], campaign_angle: r[14],
    urgency_trigger: r[15], image_mood_hook: r[16],
    image_mood_cta: r[17],
    active: r[18] === true || String(r[18]).toLowerCase() === 'true',
    notes: r[19],
    app_feature:      r[20] || '',
    app_screen_label: r[21] || '',
    feature_hook:      r[22] || '',
    feature_proof:     r[23] || '',
    persona_rotation:  r[24] || ''
  };
}

function getThemeLibrary(icp_code) {
  var sheet = _getCCSheet(_CC_TAB.THEME_LIBRARY);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.ThemeLibrary.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_tlRowToObj)
    .filter(function(t) { return t.active; });
  if (!icp_code) return rows;
  var code = String(icp_code).toLowerCase().replace(/\s+/g, '_');
  return rows.filter(function(t) { return !t.icp_code || String(t.icp_code).toLowerCase() === code; });
}

function setThemeLibraryRow(item) {
  if (!item || !item.theme_name) return null;
  var sheet   = _getCCSheet(_CC_TAB.THEME_LIBRARY);
  var headers = _CC_HDR.ThemeLibrary;
  var id   = item.id || ('tl-' + Date.now().toString(36));
  var slug = item.theme_slug || item.theme_name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  var row = [
    id,
    item.icp_code          || '',
    item.theme_name        || '',
    slug,
    item.category          || '',
    item.emotional_entry   || '',
    item.emotional_payoff  || '',
    item.hook_angle        || '',
    item.problem_angle     || '',
    item.agitate_angle     || '',
    item.food_type         || '',
    item.publish_day       || '',
    item.post_count        || 7,
    item.blueprint_code    || 'A-Waitlist',
    item.campaign_angle    || '',
    item.urgency_trigger   || '',
    item.image_mood_hook   || '',
    item.image_mood_cta    || '',
    item.active !== undefined ? item.active : true,
    item.notes             || '',
    item.app_feature       || '',
    item.app_screen_label  || '',
    item.feature_hook      || '',
    item.feature_proof     || '',
    item.persona_rotation  || ''
  ];
  _ccUpsert(sheet, headers, id, row);
  return id;
}

// ── LifeStages ────────────────────────────────────────────────────────────────

function getLifeStages(id) {
  var sheet = _getCCSheet(_CC_TAB.LIFE_STAGES);
  var last  = sheet.getLastRow();
  if (last < 2) return id ? null : [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.LifeStages.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(function(r) {
      return {
        life_stage_id:         String(r[0] || ''),
        current_chapter:       String(r[1] || ''),
        next_chapter:          String(r[2] || ''),
        stage_recognition_line:String(r[3] || ''),
        next_stage_bridge:     String(r[4] || ''),
        adaptation_copy:       String(r[5] || ''),
        active:                r[6] === true || String(r[6]).toLowerCase() === 'true'
      };
    });
  if (!id) return rows;
  var _id = String(id).toLowerCase().trim();
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].life_stage_id.toLowerCase() === _id) return rows[i];
  }
  return null;
}

function setLifeStageRow(item) {
  if (!item || !item.life_stage_id) return;
  var sheet   = _getCCSheet(_CC_TAB.LIFE_STAGES);
  var headers = _CC_HDR.LifeStages;
  var row = [
    item.life_stage_id,
    item.current_chapter       || '',
    item.next_chapter          || '',
    item.stage_recognition_line|| '',
    item.next_stage_bridge     || '',
    item.adaptation_copy       || '',
    item.active !== undefined ? item.active : true
  ];
  _ccUpsert(sheet, headers, item.life_stage_id, row);
}

function _seedFoundingFamilyTheme() {
  var sheet = _getCCSheet(_CC_TAB.THEME_LIBRARY);
  var last  = sheet.getLastRow();
  var THEME_NAME = 'Founding Family Pre-Launch';
  // Skip if already exists
  if (last >= 2) {
    var existing = sheet.getRange(2, 3, last - 1, 1).getValues().map(function(r){ return r[0]; });
    if (existing.indexOf(THEME_NAME) > -1) {
      Logger.log('Theme "' + THEME_NAME + '" already exists — skipping.');
      return { skipped: true };
    }
  }
  var id = setThemeLibraryRow({
    icp_code:        'super_mom',
    theme_name:      THEME_NAME,
    category:        'pre-launch',
    emotional_entry: 'She found us before the world did — curious, hopeful',
    emotional_payoff:'She is founding the kitchen of the future — proud, exclusive',
    hook_angle:      '',
    problem_angle:   '',
    agitate_angle:   '',
    food_type:       '',
    publish_day:     '',
    post_count:      7,
    blueprint_code:  'A-Waitlist',
    campaign_angle:  'exclusivity / founder',
    urgency_trigger: '',
    image_mood_hook: '',
    image_mood_cta:  '',
    active:          true,
    notes:           'journey_type: pre-launch-waitlist',
    app_feature:     'COOK',
    app_screen_label:'Recipe page',
    feature_hook:    '',
    feature_proof:   '',
    persona_rotation:''
  });
  Logger.log('Seeded theme "' + THEME_NAME + '" with id: ' + id);
  return { ok: true, id: id };
}

function _deduplicateSeededTabs() {
  var tabs = [
    { name: 'CampaignTypes',  idCol: 0 },
    { name: 'FunnelStages',   idCol: 0 },
    { name: 'BlueprintConfig',idCol: 0 },
    { name: 'ICPProfiles',    idCol: 0 },
    { name: 'ApprovedClaims', idCol: 0 },
    { name: 'Channels',       idCol: 0 }
  ];

  var ss = _getCampaignSpreadsheet();

  tabs.forEach(function(tab) {
    var sheet = ss.getSheetByName(tab.name);
    if (!sheet) {
      Logger.log(tab.name + ': TAB NOT FOUND');
      return;
    }
    var lastRow = sheet.getLastRow();
    Logger.log(tab.name + ': ' + lastRow + ' rows before dedup');

    if (lastRow < 2) {
      Logger.log(tab.name + ': skipping — empty');
      return;
    }

    var data = sheet.getDataRange().getValues();
    var seen = {};
    var toDelete = [];

    for (var i = 1; i < data.length; i++) {
      var id = String(data[i][tab.idCol]).trim();
      if (!id) continue;
      if (seen[id]) {
        toDelete.push(i + 1);
      } else {
        seen[id] = true;
      }
    }

    Logger.log(tab.name + ': ' + toDelete.length + ' duplicates found');

    for (var j = toDelete.length - 1; j >= 0; j--) {
      sheet.deleteRow(toDelete[j]);
    }

    Logger.log(tab.name + ': ' + sheet.getLastRow() + ' rows after dedup');
  });
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
    lp_variants: r[14],
    validated: r[15] === true || String(r[15]).toUpperCase() === 'TRUE',
    validation_notes: r[16],
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

function repairIcpDates() {
  var sheet  = _getCCSheet(_CC_TAB.ICP);
  var last   = sheet.getLastRow();
  if (last < 2) return { ok: true, repaired: 0, total: 0 };
  var hdrLen = _CC_HDR.ICPProfiles.length;
  var data   = sheet.getRange(2, 1, last - 1, hdrLen).getValues();
  var repaired = 0;
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    var changed = false;
    [17, 18].forEach(function(col) {
      var v = row[col];
      var norm;
      if (v instanceof Date) {
        norm = Utilities.formatDate(v, 'UTC', 'yyyy-MM-dd');
        changed = true;
      } else {
        var s = String(v || '');
        norm = s.indexOf('T') !== -1 ? s.split('T')[0] : s;
        if (norm !== s) changed = true;
      }
      row[col] = norm;
    });
    // also normalize validated to boolean string
    var valRaw = row[15];
    var valBool = valRaw === true || String(valRaw).toUpperCase() === 'TRUE';
    if (String(row[15]) !== String(valBool)) { row[15] = valBool; changed = true; }
    if (changed) {
      var rng = sheet.getRange(i + 2, 1, 1, hdrLen);
      rng.setNumberFormat('@');
      rng.setValues([row]);
      repaired++;
    }
  }
  return { ok: true, repaired: repaired, total: data.filter(function(r){ return r[0]; }).length };
}

// ── ApprovedClaims ────────────────────────────────────────────────────────────

function _claimRowToObj(r) {
  var statusRaw = r[3] === true ? 'ACTIVE' : r[3] === false ? 'PENDING' : String(r[3] || '');
  return {
    id: r[0], claim_type: r[1], exact_wording: r[2],
    status: statusRaw,
    approved: statusRaw === 'ACTIVE' || statusRaw === 'true' || r[3] === true,
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

// ── Manual Mode — filtered claims for wizard (Task 2) ─────────────────────────
// Returns ACTIVE claims permitted for lpSection. campaignAngle disambiguates agitate sub-keys.
function getFilteredClaims(lpSection, campaignAngle) {
  try {
    var scoping = getCampaignStrategy('CLAIM_SCOPING_001');
    if (!scoping || !scoping.value || !scoping.value.section_claim_map) {
      return { ok: false, error: 'CLAIM_SCOPING_001 not seeded — run seed_playbook_wiring', claims: [] };
    }
    var map = scoping.value.section_claim_map;

    // Resolve agitate sub-key from angle
    var key = String(lpSection || '').toLowerCase().trim();
    if (key === 'agitate') {
      var a = String(campaignAngle || '').toLowerCase();
      if      (a.indexOf('money') !== -1 || a.indexOf('saving') !== -1 || a.indexOf('financial') !== -1) key = 'agitate_money';
      else if (a.indexOf('time') !== -1  || a.indexOf('decision') !== -1)                                 key = 'agitate_time';
      else if (a.indexOf('nutrition') !== -1 || a.indexOf('health') !== -1)                               key = 'agitate_nutrition';
      else key = 'agitate_money';
    }

    var permittedTypes = Array.isArray(map[key]) ? map[key] : [];
    var allClaims      = getApprovedClaims(true);

    // Empty permitted = no restriction (hook, value, lifecycle)
    var noRestriction = permittedTypes.length === 0;
    var filtered = noRestriction ? allClaims
      : allClaims.filter(function(c) { return permittedTypes.indexOf(c.claim_type) !== -1; });

    return {
      ok:              true,
      section:         key,
      permitted_types: permittedTypes,
      no_restriction:  noRestriction,
      claims:          filtered.map(function(c) {
        return { id: c.id, claim_type: c.claim_type, exact_wording: c.exact_wording };
      })
    };
  } catch(e) {
    Logger.log('[getFilteredClaims] ERROR: ' + e.message);
    return { ok: false, error: e.message, claims: [] };
  }
}

// Save-time claim validator — returns {ok, permitted, message} for a single claimType + section.
function validateClaimForSection(claimType, lpSection, campaignAngle) {
  try {
    var result = getFilteredClaims(lpSection, campaignAngle);
    if (!result.ok) return { ok: false, permitted: false, error: result.error };
    if (result.no_restriction) return { ok: true, permitted: true, message: 'No restriction for section "' + result.section + '"' };
    var allowed = result.permitted_types.indexOf(String(claimType)) !== -1;
    return {
      ok:       true,
      permitted: allowed,
      message:   allowed
        ? 'Claim type "' + claimType + '" permitted for section "' + result.section + '"'
        : 'DOCTRINE VIOLATION: "' + claimType + '" not permitted for section "' + result.section + '". Permitted: ' + result.permitted_types.join(', ')
    };
  } catch(e) {
    return { ok: false, permitted: false, error: e.message };
  }
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
    post_count:      parseInt(r[15]) || 7,
    post_frequency:  String(r[16] || 'every_2_days'),
    email_sequences: String(r[17] || 'seq1_seq2'),
    email_variants:  String(r[18] || 'both'),
    theme:           String(r[19] || ''),
    publish_day:     String(r[20] || ''),
    channels:        (function(){try{return JSON.parse(r[21]||'[]');}catch(e){return [];}}()),
    ab_test:         r[22] === true || String(r[22] || '').toLowerCase() === 'true',
    ab_tool:         String(r[23] || ''),
    ab_split:        String(r[24] || '50/50'),
    lp_slug_a:       String(r[25] || ''),
    lp_slug_b:       String(r[26] || ''),
    ab_experiment_id:    String(r[27] || ''),
    campaign_angle:      String(r[28] || ''),
    urgency_trigger:     String(r[29] || ''),
    lp_campaign_spine_json: String(r[30] || '')
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
  var _idUpper = String(id).trim().toUpperCase();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].id).trim().toUpperCase() === _idUpper) return rows[i];
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
    item.post_count       !== undefined ? String(item.post_count)      : (ex ? ex[15] : '7'),
    item.post_frequency   !== undefined ? item.post_frequency          : (ex ? ex[16] : 'every_2_days'),
    item.email_sequences  !== undefined ? item.email_sequences         : (ex ? ex[17] : 'seq1_seq2'),
    item.email_variants   !== undefined ? item.email_variants          : (ex ? ex[18] : 'both'),
    item.theme            !== undefined ? item.theme                   : (ex ? ex[19] : ''),
    item.publish_day      !== undefined ? item.publish_day             : (ex ? ex[20] : ''),
    item.channels         !== undefined ? JSON.stringify(item.channels) : (ex ? ex[21] : '[]'),
    item.ab_test          !== undefined ? (item.ab_test ? true : false) : (ex ? ex[22] : false),
    item.ab_tool          !== undefined ? item.ab_tool                  : (ex ? ex[23] : ''),
    item.ab_split         !== undefined ? item.ab_split                 : (ex ? ex[24] : '50/50'),
    item.lp_slug_a        !== undefined ? item.lp_slug_a               : (ex ? ex[25] : ''),
    item.lp_slug_b        !== undefined ? item.lp_slug_b               : (ex ? ex[26] : ''),
    item.ab_experiment_id !== undefined ? item.ab_experiment_id        : (ex ? ex[27] : ''),
    item.campaign_angle          !== undefined ? item.campaign_angle          : (ex ? ex[28] : ''),
    item.urgency_trigger         !== undefined ? item.urgency_trigger         : (ex ? ex[29] : ''),
    item.lp_campaign_spine_json  !== undefined ? item.lp_campaign_spine_json  : (ex ? ex[30] : '')
  ];
  _ccUpsert(sheet, headers, item.id, row);
}

/**
 * ROOT CAUSE 2 — One-time fix: appends any _CC_HDR.CampaignBriefs columns that are
 * missing from the actual Sheet header row (row 1).
 * Safe to run multiple times — it only adds columns that are not already present.
 * Run once from the Apps Script editor: select ensureCampaignBriefColumns → Run.
 */
function ensureCampaignBriefColumns() {
  var sheet    = _getCCSheet(_CC_TAB.BRIEFS);
  var headers  = _CC_HDR.CampaignBriefs;
  var lastCol  = sheet.getLastColumn();
  var existing = lastCol > 0
    ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(v) { return String(v || '').trim(); })
    : [];
  var missing = headers.filter(function(h) { return existing.indexOf(h) === -1; });
  if (!missing.length) {
    Logger.log('[ensureCampaignBriefColumns] All ' + headers.length + ' columns present — no changes needed');
    Logger.log('[ensureCampaignBriefColumns] Current headers: ' + existing.join(', '));
    return { ok: true, added: 0 };
  }
  var startCol = lastCol + 1;
  missing.forEach(function(h, i) { sheet.getRange(1, startCol + i).setValue(h); });
  Logger.log('[ensureCampaignBriefColumns] Added ' + missing.length + ' columns starting at col ' + startCol + ': ' + missing.join(', '));
  return { ok: true, added: missing.length, columns: missing };
}

// Stamps any missing ContentCalendar header columns into row 1 of the sheet.
// Safe to run multiple times — only adds columns not already present.
function ensureContentCalColumns() {
  var sheet   = _getCCSheet(_CC_TAB.CONTENT_CAL);
  var headers = _CC_HDR[_CC_TAB.CONTENT_CAL];
  var lastCol = sheet.getLastColumn();
  var existing = lastCol > 0
    ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(v) { return String(v || '').trim(); })
    : [];
  var missing = headers.filter(function(h) { return existing.indexOf(h) === -1; });
  if (!missing.length) {
    Logger.log('[ensureContentCalColumns] All ' + headers.length + ' columns present');
    return { ok: true, added: 0 };
  }
  var start = lastCol + 1;
  missing.forEach(function(h, i) { sheet.getRange(1, start + i).setValue(h); });
  Logger.log('[ensureContentCalColumns] Added ' + missing.length + ': ' + missing.join(', '));
  return { ok: true, added: missing.length, columns: missing };
}

// Stamps any missing LP Doctrine header columns onto all 4 affected sheets.
// Safe to run multiple times — only adds columns not already present.
function ensureAllLPDoctrineColumns() {
  var tabs = [
    { tab: _CC_TAB.BRIEFS,        hdr: _CC_HDR.CampaignBriefs  },
    { tab: _CC_TAB.SOCIAL,        hdr: _CC_HDR.SocialPosts      },
    { tab: _CC_TAB.EMAIL,         hdr: _CC_HDR.EmailSequences   },
    { tab: _CC_TAB.VIDEO_PRODUCTION, hdr: _CC_HDR.VideoProduction }
  ];
  var results = {};
  tabs.forEach(function(t) {
    var sheet    = _getCCSheet(t.tab);
    var lastCol  = sheet.getLastColumn();
    var existing = lastCol > 0
      ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(v) { return String(v || '').trim(); })
      : [];
    var missing = t.hdr.filter(function(h) { return existing.indexOf(h) === -1; });
    if (missing.length) {
      var start = lastCol + 1;
      missing.forEach(function(h, i) { sheet.getRange(1, start + i).setValue(h); });
    }
    results[t.tab] = { added: missing.length, columns: missing };
    Logger.log('[ensureAllLPDoctrineColumns] ' + t.tab + ' added=' + missing.length +
               (missing.length ? ' (' + missing.join(', ') + ')' : ''));
  });
  return { ok: true, results: results };
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
    created_by: r[11], notes: r[12],
    icp_code: r[13] || '', lp_variant: r[14] || '', emotional_arc_id: r[15] || ''
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
  var cid = campaignId.toUpperCase();
  return rows.filter(function(r) { return (r.campaign_id || '').toUpperCase() === cid; });
}

function patchDLRegistrySchema() {
  var sheet   = _getCCSheet(_CC_TAB.DL);
  var lastCol = sheet.getLastColumn();
  var lastRow = sheet.getLastRow();
  var newCols = ['icp_code', 'lp_variant', 'emotional_arc_id'];
  var added   = 0;

  // Read existing header row to avoid duplicates
  var hdrRow  = lastCol >= 1 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  newCols.forEach(function(col) {
    if (hdrRow.indexOf(col) === -1) {
      lastCol++;
      sheet.getRange(1, lastCol).setValue(col);
      added++;
    }
  });

  // Column indices (1-based) for the three new fields
  var icpCol = hdrRow.indexOf('icp_code')  === -1 ? lastCol - newCols.length + 1 + added - 3
             : hdrRow.indexOf('icp_code')  + 1;
  // Re-read header now that we've written
  var hdrFull = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var icpIdx  = hdrFull.indexOf('icp_code')       + 1;   // 1-based col
  var lpIdx   = hdrFull.indexOf('lp_variant')      + 1;
  var arcIdx  = hdrFull.indexOf('emotional_arc_id')+ 1;
  var urlIdx  = hdrFull.indexOf('destination_url') + 1;   // for lp_variant extraction
  var notesIdx= hdrFull.indexOf('notes')           + 1;

  if (lastRow < 2) {
    Logger.log('[patchDLRegistrySchema] No data rows — schema headers added only');
    return { ok: true, headers_added: added, rows_patched: 0 };
  }

  var dataRows  = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  var patched   = 0;
  var noteFixed = 0;

  dataRows.forEach(function(row, i) {
    var rowNum = i + 2;
    var changed = false;

    // lp_variant: extract from destination_url if column is blank
    if (lpIdx > 0 && !String(row[lpIdx - 1] || '').trim()) {
      var url    = String(row[urlIdx - 1] || '');
      var lpMatch = url.match(/lp\/([a-z0-9_-]+)/i);
      var variant = lpMatch ? lpMatch[1] : '';
      if (variant) {
        sheet.getRange(rowNum, lpIdx).setValue(variant);
        changed = true;
      }
    }

    // icp_code and emotional_arc_id: leave blank — will be mapped per ICP campaign
    // (no reliable way to infer from existing data)

    // notes: replace old-claim-wording records with governance-aligned format
    if (notesIdx > 0) {
      var note     = String(row[notesIdx - 1] || '');
      var oldClues = ['invisible leak', 'a month', '$111', 'dollar a month', 'grocery'];
      var isOld    = oldClues.some(function(c) { return note.toLowerCase().indexOf(c) !== -1; });
      if (isOld) {
        var channel  = String(row[hdrFull.indexOf('channel')] || 'Unknown');
        var campaign = String(row[hdrFull.indexOf('campaign_id')] || 'EC-2026-001');
        var status   = String(row[hdrFull.indexOf('status')] || 'active');
        var newNote  = campaign.toUpperCase() + ' · ' + channel + ' · ' + status + ' · ICP unassigned';
        sheet.getRange(rowNum, notesIdx).setValue(newNote);
        noteFixed++;
        changed = true;
      }
    }

    if (changed) patched++;
  });

  Logger.log('[patchDLRegistrySchema] headers_added=' + added + ' rows_patched=' + patched + ' notes_fixed=' + noteFixed);
  return { ok: true, headers_added: added, rows_patched: patched, notes_fixed: noteFixed };
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
    item.notes           !== undefined ? item.notes           : (ex ? ex[12] : ''),
    item.icp_code        !== undefined ? item.icp_code        : (ex ? ex[13] : ''),
    item.lp_variant      !== undefined ? item.lp_variant      : (ex ? ex[14] : ''),
    item.emotional_arc_id !== undefined ? item.emotional_arc_id : (ex ? ex[15] : '')
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
    status:           'draft',
    created_at:       _ccNow(),
    created_by:       'campaignGen',
    icp_code:         brief.icp_code        || '',
    lp_variant:       brief.lp_variant       || (slug ? slug.replace(/^lp\//, '') : ''),
    emotional_arc_id: brief.emotional_arc_id || ''
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
    klaviyo_id:       r[19] || '',
    funnel_stage:     r[20] || '',
    subject_angle:    r[21] || '',
    body_theme:       r[22] || '',
    role:             r[23] || '',
    seq_template_id:  r[24] || '',
    design_brief:     r[25] || '',
    lp_section_source: r[26] || '',
    emotional_stage:   r[27] || '',
    claim_set:         r[28] || '',
    loop_stage:        r[29] || '',
    dl_id:             r[30] || '',
    claude_design_url: r[31] || '',
    full_email_body:   r[32] || '',
    icp_code:           r[33] || '',
    segment:            r[34] || '',
    target_word_count:  r[35] || ''
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
    item.seq_template_id   !== undefined ? item.seq_template_id   : (ex ? ex[24] : ''),
    item.design_brief      !== undefined ? item.design_brief      : (ex ? ex[25] : ''),
    item.lp_section_source !== undefined ? item.lp_section_source : (ex ? ex[26] : ''),
    item.emotional_stage   !== undefined ? item.emotional_stage   : (ex ? ex[27] : ''),
    item.claim_set         !== undefined ? item.claim_set         : (ex ? ex[28] : ''),
    item.loop_stage        !== undefined ? item.loop_stage        : (ex ? ex[29] : ''),
    item.dl_id             !== undefined ? item.dl_id             : (ex ? ex[30] : ''),
    item.claude_design_url !== undefined ? item.claude_design_url : (ex ? ex[31] : ''),
    item.full_email_body   !== undefined ? item.full_email_body   : (ex ? ex[32] : ''),
    item.icp_code           !== undefined ? item.icp_code           : (ex ? ex[33] : ''),
    item.segment            !== undefined ? item.segment            : (ex ? ex[34] : ''),
    item.target_word_count  !== undefined ? item.target_word_count  : (ex ? ex[35] : ''),
    item.positioning_id     !== undefined ? item.positioning_id     : (ex ? ex[36] : ''),
    item.positioning_version !== undefined ? item.positioning_version : (ex ? ex[37] : ''),
    item.stage_number       !== undefined ? item.stage_number       : (ex ? ex[38] : ''),
    item.variant            !== undefined ? item.variant            : (ex ? ex[39] : ''),
    item.world              !== undefined ? item.world              : (ex ? ex[40] : ''),
    item.generated_by       !== undefined ? item.generated_by       : (ex ? ex[41] : ''),
    item.approved_by_ml     !== undefined ? item.approved_by_ml     : (ex ? ex[42] : ''),
    item.approved_at        !== undefined ? item.approved_at        : (ex ? ex[43] : ''),
    item.klaviyo_flow_id    !== undefined ? item.klaviyo_flow_id    : (ex ? ex[44] : ''),
    item.sent_at            !== undefined ? item.sent_at            : (ex ? ex[45] : ''),
    item.open_rate_actual   !== undefined ? item.open_rate_actual   : (ex ? ex[46] : ''),
    item.ctr_actual         !== undefined ? item.ctr_actual         : (ex ? ex[47] : '')
  ];
  _ccUpsert(sheet, headers, item.id, row);
}

var _SEQ_WORD_COUNT_TARGETS = {
  'SEQ-1':       '150-200',
  'SEQ-2':       '200-300',
  'SEQ-3':       '100-150',
  'SEQ-4':       '150-200',
  'ALPHA':       '100-150',
  'BETA':        '100-150',
  'OB-A':        '100-150',
  'OB-B':        '100-150',
  'OB-ORGANIC':  '100-150',
  'Onboarding':  '100-150'
};

function patchSeqWordCounts(campaignId) {
  var seqs = getEmailSequences(campaignId);
  var updated = 0;
  seqs.forEach(function(seq) {
    var target = _SEQ_WORD_COUNT_TARGETS[seq.sequence_code];
    if (!target || seq.target_word_count === target) return;
    var merged = {};
    for (var k in seq) { merged[k] = seq[k]; }
    merged.target_word_count = target;
    setEmailSequence(merged);
    updated++;
  });
  return { ok: true, updated: updated };
}

function patchSeqMeta(campaignId, patches) {
  // patches: [{sequence_code, icp_code, segment}, ...]
  var seqs = getEmailSequences(campaignId);
  var patchMap = {};
  patches.forEach(function(p){ patchMap[p.sequence_code] = p; });
  var updated = 0;
  seqs.forEach(function(seq){
    var p = patchMap[seq.sequence_code];
    if (!p) return;
    var merged = {};
    for (var k in seq) { merged[k] = seq[k]; }
    merged.icp_code = p.icp_code;
    merged.segment  = p.segment;
    setEmailSequence(merged);
    updated++;
  });
  return {ok: true, updated: updated};
}

// ── AlphaQuestionnaire ────────────────────────────────────────────────────────

function submitAlphaQuestionnaire(data) {
  var sheet = _getCCSheet(_CC_TAB.ALPHA_Q);
  var hdrs  = _CC_HDR.AlphaQuestionnaire;
  var id    = 'AQ-' + new Date().getTime();
  var isPriority = data.walmart_shopper === true || data.walmart_shopper === 'true';
  var row = [
    id,
    _ccNow(),
    data.first_name   || '',
    data.email        || '',
    (data.stores      || []).join(', '),
    isPriority ? 'TRUE' : 'FALSE',
    data.b1_cooks_home          || '', data.b2_dinner_struggle   || '',
    data.b3_takeout             || '', data.b4_waste_groceries   || '',
    data.b5_meal_plan           || '', data.b6_fridge_confusion  || '',
    data.b7_cooks_for_kids      || '', data.b8_dietary_restrictions || '',
    data.dietary_details        || '',
    data.c1_budget_priority     || '', data.c2_smartphone_lists  || '',
    data.c3_meal_planning_app   || '', data.c4_pantry_app        || '',
    data.c5_busy_parent         || '', data.c6_food_waste_money  || '',
    data.c7_try_new_app         || '',
    data.d_comments             || '',
    isPriority ? 'TRUE' : 'FALSE',
    'new'
  ];
  _ccUpsert(sheet, hdrs, id, row);
  return { ok: true, id: id, priority: isPriority };
}

// ── AlphaFeedback ─────────────────────────────────────────────────────────────

function submitAlphaFeedback(data) {
  var sheet = _getCCSheet(_CC_TAB.ALPHA_FB);
  var hdrs  = _CC_HDR.AlphaFeedback;
  var id    = 'AF-' + new Date().getTime();
  var row = [
    id,
    _ccNow(),
    data.first_name            || '',
    data.email                 || '',
    data.q1_tasks_completed    || '',
    data.q1_task_onboarding    || '',
    data.q1_task_add_pantry    || '',
    data.q1_task_create_recipe || '',
    data.q1_task_shopping_cart || '',
    data.q2_confusing          || '',
    data.q3_useful             || '',
    data.q4_recommend          || '',
    data.q4_recommend_why      || '',
    data.q5_fix_before_launch  || '',
    'new'
  ];
  _ccUpsert(sheet, hdrs, id, row);
  return { ok: true, id: id };
}

function submitWaitlistSignup(data) {
  var sheet = _getCCSheet(_CC_TAB.WAITLIST);
  var hdrs  = _CC_HDR.WaitlistSignups;
  var id    = 'WL-' + new Date().getTime();
  var row = [
    id,
    _ccNow(),
    data.email        || '',
    data.lp_variant   || '',
    data.lp_slug      || '',
    data.campaign_id  || 'EC-2026-001',
    data.utm_source   || '',
    data.utm_medium   || '',
    data.utm_campaign || '',
    data.referrer     || '',
    'new'
  ];
  _ccUpsert(sheet, hdrs, id, row);
  return { ok: true, id: id };
}

// ── SocialPosts ───────────────────────────────────────────────────────────────

function _socialRowToObj(r) {
  return {
    id: r[0], campaign_id: r[1], platform: r[2], hook: r[3],
    body_copy: r[4], cta: r[5], hashtags: r[6], image_brief: r[7],
    image_url: r[8] || '',
    scheduled_date: _ccFmtDate(r[9]), scheduled_time: r[10] || '08:00',
    status: r[11],
    dl_id: r[12], utm_url: r[13], posted_url: r[14],
    design_brief:           r[15] || '',
    lp_section_source:      r[16] || '',
    lp_headline_connection: r[17] || '',
    emotional_state:        r[18] || '',
    emotional_destination:  r[19] || '',
    loop_stage:             r[20] || ''
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
    item.image_url      !== undefined ? item.image_url      : (ex ? ex[8]  : ''),
    item.scheduled_date !== undefined ? item.scheduled_date : (ex ? ex[9]  : ''),
    item.scheduled_time !== undefined ? item.scheduled_time : (ex ? ex[10] : '08:00'),
    item.status         !== undefined ? item.status         : (ex ? ex[11] : 'draft'),
    item.dl_id          !== undefined ? item.dl_id          : (ex ? ex[12] : ''),
    item.utm_url               !== undefined ? item.utm_url               : (ex ? ex[13] : ''),
    item.posted_url            !== undefined ? item.posted_url            : (ex ? ex[14] : ''),
    item.design_brief          !== undefined ? item.design_brief          : (ex ? ex[15] : ''),
    item.lp_section_source     !== undefined ? item.lp_section_source     : (ex ? ex[16] : ''),
    item.lp_headline_connection !== undefined ? item.lp_headline_connection : (ex ? ex[17] : ''),
    item.emotional_state       !== undefined ? item.emotional_state       : (ex ? ex[18] : ''),
    item.emotional_destination !== undefined ? item.emotional_destination : (ex ? ex[19] : ''),
    item.loop_stage            !== undefined ? item.loop_stage            : (ex ? ex[20] : ''),
    item.claude_design_url     !== undefined ? item.claude_design_url     : (ex ? ex[21] : '')
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
    pushed_to_production: r[23] === true || String(r[23]).toLowerCase() === 'true',
    campaign_type:         String(r[24] || ''),
    blueprint_code:        String(r[25] || ''),
    icp_codes:             String(r[26] || ''),
    theme:                 String(r[27] || ''),
    publish_day:           String(r[28] || ''),
    ab_test_variant:       String(r[29] || 'none'),
    convert_experiment_id: String(r[30] || ''),
    shared_by_campaigns:   String(r[31] || ''),
    last_traffic_date:     _ccFmtDate(r[32]),
    total_signups:         Number(r[33] || 0)
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
    item.pushed_to_production !== undefined ? item.pushed_to_production : (ex ? ex[23] : false),
    item.campaign_type         !== undefined ? item.campaign_type         : (ex ? ex[24] : ''),
    item.blueprint_code        !== undefined ? item.blueprint_code        : (ex ? ex[25] : ''),
    item.icp_codes             !== undefined ? item.icp_codes             : (ex ? ex[26] : item.icp_code || ''),
    item.theme                 !== undefined ? item.theme                 : (ex ? ex[27] : ''),
    item.publish_day           !== undefined ? item.publish_day           : (ex ? ex[28] : ''),
    item.ab_test_variant       !== undefined ? item.ab_test_variant       : (ex ? ex[29] : 'none'),
    item.convert_experiment_id !== undefined ? item.convert_experiment_id : (ex ? ex[30] : ''),
    item.shared_by_campaigns   !== undefined ? item.shared_by_campaigns   : (ex ? ex[31] : ''),
    item.last_traffic_date     !== undefined ? item.last_traffic_date     : (ex ? ex[32] : ''),
    item.total_signups         !== undefined ? item.total_signups         : (ex ? ex[33] : 0)
  ];
  _ccUpsert(sheet, headers, item.id, row);
  // Keep LPInventory in sync: register slug and link this campaign
  try { _registerLpInInventory(item.slug || row[3], item.campaign_id || row[1], item); } catch(e) {}
}

// ── VideoProduction ───────────────────────────────────────────────────────────

function _videoRowToObj(r) {
  return {
    asset_id: r[0], campaign_id: r[1], platform: r[2], video_type: r[3],
    duration_target: r[4], hook: r[5],
    script_status: r[6], storyboard_status: r[7], storyboard_url: r[8],
    ai_tool: r[9], ai_gen_status: r[10], video_url: r[11],
    edit_status: r[12], thumbnail_status: r[13],
    brief: r[14], publish_date: _ccFmtDate(r[15]), published_url: r[16], notes: r[17],
    created_at: _ccFmtDate(r[18]), updated_at: _ccFmtDate(r[19]),
    lp_section_source:    r[20] || '',
    recognition_moment:   r[21] || '',
    product_reveal_timing: r[22] || '',
    visual_metaphor:      r[23] || ''
  };
}

function getVideoProduction(campaignId) {
  var sheet = _getCCSheet(_CC_TAB.VIDEO_PRODUCTION);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.VideoProduction.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_videoRowToObj);
  if (!campaignId) return rows;
  return rows.filter(function(r) { return r.campaign_id === campaignId; });
}

function setVideoProduction(item) {
  if (!item || !item.asset_id) return;
  var sheet   = _getCCSheet(_CC_TAB.VIDEO_PRODUCTION);
  var headers = _CC_HDR.VideoProduction;
  var ex      = null;
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(item.asset_id)) { ex = rows[i]; break; }
    }
  }
  var now = _ccNow();
  var row = [
    item.asset_id,
    item.campaign_id       !== undefined ? item.campaign_id       : (ex ? ex[1]  : ''),
    item.platform          !== undefined ? item.platform          : (ex ? ex[2]  : ''),
    item.video_type        !== undefined ? item.video_type        : (ex ? ex[3]  : ''),
    item.duration_target   !== undefined ? item.duration_target   : (ex ? ex[4]  : ''),
    item.hook              !== undefined ? item.hook              : (ex ? ex[5]  : ''),
    item.script_status     !== undefined ? item.script_status     : (ex ? ex[6]  : 'draft'),
    item.storyboard_status !== undefined ? item.storyboard_status : (ex ? ex[7]  : 'not_started'),
    item.storyboard_url    !== undefined ? item.storyboard_url    : (ex ? ex[8]  : ''),
    item.ai_tool           !== undefined ? item.ai_tool           : (ex ? ex[9]  : ''),
    item.ai_gen_status     !== undefined ? item.ai_gen_status     : (ex ? ex[10] : 'not_started'),
    item.video_url         !== undefined ? item.video_url         : (ex ? ex[11] : ''),
    item.edit_status       !== undefined ? item.edit_status       : (ex ? ex[12] : 'not_started'),
    item.thumbnail_status  !== undefined ? item.thumbnail_status  : (ex ? ex[13] : 'not_started'),
    item.brief             !== undefined ? item.brief             : (ex ? ex[14] : ''),
    item.publish_date      !== undefined ? item.publish_date      : (ex ? ex[15] : ''),
    item.published_url     !== undefined ? item.published_url     : (ex ? ex[16] : ''),
    item.notes             !== undefined ? item.notes             : (ex ? ex[17] : ''),
    ex ? ex[18] : now,
    now,
    item.lp_section_source     !== undefined ? item.lp_section_source     : (ex ? ex[20] : ''),
    item.recognition_moment    !== undefined ? item.recognition_moment    : (ex ? ex[21] : ''),
    item.product_reveal_timing !== undefined ? item.product_reveal_timing : (ex ? ex[22] : ''),
    item.visual_metaphor       !== undefined ? item.visual_metaphor       : (ex ? ex[23] : '')
  ];
  _ccUpsert(sheet, headers, item.asset_id, row);
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
  if (!slug) return { ok: false, available: false, error: 'slug is required' };
  var sheet   = _getCCSheet(_CC_TAB.PAGES);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: true, available: true };
  var rows = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][3]).trim() === String(slug).trim()) {
      return { ok: true, available: false, conflict_campaign_id: String(rows[i][1]) };
    }
  }
  return { ok: true, available: true };
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
    notes:            r[12] || '',
    start_date:       r[13] || ''
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
    description:      String(r[9]),
    pre_launch_date:  String(r[10]||''),
    launch_date:      String(r[11]||''),
    alpha_start:      String(r[12]||''),
    beta_start:       String(r[13]||'')
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

// ── Fix empty BlueprintConfig and LPInventory tabs — run once from editor ────
// Run → _reseedBlueprintAndLP → check Execution log for "seeded X rows"

function _reseedBlueprintAndLP() {
  var ss = _getCampaignSpreadsheet();
  var bpSheet = _getCCSheet(_CC_TAB.BLUEPRINTS);
  var lpSheet = _getCCSheet(_CC_TAB.LP_INVENTORY);
  var bpBefore = bpSheet.getLastRow() - 1;
  var lpBefore = lpSheet.getLastRow() - 1;
  _seedBlueprintConfig(bpSheet);
  _seedLPInventory(lpSheet);
  Logger.log('BlueprintConfig: ' + bpBefore + ' rows before → ' + (bpSheet.getLastRow()-1) + ' rows after');
  Logger.log('LPInventory: '     + lpBefore + ' rows before → ' + (lpSheet.getLastRow()-1)  + ' rows after');
}

// ── Diagnostic — run from Apps Script editor to verify all sheet tabs ─────────

function _testSheetWiring() {
  Logger.log('CampaignTypes: '    + getCampaignTypes().length    + ' rows');
  Logger.log('FunnelStages: '     + getFunnelStages().length     + ' rows');
  Logger.log('BlueprintConfigs: ' + getBlueprintConfigs().length + ' rows');
  Logger.log('ICPProfiles: '      + getIcpProfiles().length      + ' rows');
  Logger.log('ApprovedClaims: '   + getApprovedClaims().length   + ' rows');
  Logger.log('Channels: '         + getChannels().length         + ' rows');
  Logger.log('PushNotifications: '+ getPushNotifications().length + ' rows');
  Logger.log('ContentCalendar: '  + getContentCalendar().length  + ' rows');
  Logger.log('CampaignMetrics: '  + getCampaignMetrics().length  + ' rows');
  Logger.log('ScheduledPosts: '   + getScheduledPosts().length   + ' rows');
  Logger.log('LPInventory: '      + getLPInventory().length      + ' rows');
}

// ── CcSettings — Campaign Center configurable options ─────────────────────────

function _seedCcSettings(sheet) {
  if (!sheet) return;
  var last = sheet.getLastRow();
  if (last >= 2) {
    var existing = sheet.getRange(2, 1, last - 1, 1).getValues().filter(function(r){ return r[0]; });
    if (existing.length > 0) return; // already seeded — never overwrite
  }
  var rows = [
    // THEME_CATEGORIES — key=slug stored in category column, label=display name
    ['THEME_CATEGORIES','weeknight-wins','Weeknight Wins','',true],
    ['THEME_CATEGORIES','weekend-wins','Weekend Wins','',true],
    ['THEME_CATEGORIES','seasonal','Seasonal','',true],
    ['THEME_CATEGORIES','health','Health','',true],
    ['THEME_CATEGORIES','savings','Savings','',true],
    ['THEME_CATEGORIES','founder','Founder','',true],
    ['THEME_CATEGORIES','program','Program','',true],
    // JOURNEY_TYPES — key=display label, label=slug, extra=default app feature
    ['JOURNEY_TYPES','Weeknight Dinner','weeknight-dinner','COOK',true],
    ['JOURNEY_TYPES','Weekend Occasion','weekend-occasion','PLAN',true],
    ['JOURNEY_TYPES','Special Event','special-event','COOK',true],
    ['JOURNEY_TYPES','Social Gathering','social-gathering','PLAN',true],
    ['JOURNEY_TYPES','Health Goal','health-goal','OPTIMIZE',true],
    ['JOURNEY_TYPES','Savings Goal','savings-goal','TRACK',true],
    ['JOURNEY_TYPES','Grocery Run','grocery-run','SHOP',true],
    ['JOURNEY_TYPES','App Program','app-program','',true],
    // APP_FEATURES — key=code, label=AI context label, extra=screen label for sheet
    ['APP_FEATURES','TRACK','Pantry Intelligence','Pantry view',true],
    ['APP_FEATURES','PLAN','Meal Planning Engine','Meal Plan view',true],
    ['APP_FEATURES','OPTIMIZE','Nutrition Scoring','Nutrition score view',true],
    ['APP_FEATURES','COOK','Recipe Engine','Recipe page',true],
    ['APP_FEATURES','SHOP','Shopping List Generator','Shopping List view',true],
    // CAMPAIGN_ANGLES — key=slug, label=display name
    ['CAMPAIGN_ANGLES','speed','Speed','',true],
    ['CAMPAIGN_ANGLES','savings','Savings','',true],
    ['CAMPAIGN_ANGLES','waste','Waste Reduction','',true],
    ['CAMPAIGN_ANGLES','health','Health','',true],
    ['CAMPAIGN_ANGLES','convenience','Convenience','',true],
    ['CAMPAIGN_ANGLES','community','Community','',true],
    ['CAMPAIGN_ANGLES','founder','Founder','',true],
    // URGENCY_TYPES — key=slug, label=display, extra=auto-suggest urgency line
    ['URGENCY_TYPES','founding-price','Founding price closing','First 5,000 families lock in $7.99/month forever. The rest pay $19.99.',true],
    ['URGENCY_TYPES','spots-running-out','Spots running out','[X] of 5,000 founding spots remaining.',true],
    ['URGENCY_TYPES','launch-countdown','Launch countdown','[X] days until launch.',true],
    ['URGENCY_TYPES','beta-limited','Beta access limited','Beta access closes when spots fill.',true],
    ['URGENCY_TYPES','custom','Custom','',true],
    // EXCLUSIVITY_ANGLES — key=slug, label=display, extra=auto-fill exclusivity line
    ['EXCLUSIVITY_ANGLES','founding-family','Founding family','You are not just joining an app. You are founding the kitchen of the future.',true],
    ['EXCLUSIVITY_ANGLES','alpha-founder','Alpha founder','You were chosen. Help us build this.',true],
    ['EXCLUSIVITY_ANGLES','beta-tester','Beta tester','Real families shaped this before you got here.',true],
    ['EXCLUSIVITY_ANGLES','early-access','Early access','You found this before the world did.',true],
    ['EXCLUSIVITY_ANGLES','personal-invite','Personal invite','This invitation is for you personally.',true],
    // BRAND_PLUG — tagline + origin (read-only display), 8 selectable proof claims
    ['BRAND_PLUG','tagline',  'Your kitchen. In command.',                          '',true],
    ['BRAND_PLUG','origin',   'Built by first responders.',                         '',true],
    ['BRAND_PLUG','proof_001','$1,336/year saved',                                  '',true],
    ['BRAND_PLUG','proof_002','69.5% less food waste',                              '',true],
    ['BRAND_PLUG','proof_003','30 minutes fridge to table',                         '',true],
    ['BRAND_PLUG','proof_004','9 patent-pending technologies',                      '',true],
    ['BRAND_PLUG','proof_005','Registered dietitians. FDA-grade data.',             '',true],
    ['BRAND_PLUG','proof_006','Validated across 10,000 household profiles',         '',true],
    ['BRAND_PLUG','proof_007','Built for working families. Tested by first responders.',  '',true],
    ['BRAND_PLUG','proof_008','Zero shortcuts. Zero guesswork. All home.',          '',true],
    // LP_VARIANTS — key=slug letter used in slug builder, label=display name with angle descriptor
    ['LP_VARIANTS','a',      'A — Money Hook','',true],
    ['LP_VARIANTS','b',      'B — Simplicity','',true],
    ['LP_VARIANTS','c',      'C — Founder',   '',true],
    ['LP_VARIANTS','d',      'D — Alpha',     '',true],
    ['LP_VARIANTS','e',      'E — Beta',      '',true],
    ['LP_VARIANTS','custom', 'Custom',        '',true],
    // LP_PURPOSES — key=value stored in LPInventory sheet, label=display name
    ['LP_PURPOSES','Waitlist',   'Waitlist',   '',true],
    ['LP_PURPOSES','Alpha',      'Alpha',      '',true],
    ['LP_PURPOSES','Beta',       'Beta',       '',true],
    ['LP_PURPOSES','Launch Day', 'Launch Day', '',true],
    ['LP_PURPOSES','Affiliate',  'Affiliate',  '',true],
    ['LP_PURPOSES','Custom',     'Custom',     '',true]
  ];
  rows.forEach(function(row) { sheet.appendRow(row); });
  CacheService.getScriptCache().remove('cc_settings_v1');
  Logger.log('CcSettings: seeded ' + rows.length + ' rows');
}

// Run once from GAS editor to add BRAND_PLUG rows to an existing CcSettings sheet.
function addBrandPlugSettings() {
  var sheet  = _getCCSheet(_CC_TAB.SETTINGS);
  var last   = sheet.getLastRow();
  if (last >= 2) {
    var secs = sheet.getRange(2, 1, last - 1, 1).getValues().map(function(r){ return String(r[0]).toUpperCase(); });
    if (secs.indexOf('BRAND_PLUG') > -1) {
      Logger.log('BRAND_PLUG rows already exist — skipping.');
      return;
    }
  }
  var rows = [
    ['BRAND_PLUG','tagline',  'Your kitchen. In command.',                          '',true],
    ['BRAND_PLUG','origin',   'Built by first responders.',                         '',true],
    ['BRAND_PLUG','proof_001','$1,336/year saved',                                  '',true],
    ['BRAND_PLUG','proof_002','69.5% less food waste',                              '',true],
    ['BRAND_PLUG','proof_003','30 minutes fridge to table',                         '',true],
    ['BRAND_PLUG','proof_004','9 patent-pending technologies',                      '',true],
    ['BRAND_PLUG','proof_005','Registered dietitians. FDA-grade data.',             '',true],
    ['BRAND_PLUG','proof_006','Validated across 10,000 household profiles',         '',true],
    ['BRAND_PLUG','proof_007','Built for working families. Tested by first responders.',  '',true],
    ['BRAND_PLUG','proof_008','Zero shortcuts. Zero guesswork. All home.',          '',true]
  ];
  rows.forEach(function(row) { sheet.appendRow(row); });
  CacheService.getScriptCache().remove('cc_settings_v1');
  Logger.log('BRAND_PLUG: added ' + rows.length + ' rows.');
}

// Run once from GAS editor to add URGENCY_TYPES + EXCLUSIVITY_ANGLES to an existing CcSettings sheet.
function addUrgencyExclusivitySettings() {
  var sheet  = _getCCSheet(_CC_TAB.SETTINGS);
  var last   = sheet.getLastRow();
  var existing = last >= 2 ? sheet.getRange(2, 1, last - 1, 1).getValues().map(function(r){ return String(r[0]).toUpperCase(); }) : [];
  var rows = [];
  if (existing.indexOf('URGENCY_TYPES') < 0) {
    rows = rows.concat([
      ['URGENCY_TYPES','founding-price','Founding price closing','First 5,000 families lock in $7.99/month forever. The rest pay $19.99.',true],
      ['URGENCY_TYPES','spots-running-out','Spots running out','[X] of 5,000 founding spots remaining.',true],
      ['URGENCY_TYPES','launch-countdown','Launch countdown','[X] days until launch.',true],
      ['URGENCY_TYPES','beta-limited','Beta access limited','Beta access closes when spots fill.',true],
      ['URGENCY_TYPES','custom','Custom','',true]
    ]);
  }
  if (existing.indexOf('EXCLUSIVITY_ANGLES') < 0) {
    rows = rows.concat([
      ['EXCLUSIVITY_ANGLES','founding-family','Founding family','You are not just joining an app. You are founding the kitchen of the future.',true],
      ['EXCLUSIVITY_ANGLES','alpha-founder','Alpha founder','You were chosen. Help us build this.',true],
      ['EXCLUSIVITY_ANGLES','beta-tester','Beta tester','Real families shaped this before you got here.',true],
      ['EXCLUSIVITY_ANGLES','early-access','Early access','You found this before the world did.',true],
      ['EXCLUSIVITY_ANGLES','personal-invite','Personal invite','This invitation is for you personally.',true]
    ]);
  }
  if (rows.length === 0) { Logger.log('URGENCY_TYPES and EXCLUSIVITY_ANGLES already exist — skipping.'); return; }
  rows.forEach(function(row) { sheet.appendRow(row); });
  CacheService.getScriptCache().remove('cc_settings_v1');
  Logger.log('addUrgencyExclusivitySettings: added ' + rows.length + ' rows.');
}

// Run once from GAS editor to add LP_VARIANTS + LP_PURPOSES to an existing CcSettings sheet.
function addLpVariantPurposeSettings() {
  var sheet    = _getCCSheet(_CC_TAB.SETTINGS);
  var last     = sheet.getLastRow();
  var existing = last >= 2 ? sheet.getRange(2, 1, last - 1, 1).getValues().map(function(r){ return String(r[0]).toUpperCase(); }) : [];
  var rows = [];
  if (existing.indexOf('LP_VARIANTS') < 0) {
    rows = rows.concat([
      ['LP_VARIANTS','a',      'A — Money Hook','',true],
      ['LP_VARIANTS','b',      'B — Simplicity','',true],
      ['LP_VARIANTS','c',      'C — Founder',   '',true],
      ['LP_VARIANTS','d',      'D — Alpha',     '',true],
      ['LP_VARIANTS','e',      'E — Beta',      '',true],
      ['LP_VARIANTS','custom', 'Custom',        '',true]
    ]);
  }
  if (existing.indexOf('LP_PURPOSES') < 0) {
    rows = rows.concat([
      ['LP_PURPOSES','Waitlist',   'Waitlist',   '',true],
      ['LP_PURPOSES','Alpha',      'Alpha',      '',true],
      ['LP_PURPOSES','Beta',       'Beta',       '',true],
      ['LP_PURPOSES','Launch Day', 'Launch Day', '',true],
      ['LP_PURPOSES','Affiliate',  'Affiliate',  '',true],
      ['LP_PURPOSES','Custom',     'Custom',     '',true]
    ]);
  }
  if (rows.length === 0) { Logger.log('LP_VARIANTS and LP_PURPOSES already exist — skipping.'); return; }
  rows.forEach(function(row) { sheet.appendRow(row); });
  CacheService.getScriptCache().remove('cc_settings_v1');
  Logger.log('addLpVariantPurposeSettings: added ' + rows.length + ' rows.');
}

// ── EC-2026-002 settings patch — full replacement of CcSettings ──────────────
// Replaces ALL existing CcSettings rows with governance-aligned EC-2026-002 data.
// 22 ICP journey types · new brand plug · new campaign angles · updated urgency/exclusivity.
function patchCcSettings002() {
  var sheet    = _getCCSheet(_CC_TAB.SETTINGS);
  var lastRow  = sheet.getLastRow();
  if (lastRow >= 2) sheet.deleteRows(2, lastRow - 1);

  var rows = [
    // THEME_CATEGORIES
    ['THEME_CATEGORIES','life-stage',       'Life Stage',          '',true],
    ['THEME_CATEGORIES','invisible-cost',   'Invisible Cost',      '',true],
    ['THEME_CATEGORIES','habit-memory',     'Habit Memory',        '',true],
    ['THEME_CATEGORIES','kitchen-evolution','Kitchen Evolution',   '',true],
    ['THEME_CATEGORIES','time-reclaim',     'Time Reclaim',        '',true],
    ['THEME_CATEGORIES','smart-nutrition',  'Smart Nutrition',     '',true],
    ['THEME_CATEGORIES','family-budget',    'Family Budget',       '',true],
    ['THEME_CATEGORIES','founder',          'Founder',             '',true],

    // JOURNEY_TYPES — key=icp_code, label=ICP name, extra=primary app feature
    ['JOURNEY_TYPES','super_mom',           'Super Mom',                        'PLAN',    true],
    ['JOURNEY_TYPES','super_mom_money',     'Super Mom — Money Angle',          'TRACK',   true],
    ['JOURNEY_TYPES','super_mom_time',      'Super Mom — Time + Founding',      'PLAN',    true],
    ['JOURNEY_TYPES','budget_family',       'Budget Family',                    'TRACK',   true],
    ['JOURNEY_TYPES','health_optimizer',    'Health Optimizer',                 'OPTIMIZE',true],
    ['JOURNEY_TYPES','professional',        'Working Professional',              'COOK',    true],
    ['JOURNEY_TYPES','alpha_recruit',       'Alpha Recruit',                    '',        true],
    ['JOURNEY_TYPES','single_parent',       'Single Parent',                    'PLAN',    true],
    ['JOURNEY_TYPES','empty_nester',        'Empty Nester',                     'PLAN',    true],
    ['JOURNEY_TYPES','newlywed',            'Newlywed Couple',                  'COOK',    true],
    ['JOURNEY_TYPES','busy_dad',            'Busy Dad',                         'COOK',    true],
    ['JOURNEY_TYPES','large_family',        'Large Family',                     'SHOP',    true],
    ['JOURNEY_TYPES','walmart_shopper',     'Walmart Shopper Alpha',            'SHOP',    true],
    ['JOURNEY_TYPES','fitness_mom',         'Fitness Mom',                      'OPTIMIZE',true],
    ['JOURNEY_TYPES','millennial_couple',   'Millennial Couple',                'COOK',    true],
    ['JOURNEY_TYPES','meal_prep_enthusiast','Meal Prep Enthusiast',             'PLAN',    true],
    ['JOURNEY_TYPES','food_waste_fighter',  'Food Waste Fighter',               'TRACK',   true],
    ['JOURNEY_TYPES','date_night_planner',  'Date Night Planner',               'COOK',    true],
    ['JOURNEY_TYPES','grandparent_cook',    'Grandparent Cook',                 'COOK',    true],
    ['JOURNEY_TYPES','beta_tester',         'Beta Tester',                      '',        true],
    ['JOURNEY_TYPES','pre_launch_visitor',  'Pre-Launch Visitor',               '',        true],
    ['JOURNEY_TYPES','founder_family',      'Founding Family',                  '',        true],

    // APP_FEATURES — key=code, label=AI context description, extra=screen label
    ['APP_FEATURES','TRACK',    'Pantry Intelligence — scans, tracks expiry, stops waste before it starts',                             'Pantry view',         true],
    ['APP_FEATURES','PLAN',     'Meal Planning Engine — builds dinners from what you own before you shop',                              'Meal Plan view',      true],
    ['APP_FEATURES','OPTIMIZE', 'Digital Nutrition Intelligence™ — 6-dimension scoring, FDA-grade data, registered dietitians',         'Nutrition score view',true],
    ['APP_FEATURES','COOK',     'Recipe Engine — 30 minutes, real food, step-by-step from what is already in the fridge',              'Recipe page',         true],
    ['APP_FEATURES','SHOP',     'Smart Shopping List — builds itself, real-time updates, 800k Walmart products, 1-click to cart',       'Shopping List view',  true],

    // CAMPAIGN_ANGLES
    ['CAMPAIGN_ANGLES','life-stage',       'Life Stage — your kitchen evolves with you',                      '',true],
    ['CAMPAIGN_ANGLES','invisible-cost',   'Invisible Cost — $111/month leak, $1,336/year',                   '',true],
    ['CAMPAIGN_ANGLES','habit-memory',     'Habit Memory — still cooking for six, cooking for the life you have now', '',true],
    ['CAMPAIGN_ANGLES','founding-family',  'Founding Family — first 5,000, $7.99 forever',                    '',true],
    ['CAMPAIGN_ANGLES','time-liberation',  'Time Liberation — 30 minutes, mental load lifts',                  '',true],
    ['CAMPAIGN_ANGLES','smart-nutrition',  'Smart Nutrition — Digital Nutrition Intelligence™, dietitians, FDA-grade', '',true],
    ['CAMPAIGN_ANGLES','community-trust',  'Community Trust — built by first responders, real families',       '',true],
    ['CAMPAIGN_ANGLES','date-night',       'Date Night — cooking for the person you love',                     '',true],

    // URGENCY_TYPES — key=slug, label=display, extra=auto-suggest urgency line
    ['URGENCY_TYPES','founding-price',      'Founding Price — forever',    'First 5,000 families lock in $7.99/month forever. The rest pay $19.99.',              true],
    ['URGENCY_TYPES','spots-closing',       'Spots Closing Fast',          '[X] of 5,000 founding spots claimed. Yours is not locked yet.',                       true],
    ['URGENCY_TYPES','launch-countdown',    'Launch Countdown',            '[X] days until The Kitchen That Evolves goes live — July 1.',                          true],
    ['URGENCY_TYPES','life-change-window',  'Life-Change Window',          'This is the moment your kitchen evolves. It starts July 1.',                           true],
    ['URGENCY_TYPES','custom',              'Custom',                      '',                                                                                      true],

    // EXCLUSIVITY_ANGLES — key=slug, label=display, extra=auto-fill exclusivity line
    ['EXCLUSIVITY_ANGLES','founding-family', 'Founding Family',     'You are not just joining an app. You are founding the kitchen that evolves.',         true],
    ['EXCLUSIVITY_ANGLES','early-discovery', 'Early Discovery',     'You found this before the world did. That is not an accident.',                        true],
    ['EXCLUSIVITY_ANGLES','life-stage-fit',  'Life Stage Fit',      'This was built for exactly where your life is right now.',                             true],
    ['EXCLUSIVITY_ANGLES','alpha-founder',   'Alpha Founder',       'You were chosen. Help us build this for every household.',                             true],
    ['EXCLUSIVITY_ANGLES','personal-invite', 'Personal Invite',     'This invitation is for you personally. From the founder.',                             true],

    // BRAND_PLUG — tagline · origin · 8 proof claims
    ['BRAND_PLUG','tagline',   'The app that evolves with your life.',                                 '',true],
    ['BRAND_PLUG','origin',    'Built by first responders. For the families who never stop.',           '',true],
    ['BRAND_PLUG','proof_001', '$1,336. Back in your account. Every year.',                            '',true],
    ['BRAND_PLUG','proof_002', '69.5% less food waste. Measured. Not estimated.',                      '',true],
    ['BRAND_PLUG','proof_003', 'Dinner in 30 minutes from what you already have.',                    '',true],
    ['BRAND_PLUG','proof_004', '9 patent-pending technologies.',                                       '',true],
    ['BRAND_PLUG','proof_005', 'Clinical grade nutrition data, verified by registered dietitians.',    '',true],
    ['BRAND_PLUG','proof_006', 'Built on 10,000 real household profiles. Not crowdsourced.',           '',true],
    ['BRAND_PLUG','proof_007', 'Built by first responders. Tested by the families who needed it most.','',true],
    ['BRAND_PLUG','proof_008', 'Powered by Digital Nutrition Intelligence™',                           '',true],

    // LP_VARIANTS
    ['LP_VARIANTS','waitlist-a','A — Founding Price (founding price angle, $7.99/month forever)','',true],
    ['LP_VARIANTS','waitlist-b','B — Life Change (life stage angle, kitchen evolves with you)', '',true],
    ['LP_VARIANTS','custom',    'Custom',                                                        '',true],

    // LP_PURPOSES
    ['LP_PURPOSES','Waitlist',   'Waitlist',   '',true],
    ['LP_PURPOSES','Alpha',      'Alpha',      '',true],
    ['LP_PURPOSES','Beta',       'Beta',       '',true],
    ['LP_PURPOSES','Launch Day', 'Launch Day', '',true],
    ['LP_PURPOSES','Affiliate',  'Affiliate',  '',true],
    ['LP_PURPOSES','Custom',     'Custom',     '',true]
  ];

  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  CacheService.getScriptCache().remove('cc_settings_v1');
  Logger.log('[patchCcSettings002] ' + rows.length + ' rows written');
  return { ok: true, rows: rows.length };
}

// Look up a single LPInventory record by slug — used by LP Builder to reload SEO data.
function getLPInventoryBySlug(slug) {
  if (!slug) return null;
  var sheet = _getCCSheet(_CC_TAB.LP_INVENTORY);
  var last  = sheet.getLastRow();
  if (last < 2) return null;
  var hLen = _CC_HDR.LPInventory.length;
  var rows = sheet.getRange(2, 1, last - 1, hLen).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][1]).trim() === String(slug).trim()) return _lpInvRowToObj(rows[i]);
  }
  return null;
}

function getCcSettings() {
  var cache   = CacheService.getScriptCache();
  var cached  = cache.get('cc_settings_v1');
  if (cached) { try { return JSON.parse(cached); } catch(e) {} }

  var sheet = _getCCSheet(_CC_TAB.SETTINGS);
  if (sheet.getLastRow() < 2) _seedCcSettings(sheet);

  var result = { theme_categories:[], journey_types:[], app_features:[], campaign_angles:[], brand_plug:[], urgency_types:[], exclusivity_angles:[], lp_variants:[], lp_purposes:[] };
  var last   = sheet.getLastRow();
  if (last < 2) { cache.put('cc_settings_v1', JSON.stringify(result), 300); return result; }

  sheet.getRange(2, 1, last - 1, 5).getValues().forEach(function(r) {
    if (!r[0]) return;
    var sec    = String(r[0]).toUpperCase();
    var isActive = r[4] === true || String(r[4]).toLowerCase() === 'true';
    if (!isActive) return;
    var row = { key: String(r[1]||''), label: String(r[2]||''), extra: String(r[3]||'') };
    if      (sec === 'THEME_CATEGORIES') result.theme_categories.push(row);
    else if (sec === 'JOURNEY_TYPES')    result.journey_types.push(row);
    else if (sec === 'APP_FEATURES')     result.app_features.push(row);
    else if (sec === 'CAMPAIGN_ANGLES')  result.campaign_angles.push(row);
    else if (sec === 'BRAND_PLUG')       result.brand_plug.push(row);
    else if (sec === 'URGENCY_TYPES')      result.urgency_types.push(row);
    else if (sec === 'EXCLUSIVITY_ANGLES') result.exclusivity_angles.push(row);
    else if (sec === 'LP_VARIANTS')        result.lp_variants.push(row);
    else if (sec === 'LP_PURPOSES')        result.lp_purposes.push(row);
  });

  cache.put('cc_settings_v1', JSON.stringify(result), 300);
  return result;
}

function saveSettings(section, rows) {
  if (!section || !Array.isArray(rows)) return false;
  var sheet    = _getCCSheet(_CC_TAB.SETTINGS);
  var secUpper = section.toUpperCase();
  var last     = sheet.getLastRow();
  if (last >= 2) {
    var allVals = sheet.getRange(2, 1, last - 1, 1).getValues();
    for (var i = allVals.length - 1; i >= 0; i--) {
      if (String(allVals[i][0]).toUpperCase() === secUpper) sheet.deleteRow(i + 2);
    }
  }
  rows.forEach(function(row) {
    sheet.appendRow([secUpper, row.key||'', row.label||'', row.extra||'', row.active!==false]);
  });
  CacheService.getScriptCache().remove('cc_settings_v1');
  return true;
}

function appendSettingRow(section, key, label, extra) {
  if (!section || !key) return false;
  var sheet    = _getCCSheet(_CC_TAB.SETTINGS);
  var secUpper = section.toUpperCase();
  var last     = sheet.getLastRow();
  if (last >= 2) {
    var vals = sheet.getRange(2, 1, last - 1, 2).getValues();
    for (var i = 0; i < vals.length; i++) {
      if (String(vals[i][0]).toUpperCase() === secUpper && String(vals[i][1]) === key) return false;
    }
  }
  sheet.appendRow([secUpper, key, label || '', extra || '', true]);
  CacheService.getScriptCache().remove('cc_settings_v1');
  return true;
}

function deleteSettingRow(section, key) {
  if (!section || !key) return false;
  var sheet    = _getCCSheet(_CC_TAB.SETTINGS);
  var secUpper = section.toUpperCase();
  var last     = sheet.getLastRow();
  if (last < 2) return false;
  var vals = sheet.getRange(2, 1, last - 1, 2).getValues();
  for (var i = vals.length - 1; i >= 0; i--) {
    if (String(vals[i][0]).toUpperCase() === secUpper && String(vals[i][1]) === key) {
      sheet.deleteRow(i + 2);
    }
  }
  CacheService.getScriptCache().remove('cc_settings_v1');
  return true;
}

// ── Append additional CcSettings rows (run once from Apps Script editor) ──────

function _appendCcSettingsRows() {
  var sheet = _getCCSheet(_CC_TAB.SETTINGS);
  var last  = sheet.getLastRow();

  // Build index of existing section+key pairs to prevent duplicates
  var seen = {};
  if (last >= 2) {
    sheet.getRange(2, 1, last - 1, 2).getValues().forEach(function(r) {
      var sec = String(r[0]).toUpperCase();
      var key = String(r[1]);
      if (!seen[sec]) seen[sec] = {};
      seen[sec][key] = true;
    });
  }

  var rows = [
    // ── THEME_CATEGORIES ──────────────────────────────────────────────────────
    ['THEME_CATEGORIES','date-night',       'Date Night',            '', true],
    ['THEME_CATEGORIES','picnic',           'Picnic & Outdoor',      '', true],
    ['THEME_CATEGORIES','special-occasion', 'Special Occasion',      '', true],
    ['THEME_CATEGORIES','meal-prep',        'Meal Prep',             '', true],
    ['THEME_CATEGORIES','family-gathering', 'Family Gathering',      '', true],
    ['THEME_CATEGORIES','quick-wins',       'Quick Wins',            '', true],
    ['THEME_CATEGORIES','budget-friendly',  'Budget Friendly',       '', true],
    ['THEME_CATEGORIES','pre-launch',       'Pre-Launch',            '', true],
    ['THEME_CATEGORIES','alpha-program',    'Alpha Program',         '', true],
    ['THEME_CATEGORIES','beta-program',     'Beta Program',          '', true],
    ['THEME_CATEGORIES','holiday',          'Holiday',               '', true],
    ['THEME_CATEGORIES','game-day',         'Game Day',              '', true],
    ['THEME_CATEGORIES','lunch-prep',       'Lunch Prep',            '', true],
    ['THEME_CATEGORIES','breakfast-wins',   'Breakfast Wins',        '', true],
    ['THEME_CATEGORIES','snack-attack',     'Snack Attack',          '', true],
    ['THEME_CATEGORIES','leftovers',        'Leftovers',             '', true],
    ['THEME_CATEGORIES','birthday',         'Birthday & Celebrations','',true],
    ['THEME_CATEGORIES','summer',           'Summer Eats',           '', true],
    ['THEME_CATEGORIES','winter',           'Winter Comfort',        '', true],
    ['THEME_CATEGORIES','founders-journey', 'Founders Journey',      '', true],
    // ── JOURNEY_TYPES ─────────────────────────────────────────────────────────
    ['JOURNEY_TYPES','date-night',          'Date Night',            'COOK',    true],
    ['JOURNEY_TYPES','picnic',              'Picnic Planning',       'PLAN',    true],
    ['JOURNEY_TYPES','family-gathering',    'Family Gathering',      'COOK',    true],
    ['JOURNEY_TYPES','meal-prep-sunday',    'Meal Prep Sunday',      'PLAN',    true],
    ['JOURNEY_TYPES','quick-dinner',        'Quick Dinner Under 30', 'COOK',    true],
    ['JOURNEY_TYPES','grocery-budget',      'Grocery Budget',        'TRACK',   true],
    ['JOURNEY_TYPES','nutrition-goal',      'Nutrition Goal',        'OPTIMIZE',true],
    ['JOURNEY_TYPES','pre-launch-waitlist', 'Pre-Launch Waitlist',   '',        true],
    ['JOURNEY_TYPES','alpha-onboarding',    'Alpha Onboarding',      'TRACK',   true],
    ['JOURNEY_TYPES','beta-testing',        'Beta Testing',          'COOK',    true],
    ['JOURNEY_TYPES','holiday-prep',        'Holiday Prep',          'PLAN',    true],
    ['JOURNEY_TYPES','game-night',          'Game Night',            'COOK',    true],
    ['JOURNEY_TYPES','kids-lunchbox',       'Kids Lunchbox',         'PLAN',    true],
    ['JOURNEY_TYPES','breakfast-prep',      'Breakfast Prep',        'PLAN',    true],
    ['JOURNEY_TYPES','leftovers-rescue',    'Leftovers Rescue',      'COOK',    true],
    ['JOURNEY_TYPES','birthday-dinner',     'Birthday Dinner',       'COOK',    true],
    ['JOURNEY_TYPES','summer-grill',        'Summer Grilling',       'COOK',    true],
    ['JOURNEY_TYPES','winter-comfort',      'Winter Comfort Food',   'COOK',    true],
    ['JOURNEY_TYPES','founders-journey',    'Founders Journey',      '',        true],
    ['JOURNEY_TYPES','pantry-cleanout',     'Pantry Clean Out',      'TRACK',   true],
    // ── APP_FEATURES (sub-features only — 5 core already seeded) ─────────────
    ['APP_FEATURES','receipt-scanning', 'Receipt Scanning (TRACK)',       'Pantry view',        true],
    ['APP_FEATURES','expiry-alerts',    'Expiry Alerts (TRACK)',          'Pantry view',        true],
    ['APP_FEATURES','pantry-inventory', 'Pantry Inventory (TRACK)',       'Pantry view',        true],
    ['APP_FEATURES','waste-tracker',    'Waste Tracker (TRACK)',          'Pantry view',        true],
    ['APP_FEATURES','weekly-meal-plan', 'Weekly Meal Plan (PLAN)',        'Meal Plan view',     true],
    ['APP_FEATURES','recipe-suggestions','Recipe Suggestions (PLAN)',     'Meal Plan view',     true],
    ['APP_FEATURES','nutrition-scoring','Nutrition Score View (OPTIMIZE)','Nutrition score view',true],
    ['APP_FEATURES','meal-rating',      'Meal Rating (OPTIMIZE)',         'Nutrition score view',true],
    ['APP_FEATURES','fda-grade-data',   'FDA Grade Data (OPTIMIZE)',      'Nutrition score view',true],
    ['APP_FEATURES','step-by-step',     'Step by Step Cooking (COOK)',    'Recipe page',        true],
    ['APP_FEATURES','30-min-recipes',   '30 Minute Recipes (COOK)',       'Recipe page',        true],
    ['APP_FEATURES','walmart-cart',     'Walmart Cart (SHOP)',            'Shopping List view', true],
    ['APP_FEATURES','smart-list',       'Smart List Generator (SHOP)',    'Shopping List view', true],
    ['APP_FEATURES','restock-alerts',   'Restock Alerts (SHOP)',          'Shopping List view', true],
    ['APP_FEATURES','budget-tracker',   'Budget Tracker (SHOP)',          'Shopping List view', true],
    // ── CAMPAIGN_ANGLES (13 new — 7 already seeded) ──────────────────────────
    ['CAMPAIGN_ANGLES','romance',        'Romance',               '', true],
    ['CAMPAIGN_ANGLES','celebration',    'Celebration',           '', true],
    ['CAMPAIGN_ANGLES','discovery',      'Discovery',             '', true],
    ['CAMPAIGN_ANGLES','urgency',        'Urgency',               '', true],
    ['CAMPAIGN_ANGLES','nostalgia',      'Nostalgia',             '', true],
    ['CAMPAIGN_ANGLES','empowerment',    'Empowerment',           '', true],
    ['CAMPAIGN_ANGLES','trust',          'Trust Building',        '', true],
    ['CAMPAIGN_ANGLES','exclusivity',    'Exclusivity',           '', true],
    ['CAMPAIGN_ANGLES','simplicity',     'Simplicity',            '', true],
    ['CAMPAIGN_ANGLES','transformation', 'Transformation',        '', true],
    ['CAMPAIGN_ANGLES','family',         'Family First',          '', true],
    ['CAMPAIGN_ANGLES','pride',          'Pride & Accomplishment','', true],
    ['CAMPAIGN_ANGLES','adventure',      'Culinary Adventure',    '', true]
  ];

  var added = 0;
  rows.forEach(function(row) {
    var sec = String(row[0]).toUpperCase();
    var key = String(row[1]);
    if (!seen[sec]) seen[sec] = {};
    if (seen[sec][key]) return; // skip duplicate
    sheet.appendRow(row);
    seen[sec][key] = true;
    added++;
  });

  CacheService.getScriptCache().remove('cc_settings_v1');
  Logger.log('_appendCcSettingsRows: added ' + added + ' rows (skipped existing)');
  try { SpreadsheetApp.getUi().alert('Done — added ' + added + ' rows to CcSettings.'); } catch(e) {}
}

// ── Debug + cache-clear — run from Apps Script editor to verify CcSettings ────

function _debugCcSettings() {
  CacheService.getScriptCache().remove('cc_settings_v1');
  Logger.log('Cache cleared.');

  var sheet = _getCCSheet(_CC_TAB.SETTINGS);
  var last  = sheet.getLastRow();
  Logger.log('CcSettings sheet: lastRow=' + last);

  if (last < 1) { Logger.log('Sheet is completely empty.'); return; }
  var rows = sheet.getRange(1, 1, Math.min(last, 11), 5).getValues();
  rows.forEach(function(r, i) {
    Logger.log('Row ' + (i + 1) + ': section=[' + r[0] + '] key=[' + r[1] + '] label=[' + r[2] + '] extra=[' + r[3] + '] active=[' + r[4] + '] (typeof=' + typeof r[4] + ')');
  });

  var result = getCcSettings();
  Logger.log('getCcSettings() → theme_categories:' + result.theme_categories.length +
             ' journey_types:'  + result.journey_types.length  +
             ' app_features:'   + result.app_features.length   +
             ' campaign_angles:'+ result.campaign_angles.length);
}

// ── Full end-to-end Campaign Center test ─────────────────────────────────────
// Run from Apps Script editor: Run → _testCampaignCenterFull → View → Execution log

function _testCampaignCenterFull() {
  var results = [];

  function check(name, fn) {
    try {
      var result = fn();
      results.push({ test: name, pass: result.pass, note: result.note || '' });
    } catch(e) {
      results.push({ test: name, pass: false, note: 'ERROR: ' + e.message });
    }
  }

  // ─── TEST SUITE 1 — SHEET DATA READS ─────────────────────────────────────

  check('ICPProfiles read', function() {
    var r = getIcpProfiles();
    return { pass: r.length >= 5, note: r.length + ' profiles' };
  });

  check('ApprovedClaims read', function() {
    var r = getApprovedClaims();
    return { pass: r.length >= 10, note: r.length + ' claims' };
  });

  check('Channels read', function() {
    var r = getChannels();
    return { pass: r.length >= 10, note: r.length + ' channels' };
  });

  check('CampaignTypes read', function() {
    var r = getCampaignTypes();
    return { pass: r.length >= 5, note: r.length + ' types' };
  });

  check('FunnelStages read', function() {
    var r = getFunnelStages();
    return { pass: r.length === 7, note: r.length + ' stages' };
  });

  check('BlueprintConfigs read', function() {
    var r = getBlueprintConfigs();
    return { pass: r.length >= 7, note: r.length + ' blueprints' };
  });

  check('LPInventory read', function() {
    var r = getLPInventory();
    return { pass: r.length >= 3, note: r.length + ' LPs' };
  });

  // ─── TEST SUITE 2 — CAMPAIGN KICKSTART ───────────────────────────────────
  // campaignKickstart() returns { ok, campaign: { icp_match, blueprint, ... } }

  check('Kickstart — Super Mom Facebook', function() {
    var result = campaignKickstart(
      'Busy mom, 35, two kids, $75K income, ' +
      'wastes half her groceries, orders DoorDash ' +
      '3x per week. Goal: waitlist signups on Facebook.'
    );
    var c = result.campaign || {};
    return {
      pass: result.ok === true && !!c.icp_match && !!c.blueprint && c.cta_type === 'waitlist',
      note: JSON.stringify({
        icp:       c.icp_match,
        blueprint: c.blueprint,
        channel:   c.channel_recommendation,
        cta_type:  c.cta_type,
        post_count:c.post_count
      })
    };
  });

  check('Kickstart — Structured Taco Tuesday', function() {
    var result = campaignKickstart(
      'ICP: Busy mom who loves Taco Tuesday\n' +
      'GOAL: Waitlist signups\n' +
      'CHANNEL: Facebook + Instagram\n' +
      'BLUEPRINT: A-Waitlist\n' +
      'THEME: Taco Tuesday\n' +
      'PUBLISH DAY: Tuesday\n' +
      'POSTS: 7\n' +
      'URGENCY: Founding price ends at 5,000 families'
    );
    var c = result.campaign || {};
    return {
      pass: result.ok === true && c.theme === 'Taco Tuesday' && c.publish_day === 'Tuesday',
      note: JSON.stringify({
        theme:       c.theme,
        publish_day: c.publish_day,
        channels:    c.channels,
        post_count:  c.post_count
      })
    };
  });

  // ─── TEST SUITE 3 — ASSET BUILDER ────────────────────────────────────────

  var testBrief = {
    id:              'test-001',
    name:            'Test Campaign',
    icp:             'super_mom',
    channel:         'Facebook',
    channels:        ['Facebook', 'Instagram', 'Email'],
    funnel:          'A-Waitlist',
    cta_type:        'waitlist',
    post_count:      7,
    slug:            'lp/waitlist-a',
    campaign_angle:  'savings',
    urgency_trigger: 'Founding price $7.99/month ends at 5,000 families',
    theme:           '',
    publish_day:     ''
  };

  var testCopy = {
    headline:        'Stop the 6:30 PM dinner panic',
    social_hook:     'Your family threw away $1,336 last year',
    cta_primary:     'Join the waitlist free',
    proof_bar:       ['$1,336/year savings', '69.5% less food waste', '30 minutes fridge to table'],
    problem_block:   'Every week you buy groceries with good intentions. Half ends up in the bin.',
    agitate_block:   'That is $111/month — $1,336 a year — going straight to the trash.',
    solve_block:     'easyChef Pro builds your weekly plan from exactly what is already in your fridge.',
    urgency_trigger: 'Founding price $7.99/month ends at 5,000 families'
  };

  // buildSocialPosts returns { ok, posts: [...] }
  check('buildSocialPosts — single channel Facebook', function() {
    var result = buildSocialPosts(testBrief, testCopy);
    return {
      pass: result.ok === true && Array.isArray(result.posts) && result.posts.length >= 5,
      note: result.ok
        ? result.posts.length + ' posts'
        : (result.error || 'unknown error')
    };
  });

  // buildMultiChannelPosts returns { ok, posts: [...], stagger_schedule: [...] }
  // Email is skipped (handled separately) — only Facebook + Instagram post
  check('buildMultiChannelPosts — Facebook + Instagram', function() {
    var result = buildMultiChannelPosts(testBrief, testCopy);
    return {
      pass: result.ok === true && Array.isArray(result.posts) && result.posts.length >= 5,
      note: result.ok
        ? result.posts.length + ' posts across channels'
        : (result.error || 'unknown error')
    };
  });

  // buildEmailSequence returns { ok, sequence: [...] }
  check('buildEmailSequence — waitlist 8-email sequence', function() {
    var result = buildEmailSequence(testBrief, testCopy);
    return {
      pass: result.ok === true && Array.isArray(result.sequence) && result.sequence.length >= 1,
      note: result.ok
        ? result.sequence.length + ' emails'
        : (result.error || 'unknown error')
    };
  });

  // ─── RESULTS SUMMARY ─────────────────────────────────────────────────────

  Logger.log('══════════════════════════════════════════════════');
  Logger.log('  CAMPAIGN CENTER FULL TEST — ' + new Date().toLocaleString());
  Logger.log('══════════════════════════════════════════════════');
  var pass = 0, fail = 0;
  results.forEach(function(r) {
    Logger.log((r.pass ? 'PASS' : 'FAIL') + ' │ ' + r.test + (r.note ? ' │ ' + r.note : ''));
    if (r.pass) pass++; else fail++;
  });
  Logger.log('──────────────────────────────────────────────────');
  Logger.log('TOTAL: ' + pass + ' passed, ' + fail + ' failed out of ' + results.length);
  Logger.log('══════════════════════════════════════════════════');
}

// ── PushNotifications ─────────────────────────────────────────────────────────

function _pushRowToObj(r) {
  return {
    id:             String(r[0]  || ''),
    campaign_id:    String(r[1]  || ''),
    push_number:    Number(r[2]  || 0),
    title:          String(r[3]  || ''),
    body:           String(r[4]  || ''),
    deep_link_url:  String(r[5]  || ''),
    funnel_stage:   String(r[6]  || ''),
    scheduled_date: _ccFmtDate(r[7]),
    platform:       String(r[8]  || ''),
    status:         String(r[9]  || 'draft'),
    sent_at:        _ccFmtDate(r[10]),
    open_rate:      String(r[11] || ''),
    created_at:     _ccFmtDate(r[12])
  };
}

function getPushNotifications(campaignId) {
  var sheet = _getCCSheet(_CC_TAB.PUSH_NOTIFS);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.PushNotifications.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_pushRowToObj);
  if (!campaignId) return rows;
  return rows.filter(function(r) { return r.campaign_id === campaignId; });
}

function setPushNotification(item) {
  if (!item || !item.id) return;
  var sheet   = _getCCSheet(_CC_TAB.PUSH_NOTIFS);
  var headers = _CC_HDR.PushNotifications;
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
    item.campaign_id    !== undefined ? item.campaign_id    : (ex ? ex[1]  : ''),
    item.push_number    !== undefined ? item.push_number    : (ex ? ex[2]  : ''),
    item.title          !== undefined ? item.title          : (ex ? ex[3]  : ''),
    item.body           !== undefined ? item.body           : (ex ? ex[4]  : ''),
    item.deep_link_url  !== undefined ? item.deep_link_url  : (ex ? ex[5]  : ''),
    item.funnel_stage   !== undefined ? item.funnel_stage   : (ex ? ex[6]  : ''),
    item.scheduled_date !== undefined ? item.scheduled_date : (ex ? ex[7]  : ''),
    item.platform       !== undefined ? item.platform       : (ex ? ex[8]  : ''),
    item.status         !== undefined ? item.status         : (ex ? ex[9]  : 'draft'),
    item.sent_at        !== undefined ? item.sent_at        : (ex ? ex[10] : ''),
    item.open_rate      !== undefined ? item.open_rate      : (ex ? ex[11] : ''),
    ex ? ex[12] : now
  ];
  _ccUpsert(sheet, headers, item.id, row);
}

// ── ContentCalendar ───────────────────────────────────────────────────────────

// updateContentCalField — write creative_status or approval_status for one asset.
// Whitelisted to only those two fields to prevent arbitrary sheet writes.
function updateContentCalField(assetId, field, value) {
  var ALLOWED = {
    creative_status: ['generated','in_figma','designer_review','approved'],
    approval_status: ['pending','approved','rejected']
  };
  if (!assetId)              return { ok: false, error: 'assetId required' };
  if (!ALLOWED[field])       return { ok: false, error: 'field not allowed: ' + field };
  if (ALLOWED[field].indexOf(value) === -1) return { ok: false, error: 'invalid value: ' + value };

  try {
    var sheet   = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last    = sheet.getLastRow();
    if (last < 2) return { ok: false, error: 'ContentCalendar empty' };

    var headers = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var H = {};
    headers.forEach(function(h, i) { H[h] = i; });

    var assetCol   = H.asset_id   + 1;
    var fieldCol   = H[field]     + 1;
    var updatedCol = H.updated_at + 1;

    var ids = sheet.getRange(2, assetCol, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(assetId)) {
        var row = i + 2;
        sheet.getRange(row, fieldCol).setValue(value);
        sheet.getRange(row, updatedCol).setValue(new Date());
        Logger.log('[updateContentCalField] ' + assetId + '.' + field + ' → ' + value);
        return { ok: true, asset_id: assetId, field: field, value: value, row: row };
      }
    }
    return { ok: false, error: 'asset not found: ' + assetId };
  } catch(e) {
    Logger.log('[updateContentCalField] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// saveClaudeDesignUrl — writes a design artifact URL to ContentCalendar.claude_design_url.
function saveClaudeDesignUrl(assetId, url) {
  if (!assetId) return { ok: false, error: 'assetId required' };
  try {
    var sheet   = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last    = sheet.getLastRow();
    if (last < 2) return { ok: false, error: 'ContentCalendar empty' };
    var headers = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var H = {};
    headers.forEach(function(h, i) { H[h] = i; });
    var safeColCount = Math.min(headers.length, sheet.getLastColumn());
    var designCol  = H.claude_design_url + 1;
    var updatedCol = H.updated_at        + 1;
    var ids = sheet.getRange(2, H.asset_id + 1, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(assetId)) {
        var row = i + 2;
        if (designCol  <= safeColCount) sheet.getRange(row, designCol).setValue(String(url || ''));
        if (updatedCol <= safeColCount) sheet.getRange(row, updatedCol).setValue(new Date());
        Logger.log('[saveClaudeDesignUrl] ' + assetId + ' → ' + url);
        return { ok: true, asset_id: assetId, url: url };
      }
    }
    return { ok: false, error: 'asset not found: ' + assetId };
  } catch(e) {
    Logger.log('[saveClaudeDesignUrl] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// appendContentCalNote — prepends a timestamped note to ContentCalendar.notes for one asset.
function appendContentCalNote(assetId, text, author) {
  if (!assetId) return { ok: false, error: 'assetId required' };
  if (!text || !String(text).trim()) return { ok: false, error: 'note text required' };
  try {
    var sheet   = _getCCSheet(_CC_TAB.CONTENT_CAL);
    var last    = sheet.getLastRow();
    if (last < 2) return { ok: false, error: 'ContentCalendar empty' };

    var headers = _CC_HDR[_CC_TAB.CONTENT_CAL];
    var H = {};
    headers.forEach(function(h, i) { H[h] = i; });

    var assetCol   = H.asset_id   + 1;
    var notesCol   = H.notes      + 1;
    var updatedCol = H.updated_at + 1;

    var ids = sheet.getRange(2, assetCol, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(assetId)) {
        var row      = i + 2;
        var existing = String(sheet.getRange(row, notesCol).getValue() || '');
        var ts       = Utilities.formatDate(new Date(), 'America/Los_Angeles', 'MMM d, h:mm a');
        var byLine   = author ? ts + ' · ' + author : ts;
        var entry    = '[' + byLine + ']\n' + String(text).trim();
        var updated  = existing ? entry + '\n\n---\n\n' + existing : entry;
        sheet.getRange(row, notesCol).setValue(updated);
        sheet.getRange(row, updatedCol).setValue(new Date());
        Logger.log('[appendContentCalNote] ' + assetId + ' by ' + (author||'anon'));
        return { ok: true, asset_id: assetId, notes: updated };
      }
    }
    return { ok: false, error: 'asset not found: ' + assetId };
  } catch(e) {
    Logger.log('[appendContentCalNote] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

function _calRowToObj(r) {
  return {
    calendar_id:      String(r[0]  || ''),
    asset_id:         String(r[1]  || ''),
    campaign_id:      String(r[2]  || ''),
    platform:         String(r[3]  || ''),
    account:          String(r[4]  || ''),
    publish_date:     _ccFmtDate(r[5]),
    publish_time:     String(r[6]  || ''),
    timezone:         String(r[7]  || ''),
    status:           String(r[8]  || 'generated'),
    approval_status:  String(r[9]  || 'pending'),
    creative_status:  String(r[10] || 'generated'),
    caption:          String(r[11] || ''),
    hashtags:         String(r[12] || ''),
    dl_id:            String(r[13] || ''),
    utm_url:          String(r[14] || ''),
    figma_export_url: String(r[15] || ''),
    final_asset_url:  String(r[16] || ''),
    publisher:        String(r[17] || ''),
    scheduled_url:    String(r[18] || ''),
    published_url:    String(r[19] || ''),
    notes:            String(r[20] || ''),
    day:              Number(r[21] || 0),
    week:             Number(r[22] || 0),
    funnel_stage:     String(r[23] || ''),
    emotional_stage:  String(r[24] || ''),
    icp_target:       String(r[25] || ''),
    experiment_id:    String(r[26] || ''),
    blocked_by:       String(r[27] || ''),
    created_at:       _ccFmtDate(r[28]),
    updated_at:       _ccFmtDate(r[29])
  };
}

function getContentCalendar(campaignId) {
  var sheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.ContentCalendar.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_calRowToObj);
  if (!campaignId) return rows;
  return rows.filter(function(r) { return r.campaign_id === campaignId; });
}

function setContentCalendarEntry(item) {
  // Accepts both new schema fields and old field names (backward compat for timeline function).
  // Old callers use: item.id, item.channel, item.scheduled_date — mapped to new columns.
  var calId = item.calendar_id || item.id;
  if (!calId) return;
  var sheet   = _getCCSheet(_CC_TAB.CONTENT_CAL);
  var headers = _CC_HDR.ContentCalendar;
  var now     = _ccNow();
  var ex      = null;
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    var rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(calId)) { ex = rows[i]; break; }
    }
  }
  function _v(newKey, oldKey, exIdx, def) {
    if (item[newKey] !== undefined) return item[newKey];
    if (oldKey && item[oldKey] !== undefined) return item[oldKey];
    return ex ? ex[exIdx] : (def !== undefined ? def : '');
  }
  var row = [
    calId,
    _v('asset_id',         null,              1,  ''),
    _v('campaign_id',      null,              2,  ''),
    _v('platform',         'channel',         3,  ''),
    _v('account',          null,              4,  ''),
    _v('publish_date',     'scheduled_date',  5,  ''),
    _v('publish_time',     null,              6,  ''),
    _v('timezone',         null,              7,  ''),
    _v('status',           null,              8,  'generated'),
    _v('approval_status',  null,              9,  'pending'),
    _v('creative_status',  null,              10, 'generated'),
    _v('caption',          null,              11, ''),
    _v('hashtags',         null,              12, ''),
    _v('dl_id',            null,              13, ''),
    _v('utm_url',          null,              14, ''),
    _v('figma_export_url', null,              15, ''),
    _v('final_asset_url',  null,              16, ''),
    _v('publisher',        null,              17, ''),
    _v('scheduled_url',    null,              18, ''),
    _v('published_url',    null,              19, ''),
    _v('notes',            'theme',           20, ''),
    _v('day',              'day_number',      21, ''),
    _v('week',             null,              22, ''),
    _v('funnel_stage',     null,              23, ''),
    _v('emotional_stage',  null,              24, ''),
    _v('icp_target',       null,              25, ''),
    _v('experiment_id',    null,              26, ''),
    _v('blocked_by',       null,              27, ''),
    ex ? ex[28] : now,
    now
  ];
  _ccUpsert(sheet, headers, calId, row);
}

/**
 * Moves a single asset to a new publish date.
 * Updates ContentCalendar.publish_date and SocialPosts.scheduled_date.
 * body: { asset_id, calendar_id, new_date: 'YYYY-MM-DD' }
 */
function moveAsset(body) {
  var calendarId = String(body.calendar_id || '');
  var assetId    = String(body.asset_id || '');
  var newDate    = String(body.new_date || '');
  if (!newDate) return {ok:false, error:'new_date required'};
  try {
    if (calendarId) {
      var calSheet = _getCCSheet(_CC_TAB.CONTENT_CAL);
      var calHdr   = _CC_HDR[_CC_TAB.CONTENT_CAL];
      var dateCol  = calHdr.indexOf('publish_date') + 1;
      if (dateCol > 0) {
        var calRows = calSheet.getDataRange().getValues();
        for (var i = 1; i < calRows.length; i++) {
          if (String(calRows[i][0]) === calendarId) {
            calSheet.getRange(i + 1, dateCol).setValue(newDate);
            break;
          }
        }
      }
    }
    if (assetId) {
      var spSheet = _getCCSheet(_CC_TAB.SOCIAL);
      var spHdr   = _CC_HDR.SocialPosts;
      var sdCol   = spHdr.indexOf('scheduled_date') + 1;
      if (sdCol > 0) {
        var spRows = spSheet.getDataRange().getValues();
        for (var j = 1; j < spRows.length; j++) {
          if (String(spRows[j][0]) === assetId) {
            spSheet.getRange(j + 1, sdCol).setValue(newDate);
            break;
          }
        }
      }
    }
    return {ok:true, asset_id:assetId, calendar_id:calendarId, new_date:newDate};
  } catch(e) {
    return {ok:false, error:e.message};
  }
}

/**
 * Bulk-writes calendar entries from a build_full_sequence result.
 * body: { campaign_id, publish_day, calendar: [{day, emails:[], posts:[]}] }
 */
function saveCalendarEntries(body) {
  try {
    var campaignId = body.campaign_id || '';
    var publishDay = body.publish_day || '';
    var launchDate = body.launch_date || '';
    var calendar   = body.calendar   || [];
    var saved = 0;

    function _calDate(absDay) {
      if (!launchDate || absDay === undefined) return '';
      try {
        var ld = new Date(launchDate + 'T12:00:00');
        ld.setDate(ld.getDate() + absDay);
        return Utilities.formatDate(ld, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } catch(e) { return ''; }
    }

    calendar.forEach(function(dayEntry) {
      var absDay = dayEntry.day || 0;

      (dayEntry.emails || []).forEach(function(e) {
        setContentCalendarEntry({
          id:             campaignId + '-em-' + (e.seq_id || (absDay + '-' + saved)),
          campaign_id:    campaignId,
          day_number:     absDay,
          scheduled_date: e.scheduled_date || _calDate(absDay),
          channel:        'Email',
          asset_type:     'email',
          asset_id:       e.seq_id || '',
          funnel_stage:   e.funnel_stage || '',
          pair_id:        '',
          theme:          e.sequence_code || '',
          publish_day:    publishDay,
          status:         'draft',
          dl_id:          '',
          utm_url:        ''
        });
        saved++;
      });

      (dayEntry.posts || []).forEach(function(p) {
        setContentCalendarEntry({
          id:             campaignId + '-post-' + (p.id || p.post_num || (absDay + '-' + saved)),
          campaign_id:    campaignId,
          day_number:     absDay,
          scheduled_date: p.scheduled_date || _calDate(absDay),
          channel:        p.platform || p.channel || '',
          asset_type:     'social',
          asset_id:       p.id || String(p.post_num || ''),
          funnel_stage:   p.funnel_stage || p.theme || '',
          pair_id:        '',
          theme:          p.theme || '',
          publish_day:    publishDay,
          status:         'draft',
          dl_id:          p.dl_id   || '',
          utm_url:        p.utm_url || ''
        });
        saved++;
      });
    });

    return { ok: true, saved_count: saved };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── CampaignMetrics ───────────────────────────────────────────────────────────

function _metricsRowToObj(r) {
  return {
    id:                  String(r[0]  || ''),
    campaign_id:         String(r[1]  || ''),
    week_number:         Number(r[2]  || 0),
    report_date:         _ccFmtDate(r[3]),
    channel:             String(r[4]  || ''),
    reach:               Number(r[5]  || 0),
    engagement_rate:     String(r[6]  || ''),
    link_clicks:         Number(r[7]  || 0),
    signups:             Number(r[8]  || 0),
    cost_per_signup:     String(r[9]  || ''),
    top_performing_post: String(r[10] || ''),
    notes:               String(r[11] || ''),
    created_at:          _ccFmtDate(r[12])
  };
}

function getCampaignMetrics(campaignId) {
  var sheet = _getCCSheet(_CC_TAB.METRICS);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.CampaignMetrics.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_metricsRowToObj);
  if (!campaignId) return rows;
  return rows.filter(function(r) { return r.campaign_id === campaignId; });
}

function setCampaignMetric(item) {
  if (!item || !item.id) return;
  var sheet   = _getCCSheet(_CC_TAB.METRICS);
  var headers = _CC_HDR.CampaignMetrics;
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
    item.campaign_id         !== undefined ? item.campaign_id         : (ex ? ex[1]  : ''),
    item.week_number         !== undefined ? item.week_number         : (ex ? ex[2]  : ''),
    item.report_date         !== undefined ? item.report_date         : (ex ? ex[3]  : ''),
    item.channel             !== undefined ? item.channel             : (ex ? ex[4]  : ''),
    item.reach               !== undefined ? item.reach               : (ex ? ex[5]  : 0),
    item.engagement_rate     !== undefined ? item.engagement_rate     : (ex ? ex[6]  : ''),
    item.link_clicks         !== undefined ? item.link_clicks         : (ex ? ex[7]  : 0),
    item.signups             !== undefined ? item.signups             : (ex ? ex[8]  : 0),
    item.cost_per_signup     !== undefined ? item.cost_per_signup     : (ex ? ex[9]  : ''),
    item.top_performing_post !== undefined ? item.top_performing_post : (ex ? ex[10] : ''),
    item.notes               !== undefined ? item.notes               : (ex ? ex[11] : ''),
    ex ? ex[12] : now
  ];
  _ccUpsert(sheet, headers, item.id, row);
}

// ── ScheduledPosts ────────────────────────────────────────────────────────────

function _schedRowToObj(r) {
  return {
    id:              String(r[0]  || ''),
    campaign_id:     String(r[1]  || ''),
    social_post_id:  String(r[2]  || ''),
    channel:         String(r[3]  || ''),
    scheduled_date:  _ccFmtDate(r[4]),
    scheduled_time:  String(r[5]  || ''),
    status:          String(r[6]  || 'draft'),
    posted_url:      String(r[7]  || ''),
    posted_at:       _ccFmtDate(r[8]),
    scheduling_tool: String(r[9]  || ''),
    created_at:      _ccFmtDate(r[10])
  };
}

function getScheduledPosts(campaignId) {
  var sheet = _getCCSheet(_CC_TAB.SCHEDULED);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.ScheduledPosts.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_schedRowToObj);
  if (!campaignId) return rows;
  return rows.filter(function(r) { return r.campaign_id === campaignId; });
}

function setScheduledPost(item) {
  if (!item || !item.id) return;
  var sheet   = _getCCSheet(_CC_TAB.SCHEDULED);
  var headers = _CC_HDR.ScheduledPosts;
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
    item.campaign_id     !== undefined ? item.campaign_id     : (ex ? ex[1]  : ''),
    item.social_post_id  !== undefined ? item.social_post_id  : (ex ? ex[2]  : ''),
    item.channel         !== undefined ? item.channel         : (ex ? ex[3]  : ''),
    item.scheduled_date  !== undefined ? item.scheduled_date  : (ex ? ex[4]  : ''),
    item.scheduled_time  !== undefined ? item.scheduled_time  : (ex ? ex[5]  : ''),
    item.status          !== undefined ? item.status          : (ex ? ex[6]  : 'draft'),
    item.posted_url      !== undefined ? item.posted_url      : (ex ? ex[7]  : ''),
    item.posted_at       !== undefined ? item.posted_at       : (ex ? ex[8]  : ''),
    item.scheduling_tool !== undefined ? item.scheduling_tool : (ex ? ex[9]  : ''),
    ex ? ex[10] : now
  ];
  _ccUpsert(sheet, headers, item.id, row);
}

// ── LPInventory ───────────────────────────────────────────────────────────────

function _lpInvRowToObj(r) {
  return {
    id:                   String(r[0]  || ''),
    slug:                 String(r[1]  || ''),
    full_url:             String(r[2]  || ''),
    campaign_type:        String(r[3]  || ''),
    blueprint_code:       String(r[4]  || ''),
    icp_codes:            String(r[5]  || ''),
    campaign_angle:       String(r[6]  || ''),
    lp_variant:           String(r[7]  || ''),
    headline:             String(r[8]  || ''),
    cta_primary:          String(r[9]  || ''),
    proof_bar:            String(r[10] || ''),
    status:               String(r[11] || 'draft'),
    dev_built:            r[12] === true || String(r[12]).toLowerCase() === 'true',
    convert_installed:    r[13] === true || String(r[13]).toLowerCase() === 'true',
    clarity_installed:    r[14] === true || String(r[14]).toLowerCase() === 'true',
    ga4_installed:        r[15] === true || String(r[15]).toLowerCase() === 'true',
    campaigns_using:      String(r[16] || ''),
    total_signups:        Number(r[17] || 0),
    conversion_rate:      String(r[18] || ''),
    created_at:           _ccFmtDate(r[19]),
    last_updated:         _ccFmtDate(r[20]),
    notes:                String(r[21] || ''),
    urgency_type:         String(r[22] || ''),
    urgency_line:         String(r[23] || ''),
    urgency_placement:    String(r[24] || ''),
    exclusivity_angle:    String(r[25] || ''),
    exclusivity_line:     String(r[26] || ''),
    meta_title:           String(r[27] || ''),
    meta_description:     String(r[28] || ''),
    og_title:             String(r[29] || ''),
    og_description:       String(r[30] || ''),
    canonical_url:        String(r[31] || ''),
    focus_keyword:        String(r[32] || ''),
    page_type:            String(r[33] || 'waitlist_lp'),
    thank_you_url:        String(r[34] || ''),
    hero_subheadline:     String(r[35] || ''),
    section_problem:      String(r[36] || ''),
    section_agitate:      String(r[37] || ''),
    section_solve:        String(r[38] || ''),
    section_value:        String(r[39] || ''),
    section_proof:        String(r[40] || ''),
    section_cta:          String(r[41] || ''),
    section_hook:         String(r[50] || ''),
    section_lifecycle:    String(r[51] || ''),
    tracking_convert_id:  String(r[42] || ''),
    tracking_clarity_id:  String(r[43] || ''),
    tracking_ga4_id:      String(r[44] || ''),
    qa_passed:            r[45] === true || String(r[45]).toLowerCase() === 'true',
    pushed_to_production: r[46] === true || String(r[46]).toLowerCase() === 'true',
    convert_experiment_id: String(r[47] || ''),
    shared_by_campaigns:  String(r[48] || ''),
    last_traffic_date:    _ccFmtDate(r[49])
  };
}

function getLPInventory(statusFilter) {
  var sheet = _getCCSheet(_CC_TAB.LP_INVENTORY);
  var last  = sheet.getLastRow();
  if (last < 2) return [];
  var rows = sheet.getRange(2, 1, last - 1, _CC_HDR.LPInventory.length).getValues()
    .filter(function(r) { return r[0]; })
    .map(_lpInvRowToObj);
  if (!statusFilter) return rows;
  return rows.filter(function(r) { return r.status === statusFilter; });
}

// ── Full funnel map for a campaign — used by cockpit + team reference ─────────
function getCampaignFunnel(campaignId) {
  if (!campaignId) return { ok: false, error: 'campaign_id required' };

  // 1. LP pages — filtered to this campaign
  // waitlist_lp: only primary A/B variants (not ICP-specific pages)
  // coming_soon / thank_you: all for this campaign, thank_you deduped by URL
  var allLPs = getLPInventory().filter(function(lp) {
    if (!(lp.campaigns_using && lp.campaigns_using.indexOf(campaignId) !== -1)) return false;
    var t = lp.page_type || 'waitlist_lp';
    if (t === 'coming_soon' || t === 'thank_you') return true;
    var v = String(lp.lp_variant || '').toLowerCase();
    return v === 'a' || v === 'b' || v === 'waitlist-a' || v === 'waitlist-b';
  });
  var pages = { coming_soon: [], waitlist_lp: [], thank_you: [], other: [] };
  var _tyUrls = {};
  allLPs.forEach(function(lp) {
    var t = lp.page_type || 'waitlist_lp';
    if (t === 'thank_you') {
      var u = lp.full_url || '';
      if (_tyUrls[u]) return; // deduplicate by URL
      _tyUrls[u] = true;
    }
    if (pages[t]) pages[t].push(lp); else pages.other.push(lp);
  });

  // 2. Deep links for this campaign
  var dlSheet  = _getCCSheet(_CC_TAB.DL);
  var dlLast   = dlSheet.getLastRow();
  var dlRows   = dlLast < 2 ? [] : dlSheet.getRange(2, 1, dlLast - 1, _CC_HDR.DeepLinkRegistry.length).getValues();
  var dlHdrs   = _CC_HDR.DeepLinkRegistry;
  var cidIdx   = dlHdrs.indexOf('campaign_id');
  var deepLinks = dlRows
    .filter(function(r) { return String(r[cidIdx] || '') === campaignId; })
    .map(function(r) {
      var obj = {};
      dlHdrs.forEach(function(h, i) { obj[h] = r[i]; });
      return obj;
    });

  // Group deep links by channel
  var dlByChannel = {};
  deepLinks.forEach(function(dl) {
    var ch = dl.channel || 'Unknown';
    if (!dlByChannel[ch]) dlByChannel[ch] = [];
    dlByChannel[ch].push({ dl_id: dl.dl_id, utm_content: dl.utm_content,
      destination_url: dl.destination_url, status: dl.status, notes: dl.notes });
  });

  // 3. Email sequences summary
  var emSheet  = _getCCSheet(_CC_TAB.EMAIL);
  var emLast   = emSheet.getLastRow();
  var emRows   = emLast < 2 ? [] : emSheet.getRange(2, 1, emLast - 1, _CC_HDR.EmailSequences.length).getValues();
  var emHdrs   = _CC_HDR.EmailSequences;
  var emCidIdx = emHdrs.indexOf('campaign_id');
  var emailSeqs = emRows
    .filter(function(r) { return String(r[emCidIdx] || '') === campaignId; })
    .reduce(function(acc, r) {
      var seq = String(r[emHdrs.indexOf('sequence_code')] || 'SEQ-?');
      if (!acc[seq]) acc[seq] = { sequence_code: seq, emails: [] };
      acc[seq].emails.push({
        email_number:  r[emHdrs.indexOf('email_number')],
        subject_line:  r[emHdrs.indexOf('subject_line')],
        send_day:      r[emHdrs.indexOf('send_day')],
        funnel_stage:  r[emHdrs.indexOf('funnel_stage')],
        dl_id:         r[emHdrs.indexOf('dl_id') >= 0 ? emHdrs.indexOf('dl_id') : -1] || ''
      });
      return acc;
    }, {});

  // 4. Social post count by platform + stage
  var spSheet  = _getCCSheet(_CC_TAB.SOCIAL);
  var spLast   = spSheet.getLastRow();
  var spRows   = spLast < 2 ? [] : spSheet.getRange(2, 1, spLast - 1, _CC_HDR.SocialPosts.length).getValues();
  var spHdrs   = _CC_HDR.SocialPosts;
  var spCidIdx = spHdrs.indexOf('campaign_id');
  var spPlIdx  = spHdrs.indexOf('platform');
  var spStIdx  = spHdrs.indexOf('status');
  var postSummary = {};
  spRows.filter(function(r) { return String(r[spCidIdx] || '') === campaignId; })
    .forEach(function(r) {
      var pl = String(r[spPlIdx] || 'Unknown');
      if (!postSummary[pl]) postSummary[pl] = { total: 0, draft: 0, approved: 0 };
      postSummary[pl].total++;
      var st = String(r[spStIdx] || 'draft').toLowerCase();
      if (st === 'approved') postSummary[pl].approved++;
      else postSummary[pl].draft++;
    });

  // 5. Brief + A/B config
  var brief = null;
  try {
    var briefs = _getCCSheet(_CC_TAB.BRIEFS);
    var bLast  = briefs.getLastRow();
    if (bLast >= 2) {
      var bRows = briefs.getRange(2, 1, bLast - 1, _CC_HDR.CampaignBriefs.length).getValues();
      var bHdrs = _CC_HDR.CampaignBriefs;
      for (var bi = 0; bi < bRows.length; bi++) {
        if (String(bRows[bi][0]) === campaignId) {
          brief = {};
          bHdrs.forEach(function(h, i) { brief[h] = bRows[bi][i]; });
          break;
        }
      }
    }
  } catch(e) {}

  // 6. Build the funnel flow steps
  var funnelFlow = [];

  // Step A: Entry — ad/social/email drives traffic
  funnelFlow.push({
    step: 1, label: 'Entry Points',
    description: 'Paid social + organic posts drive traffic via deep-linked UTM URLs',
    channels: Object.keys(dlByChannel).filter(function(c) { return c !== 'Email'; }),
    deep_links: Object.keys(dlByChannel).filter(function(c) { return c !== 'Email'; })
      .reduce(function(acc, ch) { acc[ch] = (dlByChannel[ch] || []).length + ' DL_IDs'; return acc; }, {})
  });

  // Step B: Coming soon (pre-launch gate if /coming-soon is LIVE)
  if (pages.coming_soon.length) {
    funnelFlow.push({
      step: 2, label: 'Coming Soon Gate',
      description: 'Root easychefpro.com 302 → /coming-soon · captures early intent',
      pages: pages.coming_soon.map(function(p) { return { id: p.id, url: p.full_url, status: p.status,
        clarity_installed: p.clarity_installed, tracking_clarity_id: p.tracking_clarity_id,
        ga4_installed: p.ga4_installed, tracking_ga4_id: p.tracking_ga4_id,
        convert_installed: p.convert_installed, tracking_convert_id: p.tracking_convert_id||p.convert_experiment_id }; })
    });
  }

  // Step C: Landing pages — A/B split
  funnelFlow.push({
    step: 3, label: 'Landing Pages (A/B)',
    description: brief && brief.ab_test ? 'A/B split · ' + (brief.ab_split || '50/50') + ' · experiment: ' + (brief.ab_experiment_id || '') : 'Single LP',
    pages: pages.waitlist_lp.map(function(p) {
      return { id: p.id, slug: p.slug, url: p.full_url, variant: p.lp_variant,
               icp: p.icp_codes, angle: p.campaign_angle, status: p.status,
               thank_you_url: p.thank_you_url,
               clarity_installed: p.clarity_installed, tracking_clarity_id: p.tracking_clarity_id,
               ga4_installed: p.ga4_installed, tracking_ga4_id: p.tracking_ga4_id,
               convert_installed: p.convert_installed, tracking_convert_id: p.tracking_convert_id||p.convert_experiment_id };
    }),
    dl_ids: (dlByChannel['Facebook'] || []).concat(dlByChannel['Instagram'] || [])
      .slice(0, 3).map(function(d) { return d.dl_id; })
  });

  // Step D: Email sequences
  funnelFlow.push({
    step: 4, label: 'Email Sequences',
    description: 'Post-signup nurture sequences trigger on Klaviyo · ' + Object.keys(emailSeqs).length + ' sequences',
    sequences: Object.values(emailSeqs).map(function(s) {
      return { code: s.sequence_code, email_count: s.emails.length,
               dl_ids: (dlByChannel['Email'] || []).map(function(d) { return d.dl_id; }) };
    })
  });

  // Step E: Thank-you pages
  funnelFlow.push({
    step: 5, label: 'Thank-You Pages',
    description: 'Post-conversion confirmation · query param routes A vs B variant',
    pages: pages.thank_you.map(function(p) {
      return { id: p.id, url: p.full_url, variant: p.lp_variant || p.notes, status: p.status,
               clarity_installed: p.clarity_installed, tracking_clarity_id: p.tracking_clarity_id,
               ga4_installed: p.ga4_installed, tracking_ga4_id: p.tracking_ga4_id,
               convert_installed: p.convert_installed, tracking_convert_id: p.tracking_convert_id||p.convert_experiment_id };
    })
  });

  return {
    ok:          true,
    campaign_id: campaignId,
    brief:       brief ? { name: brief.name, launch_date: brief.launch_date,
                           ab_test: brief.ab_test, ab_experiment_id: brief.ab_experiment_id,
                           channels: brief.channels } : null,
    funnel_flow: funnelFlow,
    pages:       pages,
    deep_link_summary: {
      total:      deepLinks.length,
      by_channel: Object.keys(dlByChannel).reduce(function(acc, ch) {
                    acc[ch] = dlByChannel[ch].length; return acc; }, {})
    },
    post_summary:  postSummary,
    email_sequences: emailSeqs,
    generated_at: _ccNow()
  };
}

// ── All-campaign funnel aggregator ───────────────────────────────────────────
function getAllCampaignFunnels() {
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty('ACCOUNTS_REGISTRY');
  var accounts = raw ? JSON.parse(raw) : [];
  var funnels = [];
  accounts
    .filter(function(a) { return a.status === 'active'; })
    .forEach(function(a) {
      var prevId = _REQUEST_SHEET_ID;
      try {
        _REQUEST_SHEET_ID = a.sheet_id || null;
        var f = getCampaignFunnel(a.id);
        funnels.push({ account_id: a.id, account_name: a.name, funnel: f });
      } catch(e) {
        funnels.push({ account_id: a.id, account_name: a.name, funnel: { ok: false, error: String(e) } });
      } finally {
        _REQUEST_SHEET_ID = prevId;
      }
    });
  return { ok: true, funnels: funnels };
}

// ── Create a new LP inventory entry ──────────────────────────────────────────
function createLPEntry(params) {
  if (!params || !params.campaign_id) return { ok: false, error: 'campaign_id required' };
  var slug    = (params.slug || '').replace(/^\//, '');
  var variant = (params.lp_variant || '').toLowerCase();
  var id      = params.id || ('lp-' + params.campaign_id.toLowerCase().replace(/[^a-z0-9]/g, '-') + (variant ? '-' + variant : '') + '-' + new Date().getTime().toString(36));
  var fullUrl = params.full_url || (slug ? 'https://easychefpro.com/' + slug : '');
  var entry = {
    id:              id,
    slug:            slug,
    full_url:        fullUrl,
    campaign_type:   params.campaign_type  || 'pre_launch',
    icp_codes:       params.icp_codes      || '',
    campaign_angle:  params.campaign_angle || '',
    lp_variant:      params.lp_variant     || '',
    page_type:       params.page_type      || 'waitlist_lp',
    thank_you_url:   params.thank_you_url  || '',
    campaigns_using: params.campaign_id,
    status:          'PENDING_DEV',
    notes:           params.notes          || ''
  };
  try {
    setLPInventoryEntry(entry);
    return { ok: true, lp: entry };
  } catch(e) {
    return { ok: false, error: String(e) };
  }
}

function updateLPEntry(params) {
  if (!params || !params.id) return { ok: false, error: 'id required' };
  try {
    setLPInventoryEntry(params);
    return { ok: true, lp_id: params.id };
  } catch(e) {
    return { ok: false, error: String(e) };
  }
}

function setLPInventoryEntry(item) {
  if (!item || !item.id) return;
  var sheet   = _getCCSheet(_CC_TAB.LP_INVENTORY);
  var headers = _CC_HDR.LPInventory;
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
    item.slug               !== undefined ? item.slug               : (ex ? ex[1]  : ''),
    item.full_url           !== undefined ? item.full_url           : (ex ? ex[2]  : ''),
    item.campaign_type      !== undefined ? item.campaign_type      : (ex ? ex[3]  : ''),
    item.blueprint_code     !== undefined ? item.blueprint_code     : (ex ? ex[4]  : ''),
    item.icp_codes          !== undefined ? item.icp_codes          : (ex ? ex[5]  : ''),
    item.campaign_angle     !== undefined ? item.campaign_angle     : (ex ? ex[6]  : ''),
    item.lp_variant         !== undefined ? item.lp_variant         : (ex ? ex[7]  : ''),
    item.headline           !== undefined ? item.headline           : (ex ? ex[8]  : ''),
    item.cta_primary        !== undefined ? item.cta_primary        : (ex ? ex[9]  : ''),
    item.proof_bar          !== undefined ? item.proof_bar          : (ex ? ex[10] : ''),
    item.status             !== undefined ? item.status             : (ex ? ex[11] : 'draft'),
    item.dev_built          !== undefined ? item.dev_built          : (ex ? ex[12] : false),
    item.convert_installed  !== undefined ? item.convert_installed  : (ex ? ex[13] : false),
    item.clarity_installed  !== undefined ? item.clarity_installed  : (ex ? ex[14] : false),
    item.ga4_installed      !== undefined ? item.ga4_installed      : (ex ? ex[15] : false),
    item.campaigns_using    !== undefined ? item.campaigns_using    : (ex ? ex[16] : ''),
    item.total_signups      !== undefined ? item.total_signups      : (ex ? ex[17] : 0),
    item.conversion_rate    !== undefined ? item.conversion_rate    : (ex ? ex[18] : ''),
    ex ? ex[19] : now,
    now,
    item.notes              !== undefined ? item.notes              : (ex ? ex[21] : ''),
    item.urgency_type       !== undefined ? item.urgency_type       : (ex ? ex[22] : ''),
    item.urgency_line       !== undefined ? item.urgency_line       : (ex ? ex[23] : ''),
    item.urgency_placement  !== undefined ? item.urgency_placement  : (ex ? ex[24] : ''),
    item.exclusivity_angle  !== undefined ? item.exclusivity_angle  : (ex ? ex[25] : ''),
    item.exclusivity_line   !== undefined ? item.exclusivity_line   : (ex ? ex[26] : ''),
    item.meta_title         !== undefined ? item.meta_title         : (ex ? ex[27] : ''),
    item.meta_description   !== undefined ? item.meta_description   : (ex ? ex[28] : ''),
    item.og_title           !== undefined ? item.og_title           : (ex ? ex[29] : ''),
    item.og_description     !== undefined ? item.og_description     : (ex ? ex[30] : ''),
    item.canonical_url      !== undefined ? item.canonical_url      : (ex ? ex[31] : ''),
    item.focus_keyword      !== undefined ? item.focus_keyword      : (ex ? ex[32] : ''),
    item.page_type            !== undefined ? item.page_type            : (ex ? ex[33] : 'waitlist_lp'),
    item.thank_you_url        !== undefined ? item.thank_you_url        : (ex ? ex[34] : ''),
    item.hero_subheadline     !== undefined ? item.hero_subheadline     : (ex ? ex[35] : ''),
    item.section_problem       !== undefined ? item.section_problem       : (ex ? ex[36] : ''),
    item.section_agitate       !== undefined ? item.section_agitate       : (ex ? ex[37] : ''),
    item.section_solve        !== undefined ? item.section_solve        : (ex ? ex[38] : ''),
    item.section_value        !== undefined ? item.section_value        : (ex ? ex[39] : ''),
    item.section_proof        !== undefined ? item.section_proof        : (ex ? ex[40] : ''),
    item.section_cta          !== undefined ? item.section_cta          : (ex ? ex[41] : ''),
    item.tracking_convert_id  !== undefined ? item.tracking_convert_id  : (ex ? ex[42] : ''),
    item.tracking_clarity_id  !== undefined ? item.tracking_clarity_id  : (ex ? ex[43] : ''),
    item.tracking_ga4_id      !== undefined ? item.tracking_ga4_id      : (ex ? ex[44] : ''),
    item.qa_passed            !== undefined ? item.qa_passed            : (ex ? ex[45] : false),
    item.pushed_to_production !== undefined ? item.pushed_to_production : (ex ? ex[46] : false),
    item.convert_experiment_id !== undefined ? item.convert_experiment_id : (ex ? ex[47] : ''),
    item.shared_by_campaigns  !== undefined ? item.shared_by_campaigns  : (ex ? ex[48] : ''),
    item.last_traffic_date    !== undefined ? item.last_traffic_date    : (ex ? ex[49] : ''),
    item.section_hook         !== undefined ? item.section_hook         : (ex ? ex[50] : ''),
    item.section_lifecycle    !== undefined ? item.section_lifecycle    : (ex ? ex[51] : '')
  ];
  _ccUpsert(sheet, headers, item.id, row);
}

// ── Clean LP Inventory — removes legacy lpi-* rows, rewrites all rows through setLPInventoryEntry ──
function cleanLPInventory() {
  var sheet   = _getCCSheet(_CC_TAB.LP_INVENTORY);
  var headers = _CC_HDR.LPInventory;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: true, deleted: 0, rewritten: 0 };

  // Read all data rows
  var rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues()
    .filter(function(r) { return r[0]; });

  // Identify legacy lpi-* row indices (1-based sheet row) — delete bottom-up
  var toDelete = [];
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).match(/^lpi-/)) toDelete.push(i + 2);
  }
  for (var d = toDelete.length - 1; d >= 0; d--) {
    sheet.deleteRow(toDelete[d]);
  }

  // Re-read after deletions and rewrite each row through setLPInventoryEntry
  var lastRow2 = sheet.getLastRow();
  var kept = lastRow2 < 2 ? [] :
    sheet.getRange(2, 1, lastRow2 - 1, headers.length).getValues()
      .filter(function(r) { return r[0]; })
      .map(_lpInvRowToObj);

  kept.forEach(function(obj) { setLPInventoryEntry(obj); });

  Logger.log('[cleanLPInventory] deleted=' + toDelete.length + ' rewritten=' + kept.length);
  return { ok: true, deleted: toDelete.length, rewritten: kept.length };
}

// ── Create LP from wizard — writes LPInventory + DeepLinkRegistry atomically ──
// Called by the Build New LP form in Step 2 of the Campaign Center wizard.
function createLpInventoryEntry(p) {
  if (!p || !p.slug) return { ok:false, error:'slug required' };

  var dlId  = _nextDlId('LP');
  var lpId  = 'lp-' + Date.now().toString(36);
  var now   = _ccNow();
  var full  = 'https://easychefpro.com/' + p.slug;

  setLPInventoryEntry({
    id:                  lpId,
    slug:                p.slug,
    full_url:            full,
    campaign_type:       p.purpose             || 'Waitlist',
    blueprint_code:      '',
    icp_codes:           p.icp                 || '',
    campaign_angle:      p.angle               || '',
    lp_variant:          (p.variant||'A').toUpperCase(),
    headline:            p.headline            || '',
    cta_primary:         '',
    proof_bar:           '',
    status:              'PENDING_DEV',
    dev_built:           false,
    notes:               'theme:' + (p.theme||'') + ' · dl:' + dlId + (p.campaign_id ? ' · campaign:' + p.campaign_id : ''),
    urgency_type:        p.urgency_type        || '',
    urgency_line:        p.urgency_line        || '',
    urgency_placement:   p.urgency_placement   || '',
    exclusivity_angle:   p.exclusivity_angle   || '',
    exclusivity_line:    p.exclusivity_line    || '',
    meta_title:          p.meta_title          || '',
    meta_description:    p.meta_description    || '',
    og_title:            p.og_title            || '',
    og_description:      p.og_description      || '',
    canonical_url:       p.canonical_url       || full,
    focus_keyword:       p.focus_keyword       || ''
  });

  setDlRegistryEntry({
    dl_id:           dlId,
    utm_content:     'lp_' + String(p.slug).replace(/\//g,'_'),
    campaign_id:     p.campaign_id   || '',
    channel:         'lp',
    destination_url: full,
    utm_source:      'direct',
    utm_medium:      'landing_page',
    utm_campaign:    p.icp           || '',
    status:          'DRAFT',
    notes:           'auto-created · Build New LP wizard · theme:' + (p.theme||'')
  });

  Logger.log('createLpInventoryEntry: slug=' + p.slug + ' dl_id=' + dlId);
  return { ok:true, slug:p.slug, dl_id:dlId, lp_id:lpId };
}

// Called automatically from setLandingPage — keeps LPInventory in sync.
function _registerLpInInventory(slug, campaignId, item) {
  if (!slug) return;
  var sheet   = _getCCSheet(_CC_TAB.LP_INVENTORY);
  var headers = _CC_HDR.LPInventory;
  var now     = _ccNow();
  var lastRow = sheet.getLastRow();
  var existing     = null;
  var existingRow  = -1;

  if (lastRow >= 2) {
    var rows = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][1]).trim() === String(slug).trim()) {
        existing    = rows[i];
        existingRow = i + 2;
        break;
      }
    }
  }

  if (!existing) {
    // New LP — create draft row
    var newRow = [
      'lpi-' + Date.now().toString(36),
      slug,
      (item && item.full_url) ? item.full_url : 'https://easychefpro.com/' + slug,
      (item && item.campaign_type)  || '',
      (item && item.blueprint_code) || '',
      (item && item.icp_codes)      || (item && item.icp_code) || '',
      (item && item.campaign_angle) || '',
      (item && item.lp_variant)     || '',
      (item && item.headline)       || '',
      (item && item.cta_primary)    || '',
      (item && item.proof_bar)      || '',
      'draft',
      false, false, false, false,
      campaignId || '',
      0, '', now, now, ''
    ];
    var rng = sheet.getRange(sheet.getLastRow() + 1, 1, 1, headers.length);
    rng.setNumberFormat('@');
    rng.setValues([newRow]);
  } else if (campaignId) {
    // LP exists — append campaignId to campaigns_using if not already listed
    var current = String(existing[16] || '');
    var ids = current ? current.split(',').map(function(s) { return s.trim(); }) : [];
    if (ids.indexOf(String(campaignId)) < 0) {
      ids.push(String(campaignId));
      sheet.getRange(existingRow, 17, 1, 1).setNumberFormat('@').setValue(ids.join(','));
      sheet.getRange(existingRow, 21, 1, 1).setValue(now); // last_updated
    }
  }
}

// ── Pre-launch timeline applicator ────────────────────────────────────────────
// Run applyPreLaunchTimeline() once from Apps Script editor to write all
// confirmed May 27 pre-launch dates to the live Campaign Center sheet.

function applyPreLaunchTimeline() {
  var now = _ccNow();
  Logger.log('[Timeline] Starting pre-launch timeline update...');

  // ── 1. BlueprintConfig — add date columns + update A-Waitlist row ───────────
  var bpSheet = _getCCSheet(_CC_TAB.BLUEPRINTS);
  var bpHdr   = _CC_HDR.BlueprintConfig;
  // Expand header row to 14 columns
  var bpHdrRng = bpSheet.getRange(1, 1, 1, bpHdr.length);
  bpHdrRng.setValues([bpHdr]);
  bpHdrRng.setBackground('#0b0d10');
  bpHdrRng.setFontColor('#c9a84c');
  bpHdrRng.setFontFamily('Courier New');
  bpHdrRng.setFontWeight('bold');
  SpreadsheetApp.flush();
  // Upsert A-Waitlist row
  _ccUpsert(bpSheet, bpHdr, 'bp-001', [
    'bp-001','A-Waitlist','Waitlist Growth','SEQ-1,SEQ-2,SEQ-3,SEQ-4',
    '13','7','waitlist','pre-launch','true',
    'Pre-launch waitlist acquisition — drives to LP, captures email, nurtures to app download on July 1',
    '2026-05-27','2026-07-01','2026-06-08','2026-06-29'
  ]);
  Logger.log('[Timeline] BlueprintConfig updated');

  // ── 2. FunnelStages — add start_date column + update all rows ───────────────
  var fsSheet = _getCCSheet(_CC_TAB.FUNNEL_STAGES);
  var fsHdr   = _CC_HDR.FunnelStages;
  var fsHdrRng = fsSheet.getRange(1, 1, 1, fsHdr.length);
  fsHdrRng.setValues([fsHdr]);
  fsHdrRng.setBackground('#0b0d10');
  fsHdrRng.setFontColor('#c9a84c');
  fsHdrRng.setFontFamily('Courier New');
  fsHdrRng.setFontWeight('bold');
  SpreadsheetApp.flush();
  var fsRows = [
    ['fs-001','hook',    '1','0', '1', '0',  'Stop the scroll — make her feel seen in under 2 seconds. Mirror her exact moment.',                                         'Hook — subject line stops the scroll',          'Mirror her moment — emotional recognition',  'pair-1-hook',    'Every day she waits costs $3.66',                now,'','2026-05-27'],
    ['fs-002','problem', '2','2', '3', '0',  'Name the pain so precisely she thinks you wrote it about her specifically.',                                                 'Problem — name her pain precisely',             'Name the 6:30 PM moment exactly',            'pair-2-problem', 'The problem costs $1,336 a year',                now,'','2026-05-29'],
    ['fs-003','agitate', '3','5', '6', '0',  'Make the problem vivid, concrete, personal. Cost it out. $1,336/year — that is $111/month — that is $25/week going in the bin.','Agitate — cost the problem out',            'Cost it out — specific dollar amount',       'pair-3-agitate', 'She cannot unsee this number',                   now,'','2026-06-01'],
    ['fs-004','solve',   '4','9', '10','0',  'Introduce easyChef Pro as the inevitable obvious answer. One sentence. No feature list.',                                    'Solve — introduce easyChef Pro as the answer',  'Introduce easyChef Pro — one sentence',      'pair-4-solve',   'The answer exists — she just needs to find it',  now,'','2026-06-05'],
    ['fs-005','value',   '5','13','14','0',  'Translate features into outcomes she actually wants. Feelings and results, not specs. 30 minutes. What you already have.',   'Value — outcomes not features',                 'Show the outcomes — 30 minutes, real food',  'pair-5-value',   'Every night without it costs her time and money',now,'','2026-06-09'],
    ['fs-006','proof',   '6','24','25','0',  'One specific honest proof point. Validated across 10,000 household profiles. Built by first responders. Then the offer.',    'Proof — one honest stat, then the offer',       'One proof point — then founding price',      'pair-6-proof',   'Social proof closes the last objection',         now,'','2026-06-20'],
    ['fs-007','cta',     '7','0', '1', '21', 'One action. Low friction. Outcome-framed. Not sign up — tell her what she is getting.',                                      'CTA — one action, loss aversion, urgency',      'Founding price — last chance angle',         'pair-7-cta',     'Founding price ends at 5,000 families',          now,'','2026-06-17']
  ];
  fsRows.forEach(function(row) { _ccUpsert(fsSheet, fsHdr, row[0], row); });
  Logger.log('[Timeline] FunnelStages updated (7 rows) — cta seq_offset_days=21 (SEQ-3 Jun 17, SEQ-4 Jul 1)');

  // ── 3. CampaignBriefs — update EC-2026-001 launch_date to pre-launch date ───
  setCampaignBrief({ id: 'EC-2026-001', launch_date: '2026-05-27' });
  Logger.log('[Timeline] CampaignBriefs EC-2026-001 launch_date → 2026-05-27');

  // ── 4. ContentCalendar — add/update milestone rows (full 35-day arc) ─────────
  var milestones = [
    { id:'cc-ms-001', day:0,  date:'2026-05-27', stage:'PRE-LAUNCH LIVE',       theme:'Social Arc 1 begins · SEQ-1 E1 fires · waitlist opens · EC-2026-001 launches' },
    { id:'cc-ms-002', day:0,  date:'2026-05-27', stage:'ALPHA INVITES',          theme:'Personal outreach begins from Taylor' },
    { id:'cc-ms-003', day:2,  date:'2026-05-29', stage:'SEQ-1 E2',               theme:'SEQ-1 E2 fires — problem email · alpha questionnaire open' },
    { id:'cc-ms-004', day:3,  date:'2026-05-30', stage:'TIKTOK SPOTLIGHT',       theme:'TikTok Day 4 spotlight fires — feature demo' },
    { id:'cc-ms-005', day:6,  date:'2026-06-02', stage:'SEQ-1 E3 · YOUTUBE',     theme:'SEQ-1 E3 fires — value + CTA · YouTube 60-sec explainer publishes' },
    { id:'cc-ms-006', day:7,  date:'2026-06-03', stage:'SEQ-2 BEGINS',           theme:'SEQ-2 nurture sequence begins · alpha questionnaire closes · Taylor reviews responses' },
    { id:'cc-ms-007', day:12, date:'2026-06-08', stage:'ALPHA APP ACCESS',        theme:'Alpha group gets app access · feedback loop begins' },
    { id:'cc-ms-008', day:16, date:'2026-06-13', stage:'SEQ-2 ENDS',             theme:'SEQ-2 final nurture email fires' },
    { id:'cc-ms-009', day:21, date:'2026-06-17', stage:'SEQ-3 BEGINS · ARC 2',   theme:'SEQ-3 urgency sequence begins · Social Arc 2 fires (Days 22–28 · scarcity angle)' },
    { id:'cc-ms-010', day:25, date:'2026-06-22', stage:'ALPHA FEEDBACK EMAIL',   theme:'Alpha feedback email fires · testimonial gathering' },
    { id:'cc-ms-011', day:28, date:'2026-06-25', stage:'SEQ-3 E3 LAST CALL',     theme:'SEQ-3 E3 fires — last call urgency · founding price window closing' },
    { id:'cc-ms-012', day:32, date:'2026-06-29', stage:'BETA INVITES',            theme:'Beta invite campaign launches · SEQ-3 E4 final email' },
    { id:'cc-ms-013', day:35, date:'2026-07-01', stage:'PUBLIC LAUNCH',           theme:'App goes live · SEQ-4 E1 launch day fires · founding price closes · Alpha → advanced features · Beta continues' }
  ];
  milestones.forEach(function(m) {
    setContentCalendarEntry({
      id:             m.id,
      campaign_id:    'EC-2026-001',
      day_number:     String(m.day),
      scheduled_date: m.date,
      channel:        'MILESTONE',
      asset_type:     'milestone',
      asset_id:       '',
      funnel_stage:   m.stage,
      pair_id:        '',
      theme:          m.theme,
      publish_day:    '',
      status:         'scheduled',
      dl_id:          '',
      utm_url:        ''
    });
  });
  Logger.log('[Timeline] ContentCalendar — 13 milestone rows written (full 35-day arc)');

  Logger.log('[Timeline] DONE — pre-launch timeline applied. Verify in Campaign Center sheet.');
}

// clasp auto-deploy verified — May 2026

// ── ICP Library v2 seed — May 2026 ───────────────────────────────────────────
// Adds 15 new ICP profiles. Skips any code already present in the sheet.
// Run once from Apps Script editor: _seedIcpLibrary20

function _seedIcpLibrary20() {
  var sheet  = _getCCSheet(_CC_TAB.ICP);
  var last   = sheet.getLastRow();
  var today  = '2026-05-08';

  // Build set of existing codes from column C (index 2)
  var existing = {};
  if (last >= 2) {
    sheet.getRange(2, 3, last - 1, 1).getValues().forEach(function(r) {
      if (r[0]) existing[String(r[0]).toLowerCase()] = true;
    });
  }

  var icps = [
    { id:'single_parent',       name:'Single Parent',           status:'Active',              validated:true,
      demo:'Female · 28–45 · 1–3 kids · HHI $25–60K · single income · time and money maximally constrained · primary everything',
      psycho:'No partner to share the load. Every decision is hers alone. Deeply practical. High loyalty once trust is earned.',
      pain:'Sole provider of all meals with zero margin for error or waste.',
      sec_pain:'One person doing the job of two. Dinner at 6 PM after work and school pickup. No plan and no backup.',
      value:'Plan the whole week in minutes. Every grocery item gets used. $1,336/year back in a budget that needs every dollar.',
      loss:'Every wasted item is a bill she cannot afford. Every takeout night is two weeks of lunches.',
      channels:'Facebook mom groups · Nextdoor community trust · Email · Pinterest quick meals',
      msg:'1. You should not have to do this alone. 2. 30 minutes. 3. $1,336 back. 4. Free to start.',
      triggers:'$1,336/year · 30 minutes · Free · No credit card · Built by first responders',
      notes:'High emotional resonance — fold into Super Mom funnel · separate copy angle available' },

    { id:'empty_nester',        name:'Empty Nester',            status:'Pending Validation',  validated:false,
      demo:'Female · 48–62 · kids left home · couple or alone · HHI $60–120K · cooking habits built for a full house',
      psycho:'Still buys too much out of habit. Waste is high. Suddenly has time but not new habits. Interested in nutrition for herself now.',
      pain:'Cooking for a full house was muscle memory. Cooking for one or two requires a complete relearn.',
      sec_pain:'Buys family-sized everything. Half goes to waste. Recipes still written for 4–6 people. Cannot scale down.',
      value:'Scales every recipe automatically. Meal plans for 1–2. Grocery list matches exactly what is needed.',
      loss:'Every oversized purchase is money wasted now the kids are gone.',
      channels:'Facebook · Pinterest · Email · Instagram secondary',
      msg:'1. Your household changed — your kitchen has not kept up. 2. Scale any recipe. 3. Cook for yourself.',
      triggers:'Recipe scaling · Nutrition scoring · No waste · Free to try',
      notes:'Tertiary ICP — placeholder — do not build funnels until validated' },

    { id:'newlywed',            name:'Newlywed Couple',         status:'Pending Validation',  validated:false,
      demo:'Female or Male · 24–34 · newly married · no kids yet · dual income · HHI $60–100K · first shared kitchen',
      psycho:'Excited about building a home together. Cooking is a shared project but creates friction without a plan.',
      pain:'No shared food system means constant friction and waste even with a good grocery budget.',
      sec_pain:'Two different food preferences. No shared system. Groceries bought independently. Food expires.',
      value:'One shared pantry. One shared meal plan. Both preferences accounted for. Dinner without the nightly negotiation.',
      loss:'$400/month on delivery before they even start a family.',
      channels:'Instagram · Pinterest · TikTok · Email',
      msg:'1. Build your kitchen together. 2. One app two preferences. 3. Stop the delivery habit early.',
      triggers:'Shared meal plan · No waste · 30 minutes · Free to try',
      notes:'Pre-family acquisition — valuable long-term — not primary pre-launch focus' },

    { id:'busy_dad',            name:'Busy Dad',                status:'Pending Validation',  validated:false,
      demo:'Male · 30–48 · married · 2+ kids · HHI $60–120K · wants to contribute to household food but does not know how',
      psycho:'Knows his partner carries the food load. Wants to step up but cooking feels overwhelming without a clear system.',
      pain:'Cannot help with dinner without a system that tells him exactly what to do.',
      sec_pain:'Opens the fridge and sees ingredients with no plan. Defaults to ordering pizza because it is the only decision he can make alone.',
      value:'Opens the app. Sees what is in the fridge. Gets a recipe. Dinner done before his partner gets home.',
      loss:'Every pizza order is another night his partner does the whole load herself.',
      channels:'Facebook · YouTube · Email · Reddit',
      msg:'1. Be the dinner hero. 2. Open the app follow the steps. 3. 30 minutes. 4. She will notice.',
      triggers:'Step by step · 30 minutes · Easy wins · Free to try',
      notes:'Secondary persona within family ICP — different copy angle needed' },

    { id:'large_family',        name:'Large Family',            status:'Pending Validation',  validated:false,
      demo:'Female · 28–45 · 4+ kids · HHI $50–90K · bulk buyer · Costco and Walmart · feeding 6–8 people every night',
      psycho:'Scale is her life. Everything is bigger and more expensive. Waste hits harder. Cannot afford ingredient experiments.',
      pain:'Feeding 6 people every night with a real budget means zero tolerance for waste.',
      sec_pain:'Grocery bill is enormous. Waste is enormous because bulk buying does not match meal plans.',
      value:'Meal plan scaled for 6. Grocery list sized correctly. At 6 people $1,336 savings becomes $2,000+.',
      loss:'At 6 people waste does not cost $1,336 — it costs double. Every unplanned dinner is $60 in delivery.',
      channels:'Facebook family groups · Pinterest · Email · Nextdoor',
      msg:'1. Scale everything. 2. Grocery list for exactly 6. 3. The number is bigger for you.',
      triggers:'Scalable recipes · Bulk shopping · Free · $1,336+ savings',
      notes:'High value ICP — waste savings scale with family size · fold into Super Mom funnel initially' },

    { id:'walmart_shopper',     name:'Walmart Shopper Alpha',   status:'Active',              validated:true,
      demo:'Female · 28–50 · 2+ kids · HHI $30–80K · primary Walmart shopper · pickup or in-store · Walmart Great Value and national brands',
      psycho:'Practical and price-conscious. Loyal to Walmart. Skeptical of apps that do not understand her actual grocery brands.',
      pain:'No app has ever understood what is actually in a Walmart shopper\'s fridge.',
      sec_pain:'Recipe apps assume she shops at Whole Foods. Suggestions for ingredients she cannot find at Walmart.',
      value:'800,000 Walmart products in the database. The app knows her exact brands. Shopping list goes to Walmart cart.',
      loss:'Every app that does not know Walmart is another app she will delete in 3 days.',
      channels:'Facebook · Nextdoor · Email · Walmart app community',
      msg:'1. We know your Walmart. 2. 800,000 products. 3. Your brands. Your fridge. Your dinner.',
      triggers:'800,000 products · Walmart cart integration · Free · Alpha access',
      notes:'Alpha Wave 1 primary target — database is Walmart only · highest product-market fit for current build' },

    { id:'fitness_mom',         name:'Fitness Mom',             status:'Pending Validation',  validated:false,
      demo:'Female · 28–42 · 1–2 kids · HHI $60–110K · gym-goer · tracks macros · health-forward household',
      psycho:'Food is health not just fuel. Reads every label. Frustrated that healthy cooking takes so much time.',
      pain:'Healthy eating for a family requires hours of planning she cannot sustain.',
      sec_pain:'Planning macro-balanced family meals takes hours. Kids do not eat the healthy food. Expensive ingredients expire.',
      value:'Nutrition scoring on every meal. Macros calculated automatically. Healthy recipes from what is in the fridge.',
      loss:'Every processed meal she falls back on is a health goal missed.',
      channels:'Instagram · Pinterest health · Facebook fitness groups · Email',
      msg:'1. 6 nutrition dimensions. 2. Registered dietitians. 3. Healthy dinner in 30 minutes.',
      triggers:'6-dimension scoring · Registered dietitians · FDA-grade · 30 minutes',
      notes:'Fold into Health Optimizer funnel — same channels different copy angle' },

    { id:'millennial_couple',   name:'Millennial Couple',       status:'Pending Validation',  validated:false,
      demo:'Female or Male · 28–38 · DINK or one young child · HHI $80–160K · urban · food delivery heavy users',
      psycho:'Food is part of identity. Enjoy cooking when they have a plan. High delivery spend but aspirationally want to cook more.',
      pain:'Great income great kitchen terrible food habits — and they know it.',
      sec_pain:'$500/month on food delivery. Groceries sit unused. Cannot justify the waste but cannot stop the pattern.',
      value:'Turns groceries already bought into restaurant-quality dinners. Kills the delivery habit. Saves $500+/month.',
      loss:'At $500/month delivery spend they are burning $6,000/year on habits they want to break.',
      channels:'Instagram · TikTok · Email · Pinterest · YouTube',
      msg:'1. You have everything to cook. 2. 30 minutes better than DoorDash. 3. Your fridge. Your recipes.',
      triggers:'30 minutes · No DoorDash · Recipe quality · Free to try',
      notes:'High lifetime value — not primary pre-launch focus — Q3 2026' },

    { id:'meal_prep_enthusiast',name:'Meal Prep Enthusiast',    status:'Pending Validation',  validated:false,
      demo:'Female or Male · 25–40 · health-forward · Sunday prep ritual · 1–3 person household · HHI $50–100K',
      psycho:'Control through preparation. Sunday prep is a ritual. Frustrated when the plan falls apart mid-week.',
      pain:'Sunday prep ritual undermined by waste and poor ingredient planning.',
      sec_pain:'Spends 3 hours Sunday prepping only to throw out 30% by Wednesday.',
      value:'Meal plan built from what is already in the pantry. Nothing expires mid-week.',
      loss:'Every failed prep week is 3 hours of Sunday wasted.',
      channels:'Instagram · Pinterest · YouTube · Email · Reddit meal prep communities',
      msg:'1. Your Sunday prep should not fail by Wednesday. 2. Plan from your pantry. 3. Zero waste week.',
      triggers:'Pantry-first planning · 69.5% less waste · Free',
      notes:'Strong theme fit — No Waste Week · Meal Prep Sunday' },

    { id:'food_waste_fighter',  name:'Food Waste Fighter',      status:'Pending Validation',  validated:false,
      demo:'Female or Male · 28–45 · environmentally motivated · composting household · 1–4 person household · HHI $50–100K',
      psycho:'Waste is moral for them not just financial. Every expired item is a guilt event. Has tried everything.',
      pain:'Food waste is both financially and morally painful — and every solution has failed.',
      sec_pain:'Despite best intentions throws away $1,336/year. Environmental and financial waste is personal.',
      value:'69.5% reduction in food waste. Expiry alerts fire before food goes bad. The loop finally closes.',
      loss:'Every wasted item is an environmental failure and a financial one.',
      channels:'Instagram eco · Pinterest · Email · Reddit sustainability',
      msg:'1. 69.5% less food waste. 2. The pantry finally gets tracked. 3. Nothing expires without a plan.',
      triggers:'69.5% waste reduction · Expiry alerts · Pantry tracking · Free',
      notes:'Strong claim fit — 69.5% waste reduction is the primary hook' },

    { id:'date_night_planner',  name:'Date Night Planner',      status:'Pending Validation',  validated:false,
      demo:'Female or Male · 28–45 · partnered · 0–2 kids · wants to cook special meals at home · HHI $60–120K',
      psycho:'Restaurants feel impersonal. Wants intimacy of cooking together but lacks confidence to pull it off.',
      pain:'Date night cooking fails at the planning stage not the cooking stage.',
      sec_pain:'Great intentions for date night dinner at home. Opens fridge at 7 PM panics orders delivery.',
      value:'Date Night theme turns what is in the fridge into a restaurant-quality meal in 45 minutes.',
      loss:'Every failed date night at home is a restaurant bill anyway plus the disappointment.',
      channels:'Instagram · Pinterest romance · Email · Facebook couples groups',
      msg:'1. Cook for the person you love from what you already have. 2. 45 minutes. 3. Better than a reservation.',
      triggers:'Date Night theme · 45 minutes · Step-by-step · Free to try',
      notes:'Strong theme fit — Date Night · Special Occasion campaigns' },

    { id:'grandparent_cook',    name:'Grandparent Cook',        status:'Pending Validation',  validated:false,
      demo:'Female · 55–72 · grandchildren visit regularly · cooking is love language · fixed or comfortable income · Walmart shopper',
      psycho:'Cooking for grandchildren is highest priority. Wants real food not frozen meals. Responds to warmth not tech.',
      pain:'Cooking for grandchildren with different ages means constant guesswork and waste.',
      sec_pain:'Grandchildren have different preferences. Recipes too complex for mixed ages at the same table.',
      value:'Recipes built for mixed ages. Pantry tracking so nothing expires between visits. Simple step-by-step.',
      loss:'Every visit with a failed dinner is a memory she cannot get back.',
      channels:'Facebook · Email · Nextdoor · Word of mouth',
      msg:'1. Cook for the people you love. 2. From what you already have. 3. Simple. 4. Real food.',
      triggers:'Step by step · Family recipes · No waste · Free to try',
      notes:'Tertiary ICP — high loyalty once converted · Walmart shopper overlap' },

    { id:'beta_tester',         name:'Beta Tester',             status:'Active',              validated:true,
      demo:'Female · 28–45 · Walmart shopper · fresh recruit · not an alpha user · June 29 invite · 2+ kids',
      psycho:'Fresh eyes on the product. Has not seen the alpha build. Responds to the idea the app was shaped before she got access.',
      pain:'The original Super Mom pain — unresolved because she only just joined.',
      sec_pain:'Same as Super Mom — 6:30 PM wall food waste no plan. Has not yet experienced the fix.',
      value:'Gets an app already shaped by real families. Tested. Fixed. Ready. Still gets founding price.',
      loss:'If she waits for public launch she pays $19.99 and loses the founding price window.',
      channels:'Beta invite campaign · Email · Social · Referral from alpha users',
      msg:'1. Real families shaped this before you got here. 2. Founding price still available. 3. July 1 deadline.',
      triggers:'Fixed and tested · Founding price · July 1 deadline · Fresh experience',
      notes:'Active from June 29 — fresh recruits only — NOT alpha users' },

    { id:'pre_launch_visitor',  name:'Pre-Launch Visitor',      status:'Active',              validated:true,
      demo:'Female · 28–45 · found the coming soon page organically · Super Mom profile · not yet on waitlist',
      psycho:'Curious. Discovered easyChef Pro before launch. Discovery feels exclusive if handled correctly.',
      pain:'Found something promising but has not committed. One moment of friction and she is gone.',
      sec_pain:'Does not know the solution yet. The 6:30 PM wall is real but has not connected it to easyChef Pro.',
      value:'Free to join. Early access July 1. Founding price if she is in the first 5,000.',
      loss:'If she leaves now she finds it again at $19.99 when founding price is gone.',
      channels:'Organic search · Social discovery · Coming Soon page · Referral',
      msg:'1. You found this early. 2. Free to join. 3. Founding price ends at 5,000 families.',
      triggers:'Coming soon energy · Founding price scarcity · Free · July 1 date',
      notes:'Entry point ICP — coming soon page audience — convert to waitlist immediately' },

    { id:'founder_family',      name:'Founding Family',         status:'Active',              validated:true,
      demo:'Any ICP · has joined the waitlist · in the first 5,000 families · founding member pricing locked',
      psycho:'Identity now tied to easyChef Pro. Was there first. Proud of founding member status. High lifetime value.',
      pain:'Anticipation and slight anxiety — did I make the right call joining early?',
      sec_pain:'Waiting for July 1. Wants reassurance the app is coming and the founding price is real.',
      value:'$7.99/month forever. 60% off for life. First access July 1. Part of the family that built this.',
      loss:'If the app disappoints she loses trust and the founding price is not worth it.',
      channels:'Klaviyo SEQ-3 Urgency · SEQ-4 Launch Day · Email · Social',
      msg:'1. You are in. 2. July 1 is coming. 3. Your price is locked. 4. Here is what you helped build.',
      triggers:'SEQ-4 Launch Day · $7.99 confirmation · App download link · Founding family identity',
      notes:'Waitlist conversion state — high priority retention — every SEQ-3 and SEQ-4 targets this ICP' }
  ];

  var added = 0;
  var skipped = 0;
  icps.forEach(function(p) {
    if (existing[p.id]) { skipped++; return; }
    sheet.appendRow([
      p.id,           // id
      p.name,         // name
      p.id,           // code (same as id)
      p.status,       // status
      p.demo,         // demographics
      p.psycho,       // psychographics
      p.pain,         // primary_pain
      p.sec_pain,     // secondary_pain
      p.value,        // value_trigger
      p.loss,         // loss_aversion
      p.channels,     // channel_affinity
      p.msg,          // message_hierarchy
      p.triggers,     // conversion_triggers
      '',             // utm_campaign_codes (blank)
      '',             // lp_variants (blank)
      p.validated,    // validated
      p.notes,        // validation_notes
      today,          // created_at
      today           // updated_at
    ]);
    existing[p.id] = true;
    added++;
  });

  Logger.log('_seedIcpLibrary20: added=' + added + ' skipped=' + skipped);
  try { SpreadsheetApp.getUi().alert('ICP seed done — added: ' + added + ' · skipped (already exist): ' + skipped); } catch(e) {}
  return { added: added, skipped: skipped };
}

// ── Update 4 sparse existing ICP rows — May 2026 ─────────────────────────────
// Finds budget_family, health_optimizer, professional, alpha_recruit by column C
// and writes full profile data in place. Does not create rows or touch super_mom.
// Run once from Apps Script editor: _updateIcpSparseRows4

function _updateIcpSparseRows4() {
  var sheet = _getCCSheet(_CC_TAB.ICP);
  var last  = sheet.getLastRow();
  var today = '2026-05-08';

  if (last < 2) { Logger.log('ICPProfiles sheet has no data rows.'); return; }

  // col indices (1-based): id=1,name=2,code=3,status=4,demographics=5,
  // psychographics=6,primary_pain=7,secondary_pain=8,value_trigger=9,
  // loss_aversion=10,channel_affinity=11,message_hierarchy=12,
  // conversion_triggers=13,utm_campaign_codes=14,lp_variants=15,
  // validated=16,validation_notes=17,created_at=18,updated_at=19

  var updates = {
    budget_family: {
      name:       'Budget Family',
      status:     'Pending Validation',
      validated:  false,
      demo:       'Female or Male · 28–45 · 2+ kids · HHI $30–65K · one or dual low income · suburban or rural · price-sensitive',
      psycho:     'Every grocery trip is a math problem. Feels genuine stress when food is wasted. Practical and proud of stretching a dollar.',
      primary:    '$400/month grocery budget feels impossible to manage. Every wasted item is money her family needed.',
      secondary:  '$400/month grocery bill where half goes to waste. Buys on sale without a plan. Fridge full but dinner still costs $30 in delivery.',
      value:      'Saves $111/month on food waste. Makes the $400 budget actually feed the family all month.',
      loss:       'Every expired item is a bill not paid. Every DoorDash order is a week of lunches gone.',
      channels:   'Facebook savings groups · Pinterest budget meals · Email dollar-savings subject lines · Nextdoor deals',
      messaging:  '1. Dollar amount first always. 2. No gimmicks. 3. Simple proof. 4. Free trial removes risk. 5. Walmart integration.',
      triggers:   '$1,336/year · 800,000 Walmart products · Free to start · No credit card',
      notes:      'Secondary ICP — validate with beta data before building dedicated funnels'
    },
    health_optimizer: {
      name:       'Health Optimizer',
      status:     'Pending Validation',
      validated:  false,
      demo:       'Female · 28–45 · 1–2 kids or no kids · HHI $60–120K · tracks macros · gym-goer · health-conscious',
      psycho:     'Food is fuel. Reads nutrition labels. Frustrated no app connects pantry to nutritional outcomes. Wants data not vague advice.',
      primary:    'No tool connects pantry to meal plan to nutrition score. Tracks everything manually for hours every week.',
      secondary:  'Meal planning app does not know her pantry. Nutrition app does not help plan meals. Five apps none close the loop.',
      value:      '6-dimension nutrition scoring. FDA-grade data. Registered dietitians validated every recipe. One app closes the loop.',
      loss:       'Every untracked meal is a week of effort lost. Every nutrition app that ignores her fridge is another failed subscription.',
      channels:   'Instagram health · Pinterest nutrition · Email nutrition subject lines · Facebook professional groups',
      messaging:  '1. 6 nutrition dimensions. 2. FDA-grade data. 3. Registered dietitians. 4. The loop closes.',
      triggers:   '6-dimension scoring · Registered dietitians · FDA-grade · 10,000 recipe pages',
      notes:      'Q3 2026 — not validated — do not build funnels until beta data confirms'
    },
    professional: {
      name:       'Working Professional',
      status:     'Pending Validation',
      validated:  false,
      demo:       'Male or Female · 28–40 · single or couple · no kids or 1 young child · HHI $70–150K · urban · food delivery power user',
      psycho:     'Cooking feels like a project. Time is the scarcest resource. Would cook more without the mental overhead.',
      primary:    'Food delivery is $400/month and growing. The fridge is full. The plan is missing.',
      secondary:  'Spends $400/month on delivery. Has groceries that expire while ordering DoorDash. Knows it is irrational but cannot fix it at 8 PM.',
      value:      '30 minutes fridge to table. No recipe hunting. The app does the thinking after a long day.',
      loss:       '$400/month on delivery he knows is wrong. Every grocery receipt with expired items is wasted time.',
      channels:   'LinkedIn future · Instagram · Email · Facebook professional groups · TikTok discovery',
      messaging:  '1. 30 minutes. 2. No DoorDash. 3. Fridge to table. 4. The app thinks for you.',
      triggers:   '30 minutes · No DoorDash · $400/month savings · Free to try',
      notes:      'Q3 2026 — secondary ICP — needs dedicated LP and copy angle'
    },
    alpha_recruit: {
      name:       'Alpha Recruit',
      status:     'Active',
      validated:  true,
      demo:       'Female · 28–45 · Walmart shopper · 2+ kids · suburban · selected from waitlist · high engagement signal',
      psycho:     'Wants to be first. Proud of being chosen. Will provide honest feedback if experience earns it.',
      primary:    'Waiting for an app to launch while continuing to waste food and money every week.',
      secondary:  'Has joined the waitlist but app not live yet. Ready to try. Wants to feel like an insider.',
      value:      'Early access before anyone else. Shapes the app for 5,000 families. $7.99/month forever.',
      loss:       'If founding price ends at 5,000 families and she is not in that group she pays $19.99 forever.',
      channels:   'ConvertKit personal outreach · Email · Direct from Founder',
      messaging:  '1. You were chosen. 2. Help us build this. 3. $7.99/month forever for founding families.',
      triggers:   'Personal invite · Founding family · $7.99 locked · First access',
      notes:      'Active — direct personal outreach only · Founder personal inbox · DL-DIR format'
    }
  };

  // Read all codes from column C to find row indices
  var codes = sheet.getRange(2, 3, last - 1, 1).getValues(); // col C
  var updated = 0;

  codes.forEach(function(r, i) {
    var code = String(r[0]).toLowerCase().trim();
    var u    = updates[code];
    if (!u) return;

    var rowNum = i + 2; // 1-based, offset by header
    // Write columns 2–13, 16–17, 19 (leave 1=id, 3=code, 14=utm, 15=lp, 18=created_at unchanged)
    sheet.getRange(rowNum, 2,  1, 1).setValue(u.name);
    sheet.getRange(rowNum, 4,  1, 1).setValue(u.status);
    sheet.getRange(rowNum, 5,  1, 1).setValue(u.demo);
    sheet.getRange(rowNum, 6,  1, 1).setValue(u.psycho);
    sheet.getRange(rowNum, 7,  1, 1).setValue(u.primary);
    sheet.getRange(rowNum, 8,  1, 1).setValue(u.secondary);
    sheet.getRange(rowNum, 9,  1, 1).setValue(u.value);
    sheet.getRange(rowNum, 10, 1, 1).setValue(u.loss);
    sheet.getRange(rowNum, 11, 1, 1).setValue(u.channels);
    sheet.getRange(rowNum, 12, 1, 1).setValue(u.messaging);
    sheet.getRange(rowNum, 13, 1, 1).setValue(u.triggers);
    sheet.getRange(rowNum, 16, 1, 1).setValue(u.validated);
    sheet.getRange(rowNum, 17, 1, 1).setValue(u.notes);
    sheet.getRange(rowNum, 19, 1, 1).setValue(today);

    Logger.log('Updated row ' + rowNum + ': ' + code);
    updated++;
  });

  Logger.log('_updateIcpSparseRows4: updated=' + updated + ' of 4 targets');
  try { SpreadsheetApp.getUi().alert('ICP update done — ' + updated + ' rows updated.'); } catch(e) {}
  return { updated: updated };
}


// ── EC-2026-001 one-time seed ─────────────────────────────────────────────────
// Apps Script editor → select _seedEC2026001Brief → Run → View Execution log.
// Safe to re-run — setCampaignBrief and addGeneratedCopy both upsert.

function _seedEC2026001Brief() {
  var CAMPAIGN_ID = 'EC-2026-001';

  // ── 1. CampaignBriefs row ─────────────────────────────────────────────────
  setCampaignBrief({
    id:              CAMPAIGN_ID,
    name:            'Taco Tuesday Panic Escape',
    icp_code:        'super_mom',
    blueprint:       'A-Waitlist',
    channel:         'Facebook',
    goal:            'waitlist_signup_completed',
    slug:            'lp/waitlist-a',
    launch_date:     '2026-05-27',
    status:          'active',
    ml_approved:     true,
    post_count:      35,
    post_frequency:  'daily',
    email_sequences: 'full',
    email_variants:  'both',
    theme:           'taco-tuesday',
    publish_day:     'Tuesday',
    channels:        ['Facebook','Instagram','TikTok','Pinterest','Nextdoor','YouTube','X'],
    notes:           JSON.stringify({
      campaign_angle:      'speed',
      urgency_trigger:     'First 5,000 families lock in $7.99/month forever',
      founding_offer:      '$7.99/month · 60% off forever',
      campaign_duration:   35
    })
  });
  Logger.log('[_seedEC2026001Brief] CampaignBriefs row written: ' + CAMPAIGN_ID);

  // ── 2. GeneratedCopy row (needed by runner for headline / subheadline / CTA) ──
  // addGeneratedCopy uses id as unique key — fixed id prevents duplicate rows on re-run.
  var existing = getGeneratedCopy(CAMPAIGN_ID);
  if (!existing || !existing.length) {
    addGeneratedCopy({
      id:              'copy-ec2026001-seed',
      campaign_id:     CAMPAIGN_ID,
      icp_code:        'super_mom',
      channel:         'Facebook',
      headline:        'Stop the mealtime madness',
      subheadline:     '6:30 PM. Ingredients in the fridge. No plan. Again.',
      email_subject_a: 'You\'re throwing away $1,336 a year',
      email_subject_b: 'Every night at 6:30, the panic starts',
      lp_hero:         'Stop the mealtime madness',
      proof_bar:       '$1,336/year saved · 30 min fridge to table · 69.5% less food waste',
      cta_primary:     'Claim your founding spot',
      social_hook:     '6:30 PM panic is real. This app stops it.',
      share_mechanic:  'Invite a friend — get 2 months free',
      generated_at:    new Date().toISOString(),
      approved:        true
    });
    Logger.log('[_seedEC2026001Brief] GeneratedCopy row written');
  } else {
    Logger.log('[_seedEC2026001Brief] GeneratedCopy already exists — skipped');
  }

  Logger.log('[_seedEC2026001Brief] Done — EC-2026-001 brief and copy ready for ⚡ Run Full Campaign');
  try { SpreadsheetApp.getUi().alert('EC-2026-001 seeded. Click ⚡ Run Full Campaign to generate all assets.'); } catch(e) {}
}

// ── Governance seed functions ─────────────────────────────────────────────────

function _seedBrandDoctrine(sheet) {
  if (!sheet) return;
  _ccHdrStyle(sheet, _CC_HDR.BrandDoctrine);
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
  var rows = [
    ['PHONE_VISIBILITY_001', 'visual_progression', 'hard', true,
      '{"posts_1_3":{"phone_visible":false},"post_4":{"phone_visible":true,"mode":"first_reveal"},"posts_5_7":{"phone_visible":true}}'],
    ['LOOP_STRUCTURE_001', 'system_truth', 'hard', true,
      '{"loop_order":["TRACK","PLAN","OPTIMIZE","COOK","SHOP"],"cook_stage_position":4,"app_count":5}'],
    ['PHASE_GUARD_001', 'launch_phase', 'hard', true,
      '{"current_phase":"Blueprint_A_Waitlist","launch_date":"2026-07-01","allowed_ctas":["join_waitlist","founding_member","claim_founding_spot"],"restricted_elements":["full_app_demo","pricing_reveal"]}'],
    ['COLOR_SYSTEM_001', 'visual_identity', 'hard', true,
      '{"approved_colors":["#D93025","#111111","#FFFFFF","#F6EFE8","light_gray"],"cta_button":"#FF0000","banned":["blue","navy","gradient","shadow"]}'],
    ['SCRIPT_ORDER_001', 'technical', 'hard', true,
      '{"order":["convert.com","clarity","ga4"],"install_location":"head"}'],
    ['VOICE_FORBIDDEN_001', 'voice_control', 'soft', true,
      '{"forbidden_words":["revolutionary","game-changing","optimize (as verb — e.g. optimize your meals)","seamless","leverage","ecosystem","effortlessly","the app","pain points"],"forbidden_figures":["$1,500","$1500","$112","70%","50% off","Built by parents"],"banned_names":["Sarah","Lisa","Jennifer"],"optimize_exception":"OPTIMIZE screen and the OPTIMIZE feature label (the five-stage loop) are allowed"}'],
    ['VOICE_REQUIRED_001', 'voice_control', 'soft', true,
      '{"product_name":"easyChef Pro","required_phrases":["easyChef Pro","Built by first responders"],"approved_savings":"$1,336/year","approved_waste":"69.5%","approved_time":"30 minutes","approved_founding_discount":"60% off","monthly_savings_note":"$111 requires word average in body copy"}'],
    ['APPROVED_CLAIMS_001', 'compliance', 'hard', true,
      '{"forbidden":["$1,500","70%","9 patents","50% off","clinical"]}'],
    ['DL_ID_FORMAT_001', 'technical', 'hard', true,
      '{"format":"DL-[PREFIX]-[4-digit]","utm_content_rule":"DL_ID always first","prefixes":["EM","FB","IG","TK","PT","ND","YT","X","LP","AFF"],"example":"DL-EM-0001_SEQ-1_cta"}'],
    ['NO_INVENTED_TESTIMONIALS_001', 'compliance', 'hard', true,
      '{"forbidden_patterns":["Sarah from Denver","Lisa started using","[name] tried easyChef Pro","one mom told us","a family in [city]"]}'],
    ['SHAME_LANGUAGE_001', 'voice_control', 'hard', true,
      '{"forbidden_words":["lazy","disorganized","careless","failing","bad mom","should have"],"reframe":"The system is broken. It is never her fault."}'],
    ['SINGLE_CTA_001', 'structural', 'hard', true,
      '{"max_ctas":1,"rule":"One CTA per asset. One action. One destination. Never offer multiple options.","banned":["multiple buttons","secondary CTA","or you can also"]}'],
    ['MAKE_NOT_ZAPIER_001', 'technical', 'hard', true,
      '{"approved":"Make.com","banned":"Zapier","rule":"All automation references say Make.com. Never Zapier. Applies to all copy, specs, and code comments."}'],
    ['THEME_FOOD_RULE_001', 'visual_progression', 'hard', true,
      '{"appears_from_post":4,"posts_exempt":[1,2,3]}'],
    ['IMAGE_GENDER_RULE_001', 'visual_progression', 'hard', true,
      '{"subject_word_position":3,"rule":"If copy describes a woman, image subject must be a woman. Gender word must appear in first 3 words of SUBJECT line in image brief."}'],
    ['BRAND_VISUAL_TOKENS_001', 'visual_identity', 'hard', true,
      '{"primary_red":"#FF0000","beige":"#F6EFE8","black":"#000000","white":"#FFFFFF","cta_button_color":"#FF0000","cta_button_text":"#FFFFFF","headline_font":"Proza Libre","body_font":"Inter","shadow":"none","border_radius_pill":"999px","spacing_unit":"8px"}']
  ];
  if (rows.length > 0) sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  Logger.log('[_seedBrandDoctrine] Seeded ' + rows.length + ' rules');
}

function _seedCampaignStrategy(sheet) {
  if (!sheet) return;
  var existing = sheet.getDataRange().getValues().slice(1).map(function(r) { return r[0]; });
  [
    ['EMOTIONAL_ARC_001', 'emotional_progression', true,
      '{"stages":[{"stage":"hook","emotion":"exhausted"},{"stage":"problem","emotion":"frustrated"},{"stage":"agitate","emotion":"activated"},{"stage":"solve","emotion":"curious"},{"stage":"value","emotion":"relieved"},{"stage":"proof","emotion":"trusting"},{"stage":"cta","emotion":"happy"}]}'],
    ['SEQ_EMOTION_001', 'email_emotion_map', true,
      '{"SEQ-1":{"emotion":"exhausted"},"SEQ-2":{"emotion":"relieved"},"SEQ-3":{"emotion":"activated"},"SEQ-4":{"emotion":"proud_excited","override_note":"NEVER map SEQ-4 to hook or exhausted"}}'],
    ['SOCIAL_DERIVATION_001', 'arc_sequence', true,
      JSON.stringify({
        arc_order: [
          {position:1,stage:'hook',      emotional_job:'recognition',       emotion_entry:'unaware',          emotion_exit:'recognised',       phone:false, lp_section:'hook'},
          {position:2,stage:'problem',   emotional_job:'validation',         emotion_entry:'recognised',       emotion_exit:'understood',       phone:false, lp_section:'problem'},
          {position:3,stage:'agitate',   emotional_job:'tension',            emotion_entry:'understood',       emotion_exit:'activated',        phone:false, lp_section:'agitate'},
          {position:4,stage:'solve',     emotional_job:'inevitability',      emotion_entry:'activated',        emotion_exit:'curious',          phone:true,  lp_section:'solve'},
          {position:5,stage:'value',     emotional_job:'relief',             emotion_entry:'relieved',         emotion_exit:'calm',             phone:true,  lp_section:'value'},
          {position:6,stage:'lifecycle', emotional_job:'identity_alignment', emotion_entry:'calm',             emotion_exit:'identity_aligned', phone:true,  lp_section:'lifecycle'},
          {position:7,stage:'proof',     emotional_job:'trust',              emotion_entry:'identity_aligned', emotion_exit:'trusting',         phone:true,  lp_section:'proof'},
          {position:8,stage:'cta',       emotional_job:'belonging',          emotion_entry:'trusting',         emotion_exit:'belonging',        phone:true,  lp_section:'cta'}
        ],
        rule: 'Every channel runs this arc in this order. Roles never swap. Source: Campaign Creation Playbook Sections 08, 11, Law 8.'
      })]
  ].forEach(function(row) {
    if (existing.indexOf(row[0]) === -1) {
      sheet.appendRow(row);
    } else {
      // Upsert: overwrite existing row so values stay current
      var allRows = sheet.getDataRange().getValues();
      for (var ui = 1; ui < allRows.length; ui++) {
        if (String(allRows[ui][0]) === row[0]) {
          sheet.getRange(ui + 1, 1, 1, row.length).setValues([row]);
          break;
        }
      }
    }
  });
  Logger.log('[_seedCampaignStrategy] Seeded/updated 3 strategies including SOCIAL_DERIVATION_001');
}

// ── Governance reader functions ───────────────────────────────────────────────

function getBrandDoctrine(ruleId) {
  try {
    var sheet = _getCCSheet(_CC_TAB.BRAND_DOCTRINE);
    var last  = sheet.getLastRow();
    if (last < 2) return null;
    var rows = sheet.getRange(2, 1, last - 1, 5).getValues();
    for (var i = 0; i < rows.length; i++) {
      var active = String(rows[i][3]).toLowerCase();
      if (active !== 'true' && active !== '1' && active !== 'yes') continue;
      if (ruleId && String(rows[i][0]) !== ruleId) continue;
      var cond = {};
      try { cond = JSON.parse(String(rows[i][4] || '{}')); } catch(e) {}
      return {
        rule_id:        String(rows[i][0]),
        rule_type:      String(rows[i][1]),
        enforcement:    String(rows[i][2]),
        active:         true,
        conditions:     cond
      };
    }
  } catch(e) { Logger.log('[getBrandDoctrine] error: ' + e.message); }
  return null;
}

function patchBrandDoctrine(ruleId, conditions) {
  try {
    var sheet = _getCCSheet(_CC_TAB.BRAND_DOCTRINE);
    var last  = sheet.getLastRow();
    if (last < 2) return { ok: false, error: 'BrandDoctrine tab empty' };
    var ids = sheet.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === ruleId) {
        sheet.getRange(i + 2, 5).setValue(JSON.stringify(conditions));
        Logger.log('[patchBrandDoctrine] updated ' + ruleId);
        return { ok: true, rule_id: ruleId };
      }
    }
    return { ok: false, error: 'rule_id not found: ' + ruleId };
  } catch(e) {
    Logger.log('[patchBrandDoctrine] error: ' + e.message);
    return { ok: false, error: e.message };
  }
}

function getCampaignStrategy(strategyId) {
  try {
    var sheet = _getCCSheet(_CC_TAB.CAMP_STRATEGY);
    var last  = sheet.getLastRow();
    if (last < 2) return null;
    var rows = sheet.getRange(2, 1, last - 1, 4).getValues();
    for (var i = 0; i < rows.length; i++) {
      var active = String(rows[i][2]).toLowerCase();
      if (active !== 'true' && active !== '1' && active !== 'yes') continue;
      if (strategyId && String(rows[i][0]) !== strategyId) continue;
      var val = {};
      try { val = JSON.parse(String(rows[i][3] || '{}')); } catch(e) {}
      return {
        strategy_id:   String(rows[i][0]),
        strategy_type: String(rows[i][1]),
        active:        true,
        value:         val
      };
    }
  } catch(e) { Logger.log('[getCampaignStrategy] error: ' + e.message); }
  return null;
}

// ── One-time seed trigger ─────────────────────────────────────────────────────

function seedApprovedClaims() {
  var ss = _getCampaignSpreadsheet();
  var sheet = ss.getSheetByName(_CC_TAB.CLAIMS);
  if (!sheet) { sheet = ss.insertSheet(_CC_TAB.CLAIMS); _ccHdrStyle(sheet, _CC_HDR.ApprovedClaims); }
  _seedApprovedClaims(sheet);
  return { ok: true, message: 'ApprovedClaims seeded — ' + (sheet.getLastRow() - 1) + ' rows' };
}

// ── Full claims rewrite — human, visual, implied emotion ─────────────────────
function rewriteAllClaims() {
  try {
    var sheet = _getCCSheet(_CC_TAB.CLAIMS);
    var data  = sheet.getDataRange().getValues();
    var rowMap = {};
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) rowMap[String(data[i][0])] = i + 1;
    }

    // id → new exact_wording
    var rewrites = {
      // SAVINGS
      'annual_savings':          'The average family saves $1,336 a year. That is $111 back every single month.',
      'monthly_savings':         '$111 a month back in your pocket. Every month. Just from not throwing food away.',
      'roi_standard':            'The app costs $20 a month. The average family saves $111. Do that math once and you never think about the price again.',
      'roi_founding':            'Eight dollars a month. A hundred and eleven dollars back. That is not a subscription. That is a return.',
      'waste_equals_money':      '$111 in groceries thrown away every month. Not because you forgot to shop. Because there was no system.',
      'grocery_bill':            'Your shopping list only includes what you actually need. Nothing else makes the list.',
      'no_overbuy':              'No more buying a third jar of something you already have two of.',
      // WASTE
      'food_waste':              'The food in your fridge gets used. 69.5% less of it ends up in the trash.',
      'spoilage_prevention':     'The spinach at the back of your fridge is three days from going bad. easyChef Pro already planned dinner around it.',
      'nothing_forgotten':       'Nothing hides at the back of the fridge anymore.',
      'use_what_you_have':       'Dinner starts with what you already have. The shopping list fills in the gaps.',
      'fridge_awareness':        'You open the fridge knowing exactly what is in there. Because easyChef Pro already knows.',
      // SPEED
      'fridge_to_table':         'Fridge to table. Thirty minutes.',
      'dinner_decided':          'The fridge opens. Dinner is already decided. That is a different feeling.',
      'no_decision_wall':        'No more standing at an open fridge at 6:30 PM with nothing decided.',
      'faster_than_takeout':     'Dinner is on the table before the delivery driver finds parking.',
      'sunday_reset':            'One Sunday hour. Seven nights sorted.',
      // POSITIONING
      'kitchen_in_command':      'Your kitchen. Finally in command.',
      'one_app':                 'Five apps open on your phone. One does what all five should.',
      'full_loop':               'TRACK. PLAN. OPTIMIZE. COOK. SHOP. The loop closes every week. Nothing left open.',
      'only_app':                'One app. Everything your kitchen needs. Nothing it does not.',
      'outcomes_not_dashboards': 'No charts. No dashboards. Just tonight\'s dinner.',
      'not_a_meal_planner':      'A meal planner tells you what to cook. easyChef Pro runs your kitchen.',
      'not_a_calorie_tracker':   'A calorie tracker watches what you already ate. easyChef Pro decides what you cook next.',
      'closes_the_loop':         'Every other food app stops at one step. This one closes the whole loop.',
      'no_tracking':             'You cooked. easyChef Pro already knows. Nothing to log. Nothing to count.',
      // PRODUCT
      'grocery_scanning_free':   'Scan your groceries in. Your pantry updates. Free. No subscription to get started.',
      'photo_recognition':       'Take a photo of anything in your kitchen. easyChef Pro finds it and tells you exactly what to do with it.',
      'receipt_scan':            'Scan the receipt. Your pantry is already updated.',
      'auto_pantry_update':      'You cook. You shop. Your pantry keeps up on its own.',
      'expiry_tracking':         'Everything in your fridge has a clock on it. easyChef Pro is watching it for you.',
      'knows_your_kitchen':      'You never have to open the fridge twice to remember what is in there.',
      'no_food_logging':         'No daily logging. No tracking what you ate. Your kitchen just knows.',
      'three_ingredients':       'Three things in your fridge. Tonight\'s dinner decided.',
      'setup_time':              'Ten minutes. Your kitchen is running.',
      'weekly_meal_plan':        'A full week of dinners. Built from what is already in your kitchen.',
      'pantry_first_planning':   'The meal plan starts with what you already have. The shopping list fills in the gaps.',
      'schedule_aware':          'Tuesday is your long night. easyChef Pro already planned something quick.',
      'adaptive_planning':       'Your week changes. Your meal plan changes with it.',
      'no_repeat_meals':         'No one has to say we just had this again.',
      'comfort_food':            'Pizza night is still on the plan. easyChef Pro does not pretend life is always healthy.',
      'quick_meals':             'Some nights you have twenty minutes. The plan already knows.',
      'six_nutrition_dimensions':'Six dimensions of nutrition. Not just calories. Everything that actually matters about what you are eating.',
      'verified_nutrition':      'Every food in our database was verified by a registered dietitian. Not crowdsourced. Not guessed.',
      'nutrition_you_can_trust': 'The nutrition numbers are right. Verified. Not estimated. Right.',
      'deterministic_data':      'The same apple gives the same answer every time. No variation. No guessing.',
      'health_conditions':       'Tell easyChef Pro about your health needs once. It never asks again.',
      'family_memory':           'You told us once. Every meal since then already knows.',
      'allergy_safe':            'Every meal suggestion is already safe for your family. You told us what to avoid. We never forgot.',
      'sodium_tracking':         'Your doctor said watch the sodium. Your meal plan already knows.',
      'macro_tracking':          'Protein, carbs, fat — tracked across every meal. Without you having to think about it.',
      'calorie_accuracy':        'Calorie counts verified against 800,000 products. Numbers you can actually trust.',
      'no_generic_advice':       'Not generic nutrition advice. Built around your family\'s actual health needs.',
      'nutrition_steers':        'Healthier choices appear in the plan naturally. You did not have to overhaul how you cook.',
      'picky_eater':             'The picky one in your house? easyChef Pro already knows what they will not eat.',
      'fridge_to_recipe':        'What is already in your fridge becomes tonight\'s dinner. Thirty minutes.',
      'recipe_from_what_you_have':'Every recipe starts with ingredients you already own. Not a list of things to go buy.',
      'step_by_step':            'First chop to last plate. Every step is there when you need it.',
      'cook_mode':               'Your hands are busy cooking. The instructions follow along. Hands-free.',
      'verified_recipes':        'Every recipe is built on verified nutrition data. The numbers are always right.',
      'recipe_to_cart':          'One tap. Every ingredient from the recipe is already on your list.',
      'shopping_list_auto':      'Your shopping list builds itself. What you already have stays off it.',
      'pantry_first_shopping':   'Your pantry is checked before your list is built. You only buy what you actually need.',
      'one_click_checkout':      'One tap checkout at Walmart. More stores coming.',
      'grocery_stores_growing':  'Walmart today. More stores every month.',
      'shared_grocery_list':     'Share the list. It updates in real time. Everyone sees the same thing.',
      'family_shopping':         'One list. The whole family. Everyone sees it update the moment something changes.',
      'no_duplicate_buying':     'No more buying something you already have two of. The list knows your kitchen.',
      'list_quantity':           'Exact quantities. No guessing at the store.',
      'less_trips':              'One trip. The whole week covered.',
      'whole_family':            'Everyone\'s preferences. Everyone\'s restrictions. One app that holds it all.',
      'works_on_phone':          'iPhone and Android.',
      // BRAND
      'no_ads':                  'No ads. Not now. Not ever.',
      'command_structure':       'Thirty years running systems under pressure. Now running yours.',
      'modern_design':           'Built from scratch in 2026. Not a 2016 app with a fresh coat of paint.',
      'encouraging_voice':       'What you had for dinner yesterday is not a problem to solve.',
      // OUTCOMES
      'peaceful_evenings':       'Walk into the evening already knowing what is for dinner.',
      'less_stress':             'Running a kitchen should not feel like a second job.',
      'back_to_cooking':         'Spend less time coordinating dinner. More time actually making it.',
      'proud_table':             'Sit down. The table is set. You made this happen.',
      'decision_free':           'You already made a hundred decisions today. Dinner should not be another one.',
      // PRICING
      'founding_price':          '$7.99 a month. Locked forever.',
      'founding_discount':       '60% off the standard price.',
      'standard_price':          '$19.99 a month after founding.',
      'founding_scarcity':       'The first 5,000 families lock in at $7.99 forever. After that the price goes to $19.99.',
      // TRIAL
      'no_credit_card':          'Seven days. Full access. No credit card.',
      'seven_day_trial':         'Seven days. Every feature. No credit card. Your first night is already different.',
      'trial_full_access':       'The trial runs the full loop. TRACK. PLAN. OPTIMIZE. COOK. SHOP. Everything on from night one.',
      'trial_converts':          'By Day 7 you have planned meals, used the shopping list, and watched food stop going to waste. The decision makes itself.',
      'founding_trial':          'Start free. Lock in $7.99 before the 5,000 spots are gone.',
      // CREDIBILITY
      'profiles':                'Tested across 10,000 real households before a single family paid for it.',
      'database':                '800,000 products. Verified. Ready when you are.',
      'built_right':             'Three years. Nine patent-pending technologies filed with the USPTO. We got it right before we shipped it.',
      'no_hallucination':        'Every nutrition number comes from a verified source. easyChef Pro does not guess.'
    };

    var count = 0;
    Object.keys(rewrites).forEach(function(id) {
      var rowIdx = rowMap[id];
      if (!rowIdx) { Logger.log('[rewriteAllClaims] not found: ' + id); return; }
      sheet.getRange(rowIdx, 3).setNumberFormat('@').setValue(rewrites[id]);
      count++;
    });

    Logger.log('[rewriteAllClaims] rewritten:' + count);
    return { ok: true, rewritten: count };
  } catch(e) {
    Logger.log('[rewriteAllClaims] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Bulk approve all PENDING claims — LEGAL_REVIEW and BUILD_NEEDED untouched ─
function approveAllPendingClaims() {
  try {
    var sheet = _getCCSheet(_CC_TAB.CLAIMS);
    var data  = sheet.getDataRange().getValues();
    var now   = new Date().toISOString().split('T')[0];
    var count = 0;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][3]).toUpperCase() === 'PENDING') {
        sheet.getRange(i + 1, 4).setValue('ACTIVE');
        sheet.getRange(i + 1, 5).setValue('Taylor');
        sheet.getRange(i + 1, 6).setValue(now);
        count++;
      }
    }
    Logger.log('[approveAllPendingClaims] approved:' + count);
    return { ok: true, approved: count };
  } catch(e) {
    Logger.log('[approveAllPendingClaims] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Approved Claims patch — factual corrections + new DNI claims ──────────────
function patchApprovedClaimsV2() {
  try {
    var sheet   = _getCCSheet(_CC_TAB.CLAIMS);
    var data    = sheet.getDataRange().getValues();
    var now     = new Date().toISOString().split('T')[0];
    var updated = 0;

    // Build ID → row index map (1-based)
    var rowMap = {};
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) rowMap[String(data[i][0])] = i + 1;
    }

    // Updates: [id, col(1-based), newValue]
    var updates = [
      // no_tracking — rewrite: OPTIMIZE does track; distinction is automatic not manual
      ['no_tracking',        3, 'easyChef Pro does not ask you to log what you ate. It already knows what you cooked.'],
      // built_right — inventions → patent-pending technologies
      ['built_right',        3, 'Three years in development — nine patent-pending technologies filed with the USPTO before a single family used it.'],
      // fda_grade → clinical grade anchored to DNI
      ['fda_grade',          2, 'credibility'],
      ['fda_grade',          3, 'Powered by Digital Nutrition Intelligence™ — clinical grade nutrition data, the same standard used in medical and dietitian practice.'],
      // shared_grocery_list — PENDING → ACTIVE
      ['shared_grocery_list',4, 'ACTIVE'],
      ['shared_grocery_list',5, 'Taylor'],
      ['shared_grocery_list',6, now]
    ];

    updates.forEach(function(u) {
      var rowIdx = rowMap[u[0]];
      if (!rowIdx) { Logger.log('[patchApprovedClaimsV2] not found: ' + u[0]); return; }
      sheet.getRange(rowIdx, u[1]).setNumberFormat('@').setValue(u[2]);
      updated++;
    });

    // New claims to add
    var existingIds = Object.keys(rowMap);
    var newClaims = [
      ['digital_nutrition_intelligence', 'credibility',
       'Powered by Digital Nutrition Intelligence™ — clinical grade nutrition data, verified by registered dietitians, never crowdsourced.',
       'ACTIVE', 'Taylor', now, 'Trademark — exact casing and ™ always required'],
      ['not_crowdsourced', 'credibility',
       'Clinical grade nutrition data, verified by registered dietitians, never crowdsourced.',
       'ACTIVE', 'Taylor', now, 'Standalone proof section version of DNI claim']
    ];

    var toAdd = newClaims.filter(function(r) { return existingIds.indexOf(r[0]) < 0; });
    if (toAdd.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, toAdd.length, toAdd[0].length)
        .setNumberFormat('@').setValues(toAdd);
    }

    Logger.log('[patchApprovedClaimsV2] updated:' + updated + ' added:' + toAdd.length);
    return { ok: true, updated: updated, added: toAdd.length };
  } catch(e) {
    Logger.log('[patchApprovedClaimsV2] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

// ── Claim quality rules + back_to_cooking fix + clinical unblock ──────────────
function seedClaimQuality001() {
  try {
    var sheet = _getCCSheet(_CC_TAB.BRAND_DOCTRINE);
    var data  = sheet.getDataRange().getValues();
    var existing = {};
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) existing[String(data[i][0])] = i + 1;
    }

    // Fix APPROVED_CLAIMS_001 — remove 'clinical' from forbidden (clinical grade is now approved)
    if (existing['APPROVED_CLAIMS_001']) {
      sheet.getRange(existing['APPROVED_CLAIMS_001'], 5)
        .setValue('{"forbidden":["$1,500","70%","9 patents","50% off"],"note":"clinical grade nutrition is approved — standalone clinical without grade context is not"}');
    }

    // Add CLAIM_QUALITY_001 if not present
    if (!existing['CLAIM_QUALITY_001']) {
      var value = {
        formula: 'Recognition → emotional tension → human outcome. NOT: feature → benefit.',
        the_test: 'Could a real exhausted human say this out loud? If not, rewrite it.',
        emotion_approach: 'Implied emotion, not direct emotion. Create the emotional experience — do not label it.',
        strong_claim_rules: [
          'emotionally visual — the reader can picture it',
          'human language — sounds spoken, not marketed',
          'recognizable life moment — she has been here before',
          'implies transformation without stating it',
          'avoids startup jargon and SaaS language',
          'avoids feature-stuffing — one clear human truth per claim',
          'shows the experience instead of labeling the emotion'
        ],
        reject_if: [
          'sounds corporate, app-store-ish, or SaaS-y',
          'uses feature → benefit structure',
          'labels the emotion instead of creating it',
          'sounds like someone is marketing software',
          'tells instead of shows',
          'could have been written by any food app'
        ],
        examples: [
          { weak: 'No more daily food decisions',
            strong: 'You already made a hundred decisions today. Dinner should not be another one.',
            why: 'visual, emotionally specific, feels real, sounds human' },
          { weak: 'Dinner handled before you walk in the door',
            strong: 'Walk into the evening already knowing what is for dinner.',
            why: 'present tense, sensory — you can feel it' },
          { weak: 'The mental load of running a kitchen — gone',
            strong: 'Running a kitchen should not feel like a second job.',
            why: 'recognizable human observation, not a product claim' },
          { weak: 'easyChef Pro handles the logistics — you handle the cooking',
            strong: 'Spend less time coordinating dinner. More time actually making it.',
            why: 'implied emotion, human contrast, no product mention needed' },
          { weak: 'Less stress',
            strong: 'No more staring into the fridge hoping dinner appears.',
            why: 'implied emotion creates experience — direct emotion label creates nothing' }
        ]
      };
      sheet.appendRow(['CLAIM_QUALITY_001', 'claim_quality', 'soft', true, JSON.stringify(value)]);
    }

    // Fix back_to_cooking claim in ApprovedClaims
    var claimsSheet = _getCCSheet(_CC_TAB.CLAIMS);
    var claimsData  = claimsSheet.getDataRange().getValues();
    for (var j = 1; j < claimsData.length; j++) {
      if (String(claimsData[j][0]) === 'back_to_cooking') {
        claimsSheet.getRange(j + 1, 3).setValue('Spend less time coordinating dinner. More time actually making it.');
        break;
      }
    }

    Logger.log('[seedClaimQuality001] done');
    return { ok: true };
  } catch(e) {
    Logger.log('[seedClaimQuality001] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

function seedGovernanceTabs() {
  var ss = _getCampaignSpreadsheet();
  [_CC_TAB.BRAND_DOCTRINE, _CC_TAB.CAMP_STRATEGY].forEach(function(name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) { sheet = ss.insertSheet(name); _ccHdrStyle(sheet, _CC_HDR[name]); }
  });
  _seedBrandDoctrine(ss.getSheetByName(_CC_TAB.BRAND_DOCTRINE));
  _seedCampaignStrategy(ss.getSheetByName(_CC_TAB.CAMP_STRATEGY));
  Logger.log('[seedGovernanceTabs] Done');
  return { ok: true, message: 'BrandDoctrine (15 rules) + CampaignStrategy (2 strategies) seeded' };
}

// ══════════════════════════════════════════════════════════════════════════════
// GOVERNANCE LAYER — MasterPositioning + StageGates + RetentionMilestones
// ══════════════════════════════════════════════════════════════════════════════

function _setupMasterPositioning() {
  var ss    = _getCampaignSpreadsheet();
  var name  = _CC_TAB.MASTER_POSITIONING;
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  var r = sheet.getRange(1, 1, 1, _CC_HDR.MasterPositioning.length);
  r.setValues([_CC_HDR.MasterPositioning]);
  r.setBackground('#0B0D10');
  r.setFontColor('#C9A84C');
  r.setFontWeight('bold');
  r.setFontSize(9);
  r.setFontFamily('Courier New');
  sheet.setFrozenRows(1);
  for (var i = 1; i <= _CC_HDR.MasterPositioning.length; i++) sheet.setColumnWidth(i, 160);
  Logger.log('[_setupMasterPositioning] done — ' + _CC_HDR.MasterPositioning.length + ' columns');
  return { ok: true, tab: name, columns: _CC_HDR.MasterPositioning.length };
}

function getMasterPositioning(positioning_id) {
  if (!positioning_id) return null;
  var sheet   = _getCCSheet(_CC_TAB.MASTER_POSITIONING);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  var hdr  = _CC_HDR.MasterPositioning;
  var data = sheet.getRange(2, 1, lastRow - 1, hdr.length).getValues();
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]) === String(positioning_id)) {
      var obj = {};
      hdr.forEach(function(h, j) { obj[h] = data[i][j] === null ? '' : String(data[i][j]); });
      return obj;
    }
  }
  return null;
}

function getMasterPositioningByCampaign(campaign_id) {
  if (!campaign_id) return [];
  var sheet   = _getCCSheet(_CC_TAB.MASTER_POSITIONING);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var hdr    = _CC_HDR.MasterPositioning;
  var cidIdx = hdr.indexOf('campaign_id');
  var data   = sheet.getRange(2, 1, lastRow - 1, hdr.length).getValues();
  var results = [];
  data.forEach(function(row) {
    if (String(row[cidIdx]) === String(campaign_id)) {
      var obj = {};
      hdr.forEach(function(h, j) { obj[h] = row[j] === null ? '' : String(row[j]); });
      results.push(obj);
    }
  });
  return results;
}

function saveMasterPositioning(positioning) {
  if (!positioning || !positioning.campaign_id) return { ok: false, error: 'campaign_id required' };
  var sheet = _getCCSheet(_CC_TAB.MASTER_POSITIONING);
  var hdr   = _CC_HDR.MasterPositioning;
  var now   = _ccNow();

  if (!positioning.positioning_id) {
    positioning.positioning_id = 'MP-' + positioning.campaign_id + '-' + Date.now();
  }
  if (!positioning.version)    positioning.version    = '1';
  if (!positioning.status)     positioning.status     = 'DRAFT';
  if (!positioning.created_at) positioning.created_at = now;
  positioning.updated_at = now;

  var row = hdr.map(function(h) { return positioning[h] !== undefined ? positioning[h] : ''; });
  _ccUpsert(sheet, hdr, positioning.positioning_id, row);
  Logger.log('[saveMasterPositioning] ' + positioning.positioning_id);
  return { ok: true, positioning_id: positioning.positioning_id };
}

function lockMasterPositioning(positioning_id) {
  var mp = getMasterPositioning(positioning_id);
  if (!mp) return { ok: false, error: 'positioning not found: ' + positioning_id };
  mp.locked     = 'TRUE';
  mp.status     = 'APPROVED';
  mp.updated_at = _ccNow();
  return saveMasterPositioning(mp);
}

// ── StageGates ────────────────────────────────────────────────────────────────

function _setupStageGates() {
  var ss    = _getCampaignSpreadsheet();
  var name  = _CC_TAB.STAGE_GATES;
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  var r = sheet.getRange(1, 1, 1, _CC_HDR.StageGates.length);
  r.setValues([_CC_HDR.StageGates]);
  r.setBackground('#0B0D10');
  r.setFontColor('#C9A84C');
  r.setFontWeight('bold');
  r.setFontSize(9);
  r.setFontFamily('Courier New');
  sheet.setFrozenRows(1);
  for (var i = 1; i <= _CC_HDR.StageGates.length; i++) sheet.setColumnWidth(i, 160);
  Logger.log('[_setupStageGates] done — ' + _CC_HDR.StageGates.length + ' columns');
  return { ok: true, tab: name, columns: _CC_HDR.StageGates.length };
}

function seedStageGates(campaign_id, positioning_id) {
  if (!campaign_id) return { ok: false, error: 'campaign_id required' };
  var sheet = _getCCSheet(_CC_TAB.STAGE_GATES);
  var hdr   = _CC_HDR.StageGates;
  var now   = _ccNow();

  var stages = [
    {
      stage_number:   '1',
      stage_name:     'Stage 1 Awareness',
      emotional_job:  'exhausted → frustrated',
      weeks:          '2',
      metric_1_name:  'email_open_rate',   metric_1_target: '45%',
      metric_2_name:  'reach',             metric_2_target: '25000',
      metric_3_name:  '',                  metric_3_target: '',
      unlock_event:   'email_open_rate>=45% AND reach>=25000',
      unlock_actions: JSON.stringify([
        'activate SEQ-2',
        'unlock consideration assets',
        'brief Searah posts 3-5',
        'notify marketing lead'
      ]),
      social_posts: '1-2', email_assets: 'SEQ-1', persona_rotation: 'super_mom'
    },
    {
      stage_number:   '2',
      stage_name:     'Stage 2 Education',
      emotional_job:  'frustrated → activated',
      weeks:          '2',
      metric_1_name:  'email_ctr',         metric_1_target: '15%',
      metric_2_name:  'lp_visitors',       metric_2_target: '3000',
      metric_3_name:  '',                  metric_3_target: '',
      unlock_event:   'email_ctr>=15% AND lp_visitors>=3000',
      unlock_actions: JSON.stringify([
        'activate SEQ-2-E3 A/B test',
        'unlock conversion assets',
        'brief Searah posts 6-7',
        'notify JR ab test live'
      ]),
      social_posts: '3-4', email_assets: 'SEQ-2', persona_rotation: 'super_mom,budget_family'
    },
    {
      stage_number:   '3',
      stage_name:     'Stage 3 Consideration',
      emotional_job:  'activated → curious',
      weeks:          '2',
      metric_1_name:  'returning_visitors', metric_1_target: '20%',
      metric_2_name:  '',                   metric_2_target: '',
      metric_3_name:  '',                   metric_3_target: '',
      unlock_event:   'returning_visitors>=20%',
      unlock_actions: JSON.stringify([
        'activate SEQ-3 urgency',
        'unlock conversion posts',
        'set founding price scarcity counter'
      ]),
      social_posts: '5', email_assets: 'SEQ-3', persona_rotation: 'super_mom,health_optimizer'
    },
    {
      stage_number:   '4',
      stage_name:     'Stage 4 Conversion',
      emotional_job:  'curious → relieved → proud',
      weeks:          '2',
      metric_1_name:  'waitlist_signup_completed', metric_1_target: 'TRUE',
      metric_2_name:  '',                           metric_2_target: '',
      metric_3_name:  '',                           metric_3_target: '',
      unlock_event:   'waitlist_signup_completed=TRUE',
      unlock_actions: JSON.stringify([
        'activate SEQ-4 launch day',
        'switch blueprint A to B',
        'activate app store assets'
      ]),
      social_posts: '6', email_assets: 'SEQ-4', persona_rotation: 'all'
    },
    {
      stage_number:   '5',
      stage_name:     'Stage 5 Retention',
      emotional_job:  'proud → peaceful',
      weeks:          '4',
      metric_1_name:  'first_strike_rate',    metric_1_target: '45%',
      metric_2_name:  'tipping_point_rate',   metric_2_target: '60%',
      metric_3_name:  'paid_conversion',      metric_3_target: '40%',
      unlock_event:   'first_strike_rate>=45% AND tipping_point_rate>=60% AND paid_conversion>=40%',
      unlock_actions: JSON.stringify([
        'show paywall',
        'activate founding price offer',
        'fire subscription_started'
      ]),
      social_posts: '7', email_assets: 'SEQ-5', persona_rotation: 'all'
    }
  ];

  var existingGateIds = [];
  if (sheet.getLastRow() >= 2) {
    existingGateIds = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
      .getValues().map(function(r) { return String(r[0]); });
  }

  var added = 0;
  stages.forEach(function(s) {
    var gate_id = 'SG-' + campaign_id + '-' + s.stage_number;
    if (existingGateIds.indexOf(gate_id) > -1) return;
    var row = hdr.map(function(h) {
      if (h === 'gate_id')         return gate_id;
      if (h === 'campaign_id')     return campaign_id;
      if (h === 'positioning_id')  return positioning_id || '';
      if (h === 'gate_status')     return 'LOCKED';
      if (h === 'created_at')      return now;
      if (h === 'updated_at')      return now;
      return s[h] !== undefined ? s[h] : '';
    });
    var rng = sheet.getRange(sheet.getLastRow() + 1, 1, 1, hdr.length);
    rng.setNumberFormat('@');
    rng.setValues([row]);
    added++;
  });

  Logger.log('[seedStageGates] campaign=' + campaign_id + ' added=' + added);
  return { ok: true, campaign_id: campaign_id, gates_added: added };
}

// ── RetentionMilestones ───────────────────────────────────────────────────────

function _setupRetentionMilestones() {
  var ss    = _getCampaignSpreadsheet();
  var name  = _CC_TAB.RETENTION_MILESTONES;
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  var r = sheet.getRange(1, 1, 1, _CC_HDR.RetentionMilestones.length);
  r.setValues([_CC_HDR.RetentionMilestones]);
  r.setBackground('#0B0D10');
  r.setFontColor('#C9A84C');
  r.setFontWeight('bold');
  r.setFontSize(9);
  r.setFontFamily('Courier New');
  sheet.setFrozenRows(1);
  for (var i = 1; i <= _CC_HDR.RetentionMilestones.length; i++) sheet.setColumnWidth(i, 160);

  var hdr      = _CC_HDR.RetentionMilestones;
  var existing = sheet.getLastRow() >= 2
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().map(function(r) { return String(r[0]); })
    : [];

  var milestones = [
    {
      milestone_id:            'RM-001',
      milestone_number:        '1',
      milestone_name:          'Three-Ingredient Start',
      firebase_trigger_event:  'first_open',
      description:             'User opens app for first time and generates their first recipe',
      target_rate:             '80%',
      amber_rate:              '60%',
      red_rate:                '<60%',
      target_day:              'Day 0 — immediate',
      email_trigger:           '',
      push_trigger:            '',
      success_action:          'UNLOCK_RECIPE_FEED',
      failure_action:          'SEND_ONBOARDING_PUSH',
      conditions:              'first_open=true AND recipe_generated=true',
      actual_rate:             '',
      status:                  'PENDING',
      notes:                   ''
    },
    {
      milestone_id:            'RM-002',
      milestone_number:        '2',
      milestone_name:          'First Strike',
      firebase_trigger_event:  'first_strike_achieved',
      description:             'User has cooked 1 meal from the app within 7 days',
      target_rate:             '45%',
      amber_rate:              '30%',
      red_rate:                '<30%',
      target_day:              'Day 7',
      email_trigger:           'L-04 at Day 7 if not hit',
      push_trigger:            'lapse_day_3 + lapse_day_7',
      success_action:          'ADVANCE_TO_TIPPING_POINT',
      failure_action:          'TRIGGER_LAPSE_SEQUENCE',
      conditions:              'meals_cooked>=1 within 7 days',
      actual_rate:             '',
      status:                  'PENDING',
      notes:                   ''
    },
    {
      milestone_id:            'RM-003',
      milestone_number:        '3',
      milestone_name:          'Tipping Point',
      firebase_trigger_event:  'tipping_point_reached',
      description:             'User hits all three habit markers — meals cooked, spoilage saves, pantry items — AND logic required',
      target_rate:             '60%',
      amber_rate:              '40%',
      red_rate:                '<40%',
      target_day:              'Day 30',
      email_trigger:           '',
      push_trigger:            '',
      success_action:          'SHOW_PAYWALL',
      failure_action:          'TRIGGER_RECOVERY_EMAIL',
      conditions:              'meals_cooked>=3 AND spoilage_saves>=1 AND pantry_items>=20',
      actual_rate:             '',
      status:                  'PENDING',
      notes:                   'ALL THREE conditions required — AND logic, not OR'
    },
    {
      milestone_id:            'RM-004',
      milestone_number:        '4',
      milestone_name:          'Paid Conversion',
      firebase_trigger_event:  'subscription_started',
      description:             'User converts to paid subscription within 7 days of hitting Tipping Point',
      target_rate:             '40%',
      amber_rate:              '25%',
      red_rate:                '<25%',
      target_day:              'Within 7 days of Tipping Point',
      email_trigger:           'L-10 through L-13 recovery',
      push_trigger:            '',
      success_action:          'CONFIRM_SUBSCRIPTION',
      failure_action:          'TRIGGER_L10_RECOVERY_SEQUENCE',
      conditions:              'subscription_started=true within 7 days of tipping_point_reached',
      actual_rate:             '',
      status:                  'PENDING',
      notes:                   ''
    }
  ];

  var added = 0;
  milestones.forEach(function(m) {
    if (existing.indexOf(m.milestone_id) > -1) return;
    var row = hdr.map(function(h) { return m[h] !== undefined ? m[h] : ''; });
    var rng = sheet.getRange(sheet.getLastRow() + 1, 1, 1, hdr.length);
    rng.setNumberFormat('@');
    rng.setValues([row]);
    added++;
  });

  Logger.log('[_setupRetentionMilestones] done — added=' + added);
  return { ok: true, tab: name, milestones_added: added };
}

// ── One-time repair: fix destination_url domain in DeepLinkRegistry ───────────
// Run once from Apps Script editor. Replaces easychefpro.com/lp/ with
// launch.easychefpro.com/lp/ on every row. Safe to re-run (idempotent).
function repairDlDestinationUrls() {
  var ss     = _getCampaignSpreadsheet();
  var sheet  = ss.getSheetByName(_CC_TAB.DL);
  if (!sheet) { Logger.log('[repairDlDestinationUrls] DeepLinkRegistry tab not found'); return; }

  var last = sheet.getLastRow();
  if (last < 2) { Logger.log('[repairDlDestinationUrls] no data rows'); return; }

  var urlCol = _CC_HDR.DeepLinkRegistry.indexOf('destination_url') + 1; // 1-based
  var range  = sheet.getRange(2, urlCol, last - 1, 1);
  var vals   = range.getValues();

  var OLD = 'https://easychefpro.com/lp/';
  var NEW = 'https://launch.easychefpro.com/lp/';
  var fixed = 0;

  vals = vals.map(function(row) {
    var url = row[0];
    if (typeof url === 'string' && url.indexOf(OLD) === 0) {
      fixed++;
      return [url.replace(OLD, NEW)];
    }
    return row;
  });

  range.setValues(vals);
  Logger.log('[repairDlDestinationUrls] fixed=' + fixed + ' of ' + (last - 1) + ' rows');
  return { ok: true, fixed: fixed, total: last - 1 };
}

// ── Session 12 Part A: stamp emotional_stage + icp_code + positioning_id ─────
// Applies locked Master Positioning arc to all 30 Klaviyo emails in EC-2026-001.
// emotional_stage = per-email from 7-stage arc; icp_code = A→super_mom_money, B→super_mom_time
// Safe to re-run (idempotent — overwrites with same values).
function bulkUpdateEmailMetadata(campaignId) {
  var EMOTION_MAP = {
    'SEQ-1-E1': 'exhausted',
    'SEQ-1-E2': 'frustrated',
    'SEQ-1-E3': 'activated',
    'SEQ-2-E1': 'curious',
    'SEQ-2-E2': 'curious',
    'SEQ-2-E3': 'curious',
    'SEQ-2-E4': 'relieved',
    'SEQ-2-E5': 'relieved',
    'SEQ-3-E1': 'activated',
    'SEQ-3-E2': 'proud',
    'SEQ-3-E3': 'proud',
    'SEQ-3-E4': 'proud',
    'SEQ-4-E1': 'proud',
    'SEQ-4-E2': 'peaceful',
    'SEQ-4-E3': 'peaceful'
  };
  var POSITIONING_ID = 'MP-EC-2026-001-1779066831282';
  var hdrs     = _CC_HDR.EmailSequences;
  var sheet    = _getCCSheet(_CC_TAB.EMAIL);
  var last     = sheet.getLastRow();
  if (last < 2) return { ok: false, error: 'no rows' };

  var data = sheet.getRange(2, 1, last - 1, hdrs.length).getValues();
  var idCol      = hdrs.indexOf('id');
  var cidCol     = hdrs.indexOf('campaign_id');
  var emotionCol = hdrs.indexOf('emotional_stage');
  var icpCol     = hdrs.indexOf('icp_code');
  var posCol     = hdrs.indexOf('positioning_id');

  var updated = 0;
  var skipped = 0;
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!row[idCol] || String(row[cidCol]) !== campaignId) { skipped++; continue; }
    var id = String(row[idCol]);
    var m  = id.match(/SEQ-\d+-E\d+/);
    if (!m) { skipped++; continue; }
    var emotion = EMOTION_MAP[m[0]];
    if (!emotion) { skipped++; continue; }
    var variant = id.slice(-1).toUpperCase();
    data[i][emotionCol] = emotion;
    data[i][icpCol]     = variant === 'A' ? 'super_mom_money' : 'super_mom_time';
    data[i][posCol]     = POSITIONING_ID;
    updated++;
  }
  sheet.getRange(2, 1, last - 1, hdrs.length).setValues(data);
  Logger.log('[bulkUpdateEmailMetadata] updated=' + updated + ' skipped=' + skipped);
  return { ok: true, updated: updated, skipped: skipped };
}

// ── Patch hook text on hook-stage posts by platform (Session 12) ──────────────
// Finds all SocialPosts for campaignId with emotional_state='exhausted', updates
// hook field for each platform listed in platformMap. Safe to re-run.
function patchSocialHooks(campaignId, platformMap) {
  var hdrs      = _CC_HDR.SocialPosts;
  var sheet     = _getCCSheet(_CC_TAB.SOCIAL);
  var last      = sheet.getLastRow();
  if (last < 2) return { ok: false, error: 'no rows' };

  var data      = sheet.getRange(2, 1, last - 1, hdrs.length).getValues();
  var idCol       = hdrs.indexOf('id');
  var cidCol      = hdrs.indexOf('campaign_id');
  var platCol     = hdrs.indexOf('platform');
  var hookCol     = hdrs.indexOf('hook');
  var loopStgCol  = hdrs.indexOf('loop_stage');

  var updated = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!row[idCol]) continue;
    if (String(row[cidCol]) !== campaignId) continue;
    if (String(row[loopStgCol]).toLowerCase() !== 'hook') continue;
    var plat = String(row[platCol]);
    if (platformMap.hasOwnProperty(plat)) {
      data[i][hookCol] = platformMap[plat];
      updated.push(String(row[idCol]));
    }
  }
  if (updated.length > 0) {
    sheet.getRange(2, 1, last - 1, hdrs.length).setValues(data);
  }
  Logger.log('[patchSocialHooks] updated=' + updated.length + ' ids=' + updated.join(','));
  return { ok: true, updated: updated };
}

// ── Append a single row to ApprovedClaims ─────────────────────────────────────
function appendApprovedClaim(claim) {
  var hdrs  = _CC_HDR.ApprovedClaims;
  var sheet = _getCCSheet(_CC_TAB.CLAIMS);
  var row   = hdrs.map(function(h) { return claim[h] !== undefined ? claim[h] : ''; });
  sheet.appendRow(row);
  Logger.log('[appendApprovedClaim] appended id=' + claim.id);
  return { ok: true, id: claim.id };
}

// ── Remove fabricated testimonials from social post body_copy ─────────────────
// Finds posts with "Sarah from Denver" (a doctrine violation) and replaces the
// offending sentence with approved generic language. Safe to re-run.
function removeFabricatedTestimonials(campaignId) {
  var FABRICATED  = 'Sarah from Denver';
  var REPLACEMENT = 'Households we tracked saw real results — $1,336 back in their annual budget on average.';
  var hdrs     = _CC_HDR.SocialPosts;
  var sheet    = _getCCSheet(_CC_TAB.SOCIAL);
  var last     = sheet.getLastRow();
  if (last < 2) return { ok: false, error: 'no rows' };

  var data     = sheet.getRange(2, 1, last - 1, hdrs.length).getValues();
  var idCol    = hdrs.indexOf('id');
  var cidCol   = hdrs.indexOf('campaign_id');
  var bodyCol  = hdrs.indexOf('body_copy');

  var fixed = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!row[idCol]) continue;
    if (campaignId && String(row[cidCol]) !== campaignId) continue;
    var body = String(row[bodyCol] || '');
    if (body.indexOf(FABRICATED) === -1) continue;
    // Replace the Sarah sentence (ends at the period after her quote block)
    data[i][bodyCol] = body.replace(
      /Sarah from Denver[^.]*\.[^.]*\.[^.]*\./,
      REPLACEMENT
    );
    fixed.push(String(row[idCol]));
  }
  if (fixed.length > 0) {
    sheet.getRange(2, 1, last - 1, hdrs.length).setValues(data);
  }
  Logger.log('[removeFabricatedTestimonials] fixed=' + fixed.length + ' ids=' + fixed.join(','));
  return { ok: true, fixed: fixed };
}

// ── Set arc-based target_word_count on all 30 Klaviyo emails ─────────────────
// Applies word count targets per the Session 12 email length decision.
// Hook shorter and punchier; value/solve give her room to believe.
function bulkSetEmailWordCounts(campaignId) {
  var WC_MAP = {
    'SEQ-1-E1': 150,
    'SEQ-1-E2': 200,
    'SEQ-1-E3': 200,
    'SEQ-2-E1': 200,
    'SEQ-2-E2': 220,
    'SEQ-2-E3': 220,
    'SEQ-2-E4': 220,
    'SEQ-2-E5': 220,
    'SEQ-3-E1': 200,
    'SEQ-3-E2': 200,
    'SEQ-3-E3': 200,
    'SEQ-3-E4': 200,
    'SEQ-4-E1': 175,
    'SEQ-4-E2': 175,
    'SEQ-4-E3': 175
  };
  var hdrs   = _CC_HDR.EmailSequences;
  var sheet  = _getCCSheet(_CC_TAB.EMAIL);
  var last   = sheet.getLastRow();
  if (last < 2) return { ok: false, error: 'no rows' };

  var data   = sheet.getRange(2, 1, last - 1, hdrs.length).getValues();
  var idCol  = hdrs.indexOf('id');
  var cidCol = hdrs.indexOf('campaign_id');
  var wcCol  = hdrs.indexOf('target_word_count');

  var updated = 0;
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    if (!row[idCol] || String(row[cidCol]) !== campaignId) continue;
    var id = String(row[idCol]);
    var m  = id.match(/SEQ-\d+-E\d+/);
    if (!m) continue;
    var wc = WC_MAP[m[0]];
    if (!wc) continue;
    data[i][wcCol] = wc;
    updated++;
  }
  sheet.getRange(2, 1, last - 1, hdrs.length).setValues(data);
  Logger.log('[bulkSetEmailWordCounts] updated=' + updated);
  return { ok: true, updated: updated };
}

// ── Patch arbitrary fields on a single email sequence row ─────────────────────
// Merges fields into the existing row and writes back. Any field in
// _CC_HDR.EmailSequences can be updated. Returns the updated id.
function patchEmailFieldById(emailId, fields) {
  var seqs = getEmailSequences('');  // read all campaigns
  var seq  = null;
  for (var i = 0; i < seqs.length; i++) {
    if (String(seqs[i].id) === String(emailId)) { seq = seqs[i]; break; }
  }
  if (!seq) return { ok: false, error: 'email not found: ' + emailId };
  var merged = {};
  for (var k in seq) { merged[k] = seq[k]; }
  for (var f in fields) { merged[f] = fields[f]; }
  setEmailSequence(merged);
  Logger.log('[patchEmailFieldById] patched id=' + emailId + ' fields=' + Object.keys(fields).join(','));
  return { ok: true, id: emailId };
}

// ── Bulk-patch social post fields by ID ───────────────────────────────────────
// patches: array of { id, hook, body_copy, image_brief } — only truthy fields written
function bulkPatchSocialPosts(patches) {
  var sheet   = _getCCSheet(_CC_TAB.SOCIAL);
  var headers = _CC_HDR.SocialPosts;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: false, error: 'no rows' };
  var allVals = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

  var idCol = headers.indexOf('id');
  var patchMap = {};
  patches.forEach(function(p) { patchMap[String(p.id)] = p; });

  var updated = 0;
  for (var r = 0; r < allVals.length; r++) {
    var rowId = String(allVals[r][idCol]);
    var patch = patchMap[rowId];
    if (!patch) continue;
    var rowNum = r + 2;
    var fieldsPatched = [];
    Object.keys(patch).forEach(function(field) {
      if (field === 'id') return;
      var col = headers.indexOf(field);
      if (col < 0) return;
      sheet.getRange(rowNum, col + 1).setValue(patch[field]);
      fieldsPatched.push(field);
    });
    Logger.log('[bulkPatchSocialPosts] patched id=' + rowId + ' fields=' + fieldsPatched.join(','));
    updated++;
  }
  return { ok: true, updated: updated };
}

// ── Part C: fix SEQ-3 E2-A claim + assemble full_email_body for 29 emails ─────
// 1. Replaces "$144/year" with "$111/month" in SEQ-3 E2-A (urgency register fix).
// 2. Assembles full_email_body by joining non-empty body sections in arc order.
//    Skips rows that already have full_email_body content.
function assembleEmailBodies(campaignId) {
  var hdrs      = _CC_HDR.EmailSequences;
  var sheet     = _getCCSheet(_CC_TAB.EMAIL);
  var last      = sheet.getLastRow();
  if (last < 2) return { ok: false, error: 'no rows' };

  var data      = sheet.getRange(2, 1, last - 1, hdrs.length).getValues();
  var idCol     = hdrs.indexOf('id');
  var cidCol    = hdrs.indexOf('campaign_id');
  var hookCol   = hdrs.indexOf('body_hook');
  var probCol   = hdrs.indexOf('body_problem');
  var agitCol   = hdrs.indexOf('body_agitate');
  var solvCol   = hdrs.indexOf('body_solve');
  var valCol    = hdrs.indexOf('body_value');
  var proofCol  = hdrs.indexOf('body_proof');
  var ctaCol    = hdrs.indexOf('body_cta');
  var fullCol   = hdrs.indexOf('full_email_body');

  var SECTION_COLS = [hookCol, probCol, agitCol, solvCol, valCol, proofCol, ctaCol];
  var FIX_ID       = campaignId + '-SEQ-3-E2-A';

  var assembled = 0;
  var fixApplied = false;

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var id  = String(row[idCol] || '');
    if (!id || String(row[cidCol]) !== campaignId) continue;

    // Step 1 — apply claim fix on SEQ-3 E2-A in all text fields
    if (id === FIX_ID) {
      SECTION_COLS.concat([fullCol]).forEach(function(col) {
        if (col < 0) return;
        var t = String(data[i][col] || '');
        if (t.indexOf('$144/year') !== -1) {
          // Rewrite sentence to urgency/monthly register
          data[i][col] = t.replace(
            /\$144\/year/g,
            '$111\/month'
          ).replace(
            /saves you \$111\/month per year/g,
            'stops \$111 leaving your wallet this month'
          );
          fixApplied = true;
        }
      });
    }

    // Step 2 — assemble full_email_body if empty
    if (String(row[fullCol] || '').length > 50) continue;

    var parts = SECTION_COLS.map(function(col) {
      return col >= 0 ? String(data[i][col] || '').trim() : '';
    }).filter(function(s) { return s.length > 0; });

    if (parts.length === 0) continue;

    data[i][fullCol] = parts.join('\n\n');
    assembled++;
  }

  sheet.getRange(2, 1, last - 1, hdrs.length).setValues(data);
  Logger.log('[assembleEmailBodies] assembled=' + assembled + ' fix_applied=' + fixApplied);
  return { ok: true, assembled: assembled, fix_applied: fixApplied };
}
