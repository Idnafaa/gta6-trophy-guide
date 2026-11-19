// Progress + settings, saved in localStorage under one key. Earned trophies are kept by official name,
// so a saved or exported file still matches if the data file's ids ever change.

const STORAGE_KEY = 'leonida-trophy-log.v1';

const DEFAULTS = {
  earned: {},              // name -> ISO date it was ticked
  spoilers: 'story',       // 'story' | 'hidden' | 'off'
  revealed: [],            // names the reader chose to reveal while spoilers are on
  view: 'checklist',
  kind: 'all',
  grade: 'all',
  status: 'all',
  sort: 'roadmap',
  selected: 28,
};

function readSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function createStore() {
  let state = { ...DEFAULTS, ...readSaved() };
  const listeners = new Set();

  const persist = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage full or blocked: keep in memory */ }
  };
  const emit = () => { persist(); for (const fn of listeners) fn(state); };

  return {
    get: () => state,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    set(patch) { state = { ...state, ...patch }; emit(); },
    isEarned: (name) => Boolean(state.earned[name]),
    toggleEarned(name, today = new Date().toISOString().slice(0, 10)) {
      const earned = { ...state.earned };
      if (earned[name]) delete earned[name]; else earned[name] = today;
      state = { ...state, earned };
      emit();
    },
    replaceEarned(earned) { state = { ...state, earned: { ...earned } }; emit(); },
    reveal(name) { if (!state.revealed.includes(name)) { state = { ...state, revealed: [...state.revealed, name] }; emit(); } },
    reset() { state = { ...DEFAULTS }; emit(); },
  };
}
