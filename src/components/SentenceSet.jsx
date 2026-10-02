import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SENTENCE_SETS } from '../data/stories.js'
import { shuffle } from '../data/words.js'
import { speak, speakAll, stopSpeech } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'
import ReadAloud from './ReadAloud.jsx'
import StarsEnd, { starsFor } from './StarsEnd.jsx'

/**
 * Read a sentence (alone, or with "read to me"), then pick the picture that
 * matches it. Five sentences per set.
 */
export default function SentenceSet({ setId, onDone, onExit }) {
  const set = SENTENCE_SETS.find((s) => s.id === setId)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState('read') // read | pick
  const [mistakes, setMistakes] = useState(0)
  const [shake, setShake] = useState(null)
  const [right, setRight] = useState(false)
  const [stars, setStars] = useState(null)
  const sentence = set.sentences[index]
  const pictures = useMemo(() => shuffle([sentence.pic, ...sentence.wrong]), [sentence])

  useEffect(() => () => stopSpeech(), [])
  useEffect(() => {
    if (index === 0) {
      const t = setTimeout(() => speak('נַסּוּ לִקְרֹא אֶת הַמִּשְׁפָּט לְבַד. אֶפְשָׁר לִלְחֹץ עַל מִלָּה כְּדֵי לִשְׁמֹעַ אוֹתָהּ'), 500)
      return () => clearTimeout(t)
    }
  }, [index])

  function toPick() {
    stopSpeech()
    sfx.pop()
    setPhase('pick')
    speak('אֵיזוֹ תְּמוּנָה מַתְאִימָה לַמִּשְׁפָּט?')
  }

  async function pick(p) {
    if (right) return
    if (p === sentence.pic) {
      setRight(true)
      sfx.success()
      await speakAll(['נָכוֹן!', [sentence.text, { rate: 0.8 }]])
      setRight(false)
      if (index + 1 < set.sentences.length) {
        setIndex(index + 1)
        setPhase('read')
      } else {
        const n = starsFor(mistakes)
        setStars(n)
        sfx.fanfare()
        onDone(n)
      }
    } else {
      sfx.bounce()
      setMistakes((m) => m + 1)
      setShake(p)
      setTimeout(() => setShake(null), 500)
      speak('נַסּוּ שׁוּב. אֶפְשָׁר לִקְרֹא אֶת הַמִּשְׁפָּט עוֹד פַּעַם')
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col"
      style={{ background: `linear-gradient(180deg, #fffbeb, ${set.color}55)` }}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 bg-violet-900 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 text-white">
        <button onClick={onExit} aria-label="חֲזָרָה" className="flex size-11 items-center justify-center rounded-full bg-white/15 text-2xl active:scale-90">
          ↩️
        </button>
        <div className="flex flex-col items-center">
          <span className="font-heb text-base font-bold">
            {set.emoji} {set.title}
          </span>
          <div className="mt-1 flex gap-1.5">
            {set.sentences.map((_, i) => (
              <span
                key={i}
                className={`size-3.5 rounded-full ${i < index || stars !== null ? 'bg-emerald-400' : i === index ? 'bg-amber-300' : 'bg-white/25'}`}
              />
            ))}
          </div>
        </div>
        <span className="size-11" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-6">
        {stars !== null ? (
          <StarsEnd title="קְרָאתֶם 5 מִשְׁפָּטִים!" stars={stars}>
            <button onClick={onExit} className="rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95">
              מַמְשִׁיכִים ⬅️
            </button>
          </StarsEnd>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              className="flex w-full max-w-2xl flex-1 flex-col items-center"
            >
              <div className="w-full rounded-[2rem] border-4 border-white bg-white/90 px-4 py-8 shadow-xl">
                <ReadAloud text={sentence.text} className="text-[clamp(2.2rem,9vw,3.6rem)]" />
              </div>

              {phase === 'read' ? (
                <motion.button
                  onClick={toPick}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="mt-8 w-full max-w-sm rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95"
                >
                  ✅ קָרָאתִי!
                </motion.button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col items-center">
                  <p className="font-heb text-xl font-black text-violet-800">אֵיזוֹ תְּמוּנָה מַתְאִימָה?</p>
                  <div className="mt-4 flex gap-3">
                    {pictures.map((p) => (
                      <motion.button
                        key={p}
                        onClick={() => pick(p)}
                        animate={
                          shake === p
                            ? { x: [0, -12, 12, -8, 8, 0] }
                            : right && p === sentence.pic
                              ? { scale: [1, 1.25, 1.1] }
                              : { scale: 1, opacity: right ? 0.3 : 1 }
                        }
                        transition={{ duration: 0.45 }}
                        whileTap={{ scale: 0.9 }}
                        className={`flex size-24 items-center justify-center rounded-3xl border-4 bg-white text-6xl shadow-lg sm:size-28 ${
                          right && p === sentence.pic ? 'border-emerald-400' : 'border-white'
                        }`}
                      >
                        {p}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.main>
  )
}
