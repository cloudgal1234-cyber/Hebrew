import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NIKUD, REVIEW, exampleWords, practiceLetters, quizRounds, withSign } from '../data/nikud.js'
import { chunkSay } from '../data/words.js'
import { speak, speakAll, stopSpeech } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'
import Celebration from './Celebration.jsx'
import { CHUNK_COLORS } from './SyllableWord.jsx'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const STEPS = [
  { id: 'meet', icon: '👀', label: 'הַסִּימָן' },
  { id: 'letters', icon: 'אָב', label: 'אוֹתִיּוֹת' },
  { id: 'words', icon: '📖', label: 'מִלִּים' },
  { id: 'quiz', icon: '🎯', label: 'מִשְׂחָק' },
]

/**
 * One nikud lesson: meet the sign(s), hear them on letters, find them in
 * words, then a listening quiz. The review lesson goes straight to the quiz.
 */
export default function NikudLesson({ groupId, onDone, onExit }) {
  const group = groupId === 'review' ? REVIEW : NIKUD.find((g) => g.id === groupId)
  const steps = groupId === 'review' ? STEPS.slice(3) : STEPS
  const [stepIndex, setStepIndex] = useState(0)
  const step = steps[stepIndex]

  useEffect(() => () => stopSpeech(), [])

  const next = () => {
    stopSpeech()
    sfx.pop()
    setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }

  return (
    <motion.main
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col"
      style={{ background: `linear-gradient(180deg, #fffbeb, ${group.color}55)` }}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 bg-violet-900 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 text-white">
        <button
          onClick={onExit}
          aria-label="חֲזָרָה לַנִּקּוּד"
          className="flex size-11 items-center justify-center rounded-full bg-white/15 text-2xl active:scale-90"
        >
          ↩️
        </button>
        <div className="flex flex-col items-center">
          <span className="font-heb text-base font-bold">{group.title}</span>
          <div className="mt-1 flex gap-2">
            {steps.map((s, i) => (
              <span
                key={s.id}
                className={`flex h-8 items-center gap-1 rounded-full px-2 text-sm font-bold ${
                  i < stepIndex ? 'bg-emerald-400' : i === stepIndex ? 'bg-amber-300 text-indigo-950' : 'bg-white/20'
                }`}
              >
                {s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </span>
            ))}
          </div>
        </div>
        <span className="size-11" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            className="flex w-full max-w-2xl flex-1 flex-col items-center"
          >
            {step.id === 'meet' && <MeetStep group={group} onNext={next} />}
            {step.id === 'letters' && <LettersStep group={group} onNext={next} />}
            {step.id === 'words' && <WordsStep group={group} onNext={next} />}
            {step.id === 'quiz' && <QuizStep groupId={groupId} onDone={onDone} onExit={onExit} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.main>
  )
}

function NextButton({ onClick, children = 'מַמְשִׁיכִים ⬅️' }) {
  return (
    <motion.button
      onClick={onClick}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 1.4, repeat: Infinity }}
      className="mt-auto w-full max-w-sm rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95"
    >
      {children}
    </motion.button>
  )
}

// ---------- 1. Meet the sign ----------

function MeetStep({ group, onNext }) {
  const base = group.base ?? 'א'
  const sayOne = (s) =>
    speakAll([`זֶה ${s.name}`, s.looks, `${s.name} אוֹמֵר`, [withSign(base, s.sign).say, { rate: 0.6 }]])

  useEffect(() => {
    const t = setTimeout(() => {
      speakAll([
        ...group.signs.flatMap((s) => [`זֶה ${s.name}`, s.looks]),
        group.signs.length > 1 ? 'שְׁנֵיהֶם אוֹמְרִים' : 'הוּא אוֹמֵר',
        [withSign(base, group.signs[0].sign).say, { rate: 0.6 }],
        ...(group.note ? [group.note] : []),
      ])
    }, 400)
    return () => clearTimeout(t)
  }, [group, base])

  return (
    <>
      <h2 className="font-heb text-2xl font-black text-violet-800 sm:text-3xl">👀 מַכִּירִים אֶת הַסִּימָן</h2>
      <div className="mt-5 flex flex-wrap justify-center gap-4">
        {group.signs.map((s, i) => (
          <motion.button
            key={s.name}
            onClick={() => sayOne(s)}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2 + i * 0.25, type: 'spring', bounce: 0.5 }}
            whileTap={{ scale: 0.94 }}
            className="flex w-44 flex-col items-center rounded-3xl border-4 border-white bg-white/90 p-4 shadow-xl sm:w-56"
          >
            <span className="font-heb text-[clamp(5rem,22vw,8rem)] font-black leading-none" style={{ color: group.color }}>
              {withSign(base, s.sign).text}
            </span>
            <span className="font-heb mt-2 text-2xl font-black text-indigo-950">{s.name}</span>
            <span className="font-heb mt-1 text-sm font-semibold text-stone-600">{s.looks}</span>
            <span className="mt-2 rounded-full bg-violet-100 px-3 py-0.5 text-sm font-bold text-violet-700">🔊 לְהַקְשִׁיב</span>
          </motion.button>
        ))}
      </div>
      <p className="font-heb mt-5 rounded-2xl bg-white/80 px-4 py-2 text-center text-xl font-bold text-indigo-950">
        {group.signs.length > 1 ? 'שְׁנֵיהֶם אוֹמְרִים' : 'הוּא אוֹמֵר'}{' '}
        <span className="text-3xl font-black" style={{ color: group.color }}>
          {group.sound}
        </span>
      </p>
      {group.note && <p className="font-heb mt-3 max-w-md text-center text-base font-semibold text-stone-700">{group.note}</p>}
      <div className="h-6" />
      <NextButton onClick={onNext} />
    </>
  )
}

// ---------- 2. On letters ----------

function LettersStep({ group, onNext }) {
  const letters = useMemo(() => practiceLetters(group), [group])
  const [lit, setLit] = useState(-1)
  const runId = useRef(0)

  async function playAll() {
    const id = ++runId.current
    stopSpeech()
    for (let i = 0; i < letters.length; i++) {
      if (runId.current !== id) return
      setLit(i)
      await speak(letters[i].say, { rate: 0.6, interrupt: false })
      await sleep(250)
    }
    if (runId.current === id) setLit(-1)
  }

  useEffect(() => {
    const t = setTimeout(playAll, 500)
    return () => (clearTimeout(t), runId.current++)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letters])

  return (
    <>
      <h2 className="font-heb text-2xl font-black text-violet-800 sm:text-3xl">🔤 הַסִּימָן עִם אוֹתִיּוֹת</h2>
      <p className="mt-1 text-center font-semibold text-stone-600">לוֹחֲצִים עַל אוֹת כְּדֵי לִשְׁמֹעַ</p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {letters.map((l, i) => (
          <motion.button
            key={l.text}
            onClick={() => (runId.current++, setLit(i), sfx.pop(), speak(l.say, { rate: 0.6 }))}
            animate={{ scale: lit === i ? 1.15 : 1, y: lit === i ? -6 : 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="font-heb flex size-24 items-center justify-center rounded-3xl border-4 text-6xl font-black shadow-lg sm:size-28"
            style={{
              borderColor: lit === i ? group.color : 'white',
              background: lit === i ? '#fef3c7' : 'white',
              color: CHUNK_COLORS[0],
            }}
          >
            {l.text}
          </motion.button>
        ))}
      </div>
      <button
        onClick={playAll}
        className="mt-5 rounded-full bg-violet-500 px-5 py-2.5 text-lg font-bold text-white shadow active:scale-95"
      >
        🔁 שׁוּב
      </button>
      <div className="h-6" />
      <NextButton onClick={onNext} />
    </>
  )
}

// ---------- 3. In words ----------

function WordsStep({ group, onNext }) {
  const words = useMemo(() => exampleWords(group.id), [group])
  const [lit, setLit] = useState(null)

  async function sayWord(w) {
    setLit(w.id)
    sfx.pop()
    await speakAll([[chunkSay(w, 0), { rate: 0.6 }], [w.word, { rate: 0.75 }]])
  }

  useEffect(() => {
    const t = setTimeout(() => speak('מְצָאתֶם אֶת הַסִּימָן בַּמִּלִּים? לַחֲצוּ עַל מִלָּה'), 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <h2 className="font-heb text-2xl font-black text-violet-800 sm:text-3xl">📖 הַסִּימָן בְּתוֹךְ מִלִּים</h2>
      <p className="mt-1 text-center font-semibold text-stone-600">הַהֲבָרָה הָרִאשׁוֹנָה מְסֻמֶּנֶת בְּצָהֹב</p>
      <div className="mt-5 flex w-full flex-col gap-3">
        {words.map((w, i) => (
          <motion.button
            key={w.id}
            onClick={() => sayWord(w)}
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1, scale: lit === w.id ? 1.04 : 1 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center justify-between gap-3 rounded-3xl border-4 bg-white px-5 py-3 shadow-lg"
            style={{ borderColor: lit === w.id ? group.color : 'white' }}
          >
            <span className="font-heb text-[clamp(2.4rem,10vw,3.5rem)] font-black leading-none">
              {w.chunks.map((c, ci) => (
                <span
                  key={ci}
                  className={ci === 0 ? 'rounded-xl bg-amber-200 px-1' : ''}
                  style={{ color: CHUNK_COLORS[ci % CHUNK_COLORS.length] }}
                >
                  {c}
                </span>
              ))}
            </span>
            <span className="text-5xl">{w.emoji}</span>
          </motion.button>
        ))}
      </div>
      <div className="h-6" />
      <NextButton onClick={onNext}>לַמִּשְׂחָק 🎯</NextButton>
    </>
  )
}

// ---------- 4. Listening quiz ----------

function QuizStep({ groupId, onDone, onExit }) {
  const rounds = useMemo(() => quizRounds(groupId), [groupId])
  const [round, setRound] = useState(0)
  const [picked, setPicked] = useState(null) // correct option text once found
  const [shake, setShake] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [stars, setStars] = useState(null)
  const r = rounds[round]

  const ask = () => speakAll(['אֵיזֶה צְלִיל שְׁמַעְתֶּם?', [r.answer.say, { rate: 0.55 }]])

  useEffect(() => {
    setPicked(null)
    const t = setTimeout(ask, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round])

  async function choose(o) {
    if (picked || stars !== null) return
    if (o.text === r.answer.text) {
      setPicked(o.text)
      sfx.success()
      await speak(o.say, { rate: 0.6 })
      await sleep(500)
      if (round + 1 < rounds.length) setRound(round + 1)
      else {
        const n = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1
        setStars(n)
        sfx.fanfare()
        speak(n === 3 ? 'מֻשְׁלָם! שָׁלוֹשׁ כּוֹכָבִים!' : 'כָּל הַכָּבוֹד!')
      }
    } else {
      sfx.bounce()
      setMistakes((m) => m + 1)
      setShake(o.text)
      setTimeout(() => setShake(null), 500)
      await speakAll([`זֶה`, [o.say, { rate: 0.6 }], 'חַפְּשׂוּ אֶת', [r.answer.say, { rate: 0.55 }]])
    }
  }

  if (stars !== null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Celebration />
        <motion.div className="text-7xl" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
          🎉
        </motion.div>
        <h2 className="font-heb mt-2 text-3xl font-black text-violet-800">סִיַּמְתֶּם אֶת הַשִּׁעוּר!</h2>
        <div className="mt-4 flex gap-2 text-6xl">
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
        <button
          onClick={() => onDone(stars)}
          className="mt-8 w-full max-w-sm rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95"
        >
          לְשִׁעוּר הַבָּא ⬅️
        </button>
        <button onClick={onExit} className="mt-3 rounded-full bg-slate-500 px-6 py-2.5 text-lg font-bold text-white shadow active:scale-95">
          ↩️ לְכָל הַשִּׁעוּרִים
        </button>
      </div>
    )
  }

  return (
    <>
      <h2 className="font-heb text-2xl font-black text-violet-800 sm:text-3xl">🎯 מָה שְׁמַעְתֶּם?</h2>
      <p className="mt-1 font-bold text-stone-600">
        {round + 1} / {rounds.length}
      </p>
      <motion.button
        onClick={ask}
        whileTap={{ scale: 0.9 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="mt-4 flex size-24 items-center justify-center rounded-full bg-violet-600 text-5xl text-white shadow-xl"
        aria-label="שְׁמַע שׁוּב"
      >
        🔊
      </motion.button>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {r.options.map((o, i) => (
          <motion.button
            key={`${round}-${o.text}`}
            onClick={() => choose(o)}
            initial={{ y: -80, opacity: 0 }}
            animate={
              shake === o.text
                ? { x: [0, -14, 14, -8, 8, 0], y: 0, opacity: 1 }
                : { y: 0, opacity: picked && picked !== o.text ? 0.3 : 1, scale: picked === o.text ? 1.2 : 1, x: 0 }
            }
            transition={{ delay: shake ? 0 : i * 0.12, type: 'spring', bounce: 0.5 }}
            className="bubble font-heb flex size-28 items-center justify-center rounded-full text-6xl font-black text-indigo-950 sm:size-32"
            style={
              picked === o.text
                ? { '--b1': '#dcfce7', '--b2': '#86efac', '--b3': '#22c55e' }
                : { '--b1': '#fef9c3', '--b2': '#fde047', '--b3': '#f59e0b' }
            }
          >
            {o.text}
          </motion.button>
        ))}
      </div>
    </>
  )
}
