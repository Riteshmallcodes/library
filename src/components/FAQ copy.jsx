import { useState } from "react";

const faqs = [
  { q: "Library timing?", a: "Mon–Sat: 8 AM – 8 PM" },
  { q: "Membership fees?", a: "₹300 per month" },
  { q: "Book issue rules?", a: "1 book for 7 days" }
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="faq-wrapper" style={{ maxWidth: "500px", margin: "40px auto" }}>
      <h2>Help / FAQ</h2>

      {faqs.map((item, index) => (
        <div key={index}>
          <h4 onClick={() => setOpen(open === index ? null : index)}>
            {item.q}
          </h4>
          {open === index && <p>{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
