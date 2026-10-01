import { useEffect, useId, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

// Serialises start/stop across mounts (React StrictMode mounts twice in dev,
// and the library can't start a camera while another start/stop is pending).
let chain = Promise.resolve()

/**
 * Live camera QR scanner with a child-friendly viewfinder.
 * `onScan(text)` fires for every decoded frame — callers debounce.
 * `flash` briefly turns the frame green as scan feedback.
 */
export default function QrScanner({ onScan, flash }) {
  const rawId = useId()
  const id = `qr-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan
  const [status, setStatus] = useState('starting') // starting | running | error
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const scanner = new Html5Qrcode(id, {
      verbose: false,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      useBarCodeDetectorIfSupported: true,
    })
    const config = { fps: 12, aspectRatio: 1 }
    const handle = (text) => onScanRef.current?.(text)

    chain = chain
      .then(async () => {
        if (cancelled) return
        try {
          await scanner.start({ facingMode: 'environment' }, config, handle, () => {})
        } catch (e) {
          if (cancelled) return
          // Some laptops reject facingMode; fall back to the first camera.
          const cams = await Html5Qrcode.getCameras().catch(() => [])
          if (!cams.length) throw e
          await scanner.start(cams[0].id, config, handle, () => {})
        }
        if (!cancelled) setStatus('running')
      })
      .catch((e) => {
        if (cancelled) return
        setStatus('error')
        setError(String(e?.message ?? e))
      })

    return () => {
      cancelled = true
      chain = chain
        .then(async () => {
          if (scanner.isScanning) await scanner.stop()
          scanner.clear()
        })
        .catch(() => {})
    }
  }, [id])

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[380px] overflow-hidden rounded-[2rem] bg-indigo-950 shadow-xl">
      <style>{`#${id} video { width: 100% !important; height: 100% !important; object-fit: cover; }
        #${id} { width: 100%; height: 100%; border: 0 !important; }`}</style>
      <div id={id} className="absolute inset-0" />

      {/* Viewfinder overlay */}
      <div className="pointer-events-none absolute inset-0">
        {['top-4 right-4 border-t-8 border-r-8', 'top-4 left-4 border-t-8 border-l-8', 'bottom-4 right-4 border-b-8 border-r-8', 'bottom-4 left-4 border-b-8 border-l-8'].map(
          (c) => (
            <div
              key={c}
              className={`absolute h-14 w-14 rounded-xl transition-colors ${c} ${flash ? 'border-emerald-400' : 'border-amber-300'}`}
            />
          ),
        )}
        {status === 'running' && !flash && (
          <div className="animate-scanline absolute right-6 left-6 h-1 rounded-full bg-amber-300 shadow-[0_0_16px_4px_rgba(252,211,77,0.8)]" />
        )}
        {flash && <div className="absolute inset-0 bg-emerald-400/40" />}
      </div>

      {status === 'starting' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
          <div className="animate-float text-6xl">📷</div>
          <p className="text-lg font-bold">מַדְלִיקִים מַצְלֵמָה…</p>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-white">
          <div className="text-6xl">🙈</div>
          <p className="text-lg font-bold">לא הצלחנו לפתוח את המצלמה</p>
          <p className="text-sm opacity-80">
            יש לאשר גישה למצלמה. המצלמה עובדת רק ב-HTTPS או ב-localhost. אפשר להקליד מספר כרטיס למטה.
          </p>
          <p className="text-xs opacity-50" dir="ltr">{error}</p>
        </div>
      )}
    </div>
  )
}
