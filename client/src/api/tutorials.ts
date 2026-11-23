import { isSheetConfigured, saveToSheet } from './sheets';

export interface TutorialEnquiry {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  exams: string[];
  subjects: string[];
  /** Subjects typed in by the visitor, beyond the listed ones. */
  otherSubjects: string[];
  days: string[];
  times: string[];
  scheduleNotes: string;
  /** Visitor's time zone (e.g. "Europe/London"), so preferred times can be read correctly. */
  timeZone: string;
  /** Honeypot; always empty for real visitors. */
  website: string;
}

const USE_API = import.meta.env.VITE_TUTORIALS_USE_API === 'true';

async function saveToApi(data: TutorialEnquiry) {
  const res = await fetch('/api/tutorials/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('api-save-failed');
}

/**
 * Saves a tutorial registration. The Google Sheet is the record of truth for now;
 * the API copy is optional and never blocks the visitor when the sheet succeeds.
 */
export async function submitTutorialRegistration(data: TutorialEnquiry) {
  if (USE_API && !isSheetConfigured) {
    await saveToApi(data);
    return;
  }

  await saveToSheet('tutorials', data);
  if (USE_API) saveToApi(data).catch(() => { /* secondary copy */ });
}
