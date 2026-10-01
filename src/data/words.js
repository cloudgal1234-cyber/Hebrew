// Words, levels and phonics helpers.
//
// Every word is split into reading chunks (`parts`). One chunk – the
// consonant+vowel sound at `miss` – is left empty on the conveyor belt and
// has to be caught from the falling bubbles.
//   c: the consonant as written in the missing chunk (with dagesh / shin dot)
//   v: the vowel sound of the chunk: a | e | i | o | u

const w = (id, emoji, word, parts, miss, c, v) => ({ id, emoji, word, parts, miss, c, v })

export const LEVELS = [
  {
    id: 1, name: 'מַחְלֶקֶת הַבּוּעוֹת', color: '#f472b6', trace: 'ד', fall: 9,
    words: [
      w('dag', '🐟', 'דָּג', ['דָּ', 'ג'], 0, 'דּ', 'a'),
      w('sus', '🐴', 'סוּס', ['סוּ', 'ס'], 0, 'ס', 'u'),
      w('lev', '❤️', 'לֵב', ['לֵ', 'ב'], 0, 'ל', 'e'),
    ],
  },
  {
    id: 2, name: 'פַּס הַחַיּוֹת', color: '#fb923c', trace: 'ת', fall: 9,
    words: [
      w('hatul', '🐱', 'חָתוּל', ['חָ', 'תוּ', 'ל'], 1, 'ת', 'u'),
      w('gamal', '🐫', 'גָּמָל', ['גָּ', 'מָ', 'ל'], 0, 'גּ', 'a'),
      w('nahash', '🐍', 'נָחָשׁ', ['נָ', 'חָ', 'שׁ'], 0, 'נ', 'a'),
    ],
  },
  {
    id: 3, name: 'מַחְסַן הַבַּיִת', color: '#facc15', trace: 'ב', fall: 8.5,
    words: [
      w('bayit', '🏠', 'בַּיִת', ['בַּ', 'יִ', 'ת'], 0, 'בּ', 'a'),
      w('kelev', '🐶', 'כֶּלֶב', ['כֶּ', 'לֶ', 'ב'], 0, 'כּ', 'e'),
      w('mayim', '💧', 'מַיִם', ['מַ', 'יִ', 'ם'], 0, 'מ', 'a'),
    ],
  },
  {
    id: 4, name: 'גַּן הַפְּלָאוֹת', color: '#4ade80', trace: 'פ', fall: 8.5,
    words: [
      w('pil', '🐘', 'פִּיל', ['פִּי', 'ל'], 0, 'פּ', 'i'),
      w('etz', '🌳', 'עֵץ', ['עֵ', 'ץ'], 0, 'ע', 'e'),
      w('yareah', '🌙', 'יָרֵחַ', ['יָ', 'רֵ', 'חַ'], 1, 'ר', 'e'),
    ],
  },
  {
    id: 5, name: 'מְכוֹנַת הַשֶּׁמֶשׁ', color: '#38bdf8', trace: 'מ', fall: 8,
    words: [
      w('shemesh', '☀️', 'שֶׁמֶשׁ', ['שֶׁ', 'מֶ', 'שׁ'], 1, 'מ', 'e'),
      w('tapuah', '🍎', 'תַּפּוּחַ', ['תַּ', 'פּוּ', 'חַ'], 1, 'פּ', 'u'),
      w('kova', '👒', 'כּוֹבַע', ['כּוֹ', 'בַ', 'ע'], 0, 'כּ', 'o'),
    ],
  },
  {
    id: 6, name: 'מִפְעַל הַפֵּרוֹת', color: '#a78bfa', trace: 'ס', fall: 8,
    words: [
      w('banana', '🍌', 'בָּנָנָה', ['בָּ', 'נָ', 'נָ', 'ה'], 0, 'בּ', 'a'),
      w('sefer', '📖', 'סֵפֶר', ['סֵ', 'פֶ', 'ר'], 0, 'ס', 'e'),
      w('dov', '🐻', 'דּוֹב', ['דּוֹ', 'ב'], 0, 'דּ', 'o'),
    ],
  },
  {
    id: 7, name: 'תַּחֲנַת הָאוֹר', color: '#f87171', trace: 'נ', fall: 7.5,
    words: [
      w('ner', '🕯️', 'נֵר', ['נֵ', 'ר'], 0, 'נ', 'e'),
      w('limon', '🍋', 'לִימוֹן', ['לִי', 'מוֹ', 'ן'], 1, 'מ', 'o'),
      w('gitara', '🎸', 'גִּיטָרָה', ['גִּי', 'טָ', 'רָ', 'ה'], 0, 'גּ', 'i'),
    ],
  },
  {
    id: 8, name: 'מַעְבְּדַת הַכּוֹכָבִים', color: '#2dd4bf', trace: 'כ', fall: 7.5,
    words: [
      w('uga', '🎂', 'עוּגָה', ['עוּ', 'גָ', 'ה'], 1, 'ג', 'a'),
      w('kochav', '⭐', 'כּוֹכָב', ['כּוֹ', 'כָ', 'ב'], 0, 'כּ', 'o'),
      w('yeled', '👦', 'יֶלֶד', ['יֶ', 'לֶ', 'ד'], 0, 'י', 'e'),
    ],
  },
  {
    id: 9, name: 'נְמַל הַגֶּשֶׁם', color: '#60a5fa', trace: 'ג', fall: 7,
    words: [
      w('tut', '🍓', 'תּוּת', ['תּוּ', 'ת'], 0, 'תּ', 'u'),
      w('sira', '⛵', 'סִירָה', ['סִי', 'רָ', 'ה'], 1, 'ר', 'a'),
      w('geshem', '🌧️', 'גֶּשֶׁם', ['גֶּ', 'שֶׁ', 'ם'], 0, 'גּ', 'e'),
    ],
  },
  {
    id: 10, name: 'הַמִּגְדָּל הַמְּעוֹפֵף', color: '#e879f9', trace: 'ר', fall: 7,
    words: [
      w('matos', '✈️', 'מָטוֹס', ['מָ', 'טוֹ', 'ס'], 1, 'ט', 'o'),
      w('pizza', '🍕', 'פִּיצָה', ['פִּי', 'צָ', 'ה'], 1, 'צ', 'a'),
      w('kadur', '⚽', 'כַּדּוּר', ['כַּ', 'דּוּ', 'ר'], 1, 'דּ', 'u'),
    ],
  },
]

// ---------- Phonics ----------

const MARKS = /[֑-ׇ]/g
const DAGESH = 'ּ'

/** The sound a written consonant makes (so ת and ט count as the same sound). */
export function consonantSound(c) {
  const base = c.replace(MARKS, '')
  const dagesh = c.includes(DAGESH)
  switch (base) {
    case 'ב': return dagesh ? 'b' : 'v'
    case 'כ': case 'ך': return dagesh ? 'k' : 'ch'
    case 'פ': case 'ף': return dagesh ? 'p' : 'f'
    case 'ת': case 'ט': return 't'
    case 'ק': return 'k'
    case 'ח': return 'ch'
    case 'ס': return 's'
    case 'ש': return c.includes('ׂ') ? 's' : 'sh'
    case 'א': case 'ע': return '-'
    case 'ו': return 'v'
    case 'צ': case 'ץ': return 'ts'
    default: return base
  }
}

const VOWEL_MARK = { a: 'ָ', e: 'ֵ', i: 'ִי', o: 'וֹ', u: 'וּ' }
// Spelled so text-to-speech reads a clean syllable ("בָּא" → "ba").
const VOWEL_SAY = { a: 'ָא', e: 'ֶה', i: 'ִי', o: 'וֹ', u: 'וּ' }
export const VOWEL_NAMES = { a: 'אָה', e: 'אֶה', i: 'אִי', o: 'אוֹ', u: 'אוּ' }

/** A phonics syllable: { key, text (shown), say (for TTS), c, v } */
export function syllable(c, v, text) {
  return {
    key: `${consonantSound(c)}${v}`,
    text: text ?? c + VOWEL_MARK[v],
    say: c + VOWEL_SAY[v],
    c,
    v,
  }
}

export const targetSyllable = (word) => syllable(word.c, word.v, word.parts[word.miss])

const POOL = ['מ', 'ל', 'נ', 'ר', 'ס', 'שׁ', 'בּ', 'כּ', 'פּ', 'תּ', 'דּ', 'גּ', 'ח', 'י', 'ז', 'ה']
const VOWELS = ['a', 'e', 'i', 'o', 'u']
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
export const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Three "tricky" wrong bubbles: same letter with another vowel, same vowel
 * with another letter, and one more of either kind. Never the same sound.
 */
export function distractors(word) {
  const target = targetSyllable(word)
  const sound = consonantSound(word.c)
  const otherCons = shuffle(POOL.filter((c) => consonantSound(c) !== sound))
  const otherVowels = shuffle(VOWELS.filter((v) => v !== word.v))
  const out = [
    syllable(word.c, otherVowels[0]),
    syllable(otherCons[0], word.v),
    Math.random() < 0.5 ? syllable(word.c, otherVowels[1]) : syllable(otherCons[1], pick(VOWELS)),
  ]
  const seen = new Set([target.key])
  return out.filter((s) => !seen.has(s.key) && seen.add(s.key))
}
