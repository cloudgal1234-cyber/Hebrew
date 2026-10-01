import { useEffect, useState } from 'react'
import { VOWELS, splitGraphemes, syllable } from '../data/content'
import { speakLetter, speakSyllable, speakWord } from '../lib/speech'
import TracingCanvas from '../games/TracingCanvas'
import WordAssembly from '../games/WordAssembly'

/**
 * What happens when a mapped card is scanned (or a lesson is opened):
 * an animated reveal + audio, then hands-on practice —
 * letter → syllables & tracing, word → drag-and-drop assembly.
 */
export default function LearningAction({ resolved, autoPlay = true }) {
  const { type, item } = resolved
  const [mode, setMode] = useState('learn')

  useEffect(() => {
    setMode('learn')
    if (!autoPlay) return
    const t = setTimeout(() => (type === 'letter' ? speakLetter(item) : speakWord(item)), 250)
    return () => clearTimeout(t)
  }, [type, item, autoPlay])

  const tabs =
    type === 'letter'
      ? [['learn', '🔊 לוֹמְדִים'], ['trace', '✏️ כּוֹתְבִים']]
      : [['learn', '🔊 לוֹמְדִים'], ['build', '🧩 מַרְכִּיבִים']]

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {tabs.map(([m, label]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-2xl px-5 py-2 text-xl font-bold shadow ${mode === m ? 'bg-violet-500 text-white' : 'bg-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'learn' && type === 'letter' && <LetterLesson letter={item} />}
      {mode === 'learn' && type === 'word' && <WordLesson word={item} onBuild={() => setMode('build')} />}
      {mode === 'trace' && <TracingCanvas letter={item} />}
      {mode === 'build' && <WordAssembly word={item} />}
    </div>
  )
}

function LetterLesson({ letter }) {
  return (
    <div key={letter.id} className="flex flex-col items-center gap-4">
      <button
        onClick={() => speakLetter(letter)}
        className="animate-pop font-heb flex h-48 w-48 items-center justify-center rounded-[2.5rem] text-[9rem] leading-none font-black text-white shadow-2xl sm:h-56 sm:w-56"
        style={{ background: `linear-gradient(145deg, ${letter.color}, ${letter.color}cc)` }}
        aria-label={letter.name}
      >
        {letter.char}
      </button>
      <div className="font-heb text-4xl font-bold">{letter.name}</div>
      <button
        onClick={() => speakLetter(letter)}
        className="flex items-center gap-3 rounded-3xl bg-white px-6 py-3 shadow-lg"
      >
        <span className="animate-float text-6xl">{letter.emoji}</span>
        <span className="font-heb text-4xl font-bold">
          <span style={{ color: letter.color }}>{splitGraphemes(letter.word)[0]}</span>
          {splitGraphemes(letter.word).slice(1).join('')}
        </span>
      </button>

      <div className="w-full">
        <p className="mb-2 text-center text-lg font-bold text-indigo-900/70">הַקִּישׁוּ עַל צְלִיל 👇</p>
        <div className="flex flex-wrap justify-center gap-2">
          {VOWELS.map((v) => {
            const s = syllable(letter, v)
            return (
              <button
                key={v.id}
                onClick={() => speakSyllable(letter, v, s)}
                className="font-heb flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-white shadow transition hover:scale-110 active:scale-95"
              >
                <span className="text-5xl font-bold">{s}</span>
                <span className="text-[0.65rem] text-slate-500">{v.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function WordLesson({ word, onBuild }) {
  return (
    <div key={word.id} className="flex flex-col items-center gap-4">
      <button onClick={() => speakWord(word)} className="animate-pop text-[8rem] leading-none" aria-label={word.text}>
        {word.emoji}
      </button>
      <button
        onClick={() => speakWord(word)}
        className="font-heb animate-pop rounded-3xl bg-white px-8 py-4 text-6xl font-black shadow-xl"
      >
        {word.text}
      </button>
      <button onClick={onBuild} className="rounded-2xl bg-amber-300 px-6 py-3 text-2xl font-bold shadow hover:bg-amber-400">
        🧩 בּוֹאוּ נַרְכִּיב אֶת הַמִּלָּה
      </button>
    </div>
  )
}
