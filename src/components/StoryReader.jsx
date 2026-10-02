import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { STORIES } from '../data/stories.js'
import { speak, speakAll, stopSpeech } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'
import ReadAloud from './ReadAloud.jsx'
import StarsEnd, { starsFor } from './StarsEnd.jsx'

/**
 * A picture book: cover → up to 5 pages (tap words / "read to me") →
 * comprehension questions → stars.
 */
export default function StoryReader({ storyId, onDone, onExit }) {
  const story = STORIES.find((s) => s.id === storyId)
  // page: -1 = cover, 0..n-1 = pages, n = questions
  const [page, setPage] = useState(-1)
  const [dir, setDir] = useState(1)
  const [stars, setStars] = useState(null)
  const n = story.pages.length

  useEffect(() => () => stopSpeech(), [])

  function go(to) {
    stopSpeech()
    sfx.whoosh()
    setDir(to > page ? 1 : -1)
    setPage(to)
  }

  function finish(mistakes) {
    const s = starsFor(mistakes)
    setStars(s)
    sfx.fanfare()
    speak(s === 3 ? 'מֻשְׁלָם! הֲבַנְתֶּם אֶת כָּל הַסִּפּוּר!' : 'כָּל הַכָּבוֹד!')
    onDone(s)
  }

  return (
    <motion.main
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col"
      style={{ background: `linear-gradient(180deg, #fffbeb, ${story.color}66)` }}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 bg-violet-900 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 text-white">
        <button onClick={onExit} aria-label="חֲזָרָה לַסִּפּוּרִים" className="flex size-11 items-center justify-center rounded-full bg-white/15 text-2xl active:scale-90">
          ↩️
        </button>
        <div className="flex flex-col items-center">
          <span className="font-heb text-base font-bold">
            {story.cover} {story.title}
          </span>
          <div className="mt-1 flex gap-1.5">
            {story.pages.map((_, i) => (
              <span key={i} className={`size-3.5 rounded-full ${i < page || page >= n ? 'bg-emerald-400' : i === page ? 'bg-amber-300' : 'bg-white/25'}`} />
            ))}
            <span className={`-mt-1 text-sm ${page >= n ? '' : 'opacity-40'}`}>❓</span>
          </div>
        </div>
        <span className="size-11" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-5" style={{ perspective: 1200 }}>
        {stars !== null ? (
          <StarsEnd title={`סִיַּמְתֶּם אֶת הַסִּפּוּר: ${story.title}`} stars={stars}>
            <button onClick={onExit} className="rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95">
              לְעוֹד סִפּוּרִים ⬅️
            </button>
            <button onClick={() => (setStars(null), go(0))} className="rounded-full bg-violet-500 py-2.5 text-lg font-bold text-white shadow active:scale-95">
              🔁 לִקְרֹא שׁוּב
            </button>
          </StarsEnd>
        ) : (
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={page}
              custom={dir}
              initial={{ rotateY: dir > 0 ? -70 : 70, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: dir > 0 ? 70 : -70, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex w-full max-w-2xl flex-1 flex-col items-center"
            >
              {page === -1 && <Cover story={story} onStart={() => go(0)} />}
              {page >= 0 && page < n && (
                <Page story={story} index={page} onPrev={() => go(page - 1)} onNext={() => go(page + 1)} />
              )}
              {page >= n && <Questions story={story} onFinish={finish} onBack={() => go(n - 1)} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.main>
  )
}

function Cover({ story, onStart }) {
  useEffect(() => {
    const t = setTimeout(() => speak(story.title), 400)
    return () => clearTimeout(t)
  }, [story])
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <div
        className="flex w-full max-w-sm flex-col items-center rounded-e-[2rem] rounded-s-xl border-4 border-white px-6 py-10 shadow-2xl"
        style={{ background: `linear-gradient(160deg, white, ${story.color})` }}
      >
        <motion.span className="text-[8rem] leading-none" animate={{ y: [0, -10, 0], rotate: [0, -4, 4, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
          {story.cover}
        </motion.span>
        <h2 className="font-heb mt-4 text-center text-4xl font-black text-indigo-950">{story.title}</h2>
        <p className="mt-2 font-bold text-indigo-900/80">{story.pages.length} עַמּוּדִים</p>
      </div>
      <motion.button
        onClick={onStart}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="mt-8 w-full max-w-sm rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95"
      >
        📖 מַתְחִילִים לִקְרֹא
      </motion.button>
    </div>
  )
}

function Page({ story, index, onPrev, onNext }) {
  const p = story.pages[index]
  const last = index === story.pages.length - 1
  return (
    <>
      <div className="flex w-full flex-1 flex-col items-center rounded-[2rem] border-4 border-white bg-white/90 px-4 py-5 shadow-xl">
        <motion.div
          className="flex min-h-28 items-center justify-center gap-2 rounded-3xl px-6 py-3 text-[clamp(4rem,18vw,6.5rem)] leading-none"
          style={{ background: `${story.color}33` }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.6, repeat: Infinity }}
        >
          {p.art}
        </motion.div>
        <div className="mt-6">
          <ReadAloud text={p.text} className="text-[clamp(1.9rem,7.5vw,3rem)]" />
        </div>
        <p className="mt-auto pt-4 text-sm font-bold text-stone-500">
          עַמּוּד {index + 1} מִתּוֹךְ {story.pages.length}
        </p>
      </div>
      <div className="mt-4 flex w-full items-center justify-between gap-3">
        <button
          onClick={onNext}
          className="flex-1 rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95"
        >
          {last ? 'לַשְּׁאֵלוֹת ❓' : 'הָעַמּוּד הַבָּא ⬅️'}
        </button>
        {index > 0 && (
          <button onClick={onPrev} aria-label="הָעַמּוּד הַקּוֹדֵם" className="rounded-full bg-slate-400 px-5 py-3 text-xl font-black text-white shadow active:scale-95">
            ➡️
          </button>
        )}
      </div>
    </>
  )
}

function Questions({ story, onFinish, onBack }) {
  const [qi, setQi] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [shake, setShake] = useState(null)
  const [right, setRight] = useState(null)
  const q = story.questions[qi]

  useEffect(() => {
    const t = setTimeout(() => speak(q.q), 400)
    return () => clearTimeout(t)
  }, [q])

  async function choose(i) {
    if (right !== null) return
    if (i === q.answer) {
      setRight(i)
      sfx.success()
      await speakAll(['נָכוֹן!', q.options[i]])
      setRight(null)
      if (qi + 1 < story.questions.length) setQi(qi + 1)
      else onFinish(mistakes)
    } else {
      sfx.bounce()
      setMistakes((m) => m + 1)
      setShake(i)
      setTimeout(() => setShake(null), 500)
      speak('לֹא נָכוֹן. נַסּוּ שׁוּב')
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center">
      <p className="font-bold text-stone-600">
        שְׁאֵלָה {qi + 1} מִתּוֹךְ {story.questions.length}
      </p>
      <AnimatePresence mode="wait">
        <motion.div key={qi} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex w-full flex-col items-center">
          <button
            onClick={() => speak(q.q)}
            className="font-heb mt-3 w-full rounded-[2rem] border-4 border-white bg-white/90 px-4 py-6 text-center text-[clamp(1.8rem,7vw,2.8rem)] font-black text-violet-800 shadow-xl"
          >
            {q.q} <span className="text-2xl">🔊</span>
          </button>
          <div className="mt-6 flex w-full flex-col gap-3">
            {q.options.map((o, i) => (
              <motion.button
                key={o}
                onClick={() => choose(i)}
                animate={shake === i ? { x: [0, -12, 12, -8, 8, 0] } : { scale: right === i ? 1.06 : 1, opacity: right !== null && right !== i ? 0.35 : 1 }}
                transition={{ duration: 0.45 }}
                whileTap={{ scale: 0.95 }}
                className={`font-heb rounded-3xl border-4 py-3 text-[clamp(1.7rem,7vw,2.4rem)] font-black shadow-lg ${
                  right === i ? 'border-emerald-400 bg-emerald-100 text-emerald-800' : 'border-white bg-amber-100 text-indigo-950'
                }`}
              >
                {o}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <button onClick={onBack} className="mt-6 rounded-full bg-slate-400 px-5 py-2 font-bold text-white shadow active:scale-95">
        📖 חֲזָרָה לַסִּפּוּר
      </button>
    </div>
  )
}
