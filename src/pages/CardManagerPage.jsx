import { useRef, useState } from 'react'
import ItemPicker from '../components/ItemPicker'
import { Btn, Modal, PageHeader } from '../components/ui'
import { resolveItem, itemLabel } from '../data/content'
import { cardId, cardNumber, importMappings, removeMapping, resetMappings, setMapping, useMappings } from '../lib/storage'
import { speakLetter, speakWord } from '../lib/speech'

/**
 * ניהול כרטיסיות — for parents/teachers: view, edit, unlink, add,
 * export/import and reset all card ↔ content mappings.
 */
export default function CardManagerPage() {
  const mappings = useMappings()
  const [editing, setEditing] = useState(null) // card id
  const [confirmReset, setConfirmReset] = useState(false)
  const [newNum, setNewNum] = useState('')
  const [msg, setMsg] = useState('')
  const fileRef = useRef(null)

  const rows = Object.entries(mappings)
    .map(([card, m]) => ({ card, m, r: resolveItem(m) }))
    .sort((a, b) => cardNumber(a.card) - cardNumber(b.card))

  const flash = (t) => {
    setMsg(t)
    setTimeout(() => setMsg(''), 3000)
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(mappings, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'hebrew-cards-mappings.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importJson = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const n = importMappings(JSON.parse(await file.text()))
      flash(`✅ יובאו ${n} כרטיסים`)
    } catch {
      flash('❌ הקובץ אינו תקין')
    }
  }

  const addCard = (e) => {
    e.preventDefault()
    const n = parseInt(newNum, 10)
    if (n > 0) setEditing(cardId(n))
    setNewNum('')
  }

  return (
    <div>
      <PageHeader title="נִהוּל כַּרְטִיסִיּוֹת" emoji="🗂️">
        <Btn variant="ghost" onClick={exportJson} disabled={!rows.length}>⬇️ ייצוא</Btn>
        <Btn variant="ghost" onClick={() => fileRef.current.click()}>⬆️ ייבוא</Btn>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importJson} />
        <Btn variant="danger" onClick={() => setConfirmReset(true)} disabled={!rows.length}>🗑️ איפוס הכל</Btn>
      </PageHeader>

      {msg && <div className="animate-pop mb-3 rounded-2xl bg-emerald-100 p-3 font-bold">{msg}</div>}

      <form onSubmit={addCard} className="mb-4 flex flex-wrap items-center gap-2 rounded-3xl bg-white/80 p-4 shadow">
        <span className="font-bold">שיוך ידני לכרטיס מספר</span>
        <input
          inputMode="numeric"
          value={newNum}
          onChange={(e) => setNewNum(e.target.value.replace(/\D/g, ''))}
          className="w-24 rounded-xl border-2 border-violet-200 px-2 py-1 text-lg"
          placeholder="#"
        />
        <Btn type="submit" disabled={!newNum}>➕ שייך</Btn>
        <span className="text-sm text-indigo-900/60">
          {rows.length} כרטיסים משויכים · נשמר במכשיר זה (localStorage)
        </span>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-3xl bg-white/70 p-10 text-center shadow">
          <div className="mb-2 text-6xl">🃏</div>
          <p className="text-xl font-bold">עדיין אין כרטיסים משויכים</p>
          <p className="text-indigo-900/70">סרקו כרטיס במשחק הסורק – בפעם הראשונה תתבקשו לבחור מה הוא מייצג.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {rows.map(({ card, r }) => (
            <div key={card} className="flex flex-col items-center gap-1 rounded-3xl bg-white p-3 shadow">
              <div className="flex w-full items-center justify-between text-sm font-bold text-indigo-900/60">
                <span>#{cardNumber(card)}</span>
                <span dir="ltr" className="text-xs">{card}</span>
              </div>
              {r ? (
                <button
                  onClick={() => (r.type === 'letter' ? speakLetter(r.item) : speakWord(r.item))}
                  className="flex flex-col items-center"
                >
                  <span className="text-4xl">{r.item.emoji}</span>
                  <span className="font-heb text-3xl font-bold">{itemLabel(r)}</span>
                  <span className="text-xs text-slate-500">{r.type === 'letter' ? 'אות' : 'מילה'}</span>
                </button>
              ) : (
                <span className="py-4 text-sm text-rose-500">תוכן לא מוכר</span>
              )}
              <div className="mt-1 flex gap-1">
                <Btn variant="ghost" className="px-3 py-1 text-sm" onClick={() => setEditing(card)}>✏️ עריכה</Btn>
                <Btn variant="ghost" className="px-3 py-1 text-sm" onClick={() => removeMapping(card)} aria-label="מחק שיוך">
                  ✕
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`✏️ כרטיס #${editing ? cardNumber(editing) : ''}`} wide>
        <ItemPicker
          selected={editing ? mappings[editing] : null}
          usedIds={new Set(Object.values(mappings).map((m) => `${m.type}:${m.id}`))}
          onPick={(choice) => {
            setMapping(editing, choice)
            setEditing(null)
            flash('✅ נשמר')
          }}
        />
      </Modal>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="לאפס את כל הכרטיסים?">
        <p className="mb-4">כל השיוכים יימחקו, ובסריקה הבאה של כל כרטיס תתבקשו לבחור עבורו תוכן מחדש.</p>
        <div className="flex gap-2">
          <Btn
            variant="danger"
            onClick={() => {
              resetMappings()
              setConfirmReset(false)
              flash('🗑️ כל הכרטיסים אופסו')
            }}
          >
            כן, לאפס
          </Btn>
          <Btn variant="ghost" onClick={() => setConfirmReset(false)}>ביטול</Btn>
        </div>
      </Modal>
    </div>
  )
}
