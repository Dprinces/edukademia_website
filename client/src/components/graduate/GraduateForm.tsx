import { useState } from 'react';
import { submitGraduateRegistration, type GraduateRegistration } from '../../api/graduate';
import { countryName, formatPhone, isValidPhone, type CountryCode } from '../../lib/countries';
import { WHATSAPP_DIRECT_URL, whatsappUrl } from '../../lib/whatsapp';
import { CountrySelect, PhoneInput } from '../forms/CountryFields';
import { PROGRAMME_NAME, QUESTIONS, STAGES, type QuestionId } from './content';

type Status = 'editing' | 'saving' | 'saved' | 'error';
type ErrorKey = 'fullName' | 'phone' | 'email' | 'country' | 'stage';
type Errors = Partial<Record<ErrorKey, string>>;

/** Form state: countries are held as ISO codes and converted to names when sent. */
type Details = Omit<GraduateRegistration, 'questions' | 'country'> & {
  countryCode: CountryCode | '';
  /** Country whose dialling code the phone number uses. */
  phoneCountry: CountryCode | '';
};

const EMPTY: Details = {
  fullName: '',
  phone: '',
  email: '',
  countryCode: '',
  phoneCountry: '',
  stage: '',
  institution: '',
  course: '',
  graduationYear: '',
  notes: '',
  website: '',
};

const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR + 1, THIS_YEAR, THIS_YEAR - 1, THIS_YEAR - 2, THIS_YEAR - 3].map(String);

function validate(d: Details): Errors {
  const errors: Errors = {};
  if (!d.fullName.trim()) errors.fullName = 'Enter your full name.';
  if (!d.phone.trim()) errors.phone = 'Enter your phone or WhatsApp number.';
  else if (!d.phoneCountry && !d.phone.trim().startsWith('+')) errors.phone = 'Choose your country code.';
  else if (!isValidPhone(d.phone, d.phoneCountry)) {
    errors.phone = `Enter a valid number${d.phoneCountry ? ` for ${countryName(d.phoneCountry)}` : ''}.`;
  }
  if (!d.email.trim()) errors.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errors.email = 'Enter a valid email address.';
  if (!d.countryCode) errors.country = 'Select your country.';
  if (!d.stage) errors.stage = 'Select the option that describes you.';
  return errors;
}

const questionText = (ids: QuestionId[]) =>
  QUESTIONS.filter((q) => ids.includes(q.id)).map((q) => q.text);

function buildMessage(d: Details, questions: QuestionId[]) {
  const stage = STAGES.find((s) => s.id === d.stage)?.label ?? '';
  const lines = [
    `Hello Edukademia! I would like to join the ${PROGRAMME_NAME}.`,
    '',
    `Name: ${d.fullName.trim()}`,
    `Phone/WhatsApp: ${formatPhone(d.phone, d.phoneCountry)}`,
    `Email: ${d.email.trim()}`,
    `Country: ${countryName(d.countryCode)}`,
    `I am a: ${stage}`,
  ];
  if (d.institution.trim()) lines.push(`Institution: ${d.institution.trim()}`);
  if (d.course.trim()) lines.push(`Course of study: ${d.course.trim()}`);
  if (d.graduationYear) lines.push(`Graduation year: ${d.graduationYear}`);
  const qs = questionText(questions);
  if (qs.length) lines.push('', 'I would like help with:', ...qs.map((q) => `- ${q}`));
  if (d.notes.trim()) lines.push('', `Notes: ${d.notes.trim()}`);
  return lines.join('\n');
}

interface GraduateFormProps {
  selectedQuestions: QuestionId[];
  onToggleQuestion: (id: QuestionId) => void;
}

export default function GraduateForm({ selectedQuestions, onToggleQuestion }: GraduateFormProps) {
  const [form, setForm] = useState<Details>(EMPTY);
  // Once the visitor picks a dialling code themselves, choosing a country no longer changes it.
  const [phoneCodeChosen, setPhoneCodeChosen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<Status>('editing');

  const errors = validate(form);

  const set = <K extends keyof Details>(key: K, value: Details[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function chooseCountry(code: CountryCode | '') {
    setForm((prev) => ({ ...prev, countryCode: code, phoneCountry: phoneCodeChosen ? prev.phoneCountry : code }));
  }

  const invalid = (key: ErrorKey) => showErrors && Boolean(errors[key]);
  const err = (key: ErrorKey) =>
    invalid(key) ? <span className="error-msg" id={`grad-${key}-error`} role="alert">{errors[key]}</span> : null;
  const aria = (key: ErrorKey) => ({
    'aria-invalid': invalid(key) || undefined,
    'aria-describedby': invalid(key) ? `grad-${key}-error` : undefined,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length > 0) {
      requestAnimationFrame(() => {
        const field = document.querySelector<HTMLElement>('.grad-form [aria-invalid="true"]');
        if (field) field.focus();
        else document.querySelector('.grad-form .error-msg')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      return;
    }

    setStatus('saving');
    try {
      const { countryCode, phoneCountry, ...rest } = form;
      const stage = STAGES.find((s) => s.id === form.stage)?.label ?? form.stage;
      await submitGraduateRegistration({
        ...rest,
        phone: formatPhone(form.phone, phoneCountry),
        country: countryName(countryCode),
        stage,
        questions: questionText(selectedQuestions),
      });
      setStatus('saved');
      requestAnimationFrame(() =>
        document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      );
    } catch {
      setStatus('error');
    }
  }

  // WhatsApp is only offered once the registration has been saved.
  if (status === 'saved') {
    const message = buildMessage(form, selectedQuestions);
    return (
      <div className="planner-card reg-done" role="status">
        <p className="reg-done-step">Step 1 of 2 complete</p>
        <h3>Registration received. Now send it on WhatsApp.</h3>
        <p>
          Your details have been saved. To finish, send them to us on WhatsApp. The message
          is already written for you, and we will reply with the next steps.
        </p>
        <div className="planner-preview">
          <p className="planner-preview-label">Your message</p>
          <pre className="planner-message">{message}</pre>
        </div>
        <div className="reg-done-actions">
          <a href={whatsappUrl(message)} className="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">
            Send on WhatsApp
          </a>
          <button type="button" className="btn btn-outline" onClick={() => setStatus('editing')}>
            Edit my details
          </button>
        </div>
        <p className="reg-fallback">
          WhatsApp not opening?{' '}
          <a href={WHATSAPP_DIRECT_URL} target="_blank" rel="noopener noreferrer">Open our WhatsApp chat</a>{' '}
          and paste the message above.
        </p>
      </div>
    );
  }

  return (
    <form className="planner-card grad-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="planner-step">
        <legend><span className="planner-num">1</span>Your details</legend>
        <div className="form-grid">
          <div className={invalid('fullName') ? 'field invalid' : 'field'}>
            <label htmlFor="grad-fullName">Full name <span className="req">*</span></label>
            <input id="grad-fullName" type="text" autoComplete="name" placeholder="e.g. Ada Okafor" value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)} {...aria('fullName')} />
            {err('fullName')}
          </div>
          <div className={invalid('email') ? 'field invalid' : 'field'}>
            <label htmlFor="grad-email">Email address <span className="req">*</span></label>
            <input id="grad-email" type="email" autoComplete="email" placeholder="e.g. ada@example.com" value={form.email}
              onChange={(e) => set('email', e.target.value)} {...aria('email')} />
            {err('email')}
          </div>
          <div className={invalid('country') ? 'field invalid' : 'field'}>
            <label htmlFor="grad-country">Country <span className="req">*</span></label>
            <CountrySelect
              id="grad-country" value={form.countryCode} onChange={chooseCountry}
              invalid={invalid('country')} describedBy={aria('country')['aria-describedby']}
            />
            {err('country')}
          </div>
          <div className={invalid('phone') ? 'field invalid' : 'field'}>
            <label htmlFor="grad-phone">Phone / WhatsApp number <span className="req">*</span></label>
            <PhoneInput
              id="grad-phone" required
              country={form.phoneCountry}
              onCountryChange={(code) => { setPhoneCodeChosen(true); set('phoneCountry', code); }}
              value={form.phone} onChange={(v) => set('phone', v)}
              invalid={invalid('phone')} describedBy={aria('phone')['aria-describedby']}
            />
            {err('phone')}
          </div>
        </div>
      </fieldset>

      <fieldset className="planner-step" aria-describedby={invalid('stage') ? 'grad-stage-error' : undefined}>
        <legend><span className="planner-num">2</span>Where you are now</legend>
        <div className="chip-group" role="radiogroup" aria-label="I am a">
          {STAGES.map((s) => (
            <label key={s.id} className="chip">
              <input type="radio" name="grad-stage" checked={form.stage === s.id} onChange={() => set('stage', s.id)} />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
        {err('stage')}
        <div className="form-grid grad-study">
          <div className="field">
            <label htmlFor="grad-institution">University or institution <span className="optional">(optional)</span></label>
            <input id="grad-institution" type="text" autoComplete="organization" placeholder="Your university or college" value={form.institution}
              onChange={(e) => set('institution', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="grad-course">Course of study <span className="optional">(optional)</span></label>
            <input id="grad-course" type="text" placeholder="e.g. Economics" value={form.course}
              onChange={(e) => set('course', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="grad-year">Graduation year <span className="optional">(optional)</span></label>
            <select id="grad-year" value={form.graduationYear} onChange={(e) => set('graduationYear', e.target.value)}>
              <option value="">Select a year</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              <option value={`Before ${THIS_YEAR - 3}`}>Before {THIS_YEAR - 3}</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="planner-step">
        <legend><span className="planner-num">3</span>What would you like help with?</legend>
        <p className="planner-hint">Optional. Choose any that apply.</p>
        <div className="chip-group">
          {QUESTIONS.map((q) => (
            <label key={q.id} className="chip chip-wide">
              <input type="checkbox" checked={selectedQuestions.includes(q.id)} onChange={() => onToggleQuestion(q.id)} />
              <span>{q.text}</span>
            </label>
          ))}
        </div>
        <div className="field grad-notes">
          <label htmlFor="grad-notes">Anything else you would like us to know? <span className="optional">(optional)</span></label>
          <textarea id="grad-notes" rows={3} maxLength={600} value={form.notes}
            placeholder="e.g. the industries you are considering, or ideas you want to act on"
            onChange={(e) => set('notes', e.target.value)} />
        </div>
      </fieldset>

      {/* Honeypot: hidden from people and screen readers, filled only by bots. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="grad-website">Website</label>
        <input id="grad-website" type="text" tabIndex={-1} autoComplete="off" value={form.website}
          onChange={(e) => set('website', e.target.value)} />
      </div>

      <p className="form-privacy">
        Your details are saved by Edukademia so we can contact you about the programme, and
        you will then send them to us on WhatsApp. See our <a href="/policies/#privacy">privacy notice</a>.
      </p>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving your registration…' : 'Submit registration'}
        </button>
      </div>
      {status === 'error' && (
        <div className="reg-error" role="alert">
          <p>
            We couldn’t save your registration. Please check your internet connection and
            press <strong>Submit registration</strong> again.
          </p>
          <p>
            Still not working?{' '}
            <a href={whatsappUrl(buildMessage(form, selectedQuestions))} target="_blank" rel="noopener noreferrer">
              Send your details on WhatsApp instead
            </a>
            .
          </p>
        </div>
      )}
    </form>
  );
}
