import { forwardRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * The bottom conveyor belt carrying the current word box:
 * picture + word with one empty slot.
 */
const ConveyorBelt = forwardRef(function ConveyorBelt({ word, filled, hintPulse, onSayWord, onSlotTap }, slotRef) {
  return (
    <div className="relative shrink-0 bg-gradient-to-b from-slate-300 to-slate-400 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="relative mx-auto flex h-[clamp(9.5rem,27vh,15rem)] max-w-3xl items-end justify-center">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={word.id}
            initial={{ x: '-120vw', rotate: -4 }}
            animate={{ x: 0, rotate: 0 }}
            exit={{ x: '120vw', rotate: 4 }}
            transition={{ type: 'spring', stiffness: 70, damping: 14 }}
            className="relative z-10 mb-3 flex items-center gap-3 rounded-3xl border-4 border-amber-700/60 bg-gradient-to-b from-amber-100 to-amber-200 px-4 py-3 shadow-[0_10px_0_rgba(120,53,15,0.35)] sm:gap-6 sm:px-6"
          >
            <motion.button
              type="button"
              onClick={onSayWord}
              aria-label="שְׁמַע אֶת הַמִּלָּה"
              whileTap={{ scale: 0.85 }}
              animate={filled ? { scale: [1, 1.35, 1], rotate: [0, -12, 12, 0] } : { y: [0, -6, 0] }}
              transition={filled ? { duration: 0.8 } : { duration: 1.8, repeat: Infinity }}
              className="text-[clamp(3.5rem,13vw,6.5rem)] leading-none"
            >
              {word.emoji}
            </motion.button>

            <div className="flex flex-col items-center gap-1">
              <div className="font-heb flex items-center gap-1 text-[clamp(2.4rem,9vw,4.5rem)] font-black leading-none text-indigo-950">
                {word.parts.map((part, i) =>
                  i === word.miss ? (
                    <motion.button
                      key={i}
                      ref={slotRef}
                      type="button"
                      onClick={onSlotTap}
                      aria-label="הַצְּלִיל הֶחָסֵר"
                      animate={hintPulse && !filled ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                      transition={{ duration: 0.6, repeat: hintPulse && !filled ? 2 : 0 }}
                      className={`flex min-w-[1.6em] items-center justify-center rounded-2xl px-1 py-1 ${
                        filled ? 'bg-emerald-300/70' : 'border-4 border-dashed border-violet-500 bg-white/70'
                      }`}
                    >
                      {filled ? (
                        <motion.span
                          initial={{ scale: 0.3 }}
                          animate={{ scale: [1.5, 1] }}
                          transition={{ type: 'spring', bounce: 0.6 }}
                        >
                          {part}
                        </motion.span>
                      ) : (
                        <motion.span
                          className="text-violet-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.4, repeat: Infinity }}
                        >
                          ?
                        </motion.span>
                      )}
                    </motion.button>
                  ) : (
                    <span key={i} className="px-0.5">
                      {part}
                    </span>
                  ),
                )}
              </div>
              <button
                type="button"
                onClick={onSayWord}
                className="rounded-full bg-violet-600 px-3 py-0.5 text-sm font-bold text-white shadow active:scale-95"
              >
                🔊 שְׁמַע
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The belt itself */}
      <div className="absolute inset-x-0 bottom-[max(0.5rem,env(safe-area-inset-bottom))] mx-3 h-7 overflow-hidden rounded-full border-4 border-slate-700 belt" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[max(0.5rem,env(safe-area-inset-bottom))] mx-5 flex h-7 items-center justify-between">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className="spin-wheel block size-5 rounded-full border-4 border-dashed border-slate-200 bg-slate-600" />
        ))}
      </div>
    </div>
  )
})

export default ConveyorBelt
