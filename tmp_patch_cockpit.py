import sys, os

base = r'C:\Users\Trader\easyChef-Pro-Ops-Center'

def rf(name):
    with open(os.path.join(base, name), encoding='utf-8') as f:
        return f.read()

html = rf('cockpit.html')
cal_css  = rf('tmp_cal_css.txt')
cal_modal= rf('tmp_cal_modal.txt')
cal_js   = rf('tmp_cal_js.txt')
ms_js    = rf('tmp_ms_js.txt')

orig_len = len(html)
errors = []

# ── 1. Replace old Calendar CSS block ────────────────────────────────────────
old1 = (
    '    /* Calendar */\n'
    '    .cal-month-label { font-size: 13px; font-weight: 700; margin-bottom: 8px; }\n'
    '    .cal-dow { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; margin-bottom: 3px; }\n'
    '    .cal-dow-cell { text-align: center; font-size: 9px; color: #555; font-weight: 600; padding: 2px 0; }\n'
    '    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }\n'
    '    .cal-day { background: #0e0e10; border: 1px solid #1a1a1e; border-radius: 7px; padding: 4px; aspect-ratio: 1; cursor: pointer; user-select: none; display: flex; flex-direction: column; }\n'
    '    .cal-day.in-campaign { background: #161618; border-color: #2a2a2e; }\n'
    '    .cal-day.is-today { border-color: #0a84ff !important; }\n'
    '    .cal-day.outside { opacity: 0.2; cursor: default; pointer-events: none; }\n'
    '    .cal-day.has-blocked.in-campaign { background: #180e0e; }\n'
    '    .cal-day.all-published.in-campaign { background: #0a180e; }\n'
    '    .cal-day.filtered-empty { opacity: 0.28; }\n'
    '    .cal-date { font-size: 10px; font-weight: 600; color: #555; line-height: 1; margin-bottom: 3px; flex-shrink: 0; }\n'
    '    .cal-day.in-campaign .cal-date { color: #ccc; }\n'
    '    .cal-day.is-today .cal-date { color: #0a84ff; }\n'
    '    .cal-dots { display: flex; flex-wrap: wrap; gap: 2px; flex: 1; align-content: flex-start; }\n'
    '    .cal-dot  { width: 6px; height: 6px; border-radius: 50%; }\n'
    '    .cal-badge { font-size: 9px; font-weight: 600; color: #888; flex-shrink: 0; }\n'
    '    .cal-day.has-blocked .cal-badge { color: #ff453a; }\n'
    '    .cal-day.all-published .cal-badge { color: #32d74b; }'
)
new1 = '    /* Calendar */\n' + cal_css.rstrip()
if old1 not in html:
    errors.append('PATCH 1 (CSS) anchor not found')
else:
    html = html.replace(old1, new1, 1)
    print('[OK] Patch 1: Calendar CSS replaced')

# ── 2. Insert milestone modal HTML before sheet-overlay div ──────────────────
old2 = '  <div class="sheet-overlay" id="sheet-overlay" onclick="closeSheet()"></div>'
new2 = cal_modal.rstrip() + '\n\n  <div class="sheet-overlay" id="sheet-overlay" onclick="closeSheet()"></div>'
if old2 not in html:
    errors.append('PATCH 2 (modal HTML) anchor not found')
else:
    html = html.replace(old2, new2, 1)
    print('[OK] Patch 2: Milestone modal HTML inserted')

# ── 3. Replace old renderCal JS + isoDate with Calendar 2.0 ──────────────────
old3 = (
    '    // ── Calendar ──────────────────────────────────────────────────────────────\n'
    "    function isoDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}\n"
    '\n'
    '    function renderCal(data){\n'
    "      if(!data||!data.days){\n"
    "        var emptyDiv=document.createElement('div');\n"
    "        emptyDiv.className='loading';\n"
    "        emptyDiv.style.cssText='display:flex;flex-direction:column;align-items:center;gap:14px;padding:40px 0';\n"
    "        emptyDiv.appendChild(document.createTextNode('No calendar data. Click Sync to pull posts in.'));\n"
    "        var syncBtn=document.createElement('button');\n"
    "        syncBtn.textContent='Sync Posts to Calendar';\n"
    "        syncBtn.style.cssText='background:rgba(10,132,255,0.12);border:1px solid #0a84ff;color:#0a84ff;padding:7px 20px;border-radius:7px;font-size:12px;cursor:pointer';\n"
    '        syncBtn.onclick=syncCalendar;\n'
    "        emptyDiv.appendChild(syncBtn);\n"
    "        var pc=document.getElementById('panel-cal');\n"
    "        if(pc){pc.innerHTML='';pc.appendChild(emptyDiv);}\n"
    '        return;\n'
    '      }\n'
    "      var days=data.days,today=isoDate(new Date()),allDays=calData?calData.days:{};\n"
    "      var dowHtml=DOW.map(function(d){return '<div class=\"cal-dow-cell\">'+d+'</div>';}).join('');\n"
    "      var cells='',cur=new Date(2026,4,24),end=new Date(2026,6,4);\n"
    '      while(cur<=end){\n'
    "        var dk=isoDate(cur),dn=cur.getDate(),inC=cur>=CAM_START&&cur<=CAM_END,isT=dk===today;\n"
    "        var dayObj=days[dk]||null,origDay=allDays[dk]||null;\n"
    "        var cls='cal-day'+(inC?' in-campaign':' outside')+(isT?' is-today':'');\n"
    "        if(dayObj){if(dayObj.blocked===dayObj.total&&dayObj.total>0)cls+=' has-blocked';if(dayObj.published===dayObj.total&&dayObj.total>0)cls+=' all-published';}\n"
    "        else if(inC&&origDay&&hasFilters())cls+=' filtered-empty';\n"
    "        var dateLbl=dn===1?MONTHS[cur.getMonth()].toUpperCase()+' 1':String(dn);\n"
    "        var dotsHtml='<div class=\"cal-dots\"></div>',badgeHtml='';\n"
    '        if(dayObj&&dayObj.total>0){\n'
    '          var ps={};\n'
    "          dayObj.posts.forEach(function(p){var c=p.blocked?'#ff453a':(STATUS_DOT_COLOR[p.status]||'#3a3a3a');if(!ps[p.platform]||p.blocked)ps[p.platform]=c;});\n"
    "          dotsHtml='<div class=\"cal-dots\">'+Object.keys(ps).slice(0,6).map(function(pl){return '<div class=\"cal-dot\" style=\"background:'+ps[pl]+'\"></div>';}).join('')+'</div>';\n"
    "          badgeHtml='<div class=\"cal-badge\">'+dayObj.total+'</div>';\n"
    '        }\n'
    "        var oc=inC&&dayObj?' onclick=\"openSheet(\\''+dk+'\\')\"':'';\n"
    "        cells+='<div class=\"'+cls+'\"'+oc+'><div class=\"cal-date\">'+dateLbl+'</div>'+dotsHtml+badgeHtml+'</div>';\n"
    '        cur.setDate(cur.getDate()+1);\n'
    '      }\n'
    "      document.getElementById('panel-cal').innerHTML=\n"
    "        '<div class=\"cal-month-label\">May 27 – Jun 30, 2026'+(hasFilters()?' <span style=\"color:#0a84ff;font-size:11px;font-weight:400\">(filtered)</span>':'')+'</div>'+\n"
    "        '<div class=\"cal-dow\">'+dowHtml+'</div>'+\n"
    "        '<div class=\"cal-grid\">'+cells+'</div>';\n"
    '    }'
)
new3 = '    // ── Calendar 2.0 ──────────────────────────────────────────────────────────\n' + cal_js.rstrip()
if old3 not in html:
    errors.append('PATCH 3 (renderCal JS) anchor not found')
else:
    html = html.replace(old3, new3, 1)
    print('[OK] Patch 3: renderCal JS replaced with Calendar 2.0')

# ── 4. Insert milestone JS before Draggable filter panels ────────────────────
old4 = '    // ── Draggable filter panels'
new4 = ms_js.rstrip() + '\n\n    // ── Draggable filter panels'
if old4 not in html:
    errors.append('PATCH 4 (milestone JS) anchor not found')
else:
    html = html.replace(old4, new4, 1)
    print('[OK] Patch 4: Milestone JS inserted')

# ── 5. Add loadMilestones() to load() function ───────────────────────────────
old5 = '      loadDashboard();loadCalendar();'
new5 = '      loadDashboard();loadCalendar();loadMilestones();'
if old5 not in html:
    errors.append('PATCH 5 (load fn) anchor not found')
else:
    html = html.replace(old5, new5, 1)
    print('[OK] Patch 5: loadMilestones() added to load()')

if errors:
    print('\nERRORS:')
    for e in errors: print(' ', e)
    sys.exit(1)

with open(os.path.join(base, 'cockpit.html'), 'w', encoding='utf-8') as f:
    f.write(html)
print(f'\n[DONE] cockpit.html written ({len(html)} chars, was {orig_len})')
