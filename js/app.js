/* ═══════════════════════════════════════
   IQ LAB — App Controller
═══════════════════════════════════════ */
const App = (() => {
  let currentGame = null, currentController = null, currentCategory = 'all';

  /* ── Screens ── */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    window.scrollTo(0, 0);
  }

  /* ── Dashboard ── */
  function showDashboard() {
    showScreen('dashboard');
    renderDailyIQ();
    renderGameCards(currentCategory);
    updateHeaderStats();
  }

  function renderGameCards(cat) {
    const grid = document.getElementById('games-grid');
    const filtered = cat === 'all' ? GAMES : GAMES.filter(g => g.category === cat);
    grid.innerHTML = filtered.map((g, i) => {
      const best = Storage.getBestScore(g.id);
      return `<div class="game-card" data-id="${g.id}" onclick="App.launchGame('${g.id}')">
        <div class="game-card-top ${g.category}">
          <span class="card-number">${GAMES.indexOf(g) + 1}</span>
          <span style="font-size:2.4rem">${g.icon}</span>
          <div class="play-overlay"><span>▶</span></div>
        </div>
        <div class="game-card-body">
          <div class="game-card-name">${g.name}</div>
          <div class="game-card-desc">${g.desc}</div>
          <div class="game-card-foot">
            <span class="cat-tag ${g.category}">${g.category}</span>
            <span class="best-score">${best ? `Best: <b>${best}</b>` : 'New'}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function renderDailyIQ() {
    const cats = Storage.getCategoryScores();
    const iq = Storage.calculateIQ(cats);
    const card = document.getElementById('daily-iq-card');
    const catColors = { memory: 'var(--memory)', logic: 'var(--logic)', speed: 'var(--speed)', attention: 'var(--attention)', reading: 'var(--reading)' };
    card.innerHTML = `
      <h3>Today's IQ Estimate</h3>
      <div class="iq-value">${iq}</div>
      <div class="iq-meta">Based on your recent activity</div>
      <div class="iq-bars">
        ${Object.entries(cats).map(([k, v]) => `
          <div class="iq-bar-row">
            <span>${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}%</span>
            <div class="iq-bar-track"><div class="iq-bar-fill" style="width:${v}%;background:${catColors[k]}"></div></div>
          </div>`).join('')}
      </div>`;
    document.getElementById('header-iq').textContent = iq;
  }

  function updateHeaderStats() {
    const streak = Storage.getStreak();
    document.getElementById('streak-count').textContent = streak.count;
    const xp = Storage.getXP();
    const level = Storage.getLevel(xp);
    document.getElementById('level-badge').textContent = level.icon + ' ' + level.name;
  }

  /* ── Category filter ── */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.dataset.cat;
        renderGameCards(currentCategory);
      });
    });
  });

  /* ── Launch game ── */
  function launchGame(id) {
    const game = GAMES.find(g => g.id === id);
    if (!game) return;
    currentGame = game;
    if (currentController) { try { currentController.destroy(); } catch (e) {} }
    currentController = null;

    document.getElementById('ghdr-icon').textContent = game.icon;
    document.getElementById('ghdr-title').textContent = game.name;
    document.getElementById('ghdr-timer').textContent = '';
    document.getElementById('ghdr-score').textContent = '';

    const content = document.getElementById('game-content');
    content.innerHTML = '';
    showScreen('game');

    currentController = game.create(content, result => handleGameComplete(result));
  }

  function exitGame() {
    if (currentController) { try { currentController.destroy(); } catch (e) {} currentController = null; }
    showDashboard();
  }

  function replayGame() {
    if (currentGame) launchGame(currentGame.id);
  }

  /* ── Game complete ── */
  function handleGameComplete(result) {
    if (!currentGame) return;
    if (currentController) { try { currentController.destroy(); } catch (e) {} currentController = null; }

    const { score, details } = result;
    const { prev, xpGain } = Storage.saveScore(currentGame.id, score, currentGame.category);
    Storage.updateStreak();

    // Build results screen
    const emoji = score >= 90 ? '🏆' : score >= 75 ? '🌟' : score >= 60 ? '✅' : score >= 40 ? '💡' : '💪';
    const title = score >= 90 ? 'Outstanding!' : score >= 75 ? 'Great job!' : score >= 60 ? 'Well done!' : score >= 40 ? 'Good effort!' : 'Keep practising!';

    document.getElementById('res-emoji').textContent = emoji;
    document.getElementById('res-title').textContent = title;
    document.getElementById('res-xp').textContent = `+${xpGain} XP gained`;

    // Animate score ring
    const arc = document.getElementById('score-ring-arc');
    const circumference = 327;
    arc.style.strokeDashoffset = circumference;
    document.getElementById('res-score').textContent = '0';

    let detailsHTML = '';
    if (prev > 0) detailsHTML += `<div class="detail-row"><span>Previous best</span><b>${prev}</b></div>`;
    if (score > prev) detailsHTML += `<div class="detail-row"><span>New best!</span><b style="color:var(--green)">✅</b></div>`;
    if (details) Object.entries(details).forEach(([k, v]) => detailsHTML += `<div class="detail-row"><span>${k}</span><b>${v}</b></div>`);
    document.getElementById('res-details').innerHTML = detailsHTML;

    showScreen('results');

    // Animate counter
    let cur = 0;
    const step = score / 40;
    const interval = setInterval(() => {
      cur = Math.min(score, cur + step);
      document.getElementById('res-score').textContent = Math.round(cur);
      const offset = circumference - (cur / 100) * circumference;
      arc.style.strokeDashoffset = offset;
      const hue = cur >= 80 ? '#10b981' : cur >= 60 ? '#3b82f6' : cur >= 40 ? '#f59e0b' : '#ef4444';
      arc.style.stroke = hue;
      if (cur >= score) clearInterval(interval);
    }, 35);
  }

  /* ── Analytics ── */
  function showAnalytics() {
    showScreen('analytics');
    const analytics = Storage.getAnalytics();
    const cats = Storage.getCategoryScores();
    const xp = Storage.getXP();
    const streak = Storage.getStreak();
    const total = analytics.length;
    const avgScore = total ? Math.round(analytics.reduce((a, b) => a + b.score, 0) / total) : 0;
    const catColors = { memory: 'var(--memory)', logic: 'var(--logic)', speed: 'var(--speed)', attention: 'var(--attention)', reading: 'var(--reading)' };

    const recent = [...analytics].reverse().slice(0, 15);
    const gamePlays = {};
    analytics.forEach(e => { gamePlays[e.gameId] = (gamePlays[e.gameId] || 0) + 1; });
    const favGame = Object.entries(gamePlays).sort((a, b) => b[1] - a[1])[0];
    const favName = favGame ? (GAMES.find(g => g.id === favGame[0])?.name || favGame[0]) : '—';

    document.getElementById('analytics-content').innerHTML = `
      <div class="analytics-section">
        <h3>Overview</h3>
        <div class="stat-grid">
          <div class="stat-box"><div class="val">${total}</div><div class="lbl">Total Sessions</div></div>
          <div class="stat-box"><div class="val">${avgScore}</div><div class="lbl">Avg Score</div></div>
          <div class="stat-box"><div class="val">${streak.count}</div><div class="lbl">Day Streak 🔥</div></div>
          <div class="stat-box"><div class="val">${xp}</div><div class="lbl">Total XP ⚡</div></div>
        </div>
      </div>
      <div class="analytics-section">
        <h3>Category Performance</h3>
        <div class="cat-progress">
          ${Object.entries(cats).map(([k, v]) => `
            <div>
              <div style="display:flex;justify-content:space-between"><span class="cat-progress">${k.charAt(0).toUpperCase()+k.slice(1)}</span><span style="font-size:.78rem;color:var(--txt3)">${v}%</span></div>
              <div class="cat-prog-bar"><div class="cat-prog-fill" style="width:${v}%;background:${catColors[k]}"></div></div>
            </div>`).join('')}
        </div>
      </div>
      <div class="analytics-section">
        <h3>Recent Sessions</h3>
        <div class="history-list">
          ${recent.length ? recent.map(e => {
            const game = GAMES.find(g => g.id === e.gameId);
            const date = new Date(e.date);
            const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return `<div class="history-item">
              <span>${game ? game.icon : '🎮'}</span>
              <span class="hi-name">${game ? game.name : e.gameId}</span>
              <span class="hi-score">${e.score}</span>
              <span class="hi-date">${dateStr}</span>
            </div>`;
          }).join('') : '<p style="color:var(--txt3);text-align:center;padding:20px">No sessions yet. Play some games!</p>'}
        </div>
      </div>
      <div class="analytics-section">
        <h3>Favourite Game</h3>
        <div class="stat-box" style="max-width:280px">
          <div class="val" style="font-size:1.2rem">${favName}</div>
          <div class="lbl">${favGame ? favGame[1] + ' sessions' : 'Play to see'}</div>
        </div>
      </div>`;
  }

  /* ── Profile ── */
  function showProfile() {
    showScreen('profile');
    const xp = Storage.getXP();
    const level = Storage.getLevel(xp);
    const streak = Storage.getStreak();
    const analytics = Storage.getAnalytics();
    const prevXP = level.name === 'Beginner' ? 0 : [0,100,300,600,1000,1500][['Beginner','Explorer','Thinker','Analyst','Genius','Master Mind'].indexOf(level.name)];
    const progress = Math.round(((xp - prevXP) / (level.next - prevXP)) * 100);

    const achievements = [
      { name: 'First Steps', icon: '👣', desc: 'Play your first game', unlocked: analytics.length >= 1 },
      { name: 'Speed Demon', icon: '⚡', desc: 'Score 80+ in a speed game', unlocked: analytics.some(e => e.score >= 80 && e.category === 'speed') },
      { name: 'Memory King', icon: '🧠', desc: 'Score 90+ in a memory game', unlocked: analytics.some(e => e.score >= 90 && e.category === 'memory') },
      { name: 'Logic Lord', icon: '🔮', desc: 'Score 85+ in a logic game', unlocked: analytics.some(e => e.score >= 85 && e.category === 'logic') },
      { name: 'On Fire', icon: '🔥', desc: '3-day streak', unlocked: streak.count >= 3 },
      { name: 'Dedicated', icon: '📅', desc: '7-day streak', unlocked: streak.count >= 7 },
      { name: 'Century', icon: '💯', desc: 'Score 100 in any game', unlocked: analytics.some(e => e.score >= 100) },
      { name: 'Explorer', icon: '🗺', desc: 'Play 10 different games', unlocked: new Set(analytics.map(e => e.gameId)).size >= 10 },
      { name: 'Veteran', icon: '🏅', desc: 'Complete 50 sessions', unlocked: analytics.length >= 50 },
    ];

    document.getElementById('profile-content').innerHTML = `
      <div class="profile-level">
        <div class="level-icon">${level.icon}</div>
        <div class="level-name">${level.name}</div>
        <div class="xp-bar-wrap">
          <div class="xp-bar-track"><div class="xp-bar-fill" style="width:${progress}%"></div></div>
          <div class="xp-label"><span>${xp} XP</span><span>${level.next} XP</span></div>
        </div>
        <div style="font-size:.82rem;color:var(--txt3)">Streak: 🔥 ${streak.count} days</div>
      </div>
      <div class="analytics-section">
        <h3>Achievements</h3>
        <div class="achievements">
          ${achievements.map(a => `
            <div class="achievement ${a.unlocked ? 'unlocked' : 'locked'}">
              <div class="ach-icon">${a.icon}</div>
              <div class="ach-name">${a.name}</div>
              <div class="ach-desc">${a.desc}</div>
            </div>`).join('')}
        </div>
      </div>
      <div style="text-align:center;margin-top:20px">
        <button class="btn-ghost" onclick="if(confirm('Reset all progress?'))Storage.reset()||location.reload()">Reset Progress</button>
      </div>`;
  }

  /* ── Toast ── */
  function toast(msg, dur = 2500) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), dur);
  }

  /* ── Init ── */
  function init() {
    showDashboard();
    Storage.updateStreak();
    updateHeaderStats();
    // Check first visit
    if (Storage.getAnalytics().length === 0) {
      setTimeout(() => toast('🧠 Welcome to IQ Lab! Click any game card to start training.', 4000), 800);
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return { showDashboard, launchGame, exitGame, replayGame, showAnalytics, showProfile, toast };
})();
