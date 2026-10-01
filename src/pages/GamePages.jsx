import { useState } from 'react'
import { PageHeader, Btn } from '../components/ui'
import { LETTERS, WORDS, getLetter, getWord, splitGraphemes } from '../data/content'
import { STORIES } from '../data/stories'
import { navigate } from '../lib/router'
import SoundCatcher from '../games/SoundCatcher'
import TracingCanvas from '../games/TracingCanvas'
import WordAssembly from '../games/WordAssembly'
import Storybook from '../games/Storybook'

const LEVELS = [
  { label: 'א–ה', pool: LETTERS.slice(0, 5) },
  { label: 'א–י', pool: LETTERS.slice(0, 10) },
  { label: 'כָּל הָאוֹתִיּוֹת', pool: LETTERS },
]

export function CatcherPage() {
  const [lvl, setLvl] = useState(0)
  return (
    <div>
      <PageHeader title="תּוֹפְסִים צְלִילִים" emoji="🧺">
        {LEVELS.map((l, i) => (
          <Btn key={i} variant={lvl === i ? 'primary' : 'ghost'} onClick={() => setLvl(i)}>
            {l.label}
          </Btn>
        ))}
      </PageHeader>
      <SoundCatcher key={lvl} pool={LEVELS[lvl].pool} />
    </div>
  )
}

export function TracePage({ params }) {
  const letter = getLetter(params.letter) ?? LETTERS[0]
  const idx = LETTERS.indexOf(letter)
  const go = (i) => navigate('/trace', { letter: LETTERS[(i + LETTERS.length) % LETTERS.length].id })
  return (
    <div>
      <PageHeader title="כּוֹתְבִים אוֹתִיּוֹת" emoji="✏️" />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {LETTERS.map((l) => (
          <button
            key={l.id}
            onClick={() => go(LETTERS.indexOf(l))}
            className={`font-heb h-12 w-12 shrink-0 rounded-xl text-3xl font-bold shadow ${l.id === letter.id ? 'text-white' : 'bg-white'}`}
            style={l.id === letter.id ? { background: l.color } : undefined}
          >
            {l.char}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        <Btn variant="ghost" className="text-2xl" onClick={() => go(idx - 1)} aria-label="הקודמת">➜</Btn>
        <div className="w-full max-w-[440px]">
          <TracingCanvas letter={letter} />
        </div>
        <Btn variant="ghost" className="text-2xl" onClick={() => go(idx + 1)} aria-label="הבאה">⬅</Btn>
      </div>
    </div>
  )
}

const SHORT = WORDS.filter((w) => splitGraphemes(w.text).length <= 3)

export function AssemblyPage({ params }) {
  const [easy, setEasy] = useState(true)
  const list = easy ? SHORT : WORDS
  const word = getWord(params.word) ?? list[0]
  const next = () => {
    const pool = list.filter((w) => w.id !== word.id)
    navigate('/build', { word: pool[Math.floor(Math.random() * pool.length)].id })
  }
  return (
    <div>
      <PageHeader title="מַרְכִּיבִים מִלִּים" emoji="🧩">
        <Btn variant={easy ? 'primary' : 'ghost'} onClick={() => setEasy(true)}>קַל</Btn>
        <Btn variant={!easy ? 'primary' : 'ghost'} onClick={() => setEasy(false)}>מְאַתְגֵּר</Btn>
      </PageHeader>
      <div className="rounded-[2rem] bg-white/60 p-4 shadow-lg sm:p-6">
        <WordAssembly key={word.id} word={word} />
        <div className="mt-4 flex justify-center">
          <Btn variant="success" className="px-8 text-2xl" onClick={next}>מִלָּה הַבָּאָה ⬅</Btn>
        </div>
      </div>
    </div>
  )
}

export function StoryPage({ params }) {
  const story = STORIES.find((s) => s.id === params.story)
  if (story)
    return (
      <div>
        <PageHeader title={story.title} emoji={story.cover} back="/stories" />
        <Storybook key={story.id} story={story} onExit={() => navigate('/stories')} />
      </div>
    )
  return (
    <div>
      <PageHeader title="סִפּוּרִים" emoji="📖" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STORIES.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate('/stories', { story: s.id })}
            className="flex flex-col items-center gap-3 rounded-[2rem] border-8 border-amber-200 bg-amber-50 p-6 shadow-lg transition hover:-translate-y-1"
          >
            <span className="animate-float text-8xl">{s.cover}</span>
            <span className="font-heb text-3xl font-bold">{s.title}</span>
            <span className="text-sm text-amber-700">{s.pages.length} עמודים</span>
          </button>
        ))}
      </div>
    </div>
  )
}
