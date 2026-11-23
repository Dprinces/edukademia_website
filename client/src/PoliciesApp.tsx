import Nav from './components/Nav';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import PolicyDocument from './components/policies/PolicyDocument';

export default function PoliciesApp() {
  return (
    <>
      <Nav />
      <main>
        <PolicyDocument />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
