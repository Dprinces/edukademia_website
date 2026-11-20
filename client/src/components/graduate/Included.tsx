import { INCLUDED } from './content';

export default function Included() {
  return (
    <section id="included" className="section">
      <div className="section-inner">
        <div className="section-header">
          <p className="eyebrow">What’s included</p>
          <h2>Six parts, one clear plan for what comes next</h2>
        </div>

        <ol className="grad-included-list">
          {INCLUDED.map((item, i) => (
            <li key={item.title} className="grad-included-item">
              <span className="grad-included-num">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                {item.note && <p className="grad-included-note">{item.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
