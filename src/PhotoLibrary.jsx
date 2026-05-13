// PhotoLibrary.jsx
// ----------------------------------------------------------------
// Responsive React + Framer Motion photo library.
// Adapts card size, grid columns, and stage dimensions to viewport.
//
// Three states:
//   1. STACKED   — photos piled at center with rotation jitter
//   2. SCATTERED — photos spread across a responsive grid
//   3. DETAIL    — one photo expanded with a shared-element animation
//
// Setup:
//   npm install framer-motion
//   import PhotoLibrary from './PhotoLibrary'
//   <PhotoLibrary />
// ----------------------------------------------------------------

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

// ── Data ────────────────────────────────────────────────────────
const PHOTOS = [
  {
    id: 1,
    type: 'gif',
    bg: '#000',
    label: 'GIF 1',
    src: '/GIF1.0.gif',
  },
  {
    id: 2,
    type: 'gif',
    bg: '#000',
    label: 'GIF 2',
    src: '/GIF2.0.gif',
  },
  {
    id: 3,
    type: 'gif',
    bg: 'linear-gradient(160deg, #1a0a00 0%, #3d1f00 50%, #000 100%)',
    label: 'Found Home',
    src: '/GIF3.0.gif',
  },
  {
    id: 4,
    type: 'gif',
    bg: '#000',
    label: 'GIF 4',
    src: '/GIF4.0.gif',
  },
  {
    id: 5,
    type: 'gif',
    bg: '#000',
    label: 'GIF 5',
    src: '/GIF5.0.gif',
  },
  {
    id: 6,
    type: 'market',
    bg: 'linear-gradient(160deg, #100919 0%, #2a0f30 40%, #3a163f 100%)',
    label: 'Markets',
    meta: {
      title: 'Markets',
      subtitle: 'Explore currency dynamics',
      primaryPair: 'Euro / US Dollar',
      primaryValue: '1.0845',
      primaryChange: '+0.24%',
      secondaryPair: 'Euro / Pound',
      secondaryValue: '0.8572',
      status: 'Neutral',
    },
  },
];

// ── Stable random seeds at module scope ─────────────────────────
const JITTER = PHOTOS.map(() => ({
  jx: Math.random() * 2 - 1,
  jy: Math.random() * 2 - 1,
  jr: Math.random() * 2 - 1,
  stackSeed: Math.random() * 10,
}));

// ── Background letter seeds ──────────────────────────────────────
const WORDS = ['CREATIVE', 'WORK'];
const ALL_LETTERS = WORDS.flatMap((word, wi) =>
  word.split('').map((char, li) => ({
    char,
    wordIndex: wi,
    letterIndex: li,
    wordLength: word.length,
    sx: Math.random(),
    sy: Math.random(),
    sr: (Math.random() * 2 - 1) * 160,
    floatDelay: Math.random() * 3,
  }))
);

// ── Hook: measure an element's size with ResizeObserver ─────────
function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
}

// ── Component ───────────────────────────────────────────────────
export default function PhotoLibrary() {
  const [scattered, setScattered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [stageRef, stage] = useElementSize();

  // Responsive card dimensions — fills ~55% of stage width on mobile, capped on desktop
  const { cardW, cardH } = useMemo(() => {
    const w = stage.w || 360;
    const cardW = Math.max(160, Math.min(320, w * 0.55));
    return { cardW, cardH: cardW * 1.35 };
  }, [stage.w]);

  // Detail card sizing — bigger on larger screens
  const detailSize = useMemo(() => {
    const base = Math.min(stage.w, stage.h) * 0.72;
    return {
      w: Math.max(260, Math.min(440, base)),
      h: Math.max(340, Math.min(560, base * 1.3)),
    };
  }, [stage.w, stage.h]);

  // STACK positions: centered with rotation jitter
  const stackPositions = useMemo(() => {
    const cx = (stage.w - cardW) / 2;
    const cy = (stage.h - cardH) / 2;
    return PHOTOS.map((_, i) => ({
      x: cx + Math.sin(JITTER[i].stackSeed) * (cardW * 0.08),
      y: cy + i * (cardH * 0.012),
      rotate: (i - PHOTOS.length / 2) * 4 + JITTER[i].jr * 5,
    }));
  }, [stage.w, stage.h, cardW, cardH]);

  // Letter positions — playful text above the stack
  const letterPositions = useMemo(() => {
    if (!stage.w || !stage.h) return [];
    const baseFontSize = Math.max(38, Math.min(80, stage.w * 0.13));
    const charW = baseFontSize * 0.64;
    const lineH = baseFontSize * 1.3;

    // anchor: top of the stack card
    const stackTopY = (stage.h - cardH) / 2;
    const textBlockH = WORDS.length * lineH;
    // place text so its bottom sits ~16px above the stack
    const baseY = stackTopY - textBlockH - 16;

    // vivid neon palette for high visibility
    const colors = ['#FF3CAC', '#FFEC45', '#00F5FF', '#FF6B00', '#B9FF3C', '#FF3CAC', '#FFEC45', '#00F5FF',
                    '#FF6B00', '#B9FF3C', '#FF3CAC', '#FFEC45'];

    return ALL_LETTERS.map((l, gi) => {
      // slight size variation per letter
      const sizeJitter = 1 + (l.sx - 0.5) * 0.28;
      const fontSize = baseFontSize * sizeJitter;
      const wordW = l.wordLength * charW;
      const wordStartX = (stage.w - wordW) / 2;
      // wavy baseline: each letter offset slightly up/down
      const waveY = Math.sin(gi * 1.1) * (baseFontSize * 0.18);
      // slight tilt per letter
      const tiltR = (l.sr / 160) * 12;
      return {
        stackX: wordStartX + l.letterIndex * charW,
        stackY: baseY + l.wordIndex * lineH + waveY,
        stackR: tiltR,
        scatterX: l.sx * Math.max(0, stage.w - charW * 1.5),
        scatterY: l.sy * Math.max(0, stage.h - fontSize * 1.5),
        scatterR: l.sr,
        fontSize,
        color: colors[gi % colors.length],
        char: l.char,
        floatDelay: l.floatDelay,
      };
    });
  }, [stage.w, stage.h, cardH]);

  // SCATTER positions: 2-column zone grid, card placed randomly within each zone
  const scatterPositions = useMemo(() => {
    if (!stage.w || !stage.h) return PHOTOS.map(() => ({ x: 0, y: 0, rotate: 0 }));
    const cols = 2;
    const rows = Math.ceil(PHOTOS.length / cols);
    const zoneW = stage.w / cols;
    const zoneH = stage.h / rows;
    return PHOTOS.map((_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = col * zoneW + zoneW / 2 - cardW / 2;
      const cy = row * zoneH + zoneH / 2 - cardH / 2;
      return {
        x: cx + JITTER[i].jx * Math.max(0, (zoneW - cardW) * 0.45),
        y: cy + JITTER[i].jy * Math.max(0, (zoneH - cardH) * 0.45),
        rotate: JITTER[i].jr * 25,
      };
    });
  }, [stage.w, stage.h, cardW, cardH]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>PORTFOLIO</h1>
          <p style={styles.subtitle}>{PHOTOS.length.toLocaleString()} items</p>
        </div>
        <div style={styles.headerActions}>
          {scattered && !selected && (
            <motion.button
              style={styles.iconBtn}
              onClick={() => setScattered(false)}
              aria-label="Re-stack"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              whileHover={{ scale: 1.12, boxShadow: '0 0 0 2px rgba(255,255,255,0.25), 0 0 16px rgba(255,255,255,0.12)' }}
              whileTap={{ scale: 0.9, rotate: -45 }}
              transition={{ type: 'spring', damping: 14, stiffness: 260 }}
            >
              <motion.span
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                whileHover={{ rotate: -180 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                <RotateCcw size={15} strokeWidth={2} />
              </motion.span>
            </motion.button>
          )}
        </div>
      </header>

      <div
        ref={stageRef}
        style={styles.stage}
        onClick={() => !scattered && setScattered(true)}
      >
        {/* Background letters */}
        {stage.w > 0 && letterPositions.map((pos, i) => (
          <motion.div
            key={`letter-${i}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              fontSize: pos.fontSize,
              fontWeight: 900,
              color: pos.color,
              letterSpacing: '0.01em',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: 1,
              fontFamily: 'inherit',
              textShadow: '0 0 18px currentColor, 0 0 40px currentColor, 0 2px 8px rgba(0,0,0,0.8)',
            }}
            animate={scattered ? {
              x: pos.scatterX,
              y: pos.scatterY,
              rotate: pos.scatterR,
              opacity: 0.55,
            } : {
              x: pos.stackX,
              y: [pos.stackY, pos.stackY - 10, pos.stackY],
              rotate: pos.stackR,
              opacity: 1,
            }}
            transition={scattered ? {
              type: 'spring',
              stiffness: 140,
              damping: 18,
              delay: i * 0.03,
            } : {
              x: { type: 'spring', stiffness: 180, damping: 22 },
              y: { repeat: Infinity, duration: 2 + pos.floatDelay * 0.4, ease: 'easeInOut', delay: pos.floatDelay },
              rotate: { type: 'spring', stiffness: 180, damping: 22 },
              opacity: { duration: 0.4 },
            }}
          >
            {pos.char}
          </motion.div>
        ))}

        {stage.w > 0 && PHOTOS.map((photo, i) => {
          const target = scattered ? scatterPositions[i] : stackPositions[i];
          const isSelected = selected?.id === photo.id;
          return (
            <motion.div
              key={photo.id}
              style={{
                ...styles.card,
                width: cardW,
                height: cardH,
                padding: `${cardW * 0.06}px ${cardW * 0.06}px ${cardW * 0.22}px`,
                zIndex: i + 10,
              }}
              animate={{
                x: target.x,
                y: target.y,
                rotate: target.rotate,
                opacity: isSelected ? 0 : 1,
                scale: isSelected ? 0.94 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 180,
                damping: 22,
                delay: scattered && !isSelected ? i * 0.025 : 0,
              }}
              whileHover={scattered && !isSelected ? { scale: 1.06, zIndex: 110 } : {}}
              whileTap={scattered && !isSelected ? { scale: 0.96 } : {}}
              onClick={(e) => {
                e.stopPropagation();
                if (scattered) setSelected(photo);
                else setScattered(true);
              }}
            >
              <div style={{ ...styles.photoInner, background: photo.bg }}>
                {photo.type === 'market' || photo.type === 'gif' ? (
                  <img
                    src={photo.type === 'gif' ? photo.src : '/2222222.gif'}
                    alt={photo.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : null}
              </div>
            </motion.div>
          );
        })}


        <AnimatePresence>
          {selected && (
            <motion.div
              style={styles.detailBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            >
              <motion.button
                style={styles.backBtn}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2 } }}
                exit={{ opacity: 0 }}
                onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                aria-label="Back"
              >←</motion.button>

              <motion.div
                style={{
                  ...styles.detailCard,
                  width: detailSize.w,
                  height: detailSize.h,
                  padding: `${detailSize.w * 0.05}px ${detailSize.w * 0.05}px ${detailSize.w * 0.2}px`,
                }}
                initial={{ opacity: 0, y: 60, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ y: 340, x: 60, rotate: 18, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.9 }}
              >
                {selected.type === 'market' || selected.type === 'gif' ? (
                  <img
                    src={selected.type === 'gif' ? selected.src : '/2222222.gif'}
                    alt={selected.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 2 }}
                  />
                ) : (
                  <div style={{ ...styles.photoInner, background: selected.bg }} />
                )}
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const styles = {
  page: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'transparent',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '16px clamp(16px, 4vw, 40px) 0',
    padding: '10px 20px',
    borderRadius: 9999,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(10,10,10,0.75)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    flexShrink: 0,
  },
  title: {
    fontSize: 'clamp(16px, 2vw, 22px)',
    fontWeight: 600,
    margin: 0,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    color: '#fff',
  },
  subtitle: {
    fontSize: 'clamp(10px, 1vw, 12px)',
    color: 'rgba(255,255,255,0.45)',
    margin: '4px 0 0',
  },
  headerActions: { display: 'flex', gap: 10 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.06) 100%)',
    border: '1px solid rgba(255,255,255,0.22)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    outline: 'none',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
  },
  selectBtn: {
    fontSize: 14,
    padding: '8px 18px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.1)',
    border: '0.5px solid rgba(0,0,0,0.1)',
    cursor: 'pointer',
  },
  stage: {
    position: 'relative',
    flex: 1,
    overflow: 'hidden',
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    background: 'linear-gradient(160deg, #fffef9 0%, #f5f0e8 100%)',
    border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: 3,
    boxSizing: 'border-box',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.9)',
  },
  photoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  marketPreview: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    padding: '14px',
    color: '#fff',
    textShadow: '0 2px 10px rgba(0,0,0,0.55)',
  },
  marketPreviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  marketPreviewTitle: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  marketPreviewTag: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  marketPreviewValue: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1,
  },
  marketPreviewSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  marketDetail: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
    padding: '20px',
    background: 'rgba(9,8,20,0.9)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#fff',
    boxSizing: 'border-box',
  },
  marketDetailHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  marketDetailHeading: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  marketDetailSubheading: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  marketDetailBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    marginTop: 18,
    flex: 1,
  },
  marketDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  marketDetailValue: {
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 1,
  },
  marketDetailPair: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginTop: 4,
  },
  marketDetailChange: {
    fontSize: 14,
    color: '#88ffb3',
    fontWeight: 700,
    marginTop: 6,
  },
  marketDetailGraph: {
    height: 70,
    borderRadius: 18,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
  },
  marketDetailFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  marketDetailSecondaryValue: {
    fontSize: 20,
    fontWeight: 700,
  },
  marketDetailSecondaryPair: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginTop: 4,
  },
  marketDetailStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.76)',
    border: '1px solid rgba(255,255,255,0.18)',
    padding: '6px 12px',
    borderRadius: 999,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  hint: {
    position: 'absolute',
    bottom: 28,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 13,
    color: '#666',
    background: '#fff',
    padding: '8px 18px',
    borderRadius: 999,
    border: '0.5px solid rgba(0,0,0,0.1)',
    pointerEvents: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  detailBackdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(40,10,6,0.92)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  backBtn: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 18,
    zIndex: 1001,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  detailCard: {
    background: 'linear-gradient(160deg, #fffef9 0%, #f5f0e8 100%)',
    border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: 3,
    boxSizing: 'border-box',
    boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.9)',
  },
  caption: {
    marginTop: 24,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontWeight: 500,
  },
};
