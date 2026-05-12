const circles = [
  { inset: '40%', borderColor: 'rgba(107,114,128,0.8)', delay: '0s',    zIndex: 98 },
  { inset: '30%', borderColor: 'rgba(107,114,128,0.6)', delay: '0.2s',  zIndex: 97 },
  { inset: '20%', borderColor: 'rgba(107,114,128,0.4)', delay: '0.4s',  zIndex: 96 },
  { inset: '10%', borderColor: 'rgba(107,114,128,0.3)', delay: '0.6s',  zIndex: 95 },
  { inset: '0%',  borderColor: 'rgba(107,114,128,0.2)', delay: '0.8s',  zIndex: 94 },
];

export function RippleCircles() {
  return (
    <div style={{ position: 'relative', width: 250, height: 250, flexShrink: 0 }}>
      {circles.map((c, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            inset: c.inset,
            borderRadius: '50%',
            border: `1px solid ${c.borderColor}`,
            background: 'linear-gradient(to top right, rgba(107,114,128,0.1), rgba(156,163,175,0.1))',
            backdropFilter: 'blur(4px)',
            animation: `ripple 2s infinite ease-in-out ${c.delay}`,
            zIndex: c.zIndex,
          }}
        />
      ))}
    </div>
  );
}
