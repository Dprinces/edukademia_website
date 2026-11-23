import Nav from './components/Nav';
import Hero from './components/Hero';
import Vision from './components/Vision';
import Programmes from './components/Programmes';
import GpaCalculator from './components/GpaCalculator';
import Paths from './components/Paths';
import Footer from './components/Footer';
import BookingSection from './components/BookingSection';
import WhatsAppButton from './components/WhatsAppButton';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Vision />
        <Programmes />
        <GpaCalculator />
        <Paths />
        <BookingSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
