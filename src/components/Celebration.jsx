import { useMemo } from 'react'
import { motion } from 'framer-motion'

const BITS = ['⭐', '✨', '🎉', '💜', '🌟', '🎈', '💛', '🟣', '🔷']
const CHEERS = ['כָּל הַכָּבוֹד!', 'מְצֻיָּן!', 'יוֹפִי!', 'אַלּוּף!', 'נֶהְדָּר!']

export const randomCheer = () => CHEERS[Math.floor(Math.random() * CHEERS.length)]

/** Burst of confetti from the centre plus a big cheer word. */
export default function Celebration({ cheer }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const angle = (i / 28) * Math.PI * 2 + Math.random() * 0.3
        const dist = 120 + Math.random() * 180
        return {
          i,
          char: BITS[i % BITS.length],
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 60,
          rotate: Math.random() * 720 - 360,
          size: 1.4 + Math.random() * 1.4,
        }
      }),
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      {bits.map((b) => (
        <motion.span
          key={b.i}
          className="absolute"
          style={{ fontSize: `${b.size}rem` }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 220], scale: [0, 1.2, 1], rotate: b.rotate, opacity: [1, 1, 0] }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        >
          {b.char}
        </motion.span>
      ))}
      {cheer && (
        <motion.div
          className="font-heb rounded-3xl bg-white/90 px-8 py-4 text-5xl font-black text-violet-700 shadow-2xl sm:text-7xl"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.2, 1], rotate: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {cheer}
        </motion.div>
      )}
    </div>
  )
}
