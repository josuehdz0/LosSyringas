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
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const muteButtonRef = useRef<HTMLButtonElement>(null);
  const isHome = pathname === "/";
  // Pages with a full-bleed hero photo — nav should be white text when not scrolled
  const hasHero = pathname === "/music";
  const useWhiteText = isHome || (hasHero && !scrolled);

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
    function onEntered() {
      setVisible(true);
      const isMobile = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
      if (isMobile && muteButtonRef.current) {
        setTimeout(() => {
          gsap.timeline()
            .to(muteButtonRef.current, { scale: 1.4, duration: 0.2, ease: "power2.out" })
            .to(muteButtonRef.current, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" })
            .to(muteButtonRef.current, { scale: 1.4, duration: 0.2, ease: "power2.out", delay: 0.2 })
            .to(muteButtonRef.current, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" })
            .to(muteButtonRef.current, { scale: 1.4, duration: 0.2, ease: "power2.out", delay: 0.2 })
            .to(muteButtonRef.current, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" });
        }, 800);
      }
    }
    window.addEventListener("splashEntered", onEntered);
    return () => window.removeEventListener("splashEntered", onEntered);
  }, [isHome]);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 16); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll and notify StemPlayer when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    window.dispatchEvent(new CustomEvent("navMenuChange", { detail: { open } }));
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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

  function linkClass(href: string) {
    const active = pathname === href;
    if (useWhiteText) {
      return active
        ? "text-[var(--black)] bg-white/90 px-3 py-1 rounded-full"
        : "text-white hover:text-white/70";
    }
    return active
      ? "text-[var(--black)] bg-white/90 px-3 py-1 rounded-full"
      : "text-[var(--black)] hover:text-[var(--blue)]";
  }

  // When menu is open, everything in the top bar goes dark
  const logoFill = open ? "var(--black)" : (useWhiteText ? "white" : "var(--black)");
  const iconColor = open
    ? "text-[var(--black)]"
    : (useWhiteText ? "text-white" : "text-[var(--black)]");
  const hamburgerColor = open ? "bg-[var(--black)]" : (useWhiteText ? "bg-white" : "bg-[var(--black)]");

  return (
    <>
      {/* Top bar — transitions to white background when menu is open */}
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-[60] transition-colors duration-300 ${
          open && !isHome
            ? "bg-white"
            : !isHome && scrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm"
            : ""
        } ${!visible ? "opacity-0 pointer-events-none" : ""}`}
      >
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between px-6 md:px-12 py-4" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
          <Link href="/" onClick={() => setOpen(false)} aria-label="Los Syringas">
            <Logo
              className="h-8 w-auto transition-opacity hover:opacity-70"
              fill={logoFill}
            />
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex gap-6 items-center">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`font-display font-semibold italic text-sm tracking-wide uppercase transition-all ${linkClass(href)}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile right — mute + hamburger */}
          <div className="md:hidden flex items-center gap-4">
            <button
              ref={muteButtonRef}
              onClick={handleMute}
              aria-label="Toggle mute"
              className={`transition-all duration-300 ${iconColor} ${muted ? "opacity-40" : "opacity-100"}`}
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
      </nav>

      {/* Fullscreen mobile menu overlay — z-40, below the top bar */}
      <div
        className={`fixed inset-0 z-[55] bg-white md:hidden flex flex-col items-center justify-center transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <ul className="flex flex-col items-center gap-10">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`font-display font-black italic text-5xl tracking-wide transition-colors duration-200 ${
                  pathname === href
                    ? "text-[var(--black)]"
                    : "text-[var(--black)]/40 hover:text-[var(--black)]/80"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
