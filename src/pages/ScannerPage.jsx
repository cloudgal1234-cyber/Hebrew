import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import QrScanner from '../components/QrScanner'
import ItemPicker from '../components/ItemPicker'
import LearningAction from '../components/LearningAction'
import Confetti from '../components/Confetti'
import { Btn, Modal, PageHeader } from '../components/ui'
import { resolveItem, itemLabel } from '../data/content'
import { cardNumber, cardId, getMapping, parseCardCode, setMapping, useMappings } from '../lib/storage'
import { speak, speakLetter, speakSequence, speakWord } from '../lib/speech'
import { sfx } from '../lib/sfx'

const REPEAT_MS = 2500 // ignore the same card held in front of the camera

const sayItem = (r) => (r.type === 'letter' ? speakLetter(r.item) : speakWord(r.item))
const sameItem = (a, b) => a && b && a.type === b.type && a.item.id === b.item.id

/**
 * Hybrid scanner game.
 *  - Unmapped card → one-time setup modal ("what does this card represent?").
 *  - Mapped card   → instantly plays its learning action (free play), or is
 *                    checked against the current question (challenge mode).
 */
export default function ScannerPage() {
  const mappings = useMappings()
  const [mode, setMode] = useState('free') // free | challenge
  const [setupFor, setSetupFor] = useState(null) // card id awaiting first-time binding
  const [active, setActive] = useState(null) // { card, resolved }
  const [flash, setFlash] = useState(false)
  const [toast, setToast] = useState('')
  const [manual, setManual] = useState('')
  const lastScan = useRef({ code: null, at: 0 })

  // Challenge state
  const [question, setQuestion] = useState(null) // resolved item to find
  const [score, setScore] = useState(0)
  const [celebrate, setCelebrate] = useState(0)

  const mappedItems = useMemo(() => {
    const seen = new Map()
    for (const m of Object.values(mappings)) {
      const r = resolveItem(m)
      if (r) seen.set(`${r.type}:${r.item.id}`, r)
    }
    return [...seen.values()]
  }, [mappings])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const nextQuestion = useCallback(
    (prev) => {
      if (mappedItems.length < 2) return setQuestion(null)
      let q
      do q = mappedItems[Math.floor(Math.random() * mappedItems.length)]
      while (sameItem(q, prev))
      setQuestion(q)
      setTimeout(() => speakSequence(['מִצְאוּ אֶת הַכַּרְטִיס שֶׁל', itemLabelForSpeech(q)]), 300)
    },
    [mappedItems],
  )

  useEffect(() => {
    if (mode === 'challenge') {
      setActive(null)
      nextQuestion(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Start the challenge as soon as enough cards have been set up.
  useEffect(() => {
    if (mode === 'challenge' && !question && mappedItems.length >= 2) nextQuestion(null)
  }, [mode, question, mappedItems, nextQuestion])

  const runCard = (card, resolved) => {
    if (mode === 'challenge' && question) {
      if (sameItem(resolved, question)) {
        sfx.success()
        setScore((s) => s + 1)
        setCelebrate((c) => c + 1)
        speak('נָכוֹן! כָּל הַכָּבוֹד!').then(() => nextQuestion(question))
      } else {
        sfx.error()
        speakSequence([['זֶה'], itemLabelForSpeech(resolved), ['נַסּוּ שׁוּב']])
      }
      return
    }
    setActive({ card, resolved })
  }

  const handleCode = (raw, { force = false } = {}) => {
    if (setupFor) return // finish the setup first
    const card = parseCardCode(raw)
    const now = Date.now()
    if (!force && lastScan.current.code === (card ?? raw) && now - lastScan.current.at < REPEAT_MS) return
    lastScan.current = { code: card ?? raw, at: now }

    if (!card) {
      sfx.error()
      return showToast('🤔 זה לא אחד מהכרטיסים שלנו')
    }
    sfx.scan()
    setFlash(true)
    setTimeout(() => setFlash(false), 400)

    const resolved = resolveItem(getMapping(card))
    if (!resolved) {
      setSetupFor(card) // first time we see this card
      speak('מָה הַכַּרְטִיס הַזֶּה?')
      return
    }
    runCard(card, resolved)
  }

  const finishSetup = (choice) => {
    const card = setupFor
    setMapping(card, choice)
    setSetupFor(null)
    lastScan.current = { code: card, at: Date.now() }
    sfx.success()
    const resolved = resolveItem(choice)
    // After binding, always show the lesson for the new card right away.
    setActive({ card, resolved })
  }

  const submitManual = (e) => {
    e.preventDefault()
    const n = parseInt(manual, 10)
    if (n > 0) handleCode(cardId(n), { force: true })
    setManual('')
  }

  return (
    <div>
      <PageHeader title="מִשְׂחַק הַסּוֹרֵק" emoji="📷">
        <div className="flex rounded-2xl bg-white/80 p-1 shadow">
          {[
            ['free', '🎈 מִשְׂחָק חָפְשִׁי'],
            ['challenge', '🎯 אֶתְגָּר'],
          ].map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-xl px-3 py-1.5 font-bold ${mode === m ? 'bg-violet-500 text-white' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </PageHeader>

      {celebrate > 0 && <Confetti key={celebrate} />}

      <div className="grid items-start gap-5 lg:grid-cols-[400px_1fr]">
        <div className="flex flex-col gap-3 lg:sticky lg:top-4">
          <QrScanner onScan={handleCode} flash={flash} />
          <form onSubmit={submitManual} className="flex items-center justify-center gap-2 text-sm">
            <label htmlFor="manual" className="font-bold text-indigo-900/70">
              אין מצלמה? מספר כרטיס:
            </label>
            <input
              id="manual"
              inputMode="numeric"
              value={manual}
              onChange={(e) => setManual(e.target.value.replace(/\D/g, ''))}
              className="w-20 rounded-xl border-2 border-violet-200 bg-white px-2 py-1 text-center text-lg"
              placeholder="#"
            />
            <Btn type="submit" variant="ghost" className="py-1">סְרֹק</Btn>
          </form>
          {toast && <div className="animate-pop rounded-2xl bg-rose-100 p-3 text-center text-lg font-bold text-rose-700">{toast}</div>}
        </div>

        <section className="min-h-[300px] rounded-[2rem] bg-white/60 p-4 shadow-lg sm:p-6">
          {mode === 'challenge' ? (
            <Challenge question={question} score={score} enough={mappedItems.length >= 2} onSkip={() => nextQuestion(question)} />
          ) : active ? (
            <div>
              <div className="mb-2 text-center text-sm font-bold text-indigo-900/60">
                כַּרְטִיס #{cardNumber(active.card)}
              </div>
              <LearningAction resolved={active.resolved} />
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
              <div className="animate-float text-8xl">🃏</div>
              <p className="text-3xl font-extrabold">הַרְאוּ כַּרְטִיס לַמַּצְלֵמָה!</p>
              <p className="max-w-sm text-indigo-900/70">
                כרטיס חדש? נבחר יחד מה הוא מייצג – ובפעם הבאה הוא יתחיל לשחק מיד.
              </p>
            </div>
          )}
        </section>
      </div>

      <Modal open={!!setupFor} onClose={() => setSetupFor(null)} title={`✨ כרטיס חדש #${setupFor ? cardNumber(setupFor) : ''}`} wide>
        <p className="mb-3 text-lg font-bold">בַּחֲרוּ מָה הַכַּרְטִיס הַזֶּה מְיַצֵּג:</p>
        <ItemPicker
          onPick={finishSetup}
          usedIds={new Set(Object.values(mappings).map((m) => `${m.type}:${m.id}`))}
        />
      </Modal>
    </div>
  )
}

function itemLabelForSpeech(r) {
  return r.type === 'letter' ? [r.item.name, `letter-${r.item.id}`] : [r.item.text, `word-${r.item.id}`]
}

function Challenge({ question, score, enough, onSkip }) {
  if (!enough)
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center">
        <div className="text-7xl">🃏🃏</div>
        <p className="text-2xl font-extrabold">צריך לפחות 2 כרטיסים מוגדרים</p>
        <p className="text-indigo-900/70">סרקו כרטיסים במשחק החופשי כדי להגדיר אותם, ואז חזרו לאתגר.</p>
      </div>
    )
  if (!question) return null
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-amber-200 px-4 py-1 text-xl font-bold">⭐ {score}</div>
      <p className="text-3xl font-extrabold">מִצְאוּ אֶת הַכַּרְטִיס!</p>
      <button
        onClick={() => sayItem(question)}
        className="animate-float flex h-40 w-40 items-center justify-center rounded-full bg-violet-500 text-7xl text-white shadow-2xl"
        aria-label="השמע שוב"
      >
        🔊
      </button>
      <details key={`${question.type}:${question.item.id}`} className="text-indigo-900/70">
        <summary className="cursor-pointer font-bold">💡 רֶמֶז</summary>
        <div className="font-heb mt-2 text-5xl">
          {question.item.emoji} {itemLabel(question)}
        </div>
      </details>
      <Btn variant="ghost" onClick={onSkip}>⏭ דַּלֵּג</Btn>
    </div>
  )
}
