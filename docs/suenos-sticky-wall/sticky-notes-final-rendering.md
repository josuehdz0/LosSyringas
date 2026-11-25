# Sticky notes: final look and motion (approved by Josué)

Prototype: `prototype/index.html` in this folder.
Reference photos of the real notes on the user's wall: `source-photos/reference-wall-1..4.jpg`. They are the realism target.

## Rules from the user (all still apply)
- Off-white paper, no colours, no words on the notes: just the pencil drawing.
- No desk. Notes must not move or react while music plays.
- No folded/curled corners (tried twice, rejected).
- Bottom edge of a note is straight. Only the sides curve (slight S), top edge has the faintest arch.
- The glued top has no shadow and no shading.
- Shadows must be feathered, never a hard line, especially while a note is moving.

## Light
One light from the UPPER RIGHT. Shadows fall down and to the left.
Every lighting effect (shadows, paper tooth, wrinkle layer) uses this same direction
(SVG feDistantLight azimuth 315).

## Per-note shape (data, in STEMS)
- `k` how far the free bottom stands off the wall: josué 1.0, pearson 1.35, bass 1.1, drums 0.85, keys 1.4.
- `tw` twist, one bottom corner further off (+ right / − left): josué .3, pearson −.5, bass .15, drums −.2, keys .55.
- `top`/`tl` a top corner not fully stuck: josué "r" 1, bass "l" .6. Rendered as gradual darkening INSIDE the
  paper toward that corner (radial gradient), bright top edge kept on top. NOT a shadow on the wall.
- `ay` drawing nudge: pearson "-10%" (its hollow body carries the visual weight low).
- Off the wall (resting along the bottom) everything uses 35% of k.

## Outline
Per-note SVG clipPath in objectBoundingBox units, generated in JS (`shapeFor`): sides flare out slightly toward
the bottom (more on the twisted side), slight S-curve, lifted top corner sits a touch out/down. Same clip on the
shadow layers so the shadow follows the outline.

## Shadows
- Two layers (crisp `.sh-hard` rgba(40,36,30,.3), soft `.sh-soft` rgba(40,36,30,.25) at .76 opacity), each blurred
  with CSS `filter: blur()`; blur grows with lift.
- Geometry is one 2D matrix per layer (`shadowMatrix`): a point standing z off the wall is displaced
  (LX·z, LY·z), LX = −0.42, LY = 1; z grows down the note (depth) and across it (twist). Hard depth = .11·lift,
  soft = .15·lift; twist .10/.13·tw·lift; slight widening .012/.025·lift.
- A vertical mask fades the shadow out toward the glued top (from 20% to 72% down the note).
- IMPORTANT gotcha: the masked shadow box must be bigger than the note (we use inset −50%, inner shape at
  inset 25%), otherwise the mask cuts the blur off at the box edge and shows a hard line.

## Paper surface (layers inside the clipped `.paper`, over the drawing)
- base colour ~#ebe9e2 (slight per-note variation), slightly grey so the top-edge highlight reads
- 1px white highlight along the top cut edge
- mottle (very low-frequency tone variation, alpha .1)
- fibers (short anisotropic noise streaks, opacity .11)
- crinkle (low-frequency feTurbulence + feDiffuseLighting, multiply, opacity .3)
- tooth (high-frequency noise + feDiffuseLighting, brightened back ×1.16, multiply, opacity .2)
- `.bend`: lower half brightens slightly toward the bottom (it bows out and tilts up into the light),
  angled toward the twisted corner. Darkening it made the notes look concave: don't.

## Placement motion (approved)
- One continuous gesture, rAF-driven, single progress t: stick 580 ms, peel 500 ms.
- Travel: minimum-jerk curve `10t³ − 15t⁴ + 6t⁵`.
- Hold (lift off wall): `sin(π·t^0.75)^1.15`, one smooth bump peaking a little before halfway.
  Scale ×(1 + .06·hold), path rises .05·size·hold.
- Shadow follows hold continuously (no class toggles / CSS transitions): crisp layer fades out
  (opacity 1 − 3h), soft layer offsets (−22px, 30px)·h and blurs +34px·h, mask opens, depth/twist relax by (1 − h).
- Stem gain fades in at t > 0.82 (as the note meets the wall); peel fades it out immediately.
- Audio model unchanged: all stems start together, looped, GainNode per stem.

## Still open
- Guitar assignment not reconfirmed (offset guitar = Josué, hollow-body = Pearson).
- Wall in the prototype is smooth warm beige; the real wall in the photos is grey knockdown texture
  (user hasn't asked to change it).
