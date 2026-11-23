import Nav from './components/Nav';
import Hero from './components/Hero';
import Vision from './components/Vision';
import Programmes from './components/Programmes';
import Method from './components/Method';
import GpaCalculator from './components/GpaCalculator';
import Paths from './components/Paths';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Vision />
        <Programmes />
        <Method />
        <GpaCalculator />
        <Paths />
      </main>
      <Footer />
    </>
  );
}
