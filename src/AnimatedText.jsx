import { useState } from 'react';
import { motion } from 'framer-motion';

export function AnimatedText({
  text,
  gradientColors = 'linear-gradient(90deg, #888, #fff, #888)',
  gradientAnimationDuration = 3,
  hoverEffect = false,
  style = {},
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.h2
      style={{
        background: gradientColors,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: 'clamp(1.4rem, 2.8vw, 3.2rem)',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        margin: 0,
        filter: isHovered ? 'brightness(1.3)' : 'brightness(1)',
        transition: 'filter 0.3s ease',
        ...style,
      }}
      animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
      transition={{ duration: gradientAnimationDuration, repeat: Infinity, ease: 'linear' }}
      onHoverStart={() => hoverEffect && setIsHovered(true)}
      onHoverEnd={() => hoverEffect && setIsHovered(false)}
    >
      {text}
    </motion.h2>
  );
}
