import { examplePhone, type CountryCode } from '../../lib/countries';
import CountryPicker from './CountryPicker';

interface CountrySelectProps {
  id: string;
  value: CountryCode | '';
  onChange: (code: CountryCode | '') => void;
  invalid?: boolean;
  describedBy?: string;
  onBlur?: () => void;
}

/** Searchable full country list. Nothing is pre-selected, because visitors come from many countries. */
export function CountrySelect({ id, value, onChange, invalid, describedBy, onBlur }: CountrySelectProps) {
  return (
    <CountryPicker
      id={id}
      mode="country"
      value={value}
      onChange={onChange}
      placeholder="Select your country"
      invalid={invalid}
      describedBy={describedBy}
      onBlur={onBlur}
    />
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
 * International phone number: a searchable dialling-code picker plus the local number.
 * Visitors can also type a full number starting with "+", which overrides the picker.
 */
export function PhoneInput({
  id, country, onCountryChange, value, onChange, invalid, describedBy, required, onBlur,
}: PhoneInputProps) {
  return (
    <div className="phone-input">
      <CountryPicker
        id={`${id}-code`}
        mode="dial"
        value={country}
        onChange={onCountryChange}
        placeholder="Code"
        ariaLabel="Country dialling code"
        invalid={invalid}
      />
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
