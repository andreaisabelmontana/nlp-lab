import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ngrams, ngramCounts, buildNgram, nextWordDist, sampleFromDist
} from '../docs/js/nlp/ngrams.js';

test('ngrams of a sequence are correct (bigrams)', () => {
  assert.deepEqual(
    ngrams(['a', 'b', 'c', 'd'], 2),
    [['a', 'b'], ['b', 'c'], ['c', 'd']]
  );
});

test('ngrams trigrams', () => {
  assert.deepEqual(
    ngrams(['a', 'b', 'c', 'd'], 3),
    [['a', 'b', 'c'], ['b', 'c', 'd']]
  );
});

test('ngramCounts tallies repeated grams', () => {
  const c = ngramCounts(['a', 'b', 'a', 'b', 'a'], 2);
  assert.equal(c['a b'], 2);
  assert.equal(c['b a'], 2);
});

test('buildNgram + nextWordDist give MLE probabilities', () => {
  // "the cat sat the cat ran": after context "the cat" we saw sat once, ran once
  const counts = buildNgram('the cat sat the cat ran', 3);
  const dist = nextWordDist(counts, 'the cat');
  const probs = Object.fromEntries(dist.map(d => [d.w, d.p]));
  assert.equal(probs['sat'], 0.5);
  assert.equal(probs['ran'], 0.5);
  // probabilities sum to 1
  const total = dist.reduce((s, d) => s + d.p, 0);
  assert.ok(Math.abs(total - 1) < 1e-12);
});

test('nextWordDist returns [] for an unseen context', () => {
  const counts = buildNgram('the cat sat', 3);
  assert.deepEqual(nextWordDist(counts, 'no such'), []);
});

test('sampleFromDist is deterministic given the rng', () => {
  const dist = [{ w: 'a', p: 0.3 }, { w: 'b', p: 0.7 }];
  assert.equal(sampleFromDist(dist, () => 0.1), 'a');
  assert.equal(sampleFromDist(dist, () => 0.9), 'b');
});
