// Settings drawer: the spoiler setting, export/import of progress to a file, reset, and the source list.

import { h, mount, toast } from './dom.js';
import { SPOILER_MODES } from './spoilers.js';
import { downloadExport, parseImport, readFileText } from './transfer.js';

export function renderSettings(target, guide, store, lastAction) {
  const state = store.get();
  const done = Object.keys(state.earned).length;
  mount(target,
    h('header', { class: 'drawer-head' },
      h('h2', {}, 'Settings & backup'),
      h('button', { class: 'ghost close', type: 'button', 'aria-label': 'Close settings', onclick: () => store.set({ view: state.lastView ?? 'checklist' }) }, 'Close')),
    h('section', { class: 'card' },
      h('h3', {}, 'Spoilers'),
      h('div', { class: 'radios', role: 'radiogroup' }, SPOILER_MODES.map((m) => h('label', { class: `radio${state.spoilers === m.id ? ' on' : ''}` },
        h('input', { type: 'radio', name: 'spoilers', value: m.id, checked: state.spoilers === m.id, onchange: () => store.set({ spoilers: m.id, revealed: [] }) }),
        h('span', {}, h('strong', {}, m.label), h('br'), h('span', { class: 'small' }, m.hint)))))),
    h('section', { class: 'card' },
      h('h3', {}, 'Progress file'),
      h('p', { class: 'small' }, `${done} of ${guide.trophies.length} earned, saved in this browser (localStorage). Export a .json backup or move it to another browser.`),
      h('div', { class: 'btn-row' },
        h('button', { class: 'primary', type: 'button', id: 'export-btn', onclick: () => {
          const payload = downloadExport(guide.trophies, state.earned);
          lastAction.set(`Exported ${payload.count} trophies to gta6-trophy-progress-${payload.exported.slice(0, 10)}.json`);
          toast(lastAction.get());
        } }, 'Export progress'),
        h('label', { class: 'button' }, 'Import file…',
          h('input', { type: 'file', id: 'import-file', accept: 'application/json,.json', class: 'visually-hidden', onchange: (e) => onImport(e, guide, store, lastAction) }))),
      h('label', { class: 'check' },
        h('input', { type: 'checkbox', id: 'import-merge', checked: state.importMerge !== false, onchange: (e) => store.set({ importMerge: e.target.checked }) }),
        ' Merge with current progress (untick to replace)'),
      lastAction.get() ? h('p', { class: 'status-line', id: 'io-status' }, lastAction.get()) : null),
    h('section', { class: 'card' },
      h('h3', {}, 'Guide sources'),
      h('ul', { class: 'source-list' }, guide.meta.sources.map((s) => h('li', {}, h('span', { class: 'key' }, s.key), ' ', h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.name)))),
      h('p', { class: 'small' }, `Guides are written for this app in its own words and checked ${guide.meta.checked}. Official names, descriptions and grades are shown as PlayStation publishes them. Links open only when you click them; the app itself loads nothing from the network.`)),
    h('section', { class: 'card danger' },
      h('button', { class: 'ghost', type: 'button', onclick: () => { if (confirm('Clear all saved progress?')) { store.replaceEarned({}); lastAction.set('Progress cleared.'); } } }, 'Reset progress')),
  );
}

async function onImport(event, guide, store, lastAction) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const result = parseImport(await readFileText(file), guide.trophies);
    const merge = store.get().importMerge !== false;
    store.replaceEarned(merge ? { ...store.get().earned, ...result.earned } : result.earned);
    const extra = result.unknown.length ? `, ${result.unknown.length} unknown name(s) skipped` : '';
    lastAction.set(`Imported ${result.matched} trophies from ${file.name}${merge ? ' (merged)' : ' (replaced)'}${extra}.`);
    toast(lastAction.get());
  } catch (err) {
    lastAction.set(`Import failed: ${err.message}`);
    toast(lastAction.get(), 'bad');
  } finally {
    event.target.value = '';
  }
}
