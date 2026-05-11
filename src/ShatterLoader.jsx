import { useEffect, useRef, useState } from 'react';

const HOLD_MS = 0;
const SHATTER_MS = 1200;

const shards = [
  { n: 1, clip: 'polygon(0 0, 35% 0, 30% 40%, 0 35%)' },
  { n: 2, clip: 'polygon(35% 0, 70% 0, 75% 45%, 30% 40%)' },
  { n: 3, clip: 'polygon(70% 0, 100% 0, 100% 40%, 75% 45%)' },
  { n: 4, clip: 'polygon(0 35%, 30% 40%, 25% 75%, 0 70%)' },
  { n: 5, clip: 'polygon(30% 40%, 75% 45%, 70% 80%, 25% 75%)' },
  { n: 6, clip: 'polygon(75% 45%, 100% 40%, 100% 75%, 70% 80%)' },
  { n: 7, clip: 'polygon(0 70%, 25% 75%, 30% 100%, 0 100%)' },
  { n: 8, clip: 'polygon(25% 75%, 70% 80%, 75% 100%, 30% 100%)' },
  { n: 9, clip: 'polygon(70% 80%, 100% 75%, 100% 100%, 75% 100%)' },
];

export default function ShatterLoader({ children }) {
  const [phase, setPhase] = useState('idle'); // idle | shattering | done
  const sectionRef = useRef(null);
  const triggered = useRef(false);

  useEffect(() => {
    const container = document.querySelector('.scroll-container');
    const section = sectionRef.current;
    if (!container || !section) return;

    const trigger = () => {
      if (triggered.current) return;
      const scrolled = container.scrollTop;
      const sectionTop = section.offsetTop;
      const viewH = container.clientHeight;
      if (scrolled + viewH * 0.5 >= sectionTop) {
        triggered.current = true;
        setTimeout(() => setPhase('shattering'), HOLD_MS);
        setTimeout(() => setPhase('done'), HOLD_MS + SHATTER_MS);
      }
    };

    container.addEventListener('scroll', trigger);
    trigger(); // check in case already in view
    return () => container.removeEventListener('scroll', trigger);
  }, []);

  return (
    <div ref={sectionRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
      {phase !== 'done' && (
        <div className={`shatter-loader${phase === 'shattering' ? ' shattering' : ''}`}>
          {shards.map(({ n, clip }) => (
            <div key={n} className={`shard shard-${n}`} style={{ clipPath: clip }}>
              <div className="shard-bg" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
