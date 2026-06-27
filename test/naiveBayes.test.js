import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trainNB, predictNB, nbTokens } from '../docs/js/nlp/naiveBayes.js';

const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

const DATA = [
  { t: 'win free money now', y: 'spam' },
  { t: 'claim your free prize', y: 'spam' },
  { t: 'cheap meds order now', y: 'spam' },
  { t: 'lunch meeting tomorrow', y: 'ham' },
  { t: 'please review my report', y: 'ham' },
  { t: 'see you at the office', y: 'ham' }
];

test('nbTokens lowercases and keeps apostrophes', () => {
  assert.deepEqual(nbTokens("Don't Click HERE"), ["don't", 'click', 'here']);
});

test('class priors are the empirical class frequencies', () => {
  const m = trainNB(DATA);
  assert.ok(close(m.prior.spam, 0.5));
  assert.ok(close(m.prior.ham, 0.5));
});

test('predicted probabilities sum to 1', () => {
  const m = trainNB(DATA);
  const { probs } = predictNB(m, 'free money prize');
  assert.ok(close(probs.spam + probs.ham, 1));
});

test('classifies an obvious spam message as spam', () => {
  const m = trainNB(DATA);
  const { pred, probs } = predictNB(m, 'win free money prize now');
  assert.equal(pred, 'spam');
  assert.ok(probs.spam > probs.ham);
});

test('classifies an obvious ham message as ham', () => {
  const m = trainNB(DATA);
  const { pred } = predictNB(m, 'please review my report before the meeting');
  assert.equal(pred, 'ham');
});

test('unseen words do not crash and rely on the prior (Laplace smoothing)', () => {
  const m = trainNB(DATA);
  const { probs } = predictNB(m, 'xyzzy quux');
  assert.ok(Number.isFinite(probs.spam) && Number.isFinite(probs.ham));
  assert.ok(close(probs.spam, 0.5)); // symmetric data + only unseen words
});
