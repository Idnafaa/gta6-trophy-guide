// The guide panel for the selected trophy: official name, description and grade, then the guide in our
// words, its steps, the missable verdict and the sources it was written from, linked beside it.

import { h, mount, sourceLink } from './dom.js';
import { GRADE_LABEL, MISSABLE_LABEL, STAGE_LABEL, formatCount } from './data.js';
import { isMasked, maskedTitle } from './spoilers.js';

export function renderDetail(target, trophy, state, actions) {
  if (!trophy) {
    mount(target, h('p', { class: 'empty' }, 'Pick a trophy to read its guide.'));
    return;
  }
  const masked = isMasked(trophy, state);
  const earned = Boolean(state.earned[trophy.name]);
  mount(target,
    h('header', { class: `detail-head grade-${trophy.grade}` },
      h('div', { class: `medal ${trophy.grade}`, 'aria-hidden': 'true' }, GRADE_LABEL[trophy.grade][0]),
      h('div', { class: 'detail-titles' },
        h('p', { class: 'eyebrow' }, `#${trophy.id} · ${GRADE_LABEL[trophy.grade]}${trophy.hidden ? ' · hidden on PSN' : ''}`),
        h('h2', {}, masked ? maskedTitle(trophy) : trophy.name),
        h('p', { class: 'official' }, masked ? 'Official description hidden by your spoiler setting.' : `“${trophy.description}”`)),
      h('button', { class: `earn-btn${earned ? ' on' : ''}`, type: 'button', onclick: () => actions.toggle(trophy) }, earned ? 'Earned ✓' : 'Mark earned')),
    masked ? maskedBody(trophy, actions) : guideBody(trophy),
  );
}

function maskedBody(trophy, actions) {
  return h('div', { class: 'masked-body' },
    h('p', {}, trophy.kind === 'story'
      ? `Spoiler guard is on. This story trophy unlocks by itself as you play (${STAGE_LABEL[trophy.stage]}, Chapter ${trophy.chapter}) and cannot be missed.`
      : `Spoiler guard is on. This hidden trophy belongs to ${STAGE_LABEL[trophy.stage]}; ${trophy.missable === 'no' ? 'it cannot be missed' : 'its trigger is still unconfirmed'}.`),
    h('button', { class: 'ghost', type: 'button', onclick: () => actions.reveal(trophy) }, 'Reveal this trophy'));
}

function guideBody(t) {
  const verdict = MISSABLE_LABEL[t.missable] ?? MISSABLE_LABEL.no;
  return h('div', { class: 'guide-body' },
    h('div', { class: 'facts' },
      fact('Roadmap', `${STAGE_LABEL[t.stage]}${t.chapter ? ` · from Ch${t.chapter}` : ''}`),
      fact('Missable', verdict, `miss-${t.missable}`),
      t.count ? fact('Target', formatCount(t.count)) : null,
      t.character ? fact('Who', t.character) : null),
    t.missableNote ? h('p', { class: 'warn' }, h('strong', {}, 'Missable: '), t.missableNote) : null,
    h('h3', {}, 'Guide'),
    h('p', { class: 'guide-text' }, t.guide),
    t.steps.length ? h('ol', { class: 'steps' }, t.steps.map((s) => h('li', {}, s))) : null,
    h('div', { class: 'sources' },
      h('h3', {}, `Sources (${t.sources.length})`),
      h('ul', {}, t.sources.map((s) => h('li', {}, sourceLink(s))))),
  );
}

function fact(label, value, cls = '') {
  return h('div', { class: `fact ${cls}` }, h('span', { class: 'fact-k' }, label), h('span', { class: 'fact-v' }, value));
}
