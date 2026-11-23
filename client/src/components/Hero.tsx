export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner has-visual">
        <div className="hero-content">
          <p className="eyebrow">Raising Excellent and Purposeful Students</p>
          <h1>Academic excellence and personal growth go hand in hand.</h1>
          <p className="hero-lede">
            Edukademia helps you build the knowledge, mindset and skills to do well in
            school, with guidance to take your next step. Whether you’re preparing for an
            examination, working to improve your grades or planning life after graduation,
            there’s a programme for you.
          </p>
          <div className="hero-ctas">
            <a href="#programmes" className="btn btn-gold btn-lg">Find your programme</a>
            <a href="#vision" className="btn btn-outline-light btn-lg">About Edukademia</a>
          </div>
        </div>

        <div className="hero-visual hero-visual-plain">
          <img
            src="/cgpa/cgpa-mentorship-conversation.jpg"
            alt="A mentor reviewing a student's academic plan with her"
            width="1200"
            height="900"
          />
        </div>
      </div>
    </section>
  );
}
