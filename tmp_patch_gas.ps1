$enc = [System.Text.Encoding]::UTF8

# ── Operations_CampaignSheets.gs ─────────────────────────────────────────────
$f1 = 'C:\Users\Trader\easyChef-Pro-Ops-Center\Operations_CampaignSheets.gs'
$t1 = [System.IO.File]::ReadAllText($f1, $enc).Replace("`r`n","`n")

# Add MILESTONES to _CC_TAB
$t1 = $t1.Replace(
  "  LIFE_STAGES:       'LifeStages'`n};",
  "  LIFE_STAGES:       'LifeStages',`n  MILESTONES:        'Milestones'`n};"
)

# Add Milestones schema to _CC_HDR (before the closing }; after LifeStages)
$t1 = $t1.Replace(
  "  LifeStages: [`n    'life_stage_id','current_chapter','next_chapter',`n    'stage_recognition_line','next_stage_bridge','adaptation_copy','active'`n  ]`n};",
  "  LifeStages: [`n    'life_stage_id','current_chapter','next_chapter',`n    'stage_recognition_line','next_stage_bridge','adaptation_copy','active'`n  ],`n  Milestones: [`n    'id','campaign_id','title','date','type','color','created_at','created_by'`n  ]`n};"
)

[System.IO.File]::WriteAllText($f1, $t1, $enc)
"[OK] CampaignSheets patched"

# ── Operation.gs ─────────────────────────────────────────────────────────────
$f2 = 'C:\Users\Trader\easyChef-Pro-Ops-Center\Operation.gs'
$t2 = [System.IO.File]::ReadAllText($f2, $enc).Replace("`r`n","`n")

# Insert 3 new milestone routes right after seed_content_calendar route
$old2 = "    if(body.action === 'seed_content_calendar') {`n      var _ccSeed2 = seedEC2026001ContentCalendar(body.campaignId || body.campaign_id || 'EC-2026-001');`n      return respond({ ok:_ccSeed2.ok, result:_ccSeed2, log: Logger.getLog() });`n    }"
$new2 = "    if(body.action === 'seed_content_calendar') {`n      var _ccSeed2 = seedEC2026001ContentCalendar(body.campaignId || body.campaign_id || 'EC-2026-001');`n      return respond({ ok:_ccSeed2.ok, result:_ccSeed2, log: Logger.getLog() });`n    }`n    if(body.action === 'seed_milestones') {`n      var _sm = seedMilestones();`n      return respond({ ok:_sm.ok, result:_sm, log: Logger.getLog() });`n    }`n    if(body.action === 'get_milestones') {`n      var _gm = getMilestones(body.campaign_id || 'all');`n      return respond({ ok:_gm.ok, result:_gm, log: Logger.getLog() });`n    }`n    if(body.action === 'add_milestone') {`n      var _am = addMilestone(body);`n      return respond({ ok:_am.ok, result:_am, log: Logger.getLog() });`n    }"

if ($t2.IndexOf($old2) -lt 0) { Write-Error "Operation.gs anchor not found!"; exit 1 }
$t2 = $t2.Replace($old2, $new2)
[System.IO.File]::WriteAllText($f2, $t2, $enc)
"[OK] Operation.gs patched"
