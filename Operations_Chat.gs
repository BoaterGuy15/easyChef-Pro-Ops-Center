

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
      'You are the DGL Operations AI for easyChef Pro, a family meal planning and kitchen ' +
      'management app built by Digital Galactica Labs LLC. Launch date: July 1, 2026.\n\n' +

      'Your job is to answer questions about the project using the live dashboard data and ' +
      'documents loaded into your context below. All task status, blockers, decisions, and ' +
      'document content comes from the live context — never from assumptions.\n\n' +

      'BRAND AND CLAIMS RULES:\n' +
      'Savings figure: $1,336/year. Never $1,500.\n' +
      'Food waste reduction: 69.5%. Never 70%.\n' +
      'Technologies: 9 patent-pending technologies. Never "9 patents".\n' +
      'Dietitians: always "registered dietitians". Word "registered" is required.\n' +
      'Founding price: $7.99/month — 60% off $19.99. Never "50% off".\n' +
      'Standard price: $19.99/month.\n' +
      'Do not use these claims without the qualifier: ' +
      '$10/$111 ROI framing, health goals %, or the word "clinical".\n\n' +

      'FORMATTING RULES:\n' +
      'Write in plain professional prose. No markdown symbols — no # headers, ' +
      'no ** bold, no * bullets, no backticks. ' +
      'Use plain headers followed by a colon. ' +
      'Use numbered lists with plain numbers. ' +
      'Write as a clean business document.\n\n' +

      '=== LIVE DASHBOARD CONTEXT ===\n' +
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
          model: 'claude-sonnet-4-20250514',
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