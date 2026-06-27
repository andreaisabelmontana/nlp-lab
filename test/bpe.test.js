import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trainBPE, bpeApply } from '../docs/js/nlp/bpe.js';

test('BPE merges the most frequent pair first', () => {
  // "ab" is the most frequent adjacent pair in the corpus
  const { merges } = trainBPE('ab ab ab ac', 1);
  assert.deepEqual(merges[0], ['a', 'b']);
});

test('BPE merge produces the expected merged token', () => {
  // repeated word "low" -> first merge "l"+"o" = "lo"
  const { merges, splits } = trainBPE('low low low lower', 1);
  assert.deepEqual(merges[0], ['l', 'o']);
  assert.deepEqual(splits['low'], ['lo', 'w', '</w>']);
});

test('applying learned merges tokenizes a word consistently', () => {
  const { merges } = trainBPE('low low low low lowest', 3);
  // after 3 merges "low" collapses toward a single subword
  const toks = bpeApply('low', merges);
  assert.deepEqual(toks, ['low</w>']);
});

test('learned vocab contains the end-of-word marker on final tokens', () => {
  const { vocab } = trainBPE('low low lower', 2);
  assert.ok(vocab.some(t => t.includes('</w>')));
});

test('bpeApply leaves an unseen word as characters when no merges fire', () => {
  const { merges } = trainBPE('aaaa', 1); // only learns the pair "a a"
  const toks = bpeApply('xyz', merges);
  assert.deepEqual(toks, ['x', 'y', 'z', '</w>']);
});
