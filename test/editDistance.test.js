import { test } from 'node:test';
import assert from 'node:assert/strict';
import { editDistance } from '../docs/js/nlp/editDistance.js';

test('Levenshtein distance matches known pairs', () => {
  assert.equal(editDistance('kitten', 'sitting').dist, 3);
  assert.equal(editDistance('flaw', 'lawn').dist, 2);
  assert.equal(editDistance('sunday', 'saturday').dist, 3);
});

test('distance is 0 for identical strings', () => {
  assert.equal(editDistance('same', 'same').dist, 0);
});

test('distance to/from empty string equals the other length', () => {
  assert.equal(editDistance('', 'abc').dist, 3);
  assert.equal(editDistance('abcd', '').dist, 4);
});

test('it is symmetric', () => {
  assert.equal(
    editDistance('kitten', 'sitting').dist,
    editDistance('sitting', 'kitten').dist
  );
});

test('backtrace ops reconstruct the target length', () => {
  const { ops, dist } = editDistance('kitten', 'sitting');
  // three non-match ops for kitten->sitting
  const edits = ops.filter(o => o.op !== 'match').length;
  assert.equal(edits, dist);
});
