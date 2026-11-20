/** Which tab of the registrations spreadsheet a submission belongs to. */
export type SheetForm = 'tutorials' | 'graduate-clarity';

const SHEET_URL = import.meta.env.VITE_FORMS_SHEET_URL?.trim();

export const isSheetConfigured = Boolean(SHEET_URL);

/**
 * Appends a form submission to the Google Sheet via the Apps Script web app
 * (see integrations/google-sheets/README.md).
 */
export async function saveToSheet(form: SheetForm, data: object) {
  if (!SHEET_URL) {
    if (import.meta.env.DEV) {
      console.warn('VITE_FORMS_SHEET_URL is not set; submission was not saved (development only).');
      return;
    }
    throw new Error('not-configured');
  }

  // text/plain keeps this a "simple" request, so no CORS preflight (which Apps Script can't answer).
  const res = await fetch(SHEET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ form, ...data }),
  });
  const result = (await res.json().catch(() => null)) as { ok?: boolean } | null;
  if (!res.ok || !result?.ok) throw new Error('sheet-save-failed');
}
