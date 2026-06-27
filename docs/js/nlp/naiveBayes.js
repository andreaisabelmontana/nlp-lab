/* Multinomial Naive Bayes text classifier with Laplace (add-one) smoothing.
   Pure, no DOM. Extracted from the Naive Bayes demo. */

export function nbTokens(s) {
  return s.toLowerCase().match(/[a-z']+/g) || [];
}

/* Train on [{t: text, y: label}, ...]. classes defaults to the two labels seen.
   Returns { prior, cond, vocab } with class priors and per-class word counts. */
export function trainNB(data, classes) {
  if (!classes) classes = [...new Set(data.map(d => d.y))];
  const prior = {}, cond = {}, vocab = new Set();
  classes.forEach(c => { prior[c] = 0; cond[c] = { total: 0, w: {} }; });

  data.forEach(d => {
    prior[d.y]++;
    nbTokens(d.t).forEach(w => {
      vocab.add(w);
      cond[d.y].w[w] = (cond[d.y].w[w] || 0) + 1;
      cond[d.y].total++;
    });
  });

  const N = data.length || 1;
  classes.forEach(c => { prior[c] = (prior[c] || 0) / N; });
  return { prior, cond, vocab, classes };
}

/* Predict a label for text. Returns { pred, probs, logScores }.
   Uses log-space accumulation and a softmax over class log-probabilities. */
export function predictNB(m, text) {
  const toks = nbTokens(text);
  const V = m.vocab.size;
  const classes = m.classes || Object.keys(m.cond);

  const logScores = {};
  for (const c of classes) {
    let lp = Math.log(m.prior[c] || 1e-9);
    toks.forEach(w => {
      const cnt = (m.cond[c].w[w] || 0) + 1;
      const denom = m.cond[c].total + V;
      lp += Math.log(cnt / denom);
    });
    logScores[c] = lp;
  }

  const max = Math.max(...classes.map(c => logScores[c]));
  const exp = {}; let Z = 0;
  classes.forEach(c => { exp[c] = Math.exp(logScores[c] - max); Z += exp[c]; });
  const probs = {};
  classes.forEach(c => { probs[c] = exp[c] / Z; });

  const pred = classes.reduce((a, b) => probs[b] > probs[a] ? b : a);
  return { pred, probs, logScores };
}
