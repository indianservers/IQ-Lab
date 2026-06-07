/* ═══════════════════════════════════════
   IQ LAB — Storage (localStorage wrapper)
═══════════════════════════════════════ */
const Storage = (() => {
  const KEY = 'iqlab_v2';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { return {}; }
  }
  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch {}
  }
  function getDefault() {
    return {
      scores: {},        // gameId → {best, history:[{score,date}]}
      streak: { count: 0, lastDate: null },
      xp: 0,
      dailyIQ: {},       // 'YYYY-MM-DD' → {iq, categories}
      analytics: [],     // [{gameId, score, date, category}]
      settings: {}
    };
  }
  function get() {
    const d = load();
    return Object.assign(getDefault(), d);
  }

  return {
    getData: get,

    saveScore(gameId, score, category, level = 'juniors') {
      const d = get();
      const scoreId = gameId.includes(':') ? gameId : `${level}:${gameId}`;
      const publicGameId = gameId.includes(':') ? gameId.split(':').slice(1).join(':') : gameId;
      if (!d.scores[scoreId]) d.scores[scoreId] = { best: 0, history: [] };
      const prev = d.scores[scoreId].best;
      if (score > d.scores[scoreId].best) d.scores[scoreId].best = score;
      d.scores[scoreId].history.push({ score, level, date: new Date().toISOString() });
      if (d.scores[scoreId].history.length > 50) d.scores[scoreId].history.shift();

      // analytics entry
      d.analytics.push({ gameId: publicGameId, score, category, level, date: new Date().toISOString() });
      if (d.analytics.length > 500) d.analytics.shift();

      // XP
      const xpGain = Math.round(score / 5);
      d.xp += xpGain;

      save(d);
      return { prev, xpGain };
    },

    getBestScore(gameId, level) {
      const d = get();
      const activeLevel = level || (() => {
        try { return localStorage.getItem('iqlab_active_level') || 'juniors'; }
        catch { return 'juniors'; }
      })();
      const scoreId = gameId.includes(':') ? gameId : `${activeLevel}:${gameId}`;
      return d.scores[scoreId] ? d.scores[scoreId].best : (d.scores[gameId] ? d.scores[gameId].best : 0);
    },

    getStreak() {
      const d = get();
      return d.streak;
    },

    updateStreak() {
      const d = get();
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (d.streak.lastDate === today) return d.streak;
      if (d.streak.lastDate === yesterday) {
        d.streak.count += 1;
      } else {
        d.streak.count = 1;
      }
      d.streak.lastDate = today;
      save(d);
      return d.streak;
    },

    getXP() { return get().xp; },
    getAnalytics(level) {
      const analytics = get().analytics;
      return level ? analytics.filter(e => (e.level || 'juniors') === level) : analytics;
    },

    saveDailyIQ(iqObj) {
      const d = get();
      const today = new Date().toISOString().slice(0, 10);
      d.dailyIQ[today] = iqObj;
      save(d);
    },
    getDailyIQ(date) {
      const d = get();
      const key = date || new Date().toISOString().slice(0, 10);
      return d.dailyIQ[key] || null;
    },

    getCategoryScores(level) {
      const d = get();
      const cats = { memory: [], logic: [], speed: [], attention: [], reading: [] };
      d.analytics.forEach(e => {
        if (level && (e.level || 'juniors') !== level) return;
        if (cats[e.category]) cats[e.category].push(e.score);
      });
      const avg = arr => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0;
      return {
        memory:    avg(cats.memory),
        logic:     avg(cats.logic),
        speed:     avg(cats.speed),
        attention: avg(cats.attention),
        reading:   avg(cats.reading)
      };
    },

    getLevel(xp) {
      if (xp < 100)  return { name: 'Beginner',   icon: '🌱', next: 100 };
      if (xp < 300)  return { name: 'Explorer',   icon: '🔍', next: 300 };
      if (xp < 600)  return { name: 'Thinker',    icon: '💡', next: 600 };
      if (xp < 1000) return { name: 'Analyst',    icon: '🔬', next: 1000 };
      if (xp < 1500) return { name: 'Genius',     icon: '🧬', next: 1500 };
      return              { name: 'Master Mind', icon: '🏆', next: 2000 };
    },

    calculateIQ(catScores) {
      const { memory=0, logic=0, speed=0, attention=0, reading=0 } = catScores;
      const weighted = memory*0.25 + logic*0.25 + reading*0.20 + speed*0.15 + attention*0.15;
      return Math.round(85 + weighted * 0.6);
    },

    reset() { save({}); }
  };
})();
