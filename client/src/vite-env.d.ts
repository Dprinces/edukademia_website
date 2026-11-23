/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Apps Script web app URL that saves every website form to a Google Sheet and emails it. */
  readonly VITE_FORMS_SHEET_URL?: string;
  /** Web3Forms access key: emails each form submission to Edukademia (web3forms.com). */
  readonly VITE_WEB3FORMS_KEY?: string;
  /** Booking page to embed (Google Calendar appointment schedule, Calendly or Cal.com). Section hidden if unset. */
  readonly VITE_BOOKING_URL?: string;
  /** Set to "true" once the backend is live, to send every form to the Edukademia API instead. */
  readonly VITE_USE_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
