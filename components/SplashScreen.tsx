"use client";

import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface SplashScreenProps {
  onEnter: () => void;
}

const FLOWERS = [
  "/Portraits/flowers/IMG_0580.png",
  "/Portraits/flowers/IMG_1182.png",
  "/Portraits/flowers/IMG_1826.png",
  "/Portraits/flowers/IMG_2224.png",
  "/Portraits/flowers/IMG_4440.png",
  "/Portraits/flowers/IMG_4669.png",
  "/Portraits/flowers/IMG_4750.png",
  "/Portraits/flowers/IMG_5625.png",
  "/Portraits/flowers/IMG_5667.png",
  "/Portraits/flowers/IMG_5745.png",
  "/Portraits/flowers/IMG_5986.png",
  "/Portraits/flowers/IMG_6623.png",
  "/Portraits/flowers/IMG_6882.png",
  "/Portraits/flowers/IMG_7286.png",
  "/Portraits/flowers/IMG_7680.png",
  "/Portraits/flowers/IMG_8257.png",
  "/Portraits/flowers/IMG_9109.png",
  "/Portraits/flowers/IMG_9308.png",
  "/Portraits/flowers/IMG_9317.png",
];

const PASSWORD = "TSINFU2026";

function randomFlower() {
  return FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const activeFlowers = useRef<HTMLImageElement[]>([]);

  const [password, setPassword] = useState("");

  // Force white background while splash is visible (overflow is owned by HeroSection)
  useEffect(() => {
    document.body.style.backgroundColor = "white";
    document.documentElement.style.backgroundColor = "white";
    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.style.backgroundColor = "";
    };
  }, []);

  // Preload all flower images so first spawn has no lag
  useEffect(() => {
    FLOWERS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useGSAP(() => {
    gsap.set(lineRef.current, { scaleX: 0 });

    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(titleRef.current, { opacity: 1, filter: "blur(0px)", duration: 1.4, ease: "power3.out" })
      .to(formRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.4")
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

  // Flower trail / auto-float
  useEffect(() => {
    const container = overlayRef.current;
    if (!container) return;

    const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const MAX_FLOWERS = 30;

    function spawnFlower(x: number, y: number, driftUp = false) {
      if (activeFlowers.current.length >= MAX_FLOWERS) return;

      const img = document.createElement("img");
      img.src = randomFlower();
      img.alt = "";

      const size = driftUp
        ? 36 + Math.random() * 36
        : 44 + Math.random() * 56;

      const rotation = Math.random() * 360;
      const driftX = (Math.random() - 0.5) * 80;
      const driftY = driftUp
        ? -(90 + Math.random() * 120)
        : 50 + Math.random() * 60;
      const dur = 1.2 + Math.random() * 1.0;

      img.style.cssText = `position:absolute;pointer-events:none;width:${size}px;height:${size}px;object-fit:contain;user-select:none;`;
      container!.appendChild(img);
      activeFlowers.current.push(img);

      gsap.set(img, { x: x - size / 2, y: y - size / 2, rotation, scale: 0, opacity: driftUp ? 0.7 : 0.9 });
      gsap.timeline({
        onComplete: () => {
          img.remove();
          activeFlowers.current = activeFlowers.current.filter((f) => f !== img);
        },
      })
        .to(img, { scale: 1, duration: 0.2, ease: "back.out(1.8)" })
        .to(img, {
          x: `+=${driftX}`, y: `+=${driftY}`,
          rotation: `+=${(Math.random() - 0.5) * 90}`,
          opacity: 0, scale: driftUp ? 0.5 : 0.3,
          duration: dur, ease: "power1.out",
        }, "-=0.05");
    }

    let lastX = -999, lastY = -999;

    function onMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - lastX, dy = y - lastY;
      if (dx * dx + dy * dy < 600) return;
      lastX = x; lastY = y;
      spawnFlower(x, y, false);
    }

    function onTouchMove(e: TouchEvent) {
      const rect = container!.getBoundingClientRect();
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;
        const dx = x - lastX, dy = y - lastY;
        if (dx * dx + dy * dy < 400) continue;
        lastX = x; lastY = y;
        spawnFlower(x, y, false);
      }
    }

    function onTouchStart(e: TouchEvent) {
      const rect = container!.getBoundingClientRect();
      const t = e.touches[0];
      const x = t.clientX - rect.left;
      const y = t.clientY - rect.top;
      lastX = x; lastY = y;
      spawnFlower(x, y, false);
    }

    // Slow ambient spawns in the background regardless of touch
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isMobile) {
      interval = setInterval(() => {
        const W = container!.offsetWidth;
        const H = container!.offsetHeight;
        let x: number, y: number;
        do {
          x = Math.random() * W;
          y = Math.random() * H;
        } while (x > W * 0.3 && x < W * 0.7 && y > H * 0.35 && y < H * 0.72);
        spawnFlower(x, y, true);
      }, 750);
      container.addEventListener("touchmove", onTouchMove, { passive: true });
      container.addEventListener("touchstart", onTouchStart, { passive: true });
    } else {
      container.addEventListener("mousemove", onMouseMove);
    }

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchstart", onTouchStart);
      if (interval) clearInterval(interval);
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== PASSWORD) {
      // Shake the form and clear
      gsap.killTweensOf(inputRef.current);
      gsap.timeline()
        .to(inputRef.current, { x: -10, duration: 0.07, ease: "power2.out" })
        .to(inputRef.current, { x: 10, duration: 0.07 })
        .to(inputRef.current, { x: -7, duration: 0.07 })
        .to(inputRef.current, { x: 7, duration: 0.07 })
        .to(inputRef.current, { x: 0, duration: 0.07, ease: "power2.inOut" });
      setPassword("");
      return;
    }

    // Blur input to dismiss keyboard and let iOS viewport settle before animating
    inputRef.current?.blur();

    // Correct — dispatch immediately while still inside user gesture (Safari AudioContext requirement)
    onEnter();

    // Then animate the overlay out
    gsap.killTweensOf(enterRef.current);
    activeFlowers.current.forEach((f) => gsap.killTweensOf(f));
    gsap.timeline()
      .to(enterRef.current, { scale: 1.06, duration: 0.12, ease: "power2.out" })
      .to(overlayRef.current, { opacity: 0, duration: 0.85, ease: "power2.inOut" }, "-=0.05");
  }

  const inputStyle: React.CSSProperties = {
    fontSize: "clamp(0.65rem, 1.5vw, 0.85rem)",
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 500,
    letterSpacing: "0.2em",
    width: "110px",
    paddingBottom: "4px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "clamp(0.55rem, 1.2vw, 0.72rem)",
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 500,
    letterSpacing: "0.25em",
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] bg-white overflow-hidden" style={{ cursor: "url('/Portraits/flowers/bee-40.png') 16 14, auto" }}>
      {/* Title */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1
          ref={titleRef}
          className="font-display font-black italic text-[var(--black)] leading-none relative z-10"
          style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", opacity: 0 }}
        >
          Los Syringas
        </h1>
      </div>

      {/* Password + Enter form — anchored below center */}
      <div
        className="absolute inset-x-0 flex justify-center z-10"
        style={{ top: "58%" }}
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-5"
          style={{ opacity: 0, transform: "translateY(10px)" }}
        >
          {/* Password input */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[var(--black)]/40 uppercase" style={labelStyle}>
              Password
            </span>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="bg-transparent border-b border-[var(--black)]/40 text-center text-[var(--black)] outline-none focus:border-[var(--black)] transition-colors duration-200 placeholder:text-[var(--black)]/20"
              placeholder="••••••••••"
              style={inputStyle}
            />
          </div>

          {/* Enter button */}
          <button
            ref={enterRef}
            type="submit"
            className="relative text-[var(--black)] uppercase tracking-[0.25em] focus:outline-none"
            style={{
              fontSize: "clamp(0.65rem, 1.5vw, 0.85rem)",
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontWeight: 500,
            }}
          >
            Enter
            <span
              ref={lineRef}
              className="absolute left-0 -bottom-1 w-full h-px bg-[var(--black)] block"
            />
          </button>
        </form>
      </div>
    </div>
  );
}
