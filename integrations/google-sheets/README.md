# Website forms → Google Sheet

Until the backend database is live, every website form is saved as a row in one Google
Sheet, each in its own tab, and emailed to edukademia1@gmail.com:

| Form | Page | Tab |
| --- | --- | --- |
| Exam preparation registration | `/exam-preparation/#register` | Exam registrations |
| Graduate Next-Phase Clarity registration | `/graduate-clarity/#register` | Graduate clarity |
| School partnership enquiry | `/school-partnership/#enquiry` | School enquiries |
| Free guide request | `/cgpa-mentorship/#guide` | Free guide requests |

A short Apps Script receives each submission, appends it to the right tab and emails it.
In the email, **Reply** goes straight to the person who filled in the form. School
enquiries also get a reference number (e.g. `SCH-LX3K9A2F`), shown to the school and
stored in the sheet.

Set this up once, signed in as **edukademia1@gmail.com**. It takes about 5 minutes.

## 1. Create the sheet and add the script

1. Create a new Google Sheet, e.g. **Edukademia: Website registrations**.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the sample code, paste in the contents of
   [`edukademia-forms.gs`](./edukademia-forms.gs), and save.
4. Optional: change `NOTIFY_EMAIL` at the top. It defaults to edukademia1@gmail.com.
   Set it to `''` to turn email notifications off.

## 2. Deploy it as a web app

1. Click **Deploy → New deployment**. Under **Select type**, choose **Web app**.
2. Set **Execute as** to **Me (edukademia1@gmail.com)**.
3. Set **Who has access** to **Anyone**. This lets the website send rows to the
   script. It does not make the sheet itself public.
4. Click **Deploy** and approve the permission prompts. Google will warn that the app
   is unverified; choose **Advanced → Go to … (unsafe)**. That's expected for your own script.
5. Copy the **Web app URL**. It ends in `/exec`.

Check it works: open the URL in a browser. You should see
`{"ok":true,"service":"edukademia-forms",...}`.

## 3. Connect the website

Set the URL as an environment variable for the client:

```
VITE_FORMS_SHEET_URL=https://script.google.com/macros/s/XXXX/exec
```

- **Locally:** put it in `client/.env.local`, then restart `npm run dev`.
- **Hosting (Netlify, Vercel, etc.):** add it in the site's environment variables, then redeploy.

Each form's first submission creates its tab with headings. One URL serves every form.

## Updating the script later

After editing the script, use **Deploy → Manage deployments → Edit (pencil) →
Version: New version → Deploy**. This keeps the same URL. Creating a *new
deployment* instead gives a new URL, and the website would then need updating.

## When the backend is ready

Set `VITE_USE_API=true` in the client settings and redeploy. Every form then goes to the
API and MongoDB instead, and the free guide is served through signed links that expire
after an hour. The Google Sheet stays as a record of everything received before the switch.

## Privacy

The sheet holds personal data (names, phone numbers, emails, possibly of minors).
Share it only with staff who need it, and handle it according to the
[privacy notice](../../client/src/components/policies/content.ts).
