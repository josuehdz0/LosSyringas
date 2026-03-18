"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import * as Tone from "tone";
import { stemAnalysers, setActiveStemIds, setIsMuted, setIsPlaying } from "@/lib/audioAnalysers";

const stems = [
  { id: "bass",       label: "Bass",        image: "/Portraits/Shawn.png",    file: "/stems/TSINFU demo flat_Bass.wav" },
  { id: "drums",      label: "Drums",       image: "/Portraits/Luke.png",     file: "/stems/TSINFU demo flat_Drum Kit.wav" },
  { id: "guitars",    label: "Guitars",     image: "/Portraits/Josue.png",    file: "/stems/TSINFU demo flat_Guitars.wav" },
  { id: "keys",       label: "Keys",        image: "/Portraits/Josh.png",     file: "/stems/TSINFU demo flat_Keys and Pads.wav" },
  { id: "percussion", label: "Percussion",  image: "/Portraits/Pearson.png",  file: "/stems/TSINFU demo flat_Percussion.wav" },
  { id: "magic",      label: "Magic",       image: "/Portraits/Mushrooms.png",file: "/stems/TSINFU demo flat_Magic.wav" },
];

let splashCleared = false;

interface StemButtonProps {
  id: string;
  label: string;
  image: string;
  on: boolean;
  loading: boolean;
  circleRef: (el: HTMLDivElement | null) => void;
  wrapperRef: (el: HTMLDivElement | null) => void;
  onToggle: () => void;
}

function StemButton({ label, image, on, loading, circleRef, wrapperRef, onToggle }: StemButtonProps) {
  return (
    <div
      ref={wrapperRef}
      onClick={onToggle}
      className={`flex flex-col items-center cursor-pointer select-none ${loading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="relative w-full aspect-square md:w-24 md:h-24">
        <div className="w-full h-full rounded-full overflow-hidden bg-white transition-transform duration-200 ease-out hover:scale-105 active:scale-95">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={label} className="w-full h-full object-contain" />
        </div>
        {/* Ring overlay — outer box-shadow pulse, no overflow clipping */}
        <div ref={circleRef} className="absolute inset-0 rounded-full pointer-events-none" />
      </div>
      <span className={`mt-1.5 text-[10px] font-semibold uppercase tracking-wide leading-none transition-colors duration-200 ${
        on ? "text-[var(--yellow)]" : "text-[var(--black)]/60"
      }`}>
        {label}
      </span>
    </div>
  );
}

export default function StemPlayer() {
  const [active, setActive] = useState<Set<string>>(new Set(["magic"]));
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animReady, setAnimReady] = useState(splashCleared);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const isHome = usePathname() === "/";

  const stemsRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const wrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const glowTweens = useRef<Record<string, gsap.core.Tween | null>>({});
  const players = useRef<Record<string, Tone.Player>>({});

  // Stable ref callbacks — one per stem, never recreated
  const circleRefs = useRef(
    Object.fromEntries(
      stems.map(({ id }) => [id, (el: HTMLDivElement | null) => { buttonRefs.current[id] = el; }])
    )
  );
  const wrapperRefCallbacks = useRef(
    Object.fromEntries(
      stems.map(({ id }) => [id, (el: HTMLDivElement | null) => { wrapperRefs.current[id] = el; }])
    )
  );

  useGSAP(() => {
    if (animReady) return;
    const targets = [stemsRef.current, controlsRef.current].filter(Boolean);
    if (targets.length) gsap.set(targets, { opacity: 0, y: 40 });
  }, []);

  useGSAP(() => {
    if (!animReady) return;
    gsap.to(stemsRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
    gsap.to(controlsRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.15 });
  }, { dependencies: [animReady] });

  useEffect(() => {
    if (splashCleared) return;
    function onEntered() {
      splashCleared = true;
      setAnimReady(true);
      startAudio();
    }
    window.addEventListener("splashEntered", onEntered);
    return () => window.removeEventListener("splashEntered", onEntered);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Tone.getDestination().mute = muted;
    setIsMuted(muted);
    window.dispatchEvent(new CustomEvent("muteChange", { detail: { muted } }));
  }, [muted]);

  useEffect(() => {
    function onMuteToggle(e: Event) {
      setMuted((e as CustomEvent<{ muted: boolean }>).detail.muted);
    }
    window.addEventListener("muteToggle", onMuteToggle);
    return () => window.removeEventListener("muteToggle", onMuteToggle);
  }, []);

  useEffect(() => {
    function onNavMenuChange(e: Event) {
      setNavMenuOpen((e as CustomEvent<{ open: boolean }>).detail.open);
    }
    window.addEventListener("navMenuChange", onNavMenuChange);
    return () => window.removeEventListener("navMenuChange", onNavMenuChange);
  }, []);

  useEffect(() => {
    setActiveStemIds(active);
    stems.forEach(({ id }) => {
      const player = players.current[id];
      if (player) player.mute = !active.has(id);

      const el = buttonRefs.current[id];
      if (!el) return;

      if (active.has(id)) {
        const existing = glowTweens.current[id];
        if (existing && existing.isActive() && existing.targets()[0] === el) return;
        existing?.kill();
        gsap.set(el, { boxShadow: "0 0 0 2px rgba(255,198,0,0.4)" });
        glowTweens.current[id] = gsap.to(el, {
          boxShadow: "0 0 0 5px rgba(255,198,0,1)",
          duration: 0.9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      } else {
        glowTweens.current[id]?.kill();
        glowTweens.current[id] = null;
        gsap.to(el, { boxShadow: "0 0 0 0px rgba(255,198,0,0)", duration: 0.3 });
      }
    });
  }, [active, animReady, isHome]);

  async function startAudio() {
    setLoading(true);
    await Tone.start();
    await Promise.all(
      stems.map(({ id, file }) => {
        const analyser = new Tone.Analyser("waveform", 256);
        stemAnalysers[id] = analyser;
        const player = new Tone.Player({ url: file, loop: true, mute: !active.has(id) });
        player.connect(analyser);
        analyser.toDestination();
        players.current[id] = player;
        return player.load(file);
      })
    );
    const startTime = Tone.now() + 0.1;
    stems.forEach(({ id }) => players.current[id].start(startTime));
    setStarted(true);
    setLoading(false);
  }

  function handleToggle(id: string) {
    const el = wrapperRefs.current[id];
    if (el) {
      gsap.timeline()
        .to(el, { scale: 0.82, duration: 0.1, ease: "power2.in" })
        .to(el, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.35)" });
    }
    if (!started) {
      startAudio().then(() => setActive((prev) => {
        const next = new Set(prev);
        if (next.has(id)) { next.delete(id); } else { next.add(id); }
        return next;
      }));
      return;
    }
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  async function handlePlayPause(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = e.currentTarget;
    gsap.timeline()
      .to(btn, { scale: 0.88, duration: 0.1, ease: "power2.in" })
      .to(btn, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" });
    if (!started) { await startAudio(); return; }
    const rawCtx = Tone.getContext().rawContext as AudioContext;
    if (playing) { await rawCtx.suspend(); } else { await rawCtx.resume(); }
    setIsPlaying(!playing);
    setPlaying((p) => !p);
  }

  function handleMute(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = e.currentTarget;
    gsap.timeline()
      .to(btn, { scale: 0.88, duration: 0.1, ease: "power2.in" })
      .to(btn, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" });
    setMuted((m) => !m);
  }

  return (
    <>
      {/* Stems — home page only, single render, responsive grid */}
      {isHome && (
        <div ref={stemsRef} className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-200 ${navMenuOpen ? "opacity-0 pointer-events-none" : ""}`}>
          <div className="grid grid-cols-3 w-[75vw] gap-x-3 gap-y-3 md:w-auto md:flex md:flex-row md:gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {stems.map(({ id, label, image }) => (
              <StemButton
                key={id}
                id={id}
                label={label}
                image={image}
                on={active.has(id)}
                loading={loading}
                circleRef={circleRefs.current[id]}
                wrapperRef={wrapperRefCallbacks.current[id]}
                onToggle={() => handleToggle(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Desktop controls — play/pause + mute, fixed right */}
      <div ref={controlsRef} className="hidden md:flex fixed bottom-6 right-6 z-50">
        <div className="flex flex-row gap-2 bg-white border border-[var(--black)]/15 rounded-2xl px-4 py-3 shadow-sm">
          <button
            onClick={handlePlayPause}
            className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-[var(--black)]/50 hover:text-[var(--black)]/80 transition-colors duration-200"
          >
            {playing && started ? <Pause size={20} strokeWidth={1.75} /> : <Play size={20} strokeWidth={1.75} />}
            <span className="text-[9px] font-semibold uppercase tracking-wide leading-none">
              {playing && started ? "Pause" : "Play"}
            </span>
          </button>
          <button
            onClick={handleMute}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors duration-200 ${
              muted ? "text-[var(--black)]/20" : "text-[var(--black)]/50 hover:text-[var(--black)]/80"
            }`}
          >
            {muted ? <VolumeX size={20} strokeWidth={1.75} /> : <Volume2 size={20} strokeWidth={1.75} />}
            <span className="text-[9px] font-semibold uppercase tracking-wide leading-none">
              {muted ? "Muted" : "Sound"}
            </span>
          </button>
        </div>
      </div>

    </>
  );
}
