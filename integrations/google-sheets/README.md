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
2. In the sheet, open **Extensions → Apps Script**. Create the script from inside the sheet
   like this, not as a separate project at script.google.com.
3. Delete the sample code, paste in the contents of
   [`edukademia-forms.gs`](./edukademia-forms.gs), and save.
4. Limit the script's permissions (this avoids Google's "This app is blocked" message):
   - Click **Project Settings** (gear icon) and tick
     **Show "appsscript.json" manifest file in editor**.
   - Back in **Editor**, open `appsscript.json`, replace everything in it with
     [`appsscript.json`](./appsscript.json) from this folder, and save.

   The script can then only use **this one spreadsheet** and **send email**. It can't
   read your Gmail, Drive or other sheets.
5. Optional: change `NOTIFY_EMAIL` at the top of the script. It defaults to
   edukademia1@gmail.com. Set it to `''` to turn email notifications off.

## 2. Authorise it, then deploy it as a web app

1. In the editor's toolbar, choose the **setup** function and click **Run**.
2. Approve the permission prompts. Google says the app is unverified, which is
   expected for your own script: choose **Advanced → Go to … (unsafe)** and **Allow**.
   `setup` creates all four tabs and sends a test email to `NOTIFY_EMAIL`.
3. Click **Deploy → New deployment**. Under **Select type**, choose **Web app**.
4. Set **Execute as** to **Me (edukademia1@gmail.com)** and **Who has access** to
   **Anyone**. This lets the website add rows; the sheet itself stays private.
5. Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.

Check it works: open the URL in a browser. You should see
`{"ok":true,"service":"edukademia-forms",...}`.

### If Google still says "This app is blocked"

Google sometimes blocks every unverified script on certain accounts, with no way to
continue. Check these in order:

1. **Advanced Protection:** if the account is enrolled in Google's Advanced Protection
   Program (myaccount.google.com/security), unverified scripts can't be authorised. Use a
   different Google account for the sheet, or leave the programme.
2. **Signed into several Google accounts:** sign out of the others, or use a private
   window signed into edukademia1@gmail.com only, and try **Run → setup** again.
3. **Use the sheet without script emails.** If the block remains:
   - Set `const NOTIFY_EMAIL = '';` at the top of the script.
   - In `appsscript.json`, delete the `script.send_mail` line, leaving only
     `spreadsheets.currentonly`, the lowest permission an Apps Script can have.
   - Run **setup** and deploy as above.
   - In the spreadsheet, open **Tools → Notification settings → Edit notifications** and
     choose **Any changes are made** and **Email – right away**. Google Sheets then emails
     edukademia1@gmail.com when a submission arrives, using its own built-in notifications.

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
