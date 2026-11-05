# v12 · Hold density, larger flakes and two-row pours

The full game and settings sheet now disable text selection, WebKit touch callouts and element dragging. Selection-start and context-menu events are prevented; a selection-change fallback clears accidental document ranges. Native range/select controls retain their normal operation. This addresses the selected header text and Copy/Translate menu in the phone screenshot.

Hold mode has independent saved controls for **Sim yoğunluğu** (50–800%), **Sim parçası boyutu** (70–400%) and **Başlangıç döküşü** (one or two rows). The size applies immediately to moving, falling, collected and currently binding glitter; the current coating texture also uses correspondingly larger flecks. Density and row count apply to the next pour. **Bu rengi yeniden dene** clears only the current colour's work and starts a fresh pour with the chosen controls, preserving previously completed colours.

Two-row mode performs two full-width horizontal passes, at the upper edge and 72 paper units below it. The bottle closes between passes and moves down before the second sweep. The finite total supply is divided between the rows; density controls the total. Target packets near the top always start in the upper row, so the lower row never skips an adhesive area above it. The bottle arrives before emission starts and returns after the second pass is complete.

The maximum loose supply is 84,000 real packets (8 × 10,500), plus one packet for every unfinished target cell. A full-paper mask needs 103,200 packets. Sand storage expands while preserving all particle state. Render pools grow on demand rather than allocating the maximum for ordinary play, and preserve transforms, colours and materials on growth. Spill and collection pools also grow so a large final fold does not discard material at the previous 48,000 limit.

## Verification

- `npm run build`; `npm test`: 100 passing tests.
- New coverage: setting bounds and saved values, separate row passes and their closed-bottle travel, complete full-paper coverage with 103,200 packets, finite storage growth, 4× live geometry scaling, and preserved render data across instance-pool growth. All 43 existing masks still complete through the directed flow.
- Actual browser UI at 390×844: chose 800% density, 400% size and two rows through the real controls, replayed the pink colour and observed 86,438 emitted packets and two separate full-width reservoirs with no premature coating.
- Replayed Gotham green at the same limits. Coating reached 100%; the final fold collected all 84,000 loose packets, exercising collection-pool growth beyond 48,000. No browser/shader warnings or errors.
- Density controls, select menus and replay remained usable after selection suppression. Double-click/right-click on settings text showed no selected highlight or context menu in the browser test. Physical iOS long-press/callout behaviour was not exercised on a phone in this environment.
- On this workstation the two rows at rest displayed 60 FPS; the most extreme 8×/4× moving wave displayed approximately 42–45 FPS. These are browser observations, not physical-phone guarantees.

Local ignored screenshots: `v12-hold-settings.png`, `v12-two-dense-rows.png`, `v12-max-flow.png`.
