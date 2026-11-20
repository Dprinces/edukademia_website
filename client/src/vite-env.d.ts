/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Apps Script web app URL that saves form submissions (exam and graduate) to a Google Sheet. */
  readonly VITE_FORMS_SHEET_URL?: string;
  /** Set to "true" to also store tutorial registrations through the Edukademia API. */
  readonly VITE_TUTORIALS_USE_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
