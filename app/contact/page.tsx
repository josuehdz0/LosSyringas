import { FaSpotify, FaYoutube, FaInstagram } from "react-icons/fa";
import ParallaxHero from "@/components/ParallaxHero";
import { SiApplemusic } from "react-icons/si";

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/los_syringas/",
    icon: FaInstagram,
    color: "#E1306C",
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/artist/4RppgAwCPBVdc8tIWbG1mq",
    icon: FaSpotify,
    color: "#1DB954",
  },
  {
    label: "Apple Music",
    href: "https://music.apple.com/us/artist/los-syringas/1577434599",
    icon: SiApplemusic,
    color: "#FC3C44",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCyfT8ed-aDBN6lg1gixJCyQ",
    icon: FaYoutube,
    color: "#FF0000",
  },
];

export default function Contact() {
  return (
    <main className="bg-white min-h-screen">
      <ParallaxHero
        src="/band-photos/Contact-Hero.JPG"
        srcDesktop="/band-photos/Contact-Hero-Desktop.JPG"
        alt="Los Syringas contact"
        objectPosition="object-top"
      />

      <div className="bg-white pb-24">
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          {/* Two-column layout on desktop */}
          <div className="md:grid md:grid-cols-2 md:gap-16">

            {/* Left — Booking */}
            <div className="mb-12 md:mb-0">
              <h2 className="font-display font-bold italic text-2xl text-[var(--black)] mb-4">
                Bookings
              </h2>
              <div className="bg-[var(--black)] rounded-3xl p-8">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-3">
                  Weddings · Concerts · Private Events
                </p>
                <p className="font-semibold text-xl text-white mb-6 leading-snug">
                  Want us to play for your event?
                </p>
                <a
                  href="mailto:lossyringas@gmail.com"
                  className="block w-full text-center font-semibold text-sm uppercase tracking-wide px-8 py-4 bg-[var(--yellow)] text-[var(--black)] rounded-2xl hover:bg-[var(--green)] transition-colors"
                >
                  Email Us
                </a>
                <p className="text-white/30 text-sm mt-5">lossyringas@gmail.com</p>
              </div>
            </div>

            {/* Right — Find Us Online */}
            <div>
              <h2 className="font-display font-bold italic text-2xl text-[var(--black)] mb-4">
                Find Us Online
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {socials.map(({ label, href, icon: Icon, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-3 py-8 border border-[var(--black)]/10 rounded-2xl hover:border-[var(--black)]/20 hover:bg-[var(--black)]/[0.02] transition-all"
                  >
                    <Icon size={36} style={{ color }} />
                    <span className="text-xs font-semibold text-[var(--black)]/50 uppercase tracking-wide">
                      {label}
                    </span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
