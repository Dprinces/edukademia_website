import { COUNTRIES, examplePhone, type CountryCode } from '../../lib/countries';

interface CountrySelectProps {
  id: string;
  value: CountryCode | '';
  onChange: (code: CountryCode | '') => void;
  invalid?: boolean;
  describedBy?: string;
  onBlur?: () => void;
}

/** Full country list. Nothing is pre-selected, because visitors come from many countries. */
export function CountrySelect({ id, value, onChange, invalid, describedBy, onBlur }: CountrySelectProps) {
  return (
    <select
      id={id}
      value={value}
      autoComplete="country"
      onChange={(e) => onChange(e.target.value as CountryCode | '')}
      onBlur={onBlur}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
    >
      <option value="">Select your country</option>
      {COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>{c.name}</option>
      ))}
    </select>
  );
}

interface PhoneInputProps {
  id: string;
  /** Country whose dialling code is used. */
  country: CountryCode | '';
  onCountryChange: (code: CountryCode | '') => void;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  required?: boolean;
  onBlur?: () => void;
}

/**
 * International phone number: a dialling-code picker plus the local number.
 * Visitors can also type a full number starting with "+", which overrides the picker.
 */
export function PhoneInput({
  id, country, onCountryChange, value, onChange, invalid, describedBy, required, onBlur,
}: PhoneInputProps) {
  return (
    <div className="phone-input">
      <select
        className="phone-code"
        value={country}
        onChange={(e) => onCountryChange(e.target.value as CountryCode | '')}
        aria-label="Country dialling code"
        aria-invalid={invalid || undefined}
      >
        <option value="">Code</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>+{c.dialCode} {c.name}</option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        autoComplete="tel-national"
        inputMode="tel"
        value={value}
        placeholder={examplePhone(country)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
      />
    </div>
  );
}
