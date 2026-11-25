import { useSyncExternalStore } from "react";
import { songs, type SongId } from "./songs";

// ── Which song the homepage is showing ─────────────────────────────────────
// A tiny store so Nav, StemPlayer (mounted in the layout) and the homepage
// all agree without threading props through the layout.
let current: SongId = songs[0].id;
const listeners = new Set<() => void>();

export function getCurrentSong(): SongId {
  return current;
}

export function setCurrentSong(id: SongId): void {
  if (id === current) return;
  current = id;
  listeners.forEach((l) => l());
}

export function subscribeCurrentSong(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function useCurrentSong(): SongId {
  return useSyncExternalStore(subscribeCurrentSong, getCurrentSong, () => songs[0].id);
}
