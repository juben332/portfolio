import { useEffect, useRef, useState } from 'react';

// ── Text beats ───────────────────────────────────────────────────
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

// ── Aurora orbs ──────────────────────────────────────────────────
const ORBS = [
  { bx: 0.15, by: 0.25, r: 420, color: [90,  40,  220] },
  { bx: 0.85, by: 0.20, r: 360, color: [220, 40,  120] },
  { bx: 0.50, by: 0.78, r: 440, color: [40,  120, 220] },
  { bx: 0.22, by: 0.75, r: 300, color: [160, 60,  220] },
  { bx: 0.78, by: 0.55, r: 380, color: [220, 100, 40]  },
  { bx: 0.50, by: 0.38, r: 320, color: [40,  200, 180] },
];

function orbState(orb, p, t) {
  const wx = Math.sin(t * 0.3 + orb.bx * 6.28) * 0.04;
  const wy = Math.cos(t * 0.25 + orb.by * 6.28) * 0.04;

  if (p < 0.33) {
    const pct = p / 0.33;
    return { x: orb.bx + wx, y: orb.by + wy, op: 0.12 + pct * 0.08, sc: 1 };
  }
  if (p < 0.66) {
    const pct = (p - 0.33) / 0.33;
    return {
      x: orb.bx + (0.5 - orb.bx) * pct * 0.55 + wx * (1 - pct),
      y: orb.by + (0.5 - orb.by) * pct * 0.55 + wy * (1 - pct),
      op: 0.18 + pct * 0.14,
      sc: 1 + pct * 0.35,
    };
  }
  const pct = (p - 0.66) / 0.34;
  const angle = orb.bx * Math.PI * 2 + t * 0.18;
  const dist  = 0.12 + pct * 0.22;
  return {
    x: 0.5 + Math.cos(angle) * dist + wx * 0.3,
    y: 0.5 + Math.sin(angle) * dist * 0.55 + wy * 0.3,
    op: 0.32 - pct * 0.18,
    sc: 1.35 + pct * 0.45,
  };
}

function drawFrame(canvas, p, t) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const dpr = window.devicePixelRatio || 1;
  const lW = W / dpr;
  const lH = H / dpr;

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, lW, lH);
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, lW, lH);

  // aurora blobs
  ctx.globalCompositeOperation = 'screen';
  ORBS.forEach(orb => {
    const { x, y, op, sc } = orbState(orb, p, t);
    const cx = x * lW;
    const cy = y * lH;
    const r  = orb.r * sc * (Math.min(lW, lH) / 900);
    const g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const [rr, gg, bb] = orb.color;
    g.addColorStop(0,   `rgba(${rr},${gg},${bb},${op})`);
    g.addColorStop(0.45,`rgba(${rr},${gg},${bb},${op * 0.35})`);
    g.addColorStop(1,   `rgba(${rr},${gg},${bb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // subtle horizontal scan line at scroll position
  ctx.globalCompositeOperation = 'source-over';
  const scanY = p * lH;
  const scanG = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
  scanG.addColorStop(0,   'rgba(255,255,255,0)');
  scanG.addColorStop(0.5, `rgba(255,255,255,${0.03 + p * 0.04})`);
  scanG.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = scanG;
  ctx.fillRect(0, scanY - 60, lW, 120);

  ctx.restore();
}

// ── Beat helpers ─────────────────────────────────────────────────
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

// ── Component ────────────────────────────────────────────────────
export default function AboutCanvas() {
  const wrapperRef  = useRef(null);
  const canvasRef   = useRef(null);
  const rafRef      = useRef(null);
  const progressRef = useRef(0);

  const [progress,       setProgress]       = useState(0);
  const [showIndicator,  setShowIndicator]  = useState(true);

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

  // ── Animation loop ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let start = null;
    const loop = ts => {
      if (!start) start = ts;
      const t = (ts - start) / 1000;
      drawFrame(canvas, progressRef.current, t);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div ref={wrapperRef} style={{ height: '600vh', position: 'relative' }}>

      {/* Sticky viewport */}
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh', width: '100%',
        overflow: 'hidden', background: '#050505',
      }}>

        {/* Canvas */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

        {/* Text beats */}
        {BEATS.map(beat => {
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
              opacity: op,
              ...align,
            }}>
              <div style={{
                fontSize: 'clamp(44px, 9vw, 100px)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.0,
                color: 'rgba(255,255,255,0.92)',
                whiteSpace: 'pre-line',
                marginBottom: '1.4rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
              }}>
                {beat.title}
              </div>
              <div style={{
                fontSize: 'clamp(13px, 1.8vw, 17px)',
                fontWeight: 400,
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.52)',
                whiteSpace: 'pre-line',
                maxWidth: 380,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
                ...(beat.align === 'right' ? { marginLeft: 'auto' } : {}),
              }}>
                {beat.sub}
              </div>
            </div>
          );
        })}

        {/* Scroll-to-explore indicator */}
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
            color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase',
            fontFamily: '-apple-system, sans-serif',
          }}>
            Scroll to Explore
          </div>
          <div style={{
            width: 1, height: 44,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
          }} />
        </div>

        {/* Progress bar (scroll depth) */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          height: 1.5, width: '100%',
          background: 'rgba(255,255,255,0.06)',
        }}>
          <div style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: 'linear-gradient(to right, rgba(160,80,255,0.8), rgba(80,160,255,0.8))',
            transition: 'width 0.1s linear',
          }} />
        </div>

      </div>
    </div>
  );
}
