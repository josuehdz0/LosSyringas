"use client";

import { useEffect, useState } from "react";
import { type SongId } from "@/lib/songs";
import { setCurrentSong, useCurrentSong } from "@/lib/currentSong";
import StickyWall from "@/components/sticky-wall/StickyWall";
import HeroSection from "@/components/HeroSection";

/**
 * Homepage: shows the current song. `?song=<id>` picks it (newest at plain "/").
 * Sueños is the sticky wall; This Song Is Not for You is the original hero +
 * StemPlayer (StemPlayer stays mounted in the layout and shows its stem row
 * only while this song is current). The only way between them is the hidden
 * double-click/tap on the flower logo (see Nav).
 */
export default function HomeSongs({ initialSong }: { initialSong: SongId }) {
  const storeSong = useCurrentSong();

  const [synced, setSynced] = useState(false);

  // Follow the URL (first load, back/forward).
  useEffect(() => {
    setCurrentSong(initialSong);
    setSynced(true);
  }, [initialSong]);

  // Until the store has caught up with the URL, trust the URL.
  const song = synced ? storeSong : initialSong;

  return (
    <div key={song} className="animate-scene-in">
      {song === "suenos" ? (
        <StickyWall />
      ) : (
        <HeroSection />
      )}
    </div>
  );
}

