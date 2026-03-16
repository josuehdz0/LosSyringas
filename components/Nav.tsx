"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Volume2, VolumeX } from "lucide-react";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/music", label: "Music" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [muted, setMuted] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const isHome = pathname === "/";

  useGSAP(() => {
    if (!visible) return;
    gsap.from(navRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
    });
  }, { dependencies: [visible] });

  useEffect(() => {
    if (!isHome) { setVisible(true); return; }
    function onEntered() { setVisible(true); }
    window.addEventListener("splashEntered", onEntered);
    return () => window.removeEventListener("splashEntered", onEntered);
  }, [isHome]);

  // Stay in sync with StemPlayer mute state
  useEffect(() => {
    function onMuteChange(e: Event) {
      setMuted((e as CustomEvent<{ muted: boolean }>).detail.muted);
    }
    window.addEventListener("muteChange", onMuteChange);
    return () => window.removeEventListener("muteChange", onMuteChange);
  }, []);

  function handleMute() {
    const next = !muted;
    setMuted(next);
    window.dispatchEvent(new CustomEvent("muteToggle", { detail: { muted: next } }));
  }

  const logoClass = isHome
    ? "text-white hover:text-white/70"
    : "text-[var(--black)] hover:text-[var(--blue)]";

  function linkClass(href: string) {
    const active = pathname === href;
    if (isHome) {
      return active
        ? "text-[var(--black)] bg-white/90 px-3 py-1 rounded-full"
        : "text-white hover:text-white/70";
    }
    return active
      ? "text-[var(--blue)]"
      : "text-[var(--black)] hover:text-[var(--blue)]";
  }

  const hamburgerColor = isHome ? "bg-white" : "bg-[var(--black)]";

  return (
    <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-50 ${!visible ? "opacity-0 pointer-events-none" : ""}`}>
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" onClick={() => setOpen(false)} aria-label="Los Syringas">
          <Logo
            className="h-8 w-auto transition-opacity hover:opacity-70"
            fill={isHome ? "white" : "var(--black)"}
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-6 items-center">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`font-display font-semibold text-sm tracking-wide uppercase transition-all ${linkClass(href)}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile right — mute + hamburger */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={handleMute}
            aria-label="Toggle mute"
            className={`transition-opacity ${isHome ? "text-white" : "text-[var(--black)]"} ${muted ? "opacity-40" : "opacity-100"}`}
          >
            {muted ? <VolumeX size={20} strokeWidth={1.75} /> : <Volume2 size={20} strokeWidth={1.75} />}
          </button>

          <button
            className="flex flex-col justify-center gap-1.5 w-8 h-8"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 transition-all duration-300 origin-center ${hamburgerColor} ${open ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 transition-all duration-300 ${hamburgerColor} ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 transition-all duration-300 origin-center ${hamburgerColor} ${open ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-64" : "max-h-0"}`}>
        <ul className={`flex flex-col px-6 pb-4 gap-4 ${isHome ? "bg-black/40 backdrop-blur-sm" : ""}`}>
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`block font-display font-semibold text-sm tracking-wide uppercase transition-all ${linkClass(href)}`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
