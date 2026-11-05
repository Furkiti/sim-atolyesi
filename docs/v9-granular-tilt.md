# v9 · Granular phone tilt

The phone recording showed three round piles translating as rigid disks, adhesive gaps under thick piles, and off-card grains drawing over the front of the sheet.

Tilt mode now has depth-dependent shear, individual static/dynamic friction, bounded terrain avalanches and visible rolling. Moving upper grains overtake the slower bottom layer. A flat settled grain stays still. The three existing material presets affect tilt friction. Brush mode keeps its previous solver.

Each occupied cell identifies its lowest real free grain, which falls onto the paper under gravity. Contact adhesion still requires that exact exposed mask pixel and a real surface grain; airborne grains and neighbouring pixels cannot paint. Swept contact catches narrow stencil strips. The strict completion allowance is unchanged (at most 8 source pixels and 0.02%; detailed mode 2).

Tilt piles render their actual instanced flakes and a soft contact shadow, without the continuous opaque mound skin that reinforced the disk appearance. Hidden mound normals are no longer recomputed. The same granular solver remains active while pouring or opening settings; adhesion is enabled only during active play.

Detached grains start at the swept crossing of the actual top/left/right/bottom edge. Their tangential momentum and an outward component are preserved. Only bottom-edge cleanup gets the forward collection impulse. Current paper pose is synchronized before detachment. Spill flakes participate in depth testing/writing, allowing the sheet to occlude far-edge grains. The background does not cut off falling grains at the table image; grains remain simulated until they leave the view/frustum or enter the collection box.

## Validation

- `npm run build`, `npm test`: 83 passing tests.
- New regressions: mound deformation, bottom-layer contact, stationary stability, compaction, four edge crossings, actual scene detachment and far-edge depth occlusion. Existing brush, mask, permission/calibration, cleanup and paper restoration tests pass.
- `node scripts/granular-bench.mjs`: deterministic dense-pile test. Core displacement standard deviation increased from 4.17 to 34.47 units; pile width ratio increased from 1.14 to 1.55. Finite material count remains 6000. Actual berry-pink mask/supply replay conserves all 8053 packets.
- `node scripts/tilt-soak.mjs`: three material presets, 24,000 packets each, 135 simulated seconds total. No nonfinite coordinates, height overflow, lost coverage or material creation. This workstation's mean solver time was 1.73–3.77 ms per step; the largest warmup/outlier step was 63.47 ms. These are CPU measurements, not phone GPU benchmarks.
- Real UI at 390×844: replayed Çilekli Kedi stage 4, downward flow reached 98.486% without a brush; additional supplies and directional tilts reached the strict threshold. Automatic fold/cleanup advanced to stage 5. Recorded frame sequences verified right-edge and far-edge spills; repeated checks after the final background-depth adjustment. A final cleanup replay detached 1831 loose packets and collected 1750 in the box, then returned flat with zero loose/detached packets. This caught a bent-lip regression: the small exit offset must follow the local surface tangent, not sample the detached flat region beyond y=-400. A dedicated raised-height and real collector-hit regression now covers it. No browser error/warning logs. HUD read 60 FPS at 85% resolution with shadows off.
- Screenshots kept locally under ignored `qa/`: `v9-side-spill-final.png`, `v9-top-spill-final.png`, `v9-next-colour.png`, `v9-collector-final.png`.

Hardware orientation was not physically exercised on a phone. UI tests use the explicit on-screen tilt demo, which shares the filtered tilt model and does not impersonate sensor events. Device permission and axis mapping are covered by the existing unit mocks. The uploaded recording is the physical-device reference; phone feel/performance still needs the user's device.
