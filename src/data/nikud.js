// Nikud (vowel sign) lessons, grouped by the sound the signs make.

import { LEVELS, shuffle, speakable } from './words.js'

// sign: the mark as added after a letter (holam/shuruk come with their vav)
export const NIKUD = [
  {
    id: 'a', sound: 'אָ', color: '#f472b6',
    title: 'אָ – קָמָץ וּפַתָּח',
    signs: [
      { name: 'קָמָץ', sign: 'ָ', looks: 'קַו קָטָן עִם רֶגֶל מִתַּחַת לָאוֹת' },
      { name: 'פַּתָּח', sign: 'ַ', looks: 'קַו יָשָׁר מִתַּחַת לָאוֹת' },
    ],
  },
  {
    id: 'e', sound: 'אֶ', color: '#fb923c',
    title: 'אֶ – צֵירֵה וְסֶגּוֹל',
    signs: [
      { name: 'צֵירֵה', sign: 'ֵ', looks: 'שְׁתֵּי נְקֻדּוֹת זוֹ לְיַד זוֹ מִתַּחַת לָאוֹת' },
      { name: 'סֶגּוֹל', sign: 'ֶ', looks: 'שָׁלוֹשׁ נְקֻדּוֹת מִתַּחַת לָאוֹת' },
    ],
  },
  {
    id: 'i', sound: 'אִי', color: '#facc15',
    title: 'אִי – חִירִיק',
    signs: [{ name: 'חִירִיק', sign: 'ִי', looks: 'נְקֻדָּה אַחַת מִתַּחַת לָאוֹת, וְהַרְבֵּה פְּעָמִים יוּד אַחֲרֶיהָ' }],
  },
  {
    id: 'o', sound: 'אוֹ', color: '#4ade80',
    title: 'אוֹ – חוֹלָם',
    signs: [{ name: 'חוֹלָם', sign: 'וֹ', looks: 'וָו עִם נְקֻדָּה לְמַעְלָה' }],
  },
  {
    id: 'u', sound: 'אוּ', color: '#38bdf8',
    title: 'אוּ – שׁוּרוּק וְקֻבּוּץ',
    signs: [
      { name: 'שׁוּרוּק', sign: 'וּ', looks: 'וָו עִם נְקֻדָּה בָּאֶמְצַע' },
      { name: 'קֻבּוּץ', sign: 'ֻ', looks: 'שָׁלוֹשׁ נְקֻדּוֹת בַּאֲלַכְסוֹן מִתַּחַת לָאוֹת' },
    ],
  },
  {
    id: 'shva', sound: 'בְּ', base: 'בּ', color: '#a78bfa', // אְ looks odd; show shva on bet
    title: 'שְׁוָא',
    signs: [{ name: 'שְׁוָא', sign: 'ְ', looks: 'שְׁתֵּי נְקֻדּוֹת אַחַת מֵעַל הַשְּׁנִיָּה' }],
    note: 'בִּתְחִלַּת מִלָּה הַשְּׁוָא נִשְׁמָע כְּמוֹ אֶ קְצָרָה: דְּבוֹרָה. בְּסוֹף הֲבָרָה הוּא שׁוֹתֵק: בַּרְוָז.',
  },
]

export const REVIEW = { id: 'review', sound: '🎯', color: '#e879f9', title: 'חֲזָרָה עַל כָּל הַנִּקּוּד' }

// Letters to practise on (dagesh where the sound needs it)
const LETTERS = ['מ', 'ל', 'נ', 'ר', 'ס', 'בּ', 'דּ', 'פּ', 'תּ', 'גּ', 'שׁ', 'כּ', 'ז', 'ח']

/** A letter with a sign, e.g. ('מ', 'ָ') → { text: 'מָ', say: 'מָא' } */
export function withSign(letter, sign) {
  const text = letter + sign
  return { text, say: speakable(text) }
}

/** The sound group of a written syllable's vowel. */
export function vowelOf(chunk) {
  if (/וֹ/.test(chunk) || chunk.includes('ֹ')) return 'o'
  if (/[^א-ת]*וּ/.test(chunk.slice(1)) || chunk.includes('ֻ')) return 'u'
  if (/[ֲַָ]/.test(chunk)) return 'a'
  if (/[ֱֵֶ]/.test(chunk)) return 'e'
  if (chunk.includes('ִ')) return 'i'
  if (chunk.includes('ְ')) return 'shva'
  return null
}

const ALL_WORDS = LEVELS.flatMap((l) => l.words)

/** Example words whose first syllable uses this vowel, shortest first. */
export function exampleWords(groupId, n = 3) {
  const fits = ALL_WORDS.filter((w) => vowelOf(w.chunks[0]) === groupId && w.chunks.length <= 3)
  return shuffle(fits)
    .sort((a, b) => a.chunks.length - b.chunks.length)
    .slice(0, 8)
    .sort(() => Math.random() - 0.5)
    .slice(0, n)
}

/** Letters shown with this lesson's signs (step 2). */
export function practiceLetters(group, n = 6) {
  const letters = shuffle(LETTERS).slice(0, n)
  return letters.map((l, i) => ({ ...withSign(l, group.signs[i % group.signs.length].sign), sign: group.signs[i % group.signs.length] }))
}

// A shva sounds like אֶ, so they are never offered together.
const clash = (a, b) => a === b || (a === 'e' && b === 'shva') || (a === 'shva' && b === 'e')

/**
 * Quiz rounds: hear a syllable, pick it from 3 bubbles with the same letter
 * and different vowels. In a vowel lesson the answer is mostly that vowel.
 */
export function quizRounds(groupId, count = 6) {
  const groups = NIKUD.map((g) => g.id)
  return Array.from({ length: count }, (_, r) => {
    const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)]
    const answerGroup =
      groupId === 'review' || (r % 3 === 2 && groupId !== 'shva')
        ? groups[Math.floor(Math.random() * groups.length)]
        : groupId
    const picked = [answerGroup]
    for (const g of shuffle(groups)) {
      if (picked.length === 3) break
      if (!picked.some((p) => clash(p, g))) picked.push(g)
    }
    const options = shuffle(picked).map((gid) => {
      const group = NIKUD.find((g) => g.id === gid)
      const sign = group.signs[Math.floor(Math.random() * group.signs.length)].sign
      return { group: gid, ...withSign(letter, sign) }
    })
    return { answer: options.find((o) => o.group === answerGroup), options }
  })
}
