# Oscilloscope Lines — How It Works

A canvas-based real-time audio visualizer that draws one waveform per audio stem, stacked vertically. Each line reacts to its stem's live audio data and animates in/out as stems are toggled.

---

## Overview

1. Each audio stem has a Tone.js `Analyser` node that captures raw waveform data every frame.
2. A `requestAnimationFrame` loop reads that data and draws smooth curves onto a `<canvas>`.
3. When a stem is toggled on/off, its line wipes in/out horizontally using a lerped progress value.

---

## Key Dependencies

- **Tone.js** — audio graph + `Tone.Analyser` for waveform data
- **Canvas 2D API** — drawing the lines
- **React `useRef` + `useEffect`** — RAF loop lifecycle

---

## Step 1 — Audio Analyser Setup

When audio starts, each stem gets its own `Tone.Analyser` in waveform mode:

```ts
const analyser = new Tone.Analyser("waveform", 256);
stemAnalysers[id] = analyser;

const player = new Tone.Player({ loop: true });
player.connect(analyser);
analyser.toDestination();
```

- `"waveform"` mode returns amplitude values in the range `[-1, 1]` for each sample.
- `256` is the FFT size — how many samples per frame. Higher = more detail, more CPU.
- The analyser sits **between** the player and the destination so it captures the signal without interrupting playback.

The analysers are stored in a shared module (`lib/audioAnalysers.ts`) so both the StemPlayer and HeroSection can access them across components without prop drilling.

---

## Step 2 — Canvas Layout

Stems are drawn in fixed vertical slots (lanes):

```ts
const STEM_IDS = ["magic", "percussion", "keys", "guitars", "drums", "bass"];
const LANE_H = 30;   // height of each stem's slot in px
const LANE_GAP = 14; // gap between slots
const CANVAS_H = STEM_IDS.length * LANE_H + (STEM_IDS.length - 1) * LANE_GAP; // 250px
```

Each stem's center Y is:

```ts
const midY = stemIndex * (LANE_H + LANE_GAP) + LANE_H / 2;
```

The canvas is positioned `fixed` at the top of the viewport, full width, `250px` tall — sitting above the hero title but below the nav.

---

## Step 3 — Amplitude Boost Per Stem

Low-frequency instruments (especially bass) have very small amplitude at short window sizes because one cycle spans many samples. A per-stem gain multiplier compensates:

```ts
const STEM_GAIN: Record<string, number> = {
  magic:      1.0,
  percussion: 1.2,
  keys:       1.0,
  guitars:    1.0,
  drums:      1.2,
  bass:       4.0,  // bass waveform is nearly flat without this
};
```

Applied when calculating the Y position of each sample:

```ts
const amp = AMP_PX * (STEM_GAIN[id] ?? 1);
const y = midY + sample * amp;
```

`AMP_PX` controls how far waves can reach — set large enough to overlap into adjacent lane gaps for visual drama:

```ts
const AMP_PX = LANE_H + LANE_GAP * 0.6;
```

---

## Step 4 — Temporal Smoothing

Raw analyser data is noisy frame-to-frame. An exponential moving average smooths it:

```ts
const SMOOTH_ALPHA = 0.18; // 0 = frozen, 1 = raw/jumpy

for (let j = 0; j < raw.length; j++) {
  smoothed[j] = smoothed[j] * (1 - SMOOTH_ALPHA) + raw[j] * SMOOTH_ALPHA;
}
```

Lower alpha = smoother but more lag. `0.18` is a good balance for musical waveforms.

**Special cases:**
- **Muted:** decay toward flat (`s[j] *= 0.85`) instead of reading the analyser.
- **Paused:** freeze — don't update `smoothedData`, just redraw the last frame.

---

## Step 5 — Wipe In/Out Animation

Instead of toggling lines instantly, each stem has a `wipeProgress` value from `0` (hidden) to `1` (fully visible). It lerps toward its target each frame:

```ts
const target = activeIds.has(id) ? 1 : 0;
wipeProgress[id] += (target - wipeProgress[id]) * 0.1;

// Snap to avoid infinite approach
if (Math.abs(wipeProgress[id] - target) < 0.002) wipeProgress[id] = target;
```

The canvas is clipped to `[0, W * progress]` so the line appears to slide in from the left and retract back to the left:

```ts
ctx.beginPath();
ctx.rect(0, 0, W * progress, H);
ctx.clip();
// draw waveform...
ctx.restore();
```

---

## Step 6 — Drawing the Waveform

Each frame, for each stem:

```ts
ctx.strokeStyle = "rgba(255,255,255,0.9)";
ctx.lineWidth = 1.8;
ctx.shadowColor = "rgba(255,255,255,0.35)";
ctx.shadowBlur = 6;

ctx.moveTo(0, midY + drawData[0] * amp);

for (let j = 0; j < drawData.length - 1; j++) {
  const x0 = j * sliceW;
  const x1 = (j + 1) * sliceW;
  const y0 = midY + drawData[j] * amp;
  const y1 = midY + drawData[j + 1] * amp;
  ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
}

ctx.lineTo(W, midY + drawData[drawData.length - 1] * amp);
ctx.stroke();
```

`quadraticCurveTo` to the **midpoint** between consecutive samples produces a smooth, organic curve instead of jagged line segments.

---

## Step 7 — Canvas Size Sync

The canvas pixel dimensions must match its CSS display size to avoid blurry lines. This is checked every frame:

```ts
const W = canvas.offsetWidth;
const H = canvas.offsetHeight;
if (canvas.width !== W || canvas.height !== H) {
  canvas.width = W;
  canvas.height = H;
}
```

Use `offsetWidth` (not `clientWidth`) — `clientWidth` can return the browser default of `300px` for replaced elements like canvas.

---

## Shared State (Cross-Component Access)

The analysers and playback state are stored in a plain module (`lib/audioAnalysers.ts`) with simple getters/setters, so HeroSection can read audio state without being a child of StemPlayer:

```ts
// lib/audioAnalysers.ts
export const stemAnalysers: Record<string, Tone.Analyser> = {};

let activeStemIds: Set<string> = new Set();
let isMuted = false;
let isPlaying = true;

export function setActiveStemIds(ids: Set<string>) { activeStemIds = ids; }
export function getActiveStemIds() { return activeStemIds; }
// etc.
```

StemPlayer writes to these on every state change. HeroSection's RAF loop reads from them every frame.

---

## Recreating It — Minimal Checklist

- [ ] Create a `Tone.Analyser("waveform", 256)` per audio track
- [ ] Connect: `player → analyser → destination`
- [ ] Store analysers in a shared module accessible to your canvas component
- [ ] Set up a `requestAnimationFrame` loop in a `useEffect`
- [ ] Define vertical lane positions (one per stem)
- [ ] Apply per-stem gain multipliers for low-frequency stems
- [ ] Apply exponential smoothing to analyser data each frame
- [ ] Maintain a `wipeProgress` ref per stem, lerp toward 0 or 1 based on active state
- [ ] Use `ctx.rect()` + `ctx.clip()` to restrict drawing to `[0, W * progress]`
- [ ] Draw with `quadraticCurveTo` to midpoints for smooth curves
- [ ] Sync `canvas.width/height` to `offsetWidth/offsetHeight` each frame
- [ ] Handle muted (decay to flat) and paused (freeze) states separately
