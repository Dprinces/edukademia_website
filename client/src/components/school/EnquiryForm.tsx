import { useEffect, useState } from 'react';
import { submitSchoolEnquiry, type SchoolEnquiry } from '../../api/registrations';
import { countryName, formatPhone, isValidPhone, type CountryCode } from '../../lib/countries';
import { CountrySelect, PhoneInput } from '../forms/CountryFields';
import { OPTIONS } from './content';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type Errors = Partial<Record<keyof SchoolEnquiry, string>>;

const INITIAL: SchoolEnquiry = {
  schoolName: '',
  contactName: '',
  role: '',
  email: '',
  // Held as an ISO country code while editing; sent as the country name.
  country: '',
  phone: '',
  studentCount: '',
  interest: '',
  message: '',
};

function validate(data: SchoolEnquiry, phoneCountry: CountryCode | ''): Errors {
  const errors: Errors = {};

  if (!data.schoolName.trim()) errors.schoolName = 'Enter your institution’s name.';
  if (!data.contactName.trim()) errors.contactName = 'Enter the name of the contact person.';
  if (!data.role.trim()) errors.role = 'Enter your role or title.';
  if (!data.email.trim()) {
    errors.email = 'Enter an email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!data.country) errors.country = 'Select your country.';
  if (!data.phone.trim()) errors.phone = 'Enter a phone number.';
  else if (!phoneCountry && !data.phone.trim().startsWith('+')) errors.phone = 'Choose your country code.';
  else if (!isValidPhone(data.phone, phoneCountry)) {
    errors.phone = `Enter a valid number${phoneCountry ? ` for ${countryName(phoneCountry)}` : ''}.`;
  }
  const count = parseInt(data.studentCount, 10);
  if (!data.studentCount.trim()) {
    errors.studentCount = 'Enter the approximate number of students.';
  } else if (isNaN(count) || count < 1) {
    errors.studentCount = 'Enter a number of 1 or more.';
  }
  if (!data.interest) errors.interest = 'Select the support you are interested in.';

  return errors;
}

interface EnquiryFormProps {
  /** Option chosen elsewhere on the page; pre-fills the interest field. */
  presetInterest?: string;
}

export default function EnquiryForm({ presetInterest }: EnquiryFormProps) {
  const [form, setForm] = useState<SchoolEnquiry>(INITIAL);
  const [touched, setTouched] = useState<Partial<Record<keyof SchoolEnquiry, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [refCode, setRefCode] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<CountryCode | ''>('');
  // Once the visitor picks a dialling code themselves, choosing a country no longer changes it.
  const [phoneCodeChosen, setPhoneCodeChosen] = useState(false);

  useEffect(() => {
    if (presetInterest) setForm((prev) => ({ ...prev, interest: presetInterest }));
  }, [presetInterest]);

  const errors = validate(form, phoneCountry);

  function chooseCountry(code: CountryCode | '') {
    setForm((prev) => ({ ...prev, country: code }));
    if (!phoneCodeChosen) setPhoneCountry(code);
  }

  const markTouched = (name: keyof SchoolEnquiry) => setTouched((prev) => ({ ...prev, [name]: true }));

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function touch(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  /** Props shared by every input: value binding, handlers and error wiring. */
  function fieldProps(name: keyof SchoolEnquiry) {
    const showError = Boolean(touched[name] && errors[name]);
    return {
      id: `enq-${name}`,
      name,
      value: form[name],
      onChange: update,
      onBlur: touch,
      'aria-invalid': showError || undefined,
      'aria-describedby': showError ? `enq-${name}-error` : undefined,
    };
  }

  function error(name: keyof SchoolEnquiry) {
    return touched[name] && errors[name] ? (
      <span className="error-msg" id={`enq-${name}-error`}>{errors[name]}</span>
    ) : null;
  }

  function fieldClass(name: keyof SchoolEnquiry, wide = false) {
    return ['field', wide && 'full-width', touched[name] && errors[name] && 'invalid']
      .filter(Boolean)
      .join(' ');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(INITIAL).map((k) => [k, true])));
    if (Object.keys(errors).length > 0) return;

    setStatus('submitting');
    try {
      const result = await submitSchoolEnquiry({
        ...form,
        country: countryName(form.country as CountryCode),
        phone: formatPhone(form.phone, phoneCountry),
      });
      setRefCode(result.ref);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="enquiry" className="section enquiry-section">
      <div className="section-inner enquiry-grid">
        <aside className="enquiry-aside">
          <p className="eyebrow">Partnership enquiry</p>
          <h2>Talk to us about your students</h2>
          <p>
            Share a few details about your institution. A partnership manager will
            contact you within two business days to discuss the right support.
          </p>
          <dl className="enquiry-contact">
            <div>
              <dt>Prefer email?</dt>
              <dd>
                <a href="mailto:edukademia1@gmail.com?subject=School%20partnership%20enquiry">
                  edukademia1@gmail.com
                </a>
              </dd>
            </div>
          </dl>
        </aside>

        <div className="form-card">
          {status === 'success' ? (
            <div className="success-panel" role="status">
              <h3>Enquiry received</h3>
              <p>
                Thank you for your interest. A partnership manager will contact you
                within two business days to discuss how we can support your students.
              </p>
              <p className="success-ref">Reference: <strong>{refCode}</strong></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className={fieldClass('schoolName', true)}>
                  <label htmlFor="enq-schoolName">Institution name <span className="req">*</span></label>
                  <input type="text" autoComplete="organization" placeholder="e.g. Greenfield College" {...fieldProps('schoolName')} />
                  {error('schoolName')}
                </div>

                <div className={fieldClass('contactName')}>
                  <label htmlFor="enq-contactName">Contact person <span className="req">*</span></label>
                  <input type="text" autoComplete="name" placeholder="e.g. Ada Okafor" {...fieldProps('contactName')} />
                  {error('contactName')}
                </div>

                <div className={fieldClass('role')}>
                  <label htmlFor="enq-role">Role or title <span className="req">*</span></label>
                  <input type="text" autoComplete="organization-title" placeholder="e.g. Dean of Students" {...fieldProps('role')} />
                  {error('role')}
                </div>

                <div className={fieldClass('email')}>
                  <label htmlFor="enq-email">Email address <span className="req">*</span></label>
                  <input type="email" autoComplete="email" placeholder="e.g. ada@greenfield.edu" {...fieldProps('email')} />
                  {error('email')}
                </div>

                <div className={fieldClass('country')}>
                  <label htmlFor="enq-country">Country <span className="req">*</span></label>
                  <CountrySelect
                    id="enq-country"
                    value={form.country as CountryCode | ''}
                    onChange={chooseCountry}
                    onBlur={() => markTouched('country')}
                    invalid={fieldProps('country')['aria-invalid']}
                    describedBy={fieldProps('country')['aria-describedby']}
                  />
                  {error('country')}
                </div>

                <div className={fieldClass('phone', true)}>
                  <label htmlFor="enq-phone">Phone number <span className="req">*</span></label>
                  <PhoneInput
                    id="enq-phone" required
                    country={phoneCountry}
                    onCountryChange={(code) => { setPhoneCodeChosen(true); setPhoneCountry(code); }}
                    value={form.phone}
                    onChange={(v) => setForm((prev) => ({ ...prev, phone: v }))}
                    onBlur={() => markTouched('phone')}
                    invalid={fieldProps('phone')['aria-invalid']}
                    describedBy={fieldProps('phone')['aria-describedby']}
                  />
                  {error('phone')}
                </div>

                <div className={fieldClass('studentCount')}>
                  <label htmlFor="enq-studentCount">Approximate number of students <span className="req">*</span></label>
                  <input type="number" min={1} inputMode="numeric" placeholder="e.g. 500" {...fieldProps('studentCount')} />
                  {error('studentCount')}
                </div>

                <div className={fieldClass('interest')}>
                  <label htmlFor="enq-interest">Support you're interested in <span className="req">*</span></label>
                  <select {...fieldProps('interest')}>
                    <option value="">Select an option</option>
                    {OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                    <option value="not-sure">Not sure yet</option>
                  </select>
                  {error('interest')}
                </div>

                <div className={fieldClass('message', true)}>
                  <label htmlFor="enq-message">Anything else we should know?</label>
                  <textarea
                    rows={4}
                    placeholder="Specific challenges, timelines or questions"
                    {...fieldProps('message')}
                  />
                </div>
              </div>

              <p className="form-privacy">
                We use these details only to respond to your enquiry. See our{' '}
                <a href="/policies/#privacy">privacy notice</a>.
              </p>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
                </button>
                {status === 'error' && (
                  <span className="form-status fail" role="alert">
                    Something went wrong. Please try again, or email us directly.
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
