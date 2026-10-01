import { navigate } from '../lib/router'
import { useHebrewVoiceStatus } from '../lib/speech'
import { useMappings } from '../lib/storage'

const PLAY = [
  { path: '/scan', emoji: '📷', title: 'מִשְׂחַק הַסּוֹרֵק', sub: 'סוֹרְקִים כַּרְטִיס וּמְשַׂחֲקִים', bg: 'from-violet-400 to-fuchsia-400', big: true },
  { path: '/catch', emoji: '🧺', title: 'תּוֹפְסִים צְלִילִים', sub: 'שׁוֹמְעִים וְתוֹפְסִים', bg: 'from-sky-400 to-cyan-400' },
  { path: '/trace', emoji: '✏️', title: 'כּוֹתְבִים אוֹתִיּוֹת', sub: 'מְצַיְּרִים עִם הָאֶצְבַּע', bg: 'from-amber-400 to-orange-400' },
  { path: '/build', emoji: '🧩', title: 'מַרְכִּיבִים מִלִּים', sub: 'גּוֹרְרִים אוֹתִיּוֹת', bg: 'from-emerald-400 to-teal-400' },
  { path: '/stories', emoji: '📖', title: 'סִפּוּרִים', sub: 'קוֹרְאִים יַחַד', bg: 'from-rose-400 to-pink-400' },
]

const GROWNUPS = [
  { path: '/print', emoji: '🖨️', title: 'הדפסת כרטיסיות' },
  { path: '/cards', emoji: '🗂️', title: 'ניהול כרטיסיות' },
]

export default function HomePage() {
  const voice = useHebrewVoiceStatus()
  const mapped = Object.keys(useMappings()).length
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="animate-float text-7xl">🦉</div>
        <h1 className="font-heb text-4xl font-black sm:text-5xl">אוֹתִיּוֹת קְסוּמוֹת</h1>
        <p className="text-lg font-bold text-indigo-900/70">לוֹמְדִים לִקְרֹא – בְּכֵיף!</p>
      </div>

      {voice === 'missing' && (
        <div className="rounded-2xl bg-amber-100 p-3 text-sm">
          🔈 לא נמצא קול עברי במכשיר זה. להגייה מדויקת מומלץ להתקין קול עברית (Hebrew) בהגדרות הדיבור של המערכת,
          או להשתמש ב-Chrome / Edge. אפשר גם להוסיף הקלטות ב-<code dir="ltr">public/audio</code>.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {PLAY.map((g) => (
          <button
            key={g.path}
            onClick={() => navigate(g.path)}
            className={`flex flex-col items-center justify-center gap-2 rounded-[2rem] bg-gradient-to-br p-5 text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl active:scale-95 ${g.bg} ${
              g.big ? 'col-span-2 row-span-2 lg:col-span-2' : ''
            }`}
          >
            <span className={g.big ? 'text-8xl sm:text-9xl' : 'text-6xl'}>{g.emoji}</span>
            <span className={`font-heb font-black drop-shadow ${g.big ? 'text-4xl' : 'text-2xl'}`}>{g.title}</span>
            <span className="font-heb text-sm font-bold opacity-90">{g.sub}</span>
            {g.big && (
              <span className="rounded-full bg-white/25 px-3 py-0.5 text-sm font-bold">{mapped} כרטיסים מוגדרים</span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-white/60 p-4 shadow">
        <h2 className="mb-2 font-extrabold">👨‍👩‍👧 להורים ולמורים</h2>
        <div className="flex flex-wrap gap-2">
          {GROWNUPS.map((g) => (
            <button
              key={g.path}
              onClick={() => navigate(g.path)}
              className="rounded-2xl bg-white px-4 py-2 font-bold shadow hover:bg-violet-50"
            >
              {g.emoji} {g.title}
            </button>
          ))}
        </div>
        <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-indigo-900/80">
          <li>מדפיסים כרטיסיות (10×10 ס״מ) וגוזרים לאורך הקו המקווקו.</li>
          <li>אפשר לצייר או להדביק תמונה על כל כרטיס.</li>
          <li>בסריקה הראשונה של כרטיס בוחרים מה הוא מייצג – הבחירה נשמרת.</li>
          <li>מעכשיו כל סריקה מפעילה מיד את הפעילות: צליל, אנימציה, כתיבה או הרכבת מילה.</li>
        </ol>
      </div>
    </div>
  )
}
