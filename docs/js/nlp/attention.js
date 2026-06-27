/* Softmax and scaled dot-product self-attention.
   Pure, no DOM. Extracted from the Transformer Attention demo. */

/* Numerically stable softmax over an array; result sums to 1. */
export function softmax(arr) {
  const m = Math.max(...arr);
  const ex = arr.map(x => Math.exp(x - m));
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map(x => x / s);
}

/* Matrix (rows x cols) times a column vector. */
export function matVec(M, v) {
  return M.map(row => row.reduce((s, m, i) => s + m * v[i], 0));
}

/* Scaled dot-product self-attention over row-vector embeddings E.
   Projects with Wq/Wk/Wv (each dim x dim), scores = QKᵀ/√d, then softmax
   per row. Returns { Q, K, V, attn } with attn[i] summing to 1. */
export function scaledDotProductAttention(E, Wq, Wk, Wv) {
  const dim = E[0].length;
  const Q = E.map(e => matVec(Wq, e));
  const K = E.map(e => matVec(Wk, e));
  const V = E.map(e => matVec(Wv, e));
  const sqd = Math.sqrt(dim);
  const scores = Q.map(q => K.map(k => q.reduce((s, qi, i) => s + qi * k[i], 0) / sqd));
  const attn = scores.map(softmax);
  return { Q, K, V, attn };
}
