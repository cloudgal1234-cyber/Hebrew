import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SENTENCE_SETS } from '../data/stories.js'
import { shuffle } from '../data/words.js'
import { speak, stopSpeech } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'
import ReadAloud from './ReadAloud.jsx'
import Celebration from './Celebration.jsx'
import { starsFor } from './StarsEnd.jsx'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const YES = ['יֵשׁ! בְּדִיּוּק! 😄', 'נָכוֹן! אַתֶּם קוֹרְאִים מְצֻיָּן 🌟', 'אֵיזֶה כֵּיף, הֲבַנְתֶּם אוֹתִי! 💜', 'כֵּן! זֶה בְּדִיּוּק מָה שֶׁכָּתַבְתִּי 🎉']
const NO = ['הֶמְמ… זֶה לֹא מָה שֶׁכָּתַבְתִּי 🤔', 'לֹא בְּדִיּוּק. תִּקְרְאוּ שׁוּב? 😊', 'אוּפְּס! נַסּוּ עוֹד פַּעַם 🙈']
const NEXT = ['וְעַכְשָׁו עוֹד הוֹדָעָה:', 'הִנֵּה עוֹד אַחַת:', 'קִרְאוּ אֶת זֶה:']

/**
 * Sentence reading as a chat with an animal friend: the friend "types" and
 * sends a sentence, the child reads it and answers with the matching sticker,
 * and the friend reacts. Five messages per friend.
 */
export default function ChatSet({ setId, onDone, onExit }) {
  const set = SENTENCE_SETS.find((s) => s.id === setId)
  const { friend } = set
  const g = (he, she) => (friend.she ? she : he) // verb gender for the friend
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const [index, setIndex] = useState(-1) // sentence waiting for a reply
  const [busy, setBusy] = useState(true)
  const [mistakes, setMistakes] = useState(0)
  const [stars, setStars] = useState(null)
  const listRef = useRef(null)
  const alive = useRef(true)
  const nextId = useRef(1)

  const sentence = index >= 0 ? set.sentences[index] : null
  const stickers = useMemo(() => (sentence ? shuffle([sentence.pic, ...sentence.wrong]) : []), [sentence])

  const add = (m) => {
    const id = nextId.current++ // outside the updater: StrictMode runs updaters twice
    setMessages((ms) => [...ms, { id, ...m }])
    return id
  }

  // Friend types, then sends (and says) a message
  async function friendSays(text, { kind = 'text', speakIt = true } = {}) {
    setTyping(true)
    await sleep(700 + Math.min(text.length, 40) * 15)
    if (!alive.current) return
    setTyping(false)
    sfx.pop()
    add({ from: 'friend', kind, text })
    if (speakIt) await speak(text, { pitch: friend.pitch, rate: 0.85 })
  }

  async function sendSentence(i) {
    await friendSays(set.sentences[i].text, { kind: 'sentence', speakIt: false })
    if (!alive.current) return
    setIndex(i)
    setBusy(false)
  }

  const started = useRef(false)
  useEffect(() => {
    alive.current = true
    if (started.current) return // StrictMode re-runs effects; start the chat once
    started.current = true
    ;(async () => {
      await sleep(400)
      await friendSays(`שָׁלוֹם! אֲנִי ${friend.name} ${friend.avatar}`)
      await friendSays(`אֲנִי ${g('שׁוֹלֵחַ', 'שׁוֹלַחַת')} לָכֶם הוֹדָעוֹת. תִּקְרְאוּ וְתַעֲנוּ לִי בְּמַדְבֵּקָה! 💬`)
      await sendSentence(0)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(
    () => () => {
      alive.current = false
      stopSpeech()
    },
    [],
  )

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, index])

  async function reply(pic) {
    if (busy || !sentence) return
    setBusy(true)
    sfx.whoosh()
    const ok = pic === sentence.pic
    const id = add({ from: 'me', kind: 'sticker', text: pic })
    await sleep(500)
    if (ok) {
      sfx.success()
      setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, reaction: '❤️' } : m)))
      await friendSays(pick(YES))
      if (index + 1 < set.sentences.length) {
        await friendSays(pick(NEXT), { speakIt: false })
        await sendSentence(index + 1)
      } else {
        setIndex(-1)
        await friendSays('תּוֹדָה שֶׁדִּבַּרְתֶּם אִתִּי! אַתֶּם חֲבֵרִים מְעֻלִּים 🤗')
        const n = starsFor(mistakes)
        setStars(n)
        sfx.fanfare()
        onDone(n)
      }
    } else {
      sfx.bounce()
      setMistakes((m) => m + 1)
      setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, reaction: '🤔' } : m)))
      await friendSays(pick(NO))
      setBusy(false)
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="flex h-full flex-col bg-[#efe7dd]"
      style={{ backgroundImage: `radial-gradient(${set.color}33 1.5px, transparent 1.5px)`, backgroundSize: '22px 22px' }}
    >
      {/* Chat header */}
      <header className="flex shrink-0 items-center gap-3 bg-emerald-700 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 text-white shadow">
        <button onClick={onExit} aria-label="חֲזָרָה" className="flex size-10 items-center justify-center rounded-full text-2xl active:scale-90">
          ➡️
        </button>
        <span className="flex size-12 items-center justify-center rounded-full text-3xl" style={{ background: set.color }}>
          {friend.avatar}
        </span>
        <div className="flex flex-col">
          <span className="font-heb text-xl font-black leading-tight">{friend.name}</span>
          <span className="text-sm opacity-90">{typing ? g('מַקְלִיד…', 'מַקְלִידָה…') : g('מְחֻבָּר', 'מְחֻבֶּרֶת')}</span>
        </div>
        <div className="ms-auto flex gap-1">
          {set.sentences.map((_, i) => (
            <span key={i} className={`size-3 rounded-full ${i < index || stars !== null ? 'bg-amber-300' : i === index ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
      </header>

      {/* Messages */}
      <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-4">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-end gap-2 ${m.from === 'friend' ? 'justify-start' : 'justify-end'}`}
            >
              {m.from === 'friend' && <span className="text-3xl">{friend.avatar}</span>}
              <div
                className={`relative max-w-[85%] rounded-3xl px-4 py-2 shadow ${
                  m.from === 'friend' ? 'rounded-ee-md bg-white' : 'rounded-es-md bg-emerald-100'
                } ${m.kind === 'sentence' ? 'border-4 border-amber-300 py-4' : ''}`}
              >
                {m.kind === 'sentence' ? (
                  <ReadAloud text={m.text} compact className="text-[clamp(1.8rem,7.5vw,2.8rem)]" />
                ) : m.kind === 'sticker' ? (
                  <span className="text-6xl">{m.text}</span>
                ) : (
                  <button
                    onClick={() => speak(m.text, { pitch: friend.pitch, rate: 0.85 })}
                    className="font-heb text-start text-xl font-bold text-indigo-950"
                  >
                    {m.text}
                  </button>
                )}
                {m.reaction && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.6, 1] }}
                    className="absolute -bottom-3 start-2 rounded-full bg-white px-1 text-xl shadow"
                  >
                    {m.reaction}
                  </motion.span>
                )}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-end gap-2">
              <span className="text-3xl">{friend.avatar}</span>
              <span className="flex gap-1 rounded-3xl rounded-ee-md bg-white px-4 py-4 shadow">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="size-2.5 rounded-full bg-stone-400"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reply bar */}
      <div className="shrink-0 border-t border-black/10 bg-white/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {stars !== null ? (
          <div className="flex flex-col items-center gap-2">
            <Celebration />
            <div className="flex items-center gap-3">
              <span className="font-heb text-lg font-black text-violet-800">{friend.name} {g('נוֹתֵן', 'נוֹתֶנֶת')} לָכֶם:</span>
              <span className="text-4xl">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={i < stars ? '' : 'opacity-25 grayscale'}>
                    ⭐
                  </span>
                ))}
              </span>
            </div>
            <button onClick={onExit} className="w-full max-w-sm rounded-full bg-emerald-500 py-3 text-xl font-black text-white shadow-lg active:scale-95">
              לְעוֹד חֲבֵרִים ⬅️
            </button>
          </div>
        ) : (
          <>
            <p className="font-heb text-center text-base font-bold text-stone-600">
              {busy ? `${friend.name} ${g('כּוֹתֵב', 'כּוֹתֶבֶת')}…` : 'קִרְאוּ אֶת הַהוֹדָעָה וּשְׁלְחוּ אֶת הַמַּדְבֵּקָה הַמַּתְאִימָה 👇'}
            </p>
            <div className="mt-2 flex justify-center gap-3">
              {(stickers.length ? stickers : ['❔', '❔', '❔']).map((p, i) => (
                <motion.button
                  key={`${index}-${p}-${i}`}
                  onClick={() => reply(p)}
                  disabled={busy}
                  whileTap={{ scale: 0.85 }}
                  animate={{ opacity: busy ? 0.4 : 1, y: busy ? 4 : 0 }}
                  className="flex size-20 items-center justify-center rounded-2xl border-4 border-emerald-200 bg-white text-5xl shadow sm:size-24"
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </div>
    </motion.main>
  )
}
