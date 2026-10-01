import { useMemo } from 'react'

const COLORS = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899']
const SHAPES = ['⭐', '🎉', '✨', '🌟']

/** Celebration burst. Re-mount (change `key`) to replay. */
export default function Confetti({ count = 40 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1.8 + Math.random() * 1.4,
        size: 14 + Math.random() * 18,
        color: COLORS[i % COLORS.length],
        emoji: i % 4 === 0 ? SHAPES[i % SHAPES.length] : null,
      })),
    [count],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            animation: `confetti-fall ${p.dur}s ${p.delay}s ease-in forwards`,
            transform: 'translateY(-10vh)',
          }}
        >
          {p.emoji ?? <span className="block h-3 w-2 rounded-sm" style={{ background: p.color }} />}
        </span>
      ))}
    </div>
  )
}
