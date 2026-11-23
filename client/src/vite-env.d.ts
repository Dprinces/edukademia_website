/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Apps Script web app URL that saves every website form to a Google Sheet and emails it. */
  readonly VITE_FORMS_SHEET_URL?: string;
  /** Set to "true" once the backend is live, to send every form to the Edukademia API instead. */
  readonly VITE_USE_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
