import { useCallback, useEffect, useRef, useState } from 'react'
import Confetti from '../components/Confetti'
import { Btn } from '../components/ui'
import { speakLetter, speak } from '../lib/speech'
import { sfx } from '../lib/sfx'

const SIZE = 500 // internal canvas resolution (CSS scales it)
const BRUSH = 34
const STEP = 5 // sampling grid for coverage checks
const FONT = (px) => `900 ${px}px "Noto Sans Hebrew", "Rubik", sans-serif`
const BRUSH_COLORS = ['#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']

function drawGlyph(ctx, char, { fill, stroke, dashed, widen = 0 }) {
  ctx.save()
  ctx.font = FONT(360)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const x = SIZE / 2
  const y = SIZE / 2 + 20
  if (fill) {
    ctx.fillStyle = fill
    ctx.fillText(char, x, y)
  }
  if (widen) {
    ctx.lineJoin = 'round'
    ctx.lineWidth = widen
    ctx.strokeStyle = fill
    ctx.strokeText(char, x, y)
  }
  if (stroke) {
    ctx.setLineDash(dashed ? [14, 12] : [])
    ctx.lineWidth = 4
    ctx.strokeStyle = stroke
    ctx.strokeText(char, x, y)
  }
  ctx.restore()
}

/** Collect the sample points that belong to the letter shape. */
function sampleMask(char, widen) {
  const c = document.createElement('canvas')
  c.width = c.height = SIZE
  const ctx = c.getContext('2d', { willReadFrequently: true })
  drawGlyph(ctx, char, { fill: '#000', widen })
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE)
  const inside = new Uint8Array((SIZE / STEP) ** 2)
  for (let gy = 0; gy < SIZE / STEP; gy++)
    for (let gx = 0; gx < SIZE / STEP; gx++)
      inside[gy * (SIZE / STEP) + gx] = data[(gy * STEP * SIZE + gx * STEP) * 4 + 3] > 128 ? 1 : 0
  return inside
}

/**
 * Letter tracing: the child paints over a faint, dashed letter with a finger.
 * When enough of the letter is covered (without scribbling everywhere) it celebrates.
 */
export default function TracingCanvas({ letter, onDone }) {
  const guideRef = useRef(null)
  const drawRef = useRef(null)
  const masks = useRef(null)
  const drawing = useRef(false)
  const last = useRef(null)
  const [color, setColor] = useState(BRUSH_COLORS[0])
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [hint, setHint] = useState('')

  const clear = useCallback(() => {
    drawRef.current.getContext('2d').clearRect(0, 0, SIZE, SIZE)
    setProgress(0)
    setDone(false)
    setHint('')
  }, [])

  useEffect(() => {
    let cancelled = false
    clear()
    document.fonts.load(FONT(360), letter.char).finally(() => {
      if (cancelled) return
      const g = guideRef.current.getContext('2d')
      g.clearRect(0, 0, SIZE, SIZE)
      // Notebook-style guide lines.
      g.strokeStyle = '#e0e7ff'
      g.lineWidth = 3
      for (const y of [110, 400]) {
        g.beginPath()
        g.moveTo(20, y)
        g.lineTo(SIZE - 20, y)
        g.stroke()
      }
      drawGlyph(g, letter.char, { fill: '#ede9fe', stroke: '#a78bfa', dashed: true })
      masks.current = { core: sampleMask(letter.char, 0), loose: sampleMask(letter.char, BRUSH) }
    })
    return () => {
      cancelled = true
    }
  }, [letter, clear])

  const pos = (e) => {
    const r = drawRef.current.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE }
  }

  const stroke = (from, to) => {
    const ctx = drawRef.current.getContext('2d')
    ctx.strokeStyle = color
    ctx.lineWidth = BRUSH
    ctx.lineCap = ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
  }

  const evaluate = () => {
    if (!masks.current || done) return
    const { data } = drawRef.current.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, SIZE, SIZE)
    const { core, loose } = masks.current
    let target = 0
    let covered = 0
    let painted = 0
    let outside = 0
    const n = SIZE / STEP
    for (let gy = 0; gy < n; gy++)
      for (let gx = 0; gx < n; gx++) {
        const i = gy * n + gx
        const ink = data[(gy * STEP * SIZE + gx * STEP) * 4 + 3] > 0
        if (core[i]) {
          target++
          if (ink) covered++
        }
        if (ink) {
          painted++
          if (!loose[i]) outside++
        }
      }
    const cov = target ? covered / target : 0
    const messy = painted ? outside / painted : 0
    setProgress(Math.round(cov * 100))
    if (cov >= 0.72 && messy < 0.2) {
      setDone(true)
      setHint('')
      sfx.success()
      speak('כָּל הַכָּבוֹד!')
      onDone?.()
    } else if (messy >= 0.2 && painted > 200) {
      setHint('נַסּוּ לִצְבֹּעַ רַק בְּתוֹךְ הָאוֹת 🙂')
    }
  }

  const onDown = (e) => {
    e.preventDefault()
    drawRef.current.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pos(e)
    stroke(last.current, last.current)
  }
  const onMove = (e) => {
    if (!drawing.current) return
    const p = pos(e)
    stroke(last.current, p)
    last.current = p
  }
  const onUp = () => {
    if (!drawing.current) return
    drawing.current = false
    evaluate()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {done && <Confetti key={letter.id} />}
      <div className="relative w-full max-w-[440px]">
        <canvas ref={guideRef} width={SIZE} height={SIZE} className="block w-full rounded-3xl bg-white shadow-inner" />
        <canvas
          ref={drawRef}
          width={SIZE}
          height={SIZE}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
          aria-label={`ציור האות ${letter.char}`}
        />
        {done && (
          <div className="animate-pop pointer-events-none absolute inset-0 flex items-center justify-center text-8xl">🌟</div>
        )}
      </div>

      <div className="h-4 w-full max-w-[440px] overflow-hidden rounded-full bg-white/70">
        <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.min(100, (progress / 72) * 100)}%` }} />
      </div>
      {hint && <p className="font-heb text-lg font-bold text-rose-600">{hint}</p>}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {BRUSH_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`h-10 w-10 rounded-full border-4 shadow ${color === c ? 'border-indigo-950 scale-110' : 'border-white'}`}
            style={{ background: c }}
            aria-label="צבע"
          />
        ))}
        <Btn variant="ghost" onClick={() => speakLetter(letter)}>🔊 שְׁמַע</Btn>
        <Btn variant="warn" onClick={clear}>🧽 מְחַק</Btn>
      </div>
    </div>
  )
}
