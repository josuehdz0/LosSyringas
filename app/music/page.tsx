export default function Music() {
  return (
    <main className="min-h-screen bg-white pt-24 px-8 pb-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display font-extrabold italic text-5xl text-[var(--black)] mb-2">
          Music
        </h1>
        <p className="text-[var(--blue)] mb-16">Stream us everywhere.</p>

        {/* Spotify Embed */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-lg text-[var(--black)] uppercase tracking-wide mb-4">
            Spotify
          </h2>
          <iframe
            src="https://open.spotify.com/embed/artist/4RppgAwCPBVdc8tIWbG1mq?utm_source=generator&theme=0"
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-2xl"
          />
        </section>

        {/* Streaming Links */}
        <section className="mb-16">
          <h2 className="font-display font-bold text-lg text-[var(--black)] uppercase tracking-wide mb-6">
            Also on
          </h2>
          <div className="flex flex-col gap-4">
            <a
              href="https://music.apple.com/us/artist/los-syringas/1577434599"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-6 py-4 bg-[var(--black)] text-white rounded-2xl hover:bg-[var(--blue)] transition-colors"
            >
              <span className="font-display font-semibold">Apple Music</span>
            </a>
            <a
              href="https://www.youtube.com/channel/UCyfT8ed-aDBN6lg1gixJCyQ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-6 py-4 bg-[var(--black)] text-white rounded-2xl hover:bg-[var(--blue)] transition-colors"
            >
              <span className="font-display font-semibold">YouTube</span>
            </a>
          </div>
        </section>

        {/* Song list */}
        <section>
          <h2 className="font-display font-bold text-lg text-[var(--black)] uppercase tracking-wide mb-6">
            Releases
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { title: "This Song Is Not For You", label: "New", spotify: "#" },
              { title: "Right Now", spotify: "https://open.spotify.com/track/0Y5G1A6RWa7LDL6qaVHTix" },
              { title: "Satellite", spotify: "https://open.spotify.com/track/6OZlh73PEKO4oohQ9OCWJT" },
              { title: "Little Drummer Boy", spotify: "https://open.spotify.com/track/0QKQPqC1sxAvlRy2lOXxb5" },
            ].map(({ title, label, spotify }) => (
              <a
                key={title}
                href={spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-6 py-4 border border-[var(--black)]/15 rounded-xl hover:border-[var(--blue)] hover:bg-[var(--blue)]/5 transition-all"
              >
                <span className="font-display font-semibold text-[var(--black)]">
                  {title}
                </span>
                {label && (
                  <span className="text-xs font-semibold uppercase tracking-wide px-3 py-1 bg-[var(--green)] text-[var(--black)] rounded-full">
                    {label}
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
