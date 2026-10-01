import { useEffect, useRef } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'

export const CHUTES = 4
const COLORS = [
  ['#fef9c3', '#fde047', '#f59e0b'],
  ['#fce7f3', '#f9a8d4', '#ec4899'],
  ['#dbeafe', '#93c5fd', '#3b82f6'],
  ['#dcfce7', '#86efac', '#22c55e'],
]

/**
 * A phonics bubble dropping out of a chute. Falls to `floor`, then pops.
 * `bubble.state` switches it to the "wrong" float-away or hides it once caught.
 */
export default function Bubble({ bubble, floor, fall, glow, onTap, onGone }) {
  const el = useRef(null)
  const y = useMotionValue(-40)
  const x = useMotionValue(0)
  const scale = useMotionValue(0.3)
  const opacity = useMotionValue(1)
  const falling = useRef(null)

  // Drop
  useEffect(() => {
    animate(scale, 1, { type: 'spring', bounce: 0.6, duration: 0.5 })
    falling.current = animate(y, floor, {
      duration: fall,
      ease: 'linear',
      onComplete: () => {
        animate(scale, 1.4, { duration: 0.18 })
        animate(opacity, 0, { duration: 0.18, onComplete: () => onGone(bubble.id) })
      },
    })
    return () => falling.current?.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Wrong answer: wobble, then float gently up and away
  useEffect(() => {
    if (bubble.state !== 'wrong') return
    falling.current?.stop()
    animate(x, [0, -16, 16, -10, 10, 0], { duration: 0.45 })
    animate(y, y.get() - 180, { duration: 1.6, ease: 'easeOut', delay: 0.3 })
    animate(scale, 0.7, { duration: 1.6, delay: 0.3 })
    animate(opacity, 0, { duration: 1.4, delay: 0.5, onComplete: () => onGone(bubble.id) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bubble.state])

  const [b1, b2, b3] = COLORS[bubble.chute % COLORS.length]

  return (
    <div
      className="absolute top-0 z-10"
      style={{ left: `${((bubble.chute + 0.5) / CHUTES) * 100}%`, visibility: bubble.state === 'caught' ? 'hidden' : 'visible' }}
    >
      <motion.button
        ref={el}
        type="button"
        aria-label={bubble.syl.text}
        onPointerDown={(e) => {
          e.preventDefault()
          if (bubble.state === 'falling') onTap(bubble, el.current.getBoundingClientRect())
        }}
        style={{ x, y, scale, opacity, '--b1': b1, '--b2': b2, '--b3': b3 }}
        className="bubble font-heb -ml-[calc(var(--bs)/2)] flex size-(--bs) items-center justify-center rounded-full text-[length:calc(var(--bs)*0.42)] font-black text-indigo-950 [--bs:clamp(4.5rem,15vw,7rem)]"
      >
        <motion.span
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 2 + (bubble.id % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none leading-none"
        >
          {bubble.syl.text}
        </motion.span>
        {glow && (
          <motion.span
            className="pointer-events-none absolute -inset-2 rounded-full border-4 border-yellow-300"
            animate={{ scale: [1, 1.15, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        )}
      </motion.button>
    </div>
  )
}
