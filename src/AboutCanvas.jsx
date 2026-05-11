import { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 212;

function frameUrl(i) {
  return `/images/ezgif-frame-${String(i + 1).padStart(3, '0')}.png`;
}

export default function AboutCanvas() {
  const wrapperRef  = useRef(null);
  const canvasRef   = useRef(null);
  const imagesRef   = useRef([]);
  const progressRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [loaded,   setLoaded]   = useState(0);
  const [ready,    setReady]    = useState(false);

  // ── Preload all frames ─────────────────────────────────────────
  useEffect(() => {
    const imgs = [];
    let done = 0;
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = frameUrl(i);
      img.onload = img.onerror = () => {
        done++;
        setLoaded(done);
        if (done === FRAME_COUNT) setReady(true);
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
    return () => imgs.forEach(img => { img.onload = null; img.onerror = null; });
  }, []);

  // ── Canvas resize ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = window.innerWidth  + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── Scroll tracking ────────────────────────────────────────────
  useEffect(() => {
    const container = document.querySelector('.scroll-container');
    if (!container) return;
    const onScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const scrollable = wrapper.offsetHeight - window.innerHeight;
      const scrolled   = container.scrollTop - wrapper.offsetTop;
      const p = Math.max(0, Math.min(1, scrolled / scrollable));
      progressRef.current = p;
      setProgress(p);
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  // ── Draw frame on scroll ───────────────────────────────────────
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const lW  = canvas.width  / dpr;
    const lH  = canvas.height / dpr;

    const idx = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
    const img = imagesRef.current[idx];
    if (!img || !img.complete) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, lW, lH);
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, lW, lH);

    const imgW  = img.naturalWidth  || lW;
    const imgH  = img.naturalHeight || lH;
    const scale = Math.min(lW / imgW, lH / imgH);
    const dw    = imgW * scale;
    const dh    = imgH * scale;
    ctx.drawImage(img, (lW - dw) / 2, (lH - dh) / 2, dw, dh);
    ctx.restore();
  }, [progress, ready]);

  const pct = Math.round((loaded / FRAME_COUNT) * 100);

  return (
    <div ref={wrapperRef} style={{ height: '600vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh', width: '100%',
        overflow: 'hidden', background: '#050505',
      }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

        {/* Preload overlay */}
        {!ready && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 20,
            background: '#050505',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 24,
          }}>
            <div style={{
              width: 40, height: 40,
              border: '1.5px solid rgba(255,255,255,0.1)',
              borderTopColor: 'rgba(255,255,255,0.8)',
              borderRadius: '50%',
              animation: 'spin 0.9s linear infinite',
            }} />
            <div style={{ width: 180, height: 1.5, background: 'rgba(255,255,255,0.08)', borderRadius: 1 }}>
              <div style={{
                height: '100%', borderRadius: 1,
                width: `${pct}%`,
                background: 'linear-gradient(to right, rgba(160,80,255,0.9), rgba(80,160,255,0.9))',
                transition: 'width 0.2s ease',
              }} />
            </div>
            <div style={{
              fontSize: 11, letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
              fontFamily: '-apple-system, sans-serif',
            }}>
              {pct}%
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
