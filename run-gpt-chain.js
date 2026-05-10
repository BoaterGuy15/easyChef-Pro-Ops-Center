#!/usr/bin/env node
// Chains generate_ec2026001_gpt_briefs batches until done.
// Usage: node run-gpt-chain.js [start_offset] [batch_size]

const https = require('https');
const http  = require('http');
const url   = require('url');

const DEPLOY_URL = 'https://script.google.com/macros/s/AKfycbxgwJT_MZigRzZ7sYuULrnxMB1ITfU_2TUCfpSfqJJDbgme1rTsWjf7RaiHQFQOJuOPbQ/exec';

let startOffset = parseInt(process.argv[2]) || 0;
const batchSize = parseInt(process.argv[3]) || 40;

function gasPost(payload, cb) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8');

  function doRequest(targetUrl, method, postBody, hops) {
    if (hops > 10) return cb(new Error('Too many redirects'));
    const parsed = new url.URL(targetUrl);
    const lib    = parsed.protocol === 'https:' ? https : http;
    const opts   = {
      hostname: parsed.hostname,
      path:     parsed.pathname + parsed.search,
      method:   method,
      headers:  {}
    };
    if (postBody) {
      opts.headers['Content-Type']   = 'text/plain';
      opts.headers['Content-Length'] = postBody.length;
    }
    const req = lib.request(opts, function(res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return doRequest(res.headers.location, 'GET', null, hops + 1);
      }
      const chunks = [];
      res.on('data', function(c) { chunks.push(c); });
      res.on('end', function() {
        try { cb(null, JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
        catch(e) { cb(e); }
      });
    });
    req.on('error', cb);
    if (postBody) req.write(postBody);
    req.end();
  }

  doRequest(DEPLOY_URL, 'POST', body, 0);
}

let batchNum = 0;
let totalProcessed = startOffset; // test batch already covered 0-4 if starting at 5

function nextBatch() {
  batchNum++;
  const payload = { action: 'generate_ec2026001_gpt_briefs', start_offset: startOffset, batch_size: batchSize };
  process.stdout.write('[batch ' + batchNum + '] offset=' + startOffset + ' ... ');

  gasPost(payload, function(err, data) {
    if (err) { console.error('ERROR:', err.message); process.exit(1); }

    const r = (data && data.result) ? data.result : data;
    if (!r || !r.ok) {
      console.error('GAS error:', JSON.stringify(r));
      process.exit(1);
    }

    totalProcessed += (r.processed || 0);
    console.log('processed:' + r.processed + ' errors:' + (r.errors || 0) +
                ' total_flagged:' + r.total + ' cumulative:' + totalProcessed);

    if (r.errors > 0) console.log('  !! errors in batch — check GAS logs');

    if (r.done || r.next_offset >= r.total) {
      console.log('\nDone. All ' + r.total + ' posts processed.');
      process.exit(0);
    }

    startOffset = r.next_offset;
    nextBatch();
  });
}

console.log('Starting GPT brief chain. start_offset=' + startOffset + ' batch_size=' + batchSize);
nextBatch();
