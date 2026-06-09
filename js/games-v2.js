/* ══════════════════════════════════════════════════
   IQ LAB — Improved Games (v2) — Games 1-5
   Mobile-first · Intro screens · Rich animations
══════════════════════════════════════════════════ */

/* ─── Shared v2 helpers ─── */
function fadeIn(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'v2FadeUp .28s ease forwards';
}

function setHdrTimer(txt) { const e = document.getElementById('ghdr-timer'); if (e) e.textContent = txt; }
function setHdrScore(txt) { const e = document.getElementById('ghdr-score'); if (e) e.textContent = txt; }
function clearHdr() { setHdrTimer(''); setHdrScore(''); }
function v2Options() { return window.IQLAB_GAME_OPTIONS || {}; }
function v2Difficulty() { return v2Options().difficulty || 'normal'; }
function v2ByDifficulty(values, fallback) {
  const diff = v2Difficulty();
  return Object.prototype.hasOwnProperty.call(values, diff) ? values[diff] : fallback;
}
function v2Rounds(fallback) {
  const value = +(v2Options().rounds || fallback);
  return Math.max(3, Math.min(20, value || fallback));
}
function v2Duration(fallback) {
  const value = +(v2Options().duration || fallback);
  return Math.max(15, Math.min(120, value || fallback));
}

/* ══════════════════════════════════════════
   GAME 1 v2 — Fast Reading Challenge
══════════════════════════════════════════ */
function createFastReadingV2(container, onComplete) {
  const passages = [
    { topic: '🧠 Brain Science', text: 'The human brain processes information at remarkable speed. Scientists have found the brain can identify familiar words in as little as one hundred and fifty milliseconds. Reading speed can double with regular practice using techniques like reducing inner speech and expanding your visual span.', questions: [{ q: 'How fast can the brain identify words?', opts: ['50 ms', '100 ms', '150 ms', '250 ms'], ans: 2 }, { q: 'What does speed reading reduce?', opts: ['Eye strain', 'Inner speech', 'Word count', 'Memory load'], ans: 1 }, { q: 'What expands with reading practice?', opts: ['Brain size', 'Visual span', 'Vocabulary', 'IQ'], ans: 1 }] },
    { topic: '💤 Memory & Sleep', text: 'Memory works in three stages. Sensory memory lasts a fraction of a second then passes to working memory which holds roughly seven items. Long-term memory stores vast information for decades. Sleep plays a crucial role by consolidating memories from working memory into long-term storage during the night.', questions: [{ q: 'Working memory holds about how many items?', opts: ['3', '5', '7', '12'], ans: 2 }, { q: 'What moves memories to long-term storage?', opts: ['Exercise', 'Sleep', 'Reading aloud', 'Music'], ans: 1 }, { q: 'Sensory memory lasts:', opts: ['Hours', 'Minutes', 'Seconds', 'A fraction of a second'], ans: 3 }] },
    { topic: '💡 Cognitive Flexibility', text: 'Cognitive flexibility is the ability to switch between different concepts or mental tasks. People high in this trait solve problems creatively and adapt quickly to new situations. Learning a new language or musical instrument strengthens this ability significantly over time and keeps the aging brain sharp.', questions: [{ q: 'Cognitive flexibility helps you:', opts: ['Run faster', 'Solve problems creatively', 'Sleep better', 'Eat less'], ans: 1 }, { q: 'Which activity builds cognitive flexibility?', opts: ['Watching TV', 'Sleeping more', 'Learning an instrument', 'Stretching'], ans: 2 }, { q: 'This trait helps people adapt to:', opts: ['New foods', 'New situations', 'New climates', 'New friends'], ans: 1 }] }
  ];

  const speedLevels = [
    { label: 'Level 1', name: 'Easy', wpm: 30 },
    { label: 'Level 2', name: 'Warm Up', wpm: 90 },
    { label: 'Level 3', name: 'Steady', wpm: 180 },
    { label: 'Level 4', name: 'Fast', wpm: 300 }
  ];
  let wpm = 180, pIdx = rand(0, passages.length - 1), rsvpTimer = null, answers = [], qIdx = 0;

  /* PHASE 1 — INTRO */
  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">📖</div>
        <h2 class="v2i-title">Fast Reading</h2>
        <p class="v2i-sub">Words flash one-by-one. Read at speed, then answer questions from memory.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>👁</span><span>Focus on the centre dot — don't track words</span></div>
          <div class="v2i-rule"><span>🎚</span><span>Pick a reading speed below</span></div>
          <div class="v2i-rule"><span>🧠</span><span>After reading, answer 3 comprehension questions</span></div>
          <div class="v2i-rule"><span>⚡</span><span>Faster speed = more bonus points</span></div>
        </div>
        <p class="v2i-pick-label">Choose level:</p>
        <div class="v2-speed-grid">
          ${speedLevels.map(level => `
            <button class="v2-speed-btn${level.wpm === wpm ? ' active' : ''}" data-wpm="${level.wpm}">
              <span class="v2sb-lvl">${level.label}</span>
              <span class="v2sb-val">${level.wpm}</span>
              <span class="v2sb-lbl">${level.name}</span>
            </button>`).join('')}
        </div>
        <div class="v2-speed-seek">
          <div class="v2-speed-readout"><span>Speed</span><strong><span id="v2-wpm-val">${wpm}</span> WPM</strong></div>
          <input type="range" id="v2-wpm-sl" min="30" max="300" value="${wpm}" step="10" aria-label="Reading speed words per minute">
          <div class="v2-speed-range"><span>30 WPM</span><span>300 WPM</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶&thinsp; Start Reading</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    const slider = document.getElementById('v2-wpm-sl');
    const readout = document.getElementById('v2-wpm-val');
    const syncSpeedUI = (value) => {
      wpm = Math.max(30, Math.min(300, +value || 30));
      const activeLevel = speedLevels.reduce((best, level) => (
        Math.abs(level.wpm - wpm) < Math.abs(best.wpm - wpm) ? level : best
      ), speedLevels[0]);
      if (slider) slider.value = wpm;
      if (readout) readout.textContent = wpm;
      container.querySelectorAll('.v2-speed-btn').forEach(btn => {
        btn.classList.toggle('active', +btn.dataset.wpm === activeLevel.wpm);
      });
    };
    container.querySelectorAll('.v2-speed-btn').forEach(b => b.onclick = () => syncSpeedUI(b.dataset.wpm));
    if (slider) slider.oninput = e => syncSpeedUI(e.target.value);
    document.getElementById('v2-go').onclick = startReading;
  }

  /* PHASE 2 — RSVP */
  function startReading() {
    const p = passages[pIdx];
    const words = p.text.split(' ');
    let wIdx = 0, cd = 3;
    setHdrScore(wpm + ' WPM');
    container.innerHTML = `
      <div class="v2-rsvp-stage">
        <div class="v2-rsvp-topbar">
          <span class="v2-topic-tag">${p.topic}</span>
          <span class="v2-wc" id="v2-wc">Word — of ${words.length}</span>
        </div>
        <div class="v2-rsvp-arena">
          <div class="v2-rsvp-mark"></div>
          <div class="v2-rsvp-word" id="v2-rsvp">Get Ready...</div>
        </div>
        <div class="v2-prog-track"><div class="v2-prog-fill" id="v2-prog" style="width:0%"></div></div>
        <p class="v2-rsvp-hint">Focus on the centre · stay still</p>
      </div>`;
    fadeIn(container.querySelector('.v2-rsvp-stage'));
    const wordEl = () => document.getElementById('v2-rsvp');
    const wcEl   = () => document.getElementById('v2-wc');
    const progEl = () => document.getElementById('v2-prog');

    const cdTimer = setInterval(() => {
      const w = wordEl(); if (!w) return;
      cd--; if (cd <= 0) { clearInterval(cdTimer); runRSVP(); return; }
      w.textContent = cd; w.classList.add('v2-countdown');
    }, 700);

    function runRSVP() {
      const ms = 60000 / wpm;
      rsvpTimer = setInterval(() => {
        const w = wordEl(); if (!w) { clearInterval(rsvpTimer); return; }
        if (wIdx >= words.length) { clearInterval(rsvpTimer); setTimeout(showQuestions, 350); return; }
        w.textContent = words[wIdx];
        w.classList.remove('v2-countdown');
        const pEl = progEl(); if (pEl) pEl.style.width = (wIdx / words.length * 100) + '%';
        const wc = wcEl(); if (wc) wc.textContent = `Word ${wIdx + 1} of ${words.length}`;
        wIdx++;
      }, ms);
    }
  }

  /* PHASE 3 — QUESTIONS (one at a time) */
  function showQuestions() {
    clearHdr();
    answers = new Array(passages[pIdx].questions.length).fill(-1);
    qIdx = 0;
    showQ();
  }

  function showQ() {
    const p = passages[pIdx], q = p.questions[qIdx];
    container.innerHTML = `
      <div class="v2-comp-wrap">
        <div class="v2-comp-hdr">
          <span class="v2-comp-badge">Q ${qIdx + 1} / ${p.questions.length}</span>
          <span class="v2-comp-topic">${p.topic}</span>
        </div>
        <div class="v2-comp-card">
          <p class="v2-comp-q">${q.q}</p>
          <div class="v2-comp-opts">
            ${q.opts.map((o, i) => `<button class="v2-comp-opt" data-i="${i}">${o}</button>`).join('')}
          </div>
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-comp-wrap'));
    container.querySelectorAll('.v2-comp-opt').forEach(b => b.onclick = () => {
      container.querySelectorAll('.v2-comp-opt').forEach(x => x.disabled = true);
      const ai = +b.dataset.i; answers[qIdx] = ai;
      b.classList.add(ai === q.ans ? 'correct' : 'wrong');
      if (ai !== q.ans) container.querySelector(`[data-i="${q.ans}"]`).classList.add('correct');
      setTimeout(() => { qIdx++; if (qIdx < p.questions.length) showQ(); else finish(); }, 900);
    });
  }

  function finish() {
    const p = passages[pIdx];
    const correct = answers.filter((a, i) => a === p.questions[i].ans).length;
    const score = Math.round((correct / p.questions.length) * 70 + Math.min(30, wpm / 10));
    onComplete({ score, details: { Speed: wpm + ' WPM', Correct: `${correct} / ${p.questions.length}`, Topic: p.topic } });
  }

  function cleanup() { if (rsvpTimer) clearInterval(rsvpTimer); }
  intro();
  return { destroy: cleanup };
}

/* ══════════════════════════════════════════
   GAME 2 v2 — Number Memory
══════════════════════════════════════════ */
function createNumberMemoryV2(container, onComplete) {
  const startDigits = v2ByDifficulty({ easy: 4, normal: 5, hard: 7 }, 5);
  let level = startDigits, seq = [], entered = [], phase = 'intro';
  const bestSoFar = Storage.getBestScore('number-memory');

  /* INTRO */
  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🔢</div>
        <h2 class="v2i-title">Number Memory</h2>
        <p class="v2i-sub">A sequence of digits flashes on screen. Remember them all — then type them back.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>👀</span><span>Watch the number carefully — it disappears fast</span></div>
          <div class="v2i-rule"><span>⌨️</span><span>Enter each digit using the pad below</span></div>
          <div class="v2i-rule"><span>📈</span><span>Each correct round adds one more digit</span></div>
          <div class="v2i-rule"><span>🏆</span><span>How high can you go? World average is 7</span></div>
        </div>
        ${bestSoFar ? `<div class="v2-best-chip">🏅 Your best: ${bestSoFar} pts</div>` : ''}
        <button class="v2-start-btn" id="v2-go">▶&thinsp; Start — Level 1 (${level} digits)</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = () => startLevel();
  }

  /* SHOW PHASE */
  function startLevel() {
    seq = Array.from({ length: level }, () => rand(0, 9));
    entered = [];
    setHdrScore(`Level ${Math.max(1, level - startDigits + 1)}`);
    setHdrTimer(`${level} digits`);
    container.innerHTML = `
      <div class="v2-nm-wrap">
        <div class="v2-nm-label" id="nm-label">Memorise!</div>
        <div class="v2-nm-number" id="nm-number">${seq.join(' ')}</div>
        <div class="v2-nm-countdown" id="nm-cd"></div>
      </div>`;
    fadeIn(container.querySelector('.v2-nm-wrap'));
    const showMs = level * 600 + 800;
    let remaining = Math.round(showMs / 1000);
    const cdEl = () => document.getElementById('nm-cd');
    const lbEl = () => document.getElementById('nm-label');
    const numEl = () => document.getElementById('nm-number');
    if (cdEl()) cdEl().textContent = remaining + 's';
    const tick = setInterval(() => {
      remaining--; const cd = cdEl(); if (cd) cd.textContent = remaining > 0 ? remaining + 's' : '';
    }, 1000);
    setTimeout(() => {
      clearInterval(tick);
      const nm = numEl(); if (nm) { nm.textContent = '• • • • •'; nm.style.letterSpacing = '.3em'; nm.style.color = 'var(--txt3)'; }
      const lb = lbEl(); if (lb) lb.textContent = 'What was the number?';
      setTimeout(showPad, 300);
    }, showMs);
  }

  /* INPUT PAD */
  function showPad() {
    const padHTML = `
      <div class="v2-nm-wrap">
        <div class="v2-nm-label">Enter the sequence:</div>
        <div class="v2-nm-display" id="nm-display">${'_'.repeat(level).split('').join('  ')}</div>
        <div class="v2-pad">
          ${[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'].map(k =>
            `<button class="v2-pad-key${k==='⌫'?' del':k==='✓'?' ok':''}" data-k="${k}">${k}</button>`
          ).join('')}
        </div>
      </div>`;
    container.innerHTML = padHTML;
    fadeIn(container.querySelector('.v2-nm-wrap'));

    container.querySelectorAll('.v2-pad-key').forEach(b => b.onclick = () => {
      const k = b.dataset.k;
      if (k === '⌫') { entered.pop(); updateDisplay(); }
      else if (k === '✓') { if (entered.length === level) check(); }
      else if (entered.length < level) { entered.push(+k); updateDisplay(); if (entered.length === level) autoCheck(); }
    });
    // Keyboard support
    const onKey = e => {
      if (e.key >= '0' && e.key <= '9' && entered.length < level) { entered.push(+e.key); updateDisplay(); if (entered.length === level) autoCheck(); }
      else if (e.key === 'Backspace') { entered.pop(); updateDisplay(); }
      else if (e.key === 'Enter' && entered.length === level) check();
    };
    document.addEventListener('keydown', onKey);
    container._onKey = onKey;
  }

  function updateDisplay() {
    const d = document.getElementById('nm-display'); if (!d) return;
    const chars = Array.from({ length: level }, (_, i) => i < entered.length ? entered[i] : '_');
    d.textContent = chars.join('  ');
    d.style.color = entered.length === level ? 'var(--cyan)' : 'var(--txt)';
  }

  function autoCheck() {
    setTimeout(check, 300);
  }

  function check() {
    if (container._onKey) { document.removeEventListener('keydown', container._onKey); container._onKey = null; }
    const ok = entered.every((v, i) => v === seq[i]);
    const display = document.getElementById('nm-display');
    if (display) {
      display.textContent = seq.join('  ');
      display.style.color = ok ? 'var(--green)' : 'var(--red)';
    }
    // Show correct sequence for a beat
    container.querySelectorAll('.v2-pad-key').forEach(b => b.disabled = true);
    setTimeout(() => {
      if (ok && level < 20) { level++; startLevel(); }
      else {
        const score = Math.round(((level - startDigits) / (20 - startDigits)) * 100);
        onComplete({ score: Math.min(100, score), details: { 'Max span': level + (ok ? '' : ' (failed)') + ' digits', 'Level': Math.max(1, level - startDigits + 1) } });
      }
    }, 900);
  }

  function cleanup() { if (container._onKey) document.removeEventListener('keydown', container._onKey); }
  intro();
  return { destroy: cleanup };
}

/* ══════════════════════════════════════════
   GAME 3 v2 — Pattern Memory
══════════════════════════════════════════ */
function createPatternMemoryV2(container, onComplete) {
  const targetRounds = v2Rounds(10);
  const difficultyOffset = v2ByDifficulty({ easy: -1, normal: 0, hard: 1 }, 0);
  let round = 0, totalScore = 0, size = 3, lit = [], selected = [];

  function cellPx() {
    const avail = Math.min(container.clientWidth - 48, 360);
    return Math.floor((avail - (size - 1) * 8) / size);
  }

  /* INTRO */
  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🔲</div>
        <h2 class="v2i-title">Pattern Memory</h2>
        <p class="v2i-sub">A pattern of cells will light up briefly. Recreate it by tapping the same cells.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>👁</span><span>Watch which cells glow purple — then they hide</span></div>
          <div class="v2i-rule"><span>👆</span><span>Tap cells to recreate the exact pattern</span></div>
          <div class="v2i-rule"><span>📐</span><span>Grid gets bigger as you progress</span></div>
          <div class="v2i-rule"><span>🏆</span><span>10 rounds total — score based on accuracy</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶&thinsp; Start Round 1</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = nextRound;
  }

  function nextRound() {
    round++;
    if (round > targetRounds) { onComplete({ score: Math.round(totalScore * 10 / targetRounds), details: { Rounds: targetRounds, 'Best grid': size + '×' + size } }); return; }
    const scaledRound = Math.ceil(round * 10 / targetRounds) + difficultyOffset;
    size = scaledRound <= 3 ? 3 : scaledRound <= 6 ? 4 : scaledRound <= 8 ? 5 : 6;
    const total = size * size;
    const count = Math.min(Math.ceil(total * 0.35) + Math.floor(round / 3), total - 1);
    lit = shuffle([...Array(total).keys()]).slice(0, count);
    selected = [];
    setHdrScore(`Score ${totalScore}`);
    setHdrTimer(`Round ${round}/${targetRounds}`);
    showGrid(true);
  }

  function showGrid(showLit) {
    const px = cellPx();
    container.innerHTML = `
      <div class="v2-pm-wrap">
        <div class="v2-pm-top">
          <div class="v2-pm-rounds"><span>Round <b>${round}</b> / ${targetRounds}</span></div>
          <div class="v2-pm-info" id="pm-info">${showLit ? 'Memorise the pattern!' : 'Recreate it!'}</div>
          <div class="v2-pm-score">Score: <b>${totalScore}</b></div>
        </div>
        <div class="v2-prog-track"><div class="v2-prog-fill" style="width:${(round - 1) / targetRounds * 100}%"></div></div>
        <div class="v2-pm-grid" id="pm-grid" style="grid-template-columns:repeat(${size},${px}px);gap:7px">
          ${Array.from({ length: size * size }, (_, i) => `<div class="v2-pm-cell${showLit && lit.includes(i) ? ' lit' : ''}" data-i="${i}" style="width:${px}px;height:${px}px"></div>`).join('')}
        </div>
        ${showLit ? '<p class="v2-pm-hint">Watch carefully...</p>' : `<div style="display:flex;gap:10px;align-items:center;margin-top:12px"><span class="v2-pm-sel-count" id="pm-selc">Selected: <b>0</b> / ${lit.length}</span><button class="v2-check-btn" id="pm-check">Check ✓</button></div>`}
      </div>`;
    fadeIn(container.querySelector('.v2-pm-wrap'));

    if (showLit) {
      // Animate cells in with stagger
      const cells = container.querySelectorAll('.v2-pm-cell.lit');
      cells.forEach((c, i) => { c.style.animationDelay = (i * 60) + 'ms'; c.classList.add('lit-pop'); });
      setTimeout(() => {
        // Hide pattern
        container.querySelectorAll('.v2-pm-cell').forEach(c => c.classList.remove('lit', 'lit-pop'));
        const info = document.getElementById('pm-info'); if (info) info.textContent = 'Now recreate it!';
        // Show input mode
        setTimeout(() => showGrid(false), 300);
      }, 2200);
    } else {
      container.querySelectorAll('.v2-pm-cell').forEach(cell => {
        cell.onclick = () => {
          const i = +cell.dataset.i;
          if (selected.includes(i)) { selected = selected.filter(x => x !== i); cell.classList.remove('sel'); }
          else { selected.push(i); cell.classList.add('sel'); }
          const sc = document.getElementById('pm-selc'); if (sc) sc.innerHTML = `Selected: <b>${selected.length}</b> / ${lit.length}`;
        };
      });
      document.getElementById('pm-check').onclick = checkPattern;
    }
  }

  function checkPattern() {
    container.querySelectorAll('.v2-pm-cell').forEach(c => c.onclick = null);
    document.getElementById('pm-check').disabled = true;
    const cells = container.querySelectorAll('.v2-pm-cell');
    let correct = 0;
    lit.forEach(i => {
      cells[i].classList.remove('sel');
      if (selected.includes(i)) { cells[i].classList.add('ok'); correct++; }
      else cells[i].classList.add('missed');
    });
    selected.filter(i => !lit.includes(i)).forEach(i => cells[i].classList.add('err'));
    const roundScore = Math.round((correct / lit.length) * 10);
    totalScore += roundScore;
    const info = document.getElementById('pm-info');
    if (info) info.textContent = `${correct}/${lit.length} correct · +${roundScore} pts`;
    setTimeout(nextRound, 1100);
  }

  intro();
  return { destroy() {} };
}

/* ══════════════════════════════════════════
   GAME 4 v2 — Color-Word Conflict (Stroop)
══════════════════════════════════════════ */
function createStroopV2(container, onComplete) {
  const duration = v2Duration(60);
  const COLORS = [
    { name: 'Red',    hex: '#ef4444', var: '--red' },
    { name: 'Blue',   hex: '#3b82f6', var: '--blue' },
    { name: 'Green',  hex: '#10b981', var: '--green' },
    { name: 'Yellow', hex: '#f59e0b', var: '--yellow' },
    { name: 'Purple', hex: '#8b5cf6', var: '--purple' }
  ];
  let score = 0, wrong = 0, timeLeft = duration, gameTimer = null, inkColor = null, phase = 'intro';

  /* INTRO */
  function intro() {
    clearHdr();
    const demo = COLORS[0]; // word=Red, ink=Blue
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🎨</div>
        <h2 class="v2i-title">Color-Word Conflict</h2>
        <p class="v2i-sub">Your brain wants to read the word — but you must click the <strong>ink colour</strong>.</p>
        <div class="v2-stroop-demo">
          <div class="v2-demo-word" style="color:${COLORS[1].hex}">Red</div>
          <p class="v2-demo-hint">↑ What colour is this text? (Answer: Blue — not Red!)</p>
        </div>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>🖊</span><span>Ignore what the word <em>says</em></span></div>
          <div class="v2i-rule"><span>🎨</span><span>Click the <strong>colour of the ink</strong></span></div>
          <div class="v2i-rule"><span>⏱</span><span>60 seconds — score as many as you can</span></div>
          <div class="v2i-rule"><span>🚀</span><span>Speed and accuracy both count</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶&thinsp; Start Game</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = startCountdown;
  }

  /* COUNTDOWN */
  function startCountdown() {
    container.innerHTML = `<div class="v2-cd-wrap"><div class="v2-cd-num" id="v2-cd">3</div><p style="color:var(--txt3)">Get ready...</p></div>`;
    fadeIn(container.querySelector('.v2-cd-wrap'));
    let cd = 3;
    const t = setInterval(() => {
      cd--;
      const el = document.getElementById('v2-cd');
      if (!el) { clearInterval(t); return; }
      if (cd <= 0) { clearInterval(t); startGame(); return; }
      el.textContent = cd;
    }, 700);
  }

  /* GAME */
  function startGame() {
    phase = 'play'; score = 0; wrong = 0; timeLeft = duration;
    container.innerHTML = `
      <div class="v2-stroop-wrap">
        <div class="v2-stroop-hud">
          <div class="v2-sh-block"><span class="v2-sh-val green" id="st-sc">0</span><span class="v2-sh-lbl">✅ Correct</span></div>
          <div class="v2-sh-timer">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--border)" stroke-width="6"/>
              <circle id="st-ring" cx="32" cy="32" r="26" fill="none" stroke="var(--cyan)"
                stroke-width="6" stroke-dasharray="163" stroke-dashoffset="0"
                stroke-linecap="round" transform="rotate(-90 32 32)"/>
            </svg>
            <span class="v2-sh-timer-txt" id="st-tm">${duration}</span>
          </div>
          <div class="v2-sh-block"><span class="v2-sh-val red" id="st-wr">0</span><span class="v2-sh-lbl">❌ Wrong</span></div>
        </div>
        <div class="v2-stroop-arena" id="st-arena">
          <div class="v2-sa-flash" id="st-flash"></div>
          <div class="v2-sa-word" id="st-word"></div>
        </div>
        <p class="v2-stroop-prompt">Tap the <strong>ink colour</strong></p>
        <div class="v2-stroop-btns" id="st-btns">
          ${COLORS.map(c => `<button class="v2-stroop-btn" data-name="${c.name}" style="background:${c.hex}">${c.name}</button>`).join('')}
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-stroop-wrap'));
    nextWord();
    container.querySelectorAll('.v2-stroop-btn').forEach(b => b.onclick = () => handleClick(b.dataset.name));
    gameTimer = setInterval(tick, 1000);
  }

  function nextWord() {
    const word = COLORS[rand(0, COLORS.length - 1)];
    inkColor = COLORS[rand(0, COLORS.length - 1)];
    const w = document.getElementById('st-word'); if (!w) return;
    w.textContent = word.name;
    w.style.color = inkColor.hex;
  }

  function handleClick(name) {
    if (phase !== 'play') return;
    const flash = document.getElementById('st-flash');
    if (name === inkColor.name) {
      score++;
      if (flash) { flash.style.background = 'rgba(16,185,129,.18)'; flash.style.opacity = '1'; setTimeout(() => flash.style.opacity = '0', 180); }
      document.getElementById('st-sc').textContent = score;
    } else {
      wrong++;
      if (flash) { flash.style.background = 'rgba(239,68,68,.18)'; flash.style.opacity = '1'; setTimeout(() => flash.style.opacity = '0', 180); }
      document.getElementById('st-wr').textContent = wrong;
    }
    nextWord();
  }

  function tick() {
    timeLeft--;
    const tm = document.getElementById('st-tm'); if (tm) tm.textContent = timeLeft;
    const ring = document.getElementById('st-ring');
    if (ring) ring.style.strokeDashoffset = 163 * (1 - timeLeft / duration);
    if (timeLeft <= 0) {
      clearInterval(gameTimer); phase = 'done';
      const total = score + wrong, acc = total ? Math.round(score / total * 100) : 0;
      onComplete({ score: Math.round(score * 90 / duration), details: { Correct: score, Wrong: wrong, Accuracy: acc + '%', 'Per minute': Math.round(score * 60 / duration) } });
    }
  }

  function cleanup() { if (gameTimer) clearInterval(gameTimer); }
  intro();
  return { destroy: cleanup };
}

/* ══════════════════════════════════════════
   GAME 5 v2 — Dual N-Back
══════════════════════════════════════════ */
function createDualNBackV2(container, onComplete) {
  const N = v2ByDifficulty({ easy: 1, normal: 2, hard: 3 }, 2);
  const TRIALS = Math.max(N + 6, v2Rounds(10) + N);
  const positions = Array.from({ length: TRIALS }, () => rand(0, 8));
  let trial = 0, hits = 0, falseAlarms = 0, responded = false, trialTimer = null, phase = 'intro';

  /* INTRO */
  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🧩</div>
        <h2 class="v2i-title">Dual N-Back</h2>
        <p class="v2i-sub">A gold square flashes in different positions. Press <strong>Match</strong> when the current position is the same as <strong>${N} steps ago</strong>.</p>
        <div class="v2-nback-demo">
          <div class="v2-nbd-row">
            ${[0,1,2,3,4].map(i => `<div class="v2-nbd-pos ${i===1?'nbd-was':i===3?'nbd-now':''}">${i===1?'Was':i===3?'Now':i===2?'N=2':'·'}</div>`).join('')}
          </div>
          <p class="v2-nbd-hint">Position at step 3 = position at step 1 → Press Match!</p>
        </div>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>👁</span><span>Watch the square flash in the 3×3 grid</span></div>
          <div class="v2i-rule"><span>🎯</span><span>Press <strong>Position Match</strong> when it's in the same spot as N=${N} steps back</span></div>
          <div class="v2i-rule"><span>⚠️</span><span>Don't press when there's no match (false alarm)</span></div>
          <div class="v2i-rule"><span>📊</span><span>${TRIALS} trials · your accuracy is scored</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶&thinsp; Start N-Back</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = startGame;
  }

  /* GAME */
  function startGame() {
    phase = 'play'; trial = 0; hits = 0; falseAlarms = 0;
    container.innerHTML = `
      <div class="v2-nback-wrap">
        <div class="v2-nb-topbar">
          <div class="v2-nb-badge">N = ${N}</div>
          <div class="v2-nb-trial" id="nb-trial">Trial — / ${TRIALS - N}</div>
          <div class="v2-nb-stats">✅<b id="nb-h">0</b> &nbsp; ❌<b id="nb-fa">0</b></div>
        </div>
        <div class="v2-nb-progress"><div class="v2-nb-prog-fill" id="nb-prog" style="width:0%"></div></div>
        <div class="v2-nb-grid" id="nb-grid">
          ${Array.from({ length: 9 }, (_, i) => `<div class="v2-nb-sq" id="nb-sq-${i}"></div>`).join('')}
        </div>
        <button class="v2-nb-btn" id="nb-match">
          <div class="v2-nb-btn-inner">
            <span class="v2-nb-btn-icon">🎯</span>
            <span>Position Match</span>
          </div>
          <span class="v2-nb-btn-sub">Tap when current = ${N} steps ago</span>
        </button>
        <div class="v2-nb-feedback" id="nb-fb"></div>
      </div>`;
    fadeIn(container.querySelector('.v2-nback-wrap'));
    document.getElementById('nb-match').onclick = () => respond();
    setTimeout(runTrial, 800);
  }

  function runTrial() {
    if (trial >= TRIALS) { clearTimeout(trialTimer); finish(); return; }
    const pos = positions[trial];
    // Light up
    document.querySelectorAll('.v2-nb-sq').forEach(sq => sq.classList.remove('lit'));
    const sq = document.getElementById(`nb-sq-${pos}`); if (sq) sq.classList.add('lit');
    responded = false;
    const trialDisplay = Math.max(0, trial - N + 1);
    const tEl = document.getElementById('nb-trial'); if (tEl) tEl.textContent = `Trial ${trialDisplay} / ${TRIALS - N}`;
    const pEl = document.getElementById('nb-prog'); if (pEl) pEl.style.width = (trial / TRIALS * 100) + '%';

    trialTimer = setTimeout(() => {
      // Check if should have responded
      const isMatch = trial >= N && positions[trial] === positions[trial - N];
      if (isMatch && !responded) {
        // Miss — no penalty shown, just not a hit
      }
      document.querySelectorAll('.v2-nb-sq').forEach(sq => sq.classList.remove('lit'));
      trial++;
      trialTimer = setTimeout(runTrial, 400);
    }, 1600);
  }

  function respond() {
    if (responded || phase !== 'play') return;
    responded = true;
    const isMatch = trial >= N && positions[trial] === positions[trial - N];
    const btn = document.getElementById('nb-match');
    const fb = document.getElementById('nb-fb');
    if (btn) { btn.classList.add('pressed'); setTimeout(() => btn.classList.remove('pressed'), 220); }
    if (isMatch) {
      hits++;
      if (fb) { fb.textContent = '✅ Hit!'; fb.style.color = 'var(--green)'; }
      const h = document.getElementById('nb-h'); if (h) h.textContent = hits;
    } else {
      falseAlarms++;
      if (fb) { fb.textContent = '❌ False alarm'; fb.style.color = 'var(--red)'; }
      const fa = document.getElementById('nb-fa'); if (fa) fa.textContent = falseAlarms;
    }
    setTimeout(() => { const fb2 = document.getElementById('nb-fb'); if (fb2) fb2.textContent = ''; }, 600);
  }

  function finish() {
    phase = 'done';
    let correctTargets = 0;
    for (let i = N; i < TRIALS; i++) if (positions[i] === positions[i - N]) correctTargets++;
    const missRate = correctTargets > 0 ? (correctTargets - hits) / correctTargets : 0;
    const faRate = (TRIALS - N - correctTargets) > 0 ? falseAlarms / (TRIALS - N - correctTargets) : 0;
    const score = Math.round(Math.max(0, (1 - missRate * 0.7 - faRate * 0.3)) * 100);
    onComplete({ score, details: { 'N value': N, Hits: `${hits}/${correctTargets}`, 'False alarms': falseAlarms, Trials: TRIALS } });
  }

  function cleanup() { clearTimeout(trialTimer); phase = 'done'; }
  intro();
  return { destroy: cleanup };
}

/* ══════════════════════════════════════════════════
   SHARED — shape SVG renderer (games 6-10)
══════════════════════════════════════════════════ */
function v2Shape(shape, color, sz, outline) {
  const s = sz || 52, h = s / 2;
  const f = outline ? 'none' : color, st = outline ? color : 'none', sw = outline ? 3 : 0;
  const p = {
    circle:   `<circle cx="${h}" cy="${h}" r="${h*.77}" fill="${f}" stroke="${st}" stroke-width="${sw}"/>`,
    square:   `<rect x="${s*.11}" y="${s*.11}" width="${s*.78}" height="${s*.78}" rx="${s*.06}" fill="${f}" stroke="${st}" stroke-width="${sw}"/>`,
    triangle: `<polygon points="${h},${s*.07} ${s*.93},${s*.93} ${s*.07},${s*.93}" fill="${f}" stroke="${st}" stroke-width="${sw}"/>`,
    diamond:  `<polygon points="${h},${s*.06} ${s*.94},${h} ${h},${s*.94} ${s*.06},${h}" fill="${f}" stroke="${st}" stroke-width="${sw}"/>`,
    star:     `<polygon points="${h},${s*.08} ${s*.60},${s*.38} ${s*.93},${s*.38} ${s*.65},${s*.57} ${s*.77},${s*.91} ${h},${s*.70} ${s*.23},${s*.91} ${s*.35},${s*.57} ${s*.07},${s*.38} ${s*.40},${s*.38}" fill="${f}" stroke="${st}" stroke-width="${sw}"/>`,
    hexagon:  `<polygon points="${h},${s*.07} ${s*.93},${s*.25} ${s*.93},${s*.75} ${h},${s*.93} ${s*.07},${s*.75} ${s*.07},${s*.25}" fill="${f}" stroke="${st}" stroke-width="${sw}"/>`,
    cross:    `<path d="M${s*.33},${s*.1}L${s*.67},${s*.1}L${s*.67},${s*.33}L${s*.9},${s*.33}L${s*.9},${s*.67}L${s*.67},${s*.67}L${s*.67},${s*.9}L${s*.33},${s*.9}L${s*.33},${s*.67}L${s*.1},${s*.67}L${s*.1},${s*.33}L${s*.33},${s*.33}Z" fill="${f}"/>`,
    pentagon: `<polygon points="${h},${s*.07} ${s*.93},${s*.38} ${s*.76},${s*.93} ${s*.24},${s*.93} ${s*.07},${s*.38}" fill="${f}" stroke="${st}" stroke-width="${sw}"/>`
  };
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">${p[shape]||p.circle}</svg>`;
}

/* Asymmetric path shapes for rotation puzzle */
const ROT_SHAPES = [
  'M85,50 L48,12 L48,36 L15,36 L15,64 L48,64 L48,88 Z',         // arrow right
  'M20,15 L55,15 L55,60 L80,60 L80,85 L20,85 Z',                 // L-bracket
  'M15,15 L50,15 L50,50 L85,50 L85,85 L50,85 L50,52 L18,52 Z',  // staircase
  'M25,15 L75,15 L75,55 L55,55 L55,85 L25,85 Z',                 // hook / F-shape
  'M30,12 L80,12 L80,45 L55,52 L55,88 L30,88 Z'                  // flag
];
function rotSVG(pathD, deg, color, sz) {
  const s = sz || 90;
  return `<svg width="${s}" height="${s}" viewBox="0 0 100 100"><g transform="rotate(${deg} 50 50)"><path d="${pathD}" fill="${color}"/></g></svg>`;
}

/* ══════════════════════════════════════════
   GAME 6 v2 — Mental Math Sprint
══════════════════════════════════════════ */
function createMentalMathV2(container, onComplete) {
  const duration = v2Duration(60);
  const difficultyShift = v2ByDifficulty({ easy: 4, normal: 0, hard: -4 }, 0);
  let timeLeft = duration, score = 0, streak = 0, maxStreak = 0;
  let a, b, op, ans, entered = '', gameTimer = null, phase = 'intro';

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🧮</div>
        <h2 class="v2i-title">Mental Math Sprint</h2>
        <p class="v2i-sub">Solve as many calculations as you can in 60 seconds. Operations get harder as your score climbs.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>🟢</span><span>Score 0–4 → Addition &amp; Subtraction</span></div>
          <div class="v2i-rule"><span>🟡</span><span>Score 5–11 → Multiplication added</span></div>
          <div class="v2i-rule"><span>🔴</span><span>Score 12+ → Division added</span></div>
          <div class="v2i-rule"><span>🔥</span><span>Build a streak — never stop!</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start (60 seconds)</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = doCountdown;
  }

  function doCountdown() {
    let cd = 3;
    container.innerHTML = `<div class="v2-cd-wrap"><div class="v2-cd-num" id="v2-cd">3</div><p style="color:var(--txt3)">Get ready…</p></div>`;
    fadeIn(container.querySelector('.v2-cd-wrap'));
    const t = setInterval(() => {
      cd--; const e = document.getElementById('v2-cd');
      if (!e) { clearInterval(t); return; }
      if (cd <= 0) { clearInterval(t); startGame(); } else e.textContent = cd;
    }, 700);
  }

  function makeQ() {
    const challengeScore = score + difficultyShift;
    const ops = challengeScore < 5 ? ['+', '−'] : challengeScore < 12 ? ['+', '−', '×'] : ['+', '−', '×', '÷'];
    op = ops[rand(0, ops.length - 1)];
    if (op === '+')  { a = rand(10, 99); b = rand(10, 99); ans = a + b; }
    else if (op === '−') { a = rand(20, 99); b = rand(1, a - 1); ans = a - b; }
    else if (op === '×') { a = rand(2, 12); b = rand(2, 12); ans = a * b; }
    else { ans = rand(2, 12); b = rand(2, 12); a = ans * b; }
  }

  function startGame() {
    phase = 'play'; score = 0; streak = 0; maxStreak = 0; timeLeft = duration; entered = '';
    makeQ(); renderGame();
    gameTimer = setInterval(tick, 1000);
  }

  function renderGame() {
    setHdrScore(`${score} solved`);
    container.innerHTML = `
      <div class="v2-mm-wrap">
        <div class="v2-mm-timerbar-wrap"><div class="v2-mm-timerbar" id="mm-bar"></div></div>
        <div class="v2-mm-hud">
          <div class="v2-mm-hud-item"><span class="v2-mm-hud-val" id="mm-sc">0</span><span class="v2-mm-hud-lbl">Score</span></div>
          <div class="v2-mm-hud-item main"><span class="v2-mm-hud-val cyan" id="mm-tm">${duration}</span><span class="v2-mm-hud-lbl">Seconds</span></div>
          <div class="v2-mm-hud-item"><span class="v2-mm-hud-val yellow" id="mm-st"></span><span class="v2-mm-hud-lbl">Streak</span></div>
        </div>
        <div class="v2-mm-problem" id="mm-prob">${a} <span class="v2-mm-op">${op}</span> ${b} <span class="v2-mm-eq">=</span> <span class="v2-mm-q">?</span></div>
        <div class="v2-mm-display" id="mm-disp">—</div>
        <div class="v2-mm-fb" id="mm-fb"></div>
        <div class="v2-pad" style="width:100%;max-width:300px">
          ${[1,2,3,4,5,6,7,8,9,'⌫',0,'='].map(k =>
            `<button class="v2-pad-key${k==='⌫'?' del':k==='='?' ok':''}" data-k="${k}">${k === '=' ? '✓ Enter' : k}</button>`
          ).join('')}
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-mm-wrap'));
    container.querySelectorAll('.v2-pad-key').forEach(b => b.onclick = () => tapKey(b.dataset.k));
    const onKey = e => {
      if (phase !== 'play') return;
      if (e.key >= '0' && e.key <= '9') tapKey(e.key);
      else if (e.key === 'Backspace') tapKey('⌫');
      else if (e.key === 'Enter') tapKey('=');
    };
    document.addEventListener('keydown', onKey);
    container._mmKey = onKey;
  }

  function tapKey(k) {
    if (phase !== 'play') return;
    if (k === '⌫') entered = entered.slice(0, -1);
    else if (k === '=') { submit(); return; }
    else if (entered.length < 5) entered += k;
    const d = document.getElementById('mm-disp');
    if (d) { d.textContent = entered || '—'; d.style.color = 'var(--txt)'; }
  }

  function submit() {
    if (!entered) return;
    const val = parseInt(entered), correct = val === ans;
    const d = document.getElementById('mm-disp'), fb = document.getElementById('mm-fb');
    if (correct) {
      score++; streak++; maxStreak = Math.max(maxStreak, streak);
      if (d) { d.textContent = '✅ ' + ans; d.style.color = 'var(--green)'; }
      const sc = document.getElementById('mm-sc'); if (sc) sc.textContent = score;
      const st = document.getElementById('mm-st'); if (st) st.textContent = streak >= 3 ? streak + ' 🔥' : '';
      setHdrScore(score + ' solved');
    } else {
      streak = 0;
      if (d) { d.textContent = `✗ = ${ans}`; d.style.color = 'var(--red)'; }
      if (fb) { fb.textContent = `${a} ${op} ${b} = ${ans}`; fb.style.color = 'var(--txt3)'; }
      const st = document.getElementById('mm-st'); if (st) st.textContent = '';
    }
    entered = '';
    setTimeout(() => {
      if (phase !== 'play') return;
      makeQ();
      const prob = document.getElementById('mm-prob');
      if (prob) { prob.innerHTML = `${a} <span class="v2-mm-op">${op}</span> ${b} <span class="v2-mm-eq">=</span> <span class="v2-mm-q">?</span>`; prob.style.animation='none'; prob.offsetHeight; prob.style.animation='v2FadeUp .18s'; }
      if (d) { d.textContent = '—'; d.style.color = 'var(--txt)'; }
      const fb2 = document.getElementById('mm-fb'); if (fb2) fb2.textContent = '';
    }, 480);
  }

  function tick() {
    timeLeft--;
    const tm = document.getElementById('mm-tm'); if (tm) tm.textContent = timeLeft;
    const bar = document.getElementById('mm-bar');
    if (bar) {
      bar.style.width = (timeLeft / duration * 100) + '%';
      if (timeLeft <= 10) bar.style.background = 'var(--red)';
      else if (timeLeft <= 20) bar.style.background = 'var(--yellow)';
    }
    if (timeLeft <= 0) {
      clearInterval(gameTimer); phase = 'done';
      onComplete({ score: Math.min(100, Math.round(score * 300 / duration)), details: { Correct: score, 'Best streak': maxStreak + ' 🔥', Operations: score + difficultyShift >= 12 ? '+−×÷' : score + difficultyShift >= 5 ? '+−×' : '+−' } });
    }
  }

  function cleanup() {
    clearInterval(gameTimer);
    if (container._mmKey) { document.removeEventListener('keydown', container._mmKey); container._mmKey = null; }
  }
  intro();
  return { destroy: cleanup };
}

/* ══════════════════════════════════════════
   GAME 7 v2 — Missing Shape
══════════════════════════════════════════ */
function createMissingShapeV2(container, onComplete) {
  const targetRounds = v2Rounds(10);
  const SHAPES = ['circle','square','triangle','diamond','star','hexagon','pentagon','cross'];
  const COLORS = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899'];
  let round = 0, correct = 0;

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🔮</div>
        <h2 class="v2i-title">Missing Shape</h2>
        <p class="v2i-sub">Study the 3×3 grid and find the piece that logically belongs in the bottom-right cell.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>🔲</span><span>Each row shares the same <strong>shape</strong></span></div>
          <div class="v2i-rule"><span>🎨</span><span>Each column shares the same <strong>colour</strong></span></div>
          <div class="v2i-rule"><span>❓</span><span>Pick the piece that completes both rules</span></div>
          <div class="v2i-rule"><span>🏆</span><span>10 rounds · 10 points each</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Puzzle</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = nextRound;
  }

  function makeMatrix() {
    const ruleType = rand(0, 1);
    const rowShapes = shuffle([...SHAPES]).slice(0, 3);
    const colColors = shuffle([...COLORS]).slice(0, 3);
    let matrix;
    if (ruleType === 0) {
      matrix = Array.from({ length: 3 }, (_, r) => Array.from({ length: 3 }, (_, c) => ({ sh: rowShapes[r], cl: colColors[c] })));
    } else {
      matrix = Array.from({ length: 3 }, (_, r) => Array.from({ length: 3 }, (_, c) => ({ sh: rowShapes[c], cl: colColors[r] })));
    }
    const ans = matrix[2][2];
    const wrongs = [
      { sh: matrix[0][2].sh, cl: matrix[2][0].cl },
      { sh: matrix[2][0].sh, cl: matrix[0][2].cl },
      { sh: matrix[1][1].sh, cl: matrix[1][0].cl }
    ].filter(w => !(w.sh === ans.sh && w.cl === ans.cl));
    return { matrix, ans, choices: shuffle([ans, ...wrongs.slice(0, 3)]) };
  }

  function nextRound() {
    round++; if (round > targetRounds) { onComplete({ score: Math.round(correct * 100 / targetRounds), details: { Correct: `${correct}/${targetRounds}` } }); return; }
    const { matrix, ans, choices } = makeMatrix();
    const sz = Math.min(54, Math.floor((Math.min(container.clientWidth, 340) - 40) / 3));
    setHdrTimer(`Round ${round}/${targetRounds}`); setHdrScore(`${correct} correct`);
    container.innerHTML = `
      <div class="v2-ms-wrap">
        <div class="v2-ms-topbar">
          <span>Round <b>${round}</b> / ${targetRounds}</span>
          <span style="color:var(--txt3)">Correct: <b style="color:var(--green)">${correct}</b></span>
        </div>
        <div class="v2-prog-track" style="width:100%;max-width:340px"><div class="v2-prog-fill" style="width:${(round-1)/targetRounds*100}%"></div></div>
        <div class="v2-ms-matrix" style="grid-template-columns:repeat(3,${sz+14}px);gap:7px">
          ${matrix.map((row, r) => row.map((cell, c) => {
            const miss = r === 2 && c === 2;
            return `<div class="v2-ms-cell${miss ? ' missing' : ''}" style="width:${sz+14}px;height:${sz+14}px">
              ${miss ? '<span class="v2-ms-qmark">?</span>' : v2Shape(cell.sh, cell.cl, sz)}
            </div>`;
          }).join('')).join('')}
        </div>
        <p class="v2-ms-prompt">Choose the missing piece:</p>
        <div class="v2-ms-choices">
          ${choices.map((ch, i) => `
            <div class="v2-ms-choice" data-i="${i}" data-ok="${ch.sh === ans.sh && ch.cl === ans.cl}">
              ${v2Shape(ch.sh, ch.cl, sz)}
            </div>`).join('')}
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-ms-wrap'));
    container.querySelectorAll('.v2-ms-choice').forEach(ch => ch.onclick = () => {
      container.querySelectorAll('.v2-ms-choice').forEach(x => { x.style.pointerEvents = 'none'; x.onclick = null; });
      if (ch.dataset.ok === 'true') { ch.classList.add('ok'); correct++; }
      else { ch.classList.add('err'); container.querySelector('[data-ok="true"]').classList.add('ok'); }
      setTimeout(nextRound, 950);
    });
  }
  intro();
  return { destroy() {} };
}

/* ══════════════════════════════════════════
   GAME 8 v2 — Matrix Reasoning
══════════════════════════════════════════ */
function createMatrixReasoningV2(container, onComplete) {
  const targetRounds = v2Rounds(8);
  const SHAPES = ['circle','square','triangle','diamond','star','pentagon'];
  const COLORS = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#ec4899'];
  let round = 0, correct = 0;

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🧠</div>
        <h2 class="v2i-title">Matrix Reasoning</h2>
        <p class="v2i-sub">Find the rule hidden in the 3×3 grid. Pick the piece that logically completes it.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>🔍</span><span>Look for patterns across rows AND columns</span></div>
          <div class="v2i-rule"><span>🔄</span><span>Patterns can involve shape, colour, or sequence</span></div>
          <div class="v2i-rule"><span>❓</span><span>The bottom-right cell is always missing</span></div>
          <div class="v2i-rule"><span>🏆</span><span>8 rounds · score based on accuracy</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Reasoning</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = nextRound;
  }

  function makeMatrix() {
    const type = rand(0, 2);
    const sh = shuffle([...SHAPES]).slice(0, 3);
    const cl = shuffle([...COLORS]).slice(0, 3);

    if (type === 0) {
      // Row-shift: R1=ABC, R2=BCA, R3=CA?
      const m = [
        [{ s:sh[0],c:cl[0] },{ s:sh[1],c:cl[1] },{ s:sh[2],c:cl[2] }],
        [{ s:sh[1],c:cl[2] },{ s:sh[2],c:cl[0] },{ s:sh[0],c:cl[1] }],
        [{ s:sh[2],c:cl[1] },{ s:sh[0],c:cl[2] }, null]
      ];
      const ans = { s:sh[1], c:cl[0] };
      return { m, ans, wrongs:[{ s:sh[0],c:cl[0] },{ s:sh[2],c:cl[2] },{ s:sh[1],c:cl[2] }] };
    } else if (type === 1) {
      // Same shape per row, same colour per column
      const m = Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>r===2&&c===2?null:{s:sh[r],c:cl[c]}));
      const ans = { s:sh[2], c:cl[2] };
      return { m, ans, wrongs:[{ s:sh[0],c:cl[2] },{ s:sh[2],c:cl[0] },{ s:sh[1],c:cl[1] }] };
    } else {
      // Same colour per row, same shape per column
      const m = Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>r===2&&c===2?null:{s:sh[c],c:cl[r]}));
      const ans = { s:sh[2], c:cl[2] };
      return { m, ans, wrongs:[{ s:sh[1],c:cl[2] },{ s:sh[2],c:cl[1] },{ s:sh[0],c:cl[0] }] };
    }
  }

  function nextRound() {
    round++; if (round > targetRounds) { onComplete({ score: Math.round(correct * 100 / targetRounds), details: { Correct: `${correct}/${targetRounds}` } }); return; }
    const { m, ans, wrongs } = makeMatrix();
    const choices = shuffle([ans, ...wrongs]);
    const sz = Math.min(50, Math.floor((Math.min(container.clientWidth, 320) - 36) / 3));
    setHdrTimer(`Round ${round}/${targetRounds}`); setHdrScore(`${correct} correct`);
    container.innerHTML = `
      <div class="v2-ms-wrap">
        <div class="v2-ms-topbar">
          <span>Round <b>${round}</b> / ${targetRounds}</span>
          <span style="color:var(--txt3)">Correct: <b style="color:var(--green)">${correct}</b></span>
        </div>
        <div class="v2-prog-track" style="width:100%;max-width:320px"><div class="v2-prog-fill" style="width:${(round-1)/targetRounds*100}%"></div></div>
        <div class="v2-ms-matrix" style="grid-template-columns:repeat(3,${sz+14}px);gap:7px">
          ${m.map((row, r) => row.map((cell, c) => {
            const miss = r === 2 && c === 2;
            return `<div class="v2-ms-cell${miss?' missing':''}" style="width:${sz+14}px;height:${sz+14}px">
              ${miss ? '<span class="v2-ms-qmark">?</span>' : v2Shape(cell.s, cell.c, sz)}
            </div>`;
          }).join('')).join('')}
        </div>
        <p class="v2-ms-prompt">Which piece completes the pattern?</p>
        <div class="v2-ms-choices">
          ${choices.map((ch, i) => `
            <div class="v2-ms-choice" data-i="${i}" data-ok="${ch.s===ans.s&&ch.c===ans.c}">
              ${v2Shape(ch.s, ch.c, sz)}
            </div>`).join('')}
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-ms-wrap'));
    container.querySelectorAll('.v2-ms-choice').forEach(ch => ch.onclick = () => {
      container.querySelectorAll('.v2-ms-choice').forEach(x => { x.style.pointerEvents='none'; x.onclick=null; });
      if (ch.dataset.ok === 'true') { ch.classList.add('ok'); correct++; }
      else { ch.classList.add('err'); container.querySelector('[data-ok="true"]').classList.add('ok'); }
      setTimeout(nextRound, 950);
    });
  }
  intro();
  return { destroy() {} };
}

/* ══════════════════════════════════════════
   GAME 9 v2 — Rotation Puzzle
══════════════════════════════════════════ */
function createRotationPuzzleV2(container, onComplete) {
  const targetRounds = v2Rounds(10);
  let round = 0, correct = 0;
  const PALETTE = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444'];

  function intro() {
    clearHdr();
    const demoPath = ROT_SHAPES[0], demoColor = '#3b82f6';
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🔄</div>
        <h2 class="v2i-title">Rotation Puzzle</h2>
        <p class="v2i-sub">A shape is shown at its original position. Pick which of the four choices shows it at the <strong>correct rotation</strong>.</p>
        <div class="v2-rot-demo">
          <div style="text-align:center"><p style="font-size:.72rem;color:var(--txt3);margin-bottom:6px">ORIGINAL</p>${rotSVG(demoPath,0,demoColor,72)}</div>
          <div class="v2-rot-demo-arrow">→ rotated 90° →</div>
          <div style="text-align:center"><p style="font-size:.72rem;color:var(--txt3);margin-bottom:6px">RESULT</p>${rotSVG(demoPath,90,demoColor,72)}</div>
        </div>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>👁</span><span>Study the original shape carefully</span></div>
          <div class="v2i-rule"><span>🔄</span><span>Mentally rotate it by the stated angle</span></div>
          <div class="v2i-rule"><span>👆</span><span>Pick the choice that matches</span></div>
          <div class="v2i-rule"><span>🏆</span><span>10 rounds — speed bonus!</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Rotating</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = nextRound;
  }

  function nextRound() {
    round++; if (round > targetRounds) { onComplete({ score: Math.round(correct * 100 / targetRounds), details: { Correct: `${correct}/${targetRounds}` } }); return; }
    const path = ROT_SHAPES[rand(0, ROT_SHAPES.length - 1)];
    const color = PALETTE[rand(0, PALETTE.length - 1)];
    const targetDeg = [90, 180, 270][rand(0, 2)];
    const allDegs = [0, 90, 180, 270];
    const choices = shuffle(allDegs.map(deg => ({ deg, ok: deg === targetDeg })));
    const sz = Math.min(90, Math.floor((Math.min(container.clientWidth, 380) - 32) / 2) - 20);
    setHdrTimer(`Round ${round}/${targetRounds}`); setHdrScore(`${correct} correct`);
    container.innerHTML = `
      <div class="v2-rot-wrap">
        <div class="v2-rot-topbar">
          <span>Round <b>${round}</b> / ${targetRounds}</span>
          <span style="color:var(--txt3)">Correct: <b style="color:var(--green)">${correct}</b></span>
        </div>
        <div class="v2-prog-track" style="width:100%;max-width:380px"><div class="v2-prog-fill" style="width:${(round-1)/targetRounds*100}%"></div></div>
        <div class="v2-rot-original">
          <p>Original shape</p>
          <div class="v2-rot-orig-box">${rotSVG(path, 0, color, sz + 10)}</div>
        </div>
        <div class="v2-rot-target-label">Which choice shows it rotated <strong>${targetDeg}°</strong> clockwise?</div>
        <div class="v2-rot-choices">
          ${choices.map((ch, i) => `
            <div class="v2-rot-choice" data-i="${i}" data-ok="${ch.ok}">
              ${rotSVG(path, ch.deg, color, sz)}
              <span class="v2-rot-deg">${ch.deg}°</span>
            </div>`).join('')}
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-rot-wrap'));
    container.querySelectorAll('.v2-rot-choice').forEach(ch => ch.onclick = () => {
      container.querySelectorAll('.v2-rot-choice').forEach(x => { x.style.pointerEvents='none'; x.onclick=null; });
      if (ch.dataset.ok === 'true') { ch.classList.add('ok'); correct++; }
      else { ch.classList.add('err'); container.querySelector('[data-ok="true"]').classList.add('ok'); }
      setTimeout(nextRound, 950);
    });
  }
  intro();
  return { destroy() {} };
}

/* ══════════════════════════════════════════
   GAME 10 v2 — Odd One Out
══════════════════════════════════════════ */
function createOddOneOutV2(container, onComplete) {
  const targetRounds = v2Rounds(10);
  const timerAdjust = v2ByDifficulty({ easy: 2, normal: 0, hard: -1 }, 0);
  const LEVELS = [
    { sets:[['🐱','🐶'],['🍎','🚗'],['⭕','⬛'],['🌸','🌴']], cols:4, rows:3, secs:7 },
    { sets:[['🐯','🦁'],['🍊','🍋'],['🚗','🚌'],['⭐','💫']], cols:4, rows:4, secs:6 },
    { sets:[['😊','😄'],['🌸','🌺'],['🔵','🟦'],['👋','🤚']], cols:4, rows:4, secs:5 },
    { sets:[['😊','☺️'],['🌟','⭐'],['🔴','🔵'],['❤️','🧡']], cols:5, rows:4, secs:5 },
    { sets:[['🌙','🌛'],['🐸','🐊'],['🍀','🌿'],['🎵','🎶']], cols:5, rows:4, secs:4 }
  ];
  let round = 0, score = 0, roundTimer = null, timeLeft = 0, oddIdx = 0, answered = false;

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🔍</div>
        <h2 class="v2i-title">Odd One Out</h2>
        <p class="v2i-sub">One emoji is different from all the others. Tap it before the timer runs out!</p>
        <div class="v2-oot-demo">
          <div class="v2-oot-demo-row">
            ${'🐱 🐱 🐱 🐶 🐱 🐱 🐱 🐱 🐱'.split(' ').map((e,i)=>`<span class="v2-oot-demo-cell${i===3?' odd':''}">${e}</span>`).join('')}
          </div>
          <p class="v2-oot-demo-hint">↑ The dog is the odd one out</p>
        </div>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>⏱</span><span>Each round has a countdown timer</span></div>
          <div class="v2i-rule"><span>📈</span><span>Grid gets bigger and more similar as you advance</span></div>
          <div class="v2i-rule"><span>💥</span><span>Tap the wrong cell — lose a point</span></div>
          <div class="v2i-rule"><span>🏆</span><span>10 rounds total</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Searching</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = nextRound;
  }

  function nextRound() {
    clearInterval(roundTimer); answered = false;
    round++; if (round > targetRounds) { finish(); return; }
    const lvl = LEVELS[Math.min(Math.floor(((round - 1) * 10 / targetRounds) / 2), LEVELS.length - 1)];
    const [base, oddEm] = lvl.sets[rand(0, lvl.sets.length - 1)];
    const total = lvl.cols * lvl.rows;
    oddIdx = rand(0, total - 1);
    const grid = Array.from({ length: total }, (_, i) => i === oddIdx ? oddEm : base);
    timeLeft = Math.max(2, lvl.secs + timerAdjust);
    setHdrTimer(`Round ${round}/${targetRounds}`); setHdrScore(`Score ${score}`);

    container.innerHTML = `
      <div class="v2-oot-wrap">
        <div class="v2-oot-timerbar-wrap">
          <div class="v2-oot-timerbar" id="oot-bar" style="width:100%;transition:width ${timeLeft}s linear"></div>
        </div>
        <div class="v2-oot-top">
          <span>Round <b>${round}</b>/${targetRounds}</span>
          <span class="v2-oot-clock" id="oot-tm">${timeLeft}s</span>
          <span>Score: <b style="color:var(--yellow)">${score}</b></span>
        </div>
        <div class="v2-oot-grid" id="oot-grid" style="grid-template-columns:repeat(${lvl.cols},1fr);max-width:${lvl.cols*62+lvl.cols*6}px">
          ${grid.map((em, i) => `<div class="v2-oot-cell" data-i="${i}">${em}</div>`).join('')}
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-oot-wrap'));

    // Start timer bar animation (CSS transition)
    requestAnimationFrame(() => {
      const bar = document.getElementById('oot-bar');
      if (bar) { bar.style.transition = 'none'; bar.style.width = '100%'; bar.offsetHeight; bar.style.transition = `width ${timeLeft}s linear`; bar.style.width = '0%'; }
    });

    roundTimer = setInterval(() => {
      timeLeft--;
      const tm = document.getElementById('oot-tm'); if (tm) tm.textContent = timeLeft + 's';
      if (timeLeft <= 2) { const b = document.getElementById('oot-bar'); if (b) b.style.background = 'var(--red)'; }
      if (timeLeft <= 0) { clearInterval(roundTimer); if (!answered) timesUp(); }
    }, 1000);

    container.querySelectorAll('.v2-oot-cell').forEach(cell => {
      cell.onclick = () => {
        if (answered) return; answered = true; clearInterval(roundTimer);
        container.querySelectorAll('.v2-oot-cell').forEach(x => { x.onclick = null; x.style.pointerEvents = 'none'; });
        if (+cell.dataset.i === oddIdx) {
          cell.classList.add('correct'); score++;
          setHdrScore(`Score ${score}`);
        } else {
          cell.classList.add('wrong');
          container.querySelector(`[data-i="${oddIdx}"]`).classList.add('correct');
          if (score > 0) score--;
        }
        setTimeout(nextRound, 900);
      };
    });
  }

  function timesUp() {
    answered = true;
    container.querySelectorAll('.v2-oot-cell').forEach(x => { x.onclick = null; x.style.pointerEvents = 'none'; });
    const odd = container.querySelector(`[data-i="${oddIdx}"]`);
    if (odd) odd.classList.add('correct');
    setTimeout(nextRound, 900);
  }

  function finish() {
    onComplete({ score: Math.min(100, Math.round(score * 100 / targetRounds)), details: { Score: score + '/' + targetRounds, Rounds: targetRounds } });
  }
  function cleanup() { clearInterval(roundTimer); }
  intro();
  return { destroy: cleanup };
}

/* ══════════════════════════════════════════
   GAME 16 v2 — Simon Game
══════════════════════════════════════════ */
function createSimonV2(container, onComplete) {
  const targetLevel = Math.max(3, Math.min(20, v2Rounds(12)));
  const startLevel = v2ByDifficulty({ easy: 0, normal: 0, hard: 2 }, 0);
  const COLORS = ['red','green','blue','yellow'];
  const PC = { red:'#ef4444', green:'#10b981', blue:'#3b82f6', yellow:'#f59e0b' };
  let sequence=[], playerIdx=0, level=0, locked=true, gone=false;

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🔴</div>
        <h2 class="v2i-title">Simon Game</h2>
        <p class="v2i-sub">Watch the coloured pads light up in sequence, then repeat the exact order by tapping them.</p>
        <div class="v2-simon-preview">
          ${COLORS.map((c,i)=>`<div class="v2-sp-pad" style="background:${PC[c]};opacity:${i===1?.9:.22}"></div>`).join('')}
        </div>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>👁</span><span>Watch the pads light up in order</span></div>
          <div class="v2i-rule"><span>👆</span><span>Repeat the exact sequence by tapping</span></div>
          <div class="v2i-rule"><span>⚠️</span><span>One wrong tap ends the game</span></div>
          <div class="v2i-rule"><span>🏆</span><span>Reach level 12 for a perfect score</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Simon</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = () => { level=startLevel; sequence=[]; renderArena(); setTimeout(nextLevel,300); };
  }

  function renderArena() {
    setHdrScore(''); setHdrTimer('Level 0');
    container.innerHTML = `
      <div class="v2-simon-wrap">
        <div class="v2-simon-lvl" id="si-lv">Level 0</div>
        <div class="v2-simon-grid">
          ${COLORS.map(c=>`<div class="v2-simon-pad" id="si-${c}" style="--pc:${PC[c]}"></div>`).join('')}
        </div>
        <p class="v2-simon-msg" id="si-msg">Get ready…</p>
      </div>`;
    fadeIn(container.querySelector('.v2-simon-wrap'));
    COLORS.forEach(c => { document.getElementById(`si-${c}`).onclick = () => { if (!locked && !gone) playerClick(c); }; });
  }

  function light(c, ms) {
    return new Promise(res => {
      if (gone) { res(); return; }
      const el = document.getElementById(`si-${c}`);
      if (el) el.classList.add('lit');
      setTimeout(() => { if (el) el.classList.remove('lit'); res(); }, ms||420);
    });
  }

  async function playSeq() {
    if (gone) return;
    locked = true;
    const msg = document.getElementById('si-msg'); if (msg) msg.textContent = 'Watch…';
    await new Promise(r => setTimeout(r, 700));
    for (const c of sequence) {
      if (gone) return;
      await light(c, 420);
      await new Promise(r => setTimeout(r, 180));
    }
    if (gone) return;
    locked = false; playerIdx = 0;
    const msg2 = document.getElementById('si-msg'); if (msg2) msg2.textContent = 'Your turn! 👇';
  }

  async function playerClick(c) {
    if (gone) return;
    await light(c, 180);
    if (c === sequence[playerIdx]) {
      playerIdx++;
      if (playerIdx === sequence.length) {
        locked = true;
        const msg = document.getElementById('si-msg'); if (msg) msg.textContent = '✅ Perfect!';
        await new Promise(r => setTimeout(r, 700));
        if (!gone) nextLevel();
      }
    } else {
      locked = true;
      const msg = document.getElementById('si-msg'); if (msg) { msg.textContent = '❌ Wrong!'; msg.style.color='var(--red)'; }
      setTimeout(() => { if (!gone) onComplete({ score: Math.min(100,Math.max(0,(level-1)*100/targetLevel)), details:{ Level:level, 'Sequence length':sequence.length } }); }, 1000);
    }
  }

  function nextLevel() {
    if (gone) return;
    level++; sequence.push(COLORS[rand(0,3)]);
    const lv = document.getElementById('si-lv'); if (lv) lv.textContent = `Level ${level}`;
    setHdrTimer(`Level ${level}`);
    if (level > targetLevel) { onComplete({ score:100, details:{ Level:level, 'Perfect run':'✅' } }); return; }
    playSeq();
  }

  intro();
  return { destroy() { gone = true; } };
}

/* ══════════════════════════════════════════
   GAME 17 v2 — Reaction Time Test
══════════════════════════════════════════ */
function createReactionTimeV2(container, onComplete) {
  const targetTrials = v2Rounds(5);
  let trial=0, times=[], phase='idle', to=null;

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">⏱</div>
        <h2 class="v2i-title">Reaction Time Test</h2>
        <p class="v2i-sub">Tap the screen the instant it turns green. Measures your raw neural processing speed.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>🔴</span><span>Red = wait patiently — do NOT tap yet</span></div>
          <div class="v2i-rule"><span>🟢</span><span>Green = tap as fast as humanly possible!</span></div>
          <div class="v2i-rule"><span>⚡</span><span>5 trials — average is your score</span></div>
          <div class="v2i-rule"><span>🏆</span><span>&lt;200ms = great · &lt;150ms = elite</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Begin Test</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = () => { trial=0; times=[]; renderTrial(); };
  }

  function renderTrial() {
    setHdrTimer(`Trial ${trial+1}/${targetTrials}`); setHdrScore('');
    container.innerHTML = `
      <div class="v2-rt-wrap">
        <div class="v2-rt-dots">
          ${Array.from({length:targetTrials},(_,i)=>`<div class="v2-rt-dot${i<trial?' done':i===trial?' active':''}"></div>`).join('')}
        </div>
        <div class="v2-rt-screen wait" id="rt-screen">
          <div class="v2-rt-label">Tap to start</div>
        </div>
        <div class="v2-rt-list" id="rt-list">
          ${times.map((t,i)=>`<div class="v2-rt-item"><span>Trial ${i+1}</span><b style="color:${t<200?'var(--green)':t<300?'var(--yellow)':'var(--red)'}">${t} ms</b></div>`).join('')}
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-rt-wrap'));
    const screen = document.getElementById('rt-screen');
    phase = 'wait';
    const tap = () => handleTap(screen);
    screen.onclick = tap;
    screen.addEventListener('touchstart', e => { e.preventDefault(); handleTap(screen); }, { passive:false });
  }

  function handleTap(screen) {
    if (!screen) return;
    if (phase === 'wait') {
      phase = 'ready';
      screen.className = 'v2-rt-screen ready';
      screen.querySelector('.v2-rt-label').textContent = 'Wait for green…';
      to = setTimeout(() => {
        if (phase !== 'ready') return;
        phase = 'go'; screen.className = 'v2-rt-screen go';
        screen.querySelector('.v2-rt-label').textContent = 'TAP NOW!';
        screen._t = Date.now();
      }, rand(1500, 4000));
    } else if (phase === 'ready') {
      clearTimeout(to); phase = 'wait';
      screen.className = 'v2-rt-screen wait';
      screen.querySelector('.v2-rt-label').textContent = '⚠️ Too early! Tap to retry';
    } else if (phase === 'go') {
      const rt = Date.now() - screen._t;
      times.push(rt); trial++;
      if (trial >= targetTrials) {
        const avg = Math.round(times.reduce((a,b)=>a+b)/targetTrials);
        const score = Math.min(100, Math.max(0, Math.round(100-(avg-150)/3)));
        phase = 'done';
        onComplete({ score, details:{ Average:avg+'ms', Best:Math.min(...times)+'ms', Worst:Math.max(...times)+'ms' } });
      } else {
        renderTrial();
      }
    }
  }

  intro();
  return { destroy() { clearTimeout(to); } };
}

/* ══════════════════════════════════════════
   GAME 18 v2 — Multi-Task Challenge
══════════════════════════════════════════ */
function createMultiTaskV2(container, onComplete) {
  const duration = v2Duration(30);
  const WORDS  = ['Sun','Moon','Rain','Tree','Fire','Wave','Star','Wind','Rock','Lake','Cloud','Snow'];
  const SHAPES = ['🔴','🟠','🟡','🟢','🔵','🟣'];
  let shapeCount=0, wordList=[], sIdx=0, wIdx=0, timeLeft=duration, done=false;
  let wTimer=null, sTimer=null, cTimer=null;

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🎭</div>
        <h2 class="v2i-title">Multi-Task Challenge</h2>
        <p class="v2i-sub">Two tasks run at the same time — read the flashing words AND count the coloured shapes.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>📝</span><span>Words flash on the left — remember them</span></div>
          <div class="v2i-rule"><span>🔢</span><span>Count every shape that appears on the right</span></div>
          <div class="v2i-rule"><span>⏱</span><span>30 seconds — then you'll answer both questions</span></div>
          <div class="v2i-rule"><span>🏆</span><span>50 pts for shapes · 50 pts for word recall</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Dual Task</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = startGame;
  }

  function startGame() {
    wordList = shuffle([...WORDS]).slice(0,8);
    const shapeList = Array.from({length:18},()=>SHAPES[rand(0,SHAPES.length-1)]);
    shapeCount=0; sIdx=0; wIdx=0; timeLeft=duration; done=false;
    setHdrTimer(duration + 's');
    container.innerHTML = `
      <div class="v2-mt-wrap">
        <div class="v2-mt-timerbar-wrap"><div class="v2-mt-timerbar" id="mt-bar"></div></div>
        <div class="v2-mt-hud"><span>⏱ <b id="mt-tm">${duration}</b>s</span><span style="font-size:.74rem;color:var(--txt3)">READ words + COUNT shapes</span></div>
        <div class="v2-mt-panels">
          <div class="v2-mt-panel"><div class="v2-mt-panel-lbl">📝 Word</div><div class="v2-mt-word" id="mt-word">—</div></div>
          <div class="v2-mt-divider"></div>
          <div class="v2-mt-panel"><div class="v2-mt-panel-lbl">🎨 Shape</div><div class="v2-mt-shape" id="mt-shape">—</div><div class="v2-mt-sc" id="mt-sc">0 shown</div></div>
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-mt-wrap'));
    wTimer = setInterval(()=>{ const w=document.getElementById('mt-word'); if(!w)return; if(wIdx<wordList.length){w.textContent=wordList[wIdx++];w.style.animation='none';w.offsetHeight;w.style.animation='v2FadeUp .18s';}else w.textContent='—'; },1700);
    sTimer = setInterval(()=>{ const s=document.getElementById('mt-shape'); if(!s)return; if(sIdx<shapeList.length){s.textContent=shapeList[sIdx++];shapeCount++;s.style.animation='none';s.offsetHeight;s.style.animation='v2Pop .15s';const sc=document.getElementById('mt-sc');if(sc)sc.textContent=shapeCount+' shown';}},1900);
    cTimer = setInterval(()=>{
      timeLeft--; const tm=document.getElementById('mt-tm');if(tm)tm.textContent=timeLeft;
      const bar=document.getElementById('mt-bar');if(bar)bar.style.width=(timeLeft/duration*100)+'%';
      setHdrTimer(timeLeft+'s');
      if(timeLeft<=0&&!done){done=true;clearAll();showQuestions();}
    },1000);
  }

  function clearAll(){clearInterval(wTimer);clearInterval(sTimer);clearInterval(cTimer);}

  function showQuestions() {
    clearHdr();
    let cntVal='', wordSel='', cntDone=false, wordDone=false;
    const fakeWords = ['Smoke','Leaf','Sand','Fog','Mist','Dust'];
    const opts = shuffle([...wordList.slice(0,4), ...shuffle(fakeWords).slice(0,4)]);
    container.innerHTML = `
      <div class="v2-mt-q-wrap">
        <h3 style="margin:0 0 14px;color:var(--txt)">Answer both questions:</h3>
        <div class="v2-mt-q-block">
          <p class="v2-mt-q-lbl">1. How many shapes appeared?</p>
          <div class="v2-fc-display" id="mt-disp">—</div>
          <div class="v2-pad" style="width:100%;max-width:260px">
            ${[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'].map(k=>`<button class="v2-pad-key${k==='⌫'?' del':k==='✓'?' ok':''}" data-k="${k}">${k}</button>`).join('')}
          </div>
        </div>
        <div class="v2-mt-q-block" style="margin-top:16px">
          <p class="v2-mt-q-lbl">2. Which word did you see?</p>
          <div class="v2-mt-word-grid">
            ${opts.map(w=>`<div class="v2-seq-choice" data-w="${w}" data-ok="${wordList.includes(w)}">${w}</div>`).join('')}
          </div>
        </div>
        <button class="v2-start-btn" id="mt-sub" style="margin-top:14px;opacity:.4;pointer-events:none">Submit Answers</button>
      </div>`;
    fadeIn(container.querySelector('.v2-mt-q-wrap'));

    function tryEnable(){if(cntDone&&wordDone){const b=document.getElementById('mt-sub');if(b){b.style.opacity='1';b.style.pointerEvents='auto';}}}
    container.querySelectorAll('.v2-pad-key').forEach(btn=>btn.onclick=()=>{
      const k=btn.dataset.k;
      if(k==='⌫')cntVal=cntVal.slice(0,-1);
      else if(k==='✓'){if(cntVal){cntDone=true;container.querySelectorAll('.v2-pad-key').forEach(b=>{b.style.opacity='.4';b.onclick=null;});tryEnable();}return;}
      else if(cntVal.length<3)cntVal+=k;
      const d=document.getElementById('mt-disp');if(d)d.textContent=cntVal||'—';
    });
    container.querySelectorAll('.v2-mt-word-grid .v2-seq-choice').forEach(btn=>btn.onclick=()=>{
      container.querySelectorAll('.v2-mt-word-grid .v2-seq-choice').forEach(x=>x.classList.remove('sel2'));
      btn.classList.add('sel2'); wordSel=btn.dataset.w; wordDone=true; tryEnable();
    });
    document.getElementById('mt-sub').onclick=()=>{
      const cntOk=Math.abs(parseInt(cntVal)-shapeCount)<=2;
      const wordOk=wordList.includes(wordSel);
      onComplete({score:(cntOk?50:0)+(wordOk?50:0),details:{'Shapes (actual)':shapeCount,'Your count':cntVal||'—','Word match':wordOk?'✅':'❌'}});
    };
  }

  intro();
  return { destroy(){clearAll();} };
}

/* ══════════════════════════════════════════
   GAME 19 v2 — Word Association Speed
══════════════════════════════════════════ */
function createWordAssociationV2(container, onComplete) {
  const targetRounds = v2Rounds(10);
  const PAIRS = [
    {word:'Apple',   correct:'Fruit',      opts:['Fruit','Engine','Planet','Tool']},
    {word:'Car',     correct:'Vehicle',    opts:['Animal','Vehicle','Emotion','Color']},
    {word:'Dog',     correct:'Animal',     opts:['Furniture','Animal','Tool','Sport']},
    {word:'Hammer',  correct:'Tool',       opts:['Tool','Plant','Liquid','Music']},
    {word:'Rose',    correct:'Flower',     opts:['Flower','Metal','Liquid','Number']},
    {word:'Eagle',   correct:'Bird',       opts:['Fish','Bird','Reptile','Insect']},
    {word:'Piano',   correct:'Instrument', opts:['Instrument','Vehicle','Food','Planet']},
    {word:'Ocean',   correct:'Water',      opts:['Land','Water','Fire','Air']},
    {word:'Gold',    correct:'Metal',      opts:['Metal','Plant','Animal','Fabric']},
    {word:'Soccer',  correct:'Sport',      opts:['Sport','Movie','Book','Color']},
    {word:'Shark',   correct:'Fish',       opts:['Fish','Bird','Insect','Mammal']},
    {word:'Trumpet', correct:'Instrument', opts:['Instrument','Tool','Vehicle','Weapon']}
  ];
  let round=0, correct=0, totalMs=0, rStart=0;

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">💬</div>
        <h2 class="v2i-title">Word Association</h2>
        <p class="v2i-sub">A word appears — tap its category instantly. Speed and accuracy both contribute to your score.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>🔤</span><span>A word is shown in the centre</span></div>
          <div class="v2i-rule"><span>🗂️</span><span>Tap the category it belongs to</span></div>
          <div class="v2i-rule"><span>⚡</span><span>Faster correct answers earn a speed bonus</span></div>
          <div class="v2i-rule"><span>🏆</span><span>10 rounds total</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = nextRound;
  }

  function nextRound() {
    round++;
    if (round > targetRounds) {
      const speedBonus = correct ? Math.min(20, Math.round(20 - totalMs/correct/200)) : 0;
      onComplete({ score: Math.min(100, Math.round(correct * 80 / targetRounds) + Math.max(0,speedBonus)), details: { Correct:`${correct}/${targetRounds}`, 'Speed bonus':'+'+Math.max(0,speedBonus) } });
      return;
    }
    const p = PAIRS[(round-1) % PAIRS.length];
    rStart = Date.now();
    setHdrTimer(`Round ${round}/${targetRounds}`); setHdrScore(`${correct} correct`);
    container.innerHTML = `
      <div class="v2-wa-wrap">
        <div class="v2-ms-topbar">
          <span>Round <b>${round}</b>/${targetRounds}</span>
          <span style="color:var(--txt3)">Correct: <b style="color:var(--green)">${correct}</b></span>
        </div>
        <div class="v2-prog-track" style="width:100%;max-width:380px"><div class="v2-prog-fill" style="width:${(round-1)/targetRounds*100}%"></div></div>
        <div class="v2-wa-word">${p.word}</div>
        <p class="v2-ms-prompt">What category does it belong to?</p>
        <div class="v2-wa-opts">
          ${p.opts.map(o=>`<div class="v2-wa-btn" data-v="${o}" data-ok="${o===p.correct}">${o}</div>`).join('')}
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-wa-wrap'));
    container.querySelectorAll('.v2-wa-btn').forEach(btn=>btn.onclick=()=>{
      const ms=Date.now()-rStart;
      container.querySelectorAll('.v2-wa-btn').forEach(x=>{x.style.pointerEvents='none';x.onclick=null;});
      if(btn.dataset.ok==='true'){btn.classList.add('ok');correct++;totalMs+=ms;}
      else{btn.classList.add('err');container.querySelector('[data-ok="true"]').classList.add('ok');}
      setTimeout(nextRound,750);
    });
  }
  intro();
  return { destroy(){} };
}

/* ══════════════════════════════════════════
   GAME 20 v2 — Story Recall
══════════════════════════════════════════ */
function createStoryRecallV2(container, onComplete) {
  const duration = v2Duration(30);
  const STORIES = [
    { text:"Maria walked her golden retriever Max through Riverside Park on a Tuesday morning. She found a red umbrella near the fountain and turned it in to the park's security office. The guard thanked her and gave her a small reward coupon for the park café.",
      questions:[
        {q:"What was the dog's name?",            opts:["Buddy","Max","Rex","Charlie"],                     ans:1},
        {q:"Where did Maria walk?",               opts:["City Square","Central Park","Riverside Park","Lake View"], ans:2},
        {q:"What did she find near the fountain?",opts:["A blue bag","A green wallet","A red umbrella","A yellow hat"], ans:2},
        {q:"What was Maria's reward?",            opts:["Cash","A trophy","A café coupon","A key"],         ans:2}
      ]},
    { text:"Professor Chen delivered her annual climate lecture on Wednesday at the University of Bristol. She showed that ocean temperatures have risen by 1.4 degrees over the past century. Three of her students later launched a startup focused on ocean monitoring technology.",
      questions:[
        {q:"Who delivered the lecture?",               opts:["Prof. Khan","Dr. Smith","Prof. Chen","Dean Williams"], ans:2},
        {q:"Which university hosted the lecture?",     opts:["Oxford","Cambridge","Bristol","Edinburgh"],   ans:2},
        {q:"By how much have ocean temperatures risen?",opts:["0.8°","1.1°","1.4°","2.0°"],                ans:2},
        {q:"What did three students create?",          opts:["A research paper","A startup","A museum","A TV show"], ans:1}
      ]},
    { text:"James cycled 18 kilometres along the coastal path on Saturday morning, stopping at a small blue lighthouse for photographs. He spotted a pod of dolphins in the bay and shared a video online. The post received over four thousand likes by Sunday evening.",
      questions:[
        {q:"How far did James cycle?",         opts:["12 km","15 km","18 km","22 km"],                     ans:2},
        {q:"What colour was the lighthouse?",  opts:["White","Red","Blue","Yellow"],                       ans:2},
        {q:"What did James spot in the bay?",  opts:["Whales","Dolphins","Sharks","Seals"],                ans:1},
        {q:"How many likes did the post get?", opts:["Over 400","Over 4,000","Over 40,000","Over 400,000"],ans:1}
      ]}
  ];
  const s = STORIES[rand(0,STORIES.length-1)];
  let answers = new Array(s.questions.length).fill(-1), cTimer=null;

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">📚</div>
        <h2 class="v2i-title">Story Recall</h2>
        <p class="v2i-sub">Read the short story carefully. After 30 seconds it disappears — then answer 4 memory questions.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>📖</span><span>Focus on names, numbers, and places</span></div>
          <div class="v2i-rule"><span>⏱</span><span>30-second reading window — use every second</span></div>
          <div class="v2i-rule"><span>🧠</span><span>Story disappears before questions appear</span></div>
          <div class="v2i-rule"><span>🏆</span><span>25 points per correct answer (4 questions)</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Reading</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = showStory;
  }

  function showStory() {
    let t=duration; setHdrTimer(duration + 's');
    container.innerHTML = `
      <div class="v2-sr-wrap">
        <div class="v2-sr-barwrap"><div class="v2-sr-bar" id="sr-bar"></div></div>
        <div class="v2-sr-lbl">READ carefully — <b id="sr-cd">${duration}</b>s remaining</div>
        <div class="v2-sr-text">${s.text}</div>
        <p style="font-size:.72rem;color:var(--txt3);text-align:center;margin:6px 0">Story disappears when time runs out</p>
      </div>`;
    fadeIn(container.querySelector('.v2-sr-wrap'));
    cTimer = setInterval(()=>{
      t--; const cd=document.getElementById('sr-cd');if(cd)cd.textContent=t;
      const bar=document.getElementById('sr-bar');if(bar)bar.style.width=(t/duration*100)+'%';
      setHdrTimer(t+'s'); if(t<=0){clearInterval(cTimer);showQuestions();}
    },1000);
  }

  function showQuestions() {
    clearHdr(); let answered=0;
    container.innerHTML = `
      <div class="v2-sr-q-wrap">
        <p class="v2-sr-q-hdr">Answer from memory:</p>
        ${s.questions.map((q,i)=>`
          <div class="v2-sr-q-block">
            <p class="v2-sr-q-text">${i+1}. ${q.q}</p>
            <div class="v2-sr-opts">
              ${q.opts.map((o,j)=>`<div class="v2-sr-opt" data-q="${i}" data-a="${j}" data-ok="${j===q.ans}">${o}</div>`).join('')}
            </div>
          </div>`).join('')}
        <button class="v2-start-btn" id="sr-sub" disabled style="margin-top:8px;opacity:.4">Submit Answers</button>
      </div>`;
    fadeIn(container.querySelector('.v2-sr-q-wrap'));
    container.querySelectorAll('.v2-sr-opt').forEach(opt=>opt.onclick=()=>{
      const qi=+opt.dataset.q, wasNew=answers[qi]===-1;
      container.querySelectorAll(`[data-q="${qi}"]`).forEach(x=>x.classList.remove('sel'));
      opt.classList.add('sel'); answers[qi]=+opt.dataset.a;
      if(wasNew){answered++;if(answered===s.questions.length){const sb=document.getElementById('sr-sub');if(sb){sb.disabled=false;sb.style.opacity='1';}}}
    });
    document.getElementById('sr-sub').onclick=()=>{
      let correct=0;
      s.questions.forEach((q,i)=>{
        container.querySelectorAll(`[data-q="${i}"]`).forEach(b=>{if(+b.dataset.a===q.ans)b.classList.add('ok');else if(answers[i]===+b.dataset.a)b.classList.add('err');});
        if(answers[i]===q.ans)correct++;
      });
      document.getElementById('sr-sub').style.display='none';
      setTimeout(()=>onComplete({score:correct*25,details:{Correct:`${correct}/${s.questions.length}`}}),1200);
    };
  }

  intro();
  return { destroy(){clearInterval(cTimer);} };
}

/* ══════════════════════════════════════════
   GAME 21 v2 — Symbol Digit Coding
══════════════════════════════════════════ */
function createSymbolDigitV2(container, onComplete) {
  const duration = v2Duration(90);
  const SYMS = ['★','◆','●','▲','■','♥','✿','⬟'];
  const KEY = {}; SYMS.forEach((s,i) => KEY[s]=i+1);
  const TASK = Array.from({length:40},()=>SYMS[rand(0,SYMS.length-1)]);
  let timeLeft=duration, score=0, current=0, gTimer=null, phase='intro';

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🔣</div>
        <h2 class="v2i-title">Symbol Digit Coding</h2>
        <p class="v2i-sub">Use the key to decode each symbol into its matching digit. Work through as many as you can in 90 seconds.</p>
        <div class="v2-sdci-key">
          ${SYMS.map(s=>`<div class="v2-sdci-pair"><div class="v2-sdci-sym">${s}</div><div class="v2-sdci-dig">${KEY[s]}</div></div>`).join('')}
        </div>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>🔍</span><span>The key is always visible at the top</span></div>
          <div class="v2i-rule"><span>👆</span><span>Tap the matching digit on the numpad</span></div>
          <div class="v2i-rule"><span>⏱</span><span>90 seconds · 40 symbols to decode</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Coding</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = startGame;
  }

  function startGame() {
    score=0; current=0; timeLeft=duration; phase='play';
    setHdrTimer(duration + 's'); setHdrScore('0 coded');
    container.innerHTML = `
      <div class="v2-sdc-wrap">
        <div class="v2-sdc-barwrap"><div class="v2-sdc-bar" id="sdc-bar"></div></div>
        <div class="v2-sdc-hud"><span>⏱ <b id="sdc-tm">${duration}</b>s</span><span>Correct: <b id="sdc-sc" style="color:var(--green)">0</b>/40</span></div>
        <div class="v2-sdci-key">
          ${SYMS.map(s=>`<div class="v2-sdci-pair"><div class="v2-sdci-sym">${s}</div><div class="v2-sdci-dig">${KEY[s]}</div></div>`).join('')}
        </div>
        <div class="v2-sdc-task">
          <div class="v2-sdc-sym" id="sdc-sym">${TASK[0]}</div>
          <div class="v2-sdc-progwrap"><div class="v2-sdc-prog" id="sdc-prog" style="width:0%"></div></div>
        </div>
        <div class="v2-sdc-numpad">
          ${[1,2,3,4,5,6,7,8].map(n=>`<button class="v2-sdc-key" data-n="${n}">${n}</button>`).join('')}
        </div>
        <div class="v2-sdc-fb" id="sdc-fb"></div>
      </div>`;
    fadeIn(container.querySelector('.v2-sdc-wrap'));
    container.querySelectorAll('.v2-sdc-key').forEach(b=>b.onclick=()=>tapNum(+b.dataset.n));
    const kh=e=>{if(e.key>='1'&&e.key<='8'&&phase==='play')tapNum(+e.key);};
    document.addEventListener('keydown',kh); container._sdcKey=kh;
    gTimer=setInterval(tick,1000);
  }

  function tapNum(n) {
    if(phase!=='play'||current>=TASK.length)return;
    const sym=TASK[current], exp=KEY[sym];
    const fb=document.getElementById('sdc-fb');
    if(n===exp){
      score++; current++;
      const sc=document.getElementById('sdc-sc');if(sc)sc.textContent=score;
      setHdrScore(score+' coded');
      if(fb){fb.textContent='✅';fb.style.color='var(--green)';}
      if(current>=TASK.length){finish();return;}
      const symEl=document.getElementById('sdc-sym');
      if(symEl){symEl.textContent=TASK[current];symEl.style.animation='none';symEl.offsetHeight;symEl.style.animation='v2Pop .15s';}
      const prog=document.getElementById('sdc-prog');if(prog)prog.style.width=(current/40*100)+'%';
    } else {
      if(fb){fb.textContent=`✗ It's ${exp}`;fb.style.color='var(--red)';}
    }
    setTimeout(()=>{const f=document.getElementById('sdc-fb');if(f)f.textContent='';},500);
  }

  function tick(){
    timeLeft--;
    const tm=document.getElementById('sdc-tm');if(tm)tm.textContent=timeLeft;
    const bar=document.getElementById('sdc-bar');if(bar){bar.style.width=(timeLeft/duration*100)+'%';if(timeLeft<=15)bar.style.background='var(--red)';}
    setHdrTimer(timeLeft+'s');
    if(timeLeft<=0)finish();
  }

  function finish(){
    clearInterval(gTimer);phase='done';
    if(container._sdcKey){document.removeEventListener('keydown',container._sdcKey);container._sdcKey=null;}
    onComplete({score:Math.min(100,Math.round(score*2.5)),details:{Correct:score,Total:40,'Time left':timeLeft+'s'}});
  }

  intro();
  return { destroy(){clearInterval(gTimer);if(container._sdcKey)document.removeEventListener('keydown',container._sdcKey);} };
}

/* ══════════════════════════════════════════
   GAME 22 v2 — Hidden Object Challenge
══════════════════════════════════════════ */
function createHiddenObjectV2(container, onComplete) {
  const targetRounds = v2Rounds(5);
  const timerAdjust = v2ByDifficulty({ easy: 3, normal: 0, hard: -2 }, 0);
  const TARGETS=[{sym:'🦋',name:'butterfly'},{sym:'🌟',name:'star'},{sym:'🐢',name:'turtle'},{sym:'🍄',name:'mushroom'},{sym:'🦀',name:'crab'}];
  const NOISE=['🌿','🌱','🍃','🍂','🌾','🍁','🌲','🌳','🌴','🪨','🪵','🌊','💧','🪸'];
  let round=0, correct=0, rTimer=null;

  function intro(){
    clearHdr();
    container.innerHTML=`
      <div class="v2-intro">
        <div class="v2i-icon">🔎</div>
        <h2 class="v2i-title">Hidden Object</h2>
        <p class="v2i-sub">One special emoji is hiding among nature symbols. Tap it before the timer runs out.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>🎯</span><span>The target is clearly shown at the top</span></div>
          <div class="v2i-rule"><span>🌿</span><span>It hides among similar-looking nature emojis</span></div>
          <div class="v2i-rule"><span>⏱</span><span>12 seconds per round — scan fast!</span></div>
          <div class="v2i-rule"><span>🏆</span><span>5 rounds · 20 points each</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Searching</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick=nextRound;
  }

  function nextRound(){
    clearInterval(rTimer); round++;
    if(round>targetRounds){onComplete({score:Math.round(correct*100/targetRounds),details:{Found:`${correct}/${targetRounds}`}});return;}
    const t=TARGETS[(round-1) % TARGETS.length];
    const mob=container.clientWidth<420;
    const COLS=mob?8:12, ROWS=mob?10:8, total=COLS*ROWS;
    const ti=rand(0,total-1);
    const grid=Array.from({length:total},(_,i)=>i===ti?t.sym:NOISE[rand(0,NOISE.length-1)]);
    let timeLeft=Math.max(4, 12 + timerAdjust);
    setHdrTimer(`Round ${round}/${targetRounds}`); setHdrScore(`${correct} found`);
    container.innerHTML=`
      <div class="v2-ho-wrap">
        <div class="v2-ho-barwrap"><div class="v2-ho-bar" id="ho-bar"></div></div>
        <div class="v2-ho-top">
          <span>Round <b>${round}</b>/${targetRounds}</span>
          <span class="v2-ho-target">Find: <span class="v2-ho-tsym">${t.sym}</span> ${t.name}</span>
          <span class="v2-oot-clock" id="ho-tm">${timeLeft}s</span>
        </div>
        <div class="v2-ho-grid" id="ho-grid" style="grid-template-columns:repeat(${COLS},1fr)">
          ${grid.map((em,i)=>`<div class="v2-ho-cell" data-i="${i}">${em}</div>`).join('')}
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-ho-wrap'));
    requestAnimationFrame(()=>{
      const bar=document.getElementById('ho-bar');
      if(bar){bar.style.transition='none';bar.style.width='100%';bar.offsetHeight;bar.style.transition=`width ${timeLeft}s linear`;bar.style.width='0%';}
    });
    rTimer=setInterval(()=>{
      timeLeft--;
      const tm=document.getElementById('ho-tm');if(tm)tm.textContent=timeLeft+'s';
      if(timeLeft<=3){const b=document.getElementById('ho-bar');if(b)b.style.background='var(--red)';}
      if(timeLeft<=0){clearInterval(rTimer);container.querySelectorAll('.v2-ho-cell').forEach(x=>x.onclick=null);const f=container.querySelector(`[data-i="${ti}"]`);if(f)f.classList.add('found');setTimeout(nextRound,800);}
    },1000);
    container.querySelectorAll('.v2-ho-cell').forEach(cell=>cell.onclick=()=>{
      clearInterval(rTimer);
      container.querySelectorAll('.v2-ho-cell').forEach(x=>x.onclick=null);
      if(+cell.dataset.i===ti){cell.classList.add('found');correct++;}
      else{cell.classList.add('wrong');const f=container.querySelector(`[data-i="${ti}"]`);if(f)f.classList.add('found');}
      setTimeout(nextRound,700);
    });
  }

  intro();
  return { destroy(){clearInterval(rTimer);} };
}

/* ══════════════════════════════════════════
   GAME 23 v2 — Direction Memory
══════════════════════════════════════════ */
function createDirectionMemoryV2(container, onComplete) {
  const startLevel = v2ByDifficulty({ easy: 3, normal: 4, hard: 6 }, 4);
  const DIRS={up:'↑',down:'↓',left:'←',right:'→'};
  const DKEYS=Object.keys(DIRS);
  let level=startLevel, sequence=[], entered=[], phase='show', sTimer=null, sIdx=0;

  function intro(){
    clearHdr();
    container.innerHTML=`
      <div class="v2-intro">
        <div class="v2i-icon">🧭</div>
        <h2 class="v2i-title">Direction Memory</h2>
        <p class="v2i-sub">Arrows flash one by one — memorise the sequence, then replay it on the D-pad.</p>
        <div class="v2-dm-demo">
          ${['↑','→','↓'].map(a=>`<div class="v2-dm-demo-arrow">${a}</div>`).join('<span style="color:var(--txt3);font-size:.9rem">·</span>')}
        </div>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>👁</span><span>Watch each arrow flash — one at a time</span></div>
          <div class="v2i-rule"><span>🕹️</span><span>Tap the D-pad buttons in the same order</span></div>
          <div class="v2i-rule"><span>📈</span><span>Start at 4 arrows — grows on each success</span></div>
          <div class="v2i-rule"><span>🏆</span><span>Max 12 arrows = perfect score</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Memorising</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick=nextRound;
  }

  function nextRound(){
    clearTimeout(sTimer); entered=[]; phase='show'; sIdx=0;
    sequence=Array.from({length:level},()=>DKEYS[rand(0,3)]);
    setHdrTimer(`${level} arrows`); setHdrScore('');
    container.innerHTML=`
      <div class="v2-dm-wrap">
        <div class="v2-dm-level">Remember <b>${level}</b> arrows</div>
        <div class="v2-prog-track" style="width:100%;max-width:320px"><div class="v2-prog-fill" style="width:${((level-startLevel)/Math.max(1,12-startLevel))*100}%"></div></div>
        <div class="v2-dm-disp" id="dm-disp">👀</div>
        <div class="v2-dm-trail" id="dm-trail"></div>
        <div class="v2-dm-dpad" id="dm-dpad" style="opacity:.25;pointer-events:none">
          <div></div><button class="v2-dm-btn" data-d="up">↑</button><div></div>
          <button class="v2-dm-btn" data-d="left">←</button><div class="v2-dm-center">🕹</div><button class="v2-dm-btn" data-d="right">→</button>
          <div></div><button class="v2-dm-btn" data-d="down">↓</button><div></div>
        </div>
        <p class="v2-dm-hint" id="dm-hint">Watch carefully…</p>
      </div>`;
    fadeIn(container.querySelector('.v2-dm-wrap'));
    showNext();
  }

  function showNext(){
    if(sIdx>=sequence.length){
      phase='input';
      const disp=document.getElementById('dm-disp');if(disp)disp.textContent='🕹';
      const hint=document.getElementById('dm-hint');if(hint)hint.textContent='Now repeat the sequence!';
      const dpad=document.getElementById('dm-dpad');if(dpad){dpad.style.opacity='1';dpad.style.pointerEvents='auto';}
      container.querySelectorAll('.v2-dm-btn').forEach(b=>b.onclick=()=>addDir(b.dataset.d));
      const kh=e=>{const m={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};if(m[e.key]&&phase==='input'){e.preventDefault();addDir(m[e.key]);}};
      document.addEventListener('keydown',kh);container._dmKey=kh;
      return;
    }
    const d=sequence[sIdx++];
    const disp=document.getElementById('dm-disp');
    if(disp){disp.textContent=DIRS[d];disp.style.animation='none';disp.offsetHeight;disp.style.animation='v2Pop .2s';}
    sTimer=setTimeout(showNext,900);
  }

  function addDir(d){
    if(phase!=='input')return;
    entered.push(d);
    const trail=document.getElementById('dm-trail');
    if(trail)trail.innerHTML=entered.map(k=>`<span class="v2-dm-entered">${DIRS[k]}</span>`).join('');
    if(entered.length===sequence.length){
      phase='done';
      if(container._dmKey){document.removeEventListener('keydown',container._dmKey);container._dmKey=null;}
      const ok=entered.every((v,i)=>v===sequence[i]);
      const hint=document.getElementById('dm-hint');
      if(ok){
        if(hint){hint.textContent='✅ Correct!';hint.style.color='var(--green)';}
        if(level<12){level++;setTimeout(nextRound,700);}
        else setTimeout(()=>onComplete({score:100,details:{'Max span':'12','Perfect run':'✅'}}),700);
      } else {
        if(hint){hint.textContent=`❌ Was: ${sequence.map(k=>DIRS[k]).join(' ')}`;hint.style.color='var(--red)';}
        setTimeout(()=>onComplete({score:Math.round(Math.max(0,(level-startLevel)/Math.max(1,12-startLevel)*100)),details:{'Max span':level+' arrows',Level:Math.max(1,level-startLevel+1)}}),1400);
      }
    }
  }

  intro();
  return { destroy(){clearTimeout(sTimer);if(container._dmKey)document.removeEventListener('keydown',container._dmKey);} };
}

/* ══════════════════════════════════════════
   GAME 24 v2 — Rapid Categorization
══════════════════════════════════════════ */
function createRapidCategorizationV2(container, onComplete) {
  const duration = v2Duration(45);
  const CATS={
    Animal:    ['Dog','Cat','Lion','Whale','Eagle','Tiger','Frog','Bear','Wolf','Deer'],
    Vehicle:   ['Car','Bus','Train','Rocket','Bicycle','Truck','Boat','Plane','Tram','Kayak'],
    Fruit:     ['Apple','Mango','Grape','Banana','Cherry','Lemon','Peach','Kiwi','Plum','Fig'],
    Profession:['Doctor','Pilot','Chef','Teacher','Lawyer','Nurse','Farmer','Actor','Judge','Baker']
  };
  const CKEYS=Object.keys(CATS);
  const ALL=CKEYS.flatMap(k=>CATS[k].map(w=>({word:w,cat:k})));
  let words=[], idx=0, score=0, wrong=0, timeLeft=duration, gTimer=null, done=false;

  function intro(){
    clearHdr();
    container.innerHTML=`
      <div class="v2-intro">
        <div class="v2i-icon">🗂️</div>
        <h2 class="v2i-title">Rapid Categorization</h2>
        <p class="v2i-sub">A word flashes — tap its category as fast as you can. 45 seconds, 4 categories.</p>
        <div class="v2-rc-preview">
          ${CKEYS.map(k=>`<div class="v2-rc-prev-tag">${k}</div>`).join('')}
        </div>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>⚡</span><span>Tap instantly — speed matters</span></div>
          <div class="v2i-rule"><span>✅</span><span>Correct tap: +1 point, next word</span></div>
          <div class="v2i-rule"><span>❌</span><span>Wrong tap: counted as error, still moves on</span></div>
          <div class="v2i-rule"><span>⏱</span><span>45-second time limit</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start (45s)</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick=startGame;
  }

  function startGame(){
    words=shuffle([...ALL]).slice(0,20);
    idx=0;score=0;wrong=0;timeLeft=duration;done=false;
    setHdrTimer(duration + 's');setHdrScore('0 correct');
    container.innerHTML=`
      <div class="v2-rc-wrap">
        <div class="v2-rc-barwrap"><div class="v2-rc-bar" id="rc-bar"></div></div>
        <div class="v2-rc-hud">
          <span>✅ <b id="rc-sc">0</b></span>
          <span>⏱ <b id="rc-tm">${duration}</b>s</span>
          <span>❌ <b id="rc-wr">0</b></span>
        </div>
        <div class="v2-rc-word" id="rc-word">—</div>
        <div class="v2-rc-cats">
          ${CKEYS.map(c=>`<button class="v2-rc-btn" data-c="${c}">${c}</button>`).join('')}
        </div>
        <div class="v2-rc-fb" id="rc-fb"></div>
      </div>`;
    fadeIn(container.querySelector('.v2-rc-wrap'));
    container.querySelectorAll('.v2-rc-btn').forEach(b=>b.onclick=()=>guess(b));
    gTimer=setInterval(tick,1000);
    showWord();
  }

  function showWord(){
    if(idx>=words.length||done){if(!done)finish();return;}
    const w=document.getElementById('rc-word');
    if(w){w.textContent=words[idx].word;w.style.animation='none';w.offsetHeight;w.style.animation='v2FadeUp .15s';}
  }

  function guess(btn){
    if(done||idx>=words.length)return;
    const ok=words[idx].cat===btn.dataset.c;
    const fb=document.getElementById('rc-fb');
    if(ok){score++;const sc=document.getElementById('rc-sc');if(sc)sc.textContent=score;btn.classList.add('ok');setTimeout(()=>btn.classList.remove('ok'),280);if(fb){fb.textContent='✅';fb.style.color='var(--green)';}setHdrScore(score+' correct');}
    else{wrong++;const wr=document.getElementById('rc-wr');if(wr)wr.textContent=wrong;btn.classList.add('err');setTimeout(()=>btn.classList.remove('err'),280);if(fb){fb.textContent='✗ '+words[idx].cat;fb.style.color='var(--red)';}}
    idx++;setTimeout(()=>{const f=document.getElementById('rc-fb');if(f)f.textContent='';showWord();},300);
  }

  function tick(){
    timeLeft--;
    const tm=document.getElementById('rc-tm');if(tm)tm.textContent=timeLeft;
    const bar=document.getElementById('rc-bar');if(bar){bar.style.width=(timeLeft/duration*100)+'%';if(timeLeft<=10)bar.style.background='var(--red)';}
    setHdrTimer(timeLeft+'s');
    if(timeLeft<=0&&!done)finish();
  }

  function finish(){
    done=true;clearInterval(gTimer);
    const total=score+wrong;
    onComplete({score:Math.min(100,Math.round(score*225/duration)),details:{Correct:score,Wrong:wrong,Accuracy:total?Math.round(score/total*100)+'%':'0%','Words seen':idx}});
  }

  intro();
  return { destroy(){clearInterval(gTimer);} };
}

/* ══════════════════════════════════════════
   GAME 25 v2 — Sudoku Mini
══════════════════════════════════════════ */
function createSudokuMiniV2(container, onComplete) {
  const blanksToRemove = v2ByDifficulty({ easy: 6, normal: 8, hard: 10 }, 8);
  const SOLS=[
    [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]],
    [[2,1,4,3],[4,3,2,1],[1,2,3,4],[3,4,1,2]],
    [[3,4,1,2],[1,2,3,4],[4,3,2,1],[2,1,4,3]],
    [[4,3,2,1],[2,1,4,3],[3,4,1,2],[1,2,3,4]]
  ];
  let elapsed=0, gTimer=null, solution=[], puzzle=[], selCell=null;

  function intro(){
    clearHdr();
    container.innerHTML=`
      <div class="v2-intro">
        <div class="v2i-icon">🔢</div>
        <h2 class="v2i-title">Sudoku Mini</h2>
        <p class="v2i-sub">Fill the 4×4 grid so every row, column, and 2×2 box contains digits 1–4 exactly once.</p>
        <div class="v2-su-demo">
          ${[[1,2,0,4],[3,4,1,0],[0,1,4,3],[4,3,2,0]].map((row,r)=>`<div class="v2-su-demo-row">${row.map((v,c)=>`<div class="v2-su-demo-cell${v===0?' empty':' given'}">${v||'?'}</div>`).join('')}</div>`).join('')}
        </div>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>↔</span><span>Digits 1–4 in every row</span></div>
          <div class="v2i-rule"><span>↕</span><span>Digits 1–4 in every column</span></div>
          <div class="v2i-rule"><span>🟦</span><span>Digits 1–4 in each 2×2 box</span></div>
          <div class="v2i-rule"><span>⚡</span><span>Faster = higher score</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Puzzle</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick=buildGame;
  }

  function buildGame(){
    solution=SOLS[rand(0,SOLS.length-1)].map(r=>[...r]);
    puzzle=solution.map(r=>[...r]);
    let removed=0, tries=0;
    while(removed<blanksToRemove&&tries<200){const r=rand(0,3),c=rand(0,3);if(puzzle[r][c]!==0){puzzle[r][c]=0;removed++;}tries++;}
    elapsed=0; selCell=null;
    setHdrTimer('0:00'); setHdrScore('');
    renderGame();
    gTimer=setInterval(()=>{elapsed++;const m=Math.floor(elapsed/60),s=elapsed%60;const t=`${m}:${String(s).padStart(2,'0')}`;setHdrTimer(t);const el=document.getElementById('su-tm');if(el)el.textContent=t;},1000);
  }

  function renderGame(){
    container.innerHTML=`
      <div class="v2-su-wrap">
        <div class="v2-su-hud"><span>⏱ <b id="su-tm">0:00</b></span><span style="font-size:.78rem;color:var(--txt3)">Tap cell → pick number</span></div>
        <div class="v2-su-grid" id="su-grid">
          ${solution.map((row,r)=>row.map((v,c)=>{
            const given=puzzle[r][c]!==0;
            return `<div class="v2-su-cell${given?' given':''}" data-r="${r}" data-c="${c}" data-sol="${solution[r][c]}" data-given="${given}">${given?puzzle[r][c]:''}</div>`;
          }).join('')).join('')}
        </div>
        <div class="v2-su-numpad">
          ${[1,2,3,4].map(n=>`<button class="v2-su-key" data-n="${n}">${n}</button>`).join('')}
          <button class="v2-su-key del" data-n="0">⌫</button>
        </div>
        <button class="v2-start-btn" id="su-check" style="margin-top:8px;width:100%;max-width:260px">✓ Check Solution</button>
      </div>`;
    fadeIn(container.querySelector('.v2-su-wrap'));

    container.querySelectorAll('.v2-su-cell').forEach(cell=>{
      if(cell.dataset.given==='true')return;
      cell.onclick=()=>{
        container.querySelectorAll('.v2-su-cell').forEach(x=>x.classList.remove('sel','hl'));
        cell.classList.add('sel'); selCell=cell;
        const r=+cell.dataset.r,c=+cell.dataset.c;
        container.querySelectorAll('.v2-su-cell').forEach(x=>{
          const xr=+x.dataset.r,xc=+x.dataset.c;
          if((xr===r||xc===c||Math.floor(xr/2)===Math.floor(r/2)&&Math.floor(xc/2)===Math.floor(c/2))&&!x.classList.contains('sel'))x.classList.add('hl');
        });
      };
    });

    container.querySelectorAll('.v2-su-key').forEach(btn=>btn.onclick=()=>{
      if(!selCell||selCell.dataset.given==='true')return;
      const n=+btn.dataset.n;
      selCell.textContent=n||''; selCell.dataset.val=n; selCell.classList.remove('ok','err');
    });

    document.getElementById('su-check').onclick=checkSol;

    const kh=e=>{
      if(!selCell||selCell.dataset.given==='true')return;
      if(e.key>='1'&&e.key<='4'){selCell.textContent=e.key;selCell.dataset.val=e.key;selCell.classList.remove('ok','err');}
      else if(e.key==='Backspace'){selCell.textContent='';selCell.dataset.val='0';selCell.classList.remove('ok','err');}
    };
    document.addEventListener('keydown',kh); container._suKey=kh;
  }

  function checkSol(){
    const blanks=container.querySelectorAll('.v2-su-cell:not([data-given="true"])');
    let correct=0;
    blanks.forEach(cell=>{
      const val=+cell.dataset.val||0, sol=+cell.dataset.sol;
      cell.classList.remove('ok','err');
      if(val===sol){cell.classList.add('ok');correct++;}else cell.classList.add('err');
    });
    if(correct===blanks.length){
      clearInterval(gTimer);
      if(container._suKey){document.removeEventListener('keydown',container._suKey);container._suKey=null;}
      const score=Math.max(50,100-Math.floor(elapsed/4));
      setTimeout(()=>onComplete({score,details:{Time:elapsed+'s',Grid:'4×4',Errors:0}}),600);
    }
  }

  intro();
  return { destroy(){clearInterval(gTimer);if(container._suKey)document.removeEventListener('keydown',container._suKey);} };
}

/* ══════════════════════════════════════════
   GAME 11 v2 — Sequence Prediction
══════════════════════════════════════════ */
function createSequencePredictionV2(container, onComplete) {
  const targetRounds = v2Rounds(10);
  let round = 0, correct = 0;

  function makeSeq() {
    const type = rand(0, 4);
    if (type === 0) {
      const start = rand(1, 15), step = rand(2, 9);
      const seq = [start, start+step, start+2*step, start+3*step];
      const ans = start + 4*step;
      return { seq, ans: String(ans), hint: 'Arithmetic (+' + step + ')', distractors: [ans+step, ans-step, ans+rand(2,6)].map(String) };
    }
    if (type === 1) {
      const start = rand(1, 4), ratio = rand(2, 3);
      const seq = [start, start*ratio, start*ratio**2, start*ratio**3];
      const ans = start * ratio**4;
      return { seq, ans: String(ans), hint: 'Geometric (×' + ratio + ')', distractors: [ans+ratio, ans-start, ans*ratio].map(String) };
    }
    if (type === 2) {
      const alpha = 'ABCDEFGHIJKLMNOP';
      const start = rand(0, 10);
      const seq = [alpha[start], alpha[start+1], alpha[start+2], alpha[start+3]];
      const ans = alpha[start+4];
      return { seq, ans, hint: 'Alphabet', distractors: [alpha[start+6], alpha[start+3], alpha[start+5]] };
    }
    if (type === 3) {
      const base = rand(1, 8), step = rand(1, 5);
      const seq = [base, base+step, base, base+step];
      const ans = String(base);
      return { seq: seq.map(String), ans, hint: 'Alternating', distractors: [String(base+step), String(base+1), String(base-1)] };
    }
    // Squares sequence
    const start = rand(1, 6);
    const seq = [start**2, (start+1)**2, (start+2)**2, (start+3)**2];
    const ans = (start+4)**2;
    return { seq: seq.map(String), ans: String(ans), hint: 'Square numbers', distractors: [ans+start, ans-start, ans+(start+4)].map(String) };
  }

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">📈</div>
        <h2 class="v2i-title">Sequence Prediction</h2>
        <p class="v2i-sub">Spot the hidden pattern and predict the next number, letter, or symbol.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>➕</span><span>Arithmetic: add a fixed amount each step</span></div>
          <div class="v2i-rule"><span>✖️</span><span>Geometric: multiply by a fixed ratio</span></div>
          <div class="v2i-rule"><span>🔤</span><span>Alphabet: letters in order</span></div>
          <div class="v2i-rule"><span>🔲</span><span>Squares, alternating, and more!</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start (10 rounds)</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = nextRound;
  }

  function nextRound() {
    round++;
    if (round > targetRounds) { onComplete({ score: Math.round(correct * 100 / targetRounds), details: { Correct: `${correct}/${targetRounds}` } }); return; }
    const { seq, ans, hint, distractors } = makeSeq();
    const choices = shuffle([ans, ...distractors.slice(0, 3)]);
    setHdrTimer(`Round ${round}/${targetRounds}`); setHdrScore(`${correct} correct`);
    container.innerHTML = `
      <div class="v2-seq-wrap">
        <div class="v2-ms-topbar">
          <span>Round <b>${round}</b>/${targetRounds}</span>
          <span style="color:var(--txt3)">Correct: <b style="color:var(--green)">${correct}</b></span>
        </div>
        <div class="v2-prog-track" style="width:100%;max-width:380px"><div class="v2-prog-fill" style="width:${(round-1)/targetRounds*100}%"></div></div>
        <div class="v2-seq-chain">
          ${seq.map(v => `<div class="v2-seq-item">${v}</div>`).join('<div class="v2-seq-arrow">→</div>')}
          <div class="v2-seq-arrow">→</div>
          <div class="v2-seq-item missing">?</div>
        </div>
        <p style="font-size:.74rem;color:var(--txt3);margin:0">Type: ${hint}</p>
        <p class="v2-ms-prompt">What comes next?</p>
        <div class="v2-seq-choices">
          ${choices.map(c => `<div class="v2-seq-choice" data-v="${c}" data-ok="${c===ans}">${c}</div>`).join('')}
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-seq-wrap'));
    container.querySelectorAll('.v2-seq-choice').forEach(btn => btn.onclick = () => {
      container.querySelectorAll('.v2-seq-choice').forEach(x => { x.style.pointerEvents='none'; x.onclick=null; });
      if (btn.dataset.ok === 'true') { btn.classList.add('ok'); correct++; }
      else { btn.classList.add('err'); container.querySelector('[data-ok="true"]').classList.add('ok'); }
      setTimeout(nextRound, 900);
    });
  }

  intro();
  return { destroy() {} };
}

/* ══════════════════════════════════════════
   GAME 12 v2 — Memory Cards
══════════════════════════════════════════ */
function createMemoryCardsV2(container, onComplete) {
  const targetLevels = Math.max(1, Math.min(5, v2Rounds(5)));
  const startLevel = v2ByDifficulty({ easy: 1, normal: 1, hard: 2 }, 1);
  const EMOJIS = ['🐶','🐱','🦊','🐻','🐼','🐸','🦁','🐯','🦋','🐙','🦄','🌺','🍎','🚀','⭐','🎸'];
  let level = startLevel, moves = 0, matched = 0, first = null, locked = false;
  let seconds = 0, totalMoves = 0, levelTimer = null;

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🃏</div>
        <h2 class="v2i-title">Memory Cards</h2>
        <p class="v2i-sub">Flip cards to find matching pairs. Remember what you've seen — every mis-match costs a move.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>👆</span><span>Tap any card to reveal it</span></div>
          <div class="v2i-rule"><span>🔁</span><span>Tap a second card — if they match, they stay open</span></div>
          <div class="v2i-rule"><span>📈</span><span>5 levels — grid grows with each level</span></div>
          <div class="v2i-rule"><span>⚡</span><span>Fewer moves = higher score</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Level 1</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = buildGame;
  }

  function buildGame() {
    clearInterval(levelTimer);
    const pairs = level + 3;
    const cards = shuffle([...EMOJIS.slice(0, pairs), ...EMOJIS.slice(0, pairs)]);
    const cols = level < 2 ? 4 : level < 4 ? 5 : 6;
    matched = 0; moves = 0; seconds = 0; first = null; locked = false;
    setHdrTimer(`Level ${level}/${targetLevels}`); setHdrScore('0 moves');

    container.innerHTML = `
      <div class="v2-mc-wrap">
        <div class="v2-mc-hud">
          <div class="v2-mc-hud-item"><span class="v2-mc-val" id="mc-lv">${level}</span><span class="v2-mc-lbl">Level</span></div>
          <div class="v2-mc-hud-item"><span class="v2-mc-val purple" id="mc-mv">0</span><span class="v2-mc-lbl">Moves</span></div>
          <div class="v2-mc-hud-item"><span class="v2-mc-val cyan" id="mc-tm">0s</span><span class="v2-mc-lbl">Time</span></div>
          <div class="v2-mc-hud-item"><span class="v2-mc-val green" id="mc-pr">0/${pairs}</span><span class="v2-mc-lbl">Pairs</span></div>
        </div>
        <div class="v2-mc-grid" id="mc-grid" style="grid-template-columns:repeat(${cols},1fr)"></div>
      </div>`;
    fadeIn(container.querySelector('.v2-mc-wrap'));

    levelTimer = setInterval(() => {
      seconds++;
      const t = document.getElementById('mc-tm'); if (t) t.textContent = seconds + 's';
    }, 1000);

    const grid = document.getElementById('mc-grid');
    cards.forEach((em, i) => {
      const card = document.createElement('div');
      card.className = 'v2-mc-card';
      card.innerHTML = `<div class="v2-mc-inner"><div class="v2-mc-back">🂠</div><div class="v2-mc-front">${em}</div></div>`;
      card.dataset.em = em; card.dataset.i = i;
      card.onclick = () => flip(card, pairs);
      grid.appendChild(card);
    });
  }

  function flip(card, pairs) {
    if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    card.classList.add('flipped');
    if (!first) { first = card; return; }
    const second = card; moves++;
    const mv = document.getElementById('mc-mv'); if (mv) mv.textContent = moves;
    setHdrScore(moves + ' moves');
    locked = true;
    if (first.dataset.em === second.dataset.em) {
      first.classList.add('matched'); second.classList.add('matched');
      first = null; locked = false; matched++;
      const pr = document.getElementById('mc-pr'); if (pr) pr.textContent = `${matched}/${pairs}`;
      if (matched === pairs) {
        clearInterval(levelTimer);
        totalMoves += moves;
        const efficiency = Math.max(0, Math.round(100 * (1 - moves / (pairs * 2))));
        setTimeout(() => {
          if (level < targetLevels) { level++; buildGame(); }
          else onComplete({ score: Math.min(100, efficiency + level * 5), details: { Levels: targetLevels, 'Total moves': totalMoves, 'Last time': seconds + 's' } });
        }, 500);
      }
    } else {
      setTimeout(() => {
        first.classList.remove('flipped'); second.classList.remove('flipped');
        first = null; locked = false;
      }, 900);
    }
  }

  intro();
  return { destroy() { clearInterval(levelTimer); } };
}

/* ══════════════════════════════════════════
   GAME 13 v2 — Flash Calculation
══════════════════════════════════════════ */
function createFlashCalculationV2(container, onComplete) {
  const targetRounds = v2Rounds(10);
  const flashAdjust = v2ByDifficulty({ easy: 120, normal: 0, hard: -120 }, 0);
  let round = 0, correct = 0, entered = '', currentSum = 0, phase = 'intro';

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">⚡</div>
        <h2 class="v2i-title">Flash Calculation</h2>
        <p class="v2i-sub">Numbers flash one by one. Keep a running total in your head, then enter the sum.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>👁</span><span>Watch each number carefully — they disappear fast</span></div>
          <div class="v2i-rule"><span>🔢</span><span>Add them all together mentally</span></div>
          <div class="v2i-rule"><span>📈</span><span>Rounds 1–3: 3 numbers · 4–7: 4 numbers · 8–10: 5 numbers</span></div>
          <div class="v2i-rule"><span>🏆</span><span>10 rounds, 10 points each</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Flashing</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = nextRound;
  }

  function nextRound() {
    round++;
    if (round > targetRounds) { onComplete({ score: Math.round(correct * 100 / targetRounds), details: { Correct: `${correct}/${targetRounds}` } }); return; }
    const scaledRound = Math.ceil(round * 10 / targetRounds);
    const count = scaledRound <= 3 ? 3 : scaledRound <= 7 ? 4 : 5;
    const nums = Array.from({ length: count }, () => rand(5, 25));
    currentSum = nums.reduce((a, b) => a + b, 0);
    entered = ''; phase = 'flash';
    setHdrTimer(`Round ${round}/${targetRounds}`); setHdrScore(`${correct} correct`);

    container.innerHTML = `
      <div class="v2-fc-wrap">
        <div class="v2-ms-topbar">
          <span>Round <b>${round}</b>/${targetRounds}</span>
          <span style="color:var(--txt3)">Correct: <b style="color:var(--green)">${correct}</b></span>
        </div>
        <div class="v2-prog-track" style="width:100%;max-width:360px"><div class="v2-prog-fill" style="width:${(round-1)/targetRounds*100}%"></div></div>
        <div class="v2-fc-stage">
          <p class="v2-fc-label" id="fc-lbl">Watch the numbers…</p>
          <div class="v2-fc-number" id="fc-num">–</div>
          <div class="v2-fc-count" id="fc-cnt">${count} numbers</div>
        </div>
        <div class="v2-fc-input-area" id="fc-input" style="display:none">
          <p class="v2-fc-label">What was the total?</p>
          <div class="v2-fc-display" id="fc-disp">—</div>
          <div class="v2-pad" style="width:100%;max-width:280px">
            ${[1,2,3,4,5,6,7,8,9,'⌫',0,'='].map(k =>
              `<button class="v2-pad-key${k==='⌫'?' del':k==='='?' ok':''}" data-k="${k}">${k==='='?'✓ Enter':k}</button>`
            ).join('')}
          </div>
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-fc-wrap'));

    // Flash numbers sequentially
    let i = 0;
    function flashNext() {
      const numEl = document.getElementById('fc-num');
      const cntEl = document.getElementById('fc-cnt');
      if (!numEl) return;
      if (i >= nums.length) {
        numEl.textContent = '?';
        numEl.style.color = 'var(--yellow)';
        if (cntEl) cntEl.textContent = 'Enter the sum';
        setTimeout(showInput, 400);
        return;
      }
      numEl.textContent = nums[i];
      numEl.style.animation = 'none'; numEl.offsetHeight; numEl.style.animation = 'v2Pop .15s ease';
      if (cntEl) cntEl.textContent = `${i+1} of ${count}`;
      i++;
      setTimeout(flashNext, Math.max(300, (scaledRound <= 5 ? 650 : 520) + flashAdjust));
    }
    setTimeout(flashNext, 600);
  }

  function showInput() {
    phase = 'input'; entered = '';
    const area = document.getElementById('fc-input'); if (area) area.style.display = 'flex';
    const stage = document.querySelector('.v2-fc-stage'); if (stage) stage.style.display = 'none';
    const onKey = e => {
      if (phase !== 'input') return;
      if (e.key >= '0' && e.key <= '9') tapFC(e.key);
      else if (e.key === 'Backspace') tapFC('⌫');
      else if (e.key === 'Enter') tapFC('=');
    };
    document.addEventListener('keydown', onKey);
    container._fcKey = onKey;
    container.querySelectorAll('.v2-pad-key').forEach(b => b.onclick = () => tapFC(b.dataset.k));
  }

  function tapFC(k) {
    if (phase !== 'input') return;
    if (k === '⌫') entered = entered.slice(0, -1);
    else if (k === '=') { submitFC(); return; }
    else if (entered.length < 4) entered += k;
    const d = document.getElementById('fc-disp'); if (d) d.textContent = entered || '—';
  }

  function submitFC() {
    phase = 'done';
    if (container._fcKey) { document.removeEventListener('keydown', container._fcKey); container._fcKey = null; }
    const val = parseInt(entered), correct2 = val === currentSum;
    const d = document.getElementById('fc-disp');
    if (correct2) { correct++; if (d) { d.textContent = '✅ ' + currentSum; d.style.color = 'var(--green)'; } }
    else { if (d) { d.textContent = `✗ Answer: ${currentSum}`; d.style.color = 'var(--red)'; } }
    container.querySelectorAll('.v2-pad-key').forEach(b => { b.onclick = null; b.style.opacity = '.4'; });
    setTimeout(nextRound, 1100);
  }

  intro();
  return { destroy() { if (container._fcKey) document.removeEventListener('keydown', container._fcKey); } };
}

/* ══════════════════════════════════════════
   GAME 14 v2 — Peripheral Vision
══════════════════════════════════════════ */
function createPeripheralVisionV2(container, onComplete) {
  const duration = v2Duration(45);
  const SYMS = ['★','◆','●','▲','■','♦','✿','⬟'];
  let score = 0, misses = 0, timeLeft = duration, gameTimer = null, animFrame = null, symbols = [];
  let W = 0, H = 0, canvas, ctx;

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">👁</div>
        <h2 class="v2i-title">Peripheral Vision</h2>
        <p class="v2i-sub">Keep your eyes locked on the <strong>+ in the center</strong>. Tap symbols that appear at the edges using only your peripheral vision.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>🎯</span><span>Focus on the central + at all times</span></div>
          <div class="v2i-rule"><span>⭐</span><span>Symbols fade — tap them before they vanish</span></div>
          <div class="v2i-rule"><span>❌</span><span>Tapping empty space counts as a miss</span></div>
          <div class="v2i-rule"><span>⏱</span><span>45 seconds · every hit = 4 points</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Test</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = startGame;
  }

  function startGame() {
    score = 0; misses = 0; timeLeft = duration; symbols = [];
    setHdrTimer(duration + 's'); setHdrScore('0 hits');

    container.innerHTML = `
      <div class="v2-pv-wrap">
        <div class="v2-pv-hud">
          <span>⏱ <b id="pv-tm">${duration}</b>s</span>
          <span>Hits: <b id="pv-sc" style="color:var(--green)">0</b></span>
          <span>Misses: <b id="pv-ms" style="color:var(--red)">0</b></span>
        </div>
        <p class="v2-pv-hint">Eyes on the + · tap the symbols</p>
        <canvas class="v2-pv-canvas" id="pv-canvas"></canvas>
      </div>`;
    fadeIn(container.querySelector('.v2-pv-wrap'));

    canvas = document.getElementById('pv-canvas');
    const wrap = container.querySelector('.v2-pv-wrap');
    W = Math.min(wrap.clientWidth - 8, 520);
    H = Math.round(W * 0.7);
    canvas.width = W; canvas.height = H;
    ctx = canvas.getContext('2d');

    canvas.onclick = handleClick;
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.touches[0], rect = canvas.getBoundingClientRect();
      handleClick({ clientX: t.clientX, clientY: t.clientY, rect });
    }, { passive: false });

    spawnSymbol();
    draw();
    gameTimer = setInterval(tick, 1000);
  }

  function spawnSymbol() {
    const margin = 28, sym = SYMS[rand(0, SYMS.length - 1)];
    const side = rand(0, 3);
    let x, y;
    if (side === 0) { x = rand(margin, W - margin); y = rand(8, margin); }
    else if (side === 1) { x = rand(W - margin, W - 8); y = rand(margin, H - margin); }
    else if (side === 2) { x = rand(margin, W - margin); y = rand(H - margin, H - 8); }
    else { x = rand(8, margin); y = rand(margin, H - margin); }
    symbols.push({ x, y, sym, born: Date.now(), life: 1800 });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d1124'; ctx.fillRect(0, 0, W, H);
    // Crosshair
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W/2 - 14, H/2); ctx.lineTo(W/2 + 14, H/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W/2, H/2 - 14); ctx.lineTo(W/2, H/2 + 14); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('+', W/2, H/2);
    // Symbols
    const now = Date.now();
    symbols = symbols.filter(s => now - s.born < s.life);
    symbols.forEach(s => {
      const age = (now - s.born) / s.life;
      ctx.globalAlpha = Math.max(0, 1 - age);
      ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 22px Arial';
      ctx.fillText(s.sym, s.x, s.y);
    });
    ctx.globalAlpha = 1;
    animFrame = requestAnimationFrame(draw);
  }

  function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width, scaleY = H / rect.height;
    const cx = (e.clientX - rect.left) * scaleX, cy = (e.clientY - rect.top) * scaleY;
    let hit = false;
    symbols = symbols.filter(s => {
      if (Math.hypot(cx - s.x, cy - s.y) < 30) { hit = true; return false; }
      return true;
    });
    if (hit) {
      score++;
      const sc = document.getElementById('pv-sc'); if (sc) sc.textContent = score;
      setHdrScore(score + ' hits');
      // Flash hit feedback
      ctx.globalAlpha = 0.4; ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
    } else {
      misses++;
      const ms = document.getElementById('pv-ms'); if (ms) ms.textContent = misses;
    }
  }

  function tick() {
    timeLeft--;
    const tm = document.getElementById('pv-tm'); if (tm) tm.textContent = timeLeft;
    setHdrTimer(timeLeft + 's');
    if (rand(0, 1)) spawnSymbol();
    if (timeLeft <= 0) {
      clearInterval(gameTimer); cancelAnimationFrame(animFrame);
      const total = score + misses, acc = total ? Math.round(score / total * 100) : 0;
      onComplete({ score: Math.min(100, Math.round(score * 180 / duration)), details: { Hits: score, Misses: misses, Accuracy: acc + '%' } });
    }
  }

  intro();
  return { destroy() { clearInterval(gameTimer); cancelAnimationFrame(animFrame); } };
}

/* ══════════════════════════════════════════
   GAME 15 v2 — Visual Search
══════════════════════════════════════════ */
function createVisualSearchV2(container, onComplete) {
  const targetRounds = v2Rounds(8);
  const densityBoost = v2ByDifficulty({ easy: -2, normal: 0, hard: 2 }, 0);
  const PAIRS = [
    { target:'B', distractor:'E' }, { target:'Q', distractor:'O' },
    { target:'6', distractor:'9' }, { target:'p', distractor:'q' },
    { target:'F', distractor:'E' }, { target:'d', distractor:'b' },
    { target:'M', distractor:'N' }, { target:'3', distractor:'8' }
  ];
  let round = 0, correct = 0, roundStart = 0, totalMs = 0;

  function intro() {
    clearHdr();
    container.innerHTML = `
      <div class="v2-intro">
        <div class="v2i-icon">🎯</div>
        <h2 class="v2i-title">Visual Search</h2>
        <p class="v2i-sub">Find the <strong>one different character</strong> hiding in a sea of similar-looking ones. Speed matters.</p>
        <div class="v2i-rules">
          <div class="v2i-rule"><span>🔍</span><span>The target is shown above the grid</span></div>
          <div class="v2i-rule"><span>👆</span><span>Tap it as fast as you can</span></div>
          <div class="v2i-rule"><span>❌</span><span>Wrong tap? Brief flash — keep looking</span></div>
          <div class="v2i-rule"><span>⚡</span><span>8 rounds · faster = more points</span></div>
        </div>
        <button class="v2-start-btn" id="v2-go">▶ Start Searching</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    document.getElementById('v2-go').onclick = nextRound;
  }

  function nextRound() {
    round++;
    if (round > targetRounds) {
      const avgMs = correct ? Math.round(totalMs / correct) : 9999;
      const speedBonus = Math.max(0, Math.round((5000 - Math.min(avgMs, 5000)) / 50));
      onComplete({ score: Math.min(100, Math.round(correct * 80 / targetRounds) + speedBonus), details: { Found: `${correct}/${targetRounds}`, 'Avg time': correct ? (totalMs/correct/1000).toFixed(1)+'s' : '—', 'Speed bonus': '+'+speedBonus } });
      return;
    }
    const { target, distractor } = PAIRS[rand(0, PAIRS.length - 1)];
    const isMobile = container.clientWidth < 420;
    const COLS = (isMobile ? 10 : 16) + densityBoost, ROWS = (isMobile ? 10 : 9) + Math.max(0, densityBoost);
    const total = COLS * ROWS;
    const targetIdx = rand(0, total - 1);
    const cells = Array.from({ length: total }, (_, i) => i === targetIdx ? target : distractor);
    roundStart = Date.now();
    setHdrTimer(`Round ${round}/${targetRounds}`); setHdrScore(`${correct} found`);

    container.innerHTML = `
      <div class="v2-vs-wrap">
        <div class="v2-ms-topbar">
          <span>Round <b>${round}</b>/${targetRounds}</span>
          <span style="color:var(--txt3)">Found: <b style="color:var(--green)">${correct}</b></span>
        </div>
        <div class="v2-vs-target-bar">Find: <span class="v2-vs-target-char">${target}</span></div>
        <div class="v2-vs-grid" id="vs-grid" style="grid-template-columns:repeat(${COLS},1fr)">
          ${cells.map((ch, i) => `<div class="v2-vs-cell${i===targetIdx?' tgt':''}" data-i="${i}">${ch}</div>`).join('')}
        </div>
      </div>`;
    fadeIn(container.querySelector('.v2-vs-wrap'));

    container.querySelectorAll('.v2-vs-cell').forEach(cell => {
      cell.onclick = () => {
        if (+cell.dataset.i === targetIdx) {
          totalMs += Date.now() - roundStart;
          cell.classList.add('found'); correct++;
          setTimeout(nextRound, 500);
        } else {
          cell.classList.add('wrong');
          setTimeout(() => cell.classList.remove('wrong'), 400);
        }
      };
    });
  }

  intro();
  return { destroy() {} };
}
