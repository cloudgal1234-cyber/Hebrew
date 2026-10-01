// Little synthesized sound effects – no audio files needed.

let ctx
function ac() {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq, start, dur, { type = 'sine', gain = 0.15, to } = {}) {
  const c = ac()
  const t = c.currentTime + start
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

const safe = (fn) => () => {
  try {
    fn()
  } catch {
    /* audio unavailable */
  }
}

export const sfx = {
  unlock: safe(() => ac()),
  pop: safe(() => tone(700, 0, 0.09, { type: 'triangle', gain: 0.12, to: 1200 })),
  bounce: safe(() => {
    tone(320, 0, 0.18, { type: 'sine', gain: 0.18, to: 160 })
    tone(260, 0.16, 0.16, { type: 'sine', gain: 0.1, to: 140 })
  }),
  whoosh: safe(() => tone(300, 0, 0.35, { type: 'sine', gain: 0.08, to: 1400 })),
  success: safe(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.3, { type: 'triangle' }))),
  star: safe(() => [1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.07, 0.25, { type: 'sine', gain: 0.12 }))),
  fanfare: safe(() =>
    [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, { type: 'triangle', gain: 0.14 })),
  ),
  tick: safe(() => tone(1500, 0, 0.04, { type: 'square', gain: 0.03 })),
}
