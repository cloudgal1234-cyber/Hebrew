import { Suspense, lazy, useEffect } from 'react'
import { navigate, useRoute } from './lib/router'
import { stop } from './lib/speech'
import HomePage from './pages/HomePage'
import PrintCardsPage from './pages/PrintCardsPage'
import CardManagerPage from './pages/CardManagerPage'
import { AssemblyPage, CatcherPage, StoryPage, TracePage } from './pages/GamePages'

// The QR library is large; only load it when the scanner is opened.
const ScannerPage = lazy(() => import('./pages/ScannerPage'))

const ROUTES = {
  '/': HomePage,
  '/scan': ScannerPage,
  '/print': PrintCardsPage,
  '/cards': CardManagerPage,
  '/catch': CatcherPage,
  '/trace': TracePage,
  '/build': AssemblyPage,
  '/stories': StoryPage,
}

export default function App() {
  const { path, params } = useRoute()
  const Page = ROUTES[path] ?? HomePage

  // Silence any speech when switching screens.
  useEffect(() => stop, [path])

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-3 py-4 sm:px-6 print:max-w-none print:p-0">
      {path !== '/' && (
        <button
          onClick={() => navigate('/')}
          className="fixed bottom-4 left-4 z-40 rounded-full bg-white p-3 text-3xl shadow-xl hover:scale-110 print:hidden"
          aria-label="מסך הבית"
        >
          🏠
        </button>
      )}
      <Suspense fallback={<div className="animate-float pt-20 text-center text-7xl">🦉</div>}>
        <Page params={params} />
      </Suspense>
    </div>
  )
}
