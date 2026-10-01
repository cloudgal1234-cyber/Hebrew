import { QRCodeSVG } from 'qrcode.react'
import { Btn, PageHeader } from '../components/ui'
import { resolveItem, itemLabel } from '../data/content'
import { cardId, usePersistentState, useMappings } from '../lib/storage'

const PER_PAGE = 4 // 2 × 2 cards of 10 cm on A4 portrait
const DECOR = ['⭐', '🌈', '🎈', '🦋', '🌼', '🐞', '☁️', '🍭']
const TINTS = ['#fde68a', '#fbcfe8', '#bfdbfe', '#bbf7d0', '#ddd6fe', '#fed7aa']

/**
 * Printable 10 cm × 10 cm QR cards on A4, with dashed cut lines.
 * Each card: big number, playful placeholder art, and a QR encoding CARD_###.
 */
export default function PrintCardsPage() {
  const [start, setStart] = usePersistentState('print:start', 1)
  const [count, setCount] = usePersistentState('print:count', 8)
  const [showMapped, setShowMapped] = usePersistentState('print:showMapped', false)
  const mappings = useMappings()

  const nums = Array.from({ length: Math.max(0, Math.min(200, count)) }, (_, i) => start + i)
  const pages = []
  for (let i = 0; i < nums.length; i += PER_PAGE) pages.push(nums.slice(i, i + PER_PAGE))

  return (
    <div>
      <PageHeader title="הַדְפָּסַת כַּרְטִיסִיּוֹת" emoji="🖨️">
        <Btn variant="success" onClick={() => window.print()}>🖨️ הדפסה</Btn>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-end gap-4 rounded-3xl bg-white/80 p-4 shadow print:hidden">
        <label className="flex flex-col text-sm font-bold">
          מכרטיס מספר
          <input
            type="number"
            min={1}
            value={start}
            onChange={(e) => setStart(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="mt-1 w-24 rounded-xl border-2 border-violet-200 px-2 py-1 text-lg"
          />
        </label>
        <label className="flex flex-col text-sm font-bold">
          כמות כרטיסים
          <input
            type="number"
            min={1}
            max={200}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(200, parseInt(e.target.value, 10) || 1)))}
            className="mt-1 w-24 rounded-xl border-2 border-violet-200 px-2 py-1 text-lg"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={showMapped} onChange={(e) => setShowMapped(e.target.checked)} className="h-5 w-5" />
          להציג על הכרטיס את התוכן שכבר שויך אליו
        </label>
        <p className="text-sm text-indigo-900/70">
          {pages.length} עמודי A4 · 4 כרטיסים בעמוד · בהדפסה יש לבחור „גודל בפועל / 100%” וללא שוליים.
        </p>
      </div>

      <div className="flex flex-col items-center-safe gap-6 overflow-x-auto pb-4 print:block print:overflow-visible print:p-0">
        {pages.map((page, pi) => (
          <div
            key={pi}
            className="print-sheet grid w-[210mm] shrink-0 origin-top grid-cols-[100mm_100mm] content-center justify-center bg-white px-[5mm] py-[48.5mm] shadow-xl print:shadow-none"
            style={{ height: '297mm' }}
          >
            {page.map((n) => (
              <Card key={n} n={n} mapping={showMapped ? resolveItem(mappings[cardId(n)]) : null} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Card({ n, mapping }) {
  const id = cardId(n)
  const tint = TINTS[n % TINTS.length]
  const decor = [DECOR[n % DECOR.length], DECOR[(n + 3) % DECOR.length]]
  return (
    <div className="relative box-border flex h-[100mm] w-[100mm] flex-col items-center justify-between border-2 border-dashed border-slate-400 p-[5mm]">
      <span className="absolute -top-[3mm] -right-[3mm] bg-white text-[4mm] leading-none text-slate-400 print:block">✂</span>
      <div
        className="flex h-full w-full flex-col items-center justify-between rounded-[6mm] p-[4mm]"
        style={{ background: `radial-gradient(circle at 30% 20%, white, ${tint})` }}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-[9mm] leading-none font-black text-indigo-950">#{n}</span>
          <span className="text-[8mm] leading-none">{decor[0]}</span>
        </div>

        {mapping ? (
          <div className="font-heb flex items-center gap-[3mm] text-[14mm] leading-none font-black text-indigo-950">
            <span>{mapping.item.emoji}</span>
            <span>{itemLabel(mapping)}</span>
          </div>
        ) : (
          <div className="flex h-[22mm] w-[60mm] items-center justify-center rounded-[4mm] border-[0.6mm] border-dashed border-indigo-300 text-[5mm] text-indigo-300">
            ✏️ מקום לציור / מדבקה
          </div>
        )}

        <div className="flex w-full items-end justify-between">
          <span className="text-[8mm] leading-none">{decor[1]}</span>
          <div className="rounded-[3mm] bg-white p-[2mm]">
            <QRCodeSVG value={id} level="M" marginSize={0} style={{ width: '38mm', height: '38mm', display: 'block' }} />
          </div>
          <span className="w-[8mm] text-[2.8mm] text-slate-500" dir="ltr" style={{ writingMode: 'vertical-rl' }}>
            {id}
          </span>
        </div>
      </div>
    </div>
  )
}
