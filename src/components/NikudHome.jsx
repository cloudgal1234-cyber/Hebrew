import { motion } from 'framer-motion'
import { NIKUD, REVIEW } from '../data/nikud.js'
import { speak } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'

/** List of nikud lessons (one per vowel sound) plus a mixed review. */
export default function NikudHome({ progress, onOpen, onBack }) {
  const lessons = [...NIKUD, REVIEW]
  return (
    <motion.main
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="factory-bg flex h-full flex-col items-center overflow-y-auto px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]"
    >
      <header className="flex w-full max-w-3xl items-center justify-between">
        <button
          onClick={onBack}
          aria-label="חֲזָרָה"
          className="flex size-12 items-center justify-center rounded-full bg-white/90 text-2xl shadow active:scale-90"
        >
          🏠
        </button>
        <h1 className="font-heb text-3xl font-black text-white drop-shadow-[0_3px_0_rgba(76,29,149,0.8)] sm:text-5xl">לוֹמְדִים נִקּוּד</h1>
        <span className="size-12" />
      </header>
      <p className="mt-2 text-center text-lg font-semibold text-white/95">כָּל סִימָן אוֹמֵר צְלִיל. בּוֹאוּ נַכִּיר אוֹתָם!</p>

      <section className="mt-6 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        {lessons.map((g, i) => {
          const stars = progress.nikudStars?.[g.id] ?? 0
          return (
            <motion.button
              key={g.id}
              onClick={() => (sfx.unlock(), sfx.pop(), speak(g.title.replace('–', ',')), onOpen(g.id))}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.05, type: 'spring', bounce: 0.5 }}
              whileTap={{ scale: 0.92 }}
              className="flex min-h-40 flex-col items-center justify-between rounded-3xl border-4 border-white/80 p-3 text-center shadow-lg"
              style={{ background: g.color }}
            >
              <span className="font-heb text-6xl font-black leading-tight text-indigo-950">{g.sound}</span>
              <span className="font-heb text-base font-bold leading-tight text-indigo-950">{g.title}</span>
              <span className="text-lg">
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
    </motion.main>
  )
}
