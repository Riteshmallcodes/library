import FAQ from "../components/FAQ";

export default function Help() {
  return (
    <section className="help-page">
      <div className="help-shell">
        <header className="help-header">
          <p className="help-kicker">Support</p>
          <h2>Help and FAQ</h2>
          <p className="help-subtitle">
            Clear answers to common questions for adult learners and students.
          </p>
        </header>

        <div className="help-card">
          <FAQ />
        </div>
      </div>
    </section>
  );
}
