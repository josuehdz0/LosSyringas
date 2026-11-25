import HomeSongs from "@/components/HomeSongs";
import { isSongId } from "@/lib/songs";

export default function Home({ searchParams }: { searchParams: { song?: string | string[] } }) {
  const raw = Array.isArray(searchParams.song) ? searchParams.song[0] : searchParams.song;
  // Only an explicit ?song= picks the song. Plain "/" (Home link, logo
  // click) keeps whichever song the visitor is on; the logo double-click is
  // the only way to switch.
  const requested = isSongId(raw) ? raw : undefined;
  return (
    <main>
      <HomeSongs requestedSong={requested} />
    </main>
  );
}
