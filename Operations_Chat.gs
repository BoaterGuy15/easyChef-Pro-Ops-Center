// ─────────────────────────────────────────────────────────────────────────────
// Operations_Chat.gs
// ADD THESE FUNCTIONS TO YOUR EXISTING Operations.gs (Code.gs)
// Do NOT replace the existing file — paste the functions below into it.
//
// ── doGet additions (paste inside your existing doGet(e) if/else block) ──────
//
//   if (action === 'ops_context_read') {
//     var ids = (e.parameter.docIds || '').split(',').filter(Boolean);
//     return json(opsContextRead(ids));
//   }
//
// ── doPost additions (paste inside your existing doPost(e) if/else block) ────
//
//   if (body.action === 'ops_context_read') return json(opsContextRead(body.docIds));
//   if (body.action === 'ops_chat')          return json(opsChat(body.prompt, body.history, body.context));
//
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads text content from Drive files by their file IDs.
 * Supports Google Docs, Google Sheets, plain text, and CSV.
 * Returns { ok: true, contents: { fileId: "text..." } }
 */
function opsContextRead(docIds) {
  if (!Array.isArray(docIds) || !docIds.length) return { ok: true, contents: {} };
  var contents = {};

  docIds.forEach(function(id) {
    if (!id || id.length < 10) return;
    var name = id, url = 'https://drive.google.com/file/d/' + id + '/view', mime = '', text = '';
    try {
      var file = DriveApp.getFileById(id);
      name = file.getName();
      mime = file.getMimeType();

      if (mime === MimeType.GOOGLE_DOCS) {
        text = DocumentApp.openById(id).getBody().getText();
        url  = 'https://docs.google.com/document/d/' + id + '/view';

      } else if (mime === MimeType.GOOGLE_SHEETS) {
        url = 'https://docs.google.com/spreadsheets/d/' + id + '/view';
        var ss = SpreadsheetApp.openById(id);
        ss.getSheets().slice(0, 5).forEach(function(s) {
          var vals = s.getDataRange().getValues();
          text += '[Sheet: ' + s.getName() + ']\n';
          vals.slice(0, 60).forEach(function(row) { text += row.join('\t') + '\n'; });
          text += '\n';
        });

      } else if (mime === MimeType.GOOGLE_SLIDES) {
        url = 'https://docs.google.com/presentation/d/' + id + '/view';
        var pres = SlidesApp.openById(id);
        pres.getSlides().slice(0, 20).forEach(function(slide, i) {
          text += '[Slide ' + (i + 1) + ']\n';
          slide.getPageElements().forEach(function(el) {
            try { text += el.asShape().getText().asString() + '\n'; } catch(e2) {}
          });
        });

      } else if (mime === 'application/pdf') {
        text = '[PDF — binary content, not extractable as text. File: ' + name + ']';

      } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 mime === 'application/msword') {
        try {
          var raw = file.getBlob().getDataAsString('UTF-8');
          // Strip non-printable characters left over from binary XML packaging
          text = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/[ \t]{4,}/g, ' ').replace(/\n{4,}/g, '\n\n').trim();
        } catch(e2) {
          text = '[Word document — could not extract text: ' + e2.message + ']';
        }

      } else {
        // Plain text, CSV, Markdown, etc.
        try {
          text = file.getBlob().getDataAsString();
        } catch(e2) {
          text = '[' + mime + ' — binary content, not readable as text]';
        }
      }

    } catch(e) {
      text = '[Error reading file: ' + e.message + ']';
    }

    contents[id] = {
      title:    name,
      url:      url,
      mimeType: mime,
      text:     text.substring(0, 8000)
    };
  });

  return { ok: true, contents: contents };
}

/**
 * Chat endpoint for the Ask Claude panel.
 * Accepts the user prompt, conversation history (last N turns), and
 * the pre-compiled dashboard context string from the frontend.
 * Returns { ok: true, reply: "..." }
 */
function opsChat(prompt, history, context) {
  if (!prompt) return { ok: false, error: 'prompt is required' };

  var props  = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('ANTHROPIC_API_KEY');
  if (!apiKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set in Script Properties' };

  var BRIEF =
    'easyChef Pro — Operations Brief\n\n' +
    'PRODUCT\n' +
    'easyChef Pro is a family meal planning and grocery budgeting mobile app. It targets families spending $200-$400/month on groceries and uses AI to reduce that spend by 30-60% through Walmart-integrated meal planning.\n' +
    'Launch target: July 1, 2026\n' +
    'Founding price: $7.99/month\n' +
    'Standard price: $10/month\n' +
    'ROI framing: $10/month saves $111/month (11:1 return)\n\n' +
    'TEAM & ROLES\n' +
    'Taylor — Founder / decision-maker. All YOU items require Taylor\'s approval.\n' +
    'Steve — Operations lead\n' +
    'Adam — Marketing lead, GTM strategy\n' +
    'Mary — Content, email copy\n' +
    'JR — Product, development\n' +
    'Hammad — Technical development\n' +
    'Searah — Design\n' +
    'Sadee — Support / operations\n\n' +
    'KEY DATES\n' +
    'May 2026 — Beta recruitment, Zendesk setup, email sequences written\n' +
    'May 8, 2026 — Zendesk operational (hard deadline before beta)\n' +
    'June 17-30, 2026 — SEQ-3 Urgency email sequence active\n' +
    'June 30, 2026 — Launch Day email (SEQ-4) must be approved\n' +
    'July 1, 2026 — Full public launch\n\n' +
    'TECH STACK\n' +
    'GitHub to Vercel (main) — easychefpro.com marketing site\n' +
    'GitHub to GitHub Pages (staging) — ops.dgl.dev internal dashboard\n' +
    'Klaviyo — Email platform, waitlist sequences SEQ-1 through SEQ-5\n' +
    'Convert.com (10019256-10019672) — A/B test: Waitlist LP Variant A vs B\n' +
    'Microsoft Clarity (wjxhprug80) — Heatmaps and session recording\n' +
    'GA4 (G-Q4DYEEXFKV) — Analytics, waitlist conversion tracking\n' +
    'Zendesk — Customer support (easychefpro.zendesk.com)\n' +
    'Stripe — Subscriptions and founding member payments\n' +
    'Make.com — Automation webhooks\n' +
    'Google Apps Script — Backend proxy for Sheets, Slack, Anthropic API\n\n' +
    'CURRENT BLOCKERS (as of May 2026)\n' +
    '1. /thank-you page not built — blocks Convert.com A/B test entirely\n' +
    '2. Convert.com + Clarity not installed on /lp/waitlist-a, /lp/waitlist-b, /thank-you\n' +
    '3. Email sequences SEQ-1 through SEQ-5 not written — blocks list activation\n' +
    '4. Zendesk not live — blocks beta program start\n\n' +
    'ACTIVE CAMPAIGNS & WORKSTREAMS\n' +
    'EC-2026-001: Waitlist A/B test — utm_medium=email audience, Convert.com controls variant assignment, Klaviyo reads utm_content to tag cohorts\n' +
    'EC-2026-005: Pinterest funnel for ICP 02 Budget Family — PENDING ICP validation with beta data\n' +
    'SEQ-1: Welcome sequence (3 emails, Days 0-7)\n' +
    'SEQ-2: Nurture sequence (5 emails including A/B variant on Email 3)\n' +
    'SEQ-3: Urgency sequence (4 emails, June 17-30)\n' +
    'SEQ-4: Launch Day (July 1)\n' +
    'SEQ-5: Re-engagement\n\n' +
    'ICP PROFILES\n' +
    'ICP 01 — Busy Parent: Households earning $60-120K, 2+ kids, time-constrained, values convenience\n' +
    'ICP 02 — Budget Family: Households earning $40-80K, 2+ kids, financially stressed, shops at Walmart\n\n' +
    'BETA PROGRAM\n' +
    'Target: 50 families onboarded before July 1\n' +
    'Outreach: Founder personal inbox (Taylor direct)\n' +
    'Check-in cadence: Weekly SMS or WhatsApp per family\n' +
    'Goal: Real testimonials and health goals % data to replace placeholders\n\n' +
    'DECISIONS PENDING TAYLOR\'S APPROVAL\n' +
    '1. $10/$111 ROI framing (11:1) — needed for paywall and Budget Family LP\n' +
    '2. AI chatbot platform: Zendesk Fin / Intercom / ChatGPT via Make.com\n' +
    '3. VA hire threshold (weekly email volume trigger)\n' +
    '4. "Clinical" / independent research claim — requires legal review\n' +
    '5. SEQ-2 Email 3 variant A (Adam / Money Hook) and B (Mary / Time Hook)\n';

  var systemPrompt =
    'You are the DGL Operations AI for easyChef Pro. ' +
    'Read the documents and data in your context and return the exact content word for word when asked. ' +
    'Do not summarize, paraphrase, interpret, or add anything that is not written in the source documents. ' +
    'If something is not in the loaded context say: That document is not loaded in my current context. ' +
    'Write in plain text with no markdown — no # no ** no * no backticks. Use plain numbered lists and short paragraphs only.\n\n' +
    '=== EASYCHEF PRO BRIEF ===\n' +
    BRIEF + '\n' +
    '=== DASHBOARD CONTEXT ===\n' +
    (context || '(no context provided)');

  var messages = [];
  if (Array.isArray(history)) {
    history.slice(-12).forEach(function(m) {
      if ((m.role === 'user' || m.role === 'assistant') && m.content) {
        messages.push({ role: m.role, content: String(m.content) });
      }
    });
  }
  // Remove trailing assistant message to avoid API error
  while (messages.length && messages[messages.length - 1].role === 'assistant') messages.pop();
  messages.push({ role: 'user', content: String(prompt) });

  try {
    var resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'claude-opus-4-7',
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages
      }),
      muteHttpExceptions: true
    });
    var data  = JSON.parse(resp.getContentText());
    var reply = (Array.isArray(data.content) && data.content[0] && data.content[0].text) || '';
    if (!reply && data.error) {
      var errMsg = (typeof data.error === 'object') ? data.error.message : String(data.error);
      return { ok: false, error: errMsg };
    }
    return { ok: true, reply: reply };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}
