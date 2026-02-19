import { useTilt } from '../hooks/useTilt';
import './TiltCard.css';

const TiltCard = ({ children, className = '', options = {} }) => {
  const { style, glareStyle, handlers } = useTilt({
    max: 12,
    scale: 1.02,
    speed: 400,
    glare: true,
    maxGlare: 0.25,
    ...options,
  });

  return (
    <div
      className={`tilt-card ${className}`}
      style={style}
      {...handlers}
    >
      {children}
      <div className="tilt-glare" style={glareStyle} />
    </div>
  );
};

export default TiltCard;
