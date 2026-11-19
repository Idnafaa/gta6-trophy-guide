// The checklist column: one row per trophy with its tick box, grade, official name and description,
// and its flags (missable, stage, count, character lock). Masked rows follow the spoiler setting.

import { h, mount } from './dom.js';
import { GRADE_LABEL, formatCount } from './data.js';
import { isMasked, maskedTitle, MASKED_DESCRIPTION } from './spoilers.js';

export function renderChecklist(target, list, state, actions) {
  if (!list.length) {
    mount(target, h('p', { class: 'empty' }, 'No trophy matches these filters.'));
    return;
  }
  mount(target, list.map((t) => trophyRow(t, state, actions)));
}

function trophyRow(t, state, actions) {
  const earned = Boolean(state.earned[t.name]);
  const masked = isMasked(t, state);
  const selected = state.selected === t.id;
  return h('li', {
    class: `row grade-${t.grade}${earned ? ' is-earned' : ''}${selected ? ' is-selected' : ''}${masked ? ' is-masked' : ''}`,
    dataset: { id: t.id },
  },
    h('button', {
      class: 'tick', type: 'button', role: 'checkbox', 'aria-checked': String(earned),
      'aria-label': `Mark ${masked ? 'this trophy' : t.name} as earned`,
      onclick: (e) => { e.stopPropagation(); actions.toggle(t); },
    }, earned ? '✓' : ''),
    h('button', { class: 'row-main', type: 'button', onclick: () => actions.select(t) },
      h('span', { class: 'row-title' },
        h('span', { class: `grade-dot ${t.grade}`, title: GRADE_LABEL[t.grade] }),
        h('span', { class: 'name' }, masked ? maskedTitle(t) : t.name)),
      h('span', { class: 'desc' }, masked ? MASKED_DESCRIPTION : t.description),
      h('span', { class: 'flags' }, rowFlags(t, masked))),
  );
}

export function rowFlags(t, masked = false) {
  const flags = [];
  if (t.missable === 'potential') flags.push(h('span', { class: 'flag flag-miss' }, 'MISSABLE · Ch1'));
  if (t.confidence === 'unconfirmed') flags.push(h('span', { class: 'flag flag-unk' }, 'unconfirmed'));
  flags.push(h('span', { class: 'flag flag-stage' }, `S${t.stage}${t.chapter ? ` · Ch${t.chapter}` : ''}`));
  if (t.count && !masked) flags.push(h('span', { class: 'flag flag-count' }, formatCount(t.count)));
  if (t.character) flags.push(h('span', { class: 'flag flag-char' }, t.character));
  if (t.hidden) flags.push(h('span', { class: 'flag flag-hidden' }, 'hidden'));
  return flags;
}
