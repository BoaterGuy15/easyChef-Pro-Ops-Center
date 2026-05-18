$path = 'C:\Users\Trader\easyChef-Pro-Ops-Center\Operations_EC2026001_Seed.gs'
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Fix post_count 64 -> 226
$content = $content.Replace('      post_count:       64,', '      post_count:       226,')

# Find block boundaries
$startMarker = '    // 8-stage arc: 1 post per channel per stage = 64 posts'
$endMarker = "    results.push('Seed OK: ' + newRows.length + ' social posts (8 stages x 8 channels)');"
$startIdx = $content.IndexOf($startMarker)
$endIdx   = $content.IndexOf($endMarker) + $endMarker.Length

if ($startIdx -eq -1) { Write-Error 'Start marker not found'; exit 1 }
if ($endIdx -lt $endMarker.Length) { Write-Error 'End marker not found'; exit 1 }

$newBlock = @"
    // 35-day arc: daily posts May 27-Jun 30 2026
    // Stage distribution: Hook(1-4) Problem(5-8) Agitate(9-13) Solve(14-18) Value(19-22) Lifecycle(23-24) Proof(25-29) CTA(30-35)
    var _DAYS = [
      // HOOK - Days 1-4
      {day:1,  stage:'hook',      feature:'problem',  hA:'You have an invisible leak. `$111 a month.',                          hB:'6:30 PM. Fridge full. Five apps open. Still no dinner.'},
      {day:2,  stage:'hook',      feature:'problem',  hA:'That spinach you bought Monday? Gone by Thursday.',                  hB:'You planned dinner. Then 6:30 happened again.'},
      {day:3,  stage:'hook',      feature:'problem',  hA:'`$1,336. That\'s what the average family loses every year.',          hB:'The plan was in your head. The fridge had other ideas.'},
      {day:4,  stage:'hook',      feature:'problem',  hA:'Five apps. They all do one thing. None close the loop.',             hB:'Sunday prep. Wednesday guessing game. Thursday pizza.'},
      // PROBLEM - Days 5-8
      {day:5,  stage:'problem',   feature:'problem',  hA:'Five apps. None of them talk to each other.',                        hB:'You buy groceries Sunday. By Wednesday it\'s a guessing game.'},
      {day:6,  stage:'problem',   feature:'problem',  hA:'The grocery app doesn\'t know your recipes.',                        hB:'Every dinner decision starts from zero. Every single night.'},
      {day:7,  stage:'problem',   feature:'problem',  hA:'You tracked. You planned. You still threw out the spinach.',         hB:'The apps don\'t fail you. The gap between them does.'},
      {day:8,  stage:'problem',   feature:'problem',  hA:'Monday meal plan. Wednesday takeout. Friday what\'s in the fridge?', hB:'The mental load of dinner never turns off. Not even weekends.'},
      // AGITATE - Days 9-13
      {day:9,  stage:'agitate',   feature:'problem',  hA:'The spinach. The ground beef. The yogurt. `$111 gone.',               hB:'`$1,336. Every year. Food you bought. Never ate.'},
      {day:10, stage:'agitate',   feature:'problem',  hA:'`$3.66 a day. The daily cost of the disconnect.',                     hB:'She didn\'t waste food. The system wasted it for her.'},
      {day:11, stage:'agitate',   feature:'problem',  hA:'The chicken that expired. The salad kit. The berries. Not your fault.', hB:'You opened the fridge and chose takeout again. `$111 says otherwise.'},
      {day:12, stage:'agitate',   feature:'problem',  hA:'`$111 a month isn\'t a spending problem. It\'s a system problem.',    hB:'You\'re not disorganized. The apps were never designed to connect.'},
      {day:13, stage:'agitate',   feature:'problem',  hA:'The invisible leak doesn\'t announce itself. It just drains.',        hB:'Every bill is correct. But `$111 disappears anyway. Every month.'},
      // SOLVE - Days 14-18
      {day:14, stage:'solve',     feature:'TRACK',    hA:'TRACK. Your pantry, finally tracked. The leak stops here.',          hB:'easyChef Pro knows what\'s in your fridge before it expires.'},
      {day:15, stage:'solve',     feature:'PLAN',     hA:'What if your fridge knew what was expiring before you opened it?',   hB:'TRACK sees what you have. PLAN builds dinner from it. Loop closed.'},
      {day:16, stage:'solve',     feature:'OPTIMIZE', hA:'Receipt scanned. Pantry updated. Expiry dates set. 10 seconds.',     hB:'The information was always there. It just wasn\'t connected.'},
      {day:17, stage:'solve',     feature:'COOK',     hA:'One scan closes the invisible leak. TRACK to COOK in one app.',      hB:'Your pantry. Your meals. Your grocery list. One system.'},
      {day:18, stage:'solve',     feature:'SHOP',     hA:'The gap between apps is where `$111 goes. This closes the gap.',      hB:'Not another app. A system. TRACK what you have. PLAN from it.'},
      // VALUE - Days 19-22
      {day:19, stage:'value',     feature:'all',      hA:'TRACK to PLAN to OPTIMIZE to COOK to SHOP. One loop.',              hB:'Dinner figured out before you open the fridge. Every night.'},
      {day:20, stage:'value',     feature:'PLAN',     hA:'PLAN builds five dinners from what you already own.',               hB:'Five dinners. From what\'s in your fridge right now. No store run.'},
      {day:21, stage:'value',     feature:'OPTIMIZE', hA:'OPTIMIZE: six nutrition dimensions. No tracking required.',         hB:'You stopped guessing what your family needs. OPTIMIZE shows it.'},
      {day:22, stage:'value',     feature:'COOK',     hA:'30 minutes. Fridge to table. COOK turns your pantry into dinner.',  hB:'SHOP builds your grocery list automatically. Every item you need.'},
      // LIFECYCLE - Days 23-24
      {day:23, stage:'lifecycle', feature:'all',      hA:'Join the founding family. The app that evolves with your life.',     hB:'Your kitchen. This chapter. And every chapter after.'},
      {day:24, stage:'lifecycle', feature:'all',      hA:'Baby arrives. Kids grow. Diet changes. easyChef Pro adapts.',       hB:'You\'re not the same person you were five years ago. Your system shouldn\'t be either.'},
      // PROOF - Days 25-29
      {day:25, stage:'proof',     feature:'proof',    hA:'10,000 households. 69.5% less waste. `$1,336 average savings.',      hB:'Built by first responders. Not Silicon Valley.'},
      {day:26, stage:'proof',     feature:'proof',    hA:'10,000 families tested it. `$1,336 back per family per year.',       hB:'`$7.99 a month to close a `$111 monthly leak. The math is clear.'},
      {day:27, stage:'proof',     feature:'proof',    hA:'69.5% less food waste. Validated across 10,000 profiles.',          hB:'They didn\'t change their habits. They changed the system.'},
      {day:28, stage:'proof',     feature:'proof',    hA:'First responders built it. Disconnected systems cost lives.',       hB:'10,000 households stopped throwing away `$1,336 a year.'},
      {day:29, stage:'proof',     feature:'proof',    hA:'`$1,336/year. 69.5% less waste. 30 min fridge to table. Real numbers.', hB:'Validated, not estimated. Built by people who know broken systems.'},
      // CTA - Days 30-35
      {day:30, stage:'cta',       feature:'launch',   hA:'You are founding the kitchen of the future.',                       hB:'First 5,000 families lock in `$7.99/month forever.'},
      {day:31, stage:'cta',       feature:'launch',   hA:'The founding price closes when 5,000 spots fill.',                  hB:'Join now. `$7.99 forever. The rest will pay `$19.99.'},
      {day:32, stage:'cta',       feature:'launch',   hA:'Founding spots filling. The founding price doesn\'t wait.',         hB:'You found this before the launch. Lock in your spot today.'},
      {day:33, stage:'cta',       feature:'launch',   hA:'Founding family: first 5,000 only. `$7.99/month. Forever.',          hB:'You\'ve seen the leak. You\'ve seen the fix. Your spot is here.'},
      {day:34, stage:'cta',       feature:'launch',   hA:'July 1. The founding family gets first access. You in?',            hB:'72 hours to lock your founding price. `$7.99/month. Forever.'},
      {day:35, stage:'cta',       feature:'launch',   hA:'Last chance. Founding price closes tonight. Kitchen in command.',   hB:'The kitchen of the future opens July 1. Founding families first.'}
    ];

    // Arc stage representatives for TikTok + YouTube (1 per stage = 8 posts each)
    var _ARC8_STAGES = [
      {day:1,  stage:'hook',      feature:'problem',  hA:'You have an invisible leak. `$111 a month.',                          hB:'6:30 PM. Fridge full. Five apps open. Still no dinner.'},
      {day:5,  stage:'problem',   feature:'problem',  hA:'Five apps. None of them talk to each other.',                        hB:'You buy groceries Sunday. By Wednesday it\'s a guessing game.'},
      {day:9,  stage:'agitate',   feature:'problem',  hA:'The spinach. The ground beef. The yogurt. `$111 gone.',               hB:'`$1,336. Every year. Food you bought. Never ate.'},
      {day:14, stage:'solve',     feature:'TRACK',    hA:'TRACK. Your pantry, finally tracked. The leak stops here.',          hB:'easyChef Pro knows what\'s in your fridge before it expires.'},
      {day:19, stage:'value',     feature:'all',      hA:'TRACK to PLAN to OPTIMIZE to COOK to SHOP. One loop.',              hB:'Dinner figured out before you open the fridge. Every night.'},
      {day:23, stage:'lifecycle', feature:'all',      hA:'Join the founding family. The app that evolves with your life.',     hB:'Your kitchen. This chapter. And every chapter after.'},
      {day:25, stage:'proof',     feature:'proof',    hA:'10,000 households. 69.5% less waste. `$1,336 average savings.',      hB:'Built by first responders. Not Silicon Valley.'},
      {day:30, stage:'cta',       feature:'launch',   hA:'You are founding the kitchen of the future.',                       hB:'First 5,000 families lock in `$7.99/month forever.'}
    ];

    var _DAILY_TYPES = ['facebook','instagram','pinterest','nextdoor','x','email'];
    var postData = [];

    // 6 daily platforms x 35 days = 210 rows
    _DAYS.forEach(function(d) {
      _DAILY_TYPES.forEach(function(t) {
        postData.push({day:d.day, stage:d.stage, feature:d.feature, type:t, hA:d.hA, hB:d.hB});
      });
    });

    // TikTok - one per arc stage (8 posts)
    _ARC8_STAGES.forEach(function(d) {
      postData.push({day:d.day, stage:d.stage, feature:d.feature, type:'tiktok', hA:d.hA, hB:d.hB});
    });

    // YouTube - one per arc stage (8 posts)
    _ARC8_STAGES.forEach(function(d) {
      postData.push({day:d.day, stage:d.stage, feature:d.feature, type:'youtube', hA:d.hA, hB:d.hB});
    });
    var spHdrLen = _CC_HDR.SocialPosts.length;
    var newRows = postData.map(function(r, idx) {
      var id    = 'ec001-sp-' + ('000' + (idx + 1)).slice(-3);
      var brief = _ec001_briefJson(r.stage, r.feature, r.day, r.hA, r.hB);
      return [
        id,
        'EC-2026-001',
        _ec001_platMap(r.type),
        r.hA,
        '',                           // body_copy - filled by generate_social_posts
        _ec001_cta(r.stage),
        _ec001_htags(r.feature, r.type),
        _ec001_imgBrief(r.stage, r.feature, r.day),
        '',                           // image_url
        _ec001_date(r.day),
        '08:00',
        'draft',
        '',                           // dl_id - assigned from DeepLinkRegistry
        '',                           // utm_url - built after dl_id activated
        '',                           // posted_url
        brief,                        // design_brief JSON
        r.stage,                      // lp_section_source
        '',                           // lp_headline_connection
        r.stage + ' - recognition',   // emotional_state
        r.stage === 'cta' ? 'committed_and_decisive' : '', // emotional_destination
        r.stage,                      // loop_stage
        ''                            // claude_design_url
      ];
    });

    var spWriteStart = spSheet.getLastRow() + 1;
    spSheet.getRange(spWriteStart, 1, newRows.length, spHdrLen).setValues(newRows);
    results.push('Seed OK: ' + newRows.length + ' social posts (35 days x 6 channels + 8 TikTok + 8 YouTube)');
"@

$newContent = $content.Substring(0, $startIdx) + $newBlock + $content.Substring($endIdx)
[System.IO.File]::WriteAllText($path, $newContent, [System.Text.Encoding]::UTF8)

# Verify
$verify = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$hasNew  = $verify.Contains('_DAYS')
$hasCnt  = $verify.Contains('post_count:       226,')
$hasMsg  = $verify.Contains('35 days x 6 channels + 8 TikTok + 8 YouTube')
Write-Host "Done. _DAYS present=$hasNew  post_count=226 present=$hasCnt  message updated=$hasMsg  fileLen=$($verify.Length)"
