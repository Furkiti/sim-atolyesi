# v6 · Hissiyat masası + Ay Bahçesi

Reference observations: the brush gathers a low forward ridge, spills a little material sideways, and leaves a thin settled trail. A stroke works from the actual pile. Loose material settles shortly after release; no source remains at the old pointer position. The video also exposes adhesive clearly beneath pale colours.

## What changes

Three live material experiments share the same finite packet solver. Kadife has high drag and lower lateral pressure/transport. Doğal balances transport and lateral fan. Akışkan uses lower drag, more lateral dispersion and longer residual travel. Independent sliders adjust mobility, bristle response, contact width and visible flake size. Switching presets preserves all material and coverage; performance settings remain independent. Saved settings validate all new values.

The swept brush carries less of a heavy pile per pass, varies contact across its width, and fans material instead of carrying a rigid copy. Pointer timestamps drive residual momentum: fast and slow sweeps over the same distance leave different velocities. Coalesced events retain elapsed time. Late binding is limited to 160 ms of actual bristle contact, so old pressed material cannot silently begin painting much later. Existing height guards and packet conservation remain.

The visible flat, round and fan brushes use the same dimensions as their physical contact. Orientation follows the stroke; bristles flatten and splay with speed/material load; pigment lightly stains their tips. Brush audio pitch and gain follow speed/load. These are inexpensive deformations, not independent rigid-body bristles.

Glass jar, slim bottle and wide bowl have distinct silhouettes, mouths and fill geometries. The emitter uses the selected container's actual transformed lip. Pigment fills preserve saturation. Fan, narrow ribbon and three-wave cumulative schedules emit exactly one chosen dose, without creating particles when the stream changes. Colour-preserving grain/mound shading keeps pale material from bleaching under studio lamps while retaining highlights.

Cool hatched adhesive replaces kraft by default; dark petrol and kraft remain selectable. White is ivory-white and skin warmer peach; the baked pigment remains dense. Completion assistance is capped by both 0.02% of the target and 8 source pixels (2 in detailed mode). A remaining full 5×5 cell cannot auto-fill, even on the largest background. Tiny targets effectively require complete coverage.

## New original level

Ay Bahçesi is drawn by `scripts/build-garden.py`: a seated fox, crescent, blossoms and jade leaves. Eight masks partition all 480,000 pixels exactly. Its generated line print, preview, palette and sequential peel geometry derive from the same editable drawing. Level switching is available in settings and after completion; `bolum=ay-bahcesi` is independent of `devam=N`. Gotham remains the default.

## Validation

54 automated tests cover both complete mask partitions, every target cell's ability to bind, exact peel partitions, finite material and height limits, distinct transport/glide for all three presets, speed-sensitive momentum, no late spontaneous adhesion, monotone exact-dose streams, persisted settings, tiny completion thresholds, existing collector physics, single-pointer and phase guards.

Fixed-seed 1,000-packet sweep, same 110-unit path and 120 ms duration:

| Preset | Mean transport | Further 0.5s travel | Packets |
|---|---:|---:|---:|
| Kadife | 80.23 | 1.46 | 1,000 |
| Doğal | 86.22 | 3.39 | 1,000 |
| Akışkan | 91.01 | 6.60 | 1,000 |

Browser QA uses the actual controls and mouse/pointer strokes at a 390×844 viewport. It checks all three presets without resetting the pile, white/skin contrast, original level progression, selected bottle mouths/streams, new-level selection and painting, settings persistence and shader errors. Desktop browser FPS at phone-sized viewport is not a physical iPhone benchmark. Full-card free grain updates avoid creating an intermediate point object per packet; no additional particle dose is used to make a preset appear more active.
