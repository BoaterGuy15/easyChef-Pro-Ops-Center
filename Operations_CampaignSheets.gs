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
  BRAND_DOCTRINE:  'BrandDoctrine',
  CAMP_STRATEGY:   'CampaignStrategy',
  ASSET_LIFECYCLE: 'AssetLifecycle'
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
    'campaign_angle','urgency_trigger'
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
    'funnel_stage','subject_angle','body_theme','role','seq_template_id',
    'design_brief'
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
    'design_brief'
  ],
  LandingPages: [
    'id','campaign_id','icp_code','slug','full_url','title_tag','meta_description',
    'og_title','og_description','hero_headline','hero_subheadline',
    'section_problem','section_agitate','section_solve','section_value',
    'section_proof','section_cta','tracking_convert','tracking_clarity',
    'tracking_ga4','status','dev_built','qa_passed','pushed_to_production',
    'campaign_type','blueprint_code','icp_codes','theme','publish_day',
    'ab_test_variant','convert_experiment_id','shared_by_campaigns',
    'last_traffic_date','total_signups'
  ],
  LPInventory: [
    'id','slug','full_url','campaign_type','blueprint_code','icp_codes',
    'campaign_angle','lp_variant','headline','cta_primary','proof_bar',
    'status','dev_built','convert_installed','clarity_installed','ga4_installed',
    'campaigns_using','total_signups','conversion_rate',
    'created_at','last_updated','notes',
    'urgency_type','urgency_line','urgency_placement',
    'exclusivity_angle','exclusivity_line',
    'meta_title','meta_description','og_title','og_description','canonical_url','focus_keyword'
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
    'created_at','updated_at','brief_doc_url'
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
    ab_experiment_id: String(r[27] || ''),
    campaign_angle:   String(r[28] || ''),
    urgency_trigger:  String(r[29] || '')
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
    item.campaign_angle   !== undefined ? item.campaign_angle          : (ex ? ex[28] : ''),
    item.urgency_trigger  !== undefined ? item.urgency_trigger         : (ex ? ex[29] : '')
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
    seq_template_id: r[24] || '',
    design_brief:    r[25] || ''
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
    item.design_brief      !== undefined ? item.design_brief      : (ex ? ex[25] : '')
  ];
  _ccUpsert(sheet, headers, item.id, row);
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
    design_brief: r[15] || ''
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
    item.utm_url        !== undefined ? item.utm_url        : (ex ? ex[13] : ''),
    item.posted_url     !== undefined ? item.posted_url     : (ex ? ex[14] : ''),
    item.design_brief   !== undefined ? item.design_brief   : (ex ? ex[15] : '')
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
    focus_keyword:        String(r[32] || '')
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
    item.focus_keyword      !== undefined ? item.focus_keyword      : (ex ? ex[32] : '')
  ];
  _ccUpsert(sheet, headers, item.id, row);
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
      '{"subject_word_position":3,"rule":"If copy describes a woman, image subject must be a woman. Gender word must appear in first 3 words of SUBJECT line in image brief."}']
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
      '{"SEQ-1":{"emotion":"exhausted"},"SEQ-2":{"emotion":"relieved"},"SEQ-3":{"emotion":"activated"},"SEQ-4":{"emotion":"proud_excited","override_note":"NEVER map SEQ-4 to hook or exhausted"}}']
  ].forEach(function(row) {
    if (existing.indexOf(row[0]) === -1) sheet.appendRow(row);
  });
  Logger.log('[_seedCampaignStrategy] Seeded ' + 2 + ' strategies');
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
