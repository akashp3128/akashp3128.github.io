import { useState, useCallback } from 'react';

export const useTilt = (options = {}) => {
  const {
    max = 15,           // Max tilt rotation in degrees
    scale = 1.05,       // Scale on hover
    speed = 400,        // Transition speed in ms
    glare = true,       // Enable glare effect
    maxGlare = 0.3,     // Max glare opacity
  } = options;

  const [style, setStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    transition: `transform ${speed}ms ease-out`,
  });

  const [glareStyle, setGlareStyle] = useState({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)',
    opacity: 0,
    transition: `opacity ${speed}ms ease-out`,
    borderRadius: 'inherit',
  });

  const handleMouseMove = useCallback((e) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();

    // Calculate mouse position relative to element center
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Calculate rotation (inverted for natural feel)
    const rotateX = (mouseY / (rect.height / 2)) * -max;
    const rotateY = (mouseX / (rect.width / 2)) * max;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
      transition: 'transform 100ms ease-out',
    });

    if (glare) {
      // Calculate glare position
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;

      setGlareStyle(prev => ({
        ...prev,
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${maxGlare}) 0%, rgba(255,255,255,0) 60%)`,
        opacity: 1,
      }));
    }
  }, [max, scale, glare, maxGlare]);

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: `transform ${speed}ms ease-out`,
    });

    if (glare) {
      setGlareStyle(prev => ({
        ...prev,
        opacity: 0,
      }));
    }
  }, [speed, glare]);

  return {
    style,
    glareStyle,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
};
