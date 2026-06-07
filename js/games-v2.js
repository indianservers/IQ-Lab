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

/* ══════════════════════════════════════════
   GAME 1 v2 — Fast Reading Challenge
══════════════════════════════════════════ */
function createFastReadingV2(container, onComplete) {
  const passages = [
    { topic: '🧠 Brain Science', text: 'The human brain processes information at remarkable speed. Scientists have found the brain can identify familiar words in as little as one hundred and fifty milliseconds. Reading speed can double with regular practice using techniques like reducing inner speech and expanding your visual span.', questions: [{ q: 'How fast can the brain identify words?', opts: ['50 ms', '100 ms', '150 ms', '250 ms'], ans: 2 }, { q: 'What does speed reading reduce?', opts: ['Eye strain', 'Inner speech', 'Word count', 'Memory load'], ans: 1 }, { q: 'What expands with reading practice?', opts: ['Brain size', 'Visual span', 'Vocabulary', 'IQ'], ans: 1 }] },
    { topic: '💤 Memory & Sleep', text: 'Memory works in three stages. Sensory memory lasts a fraction of a second then passes to working memory which holds roughly seven items. Long-term memory stores vast information for decades. Sleep plays a crucial role by consolidating memories from working memory into long-term storage during the night.', questions: [{ q: 'Working memory holds about how many items?', opts: ['3', '5', '7', '12'], ans: 2 }, { q: 'What moves memories to long-term storage?', opts: ['Exercise', 'Sleep', 'Reading aloud', 'Music'], ans: 1 }, { q: 'Sensory memory lasts:', opts: ['Hours', 'Minutes', 'Seconds', 'A fraction of a second'], ans: 3 }] },
    { topic: '💡 Cognitive Flexibility', text: 'Cognitive flexibility is the ability to switch between different concepts or mental tasks. People high in this trait solve problems creatively and adapt quickly to new situations. Learning a new language or musical instrument strengthens this ability significantly over time and keeps the aging brain sharp.', questions: [{ q: 'Cognitive flexibility helps you:', opts: ['Run faster', 'Solve problems creatively', 'Sleep better', 'Eat less'], ans: 1 }, { q: 'Which activity builds cognitive flexibility?', opts: ['Watching TV', 'Sleeping more', 'Learning an instrument', 'Stretching'], ans: 2 }, { q: 'This trait helps people adapt to:', opts: ['New foods', 'New situations', 'New climates', 'New friends'], ans: 1 }] }
  ];

  let wpm = 300, pIdx = rand(0, passages.length - 1), rsvpTimer = null, answers = [], qIdx = 0;

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
        <p class="v2i-pick-label">Choose speed:</p>
        <div class="v2-speed-grid">
          <button class="v2-speed-btn" data-wpm="150"><span class="v2sb-val">150</span><span class="v2sb-lbl">Casual</span></button>
          <button class="v2-speed-btn active" data-wpm="300"><span class="v2sb-val">300</span><span class="v2sb-lbl">Normal</span></button>
          <button class="v2-speed-btn" data-wpm="500"><span class="v2sb-val">500</span><span class="v2sb-lbl">Fast</span></button>
          <button class="v2-speed-btn" data-wpm="800"><span class="v2sb-val">800</span><span class="v2sb-lbl">Turbo</span></button>
        </div>
        <button class="v2-start-btn" id="v2-go">▶&thinsp; Start Reading</button>
      </div>`;
    fadeIn(container.querySelector('.v2-intro'));
    container.querySelectorAll('.v2-speed-btn').forEach(b => b.onclick = () => {
      container.querySelectorAll('.v2-speed-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); wpm = +b.dataset.wpm;
    });
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
  let level = 5, seq = [], entered = [], phase = 'intro';
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
    setHdrScore(`Level ${level - 4}`);
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
        const score = Math.round(((level - (ok ? 5 : 5)) / 15) * 100);
        onComplete({ score: Math.min(100, score), details: { 'Max span': level + (ok ? '' : ' (failed)') + ' digits', 'Level': level - 4 } });
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
    if (round > 10) { onComplete({ score: totalScore, details: { Rounds: 10, 'Best grid': size + '×' + size } }); return; }
    size = round <= 3 ? 3 : round <= 6 ? 4 : round <= 8 ? 5 : 6;
    const total = size * size;
    const count = Math.min(Math.ceil(total * 0.35) + Math.floor(round / 3), total - 1);
    lit = shuffle([...Array(total).keys()]).slice(0, count);
    selected = [];
    setHdrScore(`Score ${totalScore}`);
    setHdrTimer(`Round ${round}/10`);
    showGrid(true);
  }

  function showGrid(showLit) {
    const px = cellPx();
    container.innerHTML = `
      <div class="v2-pm-wrap">
        <div class="v2-pm-top">
          <div class="v2-pm-rounds"><span>Round <b>${round}</b> / 10</span></div>
          <div class="v2-pm-info" id="pm-info">${showLit ? 'Memorise the pattern!' : 'Recreate it!'}</div>
          <div class="v2-pm-score">Score: <b>${totalScore}</b></div>
        </div>
        <div class="v2-prog-track"><div class="v2-prog-fill" style="width:${(round - 1) / 10 * 100}%"></div></div>
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
  const COLORS = [
    { name: 'Red',    hex: '#ef4444', var: '--red' },
    { name: 'Blue',   hex: '#3b82f6', var: '--blue' },
    { name: 'Green',  hex: '#10b981', var: '--green' },
    { name: 'Yellow', hex: '#f59e0b', var: '--yellow' },
    { name: 'Purple', hex: '#8b5cf6', var: '--purple' }
  ];
  let score = 0, wrong = 0, timeLeft = 60, gameTimer = null, inkColor = null, phase = 'intro';

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
    phase = 'play'; score = 0; wrong = 0; timeLeft = 60;
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
            <span class="v2-sh-timer-txt" id="st-tm">60</span>
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
    if (ring) ring.style.strokeDashoffset = 163 * (1 - timeLeft / 60);
    if (timeLeft <= 0) {
      clearInterval(gameTimer); phase = 'done';
      const total = score + wrong, acc = total ? Math.round(score / total * 100) : 0;
      onComplete({ score: Math.round(score * 1.5), details: { Correct: score, Wrong: wrong, Accuracy: acc + '%', 'Per minute': Math.round(score * 60 / 60) } });
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
  const N = 2, TRIALS = 24;
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
  let timeLeft = 60, score = 0, streak = 0, maxStreak = 0;
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
    const ops = score < 5 ? ['+', '−'] : score < 12 ? ['+', '−', '×'] : ['+', '−', '×', '÷'];
    op = ops[rand(0, ops.length - 1)];
    if (op === '+')  { a = rand(10, 99); b = rand(10, 99); ans = a + b; }
    else if (op === '−') { a = rand(20, 99); b = rand(1, a - 1); ans = a - b; }
    else if (op === '×') { a = rand(2, 12); b = rand(2, 12); ans = a * b; }
    else { ans = rand(2, 12); b = rand(2, 12); a = ans * b; }
  }

  function startGame() {
    phase = 'play'; score = 0; streak = 0; maxStreak = 0; timeLeft = 60; entered = '';
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
          <div class="v2-mm-hud-item main"><span class="v2-mm-hud-val cyan" id="mm-tm">60</span><span class="v2-mm-hud-lbl">Seconds</span></div>
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
      bar.style.width = (timeLeft / 60 * 100) + '%';
      if (timeLeft <= 10) bar.style.background = 'var(--red)';
      else if (timeLeft <= 20) bar.style.background = 'var(--yellow)';
    }
    if (timeLeft <= 0) {
      clearInterval(gameTimer); phase = 'done';
      onComplete({ score: Math.min(100, score * 5), details: { Correct: score, 'Best streak': maxStreak + ' 🔥', Operations: score >= 12 ? '+−×÷' : score >= 5 ? '+−×' : '+−' } });
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
    round++; if (round > 10) { onComplete({ score: correct * 10, details: { Correct: `${correct}/10` } }); return; }
    const { matrix, ans, choices } = makeMatrix();
    const sz = Math.min(54, Math.floor((Math.min(container.clientWidth, 340) - 40) / 3));
    setHdrTimer(`Round ${round}/10`); setHdrScore(`${correct} correct`);
    container.innerHTML = `
      <div class="v2-ms-wrap">
        <div class="v2-ms-topbar">
          <span>Round <b>${round}</b> / 10</span>
          <span style="color:var(--txt3)">Correct: <b style="color:var(--green)">${correct}</b></span>
        </div>
        <div class="v2-prog-track" style="width:100%;max-width:340px"><div class="v2-prog-fill" style="width:${(round-1)/10*100}%"></div></div>
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
    round++; if (round > 8) { onComplete({ score: correct * 12 + 4, details: { Correct: `${correct}/8` } }); return; }
    const { m, ans, wrongs } = makeMatrix();
    const choices = shuffle([ans, ...wrongs]);
    const sz = Math.min(50, Math.floor((Math.min(container.clientWidth, 320) - 36) / 3));
    setHdrTimer(`Round ${round}/8`); setHdrScore(`${correct} correct`);
    container.innerHTML = `
      <div class="v2-ms-wrap">
        <div class="v2-ms-topbar">
          <span>Round <b>${round}</b> / 8</span>
          <span style="color:var(--txt3)">Correct: <b style="color:var(--green)">${correct}</b></span>
        </div>
        <div class="v2-prog-track" style="width:100%;max-width:320px"><div class="v2-prog-fill" style="width:${(round-1)/8*100}%"></div></div>
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
    round++; if (round > 10) { onComplete({ score: correct * 10, details: { Correct: `${correct}/10` } }); return; }
    const path = ROT_SHAPES[rand(0, ROT_SHAPES.length - 1)];
    const color = PALETTE[rand(0, PALETTE.length - 1)];
    const targetDeg = [90, 180, 270][rand(0, 2)];
    const allDegs = [0, 90, 180, 270];
    const choices = shuffle(allDegs.map(deg => ({ deg, ok: deg === targetDeg })));
    const sz = Math.min(90, Math.floor((Math.min(container.clientWidth, 380) - 32) / 2) - 20);
    setHdrTimer(`Round ${round}/10`); setHdrScore(`${correct} correct`);
    container.innerHTML = `
      <div class="v2-rot-wrap">
        <div class="v2-rot-topbar">
          <span>Round <b>${round}</b> / 10</span>
          <span style="color:var(--txt3)">Correct: <b style="color:var(--green)">${correct}</b></span>
        </div>
        <div class="v2-prog-track" style="width:100%;max-width:380px"><div class="v2-prog-fill" style="width:${(round-1)/10*100}%"></div></div>
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
    round++; if (round > 10) { finish(); return; }
    const lvl = LEVELS[Math.min(Math.floor((round - 1) / 2), LEVELS.length - 1)];
    const [base, oddEm] = lvl.sets[rand(0, lvl.sets.length - 1)];
    const total = lvl.cols * lvl.rows;
    oddIdx = rand(0, total - 1);
    const grid = Array.from({ length: total }, (_, i) => i === oddIdx ? oddEm : base);
    timeLeft = lvl.secs;
    setHdrTimer(`Round ${round}/10`); setHdrScore(`Score ${score}`);

    container.innerHTML = `
      <div class="v2-oot-wrap">
        <div class="v2-oot-timerbar-wrap">
          <div class="v2-oot-timerbar" id="oot-bar" style="width:100%;transition:width ${lvl.secs}s linear"></div>
        </div>
        <div class="v2-oot-top">
          <span>Round <b>${round}</b>/10</span>
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
      if (bar) { bar.style.transition = 'none'; bar.style.width = '100%'; bar.offsetHeight; bar.style.transition = `width ${lvl.secs}s linear`; bar.style.width = '0%'; }
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
    onComplete({ score: Math.min(100, score * 10), details: { Score: score + '/10', Rounds: 10 } });
  }
  function cleanup() { clearInterval(roundTimer); }
  intro();
  return { destroy: cleanup };
}

/* ══════════════════════════════════════════
   GAME 11 v2 — Sequence Prediction
══════════════════════════════════════════ */
function createSequencePredictionV2(container, onComplete) {
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
    if (round > 10) { onComplete({ score: correct * 10, details: { Correct: `${correct}/10` } }); return; }
    const { seq, ans, hint, distractors } = makeSeq();
    const choices = shuffle([ans, ...distractors.slice(0, 3)]);
    setHdrTimer(`Round ${round}/10`); setHdrScore(`${correct} correct`);
    container.innerHTML = `
      <div class="v2-seq-wrap">
        <div class="v2-ms-topbar">
          <span>Round <b>${round}</b>/10</span>
          <span style="color:var(--txt3)">Correct: <b style="color:var(--green)">${correct}</b></span>
        </div>
        <div class="v2-prog-track" style="width:100%;max-width:380px"><div class="v2-prog-fill" style="width:${(round-1)/10*100}%"></div></div>
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
  const EMOJIS = ['🐶','🐱','🦊','🐻','🐼','🐸','🦁','🐯','🦋','🐙','🦄','🌺','🍎','🚀','⭐','🎸'];
  let level = 1, moves = 0, matched = 0, first = null, locked = false;
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
    setHdrTimer(`Level ${level}/5`); setHdrScore('0 moves');

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
          if (level < 5) { level++; buildGame(); }
          else onComplete({ score: Math.min(100, efficiency + level * 5), details: { Levels: 5, 'Total moves': totalMoves, 'Last time': seconds + 's' } });
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
    if (round > 10) { onComplete({ score: correct * 10, details: { Correct: `${correct}/10` } }); return; }
    const count = round <= 3 ? 3 : round <= 7 ? 4 : 5;
    const nums = Array.from({ length: count }, () => rand(5, 25));
    currentSum = nums.reduce((a, b) => a + b, 0);
    entered = ''; phase = 'flash';
    setHdrTimer(`Round ${round}/10`); setHdrScore(`${correct} correct`);

    container.innerHTML = `
      <div class="v2-fc-wrap">
        <div class="v2-ms-topbar">
          <span>Round <b>${round}</b>/10</span>
          <span style="color:var(--txt3)">Correct: <b style="color:var(--green)">${correct}</b></span>
        </div>
        <div class="v2-prog-track" style="width:100%;max-width:360px"><div class="v2-prog-fill" style="width:${(round-1)/10*100}%"></div></div>
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
      setTimeout(flashNext, round <= 5 ? 650 : 520);
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
  const SYMS = ['★','◆','●','▲','■','♦','✿','⬟'];
  let score = 0, misses = 0, timeLeft = 45, gameTimer = null, animFrame = null, symbols = [];
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
    score = 0; misses = 0; timeLeft = 45; symbols = [];
    setHdrTimer('45s'); setHdrScore('0 hits');

    container.innerHTML = `
      <div class="v2-pv-wrap">
        <div class="v2-pv-hud">
          <span>⏱ <b id="pv-tm">45</b>s</span>
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
      onComplete({ score: Math.min(100, score * 4), details: { Hits: score, Misses: misses, Accuracy: acc + '%' } });
    }
  }

  intro();
  return { destroy() { clearInterval(gameTimer); cancelAnimationFrame(animFrame); } };
}

/* ══════════════════════════════════════════
   GAME 15 v2 — Visual Search
══════════════════════════════════════════ */
function createVisualSearchV2(container, onComplete) {
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
    if (round > 8) {
      const avgMs = correct ? Math.round(totalMs / correct) : 9999;
      const speedBonus = Math.max(0, Math.round((5000 - Math.min(avgMs, 5000)) / 50));
      onComplete({ score: Math.min(100, correct * 10 + speedBonus), details: { Found: `${correct}/8`, 'Avg time': correct ? (totalMs/correct/1000).toFixed(1)+'s' : '—', 'Speed bonus': '+'+speedBonus } });
      return;
    }
    const { target, distractor } = PAIRS[rand(0, PAIRS.length - 1)];
    const isMobile = container.clientWidth < 420;
    const COLS = isMobile ? 10 : 16, ROWS = isMobile ? 10 : 9;
    const total = COLS * ROWS;
    const targetIdx = rand(0, total - 1);
    const cells = Array.from({ length: total }, (_, i) => i === targetIdx ? target : distractor);
    roundStart = Date.now();
    setHdrTimer(`Round ${round}/8`); setHdrScore(`${correct} found`);

    container.innerHTML = `
      <div class="v2-vs-wrap">
        <div class="v2-ms-topbar">
          <span>Round <b>${round}</b>/8</span>
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
