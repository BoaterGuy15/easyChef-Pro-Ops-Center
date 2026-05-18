$enc = [System.Text.Encoding]::UTF8
$f   = 'C:\Users\Trader\easyChef-Pro-Ops-Center\cockpit.html'
$t   = [System.IO.File]::ReadAllText($f, $enc).Replace("`r`n","`n")

# ── 1. Inject new CSS before </style> ────────────────────────────────────────
$newCSS = @'

    /* ── Calendar 2.0 ──────────────────────────────────────────────────────── */
    .cal-nav { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
    .cal-nav-left { display:flex; align-items:center; gap:8px; }
    .cal-nav-title { font-size:15px; font-weight:700; letter-spacing:-0.2px; min-width:130px; text-align:center; }
    .cal-nav-btn { background:#1e1e22; border:1px solid #2a2a2e; color:#aaa; width:30px; height:30px; border-radius:8px; font-size:16px; cursor:pointer; font-family:inherit; transition:all 0.12s; display:flex; align-items:center; justify-content:center; }
    .cal-nav-btn:hover { background:#2a2a2e; color:#f0f0f0; }
    .cal-today-btn { background:transparent; border:1px solid #2a2a2e; color:#555; padding:4px 10px; border-radius:6px; font-size:10px; font-weight:600; cursor:pointer; font-family:inherit; letter-spacing:0.3px; transition:all 0.12s; }
    .cal-today-btn:hover { border-color:#0a84ff; color:#0a84ff; }
    .add-ms-btn { background:rgba(255,69,58,0.1); border:1px solid rgba(255,69,58,0.35); color:#ff453a; padding:5px 12px; border-radius:8px; font-size:11px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.12s; }
    .add-ms-btn:hover { background:rgba(255,69,58,0.22); }
    .cal-day { aspect-ratio:unset !important; min-height:72px; }
    .cal-date.date-red { color:#FF0000 !important; font-weight:800 !important; }
    .cal-pills { display:flex; flex-wrap:wrap; gap:2px; flex:1; align-content:flex-start; padding-top:2px; }
    .cal-pill { font-size:8px; font-weight:700; padding:1px 4px; border-radius:3px; letter-spacing:0.2px; line-height:14px; }
    .cal-ms-banner { display:block; width:100%; font-size:8px; font-weight:700; padding:2px 4px; border-radius:3px; margin-bottom:2px; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; letter-spacing:0.2px; line-height:14px; }

    /* Add Milestone modal */
    .ms-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.72); z-index:50; display:none; align-items:center; justify-content:center; padding:20px; }
    .ms-overlay.open { display:flex; }
    .ms-card { background:#1a1a1e; border:1px solid #2a2a2e; border-radius:16px; width:100%; max-width:380px; box-shadow:0 24px 64px rgba(0,0,0,0.7); }
    .ms-head { padding:14px 18px 10px; border-bottom:1px solid #2a2a2e; display:flex; align-items:center; justify-content:space-between; }
    .ms-htitle { font-size:15px; font-weight:700; }
    .ms-xbtn { background:#2a2a2e; border:none; color:#888; width:28px; height:28px; border-radius:50%; font-size:13px; cursor:pointer; font-family:inherit; }
    .ms-body { padding:16px 18px 20px; display:flex; flex-direction:column; gap:12px; }
    .ms-lbl { font-size:10px; text-transform:uppercase; letter-spacing:0.8px; color:#555; margin-bottom:4px; font-weight:600; display:block; }
    .ms-inp { width:100%; background:#0e0e10; border:1px solid #2a2a2e; border-radius:8px; color:#e0e0e0; font-family:inherit; font-size:13px; padding:9px 12px; outline:none; box-sizing:border-box; transition:border-color 0.12s; }
    .ms-inp:focus { border-color:#0a84ff; }
    .ms-swatches { display:flex; gap:8px; }
    .ms-swatch { width:30px; height:30px; border-radius:7px; cursor:pointer; border:2px solid transparent; transition:all 0.12s; flex-shrink:0; }
    .ms-swatch.on { border-color:#fff; box-shadow:0 0 0 3px rgba(255,255,255,0.15); }
    .ms-savebtn { background:#FF0000; border:none; color:#fff; padding:11px; border-radius:10px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; width:100%; }
    .ms-savebtn:disabled { background:#222; color:#444; cursor:default; }
    .ms-msg { font-size:11px; min-height:16px; color:#32d74b; text-align:center; }
'@
$t = $t.Replace("  </style>", $newCSS + "`n  </style>")
"[1] CSS injected"

# ── 2. Add Milestone modal HTML before sheet-overlay ─────────────────────────
$msModal = @'

  <!-- Add Milestone modal -->
  <div class="ms-overlay" id="ms-overlay" onclick="if(event.target===this)closeMsModal()">
    <div class="ms-card">
      <div class="ms-head">
        <span class="ms-htitle">Add Milestone</span>
        <button class="ms-xbtn" onclick="closeMsModal()">&#x2715;</button>
      </div>
      <div class="ms-body">
        <div><label class="ms-lbl">Title</label><input class="ms-inp" id="ms-title" placeholder="e.g. Content deadline, Review, Launch…" /></div>
        <div><label class="ms-lbl">Date</label><input class="ms-inp" id="ms-date" type="date" /></div>
        <div>
          <label class="ms-lbl">Color</label>
          <div class="ms-swatches">
            <div class="ms-swatch on" style="background:#FF0000" data-color="#FF0000" onclick="selectMsColor(this)"></div>
            <div class="ms-swatch" style="background:#ff9500" data-color="#ff9500" onclick="selectMsColor(this)"></div>
            <div class="ms-swatch" style="background:#0a84ff" data-color="#0a84ff" onclick="selectMsColor(this)"></div>
            <div class="ms-swatch" style="background:#32d74b" data-color="#32d74b" onclick="selectMsColor(this)"></div>
            <div class="ms-swatch" style="background:#bf5af2" data-color="#bf5af2" onclick="selectMsColor(this)"></div>
            <div class="ms-swatch" style="background:#ffd60a" data-color="#ffd60a" onclick="selectMsColor(this)"></div>
          </div>
        </div>
        <div><label class="ms-lbl">Your name</label><input class="ms-inp" id="ms-author" placeholder="Name" /></div>
        <button class="ms-savebtn" id="ms-savebtn" onclick="submitMilestone()">Add Milestone</button>
        <div class="ms-msg" id="ms-msg"></div>
      </div>
    </div>
  </div>

'@
$t = $t.Replace("  <div class=`"sheet-overlay`"", $msModal + "  <div class=`"sheet-overlay`"")
"[2] Modal HTML injected"

# ── 3. Replace old renderCal with new 2.0 implementation ─────────────────────
$oldCal = "    // ── Calendar ──────────────────────────────────────────────────────────────
    function isoDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}

    function renderCal(data){
      if(!data||!data.days){
        var emptyDiv=document.createElement('div');
        emptyDiv.className='loading';
        emptyDiv.style.cssText='display:flex;flex-direction:column;align-items:center;gap:14px;padding:40px 0';
        emptyDiv.appendChild(document.createTextNode('No calendar data. Click Sync to pull posts in.'));
        var syncBtn=document.createElement('button');
        syncBtn.textContent='Sync Posts to Calendar';
        syncBtn.style.cssText='background:rgba(10,132,255,0.12);border:1px solid #0a84ff;color:#0a84ff;padding:7px 20px;border-radius:7px;font-size:12px;cursor:pointer';
        syncBtn.onclick=syncCalendar;
        emptyDiv.appendChild(syncBtn);
        var pc=document.getElementById('panel-cal');
        if(pc){pc.innerHTML='';pc.appendChild(emptyDiv);}
        return;
      }
      var days=data.days,today=isoDate(new Date()),allDays=calData?calData.days:{};
      var dowHtml=DOW.map(function(d){return '<div class=`"cal-dow-cell`">'+d+'</div>';}).join('');
      var cells='',cur=new Date(2026,4,24),end=new Date(2026,6,4);
      while(cur<=end){
        var dk=isoDate(cur),dn=cur.getDate(),inC=cur>=CAM_START&&cur<=CAM_END,isT=dk===today;
        var dayObj=days[dk]||null,origDay=allDays[dk]||null;
        var cls='cal-day'+(inC?' in-campaign':' outside')+(isT?' is-today':'');
        if(dayObj){if(dayObj.blocked===dayObj.total&&dayObj.total>0)cls+=' has-blocked';if(dayObj.published===dayObj.total&&dayObj.total>0)cls+=' all-published';}
        else if(inC&&origDay&&hasFilters())cls+=' filtered-empty';
        var dateLbl=dn===1?MONTHS[cur.getMonth()].toUpperCase()+' 1':String(dn);
        var dotsHtml='<div class=`"cal-dots`"></div>',badgeHtml='';
        if(dayObj&&dayObj.total>0){
          var ps={};
          dayObj.posts.forEach(function(p){var c=p.blocked?'#ff453a':(STATUS_DOT_COLOR[p.status]||'#3a3a3a');if(!ps[p.platform]||p.blocked)ps[p.platform]=c;});
          dotsHtml='<div class=`"cal-dots`">'+Object.keys(ps).slice(0,6).map(function(pl){return '<div class=`"cal-dot`" style=`"background:'+ps[pl]+'`"></div>';}).join('')+'</div>';
          badgeHtml='<div class=`"cal-badge`">'+dayObj.total+'</div>';
        }
        var oc=inC&&dayObj?' onclick=`"openSheet(\''+dk+'\')`"':'';
        cells+='<div class=`"'+cls+'`"'+oc+'><div class=`"cal-date`">'+dateLbl+'</div>'+dotsHtml+badgeHtml+'</div>';
        cur.setDate(cur.getDate()+1);
      }
      document.getElementById('panel-cal').innerHTML=
        '<div class=`"cal-month-label`">May 27 – Jun 30, 2026'+(hasFilters()?' <span style=`"color:#0a84ff;font-size:11px;font-weight:400`">(filtered)</span>':'')+'</div>'+
        '<div class=`"cal-dow`">'+dowHtml+'</div>'+
        '<div class=`"cal-grid`">'+cells+'</div>';
    }"

if ($t.IndexOf($oldCal) -lt 0) {
  # Try without backtick-escaped quotes — file may use different quoting
  Write-Warning "Exact match not found — attempting indexOf on core anchor"
}

$newCal = @'
    // ── Calendar 2.0 ──────────────────────────────────────────────────────────
    function isoDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}

    var calViewYear=2026, calViewMonth=4; // May 2026 (0-indexed)
    var MILESTONES_BY_DATE={};

    var PILL_BG={
      'Facebook':'rgba(74,158,255,0.22)','Instagram':'rgba(225,48,108,0.22)',
      'Pinterest':'rgba(230,0,35,0.20)','TikTok':'rgba(170,170,170,0.16)',
      'X':'rgba(200,200,200,0.14)','Email':'rgba(10,132,255,0.22)',
      'Nextdoor':'rgba(76,175,80,0.20)','YouTube':'rgba(255,48,64,0.22)'
    };
    var PILL_FG={
      'Facebook':'#4a9eff','Instagram':'#e1306c','Pinterest':'#ff4858',
      'TikTok':'#aaa','X':'#bbb','Email':'#0a84ff',
      'Nextdoor':'#4caf50','YouTube':'#ff3040'
    };
    var PILL_AB={
      'Facebook':'FB','Instagram':'IG','Pinterest':'PIN',
      'TikTok':'TT','X':'X','Email':'EM','Nextdoor':'ND','YouTube':'YT'
    };
    var RED_DATES={'2026-05-27':true,'2026-07-01':true};
    var CAM_START_ISO='2026-05-27', CAM_END_ISO='2026-06-30';
    var CAL_MONTH_NAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];

    function prevMonth(){calViewMonth--;if(calViewMonth<0){calViewMonth=11;calViewYear--;}renderCal(calData);}
    function nextMonth(){calViewMonth++;if(calViewMonth>11){calViewMonth=0;calViewYear++;}renderCal(calData);}
    function goToday(){var n=new Date();calViewYear=n.getFullYear();calViewMonth=n.getMonth();renderCal(calData);}

    function renderCal(data){
      var pc=document.getElementById('panel-cal'); if(!pc) return;
      if(!data||!data.days){
        pc.innerHTML='<div class="loading" style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:40px 0">No calendar data.<br><button onclick="syncCalendar()" style="background:rgba(10,132,255,0.12);border:1px solid #0a84ff;color:#0a84ff;padding:7px 20px;border-radius:7px;font-size:12px;cursor:pointer;margin-top:8px">Sync Posts</button></div>';
        return;
      }
      var days=data.days, allDays=calData?calData.days:{};
      var today=isoDate(new Date()), hasF=hasFilters();

      var firstDay=new Date(calViewYear,calViewMonth,1);
      var daysInMonth=new Date(calViewYear,calViewMonth+1,0).getDate();
      var startDow=firstDay.getDay();

      var nav='<div class="cal-nav">'+
        '<div class="cal-nav-left">'+
          '<button class="cal-nav-btn" onclick="prevMonth()">&#8249;</button>'+
          '<span class="cal-nav-title">'+CAL_MONTH_NAMES[calViewMonth]+' '+calViewYear+'</span>'+
          '<button class="cal-nav-btn" onclick="nextMonth()">&#8250;</button>'+
          '<button class="cal-today-btn" onclick="goToday()">Today</button>'+
        '</div>'+
        '<button class="add-ms-btn" onclick="openMsModal()">+ Milestone</button>'+
      '</div>';

      var dowHtml=DOW.map(function(d){return '<div class="cal-dow-cell">'+d+'</div>';}).join('');
      var cells='';

      // blank pad for first day of week
      for(var b=0;b<startDow;b++) cells+='<div class="cal-day outside"></div>';

      for(var d=1;d<=daysInMonth;d++){
        var cur2=new Date(calViewYear,calViewMonth,d);
        var dk=isoDate(cur2);
        var inC=dk>=CAM_START_ISO&&dk<=CAM_END_ISO;
        var isT=dk===today;
        var isRed=!!RED_DATES[dk];
        var dayObj=days[dk]||null;
        var origDay=allDays[dk]||null;

        var cls='cal-day'+(inC?' in-campaign':'')+(isT?' is-today':'');
        if(dayObj){
          if(dayObj.blocked>0&&dayObj.blocked===dayObj.total) cls+=' has-blocked';
          else if(dayObj.published===dayObj.total&&dayObj.total>0) cls+=' all-published';
        } else if(inC&&origDay&&hasF) cls+=' filtered-empty';

        // Milestone banners
        var msHtml='';
        var msList=MILESTONES_BY_DATE[dk]||[];
        msList.forEach(function(ms){
          msHtml+='<span class="cal-ms-banner" style="background:'+ms.color+'" title="'+ms.title.replace(/"/g,"&quot;")+'">'+ms.title+'</span>';
        });

        // Platform pills
        var pillsHtml='';
        if(dayObj&&dayObj.posts&&dayObj.posts.length){
          var platMap={};
          dayObj.posts.forEach(function(p){
            var pl=p.platform||'';
            if(!platMap[pl]||p.blocked) platMap[pl]=p;
          });
          Object.keys(platMap).sort().forEach(function(pl){
            var p2=platMap[pl];
            var bg2=PILL_BG[pl]||'rgba(100,100,100,0.18)';
            var fg2=p2.blocked?'#ff453a':(PILL_FG[pl]||'#888');
            var ab=PILL_AB[pl]||pl.slice(0,2).toUpperCase();
            pillsHtml+='<span class="cal-pill" style="background:'+bg2+';color:'+fg2+'" title="'+pl+'">'+ab+'</span>';
          });
        }

        var oc2=(inC&&dayObj)||msList.length?' onclick="openSheet(\''+dk+'\')"':'';
        var dateCls='cal-date'+(isRed?' date-red':'');
        cells+='<div class="'+cls+'"'+oc2+'>'+
          '<div class="'+dateCls+'">'+d+'</div>'+
          msHtml+
          '<div class="cal-pills">'+pillsHtml+'</div>'+
        '</div>';
      }

      pc.innerHTML=nav+
        '<div class="cal-dow">'+dowHtml+'</div>'+
        '<div class="cal-grid">'+cells+'</div>'+
        (hasF?'<div style="text-align:center;padding:8px 0;font-size:11px;color:#0a84ff">Filtered · <button onclick="clearFilters()" style="background:none;border:none;color:#ff453a;font-size:11px;cursor:pointer;font-family:inherit">Clear</button></div>':'');
    }
'@

# Use IndexOf/Substring splice for renderCal since quoting is complex
$anchor_start = "    // -- Calendar"
$anchor_end   = "    // -- Day sheet"

# Find via actual characters in file
$idx_start = $t.IndexOf("    // " + [char]0x2500 + [char]0x2500 + " Calendar")
$idx_end   = $t.IndexOf("    // " + [char]0x2500 + [char]0x2500 + " Day sheet")

if ($idx_start -lt 0 -or $idx_end -lt 0) {
  # Fallback: search for simpler patterns
  $idx_start = $t.IndexOf("// -- Calendar")
  if ($idx_start -lt 0) { $idx_start = $t.IndexOf("// ── Calendar") }
  $idx_end   = $t.IndexOf("// -- Day sheet")
  if ($idx_end   -lt 0) { $idx_end   = $t.IndexOf("// ── Day sheet") }
}

if ($idx_start -lt 0 -or $idx_end -lt 0) {
  Write-Error "Calendar section anchors not found! start=$idx_start end=$idx_end"; exit 1
}

# Find the actual line start (go back to newline)
while ($idx_start -gt 0 -and $t[$idx_start-1] -ne "`n") { $idx_start-- }

$t = $t.Substring(0, $idx_start) + $newCal + "`n`n    " + $t.Substring($idx_end)
"[3] renderCal replaced (start=$idx_start)"

# ── 4. Add milestone JS functions before draggable panels section ─────────────
$msJS = @'

    // ── Milestones ────────────────────────────────────────────────────────────────
    function loadMilestones(){
      google.script.run
        .withSuccessHandler(function(r){
          MILESTONES_BY_DATE={};
          if(r&&r.ok&&r.milestones){
            r.milestones.forEach(function(ms){
              if(!ms.date) return;
              if(!MILESTONES_BY_DATE[ms.date]) MILESTONES_BY_DATE[ms.date]=[];
              MILESTONES_BY_DATE[ms.date].push(ms);
            });
          }
          if(activeTab==='cal'||true) renderCal(calData);
        })
        .withFailureHandler(function(){})
        .getMilestones(_activeCampaign);
    }

    var _msCurColor='#FF0000';
    function openMsModal(){
      var msDate=document.getElementById('ms-date');
      if(msDate&&!msDate.value){var n2=new Date();msDate.value=n2.getFullYear()+'-'+String(n2.getMonth()+1).padStart(2,'0')+'-'+String(n2.getDate()).padStart(2,'0');}
      var au=document.getElementById('ms-author'); if(au&&!au.value) au.value=_getAuthor()||'';
      document.getElementById('ms-msg').textContent='';
      document.getElementById('ms-overlay').className='ms-overlay open';
    }
    function closeMsModal(){document.getElementById('ms-overlay').className='ms-overlay';}
    function selectMsColor(el){
      document.querySelectorAll('.ms-swatch').forEach(function(s){s.classList.remove('on');});
      el.classList.add('on');
      _msCurColor=el.getAttribute('data-color');
    }
    function submitMilestone(){
      var title=(document.getElementById('ms-title').value||'').trim();
      var date2=(document.getElementById('ms-date').value||'').trim();
      var author=(document.getElementById('ms-author').value||'').trim();
      var msg2=document.getElementById('ms-msg');
      var btn2=document.getElementById('ms-savebtn');
      if(!title){if(msg2){msg2.style.color='#ff453a';msg2.textContent='Title is required.';}return;}
      if(!date2){if(msg2){msg2.style.color='#ff453a';msg2.textContent='Date is required.';}return;}
      if(btn2) btn2.disabled=true;
      if(msg2){msg2.style.color='#666';msg2.textContent='Saving…';}
      _saveAuthor(author);
      var campId=_activeCampaign==='all'?'EC-2026-001':_activeCampaign;
      google.script.run
        .withSuccessHandler(function(r){
          if(r&&r.ok){
            if(msg2){msg2.style.color='#32d74b';msg2.textContent='Milestone added!';}
            document.getElementById('ms-title').value='';
            setTimeout(function(){closeMsModal();loadMilestones();},900);
          } else {
            if(msg2){msg2.style.color='#ff453a';msg2.textContent='Error: '+((r&&r.error)||'unknown');}
          }
          if(btn2) btn2.disabled=false;
        })
        .withFailureHandler(function(){
          if(msg2){msg2.style.color='#ff453a';msg2.textContent='Connection error.';}
          if(btn2) btn2.disabled=false;
        })
        .addMilestone({title:title,date:date2,color:_msCurColor,created_by:author,campaign_id:campId});
    }

'@

# Find anchor for draggable panels
$idx_drag = $t.IndexOf("    // " + [char]0x2500 + [char]0x2500 + " Draggable")
if ($idx_drag -lt 0) { $idx_drag = $t.IndexOf("// -- Draggable"); }
if ($idx_drag -lt 0) { $idx_drag = $t.IndexOf("// ── Draggable"); }
if ($idx_drag -lt 0) { Write-Error "Draggable anchor not found"; exit 1 }
while ($idx_drag -gt 0 -and $t[$idx_drag-1] -ne "`n") { $idx_drag-- }
$t = $t.Substring(0, $idx_drag) + $msJS + $t.Substring($idx_drag)
"[4] Milestone JS injected"

# ── 5. Patch load() to also call loadMilestones() ────────────────────────────
$oldLoad = "    function load(){`n      document.getElementById('tagline').innerHTML=_activeCampaign+' &nbsp;·&nbsp; Refreshing<span class=`"dot-anim`"></span>';`n      loadDashboard();loadCalendar();`n    }"
$newLoad = "    function load(){`n      document.getElementById('tagline').innerHTML=_activeCampaign+' &nbsp;·&nbsp; Refreshing<span class=`"dot-anim`"></span>';`n      loadDashboard();loadCalendar();loadMilestones();`n    }"
if ($t.IndexOf($oldLoad) -ge 0) {
  $t = $t.Replace($oldLoad, $newLoad)
  "[5] load() patched"
} else {
  Write-Warning "[5] load() exact match not found — trying simpler replace"
  $t = $t.Replace("loadDashboard();loadCalendar();", "loadDashboard();loadCalendar();loadMilestones();")
  "[5] load() patched (simple)"
}

# ── 6. Add loadMilestones() to boot sequence ─────────────────────────────────
$t = $t.Replace("    renderSidebar();`n    loadFilterDefs();`n    load();`n    checkFigmaToken();", "    renderSidebar();`n    loadFilterDefs();`n    load();`n    loadMilestones();`n    checkFigmaToken();")
"[6] boot loadMilestones() added"

# Write
[System.IO.File]::WriteAllText($f, $t, $enc)
"[DONE] cockpit.html written"
