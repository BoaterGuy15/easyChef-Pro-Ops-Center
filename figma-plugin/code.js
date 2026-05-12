// ─────────────────────────────────────────────────────────────────────────────
// easyChef Campaign Populator — code.js
// Figma plugin sandbox. All network calls happen in ui.html.
// ─────────────────────────────────────────────────────────────────────────────

figma.showUI(__html__, { width: 440, height: 560, title: 'Campaign Populator' });

// Fallback only — overridden at runtime by CcSettings FIGMA_TEXT_FIELDS_001
const TEXT_FIELDS = [
  'hook_a', 'hook_b', 'caption_opening', 'cta',
  'scene_direction', 'dl_id', 'utm_url',
  'subject_line', 'preview_text', 'opening_hook', 'audio_direction',
  'what_not_to_show',
  'scene_sq_1', 'scene_sq_2', 'scene_sq_3', 'scene_sq_4', 'scene_sq_5', 'scene_sq_6',
  'story_arc_1', 'story_arc_2', 'story_arc_3', 'story_arc_4',
  'header_image_direction'
];

function normKey(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// ── Font helpers ──────────────────────────────────────────────────────────────
async function loadAllFontsInNode(node) {
  const textNodes = node.findAll(n => n.type === 'TEXT');
  const fonts = new Set();
  for (const tn of textNodes) {
    if (tn.fontName !== figma.mixed) {
      fonts.add(JSON.stringify(tn.fontName));
    } else {
      for (let i = 0; i < tn.characters.length; i++) {
        const fn = tn.getRangeFontName(i, i + 1);
        if (fn !== figma.mixed) fonts.add(JSON.stringify(fn));
      }
    }
  }
  await Promise.all([...fonts].map(f => figma.loadFontAsync(JSON.parse(f))));
}

// ── Text population ───────────────────────────────────────────────────────────
function populateTextLayers(frame, asset, fields) {
  const FIELDS = Array.isArray(fields) && fields.length ? fields : TEXT_FIELDS;
  const nodes = frame.findAll(n => n.type === 'TEXT');
  let count = 0;
  for (const tn of nodes) {
    const key = normKey(tn.name);
    const val = (FIELDS.includes(key) && asset[key]) ? asset[key]
              : (FIELDS.includes(tn.name) && asset[tn.name]) ? asset[tn.name]
              : null;
    if (val && String(val).trim()) {
      try { tn.characters = String(val).trim(); count++; } catch (_) {}
    }
  }
  return count;
}

// ── Template finder ───────────────────────────────────────────────────────────
function findTemplate(platform) {
  const name = 'TEMPLATE/' + platform;
  return figma.currentPage.findOne(n =>
    n.name.toUpperCase() === name.toUpperCase() &&
    (n.type === 'FRAME' || n.type === 'COMPONENT' || n.type === 'COMPONENT_SET')
  ) || null;
}

function cloneTemplate(t) {
  if (t.type === 'COMPONENT')     return t.createInstance();
  if (t.type === 'COMPONENT_SET') return t.defaultVariant.createInstance();
  return t.clone();
}

// ── Layout ────────────────────────────────────────────────────────────────────
function rightEdge(page) {
  let x = 0;
  page.children.forEach(n => { const r = n.x + (n.width || 0); if (r > x) x = r; });
  return x;
}

// ── Populate run ──────────────────────────────────────────────────────────────
async function runPopulate(assets, platform, campaignId, textFields) {
  const page    = figma.currentPage;
  const fileKey = figma.fileKey || '';
  const results = [];
  const total   = assets.length;
  let   done    = 0;

  const COLS = 4, GAP = 120;
  let startX = rightEdge(page) + GAP;
  let curX = startX, curY = 0, rowH = 0, col = 0;

  const tplCache = {};

  for (const asset of assets) {
    const plat = String(asset.platform || '').trim();
    if (!tplCache.hasOwnProperty(plat)) tplCache[plat] = findTemplate(plat);
    const tpl = tplCache[plat];

    if (!tpl) {
      done++;
      results.push({ asset_id: asset.asset_id, status: 'skipped', error: 'No template: TEMPLATE/' + plat });
      figma.ui.postMessage({ type: 'progress', processed: done, total, asset_id: asset.asset_id, status: 'skipped', message: 'No template: TEMPLATE/' + plat });
      continue;
    }

    try {
      const frame = cloneTemplate(tpl);
      page.appendChild(frame);
      frame.x = curX; frame.y = curY;

      if ((frame.height || 0) > rowH) rowH = frame.height;
      col++;
      if (col >= COLS) { curX = startX; curY += rowH + GAP; rowH = 0; col = 0; }
      else              { curX += (frame.width || 0) + GAP; }

      frame.name = asset.asset_id + ' · ' + plat + ' · Day ' + asset.day + ' · ' + (asset.funnel_stage || '');

      await loadAllFontsInNode(frame);
      const layers = populateTextLayers(frame, asset, textFields);

      frame.setPluginData('asset_id',       asset.asset_id);
      frame.setPluginData('campaign_id',     asset.campaign_id || campaignId || '');
      frame.setPluginData('dl_id',           asset.dl_id || '');
      frame.setPluginData('platform',        plat);
      frame.setPluginData('figma_frame_id',  frame.id);

      done++;
      results.push({ asset_id: asset.asset_id, figma_frame_id: frame.id, status: 'in_figma', layers });
      figma.ui.postMessage({ type: 'progress', processed: done, total, asset_id: asset.asset_id, frame_id: frame.id, layers, status: 'ok' });

    } catch (err) {
      done++;
      results.push({ asset_id: asset.asset_id, status: 'error', error: err.message });
      figma.ui.postMessage({ type: 'progress', processed: done, total, asset_id: asset.asset_id, status: 'error', message: err.message });
    }
  }

  figma.ui.postMessage({
    type: 'done', results,
    figma_file_id: fileKey,
    figma_page:    page.name,
    populated:     results.filter(r => r.status === 'in_figma').length,
    skipped:       results.filter(r => r.status === 'skipped').length,
    errors:        results.filter(r => r.status === 'error').length
  });
}

// ── Template creator ──────────────────────────────────────────────────────────
async function createInstagramTemplate() {
  const page = figma.currentPage;

  if (page.findOne(n => n.name === 'TEMPLATE/Instagram')) {
    figma.ui.postMessage({ type: 'setup_error', message: 'TEMPLATE/Instagram already exists on this page.' });
    return;
  }

  // Load fonts
  const fonts = [
    { family: 'Inter', style: 'Regular' },
    { family: 'Inter', style: 'Medium'  },
    { family: 'Inter', style: 'Bold'    }
  ];
  await Promise.all(fonts.map(f => figma.loadFontAsync(f)));

  const W = 1080, H = 1080;
  const BLACK  = { r: 0.05, g: 0.05, b: 0.05 };
  const DARK   = { r: 0.09, g: 0.09, b: 0.09 };
  const WHITE  = { r: 1,    g: 1,    b: 1    };
  const LGRAY  = { r: 0.88, g: 0.88, b: 0.88 };
  const MGRAY  = { r: 0.55, g: 0.55, b: 0.55 };
  const DGRAY  = { r: 0.35, g: 0.35, b: 0.35 };
  const RED    = { r: 0.92, g: 0.12, b: 0.12 };

  function solid(c) { return [{ type: 'SOLID', color: c }]; }
  function text(name, chars, fontStyle, size, color, x, y, w, h) {
    const t = figma.createText();
    t.name            = name;
    t.fontName        = { family: 'Inter', style: fontStyle };
    t.fontSize        = size;
    t.fills           = solid(color);
    t.characters      = chars;
    t.textAutoResize  = 'HEIGHT';
    t.resize(w, h);
    t.x = x; t.y = y;
    return t;
  }

  // ── Root frame ──────────────────────────────────────────────────────────────
  const frame = figma.createFrame();
  frame.name   = 'TEMPLATE/Instagram';
  frame.resize(W, H);
  frame.fills  = solid(BLACK);
  frame.clipsContent = true;

  // ── Image placeholder (full width, top 700px) ───────────────────────────────
  const imgBox = figma.createRectangle();
  imgBox.name   = 'Image/Placeholder';
  imgBox.resize(W, 700);
  imgBox.x = 0; imgBox.y = 0;
  imgBox.fills   = solid({ r: 0.14, g: 0.14, b: 0.14 });
  imgBox.strokes = solid({ r: 0.25, g: 0.25, b: 0.25 });
  imgBox.strokeWeight = 2;
  imgBox.dashPattern = [12, 8];
  frame.appendChild(imgBox);

  // Placeholder label (centered, faint)
  const imgLabel = figma.createText();
  imgLabel.name = '_Image/Label';
  imgLabel.fontName = { family: 'Inter', style: 'Medium' };
  imgLabel.fontSize = 22;
  imgLabel.fills = solid(MGRAY);
  imgLabel.characters = 'IMAGE PLACEHOLDER  ·  1080 × 700';
  imgLabel.textAlignHorizontal = 'CENTER';
  imgLabel.textAutoResize = 'HEIGHT';
  imgLabel.resize(900, 40);
  imgLabel.x = 90; imgLabel.y = 320;
  frame.appendChild(imgLabel);

  // ── hook_a — large hook overlaid on image ───────────────────────────────────
  const hookA = text('hook_a', 'hook_a', 'Bold', 54, WHITE, 56, 490, 968, 120);
  frame.appendChild(hookA);

  // ── hook_b — supporting hook below ──────────────────────────────────────────
  const hookB = text('hook_b', 'hook_b', 'Regular', 34, LGRAY, 56, 618, 968, 72);
  frame.appendChild(hookB);

  // ── Red accent bar ───────────────────────────────────────────────────────────
  const bar = figma.createRectangle();
  bar.name   = 'Accent/Bar';
  bar.resize(6, 360);
  bar.x = 0; bar.y = 700;
  bar.fills = solid(RED);
  frame.appendChild(bar);

  // ── Content strip (700–1080) ─────────────────────────────────────────────────
  const strip = figma.createFrame();
  strip.name   = 'Content/Strip';
  strip.resize(W, 380);
  strip.x = 0; strip.y = 700;
  strip.fills = solid(DARK);
  strip.clipsContent = false;
  frame.appendChild(strip);

  // caption_opening
  const cap = text('caption_opening', 'caption_opening', 'Regular', 30, LGRAY, 56, 28, 968, 68);
  strip.appendChild(cap);

  // cta
  const ctaNode = text('cta', 'cta', 'Bold', 32, RED, 56, 120, 968, 68);
  strip.appendChild(ctaNode);

  // dl_id (small reference)
  const dlNode = text('dl_id', 'dl_id', 'Regular', 18, MGRAY, 56, 208, 600, 36);
  strip.appendChild(dlNode);

  // scene_direction (reference layer — designer can hide before export)
  const sceneNode = text('scene_direction', 'scene_direction', 'Regular', 16, DGRAY, 56, 260, 968, 50);
  strip.appendChild(sceneNode);

  // ── Logo placeholder ─────────────────────────────────────────────────────────
  const logoBox = figma.createRectangle();
  logoBox.name   = 'Logo/Placeholder';
  logoBox.resize(120, 40);
  logoBox.x = W - 176; logoBox.y = 336;
  logoBox.fills   = solid({ r: 0.22, g: 0.22, b: 0.22 });
  logoBox.cornerRadius = 4;
  frame.appendChild(logoBox);

  const logoLabel = figma.createText();
  logoLabel.name = '_Logo/Label';
  logoLabel.fontName = { family: 'Inter', style: 'Medium' };
  logoLabel.fontSize = 14;
  logoLabel.fills = solid(MGRAY);
  logoLabel.characters = 'LOGO';
  logoLabel.textAlignHorizontal = 'CENTER';
  logoLabel.textAutoResize = 'HEIGHT';
  logoLabel.resize(120, 24);
  logoLabel.x = W - 176; logoLabel.y = 348;
  frame.appendChild(logoLabel);

  // ── Place on page ─────────────────────────────────────────────────────────────
  page.appendChild(frame);
  frame.x = 0; frame.y = 0;
  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);

  figma.ui.postMessage({ type: 'setup_done', name: 'TEMPLATE/Instagram' });
}

// ── Message router ────────────────────────────────────────────────────────────
figma.ui.onmessage = async function(msg) {
  switch (msg.type) {
    case 'populate': await runPopulate(msg.assets, msg.platform, msg.campaign_id, msg.text_fields); break;
    case 'create_template': await createInstagramTemplate();             break;
    case 'cancel':          figma.closePlugin();                         break;
  }
};
