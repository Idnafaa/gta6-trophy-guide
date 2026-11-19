// Header HUD: overall progress, the per-grade breakdown, the spoiler badge and the view tabs.

import { h, mount } from './dom.js';
import { GRADES, GRADE_LABEL } from './data.js';
import { summarize } from './progress.js';

const TABS = [
  { id: 'checklist', label: 'Checklist' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'settings', label: 'Spoilers & backup' },
];

const SPOILER_BADGE = { story: 'Spoilers: story hidden', hidden: 'Spoilers: all hidden', off: 'Spoilers: shown' };

export function renderHud(target, trophies, state, store) {
  const s = summarize(trophies, state.earned);
  mount(target,
    h('div', { class: 'progress-block' },
      h('div', { class: 'big' }, h('strong', {}, `${s.done}`), `/${s.total} earned`, h('span', { class: 'pct' }, `${s.percent}%`),
        h('span', { class: 'pts' }, `${s.points}/${s.maxPoints} pts`),
        h('span', { class: `spoiler-badge ${state.spoilers}` }, SPOILER_BADGE[state.spoilers])),
      h('div', { class: 'bar wide' }, h('i', { style: `width:${s.percent}%` })),
      h('div', { class: 'grade-row' }, GRADES.map((g) => h('span', { class: `gchip ${g}`, title: GRADE_LABEL[g] },
        h('span', { class: `grade-dot ${g}` }), `${GRADE_LABEL[g]} ${s.byGrade[g].done}/${s.byGrade[g].total}`)))),
    h('nav', { class: 'tabs', 'aria-label': 'Views' },
      TABS.map((t) => h('button', {
        class: `tab${state.view === t.id ? ' on' : ''}`, type: 'button', 'aria-current': state.view === t.id ? 'page' : null,
        onclick: () => store.set({ view: t.id, lastView: state.view === 'settings' ? state.lastView : state.view }),
      }, t.label))),
  );
}
