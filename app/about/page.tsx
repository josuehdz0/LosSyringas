import Image from "next/image";

const members = [
  { name: "Josué Hernández", role: "Vocals / Guitar", instagram: "https://www.instagram.com/thiccpalo/" },
  { name: "Josh Harris", role: "Keys", instagram: "https://www.instagram.com/jharris_812/" },
  { name: "Pearson Morgan", role: "Lead Guitar", instagram: "https://www.instagram.com/pditty70/" },
  { name: "Shawn Derksen", role: "Bass / Vocals", instagram: null },
  { name: "Luke Jones", role: "Drums", instagram: "https://www.instagram.com/lukesuperflyjones/" },
];

export default function About() {
  return (
    <main>
      {/* Hero — full-bleed, extends behind the fixed nav */}
      {/* Mobile: height follows photo aspect ratio (~3:2). Desktop: capped at 65vh */}
      <div className="relative w-full h-[67vw] md:h-[65vh]">
        <Image
          src="/band-photos/IMG_8324.JPG"
          alt="Los Syringas band photo"
          fill
          priority
          className="object-cover object-[50%_25%]"
          quality={90}
          sizes="100vw"
        />
        {/* Soft gradient at bottom to blend into the content below */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Content */}
      <div className="bg-white px-8 pb-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display font-extrabold italic text-5xl text-[var(--black)] mb-8">
            About
          </h1>

          {/* Bio */}
          <section className="mb-20">
            <p className="text-[var(--black)] text-lg leading-relaxed mb-6">
              As an ode to the Idaho state flower, 5 friends named their band Los Syringas. While each
              member has a unique taste in music, the result is a forced fusion of Surf Rock, Latin, and
              Pop Jazz. Influences have a range between Los Amigos Invisibles all the way to Sigur Rós.
            </p>
            <p className="text-[var(--black)]/60 leading-relaxed">
              The five piece group started jamming together the summer of 2019 and released their first
              single &ldquo;Satellite&rdquo; the summer of 2021.
            </p>
          </section>

          {/* How we met */}
          <section className="mb-20 bg-[var(--black)] rounded-3xl p-10">
            <h2 className="font-display font-bold text-xl text-[var(--yellow)] uppercase tracking-wide mb-6">
              How We Met
            </h2>
            <p className="text-white/80 leading-relaxed">
              Pearson, Josué, and Josh used to live together. Each would jam alone in their room. Luke
              moved to Boise from Wisconsin and got a job where Josué worked. Luke suggested they all
              should jam together sometime. They did. It was fun. So fun that Luke suggested they start
              a band. The rest of the group didn&apos;t really know what starting a &ldquo;band&rdquo; meant
              since they&apos;d never been in one. They realized it just meant hanging out more and playing
              music consistently. Now we have a website.
            </p>
          </section>

          {/* Members */}
          <section>
            <h2 className="font-display font-bold text-xl text-[var(--black)] uppercase tracking-wide mb-8">
              The Band
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map(({ name, role, instagram }) => (
                <div
                  key={name}
                  className="flex flex-col gap-1 px-6 py-5 border border-[var(--black)]/15 rounded-2xl"
                >
                  <span className="font-display font-bold text-[var(--black)] text-lg">
                    {name}
                  </span>
                  <span className="text-[var(--blue)] text-sm">{role}</span>
                  {instagram && (
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--black)]/40 hover:text-[var(--green)] transition-colors mt-1"
                    >
                      Instagram →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
