#!/usr/bin/env node
'use strict';

// easyChef Pro — Cockpit MCP Server
// 20 tools wrapping GAS cockpit endpoints via CF Worker proxy
// Stdio transport (raw JSON-RPC 2.0, no SDK dependency)

const https = require('https');
const readline = require('readline');

const GAS_URL = 'https://launch.easychefpro.com/api/';

// ── HTTP helper ──────────────────────────────────────────────────────────────

function gasPost(payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const url = new URL(GAS_URL);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ ok: false, error: 'Parse error: ' + data.slice(0, 300) }); }
      });
    });
    req.on('error', e => reject(e));
    req.write(body);
    req.end();
  });
}

// ── JSON-RPC helpers ─────────────────────────────────────────────────────────

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}
function respond(id, result) {
  send({ jsonrpc: '2.0', id, result });
}
function respondError(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

// ── Tool definitions (20) ────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'system_health_check',
    description: 'Check health of all easyChef Pro systems. Returns deploy number, RED systems, blocked count, LP spine state, GPT4O_ACTIVE flag.',
    inputSchema: {
      type: 'object',
      properties: {
        campaign_id: { type: 'string', description: 'Campaign ID (default: EC-2026-001)' },
      },
    },
  },
  {
    name: 'get_campaign_dashboard',
    description: 'Get dashboard KPI data for a campaign account.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id', 'sheet_id'],
      properties: {
        campaign_id: { type: 'string' },
        sheet_id: { type: 'string', description: 'Account Google Sheet ID' },
      },
    },
  },
  {
    name: 'get_campaign_calendar',
    description: 'Get the full content calendar for a campaign account.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id', 'sheet_id'],
      properties: {
        campaign_id: { type: 'string' },
        sheet_id: { type: 'string' },
        filter_platform: { type: 'string' },
        filter_funnel: { type: 'string' },
        filter_status: { type: 'string' },
      },
    },
  },
  {
    name: 'get_cockpit_filter_defs',
    description: 'Get filter pill definitions (platforms, emotions, funnel stages, weeks) from the Campaign Center Sheet.',
    inputSchema: {
      type: 'object',
      properties: {
        campaign_id: { type: 'string' },
      },
    },
  },
  {
    name: 'get_milestones',
    description: 'Get campaign milestones. Pass campaign_id="all" to retrieve milestones across all campaigns.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id', 'sheet_id'],
      properties: {
        campaign_id: { type: 'string' },
        sheet_id: { type: 'string' },
      },
    },
  },
  {
    name: 'add_milestone',
    description: 'Add a milestone to a campaign.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id', 'sheet_id', 'title', 'due_date'],
      properties: {
        campaign_id: { type: 'string' },
        sheet_id: { type: 'string' },
        title: { type: 'string' },
        due_date: { type: 'string', description: 'ISO date YYYY-MM-DD' },
        notes: { type: 'string' },
      },
    },
  },
  {
    name: 'email_sequences_read',
    description: 'Read email sequence metadata from the Campaign Center Sheet EMAIL tab.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id'],
      properties: {
        campaign_id: { type: 'string' },
      },
    },
  },
  {
    name: 'get_all_funnels',
    description: 'Get funnel stage data for all active campaign accounts.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_campaign_funnel',
    description: 'Get funnel stage data for a specific campaign account.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id', 'sheet_id'],
      properties: {
        campaign_id: { type: 'string' },
        sheet_id: { type: 'string' },
      },
    },
  },
  {
    name: 'get_accounts',
    description: 'List all registered campaign accounts from the accounts registry.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'check_account_setup',
    description: 'Check that an account sheet is properly configured with all required tabs.',
    inputSchema: {
      type: 'object',
      required: ['sheet_id'],
      properties: {
        sheet_id: { type: 'string' },
      },
    },
  },
  {
    name: 'generate_lp_spine',
    description: 'AI-generate landing page copy spine for a campaign variant. LP spine must exist before any other content generation.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id', 'lp_variant'],
      properties: {
        campaign_id: { type: 'string' },
        lp_variant: { type: 'string', description: 'LP variant code e.g. LP-A or LP-B' },
        icp_code: { type: 'string' },
      },
    },
  },
  {
    name: 'create_lp_entry',
    description: 'Register a new landing page entry in the Campaign Center Sheet LandingPages tab.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id', 'slug', 'full_url'],
      properties: {
        campaign_id: { type: 'string' },
        slug: { type: 'string' },
        full_url: { type: 'string' },
        lp_variant: { type: 'string' },
        page_type: { type: 'string' },
        icp_codes: { type: 'string' },
        campaign_angle: { type: 'string' },
        thank_you_url: { type: 'string' },
      },
    },
  },
  {
    name: 'generate_content_cal_brief_docs',
    description: 'Generate brief Google Docs for all content calendar assets in a campaign.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id', 'sheet_id'],
      properties: {
        campaign_id: { type: 'string' },
        sheet_id: { type: 'string' },
        force: { type: 'boolean', description: 'Regenerate even if docs already exist' },
      },
    },
  },
  {
    name: 'generate_master_positioning',
    description: 'Generate or regenerate the Master Positioning document for a campaign using AI. Writes to MasterPositioning tab.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id'],
      properties: {
        campaign_id: { type: 'string' },
        force: { type: 'boolean', description: 'Regenerate even if positioning already exists' },
      },
    },
  },
  {
    name: 'get_master_positioning',
    description: 'Read the Master Positioning data for a campaign from the MasterPositioning tab.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id'],
      properties: {
        campaign_id: { type: 'string' },
      },
    },
  },
  {
    name: 'seed_all_campaigns_content_calendar',
    description: 'Seed the content calendar for all active campaigns.',
    inputSchema: {
      type: 'object',
      properties: {
        campaign_id: { type: 'string', description: 'Limit to one campaign (optional)' },
      },
    },
  },
  {
    name: 'repair_creative_status',
    description: 'Repair/normalize status fields in the content calendar for a campaign account.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id', 'sheet_id'],
      properties: {
        campaign_id: { type: 'string' },
        sheet_id: { type: 'string' },
      },
    },
  },
  {
    name: 'append_session_log',
    description: 'Append a session log line to the permanent Roadmap doc.',
    inputSchema: {
      type: 'object',
      required: ['line'],
      properties: {
        line: { type: 'string', description: 'Log line e.g. "@800 May 17 — what changed. Campaign state. What\'s next."' },
      },
    },
  },
  {
    name: 'run_ob_campaign_full',
    description: 'Run full outbound (OB) campaign generation for a campaign account.',
    inputSchema: {
      type: 'object',
      required: ['campaign_id', 'sheet_id'],
      properties: {
        campaign_id: { type: 'string' },
        sheet_id: { type: 'string' },
        icp_codes: { type: 'string', description: 'Comma-separated ICP codes to target' },
      },
    },
  },
];

// ── Tool dispatcher ──────────────────────────────────────────────────────────

async function callTool(name, args) {
  const payload = { action: name, ...args };
  try {
    const result = await gasPost(payload);
    return JSON.stringify(result, null, 2);
  } catch (e) {
    return JSON.stringify({ ok: false, error: e.message });
  }
}

// ── Stdio JSON-RPC loop ──────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on('line', async (raw) => {
  const line = raw.trim();
  if (!line) return;

  let msg;
  try { msg = JSON.parse(line); }
  catch { return; }

  const { id, method, params } = msg;

  // Notifications have no id — no response required
  const isNotification = id === undefined || id === null;

  switch (method) {
    case 'initialize':
      respond(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'easychef-cockpit', version: '1.0.0' },
      });
      break;

    case 'ping':
      if (!isNotification) respond(id, {});
      break;

    case 'tools/list':
      respond(id, { tools: TOOLS });
      break;

    case 'tools/call': {
      const { name, arguments: args } = params || {};
      if (!name) { respondError(id, -32602, 'Missing tool name'); break; }
      const text = await callTool(name, args || {});
      respond(id, { content: [{ type: 'text', text }] });
      break;
    }

    default:
      if (!isNotification) respondError(id, -32601, `Method not found: ${method}`);
  }
});

rl.on('close', () => process.exit(0));
process.stderr.write('easychef-cockpit MCP server ready\n');
