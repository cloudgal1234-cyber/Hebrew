import { navigate } from '../lib/router'

export function PageHeader({ title, emoji, back = '/', children }) {
  return (
    <header className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
      {back && (
        <button
          onClick={() => navigate(back)}
          className="rounded-2xl bg-white/80 px-4 py-2 text-xl font-bold shadow hover:bg-white active:scale-95"
          aria-label="חזרה"
        >
          ➜ חֲזָרָה
        </button>
      )}
      <h1 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
        <span className="text-3xl sm:text-4xl">{emoji}</span>
        {title}
      </h1>
      <div className="ms-auto flex flex-wrap gap-2">{children}</div>
    </header>
  )
}

const VARIANTS = {
  primary: 'bg-violet-500 hover:bg-violet-600 text-white',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  warn: 'bg-amber-400 hover:bg-amber-500 text-amber-950',
  danger: 'bg-rose-500 hover:bg-rose-600 text-white',
  ghost: 'bg-white/80 hover:bg-white text-indigo-950',
}

export function Btn({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      {...props}
      className={`rounded-2xl px-4 py-2 font-bold shadow transition active:scale-95 disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    />
  )
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/50 p-3 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`animate-pop max-h-[92vh] w-full overflow-auto rounded-3xl bg-white p-5 shadow-2xl ${wide ? 'max-w-4xl' : 'max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-2xl font-extrabold">{title}</h2>
          {onClose && (
            <button onClick={onClose} className="ms-auto rounded-full bg-slate-100 px-3 py-1 text-xl hover:bg-slate-200" aria-label="סגור">
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
