import { USE_API, saveToSheet } from './sheets';

export interface SchoolEnquiry {
  schoolName: string;
  contactName: string;
  role: string;
  email: string;
  country: string;
  phone: string;
  studentCount: string;
  interest: string;
  message: string;
}

/** Saves a school enquiry: Google Sheet for now, backend API once VITE_USE_API is on. */
export async function submitSchoolEnquiry(data: SchoolEnquiry): Promise<{ ref: string }> {
  if (!USE_API) {
    const result = await saveToSheet('school', data);
    return { ref: result.ref ?? '' };
  }
  const res = await fetch('/api/registrations/school', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('submission-failed');
  return res.json() as Promise<{ ref: string }>;
}
