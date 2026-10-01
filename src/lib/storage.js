// Card-mapping persistence in localStorage.
// Shape: { "CARD_001": { type: "letter" | "word", id: "bet", savedAt: 1700000000000 } }

import { useCallback, useEffect, useState } from 'react'

const KEY = 'hebrew-cards:mappings:v1'
const EVENT = 'hebrew-cards:mappings-changed'

export const CARD_PREFIX = 'CARD_'
export const cardId = (n) => `${CARD_PREFIX}${String(n).padStart(3, '0')}`
export const cardNumber = (id) => parseInt(String(id).slice(CARD_PREFIX.length), 10)

/** Normalise a scanned QR payload into a card id, or null if it isn't one of ours. */
export function parseCardCode(raw) {
  const m = String(raw ?? '').trim().toUpperCase().match(/CARD_(\d{1,6})/)
  return m ? cardId(parseInt(m[1], 10)) : null
}

export function loadMappings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function save(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch (e) {
    console.warn('Could not save card mappings', e)
  }
  window.dispatchEvent(new Event(EVENT))
}

export function getMapping(id) {
  return loadMappings()[id] ?? null
}

export function setMapping(id, { type, id: itemId }) {
  save({ ...loadMappings(), [id]: { type, id: itemId, savedAt: Date.now() } })
}

export function removeMapping(id) {
  const map = loadMappings()
  delete map[id]
  save(map)
}

export function resetMappings() {
  save({})
}

export function importMappings(map) {
  const clean = {}
  for (const [k, v] of Object.entries(map ?? {})) {
    const id = parseCardCode(k)
    if (id && v && (v.type === 'letter' || v.type === 'word') && typeof v.id === 'string') {
      clean[id] = { type: v.type, id: v.id, savedAt: v.savedAt ?? Date.now() }
    }
  }
  save(clean)
  return Object.keys(clean).length
}

/** React hook: live view of all mappings, kept in sync across components and tabs. */
export function useMappings() {
  const [map, setMap] = useState(loadMappings)
  useEffect(() => {
    const refresh = () => setMap(loadMappings())
    const onStorage = (e) => e.key === KEY && refresh()
    window.addEventListener(EVENT, refresh)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENT, refresh)
      window.removeEventListener('storage', onStorage)
    }
  }, [])
  return map
}

/** Small helper for persisting simple per-device preferences. */
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw == null ? initial : JSON.parse(raw)
    } catch {
      return initial
    }
  })
  const set = useCallback(
    (v) =>
      setValue((prev) => {
        const next = typeof v === 'function' ? v(prev) : v
        try {
          localStorage.setItem(key, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        return next
      }),
    [key],
  )
  return [value, set]
}
