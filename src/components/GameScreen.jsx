import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { distractors } from '../data/words.js'
import { speak, speakAll, stopSpeech } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'
import Bubble, { CHUTES } from './Bubble.jsx'
import ConveyorBelt from './ConveyorBelt.jsx'
import SyllableWord from './SyllableWord.jsx'
import Celebration, { randomCheer } from './Celebration.jsx'
import MatchGame from './MatchGame.jsx'
import ReadingLesson from './ReadingLesson.jsx'
import LevelComplete from './LevelComplete.jsx'

const SPAWN_MS = 1800
const MAX_BUBBLES = 4
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export default function GameScreen({ level, progress, onWordDone, onLevelDone, onNext, onReplay, onExit }) {
  const [wordIndex, setWordIndex] = useState(0)
  const [phase, setPhase] = useState('learn') // learn | play | caught | match | done
  const [bubbles, setBubbles] = useState([])
  const [filled, setFilled] = useState(false)
  const [flyer, setFlyer] = useState(null)
  const [cheer, setCheer] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [hintPulse, setHintPulse] = useState(0)
  const [levelScore, setLevelScore] = useState(0)
  const [bonusStars, setBonusStars] = useState(0)
  const [floor, setFloor] = useState(0)

  const word = level.words[wordIndex]
  const target = word
  const wrongOnes = useMemo(() => distractors(word), [word])

  const arenaRef = useRef(null)
  const slotRef = useRef(null)
  const nextId = useRef(1)
  const sinceCorrect = useRef(0)
  const lastChute = useRef(-1)
  const alive = useRef(true)
  const landedFor = useRef(null)
  const bubblesRef = useRef(bubbles)
  bubblesRef.current = bubbles
  useEffect(() => {
    alive.current = true
    return () => ((alive.current = false), stopSpeech())
  }, [])

  // Arena height → where bubbles stop falling
  useEffect(() => {
    const el = arenaRef.current
    const ro = new ResizeObserver(() => setFloor(el.clientHeight - 30))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Reset for each new word (the reading lesson opens first)
  useEffect(() => {
    setFilled(false)
    setMistakes(0)
    setBubbles([])
    sinceCorrect.current = 0
  }, [word])

  function lessonDone() {
    setPhase('play')
    speakAll(['חַפְּשׂוּ אֶת הַמִּלָּה', [word.word, { rate: 0.75 }]])
  }

  function openLesson() {
    if (phase !== 'play') return
    stopSpeech()
    setPhase('learn')
  }

  // Bubble factory: keeps dropping word bubbles; the right word shows up often
  useEffect(() => {
    if (phase !== 'play' || !floor) return
    const spawn = () => {
      if (bubblesRef.current.filter((b) => b.state === 'falling').length >= MAX_BUBBLES) return
      const giveCorrect = sinceCorrect.current >= 2 || Math.random() < 0.3
      sinceCorrect.current = giveCorrect ? 0 : sinceCorrect.current + 1
      const item = giveCorrect ? target : wrongOnes[Math.floor(Math.random() * wrongOnes.length)]
      let chute
      do chute = Math.floor(Math.random() * CHUTES)
      while (chute === lastChute.current)
      lastChute.current = chute
      const bubble = { id: nextId.current++, item, chute, state: 'falling' }
      setBubbles((bs) => [...bs, bubble])
    }
    const first = setTimeout(spawn, 400)
    const iv = setInterval(spawn, SPAWN_MS)
    return () => (clearTimeout(first), clearInterval(iv))
  }, [phase, floor, target, wrongOnes])

  const removeBubble = useCallback((id) => setBubbles((bs) => bs.filter((b) => b.id !== id)), [])

  async function handleTap(bubble, rect) {
    if (phase !== 'play') return
    sfx.pop()
    if (bubble.item.id === target.id) {
      // Correct: fly into the slot
      setPhase('caught')
      sfx.whoosh()
      speak(bubble.item.word, { rate: 0.75 })
      const to = slotRef.current?.getBoundingClientRect()
      setBubbles((bs) => bs.map((b) => (b.id === bubble.id ? { ...b, state: 'caught' } : b.state === 'falling' ? { ...b, state: 'wrong' } : b)))
      setFlyer({ item: bubble.item, from: rect, to })
    } else {
      // Wrong: soft bounce, float away, helpful hint
      sfx.bounce()
      setMistakes((m) => m + 1)
      setHintPulse((n) => n + 1)
      setBubbles((bs) => bs.map((b) => (b.id === bubble.id ? { ...b, state: 'wrong' } : b)))
      await speakAll([
        [bubble.item.word, { rate: 0.75 }],
        'זֹאת לֹא הַמִּלָּה. חַפְּשׂוּ אֶת',
        [target.word, { rate: 0.75 }],
      ])
    }
  }

  async function landed() {
    // Guard: the flight's completion callback can fire more than once.
    if (landedFor.current === word.id) return
    landedFor.current = word.id
    setFlyer(null)
    setFilled(true)
    sfx.success()
    const points = 10 + (mistakes === 0 ? 5 : 0)
    setLevelScore((s) => s + points)
    onWordDone(word.id, points)
    const c = randomCheer()
    setCheer(c)
    await sleep(900)
    await speak(c)
    await sleep(600)
    if (!alive.current) return
    setCheer(null)
    if (wordIndex + 1 < level.words.length) {
      setWordIndex(wordIndex + 1)
      setPhase('learn')
    } else {
      setPhase('match')
    }
  }

  function matched(stars) {
    setBonusStars(stars)
    onLevelDone(level.id, stars)
    setPhase('done')
    sfx.fanfare()
  }

  const sayWord = () => speak(word.word, { rate: 0.75 })

  return (
    <motion.main
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col"
    >
      {/* Top bar */}
      <header className="z-20 flex shrink-0 items-center justify-between gap-2 bg-violet-900 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 text-white">
        <button
          onClick={onExit}
          aria-label="חֲזָרָה לַתַּפְרִיט"
          className="flex size-11 items-center justify-center rounded-full bg-white/15 text-2xl active:scale-90"
        >
          🏠
        </button>
        <div className="flex flex-col items-center">
          <span className="font-heb text-sm font-bold opacity-80 sm:text-base">
            שָׁלָב {level.id} · {level.name}
          </span>
          <div className="mt-1 flex gap-2">
            {level.words.map((w, i) => (
              <motion.span
                key={w.id}
                animate={{ scale: i === wordIndex && phase === 'play' ? [1, 1.25, 1] : 1 }}
                transition={{ duration: 1, repeat: i === wordIndex ? Infinity : 0 }}
                className={`flex size-8 items-center justify-center rounded-full text-lg ${
                  i < wordIndex || (i === wordIndex && filled) || phase === 'match' || phase === 'done'
                    ? 'bg-emerald-400'
                    : i === wordIndex
                      ? 'bg-amber-300'
                      : 'bg-white/20'
                }`}
              >
                {i < wordIndex || (i === wordIndex && filled) ? w.emoji : '❓'}
              </motion.span>
            ))}
            <span className={`flex size-8 items-center justify-center rounded-full text-lg ${phase === 'match' ? 'bg-amber-300' : 'bg-white/20'}`}>
              🧩
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-lg font-extrabold">
          🏆 <span>{progress.score}</span>
        </div>
      </header>

      {/* Factory floor with chutes and falling bubbles */}
      <div ref={arenaRef} className="factory-bg relative min-h-0 flex-1 overflow-hidden">
        <span className="spin-slow pointer-events-none absolute -left-10 bottom-6 text-[9rem] opacity-15">⚙️</span>
        <span className="spin-rev pointer-events-none absolute -right-8 top-1/3 text-[7rem] opacity-15">⚙️</span>

        <div className="absolute inset-x-0 top-0 z-20 flex">
          {Array.from({ length: CHUTES }, (_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center">
              <div className="chute h-6 w-[62%] max-w-28 rounded-b-md border-x-4 border-b-4 border-slate-500 shadow-md" />
              <div className="chute -mt-1 h-3 w-[72%] max-w-32 rounded-b-2xl border-4 border-t-0 border-slate-600" />
            </div>
          ))}
        </div>

        {floor > 0 &&
          bubbles.map((b) => (
            <Bubble
              key={b.id}
              bubble={b}
              floor={floor}
              fall={level.fall}
              glow={mistakes >= 3 && b.item.id === target.id}
              onTap={handleTap}
              onGone={removeBubble}
            />
          ))}

        <button
          onClick={openLesson}
          className="absolute bottom-3 left-3 z-20 flex items-center gap-1 rounded-full bg-white/90 px-3 py-2 font-bold text-violet-700 shadow-lg active:scale-95"
        >
          📖 אֵיךְ קוֹרְאִים?
        </button>
      </div>

      <ConveyorBelt
        ref={slotRef}
        word={word}
        filled={filled}
        hintPulse={hintPulse}
        onSayWord={sayWord}
        onSlotTap={openLesson}
      />

      {/* Bubble flying into the slot */}
      {flyer && flyer.to && (
        <motion.div
          className="bubble font-heb pointer-events-none fixed z-50 flex items-center justify-center rounded-full font-black whitespace-nowrap text-indigo-950"
          style={{
            left: flyer.from.left,
            top: flyer.from.top,
            width: flyer.from.width,
            height: flyer.from.height,
            fontSize: flyer.from.height * 0.4,
            '--b1': '#fef9c3',
            '--b2': '#fde047',
            '--b3': '#f59e0b',
          }}
          initial={{ x: 0, y: 0, scale: 1 }}
          animate={{
            x: [0, (flyer.to.left + flyer.to.width / 2 - (flyer.from.left + flyer.from.width / 2)) * 0.5, flyer.to.left + flyer.to.width / 2 - (flyer.from.left + flyer.from.width / 2)],
            y: [0, -80, flyer.to.top + flyer.to.height / 2 - (flyer.from.top + flyer.from.height / 2)],
            scale: [1, 1.3, 0.9],
            rotate: [0, -10, 0],
          }}
          transition={{ duration: 0.85, ease: 'easeInOut' }}
          onAnimationComplete={landed}
        >
          <SyllableWord word={flyer.item} />
        </motion.div>
      )}
      {/* Slot not measurable (should not happen) – land immediately */}
      {flyer && !flyer.to && <AutoLand onLand={landed} />}

      <AnimatePresence>{cheer && <Celebration key={`cheer-${word.id}`} cheer={cheer} />}</AnimatePresence>

      <AnimatePresence>
        {phase === 'learn' && <ReadingLesson key={`learn-${word.id}`} word={word} onDone={lessonDone} />}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'match' && <MatchGame key="match" words={level.words} onDone={matched} />}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'done' && (
          <LevelComplete
            key="done"
            level={level}
            stars={bonusStars}
            score={levelScore}
            onNext={onNext}
            onReplay={onReplay}
            onHome={onExit}
          />
        )}
      </AnimatePresence>
    </motion.main>
  )
}

function AutoLand({ onLand }) {
  useEffect(() => {
    onLand()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
