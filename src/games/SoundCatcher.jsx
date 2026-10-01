import { useCallback, useEffect, useRef, useState } from 'react'
import Confetti from '../components/Confetti'
import { Btn } from '../components/ui'
import { LETTERS } from '../data/content'
import { speak, speakSequence } from '../lib/speech'
import { sfx } from '../lib/sfx'

const GOAL = 8 // catches per level
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

/**
 * Sound Catcher: a letter's name is spoken, letters rain down, and the child
 * taps every falling copy of the letter they heard. Gentle: wrong taps only wiggle.
 */
export default function SoundCatcher({ pool = LETTERS }) {
  const [state, setState] = useState('intro') // intro | playing | levelup
  const [level, setLevel] = useState(1)
  const [target, setTarget] = useState(() => pick(pool))
  const [caught, setCaught] = useState(0)
  const [, setFrame] = useState(0)
  const items = useRef([])
  const nextId = useRef(0)
  const raf = useRef(0)
  const lastSpawn = useRef(0)
  const lastT = useRef(0)

  const announce = useCallback((l) => speakSequence(['תִּפְסוּ אֶת הָאוֹת', [l.name, `letter-${l.id}`]]), [])

  const startLevel = (lvl, l = pick(pool)) => {
    items.current = []
    setTarget(l)
    setCaught(0)
    setLevel(lvl)
    setState('playing')
    announce(l)
  }

  // Animation loop.
  useEffect(() => {
    if (state !== 'playing') return
    const speed = 9 + level * 2.5 // % of height per second
    const spawnEvery = Math.max(650, 1300 - level * 120)
    lastT.current = performance.now()
    const tick = (t) => {
      const dt = Math.min(0.05, (t - lastT.current) / 1000)
      lastT.current = t
      if (t - lastSpawn.current > spawnEvery) {
        lastSpawn.current = t
        const isTarget = Math.random() < 0.4
        const others = pool.filter((l) => l.id !== target.id)
        const letter = isTarget || !others.length ? target : pick(others)
        items.current.push({
          id: nextId.current++,
          letter,
          x: 8 + Math.random() * 78,
          y: -12,
          speed: speed * (0.8 + Math.random() * 0.4),
          sway: Math.random() * Math.PI * 2,
          state: 'falling',
        })
      }
      items.current = items.current
        .map((it) => (it.state === 'falling' ? { ...it, y: it.y + it.speed * dt, sway: it.sway + dt * 2 } : it))
        .filter((it) => it.y < 105 && !(it.state === 'gone'))
      setFrame((f) => f + 1)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [state, level, target, pool])

  const tap = (it) => {
    if (it.state !== 'falling') return
    if (it.letter.id === target.id) {
      sfx.success()
      it.state = 'caught'
      setTimeout(() => (it.state = 'gone'), 450)
      const n = caught + 1
      setCaught(n)
      if (n >= GOAL) {
        setState('levelup')
        speak('כָּל הַכָּבוֹד! עֲלִיתֶם שָׁלָב!')
      }
    } else {
      sfx.error()
      it.state = 'wrong'
      setTimeout(() => (it.state = 'falling'), 500)
      speak(it.letter.name, { key: `letter-${it.letter.id}` })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white/80 p-3 shadow">
        <button
          onClick={() => announce(target)}
          className="font-heb flex h-16 w-16 items-center justify-center rounded-2xl text-5xl font-black text-white shadow"
          style={{ background: target.color }}
          aria-label="השמע שוב"
        >
          {state === 'intro' ? '?' : '🔊'}
        </button>
        <div className="text-lg font-bold">
          שָׁלָב {level}
          <div className="text-2xl tracking-wider">
            {Array.from({ length: GOAL }, (_, i) => (i < caught ? '⭐' : '☆')).join('')}
          </div>
        </div>
        <Btn variant="ghost" className="ms-auto" onClick={() => announce(target)}>👂 שְׁמַע שׁוּב</Btn>
      </div>

      <div className="relative h-[62vh] min-h-80 overflow-hidden rounded-3xl bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-200 shadow-inner select-none">
        <div className="absolute bottom-0 h-8 w-full bg-emerald-400/70" />
        {items.current.map((it) => (
          <button
            key={it.id}
            onPointerDown={() => tap(it)}
            className={`font-heb absolute flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full text-5xl font-black text-white shadow-lg transition-transform ${
              it.state === 'caught' ? 'scale-150 opacity-0 duration-500' : ''
            } ${it.state === 'wrong' ? 'animate-wiggle grayscale' : ''}`}
            style={{
              left: `calc(${it.x}% + ${Math.sin(it.sway) * 12}px)`,
              top: `${it.y}%`,
              background: `radial-gradient(circle at 35% 30%, #fff8, ${it.letter.color})`,
            }}
          >
            {it.letter.char}
          </button>
        ))}

        {state === 'intro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/40 p-4 text-center">
            <div className="animate-float text-8xl">🧺</div>
            <p className="text-2xl font-extrabold">תִּשְׁמְעוּ אוֹת – וְתִתְפְּסוּ אוֹתָהּ!</p>
            <Btn variant="success" className="px-8 py-4 text-3xl" onClick={() => startLevel(1)}>▶ מַתְחִילִים</Btn>
          </div>
        )}
        {state === 'levelup' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/60 p-4 text-center">
            <Confetti key={level} />
            <div className="animate-pop text-8xl">🏆</div>
            <p className="text-3xl font-extrabold">כָּל הַכָּבוֹד!</p>
            <Btn variant="success" className="px-8 py-4 text-2xl" onClick={() => startLevel(level + 1)}>
              שָׁלָב {level + 1} ➜
            </Btn>
          </div>
        )}
      </div>
    </div>
  )
}
