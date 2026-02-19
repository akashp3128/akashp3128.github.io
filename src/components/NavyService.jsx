import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ImageLightbox from './ImageLightbox';
import './NavyService.css';

const BASE_URL = import.meta.env.BASE_URL;

const NavyService = () => {
  const sectionRef = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentEvalIndex, setCurrentEvalIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Content always visible
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 1]);

  // Card rotations for visual interest (subtle to prevent clipping)
  const card1Rotate = useTransform(scrollYProgress, [0, 0.1], [-1.5, -1.5]);
  const card2Rotate = useTransform(scrollYProgress, [0, 0.1], [2, 2]);
  const card3Rotate = useTransform(scrollYProgress, [0, 0.1], [-2, -2]);
  const card4Rotate = useTransform(scrollYProgress, [0, 0.1], [1.5, 1.5]);

  const navyPhotos = [
    { src: `${BASE_URL}navy-submarine.jpg`, alt: 'Submarine at port' },
    { src: `${BASE_URL}navy-portrait.jpg`, alt: 'Navy portrait' },
    { src: `${BASE_URL}about-navy.jpg`, alt: 'Navy service' },
    { src: `${BASE_URL}about-welding.png`, alt: 'Welding work' },
  ];

  const cardRotations = [card1Rotate, card2Rotate, card3Rotate, card4Rotate];

  const evalImages = [
    {
      src: `${BASE_URL}navy-evals/eval-1.jpg`,
      alt: 'Navy Evaluation 2017',
      caption: 'Performance Evaluation - Early Promote Recommendation',
      period: 'OCT 2016 - SEP 2017',
      rank: 'HTFN',
      recommendation: 'Early Promote',
      command: 'USS Michigan (SSGN-727)'
    },
    {
      src: `${BASE_URL}navy-evals/eval-4.jpg`,
      alt: 'Navy Evaluation 2018',
      caption: 'Performance Evaluation - Technical Excellence',
      period: 'OCT 2017 - SEP 2018',
      rank: 'HT3',
      recommendation: 'Early Promote',
      command: 'USS Frank Cable (AS-40)'
    },
    {
      src: `${BASE_URL}navy-evals/eval-3.jpg`,
      alt: 'Navy Evaluation 2019',
      caption: 'Performance Evaluation - Leadership Recognition',
      period: 'OCT 2018 - SEP 2019',
      rank: 'HT2',
      recommendation: 'Must Promote',
      command: 'USS Washington'
    },
    {
      src: `${BASE_URL}navy-evals/eval-2.jpg`,
      alt: 'Navy Evaluation 2020',
      caption: 'Performance Evaluation - Mission Impact',
      period: 'OCT 2019 - SEP 2020',
      rank: 'HT2',
      recommendation: 'Early Promote',
      command: 'NOSC Des Moines - SurgeMain'
    },
    {
      src: `${BASE_URL}navy-evals/eval-5.jpg`,
      alt: 'Navy Evaluation NDT 2021',
      caption: 'NDT Inspector Evaluation - Puget Sound Naval Shipyard',
      period: 'OCT 2020 - SEP 2021',
      rank: 'HT2/NDT',
      recommendation: 'Must Promote',
      command: 'PSNS Code 135'
    },
  ];

  const evalQuotes = [
    {
      quote: "A NATURAL, PROVEN LEADER! Led PRTs for 150 Sailors and established a running group for 35 more—resulting in a 98% passage rate.",
      source: "Commanding Officer",
      year: "2020"
    },
    {
      quote: "Meticulous in performing quality inspections. Work conducted was critical to keeping projects on schedule and identifying flaws to be remedied.",
      source: "NDT Lab Supervisor, PSNS",
      year: "2021"
    },
    {
      quote: "Remarkable work ethic and is ready NOW for advancement. He has my STRONGEST recommendation for advancement.",
      source: "Division Chief, USS Michigan",
      year: "2017"
    }
  ];

  const roles = [
    {
      title: 'Hull Maintenance Technician (HT)',
      period: '2013 - 2019',
      description: 'Specialized in welding, metal fabrication, and damage control aboard Submarine Tenders and nuclear submarines.',
      skills: ['Welding & Fabrication', 'Damage Control', 'Shipboard Preservation'],
      vessels: ['USS Michigan (SSGN-727)', 'USS Washington', 'USS Frank Cable', 'USS Emory S. Land'],
    },
    {
      title: 'NDT Inspector (Level II)',
      period: '2019 - 2021',
      description: 'Conducted Non-Destructive Testing inspections at Puget Sound Naval Shipyard Code 135 Lab.',
      skills: ['Visual Testing', 'Magnetic Particle', 'Dye Penetrant'],
      vessels: ['USS Louisiana', 'USS Michigan', 'USS Bremerton'],
    },
  ];

  const stats = [
    { value: '8 Years', label: 'Service' },
    { value: 'E-5', label: 'Petty Officer 2nd Class' },
    { value: 'Secret', label: 'Clearance' },
  ];

  const openLightbox = (index) => {
    setCurrentEvalIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentEvalIndex((prev) => (prev + 1) % evalImages.length);
  };

  const prevImage = () => {
    setCurrentEvalIndex((prev) => (prev - 1 + evalImages.length) % evalImages.length);
  };

  return (
    <section className="navy-service" id="navy" ref={sectionRef}>
      <div className="container">
        <div className="navy-grid">
          <div className="navy-content">
            <motion.h2 style={{ opacity: titleOpacity }}>
              Navy Service
            </motion.h2>

            <motion.div className="navy-text" style={{ opacity: contentOpacity }}>
              <p className="navy-intro">
                Eight years of service in the U.S. Navy shaped my discipline,
                technical expertise, and leadership. From welding critical repairs on submarines
                to conducting precision inspections, I learned that attention to detail isn't
                optional—it's mission-critical.
              </p>

              <div className="navy-roles">
                {roles.map((role, index) => (
                  <div key={index} className="role-card">
                    <div className="role-header">
                      <h4>{role.title}</h4>
                      <span className="role-period">{role.period}</span>
                    </div>
                    <p>{role.description}</p>
                    <div className="role-skills">
                      {role.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                    <div className="role-vessels">
                      <strong>Vessels:</strong> {role.vessels.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="navy-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>

              <a href="#evals" className="btn btn-outline">
                View Evaluations
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                </svg>
              </a>
            </motion.div>
          </div>

          <div className="navy-images">
            {navyPhotos.map((img, index) => (
              <motion.div
                key={index}
                className="navy-image"
                style={{ rotate: cardRotations[index] }}
              >
                <img src={img.src} alt={img.alt} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Evaluations Gallery */}
        <div className="navy-evals" id="evals">
          <h3>Performance Evaluations</h3>
          <p className="evals-subtitle">
            Consistently recognized for technical excellence, leadership, and mission readiness.
            Click any evaluation to view full size.
          </p>

          {/* Quotes Section */}
          <div className="eval-quotes">
            {evalQuotes.map((quote, index) => (
              <motion.blockquote
                key={index}
                className="eval-quote"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p>"{quote.quote}"</p>
                <cite>— {quote.source}, {quote.year}</cite>
              </motion.blockquote>
            ))}
          </div>

          <div className="evals-grid">
            {evalImages.map((eval_, index) => (
              <motion.div
                key={index}
                className="eval-card"
                onClick={() => openLightbox(index)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="eval-card-header">
                  <span className={`eval-badge ${eval_.recommendation === 'Early Promote' ? 'badge-early' : 'badge-must'}`}>
                    {eval_.recommendation}
                  </span>
                  <span className="eval-rank">{eval_.rank}</span>
                </div>
                <div className="eval-image-wrapper">
                  <img src={eval_.src} alt={eval_.alt} />
                  <div className="eval-overlay">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                      <path d="M11 8v6M8 11h6" />
                    </svg>
                    <span>View Full Size</span>
                  </div>
                </div>
                <div className="eval-card-footer">
                  <span className="eval-period">{eval_.period}</span>
                  <span className="eval-command">{eval_.command}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <ImageLightbox
        images={evalImages}
        currentIndex={currentEvalIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </section>
  );
};

export default NavyService;
