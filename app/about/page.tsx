import Image from "next/image";
import ParallaxHero from "@/components/ParallaxHero";

const members = [
  { name: "Josué Hernández", role: "Vocals / Guitar", photo: "/band-photos/Josue-Profile.JPG", instagram: "https://www.instagram.com/thiccpalo/" },
  { name: "Josh Harris",     role: "Keys",            photo: "/band-photos/Josh-Profile.JPG",   instagram: "https://www.instagram.com/jharris_812/" },
  { name: "Pearson Morgan",  role: "Lead Guitar",     photo: "/band-photos/Pearson-Profile.JPG", instagram: "https://www.instagram.com/pditty70/" },
  { name: "Shawn Derksen",   role: "Bass / Vocals",   photo: "/band-photos/Shawn-Profile.JPG",  instagram: null },
  { name: "Luke Jones",      role: "Drums",           photo: "/band-photos/Luke-Profile.JPG",   instagram: "https://www.instagram.com/lukesuperflyjones/" },
];

export default function About() {
  return (
    <main>
      <ParallaxHero
        src="/band-photos/IMG_8324.JPG"
        alt="Los Syringas band photo"
        objectPosition="object-[50%_25%]"
      />

      {/* Content */}
      <div className="bg-white pb-32">
        <div className="max-w-5xl mx-auto px-6 md:px-12">

          {/* Desktop: two-column grid. Mobile: flex-col with custom order */}
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-x-16 md:gap-y-12">

            {/* Who We Are — left col row 1 on desktop, first on mobile */}
            <section className="order-1 md:col-start-1 md:row-start-1 mb-12 md:mb-0">
              <h2 className="font-display font-bold italic text-2xl text-[var(--black)] mb-4">
                Who We Are
              </h2>
              <p className="text-[var(--black)] leading-relaxed mb-4">
                As an ode to the Idaho state flower, 5 friends named their band Los Syringas. While each
                member has a unique taste in music, the result is a forced fusion of Surf Rock, Latin, and
                Pop Jazz. Influences range from Los Amigos Invisibles all the way to Sigur Rós.
              </p>
              <p className="text-[var(--black)]/60 leading-relaxed">
                The five piece group started jamming together the summer of 2019 and released their first
                single &ldquo;Satellite&rdquo; the summer of 2021.
              </p>
            </section>

            {/* The Band — right col rows 1–2 on desktop, second on mobile */}
            <div className="order-2 md:col-start-2 md:row-start-1 md:row-span-2 mb-12 md:mb-0">
              <h2 className="font-display font-bold italic text-2xl text-[var(--black)] mb-6">
                The Band
              </h2>
              <div className="flex flex-col gap-4">
                {members.map(({ name, role, photo, instagram }) => (
                  <div
                    key={name}
                    className="flex items-center gap-4 px-5 py-4 border border-[var(--black)]/10 rounded-2xl"
                  >
                    <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[var(--black)]/5">
                      <Image
                        src={photo}
                        alt={name}
                        fill
                        className="object-cover object-top"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className="font-semibold text-[var(--black)] text-sm leading-tight">{name}</span>
                      <span className="text-[var(--blue)] text-xs">{role}</span>
                    </div>
                    {instagram && (
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--black)]/30 hover:text-[var(--green)] transition-colors"
                      >
                        IG →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* How We Met — left col row 2 on desktop, third on mobile */}
            <section className="order-3 md:col-start-1 md:row-start-2 bg-[var(--black)] rounded-3xl p-8">
              <h2 className="font-display font-bold italic text-xl text-[var(--yellow)] mb-4">
                How We Met
              </h2>
              <p className="text-white/80 leading-relaxed text-sm">
                Pearson, Josué, and Josh used to live together. Each would jam alone in their room. Luke
                moved to Boise from Wisconsin and got a job where Josué worked. Luke suggested they all
                should jam together sometime. They did. It was fun. So fun that Luke suggested they start
                a band. The rest of the group didn&apos;t really know what starting a &ldquo;band&rdquo; meant
                since they&apos;d never been in one. They realized it just meant hanging out more and playing
                music consistently. Now we have a website.
              </p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
