// Tiny synthesized sound effects (no audio files needed).

let ctx
function ac() {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, start, dur, type = 'sine', gain = 0.15) {
  const c = ac()
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(gain, c.currentTime + start)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur)
  o.connect(g).connect(c.destination)
  o.start(c.currentTime + start)
  o.stop(c.currentTime + start + dur)
}

const safe = (fn) => () => {
  try {
    fn()
  } catch {
    /* audio not available */
  }
}

export const sfx = {
  success: safe(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle'))),
  error: safe(() => tone(180, 0, 0.3, 'sawtooth', 0.08)),
  pop: safe(() => tone(880, 0, 0.08, 'square', 0.05)),
  scan: safe(() => {
    tone(1200, 0, 0.08, 'sine')
    tone(1600, 0.08, 0.1, 'sine')
  }),
}
