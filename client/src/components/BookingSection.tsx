/** Edukademia's Google Calendar appointment schedule (the "?gv=true" embed version). */
const DEFAULT_BOOKING_EMBED =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ25XpevxM3KgKgO_lI-zjCkdD-fFJaMlY3g_HeFDRqgpbHQlNbh_OdUvMfsjnG4RQNvtv5WPg17?gv=true';
/** Short link to the same booking page, for opening it in a new tab. */
const DEFAULT_BOOKING_LINK = 'https://calendar.app.google/VaogAziK2T5WQurp7';

// VITE_BOOKING_URL overrides the default, e.g. to switch to Calendly or Cal.com.
const OVERRIDE = import.meta.env.VITE_BOOKING_URL?.trim();
const BOOKING_URL = OVERRIDE || DEFAULT_BOOKING_EMBED;
const BOOKING_LINK = OVERRIDE || DEFAULT_BOOKING_LINK;

interface BookingSectionProps {
  title?: string;
  intro?: string;
  /** Use the off-white background, to alternate with a white section above. */
  tinted?: boolean;
}

/**
 * "Book a call" section with Edukademia's embedded booking calendar.
 */
export default function BookingSection({
  title = 'Prefer to book a time straight away?',
  intro = 'Book a video or phone call with the Edukademia team at a time that suits you.',
  tinted = false,
}: BookingSectionProps) {
  return (
    <section id="book" className={tinted ? 'section booking-section is-tinted' : 'section booking-section'}>
      <div className="section-inner">
        <div className="section-header booking-header">
          <p className="eyebrow">Book a call</p>
          <h2>{title}</h2>
          <p>{intro}</p>
        </div>

        <div className="booking-frame">
          <iframe
            src={BOOKING_URL}
            title="Book a call with Edukademia"
            loading="lazy"
          />
        </div>

        <p className="booking-fallback">
          Calendar not loading?{' '}
          <a href={BOOKING_LINK} target="_blank" rel="noopener noreferrer">Open the booking page in a new tab</a>.
          Times are shown in your local time zone.
        </p>
      </div>
    </section>
  );
}
