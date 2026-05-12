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
    return sessionStorage.getItem(STORAGE_KEY) === 'true';
  });

  // Skip cover if user prefers reduced motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) setIsRevealed(true);
  }, []);

  // Paint the cover onto the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || isRevealed) return;

    const setup = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.fillStyle = coverColor;
      ctx.fillRect(0, 0, rect.width, rect.height);

      if (coverText) {
        const fontSize = Math.min(rect.width / 14, 48);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '0.1em';
        ctx.fillText(coverText, rect.width / 2, rect.height / 2);
      }
    };

    setup();
    window.addEventListener('resize', setup);
    return () => window.removeEventListener('resize', setup);
  }, [coverColor, coverText, isRevealed]);

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0]?.clientX : e.clientX;
    const clientY = e.touches ? e.touches[0]?.clientY : e.clientY;
    if (clientX == null || clientY == null) return null;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const checkProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let cleared = 0, sampled = 0;
    for (let i = 3; i < data.length; i += 4 * 32) {
      if (data[i] === 0) cleared++;
      sampled++;
    }
    if ((cleared / sampled) * 100 >= threshold) {
      setIsRevealed(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [threshold]);

  const scratch = (point) => {
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
  };

  const handleStart = (e) => {
    isDrawing.current = true;
    lastPoint.current = null;
    const p = getPoint(e);
    if (p) scratch(p);
  };
  const handleMove = (e) => {
    if (!isDrawing.current && !e.touches) return;
    const p = getPoint(e);
    if (p) scratch(p);
  };
  const handleEnd = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>

      <AnimatePresence>
        {!isRevealed && (
          <motion.canvas
            ref={canvasRef}
            style={{
              position: 'absolute', inset: 0,
              cursor: 'grab', touchAction: 'none', userSelect: 'none',
            }}
            onMouseDown={handleStart}
            onMouseMove={(e) => isDrawing.current && handleMove(e)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            exit={{ opacity: 0, scale: 1.04 }}
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
          color: 'rgba(255,255,255,0.4)',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          whiteSpace: 'nowrap',
        }}>
          drag to scratch
        </p>
      )}
    </div>
  );
}
