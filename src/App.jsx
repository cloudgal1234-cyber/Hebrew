import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { LEVELS } from './data/words.js'
import { loadProgress, saveProgress, resetProgress } from './lib/storage.js'
import { stopSpeech } from './lib/speech.js'
import HomeScreen from './components/HomeScreen.jsx'
import GameScreen from './components/GameScreen.jsx'
import NikudHome from './components/NikudHome.jsx'
import NikudLesson from './components/NikudLesson.jsx'
import { NIKUD } from './data/nikud.js'

export default function App() {
  const [progress, setProgress] = useState(loadProgress)
  const [levelId, setLevelId] = useState(null)
  const [run, setRun] = useState(0)
  // nikud: null = not in the nikud section, 'home' = lesson list, or a lesson id
  const [nikud, setNikud] = useState(null)

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

  function openNikud(id) {
    stopSpeech()
    setNikud(id)
  }

  function nikudDone(id, stars) {
    setProgress((p) => ({
      ...p,
      stars: p.stars + stars,
      nikudStars: { ...p.nikudStars, [id]: Math.max(p.nikudStars?.[id] ?? 0, stars) },
    }))
    const order = [...NIKUD.map((g) => g.id), 'review']
    openNikud(order[order.indexOf(id) + 1] ?? 'home')
  }

  return (
    <div className="h-dvh w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {nikud === 'home' ? (
          <NikudHome key="nikud-home" progress={progress} onOpen={openNikud} onBack={() => openNikud(null)} />
        ) : nikud ? (
          <NikudLesson
            key={`nikud-${nikud}-${run}`}
            groupId={nikud}
            onDone={(stars) => nikudDone(nikud, stars)}
            onExit={() => openNikud('home')}
          />
        ) : level ? (
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
            onNikud={() => openNikud('home')}
            onReset={() => setProgress(resetProgress())}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
