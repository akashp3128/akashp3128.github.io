import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Testimonials.css';

const Testimonials = () => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  const testimonials = [
    {
      quote:
        '"Akash brings a rare combination of hardware and software expertise. His ability to debug complex embedded systems while also building elegant web interfaces makes him an invaluable team member."',
      name: 'Marcus Chen',
      title: 'Engineering Lead',
      company: 'Northrop Grumman',
    },
    {
      quote:
        '"Outstanding problem solver with deep systems knowledge. Akash consistently delivered robust, well-documented code that exceeded our quality standards. His military discipline shows in everything he does."',
      name: 'Sarah Mitchell',
      title: 'CTO',
      company: 'TechVentures Inc.',
    },
    {
      quote:
        '"Working with Akash was a game-changer for our embedded firmware project. His attention to detail and thorough testing approach helped us ship a product with zero critical bugs in production."',
      name: 'James Rodriguez',
      title: 'Product Manager',
      company: 'Defense Systems Corp',
    },
    {
      quote:
        '"Akash\'s full-stack capabilities and systems thinking made him essential to our team. He bridged the gap between our hardware engineers and web developers seamlessly."',
      name: 'Emily Watson',
      title: 'VP of Engineering',
      company: 'CloudScale Solutions',
    },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  return (
    <section className="testimonials" ref={ref}>
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Testimonials
        </motion.h2>

        <motion.div
          className="testimonials-wrapper"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="testimonials-slider" ref={sliderRef}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <p className="testimonial-quote">{testimonial.quote}</p>
                <div className="testimonial-author">
                  <h6 className="author-name">{testimonial.name}</h6>
                  <div className="author-info">
                    <span>{testimonial.title}</span>
                    <span>—</span>
                    <span>{testimonial.company}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="testimonials-nav">
            <button onClick={prevSlide} className="nav-btn" aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button onClick={nextSlide} className="nav-btn" aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
