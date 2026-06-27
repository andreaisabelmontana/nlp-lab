/* Tokenization, sentence splitting, normalization.
   Pure functions, no DOM. Extracted from the Preprocessing demo. */

export const STOPWORDS = new Set(
  ("a an the and or but is are was were be been being have has had do does did " +
   "will would could should may might can this that these those i you he she it " +
   "we they him her them my your his its our their as at by for in of on to with from"
  ).split(' ')
);

export const LEMMA_MAP = {
  was: 'be', were: 'be', is: 'be', are: 'be', been: 'be', am: 'be',
  has: 'have', had: 'have', having: 'have',
  did: 'do', does: 'do', done: 'do', doing: 'do',
  better: 'good', best: 'good', worse: 'bad', worst: 'bad',
  mice: 'mouse', children: 'child', men: 'man', women: 'woman',
  feet: 'foot', teeth: 'tooth', geese: 'goose', people: 'person',
  ran: 'run', running: 'run', went: 'go', gone: 'go', going: 'go',
  came: 'come', coming: 'come',
  jumping: 'jump', jumped: 'jump', eating: 'eat', ate: 'eat', eaten: 'eat',
  flying: 'fly', flew: 'fly',
  dogs: 'dog', cats: 'cat', foxes: 'fox', boxes: 'box', wishes: 'wish', kisses: 'kiss'
};

/* Split into word tokens and standalone punctuation marks. */
export function tokenize(s) {
  return s.match(/[\w']+|[.,!?;]/g) || [];
}

/* Split text into sentences on terminal punctuation. */
export function sentSplit(s) {
  return s.match(/[^.!?]+[.!?]+/g) || (s.trim() ? [s.trim()] : []);
}

/* Lowercase + keep only alphabetic words longer than 2 chars and drop stopwords.
   This is the tokenizer the TF-IDF / topic / summarization demos use. */
export function contentTokens(s, stop = STOPWORDS) {
  return (s.toLowerCase().match(/[a-z]+/g) || [])
    .filter(w => !stop.has(w) && w.length > 2);
}

/* A lightweight Porter-style suffix stripper. */
export function porterLite(w) {
  if (w.length < 4) return w;
  for (const s of ['ational', 'ization', 'ousness', 'iveness', 'fulness',
                   'tional', 'alize', 'iciti', 'ation', 'ement', 'ness',
                   'able', 'ible', 'ance', 'ence', 'ment', 'sion', 'tion']) {
    if (w.endsWith(s) && w.length - s.length >= 3) return w.slice(0, -s.length);
  }
  for (const s of ['ies', 'ied', 'ing', 'ly', 'ed', 'es', 's']) {
    if (w.endsWith(s) && w.length - s.length >= 3) return w.slice(0, -s.length);
  }
  return w;
}

/* Dictionary-first lemmatizer with morphological fallbacks. */
export function lemmatize(w, map = LEMMA_MAP) {
  if (map[w]) return map[w];
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ses') || w.endsWith('xes') || w.endsWith('zes') ||
      w.endsWith('ches') || w.endsWith('shes')) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  return w;
}
