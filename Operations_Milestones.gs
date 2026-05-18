// ── Milestone management ──────────────────────────────────────────────────────

function _getCampaignMilestoneSheet(create) {
  var ss = _getCampaignSpreadsheet();
  var sheet = ss.getSheetByName('Milestones');
  if (!sheet && create) {
    sheet = ss.insertSheet('Milestones');
    var headers = _CC_HDR.Milestones;
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function seedCampaignMilestones() {
  try {
    var sheet = _getCampaignMilestoneSheet(true);
    var headers = _CC_HDR.Milestones;
    var H = {}; headers.forEach(function(h, i) { H[h] = i; });
    var now = new Date().toISOString();

    var seeds = [
      { id:'ms-001', campaign_id:'EC-2026-001', title:'Engineering Deadline', date:'2026-05-22', type:'deadline', color:'#ff9500' },
      { id:'ms-002', campaign_id:'EC-2026-001', title:'Campaign Start — Pre-Launch', date:'2026-05-27', type:'launch', color:'#FF0000' },
      { id:'ms-003', campaign_id:'EC-2026-001', title:'Campaign End', date:'2026-06-30', type:'end', color:'#ff453a' },
      { id:'ms-004', campaign_id:'EC-2026-001', title:'Launch Day', date:'2026-07-01', type:'launch', color:'#FF0000' }
    ];

    var existing = {};
    if (sheet.getLastRow() >= 2) {
      var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
      rows.forEach(function(r) { if (r[0]) existing[String(r[0])] = true; });
    }

    var newRows = [];
    seeds.forEach(function(m) {
      if (existing[m.id]) return;
      var row = new Array(headers.length).fill('');
      row[H.id]          = m.id;
      row[H.campaign_id] = m.campaign_id;
      row[H.title]       = m.title;
      row[H.date]        = m.date;
      row[H.type]        = m.type;
      row[H.color]       = m.color;
      row[H.created_at]  = now;
      row[H.created_by]  = 'system';
      newRows.push(row);
    });

    if (newRows.length) {
      var start = sheet.getLastRow() + 1;
      sheet.getRange(start, 1, newRows.length, headers.length).setValues(newRows);
    }
    Logger.log('[seedMilestones] seeded:' + newRows.length + ' skipped:' + (seeds.length - newRows.length));
    return { ok: true, seeded: newRows.length, skipped: seeds.length - newRows.length };
  } catch(e) {
    Logger.log('[seedMilestones] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

function getCampaignMilestones(campaignId, sheetId) {
  _REQUEST_SHEET_ID = sheetId || null;
  try {
    var sheet = _getCampaignMilestoneSheet(false);
    if (!sheet || sheet.getLastRow() < 2) return { ok: true, milestones: [] };
    var headers = _CC_HDR.Milestones;
    var H = {}; headers.forEach(function(h, i) { H[h] = i; });
    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
    var milestones = [];
    rows.forEach(function(r) {
      if (!r[H.id]) return;
      var cid = String(r[H.campaign_id] || '');
      if (campaignId && campaignId !== 'all' && cid && cid !== campaignId) return;
      var rawDate = r[H.date];
      var dateStr = '';
      if (rawDate instanceof Date) {
        dateStr = Utilities.formatDate(rawDate, 'UTC', 'yyyy-MM-dd');
      } else {
        dateStr = String(rawDate || '');
      }
      milestones.push({
        id:          String(r[H.id]          || ''),
        campaign_id: cid,
        title:       String(r[H.title]       || ''),
        date:        dateStr,
        type:        String(r[H.type]        || ''),
        color:       String(r[H.color]       || '#0a84ff'),
        created_by:  String(r[H.created_by]  || '')
      });
    });
    return { ok: true, milestones: milestones };
  } catch(e) {
    Logger.log('[getMilestones] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}

function addCampaignMilestone(params) {
  try {
    if (!params || !params.title || !params.date) return { ok: false, error: 'title and date required' };
    var sheet   = _getCampaignMilestoneSheet(true);
    var headers = _CC_HDR.Milestones;
    var H = {}; headers.forEach(function(h, i) { H[h] = i; });
    var now = new Date().toISOString();
    var id  = 'ms-' + now.replace(/[^0-9]/g, '').slice(0, 14);
    var row = new Array(headers.length).fill('');
    row[H.id]          = id;
    row[H.campaign_id] = params.campaign_id || 'EC-2026-001';
    row[H.title]       = params.title;
    row[H.date]        = params.date;
    row[H.type]        = params.type   || 'custom';
    row[H.color]       = params.color  || '#0a84ff';
    row[H.created_at]  = now;
    row[H.created_by]  = params.created_by || '';
    sheet.appendRow(row);
    Logger.log('[addMilestone] id:' + id + ' title:' + params.title + ' date:' + params.date);
    return { ok: true, id: id };
  } catch(e) {
    Logger.log('[addMilestone] ERROR: ' + e.message);
    return { ok: false, error: e.message };
  }
}
