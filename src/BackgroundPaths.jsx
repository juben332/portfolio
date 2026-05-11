import { motion } from 'framer-motion';

// Each path is defined in a 100×100 viewBox (portrait).
// dy = how many CSS px it drifts vertically in its infinite loop.
const PATHS = [
  { d: 'M -5 18 C 15 8,  38 32, 58 22 S 85  4, 106 18',  opacity: 0.26, sw: 1.4, dur: 9,  delay: 0,   dy: 9  },
  { d: 'M -5 48 C 18 36, 42 58, 62 46 S 88 28, 106 44',  opacity: 0.18, sw: 1.0, dur: 13, delay: 1.5, dy: 11 },
  { d: 'M -5 72 C 22 62, 46 80, 68 70 S 88 54, 106 68',  opacity: 0.22, sw: 1.6, dur: 8,  delay: 3,   dy: 7  },
  { d: 'M  8 -5 C 18 18, 12 44, 24 64 S 28 86, 18 106',  opacity: 0.20, sw: 1.2, dur: 11, delay: 0.5, dy: 8  },
  { d: 'M 38 -5 C 50 14, 44 40, 54 60 S 50 82, 44 106',  opacity: 0.16, sw: 0.8, dur: 15, delay: 2,   dy: 10 },
  { d: 'M 68 -5 C 62 18, 78 44, 68 64 S 72 84, 78 106',  opacity: 0.24, sw: 1.5, dur: 10, delay: 4,   dy: 8  },
  { d: 'M -5 32 C 28 22, 52 48, 76 36 S 96 14, 106 32',  opacity: 0.15, sw: 0.7, dur: 17, delay: 1,   dy: 13 },
  { d: 'M -5 86 C 22 76, 50 92, 72 82 S 92 70, 106 82',  opacity: 0.20, sw: 1.1, dur: 14, delay: 3.5, dy: 7  },
  { d: 'M 20 -5 C 30 22, 18 50, 32 72 S 36 90, 24 106',  opacity: 0.17, sw: 0.9, dur: 12, delay: 5,   dy: 9  },
  { d: 'M 55 -5 C 70 20, 58 48, 72 68 S 68 88, 60 106',  opacity: 0.19, sw: 1.0, dur: 16, delay: 2.5, dy: 11 },
  { d: 'M -5 60 C 30 48, 55 70, 80 58 S 100 40, 106 56', opacity: 0.15, sw: 0.8, dur: 18, delay: 0.8, dy: 14 },
  { d: 'M 85 -5 C 78 24, 92 50, 82 72 S 88 90, 94 106',  opacity: 0.21, sw: 1.3, dur: 11, delay: 6,   dy: 8  },
];

export function BackgroundPaths({ children }) {
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#000',
      overflow: 'hidden',
    }}>
      {/* Animated SVG paths layer */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        {PATHS.map((p, i) => (
          <motion.path
            key={i}
            d={p.d}
            fill="none"
            stroke="rgba(255, 255, 255, 1)"
            strokeOpacity={p.opacity}
            strokeWidth={p.sw}
            strokeLinecap="round"
            animate={{ y: [0, p.dy, 0] }}
            transition={{
              repeat: Infinity,
              duration: p.dur,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {/* Content layer */}
      {children && (
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
          {children}
        </div>
      )}
    </div>
  );
}
