const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ops = require('../kit/liquid-glass-ops.js');

function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}
function contrast(a, b) {
  const left = lum(a);
  const right = lum(b);
  const [hi, lo] = left > right ? [left, right] : [right, left];
  return (hi + 0.05) / (lo + 0.05);
}
function token(css, name) {
  const match = css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(match, `missing token ${name}`);
  return match[1].toLowerCase();
}
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'kit/liquid-glass.css'), 'utf8');
const overlay = fs.readFileSync(path.join(root, 'kit/liquid-glass-overlay.css'), 'utf8');
const cssCode = stripComments(css);
const overlayCode = stripComments(overlay);

assert.equal(contrast(token(css, '--ink-3'), '#ffffff') >= 4.5, true);
assert.equal(contrast(token(css, '--ink-3'), token(css, '--well')) >= 4.5, true);
assert.equal(contrast(token(css, '--ink'), token(css, '--bg')) >= 4.5, true);
assert.equal(contrast(token(css, '--ok-ink'), '#ffffff') >= 4.5, true);
assert.equal(contrast(token(css, '--warn-ink'), '#ffffff') >= 4.5, true);
assert.equal(contrast(token(css, '--err-ink'), '#ffffff') >= 4.5, true);
assert.equal(contrast(token(css, '--warn'), '#ffffff') >= 3, true);
assert.equal(contrast(token(css, '--ok'), '#ffffff') >= 3, true);
assert.match(css, /font-size:\s*16px/);
assert.match(css, /--motion-duration:\s*200ms/);
assert.doesNotMatch(cssCode, /transition:\s*all/);
assert.doesNotMatch(cssCode, /scroll-behavior:\s*smooth/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.match(css, /data-motion="reduced"/);
assert.match(css, /data-effects="reduced"/);
assert.match(css, /forced-colors:\s*active/);
assert.doesNotMatch(overlayCode, /backdrop-filter/);
assert.match(overlay, /prefers-reduced-motion:\s*reduce/);

for (const value of ['12abc', '1,500', 'NaN', 'Infinity', '21', '-1', '']) {
  assert.throws(() => ops.parsePressureBar(value), value);
}
assert.equal(ops.parsePressureBar(' 6.25 '), 6.25);
assert.equal(ops.parsePressureBar('0'), 0);
assert.equal(ops.parsePressureBar('20'), 20);
assert.equal(ops.parsePressureBar('-0'), 0);
assert.equal(ops.normalizeIdentifier('  st-05 '), 'ST-05');

const start = ops.commandReducer({ phase: 'idle' }, { type: 'submit', requestId: 'r1', assetId: 'P-204' });
const accepted = ops.commandReducer(start, { type: 'accepted', requestId: 'r1' });
assert.equal(accepted.phase, 'accepted');
const unknown = ops.commandReducer(accepted, { type: 'timeout', requestId: 'r1' });
assert.equal(unknown.phase, 'unknown');
assert.equal(ops.commandReducer(unknown, { type: 'accepted', requestId: 'r1' }).phase, 'unknown');
assert.deepEqual(ops.commandReducer(unknown, { type: 'verified', requestId: 'other', verifiedAt: 't' }), unknown);
const verified = ops.commandReducer(unknown, { type: 'verified', requestId: 'r1', verifiedAt: 't' });
assert.equal(verified.phase, 'verified');
assert.deepEqual(ops.commandReducer(verified, { type: 'timeout', requestId: 'r1' }), verified);
assert.equal(ops.commandLabel(start), 'Requesting');
assert.match(ops.commandLabel(accepted), /Verification pending/);
assert.match(ops.commandLabel(unknown), /r1/);

const missing = ops.readingStatus({ value: null, unit: 'bar', sampledAt: 0, quality: 'good' }, 1000, true);
assert.equal(missing.display, 'Unavailable');
assert.notEqual(missing.display, 0);
const stale = ops.readingStatus({ value: 6.2, unit: 'bar', sampledAt: 0, quality: 'good', staleAfterMs: 10000 }, 11000, true);
assert.equal(stale.status, 'Stale');
assert.equal(stale.display, 6.2);
const skew = ops.readingStatus({ value: 1, unit: 'bar', sampledAt: 5000, quality: 'good' }, 0, true);
assert.equal(skew.status, 'Clock mismatch');
const down = ops.readingStatus({ value: 1, unit: 'bar', sampledAt: 0, quality: 'good' }, 1000, false);
assert.equal(down.status, 'Disconnected');

assert.equal(ops.formatProgress(3, 5).label, '3 of 5 required checks complete');
assert.equal(ops.formatProgress(1, null).label, 'Checking requirements…');
assert.equal(ops.formatProgress(0, 0).label, 'No checks required');
assert.equal(ops.formatProgress(9, 5).value, 5);

const htmlFiles = [
  'kit/template-app.html', 'kit/template-login.html', 'kit/template-hero.html', 'kit/demo-system.html', 'kit/demo-buttons.html',
];
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  assert.doesNotMatch(html, /tabindex\s*=\s*["'][1-9]/i, file);
  assert.doesNotMatch(html, /<button(?![^>]*\btype=)/i, file);
}
const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');
const guide = fs.readFileSync(path.join(root, 'references/liquid-glass-design-guidelines.md'), 'utf8');
const checklist = fs.readFileSync(path.join(root, 'references/checklist.md'), 'utf8');
assert.match(skill, /liquid-glass-design-guidelines\.md/);
assert.match(skill, /non-negotiable/i);
assert.match(guide, /31-principle/);
assert.match(guide, /Mandatory motion/);
assert.match(checklist, /does not follow the skill/);
assert.match(css, /@keyframes lg-fade/);
assert.match(css, /@keyframes lg-enter/);
assert.doesNotMatch(cssCode, /\*\s*,\s*\*::before[\s\S]{0,80}animation:\s*none\s*!important/);
assert.match(fs.readFileSync(path.join(root, 'kit/template-login.html'), 'utf8'), /data-lg-scene/);
assert.match(fs.readFileSync(path.join(root, 'kit/template-hero.html'), 'utf8'), /data-lg-scene/);
assert.match(fs.readFileSync(path.join(root, 'kit/src/liquid-glass-scene.mjs'), 'utf8'), /prefers-reduced-motion/);
assert.match(fs.readFileSync(path.join(root, 'kit/liquid-glass-motion.js'), 'utf8'), /LiquidGlass\.feedback|feedback,/);

console.log('Guideline unit and static checks passed.');
