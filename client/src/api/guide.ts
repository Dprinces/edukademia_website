import { emailSubmission } from './notify';
import { USE_API, saveToSheet } from './sheets';

export interface GuideRequest {
  fullName: string;
  email: string;
  phone: string;
  level: string;
  marketingConsent: boolean;
  /** Honeypot; always empty for real visitors. */
  website: string;
}

/**
 * Until the backend is live the guide is a static file, revealed only after the form is
 * saved. With VITE_USE_API on, the backend issues signed links that expire after an hour.
 */
export const STATIC_GUIDE_URL = '/downloads/edukademia-academic-success-starter-guide.pdf';

export async function requestGuide(data: GuideRequest): Promise<{ downloadUrl: string; expires: boolean }> {
  if (!USE_API) {
    try {
      await saveToSheet('guide', data);
    } catch {
      // The visitor has completed the form, so they still get the guide; their details
      // reach Edukademia by email instead of the sheet.
      emailSubmission('guide', data as unknown as Record<string, unknown>, undefined,
        'Could not be saved to the Google Sheet. Please add this request manually.');
    }
    return { downloadUrl: STATIC_GUIDE_URL, expires: false };
  }
  const res = await fetch('/api/guide/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.status === 429) throw new Error('rate-limited');
  if (!res.ok) throw new Error('request-failed');
  const { downloadUrl } = (await res.json()) as { downloadUrl: string };
  return { downloadUrl, expires: true };
}
