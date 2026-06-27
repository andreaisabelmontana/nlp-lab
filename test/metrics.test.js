import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bleuScore, rougeScore } from '../docs/js/nlp/metrics.js';

const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

test('BLEU is 1 for an identical candidate and reference', () => {
  const { bleu, bp } = bleuScore('the cat sat on the mat', 'the cat sat on the mat');
  assert.ok(close(bleu, 1));
  assert.equal(bp, 1);
});

test('BLEU is 0 when there is no n-gram overlap', () => {
  assert.equal(bleuScore('alpha beta gamma delta', 'one two three four').bleu, 0);
});

test('BLEU unigram precision matches a hand count', () => {
  // candidate has 3 tokens, 2 of which appear in the reference
  const { precs } = bleuScore('the the cat', 'the cat sat');
  // clipped: "the" appears once in ref so counts once, "cat" once => 2/3
  assert.ok(close(precs[0], 2 / 3));
});

test('brevity penalty punishes short candidates', () => {
  const { bp } = bleuScore('the cat', 'the cat sat on the mat');
  assert.ok(bp < 1);
});

test('ROUGE-1 recall is 1 when the reference is fully covered', () => {
  const r = rougeScore('the cat sat quietly', 'the cat sat');
  assert.ok(close(r.r1, 1)); // every reference unigram appears in candidate
});

test('ROUGE-L F1 is 1 for identical strings', () => {
  const r = rougeScore('a b c d', 'a b c d');
  assert.ok(close(r.rl_f, 1));
});
