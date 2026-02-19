import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import LiveTicker from './LiveTicker';
import './Hero.css';

const BASE_URL = import.meta.env.BASE_URL;

const Hero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Timeline:
  // 0.00 - 0.18: Panels slide away
  // 0.12 - 0.22: Poster fades in BIG
  // 0.22 - 0.32: Poster stays big
  // 0.32 - 0.40: Poster shrinks, other elements fade in
  // 0.40 - 0.50: Everything visible
  // 0.50 - 0.60: Everything fades out together

  // Panel slide transforms
  const leftPanelX = useTransform(scrollYProgress, [0, 0.18], ['0%', '-100%']);
  const rightPanelX = useTransform(scrollYProgress, [0, 0.18], ['0%', '100%']);
  const panelOpacity = useTransform(scrollYProgress, [0.15, 0.22], [1, 0]);

  // Wanted poster - fades in big, holds, then shrinks
  const posterScale = useTransform(scrollYProgress, [0.12, 0.22, 0.32, 0.40], [0.9, 1.35, 1.35, 1]);
  const posterOpacity = useTransform(scrollYProgress, [0.12, 0.22, 0.50, 0.60], [0, 1, 1, 0]);
  const posterY = useTransform(scrollYProgress, [0.12, 0.22, 0.32, 0.40, 0.50, 0.60], [60, 40, 40, 0, 0, -60]);

  // Other elements - fade in as poster shrinks, stay until end
  const subtitlesOpacity = useTransform(scrollYProgress, [0.34, 0.40, 0.50, 0.60], [0, 1, 1, 0]);
  const subtitlesY = useTransform(scrollYProgress, [0.34, 0.40, 0.50, 0.60], [25, 0, 0, -40]);

  const statusOpacity = useTransform(scrollYProgress, [0.36, 0.42, 0.50, 0.60], [0, 1, 1, 0]);
  const statusY = useTransform(scrollYProgress, [0.36, 0.42, 0.50, 0.60], [25, 0, 0, -40]);

  const marqueeOpacity = useTransform(scrollYProgress, [0.38, 0.44, 0.50, 0.60], [0, 1, 1, 0]);
  const marqueeY = useTransform(scrollYProgress, [0.38, 0.44, 0.50, 0.60], [25, 0, 0, -40]);

  // Hide entire fixed layer after hero section
  const layerOpacity = useTransform(scrollYProgress, [0.55, 0.65], [1, 0]);

  // Panel images
  const leftPanelImage = `${BASE_URL}leftpanel.jpg`;
  const rightPanelImage = `${BASE_URL}rightpanel.jpg`;


  return (
    <section className="hero" ref={containerRef}>
      {/* Background text layer - revealed as panels slide */}
      <motion.div className="hero-content-layer" style={{ opacity: layerOpacity }}>
        <div className="hero-text-reveal">
          {/* Wanted poster - appears big first, shrinks as you scroll */}
          <motion.div
            className="wanted-poster"
            style={{
              scale: posterScale,
              opacity: posterOpacity,
              y: posterY,
            }}
          >
            <img src={`${BASE_URL}wanted-poster.png`} alt="Akash Patel - Wanted Poster" />
          </motion.div>

          {/* Subtitles - fade in after poster shrinks */}
          <motion.div
            className="hero-subtitles"
            style={{
              opacity: subtitlesOpacity,
              y: subtitlesY,
            }}
          >
            <h5>
              Software Engineer<br />Chicago, IL
            </h5>
            <h5>
              Navy veteran<br />security clearance
            </h5>
          </motion.div>

          {/* Status badge - fade in after subtitles */}
          <motion.div
            className="hero-status"
            style={{
              opacity: statusOpacity,
              y: statusY,
            }}
          >
            <span className="status-badge">
              <span className="status-dot"></span>
              Open to Opportunities
            </span>
          </motion.div>

          {/* Tech marquee - fade in last */}
          <motion.div
            className="hero-clients"
            style={{
              opacity: marqueeOpacity,
              y: marqueeY,
            }}
          >
            <LiveTicker />
          </motion.div>
        </div>
      </motion.div>

      {/* Sliding panels layer */}
      <motion.div className="hero-panels" style={{ opacity: panelOpacity }}>
        {/* Left Panel */}
        <motion.div
          className="hero-panel hero-panel-left"
          style={{ x: leftPanelX }}
        >
          <div className="panel-content">
            <motion.div
              className="panel-image panel-image-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <img src={leftPanelImage} alt="Left Panel" />
            </motion.div>
          </div>
          <div className="panel-border"></div>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          className="hero-panel hero-panel-right"
          style={{ x: rightPanelX }}
        >
          <div className="panel-border"></div>
          <div className="panel-content">
            <motion.div
              className="panel-image panel-image-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img src={rightPanelImage} alt="Right Panel" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        style={{ opacity: useTransform(scrollYProgress, [0, 0.2], [1, 0]) }}
      >
        <div className="scroll-line"></div>
        <span>Scroll to reveal</span>
      </motion.div>
    </section>
  );
};

export default Hero;
