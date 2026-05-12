const rings = [
  { inset: '30%', color: 'rgba(240,210,100,0.55)', delay: '0.2s', zIndex: 97 },
  { inset: '20%', color: 'rgba(240,210,100,0.35)', delay: '0.4s', zIndex: 96 },
  { inset: '10%', color: 'rgba(240,210,100,0.2)',  delay: '0.6s', zIndex: 95 },
  { inset: '0%',  color: 'rgba(240,210,100,0.1)',  delay: '0.8s', zIndex: 94 },
];

export function RippleCircles() {
  return (
    <div style={{ position: 'relative', width: 250, height: 250, flexShrink: 0 }}>

      {/* Glow rings */}
      {rings.map((r, i) => (
        <span key={i} style={{
          position: 'absolute',
          inset: r.inset,
          borderRadius: '50%',
          border: `1px solid ${r.color}`,
          background: 'rgba(240,210,80,0.03)',
          animation: `moon-ripple 2.8s infinite ease-in-out ${r.delay}`,
          zIndex: r.zIndex,
        }} />
      ))}

      {/* Crescent moon: bright circle with offset dark overlay */}
      <div style={{
        position: 'absolute',
        inset: '35%',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 38%, #fffbe0, #f5d050)',
        boxShadow: '0 0 14px rgba(245,208,80,0.95), 0 0 32px rgba(245,208,80,0.5), 0 0 60px rgba(245,208,80,0.2)',
        zIndex: 99,
        overflow: 'hidden',
      }}>
        {/* Dark cutout to create crescent shape */}
        <div style={{
          position: 'absolute',
          top: '-12%',
          left: '24%',
          width: '92%',
          height: '92%',
          borderRadius: '50%',
          background: '#06060e',
        }} />
      </div>

    </div>
  );
}
