// Loads app/data/trophies.json (same origin, relative path) and checks it is the full official list.

export const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
export const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

export const KINDS = [
  { id: 'story', label: 'Story' },
  { id: 'side', label: 'Side quests' },
  { id: 'activity', label: 'Activities' },
  { id: 'collectible', label: 'Collectibles' },
  { id: 'crime', label: 'Crime' },
  { id: 'world', label: 'World & misc' },
  { id: 'completion', label: 'Completion' },
];

export const STAGE_LABEL = { 1: 'Stage 1 · Story', 2: 'Stage 2 · 100%', 3: 'Stage 3 · Cleanup' };

export const MISSABLE_LABEL = {
  potential: 'Potentially missable',
  no: 'Not missable',
  unknown: 'Trigger unconfirmed',
};

export async function loadGuide(url = './data/trophies.json') {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`could not read ${url}: ${response.status}`);
  const doc = await response.json();
  return normalizeGuide(doc);
}

export function normalizeGuide(doc) {
  const trophies = Array.isArray(doc) ? doc : doc.trophies;
  if (!Array.isArray(trophies) || trophies.length !== 55) throw new Error('trophies.json must list the 55 official trophies');
  for (const t of trophies) {
    if (!t.name || !t.guide || !GRADES.includes(t.grade)) throw new Error(`bad trophy entry: ${t.name ?? '?'}`);
    t.sources = Array.isArray(t.sources) ? t.sources : [];
    t.steps = Array.isArray(t.steps) ? t.steps : [];
  }
  return { meta: doc, trophies, byId: new Map(trophies.map((t) => [t.id, t])) };
}

export function formatCount(count) {
  if (!count) return '';
  const n = (v) => (v >= 10000 ? `$${v.toLocaleString('en-US')}` : String(v));
  if (count.label.startsWith('$')) return `${n(count.target)} ${count.label.slice(2)}`;
  return count.total ? `${count.target} of ${count.total} ${count.label}` : `${count.target} ${count.label}`;
}
