import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    about: [
      { name: 'Works', href: '#works' },
      { name: 'About', href: '#about' },
      { name: 'Contact', href: '#contact' },
    ],
    socials: [
      { name: 'GitHub', href: 'https://github.com/akashp3128' },
      { name: 'LinkedIn', href: 'https://www.linkedin.com/in/akashpatel3128' },
    ],
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <h6 className="footer-title">About</h6>
            <nav className="footer-nav">
              {footerLinks.about.map((link) => (
                <a key={link.name} href={link.href} className="footer-link">
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          <div className="footer-column">
            <h6 className="footer-title">Location</h6>
            <address className="footer-address">
              <p>Chicago, IL</p>
              <p>United States</p>
            </address>
          </div>

          <div className="footer-column">
            <h6 className="footer-title">Socials</h6>
            <nav className="footer-nav">
              {footerLinks.socials.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          <div className="footer-column footer-copyright">
            <p>{currentYear} © Akash Patel</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
