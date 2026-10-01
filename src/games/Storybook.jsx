import { useEffect, useRef, useState } from 'react'
import Confetti from '../components/Confetti'
import { Btn } from '../components/ui'
import { speak, stop } from '../lib/speech'
import { sfx } from '../lib/sfx'

const tokenize = (text) => text.split(/\s+/).filter(Boolean)
const clean = (w) => w.replace(/[.,!?״"׳']/g, '')

/**
 * Early-reader storybook: big vocalized text, every word tappable,
 * plus "read to me" which highlights each word as it is spoken.
 */
export default function Storybook({ story, onExit }) {
  const [page, setPage] = useState(0)
  const [active, setActive] = useState(-1)
  const [reading, setReading] = useState(false)
  const runId = useRef(0)
  const last = page === story.pages.length - 1
  const words = tokenize(story.pages[page].text)

  useEffect(() => () => stop(), [])
  useEffect(() => {
    runId.current++
    stop()
    setActive(-1)
    setReading(false)
  }, [page])

  const readAloud = async () => {
    const id = ++runId.current
    setReading(true)
    for (let i = 0; i < words.length; i++) {
      if (runId.current !== id) return
      setActive(i)
      await speak(clean(words[i]), { rate: 0.75 })
    }
    if (runId.current === id) {
      setActive(-1)
      setReading(false)
    }
  }

  const tapWord = (i) => {
    runId.current++
    setReading(false)
    setActive(i)
    sfx.pop()
    speak(clean(words[i]), { rate: 0.7 }).then(() => setActive((a) => (a === i ? -1 : a)))
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      {last && <Confetti key={story.id} count={24} />}
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-6 rounded-[2rem] border-8 border-amber-200 bg-amber-50 p-6 shadow-xl">
        <div key={page} className="animate-pop text-7xl tracking-widest sm:text-8xl">{story.pages[page].art}</div>
        <p className="font-heb flex flex-wrap justify-center gap-x-4 gap-y-2 text-center text-4xl leading-relaxed font-bold sm:text-5xl">
          {words.map((w, i) => (
            <button
              key={`${page}-${i}`}
              onClick={() => tapWord(i)}
              className={`rounded-xl px-1 transition ${active === i ? 'scale-110 bg-yellow-300 text-indigo-950' : 'hover:bg-amber-200'}`}
            >
              {w}
            </button>
          ))}
        </p>
        <div className="text-sm font-bold text-amber-700">
          {page + 1} / {story.pages.length}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Btn variant="ghost" className="text-2xl" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          ➜
        </Btn>
        <Btn variant="primary" className="px-6 text-2xl" onClick={reading ? () => (runId.current++, stop(), setReading(false), setActive(-1)) : readAloud}>
          {reading ? '⏸ עֲצֹר' : '🔊 תַּקְרִיא לִי'}
        </Btn>
        {last ? (
          <Btn variant="success" className="text-2xl" onClick={onExit}>🏁 סוֹף</Btn>
        ) : (
          <Btn variant="ghost" className="text-2xl" onClick={() => setPage((p) => p + 1)}>
            ⬅
          </Btn>
        )}
      </div>
    </div>
  )
}
