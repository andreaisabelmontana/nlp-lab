import { test } from 'node:test';
import assert from 'node:assert/strict';
import { softmax, matVec, scaledDotProductAttention } from '../docs/js/nlp/attention.js';

const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const sum = a => a.reduce((s, x) => s + x, 0);

test('softmax sums to 1', () => {
  const p = softmax([1, 2, 3, 4]);
  assert.ok(close(sum(p), 1));
});

test('softmax is monotonic: larger input -> larger probability', () => {
  const p = softmax([0.5, 1.0, 2.0, 3.0]);
  for (let i = 1; i < p.length; i++) assert.ok(p[i] > p[i - 1]);
});

test('softmax is numerically stable for large inputs', () => {
  const p = softmax([1000, 1001, 1002]);
  assert.ok(close(sum(p), 1));
  assert.ok(p.every(x => Number.isFinite(x)));
});

test('softmax of a constant vector is uniform', () => {
  const p = softmax([5, 5, 5, 5]);
  p.forEach(x => assert.ok(close(x, 0.25)));
});

test('matVec computes matrix times vector', () => {
  const M = [[1, 2], [3, 4]];
  assert.deepEqual(matVec(M, [1, 1]), [3, 7]);
});

test('scaled dot-product attention rows each sum to 1', () => {
  // identity projections so we test the attention mechanics directly
  const I = [[1, 0], [0, 1]];
  const E = [[1, 0], [0, 1], [1, 1]];
  const { attn, Q, K, V } = scaledDotProductAttention(E, I, I, I);
  assert.equal(attn.length, 3);
  attn.forEach(row => {
    assert.equal(row.length, 3);
    assert.ok(close(sum(row), 1));
    assert.ok(row.every(x => x >= 0));
  });
  // identity projections leave Q/K/V equal to the embeddings
  assert.deepEqual(Q, E);
  assert.deepEqual(K, E);
  assert.deepEqual(V, E);
});

test('a token attends most strongly to itself under identity projections', () => {
  const I = [[1, 0], [0, 1]];
  const E = [[1, 0], [0, 1]]; // orthogonal tokens
  const { attn } = scaledDotProductAttention(E, I, I, I);
  // token 0 dotted with itself > with the orthogonal token 1
  assert.ok(attn[0][0] > attn[0][1]);
  assert.ok(attn[1][1] > attn[1][0]);
});
