const GAS_URL = 'https://script.google.com/macros/s/AKfycbz1MwFg8ujR1QNMDiggRTGqAKYLfTYW6FvfPiAv7-L8DWQKurHSJ_mYGr9h0eqQ5jRBrg/exec';
const FIREBASE = 'https://easychef-prod----production.web.app';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // /api/ → proxy to GAS (server-to-server, no CORS restriction)
    if (path.startsWith('/api/')) {
      try {
        const bodyText = await request.text();
        const gasResp = await fetch(GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyText,
        });
        const text = await gasResp.text();
        return new Response(text, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...CORS_HEADERS,
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }
    }

    // Firebase-hosted routes
    const toFirebase = [
      '/lp/', '/coming-soon', '/thank-you', '/robots.txt',
      '/llms.txt', '/pricing.md', '/alpha-questionnaire', '/alpha-feedback',
      '/config.js', '/cockpit', '/assets/',
    ].some(p => path === p || path.startsWith(p));

    if (toFirebase) {
      return fetch(FIREBASE + path + url.search);
    }

    // Everything else — pass through
    return fetch(request);
  },
};
