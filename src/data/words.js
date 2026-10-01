// Levels and words. Each word: picture (emoji) + vowelized word.
// The child reads the falling word bubbles and catches the one that names the picture.

const w = (id, emoji, word) => ({ id, emoji, word })

export const LEVELS = [
  {
    id: 1, name: 'מַחְלֶקֶת הַבּוּעוֹת', color: '#f472b6', fall: 10,
    words: [w('dag', '🐟', 'דָּג'), w('sus', '🐴', 'סוּס'), w('lev', '❤️', 'לֵב')],
  },
  {
    id: 2, name: 'פַּס הַחַיּוֹת', color: '#fb923c', fall: 10,
    words: [w('hatul', '🐱', 'חָתוּל'), w('gamal', '🐫', 'גָּמָל'), w('nahash', '🐍', 'נָחָשׁ')],
  },
  {
    id: 3, name: 'מַחְסַן הַבַּיִת', color: '#facc15', fall: 9.5,
    words: [w('bayit', '🏠', 'בַּיִת'), w('kelev', '🐶', 'כֶּלֶב'), w('mayim', '💧', 'מַיִם')],
  },
  {
    id: 4, name: 'גַּן הַפְּלָאוֹת', color: '#4ade80', fall: 9.5,
    words: [w('pil', '🐘', 'פִּיל'), w('etz', '🌳', 'עֵץ'), w('yareah', '🌙', 'יָרֵחַ')],
  },
  {
    id: 5, name: 'מְכוֹנַת הַשֶּׁמֶשׁ', color: '#38bdf8', fall: 9,
    words: [w('shemesh', '☀️', 'שֶׁמֶשׁ'), w('tapuah', '🍎', 'תַּפּוּחַ'), w('kova', '👒', 'כּוֹבַע')],
  },
  {
    id: 6, name: 'מִפְעַל הַפֵּרוֹת', color: '#a78bfa', fall: 9,
    words: [w('banana', '🍌', 'בָּנָנָה'), w('sefer', '📖', 'סֵפֶר'), w('dov', '🐻', 'דּוֹב')],
  },
  {
    id: 7, name: 'תַּחֲנַת הָאוֹר', color: '#f87171', fall: 8.5,
    words: [w('ner', '🕯️', 'נֵר'), w('limon', '🍋', 'לִימוֹן'), w('gitara', '🎸', 'גִּיטָרָה')],
  },
  {
    id: 8, name: 'מַעְבְּדַת הַכּוֹכָבִים', color: '#2dd4bf', fall: 8.5,
    words: [w('uga', '🎂', 'עוּגָה'), w('kochav', '⭐', 'כּוֹכָב'), w('yeled', '👦', 'יֶלֶד')],
  },
  {
    id: 9, name: 'נְמַל הַגֶּשֶׁם', color: '#60a5fa', fall: 8,
    words: [w('tut', '🍓', 'תּוּת'), w('sira', '⛵', 'סִירָה'), w('geshem', '🌧️', 'גֶּשֶׁם')],
  },
  {
    id: 10, name: 'הַמִּגְדָּל הַמְּעוֹפֵף', color: '#e879f9', fall: 8,
    words: [w('matos', '✈️', 'מָטוֹס'), w('pizza', '🍕', 'פִּיצָה'), w('kadur', '⚽', 'כַּדּוּר')],
  },
]

const ALL_WORDS = LEVELS.flatMap((l) => l.words)

const MARKS = /[֑-ׇ]/g
const FINALS = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const letters = (word) => [...word.replace(MARKS, '')].map((c) => FINALS[c] ?? c)

export const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Three wrong words that look a bit like the right one (same first letter,
 * shared letters, similar length) so the child has to really read.
 */
export function distractors(word) {
  const mine = letters(word.word)
  const scored = ALL_WORDS.filter((o) => o.id !== word.id).map((o) => {
    const theirs = letters(o.word)
    const shared = theirs.filter((c) => mine.includes(c)).length
    const score =
      shared + (theirs[0] === mine[0] ? 2 : 0) - Math.abs(theirs.length - mine.length) * 0.5 + Math.random() * 1.5
    return { o, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return shuffle(scored.slice(0, 5)).slice(0, 3).map((s) => s.o)
}
