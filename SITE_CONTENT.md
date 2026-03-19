# Los Syringas — Site Content & Design Reference

> This document captures all content and design decisions for the v2 redesign.
> The original single-page site is preserved in the `LosSyringas` repository on the `main` branch.

---

## Band Info

**Name:** Los Syringas
**From:** Boise, ID
**Formed:** Summer 2019

**Description:**
> As an ode to the Idaho state flower, 5 friends named their band Los Syringas. While each member has a unique taste in music, the result is a forced fusion of Surf Rock, Latin, and Pop Jazz. Influences have a range between Los Amigos Invisibles all the way to Sigur Rós. The five piece group started jamming together the summer of 2019 and released their first single "Satellite" the summer of 2021.

**Genre:** Indie surf rock / Latin / Pop Jazz (self-described)
**Inspiration playlist:** https://open.spotify.com/playlist/72h8ROI5KmTkd5UlEd2w8i

---

## Band Members

| Name | Role | Instagram |
|---|---|---|
| Josué Hernández | Vocals / Guitar | https://www.instagram.com/thiccpalo/ |
| Josh Harris | Keys | https://www.instagram.com/jharris_812/ |
| Pearson Morgan | Lead Guitar | https://www.instagram.com/pditty70/ |
| Shawn Derksen | Bass / Vocals | TBD |
| Luke Jones | Drums | https://www.instagram.com/lukesuperflyjones/ |

**How We Met:**
> Pearson, Josué, and Josh used to live together. Each would jam alone in their room. Luke moved to Boise from Wisconsin and got a job where Josué worked. Luke suggested they all should jam together sometime. They did. It was fun. So fun that Luke suggested they start a band. The rest of the group didn't really know what starting a "band" meant since they'd never been in one. They realized it just meant hanging out more and playing music consistently. Now we have a website.

---

## Socials / Streaming

| Platform | Link |
|---|---|
| Spotify | https://open.spotify.com/artist/4RppgAwCPBVdc8tIWbG1mq |
| Apple Music | https://music.apple.com/us/artist/los-syringas/1577434599 |
| Instagram | https://www.instagram.com/los_syringas/ |
| YouTube | https://www.youtube.com/channel/UCyfT8ed-aDBN6lg1gixJCyQ |

---

## Music

### Existing Releases

| Song | Spotify | Apple Music | YouTube |
|---|---|---|---|
| Right Now | https://open.spotify.com/track/0Y5G1A6RWa7LDL6qaVHTix | https://music.apple.com/us/album/right-now/1631729227?i=1631729228 | https://youtu.be/jPnfuf61OK8 |
| Satellite | https://open.spotify.com/track/6OZlh73PEKO4oohQ9OCWJT | https://music.apple.com/us/album/satellite/1577435659?i=1577435660 | https://youtu.be/XmFZ-oQI3eA |
| Drummr Boy | https://open.spotify.com/track/0QKQPqC1sxAvlRy2lOXxb5 | https://music.apple.com/us/album/little-drummer-boy/1607416561?i=1607416562 | https://youtu.be/MU5A_6MeoEg |

### Upcoming Release — TSINFU

**Full title:** "This Song Is Not For You"
**Abbreviation:** TSINFU
**Status:** Coming out soon — will be featured as the centerpiece of the homepage stem player.

**Stem files** (located at `/Users/josuehernandez/Music/Los Syringas/TSINFU Demo/wav files/`):
- `TSINFU demo flat_Bass.wav`
- `TSINFU demo flat_Drum Kit.wav`
- `TSINFU demo flat_Guitars.wav`
- `TSINFU demo flat_Keys and Pads.wav`
- `TSINFU demo flat_Magic.wav`
- `TSINFU demo flat_Percussion.wav`

---

## Contact

**Email:** lossyringas@gmail.com
**Preferred copy:** "Want us to play for your event? Email us."
> Use a `mailto:` link — no contact form needed.

---

## Site Structure (v2)

The new site has **4 separate pages** (not a single scrollable page):

| Page | Purpose |
|---|---|
| **/** Home | Animated hero landscape + TSINFU stem player + single teaser section below |
| **/music** | Spotify artist embed + streaming links + YouTube |
| **/about** | Band bio + "how we met" story + individual member cards with photos |
| **/contact** | "Want us to play your event?" + mailto link + all social links |

---

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS**
- **GSAP + ScrollTrigger** — animations, scroll effects, landscape reactivity
- **Tone.js** — stem player audio sync and playback
- **Web Audio API AnalyserNode** — per-stem amplitude data fed into GSAP for visual reactivity

---

## Design Direction

### Vibe
Tropical psychedelic surrealism. Bright, alive, slightly weird in a good way. Ethereal and groovy. Hippie-ish with bold graphic energy. Think: Divino Nino meets Crumb meets Los Amigos Invisibles.

### Color Palette

| Role | Hex | Source |
|---|---|---|
| Primary teal | `#2A7A7A` | Band shirts, drummer's cap |
| Coral accent | `#E87060` | Shirts, Crumb artwork |
| Golden yellow | `#D4A830` | Los Amigos Invisibles, autumn show lighting |
| Background cream | `#F0EAD8` | Guitar body, album border treatments |
| Deep green | `#1A2B1A` | Evening show foliage |
| Sky blue | `#5A9FBF` | Gradient backdrop, sky references |

### Typography
- **Display / headlines:** Syne or Space Grotesk — bold, chunky, modern. Inspired by Los Amigos Invisibles and Divino Nino cover lettering.
- **Body:** Inter or DM Sans — clean and readable.

### Key Inspiration References
- **Divino Nino** — bold graphic flat illustration, high contrast, cobalt blue + coral
- **Crumb** — fuzzy/hazy/warm, lowercase irregular typography, analog warmth
- **Los Amigos Invisibles** — maximalist bold Latin graphic design, tropical illustration
- **Mild High Club / Allah-Las** — breezy 70s psych-pop, warm nostalgic coastal vibe
- **"USE" album art** — maximalist illustrated surrealism, altar/nature scene

---

## Homepage — Hero Section (Detailed)

The hero is a **full-screen animated SVG landscape** that serves as the stem player interface.

### Concept
- An illustrated tropical/cosmic scene — wavy hills, floating shapes, sun/moon, plant elements
- The **6 stem track controls are embedded within the landscape** as interactive elements
- The landscape **reacts to which stems are playing** via Tone.js AnalyserNode → GSAP:
  - Bass → ground/hills pulse low and slow
  - Drum Kit → rhythmic bursts, particle-like effects
  - Guitars → mid-layer shimmer or wave movement
  - Keys and Pads → slow ambient shimmer in the sky layer
  - Percussion → subtle surface texture rhythm
  - Magic → something unexpected and weird (TBD)
- Music **autoplays on a loop** after a splash/entry screen (browser interaction requirement)
- Entry moment: user clicks/taps to "enter" the site → music begins → landscape animates to life

### Floating Persistent Player
A small fixed pill (bottom center or bottom right) visible on **all pages**:
- Play / Pause button
- Subtle waveform animation when playing
- Lets the user pause from anywhere on the site

### Below the Hero (still on Home page)
A single short teaser section announcing TSINFU — title, one line of copy, streaming links CTA leading to /music.

---

## Photo Assets

Located at: `assets/band-photos/` and `assets/inspiration/`

### Best photos for hero/promotional use
- `IMG_8328.JPG` — gradient background pyramid shot, most album-cover ready
- `IMG_8290.JPG` / `IMG_8313.JPG` — clean classic band portrait options
- `IMG_8444.JPG` — guitarist through foliage, most cinematic/atmospheric
- `IMG_8330.JPG` — band carrying someone, best personality/social shot
- `IMG_8419.JPG` / `IMG_8432.JPG` / `IMG_8458.JPG` — strong vocalist close-ups
- `IMG_8455.JPG` — drummer mid-play smiling, best high-energy shot

### Notes
- `IMG_8467.JPG` — accidental building shot, not useful
- Outdoor show photos (autumn backyard) have warm golden-green light that maps well to the color palette
- Hawaiian/resort shirts are the band's visual signature — lean into that in member card layouts
