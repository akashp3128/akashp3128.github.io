import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './About.css';

const BASE_URL = import.meta.env.BASE_URL;

const About = () => {
  const sectionRef = useRef(null);

  // Scroll progress - similar to Hero, tracking from section start to end
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Content starts visible - no scroll-triggered animations needed
  // All elements visible by default for better UX on anchor navigation

  // Text content - always visible
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 1]);
  const titleX = useTransform(scrollYProgress, [0, 0.1], [0, 0]);

  const textOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 1]);
  const textX = useTransform(scrollYProgress, [0, 0.1], [0, 0]);

  const highlightsOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 1]);
  const highlightsY = useTransform(scrollYProgress, [0, 0.1], [0, 0]);

  const ctaOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 1]);
  const ctaY = useTransform(scrollYProgress, [0, 0.1], [0, 0]);

  // Cards - always visible with slight rotation for visual interest (subtle to prevent clipping)
  const card1Rotate = useTransform(scrollYProgress, [0, 0.1], [-2, -2]);
  const card2Rotate = useTransform(scrollYProgress, [0, 0.1], [1.5, 1.5]);
  const card3Rotate = useTransform(scrollYProgress, [0, 0.1], [-1.5, -1.5]);
  const card4Rotate = useTransform(scrollYProgress, [0, 0.1], [2, 2]);
  const card5Rotate = useTransform(scrollYProgress, [0, 0.1], [-1, -1]);
  const card6Rotate = useTransform(scrollYProgress, [0, 0.1], [1.5, 1.5]);

  // Your personal photos
  const images = [
    { src: `${BASE_URL}about-gym.jpg`, alt: 'Fitness' },
    { src: `${BASE_URL}about-iowa-state.jpg`, alt: 'Iowa State University' },
    { src: `${BASE_URL}about-chiefs.jpg`, alt: 'Chiefs Fan' },
    { src: `${BASE_URL}about-gymnastics.jpg`, alt: 'Gymnastics' },
    { src: `${BASE_URL}about-esp.jpg`, alt: 'ESP32 Project' },
    { src: `${BASE_URL}about-photo6.jpg`, alt: 'Personal' },
  ];

  const cardRotations = [card1Rotate, card2Rotate, card3Rotate, card4Rotate, card5Rotate, card6Rotate];

  const highlights = [
    { label: 'Navy Veteran', value: '8 Years' },
    { label: 'Education', value: 'B.S. Software Engineering' },
    { label: 'Clearance', value: 'Secret' },
  ];

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="container">
        <div className="about-grid">
          <div className="about-content">
            <motion.h2
              style={{
                opacity: titleOpacity,
                x: titleX,
              }}
            >
              Who I Am
            </motion.h2>

            <motion.div
              className="about-text"
              style={{
                opacity: textOpacity,
                x: textX,
              }}
            >
              <p>
                I'm a curious engineer who thrives at the intersection of hardware and software.
                With 8 years in the U.S. Navy as a Hull Maintenance Technician and a B.S. in
                Software Engineering from Iowa State University, I bring a unique perspective
                to every problem I tackle.
              </p>
              <p>
                When I'm not writing code, you'll find me snowboarding, playing chess, diving
                into battle royale games, or exploring the world of finance and crypto. I believe
                the best engineers are endlessly curious—and I never stop learning.
              </p>

              <motion.div
                className="about-highlights"
                style={{
                  opacity: highlightsOpacity,
                  y: highlightsY,
                }}
              >
                {highlights.map((item, index) => (
                  <div key={index} className="highlight-item">
                    <span className="highlight-value">{item.value}</span>
                    <span className="highlight-label">{item.label}</span>
                  </div>
                ))}
              </motion.div>

              <motion.a
                href="#contact"
                className="btn btn-outline"
                style={{
                  opacity: ctaOpacity,
                  y: ctaY,
                }}
              >
                Let's Connect
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </motion.a>
            </motion.div>
          </div>

          <div className="about-images">
            {images.map((img, index) => (
              <motion.div
                key={index}
                className="about-image"
                style={{
                  rotate: cardRotations[index],
                }}
              >
                <img src={img.src} alt={img.alt} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
