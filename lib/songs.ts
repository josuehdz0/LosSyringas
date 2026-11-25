// Songs the homepage can show, newest first. songs[0] lives at plain "/".
export const songs = [
  { id: "suenos", title: "Sueños", sub: "new single" },
  { id: "tsinfu", title: "This Song Is Not for You", sub: "stem player" },
] as const;

export type SongId = (typeof songs)[number]["id"];

export function isSongId(v: unknown): v is SongId {
  return songs.some((s) => s.id === v);
}

export function songHref(id: SongId): string {
  return id === songs[0].id ? "/" : `/?song=${id}`;
}

export function neighborSong(id: SongId, step: 1 | -1): SongId {
  const i = songs.findIndex((s) => s.id === id);
  return songs[(i + step + songs.length) % songs.length].id;
}
