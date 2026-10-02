import { motion } from 'framer-motion'
import Celebration from './Celebration.jsx'

/** End-of-activity screen: confetti, title, 0–3 stars and buttons. */
export default function StarsEnd({ title, stars, children }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-6">
      <Celebration />
      <motion.div className="text-7xl" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
        🎉
      </motion.div>
      <h2 className="font-heb mt-2 text-center text-3xl font-black text-violet-800">{title}</h2>
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
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">{children}</div>
    </div>
  )
}

export const starsFor = (mistakes) => (mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1)
