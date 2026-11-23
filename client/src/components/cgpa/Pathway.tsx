import { PATHWAY } from './content';

export default function Pathway() {
  return (
    <section id="pathway" className="section method">
      <div className="section-inner">
        <div className="section-header">
          <p className="eyebrow">The pathway</p>
          <h2>Three stages, each building on the last</h2>
          <p>
            Mentees move from strong academic foundations to consistent results and
            readiness for life after graduation.
          </p>
        </div>

        <ol className="method-steps">
          {PATHWAY.map((step, i) => (
            <li className="method-step" key={step.title}>
              <span className="method-step-num">Stage {i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>

        <p className="pathway-next">
          Graduating soon?{' '}
          <a href="/graduate-clarity/">See the Graduate Next-Phase Clarity Programme</a>
          {' '}for coaching on your career direction and next steps.
        </p>
      </div>
    </section>
  );
}
