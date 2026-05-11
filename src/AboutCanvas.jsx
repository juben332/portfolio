import { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 212;

const BEATS = [
  {
    id: 'a', range: [0, 0.22], align: 'center',
    title: 'Creative\nDeveloper',
    sub: 'Building interfaces where design\nand motion collide.',
  },
  {
    id: 'b', range: [0.27, 0.47], align: 'left',
    title: 'Motion\nFirst',
    sub: 'Every interaction is intentional.\nEvery transition tells a story.',
  },
  {
    id: 'c', range: [0.53, 0.73], align: 'right',
    title: 'Built for\nthe Web',
    sub: 'React · Framer Motion\nVite · Canvas',
  },
  {
    id: 'd', range: [0.78, 0.97], align: 'center',
    title: "Let's\nCreate.",
    sub: 'Available for projects.\nwardopon123@gmail.com',
  },
];

function frameUrl(i) {
  return `/images/ezgif-frame-${String(i + 1).padStart(3, '0')}.png`;
}

function beatOp(range, p) {
  const [s, e] = range;
  const fi = s + 0.08, fo = e - 0.08;
  if (p < s || p > e) return 0;
  if (p < fi) return (p - s) / 0.08;
  if (p > fo) return 1 - (p - fo) / 0.08;
  return 1;
}

function beatY(range, p) {
  const [s, e] = range;
  if (p < s) return 28;
  if (p < s + 0.08) return 28 - ((p - s) / 0.08) * 28;
  if (p > e - 0.08) return -((p - (e - 0.08)) / 0.08) * 28;
  return 0;
}

export default function AboutCanvas() {
  const wrapperRef  = useRef(null);
  const canvasRef   = useRef(null);
  const imagesRef   = useRef([]);
  const progressRef = useRef(0);

  const [progress,      setProgress]      = useState(0);
  const [loaded,        setLoaded]        = useState(0);
  const [ready,         setReady]         = useState(false);
  const [showIndicator, setShowIndicator] = useState(true);

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

    return () => {
      imgs.forEach(img => { img.onload = null; img.onerror = null; });
    };
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
      setShowIndicator(p < 0.04);
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

    // center-contain the frame
    const imgW = img.naturalWidth  || lW;
    const imgH = img.naturalHeight || lH;
    const scale = Math.min(lW / imgW, lH / imgH);
    const dw = imgW * scale;
    const dh = imgH * scale;
    const dx = (lW - dw) / 2;
    const dy = (lH - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
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

        {/* Canvas */}
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
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              fontFamily: '-apple-system, sans-serif',
            }}>
              {pct}%
            </div>
          </div>
        )}

        {/* Text beats */}
        {ready && BEATS.map(beat => {
          const op = beatOp(beat.range, progress);
          const dy = beatY(beat.range, progress);
          if (op < 0.01) return null;

          const align = {
            center: { left: '50%', transform: `translate(-50%, calc(-50% + ${dy}px))`, textAlign: 'center' },
            left:   { left: 'clamp(28px, 9vw, 130px)', transform: `translateY(calc(-50% + ${dy}px))`, textAlign: 'left' },
            right:  { right: 'clamp(28px, 9vw, 130px)', transform: `translateY(calc(-50% + ${dy}px))`, textAlign: 'right' },
          }[beat.align];

          return (
            <div key={beat.id} style={{
              position: 'absolute', top: '50%',
              zIndex: 10, pointerEvents: 'none',
              opacity: op, ...align,
            }}>
              <div style={{
                fontSize: 'clamp(44px, 9vw, 100px)',
                fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.0,
                color: 'rgba(255,255,255,0.92)', whiteSpace: 'pre-line',
                marginBottom: '1.4rem',
                fontFamily: '-apple-system, "SF Pro Display", "Segoe UI", sans-serif',
              }}>
                {beat.title}
              </div>
              <div style={{
                fontSize: 'clamp(13px, 1.8vw, 17px)',
                fontWeight: 400, lineHeight: 1.75,
                color: 'rgba(255,255,255,0.52)', whiteSpace: 'pre-line', maxWidth: 380,
                fontFamily: '-apple-system, "SF Pro Text", "Segoe UI", sans-serif',
                ...(beat.align === 'right' ? { marginLeft: 'auto' } : {}),
              }}>
                {beat.sub}
              </div>
            </div>
          );
        })}

        {/* Scroll indicator */}
        {ready && (
          <div style={{
            position: 'absolute', bottom: 36, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            opacity: showIndicator ? 1 : 0,
            transition: 'opacity 0.6s ease',
            pointerEvents: 'none',
          }}>
            <div style={{
              fontSize: 10, letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
              fontFamily: '-apple-system, sans-serif',
            }}>
              Scroll to Explore
            </div>
            <div style={{
              width: 1, height: 44,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
            }} />
          </div>
        )}

        {/* Progress bar */}
        {ready && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            height: 1.5, width: '100%', background: 'rgba(255,255,255,0.06)',
          }}>
            <div style={{
              height: '100%',
              width: `${progress * 100}%`,
              background: 'linear-gradient(to right, rgba(160,80,255,0.8), rgba(80,160,255,0.8))',
              transition: 'width 0.08s linear',
            }} />
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
