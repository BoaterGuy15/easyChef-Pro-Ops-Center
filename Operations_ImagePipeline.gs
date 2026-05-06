// ─────────────────────────────────────────────────────────────────────────────
// Operations_ImagePipeline.gs
// Paste this file into your Apps Script project.
//
// ADD TO doGet in Operations.gs (inside the if/else chain):
//   if (e.parameter.action === 'generate_image_prompt') return respond(generateImagePrompt({
//     action:      e.parameter.action,
//     image_brief: decodeURIComponent(e.parameter.image_brief||''),
//     post_hook:   decodeURIComponent(e.parameter.post_hook||''),
//     post_body:   decodeURIComponent(e.parameter.post_body||''),
//     app_screen:  decodeURIComponent(e.parameter.app_screen||'meal planning interface'),
//     platform:    e.parameter.platform||'Facebook',
//     icp:         e.parameter.icp||'super_mom',
//     dimensions:  e.parameter.dimensions||'1200x630px',
//     use_case:    e.parameter.use_case||'social'
//   }));
//
// REQUIRES Script Properties:
//   ANTHROPIC_API_KEY
//   OPENAI_API_KEY
//   GOOGLE_AI_API_KEY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 3-step AI image pipeline:
 *   Step 1 — Claude:  refines image_brief into a brand-aligned visual description
 *   Step 2 — GPT-4o:  rewrites Claude output as a detailed image-generation prompt
 *   Step 3 — Google:  routes to Imagen 4 (social/recipe) or Nano Banana Pro (lp/blog)
 *
 * Takes:
 *   body.image_brief  — one sentence from the social post
 *   body.post_hook    — the post hook text
 *   body.platform     — Facebook / Instagram / TikTok / Pinterest etc
 *   body.icp          — super_mom / budget_family etc
 *   body.dimensions   — e.g. "1200x630px"
 *   body.use_case     — 'social' | 'lp' | 'blog' | 'recipe'  (default: 'social')
 *                       social/recipe → Imagen 4.0
 *                       lp/blog       → Nano Banana Pro
 *
 * Returns:
 *   { ok, use_case, model_used, claude_brief, gpt_prompt,
 *     image_base64, mime_type, platform, dimensions }
 */
function generateImagePrompt(body) {
  try {
    var props     = PropertiesService.getScriptProperties();
    var claudeKey = props.getProperty('ANTHROPIC_API_KEY');
    var openAiKey = props.getProperty('OPENAI_API_KEY');
    var googleKey = props.getProperty('GOOGLE_AI_API_KEY');

    if (!claudeKey) return { ok: false, error: 'ANTHROPIC_API_KEY not set in Script Properties' };
    if (!openAiKey) return { ok: false, error: 'OPENAI_API_KEY not set in Script Properties' };
    if (!googleKey) return { ok: false, error: 'GOOGLE_AI_API_KEY not set in Script Properties' };

    var imageBrief    = body.image_brief    || '';
    var postHook      = body.post_hook      || '';
    var postBody      = body.post_body      || '';
    var appScreen     = body.app_screen     || 'meal planning interface';
    var platform      = body.platform       || 'Instagram';
    var icp           = body.icp            || 'super_mom';
    var dimensions    = body.dimensions     || '1080x1080px';
    var useCase       = body.use_case       || 'social';
    var theme         = body.theme          || '';
    var skipOptimize  = body.skip_optimize  === 'true' || body.skip_optimize === true;
    var skipClaude    = body.skip_claude    === 'true' || body.skip_claude   === true;

    // ── Fast path: custom prompt — skip Claude + GPT, send directly to Imagen
    if (skipOptimize && imageBrief) {
      var useNanaBananaFast = (useCase === 'lp' || useCase === 'blog');
      var fastResult = useNanaBananaFast
        ? _generateNanoBanana(imageBrief, googleKey, dimensions)
        : _generateImagen4(imageBrief, googleKey, dimensions);
      if (!fastResult.ok) return { ok: false, error: fastResult.error, gpt_prompt: imageBrief };
      return {
        ok: true, use_case: useCase, model_used: useNanaBananaFast ? 'nano-banana-pro-preview' : 'imagen-4.0-generate-001',
        claude_brief: '(skipped — custom prompt used directly)',
        gpt_prompt: imageBrief,
        image_base64: fastResult.image_base64, mime_type: fastResult.mime_type,
        platform: platform, dimensions: dimensions
      };
    }

    // ── Mid path: user-written brief — skip Claude, GPT-4o → Imagen
    if (skipClaude && imageBrief) {
      var gptRespSc = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + openAiKey, 'Content-Type': 'application/json' },
        payload: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role:    'system',
              content: 'You are an expert at writing image generation prompts. Take the visual description and rewrite it as a highly detailed, specific image generation prompt. Include: subject, setting, lighting, mood, camera angle, style. The character is holding a smartphone showing: ' + appScreen + '. The screen is clearly visible with red interface elements. Output only the prompt — no explanation.'
            },
            { role: 'user', content: imageBrief }
          ],
          max_tokens: 300
        }),
        muteHttpExceptions: true
      });
      var gptDataSc = JSON.parse(gptRespSc.getContentText());
      if (gptDataSc.error) {
        return { ok: false, error: 'GPT-4o step failed: ' + (gptDataSc.error.message || String(gptDataSc.error)) };
      }
      var optimisedSc = (gptDataSc.choices && gptDataSc.choices[0] && gptDataSc.choices[0].message && gptDataSc.choices[0].message.content) || '';
      if (!optimisedSc) return { ok: false, error: 'GPT-4o returned empty prompt' };
      var useNanaSc = (useCase === 'lp' || useCase === 'blog');
      var imgResultSc = useNanaSc ? _generateNanoBanana(optimisedSc, googleKey, dimensions) : _generateImagen4(optimisedSc, googleKey, dimensions);
      if (!imgResultSc.ok) return { ok: false, error: imgResultSc.error, gpt_prompt: optimisedSc };
      return {
        ok: true, use_case: useCase, model_used: useNanaSc ? 'nano-banana-pro-preview' : 'imagen-4.0-generate-001',
        claude_brief: '(skipped — user-written brief)',
        gpt_prompt: optimisedSc,
        image_base64: imgResultSc.image_base64, mime_type: imgResultSc.mime_type,
        platform: platform, dimensions: dimensions
      };
    }

    // ── Step 1: Claude → brand-aligned visual description ──────────────────
    var claudeSystem =
      'You are the easyChef Pro visual director. Your job is to translate a social post image brief ' +
      'into a precise, image-generation-ready visual description that an AI image model can execute directly.\n\n' +
      'BRAND RULES — follow exactly:\n' +
      '- Photography style: warm, candid, real family moments — NOT stock photo aesthetic\n' +
      '- Colour palette: warm whites, natural wood tones, soft creams, red accent (#FF0000) where it fits naturally\n' +
      '- NEVER include blue, navy, or cool tones anywhere in the image\n' +
      '- Setting: real kitchens, real homes — lived-in and approachable, not aspirational or staged\n' +
      '- People: authentic expressions, not posed smiles\n' +
      '- Food: real, appetising, natural light — never studio-lit food photography\n' +
      '- App UI: if the easyChef Pro app appears, show the red-accented screen naturally in hand\n\n' +
      'ICP CONTEXT:\n' +
      '- super_mom: busy mother 30–42, suburban kitchen, 6 PM weeknight energy, maybe kids in background\n' +
      '- budget_family: family of 4, practical setting, value-focused, modest but warm home\n' +
      '- health_optimizer: clean counter space, fresh produce visible, mindful but not clinical\n' +
      '- professional: small kitchen, solo cook, efficient setup, weeknight meal prep\n\n' +
      'OUTPUT FORMAT — write exactly 4 to 6 sentences of continuous prose. No headers, no bullet points, no labels.\n' +
      'Cover all six elements in order within those sentences:\n' +
      '1. Subject + action + emotion — who is in the scene, what they are doing, the specific feeling it conveys\n' +
      '2. Setting + time of day + lighting — exact location, time of day, natural light direction and quality\n' +
      '3. Colour palette + brand rules — warm whites, wood tones, soft creams, red accent where natural; zero blue or cool tones\n' +
      '4. Composition + camera angle — framing style, depth of field, foreground versus background relationship\n' +
      '5. Style reference — photorealistic, candid editorial family photography, warm and authentic, never stock-photo aesthetic\n' +
      '6. Negative prompt — one sentence beginning with "Do not include:" listing what must be absent (blue or cool tones, studio lighting, posed smiles, fake backgrounds, text overlays)\n' +
      'Output only the prose. No markdown, no section labels, no explanation.';

    var claudeUserMsg =
      'Platform: '              + platform   + '\n' +
      'Dimensions: '            + dimensions + '\n' +
      'ICP: '                   + icp        + '\n' +
      'Use case: '              + useCase    + '\n' +
      'Post hook: '             + postHook   + '\n' +
      'Post body: '             + postBody   + '\n' +
      'App screen shown on phone: ' + appScreen + '\n' +
      'Image brief: '           + imageBrief;

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
        messages:   [{ role: 'user', content: claudeUserMsg }]
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

    // ── Theme food enforcement ─────────────────────────────────────────────
    if (theme) {
      var tl = theme.toLowerCase();
      if      (tl.indexOf('taco')      > -1) claudeVisualDescription += '\n\nREQUIRED FOOD: Tacos must be clearly and prominently visible — crispy shells, seasoned meat filling, salsa, toppings. This is a Taco Tuesday campaign. No other food.';
      else if (tl.indexOf('meal prep') > -1) claudeVisualDescription += '\n\nREQUIRED: Multiple meal prep containers with colourful food must be clearly visible on the counter.';
      else if (tl.indexOf('pizza')     > -1) claudeVisualDescription += '\n\nREQUIRED FOOD: Pizza must be clearly visible in the scene.';
      else if (tl.indexOf('pasta')     > -1) claudeVisualDescription += '\n\nREQUIRED FOOD: A pasta dish must be clearly visible in the scene.';
    }

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
            content: 'You are an expert at writing image generation prompts. Take the visual description and rewrite it as a highly detailed, specific image generation prompt. Include: subject, setting, lighting, mood, camera angle, style. The character is holding a smartphone showing: ' + appScreen + '. The screen is clearly visible with red interface elements. Output only the prompt — no explanation.'
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

    // ── Step 3: route to Imagen 4 or Nano Banana Pro ───────────────────────
    var useNanoBanana = (useCase === 'lp' || useCase === 'blog');
    var imageResult   = useNanoBanana
      ? _generateNanoBanana(optimisedPrompt, googleKey, dimensions)
      : _generateImagen4(optimisedPrompt, googleKey, dimensions);

    if (!imageResult.ok) {
      return {
        ok:           false,
        error:        imageResult.error,
        claude_brief: claudeVisualDescription,
        gpt_prompt:   optimisedPrompt
      };
    }

    return {
      ok:           true,
      use_case:     useCase,
      model_used:   useNanoBanana ? 'nano-banana-pro-preview' : 'imagen-4.0-generate-001',
      claude_brief: claudeVisualDescription,
      gpt_prompt:   optimisedPrompt,
      image_base64: imageResult.image_base64,
      mime_type:    imageResult.mime_type,
      platform:     platform,
      dimensions:   dimensions
    };

  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── Image generation helpers ──────────────────────────────────────────────────

/**
 * Calls Imagen 4.0 predict endpoint.
 * Used for use_case: 'social', 'recipe'
 */
function _generateImagen4(prompt, googleKey, dimensions) {
  var resp = UrlFetchApp.fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=' + googleKey,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify({
        instances:  [{ prompt: prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: _sbGetAspectRatio(dimensions)
        }
      }),
      muteHttpExceptions: true
    }
  );

  var code = resp.getResponseCode();
  var data = JSON.parse(resp.getContentText());

  if (code !== 200 || data.error) {
    var err = data.error
      ? (data.error.message || JSON.stringify(data.error))
      : ('HTTP ' + code);
    return { ok: false, error: 'Imagen step failed: ' + err };
  }

  var image_base64 = '';
  var mime_type    = 'image/png';
  try {
    var prediction = data.predictions && data.predictions[0];
    if (prediction && prediction.bytesBase64Encoded) {
      image_base64 = prediction.bytesBase64Encoded;
      mime_type    = prediction.mimeType || 'image/png';
    }
  } catch (ex) {
    return { ok: false, error: 'Could not extract image: ' + ex.message };
  }

  if (!image_base64) {
    return {
      ok:         false,
      error:      'Imagen returned no image data. Check model availability and API quota.',
      raw_imagen: JSON.stringify(data).slice(0, 500)
    };
  }

  return { ok: true, image_base64: image_base64, mime_type: mime_type };
}

/**
 * Calls Nano Banana Pro generateContent endpoint.
 * Used for use_case: 'lp', 'blog'
 */
function _generateNanoBanana(prompt, googleKey, dimensions) {
  var resp = UrlFetchApp.fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=' + googleKey,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify({
        contents:         [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
      }),
      muteHttpExceptions: true
    }
  );

  var code = resp.getResponseCode();
  var data = JSON.parse(resp.getContentText());

  if (code !== 200 || data.error) {
    var err = data.error
      ? (data.error.message || JSON.stringify(data.error))
      : ('HTTP ' + code);
    return { ok: false, error: 'Nano Banana step failed: ' + err };
  }

  var image_base64 = '';
  var mime_type    = 'image/png';
  try {
    var parts = data.candidates[0].content.parts;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].inlineData) {
        image_base64 = parts[i].inlineData.data;
        mime_type    = parts[i].inlineData.mimeType || 'image/png';
        break;
      }
    }
  } catch (e) {
    return { ok: false, error: 'Could not extract image: ' + e.message };
  }

  if (!image_base64) return { ok: false, error: 'Nano Banana returned no image data' };

  return { ok: true, image_base64: image_base64, mime_type: mime_type };
}

/**
 * Maps a WxH dimension string to the nearest Imagen 4 aspect ratio.
 */
function _sbGetAspectRatio(dimensions) {
  if (!dimensions) return '1:1';
  if (dimensions.indexOf('1200x630')  > -1) return '16:9';
  if (dimensions.indexOf('1080x1080') > -1) return '1:1';
  if (dimensions.indexOf('1080x1920') > -1) return '9:16';
  if (dimensions.indexOf('1000x1500') > -1) return '2:3';
  if (dimensions.indexOf('1920x1080') > -1) return '16:9';
  return '1:1';
}

// ── Replace Phone Screen ──────────────────────────────────────────────────────
/**
 * Replaces the phone screen in a generated image with a provided app screenshot.
 * Primary: Gemini 2.0 Flash image editing (two images → edited image).
 * Fallback: regenerate full image with explicit phone screen brief appended.
 *
 * body.base_image   — base64 of generated image (no data: prefix)
 * body.base_mime    — mime type of base image
 * body.screenshot   — base64 of app screenshot (no data: prefix)
 * body.shot_label   — descriptive label of screenshot (e.g. "Meal plan view")
 * body.image_brief  — original image brief (for fallback regen)
 * body.post_hook    — post hook text (for fallback regen)
 * body.post_body    — post body text (for fallback regen)
 * body.platform, icp, theme — campaign context
 */
function replacePhoneScreen(body) {
  try {
    var props     = PropertiesService.getScriptProperties();
    var googleKey = props.getProperty('GOOGLE_AI_API_KEY');
    if (!googleKey) return { ok: false, error: 'GOOGLE_AI_API_KEY not set' };

    var baseImg  = body.base_image  || '';
    var baseMime = body.base_mime   || 'image/png';
    var shotImg  = body.screenshot  || '';
    var shotLabel= body.shot_label  || 'app screen';
    if (!baseImg) return { ok: false, error: 'base_image is required' };
    if (!shotImg) return { ok: false, error: 'screenshot is required' };

    // ── Primary: Gemini 2.0 Flash image editing ───────────────────────────
    var editPrompt =
      'Replace the phone screen in this image with the provided app screenshot. ' +
      'Keep everything else in the image exactly the same — the person, their hands, ' +
      'the background, the lighting, and the food. ' +
      'Only change what is displayed on the phone screen. ' +
      'The replacement screen should match the angle and perspective of the phone.';

    var geminiResp = UrlFetchApp.fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + googleKey,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        payload: JSON.stringify({
          contents: [{
            parts: [
              { text: editPrompt },
              { inlineData: { mimeType: baseMime,   data: baseImg  } },
              { inlineData: { mimeType: 'image/png', data: shotImg } }
            ]
          }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
        }),
        muteHttpExceptions: true
      }
    );

    var gemCode = geminiResp.getResponseCode();
    var gemData = {};
    try { gemData = JSON.parse(geminiResp.getContentText()); } catch(e) {}

    if (gemCode === 200 && !gemData.error) {
      try {
        var parts = gemData.candidates[0].content.parts;
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].inlineData && parts[i].inlineData.data) {
            return {
              ok:           true,
              image_base64: parts[i].inlineData.data,
              mime_type:    parts[i].inlineData.mimeType || 'image/png',
              method:       'gemini-edit'
            };
          }
        }
      } catch(ex) {}
    }

    // ── Fallback: regenerate with explicit phone screen brief ─────────────
    var briefWithScreen =
      (body.image_brief || '') +
      '\n\nThe phone screen must show exactly this content: ' + shotLabel +
      '. The phone screen must be clearly visible and fill approximately 30% of the image width. ' +
      'Position the phone so the screen faces the camera directly.';

    var regenResult = generateImagePrompt({
      image_brief:   briefWithScreen,
      post_hook:     body.post_hook  || '',
      post_body:     body.post_body  || '',
      app_screen:    shotLabel,
      platform:      body.platform   || 'Facebook',
      icp:           body.icp        || 'super_mom',
      dimensions:    '1200x630px',
      use_case:      'social',
      theme:         body.theme      || ''
    });

    if (!regenResult.ok) {
      return { ok: false, error: 'Gemini edit failed (HTTP ' + gemCode + ') and fallback regen also failed: ' + regenResult.error };
    }

    return {
      ok:           true,
      image_base64: regenResult.image_base64,
      mime_type:    regenResult.mime_type,
      method:       'regen-fallback',
      fallback:     true
    };

  } catch(e) {
    return { ok: false, error: e.message };
  }
}

// ── Diagnostics ───────────────────────────────────────────────────────────────
// Run → _testImagePipeline → View Execution log
function _testImagePipeline() {
  // Test 1: social use case → Imagen 4
  Logger.log('=== TEST 1: social (Imagen 4) ===');
  var r1 = generateImagePrompt({
    image_brief: 'A tired mom opening the fridge at 6pm, looking relieved when she sees a meal plan on her phone',
    post_hook:   'You already know what\'s for dinner tonight.',
    platform:    'Instagram',
    icp:         'super_mom',
    dimensions:  '1080x1080px',
    use_case:    'social'
  });
  Logger.log('ok: '          + r1.ok);
  Logger.log('model_used: '  + r1.model_used);
  Logger.log('claude_brief: '+ (r1.claude_brief || '').slice(0, 150));
  Logger.log('gpt_prompt: '  + (r1.gpt_prompt   || '').slice(0, 150));
  Logger.log('image_base64 length: ' + (r1.image_base64 || '').length);
  if (!r1.ok) Logger.log('error: ' + r1.error);

  // Test 2: lp use case → Nano Banana Pro
  Logger.log('=== TEST 2: lp (Nano Banana Pro) ===');
  var r2 = generateImagePrompt({
    image_brief: 'Hero image for landing page — family gathered around a table with a wholesome weeknight dinner',
    post_hook:   '',
    platform:    'Web',
    icp:         'super_mom',
    dimensions:  '1200x630px',
    use_case:    'lp'
  });
  Logger.log('ok: '          + r2.ok);
  Logger.log('model_used: '  + r2.model_used);
  Logger.log('claude_brief: '+ (r2.claude_brief || '').slice(0, 150));
  Logger.log('gpt_prompt: '  + (r2.gpt_prompt   || '').slice(0, 150));
  Logger.log('image_base64 length: ' + (r2.image_base64 || '').length);
  if (!r2.ok) Logger.log('error: ' + r2.error);
}

// Run → _listGeminiModels → View Execution log to confirm available model names
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
