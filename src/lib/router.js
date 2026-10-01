// Minimal hash router: #/path?query — no dependency, works from file hosting.
import { useEffect, useState } from 'react'

function parse() {
  const [path, query = ''] = window.location.hash.replace(/^#/, '').split('?')
  return { path: path || '/', params: Object.fromEntries(new URLSearchParams(query)) }
}

export function useRoute() {
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const on = () => setRoute(parse())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export function navigate(path, params) {
  const q = params ? `?${new URLSearchParams(params)}` : ''
  window.location.hash = `${path}${q}`
}
