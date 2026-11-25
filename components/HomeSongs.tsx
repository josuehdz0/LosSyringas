"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { songHref, type SongId } from "@/lib/songs";
import { setCurrentSong, useCurrentSong } from "@/lib/currentSong";
import StickyWall from "@/components/sticky-wall/StickyWall";
import HeroSection from "@/components/HeroSection";

/**
 * Homepage song switcher. `?song=<id>` picks the song (newest at plain "/").
 * Sueños is the sticky wall; This Song Is Not for You is the original hero +
 * StemPlayer (StemPlayer stays mounted in the layout and shows its stem row
 * only while this song is current).
 */
export default function HomeSongs({ initialSong }: { initialSong: SongId }) {
  const router = useRouter();
  const storeSong = useCurrentSong();

  const [synced, setSynced] = useState(false);

  // Follow the URL (first load, back/forward).
  useEffect(() => {
    setCurrentSong(initialSong);
    setSynced(true);
  }, [initialSong]);

  // Until the store has caught up with the URL, trust the URL.
  const song = synced ? storeSong : initialSong;

  function switchTo(id: SongId) {
    setCurrentSong(id);
    router.replace(songHref(id), { scroll: false });
  }

  return (
    <div key={song} className="animate-scene-in">
      {song === "suenos" ? (
        <StickyWall songId={song} onSwitch={switchTo} />
      ) : (
        <HeroSection songId={song} onSwitch={switchTo} />
      )}
    </div>
  );
}

