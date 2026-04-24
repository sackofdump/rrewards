import { useRef, useEffect, useState } from 'react';
import { Eraser, PenLine } from 'lucide-react';

export default function SignaturePad({ onChange, label = 'Sign here' }) {
  const canvasRef = useRef(null);
  const [hasSignature, setHasSignature] = useState(false);
  const drawing = useRef(false);

  // Init canvas — handle retina + DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  function pos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e) {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    drawing.current = true;
    canvas.setPointerCapture?.(e.pointerId);
  }

  function move(e) {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    setHasSignature(true);
    onChange?.(canvasRef.current.toDataURL('image/png'));
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasSignature(false);
    onChange?.(null);
  }

  return (
    <div>
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
          className="w-full cursor-crosshair"
          style={{ height: 140, touchAction: 'none', display: 'block' }}
        />
        {!hasSignature && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-neutral-600">
            <PenLine size={20} strokeWidth={1.5} />
            <span className="text-xs">{label}</span>
          </div>
        )}
        <div className="absolute bottom-2 left-3 right-3 border-t border-dashed border-white/15 pointer-events-none" />
        <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest text-neutral-600 pointer-events-none">
          X
        </span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-neutral-500">
          {hasSignature ? 'Signature captured' : 'Customer must sign to complete'}
        </span>
        {hasSignature && (
          <button type="button" onClick={clear}
            className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-amber-400 transition-colors">
            <Eraser size={11} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}
