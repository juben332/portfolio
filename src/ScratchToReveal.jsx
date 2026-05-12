import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'about-scratch-revealed';

export default function ScratchToReveal({
  children,
  coverColor = '#0a0a0a',
  coverText = 'SCRATCH TO ENTER',
  threshold = 50,
  brushSize = 65,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const lastPoint = useRef(null);
  const isDrawing = useRef(false);

  const [isRevealed, setIsRevealed] = useState(() => {
    try { return sessionStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) setIsRevealed(true);
  }, []);

  // Paint canvas cover — retry after 100ms in case layout isn't ready yet
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width || container.offsetWidth;
    const h = rect.height || container.offsetHeight;
    if (!w || !h) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = coverColor;
    ctx.fillRect(0, 0, w, h);

    if (coverText) {
      const fontSize = Math.min(w / 10, 42);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(coverText, w / 2, h / 2);
    }
  }, [coverColor, coverText]);

  useEffect(() => {
    if (isRevealed) return;
    setupCanvas();
    const t = setTimeout(setupCanvas, 120);
    window.addEventListener('resize', setupCanvas);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', setupCanvas);
    };
  }, [isRevealed, setupCanvas]);

  // Prevent scroll-snap from swallowing touch events on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const block = (e) => e.preventDefault();
    canvas.addEventListener('touchstart', block, { passive: false });
    canvas.addEventListener('touchmove', block, { passive: false });
    return () => {
      canvas.removeEventListener('touchstart', block);
      canvas.removeEventListener('touchmove', block);
    };
  }, [isRevealed]);

  const getPoint = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e.changedTouches?.[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    if (clientX == null || clientY == null) return null;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const checkProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.width || !canvas.height) return;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0, sampled = 0;
    for (let i = 3; i < data.length; i += 4 * 32) {
      if (data[i] === 0) cleared++;
      sampled++;
    }
    if ((cleared / sampled) * 100 >= threshold) {
      setIsRevealed(true);
      try { sessionStorage.setItem(STORAGE_KEY, 'true'); } catch {}
    }
  }, [threshold]);

  const scratch = useCallback((point) => {
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
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPoint.current = point;
    checkProgress();
  }, [brushSize, checkProgress]);

  const handleStart = useCallback((e) => {
    isDrawing.current = true;
    lastPoint.current = null;
    const p = getPoint(e);
    if (p) scratch(p);
  }, [getPoint, scratch]);

  const handleMove = useCallback((e) => {
    if (!isDrawing.current) return;
    const p = getPoint(e);
    if (p) scratch(p);
  }, [getPoint, scratch]);

  const handleEnd = useCallback(() => {
    isDrawing.current = false;
    lastPoint.current = null;
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>

      <AnimatePresence>
        {!isRevealed && (
          <motion.canvas
            ref={canvasRef}
            style={{
              position: 'absolute', inset: 0, zIndex: 50,
              cursor: 'crosshair', touchAction: 'none',
              userSelect: 'none', display: 'block',
            }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {!isRevealed && (
        <p style={{
          position: 'absolute', bottom: 28, left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none', fontSize: 10,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          whiteSpace: 'nowrap', zIndex: 51,
        }}>
          drag to scratch
        </p>
      )}
    </div>
  );
}
