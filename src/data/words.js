// Levels and words. Each word: picture (emoji) + vowelized word split into
// reading chunks with "|" (גָּ|מָל). The chunks drive the reading lesson:
// the child hears each chunk, then the chunks blended together (גָּ… גָּמָל).
// One-syllable words are split before the closing letter (דָּ|ג) so they can
// be blended too.

const w = (id, emoji, split) => ({ id, emoji, chunks: split.split('|'), word: split.replaceAll('|', '') })

export const LEVELS = [
  {
    id: 1, name: 'מַחְלֶקֶת הַבּוּעוֹת', color: '#f472b6', fall: 10,
    words: [w('dag', '🐟', 'דָּ|ג'), w('sus', '🐴', 'סוּ|ס'), w('lev', '❤️', 'לֵ|ב')],
  },
  {
    id: 2, name: 'פַּס הַחַיּוֹת', color: '#fb923c', fall: 10,
    words: [w('hatul', '🐱', 'חָ|תוּל'), w('gamal', '🐫', 'גָּ|מָל'), w('nahash', '🐍', 'נָ|חָשׁ')],
  },
  {
    id: 3, name: 'מַחְסַן הַבַּיִת', color: '#facc15', fall: 9.5,
    words: [w('bayit', '🏠', 'בַּ|יִת'), w('kelev', '🐶', 'כֶּ|לֶב'), w('mayim', '💧', 'מַ|יִם')],
  },
  {
    id: 4, name: 'גַּן הַפְּלָאוֹת', color: '#4ade80', fall: 9.5,
    words: [w('pil', '🐘', 'פִּי|ל'), w('etz', '🌳', 'עֵ|ץ'), w('yareah', '🌙', 'יָ|רֵ|חַ')],
  },
  {
    id: 5, name: 'מְכוֹנַת הַשֶּׁמֶשׁ', color: '#38bdf8', fall: 9,
    words: [w('shemesh', '☀️', 'שֶׁ|מֶשׁ'), w('tapuah', '🍎', 'תַּ|פּוּ|חַ'), w('kova', '👒', 'כּוֹ|בַע')],
  },
  {
    id: 6, name: 'מִפְעַל הַפֵּרוֹת', color: '#a78bfa', fall: 9,
    words: [w('banana', '🍌', 'בָּ|נָ|נָה'), w('sefer', '📖', 'סֵ|פֶר'), w('dov', '🐻', 'דּוֹ|ב')],
  },
  {
    id: 7, name: 'תַּחֲנַת הָאוֹר', color: '#f87171', fall: 8.5,
    words: [w('ner', '🕯️', 'נֵ|ר'), w('limon', '🍋', 'לִי|מוֹן'), w('gitara', '🎸', 'גִּי|טָ|רָה')],
  },
  {
    id: 8, name: 'מַעְבְּדַת הַכּוֹכָבִים', color: '#2dd4bf', fall: 8.5,
    words: [w('uga', '🎂', 'עוּ|גָה'), w('kochav', '⭐', 'כּוֹ|כָב'), w('yeled', '👦', 'יֶ|לֶד')],
  },
  {
    id: 9, name: 'נְמַל הַגֶּשֶׁם', color: '#60a5fa', fall: 8,
    words: [w('tut', '🍓', 'תּוּ|ת'), w('sira', '⛵', 'סִי|רָה'), w('geshem', '🌧️', 'גֶּ|שֶׁם')],
  },
  {
    id: 10, name: 'הַמִּגְדָּל הַמְּעוֹפֵף', color: '#e879f9', fall: 8,
    words: [w('matos', '✈️', 'מָ|טוֹס'), w('pizza', '🍕', 'פִּי|צָה'), w('kadur', '⚽', 'כַּ|דּוּר')],
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

// ---------- Reading lesson helpers ----------

const LETTER = /[\u05D0-\u05EA]/
const VOWEL_HELPER = { '\u05B8': 'א', '\u05B7': 'א', '\u05B6': 'ה', '\u05B5': 'ה', '\u05B4': 'י', '\u05B9': 'ו' }

/**
 * Text-to-speech reads a lone open syllable like "גָּ" as a letter name, and
 * reads a word cut mid-way oddly. Adding a silent helper letter after a final
 * open vowel ("גָּא", "יָרֵה") makes engines pronounce the sound itself.
 */
export function speakable(text) {
  const chars = [...text]
  let i = chars.length - 1
  while (i >= 0 && !LETTER.test(chars[i])) i--
  const marks = chars.slice(i + 1)
  // וֹ / וּ / bare י already sound out their vowel
  if (chars[i] === 'ו' && (marks.includes('\u05B9') || marks.includes('\u05BC'))) return text
  if (chars[i] === 'י' && marks.length === 0) return text
  const vowel = marks.find((m) => VOWEL_HELPER[m])
  return vowel ? text + VOWEL_HELPER[vowel] : text
}

/** What to say at each blending step: "גָּא", "גָּמָל" (each one longer; the last is the word). */
export const blendSteps = (word) =>
  word.chunks.map((_, i) => (i === word.chunks.length - 1 ? word.word : speakable(word.chunks.slice(0, i + 1).join(''))))

/** A chunk that is just a closing consonant (the ג of דָּ|ג) has no sound on its own. */
export const isBareConsonant = (chunk) => !/[\u05B0-\u05BB\u05C7]/.test(chunk) && [...chunk.replace(/[\u05BC\u05C1\u05C2]/g, '')].length === 1

/** What to say when the child taps one chunk on its own. */
export function chunkSay(word, i) {
  const c = word.chunks[i]
  if (isBareConsonant(c)) return blendSteps(word)[i] // say "דָּג" for the ג of דָּ|ג
  if (i === word.chunks.length - 1 && /^[חעה][ַ]$/.test(c)) return 'אַ' + c[0] // the "ach" of יָרֵחַ
  return speakable(c)
}
