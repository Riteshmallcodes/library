import { FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";

export default function FloatingContact() {
  return (
    <div className="floating-contact" aria-label="Quick contact">
      <a
        href="tel:+918009185367"
        className="float-btn call-btn"
        title="Call now"
        aria-label="Call now"
      >
        <FaPhoneAlt />
      </a>

      <a
        href="https://wa.me/8009185367"
        target="_blank"
        rel="noopener noreferrer"
        className="float-btn whatsapp-btn"
        title="WhatsApp"
        aria-label="Open WhatsApp"
      >
        <FaWhatsapp />
      </a>

      <a
        href="https://maps.app.goo.gl/e1hJ1YiZR5CGYfXy7"
        target="_blank"
        rel="noopener noreferrer"
        className="float-btn map-btn"
        title="Open location"
        aria-label="Open location"
      >
        <FaMapMarkerAlt />
      </a>
    </div>
  );
}
