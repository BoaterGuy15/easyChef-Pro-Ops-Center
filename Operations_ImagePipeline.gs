// ─────────────────────────────────────────────────────────────────────────────
// Operations_ImagePipeline.gs
// Paste this file into your Apps Script project.
//
// ADD TO doPost in Operations.gs (inside the if/else chain):
//   if (body.action === 'generate_image_prompt') return respond(generateImagePrompt(body));
//
// REQUIRES Script Properties:
//   ANTHROPIC_API_KEY
//   OPENAI_API_KEY
//   GOOGLE_AI_API_KEY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 3-step AI image pipeline:
 *   Step 1 — Claude: refines image_brief into a brand-aligned visual description
 *   Step 2 — GPT-4o: rewrites Claude output as a detailed image-generation prompt
 *   Step 3 — Gemini Imagen: generates the actual image, returns base64
 *
 * Takes:
 *   body.image_brief  — one sentence from the social post
 *   body.post_hook    — the post hook text
 *   body.platform     — Facebook / Instagram / TikTok / Pinterest etc
 *   body.icp          — super_mom / budget_family etc
 *   body.dimensions   — e.g. "1200x630px"
 *
 * Returns:
 *   { ok, claude_brief, gpt_prompt, image_base64, mime_type, platform, dimensions }
 */
function generateImagePrompt(body) {
  try {
    var props      = PropertiesService.getScriptProperties();
    var claudeKey  = props.getProperty('ANTHROPIC_API_KEY');
    var openAiKey  = props.getProperty('OPENAI_API_KEY');
    var googleKey  = props.getProperty('GOOGLE_AI_API_KEY');

    if (!claudeKey)  return { ok: false, error: 'ANTHROPIC_API_KEY not set in Script Properties' };
    if (!openAiKey)  return { ok: false, error: 'OPENAI_API_KEY not set in Script Properties' };
    if (!googleKey)  return { ok: false, error: 'GOOGLE_AI_API_KEY not set in Script Properties' };

    var imageBrief = body.image_brief || '';
    var postHook   = body.post_hook   || '';
    var platform   = body.platform    || 'Instagram';
    var icp        = body.icp         || 'super_mom';
    var dimensions = body.dimensions  || '1080x1080px';

    // ── Step 1: Claude → brand-aligned visual description ──────────────────
    var claudeSystem =
      'You are the easyChef Pro visual director. Your job is to translate a social post image brief ' +
      'into a structured visual description that a professional photographer or AI image tool can execute.\n\n' +
      'BRAND RULES — follow exactly:\n' +
      '- Photography style: warm, candid, real family moments — NOT stock photo aesthetic\n' +
      '- Colour palette: warm whites, natural wood tones, soft creams, red accent (#FF0000) where it fits\n' +
      '- NEVER use blue, navy, or cool tones anywhere in the image\n' +
      '- Setting: real kitchens, real homes — lived-in and approachable, not aspirational\n' +
      '- People: authentic expressions, not posed smiles\n' +
      '- Food: real, appetising, natural light — never studio-lit food photography\n' +
      '- App UI: if the easyChef Pro app appears, show the red-accented screen naturally in hand\n\n' +
      'ICP CONTEXT:\n' +
      '- super_mom: busy mother 30–42, suburban kitchen, 6 PM weeknight energy, maybe kids in background\n' +
      '- budget_family: family of 4, practical setting, value-focused, modest but warm home\n' +
      '- health_optimizer: clean counter space, fresh produce visible, mindful but not clinical\n' +
      '- professional: small kitchen, solo cook, efficient setup, weeknight meal prep\n\n' +
      'OUTPUT FORMAT — return only a structured description with these sections:\n' +
      'SCENE: [one sentence describing the primary subject and action]\n' +
      'SETTING: [kitchen/location details]\n' +
      'LIGHTING: [lighting style and quality]\n' +
      'MOOD: [emotional tone]\n' +
      'CAMERA: [angle and framing]\n' +
      'COLOURS: [specific palette]\n' +
      'PLATFORM NOTE: [any composition adjustment for the platform]\n' +
      'No markdown. No explanation outside these sections.';

    var claudeUserMsg =
      'Platform: ' + platform + '\n' +
      'Dimensions: ' + dimensions + '\n' +
      'ICP: ' + icp + '\n' +
      'Post hook: ' + postHook + '\n' +
      'Image brief: ' + imageBrief;

    var claudeResp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         claudeKey,
        'anthropic-version': '2023-06-01',
        'Content-Type':      'application/json'
      },
      payload: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 600,
        system:     claudeSystem,
        messages: [{ role: 'user', content: claudeUserMsg }]
      }),
      muteHttpExceptions: true
    });

    var claudeData = JSON.parse(claudeResp.getContentText());
    if (claudeData.error) {
      var cErr = typeof claudeData.error === 'object' ? claudeData.error.message : String(claudeData.error);
      return { ok: false, error: 'Claude step failed: ' + cErr };
    }
    var claudeVisualDescription = (
      Array.isArray(claudeData.content) && claudeData.content[0] && claudeData.content[0].text
    ) || '';
    if (!claudeVisualDescription) return { ok: false, error: 'Claude returned empty response' };

    // ── Step 2: GPT-4o → image-generation optimised prompt ─────────────────
    var gptResp = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + openAiKey,
        'Content-Type':  'application/json'
      },
      payload: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role:    'system',
            content: 'You are an expert at writing image generation prompts. Take the visual description and rewrite it as a highly detailed, specific image generation prompt. Include: subject, setting, lighting, mood, camera angle, style. Output only the prompt — no explanation.'
          },
          {
            role:    'user',
            content: claudeVisualDescription
          }
        ],
        max_tokens: 300
      }),
      muteHttpExceptions: true
    });

    var gptData = JSON.parse(gptResp.getContentText());
    if (gptData.error) {
      return { ok: false, error: 'GPT-4o step failed: ' + (gptData.error.message || String(gptData.error)) };
    }
    var optimisedPrompt = (
      gptData.choices && gptData.choices[0] &&
      gptData.choices[0].message && gptData.choices[0].message.content
    ) || '';
    if (!optimisedPrompt) return { ok: false, error: 'GPT-4o returned empty prompt' };

    // ── Step 3: Gemini Imagen → base64 image ───────────────────────────────
    var geminiResp = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=' + googleKey,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({
          contents: [{
            parts: [{ text: optimisedPrompt }]
          }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        }),
        muteHttpExceptions: true
      }
    );

    var geminiHttpCode = geminiResp.getResponseCode();
    var geminiData     = JSON.parse(geminiResp.getContentText());

    if (geminiHttpCode !== 200 || geminiData.error) {
      var gErr = geminiData.error ? (geminiData.error.message || JSON.stringify(geminiData.error)) : ('HTTP ' + geminiHttpCode);
      return {
        ok:            false,
        error:         'Gemini step failed: ' + gErr,
        claude_brief:  claudeVisualDescription,
        gpt_prompt:    optimisedPrompt
      };
    }

    // Extract base64 image from Gemini response
    var image_base64 = '';
    var mime_type    = 'image/png';
    try {
      var parts = geminiData.candidates[0].content.parts;
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].inlineData) {
          image_base64 = parts[i].inlineData.data;
          mime_type    = parts[i].inlineData.mimeType || 'image/png';
          break;
        }
      }
    } catch (ex) {
      return {
        ok:           false,
        error:        'Could not extract image from Gemini response: ' + ex.message,
        claude_brief: claudeVisualDescription,
        gpt_prompt:   optimisedPrompt,
        raw_gemini:   JSON.stringify(geminiData).slice(0, 500)
      };
    }

    if (!image_base64) {
      return {
        ok:           false,
        error:        'Gemini returned no image data. Check model availability.',
        claude_brief: claudeVisualDescription,
        gpt_prompt:   optimisedPrompt,
        raw_gemini:   JSON.stringify(geminiData).slice(0, 500)
      };
    }

    return {
      ok:           true,
      claude_brief: claudeVisualDescription,
      gpt_prompt:   optimisedPrompt,
      image_base64: image_base64,
      mime_type:    mime_type,
      platform:     platform,
      dimensions:   dimensions
    };

  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── Diagnostic ────────────────────────────────────────────────────────────────
// Run → _testImagePipeline → View Execution log
function _testImagePipeline() {
  var result = generateImagePrompt({
    image_brief: 'A tired mom opening the fridge at 6pm, looking relieved when she sees a meal plan on her phone',
    post_hook:   'You already know what\'s for dinner tonight.',
    platform:    'Instagram',
    icp:         'super_mom',
    dimensions:  '1080x1080px'
  });
  Logger.log('ok: '           + result.ok);
  Logger.log('claude_brief: ' + (result.claude_brief || '').slice(0, 200));
  Logger.log('gpt_prompt: '   + (result.gpt_prompt   || '').slice(0, 200));
  Logger.log('image_base64 length: ' + (result.image_base64 || '').length);
  Logger.log('mime_type: '    + result.mime_type);
  if (!result.ok) Logger.log('error: ' + result.error);
}

// ── List available Gemini models ──────────────────────────────────────────────
// Run → _listGeminiModels → View Execution log to find the correct image model name
function _listGeminiModels() {
  var key = PropertiesService.getScriptProperties().getProperty('GOOGLE_AI_API_KEY');
  var resp = UrlFetchApp.fetch(
    'https://generativelanguage.googleapis.com/v1beta/models?key=' + key,
    { muteHttpExceptions: true }
  );
  var data = JSON.parse(resp.getContentText());
  var models = (data.models || []).map(function(m) {
    return m.name + ' — ' + (m.supportedGenerationMethods || []).join(', ');
  });
  models.forEach(function(m) { Logger.log(m); });
}
