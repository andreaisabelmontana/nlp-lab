/* N-grams and an n-gram (Markov) language model. Pure, no DOM. */

/* Count n-grams of a token sequence, returned as a {gram: count} map.
   Each gram is the n tokens joined by a single space. */
export function ngramCounts(toks, n) {
  const c = {};
  for (let i = 0; i <= toks.length - n; i++) {
    const k = toks.slice(i, i + n).join(' ');
    c[k] = (c[k] || 0) + 1;
  }
  return c;
}

/* List the contiguous n-grams of a sequence in order (with repeats). */
export function ngrams(toks, n) {
  const out = [];
  for (let i = 0; i <= toks.length - n; i++) out.push(toks.slice(i, i + n));
  return out;
}

/* Build an n-gram language model from a corpus string.
   Pads with <s> and a trailing </s>; returns context -> {word: count}. */
export function buildNgram(corpus, n) {
  const toks = ['<s>', '<s>', '<s>']
    .concat(corpus.toLowerCase().match(/[a-z]+/g) || [])
    .concat(['</s>']);
  const counts = {};
  for (let i = 0; i <= toks.length - n; i++) {
    const ctx = toks.slice(i, i + n - 1).join(' ');
    const w = toks[i + n - 1];
    counts[ctx] = counts[ctx] || {};
    counts[ctx][w] = (counts[ctx][w] || 0) + 1;
  }
  return counts;
}

/* Maximum-likelihood next-word distribution for a context, sorted by prob. */
export function nextWordDist(counts, ctx) {
  const c = counts[ctx];
  if (!c) return [];
  const total = Object.values(c).reduce((s, x) => s + x, 0);
  return Object.entries(c)
    .map(([w, k]) => ({ w, p: k / total, k }))
    .sort((a, b) => b.p - a.p);
}

/* Sample a word from a distribution given an rng in [0,1). */
export function sampleFromDist(dist, rng = Math.random) {
  let r = rng(), acc = 0;
  for (const x of dist) { acc += x.p; if (r <= acc) return x.w; }
  return dist[dist.length - 1].w;
}
