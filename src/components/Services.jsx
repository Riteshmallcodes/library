export default function Services() {
  const services = [
    "Silent reading zone",
    "Personal study cabins",
    "Digital learning space",
    "Competitive exam support",
    "Doubt solving guidance"
  ];

  return (
    <section className="services-section" id="services">
      <div className="section-inner">
        <p className="section-kicker">Services</p>
        <h2>Support that keeps students on track</h2>
        <div className="services-grid">
          {services.map((service) => (
            <div className="service-card" key={service}>
              {service}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
