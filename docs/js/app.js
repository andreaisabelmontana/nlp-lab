/* =========================================================================
   NLP LAB — interactive demos for an NLP course
   All demos are vanilla JS, no dependencies, runs static on GitHub Pages.
   ========================================================================= */

/* ---------- shared helpers ---------- */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const h  = (t, a={}, c=[]) => {
  const e = document.createElement(t);
  for (const k in a) {
    if (k === 'class') e.className = a[k];
    else if (k.startsWith('on')) e[k] = a[k];
    else e.setAttribute(k, a[k]);
  }
  for (const ch of (Array.isArray(c)?c:[c])) {
    if (ch == null) continue;
    e.appendChild(typeof ch === 'string' ? document.createTextNode(ch) : ch);
  }
  return e;
};
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const round = (x, d=3) => {
  const p = Math.pow(10, d);
  return Math.round(x * p) / p;
};

/* ---------- theme toggle ---------- */
const themeBtn = $('#themeToggle');
themeBtn.onclick = () => {
  const cur = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', cur === 'light' ? '' : 'light');
};

/* ---------- nav highlight on scroll ---------- */
const navLinks = $$('#nav a');
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href')));
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active',
        a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-30% 0px -65% 0px' });
sections.forEach(s => s && io.observe(s));

/* =========================================================================
   1. PIPELINE
   ========================================================================= */
const PIPELINE_INFO = [
  {
    title: 'Data Collection & Cleaning',
    body: 'Gather raw text from web scrapes, PDFs, transcripts, logs. Strip HTML, fix encodings, deduplicate, filter explicit content. Garbage in = garbage out — most production NLP teams spend more time here than on modeling.',
    ex: 'Example: BeautifulSoup → strip HTML → ftfy → fix mojibake → deduplicate by MinHash.'
  },
  {
    title: 'Preprocessing',
    body: 'Segment into sentences, tokenize into words/subwords, lowercase, remove stopwords, normalize (stemming/lemmatization). For modern transformer pipelines this is dramatically simpler: a BPE tokenizer does most of the work.',
    ex: 'Classical: NLTK / spaCy.  Modern: 🤗 tokenizers, SentencePiece.'
  },
  {
    title: 'Feature Engineering',
    body: 'Turn tokens into numbers. Bag-of-words, TF-IDF, word embeddings, contextual embeddings from a pre-trained encoder, or hand-crafted features (lexicon counts, POS tag ratios). Choice of features dominates classical NLP accuracy.',
    ex: 'sklearn TfidfVectorizer → 50k-dim sparse vector.  BERT [CLS] → 768-dim dense vector.'
  },
  {
    title: 'Modeling',
    body: 'Pick an inductive bias matched to the task. Naive Bayes & logistic regression for fast linear baselines; HMM/CRF for sequence labeling; CNN/RNN/Transformer for representation learning; LLM fine-tuning or prompting for zero/few-shot.',
    ex: 'Sentiment classifier: LogReg on TF-IDF (~92%) → distilBERT fine-tuned (~95%).'
  },
  {
    title: 'Monitoring & Evaluation',
    body: 'Choose metrics that match the task: accuracy for balanced classification, F1 for imbalanced, BLEU/ROUGE for generation, exact-match/F1 for QA. In production: watch for drift, hallucinations, and out-of-distribution inputs.',
    ex: 'Hold-out test set + cross-validation + a live shadow eval on production traffic.'
  },
];
const pipe = $('#pipe'), pipeDetail = $('#pipeDetail');
function renderPipe(i=0) {
  pipe.querySelectorAll('.pipe-step').forEach((s,j)=>s.classList.toggle('active', j===i));
  const d = PIPELINE_INFO[i];
  pipeDetail.innerHTML = `<h3>${d.title}</h3><p>${d.body}</p><p class="muted"><b>↳</b> ${d.ex}</p>`;
}
pipe.querySelectorAll('.pipe-step').forEach((s,i)=> s.onclick = ()=>renderPipe(i));
renderPipe(0);

/* =========================================================================
   2. HISTORY TIMELINE
   ========================================================================= */
const ERAS = [
  { year:'1950s', name:'Foundations', items:[
    ['1950','Turing — "Can machines think?" Turing test as operational definition of intelligence.'],
    ['1954','Georgetown–IBM machine-translation demo. Russian→English, 60 sentences, hand-coded rules. Hype begins.'],
    ['1957','Chomsky publishes <i>Syntactic Structures</i> — generative grammar, formal language theory.']
  ]},
  { year:'1960s-70s', name:'Symbolic / Rules', items:[
    ['1966','ELIZA chatbot mimics a Rogerian therapist with pattern matching. People felt understood.'],
    ['1966','ALPAC report — MT is "hopeless". Funding crashes.'],
    ['1972','SHRDLU understands blocks-world commands using symbolic AI. Brittle outside its domain.']
  ]},
  { year:'1980s', name:'Statistical Turn', items:[
    ['1980s','Probabilistic methods replace hand-written rules. HMMs for speech and POS tagging.'],
    ['1988','IBM Candide statistical MT — translation as a noisy channel problem.'],
    ['1990','Wall Street Journal corpus released — POS tagging benchmark.']
  ]},
  { year:'1990s-00s', name:'ML & Corpora', items:[
    ['1993','Penn Treebank — syntactically annotated corpus enables supervised parsing.'],
    ['1995','Support Vector Machines applied to text classification.'],
    ['2003','Bengio — Neural probabilistic language model (forerunner of word embeddings).']
  ]},
  { year:'2010s', name:'Deep Learning', items:[
    ['2013','word2vec (Mikolov) — dense word vectors learnt by predicting context. <code>king-man+woman≈queen</code>.'],
    ['2014','Seq2seq + attention (Bahdanau) — neural MT overtakes statistical MT.'],
    ['2017','<b>Attention Is All You Need</b> — the Transformer. No recurrence, just self-attention.'],
    ['2018','BERT — pretraining + fine-tuning paradigm sweeps benchmarks.']
  ]},
  { year:'2020s', name:'Foundation Models', items:[
    ['2020','GPT-3, 175B params, few-shot prompting works.'],
    ['2022','ChatGPT — RLHF makes LLMs conversational. NLP enters mainstream.'],
    ['2023+','Multimodal, agentic LLMs. Long context, tool use, reasoning models.'],
    ['Today','The frontier: efficient inference, alignment, hallucination control, scientific reasoning.']
  ]},
];
const tl = $('#timeline'), tlDetail = $('#tlDetail');
ERAS.forEach((e,i)=>{
  const el = h('div', {class:'tl-era'+(i===0?' active':''), 'data-i':i},
    [h('div',{class:'tl-year'},e.year), h('div',{class:'tl-name'},e.name)]);
  el.onclick = ()=>renderEra(i);
  tl.appendChild(el);
});
function renderEra(i) {
  $$('.tl-era').forEach((x,j)=>x.classList.toggle('active', j===i));
  const e = ERAS[i];
  tlDetail.innerHTML = `<h3>${e.year} — ${e.name}</h3>
    <ul class="tl-list">${e.items.map(([y,t])=>`<li><b>${y}</b>${t}</li>`).join('')}</ul>`;
}
renderEra(0);

/* =========================================================================
   3. PREPROCESSING
   ========================================================================= */
const STOPWORDS = new Set("a an the and or but is are was were be been being have has had do does did will would could should may might can this that these those i you he she it we they him her them my your his its our their as at by for in of on to with from".split(' '));
const LEMMA_MAP = {
  was:'be', were:'be', is:'be', are:'be', been:'be', am:'be',
  has:'have', had:'have', having:'have',
  did:'do', does:'do', done:'do', doing:'do',
  better:'good', best:'good', worse:'bad', worst:'bad',
  mice:'mouse', children:'child', men:'man', women:'woman', feet:'foot', teeth:'tooth', geese:'goose', people:'person',
  ran:'run', running:'run', went:'go', gone:'go', going:'go', came:'come', coming:'come',
  jumping:'jump', jumped:'jump', eating:'eat', ate:'eat', eaten:'eat', flying:'fly', flew:'fly',
  dogs:'dog', cats:'cat', foxes:'fox', boxes:'box', wishes:'wish', kisses:'kiss'
};
function porterLite(w) {
  if (w.length < 4) return w;
  for (const s of ['ational','ization','ousness','iveness','fulness','tional','alize','iciti','ation','ement','ation','ness','able','ible','ance','ence','ment','sion','tion']) {
    if (w.endsWith(s) && w.length - s.length >= 3) return w.slice(0, -s.length);
  }
  for (const s of ['ies','ied','ing','ly','ed','es','s']) {
    if (w.endsWith(s) && w.length - s.length >= 3) return w.slice(0, -s.length);
  }
  return w;
}
function lemmatize(w) {
  if (LEMMA_MAP[w]) return LEMMA_MAP[w];
  if (w.endsWith('ies') && w.length > 4) return w.slice(0,-3)+'y';
  if (w.endsWith('ses') || w.endsWith('xes') || w.endsWith('zes') || w.endsWith('ches') || w.endsWith('shes')) return w.slice(0,-2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0,-1);
  if (w.endsWith('ing') && w.length > 5) return w.slice(0,-3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0,-2);
  return w;
}
function tokenize(s){ return s.match(/[\w']+|[.,!?;]/g) || []; }
function sentSplit(s){ return s.match(/[^.!?]+[.!?]+/g) || (s.trim() ? [s.trim()] : []); }

function renderPP() {
  const txt = $('#ppInput').value;
  const opts = {
    lower: $('#ppLower').checked,
    punct: $('#ppPunct').checked,
    stop: $('#ppStop').checked,
    stem: $('#ppStem').checked,
    lemma: $('#ppLemma').checked,
  };
  const sents = sentSplit(txt);
  const tokens = tokenize(txt);
  $('#ppSents').innerHTML = '';
  sents.forEach(s=>$('#ppSents').appendChild(h('div',{class:'chip token'}, s.trim())));
  $('#ppTokens').innerHTML = '';
  tokens.forEach(t=>$('#ppTokens').appendChild(h('div',{class:'chip'}, t)));

  const norm = tokens.map(t => {
    let w = t;
    if (opts.lower) w = w.toLowerCase();
    return w;
  }).filter(w => opts.punct ? /[\w']/.test(w) : true);

  $('#ppNorm').innerHTML = '';
  norm.forEach(t => $('#ppNorm').appendChild(h('div',{class:'chip'}, t)));

  const finalEl = $('#ppFinal'); finalEl.innerHTML='';
  norm.forEach(t => {
    if (opts.stop && STOPWORDS.has(t)) {
      finalEl.appendChild(h('div',{class:'chip stop'}, t));
      return;
    }
    let w = t, cls = 'chip token';
    if (opts.lemma) { const l = lemmatize(t); if (l !== t) { w = l; cls = 'chip lemma'; } }
    if (opts.stem)  { const s = porterLite(opts.lemma? w : t); if (s !== (opts.lemma?w:t)) { w = s; cls = 'chip stem'; } }
    finalEl.appendChild(h('div',{class:cls}, w));
  });
}
['ppInput','ppLower','ppPunct','ppStop','ppStem','ppLemma'].forEach(id=>{
  document.getElementById(id).addEventListener('input', renderPP);
  document.getElementById(id).addEventListener('change', renderPP);
});
renderPP();

/* =========================================================================
   4. REGEX
   ========================================================================= */
function escapeHTML(s){ return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function runRegex(){
  const pat = $('#rxPat').value;
  const flags = $('#rxFlags').value;
  const txt = $('#rxText').value;
  let re; try { re = new RegExp(pat, flags); } catch(e) {
    $('#rxOut').textContent = '⚠ Invalid pattern: ' + e.message;
    $('#rxMatches').innerHTML = '';
    return;
  }
  const matches = [];
  if (flags.includes('g')) {
    let m; while ((m = re.exec(txt)) !== null) {
      matches.push({s:m.index, e:m.index+m[0].length, t:m[0]});
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  } else { const m = re.exec(txt); if (m) matches.push({s:m.index, e:m.index+m[0].length, t:m[0]}); }
  let out = '', cursor = 0;
  matches.forEach(m=>{
    out += escapeHTML(txt.slice(cursor, m.s));
    out += '<span class="rx-hit">' + escapeHTML(m.t) + '</span>';
    cursor = m.e;
  });
  out += escapeHTML(txt.slice(cursor));
  $('#rxOut').innerHTML = out || '<span class="muted">No matches.</span>';
  const list = $('#rxMatches'); list.innerHTML='';
  matches.forEach(m=>list.appendChild(h('span',{class:'chip'}, m.t)));
  if (!matches.length) list.appendChild(h('span',{class:'muted'}, `${matches.length} matches`));
  else list.insertBefore(h('span',{class:'muted', style:'align-self:center;margin-right:8px;'}, `${matches.length} matches:`), list.firstChild);
}
['rxPat','rxFlags','rxText'].forEach(id=>document.getElementById(id).addEventListener('input', runRegex));
$$('.rx-presets button').forEach(b=>b.onclick=()=>{
  const {p,f} = JSON.parse(b.dataset.rx);
  $('#rxPat').value = p; $('#rxFlags').value = f; runRegex();
});
runRegex();

/* =========================================================================
   5. TF-IDF
   ========================================================================= */
let TF_DOCS = [
  "Natural language processing enables computers to understand human language.",
  "Machine learning models can classify text and recognize entities.",
  "Deep learning and neural networks power modern language models.",
  "Information retrieval ranks documents by relevance to a query.",
  "The transformer architecture revolutionized natural language tasks."
];
function tfTokenize(s){
  return (s.toLowerCase().match(/[a-z]+/g) || []).filter(w => !STOPWORDS.has(w) && w.length>2);
}
function computeTFIDF(docs, query) {
  const docTokens = docs.map(tfTokenize);
  const N = docs.length;
  const df = {};
  docTokens.forEach(toks => new Set(toks).forEach(t => df[t] = (df[t]||0)+1));
  const idf = {}; for (const t in df) idf[t] = Math.log((N+1)/(df[t]+1)) + 1;
  const tfidf = docTokens.map(toks => {
    const tf = {}; toks.forEach(t => tf[t]=(tf[t]||0)+1);
    const v = {}; for (const t in tf) v[t] = (tf[t]/toks.length) * (idf[t]||0);
    return v;
  });
  const qToks = tfTokenize(query);
  const qTf = {}; qToks.forEach(t=>qTf[t]=(qTf[t]||0)+1);
  const qVec = {}; for (const t in qTf) qVec[t] = (qTf[t]/Math.max(qToks.length,1)) * (idf[t]||0);
  const norm = v => Math.sqrt(Object.values(v).reduce((s,x)=>s+x*x,0));
  const dot = (a,b)=>{let s=0;for(const t in a)if(b[t])s+=a[t]*b[t];return s;};
  const qn = norm(qVec) || 1e-9;
  const scores = tfidf.map((d,i)=>({i, score: dot(d, qVec)/((norm(d)||1e-9)*qn)}));
  scores.sort((a,b)=>b.score-a.score);
  return { tfidf, idf, scores, vocab: Object.keys(idf) };
}
function renderTFDocs(){
  const c = $('#tfDocs'); c.innerHTML='';
  TF_DOCS.forEach((d,i)=>{
    const row = h('div',{class:'tf-doc'},[
      h('input',{value:d, oninput:e=>{TF_DOCS[i]=e.target.value; renderTFResults();}}),
      h('button',{onclick:()=>{TF_DOCS.splice(i,1); renderTFDocs(); renderTFResults();}}, '×')
    ]);
    c.appendChild(row);
  });
}
$('#tfAdd').onclick = ()=>{ TF_DOCS.push('New document text here.'); renderTFDocs(); renderTFResults(); };
function renderTFResults(){
  const q = $('#tfQuery').value;
  const r = computeTFIDF(TF_DOCS, q);
  const out = $('#tfResults'); out.innerHTML='';
  r.scores.forEach(s=>{
    out.appendChild(h('div',{class:'tf-result'},[
      h('div',{},[h('div',{class:'doc-id'},`Doc ${s.i+1}`), h('div',{class:'doc-snip'}, TF_DOCS[s.i])]),
      h('div',{class:'tf-score'}, round(s.score,3).toString())
    ]));
  });
  const top = r.vocab.map(t=>({t, idf:r.idf[t], max:Math.max(...r.tfidf.map(d=>d[t]||0))}))
                     .sort((a,b)=>b.max-a.max).slice(0,12);
  const mat = $('#tfMatrix'); mat.innerHTML='';
  const tbl = h('table');
  const head = h('tr',{},[h('th',{},'term'), h('th',{},'idf'), ...TF_DOCS.map((_,i)=>h('th',{},`d${i+1}`))]);
  tbl.appendChild(head);
  top.forEach(({t, idf})=>{
    const row = h('tr',{},[h('td',{class:'term'}, t), h('td',{},round(idf,2).toString())]);
    r.tfidf.forEach(d=>{
      const v = d[t]||0;
      row.appendChild(h('td',{class:v>0?'hot':''}, v?round(v,2).toString():'·'));
    });
    tbl.appendChild(row);
  });
  mat.appendChild(tbl);
}
$('#tfQuery').addEventListener('input', renderTFResults);
renderTFDocs(); renderTFResults();

/* =========================================================================
   6. NAIVE BAYES
   ========================================================================= */
let NB_DATA = [
  {t:"win a free iphone click here", y:"spam"},
  {t:"free entry in our prize draw call now", y:"spam"},
  {t:"urgent please click this link to claim money", y:"spam"},
  {t:"congratulations you won the lottery", y:"spam"},
  {t:"get cheap meds online order now", y:"spam"},
  {t:"hey are we still meeting for lunch tomorrow", y:"ham"},
  {t:"please review my pull request when you have time", y:"ham"},
  {t:"the team meeting is moved to thursday afternoon", y:"ham"},
  {t:"thanks for the notes from class yesterday", y:"ham"},
  {t:"can you send me the report by friday", y:"ham"},
];
function nbTokens(s){ return (s.toLowerCase().match(/[a-z']+/g) || []); }
function trainNB(data){
  const classes = ['spam','ham'];
  const prior = {}, cond = {}, vocab = new Set();
  classes.forEach(c=>{prior[c]=0; cond[c]={total:0, w:{}};});
  data.forEach(d=>{
    prior[d.y]++;
    nbTokens(d.t).forEach(w=>{
      vocab.add(w);
      cond[d.y].w[w] = (cond[d.y].w[w]||0)+1;
      cond[d.y].total++;
    });
  });
  const N = data.length;
  classes.forEach(c=>{prior[c] = (prior[c]||0)/N;});
  return {prior, cond, vocab};
}
function predictNB(m, text){
  const toks = nbTokens(text);
  const V = m.vocab.size;
  const logScores = {}; const contributions = {};
  for (const c of ['spam','ham']) {
    let lp = Math.log(m.prior[c] || 1e-9);
    contributions[c] = [{w:'prior', s:lp}];
    toks.forEach(w=>{
      const cnt = (m.cond[c].w[w] || 0) + 1;
      const denom = m.cond[c].total + V;
      const term = Math.log(cnt/denom);
      lp += term;
      contributions[c].push({w, s:term});
    });
    logScores[c] = lp;
  }
  const max = Math.max(logScores.spam, logScores.ham);
  const expS = Math.exp(logScores.spam - max);
  const expH = Math.exp(logScores.ham - max);
  const probs = { spam: expS/(expS+expH), ham: expH/(expS+expH) };
  const pred = probs.spam > probs.ham ? 'spam' : 'ham';
  return {pred, probs, logScores, contributions};
}
function renderNBTrain(){
  const c = $('#nbTrain'); c.innerHTML='';
  NB_DATA.forEach((d,i)=>{
    const row = h('div',{class:'nb-row'},[
      h('input',{type:'text', value:d.t, oninput:e=>{NB_DATA[i].t=e.target.value; renderNBPred();}}),
      h('select',{onchange:e=>{NB_DATA[i].y=e.target.value; renderNBPred();}}, [
        h('option',{value:'spam'+(d.y==='spam'?' ':' '), selected:d.y==='spam'?'selected':null}, 'spam'),
        h('option',{value:'ham', selected:d.y==='ham'?'selected':null}, 'ham'),
      ]),
      h('button',{onclick:()=>{NB_DATA.splice(i,1); renderNBTrain(); renderNBPred();}}, '×')
    ]);
    const sel = row.querySelector('select');
    sel.innerHTML = '';
    ['spam','ham'].forEach(v=>{
      const o = h('option',{value:v}, v);
      if (v===d.y) o.selected = true;
      sel.appendChild(o);
    });
    c.appendChild(row);
  });
}
$('#nbAdd').onclick = ()=>{NB_DATA.push({t:'sample message',y:'ham'}); renderNBTrain(); renderNBPred();};
function renderNBPred(){
  const m = trainNB(NB_DATA);
  const r = predictNB(m, $('#nbTest').value);
  $('#nbPred').innerHTML =
    `<span class="lab ${r.pred}">${r.pred.toUpperCase()}</span>
     <span class="muted">P(spam)=${round(r.probs.spam,3)} · P(ham)=${round(r.probs.ham,3)}</span>`;

  const math = $('#nbMath'); math.innerHTML='';
  ['spam','ham'].forEach(c=>{
    const win = c === r.pred;
    let line = `<div ${win?'style="color:var(--accent-2);font-weight:700"':''}>log P(${c} | text) = `;
    line += r.contributions[c].slice(0,8).map(x=>
      `<span class="${x.s>=Math.log(0.05)?'pos':'neg'}">${round(x.s,2)}</span>·${x.w}`
    ).join(' + ');
    if (r.contributions[c].length>8) line += ` + …`;
    line += ` = <b>${round(r.logScores[c],2)}</b></div>`;
    math.innerHTML += line;
  });

  // top words per class
  const out = $('#nbWords'); out.innerHTML='';
  ['spam','ham'].forEach(c=>{
    const card = h('div',{class:'card'},[h('h4',{}, c.toUpperCase()+' indicators')]);
    const list = h('div',{class:'chips'});
    const totalC = m.cond[c].total + m.vocab.size;
    const totalO = m.cond[c==='spam'?'ham':'spam'].total + m.vocab.size;
    const score = [...m.vocab].map(w=>{
      const p1 = ((m.cond[c].w[w]||0)+1)/totalC;
      const p2 = ((m.cond[c==='spam'?'ham':'spam'].w[w]||0)+1)/totalO;
      return {w, s: Math.log(p1/p2)};
    }).sort((a,b)=>b.s-a.s).slice(0,10);
    score.forEach(x=>list.appendChild(h('div',{class:'chip'}, `${x.w} (${round(x.s,2)})`)));
    card.appendChild(list);
    out.appendChild(card);
  });
  try { if (typeof renderCM === 'function') renderCM(); } catch(e){ /* CM not initialized yet */ }
}
$('#nbTest').addEventListener('input', renderNBPred);
renderNBTrain(); renderNBPred();

/* =========================================================================
   7. LOGISTIC REGRESSION
   ========================================================================= */
const lrCv = $('#lrCanvas'), lrCtx = lrCv.getContext('2d');
const lrSig = $('#lrSig'), lrSigCtx = lrSig.getContext('2d');
let LR_POINTS = [
  {x:-1.5,y:1.2,c:0},{x:-2,y:0.5,c:0},{x:-1,y:2,c:0},{x:-0.5,y:1.8,c:0},{x:-2.5,y:1.5,c:0},
  {x:1.5,y:-1.2,c:1},{x:2,y:-0.5,c:1},{x:1,y:-2,c:1},{x:0.5,y:-1.8,c:1},{x:2.5,y:-1.5,c:1},
];
let lrW1=1, lrW2=-1, lrB=0;
function lrToCanvas(x,y){ return [210 + x*60, 210 - y*60]; }
function lrFromCanvas(px,py){ return [(px-210)/60, (210-py)/60]; }
function drawLR(){
  lrCtx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-2');
  lrCtx.fillRect(0,0,420,420);
  // decision boundary: w1*x + w2*y + b = 0
  lrCtx.strokeStyle = 'rgba(124,92,255,.35)';
  lrCtx.lineWidth = 1;
  for (let i=-3;i<=3;i++){
    const [a,] = lrToCanvas(i,0); lrCtx.beginPath(); lrCtx.moveTo(a,0); lrCtx.lineTo(a,420); lrCtx.stroke();
    const [,b] = lrToCanvas(0,i); lrCtx.beginPath(); lrCtx.moveTo(0,b); lrCtx.lineTo(420,b); lrCtx.stroke();
  }
  lrCtx.strokeStyle = '#7c5cff'; lrCtx.lineWidth = 1.5;
  lrCtx.beginPath(); lrCtx.moveTo(210,0); lrCtx.lineTo(210,420); lrCtx.moveTo(0,210); lrCtx.lineTo(420,210); lrCtx.stroke();
  // probability heatmap (sparse)
  for (let px=0; px<420; px+=12){
    for (let py=0; py<420; py+=12){
      const [x,y] = lrFromCanvas(px+6, py+6);
      const z = lrW1*x + lrW2*y + lrB;
      const p = 1/(1+Math.exp(-z));
      lrCtx.fillStyle = p>0.5
        ? `rgba(0,212,255,${(p-0.5)*0.6})`
        : `rgba(255,93,108,${(0.5-p)*0.6})`;
      lrCtx.fillRect(px,py,12,12);
    }
  }
  // boundary line
  lrCtx.strokeStyle = '#fff'; lrCtx.lineWidth = 2;
  lrCtx.beginPath();
  for (let px=0; px<=420; px+=2){
    const [xa] = lrFromCanvas(px,0);
    const ya = (-lrW1*xa - lrB) / (lrW2 || 1e-9);
    const [,py] = lrToCanvas(0, ya);
    if (px===0) lrCtx.moveTo(px,py); else lrCtx.lineTo(px,py);
  }
  lrCtx.stroke();
  // points
  LR_POINTS.forEach(p=>{
    const [px,py] = lrToCanvas(p.x,p.y);
    lrCtx.fillStyle = p.c===0 ? '#ff5d6c' : '#00d4ff';
    lrCtx.strokeStyle = '#fff'; lrCtx.lineWidth = 1.5;
    lrCtx.beginPath();
    if (p.c===0){ // star
      for (let i=0;i<10;i++){
        const r = i%2 ? 4 : 9;
        const a = -Math.PI/2 + i*Math.PI/5;
        const x = px + r*Math.cos(a), y = py + r*Math.sin(a);
        i?lrCtx.lineTo(x,y):lrCtx.moveTo(x,y);
      }
    } else { // triangle
      lrCtx.moveTo(px, py-9); lrCtx.lineTo(px+9, py+7); lrCtx.lineTo(px-9, py+7);
    }
    lrCtx.closePath(); lrCtx.fill(); lrCtx.stroke();
  });
  // metrics
  let loss = 0, correct = 0;
  LR_POINTS.forEach(p=>{
    const z = lrW1*p.x + lrW2*p.y + lrB;
    const pr = 1/(1+Math.exp(-z));
    loss += -(p.c*Math.log(pr+1e-9) + (1-p.c)*Math.log(1-pr+1e-9));
    if ((pr>0.5?1:0) === p.c) correct++;
  });
  $('#lrLoss').textContent = round(loss/LR_POINTS.length, 3);
  $('#lrAcc').textContent  = LR_POINTS.length ? round(correct/LR_POINTS.length*100, 1)+'%' : '—';
  drawSigmoid();
}
function drawSigmoid(){
  const ctx = lrSigCtx;
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-2');
  ctx.fillRect(0,0,360,160);
  ctx.strokeStyle = 'rgba(124,92,255,.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(180,0); ctx.lineTo(180,160); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,140); ctx.lineTo(360,140); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,20); ctx.lineTo(360,20); ctx.stroke();
  ctx.strokeStyle = '#00d4ff'; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let px=0; px<=360; px++){
    const z = (px-180)/30;
    const p = 1/(1+Math.exp(-z));
    const py = 140 - p*120;
    if (px===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  }
  ctx.stroke();
  ctx.fillStyle = '#8a93a6'; ctx.font='10px Inter';
  ctx.fillText('z=0', 184, 156); ctx.fillText('σ=1', 6, 24); ctx.fillText('σ=0', 6, 154);
}
['lrW1','lrW2','lrB'].forEach(id=>{
  document.getElementById(id).addEventListener('input', e=>{
    if(id==='lrW1') lrW1=parseFloat(e.target.value);
    if(id==='lrW2') lrW2=parseFloat(e.target.value);
    if(id==='lrB')  lrB =parseFloat(e.target.value);
    document.getElementById(id+'Val').textContent = round(parseFloat(e.target.value),2);
    drawLR();
  });
});
lrCv.addEventListener('contextmenu', e=>e.preventDefault());
lrCv.addEventListener('mousedown', e=>{
  e.preventDefault();
  const rect = lrCv.getBoundingClientRect();
  const px = (e.clientX-rect.left)*(420/rect.width);
  const py = (e.clientY-rect.top)*(420/rect.height);
  if (e.button === 2) {
    let best = -1, bd = 25;
    LR_POINTS.forEach((p,i)=>{
      const [a,b] = lrToCanvas(p.x,p.y);
      const d = Math.hypot(a-px,b-py);
      if (d<bd){bd=d; best=i;}
    });
    if (best>=0) LR_POINTS.splice(best,1);
  } else {
    const [x,y] = lrFromCanvas(px,py);
    LR_POINTS.push({x,y,c: e.shiftKey ? 1 : 0});
  }
  drawLR();
});
$('#lrFit').onclick = ()=>{
  let lr = 0.15;
  for (let it=0; it<400; it++){
    let g1=0,g2=0,gb=0;
    LR_POINTS.forEach(p=>{
      const z = lrW1*p.x + lrW2*p.y + lrB;
      const pr = 1/(1+Math.exp(-z));
      g1 += (pr-p.c)*p.x;
      g2 += (pr-p.c)*p.y;
      gb += (pr-p.c);
    });
    const n = Math.max(LR_POINTS.length,1);
    lrW1 -= lr*g1/n; lrW2 -= lr*g2/n; lrB -= lr*gb/n;
  }
  $('#lrW1').value = lrW1; $('#lrW1Val').textContent = round(lrW1,2);
  $('#lrW2').value = lrW2; $('#lrW2Val').textContent = round(lrW2,2);
  $('#lrB').value  = lrB;  $('#lrBVal').textContent  = round(lrB,2);
  drawLR();
};
$('#lrReset').onclick = ()=>{
  lrW1=1; lrW2=-1; lrB=0;
  $('#lrW1').value=1; $('#lrW1Val').textContent='1';
  $('#lrW2').value=-1; $('#lrW2Val').textContent='-1';
  $('#lrB').value=0; $('#lrBVal').textContent='0';
  drawLR();
};
drawLR();

/* =========================================================================
   8. SENTIMENT (lexicon)
   ========================================================================= */
const SENT_LEX = {
  good:1.5, great:2, excellent:2.5, amazing:2.5, brilliant:2.3, wonderful:2.2, fantastic:2.4,
  love:2.5, like:1, awesome:2.3, best:2, happy:2, beautiful:2, fun:1.5, nice:1.2, enjoy:1.8,
  bad:-1.5, terrible:-2.5, awful:-2.4, horrible:-2.5, disappointing:-2, sad:-1.8, hate:-2.5,
  poor:-1.5, worst:-2.5, boring:-1.7, ugly:-1.8, slow:-1, dull:-1.5, broken:-1.5, painful:-2,
  ok:0.5, fine:0.5, okay:0.5, meh:-0.3, neutral:0,
};
const BOOSTERS = { very:1.5, really:1.4, absolutely:1.8, incredibly:1.8, extremely:1.9, super:1.6, totally:1.7, quite:1.2, somewhat:0.7, slightly:0.5, terribly:1.6 };
const NEGATORS = new Set(['not',"n't",'no','never','none','nothing','nor','neither','without']);

function scoreSent(text){
  const toks = (text.toLowerCase().match(/[a-z']+/g)||[]);
  let total = 0;
  const parts = [];
  for (let i=0; i<toks.length; i++){
    const w = toks[i];
    let cls = 'se-neu', val = 0, display = w;
    if (NEGATORS.has(w)) {
      parts.push({w, cls:'se-neg-flip', val:0});
      for (let j=1;j<=3 && i+j<toks.length;j++){ toks[i+j+'_neg']=true; }
      continue;
    }
    if (BOOSTERS[w]) {
      parts.push({w, cls:'se-boost', val:0, mult:BOOSTERS[w]});
      continue;
    }
    if (w in SENT_LEX) {
      val = SENT_LEX[w];
      let mult = 1;
      if (i>0 && BOOSTERS[toks[i-1]]) mult = BOOSTERS[toks[i-1]];
      let flipped = false;
      for (let j=1; j<=3 && i-j>=0; j++) if (NEGATORS.has(toks[i-j])) flipped = true;
      const final = val * mult * (flipped?-0.7:1);
      total += final;
      cls = final>0 ? 'se-pos' : 'se-neg';
      display = `${w} (${round(final,1)})`;
      parts.push({w:display, cls, val:final});
    } else {
      parts.push({w, cls:'se-neu', val:0});
    }
  }
  return {total, parts};
}
function renderSE(){
  const r = scoreSent($('#seText').value);
  const norm = Math.tanh(r.total/5);
  const bar = $('#seBar');
  const score = $('#seScore');
  const pct = Math.abs(norm)*50;
  bar.style.width = pct+'%';
  bar.style.marginLeft = norm>=0 ? '50%' : (50-pct)+'%';
  score.textContent = (r.total>=0?'+':'') + round(r.total,2);
  score.className = 'se-score ' + (r.total>0.3?'pos':r.total<-0.3?'neg':'neu');
  const out = $('#seWords'); out.innerHTML='';
  r.parts.forEach(p=>out.appendChild(h('span',{class:'chip '+p.cls}, p.w)));
}
$('#seText').addEventListener('input', renderSE);
renderSE();

/* =========================================================================
   9. WORD EMBEDDINGS (small 2D toy)
   ========================================================================= */
// Hand-placed 2D coords that form interpretable clusters
const EMB_RAW = {
  // royalty / power
  king:[3.2,4.5], queen:[3.0,4.7], prince:[3.5,4.0], princess:[3.3,4.2], royal:[3.4,4.3], crown:[3.6,4.1], throne:[3.8,4.0],
  // gender
  man:[2.5,2.0], woman:[2.3,2.2], boy:[2.7,1.7], girl:[2.5,1.9], father:[2.8,2.8], mother:[2.6,3.0],
  // animals
  dog:[-3,2.5], cat:[-3.2,2.7], bird:[-3.5,3.0], fish:[-3.8,2.2], horse:[-2.8,2.8], cow:[-2.5,2.5], puppy:[-3.1,2.4], kitten:[-3.3,2.6],
  // food
  bread:[-4,-2], milk:[-4.2,-1.7], cheese:[-4.5,-2.2], water:[-3.8,-1.5], coffee:[-4.1,-2.5], tea:[-4,-2.3], apple:[-4.5,-2.7], banana:[-4.7,-2.4],
  // tech
  computer:[4.5,-2], software:[4.7,-2.3], phone:[4.2,-1.8], screen:[4.6,-2.6], laptop:[4.4,-2.1], code:[4.8,-2.4], internet:[4.3,-2.7],
  // transport
  car:[-1,-4], train:[-1.3,-4.3], plane:[-0.8,-4.5], ship:[-1.5,-4.1], bus:[-1.2,-4.4], bike:[-1,-3.8],
  // emotions
  happy:[1.5,-3], sad:[2,-3.2], angry:[2.3,-3.4], love:[1.7,-2.8], joy:[1.4,-2.9], fear:[2.2,-3.6],
  // numbers / abstract — kept far away
  number:[0.5,4.5], math:[0.7,4.7], science:[0.3,4.3],
};
const EMB = {};
for (const w in EMB_RAW) {
  // turn 2D coord into a small synthetic 8-d vector so analogies work
  const [x,y] = EMB_RAW[w];
  EMB[w] = [x, y, x*0.5, y*0.5, Math.sin(x), Math.cos(y), x*y*0.05, (x+y)*0.3];
}
function emb(w){ return EMB[w.toLowerCase()] || null; }
function cosine(a,b){ let d=0, na=0, nb=0;
  for (let i=0;i<a.length;i++){d+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i];}
  return d/(Math.sqrt(na*nb)||1e-9);
}
let EMB_PICK = 'king';
const embCv = $('#embCanvas'), embCtx = embCv.getContext('2d');
function embCanvas(x,y){ return [320 + x*45, 260 - y*45]; }
function drawEmb(){
  embCtx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-2');
  embCtx.fillRect(0,0,640,520);
  embCtx.strokeStyle='rgba(124,92,255,.15)';
  for (let i=-6;i<=6;i++){
    let [a,] = embCanvas(i,0); embCtx.beginPath(); embCtx.moveTo(a,0); embCtx.lineTo(a,520); embCtx.stroke();
    let [,b] = embCanvas(0,i); embCtx.beginPath(); embCtx.moveTo(0,b); embCtx.lineTo(640,b); embCtx.stroke();
  }
  const sel = EMB[EMB_PICK];
  for (const w in EMB_RAW) {
    const [x,y] = EMB_RAW[w];
    const [px,py] = embCanvas(x,y);
    const sim = sel ? cosine(EMB[w], sel) : 0;
    const r = 4 + Math.max(0,sim)*4;
    embCtx.fillStyle = w === EMB_PICK
      ? '#7c5cff'
      : sim>0.7 ? `rgba(0,212,255,${0.4+sim*0.5})`
      : `rgba(230,233,240,${0.3 + Math.max(0,sim)*0.4})`;
    embCtx.beginPath(); embCtx.arc(px,py,r,0,Math.PI*2); embCtx.fill();
    embCtx.fillStyle = w === EMB_PICK ? '#fff'
      : sim>0.7 ? '#00d4ff' : 'rgba(230,233,240,.65)';
    embCtx.font = `${w===EMB_PICK?13:11}px Inter`;
    embCtx.fillText(w, px+6, py+4);
  }
}
embCv.addEventListener('click', e=>{
  const rect = embCv.getBoundingClientRect();
  const cx = (e.clientX-rect.left)*(640/rect.width);
  const cy = (e.clientY-rect.top)*(520/rect.height);
  let best=null, bd=900;
  for (const w in EMB_RAW){
    const [x,y]=EMB_RAW[w]; const [px,py]=embCanvas(x,y);
    const d = (px-cx)**2+(py-cy)**2;
    if (d<bd){bd=d; best=w;}
  }
  if (best){ EMB_PICK=best; $('#embPick').textContent=best; renderEmbNN(); drawEmb();}
});
function renderEmbNN(){
  const sel = EMB[EMB_PICK];
  const sims = Object.keys(EMB_RAW).filter(w=>w!==EMB_PICK).map(w=>({w, s:cosine(EMB[w], sel)})).sort((a,b)=>b.s-a.s).slice(0,8);
  const out = $('#embNN'); out.innerHTML='';
  sims.forEach(({w,s})=>{
    out.appendChild(h('div',{class:'nn-row'},[
      h('span',{},w),
      h('div',{class:'nn-bar'},[h('div',{style:`width:${Math.max(0,s)*100}%`})]),
      h('span',{class:'nn-sim'}, round(s,3).toString())
    ]));
  });
}
$('#anGo').onclick = ()=>{
  const a = emb($('#anA').value), b = emb($('#anB').value), c = emb($('#anC').value);
  const skip = new Set([$('#anA').value.toLowerCase(), $('#anB').value.toLowerCase(), $('#anC').value.toLowerCase()]);
  if (!a||!b||!c){ $('#anOut').innerHTML = '<span class="muted">One of those words isn\'t in the toy vocab. Try words from the canvas.</span>'; return;}
  const target = a.map((v,i)=> v - b[i] + c[i]);
  const sims = Object.keys(EMB).filter(w=>!skip.has(w)).map(w=>({w, s:cosine(EMB[w], target)})).sort((x,y)=>y.s-x.s).slice(0,3);
  $('#anOut').innerHTML = `<b>${$('#anA').value}</b> − <b>${$('#anB').value}</b> + <b>${$('#anC').value}</b> ≈ ` +
    sims.map((x,i)=>`<span class="pill" style="${i===0?'':'opacity:.6;'}margin:0 4px">${x.w} (${round(x.s,3)})</span>`).join('');
};
drawEmb(); renderEmbNN();

/* =========================================================================
   10. POS — HMM + Viterbi
   ========================================================================= */
const POS_TAGS = ['DET','NOUN','VERB','ADJ'];
const POS_TRANS = {
  '<S>':  {DET:0.6, NOUN:0.2, VERB:0.1, ADJ:0.1},
  DET:    {DET:0.05, NOUN:0.7, VERB:0.05, ADJ:0.2},
  NOUN:   {DET:0.15, NOUN:0.2, VERB:0.5, ADJ:0.15},
  VERB:   {DET:0.5, NOUN:0.3, VERB:0.05, ADJ:0.15},
  ADJ:    {DET:0.05, NOUN:0.75, VERB:0.1, ADJ:0.1},
};
const POS_EMIT = {
  the:{DET:0.7,NOUN:0.01,VERB:0.01,ADJ:0.01},
  a:{DET:0.6,NOUN:0.01,VERB:0.01,ADJ:0.01},
  an:{DET:0.4,NOUN:0.01,VERB:0.01,ADJ:0.01},
  dog:{DET:0.001,NOUN:0.3,VERB:0.001,ADJ:0.01},
  dogs:{DET:0.001,NOUN:0.3,VERB:0.001,ADJ:0.01},
  cat:{DET:0.001,NOUN:0.3,VERB:0.001,ADJ:0.01},
  cats:{DET:0.001,NOUN:0.3,VERB:0.001,ADJ:0.01},
  chase:{DET:0.001,NOUN:0.05,VERB:0.4,ADJ:0.01},
  chases:{DET:0.001,NOUN:0.05,VERB:0.4,ADJ:0.01},
  runs:{DET:0.001,NOUN:0.05,VERB:0.4,ADJ:0.01},
  sits:{DET:0.001,NOUN:0.01,VERB:0.4,ADJ:0.01},
  sat:{DET:0.001,NOUN:0.01,VERB:0.4,ADJ:0.01},
  black:{DET:0.001,NOUN:0.05,VERB:0.01,ADJ:0.4},
  big:{DET:0.001,NOUN:0.02,VERB:0.01,ADJ:0.4},
  small:{DET:0.001,NOUN:0.02,VERB:0.01,ADJ:0.4},
  fast:{DET:0.001,NOUN:0.02,VERB:0.05,ADJ:0.3},
  happy:{DET:0.001,NOUN:0.02,VERB:0.01,ADJ:0.4},
};
function viterbi(words){
  const T = words.length;
  const V = POS_TAGS.map(()=>Array(T).fill(-Infinity));
  const BP = POS_TAGS.map(()=>Array(T).fill(-1));
  POS_TAGS.forEach((tag,i)=>{
    const emit = (POS_EMIT[words[0]] && POS_EMIT[words[0]][tag]) || 0.005;
    V[i][0] = Math.log((POS_TRANS['<S>'][tag]||0.01) * emit);
  });
  for (let t=1;t<T;t++){
    POS_TAGS.forEach((tag,i)=>{
      const emit = (POS_EMIT[words[t]] && POS_EMIT[words[t]][tag]) || 0.005;
      let best=-Infinity, bp=0;
      POS_TAGS.forEach((prev,j)=>{
        const s = V[j][t-1] + Math.log((POS_TRANS[prev][tag]||0.01) * emit);
        if (s>best){best=s; bp=j;}
      });
      V[i][t]=best; BP[i][t]=bp;
    });
  }
  let last=0, bs=V[0][T-1];
  for (let i=1;i<POS_TAGS.length;i++) if (V[i][T-1]>bs){bs=V[i][T-1]; last=i;}
  const path = [last];
  for (let t=T-1;t>0;t--) path.unshift(BP[path[0]][t]);
  return {V, BP, path};
}
$('#posRun').onclick = renderPOS;
$('#posInput').addEventListener('input', renderPOS);
function renderPOS(){
  const words = ($('#posInput').value.toLowerCase().match(/[a-z]+/g)||[]);
  if (!words.length){$('#posOut').innerHTML=''; $('#posTrellis').innerHTML=''; return;}
  const r = viterbi(words);
  $('#posOut').innerHTML='';
  words.forEach((w,t)=>{
    const tag = POS_TAGS[r.path[t]];
    $('#posOut').appendChild(h('span',{class:'chip pos-'+tag}, [w, h('span',{class:'chip-tag'}, tag)]));
  });
  const tbl = h('table');
  tbl.appendChild(h('tr',{},[h('th',{},''), ...words.map(w=>h('th',{},w))]));
  POS_TAGS.forEach((tag,i)=>{
    const row = h('tr',{},[h('td',{class:'tag'}, tag)]);
    for (let t=0;t<words.length;t++){
      const onPath = r.path[t] === i;
      row.appendChild(h('td',{class:onPath?'path':'', title:`logP=${round(r.V[i][t],2)}`}, round(r.V[i][t],2).toString()));
    }
    tbl.appendChild(row);
  });
  $('#posTrellis').innerHTML=''; $('#posTrellis').appendChild(tbl);
}
renderPOS();

/* =========================================================================
   11. NER (gazetteer + rules)
   ========================================================================= */
const NER_PERSON = new Set(['Sundar Pichai','Tim Cook','Satya Nadella','Elon Musk','Sam Altman','Barack Obama','Donald Trump','Mark Zuckerberg','Jeff Bezos','Bill Gates','Alice','Bob','Charlie','Mr. Smith']);
const NER_LOC = new Set(['Paris','London','New York','San Francisco','Berlin','Tokyo','Beijing','Madrid','Rome','India','China','USA','America','Europe','Africa','Mountain View']);
const NER_ORG = new Set(['Google','Apple','Microsoft','Amazon','Meta','OpenAI','Anthropic','Tesla','IBM','NASA','Nvidia','Facebook','Twitter','YouTube']);
const NER_MONTH = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function detectNER(text){
  const ents = [];
  const tryMatch = (set, type) => {
    for (const name of set) {
      const re = new RegExp('\\b' + name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b', 'g');
      let m; while ((m = re.exec(text)) !== null) ents.push({s:m.index, e:m.index+name.length, t:type, w:name});
    }
  };
  tryMatch(NER_PERSON,'PERSON');
  tryMatch(NER_LOC,'LOC');
  tryMatch(NER_ORG,'ORG');
  // dates
  const dateRe = new RegExp('\\b('+NER_MONTH.join('|')+')\\s+\\d{1,2}(?:,\\s*\\d{4})?\\b|\\b('+NER_MONTH.join('|')+')\\s+\\d{4}\\b|\\b\\d{4}-\\d{2}-\\d{2}\\b', 'g');
  let m; while ((m = dateRe.exec(text)) !== null) ents.push({s:m.index, e:m.index+m[0].length, t:'DATE', w:m[0]});
  // money
  const mRe = /\$\d+(?:[.,]\d+)?\s*(?:billion|million|thousand|k|m|b)?/gi;
  while ((m = mRe.exec(text)) !== null) ents.push({s:m.index, e:m.index+m[0].length, t:'MONEY', w:m[0]});

  ents.sort((a,b)=>a.s-b.s || b.e-a.e);
  const filtered = [];
  for (const e of ents) if (!filtered.some(f => e.s < f.e && e.e > f.s)) filtered.push(e);
  return filtered;
}
function renderNER(){
  const text = $('#nerInput').value;
  const ents = detectNER(text);
  let out = '', cur = 0;
  ents.forEach(e=>{
    out += escapeHTML(text.slice(cur, e.s));
    out += `<span class="ner-ent ner-${e.t}" data-type="${e.t}">${escapeHTML(e.w)}</span>`;
    cur = e.e;
  });
  out += escapeHTML(text.slice(cur));
  $('#nerOut').innerHTML = out;
  // list grouped by type
  const grouped = {};
  ents.forEach(e=>{ (grouped[e.t]=grouped[e.t]||[]).push(e.w); });
  const list = $('#nerList'); list.innerHTML='';
  Object.entries(grouped).forEach(([type,ws])=>{
    const u = [...new Set(ws)];
    const card = h('div',{class:'card'},[
      h('h4',{}, type + ` · ${u.length}`),
      h('div',{class:'chips'}, u.map(w=>h('span',{class:'chip ner-'+type, style:'border-radius:6px'}, w)))
    ]);
    list.appendChild(card);
  });
}
$('#nerInput').addEventListener('input', renderNER);
renderNER();

/* =========================================================================
   12. NEURAL NETWORK (2 → 4 → 1)
   ========================================================================= */
const nnCv = $('#nnCanvas'), nnCtx = nnCv.getContext('2d');
let NN_W1 = [], NN_W2 = [];
function nnInit(){
  NN_W1 = Array.from({length:4}, ()=> [Math.random()*2-1, Math.random()*2-1, Math.random()*0.4-0.2]); // 4 hidden, each has w1,w2,b
  NN_W2 = Array.from({length:4}, ()=> Math.random()*2-1);
  NN_W2.push(Math.random()*0.4-0.2); // bias
}
function act(z, fn){
  if (fn==='tanh') return Math.tanh(z);
  if (fn==='sigmoid') return 1/(1+Math.exp(-z));
  return Math.max(0,z);
}
function drawNN(){
  const w = 560, hh = 420;
  nnCtx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-2');
  nnCtx.fillRect(0,0,w,hh);
  const x1 = parseFloat($('#nnX1').value);
  const x2 = parseFloat($('#nnX2').value);
  const fn = $('#nnAct').value;
  $('#nnX1V').textContent = round(x1,2); $('#nnX2V').textContent = round(x2,2);
  const inputs = [x1, x2];
  const hidden = NN_W1.map(([w1,w2,b])=> act(w1*x1 + w2*x2 + b, fn));
  const outPre = hidden.reduce((s,hv,i)=>s+hv*NN_W2[i], NN_W2[4]);
  const out = act(outPre, 'sigmoid');

  const lx = [80, 280, 480];
  const inY = [hh*0.35, hh*0.65];
  const hY = [hh*0.15, hh*0.38, hh*0.62, hh*0.85];
  const oY = [hh*0.5];

  // edges in→hidden
  NN_W1.forEach(([w1,w2], j)=>{
    [w1,w2].forEach((wt,i)=>{
      const a = wt * inputs[i];
      nnCtx.strokeStyle = a >= 0 ? `rgba(0,212,255,${Math.min(.9, Math.abs(a)*0.8+0.1)})` : `rgba(255,93,108,${Math.min(.9, Math.abs(a)*0.8+0.1)})`;
      nnCtx.lineWidth = Math.min(4, Math.abs(wt)*2 + 0.5);
      nnCtx.beginPath(); nnCtx.moveTo(lx[0], inY[i]); nnCtx.lineTo(lx[1], hY[j]); nnCtx.stroke();
    });
  });
  // edges hidden→out
  NN_W2.slice(0,4).forEach((wt,j)=>{
    const a = wt * hidden[j];
    nnCtx.strokeStyle = a >=0 ? `rgba(0,212,255,${Math.min(.9, Math.abs(a)*0.8+0.1)})` : `rgba(255,93,108,${Math.min(.9, Math.abs(a)*0.8+0.1)})`;
    nnCtx.lineWidth = Math.min(4, Math.abs(wt)*2+0.5);
    nnCtx.beginPath(); nnCtx.moveTo(lx[1], hY[j]); nnCtx.lineTo(lx[2], oY[0]); nnCtx.stroke();
  });
  // nodes
  const drawNode = (x,y,v,lbl)=>{
    const c = v>=0 ? `rgba(0,212,255,${0.25+Math.min(1,Math.abs(v))*0.65})` : `rgba(255,93,108,${0.25+Math.min(1,Math.abs(v))*0.65})`;
    nnCtx.fillStyle = c; nnCtx.strokeStyle='#fff'; nnCtx.lineWidth=1.5;
    nnCtx.beginPath(); nnCtx.arc(x,y,22,0,Math.PI*2); nnCtx.fill(); nnCtx.stroke();
    nnCtx.fillStyle = '#fff'; nnCtx.font='12px JetBrains Mono'; nnCtx.textAlign='center';
    nnCtx.fillText(round(v,2).toString(), x, y+4);
    nnCtx.fillStyle = '#8a93a6'; nnCtx.font='10px Inter';
    nnCtx.fillText(lbl, x, y-30);
  };
  inputs.forEach((v,i)=>drawNode(lx[0], inY[i], v, 'x'+(i+1)));
  hidden.forEach((v,i)=>drawNode(lx[1], hY[i], v, 'h'+(i+1)));
  drawNode(lx[2], oY[0], out, 'ŷ');
  nnCtx.fillStyle='#8a93a6'; nnCtx.font='11px Inter'; nnCtx.textAlign='center';
  nnCtx.fillText('input', lx[0], hh-12);
  nnCtx.fillText(`hidden (${fn})`, lx[1], hh-12);
  nnCtx.fillText('output (σ)', lx[2], hh-12);

  $('#nnOut').innerHTML = `<span class="lab">ŷ = ${round(out,3)}</span><span class="muted">pre-σ = ${round(outPre,2)}</span>`;
}
$('#nnX1').addEventListener('input', drawNN);
$('#nnX2').addEventListener('input', drawNN);
$('#nnAct').addEventListener('change', drawNN);
$('#nnRand').onclick = ()=>{nnInit(); drawNN();};
nnInit(); drawNN();

/* =========================================================================
   13. RNN (Elman) step-through
   ========================================================================= */
let RNN_TOKENS = [], RNN_STEP = 0, RNN_H = [];
const RNN_DIM = 6;
// random fixed weights for reproducibility
function rseed(){ let s = 42; return () => (s = (s*9301+49297)%233280) / 233280; }
const _r = rseed();
const RNN_Wxh = Array.from({length:RNN_DIM},()=>Array.from({length:RNN_DIM},()=>_r()*2-1));
const RNN_Whh = Array.from({length:RNN_DIM},()=>Array.from({length:RNN_DIM},()=>_r()*1.2-0.6));
function embedToken(t){
  const v = new Array(RNN_DIM).fill(0);
  for (let i=0;i<t.length;i++) v[t.charCodeAt(i)%RNN_DIM] += 1;
  const n = Math.sqrt(v.reduce((s,x)=>s+x*x,0))||1;
  return v.map(x=>x/n);
}
function rnnReset(){
  RNN_TOKENS = ($('#rnnInput').value.toLowerCase().match(/[a-z']+/g)||[]);
  RNN_STEP = 0;
  RNN_H = [new Array(RNN_DIM).fill(0)];
  renderRNN();
}
function rnnStep(){
  if (RNN_STEP >= RNN_TOKENS.length) return;
  const x = embedToken(RNN_TOKENS[RNN_STEP]);
  const hPrev = RNN_H[RNN_H.length-1];
  const hNew = new Array(RNN_DIM).fill(0);
  for (let i=0;i<RNN_DIM;i++){
    let s = 0;
    for (let j=0;j<RNN_DIM;j++) s += RNN_Wxh[i][j]*x[j] + RNN_Whh[i][j]*hPrev[j];
    hNew[i] = Math.tanh(s);
  }
  RNN_H.push(hNew);
  RNN_STEP++;
  renderRNN();
}
function renderRNN(){
  const c = $('#rnnSteps'); c.innerHTML='';
  // initial state
  c.appendChild(stepCard('h₀', null, RNN_H[0], 0));
  for (let t=0;t<RNN_STEP;t++){
    c.appendChild(stepCard(`step ${t+1}`, RNN_TOKENS[t], RNN_H[t+1], t+1));
  }
  for (let t=RNN_STEP;t<RNN_TOKENS.length;t++){
    c.appendChild(stepCard(`step ${t+1}`, RNN_TOKENS[t], null, t+1));
  }
}
function stepCard(label, tok, h_, idx){
  const card = h('div',{class:'rnn-step'});
  card.appendChild(h('div',{class:'rstep'}, label));
  card.appendChild(h('div',{class:'rtok'}, tok ? (idx>RNN_STEP?'?':tok) : '∅'));
  const bar = h('div',{class:'rnn-bar'});
  if (h_) {
    h_.forEach((v,i)=>{
      const row = h('div',{class:'hb'},[
        h('span',{},'h'+i),
        h('div',{class:'hb-bar'},[h('div',{style:`width:${Math.abs(v)*100}%;background:${v>=0?'var(--good)':'var(--bad)'}`})]),
        h('span',{style:'color:'+(v>=0?'var(--good)':'var(--bad)')+';width:36px;text-align:right'}, round(v,2).toString())
      ]);
      bar.appendChild(row);
    });
  } else {
    for (let i=0;i<RNN_DIM;i++) bar.appendChild(h('div',{class:'hb', style:'opacity:.3'},[
      h('span',{},'h'+i), h('div',{class:'hb-bar'}), h('span',{},'—')
    ]));
  }
  card.appendChild(bar);
  return card;
}
$('#rnnReset').onclick = rnnReset;
$('#rnnStep').onclick = rnnStep;
$('#rnnRun').onclick = ()=>{ while (RNN_STEP < RNN_TOKENS.length) rnnStep(); };
$('#rnnInput').addEventListener('input', rnnReset);
rnnReset();

/* =========================================================================
   14. TRANSFORMER ATTENTION
   ========================================================================= */
const AT_DIM = 8;
const _r2 = rseed();
function rmat(rows,cols){ return Array.from({length:rows},()=>Array.from({length:cols},()=>_r2()*2-1)); }
const AT_Wq = rmat(AT_DIM, AT_DIM);
const AT_Wk = rmat(AT_DIM, AT_DIM);
const AT_Wv = rmat(AT_DIM, AT_DIM);
function atEmbed(toks){
  return toks.map((t,pos)=>{
    const e = new Array(AT_DIM).fill(0);
    for (let i=0;i<t.length;i++) e[t.charCodeAt(i)%AT_DIM] += 1;
    for (let i=0;i<AT_DIM;i++) e[i] += Math.sin(pos/(10**(2*i/AT_DIM)))*0.3; // positional
    const n = Math.sqrt(e.reduce((s,x)=>s+x*x,0))||1;
    return e.map(x=>x/n);
  });
}
function matVec(M,v){ return M.map(row=>row.reduce((s,m,i)=>s+m*v[i],0)); }
function softmax(arr){ const m=Math.max(...arr); const ex=arr.map(x=>Math.exp(x-m)); const s=ex.reduce((a,b)=>a+b,0); return ex.map(x=>x/s); }
function computeAttention(toks){
  const E = atEmbed(toks);
  const Q = E.map(e => matVec(AT_Wq, e));
  const K = E.map(e => matVec(AT_Wk, e));
  const V = E.map(e => matVec(AT_Wv, e));
  const sqd = Math.sqrt(AT_DIM);
  const scores = Q.map(q => K.map(k => q.reduce((s,qi,i)=>s+qi*k[i],0)/sqd));
  const attn = scores.map(softmax);
  return {Q, K, V, attn};
}
function renderAttention(){
  const text = $('#atInput').value;
  const toks = (text.toLowerCase().match(/[a-z']+/g)||[]);
  if (toks.length < 2){ $('#atHeat').innerHTML='<span class="muted">Add at least two tokens.</span>'; return;}
  const {Q,K,V,attn} = computeAttention(toks);
  const heat = $('#atHeat'); heat.innerHTML='';
  const cols = `auto repeat(${toks.length}, minmax(28px, 56px))`;
  const head = h('div',{class:'at-row', style:`grid-template-columns:${cols}`},
    [h('div',{}), ...toks.map(t=>h('div',{class:'at-colhead'}, t))]);
  heat.appendChild(head);
  attn.forEach((row,i)=>{
    const rowEl = h('div',{class:'at-row', style:`grid-template-columns:${cols}`}, [
      h('div',{class:'at-lab'}, toks[i])
    ]);
    row.forEach((v,j)=>{
      const bg = `rgba(124,92,255,${0.1 + v*0.9})`;
      rowEl.appendChild(h('div',{class:'at-cell', style:`background:${bg}`, title:`attn(${toks[i]} → ${toks[j]}) = ${round(v,3)}`}, round(v,2).toString()));
    });
    heat.appendChild(rowEl);
  });
  const qkv = $('#atQKV'); qkv.innerHTML='';
  toks.forEach((t,i)=>{
    qkv.innerHTML += `<div><span class="lbl">${t}</span><br/>
      Q = [${Q[i].slice(0,4).map(x=>round(x,2)).join(', ')}…]<br/>
      K = [${K[i].slice(0,4).map(x=>round(x,2)).join(', ')}…]<br/>
      V = [${V[i].slice(0,4).map(x=>round(x,2)).join(', ')}…]
    </div><br/>`;
  });
}
$('#atRun').onclick = renderAttention;
$('#atInput').addEventListener('input', renderAttention);
renderAttention();

/* =========================================================================
   15. CHALLENGES
   ========================================================================= */
const CHALLENGES = [
  {ico:'⚖', t:'Bias & fairness', b:'Models inherit social bias from their training data — gender stereotypes, racial associations, prestige defaults. Debiasing is partial; transparency and evaluation matter more.'},
  {ico:'👻', t:'Hallucination', b:'LLMs generate fluent text that is factually wrong. The model has no built-in truth signal. Mitigation: retrieval augmentation, citations, uncertainty estimation, RLHF.'},
  {ico:'🌍', t:'Multilinguality', b:'Most NLP research targets English. Low-resource languages lack data, benchmarks, and dedicated tokenizers. BPE merges cross-lingually but quality drops fast.'},
  {ico:'🔥', t:'Compute & energy', b:'Training a single frontier model emits as much CO₂ as ~300 round-trip US flights. Efficient architectures, distillation, and quantization are essential.'},
  {ico:'🧪', t:'Evaluation', b:'BLEU/ROUGE correlate poorly with human quality for open-ended generation. Benchmark contamination is endemic. The field is moving toward LLM-as-judge and dynamic evals.'},
  {ico:'🔒', t:'Privacy & PII', b:'Models memorize and can regurgitate training data. Federated learning, differential privacy, and machine unlearning are open research problems.'},
  {ico:'🧠', t:'Reasoning', b:'Surface fluency ≠ reasoning. Chain-of-thought and tool use help. Hybrid neurosymbolic and reasoning-tuned models (o1-style) are pushing the frontier.'},
  {ico:'🛡', t:'Safety & alignment', b:'How do we ensure models follow human intent? RLHF, constitutional AI, scalable oversight — none are fully solved, especially for superhuman capabilities.'},
  {ico:'📚', t:'Long context', b:'Attention is O(n²) in sequence length. Sparse attention, state-space models (Mamba), and retrieval reduce cost, but coherence over long docs is still hard.'},
];
const tiles = $('#chTiles');
CHALLENGES.forEach(c=>{
  const card = h('div',{class:'card'},[
    h('div',{class:'ch-ico'}, c.ico),
    h('h3',{}, c.t),
    h('div',{class:'ch-body'}, c.b)
  ]);
  card.onclick = ()=>card.classList.toggle('open');
  tiles.appendChild(card);
});

/* =========================================================================
   16. BPE (Byte-Pair Encoding)
   ========================================================================= */
function trainBPE(text, nMerges){
  // Initial words split into characters with end-of-word marker
  const words = (text.toLowerCase().match(/[a-z]+/g)||[]);
  const wordCounts = {};
  words.forEach(w => { wordCounts[w] = (wordCounts[w]||0)+1; });
  // represent each word as space-separated chars with </w>
  let splits = {};
  for (const w in wordCounts) splits[w] = w.split('').concat(['</w>']);
  const merges = [];
  for (let step=0; step<nMerges; step++){
    const pairs = {};
    for (const w in wordCounts){
      const s = splits[w]; const c = wordCounts[w];
      for (let i=0;i<s.length-1;i++){
        const p = s[i]+'​'+s[i+1];
        pairs[p] = (pairs[p]||0)+c;
      }
    }
    if (!Object.keys(pairs).length) break;
    let best=null, bestC=-1;
    for (const p in pairs) if (pairs[p]>bestC){bestC=pairs[p]; best=p;}
    const [a,b] = best.split('​');
    merges.push([a,b]);
    // apply merge
    const nextSplits = {};
    for (const w in splits) {
      const s = splits[w]; const out = [];
      let i=0; while (i<s.length){
        if (i<s.length-1 && s[i]===a && s[i+1]===b){ out.push(a+b); i+=2; }
        else { out.push(s[i]); i++; }
      }
      nextSplits[w] = out;
    }
    splits = nextSplits;
  }
  // build vocab from final splits
  const vocab = new Set();
  for (const w in splits) splits[w].forEach(t=>vocab.add(t));
  return {merges, vocab:[...vocab], splits};
}
function bpeApply(word, merges){
  let s = word.split('').concat(['</w>']);
  for (const [a,b] of merges){
    const out=[]; let i=0;
    while (i<s.length){
      if (i<s.length-1 && s[i]===a && s[i+1]===b){ out.push(a+b); i+=2; }
      else { out.push(s[i]); i++; }
    }
    s = out;
  }
  return s;
}
function renderBPE(){
  const txt = $('#bpeCorpus').value;
  const n = parseInt($('#bpeN').value);
  $('#bpeNVal').textContent = n;
  const r = trainBPE(txt, n);
  $('#bpeMerges').innerHTML='';
  r.merges.forEach(([a,b],i) => $('#bpeMerges').appendChild(
    h('span',{class:'chip', title:`merge #${i+1}`},
      [a, h('span',{class:'bpe-sep'},'+'), b, h('span',{class:'bpe-sep'},'→'), a+b])
  ));
  if (!r.merges.length) $('#bpeMerges').appendChild(h('span',{class:'muted'},'(no merges — start from characters)'));
  $('#bpeVocab').innerHTML='';
  r.vocab.sort((a,b)=>b.length-a.length).forEach(v => $('#bpeVocab').appendChild(
    h('span',{class:'chip'}, v.replace('</w>','▁'))
  ));
  // tokenize test
  const test = ($('#bpeTest').value.toLowerCase().match(/[a-z]+/g)||[]);
  $('#bpeTokens').innerHTML='';
  test.forEach(w=>{
    const toks = bpeApply(w, r.merges);
    toks.forEach(t=>{
      const known = r.vocab.includes(t);
      $('#bpeTokens').appendChild(h('span',{class:'chip'+(known?'':' unk')}, t.replace('</w>','▁')));
    });
  });
}
['bpeCorpus','bpeN','bpeTest'].forEach(id=>{
  document.getElementById(id).addEventListener('input', renderBPE);
});
renderBPE();

/* =========================================================================
   17. N-GRAM LANGUAGE MODEL
   ========================================================================= */
function buildNgram(corpus, n){
  const toks = ['<s>','<s>','<s>'].concat(corpus.toLowerCase().match(/[a-z]+/g)||[]).concat(['</s>']);
  const counts = {};
  for (let i=0; i<=toks.length-n; i++){
    const ctx = toks.slice(i, i+n-1).join(' ');
    const w = toks[i+n-1];
    counts[ctx] = counts[ctx] || {};
    counts[ctx][w] = (counts[ctx][w]||0)+1;
  }
  return counts;
}
function nextWordDist(counts, ctx){
  const c = counts[ctx]; if (!c) return [];
  const total = Object.values(c).reduce((s,x)=>s+x,0);
  return Object.entries(c).map(([w,k])=>({w, p:k/total, k})).sort((a,b)=>b.p-a.p);
}
function sampleFromDist(dist){
  let r = Math.random(), acc=0;
  for (const x of dist){ acc += x.p; if (r<=acc) return x.w; }
  return dist[dist.length-1].w;
}
function renderNgram(generate){
  const n = parseInt($('#ngN').value);
  const corpus = $('#ngCorpus').value;
  const counts = buildNgram(corpus, n);
  let seed = $('#ngSeed').value.toLowerCase().split(/\s+/).filter(Boolean);
  while (seed.length < n-1) seed.unshift('<s>');
  let out = seed.slice();
  if (generate){
    for (let i=0;i<15;i++){
      const ctx = out.slice(out.length-(n-1)).join(' ');
      const dist = nextWordDist(counts, ctx);
      if (!dist.length) break;
      const next = sampleFromDist(dist);
      if (next === '</s>') break;
      out.push(next);
    }
  }
  $('#ngOut').innerHTML = `<span class="seed">${out.slice(0, seed.length).filter(x=>x!=='<s>').join(' ')}</span> <span class="gen">${out.slice(seed.length).join(' ')}</span>`;
  // distribution after the LAST context shown
  const ctx = out.slice(out.length-(n-1)).join(' ');
  const dist = nextWordDist(counts, ctx).slice(0,8);
  const distEl = $('#ngDist'); distEl.innerHTML='';
  distEl.appendChild(h('div',{class:'muted', style:'font-size:12px;margin-bottom:6px;font-family:JetBrains Mono,monospace'}, `P(w | "${ctx}") — top ${dist.length}`));
  const max = dist[0]?.p || 1;
  dist.forEach(d=>distEl.appendChild(h('div',{class:'ng-bar'},[
    h('span',{class:'w'}, d.w),
    h('span',{class:'b'},[h('div',{style:`width:${d.p/max*100}%`})]),
    h('span',{class:'p'}, round(d.p,3).toString())
  ])));
  if (!dist.length) distEl.appendChild(h('div',{class:'muted'}, 'no continuations seen for this context'));
}
$('#ngGen').onclick = ()=>renderNgram(true);
['ngN','ngCorpus','ngSeed'].forEach(id=>document.getElementById(id).addEventListener('input', ()=>renderNgram(false)));
renderNgram(false);

/* =========================================================================
   18. EDIT DISTANCE
   ========================================================================= */
function editDistance(a, b){
  const m = a.length, n = b.length;
  const d = Array.from({length:m+1}, ()=>Array(n+1).fill(0));
  for (let i=0;i<=m;i++) d[i][0]=i;
  for (let j=0;j<=n;j++) d[0][j]=j;
  for (let i=1;i<=m;i++) for (let j=1;j<=n;j++){
    const c = a[i-1]===b[j-1] ? 0 : 1;
    d[i][j] = Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+c);
  }
  // back-trace
  const path = new Set(); const ops = [];
  let i=m, j=n;
  while (i>0 || j>0){
    path.add(i+','+j);
    if (i>0 && j>0 && a[i-1]===b[j-1] && d[i][j]===d[i-1][j-1]){
      ops.unshift({op:'match', c:a[i-1]}); i--; j--;
    } else if (i>0 && j>0 && d[i][j]===d[i-1][j-1]+1){
      ops.unshift({op:'sub', from:a[i-1], to:b[j-1]}); i--; j--;
    } else if (i>0 && d[i][j]===d[i-1][j]+1){
      ops.unshift({op:'del', c:a[i-1]}); i--;
    } else {
      ops.unshift({op:'ins', c:b[j-1]}); j--;
    }
  }
  path.add('0,0');
  return {d, path, ops, dist:d[m][n]};
}
function renderEdit(){
  const a = $('#edA').value, b = $('#edB').value;
  const r = editDistance(a, b);
  const tbl = h('table');
  const head = h('tr',{},[h('th',{},''), h('th',{},'∅'), ...b.split('').map(c=>h('th',{},c))]);
  tbl.appendChild(head);
  for (let i=0;i<=a.length;i++){
    const row = h('tr',{},[h('th',{}, i===0?'∅':a[i-1])]);
    for (let j=0;j<=b.length;j++){
      let cls = r.path.has(i+','+j) ? 'path' : '';
      if (i===0 && j===0) cls += ' start';
      if (i===a.length && j===b.length) cls += ' end';
      row.appendChild(h('td',{class:cls}, r.d[i][j].toString()));
    }
    tbl.appendChild(row);
  }
  $('#edGrid').innerHTML=''; $('#edGrid').appendChild(tbl);
  $('#edGrid').appendChild(h('div',{class:'muted', style:'margin-top:8px;font-size:13px'},
    `Edit distance = ${r.dist}`));
  const ops = $('#edOps'); ops.innerHTML='';
  r.ops.forEach(o=>{
    let cls = 'chip op-'+o.op, label;
    if (o.op==='match') label = `keep "${o.c}"`;
    else if (o.op==='sub') label = `${o.from} → ${o.to}`;
    else if (o.op==='ins') label = `+ ${o.c}`;
    else label = `− ${o.c}`;
    ops.appendChild(h('span',{class:cls}, label));
  });
}
$('#edA').addEventListener('input', renderEdit);
$('#edB').addEventListener('input', renderEdit);
renderEdit();

/* =========================================================================
   19. TOPIC MODELING (toy LDA via TF-IDF + KMeans on terms)
   ========================================================================= */
function ldaToy(text, K){
  const docs = text.split('\n').map(s=>s.trim()).filter(Boolean);
  const docTokens = docs.map(d => (d.toLowerCase().match(/[a-z]+/g)||[]).filter(w => !STOPWORDS.has(w) && w.length > 2));
  const df = {};
  docTokens.forEach(toks => new Set(toks).forEach(t => df[t] = (df[t]||0)+1));
  // Vocab: terms appearing ≥ 2 docs OR top by frequency
  const vocab = Object.keys(df).filter(t => df[t] >= 1);
  if (vocab.length < 6) return {docs, topics:[], assignments:[]};
  // Doc-term TF-IDF matrix
  const N = docs.length;
  const idf = {}; vocab.forEach(t => idf[t] = Math.log(N/df[t])+1);
  const dtm = docTokens.map(toks => {
    const tf = {}; toks.forEach(t=>{if(t in idf) tf[t]=(tf[t]||0)+1;});
    const v = vocab.map(t => (tf[t]||0)*idf[t]);
    const n = Math.sqrt(v.reduce((s,x)=>s+x*x,0))||1;
    return v.map(x=>x/n);
  });
  // K-means on docs
  let centroids = [];
  const rng = rseed();
  const picks = new Set();
  while (centroids.length < K) {
    const i = Math.floor(rng()*N);
    if (!picks.has(i)){ picks.add(i); centroids.push(dtm[i].slice()); }
  }
  let assign = new Array(N).fill(0);
  for (let it=0; it<30; it++){
    assign = dtm.map(d => {
      let best=0, bs=-Infinity;
      for (let k=0; k<K; k++){
        let s = 0; for (let i=0;i<d.length;i++) s += d[i]*centroids[k][i];
        if (s>bs){bs=s; best=k;}
      }
      return best;
    });
    const newC = Array.from({length:K},()=>new Array(vocab.length).fill(0));
    const cnt = new Array(K).fill(0);
    dtm.forEach((d,i)=>{ for(let j=0;j<d.length;j++) newC[assign[i]][j]+=d[j]; cnt[assign[i]]++; });
    for (let k=0;k<K;k++){
      if (cnt[k]) for (let j=0;j<vocab.length;j++) newC[k][j]/=cnt[k];
    }
    centroids = newC;
  }
  // Topic = top vocab terms per centroid
  const topics = centroids.map(c => {
    const ranked = vocab.map((t,j)=>({t, w:c[j]})).sort((a,b)=>b.w-a.w).slice(0,6);
    return ranked;
  });
  // Doc mixture: softmax over similarities to each topic
  const mixtures = dtm.map(d => {
    const sims = centroids.map(c => { let s=0; for(let i=0;i<d.length;i++) s+=d[i]*c[i]; return s; });
    const ex = sims.map(s => Math.exp(s*4));
    const Z = ex.reduce((a,b)=>a+b,0)||1;
    return ex.map(x=>x/Z);
  });
  return {docs, topics, assignments:assign, mixtures};
}
function renderLDA(){
  const K = parseInt($('#ldaK').value);
  const r = ldaToy($('#ldaDocs').value, K);
  const tops = $('#ldaTopics'); tops.innerHTML='';
  const colors = ['var(--accent)','var(--accent-2)','var(--good)','var(--warn)'];
  r.topics.forEach((tp,k)=>{
    const max = tp[0]?.w || 1;
    const card = h('div',{class:'lda-topic'},[h('h4',{style:`color:${colors[k%4]}`}, `Topic ${k+1}`)]);
    tp.forEach(({t,w})=>{
      card.appendChild(h('div',{class:'lda-w'},[
        h('span',{class:'term'}, t),
        h('span',{class:'bar'},[h('div',{style:`width:${w/max*100}%;background:${colors[k%4]}`})]),
        h('span',{class:'pct'}, round(w,2).toString())
      ]));
    });
    tops.appendChild(card);
  });
  const dout = $('#ldaDocsOut'); dout.innerHTML='';
  r.docs.forEach((d,i)=>{
    const mix = r.mixtures?.[i] || [];
    const row = h('div',{class:'lda-doc'},[
      h('div',{class:'ld-txt'}, d),
      h('div',{class:'ld-mix'}, mix.map((m,k)=>h('div',{class:'seg', style:`width:${m*120}px;background:${colors[k%4]}`, title:`T${k+1}: ${round(m,2)}`})))
    ]);
    dout.appendChild(row);
  });
}
$('#ldaRun').onclick = renderLDA;
$('#ldaDocs').addEventListener('input', renderLDA);
$('#ldaK').addEventListener('change', renderLDA);
renderLDA();

/* =========================================================================
   20. BEAM SEARCH (on the N-gram model from the n-gram corpus)
   ========================================================================= */
function beamSearch(counts, n, seed, K, steps){
  let beams = [{toks:seed.slice(), lp:0, history:[]}];
  const tree = [{seed:seed.join(' '), expansions:[]}];
  for (let s=0; s<steps; s++){
    const expansions = [];
    beams.forEach((b,bi) => {
      const ctx = b.toks.slice(b.toks.length-(n-1)).join(' ');
      const dist = nextWordDist(counts, ctx);
      if (!dist.length) {
        expansions.push({parent:bi, w:'</s>', lp:b.lp, kept:false, term:true});
        return;
      }
      dist.slice(0,K+1).forEach(d => {
        expansions.push({parent:bi, w:d.w, lp:b.lp + Math.log(d.p), prob:d.p, kept:false, term:d.w==='</s>'});
      });
    });
    expansions.sort((a,b)=>b.lp-a.lp);
    const kept = expansions.slice(0,K);
    kept.forEach(k => k.kept = true);
    tree.push({step:s+1, items:expansions});
    beams = kept.map(k => ({
      toks: beams[k.parent].toks.concat([k.w]),
      lp: k.lp,
      history: beams[k.parent].history.concat([{w:k.w, lp:k.lp}])
    }));
    if (beams.every(b => b.toks[b.toks.length-1] === '</s>')) break;
  }
  return {beams, tree};
}
function renderBeam(){
  const corpus = $('#ngCorpus').value;
  const n = 3;
  const counts = buildNgram(corpus, n);
  const seed = $('#beamSeed').value.toLowerCase().split(/\s+/).filter(Boolean);
  while (seed.length < n-1) seed.unshift('<s>');
  const K = parseInt($('#beamK').value);
  const steps = parseInt($('#beamSteps').value);
  const {beams, tree} = beamSearch(counts, n, seed, K, steps);
  const treeEl = $('#beamTree'); treeEl.innerHTML='';
  treeEl.appendChild(h('div',{},[h('span',{class:'muted'}, 'seed: '),
    h('span',{class:'beam-node kept'}, seed.filter(x=>x!=='<s>').join(' '))]));
  tree.slice(1).forEach(step => {
    const stepEl = h('div',{class:'beam-step'},[h('div',{class:'sl'}, `step ${step.step}`)]);
    step.items.forEach(it => {
      stepEl.appendChild(h('span',{class:'beam-node'+(it.kept?' kept':' pruned'), title:`logP=${round(it.lp,2)}`},
        `${it.w} (${round(it.lp,2)})`));
    });
    treeEl.appendChild(stepEl);
  });
  const final = $('#beamFinal'); final.innerHTML='';
  beams.sort((a,b)=>b.lp-a.lp).forEach((b,i)=>{
    final.appendChild(h('div',{class:'beam-row'},[
      h('span',{class:'seq'}, b.toks.filter(x=>x!=='<s>').join(' ')),
      h('span',{class:'lp'}, 'logP = '+round(b.lp,2))
    ]));
  });
}
$('#beamRun').onclick = renderBeam;
$('#beamSeed').addEventListener('input', renderBeam);
$('#beamK').addEventListener('change', renderBeam);
$('#beamSteps').addEventListener('change', renderBeam);
renderBeam();

/* =========================================================================
   21. EXTRACTIVE SUMMARIZATION (TextRank-lite)
   ========================================================================= */
function sentTokenize(s){
  return (s.match(/[^.!?]+[.!?]+/g) || []).map(x=>x.trim()).filter(Boolean);
}
function tokenizeSimple(s){
  return (s.toLowerCase().match(/[a-z]+/g)||[]).filter(w=>!STOPWORDS.has(w)&&w.length>2);
}
function textRank(text, k){
  const sents = sentTokenize(text);
  if (!sents.length) return {sents:[], scores:[]};
  const sToks = sents.map(tokenizeSimple);
  const N = sents.length;
  // sentence-similarity = |w_i ∩ w_j| / (log|s_i|+log|s_j|)
  const sim = Array.from({length:N},()=>new Array(N).fill(0));
  for (let i=0;i<N;i++) for (let j=0;j<N;j++) if (i!==j){
    const a = new Set(sToks[i]), b = sToks[j];
    let overlap = 0; b.forEach(w => { if (a.has(w)) overlap++; });
    const denom = Math.log(sToks[i].length+1) + Math.log(sToks[j].length+1);
    sim[i][j] = denom > 0 ? overlap/denom : 0;
  }
  // normalize rows
  for (let i=0;i<N;i++){
    const s = sim[i].reduce((a,b)=>a+b,0);
    if (s) for (let j=0;j<N;j++) sim[i][j]/=s;
  }
  // PageRank
  let rank = new Array(N).fill(1/N);
  const d = 0.85;
  for (let it=0; it<40; it++){
    const next = new Array(N).fill((1-d)/N);
    for (let j=0; j<N; j++) for (let i=0;i<N;i++) next[j] += d*sim[i][j]*rank[i];
    rank = next;
  }
  const ranked = sents.map((s,i)=>({i, s, r:rank[i]})).sort((a,b)=>b.r-a.r);
  const picked = new Set(ranked.slice(0,k).map(x=>x.i));
  return {sents, scores:rank, ranked, picked};
}
function renderSum(){
  const k = parseInt($('#sumK').value);
  $('#sumKVal').textContent = k;
  const r = textRank($('#sumText').value, k);
  const out = $('#sumOut'); out.innerHTML='';
  r.ranked.forEach((x,rank)=>{
    out.appendChild(h('div',{class:'sum-sent'+(r.picked.has(x.i)?' in':'')},[
      h('span',{class:'rank'}, '#'+(rank+1)),
      h('span',{class:'text'}, x.s),
      h('span',{class:'score'}, round(x.r,3).toString())
    ]));
  });
  const inOrder = [...r.picked].sort((a,b)=>a-b).map(i=>r.sents[i]).join(' ');
  $('#sumFinal').textContent = inOrder || '(empty)';
}
$('#sumText').addEventListener('input', renderSum);
$('#sumK').addEventListener('input', renderSum);
renderSum();

/* =========================================================================
   22. QUESTION ANSWERING (toy span scorer)
   ========================================================================= */
function answerQA(ctx, q){
  const qToks = new Set((q.toLowerCase().match(/[a-z]+/g)||[]).filter(w=>!STOPWORDS.has(w)));
  // Determine question type for boost
  const qLower = q.toLowerCase();
  let bias = null;
  if (qLower.startsWith('who')) bias = 'PERSON';
  else if (qLower.startsWith('where')) bias = 'LOC';
  else if (qLower.startsWith('when')) bias = 'DATE';
  else if (qLower.includes('how much')||qLower.includes('how many')) bias = 'MONEY';
  // tokenize ctx and identify candidate spans (NER + noun-phrase-y)
  const ents = detectNER(ctx);
  const cands = [];
  // 1) NER candidates
  ents.forEach(e => {
    let score = 0;
    if (bias && e.t === bias) score += 5;
    // proximity score: how close to nearest question keyword in context
    const ctxL = ctx.toLowerCase();
    const eIdx = e.s;
    let minDist = 1e6;
    qToks.forEach(qt => {
      let idx = 0;
      while ((idx = ctxL.indexOf(qt, idx)) !== -1) {
        minDist = Math.min(minDist, Math.abs(idx - eIdx));
        idx += qt.length;
      }
    });
    score += Math.max(0, 8 - minDist/40);
    cands.push({span:e.w, score, type:e.t, idx:e.s});
  });
  // 2) Capitalized phrases as backup
  const re = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  let m;
  while ((m = re.exec(ctx)) !== null) {
    if (cands.some(c => c.idx === m.index)) continue;
    let score = 0;
    qToks.forEach(qt => {
      let idx = 0; const ctxL = ctx.toLowerCase();
      while ((idx = ctxL.indexOf(qt, idx)) !== -1) {
        score += Math.max(0, 4 - Math.abs(idx - m.index)/40);
        idx += qt.length;
      }
    });
    // implicit type for capitalized NP: treat as PERSON for "who" questions
    // unless it's a known location/org
    let type = 'NP';
    if (bias === 'PERSON' && !NER_LOC.has(m[0]) && !NER_ORG.has(m[0])
        && !m[0].toLowerCase().startsWith('the ') && m[0] !== 'It') {
      type = 'PERSON';
      score += 5;
    }
    // penalize spans whose first token is a stopword/discourse marker
    if (/^(The|It|This|That|These|Those|Today)\b/.test(m[0])) score -= 3;
    cands.push({span:m[0], score, type, idx:m.index});
  }
  cands.sort((a,b)=>b.score-a.score);
  return cands.slice(0,5);
}
function renderQA(){
  const cands = answerQA($('#qaCtx').value, $('#qaQ').value);
  $('#qaAns').textContent = cands[0]?.span || '(no answer found)';
  const list = $('#qaCands'); list.innerHTML='';
  cands.forEach(c=>list.appendChild(h('div',{class:'qa-cand'},[
    h('span',{class:'qs'}, round(c.score,2).toString()),
    h('span',{class:'qt'}, c.span),
    h('span',{class:'chip ner-'+(c.type==='NP'?'ORG':c.type), style:'font-size:10px'}, c.type)
  ])));
}
$('#qaGo').onclick = renderQA;
$('#qaQ').addEventListener('input', renderQA);
$('#qaCtx').addEventListener('input', renderQA);
renderQA();

/* =========================================================================
   23. BLEU & ROUGE
   ========================================================================= */
function ngramCounts(toks, n){
  const c = {};
  for (let i=0; i<=toks.length-n; i++){
    const k = toks.slice(i,i+n).join(' ');
    c[k] = (c[k]||0)+1;
  }
  return c;
}
function bleuScore(cand, ref){
  const cToks = cand.toLowerCase().match(/[a-z]+/g)||[];
  const rToks = ref.toLowerCase().match(/[a-z]+/g)||[];
  if (!cToks.length) return {bleu:0, precs:[], bp:0};
  const precs = [];
  for (let n=1; n<=4; n++){
    const cC = ngramCounts(cToks, n);
    const rC = ngramCounts(rToks, n);
    let match = 0, total = 0;
    for (const k in cC){ const m = Math.min(cC[k], rC[k]||0); match += m; total += cC[k]; }
    precs.push(total ? match/total : 0);
  }
  const bp = cToks.length > rToks.length ? 1 : Math.exp(1 - rToks.length/Math.max(cToks.length,1));
  let logSum = 0; let valid = 0;
  precs.forEach(p => { if (p>0){ logSum += Math.log(p); valid++; }});
  const geo = valid ? Math.exp(logSum/4) : 0;
  return { bleu: bp*geo, precs, bp };
}
function rougeScore(cand, ref){
  const cToks = cand.toLowerCase().match(/[a-z]+/g)||[];
  const rToks = ref.toLowerCase().match(/[a-z]+/g)||[];
  const rougeN = n => {
    const cC = ngramCounts(cToks, n), rC = ngramCounts(rToks, n);
    let match=0, totalR=0;
    for (const k in rC){ const m = Math.min(rC[k], cC[k]||0); match+=m; totalR+=rC[k]; }
    return totalR ? match/totalR : 0;
  };
  // LCS for ROUGE-L
  const m = cToks.length, n = rToks.length;
  const dp = Array.from({length:m+1},()=>new Array(n+1).fill(0));
  for (let i=1;i<=m;i++) for (let j=1;j<=n;j++){
    if (cToks[i-1]===rToks[j-1]) dp[i][j] = dp[i-1][j-1]+1;
    else dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
  }
  const lcs = dp[m][n];
  const p = m? lcs/m:0, r = n? lcs/n:0;
  const f = (p+r)?2*p*r/(p+r):0;
  return { r1:rougeN(1), r2:rougeN(2), rl_p:p, rl_r:r, rl_f:f };
}
function renderBleu(){
  const c = $('#bleuC').value, r = $('#bleuR').value;
  const b = bleuScore(c, r);
  $('#bleuScore').textContent = round(b.bleu,4).toString();
  const br = $('#bleuBreak'); br.innerHTML = '';
  b.precs.forEach((p,i) => br.innerHTML += `<div class="row"><span>${i+1}-gram precision</span><span>${round(p,3)}</span></div>`);
  br.innerHTML += `<div class="row"><span>brevity penalty</span><span>${round(b.bp,3)}</span></div>`;
  br.innerHTML += `<div class="row"><span>BLEU-4</span><span>${round(b.bleu,4)}</span></div>`;
  const ro = rougeScore(c, r);
  const ru = $('#rougeOut'); ru.innerHTML = '';
  ru.innerHTML += `<div class="row"><span>ROUGE-1 (unigram recall)</span><span>${round(ro.r1,3)}</span></div>`;
  ru.innerHTML += `<div class="row"><span>ROUGE-2 (bigram recall)</span><span>${round(ro.r2,3)}</span></div>`;
  ru.innerHTML += `<div class="row"><span>ROUGE-L precision</span><span>${round(ro.rl_p,3)}</span></div>`;
  ru.innerHTML += `<div class="row"><span>ROUGE-L recall</span><span>${round(ro.rl_r,3)}</span></div>`;
  ru.innerHTML += `<div class="row"><span>ROUGE-L F1</span><span>${round(ro.rl_f,3)}</span></div>`;
}
$('#bleuC').addEventListener('input', renderBleu);
$('#bleuR').addEventListener('input', renderBleu);
renderBleu();

/* =========================================================================
   24. CONFUSION MATRIX (on Naive Bayes from section 6)
   ========================================================================= */
let CM_TEST = [
  {t:"win a free vacation right now", y:"spam"},
  {t:"meeting tomorrow at three sharp", y:"ham"},
  {t:"claim your prize money urgently", y:"spam"},
  {t:"please send the slides for review", y:"ham"},
  {t:"discount offer just for you click", y:"spam"},
  {t:"happy birthday hope you have a great day", y:"ham"},
];
function renderCMTest(){
  const c = $('#cmTest'); c.innerHTML='';
  CM_TEST.forEach((d,i)=>{
    const row = h('div',{class:'nb-row'},[
      h('input',{type:'text', value:d.t, oninput:e=>{CM_TEST[i].t=e.target.value; renderCM();}}),
      h('select',{onchange:e=>{CM_TEST[i].y=e.target.value; renderCM();}}),
      h('button',{onclick:()=>{CM_TEST.splice(i,1); renderCMTest(); renderCM();}}, '×')
    ]);
    const sel = row.querySelector('select');
    ['spam','ham'].forEach(v=>{
      const o = h('option',{value:v}, v);
      if (v===d.y) o.selected = true;
      sel.appendChild(o);
    });
    c.appendChild(row);
  });
}
$('#cmAdd').onclick = ()=>{CM_TEST.push({t:'new test', y:'ham'}); renderCMTest(); renderCM();};
function renderCM(){
  const m = trainNB(NB_DATA);
  const classes = ['spam','ham'];
  const conf = {spam:{spam:0,ham:0}, ham:{spam:0,ham:0}};
  CM_TEST.forEach(d => {
    const p = predictNB(m, d.t).pred;
    conf[d.y][p]++;
  });
  const grid = $('#cmGrid'); grid.innerHTML='';
  const tbl = h('table');
  tbl.appendChild(h('tr',{},[h('th',{},''), h('th',{},'pred spam'), h('th',{},'pred ham')]));
  classes.forEach(act => {
    const row = h('tr',{},[h('td',{class:'lab'}, 'actual ' + act)]);
    classes.forEach(pred => {
      const v = conf[act][pred];
      row.appendChild(h('td',{class: act===pred ? 'diag' : (v>0?'off':'')}, v.toString()));
    });
    tbl.appendChild(row);
  });
  grid.appendChild(tbl);
  // per-class metrics
  const met = $('#cmMetrics'); met.innerHTML='';
  let macroP=0, macroR=0, macroF=0;
  classes.forEach(c => {
    const tp = conf[c][c];
    const fp = classes.filter(x=>x!==c).reduce((s,x)=>s+conf[x][c],0);
    const fn = classes.filter(x=>x!==c).reduce((s,x)=>s+conf[c][x],0);
    const p = tp+fp ? tp/(tp+fp) : 0;
    const r = tp+fn ? tp/(tp+fn) : 0;
    const f = p+r ? 2*p*r/(p+r) : 0;
    macroP+=p; macroR+=r; macroF+=f;
    met.innerHTML += `<div class="row"><span class="lbl">${c}: P / R / F1</span><span class="v">${round(p,2)} / ${round(r,2)} / ${round(f,2)}</span></div>`;
  });
  const mac = $('#cmMacro'); mac.innerHTML='';
  const K = classes.length;
  const acc = CM_TEST.length ? classes.reduce((s,c)=>s+conf[c][c],0)/CM_TEST.length : 0;
  mac.innerHTML += `<div class="row"><span class="lbl">macro P / R / F1</span><span class="v">${round(macroP/K,2)} / ${round(macroR/K,2)} / ${round(macroF/K,2)}</span></div>`;
  mac.innerHTML += `<div class="row"><span class="lbl">accuracy</span><span class="v">${round(acc,3)}</span></div>`;
}
renderCMTest(); renderCM();

/* =========================================================================
   25. FLASHCARDS (loads nlp.tsv)
   ========================================================================= */
let FC_CARDS = [], FC_FILTERED = [], FC_I = 0;
const FC_STATE = { known:new Set(), missed:new Set() };
fetch('nlp.tsv').then(r=>r.text()).then(text=>{
  const lines = text.split('\n').filter(l => l && !l.startsWith('#'));
  FC_CARDS = lines.map(line=>{
    const cols = line.split('\t');
    if (cols.length < 4) return null;
    return { q: cols[1], a: cols[2], tags: cols[3].trim().split(/\s+/) };
  }).filter(Boolean);
  // build tag list
  const tagSet = new Set();
  FC_CARDS.forEach(c => c.tags.forEach(t => tagSet.add(t)));
  const sel = $('#fcTag');
  [...tagSet].sort().forEach(t => sel.appendChild(h('option',{value:t}, t)));
  sel.onchange = ()=>filterFC(sel.value);
  $('#fcCount').textContent = FC_CARDS.length;
  filterFC('');
}).catch(e=>{
  $('#fcQ').textContent = 'Could not load nlp.tsv. (Are you serving from docs/?)';
});
function filterFC(tag){
  FC_FILTERED = tag ? FC_CARDS.filter(c => c.tags.includes(tag)) : FC_CARDS.slice();
  FC_I = 0; renderFC();
}
function shuffleFC(){
  for (let i=FC_FILTERED.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [FC_FILTERED[i], FC_FILTERED[j]] = [FC_FILTERED[j], FC_FILTERED[i]];
  }
  FC_I = 0; renderFC();
}
function renderFC(){
  const total = FC_FILTERED.length;
  $('#fcTotal').textContent = total;
  $('#fcIdx').textContent = total ? FC_I+1 : 0;
  if (!total){
    $('#fcQ').textContent = 'No cards match that tag.';
    $('#fcA').textContent = '';
    $('#fcTags').innerHTML = '';
    return;
  }
  const c = FC_FILTERED[FC_I];
  $('#fcCard').classList.remove('flipped');
  $('#fcQ').innerHTML = c.q;
  $('#fcA').innerHTML = c.a;
  const tagsEl = $('#fcTags'); tagsEl.innerHTML='';
  c.tags.forEach(t => tagsEl.appendChild(h('span',{class:'chip'}, t)));
  $('#fcKnown').textContent = FC_STATE.known.size;
  $('#fcMissed').textContent = FC_STATE.missed.size;
  $('#fcSeen').textContent = FC_STATE.known.size + FC_STATE.missed.size;
}
$('#fcCard').onclick = e => { e.currentTarget.classList.toggle('flipped'); };
$('#fcNext').onclick = ()=>{ if (FC_FILTERED.length){FC_I=(FC_I+1)%FC_FILTERED.length; renderFC();} };
$('#fcPrev').onclick = ()=>{ if (FC_FILTERED.length){FC_I=(FC_I-1+FC_FILTERED.length)%FC_FILTERED.length; renderFC();} };
$('#fcShuffle').onclick = shuffleFC;
$('#fcKnow').onclick = e=>{ e.stopPropagation(); if (FC_FILTERED.length){FC_STATE.known.add(FC_FILTERED[FC_I].q); FC_STATE.missed.delete(FC_FILTERED[FC_I].q); $('#fcNext').click();}};
$('#fcMiss').onclick = e=>{ e.stopPropagation(); if (FC_FILTERED.length){FC_STATE.missed.add(FC_FILTERED[FC_I].q); FC_STATE.known.delete(FC_FILTERED[FC_I].q); $('#fcNext').click();}};

// keyboard: space=flip, ←/→ navigate
document.addEventListener('keydown', e=>{
  const onCard = window.location.hash === '#flashcards' ||
    document.getElementById('flashcards').getBoundingClientRect().top < window.innerHeight/2;
  if (!onCard) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key === ' '){ e.preventDefault(); $('#fcCard').classList.toggle('flipped'); }
  if (e.key === 'ArrowRight') $('#fcNext').click();
  if (e.key === 'ArrowLeft') $('#fcPrev').click();
});
