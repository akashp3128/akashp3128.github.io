import './Marquee.css';

const Marquee = ({ items, speed = 30, direction = 'left' }) => {
  return (
    <div className="marquee-container">
      <div
        className="marquee-content"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: direction === 'right' ? 'reverse' : 'normal',
        }}
      >
        {[...items, ...items].map((item, index) => (
          <div key={index} className="marquee-item">
            {item.type === 'image' ? (
              <img src={item.src} alt={item.alt || ''} />
            ) : (
              <span>{item.text}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
