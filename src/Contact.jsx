import { motion } from 'framer-motion';

const socials = [
  { label: 'Email',    value: 'wardopon123@gmail.com', href: 'mailto:wardopon123@gmail.com' },
  { label: 'GitHub',   value: 'github.com/juben332',   href: 'https://github.com/juben332' },
];

export default function Contact() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(160deg, #0d0d0d 0%, #0a0012 50%, #0d0d0d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: '25%', right: '15%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,80,160,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', left: '10%', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(80,120,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, width: '100%' }}>

        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 999, padding: '5px 14px', marginBottom: 28,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff50a0', display: 'inline-block' }} />
          Contact
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          viewport={{ once: true }}
          style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#fff',
            marginBottom: 16,
          }}
        >
          Let's work<br />
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>together.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.75,
            marginBottom: 44,
          }}
        >
          Have a project in mind or just want to say hi?<br />
          Reach out — I'm always open to new ideas.
        </motion.p>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {socials.map((s, i) => (
            <motion.a
              key={s.label}
              href={s.href}
              target={s.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              viewport={{ once: true }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 22px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                textDecoration: 'none',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{s.value}</div>
              </div>
              <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.25)' }}>↗</span>
            </motion.a>
          ))}
        </div>

        {/* Footer line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          style={{
            marginTop: 48,
            fontSize: 12,
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.06em',
            textAlign: 'center',
          }}
        >
          © {new Date().getFullYear()} — Built with React & Framer Motion
        </motion.p>

      </div>
    </div>
  );
}
