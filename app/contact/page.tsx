const socials = [
  { label: "Instagram", href: "https://www.instagram.com/los_syringas/" },
  { label: "Spotify", href: "https://open.spotify.com/artist/4RppgAwCPBVdc8tIWbG1mq" },
  { label: "Apple Music", href: "https://music.apple.com/us/artist/los-syringas/1577434599" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCyfT8ed-aDBN6lg1gixJCyQ" },
];

export default function Contact() {
  return (
    <main className="min-h-screen bg-white pt-24 px-8 pb-24 flex items-center">
      <div className="max-w-2xl mx-auto w-full">
        <h1 className="font-display font-extrabold italic text-5xl text-[var(--black)] mb-2">
          Contact
        </h1>
        <p className="text-[var(--blue)] mb-16">Let&apos;s make something happen.</p>

        {/* Booking CTA */}
        <section className="mb-16 bg-[var(--black)] rounded-3xl p-10 text-center">
          <p className="text-white/50 text-sm uppercase tracking-widest mb-4">Bookings</p>
          <p className="font-display font-bold text-2xl text-white mb-8">
            Want us to play for your event?
          </p>
          <a
            href="mailto:lossyringas@gmail.com"
            className="inline-block font-semibold text-sm uppercase tracking-wide px-8 py-3 bg-[var(--yellow)] text-[var(--black)] rounded-full hover:bg-[var(--green)] transition-colors"
          >
            Email Us
          </a>
          <p className="text-white/30 text-sm mt-4">lossyringas@gmail.com</p>
        </section>

        {/* Socials */}
        <section>
          <h2 className="font-display font-bold text-lg text-[var(--black)] uppercase tracking-wide mb-6">
            Find Us Online
          </h2>
          <div className="flex flex-col gap-3">
            {socials.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-6 py-4 border border-[var(--black)]/15 rounded-xl hover:border-[var(--blue)] hover:bg-[var(--blue)]/5 transition-all"
              >
                <span className="font-display font-semibold text-[var(--black)]">
                  {label}
                </span>
                <span className="text-[var(--black)]/30 text-sm">→</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
