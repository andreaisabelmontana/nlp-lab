import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  bagOfWords, termFrequency, inverseDocumentFrequency, idfStandard,
  cosine, cosineSparse, computeTFIDF
} from '../docs/js/nlp/vectorize.js';

const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

// keep every word so "the" is present in all documents
const words = s => s.toLowerCase().match(/[a-z]+/g) || [];

test('bagOfWords counts terms', () => {
  assert.deepEqual(bagOfWords(['a', 'b', 'a']), { a: 2, b: 1 });
});

test('termFrequency normalizes by document length', () => {
  const tf = termFrequency(['a', 'b', 'a']); // len 3
  assert.ok(close(tf.a, 2 / 3));
  assert.ok(close(tf.b, 1 / 3));
});

test('TF matches hand-computed values on a tiny corpus', () => {
  // "the cat dog" -> each of 3 distinct words has tf 1/3
  const tf = termFrequency(words('the cat dog'));
  assert.ok(close(tf.the, 1 / 3));
  assert.ok(close(tf.cat, 1 / 3));
  assert.ok(close(tf.dog, 1 / 3));
});

test('a term in every document has IDF ~0 (standard idf)', () => {
  const docs = ['the cat', 'the dog', 'the cat dog'].map(words);
  const idf = idfStandard(docs);            // log(N/df)
  assert.ok(close(idf.the, 0));             // df=3, N=3 -> log(1)=0
  assert.ok(idf.cat > 0);                   // df=2, N=3 -> log(3/2) > 0
  assert.ok(close(idf.cat, Math.log(3 / 2)));
});

test('smoothed IDF matches hand-computed values', () => {
  const docs = ['the cat', 'the dog', 'the cat dog'].map(words);
  const idf = inverseDocumentFrequency(docs); // log((N+1)/(df+1)) + 1
  // the: df=3, N=3 -> log(4/4)+1 = 1
  assert.ok(close(idf.the, 1));
  // cat: df=2 -> log(4/3)+1
  assert.ok(close(idf.cat, Math.log(4 / 3) + 1));
});

test('TF-IDF weight matches hand-computed value', () => {
  const docs = ['the cat', 'the dog', 'the cat dog'];
  const { tfidf } = computeTFIDF(docs, '', words);
  // doc index 2 = "the cat dog": tfidf(cat) = (1/3) * (log(4/3)+1)
  const expected = (1 / 3) * (Math.log(4 / 3) + 1);
  assert.ok(close(tfidf[2].cat, expected));
  // "the" appears in every doc; smoothed idf = 1, tf = 1/3
  assert.ok(close(tfidf[2].the, 1 / 3));
});

test('cosine is 1 for identical vectors', () => {
  assert.ok(close(cosine([1, 2, 3], [1, 2, 3]), 1));
  assert.ok(close(cosine([2, 4, 6], [1, 2, 3]), 1)); // scale-invariant
});

test('cosine is 0 for orthogonal vectors', () => {
  assert.ok(close(cosine([1, 0], [0, 1]), 0));
  assert.ok(close(cosine([1, 0, 0], [0, 3, 4]), 0));
});

test('cosine returns 0 for a zero vector (no NaN)', () => {
  assert.equal(cosine([0, 0], [1, 2]), 0);
});

test('cosine is higher for more-similar documents', () => {
  // query "cat" should rank "the cat" and "the cat dog" above "the dog"
  const docs = ['the cat', 'the dog', 'the cat dog'];
  const { tfidf } = computeTFIDF(docs, '', words);
  const q = computeTFIDF([...docs, 'cat'], '', words).tfidf[3]; // query vector
  const simCat = cosineSparse(tfidf[0], q);   // "the cat"
  const simDog = cosineSparse(tfidf[1], q);   // "the dog"
  assert.ok(simCat > simDog, `expected cat-doc (${simCat}) > dog-doc (${simDog})`);
});

test('computeTFIDF ranks the most relevant document first', () => {
  const docs = [
    'natural language processing',
    'deep neural networks',
    'language models and language tasks'
  ];
  const { scores } = computeTFIDF(docs, 'language', words);
  // doc 2 mentions "language" twice and is the best match
  assert.equal(scores[0].i, 2);
  assert.ok(scores[0].score >= scores[1].score);
});
