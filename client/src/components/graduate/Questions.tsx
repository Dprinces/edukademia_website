import { QUESTIONS, type QuestionId } from './content';

interface QuestionsProps {
  selected: QuestionId[];
  onToggle: (id: QuestionId) => void;
}

export default function Questions({ selected, onToggle }: QuestionsProps) {
  return (
    <section className="section grad-questions">
      <div className="section-inner">
        <div className="section-header">
          <p className="eyebrow">Does this sound like you?</p>
          <h2>Still asking yourself these questions?</h2>
          <p>
            These are important questions, and you do not have to navigate them without
            guidance. Select the ones that sound like you and we will include them in your
            registration.
          </p>
        </div>

        <ul className="question-grid">
          {QUESTIONS.map((q) => {
            const isSelected = selected.includes(q.id);
            return (
              <li key={q.id}>
                <button
                  type="button"
                  className="question-card"
                  aria-pressed={isSelected}
                  onClick={() => onToggle(q.id)}
                >
                  <span className="question-check" aria-hidden="true" />
                  <span className="question-text">{q.text}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="question-status" aria-live="polite">
          {selected.length > 0 ? (
            <>
              {selected.length} selected.{' '}
              <a href="#register">Continue to registration</a>
            </>
          ) : (
            'Nothing selected yet.'
          )}
        </p>
      </div>
    </section>
  );
}
