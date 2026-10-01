// Hebrew speech via the Web Speech API (SpeechSynthesis) with a native
// Hebrew voice when the device has one.

const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined

function hebrewVoice() {
  const he = (synth?.getVoices() ?? []).filter((v) => /^(he|iw)([-_]|$)/i.test(v.lang))
  return he.find((v) => /natural|online|google|premium|enhanced/i.test(v.name)) ?? he[0] ?? null
}

export function stopSpeech() {
  synth?.cancel()
}

/** Speak Hebrew text; resolves when finished. */
export function speak(text, { rate = 0.8, pitch = 1.15, interrupt = true } = {}) {
  return new Promise((resolve) => {
    if (!synth) return resolve()
    if (interrupt) synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const voice = hebrewVoice()
    if (voice) u.voice = voice
    u.lang = voice?.lang ?? 'he-IL'
    u.rate = rate
    u.pitch = pitch
    let done = false
    const finish = () => {
      if (!done) (done = true), resolve()
    }
    u.onend = u.onerror = finish
    synth.speak(u)
    // Some engines never fire onend.
    setTimeout(finish, 1200 + text.length * 350)
  })
}

/** Speak several phrases in order (strings, or [text, options] pairs). */
export async function speakAll(parts) {
  stopSpeech()
  for (const p of parts) {
    const [text, opts] = Array.isArray(p) ? p : [p, {}]
    await speak(text, { ...opts, interrupt: false })
    await new Promise((r) => setTimeout(r, 150))
  }
}

/** A phonics syllable, slow and clear. */
export const speakSyllable = (syl) => speak(syl.say, { rate: 0.6 })

export function hasHebrewVoice() {
  return !!hebrewVoice()
}

// Chrome loads voices lazily; asking early warms the list up.
synth?.getVoices()
