import ShatterLoader from './ShatterLoader';
import { AnimatedText } from './AnimatedText';
import ScratchToReveal from './ScratchToReveal';
import { RippleCircles } from './RippleCircles';

export default function About() {
  return (
    <ShatterLoader>
      <ScratchToReveal
        coverColor="#f5ede0"
        coverText=""
        threshold={50}
        brushSize={70}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>

          {/* Background image */}
          <div style={{
            position: 'absolute', inset: 0,
            background: '#000 url("/BG-about.png") center center/cover no-repeat',
          }} />

          {/* Subtle dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)' }} />

          {/* Ripple circles — top-left mobile, top-right desktop */}
          <div className="ripple-wrapper">
            <RippleCircles />
          </div>

          {/* Animated text */}
          <div className="about-text-container">
            <p style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: 'clamp(11px, 1.1vw, 13px)',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: 10,
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}>Juben Recto</p>
            <AnimatedText
              text="Frontend Developer & Designer"
              gradientColors="linear-gradient(90deg, #666, #fff, #aaa, #fff, #666)"
              gradientAnimationDuration={4}
              hoverEffect
            />
            <p style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: 'clamp(11px, 1.2vw, 14px)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginTop: 16,
              fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}>
              Crafting digital experiences with code &amp; design
            </p>
          </div>

        </div>
      </ScratchToReveal>
    </ShatterLoader>
  );
}
