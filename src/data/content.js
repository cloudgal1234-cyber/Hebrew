// Learning content: vocalized Hebrew letters and words.
// Every item has a stable `id`, which is what gets saved in card mappings.

export const LETTERS = [
  { id: 'alef', char: 'א', base: 'א', name: 'אָלֶף', word: 'אַרְיֵה', emoji: '🦁', color: '#f97316' },
  { id: 'bet', char: 'ב', base: 'בּ', name: 'בֵּית', word: 'בַּיִת', emoji: '🏠', color: '#ef4444' },
  { id: 'gimel', char: 'ג', base: 'ג', name: 'גִּימֶל', word: 'גָּמָל', emoji: '🐫', color: '#eab308' },
  { id: 'dalet', char: 'ד', base: 'ד', name: 'דָּלֶת', word: 'דָּג', emoji: '🐟', color: '#0ea5e9' },
  { id: 'he', char: 'ה', base: 'ה', name: 'הֵא', word: 'הַר', emoji: '⛰️', color: '#22c55e' },
  { id: 'vav', char: 'ו', base: 'ו', name: 'וָו', word: 'וֶרֶד', emoji: '🌹', color: '#ec4899' },
  { id: 'zayin', char: 'ז', base: 'ז', name: 'זַיִן', word: 'זֶבְּרָה', emoji: '🦓', color: '#64748b' },
  { id: 'het', char: 'ח', base: 'ח', name: 'חֵית', word: 'חָתוּל', emoji: '🐱', color: '#a855f7' },
  { id: 'tet', char: 'ט', base: 'ט', name: 'טֵית', word: 'טִיל', emoji: '🚀', color: '#6366f1' },
  { id: 'yod', char: 'י', base: 'י', name: 'יוֹד', word: 'יָם', emoji: '🌊', color: '#06b6d4' },
  { id: 'kaf', char: 'כ', base: 'כּ', name: 'כַּף', word: 'כֶּלֶב', emoji: '🐶', color: '#d97706' },
  { id: 'lamed', char: 'ל', base: 'ל', name: 'לָמֶד', word: 'לֵב', emoji: '❤️', color: '#e11d48' },
  { id: 'mem', char: 'מ', base: 'מ', name: 'מֵם', word: 'מַיִם', emoji: '💧', color: '#3b82f6' },
  { id: 'nun', char: 'נ', base: 'נ', name: 'נוּן', word: 'נָחָשׁ', emoji: '🐍', color: '#16a34a' },
  { id: 'samekh', char: 'ס', base: 'ס', name: 'סָמֶךְ', word: 'סוּס', emoji: '🐴', color: '#92400e' },
  { id: 'ayin', char: 'ע', base: 'ע', name: 'עַיִן', word: 'עֵץ', emoji: '🌳', color: '#15803d' },
  { id: 'pe', char: 'פ', base: 'פּ', name: 'פֵּא', word: 'פִּיל', emoji: '🐘', color: '#7c3aed' },
  { id: 'tsadi', char: 'צ', base: 'צ', name: 'צָדִי', word: 'צָב', emoji: '🐢', color: '#059669' },
  { id: 'qof', char: 'ק', base: 'ק', name: 'קוֹף', word: 'קוֹף', emoji: '🐒', color: '#b45309' },
  { id: 'resh', char: 'ר', base: 'ר', name: 'רֵישׁ', word: 'רַכֶּבֶת', emoji: '🚂', color: '#dc2626' },
  { id: 'shin', char: 'ש', base: 'שׁ', name: 'שִׁין', word: 'שֶׁמֶשׁ', emoji: '☀️', color: '#f59e0b' },
  { id: 'tav', char: 'ת', base: 'תּ', name: 'תָּו', word: 'תַּפּוּחַ', emoji: '🍎', color: '#be123c' },
]

// The five basic vowel sounds, applied to a letter's `base` form to build syllables.
export const VOWELS = [
  { id: 'a', mark: 'ָ', name: 'קָמָץ' },
  { id: 'i', mark: 'ִ', name: 'חִירִיק' },
  { id: 'o', mark: 'ֹ', name: 'חוֹלָם' },
  { id: 'u', mark: 'ֻ', name: 'קֻבּוּץ' },
  { id: 'e', mark: 'ֶ', name: 'סֶגּוֹל' },
]

export const syllable = (letter, vowel) => letter.base + vowel.mark

export const WORDS = [
  { id: 'aba', text: 'אַבָּא', emoji: '👨', en: 'dad' },
  { id: 'ima', text: 'אִמָּא', emoji: '👩', en: 'mom' },
  { id: 'bayit', text: 'בַּיִת', emoji: '🏠', en: 'house' },
  { id: 'kelev', text: 'כֶּלֶב', emoji: '🐶', en: 'dog' },
  { id: 'hatul', text: 'חָתוּל', emoji: '🐱', en: 'cat' },
  { id: 'shemesh', text: 'שֶׁמֶשׁ', emoji: '☀️', en: 'sun' },
  { id: 'yam', text: 'יָם', emoji: '🌊', en: 'sea' },
  { id: 'dag', text: 'דָּג', emoji: '🐟', en: 'fish' },
  { id: 'pil', text: 'פִּיל', emoji: '🐘', en: 'elephant' },
  { id: 'sus', text: 'סוּס', emoji: '🐴', en: 'horse' },
  { id: 'ets', text: 'עֵץ', emoji: '🌳', en: 'tree' },
  { id: 'perah', text: 'פֶּרַח', emoji: '🌸', en: 'flower' },
  { id: 'tapuah', text: 'תַּפּוּחַ', emoji: '🍎', en: 'apple' },
  { id: 'banana', text: 'בָּנָנָה', emoji: '🍌', en: 'banana' },
  { id: 'kadur', text: 'כַּדּוּר', emoji: '⚽', en: 'ball' },
  { id: 'sefer', text: 'סֵפֶר', emoji: '📖', en: 'book' },
  { id: 'yeled', text: 'יֶלֶד', emoji: '👦', en: 'boy' },
  { id: 'lev', text: 'לֵב', emoji: '❤️', en: 'heart' },
  { id: 'arye', text: 'אַרְיֵה', emoji: '🦁', en: 'lion' },
  { id: 'gamal', text: 'גָּמָל', emoji: '🐫', en: 'camel' },
  { id: 'mayim', text: 'מַיִם', emoji: '💧', en: 'water' },
  { id: 'tsav', text: 'צָב', emoji: '🐢', en: 'turtle' },
  { id: 'kof', text: 'קוֹף', emoji: '🐒', en: 'monkey' },
  { id: 'har', text: 'הַר', emoji: '⛰️', en: 'mountain' },
  { id: 'uga', text: 'עוּגָה', emoji: '🎂', en: 'cake' },
  { id: 'halav', text: 'חָלָב', emoji: '🥛', en: 'milk' },
  { id: 'glida', text: 'גְּלִידָה', emoji: '🍦', en: 'ice cream' },
  { id: 'rakevet', text: 'רַכֶּבֶת', emoji: '🚂', en: 'train' },
]

export const getLetter = (id) => LETTERS.find((l) => l.id === id)
export const getWord = (id) => WORDS.find((w) => w.id === id)

/** Resolve a saved mapping `{ type, id }` into a displayable item. */
export function resolveItem(mapping) {
  if (!mapping) return null
  const item = mapping.type === 'letter' ? getLetter(mapping.id) : getWord(mapping.id)
  return item ? { type: mapping.type, item } : null
}

export const itemLabel = ({ type, item }) => (type === 'letter' ? item.char : item.text)
export const itemEmoji = ({ type, item }) => item.emoji

// Hebrew combining marks (cantillation + niqqud + dots), U+0591–U+05C7.
const COMBINING = /[֑-ׇ]/

/**
 * Split vocalized Hebrew into graphemes: each base letter together with its
 * niqqud. e.g. 'כֶּלֶב' -> ['כֶּ', 'לֶ', 'ב']. Vav used as a vowel (וֹ / וּ)
 * stays its own tile, which is how children learn to see it.
 */
export function splitGraphemes(text) {
  const out = []
  for (const ch of text) {
    if (COMBINING.test(ch) && out.length) out[out.length - 1] += ch
    else out.push(ch)
  }
  return out
}

/** Remove niqqud, leaving bare letters. */
export const stripNiqqud = (text) => text.replace(/[֑-ׇ]/g, '')
