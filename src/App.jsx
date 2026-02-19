import { useLenis } from './hooks/useLenis';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import NavyService from './components/NavyService';
import FeaturedWorks from './components/FeaturedWorks';
import Achievements from './components/Achievements';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

function App() {
  // Initialize smooth scrolling
  useLenis();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <NavyService />
        <FeaturedWorks />
        <Achievements />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}

export default App;
