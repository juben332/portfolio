import * as React from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Navigation, Aperture } from 'lucide-react';

const navItems = [
  { name: 'Home',     href: '#' },
  { name: 'About',    href: '#' },
  { name: 'Services', href: '#' },
  { name: 'Contact',  href: '#' },
];

const EXPAND_SCROLL_THRESHOLD = 80;

// ── Desktop pill variants ────────────────────────────────────────
const containerVariants = {
  expanded: {
    y: 0, opacity: 1, width: 'auto',
    transition: {
      y: { type: 'spring', damping: 18, stiffness: 250 },
      opacity: { duration: 0.3 },
      type: 'spring', damping: 20, stiffness: 300,
      staggerChildren: 0.07, delayChildren: 0.2,
    },
  },
  collapsed: {
    y: 0, opacity: 1, width: '3rem',
    transition: {
      type: 'spring', damping: 20, stiffness: 300,
      when: 'afterChildren', staggerChildren: 0.05, staggerDirection: -1,
    },
  },
};

const logoVariants = {
  expanded:  { opacity: 1, x: 0,   rotate: 0,    transition: { type: 'spring', damping: 15 } },
  collapsed: { opacity: 0, x: -25, rotate: -180,  transition: { duration: 0.3 } },
};

const itemVariants = {
  expanded:  { opacity: 1, x: 0,   scale: 1,    transition: { type: 'spring', damping: 15 } },
  collapsed: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2 } },
};

const collapsedIconVariants = {
  expanded:  { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  collapsed: { opacity: 1, scale: 1,   transition: { type: 'spring', damping: 15, stiffness: 300, delay: 0.15 } },
};

// ── Shared glass style ───────────────────────────────────────────
const glass = {
  background: 'rgba(10,10,10,0.78)',
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
  border: '1px solid rgba(255,255,255,0.14)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
};

export function AnimatedNav() {
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < 640);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isExpanded, setExpanded] = React.useState(true);

  const { scrollY } = useScroll();
  const lastScrollY = React.useRef(0);
  const scrollPositionOnCollapse = React.useRef(0);

  // Mobile detection
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close mobile menu on outside click
  React.useEffect(() => {
    if (!mobileOpen) return;
    const close = () => setMobileOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [mobileOpen]);

  // Desktop scroll collapse
  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (isMobile) return;
    const previous = lastScrollY.current;
    if (isExpanded && latest > previous && latest > 150) {
      setExpanded(false);
      scrollPositionOnCollapse.current = latest;
    } else if (!isExpanded && latest < previous && (scrollPositionOnCollapse.current - latest > EXPAND_SCROLL_THRESHOLD)) {
      setExpanded(true);
    }
    lastScrollY.current = latest;
  });

  // ── Mobile nav ─────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
        {/* Aperture icon button */}
        <motion.button
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 220, delay: 0.1 }}
          onClick={(e) => { e.stopPropagation(); setMobileOpen((o) => !o); }}
          style={{
            ...glass,
            position: 'relative',
            width: 52, height: 52,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            outline: 'none',
            padding: 0,
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          {/* Pulse ring */}
          <motion.span
            style={{
              position: 'absolute',
              inset: -5,
              borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.3)',
              pointerEvents: 'none',
            }}
            animate={{ scale: [1, 1.45, 1], opacity: [0.55, 0, 0.55] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
          />
          {/* Second slower ring */}
          <motion.span
            style={{
              position: 'absolute',
              inset: -10,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
              pointerEvents: 'none',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 0.4 }}
          />

          {/* Aperture icon — rotates when open */}
          <motion.div
            animate={{ rotate: mobileOpen ? 90 : 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 200 }}
            style={{ color: '#fff', display: 'flex' }}
          >
            <Aperture size={22} strokeWidth={1.5} />
          </motion.div>
        </motion.button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.94 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{    opacity: 0, y: -8, scale: 0.94 }}
              transition={{ type: 'spring', damping: 20, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                ...glass,
                position: 'absolute',
                top: 64,
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: 20,
                padding: '10px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minWidth: 150,
                overflow: 'hidden',
              }}
            >
              {/* Decorative top line */}
              <div style={{
                width: 32, height: 2,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.2)',
                margin: '0 auto 8px',
              }} />

              {navItems.map((item, i) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.055, type: 'spring', damping: 16 }}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.7)',
                    textDecoration: 'none',
                    padding: '9px 16px',
                    borderRadius: 12,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }}
                >
                  {/* Dot accent */}
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.35)',
                    flexShrink: 0,
                  }} />
                  {item.name}
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Desktop pill nav ────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        variants={containerVariants}
        whileHover={!isExpanded ? { scale: 1.1 } : {}}
        whileTap={!isExpanded  ? { scale: 0.95 } : {}}
        onClick={() => { if (!isExpanded) setExpanded(true); }}
        style={{
          ...glass,
          display: 'flex', alignItems: 'center',
          overflow: 'hidden', borderRadius: 9999,
          height: 48,
          cursor: isExpanded ? 'default' : 'pointer',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          position: 'relative',
        }}
      >
        <motion.div
          variants={logoVariants}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', paddingLeft: 16, paddingRight: 8, color: '#fff' }}
        >
          <Navigation size={20} />
        </motion.div>

        <motion.div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 16, pointerEvents: isExpanded ? 'auto' : 'none' }}>
          {navItems.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              variants={itemVariants}
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)', padding: '4px 10px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.65)'}
            >
              {item.name}
            </motion.a>
          ))}
        </motion.div>

        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <motion.div variants={collapsedIconVariants} animate={isExpanded ? 'expanded' : 'collapsed'} style={{ color: '#fff' }}>
            <Aperture size={20} strokeWidth={1.5} />
          </motion.div>
        </div>
      </motion.nav>
    </div>
  );
}
