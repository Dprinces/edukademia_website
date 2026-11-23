import type { SheetForm } from './sheets';

/**
 * Emails each saved submission to Edukademia via Web3Forms (web3forms.com).
 * The access key only allows sending to the inbox it was created for, so it is safe to
 * ship in the website. Some Google accounts block Apps Scripts from sending email, which
 * is why notifications come from here rather than from the Google Sheet script.
 */
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY?.trim();

const SUBJECTS: Record<SheetForm, string> = {
  tutorials: 'New exam preparation registration',
  'graduate-clarity': 'New Graduate Next-Phase Clarity registration',
  school: 'New school partnership enquiry',
  guide: 'New free guide request',
};

/** Fields never worth emailing. */
const SKIP = new Set(['website', 'form']);

/** "otherSubjects" → "Other subjects". */
const label = (key: string) =>
  key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase()).replace(/ ([A-Z])/g, (_, c) => ` ${c.toLowerCase()}`);

function readable(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value ?? '');
}

export function emailSubmission(form: SheetForm, data: Record<string, unknown>, ref?: string) {
  if (!ACCESS_KEY) return;

  const fields = Object.fromEntries(
    Object.entries(data)
      .filter(([key, value]) => !SKIP.has(key) && readable(value).trim() !== '')
      .map(([key, value]) => [label(key), readable(value)]),
  );
  const name = readable(data.fullName ?? data.schoolName ?? '');
  const email = readable(data.email ?? '');

  // Fire-and-forget: the submission is already saved, so a failed email must not affect the visitor.
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: ACCESS_KEY,
      subject: `${SUBJECTS[form]}${name ? `: ${name}` : ''}${ref ? ` (${ref})` : ''}`,
      from_name: 'Edukademia website',
      // Reply in Gmail goes straight to the person who filled in the form.
      ...(email ? { replyto: email } : {}),
      ...(ref ? { Reference: ref } : {}),
      ...fields,
    }),
  }).catch(() => {
    /* non-blocking */
  });
}
