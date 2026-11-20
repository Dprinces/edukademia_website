import { useState } from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import GraduateHero from './components/graduate/GraduateHero';
import Questions from './components/graduate/Questions';
import Approach from './components/graduate/Approach';
import Included from './components/graduate/Included';
import GraduateRegister from './components/graduate/GraduateRegister';
import type { QuestionId } from './components/graduate/content';

export default function GraduateApp() {
  // Shared between the "sound like you?" cards and the registration form.
  const [questions, setQuestions] = useState<QuestionId[]>([]);
  const toggleQuestion = (id: QuestionId) =>
    setQuestions((prev) => (prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]));

  return (
    <>
      <Nav current="/graduate-clarity/" primaryCta={{ href: '#register', label: 'Register now' }} />
      <main>
        <GraduateHero />
        <Questions selected={questions} onToggle={toggleQuestion} />
        <Approach />
        <Included />
        <GraduateRegister selectedQuestions={questions} onToggleQuestion={toggleQuestion} />
      </main>
      <Footer />
    </>
  );
}
