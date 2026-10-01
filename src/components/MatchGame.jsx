import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { shuffle } from '../data/words.js'
import { speak, speakAll } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'

/**
 * Bonus round after every 3 words: read each word card and match it to its
 * picture. Fewer mistakes → more stars.
 */
export default function MatchGame({ words, onDone }) {
  const pictures = useMemo(() => shuffle(words), [words])
  const cards = useMemo(() => {
    let order = shuffle(words)
    // Don't line every card up under its own picture.
    while (words.length > 1 && order.some((w, i) => w.id === pictures[i].id)) order = shuffle(words)
    return order
  }, [words, pictures])

  const [selected, setSelected] = useState(null)
  const [matched, setMatched] = useState([])
  const [shake, setShake] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [stars, setStars] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => speakAll(['בּוֹנוּס!', 'קִרְאוּ כָּל מִלָּה וְחַבְּרוּ אוֹתָהּ לַתְּמוּנָה']), 400)
    return () => clearTimeout(t)
  }, [])

  function pickCard(w) {
    if (matched.includes(w.id) || stars !== null) return
    sfx.pop()
    setSelected(w.id)
  }

  function pickPicture(w) {
    if (matched.includes(w.id) || stars !== null) return
    if (!selected) {
      speak('קֹדֶם בּוֹחֲרִים מִלָּה')
      return
    }
    if (selected === w.id) {
      sfx.success()
      speak(w.word, { rate: 0.75 })
      const next = [...matched, w.id]
      setMatched(next)
      setSelected(null)
      if (next.length === words.length) {
        const n = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
        setTimeout(() => {
          setStars(n)
          sfx.star()
          speak(n === 3 ? 'מֻשְׁלָם! שָׁלוֹשׁ כּוֹכָבִים!' : 'כָּל הַכָּבוֹד!')
        }, 900)
      }
    } else {
      sfx.bounce()
      setMistakes((m) => m + 1)
      setShake(w.id)
      setTimeout(() => setShake(null), 500)
      speak('נַסּוּ שׁוּב')
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/70 p-3 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex w-full max-w-xl flex-col items-center rounded-[2rem] border-4 border-white bg-gradient-to-b from-sky-50 to-violet-100 p-4 shadow-2xl sm:p-6"
        initial={{ scale: 0.6, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.45 }}
      >
        <h2 className="font-heb text-center text-2xl font-black text-violet-800 sm:text-3xl">🧩 חַבְּרוּ מִלָּה לַתְּמוּנָה</h2>

        {/* Pictures */}
        <div className="mt-5 grid w-full grid-cols-3 gap-3">
          {pictures.map((w) => {
            const done = matched.includes(w.id)
            return (
              <motion.button
                key={w.id}
                onClick={() => pickPicture(w)}
                animate={shake === w.id ? { x: [0, -12, 12, -8, 8, 0] } : done ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.45 }}
                whileTap={{ scale: 0.92 }}
                className={`flex aspect-square flex-col items-center justify-center rounded-3xl border-4 shadow-md ${
                  done ? 'border-emerald-400 bg-emerald-100' : selected ? 'border-dashed border-violet-400 bg-white' : 'border-white bg-white'
                }`}
                aria-label={done ? w.word : 'תְּמוּנָה'}
              >
                <span className="text-[clamp(3rem,13vw,5rem)] leading-none">{w.emoji}</span>
                {done && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="font-heb mt-1 text-[clamp(1.2rem,5vw,1.8rem)] font-black text-emerald-700"
                  >
                    {w.word}
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Word cards */}
        <div className="mt-6 flex w-full flex-wrap justify-center gap-3">
          {cards.map((w) => {
            const done = matched.includes(w.id)
            return (
              <motion.button
                key={w.id}
                onClick={() => pickCard(w)}
                disabled={done}
                animate={{ scale: selected === w.id ? 1.12 : 1, opacity: done ? 0.25 : 1, y: selected === w.id ? -6 : 0 }}
                whileTap={done ? undefined : { scale: 0.9 }}
                className={`font-heb rounded-2xl border-4 px-5 py-2 text-[clamp(1.8rem,7vw,2.6rem)] font-black shadow-lg ${
                  selected === w.id ? 'border-amber-400 bg-amber-200 text-indigo-950' : 'border-white bg-violet-600 text-white'
                }`}
              >
                {w.word}
              </motion.button>
            )
          })}
        </div>

        {stars !== null && (
          <div className="mt-5 flex flex-col items-center gap-3">
            <div className="flex gap-2 text-6xl">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2 + i * 0.25, type: 'spring', bounce: 0.6 }}
                  className={i < stars ? '' : 'opacity-25 grayscale'}
                >
                  ⭐
                </motion.span>
              ))}
            </div>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={() => onDone(stars)}
              className="rounded-full bg-emerald-500 px-8 py-3 text-xl font-black text-white shadow-lg active:scale-95"
            >
              מַמְשִׁיכִים ⬅️
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
