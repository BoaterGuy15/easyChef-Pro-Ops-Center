#!/usr/bin/env node
// Chains fix_ec2026001_banned_phrases passes until done:true && processed===0.
// Always passes start_offset:0 — the function re-scans from the beginning each call.
// Usage: node run-fix-chain.js [batch_size]

const https = require('https');
const http  = require('http');
const url   = require('url');

const DEPLOY_URL = 'https://script.google.com/macros/s/AKfycbxgwJT_MZigRzZ7sYuULrnxMB1ITfU_2TUCfpSfqJJDbgme1rTsWjf7RaiHQFQOJuOPbQ/exec';
const batchSize  = parseInt(process.argv[2]) || 40;

function gasPost(payload, cb) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8');
  function doRequest(targetUrl, method, postBody, hops) {
    if (hops > 10) return cb(new Error('Too many redirects'));
    const parsed = new url.URL(targetUrl);
    const lib    = parsed.protocol === 'https:' ? https : http;
    const opts   = { hostname: parsed.hostname, path: parsed.pathname + parsed.search, method: method, headers: {} };
    if (postBody) { opts.headers['Content-Type'] = 'text/plain'; opts.headers['Content-Length'] = postBody.length; }
    const req = lib.request(opts, function(res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); return doRequest(res.headers.location, 'GET', null, hops + 1);
      }
      const chunks = [];
      res.on('data', function(c) { chunks.push(c); });
      res.on('end', function() {
        try { cb(null, JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch(e) { cb(e); }
      });
    });
    req.on('error', cb);
    if (postBody) req.write(postBody);
    req.end();
  }
  doRequest(DEPLOY_URL, 'POST', body, 0);
}

let pass = 0;

function nextPass() {
  pass++;
  const payload = { action: 'fix_ec2026001_banned_phrases', start_offset: 0, batch_size: batchSize };
  process.stdout.write('[pass ' + pass + '] start_offset=0 batch=' + batchSize + ' ... ');

  gasPost(payload, function(err, data) {
    if (err) { console.error('ERROR:', err.message); process.exit(1); }
    const r = (data && data.result) ? data.result : data;
    if (!r || !r.ok) { console.error('GAS error:', JSON.stringify(r)); process.exit(1); }

    console.log('flagged:' + r.total + ' processed:' + r.processed + ' errors:' + (r.errors || 0) + ' done:' + r.done);

    // Stop when the re-scan finds 0 violations
    if (r.done && r.processed === 0) {
      console.log('\nAll violations cleared after ' + pass + ' pass(es).');
      process.exit(0);
    }
    // Also stop if done=true with processed>0 (last batch) then loop again to confirm
    nextPass();
  });
}

console.log('Starting banned-phrase fix chain. batch_size=' + batchSize);
nextPass();
