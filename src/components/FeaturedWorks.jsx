import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import TiltCard from './TiltCard';
import './FeaturedWorks.css';

const BASE_URL = import.meta.env.BASE_URL;

const FeaturedWorks = () => {
  const sectionRef = useRef(null);

  // Use the container element for scroll tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'], // Animate from start to end of the section
  });

  // Simplified Timeline - start visible, subtle animations on scroll
  // Header and cards start visible, with gentle movement on scroll

  // Header animations - start visible with subtle movement
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.2], [0, 0]);
  const descOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 1]);
  const descY = useTransform(scrollYProgress, [0, 0.2], [0, 0]);

  // Card animations - start visible with subtle scale/movement
  const card1Opacity = useTransform(scrollYProgress, [0, 0.05], [1, 1]);
  const card2Opacity = useTransform(scrollYProgress, [0, 0.1], [1, 1]);
  const card3Opacity = useTransform(scrollYProgress, [0, 0.15], [1, 1]);
  const card4Opacity = useTransform(scrollYProgress, [0, 0.2], [1, 1]);

  // CTA animation - start visible
  const ctaOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 1]);
  const ctaY = useTransform(scrollYProgress, [0, 0.2], [0, 0]);

  const card1Y = useTransform(scrollYProgress, [0, 0.3], [0, -10]);
  const card2Y = useTransform(scrollYProgress, [0, 0.3], [0, -10]);
  const card3Y = useTransform(scrollYProgress, [0, 0.3], [0, -10]);
  const card4Y = useTransform(scrollYProgress, [0, 0.3], [0, -10]);

  const cardOpacities = [card1Opacity, card2Opacity, card3Opacity, card4Opacity];
  const cardYs = [card1Y, card2Y, card3Y, card4Y];

  const projects = [
    {
      id: 1,
      title: 'RAYCASTING ENGINE',
      category: 'Graphics / C++',
      image: `${BASE_URL}raycasting-engine.png`,
      color: '#8B0000',
      link: 'https://github.com/akashp3128/Raycasting-engine',
    },
    {
      id: 2,
      title: 'FADE',
      category: 'Mobile App / Flutter',
      image: `${BASE_URL}fade-landing.png`,
      color: '#D4AF37',
      link: 'https://github.com/akashp3128/fade-app',
    },
    {
      id: 3,
      title: 'SPACEX BEAM PLANNER',
      category: 'Algorithms / C++',
      image: `${BASE_URL}spacex-beam.png`,
      color: '#00ff00',
      link: 'https://github.com/akashp3128/SpaceX-Beam-Planner',
    },
    {
      id: 4,
      title: 'EJPRINT4U',
      category: 'Freelance / Next.js',
      image: `${BASE_URL}ejprint4u.png`,
      color: '#E63946',
      link: 'https://ejprint4u.com',
    },
  ];

  return (
    <section className="featured-works" id="works" ref={sectionRef}>
      <div className="container">
        <div className="works-header">
          <motion.h2 style={{ opacity: titleOpacity, y: titleY }}>
            Featured Projects
          </motion.h2>
          <motion.p style={{ opacity: descOpacity, y: descY }}>
            A showcase of my engineering work—from embedded systems to cloud applications.
            Each project represents challenges solved and systems built with precision
            and performance in mind.
          </motion.p>
        </div>

        <div className="works-grid">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              style={{
                opacity: cardOpacities[index],
                y: cardYs[index],
              }}
            >
              <TiltCard className="work-card-wrapper">
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="work-card">
                  <div className="work-image">
                    <img src={project.image} alt={project.title} />
                    <div className="work-overlay">
                      <span>View Project</span>
                    </div>
                    <div
                      className="work-glow"
                      style={{ background: project.color }}
                    />
                  </div>
                  <div className="work-info">
                    <h4>{project.title}</h4>
                    <h6>{project.category}</h6>
                  </div>
                </a>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="works-cta"
          style={{ opacity: ctaOpacity, y: ctaY }}
        >
          <a href="https://github.com/akashp3128" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            View GitHub
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedWorks;
