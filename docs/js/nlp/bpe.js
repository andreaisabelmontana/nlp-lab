/* Byte-Pair Encoding: learn merges from a corpus and apply them.
   Pure, no DOM. Extracted from the BPE Tokenizer demo. */

const SEP = '​'; // zero-width pair separator used while counting

/* Learn up to nMerges byte-pair merges from a text corpus.
   Returns { merges, vocab, splits } where merges is an ordered list of
   [a, b] pairs and splits maps each word to its final token list. */
export function trainBPE(text, nMerges) {
  const words = (text.toLowerCase().match(/[a-z]+/g) || []);
  const wordCounts = {};
  words.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });

  // each word starts as its characters plus an end-of-word marker
  let splits = {};
  for (const w in wordCounts) splits[w] = w.split('').concat(['</w>']);

  const merges = [];
  for (let step = 0; step < nMerges; step++) {
    const pairs = {};
    for (const w in wordCounts) {
      const s = splits[w], c = wordCounts[w];
      for (let i = 0; i < s.length - 1; i++) {
        const p = s[i] + SEP + s[i + 1];
        pairs[p] = (pairs[p] || 0) + c;
      }
    }
    if (!Object.keys(pairs).length) break;

    let best = null, bestC = -1;
    for (const p in pairs) if (pairs[p] > bestC) { bestC = pairs[p]; best = p; }
    const [a, b] = best.split(SEP);
    merges.push([a, b]);

    const next = {};
    for (const w in splits) next[w] = mergePair(splits[w], a, b);
    splits = next;
  }

  const vocab = new Set();
  for (const w in splits) splits[w].forEach(t => vocab.add(t));
  return { merges, vocab: [...vocab], splits };
}

/* Apply one [a, b] -> ab merge across a token list. */
function mergePair(s, a, b) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    if (i < s.length - 1 && s[i] === a && s[i + 1] === b) { out.push(a + b); i += 2; }
    else { out.push(s[i]); i++; }
  }
  return out;
}

/* Tokenize a single word by applying an ordered list of merges. */
export function bpeApply(word, merges) {
  let s = word.split('').concat(['</w>']);
  for (const [a, b] of merges) s = mergePair(s, a, b);
  return s;
}
