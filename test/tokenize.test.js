import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  tokenize, sentSplit, contentTokens, STOPWORDS,
  porterLite, lemmatize
} from '../docs/js/nlp/tokenize.js';

test('tokenize splits a known sentence into the expected tokens', () => {
  assert.deepEqual(
    tokenize('The cat sat on the mat.'),
    ['The', 'cat', 'sat', 'on', 'the', 'mat', '.']
  );
});

test('tokenize keeps punctuation as standalone tokens', () => {
  assert.deepEqual(tokenize('Hi, world!'), ['Hi', ',', 'world', '!']);
});

test('sentSplit splits on terminal punctuation', () => {
  assert.deepEqual(
    sentSplit('One. Two! Three?').map(s => s.trim()),
    ['One.', 'Two!', 'Three?']
  );
});

test('contentTokens lowercases, drops stopwords and short words', () => {
  // "the", "is", "a" are stopwords; "of" is length 2 -> dropped
  assert.deepEqual(
    contentTokens('The Cat is a friend of mine'),
    ['cat', 'friend', 'mine']
  );
  assert.ok(STOPWORDS.has('the'));
});

test('porterLite strips common suffixes', () => {
  assert.equal(porterLite('running'), 'runn');
  assert.equal(porterLite('happiness'), 'happi'); // -ness
  assert.equal(porterLite('cat'), 'cat');          // too short, unchanged
});

test('lemmatize maps irregulars and regular plurals', () => {
  assert.equal(lemmatize('was'), 'be');
  assert.equal(lemmatize('mice'), 'mouse');
  assert.equal(lemmatize('cats'), 'cat');
  assert.equal(lemmatize('parties'), 'party');
});
