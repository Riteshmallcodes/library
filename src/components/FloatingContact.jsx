import { FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";

export default function FloatingContact() {
  return (
    <div className="floating-contact" aria-label="Quick contact">
      <a
        href="tel:+919876543210"
        className="float-btn call-btn"
        title="Call now"
        aria-label="Call now"
      >
        <FaPhoneAlt />
      </a>

      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="float-btn whatsapp-btn"
        title="WhatsApp"
        aria-label="Open WhatsApp"
      >
        <FaWhatsapp />
      </a>

      <a
        href="https://www.google.com/maps?q=XYZ+Library+Kushinagar"
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
