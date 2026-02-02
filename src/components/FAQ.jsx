import { useState } from "react";

const faqs = [
  { q: "Library timing?", a: "Mon-Sat: 8 AM - 8 PM" },
  { q: "Membership fees?", a: "INR 300 per month" },
  { q: "Book issue rules?", a: "1 book for 7 days" }
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="faq-list">
      {faqs.map((item, index) => {
        const isOpen = open === index;
        return (
          <button
            type="button"
            key={item.q}
            className={isOpen ? "faq-item open" : "faq-item"}
            onClick={() => setOpen(isOpen ? null : index)}
          >
            <div className="faq-question">
              <span>{item.q}</span>
              <span className="faq-toggle">{isOpen ? "-" : "+"}</span>
            </div>
            {isOpen && <p className="faq-answer">{item.a}</p>}
          </button>
        );
      })}
    </div>
  );
}
