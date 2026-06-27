/* BLEU and ROUGE generation metrics. Pure, no DOM.
   Extracted from the BLEU & ROUGE demo. */

import { ngramCounts } from './ngrams.js';

function words(s) {
  return s.toLowerCase().match(/[a-z]+/g) || [];
}

/* BLEU-4 with brevity penalty over candidate vs reference strings.
   Returns { bleu, precs, bp } where precs are clipped n-gram precisions
   for n = 1..4 and bp is the brevity penalty. */
export function bleuScore(cand, ref) {
  const cToks = words(cand);
  const rToks = words(ref);
  if (!cToks.length) return { bleu: 0, precs: [], bp: 0 };

  const precs = [];
  for (let n = 1; n <= 4; n++) {
    const cC = ngramCounts(cToks, n);
    const rC = ngramCounts(rToks, n);
    let match = 0, total = 0;
    for (const k in cC) { match += Math.min(cC[k], rC[k] || 0); total += cC[k]; }
    precs.push(total ? match / total : 0);
  }

  const bp = cToks.length > rToks.length
    ? 1
    : Math.exp(1 - rToks.length / Math.max(cToks.length, 1));

  let logSum = 0, valid = 0;
  precs.forEach(p => { if (p > 0) { logSum += Math.log(p); valid++; } });
  const geo = valid ? Math.exp(logSum / 4) : 0;

  return { bleu: bp * geo, precs, bp };
}

/* ROUGE-1, ROUGE-2 (recall) and ROUGE-L (LCS precision/recall/F1). */
export function rougeScore(cand, ref) {
  const cToks = words(cand);
  const rToks = words(ref);

  const rougeN = n => {
    const cC = ngramCounts(cToks, n), rC = ngramCounts(rToks, n);
    let match = 0, totalR = 0;
    for (const k in rC) { match += Math.min(rC[k], cC[k] || 0); totalR += rC[k]; }
    return totalR ? match / totalR : 0;
  };

  // longest common subsequence for ROUGE-L
  const m = cToks.length, n = rToks.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    if (cToks[i - 1] === rToks[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
    else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
  }
  const lcs = dp[m][n];
  const p = m ? lcs / m : 0, r = n ? lcs / n : 0;
  const f = (p + r) ? 2 * p * r / (p + r) : 0;

  return { r1: rougeN(1), r2: rougeN(2), rl_p: p, rl_r: r, rl_f: f };
}
