# v10 · Basılı tut, bük ve akıt

A third control mode builds one continuous horizontal glitter reservoir along the upper edge of the sheet. Pressing anywhere on the canvas, or holding the large lower button, bends the sheet and sends a broad grain wave down the artwork. Release stops both surface travel and new coating immediately while the sheet relaxes. There is no brush or device orientation input. Once the colour is ready, release triggers cleanup and automatic preparation of the next colour, irrespective of the other modes' automatic progression preference.

The motion is deliberately choreographed rather than solved as general granular physics. Each uncoated stencil cell gets a real material packet with a route from the upper strip to an exact adhesive pixel. Binding consumes that packet only when it physically reaches the destination; untouched colours and airborne material remain unpainted. A substantial finite loose supply fills the rest of the width and continues over the lower lip. Rolling, varying speeds, staggered releases, a thinning raised wave, glints that follow the paper bend and paired hands give the directed motion volume. No material is created while holding.

The existing jar sweeps across the width while the supply falls into place. The hold path uses the existing rendering, coating, detached-particle pool and collection box. A density-only refresh avoids running a second physics solver against the choreography. Brush and phone modes keep their existing solvers. Switching modes cancels an unfinished hold pour safely; entering hold during an existing colour preserves the baked coat and replaces loose material with a fresh strip.

The settings selector has **Basılı tut · bük ve akıt**. Inactive brush, sensor, material-preset, mobility and free-pour controls are hidden in this mode. Grain size, pile volume, excess material amount, jar shape, adhesive colour and graphics controls remain available. Touch uses momentary press/release with the shared primary-pointer gate and pointer capture. An accessible Enter/Space toggle on the hold button allows keyboard users to run and pause the same stream. Settings, blur, visibility changes and mode changes release active input.

## Verification

- `npm run build`; `npm test`: 88 tests pass, including all prior 83 regressions.
- All 43 colour masks across the five levels reach exact 100% coverage using the minimum amount setting. The all-colour replay runs 473 seconds of held animation in total, with finite material accounting, exact-mask binding and no brush strokes.
- New checks cover horizontal supply, no painting before hold, exact pause/resume, preserved existing coating, 30/60 FPS behaviour and paper relaxation.
- Real UI at 390×844: Çilekli Kedi stage 5 and Gotham stage 1, start/pause/resume, exact completion, bottom spills and automatic transition to the next stage. Gotham paused at 57.377% and held time 3.182 seconds; both remained unchanged while idle. Continued held time 10.883 seconds reached 100%, zero loose grains, then advanced to stage 2 after release.
- Interrupted a hold pour via the actual settings selector and continued in brush mode without browser warnings/errors. Rendering HUD read 60 FPS on this workstation at the existing balanced graphics settings; this is not a physical-phone performance measurement.
- Screenshots and frame sequences saved locally under ignored `qa/`, including `v10-gotham-strip.png` and `v10-gotham-flow.png`.

URL: `?v=10&mod=basili&bolum=gotham`. Existing phone mode remains available with `mod=egim` or the settings selector. Browser UI holding was exercised through the real button's keyboard accessibility control; physical touchscreen long-press has not been exercised on a phone in this environment.
