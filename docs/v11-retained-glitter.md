# v11 · Retained glitter, seating contact, and clean peel approach

About 30% of the finite loose supply now settles into four small deposits distributed over the paper during hold mode. These are free grains, not additional pigment or bound coating. Holding longer does not erase them or create more. On release after colour completion, the regular side fold physically brings them to the central channel and drops them into the collection box. A smooth height transition settles each deposit; coverage still comes exclusively from travelling target packets.

A target packet now stops at its adhesive point and spends 0.18 seconds of held time settling to the surface before binding. Release freezes that transition as well as the main stream, preserving the precise stop behaviour. Newly coated cells receive a short, faceted seating sheen. Its birth times use a small nearest-filtered texture attached to the existing paper shader, with no additional meshes or draw calls. The sparkle setting controls the sheen, and baked older coating is not relit on each new bind.

The pre-peel whitening came from the lit duplicate peel sheet covering the still-attached portion before any curl. That part is now clipped by signed distance to the actual peel front; the sheet remains hidden during the initial grip approach. Only lifted paper renders. The shadow pass uses the same clipping and alpha silhouette. The additional pre-peel target tint was removed, so the protective paper keeps its pigment until the adhesive is actually exposed.

## Verification

- `npm run build`; `npm test`: 94 passing tests.
- All 43 masks still reach exact full coverage from finite packets. The same exercise confirms that the remaining free material equals the retained deposits, with no extra grains created.
- Regression checks cover indefinite deposit retention, drainage through the regular fold, paused contact settling, no visible duplicate peel sheet during approach, signed clipping, and contact timestamps that do not restart on older coating.
- Browser UI, 390×844: Çilekli Kedi pink reached 100%, with 3099 free retained grains after the moving wave had completely left. The fold collected all 3099 and automatically prepared the next colour.
- Final UI replay after settling adjustments: Gotham black reached 100% with 3218 free retained grains; the fold collected all 3218 and advanced to blue.
- Replayed the approach/curl with shadows off and low shadows enabled. No shader/browser errors or warnings. Balanced, shadows-off gameplay HUD read 60 FPS on this workstation; this is not a physical-phone benchmark.
- Actual browser controls were used, including the real keyboard hold toggle. Physical touchscreen holding was not exercised in this environment.

Local ignored QA screenshots include `v11-retained-pockets.png`, `v11-fold-collector.png`, `v11-gotham-retained.png`, and `v11-no-preflash.png`.
