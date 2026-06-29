# NLP Lab

Interactive NLP course lab: 23 live demos from preprocessing to transformers.

The site (`docs/`) is a static, dependency-free page that runs on GitHub Pages.
The deterministic NLP algorithms behind the demos are extracted into small,
framework-free ES modules under [`docs/js/nlp/`](docs/js/nlp/) and covered by
unit tests that run on Node's built-in test runner — no npm dependencies.

The page imports these modules directly, so the tested code and the code that
drives the visualizations are the same code.

## Algorithms extracted and tested

| Module | Exports | What is proven |
| --- | --- | --- |
| [`tokenize.js`](docs/js/nlp/tokenize.js) | `tokenize`, `sentSplit`, `contentTokens`, `porterLite`, `lemmatize`, `STOPWORDS` | a known sentence splits into the expected tokens; punctuation is kept separately; stopwords/short words are dropped; suffix stripping and irregular/regular lemmas |
| [`ngrams.js`](docs/js/nlp/ngrams.js) | `ngrams`, `ngramCounts`, `buildNgram`, `nextWordDist`, `sampleFromDist` | n-grams of a sequence are correct; an n-gram LM yields MLE next-word probabilities that sum to 1; sampling is deterministic given the RNG |
| [`vectorize.js`](docs/js/nlp/vectorize.js) | `bagOfWords`, `termFrequency`, `inverseDocumentFrequency`, `idfStandard`, `cosine`, `cosineSparse`, `computeTFIDF` | TF and TF-IDF match hand-computed values on a tiny corpus; a term in every document has **standard IDF = 0**; cosine is **1** for identical vectors, **0** for orthogonal, **higher** for more-similar documents, and ranks the most relevant doc first |
| [`editDistance.js`](docs/js/nlp/editDistance.js) | `editDistance` | Levenshtein matches known pairs (`kitten → sitting = 3`); 0 for identical strings; symmetric; empty-string edge cases |
| [`bpe.js`](docs/js/nlp/bpe.js) | `trainBPE`, `bpeApply` | the most frequent pair merges first; a merge produces the expected merged token; applying merges tokenizes consistently |
| [`attention.js`](docs/js/nlp/attention.js) | `softmax`, `matVec`, `scaledDotProductAttention` | softmax **sums to 1**, is **monotonic** and numerically stable; each scaled dot-product attention row sums to 1 and is non-negative |
| [`metrics.js`](docs/js/nlp/metrics.js) | `bleuScore`, `rougeScore` | BLEU is 1 for an exact match, 0 with no overlap; unigram precision matches a hand count; brevity penalty < 1 for short candidates; ROUGE-1/ROUGE-L checks |
| [`naiveBayes.js`](docs/js/nlp/naiveBayes.js) | `trainNB`, `predictNB`, `nbTokens` | class priors equal empirical frequencies; predicted probabilities sum to 1; obvious spam/ham are classified correctly; Laplace smoothing handles unseen words |

## Run the demos

The page is fully static. Serve `docs/` and open `index.html`:

```sh
cd docs
python -m http.server 8000
# open http://localhost:8000/index.html
```

`course.html` and `project.html` are the editorial course pages and are served
as-is.

## Run the tests

Requires Node 18+ (developed on Node 24). No install step, no dependencies.

```sh
node --test
```

Real output:

```
ℹ tests 52
ℹ suites 0
ℹ pass 52
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

All 52 tests pass.

## Layout

```
docs/
  index.html          interactive demos (imports docs/js/nlp/*)
  course.html         course outline (editorial)
  project.html        worked example (editorial)
  js/app.js           DOM wiring; imports the tested cores
  js/nlp/*.js         framework-free, DOM-free NLP modules
test/                 node:test suites, one per module
package.json          "type": "module", "test": "node --test"
```

## Coursework

Hands-on projects I built for this course, each a standalone repo:
[Document Classifier](https://github.com/andreaisabelmontana/document-classifier),
[NLP Alignment Drift](https://github.com/andreaisabelmontana/nlp-alignment-drift),
[Notification Triage](https://github.com/andreaisabelmontana/notification-triage),
[Persuasion Tactics](https://github.com/andreaisabelmontana/persuasion-tactics),
[Semantic Engagement](https://github.com/andreaisabelmontana/semantic-engagement),
[TruthLens](https://github.com/andreaisabelmontana/truthlens),
[Stash](https://github.com/andreaisabelmontana/stash),
[Rental Finder](https://github.com/andreaisabelmontana/rental-finder) and
[Delve](https://github.com/andreaisabelmontana/delve).

## License

MIT — see [LICENSE](LICENSE).
