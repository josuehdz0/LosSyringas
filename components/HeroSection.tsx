"use client";

import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplashScreen from "./SplashScreen";
import { stemAnalysers, getActiveStemIds, getIsMuted } from "@/lib/audioAnalysers";

const FADE_DURATION = 1.0;
// Top → bottom display order
const STEM_IDS = ["magic", "percussion", "keys", "guitars", "drums", "bass"];

// Per-stem amplitude boost — bass waveform is nearly flat at short window sizes
// because a single low-frequency cycle spans many more samples than we capture
const STEM_GAIN: Record<string, number> = {
  magic:      1.0,
  percussion: 1.2,
  keys:       1.0,
  guitars:    1.0,
  drums:      1.2,
  bass:       4.0,
};
// Lane sizing: 6 × 30 + 5 × 14 = 250px total → matches canvas height
const LANE_H = 30;
const LANE_GAP = 14;
const CANVAS_H = STEM_IDS.length * LANE_H + (STEM_IDS.length - 1) * LANE_GAP; // 250px
// Amplitude: waves reach well into the gap on either side for drama
const AMP_PX = LANE_H + LANE_GAP * 0.6;
const SMOOTH_ALPHA = 0.18;

let sessionEntered = false;

export default function HeroSection() {
  const [splashDone, setSplashDone] = useState(sessionEntered);
  const isReturn = useRef(sessionEntered);
  const containerRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const videoA = useRef<HTMLVideoElement>(null);
  const videoB = useRef<HTMLVideoElement>(null);
  const active = useRef<"a" | "b">("a");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  // Per-stem wipe progress: 0 = not drawn, 1 = full width drawn
  // Activating: 0→1 (wipes in left→right). Deactivating: 1→0 (retreats right→left)
  const wipeProgress = useRef<Record<string, number>>(
    Object.fromEntries(STEM_IDS.map((id) => [id, id === "magic" ? 1 : 0]))
  );
  const smoothedData = useRef<Record<string, Float32Array>>({});

  useGSAP(() => {
    if (!splashDone) return;
    const subtitle = subtitleRef.current;
    const container = containerRef.current;
    const h1 = h1Ref.current;
    if (!subtitle || !container || !h1) return;
    const subtitleHeight = subtitle.offsetHeight;

    if (isReturn.current) {
      gsap.timeline()
        .from(h1, { opacity: 0, filter: "blur(14px)", duration: 1.0, ease: "power3.out" })
        .from(container, { y: subtitleHeight / 2, duration: 0.7, ease: "power2.out" }, "-=0.4")
        .from(subtitle, { y: 20, opacity: 0, duration: 0.7, ease: "power2.out" }, "<");
    } else {
      gsap.timeline()
        .from(container, { y: subtitleHeight / 2, duration: 0.7, ease: "power2.out" })
        .from(subtitle, { y: 20, opacity: 0, duration: 0.7, ease: "power2.out" }, "<");
    }
  }, { dependencies: [splashDone] });

  // Crossfade video loop
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

  // Oscilloscope RAF loop
  useEffect(() => {
    if (!splashDone) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;

      // offsetWidth is reliable for replaced elements (canvas); clientWidth can return 300px default
      const W = canvas!.offsetWidth;
      const H = canvas!.offsetHeight;
      if (canvas!.width !== W || canvas!.height !== H) {
        canvas!.width = W;
        canvas!.height = H;
      }
      ctx.clearRect(0, 0, W, H);

      const activeIds = getActiveStemIds();
      const muted = getIsMuted();

      // Tighter spacing on mobile
      const mobile = window.innerWidth < 768;
      const laneH = mobile ? LANE_H : LANE_H;
      const laneGap = mobile ? 6 : LANE_GAP;
      const ampPx = mobile ? laneH + laneGap * 0.4 : AMP_PX;

      STEM_IDS.forEach((id, stemIndex) => {
        // Fixed midY for this stem's slot
        const midY = stemIndex * (laneH + laneGap) + laneH / 2;

        // Lerp toward target — natural ease-out (fast start, graceful deceleration)
        const target = activeIds.has(id) ? 1 : 0;
        wipeProgress.current[id] += (target - wipeProgress.current[id]) * 0.1;
        // Snap to target when close enough to avoid infinite approach
        if (Math.abs(wipeProgress.current[id] - target) < 0.002) wipeProgress.current[id] = target;

        const progress = wipeProgress.current[id];
        if (progress <= 0) return; // fully off, nothing to draw

        // Temporal smoothing of audio data
        const analyser = stemAnalysers[id];
        let drawData: Float32Array;
        if (!analyser || muted || !activeIds.has(id)) {
          const len = 256;
          if (!smoothedData.current[id]) smoothedData.current[id] = new Float32Array(len);
          const s = smoothedData.current[id];
          for (let j = 0; j < len; j++) s[j] *= 0.85;
          drawData = s;
        } else {
          const raw = analyser.getValue() as Float32Array;
          if (!smoothedData.current[id]) {
            smoothedData.current[id] = new Float32Array(raw);
          } else {
            const s = smoothedData.current[id];
            for (let j = 0; j < raw.length; j++) {
              s[j] = s[j] * (1 - SMOOTH_ALPHA) + raw[j] * SMOOTH_ALPHA;
            }
          }
          drawData = smoothedData.current[id];
        }

        ctx.save();

        // Clip to [0, W*progress] — wipe in from left, retreat back to left
        ctx.beginPath();
        ctx.rect(0, 0, W * progress, H);
        ctx.clip();

        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 1.8;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(255,255,255,0.35)";
        ctx.shadowBlur = 6;
        ctx.beginPath();

        const amp = ampPx * (STEM_GAIN[id] ?? 1);
        const sliceW = W / (drawData.length - 1);

        ctx.moveTo(0, midY + drawData[0] * amp);
        for (let j = 0; j < drawData.length - 1; j++) {
          const x0 = j * sliceW;
          const x1 = (j + 1) * sliceW;
          const y0 = midY + drawData[j] * amp;
          const y1 = midY + drawData[j + 1] * amp;
          ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        }
        ctx.lineTo(W, midY + drawData[drawData.length - 1] * amp);

        ctx.stroke();
        ctx.restore();
      });
    }

    draw();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [splashDone]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleEnter() {
    sessionEntered = true;
    // Dispatch immediately so audio starts within the user gesture context
    window.dispatchEvent(new Event("splashEntered"));
    // Delay visual state until keyboard has fully dismissed and viewport settled
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setSplashDone(true);
      // Scroll again after React renders the canvas
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    }, 350);
  }

  return (
    <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "100dvh" }}>
      {/* White backdrop behind splash so iOS keyboard gap never shows video */}
      {!splashDone && <div className="fixed inset-0 z-[99] bg-white" />}
      {!splashDone && <SplashScreen onEnter={handleEnter} />}

      <video ref={videoA} autoPlay muted playsInline className="absolute inset-0 w-full object-cover" style={{ height: "100dvh" }} src="/hero.mp4" />
      <video ref={videoB} muted playsInline className="absolute inset-0 w-full object-cover" style={{ height: "100dvh" }} src="/hero.mp4" />

      {/* Oscilloscope — absolutely positioned above the title, z between video and text */}
      {splashDone && (
        <canvas
          ref={canvasRef}
          className="fixed pointer-events-none z-10 top-[4rem] md:top-[4.5rem]"
          style={{
            left: 0,
            width: "100%",
            height: `${CANVAS_H}px`,
          }}
        />
      )}

      {/* Title + subtitle — layout unchanged */}
      <div ref={containerRef} className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
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
