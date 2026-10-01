import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LEVELS } from '../data/words.js'
import { hasHebrewVoice, speak } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'

const FLOATERS = ['דָּג', 'סוּס', 'לֵב', 'פִּיל', 'עֵץ', 'נֵר', 'דּוֹב', 'תּוּת']

export default function HomeScreen({ progress, onPlay, onReset }) {
  const [voiceMissing, setVoiceMissing] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVoiceMissing(!hasHebrewVoice()), 1500)
    return () => clearTimeout(t)
  }, [])

  function start(level) {
    sfx.unlock()
    sfx.pop()
    speak(level.name)
    onPlay(level.id)
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="factory-bg relative flex h-full flex-col items-center overflow-y-auto px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]"
    >
      {/* Drifting word bubbles in the background */}
      {FLOATERS.map((s, i) => (
        <motion.div
          key={s}
          className="bubble font-heb pointer-events-none absolute flex h-14 min-w-20 items-center justify-center rounded-full px-3 text-2xl font-bold opacity-60"
          style={{ '--b1': '#fef9c3', '--b2': '#f9a8d4', '--b3': '#c084fc', left: `${8 + ((i * 12) % 84)}%` }}
          initial={{ y: '110vh' }}
          animate={{ y: '-20vh', x: [0, 14, -14, 0] }}
          transition={{
            y: { duration: 14 + (i % 4) * 3, repeat: Infinity, delay: i * 1.6, ease: 'linear' },
            x: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {s}
        </motion.div>
      ))}

      <header className="relative z-10 mt-2 flex w-full max-w-3xl items-center justify-between gap-2">
        <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-lg font-extrabold shadow">
          <span>⭐</span>
          <span>{progress.stars}</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-lg font-extrabold shadow">
          <span>🏆</span>
          <span>{progress.score}</span>
        </div>
      </header>

      <motion.div
        className="relative z-10 mt-4 text-center"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <motion.div
          className="text-7xl sm:text-8xl"
          animate={{ rotate: [0, -6, 6, 0], y: [0, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          🏭
        </motion.div>
        <h1 className="font-heb mt-2 text-4xl font-black text-white drop-shadow-[0_4px_0_rgba(76,29,149,0.8)] sm:text-6xl">
          מִפְעַל הַמִּלִּים
          <br />
          הַמְּעוֹפְפוֹת
        </h1>
        <p className="mt-3 text-lg font-semibold text-white/95 sm:text-xl">
          קוֹרְאִים מִלִּים וְתוֹפְסִים אוֹתָן בַּבּוּעוֹת!
        </p>
      </motion.div>

      {voiceMissing && (
        <div className="relative z-10 mt-4 max-w-xl rounded-2xl bg-amber-100 px-4 py-3 text-center text-sm font-semibold text-amber-900 shadow">
          🔈 לֹא נִמְצָא קוֹל עִבְרִי בַּמַּכְשִׁיר. כְּדַאי לְהוֹסִיף קוֹל עִבְרִית בְּהַגְדָּרוֹת הַהַקְרָאָה (Text-to-Speech) לַחֲוָיָה מְלֵאָה.
        </div>
      )}

      <section className="relative z-10 mt-6 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {LEVELS.map((level, i) => {
          const locked = level.id > progress.unlocked
          const stars = progress.levelStars[level.id] ?? 0
          return (
            <motion.button
              key={level.id}
              disabled={locked}
              onClick={() => start(level)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + Math.min(i, 10) * 0.05, type: 'spring', bounce: 0.5 }}
              whileHover={locked ? undefined : { scale: 1.05, rotate: -1 }}
              whileTap={locked ? undefined : { scale: 0.92 }}
              className="flex min-h-36 flex-col items-center justify-between rounded-3xl border-4 border-white/80 p-3 text-center shadow-lg disabled:cursor-not-allowed"
              style={{ background: locked ? '#cbd5e1' : level.color }}
              aria-label={locked ? `שָׁלָב ${level.id} נָעוּל` : `שָׁלָב ${level.id}: ${level.name}`}
            >
              <span className="text-3xl font-black text-white drop-shadow">{locked ? '🔒' : level.id}</span>
              <span className="text-4xl">{locked ? '❔' : level.words.map((w) => w.emoji).join('')}</span>
              <span className="font-heb text-sm font-bold leading-tight text-indigo-950">{level.name}</span>
              <span className="text-lg tracking-tight">
                {[0, 1, 2].map((s) => (
                  <span key={s} className={s < stars ? '' : 'opacity-25 grayscale'}>
                    ⭐
                  </span>
                ))}
              </span>
            </motion.button>
          )
        })}
      </section>

      <div className="relative z-10 mt-8 text-sm text-white/80">
        {confirmReset ? (
          <span className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 font-semibold text-indigo-950">
            לִמְחֹק אֶת כָּל הַהִתְקַדְּמוּת?
            <button className="rounded-full bg-rose-500 px-3 py-1 text-white" onClick={() => (onReset(), setConfirmReset(false))}>
              כֵּן
            </button>
            <button className="rounded-full bg-slate-300 px-3 py-1" onClick={() => setConfirmReset(false)}>
              לֹא
            </button>
          </span>
        ) : (
          <button className="underline underline-offset-4" onClick={() => setConfirmReset(true)}>
            הַתְחָלָה מֵחָדָשׁ
          </button>
        )}
      </div>
    </motion.main>
  )
}
