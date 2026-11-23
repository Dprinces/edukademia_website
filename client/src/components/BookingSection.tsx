const BOOKING_URL = import.meta.env.VITE_BOOKING_URL?.trim();

interface BookingSectionProps {
  title?: string;
  intro?: string;
  /** Use the off-white background, to alternate with a white section above. */
  tinted?: boolean;
}

/**
 * "Book a call" section with an embedded booking calendar (Google Calendar appointment
 * schedule, Calendly or Cal.com). Hidden until VITE_BOOKING_URL is set, so the live site
 * never shows an empty box.
 */
export default function BookingSection({
  title = 'Prefer to book a time straight away?',
  intro = 'Book a video or phone call with the Edukademia team at a time that suits you.',
  tinted = false,
}: BookingSectionProps) {
  if (!BOOKING_URL) return null;

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
          <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">Open the booking page in a new tab</a>.
          Times are shown in your local time zone.
        </p>
      </div>
    </section>
  );
}
