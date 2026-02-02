export default function Facilities() {
  const facilities = [
    "Group discussion cabin",
    "Monthly GS notes provided",
    "24x7 air conditioner setup",
    "High-speed internet",
    "CCTV surveillance",
    "Separate cabins with comfortable seating",
    "Hindi and English newspapers",
    "Breakfast arrangement",
    "Cool and filtered drinking water",
    "Proper parking space",
    "Teacher available for doubt solving"
  ];

  return (
    <section className="facilities-section" id="facilities">
      <div className="section-inner">
        <p className="section-kicker">Facilities</p>
        <h2>Everything students need to stay consistent</h2>
        <div className="facilities-grid">
          {facilities.map((item, index) => (
            <div className="facility-card" key={index}>
              <span className="facility-icon" aria-hidden="true">
                OK
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
