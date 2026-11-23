import { emailSubmission } from './notify';

/** Which tab of the forms spreadsheet a submission belongs to. */
export type SheetForm = 'tutorials' | 'graduate-clarity' | 'school' | 'guide';

const SHEET_URL = import.meta.env.VITE_FORMS_SHEET_URL?.trim();

/** When "true", forms use the Edukademia backend API instead of the Google Sheet. */
export const USE_API = import.meta.env.VITE_USE_API === 'true';


export interface SheetResult {
  ok: boolean;
  /** Reference number, for forms that issue one (school enquiries). */
  ref?: string;
}

/**
 * Appends a form submission to the Google Sheet via the Apps Script web app, then emails it
 * to Edukademia (see integrations/google-sheets/README.md).
 */
export async function saveToSheet(form: SheetForm, data: object): Promise<SheetResult> {
  if (!SHEET_URL) {
    if (import.meta.env.DEV) {
      console.warn('VITE_FORMS_SHEET_URL is not set; submission was not saved (development only).');
      return { ok: true };
    }
    throw new Error('not-configured');
  }

  // text/plain keeps this a "simple" request, so no CORS preflight (which Apps Script can't answer).
  const res = await fetch(SHEET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ form, ...data }),
  });
  const result = (await res.json().catch(() => null)) as SheetResult | null;
  if (!res.ok || !result?.ok) throw new Error('sheet-save-failed');
  emailSubmission(form, data as Record<string, unknown>, result.ref);
  return result;
}
