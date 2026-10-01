import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LETTERS, letterGuide } from '../data/letters.js'
import { speak, speakAll } from '../lib/speech.js'
import { sfx } from '../lib/sfx.js'

const HIT_RADIUS = 9 // grid units (letter grid is 100×100)
const ON_PATH = 13
const DONE_AT = 0.92

/**
 * Trace a Hebrew letter with finger or mouse. The guide fills with gold
 * wherever the child traces along it; drawing far from the path lowers
 * accuracy (and stars) but never blocks finishing.
 */
export default function TracingGame({ letter, onDone }) {
  const info = LETTERS[letter]
  const guide = useMemo(() => letterGuide(letter), [letter])
  const allPts = useMemo(() => guide.flat(), [guide])

  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const [size, setSize] = useState(300)
  const hits = useRef(guide.map((s) => s.map(() => false)))
  const ink = useRef([]) // strokes of [x, y] in grid units
  const inkStats = useRef({ total: 0, onPath: 0 })
  const drawing = useRef(false)
  const demo = useRef(null)
  const [coverage, setCoverage] = useState(0)
  const [stars, setStars] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => speakAll(['עַכְשָׁו נִכְתֹּב אֶת הָאוֹת', info.name, 'מַתְחִילִים בַּנְּקֻדָּה הַיְּרֻקָּה']), 500)
    return () => clearTimeout(t)
  }, [info.name])

  // Responsive square canvas
  useEffect(() => {
    const fit = () => {
      const w = wrapRef.current?.clientWidth ?? 300
      setSize(Math.max(220, Math.min(w, window.innerHeight - 290, 460)))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  const draw = useCallback(() => {
    const cv = canvasRef.current
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    if (cv.width !== size * dpr) {
      cv.width = size * dpr
      cv.height = size * dpr
    }
    const ctx = cv.getContext('2d')
    ctx.setTransform((dpr * size) / 100, 0, 0, (dpr * size) / 100, 0, 0)
    ctx.clearRect(0, 0, 100, 100)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Notebook lines
    ctx.strokeStyle = '#e0e7ff'
    ctx.lineWidth = 0.6
    for (const y of [15, 50, 88]) {
      ctx.beginPath()
      ctx.moveTo(4, y)
      ctx.lineTo(96, y)
      ctx.stroke()
    }

    const path = (pts) => {
      ctx.beginPath()
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    }

    // Wide pale letter body
    ctx.strokeStyle = '#ede9fe'
    ctx.lineWidth = 17
    guide.forEach((s) => (path(s), ctx.stroke()))
    // Dashed centre line
    ctx.setLineDash([2.5, 3])
    ctx.strokeStyle = '#a78bfa'
    ctx.lineWidth = 1.4
    guide.forEach((s) => (path(s), ctx.stroke()))
    ctx.setLineDash([])

    // Gold where traced
    ctx.fillStyle = '#fbbf24'
    guide.forEach((s, si) =>
      s.forEach(([x, y], pi) => {
        if (!hits.current[si][pi]) return
        ctx.beginPath()
        ctx.arc(x, y, 7.5, 0, Math.PI * 2)
        ctx.fill()
      }),
    )

    // Demo trail
    if (demo.current) {
      const upto = Math.floor(demo.current.t * allPts.length)
      let n = 0
      ctx.strokeStyle = '#f472b6'
      ctx.lineWidth = 5
      for (const s of guide) {
        const take = Math.max(0, Math.min(s.length, upto - n))
        if (take > 1) (path(s.slice(0, take)), ctx.stroke())
        n += s.length
      }
      const head = allPts[Math.min(upto, allPts.length - 1)]
      ctx.font = '12px sans-serif'
      ctx.fillText('✏️', head[0] - 2, head[1] - 2)
    }

    // Child's ink
    ctx.strokeStyle = 'rgba(109, 40, 217, 0.85)'
    ctx.lineWidth = 3.5
    ink.current.forEach((s) => {
      if (s.length === 1) {
        ctx.beginPath()
        ctx.arc(s[0][0], s[0][1], 1.75, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(109, 40, 217, 0.85)'
        ctx.fill()
      } else (path(s), ctx.stroke())
    })

    // Numbered start dots + direction arrows for unfinished strokes
    guide.forEach((s, si) => {
      const done = hits.current[si].filter(Boolean).length / s.length > 0.9
      if (done) return
      const [x, y] = s[0]
      const [ax, ay] = s[Math.min(3, s.length - 1)]
      const ang = Math.atan2(ay - y, ax - x)
      ctx.fillStyle = '#16a34a'
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'white'
      ctx.font = 'bold 6px Rubik, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(si + 1), x, y + 0.3)
      // arrow
      ctx.save()
      ctx.translate(x + Math.cos(ang) * 9, y + Math.sin(ang) * 9)
      ctx.rotate(ang)
      ctx.fillStyle = '#16a34a'
      ctx.beginPath()
      ctx.moveTo(3, 0)
      ctx.lineTo(-2, -2.6)
      ctx.lineTo(-2, 2.6)
      ctx.fill()
      ctx.restore()
    })
  }, [size, guide, allPts])

  useEffect(draw, [draw])

  const toGrid = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100]
  }

  function mark([x, y]) {
    let near = Infinity
    guide.forEach((s, si) =>
      s.forEach(([gx, gy], pi) => {
        const d = Math.hypot(gx - x, gy - y)
        if (d < near) near = d
        if (d <= HIT_RADIUS && !hits.current[si][pi]) {
          hits.current[si][pi] = true
        }
      }),
    )
    inkStats.current.total++
    if (near <= ON_PATH) inkStats.current.onPath++
  }

  function addPoint(p) {
    const stroke = ink.current[ink.current.length - 1]
    const prev = stroke[stroke.length - 1]
    // Fill gaps from fast swipes so no checkpoint is skipped
    const steps = prev ? Math.ceil(Math.hypot(p[0] - prev[0], p[1] - prev[1]) / 2) : 1
    for (let i = 1; i <= steps; i++) {
      mark(prev ? [prev[0] + ((p[0] - prev[0]) * i) / steps, prev[1] + ((p[1] - prev[1]) * i) / steps] : p)
    }
    stroke.push(p)
    const covered = hits.current.flat().filter(Boolean).length / allPts.length
    setCoverage(covered)
    draw()
  }

  function down(e) {
    if (stars !== null) return
    e.preventDefault()
    demo.current = null
    canvasRef.current.setPointerCapture?.(e.pointerId)
    drawing.current = true
    ink.current.push([])
    addPoint(toGrid(e))
    sfx.tick()
  }
  function move(e) {
    if (!drawing.current) return
    e.preventDefault()
    addPoint(toGrid(e))
  }
  function up() {
    if (!drawing.current) return
    drawing.current = false
    const covered = hits.current.flat().filter(Boolean).length / allPts.length
    const { total, onPath } = inkStats.current
    const accuracy = total ? onPath / total : 0
    if (covered >= DONE_AT) {
      finish(accuracy >= 0.8 ? 3 : accuracy >= 0.6 ? 2 : 1)
    } else if (total > 120 && accuracy < 0.35) {
      speak('נְנַסֶּה שׁוּב, לְאֹרֶךְ הַקַּו הַמְּקֻוְקָו')
      clear()
    }
  }

  function clear() {
    hits.current = guide.map((s) => s.map(() => false))
    ink.current = []
    inkStats.current = { total: 0, onPath: 0 }
    setCoverage(0)
    draw()
  }

  function finish(n) {
    setStars(n)
    sfx.success()
    speakAll([info.name, n === 3 ? 'מֻשְׁלָם! שָׁלוֹשׁ כּוֹכָבִים!' : 'כָּל הַכָּבוֹד!'])
  }

  function playDemo() {
    if (stars !== null) return
    speak(info.name)
    const start = performance.now()
    const dur = 900 + guide.length * 900
    const run = { t: 0 }
    demo.current = run
    const step = (now) => {
      if (demo.current !== run) return // child started drawing
      run.t = Math.min(1, (now - start) / dur)
      draw()
      if (run.t < 1) requestAnimationFrame(step)
      else
        setTimeout(() => {
          if (demo.current === run) (demo.current = null), draw()
        }, 600)
    }
    requestAnimationFrame(step)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/70 p-3 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex w-full max-w-lg flex-col items-center rounded-[2rem] border-4 border-white bg-gradient-to-b from-sky-50 to-violet-100 p-4 shadow-2xl"
        initial={{ scale: 0.6, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.45 }}
      >
        <div className="flex w-full items-center justify-between">
          <button
            onClick={() => speak(info.name)}
            className="font-heb flex size-16 items-center justify-center rounded-2xl bg-violet-600 text-5xl font-black text-white shadow-lg active:scale-90"
            aria-label={`שְׁמַע: ${info.name}`}
          >
            {letter}
          </button>
          <h2 className="font-heb text-center text-2xl font-black text-violet-800 sm:text-3xl">
            ✏️ כּוֹתְבִים {info.name}
          </h2>
          <span className="size-16" />
        </div>

        {/* progress */}
        <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-white shadow-inner">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-amber-300 to-amber-500"
            animate={{ width: `${Math.min(100, (coverage / DONE_AT) * 100)}%` }}
          />
        </div>

        <div ref={wrapRef} className="mt-3 flex w-full justify-center">
          <canvas
            ref={canvasRef}
            style={{ width: size, height: size, touchAction: 'none' }}
            className="rounded-3xl border-4 border-violet-200 bg-white shadow-inner"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onPointerLeave={up}
          />
        </div>

        {stars === null ? (
          <div className="mt-4 flex gap-3">
            <button onClick={playDemo} className="rounded-full bg-pink-500 px-5 py-3 text-lg font-bold text-white shadow-lg active:scale-95">
              👀 הַדְגָּמָה
            </button>
            <button onClick={clear} className="rounded-full bg-slate-500 px-5 py-3 text-lg font-bold text-white shadow-lg active:scale-95">
              🧽 מְחִיקָה
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="flex gap-2 text-6xl">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2 + i * 0.25, type: 'spring', bounce: 0.6 }}
                  onAnimationStart={() => i < stars && setTimeout(sfx.star, 200 + i * 250)}
                  className={i < stars ? '' : 'opacity-25 grayscale'}
                >
                  ⭐
                </motion.span>
              ))}
            </div>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={() => onDone(stars)}
              className="rounded-full bg-emerald-500 px-8 py-3 text-xl font-black text-white shadow-lg active:scale-95"
            >
              מַמְשִׁיכִים ⬅️
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
