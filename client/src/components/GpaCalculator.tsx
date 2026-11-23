import { useId, useState } from 'react';
import { evaluate, type CgpaInputs, type CgpaResult, type Scale, type Status } from '../lib/cgpa';

const EXAMPLE: CgpaInputs = { current: '2.80', completed: '60', target: '3.50', remaining: '90' };
const EMPTY: CgpaInputs = { current: '', completed: '', target: '', remaining: '' };

const STATUS: Record<Status, { label: string; advice?: string }> = {
  'on-track': { label: 'On track' },
  achievable: { label: 'Achievable' },
  stretch: { label: 'Demanding', advice: 'Possible, but it leaves little room for error.' },
  'out-of-reach': { label: 'Not reachable', advice: 'Even perfect scores on every remaining unit won’t get you there.' },
};

const fmt = (n: number) => n.toFixed(2);

interface FieldDef {
  name: keyof CgpaInputs;
  label: string;
  hint: string;
  kind: 'cgpa' | 'units';
  placeholder: string;
}

const GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: 'Where you are now',
    fields: [
      { name: 'current', label: 'Current CGPA', hint: 'Leave blank if you haven’t completed any units yet.', kind: 'cgpa', placeholder: 'e.g. 2.80' },
      { name: 'completed', label: 'Credit units completed', hint: 'Total units you’ve taken so far. Enter 0 if you’re just starting.', kind: 'units', placeholder: 'e.g. 60' },
    ],
  },
  {
    title: 'Where you want to be',
    fields: [
      { name: 'target', label: 'Target CGPA', hint: 'The CGPA you want to graduate with.', kind: 'cgpa', placeholder: 'e.g. 3.50' },
      { name: 'remaining', label: 'Credit units remaining', hint: 'Units left until you graduate.', kind: 'units', placeholder: 'e.g. 90' },
    ],
  },
];

/** Position on the 0–scale bar, as a percentage clamped to the bar. */
const pos = (value: number, scale: Scale) => `${Math.min(Math.max(value / scale, 0), 1) * 100}%`;

function ResultPanel({ result, scale }: { result: CgpaResult; scale: Scale }) {
  const { status, required, current, target, completed, best } = result;
  const info = STATUS[status];
  const reachable = status !== 'out-of-reach';

  return (
    <div className={`calc-result is-${status}`}>
      <div className="calc-result-head">
        <span className="calc-status">{info.label}</span>
      </div>

      <p className="calc-figure">
        {fmt(reachable ? required : best)}
        <span>{reachable ? 'average needed' : 'highest possible'}</span>
      </p>

      {/* Scale bar: required average as the fill, with current and target marked. */}
      <div className="calc-scale" aria-hidden="true">
        <div className="calc-track">
          <span className="calc-fill" style={{ width: pos(reachable ? required : scale, scale) }} />
          {completed > 0 && <span className="calc-mark calc-mark-current" style={{ left: pos(current, scale) }} />}
          <span className="calc-mark calc-mark-target" style={{ left: pos(target, scale) }} />
        </div>
        <div className="calc-ticks">
          <span>0</span>
          <span>{scale}.00</span>
        </div>
        <ul className="calc-legend">
          <li><span className="calc-key calc-key-fill" />{reachable ? `Needed ${fmt(required)}` : `Needed ${fmt(required)} (above ${scale}.00)`}</li>
          {completed > 0 && <li><span className="calc-key calc-key-current" />Current {fmt(current)}</li>}
          <li><span className="calc-key calc-key-target" />Target {fmt(target)}</li>
        </ul>
      </div>

      {info.advice && (
        <p className="calc-advice">
          {info.advice} <a href="/cgpa-mentorship/">Get support from a CGPA mentor →</a>
        </p>
      )}
    </div>
  );
}

export default function GpaCalculator() {
  const uid = useId();
  const [scale, setScale] = useState<Scale>(5);
  const [values, setValues] = useState<CgpaInputs>(EXAMPLE);
  const [isExample, setIsExample] = useState(true);
  // Show a field's error once the visitor has typed in it (or is looking at the example).
  const [touched, setTouched] = useState<Partial<Record<keyof CgpaInputs, boolean>>>({});

  const { errors, result } = evaluate(values, scale);
  const shownErrors = Object.fromEntries(
    Object.entries(errors).filter(([k]) => touched[k as keyof CgpaInputs] || isExample),
  ) as typeof errors;

  function update(name: keyof CgpaInputs, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setIsExample(false);
  }

  function clearAll() {
    setValues(EMPTY);
    setTouched({});
    setIsExample(false);
    document.getElementById(`${uid}-current`)?.focus();
  }

  const id = (name: string) => `${uid}-${name}`;

  return (
    <section id="calculator" className="section calculator-section">
      <div className="section-inner calculator-grid">
        <div className="calculator-intro">
          <p className="eyebrow">Free tool</p>
          <h2>What CGPA do you need?</h2>
          <p>
            Enter your current position and your target. We will show the average
            grade point you need across your remaining courses.
          </p>
          <p className="calculator-note">
            Need help reaching your target? CGPA Mentorship pairs you with a mentor
            who helps you plan, stay focused and stay accountable.
          </p>
          <a href="/cgpa-mentorship/" className="btn btn-outline">Explore CGPA Mentorship</a>
        </div>

        <div className="calculator-card">
          <div className="calc-toolbar">
            <div className="calculator-scale" role="radiogroup" aria-label="Grading scale">
              {([5, 4] as Scale[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={scale === s}
                  className={scale === s ? 'is-active' : undefined}
                  onClick={() => setScale(s)}
                >
                  {s}.0 scale
                </button>
              ))}
            </div>
            <button type="button" className="calc-clear" onClick={clearAll}>Clear</button>
          </div>

          {isExample && (
            <p className="calc-example-note">
              These are example figures. Replace them with yours, or press <strong>Clear</strong>.
            </p>
          )}

          {GROUPS.map((group) => (
            <fieldset className="calc-group" key={group.title}>
              <legend>{group.title}</legend>
              <div className="calc-fields">
                {group.fields.map((f) => {
                  const err = shownErrors[f.name];
                  // Point screen readers at whichever message is showing: the error, or the hint.
                  const describedBy = err ? `${id(f.name)}-error` : `${id(f.name)}-hint`;
                  return (
                    <div className={err ? 'calc-field has-error' : 'calc-field'} key={f.name}>
                      <label htmlFor={id(f.name)}>{f.label}</label>
                      <div className="calc-input">
                        <input
                          id={id(f.name)}
                          type="text"
                          inputMode={f.kind === 'cgpa' ? 'decimal' : 'numeric'}
                          autoComplete="off"
                          placeholder={f.placeholder}
                          value={values[f.name]}
                          onChange={(e) => update(f.name, e.target.value)}
                          aria-invalid={Boolean(err) || undefined}
                          aria-describedby={describedBy}
                        />
                        <span className="calc-suffix" aria-hidden="true">
                          {f.kind === 'cgpa' ? `/ ${scale}.00` : 'units'}
                        </span>
                      </div>
                      {err
                        ? <span className="calc-error" id={`${id(f.name)}-error`}>{err}</span>
                        : <span className="calc-hint" id={`${id(f.name)}-hint`}>{f.hint}</span>}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="calc-output" aria-live="polite">
            {result ? (
              <ResultPanel result={result} scale={scale} />
            ) : (
              <p className="calc-empty">
                {Object.keys(shownErrors).length > 0
                  ? 'Check the highlighted box to see your result.'
                  : 'Fill in the boxes above to see the average you need.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
