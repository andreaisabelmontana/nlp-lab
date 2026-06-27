/* Levenshtein edit distance with full DP matrix, backtrace path and ops.
   Pure, no DOM. Extracted from the Edit Distance demo. */

export function editDistance(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    const c = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
  }

  // back-trace one optimal alignment
  const path = new Set();
  const ops = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    path.add(i + ',' + j);
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && d[i][j] === d[i - 1][j - 1]) {
      ops.unshift({ op: 'match', c: a[i - 1] }); i--; j--;
    } else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) {
      ops.unshift({ op: 'sub', from: a[i - 1], to: b[j - 1] }); i--; j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      ops.unshift({ op: 'del', c: a[i - 1] }); i--;
    } else {
      ops.unshift({ op: 'ins', c: b[j - 1] }); j--;
    }
  }
  path.add('0,0');

  return { d, path, ops, dist: d[m][n] };
}
