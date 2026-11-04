# v5 · Sequential corner peel and a physical collection tray

Re-reviewed both supplied reference clips. Video 2 separates the blue forehead strip and two cape linings with tweezers before pouring; both clips fold the sheet into a trough and empty it into a small container. The game now represents those as separate actions.

Colour masks generate 24 protective pieces across 11 colours. `scripts/build-peels.mjs` labels eight-connected regions, attaches tiny stencil fragments to the nearest main region, and emits exact run-length masks and edge grips in `src/peel-pieces.js`. No runtime flood-fill or additional image requests are needed. Tests verify that the pieces cover each colour exactly once.

Each piece takes at least two seconds, plus a short gap between pieces. Tweezers approach an actual boundary, grip it, curl that piece along a diagonal front, and carry it away. The adhesive reveal clips to that same front and exact piece mask; the other pieces stay covered. Pouring starts after the final piece. A wider velocity cone spreads fresh grains after they leave the actual bottle mouth, with light air drag rather than table friction in flight.

Cleanup first lifts both paper edges with visible grips, then tilts the central channel over an open tray. The paper, edge thickness and grains share one deformation. Surface gravity pushes loose grains inward and down; raised corners guide them into the central outlet. Released grains inherit the local surface velocity and fall under world-space gravity. The tray has floor and wall collision tests; captured grains remain visibly inside it and accumulate on neighbouring lower cells.

The paper deformation is controlled geometry, while the grains use a lightweight numerical simulation suitable for phones. It is not a finite-element sheet or a rigid-body simulation of every physical grain. Cleanup holds the trough until both the paper and falling-grain pool are empty, then restores the sheet exactly and moves the filled tray below the screen. Bound artwork remains attached.

The fixed framing leaves room for the tray and does not animate the camera. Existing first-finger input, 95%/98% completion assistance, physical brush transport, resolution/effect controls and reference audio remain.

Validation: piece partition and grip checks; sequential timing; no early pour; stable tiny-angle and flat restoration; two-sided trough geometry; all-sheet transport toward the central outlet; box floor and wall collision; no teleportation into the box; drainage completion gating; wider airborne dispersion; material conservation and prior interaction checks. A browser test caught all 1,438 remaining loose packets in the tray. Mobile-width recordings were captured from the actual app for visual review; hardware phone FPS has not been measured here.
