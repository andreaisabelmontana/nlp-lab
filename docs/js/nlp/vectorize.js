/* Bag-of-words, term frequency, TF-IDF, cosine similarity, retrieval ranking.
   Pure, no DOM. Extracted from the TF-IDF & IR demo. */

import { contentTokens } from './tokenize.js';

/* Raw term counts (bag of words) for a token list. */
export function bagOfWords(toks) {
  const tf = {};
  toks.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  return tf;
}

/* Normalized term frequency: count / document length. */
export function termFrequency(toks) {
  const counts = bagOfWords(toks);
  const tf = {};
  const len = toks.length || 1;
  for (const t in counts) tf[t] = counts[t] / len;
  return tf;
}

/* Smoothed inverse document frequency over an array of token lists:
   idf(t) = log((N + 1) / (df(t) + 1)) + 1.
   A term occurring in every document gets idf = log((N+1)/(N+1)) + 1 = 1. */
export function inverseDocumentFrequency(docTokens) {
  const N = docTokens.length;
  const df = {};
  docTokens.forEach(toks => new Set(toks).forEach(t => { df[t] = (df[t] || 0) + 1; }));
  const idf = {};
  for (const t in df) idf[t] = Math.log((N + 1) / (df[t] + 1)) + 1;
  return idf;
}

/* Standard (textbook) inverse document frequency: idf(t) = log(N / df(t)).
   A term occurring in every document gets idf = log(1) = 0. The page uses the
   smoothed variant above; this is provided so the zero-IDF property is exact. */
export function idfStandard(docTokens) {
  const N = docTokens.length;
  const df = {};
  docTokens.forEach(toks => new Set(toks).forEach(t => { df[t] = (df[t] || 0) + 1; }));
  const idf = {};
  for (const t in df) idf[t] = Math.log(N / df[t]);
  return idf;
}

/* Sparse dot product of two {term: weight} maps. */
export function dot(a, b) {
  let s = 0;
  for (const t in a) if (b[t]) s += a[t] * b[t];
  return s;
}

/* L2 norm of a sparse {term: weight} map. */
export function norm(v) {
  return Math.sqrt(Object.values(v).reduce((s, x) => s + x * x, 0));
}

/* Cosine similarity of two sparse {term: weight} maps in [-1, 1].
   Returns 0 when either vector is the zero vector. */
export function cosineSparse(a, b) {
  const na = norm(a), nb = norm(b);
  if (na === 0 || nb === 0) return 0;
  return dot(a, b) / (na * nb);
}

/* Cosine similarity of two equal-length dense numeric arrays.
   Used by the word-embedding demo. */
export function cosine(a, b) {
  let d = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  const denom = Math.sqrt(na * nb);
  return denom === 0 ? 0 : d / denom;
}

/* Build TF-IDF vectors for a corpus of strings and rank them against a query.
   Returns { tfidf, idf, scores, vocab } where scores are cosine similarities
   sorted descending. tokenize defaults to the content-word tokenizer. */
export function computeTFIDF(docs, query = '', tokenize = contentTokens) {
  const docTokens = docs.map(d => tokenize(d));
  const idf = inverseDocumentFrequency(docTokens);

  const tfidf = docTokens.map(toks => {
    const tf = termFrequency(toks);
    const v = {};
    for (const t in tf) v[t] = tf[t] * (idf[t] || 0);
    return v;
  });

  const qToks = tokenize(query);
  const qTf = termFrequency(qToks);
  const qVec = {};
  for (const t in qTf) qVec[t] = qTf[t] * (idf[t] || 0);

  const scores = tfidf
    .map((d, i) => ({ i, score: cosineSparse(d, qVec) }))
    .sort((a, b) => b.score - a.score);

  return { tfidf, idf, scores, vocab: Object.keys(idf) };
}
