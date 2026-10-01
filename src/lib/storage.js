// Progress kept in localStorage: stars, unlocked levels, completed words.

const KEY = 'flying-word-factory:v1'

const EMPTY = { stars: 0, score: 0, unlocked: 1, levelStars: {}, completedWords: [] }

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY }
  } catch {
    return { ...EMPTY }
  }
}

export function saveProgress(p) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable (private mode) – keep playing */
  }
}

export function resetProgress() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  return { ...EMPTY }
}
