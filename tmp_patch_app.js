const fs = require('fs');
const path = require('path');

const b64 = fs.readFileSync(path.join(__dirname, 'tmp_app_b64.txt'), 'utf8').trim();
let text = Buffer.from(b64, 'base64').toString('utf8');

// Verify we decoded correctly
if (!text.includes('Nine capabilities in one system')) {
  console.error('ERROR: expected old body text not found');
  console.log('First 200 chars:', text.substring(0, 200));
  process.exit(1);
}

// Change 1: hero body text
text = text.replace(
  `Nine capabilities in one system, each solving a part of your food life —\n        scoring, personalizing, planning, shopping, tracking — all connected.\n        No other app does this.`,
  `Nine capabilities. One system. Scoring, personalizing, planning, shopping, tracking, all connected.\n        No other app does this.`
);

// Change 2 & 3: 1,000 -> 5,000 (both aria-label and h2)
text = text.replace(
  'aria-label="Join the first 1,000"',
  'aria-label="Join the first 5,000"'
);
text = text.replace(
  '>Join the first 1,000</h2>',
  '>Join the first 5,000</h2>'
);

// Change 4: body paragraph
text = text.replace(
  `The first 1,000 members get lifetime Pro access at 60% off, priority mobile\n        app access when we launch on iOS and Android, and a direct line to the\n        founding team.`,
  `Lifetime Pro at 60% off. Priority access when we launch on iOS and Android.\n        A direct line to the team building it.`
);

const outPath = path.join(__dirname, 'tmp_app_modified.txt');
fs.writeFileSync(outPath, text, 'utf8');

const checks = {
  'body changed': text.includes('Nine capabilities. One system.'),
  '1000 removed': !text.includes('1,000'),
  '5000 present': text.includes('5,000'),
  'lifetime pro': text.includes('Lifetime Pro at 60% off'),
};

console.log('Checks:', JSON.stringify(checks, null, 2));
console.log('Output length:', text.length);
console.log('Written to:', outPath);
