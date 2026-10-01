import { useState } from 'react'
import { LETTERS, WORDS } from '../data/content'
import { speakLetter, speakWord } from '../lib/speech'

/**
 * Grid of every vocalized letter and word, used when binding a card.
 * Calls onPick({ type, id }).
 */
export default function ItemPicker({ onPick, selected, usedIds = new Set() }) {
  const [tab, setTab] = useState(selected?.type ?? 'letter')
  const isSel = (type, id) => selected?.type === type && selected?.id === id

  const tabBtn = (t, label) => (
    <button
      onClick={() => setTab(t)}
      className={`flex-1 rounded-2xl py-2 text-lg font-bold ${tab === t ? 'bg-violet-500 text-white shadow' : 'bg-slate-100'}`}
    >
      {label}
    </button>
  )

  const tile = (type, id, big, small, emoji, onHear) => (
    <div key={id} className="relative">
      <button
        onClick={() => onPick({ type, id })}
        className={`flex w-full flex-col items-center rounded-2xl border-4 bg-amber-50 p-2 transition hover:scale-105 active:scale-95 ${
          isSel(type, id) ? 'border-violet-500 bg-violet-100' : 'border-transparent'
        }`}
      >
        <span className="text-3xl">{emoji}</span>
        <span className="font-heb text-3xl font-bold leading-tight">{big}</span>
        {small && <span className="font-heb text-sm text-slate-500">{small}</span>}
        {usedIds.has(`${type}:${id}`) && !isSel(type, id) && (
          <span className="absolute top-1 left-1 rounded-full bg-emerald-200 px-1.5 text-xs">✓</span>
        )}
      </button>
      <button
        onClick={onHear}
        className="absolute top-1 right-1 rounded-full bg-white/90 px-1.5 text-sm shadow"
        aria-label="השמע"
      >
        🔊
      </button>
    </div>
  )

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {tabBtn('letter', 'אוֹתִיּוֹת 🔤')}
        {tabBtn('word', 'מִלִּים 📚')}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
        {tab === 'letter'
          ? LETTERS.map((l) => tile('letter', l.id, l.char, l.name, l.emoji, () => speakLetter(l)))
          : WORDS.map((w) => tile('word', w.id, w.text, null, w.emoji, () => speakWord(w)))}
      </div>
    </div>
  )
}
