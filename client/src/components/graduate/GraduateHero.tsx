import { PROGRAMME_NAME } from './content';

export default function GraduateHero() {
  return (
    <section className="hero">
      <div className="hero-inner has-visual">
        <div className="hero-content">
          <p className="eyebrow">{PROGRAMME_NAME}</p>
          <h1>Find clarity for the next phase of your life.</h1>
          <p className="hero-lede">
            A structured coaching and development experience that helps final-year students
            and recent graduates move from university into what comes next, with clear
            direction, relevant skills and an actionable plan.
          </p>
          <div className="hero-ctas">
            <a href="#register" className="btn btn-gold btn-lg">Apply now</a>
            <a href="#included" className="btn btn-outline-light btn-lg">What’s included</a>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src="/cgpa/cgpa-future-readiness.jpg"
            alt="Students reviewing documents together as they plan their next steps"
            width="1200"
            height="900"
          />
          <aside className="hero-overlay" aria-label="Who the programme is for">
            <p className="hero-overlay-title">Designed for</p>
            <dl className="overlay-facts">
              <div><dt>Students</dt><dd>In their final year of university</dd></div>
              <div><dt>Graduates</dt><dd>Recently graduated and planning what’s next</dd></div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}
