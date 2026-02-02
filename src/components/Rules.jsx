export default function Rules() {
  const rules = [
    "Maintain complete silence inside the study zone",
    "Keep phones on silent and avoid calls",
    "Respect the study environment and other students",
    "Keep the library clean and organized",
    "Follow time discipline and entry rules"
  ];

  return (
    <section className="rules-section" id="rules">
      <div className="section-inner">
        <p className="section-kicker">Discipline</p>
        <h2>Library rules to keep focus high</h2>
        <div className="rules-grid">
          {rules.map((rule, index) => (
            <div className="rule-card" key={index}>
              <span className="rule-number">{index + 1}</span>
              <p>{rule}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
