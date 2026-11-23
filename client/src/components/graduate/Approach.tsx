import { APPROACH, PILLARS } from './content';

export default function Approach() {
  return (
    <section className="section method">
      <div className="section-inner">
        <div className="section-header">
          <p className="eyebrow">How it works</p>
          <h2>A guided development experience</h2>
          <p>
            We combine personal reflection, career exploration, individual coaching and
            accountability to help you make intentional decisions about your future.
          </p>
        </div>

        <ol className="method-steps">
          {APPROACH.map((step, i) => (
            <li className="method-step" key={step.title}>
              <span className="method-step-num">Step {i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>

        <ul className="grad-pillars" aria-label="What the programme combines">
          {PILLARS.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>
    </section>
  );
}
