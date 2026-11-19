// Export progress to a JSON file and import it back (merge or replace). Matching is by official name,
// using the same loose comparison as the official list (case, curly quotes, dashes, ellipsis, spaces).

export const EXPORT_FORMAT = 'leonida-trophy-log/progress-v1';

export function normalizeName(name) {
  return String(name)
    .toLowerCase()
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u2033]/g, '"')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildExport(trophies, earned, now = new Date()) {
  const list = trophies.filter((t) => earned[t.name]).map((t) => ({ id: t.id, name: t.name, grade: t.grade, earned: earned[t.name] }));
  return {
    format: EXPORT_FORMAT,
    game: 'Grand Theft Auto VI (PS5)',
    exported: now.toISOString(),
    count: list.length,
    of: trophies.length,
    earned: list,
  };
}

export function downloadExport(trophies, earned) {
  const payload = buildExport(trophies, earned);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gta6-trophy-progress-${payload.exported.slice(0, 10)}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload;
}

// Accepts this app's export, a plain array of names, or { earned: [names] }.
export function parseImport(text, trophies) {
  let doc;
  try { doc = JSON.parse(text); } catch { throw new Error('That file is not valid JSON.'); }
  const rows = Array.isArray(doc) ? doc : Array.isArray(doc?.earned) ? doc.earned : null;
  if (!rows) throw new Error('No "earned" list found in that file.');
  const index = new Map(trophies.map((t) => [normalizeName(t.name), t]));
  const earned = {};
  const unknown = [];
  for (const row of rows) {
    const name = typeof row === 'string' ? row : row?.name;
    const hit = name ? index.get(normalizeName(name)) : undefined;
    if (hit) earned[hit.name] = (typeof row === 'object' && row.earned) || new Date().toISOString().slice(0, 10);
    else unknown.push(String(name));
  }
  return { earned, matched: Object.keys(earned).length, unknown };
}

export async function readFileText(file) {
  if (file.size > 2 * 1024 * 1024) throw new Error('File is larger than 2 MB.');
  return file.text();
}
