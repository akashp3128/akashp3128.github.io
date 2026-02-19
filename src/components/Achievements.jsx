import { motion } from 'framer-motion';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Achievements.css';

const Achievements = () => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });

  const achievements = [
    {
      stat: '$1M+',
      label: 'Saved for U.S. Navy',
      description: 'Cost savings through precision submarine repairs and quality inspections',
      icon: '⚓',
      category: 'Military',
      featured: true,
    },
    {
      stat: '7,000%',
      label: 'Trading Returns',
      description: '$4K → $284K through strategic options trading',
      icon: '📈',
      category: 'Finance',
    },
    {
      stat: 'Top 8',
      label: 'State Qualifier',
      description: 'Gymnastics Vault at Sectionals, Advanced to State 2014',
      icon: '🏅',
      category: 'Athletics',
    },
    {
      stat: '3x',
      label: 'Early Promote',
      description: 'Highest Navy evaluation rating across multiple commands',
      icon: '🎖️',
      category: 'Military',
    },
    {
      stat: 'B.S.',
      label: 'Software Engineering',
      description: 'Iowa State University - Full degree while serving',
      icon: '🎓',
      category: 'Education',
    },
    {
      stat: 'Secret',
      label: 'Security Clearance',
      description: 'Active clearance for classified defense work',
      icon: '🔒',
      category: 'Military',
    },
    {
      stat: '2x',
      label: 'JSOQ Nominee',
      description: 'Junior Sailor of the Quarter nomination by unit command',
      icon: '⭐',
      category: 'Recognition',
    },
  ];

  return (
    <section className="achievements" ref={ref}>
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Achievements
        </motion.h2>

        <motion.p
          className="achievements-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Results that speak for themselves—from military excellence to financial markets to athletic competition.
        </motion.p>

        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              className={`achievement-card ${achievement.featured ? 'featured' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + index * 0.08 }}
            >
              <span className="achievement-category">{achievement.category}</span>
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-stat">{achievement.stat}</div>
              <div className="achievement-label">{achievement.label}</div>
              <div className="achievement-description">{achievement.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
