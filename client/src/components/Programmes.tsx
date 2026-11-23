const PROGRAMMES = [
  {
    href: '/cgpa-mentorship/',
    audience: 'For students',
    title: 'CGPA Mentorship',
    meta: 'Applications open for the next cohort',
  },
  {
    href: '/exam-preparation/',
    audience: 'For exam candidates',
    title: 'Exam Preparation',
    meta: 'WAEC, NECO, JAMB and English tests',
  },
  {
    href: '/graduate-clarity/',
    audience: 'For final-year students and graduates',
    title: 'Graduate Clarity Programme',
    meta: 'Clear direction for life after university',
  },
  {
    href: '/school-partnership/',
    audience: 'For schools and universities',
    title: 'School Partnership',
    meta: 'Tailored to your institution',
  },
];

/** Quick way into each programme, straight after the About, Mission and Vision. */
export default function Programmes() {
  return (
    <section id="programmes" className="section programmes-overview">
      <div className="section-inner">
        <div className="section-header">
          <p className="eyebrow">Our programmes</p>
          <h2>There’s a programme for every stage</h2>
        </div>

        <ul className="programme-tiles">
          {PROGRAMMES.map((p) => (
            <li key={p.href}>
              <a href={p.href} className="programme-tile">
                <span className="quick-link-audience">{p.audience}</span>
                <span className="programme-tile-title">{p.title}</span>
                <span className="quick-link-meta">{p.meta}</span>
                <span className="quick-link-arrow" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
