import { useRef, useState, useEffect, useCallback } from 'react';

export default function ScratchToReveal({
  children,
  coverColor = '#f5ede0',
  brushSize = 65,
  threshold = 50,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const lastPoint = useRef(null);
  const isDrawing = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [opacity, setOpacity] = useState(1);

  // Reduced motion: skip cover
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
    }
  }, []);

  const getSize = () => ({
    w: containerRef.current?.offsetWidth || window.innerWidth,
    h: containerRef.current?.offsetHeight || window.innerHeight,
  });

  const paint = useCallback((canvas) => {
    if (!canvas) return;
    const { w, h } = getSize();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = coverColor;
    ctx.fillRect(0, 0, w, h);
  }, [coverColor]);

  // Ref callback: paint immediately when canvas enters DOM
  const attachCanvas = useCallback((node) => {
    canvasRef.current = node;
    if (!node) return;
    paint(node);
    // Block scroll-snap from stealing touch
    const stop = (e) => e.preventDefault();
    node.addEventListener('touchstart', stop, { passive: false });
    node.addEventListener('touchmove',  stop, { passive: false });
  }, [paint]);

  useEffect(() => {
    const onResize = () => { if (canvasRef.current) paint(canvasRef.current); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [paint]);

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches?.[0] || e.changedTouches?.[0];
    return {
      x: (t ? t.clientX : e.clientX) - rect.left,
      y: (t ? t.clientY : e.clientY) - rect.top,
    };
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 32) { if (data[i] === 0) cleared++; total++; }
    if ((cleared / total) * 100 >= threshold) {
      setOpacity(0);
      setTimeout(() => setRevealed(true), 700);
    }
  };

  const scratch = (pt) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (lastPoint.current) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPoint.current = pt;
    checkReveal();
  };

  const onDown  = (e) => { isDrawing.current = true; lastPoint.current = null; scratch(getPoint(e)); };
  const onMove  = (e) => { if (!isDrawing.current) return; scratch(getPoint(e)); };
  const onUp    = ()  => { isDrawing.current = false; lastPoint.current = null; };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>

      {!revealed && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          opacity, transition: 'opacity 0.7s ease',
          pointerEvents: opacity === 0 ? 'none' : 'auto',
        }}>
          <canvas
            ref={attachCanvas}
            style={{ position: 'absolute', inset: 0, cursor: 'crosshair', touchAction: 'none', userSelect: 'none', display: 'block' }}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onTouchStart={onDown}
            onTouchMove={onMove}
            onTouchEnd={onUp}
          />
          <p style={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            pointerEvents: 'none', fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)',
            fontFamily: '-apple-system, sans-serif', whiteSpace: 'nowrap',
          }}>drag to scratch</p>
        </div>
      )}
    </div>
  );
}
