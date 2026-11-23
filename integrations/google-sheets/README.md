# Website forms → Google Sheet + Gmail

Until the backend database is live, every website form is saved as a row in one Google
Sheet, each in its own tab, and emailed to edukademia1@gmail.com:

| Form | Page | Tab |
| --- | --- | --- |
| Exam preparation registration | `/exam-preparation/#register` | Exam registrations |
| Graduate Next-Phase Clarity registration | `/graduate-clarity/#register` | Graduate clarity |
| School partnership enquiry | `/school-partnership/#enquiry` | School enquiries |
| Free guide request | `/cgpa-mentorship/#guide` | Free guide requests |

Two pieces work together:

- **Google Sheet (Apps Script):** saves each submission to the right tab. The script can
  only edit this one spreadsheet. School enquiries get a reference number (e.g.
  `SCH-LX3K9A2F`), shown to the school and stored in the sheet.
- **Email (Web3Forms):** once the sheet confirms the save, the website emails the
  submission to edukademia1@gmail.com. **Reply** in Gmail goes straight to the person who
  filled in the form. Emails come from the website rather than the script because some
  Google accounts block scripts that ask to send email ("This app is blocked").

Set this up once, signed in as **edukademia1@gmail.com**. It takes about 5 minutes.

## 1. Create the sheet and add the script

1. Create a new Google Sheet, e.g. **Edukademia: Website registrations**.
2. In the sheet, open **Extensions → Apps Script**. Create the script from inside the sheet
   like this, not as a separate project at script.google.com.
3. Delete the sample code, paste in the contents of
   [`edukademia-forms.gs`](./edukademia-forms.gs), and save (Ctrl + S).
4. Limit the script's permissions:
   - Click **Project Settings** (gear icon) and tick
     **Show "appsscript.json" manifest file in editor**.
   - Back in **Editor**, open `appsscript.json`, replace everything in it with
     [`appsscript.json`](./appsscript.json) from this folder, and save.

   The script then has a single permission: editing **this one spreadsheet**.

## 2. Authorise it, then deploy it as a web app

1. In the left sidebar, click the code file (**Code.gs**). The toolbar with **Run** only
   appears when a `.gs` file is open, not `appsscript.json`.
2. In the toolbar above the code, choose **setup** in the function list and click **Run**.
3. Approve the permission prompt. If Google says the app is unverified, choose
   **Advanced → Go to … (unsafe)** and **Allow**. `setup` creates all four tabs.
4. Click **Deploy → New deployment**. Under **Select type**, choose **Web app**.
5. Set **Execute as** to **Me (edukademia1@gmail.com)** and **Who has access** to
   **Anyone**. This lets the website add rows; the sheet itself stays private.
6. Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.

Check it works: open the URL in a browser. You should see
`{"ok":true,"service":"edukademia-forms",...}`.

### If Google still says "This app is blocked"

With only the spreadsheet permission this is rare. If it happens:

1. **Signed into several Google accounts:** use a private window signed into
   edukademia1@gmail.com only and run **setup** again.
2. **Advanced Protection:** accounts enrolled in Google's Advanced Protection Program
   (myaccount.google.com/security) can't authorise any unverified script. Create the sheet
   in a different Google account and share it with edukademia1@gmail.com.

## 3. Turn on email notifications (Web3Forms)

1. Go to **web3forms.com**, enter **edukademia1@gmail.com** and request an access key.
2. Open the email from Web3Forms and copy the **access key**.
3. Set it as `VITE_WEB3FORMS_KEY` (next section). The key can only send to the inbox it
   was created for, so it's safe to include in the website.

The free plan covers 250 emails a month. If notifications ever stop, check the Web3Forms
dashboard. Submissions are still saved in the sheet either way.

## 4. Connect the website

Set both values as environment variables for the client:

```
VITE_FORMS_SHEET_URL=https://script.google.com/macros/s/XXXX/exec
VITE_WEB3FORMS_KEY=your-web3forms-access-key
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
