// Print-letter (כְּתַב דְּפוּס) tracing guides on a 100×100 grid.
// Each stroke is a tiny path: M x y, L x y, C x1 y1 x2 y2 x y.
// Strokes are listed in writing order and start where the child should start.

export const LETTERS = {
  'ד': { name: 'דָּלֶת', strokes: ['M 18 24 L 82 24', 'M 70 24 L 70 86'] },
  'ת': { name: 'תָּו', strokes: ['M 16 24 L 80 24 L 80 86', 'M 34 24 L 34 86 L 20 86'] },
  'ב': { name: 'בֵּית', strokes: ['M 20 22 L 72 22 L 72 82', 'M 86 82 L 16 82'] },
  'פ': { name: 'פֵּא', strokes: ['M 20 22 L 58 22 C 88 22 88 84 58 84 L 18 84', 'M 22 22 L 22 50 L 42 50'] },
  'מ': { name: 'מֵם', strokes: ['M 18 16 L 32 30', 'M 32 30 L 80 22 L 80 84 L 46 84', 'M 32 30 L 28 84'] },
  'ס': { name: 'סָמֶךְ', strokes: ['M 22 22 L 62 22 C 86 22 86 84 50 84 C 14 84 14 50 22 22'] },
  'נ': { name: 'נוּן', strokes: ['M 36 20 L 62 20 L 62 84 L 30 84'] },
  'כ': { name: 'כָּף', strokes: ['M 20 22 L 58 22 C 88 22 88 84 58 84 L 18 84'] },
  'ג': { name: 'גִּימֶל', strokes: ['M 38 18 L 62 18 L 62 86', 'M 62 62 L 36 86'] },
  'ר': { name: 'רֵישׁ', strokes: ['M 20 22 L 58 22 C 74 22 78 32 78 44 L 78 86'] },
  'ל': { name: 'לָמֶד', strokes: ['M 26 8 L 26 36 L 74 36 L 74 54 C 74 74 62 86 44 90'] },
  'ע': { name: 'עַיִן', strokes: ['M 74 18 L 74 70 C 74 82 62 86 22 86', 'M 28 18 L 54 72'] },
  'י': { name: 'יוּד', strokes: ['M 38 26 L 60 26 L 60 56'] },
}

const lerp = (a, b, t) => a + (b - a) * t
function bezier(p0, p1, p2, p3, t) {
  const u = 1 - t
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ]
}

/** Turn a stroke path into a dense polyline of [x, y] points. */
function polyline(d) {
  const tok = d.trim().split(/[\s,]+/)
  const pts = []
  let cur = [0, 0]
  for (let i = 0; i < tok.length; ) {
    const cmd = tok[i++]
    const num = () => Number(tok[i++])
    if (cmd === 'M') {
      cur = [num(), num()]
      pts.push(cur)
    } else if (cmd === 'L') {
      const end = [num(), num()]
      for (let s = 1; s <= 20; s++) pts.push([lerp(cur[0], end[0], s / 20), lerp(cur[1], end[1], s / 20)])
      cur = end
    } else if (cmd === 'C') {
      const c1 = [num(), num()], c2 = [num(), num()], end = [num(), num()]
      for (let s = 1; s <= 40; s++) pts.push(bezier(cur, c1, c2, end, s / 40))
      cur = end
    } else {
      throw new Error(`Unsupported path command ${cmd}`)
    }
  }
  return pts
}

/** Re-sample a polyline so points are `step` units apart. */
function resample(pts, step) {
  const out = [pts[0]]
  let carry = 0
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i]
    const len = Math.hypot(bx - ax, by - ay)
    let pos = step - carry
    while (pos <= len) {
      out.push([lerp(ax, bx, pos / len), lerp(ay, by, pos / len)])
      pos += step
    }
    carry = len - (pos - step)
  }
  const last = pts[pts.length - 1]
  const tail = out[out.length - 1]
  if (Math.hypot(last[0] - tail[0], last[1] - tail[1]) > step / 3) out.push(last)
  return out
}

/** Strokes as evenly spaced checkpoints: [[ [x,y], ... ], ...] */
export function letterGuide(letter, step = 3) {
  return LETTERS[letter].strokes.map((d) => resample(polyline(d), step))
}
