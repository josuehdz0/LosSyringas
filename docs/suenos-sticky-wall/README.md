# Sueños sticky-wall homepage: handoff

This was designed and prototyped in a Claude session that was accidentally opened in another project.
Everything from that session lives in this folder now. Start the real build from here.

## The concept

- The homepage is a blank, textured wall promoting the new single **Sueños**.
- Five sticky notes each carry one of Josué's pencil drawings, one per stem:
  - Josué's guitar
  - Pearson's guitar
  - bass (Shawn)
  - drums (Luke)
  - keys/synth (Josh)
- The notes start resting along the bottom of the screen. Clicking a note sticks it to the wall, and its stem fades in. Clicking it again takes it down and mutes it.
- The splash/landing page goes away, so visitors land straight on the homepage.
- A song switcher (‹ sueños ›) lets visitors cycle back to earlier releases. The current "This Song Is Not For You" stem player (`components/StemPlayer.tsx`) is kept as one of those entries, not deleted.

## What's in here

| Path | What it is |
|---|---|
| `prototype/index.html` | The approved, clickable prototype. It's one self-contained HTML file with all CSS and JS. |
| `prototype/drawings/*.png` | The drawings cleaned to transparent graphite PNGs. These are the assets to ship. |
| `prototype/stems/*.mp3` | The five Sueños stems, copied from iCloud (`Music/Los Syringas/Sueños/STEMS`). |
| `prototype/versions/` | Earlier iterations, kept for reference only. |
| `sticky-notes-final-rendering.md` | **Read this before building.** It records the exact look and motion that were approved: light direction, per-note shape data, shadow math, paper texture, timings and gotchas. |
| `source-photos/drawings/*.jpg` | The original phone photos of the drawings. |
| `source-photos/reference-wall-*.jpg` | Photos of real notes on the wall. These are the realism target. |
| `source-photos/reference-kraft-sticky-notes.webp` | The earlier kraft-paper reference image. |
| `tools/clean_drawings.py` | Turns drawing photos into the transparent PNGs. To run it: `python3 tools/clean_drawings.py source-photos/drawings prototype/drawings josue=josue.jpg ...` (needs numpy and Pillow). |

## Running the prototype

The stems load with `fetch`, so the page has to be served rather than opened as a file:

```bash
cd docs/suenos-sticky-wall/prototype && python3 -m http.server 4317
```

Then open http://localhost:4317.

## How the audio works (keep this model)

- One Web Audio `AudioContext` is created on the first click.
- All five stems start at the same instant, looped, and each one runs through its own `GainNode`.
- Sticking or peeling a note only ramps that stem's gain with `setTargetAtTime`, so the stems never drift out of sync.
- A stem fades in when its note touches the wall, not when it's clicked.
- The context suspends when the tab is hidden and resumes when it's visible again.

## Plan for the real build

1. Create a new branch off `main`.
2. Remove the splash: `components/SplashScreen.tsx` is rendered from `components/HeroSection.tsx` (gated by `splashDone`).
3. Move the assets into `public/`, for example `public/stems/suenos/*.mp3` and `public/drawings/suenos/*.png`.
4. Build a `StickyWall` client component from `prototype/index.html`, following `sticky-notes-final-rendering.md`.
5. Build a song switcher on the homepage that holds Sueños (the sticky wall) and This Song Is Not For You (the existing `StemPlayer`, currently mounted globally in `app/layout.tsx` and visualised by `HeroSection`).

**Exporting stems from Logic:**
- Use MP3, constant bitrate: 192 kbps for stereo stems, 96 kbps for mono.
- Turn Normalize off.
- Every stem should have the same length and sample rate.
- MP3 encoder padding can leave a tiny gap at the loop point. If you hear one, try AAC/M4A or trim the loop in code.

## Open questions

- Guitars: right now the offset guitar is Josué's and the hollow-body is Pearson's. Confirm or swap them.
- Which songs go in the switcher? The prototype shows "1 of 2": Sueños and This Song Is Not For You.
