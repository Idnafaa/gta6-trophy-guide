// Roadmap to the platinum: what to do before starting, the one missable, then three stages in order,
// stage 1 split by story chapter so each trophy sits where it first becomes available.

import { h, mount } from './dom.js';
import { GRADE_LABEL, formatCount } from './data.js';
import { roadmapKey } from './filters.js';
import { isMasked } from './spoilers.js';
import { summarize } from './progress.js';

export function renderRoadmap(target, guide, state, actions) {
  const { meta, trophies } = guide;
  const road = meta.roadmap;
  const srcName = sourceNamer(meta.sources);
  const stats = summarize(trophies, state.earned);
  const missables = trophies.filter((t) => t.missable === 'potential');

  const side = h('aside', { class: 'road-side' },
    h('section', { class: 'card road-summary' },
      h('h2', {}, 'Road to platinum'),
      h('dl', { class: 'kpis' },
        kpi('Time', '~200 h'), kpi('Difficulty', '4/10'), kpi('Playthroughs', '1'), kpi('Online', '0'), kpi('Missable', `${missables.length} maybe`), kpi('Trophies', String(trophies.length))),
      h('p', { class: 'small' }, road.summary, ' ', cite(road.summarySources, srcName, true))),
    h('section', { class: 'card alert' },
      h('h3', {}, 'Missable watch'),
      missables.map((t) => h('button', { class: 'alert-row', type: 'button', onclick: () => actions.open(t) },
        h('span', { class: `tick-mini${state.earned[t.name] ? ' on' : ''}` }, state.earned[t.name] ? '✓' : ''),
        h('span', {}, h('strong', {}, t.name), h('br'), h('span', { class: 'small' }, t.missableNote)))),
      h('p', { class: 'small ok-line' }, 'Everything else stays open in free roam after the credits. ', cite(['PP', 'GZ'], srcName, true))),
    h('section', { class: 'card' },
      h('h3', {}, 'Before you start'),
      h('ol', { class: 'before' }, road.before.map((b) => h('li', {}, b.text, ' ', cite(b.src, srcName, true))))),
  );

  const stage1 = trophies.filter((t) => t.stage === 1 && t.grade !== 'platinum');
  const chapters = road.chapters.map((c) => h('section', { class: 'chapter' },
    h('h4', {}, c.title, h('span', { class: 'count' }, countDone(stage1.filter((t) => t.chapter === c.chapter), state))),
    h('p', { class: 'chapter-note' }, spoilerSafeNote(c, trophies, state)),
    h('ul', { class: 'mini-list' }, ordered(stage1.filter((t) => t.chapter === c.chapter)).map((t) => miniRow(t, state, actions)))));

  const stageCol = (n, extra = []) => {
    const s = road.stages.find((x) => x.stage === n);
    const list = ordered(trophies.filter((t) => t.stage === n));
    return h('section', { class: `stage stage-${n}` },
      stageHead(s, stats.byStage[n]),
      h('p', { class: 'stage-sum' }, s.summary, ' ', cite(s.src, srcName, true)),
      n === 1 ? h('div', { class: 'chapters' }, chapters) : h('ul', { class: 'mini-list' }, list.map((t) => miniRow(t, state, actions))),
      extra);
  };

  mount(target, side, stageCol(1), stageCol(2), stageCol(3));
}

function ordered(list) {
  return [...list].sort((a, b) => roadmapKey(a) - roadmapKey(b));
}

function stageHead(s, prog) {
  const pct = prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
  return h('header', { class: 'stage-head' },
    h('span', { class: 'stage-no' }, String(s.stage)),
    h('div', {}, h('h3', {}, s.title), h('p', { class: 'small' }, `${s.hours} · ${prog.done}/${prog.total} earned`)),
    h('div', { class: 'bar' }, h('i', { style: `width:${pct}%` })));
}

function miniRow(t, state, actions) {
  const masked = isMasked(t, state);
  const earned = Boolean(state.earned[t.name]);
  const sub = t.missable === 'potential' ? h('span', { class: 'flag flag-miss' }, 'MISSABLE · do in Ch1')
    : t.confidence === 'unconfirmed' ? h('span', { class: 'mini-sub unk' }, 'trigger unconfirmed')
      : t.count && !masked ? h('span', { class: 'mini-sub' }, formatCount(t.count))
        : t.character ? h('span', { class: 'mini-sub char' }, t.character) : null;
  return h('li', { class: `mini${earned ? ' is-earned' : ''}${t.missable === 'potential' ? ' is-miss' : ''}` },
    h('button', { class: `tick-mini${earned ? ' on' : ''}`, type: 'button', 'aria-label': 'toggle earned', onclick: () => actions.toggle(t) }, earned ? '✓' : ''),
    h('span', { class: `grade-dot ${t.grade}`, title: GRADE_LABEL[t.grade] }),
    h('button', { class: 'mini-name', type: 'button', title: masked ? '' : t.name, onclick: () => actions.open(t) }, masked ? 'Story trophy (hidden)' : t.name),
    sub);
}

function countDone(list, state) {
  return `${list.filter((t) => state.earned[t.name]).length}/${list.length}`;
}

// Chapter notes name missions; while the spoiler guard is on, keep them generic.
function spoilerSafeNote(chapter, trophies, state) {
  const storyMasked = trophies.some((t) => t.kind === 'story' && t.chapter === chapter.chapter && isMasked(t, state));
  if (!storyMasked || chapter.chapter === 1) return chapter.note;
  return 'Mission names hidden (spoiler setting).';
}

function kpi(k, v) {
  return h('div', { class: 'kpi' }, h('dt', {}, k), h('dd', {}, v));
}

function sourceNamer(sources) {
  const map = new Map(sources.map((s) => [s.key, s]));
  return (key) => map.get(key);
}

function cite(keys, srcName, inline = false) {
  const items = keys.map(srcName).filter(Boolean);
  return h(inline ? 'span' : 'p', { class: 'cite' }, inline ? '' : 'Sources: ',
    items.map((s, i) => [i ? ', ' : '', h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, inline ? `[${s.key}]` : s.name)]));
}
