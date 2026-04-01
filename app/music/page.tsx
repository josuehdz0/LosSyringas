import { FaSpotify, FaYoutube } from "react-icons/fa";
import { SiApplemusic } from "react-icons/si";
import ParallaxHero from "@/components/ParallaxHero";

interface Release {
  title: string;
  label?: string;
  spotify?: string | null;
  appleMusic?: string | null;
  youtube?: string | null;
}

const releases: Release[] = [
  {
    title: "This Song Is Not For You",
    spotify: "https://open.spotify.com/track/6V2FdnOp4Wo7TSBJjubQ3a?si=6ebe1ccc6d3d4e28",
    appleMusic: "https://music.apple.com/us/album/this-song-is-not-for-you/1886643216?i=1886643217",
    youtube: "https://www.youtube.com/watch?v=CYZ-HAIRgFk",
  },
  {
    title: "Fish",
    spotify: "https://open.spotify.com/track/0SSKZPMt8nG26k7v71NtPi",
    appleMusic: "https://music.apple.com/us/album/fish/1735090271?i=1735090275",
    youtube: "https://www.youtube.com/watch?v=tdUMYQFQ37k",
  },
  {
    title: "Right Now",
    spotify: "https://open.spotify.com/track/0Y5G1A6RWa7LDL6qaVHTix",
    appleMusic: "https://music.apple.com/us/album/right-now/1631729227?i=1631729228",
    youtube: "https://www.youtube.com/watch?v=jPnfuf61OK8",
  },
  {
    title: "Satellite",
    spotify: "https://open.spotify.com/track/6OZlh73PEKO4oohQ9OCWJT",
    appleMusic: "https://music.apple.com/us/album/satellite/1577435659?i=1577435660",
    youtube: "https://www.youtube.com/watch?v=XmFZ-oQI3eA",
  },
];


export default function Music() {
  return (
    <main className="bg-white min-h-screen">
      <ParallaxHero
        src="/band-photos/Patio-Shot.JPG"
        alt="Los Syringas patio shot"
        objectPosition="object-center"
      />

      <div className="bg-white pb-24">
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          {/* Two-column layout on desktop */}
          <div className="md:grid md:grid-cols-2 md:gap-16">

            {/* Left column — Releases */}
            <div>
              <h2 className="font-display font-bold italic text-2xl text-[var(--black)] mb-4">
                Releases
              </h2>
              <div className="flex flex-col gap-3">
                {releases.map(({ title, label, spotify, appleMusic, youtube }) => {
                  const hasLinks = spotify || appleMusic || youtube;
                  return (
                    <div
                      key={title}
                      className="flex items-center justify-between px-5 py-4 border border-[var(--black)]/15 rounded-xl"
                    >
                      <div className="flex items-center min-w-0">
                        <span className="font-semibold text-[var(--black)] text-sm truncate">{title}</span>
                      </div>
                      {label && (
                        <span className="flex-shrink-0 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 bg-[var(--yellow)] text-[var(--black)] rounded-full ml-3">
                          {label}
                        </span>
                      )}
                      {hasLinks && (
                        <div className="flex items-center gap-5 ml-3 flex-shrink-0">
                          {spotify && (
                            <a href={spotify} target="_blank" rel="noopener noreferrer" aria-label="Spotify" className="text-[var(--black)]/30 hover:text-[#1DB954] transition-colors">
                              <FaSpotify size={18} />
                            </a>
                          )}
                          {appleMusic && (
                            <a href={appleMusic} target="_blank" rel="noopener noreferrer" aria-label="Apple Music" className="text-[var(--black)]/30 hover:text-[#FC3C44] transition-colors">
                              <SiApplemusic size={18} />
                            </a>
                          )}
                          {youtube && (
                            <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-[var(--black)]/30 hover:text-[#FF0000] transition-colors">
                              <FaYoutube size={18} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-10 py-8">
                <a href="https://open.spotify.com/artist/4RppgAwCPBVdc8tIWbG1mq?si=4DNLqtgzTg677XD_wtzQbQ" target="_blank" rel="noopener noreferrer" aria-label="Spotify" className="text-[#1DB954] hover:opacity-70 transition-opacity">
                  <FaSpotify size={40} />
                </a>
                <a href="https://music.apple.com/us/artist/los-syringas/1577434599" target="_blank" rel="noopener noreferrer" aria-label="Apple Music" className="text-[#FC3C44] hover:opacity-70 transition-opacity">
                  <SiApplemusic size={40} />
                </a>
                <a href="https://www.youtube.com/channel/UCyfT8ed-aDBN6lg1gixJCyQ" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-[#FF0000] hover:opacity-70 transition-opacity">
                  <FaYoutube size={40} />
                </a>
              </div>
            </div>

            {/* Right column — Spotify embed */}
            <div>
              <iframe
                src="https://open.spotify.com/embed/artist/4RppgAwCPBVdc8tIWbG1mq?utm_source=generator&theme=0"
                width="100%"
                height="352"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-2xl"
              />
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
