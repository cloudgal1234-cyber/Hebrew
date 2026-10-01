// Hebrew audio: recorded clips (public/audio/manifest.json) first,
// falling back to the Web Speech API with a Hebrew voice.

import { useEffect, useState } from 'react'

let clips = null
let clipsPromise = null
function loadClips() {
  clipsPromise ??= fetch(`${import.meta.env.BASE_URL}audio/manifest.json`)
    .then((r) => (r.ok ? r.json() : {}))
    .then((m) => (clips = m.clips ?? {}))
    .catch(() => (clips = {}))
  return clipsPromise
}
loadClips()

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
let currentAudio = null

function hebrewVoice() {
  const voices = synth?.getVoices() ?? []
  const he = voices.filter((v) => /^(he|iw)([-_]|$)/i.test(v.lang))
  // Prefer higher-quality network/"natural" voices when available.
  return he.find((v) => /natural|online|google|premium|enhanced/i.test(v.name)) ?? he[0] ?? null
}

export function stop() {
  synth?.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

function playClip(src) {
  return new Promise((resolve) => {
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/${src}`)
    currentAudio = audio
    audio.onended = audio.onerror = () => resolve()
    audio.play().catch(() => resolve())
  })
}

function tts(text, { rate = 0.8, pitch = 1.1 } = {}) {
  return new Promise((resolve) => {
    if (!synth) return resolve()
    const u = new SpeechSynthesisUtterance(text)
    const voice = hebrewVoice()
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? 'he-IL'
    u.rate = rate
    u.pitch = pitch
    u.onend = u.onerror = () => resolve()
    synth.speak(u)
    // Some engines never fire onend; don't hang callers forever.
    setTimeout(resolve, 1500 + text.length * 400)
  })
}

/**
 * Speak Hebrew text. `key` optionally names a recorded clip in the manifest
 * (e.g. "letter-bet"); the exact text is also accepted as a key.
 * Resolves once playback finishes. Interrupts anything already playing.
 */
export async function speak(text, { key, interrupt = true, ...opts } = {}) {
  if (interrupt) stop()
  if (!clips) await loadClips()
  const clip = (key && clips[key]) || clips[text]
  if (clip) return playClip(clip)
  return tts(text, opts)
}

/** Speak several phrases in a row, with a short pause between. */
export async function speakSequence(parts, opts) {
  stop()
  for (const p of parts) {
    const [text, key] = Array.isArray(p) ? p : [p]
    await speak(text, { ...opts, key, interrupt: false })
    await new Promise((r) => setTimeout(r, 250))
  }
}

export const speakLetter = (l) =>
  speakSequence([[l.name, `letter-${l.id}`], [l.word, `word-of-${l.id}`]])

export const speakWord = (w) => speak(w.text, { key: `word-${w.id}` })

export const speakSyllable = (letter, vowel, text) =>
  speak(text, { key: `syl-${letter.id}-${vowel.id}`, rate: 0.7 })

/** Hook: whether a Hebrew TTS voice is installed (voices load asynchronously). */
export function useHebrewVoiceStatus() {
  const [status, setStatus] = useState(() => (!synth ? 'unsupported' : hebrewVoice() ? 'ok' : 'loading'))
  useEffect(() => {
    if (!synth) return
    const check = () => setStatus(hebrewVoice() ? 'ok' : 'missing')
    synth.addEventListener?.('voiceschanged', check)
    const t = setTimeout(check, 1500)
    return () => {
      synth.removeEventListener?.('voiceschanged', check)
      clearTimeout(t)
    }
  }, [])
  return status
}
