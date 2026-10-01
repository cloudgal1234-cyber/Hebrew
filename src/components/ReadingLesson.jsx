import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { blendSteps, chunkSay } from '../data/words.js'
import { speak, stopSpeech } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'
import { CHUNK_COLORS } from './SyllableWord.jsx'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * "Let's read it": the word is split into syllables. Each syllable lights up
 * and is read, then they are blended step by step (גָּ… גָּמָל) until the
 * whole word is read. The child can tap any syllable to hear it again.
 */
export default function ReadingLesson({ word, onDone }) {
  const [step, setStep] = useState(-1) // syllables 0..step are lit
  const [joined, setJoined] = useState(false)
  const [running, setRunning] = useState(false)
  const [ready, setReady] = useState(false)
  const runId = useRef(0)

  async function readIt() {
    const id = ++runId.current
    const alive = () => runId.current === id
    setRunning(true)
    setJoined(false)
    setStep(-1)
    stopSpeech()
    await sleep(300)
    if (!alive()) return
    await speak('בּוֹאוּ נִקְרָא', { interrupt: false })
    const steps = blendSteps(word)
    for (let i = 0; i < word.chunks.length; i++) {
      if (!alive()) return
      setStep(i)
      sfx.tick()
      await speak(steps[i], { rate: i === steps.length - 1 ? 0.7 : 0.55, interrupt: false })
      await sleep(350)
    }
    if (!alive()) return
    setJoined(true)
    sfx.success()
    await speak(word.word, { rate: 0.75, interrupt: false })
    if (!alive()) return
    setRunning(false)
    setReady(true)
  }

  function tapChunk(i) {
    runId.current++ // stop the automatic reading
    setRunning(false)
    setReady(true)
    setStep(i)
    sfx.pop()
    speak(chunkSay(word, i), { rate: 0.55 })
  }

  function tapWord() {
    runId.current++
    setRunning(false)
    setReady(true)
    setStep(word.chunks.length - 1)
    setJoined(true)
    speak(word.word, { rate: 0.75 })
  }

  useEffect(() => {
    readIt()
    return () => {
      runId.current++
      stopSpeech()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/70 p-3 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex w-full max-w-xl flex-col items-center rounded-[2rem] border-4 border-white bg-gradient-to-b from-amber-50 to-amber-100 p-5 shadow-2xl"
        initial={{ scale: 0.6, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.45 }}
      >
        <h2 className="font-heb text-2xl font-black text-violet-800 sm:text-3xl">📖 לוֹמְדִים לִקְרֹא</h2>

        <motion.button
          type="button"
          onClick={tapWord}
          aria-label="שְׁמַע אֶת הַמִּלָּה"
          className="mt-2 text-[clamp(4rem,16vw,6.5rem)] leading-none"
          animate={joined ? { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] } : { y: [0, -6, 0] }}
          transition={joined ? { duration: 0.7 } : { duration: 1.8, repeat: Infinity }}
        >
          {word.emoji}
        </motion.button>

        {/* Syllables, apart */}
        <motion.div layout className={`font-heb mt-4 mb-8 flex items-end ${joined ? 'gap-0' : 'gap-3 sm:gap-5'}`}>
          {word.chunks.map((c, i) => {
            const lit = i <= step
            const current = i === step && !joined
            return (
              <motion.button
                layout
                key={i}
                type="button"
                onClick={() => tapChunk(i)}
                animate={{ scale: current ? 1.18 : 1, y: current ? -6 : 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className={`relative leading-none font-black text-[clamp(3.2rem,13vw,5.5rem)] ${
                  joined ? 'rounded-none bg-transparent px-0.5 py-1' : 'rounded-2xl px-3 py-2 shadow-md'
                }`}
                style={{
                  color: lit ? CHUNK_COLORS[i % CHUNK_COLORS.length] : '#a8a29e',
                  background: joined ? 'transparent' : current ? '#fde68a' : 'white',
                }}
              >
                {c}
                {current && (
                  <motion.span
                    layoutId="reading-finger"
                    className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-3xl"
                  >
                    👆
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </motion.div>

        <AnimatePresence>
          {joined && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heb mt-3 text-xl font-bold text-emerald-700"
            >
              ✨ {word.chunks.join(' + ')} = {word.word}
            </motion.p>
          )}
        </AnimatePresence>

        <p className="mt-3 text-center text-sm font-semibold text-stone-500">לוֹחֲצִים עַל הֲבָרָה כְּדֵי לִשְׁמֹעַ אוֹתָהּ</p>

        <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row-reverse">
          <motion.button
            type="button"
            onClick={() => (runId.current++, stopSpeech(), onDone())}
            disabled={!ready}
            animate={ready ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1.2, repeat: ready ? Infinity : 0 }}
            className="flex-1 rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95 disabled:opacity-40"
          >
            🫧 תּוֹפְסִים אֶת הַמִּלָּה
          </motion.button>
          <button
            type="button"
            onClick={readIt}
            disabled={running}
            className="rounded-full bg-violet-500 px-5 py-3 text-lg font-bold text-white shadow active:scale-95 disabled:opacity-40"
          >
            🔁 שׁוּב
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
