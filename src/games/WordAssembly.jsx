import { useEffect, useMemo, useRef, useState } from 'react'
import Confetti from '../components/Confetti'
import { Btn } from '../components/ui'
import { splitGraphemes } from '../data/content'
import { speak, speakWord } from '../lib/speech'
import { sfx } from '../lib/sfx'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  // Avoid handing over the answer already in order.
  return a.length > 1 && a.every((x, i) => x === arr[i]) ? shuffle(arr) : a
}

/**
 * Drag-and-drop word building. Tiles are letter+niqqud graphemes; the child
 * drags them (or taps them) into the slots, filled right-to-left.
 * Uses pointer events so it works with touch, mouse and pen alike.
 */
export default function WordAssembly({ word, onDone }) {
  const parts = useMemo(() => splitGraphemes(word.text), [word])
  const [tiles, setTiles] = useState([]) // [{ key, text, slot: number|null }]
  const [shake, setShake] = useState(null)
  const [done, setDone] = useState(false)
  const [drag, setDrag] = useState(null) // { key, x, y, dx, dy }
  const doneRef = useRef(false)

  useEffect(() => {
    setTiles(shuffle(parts.map((text, i) => ({ key: `${i}-${text}`, text, slot: null }))))
    setDone(false)
    doneRef.current = false
    const t = setTimeout(() => speakWord(word), 300)
    return () => clearTimeout(t)
  }, [parts, word])

  const slotContent = (i) => tiles.find((t) => t.slot === i)

  const place = (key, slot) => {
    const tile = tiles.find((t) => t.key === key)
    if (!tile || slotContent(slot)) return false
    if (tile.text !== parts[slot]) {
      sfx.error()
      setShake(slot)
      setTimeout(() => setShake(null), 500)
      return false
    }
    sfx.pop()
    speak(tile.text, { rate: 0.7 })
    const next = tiles.map((t) => (t.key === key ? { ...t, slot } : t))
    setTiles(next)
    if (next.every((t) => t.slot !== null) && !doneRef.current) {
      doneRef.current = true
      setDone(true)
      setTimeout(() => {
        sfx.success()
        speakWord(word)
        onDone?.()
      }, 400)
    }
    return true
  }

  // Tap a tile → it tries the first empty slot (right-to-left reading order).
  const tapTile = (key) => {
    const first = parts.findIndex((_, i) => !slotContent(i))
    if (first >= 0) place(key, first)
  }

  const dragRef = useRef(null)
  const onPointerDown = (e, tile) => {
    e.preventDefault()
    const r = e.currentTarget.getBoundingClientRect()
    const d = { key: tile.key, text: tile.text, x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, moved: false }
    dragRef.current = d
    setDrag(d)
  }

  useEffect(() => {
    if (!drag) return
    const move = (e) => {
      const d = dragRef.current
      if (!d) return
      const next = { ...d, x: e.clientX, y: e.clientY, moved: d.moved || Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 8 }
      dragRef.current = next
      setDrag(next)
    }
    const up = (e) => {
      const d = dragRef.current
      dragRef.current = null
      setDrag(null)
      if (!d) return
      if (!d.moved) return tapTile(d.key)
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-slot]')
      if (el) place(d.key, Number(el.dataset.slot))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    // Re-bind only when a drag starts/ends or the tiles change (place() reads them).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.key, tiles])

  return (
    <div className="flex flex-col items-center gap-5 select-none">
      {done && <Confetti key={word.id} />}
      <button onClick={() => speakWord(word)} className={`text-8xl ${done ? 'animate-pop' : 'animate-float'}`} aria-label="השמע מילה">
        {word.emoji}
      </button>

      {/* Slots: dir=rtl so slot 0 is on the right, matching reading direction. */}
      <div className="flex flex-wrap justify-center gap-2" dir="rtl">
        {parts.map((p, i) => {
          const t = slotContent(i)
          return (
            <div
              key={i}
              data-slot={i}
              className={`font-heb flex h-24 w-20 items-center justify-center rounded-2xl border-4 border-dashed text-6xl font-bold sm:h-28 sm:w-24 ${
                t ? 'border-emerald-400 bg-emerald-50' : 'border-violet-300 bg-white/70'
              } ${shake === i ? 'animate-wiggle border-rose-400' : ''}`}
            >
              {t ? <span className="animate-pop">{t.text}</span> : null}
            </div>
          )
        })}
      </div>

      {done ? (
        <p className="font-heb animate-pop text-5xl font-black text-emerald-600">{word.text}</p>
      ) : (
        <p className="text-lg font-bold text-indigo-900/70">גִּרְרוּ אוֹ הַקִּישׁוּ עַל הָאוֹתִיּוֹת 👇</p>
      )}

      <div className="flex min-h-28 flex-wrap justify-center gap-3">
        {tiles
          .filter((t) => t.slot === null)
          .map((t) => (
            <button
              key={t.key}
              onPointerDown={(e) => onPointerDown(e, t)}
              className={`font-heb h-24 w-20 touch-none rounded-2xl bg-gradient-to-b from-amber-200 to-amber-400 text-6xl font-bold shadow-lg sm:h-28 sm:w-24 ${
                drag?.key === t.key ? 'opacity-30' : 'hover:-translate-y-1'
              }`}
            >
              {t.text}
            </button>
          ))}
      </div>

      {drag?.moved && (
        <div
          className="font-heb pointer-events-none fixed z-50 flex h-24 w-20 items-center justify-center rounded-2xl bg-amber-300 text-6xl font-bold shadow-2xl sm:h-28 sm:w-24"
          style={{ left: drag.x - drag.dx, top: drag.y - drag.dy, transform: 'rotate(-6deg) scale(1.1)' }}
        >
          {drag.text}
        </div>
      )}

      <div className="flex gap-2">
        <Btn variant="ghost" onClick={() => speakWord(word)}>🔊 שְׁמַע</Btn>
        <Btn
          variant="warn"
          onClick={() => {
            setTiles((ts) => shuffle(ts.map((t) => ({ ...t, slot: null }))))
            setDone(false)
            doneRef.current = false
          }}
        >
          🔄 מֵחָדָשׁ
        </Btn>
      </div>
    </div>
  )
}
