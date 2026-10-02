import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { tokens } from '../data/stories.js'
import { speak, stopSpeech } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Vowelized text where every word can be tapped to hear it. "Read to me"
 * reads word by word, lighting each one up, then the whole text fluently.
 */
export default function ReadAloud({ text, className = '', onRead, compact = false }) {
  const words = useMemo(() => tokens(text), [text])
  const [lit, setLit] = useState(-1)
  const [reading, setReading] = useState(false)
  const runId = useRef(0)

  useEffect(
    () => () => {
      runId.current++
      stopSpeech()
    },
    [text],
  )

  async function readAll() {
    const id = ++runId.current
    const alive = () => runId.current === id
    setReading(true)
    stopSpeech()
    for (let i = 0; i < words.length; i++) {
      if (!alive()) return
      setLit(i)
      await speak(words[i].say, { rate: 0.7, interrupt: false })
      await sleep(120)
    }
    if (!alive()) return
    setLit(-2) // everything lit while the whole text is read fluently
    await sleep(250)
    await speak(text.replace(/…/g, ','), { rate: 0.8, interrupt: false })
    if (!alive()) return
    setLit(-1)
    setReading(false)
    onRead?.()
  }

  function tapWord(i) {
    runId.current++
    setReading(false)
    setLit(i)
    sfx.pop()
    speak(words[i].say, { rate: 0.7 })
  }

  return (
    <div className="flex flex-col items-center">
      <p className={`font-heb flex flex-wrap justify-center gap-x-3 gap-y-2 text-center leading-snug ${className}`}>
        {words.map((w, i) => {
          const on = lit === i || lit === -2
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => tapWord(i)}
              animate={{ scale: lit === i ? 1.12 : 1, y: lit === i ? -3 : 0 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 0.3 }}
              className={`rounded-xl px-1 font-black ${on ? 'bg-amber-200 text-violet-800' : 'text-indigo-950'}`}
            >
              {w.raw}
            </motion.button>
          )
        })}
      </p>
      <button
        type="button"
        onClick={readAll}
        disabled={reading}
        className={`rounded-full bg-violet-600 font-bold text-white shadow-lg active:scale-95 disabled:opacity-50 ${
          compact ? 'mt-2 px-3 py-1 text-sm' : 'mt-4 px-5 py-2.5 text-lg'
        }`}
      >
        {reading ? '🔊 קוֹרֵא…' : '🔊 תִּקְרָא לִי'}
      </button>
    </div>
  )
}
