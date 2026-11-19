// Checklist filters: kind chips (story, side, activities, collectibles, crime, world, missable, online),
// grade, earned status and a text search; plus the roadmap sort order.

import { KINDS } from './data.js';
import { isMasked } from './spoilers.js';

export const FILTER_CHIPS = [
  { id: 'all', label: 'All' },
  ...KINDS,
  { id: 'missable', label: 'Missable' },
  { id: 'online', label: 'Online' },
];

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === 'potential';
  if (kind === 'online') return trophy.online === true;
  return trophy.kind === kind;
}

export function applyFilters(trophies, state, search = '') {
  const needle = search.trim().toLowerCase();
  const list = trophies.filter((t) => {
    if (!matchesKind(t, state.kind)) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    const earned = Boolean(state.earned[t.name]);
    if (state.status === 'todo' && earned) return false;
    if (state.status === 'earned' && !earned) return false;
    if (needle) {
      const text = isMasked(t, state) ? '' : `${t.name} ${t.description} ${t.guide}`;
      if (!text.toLowerCase().includes(needle)) return false;
    }
    return true;
  });
  return sortTrophies(list, state.sort);
}

export function sortTrophies(list, sort) {
  const copy = [...list];
  if (sort === 'official') return copy.sort((a, b) => a.id - b.id);
  if (sort === 'grade') return copy.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
  // roadmap: stage, then chapter, then official order; the platinum last
  return copy.sort((a, b) => roadmapKey(a) - roadmapKey(b));
}

export function roadmapKey(t) {
  if (t.grade === 'platinum') return 99999;
  return t.stage * 1000 + (t.chapter ?? 9) * 100 + t.id;
}

export function countByChip(trophies) {
  const counts = {};
  for (const chip of FILTER_CHIPS) counts[chip.id] = trophies.filter((t) => matchesKind(t, chip.id)).length;
  return counts;
}
