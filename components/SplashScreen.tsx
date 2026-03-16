"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface SplashScreenProps {
  onEnter: () => void;
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    gsap.set(lineRef.current, { scaleX: 0 });

    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(titleRef.current, { opacity: 1, filter: "blur(0px)", duration: 1.4, ease: "power3.out" })
      .to(enterRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.4")
      .to(lineRef.current, { scaleX: 1, duration: 0.6, ease: "power3.out", transformOrigin: "left center" }, "-=0.3");

    gsap.to(enterRef.current, {
      opacity: 0.45,
      duration: 1.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1.8,
    });
  });

  function handleEnter() {
    gsap.killTweensOf(enterRef.current);
    gsap.timeline({ onComplete: onEnter })
      .to(enterRef.current, { scale: 1.06, duration: 0.12, ease: "power2.out" })
      .to(overlayRef.current, { opacity: 0, duration: 0.85, ease: "power2.inOut" }, "-=0.05");
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] bg-white">
      {/* Title — independently centered, matches hero title position exactly */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h1
          ref={titleRef}
          className="font-display font-black italic text-[var(--black)] leading-none"
          style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", opacity: 0 }}
        >
          Los Syringas
        </h1>
      </div>

      {/* Enter — anchored below center, does not affect title position */}
      <div className="absolute inset-x-0 flex justify-center" style={{ top: "60%" }}>
        <button
          ref={enterRef}
          onClick={handleEnter}
          className="relative text-[var(--black)] uppercase tracking-[0.25em] focus:outline-none"
          style={{
            fontSize: "clamp(0.65rem, 1.5vw, 0.85rem)",
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            fontWeight: 500,
            opacity: 0,
          }}
        >
          Enter
          <span
            ref={lineRef}
            className="absolute left-0 -bottom-1 w-full h-px bg-[var(--black)] block"
          />
        </button>
      </div>
    </div>
  );
}
