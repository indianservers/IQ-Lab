/* ═══════════════════════════════════════
   IQ LAB — All 30 Games
═══════════════════════════════════════ */

/* ── Helpers ── */
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = rand(0, i); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
function el(id) { return document.getElementById(id); }
function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
function qsa(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }

/* ═══════════════════════════════════════
   GAME 1 — Fast Reading Challenge
═══════════════════════════════════════ */
function createFastReading(container, onComplete) {
  const passages = [
    { text: "The human brain processes information at remarkable speed. Scientists have found that the brain can identify familiar words in as little as one hundred and fifty milliseconds. Reading speed can double or triple with regular practice. The key techniques involve reducing inner speech and expanding visual span to take in multiple words at once.", questions: [{ q: "How fast can the brain identify familiar words?", opts: ["100ms","150ms","200ms","300ms"], ans: 1 },{ q: "What do reading speed techniques reduce?", opts: ["Vocabulary","Inner speech","Eye strain","Fatigue"], ans: 1 },{ q: "What expands with speed reading practice?", opts: ["Brain size","Visual span","Vocabulary","Memory"], ans: 2 }] },
    { text: "Memory works in several stages. First information enters sensory memory which lasts only a fraction of a second. Then it may move into working memory which can hold about seven items at once. Long term memory can store vast amounts of information for decades. Sleep plays a crucial role in consolidating memories from working to long term storage.", questions: [{ q: "How many items can working memory hold?", opts: ["3 items","5 items","7 items","10 items"], ans: 2 },{ q: "What consolidates memories during sleep?", opts: ["Dreaming","Neurotransmitters","Memory transfer","Neural replay"], ans: 2 },{ q: "Sensory memory lasts how long?", opts: ["Several minutes","A few seconds","A fraction of a second","Hours"], ans: 2 }] },
    { text: "Cognitive flexibility is the ability to switch between thinking about different concepts or tasks. People with high cognitive flexibility tend to be better problem solvers and more creative. This skill can be improved through activities like learning new languages learning to play musical instruments and regularly solving puzzles and brain teasers.", questions: [{ q: "What is cognitive flexibility?", opts: ["Physical agility","Switching between concepts","Memory recall","Reading speed"], ans: 1 },{ q: "Which activity improves cognitive flexibility?", opts: ["Watching television","Learning languages","Sleeping more","Eating well"], ans: 1 },{ q: "High cognitive flexibility links to better:", opts: ["Speed","Problem solving","Memory","Reaction time"], ans: 1 }] }
  ];
  let passageIdx = rand(0, passages.length - 1);
  let words = [], wordIdx = 0, wpm = 300, rsvpTimer = null, answers = [];

  container.innerHTML = `
    <div class="rsvp-wrap game-panel">
      <div class="rsvp-speed-ctrl">
        <span>Speed:</span>
        <input type="range" id="wpm-sl" min="100" max="1000" value="300" step="50">
        <strong id="wpm-val">300</strong> WPM
      </div>
      <div class="rsvp-screen">
        <div class="rsvp-focus-bar"></div>
        <div class="rsvp-word" id="rsvp-word">Press Start</div>
      </div>
      <div class="rsvp-progress"><div class="rsvp-progress-fill" id="rsvp-prog" style="width:0%"></div></div>
      <button class="btn-primary" id="rsvp-start">▶ Start Reading</button>
    </div>`;

  el('wpm-sl').oninput = e => { wpm = +e.target.value; el('wpm-val').textContent = wpm; };
  el('rsvp-start').onclick = startReading;

  function startReading() {
    words = passages[passageIdx].text.split(' ');
    wordIdx = 0;
    el('rsvp-start').style.display = 'none';
    const ms = 60000 / wpm;
    rsvpTimer = setInterval(() => {
      if (wordIdx >= words.length) { clearInterval(rsvpTimer); showQuestions(); return; }
      el('rsvp-word').textContent = words[wordIdx];
      el('rsvp-prog').style.width = (wordIdx / words.length * 100) + '%';
      wordIdx++;
    }, ms);
  }

  function showQuestions() {
    const p = passages[passageIdx];
    answers = new Array(p.questions.length).fill(-1);
    let html = '<div class="q-set game-panel"><h3>📋 Comprehension Check</h3>';
    p.questions.forEach((q, i) => {
      html += `<div class="question-block"><p>${i+1}. ${q.q}</p><div class="opt-grid">`;
      q.opts.forEach((o, j) => html += `<button class="opt-btn" data-q="${i}" data-a="${j}">${o}</button>`);
      html += '</div></div>';
    });
    html += '<button class="btn-primary" id="rsvp-submit" style="display:none;margin-top:12px">Submit Answers</button></div>';
    container.innerHTML = html;
    qsa('.opt-btn', container).forEach(b => b.onclick = e => {
      const qi = +e.target.dataset.q, ai = +e.target.dataset.a;
      answers[qi] = ai;
      qsa(`[data-q="${qi}"]`, container).forEach(x => x.classList.remove('selected'));
      e.target.classList.add('selected');
      if (answers.every(a => a !== -1)) el('rsvp-submit').style.display = 'inline-block';
    });
    el('rsvp-submit').onclick = () => {
      const p2 = passages[passageIdx];
      let correct = 0;
      p2.questions.forEach((q, i) => {
        qsa(`[data-q="${i}"]`, container).forEach(b => {
          if (+b.dataset.a === q.ans) b.classList.add('correct');
          else if (answers[i] === +b.dataset.a) b.classList.add('wrong');
        });
        if (answers[i] === q.ans) correct++;
      });
      el('rsvp-submit').style.display = 'none';
      const score = Math.round((correct / p2.questions.length) * 70 + Math.min(wpm / 10, 30));
      setTimeout(() => onComplete({ score, details: { 'Speed': wpm + ' WPM', 'Correct answers': `${correct}/${p2.questions.length}` } }), 1200);
    };
  }
  return { destroy() { if (rsvpTimer) clearInterval(rsvpTimer); } };
}

/* ═══════════════════════════════════════
   GAME 2 — Number Memory
═══════════════════════════════════════ */
function createNumberMemory(container, onComplete) {
  let level = 5, sequence = [], phase = 'show';

  function renderShow() {
    sequence = Array.from({ length: level }, () => rand(0, 9));
    container.innerHTML = `
      <div style="text-align:center">
        <div class="level-indicator">Level ${level - 4} — Remember ${level} digits</div>
        <div class="num-display" id="num-disp">${sequence.join(' ')}</div>
        <div class="phase-label" id="num-phase">Memorize!</div>
      </div>`;
    let t = (level * 600 + 1000);
    setTimeout(() => {
      el('num-disp').textContent = '?';
      el('num-phase').textContent = 'Enter the sequence:';
      renderInput();
    }, t);
  }

  function renderInput() {
    const row = document.createElement('div');
    row.className = 'num-input-row';
    row.id = 'num-inp-row';
    sequence.forEach((_, i) => {
      const inp = document.createElement('input');
      inp.className = 'digit-inp'; inp.maxLength = 1; inp.inputMode = 'numeric';
      inp.dataset.i = i;
      inp.oninput = e => {
        e.target.value = e.target.value.replace(/\D/, '');
        if (e.target.value && i < sequence.length - 1) row.children[i + 1].focus();
        if (i === sequence.length - 1 && e.target.value) checkInput();
      };
      inp.onkeydown = e => { if (e.key === 'Backspace' && !e.target.value && i > 0) row.children[i - 1].focus(); };
      row.appendChild(inp);
    });
    qs('#num-disp').parentElement.appendChild(row);
    row.children[0].focus();
  }

  function checkInput() {
    const inputs = qsa('.digit-inp', container);
    const entered = inputs.map(i => i.value);
    const correct = entered.every((v, i) => +v === sequence[i]);
    inputs.forEach((inp, i) => inp.style.borderColor = (+inp.value === sequence[i]) ? 'var(--green)' : 'var(--red)');
    setTimeout(() => {
      if (correct && level < 20) { level++; renderShow(); }
      else {
        const score = Math.round(((level - 5) / 15) * 100);
        onComplete({ score, details: { 'Max span': level + ' digits', 'Level reached': level - 4 } });
      }
    }, 900);
  }
  renderShow();
  return { destroy() {} };
}

/* ═══════════════════════════════════════
   GAME 3 — Pattern Memory
═══════════════════════════════════════ */
function createPatternMemory(container, onComplete) {
  let round = 0, size = 3, lit = [], selected = [], phase = 'show', score = 0;

  function nextRound() {
    round++;
    if (round > 10) { onComplete({ score, details: { Rounds: 10, 'Best grid': `${size}×${size}` } }); return; }
    size = round <= 3 ? 3 : round <= 6 ? 4 : round <= 8 ? 5 : 6;
    const total = size * size, count = Math.ceil(total * 0.4);
    lit = shuffle([...Array(total).keys()]).slice(0, count);
    selected = []; phase = 'show';
    renderGrid();
    setTimeout(() => { phase = 'input'; renderGrid(true); }, 2200);
  }

  function renderGrid(input = false) {
    container.innerHTML = `
      <div style="text-align:center;width:100%">
        <div class="round-counter">Round ${round}/10</div>
        <div class="phase-label">${input ? 'Recreate the pattern!' : 'Memorize!'}</div>
        <div class="pattern-grid" id="pat-grid" style="grid-template-columns:repeat(${size},1fr)"></div>
        ${input ? '<button class="btn-primary" id="pat-submit" style="margin-top:16px">Check</button>' : ''}
      </div>`;
    const g = el('pat-grid');
    for (let i = 0; i < size * size; i++) {
      const c = document.createElement('div');
      c.className = 'pat-cell' + ((!input && lit.includes(i)) ? ' lit' : '');
      if (input) { c.dataset.i = i; c.onclick = () => toggleCell(c, i); }
      g.appendChild(c);
    }
    if (input && el('pat-submit')) el('pat-submit').onclick = checkPattern;
  }

  function toggleCell(c, i) {
    if (selected.includes(i)) { selected = selected.filter(x => x !== i); c.classList.remove('selected'); }
    else { selected.push(i); c.classList.add('selected'); }
  }

  function checkPattern() {
    const cells = qsa('.pat-cell', container);
    let correct = 0;
    lit.forEach(i => { if (selected.includes(i)) correct++; cells[i].classList.add('correct'); });
    selected.filter(i => !lit.includes(i)).forEach(i => cells[i].classList.add('wrong'));
    score += Math.round((correct / lit.length) * 10);
    setTimeout(nextRound, 1000);
  }
  nextRound();
  return { destroy() {} };
}

/* ═══════════════════════════════════════
   GAME 4 — Stroop Test
═══════════════════════════════════════ */
function createStroop(container, onComplete) {
  const colors = [{ name: 'Red', hex: '#ef4444' }, { name: 'Blue', hex: '#3b82f6' }, { name: 'Green', hex: '#10b981' }, { name: 'Yellow', hex: '#f59e0b' }, { name: 'Purple', hex: '#8b5cf6' }];
  let timeLeft = 60, score = 0, wrong = 0, timer, inkColor, wordColor, current;

  function nextWord() {
    const word = colors[rand(0, colors.length - 1)];
    const ink = colors[rand(0, colors.length - 1)];
    current = ink;
    el('stroop-word').textContent = word.name;
    el('stroop-word').style.color = ink.hex;
    el('stroop-fb').textContent = '';
  }

  container.innerHTML = `
    <div style="text-align:center;width:100%;max-width:480px">
      <div class="stroop-score-strip"><span>✅ <b id="sc">0</b></span><span>❌ <b id="wr">0</b></span><span>⏱ <b id="tm">60</b>s</span></div>
      <p style="font-size:.8rem;color:var(--txt3);margin-bottom:8px">Click the INK COLOR of the word</p>
      <div class="stroop-word" id="stroop-word">Red</div>
      <div class="stroop-feedback" id="stroop-fb"></div>
      <div class="color-buttons" id="stroop-btns"></div>
    </div>`;

  const btnWrap = el('stroop-btns');
  colors.forEach(c => {
    const b = document.createElement('button');
    b.className = 'color-btn'; b.textContent = c.name; b.style.background = c.hex;
    b.onclick = () => {
      if (c.hex === current.hex) { score++; el('stroop-fb').textContent = '✅'; el('stroop-fb').style.color = 'var(--green)'; }
      else { wrong++; el('stroop-fb').textContent = '❌'; el('stroop-fb').style.color = 'var(--red)'; }
      el('sc').textContent = score; el('wr').textContent = wrong;
      nextWord();
    };
    btnWrap.appendChild(b);
  });

  timer = setInterval(() => {
    timeLeft--;
    el('tm').textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      const total = score + wrong, acc = total ? Math.round(score / total * 100) : 0;
      onComplete({ score: Math.round(score * 1.5), details: { Correct: score, Wrong: wrong, Accuracy: acc + '%' } });
    }
  }, 1000);
  nextWord();
  return { destroy() { clearInterval(timer); } };
}

/* ═══════════════════════════════════════
   GAME 5 — Dual N-Back
═══════════════════════════════════════ */
function createDualNBack(container, onComplete) {
  const N = 2, TRIALS = 22;
  const positions = Array.from({ length: TRIALS }, () => rand(0, 8));
  let trial = 0, hits = 0, misses = 0, falseAlarms = 0, responded = false, timer;

  container.innerHTML = `
    <div style="text-align:center;width:100%">
      <div class="nback-info">N = <strong>${N}</strong> — Press <strong>Position</strong> when current matches ${N} steps ago</div>
      <div style="margin:12px 0;font-size:.82rem;color:var(--txt3)">Trial <span id="nb-trial">0</span>/${TRIALS - N}</div>
      <div class="nback-grid" id="nb-grid">
        ${Array.from({length:9},(_,i)=>`<div class="nback-cell" id="nb-${i}"></div>`).join('')}
      </div>
      <div class="nback-btns">
        <button class="nback-btn" id="nb-pos">Position Match</button>
      </div>
      <div style="margin-top:12px;font-size:.8rem;color:var(--txt3)">Hits: <b id="nb-h">0</b>  FA: <b id="nb-fa">0</b></div>
    </div>`;

  el('nb-pos').onclick = () => {
    if (trial < N || responded) return;
    responded = true;
    el('nb-pos').classList.add('pressed');
    setTimeout(() => el('nb-pos').classList.remove('pressed'), 200);
    const target = positions[trial - N] === positions[trial];
    if (target) { hits++; el('nb-h').textContent = hits; }
    else { falseAlarms++; el('nb-fa').textContent = falseAlarms; }
  };

  function showTrial() {
    if (trial >= TRIALS) { clearInterval(timer); finish(); return; }
    qsa('.nback-cell').forEach(c => c.classList.remove('active'));
    el(`nb-${positions[trial]}`).classList.add('active');
    el('nb-trial').textContent = Math.max(0, trial - N + 1);
    responded = false;
    timer = setTimeout(() => { qsa('.nback-cell').forEach(c => c.classList.remove('active')); trial++; setTimeout(showTrial, 500); }, 1800);
  }

  function finish() {
    const targets = TRIALS - N;
    let correctTargets = 0;
    for (let i = N; i < TRIALS; i++) if (positions[i] === positions[i - N]) correctTargets++;
    misses = correctTargets - hits;
    const dprime = Math.max(0, hits - falseAlarms);
    const score = Math.round(Math.min(100, (dprime / Math.max(1, correctTargets)) * 100));
    onComplete({ score, details: { 'N value': N, Hits: hits, 'False alarms': falseAlarms, 'Miss': misses } });
  }
  setTimeout(showTrial, 800);
  return { destroy() { clearTimeout(timer); } };
}

/* ═══════════════════════════════════════
   GAME 6 — Mental Math Sprint
═══════════════════════════════════════ */
function createMentalMath(container, onComplete) {
  let timeLeft = 60, score = 0, streak = 0, timer, a, b, op, ans;

  function nextQ() {
    const ops = ['+', '-', '×', '÷'];
    op = ops[rand(0, score < 5 ? 1 : score < 12 ? 2 : 3)];
    if (op === '+') { a = rand(10, 99); b = rand(10, 99); ans = a + b; }
    else if (op === '-') { a = rand(20, 99); b = rand(1, a - 1); ans = a - b; }
    else if (op === '×') { a = rand(2, 12); b = rand(2, 12); ans = a * b; }
    else { ans = rand(2, 12); b = rand(2, 12); a = ans * b; }
    el('math-prob').textContent = `${a} ${op} ${b} = ?`;
    el('math-inp').value = '';
    el('math-inp').focus();
    el('math-streak').textContent = streak ? `🔥 ${streak} streak` : '';
  }

  container.innerHTML = `
    <div style="text-align:center;width:100%;max-width:420px">
      <div style="display:flex;gap:20px;justify-content:center;font-size:.85rem;margin-bottom:10px">
        <span>Score: <b id="math-sc" style="color:var(--yellow)">0</b></span>
        <span>⏱ <b id="math-tm" style="color:var(--cyan)">60</b>s</span>
      </div>
      <div class="math-problem" id="math-prob"></div>
      <div class="math-input-row">
        <input class="math-input" id="math-inp" type="number" placeholder="Answer">
        <button class="btn-primary" id="math-ok">OK</button>
      </div>
      <div class="math-streak" id="math-streak"></div>
    </div>`;

  function check() {
    const val = +el('math-inp').value;
    if (val === ans) { score++; streak++; el('math-sc').textContent = score; nextQ(); }
    else { streak = 0; el('math-inp').style.borderColor = 'var(--red)'; setTimeout(() => { el('math-inp').style.borderColor = ''; el('math-inp').value = ''; el('math-inp').focus(); }, 500); }
  }
  el('math-ok').onclick = check;
  el('math-inp').onkeydown = e => { if (e.key === 'Enter') check(); };
  timer = setInterval(() => { timeLeft--; el('math-tm').textContent = timeLeft; if (timeLeft <= 0) { clearInterval(timer); onComplete({ score: Math.min(100, score * 5), details: { Correct: score, 'Best streak': streak } }); } }, 1000);
  nextQ();
  return { destroy() { clearInterval(timer); } };
}

/* ═══════════════════════════════════════
   GAME 7 — Missing Shape
═══════════════════════════════════════ */
function createMissingShape(container, onComplete) {
  const shapes = ['circle','square','triangle','diamond','star','hexagon'];
  const colors = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899'];
  let round = 0, correct = 0;

  function drawShape(shape, color, size=40) {
    const s = size, h = Math.sqrt(3)/2;
    const shapes_svg = {
      circle:   `<circle cx="${s/2}" cy="${s/2}" r="${s*0.42}" fill="${color}"/>`,
      square:   `<rect x="${s*.12}" y="${s*.12}" width="${s*.76}" height="${s*.76}" rx="3" fill="${color}"/>`,
      triangle: `<polygon points="${s/2},${s*.1} ${s*.9},${s*.9} ${s*.1},${s*.9}" fill="${color}"/>`,
      diamond:  `<polygon points="${s/2},${s*.08} ${s*.9},${s/2} ${s/2},${s*.92} ${s*.1},${s/2}" fill="${color}"/>`,
      star:     `<polygon points="${s/2},${s*.08} ${s*.59},${s*.38} ${s*.93},${s*.38} ${s*.65},${s*.57} ${s*.76},${s*.9} ${s/2},${s*.7} ${s*.24},${s*.9} ${s*.35},${s*.57} ${s*.07},${s*.38} ${s*.41},${s*.38}" fill="${color}"/>`,
      hexagon:  `<polygon points="${s*.5},${s*.07} ${s*.93},${s*.25} ${s*.93},${s*.75} ${s*.5},${s*.93} ${s*.07},${s*.75} ${s*.07},${s*.25}" fill="${color}"/>`
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${shapes_svg[shape]||shapes_svg.circle}</svg>`;
  }

  function nextRound() {
    round++;
    if (round > 10) { onComplete({ score: correct * 10, details: { Correct: `${correct}/10` } }); return; }
    const sh = shapes[rand(0, shapes.length-1)], c1 = colors[rand(0,colors.length-1)], c2 = colors[rand(0,colors.length-1)];
    // 3x3 matrix with row/col pattern, last cell is missing
    const matrix = [[sh, shapes[rand(0,shapes.length-1)], shapes[rand(0,shapes.length-1)]],[shapes[rand(0,shapes.length-1)], sh, shapes[rand(0,shapes.length-1)]],[shapes[rand(0,shapes.length-1)], shapes[rand(0,shapes.length-1)], sh]];
    const answer = sh; // pattern: diagonal is same shape
    const choices = shuffle([answer, ...shuffle(shapes.filter(s=>s!==answer)).slice(0,3)]);

    let html = `<div class="matrix-wrap"><div class="round-counter">Round ${round}/10 — Correct: ${correct}</div><div class="matrix-grid">`;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      if (r === 2 && c === 2) html += `<div class="matrix-cell empty"><span style="color:var(--txt3);font-size:1.8rem">?</span></div>`;
      else html += `<div class="matrix-cell">${drawShape(matrix[r][c], colors[(r+c)%colors.length])}</div>`;
    }
    html += '</div><div class="answer-choices">';
    choices.forEach(ch => html += `<div class="answer-choice" data-ans="${ch}">${drawShape(ch, colors[1])}</div>`);
    html += '</div></div>';
    container.innerHTML = html;
    qsa('.answer-choice', container).forEach(b => b.onclick = e => {
      const chosen = b.dataset.ans;
      qsa('.answer-choice', container).forEach(x => x.style.pointerEvents = 'none');
      if (chosen === answer) { b.classList.add('correct'); correct++; }
      else { b.classList.add('wrong'); qsa(`[data-ans="${answer}"]`, container)[0].classList.add('correct'); }
      setTimeout(nextRound, 900);
    });
  }
  nextRound();
  return { destroy() {} };
}

/* ═══════════════════════════════════════
   GAME 8 — Matrix Reasoning
═══════════════════════════════════════ */
function createMatrixReasoning(container, onComplete) {
  const drawSh = (shape, color, size=52) => {
    const s=size, svgs={circle:`<circle cx="${s/2}" cy="${s/2}" r="${s*.4}" fill="${color}"/>`,square:`<rect x="${s*.15}" y="${s*.15}" width="${s*.7}" height="${s*.7}" fill="${color}"/>`,triangle:`<polygon points="${s/2},${s*.1} ${s*.9},${s*.9} ${s*.1},${s*.9}" fill="${color}"/>`,diamond:`<polygon points="${s/2},${s*.08} ${s*.92},${s/2} ${s/2},${s*.92} ${s*.08},${s/2}" fill="${color}"/>`};
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${s} ${s}">${svgs[shape]||svgs.circle}</svg>`;
  };
  const C = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444'];
  const SH = ['circle','square','triangle','diamond'];

  function makeMatrix() {
    const sh = SH[rand(0,3)], r = rand(0,4), type = rand(0,2);
    let mat, ans, choices;
    if (type === 0) { // color progression
      const c1=C[r%5], c2=C[(r+1)%5], c3=C[(r+2)%5];
      mat=[[c1,c2,c3],[c2,c3,c1],[c3,c1,null]]; ans=c2;
      choices=shuffle([ans,...C.filter(c=>c!==ans).slice(0,3)]);
      return { mat: mat.map(row=>row.map(c=>c?drawSh(sh,c):null)), choices: choices.map(c=>drawSh(sh,c)), ans: choices.indexOf(ans) };
    } else if (type === 1) { // shape progression
      const s1=SH[rand(0,3)], s2=SH.find(s=>s!==s1)||SH[1], s3=SH.find(s=>s!==s1&&s!==s2)||SH[2];
      mat=[[s1,s2,s3],[s2,s3,s1],[s3,s1,null]]; ans=s2;
      choices=shuffle([ans,...SH.filter(s=>s!==ans).slice(0,3)]);
      return { mat: mat.map(row=>row.map(s=>s?drawSh(s,C[r]):null)), choices: choices.map(s=>drawSh(s,C[r])), ans: choices.indexOf(ans) };
    } else { // size progression
      const sizes=[30,44,58]; const s2=SH[rand(0,3)];
      mat=[[0,1,2],[1,2,0],[2,0,null]]; ans=1;
      choices=[0,1,2,3];
      return { mat: mat.map(row=>row.map(i=>i!==null?`<svg width="58" height="58" viewBox="0 0 58 58">${`<circle cx="29" cy="29" r="${sizes[i]/2}" fill="${C[r]}"/>`}</svg>`:null)), choices: [0,1,2,3].map(i=>`<svg width="58" height="58" viewBox="0 0 58 58"><circle cx="29" cy="29" r="${sizes[Math.min(i,2)]/2}" fill="${C[r]}"/></svg>`), ans: 1 };
    }
  }

  let round=0, correct=0;
  function nextRound() {
    round++; if(round>8){onComplete({score:correct*12+4,details:{Correct:`${correct}/8`}});return;}
    const {mat,choices,ans}=makeMatrix();
    let html=`<div class="matrix-wrap"><div class="round-counter">Round ${round}/8 — Correct: ${correct}</div><div class="matrix-grid">`;
    mat.forEach((row,r)=>row.forEach((cell,c)=>{
      if(r===2&&c===2) html+=`<div class="matrix-cell empty"><span style="font-size:1.8rem;color:var(--txt3)">?</span></div>`;
      else html+=`<div class="matrix-cell">${cell||''}</div>`;
    }));
    html+=`</div><p style="font-size:.8rem;color:var(--txt3);margin:8px 0">Choose the missing piece:</p><div class="answer-choices">`;
    choices.forEach((ch,i)=>html+=`<div class="answer-choice" data-i="${i}">${ch}</div>`);
    html+=`</div></div>`;
    container.innerHTML=html;
    qsa('.answer-choice',container).forEach(b=>b.onclick=()=>{
      qsa('.answer-choice',container).forEach(x=>x.style.pointerEvents='none');
      if(+b.dataset.i===ans){b.classList.add('correct');correct++;}
      else{b.classList.add('wrong');qsa(`[data-i="${ans}"]`,container)[0].classList.add('correct');}
      setTimeout(nextRound,900);
    });
  }
  nextRound();
  return{destroy(){}};
}

/* ═══════════════════════════════════════
   GAME 9 — Rotation Puzzle
═══════════════════════════════════════ */
function createRotationPuzzle(container, onComplete) {
  const templates = [
    { paths: ['M 50 10 L 90 85 L 10 85 Z'], type: 'triangle' },
    { paths: ['M 20 20 L 80 20 L 80 55 L 50 80 L 20 55 Z'], type: 'pentagon' },
    { paths: ['M 50 10 L 70 35 L 95 40 L 75 60 L 80 85 L 50 72 L 20 85 L 25 60 L 5 40 L 30 35 Z'], type: 'star' },
    { paths: ['M 30 10 L 70 10 L 90 50 L 70 90 L 30 90 L 10 50 Z'], type: 'hexagon' },
    { paths: ['M 50 10 L 90 50 L 50 90 L 10 50 Z'], type: 'diamond' }
  ];
  let round=0, correct=0;

  function rotateSVG(path, deg, color) {
    return `<svg width="90" height="90" viewBox="0 0 100 100">
      <g transform="rotate(${deg} 50 50)"><path d="${path}" fill="${color}" stroke="none"/></g></svg>`;
  }

  function nextRound() {
    round++; if(round>10){onComplete({score:correct*10,details:{Correct:`${correct}/10`}});return;}
    const tmpl=templates[rand(0,templates.length-1)], path=tmpl.paths[0];
    const color=['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444'][rand(0,4)];
    const correctRot=rand(0,3)*90;
    const wrong1=(correctRot+90)%360, wrong2=(correctRot+180)%360, wrong3=(correctRot+270)%360;
    const choices=shuffle([{rot:correctRot,correct:true},{rot:wrong1},{rot:wrong2},{rot:wrong3}]);
    let html=`<div style="text-align:center;width:100%">
      <div class="round-counter">Round ${round}/10 — Correct: ${correct}</div>
      <div class="rotation-wrap" style="margin:16px 0">
        <div class="rotation-original"><p>Original</p>${rotateSVG(path,0,color)}</div>
        <div style="font-size:2rem;color:var(--txt3)">→</div>
        <div><p style="font-size:.78rem;color:var(--txt3);margin-bottom:8px">Which matches this rotation? (${correctRot}°)</p>
        <div class="rotation-choices">`;
    choices.forEach((ch,i)=>html+=`<div class="rot-choice" data-i="${i}">${rotateSVG(path,ch.rot,color)}</div>`);
    html+=`</div></div></div></div>`;
    container.innerHTML=html;
    qsa('.rot-choice',container).forEach((b,i)=>b.onclick=()=>{
      qsa('.rot-choice',container).forEach(x=>x.style.pointerEvents='none');
      if(choices[i].correct){b.classList.add('correct');correct++;}
      else{b.classList.add('wrong');qsa('.rot-choice',container)[choices.findIndex(c=>c.correct)].classList.add('correct');}
      setTimeout(nextRound,900);
    });
  }
  nextRound();
  return{destroy(){}};
}

/* ═══════════════════════════════════════
   GAME 10 — Odd One Out
═══════════════════════════════════════ */
function createOddOneOut(container, onComplete) {
  const sets=[['🐶','🐱','🐭','🐹'],['🍎','🍊','🍋','🍇'],['🚗','🚕','🚙','✈️'],['⭕','🔴','🟥','🔷'],['🌸','🌺','🌻','🌴'],['📱','💻','🖥️','📞'],['🎸','🎹','🎺','🎲'],['🏀','⚽','🎾','🏈']];
  let round=0, correct=0, totalTime=0, startTime;

  function nextRound() {
    round++; if(round>10){const score=Math.round(correct*8+(10-Math.min(10,totalTime/10)));onComplete({score:Math.min(100,score),details:{Correct:`${correct}/10`,'Avg time':Math.round(totalTime/correct||0)+'ms'}});return;}
    const setGroup=sets[rand(0,sets.length-1)];
    const base=setGroup[rand(0,2)], oddIdx=rand(0,15);
    const grid=Array.from({length:16},(_,i)=>i===oddIdx?setGroup[3]:base);
    startTime=Date.now();
    let html=`<div style="text-align:center;width:100%">
      <div class="round-counter">Round ${round}/10 — Correct: ${correct}</div>
      <p style="font-size:.82rem;color:var(--txt3);margin:8px 0">Find the ODD ONE OUT!</p>
      <div class="odd-grid" style="grid-template-columns:repeat(4,1fr);width:fit-content;margin:0 auto">`;
    grid.forEach((em,i)=>html+=`<div class="odd-cell" data-i="${i}">${em}</div>`);
    html+=`</div></div>`;
    container.innerHTML=html;
    qsa('.odd-cell',container).forEach(b=>b.onclick=()=>{
      const chosen=+b.dataset.i, rt=Date.now()-startTime;
      qsa('.odd-cell',container).forEach(x=>x.style.pointerEvents='none');
      if(chosen===oddIdx){b.classList.add('correct');correct++;totalTime+=rt;}
      else{b.classList.add('wrong');qsa(`.odd-cell[data-i="${oddIdx}"]`,container)[0].classList.add('correct');}
      setTimeout(nextRound,800);
    });
  }
  nextRound();
  return{destroy(){}};
}

/* ═══════════════════════════════════════
   GAME 11 — Sequence Prediction
═══════════════════════════════════════ */
function createSequencePrediction(container, onComplete) {
  function makeSeq() {
    const type=rand(0,3);
    if(type===0){const start=rand(1,10),step=rand(1,8);const seq=[start,start+step,start+2*step,start+3*step];return{seq:seq.slice(0,4),ans:seq[4]=start+4*step,type:'arithmetic',distractors:[seq[4]+step,seq[4]-step,seq[4]+rand(2,5)]};}
    if(type===1){const start=rand(1,5),ratio=rand(2,3);const seq=[start,start*ratio,start*ratio**2,start*ratio**3];return{seq:seq.slice(0,4),ans:seq[4]=start*ratio**4,type:'geometric',distractors:[seq[4]+ratio,seq[4]-start,seq[4]*ratio]};}
    if(type===2){const s='ABCDEFGHIJ';const start=rand(0,6);return{seq:[s[start],s[start+1],s[start+2],s[start+3]],ans:s[start+4],type:'alphabet',distractors:[s[(start+6)%10],s[(start+3)%10],s[(start+5)%10]]};}
    const emojis=['🔴','🟠','🟡','🟢','🔵','🟣'];const p=rand(1,4);return{seq:[emojis[0],emojis[1],emojis[2],emojis[(3)%6]],ans:emojis[(4)%6],type:'pattern',distractors:[emojis[rand(1,5)],emojis[rand(1,5)],emojis[rand(1,5)]]};
  }
  let round=0, correct=0;
  function nextRound(){
    round++;if(round>10){onComplete({score:correct*10,details:{Correct:`${correct}/10`}});return;}
    const {seq,ans,distractors}=makeSeq();
    const choices=shuffle([ans,...distractors.map(d=>String(d))].map(String).slice(0,4));
    container.innerHTML=`<div style="text-align:center;width:100%;max-width:480px">
      <div class="round-counter">Round ${round}/10 — Correct: ${correct}</div>
      <div class="seq-display">${seq.join('  →  ')}  →  <span style="color:var(--yellow)">?</span></div>
      <div class="seq-choices">${choices.map(c=>`<div class="seq-choice" data-v="${c}">${c}</div>`).join('')}</div>
    </div>`;
    qsa('.seq-choice',container).forEach(b=>b.onclick=()=>{
      qsa('.seq-choice',container).forEach(x=>x.style.pointerEvents='none');
      if(b.dataset.v===String(ans)){b.classList.add('correct');correct++;}
      else{b.classList.add('wrong');qsa(`.seq-choice[data-v="${ans}"]`,container)[0].classList.add('correct');}
      setTimeout(nextRound,800);
    });
  }
  nextRound();
  return{destroy(){}};
}

/* ═══════════════════════════════════════
   GAME 12 — Memory Cards
═══════════════════════════════════════ */
function createMemoryCards(container, onComplete) {
  const emojis=['🐶','🐱','🦊','🐻','🐼','🐸','🦁','🐯','🦋','🐙','🦄','🌺','🍎','🚀','⭐','🎸'];
  let level=1, moves=0, matched=0, first=null, locked=false, timer, seconds=0, totalMoves=0;

  function buildGame(){
    const pairs=level+3; const cards=shuffle([...emojis.slice(0,pairs),...emojis.slice(0,pairs)]);
    const cols=level<2?4:level<4?5:6;
    matched=0; moves=0;
    container.innerHTML=`
      <div style="text-align:center;width:100%">
        <div class="card-stats">
          <span>Level: <b style="color:var(--purple)">${level}</b></span>
          <span>Moves: <b id="mc-mv">0</b></span>
          <span>⏱ <b id="mc-tm">0</b>s</span>
        </div>
        <div class="cards-grid" id="mc-grid" style="grid-template-columns:repeat(${cols},1fr)"></div>
      </div>`;
    timer=setInterval(()=>{seconds++;el('mc-tm').textContent=seconds;},1000);
    const grid=el('mc-grid');
    cards.forEach((em,i)=>{
      const card=document.createElement('div');
      card.className='mem-card'; card.dataset.em=em; card.dataset.i=i;
      card.innerHTML=`<div class="mem-card-face mem-card-back">❓</div><div class="mem-card-face mem-card-front">${em}</div>`;
      card.onclick=()=>flip(card);
      grid.appendChild(card);
    });
  }
  function flip(card){
    if(locked||card.classList.contains('flipped')||card.classList.contains('matched'))return;
    card.classList.add('flipped');
    if(!first){first=card;return;}
    const second=card; moves++; el('mc-mv').textContent=moves; locked=true;
    if(first.dataset.em===second.dataset.em){
      first.classList.add('matched');second.classList.add('matched');
      first=null;locked=false;matched++;
      if(matched===level+3){
        clearInterval(timer);
        const score=Math.round(100*(1-moves/(2*(level+3)*1.5)));
        setTimeout(()=>{
          if(level<5){level++;seconds=0;buildGame();}
          else onComplete({score:Math.max(0,score),details:{Levels:level,'Total moves':totalMoves+moves,'Time':seconds+'s'}});
          totalMoves+=moves;
        },600);
      }
    } else {
      setTimeout(()=>{first.classList.remove('flipped');second.classList.remove('flipped');first=null;locked=false;},900);
    }
  }
  buildGame();
  return{destroy(){clearInterval(timer);}};
}

/* ═══════════════════════════════════════
   GAME 13 — Flash Calculation
═══════════════════════════════════════ */
function createFlashCalculation(container, onComplete) {
  let round=0, correct=0, numbers=[];
  function nextRound(){
    round++;if(round>10){onComplete({score:correct*10,details:{Correct:`${correct}/10`}});return;}
    const count=round<=3?3:round<=7?4:5;
    numbers=Array.from({length:count},()=>rand(5,25));
    const sum=numbers.reduce((a,b)=>a+b,0);
    let i=0;
    container.innerHTML=`<div style="text-align:center;width:100%;max-width:400px">
      <div class="round-counter">Round ${round}/10 — Correct: ${correct}</div>
      <div class="flash-number" id="fl-num">Ready?</div>
      <div id="fl-input-area" style="display:none;margin-top:16px">
        <p style="color:var(--txt2);margin-bottom:10px">What was the sum?</p>
        <div style="display:flex;gap:10px;justify-content:center">
          <input class="flash-input" id="fl-inp" type="number" autofocus>
          <button class="btn-primary" id="fl-ok">OK</button>
        </div>
      </div>
    </div>`;
    function showNext(){
      if(i>=numbers.length){el('fl-num').textContent='?';el('fl-input-area').style.display='block';el('fl-inp').focus();return;}
      el('fl-num').textContent=numbers[i++];
      setTimeout(showNext,600);
    }
    setTimeout(showNext,700);
    function check(){
      const val=+el('fl-inp').value;
      if(val===sum){el('fl-num').textContent='✅';el('fl-num').style.color='var(--green)';correct++;}
      else{el('fl-num').textContent=`❌ ${sum}`;el('fl-num').style.color='var(--red)';}
      el('fl-input-area').style.display='none';
      setTimeout(nextRound,1000);
    }
    setTimeout(()=>{
      if(el('fl-ok'))el('fl-ok').onclick=check;
      if(el('fl-inp'))el('fl-inp').onkeydown=e=>{if(e.key==='Enter')check();};
    },100);
  }
  nextRound();
  return{destroy(){}};
}

/* ═══════════════════════════════════════
   GAME 14 — Peripheral Vision Trainer
═══════════════════════════════════════ */
function createPeripheralVision(container, onComplete) {
  let score=0, misses=0, timeLeft=45, timer, symbols=[], animFrame;
  const SYMS=['★','◆','●','▲','■','♦','✿','⬟'];

  container.innerHTML=`<div style="text-align:center;width:100%">
    <div class="periph-score">⏱ <b id="pv-tm">45</b>s | Clicked: <b id="pv-sc">0</b> | Missed: <b id="pv-ms">0</b></div>
    <p style="font-size:.8rem;color:var(--txt3);margin:6px 0">Click the symbols appearing at the EDGES. Keep eyes on the center +</p>
    <canvas class="periph-canvas" id="pv-canvas" width="540" height="400"></canvas>
  </div>`;

  const canvas=el('pv-canvas'), ctx=canvas.getContext('2d');
  const W=canvas.width, H=canvas.height;

  function spawnSymbol(){
    const side=rand(0,3);
    let x,y;
    if(side===0){x=rand(10,W-10);y=rand(5,30);}
    else if(side===1){x=rand(W-30,W-5);y=rand(10,H-10);}
    else if(side===2){x=rand(10,W-10);y=rand(H-30,H-5);}
    else{x=rand(5,30);y=rand(10,H-10);}
    symbols.push({x,y,sym:SYMS[rand(0,SYMS.length-1)],born:Date.now(),life:1800});
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#0d1124'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(W/2-1,H/2-12,2,24); ctx.fillRect(W/2-12,H/2-1,24,2);
    ctx.fillStyle='#fff'; ctx.font='bold 18px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('+',W/2,H/2);
    const now=Date.now();
    symbols=symbols.filter(s=>now-s.born<s.life);
    symbols.forEach(s=>{
      const age=(now-s.born)/s.life;
      ctx.globalAlpha=1-age*0.5;
      ctx.fillStyle='#f59e0b'; ctx.font='bold 24px Arial';
      ctx.fillText(s.sym,s.x,s.y);
    });
    ctx.globalAlpha=1;
    animFrame=requestAnimationFrame(draw);
  }

  canvas.onclick=e=>{
    const rect=canvas.getBoundingClientRect();
    const cx=e.clientX-rect.left, cy=e.clientY-rect.top;
    let hit=false;
    symbols=symbols.filter(s=>{
      if(Math.hypot(cx-s.x,cy-s.y)<28){hit=true;return false;}
      return true;
    });
    if(hit){score++;el('pv-sc').textContent=score;}
    else{misses++;el('pv-ms').textContent=misses;}
  };

  timer=setInterval(()=>{
    timeLeft--;el('pv-tm').textContent=timeLeft;
    if(rand(0,1))spawnSymbol();
    if(timeLeft<=0){
      clearInterval(timer);cancelAnimationFrame(animFrame);
      const total=score+misses, acc=total?Math.round(score/total*100):0;
      onComplete({score:Math.min(100,score*4),details:{Clicked:score,Missed:misses,Accuracy:acc+'%'}});
    }
  },1000);
  draw(); spawnSymbol();
  return{destroy(){clearInterval(timer);cancelAnimationFrame(animFrame);}};
}

/* ═══════════════════════════════════════
   GAME 15 — Visual Search
═══════════════════════════════════════ */
function createVisualSearch(container, onComplete) {
  const pairs=[{target:'B',distractor:'E'},{target:'Q',distractor:'O'},{target:'6',distractor:'9'},{target:'p','distractor':'q'},{target:'F',distractor:'E'}];
  let round=0, correct=0, startTime;
  function nextRound(){
    round++;if(round>8){onComplete({score:Math.round(correct*12.5),details:{Found:`${correct}/8`}});return;}
    const {target,distractor}=pairs[rand(0,pairs.length-1)];
    const ROWS=12, COLS=18, total=ROWS*COLS;
    const targetIdx=rand(0,total-1);
    const cells=Array.from({length:total},(_,i)=>i===targetIdx?target:distractor);
    startTime=Date.now();
    container.innerHTML=`<div style="text-align:center;width:100%">
      <div class="round-counter">Round ${round}/8 — Found: ${correct}</div>
      <p style="font-size:.85rem;color:var(--txt2);margin:8px 0">Find the: <strong style="color:var(--yellow);font-size:1.1rem">${target}</strong></p>
      <div class="search-grid" id="vs-grid" style="grid-template-columns:repeat(${COLS},1fr)"></div>
    </div>`;
    const grid=el('vs-grid');
    cells.forEach((ch,i)=>{
      const d=document.createElement('div');
      d.className='search-cell'+(i===targetIdx?' target':'');
      d.textContent=ch; d.dataset.i=i;
      d.onclick=()=>{
        if(i===targetIdx){d.classList.add('found');correct++;setTimeout(nextRound,600);}
        else{d.style.color='var(--red)';setTimeout(()=>d.style.color='',400);}
      };
      grid.appendChild(d);
    });
  }
  nextRound();
  return{destroy(){}};
}

/* ═══════════════════════════════════════
   GAME 16 — Simon Game
═══════════════════════════════════════ */
function createSimon(container, onComplete) {
  const COLORS=['red','green','blue','yellow'];
  let sequence=[], playerIdx=0, level=0, locked=true;

  container.innerHTML=`<div style="text-align:center;width:100%">
    <div class="simon-level" id="si-level">Level 0</div>
    <div class="simon-grid">
      ${COLORS.map(c=>`<div class="simon-btn" data-color="${c}" id="si-${c}"></div>`).join('')}
    </div>
    <p style="margin-top:14px;font-size:.82rem;color:var(--txt3)" id="si-msg">Watch the sequence...</p>
  </div>`;

  COLORS.forEach(c=>{
    el(`si-${c}`).onclick=()=>{ if(locked)return; playerClick(c); };
  });

  function light(c, ms=400){
    return new Promise(res=>{
      el(`si-${c}`).classList.add('lit');
      setTimeout(()=>{el(`si-${c}`).classList.remove('lit');res();},ms);
    });
  }

  async function playSequence(){
    locked=true; el('si-msg').textContent='Watch...';
    await new Promise(r=>setTimeout(r,600));
    for(const c of sequence){await light(c,400);await new Promise(r=>setTimeout(r,200));}
    locked=false; playerIdx=0; el('si-msg').textContent='Your turn!';
  }

  async function playerClick(c){
    await light(c,200);
    if(c===sequence[playerIdx]){
      playerIdx++;
      if(playerIdx===sequence.length){
        locked=true; el('si-msg').textContent='✅ Correct!';
        await new Promise(r=>setTimeout(r,800));
        nextLevel();
      }
    } else {
      locked=true; el('si-msg').textContent='❌ Wrong!';
      const score=Math.min(100,(level-1)*8);
      setTimeout(()=>onComplete({score,details:{Level:level,'Sequence length':level}}),1000);
    }
  }

  function nextLevel(){
    level++; el('si-level').textContent=`Level ${level}`;
    sequence.push(COLORS[rand(0,3)]);
    if(level>12){onComplete({score:100,details:{Level:level,'Perfect run':'Yes'}});return;}
    playSequence();
  }
  nextLevel();
  return{destroy(){}};
}

/* ═══════════════════════════════════════
   GAME 17 — Reaction Time Test
═══════════════════════════════════════ */
function createReactionTime(container, onComplete) {
  let trial=0, times=[], phase='wait', to;
  container.innerHTML=`<div style="text-align:center;width:100%;max-width:500px">
    <p style="color:var(--txt3);font-size:.82rem;margin-bottom:12px">5 trials — Click as fast as possible when the screen turns GREEN</p>
    <div class="reaction-screen wait" id="rt-screen">Click to start</div>
    <div class="reaction-results" id="rt-result"></div>
    <div class="reaction-list" id="rt-list"></div>
  </div>`;
  const screen=el('rt-screen');
  screen.onclick=()=>{
    if(phase==='wait'){
      phase='waiting'; screen.className='reaction-screen ready'; screen.textContent='Wait for green...';
      const delay=rand(1500,4000);
      to=setTimeout(()=>{
        phase='go'; screen.className='reaction-screen go'; screen.textContent='CLICK NOW!';
        screen._start=Date.now();
      },delay);
    } else if(phase==='waiting'){
      clearTimeout(to); phase='wait'; screen.className='reaction-screen wait'; screen.textContent='Too early! Click to retry';
    } else if(phase==='go'){
      const rt=Date.now()-screen._start; times.push(rt); trial++;
      el('rt-list').textContent=times.map((t,i)=>`Trial ${i+1}: ${t}ms`).join('  |  ');
      if(trial>=5){
        const avg=Math.round(times.reduce((a,b)=>a+b)/times.length);
        screen.className='reaction-screen done'; screen.textContent='Done!';
        el('rt-result').textContent=`Avg: ${avg}ms`;
        phase='done';
        const score=Math.max(0,Math.round(100-(avg-150)/3));
        setTimeout(()=>onComplete({score:Math.min(100,score),details:{'Average':avg+'ms','Best':Math.min(...times)+'ms','Trials':5}}),800);
      } else {
        phase='wait'; screen.className='reaction-screen wait'; screen.textContent=`${rt}ms — Click for next trial`;
      }
    }
  };
  return{destroy(){clearTimeout(to);}};
}

/* ═══════════════════════════════════════
   GAME 18 — Multi-Task Challenge
═══════════════════════════════════════ */
function createMultiTask(container, onComplete) {
  const words=['Sun','Moon','Rain','Tree','Fire','Wave','Star','Wind','Rock','Lake'];
  const shapes=['🔴','🟠','🟡','🟢','🔵'];
  let wIdx=0, shapeCount=0, wordAnswers=[], userWordAns=[], timeLeft=30, timer, shapeTimer;

  container.innerHTML=`<div style="width:100%;max-width:680px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <span style="font-size:.82rem;color:var(--txt3)">READ words + COUNT shapes</span>
      <span style="font-weight:700;color:var(--cyan)">⏱ <span id="mt-tm">30</span>s</span>
    </div>
    <div class="multi-task-wrap">
      <div class="mt-panel"><h4>📝 Words</h4><div class="mt-word" id="mt-word">—</div></div>
      <div class="mt-panel"><h4>🔢 Shapes</h4><div class="mt-shape" id="mt-shape">—</div><div class="mt-shape-count">Shapes so far: <b id="mt-sc">?</b></div></div>
    </div>
    <p style="font-size:.78rem;color:var(--txt3);margin-top:10px">When time is up, you'll be asked questions about both tasks.</p>
  </div>`;

  const wordList=shuffle([...words]).slice(0,8);
  const shapeList=Array.from({length:15},()=>shapes[rand(0,shapes.length-1)]);
  let wTimer, sTimer;
  wTimer=setInterval(()=>{if(wIdx<wordList.length){el('mt-word').textContent=wordList[wIdx++];}else el('mt-word').textContent='—';},1800);
  let si=0;
  sTimer=setInterval(()=>{
    if(si<shapeList.length){el('mt-shape').textContent=shapeList[si++];shapeCount++;}
    else el('mt-shape').textContent='—';
  },2200);

  timer=setInterval(()=>{
    timeLeft--;el('mt-tm').textContent=timeLeft;
    if(timeLeft<=0){
      clearInterval(timer);clearInterval(wTimer);clearInterval(sTimer);
      showQuestions();
    }
  },1000);

  function showQuestions(){
    container.innerHTML=`<div style="text-align:center;width:100%;max-width:440px">
      <h3 style="margin-bottom:16px">Answer both questions:</h3>
      <div class="game-panel" style="text-align:left">
        <p style="margin-bottom:8px">1. How many shapes appeared?</p>
        <input id="mt-cnt" type="number" class="math-input" style="width:100%;margin-bottom:16px" placeholder="Count">
        <p style="margin-bottom:8px">2. Which word appeared? <small style="color:var(--txt3)">(type any one)</small></p>
        <input id="mt-word-inp" type="text" class="math-input" style="width:100%;margin-bottom:16px" placeholder="Type a word you saw">
        <button class="btn-primary" id="mt-submit" style="width:100%">Submit</button>
      </div>
    </div>`;
    el('mt-submit').onclick=()=>{
      const cnt=+el('mt-cnt').value, wordAns=el('mt-word-inp').value.trim().toLowerCase();
      const cntOk=Math.abs(cnt-shapeCount)<=2;
      const wordOk=wordList.map(w=>w.toLowerCase()).includes(wordAns);
      const score=Math.round((cntOk?50:0)+(wordOk?50:0));
      onComplete({score,details:{'Shapes actual':shapeCount,'Your count':cnt,'Word match':wordOk?'✅':'❌'}});
    };
  }
  return{destroy(){clearInterval(timer);clearInterval(wTimer);clearInterval(sTimer);}};
}

/* ═══════════════════════════════════════
   GAME 19 — Word Association Speed
═══════════════════════════════════════ */
function createWordAssociation(container, onComplete) {
  const pairs=[{word:'Apple',correct:'Fruit',opts:['Fruit','Engine','Planet','Tool']},{word:'Car',correct:'Vehicle',opts:['Animal','Vehicle','Emotion','Color']},{word:'Dog',correct:'Animal',opts:['Furniture','Animal','Tool','Sport']},{word:'Hammer',correct:'Tool',opts:['Tool','Plant','Liquid','Music']},{word:'Rose',correct:'Flower',opts:['Flower','Metal','Liquid','Number']},{word:'Eagle',correct:'Bird',opts:['Fish','Bird','Reptile','Insect']},{word:'Piano',correct:'Instrument',opts:['Instrument','Vehicle','Food','Planet']},{word:'Ocean',correct:'Water',opts:['Land','Water','Fire','Air']},{word:'Gold',correct:'Metal',opts:['Metal','Plant','Animal','Fabric']},{word:'Soccer',correct:'Sport',opts:['Sport','Movie','Book','Color']}];
  let round=0, correct=0, startTime;
  function nextRound(){
    round++;if(round>10){onComplete({score:correct*10,details:{Correct:`${correct}/10`}});return;}
    const p=pairs[round-1]; startTime=Date.now();
    container.innerHTML=`<div style="text-align:center;width:100%;max-width:440px">
      <div class="round-counter">Round ${round}/10 — Correct: ${correct}</div>
      <div class="assoc-word">${p.word}</div>
      <p style="font-size:.8rem;color:var(--txt3);margin-bottom:14px">What category does it belong to?</p>
      <div class="assoc-choices">${p.opts.map(o=>`<div class="assoc-btn" data-v="${o}">${o}</div>`).join('')}</div>
    </div>`;
    qsa('.assoc-btn',container).forEach(b=>b.onclick=()=>{
      qsa('.assoc-btn',container).forEach(x=>x.style.pointerEvents='none');
      if(b.dataset.v===p.correct){b.classList.add('correct');correct++;}
      else{b.classList.add('wrong');qsa(`.assoc-btn[data-v="${p.correct}"]`,container)[0].classList.add('correct');}
      setTimeout(nextRound,700);
    });
  }
  nextRound();
  return{destroy(){}};
}

/* ═══════════════════════════════════════
   GAME 20 — Story Recall
═══════════════════════════════════════ */
function createStoryRecall(container, onComplete) {
  const stories=[{text:"Maria walked her golden retriever Max through Riverside Park on a Tuesday morning. She found a red umbrella near the fountain and turned it in to the park's security office. The guard thanked her and gave her a small reward coupon for the park café.",questions:[{q:"What is the dog's name?",opts:["Buddy","Max","Rex","Charlie"],ans:1},{q:"Where did Maria walk?",opts:["City Square","Central Park","Riverside Park","Lake View"],ans:2},{q:"What did she find?",opts:["A blue bag","A green wallet","A red umbrella","A yellow hat"],ans:2},{q:"What did Maria receive as a reward?",opts:["Cash","A trophy","A café coupon","A key"],ans:2}]},{text:"Professor Chen delivered her annual climate lecture on Wednesday at the University of Bristol. She showed that ocean temperatures have risen by 1.4 degrees over the past century. Three of her students later launched a startup focused on ocean monitoring technology.",questions:[{q:"Who delivered the lecture?",opts:["Professor Khan","Dr. Smith","Professor Chen","Dean Williams"],ans:2},{q:"Which university hosted the lecture?",opts:["Oxford","Cambridge","Bristol","Edinburgh"],ans:2},{q:"By how much have ocean temperatures risen?",opts:["0.8°","1.1°","1.4°","2.0°"],ans:2},{q:"What did three students create?",opts:["A research paper","A startup","A museum","A TV show"],ans:1}]}];
  const s=stories[rand(0,stories.length-1)]; let answers=new Array(s.questions.length).fill(-1), countdown, phase='read';

  function showStory(){
    let t=30;
    container.innerHTML=`<div style="text-align:center;width:100%;max-width:560px">
      <div class="phase-label">READ carefully — 30 seconds</div>
      <div class="story-text">${s.text}</div>
      <div class="story-countdown" id="sr-cd">30</div>
    </div>`;
    countdown=setInterval(()=>{t--;el('sr-cd').textContent=t;if(t<=0){clearInterval(countdown);showQuestions();}},1000);
  }

  function showQuestions(){
    let html=`<div style="width:100%;max-width:560px"><div class="phase-label">Answer from memory</div>`;
    s.questions.forEach((q,i)=>{
      html+=`<div class="question-block"><p>${i+1}. ${q.q}</p><div class="opt-grid">`;
      q.opts.forEach((o,j)=>html+=`<button class="opt-btn" data-q="${i}" data-a="${j}">${o}</button>`);
      html+=`</div></div>`;
    });
    html+=`<button class="btn-primary" id="sr-sub" style="margin-top:12px;display:none">Submit</button></div>`;
    container.innerHTML=html;
    qsa('.opt-btn',container).forEach(b=>b.onclick=e=>{
      const qi=+e.target.dataset.q, ai=+e.target.dataset.a; answers[qi]=ai;
      qsa(`[data-q="${qi}"]`,container).forEach(x=>x.classList.remove('selected'));
      e.target.classList.add('selected');
      if(answers.every(a=>a!==-1))el('sr-sub').style.display='inline-block';
    });
    el('sr-sub').onclick=()=>{
      let correct=0;
      s.questions.forEach((q,i)=>{
        qsa(`[data-q="${i}"]`,container).forEach(b=>{if(+b.dataset.a===q.ans)b.classList.add('correct');else if(answers[i]===+b.dataset.a)b.classList.add('wrong');});
        if(answers[i]===q.ans)correct++;
      });
      el('sr-sub').style.display='none';
      setTimeout(()=>onComplete({score:correct*25,details:{Correct:`${correct}/${s.questions.length}`}}),1200);
    };
  }
  showStory();
  return{destroy(){clearInterval(countdown);}};
}

/* ═══════════════════════════════════════
   GAME 21 — Symbol Digit Coding
═══════════════════════════════════════ */
function createSymbolDigit(container, onComplete) {
  const syms=['★','◆','●','▲','■','♥','✿','⬟'];
  const key={}; syms.forEach((s,i)=>key[s]=i+1);
  let timeLeft=90, score=0, timer, current=0;
  const taskSyms=Array.from({length:40},()=>syms[rand(0,syms.length-1)]);

  container.innerHTML=`<div style="width:100%;max-width:620px">
    <div style="display:flex;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:.82rem;color:var(--txt3)">Correct: <b id="sd-sc">0</b></span>
      <span style="font-weight:700;color:var(--cyan)">⏱ <span id="sd-tm">90</span>s</span>
    </div>
    <div class="symbol-key">
      ${syms.map(s=>`<div class="sym-pair"><div class="sym">${s}</div><div class="divider"></div><div class="dig">${key[s]}</div></div>`).join('')}
    </div>
    <div class="coding-row" id="sd-row"></div>
    <input id="sd-inp" type="number" class="math-input" style="width:80px;text-align:center;display:block;margin:12px auto" min="1" max="8" placeholder="#">
  </div>`;

  function renderTask(){
    const row=el('sd-row'); row.innerHTML='';
    taskSyms.slice(current,current+10).forEach((s,i)=>{
      row.innerHTML+=`<div class="coding-item"><div class="sym">${s}</div><div class="coded" id="cd-${current+i}" style="width:40px;height:40px;border:1px solid var(--border);border-radius:6px;background:var(--bg2);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem"></div></div>`;
    });
  }

  const inp=el('sd-inp');
  inp.oninput=()=>{
    const v=+inp.value;
    if(v<1||v>8)return;
    const s=taskSyms[current];
    const box=el(`cd-${current}`);
    box.textContent=v;
    if(v===key[s]){box.style.color='var(--green)';score++;el('sd-sc').textContent=score;current++;if(current%10===0&&current<40)renderTask();}
    else{box.style.color='var(--red)';}
    setTimeout(()=>{inp.value='';inp.focus();},150);
    if(current>=40){clearInterval(timer);onComplete({score:Math.min(100,score*2.5),details:{Correct:score,'Items':40}});}
  };

  timer=setInterval(()=>{timeLeft--;el('sd-tm').textContent=timeLeft;if(timeLeft<=0){clearInterval(timer);onComplete({score:Math.min(100,score*2.5),details:{Correct:score,'Time up':'Yes'}});}},1000);
  renderTask(); inp.focus();
  return{destroy(){clearInterval(timer);}};
}

/* ═══════════════════════════════════════
   GAME 22 — Hidden Object Challenge
═══════════════════════════════════════ */
function createHiddenObject(container, onComplete) {
  const targets=[{sym:'🦋',name:'butterfly'},{sym:'🌟',name:'star'},{sym:'🐢',name:'turtle'},{sym:'🍄',name:'mushroom'},{sym:'🦀',name:'crab'}];
  let round=0, correct=0, startTime;
  function nextRound(){
    round++;if(round>5){onComplete({score:correct*20,details:{Found:`${correct}/5`}});return;}
    const t=targets[round-1]; const ROWS=10, COLS=14;
    const noise=['🌿','🌱','🍃','🍂','🌾','🍁','🌲','🌳','🌴','🪨','🪵','🌊','💧','🪸'];
    const ti=rand(0,ROWS*COLS-1);
    const grid=Array.from({length:ROWS*COLS},(_,i)=>i===ti?t.sym:noise[rand(0,noise.length-1)]);
    startTime=Date.now();
    container.innerHTML=`<div style="text-align:center;width:100%">
      <div class="round-counter">Round ${round}/5 — Found: ${correct}</div>
      <div class="hidden-target">Find: <span>${t.sym}</span> (${t.name})</div>
      <div class="hidden-grid" style="grid-template-columns:repeat(${COLS},1fr);width:fit-content;margin:0 auto">
        ${grid.map((em,i)=>`<div class="hid-cell" data-i="${i}">${em}</div>`).join('')}
      </div>
    </div>`;
    qsa('.hid-cell',container).forEach(b=>b.onclick=()=>{
      if(+b.dataset.i===ti){b.classList.add('found');correct++;setTimeout(nextRound,600);}
      else{b.style.background='rgba(239,68,68,.15)';setTimeout(()=>b.style.background='',400);}
    });
  }
  nextRound();
  return{destroy(){}};
}

/* ═══════════════════════════════════════
   GAME 23 — Direction Memory
═══════════════════════════════════════ */
function createDirectionMemory(container, onComplete) {
  const DIRS={up:'↑',down:'↓',left:'←',right:'→'};
  const keys=Object.keys(DIRS);
  let level=4, sequence=[], entered=[], phase='show';

  function nextRound(){
    sequence=Array.from({length:level},()=>keys[rand(0,3)]);
    entered=[]; phase='show';
    let i=0;
    container.innerHTML=`<div style="text-align:center;width:100%">
      <div class="level-indicator">Remember ${level} directions</div>
      <div class="dir-display" id="dir-disp">👀</div>
      <div id="dir-input-area" style="display:none">
        <p style="color:var(--txt2);margin-bottom:10px">Recreate the sequence:</p>
        <div class="dir-buttons">
          <div></div><button class="dir-btn" data-d="up">↑</button><div></div>
          <button class="dir-btn" data-d="left">←</button><div></div><button class="dir-btn" data-d="right">→</button>
          <div></div><button class="dir-btn" data-d="down">↓</button><div></div>
        </div>
        <div class="dir-sequence" id="dir-seq"></div>
      </div>
    </div>`;
    function showNext(){
      if(i>=sequence.length){el('dir-disp').textContent='Now repeat!';el('dir-input-area').style.display='block';phase='input';return;}
      el('dir-disp').textContent=DIRS[sequence[i++]];
      setTimeout(showNext,900);
    }
    setTimeout(showNext,600);
    setTimeout(()=>{ if(el('dir-input-area')) qsa('.dir-btn',container).forEach(b=>b.onclick=e=>addDir(e.target.dataset.d));},500);
  }

  function addDir(d){
    if(phase!=='input')return;
    entered.push(d);
    el('dir-seq').innerHTML=entered.map(k=>DIRS[k]).join(' ');
    if(entered.length===sequence.length){
      const ok=entered.every((v,i)=>v===sequence[i]);
      if(ok&&level<12){level++;setTimeout(nextRound,700);}
      else{
        const score=Math.round(((level-4)/8)*100);
        onComplete({score,details:{'Max span':level+' directions',Level:level-3}});
      }
    }
  }
  nextRound();
  return{destroy(){}};
}

/* ═══════════════════════════════════════
   GAME 24 — Rapid Categorization
═══════════════════════════════════════ */
function createRapidCategorization(container, onComplete) {
  const cats={Animal:['Dog','Cat','Lion','Whale','Eagle','Tiger','Frog','Bear'],Vehicle:['Car','Bus','Train','Rocket','Bicycle','Truck','Boat','Plane'],Fruit:['Apple','Mango','Grape','Banana','Cherry','Lemon','Peach','Kiwi'],Profession:['Doctor','Pilot','Chef','Teacher','Lawyer','Nurse','Farmer','Actor']};
  const catKeys=Object.keys(cats);
  const allWords=catKeys.flatMap(k=>cats[k].map(w=>({word:w,cat:k})));
  let words=shuffle([...allWords]).slice(0,20), idx=0, score=0, wrong=0, timeLeft=45, timer;

  function nextWord(){
    if(idx>=words.length){clearInterval(timer);finish();return;}
    el('rc-word').textContent=words[idx].word;
  }
  container.innerHTML=`<div style="text-align:center;width:100%;max-width:440px">
    <div style="display:flex;gap:20px;justify-content:center;font-size:.82rem;margin-bottom:8px">
      <span>✅ <b id="rc-sc">0</b></span><span>❌ <b id="rc-wr">0</b></span><span>⏱ <b id="rc-tm">45</b>s</span>
    </div>
    <div class="rapid-word" id="rc-word">—</div>
    <div class="rapid-cats">
      ${catKeys.map(c=>`<button class="rapid-cat-btn" data-c="${c}">${c}</button>`).join('')}
    </div>
  </div>`;
  timer=setInterval(()=>{timeLeft--;el('rc-tm').textContent=timeLeft;if(timeLeft<=0){clearInterval(timer);finish();}},1000);
  qsa('.rapid-cat-btn',container).forEach(b=>b.onclick=e=>{
    const chosen=e.target.dataset.c, correct=words[idx]&&words[idx].cat===chosen;
    if(correct){score++;el('rc-sc').textContent=score;e.target.classList.add('correct');setTimeout(()=>e.target.classList.remove('correct'),300);}
    else{wrong++;el('rc-wr').textContent=wrong;e.target.classList.add('wrong');setTimeout(()=>e.target.classList.remove('wrong'),300);}
    idx++; nextWord();
  });
  nextWord();
  function finish(){const total=score+wrong;onComplete({score:Math.min(100,score*4),details:{Correct:score,Wrong:wrong,Accuracy:total?Math.round(score/total*100)+'%':'0%'}});}
  return{destroy(){clearInterval(timer);}};
}

/* ═══════════════════════════════════════
   GAME 25 — Sudoku Mini
═══════════════════════════════════════ */
function createSudokuMini(container, onComplete) {
  let size=4, startTime, timer, elapsed=0;

  function genSolution4(){
    const s=[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]];
    const offsets=[[0,0],[0,2],[2,0],[2,2]];
    const perm=shuffle([1,2,3,4]);
    return s.map(r=>r.map(v=>perm[v-1]));
  }
  function makePuzzle(sol,remove){
    const p=sol.map(r=>[...r]);
    let cnt=0;
    while(cnt<remove){const r=rand(0,sol.length-1),c=rand(0,sol.length-1);if(p[r][c]!==0){p[r][c]=0;cnt++;}}
    return p;
  }

  function buildGame(){
    const sol=genSolution4(), puz=makePuzzle(sol,8);
    startTime=Date.now();
    let html=`<div style="text-align:center;width:100%">
      <p style="font-size:.82rem;color:var(--txt3);margin-bottom:10px">Fill the grid — each row, column & box has 1-${size} once</p>
      <table class="sudoku-board" style="border-collapse:collapse;margin:0 auto"><tbody>`;
    for(let r=0;r<size;r++){
      html+=`<tr>`;
      for(let c=0;c<size;c++){
        const isBox=size===4?(r<2&&c<2||r>=2&&c>=2):(false);
        const borderBottom=r===1&&size===4?'border-bottom:2px solid var(--border2)':'';
        const borderRight=c===1&&size===4?'border-right:2px solid var(--border2)':'';
        if(puz[r][c]){html+=`<td><input class="sudoku-cell given" value="${puz[r][c]}" readonly data-r="${r}" data-c="${c}" style="${borderBottom};${borderRight}"></td>`;}
        else{html+=`<td><input class="sudoku-cell" type="number" min="1" max="${size}" data-r="${r}" data-c="${c}" data-sol="${sol[r][c]}" style="${borderBottom};${borderRight}"></td>`;}
      }
      html+=`</tr>`;
    }
    html+=`</tbody></table>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:16px">
      <button class="btn-primary" id="sdk-check">Check</button>
      <span style="font-size:.82rem;color:var(--txt3);align-self:center">⏱ <span id="sdk-tm">0:00</span></span>
    </div></div>`;
    container.innerHTML=html;
    timer=setInterval(()=>{elapsed=Math.floor((Date.now()-startTime)/1000);el('sdk-tm').textContent=`${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`;},1000);
    el('sdk-check').onclick=checkSudoku;
    qsa('.sudoku-cell:not(.given)',container).forEach(inp=>{
      inp.oninput=()=>{inp.value=inp.value.replace(/[^1-4]/,'');inp.classList.remove('error','correct');};
    });
  }

  function checkSudoku(){
    const inputs=qsa('.sudoku-cell:not(.given)',container);
    let correct=0,total=inputs.length;
    inputs.forEach(inp=>{
      if(+inp.value===+inp.dataset.sol){inp.classList.add('correct');correct++;}
      else inp.classList.add('error');
    });
    if(correct===total){
      clearInterval(timer);
      const score=Math.max(40,100-Math.floor(elapsed/3));
      onComplete({score,details:{'Time':elapsed+'s','Grid':'4×4','Correct':'All'}});
    }
  }
  buildGame();
  return{destroy(){clearInterval(timer);}};
}

/* ═══════════════════════════════════════
   GAME 26 — Tower Logic (Tower of Hanoi)
═══════════════════════════════════════ */
function createTowerLogic(container, onComplete) {
  let numDiscs=3, pegs=[[],[],[]], selected=null, moves=0;
  const colors=['#ef4444','#f97316','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899'];

  function init(){
    pegs=[[...Array.from({length:numDiscs},(_,i)=>numDiscs-i)],[],[]];
    moves=0; selected=null; render();
  }

  function render(){
    const minMoves=Math.pow(2,numDiscs)-1;
    container.innerHTML=`<div style="text-align:center;width:100%">
      <div class="hanoi-stats"><span>Discs: <b>${numDiscs}</b></span><span>Moves: <b id="h-mv">${moves}</b></span><span>Min: <b style="color:var(--yellow)">${minMoves}</b></span></div>
      <div class="hanoi-pegs" id="h-pegs">${pegs.map((_,i)=>`<div class="hanoi-peg-area" id="h-peg-${i}" data-p="${i}"><div class="peg-label">Peg ${String.fromCharCode(65+i)}</div><div class="peg-discs" id="h-discs-${i}"></div><div class="peg-rod"></div><div class="peg-base"></div></div>`).join('')}</div>
      <p style="font-size:.78rem;color:var(--txt3);margin-top:10px">Click a peg to pick top disc, click another peg to place it</p>
    </div>`;
    pegs.forEach((p,pi)=>{
      const discArea=el(`h-discs-${pi}`);
      p.forEach(disc=>{
        const d=document.createElement('div');
        d.className='hanoi-disc';
        d.style.width=(disc*30+20)+'px';
        d.style.background=colors[disc-1];
        d.textContent=disc;
        discArea.appendChild(d);
      });
    });
    qsa('.hanoi-peg-area',container).forEach(peg=>{
      peg.onclick=()=>clickPeg(+peg.dataset.p);
    });
    if(selected!==null)el(`h-peg-${selected}`).classList.add('active');
  }

  function clickPeg(p){
    if(selected===null){
      if(pegs[p].length===0)return;
      selected=p; render();
    } else {
      if(selected===p){selected=null;render();return;}
      const from=pegs[selected], to=pegs[p];
      if(to.length>0&&to[to.length-1]<from[from.length-1]){selected=null;render();return;}
      to.push(from.pop());
      moves++; selected=null;
      if(pegs[2].length===numDiscs&&pegs[0].length===0&&pegs[1].length===0){
        render();
        const minMov=Math.pow(2,numDiscs)-1;
        const score=Math.round(Math.max(20,100-(moves-minMov)*8));
        setTimeout(()=>onComplete({score,details:{Discs:numDiscs,Moves:moves,'Minimum':minMov,'Efficiency':moves===minMov?'Perfect!':'Good'}}),500);
      } else render();
    }
  }
  init();
  return{destroy(){}};
}

/* ═══════════════════════════════════════
   GAME 27 — Trail Making Test
═══════════════════════════════════════ */
function createTrailMaking(container, onComplete) {
  let part='A', startTime, path=[], current=1, animFrame;
  const NODES_A=15, letters='ABCDEFGHIJKLMNO';

  container.innerHTML=`<div style="text-align:center;width:100%">
    <div style="display:flex;gap:16px;justify-content:center;margin-bottom:8px">
      <button class="btn-primary" id="tm-partA">Part A (1→2→3...)</button>
      <button class="btn-secondary" id="tm-partB">Part B (1→A→2→B...)</button>
    </div>
    <canvas class="trail-canvas" id="tm-canvas" width="560" height="380"></canvas>
    <div class="trail-info" id="tm-info">Connect numbers in order</div>
  </div>`;

  el('tm-partA').onclick=()=>startPart('A');
  el('tm-partB').onclick=()=>startPart('B');
  startPart('A');

  function startPart(p){
    part=p; current=1; path=[]; startTime=null;
    el('tm-partA').className=p==='A'?'btn-primary':'btn-secondary';
    el('tm-partB').className=p==='B'?'btn-primary':'btn-secondary';
    buildNodes();
  }

  let nodes=[];
  function buildNodes(){
    const canvas=el('tm-canvas');
    const W=canvas.width, H=canvas.height;
    nodes=[];
    const count=part==='A'?NODES_A:14;
    let attempts=0;
    while(nodes.length<count&&attempts<2000){
      attempts++;
      const nx=rand(30,W-30), ny=rand(30,H-30);
      if(nodes.every(n=>Math.hypot(n.x-nx,n.y-ny)>48)){
        const i=nodes.length;
        let label;
        if(part==='A') label=String(i+1);
        else label=i%2===0?String(Math.floor(i/2)+1):letters[Math.floor(i/2)];
        nodes.push({x:nx,y:ny,label,idx:i});
      }
    }
    draw();
    canvas.onclick=handleClick;
  }

  function getTarget(){
    if(part==='A') return String(current);
    const seq=[];
    for(let i=0;i<14;i++) seq.push(i%2===0?String(Math.floor(i/2)+1):letters[Math.floor(i/2)]);
    return seq[current-1];
  }

  function handleClick(e){
    if(!el('tm-canvas'))return;
    const rect=el('tm-canvas').getBoundingClientRect();
    const cx=e.clientX-rect.left, cy=e.clientY-rect.top;
    const target=getTarget();
    const node=nodes.find(n=>n.label===target&&Math.hypot(n.x-cx,n.y-cy)<22);
    if(!node)return;
    if(!startTime)startTime=Date.now();
    path.push(node); current++;
    const maxNodes=part==='A'?NODES_A:14;
    if(current>maxNodes){
      const elapsed=Math.round((Date.now()-startTime)/1000);
      const score=Math.max(20,100-elapsed*2);
      draw(); cancelAnimationFrame(animFrame);
      setTimeout(()=>onComplete({score,details:{'Part':part,'Time':elapsed+'s','Nodes':maxNodes}}),400);
      return;
    }
    el('tm-info').textContent=`Next: ${getTarget()}`;
    draw();
  }

  function draw(){
    const canvas=el('tm-canvas'); if(!canvas)return;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#0d1124'; ctx.fillRect(0,0,canvas.width,canvas.height);
    if(path.length>1){
      ctx.strokeStyle='rgba(139,92,246,.7)'; ctx.lineWidth=2; ctx.beginPath();
      path.forEach((n,i)=>{ if(i===0)ctx.moveTo(n.x,n.y); else ctx.lineTo(n.x,n.y); });
      ctx.stroke();
    }
    const target=getTarget();
    nodes.forEach(n=>{
      const visited=path.includes(n);
      ctx.beginPath(); ctx.arc(n.x,n.y,18,0,Math.PI*2);
      ctx.fillStyle=visited?'rgba(16,185,129,.3)':n.label===target?'rgba(245,158,11,.25)':'rgba(30,42,78,.8)';
      ctx.fill(); ctx.strokeStyle=visited?'#10b981':n.label===target?'#f59e0b':'#2a3f6a'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle=visited?'#10b981':n.label===target?'#f59e0b':'#94a3b8';
      ctx.font='bold 13px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(n.label,n.x,n.y);
    });
  }
  return{destroy(){cancelAnimationFrame(animFrame);}};
}

/* ═══════════════════════════════════════
   GAME 28 — Face Memory
═══════════════════════════════════════ */
function createFaceMemory(container, onComplete) {
  function genFace(seed){
    const skins=['#fdbcb4','#e8a987','#c68642','#8d5524','#f5d5a5'];
    const hairs=['#2c1b18','#4a3728','#b5651d','#d4a017','#f5d5a5','#888888','#1a1a2e'];
    const sk=skins[seed%5], hr=hairs[(seed*3)%7];
    const eyeSz=[4,5,6][seed%3], mouthW=[18,24,30][seed%3], nose=['small','med','big'][seed%3];
    const eyeY=38+(seed%3)*2, mouthY=56-(seed%2)*3;
    const hairStyle=seed%4;
    const hairPaths=['M15,30 Q50,5 85,30','M20,28 Q50,10 80,28 L80,25 Q50,8 20,25 Z','M10,30 Q50,0 90,30','M25,30 Q50,12 75,30'];
    return`<svg width="80" height="90" viewBox="0 0 100 110">
      <ellipse cx="50" cy="55" rx="32" ry="38" fill="${sk}"/>
      <path d="${hairPaths[hairStyle]}" fill="${hr}" stroke="none"/>
      <circle cx="36" cy="${eyeY}" r="${eyeSz}" fill="#333"/>
      <circle cx="64" cy="${eyeY}" r="${eyeSz}" fill="#333"/>
      <circle cx="37" cy="${eyeY-1}" r="1.5" fill="#fff"/>
      <circle cx="65" cy="${eyeY-1}" r="1.5" fill="#fff"/>
      <ellipse cx="50" cy="${nose==='small'?48:nose==='med'?49:50}" rx="${nose==='small'?4:nose==='med'?5:6}" ry="3" fill="rgba(0,0,0,.1)"/>
      <path d="M${50-mouthW/2},${mouthY} Q50,${mouthY+8} ${50+mouthW/2},${mouthY}" fill="none" stroke="#c45" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`;
  }

  const seeds=shuffle([...Array.from({length:30},(_,i)=>i)]).slice(0,12);
  const studyFaces=seeds.slice(0,6), testFaces=shuffle([...seeds]);
  let phase='study', selected=[], countdown, t=12;

  function showStudy(){
    container.innerHTML=`<div style="text-align:center;width:100%">
      <div class="phase-label">Study these faces — <span id="fm-cd">${t}</span>s</div>
      <div class="face-grid">${studyFaces.map(s=>`<div class="face-card">${genFace(s)}<span>Face</span></div>`).join('')}</div>
    </div>`;
    countdown=setInterval(()=>{t--;if(el('fm-cd'))el('fm-cd').textContent=t;if(t<=0){clearInterval(countdown);showTest();}},1000);
  }

  function showTest(){
    selected=[];
    container.innerHTML=`<div style="text-align:center;width:100%">
      <div class="phase-label">Select all 6 faces you saw</div>
      <div class="face-grid" id="fm-test">${testFaces.map((s,i)=>`<div class="face-card" data-i="${i}" data-s="${s}">${genFace(s)}<span>${selected.length}/6</span></div>`).join('')}</div>
      <button class="btn-primary" id="fm-sub" style="margin-top:14px;display:none">Submit (${selected.length}/6)</button>
    </div>`;
    qsa('.face-card',container).forEach(card=>card.onclick=()=>{
      const si=card.dataset.s;
      if(card.classList.contains('selected')){card.classList.remove('selected');selected=selected.filter(x=>x!==si);}
      else if(selected.length<6){card.classList.add('selected');selected.push(si);}
      const sub=el('fm-sub');
      if(sub){sub.textContent=`Submit (${selected.length}/6)`;sub.style.display=selected.length===6?'inline-block':'none';}
    });
    el('fm-sub').onclick=()=>{
      let correct=0;
      testFaces.forEach((s,i)=>{
        const card=qs(`[data-i="${i}"]`,container);
        const inStudy=studyFaces.includes(s), inSelected=selected.includes(String(s));
        if(inStudy&&inSelected){card.classList.add('correct');correct++;}
        else if(inSelected&&!inStudy)card.classList.add('wrong');
      });
      el('fm-sub').style.display='none';
      setTimeout(()=>onComplete({score:Math.round(correct/6*100),details:{Correct:`${correct}/6`}}),1200);
    };
  }
  showStudy();
  return{destroy(){clearInterval(countdown);}};
}

/* ═══════════════════════════════════════
   GAME 29 — Focus Timer
═══════════════════════════════════════ */
function createFocusTimer(container, onComplete) {
  let timeLeft=90, onTarget=0, total=0, timer, animFrame;
  let dotX=0, dotY=0, dotVx=1.2, dotVy=0.9, tracking=false;
  let mouseX=-99, mouseY=-99;

  container.innerHTML=`<div style="text-align:center;width:100%">
    <div class="focus-stats">⏱ <b id="ft-tm">90</b>s | On Target: <b id="ft-on" style="color:var(--cyan)">0</b>%</div>
    <p style="font-size:.8rem;color:var(--txt3);margin:6px 0">Keep your cursor on the moving dot!</p>
    <canvas class="focus-canvas" id="ft-canvas" width="540" height="380"></canvas>
  </div>`;

  const canvas=el('ft-canvas'), ctx=canvas.getContext('2d');
  const W=canvas.width, H=canvas.height;
  dotX=W/2; dotY=H/2;

  canvas.onmousemove=e=>{
    const r=canvas.getBoundingClientRect();
    mouseX=e.clientX-r.left; mouseY=e.clientY-r.top; tracking=true;
  };
  canvas.onmouseleave=()=>{tracking=false;};

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#0d1124'; ctx.fillRect(0,0,W,H);
    dotX+=dotVx; dotY+=dotVy;
    if(dotX<20||dotX>W-20)dotVx*=-1;
    if(dotY<20||dotY>H-20)dotVy*=-1;
    dotVx+=(Math.random()-.5)*0.05; dotVy+=(Math.random()-.5)*0.05;
    dotVx=Math.max(-2.5,Math.min(2.5,dotVx)); dotVy=Math.max(-2.5,Math.min(2.5,dotVy));
    total++;
    const dist=Math.hypot(mouseX-dotX,mouseY-dotY);
    const hit=tracking&&dist<22;
    if(hit)onTarget++;
    const pct=total?Math.round(onTarget/total*100):0;
    if(el('ft-on'))el('ft-on').textContent=pct;
    ctx.beginPath(); ctx.arc(dotX,dotY,18,0,Math.PI*2);
    ctx.fillStyle=hit?'rgba(16,185,129,.4)':'rgba(139,92,246,.2)'; ctx.fill();
    ctx.beginPath(); ctx.arc(dotX,dotY,12,0,Math.PI*2);
    ctx.fillStyle=hit?'#10b981':'#8b5cf6'; ctx.fill();
    if(tracking&&!hit){
      ctx.beginPath(); ctx.moveTo(mouseX,mouseY);
      ctx.lineTo(dotX,dotY); ctx.strokeStyle='rgba(255,255,255,.1)'; ctx.lineWidth=1; ctx.stroke();
    }
    animFrame=requestAnimationFrame(draw);
  }

  timer=setInterval(()=>{timeLeft--;if(el('ft-tm'))el('ft-tm').textContent=timeLeft;if(timeLeft<=0){clearInterval(timer);cancelAnimationFrame(animFrame);const pct=total?Math.round(onTarget/total*100):0;onComplete({score:pct,details:{'On target':pct+'%','Duration':'90s'}});}},1000);
  draw();
  return{destroy(){clearInterval(timer);cancelAnimationFrame(animFrame);}};
}

/* ═══════════════════════════════════════
   GAME 30 — Speed Comparison
═══════════════════════════════════════ */
function createSpeedComparison(container, onComplete) {
  let round=0, correct=0, totalMs=0, startTime;
  function nextRound(){
    round++;if(round>20){const score=Math.round(correct*4+(10-Math.min(10,totalMs/correct/100||0)));onComplete({score:Math.min(100,score),details:{Correct:`${correct}/20`,'Avg time':Math.round(totalMs/correct||0)+'ms'}});return;}
    let a,b;
    const digits=round<=5?4:round<=12?5:6;
    do{a=rand(10**(digits-1),10**digits-1);b=rand(10**(digits-1),10**digits-1);}while(a===b);
    startTime=Date.now();
    container.innerHTML=`<div style="text-align:center;width:100%;max-width:500px">
      <div class="round-counter">Round ${round}/20 — Correct: ${correct}</div>
      <p style="font-size:.8rem;color:var(--txt3);margin:8px 0">Click the LARGER number</p>
      <div class="comp-numbers">
        <div class="comp-num" data-v="${a}">${a.toLocaleString()}</div>
        <div class="comp-vs">VS</div>
        <div class="comp-num" data-v="${b}">${b.toLocaleString()}</div>
      </div>
    </div>`;
    qsa('.comp-num',container).forEach(btn=>btn.onclick=()=>{
      const rt=Date.now()-startTime; totalMs+=rt;
      const chosen=+btn.dataset.v, answer=Math.max(a,b);
      qsa('.comp-num',container).forEach(x=>x.style.pointerEvents='none');
      if(chosen===answer){btn.classList.add('correct');correct++;}
      else{btn.classList.add('wrong');qsa(`.comp-num[data-v="${answer}"]`,container)[0].classList.add('correct');}
      setTimeout(nextRound,700);
    });
  }
  nextRound();
  return{destroy(){}};
}

/* ═══════════════════════════════════════
   GAME REGISTRY
═══════════════════════════════════════ */
window.GAMES = [
  { id:'fast-reading',        name:'Fast Reading Challenge',   icon:'📖', category:'reading',   desc:'Read at RSVP speed and answer comprehension questions.', create:createFastReadingV2 },
  { id:'number-memory',       name:'Number Memory',            icon:'🔢', category:'memory',    desc:'Remember a growing sequence of digits.', create:createNumberMemoryV2 },
  { id:'pattern-memory',      name:'Pattern Memory',           icon:'🔲', category:'memory',    desc:'Recreate a pattern of highlighted grid cells.', create:createPatternMemoryV2 },
  { id:'stroop-test',         name:'Color-Word Conflict',      icon:'🎨', category:'attention', desc:'Click the ink color, not the word meaning. Stroop test.', create:createStroopV2 },
  { id:'dual-nback',          name:'Dual N-Back',              icon:'🧩', category:'attention', desc:'Press when current position matches N steps ago.', create:createDualNBackV2 },
  { id:'mental-math',         name:'Mental Math Sprint',       icon:'🧮', category:'speed',     desc:'Solve as many math problems as possible in 60 seconds.', create:createMentalMathV2 },
  { id:'missing-shape',       name:'Missing Shape',            icon:'🔮', category:'logic',     desc:'Find the missing piece from the visual pattern.', create:createMissingShapeV2 },
  { id:'matrix-reasoning',    name:'Matrix Reasoning',         icon:'🧠', category:'logic',     desc:'Complete the matrix. Like Raven\'s progressive matrices.', create:createMatrixReasoningV2 },
  { id:'rotation-puzzle',     name:'Rotation Puzzle',          icon:'🔄', category:'logic',     desc:'Identify which rotation matches the original shape.', create:createRotationPuzzleV2 },
  { id:'odd-one-out',         name:'Odd One Out',              icon:'🔍', category:'speed',     desc:'Find the one emoji that doesn\'t belong in the grid.', create:createOddOneOutV2 },
  { id:'sequence-prediction', name:'Sequence Prediction',      icon:'📈', category:'logic',     desc:'Predict the next item in number or letter sequences.', create:createSequencePredictionV2 },
  { id:'memory-cards',        name:'Memory Cards',             icon:'🃏', category:'memory',    desc:'Classic flip-and-match card pairs game.', create:createMemoryCardsV2 },
  { id:'flash-calculation',   name:'Flash Calculation',        icon:'⚡', category:'memory',    desc:'Sum numbers that flash briefly on screen.', create:createFlashCalculationV2 },
  { id:'peripheral-vision',   name:'Peripheral Vision',        icon:'👁', category:'attention', desc:'Click edge symbols while keeping eyes on the center.', create:createPeripheralVisionV2 },
  { id:'visual-search',       name:'Visual Search',            icon:'🎯', category:'speed',     desc:'Find the target letter hidden among hundreds of others.', create:createVisualSearchV2 },
  { id:'simon-game',          name:'Simon Game',               icon:'🔴', category:'attention', desc:'Repeat the growing color sequence.', create:createSimonV2 },
  { id:'reaction-time',       name:'Reaction Time Test',       icon:'⏱', category:'speed',     desc:'Click as fast as possible when the screen turns green.', create:createReactionTimeV2 },
  { id:'multi-task',          name:'Multi-Task Challenge',     icon:'🎭', category:'attention', desc:'Count shapes while reading words simultaneously.', create:createMultiTaskV2 },
  { id:'word-association',    name:'Word Association Speed',   icon:'💬', category:'reading',   desc:'Choose the best category for each stimulus word.', create:createWordAssociationV2 },
  { id:'story-recall',        name:'Story Recall',             icon:'📚', category:'memory',    desc:'Read a short story then answer memory questions.', create:createStoryRecallV2 },
  { id:'symbol-digit',        name:'Symbol Digit Coding',      icon:'🔣', category:'reading',   desc:'Use the key to decode as many symbols as possible.', create:createSymbolDigitV2 },
  { id:'hidden-object',       name:'Hidden Object Challenge',  icon:'🔎', category:'attention', desc:'Find the hidden object among a busy emoji scene.', create:createHiddenObjectV2 },
  { id:'direction-memory',    name:'Direction Memory',         icon:'🧭', category:'memory',    desc:'Memorize and repeat the arrow direction sequence.', create:createDirectionMemoryV2 },
  { id:'rapid-categ',         name:'Rapid Categorization',     icon:'🗂', category:'reading',   desc:'Categorize words as fast as possible in 45 seconds.', create:createRapidCategorizationV2 },
  { id:'sudoku-mini',         name:'Sudoku Mini',              icon:'🔢', category:'logic',     desc:'Fill the 4×4 Sudoku grid with logic.', create:createSudokuMiniV2 },
  { id:'tower-logic',         name:'Tower Logic',              icon:'🗼', category:'logic',     desc:'Move all discs to peg C in minimum moves.', create:createTowerLogic },
  { id:'trail-making',        name:'Trail Making Test',        icon:'🗺', category:'attention', desc:'Connect numbers (Part A) or alternate 1-A-2-B (Part B).', create:createTrailMaking },
  { id:'face-memory',         name:'Face Memory',              icon:'😊', category:'memory',    desc:'Study six faces then identify them among new ones.', create:createFaceMemory },
  { id:'focus-timer',         name:'Focus Timer',              icon:'🎯', category:'attention', desc:'Keep your cursor on the moving dot for 90 seconds.', create:createFocusTimer },
  { id:'speed-comparison',    name:'Speed Comparison',         icon:'⚖', category:'speed',     desc:'Click the larger of two numbers as fast as possible.', create:createSpeedComparison }
];

(function buildLevelRegistries() {
  const baseById = Object.fromEntries(window.GAMES.map(game => [game.id, game]));
  const make = (level, defs) => defs.map((def, index) => {
    const base = baseById[def.base];
    return {
      ...base,
      ...def,
      create: base.create,
      baseId: base.id,
      level,
      order: index + 1
    };
  });

  window.GAME_LEVEL_META = {
    kids: {
      label: 'Kids',
      title: 'Kids IQ Quest',
      subtitle: 'Playful brain games with shapes, pictures, memory, and quick focus.',
      iqLabel: 'Kids IQ Estimate'
    },
    juniors: {
      label: 'Juniors',
      title: 'Junior IQ Lab',
      subtitle: 'School-age reasoning, memory, attention, reading, and speed challenges.',
      iqLabel: 'Junior IQ Estimate'
    },
    seniors: {
      label: 'Seniors',
      title: 'Senior Cognitive IQ',
      subtitle: 'Sharper adult reasoning, processing speed, focus, and memory endurance.',
      iqLabel: 'Senior IQ Estimate'
    }
  };

  window.GAME_LEVELS = {
    kids: make('kids', [
      { base:'memory-cards', id:'kids-picture-pairs', name:'Picture Pairs', icon:'🃏', category:'memory', desc:'Flip friendly picture cards and find matching pairs.' },
      { base:'pattern-memory', id:'kids-light-patterns', name:'Light Patterns', icon:'🔲', category:'memory', desc:'Watch bright tiles and tap the same pattern back.' },
      { base:'number-memory', id:'kids-number-train', name:'Number Train', icon:'🚂', category:'memory', desc:'Remember short number trains as they grow.' },
      { base:'direction-memory', id:'kids-arrow-trail', name:'Arrow Trail', icon:'➡️', category:'memory', desc:'Follow and repeat a short trail of arrows.' },
      { base:'flash-calculation', id:'kids-flash-count', name:'Flash Count', icon:'✨', category:'memory', desc:'Add small numbers that pop onto the screen.' },
      { base:'face-memory', id:'kids-friendly-faces', name:'Friendly Faces', icon:'🙂', category:'memory', desc:'Study simple faces and spot them again.' },
      { base:'odd-one-out', id:'kids-animal-odd-one', name:'Animal Odd One', icon:'🐾', category:'speed', desc:'Find the picture that is different from the rest.' },
      { base:'visual-search', id:'kids-find-the-star', name:'Find the Star', icon:'⭐', category:'speed', desc:'Search a busy grid and tap the target quickly.' },
      { base:'reaction-time', id:'kids-fast-tap', name:'Fast Tap', icon:'👆', category:'speed', desc:'Tap as soon as the signal says go.' },
      { base:'mental-math', id:'kids-counting-sprint', name:'Counting Sprint', icon:'🔢', category:'speed', desc:'Solve quick number facts before time runs out.' },
      { base:'speed-comparison', id:'kids-bigger-number', name:'Bigger Number', icon:'⚖️', category:'speed', desc:'Choose the bigger number as fast as you can.' },
      { base:'missing-shape', id:'kids-missing-shape', name:'Missing Shape', icon:'🔺', category:'logic', desc:'Pick the shape that completes the picture.' },
      { base:'sequence-prediction', id:'kids-next-in-line', name:'Next in Line', icon:'➡️', category:'logic', desc:'Guess what comes next in a simple pattern.' },
      { base:'matrix-reasoning', id:'kids-picture-matrix', name:'Picture Matrix', icon:'🧩', category:'logic', desc:'Complete a small visual puzzle.' },
      { base:'rotation-puzzle', id:'kids-turn-the-shape', name:'Turn the Shape', icon:'🔄', category:'logic', desc:'Find the shape after it turns around.' },
      { base:'sudoku-mini', id:'kids-mini-grid', name:'Mini Grid Logic', icon:'🔢', category:'logic', desc:'Fill a tiny number grid using simple rules.' },
      { base:'tower-logic', id:'kids-tower-builder', name:'Tower Builder', icon:'🗼', category:'logic', desc:'Move pieces carefully to rebuild the tower.' },
      { base:'simon-game', id:'kids-color-repeat', name:'Color Repeat', icon:'🔴', category:'attention', desc:'Watch colors flash and repeat the sequence.' },
      { base:'stroop-test', id:'kids-color-focus', name:'Color Focus', icon:'🎨', category:'attention', desc:'Pick the color while ignoring the word.' },
      { base:'hidden-object', id:'kids-hidden-picture', name:'Hidden Picture', icon:'🔎', category:'attention', desc:'Find a target hiding in a playful scene.' },
      { base:'peripheral-vision', id:'kids-edge-watch', name:'Edge Watch', icon:'👁', category:'attention', desc:'Keep focus in the middle while spotting edge symbols.' },
      { base:'trail-making', id:'kids-dot-path', name:'Dot Path', icon:'🧭', category:'attention', desc:'Connect items in the right order.' },
      { base:'focus-timer', id:'kids-focus-dot', name:'Focus Dot', icon:'🎯', category:'attention', desc:'Track a moving dot and stay focused.' },
      { base:'fast-reading', id:'kids-word-pop', name:'Word Pop', icon:'📖', category:'reading', desc:'Read quick words and answer simple questions.' },
      { base:'story-recall', id:'kids-story-pictures', name:'Story Pictures', icon:'📚', category:'reading', desc:'Read a short story and remember the details.' },
      { base:'word-association', id:'kids-word-sort', name:'Word Sort', icon:'💬', category:'reading', desc:'Put words into the best matching group.' },
      { base:'rapid-categ', id:'kids-quick-sort', name:'Quick Sort', icon:'🗂', category:'reading', desc:'Sort words quickly by category.' },
      { base:'symbol-digit', id:'kids-symbol-code', name:'Symbol Code', icon:'🔣', category:'reading', desc:'Use a simple key to match symbols and numbers.' },
      { base:'dual-nback', id:'kids-back-match', name:'Back Match', icon:'🧩', category:'attention', desc:'Notice when a position matches one seen before.' },
      { base:'multi-task', id:'kids-two-things', name:'Two Things', icon:'🎭', category:'attention', desc:'Watch words and shapes at the same time.' }
    ]),
    juniors: make('juniors', window.GAMES.map(game => ({
      base: game.id,
      id: game.id,
      name: game.name,
      icon: game.icon,
      category: game.category,
      desc: game.desc
    }))),
    seniors: make('seniors', [
      { base:'matrix-reasoning', id:'seniors-advanced-matrix', name:'Advanced Matrix Reasoning', icon:'🧠', category:'logic', desc:'Complete tougher visual matrices using abstract rules.' },
      { base:'missing-shape', id:'seniors-abstract-completion', name:'Abstract Completion', icon:'🔮', category:'logic', desc:'Infer the missing part of a visual reasoning pattern.' },
      { base:'sequence-prediction', id:'seniors-complex-sequences', name:'Complex Sequences', icon:'📈', category:'logic', desc:'Predict the next value in mixed logic sequences.' },
      { base:'rotation-puzzle', id:'seniors-mental-rotation', name:'Mental Rotation', icon:'🔄', category:'logic', desc:'Rotate forms mentally and identify the match.' },
      { base:'sudoku-mini', id:'seniors-logic-grid', name:'Logic Grid', icon:'🔢', category:'logic', desc:'Use constraints to complete a compact logic grid.' },
      { base:'tower-logic', id:'seniors-planning-tower', name:'Planning Tower', icon:'🗼', category:'logic', desc:'Plan efficient moves through a tower puzzle.' },
      { base:'number-memory', id:'seniors-digit-span', name:'Digit Span Challenge', icon:'🔢', category:'memory', desc:'Hold longer digit strings in working memory.' },
      { base:'pattern-memory', id:'seniors-spatial-span', name:'Spatial Span', icon:'🔲', category:'memory', desc:'Recall increasingly complex spatial patterns.' },
      { base:'memory-cards', id:'seniors-card-recall', name:'Card Recall', icon:'🃏', category:'memory', desc:'Match cards while minimizing memory errors.' },
      { base:'flash-calculation', id:'seniors-running-sum', name:'Running Sum', icon:'⚡', category:'memory', desc:'Track fast numbers and keep a mental total.' },
      { base:'direction-memory', id:'seniors-route-memory', name:'Route Memory', icon:'🧭', category:'memory', desc:'Remember and reproduce direction routes.' },
      { base:'face-memory', id:'seniors-face-recognition', name:'Face Recognition', icon:'🙂', category:'memory', desc:'Study subtle face patterns and recognize them later.' },
      { base:'dual-nback', id:'seniors-dual-nback', name:'Dual N-Back', icon:'🧩', category:'attention', desc:'Track position matches across working-memory steps.' },
      { base:'stroop-test', id:'seniors-inhibition-control', name:'Inhibition Control', icon:'🎨', category:'attention', desc:'Suppress the word meaning and respond to color.' },
      { base:'multi-task', id:'seniors-divided-attention', name:'Divided Attention', icon:'🎭', category:'attention', desc:'Manage two streams of information at once.' },
      { base:'trail-making', id:'seniors-trail-switching', name:'Trail Switching', icon:'🗺', category:'attention', desc:'Connect alternating targets with flexible attention.' },
      { base:'hidden-object', id:'seniors-visual-scan', name:'Visual Scan', icon:'🔎', category:'attention', desc:'Search dense scenes with careful visual control.' },
      { base:'focus-timer', id:'seniors-sustained-focus', name:'Sustained Focus', icon:'🎯', category:'attention', desc:'Maintain precision on a moving target.' },
      { base:'reaction-time', id:'seniors-reaction-benchmark', name:'Reaction Benchmark', icon:'⏱', category:'speed', desc:'Measure response speed across multiple trials.' },
      { base:'visual-search', id:'seniors-symbol-search', name:'Symbol Search', icon:'🎯', category:'speed', desc:'Find targets in dense visual arrays.' },
      { base:'mental-math', id:'seniors-math-fluency', name:'Math Fluency', icon:'🧮', category:'speed', desc:'Solve arithmetic rapidly with accuracy.' },
      { base:'speed-comparison', id:'seniors-number-comparison', name:'Number Comparison', icon:'⚖️', category:'speed', desc:'Compare larger values under time pressure.' },
      { base:'odd-one-out', id:'seniors-visual-discrimination', name:'Visual Discrimination', icon:'🔍', category:'speed', desc:'Spot the subtle outlier in a busy field.' },
      { base:'fast-reading', id:'seniors-rapid-reading', name:'Rapid Reading', icon:'📖', category:'reading', desc:'Read quickly and answer comprehension checks.' },
      { base:'story-recall', id:'seniors-detail-recall', name:'Detail Recall', icon:'📚', category:'reading', desc:'Retain details from short written passages.' },
      { base:'word-association', id:'seniors-semantic-speed', name:'Semantic Speed', icon:'💬', category:'reading', desc:'Choose word relationships quickly and accurately.' },
      { base:'rapid-categ', id:'seniors-category-fluency', name:'Category Fluency', icon:'🗂', category:'reading', desc:'Classify words under speed pressure.' },
      { base:'symbol-digit', id:'seniors-coding-speed', name:'Coding Speed', icon:'🔣', category:'reading', desc:'Translate symbols through a key with processing speed.' },
      { base:'peripheral-vision', id:'seniors-peripheral-control', name:'Peripheral Control', icon:'👁', category:'attention', desc:'Use broad attention without losing central focus.' },
      { base:'simon-game', id:'seniors-sequence-control', name:'Sequence Control', icon:'🔴', category:'memory', desc:'Repeat longer color sequences with precision.' }
    ])
  };
})();
