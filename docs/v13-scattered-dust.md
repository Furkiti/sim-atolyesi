# v13 · Fine, newly randomized residue

Removed the four fixed deposit ellipses. Each pour now samples a small fraction of the actual loose supply to stop independently along its downward path. Stop positions span the paper and are sampled again from the run's random source on every pour. They sit close to the surface rather than forming raised heaps.

The remaining fraction is deliberately sparse: roughly 300–650 fine grains under normal settings, with a hard cap of 750 even at maximum flow density. Dust is classified while pouring, so small grains are already mixed into the main stream and do not suddenly shrink when they stop. The normal large-flake setting still applies to the bulk stream and coating. Fine grains retain their small size while falling and inside the collection box; subsequent size changes do not inflate collected dust. Dust flags survive buffer growth and compaction.

The particles remain real finite loose material. Holding longer leaves them resting; the final side fold drains them through the existing channel and collection physics. No new pigment, new particles or fixed destination clusters are created.

Validation: `npm run build`; `npm test` — 102 passing tests. All 43 masks still complete. New checks cover per-pour variation, broad spatial spread without concentrated 20×20 bins, low residue height, fine size independent of the 4× setting, material conservation and normal fold drainage. Updated the older retained-material assertions to require sparse dust rather than thousands of particles in deposits.

Browser UI at 390×844, with 8× density, 4× main flake size and two rows: Gotham reached exact 100% coverage, leaving 606 dispersed fine grains after the bulk stream passed. The final fold collected all 606 and advanced to blue. No browser/shader errors or warnings. QA screenshot: ignored local `qa/v13-random-dust.png`. Holding was exercised using the real button's keyboard accessibility control; physical touchscreen testing was not performed.
