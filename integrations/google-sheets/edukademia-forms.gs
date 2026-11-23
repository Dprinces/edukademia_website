/**
 * @OnlyCurrentDoc
 *
 * Edukademia: website form submissions → Google Sheet
 *
 * Handles every website form, each in its own tab, and emails each submission:
 *   - "tutorials"         → Exam registrations   (/exam-preparation/)
 *   - "graduate-clarity"  → Graduate clarity     (/graduate-clarity/)
 *   - "school"            → School enquiries     (/school-partnership/)
 *   - "guide"             → Free guide requests  (/cgpa-mentorship/)
 *
 * Paste this into Extensions → Apps Script of the registrations spreadsheet, replace
 * appsscript.json with the one in this folder, run setup() once, then deploy it as a
 * web app (see README.md). "@OnlyCurrentDoc" limits access to this one spreadsheet.
 */

/**
 * Email from the script itself. Off by default: the website emails each submission through
 * Web3Forms instead, because some Google accounts block scripts that ask to send email.
 * To use it, set an address here AND add the script.send_mail scope to appsscript.json.
 */
const NOTIFY_EMAIL = '';

/** Readable labels for the free-guide "I am a" options. */
const GUIDE_LEVELS = {
  'secondary-school': 'Secondary school student',
  undergraduate: 'Undergraduate',
  postgraduate: 'Postgraduate',
  'parent-guardian': 'Parent or guardian',
  other: 'Other',
};

const FORMS = {
  tutorials: {
    sheetName: 'Exam registrations',
    label: 'Exam preparation registration',
    required: ['fullName', 'phone', 'email', 'country'],
    requiredLists: ['exams', 'days', 'times'],
    columns: [
      ['Full name', (d) => clean(d.fullName)],
      ['Phone / WhatsApp', (d) => clean(d.phone)],
      ['Email', (d) => clean(d.email)],
      ['Country', (d) => clean(d.country)],
      ['Exam(s)', (d) => list(d.exams).join(', ')],
      ['Subjects', (d) => list(d.subjects).join(', ')],
      ['Other subjects', (d) => list(d.otherSubjects).join(', ')],
      ['Preferred days', (d) => list(d.days).join(', ')],
      ['Preferred times', (d) => list(d.times).join(', ')],
      ['Schedule notes', (d) => clean(d.scheduleNotes)],
      ['Time zone', (d) => clean(d.timeZone)],
      ['Learning format', () => 'Online'],
    ],
  },
  'graduate-clarity': {
    sheetName: 'Graduate clarity',
    label: 'Graduate Next-Phase Clarity registration',
    required: ['fullName', 'phone', 'email', 'country', 'stage'],
    requiredLists: [],
    columns: [
      ['Full name', (d) => clean(d.fullName)],
      ['Phone / WhatsApp', (d) => clean(d.phone)],
      ['Email', (d) => clean(d.email)],
      ['Country', (d) => clean(d.country)],
      ['Stage', (d) => clean(d.stage)],
      ['Institution', (d) => clean(d.institution)],
      ['Course of study', (d) => clean(d.course)],
      ['Graduation year', (d) => clean(d.graduationYear)],
      ['Would like help with', (d) => list(d.questions).join('; ')],
      ['Notes', (d) => clean(d.notes)],
    ],
  },
  school: {
    sheetName: 'School enquiries',
    label: 'School partnership enquiry',
    refPrefix: 'SCH-',
    required: ['schoolName', 'contactName', 'role', 'email', 'country', 'phone', 'studentCount', 'interest'],
    requiredLists: [],
    columns: [
      ['Institution', (d) => clean(d.schoolName)],
      ['Contact person', (d) => clean(d.contactName)],
      ['Role', (d) => clean(d.role)],
      ['Email', (d) => clean(d.email)],
      ['Country', (d) => clean(d.country)],
      ['Phone', (d) => clean(d.phone)],
      ['Approx. students', (d) => clean(d.studentCount)],
      ['Support interested in', (d) => clean(d.interest)],
      ['Message', (d) => clean(d.message)],
    ],
  },
  guide: {
    sheetName: 'Free guide requests',
    label: 'Free guide request',
    required: ['fullName', 'email', 'level'],
    requiredLists: [],
    columns: [
      ['Full name', (d) => clean(d.fullName)],
      ['Email', (d) => clean(d.email)],
      ['WhatsApp', (d) => clean(d.phone)],
      ['I am a', (d) => GUIDE_LEVELS[d.level] || clean(d.level)],
      ['Agreed to updates', (d) => (d.marketingConsent === true ? 'Yes' : 'No')],
    ],
  },
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);

    // Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
    if (data.website) return json({ ok: true });

    const form = FORMS[data.form || 'tutorials'];
    if (!form) return json({ ok: false, error: 'unknown-form' });

    const missing =
      form.required.some((k) => !clean(data[k])) ||
      form.requiredLists.some((k) => !list(data[k]).length);
    if (missing) return json({ ok: false, error: 'missing-fields' });

    const ref = form.refPrefix ? reference(form.refPrefix) : '';
    const values = form.columns.map(([, get]) => get(data));
    sheet(form).appendRow([new Date(), ...(ref ? [ref] : []), ...values]);
    notify(form, values, ref, clean(data.email));
    return json(ref ? { ok: true, ref } : { ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'server-error' });
  } finally {
    lock.releaseLock();
  }
}

/** Opening the web app URL in a browser shows this, which confirms the deployment works. */
function doGet() {
  return json({ ok: true, service: 'edukademia-forms', forms: Object.keys(FORMS) });
}

function sheet(form) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(form.sheetName) || ss.insertSheet(form.sheetName);
  if (sh.getLastRow() === 0) {
    const headers = ['Submitted at', ...(form.refPrefix ? ['Reference'] : []), ...form.columns.map(([header]) => header)];
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function notify(form, values, ref, replyTo) {
  if (!NOTIFY_EMAIL) return;
  // Drop the leading apostrophe that only exists to stop Sheets reading "+234…" as a formula.
  const lines = form.columns.map(([header], i) => `${header}: ${String(values[i]).replace(/^'/, '')}`);
  if (ref) lines.unshift(`Reference: ${ref}`, '');
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `New ${form.label}: ${values[0]}${ref ? ` (${ref})` : ''}`,
      body: lines.join('\n'),
      // Pressing Reply in Gmail answers the person who filled in the form.
      replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo) ? replyTo : NOTIFY_EMAIL,
    });
  } catch (err) {
    // The row is already saved; a failed email should not lose the submission.
    console.error('Notification email failed:', err);
  }
}

/** Short, human-friendly reference such as SCH-LX3K9A2F. */
function reference(prefix) {
  return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

/**
 * Trims and limits text. A leading = + - or @ would make Sheets treat the value as a
 * formula (phone numbers start with "+"), so those values are stored as plain text.
 */
function clean(value) {
  const text = String(value == null ? '' : value).trim().slice(0, 600);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function list(value) {
  return Array.isArray(value) ? value.slice(0, 20).map(clean).filter(Boolean) : [];
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this once from the Apps Script editor (select "setup" → Run). It asks for permission,
 * creates every tab with its headings, and sends a test email to NOTIFY_EMAIL.
 */
function setup() {
  Object.values(FORMS).forEach((form) => sheet(form));
  if (NOTIFY_EMAIL) {
    MailApp.sendEmail(
      NOTIFY_EMAIL,
      'Edukademia website forms are connected',
      'Your Google Sheet is ready. New form submissions from the website will be saved there and emailed here.',
    );
  }
  console.log('Setup complete: tabs created' + (NOTIFY_EMAIL ? ' and test email sent to ' + NOTIFY_EMAIL : '') + '.');
}
