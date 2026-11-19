// Filter sidebar: kind chips with counts, grade, earned status, sort and search.

import { h, mount } from './dom.js';
import { FILTER_CHIPS, countByChip } from './filters.js';
import { GRADES, GRADE_LABEL } from './data.js';

export function renderSidebar(target, trophies, state, store, search) {
  const counts = countByChip(trophies);
  mount(target,
    h('label', { class: 'search' },
      h('span', { class: 'visually-hidden' }, 'Search trophies'),
      h('input', { id: 'search', type: 'search', placeholder: 'Search name or guide…', value: search.get(), oninput: (e) => search.set(e.target.value) })),
    h('h3', { class: 'side-title' }, 'Kind'),
    h('div', { class: 'chips' }, FILTER_CHIPS.map((c) => h('button', {
      class: `chip${state.kind === c.id ? ' on' : ''}${c.id === 'missable' ? ' chip-miss' : ''}`,
      type: 'button', disabled: counts[c.id] === 0 && c.id !== 'all',
      title: c.id === 'online' ? 'GTA VI lists no online trophies (PowerPyx)' : null,
      onclick: () => store.set({ kind: c.id }),
    }, c.label, h('span', { class: 'n' }, String(counts[c.id]))))),
    h('h3', { class: 'side-title' }, 'Grade'),
    h('div', { class: 'seg' }, ['all', ...GRADES].map((g) => h('button', {
      class: `seg-b${state.grade === g ? ' on' : ''}`, type: 'button', onclick: () => store.set({ grade: g }),
    }, g === 'all' ? 'All' : GRADE_LABEL[g][0]))),
    h('h3', { class: 'side-title' }, 'Status · order'),
    h('div', { class: 'seg' }, [['all', 'All'], ['todo', 'To do'], ['earned', 'Earned']].map(([id, label]) => h('button', {
      class: `seg-b${state.status === id ? ' on' : ''}`, type: 'button', onclick: () => store.set({ status: id }),
    }, label))),
    h('select', { id: 'sort', 'aria-label': 'Order', onchange: (e) => store.set({ sort: e.target.value }) },
      [['roadmap', 'Roadmap order'], ['official', 'Official order'], ['grade', 'By grade']].map(([v, l]) => h('option', { value: v, selected: state.sort === v }, l))),
    dataCheck(trophies),
  );
}

// A computed check of the data against the official list: counts per grade, hidden, online, cited guides.
function dataCheck(trophies) {
  const by = (fn) => trophies.filter(fn).length;
  const cited = by((t) => t.sources.length > 0 && t.guide.trim());
  return h('section', { class: 'data-check' },
    h('h3', { class: 'side-title' }, 'Data check'),
    h('p', {}, h('strong', {}, `${trophies.length} official trophies`)),
    h('p', {}, `${by((t) => t.grade === 'platinum')} P · ${by((t) => t.grade === 'gold')} G · ${by((t) => t.grade === 'silver')} S · ${by((t) => t.grade === 'bronze')} B`),
    h('p', {}, `${by((t) => t.hidden)} hidden · ${by((t) => t.online)} online`),
    h('p', { class: 'ok' }, `${cited}/${trophies.length} guides cite sources`));
}
