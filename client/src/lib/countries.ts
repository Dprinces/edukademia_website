import {
  getCountries,
  getCountryCallingCode,
  getExampleNumber,
  isValidPhoneNumber,
  parsePhoneNumber,
  type CountryCode,
} from 'libphonenumber-js';
import mobileExamples from 'libphonenumber-js/mobile/examples';

export type { CountryCode };

export interface Country {
  code: CountryCode;
  name: string;
  dialCode: string;
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

/** Every country with a phone numbering plan, sorted by English name. */
export const COUNTRIES: Country[] = getCountries()
  .map((code) => ({
    code,
    name: regionNames.of(code) ?? code,
    dialCode: getCountryCallingCode(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export const countryName = (code: CountryCode | '') => (code ? BY_CODE.get(code)?.name ?? '' : '');

/** A realistic example mobile number for the country, for placeholder text. */
export function examplePhone(code: CountryCode | ''): string {
  if (!code) return 'Phone number';
  const example = getExampleNumber(code, mobileExamples);
  return example ? `e.g. ${example.formatNational()}` : 'Phone number';
}

/** True if the number is valid for the chosen country (or a full +international number). */
export function isValidPhone(local: string, code: CountryCode | ''): boolean {
  const value = local.trim();
  if (!value) return false;
  try {
    return value.startsWith('+') ? isValidPhoneNumber(value) : Boolean(code) && isValidPhoneNumber(value, code as CountryCode);
  } catch {
    return false;
  }
}

/** Formats the number internationally, e.g. "+44 7400 123456". Falls back to the raw input. */
export function formatPhone(local: string, code: CountryCode | ''): string {
  const value = local.trim();
  try {
    const parsed = value.startsWith('+') ? parsePhoneNumber(value) : code ? parsePhoneNumber(value, code) : undefined;
    return parsed ? parsed.formatInternational() : value;
  } catch {
    return value;
  }
}

/** The visitor's time zone, e.g. "Africa/Lagos" or "Europe/London". */
export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    return '';
  }
}
