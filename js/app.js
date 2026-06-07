/* ═══════════════════════════════════════
   IQ LAB — App Controller
═══════════════════════════════════════ */
const App = (() => {
  const CAT_LABELS = {
    memory: 'Memory',
    logic: 'Logic',
    speed: 'Speed',
    attention: 'Attention',
    reading: 'Reading'
  };
  const CAT_ICONS = {
    memory: '🧠',
    logic: '🔮',
    speed: '⚡',
    attention: '👁',
    reading: '📖'
  };
  const CAT_COLORS = {
    memory: 'var(--memory)',
    logic: 'var(--logic)',
    speed: 'var(--speed)',
    attention: 'var(--attention)',
    reading: 'var(--reading)'
  };
  const DAILY_GOAL = 5;
  const PREF_KEY = 'iqlab_ui_prefs';
  const LEVEL_KEY = 'iqlab_active_level';

  let currentGame = null;
  let currentController = null;
  let currentLevel = localStorage.getItem(LEVEL_KEY) || 'juniors';
  let currentCategory = 'all';
  let currentQuery = '';
  let currentSort = 'recommended';
  let prefs = loadPrefs();

  function loadPrefs() {
    try {
      return Object.assign({ theme: 'dark', contrast: false, reducedMotion: false }, JSON.parse(localStorage.getItem(PREF_KEY)) || {});
    } catch {
      return { theme: 'dark', contrast: false, reducedMotion: false };
    }
  }

  function savePrefs() {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  }

  function applyPrefs() {
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.dataset.contrast = prefs.contrast ? 'high' : 'normal';
    document.documentElement.dataset.motion = prefs.reducedMotion ? 'reduced' : 'full';
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function getAnalytics() {
    return Storage.getAnalytics(currentLevel);
  }

  function getLevelMeta() {
    return (window.GAME_LEVEL_META && window.GAME_LEVEL_META[currentLevel]) || {
      label: 'Juniors',
      title: 'Train Your Brain',
      subtitle: '30 cognitive challenges to sharpen your mind every day',
      iqLabel: "Today's IQ Estimate"
    };
  }

  function activeGames() {
    return (window.GAME_LEVELS && window.GAME_LEVELS[currentLevel]) || window.GAMES || [];
  }

  function scoreKey(game) {
    return `${currentLevel}:${game.id}`;
  }

  function sessionsToday() {
    const today = todayKey();
    return getAnalytics().filter(e => (e.date || '').slice(0, 10) === today).length;
  }

  function getRecentTrend() {
    const history = getAnalytics();
    if (history.length < 2) return { value: 'same', label: 'No trend yet', icon: '→' };
    const recent = history.slice(-5);
    const previous = history.slice(Math.max(0, history.length - 10), Math.max(0, history.length - 5));
    const avg = arr => arr.length ? arr.reduce((sum, e) => sum + e.score, 0) / arr.length : 0;
    const diff = Math.round(avg(recent) - avg(previous));
    if (diff > 2) return { value: 'up', label: `Up ${diff}`, icon: '↗' };
    if (diff < -2) return { value: 'down', label: `Down ${Math.abs(diff)}`, icon: '↘' };
    return { value: 'same', label: 'Stable', icon: '→' };
  }

  function getWeakestCategory() {
    const cats = Storage.getCategoryScores(currentLevel);
    const entries = Object.entries(cats);
    const played = entries.filter(([, score]) => score > 0);
    if (!played.length) return 'memory';
    return played.sort((a, b) => a[1] - b[1])[0][0];
  }

  function getGameStats(game) {
    const data = Storage.getData();
    const scoreEntry = data.scores[scoreKey(game)] || data.scores[game.id];
    const history = scoreEntry?.history || [];
    const best = scoreEntry?.best || 0;
    const plays = history.length;
    const status = plays === 0 ? 'New' : best >= 85 ? 'Mastered' : 'Tried';
    return { best, plays, status };
  }

  function getGameDifficulty(game) {
    const idx = activeGames().indexOf(game);
    if (idx < 10) return 'Easy';
    if (idx < 22) return 'Medium';
    return 'Hard';
  }

  function getEstimatedTime(game) {
    const times = {
      speed: '1-2 min',
      attention: '2-3 min',
      memory: '2-4 min',
      logic: '3-5 min',
      reading: '3-6 min'
    };
    return times[game.category] || '2-4 min';
  }

  function getFilteredGames(cat = currentCategory) {
    const weakest = getWeakestCategory();
    let games = cat === 'all' ? [...activeGames()] : activeGames().filter(g => g.category === cat);
    if (currentQuery) {
      const q = currentQuery.toLowerCase();
      games = games.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.desc.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      );
    }
    games.sort((a, b) => {
      if (currentSort === 'name') return a.name.localeCompare(b.name);
      if (currentSort === 'best') return getGameStats(b).best - getGameStats(a).best;
      if (currentSort === 'difficulty') return ['Easy', 'Medium', 'Hard'].indexOf(getGameDifficulty(a)) - ['Easy', 'Medium', 'Hard'].indexOf(getGameDifficulty(b));
      if (currentSort === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      const aBoost = a.category === weakest ? -1 : 0;
      const bBoost = b.category === weakest ? -1 : 0;
      return aBoost - bBoost || getGameStats(a).plays - getGameStats(b).plays || activeGames().indexOf(a) - activeGames().indexOf(b);
    });
    return games;
  }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    window.scrollTo(0, 0);
  }

  function showDashboard() {
    showScreen('dashboard');
    renderLevelTabs();
    renderLevelHero();
    renderDailyIQ();
    renderDashboardTools();
    renderRecommended();
    renderSkeletonCards();
    setTimeout(() => renderGameCards(currentCategory), prefs.reducedMotion ? 0 : 120);
    updateHeaderStats();
  }

  function renderSkeletonCards() {
    const grid = document.getElementById('games-grid');
    grid.innerHTML = Array.from({ length: 8 }, () => `
      <div class="game-card skeleton-card">
        <div class="skeleton-block skeleton-top"></div>
        <div class="skeleton-lines">
          <span></span><span></span><span></span>
        </div>
      </div>`).join('');
  }

  function renderDashboardTools() {
    const done = Math.min(DAILY_GOAL, sessionsToday());
    const pct = Math.round(done / DAILY_GOAL * 100);
    const fill = document.getElementById('daily-goal-fill');
    const label = document.getElementById('daily-goal-label');
    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = `${done}/${DAILY_GOAL}`;

    const last = getAnalytics().at(-1);
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      if (last) {
        const game = activeGames().find(g => g.id === last.gameId);
        continueBtn.disabled = false;
        continueBtn.textContent = `Continue ${game ? game.name : 'Last Game'}`;
      } else {
        continueBtn.disabled = true;
        continueBtn.textContent = 'Continue Last Game';
      }
    }

    updateCategoryCounts();
  }

  function updateCategoryCounts() {
    const games = activeGames();
    const counts = games.reduce((acc, game) => {
      acc[game.category] = (acc[game.category] || 0) + 1;
      return acc;
    }, {});
    document.querySelectorAll('.cat-btn').forEach(btn => {
      const cat = btn.dataset.cat;
      if (cat === 'all') btn.textContent = `All (${games.length})`;
      else btn.textContent = `${CAT_ICONS[cat]} ${CAT_LABELS[cat]} (${counts[cat] || 0})`;
    });
  }

  function renderLevelTabs() {
    document.querySelectorAll('.level-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.level === currentLevel);
    });
  }

  function renderLevelHero() {
    const meta = getLevelMeta();
    const title = document.querySelector('.hero-text h1');
    const copy = document.querySelector('.hero-text p');
    if (title) title.textContent = meta.title;
    if (copy) copy.textContent = meta.subtitle;
  }

  function renderRecommended() {
    const section = document.getElementById('recommended-section');
    if (!section) return;
    const weakest = getWeakestCategory();
    const picks = activeGames()
      .filter(g => g.category === weakest)
      .sort((a, b) => getGameStats(a).plays - getGameStats(b).plays || activeGames().indexOf(a) - activeGames().indexOf(b))
      .slice(0, 3);
    section.innerHTML = `
      <div class="section-heading">
        <div>
          <span class="section-kicker">Recommended Today</span>
          <h2>${CAT_ICONS[weakest]} Build ${CAT_LABELS[weakest]}</h2>
        </div>
        <button class="btn-ghost small-btn" onclick="App.setCategory('${weakest}')">View ${CAT_LABELS[weakest]}</button>
      </div>
      <div class="recommended-strip">
        ${picks.map(g => {
          const stats = getGameStats(g);
          return `<button class="recommended-item" onclick="App.launchGame('${g.id}')">
            <span class="rec-icon">${g.icon}</span>
            <span><b>${escapeHTML(g.name)}</b><small>${stats.best ? `Best ${stats.best}` : 'Fresh challenge'}</small></span>
          </button>`;
        }).join('')}
      </div>`;
  }

  function renderGameCards(cat) {
    const grid = document.getElementById('games-grid');
    const filtered = getFilteredGames(cat);
    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div>⌕</div>
          <h3>No challenges found</h3>
          <p>Try another search, category, or sort option.</p>
          <button class="btn-primary" onclick="App.clearFilters()">Clear Filters</button>
        </div>`;
      return;
    }
    grid.innerHTML = filtered.map((g, i) => {
      const stats = getGameStats(g);
      const difficulty = getGameDifficulty(g);
      const progress = Math.min(100, stats.best);
      const delay = prefs.reducedMotion ? 0 : Math.min(i * 25, 450);
      return `<button class="game-card" data-id="${g.id}" onclick="App.launchGame('${g.id}')" style="--delay:${delay}ms">
        <div class="game-card-top ${g.category}">
          <span class="card-number">${activeGames().indexOf(g) + 1}</span>
          <span class="difficulty-badge ${difficulty.toLowerCase()}">${difficulty}</span>
          <span class="game-card-icon">${g.icon}</span>
          <div class="score-ring-mini" style="--score:${progress}%"><span>${progress || 0}</span></div>
          <div class="play-overlay"><span>▶</span></div>
        </div>
        <div class="game-card-body">
          <div class="game-card-name">${escapeHTML(g.name)}</div>
          <div class="game-card-desc">${escapeHTML(g.desc)}</div>
          <div class="card-preview">
            <span>${getEstimatedTime(g)}</span>
            <span>${CAT_LABELS[g.category]}</span>
          </div>
          <div class="game-card-foot">
            <span class="cat-tag ${g.category}">${g.category}</span>
            <span class="status-badge ${stats.status.toLowerCase()}">${stats.status}</span>
            <span class="best-score">${stats.best ? `Best: <b>${stats.best}</b>` : 'New'}</span>
          </div>
        </div>
      </button>`;
    }).join('');
  }

  function renderDailyIQ() {
    const cats = Storage.getCategoryScores(currentLevel);
    const iq = Storage.calculateIQ(cats);
    const trend = getRecentTrend();
    const meta = getLevelMeta();
    const card = document.getElementById('daily-iq-card');
    const previous = Number(card.dataset.iq || iq);
    card.dataset.iq = iq;
    card.innerHTML = `
      <h3>${meta.iqLabel}</h3>
      <div class="iq-line">
        <div class="iq-value" id="iq-count">${previous}</div>
        <span class="trend-pill ${trend.value}">${trend.icon} ${trend.label}</span>
      </div>
      <div class="iq-meta">Based on your recent activity</div>
      <div class="iq-bars">
        ${Object.entries(cats).map(([k, v]) => `
          <div class="iq-bar-row">
            <span>${CAT_LABELS[k]}: ${v}%</span>
            <div class="iq-bar-track"><div class="iq-bar-fill" style="width:${v}%;background:${CAT_COLORS[k]}"></div></div>
          </div>`).join('')}
      </div>`;
    document.getElementById('header-iq').textContent = iq;
    animateNumber(document.getElementById('iq-count'), previous, iq, 500);
  }

  function animateNumber(el, from, to, duration) {
    if (!el || prefs.reducedMotion) {
      if (el) el.textContent = to;
      return;
    }
    const start = performance.now();
    function tick(now) {
      const pct = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(from + (to - from) * pct);
      if (pct < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function updateHeaderStats() {
    const streak = Storage.getStreak();
    document.getElementById('streak-count').textContent = streak.count;
    const xp = Storage.getXP();
    const level = Storage.getLevel(xp);
    document.getElementById('level-badge').textContent = level.icon + ' ' + level.name;
  }

  document.addEventListener('DOMContentLoaded', () => {
    applyPrefs();
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentCategory = e.currentTarget.dataset.cat;
        renderGameCards(currentCategory);
      });
    });
    document.getElementById('game-search')?.addEventListener('input', e => {
      currentQuery = e.target.value.trim();
      renderGameCards(currentCategory);
    });
    document.getElementById('game-sort')?.addEventListener('change', e => {
      currentSort = e.target.value;
      renderGameCards(currentCategory);
    });
  });

  function setCategory(cat) {
    currentCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.cat === cat));
    renderGameCards(currentCategory);
    document.getElementById('games-grid')?.scrollIntoView({ behavior: prefs.reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function setIQLevel(level) {
    if (!window.GAME_LEVELS || !window.GAME_LEVELS[level]) return;
    currentLevel = level;
    localStorage.setItem(LEVEL_KEY, level);
    currentCategory = 'all';
    currentQuery = '';
    currentSort = 'recommended';
    const search = document.getElementById('game-search');
    const sort = document.getElementById('game-sort');
    if (search) search.value = '';
    if (sort) sort.value = 'recommended';
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.cat === 'all'));
    showDashboard();
    toast(`${getLevelMeta().label} track selected`);
  }

  function clearFilters() {
    currentQuery = '';
    currentCategory = 'all';
    currentSort = 'recommended';
    const search = document.getElementById('game-search');
    const sort = document.getElementById('game-sort');
    if (search) search.value = '';
    if (sort) sort.value = 'recommended';
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.cat === 'all'));
    renderGameCards(currentCategory);
  }

  function continueLastGame() {
    const last = getAnalytics().at(-1);
    if (!last) return toast('Play one challenge first, then this shortcut wakes up.');
    launchGame(last.gameId);
  }

  function launchGame(id) {
    const game = activeGames().find(g => g.id === id);
    if (!game) return;
    localStorage.setItem('iqlab_last_game', id);
    currentGame = game;
    if (currentController) { try { currentController.destroy(); } catch (e) {} }
    currentController = null;

    document.getElementById('ghdr-icon').textContent = game.icon;
    document.getElementById('ghdr-title').textContent = game.name;
    document.getElementById('ghdr-timer').textContent = getEstimatedTime(game);
    document.getElementById('ghdr-score').textContent = getGameDifficulty(game);

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

  function getResultBreakdown(score, details = {}) {
    const text = Object.values(details).join(' ').toLowerCase();
    const speed = /ms|time|avg|seconds|duration|found/.test(text) ? Math.min(100, Math.max(20, score + 6)) : Math.max(20, score - 6);
    const accuracy = /correct|found|score|rounds/.test(text) ? score : Math.max(20, score - 3);
    const consistency = Math.round((score + accuracy + speed) / 3);
    return { Accuracy: accuracy, Speed: speed, Consistency: consistency };
  }

  function handleGameComplete(result) {
    if (!currentGame) return;
    if (currentController) { try { currentController.destroy(); } catch (e) {} currentController = null; }

    const { score, details = {} } = result;
    const { prev, xpGain } = Storage.saveScore(scoreKey(currentGame), score, currentGame.category, currentLevel);
    Storage.updateStreak();

    const emoji = score >= 90 ? '🏆' : score >= 75 ? '🌟' : score >= 60 ? '✅' : score >= 40 ? '💡' : '💪';
    const title = score >= 90 ? 'Outstanding!' : score >= 75 ? 'Great job!' : score >= 60 ? 'Well done!' : score >= 40 ? 'Good effort!' : 'Keep practising!';

    document.getElementById('res-emoji').textContent = emoji;
    document.getElementById('res-title').textContent = title;
    document.getElementById('res-xp').textContent = `+${xpGain} XP gained`;

    const arc = document.getElementById('score-ring-arc');
    const circumference = 327;
    arc.style.strokeDashoffset = circumference;
    document.getElementById('res-score').textContent = '0';

    let detailsHTML = '';
    if (prev > 0) detailsHTML += `<div class="detail-row"><span>Previous best</span><b>${prev}</b></div>`;
    if (score > prev) detailsHTML += `<div class="detail-row"><span>New best!</span><b style="color:var(--green)">✓</b></div>`;
    Object.entries(details).forEach(([k, v]) => detailsHTML += `<div class="detail-row"><span>${escapeHTML(k)}</span><b>${escapeHTML(v)}</b></div>`);
    detailsHTML += `<div class="result-breakdown">${Object.entries(getResultBreakdown(score, details)).map(([k, v]) => `
      <div class="breakdown-row"><span>${k}</span><div><i style="width:${v}%"></i></div><b>${Math.round(v)}</b></div>`).join('')}</div>`;
    document.getElementById('res-details').innerHTML = detailsHTML;

    showScreen('results');
    toast(`+${xpGain} XP • ${currentGame.name}`, 3200);

    let cur = 0;
    const step = score / 40;
    const interval = setInterval(() => {
      cur = Math.min(score, cur + step);
      document.getElementById('res-score').textContent = Math.round(cur);
      const offset = circumference - (cur / 100) * circumference;
      arc.style.strokeDashoffset = offset;
      arc.style.stroke = cur >= 80 ? '#10b981' : cur >= 60 ? '#3b82f6' : cur >= 40 ? '#f59e0b' : '#ef4444';
      if (cur >= score) clearInterval(interval);
    }, prefs.reducedMotion ? 1 : 35);
  }

  function showAnalytics() {
    showScreen('analytics');
    const analytics = getAnalytics();
    const cats = Storage.getCategoryScores(currentLevel);
    const xp = Storage.getXP();
    const streak = Storage.getStreak();
    const total = analytics.length;
    const avgScore = total ? Math.round(analytics.reduce((a, b) => a + b.score, 0) / total) : 0;
    const recent = [...analytics].reverse().slice(0, 15);
    const gamePlays = {};
    analytics.forEach(e => { gamePlays[e.gameId] = (gamePlays[e.gameId] || 0) + 1; });
    const favGame = Object.entries(gamePlays).sort((a, b) => b[1] - a[1])[0];
    const favName = favGame ? (activeGames().find(g => g.id === favGame[0])?.name || favGame[0]) : '—';

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
        <h3>Category Legend</h3>
        <div class="category-legend">
          ${Object.keys(CAT_LABELS).map(k => `<span><i style="background:${CAT_COLORS[k]}"></i>${CAT_LABELS[k]}</span>`).join('')}
        </div>
      </div>
      <div class="analytics-section">
        <h3>Category Performance</h3>
        <div class="cat-progress">
          ${Object.entries(cats).map(([k, v]) => `
            <div>
              <div class="cat-prog-row"><span>${CAT_LABELS[k]}</span><span>${v}%</span></div>
              <div class="cat-prog-bar"><div class="cat-prog-fill" style="width:${v}%;background:${CAT_COLORS[k]}"></div></div>
            </div>`).join('')}
        </div>
      </div>
      <div class="analytics-section">
        <h3>Recent Sessions</h3>
        <div class="history-list">
          ${recent.length ? recent.map(e => {
            const game = activeGames().find(g => g.id === e.gameId);
            const date = new Date(e.date);
            const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            return `<div class="history-item">
              <span>${game ? game.icon : '🎮'}</span>
              <span class="hi-name">${game ? escapeHTML(game.name) : escapeHTML(e.gameId)}</span>
              <span class="hi-score">${e.score}</span>
              <span class="hi-date">${dateStr}</span>
            </div>`;
          }).join('') : '<p class="empty-copy">No sessions yet. Play some games!</p>'}
        </div>
      </div>
      <div class="analytics-section">
        <h3>Favourite Game</h3>
        <div class="stat-box wide-stat">
          <div class="val small-val">${escapeHTML(favName)}</div>
          <div class="lbl">${favGame ? favGame[1] + ' sessions' : 'Play to see'}</div>
        </div>
      </div>`;
  }

  function showProfile() {
    showScreen('profile');
    const xp = Storage.getXP();
    const level = Storage.getLevel(xp);
    const streak = Storage.getStreak();
    const analytics = getAnalytics();
    const levels = ['Beginner', 'Explorer', 'Thinker', 'Analyst', 'Genius', 'Master Mind'];
    const thresholds = [0, 100, 300, 600, 1000, 1500];
    const idx = levels.indexOf(level.name);
    const prevXP = thresholds[Math.max(0, idx)];
    const progress = Math.max(0, Math.min(100, Math.round(((xp - prevXP) / (level.next - prevXP)) * 100)));

    const achievements = [
      { name: 'First Steps', icon: '👣', desc: 'Play your first game', unlocked: analytics.length >= 1 },
      { name: 'Daily Five', icon: '🎯', desc: 'Complete today’s goal', unlocked: sessionsToday() >= DAILY_GOAL },
      { name: 'Speed Demon', icon: '⚡', desc: 'Score 80+ in speed', unlocked: analytics.some(e => e.score >= 80 && e.category === 'speed') },
      { name: 'Memory King', icon: '🧠', desc: 'Score 90+ in memory', unlocked: analytics.some(e => e.score >= 90 && e.category === 'memory') },
      { name: 'Logic Lord', icon: '🔮', desc: 'Score 85+ in logic', unlocked: analytics.some(e => e.score >= 85 && e.category === 'logic') },
      { name: 'On Fire', icon: '🔥', desc: '3-day streak', unlocked: streak.count >= 3 },
      { name: 'Dedicated', icon: '📅', desc: '7-day streak', unlocked: streak.count >= 7 },
      { name: 'Century', icon: '💯', desc: 'Score 100 once', unlocked: analytics.some(e => e.score >= 100) },
      { name: 'Explorer', icon: '🗺', desc: 'Try 10 games', unlocked: new Set(analytics.map(e => e.gameId)).size >= 10 },
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
        <div class="profile-prefs">
          <button class="btn-ghost small-btn" onclick="App.toggleTheme()">Theme: ${prefs.theme}</button>
          <button class="btn-ghost small-btn" onclick="App.toggleContrast()">Contrast: ${prefs.contrast ? 'High' : 'Normal'}</button>
          <button class="btn-ghost small-btn" onclick="App.toggleMotion()">Motion: ${prefs.reducedMotion ? 'Reduced' : 'Full'}</button>
        </div>
        <div class="profile-streak">Streak: 🔥 ${streak.count} days</div>
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
      <div class="reset-row">
        <button class="btn-ghost" onclick="if(confirm('Reset all progress?'))Storage.reset()||location.reload()">Reset Progress</button>
      </div>`;
  }

  function toast(msg, dur = 2500) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), dur);
  }

  function toggleTheme() {
    prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
    savePrefs();
    applyPrefs();
    toast(`Theme: ${prefs.theme}`);
    if (document.getElementById('screen-profile')?.classList.contains('active')) showProfile();
  }

  function toggleContrast() {
    prefs.contrast = !prefs.contrast;
    savePrefs();
    applyPrefs();
    toast(`Contrast: ${prefs.contrast ? 'high' : 'normal'}`);
    if (document.getElementById('screen-profile')?.classList.contains('active')) showProfile();
  }

  function toggleMotion() {
    prefs.reducedMotion = !prefs.reducedMotion;
    savePrefs();
    applyPrefs();
    toast(`Motion: ${prefs.reducedMotion ? 'reduced' : 'full'}`);
    if (document.getElementById('screen-profile')?.classList.contains('active')) showProfile();
  }

  function init() {
    applyPrefs();
    showDashboard();
    Storage.updateStreak();
    updateHeaderStats();
    if (Storage.getAnalytics().length === 0) {
      setTimeout(() => toast('🧠 Welcome to IQ Lab! Pick any challenge to start training.', 4000), 800);
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    showDashboard,
    launchGame,
    exitGame,
    replayGame,
    showAnalytics,
    showProfile,
    toast,
    toggleTheme,
    toggleContrast,
    toggleMotion,
    continueLastGame,
    setIQLevel,
    setCategory,
    clearFilters
  };
})();
