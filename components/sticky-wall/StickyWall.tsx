"use client";

import "./sticky-wall.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { getIsMuted } from "@/lib/audioAnalysers";

/* Ported from docs/suenos-sticky-wall/prototype/index.html. The look and
   motion numbers are the approved ones in sticky-notes-final-rendering.md;
   change them there first. */

interface StemDef {
  id: string;
  who: string;
  what: string;
  file: string;
  c: string;   // paper colour
  k: number;   // how far the free end stands off the wall
  tw: number;  // twist: which bottom corner stands further off (+ right, - left)
  top?: "r" | "l"; // a top corner that hasn't fully stuck
  tl?: number;     // ...and how much
  ay?: string;     // drawing nudged up/down on the note
}

const STEMS: StemDef[] = [
  { id: "josue",   who: "josué",   what: "guitar", file: "/stems/suenos/josue-guitar.mp3",   c: "#ebe9e2", k: 1.0,  tw: 0.3,  top: "r", tl: 1 },
  { id: "pearson", who: "pearson", what: "guitar", file: "/stems/suenos/pearson-guitar.mp3", c: "#eceae3", k: 1.35, tw: -0.5, ay: "-10%" },
  { id: "bass",    who: "shawn",   what: "bass",   file: "/stems/suenos/bass.mp3",           c: "#eae8e1", k: 1.1,  tw: 0.15, top: "l", tl: 0.6 },
  { id: "drums",   who: "luke",    what: "drums",  file: "/stems/suenos/drums.mp3",          c: "#ecebe4", k: 0.85, tw: -0.2 },
  { id: "keys",    who: "josh",    what: "keys",   file: "/stems/suenos/keys.mp3",           c: "#ebe8e1", k: 1.4,  tw: 0.55 },
];

// ── Motion constants ───────────────────────────────────────────────────────
const STICK_MS = 580;
const PEEL_MS = 500;
const LIFT_SCALE = 0.06; // how much bigger it looks at the top of the hold
const LIFT_RISE = 0.05;  // how far up the path bows, as a share of note size
const travel = (t: number) => t * t * t * (10 + t * (-15 + 6 * t)); // minimum-jerk
const hold = (t: number) => Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(t, 0.75))), 1.15);
const lerp = (a: number, b: number, s: number) => a + (b - a) * s;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

// Seeded random so the server render and the first client render agree.
function seeded(seed: number) {
  let a = seed >>> 0;
  return (lo: number, hi: number) => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return lo + r * (hi - lo);
  };
}

/* ---------- Shadows ----------
   One light, from the upper right. A point standing z off the wall throws
   its shadow (LX*z, LY*z) away from itself; depth grows down the note and
   twist across it, so the whole shadow is one 2D matrix. */
const LX = -0.42, LY = 1;
function shadowMatrix(depth: number, twist: number, widen: number) {
  const a = (1 + widen) * (1 + LX * twist);
  const b = LY * twist;
  const c = (1 + widen) * LX * depth;
  const d = 1 + LY * depth;
  return `matrix(${a.toFixed(4)}, ${b.toFixed(4)}, ${c.toFixed(4)}, ${d.toFixed(4)}, 0, 0)`;
}

/* ---------- Note outlines ----------
   0..1 box units. Straight bottom, sides flare a hair toward the bottom with
   a slight S, faintest arch on top; a lifted top corner sits out and down. */
function shapePath(s: StemDef, r: (a: number, b: number) => number) {
  const f = (v: number) => v.toFixed(4);
  const aL = 0.004 + 0.006 * s.k * (1 + Math.max(0, -s.tw) * 1.2) + r(0, 0.003);
  const aR = 0.004 + 0.006 * s.k * (1 + Math.max(0, s.tw) * 1.2) + r(0, 0.003);
  const tc = r(0.002, 0.006);
  const tR = s.top === "r" ? s.tl ?? 0 : 0;
  const tL = s.top === "l" ? s.tl ?? 0 : 0;
  const xr0 = 1 - aR + tR * 0.01, yr0 = tc + tR * 0.006;
  const xl0 = aL - tL * 0.01, yl0 = tc + tL * 0.006;
  const xrm = 1 - aR * 0.6 + r(-0.003, 0.002);
  const xlm = aL * 0.6 - r(-0.003, 0.002);
  let d = `M${f(xl0)},${f(yl0)} `;
  d += `C0.35,0 0.65,0 ${f(xr0)},${f(yr0)} `;
  d += `C${f(xr0 + tR * 0.006)},0.14 ${f(xrm)},0.3 ${f(xrm)},0.5 `;
  d += `C${f(xrm)},0.7 1,0.8 1,1 `;
  d += `L0,1 `;
  d += `C0,0.8 ${f(xlm)},0.7 ${f(xlm)},0.5 `;
  d += `C${f(xlm)},0.3 ${f(xl0 - tL * 0.006)},0.14 ${f(xl0)},${f(yl0)} Z`;
  return d;
}

// Where each note goes on the wall: a tight cluster around the band name,
// three just above it and two just below. [column in note-widths from the
// centre, row (0 above / 1 below), small vertical nudge in note-heights].
// Indexed like STEMS. Reads: keys, pearson, bass on top; drums, josué below.
const CLUSTER: [number, 0 | 1, number][] = [
  [0.5, 1, 0.04],   // josué  — bottom right
  [0, 0, -0.05],    // pearson — top middle
  [1, 0, 0.05],     // bass   — top right
  [-0.5, 1, -0.02], // drums  — bottom left
  [-1, 0, 0.03],    // keys   — top left
];
// Wall look. "white" = site-white wall with classic light-yellow notes
// (experiment); "plaster" = the approved beige plaster with off-white notes.
// Flip this to switch back. ?wall=plaster / ?wall=white overrides it, to compare.
type WallTheme = "white" | "plaster";
const WALL_THEME: WallTheme = "white";

// Already on the wall when the page opens. They sound from the first tap.
const START_ON_WALL = new Set(["keys", "bass"]);
const CLUSTER_STEP_X = 1.12; // centre-to-centre, in note widths
const CLUSTER_GAP_Y = 0.14;  // space between a row and the band name, in note heights
// Top of the wall band, just under the controls (matches --wall-top in CSS).
const WALL_TOP = 120;

// Hover: the sheet comes partway off the wall, same shadow as when carried.
const HOVER_H = 0.5;    // share of the full carry lift
const HOVER_MS = 200;

interface Pose { x: number; y: number; r: number; k: number }
interface Jitter { x: number; y: number; r: number }
interface NoteState {
  s: StemDef;
  el: HTMLButtonElement;
  i: number;
  onWall: boolean;
  busy: boolean;
  sounding: boolean;
  deskJ: Jitter;
  wallJ: Jitter;
  pos: Pose | null;
  hov: number;        // 0..1 hover progress
  hovTarget: number;  // 0 or 1
  hovRaf: number;
}

export default function StickyWall() {
  const stageRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const noteRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const actions = useRef<{ all: () => void; clear: () => void; toggleMute: () => void }>();
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hintGone, setHintGone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [theme, setTheme] = useState<WallTheme>(WALL_THEME);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("wall");
    if (q === "white" || q === "plaster") setTheme(q);
  }, []);

  // Per-note static look: outline, texture offsets, first resting jitter.
  const looks = useMemo(() => {
    const r = seeded(20261125);
    return STEMS.map((s) => ({
      path: shapePath(s, r),
      cx: `${Math.round(r(0, 520))}px`,
      cy: `${Math.round(r(0, 520))}px`,
      deskJ: { x: r(-0.25, 0.25), y: r(-0.22, 0.22), r: r(-16, 16) },
      wallJ: { x: r(-0.04, 0.04), y: r(-0.04, 0.04), r: r(-3, 3) },
    }));
  }, []);

  useEffect(() => {
    const stage = stageRef.current!;
    const desk = deskRef.current!;
    const title = titleRef.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    const rafs = new Set<number>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
      timers.add(t);
    };

    const notes: NoteState[] = STEMS.map((s, i) => ({
      s, i, el: noteRefs.current[i]!,
      onWall: START_ON_WALL.has(s.id), busy: false, sounding: START_ON_WALL.has(s.id),
      deskJ: looks[i].deskJ, wallJ: looks[i].wallJ, pos: null,
      hov: 0, hovTarget: 0, hovRaf: 0,
    }));

    /* ---------- Audio ----------
       All stems start at the same instant, looped, each through its own
       GainNode; sticking a note only ramps its gain, so they never drift. */
    let mutedNow = getIsMuted();
    setMuted(mutedNow);
    let ctx: AudioContext | null = null;
    let master: GainNode | null = null;
    let bridge: HTMLAudioElement | null = null;
    const gains: Record<string, GainNode> = {};
    const sources: AudioBufferSourceNode[] = [];
    let decoding = false;

    // Fetch the stems right away.
    const raw = Promise.all(STEMS.map((s) => fetch(s.file).then((r) => r.arrayBuffer())));
    raw.then(() => { if (!disposed) setLoaded(true); }).catch((e) => console.warn("Sueños stems failed to load:", e));

    function applyMute() {
      if (master && ctx) master.gain.setTargetAtTime(mutedNow ? 0 : 1, ctx.currentTime, 0.05);
      if (bridge) bridge.muted = mutedNow;
    }

    /* Autoplay: set everything up on page load and try to play straight
       away. Browsers only allow that if the visitor has interacted with the
       site before (or allowed auto-play); otherwise the context stays
       suspended and the very first tap/click/key anywhere on the page
       unlocks it (see unlock below). Stems are scheduled on the suspended
       context, so they all begin together the moment it runs. */
    function ensureStarted() {
      if (!ctx) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = mutedNow ? 0 : 1;
        // Route through an <audio> element so iOS plays it with the silent
        // switch on (media session instead of the ringer), same as StemPlayer.
        const dest = ctx.createMediaStreamDestination();
        master.connect(dest);
        bridge = new Audio();
        bridge.srcObject = dest.stream;
        bridge.muted = mutedNow;
        ctx.addEventListener("statechange", () => {
          if (ctx?.state === "running" && !disposed) setHintGone(true);
        });
      }
      bridge?.play().catch(() => {});
      if (ctx.state !== "running") ctx.resume().catch(() => {});
      if (decoding) return;
      decoding = true;
      const c = ctx;
      raw.then(async (bufs) => {
        const decoded = await Promise.all(bufs.map((b) => c.decodeAudioData(b)));
        if (disposed) return;
        const t0 = c.currentTime + 0.08;
        STEMS.forEach((s, i) => {
          const g = c.createGain();
          g.gain.value = 0;
          g.connect(master!);
          gains[s.id] = g;
          const src = c.createBufferSource();
          src.buffer = decoded[i];
          src.loop = true;
          src.connect(g);
          src.start(t0);
          sources.push(src);
        });
        for (const n of notes) setStem(n, n.sounding);
      }).catch((e) => console.warn("Sueños audio failed to start:", e));
    }

    // n.sounding: should the stem be heard (only once pressed to the wall).
    function setStem(n: NoteState, on: boolean) {
      n.sounding = on;
      const g = gains[n.s.id];
      if (!g || !ctx) return;
      const now = ctx.currentTime;
      g.gain.cancelScheduledValues(now);
      g.gain.setTargetAtTime(on ? 1 : 0, now, on ? 0.09 : 0.14);
    }

    // Hidden: mute the bridge (don't pause — restarting it needs a gesture
    // on iOS) and suspend the context. Visible: give iOS a beat, then resume.
    function onVisibility() {
      if (!ctx) return;
      if (document.hidden) {
        if (bridge) bridge.muted = true;
        ctx.suspend().catch(() => {});
      } else {
        later(() => {
          ctx?.resume().then(() => { if (bridge) bridge.muted = mutedNow; }).catch(() => {});
        }, 200);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    // Global mute (Nav on mobile, our own button) stays in sync via StemPlayer.
    function onMuteChange(e: Event) {
      mutedNow = (e as CustomEvent<{ muted: boolean }>).detail.muted;
      setMuted(mutedNow);
      applyMute();
    }
    window.addEventListener("muteChange", onMuteChange);

    /* ---------- Shadows / pose ---------- */
    function pose(n: NoteState, lf: number, h: number) {
      const lift = n.s.k * lf, flat = 1 - h;
      const st = n.el.style;
      st.setProperty("--lf", lf.toFixed(3));
      st.setProperty("--h", h.toFixed(3));
      st.setProperty("--mh", shadowMatrix(lift * 0.11 * flat, n.s.tw * lift * 0.1 * flat, lift * 0.012));
      st.setProperty("--ms", shadowMatrix(lift * 0.15 * flat, n.s.tw * lift * 0.13 * flat, lift * 0.025));
    }

    /* ---------- Layout ---------- */
    function metrics() {
      const W = stage.clientWidth, H = stage.clientHeight;
      const size = notes[0].el.offsetWidth;
      const deskH = desk.offsetHeight;
      return { W, H, size, deskTop: H - deskH, deskH, narrow: W < 600 };
    }
    type M = ReturnType<typeof metrics>;

    function deskPose(n: NoteState, m: M): Pose {
      const slotW = m.W / notes.length;
      const deskScale = m.narrow ? 0.82 : 0.86;
      const half = (m.size * deskScale) / 2 + 8;
      const rawX = slotW * (n.i + 0.5) + n.deskJ.x * Math.min(slotW, m.size) * 0.6;
      const x = Math.min(m.W - half, Math.max(half, rawX));
      const y = m.deskTop + m.deskH * 0.52 + n.deskJ.y * m.deskH * 0.5;
      return { x, y, r: n.deskJ.r, k: deskScale };
    }

    function wallPose(n: NoteState, m: M): Pose {
      const [col, row, dy] = CLUSTER[n.i];
      // Measure the band name + tagline where they actually are on screen.
      const sr = stage.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      const half = m.size / 2;
      const x = m.W / 2 + col * m.size * CLUSTER_STEP_X + n.wallJ.x * m.size;
      let y = row === 0
        ? tr.top - sr.top - m.size * CLUSTER_GAP_Y - half
        : tr.bottom - sr.top + m.size * CLUSTER_GAP_Y + half;
      y += (dy + n.wallJ.y) * m.size;
      // On short screens, stay between the controls and the resting notes.
      y = Math.min(m.deskTop - 12 - half, Math.max(WALL_TOP + half, y));
      return { x, y, r: n.wallJ.r, k: 1 };
    }

    const tf = (p: Pose, m: M, extraK = 1) =>
      `translate(${p.x - m.size / 2}px, ${p.y - m.size / 2}px) rotate(${p.r}deg) scale(${p.k * extraK})`;

    function place(n: NoteState, m: M) {
      n.pos = n.onWall ? wallPose(n, m) : deskPose(n, m);
      n.el.style.transform = tf(n.pos, m);
      pose(n, n.onWall ? 1 : 0.35, 0);
    }
    function layout() {
      const m = metrics();
      notes.forEach((n) => { if (!n.busy) { place(n, m); if (n.hov) renderHover(n, m); } });
    }

    /* ---------- Motion ----------
       One continuous gesture driven by a single progress t: travel follows
       a minimum-jerk curve, hold is one smooth bump that drives scale, a
       slight rise, and the shadow. */
    let zTop = 20;

    function move(
      n: NoteState, m: M, from: Pose, to: Pose, ms: number,
      { lf, onPress, onDone }: { lf: [number, number]; onPress?: () => void; onDone?: () => void },
    ) {
      const el = n.el;
      let pressed = false;
      // If it was already lifted by hover, carry on from that lift.
      const h0 = ease(n.hov) * HOVER_H;
      cancelHover(n);
      n.hov = 0;
      const finish = () => {
        el.style.transform = tf(to, m);
        pose(n, lf[1], 0);
        n.busy = false;
        if (onPress && !pressed) onPress();
        onDone?.();
        // Still under the cursor after landing? Lift again.
        if (n.hovTarget && el.matches(":hover")) hoverTo(n, 1);
      };
      if (reduce) { finish(); return; }
      n.busy = true;
      const t0 = performance.now();
      const frame = (now: number) => {
        rafs.delete(id);
        if (disposed) return;
        const t = Math.min(1, (now - t0) / ms);
        const s = travel(t);
        const h = t < 1 ? Math.max(hold(t), h0 * (1 - s)) : 0;
        el.style.transform = tf({
          x: lerp(from.x, to.x, s),
          y: lerp(from.y, to.y, s) - h * m.size * LIFT_RISE,
          r: lerp(from.r, to.r, s),
          k: lerp(from.k, to.k, s) * (1 + h * LIFT_SCALE),
        }, m);
        pose(n, lerp(lf[0], lf[1], s), h);
        if (onPress && !pressed && t > 0.82) { pressed = true; onPress(); }
        if (t < 1) { id = requestAnimationFrame(frame); rafs.add(id); } else finish();
      };
      let id = requestAnimationFrame(frame);
      rafs.add(id);
    }

    function stick(n: NoteState) {
      const m = metrics();
      const from = n.pos ?? deskPose(n, m);
      n.wallJ = { x: rnd(-0.04, 0.04), y: rnd(-0.04, 0.04), r: rnd(-3, 3) };
      n.onWall = true;
      const to = wallPose(n, m);
      n.el.style.zIndex = String(++zTop);
      label(n);
      // The stem comes in as the note meets the wall, not when it leaves.
      move(n, m, from, to, STICK_MS, { lf: [0.35, 1], onPress: () => setStem(n, true) });
      n.pos = to;
    }

    function peel(n: NoteState) {
      const m = metrics();
      const from = n.pos ?? wallPose(n, m);
      n.onWall = false;
      n.deskJ = { x: rnd(-0.25, 0.25), y: rnd(-0.22, 0.22), r: rnd(-16, 16) };
      const to = deskPose(n, m);
      setStem(n, false);
      label(n);
      move(n, m, from, to, PEEL_MS, { lf: [1, 0.35], onDone: () => { n.el.style.zIndex = String(10 + n.i); } });
      n.pos = to;
    }

    function label(n: NoteState) {
      n.el.setAttribute("aria-pressed", String(n.onWall));
      n.el.setAttribute("aria-label", `${n.s.who}, ${n.s.what}: ${n.onWall ? "on the wall, playing" : "off the wall"}`);
    }

    function toggle(n: NoteState) {
      if (n.busy) return;
      ensureStarted();
      if (n.onWall) peel(n); else stick(n);
    }

    /* ---------- Hover ----------
       Mouse only. Eases the resting note partway into the carried pose:
       a touch bigger, a touch higher, the crisp shadow giving way to the
       soft feathered one. */
    function ease(x: number) { return x * x * (3 - 2 * x); }
    function renderHover(n: NoteState, m: M) {
      if (!n.pos) return;
      const hv = ease(n.hov) * HOVER_H;
      n.el.style.transform = tf({ ...n.pos, y: n.pos.y - hv * m.size * LIFT_RISE }, m, 1 + hv * LIFT_SCALE);
      pose(n, n.onWall ? 1 : 0.35, hv);
    }
    function cancelHover(n: NoteState) {
      if (n.hovRaf) { cancelAnimationFrame(n.hovRaf); rafs.delete(n.hovRaf); n.hovRaf = 0; }
    }
    function hoverTo(n: NoteState, target: number) {
      n.hovTarget = target;
      if (n.busy) return;
      if (reduce) { n.hov = target; renderHover(n, metrics()); return; }
      if (n.hovRaf) return; // already easing; it reads hovTarget each frame
      let last = performance.now();
      const frame = (now: number) => {
        rafs.delete(n.hovRaf);
        n.hovRaf = 0;
        if (disposed || n.busy) return;
        const step = (now - last) / HOVER_MS;
        last = now;
        n.hov = n.hovTarget > n.hov ? Math.min(n.hovTarget, n.hov + step) : Math.max(n.hovTarget, n.hov - step);
        renderHover(n, metrics());
        if (n.hov !== n.hovTarget) { n.hovRaf = requestAnimationFrame(frame); rafs.add(n.hovRaf); }
      };
      n.hovRaf = requestAnimationFrame(frame);
      rafs.add(n.hovRaf);
    }

    const handlers = notes.map((n) => {
      const click = () => toggle(n);
      const enter = (e: PointerEvent) => { if (e.pointerType === "mouse") hoverTo(n, 1); };
      const leave = (e: PointerEvent) => { if (e.pointerType === "mouse") hoverTo(n, 0); };
      n.el.addEventListener("click", click);
      n.el.addEventListener("pointerenter", enter);
      n.el.addEventListener("pointerleave", leave);
      label(n);
      return { click, enter, leave };
    });

    actions.current = {
      all: () => {
        ensureStarted();
        notes.filter((n) => !n.onWall).forEach((n, k) => later(() => stick(n), k * 110));
      },
      clear: () => {
        notes.filter((n) => n.onWall).forEach((n, k) => later(() => peel(n), k * 90));
      },
      toggleMute: () => {
        window.dispatchEvent(new CustomEvent("muteToggle", { detail: { muted: !mutedNow } }));
      },
    };

    // Browsers only allow sound after a tap, so the first tap anywhere on the
    // wall starts it (with keys + bass already up, that's the first thing heard).
    // Try now; if the browser says no, the first interaction anywhere does it.
    ensureStarted();
    const unlockEvents = ["click", "touchend", "keydown"] as const;
    function unlock() {
      ensureStarted();
      if (ctx?.state === "running") removeUnlock();
      else ctx?.resume().then(removeUnlock).catch(() => {});
    }
    function removeUnlock() {
      unlockEvents.forEach((t) => document.removeEventListener(t, unlock, true));
    }
    unlockEvents.forEach((t) => document.addEventListener(t, unlock, true));

    window.addEventListener("resize", layout);
    layout();
    setReady(true);
    document.fonts?.ready.then(() => { if (!disposed) layout(); });

    return () => {
      disposed = true;
      window.removeEventListener("resize", layout);
      removeUnlock();
      window.removeEventListener("muteChange", onMuteChange);
      document.removeEventListener("visibilitychange", onVisibility);
      notes.forEach((n, i) => {
        n.el.removeEventListener("click", handlers[i].click);
        n.el.removeEventListener("pointerenter", handlers[i].enter);
        n.el.removeEventListener("pointerleave", handlers[i].leave);
      });
      rafs.forEach((id) => cancelAnimationFrame(id));
      timers.forEach((t) => clearTimeout(t));
      sources.forEach((s) => { try { s.stop(); } catch { /* not started */ } });
      if (bridge) { bridge.pause(); bridge.srcObject = null; }
      ctx?.close().catch(() => {});
    };
  }, [looks]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div ref={stageRef} className={`sticky-wall theme-${theme}`} style={{ visibility: ready ? "visible" : "hidden" }}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          {looks.map((l, i) => (
            <clipPath key={i} id={`sw-shape-${i}`} clipPathUnits="objectBoundingBox">
              <path d={l.path} />
            </clipPath>
          ))}
        </defs>
      </svg>

      <div className="wall" />
      <div ref={deskRef} className="desk" />

      <div className="center">
        <div ref={titleRef}>
          <h1>Los Syringas</h1>
          <p className="sub">Indie Surf Rock Band · Boise, ID</p>
        </div>
        <p className={`hint${hintGone ? " gone" : ""}`}>
          {loaded ? "tap anywhere to play" : "loading the stems…"}
        </p>
      </div>

      <header className="top">
        <div className="controls">
          <button onClick={() => actions.current?.all()}>stick &apos;em all</button>
          <button onClick={() => actions.current?.clear()}>clear wall</button>
          <button className="mute" onClick={() => actions.current?.toggleMute()}>{muted ? "sound on" : "mute"}</button>
        </div>
      </header>

      {STEMS.map((s, i) => (
        <button
          key={s.id}
          ref={(el) => { noteRefs.current[i] = el; }}
          className={`note${loaded ? "" : " loading"}`}
          data-stem={s.id}
          data-top={s.top}
          aria-pressed={false}
          aria-label={`${s.who}, ${s.what}: off the wall`}
          style={{
            "--c": s.c,
            "--shape": `url(#sw-shape-${i})`,
            "--tw": s.tw,
            "--k": s.k,
            "--cx": looks[i].cx,
            "--cy": looks[i].cy,
            ...(s.ay ? { "--ay": s.ay } : {}),
            ...(s.tl ? { "--tl": s.tl } : {}),
          } as React.CSSProperties}
        >
          <div className="body">
            <div className="sh sh-soft"><i /></div>
            <div className="sh sh-hard"><i /></div>
            <div className="paper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="art" src={`/drawings/suenos/${s.id}.png`} alt="" draggable={false} />
              <div className="mottle" />
              <div className="fiber" />
              <div className="crinkle" />
              <div className="tooth" />
              <div className="bend" />
              <div className="topcurl" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
