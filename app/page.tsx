import HomeSongs from "@/components/HomeSongs";
import { isSongId, songs } from "@/lib/songs";

export default function Home({ searchParams }: { searchParams: { song?: string | string[] } }) {
  const raw = Array.isArray(searchParams.song) ? searchParams.song[0] : searchParams.song;
  const song = isSongId(raw) ? raw : songs[0].id;
  return (
    <main>
      <HomeSongs initialSong={song} />
    </main>
  );
}
