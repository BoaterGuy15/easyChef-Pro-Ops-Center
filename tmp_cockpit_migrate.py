"""
cockpit.html → firebase-deploy/public/cockpit.html
Structural migration: config.js, gasCall() helper, fp-collapsed fix, guard removal.
The 37 google.script.run → gasCall() conversions are done separately via Edit.
"""
import re, os, sys

src_path = os.path.join(os.path.dirname(__file__), 'cockpit.html')
dst_path = os.path.join(os.path.dirname(__file__), 'firebase-deploy', 'public', 'cockpit.html')

with open(src_path, 'r', encoding='utf-8') as f:
    out = f.read()

# 1. Add config.js in <head> before Google Fonts link
out = out.replace(
    '  <link rel="preconnect" href="https://fonts.googleapis.com">',
    '  <script src="/config.js"></script>\n  <link rel="preconnect" href="https://fonts.googleapis.com">',
    1
)

# 2. Remove fp-collapsed from all 6 panel HTML elements (they start hidden via fp-hidden)
out = out.replace('class="filter-panel fp-hidden fp-collapsed"', 'class="filter-panel fp-hidden"')

# 3. Add gasCall() helper — insert before var FP_IDS (an early known variable)
gasCall = '''    // ── Firebase fetch helper (replaces google.script.run) ────────────────────
    function gasCall(payload) {
      return fetch(window.GAS_EXEC_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      }).then(function(r) { return r.json(); })
      .then(function(d) {
        // Flatten d.result.* to top-level for backwards-compat with success handlers
        if (d && d.result && typeof d.result === 'object') {
          Object.keys(d.result).forEach(function(k) { if (d[k] === undefined) d[k] = d.result[k]; });
        }
        return d;
      });
    }
'''
out = out.replace('    var FP_IDS =', gasCall + '    var FP_IDS =', 1)

# 4. Remove GAS-environment guard in loadMilestones
# Old: if(typeof google==='undefined'||!google.script) return;\n      google.script.run.withSuccessHandler...
old_ms_guard = (
    "      if(typeof google==='undefined'||!google.script) return;\n"
    "      google.script.run.withSuccessHandler(function(r){\n"
    "        MILESTONES_BY_DATE={};\n"
    "        if(r&&r.ok&&r.milestones){\n"
    "          r.milestones.forEach(function(ms){\n"
    "            var dk=ms.date;\n"
    "            if(!MILESTONES_BY_DATE[dk]) MILESTONES_BY_DATE[dk]=[];\n"
    "            MILESTONES_BY_DATE[dk].push(ms);\n"
    "          });\n"
    "        }\n"
    "        renderCal(_lastCalSrc||calData);\n"
    "      }).withFailureHandler(function(){}).getCampaignMilestones(_activeCampaign||'all', _activeSheetId);\n"
    "    }"
)
new_ms = (
    "      gasCall({action:'get_milestones', campaign_id:_activeCampaign||'all', sheet_id:_activeSheetId})\n"
    "        .then(function(r){\n"
    "          MILESTONES_BY_DATE={};\n"
    "          if(r&&r.ok&&r.milestones){\n"
    "            r.milestones.forEach(function(ms){\n"
    "              var dk=ms.date;\n"
    "              if(!MILESTONES_BY_DATE[dk]) MILESTONES_BY_DATE[dk]=[];\n"
    "              MILESTONES_BY_DATE[dk].push(ms);\n"
    "            });\n"
    "          }\n"
    "          renderCal(_lastCalSrc||calData);\n"
    "        }).catch(function(){});\n"
    "    }"
)
if old_ms_guard in out:
    out = out.replace(old_ms_guard, new_ms, 1)
    print('OK: loadMilestones guard replaced')
else:
    print('WARN: loadMilestones guard not found — check manually')

# 5. Replace initPanels GAS block (load_panel_positions)
old_init = (
    "      if (typeof google !== 'undefined' && google.script) {\n"
    "        google.script.run\n"
    "          .withSuccessHandler(function(r) {\n"
    "            var sp = null;\n"
    "            try { if (r && r.positions) sp = JSON.parse(r.positions); } catch(e) {}\n"
    "            if (sp && Object.keys(sp).length) { _applyPanelPos(sp); }\n"
    "          })\n"
    "          .withFailureHandler(function() {})\n"
    "          .loadPanelPositions();\n"
    "      }"
)
new_init = (
    "      gasCall({action:'load_panel_positions', sheet_id:_activeSheetId})\n"
    "        .then(function(r) {\n"
    "          var sp = null;\n"
    "          try { if (r && r.positions) sp = JSON.parse(r.positions); } catch(e) {}\n"
    "          if (sp && Object.keys(sp).length) { _applyPanelPos(sp); }\n"
    "        }).catch(function() {});"
)
if old_init in out:
    out = out.replace(old_init, new_init, 1)
    print('OK: initPanels gasCall replaced')
else:
    print('WARN: initPanels block not found — check manually')

# 6. Replace savePanelPositions GAS block (_fpUp drag end)
old_save = (
    "      if (typeof google !== 'undefined' && google.script) {\n"
    "        google.script.run\n"
    "          .withSuccessHandler(function(r){\n"
    "            if (r && r.ok) { _fpToast('Layout saved'); }\n"
    "          })\n"
    "          .withFailureHandler(function(){})\n"
    "          .savePanelPositions(_posJson);\n"
    "      }"
)
new_save = (
    "      gasCall({action:'save_panel_positions', positions_json:_posJson, sheet_id:_activeSheetId})\n"
    "        .then(function(r){ if(r&&r.ok) _fpToast('Layout saved'); })\n"
    "        .catch(function(){});"
)
if old_save in out:
    out = out.replace(old_save, new_save, 1)
    print('OK: savePanelPositions gasCall replaced')
else:
    print('WARN: savePanelPositions block not found — check manually')

# Write output
os.makedirs(os.path.dirname(dst_path), exist_ok=True)
with open(dst_path, 'w', encoding='utf-8') as f:
    f.write(out)

print(f'Written: {dst_path}')
print(f'Size: {len(out):,} chars')

# Count remaining google.script.run calls
remaining = out.count('google.script.run')
print(f'Remaining google.script.run calls: {remaining}')
