// A word drawn chunk by chunk in alternating colours, so the syllables are
// easy to see while it still reads as one word.

export const CHUNK_COLORS = ['#4338ca', '#db2777', '#0d9488']

export default function SyllableWord({ word, className = '' }) {
  return (
    <span className={`font-heb whitespace-nowrap ${className}`}>
      {word.chunks.map((c, i) => (
        <span key={i} style={{ color: CHUNK_COLORS[i % CHUNK_COLORS.length] }}>
          {c}
        </span>
      ))}
    </span>
  )
}
