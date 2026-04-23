import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CameraOff, RotateCw } from 'lucide-react';

const CONTAINER_ID = 'qr-camera-feed';

export default function QrCameraScanner({ onScan }) {
  const [error, setError]     = useState(null);
  const [started, setStarted] = useState(false);
  const scannerRef            = useRef(null);
  const mountedRef            = useRef(true);

  async function startScanner() {
    setError(null);
    setStarted(false);

    // Ensure any previous instance is cleaned up
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) await scannerRef.current.stop();
      } catch { /* ignore */ }
      scannerRef.current = null;
    }

    try {
      const scanner = new Html5Qrcode(CONTAINER_ID, { verbose: false });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 12, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
        (decoded) => {
          if (!mountedRef.current) return;
          scanner.stop().catch(() => {});
          onScan(decoded);
        },
        () => { /* per-frame not-found — ignore */ }
      );

      if (mountedRef.current) setStarted(true);
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = typeof err === 'string' ? err : err?.message ?? 'Camera unavailable';
      const lower = msg.toLowerCase();
      if (lower.includes('permission') || lower.includes('notallowed')) {
        setError('Camera permission denied. Allow camera access in your browser and try again.');
      } else if (lower.includes('notfound') || lower.includes('no camera')) {
        setError('No camera detected on this device.');
      } else if (lower.includes('secure') || lower.includes('https')) {
        setError('Camera requires a secure (HTTPS) connection. Localhost or HTTPS only.');
      } else {
        setError(msg);
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    startScanner();

    return () => {
      mountedRef.current = false;
      const s = scannerRef.current;
      if (s) {
        // Only call stop if currently scanning, and swallow errors
        Promise.resolve()
          .then(() => s.isScanning ? s.stop() : null)
          .catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-neutral-900" style={{ aspectRatio: '1' }}>
      <div id={CONTAINER_ID} className="w-full h-full" />

      {!started && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-900 text-neutral-500 text-sm">
          <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          <span>Starting camera…</span>
        </div>
      )}

      {started && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative w-52 h-52">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-amber-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-amber-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-amber-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-amber-400 rounded-br-lg" />
            <div className="absolute left-2 right-2 h-0.5 bg-amber-400/70 rounded-full animate-bounce" style={{ top: '50%' }} />
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900 px-6 text-center">
          <CameraOff size={36} className="text-neutral-600" strokeWidth={1.2} />
          <p className="text-sm text-neutral-400 max-w-xs">{error}</p>
          <button onClick={startScanner}
            className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors">
            <RotateCw size={13} />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
