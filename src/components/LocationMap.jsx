export default function LocationMap() {
  return (
    <section className="map-section" id="location">
      <div className="section-inner">
        <p className="section-kicker">Location</p>
        <h2>Visit the library</h2>
        <div className="map-grid">
          <div className="map-card">
            <h3>Career Point Digital Library</h3>
            <p>
              A calm and accessible location for students in Kushinagar.
              Feel free to visit during library hours.
            </p>
            <div className="map-tags">
              <span>Quiet zone</span>
              <span>Student friendly</span>
              <span>Easy parking</span>
            </div>
          </div>
          <div className="map-frame">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3558.140278225555!2d83.9854!3d26.8990428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39938d00753bfca9%3A0x6b1b542e0c682d0!2sCareer%20point%20digital%20library!5e0!3m2!1sen!2sin!4v1769893657189!5m2!1sen!2sin"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
