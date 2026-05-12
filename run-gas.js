#!/usr/bin/env node
// Fires a single doPost action against the GAS web app.
// GAS returns a 302 redirect to the actual JSON response — follow it.
// Usage: node run-gas.js '{"action":"assign_ec2026001_dl_ids"}'

const https = require('https');
const http  = require('http');
const url   = require('url');

const DEPLOY_URL = 'https://script.google.com/macros/s/AKfycbw6iivAUaWfjsguHPQQ-2t8c64EEkJm5f_0RC5B8aJnZH1ru54_QL3gGg7nxdTz2BzXtw/exec';

const payload = process.argv[2];
if (!payload) { console.error('Usage: node run-gas.js \'{"action":"..."}\' '); process.exit(1); }

console.log('[GAS] POST', JSON.stringify(JSON.parse(payload), null, 2));

function fetch(targetUrl, method, body, redirectCount) {
  redirectCount = redirectCount || 0;
  if (redirectCount > 10) { console.error('Too many redirects'); process.exit(1); }

  const parsed = new url.URL(targetUrl);
  const lib    = parsed.protocol === 'https:' ? https : http;
  const postBody = body ? Buffer.from(body, 'utf8') : null;

  const opts = {
    hostname: parsed.hostname,
    path:     parsed.pathname + parsed.search,
    method:   method,
    headers:  {}
  };

  if (postBody) {
    opts.headers['Content-Type']   = 'text/plain';
    opts.headers['Content-Length'] = postBody.length;
  }

  return new Promise(function(resolve, reject) {
    const req = lib.request(opts, function(res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location;
        res.resume();
        resolve(fetch(loc, 'GET', null, redirectCount + 1));
        return;
      }
      const chunks = [];
      res.on('data', function(c) { chunks.push(c); });
      res.on('end',  function() { resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') }); });
    });
    req.on('error', reject);
    if (postBody) req.write(postBody);
    req.end();
  });
}

fetch(DEPLOY_URL, 'POST', payload).then(function(r) {
  console.log('\n[GAS] HTTP', r.status);
  try {
    const obj = JSON.parse(r.body);
    console.log(JSON.stringify(obj, null, 2));
    if (obj.result) {
      console.log('\n--- RESULT ---');
      console.log(JSON.stringify(obj.result, null, 2));
    }
  } catch(e) {
    console.log(r.body.slice(0, 2000));
  }
}).catch(function(e) {
  console.error('[GAS] ERROR:', e.message);
  process.exit(1);
});
