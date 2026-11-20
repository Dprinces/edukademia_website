# Website forms → Google Sheet

Until the backend database is live, these forms are saved as rows in one Google Sheet,
each in its own tab:

| Form | Page | Tab |
| --- | --- | --- |
| Exam preparation registration | `/exam-preparation/#register` | Exam registrations |
| Graduate Next-Phase Clarity registration | `/graduate-clarity/#register` | Graduate clarity |

A short Apps Script receives each submission and appends it. It can also email a notification.

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

Each form's first submission creates its tab with headings. One URL serves both forms.

## Updating the script later

After editing the script, use **Deploy → Manage deployments → Edit (pencil) →
Version: New version → Deploy**. This keeps the same URL. Creating a *new
deployment* instead gives a new URL, and the website would then need updating.

## When the backend is ready

Set `VITE_TUTORIALS_USE_API=true` to also save registrations to MongoDB through
`/api/tutorials/enquiry`. Both destinations can run side by side during the switch-over.

## Privacy

The sheet holds personal data (names, phone numbers, emails, possibly of minors).
Share it only with staff who need it, and handle it according to the
[privacy notice](../../client/src/components/policies/content.ts).
