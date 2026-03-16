"use client";

import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplashScreen from "./SplashScreen";

const FADE_DURATION = 1.0;

let sessionEntered = false;

export default function HeroSection() {
  const [splashDone, setSplashDone] = useState(sessionEntered);
  const isReturn = useRef(sessionEntered); // true when navigating back (no splash)
  const containerRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const videoA = useRef<HTMLVideoElement>(null);
  const videoB = useRef<HTMLVideoElement>(null);
  const active = useRef<"a" | "b">("a");

  useGSAP(() => {
    if (!splashDone) return;

    const subtitle = subtitleRef.current;
    const container = containerRef.current;
    const h1 = h1Ref.current;
    if (!subtitle || !container || !h1) return;

    const subtitleHeight = subtitle.offsetHeight;

    if (isReturn.current) {
      // Returning from another page — blur in h1, then slide up container + subtitle
      gsap.timeline()
        .from(h1, { opacity: 0, filter: "blur(14px)", duration: 1.0, ease: "power3.out" })
        .from(container, { y: subtitleHeight / 2, duration: 0.7, ease: "power2.out" }, "-=0.4")
        .from(subtitle, { y: 20, opacity: 0, duration: 0.7, ease: "power2.out" }, "<");
    } else {
      // Just entered from splash — subtitle slides up, h1 stays put
      gsap.timeline()
        .from(container, { y: subtitleHeight / 2, duration: 0.7, ease: "power2.out" })
        .from(subtitle, { y: 20, opacity: 0, duration: 0.7, ease: "power2.out" }, "<");
    }
  }, { dependencies: [splashDone] });

  // Crossfade loop
  useEffect(() => {
    const a = videoA.current;
    const b = videoB.current;
    if (!a || !b) return;

    gsap.set(a, { zIndex: 2 });
    gsap.set(b, { zIndex: 1, opacity: 1 });

    let fading = false;

    function handleTimeUpdate() {
      const top = active.current === "a" ? a! : b!;
      const bottom = active.current === "a" ? b! : a!;
      const timeLeft = top.duration - top.currentTime;

      if (timeLeft <= FADE_DURATION && !fading) {
        fading = true;
        bottom.currentTime = 0;
        bottom.play();

        gsap.to(top, {
          opacity: 0,
          duration: FADE_DURATION,
          ease: "none",
          onComplete: () => {
            active.current = active.current === "a" ? "b" : "a";
            gsap.set(top, { zIndex: 1, opacity: 1 });
            gsap.set(bottom, { zIndex: 2 });
            top.pause();
            top.currentTime = 0;
            fading = false;
          },
        });
      }
    }

    a.addEventListener("timeupdate", handleTimeUpdate);
    b.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      a.removeEventListener("timeupdate", handleTimeUpdate);
      b.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  function handleEnter() {
    sessionEntered = true;
    setSplashDone(true);
    window.dispatchEvent(new Event("splashEntered"));
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {!splashDone && <SplashScreen onEnter={handleEnter} />}

      <video ref={videoA} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" src="/hero.mp4" />
      <video ref={videoB} muted playsInline className="absolute inset-0 w-full h-full object-cover" src="/hero.mp4" />

      {/* One container — both title and subtitle naturally spaced together */}
      <div ref={containerRef} className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="text-center px-4">
          <h1
            ref={h1Ref}
            className="font-display font-black italic text-white leading-none"
            style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}
          >
            Los Syringas
          </h1>

          {splashDone && (
            <p
              ref={subtitleRef}
              className="text-white/80 mt-4"
              style={{ fontSize: "clamp(0.9rem, 2vw, 1.125rem)" }}
            >
              Indie Surf Rock Band · Boise, ID
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
