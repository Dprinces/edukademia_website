/**
 * Edukademia: website form submissions → Google Sheet
 *
 * Handles every form that posts to the spreadsheet, each in its own tab:
 *   - "tutorials"         → Exam registrations   (/exam-preparation/)
 *   - "graduate-clarity"  → Graduate clarity     (/graduate-clarity/)
 *
 * Paste this into Extensions → Apps Script of the registrations spreadsheet,
 * then deploy it as a web app (see README.md in this folder).
 */

/** Who gets an email for each new submission. Set to '' to turn notifications off. */
const NOTIFY_EMAIL = 'edukademia1@gmail.com';

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

    const values = form.columns.map(([, get]) => get(data));
    sheet(form).appendRow([new Date(), ...values]);
    notify(form, values);
    return json({ ok: true });
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
    const headers = ['Submitted at', ...form.columns.map(([header]) => header)];
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function notify(form, values) {
  if (!NOTIFY_EMAIL) return;
  const body = form.columns.map(([header], i) => `${header}: ${values[i]}`).join('\n');
  MailApp.sendEmail(NOTIFY_EMAIL, `New ${form.label}: ${values[0]}`, body);
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
