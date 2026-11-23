import { USE_API, saveToSheet } from './sheets';

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

async function saveToApi(data: TutorialEnquiry) {
  const res = await fetch('/api/tutorials/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('api-save-failed');
}

/** Saves a tutorial registration: Google Sheet for now, backend API once VITE_USE_API is on. */
export async function submitTutorialRegistration(data: TutorialEnquiry) {
  if (USE_API) await saveToApi(data);
  else await saveToSheet('tutorials', data);
}
