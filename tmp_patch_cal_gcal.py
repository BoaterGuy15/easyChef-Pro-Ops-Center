import sys, os

base = r'C:\Users\Trader\easyChef-Pro-Ops-Center'

with open(os.path.join(base, 'cockpit.html'), encoding='utf-8') as f:
    html = f.read()

# ── PATCH A: Replace calendar CSS (everything between /* Calendar */ and /* Milestone modal */) ──
START_A = '    /* Calendar */'
END_A   = '    /* Milestone modal */'

ia = html.find(START_A)
ib = html.find(END_A)
if ia < 0 or ib < 0 or ib <= ia:
    print(f'ERROR Patch A: markers not found (ia={ia} ib={ib})')
    sys.exit(1)

new_cal_css = '''    /* Calendar — Google-style grid */
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
    .cal-dow { display:grid; grid-template-columns:repeat(7,1fr); border-top:1px solid #2a2a2e; border-left:1px solid #2a2a2e; margin-bottom:0; }
    .cal-dow-cell { border-right:1px solid #2a2a2e; border-bottom:1px solid #2a2a2e; text-align:center; font-size:9px; color:#555; font-weight:600; padding:5px 4px; letter-spacing:0.3px; }
    .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); border-left:1px solid #2a2a2e; }
    .cal-day { background:#0c0c0e; border-right:1px solid #1a1a1e; border-bottom:1px solid #1a1a1e; min-height:90px; padding:5px 5px 4px; display:flex; flex-direction:column; cursor:default; user-select:none; box-sizing:border-box; }
    .cal-day.in-campaign { background:#111116; border-right-color:#2a2a2e; border-bottom-color:#2a2a2e; cursor:pointer; }
    .cal-day.in-campaign:hover { background:#1a1a20; }
    .cal-day.is-today { background:#0b1828 !important; }
    .cal-day.outside { background:#080809; pointer-events:none; }
    .cal-day.has-blocked { background:#160c0c !important; }
    .cal-day.all-published { background:#091410 !important; }
    .cal-day.filtered-empty { opacity:0.28; }
    .cal-date { font-size:10px; font-weight:600; color:#3a3a3a; line-height:1; margin-bottom:4px; flex-shrink:0; display:flex; align-items:center; }
    .cal-day.in-campaign .cal-date { color:#666; }
    .cal-day.outside .cal-date { color:#2a2a2a; }
    .cal-date-num { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; font-size:11px; }
    .cal-day.is-today .cal-date-num { background:#0a84ff; color:#fff !important; font-weight:700; }
    .cal-date.date-red .cal-date-num { color:#FF0000 !important; font-weight:800 !important; }
    .cal-events { display:flex; flex-direction:column; gap:2px; flex:1; overflow:hidden; }
    .cal-event-bar { display:block; font-size:9px; font-weight:600; padding:1px 5px 1px 6px; border-radius:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:15px; border-left:3px solid transparent; }
    .cal-ms-banner { display:block; font-size:9px; font-weight:700; padding:1px 5px; border-radius:3px; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:15px; }
    '''

html = html[:ia] + new_cal_css + html[ib:]
print('[OK] Patch A: Calendar CSS replaced with Google-style')

# ── PATCH B: Replace renderCal cell rendering ────────────────────────────────
# Find the old block by unique markers
START_B = "      var dowHtml=DOW.map(function(d){return '<div class=\"cal-dow-cell\">'+d+'</div>';}).join('');"
END_B   = "    // ── Day sheet"

ib2 = html.find(START_B)
ie2 = html.find(END_B)
if ib2 < 0 or ie2 < 0 or ie2 <= ib2:
    print(f'ERROR Patch B: markers not found (ib2={ib2} ie2={ie2})')
    sys.exit(1)

new_cells = """      var dowHtml=DOW.map(function(d){return '<div class="cal-dow-cell">'+d+'</div>';}).join('');
      var cells='';
      for(var b=0;b<startDow;b++) cells+='<div class="cal-day outside"><div class="cal-date"><span class="cal-date-num"></span></div></div>';

      for(var d=1;d<=daysInMonth;d++){
        var curD=new Date(calViewYear,calViewMonth,d);
        var dk=isoDate(curD);
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

        var msList=MILESTONES_BY_DATE[dk]||[];
        var eventsHtml='';
        msList.forEach(function(ms){
          eventsHtml+='<span class="cal-ms-banner" style="background:'+ms.color+'">'+ms.title+'</span>';
        });

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
            var bc2=p2.blocked?'#ff453a':(PILL_FG[pl]||'#555');
            eventsHtml+='<span class="cal-event-bar" style="background:'+bg2+';color:'+fg2+';border-left-color:'+bc2+'">'+pl+'</span>';
          });
        }

        var oc2=(inC&&dayObj)||msList.length?' onclick="openSheet(\\''+dk+'\\')\"':'';
        var dateCls='cal-date'+(isRed?' date-red':'');
        cells+='<div class="'+cls+'"'+oc2+'>'+
          '<div class="'+dateCls+'"><span class="cal-date-num">'+d+'</span></div>'+
          '<div class="cal-events">'+eventsHtml+'</div>'+
        '</div>';
      }

      pc.innerHTML=nav+
        '<div class="cal-dow">'+dowHtml+'</div>'+
        '<div class="cal-grid">'+cells+'</div>'+
        (hasF?'<div style="text-align:center;padding:8px 0;font-size:11px;color:#0a84ff">Filtered &nbsp;\xb7&nbsp; <button onclick="clearFilters()" style="background:none;border:none;color:#ff453a;font-size:11px;cursor:pointer;font-family:inherit">Clear</button></div>':'');
    }

    """

html = html[:ib2] + new_cells + html[ie2:]
print('[OK] Patch B: renderCal cells -> Google Calendar style')

with open(os.path.join(base, 'cockpit.html'), 'w', encoding='utf-8') as f:
    f.write(html)
print(f'[DONE] cockpit.html written ({len(html)} chars)')
