import { useState } from "react";
import { apiFetch, safeJson } from "../utils/api";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: ""
  });

  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.message) {
      setStatus({ type: "error", message: "All fields are required." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", message: "Sending message..." });

    try {
      const response = await apiFetch("/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: form
      });

      const data = await safeJson(response);

      if (data.success) {
        setStatus({ type: "success", message: "Message sent successfully." });
        setForm({ name: "", phone: "", message: "" });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Server error"
        });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Network error. Please try again." });
    }

    setLoading(false);
  };

  return (
    <section className="contact-page" id="contact">
      <div className="contact-box">
        <div className="contact-header">
          <p className="contact-kicker">Contact</p>
          <h2>Talk to the Library Team</h2>
          <p className="contact-subtitle">
            Simple, private, and built for adult members (18+).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
          <label className="contact-field">
            <span>Full name</span>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </label>

          <label className="contact-field">
            <span>Phone number</span>
            <input
              type="tel"
              name="phone"
              placeholder="e.g. +1 555 123 4567"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
              required
            />
          </label>

          <label className="contact-field">
            <span>Your message</span>
            <textarea
              name="message"
              placeholder="How can we help you?"
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>

          <p className="contact-note">
            For members under 18, please contact us with a parent or guardian.
          </p>

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send message"}
          </button>
        </form>

        {status.message && (
          <p
            className={`contact-status ${status.type}`}
            role="status"
            aria-live="polite"
          >
            {status.message}
          </p>
        )}
      </div>
    </section>
  );
}

