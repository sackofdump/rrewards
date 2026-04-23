import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { CameraOff } from 'lucide-react';

export default function QrCameraScanner({ onScan }) {
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);
  const scannerRef = useRef(null);
  const containerId = 'qr-camera-feed';

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId, { verbose: false });
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 12, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
      (decoded) => {
        // stop after first successful scan
        scanner.stop().catch(() => {});
        onScan(decoded);
      },
      () => { /* per-frame not-found errors — ignore */ }
    )
      .then(() => setStarted(true))
      .catch(err => {
        const msg = typeof err === 'string' ? err : err?.message ?? 'Camera unavailable';
        setError(msg.includes('Permission') || msg.includes('permission')
          ? 'Camera permission denied. Allow camera access and try again.'
          : 'Could not start camera. Make sure no other app is using it.');
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-neutral-900" style={{ aspectRatio: '1' }}>
      {/* html5-qrcode renders the video into this div */}
      <div id={containerId} className="w-full h-full" />

      {/* Viewfinder overlay */}
      {started && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative w-52 h-52">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-amber-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-amber-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-amber-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-amber-400 rounded-br-lg" />
            {/* scan line animation */}
            <div className="absolute left-2 right-2 h-0.5 bg-amber-400/70 rounded-full animate-bounce" style={{ top: '50%' }} />
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900 px-6 text-center">
          <CameraOff size={36} className="text-neutral-600" strokeWidth={1.2} />
          <p className="text-sm text-neutral-400">{error}</p>
        </div>
      )}
    </div>
  );
}
