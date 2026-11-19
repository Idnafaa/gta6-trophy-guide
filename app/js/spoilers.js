// Spoiler setting: 'story' hides the names and descriptions of the 12 story trophies until earned,
// 'hidden' also hides every trophy PlayStation keeps hidden (28), 'off' shows everything.

export const SPOILER_MODES = [
  { id: 'story', label: 'Hide story trophies', hint: 'Names, descriptions and mission names of the 12 story trophies stay masked until you earn them.' },
  { id: 'hidden', label: 'Hide all 28 hidden trophies', hint: 'Masks every trophy PlayStation hides until earned, side quests included.' },
  { id: 'off', label: 'Show everything', hint: 'No masking.' },
];

export function isMasked(trophy, state) {
  if (state.earned[trophy.name] || state.revealed.includes(trophy.name)) return false;
  if (state.spoilers === 'story') return trophy.kind === 'story';
  if (state.spoilers === 'hidden') return Boolean(trophy.hidden);
  return false;
}

export function maskedTitle(trophy) {
  return trophy.kind === 'story'
    ? `Story trophy · Chapter ${trophy.chapter ?? '?'}`
    : 'Hidden trophy';
}

export const MASKED_DESCRIPTION = 'Hidden until earned (spoiler setting).';
