import { motion } from 'framer-motion';
import { useScrollReveal } from '../hooks/useScrollReveal';
import Marquee from './Marquee';
import './CTA.css';

const CTA = () => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.2 });

  const images = [
    { type: 'image', src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop', alt: 'Circuit Board' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop', alt: 'Code on Screen' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&h=100&fit=crop', alt: 'Server Room' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&h=100&fit=crop', alt: 'Laptop Code' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=100&h=100&fit=crop', alt: 'Tech Lab' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&h=100&fit=crop', alt: 'Cybersecurity' },
  ];

  return (
    <section className="cta" id="contact" ref={ref}>
      <div className="container">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 50 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="cta-text">
            <h2>Let's build</h2>
            <h2>something great</h2>
          </div>
          <a href="mailto:akashp3128@gmail.com" className="btn btn-primary cta-btn">
            Get in Touch
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        </motion.div>
      </div>

      <motion.div
        className="cta-marquee"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="marquee-images">
          <Marquee items={images} speed={40} />
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
