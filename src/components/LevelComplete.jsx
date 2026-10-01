import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { LEVELS } from '../data/words.js'
import { speakAll } from '../lib/speech.js'
import Celebration from './Celebration.jsx'

export default function LevelComplete({ level, stars, score, onNext, onReplay, onHome }) {
  const isLast = level.id === LEVELS[LEVELS.length - 1].id

  useEffect(() => {
    speakAll([
      'סִיַּמְתֶּם אֶת הַשָּׁלָב!',
      ...level.words.map((w) => [w.word, { rate: 0.75 }]),
      isLast ? 'אַתֶּם אַלּוּפֵי הַמִּפְעָל!' : 'שָׁלָב חָדָשׁ נִפְתַּח!',
    ])
  }, [level, isLast])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/75 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Celebration />
      <motion.div
        className="relative flex w-full max-w-md flex-col items-center rounded-[2rem] border-4 border-white p-6 text-center shadow-2xl"
        style={{ background: `linear-gradient(180deg, white, ${level.color})` }}
        initial={{ scale: 0.4, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <motion.div className="text-7xl" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
          {isLast ? '🏆' : '🎉'}
        </motion.div>
        <h2 className="font-heb mt-2 text-3xl font-black text-violet-800">סִיַּמְתֶּם אֶת הַשָּׁלָב!</h2>
        <div className="font-heb mt-4 flex flex-wrap justify-center gap-3">
          {level.words.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.2 }}
              className="flex flex-col items-center rounded-2xl bg-white/80 px-3 py-2 shadow"
            >
              <span className="text-4xl">{w.emoji}</span>
              <span className="text-2xl font-black">{w.word}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex gap-1 text-5xl">
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < stars ? '' : 'opacity-25 grayscale'}>
              ⭐
            </span>
          ))}
        </div>
        <p className="mt-2 text-xl font-extrabold text-indigo-900">🏆 +{score} נְקֻדּוֹת</p>

        <div className="mt-5 flex w-full flex-col gap-3">
          <button onClick={onNext} className="rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95">
            {isLast ? '🏠 לַמִּפְעָל' : 'לַשָּׁלָב הַבָּא ⬅️'}
          </button>
          <div className="flex gap-3">
            <button onClick={onReplay} className="flex-1 rounded-full bg-violet-500 py-2.5 text-lg font-bold text-white shadow active:scale-95">
              🔁 שׁוּב
            </button>
            <button onClick={onHome} className="flex-1 rounded-full bg-slate-500 py-2.5 text-lg font-bold text-white shadow active:scale-95">
              🏠 בַּיִת
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
