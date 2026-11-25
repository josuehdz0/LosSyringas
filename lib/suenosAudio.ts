// Sueños audio engine. A module-level singleton (not tied to any component),
// so the music keeps going when you leave the homepage, the same way
// StemPlayer (mounted in the layout) does for This Song Is Not for You.
//
// Model (from docs/suenos-sticky-wall): all five stems start at the same
// instant, looped, each through its own GainNode. Turning a stem on/off only
// ramps its gain, so they never drift.

import { useSyncExternalStore } from "react";
import { getIsMuted } from "./audioAnalysers";
import { getCurrentSong, subscribeCurrentSong } from "./currentSong";

export const SUENOS_STEMS = [
  { id: "josue",   file: "/stems/suenos/josue-guitar.mp3" },
  { id: "pearson", file: "/stems/suenos/pearson-guitar.mp3" },
  { id: "bass",    file: "/stems/suenos/bass.mp3" },
  { id: "drums",   file: "/stems/suenos/drums.mp3" },
  { id: "keys",    file: "/stems/suenos/keys.mp3" },
] as const;

/** On (stuck to the wall) when the song opens, and after every song switch. */
export const SUENOS_DEFAULT_ON = ["keys", "bass"];

let initialised = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bridge: HTMLAudioElement | null = null;
const gains: Record<string, GainNode> = {};
let raw: Promise<ArrayBuffer[]> | null = null;
let decoding = false;

let sounding = new Set<string>(SUENOS_DEFAULT_ON);
let playing = true;
let muted = false;
let hidden = false;

// ── Subscribable snapshot for React ─────────────────────────────────────────
interface Snapshot { running: boolean; loaded: boolean; playing: boolean }
let snap: Snapshot = { running: false, loaded: false, playing: true };
const listeners = new Set<() => void>();
function emit(patch: Partial<Snapshot>) {
  snap = { ...snap, ...patch };
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}
const SERVER_SNAP: Snapshot = { running: false, loaded: false, playing: true };
export function useSuenosAudio(): Snapshot {
  return useSyncExternalStore(subscribe, () => snap, () => SERVER_SNAP);
}

// ── Output level ────────────────────────────────────────────────────────────
// Heard only while: not paused, Sueños is the current song, tab visible, not muted.
function audible() {
  return playing && getCurrentSong() === "suenos" && !hidden;
}
function applyOutput(ramp = 0.05) {
  if (master && ctx) master.gain.setTargetAtTime(audible() && !muted ? 1 : 0, ctx.currentTime, ramp);
  if (bridge) bridge.muted = !audible() || muted;
}

function applyStem(id: string) {
  const g = gains[id];
  if (!g || !ctx) return;
  const on = sounding.has(id);
  const now = ctx.currentTime;
  g.gain.cancelScheduledValues(now);
  g.gain.setTargetAtTime(on ? 1 : 0, now, on ? 0.09 : 0.14);
}

// ── Setup ───────────────────────────────────────────────────────────────────
/** Fetch the stems and hook up global listeners. Safe to call repeatedly. */
export function initSuenosAudio() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  muted = getIsMuted();

  raw = Promise.all(SUENOS_STEMS.map((s) => fetch(s.file).then((r) => r.arrayBuffer())));
  raw.then(() => emit({ loaded: true })).catch((e) => console.warn("Sueños stems failed to load:", e));

  // Global mute (Nav on mobile, wall/desktop buttons) via StemPlayer's events.
  window.addEventListener("muteChange", (e) => {
    muted = (e as CustomEvent<{ muted: boolean }>).detail.muted;
    applyOutput();
  });

  // Switching songs: silence, and reset to the defaults for next time.
  let lastSong = getCurrentSong();
  subscribeCurrentSong(() => {
    const song = getCurrentSong();
    if (song === lastSong) return;
    lastSong = song;
    sounding = new Set(SUENOS_DEFAULT_ON);
    playing = true;
    emit({ playing: true });
    Object.keys(gains).forEach(applyStem);
    applyOutput();
  });

  // Hidden: mute the bridge (don't pause — restarting it needs a gesture on
  // iOS) and suspend the context. Visible: give iOS a beat, then resume.
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) {
      hidden = true;
      if (bridge) bridge.muted = true;
      ctx.suspend().catch(() => {});
    } else {
      setTimeout(() => {
        hidden = false;
        ctx?.resume().then(() => applyOutput()).catch(() => {});
      }, 200);
    }
  });

  // Browsers block sound until the visitor interacts. Try now; if that's not
  // allowed, the first tap/click/key anywhere on the site starts it.
  const unlockEvents = ["click", "touchend", "keydown"] as const;
  const unlock = () => {
    ensureSuenosStarted();
    if (ctx?.state === "running") removeUnlock();
    else ctx?.resume().then(removeUnlock).catch(() => {});
  };
  const removeUnlock = () => unlockEvents.forEach((t) => document.removeEventListener(t, unlock, true));
  unlockEvents.forEach((t) => document.addEventListener(t, unlock, true));
}

/** Create/resume the context and start the stems. Call from a tap when possible. */
export function ensureSuenosStarted() {
  initSuenosAudio();
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = audible() && !muted ? 1 : 0;
    // Route through an <audio> element so iOS plays it with the silent
    // switch on (media session instead of the ringer), same as StemPlayer.
    const dest = ctx.createMediaStreamDestination();
    master.connect(dest);
    bridge = new Audio();
    bridge.srcObject = dest.stream;
    bridge.muted = !audible() || muted;
    ctx.addEventListener("statechange", () => emit({ running: ctx?.state === "running" }));
  }
  bridge?.play().catch(() => {});
  if (ctx.state !== "running" && !hidden) ctx.resume().catch(() => {});
  if (decoding || !raw) return;
  decoding = true;
  const c = ctx;
  raw.then(async (bufs) => {
    // Stems are scheduled on a possibly-suspended context, so they all begin
    // together the moment it runs.
    const decoded = await Promise.all(bufs.map((b) => c.decodeAudioData(b)));
    const t0 = c.currentTime + 0.08;
    SUENOS_STEMS.forEach((s, i) => {
      const g = c.createGain();
      g.gain.value = 0;
      g.connect(master!);
      gains[s.id] = g;
      const src = c.createBufferSource();
      src.buffer = decoded[i];
      src.loop = true;
      src.connect(g);
      src.start(t0);
    });
    SUENOS_STEMS.forEach((s) => applyStem(s.id));
  }).catch((e) => console.warn("Sueños audio failed to start:", e));
}

// ── Controls ────────────────────────────────────────────────────────────────
export function getSuenosSounding(): ReadonlySet<string> {
  return sounding;
}

export function setSuenosStem(id: string, on: boolean) {
  if (on) sounding.add(id); else sounding.delete(id);
  applyStem(id);
}

export function toggleSuenosPlaying() {
  ensureSuenosStarted();
  playing = !playing;
  emit({ playing });
  applyOutput(0.03);
}

/** Back on the wall (which has no pause button): make sure it's playing. */
export function resumeSuenos() {
  if (playing) return;
  playing = true;
  emit({ playing });
  applyOutput(0.03);
}
