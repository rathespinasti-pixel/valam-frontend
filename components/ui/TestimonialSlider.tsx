"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface Testimonial {
  stars: number;
  quote: string;
  initial: string;
  name: string;
  role: string;
}

function perViewForWidth(width: number) {
  if (width <= 600) return 1;
  if (width <= 980) return 2;
  return 3;
}

// Ports the testimonial carousel from js/script.js: perView is read from
// window width at the moment Next/Prev is clicked (matching the original,
// which also didn't recompute on resize) and the track is translated by
// index * (100 / perView)%.
export function TestimonialSlider({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (next: number) => {
    const perView = perViewForWidth(window.innerWidth);
    const maxIndex = Math.max(0, items.length - perView);
    const clamped = Math.min(Math.max(next, 0), maxIndex);
    setIndex(clamped);
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${clamped * (100 / perView)}%)`;
    }
  };

  const onNext = () => {
    const perView = perViewForWidth(window.innerWidth);
    const maxIndex = Math.max(0, items.length - perView);
    move(index < maxIndex ? index + 1 : 0);
  };

  const onPrev = () => {
    const perView = perViewForWidth(window.innerWidth);
    const maxIndex = Math.max(0, items.length - perView);
    move(index > 0 ? index - 1 : maxIndex);
  };

  return (
    <>
      <div className="test-track-wrap">
        <div className="test-track" ref={trackRef}>
          {items.map((t) => (
            <div className="test-card" key={t.name}>
              <div className="stars">
                {Array.from({ length: Math.floor(t.stars) }).map((_, i) => (
                  <i key={i} className="fa-solid fa-star" aria-hidden="true" />
                ))}
                {t.stars % 1 !== 0 && <i className="fa-solid fa-star-half-stroke" aria-hidden="true" />}
              </div>
              <p className="quote">&quot;{t.quote}&quot;</p>
              <div className="who">
                <div className="avatar">{t.initial}</div>
                <div>
                  <b>{t.name}</b>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="test-nav">
        <button className="test-prev" aria-label="Previous" onClick={onPrev}>
          <ArrowLeft size={16} />
        </button>
        <button className="test-next" aria-label="Next" onClick={onNext}>
          <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}
