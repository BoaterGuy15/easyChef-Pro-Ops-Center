#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// cockpit-mcp-server.js
// easyChef Pro Campaign Cockpit — MCP Server
//
// Wraps the Campaign Center Apps Script endpoints as MCP tools so Claude
// can operate the cockpit conversationally.
//
// Usage:
//   node cockpit-mcp-server.js
//
// Connect via Claude Desktop / Claude Code MCP settings:
//   see cockpit-mcp-server-config.json
// ─────────────────────────────────────────────────────────────────────────────

const { McpServer }          = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z }                  = require('zod');
const https                  = require('https');
const http                   = require('http');

// ── Config ────────────────────────────────────────────────────────────────────

const COCKPIT_URL = process.env.COCKPIT_URL ||
  'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec';

const SERVER_NAME    = 'easychef-cockpit';
const SERVER_VERSION = '1.0.0';

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('JSON parse failed: ' + body.slice(0, 300))); }
      });
    }).on('error', reject);
  });
}

function gasGet(params) {
  return new Promise((resolve, reject) => {
    const url = new URL(COCKPIT_URL);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    const lib = url.protocol === 'https:' ? https : http;

    lib.get(url.toString(), (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const loc = res.headers.location;
        if (!loc) return reject(new Error('Redirect with no location'));
        return fetchUrl(loc).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('JSON parse failed: ' + body.slice(0, 300))); }
      });
    }).on('error', reject);
  });
}

function gasPost(payload) {
  return new Promise((resolve, reject) => {
    const url  = new URL(COCKPIT_URL);
    const data = JSON.stringify(payload);
    const lib  = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method:   'POST',
      headers:  {
        'Content-Type':   'text/plain',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = lib.request(options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const loc = res.headers.location;
        if (!loc) return reject(new Error('Redirect with no location'));
        return fetchUrl(loc).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('JSON parse failed: ' + body.slice(0, 300))); }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function toolResult(data) {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return { content: [{ type: 'text', text }] };
}

function toolError(err) {
  const msg = err instanceof Error ? err.message : String(err);
  return { content: [{ type: 'text', text: '❌ Error: ' + msg }], isError: true };
}

function log(tool, params, result) {
  const ok = result && (result.ok !== undefined ? result.ok : true);
  process.stderr.write(
    `[cockpit-mcp] ${new Date().toISOString()} ${tool} ok=${ok} ` +
    `params=${JSON.stringify(params)}\n`
  );
}

// ── MCP Server ────────────────────────────────────────────────────────────────

const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

// ════════════════════════════════════════════════════════════════════════════
// SYSTEM
// ════════════════════════════════════════════════════════════════════════════

server.tool(
  'cockpit_ping',
  'Ping the Campaign Cockpit to confirm the Apps Script endpoint is alive and check the current deploy version.',
  {},
  async () => {
    try {
      const result = await gasPost({ action: 'ping' });
      log('cockpit_ping', {}, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'get_icp_profiles',
  'Fetch all ICP profiles from the Campaign Center sheet.',
  {},
  async () => {
    try {
      const result = await gasGet({ action: 'icp_profiles_read' });
      log('get_icp_profiles', {}, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'get_approved_claims',
  'Fetch all approved marketing claims. Always check this before generating copy to confirm which claims are ACTIVE.',
  {},
  async () => {
    try {
      const result = await gasGet({ action: 'approved_claims_read' });
      log('get_approved_claims', {}, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

// ════════════════════════════════════════════════════════════════════════════
// MASTER POSITIONING
// ════════════════════════════════════════════════════════════════════════════

server.tool(
  'get_master_positioning',
  'Fetch a MasterPositioning record by positioning_id, or all records for a campaign_id.',
  {
    positioning_id: z.string().optional().describe('Specific positioning record ID e.g. MP-EC-2026-001-1234567890'),
    campaign_id:    z.string().optional().describe('Campaign ID to fetch all positionings e.g. EC-2026-001')
  },
  async ({ positioning_id, campaign_id }) => {
    try {
      if (!positioning_id && !campaign_id) return toolError('Provide positioning_id or campaign_id');
      const params = { action: 'master_positioning_read' };
      if (positioning_id) params.positioning_id = positioning_id;
      else                params.campaign_id    = campaign_id;
      const result = await gasGet(params);
      log('get_master_positioning', { positioning_id, campaign_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'generate_master_positioning',
  'Call Claude to generate a MasterPositioning draft for a campaign. Saves to sheet and returns the full positioning object with positioning_id.',
  {
    campaign_id: z.string().describe('Campaign ID e.g. EC-2026-001'),
    icp_code:    z.string().describe('ICP code e.g. super_mom, budget_family, health_optimizer'),
    theme_slug:  z.string().optional().describe('Theme slug from ThemeLibrary e.g. taco-tuesday'),
    theme_name:  z.string().optional().describe('Human-readable theme name')
  },
  async ({ campaign_id, icp_code, theme_slug, theme_name }) => {
    try {
      const result = await gasPost({
        action:     'master_positioning_generate',
        campaign_id, icp_code,
        theme_slug:  theme_slug  || '',
        theme_name:  theme_name  || ''
      });
      log('generate_master_positioning', { campaign_id, icp_code, theme_slug }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'save_master_positioning',
  'Save (create or update) a MasterPositioning record to the sheet.',
  {
    positioning: z.record(z.any()).describe('Full positioning object. Must include campaign_id. positioning_id is auto-generated if absent.')
  },
  async ({ positioning }) => {
    try {
      const result = await gasPost({ action: 'master_positioning_save', positioning });
      log('save_master_positioning', { campaign_id: positioning.campaign_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'lock_master_positioning',
  'Lock a MasterPositioning record — sets status=APPROVED and locked=TRUE. Automatically seeds 5 stage gates if campaign_id is provided.',
  {
    positioning_id: z.string().describe('Positioning ID to lock'),
    campaign_id:    z.string().optional().describe('Campaign ID — seeds stage gates after locking when provided')
  },
  async ({ positioning_id, campaign_id }) => {
    try {
      const lockResult = await gasPost({ action: 'master_positioning_lock', positioning_id });
      log('lock_master_positioning', { positioning_id }, lockResult);
      if (campaign_id) {
        const gateResult = await gasPost({ action: 'seed_stage_gates', campaign_id, positioning_id });
        log('seed_stage_gates_after_lock', { campaign_id, positioning_id }, gateResult);
        return toolResult({ lock: lockResult, stage_gates: gateResult });
      }
      return toolResult(lockResult);
    } catch (e) { return toolError(e); }
  }
);

// ════════════════════════════════════════════════════════════════════════════
// THEME LIBRARY
// ════════════════════════════════════════════════════════════════════════════

server.tool(
  'get_themes',
  'Fetch themes from ThemeLibrary, optionally filtered by ICP code.',
  {
    icp_code: z.string().optional().describe('ICP code to filter themes e.g. super_mom')
  },
  async ({ icp_code }) => {
    try {
      const params = { action: 'theme_library_read' };
      if (icp_code) params.icp_code = icp_code;
      const result = await gasGet(params);
      log('get_themes', { icp_code }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

// ════════════════════════════════════════════════════════════════════════════
// CAMPAIGN
// ════════════════════════════════════════════════════════════════════════════

server.tool(
  'run_kickstart',
  'Run the campaign kickstart — parses a brief text and generates the campaign brief, LP match, and initial copy block.',
  {
    brief_text: z.string().describe(
      'Free-form campaign brief. Include: ICP, GOAL, CHANNEL, BLUEPRINT, ANGLE, POSTS, URGENCY. ' +
      'Example: "ICP: Busy mom 35 two kids $75K HH. GOAL: Waitlist. CHANNEL: Facebook. ' +
      'BLUEPRINT: A-Waitlist. ANGLE: Savings. POSTS: 7. URGENCY: Founding price ends at 5000 families."'
    ),
    icp_code:   z.string().optional().describe('ICP code override e.g. super_mom'),
    theme_slug: z.string().optional().describe('Theme slug override from ThemeLibrary')
  },
  async ({ brief_text, icp_code, theme_slug }) => {
    try {
      const result = await gasPost({
        action:     'campaign_kickstart',
        brief_text: brief_text,
        icp:        icp_code   || '',
        theme:      theme_slug || ''
      });
      log('run_kickstart', { icp_code, theme_slug }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'get_campaign',
  'Fetch a campaign brief and all associated assets for a given campaign_id.',
  {
    campaign_id: z.string().describe('Campaign ID e.g. EC-2026-001')
  },
  async ({ campaign_id }) => {
    try {
      const result = await gasGet({ action: 'campaign_read', campaign_id });
      log('get_campaign', { campaign_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

// ════════════════════════════════════════════════════════════════════════════
// ASSETS
// ════════════════════════════════════════════════════════════════════════════

server.tool(
  'build_social_posts',
  'Generate social posts for a campaign across one or more channels. Uses MasterPositioning when locked.',
  {
    campaign_id: z.string().describe('Campaign ID e.g. EC-2026-001'),
    channels:    z.array(z.string()).optional().describe('Channels to generate for e.g. ["Facebook","Instagram","TikTok"]')
  },
  async ({ campaign_id, channels }) => {
    try {
      const result = await gasPost({
        action:      'build_social_posts',
        campaign_id: campaign_id,
        channels:    channels || ['Facebook', 'Instagram']
      });
      log('build_social_posts', { campaign_id, channels }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'build_email_sequence',
  'Generate an email sequence for a campaign.',
  {
    campaign_id: z.string().describe('Campaign ID'),
    seq_id:      z.string().optional().describe('Sequence ID: SEQ-1 (welcome), SEQ-2 (nurture), SEQ-3 (urgency), SEQ-4 (launch), SEQ-5 (campaign)')
  },
  async ({ campaign_id, seq_id }) => {
    try {
      const result = await gasPost({
        action:      'build_email_sequence',
        campaign_id: campaign_id,
        seq_id:      seq_id || 'SEQ-1'
      });
      log('build_email_sequence', { campaign_id, seq_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'generate_image',
  'Generate an image prompt and trigger image generation for a social post.',
  {
    post_id: z.string().describe('Social post ID from SocialPosts tab'),
    brief:   z.string().describe('Image brief / visual direction for this post')
  },
  async ({ post_id, brief }) => {
    try {
      const result = await gasPost({
        action:      'generate_image_for_post',
        post_id:     post_id,
        image_brief: brief
      });
      log('generate_image', { post_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

// ════════════════════════════════════════════════════════════════════════════
// STAGE GATES
// ════════════════════════════════════════════════════════════════════════════

server.tool(
  'get_stage_gates',
  'Fetch all 5 stage gates for a campaign with current status, metrics, and unlock conditions.',
  {
    campaign_id: z.string().describe('Campaign ID e.g. EC-2026-001')
  },
  async ({ campaign_id }) => {
    try {
      const result = await gasGet({ action: 'stage_gates_read', campaign_id });
      log('get_stage_gates', { campaign_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'advance_stage_gate',
  'Record a gate review decision (PASS / FAIL / HOLD) and trigger the stage\'s unlock actions.',
  {
    gate_id:     z.string().describe('Gate ID e.g. SG-EC-2026-001-1'),
    decision:    z.enum(['PASS', 'FAIL', 'HOLD']).describe('PASS unlocks next stage, FAIL holds, HOLD flags for review'),
    reviewed_by: z.string().optional().describe('Reviewer name e.g. Taylor, Claude')
  },
  async ({ gate_id, decision, reviewed_by }) => {
    try {
      const result = await gasPost({
        action:      'advance_stage_gate',
        gate_id:     gate_id,
        decision:    decision,
        reviewed_by: reviewed_by || 'Claude'
      });
      log('advance_stage_gate', { gate_id, decision }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'seed_stage_gates',
  'Seed 5 stage gate rows for a campaign. Idempotent — skips gates that already exist.',
  {
    campaign_id:    z.string().describe('Campaign ID'),
    positioning_id: z.string().optional().describe('MasterPositioning ID to link to the gates')
  },
  async ({ campaign_id, positioning_id }) => {
    try {
      const result = await gasPost({
        action:         'seed_stage_gates',
        campaign_id:    campaign_id,
        positioning_id: positioning_id || ''
      });
      log('seed_stage_gates', { campaign_id, positioning_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

// ════════════════════════════════════════════════════════════════════════════
// UTM + TRACKING
// ════════════════════════════════════════════════════════════════════════════

server.tool(
  'generate_utms',
  'Generate UTM parameters and DL_IDs for all assets in a campaign and save to DeepLinkRegistry.',
  {
    campaign_id: z.string().describe('Campaign ID')
  },
  async ({ campaign_id }) => {
    try {
      const result = await gasPost({ action: 'generate_utm_and_save', campaign_id });
      log('generate_utms', { campaign_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'activate_dl_id',
  'Activate a deep link ID in the DeepLinkRegistry (sets status=ACTIVE).',
  {
    dl_id: z.string().describe('Deep link ID in DL-[PREFIX]-[4-digit] format e.g. DL-SM-0001')
  },
  async ({ dl_id }) => {
    try {
      const result = await gasPost({ action: 'activate_dl_id', dl_id });
      log('activate_dl_id', { dl_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'get_campaign_metrics',
  'Fetch CampaignMetrics rows for a campaign — weekly reach, engagement, signups, cost per signup.',
  {
    campaign_id: z.string().describe('Campaign ID')
  },
  async ({ campaign_id }) => {
    try {
      const result = await gasGet({ action: 'campaign_metrics_read', campaign_id });
      log('get_campaign_metrics', { campaign_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

// ════════════════════════════════════════════════════════════════════════════
// RETENTION
// ════════════════════════════════════════════════════════════════════════════

server.tool(
  'get_retention_milestones',
  'Fetch retention milestones: Three-Ingredient Start, First Strike (Day 7), Tipping Point (Day 30), Paid Conversion.',
  {
    campaign_id: z.string().optional().describe('Campaign ID to filter milestones')
  },
  async ({ campaign_id }) => {
    try {
      const params = { action: 'retention_milestones_read' };
      if (campaign_id) params.campaign_id = campaign_id;
      const result = await gasGet(params);
      log('get_retention_milestones', { campaign_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'update_milestone_status',
  'Update the actual_rate and status of a retention milestone after observing real data.',
  {
    milestone_id: z.string().describe('Milestone ID e.g. RM-001'),
    actual_rate:  z.string().describe('Actual rate observed e.g. "52%" or "0.52"'),
    status:       z.enum(['PENDING', 'GREEN', 'AMBER', 'RED', 'ACHIEVED']).describe(
      'GREEN = at or above target, AMBER = between amber and target, RED = below amber threshold, ACHIEVED = milestone fully completed'
    )
  },
  async ({ milestone_id, actual_rate, status }) => {
    try {
      const result = await gasPost({
        action:       'update_milestone_status',
        milestone_id, actual_rate, status
      });
      log('update_milestone_status', { milestone_id, status }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

// ════════════════════════════════════════════════════════════════════════════
// CALENDAR
// ════════════════════════════════════════════════════════════════════════════

server.tool(
  'build_campaign_calendar',
  'Build or rebuild the ContentCalendar for a campaign — schedules all social posts and emails with publish dates.',
  {
    campaign_id: z.string().describe('Campaign ID')
  },
  async ({ campaign_id }) => {
    try {
      const result = await gasPost({ action: 'seed_content_calendar', campaign_id });
      log('build_campaign_calendar', { campaign_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

server.tool(
  'export_calendar_csv',
  'Export the ContentCalendar for a campaign as CSV data for scheduling tools.',
  {
    campaign_id: z.string().describe('Campaign ID')
  },
  async ({ campaign_id }) => {
    try {
      const result = await gasGet({ action: 'export_calendar_csv', campaign_id });
      log('export_calendar_csv', { campaign_id }, result);
      return toolResult(result);
    } catch (e) { return toolError(e); }
  }
);

// ── Start ─────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`[cockpit-mcp] ${SERVER_NAME} v${SERVER_VERSION} — running on stdio\n`);
  process.stderr.write(`[cockpit-mcp] Cockpit: ${COCKPIT_URL}\n`);
}

main().catch(err => {
  process.stderr.write('[cockpit-mcp] FATAL: ' + err.message + '\n');
  process.exit(1);
});
