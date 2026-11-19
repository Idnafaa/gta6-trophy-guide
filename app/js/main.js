// Entry point: load the trophy data, create the store, and re-render every panel when state changes.

import { byId, h, mount } from './dom.js';
import { loadGuide } from './data.js';
import { createStore } from './store.js';
import { applyFilters } from './filters.js';
import { renderHud } from './hud.js';
import { renderSidebar } from './sidebar.js';
import { renderChecklist } from './checklist.js';
import { renderDetail } from './detail.js';
import { renderRoadmap } from './roadmap.js';
import { renderSettings } from './settings.js';

function cell(initial, onChange) {
  let value = initial;
  return { get: () => value, set(v) { value = v; onChange?.(v); } };
}

async function boot() {
  const guide = await loadGuide();
  const store = createStore();
  const lastAction = cell('', () => render());
  const search = cell('', () => renderList());

  const actions = {
    toggle: (t) => store.toggleEarned(t.name),
    select: (t) => store.set({ selected: t.id }),
    open: (t) => store.set({ selected: t.id, view: 'checklist', kind: 'all' }),
    reveal: (t) => store.reveal(t.name),
  };

  function renderList() {
    const state = store.get();
    const list = applyFilters(guide.trophies, state, search.get());
    byId('list-count').textContent = `${list.length} shown`;
    renderChecklist(byId('list'), list, state, actions);
  }

  function render() {
    const state = store.get();
    const view = state.view;
    document.body.dataset.view = view;
    renderHud(byId('hud'), guide.trophies, state, store);
    byId('checklist-view').hidden = view === 'roadmap';
    byId('roadmap-view').hidden = view !== 'roadmap';
    byId('drawer').hidden = view !== 'settings';
    if (view === 'roadmap') {
      renderRoadmap(byId('roadmap-view'), guide, state, actions);
    } else {
      renderSidebar(byId('sidebar'), guide.trophies, state, store, search);
      renderList();
      renderDetail(byId('detail'), guide.byId.get(state.selected), state, actions);
    }
    if (view === 'settings') renderSettings(byId('drawer'), guide, store, lastAction);
  }

  store.subscribe(render);
  window.addEventListener('hashchange', () => applyHash(store));
  applyHash(store);
  render();
}

// #roadmap, #checklist or #settings opens a view directly; #t28 selects a trophy.
function applyHash(store) {
  const hash = location.hash.slice(1);
  if (['checklist', 'roadmap', 'settings'].includes(hash)) store.set({ view: hash });
  const m = /^t(\d+)$/.exec(hash);
  if (m) store.set({ view: 'checklist', selected: Number(m[1]) });
}

boot().catch((err) => {
  mount(byId('list'), h('p', { class: 'empty' }, `Could not start: ${err.message}`));
});
