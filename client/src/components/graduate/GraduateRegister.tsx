import GraduateForm from './GraduateForm';
import type { QuestionId } from './content';

interface GraduateRegisterProps {
  selectedQuestions: QuestionId[];
  onToggleQuestion: (id: QuestionId) => void;
}

export default function GraduateRegister(props: GraduateRegisterProps) {
  return (
    <section id="register" className="section grad-register">
      <div className="section-inner planner-grid">
        <div className="planner-intro">
          <p className="eyebrow">Register your interest</p>
          <h2>Take the first step towards a clear plan</h2>
          <p>
            Tell us a little about yourself and where you are. Once your details are saved,
            you will send them to us on WhatsApp and we will reply with the next steps.
          </p>
          <ul className="subject-list grad-intro-list">
            <li>For final-year students and recent graduates</li>
            <li>Personal assessment and one-on-one coaching</li>
            <li>A 30-day action plan with weekly accountability</li>
          </ul>
        </div>

        <GraduateForm {...props} />
      </div>
    </section>
  );
}
