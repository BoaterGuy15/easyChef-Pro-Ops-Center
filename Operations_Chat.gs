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
    try {
      var file = DriveApp.getFileById(id);
      var mime = file.getMimeType();
      var text = '';
      if (mime === MimeType.GOOGLE_DOCS) {
        text = DocumentApp.openById(id).getBody().getText();
      } else if (mime === MimeType.GOOGLE_SHEETS) {
        var ss = SpreadsheetApp.openById(id);
        ss.getSheets().slice(0, 5).forEach(function(s) {
          var vals = s.getDataRange().getValues();
          text += '[Sheet: ' + s.getName() + ']\n';
          vals.slice(0, 60).forEach(function(row) { text += row.join('\t') + '\n'; });
          text += '\n';
        });
      } else if (mime === MimeType.GOOGLE_SLIDES) {
        var pres = SlidesApp.openById(id);
        pres.getSlides().slice(0, 20).forEach(function(slide, i) {
          text += '[Slide ' + (i + 1) + ']\n';
          slide.getPageElements().forEach(function(el) {
            try { text += el.asShape().getText().asString() + '\n'; } catch(e2) {}
          });
        });
      } else {
        text = file.getBlob().getDataAsString();
      }
      contents[id] = text.substring(0, 8000);
    } catch(e) {
      contents[id] = '[Could not read: ' + e.message + ']';
    }
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

  var systemPrompt =
    'You are the DGL Operations AI for easyChef Pro (launch: July 1 2026). ' +
    'You have full access to the team\'s tasks, workstreams, agenda, documents, and Google Sheets. ' +
    'Answer concisely using the provided data. ' +
    'Format responses clearly — use numbered lists or short paragraphs. ' +
    'Never make up data that isn\'t in the context.\n\n' +
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
