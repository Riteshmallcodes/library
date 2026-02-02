import { useState } from "react";

export default function Gallery() {
  const photos = [
    "public/images/image.png",
    "public/images/img2.jpeg",
    "public/images/img3.jpeg"
  ];

  const [activeImg, setActiveImg] = useState(null);

  return (
    <section className="gallery-section" id="gallery">
      <div className="section-inner">
        <p className="section-kicker">Gallery</p>
        <h2>A quick look inside the library</h2>

        <div className="gallery-grid">
          {photos.map((img, i) => (
            <button
              type="button"
              className="gallery-card"
              key={i}
              onClick={() => setActiveImg(img)}
              aria-label={`Open photo ${i + 1}`}
            >
              <img src={img} alt={`Library view ${i + 1}`} />
            </button>
          ))}
        </div>
      </div>

      {activeImg && (
        <div className="lightbox" onClick={() => setActiveImg(null)}>
          <button
            type="button"
            className="close-btn"
            onClick={() => setActiveImg(null)}
            aria-label="Close image"
          >
            Close
          </button>
          <img src={activeImg} alt="Library" />
        </div>
      )}
    </section>
  );
}
