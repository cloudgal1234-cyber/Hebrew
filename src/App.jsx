import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LEVELS } from './data/words.js'
import { loadProgress, saveProgress, resetProgress } from './lib/storage.js'
import { stopSpeech } from './lib/speech.js'
import HomeScreen from './components/HomeScreen.jsx'
import GameScreen from './components/GameScreen.jsx'

export default function App() {
  const [progress, setProgress] = useState(loadProgress)
  const [levelId, setLevelId] = useState(null)
  const [run, setRun] = useState(0)

  useEffect(() => saveProgress(progress), [progress])

  const level = LEVELS.find((l) => l.id === levelId)

  function wordDone(wordId, points) {
    setProgress((p) => ({
      ...p,
      score: p.score + points,
      completedWords: p.completedWords.includes(wordId) ? p.completedWords : [...p.completedWords, wordId],
    }))
  }

  function levelDone(id, stars) {
    setProgress((p) => ({
      ...p,
      stars: p.stars + stars,
      unlocked: Math.max(p.unlocked, Math.min(id + 1, LEVELS.length)),
      levelStars: { ...p.levelStars, [id]: Math.max(p.levelStars[id] ?? 0, stars) },
    }))
  }

  function go(id) {
    stopSpeech()
    setLevelId(id)
  }

  return (
    <div className="h-dvh w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {level ? (
          <GameScreen
            key={`level-${level.id}-${run}`}
            level={level}
            progress={progress}
            onWordDone={wordDone}
            onLevelDone={levelDone}
            onNext={() => go(LEVELS.find((l) => l.id === level.id + 1)?.id ?? null)}
            onReplay={() => (stopSpeech(), setRun((r) => r + 1))}
            onExit={() => go(null)}
          />
        ) : (
          <HomeScreen
            key="home"
            progress={progress}
            onPlay={go}
            onReset={() => setProgress(resetProgress())}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
