import { motion } from 'framer-motion'
import { SENTENCE_SETS, STORIES } from '../data/stories.js'
import { speak } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'

function Stars({ n }) {
  return (
    <span className="text-lg">
      {[0, 1, 2].map((s) => (
        <span key={s} className={s < n ? '' : 'opacity-25 grayscale'}>
          ⭐
        </span>
      ))}
    </span>
  )
}

/** Choose a sentence set or a story. */
export default function ReadingHome({ progress, onOpen, onBack }) {
  const open = (id, title) => {
    sfx.unlock()
    sfx.pop()
    speak(title)
    onOpen(id)
  }

  return (
    <motion.main
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="factory-bg flex h-full flex-col items-center overflow-y-auto px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))]"
    >
      <header className="flex w-full max-w-3xl items-center justify-between">
        <button onClick={onBack} aria-label="חֲזָרָה" className="flex size-12 items-center justify-center rounded-full bg-white/90 text-2xl shadow active:scale-90">
          🏠
        </button>
        <h1 className="font-heb text-center text-3xl font-black text-white drop-shadow-[0_3px_0_rgba(76,29,149,0.8)] sm:text-5xl">קוֹרְאִים</h1>
        <span className="size-12" />
      </header>

      <h2 className="font-heb mt-6 w-full max-w-3xl text-2xl font-black text-white">📝 מִשְׁפָּטִים</h2>
      <section className="mt-3 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
        {SENTENCE_SETS.map((set, i) => (
          <motion.button
            key={set.id}
            onClick={() => open(`set:${set.id}`, set.title)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 * i, type: 'spring', bounce: 0.5 }}
            whileTap={{ scale: 0.92 }}
            className="flex min-h-32 flex-col items-center justify-between rounded-3xl border-4 border-white/80 p-3 text-center shadow-lg"
            style={{ background: set.color }}
          >
            <span className="text-5xl">{set.emoji}</span>
            <span className="font-heb text-lg font-black leading-tight text-indigo-950">{set.title}</span>
            <Stars n={progress.sentenceStars?.[set.id] ?? 0} />
          </motion.button>
        ))}
      </section>

      <h2 className="font-heb mt-8 w-full max-w-3xl text-2xl font-black text-white">📚 סִפּוּרִים</h2>
      <section className="mt-3 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        {STORIES.map((story, i) => (
          <motion.button
            key={story.id}
            onClick={() => open(`story:${story.id}`, story.title)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 * i, type: 'spring', bounce: 0.5 }}
            whileTap={{ scale: 0.92 }}
            className="relative flex min-h-44 flex-col items-center justify-between overflow-hidden rounded-e-3xl rounded-s-lg border-4 border-white/80 p-3 text-center shadow-lg"
            style={{ background: `linear-gradient(160deg, white, ${story.color})` }}
          >
            <span className="absolute inset-y-0 start-0 w-2" style={{ background: story.color }} />
            <span className="text-6xl">{story.cover}</span>
            <span className="font-heb text-lg font-black leading-tight text-indigo-950">{story.title}</span>
            <span className="text-sm font-bold text-indigo-900/80">{story.pages.length} עַמּוּדִים</span>
            <Stars n={progress.storyStars?.[story.id] ?? 0} />
          </motion.button>
        ))}
      </section>
    </motion.main>
  )
}
