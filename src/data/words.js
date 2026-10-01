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

// More levels, easy → hard. [name, [[emoji, split], ...]]
const MORE = [
  ['הַחַוָּה', [['🐄', 'פָּ|רָה'], ['🐐', 'עֵ|ז'], ['🦆', 'בַּרְ|וָז']]],
  ['גַּן הַחַיּוֹת', [['🐒', 'קוֹ|ף'], ['🐢', 'צָ|ב'], ['🦊', 'שׁוּ|עָל']]],
  ['מִטְבַּח הַמִּפְעָל', [['🍞', 'לֶ|חֶם'], ['🥛', 'חָ|לָב'], ['🍲', 'מָ|רָק']]],
  ['גִּנַּת הַיְּרָקוֹת', [['🥕', 'גֶּ|זֶר'], ['🌽', 'תִּי|רָס'], ['🧅', 'בָּ|צָל']]],
  ['הַבַּיִת שֶׁלִּי', [['🚪', 'דֶּ|לֶת'], ['🪟', 'חַ|לּוֹן'], ['🛋️', 'סַ|פָּה']]],
  ['הַגּוּף שֶׁלִּי', [['✋', 'יָ|ד'], ['🦵', 'רֶ|גֶל'], ['👂', 'אֹ|זֶן']]],
  ['מֶזֶג הָאֲוִיר', [['☁️', 'עָ|נָן'], ['🌈', 'קֶ|שֶׁת'], ['❄️', 'שֶׁ|לֶג']]],
  ['הַמִּשְׁפָּחָה', [['👶', 'תִּי|נוֹק'], ['👴', 'סַ|בָּא'], ['👵', 'סַבְ|תָּא']]],
  ['אֲרוֹן הַבְּגָדִים', [['👟', 'נַ|עַל'], ['🧦', 'גֶּ|רֶב'], ['👕', 'חֻלְ|צָה']]],
  ['הַיָּם הַכָּחֹל', [['🦈', 'כָּ|רִישׁ'], ['🦀', 'סַרְ|טָן'], ['🐬', 'דּוֹלְ|פִין']]],
  ['הַגִּנָּה הַפּוֹרַחַת', [['🌸', 'פֶּ|רַח'], ['🍃', 'עָ|לֶה'], ['🌴', 'דֶּ|קֶל']]],
  ['תַּחֲנַת הַחֲלָלִית', [['🚀', 'טִי|ל'], ['🚁', 'מַ|סּוֹק'], ['🚂', 'רַ|כֶּ|בֶת']]],
  ['שֻׁלְחַן הָאֹכֶל', [['🔪', 'סַ|כִּין'], ['🥄', 'כַּ|ף'], ['🍽️', 'צַ|לַּ|חַת']]],
  ['חֲנוּת הַמַּמְתַּקִּים', [['🍦', 'גְּ|לִי|דָה'], ['🍬', 'סֻ|כָּ|רִיָּה'], ['🍪', 'עוּ|גִיָּה']]],
  ['אַרְמוֹן הַמֶּלֶךְ', [['🤴', 'מֶ|לֶךְ'], ['👑', 'כֶּ|תֶר'], ['🏰', 'טִי|רָה']]],
  ['חֶדֶר הַמּוּזִיקָה', [['🥁', 'תֹּ|ף'], ['🎻', 'כִּ|נּוֹר'], ['🎹', 'פְּ|סַנְ|תֵּר']]],
  ['יוֹם הֻלֶּדֶת', [['🎁', 'מַ|תָּ|נָה'], ['🎈', 'בָּ|לוֹן'], ['🤡', 'לֵי|צָן']]],
  ['בֵּית הַסֵּפֶר', [['✏️', 'עִ|פָּ|רוֹן'], ['🎒', 'תִּי|ק'], ['✉️', 'מִכְ|תָּב']]],
  ['הַשּׁוּק', [['🍊', 'תַּ|פּוּז'], ['🍐', 'אֲ|גַס'], ['🍍', 'אֲ|נָ|נָס']]],
  ['עוֹלַם הַחֲרָקִים', [['🐝', 'דְּ|בוֹ|רָה'], ['🦋', 'פַּרְ|פַּר'], ['🐜', 'נְ|מָ|לָה']]],
  ['הַבִּצָּה', [['🐊', 'תַּ|נִּין'], ['🐸', 'צְ|פַרְ|דֵּ|עַ'], ['🐌', 'חִ|לָּ|זוֹן']]],
  ['הַשָּׂדֶה', [['🐑', 'כִּבְ|שָׂה'], ['🐷', 'חֲ|זִיר'], ['🐭', 'עַכְ|בָּר']]],
  ['הַיַּעַר הַקָּסוּם', [['🦉', 'יַנְ|שׁוּף'], ['🦔', 'קִ|פּוֹד'], ['🍄', 'פִּטְ|רִיָּה']]],
  ['הַמִּדְבָּר', [['🌵', 'קַקְ|טוּס'], ['⛺', 'אוֹ|הֶל'], ['🪨', 'סֶ|לַע']]],
  ['הַכְּבִישׁ', [['🚗', 'מְ|כוֹ|נִית'], ['🚚', 'מַ|שָּׂ|אִית'], ['🚌', 'אוֹ|טוֹ|בּוּס']]],
  ['הַנָּמָל', [['🚢', 'אוֹ|נִיָּה'], ['🌉', 'גֶּ|שֶׁר'], ['🗺️', 'מַ|פָּה']]],
  ['סְטוּדְיוֹ הַצִּלּוּם', [['📷', 'מַצְ|לֵ|מָה'], ['🖼️', 'תְּ|מוּ|נָה'], ['🧲', 'מַגְ|נֵט']]],
  ['פֵּרוֹת הַקַּיִץ', [['🍉', 'אֲ|בַ|טִּי|חַ'], ['🍇', 'עֲ|נָ|בִים'], ['🍒', 'דֻּבְ|דְּ|בָן']]],
  ['הַמִּטְבָּח הַגָּדוֹל', [['🧀', 'גְּ|בִי|נָה'], ['🥚', 'בֵּי|צָה'], ['🍅', 'עַגְ|בָ|נִיָּה']]],
  ['מֵרוֹץ הַגַּלְגַּלִּים', [['🪁', 'עֲ|פִי|פוֹן'], ['🚲', 'אוֹ|פַ|נַּ|יִם'], ['🚜', 'טְ|רַקְ|טוֹר']]],
  ['הַסָּפָארִי', [['🦁', 'אַרְ|יֵה'], ['🦓', 'זֶבְּ|רָה'], ['🐺', 'זְ|אֵב']]],
  ['בֵּין הָעֲנָנִים', [['🐦', 'צִ|פּוֹר'], ['🦅', 'נֶ|שֶׁר'], ['⚡', 'בָּ|רָק']]],
  ['הַטֶּבַע', [['⛰️', 'הַ|ר'], ['🌊', 'יָ|ם'], ['🔥', 'אֵ|שׁ']]],
  ['הַפָּנִים שֶׁלִּי', [['👁️', 'עַ|יִן'], ['👃', 'אַ|ף'], ['👄', 'פֶּ|ה']]],
  ['צִחְצוּחַ שִׁנַּיִם', [['🦷', 'שֵׁ|ן'], ['👅', 'לָ|שׁוֹן'], ['🧼', 'סַ|בּוֹן']]],
  ['חֲדַר הַשֵּׁנָה', [['🛏️', 'מִ|טָּה'], ['🧸', 'דֻּ|בִּי'], ['💡', 'מְ|נוֹ|רָה']]],
  ['הַסָּלוֹן', [['🪑', 'כִּ|סֵּא'], ['⏰', 'שָׁ|עוֹן'], ['📱', 'טֶ|לֶ|פוֹן']]],
  ['יוֹם גָּשׁוּם', [['☂️', 'מַטְ|רִיָּה'], ['🧥', 'מְ|עִיל'], ['🧤', 'כְּ|פָ|פוֹת']]],
  ['אֲרוּחַת עֶרֶב', [['🍚', 'אֹ|רֶז'], ['🥗', 'סָ|לָט'], ['🍴', 'מַזְ|לֵג']]],
  ['מְדַף הַתַּבְלִינִים', [['🌶️', 'פִּלְ|פֵּל'], ['🧄', 'שׁוּ|ם'], ['🍯', 'דְּ|בַשׁ']]],
  ['גַּן הַפְּרָחִים', [['🌹', 'שׁוֹ|שַׁ|נָּה'], ['🌻', 'חַ|מָּ|נִית'], ['🌱', 'דֶּ|שֶׁא']]],
  ['חֲדַר הַמִּשְׂחָקִים', [['🎲', 'קוּ|בִּיָּה'], ['🔔', 'פַּ|עֲ|מוֹן'], ['🚩', 'דֶּ|גֶל']]],
  ['הָאוֹצָר הָאָבוּד', [['👮', 'שׁוֹ|טֵר'], ['🔑', 'מַפְ|תֵּ|חַ'], ['💍', 'טַ|בַּ|עַת']]],
]

const PALETTE = ['#f472b6', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa', '#f87171', '#2dd4bf', '#60a5fa', '#e879f9']

MORE.forEach(([name, items], i) => {
  const id = LEVELS.length + 1
  LEVELS.push({
    id,
    name,
    color: PALETTE[(id - 1) % PALETTE.length],
    fall: Math.max(6.5, 8 - i * 0.04), // a little faster as levels go on
    words: items.map(([emoji, split]) => w(split.replaceAll('|', ''), emoji, split)),
  })
})

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
// Final open vowel → [vowel mark to use instead, helper letter to add].
const VOWEL_HELPER = {
  '\u05B8': ['\u05B8', 'א'], // kamatz
  '\u05B7': ['\u05B7', 'א'], // patach
  '\u05B2': ['\u05B7', 'א'], // chataf patach
  '\u05B3': ['\u05B9', 'ו'], // chataf kamatz
  '\u05B6': ['\u05B6', 'ה'], // segol
  '\u05B5': ['\u05B5', 'ה'], // tzere
  '\u05B1': ['\u05B6', 'ה'], // chataf segol
  '\u05B0': ['\u05B6', 'ה'], // shva, said as a short "e"
  '\u05B4': ['\u05B4', 'י'], // chirik
  '\u05B9': ['\u05B9', 'ו'], // holam
  '\u05BB': ['', 'וּ'], // kubutz → shuruk
}

/** A shva is sounded ("e") on the first letter, or right after another shva (דֻּבְדְּ). */
function shvaIsSounded(chars, i) {
  let j = i - 1
  while (j >= 0 && !LETTER.test(chars[j])) j--
  if (j < 0) return true
  const prevMarks = chars.slice(j + 1, i)
  return prevMarks.includes('\u05B0')
}

/**
 * Text-to-speech reads a lone open syllable like "גָּ" as a letter name, and
 * reads a word cut mid-way oddly. Adding a silent helper letter after a final
 * open vowel ("גָּא", "יָרֵה", "נֶה" for "נְ") makes engines pronounce the sound itself.
 */
export function speakable(text) {
  const chars = [...text]
  let i = chars.length - 1
  while (i >= 0 && !LETTER.test(chars[i])) i--
  const marks = chars.slice(i + 1)
  // וֹ / וּ / bare י already sound out their vowel
  if (chars[i] === 'ו' && (marks.includes('\u05B9') || marks.includes('\u05BC'))) return text
  if (chars[i] === 'י' && marks.length === 0) return text
  if ('ךםןףץ'.includes(chars[i])) return text // final letters close the syllable
  const vowel = marks.find((m) => VOWEL_HELPER[m])
  if (!vowel) return text
  if (vowel === '\u05B0' && !shvaIsSounded(chars, i)) return text // silent shva closes the syllable (בַּרְ)
  const [mark, helper] = VOWEL_HELPER[vowel]
  const kept = marks.filter((m) => m !== vowel)
  return chars.slice(0, i + 1).join('') + kept.join('') + mark + helper
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
